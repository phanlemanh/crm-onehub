import { readFileSync } from "node:fs";
import {
	apDotBien,
	chayBunTest,
	dbCuaLuot,
	dungBanSao,
	giuKhoa,
	hong,
	khopLoi,
	SPEC,
} from "./chung.mjs";

const VONG_LAP = "for (let dau = 0; dau < ds.length; dau += lo) {";
const DAY_KET_QUA =
	"kq.push(...(await Promise.all(ds.slice(dau, dau + lo).map(fn))));";
const GOI_TRPC = "\treturn theoLo(\n\t\tsoThuTuc(),\n";
const GOI_REST = "\treturn theoLo(\n\t\tduongRest(),\n";
const DOI_CHUNG_REST = 'expect(restTruoc.status, "doi chung REST: khoa doc duoc").toBe(200);';
const LUI_REST =
	new RegExp(`^([\\t ]*)${DOI_CHUNG_REST.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m").exec(readFileSync(SPEC, "utf8"))?.[1] ?? "\t\t";
const XOA_MEMBER_KHOA_CON_BAT = `${LUI_REST}${DOI_CHUNG_REST}\n${LUI_REST}await db.member.delete({ where: { id: await memberId(bi) } });\n`;
const LECH_TRPC = "ma tran tRPC song song lech danh sach thu tuc";
const LECH_REST = "ma tran REST song song lech danh sach duong";
const LOT_TRPC = "tRPC: khoa con bat cua nguoi ngoai van qua duoc";

const goiTheoLo = (ds) => `\treturn theoLo(\n\t\t${ds},\n`;

const NHOM = {
	"lech-hang": {
		loc: "khoa-con-bat",
		dotBien: [
			{
				ten: "trpc-hut",
				tim: GOI_TRPC,
				thay: goiTheoLo("soThuTuc().slice(1)"),
				thongDiep: LECH_TRPC,
			},
			{
				ten: "trpc-thua",
				tim: GOI_TRPC,
				thay: goiTheoLo(
					'[...soThuTuc(), { ten: "khong.co", loai: "query" as const, restKey: null }]',
				),
				thongDiep: LECH_TRPC,
			},
			{
				ten: "trpc-trung",
				tim: GOI_TRPC,
				thay: goiTheoLo("[...soThuTuc(), ...soThuTuc().slice(0, 1)]"),
				thongDiep: LECH_TRPC,
			},
			{
				ten: "trpc-dao",
				tim: GOI_TRPC,
				thay: goiTheoLo("soThuTuc().reverse()"),
				thongDiep: LECH_TRPC,
			},
			{
				ten: "rest-hut",
				tim: GOI_REST,
				thay: goiTheoLo("duongRest().slice(1)"),
				thongDiep: LECH_REST,
			},
			{
				ten: "rest-thua",
				tim: GOI_REST,
				thay: goiTheoLo(
					'[...duongRest(), { path: `${REST_BRIDGE_PATH}/khong-co`, method: "get" }]',
				),
				thongDiep: LECH_REST,
			},
			{
				ten: "rest-trung",
				tim: GOI_REST,
				thay: goiTheoLo("[...duongRest(), ...duongRest().slice(0, 1)]"),
				thongDiep: LECH_REST,
			},
			{
				ten: "rest-dao",
				tim: GOI_REST,
				thay: goiTheoLo("duongRest().reverse()"),
				thongDiep: LECH_REST,
			},
			{
				ten: "lo-bo-lo-cuoi",
				tim: VONG_LAP,
				thay: "for (let dau = 0; dau + lo < ds.length; dau += lo) {",
				thongDiep: LECH_TRPC,
			},
			{
				ten: "lo-dao-thu-tu",
				tim: DAY_KET_QUA,
				thay: "kq.push(...(await Promise.all(ds.slice(dau, dau + lo).map(fn))).reverse());",
				thongDiep: LECH_TRPC,
			},
		],
	},
	"con-thanh-vien": {
		loc: "khoa-con-bat",
		dotBien: [
			{
				ten: "con-thanh-vien",
				tim: XOA_MEMBER_KHOA_CON_BAT,
				thay: `${LUI_REST}${DOI_CHUNG_REST}\n`,
				thongDiep: LOT_TRPC,
				thongDiepLangGieng: LECH_TRPC,
			},
		],
	},
	"bo-qua-lo": {
		loc: "theo-lo",
		dotBien: [
			{
				ten: "bo-qua-lo",
				tim: VONG_LAP,
				thay: "for (let dau = 0, lo = ds.length; dau < ds.length; dau += lo) {",
				thongDiep: "bo chia lo mac dinh chay nhieu hon mot luot",
			},
			{
				ten: "lo-vuot-pool",
				tim: "const LO_SONG_SONG = 8;",
				thay: "const LO_SONG_SONG = 12;",
				thongDiep: "LO_SONG_SONG lan vao pool pg",
			},
		],
	},
};

const tenNhom = process.argv[2];
const nhom = NHOM[tenNhom];
if (!nhom)
	hong(2, `nhom khong co: ${tenNhom} (co: ${Object.keys(NHOM).join(", ")})`);

dbCuaLuot();
await giuKhoa();

const goc = readFileSync(SPEC, "utf8");
const banDotBien = nhom.dotBien.map((d) => ({
	...d,
	noiDung: apDotBien(goc, d),
}));
const loi = [];
let soKhangDinh = 1;

const doiChung = await chayBunTest(dungBanSao(goc, "nguyen-ven"), [
	"-t",
	nhom.loc,
]);
const soCa = doiChung.ra.match(/Ran (\d+) tests? across 1 file/);
if (doiChung.ma !== 0 || !soCa || Number(soCa[1]) < 1) {
	loi.push(
		`doi chung: ban sao nguyen ven -t ${nhom.loc} ma ${doiChung.ma}, ${soCa ? soCa[0] : "khong chay ca nao"}`,
	);
	console.log(doiChung.ra.slice(-3000));
} else {
	console.log(
		`OK doi chung: ban sao nguyen ven -t ${nhom.loc} ma 0 (${soCa[0]})`,
	);
}

for (const d of banDotBien) {
	soKhangDinh += 1;
	const kq = await chayBunTest(dungBanSao(d.noiDung, d.ten), ["-t", nhom.loc]);
	const dungDong = khopLoi(kq.ra, d.thongDiep);
	if (kq.ma !== 0 && dungDong) {
		console.log(
			`OK dot bien ${d.ten}: ma ${kq.ma}, dong loi "error: ${d.thongDiep}"`,
		);
	} else {
		loi.push(
			`dot bien ${d.ten}: ma ${kq.ma}, dong loi "error: ${d.thongDiep}" ${dungDong ? "co" : "VANG"}`,
		);
		console.log(kq.ra.slice(-3000));
	}
	if (!d.thongDiepLangGieng) continue;
	soKhangDinh += 1;
	const trongKhung = kq.ra.includes(d.thongDiepLangGieng);
	const khopNham = khopLoi(kq.ra, d.thongDiepLangGieng);
	if (trongKhung && !khopNham) {
		console.log(
			`OK tu kiem bo khop: "${d.thongDiepLangGieng}" co trong khung ma nguon cua ${d.ten} nhung khong phai dong loi`,
		);
	} else {
		loi.push(
			`tu kiem bo khop ${d.ten}: thong diep lang gieng trong dau ra ${trongKhung ? "co" : "VANG"}, bo khop ${khopNham ? "KHOP NHAM" : "khong khop"}`,
		);
	}
}

for (const l of loi) console.log(`HONG ${l}`);
console.log(
	`${tenNhom}: ${soKhangDinh - loi.length}/${soKhangDinh} khang dinh dat`,
);
process.exit(loi.length ? 1 : 0);
