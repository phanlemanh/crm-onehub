import { afterAll, describe, expect, setSystemTime, test } from "bun:test";
import { db } from "@crm/db";
import request from "supertest";
import { CompaniesService } from "../src/companies/companies.service";
import { ContactsService } from "../src/contacts/contacts.service";
import { DealsService } from "../src/deals/deals.service";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import {
	dungSan,
	goi,
	ma,
	ok,
	phien,
	type TraLoi,
	ungDung,
} from "./okr-san";

dungSan((b) => b, { rest: true });

const CHO_MS = 120_000;
const CAU = "Chỉ xoá vĩnh viễn được bản ghi đã lưu trữ.";

type Loai = "deals" | "contacts" | "companies";
const LOAI: readonly Loai[] = ["deals", "contacts", "companies"];

const tao: Record<Loai, () => Promise<string>> = {
	companies: async () =>
		ok<{ id: string }>(
			await goi("companies.create", { name: ma("cong ty luu tru") }),
			"tao cong ty",
		).id,
	contacts: async () =>
		ok<{ id: string }>(
			await goi("contacts.create", { firstName: ma("ca nhan luu tru") }),
			"tao ca nhan",
		).id,
	deals: async () =>
		ok<{ id: string }>(
			await goi("deals.create", {
				name: ma("thoa thuan luu tru"),
				companyId: await tao.companies(),
				ownerId: phien.quan.nguoi,
			}),
			"tao thoa thuan",
		).id,
};

async function archivedAt(loai: Loai, id: string): Promise<string | null> {
	const doc = {
		deals: () =>
			db.deal.findUnique({ where: { id }, select: { archivedAt: true } }),
		contacts: () =>
			db.contact.findUnique({ where: { id }, select: { archivedAt: true } }),
		companies: () =>
			db.company.findUnique({ where: { id }, select: { archivedAt: true } }),
	}[loai];
	const r = await doc();
	if (!r) return "khong-con";
	return r.archivedAt?.toISOString() ?? null;
}

const luuTru = async (loai: Loai, id: string) =>
	ok(await goi(`${loai}.archive`, { id }), `luu tru ${loai}`);

async function xoaRest(loai: Loai, id: string): Promise<TraLoi> {
	const res = await request(ungDung().getHttpServer())
		.delete(`${REST_BRIDGE_PATH}/${loai}/${id}`)
		.set("cookie", phien.quan.cookie);
	return {
		status: res.status,
		data: res.body ?? null,
		loi: String(res.body?.message ?? ""),
	};
}

const tra = (r: TraLoi) => (r.status === 200 ? "200" : `${r.status} ${r.loi}`);

afterAll(() => {
	setSystemTime();
});

describe("purge-chua-luu-tru", () => {
	test(
		"purge-chua-luu-tru: 3 loai x 3 duong — ban chua luu tru bi tu choi, ban da luu tru xoa duoc, lich don chay nhu cu",
		async () => {
			const thuc: Record<string, unknown> = {};
			const mong: Record<string, unknown> = {};
			for (const loai of LOAI) {
				const x = await tao[loai]();
				const rTrpc = await goi(`${loai}.purge`, { id: x });
				thuc[`${loai}|trpc`] = { tra: tra(rTrpc), con: await archivedAt(loai, x) };
				mong[`${loai}|trpc`] = { tra: `400 ${CAU}`, con: null };

				const rRest = await xoaRest(loai, x);
				thuc[`${loai}|rest`] = { status: rRest.status, con: await archivedAt(loai, x) };
				mong[`${loai}|rest`] = { status: 400, con: null };

				const y = await tao[loai]();
				await luuTru(loai, y);
				const lo = ok<{
					requested: number;
					succeeded: number;
					failed: number;
					message: string | null;
				}>(await goi(`${loai}.bulkPurge`, { ids: [x, y] }), `lo ${loai}`);
				thuc[`${loai}|lo`] = {
					lo: {
						requested: lo.requested,
						succeeded: lo.succeeded,
						failed: lo.failed,
						message: lo.message,
					},
					x: await archivedAt(loai, x),
					y: await archivedAt(loai, y),
				};
				mong[`${loai}|lo`] = {
					lo: { requested: 2, succeeded: 1, failed: 1, message: CAU },
					x: null,
					y: "khong-con",
				};

				const yy = await tao[loai]();
				await luuTru(loai, yy);
				thuc[`${loai}|da-luu-tru`] = {
					tra: tra(await goi(`${loai}.purge`, { id: yy })),
					con: await archivedAt(loai, yy),
				};
				mong[`${loai}|da-luu-tru`] = { tra: "200", con: "khong-con" };
			}
			expect(
				Object.keys(thuc).filter((k) => !k.endsWith("da-luu-tru")).length,
			).toBe(9);

			const z = await tao.deals();
			const xCon = await tao.deals();
			await luuTru("deals", z);
			const sau = new Date(Date.now() + 60_000);
			await ungDung().get(DealsService).purgeExpired(sau);
			await ungDung().get(ContactsService).purgeExpired(sau);
			await ungDung().get(CompaniesService).purgeExpired(sau);
			thuc["lich-don"] = {
				z: await archivedAt("deals", z),
				x: await archivedAt("deals", xCon),
			};
			mong["lich-don"] = { z: "khong-con", x: null };

			console.log(`purge-chua-luu-tru: ${JSON.stringify(thuc)}`);
			expect(thuc).toEqual(mong);
		},
		CHO_MS,
	);
});

describe("luu-tru-giu-ngay", () => {
	test(
		"luu-tru-giu-ngay: 3 loai x 2 duong — luu tru lai giu ngay dau, khoi phuc roi luu tru thi ngay moi, lo hon hop chi doi ban chua luu tru",
		async () => {
			const goc = Date.now();
			const t1 = new Date(goc);
			const t2 = new Date(goc + 3_600_000);
			const t3 = new Date(goc + 7_200_000);
			const thuc: Record<string, unknown> = {};
			const mong: Record<string, unknown> = {};
			for (const loai of LOAI) {
				for (const duong of ["archive", "bulkArchive"] as const) {
					const id = await tao[loai]();
					const goiLuuTru = (ids: string[]) =>
						duong === "archive"
							? goi(`${loai}.archive`, { id: ids[0] })
							: goi(`${loai}.bulkArchive`, { ids });
					setSystemTime(t1);
					ok(await goiLuuTru([id]), "lan 1");
					const lan1 = await archivedAt(loai, id);
					setSystemTime(t2);
					const r2 = await goiLuuTru([id]);
					const lan2 = await archivedAt(loai, id);
					ok(await goi(`${loai}.restore`, { id }), "khoi phuc");
					setSystemTime(t3);
					ok(await goiLuuTru([id]), "lan 3");
					const lan3 = await archivedAt(loai, id);
					setSystemTime();
					thuc[`${loai}|${duong}`] = { r2: r2.status, lan1, lan2, lan3 };
					mong[`${loai}|${duong}`] = {
						r2: 200,
						lan1: t1.toISOString(),
						lan2: t1.toISOString(),
						lan3: t3.toISOString(),
					};
				}
				const cu = await tao[loai]();
				const moi = await tao[loai]();
				setSystemTime(t1);
				await luuTru(loai, cu);
				setSystemTime(t2);
				ok(await goi(`${loai}.bulkArchive`, { ids: [cu, moi] }), "lo hon hop");
				setSystemTime();
				thuc[`${loai}|hon-hop`] = {
					cu: await archivedAt(loai, cu),
					moi: await archivedAt(loai, moi),
				};
				mong[`${loai}|hon-hop`] = {
					cu: t1.toISOString(),
					moi: t2.toISOString(),
				};
			}
			const khongCo = await goi("deals.archive", { id: "khong-co-ban-ghi" });
			thuc["khong-co"] = khongCo.status;
			mong["khong-co"] = 404;
			console.log(`luu-tru-giu-ngay: ${JSON.stringify(thuc)}`);
			expect(
				Object.keys(thuc).filter((k) => /\|(archive|bulkArchive)$/.test(k))
					.length,
			).toBe(6);
			expect(thuc).toEqual(mong);
		},
		CHO_MS,
	);
});
