import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import type { WorkspaceRole } from "@crm/auth";
import { db } from "@crm/db";
import type { ViecNhac } from "@crm/db/onboarding-nhac";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { ghiThongBao } from "../../agent/agent/lib/thong-bao-ghi";
import { createApp } from "../src/create-app";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `htb${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
const NGUOI = ["a", "b", "okr"] as const;
type Nguoi = (typeof NGUOI)[number];
const VAI = {
	a: "member",
	b: "member",
	okr: "okr",
} satisfies Record<Nguoi, WorkspaceRole>;

let app: NestExpressApplication;
const cookie = {} as Record<Nguoi, string>;
const uid = (n: Nguoi) => `${TIEN_TO}-${n}`;
type Tra = { status: number; data: unknown };

async function trpc(
	n: Nguoi | null,
	thuTuc: string,
	kieu: "query" | "mutation",
	vao?: Readonly<Record<string, unknown>>,
): Promise<Tra> {
	const goi =
		kieu === "query"
			? request(app.getHttpServer()).get(
					`/api/trpc/${thuTuc}${vao === undefined ? "" : `?input=${encodeURIComponent(JSON.stringify(vao))}`}`,
				)
			: request(app.getHttpServer())
					.post(`/api/trpc/${thuTuc}`)
					.set("content-type", "application/json")
					.send(JSON.stringify(vao ?? {}));
	const r = n === null ? await goi : await goi.set("cookie", cookie[n]);
	return { status: r.status, data: r.body?.result?.data };
}

function viec(i: number): ViecNhac {
	return {
		loai: "viec-qua-han",
		viecId: `${TIEN_TO}-v${i}`,
		tieuDe: `Viec ${i}`,
		soNgay: 1,
		banGhi: null,
	};
}

async function gieo(n: Nguoi, so: number, now: Date): Promise<string[]> {
	await ghiThongBao(
		db,
		uid(n),
		Array.from({ length: so }, (_, i) => viec(i)),
		(v) => (v.loai === "viec-qua-han" ? `/viec?record=viec:${v.viecId}` : "/"),
		now,
	);
	const hang = await db.thongBao.findMany({
		where: { nguoiNhanId: uid(n) },
		orderBy: { khoa: "asc" },
		select: { id: true },
	});
	return hang.map((h) => h.id);
}

async function don() {
	await db.thongBao.deleteMany({
		where: { nguoiNhanId: { startsWith: TIEN_TO } },
	});
}

beforeAll(async () => {
	app = await createApp();
	for (const n of NGUOI) {
		await gieoThanhVien(uid(n), VAI[n]);
		cookie[n] = (await mintPhien(uid(n))).cookie;
	}
	await don();
}, 120_000);

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await don();
	await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await app.close();
});

const SANG = new Date("2026-10-14T01:30:00.000Z");

describe("htb-mo", () => {
	test("htb-mo: bam mo dat docLuc va moLuc, giu lan bam dau", async () => {
		await don();
		const [t1, t2, t3] = await gieo("a", 3, SANG);
		const luc = new Date("2026-10-14T02:00:00.000Z");
		setSystemTime(luc);
		expect(
			(await trpc("a", "thongBao.moMot", "mutation", { id: t2 })).status,
		).toBe(200);
		const hang = await db.thongBao.findUniqueOrThrow({
			where: { id: t2 as string },
		});
		expect(hang.moLuc?.toISOString(), "bam mo khong ghi luc mo").toBe(
			luc.toISOString(),
		);
		expect(hang.docLuc?.toISOString()).toBe(luc.toISOString());
		for (const id of [t1, t3])
			expect(
				(await db.thongBao.findUniqueOrThrow({ where: { id: id as string } }))
					.docLuc,
			).toBeNull();
		const chuong = await trpc("a", "thongBao.chuong", "query");
		expect((chuong.data as { soChuaDoc: number }).soChuaDoc).toBe(2);
		setSystemTime(new Date("2026-10-14T03:00:00.000Z"));
		await trpc("a", "thongBao.moMot", "mutation", { id: t2 });
		expect(
			(
				await db.thongBao.findUniqueOrThrow({ where: { id: t2 as string } })
			).moLuc?.toISOString(),
		).toBe(luc.toISOString());
	});
});

describe("htb-doc-het", () => {
	test("htb-doc-het: chi doi thong bao chua doc cua chinh minh, khong ghi luc mo", async () => {
		await don();
		const cuaA = await gieo("a", 5, SANG);
		await db.thongBao.update({
			where: { id: cuaA[0] as string },
			data: { docLuc: SANG },
		});
		await gieo("b", 2, SANG);
		const bTruoc = await db.thongBao.findMany({
			where: { nguoiNhanId: uid("b") },
			orderBy: { id: "asc" },
		});
		setSystemTime(new Date("2026-10-14T04:00:00.000Z"));
		const tra = await trpc("a", "thongBao.docHet", "mutation");
		expect(tra.status).toBe(200);
		expect(
			await db.thongBao.findMany({
				where: { nguoiNhanId: uid("b") },
				orderBy: { id: "asc" },
			}),
			"danh dau het doi thong bao nguoi khac",
		).toEqual(bTruoc);
		expect((tra.data as { soDaDoc: number }).soDaDoc).toBe(4);
		const aSau = await db.thongBao.findMany({
			where: { nguoiNhanId: uid("a") },
		});
		for (const h of aSau) {
			expect(h.docLuc).not.toBeNull();
			expect(h.moLuc, "danh dau het ghi luc mo").toBeNull();
		}
		const chuong = await trpc("a", "thongBao.chuong", "query");
		expect((chuong.data as { soChuaDoc: number }).soChuaDoc).toBe(0);
		const lanHai = await trpc("a", "thongBao.docHet", "mutation");
		expect((lanHai.data as { soDaDoc: number }).soDaDoc).toBe(0);
	});
});

describe("htb-cua-minh", () => {
	test("htb-cua-minh: moi nguoi chi doc va doi thong bao cua minh", async () => {
		await don();
		const cuaA = await gieo("a", 3, SANG);
		const cuaB = await gieo("b", 3, SANG);
		for (const [n, cua] of [
			["a", cuaA],
			["b", cuaB],
		] as const) {
			const chuong = (await trpc(n, "thongBao.chuong", "query")).data as {
				dong: { id: string }[];
			};
			expect(
				chuong.dong.map((d) => d.id).sort(),
				"chuong lo thong bao nguoi khac",
			).toEqual([...cua].sort());
			const ds = (
				await trpc(n, "thongBao.danhSach", "query", { chiChuaDoc: false })
			).data as { dong: { id: string }[] };
			expect(
				ds.dong.map((d) => d.id).sort(),
				"danh sach lo thong bao nguoi khac",
			).toEqual([...cua].sort());
		}
		const bTruoc = await db.thongBao.findMany({
			where: { nguoiNhanId: uid("b") },
			orderBy: { id: "asc" },
		});
		expect(
			(await trpc("a", "thongBao.moMot", "mutation", { id: cuaB[0] })).status,
		).toBe(404);
		await trpc("a", "thongBao.docHet", "mutation");
		expect(
			await db.thongBao.findMany({
				where: { nguoiNhanId: uid("b") },
				orderBy: { id: "asc" },
			}),
		).toEqual(bTruoc);
		for (const [thuTuc, kieu, vao] of [
			["thongBao.chuong", "query", undefined],
			["thongBao.danhSach", "query", { chiChuaDoc: true }],
			["thongBao.moMot", "mutation", { id: "khong-co" }],
			["thongBao.docHet", "mutation", undefined],
		] as const) {
			expect(
				(await trpc(null, thuTuc, kieu, vao)).status,
				`${thuTuc} khong phien`,
			).toBe(401);
			expect(
				(await trpc("okr", thuTuc, kieu, vao)).status,
				"vai chi OKR khong mo duoc chuong",
			).not.toBe(403);
		}
	});

	test("htb-cua-minh: danh sach phan trang theo con tro", async () => {
		await don();
		await gieo("a", 35, SANG);
		const t1 = (
			await trpc("a", "thongBao.danhSach", "query", { chiChuaDoc: false })
		).data as { dong: unknown[]; conTroSau: string | null };
		expect(t1.dong.length).toBe(30);
		expect(t1.conTroSau).not.toBeNull();
		const t2 = (
			await trpc("a", "thongBao.danhSach", "query", {
				chiChuaDoc: false,
				conTro: t1.conTroSau,
			})
		).data as { dong: unknown[]; conTroSau: string | null };
		expect(t2.dong.length).toBe(5);
		expect(t2.conTroSau).toBeNull();
	});
});
