import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = process.env.GOC_KHO ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const MUC_MOI = ["Đã vào", "Được phép vào"];
const DOI_CHUNG = "Không gian làm việc";
const CHUOI = [
	{ khoa: "bang.tieuDe", mong: "Đã vào" },
	{ khoa: "duocPhepVao.tieuDe", mong: "Được phép vào" },
];

let dung = 0;
let sai = 0;

function kiem(dat, cau) {
	if (dat) dung += 1;
	else sai += 1;
	console.log(`${dat ? "DUNG" : "SAI"} ${cau}`);
}

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

let dong;
try {
	dong = readFileSync(join(GOC, "CONTEXT.md"), "utf8").split("\n");
} catch (loi) {
	khongDo(`khong doc duoc CONTEXT.md — ${loi.message}`);
}

function doMuc(ten) {
	const dau = dong.findIndex((d) => d.startsWith(`**${ten}**:`));
	kiem(dau >= 0, `muc «${ten}» co dong "**${ten}**:" trong CONTEXT.md`);
	if (dau < 0) {
		kiem(false, `muc «${ten}» co dong _Avoid_ (khong co muc)`);
		kiem(false, `muc «${ten}» co dong Vì sao (khong co muc)`);
		return;
	}
	const ke = dong.findIndex((d, i) => i > dau && /^\*\*[^*]+\*\*:/.test(d));
	const than = dong.slice(dau + 1, ke < 0 ? dong.length : ke);
	kiem(than.some((d) => d.startsWith("_Avoid_:")), `muc «${ten}» co dong _Avoid_ truoc muc ke tiep`);
	kiem(than.some((d) => d.startsWith("Vì sao:")), `muc «${ten}» co dong Vì sao truoc muc ke tiep`);
}

for (const ten of MUC_MOI) doMuc(ten);
doMuc(DOI_CHUNG);

let t;
try {
	const mod = await import(join(GOC, "apps/app/lib/messages/settings-thanh-vien.ts"));
	t = mod.thanhVienMessages("vi");
} catch (loi) {
	khongDo(`khong nap duoc settings-thanh-vien.ts — ${loi.message}`);
}

for (const { khoa, mong } of CHUOI) {
	const gia = khoa.split(".").reduce((o, k) => o?.[k], t);
	kiem(gia === mong, `${khoa} la ${JSON.stringify(gia)}, mong ${JSON.stringify(mong)}`);
}

console.log(`${dung} DUNG, ${sai} SAI — ma thoat ${sai === 0 ? 0 : 1}`);
process.exit(sai === 0 ? 0 : 1);
