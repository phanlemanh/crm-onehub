import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { parseOnboardingActivityMeta } from "@crm/validation/onboarding-activity";
import { z } from "zod";
import type { AgentQueueService } from "../src/agent/agent-queue.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { CompaniesService } from "../src/companies/companies.service";
import type { FaviconService } from "../src/companies/favicon.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { ConversionService } from "../src/currency/conversion.service";
import { DashboardService } from "../src/dashboard/dashboard.service";
import type { FieldsService } from "../src/fields/fields.service";
import {
	ngayLich,
	type PlanListInput,
	type PlanRow as PlanListRow,
	plansOfCompanyInput,
	plansOfContactInput,
	stepDoneInput,
	transferPreviewInput,
	transferWorkInput,
} from "../src/onboarding/onboarding.contracts";
import { ONBOARDING } from "../src/onboarding/onboarding-config";
import payload from "./fixtures/moi-phia-payload.json";
import {
	batHttp,
	buocCua,
	DAY_MS,
	dichVu,
	donDep,
	gieoBoPhan,
	gieoCaNhan,
	gieoCongTy,
	gieoKeHoach,
	gieoNguoiNgoai,
	gieoThanhVien,
	moXuong,
	ngayCach,
	noi,
	phan,
	token,
	vetCua,
} from "./support/ke-hoach-gieo";

const CAU_DUONG_DO = readFileSync(
	join(
		import.meta.dir,
		"../../../_acceptance/moi-phia-deu-thay-ke-hoach/rang/ty-le-tu-danh-dau.sql",
	),
	"utf8",
);

type SoDuongDo = { tu_danh_dau: number; mau: number; khong_giao: number };

async function doDuongDo(tu: Date, den: Date): Promise<SoDuongDo> {
	const hang = await db.$queryRawUnsafe<SoDuongDo[]>(CAU_DUONG_DO, tu, den);
	return phan(hang, 0);
}

beforeAll(moXuong);
afterAll(donDep);

describe("vet-giao-luc-xong", () => {
	test("vet-giao-luc-xong: vet xong mang nguoi duoc giao luc bam, cau truy van do dung ti le", async () => {
		const tu = new Date(Date.now() - 1000);
		const [O, A, B, C] = [
			await gieoThanhVien(),
			await gieoThanhVien(),
			await gieoThanhVien(),
			await gieoThanhVien(),
		];
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({
			camTrich: O.id,
			buoc: [
				{ nhan: "S1", boPhanId: bp.id, giao: A.id },
				{ nhan: "S2", boPhanId: bp.id },
				{ nhan: "S3", boPhanId: bp.id, giao: A.id },
				{ nhan: "S4", boPhanId: bp.id, giao: A.id },
				{ nhan: "S5", boPhanId: bp.id, giao: C.id },
				{ nhan: "S6", boPhanId: bp.id, giao: A.id },
				{ nhan: "S7", boPhanId: bp.id, giao: A.id },
			],
		});
		const buoc = await buocCua(plan.id);
		const xong = (i: number, ai: string) =>
			dichVu().setStepDone({ stepId: phan(buoc, i).id, done: true }, ai);

		await xong(0, B.id);
		await xong(1, B.id);

		const [vet1, vet2] = (await vetCua(plan.id)).map((v) => ({
			nguoiTao: v.createdById,
			meta: parseOnboardingActivityMeta(v.meta),
		}));
		expect(vet1?.meta.kind).toBe("buoc.xong");
		expect(vet1?.nguoiTao, "vet 1: nguoi tao mong B").toBe(B.id);
		expect(
			vet1?.meta.kind === "buoc.xong"
				? vet1.meta.giaoLucXong
				: "khong phai buoc.xong",
			"giaoLucXong mong A",
		).toBe(A.id);
		expect(
			vet2?.meta.kind === "buoc.xong"
				? vet2.meta.giaoLucXong
				: "khong phai buoc.xong",
			"giaoLucXong mong null cho buoc chua giao",
		).toBeNull();

		const den = () => new Date(Date.now() + 60_000);
		expect(
			await doDuongDo(tu, den()),
			"hai vet phan 1: B danh dau ho buoc giao A, va mot buoc chua giao",
		).toEqual({ tu_danh_dau: 0, mau: 1, khong_giao: 1 });

		await xong(2, A.id);
		await xong(3, A.id);
		await xong(4, C.id);
		await xong(5, B.id);

		const metaDau = parseOnboardingActivityMeta(
			phan(await vetCua(plan.id), 0).meta,
		);
		if (metaDau.kind !== "buoc.xong") {
			throw new Error(`vet dau mong buoc.xong, nhan ${metaDau.kind}`);
		}
		const { giaoLucXong: _boDi, ...metaCu } = metaDau;
		await db.activity.create({
			data: {
				type: "PLAN_CHANGE",
				occurredAt: new Date(),
				planId: plan.id,
				createdById: A.id,
				meta: metaCu,
			},
		});

		expect(await doDuongDo(tu, den()), "mau mong 5").toEqual({
			tu_danh_dau: 3,
			mau: 5,
			khong_giao: 1,
		});

		await xong(6, B.id);
		expect(
			await doDuongDo(tu, den()),
			"them mot vet danh dau ho: mau mong 6",
		).toEqual({ tu_danh_dau: 3, mau: 6, khong_giao: 1 });
	});
});

function phanTich<S extends z.ZodType>(
	schema: S,
	duLieu: z.input<S>,
	thuTuc: string,
): z.output<S> {
	const ket = schema.safeParse(duLieu);
	if (!ket.success) {
		throw new Error(
			`${thuTuc}: payload man gui khong qua schema — ${ket.error.message}`,
		);
	}
	return ket.data;
}

async function gieoChuyenGiao() {
	const Q = await gieoThanhVien("Quan Tri", "admin");
	const [H, T, X] = [
		await gieoThanhVien("Huong Le"),
		await gieoThanhVien("Tuan Do"),
		await gieoThanhVien("Xuan Mai"),
	];
	const bp = await gieoBoPhan();
	const { plan: P1 } = await gieoKeHoach({
		camTrich: H.id,
		buoc: [
			{ nhan: "S1", boPhanId: bp.id, giao: H.id },
			{ nhan: "S4", boPhanId: bp.id, giao: H.id, xong: true },
		],
	});
	const { plan: P2 } = await gieoKeHoach({
		camTrich: H.id,
		buoc: [
			{ nhan: "S2", boPhanId: bp.id, giao: H.id },
			{ nhan: "S3", boPhanId: bp.id, giao: H.id },
			{ nhan: "S6", boPhanId: bp.id, giao: X.id },
		],
	});
	const { plan: P3 } = await gieoKeHoach({
		camTrich: H.id,
		dong: true,
		buoc: [{ nhan: "S5", boPhanId: bp.id, giao: H.id }],
	});
	const buoc = async (planId: string, nhan: string) => {
		const hang = await db.onboardingStep.findFirst({
			where: { planId, label: nhan },
		});
		if (hang === null) throw new Error(`khong co buoc ${nhan}`);
		return hang;
	};
	return {
		Q,
		H,
		T,
		X,
		P1,
		P2,
		P3,
		S: {
			S1: await buoc(P1.id, "S1"),
			S2: await buoc(P2.id, "S2"),
			S3: await buoc(P2.id, "S3"),
			S4: await buoc(P1.id, "S4"),
			S5: await buoc(P3.id, "S5"),
			S6: await buoc(P2.id, "S6"),
		},
	};
}

async function chup(planIds: string[]) {
	const keHoach = await db.onboardingPlan.findMany({
		where: { id: { in: planIds } },
		select: { id: true, ownerId: true },
		orderBy: { id: "asc" },
	});
	const buoc = await db.onboardingStep.findMany({
		where: { planId: { in: planIds } },
		select: { id: true, assigneeId: true },
		orderBy: { id: "asc" },
	});
	const soVet = await db.activity.count({
		where: { planId: { in: planIds } },
	});
	return { keHoach, buoc, soVet };
}

describe("chuyen-giao-dung-viec", () => {
	test("chuyen-giao-dung-viec: doi dung ke hoach dang chay va buoc chua xong, vet moi dong", async () => {
		const g = await gieoChuyenGiao();
		const ids = [g.P1.id, g.P2.id, g.P3.id];

		const truoc = await noi().transferPreview({ fromUserId: g.H.id }, g.Q.id);
		expect(truoc, "xem truoc mong {2,3}").toEqual({
			keHoach: 2,
			buoc: 3,
			viec: 0,
		});

		const ketQua = await noi().transferWork(
			{ fromUserId: g.H.id, toUserId: g.T.id },
			g.Q.id,
		);
		expect(ketQua, "ket qua bang so xem truoc").toEqual(truoc);

		const owner = async (id: string) =>
			(await db.onboardingPlan.findUniqueOrThrow({ where: { id } })).ownerId;
		const giao = async (id: string) =>
			(await db.onboardingStep.findUniqueOrThrow({ where: { id } })).assigneeId;

		expect(await owner(g.P1.id), "P1 mong T").toBe(g.T.id);
		expect(await owner(g.P2.id), "P2 mong T").toBe(g.T.id);
		expect(await owner(g.P3.id), "P3 da dong phai giu H").toBe(g.H.id);
		const tapT = (
			await db.onboardingStep.findMany({
				where: { planId: { in: ids }, assigneeId: g.T.id },
				select: { id: true },
			})
		)
			.map((b) => b.id)
			.sort();
		expect(tapT, "tap buoc sang T").toEqual(
			[g.S.S1.id, g.S.S2.id, g.S.S3.id].sort(),
		);
		expect(await giao(g.S.S4.id), "S4 da xong phai giu H").toBe(g.H.id);
		expect(await giao(g.S.S5.id), "S5 cua ke hoach da dong phai giu H").toBe(
			g.H.id,
		);
		expect(await giao(g.S.S6.id), "S6 cua X giu nguyen").toBe(g.X.id);

		const vet = await db.activity.findMany({ where: { planId: { in: ids } } });
		const meta = vet.map((v) => ({
			nguoiTao: v.createdById,
			meta: parseOnboardingActivityMeta(v.meta),
		}));
		expect(
			meta.filter((v) => v.meta.kind === "keHoach.doiCamTrich").length,
			"so vet doi cam trich",
		).toBe(2);
		expect(
			meta.filter((v) => v.meta.kind === "buoc.giao").length,
			"so vet buoc.giao",
		).toBe(3);
		expect(
			meta.every((v) => v.nguoiTao === g.Q.id),
			"moi vet do quan tri tao",
		).toBe(true);

		expect(
			await noi().transferPreview({ fromUserId: g.H.id }, g.Q.id),
			"xem truoc sau khi chuyen",
		).toEqual({ keHoach: 0, buoc: 0, viec: 0 });
	});
});

describe("chuyen-giao-chan", () => {
	test("chuyen-giao-chan: bon ca bi chan khong doi gi, ca quan tri dung thi doi", async () => {
		const g = await gieoChuyenGiao();
		const ids = [g.P1.id, g.P2.id, g.P3.id];
		const M = await gieoThanhVien("Thanh Vien Thuong");
		const N = await gieoThanhVien("Khong Co Viec");
		const ngoai = await gieoNguoiNgoai();

		const truoc = await chup(ids);

		const loi403 = await batHttp(
			() => noi().transferWork({ fromUserId: g.H.id, toUserId: g.T.id }, M.id),
			"403 cho thanh vien M",
		);
		expect(loi403.getStatus(), "403 cho thanh vien M").toBe(403);
		expect(await chup(ids)).toEqual(truoc);

		const loiTrung = await batHttp(
			() =>
				noi().transferWork({ fromUserId: g.H.id, toUserId: g.H.id }, g.Q.id),
			"chuyen cho chinh minh",
		);
		expect(loiTrung.getStatus()).toBe(400);
		expect(loiTrung.message).toBe(ONBOARDING.thongDiep.chuyenChoChinhMinh);
		expect(await chup(ids)).toEqual(truoc);

		const loiNgoai = await batHttp(
			() =>
				noi().transferWork({ fromUserId: g.H.id, toUserId: ngoai.id }, g.Q.id),
			"nguoi nhan khong la thanh vien",
		);
		expect(loiNgoai.getStatus()).toBe(400);
		expect(loiNgoai.message).toBe(
			ONBOARDING.thongDiep.khongPhaiThanhVien(ngoai.id),
		);
		expect(await chup(ids)).toEqual(truoc);

		expect(
			await noi().transferWork({ fromUserId: N.id, toUserId: g.T.id }, g.Q.id),
			"N khong co viec",
		).toEqual({ keHoach: 0, buoc: 0, viec: 0 });
		expect(await chup(ids)).toEqual(truoc);

		expect(
			await noi().transferWork(
				{ fromUserId: g.H.id, toUserId: g.T.id },
				g.Q.id,
			),
			"doi chung duong",
		).toEqual({ keHoach: 2, buoc: 3, viec: 0 });
		expect(await chup(ids)).not.toEqual(truoc);
	});
});

describe("chuyen-giao-payload", () => {
	test("chuyen-giao-payload: payload man gui chay that tren may chu", async () => {
		const g = await gieoChuyenGiao();
		const thay = (gia: string) =>
			gia === "NGUOI_DI" ? g.H.id : gia === "NGUOI_NHAN" ? g.T.id : gia;

		const xemTruoc = phanTich(
			transferPreviewInput,
			{ fromUserId: thay(payload.xemTruoc.fromUserId) },
			"transferPreview",
		);
		expect(
			await noi().transferPreview(xemTruoc, g.Q.id),
			"transferPreview: id man gui la id that",
		).toEqual({ keHoach: 2, buoc: 3, viec: 0 });

		const chuyen = phanTich(
			transferWorkInput,
			{
				fromUserId: thay(payload.chuyenGiao.fromUserId),
				toUserId: thay(payload.chuyenGiao.toUserId),
			},
			"transferWork",
		);
		await noi().transferWork(chuyen, g.Q.id);
		expect(
			(await db.onboardingPlan.findUniqueOrThrow({ where: { id: g.P1.id } }))
				.ownerId,
		).toBe(g.T.id);

		expect(
			transferWorkInput.safeParse({
				memberId: "m-x",
				toUserId: g.T.id,
			}).success,
			"transferWork: schema tu choi khoa sai",
		).toBe(false);
	});
});

function tongQuan() {
	return new DashboardService(db, new ConversionService(db));
}

const SO_NGAY_GIEO = [-1, 0, 3, 4] as const;

const LUC_GHIM = [
	{
		khung: "khung-dem",
		nhan: "06:30 VN 23/09, ngay UTC con 22/09",
		luc: new Date("2026-09-22T23:30:00Z"),
		ngay: ["2026-09-22", "2026-09-23", "2026-09-26", "2026-09-27"],
	},
	{
		khung: "khung-ngay",
		nhan: "20:54 VN 22/09, cung ngay UTC",
		luc: new Date("2026-09-22T13:54:00Z"),
		ngay: ["2026-09-21", "2026-09-22", "2026-09-25", "2026-09-26"],
	},
] as const;

describe("ngay-gieo-theo-vn", () => {
	afterEach(() => {
		setSystemTime();
	});

	for (const ca of LUC_GHIM) {
		test(`ngay-gieo-theo-vn: ${ca.khung} ${ca.nhan} — ngayCach la ngay lich VN nhu ngayLich luu`, () => {
			setSystemTime(ca.luc);
			expect(
				SO_NGAY_GIEO.map((k) => ngayCach(k).toISOString()),
				`${ca.khung}: ngayCach(${SO_NGAY_GIEO.join(", ")}) theo ngay lich VN`,
			).toEqual(ca.ngay.map((ngay) => ngayLich.parse(ngay).toISOString()));
		});
	}
});

describe("viec-cua-toi", () => {
	afterEach(() => {
		setSystemTime();
	});

	for (const ca of LUC_GHIM) {
		test(`viec-cua-toi: ${ca.khung} ${ca.nhan} — dung ba buoc qua han, hom nay va trong cua so, o ca hai che do`, async () => {
			setSystemTime(ca.luc);
			await veBaBuoc(ca.khung, ca.ngay.slice(0, 3));
		});
	}
});

async function veBaBuoc(khung: string, ngayBaBuoc: readonly string[]) {
	const [O, A, B] = [
		await gieoThanhVien(),
		await gieoThanhVien(),
		await gieoThanhVien(),
	];
	const bp = await gieoBoPhan();
	const { plan } = await gieoKeHoach({
		camTrich: O.id,
		buoc: [
			{ nhan: "D-1", boPhanId: bp.id, giao: A.id, han: ngayCach(-1) },
			{ nhan: "D", boPhanId: bp.id, giao: A.id, han: ngayCach(0) },
			{ nhan: "D+3", boPhanId: bp.id, giao: A.id, han: ngayCach(3) },
			{ nhan: "D+4", boPhanId: bp.id, giao: A.id, han: ngayCach(4) },
			{
				nhan: "xong",
				boPhanId: bp.id,
				giao: A.id,
				han: ngayCach(-2),
				xong: true,
			},
			{ nhan: "cua B", boPhanId: bp.id, giao: B.id, han: ngayCach(-1) },
		],
	});
	const { plan: dong } = await gieoKeHoach({
		camTrich: O.id,
		dong: true,
		buoc: [{ nhan: "dong", boPhanId: bp.id, giao: A.id, han: ngayCach(-1) }],
	});
	const buoc = await buocCua(plan.id);
	const ma = (nhan: string) => {
		const hang = buoc.find((b) => b.label === nhan);
		if (hang === undefined) throw new Error(`khong co buoc ${nhan}`);
		return hang.id;
	};

	for (const scope of ["me", "everyone"] as const) {
		const { mySteps } = await tongQuan().summary(A.id, { scope });
		const cuaGieo = mySteps.filter(
			(b) => b.planId === plan.id || b.planId === dong.id,
		);
		expect(
			cuaGieo.map((b) => b.stepId),
			`${khung} scope ${scope}: tap va thu tu; ke hoach da dong khong lot vao`,
		).toEqual([ma("D-1"), ma("D"), ma("D+3")]);
		expect(
			cuaGieo.map((b) => b.dueAt),
			`${khung} scope ${scope}: ngay VN cua ba buoc`,
		).toEqual([...ngayBaBuoc]);
		for (const b of cuaGieo) {
			expect(b.company.id).toBe(plan.companyId);
			expect(b.nhan.length).toBeGreaterThan(0);
		}
		const cuaB = (await tongQuan().summary(A.id, { scope })).mySteps.map(
			(b) => b.stepId,
		);
		expect(cuaB, `${khung} scope ${scope}: buoc cua B khong vao`).not.toContain(
			ma("cua B"),
		);
	}

	await db.onboardingStep.update({
		where: { id: ma("D+4") },
		data: { dueAt: ngayCach(3) },
	});
	const sau = (await tongQuan().summary(A.id, { scope: "me" })).mySteps
		.filter((b) => b.planId === plan.id)
		.map((b) => b.stepId);
	expect(
		sau,
		`${khung} doi chung duong: D+4 doi han sang D+3 thi vao`,
	).toContain(ma("D+4"));
}

describe("the-tasks-payload", () => {
	test("the-tasks-payload: payload tich xong cua the Tasks ghi dung buoc, vet mang nguoi giao", async () => {
		const [O, A] = [await gieoThanhVien(), await gieoThanhVien()];
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({
			camTrich: O.id,
			buoc: [
				{ nhan: "S1", boPhanId: bp.id, giao: A.id },
				{ nhan: "S2", boPhanId: bp.id, giao: A.id },
			],
		});
		const [s1, s2] = [
			phan(await buocCua(plan.id), 0),
			phan(await buocCua(plan.id), 1),
		];
		const duLieu = phanTich(
			stepDoneInput,
			{
				...payload.tichXong,
				stepId:
					payload.tichXong.stepId === "BUOC_S2"
						? s2.id
						: payload.tichXong.stepId,
			},
			"setStepDone",
		);

		await dichVu().setStepDone(duLieu, A.id);

		const sau = await buocCua(plan.id);
		expect(phan(sau, 1).completedAt, "S2 mong da xong").not.toBeNull();
		expect(phan(sau, 0).completedAt, "S1 khong bi dong toi").toBeNull();
		expect(phan(sau, 0).id).toBe(s1.id);
		const meta = parseOnboardingActivityMeta(
			phan(await vetCua(plan.id), 0).meta,
		);
		expect(meta).toMatchObject({
			kind: "buoc.xong",
			stepId: s2.id,
			giaoLucXong: A.id,
		});
	});
});

function congTyDichVu(): CompaniesService {
	return new CompaniesService(
		db,
		{} as unknown as AgentTriggerService,
		{ isQueued: async () => false } as unknown as AgentQueueService,
		{} as unknown as FaviconService,
		new ActivityStampService(db),
		{ reportingCurrency: async () => "VND" } as unknown as ConversionService,
		{ valuesFor: async () => [] } as unknown as FieldsService,
	);
}

function locTatCa(q = ""): PlanListInput {
	return {
		q,
		sort: "",
		dir: "asc",
		page: 1,
		pageSize: 100,
		status: "tat-ca",
		boPhan: [],
		nguoiCam: [],
		nguoiGiao: [],
	};
}

describe("ke-hoach-cong-ty", () => {
	test("ke-hoach-cong-ty: dung ke hoach cua K, dang chay truoc, dong dung hang cua danh muc", async () => {
		const O = await gieoThanhVien("Cam Trich K");
		const bp = await gieoBoPhan();
		const K = await gieoCongTy();
		const L = await gieoCongTy();
		const { plan: P1 } = await gieoKeHoach({
			camTrich: O.id,
			congTyId: K.id,
			batDau: new Date(Date.now() - DAY_MS),
			buoc: [
				{ nhan: "Ky hop dong", boPhanId: bp.id, xong: true },
				{ nhan: "Dao tao", boPhanId: bp.id },
			],
		});
		const { plan: P0 } = await gieoKeHoach({
			camTrich: O.id,
			congTyId: K.id,
			batDau: new Date(Date.now() - 10 * DAY_MS),
			buoc: [{ nhan: "Kickoff", boPhanId: bp.id }],
		});
		const { plan: P2 } = await gieoKeHoach({
			camTrich: O.id,
			congTyId: K.id,
			dong: true,
			batDau: new Date(),
			buoc: [{ nhan: "Cu", boPhanId: bp.id, xong: true }],
		});
		const { plan: P3 } = await gieoKeHoach({
			camTrich: O.id,
			congTyId: L.id,
			buoc: [{ nhan: "L", boPhanId: bp.id }],
		});

		expect((await congTyDichVu().byId(K.id)).soKeHoach, "soKeHoach cua K").toBe(
			3,
		);

		const input = phanTich(
			plansOfCompanyInput,
			{
				companyId:
					payload.keHoachCongTy.companyId === "CONG_TY_K"
						? K.id
						: payload.keHoachCongTy.companyId,
			},
			"plansOfCompany",
		);
		const hang = await noi().plansOfCompany(input);
		expect(
			hang.map((h) => h.id),
			`thu tu mong [P1, P0, P2]; P3 la ke hoach cua cong ty L; P2 da dong phai dung sau`,
		).toEqual([P1.id, P0.id, P2.id]);
		expect(hang.map((h) => h.id)).not.toContain(P3.id);

		const danhMuc = await dichVu().listPlans(locTatCa(K.name));
		const hangDanhMuc = danhMuc.rows.find((h) => h.id === P1.id);
		const hangTab = phan(hang, 0);
		expect(hangDanhMuc, "P1 co trong danh muc").toBeDefined();
		const chon = (h: PlanListRow | undefined) => ({
			ngayThu: h?.ngayThu,
			buocXong: h?.buocXong,
			buocTong: h?.buocTong,
			tacO: h?.tacO,
			ownerId: h?.ownerId,
		});
		expect(chon(hangTab), "tung truong khop hang danh muc").toEqual(
			chon(hangDanhMuc),
		);
		expect(hangTab.ownerName).toBe("Cam Trich K");
	});

	test("ke-hoach-cong-ty: co xuong co khuon theo so khuon chua luu tru", async () => {
		const K = await gieoCongTy();
		const khuon = await db.onboardingTemplate.findMany({
			select: { id: true, archivedAt: true },
		});
		const moi = await db.onboardingTemplate.create({
			data: { name: `mpkh-khuon-${Date.now()}`, steps: [] },
		});
		try {
			await db.onboardingTemplate.updateMany({
				where: { archivedAt: null },
				data: { archivedAt: new Date() },
			});
			expect(
				(await congTyDichVu().byId(K.id)).xuongCoKhuon,
				"luu tru moi khuon thi xuongCoKhuon false",
			).toBe(false);
			await db.onboardingTemplate.update({
				where: { id: moi.id },
				data: { archivedAt: null },
			});
			expect(
				(await congTyDichVu().byId(K.id)).xuongCoKhuon,
				"khoi phuc mot khuon thi true",
			).toBe(true);
		} finally {
			for (const k of khuon) {
				await db.onboardingTemplate.update({
					where: { id: k.id },
					data: { archivedAt: k.archivedAt },
				});
			}
			await db.onboardingTemplate.delete({ where: { id: moi.id } });
		}
	});
});

describe("ke-hoach-ca-nhan", () => {
	test("ke-hoach-ca-nhan: chi ke hoach dang chay, mang bac da dat", async () => {
		const O = await gieoThanhVien();
		const bp = await gieoBoPhan();
		const { plan: P1, congTyId } = await gieoKeHoach({
			camTrich: O.id,
			buoc: [{ nhan: "B", boPhanId: bp.id }],
		});
		const { plan: P2 } = await gieoKeHoach({
			camTrich: O.id,
			dong: true,
			buoc: [{ nhan: "B", boPhanId: bp.id }],
		});
		const C = await gieoCaNhan(congTyId);
		const D = await gieoCaNhan(congTyId);
		await db.onboardingEnrollment.create({
			data: {
				planId: P1.id,
				contactId: C.id,
				source: "tay",
				accountAt: new Date(),
			},
		});
		await db.onboardingEnrollment.create({
			data: { planId: P2.id, contactId: C.id, source: "tay" },
		});
		const thay = (id: string) =>
			phanTich(
				plansOfContactInput,
				{
					contactId:
						payload.keHoachCaNhan.contactId === "CA_NHAN_C"
							? id
							: payload.keHoachCaNhan.contactId,
				},
				"plansOfContact",
			);
		const congTy = await db.company.findUniqueOrThrow({
			where: { id: congTyId },
		});

		expect(
			await noi().plansOfContact(thay(C.id)),
			"C mong dung mot dong; P2 da dong",
		).toEqual([{ planId: P1.id, companyName: congTy.name, bac: "accountAt" }]);
		expect(await noi().plansOfContact(thay(D.id)), "D khong ghi danh").toEqual(
			[],
		);

		await db.onboardingEnrollment.update({
			where: { planId_contactId: { planId: P1.id, contactId: C.id } },
			data: { courseAt: new Date() },
		});
		expect(phan(await noi().plansOfContact(thay(C.id)), 0).bac).toBe(
			"courseAt",
		);
	});
});

async function gieoBonKeHoach() {
	const moc = token();
	const O = await gieoThanhVien("Cam Trich");
	const A = await gieoThanhVien("An Nguoi Giao");
	const B = await gieoThanhVien("Binh Nguoi Giao");
	const bp = await gieoBoPhan();
	const congTy = async (ten: string) =>
		(await db.company.create({ data: { name: `${moc}-${ten}` } })).id;
	const { plan: P1 } = await gieoKeHoach({
		camTrich: O.id,
		congTyId: await congTy("P1"),
		buoc: [{ nhan: "a", boPhanId: bp.id, giao: A.id }],
	});
	const { plan: P2 } = await gieoKeHoach({
		camTrich: O.id,
		congTyId: await congTy("P2"),
		buoc: [
			{ nhan: "a", boPhanId: bp.id, giao: A.id },
			{ nhan: "b", boPhanId: bp.id, giao: B.id },
		],
	});
	const { plan: P3 } = await gieoKeHoach({
		camTrich: O.id,
		congTyId: await congTy("P3"),
		buoc: [
			{ nhan: "a xong", boPhanId: bp.id, giao: A.id, xong: true },
			{ nhan: "chua giao", boPhanId: bp.id },
		],
	});
	const { plan: P4 } = await gieoKeHoach({
		camTrich: O.id,
		congTyId: await congTy("P4"),
		buoc: [{ nhan: "xong", boPhanId: bp.id, giao: A.id, xong: true }],
	});
	return { moc, A, B, P1, P2, P3, P4 };
}

describe("loc-nguoi-giao-db", () => {
	test("loc-nguoi-giao-db: loc theo nguoi co buoc chua xong, dem bo loc dung", async () => {
		const g = await gieoBonKeHoach();
		const tap = async (nguoiGiao: string[]) =>
			(await dichVu().listPlans({ ...locTatCa(g.moc), nguoiGiao })).rows
				.map((h) => h.id)
				.sort();

		expect(await tap([g.A.id]), "loc A: P3 chi co buoc da xong cua A").toEqual(
			[g.P1.id, g.P2.id].sort(),
		);
		expect(await tap([g.B.id]), "loc B").toEqual([g.P2.id]);
		expect(await tap([]), "khong loc").toEqual(
			[g.P1.id, g.P2.id, g.P3.id, g.P4.id].sort(),
		);
		const dem = (await dichVu().listPlans(locTatCa(g.moc))).facetCounts
			.nguoiGiao;
		expect(dem?.[g.A.id], "dem A").toBe(2);
		expect(dem?.[g.B.id], "dem B").toBe(1);
	});
});

describe("cot-nguoi-giao", () => {
	test("cot-nguoi-giao: moi nguoi mot cot, chua giao va xong o cuoi", async () => {
		const g = await gieoBonKeHoach();
		const chia = async () => {
			const kq = await dichVu().bangCot({
				...locTatCa(g.moc),
				cachChia: "nguoi-giao",
			});
			return new Map(
				kq.cot.map((c) => [c.khoa, c.the.map((t) => t.planId).sort()]),
			);
		};
		const cot = await chia();
		expect(cot.get(g.A.id), "cot A").toEqual([g.P1.id, g.P2.id].sort());
		expect(cot.get(g.B.id), "cot B: P2 phai co o cot B").toEqual([g.P2.id]);
		expect(cot.get("chua-giao"), "cot chua giao").toEqual([g.P3.id]);
		expect(cot.get(""), "cot xong").toEqual([g.P4.id]);
		expect(
			[...cot.values()].reduce((tong, the) => tong + the.length, 0),
			"tong the 5 tren 4 ke hoach",
		).toBe(5);

		const buocP3 = await db.onboardingStep.findFirstOrThrow({
			where: { planId: g.P3.id, label: "chua giao" },
		});
		await db.onboardingStep.update({
			where: { id: buocP3.id },
			data: { assigneeId: g.B.id },
		});
		const sau = await chia();
		expect(sau.get("chua-giao"), "P3 roi cot chua giao").toBeUndefined();
		expect(sau.get(g.B.id)).toEqual([g.P2.id, g.P3.id].sort());
	});
});
