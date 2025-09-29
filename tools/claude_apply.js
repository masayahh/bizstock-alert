const fs = require("fs");
const cp = require("child_process");

async function anthropic(system, user){
  const r = await fetch("https://api.anthropic.com/v1/messages",{
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
  const j = await r.json();
ai/work-01
  if (j.error) throw new Error(JSON.stringify(j.error));
  return (j.content||[]).map(c=>c.text||"").join("\n");
}


  if(j.error) throw new Error(JSON.stringify(j.error));
  return (j.content||[]).map(c=>c.text||"").join("\n");
}
 main
function extractDiff(t){
  const m = t.match(/```diff([\s\S]*?)```/);
  if(!m) throw new Error("No unified diff in response");
  return m[1].trim();
}

(async()=>{
  const prompt = process.env.PROMPT || "";
  const system = [
    "You are a senior engineer.",
    "Output ONLY one unified diff wrapped in ```diff fences.",
    "Patch must apply at repo root with 'git apply -p0'."
  ].join(" ");
ai/work-01

  const reply = await anthropic(system, prompt);

  const user = prompt;

  const reply = await anthropic(system, user);
 main
  const diff = extractDiff(reply);
  fs.writeFileSync("ai.patch", diff);
  cp.execSync("git apply --whitespace=fix ai.patch", {stdio:"inherit"});
  console.log("✅ Patch applied.");
})().catch(e=>{ console.error(e); process.exit(1); });
