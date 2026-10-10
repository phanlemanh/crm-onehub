import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { docTai, GOC, hoSoDaKy, LoiNeo, lsTree, MOC_GOC, mocNeo } from "./neo.mjs";

const ec = createRequire(import.meta.url)(join(GOC, "lib/evidence-core.cjs"));
const DANH_SACH = JSON.parse(readFileSync(join(import.meta.dirname, "danh-sach.json"), "utf8"));
const LY_DO_PATHS = /^(paths-khong-tro-toi-tep|dang-khai-la):/;

export function locCua(evalsText, cay) {
	return ec.staleByPaths(["x"], evalsText, { cay });
}

export function hoSoTatLocViPaths(sha) {
	const cay = ec.dungCayPaths(lsTree(sha));
	const ra = [];
	for (const ho of hoSoDaKy(sha)) {
		const r = locCua(docTai(sha, `_acceptance/${ho}/evals.yaml`), cay);
		if (!r.apply && LY_DO_PATHS.test(r.reason)) ra.push({ ho_so: ho, ly_do_luoi: r.reason });
	}
	return ra;
}

const themGlob = (text, id, glob) =>
	text.replace(new RegExp(`(\\n  - id: ${id}\\n(?:(?!\\n  - id: )[\\s\\S])*?\\n    paths:)`), `$1\n      - "${glob}"`);

const doiExecutor = (text, id, loai) =>
	text.replace(new RegExp(`(\\n  - id: ${id}\\n(?:(?!\\n  - id: )[\\s\\S])*?\\n    executor: )\\S+`), `$1${loai}`);

function main() {
	const loi = [];
	const neo = mocNeo();
	console.log(`moc neo: ${neo.sha.slice(0, 9)} (${neo.loai})`);
	const cayNeo = ec.dungCayPaths(lsTree(neo.sha));
	const trong = [...new Set(DANH_SACH.eval.filter((x) => x.trong_pham_vi).map((x) => x.ho_so))];
	for (const ho of trong) {
		const r = locCua(docTai(neo.sha, `_acceptance/${ho}/evals.yaml`), cayNeo);
		if (!r.apply) loi.push(`(1) ${ho}: luoi tat bo loc o moc neo — ${r.reason}`);
	}
	console.log(`(1) ${trong.length} ho so trong pham vi o moc neo: staleByPaths cua luoi bat bo loc o ${trong.length - loi.length}`);

	const goc = hoSoTatLocViPaths(MOC_GOC);
	const khoa = (x) => `${x.ho_so} ${x.ly_do_luoi}`;
	const thuc = new Set(goc.map(khoa));
	const mong = new Set(DANH_SACH.loc_tat_vi_paths.map(khoa));
	for (const k of thuc) if (!mong.has(k)) loi.push(`(2) quet ${MOC_GOC} thay «${k}» ma danh sach khong co`);
	for (const k of mong) if (!thuc.has(k)) loi.push(`(2) danh sach co «${k}» ma quet ${MOC_GOC} khong thay`);
	console.log(`(2) moi ho so da ky o ${MOC_GOC}: ${goc.length} ho so luoi tat bo loc vi paths, danh sach ${mong.size}`);
	for (const ho of trong) if (!goc.some((x) => x.ho_so === ho)) loi.push(`(2) ${ho} trong pham vi ma o ${MOC_GOC} luoi khong tat loc — danh sach sai`);

	const cayGoc = ec.dungCayPaths(lsTree(MOC_GOC));
	const O = [
		["apps/app/app/(app)/[[]slug]/contacts/contacts-table.tsx", "paths-khong-tro-toi-tep"],
		["apps/app/app/(app)/[slug]/contacts/contacts-table.tsx", null],
		["apps/app/app/(app)/[slug]/settings/giai-doan/", "dang-khai-la"],
		["apps/app/app/(app)/[slug]/settings/giai-doan/**", null],
	];
	for (const [g, ma] of O) {
		const pl = ec.phanLoaiMucPaths(g, cayGoc);
		if ((pl.nhan ? null : pl.ma) !== ma) loi.push(`(3) phanLoaiMucPaths «${g}» ra ${pl.nhan ? "nhan" : pl.ma}, mong ${ma ?? "nhan"}`);
	}
	console.log(`(3) doi chung bo khop cua luoi: ${O.length} o`);

	const ho = trong[0];
	const goc0 = docTai(neo.sha, `_acceptance/${ho}/evals.yaml`);
	const id = /\n  - id: (\S+)\n/.exec(goc0)?.[1];
	for (const loai of ["script", "ui-check", "judgment"]) {
		const gia = themGlob(doiExecutor(goc0, id, loai), id, "apps/khong-co/**");
		const r = locCua(gia, cayNeo);
		if (r.apply || !r.reason.includes("apps/khong-co/**")) loi.push(`(4) chieu do ${loai}: them glob apps/khong-co/** vao ${ho}/${id} ma luoi van bat loc`);
	}
	if (!loi.some((l) => l.startsWith("(4)"))) console.log(`(4) chieu do: glob chet o eval script, ui-check, judgment cua ${ho}/${id} -> luoi tat loc, goi ten glob`);
	const rDt = locCua(docTai(neo.sha, "_acceptance/dien-thoai-ca-nhan/evals.yaml"), cayNeo);
	if (rDt.apply || !rDt.reason.includes(":E1:")) loi.push(`(4) chieu do: dien-thoai-ca-nhan dua vao pham vi ma luoi khong tat loc o E1 (${rDt.reason})`);
	else console.log(`(4) chieu do: dien-thoai-ca-nhan dua vao pham vi -> luoi tat loc, goi ten ${rDt.reason.split(":").slice(0, 2).join(":")}`);

	if (loi.length) {
		console.error(`paths-chet: DO\n${loi.map((l) => `  - ${l}`).join("\n")}`);
		return 1;
	}
	console.log(`paths-chet: XANH — luoi bat bo loc o ca ${trong.length} ho so trong pham vi`);
	return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		process.exitCode = main();
	} catch (e) {
		if (!(e instanceof LoiNeo)) throw e;
		console.error(`paths-chet: KHONG DO DUOC — ${e.message}`);
		process.exitCode = 2;
	}
}
