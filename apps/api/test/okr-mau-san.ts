import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { z } from "zod";
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
		'TRUNCATE "okrCycle", "okrTrail", "okrCheckInSession", "okrDeXuat", "okrCuocSoan", "okrTomTat", "okrHoiY", "okrHoiYBanTruoc", "okrY", "okrYDongY", "okrChuDe", "okrHoiYHieu" CASCADE',
	);
}

export const napMau = (moc: Date) => napBoOkrMau(db, congTy(), { moc });

const BO_QUA = ["updatedAt", "suaLuc"];

const moHinhDuLieu = z.object({
	models: z.record(
		z.string(),
		z.object({
			dbName: z.string().nullable(),
			fields: z.array(
				z.object({ name: z.string(), kind: z.string(), type: z.string() }),
			),
		}),
	),
});

export type BangDem = { model: string; bang: string; khoa: string };

function rutBangDem(): BangDem[] {
	const r = moHinhDuLieu.safeParse(Reflect.get(db, "_runtimeDataModel"));
	if (!r.success)
		throw new Error(
			`client Prisma không mang mô hình dữ liệu lúc chạy: ${r.error.message}`,
		);
	return Object.entries(r.data.models).flatMap(([model, m]) => {
		const vo = m.fields.filter((f) => f.kind === "scalar");
		const khoa = vo.find((f) => f.name === "id") ?? vo[0];
		return khoa?.type === "String"
			? [{ model, bang: m.dbName ?? model, khoa: khoa.name }]
			: [];
	});
}

export const BANG_DEM: readonly BangDem[] = rutBangDem();

const theoChu = (ds: object[]): string[] =>
	ds.map((x) => JSON.stringify(x)).sort();

export async function vanTayHoiY(): Promise<Record<string, string[]>> {
	const hoiY = await db.okrHoiY.findMany({
		where: { cycleId: { startsWith: OKR_MAU.tienTo } },
		include: {
			banTruoc: true,
			hieu: true,
			chuDe: { include: { objective: { select: { title: true } } } },
			y: {
				include: {
					chuDe: { select: { ten: true, loai: true } },
					dongY: true,
				},
			},
		},
	});
	return {
		okrHoiY: theoChu(
			hoiY.map((h) => ({
				cycleId: h.cycleId,
				cauHoi: h.cauHoi,
				loiMo: h.loiMo,
				soLieu: h.soLieu,
				hanLuc: h.hanLuc,
				nguoiChonUserId: h.nguoiChonUserId,
				taoBoiUserId: h.taoBoiUserId,
				congBoLuc: h.congBoLuc,
				createdAt: h.createdAt,
			})),
		),
		okrHoiYBanTruoc: theoChu(
			hoiY.flatMap((h) =>
				h.banTruoc
					? [
							{
								cycleId: h.cycleId,
								cau: h.banTruoc.cau,
								boQua: h.banTruoc.boQua,
								vietBoiUserId: h.banTruoc.vietBoiUserId,
								niemPhongLuc: h.banTruoc.niemPhongLuc,
							},
						]
					: [],
			),
		),
		okrY: theoChu(
			hoiY.flatMap((h) =>
				h.y.map((y) => ({
					cycleId: h.cycleId,
					tacGiaUserId: y.tacGiaUserId,
					noiDung: y.noiDung,
					viSao: y.viSao,
					doBangGi: y.doBangGi,
					chuDe: y.chuDe,
					ganLuc: y.ganLuc,
					createdAt: y.createdAt,
				})),
			),
		),
		okrYDongY: theoChu(
			hoiY.flatMap((h) =>
				h.y.flatMap((y) =>
					y.dongY.map((d) => ({
						cycleId: h.cycleId,
						y: { tacGiaUserId: y.tacGiaUserId, noiDung: y.noiDung },
						userId: d.userId,
						createdAt: d.createdAt,
					})),
				),
			),
		),
		okrChuDe: theoChu(
			hoiY.flatMap((h) =>
				h.chuDe.map((c) => ({
					cycleId: h.cycleId,
					loai: c.loai,
					ten: c.ten,
					ketLuan: c.ketLuan,
					lyDo: c.lyDo,
					cauMucTieu: c.cauMucTieu,
					noiBanTruoc: c.noiBanTruoc,
					mucTieu: c.objective?.title ?? null,
					viTri: c.viTri,
					createdAt: c.createdAt,
				})),
			),
		),
		okrHoiYHieu: theoChu(
			hoiY.flatMap((h) =>
				h.hieu.map((x) => ({
					cycleId: h.cycleId,
					userId: x.userId,
					luc: x.luc,
				})),
			),
		),
	};
}

export async function vanTay(): Promise<Record<string, string[]>> {
	const cap = await Promise.all(
		BANG_DEM.map(async ({ bang, khoa }) => {
			const rows = await db.$queryRawUnsafe<{ dong: string }[]>(
				`SELECT (to_jsonb(t) - $2::text[])::text AS dong FROM "${bang}" t WHERE "${khoa}" LIKE $1 ORDER BY dong`,
				`${OKR_MAU.tienTo}%`,
				BO_QUA,
			);
			return [bang, rows.map((r) => r.dong)] as const;
		}),
	);
	return { ...Object.fromEntries(cap), ...(await vanTayHoiY()) };
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

export async function cotMangChu(): Promise<string[]> {
	const cot = await db.$queryRaw<{ bang: string; cot: string }[]>`
		SELECT table_name AS bang, column_name AS cot FROM information_schema.columns
		WHERE table_schema = 'public' AND udt_name = '_text'
		ORDER BY table_name, column_name`;
	return cot.map((c) => `${c.bang}.${c.cot}`);
}

export async function demThamChieuMang(
	ids: string[],
): Promise<{ dem: Record<string, number>; cot: string[] }> {
	const cot = await db.$queryRaw<{ bang: string; cot: string }[]>`
		SELECT table_name AS bang, column_name AS cot FROM information_schema.columns
		WHERE table_schema = 'public' AND data_type = 'ARRAY'
		AND udt_name IN ('_text', '_varchar')
		ORDER BY table_name, column_name`;
	const dem: Record<string, number> = {};
	for (const { bang, cot: c } of cot) {
		const rows = await db.$queryRawUnsafe<{ n: bigint }[]>(
			`SELECT count(*) AS n FROM "${bang}" WHERE "${c}"::text[] && $1::text[]`,
			ids,
		);
		const n = Number(rows[0]?.n ?? 0);
		if (n > 0) dem[`${bang}.${c}`] = n;
	}
	return { dem, cot: cot.map((x) => `${x.bang}.${x.cot}`) };
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
