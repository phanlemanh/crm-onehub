import { afterAll, beforeAll, expect } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { WorkspaceRole } from "@crm/auth";
import { db } from "@crm/db";
import type { KhoNguon } from "@crm/db/blob-nguon";
import { MINUTE_MS } from "@crm/db/okr-tro-ly-danh-muc";
import type { LoaiTrang } from "@crm/validation/tai-lieu";
import { diffHash, soSanh } from "@crm/validation/tai-lieu-diff";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { gieoThanhVien, mintPhien } from "./phien-thu";

export const TAI_LIEU_SAN = { hookMs: 2 * MINUTE_MS } as const;

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

export type DeXuatDoc = {
	id: string;
	slug: string;
	ten: string;
	trangThai: string;
	lyDo: string | null;
	banGoc: string;
	noiDung: string;
	diffHash: string;
	cu: boolean;
	duyetDuoc: boolean;
};

export async function hashCua(deXuatId: string, ai: Ai): Promise<string> {
	const p = ok<DeXuatDoc>(
		await hoi("taiLieu.proposal", { id: deXuatId }, ai),
		`proposal ${deXuatId} ${ai}`,
	);
	return diffHash(soSanh(p.banGoc, p.noiDung));
}

export async function duyet(deXuatId: string, ai: Ai): Promise<number> {
	return ok<{ so: number }>(
		await goi(
			"taiLieu.approve",
			{ id: deXuatId, diffHash: await hashCua(deXuatId, ai) },
			ai,
		),
		`duyet ${deXuatId} ${ai}`,
	).so;
}

export async function traLai(
	deXuatId: string,
	ai: Ai,
	lyDo = "Thiếu số liệu.",
): Promise<void> {
	ok(
		await goi("taiLieu.reject", { id: deXuatId, lyDo }, ai),
		`tra lai ${deXuatId} ${ai}`,
	);
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
	const cuaNguoiThu = { startsWith: TIEN_TO };
	await db.taiLieuBaoSai.deleteMany({
		where: {
			OR: [
				{ trangId },
				{ nguoiBaoId: cuaNguoiThu },
				{ hoi: { nguoiHoiId: cuaNguoiThu } },
			],
		},
	});
	const hoi = await db.taiLieuHoi.findMany({
		where: { nguoiHoiId: cuaNguoiThu },
		select: { id: true },
	});
	await db.agentTask.deleteMany({
		where: {
			kind: "hoi-kho",
			OR: hoi.map((h) => ({ payload: { path: ["hoiId"], equals: h.id } })),
		},
	});
	await db.taiLieuHoi.deleteMany({ where: { nguoiHoiId: cuaNguoiThu } });
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
	await db.taiLieuNguon.deleteMany({ where: { trangId } });
	await db.taiLieuTrang.deleteMany({ where: { id: trangId } });
}

export function dungSan(thayKho?: KhoNguon): void {
	beforeAll(async () => {
		const { AppModule } = await import("../src/app.module");
		const { KHO_NGUON } = await import("../src/tai-lieu/kho-nguon");
		const dung = Test.createTestingModule({ imports: [AppModule] });
		const modul: TestingModule = await (thayKho
			? dung.overrideProvider(KHO_NGUON).useValue(thayKho)
			: dung
		).compile();
		app = modul.createNestApplication({ bodyParser: false });
		await app.init();
		for (const ai of AI) {
			const id = ma(ai);
			await gieoThanhVien(id, VAI[ai]);
			phien[ai] = { nguoi: id, cookie: (await mintPhien(id)).cookie };
		}
	}, TAI_LIEU_SAN.hookMs);

	afterAll(async () => {
		await app.close();
		await donTaiLieu({});
		await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
		await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
		await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	});
}
