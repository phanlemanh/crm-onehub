import { spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { LUAT_KHO_CAY } from "./cau-hinh.mjs";

const TEP = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP), "..", "..");
const NAP_TS = (() => {
	try {
		return { ts: createRequire(import.meta.url)("typescript") };
	} catch (e) {
		return { ts: null, loi: e.message.split("\n")[0] };
	}
})();
const ts = NAP_TS.ts;
const L = LUAT_KHO_CAY.luat;
const THU_TU = [
	L.chuThich.ten,
	L.triKhon.ten,
	L.kieuLong.ten,
	L.hangSo.ten,
	L.uiChung.ten,
	L.cachLy.ten,
	L.vongDoi.ten,
];

class KhongDo extends Error {}

const khongDo = (cau) => {
	throw new KhongDo(cau);
};

const trong = (duong, thuMuc) =>
	duong === thuMuc || duong.startsWith(`${thuMuc}/`);

function globRe(g) {
	const thoat = g.replace(/[.+^${}()|[\]\\]/g, "\\$&");
	const doi = thoat.replace(/\*\*\/|\/\*\*$|\*\*|\*/g, (m) => {
		if (m === "**/") return "(?:.*/)?";
		if (m === "/**") return "/.*";
		if (m === "**") return ".*";
		return "[^/]*";
	});
	return new RegExp(`^${doi}$`);
}

function docJson(goc, tep) {
	const duong = join(goc, tep);
	if (!existsSync(duong)) khongDo(`thieu tep: ${tep}`);
	try {
		return JSON.parse(readFileSync(duong, "utf8"));
	} catch (e) {
		return khongDo(`${tep} khong phai JSON: ${e.message}`);
	}
}

function docOxlint(goc) {
	const cfg = docJson(goc, LUAT_KHO_CAY.oxlint);
	if (!Array.isArray(cfg.ignorePatterns))
		khongDo(`${LUAT_KHO_CAY.oxlint} thieu ignorePatterns`);
	const bo = cfg.ignorePatterns
		.filter((g) => !LUAT_KHO_CAY.khongLayTuOxlint.includes(g))
		.map(globRe);
	const tat = (quyTac) =>
		(cfg.overrides ?? [])
			.filter((o) => o.rules?.[quyTac] === "off")
			.flatMap((o) => o.files.map(globRe));
	return {
		bo: [...bo, ...LUAT_KHO_CAY.boThem],
		tatRecord: tat(L.kieuLong.quyTacRecord),
		tatEpKep: tat(L.kieuLong.quyTacEpKep),
	};
}

function lietKe(goc, duong, ten) {
	const tuyet = join(goc, duong);
	if (!existsSync(tuyet)) khongDo(`thieu thu muc: ${duong}`);
	return readdirSync(tuyet, { withFileTypes: true }).flatMap((m) => {
		const con = `${duong}/${m.name}`;
		if (m.isDirectory())
			return m.name.startsWith(".") || m.name === "node_modules"
				? []
				: lietKe(goc, con, ten);
		return ten(m.name) ? [con] : [];
	});
}

function tepNguon(goc, ox) {
	return LUAT_KHO_CAY.vung
		.flatMap((v) => lietKe(goc, v, (n) => LUAT_KHO_CAY.duoi.test(n)))
		.filter((t) => !ox.bo.some((r) => r.test(t)));
}

function ungDung(goc) {
	const U = LUAT_KHO_CAY.ungDung;
	const goc2 = join(goc, U.goc);
	if (!existsSync(goc2)) return [];
	return readdirSync(goc2, { withFileTypes: true })
		.filter((m) => m.isDirectory() && !m.name.startsWith("."))
		.map((m) => `${U.goc}/${m.name}`)
		.filter((d) => existsSync(join(goc, d, "package.json")))
		.map((d) => {
			const goi = docJson(goc, `${d}/package.json`);
			const phu = new Set(
				Object.keys({ ...goi.dependencies, ...goi.devDependencies }),
			);
			return {
				thuMuc: d,
				ten: goi.name ?? null,
				laAgent: phu.has(U.agent.goi) && existsSync(join(goc, d, U.agent.tep)),
				laNest: phu.has(U.nest.goi),
			};
		});
}

const khopGoi = (nguon, ds) =>
	ds.some((p) =>
		p.endsWith("/")
			? nguon.startsWith(p)
			: nguon === p || nguon.startsWith(`${p}/`),
	);

const giaiTuongDoi = (tep, nguon) =>
	nguon.startsWith(".")
		? posix.normalize(posix.join(posix.dirname(tep), nguon))
		: null;

function kieuTep(tep) {
	if (tep.endsWith(".tsx")) return ts.ScriptKind.TSX;
	if (tep.endsWith(".mjs")) return ts.ScriptKind.JS;
	return ts.ScriptKind.TS;
}

const boNgoac = (n) => {
	let x = n;
	while (ts.isParenthesizedExpression(x)) x = x.expression;
	return x;
};

const laEp = (n) => ts.isAsExpression(n) || ts.isTypeAssertionExpression(n);

const laNhan = (n) =>
	ts.isBinaryExpression(n) &&
	n.operatorToken.kind === ts.SyntaxKind.AsteriskToken;

function laChuoiNhan(n) {
	let p = n.parent;
	while (p && ts.isParenthesizedExpression(p)) p = p.parent;
	return p !== undefined && laNhan(p);
}

function laSoNhan(n) {
	const x = boNgoac(n);
	if (ts.isNumericLiteral(x)) return [Number(x.text)];
	if (!laNhan(x)) return null;
	const trai = laSoNhan(x.left);
	const phai = laSoNhan(x.right);
	return trai && phai ? [...trai, ...phai] : null;
}

function laThoiLuong(so) {
	const h = L.hangSo;
	const coPhut =
		so.includes(h.phutMs) ||
		(so.includes(h.giayMoiPhut) && so.includes(h.giayMs));
	return coPhut && so.some((x) => !h.thuaSoDonVi.includes(x));
}

function nguonNhap(n) {
	if (
		(ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) &&
		n.moduleSpecifier &&
		ts.isStringLiteral(n.moduleSpecifier)
	)
		return n.moduleSpecifier;
	if (
		ts.isImportEqualsDeclaration(n) &&
		ts.isExternalModuleReference(n.moduleReference) &&
		ts.isStringLiteral(n.moduleReference.expression)
	)
		return n.moduleReference.expression;
	if (
		ts.isCallExpression(n) &&
		(n.expression.kind === ts.SyntaxKind.ImportKeyword ||
			(ts.isIdentifier(n.expression) && n.expression.text === "require")) &&
		n.arguments.length > 0 &&
		ts.isStringLiteralLike(n.arguments[0])
	)
		return n.arguments[0];
	if (
		ts.isImportTypeNode(n) &&
		ts.isLiteralTypeNode(n.argument) &&
		ts.isStringLiteral(n.argument.literal)
	)
		return n.argument.literal;
	return null;
}

function phanTichLop(lop, sf, dong) {
	const V = L.vongDoi;
	const phuongThuc = new Map();
	for (const m of lop.members) {
		const ham =
			ts.isPropertyDeclaration(m) &&
			m.initializer &&
			(ts.isArrowFunction(m.initializer) ||
				ts.isFunctionExpression(m.initializer))
				? m.initializer
				: null;
		const than = ts.isMethodDeclaration(m) ? m.body : ham?.body;
		if (!than || !m.name || !ts.isIdentifier(m.name)) continue;
		const goi = [];
		const goiThis = new Set();
		let coKiem = false;
		const di = (n) => {
			if (ts.isIdentifier(n) && V.dinhDanhKiem.includes(n.text)) coKiem = true;
			if (
				ts.isCallExpression(n) &&
				ts.isPropertyAccessExpression(n.expression)
			) {
				const tenHam = n.expression.name.text;
				const truoc = n.expression.expression;
				if (truoc.kind === ts.SyntaxKind.ThisKeyword) goiThis.add(tenHam);
				else if (ts.isPropertyAccessExpression(truoc))
					goi.push({
						truyCap: truoc.name.text,
						ham: tenHam,
						so: dong(n.getStart(sf)),
					});
			}
			ts.forEachChild(n, di);
		};
		di(than);
		phuongThuc.set(m.name.text, { goi, goiThis, coKiem });
	}
	return { phuongThuc };
}

const BO_NHO = new Map();

function phanTich(tep, chu) {
	const khoa = `${tep}\0${chu}`;
	const co = BO_NHO.get(khoa);
	if (co) return co;
	const sf = ts.createSourceFile(
		tep,
		chu,
		ts.ScriptTarget.Latest,
		true,
		kieuTep(tep),
	);
	const dong = (vt) => sf.getLineAndCharacterOfPosition(vt).line + 1;
	const ra = {
		chuThich: [],
		nhap: [],
		record: [],
		epKep: [],
		thoiLuong: [],
		lop: [],
	};
	const daThay = new Set();
	const nut = (n) => {
		if (ts.isClassDeclaration(n) || ts.isClassExpression(n))
			ra.lop.push(phanTichLop(n, sf, dong));
		const nguon = nguonNhap(n);
		if (nguon)
			ra.nhap.push({ so: dong(nguon.getStart(sf)), nguon: nguon.text });
		if (
			ts.isTypeReferenceNode(n) &&
			ts.isIdentifier(n.typeName) &&
			n.typeName.text === "Record" &&
			n.typeArguments?.length === 2 &&
			n.typeArguments[0].kind === ts.SyntaxKind.StringKeyword &&
			[ts.SyntaxKind.UnknownKeyword, ts.SyntaxKind.AnyKeyword].includes(
				n.typeArguments[1].kind,
			)
		)
			ra.record.push({ so: dong(n.getStart(sf)), chu: n.getText(sf) });
		if (laEp(n)) {
			const trong = boNgoac(n.expression);
			if (
				laEp(trong) &&
				[ts.SyntaxKind.UnknownKeyword, ts.SyntaxKind.AnyKeyword].includes(
					trong.type.kind,
				)
			)
				ra.epKep.push({
					so: dong(n.getStart(sf)),
					chu: `as ${trong.type.getText(sf)} as ${n.type.getText(sf)}`,
				});
		}
		if ((laNhan(n) || ts.isNumericLiteral(n)) && !laChuoiNhan(n)) {
			const so = laSoNhan(n);
			if (so && laThoiLuong(so))
				ra.thoiLuong.push({ so: dong(n.getStart(sf)), chu: n.getText(sf) });
		}
	};
	const di = (n) => {
		if (n.kind >= ts.SyntaxKind.FirstNode && n.getChildCount(sf) > 0) {
			nut(n);
			for (const c of n.getChildren(sf)) di(c);
			return;
		}
		nut(n);
		if (n.kind === ts.SyntaxKind.JsxText) return;
		for (const r of [
			...(ts.getTrailingCommentRanges(chu, n.pos) ?? []),
			...(ts.getLeadingCommentRanges(chu, n.pos) ?? []),
		]) {
			if (daThay.has(r.pos)) continue;
			daThay.add(r.pos);
			const than = chu.slice(r.pos, r.end);
			if (L.chuThich.chiThi.test(than)) continue;
			ra.chuThich.push({
				so: dong(r.pos),
				chu: than.split("\n")[0].trim().slice(0, L.chuThich.catChu),
			});
		}
	};
	di(sf);
	BO_NHO.set(khoa, ra);
	return ra;
}

const laKiem = (t) => LUAT_KHO_CAY.laKiem.some((r) => r.test(t));

const dong = (t, ds, chu) =>
	ds.map((x) => ({ tep: t, so: x.so, chu: chu ? chu(x) : x.chu }));

const nhapIn = (n) => `nhap ${n.nguon}`;

function nhapSang(t, p, thuMuc, goi) {
	return p.nhap.filter((n) => {
		const tuongDoi = giaiTuongDoi(t, n.nguon);
		return tuongDoi
			? thuMuc.some((d) => trong(tuongDoi, d))
			: khopGoi(n.nguon, goi);
	});
}

const HAM_LUAT = {
	[L.chuThich.ten]: (t, p) => dong(t, p.chuThich),
	[L.triKhon.ten]: (t, p, nc) =>
		nc.nest.some((a) => trong(t, a.thuMuc)) && !laKiem(t)
			? dong(
					t,
					nhapSang(
						t,
						p,
						nc.agent.map((a) => a.thuMuc),
						nc.cam,
					),
					nhapIn,
				)
			: [],
	[L.kieuLong.ten]: (t, p, nc) => [
		...(nc.ox.tatRecord.some((r) => r.test(t)) ? [] : dong(t, p.record)),
		...(nc.ox.tatEpKep.some((r) => r.test(t)) ? [] : dong(t, p.epKep)),
	],
	[L.hangSo.ten]: (t, p) =>
		laKiem(t) || L.hangSo.tepCauHinh.test(t) ? [] : dong(t, p.thoiLuong),
	[L.uiChung.ten]: (t, p) => {
		if (trong(t, L.uiChung.goc)) return [];
		const banSao = t.includes(`/${L.uiChung.thuMucCam}/`)
			? [{ tep: t, so: 1, chu: `ban sao shadcn ngoai ${L.uiChung.goc}` }]
			: [];
		const nen = p.nhap.filter((n) => khopGoi(n.nguon, L.uiChung.nenShadcn));
		return [...banSao, ...dong(t, nen, nhapIn)];
	},
	[L.cachLy.ten]: (t, p, nc) => {
		const minh = nc.agent.find((a) => trong(t, a.thuMuc));
		if (!minh) return [];
		const thuMucTest = `${minh.thuMuc}/${L.cachLy.thuMucTest}`;
		const laTest = trong(t, thuMucTest);
		const khac = nc.apps.filter(
			(a) => a.thuMuc !== minh.thuMuc && !(laTest && a.laNest),
		);
		const sang = nhapSang(
			t,
			p,
			khac.map((a) => a.thuMuc),
			khac.map((a) => a.ten).filter(Boolean),
		);
		const vaoTest = laTest
			? []
			: p.nhap.filter((n) => {
					const d = giaiTuongDoi(t, n.nguon);
					return d !== null && trong(d, thuMucTest);
				});
		return [
			...dong(t, sang, nhapIn),
			...dong(t, vaoTest, (n) => `nhap test cua chinh app: ${n.nguon}`),
		];
	},
	[L.vongDoi.ten]: (t, p, nc) => {
		if (!nc.nest.some((a) => trong(t, a.thuMuc)) || laKiem(t)) return [];
		const V = L.vongDoi;
		const ra = [];
		for (const lop of p.lop) {
			const kiem = (m) =>
				m.coKiem ||
				[...m.goiThis].some((ten) => lop.phuongThuc.get(ten)?.coKiem);
			for (const [ten, m] of lop.phuongThuc) {
				if (kiem(m)) continue;
				for (const g of m.goi) {
					if (!nc.schema.cat.has(g.truyCap)) continue;
					if (g.ham === V.hamDoc && ten.startsWith(V.tienToList))
						ra.push({ so: g.so, chu: `list lan ban da cat: ${g.truyCap}` });
					if (V.hamXoa.includes(g.ham))
						ra.push({
							so: g.so,
							chu: `xoa vinh vien khong kiem da luu tru: ${g.truyCap}`,
						});
				}
			}
		}
		return dong(t, ra);
	},
};

function docSchema(goc) {
	const V = L.vongDoi;
	const duong = join(goc, V.schema);
	if (!existsSync(duong)) return null;
	const mo = [];
	let hien = null;
	readFileSync(duong, "utf8")
		.split("\n")
		.forEach((d, i) => {
			const m = /^model\s+(\w+)\s*\{/.exec(d);
			if (m) {
				hien = { ten: m[1], so: i + 1, van: chuanHoa(d), cot: new Set() };
				mo.push(hien);
				return;
			}
			if (hien && /^\}/.test(d)) {
				hien = null;
				return;
			}
			const c = /^\s+(\w+)\s/.exec(d);
			if (hien && c) hien.cot.add(c[1]);
		});
	const truyCap = (ten) => `${ten[0].toLowerCase()}${ten.slice(1)}`;
	return {
		mo,
		cat: new Set(
			mo.filter((x) => x.cot.has(V.cotDanhDau)).map((x) => truyCap(x.ten)),
		),
	};
}

function kiemSchema(schema) {
	const V = L.vongDoi;
	return schema.mo
		.map((x) => ({ x, cot: V.cotCat.filter((c) => x.cot.has(c)) }))
		.filter(({ cot }) => cot.length > 1)
		.map(({ x, cot }) => ({
			tep: V.schema,
			so: x.so,
			chu: `mo hinh ${x.ten} co hai cach cat: ${cot.join(", ")}`,
			van: x.van,
		}));
}

function kiemShadcn(goc) {
	return LUAT_KHO_CAY.vung
		.flatMap((v) => lietKe(goc, v, (n) => n === L.uiChung.tepShadcn))
		.filter((t) => !trong(t, L.uiChung.goc))
		.map((t) => ({ tep: t, ui: docJson(goc, t).aliases?.ui ?? "" }))
		.filter((x) => !L.uiChung.aliasUi.test(x.ui))
		.map((x) => ({
			tep: x.tep,
			so: 1,
			chu: `alias ui = «${x.ui}» khong tro vao @crm/ui`,
			van: `aliases.ui=${x.ui}`,
		}));
}

function luatVang(nc) {
	return {
		[L.triKhon.ten]:
			nc.nest.length === 0
				? [`app Nest (${LUAT_KHO_CAY.ungDung.nest.goi})`]
				: [],
		[L.cachLy.ten]:
			nc.agent.length === 0 || nc.apps.length < 2
				? [
						`app agent (${LUAT_KHO_CAY.ungDung.agent.goi} + ${LUAT_KHO_CAY.ungDung.agent.tep}) va app thu hai`,
					]
				: [],
		[L.vongDoi.ten]:
			nc.schema === null || nc.nest.length === 0
				? [`${L.vongDoi.schema} va app Nest (${LUAT_KHO_CAY.ungDung.nest.goi})`]
				: [],
	};
}

function kiemCay(goc) {
	const ox = docOxlint(goc);
	const tep = tepNguon(goc, ox);
	if (tep.length === 0) khongDo("khong co tep nguon nao");
	const apps = ungDung(goc);
	const agent = apps.filter((a) => a.laAgent);
	const nc = {
		ox,
		apps,
		agent,
		nest: apps.filter((a) => a.laNest),
		schema: docSchema(goc),
		cam: [
			...new Set([
				...L.triKhon.goiCam,
				...agent.map((a) => a.ten).filter(Boolean),
			]),
		].sort(),
	};
	const vangCua = luatVang(nc);
	const vang = Object.fromEntries(
		THU_TU.map((ten) => [ten, vangCua[ten] ?? []]),
	);
	const apDung = THU_TU.filter((ten) => vang[ten].length === 0);
	if (apDung.length === 0) khongDo("khong luat nao ap dung duoc");
	const viPham = Object.fromEntries(THU_TU.map((t) => [t, []]));
	for (const t of tep) {
		const chu = readFileSync(join(goc, t), "utf8");
		const p = phanTich(t, chu);
		const dongChu = chu.split("\n");
		for (const ten of apDung)
			viPham[ten].push(
				...HAM_LUAT[ten](t, p, nc).map((v) => ({
					...v,
					van: chuanHoa(dongChu[v.so - 1] ?? ""),
				})),
			);
	}
	if (apDung.includes(L.uiChung.ten))
		viPham[L.uiChung.ten].push(...kiemShadcn(goc));
	if (apDung.includes(L.vongDoi.ten))
		viPham[L.vongDoi.ten].push(...kiemSchema(nc.schema));
	return {
		tep: tep.length,
		cam: nc.cam,
		viPham,
		vang,
		agent: agent.map((a) => a.thuMuc),
		nest: nc.nest.map((a) => a.thuMuc),
	};
}

const chuanHoa = (d) => d.trim().replace(/\s+/g, " ");

function apNen(luat, ds, nenTatCa) {
	const nen = nenTatCa[luat] ?? {};
	const con = new Map(
		Object.entries(nen).map(([t, vs]) => [t, vs.map(chuanHoa)]),
	);
	const moi = [];
	let trongNen = 0;
	for (const v of ds) {
		const ds2 = con.get(v.tep) ?? [];
		const i = ds2.indexOf(v.van);
		if (i === -1) moi.push(v);
		else {
			ds2.splice(i, 1);
			trongNen += 1;
		}
	}
	const thua = [...con].flatMap(([t, vs]) => vs.map((v) => `${t} «${v}»`));
	return { moi, trongNen, soTepNen: Object.keys(nen).length, thua };
}

function nenTuCay(kq) {
	return Object.fromEntries(
		kq.luat
			.filter((l) => l.moi.length > 0)
			.map((l) => {
				const theoTep = {};
				for (const v of l.moi)
					theoTep[v.tep] = [...(theoTep[v.tep] ?? []), v.van];
				return [l.ten, theoTep];
			}),
	);
}

function ketQua(goc, nen = LUAT_KHO_CAY.nen) {
	const d = kiemCay(goc);
	const luat = THU_TU.map((ten) => ({
		ten,
		vang: d.vang[ten],
		...(d.vang[ten].length > 0
			? { moi: [], trongNen: 0, soTepNen: 0, thua: [] }
			: apNen(ten, d.viPham[ten], nen)),
	}));
	return { ...d, luat, ma: luat.some((l) => l.moi.length > 0) ? 1 : 0 };
}

function inKetQua(kq, inRa) {
	for (const l of kq.luat) {
		if (l.vang.length > 0) {
			inRa(`KHONG AP DUNG: ${l.ten} — ${l.vang.join(", ")} vắng`);
			continue;
		}
		const nen =
			l.soTepNen > 0 ? ` (nen ${l.soTepNen} tep, ${l.trongNen} dong cu)` : "";
		if (l.moi.length === 0)
			inRa(`XANH ${l.ten}: ${kq.tep} tep, 0 vi pham moi${nen}`);
		for (const v of l.moi) inRa(`DO ${l.ten}: ${v.tep}:${v.so} ${v.chu}`);
		for (const t of l.thua) inRa(`NEN THUA ${l.ten}: ${t}`);
	}
}

function chepGuong(goc) {
	const ox = docOxlint(goc);
	const tep = [
		LUAT_KHO_CAY.oxlint,
		...ungDung(goc).flatMap((a) => [
			`${a.thuMuc}/package.json`,
			`${a.thuMuc}/${LUAT_KHO_CAY.ungDung.agent.tep}`,
		]),
		...LUAT_KHO_CAY.vung.flatMap((v) =>
			lietKe(goc, v, (n) => n === L.uiChung.tepShadcn),
		),
		L.vongDoi.schema,
		...tepNguon(goc, ox),
	].filter((t) => existsSync(join(goc, t)));
	const tam = mkdtempSync(join(tmpdir(), LUAT_KHO_CAY.tienToTam));
	for (const t of new Set(tep)) {
		mkdirSync(dirname(join(tam, t)), { recursive: true });
		cpSync(join(goc, t), join(tam, t));
	}
	return tam;
}

const DO = LUAT_KHO_CAY.thuMucThu;
const CO_DU_LUAT = "--du-luat";

const THU = {
	chung: `packages/${DO}/src`,
	app: `apps/${DO}`,
	api: `apps/${DO}api`,
	agentA: `apps/${DO}agent`,
	agentB: `apps/${DO}okr2`,
	web: `apps/${DO}web`,
};

const tepMoi = (tep, chu, so = 1) => ({
	tep,
	doi: (cu) => {
		if (cu !== null) khongDo(`pha: ${tep} da co`);
		return { moi: chu, ghim: `${tep}:${so}` };
	},
});

const tepSua = (tep, them) => ({
	tep,
	doi: (cu) => {
		if (cu === null) khongDo(`pha: thieu ${tep}`);
		const goc = cu.endsWith("\n") ? cu : `${cu}\n`;
		return { moi: `${goc}${them}`, ghim: `${tep}:${goc.split("\n").length}` };
	},
});

const moHinhThu = (ten, cot) =>
	`model ${ten} {\n  id String @id\n${cot.map((c) => `  ${c} DateTime?\n`).join("")}}\n`;

const lopThu = (thanLop) =>
	tepMoi(
		`${THU.api}/src/thu.service.ts`,
		`export class Thu {\n\tconstructor(private readonly db: never) {}\n${thanLop}}\n`,
		4,
	);

const goiMoi = (thuMuc, phu) =>
	tepMoi(
		`${thuMuc}/package.json`,
		JSON.stringify({ name: thuMuc.split("/").at(-1), dependencies: phu }),
	);

const appAgent = (thuMuc) => [
	goiMoi(thuMuc, { eve: "*" }),
	tepMoi(
		`${thuMuc}/${LUAT_KHO_CAY.ungDung.agent.tep}`,
		"export const agent = 1;\n",
	),
];

const appNest = (phu = {}) =>
	goiMoi(THU.api, { [LUAT_KHO_CAY.ungDung.nest.goi]: "*", ...phu });

const NEN_THU = {
	[L.chuThich.ten]: { [`${THU.chung}/nen.ts`]: ["// cu"] },
};

const nhapTu = (tep, nguon) =>
	tepMoi(tep, `import { agent } from "${nguon}";\nexport const thu = agent;\n`);

const PHA = [
	{
		ten: "chu-thich-dong",
		luat: L.chuThich.ten,
		...tepMoi(
			`${THU.chung}/chu-thich-dong.ts`,
			"export const thu = 1; // thu\n",
		),
	},
	{
		ten: "chu-thich-khoi",
		luat: L.chuThich.ten,
		...tepMoi(
			`${THU.chung}/chu-thich-khoi.ts`,
			"export const thu = 1;\n/* thu */\n",
			2,
		),
	},
	{
		ten: "chu-thich-jsx",
		luat: L.chuThich.ten,
		...tepMoi(
			`${THU.app}/chu-thich-jsx.tsx`,
			"export const Thu = () => <div>{/* thu */}</div>;\n",
		),
	},
	{
		ten: "doi-chung-url-va-regex",
		luat: L.chuThich.ten,
		xanh: true,
		...tepMoi(
			`${THU.chung}/url.ts`,
			'export const thuUrl = "https://vi.du/a//b";\nexport const thuRe = /\\/\\//;\n',
		),
	},
	{
		ten: "doi-chung-dong-nen-giu-nguyen",
		luat: L.chuThich.ten,
		xanh: true,
		nenThem: NEN_THU,
		...tepMoi(`${THU.chung}/nen.ts`, "// cu\nexport const a = 1;\n"),
	},
	{
		ten: "nen-them-dong-trung",
		luat: L.chuThich.ten,
		nenThem: NEN_THU,
		...tepMoi(`${THU.chung}/nen.ts`, "// cu\n// cu\nexport const a = 1;\n", 2),
	},
	{
		ten: "nen-doi-chu-thich-cung-so-dem",
		luat: L.chuThich.ten,
		nenThem: NEN_THU,
		...tepMoi(`${THU.chung}/nen.ts`, "// khac\nexport const a = 1;\n"),
	},
	{
		ten: "api-doi-ten-nhap-sdk-model",
		luat: L.triKhon.ten,
		buoc: [
			appNest(),
			tepMoi(
				`${THU.api}/src/nhap-ai.ts`,
				'import { generateText } from "ai";\nexport const thu = generateText;\n',
			),
		],
	},
	{
		ten: "api-khai-goi-roi-nhap-vendor",
		luat: L.triKhon.ten,
		buoc: [
			appNest({ ai: "^7.0.0", "context.dev": "2.10.0" }),
			tepMoi(
				`${THU.api}/src/khai-roi-nhap.ts`,
				'import ContextDev from "context.dev";\nexport const thu = ContextDev;\n',
			),
		],
	},
	{
		ten: "api-nhap-dong-app-agent",
		luat: L.triKhon.ten,
		buoc: [
			...appAgent(THU.agentA),
			appNest(),
			tepMoi(
				`${THU.api}/src/nhap-dong.ts`,
				`export const thu = () => import("../../${DO}agent/agent/agent");\n`,
			),
		],
	},
	{
		ten: "record-unknown",
		luat: L.kieuLong.ten,
		...tepMoi(
			`${THU.chung}/record.ts`,
			"export type Thu = Record<string, unknown>;\n",
		),
	},
	{
		ten: "as-unknown-as",
		luat: L.kieuLong.ten,
		...tepMoi(
			`${THU.chung}/ep-kep.ts`,
			"export const thu = 1 as unknown as string;\n",
		),
	},
	{
		ten: "thoi-luong-ngoai-cau-hinh",
		luat: L.hangSo.ten,
		...tepMoi(`${THU.chung}/thoi-luong.ts`, "export const thu = 4 * 60_000;\n"),
	},
	{
		ten: "thoi-luong-giay-nhan-phut",
		luat: L.hangSo.ten,
		...tepMoi(
			`${THU.api}/thoi-luong.ts`,
			"export const thu = 5 * 60 * 1000;\n",
		),
	},
	{
		ten: "doi-chung-thoi-luong-trong-config",
		luat: L.hangSo.ten,
		xanh: true,
		...tepMoi(`${THU.chung}/thu-config.ts`, "export const thu = 4 * 60_000;\n"),
	},
	{
		ten: "doi-chung-don-vi-tuan",
		luat: L.hangSo.ten,
		xanh: true,
		...tepMoi(
			`${THU.chung}/don-vi.ts`,
			"export const tuanMs = 7 * 24 * 60 * 60 * 1000;\n",
		),
	},
	{
		ten: "thu-muc-components-ui",
		luat: L.uiChung.ten,
		...tepMoi(
			`${THU.app}/components/ui/button.tsx`,
			"export const Button = () => null;\n",
		),
	},
	{
		ten: "nhap-radix-ngoai-ui",
		luat: L.uiChung.ten,
		...tepMoi(
			`${THU.app}/radix.tsx`,
			'import { Dialog } from "radix-ui";\nexport const Thu = Dialog;\n',
		),
	},
	{
		ten: "components-json-tro-sai",
		luat: L.uiChung.ten,
		...tepMoi(
			`${THU.app}/components.json`,
			JSON.stringify({ aliases: { ui: "@/components/ui" } }, null, "\t"),
		),
	},
	{
		ten: "agent-doi-ten-nhap-agent-khac",
		luat: L.cachLy.ten,
		buoc: [
			...appAgent(THU.agentA),
			...appAgent(THU.agentB),
			nhapTu(`${THU.agentB}/agent/nhap.ts`, `../../${DO}agent/agent/agent`),
		],
	},
	{
		ten: "agent-nhap-ten-goi-agent-khac",
		luat: L.cachLy.ten,
		buoc: [
			...appAgent(THU.agentA),
			...appAgent(THU.agentB),
			nhapTu(`${THU.agentA}/agent/nhap.ts`, `${DO}okr2/agent/agent`),
		],
	},
	{
		ten: "agent-nhap-app-thuong",
		luat: L.cachLy.ten,
		buoc: [
			...appAgent(THU.agentA),
			goiMoi(THU.web, {}),
			tepMoi(`${THU.web}/agent.ts`, "export const agent = 1;\n"),
			nhapTu(`${THU.agentA}/agent/nhap.ts`, `../../${DO}web/agent`),
		],
	},
	{
		ten: "agent-test-trong-lib-nhap-nest",
		luat: L.cachLy.ten,
		buoc: [
			...appAgent(THU.agentA),
			appNest(),
			tepMoi(
				`${THU.agentA}/agent/lib/dung-that.ts`,
				'export { cau } from "./test/cau";\n',
			),
			tepMoi(
				`${THU.agentA}/agent/lib/test/cau.ts`,
				`export { agent as cau } from "../../../../${DO}api/src/x";\n`,
			),
		],
	},
	{
		ten: "ma-that-nhap-test-cua-app",
		luat: L.cachLy.ten,
		buoc: [
			...appAgent(THU.agentA),
			appNest(),
			tepMoi(
				`${THU.agentA}/test/support/cau.ts`,
				`export { agent as cau } from "../../../${DO}api/src/x";\n`,
			),
			tepMoi(
				`${THU.agentA}/agent/lib/dung-that.ts`,
				'export { cau } from "../../test/support/cau";\n',
			),
		],
	},
	{
		ten: "spec-ngoai-test-nhap-nest",
		luat: L.cachLy.ten,
		buoc: [
			...appAgent(THU.agentA),
			appNest(),
			nhapTu(`${THU.agentA}/agent/lib/may.spec.ts`, `../../../${DO}api/src/x`),
		],
	},
	{
		ten: "dom-ngoai-test-nhap-nest",
		luat: L.cachLy.ten,
		buoc: [
			...appAgent(THU.agentA),
			appNest(),
			nhapTu(
				`${THU.agentA}/agent/lib/khung.dom.tsx`,
				`../../../${DO}api/src/x`,
			),
		],
	},
	{
		ten: "test-cua-agent-nhap-app-khong-phai-nest",
		luat: L.cachLy.ten,
		buoc: [
			...appAgent(THU.agentA),
			goiMoi(THU.web, {}),
			tepMoi(`${THU.web}/agent.ts`, "export const agent = 1;\n"),
			nhapTu(`${THU.agentA}/test/web.ts`, `../../${DO}web/agent`),
		],
	},
	{
		ten: "doi-chung-test-cua-agent-nhap-nest",
		luat: L.cachLy.ten,
		xanh: true,
		buoc: [
			...appAgent(THU.agentA),
			appNest(),
			nhapTu(`${THU.agentA}/test/support/gieo.ts`, `../../../${DO}api/src/x`),
		],
	},
	{
		ten: "vd-hai-cot",
		luat: L.vongDoi.ten,
		...tepSua(L.vongDoi.schema, moHinhThu("DoThuHaiCot", L.vongDoi.cotCat)),
	},
	{
		ten: "vd-mot-cot",
		luat: L.vongDoi.ten,
		xanh: true,
		...tepSua(
			L.vongDoi.schema,
			moHinhThu("DoThuMotCot", [L.vongDoi.cotDanhDau]),
		),
	},
	{
		ten: "vd-list-khong-loc",
		luat: L.vongDoi.ten,
		buoc: [
			appNest(),
			lopThu(
				"\tasync listThu() {\n\t\treturn this.db.company.findMany({ where: {} });\n\t}\n",
			),
		],
	},
	{
		ten: "vd-list-loc-qua-ham-phu",
		luat: L.vongDoi.ten,
		xanh: true,
		buoc: [
			appNest(),
			lopThu(
				"\tasync listThu() {\n\t\treturn this.db.company.findMany({ where: this.dieuKien() });\n\t}\n\tdieuKien() {\n\t\treturn { archivedAt: null };\n\t}\n",
			),
		],
	},
	{
		ten: "vd-khong-ten-list",
		luat: L.vongDoi.ten,
		xanh: true,
		buoc: [
			appNest(),
			lopThu(
				"\tasync layTheoTen() {\n\t\treturn this.db.company.findMany({ where: {} });\n\t}\n",
			),
		],
	},
	{
		ten: "vd-xoa-khong-kiem",
		luat: L.vongDoi.ten,
		buoc: [
			appNest(),
			lopThu(
				"\tasync purgeThu(id: string) {\n\t\treturn this.db.division.delete({ where: { id } });\n\t}\n",
			),
		],
	},
	{
		ten: "vd-xoa-kiem-qua-ham-phu",
		luat: L.vongDoi.ten,
		xanh: true,
		buoc: [
			appNest(),
			lopThu(
				'\tasync purgeThu(id: string) {\n\t\tawait this.lyDo(id);\n\t\treturn this.db.division.delete({ where: { id } });\n\t}\n\tasync lyDo(id: string) {\n\t\tconst d = await this.db.division.findUnique({ where: { id } });\n\t\tif (d.archivedAt === null) throw new Error("chua luu tru");\n\t}\n',
			),
		],
	},
	{
		ten: "du-luat-cay-thieu-app-ma-2",
		cayRieng: { duLuat: true, ma: 2, can: "KHONG DO DUOC: thieu luat:" },
	},
	{
		ten: "khong-co-co-thi-khong-ap-dung-ma-0",
		cayRieng: { duLuat: false, ma: 0, can: "KHONG AP DUNG:" },
	},
	{
		ten: "khong-nap-duoc-typescript",
		thieuTs: true,
	},
	{
		ten: "khong-do-thieu-oxlint",
		ma: 2,
		tep: LUAT_KHO_CAY.oxlint,
		xoa: true,
	},
];

function lamBuoc(tam, buoc) {
	const duong = join(tam, buoc.tep);
	const cu = existsSync(duong) ? readFileSync(duong, "utf8") : null;
	const hoan = () => {
		if (cu === null) rmSync(duong, { force: true });
		else writeFileSync(duong, cu);
	};
	if (buoc.xoa) {
		if (cu === null) khongDo(`pha: thieu ${buoc.tep}`);
		rmSync(duong);
		return { hoan, ghim: null };
	}
	const { moi, ghim } = buoc.doi(cu);
	mkdirSync(dirname(duong), { recursive: true });
	writeFileSync(duong, moi);
	return { hoan, ghim };
}

function lamPha(tam, ca) {
	const daLam = [];
	const hoan = () => {
		for (const x of daLam.reverse()) x.hoan();
		rmSync(join(tam, "packages", DO), { recursive: true, force: true });
		for (const d of readdirSync(join(tam, "apps")))
			if (d.startsWith(DO))
				rmSync(join(tam, "apps", d), { recursive: true, force: true });
	};
	try {
		for (const buoc of ca.buoc ?? [ca]) daLam.push(lamBuoc(tam, buoc));
	} catch (e) {
		hoan();
		throw e;
	}
	return { hoan, ghim: daLam.at(-1).ghim };
}

function ganNen(them) {
	const nen = { ...LUAT_KHO_CAY.nen };
	for (const [luat, tep] of Object.entries(them ?? {}))
		nen[luat] = { ...nen[luat], ...tep };
	return nen;
}

function mauLuat(kq) {
	return Object.fromEntries(kq.luat.map((l) => [l.ten, l.moi.length > 0]));
}

function chamPha(ca, ghim, kq, mauGoc) {
	if (ca.ma === 2)
		return kq === null ? "exit 2" : `KHONG BAT: van do duoc (ma ${kq.ma})`;
	if (kq === null) return "KHONG BAT: khong do duoc";
	const l = kq.luat.find((x) => x.ten === ca.luat);
	if (l.vang.length > 0)
		return `KHONG BAT: ${ca.luat} khong ap dung, ${l.vang.join(", ")} vắng`;
	const khac = kq.luat.filter(
		(x) => x.ten !== ca.luat && x.moi.length > 0 && !mauGoc[x.ten],
	);
	if (khac.length > 0)
		return `KHONG BAT: luat khac doi mau ${khac.map((x) => x.ten).join(", ")}`;
	if (ca.xanh) {
		const tep = ghim.slice(0, ghim.lastIndexOf(":"));
		const gia = l.moi.filter((v) => v.tep === tep);
		return gia.length > 0
			? `KHONG BAT: do gia ${gia.map((v) => `${v.tep}:${v.so}`).join(", ")}`
			: `khong do trong ${tep}`;
	}
	const trungGhim = l.moi.find((v) => `${v.tep}:${v.so}` === ghim);
	return trungGhim
		? `exit ${kq.ma} · DO ${ca.luat}: ${ghim} ${trungGhim.chu}`
		: `KHONG BAT: ${ca.luat} khong nem ${ghim}`;
}

function thuThieuTs(tam) {
	const rieng = mkdtempSync(join(tmpdir(), LUAT_KHO_CAY.tienToTam));
	try {
		for (const t of ["do-cay.mjs", "cau-hinh.mjs"])
			cpSync(join(dirname(TEP), t), join(rieng, t));
		const { NODE_PATH, ...env } = process.env;
		const r = spawnSync(
			process.execPath,
			[join(rieng, "do-cay.mjs"), "--chi-do", tam],
			{ encoding: "utf8", env },
		);
		const dong = (r.stdout ?? "")
			.split("\n")
			.find((d) => d.startsWith("KHONG DO DUOC"));
		return r.status === 2 && dong
			? `exit 2 · ${dong}`
			: `KHONG BAT: exit ${r.status} ${(r.stdout ?? "").trim().split("\n").at(-1)}`;
	} finally {
		rmSync(rieng, { recursive: true, force: true });
	}
}

function thuCayRieng(tam, yeu) {
	const cay = mkdtempSync(join(tmpdir(), LUAT_KHO_CAY.tienToTam));
	try {
		cpSync(join(tam, LUAT_KHO_CAY.oxlint), join(cay, LUAT_KHO_CAY.oxlint));
		for (const t of [`packages/${DO}/src/a.ts`, `apps/${DO}/a.ts`]) {
			mkdirSync(dirname(join(cay, t)), { recursive: true });
			writeFileSync(join(cay, t), "export const a = 1;\n");
		}
		const r = spawnSync(
			process.execPath,
			[TEP, "--chi-do", cay, ...(yeu.duLuat ? [CO_DU_LUAT] : [])],
			{ encoding: "utf8" },
		);
		const dong = (r.stdout ?? "")
			.split("\n")
			.find((d) => d.startsWith(yeu.can));
		return r.status === yeu.ma && dong
			? `exit ${r.status} · ${dong}`
			: `KHONG BAT: exit ${r.status} ${(r.stdout ?? "").trim().split("\n").at(-1)}`;
	} finally {
		rmSync(cay, { recursive: true, force: true });
	}
}

function chamMotPha(tam, ca, mauGoc) {
	if (ca.thieuTs) return thuThieuTs(tam);
	if (ca.cayRieng) return thuCayRieng(tam, ca.cayRieng);
	let lam;
	try {
		lam = lamPha(tam, ca);
	} catch (e) {
		if (!(e instanceof KhongDo)) throw e;
		return `KHONG BAT: ${e.message}`;
	}
	let kq = null;
	try {
		kq = ketQua(tam, ganNen(ca.nenThem));
	} catch (e) {
		if (!(e instanceof KhongDo)) throw e;
	} finally {
		lam.hoan();
	}
	return chamPha(ca, lam.ghim, kq, mauGoc);
}

function chieuDo(goc, mauGoc, inRa) {
	const tam = chepGuong(goc);
	let bat = 0;
	try {
		for (const ca of PHA) {
			const cham = chamMotPha(tam, ca, mauGoc);
			const dung = !cham.startsWith("KHONG BAT");
			if (dung) bat += 1;
			inRa(`${dung ? "DUNG" : "SAI"} pha-${ca.ten}: ${cham}`);
		}
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
	return bat;
}

function thieuLuat(kq, duLuat, inRa) {
	const thieu = duLuat ? kq.luat.filter((l) => l.vang.length > 0) : [];
	for (const l of thieu) inRa(`KHONG DO DUOC: thieu luat: ${l.ten}`);
	return thieu.length > 0;
}

function chayDu(goc, duLuat) {
	const kq = ketQua(goc);
	inKetQua(kq, (d) => console.log(d));
	console.log(
		`app Nest: ${kq.nest.join(", ") || "-"} · app agent: ${kq.agent.join(", ") || "-"} · goi cam trong app Nest: ${kq.cam.join(", ")}`,
	);
	const bat = chieuDo(goc, mauLuat(kq), (d) => console.log(`chieu do -> ${d}`));
	const duPha = bat === PHA.length;
	const thieu = thieuLuat(kq, duLuat, (d) => console.log(d));
	const ma = duPha && !thieu ? kq.ma : 2;
	const apDung = kq.luat.filter((l) => l.vang.length === 0);
	console.log(
		`KET LUAN: cay ${kq.ma === 0 ? "xanh" : "do"} (${apDung.filter((l) => l.moi.length === 0).length}/${apDung.length} luat ap dung xanh, ${kq.luat.length - apDung.length} khong ap dung${duLuat ? ", doi du luat" : ""}), chieu do ${bat}/${PHA.length}${duPha ? "" : " — thuoc hong, khong tin duoc"} — ma thoat ${ma}`,
	);
	return ma;
}

function main() {
	const thamSo = process.argv.slice(2);
	const duLuat = thamSo.includes(CO_DU_LUAT);
	const [cheDo, duong] = thamSo.filter((x) => x !== CO_DU_LUAT);
	try {
		if (!ts) khongDo(`khong nap duoc typescript: ${NAP_TS.loi}`);
		if (cheDo === "--nen") {
			console.log(JSON.stringify(nenTuCay(ketQua(duong, {})), null, "\t"));
			return 0;
		}
		if (cheDo === "--chi-do" || cheDo === "--tho") {
			const kq = ketQua(duong, cheDo === "--tho" ? {} : LUAT_KHO_CAY.nen);
			inKetQua(kq, (d) => console.log(d));
			return thieuLuat(kq, duLuat, (d) => console.log(d)) ? 2 : kq.ma;
		}
		return chayDu(cheDo === "--goc" ? duong : GOC, duLuat);
	} catch (e) {
		const lyDo = e instanceof KhongDo ? e.message : `loi bat ngo: ${e.message}`;
		console.log(`KHONG DO DUOC: ${lyDo}`);
		return 2;
	}
}

process.exit(main());
