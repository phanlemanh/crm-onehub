import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TRO_LY_OKR_TRAN } from "../../../packages/db/src/okr-tro-ly-danh-muc.ts";

const TEN = "so-lech-lot";
const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const pg = createRequire(join(GOC, "packages/db/package.json"))("pg");

export const DANG_THAM_CHIEU = [
	"gia-tri",
	"truoc",
	"chenh-lech",
	"khoi-diem",
	"dich",
	"tien-do",
	"ngay",
];

const SO_LECH = {
	gioVN: 7,
	phanTram: 100,
	lamTronChenh: 10_000,
	saiSo: 1e-9,
	nghin: 1_000,
	thamSoBan: "--ban",
	thamSoDoc: "--doc",
};

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
const NGU_CANH = TRO_LY_OKR_TRAN.soBangChu;
const CAN_NGU_CANH = new Set(["một", "năm"]);

const MAU = {
	token:
		/(\d{1,2})\/(\d{1,2})(?![\d/])|\d+(?:[.,]\d+)*(k\b)?|%|\p{L}+|[.!?;:]/gu,
	nghinCham: /^\d{1,3}(\.\d{3})+(,\d+)?$/,
	thapPhanPhay: /^\d+,\d+$/,
	nghinPhay: /^\d{1,3}(,\d{3})+(\.\d+)?$/,
	thapPhanCham: /^\d+\.\d+$/,
	nguyen: /^\d+$/,
};

function tachTu(chu) {
	const ra = [];
	for (const k of (chu ?? "")
		.normalize("NFC")
		.toLowerCase()
		.matchAll(MAU.token)) {
		if (k[1] !== undefined) {
			ra.push({
				kieu: "ngay",
				van: k[0],
				ngay: Number(k[1]),
				thang: Number(k[2]),
			});
		} else if (/^\d/.test(k[0])) {
			const van = k[3] ? k[0].slice(0, -1) : k[0];
			ra.push({ kieu: "so", van: k[0], cach: cachDoc(van, Boolean(k[3])) });
		} else ra.push({ kieu: "chu", van: k[0] });
	}
	return ra;
}

function themCach(ra, so) {
	if (Number.isFinite(so) && !ra.includes(so)) ra.push(so);
}

export function cachDoc(chuoi, coK = false) {
	const ra = [];
	if (MAU.nguyen.test(chuoi)) themCach(ra, Number(chuoi));
	if (MAU.nghinCham.test(chuoi))
		themCach(ra, Number(chuoi.replaceAll(".", "").replace(",", ".")));
	if (MAU.thapPhanPhay.test(chuoi))
		themCach(ra, Number(chuoi.replace(",", ".")));
	if (MAU.nghinPhay.test(chuoi))
		themCach(ra, Number(chuoi.replaceAll(",", "")));
	if (MAU.thapPhanCham.test(chuoi)) themCach(ra, Number(chuoi));
	return coK ? ra.map((so) => so * SO_LECH.nghin) : ra;
}

const chuCua = (t, i) => (t[i]?.kieu === "chu" ? t[i].van : undefined);

function coCumTai(t, tu, cum) {
	const chu = cum.split(" ");
	return tu >= 0 && chu.every((c, k) => chuCua(t, tu + k) === c);
}

function laSoTheoNguCanh(t, i) {
	const van = chuCua(t, i);
	if (!CAN_NGU_CANH.has(van)) return true;
	if (NGU_CANH.hauToCo.some((c) => coCumTai(t, i + 1, c))) return true;
	if (van === "một") return false;
	const sau = t[i + 1];
	if (sau === undefined) return false;
	if (sau.kieu === "chu" && NGU_CANH.dauCau.includes(sau.van)) return false;
	if (sau.kieu === "so" && /^\d{4}$/.test(sau.van)) return false;
	if (NGU_CANH.namSauCum.some((c) => coCumTai(t, i - c.split(" ").length, c)))
		return false;
	return !NGU_CANH.namTruocCum.some((c) => coCumTai(t, i + 1, c));
}

function docSauChuc(t, j, coSo) {
	const them = SAU_CHUC.get(chuCua(t, j));
	return them === undefined ? [coSo, j] : [coSo + them, j + 1];
}

function docChu(t, i) {
	const van = chuCua(t, i);
	if (van === "mười") return docSauChuc(t, i + 1, 10);
	const don = DON_VI.get(van);
	if (don === undefined) return null;
	if (chuCua(t, i + 1) === "mươi") return docSauChuc(t, i + 2, don * 10);
	return [don, i + 1];
}

function docTram(t, [giaTri, het]) {
	if (chuCua(t, het) !== "trăm") return [giaTri, het];
	const tram = giaTri * 100;
	const j = het + 1;
	const le = chuCua(t, j);
	if ((le === "linh" || le === "lẻ") && DON_VI.has(chuCua(t, j + 1))) {
		return [tram + DON_VI.get(chuCua(t, j + 1)), j + 2];
	}
	const sau = docChu(t, j);
	return sau && sau[0] < 100 ? [tram + sau[0], sau[1]] : [tram, j];
}

function docNhan(t, j) {
	const van = chuCua(t, j);
	if (van === "%") return [1, j + 1];
	if (van === "phần" && chuCua(t, j + 1) === "trăm") return [1, j + 2];
	if ((van === "tỷ" || van === "tỉ") && TY_KHONG_NHAN.has(chuCua(t, j + 1)))
		return [1, j];
	const nhan = NHAN.get(van);
	return nhan === undefined ? [1, j] : [nhan, j + 1];
}

function gocTai(t, i) {
	if (t[i].kieu === "so") return { cach: t[i].cach, het: i + 1, van: t[i].van };
	if (!laSoTheoNguCanh(t, i)) return null;
	const chu = docChu(t, i);
	if (!chu) return null;
	const [giaTri, het] = docTram(t, chu);
	return {
		cach: [giaTri],
		het,
		van: t
			.slice(i, het)
			.map((x) => x.van)
			.join(" "),
	};
}

function motSo(t, i) {
	const goc = gocTai(t, i);
	if (!goc) return null;
	const [nhan, sau] = docNhan(t, goc.het);
	return {
		cach: goc.cach.map((so) => so * nhan),
		nhan,
		het: sau,
		van: t
			.slice(i, sau)
			.map((x) => x.van)
			.join(" "),
	};
}

export function docSo(chu) {
	const t = tachTu(chu);
	const ra = [];
	let i = 0;
	while (i < t.length) {
		if (t[i].kieu === "ngay") {
			ra.push({ van: t[i].van, ngay: `${t[i].ngay}/${t[i].thang}`, cach: [] });
			i += 1;
			continue;
		}
		const so = motSo(t, i);
		if (!so) {
			i += 1;
			continue;
		}
		let { cach, nhan, het, van } = so;
		while (nhan > 1 && het < t.length) {
			const ke = motSo(t, het);
			if (!ke || ke.nhan >= nhan || ke.nhan === 1 || ke.cach.length === 0)
				break;
			cach = cach.flatMap((a) => ke.cach.map((b) => a + b));
			nhan = ke.nhan;
			van = `${van} ${ke.van}`;
			het = ke.het;
		}
		ra.push({ van, cach });
		i = het;
	}
	return ra;
}

function bang(a, b) {
	return (
		Math.abs(a - b) <= SO_LECH.saiSo * Math.max(1, Math.abs(a), Math.abs(b))
	);
}

const kep = (p) => Math.max(0, Math.min(SO_LECH.phanTram, Math.round(p)));

export function tienDo(kieu, khoi, dich, hien) {
	switch (kieu) {
		case "tang-toi":
			return dich === khoi ? 0 : kep(((hien - khoi) / (dich - khoi)) * 100);
		case "giam-xuong":
			return dich === khoi ? 0 : kep(((khoi - hien) / (khoi - dich)) * 100);
		case "giu-tren":
			return hien >= dich ? 100 : 0;
		case "giu-duoi":
			return hien <= dich ? 100 : 0;
		case "moc":
			return hien >= 1 ? 100 : 0;
		case "phan-tram":
			return kep(hien);
		default:
			throw new Error(`${TEN}: kieu KR la «${kieu}»`);
	}
}

const lamTronChenh = (so) =>
	Math.round(so * SO_LECH.lamTronChenh) / SO_LECH.lamTronChenh + 0;

export function thamChieuCua(lan, bo = []) {
	const giaTri = Number(lan.gia);
	const truoc = lan.truoc === null ? null : Number(lan.truoc);
	const khoi = Number(lan.khoi);
	const dich = Number(lan.dich);
	const so = [
		["gia-tri", giaTri],
		["truoc", truoc],
		[
			"chenh-lech",
			truoc === null ? null : Math.abs(lamTronChenh(giaTri - truoc)),
		],
		["khoi-diem", khoi],
		["dich", dich],
		["tien-do", tienDo(lan.kieu, khoi, dich, giaTri)],
	].filter(([dang, v]) => v !== null && !bo.includes(dang));
	return {
		so: so.map(([dang, v]) => ({ dang, v })),
		ngay: bo.includes("ngay") ? [] : [lan.ngay],
	};
}

function ngayGon(chu) {
	const [d = "", m = ""] = chu.split("/");
	return `${Number(d)}/${Number(m)}`;
}

export function soLechCuaCau(vanBan, thamChieu) {
	const so = thamChieu.flatMap((t) => t.so.map((x) => x.v));
	const ngay = new Set(thamChieu.flatMap((t) => t.ngay.map(ngayGon)));
	return docSo(vanBan)
		.filter((s) =>
			s.ngay !== undefined
				? !ngay.has(s.ngay)
				: !s.cach.some((c) => so.some((v) => bang(c, v))),
		)
		.map((s) => s.van);
}

const CAU_BAN = `SELECT id, cau, "createdAt" FROM "okrTomTat"
	WHERE ($1::text[] IS NULL OR id = ANY($1::text[]))
	ORDER BY "createdAt", id`;

const CAU_LAN = `WITH dan AS (
		SELECT id, "keyResultId" FROM "okrCheckIn" WHERE id = ANY($1::text[])
	),
	lan AS (
		SELECT c.id, c."keyResultId", c.value::text AS gia,
			coalesce(s."submittedAt", c."createdAt") AS luc,
			lag(c.value::text) OVER (
				PARTITION BY c."keyResultId"
				ORDER BY coalesce(s."submittedAt", c."createdAt"), c."createdAt", c.id
			) AS truoc
		FROM "okrCheckIn" c
		JOIN "okrCheckInSession" s ON s.id = c."sessionId"
		WHERE c."keyResultId" IN (SELECT "keyResultId" FROM dan)
	)
	SELECT l.id, l.gia, l.truoc,
		to_char(l.luc + make_interval(hours => $2::int), 'DD/MM') AS ngay,
		k.kind AS kieu, k."startValue"::text AS khoi, k."targetValue"::text AS dich
	FROM lan l
	JOIN "okrKeyResult" k ON k.id = l."keyResultId"
	WHERE l.id IN (SELECT id FROM dan)`;

async function truyVan(khach, cau, thamSo) {
	return (await khach.query(cau, thamSo)).rows;
}

export async function soLechTrongKho(url, { ban = null, bo = [] } = {}) {
	const khach = new pg.Client({ connectionString: url });
	await khach.connect();
	try {
		const hang = await truyVan(khach, CAU_BAN, [ban]);
		const banDoc = hang.map((h) => ({
			id: h.id,
			nac: h.cau?.nac === "an" ? "an" : "bat",
			cau: Array.isArray(h.cau?.cau) ? h.cau.cau : [],
		}));
		const idNguon = [
			...new Set(banDoc.flatMap((b) => b.cau.flatMap((c) => c.nguon ?? []))),
		];
		const lan = await truyVan(khach, CAU_LAN, [idNguon, SO_LECH.gioVN]);
		const theoId = new Map(lan.map((l) => [l.id, thamChieuCua(l, bo)]));
		const lech = [];
		const dem = { bat: { cau: 0, lech: 0 }, an: { cau: 0, lech: 0 } };
		for (const b of banDoc) {
			b.cau.forEach((c, i) => {
				dem[b.nac].cau += 1;
				const tham = (c.nguon ?? []).flatMap((id) => {
					const t = theoId.get(id);
					return t ? [t] : [];
				});
				for (const so of soLechCuaCau(c.vanBan ?? "", tham)) {
					dem[b.nac].lech += 1;
					lech.push({ ban: b.id, nac: b.nac, cau: i, so, vanBan: c.vanBan });
				}
			});
		}
		return { soBan: banDoc.length, dem, lech };
	} finally {
		await khach.end();
	}
}

function thamSoDs(ten) {
	const i = process.argv.indexOf(ten);
	if (i < 0) return null;
	const ds = (process.argv[i + 1] ?? "").split(",").filter(Boolean);
	if (ds.length === 0) {
		console.error(`${TEN}: ${ten} can it nhat mot id`);
		process.exit(2);
	}
	return ds;
}

async function main() {
	const iDoc = process.argv.indexOf(SO_LECH.thamSoDoc);
	if (iDoc >= 0) {
		console.log(
			JSON.stringify(
				docSo(process.argv[iDoc + 1] ?? "").map((s) =>
					s.ngay !== undefined ? s.ngay : s.cach,
				),
			),
		);
		return 0;
	}
	const url = process.env.DATABASE_URL;
	if (!url) {
		console.error(`${TEN}: thieu DATABASE_URL`);
		return 2;
	}
	const kq = await soLechTrongKho(url, { ban: thamSoDs(SO_LECH.thamSoBan) });
	console.log(
		`${TEN}: ${kq.lech.length} so lech trong ${kq.dem.bat.cau + kq.dem.an.cau} cau cua ${kq.soBan} ban`,
	);
	for (const nac of ["bat", "an"])
		console.log(
			`${TEN}: ${nac} ${kq.dem[nac].lech} lech / ${kq.dem[nac].cau} cau`,
		);
	for (const l of kq.lech) console.log(`${l.ban}|${l.cau}|${l.so}`);
	return kq.lech.length === 0 ? 0 : 1;
}

if (import.meta.main) process.exit(await main());
