import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

let ts = null;
try {
	ts = createRequire(import.meta.url)("typescript");
} catch {
	ts = null;
}

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const THU_MUC = join(GOC, "packages", "ui", "src", "components", "ai-elements");
const TEP_BANG = join(GOC, "packages", "ui", "src", "lib", "messages.ts");
const THUOC_TINH = new Set(["aria-label", "placeholder", "title", "alt"]);
const BANG_CAN = ["vi", "en"];

function ganDong(nguon) {
	const dau = [0];
	for (let i = 0; i < nguon.length; i += 1) {
		if (nguon[i] === "\n") dau.push(i + 1);
	}
	return (chiSo) => {
		if (chiSo < 0) return 1;
		let thap = 0;
		let cao = dau.length - 1;
		while (thap < cao) {
			const giua = (thap + cao + 1) >> 1;
			if (dau[giua] <= chiSo) thap = giua;
			else cao = giua - 1;
		}
		return thap + 1;
	};
}

function doiChuoi(nguon, i) {
	const nhay = nguon[i];
	let j = i + 1;
	let val = "";
	while (j < nguon.length) {
		if (nguon[j] === "\\") {
			val += nguon[j + 1] ?? "";
			j += 2;
			continue;
		}
		if (nguon[j] === nhay) return { ket: j + 1, val };
		val += nguon[j];
		j += 1;
	}
	return { ket: nguon.length, val };
}

const TU_KHOA = new Set([
	"return",
	"await",
	"yield",
	"case",
	"else",
	"do",
	"default",
	"typeof",
	"void",
	"delete",
	"in",
	"of",
	"instanceof",
]);

function tokenTruoc(nguon, i) {
	let j = i - 1;
	while (j >= 0 && /\s/.test(nguon[j])) j -= 1;
	if (j < 0) return { loai: "dau", chu: "" };
	if (!/[A-Za-z0-9_$]/.test(nguon[j])) return { loai: "ky", chu: nguon[j] };
	let k = j;
	while (k >= 0 && /[A-Za-z0-9_$]/.test(nguon[k])) k -= 1;
	return { loai: "tu", chu: nguon.slice(k + 1, j + 1) };
}

function laMoThe(truoc, sau) {
	if (!sau) return false;
	if (!/[A-Za-z_$>/]/.test(sau)) return false;
	if (truoc.loai === "dau") return true;
	if (truoc.loai === "tu") return TU_KHOA.has(truoc.chu);
	return !/[)\].]/.test(truoc.chu);
}

function coChu(chu) {
	return /\p{L}/u.test(chu);
}

function moThe(may, i) {
	const dongThe = may.nguon[i + 1] === "/";
	may.ngan.push({ loai: "the", dongThe, ten: null, cho: null });
	return i + (dongThe ? 2 : 1);
}

function dayChu(may) {
	const chu = may.dem.trim();
	if (chu && coChu(chu)) {
		may.thay.push({ kieu: "chữ giữa thẻ", chu, dong: may.dongTai(may.demTu) });
	}
	may.dem = "";
	may.demTu = -1;
}

function ghiThuocTinh(may, ten, val, i) {
	if (ten && THUOC_TINH.has(ten) && coChu(val)) {
		may.thay.push({ kieu: ten, chu: val, dong: may.dongTai(i) });
	}
}

function buocText(may, i) {
	const c = may.nguon[i];
	if (c === "<") {
		dayChu(may);
		return moThe(may, i);
	}
	if (c === "{") {
		dayChu(may);
		may.ngan.push({ loai: "code", sau: 0, goc: false, attr: null });
		return i + 1;
	}
	if (may.demTu < 0 && !/\s/.test(c)) may.demTu = i;
	may.dem += c;
	return i + 1;
}

function buocThe(may, i, ctx) {
	const c = may.nguon[i];
	if (c === '"' || c === "'") {
		const { ket, val } = doiChuoi(may.nguon, i);
		ghiThuocTinh(may, ctx.cho, val, i);
		ctx.cho = null;
		return ket;
	}
	if (c === "{") {
		may.ngan.push({ loai: "code", sau: 0, goc: false, attr: ctx.cho });
		ctx.cho = null;
		return i + 1;
	}
	if (c === "/" && may.nguon[i + 1] === ">") {
		may.ngan.pop();
		return i + 2;
	}
	if (c === ">") {
		may.ngan.pop();
		if (!ctx.dongThe) may.ngan.push({ loai: "text" });
		else if (may.ngan[may.ngan.length - 1]?.loai === "text") may.ngan.pop();
		return i + 1;
	}
	const ten = /^[A-Za-z_$][\w$-]*/.exec(may.nguon.slice(i));
	if (!ten) return i + 1;
	if (ctx.ten === null) ctx.ten = ten[0];
	else ctx.cho = ten[0];
	return i + ten[0].length;
}

function buocCode(may, i, ctx) {
	const c = may.nguon[i];
	const sau = may.nguon[i + 1];
	if (c === "/" && sau === "/") {
		const xuong = may.nguon.indexOf("\n", i);
		return xuong < 0 ? may.nguon.length : xuong;
	}
	if (c === "/" && sau === "*") {
		const dong = may.nguon.indexOf("*/", i);
		return dong < 0 ? may.nguon.length : dong + 2;
	}
	if (c === '"' || c === "'" || c === "`") {
		const { ket, val } = doiChuoi(may.nguon, i);
		ghiThuocTinh(may, ctx.attr, val, i);
		return ket;
	}
	if (c === "{") {
		ctx.sau += 1;
		return i + 1;
	}
	if (c === "}") {
		if (ctx.sau > 0) ctx.sau -= 1;
		else if (!ctx.goc) may.ngan.pop();
		return i + 1;
	}
	if (c === "<" && laMoThe(tokenTruoc(may.nguon, i), sau)) return moThe(may, i);
	return i + 1;
}

function quetTep(nguon) {
	const may = {
		nguon,
		dongTai: ganDong(nguon),
		thay: [],
		ngan: [{ loai: "code", sau: 0, goc: true, attr: null }],
		dem: "",
		demTu: -1,
	};
	let i = 0;
	while (i < nguon.length) {
		const ctx = may.ngan[may.ngan.length - 1];
		if (ctx.loai === "text") i = buocText(may, i);
		else if (ctx.loai === "the") i = buocThe(may, i, ctx);
		else i = buocCode(may, i, ctx);
	}
	return may.thay;
}

function nhatTen(n, ra) {
	if (ts.isIdentifier(n)) {
		ra.add(n.text);
		return;
	}
	if (ts.isPropertyAccessExpression(n)) {
		nhatTen(n.expression, ra);
		return;
	}
	if (ts.isJsxAttribute(n)) {
		if (n.initializer) nhatTen(n.initializer, ra);
		return;
	}
	if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
		for (const a of n.attributes.properties) nhatTen(a, ra);
		return;
	}
	if (ts.isJsxClosingElement(n)) return;
	if (ts.isPropertyAssignment(n)) {
		nhatTen(n.initializer, ra);
		return;
	}
	ts.forEachChild(n, (con) => nhatTen(con, ra));
}

function tenHienThi(sf) {
	const ra = new Set();
	const nhat = (n) => nhatTen(n, ra);
	const di = (n) => {
		if (
			ts.isJsxExpression(n) &&
			n.expression &&
			(ts.isJsxElement(n.parent) || ts.isJsxFragment(n.parent))
		) {
			nhat(n.expression);
		}
		if (
			ts.isJsxAttribute(n) &&
			THUOC_TINH.has(n.name.getText(sf)) &&
			n.initializer &&
			ts.isJsxExpression(n.initializer) &&
			n.initializer.expression
		) {
			nhat(n.initializer.expression);
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return ra;
}

function quetMacDinh(nguon, nhanTep) {
	const sf = ts.createSourceFile(
		nhanTep,
		nguon,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const hienThi = tenHienThi(sf);
	const ra = [];
	const di = (n) => {
		if (ts.isBindingElement(n) && n.initializer) {
			const gt = n.initializer;
			const laChuoi =
				ts.isStringLiteral(gt) || ts.isNoSubstitutionTemplateLiteral(gt);
			if (laChuoi && coChu(gt.text) && hienThi.has(n.name.getText(sf))) {
				const { line } = sf.getLineAndCharacterOfPosition(n.getStart(sf));
				ra.push({ kieu: "giá trị mặc định", chu: gt.text, dong: line + 1 });
			}
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return ra;
}

function gopKhongTrung(thay, them) {
	const da = new Set(thay.map((v) => `${v.dong}\u0000${v.chu}`));
	for (const m of them) {
		const khoa = `${m.dong}\u0000${m.chu}`;
		if (da.has(khoa)) continue;
		da.add(khoa);
		thay.push(m);
	}
	thay.sort((a, b) => a.dong - b.dong);
	return thay;
}

function boGiaTri(nguon, i) {
	let tron = 0;
	while (i < nguon.length) {
		const c = nguon[i];
		if (c === '"' || c === "'" || c === "`") {
			i = doiChuoi(nguon, i).ket;
			continue;
		}
		if (c === "(" || c === "[" || c === "{") {
			tron += 1;
			i += 1;
			continue;
		}
		if (c === ")" || c === "]") {
			tron -= 1;
			i += 1;
			continue;
		}
		if (c === "}") {
			if (tron === 0) return i;
			tron -= 1;
			i += 1;
			continue;
		}
		if (c === "," && tron === 0) return i;
		i += 1;
	}
	return i;
}

function docKhoa(nguon, moNgoac) {
	const ra = new Set();
	const duong = [];
	let i = moNgoac + 1;
	while (i < nguon.length) {
		const c = nguon[i];
		if (/\s/.test(c) || c === ",") {
			i += 1;
			continue;
		}
		if (c === "}") {
			if (duong.length === 0) return ra;
			ra.add(duong.join("."));
			duong.pop();
			i += 1;
			continue;
		}
		const khoa = /^["']?([A-Za-z_$][\w$]*)["']?\s*:/.exec(nguon.slice(i));
		if (!khoa) {
			i += 1;
			continue;
		}
		i += khoa[0].length;
		while (i < nguon.length && /\s/.test(nguon[i])) i += 1;
		if (nguon[i] === "{") {
			duong.push(khoa[1]);
			i += 1;
			continue;
		}
		ra.add([...duong, khoa[1]].join("."));
		i = boGiaTri(nguon, i);
	}
	return ra;
}

function bangKhoa(nguon, ten) {
	const mo = new RegExp(`const\\s+${ten}\\s*=\\s*\\{`).exec(nguon);
	if (!mo) return null;
	return docKhoa(nguon, mo.index + mo[0].length - 1);
}

function khoaDung(nguon) {
	const bien = new Set();
	const khai = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*useMessages\s*\(/g;
	let m = khai.exec(nguon);
	while (m) {
		bien.add(m[1]);
		m = khai.exec(nguon);
	}
	const dongTai = ganDong(nguon);
	const ra = [];
	for (const b of bien) {
		const goi = new RegExp(
			`\\b${b}\\s*\\.\\s*([A-Za-z_$][\\w$]*(?:\\s*\\.\\s*[A-Za-z_$][\\w$]*)*)`,
			"g",
		);
		let k = goi.exec(nguon);
		while (k) {
			ra.push({ khoa: k[1].replace(/\s+/g, ""), dong: dongTai(k.index) });
			k = goi.exec(nguon);
		}
	}
	return ra;
}

function gomTsx(thuMuc) {
	const ra = [];
	for (const muc of readdirSync(thuMuc, { withFileTypes: true })) {
		const duong = join(thuMuc, muc.name);
		if (muc.isDirectory()) ra.push(...gomTsx(duong));
		else if (muc.isFile() && muc.name.endsWith(".tsx")) ra.push(duong);
	}
	return ra.sort();
}

function thoat(ma, loi) {
	if (loi) process.stdout.write(`${loi}\n`);
	process.exit(ma);
}

const nhan = relative(GOC, THU_MUC);
process.stdout.write(`Răng chuỗi cứng — ${nhan}\n\n`);

if (!ts) {
	thoat(
		2,
		"Không nạp được typescript — không đọc được lớp giá trị mặc định, không kết luận gì.",
	);
}

let tep = [];
try {
	if (!statSync(THU_MUC).isDirectory()) {
		thoat(2, `Không phải thư mục: ${nhan}. Không có gì để quét.`);
	}
	tep = gomTsx(THU_MUC);
} catch {
	thoat(2, `Không đọc được thư mục: ${nhan}. Không có gì để quét.`);
}

if (tep.length === 0) {
	thoat(
		2,
		`Không tìm thấy tệp .tsx nào trong ${nhan}. Tập rỗng không phải là sạch.`,
	);
}

let nguonBang = null;
try {
	nguonBang = readFileSync(TEP_BANG, "utf8");
} catch {
	thoat(2, `Không đọc được bảng chuỗi: ${relative(GOC, TEP_BANG)}.`);
}

const bang = new Map();
for (const ten of BANG_CAN) {
	const bo = bangKhoa(nguonBang, ten);
	if (!bo) {
		thoat(2, `Không tìm thấy bảng "${ten}" trong ${relative(GOC, TEP_BANG)}.`);
	}
	bang.set(ten, bo);
}

const viPham = [];
const thieuKhoa = [];

process.stdout.write(`Tệp quét: ${tep.length}\n`);
const rong = Math.max(...tep.map((t) => relative(GOC, t).length));
for (const duong of tep) {
	const nguon = readFileSync(duong, "utf8");
	const ngan = relative(GOC, duong);
	const thay = gopKhongTrung(quetTep(nguon), quetMacDinh(nguon, ngan));
	process.stdout.write(`  ${ngan.padEnd(rong)}  ${thay.length}\n`);
	for (const v of thay) viPham.push({ tep: ngan, ...v });
	for (const { khoa, dong } of khoaDung(nguon)) {
		for (const ten of BANG_CAN) {
			if (!bang.get(ten).has(khoa)) {
				thieuKhoa.push({ tep: ngan, dong, khoa, bang: ten });
			}
		}
	}
}

process.stdout.write(`\nTổng chuỗi cứng: ${viPham.length}\n`);
if (viPham.length > 0) {
	process.stdout.write("\nChuỗi cứng (mọi số phải là 0):\n");
	for (const v of viPham) {
		process.stdout.write(`  ${v.tep}:${v.dong}  ${v.kieu}  "${v.chu}"\n`);
	}
}

process.stdout.write(`\nKhoá thiếu trong bảng chuỗi: ${thieuKhoa.length}\n`);
for (const k of thieuKhoa) {
	process.stdout.write(
		`  ${k.tep}:${k.dong}  khoá "${k.khoa}" vắng ở bảng "${k.bang}" của ${relative(GOC, TEP_BANG)}\n`,
	);
}

if (viPham.length > 0 || thieuKhoa.length > 0) {
	process.stdout.write("\nRăng đỏ.\n");
	process.exit(1);
}

process.stdout.write("\nRăng xanh.\n");
process.exit(0);
