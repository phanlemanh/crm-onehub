import { readdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { GOC, KHAI_MAC_DINH, khaiTuArgv, lat } from "./lat.mjs";
import { giuDoc } from "./khoa-cay.mjs";


await giuDoc();

const ts = createRequire(import.meta.url)("typescript");
const HERE = dirname(fileURLToPath(import.meta.url));
const KHAI_PATH = khaiTuArgv(KHAI_MAC_DINH);
const KHAI_DIR = dirname(KHAI_PATH);
const BANG = JSON.parse(readFileSync(`${KHAI_DIR}/toast-cua-lat.json`, "utf8"));
const KHOA = JSON.parse(readFileSync(`${KHAI_DIR}/khong-du-quyen.json`, "utf8"));
const TD = JSON.parse(readFileSync(`${KHAI_DIR}/tieu-de-cua-lat.json`, "utf8"));

const SO_TIEU_DE = TD.so_o;
const GIU_NGUYEN = new Set(TD.giu_nguyen.map((g) => g.chu));
const DAU =
	/[ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ]/;

let daMo = 0;

function cay(duong) {
	daMo += 1;
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
						khoa: /t\.([A-Za-z]+)\.([A-Za-z]+)/.exec(n.getText(nguon))?.slice(1, 3).join(".") ?? null,
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
				TD.co_thanh_ben === true &&
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
					khoa:
						ts.isStringLiteral(n.initializer) ||
						ts.isNoSubstitutionTemplateLiteral(n.initializer)
							? n.initializer.text
							: null,
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
	const L = lat(KHAI_PATH);
	const { thay, boQua } = quetToast(L.file);

	const daKhai = new Set(BANG.loi_goi.map((l) => `${l.file}|${l.khoa}`));
	const nhanRa = new Set(thay.map((t) => `${t.file}|${t.khoa}`));
	const thieu = BANG.loi_goi.filter((l) => !nhanRa.has(`${l.file}|${l.khoa}`));
	const thua = thay.filter((t) => !daKhai.has(`${t.file}|${t.khoa}`));

	if (thay.length !== BANG.loi_goi.length || thieu.length > 0 || thua.length > 0) {
		console.log(
			`KHONG DO DUOC: bang khai ${BANG.loi_goi.length} loi goi toast mang chu, chan do nhan ra ${thay.length}; ` +
				`thieu ${thieu.length}, thua ${thua.length}. Bang ghim (file, khoa kho chuoi) — khong ghim so dong.`,
		);
		for (const l of thieu)
			console.log(`  THIEU: ${l.file} khong con loi goi toast nao doc khoa ${l.khoa}`);
		for (const t of thua)
			console.log(
				`  THUA:  ${t.file}:${t.dong} doc khoa ${t.khoa ?? "(khong doc kho chuoi)"} ma bang khong khai`,
			);
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

function khoaThanhBen() {
	const thuMucKho = `${GOC}/apps/app/lib/messages`;
	const kho = readdirSync(thuMucKho)
		.filter((t) => t.endsWith(".ts"))
		.map((t) => readFileSync(`${thuMucKho}/${t}`, "utf8"))
		.join("\n");
	const khoi = /thanhBen:\s*\{([^}]*)\}/.exec(kho);
	if (!khoi) return null;
	return new Set([...khoi[1].matchAll(/^\s*([A-Za-z][A-Za-z0-9]*):/gm)].map((m) => m[1]));
}

function chanTieuDe() {
	const L = lat(KHAI_PATH);
	const o = quetTieuDe(L.file);
	const khoKhoa = TD.co_thanh_ben === true ? khoaThanhBen() : new Set();

	if (TD.co_thanh_ben === true && (khoKhoa === null || khoKhoa.size === 0)) {
		console.log(
			"KHONG DO DUOC: khong doc duoc nhom thanhBen trong kho chuoi — khong co gi de doi chieu nhan thanh ben",
		);
		process.exit(2);
	}

	const thanhBen = o.filter((x) => x.loai === "nhan-thanh-ben");
	const lac = thanhBen.filter((x) => x.khoa === null || !khoKhoa.has(x.khoa));
	for (const x of lac)
		console.log(
			`NHAN THANH BEN LAC: ${x.file}:${x.dong} khoa ${JSON.stringify(x.khoa)} khong co trong nhom thanhBen cua kho chuoi`,
		);
	if (lac.length > 0) process.exit(1);

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
		`\nquet ${L.file.length} file · ${o.length} o nhan (${o.filter((x) => x.loai === "tieu-de-tab").length} tieu de tab + ${thanhBen.length} nhan thanh ben) · ` +
			`${thanhBen.length} nhan thanh ben deu giai duoc qua nhom thanhBen (${khoKhoa.size} khoa) · ${thang.length} o con viet thang`,
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
	const thuMucKho = `${GOC}/apps/app/lib/messages`;
	const kho = readdirSync(thuMucKho)
		.filter((t) => t.endsWith(".ts"))
		.map((t) => readFileSync(`${thuMucKho}/${t}`, "utf8"))
		.join("\n");
	const do_ = [];

	for (const m of o) {
		const nguon = cay(m.file);
		let thay = false;
		const di = (n) => {
			if (
				ts.isPropertyAccessExpression(n) &&
				`${n.expression.getText(nguon).replace(/^t\./, "")}.${n.name.text}` === m.khoa &&
				n.expression.getText(nguon).startsWith("t.")
			)
				thay = true;
			ts.forEachChild(n, di);
		};
		ts.forEachChild(nguon, di);

		if (!thay) {
			do_.push(
				`${m.file} — khong con nut nao doc khoa ${m.khoa}. Cau nay chi hien khi ${m.co_khi}, ` +
					"nen mat no di thi khong man nao va khong chan nao khac thay duoc.",
			);
			continue;
		}

		const nhom = m.khoa.split(".")[0];
		const ten = m.khoa.split(".")[1];
		const khoi = new RegExp(`${nhom}:\\s*\\{[\\s\\S]*?\\n\\t\\},`, "g");
		const cac = [...kho.matchAll(khoi)].map((x) => x[0]);
		if (cac.length < 2) {
			do_.push(`${m.khoa} — khong doc duoc ca hai ban en/vi cua nhom ${nhom} trong kho chuoi`);
			continue;
		}
		const banVi = cac[cac.length - 1];
		const gt = new RegExp(`${ten}:\\s*"([^"]*)"`).exec(banVi);
		const ham = new RegExp(`${ten}:\\s*\\([^)]*\\)\\s*=>\\s*([^,\\n]*)`).exec(banVi);
		if (!gt && !ham)
			do_.push(`${m.khoa} — khong tim thay khoa nay trong ban vi cua kho chuoi`);
		else if (gt && !DAU.test(gt[1]))
			do_.push(`${m.khoa} — ban tieng Viet ${JSON.stringify(gt[1])} khong mang dau`);
		else if (ham && !DAU.test(ham[1]))
			do_.push(
				`${m.khoa} — ban tieng Viet la ham, than ${JSON.stringify(ham[1].trim())} khong mang dau`,
			);
	}

	console.log(
		`do ${o.length} o ghim — trang thai khong du quyen. PHEP DO MUC MA: moi o phai con MOT NUT doc dung ` +
			"khoa da khai, va ban tieng Viet cua khoa do phai mang dau. Khong chung man hien dung (gioi han khai o AC-4).",
	);

	if (do_.length > 0) {
		for (const d of do_) console.log(`KHONG DU QUYEN: ${d}`);
		process.exit(1);
	}
	console.log(`XANH: ca ${o.length} o deu con nut doc dung khoa, va ban tieng Viet co dau.`);
}

function chanDoiChieu() {
	const L = lat(KHAI_PATH);
	daMo = 0;
	const { thay } = quetToast(L.file);
	const soMoToast = daMo;
	daMo = 0;
	const td = quetTieuDe(L.file);
	console.log(
		JSON.stringify({
			latSinh: L.file.length,
			daMoToast: soMoToast,
			daMoTieuDe: daMo,
			toastMuc: thay.map((t) => `${t.file}|${t.khoa}`).sort(),
			toastKhaiMuc: BANG.loi_goi.map((l) => `${l.file}|${l.khoa}`).sort(),
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
