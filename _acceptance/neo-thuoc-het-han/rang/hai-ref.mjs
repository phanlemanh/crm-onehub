import {
	appendFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
	apThay,
	CAP_SOT,
	chay,
	commitGia,
	duoi,
	dung,
	GOC,
	giaiLenh,
	git,
	SOT,
	voiCayTam,
} from "./chung.mjs";

const MIG = "packages/db/prisma/migrations";
const RANG_SOI = `_acceptance/${SOT}/rang/soi-ma.mjs`;
const RANG_MIG = `_acceptance/${SOT}/rang/migration-chi-them.mjs`;
const CHEN_TSX =
	'\nexport function GiaHaiRef() {\n\treturn <div className="divide-y" />;\n}\n';

const sach = (ra, cay) =>
	ra
		.split(cay)
		.join("<cay>")
		.split(GOC)
		.join("<cay>")
		.replace(/crm_so_okr_mig_\d+/g, "crm_so_okr_mig_N")
		.split("\n");

function soDong(a, b) {
	const n = Math.max(a.length, b.length);
	for (let i = 0; i < n; i++)
		if (a[i] !== b[i])
			return `dong ${i + 1}: «${a[i] ?? ""}» ≠ «${b[i] ?? ""}»`;
	return null;
}

const tepCap = (loc) =>
	git(
		"diff",
		"--name-only",
		"--no-renames",
		`--diff-filter=${loc}`,
		`${CAP_SOT.goc}...${CAP_SOT.dinh}`,
	)
		.split("\n")
		.filter(Boolean)
		.sort();

const lenh23 = giaiLenh("executors.script.sot_san_thiet_ke");
const lenh25 = giaiLenh("executors.script.sot_migration_chi_them");
const goc23 = chay(lenh23);
const goc25 = chay(lenh25);
if (goc23.ma !== 0)
	dung(1, `HONG goc E23 ma ${goc23.ma}\n    ${duoi(goc23.ra)}`);
if (goc25.ma !== 0)
	dung(1, `HONG goc E25 ma ${goc25.ma}\n    ${duoi(goc25.ra)}`);

const hong = voiCayTam("hai-ref", (cay) => {
	const loi = [];
	const tsx = tepCap("AM").find(
		(t) =>
			/^apps\/app\/.+\.tsx$/.test(t) &&
			!t.includes("/test/") &&
			existsSync(join(cay, t)),
	);
	const migCap = tepCap("A").find(
		(t) =>
			t.startsWith(`${MIG}/`) &&
			t.endsWith("/migration.sql") &&
			existsSync(join(cay, t)),
	);
	if (!tsx || !migCap)
		dung(
			2,
			"KHONG DO DUOC: cap gop khong co tep .tsx hay migration de dung commit gia",
		);
	appendFileSync(join(cay, tsx), CHEN_TSX);
	appendFileSync(join(cay, migCap), '\nDROP TABLE "okrKeyResult";\n');
	mkdirSync(join(cay, MIG, "29991231000000_gia"), { recursive: true });
	writeFileSync(
		join(cay, MIG, "29991231000000_gia", "migration.sql"),
		'DROP TABLE "okrKeyResult";\n',
	);
	commitGia(cay, "gia: commit ngoai vong cho hai-ref");
	console.log(
		`commit gia: chen divide-y vao ${tsx}, DROP TABLE vao ${migCap}, them ${MIG}/29991231000000_gia`,
	);

	for (const [nhan, lenh, goc] of [
		["E23", lenh23, goc23],
		["E25", lenh25, goc25],
	]) {
		const kq = chay(lenh, cay);
		const lech =
			kq.ma !== goc.ma
				? `ma ${kq.ma} ≠ ${goc.ma}\n    ${duoi(kq.ra, 8)}`
				: soDong(sach(goc.ra, cay), sach(kq.ra, cay));
		if (lech) loi.push(`HONG LECH ${nhan}: ${lech}`);
		else
			console.log(
				`${nhan}: dau ra cay tam giong het goc (${sach(kq.ra, cay).length} dong)`,
			);
	}

	const doiChung = [
		{
			so: 1,
			tep: RANG_SOI,
			thay: [["`${CAP.goc}...${CAP.dinh}`,", "`origin/onehub...HEAD`,"]],
			lenh: `bun ${RANG_SOI.replace(".mjs", "-doi-chung.mjs")} --ca thiet-ke`,
			goc: goc23,
		},
		{
			so: 1,
			tep: RANG_MIG,
			thay: [["const DINH = CAP.dinh;", 'const DINH = "HEAD";']],
			lenh: `node ${RANG_MIG.replace(".mjs", "-doi-chung.mjs")}`,
			goc: goc25,
		},
		{
			so: 2,
			tep: RANG_SOI,
			thay: [['if (ca === "thiet-ke") dungCayDinh();', ""]],
			lenh: `bun ${RANG_SOI.replace(".mjs", "-doi-chung.mjs")} --ca thiet-ke`,
			goc: goc23,
		},
	];
	for (const d of doiChung) {
		const ban = apThay(readFileSync(join(cay, d.tep), "utf8"), d.thay);
		if (ban === null) {
			loi.push(`HONG DOI CHUNG ${d.so}: phep thay khong ap vao ${d.tep}`);
			continue;
		}
		writeFileSync(join(cay, d.tep.replace(".mjs", "-doi-chung.mjs")), ban);
		const kq = chay(d.lenh, cay);
		const khac =
			kq.ma !== d.goc.ma ||
			soDong(sach(d.goc.ra, cay), sach(kq.ra, cay)) !== null;
		if (!khac)
			loi.push(
				`HONG DOI CHUNG ${d.so}: ban sao ${d.tep} cho dau ra giong het goc`,
			);
		else
			console.log(`DOI CHUNG DUONG ${d.so} ${d.tep}: khac goc (ma ${kq.ma})`);
	}
	return loi;
});

for (const h of hong) console.log(h);
console.log(`hai-ref: ${hong.length === 0 ? "dat" : `${hong.length} hong`}`);
process.exit(hong.length === 0 ? 0 : 1);
