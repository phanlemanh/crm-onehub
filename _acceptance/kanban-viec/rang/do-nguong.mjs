#!/usr/bin/env node
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const pg = createRequire(join(GOC, "packages", "db", "package.json"))("pg");

const MUI_GIO = "Asia/Ho_Chi_Minh";
const NGAY = /^\d{4}-\d{2}-\d{2}$/;
const CHU_SO_TI_LE = 4;
const MA_KHONG_DO = 2;

const CUA = `WITH cua AS (
		SELECT (($1::date)::timestamp AT TIME ZONE $3) AT TIME ZONE 'UTC' AS tu,
			((($2::date) + 1)::timestamp AT TIME ZONE $3) AT TIME ZONE 'UTC' AS den
	)`;

const SQL = {
	doiTrangThai: `${CUA}
		SELECT count(*)::int AS tong,
			count(*) FILTER (WHERE e.nguon = 'bang-keo')::int AS keo,
			count(*) FILTER (WHERE e.nguon = 'bang-menu')::int AS menu
		FROM "viecVet" e, cua
		WHERE e.loai = 'doi-trang-thai' AND e."nguoiId" IS NOT NULL
			AND e.luc >= cua.tu AND e.luc < cua.den
			AND ($4::text[] IS NULL OR e."nguoiId" = ANY($4))`,
	viecCon: `${CUA}
		SELECT count(DISTINCT e."viecId")::int AS viec,
			count(DISTINCT e."nguoiId")::int AS nguoi
		FROM "viecVet" e, cua
		WHERE e.loai = 'them-viec-con'
			AND e.luc >= cua.tu AND e.luc < cua.den
			AND ($4::text[] IS NULL OR e."nguoiId" = ANY($4))`,
};

function doc(argv, ten) {
	const i = argv.indexOf(ten);
	return i === -1 ? null : (argv[i + 1] ?? "");
}

function khongDo(cau) {
	console.error(`do-nguong: ${cau}`);
	process.exit(MA_KHONG_DO);
}

function tiLe(tu, mau) {
	return mau === 0 ? 0 : Number((tu / mau).toFixed(CHU_SO_TI_LE));
}

async function main() {
	const argv = process.argv.slice(2);
	const tu = doc(argv, "--tu");
	const den = doc(argv, "--den");
	if (!tu || !den || !NGAY.test(tu) || !NGAY.test(den)) {
		khongDo("can --tu va --den dang YYYY-MM-DD (ngay gio VN)");
	}
	const trongChu = doc(argv, "--trong");
	const trong =
		trongChu === null ? null : trongChu.split(",").filter((m) => m !== "");
	const url = process.env.DATABASE_URL;
	if (!url) khongDo("thieu DATABASE_URL trong moi truong");
	const client = new pg.Client({
		connectionString: url,
		options: "-c default_transaction_read_only=on",
	});
	await client.connect();
	try {
		await client.query("BEGIN READ ONLY");
		const doi = await client.query(SQL.doiTrangThai, [tu, den, MUI_GIO, trong]);
		const con = await client.query(SQL.viecCon, [tu, den, MUI_GIO, trong]);
		await client.query("ROLLBACK");
		const tong = doi.rows[0]?.tong ?? 0;
		const keo = doi.rows[0]?.keo ?? 0;
		const menu = doi.rows[0]?.menu ?? 0;
		const ket = {
			luc: new Date().toISOString(),
			cuaSo: { tu, den, muiGio: MUI_GIO },
			doiTrangThaiNguoi: tong,
			quaBangKeo: keo,
			quaBangMenu: menu,
			tiLeBangKeo: tiLe(keo, tong),
			tiLeBang: tiLe(keo + menu, tong),
			viecCoCon: con.rows[0]?.viec ?? 0,
			nguoiTaoCon: con.rows[0]?.nguoi ?? 0,
		};
		console.log(JSON.stringify(ket, null, 2));
	} finally {
		await client.end();
	}
}

main().catch((loi) => khongDo(loi.message));
