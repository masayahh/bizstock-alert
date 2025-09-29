const fs = require("fs");
const cp = require("child_process");

function parseFilesFrom(text){
  const out=new Set();
  (text||"").split("\n").forEach(l=>{
    const m=l.match(/[-*]\s+([A-Za-z0-9_./\-]+(\.tsx?|\.ts|\.js|\.json|\.ya?ml))/);
    if(m) out.add(m[1]);
  });
  return [...out];
}
async function anthropic(system,user){
  const r=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{
      "x-api-key":process.env.ANTHROPIC_API_KEY,
      "anthropic-version":"2023-06-01",
      "content-type":"application/json",
    },
    body:JSON.stringify({
      model:"claude-3-5-sonnet-latest",
      max_tokens:4000,
      temperature:0,
      system,
      messages:[{role:"user",content:user}],
    }),
  });
  const j=await r.json();
  if(j.error) throw new Error(JSON.stringify(j.error));
  return (j.content||[]).map(c=>c.text||"").join("\n");
}
function extractDiff(t){
  const m=t.match(/```diff([\s\S]*?)```/);
  if(!m) throw new Error("No unified diff block");
  return m[1].trim();
}

(async()=>{
  const prompt=process.env.PROMPT||"";
  const files=parseFilesFrom(prompt);
  const targets=files.length?files:["App.tsx","app/App.tsx","src/components/EventSheet.tsx","package.json",".github/workflows/ci.yml"];
  const snapshots=targets
    .filter(p=>fs.existsSync(p))
    .map(p=>`--- ${p}\n${fs.readFileSync(p,"utf8")}`)
    .join("\n\n");

  const system=[
    "You are a senior engineer.",
    "Output ONLY one unified diff (git patch) wrapped in ```diff fences.",
    "Apply minimal changes to satisfy the task. Do not touch secrets/env/keystore.",
    "Patch must apply cleanly at repo root with 'git apply -p0'."
  ].join(" ");

  const user=[
    "Task from PR comment:",
    prompt,
    "",
    "Current file snapshots (path then content):",
    snapshots || "(no snapshots found)"
  ].join("\n");

  const reply=await anthropic(system,user);
  const diff=extractDiff(reply);
  fs.writeFileSync("ai.patch",diff);
  cp.execSync("git apply --whitespace=fix ai.patch",{stdio:"inherit"});
  console.log("✅ Patch applied.");
})().catch(e=>{ console.error(e); process.exit(1); });
