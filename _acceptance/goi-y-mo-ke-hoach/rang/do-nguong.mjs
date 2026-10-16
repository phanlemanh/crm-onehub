#!/usr/bin/env node
// Thước ngưỡng (b) của goi-y-mo-ke-hoach (đã ký ở Cổng Đáng DA3, 14/10): mọi lần deal chuyển sang giai
// đoạn thắng của công ty chưa có kế hoạch mở đều có một gợi ý, và ≥ 50 % gợi ý được xử lý trong 3 ngày.
// Mẫu số lần chuyển đọc từ dòng hoạt động STAGE_CHANGE và giai đoạn đầu của deal tạo mới — KHÔNG từ bảng
// gợi ý. Chạy trong giao dịch READ ONLY. Thoát 2 khi chết, 3 khi không đo được (không bao giờ 0 khi một
// mẫu số bằng 0).
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const pg = createRequire(join(GOC, "packages", "db", "package.json"))("pg");

const MUI_GIO = "Asia/Ho_Chi_Minh";
const NGUONG = 0.5;
const KIP_NGAY = 3;
const NGAY = /^\d{4}-\d{2}-\d{2}$/;
const CHU_SO_TI_LE = 4;
const MA_DUOI_NGUONG = 2;
const MA_KHONG_DO = 3;

const CUA = `cua AS (
		SELECT (($1::date)::timestamp AT TIME ZONE $3) AT TIME ZONE 'UTC' AS tu,
			((($2::date) + 1)::timestamp AT TIME ZONE $3) AT TIME ZONE 'UTC' AS den
	)`;

const SQL_CHUYEN = `WITH ${CUA},
	chuyen AS (
		SELECT a."dealId" AS deal_id, a."companyId" AS cong_ty, a."occurredAt" AS luc
		FROM activity a
		JOIN "dealStage" tu ON tu.id = a.meta->>'from'
		JOIN "dealStage" den ON den.id = a.meta->>'to'
		CROSS JOIN cua
		WHERE a.type = 'STAGE_CHANGE' AND a."dealId" IS NOT NULL
			AND tu.kind <> 'WON' AND den.kind = 'WON'
			AND a."occurredAt" >= cua.tu AND a."occurredAt" < cua.den
		UNION ALL
		SELECT d.id, d."companyId", d."createdAt"
		FROM deal d
		CROSS JOIN cua
		JOIN "dealStage" dau ON dau.id = COALESCE(
			(SELECT a.meta->>'from' FROM activity a
				WHERE a."dealId" = d.id AND a.type = 'STAGE_CHANGE'
				ORDER BY a."occurredAt" ASC LIMIT 1),
			d.stage)
		WHERE dau.kind = 'WON' AND d."createdAt" >= cua.tu AND d."createdAt" < cua.den
	),
	du AS (
		SELECT c.* FROM chuyen c
		WHERE ($4::text[] IS NULL OR c.cong_ty = ANY($4))
			AND NOT EXISTS (
				SELECT 1 FROM "onboardingPlan" p
				WHERE p."companyId" = c.cong_ty AND p."createdAt" <= c.luc
					AND (p."closedAt" IS NULL OR p."closedAt" > c.luc)
			)
	)
	SELECT count(*)::int AS lan_chuyen,
		count(*) FILTER (WHERE NOT EXISTS (
			SELECT 1 FROM "goiYKeHoach" g
			WHERE g."dealId" = du.deal_id
				AND (g."chuyenLuc" = du.luc
					OR (g."sinhLuc" < du.luc AND (g."xuLyLuc" IS NULL OR g."xuLyLuc" > du.luc)))
		))::int AS thieu
	FROM du`;

const SQL_XU_LY = `WITH ${CUA}
	SELECT count(*)::int AS phan,
		count(*) FILTER (WHERE g."xuLyLuc" IS NOT NULL
			AND g."xuLyLuc" - g."sinhLuc" <= make_interval(days => $5))::int AS kip
	FROM "goiYKeHoach" g, cua
	WHERE g."sinhLuc" >= cua.tu AND g."sinhLuc" < cua.den
		AND g."sinhLuc" <= cua.den - make_interval(days => $5)
		AND ($4::text[] IS NULL OR g."companyId" = ANY($4))`;

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
		const c = (await client.query(SQL_CHUYEN, [tu, den, MUI_GIO, trong]))
			.rows[0];
		const x = (
			await client.query(SQL_XU_LY, [tu, den, MUI_GIO, trong, KIP_NGAY])
		).rows[0];
		await client.query("ROLLBACK");
		const lanChuyen = c?.lan_chuyen ?? 0;
		const thieu = c?.thieu ?? 0;
		const phan = x?.phan ?? 0;
		const kip = x?.kip ?? 0;
		const tiLe = phan === 0 ? null : Number((kip / phan).toFixed(CHU_SO_TI_LE));
		const ket = {
			luc: new Date().toISOString(),
			cuaSo: { tu, den, muiGio: MUI_GIO },
			nguong: { tiLe: NGUONG, kipNgay: KIP_NGAY },
			chiDoc,
			lanChuyen,
			dealThangThieuGoiY: thieu,
			goiYPhan: phan,
			xuLyKip: kip,
			tiLe,
			luuY: "mau so lan chuyen doc tu STAGE_CHANGE va giai doan dau cua deal, khong doc bang goi y",
		};
		console.log(JSON.stringify(ket, null, 2));
		if (lanChuyen === 0) {
			console.error(
				"do-nguong: khong co lan chuyen sang thang nao trong cua so",
			);
			process.exitCode = MA_KHONG_DO;
		} else if (thieu > 0) {
			process.exitCode = MA_DUOI_NGUONG;
		} else if (tiLe === null) {
			console.error("do-nguong: chua goi y nao du 3 ngay de phan");
			process.exitCode = MA_KHONG_DO;
		} else {
			process.exitCode = tiLe < NGUONG ? MA_DUOI_NGUONG : 0;
		}
	} finally {
		await client.end();
	}
}

main().catch((loi) => khongDo(loi.message));
