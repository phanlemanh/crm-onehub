import { DEFAULT_WORKSPACE_NAME, WORKSPACE_ID } from "@crm/auth";
import { db } from "@crm/db";
import { donChoXoa } from "@crm/db/blob-cho-xoa";
import type { KhoTepTruong } from "@crm/db/blob-tep-truong";
import {
	type KhoTepTruongGia,
	khoTepTruongGia,
} from "@crm/db/test/blob-tep-truong-gia";
import { workspaceSlug } from "@crm/db/workspace";
import type { INestApplicationContext } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { HOP_DONG_MAU } from "../scripts/hop-dong-mau/cau-hinh";
import { chayLenh, type PhuThuoc } from "../scripts/hop-dong-mau/lenh";
import { KHOA_TRUONG_HOP_DONG } from "../scripts/hop-dong-mau/nap";

export const HDM_SAN = { hookMs: 2 * 60_000, baiMs: 3 * 60_000 } as const;

export type KhoGiaHttp = KhoTepTruongGia & {
	soPut: () => number;
	loiPutThu: number | null;
	dong: () => void;
};

export function khoGiaHttp(): KhoGiaHttp {
	const goc = khoTepTruongGia();
	let soPut = 0;
	const may = Bun.serve({
		hostname: "127.0.0.1",
		port: 0,
		async fetch(req) {
			const u = new URL(req.url);
			if (req.method !== "PUT" || !u.pathname.startsWith("/put/")) {
				return new Response("", { status: 400 });
			}
			soPut += 1;
			if (kho.loiPutThu === soPut) return new Response("", { status: 503 });
			const pathname = decodeURIComponent(u.pathname.slice("/put/".length));
			goc.put(pathname, new Uint8Array(await req.arrayBuffer()));
			return new Response("", { status: 200 });
		},
	});
	const kho: KhoGiaHttp = Object.assign(goc, {
		soPut: () => soPut,
		loiPutThu: null as number | null,
		dong: () => {
			may.stop(true);
		},
		async kyPut(pathname: string, opts: { mime: string; toiDa: number }) {
			goc.daKyPut.push({ pathname, ...opts });
			const hetHan = Date.now() + 600_000;
			return {
				url: `http://127.0.0.1:${may.port}/put/${encodeURIComponent(pathname)}`,
				hetHan,
			};
		},
	});
	return kho;
}

export async function dungUngDung(
	kho?: KhoTepTruong,
): Promise<INestApplicationContext> {
	const { AppModule } = await import("../src/app.module");
	const { KHO_TEP } = await import("../src/fields/kho-tep");
	const dung = Test.createTestingModule({ imports: [AppModule] });
	const modul = await (kho
		? dung.overrideProvider(KHO_TEP).useValue(kho)
		: dung
	).compile();
	await modul.init();
	return modul;
}

export async function dungWorkspace(): Promise<void> {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		update: {},
		create: {
			id: WORKSPACE_ID,
			name: DEFAULT_WORKSPACE_NAME,
			slug: workspaceSlug(DEFAULT_WORKSPACE_NAME),
			createdAt: new Date(),
		},
	});
}

export async function laKhoThu(): Promise<void> {
	const rows = await db.$queryRaw<
		{ ten: string }[]
	>`SELECT current_database() AS ten`;
	const ten = rows[0]?.ten ?? "";
	if (!ten.endsWith("_test")) {
		throw new Error(`hop-dong-mau spec chỉ chạy trên kho _test, đang ở ${ten}`);
	}
}

export async function idMau(): Promise<{
	congTy: string[];
	thoaThuan: string[];
	truong: string[];
}> {
	const congTy = await db.company.findMany({
		where: { name: HOP_DONG_MAU.congTy },
		select: { id: true },
	});
	const thoaThuan = await db.deal.findMany({
		where: { companyId: { in: congTy.map((c) => c.id) } },
		select: { id: true },
	});
	const truong = await db.fieldDefinition.findMany({
		where: { entity: "DEAL", key: KHOA_TRUONG_HOP_DONG },
		select: { id: true },
	});
	return {
		congTy: congTy.map((c) => c.id),
		thoaThuan: thoaThuan.map((d) => d.id),
		truong: truong.map((f) => f.id),
	};
}

export async function donMau(): Promise<void> {
	const ids = await idMau();
	await db.agentTask.deleteMany({
		where: {
			OR: [
				{ dealId: { in: ids.thoaThuan } },
				{ companyId: { in: ids.congTy } },
			],
		},
	});
	await db.fieldFile.deleteMany({ where: { fieldId: { in: ids.truong } } });
	await db.blobChoXoa.deleteMany({ where: { fieldId: { in: ids.truong } } });
	await db.deal.deleteMany({ where: { id: { in: ids.thoaThuan } } });
	await db.company.deleteMany({ where: { id: { in: ids.congTy } } });
	await db.fieldDefinition.deleteMany({ where: { id: { in: ids.truong } } });
	await db.member.deleteMany({ where: { userId: HOP_DONG_MAU.nguoi.id } });
	await db.user.deleteMany({ where: { id: HOP_DONG_MAU.nguoi.id } });
}

export async function demMau(): Promise<{
	congTy: number;
	thoaThuan: number;
	truong: number;
	tep: number;
	nguoi: number;
	thanhVien: number;
}> {
	const ids = await idMau();
	return {
		congTy: ids.congTy.length,
		thoaThuan: ids.thoaThuan.length,
		truong: ids.truong.length,
		tep: await db.fieldFile.count({ where: { dealId: { in: ids.thoaThuan } } }),
		nguoi: await db.user.count({ where: { id: HOP_DONG_MAU.nguoi.id } }),
		thanhVien: await db.member.count({
			where: { userId: HOP_DONG_MAU.nguoi.id },
		}),
	};
}

export async function chay(
	kho: KhoTepTruong | undefined,
	phu: Pick<PhuThuoc, "db"> & {
		suaUngDung?: (app: INestApplicationContext) => void;
		app?: INestApplicationContext;
	} = {},
): Promise<{ ma: number; dong: string[]; loi: string[] }> {
	const app = phu.app ?? (await dungUngDung(kho));
	phu.suaUngDung?.(app);
	const dong: string[] = [];
	const loi: string[] = [];
	const goc = console.error;
	console.error = (...a: unknown[]) => {
		loi.push(a.map(String).join(" "));
	};
	try {
		const ma = await chayLenh([], {
			db: phu.db,
			ungDung: async () => app,
			inRa: (d) => dong.push(d),
		});
		return { ma, dong, loi };
	} finally {
		console.error = goc;
		if (!phu.app) await app.close();
	}
}

export async function donHangCho(kho: KhoTepTruongGia): Promise<void> {
	await donChoXoa(db, kho, {
		bayGio: new Date(8.64e15),
		toiDa: 1000,
		pathnames: kho.daKyPut.map((k) => k.pathname),
	});
}
