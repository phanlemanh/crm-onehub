import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
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
	".eve",
]);
const THU_MUC_THU = new Set(["test", "tests", "__tests__"]);
const LA_THU = /\.(spec|test|dom)\.(ts|tsx|mts|mjs|js)$/;
const VUNG_APP = /^apps\/app\/.+\.tsx$/;
const VUNG_MA =
	/^(apps|packages|scripts|_acceptance\/[^/]+\/rang)\/.+\.(ts|tsx|mts|mjs|js)$/;
const THU_MUC_CHU = "apps/app/lib/messages/";
const DINH_DANH_MOT = [
	"lichSuMucTieu",
	"QUAN_HE_LICH_SU_MUC_TIEU",
	"QUAN_HE_DI_THEO_MUC_TIEU",
	"QUAN_HE_LICH_SU_KR",
	"QUAN_HE_DI_THEO_KR",
];
const DEM_LICH_SU_O_MAN =
	/\b(_count|checkIns|nhinLai|mangSangDi|mangSangTu|chuDeHoiY)\b/;
const TEP_DOCS = "docs/api.md";
const TEN_DOCS = ["xoaMucTieu", "dungLaiMucTieu", "daBo", "chuaLuuTru"];
const TEP_TU_DIEN = "CONTEXT.md";
const MUC_TU_DIEN = [
	"**Lưu trữ**",
	"**Đã lưu trữ**",
	"**Xoá**",
	"**Xoá vĩnh viễn**",
	"**Bỏ · Dùng lại**",
];
const CHU_CAM = [
	{ nhan: "Xoá hẳn", mau: /Xo[aá] hẳn/i },
	{ nhan: "xoá mềm", mau: /xo[aá] mềm/i },
	{ nhan: "archive", mau: /\barchive/i },
	{ nhan: "da-bo", mau: /\bda-bo\b/ },
	{ nhan: "archived", mau: /\barchived\b/i },
];

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
};

const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	}).trim();

let GOC_SO = null;
const gocSo = () => {
	GOC_SO ??= git("merge-base", "HEAD", MOC);
	return GOC_SO;
};

const tepDiff = (loc) =>
	git(
		"diff",
		"--name-only",
		"--no-renames",
		`--diff-filter=${loc}`,
		`${gocSo()}`,
	)
		.split("\n")
		.filter(Boolean);

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

function dongThem(t, duong) {
	const thu = mkdtempSync(join(tmpdir(), "soi-dong-them-"));
	try {
		const cu = join(thu, "cu");
		const r0 = spawnSync("git", ["-C", GOC, "show", `${gocSo()}:${t}`], {
			encoding: "utf8",
			maxBuffer: 64 * 1024 * 1024,
		});
		writeFileSync(cu, r0.status === 0 ? r0.stdout : "");
		const r = spawnSync(
			"git",
			["diff", "--no-index", "-U0", "--no-color", cu, duong],
			{
				encoding: "utf8",
				maxBuffer: 64 * 1024 * 1024,
			},
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
		.map((d, k) => ({ d, so: k + 1 }))
		.filter((x) => them.has(x.so));

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
	return [...gap.values()].map((c) => ({
		dong: dongViTri(sf, c.pos),
		chu: chu.slice(c.pos, c.end).split("\n")[0].slice(0, 60),
	}));
}

function soiTepMoi(duong, ten, laApp) {
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
		if (laApp && ts.isCallExpression(n)) {
			const e = n.expression;
			if (
				(ts.isIdentifier(e) && e.text === "useEffect") ||
				(ts.isPropertyAccessExpression(e) && e.name.text === "useEffect")
			)
				hong.push(
					`useEffect( trong apps/app: ${ten}:${dongViTri(sf, n.getStart(sf))}`,
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

function dinhNghiaXuat(sf) {
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

function moiDinhDanhMotNoi(them = []) {
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
		)
		.map((t) => ({ ten: t, duong: join(GOC, t) }));
	for (const { ten, duong } of [...tep, ...them]) {
		const chu = readFileSync(duong, "utf8");
		if (!DINH_DANH_MOT.some((d) => chu.includes(d))) continue;
		for (const d of dinhNghiaXuat(cayMa(duong, chu)))
			if (theoTen.has(d.ten)) theoTen.get(d.ten).push(`${ten}:${d.dong}`);
	}
	console.log(
		`tep apps/ + packages/ soi dinh nghia: ${tep.length + them.length}`,
	);
	for (const [ten, noi] of theoTen) {
		console.log(`dinh nghia ${ten}: ${noi.join(", ") || "(khong co)"}`);
		if (noi.length !== 1)
			hong.push(`${ten} phải định nghĩa đúng một chỗ (thấy ${noi.length})`);
	}
	return hong;
}

const boVo = (n) =>
	ts.isParenthesizedExpression(n) ||
	ts.isAsExpression(n) ||
	ts.isSatisfiesExpression?.(n)
		? boVo(n.expression)
		: n;
const tenKhoa = (p) =>
	ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ? p.name.text : null;
const laChuoi = (n) =>
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
		if (laChuoi(than))
			ra.set(duong.join("."), {
				chu: than.getText(sf).replace(/\s+/g, " "),
				dong: dongViTri(sf, than.getStart(sf)),
			});
	};
	di(goc, []);
	return ra;
}

function chuViEn(duong) {
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
					goc[d.name.text] = d.initializer;
	return goc.vi && goc.en
		? { vi: laTuCuaChu(sf, goc.vi), en: laTuCuaChu(sf, goc.en) }
		: null;
}

function soiChu(tepChu, duongCua, tenCua) {
	const hong = [];
	let soMoi = 0;
	for (const t of tepChu) {
		const cap = chuViEn(duongCua(t));
		if (!cap) continue;
		const them = dongThem(t, duongCua(t));
		for (const [khoa, v] of cap.vi) {
			if (!them.has(v.dong)) continue;
			soMoi += 1;
			const e = cap.en.get(khoa);
			if (!e) hong.push(`chữ mới thiếu bản en: ${tenCua(t)} ${khoa}`);
			else if (e.chu === v.chu)
				hong.push(`chữ mới vi và en giống nhau: ${tenCua(t)} ${khoa}`);
			for (const c of CHU_CAM)
				if (c.mau.test(v.chu))
					hong.push(`chữ cấm «${c.nhan}»: ${tenCua(t)} ${khoa}`);
		}
	}
	console.log(`khoa chu moi (vi) da soi: ${soMoi}`);
	if (soMoi === 0) hong.push("không tìm thấy khoá chữ mới nào để soi");
	return hong;
}

function soiTaiLieu() {
	const hong = [];
	const api = readFileSync(join(GOC, TEP_DOCS), "utf8");
	for (const ten of TEN_DOCS)
		if (!api.includes(ten)) hong.push(`${TEP_DOCS} thiếu chữ ${ten}`);
	const tuDien = readFileSync(join(GOC, TEP_TU_DIEN), "utf8");
	for (const muc of MUC_TU_DIEN)
		if (!tuDien.includes(`\n${muc}:`))
			hong.push(`${TEP_TU_DIEN} thiếu mục ${muc}`);
	console.log(
		`tai lieu: ${TEP_DOCS} (${TEN_DOCS.join(", ")}) · ${TEP_TU_DIEN} (${MUC_TU_DIEN.join(", ")})`,
	);
	return hong;
}

function caChu(thay = new Map()) {
	const duongCua = (t) => thay.get(t) ?? join(GOC, t);
	const tenCua = (t) => thay.get(t) ?? t;
	const tepChu = tepDiff("AM")
		.filter((t) => t.startsWith(THU_MUC_CHU) && /\.ts$/.test(t))
		.sort();
	console.log(
		`tep chu doi trong luot (${tepChu.length}): ${tepChu.map(tenCua).join(", ")}`,
	);
	return [...soiChu(tepChu, duongCua, tenCua), ...soiTaiLieu()];
}

function caThietKe(thay = new Map()) {
	console.log(`dai so sanh: ${gocSo().slice(0, 9)}..cay (--no-renames)`);
	const duongCua = (t) => thay.get(t) ?? join(GOC, t);
	const tenCua = (t) => thay.get(t) ?? t;
	const khongThu = (t) =>
		!t.split("/").some((p) => THU_MUC_THU.has(p)) && !LA_THU.test(t);
	const khongSinh = (t) => !t.split("/").some((p) => LOAI_TRU.has(p));
	const moi = new Set(tepDiff("A"));
	const doi = tepDiff("AM").filter((t) => existsSync(join(GOC, t)));
	const app = doi.filter((t) => VUNG_APP.test(t) && khongThu(t)).sort();
	const tepMa = doi.filter((t) => VUNG_MA.test(t) && khongSinh(t)).sort();
	const hong = [];
	const kit = app.length > 0 ? goiKit() : null;
	for (const t of app) {
		const r = spawnSync(
			"node",
			[
				join(kit, "scripts", "design-gate.mjs"),
				"--target",
				duongCua(t),
				"--mode",
				"static",
			],
			{ cwd: GOC, encoding: "utf8" },
		);
		const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
		const p0 = Number(ra.match(/"p0_count":\s*(\d+)/)?.[1] ?? Number.NaN);
		if (r.status !== 0 || p0 !== 0)
			hong.push(`design-gate P0: ${tenCua(t)} (ma ${r.status}, p0 ${p0})`);
		console.log(
			`design-gate ${r.status === 0 && p0 === 0 ? "dat " : "HONG"} ${tenCua(t)} (p0 ${p0})`,
		);
	}
	for (const t of tepMa) {
		const them = dongThem(t, duongCua(t));
		for (const c of chuThichTrong(cayMa(duongCua(t))))
			if (them.has(c.dong))
				hong.push(`chú thích mã: ${tenCua(t)}:${c.dong} «${c.chu}»`);
		if (t.startsWith("apps/app/") && khongThu(t))
			for (const { d, so } of chuDong(readFileSync(duongCua(t), "utf8"), them))
				if (DEM_LICH_SU_O_MAN.test(d))
					hong.push(`màn tự đếm lịch sử: ${tenCua(t)}:${so}`);
		if (moi.has(t))
			hong.push(
				...soiTepMoi(duongCua(t), tenCua(t), t.startsWith("apps/app/")),
			);
	}
	const themDinhNghia = [...thay.entries()].map(([, duong]) => ({
		ten: duong,
		duong,
	}));
	hong.push(...moiDinhDanhMotNoi(themDinhNghia));
	const soTep = new Set([...app, ...tepMa]).size;
	console.log(
		`tep giao dien apps/app: ${app.length} · tep ma: ${tepMa.length} · tong tep da soi: ${soTep}`,
	);
	return { hong, soTep };
}

function inVaThoat(hong) {
	for (const h of hong) console.log(`HONG ${h}`);
	console.log(
		hong.length === 0
			? "KET LUAN: xanh"
			: `KET LUAN: do ${hong.length} vi pham`,
	);
	process.exit(hong.length === 0 ? 0 : 1);
}

function batDo(ghim, hong) {
	let lot = 0;
	for (const g of ghim) {
		const bat = hong.some((h) => h.startsWith(g));
		if (!bat) lot += 1;
		console.log(`${bat ? "bat " : "LOT "} ${g}`);
	}
	console.log(`chieu do: ${ghim.length - lot}/${ghim.length} vi pham bi bat`);
	process.exit(lot === 0 ? 1 : 0);
}

function chieuDoChu() {
	const nguon = "apps/app/lib/messages/okr.ts";
	const thu = mkdtempSync(join(tmpdir(), "soi-chu-"));
	const tep = join(thu, basename(nguon));
	try {
		const goc = readFileSync(join(GOC, nguon), "utf8");
		const dauVi = goc.indexOf("const vi = {");
		const dauEn = goc.indexOf("const en: OkrMessages = {");
		if (dauVi === -1 || dauEn === -1) {
			console.log("KHONG DO DUOC: khong thay khoi vi/en trong tep chu");
			process.exit(2);
		}
		const chen = (chu, moc, them) => {
			const i = chu.indexOf("{", moc) + 1;
			return `${chu.slice(0, i)}\n\tthuDo: "Xoá hẳn mục tiêu",${them}${chu.slice(i)}`;
		};
		const banSao = chen(
			chen(goc, goc.indexOf("const en: OkrMessages = {"), ""),
			goc.indexOf("const vi = {"),
			"",
		);
		writeFileSync(tep, banSao);
		const hong = caChu(new Map([[nguon, tep]]));
		for (const h of hong) console.log(`HONG ${h}`);
		batDo(
			[
				`chữ mới vi và en giống nhau: ${tep} thuDo`,
				`chữ cấm «Xoá hẳn»: ${tep} thuDo`,
			],
			hong,
		);
	} finally {
		rmSync(thu, { recursive: true, force: true });
	}
}

function chieuDoThietKe() {
	const nguon = tepDiff("AM").find(
		(t) =>
			VUNG_APP.test(t) &&
			!t.includes("/test/") &&
			!t.startsWith("apps/app/app/proto/") &&
			existsSync(join(GOC, t)),
	);
	if (!nguon) {
		console.log(
			"KHONG DO DUOC: diff khong co tep giao dien apps/app nao de chep",
		);
		process.exit(2);
	}
	const thu = mkdtempSync(join(tmpdir(), "soi-thiet-ke-"));
	const tep = join(thu, basename(nguon));
	try {
		const goc = readFileSync(join(GOC, nguon), "utf8");
		const banSao = `${goc}\n// x\nexport function lichSuMucTieu() {\n\treturn null;\n}\n`;
		writeFileSync(tep, banSao);
		const dongChu = dongCuaChu(banSao, "\n// x\n") + 1;
		const { hong } = caThietKe(new Map([[nguon, tep]]));
		for (const h of hong) console.log(`HONG ${h}`);
		batDo(
			[
				`chú thích mã: ${tep}:${dongChu}`,
				"lichSuMucTieu phải định nghĩa đúng một chỗ (thấy 2)",
			],
			hong,
		);
	} finally {
		rmSync(thu, { recursive: true, force: true });
	}
}

const CA = {
	chu: {
		thuong: () => inVaThoat(caChu()),
		chieuDo: chieuDoChu,
	},
	"thiet-ke": {
		thuong: () => {
			const { hong, soTep } = caThietKe();
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
if (process.argv.includes("--chieu-do")) chay.chieuDo();
else chay.thuong();
