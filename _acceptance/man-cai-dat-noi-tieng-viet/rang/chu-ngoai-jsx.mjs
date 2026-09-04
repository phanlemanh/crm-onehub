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
	const o = [];
	for (const f of files) {
		const nguon = cay(f);
		const di = (n) => {
			if (
				ts.isPropertyAssignment(n) &&
				ts.isIdentifier(n.name) &&
				n.name.text === "title"
			)
				o.push({
					file: f,
					dong: dong(n, nguon),
					loai: "tieu-de-tab",
					viet_thang:
						ts.isStringLiteral(n.initializer) ||
						ts.isNoSubstitutionTemplateLiteral(n.initializer)
							? n.initializer.text
							: null,
				});

			if (
				ts.isPropertyAssignment(n) &&
				ts.isIdentifier(n.name) &&
				n.name.text === "khoa" &&
				n.parent &&
				ts.isObjectLiteralExpression(n.parent)
			)
				o.push({
					file: f,
					dong: dong(n, nguon),
					loai: "nhan-thanh-ben",
					viet_thang: null,
				});

			ts.forEachChild(n, di);
		};
		ts.forEachChild(nguon, di);
	}
	return o;
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
	const o = quetTieuDe(L.file);

	if (o.length !== SO_TIEU_DE) {
		console.log(
			`KHONG DO DUOC: lat khai ${SO_TIEU_DE} o nhan (tieu de tab + nhan thanh ben), chan do nhan ra ${o.length}.`,
		);
		for (const x of o) console.log(`  thay: ${x.file}:${x.dong} [${x.loai}]`);
		console.log(
			"  Dem O NHAN, khong dem chuoi: dich xong thi chuoi roi vao kho, o nhan thi con.",
		);
		process.exit(2);
	}

	const thang = o.filter((x) => x.viet_thang !== null);
	const dungToi = new Set(
		thang.filter((x) => GIU_NGUYEN.has(x.viet_thang)).map((x) => x.viet_thang),
	);
	const chet = TD.giu_nguyen.filter((g) => !dungToi.has(g.chu));
	const con = thang.filter(
		(x) =>
			!GIU_NGUYEN.has(x.viet_thang) &&
			/[A-Za-z]/.test(x.viet_thang) &&
			!DAU.test(x.viet_thang),
	);

	for (const x of con)
		console.log(
			`CHU NGOAI JSX: ${x.file}:${x.dong} [${x.loai}] ${JSON.stringify(x.viet_thang)} — le ra phai doc tu kho chuoi`,
		);

	for (const g of chet)
		console.log(
			`GIU NGUYEN CHET: ${JSON.stringify(g.chu)} (${g.vi_sao}) khong con o nhan nao viet thang gia tri do — go no khoi ban khai`,
		);

	console.log(
		`\nquet ${L.file.length} file · ${o.length} o nhan (${o.filter((x) => x.loai === "tieu-de-tab").length} tieu de tab + ${o.filter((x) => x.loai === "nhan-thanh-ben").length} nhan thanh ben) · ${thang.length} o con viet thang`,
	);

	if (con.length > 0 || chet.length > 0) {
		if (con.length > 0) console.log(`\nDO: ${con.length} o nhan con viet thang bang tieng Anh.`);
		if (chet.length > 0) console.log(`DO: ${chet.length} dong giu nguyen khong con doi tuong that.`);
		process.exit(1);
	}
	console.log(`XANH: ca ${o.length} o nhan deu doc tu kho chuoi.`);
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
