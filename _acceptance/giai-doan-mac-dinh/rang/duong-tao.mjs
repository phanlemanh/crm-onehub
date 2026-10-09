import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
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

const DUOI = /\.(ts|tsx|mts|cts)$/;
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
const LONG = ["create", "createMany", "connectOrCreate"];
const MAC_DINH = {
	strict: true,
	target: ts.ScriptTarget.ES2022,
	module: ts.ModuleKind.ESNext,
	moduleResolution: ts.ModuleResolutionKind.Bundler,
	skipLibCheck: true,
	noEmit: true,
};

function quanHeDeal(schema) {
	const ten = new Set();
	let model = null;
	for (const dong of readFileSync(schema, "utf8").split("\n")) {
		const m = dong.match(/^model (\w+) \{/);
		if (m) {
			model = m[1];
			continue;
		}
		const q = `${dong} `.match(/^\s+(\w+)\s+Deal(\[\]|\?)?\s/);
		if (q && model) ten.add(q[1]);
	}
	return ten;
}

function sqlChen(chu) {
	const ra = [];
	const mau =
		/insert\s+into\s+(?:"?public"?\s*\.\s*)?"?deal"?(?=[\s(;`'"]|$)/gi;
	for (const k of chu.matchAll(mau)) {
		const sau = chu.slice(k.index + k[0].length).replace(/^\s+/, "");
		const dong = chu.slice(0, k.index).split("\n").length;
		if (!sau.startsWith("(")) {
			ra.push({ dong, loi: "chen tho khong liet cot" });
			continue;
		}
		const cot = sau
			.slice(1, sau.indexOf(")"))
			.split(",")
			.map((c) => c.trim().replace(/^"|"$/g, "").toLowerCase());
		ra.push({
			dong,
			loi: cot.includes("stage") ? null : "chen tho thieu stage",
		});
	}
	return ra;
}

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

function cauHinhGoi(thu) {
	const tep = path.join(thu, "tsconfig.json");
	if (!existsSync(tep)) return MAC_DINH;
	const doc = ts.getParsedCommandLineOfConfigFile(
		tep,
		{},
		{ ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
	);
	return doc ? { ...doc.options, noEmit: true } : MAC_DINH;
}

function quet(goc) {
	const quanHe = quanHeDeal(path.join(goc, "packages/db/prisma/schema.prisma"));
	const coThe = new RegExp(
		`\\.deal\\b|\\b(${[...quanHe].join("|")})\\s*:|insert\\s+into`,
		"i",
	);
	const chuoiTao = new RegExp(
		`\\.deal\\.(create|createMany|createManyAndReturn|upsert)\\(|\\b(${[...quanHe].join("|")})\\s*:\\s*\\{\\s*(create|createMany|connectOrCreate)\\b`,
		"g",
	);
	const tatCa = execFileSync(
		"git",
		["-C", goc, "ls-files", "--", "apps", "packages"],
		{ encoding: "utf8" },
	)
		.split("\n")
		.filter((t) => DUOI.test(t) && !BO_QUA.some((r) => r.test(t)));
	const theoGoi = new Map();
	for (const t of tatCa) {
		if (!coThe.test(readFileSync(path.join(goc, t), "utf8"))) continue;
		const goi = t.split("/").slice(0, 2).join("/");
		theoGoi.set(goi, [...(theoGoi.get(goi) ?? []), t]);
	}
	const thieu = [];
	let diem = 0;
	let doiTuong = 0;
	let sql = 0;
	let chuoi = 0;
	for (const [goi, tep] of theoGoi) {
		const tuyet = tep.map((t) => path.join(goc, t));
		const chuongTrinh = ts.createProgram(
			tuyet,
			cauHinhGoi(path.join(goc, goi)),
		);
		const kiem = chuongTrinh.getTypeChecker();
		for (const f of tuyet) {
			const nguon = chuongTrinh.getSourceFile(f);
			if (!nguon) continue;
			const tuongDoi = path.relative(goc, f);
			const chu = nguon.getFullText();
			chuoi += (chu.match(chuoiTao) ?? []).length;
			for (const s of sqlChen(chu)) {
				sql += 1;
				if (s.loi) thieu.push(`THIEU ${tuongDoi}:${s.dong} ${s.loi}`);
			}
			const dongCua = (nut) =>
				nguon.getLineAndCharacterOfPosition(nut.getStart()).line + 1;
			const kiemKieu = (kieu, nut) => {
				doiTuong += 1;
				const khoa =
					kieu?.getProperty("stage") ?? kieu?.getProperty("giaiDoan");
				if (!khoa)
					thieu.push(`THIEU ${tuongDoi}:${dongCua(nut)} khong gan stage`);
				else if (coUndefined(kiem.getTypeOfSymbolAtLocation(khoa, nut))) {
					thieu.push(
						`THIEU ${tuongDoi}:${dongCua(nut)} stage co the undefined`,
					);
				}
			};
			const giaTri = (doi, ten) => {
				if (!doi || !ts.isObjectLiteralExpression(doi)) return undefined;
				for (const p of doi.properties) {
					if (ts.isPropertyAssignment(p) && p.name.getText() === ten)
						return p.initializer;
					if (ts.isShorthandPropertyAssignment(p) && p.name.getText() === ten)
						return p.name;
				}
				return undefined;
			};
			const motHayNhieu = (gt) => {
				if (!gt) return;
				if (ts.isArrayLiteralExpression(gt)) {
					for (const e of gt.elements) kiemKieu(kiem.getTypeAtLocation(e), e);
					return;
				}
				const kieu = kiem.getTypeAtLocation(gt);
				if (kiem.isArrayType(kieu))
					kiemKieu(kiem.getTypeArguments(kieu)[0], gt);
				else kiemKieu(kieu, gt);
			};
			const trongDelegate = (nut) => {
				for (let cha = nut.parent; cha; cha = cha.parent) {
					if (
						ts.isCallExpression(cha) &&
						ts.isPropertyAccessExpression(cha.expression) &&
						tenKieu(kiem.getTypeAtLocation(cha.expression.expression)).some(
							(t) => /Delegate$/.test(t),
						)
					)
						return true;
				}
				return false;
			};
			const di = (nut) => {
				if (
					ts.isCallExpression(nut) &&
					ts.isPropertyAccessExpression(nut.expression) &&
					PHUONG_THUC.has(nut.expression.name.text)
				) {
					const nhan = kiem.getTypeAtLocation(nut.expression.expression);
					if (tenKieu(nhan).some((t) => t === "DealDelegate")) {
						diem += 1;
						const doi = nut.arguments[0];
						if (nut.expression.name.text === "upsert")
							motHayNhieu(giaTri(doi, "create"));
						else motHayNhieu(giaTri(doi, "data"));
					}
				}
				if (
					ts.isPropertyAssignment(nut) &&
					quanHe.has(nut.name.getText()) &&
					ts.isObjectLiteralExpression(nut.initializer) &&
					trongDelegate(nut)
				) {
					const long = nut.initializer;
					if (LONG.some((k) => giaTri(long, k))) {
						diem += 1;
						motHayNhieu(giaTri(long, "create"));
						motHayNhieu(giaTri(giaTri(long, "createMany"), "data"));
						const noi = giaTri(long, "connectOrCreate");
						if (noi && ts.isArrayLiteralExpression(noi))
							for (const e of noi.elements) motHayNhieu(giaTri(e, "create"));
						else if (noi) motHayNhieu(giaTri(noi, "create"));
					}
				}
				ts.forEachChild(nut, di);
			};
			di(nguon);
		}
	}
	return { diem, doiTuong, sql, chuoi, thieu };
}

const KIEU_GIA = `
export type DealCreateInput = { name: string; stage?: string; companyId?: string };
export type DealUncheckedCreateInput = { name: string; stage?: string; companyId: string };
export type DealCreateManyInput = { name: string; stage?: string };
export type DealCreateWithoutCompanyInput = { name: string; stage?: string };
type Long = { create?: DealCreateWithoutCompanyInput | DealCreateWithoutCompanyInput[]; createMany?: { data: DealCreateWithoutCompanyInput[] }; connectOrCreate?: { where: { id: string }; create: DealCreateWithoutCompanyInput } };
export interface CompanyDelegate { create(a: { data: { name: string; deals?: Long } }): void }
export interface UserDelegate { create(a: { data: { name: string; ownedDeals?: Long } }): void }
export interface ActivityDelegate { create(a: { data: { type: string; deal?: { create?: DealCreateWithoutCompanyInput } } }): void }
export interface DealDelegate {
	create<T extends { data: DealCreateInput | DealUncheckedCreateInput }>(a: T): void;
	createMany(a: { data: DealCreateManyInput[] }): void;
	upsert(a: { where: { id: string }; update: { stage?: string }; create: DealCreateInput | DealUncheckedCreateInput }): void;
}
export declare const db: {
	deal: DealDelegate;
	company: CompanyDelegate;
	user: UserDelegate;
	activity: ActivityDelegate;
	$executeRawUnsafe(q: string): void;
};
`;

const SCHEMA_GIA =
	"model User {\n  ownedDeals Deal[]\n}\nmodel Company {\n  deals Deal[]\n}\nmodel Activity {\n  deal Deal? @relation\n}\n";

const CA_DO = {
	"goi-thang": ['db.deal.create({ data: { name: "x", companyId: "c" } });', 2],
	"long-deals": [
		'db.company.create({ data: { name: "c", deals: { create: [{ name: "x" }] } } });',
		2,
	],
	"long-ownedDeals": [
		'db.user.create({ data: { name: "u", ownedDeals: { create: { name: "x" } } } });',
		2,
	],
	"long-deal-don": [
		'db.activity.create({ data: { type: "NOTE", deal: { create: { name: "x" } } } });',
		2,
	],
	"create-many": ['db.deal.createMany({ data: [{ name: "x" }] });', 2],
	"connect-or-create": [
		'db.company.create({ data: { name: "c", deals: { connectOrCreate: { where: { id: "1" }, create: { name: "x" } } } } });',
		2,
	],
	"upsert-chi-update": [
		'db.deal.upsert({ where: { id: "1" }, update: { stage: "s" }, create: { name: "x", companyId: "c" } });',
		2,
	],
	"bi-danh": [
		'const d = db.deal;\nd.create({ data: { name: "x", companyId: "c" } });',
		3,
	],
	"bien-co-kieu": [
		'import type { DealUncheckedCreateInput } from "./kieu";\nconst data: DealUncheckedCreateInput = { name: "x", companyId: "c" };\ndb.deal.create({ data });',
		4,
	],
	"stage-tuy-chon": [
		'export function f(v: { stage?: string }) {\n\tdb.deal.create({ data: { name: "x", companyId: "c", stage: v.stage } });\n}',
		3,
	],
	"sql-chu-thuong": [
		"db.$executeRawUnsafe(`insert into deal (id, name) values (1, 2)`);",
		2,
	],
	"sql-public": [
		'db.$executeRawUnsafe(`INSERT INTO "public"."deal" ("id", "name") VALUES (1, 2)`);',
		2,
	],
	"sql-cot-gan-ten": [
		'db.$executeRawUnsafe(`INSERT INTO "deal" ("id", "name", "stageChangedAt") VALUES (1, 2, 3)`);',
		2,
	],
	"sql-khong-liet-cot": [
		"db.$executeRawUnsafe(`INSERT INTO deal SELECT * FROM deal_cu`);",
		2,
	],
};
const CA_SCRIPTS = [
	'db.deal.create({ data: { name: "x", companyId: "c" } });',
	2,
];
const CA_XANH =
	'db.deal.create({ data: { name: "x", companyId: "c", stage: "s" } });\ndb.$executeRawUnsafe(`INSERT INTO "deal" ("id", "stage") VALUES (1, 2)`);\nexport const chu = { deal: { create: "Tao thoa thuan" }, deals: { create: "Tao" } };';

function banTuThu(maNguon, thuMuc = "src") {
	const goc = mkdtempSync(path.join(tmpdir(), "gmd-tao-"));
	const goi = path.join(goc, "packages", "gia");
	mkdirSync(path.join(goi, "src"), { recursive: true });
	mkdirSync(path.join(goi, thuMuc), { recursive: true });
	mkdirSync(path.join(goc, "packages", "db", "prisma"), { recursive: true });
	writeFileSync(
		path.join(goc, "packages", "db", "prisma", "schema.prisma"),
		SCHEMA_GIA,
	);
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
	const tuong = thuMuc === "src" ? "./kieu" : "../src/kieu";
	writeFileSync(
		path.join(goi, thuMuc, "ca.ts"),
		`import { db } from "${tuong}";\n${maNguon.replace("./kieu", tuong)}\n`,
	);
	execFileSync("git", ["init", "-q"], { cwd: goc });
	execFileSync("git", ["add", "-A"], { cwd: goc });
	return goc;
}

function thuMot(ten, ma, dong, thuMuc, loi) {
	const goc = banTuThu(ma, thuMuc);
	try {
		const r = quet(goc);
		const mong = `packages/gia/${thuMuc}/ca.ts:${dong} `;
		if (r.thieu.some((t) => t.startsWith(`THIEU ${mong}`))) return true;
		loi.push(
			`tu-thu: dang ${ten} lot — can THIEU ${mong}, duoc ${JSON.stringify(r.thieu)}`,
		);
		return false;
	} finally {
		rmSync(goc, { recursive: true, force: true });
	}
}

if (process.argv.includes("--tu-thu")) {
	let dung = 0;
	const loi = [];
	for (const [ten, [ma, dong]] of Object.entries(CA_DO))
		if (thuMot(ten, ma, dong, "src", loi)) dung += 1;
	if (thuMot("ngoai-include", CA_SCRIPTS[0], CA_SCRIPTS[1], "scripts", loi))
		dung += 1;
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
	const tong = Object.keys(CA_DO).length + 2;
	console.log(`tu-thu ${dung}/${tong}`);
	for (const l of loi) console.error(l);
	process.exit(dung === tong ? 0 : 2);
}

const r = quet(GOC);
console.log(
	`${r.diem} diem tao, ${r.doiTuong} doi tuong tao thoa thuan, ${r.sql} lenh SQL, ${r.chuoi} lan khop chuoi`,
);
const loi = [...r.thieu];
if (r.doiTuong === 0)
	loi.push("quet rong: khong thay doi tuong tao thoa thuan nao");
if (r.diem < r.chuoi)
	loi.push(`kiem ke lech: ${r.diem} diem tao < ${r.chuoi} lan khop chuoi`);
for (const l of loi) console.error(l);
process.exit(loi.length === 0 ? 0 : 1);
