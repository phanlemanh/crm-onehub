import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { GOC, lat } from "./lat.mjs";

const ts = createRequire(import.meta.url)("typescript");
const HERE = dirname(fileURLToPath(import.meta.url));
const BANG = JSON.parse(readFileSync(`${HERE}/toast-cua-lat.json`, "utf8"));
const KHOA = JSON.parse(readFileSync(`${HERE}/khong-du-quyen.json`, "utf8"));
const TD = JSON.parse(readFileSync(`${HERE}/tieu-de-cua-lat.json`, "utf8"));

const SO_TIEU_DE = TD.so_o;
const GIU_NGUYEN = new Set(TD.giu_nguyen.map((g) => g.chu));
const DAU =
	/[ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ]/;

function cay(duong) {
	return ts.createSourceFile(
		duong,
		readFileSync(`${GOC}/${duong}`, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

function dong(nut, nguon) {
	return nguon.getLineAndCharacterOfPosition(nut.getStart(nguon)).line + 1;
}

function laToast(goi) {
	const e = goi.expression;
	if (ts.isIdentifier(e)) return e.text === "toast";
	if (ts.isPropertyAccessExpression(e))
		return ts.isIdentifier(e.expression) && e.expression.text === "toast";
	return false;
}

function chuyenTiepLoi(goi) {
	return goi.arguments.every(
		(a) =>
			ts.isPropertyAccessExpression(a) &&
			(a.name.text === "message" || a.name.text === "msg"),
	);
}

function chuTrong(nut) {
	const ra = [];
	const di = (n) => {
		if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n))
			ra.push(n.text);
		else if (ts.isTemplateExpression(n))
			ra.push(
				n.head.text + n.templateSpans.map((s) => `\${…}${s.literal.text}`).join(""),
			);
		ts.forEachChild(n, di);
	};
	ts.forEachChild(nut, di);
	return ra;
}

function hinhDang(goi) {
	const co = (v) => goi.arguments.some(v);
	if (co(ts.isTemplateExpression)) return "chuoi-mau";
	if (co((a) => ts.isStringLiteral(a) || ts.isNoSubstitutionTemplateLiteral(a)))
		return "chuoi-thang";
	if (
		ts.isPropertyAccessExpression(goi.expression) &&
		goi.expression.name.text === "promise"
	)
		return "toast-promise";
	if (co(ts.isConditionalExpression)) return "ba-ngoi";
	return "khong-ro";
}

function quetToast(files) {
	const thay = [];
	let boQua = 0;
	for (const f of files) {
		const nguon = cay(f);
		const di = (n) => {
			if (ts.isCallExpression(n) && laToast(n)) {
				if (chuyenTiepLoi(n)) boQua += 1;
				else
					thay.push({
						file: f,
						dong: dong(n, nguon),
						hinh_dang: hinhDang(n),
						chu: chuTrong(n),
					});
			}
			ts.forEachChild(n, di);
		};
		ts.forEachChild(nguon, di);
	}
	return { thay, boQua };
}

function quetTieuDe(files) {
	const thay = [];
	for (const f of files) {
		const nguon = cay(f);
		const di = (n) => {
			if (
				ts.isPropertyAssignment(n) &&
				ts.isIdentifier(n.name) &&
				n.name.text === "title" &&
				(ts.isStringLiteral(n.initializer) ||
					ts.isNoSubstitutionTemplateLiteral(n.initializer))
			)
				thay.push({ file: f, dong: dong(n, nguon), chu: n.initializer.text });
			ts.forEachChild(n, di);
		};
		ts.forEachChild(nguon, di);
	}
	return thay;
}

function tuKhoChuoi(duong) {
	return readFileSync(`${GOC}/${duong}`, "utf8").includes("settingsMessages");
}

function chanToast() {
	const L = lat();
	const { thay, boQua } = quetToast(L.file);

	if (thay.length !== BANG.loi_goi.length) {
		const nhanRa = new Set(thay.map((t) => `${t.file}:${t.dong}`));
		const thieu = BANG.loi_goi.filter((l) => !nhanRa.has(`${l.file}:${l.dong}`));
		const thua = thay.filter(
			(t) => !BANG.loi_goi.some((l) => l.file === t.file && l.dong === t.dong),
		);
		console.log(
			`KHONG DO DUOC: bang khai ${BANG.loi_goi.length} loi goi toast mang chu, chan do nhan ra ${thay.length}.`,
		);
		for (const l of thieu)
			console.log(`  THIEU: ${l.file}:${l.dong} [${l.hinh_dang}] ${JSON.stringify(l.goc)}`);
		for (const t of thua)
			console.log(`  THUA:  ${t.file}:${t.dong} [${t.hinh_dang}] ${JSON.stringify(t.chu)}`);
		process.exit(2);
	}

	const con = thay.filter((t) => t.chu.some((c) => /[A-Za-z]/.test(c) && !DAU.test(c)));
	for (const t of con)
		console.log(
			`CHU NGOAI JSX: ${t.file}:${t.dong} [toast ${t.hinh_dang}] ${JSON.stringify(t.chu.join(" | "))} — le ra phai doc tu kho chuoi`,
		);

	console.log(
		`\nquet ${L.file.length} file trong lat · nhan ra ${thay.length}/${BANG.loi_goi.length} loi goi khai trong bang · bo qua ${boQua} luot chi chuyen tiep error.message (ngoai pham vi)`,
	);

	if (con.length > 0) {
		console.log(`\nDO: ${con.length} loi goi toast con mang chu tieng Anh viet thang.`);
		process.exit(1);
	}
	console.log("XANH: khong loi goi toast nao con mang chu tieng Anh viet thang.");
}

function chanTieuDe() {
	const L = lat();
	const thay = quetTieuDe(L.file);

	if (thay.length !== SO_TIEU_DE) {
		console.log(
			`KHONG DO DUOC: lat khai ${SO_TIEU_DE} o tieu de, chan do nhan ra ${thay.length}.`,
		);
		for (const t of thay) console.log(`  thay: ${t.file}:${t.dong} ${JSON.stringify(t.chu)}`);
		process.exit(2);
	}

	const dungToi = new Set(thay.filter((t) => GIU_NGUYEN.has(t.chu)).map((t) => t.chu));
	const chet = TD.giu_nguyen.filter((g) => !dungToi.has(g.chu));
	const dichDuoc = thay.filter((t) => !GIU_NGUYEN.has(t.chu));
	const con = dichDuoc.filter((t) => /[A-Za-z]/.test(t.chu) && !DAU.test(t.chu));

	for (const t of con)
		console.log(
			`CHU NGOAI JSX: ${t.file}:${t.dong} [tieu de] ${JSON.stringify(t.chu)} — le ra phai doc tu kho chuoi`,
		);

	for (const g of chet)
		console.log(
			`MIEN TRU CHET: tieu de ${JSON.stringify(g.chu)} (${g.vi_sao}) khong con doi tuong that — go no khoi ban khai`,
		);

	console.log(
		`\nquet ${L.file.length} file trong lat · ${thay.length} o tieu de, tru ${thay.length - dichDuoc.length} dong giu nguyen co ten = ${dichDuoc.length} nhan dich duoc`,
	);

	if (con.length > 0 || chet.length > 0) {
		if (con.length > 0)
			console.log(`\nDO: ${con.length} tieu de con viet thang bang tieng Anh.`);
		if (chet.length > 0)
			console.log(`DO: ${chet.length} dong giu nguyen khong con doi tuong that.`);
		process.exit(1);
	}
	console.log("XANH: moi tieu de dich duoc deu khong con viet thang.");
}

function chanKhongDuQuyen() {
	const o = KHOA.o;
	const do_ = [];
	for (const m of o) {
		const noi_dung = readFileSync(`${GOC}/${m.file}`, "utf8");
		if (noi_dung.includes(m.goc))
			do_.push(`${m.file} — cau con viet thang: ${JSON.stringify(m.goc)}`);
		else if (!tuKhoChuoi(m.file))
			do_.push(`${m.file} — khong con viet thang nhung cung khong doc tu kho chuoi`);
	}

	console.log(
		`do ${o.length} o ghim — trang thai khong du quyen. PHEP DO MUC MA: chung chuoi da nam dung cho, KHONG chung man hien dung (gioi han khai o AC-4). Dau tieng Viet do boi bo canh kho chuoi.`,
	);

	if (do_.length > 0) {
		for (const d of do_) console.log(`KHONG DU QUYEN: ${d}`);
		process.exit(1);
	}
	console.log("XANH: ca hai cau doc tu kho chuoi.");
}

function chanDoiChieu() {
	const L = lat();
	const { thay } = quetToast(L.file);
	const td = quetTieuDe(L.file);
	console.log(
		JSON.stringify({
			latSinh: L.file.length,
			toastNhanRa: thay.length,
			toastKhai: BANG.loi_goi.length,
			tieuDeNhanRa: td.length,
			tieuDeKhai: SO_TIEU_DE,
		}),
	);
}

const chan = process.argv.includes("--chan")
	? process.argv[process.argv.indexOf("--chan") + 1]
	: "tat-ca";

if (chan === "toast") chanToast();
else if (chan === "tieu-de") chanTieuDe();
else if (chan === "khong-du-quyen") chanKhongDuQuyen();
else if (chan === "doi-chieu") chanDoiChieu();
else {
	chanToast();
	console.log("");
	chanTieuDe();
}
