import { readFileSync } from "node:fs";
import {
	apDotBien,
	chayBunTest,
	dbCuaLuot,
	dungBanSao,
	giuKhoa,
	hong,
	SPEC,
} from "./chung.mjs";

const VONG_LAP = "for (let dau = 0; dau < ds.length; dau += lo) {";
const DAY_KET_QUA =
	"kq.push(...(await Promise.all(ds.slice(dau, dau + lo).map(fn))));";
const XOA_MEMBER_KHOA_CON_BAT =
	'\t\texpect(restTruoc.status, "doi chung REST: khoa doc duoc").toBe(200);\n\t\tawait db.member.delete({ where: { id: await memberId(bi) } });\n';

const NHOM = {
	"lech-hang": {
		loc: "khoa-con-bat",
		dotBien: [
			{
				ten: "bo-lo-cuoi",
				tim: VONG_LAP,
				thay: "for (let dau = 0; dau + lo < ds.length; dau += lo) {",
				thongDiep: "ma tran tRPC song song lech danh sach thu tuc",
			},
			{
				ten: "dao-thu-tu",
				tim: DAY_KET_QUA,
				thay: "kq.push(...(await Promise.all(ds.slice(dau, dau + lo).map(fn))).reverse());",
				thongDiep: "ma tran tRPC song song lech danh sach thu tuc",
			},
			{
				ten: "rest-bo-dau",
				tim: "\treturn theoLo(\n\t\tduongRest(),\n",
				thay: "\treturn theoLo(\n\t\tduongRest().slice(1),\n",
				thongDiep: "ma tran REST song song lech danh sach duong",
			},
		],
	},
	"con-thanh-vien": {
		loc: "khoa-con-bat",
		dotBien: [
			{
				ten: "con-thanh-vien",
				tim: XOA_MEMBER_KHOA_CON_BAT,
				thay: '\t\texpect(restTruoc.status, "doi chung REST: khoa doc duoc").toBe(200);\n',
				thongDiep: "tRPC: khoa con bat cua nguoi ngoai van qua duoc",
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
	const kq = await chayBunTest(dungBanSao(d.noiDung, d.ten), ["-t", nhom.loc]);
	const coThongDiep = kq.ra.includes(d.thongDiep);
	if (kq.ma !== 0 && coThongDiep) {
		console.log(`OK dot bien ${d.ten}: ma ${kq.ma}, co "${d.thongDiep}"`);
		continue;
	}
	loi.push(
		`dot bien ${d.ten}: ma ${kq.ma}, thong diep "${d.thongDiep}" ${coThongDiep ? "co" : "VANG"}`,
	);
	console.log(kq.ra.slice(-3000));
}

for (const l of loi) console.log(`HONG ${l}`);
console.log(
	`${tenNhom}: ${1 + banDotBien.length - loi.length}/${1 + banDotBien.length} khang dinh dat`,
);
process.exit(loi.length ? 1 : 0);
