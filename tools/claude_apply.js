const cp = require('child_process');
const fs = require('fs');
const path = require('path');

// --- helpers ---
function lf(s) {
  return s.replace(/\r/g, '');
}
function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

// ```file:relative/path\n...content...\n``` を抽出
function extractFileBlocks(text) {
  const blocks = [];
  const re = /```file:([^\n]+)\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text))) {
    const file = m[1].trim();
    const body = lf(m[2]);
    blocks.push({ file, body: body.endsWith('\n') ? body : body + '\n' });
  }
  return blocks;
}

// 既存のdiff（おまけで対応）
function extractDiff(text) {
  const f = text.match(/```diff\s*([\s\S]*?)```/);
  if (f) return lf(f[1]);
  if (/^diff --git /m.test(text) || /^\+\+\+|^---/m.test(text)) return lf(text);
  return null;
}

// ---- Anthropic ----
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
    const err = new Error(JSON.stringify(data.error));
    err.name = data.type || 'api_error';
    throw err;
  }
  return (data.content || [])
    .map((c) => (typeof c === 'string' ? c : c.text || ''))
    .join('\n');
}
async function anthropicWithFallback(system, user) {
  const models = [
    process.env.ANTHROPIC_MODEL,
    'claude-3-5-sonnet-latest',
    'claude-3-5-sonnet-20240620',
    'claude-3-5-haiku-latest',
    'claude-3-5-haiku-20241022',
    'claude-3-haiku-20240307',
  ].filter(Boolean);
  let last;
  for (const m of models) {
    try {
      return await callAnthropic(m, system, user);
    } catch (e) {
      last = e;
      if (/not.*found|unsupported|permission|access/i.test(String(e))) continue;
      throw e;
    }
  }
  throw last || new Error('No usable Anthropic model');
}

// ---- main ----
(async () => {
  const prompt = process.env.PROMPT || '';

  // A) コメントに file ブロックがあれば「そのまま書き込み」
  const files = extractFileBlocks(prompt);
  if (files.length) {
    for (const { file, body } of files) {
      ensureDir(file);
      fs.writeFileSync(file, body);
      console.log(`✔ wrote ${file} (${body.length} bytes)`);
    }
    return; // ここで終了（後続のワークフローが自動コミット/プッシュ）
  }

  // B) それ以外は Claude に差分生成を依頼（フォールバック付き）
  const system = [
    'You are a senior engineer.',
    'Output ONLY ONE unified diff wrapped in ```diff fences.',
    "Start with 'diff --git'. No prose.",
    "Patch must apply at repo root with 'git apply -p0'.",
  ].join(' ');
  const reply = await anthropicWithFallback(system, prompt);
  const diff = extractDiff(reply);
  if (!diff) throw new Error('Claude did not return a unified diff');

  fs.writeFileSync('ai.patch', diff);
  // 多少の書式揺れがあっても通す
  try {
    cp.execSync('git apply -v --whitespace=fix ai.patch', { stdio: 'inherit' });
  } catch {
    cp.execSync('git apply -v --reject --whitespace=fix ai.patch', {
      stdio: 'inherit',
    });
    console.log('⚠ some hunks rejected; see *.rej');
  }
  console.log('✅ patch applied');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
