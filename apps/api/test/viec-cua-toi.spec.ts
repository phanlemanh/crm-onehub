import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { dashboardSummaryOutput } from "../src/dashboard/dashboard.contracts";
import { viecCuaToiNhomOutput } from "../src/viec/viec.contracts";
import {
	donDep,
	gieoBoPhan,
	gieoKeHoach,
	moXuong,
} from "./support/ke-hoach-gieo";
import {
	batApp,
	doiThu,
	donViec,
	goi,
	nguoi,
	taoThu,
	thoaThuan,
} from "./support/viec-gieo";

const NOW = new Date("2026-10-14T12:00:00+07:00");
const MA_TEST_MS = 120_000;

const han = (ngay: string) => new Date(`${ngay}T00:00:00.000Z`);

let app: NestExpressApplication;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterEach(() => setSystemTime());

afterAll(async () => {
	await app.close();
	await donViec();
	await donDep();
});

describe("vc-cua-toi", () => {
	test(
		"vc-cua-toi: Giao cho tôi xếp quá hạn, hôm nay, tuần sau, không hạn; khép ở dòng gập; số đếm chỉ việc mở; Tổng quan có việc quá hạn",
		async () => {
			setSystemTime(NOW);
			const a = await nguoi("vc-ct-a", "member");
			const b = await nguoi("vc-ct-b", "member");
			const c = await nguoi("vc-ct-c", "member");
			const { dealId } = await thoaThuan(app, a.id);
			const gan = [{ loai: "deal" as const, id: dealId }];
			const mot = (tieuDe: string, hanNgay: Date | null) =>
				taoThu({
					nguoiId: a.id,
					tieuDe,
					nguoiThucHienId: b.id,
					hanNgay,
					gan,
					now: NOW,
				});
			const quaHan = await mot("vc-ct qua han", han("2026-10-12"));
			const homNay = await mot("vc-ct hom nay", han("2026-10-14"));
			const tuanSau = await mot("vc-ct tuan sau", han("2026-10-21"));
			const khongHan = await mot("vc-ct khong han", null);
			const xong = await mot("vc-ct xong", han("2026-10-13"));
			const huy = await mot("vc-ct huy", han("2026-10-13"));
			await doiThu(xong.id, b.id, "XONG", NOW);
			await doiThu(huy.id, a.id, "HUY", NOW);
			await taoThu({
				nguoiId: b.id,
				tieuDe: "vc-ct b giao",
				nguoiThucHienId: a.id,
				gan,
				now: NOW,
			});
			await taoThu({
				nguoiId: c.id,
				tieuDe: "vc-ct c",
				nguoiThucHienId: c.id,
				nguoiTheoDoiIds: [b.id],
				gan,
				now: NOW,
			});
			const doc = async (nhom: string) =>
				viecCuaToiNhomOutput.parse(
					(await goi(app, "viec.cuaToi", "query", { nhom }, b.id)).data,
				);
			const giao = await doc("giao-cho-toi");
			const thuTu = giao.mo.map((v) => v.id);
			if (
				JSON.stringify(thuTu) !==
					JSON.stringify([quaHan.id, homNay.id, tuanSau.id, khongHan.id]) ||
				giao.daXong.length !== 1 ||
				giao.daHuy.length !== 1
			) {
				throw new Error(`vc: viec cua toi sai thu tu ${JSON.stringify(giao)}`);
			}
			for (const nhom of ["toi-giao", "dang-theo-doi"]) {
				if ((await doc(nhom)).mo.length !== 1)
					throw new Error(`vc: nhom ${nhom} sai`);
			}
			if (
				JSON.stringify(giao.demNhom) !==
				JSON.stringify({ "giao-cho-toi": 4, "toi-giao": 1, "dang-theo-doi": 1 })
			) {
				throw new Error("vc: dem nhom dem ca viec khep");
			}
			const bp = await gieoBoPhan();
			await gieoKeHoach({
				camTrich: a.id,
				buoc: [
					{
						nhan: "vc-ct buoc",
						boPhanId: bp.id,
						giao: b.id,
						han: han("2026-10-10"),
					},
				],
			});
			const viecCu = await db.activity.count({
				where: {
					type: "TASK",
					completedAt: null,
					dueAt: { lt: dauNgayVN(NOW) },
					createdById: b.id,
				},
			});
			const tq = dashboardSummaryOutput.parse(
				(await goi(app, "dashboard.summary", "query", { scope: "me" }, b.id))
					.data,
			);
			const coViec = tq.viecQuaHan.some(
				(d) => d.loai === "viec" && d.id === quaHan.id,
			);
			if (!coViec || tq.mySteps.length === 0 || tq.quaHan.viec !== viecCu + 1) {
				throw new Error("vc: tong quan thieu viec qua han");
			}
			const tqA = dashboardSummaryOutput.parse(
				(await goi(app, "dashboard.summary", "query", { scope: "me" }, a.id))
					.data,
			);
			if (tqA.viecQuaHan.some((d) => d.id === quaHan.id)) {
				throw new Error("vc: tong quan lan viec nguoi khac");
			}
		},
		MA_TEST_MS,
	);

	test(
		"vc-cua-toi: ranh nua dem — 00:30 VN ngày D+1 thì việc hạn D quá hạn, việc hạn D+1 chưa",
		async () => {
			const luc = new Date("2026-10-15T00:30:00+07:00");
			setSystemTime(luc);
			const a = await nguoi("vc-nd-a", "member");
			const hom = await taoThu({
				nguoiId: a.id,
				tieuDe: "vc-nd D",
				hanNgay: han("2026-10-14"),
				gan: [],
				now: luc,
			});
			const mai = await taoThu({
				nguoiId: a.id,
				tieuDe: "vc-nd D+1",
				hanNgay: han("2026-10-15"),
				gan: [],
				now: luc,
			});
			const ra = viecCuaToiNhomOutput.parse(
				(await goi(app, "viec.cuaToi", "query", { nhom: "giao-cho-toi" }, a.id))
					.data,
			);
			expect(ra.mo.find((v) => v.id === hom.id)?.quaHan).toBe(true);
			expect(ra.mo.find((v) => v.id === mai.id)?.quaHan).toBe(false);
		},
		MA_TEST_MS,
	);
});
