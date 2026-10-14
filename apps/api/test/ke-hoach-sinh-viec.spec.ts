// Hồ sơ _acceptance/ke-hoach-sinh-viec — E1, E2, E4–E8: kế hoạch tạo từ khuôn sinh Việc theo phòng
// ban, bước là bản chiếu của Việc, ba thao tác bị chặn, gỡ bước, đóng kế hoạch, thêm bước tay, kế
// hoạch cũ chạy như cũ. Mọi fixture dựng qua đường ghi thật (tRPC có phiên, hoặc dịch vụ thật).
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { datBuocXong } from "@crm/db/onboarding-buoc";
import { ngayVN, viecCanNhac } from "@crm/db/onboarding-nhac";
import { VIEC } from "@crm/db/viec";
import {
	vetCoCongTy,
	vet as vetKeHoach,
} from "@crm/validation/onboarding-activity";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import {
	DAY_MS,
	dichVu,
	doiVai,
	donDep,
	gieoBoPhan,
	gieoCongTy,
	gieoKeHoach,
	gieoThanhVien,
	moXuong,
} from "./support/ke-hoach-gieo";
import { batApp, cookieCua, donViec, goi } from "./support/viec-gieo";

const MA_TEST_MS = 120_000;
const BAT_DAU = "2026-10-15";

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

type Khung = Awaited<ReturnType<typeof dungKhung>>;

// Khuôn ba bước ở hai phòng: A có trưởng phòng H (lệch 0 và 7 ngày), B không có trưởng phòng (lệch 3).
async function dungKhung() {
	const h = await gieoThanhVien("KH Hà");
	const o = await gieoThanhVien("KH Ổn");
	const t = await gieoThanhVien("KH Tạo");
	const u = await gieoThanhVien("KH Uyên");
	const okr = await gieoThanhVien("Người OKR KH", "okr");
	const A = await gieoBoPhan();
	await db.department.update({
		where: { id: A.id },
		data: { headUserId: h.id },
	});
	const B = await gieoBoPhan();
	const khuon = await dichVu().createTemplate({
		name: `khuon ${A.name}`,
		partnerType: null,
		steps: [
			{ label: "A không", departmentId: A.id, position: 0, offsetDays: 0 },
			{ label: "A bảy", departmentId: A.id, position: 1, offsetDays: 7 },
			{ label: "B ba", departmentId: B.id, position: 2, offsetDays: 3 },
		],
	});
	return { h, o, t, u, okr, A, B, khuon };
}

async function taoKeHoach(
	k: Khung,
	them: { nguoiTheoPhongBan?: { departmentId: string; userId: string }[] } = {},
) {
	const cty = await gieoCongTy();
	const r = await goi(
		app,
		"onboarding.createFromTemplate",
		"mutation",
		{
			companyId: cty.id,
			templateId: k.khuon.id,
			startedAt: BAT_DAU,
			ownerId: k.o.id,
			...(them.nguoiTheoPhongBan
				? { nguoiTheoPhongBan: them.nguoiTheoPhongBan }
				: {}),
		},
		k.t.id,
	);
	return { r, cty };
}

function buocVaViec(planId: string) {
	return db.onboardingStep.findMany({
		where: { planId },
		orderBy: { position: "asc" },
		include: { viec: { include: { gan: true, vet: true } } },
	});
}

function ngayCong(ngay: string, so: number): string {
	return new Date(Date.parse(`${ngay}T00:00:00Z`) + so * DAY_MS)
		.toISOString()
		.slice(0, 10);
}

async function kiemChieu(stepId: string, lenh: string): Promise<void> {
	const b = await db.onboardingStep.findUniqueOrThrow({
		where: { id: stepId },
		include: { viec: true },
	});
	const v = b.viec;
	if (v === null) throw new Error(`kh: buoc lech viec sau ${lenh} viec`);
	if (b.assigneeId !== v.nguoiThucHienId) {
		throw new Error(`kh: buoc lech viec sau ${lenh} assignee`);
	}
	if (v.hanNgay === null || ngayVN(b.dueAt) !== ngayVN(v.hanNgay)) {
		throw new Error(`kh: buoc lech viec sau ${lenh} han`);
	}
	if (b.label !== v.tieuDe) {
		throw new Error(`kh: buoc lech viec sau ${lenh} ten`);
	}
	const xong = v.trangThai === "XONG";
	if (
		(b.completedAt !== null) !== xong ||
		(xong && b.completedAt?.getTime() !== v.khepLuc?.getTime())
	) {
		throw new Error(`kh: buoc lech viec sau ${lenh} xong`);
	}
}

const dem = () =>
	Promise.all([
		db.onboardingPlan.count(),
		db.onboardingStep.count(),
		db.viec.count(),
		db.viecVet.count(),
	]);

describe("kh-tao", () => {
	test(
		"tạo từ khuôn: mỗi bước một Việc, người theo phòng, hạn theo ngày VN, vết nguồn khuon",
		async () => {
			const k = await dungKhung();
			const { r } = await taoKeHoach(k);
			if (r.status !== 200) throw new Error(`kh: tao loi ${r.message}`);
			const planId = (r.data as { id: string }).id;
			const ds = await buocVaViec(planId);
			if (ds.length !== 3) throw new Error(`kh: tao sai so buoc ${ds.length}`);
			const ma = ds.map((b) => b.viecId);
			if (ma.some((m) => m === null) || new Set(ma).size !== 3) {
				throw new Error("kh: buoc khong tro dung mot viec");
			}
			const mong = [
				{ phong: "A", nguoi: k.h.id, lech: 0 },
				{ phong: "A", nguoi: k.h.id, lech: 7 },
				{ phong: "B", nguoi: k.o.id, lech: 3 },
			];
			for (const [i, b] of ds.entries()) {
				const v = b.viec;
				const m = mong[i];
				if (!v || !m) throw new Error("kh: buoc khong tro dung mot viec");
				if (v.nguoiThucHienId !== m.nguoi || v.nguoiGiaoId !== k.t.id) {
					throw new Error(`kh: nguoi viec sai ${m.phong}`);
				}
				if (
					v.hanNgay === null ||
					ngayVN(v.hanNgay) !== ngayCong(BAT_DAU, m.lech)
				) {
					throw new Error(`kh: han viec sai ${b.label}`);
				}
				if (v.gan.length !== 1 || v.gan[0]?.planId !== planId) {
					throw new Error("kh: viec khong gan ke hoach");
				}
				const tao = v.vet.filter((x) => x.loai === "tao");
				if (tao.length !== 1 || tao[0]?.nguon !== "khuon") {
					throw new Error("kh: vet tao sai");
				}
				await kiemChieu(b.id, "tao").catch(() => {
					throw new Error("kh: buoc lech viec assignee");
				});
			}
			expect(ds).toHaveLength(3);
		},
		MA_TEST_MS,
	);

	test(
		"REST POST /onboarding/plans không có trường chọn người cũng sinh Việc",
		async () => {
			const k = await dungKhung();
			const cty = await gieoCongTy();
			const res = await request(app.getHttpServer())
				.post(`${REST_BRIDGE_PATH}/onboarding/plans`)
				.set("cookie", await cookieCua(k.t.id))
				.send({
					companyId: cty.id,
					templateId: k.khuon.id,
					startedAt: BAT_DAU,
					ownerId: k.o.id,
				});
			if (res.status >= 300) throw new Error("kh: rest khong sinh viec");
			const ds = await buocVaViec(res.body.id);
			if (
				ds.length !== 3 ||
				ds.some(
					(b) => b.viec?.vet.find((x) => x.loai === "tao")?.nguon !== "khuon",
				)
			) {
				throw new Error("kh: rest khong sinh viec");
			}
			expect(ds[2]?.viec?.nguoiThucHienId).toBe(k.o.id);
		},
		MA_TEST_MS,
	);

	test(
		"đối chứng âm: kế hoạch cũ dựng trực tiếp không có Việc nào",
		async () => {
			const k = await dungKhung();
			const { plan } = await gieoKeHoach({
				camTrich: k.o.id,
				buoc: [{ nhan: "cu", boPhanId: k.A.id, giao: k.h.id }],
			});
			const gan = await db.viecGan.count({ where: { planId: plan.id } });
			if (gan !== 0) throw new Error("kh: ke hoach cu bi sinh viec");
			expect(gan).toBe(0);
		},
		MA_TEST_MS,
	);
});

describe("kh-chon-nguoi", () => {
	test(
		"người chọn theo phòng thắng mặc định; trưởng phòng vai okr rơi về cầm trịch; vai okr bị từ chối",
		async () => {
			const k = await dungKhung();
			const mot = await taoKeHoach(k, {
				nguoiTheoPhongBan: [{ departmentId: k.B.id, userId: k.u.id }],
			});
			const ds1 = await buocVaViec((mot.r.data as { id: string }).id);
			if (ds1[2]?.viec?.nguoiThucHienId !== k.u.id) {
				throw new Error("kh: chon nguoi khong ap B");
			}
			if (ds1[0]?.viec?.nguoiThucHienId !== k.h.id) {
				throw new Error("kh: chon nguoi khong ap A");
			}

			await doiVai(k.h.id, "okr");
			const hai = await taoKeHoach(k);
			const ds2 = await buocVaViec((hai.r.data as { id: string }).id);
			if (ds2[0]?.viec?.nguoiThucHienId !== k.o.id) {
				throw new Error("kh: truong phong okr van mac dinh");
			}
			await doiVai(k.h.id, "member");

			const truoc = await dem();
			const ba = await taoKeHoach(k, {
				nguoiTheoPhongBan: [{ departmentId: k.A.id, userId: k.okr.id }],
			});
			if (ba.r.status === 200)
				throw new Error("kh: chon vai okr khong bi chan");
			for (const chu of ["Người OKR KH", k.A.name, "chỉ OKR"]) {
				if (!ba.r.message.includes(chu)) {
					throw new Error(`kh: chon vai okr khong bi chan ${chu}`);
				}
			}
			if (JSON.stringify(await dem()) !== JSON.stringify(truoc)) {
				throw new Error("kh: chon vai okr ghi do");
			}

			const bon = await taoKeHoach(k, {
				nguoiTheoPhongBan: [{ departmentId: k.A.id, userId: "khong-co-ai" }],
			});
			if (bon.r.status === 200) throw new Error("kh: nguoi la lot");
			expect(ba.r.code).toBe("BAD_REQUEST");
		},
		MA_TEST_MS,
	);
});

type Ctx = { k: Khung; planId: string; buoc: string; viec: string };

async function ctxMoi(): Promise<Ctx> {
	const k = await dungKhung();
	const { r } = await taoKeHoach(k);
	const planId = (r.data as { id: string }).id;
	const ds = await buocVaViec(planId);
	const b = ds[0];
	if (!b?.viecId) throw new Error("kh: buoc khong tro dung mot viec");
	return { k, planId, buoc: b.id, viec: b.viecId };
}

const XONG_N = {
	xong: vetKeHoach.buocXong,
	boXong: vetKeHoach.buocBoXong,
	coCongTy: vetCoCongTy,
};

// Bảng viết trước, chép từ bảng mục 5 của design doc 2026-10-14 (mười lệnh) + ô bỏ giao.
const BANG: Array<{
	lenh: string;
	chay: (c: Ctx) => Promise<{ status: number; message: string }>;
	tuChoi?: string;
	vet?: number;
}> = [
	{
		lenh: "assignStep",
		chay: (c) =>
			goi(
				app,
				"onboarding.assignStep",
				"mutation",
				{ stepId: c.buoc, assigneeId: c.k.u.id },
				c.k.o.id,
			),
	},
	{
		lenh: "assignStep-null",
		chay: (c) =>
			goi(
				app,
				"onboarding.assignStep",
				"mutation",
				{ stepId: c.buoc, assigneeId: null },
				c.k.o.id,
			),
		tuChoi: VIEC.thongDiep.buocLuonCoNguoi,
		vet: 0,
	},
	{
		lenh: "setStepDone(true)",
		chay: (c) =>
			goi(
				app,
				"onboarding.setStepDone",
				"mutation",
				{ stepId: c.buoc, done: true },
				c.k.h.id,
			),
	},
	{
		lenh: "setStepDone(false)",
		chay: async (c) => {
			await goi(
				app,
				"onboarding.setStepDone",
				"mutation",
				{ stepId: c.buoc, done: true },
				c.k.h.id,
			);
			return goi(
				app,
				"onboarding.setStepDone",
				"mutation",
				{ stepId: c.buoc, done: false },
				c.k.o.id,
			);
		},
		vet: 2,
	},
	{
		lenh: "rescheduleStep",
		chay: (c) =>
			goi(
				app,
				"onboarding.rescheduleStep",
				"mutation",
				{ stepId: c.buoc, dueAt: "2026-11-02" },
				c.k.o.id,
			),
	},
	{
		lenh: "datBuocXong",
		chay: async (c) => {
			await db.$transaction((tx) =>
				datBuocXong(
					tx,
					{
						stepId: c.buoc,
						done: true,
						nguoiId: c.k.h.id,
						now: new Date(),
						nguon: "zalo",
					},
					XONG_N,
				),
			);
			return { status: 200, message: "" };
		},
	},
	{
		lenh: "transferWork",
		chay: async (c) => {
			const qt = await gieoThanhVien("KH Quản trị", "admin");
			return goi(
				app,
				"onboarding.transferWork",
				"mutation",
				{ fromUserId: c.k.h.id, toUserId: c.k.u.id },
				qt.id,
			);
		},
	},
	{
		lenh: "viec.doiTrangThai(DANG_LAM)",
		chay: (c) =>
			goi(
				app,
				"viec.doiTrangThai",
				"mutation",
				{ id: c.viec, den: "DANG_LAM" },
				c.k.h.id,
			),
	},
	{
		lenh: "viec.doiTrangThai(CHO_DANH_GIA)",
		chay: (c) =>
			goi(
				app,
				"viec.doiTrangThai",
				"mutation",
				{ id: c.viec, den: "CHO_DANH_GIA" },
				c.k.h.id,
			),
	},
	{
		lenh: "viec.doiTrangThai(XONG)",
		chay: (c) =>
			goi(
				app,
				"viec.doiTrangThai",
				"mutation",
				{ id: c.viec, den: "XONG" },
				c.k.h.id,
			),
	},
	{
		lenh: "viec.doiTrangThai(XONG->DANG_LAM)",
		chay: async (c) => {
			await goi(
				app,
				"viec.doiTrangThai",
				"mutation",
				{ id: c.viec, den: "XONG" },
				c.k.h.id,
			);
			return goi(
				app,
				"viec.doiTrangThai",
				"mutation",
				{ id: c.viec, den: "DANG_LAM" },
				c.k.t.id,
			);
		},
		vet: 2,
	},
	{
		lenh: "viec.sua",
		chay: (c) =>
			goi(
				app,
				"viec.sua",
				"mutation",
				{ id: c.viec, tieuDe: "A không (sửa)", hanNgay: "2026-11-05" },
				c.k.t.id,
			),
		vet: 2,
	},
	{
		lenh: "viec.doiNguoiThucHien",
		chay: (c) =>
			goi(
				app,
				"viec.doiNguoiThucHien",
				"mutation",
				{ id: c.viec, nguoiThucHienId: c.k.u.id },
				c.k.t.id,
			),
	},
];

describe("kh-ban-chieu", () => {
	test(
		"sau mỗi lệnh ở bước hay ở Việc, bốn cột của bước bằng bản chiếu của Việc",
		async () => {
			let daChay = 0;
			for (const o of BANG) {
				const c = await ctxMoi();
				const truoc = await db.viecVet.count({ where: { viecId: c.viec } });
				const r = await o.chay(c);
				if (o.tuChoi !== undefined) {
					if (r.status === 200 || !r.message.includes(o.tuChoi)) {
						throw new Error(`kh: bang chieu tu choi sai ${o.lenh}`);
					}
				} else if (r.status !== 200) {
					throw new Error(`kh: bang chieu lenh loi ${o.lenh} ${r.message}`);
				}
				await kiemChieu(c.buoc, o.lenh);
				const sau = await db.viecVet.count({ where: { viecId: c.viec } });
				if (sau - truoc !== (o.vet ?? 1)) {
					throw new Error(`kh: vet sai sau ${o.lenh} ${sau - truoc}`);
				}
				daChay += 1;
			}
			if (daChay !== BANG.length) {
				throw new Error(`kh: bang chieu thieu o ${daChay}`);
			}
			const c = await ctxMoi();
			const r = await goi(
				app,
				"onboarding.setStepDone",
				"mutation",
				{ stepId: c.buoc, done: true },
				c.k.h.id,
			);
			if (r.status !== 200) {
				throw new Error("kh: nguoi duoc giao khong dong duoc buoc");
			}
			expect(daChay).toBe(BANG.length);
		},
		MA_TEST_MS * 4,
	);
});

describe("kh-chan", () => {
	test(
		"Huỷ, xoá, gỡ kế hoạch bị chặn trên Việc của bước; Việc thường vẫn làm được",
		async () => {
			const LENH = [
				{
					ten: "huy",
					chay: (id: string, ai: string, _p: string) =>
						goi(app, "viec.doiTrangThai", "mutation", { id, den: "HUY" }, ai),
				},
				{
					ten: "xoa",
					chay: (id: string, ai: string, _p: string) =>
						goi(app, "viec.xoa", "mutation", { id }, ai),
				},
				{
					ten: "go-ke-hoach",
					chay: (id: string, ai: string, planId: string) =>
						goi(app, "viec.go", "mutation", { id, planId }, ai),
				},
			];
			let o = 0;
			for (const l of LENH) {
				const c = await ctxMoi();
				const truoc = await db.viec.findUniqueOrThrow({
					where: { id: c.viec },
					include: { gan: true },
				});
				const r = await l.chay(c.viec, c.k.t.id, c.planId);
				if (r.status === 200 || !r.message.includes("gỡ bước ở kế hoạch")) {
					throw new Error(`kh: viec cua buoc khong bi chan ${l.ten}`);
				}
				const sau = await db.viec.findUnique({
					where: { id: c.viec },
					include: { gan: true },
				});
				const buoc = await db.onboardingStep.findUnique({
					where: { id: c.buoc },
				});
				if (
					!sau ||
					sau.trangThai !== truoc.trangThai ||
					sau.gan.length !== truoc.gan.length ||
					buoc?.viecId !== c.viec
				) {
					throw new Error(`kh: viec cua buoc khong bi chan ${l.ten}`);
				}
				o += 1;

				const thuong = await goi(
					app,
					"viec.create",
					"mutation",
					{
						tieuDe: `thường ${l.ten}`,
						planId: c.planId,
						nguoiThucHienId: c.k.h.id,
					},
					c.k.t.id,
				);
				const id = (thuong.data as { id: string }).id;
				const r2 = await l.chay(id, c.k.t.id, c.planId);
				if (r2.status !== 200) {
					throw new Error(
						`kh: viec thuong bi chan nham ${l.ten} ${r2.message}`,
					);
				}
				o += 1;
			}
			if (o !== 6) throw new Error("kh: ma tran chan thieu o");
			expect(o).toBe(6);
		},
		MA_TEST_MS * 2,
	);
});

describe("kh-go-buoc", () => {
	test(
		"gỡ bước: bước mất, Việc sang Huỷ có vết lý do, danh mục đếm 0/2",
		async () => {
			const k = await dungKhung();
			const { r, cty } = await taoKeHoach(k);
			const planId = (r.data as { id: string }).id;
			const ds = await buocVaViec(planId);
			const ba = ds[2];
			if (!ba?.viecId) throw new Error("kh: buoc khong tro dung mot viec");
			const g = await goi(
				app,
				"onboarding.removeStep",
				"mutation",
				{ stepId: ba.id },
				k.o.id,
			);
			if (g.status !== 200) throw new Error(`kh: go buoc loi ${g.message}`);
			if (await db.onboardingStep.findUnique({ where: { id: ba.id } })) {
				throw new Error("kh: go buoc buoc con");
			}
			const v = await db.viec.findUnique({
				where: { id: ba.viecId },
				include: { vet: true },
			});
			if (v?.trangThai !== "HUY") throw new Error("kh: go buoc viec sai");
			const lyDo = v.vet.find(
				(x) =>
					x.loai === "doi-trang-thai" &&
					JSON.stringify(x.sau).includes("gỡ bước"),
			);
			if (!lyDo) throw new Error("kh: go buoc thieu vet");
			if (await db.onboardingStep.count({ where: { viecId: ba.viecId } })) {
				throw new Error("kh: go buoc con tro");
			}
			const hang = await goi(
				app,
				"onboarding.plansOfCompany",
				"query",
				{ companyId: cty.id },
				k.o.id,
			);
			const p = (
				hang.data as Array<{ id: string; buocXong: number; buocTong: number }>
			).find((x) => x.id === planId);
			if (p?.buocXong !== 0 || p.buocTong !== 2) {
				throw new Error(
					`kh: danh muc dem sai sau go ${p?.buocXong}/${p?.buocTong}`,
				);
			}
			expect(p.buocTong).toBe(2);
		},
		MA_TEST_MS,
	);

	test(
		"kh-go-buoc dong-ke-hoach: đóng có huỷ, đóng không huỷ, mở lại không hồi",
		async () => {
			const k = await dungKhung();
			const mot = await taoKeHoach(k);
			const planId = (mot.r.data as { id: string }).id;
			const ds = await buocVaViec(planId);
			const xong = ds[0];
			if (!xong) throw new Error("kh: buoc khong tro dung mot viec");
			await goi(
				app,
				"onboarding.setStepDone",
				"mutation",
				{ stepId: xong.id, done: true },
				k.h.id,
			);
			const d = await goi(
				app,
				"onboarding.closePlan",
				"mutation",
				{ id: planId, huyViecMo: true },
				k.o.id,
			);
			if (d.status !== 200) throw new Error(`kh: dong loi ${d.message}`);
			const sau = await buocVaViec(planId);
			for (const [i, b] of sau.entries()) {
				const mong = i === 0 ? "XONG" : "HUY";
				if (b.viec?.trangThai !== mong) {
					throw new Error(`kh: dong ke hoach viec sai ${b.label}`);
				}
				if (
					mong === "HUY" &&
					!b.viec.vet.some((x) => x.nguon === "dong-ke-hoach")
				) {
					throw new Error(`kh: dong ke hoach viec sai ${b.label}`);
				}
				await kiemChieu(b.id, "closePlan").catch(() => {
					throw new Error(`kh: dong ke hoach viec sai ${b.label}`);
				});
			}
			const maHuy = new Set(sau.slice(1).map((b) => b.viecId));
			const luc = new Date(Date.parse(`${BAT_DAU}T03:00:00Z`) + 20 * DAY_MS);
			for (const ai of [k.h.id, k.o.id]) {
				const nhac = await viecCanNhac(db, {
					now: luc,
					userId: ai,
					cuaSo: "buoi-sang",
				});
				const coHuy = (nhac.get(ai) ?? []).some(
					(v) => "viecId" in v && maHuy.has(v.viecId),
				);
				if (coHuy) throw new Error("kh: nhac viec cua ke hoach da dong");
			}

			const hai = await taoKeHoach(k);
			const plan2 = (hai.r.data as { id: string }).id;
			await goi(app, "onboarding.closePlan", "mutation", { id: plan2 }, k.o.id);
			const giu = await buocVaViec(plan2);
			if (giu.some((b) => b.viec?.trangThai !== "CHUA_LAM")) {
				throw new Error("kh: dong ke hoach huy khi khong chon");
			}

			await goi(
				app,
				"onboarding.reopenPlan",
				"mutation",
				{ id: planId },
				k.o.id,
			);
			const moLai = await buocVaViec(planId);
			if (moLai.slice(1).some((b) => b.viec?.trangThai !== "HUY")) {
				throw new Error("kh: mo lai hoi viec");
			}
			expect(moLai[0]?.viec?.trangThai).toBe("XONG");
		},
		MA_TEST_MS * 2,
	);
});

describe("kh-them-buoc", () => {
	test(
		"thêm bước tay sinh Việc: người chọn, hay mặc định theo phòng",
		async () => {
			const k = await dungKhung();
			const cty = await gieoCongTy();
			const rong = await dichVu().createTemplate({
				name: `rong ${k.A.name}`,
				partnerType: null,
				steps: [
					{ label: "tam", departmentId: k.B.id, position: 0, offsetDays: 0 },
				],
			});
			const r1 = await goi(
				app,
				"onboarding.createFromTemplate",
				"mutation",
				{
					companyId: cty.id,
					templateId: rong.id,
					startedAt: BAT_DAU,
					ownerId: k.o.id,
				},
				k.t.id,
			);
			const planR = (r1.data as { id: string }).id;
			const { r: r2 } = await taoKeHoach(k);
			const planK = (r2.data as { id: string }).id;
			const ca: Array<{
				ten: string;
				planId: string;
				input: Record<string, string>;
				mong: string;
			}> = [
				{
					ten: "R",
					planId: planR,
					input: {
						planId: planR,
						label: "tay R",
						departmentId: k.B.id,
						dueAt: "2026-10-20",
						assigneeId: k.u.id,
					},
					mong: k.u.id,
				},
				{
					ten: "K",
					planId: planK,
					input: {
						planId: planK,
						label: "tay K",
						departmentId: k.A.id,
						dueAt: "2026-10-21",
					},
					mong: k.h.id,
				},
			];
			for (const c of ca) {
				const r = await goi(
					app,
					"onboarding.addStep",
					"mutation",
					c.input,
					k.o.id,
				);
				if (r.status !== 200) throw new Error(`kh: them buoc loi ${r.message}`);
				const id = (r.data as { id: string }).id;
				const b = await db.onboardingStep.findUniqueOrThrow({
					where: { id },
					include: { viec: { include: { gan: true, vet: true } } },
				});
				if (!b.viec) throw new Error(`kh: them buoc khong sinh viec ${c.ten}`);
				if (b.viec.nguoiThucHienId !== c.mong)
					throw new Error(`kh: them buoc nguoi sai ${c.ten}`);
				if (
					b.viec.gan[0]?.planId !== c.planId ||
					b.viec.vet.find((x) => x.loai === "tao")?.nguon !== "web"
				) {
					throw new Error("kh: them buoc gan sai");
				}
			}
			expect(ca).toHaveLength(2);
		},
		MA_TEST_MS,
	);
});

describe("kh-ke-hoach-cu", () => {
	test(
		"kế hoạch cũ (bước không Việc): bốn lệnh như trước, không sinh Việc",
		async () => {
			const k = await dungKhung();
			const { plan } = await gieoKeHoach({
				camTrich: k.o.id,
				batDau: new Date(Date.now() - DAY_MS),
				buoc: [
					{ nhan: "cu mot", boPhanId: k.A.id, giao: k.h.id },
					{ nhan: "cu hai", boPhanId: k.B.id },
				],
			});
			const ds = await db.onboardingStep.findMany({
				where: { planId: plan.id },
				orderBy: { position: "asc" },
			});
			const [mot, hai] = ds;
			if (!mot || !hai) throw new Error("kh: ke hoach cu doi hanh vi gieo");
			const truoc = await Promise.all([db.viec.count(), db.viecVet.count()]);
			const lenh: Array<
				[string, () => Promise<unknown>, () => Promise<boolean>]
			> = [
				[
					"assignStep",
					() =>
						goi(
							app,
							"onboarding.assignStep",
							"mutation",
							{ stepId: hai.id, assigneeId: k.u.id },
							k.o.id,
						),
					async () =>
						(
							await db.onboardingStep.findUniqueOrThrow({
								where: { id: hai.id },
							})
						).assigneeId === k.u.id,
				],
				[
					"assignStep-null",
					() =>
						goi(
							app,
							"onboarding.assignStep",
							"mutation",
							{ stepId: hai.id, assigneeId: null },
							k.o.id,
						),
					async () =>
						(
							await db.onboardingStep.findUniqueOrThrow({
								where: { id: hai.id },
							})
						).assigneeId === null,
				],
				[
					"setStepDone(true)",
					() =>
						goi(
							app,
							"onboarding.setStepDone",
							"mutation",
							{ stepId: mot.id, done: true },
							k.o.id,
						),
					async () =>
						(
							await db.onboardingStep.findUniqueOrThrow({
								where: { id: mot.id },
							})
						).completedAt !== null,
				],
				[
					"setStepDone(false)",
					() =>
						goi(
							app,
							"onboarding.setStepDone",
							"mutation",
							{ stepId: mot.id, done: false },
							k.o.id,
						),
					async () =>
						(
							await db.onboardingStep.findUniqueOrThrow({
								where: { id: mot.id },
							})
						).completedAt === null,
				],
				[
					"rescheduleStep",
					() =>
						goi(
							app,
							"onboarding.rescheduleStep",
							"mutation",
							{ stepId: mot.id, dueAt: "2026-11-09" },
							k.o.id,
						),
					async () =>
						ngayVN(
							(
								await db.onboardingStep.findUniqueOrThrow({
									where: { id: mot.id },
								})
							).dueAt,
						) === "2026-11-09",
				],
				[
					"removeStep",
					() =>
						goi(
							app,
							"onboarding.removeStep",
							"mutation",
							{ stepId: hai.id },
							k.o.id,
						),
					async () =>
						(await db.onboardingStep.findUnique({ where: { id: hai.id } })) ===
						null,
				],
			];
			for (const [ten, chay, dung] of lenh) {
				await chay();
				if (!(await dung()))
					throw new Error(`kh: ke hoach cu doi hanh vi ${ten}`);
				const sau = await Promise.all([db.viec.count(), db.viecVet.count()]);
				if (JSON.stringify(sau) !== JSON.stringify(truoc)) {
					throw new Error(`kh: ke hoach cu sinh viec ${ten}`);
				}
			}
			expect(lenh).toHaveLength(6);
		},
		MA_TEST_MS,
	);
});
