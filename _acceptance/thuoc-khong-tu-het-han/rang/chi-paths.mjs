import { readFileSync } from "node:fs";
import { join } from "node:path";
import { docTai, LoiNeo, MOC_GOC, mocNeo, pathsCua } from "./neo.mjs";

const DANH_SACH = JSON.parse(readFileSync(join(import.meta.dirname, "danh-sach.json"), "utf8"));
const HAI_THUOC = { "ha-tran-thang-hoi-zalo": "E7" };
const TRONG = DANH_SACH.eval.filter((x) => x.trong_pham_vi);

function khoiEval(text) {
	const ra = new Map();
	for (const k of text.split(/\n  - id: /).slice(1)) {
		const id = k.split("\n")[0].trim();
		ra.set(id, k);
	}
	return ra;
}

const pathsTho = (khoi) =>
	/\n    paths:\n(?:      - .*(?:\n|$))+/.exec(khoi)?.[0].trim() ?? /\n    paths:\s*\[.*\]/.exec(khoi)?.[0].trim() ?? null;

const boPaths = (khoi) =>
	khoi
		.replace(/\n    paths:\n(?:      - .*(?:\n|$))+/, "\n")
		.replace(/\n    paths:\s*\[.*\]/, "")
		.replace(/\n+$/, "");

function truongDoi(a, b) {
	const da = a.split("\n");
	const db = b.split("\n");
	const i = da.findIndex((d, k) => d !== db[k]);
	for (let k = i; k >= 0; k -= 1) {
		const m = /^    ([a-z_]+):/.exec(da[k] ?? db[k] ?? "");
		if (m) return m[1];
	}
	return "khoi";
}

export function soSanhTep(ho, cu, moi, { danhSach, boQua }) {
	const loi = [];
	const kCu = khoiEval(cu);
	const kMoi = khoiEval(moi);
	for (const id of kCu.keys()) if (!kMoi.has(id)) loi.push(`${ho}/${id}: thieu eval`);
	for (const id of kMoi.keys()) if (!kCu.has(id)) loi.push(`${ho}/${id}: eval moi khong co o ${MOC_GOC}`);
	const pCu = pathsCua(cu);
	const pMoi = pathsCua(moi);
	const doiCua = new Map(danhSach.filter((x) => x.ho_so === ho).map((x) => [x.eval, x.doi]));
	const doiPaths = [];
	for (const [id, khoi] of kCu) {
		if (!kMoi.has(id) || id === boQua) continue;
		if (boPaths(khoi) !== boPaths(kMoi.get(id))) loi.push(`${ho}/${id}: ${truongDoi(boPaths(khoi), boPaths(kMoi.get(id)))} doi`);
		const a = JSON.stringify(pCu.get(id) ?? null);
		const b = JSON.stringify(pMoi.get(id) ?? null);
		if (pathsTho(khoi) !== pathsTho(kMoi.get(id))) doiPaths.push(id);
		const doi = doiCua.get(id);
		if (!doi) continue;
		const mong = (pCu.get(id) ?? []).flatMap((g) => (g in doi ? (doi[g] === null ? [] : [doi[g]]) : [g]));
		if (JSON.stringify(mong) !== b) loi.push(`${ho}/${id}: paths ${b} khac mong ${JSON.stringify(mong)}`);
		if (a === b) loi.push(`${ho}/${id}: paths khong doi`);
	}
	return { loi, doiPaths };
}

function main() {
	const neo = mocNeo();
	console.log(`moc neo: ${neo.sha.slice(0, 9)} (${neo.loai}); moc goc ${MOC_GOC}`);
	const tep = [...new Set([...TRONG.map((x) => x.ho_so), ...Object.keys(HAI_THUOC)])];
	const loi = [];
	const daDoi = [];
	for (const ho of tep) {
		const duong = `_acceptance/${ho}/evals.yaml`;
		const r = soSanhTep(ho, docTai(MOC_GOC, duong), docTai(neo.sha, duong), { danhSach: TRONG, boQua: HAI_THUOC[ho] });
		loi.push(...r.loi);
		daDoi.push(...r.doiPaths.map((id) => `${ho}/${id}`));
	}
	const mong = TRONG.map((x) => `${x.ho_so}/${x.eval}`).sort();
	if (JSON.stringify(daDoi.sort()) !== JSON.stringify(mong)) {
		loi.push(`tap eval doi paths (${daDoi.length}) khac danh sach (${mong.length}): thua ${daDoi.filter((x) => !mong.includes(x)).join(", ") || "-"}; thieu ${mong.filter((x) => !daDoi.includes(x)).join(", ") || "-"}`);
	}
	console.log(`so ${tep.length} tep evals.yaml, ${daDoi.length} eval doi paths, danh sach ${mong.length}`);

	const cu = docTai(MOC_GOC, "_acceptance/danh-sach-keo-chung/evals.yaml");
	const DS_GIA = DANH_SACH.eval;
	const gia = [
		["doi mot chu trong expected", cu.replace(/(\n  - id: E6\n(?:.*\n)*?    expected: [|]?\n?\s*)(\S)/, "$1X$2"), "E6: expected doi"],
		["xoa mot eval", cu.replace(/\n  - id: E12\n(?:(?!\n  - id: )[\s\S])*/, ""), "E12: thieu eval"],
		["bo sua paths cua mot eval trong danh sach", cu, "E6: paths khong doi"],
	];
	const judgment = cu.replace(/(\n  - id: E6\n)/, "$1").replace(/\n  - id: E6\n(?:(?!\n  - id: )[\s\S])*/, (k) => k.replace(/executor: \w+/, "executor: judgment"));
	const judgmentDoi = judgment.replace(/(\n  - id: E6\n(?:(?!\n  - id: )[\s\S])*?\n    paths:)/, "$1\n      - \"apps/them-moi/**\"");
	const rJ = soSanhTep("danh-sach-keo-chung", judgment, judgmentDoi, { danhSach: [], boQua: undefined });
	if (!rJ.doiPaths.includes("E6")) loi.push("chieu do «eval judgment doi paths»: khong vao tap doi paths");
	else console.log("chieu do «eval judgment doi paths» -> DUNG vao tap doi paths");
	for (const [ten, moi, can] of gia) {
		const r = soSanhTep("danh-sach-keo-chung", cu, moi, { danhSach: DS_GIA, boQua: undefined });
		if (!r.loi.some((l) => l.includes(can))) loi.push(`chieu do «${ten}»: khong bat «${can}» — ${r.loi.slice(0, 2).join("; ")}`);
		else console.log(`chieu do «${ten}» -> DUNG «${can}»`);
	}
	if (loi.length) {
		console.error(`chi-paths: DO\n${loi.map((l) => `  - ${l}`).join("\n")}`);
		return 1;
	}
	console.log(`chi-paths: XANH — chi paths doi, dung ${TRONG.length} eval trong pham vi, dung nhu danh sach ghi`);
	return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		process.exitCode = main();
	} catch (e) {
		if (!(e instanceof LoiNeo)) throw e;
		console.error(`chi-paths: KHONG DO DUOC — ${e.message}`);
		process.exitCode = 2;
	}
}
