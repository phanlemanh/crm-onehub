import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = process.env.GOC_KHO ?? join(DAY, "..", "..", "..");
const TU_DIEN = join(GOC, "CONTEXT.md");
const CAI_DAT = join(GOC, "docs", "settings.md");
const MUC = "Nối Zalo";

let dung = 0;
let sai = 0;

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function khang(dat, cau) {
	if (dat) dung += 1;
	else {
		sai += 1;
		console.log(`DO: ${cau}`);
	}
}

function mucTuDien(chu, ten) {
	const dong = chu.split("\n");
	const dau = dong.findIndex((d) => d.startsWith(`**${ten}**:`));
	if (dau === -1) return null;
	const sau = dong.findIndex((d, i) => i > dau && /^\*\*[^*]+\*\*/.test(d));
	return dong.slice(dau, sau === -1 ? dong.length : sau).join("\n");
}

if (!existsSync(TU_DIEN)) khongDo("khong co CONTEXT.md");
if (!existsSync(CAI_DAT)) khongDo("khong co docs/settings.md");

const noiZalo = mucTuDien(readFileSync(TU_DIEN, "utf8"), MUC);
if (noiZalo === null) khongDo(`CONTEXT.md khong co muc **${MUC}**`);

khang(noiZalo.includes("Nhắc buổi sáng"), `${MUC}: thieu Nhắc buổi sáng`);
khang(noiZalo.includes("menu người dùng"), `${MUC}: thieu menu người dùng`);
khang(!noiZalo.includes("Thông báo của bạn"), `${MUC}: con Thông báo của bạn`);

const bang = readFileSync(CAI_DAT, "utf8")
	.split("\n")
	.filter((d) => /^\s*\|\s*`(narrow|page|wide|full)`\s*\|/.test(d));
if (bang.length === 0) khongDo("docs/settings.md khong co bang width");

for (const trang of ["Điều phối 30 ngày", "Kết nối (danh sách)"]) {
	khang(
		bang.some((d) => d.includes(trang)),
		`bang width cua docs/settings.md thieu ${trang}`,
	);
}

console.log(`tai-lieu: ${dung}/${dung + sai} khang dinh dat`);
process.exit(sai === 0 ? 0 : 1);
