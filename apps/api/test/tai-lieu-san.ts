import { afterAll, beforeAll, expect } from "bun:test";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { WorkspaceRole } from "@crm/auth";
import { db } from "@crm/db";
import type { LoaiTrang } from "@crm/validation/tai-lieu";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { gieoThanhVien, mintPhien } from "./phien-thu";

export const TIEN_TO = `ktl${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
let dem = 0;
export function ma(phan: string): string {
	dem += 1;
	return `${TIEN_TO}-${phan}-${Date.now().toString(36)}-${dem}`;
}

export type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };

export type TraLoi = { status: number; data: Json; loi: string };
export const AI = ["tao", "chu", "owner", "admin", "khac", "okr"] as const;
export type Ai = (typeof AI)[number];
const VAI = {
	tao: "member",
	chu: "member",
	owner: "owner",
	admin: "admin",
	khac: "member",
	okr: "okr",
} satisfies Record<Ai, WorkspaceRole>;
type Phien = { nguoi: string; cookie: string };

let app: INestApplication;
export const ungDung = () => app;
export const phien = Object.fromEntries(
	AI.map((a) => [a, { nguoi: "", cookie: "" }]),
) as Record<Ai, Phien>;

export const THU_MUC_MAU = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"packages",
	"ui",
	"test",
	"fixtures",
	"tai-lieu",
);
export const MAU = readdirSync(THU_MUC_MAU)
	.filter((f) => f.endsWith(".md") && !f.startsWith("clipboard-"))
	.map((f) => f.slice(0, -3))
	.sort();
export const docMau = (mau: string) =>
	readFileSync(join(THU_MUC_MAU, `${mau}.md`), "utf8");

function traLoi(res: request.Response): TraLoi {
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

export async function goiBang(
	cookie: string,
	thuTuc: string,
	vao: Json,
): Promise<TraLoi> {
	return traLoi(
		await request(app.getHttpServer())
			.post(`/api/trpc/${thuTuc}`)
			.set("cookie", cookie)
			.set("content-type", "application/json")
			.send(JSON.stringify(vao)),
	);
}

export const goi = (thuTuc: string, vao: Json, ai: Ai) =>
	goiBang(phien[ai].cookie, thuTuc, vao);

export async function hoiBang(
	cookie: string,
	thuTuc: string,
	vao: Json | undefined,
): Promise<TraLoi> {
	const q =
		vao === undefined
			? ""
			: `?input=${encodeURIComponent(JSON.stringify(vao))}`;
	return traLoi(
		await request(app.getHttpServer())
			.get(`/api/trpc/${thuTuc}${q}`)
			.set("cookie", cookie),
	);
}

export const hoi = (thuTuc: string, vao: Json | undefined, ai: Ai) =>
	hoiBang(phien[ai].cookie, thuTuc, vao);

export function ok<T>(tra: TraLoi, nhan: string): T {
	expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(`${nhan}: HTTP 200 `);
	return tra.data as T;
}

export async function taoTrang(
	ten: string,
	noiDung: string,
	ai: Ai = "tao",
	chuTrang: Ai = "chu",
	loai: LoaiTrang = "quy-dinh",
): Promise<{ slug: string; trangId: string; deXuatId: string }> {
	const { slug } = ok<{ slug: string }>(
		await goi(
			"taiLieu.create",
			{
				ten,
				loai,
				chuTrangId: phien[chuTrang].nguoi,
				noiDung,
			},
			ai,
		),
		`tao ${ten}`,
	);
	const trang = await db.taiLieuTrang.findUniqueOrThrow({
		where: { slug },
		select: { id: true, deXuat: { select: { id: true } } },
	});
	return {
		slug,
		trangId: trang.id,
		deXuatId: trang.deXuat[0]?.id ?? "",
	};
}

export async function deXuat(
	slug: string,
	noiDung: string,
	ai: Ai = "tao",
): Promise<string> {
	return ok<{ deXuatId: string }>(
		await goi("taiLieu.propose", { slug, noiDung }, ai),
		`de xuat ${slug}`,
	).deXuatId;
}

export async function duyetQuaDb(deXuatId: string, ai: Ai): Promise<number> {
	return db.$transaction(async (tx) => {
		const dx = await tx.taiLieuDeXuat.findUniqueOrThrow({
			where: { id: deXuatId },
		});
		const lon = await tx.taiLieuPhienBan.aggregate({
			where: { trangId: dx.trangId },
			_max: { so: true },
		});
		const so = (lon._max.so ?? 0) + 1;
		const ban = await tx.taiLieuPhienBan.create({
			data: {
				trangId: dx.trangId,
				so,
				ten: dx.ten,
				noiDung: dx.noiDung,
				noiDungHash: createHash("sha256").update(dx.noiDung).digest("hex"),
				deXuatId,
				duyetBoiId: phien[ai].nguoi,
				duyetLuc: new Date(),
			},
		});
		await tx.taiLieuTrang.update({
			where: { id: dx.trangId },
			data: { banDangDungId: ban.id, ten: dx.ten },
		});
		await tx.taiLieuDeXuat.update({
			where: { id: deXuatId },
			data: {
				trangThai: "DA_DUYET",
				xuLyBoiId: phien[ai].nguoi,
				xuLyLuc: new Date(),
			},
		});
		return so;
	});
}

export async function traLaiQuaDb(deXuatId: string, ai: Ai): Promise<void> {
	await db.taiLieuDeXuat.update({
		where: { id: deXuatId },
		data: {
			trangThai: "TRA_LAI",
			lyDo: "thieu so lieu",
			xuLyBoiId: phien[ai].nguoi,
			xuLyLuc: new Date(),
		},
	});
}

export async function demTaiLieu() {
	const [trang, deXuat, phienBan, suKien, lienKet] = await Promise.all([
		db.taiLieuTrang.count(),
		db.taiLieuDeXuat.count(),
		db.taiLieuPhienBan.count(),
		db.taiLieuSuKien.count(),
		db.taiLieuLienKet.count(),
	]);
	return { trang, deXuat, phienBan, suKien, lienKet };
}

export async function donTaiLieu(where: {
	slug?: { in: string[] };
}): Promise<void> {
	const trang = await db.taiLieuTrang.findMany({
		where: {
			OR: [
				{ taoBoiId: { startsWith: TIEN_TO } },
				{ chuTrangId: { startsWith: TIEN_TO } },
				...(where.slug ? [{ slug: where.slug }] : []),
			],
		},
		select: { id: true },
	});
	const trangId = { in: trang.map((t) => t.id) };
	await db.taiLieuLienKet.deleteMany({ where: { tuTrangId: trangId } });
	await db.taiLieuSuKien.deleteMany({ where: { trangId } });
	await db.taiLieuTrang.updateMany({
		where: { id: trangId },
		data: { banDangDungId: null },
	});
	await db.taiLieuDeXuat.updateMany({
		where: { trangId },
		data: { banGocId: null },
	});
	await db.taiLieuPhienBan.deleteMany({ where: { trangId } });
	await db.taiLieuDeXuat.deleteMany({ where: { trangId } });
	await db.taiLieuTrang.deleteMany({ where: { id: trangId } });
}

export function dungSan(): void {
	beforeAll(async () => {
		const { AppModule } = await import("../src/app.module");
		const modul: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = modul.createNestApplication({ bodyParser: false });
		await app.init();
		for (const ai of AI) {
			const id = ma(ai);
			await gieoThanhVien(id, VAI[ai]);
			phien[ai] = { nguoi: id, cookie: (await mintPhien(id)).cookie };
		}
	});

	afterAll(async () => {
		await app.close();
		await donTaiLieu({});
		await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
		await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
		await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	});
}
