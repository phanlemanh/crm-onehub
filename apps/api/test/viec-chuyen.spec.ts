import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { type Db, db, type Prisma } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { OnboardingGhi } from "../src/onboarding/onboarding-ghi";
import { WorkspaceService } from "../src/workspace/workspace.service";
import { donDep, gieoKeHoach, moXuong } from "./support/ke-hoach-gieo";
import {
	batApp,
	doiThu,
	donViec,
	nguoi,
	taoThu,
	thoaThuan,
} from "./support/viec-gieo";

const MA_TEST_MS = 120_000;
let app: NestExpressApplication;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterAll(async () => {
	await app.close();
	await donViec();
	await donDep();
});

const workspace = () =>
	new WorkspaceService(db, {
		workspaceChanged: async () => undefined,
	} as unknown as AgentTriggerService);

function dbHongLanThu(lan: number): Db {
	let dem = 0;
	const boc = (tx: Prisma.TransactionClient) =>
		new Proxy(tx, {
			get(goc, khoa) {
				const gt = Reflect.get(goc, khoa);
				if (khoa !== "viec") return gt;
				return new Proxy(gt as object, {
					get(v, ham) {
						const fn = Reflect.get(v, ham);
						if (ham !== "update") return fn;
						return (...doiSo: unknown[]) => {
							dem += 1;
							if (dem === lan) throw new Error("vc thu hong lan cap nhat");
							return (fn as (...a: unknown[]) => unknown).apply(v, doiSo);
						};
					},
				});
			},
		});
	return new Proxy(db, {
		get(goc, khoa) {
			if (khoa !== "$transaction") return Reflect.get(goc, khoa);
			return (lam: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
				db.$transaction((tx) => lam(boc(tx)));
		},
	}) as Db;
}

async function dung() {
	const qt = await nguoi("vc-cv-qt", "admin");
	const ra = await nguoi("vc-cv-ra", "member");
	const b = await nguoi("vc-cv-b", "member");
	const c = await nguoi("vc-cv-c", "member");
	const { dealId } = await thoaThuan(app, qt.id);
	const gan = [{ loai: "deal" as const, id: dealId }];
	const mo1 = await taoThu({
		nguoiId: b.id,
		tieuDe: "vc-cv mo 1",
		nguoiThucHienId: ra.id,
		gan,
	});
	const mo2 = await taoThu({
		nguoiId: b.id,
		tieuDe: "vc-cv mo 2",
		nguoiThucHienId: ra.id,
		gan,
	});
	const xong = await taoThu({
		nguoiId: b.id,
		tieuDe: "vc-cv xong",
		nguoiThucHienId: ra.id,
		gan,
	});
	await doiThu(xong.id, ra.id, "XONG");
	const giao = await taoThu({
		nguoiId: ra.id,
		tieuDe: "vc-cv giao",
		nguoiThucHienId: b.id,
		gan,
	});
	await gieoKeHoach({ camTrich: ra.id, buoc: [] });
	return { qt, ra, b, c, mo1, mo2, xong, giao };
}

describe("vc-chuyen", () => {
	test(
		"vc-chuyen: xem trước nêu 3 việc bằng số của lời đổi vai; chuyển đổi người thực hiện và người giao, giữ việc đã khép, mỗi việc một vết",
		async () => {
			const f = await dung();
			const ghi = new OnboardingGhi(db);
			const xem = await ghi.transferPreview({ fromUserId: f.ra.id }, f.qt.id);
			if (xem.keHoach !== 1 || xem.buoc !== 0 || xem.viec !== 3) {
				throw new Error(`vc: xem truoc thieu viec ${JSON.stringify(xem)}`);
			}
			const memberId = (
				await db.member.findFirstOrThrow({ where: { userId: f.ra.id } })
			).id;
			let loi = "";
			try {
				await workspace().setMemberRole(f.qt.id, { memberId, role: "okr" });
			} catch (e) {
				loi = e instanceof Error ? e.message : String(e);
			}
			if (!loi.includes(`giữ ${xem.viec} việc`))
				throw new Error("vc: hai cho dem viec lech");
			const kq = await ghi.transferWork(
				{ fromUserId: f.ra.id, toUserId: f.c.id },
				f.qt.id,
			);
			expect(kq.viec).toBe(3);
			const doc = (id: string) => db.viec.findUniqueOrThrow({ where: { id } });
			if ((await doc(f.giao.id)).nguoiGiaoId !== f.c.id)
				throw new Error("vc: chuyen viec bo sot nguoi giao");
			for (const v of [f.mo1, f.mo2]) {
				if ((await doc(v.id)).nguoiThucHienId !== f.c.id)
					throw new Error("vc: chuyen viec bo sot nguoi thuc hien");
			}
			if ((await doc(f.xong.id)).nguoiThucHienId !== f.ra.id)
				throw new Error("vc: chuyen viec doi viec da khep");
			for (const v of [f.mo1, f.mo2, f.giao]) {
				const so = await db.viecVet.count({
					where: { viecId: v.id, loai: "chuyen-viec", nguon: "chuyen-viec" },
				});
				if (so !== 1) throw new Error("vc: vet chuyen viec sai");
			}
			const keHoach = await db.onboardingPlan.count({
				where: { ownerId: f.c.id },
			});
			expect(keHoach).toBe(1);
		},
		MA_TEST_MS,
	);

	test(
		"vc-chuyen: nguyên tử — lần cập nhật việc thứ ba hỏng thì không kế hoạch, không việc nào đổi",
		async () => {
			const f = await dung();
			const truoc = await db.viec.findMany({
				where: { id: { in: [f.mo1.id, f.mo2.id, f.giao.id] } },
				orderBy: { id: "asc" },
			});
			const keHoachTruoc = await db.onboardingPlan.count({
				where: { ownerId: f.ra.id },
			});
			await expect(
				new OnboardingGhi(dbHongLanThu(3)).transferWork(
					{ fromUserId: f.ra.id, toUserId: f.c.id },
					f.qt.id,
				),
			).rejects.toThrow("vc thu hong lan cap nhat");
			const sau = await db.viec.findMany({
				where: { id: { in: [f.mo1.id, f.mo2.id, f.giao.id] } },
				orderBy: { id: "asc" },
			});
			if (
				JSON.stringify(sau) !== JSON.stringify(truoc) ||
				(await db.onboardingPlan.count({ where: { ownerId: f.ra.id } })) !==
					keHoachTruoc
			) {
				throw new Error("vc: chuyen viec khong nguyen tu");
			}
		},
		MA_TEST_MS,
	);

	test(
		"vc-chuyen: tu giao — người rời vừa giao vừa thực hiện một việc thì đổi cả hai cột, đúng một vết",
		async () => {
			const qt = await nguoi("vc-tg-qt", "admin");
			const ra = await nguoi("vc-tg-ra", "member");
			const c = await nguoi("vc-tg-c", "member");
			const v = await taoThu({ nguoiId: ra.id, tieuDe: "vc-tg", gan: [] });
			await new OnboardingGhi(db).transferWork(
				{ fromUserId: ra.id, toUserId: c.id },
				qt.id,
			);
			const sau = await db.viec.findUniqueOrThrow({ where: { id: v.id } });
			expect([sau.nguoiGiaoId, sau.nguoiThucHienId]).toEqual([c.id, c.id]);
			expect(
				await db.viecVet.count({
					where: { viecId: v.id, loai: "chuyen-viec" },
				}),
			).toBe(1);
		},
		MA_TEST_MS,
	);
});
