import { spawnSync } from "node:child_process";
import path from "node:path";

const GOC = path.resolve(import.meta.dirname, "..", "..", "..");
const r = spawnSync("node", ["scripts/luat-kho/do-cay.mjs"], {
	cwd: GOC,
	encoding: "utf8",
	maxBuffer: 64 * 1024 * 1024,
});
const ra = `${r.stdout}\n${r.stderr}`;
const dong = ra.split("\n");
const loi = [];
if (r.status !== 0) loi.push(`luat kho thoat ${r.status}`);
if (!dong.some((d) => d.startsWith("KET LUAN: cay xanh"))) loi.push("khong co dong KET LUAN cay xanh");
const cachLy = dong.filter((d) => d.startsWith("DO cach-ly-hai-agent"));
for (const d of cachLy) loi.push(`con: ${d}`);
const doiChung = dong.find((d) =>
	d.includes("DUNG pha-test-cua-agent-nhap-app-khong-phai-nest"),
);
if (!doiChung) loi.push("doi chung pha-test-cua-agent-nhap-app-khong-phai-nest khong DUNG");
const chieuDo = ra.match(/chieu do (\d+)\/(\d+)/);
if (!chieuDo || chieuDo[1] !== chieuDo[2]) loi.push(`chieu do khong du: ${chieuDo?.[0] ?? "vang"}`);
console.log(`luat kho thoat ${r.status} · DO cach-ly-hai-agent: ${cachLy.length} · ${chieuDo?.[0] ?? ""}`);
for (const l of loi) console.error(l);
process.exit(loi.length === 0 ? 0 : 1);
