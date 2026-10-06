import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ts = createRequire(import.meta.url)("typescript");

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const THU_MUC_OKR = "apps/app/app/(app)/[slug]/okr";
const THU_MUC_SHEET = "apps/app/components/crm/record-sheet";
const TEP_TONG_QUAN = [
	"apps/app/app/(app)/[slug]/dashboard-summary.tsx",
	"apps/app/app/(app)/[slug]/tong-quan-chi-okr.tsx",
];
const THU_MUC_API = "apps/api/src";
const CHU_TU_MAP = ["Đúng nhịp", "Chậm nhịp", "Tự tin", "Trượt"];
const DOC_VET = new Set(["findMany", "findFirst", "count", "groupBy", "aggregate"]);
const LOAI_TRU = new Set(["node_modules", ".next", "dist", "build", "generated"]);

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
};

function diCay(thuMuc, duoi, ra) {
	if (!existsSync(thuMuc)) return ra;
	for (const ten of readdirSync(thuMuc)) {
		if (LOAI_TRU.has(ten)) continue;
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) diCay(duong, duoi, ra);
		else if (duoi.test(ten) && !/\.(spec|test)\.tsx?$/.test(ten)) ra.push(duong);
	}
	return ra;
}

const tuongDoi = (p) => (p.startsWith(GOC) ? p.slice(GOC.length + 1) : p);

function cay(duong) {
	return ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		duong.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

const dongCua = (sf, n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;

function soiGiaoDien(duong) {
	const sf = cay(duong);
	const ten = tuongDoi(duong);
	const hong = [];
	let soProgress = 0;
	const di = (n) => {
		if (
			(ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) &&
			n.tagName.getText(sf) === "Progress"
		) {
			soProgress += 1;
			const variant = n.attributes.properties.find(
				(a) => ts.isJsxAttribute(a) && a.name.getText(sf) === "variant",
			);
			const gt = variant?.initializer;
			const dung =
				gt !== undefined && ts.isStringLiteral(gt) && gt.text === "neutral";
			if (!dung) hong.push(`Progress thiếu variant neutral: ${ten}:${dongCua(sf, n)}`);
		}
		if (ts.isStringLiteral(n) || ts.isJsxText(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
			const chu = n.text ?? n.getText(sf);
			for (const c of CHU_TU_MAP)
				if (chu.includes(c))
					hong.push(`chữ tình trạng tự map ngoài messages «${c}»: ${ten}:${dongCua(sf, n)}`);
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return { ten, soProgress, hong };
}

function dieuKienVet(sf, doiSoGoi) {
	if (!doiSoGoi || !ts.isObjectLiteralExpression(doiSoGoi)) return "khong doc duoc doi so";
	const where = doiSoGoi.properties.find(
		(p) => ts.isPropertyAssignment(p) && p.name.getText(sf) === "where",
	);
	if (!where) return "khong co where";
	if (!ts.isObjectLiteralExpression(where.initializer))
		return `where khong phai object: ${where.initializer.getText(sf)}`;
	const thuoc = (ten) =>
		where.initializer.properties.find(
			(p) => ts.isPropertyAssignment(p) && p.name.getText(sf) === ten,
		);
	const muc = thuoc("objectiveId");
	if (muc) {
		const gt = muc.initializer;
		const rong =
			gt.kind === ts.SyntaxKind.NullKeyword ||
			(ts.isIdentifier(gt) && gt.text === "undefined");
		if (!rong) return null;
	}
	const hanh = thuoc("action");
	if (
		hanh &&
		ts.isStringLiteral(hanh.initializer) &&
		hanh.initializer.text === "mo-hop-tuan"
	)
		return null;
	if (hanh) {
		const chu = hanh.initializer.getText(sf);
		if (/\bnot(In)?\s*:/.test(chu) && /mo-hop-tuan|moHopTuan|MO_HOP_TUAN/i.test(chu))
			return null;
		if (ts.isStringLiteral(hanh.initializer)) return null;
		if (ts.isObjectLiteralExpression(hanh.initializer)) {
			const trong = hanh.initializer.properties.find(
				(p) => ts.isPropertyAssignment(p) && p.name.getText(sf) === "in",
			);
			if (
				trong &&
				ts.isArrayLiteralExpression(trong.initializer) &&
				trong.initializer.elements.length > 0 &&
				trong.initializer.elements.every(
					(e) => ts.isStringLiteral(e) && e.text !== "mo-hop-tuan",
				)
			)
				return null;
		}
	}
	const ghiChu = thuoc("note");
	if (ghiChu && ts.isObjectLiteralExpression(ghiChu.initializer)) {
		const loc = ghiChu.initializer.properties.filter(
			(p) =>
				ts.isPropertyAssignment(p) &&
				["in", "startsWith", "equals"].includes(p.name.getText(sf)),
		);
		if (loc.length > 0) return null;
	}
	return `where khong loc objectiveId va khong loai mo-hop-tuan: ${where.initializer.getText(sf).replace(/\s+/g, " ").slice(0, 120)}`;
}

function soiVet(duong) {
	const sf = cay(duong);
	const ten = tuongDoi(duong);
	const cho = [];
	const di = (n) => {
		if (
			ts.isCallExpression(n) &&
			ts.isPropertyAccessExpression(n.expression) &&
			DOC_VET.has(n.expression.name.text) &&
			ts.isPropertyAccessExpression(n.expression.expression) &&
			n.expression.expression.name.text === "okrTrail"
		) {
			const loi = dieuKienVet(sf, n.arguments[0]);
			cho.push({
				o: `${ten}:${dongCua(sf, n)}`,
				goi: n.expression.name.text,
				loi,
			});
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return cho;
}

function caVet(danhSach) {
	const cho = danhSach.flatMap(soiVet);
	for (const c of cho)
		console.log(`${c.loi === null ? "dat " : "HONG"} okrTrail.${c.goi} ${c.o}${c.loi === null ? "" : ` — ${c.loi}`}`);
	console.log(`so cho doc vet: ${cho.length}`);
	if (cho.length === 0) {
		console.log("KHONG DO DUOC: khong cho doc okrTrail nao — soi sai thu muc?");
		process.exit(2);
	}
	const hong = cho.filter((c) => c.loi !== null);
	for (const h of hong) console.log(`vet doc khong loc: ${h.o}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

function caGiaoDien(danhSach) {
	let tong = 0;
	const hong = [];
	for (const d of danhSach) {
		const r = soiGiaoDien(d);
		tong += r.soProgress;
		hong.push(...r.hong);
		console.log(`${r.hong.length === 0 ? "dat " : "HONG"} ${r.ten} (Progress: ${r.soProgress})`);
	}
	console.log(`so tep: ${danhSach.length}, so phan tu Progress: ${tong}`);
	for (const h of hong) console.log(h);
	if (danhSach.length === 0 || tong === 0) {
		console.log("KHONG DO DUOC: khong tep hay khong phan tu Progress nao de soi");
		process.exit(2);
	}
	process.exit(hong.length === 0 ? 0 : 1);
}

const ca = doiSo("--ca") ?? "giao-dien";

if (doiSo("--tep") !== null) {
	const tep = doiSo("--tep");
	if (ca === "vet") caVet([tep]);
	caGiaoDien([tep]);
}

if (process.argv.includes("--chieu-do")) {
	const thuMuc = mkdtempSync(join(tmpdir(), "soi-ma-"));
	const cac = [];
	if (ca === "vet") {
		const tep = join(thuMuc, "doc-vet.ts");
		writeFileSync(
			tep,
			"export async function doc(db: any, cycleId: string) {\n\treturn db.okrTrail.findMany({ where: { cycleId } });\n}\n",
		);
		cac.push({ ten: "findMany theo cycleId khong loc", tep, ghim: `vet doc khong loc: ${tep}:2` });
	} else {
		const goc = join(GOC, THU_MUC_OKR, "tien-do-kr.tsx");
		const tep = join(thuMuc, "tien-do-kr.tsx");
		const chu = readFileSync(goc, "utf8");
		const bo = chu.replace(/\n(\s*)variant="neutral"/, "");
		if (bo === chu) {
			console.log("KHONG DO DUOC: khong tim thay variant=\"neutral\" trong tien-do-kr.tsx de xoa");
			process.exit(2);
		}
		writeFileSync(tep, bo);
		cac.push({ ten: "xoa variant o mot Progress", tep, ghim: `Progress thiếu variant neutral: ${tep}:` });
	}
	let lot = 0;
	for (const c of cac) {
		const r = spawnSync(process.execPath, [TEP_NAY, "--ca", ca, "--tep", c.tep], { encoding: "utf8" });
		const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
		const bat = r.status === 1 && ra.includes(c.ghim);
		if (!bat) lot += 1;
		console.log(`${bat ? "bat " : "LOT "} ${c.ten}: ma ${r.status}, ${bat ? `in «${c.ghim}»` : `khong in «${c.ghim}»: ${ra.trim().slice(0, 300)}`}`);
	}
	rmSync(thuMuc, { recursive: true, force: true });
	console.log(`chieu do: ${cac.length - lot}/${cac.length} ca do bi bat`);
	process.exit(lot === 0 ? 0 : 1);
}

if (ca === "vet") caVet(diCay(join(GOC, THU_MUC_API), /\.ts$/, []));

const giaoDien = [
	...diCay(join(GOC, THU_MUC_OKR), /\.tsx$/, []),
	...diCay(join(GOC, THU_MUC_SHEET), /^objective-.*\.tsx$/, []),
	...TEP_TONG_QUAN.map((t) => join(GOC, t)).filter((t) => existsSync(t)),
];
caGiaoDien(giaoDien);
