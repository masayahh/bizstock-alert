const fs = require('fs');
const cp = require('child_process');

async function anthropic(system, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 4000,
      temperature: 0,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
  }
  return (data.content || [])
    .map((c) => (typeof c === 'string' ? c : c.text || ''))
    .join('\n');
}

function extractDiff(text) {
  const fenced = text.match(/```diff\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  // フェンス無しの生パッチでも許可
  if (/^diff --git /m.test(text) || /^\+\+\+|^---/m.test(text)) return text.trim();
  throw new Error('No unified diff in response');
}

(async function main() {
  const prompt = process.env.PROMPT || '';
  const system = [
    'You are a senior engineer.',
    'Output ONLY one unified diff wrapped in ```diff fences.',
    "Patch must apply at repo root with 'git apply -p0'. Keep changes minimal.",
  ].join(' ');

  const reply = await anthropic(system, prompt);
  const diff = extractDiff(reply);
  fs.writeFileSync('ai.patch', diff);
  cp.execSync('git apply --whitespace=fix ai.patch', { stdio: 'inherit' });
  console.log('✅ Patch applied.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
