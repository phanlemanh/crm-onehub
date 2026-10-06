import { execFileSync, spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ts = createRequire(import.meta.url)("typescript");

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const LUOT = "dot-hoi-y-tuong-okr";
const GOP_DO = process.env.SOI_MA_GOP ?? null;
const MOC = GOP_DO ? `${GOP_DO}^1` : "origin/onehub";
const NHANH_MOC = "onehub";
const DUOI = /\.(ts|tsx|mts)$/;
const LA_THU = /\.(spec|test|dom)\.(ts|tsx|mts)$/;
const LOAI_TRU = new Set([
	"node_modules",
	".next",
	"dist",
	"build",
	"generated",
	".turbo",
]);
const THU_MUC_THU = new Set(["test", "tests", "__tests__"]);
const LA_THU_THIET_KE = /\.(spec|test|dom)\.(ts|tsx|mts|mjs|js)$/;
const VUNG_APP = /^apps\/app\/(?!app\/proto\/).+\.tsx$/;
const VUNG_MA =
	/^(apps|packages|scripts|_acceptance\/[^/]+\/rang)\/.+\.(ts|tsx|mts|mjs|js)$/;
const VUNG_CHU = /^apps\/app\/lib\/messages\/okr[^/]*\.ts$/;
const VUNG_CHU_MAN =
	/^apps\/app\/(lib\/messages\/okr[^/]*\.ts|app\/\(app\)\/\[slug\]\/okr\/.+\.tsx?)$/;
const THU_MUC_OKR_API = "apps/api/src/okr";
const TEP_TU_DIEN = "CONTEXT.md";
const MOT_CHO = [
	{
		ten: "y",
		ham: "chieuYChoNguoiXem",
		khoaTra: ["ds", "chuDe"],
		nhan: "chỗ trả ý",
	},
	{
		ten: "ban-truoc",
		ham: "docBanTruoc",
		khoaTra: ["banTruoc"],
		nhan: "chỗ trả bản viết trước",
	},
];
const KHOA_PRISMA = new Set([
	"include",
	"select",
	"where",
	"data",
	"orderBy",
	"omit",
	"_count",
	"create",
	"update",
]);
const MUC_TU_DIEN = [
	{ ten: "Hỏi ý mục tiêu", mau: /^\*\*Hỏi ý mục tiêu\*\*:/m },
	{ ten: "Ý (hỏi ý)", mau: /^\*\*Ý \(hỏi ý\)\*\*:/m },
	{ ten: "Người chọn", mau: /^\*\*Người chọn\*\*:/m },
	{ ten: "Bản viết trước", mau: /^\*\*Bản viết trước\*\*:/m },
	{ ten: "Chủ đề (hỏi ý)", mau: /^\*\*Chủ đề \(hỏi ý\)\*\*:/m },
	{ ten: "Ý lạ", mau: /^\*\*Ý lạ\*\*:/m },
	{ ten: "Kết luận (chủ đề)", mau: /^\*\*Kết luận \(chủ đề\)\*\*:/m },
	{ ten: "Kho ý", mau: /^\*\*Kho ý\*\*:/m },
];
const CHU_CAM = /đợt/i;
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
const GHIM = {
	chuThich: "chú thích mã",
	huy: "nút Huỷ không bọc SheetClose/DialogClose",
	thieuEn: "khoá chữ thiếu en",
	motCho: "không qua hàm một chỗ",
	demLech: "đếm chỗ trả khác đếm lời gọi",
	tuDien: "CONTEXT.md thiếu mục",
	dot: "chữ màn có «đợt»",
};

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
};

const tuongDoi = (p) => (p.startsWith(GOC) ? p.slice(GOC.length + 1) : p);

const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();

function khongDoDuoc(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function diCay(thuMuc, ra) {
	if (!existsSync(thuMuc)) return ra;
	for (const ten of readdirSync(thuMuc)) {
		if (LOAI_TRU.has(ten) || THU_MUC_THU.has(ten)) continue;
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

const tenKhoa = (p) =>
	p.name && (ts.isIdentifier(p.name) || ts.isStringLiteralLike(p.name))
		? p.name.text
		: null;

const dongCua = (sf, pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;

const dongCuaChu = (chu, doan) =>
	chu.slice(0, chu.lastIndexOf(doan)).split("\n").length;

function keoMoc() {
	if (git("rev-parse", "--is-shallow-repository") === "true")
		khongDoDuoc(
			`kho la ban sao nong (shallow) — ${MOC}...HEAD khong co merge-base tin duoc; chay git fetch --unshallow roi do lai`,
		);
	const keo = spawnSync("git", ["-C", GOC, "fetch", "origin", NHANH_MOC], {
		encoding: "utf8",
	});
	if (keo.status !== 0)
		khongDoDuoc(
			`git fetch origin ${NHANH_MOC} thoat ${keo.status}: ${(keo.stderr ?? "").trim().split("\n").at(-1)}`,
		);
	const goc = spawnSync("git", ["-C", GOC, "merge-base", "HEAD", MOC], {
		encoding: "utf8",
	});
	if (goc.status !== 0 || !goc.stdout.trim())
		khongDoDuoc(`khong tim duoc merge-base HEAD ${MOC}`);
	return goc.stdout.trim();
}

function tepDiff(loc) {
	return git(
		"diff",
		"--name-only",
		"--no-renames",
		`--diff-filter=${loc}`,
		`${MOC}...HEAD`,
	)
		.split("\n")
		.filter(Boolean);
}

function banGoc(gocSo, t) {
	const r = spawnSync("git", ["-C", GOC, "show", `${gocSo}:${t}`], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	return r.status === 0 ? r.stdout : "";
}

function dongThem(gocSo, t, duong) {
	const thu = mkdtempSync(join(tmpdir(), "soi-hoi-y-dong-them-"));
	try {
		const cu = join(thu, "cu");
		writeFileSync(cu, banGoc(gocSo, t));
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

function soiDongThem(duong, ten, them) {
	const sf = cay(duong, readFileSync(duong, "utf8"));
	const hong = chuThichTrong(sf)
		.filter((c) => them.has(c.dong))
		.map((c) => `${GHIM.chuThich}: ${ten}:${c.dong} «${c.chu}»`);
	const di = (n) => {
		if (
			ts.isTypeReferenceNode(n) &&
			n.typeName.getText(sf) === "Record" &&
			n.typeArguments?.length === 2 &&
			n.typeArguments[0].kind === ts.SyntaxKind.StringKeyword &&
			n.typeArguments[1].kind === ts.SyntaxKind.UnknownKeyword &&
			them.has(dongCua(sf, n.getStart(sf)))
		)
			hong.push(
				`Record<string, unknown>: ${ten}:${dongCua(sf, n.getStart(sf))}`,
			);
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

const tenThe = (n) =>
	ts.isJsxElement(n)
		? n.openingElement.tagName.getText()
		: ts.isJsxSelfClosingElement(n)
			? n.tagName.getText()
			: null;

function nutHuy(duong, ten, them) {
	const sf = cay(duong, readFileSync(duong, "utf8"));
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
					const dong = dongCua(sf, n.getStart(sf));
					if (!boc && them.has(dong)) hong.push(`${GHIM.huy}: ${ten}:${dong}`);
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

function boVo(n) {
	let e = n;
	while (
		e &&
		(ts.isAsExpression(e) ||
			ts.isSatisfiesExpression(e) ||
			ts.isParenthesizedExpression(e))
	)
		e = e.expression;
	return e;
}

function phang(obj, sf, tien, ra) {
	for (const p of obj.properties) {
		if (!ts.isPropertyAssignment(p)) {
			ra.set(`${tien}${p.getText(sf).slice(0, 40)}`, {
				gia: `(khong doc duoc: ${ts.SyntaxKind[p.kind]})`,
				dong: dongCua(sf, p.getStart(sf)),
			});
			continue;
		}
		const k = tenKhoa(p);
		if (k === null) continue;
		const g = boVo(p.initializer);
		if (ts.isObjectLiteralExpression(g)) phang(g, sf, `${tien}${k}.`, ra);
		else
			ra.set(`${tien}${k}`, {
				gia: ts.isStringLiteralLike(g) ? g.text : g.getText(sf),
				dong: dongCua(sf, p.getStart(sf)),
			});
	}
	return ra;
}

function khoaChu(chu, ten) {
	const sf = cay(`${ten}.ts`, chu);
	const bang = {};
	const di = (n) => {
		if (
			ts.isVariableDeclaration(n) &&
			ts.isIdentifier(n.name) &&
			(n.name.text === "vi" || n.name.text === "en") &&
			n.initializer
		) {
			const g = boVo(n.initializer);
			if (ts.isObjectLiteralExpression(g))
				bang[n.name.text] = phang(g, sf, "", new Map());
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return bang;
}

function soiChu(gocSo, t, duong, ten) {
	const hong = [];
	const nay = khoaChu(readFileSync(duong, "utf8"), ten);
	if (!nay.vi || !nay.en)
		return {
			hong: [`tệp chữ ${ten} không có hai bảng const vi / const en`],
			moi: 0,
		};
	const cu = khoaChu(banGoc(gocSo, t), `${ten}.goc`);
	const cuVi = cu.vi ?? new Map();
	const cuEn = cu.en ?? new Map();
	let moi = 0;
	for (const [k, v] of nay.vi) {
		if (cuVi.get(k)?.gia === v.gia && cuEn.has(k)) continue;
		moi += 1;
		const e = nay.en.get(k);
		if (!e) hong.push(`${GHIM.thieuEn}: ${ten} «${k}» (dong ${v.dong})`);
		else if (e.gia === v.gia)
			hong.push(`khoá chữ vi và en trùng nhau: ${ten} «${k}» = «${v.gia}»`);
	}
	for (const [k, e] of nay.en)
		if (!nay.vi.has(k))
			hong.push(`khoá chữ chỉ có ở en: ${ten} «${k}» (dong ${e.dong})`);
	return { hong, moi };
}

const laGoiTen = (n, ten) =>
	ts.isCallExpression(n) &&
	ts.isIdentifier(n.expression) &&
	ten.has(n.expression.text);

function hamBaoNgoai(n) {
	let e = n.parent;
	while (e && !ts.isFunctionLike(e)) e = e.parent;
	return e ?? null;
}

function trongPrisma(n) {
	let e = n.parent;
	while (e) {
		if (ts.isPropertyAssignment(e) && KHOA_PRISMA.has(tenKhoa(e) ?? ""))
			return true;
		if (ts.isFunctionLike(e)) return false;
		e = e.parent;
	}
	return false;
}

function laChoTra(n) {
	let e = n.parent;
	while (
		e &&
		(ts.isObjectLiteralExpression(e) ||
			ts.isPropertyAssignment(e) ||
			ts.isParenthesizedExpression(e) ||
			ts.isAsExpression(e) ||
			ts.isSatisfiesExpression(e))
	)
		e = e.parent;
	return !!e && (ts.isReturnStatement(e) || ts.isArrowFunction(e));
}

function cheoGoi(bieuThuc, sf, ham, nhom, sau = 3) {
	let gap = false;
	const ten = new Set();
	const di = (n) => {
		if (laGoiTen(n, nhom)) gap = true;
		if (ts.isIdentifier(n)) {
			const cha = n.parent;
			const laTenThuoc =
				cha && ts.isPropertyAccessExpression(cha) && cha.name === n;
			if (!laTenThuoc) ten.add(n.text);
		}
		ts.forEachChild(n, di);
	};
	di(bieuThuc);
	if (ts.isShorthandPropertyAssignment(bieuThuc)) ten.add(bieuThuc.name.text);
	if (gap || sau === 0 || !ham) return gap;
	let thay = false;
	const tim = (n) => {
		if (
			!thay &&
			ts.isVariableDeclaration(n) &&
			ts.isIdentifier(n.name) &&
			ten.has(n.name.text) &&
			n.initializer
		)
			thay = cheoGoi(n.initializer, sf, ham, nhom, sau - 1);
		ts.forEachChild(n, tim);
	};
	tim(ham);
	return thay;
}

function soiMotCho(them = []) {
	const tep = [...diCay(join(GOC, THU_MUC_OKR_API), []), ...them];
	const hong = [];
	const cay_ = tep.map((duong) => ({
		duong,
		ten: tuongDoi(duong),
		sf: cay(duong, readFileSync(duong, "utf8")),
	}));
	for (const luat of MOT_CHO) {
		const dinhNghia = [];
		for (const { sf, ten } of cay_) {
			const di = (n) => {
				if (ts.isFunctionDeclaration(n) && n.name?.text === luat.ham)
					dinhNghia.push({ ten, n, sf });
				ts.forEachChild(n, di);
			};
			di(sf);
		}
		const nhom = new Set([luat.ham]);
		const tepDinhNghia = new Set(dinhNghia.map((d) => d.ten));
		for (const { sf, ten } of cay_) {
			if (!tepDinhNghia.has(ten)) continue;
			const di = (n) => {
				if (ts.isFunctionDeclaration(n) && n.name && n.name.text !== luat.ham) {
					let goi = false;
					const tim = (x) => {
						if (laGoiTen(x, new Set([luat.ham]))) goi = true;
						ts.forEachChild(x, tim);
					};
					tim(n);
					if (goi) nhom.add(n.name.text);
				}
				ts.forEachChild(n, di);
			};
			di(sf);
		}
		const loiGoi = [];
		const choTra = [];
		for (const { sf, ten } of cay_) {
			if (tepDinhNghia.has(ten)) continue;
			const o = (n) => `${ten}:${dongCua(sf, n.getStart(sf))}`;
			const di = (n) => {
				if (laGoiTen(n, nhom)) loiGoi.push(`${o(n)} (${n.expression.text})`);
				if (
					(ts.isPropertyAssignment(n) || ts.isShorthandPropertyAssignment(n)) &&
					luat.khoaTra.includes(tenKhoa(n) ?? "") &&
					!trongPrisma(n) &&
					laChoTra(n)
				) {
					choTra.push(`${o(n)} (${tenKhoa(n)}:)`);
					const bieuThuc = ts.isPropertyAssignment(n) ? n.initializer : n;
					if (!cheoGoi(bieuThuc, sf, hamBaoNgoai(n), nhom))
						hong.push(`${GHIM.motCho} ${luat.ham}: ${luat.nhan} ${o(n)}`);
				}
				ts.forEachChild(n, di);
			};
			di(sf);
		}
		const dn = dinhNghia.map(
			(d) => `${d.ten}:${dongCua(d.sf, d.n.getStart(d.sf))}`,
		);
		console.log(
			`${luat.ham}: dinh nghia ${dn.length} (${dn.join(", ") || "khong co"}); ham trong nhom: ${[...nhom].join(", ")}`,
		);
		console.log(
			`  ${luat.nhan} trong ${THU_MUC_OKR_API} (${choTra.length}): ${choTra.join(", ") || "khong co"}`,
		);
		console.log(
			`  loi goi ${[...nhom].join("/")} (${loiGoi.length}): ${loiGoi.join(", ") || "khong co"}`,
		);
		if (dinhNghia.length !== 1)
			hong.push(
				`${luat.ham} phải định nghĩa đúng một lần ở ${THU_MUC_OKR_API} (thấy ${dinhNghia.length})`,
			);
		if (choTra.length === 0)
			hong.push(`không thấy ${luat.nhan} nào ở ${THU_MUC_OKR_API}`);
		if (choTra.length !== loiGoi.length)
			hong.push(
				`${GHIM.demLech} ${luat.ham}: ${luat.nhan} ${choTra.length}, lời gọi ${loiGoi.length}`,
			);
		console.log(
			`  ${luat.ham}: ${dinhNghia.length === 1 && choTra.length > 0 && choTra.length === loiGoi.length ? "dat" : "HONG"}`,
		);
	}
	return hong;
}

function soiTuDien(duong = join(GOC, TEP_TU_DIEN)) {
	const chu = readFileSync(duong, "utf8");
	const hong = [];
	for (const m of MUC_TU_DIEN) {
		const co = m.mau.test(chu);
		console.log(`${TEP_TU_DIEN} muc ${m.ten}: ${co ? "co" : "KHONG"}`);
		if (!co) hong.push(`${GHIM.tuDien} ${m.ten} (${tuongDoi(duong)})`);
	}
	return hong;
}

function soiDot(tep) {
	const hong = [];
	for (const { ten, chu } of tep)
		chu.split("\n").forEach((dong, i) => {
			if (CHU_CAM.test(dong))
				hong.push(`${GHIM.dot}: ${ten}:${i + 1} «${dong.trim().slice(0, 60)}»`);
		});
	console.log(
		`chu man soi «đợt» (dong them, ${tep.length} tep): ${hong.length === 0 ? "dat" : "HONG"}`,
	);
	return hong;
}

function goiKit() {
	const r = spawnSync(
		"node",
		[
			join(GOC, "scripts", "resolve-plugin.mjs"),
			"--plugin",
			"acceptance-gate",
			"--require",
			"scripts/design-gate.mjs",
		],
		{ encoding: "utf8" },
	);
	if (r.status !== 0 || !r.stdout.trim())
		khongDoDuoc(
			`khong tim duoc design-gate.mjs cua bo kit acceptance-gate: ${(r.stderr ?? "").trim()}`,
		);
	return r.stdout.trim();
}

function caThietKe(gocSo, thay = new Map(), phu = {}) {
	const duongCua = (t) => thay.get(t) ?? join(GOC, t);
	const tenCua = (t) => thay.get(t) ?? t;
	const moi = new Set(tepDiff("A"));
	const doi = tepDiff("AM").filter((t) => existsSync(join(GOC, t)));
	const khongThu = (t) =>
		!t.split("/").some((p) => THU_MUC_THU.has(p)) && !LA_THU_THIET_KE.test(t);
	const khongLoaiTru = (t) => !t.split("/").some((p) => LOAI_TRU.has(p));
	const app = doi.filter((t) => VUNG_APP.test(t) && khongThu(t)).sort();
	const tepMa = doi.filter((t) => VUNG_MA.test(t) && khongLoaiTru(t)).sort();
	const tepChu = doi.filter((t) => VUNG_CHU.test(t)).sort();
	const tepChuMan = doi.filter((t) => VUNG_CHU_MAN.test(t) && khongThu(t));
	const them = new Map();
	for (const t of new Set([...app, ...tepMa, ...tepChuMan]))
		them.set(t, dongThem(gocSo, t, duongCua(t)));

	console.log(`dai so sanh: ${MOC}...HEAD (merge-base ${gocSo.slice(0, 8)})`);
	console.log(`tep giao dien apps/app (${app.length}):`);
	for (const t of app)
		console.log(`  ${tenCua(t)}${moi.has(t) ? " (moi)" : ""}`);
	console.log(`tep ma soi dong them (${tepMa.length}):`);
	for (const t of tepMa)
		console.log(`  ${tenCua(t)}${moi.has(t) ? " (moi)" : ""}`);
	console.log(
		`tep chu okr (${tepChu.length}): ${tepChu.map(tenCua).join(", ")}`,
	);

	const hong = [];
	const kit = app.length > 0 ? goiKit() : null;
	const demHuy = { chan: 0, huy: 0 };
	for (const t of app) {
		const r = spawnSync(
			"node",
			[
				join(kit, "scripts", "design-gate.mjs"),
				"--target",
				thay.has(t) ? duongCua(t) : t,
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
		hong.push(...dauHieuVeTay(chuDong(chu, them.get(t)), tenCua(t)));
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
		hong.push(...soiDongThem(duongCua(t), tenCua(t), them.get(t)));
	let khoaMoi = 0;
	for (const t of tepChu) {
		const r = soiChu(gocSo, t, duongCua(t), tenCua(t));
		khoaMoi += r.moi;
		hong.push(...r.hong);
	}
	console.log(`khoa chu moi hoac doi (vi): ${khoaMoi}`);
	hong.push(...soiMotCho(phu.tepApi ?? []));
	hong.push(...soiTuDien(phu.tuDien));
	hong.push(
		...soiDot(
			tepChuMan.map((t) => ({
				ten: tenCua(t),
				chu: chuDong(readFileSync(duongCua(t), "utf8"), them.get(t)),
			})),
		),
	);
	const soTep = new Set([...app, ...tepMa, ...tepChu]).size;
	console.log(`tong tep da soi: ${soTep}`);
	return { hong, soTep };
}

function lanhThietKe() {
	const gocSo = keoMoc();
	const { hong, soTep } = caThietKe(gocSo);
	if (soTep === 0) khongDoDuoc("diff khong co tep nao de soi");
	for (const h of hong) console.log(`HONG ${h}`);
	console.log(`vi pham: ${hong.length}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

const API_GIA = `export class DocGia {
\tasync hoiY(h: { y: string[]; ban: string[] }) {
\t\treturn {
\t\t\ty: { khoa: false, ds: h.y },
\t\t\tbanTruoc: h.ban,
\t\t};
\t}
}
`;

function chieuDoThietKe() {
	const gocSo = keoMoc();
	const doi = tepDiff("AM").filter((t) => existsSync(join(GOC, t)));
	const nguon = doi.find(
		(t) =>
			VUNG_APP.test(t) &&
			t.includes("/okr/hoi-y/") &&
			!t.split("/").some((p) => THU_MUC_THU.has(p)),
	);
	const nguonChu = doi.find(
		(t) => /okr-hoi-y\.ts$/.test(t) && VUNG_CHU.test(t),
	);
	if (!nguon || !nguonChu)
		khongDoDuoc(
			"diff khong co tep giao dien okr/hoi-y hay tep chu okr-hoi-y nao de chep",
		);
	const thuMuc = mkdtempSync(join(tmpdir(), "soi-hoi-y-thiet-ke-"));
	const tep = join(thuMuc, basename(nguon));
	const tepChu = join(thuMuc, basename(nguonChu));
	const tepApi = join(thuMuc, "doc-gia.service.ts");
	const tuDien = join(thuMuc, TEP_TU_DIEN);
	const goc = readFileSync(join(GOC, nguon), "utf8");
	const banSao = `${goc}\n// x\nexport function SheetGia() {\n\treturn (\n\t\t<SheetFooter>\n\t\t\t<Button variant="outline">Huỷ</Button>\n\t\t</SheetFooter>\n\t);\n}\n`;
	writeFileSync(tep, banSao);
	const chuGoc = readFileSync(join(GOC, nguonChu), "utf8");
	const KHOA_DO = "thuChieuDo";
	const chuSao = chuGoc.replace(
		/^const vi = \{\n/m,
		`const vi = {\n\t${KHOA_DO}: "Mở đợt hỏi ý mới",\n`,
	);
	if (chuSao === chuGoc)
		khongDoDuoc(`khong chen duoc khoa chu vao ${nguonChu} — tep doi hinh`);
	writeFileSync(tepChu, chuSao);
	writeFileSync(tepApi, API_GIA);
	const MUC_BO = MUC_TU_DIEN[7];
	const tdGoc = readFileSync(join(GOC, TEP_TU_DIEN), "utf8");
	const tdSao = tdGoc.replace(/^\*\*Kho ý\*\*:/m, "**Kho ý cũ**:");
	if (tdSao === tdGoc)
		khongDoDuoc(`khong bo duoc muc ${MUC_BO.ten} khoi ban sao ${TEP_TU_DIEN}`);
	writeFileSync(tuDien, tdSao);
	const dongChu = dongCuaChu(banSao, "\n// x\n") + 1;
	const dongNut = dongCuaChu(banSao, '<Button variant="outline">Huỷ</Button>');
	let kq;
	try {
		kq = caThietKe(
			gocSo,
			new Map([
				[nguon, tep],
				[nguonChu, tepChu],
			]),
			{ tepApi: [tepApi], tuDien },
		);
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
	for (const h of kq.hong) console.log(`HONG ${h}`);
	const ghim = [
		`${GHIM.chuThich}: ${tep}:${dongChu}`,
		`${GHIM.huy}: ${tep}:${dongNut}`,
		`${GHIM.thieuEn}: ${tepChu} «${KHOA_DO}»`,
		`${GHIM.motCho} chieuYChoNguoiXem: chỗ trả ý ${tepApi}:`,
		`${GHIM.motCho} docBanTruoc: chỗ trả bản viết trước ${tepApi}:`,
		`${GHIM.tuDien} ${MUC_BO.ten}`,
		`${GHIM.dot}: ${tepChu}:`,
	];
	let lot = 0;
	for (const g of ghim) {
		const bat = kq.hong.some((h) => h.startsWith(g));
		if (!bat) lot += 1;
		console.log(`${bat ? "bat " : "LOT "} ${g}`);
	}
	console.log(
		`chieu do: ban sao ${nguon} chen \`// x\` va nut Huy khong SheetClose, ban sao ${nguonChu} them khoa «đợt» thieu en, tep API gia tra ds/banTruoc tran, ban sao ${TEP_TU_DIEN} bo muc ${MUC_BO.ten} — ${ghim.length - lot}/${ghim.length} vi pham bi bat`,
	);
	process.exit(lot === 0 ? 1 : 0);
}

function doTaiGopLuot() {
	if (GOP_DO) return;
	const chung = git("merge-base", "HEAD", "origin/onehub");
	const gop = git(
		"log",
		"--first-parent",
		"--diff-filter=A",
		"--format=%H",
		chung,
		"--",
		`_acceptance/${LUOT}/contract.md`,
	)
		.split("\n")
		.at(-1);
	if (!gop) return;
	console.log(
		`luot ${LUOT} da gop o ${gop.slice(0, 8)}: do tren cay tai commit gop, so voi cha ${git("rev-parse", `${gop}^1`).slice(0, 8)}`,
	);
	const thu = mkdtempSync(join(tmpdir(), "soi-ma-gop-"));
	const cay = join(thu, "cay");
	let ma = 2;
	try {
		git("worktree", "add", "--detach", "--quiet", cay, gop);
		symlinkSync(join(GOC, "node_modules"), join(cay, "node_modules"));
		const tep = fileURLToPath(import.meta.url);
		const banSao = join(cay, tep.slice(GOC.length + 1));
		copyFileSync(tep, banSao);
		const r = spawnSync(process.execPath, [banSao, ...process.argv.slice(2)], {
			stdio: "inherit",
			env: { ...process.env, SOI_MA_GOP: gop },
		});
		ma = r.status ?? 2;
	} finally {
		spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cay]);
		rmSync(thu, { recursive: true, force: true });
	}
	process.exit(ma);
}

const CA = {
	"thiet-ke": { lanh: lanhThietKe, chieuDo: chieuDoThietKe },
};

const ca = doiSo("--ca");
const chon = ca === null ? undefined : CA[ca];
if (!chon) {
	console.log(`KHONG DO DUOC: can --ca ${Object.keys(CA).join(" | ")}`);
	process.exit(2);
}
if (ca === "thiet-ke") doTaiGopLuot();
if (process.argv.includes("--chieu-do")) chon.chieuDo();
else chon.lanh();
