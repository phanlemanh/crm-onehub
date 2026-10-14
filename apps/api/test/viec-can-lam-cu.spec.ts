import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { ActivityType, db } from "@crm/db";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import { chepViecCanLam, taoViec } from "@crm/db/viec-ghi";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppRouterHost } from "nestjs-trpc";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import { batApp, donViec, goi, nguoi, thoaThuan } from "./support/viec-gieo";

const NGAY_MS = 24 * 60 * 60 * 1000;
const MA_TEST_MS = 120_000;

let app: NestExpressApplication;

type DongId = { id: string };
type Timeline = { entries: DongId[] };
type CuaBanGhi = { mo: DongId[]; daXong: DongId[]; daHuy: DongId[] };
type TongQuan = {
	overdueTasks: DongId[];
	viecQuaHan: DongId[];
	recentActivity: DongId[];
	quaHan: { viec: number };
};

function hong(dieu: boolean, thongDiep: string): void {
	if (!dieu) throw new Error(thongDiep);
}

async function viecCanLamCu(input: {
	createdById: string;
	subject: string;
	dealId: string;
	companyId?: string;
	dueAt?: Date | null;
}): Promise<string> {
	const hang = await db.activity.create({
		data: {
			type: ActivityType.TASK,
			subject: input.subject,
			occurredAt: new Date(),
			dueAt: input.dueAt ?? null,
			dealId: input.dealId,
			companyId: input.companyId ?? null,
			createdById: input.createdById,
		},
		select: { id: true },
	});
	return hang.id;
}

async function chep(activityId: string, nguoiChayId: string): Promise<string> {
	const ban = await db.$transaction((tx) =>
		chepViecCanLam(tx, {
			activityId,
			nguoiChay: { id: nguoiChayId, ten: nguoiChayId },
			now: new Date(),
		}),
	);
	if (!ban) throw new Error(`cvc: khong chep duoc ${activityId}`);
	return ban.id;
}

function homQua(): Date {
	return new Date(dauNgayVN(new Date()).getTime() - NGAY_MS);
}

function soLan(ds: DongId[], id: string): number {
	return ds.filter((d) => d.id === id).length;
}

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterAll(async () => {
	await app.close();
	await donViec();
	await donDep();
});

describe("cvc-dong-thoi-gian", () => {
	test(
		"cvc-dong-thoi-gian: việc đã chép rời dòng thời gian, việc chưa chép ở lại, hai thẻ cũ không còn",
		async () => {
			const A = await nguoi("CVC Dòng A");
			const { dealId } = await thoaThuan(app, A.id, "CVC Dòng");
			const ghiChu = await goi(
				app,
				"activities.create",
				"mutation",
				{ type: "NOTE", body: "ghi chú", dealId },
				A.id,
			);
			const ghiChuId = (ghiChu.data as DongId).id;
			const daChep = await viecCanLamCu({
				createdById: A.id,
				subject: "Đã chép",
				dealId,
			});
			const chuaChep = await viecCanLamCu({
				createdById: A.id,
				subject: "Chưa chép",
				dealId,
			});
			const banChep = await chep(daChep, A.id);

			const dong = (
				await goi(
					app,
					"activities.timeline",
					"query",
					{ dealId, filter: "all" },
					A.id,
				)
			).data as Timeline;
			const ids = dong.entries.map((e) => e.id);
			hong(!ids.includes(daChep), "cvc: viec da chep con tren dong thoi gian");
			hong(
				ids.includes(chuaChep) && ids.includes(ghiChuId),
				"cvc: viec chua chep bien mat",
			);

			const dem = (
				await goi(app, "activities.timelineCounts", "query", { dealId }, A.id)
			).data as Record<string, number>;
			hong(
				dem.all === 2 && !("upcoming" in dem) && !("done" in dem),
				`cvc: dem the sai ${JSON.stringify(dem)}`,
			);
			for (const filter of ["upcoming", "done"]) {
				const r = await goi(
					app,
					"activities.timeline",
					"query",
					{ dealId, filter },
					A.id,
				);
				hong(r.code === "BAD_REQUEST", "cvc: con the sap toi da xong");
			}

			const khoi = (await goi(app, "viec.cuaBanGhi", "query", { dealId }, A.id))
				.data as CuaBanGhi;
			hong(soLan(khoi.mo, banChep) === 1, "cvc: khoi viec thieu ban chep");
		},
		MA_TEST_MS,
	);
});

describe("cvc-api", () => {
	test(
		"cvc-api: không tạo được việc cần làm, hai thủ tục cũ không còn, Tổng quan chỉ hiện việc cũ chưa chép",
		async () => {
			const A = await nguoi("CVC Api A");
			const { dealId } = await thoaThuan(app, A.id, "CVC Api");
			const truoc = await db.activity.count();
			const tao = await goi(
				app,
				"activities.create",
				"mutation",
				{ type: "TASK", dealId, subject: "x" },
				A.id,
			);
			hong(
				tao.code === "BAD_REQUEST" && (await db.activity.count()) === truoc,
				"cvc: api van nhan TASK",
			);
			const ghiChu = await goi(
				app,
				"activities.create",
				"mutation",
				{ type: "NOTE", dealId, body: "đối chứng" },
				A.id,
			);
			expect(ghiChu.status).toBe(200);

			const { appRouter } = app.get(AppRouterHost);
			const thuTuc = Object.keys(appRouter._def.procedures);
			for (const ten of ["activities.complete", "activities.myTasks"]) {
				hong(!thuTuc.includes(ten), `cvc: con thu tuc ${ten}`);
			}

			const V = await db.$transaction((tx) =>
				taoViec(tx, {
					nguoiId: A.id,
					tieuDe: "Việc quá hạn",
					hanNgay: homQua(),
					gan: [{ loai: "deal", id: dealId }],
					nguon: "web",
					now: new Date(),
				}),
			);
			const U = await viecCanLamCu({
				createdById: A.id,
				subject: "Cũ chưa chép",
				dealId,
				dueAt: homQua(),
			});
			const W = await viecCanLamCu({
				createdById: A.id,
				subject: "Cũ đã chép",
				dealId,
				dueAt: homQua(),
			});
			const banW = await chep(W, A.id);

			const tq = (
				await goi(app, "dashboard.summary", "query", { scope: "me" }, A.id)
			).data as TongQuan;
			hong(soLan(tq.overdueTasks, W) === 0, "cvc: tong quan hien viec da chep");
			hong(
				soLan(tq.overdueTasks, U) === 1,
				"cvc: tong quan mat viec cu chua chep",
			);
			hong(
				soLan(tq.viecQuaHan, V.id) === 1 && soLan(tq.viecQuaHan, banW) === 1,
				"cvc: tong quan hien viec da chep",
			);
			hong(tq.quaHan.viec === 3, `cvc: dem qua han sai ${tq.quaHan.viec}`);
		},
		MA_TEST_MS,
	);
});

describe("cvc-hien", () => {
	test(
		"cvc-hien: việc chép hiện đúng một lần ở Việc của tôi, khối Việc, Tổng quan; bản gốc không hiện",
		async () => {
			const A = await nguoi("CVC Hiện A");
			const { dealId, congTyId } = await thoaThuan(app, A.id, "CVC Hiện");
			const goc = await viecCanLamCu({
				createdById: A.id,
				subject: "Gọi lại đối tác",
				dealId,
				companyId: congTyId,
				dueAt: homQua(),
			});
			const truoc = (
				await goi(app, "dashboard.summary", "query", { scope: "me" }, A.id)
			).data as TongQuan;
			expect(soLan(truoc.overdueTasks, goc)).toBe(1);

			const ban = await chep(goc, A.id);
			const cuaToi = (
				await goi(app, "viec.cuaToi", "query", { nhom: "giao-cho-toi" }, A.id)
			).data as CuaBanGhi;
			hong(
				soLan(cuaToi.mo, ban) === 1,
				`cvc: ban chep hien sai viec-cua-toi ${soLan(cuaToi.mo, ban)}`,
			);
			const khoiDeal = (
				await goi(app, "viec.cuaBanGhi", "query", { dealId }, A.id)
			).data as CuaBanGhi;
			hong(
				soLan(khoiDeal.mo, ban) === 1,
				`cvc: ban chep hien sai khoi-deal ${soLan(khoiDeal.mo, ban)}`,
			);
			const khoiCongTy = (
				await goi(app, "viec.cuaBanGhi", "query", { companyId: congTyId }, A.id)
			).data as CuaBanGhi;
			hong(
				soLan(khoiCongTy.mo, ban) === 1,
				`cvc: ban chep hien sai khoi-cong-ty ${soLan(khoiCongTy.mo, ban)}`,
			);
			const tq = (
				await goi(app, "dashboard.summary", "query", { scope: "me" }, A.id)
			).data as TongQuan;
			hong(
				soLan(tq.viecQuaHan, ban) === 1,
				`cvc: ban chep hien sai tong-quan ${soLan(tq.viecQuaHan, ban)}`,
			);
			hong(
				soLan(tq.overdueTasks, goc) === 0,
				"cvc: ban chep hien sai tong-quan-goc 1",
			);
			hong(
				soLan(tq.recentActivity, goc) === 0,
				"cvc: hoat dong gan day hien ban goc",
			);
		},
		MA_TEST_MS,
	);
});
