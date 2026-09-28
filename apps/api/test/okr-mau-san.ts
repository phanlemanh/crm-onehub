import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { OKR_MAU } from "../scripts/okr-mau/cau-hinh";
import { type BoOkrMau, docBoOkrMau } from "../scripts/okr-mau/khuon";
import { TEP_CONG_TY } from "../scripts/okr-mau/lenh";
import { idMau, napBoOkrMau } from "../scripts/okr-mau/nap";

export const GOC_API = join(import.meta.dir, "..");

export const congTyChu = (): string => readFileSync(TEP_CONG_TY, "utf8");

export const congTy = (): BoOkrMau => docBoOkrMau(congTyChu());

export const nguoiMau = (ma: string) => idMau("nguoi", ma);

export async function laKhoThu(): Promise<void> {
	const rows = await db.$queryRaw<
		{ ten: string }[]
	>`SELECT current_database() AS ten`;
	const ten = rows[0]?.ten ?? "";
	if (!ten.endsWith("_test"))
		throw new Error(`okr-mau spec chỉ chạy trên kho _test, đang ở ${ten}`);
}

export async function lamSachOkr(): Promise<void> {
	await laKhoThu();
	await db.$executeRawUnsafe(
		'TRUNCATE "okrCycle", "okrTrail", "okrCheckInSession", "okrDeXuat", "okrTomTat" CASCADE',
	);
}

export const napMau = (moc: Date) => napBoOkrMau(db, congTy(), { moc });

const BO_QUA = new Set(["updatedAt", "suaLuc"]);

const chuan = <T>(ds: T[]) =>
	ds.map((dong) =>
		JSON.stringify(dong, (khoa, giaTri) =>
			BO_QUA.has(khoa) ? undefined : giaTri,
		),
	);

export async function vanTay(): Promise<Record<string, string[]>> {
	const tien = { startsWith: OKR_MAU.tienTo };
	const sap = { id: "asc" } as const;
	return {
		user: chuan(await db.user.findMany({ where: { id: tien }, orderBy: sap })),
		member: chuan(
			await db.member.findMany({ where: { id: tien }, orderBy: sap }),
		),
		division: chuan(
			await db.division.findMany({ where: { id: tien }, orderBy: sap }),
		),
		department: chuan(
			await db.department.findMany({
				where: { id: tien },
				orderBy: sap,
			}),
		),
		orgPlacement: chuan(
			await db.orgPlacement.findMany({
				where: { userId: tien },
				orderBy: { userId: "asc" },
			}),
		),
		okrCycle: chuan(
			await db.okrCycle.findMany({ where: { id: tien }, orderBy: sap }),
		),
		okrObjective: chuan(
			await db.okrObjective.findMany({
				where: { id: tien },
				orderBy: sap,
			}),
		),
		okrKeyResult: chuan(
			await db.okrKeyResult.findMany({
				where: { id: tien },
				orderBy: sap,
			}),
		),
		okrAlignment: chuan(
			await db.okrAlignment.findMany({
				where: { id: tien },
				orderBy: sap,
			}),
		),
		okrNguonKr: chuan(
			await db.okrNguonKr.findMany({
				where: { id: tien },
				orderBy: sap,
			}),
		),
		okrSoChup: chuan(
			await db.okrSoChup.findMany({
				where: { id: tien },
				orderBy: sap,
			}),
		),
		okrCheckInSession: chuan(
			await db.okrCheckInSession.findMany({
				where: { id: tien },
				orderBy: sap,
			}),
		),
		okrCheckIn: chuan(
			await db.okrCheckIn.findMany({
				where: { id: tien },
				orderBy: sap,
			}),
		),
		okrDiemKr: chuan(
			await db.okrDiemKr.findMany({
				where: { id: tien },
				orderBy: sap,
			}),
		),
		okrNhinLai: chuan(
			await db.okrNhinLai.findMany({
				where: { id: tien },
				orderBy: sap,
			}),
		),
		okrMangSang: chuan(
			await db.okrMangSang.findMany({
				where: { id: tien },
				orderBy: sap,
			}),
		),
	};
}

export async function vanTayKho(): Promise<Record<string, string>> {
	const bang = await db.$queryRaw<{ ten: string }[]>`
		SELECT table_name AS ten FROM information_schema.tables
		WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name <> '_prisma_migrations'
		ORDER BY table_name`;
	const ra: Record<string, string> = {};
	for (const { ten } of bang) {
		const rows = await db.$queryRawUnsafe<{ n: string }[]>(
			`SELECT md5(coalesce(string_agg(t::text, '|' ORDER BY t::text), '')) AS n FROM "${ten}" t`,
		);
		ra[ten] = rows[0]?.n ?? "";
	}
	return ra;
}

export async function demThamChieu(
	ids: string[],
): Promise<Record<string, number>> {
	const cot = await db.$queryRaw<{ bang: string; cot: string }[]>`
		SELECT table_name AS bang, column_name AS cot FROM information_schema.columns
		WHERE table_schema = 'public' AND data_type IN ('text', 'character varying')
		AND (column_name = 'id' OR column_name LIKE '%Id')
		ORDER BY table_name, column_name`;
	const ra: Record<string, number> = {};
	for (const { bang, cot: c } of cot) {
		const rows = await db.$queryRawUnsafe<{ n: bigint }[]>(
			`SELECT count(*) AS n FROM "${bang}" WHERE "${c}" = ANY($1::text[])`,
			ids,
		);
		const n = Number(rows[0]?.n ?? 0);
		if (n > 0) ra[`${bang}.${c}`] = n;
	}
	return ra;
}

export async function tapIdMau(): Promise<string[]> {
	const tien = { startsWith: OKR_MAU.tienTo };
	const chon = { select: { id: true } } as const;
	const ds = await Promise.all([
		db.user.findMany({ where: { id: tien }, ...chon }),
		db.division.findMany({ where: { id: tien }, ...chon }),
		db.department.findMany({ where: { id: tien }, ...chon }),
		db.okrCycle.findMany({ where: { id: tien }, ...chon }),
		db.okrObjective.findMany({ where: { id: tien }, ...chon }),
		db.okrKeyResult.findMany({ where: { id: tien }, ...chon }),
	]);
	return ds.flat().map((x) => x.id);
}

export function chayLenh(
	args: string[],
	env: Record<string, string | undefined> = {},
) {
	const r = spawnSync("bun", ["scripts/okr-mau.ts", ...args], {
		cwd: GOC_API,
		env: { ...process.env, ...env },
		encoding: "utf8",
		timeout: 60_000,
	});
	return { ma: r.status, ra: r.stdout, loi: r.stderr };
}
