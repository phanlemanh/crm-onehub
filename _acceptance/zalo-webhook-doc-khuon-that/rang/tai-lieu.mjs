import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "zalo-webhook-doc-khuon-that";
const hong = [];

const agent = readFileSync(join(GOC, "docs/agent.md"), "utf8");
const dau = agent.search(/^#+ Zalo: webhook/m);
const tuDau = dau < 0 ? "" : agent.slice(dau);
const cap = tuDau.match(/^(#+) /)?.[1] ?? "#";
const hetTieuDe = tuDau.indexOf("\n");
const than = hetTieuDe < 0 ? "" : tuDau.slice(hetTieuDe + 1);
const ket = than.search(new RegExp(`^#{1,${cap.length}} `, "m"));
const muc = ket < 0 ? tuDau : tuDau.slice(0, hetTieuDe + 1 + ket);
if (muc === "") hong.push("docs/agent.md khong co muc Zalo: webhook");

const cau = muc.split(/(?<=[.;])\s+|\n\s*[-*]\s+|\n{2,}/).map((c) => c.trim());
const coCau = (...can) => cau.some((c) => can.every((x) => c.includes(x)));
if (!coCau("{event_name, message}", "không có vỏ")) {
	hong.push("docs/agent.md chua noi than that {event_name, message}");
}
if (!coCau("`ok`", "`result`", "vẫn")) {
	hong.push("docs/agent.md chua noi khuon co vo `ok`/`result` van duoc nhan");
}
if (!muc.includes("khoa_message")) {
	hong.push("docs/agent.md chua noi dong log in khoa_message");
}

const keHoach = readFileSync(join(GOC, "docs/plan/lo-trinh-zalo.md"), "utf8");
const muc7 = keHoach.slice(keHoach.indexOf("## 7."), keHoach.indexOf("## 8."));
const tapTrangThai = (muc7.match(/giá trị:([\s\S]*?)\. Cột Ngày/)?.[1] ?? "")
	.split("·")
	.map((s) => s.replace(/[`\s]+/g, " ").trim())
	.filter(Boolean);
if (tapTrangThai.length === 0) hong.push("muc 7 khong doc duoc tap trang thai");
const dong = muc7
	.split("\n")
	.filter((d) => d.startsWith("|") && d.includes(`\`${SLUG}\``));
if (dong.length === 0) {
	hong.push(`bang muc 7 khong co dong cho ${SLUG}`);
} else if (dong.length > 1) {
	hong.push(`bang muc 7 co ${dong.length} dong cho ${SLUG}`);
}
const trangThai =
	(dong[0] ?? "")
		.split("|")[3]
		?.replace(/[`\s]+/g, " ")
		.trim() ?? "";
if (dong.length === 1 && !tapTrangThai.includes(trangThai)) {
	hong.push(`trang thai "${trangThai}" khong thuoc tap muc 7`);
}

if (hong.length > 0) {
	for (const h of hong) console.error(h);
	process.exit(1);
}
console.log(`tai-lieu ${SLUG}: xanh`);
