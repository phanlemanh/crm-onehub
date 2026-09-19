import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CHAN_UI } from "../../ho-so-khai-dung-tieng/rang/bang-dot-bien.mjs";
import { bang, chay, GOC, ghim, giuKhoa, thoat } from "./chung.mjs";

const nhaKhoa = await giuKhoa("ban-khai-khop");
process.on("exit", nhaKhoa);

const HO_SO = "_acceptance/ho-so-khai-dung-tieng/rang/khai-tieng-ho-so.mjs";
const VUNG = "_acceptance/ho-so-khai-dung-tieng/evidence/vung-khai.json";
const EVALS = "_acceptance/ho-so-khai-dung-tieng/evals.yaml";

const KHOA_MOI_MUC = ["tieng_viet_lot"];
const KHOA_MUC_E1_E5 = ["cho"];
const MUC_E1_E5 = [
	"gioi-thieu",
	"tom-tat-lien-he",
	"nganh",
	"dong-thoi-gian",
	"khong-khai-thua",
	"khong-khai-thua-chuc-danh",
];
const API_DA_CHET = ["CHUOI TRAN", "chuoi tran"];

console.log(
	"-- HAI ve cua AC-7, doi chieu ban khai voi ban that:\n" +
		`   (a) khong o eval nao con mo ta API da bo: ${API_DA_CHET.map((x) => JSON.stringify(x)).join(" · ")}\n` +
		`   (b) moi khoa hoi dong duoc bao cham deu co chan do ghi ra.\n` +
		`       E11 doi ${KHOA_MOI_MUC.join(" · ")} o MOI muc, va ${KHOA_MUC_E1_E5.join(" · ")} o vat do\n` +
		`       CHINH cua E1..E5 (${MUC_E1_E5.length} muc, chep tay tu cau "vat do CHINH E1..E5").\n` +
		"   Hang ghim chep tay tu muc E11 va E7 cua evals.yaml.",
);

let hong = 0;
const hang = [];

const evals = readFileSync(join(GOC, EVALS), "utf8");
for (const chet of API_DA_CHET) {
	const dong = evals
		.split("\n")
		.map((d, i) => [i + 1, d])
		.filter(([, d]) => d.includes(chet));
	if (dong.length > 0) {
		for (const [i, d] of dong) {
			hang.push(
				`API DA CHET [ban-khai-ta-api-da-bo:${chet}] ${EVALS}:${i} ${d.trim().slice(0, 70)}`,
			);
			hong += 1;
		}
	} else {
		hang.push(`khong con nhac ${JSON.stringify(chet)}`);
	}
}

console.log(
	`\n-- Chay lai ${CHAN_UI.length} chan ui-check that de sinh lai ${VUNG}.\n` +
		"   Doc tep cu la doc mot vat co the da cu hon chan do — phai sinh lai.",
);
for (const c of CHAN_UI) {
	const r = chay("bun", [HO_SO, c]);
	if (r.ma !== 0) {
		thoat(
			2,
			`KHONG DO DUOC: chan ${c} thoat ${r.ma} tren cay sach — tien de hong,`,
			"   khong phai ket qua do. Thuong la may chu dev chua chay cho cay nay.",
			r.ra
				.split("\n")
				.slice(-10)
				.map((d) => `     ${d}`)
				.join("\n"),
		);
	}
}

const vung = JSON.parse(readFileSync(join(GOC, VUNG), "utf8"));
const muc = Object.keys(vung);
ghim("so muc trong vung-khai.json", muc.length, 8);

ghim(
	"so muc vat do CHINH E1..E5",
	MUC_E1_E5.filter((m) => muc.includes(m)).length,
	MUC_E1_E5.length,
);

for (const m of muc) {
	const can = [
		...KHOA_MOI_MUC,
		...(MUC_E1_E5.includes(m) ? KHOA_MUC_E1_E5 : []),
	];
	for (const k of can) {
		if (vung[m][k] === undefined) {
			hang.push(`THIEU KHOA [khoa-hoi-dong-khong-co-chan-do-ghi:${m}.${k}]`);
			hong += 1;
		} else {
			hang.push(`co khoa    ${m}.${k}`);
		}
	}
}

bang("-- Tung khoa da doi chieu, goi ten:", hang);
console.log(`ket qua: ${hong} cho ban khai lech ban that`);
process.exit(hong > 0 ? 1 : 0);
