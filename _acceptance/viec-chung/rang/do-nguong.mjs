#!/usr/bin/env node
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const pg = createRequire(join(GOC, "packages", "db", "package.json"))("pg");

const MUI_GIO = "Asia/Ho_Chi_Minh";
const VAI_CHI_OKR = "okr";
const WORKSPACE_ID = "workspace";
const TRANG_THAI_MO = ["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA"];
const NGAY = /^\d{4}-\d{2}-\d{2}$/;
const CHU_SO_TI_LE = 4;
const MA_KHONG_DO = 2;
const MA_VAI_OKR = 2;

const SQL = {
	giaoNguoiKhac: `WITH cua AS (
			SELECT (($1::date)::timestamp AT TIME ZONE $3) AT TIME ZONE 'UTC' AS tu,
				((($2::date) + 1)::timestamp AT TIME ZONE $3) AT TIME ZONE 'UTC' AS den
		)
		SELECT count(*)::int AS tong,
			count(*) FILTER (WHERE v."roiChuaLamLuc" IS NOT NULL AND (
				(v."hanNgay" IS NOT NULL AND v."roiChuaLamLuc" < ((((((v."hanNgay" AT TIME ZONE 'UTC') AT TIME ZONE $3)::date + 1)::timestamp) AT TIME ZONE $3) AT TIME ZONE 'UTC'))
				OR (v."hanNgay" IS NULL AND v."roiChuaLamLuc" >= cua.tu AND v."roiChuaLamLuc" < cua.den)
			))::int AS dung
		FROM viec v, cua
		WHERE v."taoLuc" >= cua.tu AND v."taoLuc" < cua.den
			AND v."nguoiThucHienId" <> v."taoBoiId"
			AND NOT (v."trangThai" = 'HUY' AND v."roiChuaLamLuc" IS NULL)
			AND ($4::text[] IS NULL OR v."taoBoiId" = ANY($4))`,
	vaiChiOkr: `SELECT count(DISTINCT v.id)::int AS so FROM viec v
		WHERE v."trangThai"::text = ANY($3)
			AND EXISTS (SELECT 1 FROM "viecGan" g WHERE g."viecId" = v.id)
			AND EXISTS (SELECT 1 FROM "member" m WHERE m."organizationId" = $1 AND m.role = $2
				AND (m."userId" = v."nguoiThucHienId"
					OR m."userId" IN (SELECT t."userId" FROM "viecTheoDoi" t WHERE t."viecId" = v.id)))
			AND ($4::text[] IS NULL OR v."taoBoiId" = ANY($4))`,
};

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
		const giao = await client.query(SQL.giaoNguoiKhac, [
			tu,
			den,
			MUI_GIO,
			trong,
		]);
		const vai = await client.query(SQL.vaiChiOkr, [
			WORKSPACE_ID,
			VAI_CHI_OKR,
			TRANG_THAI_MO,
			trong,
		]);
		await client.query("ROLLBACK");
		const tong = giao.rows[0]?.tong ?? 0;
		const dung = giao.rows[0]?.dung ?? 0;
		const ket = {
			luc: new Date().toISOString(),
			cuaSo: { tu, den, muiGio: MUI_GIO },
			viecGiaoNguoiKhac: {
				tong,
				roiChuaLamDungHan: dung,
				tiLe: tong === 0 ? null : Number((dung / tong).toFixed(CHU_SO_TI_LE)),
			},
			viecDoiTacTaiVaiChiOkr: vai.rows[0]?.so ?? 0,
			luuY: "tong bo viec nguoi giao Huy khi roiChuaLamLuc con trong; vai doc o thoi diem chay",
		};
		console.log(JSON.stringify(ket, null, 2));
		process.exit(ket.viecDoiTacTaiVaiChiOkr === 0 ? 0 : MA_VAI_OKR);
	} finally {
		await client.end();
	}
}

main().catch((loi) => khongDo(loi.message));
