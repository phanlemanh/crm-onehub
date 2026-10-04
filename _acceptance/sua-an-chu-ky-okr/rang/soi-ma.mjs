import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ts = createRequire(import.meta.url)("typescript");

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const LOAI_TRU = new Set([
	"node_modules",
	".next",
	"dist",
	"build",
	"generated",
	".turbo",
	".eve",
]);
const THU_MUC_THU = new Set(["test", "tests", "__tests__"]);
const LA_THU = /\.(spec|test|dom)\.(ts|tsx|mts|mjs|js)$/;

const THU_MUC_QUET = ["apps/api/src", "packages/db/src", "apps/agent/agent"];
const DANH_SACH = "_acceptance/sua-an-chu-ky-okr/rang/noi-doc-chu-ky.json";
const DINH_DANH_HIEN = "KY_CON_HIEN";
const GOI_DOC_KY = new Set(["findMany", "findFirst", "count", "groupBy"]);
const CHI_CHON = new Set(["select", "include"]);
const CHI_THEO_ID =
	/WHERE\s+id\s*=\s*(\?|ANY\(\?\))(\s+ORDER\s+BY\s+id)?(\s+FOR\s+[A-Z ]+)?\s*$/i;

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
};

const tuongDoi = (p) => (p.startsWith(GOC) ? p.slice(GOC.length + 1) : p);

function diCay(thuMuc, ra) {
	if (!existsSync(thuMuc)) return ra;
	for (const ten of readdirSync(thuMuc)) {
		if (LOAI_TRU.has(ten) || ten.startsWith(".next") || THU_MUC_THU.has(ten))
			continue;
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) diCay(duong, ra);
		else if (/\.ts$/.test(ten) && !LA_THU.test(ten)) ra.push(duong);
	}
	return ra;
}

function cay(duong, chu) {
	return ts.createSourceFile(
		duong,
		chu,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS,
	);
}

const dongCua = (sf, n) =>
	sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;

const laChuoi = (n) =>
	ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n);

const tenKhoa = (p) => {
	const t = p.name;
	if (!t) return null;
	if (ts.isIdentifier(t) || ts.isStringLiteral(t)) return t.text;
	if (ts.isComputedPropertyName(t) && laChuoi(t.expression))
		return t.expression.text;
	return null;
};

const tenThanhVien = (e) => {
	if (ts.isIdentifier(e)) return e.text;
	if (ts.isPropertyAccessExpression(e)) return e.name.text;
	if (ts.isElementAccessExpression(e) && laChuoi(e.argumentExpression))
		return e.argumentExpression.text;
	return null;
};

const laKhoa = (n, ten) =>
	(ts.isPropertyAssignment(n) || ts.isShorthandPropertyAssignment(n)) &&
	tenKhoa(n) === ten;

function hamBao(n) {
	for (let p = n.parent; p; p = p.parent) {
		if (
			(ts.isFunctionDeclaration(p) || ts.isMethodDeclaration(p)) &&
			p.name &&
			ts.isIdentifier(p.name)
		)
			return p.name.text;
		if (
			ts.isPropertyDeclaration(p) &&
			p.name &&
			ts.isIdentifier(p.name) &&
			p.initializer &&
			(ts.isArrowFunction(p.initializer) ||
				ts.isFunctionExpression(p.initializer))
		)
			return p.name.text;
		if (
			ts.isVariableDeclaration(p) &&
			ts.isIdentifier(p.name) &&
			p.parent?.parent?.parent &&
			ts.isSourceFile(p.parent.parent.parent)
		)
			return p.name.text;
	}
	return "(tệp)";
}

function chiChon(giaTri) {
	if (!ts.isObjectLiteralExpression(giaTri)) return false;
	const khoa = giaTri.properties.map(tenKhoa);
	return khoa.length > 0 && khoa.every((k) => k !== null && CHI_CHON.has(k));
}

function khoaTrongObject(o) {
	return o.properties.map(tenKhoa).filter((k) => k !== null);
}

const laKy = (n) => ts.isIdentifier(n) && n.text === DINH_DANH_HIEN;

const boVo = (n) => {
	let cur = n;
	while (
		ts.isParenthesizedExpression(cur) ||
		ts.isAsExpression(cur) ||
		ts.isSatisfiesExpression(cur) ||
		ts.isNonNullExpression(cur)
	)
		cur = cur.expression;
	return cur;
};

function giuKy(n) {
	const v = boVo(n);
	if (laKy(v)) return true;
	if (ts.isArrayLiteralExpression(v)) return v.elements.some(giuKy);
	if (!ts.isObjectLiteralExpression(v)) return false;
	return v.properties.some((p) =>
		ts.isSpreadAssignment(p)
			? giuKy(p.expression)
			: ts.isPropertyAssignment(p) &&
				tenKhoa(p) === "AND" &&
				giuKy(p.initializer),
	);
}

function coCycleGiuKy(n) {
	const v = boVo(n);
	if (ts.isArrayLiteralExpression(v)) return v.elements.some(coCycleGiuKy);
	if (!ts.isObjectLiteralExpression(v)) return false;
	return v.properties.some(
		(p) =>
			ts.isPropertyAssignment(p) &&
			((tenKhoa(p) === "cycle" && giuKy(p.initializer)) ||
				(tenKhoa(p) === "AND" && coCycleGiuKy(p.initializer))),
	);
}

function leoQuaAnd(thuocTinh) {
	let cur = thuocTinh;
	for (let buoc = 0; buoc < 12; buoc += 1) {
		const o = cur.parent;
		if (!o || !ts.isObjectLiteralExpression(o)) return false;
		if (coCycleGiuKy(o)) return true;
		let cha = o.parent;
		if (cha && ts.isArrayLiteralExpression(cha)) cha = cha.parent;
		if (cha && ts.isPropertyAssignment(cha) && tenKhoa(cha) === "AND")
			cur = cha;
		else return false;
	}
	return false;
}

function whereCua(callNode) {
	const doi = callNode.arguments[0];
	if (!doi || !ts.isObjectLiteralExpression(doi)) return null;
	const where = doi.properties.find((p) => laKhoa(p, "where"));
	return where && ts.isPropertyAssignment(where) ? where.initializer : null;
}

function theoId(callNode) {
	const where = whereCua(callNode);
	if (!where || !ts.isObjectLiteralExpression(where)) return false;
	if (where.properties.length !== 1) return false;
	const [id] = where.properties;
	if (!ts.isPropertyAssignment(id) || tenKhoa(id) !== "id") return false;
	const v = boVo(id.initializer);
	if (!ts.isObjectLiteralExpression(v)) return true;
	const khoa = v.properties.map(tenKhoa);
	return khoa.length === 1 && khoa[0] === "in";
}

function vanBanQueryRaw(mau) {
	if (ts.isNoSubstitutionTemplateLiteral(mau)) return mau.text;
	return (
		mau.head.text + mau.templateSpans.map((s) => `?${s.literal.text}`).join("")
	);
}

function vanBanGoi(arg) {
	const v = boVo(arg);
	if (laChuoi(v)) return v.text;
	if (ts.isTemplateExpression(v)) return vanBanQueryRaw(v);
	if (ts.isTaggedTemplateExpression(v)) return vanBanQueryRaw(v.template);
	return arg.getText();
}

function soiTep(tep, duong, ra) {
	const sf = cay(duong, readFileSync(duong, "utf8"));
	const ghi = (n, loai, ok, laTheoId = false) => {
		ra.push({
			tep,
			ham: hamBao(n),
			loai,
			dong: dongCua(sf, n),
			ok: laTheoId ? null : ok,
			theoId: laTheoId,
		});
	};
	const laNgayKy = (c) =>
		(ts.isPropertyAssignment(c) || ts.isShorthandPropertyAssignment(c)) &&
		(tenKhoa(c) === "startsOn" || tenKhoa(c) === "endsOn");
	const raw = (n, chu) => {
		if (chu.includes("okrCycle") && !CHI_THEO_ID.test(chu.trim()))
			ghi(n, "$queryRaw okrCycle", false);
	};
	const di = (n) => {
		if (ts.isPropertyAssignment(n) || ts.isShorthandPropertyAssignment(n)) {
			const khoa = tenKhoa(n);
			const giaTri = ts.isPropertyAssignment(n) ? n.initializer : null;
			if (khoa === "cycle") {
				const laChon =
					giaTri !== null &&
					(giaTri.kind === ts.SyntaxKind.TrueKeyword ||
						giaTri.kind === ts.SyntaxKind.FalseKeyword ||
						chiChon(giaTri));
				const ok = (giaTri !== null && giuKy(giaTri)) || leoQuaAnd(n);
				if (!laChon) ghi(n, "cycle:", ok);
				if (giaTri && ts.isObjectLiteralExpression(giaTri)) {
					const duoi = (c) => {
						if (laNgayKy(c)) ghi(c, `cycle.${tenKhoa(c)}`, ok);
						ts.forEachChild(c, duoi);
					};
					duoi(giaTri);
				}
			}
			if (
				khoa === "cycleId" &&
				giaTri &&
				ts.isObjectLiteralExpression(giaTri) &&
				khoaTrongObject(giaTri).some((k) => k === "in" || k === "notIn")
			)
				ghi(n, "cycleId: { in }", leoQuaAnd(n));
		}
		if (ts.isCallExpression(n)) {
			const callee = boVo(n.expression);
			if (
				ts.isPropertyAccessExpression(callee) ||
				ts.isElementAccessExpression(callee)
			) {
				const ham = tenThanhVien(callee);
				if (
					ham !== null &&
					GOI_DOC_KY.has(ham) &&
					tenThanhVien(boVo(callee.expression)) === "okrCycle"
				) {
					const where = whereCua(n);
					ghi(n, `okrCycle.${ham}`, where !== null && giuKy(where), theoId(n));
				}
				if (ham === "$queryRaw" || ham === "$queryRawUnsafe")
					if (n.arguments[0]) raw(n, vanBanGoi(n.arguments[0]));
			}
		}
		if (ts.isTaggedTemplateExpression(n)) {
			const ham = tenThanhVien(boVo(n.tag));
			if (ham === "$queryRaw" || ham === "$queryRawUnsafe")
				raw(n, vanBanQueryRaw(n.template));
		}
		ts.forEachChild(n, di);
	};
	di(sf);
}

function danhSachTep(thay = new Map(), them = new Map()) {
	const ra = [];
	for (const thuMuc of THU_MUC_QUET)
		for (const duong of diCay(join(GOC, thuMuc), [])) {
			const tep = tuongDoi(duong);
			ra.push({ tep, duong: thay.get(tep) ?? duong });
		}
	for (const [tep, duong] of them) ra.push({ tep, duong });
	return ra;
}

function docDanhSach() {
	const j = JSON.parse(readFileSync(join(GOC, DANH_SACH), "utf8"));
	return { loc: j.loc, mien: j.mien };
}

function caKyConHien(tepList, locThem = []) {
	const hong = [];
	const chamNoi = [];
	for (const { tep, duong } of tepList) soiTep(tep, duong, chamNoi);

	const { loc: locGoc, mien } = docDanhSach();
	const loc = [...locGoc, ...locThem];
	const khoaHam = (t, h) => `${t}\t${h}`;
	const soiDuoc = new Map();
	for (const c of chamNoi) {
		const k = khoaHam(c.tep, c.ham);
		if (!soiDuoc.has(k)) soiDuoc.set(k, []);
		soiDuoc.get(k).push(c);
	}
	const tepSoi = new Set(chamNoi.map((c) => c.tep));
	const mienCaTep = new Set(
		mien.filter((m) => m.ham === "*").map((m) => m.tep),
	);
	const daKhai = new Set([
		...loc.map((l) => khoaHam(l.tep, l.ham)),
		...mien.filter((m) => m.ham !== "*").map((m) => khoaHam(m.tep, m.ham)),
	]);

	for (const l of loc)
		if (mien.some((m) => m.tep === l.tep && (m.ham === l.ham || m.ham === "*")))
			hong.push(`${l.tep} ${l.ham} khai ở cả lọc lẫn miễn`);

	for (const [k, hits] of soiDuoc) {
		const [tep, ham] = k.split("\t");
		if (!daKhai.has(k) && !mienCaTep.has(tep))
			hong.push(
				`${tep} ${ham} chưa khai (${hits.map((h) => `${h.loai}@${h.dong}`).join(", ")})`,
			);
	}
	for (const d of daKhai) {
		const [tep, ham] = d.split("\t");
		if (!soiDuoc.has(d))
			hong.push(`${tep} ${ham} khai nhưng không còn chỗ đọc chu kỳ nào`);
	}
	for (const t of mienCaTep)
		if (!tepSoi.has(t))
			hong.push(`${t} khai miễn cả tệp nhưng không còn chỗ đọc chu kỳ nào`);

	for (const l of loc) {
		const hits = soiDuoc.get(khoaHam(l.tep, l.ham)) ?? [];
		const canLoc = hits.filter((h) => !h.theoId);
		if (hits.length > 0 && canLoc.length === 0)
			hong.push(`${l.tep} ${l.ham} khai lọc nhưng chỉ đọc theo id`);
		for (const h of canLoc)
			if (!h.ok)
				hong.push(
					`${l.tep} ${l.ham} thiếu ${DINH_DANH_HIEN} (${h.loai}@${h.dong})`,
				);
	}

	console.log(`tep da quet: ${tepList.length}`);
	console.log(`cho doc chu ky soi duoc: ${soiDuoc.size} (tep, ham)`);
	for (const [k, hits] of [...soiDuoc].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
		const [tep, ham] = k.split("\t");
		const nhom = loc.some((l) => l.tep === tep && l.ham === ham)
			? "loc "
			: "mien";
		const chiTiet = hits
			.map(
				(h) =>
					`${h.loai}@${h.dong}${h.theoId ? " theo-id" : h.ok ? " co-ky-con-hien" : ""}`,
			)
			.join("; ");
		console.log(`  [${nhom}] ${tep} ${ham} :: ${chiTiet}`);
	}
	console.log(
		`khai bao: loc ${loc.length}, mien ${mien.length} (${mienCaTep.size} ca tep)`,
	);
	return { hong, soDaSoi: soiDuoc.size };
}

function inVaThoat(hong) {
	for (const h of hong) console.log(`HONG ${h}`);
	console.log(`vi pham: ${hong.length}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

function batDo(nhan, hong, moTa) {
	const bat = hong.some((h) => moTa.every((m) => h.includes(m)));
	console.log(
		`${bat ? "bat " : "LOT "} ${nhan}: can HONG chua ${moTa.join(" + ")}`,
	);
	return bat;
}

const CA_GIA = [
	{
		ten: "b tep gia findMany cycle.endsOn",
		tep: "gia-tim-ky-theo-ngay.ts",
		ham: "timKyConChay",
		loc: false,
		ma: [
			"export async function timKyConChay(db: any, now: Date) {",
			"\treturn db.okrObjective.findMany({",
			"\t\twhere: { cycle: { endsOn: { gte: now } } },",
			"\t});",
			"}",
		],
		mong: "chưa khai",
	},
	{
		ten: "c tep gia okrKeyResult objective.cycle",
		tep: "gia-doc-kr-theo-ky.ts",
		ham: "docKrTheoKy",
		loc: false,
		ma: [
			"export async function docKrTheoKy(db: any) {",
			"\treturn db.okrKeyResult.findMany({",
			"\t\twhere: { objective: { cycle: { phase: 'dang-chay' } } },",
			"\t});",
			"}",
		],
		mong: "chưa khai",
	},
	{
		ten: "d khoa cycle viet tat",
		tep: "gia-cycle-viet-tat.ts",
		ham: "timNganGon",
		loc: false,
		ma: [
			"export async function timNganGon(db: any) {",
			"\tconst cycle = { phase: 'dang-chay' };",
			"\treturn db.okrObjective.findMany({ where: { cycle } });",
			"}",
		],
		mong: "chưa khai",
	},
	{
		ten: "d2 khoa cycle viet tat trong ham da khai loc",
		tep: "gia-cycle-viet-tat-loc.ts",
		ham: "timNganGonLoc",
		loc: true,
		ma: [
			"export async function timNganGonLoc(db: any) {",
			"\tconst cycle = { phase: 'dang-chay' };",
			"\treturn db.okrObjective.findMany({ where: { cycle } });",
			"}",
		],
		mong: "thiếu KY_CON_HIEN",
	},
	{
		ten: "e KY_CON_HIEN dat sai cho (cycle khac, va trong select)",
		tep: "gia-ky-dat-sai-cho.ts",
		ham: "timKyDatSai",
		loc: true,
		ma: [
			"import { KY_CON_HIEN } from '@crm/db/okr-chu-ky-hien';",
			"export async function timKyDatSai(db: any) {",
			"\treturn db.okrObjective.findMany({",
			"\t\twhere: {",
			"\t\t\tcycle: { phase: 'x' },",
			"\t\t\tkeyResults: { some: { objective: { cycle: KY_CON_HIEN } } },",
			"\t\t},",
			"\t});",
			"}",
		],
		mong: "thiếu KY_CON_HIEN",
	},
	{
		ten: "e2 KY_CON_HIEN chi nam trong select cua okrCycle",
		tep: "gia-ky-trong-select.ts",
		ham: "timKySelect",
		loc: true,
		ma: [
			"import { KY_CON_HIEN } from '@crm/db/okr-chu-ky-hien';",
			"export async function timKySelect(db: any, phase: string) {",
			"\treturn db.okrCycle.findMany({",
			"\t\twhere: { phase },",
			"\t\tselect: { anLuc: KY_CON_HIEN },",
			"\t});",
			"}",
		],
		mong: "thiếu KY_CON_HIEN",
	},
	{
		ten: "f where co id va phase",
		tep: "gia-id-va-phase.ts",
		ham: "timIdVaPha",
		loc: true,
		ma: [
			"export async function timIdVaPha(db: any, ids: string[]) {",
			"\treturn db.okrCycle.findMany({",
			"\t\twhere: { id: { in: ids }, phase: 'dang-chay' },",
			"\t});",
			"}",
		],
		mong: "thiếu KY_CON_HIEN",
	},
	{
		ten: "f2 where co id va OR",
		tep: "gia-id-va-or.ts",
		ham: "timIdVaOr",
		loc: true,
		ma: [
			"export async function timIdVaOr(db: any, phase: string) {",
			"\treturn db.okrCycle.findMany({",
			"\t\twhere: { id: 'a', OR: [{ phase }] },",
			"\t});",
			"}",
		],
		mong: "thiếu KY_CON_HIEN",
	},
	{
		ten: "f3 where co id va an",
		tep: "gia-id-va-an.ts",
		ham: "timIdVaAn",
		loc: true,
		ma: [
			"export async function timIdVaAn(db: any) {",
			"\treturn db.okrCycle.findMany({",
			"\t\twhere: { id: 'a', anLuc: { not: null } },",
			"\t});",
			"}",
		],
		mong: "thiếu KY_CON_HIEN",
	},
	{
		ten: "f4 where id notIn",
		tep: "gia-id-not-in.ts",
		ham: "timIdNotIn",
		loc: true,
		ma: [
			"export async function timIdNotIn(db: any, ids: string[]) {",
			"\treturn db.okrCycle.findMany({ where: { id: { notIn: ids } } });",
			"}",
		],
		mong: "thiếu KY_CON_HIEN",
	},
	{
		ten: "g truy cap phan tu okrCycle",
		tep: "gia-truy-cap-phan-tu.ts",
		ham: "timPhanTu",
		loc: false,
		ma: [
			"export async function timPhanTu(tx: any) {",
			"\treturn tx['okrCycle'].findMany({ where: { phase: 'dang-chay' } });",
			"}",
		],
		mong: "chưa khai",
	},
	{
		ten: "h queryRawUnsafe",
		tep: "gia-query-raw-unsafe.ts",
		ham: "timRawKhongAn",
		loc: false,
		ma: [
			"export async function timRawKhongAn(db: any) {",
			"\treturn db.$queryRawUnsafe('SELECT id FROM \"okrCycle\" WHERE phase = 1');",
			"}",
		],
		mong: "chưa khai",
	},
	{
		ten: "h2 queryRaw dang goi voi Prisma.sql",
		tep: "gia-query-raw-goi.ts",
		ham: "timRawGoi",
		loc: false,
		ma: [
			"export async function timRawGoi(db: any, Prisma: any) {",
			'\treturn db.$queryRaw(Prisma.sql`SELECT id FROM "okrCycle" WHERE phase = \u0024{1}`);',
			"}",
		],
		mong: "chưa khai",
	},
	{
		ten: "i cycleId notIn",
		tep: "gia-cycle-id-not-in.ts",
		ham: "timNotIn",
		loc: false,
		ma: [
			"export async function timNotIn(db: any, ids: string[]) {",
			"\treturn db.okrObjective.findMany({ where: { cycleId: { notIn: ids } } });",
			"}",
		],
		mong: "chưa khai",
	},
	{
		ten: "j khoa cycle tinh toan",
		tep: "gia-khoa-tinh-toan.ts",
		ham: "timKhoaTinhToan",
		loc: false,
		ma: [
			"export async function timKhoaTinhToan(db: any) {",
			"\treturn db.okrObjective.findMany({ where: { ['cycle']: { phase: 'x' } } });",
			"}",
		],
		mong: "chưa khai",
	},
];

async function chieuDoKyConHien() {
	const thuMuc = mkdtempSync(join(tmpdir(), "soi-ky-con-hien-"));
	const ketQua = [];
	let khongDo = null;
	try {
		const traoDoi = "apps/api/src/okr/okr-trao-doi.service.ts";
		const goc = readFileSync(join(GOC, traoDoi), "utf8");
		const banSao = goc.replace(", ...KY_CON_HIEN", "");
		if (banSao === goc || banSao.includes("...KY_CON_HIEN")) {
			khongDo = `khong go duoc ${DINH_DANH_HIEN} khoi ${traoDoi} de dung ca (a)`;
		} else {
			const tepA = join(thuMuc, "a-okr-trao-doi.service.ts");
			writeFileSync(tepA, banSao);
			const them = new Map();
			const locThem = [];
			const ca = [
				{
					nhan: "(a) okr-trao-doi.service.ts go KY_CON_HIEN",
					moTa: [traoDoi, "dieuKienChuyen", DINH_DANH_HIEN],
				},
			];
			for (const g of CA_GIA) {
				const ten = `apps/api/src/okr/${g.tep}`;
				const duong = join(thuMuc, g.tep);
				writeFileSync(duong, `${g.ma.join("\n")}\n`);
				them.set(ten, duong);
				if (g.loc) locThem.push({ tep: ten, ham: g.ham });
				ca.push({
					nhan: `(${g.ten})`,
					moTa: [ten, g.ham, g.mong],
				});
			}
			const { hong } = caKyConHien(
				danhSachTep(new Map([[traoDoi, tepA]]), them),
				locThem,
			);
			for (const h of hong) console.log(`HONG ${h}`);
			for (const c of ca) ketQua.push(batDo(c.nhan, hong, c.moTa));
		}
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
	if (khongDo !== null) {
		console.log(`KHONG DO DUOC: ${khongDo}`);
		process.exitCode = 2;
		return;
	}
	const bat = ketQua.filter(Boolean).length;
	console.log(`chieu do: ${bat}/${ketQua.length} ca do bi bat`);
	process.exitCode = bat === ketQua.length ? 1 : 0;
}

const MOC = "origin/onehub";
const MOC_GOP = "9ee65d12047522795b43ae1a1440bc2b227cb9b5";
let NEO = null;
function daGop() {
	NEO ??=
		spawnSync("git", [
			"-C",
			GOC,
			"merge-base",
			"--is-ancestor",
			MOC_GOP,
			"HEAD",
		]).status === 0;
	return NEO;
}
const daiSoSanh = () =>
	daGop() ? `${MOC_GOP}^1..${MOC_GOP}` : `${MOC}...HEAD`;
const VUNG_APP = /^apps\/app\/.+\.tsx$/;
const VUNG_MA =
	/^(apps|packages|scripts|_acceptance\/[^/]+\/rang)\/.+\.(ts|tsx|mts|mjs|js)$/;
const DAU_HIEU = [
	{ nhan: "<table>", mau: /<table\b/ },
	{ nhan: "<h1>", mau: /<h1\b/ },
	{ nhan: "<h2>", mau: /<h2\b/ },
	{ nhan: "size-2 rounded-full", mau: /size-2\s+rounded-full/ },
	{ nhan: "divide-y", mau: /divide-y\b/ },
	{
		nhan: "rounded-lg border",
		mau: /rounded-lg\s+border\b|\bborder\s+rounded-lg/,
	},
	{ nhan: "navigator.clipboard", mau: /navigator\.clipboard/ },
	{ nhan: "AlertDialog", mau: /AlertDialog/ },
];
const CHAN = new Set(["DialogFooter", "SheetFooter", "DrawerFooter"]);
const BOC = new Set(["DialogClose", "SheetClose", "DrawerClose"]);
const LA_HUY = /Huỷ|Hủy|\bhuy\b|\bcancel\b/i;
const DINH_DANH_MOT = [
	"viecChuKy",
	"suaChuKyInput",
	"KY_CON_HIEN",
	"QUAN_HE_GIU_CHU_KY",
];
const THU_MUC_CHU = "apps/app/lib/messages/";
const TEP_DOCS = "docs/api.md";
const TEN_DOCS = ["suaChuKy", "goChuKy", "anChuKy", "hienChuKy", "KY_CON_HIEN"];
const TEP_TU_DIEN = "CONTEXT.md";
const MUC_TU_DIEN = "**Chu kỳ**";
const CHU_TU_DIEN = ["ẩn", "gỡ"];

const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();

const cayMa = (duong, chu = readFileSync(duong, "utf8")) =>
	ts.createSourceFile(
		duong,
		chu,
		ts.ScriptTarget.Latest,
		true,
		/\.(tsx|jsx)$/.test(duong) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);

const dongViTri = (sf, pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;

const dongCuaChu = (chu, doan) =>
	chu.slice(0, chu.lastIndexOf(doan)).split("\n").length;

function chuThichTrong(sf) {
	const chu = sf.text;
	const gap = new Map();
	const them = (r) => {
		if (r) for (const c of r) gap.set(c.pos, c);
	};
	const di = (n) => {
		if (n.kind === ts.SyntaxKind.JsxText) return;
		them(ts.getLeadingCommentRanges(chu, n.pos));
		them(ts.getTrailingCommentRanges(chu, n.pos));
		for (const c of n.getChildren(sf)) di(c);
	};
	di(sf);
	return [...gap.values()]
		.sort((a, b) => a.pos - b.pos)
		.map((c) => ({
			dong: dongViTri(sf, c.pos),
			chu: chu.slice(c.pos, c.end).split("\n")[0].slice(0, 60),
		}));
}

const chuThichThem = (duong, ten, them) =>
	chuThichTrong(cayMa(duong))
		.filter((c) => them.has(c.dong))
		.map((c) => `chú thích mã: ${ten}:${c.dong} «${c.chu}»`);

function soiTepMoi(duong, ten) {
	const sf = cayMa(duong);
	const hong = [];
	const di = (n) => {
		if (
			ts.isTypeReferenceNode(n) &&
			n.typeName.getText(sf) === "Record" &&
			n.typeArguments?.length === 2 &&
			n.typeArguments[0].kind === ts.SyntaxKind.StringKeyword &&
			n.typeArguments[1].kind === ts.SyntaxKind.UnknownKeyword
		)
			hong.push(
				`Record<string, unknown>: ${ten}:${dongViTri(sf, n.getStart(sf))}`,
			);
		if (ts.isCallExpression(n)) {
			const e = n.expression;
			const la =
				(ts.isIdentifier(e) && e.text === "useEffect") ||
				(ts.isPropertyAccessExpression(e) && e.name.text === "useEffect");
			if (la)
				hong.push(`useEffect( trần: ${ten}:${dongViTri(sf, n.getStart(sf))}`);
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return hong;
}

const dauHieuVeTay = (chu, ten) =>
	DAU_HIEU.filter(({ mau }) => mau.test(chu)).map(
		({ nhan }) => `dấu hiệu vẽ tay: ${nhan} (${ten})`,
	);

const tenThe = (n) =>
	ts.isJsxElement(n)
		? n.openingElement.tagName.getText()
		: ts.isJsxSelfClosingElement(n)
			? n.tagName.getText()
			: null;

function nutHuy(duong, ten, them) {
	const sf = cayMa(duong);
	const hong = [];
	const dem = { chan: 0, huy: 0 };
	const soiChan = (chan) => {
		dem.chan += 1;
		const di = (n, boc) => {
			const the = tenThe(n);
			if (the === "Button" && ts.isJsxElement(n)) {
				const chu = n.children.map((c) => c.getText(sf)).join(" ");
				if (LA_HUY.test(chu)) {
					dem.huy += 1;
					const dong = dongViTri(sf, n.getStart(sf));
					if (!boc && them.has(dong))
						hong.push(`nút Huỷ không bọc DialogClose: ${ten}:${dong}`);
				}
			}
			const bocTiep = boc || (the !== null && BOC.has(the));
			ts.forEachChild(n, (c) => di(c, bocTiep));
		};
		ts.forEachChild(chan, (c) => di(c, false));
	};
	const tim = (n) => {
		if (ts.isJsxElement(n) && CHAN.has(tenThe(n))) soiChan(n);
		ts.forEachChild(n, tim);
	};
	tim(sf);
	return { hong, dem };
}

let GOC_SO = null;
function dongThem(t, duong) {
	GOC_SO ??= daGop()
		? git("rev-parse", `${MOC_GOP}^1`)
		: git("merge-base", "HEAD", MOC);
	const thu = mkdtempSync(join(tmpdir(), "soi-dong-them-"));
	try {
		const cu = join(thu, "cu");
		const r0 = spawnSync("git", ["-C", GOC, "show", `${GOC_SO}:${t}`], {
			encoding: "utf8",
			maxBuffer: 64 * 1024 * 1024,
		});
		writeFileSync(cu, r0.status === 0 ? r0.stdout : "");
		const r = spawnSync(
			"git",
			["diff", "--no-index", "-U0", "--no-color", cu, duong],
			{ encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
		);
		const them = new Set();
		for (const m of (r.stdout ?? "").matchAll(
			/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm,
		)) {
			const dau = Number(m[1]);
			const so = m[2] === undefined ? 1 : Number(m[2]);
			for (let k = 0; k < so; k += 1) them.add(dau + k);
		}
		return them;
	} finally {
		rmSync(thu, { recursive: true, force: true });
	}
}

const chuDong = (chu, them) =>
	chu
		.split("\n")
		.filter((_, k) => them.has(k + 1))
		.join("\n");

function goiKit() {
	return (
		process.env.CLAUDE_PLUGIN_ROOT ??
		execFileSync(
			"node",
			[
				join(GOC, "scripts", "resolve-plugin.mjs"),
				"--plugin",
				"acceptance-gate",
				"--require",
				"scripts/design-gate.mjs",
			],
			{ encoding: "utf8" },
		).trim()
	);
}

function tepDiff(loc) {
	return git(
		"diff",
		"--name-only",
		"--no-renames",
		`--diff-filter=${loc}`,
		daiSoSanh(),
	)
		.split("\n")
		.filter(Boolean);
}

function dinhNghiaTrenCung(sf) {
	const ra = [];
	for (const n of sf.statements) {
		const xuat = ts
			.getModifiers?.(n)
			?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
		if (!xuat) continue;
		if (ts.isFunctionDeclaration(n) && n.name)
			ra.push({ ten: n.name.text, dong: dongViTri(sf, n.getStart(sf)) });
		if (ts.isVariableStatement(n))
			for (const d of n.declarationList.declarations)
				if (ts.isIdentifier(d.name))
					ra.push({ ten: d.name.text, dong: dongViTri(sf, d.getStart(sf)) });
	}
	return ra;
}

function moiDinhDanhMotNoi() {
	const hong = [];
	const theoTen = new Map(DINH_DANH_MOT.map((t) => [t, []]));
	const tep = git(
		"ls-files",
		"--cached",
		"--others",
		"--exclude-standard",
		"--",
		"apps",
		"packages",
	)
		.split("\n")
		.filter(
			(t) =>
				/\.(ts|tsx|mts)$/.test(t) &&
				!t.split("/").some((p) => LOAI_TRU.has(p)) &&
				existsSync(join(GOC, t)),
		);
	for (const t of tep) {
		const chu = readFileSync(join(GOC, t), "utf8");
		if (!DINH_DANH_MOT.some((d) => chu.includes(d))) continue;
		for (const d of dinhNghiaTrenCung(cayMa(join(GOC, t), chu)))
			if (theoTen.has(d.ten)) theoTen.get(d.ten).push(`${t}:${d.dong}`);
	}
	console.log(
		`tep apps/ + packages/ (git ls-files) soi dinh nghia: ${tep.length}`,
	);
	for (const [ten, noi] of theoTen) {
		console.log(`dinh nghia ${ten}: ${noi.join(", ") || "(khong co)"}`);
		if (noi.length !== 1)
			hong.push(`${ten} phải định nghĩa đúng một chỗ (thấy ${noi.length})`);
	}
	return hong;
}

const laChuoiBo = (n) =>
	ts.isStringLiteral(n) ||
	ts.isNoSubstitutionTemplateLiteral(n) ||
	ts.isTemplateExpression(n);

function laTuCuaChu(sf, goc) {
	const ra = new Map();
	const di = (n, duong) => {
		const trong = boVo(n);
		if (ts.isObjectLiteralExpression(trong)) {
			for (const p of trong.properties)
				if (ts.isPropertyAssignment(p)) {
					const k = tenKhoa(p);
					if (k !== null) di(p.initializer, [...duong, k]);
				}
			return;
		}
		const than =
			ts.isArrowFunction(trong) && !ts.isBlock(trong.body)
				? boVo(trong.body)
				: trong;
		if (laChuoiBo(than))
			ra.set(duong.join("."), {
				chu: than.getText(sf).replace(/\s+/g, " "),
				dong: dongViTri(sf, than.getStart(sf)),
			});
	};
	di(goc, []);
	return ra;
}

function goiChuVaEn(duong) {
	const sf = cayMa(duong);
	const goc = {};
	for (const n of sf.statements)
		if (ts.isVariableStatement(n))
			for (const d of n.declarationList.declarations)
				if (
					ts.isIdentifier(d.name) &&
					(d.name.text === "vi" || d.name.text === "en") &&
					d.initializer
				)
					goc[d.name.text] = { sf, node: d.initializer };
	return goc.vi && goc.en
		? {
				vi: laTuCuaChu(sf, goc.vi.node),
				en: laTuCuaChu(sf, goc.en.node),
			}
		: null;
}

function chuViEnKhac(tepChu, them, duongCua) {
	const hong = [];
	let soMoi = 0;
	for (const t of tepChu) {
		const cap = goiChuVaEn(duongCua(t));
		if (!cap) continue;
		const tuNao = them.get(t);
		for (const [duong, v] of cap.vi) {
			if (!tuNao.has(v.dong)) continue;
			soMoi += 1;
			const e = cap.en.get(duong);
			if (!e) hong.push(`chữ mới thiếu bản en: ${t} ${duong}`);
			else if (e.chu === v.chu)
				hong.push(`chữ mới vi và en giống nhau: ${t} ${duong}`);
		}
	}
	console.log(`chu moi (vi) da doi voi en: ${soMoi}`);
	if (soMoi === 0 && tepChu.length > 0)
		hong.push("không tìm thấy chữ mới nào trong tệp chữ để soi");
	return hong;
}

function soiTaiLieu() {
	const hong = [];
	const api = readFileSync(join(GOC, TEP_DOCS), "utf8");
	for (const ten of TEN_DOCS)
		if (!api.includes(ten)) hong.push(`${TEP_DOCS} thiếu chữ ${ten}`);
	const tuDien = readFileSync(join(GOC, TEP_TU_DIEN), "utf8");
	const dau = tuDien.indexOf(`\n${MUC_TU_DIEN}`);
	if (dau === -1) hong.push(`${TEP_TU_DIEN} không có mục ${MUC_TU_DIEN}`);
	else {
		const cuoi = tuDien.indexOf("\n\n**", dau + 1 + MUC_TU_DIEN.length);
		const muc = tuDien.slice(dau, cuoi === -1 ? undefined : cuoi).toLowerCase();
		for (const chu of CHU_TU_DIEN)
			if (!muc.includes(chu))
				hong.push(`${TEP_TU_DIEN} mục ${MUC_TU_DIEN} thiếu chữ «${chu}»`);
	}
	console.log(
		`tai lieu: ${TEP_DOCS} (${TEN_DOCS.join(", ")}) · ${TEP_TU_DIEN} muc ${MUC_TU_DIEN} («${CHU_TU_DIEN.join("», «")}»)`,
	);
	return hong;
}

async function caThietKe(thay = new Map()) {
	console.log(`dai so sanh: ${daiSoSanh()} (--no-renames)`);
	const banGop = new Map();
	const thuGop = daGop() ? mkdtempSync(join(tmpdir(), "soi-ban-gop-")) : null;
	const moi = new Set(tepDiff("A"));
	const doi = tepDiff("AM").filter((t) =>
		thuGop ? true : existsSync(join(GOC, t)),
	);
	if (thuGop)
		doi.forEach((t, i) => {
			const thu = join(thuGop, String(i));
			mkdirSync(thu);
			const duong = join(thu, basename(t));
			writeFileSync(duong, `${git("show", `${MOC_GOP}:${t}`)}\n`);
			banGop.set(t, duong);
		});
	const duongCua = (t) => thay.get(t) ?? banGop.get(t) ?? join(GOC, t);
	const tenCua = (t) => thay.get(t) ?? t;
	const khongThu = (t) =>
		!t.split("/").some((p) => THU_MUC_THU.has(p)) && !LA_THU.test(t);
	const khongSinh = (t) => !t.split("/").some((p) => LOAI_TRU.has(p));
	const app = doi.filter((t) => VUNG_APP.test(t) && khongThu(t)).sort();
	const tepMa = doi.filter((t) => VUNG_MA.test(t) && khongSinh(t)).sort();
	const tepMoi = tepMa.filter((t) => moi.has(t));
	const tepChu = doi
		.filter(
			(t) =>
				t.startsWith(THU_MUC_CHU) && /\.ts$/.test(t) && !t.includes("/test/"),
		)
		.sort();
	const them = new Map(tepMa.map((t) => [t, dongThem(t, duongCua(t))]));
	for (const t of app) if (!them.has(t)) them.set(t, dongThem(t, duongCua(t)));

	console.log(`tep giao dien apps/app (${app.length}), proto tinh chung:`);
	for (const t of app)
		console.log(`  ${tenCua(t)}${moi.has(t) ? " (moi)" : ""}`);
	console.log(`tep ma soi chu thich tren dong them (${tepMa.length}):`);
	for (const t of tepMa)
		console.log(`  ${tenCua(t)}${moi.has(t) ? " (moi)" : ""}`);
	console.log(`tep moi soi Record / useEffect (${tepMoi.length}):`);
	for (const t of tepMoi) console.log(`  ${tenCua(t)}`);
	console.log(`tep chu vi/en (${tepChu.length}):`);
	for (const t of tepChu) console.log(`  ${tenCua(t)}`);

	const hong = [];
	const kit = app.length > 0 ? goiKit() : null;
	const demHuy = { chan: 0, huy: 0 };
	for (const t of app) {
		const r = spawnSync(
			"node",
			[
				join(kit, "scripts", "design-gate.mjs"),
				"--target",
				thay.has(t) || banGop.has(t) ? duongCua(t) : t,
				"--mode",
				"static",
			],
			{ cwd: GOC, encoding: "utf8" },
		);
		const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
		const p0 = Number(ra.match(/"p0_count":\s*(\d+)/)?.[1] ?? Number.NaN);
		if (r.status !== 0 || p0 !== 0)
			hong.push(`design-gate P0: ${tenCua(t)} (ma ${r.status}, p0 ${p0})`);
		const chu = readFileSync(duongCua(t), "utf8");
		const tuTruoc = dauHieuVeTay(chu, tenCua(t));
		const moiThem = dauHieuVeTay(chuDong(chu, them.get(t)), tenCua(t));
		hong.push(...moiThem);
		for (const h of tuTruoc)
			if (!moiThem.includes(h))
				console.log(`co tu truoc, dong cu khong tinh: ${h}`);
		const huy = nutHuy(duongCua(t), tenCua(t), them.get(t));
		hong.push(...huy.hong);
		demHuy.chan += huy.dem.chan;
		demHuy.huy += huy.dem.huy;
		console.log(
			`design-gate ${r.status === 0 && p0 === 0 ? "dat " : "HONG"} ${tenCua(t)} (p0 ${p0}; chan hop thoai ${huy.dem.chan}, nut huy ${huy.dem.huy})`,
		);
	}
	console.log(
		`chan hop thoai da soi: ${demHuy.chan} · nut Huy trong chan: ${demHuy.huy}`,
	);
	for (const t of tepMa)
		hong.push(...chuThichThem(duongCua(t), tenCua(t), them.get(t)));
	for (const t of tepMoi) hong.push(...soiTepMoi(duongCua(t), tenCua(t)));
	hong.push(...moiDinhDanhMotNoi());
	hong.push(...chuViEnKhac(tepChu, them, duongCua));
	hong.push(...soiTaiLieu());
	const soTep = new Set([...app, ...tepMa]).size;
	console.log(`tong tep da soi: ${soTep}`);
	if (thuGop) rmSync(thuGop, { recursive: true, force: true });
	return { hong, soTep };
}

async function chieuDoThietKe() {
	const nguon = tepDiff("AM").find(
		(t) =>
			VUNG_APP.test(t) &&
			!t.startsWith("apps/app/app/proto/") &&
			existsSync(join(GOC, t)) &&
			!t.includes("/test/"),
	);
	if (!nguon) {
		console.log(
			"KHONG DO DUOC: diff khong co tep giao dien apps/app nao de chep",
		);
		process.exitCode = 2;
		return;
	}
	const thuMuc = mkdtempSync(join(tmpdir(), "soi-thiet-ke-"));
	const tep = join(thuMuc, basename(nguon));
	const goc = readFileSync(join(GOC, nguon), "utf8");
	const banSao = `${goc}\n// x\nexport function HopThoaiGia() {\n\treturn (\n\t\t<DialogFooter>\n\t\t\t<Button variant="outline">Huỷ</Button>\n\t\t</DialogFooter>\n\t);\n}\n`;
	writeFileSync(tep, banSao);
	const dongChu = dongCuaChu(banSao, "\n// x\n") + 1;
	const dongNut = dongCuaChu(banSao, '<Button variant="outline">Huỷ</Button>');
	let kq;
	try {
		kq = await caThietKe(new Map([[nguon, tep]]));
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
	for (const h of kq.hong) console.log(`HONG ${h}`);
	const ghim = [
		`chú thích mã: ${tep}:${dongChu}`,
		`nút Huỷ không bọc DialogClose: ${tep}:${dongNut}`,
	];
	let lot = 0;
	for (const g of ghim) {
		const bat = kq.hong.some((h) => h.startsWith(g));
		if (!bat) lot += 1;
		console.log(`${bat ? "bat " : "LOT "} ${g}`);
	}
	console.log(
		`chieu do: ban sao ${nguon} chen \`// x\` va nut Huy khong DialogClose — ${ghim.length - lot}/${ghim.length} vi pham bi bat`,
	);
	process.exitCode = lot === 0 ? 1 : 0;
}

const CA = {
	"ky-con-hien": {
		thuong: () => {
			const kq = caKyConHien(danhSachTep());
			if (kq.soDaSoi === 0) {
				console.log("KHONG DO DUOC: khong quet duoc cho doc chu ky nao");
				process.exit(2);
			}
			inVaThoat(kq.hong);
		},
		chieuDo: chieuDoKyConHien,
	},
	"thiet-ke": {
		thuong: async () => {
			const { hong, soTep } = await caThietKe();
			if (soTep === 0) {
				console.log("KHONG DO DUOC: diff khong co tep nao de soi");
				process.exit(2);
			}
			inVaThoat(hong);
		},
		chieuDo: chieuDoThietKe,
	},
};

const ca = doiSo("--ca");
const chay = ca === null ? undefined : CA[ca];
if (!chay) {
	console.log(`KHONG DO DUOC: can --ca ${Object.keys(CA).join(" | ")}`);
	process.exit(2);
}
if (process.argv.includes("--chieu-do")) await chay.chieuDo();
else await chay.thuong();
