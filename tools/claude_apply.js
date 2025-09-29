const fs = require('fs');
const cp = require('child_process');

function extractDiffFromText(text) {
  const fenced = text.match(/```diff\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  if (/^diff --git /m.test(text) || /^\+\+\+|^---/m.test(text)) return text.trim(); // 生diffもOK
  return null;
}

// ---- Anthropic 呼び出し（モデル自動フォールバック対応） ----
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
    const msg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    const err = new Error(msg);
    err.code = data.type || 'api_error';
    err.model = model;
    throw err;
  }
  return (data.content || []).map((c) => (typeof c === 'string' ? c : c.text || '')).join('\n');
}

async function anthropicWithFallback(system, user) {
  // 優先順（上から試す）。環境変数で上書き可能。
  const candidates = [
    process.env.ANTHROPIC_MODEL,              // 明示指定
    'claude-3-5-sonnet-latest',               // 権限があれば使う
    'claude-3-5-sonnet-20240620',             // 旧ID（権限制約でlatest不可の組織向け）
    'claude-3-5-haiku-latest',                // 3.5系Haiku
    'claude-3-5-haiku-20241022',              // 3.5系Haikuの固定ID例
    'claude-3-haiku-20240307',                // 多くの環境で使える安価モデル
  ].filter(Boolean);

  let lastErr;
  for (const m of candidates) {
    try {
      return await callAnthropic(m, system, user);
    } catch (e) {
      lastErr = e;
      // モデル未提供・権限なし・not_found は次候補へ
      if (String(e.code).includes('not_found') || /not.*found/i.test(e.message)) continue;
      if (/access|permission|unsupported_model/i.test(e.message)) continue;
      // それ以外は即時エラー
      throw e;
    }
  }
  throw lastErr || new Error('No usable Anthropic model.');
}

// ----------------- メイン処理 -----------------
(async function main() {
  const prompt = process.env.PROMPT || '';

  // ① コメントに diff が直接貼られていたら、そのまま適用（課金不要・安全網）
  const inline = extractDiffFromText(prompt);
  if (inline) {
    fs.writeFileSync('ai.patch', inline);
    cp.execSync('git apply --whitespace=fix ai.patch', { stdio: 'inherit' });
    console.log('✅ Patch applied from comment (no API).');
    return;
  }

  // ② それ以外はAnthropicに依頼
  const system = [
    'You are a senior engineer.',
    'Output ONLY one unified diff wrapped in ```diff fences.',
    "Patch must apply at repo root with 'git apply -p0'. Keep changes minimal.",
  ].join(' ');

  const reply = await anthropicWithFallback(system, prompt);
  const aiDiff = extractDiffFromText(reply);
  if (!aiDiff) throw new Error('Claude did not return a unified diff.');
  fs.writeFileSync('ai.patch', aiDiff);
  cp.execSync('git apply --whitespace=fix ai.patch', { stdio: 'inherit' });
  console.log('✅ Patch applied from Claude.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
