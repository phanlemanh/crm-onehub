import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TRO_LY_OKR_TRAN } from "../../../packages/db/src/okr-tro-ly-danh-muc.ts";

const TEN = "so-moi-lot";
const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const pg = createRequire(join(GOC, "packages/db/package.json"))("pg");

const DON_VI = new Map([
	["một", 1],
	["hai", 2],
	["ba", 3],
	["bốn", 4],
	["năm", 5],
	["sáu", 6],
	["bảy", 7],
	["tám", 8],
	["chín", 9],
]);
const SAU_CHUC = new Map([...DON_VI, ["mốt", 1], ["tư", 4], ["lăm", 5]]);
const NHAN = new Map([
	["tỷ", 1e9],
	["tỉ", 1e9],
	["triệu", 1e6],
	["nghìn", 1e3],
	["ngàn", 1e3],
]);
const TY_KHONG_NHAN = new Set(["lệ", "trọng", "suất"]);
const SAI_SO = 1e-9;
const NGU_CANH = TRO_LY_OKR_TRAN.soBangChu;
const CAN_NGU_CANH = new Set(["một", "năm"]);

function thamSo() {
	const i = process.argv.indexOf("--muc-tieu");
	if (i < 0) return null;
	const ds = (process.argv[i + 1] ?? "").split(",").filter(Boolean);
	if (ds.length === 0) {
		console.error(`${TEN}: --muc-tieu cần ít nhất một id`);
		process.exit(2);
	}
	return ds;
}

function tachTu(chu) {
	return (
		(chu ?? "")
			.normalize("NFC")
			.toLowerCase()
			.match(/\d+(?:[.,]\d+)*|%|\p{L}+|[.!?;:]/gu) ?? []
	);
}

function docChuSo(s) {
	if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
		return Number(s.replaceAll(".", "").replace(",", "."));
	}
	if (/^\d+,\d+$/.test(s)) return Number(s.replace(",", "."));
	if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
	return Number.NaN;
}

function docSauChuc(t, j, coSo) {
	const them = SAU_CHUC.get(t[j]);
	return them === undefined ? [coSo, j] : [coSo + them, j + 1];
}

function coCumTai(t, tu, cum) {
	const chu = cum.split(" ");
	return tu >= 0 && chu.every((c, k) => t[tu + k] === c);
}

function laSoTheoNguCanh(t, i) {
	if (!CAN_NGU_CANH.has(t[i])) return true;
	if (NGU_CANH.hauToCo.some((c) => coCumTai(t, i + 1, c))) return true;
	if (t[i] === "một") return false;
	const sau = t[i + 1];
	if (sau === undefined || NGU_CANH.dauCau.includes(sau)) return false;
	if (/^\d{4}$/.test(sau)) return false;
	if (NGU_CANH.namSauCum.some((c) => coCumTai(t, i - c.split(" ").length, c)))
		return false;
	return !NGU_CANH.namTruocCum.some((c) => coCumTai(t, i + 1, c));
}

function docChu(t, i) {
	if (t[i] === "mười") return docSauChuc(t, i + 1, 10);
	const don = DON_VI.get(t[i]);
	if (don === undefined) return null;
	if (t[i + 1] === "mươi") return docSauChuc(t, i + 2, don * 10);
	return [don, i + 1];
}

function docTram(t, [giaTri, het]) {
	if (t[het] !== "trăm") return [giaTri, het];
	const tram = giaTri * 100;
	const j = het + 1;
	if ((t[j] === "linh" || t[j] === "lẻ") && DON_VI.has(t[j + 1])) {
		return [tram + DON_VI.get(t[j + 1]), j + 2];
	}
	const le = docChu(t, j);
	return le && le[0] < 100 ? [tram + le[0], le[1]] : [tram, j];
}

function docNhan(t, j) {
	if (t[j] === "%") return [1, j + 1];
	if (t[j] === "phần" && t[j + 1] === "trăm") return [1, j + 2];
	if ((t[j] === "tỷ" || t[j] === "tỉ") && TY_KHONG_NHAN.has(t[j + 1])) {
		return [1, j];
	}
	const nhan = NHAN.get(t[j]);
	return nhan === undefined ? [1, j] : [nhan, j + 1];
}

function cacSo(chu) {
	const t = tachTu(chu);
	const ra = [];
	let i = 0;
	while (i < t.length) {
		const goc = /^\d/.test(t[i])
			? [docChuSo(t[i]), i + 1]
			: laSoTheoNguCanh(t, i)
				? docChu(t, i)
				: null;
		if (!goc) {
			i += 1;
			continue;
		}
		const [giaTri, het] = docTram(t, goc);
		const [nhan, sau] = docNhan(t, het);
		ra.push({ goc: giaTri, nhan, giaTri: giaTri * nhan });
		i = sau;
	}
	return ra;
}

function bang(a, b) {
	return Math.abs(a - b) <= SAI_SO * Math.max(1, Math.abs(a), Math.abs(b));
}

function nhanCuaKr(hang) {
	const donVi = (hang.unit ?? "").trim();
	return cacNhanTrong(donVi === "" ? (hang.krTitle ?? "") : donVi);
}

function cacNhanTrong(chu) {
	const t = tachTu(chu);
	return t
		.map((_, j) => docNhan(t, j))
		.filter(([nhan, het], j) => het > j && nhan !== 1)
		.map(([nhan]) => nhan);
}

function soMoiCua(hang) {
	const oKr = [hang.startValue, hang.targetValue, hang.currentValue]
		.filter((v) => v !== null)
		.map(Number);
	const nhanKr = hang.keyResultId ? nhanCuaKr(hang) : [];
	const duoc = [...cacSo(hang.truoc).map((s) => s.giaTri), ...oKr];
	return cacSo(hang.sau).filter(
		(s) =>
			Number.isNaN(s.giaTri) ||
			!(
				duoc.some((d) => bang(d, s.giaTri)) ||
				(nhanKr.includes(s.nhan) && oKr.some((d) => bang(d, s.goc)))
			),
	);
}

const iDoc = process.argv.indexOf("--doc");
if (iDoc >= 0) {
	console.log(
		JSON.stringify(cacSo(process.argv[iDoc + 1] ?? "").map((s) => s.giaTri)),
	);
	process.exit(0);
}

const mucTieu = thamSo();
const url = process.env.DATABASE_URL;
if (!url) {
	console.error(`${TEN}: thiếu DATABASE_URL`);
	process.exit(2);
}
const khach = new pg.Client({ connectionString: url });
await khach.connect();
try {
	const { rows } = await khach.query(
		`SELECT d.id, d."keyResultId", d.truoc, d.sau,
			k."startValue"::text AS "startValue",
			k."targetValue"::text AS "targetValue",
			k."currentValue"::text AS "currentValue",
			k.unit, k.title AS "krTitle"
		FROM "okrDeXuat" d
		LEFT JOIN "okrKeyResult" k ON k.id = d."keyResultId"
		WHERE d."trangThai" = 'cho' AND d.sau IS NOT NULL
			AND ($1::text[] IS NULL OR d."objectiveId" = ANY($1::text[]))
		ORDER BY d."createdAt", d.id`,
		[mucTieu],
	);
	const lot = rows
		.map((hang) => ({ hang, moi: soMoiCua(hang) }))
		.filter((x) => x.moi.length > 0);
	console.log(`${TEN}: ${lot.length} dong`);
	for (const { hang, moi } of lot) {
		console.log(
			`${TEN}: id ${hang.id} so moi ${moi.map((s) => s.giaTri).join(", ")} «${hang.sau}»`,
		);
	}
} finally {
	await khach.end();
}
