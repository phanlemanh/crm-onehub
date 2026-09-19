import { readFileSync } from "node:fs";
import { join } from "node:path";
import { bang, chay, GOC, ghim, thoat } from "./chung.mjs";

const BAY = 7;
const H = "_acceptance/ho-so-khai-dung-tieng/rang";
const R = "_acceptance/thuoc-khai-dung-tieng/rang";
const HOP_DONG = "_acceptance/thuoc-khai-dung-tieng/contract.md";

const BENH = [
	{
		ma: "A",
		ten: "pha tai cho tren cay dang do, ghi de tep bang chung",
		tep: `${H}/pha-thu.mjs`,
		dau_hieu: "sao = dungCaySao();",
		vi_sao:
			"Con goi dungCaySao() nghia la moi phep pha van nam trong ban sao rieng.",
	},
	{
		ma: "C",
		ten: "gia tri do la hang go san thay vi ve tu may chu",
		tep: `${H}/khai-tieng-ho-so.mjs`,
		dau_hieu: "await goiMayChu(",
		vi_sao: "Con goi may chu nghia la dan so con ve tu nguon that.",
	},
	{
		ma: "D",
		ten: "do nua loi hua — khang dinh am tinh khong doi chung duong",
		tep: `${H}/khai-tieng-ho-so.mjs`,
		dau_hieu: "doi_chung_duong",
		vi_sao: "Con muc doi chung duong nghia la AC-8 con ca hai chieu.",
	},
	{
		ma: "E",
		ten: "khop TEN THE trong khi loi hua la QUAN HE",
		tep: `${H}/mot-duong.mjs`,
		dau_hieu: "NHAP_UI.test(noi_dung)",
		vi_sao:
			"Con phep kiem nhap tu @crm/ui nghia la do QUAN HE, khong do ten the.",
	},
	{
		ma: "F",
		ten: "khoanh ca trang thay vi khoanh dung vung",
		tep: `${H}/khai-tieng-ho-so.mjs`,
		dau_hieu: 'data-slot="sheet-content"',
		vi_sao: "Con bo chon vung ho so nghia la khong do lai be mat von da dung.",
	},
	{
		ma: "G",
		ten: "nhan ban HEAD ma khong bao khi cay ban",
		tep: `${H}/pha-thu.mjs`,
		dau_hieu: "CHO_PHEP_CAY_BAN",
		vi_sao: "Con cua nay nghia la cay ban bi chan chu khong di qua im lang.",
	},
	{
		ma: "chot-ghim-cu",
		ten: "chuoi ghim la ten chan nen luon co mat",
		tep: `${H}/bang-dot-bien.mjs`,
		dau_hieu: 'ghim: "lech-boc:gioi-thieu"',
		vi_sao: "Chuoi ghim da doi sang nhan chi in khi do.",
	},
];

console.log(
	`-- BAY benh da va o hai vong truoc. Hang ghim ${BAY}, chep tay tu AC-13.\n` +
		"-- Moi benh co MOT dau hieu cau truc; mat dau hieu la benh quay lai.\n" +
		"-- Benh nao khong dung duoc dau hieu phai co TEN trong '## Known limits'\n" +
		"   cua hop dong — khong im lang, va khong tinh la da phu.",
);
ghim("so benh", BENH.length, BAY);

const hopDong = readFileSync(join(GOC, HOP_DONG), "utf8");
const tieuDe = /^## Known limits\s*$/m.exec(hopDong);
if (!tieuDe) {
	thoat(
		2,
		`KHONG DO DUOC: ${HOP_DONG} khong co TIEU DE "## Known limits" dung dau dong.`,
		"   AC-13 lay muc do lam cua thoat duy nhat, nen thieu no thi khong the cham.",
	);
}
const sauTieuDe = tieuDe.index + tieuDe[0].length;
const conLai = hopDong.slice(sauTieuDe);
const ketThuc = conLai.search(/^## /m);
const khoaiLimits = ketThuc < 0 ? conLai : conLai.slice(0, ketThuc);
console.log(
	`-- Muc "## Known limits": doc tu TIEU DE dau dong, ${khoaiLimits.trim().split("\n").length} dong.\n` +
		'   indexOf("## Known limits") tran bat nham chinh cau AC-13 dang nhac ten muc do,\n' +
		"   nen cua thoat khong bao gio mo duoc. Hoi dong S4 vong 1 bat cho nay.",
);

let hong = 0;
const hang = [];

for (const b of BENH) {
	const noi_dung = readFileSync(join(GOC, b.tep), "utf8");
	const con = noi_dung.includes(b.dau_hieu);
	if (con) {
		hang.push(
			`khong quay lai  ${b.ma.padEnd(12)} ${b.ten}\n        dau hieu ${JSON.stringify(b.dau_hieu)} con trong ${b.tep}`,
		);
		continue;
	}
	const coTenOLimits = new RegExp(
		`^\\s*-\\s*\`?${b.ma.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\`?\\s*[—:-]`,
		"m",
	).test(khoaiLimits);
	if (coTenOLimits) {
		hang.push(
			`khai o limits   ${b.ma.padEnd(12)} mat dau hieu, nhung CO ten trong Known limits`,
		);
	} else {
		hang.push(
			`BENH QUAY LAI   [benh-cu-quay-lai:${b.ma}] mat dau hieu ${JSON.stringify(b.dau_hieu)} trong ${b.tep}\n        va KHONG co ten trong Known limits: [benh-thieu-ca-do-lan-known-limits:${b.ma}]`,
		);
		hong += 1;
	}
}

console.log(
	"\n-- CHIEU DUONG: moi dau hieu phai THUC SU bat duoc benh. Bo dau hieu di roi\n" +
		"   chay lai chan nay tren ban sao trong bo — E14 cua ban khai lam viec do.",
);

console.log(
	"-- Ten benh phai la MOT DONG DANH SACH co cau truc (`- <ma> — <ly do>`), khong\n" +
		'   phai mot chuoi con bat ky. Ma benh la MOT CHU CAI, nen includes("G") khop\n' +
		"   ca van xuoi binh thuong: do 19/09, 5/7 benh co cua thoat mo san vinh vien.",
);
bang(`-- ${BENH.length} benh:`, hang);
console.log(`ket qua: ${hong} benh quay lai tren ${BENH.length}`);
process.exit(hong > 0 ? 1 : 0);
