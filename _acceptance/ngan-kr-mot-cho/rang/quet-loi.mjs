import { readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC_KHO = resolve(HERE, "..", "..", "..");
const APP = join(GOC_KHO, "apps", "app");
const RECORD_STACK = join(
	APP,
	"components",
	"crm",
	"record-sheet",
	"record-stack.ts",
);
const HOOK_MO = "useOpenRecord";
const HOOK_CHONG = "useRecordStack";
const TEN_MO_CHONG = new Set(["open", "thayDinh"]);
const KIND_KR = new Set(["kr", "so-kr"]);
const KIND_CAM = "so-kr";
const TAB_CAM = "dien-bien";
const TAB_SO_NGUON = "so-nguon";
const THU_MUC_BO = new Set(["node_modules", ".next"]);
const TRONG_NGAN = [
	{
		tep: "apps/app/components/crm/record-sheet/kr-sheet.tsx",
		eval: "E4",
	},
];
const MA_TRAN = [
	{
		o: "dong-kr-trang-don-vi",
		tep: "apps/app/app/(app)/[slug]/okr/theo-don-vi/bang.tsx",
		ham: "BangDonVi",
	},
	{
		o: "nut-viec-bang-kr",
		tep: "apps/app/app/(app)/[slug]/okr/bang-kr.tsx",
		ham: "SoViecKr",
	},
	{
		o: "con-so-bang-kr",
		tep: "apps/app/app/(app)/[slug]/okr/bang-kr.tsx",
		ham: "SoCuaKr",
		tab: TAB_SO_NGUON,
	},
	{
		o: "the-so-do",
		tep: "apps/app/app/(app)/[slug]/okr/quanh-muc-tieu/the-quanh.tsx",
		ham: "TheQuanh",
	},
	{
		o: "tong-quan",
		tep: "apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx",
		ham: "TheNguon",
	},
	{
		o: "cua-toi",
		tep: "apps/app/app/(app)/[slug]/okr/khoi-kr-cua-toi.tsx",
		ham: "Dong",
	},
	{
		o: "hop-tuan",
		tep: "apps/app/app/(app)/[slug]/okr/hop-tuan.tsx",
		ham: "DongBan",
	},
	{
		o: "hoi-kara",
		tep: "apps/app/app/(app)/[slug]/okr/hoi/cot-hoi-kara.tsx",
		ham: "CuocHoiDang",
	},
	{
		o: "moi-kr",
		tep: "apps/app/app/(app)/[slug]/okr/moi-kr/moi-kr.tsx",
		ham: "BangMoiKr",
	},
	{
		o: "kr-phu-trach",
		tep: "apps/app/app/(app)/[slug]/okr/phan-kr-phu-trach.tsx",
		ham: "PhanKrPhuTrach",
	},
	{
		o: "viec-gan-kr",
		tep: "apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx",
		ham: "DichViec",
	},
	{
		o: "ten-kr-bang-kr",
		tep: "apps/app/app/(app)/[slug]/okr/bang-kr.tsx",
		ham: "HangKr",
	},
	{
		o: "cap-nhat-gan-day",
		tep: "apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/cap-nhat-gan-day.tsx",
		ham: "DongTinChuKy",
	},
];

function docThamSo(argv) {
	const i = argv.indexOf("--goc");
	if (i < 0) return { goc: APP, laKho: true };
	const thu = argv[i + 1];
	if (!thu) throw new Error("--goc can mot thu muc");
	return { goc: resolve(process.cwd(), thu), laKho: false };
}

function liet(thu, boTest) {
	const ra = [];
	for (const ten of readdirSync(thu)) {
		if (THU_MUC_BO.has(ten)) continue;
		const duong = join(thu, ten);
		if (statSync(duong).isDirectory()) {
			if (boTest && duong === join(APP, "test")) continue;
			ra.push(...liet(duong, boTest));
		} else if (/\.tsx?$/.test(ten) && !ten.endsWith(".d.ts")) {
			ra.push(duong);
		}
	}
	return ra;
}

function dungChuongTrinh(tep) {
	const cfg = ts.readConfigFile(join(APP, "tsconfig.json"), ts.sys.readFile);
	if (cfg.error) throw new Error("khong doc duoc tsconfig cua apps/app");
	const phan = ts.parseJsonConfigFileContent(cfg.config, ts.sys, APP);
	return ts.createProgram(tep, {
		...phan.options,
		noEmit: true,
		skipLibCheck: true,
	});
}

const { goc, laKho } = docThamSo(process.argv.slice(2));
const tepQuet = liet(goc, laKho);
const ct = dungChuongTrinh(tepQuet);
const tc = ct.getTypeChecker();
const tepQuetSet = new Set(tepQuet.map((t) => resolve(t)));

const tuongDoi = (tep) => relative(GOC_KHO, tep);

function boBoc(e) {
	let x = e;
	while (
		ts.isParenthesizedExpression(x) ||
		ts.isAsExpression(x) ||
		ts.isNonNullExpression(x) ||
		ts.isSatisfiesExpression(x)
	)
		x = x.expression;
	return x;
}

function kyHieu(node) {
	const s = tc.getSymbolAtLocation(node);
	if (s && s.flags & ts.SymbolFlags.Alias) return tc.getAliasedSymbol(s);
	return s;
}

function khaiBao(node) {
	const s = kyHieu(node);
	return s?.valueDeclaration ?? s?.declarations?.[0];
}

function tenHam(d) {
	if (!d) return null;
	if (
		(ts.isFunctionDeclaration(d) || ts.isVariableDeclaration(d)) &&
		d.name &&
		ts.isIdentifier(d.name)
	)
		return d.name.text;
	return null;
}

function thanHam(d) {
	if (ts.isFunctionDeclaration(d)) return d;
	if (ts.isVariableDeclaration(d) && d.initializer) {
		const i = boBoc(d.initializer);
		if (ts.isArrowFunction(i) || ts.isFunctionExpression(i)) return i;
	}
	return null;
}

function laHookGoc(d, ten) {
	return (
		d !== undefined &&
		tenHam(d) === ten &&
		resolve(d.getSourceFile().fileName) === RECORD_STACK
	);
}

const dangXet = new Set();

function moTa(e) {
	const x = boBoc(e);
	if (ts.isCallExpression(x)) {
		const d = khaiBao(boBoc(x.expression));
		if (laHookGoc(d, HOOK_MO)) return { loai: "goc" };
		const boc = d ? thongTinBoc(d) : null;
		return boc ? { loai: "boc", boc } : null;
	}
	if (ts.isPropertyAccessExpression(x)) {
		return TEN_MO_CHONG.has(x.name.text) && laChong(x.expression)
			? { loai: "goc" }
			: null;
	}
	if (!ts.isIdentifier(x)) return null;
	const d = khaiBao(x);
	if (!d || dangXet.has(d)) return null;
	if (ts.isVariableDeclaration(d) && d.initializer) {
		dangXet.add(d);
		const kq = moTa(d.initializer);
		dangXet.delete(d);
		return kq;
	}
	if (ts.isBindingElement(d) && ts.isObjectBindingPattern(d.parent)) {
		const ten = (d.propertyName ?? d.name).getText();
		const bien = d.parent.parent;
		return TEN_MO_CHONG.has(ten) &&
			ts.isVariableDeclaration(bien) &&
			bien.initializer &&
			laChong(bien.initializer)
			? { loai: "goc" }
			: null;
	}
	return null;
}

function laChong(e) {
	const x = boBoc(e);
	if (ts.isCallExpression(x))
		return laHookGoc(khaiBao(boBoc(x.expression)), HOOK_CHONG);
	if (!ts.isIdentifier(x)) return false;
	const d = khaiBao(x);
	return Boolean(
		d && ts.isVariableDeclaration(d) && d.initializer && laChong(d.initializer),
	);
}

function giaChu(kieu) {
	const ds = kieu.isUnion() ? kieu.types : [kieu];
	const gia = new Set();
	let ro = true;
	for (const k of ds) {
		if (k.isStringLiteral()) gia.add(k.value);
		else ro = false;
	}
	return { gia, ro };
}

function kindCua(thamSo) {
	if (!thamSo) return { gia: new Set(), ro: false };
	const kieu = tc.getTypeAtLocation(thamSo);
	const p = kieu.getProperty("kind");
	if (!p) return { gia: new Set(), ro: false };
	return giaChu(tc.getTypeOfSymbolAtLocation(p, thamSo));
}

function coChu(node, chu) {
	let co = false;
	const di = (n) => {
		if (co) return;
		if (ts.isStringLiteralLike(n) && n.text === chu) co = true;
		else if (ts.isIdentifier(n) && n.parent?.name !== n) {
			const k = tc.getTypeAtLocation(n);
			if (k.isStringLiteral() && k.value === chu) co = true;
		}
		ts.forEachChild(n, di);
	};
	di(node);
	return co;
}

function hamGan(node) {
	let n = node.parent;
	while (n && !ts.isFunctionLike(n)) n = n.parent;
	return n;
}

function capTren(node) {
	let n = node;
	while (n.parent && !ts.isSourceFile(n.parent)) n = n.parent;
	if (ts.isVariableStatement(n))
		return n.declarationList.declarations[0] ?? null;
	return n;
}

function laTrongHamCon(call, d) {
	const than = thanHam(d);
	const gan = hamGan(call);
	return than !== null && gan !== undefined && gan !== than;
}

const boNho = new Map();

function thongTinBoc(d) {
	if (boNho.has(d)) return boNho.get(d);
	boNho.set(d, null);
	const ten = tenHam(d);
	const than = thanHam(d);
	if (!ten || !/^use[A-Z]/.test(ten) || !than || laHookGoc(d, HOOK_MO)) {
		return null;
	}
	if (resolve(d.getSourceFile().fileName) === RECORD_STACK) return null;
	const goi = timGoi(than).filter((g) => laTrongHamCon(g.call, d));
	if (goi.length === 0) return null;
	const kq = {
		ten,
		tep: d.getSourceFile().fileName,
		gia: new Set(goi.flatMap((g) => [...g.kind.gia])),
		ro: goi.every((g) => g.kind.ro),
		dienBien: goi.some((g) => g.dienBien),
	};
	boNho.set(d, kq);
	return kq;
}

function timGoi(goc) {
	const ra = [];
	const di = (n) => {
		if (ts.isCallExpression(n)) {
			const mt = moTa(n.expression);
			if (mt) ra.push(dungGoi(n, mt));
		}
		ts.forEachChild(n, di);
	};
	ts.forEachChild(goc, di);
	return ra;
}

function dungGoi(call, mt) {
	const gan = hamGan(call);
	const kind =
		mt.loai === "goc"
			? kindCua(call.arguments[0])
			: { gia: mt.boc.gia, ro: mt.boc.ro };
	const dienBien =
		(mt.loai === "boc" && mt.boc.dienBien) ||
		(gan !== undefined && coChu(gan, TAB_CAM));
	const soNguon = call.arguments.some((a) => coChu(a, TAB_SO_NGUON));
	return { call, mt, kind, dienBien, soNguon };
}

const SO_KIND_TOAN_BO = (() => {
	const d = ct.getSourceFile(RECORD_STACK);
	if (!d) return Number.POSITIVE_INFINITY;
	let so = Number.POSITIVE_INFINITY;
	ts.forEachChild(d, (n) => {
		if (!ts.isTypeAliasDeclaration(n) || n.name.text !== "RecordKind") return;
		so = giaChu(tc.getTypeAtLocation(n.name)).gia.size;
	});
	return so;
})();

const laTruyenQua = (kind) => !kind.ro || kind.gia.size >= SO_KIND_TOAN_BO;

function dongCua(node) {
	const sf = node.getSourceFile();
	return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}

function loiCuaGoi(g, node = g.call, kindThay = null) {
	const kind = kindThay ?? g.kind;
	const tren = capTren(node);
	return {
		tep: tuongDoi(node.getSourceFile().fileName),
		dong: dongCua(node),
		ham: tenHam(tren) ?? "?",
		gia: [...kind.gia].sort(),
		mangKr: [...kind.gia].some((k) => KIND_KR.has(k)) || g.dienBien,
		soKr: kind.gia.has(KIND_CAM),
		dienBien: g.dienBien,
		soNguon: g.soNguon,
	};
}

function jsxDung(d) {
	const ra = [];
	for (const sf of ct.getSourceFiles()) {
		if (!tepQuetSet.has(resolve(sf.fileName))) continue;
		const di = (n) => {
			if (
				(ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) &&
				khaiBao(n.tagName) === d
			)
				ra.push(n);
			ts.forEachChild(n, di);
		};
		di(sf);
	}
	return ra;
}

function kindThuocTinh(the) {
	const tt = the.attributes.properties.find(
		(p) => ts.isJsxAttribute(p) && p.name.getText() === "kind",
	);
	if (!tt?.initializer) return { gia: new Set(), ro: false };
	if (ts.isStringLiteral(tt.initializer))
		return { gia: new Set([tt.initializer.text]), ro: true };
	const gt = ts.isJsxExpression(tt.initializer)
		? tt.initializer.expression
		: tt.initializer;
	return gt ? giaChu(tc.getTypeAtLocation(gt)) : { gia: new Set(), ro: false };
}

const loi = [];
const khongRo = [];
for (const sf of ct.getSourceFiles()) {
	if (!tepQuetSet.has(resolve(sf.fileName))) continue;
	if (resolve(sf.fileName) === RECORD_STACK) continue;
	for (const g of timGoi(sf)) {
		const tren = capTren(g.call);
		if (tren && thongTinBoc(tren) && laTrongHamCon(g.call, tren)) continue;
		if (!laTruyenQua(g.kind) || g.dienBien) {
			loi.push(loiCuaGoi(g));
			continue;
		}
		const dung = tren ? jsxDung(tren) : [];
		if (dung.length === 0) khongRo.push(loiCuaGoi(g));
		for (const the of dung) {
			const kind = kindThuocTinh(the);
			const l = loiCuaGoi(g, the, kind);
			if (laTruyenQua(kind)) khongRo.push(l);
			else loi.push(l);
		}
	}
}

const loiKr = loi.filter((l) => l.mangKr);
const viPham = [];
for (const l of loiKr) {
	if (l.soKr) viPham.push(`con mo so-kr: ${l.tep}`);
	if (l.dienBien) viPham.push(`con mo dien-bien: ${l.tep}`);
}
for (const l of khongRo) viPham.push(`khong ro kind: ${l.tep}:${l.dong}`);

if (!laKho) {
	for (const dong of viPham) console.log(dong);
	process.exit(viPham.length > 0 ? 1 : 0);
}

const khoaLoi = (l) => `${l.tep}#${l.ham}`;
const trongNgan = loiKr.filter((l) => TRONG_NGAN.some((t) => t.tep === l.tep));
const loiVao = loiKr.filter((l) => !TRONG_NGAN.some((t) => t.tep === l.tep));
const nhom = new Map();
for (const l of loiVao) {
	const k = khoaLoi(l);
	nhom.set(k, [...(nhom.get(k) ?? []), l]);
}
const thieu = [];
const lech = [];
for (const o of MA_TRAN) {
	const ds = nhom.get(`${o.tep}#${o.ham}`);
	if (!ds) {
		thieu.push(`thieu loi: ${o.o} (${o.tep}#${o.ham})`);
		continue;
	}
	for (const l of ds)
		console.log(
			`loi: ${o.o} ${l.tep}:${l.dong} -> ${l.gia.join("|")}${l.soNguon ? " + tab so-nguon" : ""}`,
		);
	if (o.tab && !ds.every((l) => l.soNguon))
		lech.push(`thieu tab ${o.tab}: ${o.o}`);
}
const ngoai = [...nhom.entries()]
	.filter(([k]) => !MA_TRAN.some((o) => `${o.tep}#${o.ham}` === k))
	.flatMap(([, ds]) => ds.map((l) => `loi ngoai ma tran: ${l.tep}:${l.dong}`));
for (const l of trongNgan) {
	const t = TRONG_NGAN.find((x) => x.tep === l.tep);
	console.log(`trong ngan KR (${t?.eval}): ${l.tep}:${l.dong}`);
}
const loiDem = nhom.size;
console.log(`so loi quet: ${loiDem} · so o ma tran: ${MA_TRAN.length}`);
const hong = [...ngoai, ...thieu, ...lech, ...viPham];
for (const dong of hong) console.log(dong);
if (loiDem !== MA_TRAN.length || hong.length > 0) process.exit(1);
console.log("DUNG");
