#!/usr/bin/env node
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const pg = createRequire(join(GOC, "packages", "db", "package.json"))("pg");

const VAI_CHI_OKR = "okr";
const WORKSPACE_ID = "workspace";
const LOAI_KE_HOACH = [
	"buoc-qua-han",
	"buoc-sap-han",
	"ke-hoach-im",
	"moc-ngay",
];
const LOAI_VIEC_NHAC = "nhac-ke-hoach";

const SQL = {
	vai: `SELECT m."userId" FROM "member" m WHERE m."organizationId" = $1 AND m.role = $2 AND ($3::text[] IS NULL OR m."userId" = ANY($3))`,
	buoc: `SELECT s."assigneeId" AS nguoi, count(*)::int AS so
		FROM "onboardingStep" s
		JOIN "onboardingPlan" p ON p.id = s."planId"
		JOIN "member" m ON m."userId" = s."assigneeId" AND m."organizationId" = $1
		WHERE m.role = $2 AND s."completedAt" IS NULL AND p."closedAt" IS NULL AND ($3::text[] IS NULL OR m."userId" = ANY($3))
		GROUP BY s."assigneeId"`,
	keHoach: `SELECT p."ownerId" AS nguoi, count(*)::int AS so
		FROM "onboardingPlan" p
		JOIN "member" m ON m."userId" = p."ownerId" AND m."organizationId" = $1
		WHERE m.role = $2 AND p."closedAt" IS NULL AND ($3::text[] IS NULL OR m."userId" = ANY($3))
		GROUP BY p."ownerId"`,
	theoDoi: `SELECT w."userId" AS nguoi, count(*)::int AS so
		FROM "onboardingWatch" w
		JOIN "onboardingPlan" p ON p.id = w."planId"
		JOIN "member" m ON m."userId" = w."userId" AND m."organizationId" = $1
		WHERE m.role = $2 AND p."closedAt" IS NULL AND ($3::text[] IS NULL OR m."userId" = ANY($3))
		GROUP BY w."userId"`,
	nhac: `SELECT split_part(t.subject, ':', 2) AS nguoi,
			split_part(t.subject, ':', 3) AS ngay,
			coalesce(t.payload->>'kenh', '?') AS kenh,
			(SELECT count(*)::int FROM jsonb_array_elements(t.payload->'daGui') e
				WHERE e->>'loai' = ANY($3)) AS dong
		FROM "agentTask" t
		JOIN "member" m ON m."userId" = split_part(t.subject, ':', 2) AND m."organizationId" = $1
		WHERE t.kind = $4 AND m.role = $2 AND t.outcome LIKE 'da-gui:%'
			AND jsonb_typeof(t.payload->'daGui') = 'array' AND ($5::text[] IS NULL OR m."userId" = ANY($5))`,
};

function theoNguoi(hang) {
	return {
		tong: hang.reduce((s, h) => s + h.so, 0),
		nguoi: hang.length,
		theoNguoi: Object.fromEntries(hang.map((h) => [h.nguoi, h.so])),
	};
}

function gomNhac(hang) {
	const lo = hang.filter((h) => h.dong > 0);
	const ngay = lo.map((h) => h.ngay).sort();
	const kenh = {};
	for (const h of lo) kenh[h.kenh] = (kenh[h.kenh] ?? 0) + 1;
	return {
		tin: lo.length,
		dong: lo.reduce((s, h) => s + h.dong, 0),
		nguoi: new Set(lo.map((h) => h.nguoi)).size,
		kenh,
		tuNgay: ngay[0] ?? null,
		denNgay: ngay.at(-1) ?? null,
		theoNguoi: Object.fromEntries(
			[...new Set(lo.map((h) => h.nguoi))].map((n) => [
				n,
				lo.filter((h) => h.nguoi === n).length,
			]),
		),
	};
}

function docTrong(argv) {
	const i = argv.indexOf("--trong");
	if (i === -1) return null;
	const giaTri = argv[i + 1];
	if (!giaTri) {
		console.error(
			"ro-vai-chi-okr: --trong can danh sach ma nguoi, cach nhau dau phay",
		);
		process.exit(2);
	}
	return giaTri.split(",").filter((ma) => ma !== "");
}

async function main() {
	const trong = docTrong(process.argv.slice(2));
	const url = process.env.DATABASE_URL;
	if (!url) {
		console.error("ro-vai-chi-okr: thieu DATABASE_URL trong moi truong");
		process.exit(2);
	}
	const client = new pg.Client({
		connectionString: url,
		options: "-c default_transaction_read_only=on",
	});
	await client.connect();
	try {
		await client.query("BEGIN READ ONLY");
		const thamSo = [WORKSPACE_ID, VAI_CHI_OKR, trong];
		const vai = await client.query(SQL.vai, thamSo);
		const buoc = await client.query(SQL.buoc, thamSo);
		const keHoach = await client.query(SQL.keHoach, thamSo);
		const theoDoi = await client.query(SQL.theoDoi, thamSo);
		const nhac = await client.query(SQL.nhac, [
			WORKSPACE_ID,
			VAI_CHI_OKR,
			LOAI_KE_HOACH,
			LOAI_VIEC_NHAC,
			trong,
		]);
		await client.query("ROLLBACK");
		const ket = {
			luc: new Date().toISOString(),
			nguoiVaiChiOkr: vai.rowCount,
			buocMo: theoNguoi(buoc.rows),
			keHoachMo: theoNguoi(keHoach.rows),
			theoDoiMo: theoNguoi(theoDoi.rows),
			nhacDaMangKeHoach: gomNhac(nhac.rows),
			luuY: "vai doc o thoi diem chay; tin nhac gui truoc khi doi vai van tinh vao nhacDaMangKeHoach",
		};
		console.log(JSON.stringify(ket, null, 2));
		const mo = ket.buocMo.tong + ket.keHoachMo.tong + ket.theoDoiMo.tong;
		process.exit(mo === 0 ? 0 : 1);
	} finally {
		await client.end();
	}
}

main().catch((loi) => {
	console.error(`ro-vai-chi-okr: ${loi.message}`);
	process.exit(2);
});
