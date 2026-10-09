import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

const GOC = path.resolve(import.meta.dirname, "..", "..", "..");
const ts = createRequire(path.join(GOC, "package.json"))("typescript");

const BO_QUA = [
	/(^|\/)test\//,
	/(^|\/)evals\//,
	/(^|\/)generated\//,
	/\.(spec|dom|eval|test)\.[cm]?[jt]sx?$/,
	/\.d\.ts$/,
];
const PHUONG_THUC = new Set([
	"create",
	"createMany",
	"createManyAndReturn",
	"upsert",
]);
const SQL_CHEN =
	/insert\s+into\s+(?:"?public"?\s*\.\s*)?"?deal"?\s*\(([^)]*)\)/gi;
const CHUOI_TAO = /\.deal\.(create|createMany|upsert)\(/g;
const CO_THE =
	/\.deal\b|\bdeals\s*:|insert\s+into\s+(?:"?public"?\s*\.\s*)?"?deal"?\b/i;

function tenKieu(t, da = new Set()) {
	if (!t || da.has(t)) return [];
	da.add(t);
	const ra = [t.aliasSymbol?.name, t.symbol?.name].filter(Boolean);
	for (const con of t.types ?? []) ra.push(...tenKieu(con, da));
	return ra;
}

function coUndefined(t) {
	if (t.flags & ts.TypeFlags.Undefined) return true;
	return (t.types ?? []).some((c) => c.flags & ts.TypeFlags.Undefined);
}

function quetGoi(thuMuc) {
	const cauHinh = path.join(thuMuc, "tsconfig.json");
	const doc = ts.getParsedCommandLineOfConfigFile(
		cauHinh,
		{},
		{ ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
	);
	if (!doc) return { doiTuong: 0, sql: 0, chuoi: 0, thieu: [] };
	const tep = doc.fileNames.filter((f) => {
		const tuongDoi = path.relative(GOC, f);
		if (BO_QUA.some((r) => r.test(tuongDoi))) return false;
		return CO_THE.test(readFileSync(f, "utf8"));
	});
	if (tep.length === 0) return { doiTuong: 0, sql: 0, chuoi: 0, thieu: [] };
	const chuongTrinh = ts.createProgram(tep, doc.options);
	const kiem = chuongTrinh.getTypeChecker();
	const thieu = [];
	let doiTuong = 0;
	let sql = 0;
	let chuoi = 0;
	for (const f of tep) {
		const nguon = chuongTrinh.getSourceFile(f);
		if (!nguon) continue;
		const tuongDoi = path.relative(GOC, f);
		const chu = nguon.getFullText();
		chuoi += (chu.match(CHUOI_TAO) ?? []).length;
		for (const k of chu.matchAll(SQL_CHEN)) {
			sql += 1;
			if (!/"?stage"?/i.test(k[1])) {
				const dong = chu.slice(0, k.index).split("\n").length;
				thieu.push(`THIEU ${tuongDoi}:${dong} chen tho thieu stage`);
			}
		}
		const kiemDoiTuong = (lit) => {
			if (!lit || !ts.isObjectLiteralExpression(lit)) return;
			doiTuong += 1;
			const kieu = kiem.getTypeAtLocation(lit);
			const khoa = kieu.getProperty("stage") ?? kieu.getProperty("giaiDoan");
			const dong = nguon.getLineAndCharacterOfPosition(lit.getStart()).line + 1;
			if (!khoa) thieu.push(`THIEU ${tuongDoi}:${dong} khong gan stage`);
			else if (coUndefined(kiem.getTypeOfSymbolAtLocation(khoa, lit))) {
				thieu.push(`THIEU ${tuongDoi}:${dong} stage co the undefined`);
			}
		};
		const thuoc = (lit, ten) =>
			lit && ts.isObjectLiteralExpression(lit)
				? lit.properties.find(
						(p) => ts.isPropertyAssignment(p) && p.name.getText() === ten,
					)?.initializer
				: undefined;
		const motHayNhieu = (gt) => {
			if (!gt) return;
			if (ts.isArrayLiteralExpression(gt))
				for (const e of gt.elements) kiemDoiTuong(e);
			else kiemDoiTuong(gt);
		};
		const di = (nut) => {
			if (
				ts.isCallExpression(nut) &&
				ts.isPropertyAccessExpression(nut.expression) &&
				PHUONG_THUC.has(nut.expression.name.text)
			) {
				const nhan = kiem.getTypeAtLocation(nut.expression.expression);
				if (tenKieu(nhan).some((t) => /^DealDelegate$/.test(t))) {
					const doi = nut.arguments[0];
					const pt = nut.expression.name.text;
					if (pt === "upsert") kiemDoiTuong(thuoc(doi, "create"));
					else motHayNhieu(thuoc(doi, "data"));
				}
			}
			if (
				ts.isPropertyAssignment(nut) &&
				nut.name.getText() === "deals" &&
				ts.isObjectLiteralExpression(nut.initializer)
			) {
				motHayNhieu(thuoc(nut.initializer, "create"));
				motHayNhieu(thuoc(thuoc(nut.initializer, "createMany"), "data"));
				const noi = thuoc(nut.initializer, "connectOrCreate");
				if (noi && ts.isArrayLiteralExpression(noi))
					for (const e of noi.elements) kiemDoiTuong(thuoc(e, "create"));
				else kiemDoiTuong(thuoc(noi, "create"));
			}
			ts.forEachChild(nut, di);
		};
		di(nguon);
	}
	return { doiTuong, sql, chuoi, thieu };
}

function cacGoi(goc) {
	const ra = [];
	for (const cha of ["apps", "packages"]) {
		const thu = path.join(goc, cha);
		if (!existsSync(thu)) continue;
		for (const ten of execFileSync("ls", [thu], { encoding: "utf8" })
			.split("\n")
			.filter(Boolean)) {
			if (existsSync(path.join(thu, ten, "tsconfig.json")))
				ra.push(path.join(thu, ten));
		}
	}
	return ra;
}

function quet(goc) {
	let doiTuong = 0;
	let sql = 0;
	let chuoi = 0;
	const thieu = [];
	for (const goi of cacGoi(goc)) {
		const r = quetGoi(goi);
		doiTuong += r.doiTuong;
		sql += r.sql;
		chuoi += r.chuoi;
		thieu.push(...r.thieu);
	}
	return { doiTuong, sql, chuoi, thieu };
}

const KIEU_GIA = `
export type DealCreateInput = { name: string; stage?: string; companyId?: string };
export type DealUncheckedCreateInput = { name: string; stage?: string; companyId: string };
export type DealCreateManyInput = { name: string; stage?: string };
export type DealCreateWithoutCompanyInput = { name: string; stage?: string };
type Long = { create?: DealCreateWithoutCompanyInput | DealCreateWithoutCompanyInput[]; createMany?: { data: DealCreateWithoutCompanyInput[] }; connectOrCreate?: { where: { id: string }; create: DealCreateWithoutCompanyInput } };
export type CompanyCreateInput = { name: string; deals?: Long };
export interface DealDelegate {
	create<T extends { data: DealCreateInput | DealUncheckedCreateInput }>(a: T): void;
	createMany(a: { data: DealCreateManyInput[] }): void;
	upsert(a: { where: { id: string }; update: { stage?: string }; create: DealCreateInput | DealUncheckedCreateInput }): void;
}
export declare const db: {
	deal: DealDelegate;
	company: { create(a: { data: CompanyCreateInput }): void };
	$executeRawUnsafe(q: string): void;
};
`;

const CA_DO = {
	"goi-thang": 'db.deal.create({ data: { name: "x", companyId: "c" } });',
	"long-quan-he":
		'db.company.create({ data: { name: "c", deals: { create: [{ name: "x" }] } } });',
	"create-many": 'db.deal.createMany({ data: [{ name: "x" }] });',
	"connect-or-create":
		'db.company.create({ data: { name: "c", deals: { connectOrCreate: { where: { id: "1" }, create: { name: "x" } } } } });',
	"upsert-chi-update":
		'db.deal.upsert({ where: { id: "1" }, update: { stage: "s" }, create: { name: "x", companyId: "c" } });',
	"bi-danh":
		'const d = db.deal;\nd.create({ data: { name: "x", companyId: "c" } });',
	"stage-tuy-chon":
		'export function f(v: { stage?: string }) {\n\tdb.deal.create({ data: { name: "x", companyId: "c", stage: v.stage } });\n}',
	"sql-chu-thuong":
		"db.$executeRawUnsafe(`insert into deal (id, name) values (1, 2)`);",
	"sql-public":
		'db.$executeRawUnsafe(`INSERT INTO "public"."deal" ("id", "name") VALUES (1, 2)`);',
};
const CA_XANH =
	'db.deal.create({ data: { name: "x", companyId: "c", stage: "s" } });\ndb.$executeRawUnsafe(`INSERT INTO "deal" ("id", "stage") VALUES (1, 2)`);';

function banTuThu(maNguon) {
	const goc = mkdtempSync(path.join(tmpdir(), "gmd-tao-"));
	const goi = path.join(goc, "packages", "gia");
	execFileSync("mkdir", ["-p", path.join(goi, "src")]);
	writeFileSync(
		path.join(goi, "tsconfig.json"),
		JSON.stringify({
			compilerOptions: {
				strict: true,
				target: "es2022",
				module: "esnext",
				moduleResolution: "bundler",
				noEmit: true,
			},
			include: ["src"],
		}),
	);
	writeFileSync(path.join(goi, "src", "kieu.ts"), KIEU_GIA);
	writeFileSync(
		path.join(goi, "src", "ca.ts"),
		`import { db } from "./kieu";\n${maNguon}\n`,
	);
	return goc;
}

if (process.argv.includes("--tu-thu")) {
	let dung = 0;
	const loi = [];
	for (const [ten, ma] of Object.entries(CA_DO)) {
		const goc = banTuThu(ma);
		try {
			const r = quet(goc);
			if (r.thieu.some((t) => t.includes("packages/gia/src/ca.ts:"))) dung += 1;
			else
				loi.push(
					`tu-thu: dang ${ten} lot (doi tuong ${r.doiTuong}, sql ${r.sql})`,
				);
		} finally {
			rmSync(goc, { recursive: true, force: true });
		}
	}
	const goc = banTuThu(CA_XANH);
	try {
		const r = quet(goc);
		if (r.thieu.length === 0 && r.doiTuong > 0) dung += 1;
		else
			loi.push(
				`tu-thu: tep du stage bi bao ${JSON.stringify(r.thieu)} (doi tuong ${r.doiTuong})`,
			);
	} finally {
		rmSync(goc, { recursive: true, force: true });
	}
	const tong = Object.keys(CA_DO).length + 1;
	console.log(`tu-thu ${dung}/${tong}`);
	for (const l of loi) console.error(l);
	process.exit(dung === tong ? 0 : 2);
}

const r = quet(GOC);
console.log(
	`${r.doiTuong} doi tuong tao thoa thuan, ${r.sql} lenh SQL, ${r.chuoi} lan khop chuoi`,
);
const loi = [...r.thieu];
if (r.doiTuong === 0)
	loi.push("quet rong: khong thay doi tuong tao thoa thuan nao");
if (r.doiTuong < r.chuoi)
	loi.push(`kiem ke lech: ${r.doiTuong} doi tuong < ${r.chuoi} lan khop chuoi`);
for (const l of loi) console.error(l);
process.exit(loi.length === 0 ? 0 : 1);
