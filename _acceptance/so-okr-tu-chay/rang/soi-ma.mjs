import { execFileSync, spawnSync } from "node:child_process";
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
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ts = createRequire(import.meta.url)("typescript");

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const MOC = "origin/onehub";
const LOAI_TRU = new Set([
	"node_modules",
	".next",
	"dist",
	"build",
	"generated",
	".turbo",
]);
const THU_MUC_THU = new Set(["test", "tests", "__tests__"]);
const LA_THU = /\.(spec|test)\.(ts|tsx|mts|mjs|js)$/;

const SUA = new Set([
	"update",
	"updateMany",
	"updateManyAndReturn",
	"upsert",
	"delete",
	"deleteMany",
]);
const SUA_LONG = new Set([...SUA, "set", "disconnect"]);
const TAO = new Set(["create", "createMany", "createManyAndReturn"]);
const TAO_LONG = new Set([...TAO, "connectOrCreate"]);
const SQL_THO = new Set([
	"$executeRaw",
	"$queryRaw",
	"$executeRawUnsafe",
	"$queryRawUnsafe",
]);
const DUOC_TAO = new Map([
	["apps/agent/agent/lib/okr-chup.ts", null],
	["packages/db/src/okr-chi-so.ts", new Set(["chupKrCrm"])],
	["apps/api/src/okr/okr-so.service.ts", new Set(["ghiSoKr"])],
]);
const TEP_CHUP = "apps/agent/agent/lib/okr-chup.ts";

const VUNG_APP = /^apps\/app\/(?!app\/proto\/).+\.tsx$/;
const VUNG_UI = /^packages\/ui\/src\/components\/.+\.tsx$/;
const VUNG_MOI =
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
const COPY_UI = "packages/ui/src/components/copy-value.tsx";
const COPY_CU = "apps/app/app/(app)/[slug]/settings/copy-value.tsx";
const BIEN_SHEETS = ["GOOGLE_SHEETS_EMAIL", "GOOGLE_SHEETS_KHOA"];
const TEP_BIEN = [".env.example", "apps/api/src/config/env.validation.ts"];
const TEP_CAU_HINH_SO = "packages/db/src/okr-so-config.ts";

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
};

const tuongDoi = (p) => (p.startsWith(GOC) ? p.slice(GOC.length + 1) : p);

const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();

function diCay(thuMuc, duoi, ra) {
	if (!existsSync(thuMuc)) return ra;
	for (const ten of readdirSync(thuMuc)) {
		if (LOAI_TRU.has(ten) || THU_MUC_THU.has(ten)) continue;
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) diCay(duong, duoi, ra);
		else if (duoi.test(ten) && !LA_THU.test(ten)) ra.push(duong);
	}
	return ra;
}

function cay(duong, chu = readFileSync(duong, "utf8")) {
	return ts.createSourceFile(
		duong,
		chu,
		ts.ScriptTarget.Latest,
		true,
		/\.tsx$/.test(duong) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

const dongCuaChu = (chu, doan) =>
	chu.slice(0, chu.lastIndexOf(doan)).split("\n").length;

const dongCua = (sf, pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;

const tenThuoc = (n) => {
	if (ts.isPropertyAccessExpression(n)) return n.name.text;
	if (
		ts.isElementAccessExpression(n) &&
		ts.isStringLiteralLike(n.argumentExpression)
	)
		return n.argumentExpression.text;
	return null;
};

const doiTuongCua = (n) =>
	ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)
		? n.expression
		: null;

function hamBaoQuanh(n) {
	for (let p = n.parent; p; p = p.parent) {
		if (
			(ts.isFunctionDeclaration(p) ||
				ts.isMethodDeclaration(p) ||
				ts.isFunctionExpression(p)) &&
			p.name
		)
			return p.name.getText();
		if (
			(ts.isArrowFunction(p) || ts.isFunctionExpression(p)) &&
			ts.isVariableDeclaration(p.parent)
		)
			return p.parent.name.getText();
	}
	return "(cap tep)";
}

function tenGoi(n) {
	const e = ts.isTaggedTemplateExpression(n) ? n.tag : n.expression;
	return tenThuoc(e) ?? (ts.isIdentifier(e) ? e.text : null);
}

function soiChiThem(duong, vaiTro, ten) {
	const chu = readFileSync(duong, "utf8");
	if (!/okrSoChup|soChup/.test(chu)) return { hong: [], tao: [] };
	const sf = cay(duong, chu);
	const hong = [];
	const tao = [];
	const duoc = DUOC_TAO.has(vaiTro) ? DUOC_TAO.get(vaiTro) : undefined;
	const ghiTao = (n, cach) => {
		const ham = hamBaoQuanh(n);
		const o = `${ten}:${dongCua(sf, n.getStart(sf))}`;
		const hopLe = duoc !== undefined && (duoc === null || duoc.has(ham));
		tao.push({ tep: ten, o, cach, ham, hopLe });
		if (!hopLe)
			hong.push(
				`okrSoChup tạo ngoài chỗ được phép: ${o} (${cach} trong ${ham})`,
			);
	};
	const di = (n) => {
		if (ts.isCallExpression(n)) {
			const ham = tenThuoc(n.expression);
			const dt = doiTuongCua(n.expression);
			if (ham && dt && tenThuoc(dt) === "okrSoChup") {
				if (SUA.has(ham))
					hong.push(
						`okrSoChup bị sửa: ${ten}:${dongCua(sf, n.getStart(sf))} (${ham})`,
					);
				else if (TAO.has(ham)) ghiTao(n, ham);
			}
		}
		if (
			(ts.isCallExpression(n) || ts.isTaggedTemplateExpression(n)) &&
			SQL_THO.has(tenGoi(n) ?? "")
		) {
			const sql = ts.isTaggedTemplateExpression(n)
				? n.template.getText(sf)
				: n.arguments.map((a) => a.getText(sf)).join(" ");
			if (/okrSoChup/i.test(sql) && /\b(UPDATE|DELETE|TRUNCATE)\b/i.test(sql))
				hong.push(
					`okrSoChup bị sửa: ${ten}:${dongCua(sf, n.getStart(sf))} (SQL thô ${tenGoi(n)})`,
				);
		}
		if (
			ts.isPropertyAssignment(n) &&
			n.name.getText(sf) === "soChup" &&
			ts.isObjectLiteralExpression(n.initializer)
		) {
			for (const p of n.initializer.properties) {
				const k = p.name?.getText(sf);
				if (!k) continue;
				if (SUA_LONG.has(k))
					hong.push(
						`okrSoChup bị sửa: ${ten}:${dongCua(sf, p.getStart(sf))} (lồng soChup.${k})`,
					);
				else if (TAO_LONG.has(k)) ghiTao(p, `soChup.${k}`);
			}
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return { hong, tao };
}

function caChiThem(thay = new Map()) {
	const tep = [
		...diCay(join(GOC, "apps"), /\.tsx?$/, []),
		...diCay(join(GOC, "packages"), /\.tsx?$/, []),
	];
	const hong = [];
	const tao = [];
	for (const duong of tep) {
		const vaiTro = tuongDoi(duong);
		const that = thay.get(vaiTro) ?? duong;
		const r = soiChiThem(that, vaiTro, tuongDoi(that));
		hong.push(...r.hong);
		tao.push(...r.tao);
	}
	console.log(`so tep .ts/.tsx da soi (tru test/): ${tep.length}`);
	for (const t of tao)
		console.log(`${t.hopLe ? "tao " : "HONG"} ${t.o} ${t.cach} trong ${t.ham}`);
	const theoTep = new Map();
	for (const t of tao) theoTep.set(t.tep, (theoTep.get(t.tep) ?? 0) + 1);
	for (const [t, n] of theoTep)
		console.log(`tep ghi okrSoChup: ${t} — ${n} loi goi tao`);
	console.log(`tong loi goi tao okrSoChup: ${tao.length}`);
	for (const h of hong) console.log(h);
	return { hong, tao };
}

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
			dong: dongCua(sf, c.pos),
			chu: chu.slice(c.pos, c.end).split("\n")[0].slice(0, 60),
		}));
}

function soiTepMoi(duong, ten) {
	const sf = cay(duong);
	const hong = [];
	for (const c of chuThichTrong(sf))
		hong.push(`chú thích mã: ${ten}:${c.dong} «${c.chu}»`);
	const di = (n) => {
		if (
			ts.isTypeReferenceNode(n) &&
			n.typeName.getText(sf) === "Record" &&
			n.typeArguments?.length === 2 &&
			n.typeArguments[0].kind === ts.SyntaxKind.StringKeyword &&
			n.typeArguments[1].kind === ts.SyntaxKind.UnknownKeyword
		)
			hong.push(
				`Record<string, unknown>: ${ten}:${dongCua(sf, n.getStart(sf))}`,
			);
		if (ts.isCallExpression(n)) {
			const e = n.expression;
			const la =
				(ts.isIdentifier(e) && e.text === "useEffect") ||
				(ts.isPropertyAccessExpression(e) && e.name.text === "useEffect");
			if (la)
				hong.push(`useEffect( trần: ${ten}:${dongCua(sf, n.getStart(sf))}`);
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return hong;
}

function dauHieuVeTay(chu, ten) {
	return DAU_HIEU.filter(({ mau }) => mau.test(chu)).map(
		({ nhan }) => `dấu hiệu vẽ tay: ${nhan} (${ten})`,
	);
}

function dongThem(t) {
	return git("diff", "-U0", `${MOC}...HEAD`, "--", t)
		.split("\n")
		.filter((d) => d.startsWith("+") && !d.startsWith("+++"))
		.map((d) => d.slice(1))
		.join("\n");
}

function giaTriHang(n) {
	if (ts.isNumericLiteral(n)) return Number(n.text.replace(/_/g, ""));
	if (ts.isParenthesizedExpression(n)) return giaTriHang(n.expression);
	if (ts.isBinaryExpression(n)) {
		const a = giaTriHang(n.left);
		const b = giaTriHang(n.right);
		if (a === null || b === null) return null;
		if (n.operatorToken.kind === ts.SyntaxKind.AsteriskToken) return a * b;
		if (n.operatorToken.kind === ts.SyntaxKind.PlusToken) return a + b;
	}
	return null;
}

function soTranNgoaiCauHinh(duong, ten, tran) {
	const sf = cay(duong);
	const hong = [];
	const di = (n) => {
		if (ts.isBinaryExpression(n) || ts.isNumericLiteral(n)) {
			const cha = n.parent;
			const trongBieuThuc =
				cha && ts.isBinaryExpression(cha) && giaTriHang(cha) !== null;
			const v = giaTriHang(n);
			if (!trongBieuThuc && v !== null)
				for (const t of tran)
					if (v === t.giaTri)
						hong.push(
							`${t.nhan} ${n.getText(sf)} ngoài OKR_SO: ${ten}:${dongCua(sf, n.getStart(sf))}`,
						);
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return hong;
}

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

function copyValue() {
	const hong = [];
	if (!existsSync(join(GOC, COPY_UI)))
		hong.push(`CopyValue không nằm ở ${COPY_UI}`);
	if (existsSync(join(GOC, COPY_CU)))
		hong.push(`CopyValue cũ còn ở ${COPY_CU}`);
	let dung = 0;
	for (const duong of diCay(join(GOC, "apps/app"), /\.(ts|tsx)$/, [])) {
		const chu = readFileSync(duong, "utf8");
		if (!/copy-value|CopyValue/.test(chu)) continue;
		const sf = cay(duong, chu);
		for (const st of sf.statements) {
			if (!ts.isImportDeclaration(st)) continue;
			const tu = st.moduleSpecifier.text;
			const ten = st.importClause?.namedBindings;
			const coCopy =
				/copy-value$/.test(tu) ||
				(ten &&
					ts.isNamedImports(ten) &&
					ten.elements.some((e) => e.name.text === "CopyValue"));
			if (!coCopy) continue;
			if (tu.startsWith("@crm/ui/")) dung += 1;
			else
				hong.push(
					`CopyValue nhập ngoài @crm/ui: ${tuongDoi(duong)}:${dongCua(sf, st.getStart(sf))} («${tu}»)`,
				);
		}
	}
	console.log(`cho nhap CopyValue tu @crm/ui: ${dung}`);
	if (dung === 0) hong.push("không chỗ nào nhập CopyValue từ @crm/ui");
	return hong;
}

async function caThietKe() {
	const dai = `${MOC}...HEAD`;
	const theoLoc = (loc) =>
		git("diff", "--name-only", `--diff-filter=${loc}`, dai)
			.split("\n")
			.filter(Boolean);
	const moi = new Set(theoLoc("A"));
	const doi = theoLoc("AM").filter((t) => existsSync(join(GOC, t)));
	const khongThu = (t) =>
		!t.split("/").some((p) => THU_MUC_THU.has(p)) && !LA_THU.test(t);
	const app = doi.filter((t) => VUNG_APP.test(t) && khongThu(t)).sort();
	const tepMoi = [...moi]
		.filter((t) => VUNG_MOI.test(t) && existsSync(join(GOC, t)))
		.filter((t) => !t.split("/").includes("generated"))
		.sort();
	const { OKR_SO } = await import(join(GOC, TEP_CAU_HINH_SO));
	const tran = [
		{ nhan: "trần trang", giaTri: OKR_SO.banGhi.coTrang },
		{ nhan: "khoảng thử lại", giaTri: OKR_SO.sheets.thuLaiMs },
	];
	const okrMoi = tepMoi.filter(
		(t) =>
			/okr/i.test(basename(t)) &&
			/\.(ts|tsx)$/.test(t) &&
			khongThu(t) &&
			t !== TEP_CAU_HINH_SO,
	);

	console.log(`dai so sanh: ${dai}`);
	console.log(`tep giao dien apps/app (${app.length}):`);
	for (const t of app) console.log(`  ${t}`);
	console.log(`tep moi soi chu thich / Record / useEffect (${tepMoi.length}):`);
	for (const t of tepMoi) console.log(`  ${t}`);
	console.log(`tep okr moi soi so tran (${okrMoi.length}):`);
	for (const t of okrMoi) console.log(`  ${t}`);

	const hong = [];
	const kit = app.length > 0 ? goiKit() : null;
	for (const t of app) {
		const r = spawnSync(
			"node",
			[
				join(kit, "scripts", "design-gate.mjs"),
				"--target",
				t,
				"--mode",
				"static",
			],
			{ cwd: GOC, encoding: "utf8" },
		);
		const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
		const p0 = Number(ra.match(/"p0_count":\s*(\d+)/)?.[1] ?? Number.NaN);
		if (r.status !== 0 || p0 !== 0)
			hong.push(`design-gate P0: ${t} (ma ${r.status}, p0 ${p0})`);
		const tuTruoc = dauHieuVeTay(readFileSync(join(GOC, t), "utf8"), t);
		const moiThem = dauHieuVeTay(dongThem(t), t);
		hong.push(...moiThem);
		for (const h of tuTruoc)
			if (!moiThem.includes(h))
				console.log(`co tu truoc, dong cu khong tinh: ${h}`);
		console.log(
			`design-gate ${r.status === 0 && p0 === 0 ? "dat " : "HONG"} ${t} (p0 ${p0})`,
		);
	}
	hong.push(...copyValue());
	for (const t of tepMoi) hong.push(...soiTepMoi(join(GOC, t), t));
	for (const t of okrMoi)
		hong.push(...soTranNgoaiCauHinh(join(GOC, t), t, tran));
	let soApi = 0;
	const doiApi = new Set(doi.filter((t) => t.startsWith("apps/api/src/")));
	for (const duong of diCay(
		join(GOC, "apps/api/src"),
		/\.(ts|tsx|js|mjs)$/,
		[],
	)) {
		soApi += 1;
		const t = tuongDoi(duong);
		if (!readFileSync(duong, "utf8").includes("googleapis.com")) continue;
		const lotVao =
			t.startsWith("apps/api/src/okr/") ||
			(doiApi.has(t) && dongThem(t).includes("googleapis.com"));
		if (lotVao) hong.push(`apps/api gọi googleapis.com: ${t}`);
		else
			console.log(
				`co tu truoc ngoai okr, dong cu khong tinh: googleapis.com trong ${t}`,
			);
	}
	console.log(
		`tep apps/api/src soi googleapis.com: ${soApi} (okr: ca tep; ngoai okr: dong diff them)`,
	);
	for (const t of TEP_BIEN) {
		const chu = readFileSync(join(GOC, t), "utf8");
		for (const b of BIEN_SHEETS)
			if (!chu.includes(b)) hong.push(`thiếu biến ${b} trong ${t}`);
	}
	console.log(
		`bien ${BIEN_SHEETS.join(", ")} soi trong: ${TEP_BIEN.join(", ")}`,
	);
	return { hong, app };
}

function inVaThoat(hong) {
	for (const h of hong) console.log(`HONG ${h}`);
	console.log(`vi pham: ${hong.length}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

const ca = doiSo("--ca");
if (ca !== "chi-them" && ca !== "thiet-ke") {
	console.log("KHONG DO DUOC: can --ca chi-them hoac --ca thiet-ke");
	process.exit(2);
}
const chieuDo = process.argv.includes("--chieu-do");

if (ca === "chi-them" && !chieuDo) {
	const { hong, tao } = caChiThem();
	if (tao.length === 0) {
		console.log(
			"KHONG DO DUOC: khong tim thay loi goi tao okrSoChup nao — soi sai thu muc?",
		);
		process.exit(2);
	}
	inVaThoat(hong);
}

if (ca === "chi-them" && chieuDo) {
	const thuMuc = mkdtempSync(join(tmpdir(), "soi-chi-them-"));
	const tep = join(thuMuc, "okr-chup.ts");
	const goc = readFileSync(join(GOC, TEP_CHUP), "utf8");
	const chen = `\nexport async function suaSo(id: string) {\n\tawait db.okrSoChup.updateMany({ where: { keyResultId: id }, data: { giaTri: 0 } });\n}\n`;
	const banSao = `${goc}${chen}`;
	writeFileSync(tep, banSao);
	const dong = dongCuaChu(banSao, "okrSoChup.updateMany");
	const ghim = `okrSoChup bị sửa: ${tep}:${dong}`;
	let kq;
	try {
		kq = caChiThem(new Map([[TEP_CHUP, tep]]));
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
	const bat = kq.hong.some((h) => h.startsWith(ghim));
	console.log(
		`chieu do: chen okrSoChup.updateMany vao ban sao okr-chup.ts dong ${dong} — ${bat ? `bat, in «${ghim}»` : `LOT, khong in «${ghim}»`}`,
	);
	process.exit(bat ? 1 : 0);
}

if (ca === "thiet-ke" && !chieuDo) {
	const { hong, app } = await caThietKe();
	if (app.length === 0) {
		console.log("KHONG DO DUOC: diff khong co tep giao dien apps/app nao");
		process.exit(2);
	}
	inVaThoat(hong);
}

if (ca === "thiet-ke" && chieuDo) {
	const nguon = git("diff", "--name-only", "--diff-filter=AM", `${MOC}...HEAD`)
		.split("\n")
		.find(
			(t) =>
				VUNG_APP.test(t) && existsSync(join(GOC, t)) && !t.includes("/test/"),
		);
	if (!nguon) {
		console.log(
			"KHONG DO DUOC: diff khong co tep giao dien apps/app nao de chep",
		);
		process.exit(2);
	}
	const thuMuc = mkdtempSync(join(tmpdir(), "soi-thiet-ke-"));
	const tep = join(thuMuc, basename(nguon));
	const goc = readFileSync(join(GOC, nguon), "utf8");
	const banSao = `${goc}\n// x\nexport function KhoiGia() {\n\treturn <div className="divide-y" />;\n}\n`;
	writeFileSync(tep, banSao);
	const dong = dongCuaChu(banSao, "\n// x\n") + 1;
	let hong;
	try {
		hong = [...soiTepMoi(tep, tep), ...dauHieuVeTay(banSao, tep)];
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
	for (const h of hong) console.log(`HONG ${h}`);
	const ghim = [
		`chú thích mã: ${tep}:${dong}`,
		`dấu hiệu vẽ tay: divide-y (${tep})`,
	];
	let lot = 0;
	for (const g of ghim) {
		const bat = hong.some((h) => h.startsWith(g));
		if (!bat) lot += 1;
		console.log(`${bat ? "bat " : "LOT "} ${g}`);
	}
	console.log(
		`chieu do: ban sao ${nguon} chen \`// x\` va divide-y — ${ghim.length - lot}/${ghim.length} vi pham bi bat`,
	);
	process.exit(lot === 0 ? 1 : 0);
}
