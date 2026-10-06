import { readFileSync } from "node:fs";

const docKhoa = () => {
  if (process.env.AI_GATEWAY_API_KEY) return process.env.AI_GATEWAY_API_KEY;
  try {
    const dong = readFileSync(".env", "utf8").split("\n").find((d) => d.startsWith("AI_GATEWAY_API_KEY="));
    return dong ? dong.slice("AI_GATEWAY_API_KEY=".length).trim().replace(/^"|"$/g, "") : "";
  } catch {
    return "";
  }
};

const khoa = docKhoa();
if (!khoa) {
  console.error("chi-phi-gateway: khong co AI_GATEWAY_API_KEY");
  process.exit(1);
}
const res = await fetch("https://ai-gateway.vercel.sh/v1/credits", { headers: { Authorization: `Bearer ${khoa}` } });
if (!res.ok) {
  console.error(`chi-phi-gateway: HTTP ${res.status}`);
  process.exit(1);
}
const than = await res.json();
const so = Number(than.total_used);
if (!Number.isFinite(so)) {
  console.error("chi-phi-gateway: khong co total_used");
  process.exit(1);
}
console.log(so);
