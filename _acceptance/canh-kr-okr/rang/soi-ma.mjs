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

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VUNG = ["apps", "packages"];
const LOAI_TRU = new Set([
	"node_modules",
	".next",
	"dist",
	"build",
	".turbo",
	"test",
	"tests",
	"__tests__",
]);
const LA_THU = /\.(spec|test)\.(ts|tsx|mts)$/;
const DUOI = /\.(ts|tsx|mts)$/;

const BANG_NHAN = "okrGhiNhanNhan";
const QUAN_HE_DEM = new Set([
	BANG_NHAN,
	"nhan",
	"okrGhiNhanNhanDuoc",
	"okrGhiNhanTacGia",
]);
const DEM = new Set(["count", "aggregate"]);
const SQL_THO = new Set([
	"$queryRaw",
	"$queryRawUnsafe",
	"$executeRaw",
	"$executeRawUnsafe",
]);

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
};

const tuongDoi = (p) => (p.startsWith(GOC) ? p.slice(GOC.length + 1) : p);

function diCay(thuMuc, ra) {
	if (!existsSync(thuMuc)) return ra;
	for (const ten of readdirSync(thuMuc)) {
		if (LOAI_TRU.has(ten)) continue;
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) diCay(duong, ra);
		else if (DUOI.test(ten) && !LA_THU.test(ten)) ra.push(duong);
	}
	return ra;
}

function cay(duong, chu) {
	return ts.createSourceFile(
		duong,
		chu,
		ts.ScriptTarget.Latest,
		true,
		/\.tsx$/.test(duong) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

const tenThuoc = (n) => {
	if (ts.isPropertyAccessExpression(n)) return n.name.text;
	if (
		ts.isElementAccessExpression(n) &&
		ts.isStringLiteralLike(n.argumentExpression)
	)
		return n.argumentExpression.text;
	return null;
};

const tenKhoa = (p) =>
	p.name && (ts.isIdentifier(p.name) || ts.isStringLiteralLike(p.name))
		? p.name.text
		: null;

function khoaTrong(n, ra = new Set()) {
	if (ts.isObjectLiteralExpression(n))
		for (const p of n.properties) {
			const k = tenKhoa(p);
			if (k) ra.add(k);
		}
	ts.forEachChild(n, (c) => {
		khoaTrong(c, ra);
	});
	return ra;
}

function soiTep(duong, chu, ten) {
	if (!/GhiNhan|ghiNhan|_count/.test(chu)) return [];
	const sf = cay(duong, chu);
	const hong = [];
	const o = (n) =>
		`${ten}:${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}`;
	const di = (n) => {
		if (ts.isCallExpression(n)) {
			const ham = tenThuoc(n.expression);
			const bang =
				ts.isPropertyAccessExpression(n.expression) ||
				ts.isElementAccessExpression(n.expression)
					? tenThuoc(n.expression.expression)
					: null;
			if (bang === BANG_NHAN && ham === "groupBy")
				hong.push(`okrGhiNhanNhan.groupBy: ${o(n)}`);
			if (
				bang === BANG_NHAN &&
				ham !== null &&
				DEM.has(ham) &&
				n.arguments.some((a) => khoaTrong(a).has("userId"))
			)
				hong.push(`okrGhiNhanNhan.${ham} theo userId: ${o(n)}`);
			if (ham !== null && SQL_THO.has(ham)) {
				const sql = n.arguments.map((a) => a.getText(sf)).join(" ");
				if (sql.includes(BANG_NHAN) && /GROUP\s+BY[^;]*"?userId"?/i.test(sql))
					hong.push(`GROUP BY "userId" tren okrGhiNhanNhan: ${o(n)}`);
			}
		}
		if (
			ts.isTaggedTemplateExpression(n) &&
			SQL_THO.has(tenThuoc(n.tag) ?? "")
		) {
			const sql = n.template.getText(sf);
			if (sql.includes(BANG_NHAN) && /GROUP\s+BY[^;]*"?userId"?/i.test(sql))
				hong.push(`GROUP BY "userId" tren okrGhiNhanNhan: ${o(n)}`);
		}
		if (
			ts.isPropertyAssignment(n) &&
			tenKhoa(n) === "_count" &&
			[...khoaTrong(n.initializer)].some((k) => QUAN_HE_DEM.has(k))
		)
			hong.push(`_count gan ${BANG_NHAN}: ${o(n)}`);
		ts.forEachChild(n, di);
	};
	di(sf);
	return hong;
}

function caDemTheoNguoi(them = []) {
	const tep = VUNG.flatMap((v) => diCay(join(GOC, v), []));
	const hong = [];
	for (const duong of [...tep, ...them])
		hong.push(...soiTep(duong, readFileSync(duong, "utf8"), tuongDoi(duong)));
	console.log(
		`so tep da soi (${VUNG.join(", ")}, tru test/ va node_modules): ${tep.length}`,
	);
	if (them.length > 0) console.log(`tep them vao lan soi: ${them.join(", ")}`);
	return { hong, soTep: tep.length };
}

const TEP_GIA = [
	{
		ten: "groupBy",
		chu: 'export async function demNhan(db) {\n\treturn db.okrGhiNhanNhan.groupBy({ by: ["userId"], _count: true });\n}\n',
		ghim: "okrGhiNhanNhan.groupBy",
	},
	{
		ten: "_count",
		chu: "export async function xepNguoi(db) {\n\treturn db.user.findMany({\n\t\tselect: { id: true, _count: { select: { okrGhiNhanNhanDuoc: true } } },\n\t});\n}\n",
		ghim: "_count gan okrGhiNhanNhan",
	},
	{
		ten: "GROUP BY",
		chu: 'export async function demTho(db) {\n\treturn db.$queryRaw`SELECT "userId", count(*) FROM "okrGhiNhanNhan" GROUP BY "userId"`;\n}\n',
		ghim: 'GROUP BY "userId" tren okrGhiNhanNhan',
	},
];

function chieuDoDemTheoNguoi() {
	const thuMuc = mkdtempSync(join(tmpdir(), "soi-dem-theo-nguoi-"));
	let bat = 0;
	try {
		const tep = TEP_GIA.map((g, i) => {
			const duong = join(thuMuc, `gia-${i}.ts`);
			writeFileSync(duong, g.chu);
			return duong;
		});
		const { hong } = caDemTheoNguoi(tep);
		TEP_GIA.forEach((g, i) => {
			const vet = hong.find((h) => h.startsWith(g.ghim) && h.includes(tep[i]));
			if (vet) bat += 1;
			console.log(
				`chieu do: tep gia ${g.ten} — ${vet ? `bat, in «${vet}»` : `LOT ${tep[i]}`}`,
			);
		});
		for (const h of hong) console.log(`HONG ${h}`);
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
	console.log(`chieu do: ${bat}/${TEP_GIA.length} tep gia bi bat`);
	process.exit(bat === TEP_GIA.length ? 1 : 0);
}

function lanhDemTheoNguoi() {
	const { hong, soTep } = caDemTheoNguoi();
	if (soTep === 0) {
		console.log("KHONG DO DUOC: khong soi duoc tep nao — sai goc kho?");
		process.exit(2);
	}
	for (const h of hong) console.log(`HONG ${h}`);
	console.log(`vi pham: ${hong.length}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

const CA = {
	"dem-theo-nguoi": { lanh: lanhDemTheoNguoi, chieuDo: chieuDoDemTheoNguoi },
};

const ca = doiSo("--ca");
const chon = ca === null ? undefined : CA[ca];
if (!chon) {
	console.log(`KHONG DO DUOC: can --ca ${Object.keys(CA).join(" | ")}`);
	process.exit(2);
}
if (process.argv.includes("--chieu-do")) chon.chieuDo();
else chon.lanh();
