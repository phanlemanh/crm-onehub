import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { WorkspaceRole } from "@crm/auth";
import { API_KEY_HEADER, auth, KHOA_KEO_TIN_HIEU } from "@crm/auth";
import { db } from "@crm/db";
import {
	docPhanHoiKeoVe,
	docPhanHoiKeoVeDayDu,
	vietTep,
} from "@crm/validation/tin-hieu";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { z } from "zod";
import { createApp } from "../src/create-app";
import { ContextLogger } from "../src/logging/context-logger";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `tvk${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
const NGUOI = ["owner", "admin", "member", "okr", "doi", "roi"] as const;
type Nguoi = (typeof NGUOI)[number];
const VAI = {
	owner: "owner",
	admin: "admin",
	member: "member",
	okr: "okr",
	doi: "admin",
	roi: "admin",
} satisfies Record<Nguoi, WorkspaceRole>;
const LOAI = [undefined, "toan-quyen", "keo-tin-hieu"] as const;
const loiCoMa = z.object({ statusCode: z.number() });
const coDuongHttp = z.object({ path: z.string() });
const DUONG_LICH = `${REST_BRIDGE_PATH}/tin-hieu/lich/keo-ve`;
const CHO_MS = 120_000;

const bangDuong = z.object({
	duong: z.array(
		z.object({
			o: z.number(),
			ten: z.string(),
			goi: z.union([
				z.object({
					method: z.enum(["GET", "POST"]),
					path: z.string(),
					body: z.record(z.string(), z.string()).optional(),
				}),
				z.object({ ham: z.literal("getSession") }),
			]),
			plugin: z.string().optional(),
			cho: z.array(z.string()),
		}),
	),
	plugin_mien: z.array(z.object({ ten: z.string(), ly_do: z.string() })),
});
const BANG = bangDuong.parse(
	JSON.parse(
		readFileSync(
			join(
				import.meta.dir,
				"..",
				"..",
				"..",
				"_acceptance",
				"tin-hieu-tu-ve-kho",
				"rang",
				"bang-duong-doc-khoa.json",
			),
			"utf8",
		),
	),
);

let app: NestExpressApplication;
const cookie = {} as Record<Nguoi, string>;
const uid = (n: Nguoi) => `${TIEN_TO}-${n}`;

type Tra = { status: number; data: unknown; loi: string };

async function trpc(
	n: Nguoi,
	thuTuc: string,
	kieu: "query" | "mutation",
	vao?: Readonly<Record<string, string | number | null | undefined>>,
): Promise<Tra> {
	const r =
		kieu === "query"
			? await request(app.getHttpServer())
					.get(
						`/api/trpc/${thuTuc}${vao === undefined ? "" : `?input=${encodeURIComponent(JSON.stringify(vao))}`}`,
					)
					.set("cookie", cookie[n])
			: await request(app.getHttpServer())
					.post(`/api/trpc/${thuTuc}`)
					.set("cookie", cookie[n])
					.set("content-type", "application/json")
					.send(JSON.stringify(vao ?? {}));
	return {
		status: r.status,
		data: r.body?.result?.data,
		loi: String(r.body?.error?.message ?? ""),
	};
}

const khoaTao = z.object({ id: z.string(), key: z.string(), loai: z.string() });
const dongDs = z.object({
	rows: z.array(z.object({ id: z.string(), loai: z.string() })),
	taoDuocKeoTinHieu: z.boolean(),
});

async function tao(
	n: Nguoi,
	loai: (typeof LOAI)[number],
): Promise<{ status: number; khoa: z.infer<typeof khoaTao> | null }> {
	const ten = `tvk-${n}-${loai ?? "vang"}`;
	const vao =
		loai === undefined
			? { name: ten, expiresInDays: null }
			: { name: ten, expiresInDays: null, loai };
	const r = await trpc(n, "apiKeys.create", "mutation", vao);
	return {
		status: r.status,
		khoa: r.status === 200 ? khoaTao.parse(r.data) : null,
	};
}

async function khoaKeo(n: Nguoi): Promise<{ id: string; key: string }> {
	const { khoa } = await tao(n, "keo-tin-hieu");
	if (!khoa) throw new Error(`khong tao duoc khoa chi keo cho ${n}`);
	return khoa;
}

async function khoaThuong(n: Nguoi): Promise<{ id: string; key: string }> {
	const { khoa } = await tao(n, undefined);
	if (!khoa)
		throw new Error(
			`khoa thuong cu mat phien: khong tao duoc khoa thuong cho ${n}`,
		);
	return khoa;
}

function lich(key?: string) {
	const r = request(app.getHttpServer())
		.post(DUONG_LICH)
		.set("content-type", "application/json");
	return (key === undefined ? r : r.set(API_KEY_HEADER, key)).send("{}");
}

async function gui(n: Nguoi, chu: string): Promise<void> {
	const r = await trpc(n, "tinHieu.gui", "mutation", {
		muonLam: `muon ${chu}`,
		daXayRa: `xay ra ${chu}`,
		man: "/okr",
	});
	if (r.status !== 200) throw new Error(`gui hong ${r.status} ${r.loi}`);
}

const soDaDau = () => db.tinHieu.count({ where: { keoVeLuc: { not: null } } });

async function don() {
	await db.tinHieu.deleteMany({});
}

beforeAll(async () => {
	app = await createApp();
	for (const n of NGUOI) {
		await gieoThanhVien(uid(n), VAI[n]);
		cookie[n] = (await mintPhien(uid(n))).cookie;
	}
	await don();
}, CHO_MS);

afterAll(async () => {
	await don();
	await db.apikey.deleteMany({
		where: { referenceId: { startsWith: TIEN_TO } },
	});
	await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await app.close();
});

describe("tvk-tao", () => {
	test(
		"tvk-tao: 4 vai x 3 loai, chi quan tri tao duoc khoa chi keo mang dung quyen",
		async () => {
			for (const n of ["owner", "admin", "member", "okr"] as const) {
				for (const loai of LOAI) {
					const truoc = await db.apikey.count();
					const r = await tao(n, loai);
					const o = `${n} x ${loai ?? "vang"}`;
					if (loai === "keo-tin-hieu" && (n === "member" || n === "okr")) {
						expect(r.status, `vai thuong tao duoc khoa chi keo: ${o}`).toBe(
							403,
						);
						expect(await db.apikey.count(), o).toBe(truoc);
						continue;
					}
					expect(r.status, o).toBe(200);
					const id = r.khoa?.id ?? "";
					const hang = await db.apikey.findUniqueOrThrow({ where: { id } });
					const ds = dongDs.parse(
						(await trpc(n, "apiKeys.list", "query", {})).data,
					);
					const dong = ds.rows.find((x) => x.id === id);
					expect(ds.taoDuocKeoTinHieu, o).toBe(n === "owner" || n === "admin");
					if (loai === "keo-tin-hieu") {
						expect(hang.configId, o).toBe(KHOA_KEO_TIN_HIEU.configId);
						expect(
							hang.permissions === null ? null : JSON.parse(hang.permissions),
							`khoa chi keo thieu quyen keo tin hieu: ${o}`,
						).toEqual(KHOA_KEO_TIN_HIEU.quyen);
						expect(dong?.loai, o).toBe("keo-tin-hieu");
					} else {
						expect(hang.configId, o).toBe("default");
						expect(hang.permissions, o).toBeNull();
						expect(dong?.loai, o).toBe("toan-quyen");
					}
				}
			}
		},
		CHO_MS,
	);
});

describe("tvk-lich", () => {
	test(
		"tvk-lich: khoa chi keo cua owner va admin keo ve dung nhu LT2, noi luc dong dau, lan hai tra du cung byte",
		async () => {
			for (const n of ["owner", "admin"] as const) {
				await don();
				await gui("owner", `${n} a`);
				await gui("member", `${n} b`);
				await gui("okr", `${n} c`);
				const truocDau = await db.tinHieu.findFirstOrThrow({
					orderBy: { so: "asc" },
				});
				const lucTruoc = new Date("2026-10-01T00:00:00.000Z");
				await db.tinHieu.update({
					where: { id: truocDau.id },
					data: { keoVeLuc: lucTruoc },
				});
				const khoa = await khoaKeo(n);
				const spy = spyOn(ContextLogger.prototype, "log");
				let dongLog: string[] = [];
				let lan1: request.Response;
				try {
					lan1 = await lich(khoa.key);
					dongLog = spy.mock.calls.map((c) => JSON.stringify(c));
				} finally {
					spy.mockRestore();
				}
				expect(lan1.status, JSON.stringify(lan1.body)).toBe(200);
				const day1 = docPhanHoiKeoVeDayDu(lan1.body);
				const hang = await db.tinHieu.findMany({ orderBy: { so: "asc" } });
				expect(hang.every((h) => h.keoVeLuc !== null)).toBe(true);
				expect(hang[0]?.keoVeLuc?.toISOString()).toBe(lucTruoc.toISOString());
				const vuaDau = hang.slice(1).map((h) => h.keoVeLuc?.toISOString());
				expect(
					day1.dongDauLuc,
					"luot khong noi luc dong dau",
				).not.toBeUndefined();
				expect(new Set(vuaDau)).toEqual(new Set([day1.dongDauLuc ?? ""]));
				expect(
					day1.tep.map((t) => t.keoVeLuc),
					"luot keo ve bo tin hieu da dau",
				).toEqual(hang.map((h) => h.keoVeLuc?.toISOString()));
				const khoaTay = await auth.api.createApiKey({
					body: { name: "tvk-tay", userId: uid("owner") },
				});
				const lt2 = await request(app.getHttpServer())
					.post(`${REST_BRIDGE_PATH}/tin-hieu/keo-ve`)
					.set(API_KEY_HEADER, khoaTay.key)
					.set("content-type", "application/json")
					.send("{}");
				expect(lt2.status).toBe(200);
				expect(day1.tep.map((t) => t.id)).toEqual(
					docPhanHoiKeoVe(lt2.body).map((t) => t.id),
				);
				const lan2 = docPhanHoiKeoVeDayDu((await lich(khoa.key)).body);
				expect(lan2.dongDauLuc).toBeNull();
				expect(
					lan2.tep.map((t) => t.id),
					"luot keo ve bo tin hieu da dau",
				).toEqual(day1.tep.map((t) => t.id));
				expect(lan2.tep.map((t) => vietTep(t.tep))).toEqual(
					day1.tep.map((t) => vietTep(t.tep)),
				);
				const sau = await db.tinHieu.findMany({ orderBy: { so: "asc" } });
				expect(sau.map((h) => h.keoVeLuc?.toISOString())).toEqual(
					hang.map((h) => h.keoVeLuc?.toISOString()),
				);
				const dongLich = dongLog.filter((d) =>
					d.includes("tin-hieu.keo-ve-lich"),
				);
				expect(dongLich.length).toBe(1);
				expect(dongLich[0]).toContain(khoa.id);
				expect(dongLich[0]).toContain(uid(n));
				for (const d of dongLog) {
					expect(d.includes(khoa.key), "nhat ky mang chuoi khoa").toBe(false);
					for (const h of hang) {
						expect(d.includes(h.muonLam)).toBe(false);
						expect(d.includes(h.daXayRa)).toBe(false);
					}
				}
			}
		},
		CHO_MS,
	);
});

function dien(chuoi: string, thay: Record<string, string>): string {
	return chuoi.replace(/\{(\w+)\}/g, (_, k: string) => thay[k] ?? "");
}

async function goiDuong(
	goi: z.infer<typeof bangDuong>["duong"][number]["goi"],
	key: string,
	thay: Record<string, string>,
): Promise<{ status: number; body: unknown }> {
	if ("ham" in goi) {
		try {
			const phien = await auth.api.getSession({
				headers: new Headers({ [API_KEY_HEADER]: key }),
			});
			return { status: phien ? 200 : 204, body: phien };
		} catch (loi) {
			const ma = loiCoMa.safeParse(loi);
			return { status: ma.success ? ma.data.statusCode : 500, body: null };
		}
	}
	const path = dien(goi.path, thay);
	const r =
		goi.method === "GET"
			? await request(app.getHttpServer()).get(path).set(API_KEY_HEADER, key)
			: await request(app.getHttpServer())
					.post(path)
					.set(API_KEY_HEADER, key)
					.set("content-type", "application/json")
					.send(
						JSON.stringify(
							Object.fromEntries(
								Object.entries(goi.body ?? {}).map(([k, v]) => [
									k,
									dien(v, thay),
								]),
							),
						),
					);
	return { status: r.status, body: r.body };
}

describe("tvk-duong-khac", () => {
	test("tvk-duong-khac: danh muc duong phu moi duong HTTP cua plugin khoa", () => {
		const plugin = (auth.options.plugins ?? []).find((p) => p.id === "api-key");
		const coDuong = Object.values(plugin?.endpoints ?? {})
			.flatMap((e) => {
				const d = coDuongHttp.safeParse({ path: Reflect.get(e, "path") });
				return d.success ? [d.data.path] : [];
			})
			.sort();
		expect(coDuong.length).toBeGreaterThan(0);
		const trongBang = BANG.duong
			.flatMap((d) => (d.plugin === undefined ? [] : [d.plugin]))
			.sort();
		expect(trongBang, "duong doc khoa chua co o").toEqual(coDuong);
	});

	test(
		"tvk-duong-khac: khoa chi keo khong mo phien o 13 duong; khoa thuong thi co",
		async () => {
			await don();
			await gui("member", "duong khac");
			const keo = await khoaKeo("owner");
			const thuong = await khoaThuong("owner");
			const thay = { khoaKeo: keo.id, khoaThuong: thuong.id };
			const soKhoa = await db.apikey.count();
			const sai: string[] = [];
			for (const d of BANG.duong) {
				const r = await goiDuong(d.goi, keo.key, thay);
				const phienRong =
					r.body === null || z.object({}).strict().safeParse(r.body).success;
				const chan =
					d.o === 6
						? r.status === 401 || (r.status === 200 && phienRong)
						: d.o === 13
							? r.status === 204 || r.status === 401
							: r.status === 401 || r.status === 403;
				if (!chan) sai.push(`o ${d.o} ${d.ten}: ${r.status}`);
			}
			expect(sai, "khoa chi keo mo duoc phien").toEqual([]);
			expect(await db.apikey.count()).toBe(soKhoa);
			expect(
				(await db.apikey.findUniqueOrThrow({ where: { id: keo.id } })).name,
			).toBe("tvk-owner-keo-tin-hieu");
			expect(await soDaDau()).toBe(0);
			const doiChung: string[] = [];
			for (const d of BANG.duong.filter((x) =>
				[1, 2, 3, 5, 6, 8, 12, 13].includes(x.o),
			)) {
				const r = await goiDuong(d.goi, thuong.key, thay);
				if (r.status !== 200) doiChung.push(`o ${d.o} ${d.ten}: ${r.status}`);
			}
			expect(doiChung, "khoa thuong mat phien").toEqual([]);
		},
		CHO_MS,
	);
});

describe("tvk-tu-choi", () => {
	test(
		"tvk-tu-choi: 5 ca 401 va 3 ca 403, khong dong dau, vai doc lai moi luot",
		async () => {
			await don();
			await gui("member", "tu choi");
			const sai: string[] = [];
			const kiem = async (ten: string, ma: number, key?: string) => {
				const r = await lich(key);
				if (r.status !== ma) sai.push(`${ten}: ${r.status} != ${ma}`);
				if ((await soDaDau()) !== 0) sai.push(`${ten}: da dong dau`);
			};
			await kiem(
				"duong lich nhan khoa toan quyen",
				401,
				(await khoaThuong("owner")).key,
			);
			const thuHoi = await khoaKeo("owner");
			expect(
				(await trpc("owner", "apiKeys.revoke", "mutation", { id: thuHoi.id }))
					.status,
			).toBe(200);
			await kiem("khoa da thu hoi", 401, thuHoi.key);
			const hetHan = await khoaKeo("owner");
			await db.apikey.update({
				where: { id: hetHan.id },
				data: { expiresAt: new Date(Date.now() - 60_000) },
			});
			await kiem("khoa het han", 401, hetHan.key);
			await kiem("chuoi khoa sai", 401, `crm_${"x".repeat(32)}`);
			await kiem("khong co khoa", 401);
			const doi = await khoaKeo("doi");
			expect((await lich(doi.key)).status).toBe(200);
			await don();
			await gui("member", "sau khi ha vai");
			await gieoThanhVien(uid("doi"), "member");
			await kiem("vai chu khoa khong doc lai: member", 403, doi.key);
			await gieoThanhVien(uid("doi"), "okr");
			await kiem("vai chu khoa khong doc lai: okr", 403, doi.key);
			const roi = await khoaKeo("roi");
			await db.member.deleteMany({ where: { userId: uid("roi") } });
			await kiem("chu khoa da roi", 403, roi.key);
			expect(sai).toEqual([]);
		},
		CHO_MS,
	);
});

describe("tvk-khoa-thuong", () => {
	test(
		"tvk-khoa-thuong: khoa tao qua duong cu va hang dat ve DEFAULT cua cot van mo phien",
		async () => {
			const cot = await db.$queryRaw<{ column_default: string | null }[]>`
				SELECT column_default FROM information_schema.columns
				WHERE table_name = 'apikey' AND column_name = 'configId'`;
			const macDinh = /^'(.*)'::text$/.exec(cot[0]?.column_default ?? "")?.[1];
			expect(macDinh).toBeDefined();
			const moi = await khoaThuong("member");
			expect(
				(await db.apikey.findUniqueOrThrow({ where: { id: moi.id } })).configId,
				"khoa thuong cu mat phien",
			).toBe(macDinh ?? "");
			const cu = await khoaThuong("member");
			await db.$executeRaw`UPDATE "apikey" SET "configId" = DEFAULT WHERE id = ${cu.id}`;
			for (const k of [moi, cu]) {
				const r = await request(app.getHttpServer())
					.post(`${REST_BRIDGE_PATH}/contacts/search`)
					.set(API_KEY_HEADER, k.key)
					.set("content-type", "application/json")
					.send("{}");
				expect(r.status, "khoa thuong cu mat phien").toBe(200);
			}
		},
		CHO_MS,
	);
});
