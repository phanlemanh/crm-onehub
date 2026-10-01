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

function tenGoi(goc, tep) {
	const goi = docJson(goc, tep);
	if (!goi.name) khongDo(`${tep} thieu name`);
	return goi;
}

function goiCam(goc) {
	const t = L.triKhon;
	const tenApp = t.goiAppAgent.map((p) => tenGoi(goc, p).name);
	return [...new Set([...t.goiCam, ...tenApp])].sort();
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
	};
	const daThay = new Set();
	const nut = (n) => {
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
		trong(t, L.triKhon.api) && !laKiem(t)
			? dong(t, nhapSang(t, p, L.triKhon.thuMucAgent, nc.cam), nhapIn)
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
	[L.cachLy.ten]: (t, p, nc) =>
		L.cachLy.cap
			.filter((c) => trong(t, c.tu))
			.flatMap((c) =>
				dong(t, nhapSang(t, p, [c.den], [nc.tenApp[c.den]]), nhapIn),
			),
};

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

function kiemCay(goc) {
	const ox = docOxlint(goc);
	const tep = tepNguon(goc, ox);
	if (tep.length === 0) khongDo("khong co tep nguon nao");
	for (const thuMuc of [...L.cachLy.cap.map((c) => c.tu), L.triKhon.api])
		if (!tep.some((t) => trong(t, thuMuc)))
			khongDo(`${thuMuc} khong co tep ma nao`);
	const nc = {
		ox,
		cam: goiCam(goc),
		tenApp: Object.fromEntries(
			L.cachLy.cap.map((c) => [
				c.den,
				tenGoi(goc, `${c.den}/package.json`).name,
			]),
		),
	};
	const viPham = Object.fromEntries(THU_TU.map((t) => [t, []]));
	for (const t of tep) {
		const chu = readFileSync(join(goc, t), "utf8");
		const p = phanTich(t, chu);
		const dongChu = chu.split("\n");
		for (const ten of THU_TU)
			viPham[ten].push(
				...HAM_LUAT[ten](t, p, nc).map((v) => ({
					...v,
					van: chuanHoa(dongChu[v.so - 1] ?? ""),
				})),
			);
	}
	viPham[L.uiChung.ten].push(...kiemShadcn(goc));
	return { tep: tep.length, cam: nc.cam, viPham };
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
		...apNen(ten, d.viPham[ten], nen),
	}));
	return { ...d, luat, ma: luat.some((l) => l.moi.length > 0) ? 1 : 0 };
}

function inKetQua(kq, inRa) {
	for (const l of kq.luat) {
		const nen =
			l.soTepNen > 0 ? ` (nen ${l.soTepNen} tep, ${l.trongNen} dong cu)` : "";
		if (l.moi.length === 0)
			inRa(`XANH ${l.ten}: ${kq.tep} tep, 0 vi pham moi${nen}`);
		for (const v of l.moi) inRa(`DO ${l.ten}: ${v.tep}:${v.so} ${v.chu}`);
		for (const t of l.thua) inRa(`NEN THUA ${l.ten}: ${t}`);
	}
}

function chepGuong() {
	const ox = docOxlint(GOC);
	const tep = [
		LUAT_KHO_CAY.oxlint,
		L.triKhon.goiApi,
		...L.triKhon.goiAppAgent,
		...L.cachLy.cap.map((c) => `${c.den}/package.json`),
		...LUAT_KHO_CAY.vung.flatMap((v) =>
			lietKe(GOC, v, (n) => n === L.uiChung.tepShadcn),
		),
		...tepNguon(GOC, ox),
	];
	const tam = mkdtempSync(join(tmpdir(), LUAT_KHO_CAY.tienToTam));
	for (const t of new Set(tep)) {
		mkdirSync(dirname(join(tam, t)), { recursive: true });
		cpSync(join(GOC, t), join(tam, t));
	}
	return tam;
}

function soDongCuoi(chu) {
	return chu.endsWith("\n")
		? chu.split("\n").length
		: chu.split("\n").length + 1;
}

const canCo = (tep, cu) => {
	if (cu === null) khongDo(`pha: thieu ${tep}`);
};

const noiCuoi = (tep, dongThem) => ({
	tep,
	doi: (cu) => {
		canCo(tep, cu);
		return {
			moi: `${cu.endsWith("\n") ? cu : `${cu}\n`}${dongThem}\n`,
			ghim: `${tep}:${soDongCuoi(cu)}`,
		};
	},
});

const chenDau = (tep, dongThem) => ({
	tep,
	doi: (cu) => {
		canCo(tep, cu);
		return { moi: `${dongThem}\n${cu}`, ghim: `${tep}:1` };
	},
});

const tepMoi = (tep, chu) => ({
	tep,
	doi: (cu) => {
		if (cu !== null) khongDo(`pha: ${tep} da co`);
		return { moi: chu, ghim: `${tep}:1` };
	},
});

const PHA = [
	{
		ten: "chu-thich-dong",
		luat: L.chuThich.ten,
		...noiCuoi("apps/agent-okr/agent/agent.ts", "const thu = 1; // thu"),
	},
	{
		ten: "chu-thich-khoi",
		luat: L.chuThich.ten,
		...noiCuoi("apps/api/src/okr/soan.service.ts", "/* thu */"),
	},
	{
		ten: "chu-thich-jsx",
		luat: L.chuThich.ten,
		...tepMoi(
			"apps/app/components/thu-chu-thich.tsx",
			"export const Thu = () => <div>{/* thu */}</div>;\n",
		),
	},
	{
		ten: "chu-thich-vuot-nen",
		luat: L.chuThich.ten,
		...noiCuoi("apps/api/src/create-app.ts", "// thu"),
	},
	{
		ten: "doi-chung-url-trong-chuoi",
		luat: L.chuThich.ten,
		xanh: true,
		...noiCuoi(
			"apps/agent-okr/agent/agent.ts",
			'export const thuUrl = "https://vi.du/a//b"; export const thuRe = /\\/\\//;',
		),
	},
	{
		ten: "api-nhap-sdk-model",
		luat: L.triKhon.ten,
		...chenDau(
			"apps/api/src/okr/soan.service.ts",
			'import { generateText } from "ai";',
		),
	},
	{
		ten: "api-nhap-vendor",
		luat: L.triKhon.ten,
		...chenDau(
			"apps/api/src/okr/soan.service.ts",
			'import ContextDev from "context.dev";',
		),
	},
	{
		ten: "api-nhap-dong-agent",
		luat: L.triKhon.ten,
		...noiCuoi(
			"apps/api/src/okr/soan.service.ts",
			'export const thu = () => import("../../../agent/agent/lib/dispatch-config");',
		),
	},
	{
		ten: "record-unknown",
		luat: L.kieuLong.ten,
		...noiCuoi(
			"packages/validation/src/okr-cuoc-soan.ts",
			"export type Thu = Record<string, unknown>;",
		),
	},
	{
		ten: "as-unknown-as",
		luat: L.kieuLong.ten,
		...noiCuoi(
			"apps/api/src/okr/soan.service.ts",
			"export const thu = (1 as unknown as string);",
		),
	},
	{
		ten: "thoi-luong-ngoai-cau-hinh",
		luat: L.hangSo.ten,
		...noiCuoi(
			"apps/agent-okr/agent/agent.ts",
			"export const thu = 4 * 60_000;",
		),
	},
	{
		ten: "thoi-luong-giay-nhan-phut",
		luat: L.hangSo.ten,
		...noiCuoi(
			"apps/api/src/okr/soan.service.ts",
			"export const thu = 5 * 60 * 1000;",
		),
	},
	{
		ten: "doi-chung-thoi-luong-trong-config",
		luat: L.hangSo.ten,
		xanh: true,
		...noiCuoi(
			"apps/agent-okr/agent/lib/config.ts",
			"export const thu = 4 * 60_000;",
		),
	},
	{
		ten: "thu-muc-components-ui",
		luat: L.uiChung.ten,
		...tepMoi(
			"apps/app/components/ui/button.tsx",
			"export const Button = () => null;\n",
		),
	},
	{
		ten: "nhap-radix-ngoai-ui",
		luat: L.uiChung.ten,
		...chenDau(
			"apps/app/components/agent-builder/agent-builder-chat.tsx",
			'import { Dialog } from "radix-ui";',
		),
	},
	{
		ten: "components-json-tro-sai",
		luat: L.uiChung.ten,
		tep: "apps/app/components.json",
		doi: (cu) => {
			const j = JSON.parse(cu);
			j.aliases.ui = "@/components/ui";
			return {
				moi: JSON.stringify(j, null, "\t"),
				ghim: "apps/app/components.json:1",
			};
		},
	},
	{
		ten: "okr-nhap-agent",
		luat: L.cachLy.ten,
		...chenDau(
			"apps/agent-okr/agent/lib/config.ts",
			'import { DISPATCH } from "../../../agent/agent/lib/dispatch-config";',
		),
	},
	{
		ten: "agent-nhap-okr",
		luat: L.cachLy.ten,
		...chenDau(
			"apps/agent/agent/lib/dispatch-config.ts",
			'import { x } from "../../../agent-okr/agent/lib/config";',
		),
	},
	{
		ten: "okr-nhap-ten-goi-agent",
		luat: L.cachLy.ten,
		...chenDau(
			"apps/agent-okr/agent/lib/config.ts",
			'import x from "agent/agent";',
		),
	},
	{
		ten: "api-khai-goi-roi-nhap",
		luat: L.triKhon.ten,
		buoc: [
			{
				tep: L.triKhon.goiApi,
				doi: (cu) => {
					canCo(L.triKhon.goiApi, cu);
					const j = JSON.parse(cu);
					j.dependencies = {
						...j.dependencies,
						ai: "^7.0.0",
						"context.dev": "2.10.0",
					};
					return { moi: JSON.stringify(j, null, "\t"), ghim: null };
				},
			},
			chenDau(
				"apps/api/src/okr/soan.service.ts",
				'import ContextDev from "context.dev";',
			),
		],
	},
	{
		ten: "nen-doi-chu-thich-cung-so-dem",
		luat: L.chuThich.ten,
		tep: "apps/api/src/create-app.ts",
		doi: (cu) => {
			canCo("apps/api/src/create-app.ts", cu);
			const dong = cu.split("\n");
			const i = dong.findIndex(
				(d) => d.trim().startsWith("//") && !L.chuThich.chiThi.test(d.trim()),
			);
			if (i === -1) khongDo("pha: create-app.ts khong con chu thich nen");
			dong[i] = dong[i].replace(/\/\/.*$/, "// thu doi chu thich khac");
			return {
				moi: dong.join("\n"),
				ghim: `apps/api/src/create-app.ts:${i + 1}`,
			};
		},
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
	};
	try {
		for (const buoc of ca.buoc ?? [ca]) daLam.push(lamBuoc(tam, buoc));
	} catch (e) {
		hoan();
		throw e;
	}
	return { hoan, ghim: daLam.at(-1).ghim };
}

function mauLuat(kq) {
	return Object.fromEntries(kq.luat.map((l) => [l.ten, l.moi.length > 0]));
}

function chamPha(ca, ghim, kq, mauGoc) {
	if (ca.ma === 2)
		return kq === null ? "exit 2" : `KHONG BAT: van do duoc (ma ${kq.ma})`;
	if (kq === null) return "KHONG BAT: khong do duoc";
	const l = kq.luat.find((x) => x.ten === ca.luat);
	const trungGhim = l.moi.find((v) => `${v.tep}:${v.so}` === ghim);
	const khac = kq.luat.filter(
		(x) => x.ten !== ca.luat && x.moi.length > 0 !== mauGoc[x.ten],
	);
	if (khac.length > 0)
		return `KHONG BAT: luat khac doi mau ${khac.map((x) => x.ten).join(", ")}`;
	if (ca.xanh)
		return trungGhim ? `KHONG BAT: do gia ${ghim}` : `khong do tai ${ghim}`;
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
			[join(rieng, "do-cay.mjs"), "--goc", tam],
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

function chieuDo(mauGoc, inRa) {
	const tam = chepGuong();
	let bat = 0;
	try {
		for (const ca of PHA) {
			if (ca.thieuTs) {
				const cham = thuThieuTs(tam);
				const dung = !cham.startsWith("KHONG BAT");
				if (dung) bat += 1;
				inRa(`${dung ? "DUNG" : "SAI"} pha-${ca.ten}: ${cham}`);
				continue;
			}
			let lam;
			try {
				lam = lamPha(tam, ca);
			} catch (e) {
				if (!(e instanceof KhongDo)) throw e;
				inRa(`SAI pha-${ca.ten}: ${e.message}`);
				continue;
			}
			let kq = null;
			try {
				kq = ketQua(tam);
			} catch (e) {
				if (!(e instanceof KhongDo)) throw e;
			} finally {
				lam.hoan();
			}
			const cham = chamPha(ca, lam.ghim, kq, mauGoc);
			const dung = !cham.startsWith("KHONG BAT");
			if (dung) bat += 1;
			inRa(`${dung ? "DUNG" : "SAI"} pha-${ca.ten}: ${cham}`);
		}
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
	return bat;
}

function main() {
	const [, , cheDo, duong] = process.argv;
	try {
		if (!ts) khongDo(`khong nap duoc typescript: ${NAP_TS.loi}`);
		if (cheDo === "--nen") {
			console.log(JSON.stringify(nenTuCay(ketQua(duong, {})), null, "\t"));
			return 0;
		}
		if (cheDo === "--goc" || cheDo === "--tho") {
			const kq = ketQua(duong, cheDo === "--tho" ? {} : LUAT_KHO_CAY.nen);
			inKetQua(kq, (d) => console.log(d));
			return kq.ma;
		}
		const kq = ketQua(GOC);
		inKetQua(kq, (d) => console.log(d));
		console.log(`goi cam trong ${L.triKhon.api}: ${kq.cam.join(", ")}`);
		const bat = chieuDo(mauLuat(kq), (d) => console.log(`chieu do -> ${d}`));
		const duPha = bat === PHA.length;
		const ma = duPha ? kq.ma : 2;
		console.log(
			`KET LUAN: cay ${kq.ma === 0 ? "xanh" : "do"} (${kq.luat.filter((l) => l.moi.length === 0).length}/${kq.luat.length} luat xanh), chieu do ${bat}/${PHA.length}${duPha ? "" : " — thuoc hong, khong tin duoc"} — ma thoat ${ma}`,
		);
		return ma;
	} catch (e) {
		const lyDo = e instanceof KhongDo ? e.message : `loi bat ngo: ${e.message}`;
		console.log(`KHONG DO DUOC: ${lyDo}`);
		return 2;
	}
}

process.exit(main());
