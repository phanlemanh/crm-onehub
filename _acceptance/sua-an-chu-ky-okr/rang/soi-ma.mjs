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
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ts = createRequire(import.meta.url)("typescript");

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
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

const THU_MUC_QUET = ["apps/api/src", "packages/db/src", "apps/agent/agent"];
const DANH_SACH = "_acceptance/sua-an-chu-ky-okr/rang/noi-doc-chu-ky.json";
const DINH_DANH_HIEN = "KY_CON_HIEN";
const GOI_DOC_KY = new Set(["findMany", "findFirst", "count", "groupBy"]);
const CHI_CHON = new Set(["select", "include"]);
const CHI_THEO_ID =
	/WHERE\s+id\s*=\s*(\?|ANY\(\?\))(\s+ORDER\s+BY\s+id)?(\s+FOR\s+[A-Z ]+)?\s*$/i;

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
};

const tuongDoi = (p) => (p.startsWith(GOC) ? p.slice(GOC.length + 1) : p);

function diCay(thuMuc, ra) {
	if (!existsSync(thuMuc)) return ra;
	for (const ten of readdirSync(thuMuc)) {
		if (LOAI_TRU.has(ten) || ten.startsWith(".next") || THU_MUC_THU.has(ten))
			continue;
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) diCay(duong, ra);
		else if (/\.ts$/.test(ten) && !LA_THU.test(ten)) ra.push(duong);
	}
	return ra;
}

function cay(duong, chu) {
	return ts.createSourceFile(
		duong,
		chu,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS,
	);
}

const dongCua = (sf, n) =>
	sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;

const tenKhoa = (p) =>
	p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))
		? p.name.text
		: null;

const laKhoa = (n, ten) =>
	(ts.isPropertyAssignment(n) || ts.isShorthandPropertyAssignment(n)) &&
	tenKhoa(n) === ten;

const coDinhDanh = (n) => {
	let thay = false;
	const di = (c) => {
		if (ts.isIdentifier(c) && c.text === DINH_DANH_HIEN) thay = true;
		if (!thay) ts.forEachChild(c, di);
	};
	di(n);
	return thay;
};

function hamBao(n) {
	for (let p = n.parent; p; p = p.parent) {
		if (
			(ts.isFunctionDeclaration(p) || ts.isMethodDeclaration(p)) &&
			p.name &&
			ts.isIdentifier(p.name)
		)
			return p.name.text;
		if (
			ts.isPropertyDeclaration(p) &&
			p.name &&
			ts.isIdentifier(p.name) &&
			p.initializer &&
			(ts.isArrowFunction(p.initializer) ||
				ts.isFunctionExpression(p.initializer))
		)
			return p.name.text;
		if (
			ts.isVariableDeclaration(p) &&
			ts.isIdentifier(p.name) &&
			p.parent?.parent?.parent &&
			ts.isSourceFile(p.parent.parent.parent)
		)
			return p.name.text;
	}
	return "(tệp)";
}

function chiChon(giaTri) {
	if (!ts.isObjectLiteralExpression(giaTri)) return false;
	const khoa = giaTri.properties.map(tenKhoa);
	return khoa.length > 0 && khoa.every((k) => k !== null && CHI_CHON.has(k));
}

function khoaTrongObject(o) {
	return o.properties.map(tenKhoa).filter((k) => k !== null);
}

function mangKhoa(giaTri) {
	return ts.isObjectLiteralExpression(giaTri) ? khoaTrongObject(giaTri) : [];
}

function objectBao(n) {
	for (let p = n.parent; p; p = p.parent)
		if (ts.isObjectLiteralExpression(p)) return p;
	return null;
}

function leoQuaAnd(diem) {
	let cur = diem;
	for (let buoc = 0; buoc < 12; buoc += 1) {
		const o = objectBao(cur);
		if (!o) return false;
		if (coDinhDanh(o)) return true;
		let p = o.parent;
		if (p && ts.isArrayLiteralExpression(p)) p = p.parent;
		if (p && ts.isPropertyAssignment(p) && tenKhoa(p) === "AND") cur = p;
		else return false;
	}
	return false;
}

function theoId(callNode) {
	const doi = callNode.arguments[0];
	if (!doi || !ts.isObjectLiteralExpression(doi)) return false;
	const where = doi.properties.find((p) => laKhoa(p, "where"));
	if (!where || !ts.isPropertyAssignment(where)) return false;
	if (!ts.isObjectLiteralExpression(where.initializer)) return false;
	const id = where.initializer.properties.find((p) => laKhoa(p, "id"));
	if (!id || !ts.isPropertyAssignment(id)) return false;
	return !mangKhoa(id.initializer).includes("not");
}

function vanBanQueryRaw(mau) {
	if (ts.isNoSubstitutionTemplateLiteral(mau)) return mau.text;
	return (
		mau.head.text + mau.templateSpans.map((s) => `?${s.literal.text}`).join("")
	);
}

function soiTep(tep, duong, ra) {
	const sf = cay(duong, readFileSync(duong, "utf8"));
	const ghi = (n, loai, xet) => {
		const ok =
			xet === "theo-id"
				? null
				: coDinhDanh(n) || (ts.isPropertyAssignment(n) && leoQuaAnd(n));
		ra.push({
			tep,
			ham: hamBao(n),
			loai,
			dong: dongCua(sf, n),
			ok,
			theoId: xet === "theo-id",
		});
	};
	const di = (n) => {
		if (ts.isPropertyAssignment(n) || ts.isShorthandPropertyAssignment(n)) {
			const khoa = tenKhoa(n);
			const giaTri = ts.isPropertyAssignment(n) ? n.initializer : null;
			if (khoa === "cycle") {
				const laChon =
					giaTri === null ||
					giaTri.kind === ts.SyntaxKind.TrueKeyword ||
					giaTri.kind === ts.SyntaxKind.FalseKeyword ||
					chiChon(giaTri);
				if (!laChon) ghi(n, "cycle:");
				if (giaTri && ts.isObjectLiteralExpression(giaTri)) {
					const duoi = (c) => {
						if (
							(ts.isPropertyAssignment(c) ||
								ts.isShorthandPropertyAssignment(c)) &&
							(tenKhoa(c) === "startsOn" || tenKhoa(c) === "endsOn")
						)
							ghi(c, `cycle.${tenKhoa(c)}`);
						ts.forEachChild(c, duoi);
					};
					duoi(giaTri);
				}
			}
			if (
				khoa === "cycleId" &&
				giaTri &&
				ts.isObjectLiteralExpression(giaTri) &&
				khoaTrongObject(giaTri).includes("in")
			)
				ghi(n, "cycleId: { in }");
		}
		if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)) {
			const e = n.expression;
			const goc = e.expression;
			const laOkrCycle =
				(ts.isIdentifier(goc) && goc.text === "okrCycle") ||
				(ts.isPropertyAccessExpression(goc) && goc.name.text === "okrCycle");
			if (laOkrCycle && GOI_DOC_KY.has(e.name.text))
				ghi(n, `okrCycle.${e.name.text}`, theoId(n) ? "theo-id" : null);
		}
		if (ts.isTaggedTemplateExpression(n)) {
			const tag = n.tag.getText(sf);
			if (/\$queryRaw$/.test(tag)) {
				const chu = vanBanQueryRaw(n.template);
				if (chu.includes("okrCycle") && !CHI_THEO_ID.test(chu.trim()))
					ghi(n, "$queryRaw okrCycle");
			}
		}
		ts.forEachChild(n, di);
	};
	di(sf);
}

function danhSachTep(thay = new Map(), them = new Map()) {
	const ra = [];
	for (const thuMuc of THU_MUC_QUET)
		for (const duong of diCay(join(GOC, thuMuc), [])) {
			const tep = tuongDoi(duong);
			ra.push({ tep, duong: thay.get(tep) ?? duong });
		}
	for (const [tep, duong] of them) ra.push({ tep, duong });
	return ra;
}

function docDanhSach() {
	const j = JSON.parse(readFileSync(join(GOC, DANH_SACH), "utf8"));
	return { loc: j.loc, mien: j.mien };
}

function caKyConHien(tepList) {
	const hong = [];
	const chamNoi = [];
	for (const { tep, duong } of tepList) soiTep(tep, duong, chamNoi);

	const { loc, mien } = docDanhSach();
	const khoaHam = (t, h) => `${t}\t${h}`;
	const soiDuoc = new Map();
	for (const c of chamNoi) {
		const k = khoaHam(c.tep, c.ham);
		if (!soiDuoc.has(k)) soiDuoc.set(k, []);
		soiDuoc.get(k).push(c);
	}
	const tepSoi = new Set(chamNoi.map((c) => c.tep));
	const mienCaTep = new Set(
		mien.filter((m) => m.ham === "*").map((m) => m.tep),
	);
	const daKhai = new Set([
		...loc.map((l) => khoaHam(l.tep, l.ham)),
		...mien.filter((m) => m.ham !== "*").map((m) => khoaHam(m.tep, m.ham)),
	]);

	for (const l of loc)
		if (mien.some((m) => m.tep === l.tep && (m.ham === l.ham || m.ham === "*")))
			hong.push(`${l.tep} ${l.ham} khai ở cả lọc lẫn miễn`);

	for (const [k, hits] of soiDuoc) {
		const [tep, ham] = k.split("\t");
		if (!daKhai.has(k) && !mienCaTep.has(tep))
			hong.push(
				`${tep} ${ham} chưa khai (${hits.map((h) => `${h.loai}@${h.dong}`).join(", ")})`,
			);
	}
	for (const d of daKhai) {
		const [tep, ham] = d.split("\t");
		if (!soiDuoc.has(d))
			hong.push(`${tep} ${ham} khai nhưng không còn chỗ đọc chu kỳ nào`);
	}
	for (const t of mienCaTep)
		if (!tepSoi.has(t))
			hong.push(`${t} khai miễn cả tệp nhưng không còn chỗ đọc chu kỳ nào`);

	for (const l of loc) {
		const hits = soiDuoc.get(khoaHam(l.tep, l.ham)) ?? [];
		const canLoc = hits.filter((h) => !h.theoId);
		if (hits.length > 0 && canLoc.length === 0)
			hong.push(`${l.tep} ${l.ham} khai lọc nhưng chỉ đọc theo id`);
		for (const h of canLoc)
			if (!h.ok)
				hong.push(
					`${l.tep} ${l.ham} thiếu ${DINH_DANH_HIEN} (${h.loai}@${h.dong})`,
				);
	}

	console.log(`tep da quet: ${tepList.length}`);
	console.log(`cho doc chu ky soi duoc: ${soiDuoc.size} (tep, ham)`);
	for (const [k, hits] of [...soiDuoc].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
		const [tep, ham] = k.split("\t");
		const nhom = loc.some((l) => l.tep === tep && l.ham === ham)
			? "loc "
			: "mien";
		const chiTiet = hits
			.map(
				(h) =>
					`${h.loai}@${h.dong}${h.theoId ? " theo-id" : h.ok ? " co-ky-con-hien" : ""}`,
			)
			.join("; ");
		console.log(`  [${nhom}] ${tep} ${ham} :: ${chiTiet}`);
	}
	console.log(
		`khai bao: loc ${loc.length}, mien ${mien.length} (${mienCaTep.size} ca tep)`,
	);
	return { hong, soDaSoi: soiDuoc.size };
}

function inVaThoat(hong) {
	for (const h of hong) console.log(`HONG ${h}`);
	console.log(`vi pham: ${hong.length}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

function batDo(nhan, hong, moTa) {
	const bat = hong.some((h) => moTa.every((m) => h.includes(m)));
	console.log(
		`${bat ? "bat " : "LOT "} ${nhan}: can HONG chua ${moTa.join(" + ")}`,
	);
	return bat;
}

async function chieuDoKyConHien() {
	const thuMuc = mkdtempSync(join(tmpdir(), "soi-ky-con-hien-"));
	const ketQua = [];
	try {
		const traoDoi = "apps/api/src/okr/okr-trao-doi.service.ts";
		const goc = readFileSync(join(GOC, traoDoi), "utf8");
		const banSao = goc.replace(", ...KY_CON_HIEN", "");
		if (banSao === goc || banSao.includes("...KY_CON_HIEN")) {
			console.log(
				`KHONG DO DUOC: khong go duoc ${DINH_DANH_HIEN} khoi ${traoDoi} de dung ca (a)`,
			);
			process.exit(2);
		}
		const tepA = join(thuMuc, "a-okr-trao-doi.service.ts");
		writeFileSync(tepA, banSao);

		const tenB = "apps/api/src/okr/gia-tim-ky-theo-ngay.ts";
		const tepB = join(thuMuc, "b-gia-tim-ky-theo-ngay.ts");
		writeFileSync(
			tepB,
			[
				"export async function timKyConChay(db: any, now: Date) {",
				"\treturn db.okrObjective.findMany({",
				"\t\twhere: { cycle: { endsOn: { gte: now } } },",
				"\t});",
				"}",
				"",
			].join("\n"),
		);

		const tenC = "apps/api/src/okr/gia-doc-kr-theo-ky.ts";
		const tepC = join(thuMuc, "c-gia-doc-kr-theo-ky.ts");
		writeFileSync(
			tepC,
			[
				"export async function docKrTheoKy(db: any) {",
				"\treturn db.okrKeyResult.findMany({",
				"\t\twhere: { objective: { cycle: { phase: 'dang-chay' } } },",
				"\t});",
				"}",
				"",
			].join("\n"),
		);

		const ca = [
			{
				nhan: "(a) okr-trao-doi.service.ts go KY_CON_HIEN",
				tep: danhSachTep(new Map([[traoDoi, tepA]])),
				moTa: [traoDoi, "dieuKienChuyen", DINH_DANH_HIEN],
			},
			{
				nhan: "(b) tep gia findMany cycle.endsOn",
				tep: danhSachTep(new Map(), new Map([[tenB, tepB]])),
				moTa: [tenB, "timKyConChay", "chưa khai"],
			},
			{
				nhan: "(c) tep gia okrKeyResult objective.cycle",
				tep: danhSachTep(new Map(), new Map([[tenC, tepC]])),
				moTa: [tenC, "docKrTheoKy", "chưa khai"],
			},
		];
		for (const c of ca) {
			const { hong } = caKyConHien(c.tep);
			for (const h of hong) console.log(`HONG ${h}`);
			ketQua.push(batDo(c.nhan, hong, c.moTa));
		}
	} finally {
		rmSync(thuMuc, { recursive: true, force: true });
	}
	const bat = ketQua.filter(Boolean).length;
	console.log(`chieu do: ${bat}/${ketQua.length} ca do bi bat`);
	process.exit(bat === ketQua.length ? 1 : 0);
}

const CA = {
	"ky-con-hien": {
		thuong: () => {
			const kq = caKyConHien(danhSachTep());
			if (kq.soDaSoi === 0) {
				console.log("KHONG DO DUOC: khong quet duoc cho doc chu ky nao");
				process.exit(2);
			}
			inVaThoat(kq.hong);
		},
		chieuDo: chieuDoKyConHien,
	},
};

const ca = doiSo("--ca");
const chay = ca === null ? undefined : CA[ca];
if (!chay) {
	console.log(`KHONG DO DUOC: can --ca ${Object.keys(CA).join(" | ")}`);
	process.exit(2);
}
if (process.argv.includes("--chieu-do")) await chay.chieuDo();
else await chay.thuong();
