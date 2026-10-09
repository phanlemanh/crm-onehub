import { readFileSync } from "node:fs";
import { join } from "node:path";
import { docTai, globChet, hoSoDaKy, LoiNeo, lsTree, MOC_GOC, mocNeo, napGlobToRe, pathsCua } from "./neo.mjs";

const DANH_SACH = JSON.parse(readFileSync(join(import.meta.dirname, "danh-sach.json"), "utf8"));
const khoa = (ho, ev) => `${ho}/${ev}`;

export function kiemDanhSach(danhSach, docEvals, tep, globToRe) {
	const loi = [];
	for (const { ho_so, eval: ev } of danhSach) {
		const globs = pathsCua(docEvals(ho_so)).get(ev);
		if (!globs) {
			loi.push(`${khoa(ho_so, ev)}: khong con eval may nay`);
			continue;
		}
		const chet = globChet(globs, tep, globToRe);
		if (chet.length) loi.push(`${khoa(ho_so, ev)}: ${chet.join(", ")}`);
	}
	return loi;
}

export function quetToanBo(sha, globToRe) {
	const tep = lsTree(sha);
	const ra = new Map();
	for (const ho of hoSoDaKy(sha)) {
		for (const [ev, globs] of pathsCua(docTai(sha, `_acceptance/${ho}/evals.yaml`))) {
			const chet = globChet(globs, tep, globToRe);
			if (chet.length) ra.set(khoa(ho, ev), chet);
		}
	}
	return ra;
}

function main() {
	return napGlobToRe().then((globToRe) => {
		const loi = [];
		const neo = mocNeo();
		console.log(`moc neo: ${neo.sha.slice(0, 9)} (${neo.loai})`);
		const tepNeo = lsTree(neo.sha);
		const docNeo = (ho) => docTai(neo.sha, `_acceptance/${ho}/evals.yaml`);
		const conChet = kiemDanhSach(DANH_SACH.eval, docNeo, tepNeo, globToRe);
		for (const l of conChet) loi.push(`(1) glob chet o moc neo — ${l}`);
		console.log(`(1) ${DANH_SACH.eval.length} eval cua danh sach o moc neo: ${conChet.length} eval con glob chet`);

		const goc = quetToanBo(MOC_GOC, globToRe);
		const mong = new Map(DANH_SACH.eval.map((x) => [khoa(x.ho_so, x.eval), Object.keys(x.doi).sort()]));
		for (const [k, chet] of goc) {
			if (!mong.has(k)) loi.push(`(2) quet ${MOC_GOC} thay ${k} chet ma danh sach khong co`);
			else if (JSON.stringify([...chet].sort()) !== JSON.stringify(mong.get(k))) loi.push(`(2) ${k}: glob chet ${chet.join(", ")} khac danh sach`);
		}
		for (const k of mong.keys()) if (!goc.has(k)) loi.push(`(2) danh sach co ${k} ma quet ${MOC_GOC} khong thay chet`);
		console.log(`(2) quet toan bo ho so da ky o ${MOC_GOC}: ${goc.size} eval chet, danh sach ${mong.size}`);

		const tepGoc = lsTree(MOC_GOC);
		const O = [
			["apps/app/app/(app)/[[]slug]/contacts/contacts-table.tsx", true],
			["apps/app/app/(app)/[slug]/contacts/contacts-table.tsx", false],
			["apps/app/app/(app)/[slug]/settings/giai-doan/", true],
			["apps/app/app/(app)/[slug]/settings/giai-doan/**", false],
		];
		for (const [g, chet] of O) {
			const thuc = globChet([g], tepGoc, globToRe).length === 1;
			if (thuc !== chet) loi.push(`(3) bo khop: «${g}» ${thuc ? "chet" : "song"}, mong ${chet ? "chet" : "song"}`);
		}
		console.log(`(3) doi chung bo khop: ${O.length} o`);

		const gia = [{ ho_so: "danh-sach-keo-chung", eval: "E6" }];
		const docGia = (ho) => docNeo(ho).replace(/(\n  - id: E6\n(?:.*\n)*?    paths:\n)/, '$1      - "apps/khong-co/**"\n');
		const bat = kiemDanhSach(gia, docGia, tepNeo, globToRe);
		if (!bat.some((l) => l.includes("apps/khong-co/**"))) loi.push("(4) chieu do: them glob apps/khong-co/** ma khong bat");
		else console.log("(4) chieu do: them glob apps/khong-co/** -> DUNG");

		if (loi.length) {
			console.error(`paths-chet: DO\n${loi.map((l) => `  - ${l}`).join("\n")}`);
			return 1;
		}
		console.log(`paths-chet: XANH — 0 eval co glob chet trong ${DANH_SACH.eval.length} eval cua danh sach`);
		return 0;
	});
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main()
		.then((ma) => {
			process.exitCode = ma;
		})
		.catch((e) => {
			if (!(e instanceof LoiNeo)) throw e;
			console.error(`paths-chet: KHONG DO DUOC — ${e.message}`);
			process.exitCode = 2;
		});
}
