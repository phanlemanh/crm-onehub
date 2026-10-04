import { existsSync, readdirSync, readFileSync } from "node:fs";
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

function khoaKho(chu) {
	const m =
		/t\.([A-Za-z]+)\.([A-Za-z]+)/.exec(chu) ??
		/\bmsg\.([A-Za-z]+)\.([A-Za-z]+)/.exec(chu);
	return m?.slice(1, 3).join(".") ?? null;
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
						khoa: khoaKho(n.getText(nguon)),
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

function oThanhBenKhai() {
	const tb = TD.thanh_ben;
	if (tb === undefined) return [];
	const nguon = ts.createSourceFile(
		tb.khoa_tai,
		readFileSync(`${GOC}/${tb.khoa_tai}`, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const o = [];
	const di = (n) => {
		if (
			ts.isPropertyAssignment(n) &&
			ts.isIdentifier(n.name) &&
			n.name.text === "khoa" &&
			ts.isObjectLiteralExpression(n.parent)
		) {
			const laNhom = n.parent.properties.some(
				(p) => p.name && ts.isIdentifier(p.name) && p.name.text === tb.nhom_khi_co,
			);
			o.push({
				file: tb.khoa_tai,
				dong: dong(n, nguon),
				loai: "nhan-thanh-ben",
				tra_cuu: tb.tra_cuu_tai,
				nhom: laNhom ? tb.nhom.nhom : tb.nhom.muc,
				khoa:
					ts.isStringLiteral(n.initializer) ||
					ts.isNoSubstitutionTemplateLiteral(n.initializer)
						? n.initializer.text
						: null,
				viet_thang: null,
			});
		}
		ts.forEachChild(n, di);
	};
	ts.forEachChild(nguon, di);
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

const TIENG_DO = "vi";
const boNhoTuyChon = new Map();

function nhapDanhDinh(nguon) {
	const ra = new Map();
	const di = (n) => {
		if (
			ts.isImportDeclaration(n) &&
			n.importClause &&
			n.importClause.isTypeOnly !== true &&
			n.importClause.namedBindings &&
			ts.isNamedImports(n.importClause.namedBindings) &&
			ts.isStringLiteral(n.moduleSpecifier)
		)
			for (const e of n.importClause.namedBindings.elements)
				if (e.isTypeOnly !== true)
					ra.set(e.name.text, {
						ten: (e.propertyName ?? e.name).text,
						tu: n.moduleSpecifier.text,
					});
		ts.forEachChild(n, di);
	};
	ts.forEachChild(nguon, di);
	return ra;
}

function bienGoiKho(nguon, nhap) {
	const ra = new Map();
	const di = (n) => {
		if (
			ts.isVariableDeclaration(n) &&
			ts.isIdentifier(n.name) &&
			n.initializer &&
			ts.isCallExpression(n.initializer) &&
			ts.isIdentifier(n.initializer.expression) &&
			nhap.has(n.initializer.expression.text)
		)
			ra.set(n.name.text, nhap.get(n.initializer.expression.text));
		ts.forEachChild(n, di);
	};
	ts.forEachChild(nguon, di);
	return ra;
}

function nhomTraCuu(nguon, bien) {
	const ra = new Map();
	const di = (n) => {
		if (
			ts.isElementAccessExpression(n) &&
			ts.isPropertyAccessExpression(n.expression) &&
			ts.isIdentifier(n.expression.expression) &&
			bien.has(n.expression.expression.text)
		) {
			const kho = bien.get(n.expression.expression.text);
			const nhom = n.expression.name.text;
			ra.set(`${kho.tu}|${kho.ten}|${nhom}`, { ...kho, nhom });
		}
		ts.forEachChild(n, di);
	};
	ts.forEachChild(nguon, di);
	return [...ra.values()];
}

function tsconfigGan(duong) {
	let thuMuc = dirname(duong);
	while (thuMuc.startsWith(GOC)) {
		const ung = `${thuMuc}/tsconfig.json`;
		if (existsSync(ung)) return ung;
		thuMuc = dirname(thuMuc);
	}
	return null;
}

function tuyChonTs(tsconfig) {
	if (!boNhoTuyChon.has(tsconfig)) {
		let loi = null;
		const doc = ts.getParsedCommandLineOfConfigFile(
			tsconfig,
			{},
			{
				...ts.sys,
				onUnRecoverableConfigFileDiagnostic: (d) => {
					loi = ts.flattenDiagnosticMessageText(d.messageText, " ");
				},
			},
		);
		boNhoTuyChon.set(
			tsconfig,
			doc === undefined
				? { loi: loi ?? "khong doc duoc tsconfig.json" }
				: { tuyChon: doc.options },
		);
	}
	return boNhoTuyChon.get(tsconfig);
}

function ngan(duong) {
	return duong.startsWith(`${GOC}/`) ? duong.slice(GOC.length + 1) : duong;
}

async function nhomKhoCuaFile(file, nhomCan = null) {
	const duong = `${GOC}/${file}`;
	const nguon = cay(file);
	const ung = nhomTraCuu(nguon, bienGoiKho(nguon, nhapDanhDinh(nguon))).filter(
		(u) => nhomCan === null || u.nhom === nhomCan,
	);

	if (ung.length !== 1)
		return {
			loi:
				`${file} — doc duoc ${ung.length} cach tra cuu nhom kho chuoi bang khoa dong (cho doi dung 1)` +
				`${ung.length > 1 ? `: ${ung.map((u) => `${u.ten}(...).${u.nhom}`).join(" · ")}` : ""}. ` +
				"Khong xac dinh duoc nhom nao la nhom ma man nay that su doc.",
		};

	const { ten, tu, nhom } = ung[0];
	const tsconfig = tsconfigGan(duong);
	if (tsconfig === null)
		return {
			loi: `${file} — khong co tsconfig.json nao tren duong di len, nen khong giai duoc "${tu}" ve mot file tren dia.`,
		};

	const doc = tuyChonTs(tsconfig);
	if (doc.loi !== undefined)
		return { loi: `${ngan(tsconfig)} — ${doc.loi}` };

	const khoDuong = ts.resolveModuleName(tu, duong, doc.tuyChon, ts.sys)
		.resolvedModule?.resolvedFileName;
	if (khoDuong === undefined)
		return {
			loi: `${file} — "${tu}" khong giai duoc ve file nao qua ${ngan(tsconfig)}.`,
		};

	const mo = await import(khoDuong);
	if (!(mo[ten] instanceof Function))
		return { loi: `${ngan(khoDuong)} — khong xuat ra ham "${ten}".` };

	const nhomGT = mo[ten](TIENG_DO)?.[nhom];
	if (!(nhomGT instanceof Object))
		return {
			loi: `${ngan(khoDuong)} — ${ten}("${TIENG_DO}").${nhom} khong phai mot nhom khoa.`,
		};

	return {
		kho: ngan(khoDuong),
		ham: ten,
		nhom,
		khoa: new Set(Object.keys(nhomGT)),
	};
}

async function chanTieuDe() {
	const L = lat(KHAI_PATH);
	const o = [...quetTieuDe(L.file), ...oThanhBenKhai()];

	if (o.length === 0) {
		console.log(
			"KHONG DO DUOC: chan tieu de khong co doi tuong o lat nay — 0 o tieu de.",
		);
		console.log(
			"  Tap quan sat rong khong bao gio la dat: mot lat khong so huu page.tsx nao thi phai KHAI ra dieu do, khong duoc nhan mot mau xanh tren khong.",
		);
		process.exit(2);
	}

	const thanhBen = o.filter((x) => x.loai === "nhan-thanh-ben");
	const khoTheoFile = new Map();
	const noiTra = (x) => `${x.tra_cuu ?? x.file}|${x.nhom ?? ""}`;

	if (TD.co_thanh_ben === true) {
		const cacFile = [...new Set(thanhBen.map(noiTra))];
		if (cacFile.length === 0) {
			console.log(
				"KHONG DO DUOC: lat khai co thanh ben ma khong file nao trong lat mang o nhan thanh ben.",
			);
			process.exit(2);
		}
		for (const noi of cacFile) {
			const [f, nhomCan] = noi.split("|");
			const r = await nhomKhoCuaFile(f, nhomCan === "" ? null : nhomCan);
			if (r.loi !== undefined) {
				console.log(`KHONG DO DUOC: ${r.loi}`);
				console.log(
					"  Nhan thanh ben phai doi chieu voi CHINH kho chuoi ma man nay nhap vao, khong phai voi mot nhom trung ten o kho khac.",
				);
				process.exit(2);
			}
			if (r.khoa.size === 0) {
				console.log(
					`KHONG DO DUOC: nhom ${r.nhom} trong ${r.kho} rong — khong co gi de doi chieu nhan thanh ben.`,
				);
				process.exit(2);
			}
			console.log(
				`   ${f} -> ${r.ham}("${TIENG_DO}").${r.nhom} trong ${r.kho} (${r.khoa.size} khoa)`,
			);
			khoTheoFile.set(noi, r);
		}
	}

	const lac = thanhBen.filter(
		(x) => x.khoa === null || !khoTheoFile.get(noiTra(x)).khoa.has(x.khoa),
	);
	for (const x of lac) {
		const r = khoTheoFile.get(noiTra(x));
		console.log(
			`NHAN THANH BEN LAC: ${x.file}:${x.dong} khoa ${JSON.stringify(x.khoa)} khong co trong nhom ${r.nhom} cua ${r.kho}`,
		);
	}
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
			`${thanhBen.length} nhan thanh ben deu giai duoc qua ${[...khoTheoFile.values()].map((r) => `${r.ham}(...).${r.nhom} trong ${r.kho} (${r.khoa.size} khoa)`).join(" · ")} · ${thang.length} o con viet thang`,
	);

	if (con.length > 0 || chet.length > 0) {
		if (con.length > 0) console.log(`\nDO: ${con.length} o nhan con viet thang bang tieng Anh.`);
		if (chet.length > 0) console.log(`DO: ${chet.length} dong giu nguyen khong con doi tuong that.`);
		process.exit(1);
	}
	console.log(`XANH: ca ${o.length} o nhan deu doc tu kho chuoi.`);
}

function canhGac(coKhi) {
	const m = /^(.+?)\s*===\s*false$/.exec(coKhi.trim());
	return m === null ? null : m[1].trim();
}

function khoaTrongNhanh(nut, nguon) {
	const ra = new Set();
	const di = (n) => {
		if (
			ts.isPropertyAccessExpression(n) &&
			n.expression.getText(nguon).startsWith("t.")
		)
			ra.add(
				`${n.expression.getText(nguon).replace(/^t\./, "")}.${n.name.text}`,
			);
		ts.forEachChild(n, di);
	};
	di(nut);
	return ra;
}

function khoaSinhTuMa(file, cacCoKhi) {
	const nguon = cay(file);
	const ra = new Map();
	for (const c of cacCoKhi) ra.set(c, new Set());
	const di = (n) => {
		if (ts.isConditionalExpression(n)) {
			const test = n.condition.getText(nguon).trim();
			for (const c of cacCoKhi) {
				const gac = canhGac(c);
				if (gac !== null && test === gac)
					for (const k of khoaTrongNhanh(n.whenFalse, nguon)) ra.get(c).add(k);
			}
		}
		ts.forEachChild(n, di);
	};
	ts.forEachChild(nguon, di);
	return ra;
}

function chanThuaKhongDuQuyen(o) {
	const thua = [];
	const khongDoc = [];
	const theoFile = new Map();
	for (const m of o) {
		if (!theoFile.has(m.file)) theoFile.set(m.file, new Map());
		const b = theoFile.get(m.file);
		if (!b.has(m.co_khi)) b.set(m.co_khi, new Set());
		b.get(m.co_khi).add(m.khoa);
	}
	for (const [file, b] of theoFile) {
		const sinh = khoaSinhTuMa(file, [...b.keys()]);
		for (const [coKhi, daKhai] of b) {
			if (canhGac(coKhi) === null) {
				khongDoc.push(
					`${file} — dieu kien ${JSON.stringify(coKhi)} khong theo khuon "<bieu thuc> === false", nen chan nay khong sinh duoc ung vien tu ma de doi chieu.`,
				);
				continue;
			}
			const tuMa = sinh.get(coKhi);
			console.log(
				`   ${file} · ${coKhi} — ma sinh ra ${tuMa.size} khoa, ban khai co ${daKhai.size}`,
			);
			for (const k of tuMa)
				if (!daKhai.has(k))
					thua.push(
						`${file} — ${k} hien o dung nhanh ${coKhi} ma ban khai khong co. Bang nay tuyen la BANG DONG cua lop do, nen thieu mot o la thuoc do sot.`,
					);
		}
	}
	return { thua, khongDoc };
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

	console.log("\n-- CHIEU THUA: ung vien sinh tu cay cu phap, doi chieu voi ban khai");
	const { thua, khongDoc } = chanThuaKhongDuQuyen(o);
	for (const d of khongDoc) console.log(`   KHONG DO DUOC: ${d}`);
	for (const d of thua) console.log(`   THUA: ${d}`);

	console.log(
		`\ndo ${o.length} o ghim — trang thai khong du quyen. PHEP DO MUC MA: moi o phai con MOT NUT doc dung ` +
			"khoa da khai, va ban tieng Viet cua khoa do phai mang dau. Khong chung man hien dung (gioi han khai o AC-4).",
	);

	if (do_.length > 0) {
		for (const d of do_) console.log(`KHONG DU QUYEN: ${d}`);
		process.exit(1);
	}
	if (thua.length > 0) process.exit(1);
	if (khongDoc.length > 0) process.exit(2);
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
			tieuDeNhanRa: td.length + oThanhBenKhai().length,
			tieuDeKhai: SO_TIEU_DE,
		}),
	);
}

const chan = process.argv.includes("--chan")
	? process.argv[process.argv.indexOf("--chan") + 1]
	: "tat-ca";


function chanThuocTinh() {
	const L = lat(KHAI_PATH);
	const duong = `${KHAI_DIR}/thuoc-tinh-cua-lat.json`;
	if (!existsSync(duong)) {
		console.log(
			`KHONG DO DUOC: tien de thieu — chua co ban khai thuoc-tinh-cua-lat.json tai ${duong.replace(`${GOC}/`, "")}.`,
		);
		process.exit(2);
	}
	const KH = JSON.parse(readFileSync(duong, "utf8"));
	const kyThuat = new Set(KH.ten_ky_thuat.map((x) => x.ten));
	const dungToi = new Set();
	const chuThang = [];
	let tuKho = 0;
	let kyThuatDem = 0;

	for (const f of L.file) {
		const nguon = cay(f);
		const di = (n) => {
			if (ts.isJsxAttribute(n) && n.initializer) {
				const ten = n.name.getText(nguon);
				const gt = n.initializer;
				const laChuoi =
					ts.isStringLiteral(gt) ||
					(ts.isJsxExpression(gt) &&
						gt.expression &&
						(ts.isStringLiteral(gt.expression) ||
							ts.isNoSubstitutionTemplateLiteral(gt.expression) ||
							ts.isTemplateExpression(gt.expression)));
				const docKho =
					ts.isJsxExpression(gt) &&
					gt.expression &&
					/\bt\.[A-Za-z]/.test(gt.expression.getText(nguon));
				const rong =
					ts.isStringLiteral(gt) && gt.text.trim() === "";
				const the = n.parent?.parent?.tagName?.getText(nguon) ?? "";
				const khoaBieuMau =
					(ten === "name" || ten === "value") && /^[a-z]/.test(the);
				if (docKho) tuKho += 1;
				else if (rong || khoaBieuMau) {
					kyThuatDem += 1;
				} else if (laChuoi) {
					if (kyThuat.has(ten)) {
						kyThuatDem += 1;
						dungToi.add(ten);
					} else
						chuThang.push(
							`${f}:${dong(n, nguon)} thuoc tinh ${ten} mang chuoi viet thang ${JSON.stringify(gt.getText(nguon).slice(0, 60))}`,
						);
				}
			}
			ts.forEachChild(n, di);
		};
		ts.forEachChild(nguon, di);
	}

	const chet = KH.ten_ky_thuat.filter((x) => !dungToi.has(x.ten));
	console.log(
		`quet ${L.file.length} file · ${tuKho} thuoc tinh doc tu kho chuoi · ${kyThuatDem} thuoc tinh ky thuat co ten · ${chuThang.length} thuoc tinh con chuoi viet thang`,
	);
	for (const d of chuThang) console.log(`   CHU THANG: ${d}`);
	for (const d of chet)
		console.log(
			`   TEN KY THUAT CHET: ${d.ten} (${d.vi_sao}) khong con thuoc tinh nao dung — go no khoi ban khai`,
		);

	if (chuThang.length > 0 || chet.length > 0) process.exit(1);

	if (tuKho === 0) {
		console.log(
			"KHONG DO DUOC: 0 thuoc tinh nao doc tu kho chuoi. Tap quan sat rong khong bao gio la dat.",
		);
		process.exit(2);
	}
	console.log(
		`XANH: ${tuKho} thuoc tinh doc tu kho chuoi, va khong thuoc tinh nao ngoai danh sach ky thuat con mang chuoi viet thang.`,
	);
}

if (chan === "toast") chanToast();
else if (chan === "tieu-de") await chanTieuDe();
else if (chan === "khong-du-quyen") chanKhongDuQuyen();
else if (chan === "doi-chieu") chanDoiChieu();
else if (chan === "thuoc-tinh") chanThuocTinh();
else {
	chanToast();
	console.log("");
	await chanTieuDe();
}
