#!/usr/bin/env node
// Thước ngưỡng (a) của ke-hoach-sinh-viec: tỉ lệ Việc sinh từ khuôn được người thực hiện chuyển khỏi
// «Chưa làm» trước hoặc trong ngày hạn. Mẫu số: Việc có vết «tao» nguồn khuon, tạo trong cửa sổ,
// hạn ≤ ngày --den và không Huỷ (Việc chưa tới hạn còn có thể đạt; Việc Huỷ không còn phải làm).
// Chạy trong giao dịch READ ONLY. Thoát 2 khi tỉ lệ dưới ngưỡng 0,7 (ngưỡng đã ký ở Cổng Đáng 14/10).
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const pg = createRequire(join(GOC, "packages", "db", "package.json"))("pg");

const MUI_GIO = "Asia/Ho_Chi_Minh";
const NGUONG = 0.7;
const NGAY = /^\d{4}-\d{2}-\d{2}$/;
const CHU_SO_TI_LE = 4;
const MA_KHONG_DO = 3;
const MA_DUOI_NGUONG = 2;

const SQL = `WITH cua AS (
		SELECT (($1::date)::timestamp AT TIME ZONE $3) AT TIME ZONE 'UTC' AS tu,
			((($2::date) + 1)::timestamp AT TIME ZONE $3) AT TIME ZONE 'UTC' AS den
	)
	SELECT count(*)::int AS tong,
		count(*) FILTER (WHERE v."roiChuaLamLuc" IS NOT NULL
			AND v."roiChuaLamLuc" < ((((((v."hanNgay" AT TIME ZONE 'UTC') AT TIME ZONE $3)::date + 1)::timestamp) AT TIME ZONE $3) AT TIME ZONE 'UTC'))::int AS dung
	FROM viec v, cua
	WHERE EXISTS (SELECT 1 FROM "viecVet" e WHERE e."viecId" = v.id AND e.loai = 'tao' AND e.nguon = 'khuon')
		AND v."taoLuc" >= cua.tu AND v."taoLuc" < cua.den
		AND v."hanNgay" IS NOT NULL
		AND (v."hanNgay" AT TIME ZONE 'UTC')::date <= $2::date
		AND v."trangThai" <> 'HUY'
		AND ($4::text[] IS NULL OR v."taoBoiId" = ANY($4))`;

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
		await client.query("BEGIN TRANSACTION READ ONLY");
		const chiDoc =
			(await client.query("SHOW transaction_read_only")).rows[0]
				?.transaction_read_only === "on";
		const r = await client.query(SQL, [tu, den, MUI_GIO, trong]);
		await client.query("ROLLBACK");
		const tong = r.rows[0]?.tong ?? 0;
		const dung = r.rows[0]?.dung ?? 0;
		const tiLe =
			tong === 0 ? null : Number((dung / tong).toFixed(CHU_SO_TI_LE));
		const ket = {
			luc: new Date().toISOString(),
			cuaSo: { tu, den, muiGio: MUI_GIO },
			nguong: NGUONG,
			chiDoc,
			viecKhuon: { tong, dungHan: dung, tiLe },
			luuY: "mau so: viec nguon khuon tao trong cua so, han <= --den, khong Huy",
		};
		console.log(JSON.stringify(ket, null, 2));
		process.exitCode = tiLe !== null && tiLe < NGUONG ? MA_DUOI_NGUONG : 0;
	} finally {
		await client.end();
	}
}

main().catch((loi) => khongDo(loi.message));
