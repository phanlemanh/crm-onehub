import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "loi-tac-tu-zalo-noi-dung-nguyen-nhan";
const hong = [];

const agent = readFileSync(join(GOC, "docs/agent.md"), "utf8");
const dauZalo = agent.search(/^#+ .*Zalo/m);
const sauZalo = dauZalo < 0 ? "" : agent.slice(dauZalo);
const capDau = sauZalo.match(/^(#+) /)?.[1] ?? "#";
const hetTieuDe = sauZalo.indexOf("\n");
const thanMuc = hetTieuDe < 0 ? "" : sauZalo.slice(hetTieuDe + 1);
const ketZalo = thanMuc.search(new RegExp(`^#{1,${capDau.length}} `, "m"));
const mucZalo =
	ketZalo < 0 ? sauZalo : sauZalo.slice(0, hetTieuDe + 1 + ketZalo);
if (mucZalo === "") hong.push("docs/agent.md khong co muc Zalo");
for (const can of ["zalo-loi", "guiDuoc", "does not throw"]) {
	if (!mucZalo.includes(can)) hong.push(`docs/agent.md muc Zalo thieu "${can}"`);
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
	.filter((d) => d.startsWith("|") && d.includes(SLUG));
if (dong.length !== 1) {
	hong.push(`bang muc 7 thieu dong ${SLUG} (dem ${dong.length})`);
}
const trangThai =
	(dong[0] ?? "").split("|")[3]?.replace(/[`\s]+/g, " ").trim() ?? "";
if (dong.length === 1 && !tapTrangThai.includes(trangThai)) {
	hong.push(`trang thai "${trangThai}" khong thuoc tap muc 7`);
}

if (hong.length > 0) {
	for (const h of hong) console.error(h);
	process.exit(1);
}
console.log(`tai-lieu: dat (${tapTrangThai.length} trang thai hop le)`);
