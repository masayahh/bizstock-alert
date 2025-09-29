const fs = require('fs');
const cp = require('child_process');

// ---------- helpers ----------
function extractDiffFromText(text) {
  const fenced = text.match(/```diff\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  if (/^diff --git /m.test(text) || /^\+\+\+|^---/m.test(text)) return text.trim(); // 生diffもOK
  return null;
}
function normalizeDiff(raw) {
  // CRLF→LF、行末スペース除去、よくあるノイズ行を削除
  let t = raw.replace(/\r/g, '')
             .split('\n').map(l => l.replace(/[ \t]+$/,'')).join('\n');
  t = t.replace(/^\*\*\* Begin Patch \*\*\*$\n?/m, '')
       .replace(/^\*\*\* End Patch \*\*\*$\n?/m, '');
  return t.endsWith('\n') ? t : t + '\n';
}

// ---------- Anthropic ----------
async function callAnthropic(model, system, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      temperature: 0,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  const data = await res.json();
  if (data.error) {
    const err = new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
    err.code = data.type || 'api_error';
    err.model = model;
    throw err;
  }
  return (data.content || []).map(c => (typeof c === 'string' ? c : c.text || '')).join('\n');
}
async function anthropicWithFallback(system, user) {
  const candidates = [
    process.env.ANTHROPIC_MODEL,
    'claude-3-5-sonnet-latest',
    'claude-3-5-sonnet-20240620',
    'claude-3-5-haiku-latest',
    'claude-3-5-haiku-20241022',
    'claude-3-haiku-20240307',
  ].filter(Boolean);

  let lastErr;
  for (const m of candidates) {
    try { return await callAnthropic(m, system, user); }
    catch (e) {
      lastErr = e;
      if (/not.*found|unsupported|permission|access/i.test(String(e.message))) continue;
      throw e;
    }
  }
  throw lastErr || new Error('No usable Anthropic model.');
}

// ---------- main ----------
(async function main() {
  const prompt = process.env.PROMPT || '';

  // 1) コメント内に直接diffがあればそれを使う（API課金不要）
  const inline = extractDiffFromText(prompt);
  if (inline) {
    const patch = normalizeDiff(inline);
    fs.writeFileSync('ai.patch', patch);
    cp.execSync('git apply -v --whitespace=fix ai.patch', { stdio: 'inherit' });
    console.log('✅ Patch applied from comment (sanitized).');
    return;
  }

  // 2) Claudeに生成させる（モデルは自動フォールバック）
  const system = [
    'You are a senior engineer.',
    'Output ONLY ONE unified diff wrapped in ```diff fences.',
    "Start with 'diff --git'. No prose, no extra fences.",
    "Patch must apply at repo root with 'git apply -p0'. Keep changes minimal."
  ].join(' ');
  const reply = await anthropicWithFallback(system, prompt);
  const aiDiff = extractDiffFromText(reply);
  if (!aiDiff) throw new Error('Claude did not return a unified diff.');
  const patch = normalizeDiff(aiDiff);
  fs.writeFileSync('ai.patch', patch);

  try {
    cp.execSync('git apply -v --whitespace=fix ai.patch', { stdio: 'inherit' });
  } catch (e) {
    // 最後の保険：多少のズレを許容
    cp.execSync('git apply -v --reject --whitespace=fix ai.patch', { stdio: 'inherit' });
    console.log('⚠️ Some hunks were rejected; see *.rej files.');
  }
  console.log('✅ Patch applied from Claude (sanitized).');
})().catch(err => { console.error(err); process.exit(1); });
