#!/usr/bin/env node
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const pg = createRequire(join(GOC, "packages", "db", "package.json"))("pg");

const MUI_GIO = "Asia/Ho_Chi_Minh";
const NGAY = /^\d{4}-\d{2}-\d{2}$/;
const MA_KHONG_DO = 2;
const VIEC_DU_NGAY_TOI_THIEU = 5;

const SQL = `WITH cua AS (
		SELECT (($1::date)::timestamp AT TIME ZONE $3) AT TIME ZONE 'UTC' AS tu,
			((($2::date) + 1)::timestamp AT TIME ZONE $3) AT TIME ZONE 'UTC' AS den
	),
	du_an AS (
		SELECT d.id, d."taoBoiId",
			(SELECT count(*) FROM viec v
				WHERE v."duAnId" = d.id AND v."trangThai" <> 'HUY'
					AND v."batDauNgay" IS NOT NULL AND v."hanNgay" IS NOT NULL)::int AS du_ngay,
			EXISTS (SELECT 1 FROM "viecPhuThuoc" p JOIN viec t ON t.id = p."truocId"
				WHERE t."duAnId" = d.id) AS co_phu_thuoc,
			EXISTS (SELECT 1 FROM "duAnMoc" m WHERE m."duAnId" = d.id) AS co_moc
		FROM "duAn" d, cua
		WHERE d."taoLuc" >= cua.tu AND d."taoLuc" < cua.den
			AND ($4::text[] IS NULL OR d."taoBoiId" = ANY($4))
	)
	SELECT
		count(*) FILTER (WHERE du_ngay >= $5)::int AS "duAnDat",
		count(*) FILTER (WHERE du_ngay >= $5 AND co_phu_thuoc AND co_moc)::int AS "duAnDatDu",
		count(DISTINCT "taoBoiId") FILTER (WHERE du_ngay >= $5)::int AS "nguoiTaoDat",
		count(*) FILTER (WHERE co_phu_thuoc)::int AS "duAnCoPhuThuoc"
	FROM du_an`;

function doc(argv, ten) {
	const i = argv.indexOf(ten);
	return i === -1 ? null : (argv[i + 1] ?? "");
}

function khongDo(cau) {
	console.error(`do-nguong: ${cau}`);
	process.exit(MA_KHONG_DO);
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
		const r = await client.query(SQL, [
			tu,
			den,
			MUI_GIO,
			trong,
			VIEC_DU_NGAY_TOI_THIEU,
		]);
		await client.query("ROLLBACK");
		const hang = r.rows[0] ?? {};
		const ket = {
			luc: new Date().toISOString(),
			cuaSo: { tu, den, muiGio: MUI_GIO },
			duAnDat: hang.duAnDat ?? 0,
			duAnDatDu: hang.duAnDatDu ?? 0,
			nguoiTaoDat: hang.nguoiTaoDat ?? 0,
			duAnCoPhuThuoc: hang.duAnCoPhuThuoc ?? 0,
		};
		console.log(JSON.stringify(ket, null, 2));
	} finally {
		await client.end();
	}
}

main().catch((loi) => khongDo(loi.message));
