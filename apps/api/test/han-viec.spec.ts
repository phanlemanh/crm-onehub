import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { ActivityType, db } from "@crm/db";
import { dauNgayVN, NHAC } from "@crm/db/onboarding-nhac";
import { ConversionService } from "../src/currency/conversion.service";
import { DashboardService } from "../src/dashboard/dashboard.service";
import { ngayLich } from "../src/onboarding/onboarding.contracts";
import { ONBOARDING } from "../src/onboarding/onboarding-config";
import fixture from "./fixtures/han-viec-payload.json";
import {
	DAY_MS,
	donDep,
	gieoBoPhan,
	gieoCongTy,
	gieoKeHoach,
	gieoThanhVien,
	moXuong,
	phan,
} from "./support/ke-hoach-gieo";

const LUC_GIUA = new Date("2026-09-22T13:54:00Z");

const LUC_CUOI = new Date("2026-09-22T16:59:00Z");

const LUC_SAU = new Date("2026-09-22T17:30:00Z");

const HOM_NAY = "2026-09-22";

const GIO_MS = 60 * 60 * 1000;

const GIO_T3 = 14;

const TEN_A = "An Nguyen";

const TEN_B = "Binh Tran";

const MA_CONG_TY = "CONG_TY";

const MA_NGUOI = { A: "NGUOI_A", B: "NGUOI_B" } as const;

const MA_VIEC = { T2: "VIEC_T2", U: "VIEC_U" } as const;

type CheDo = "me" | "everyone";

type BanGhiNoi = { id: string; name: string };

type ViecPayload = {
	id: string;
	subject: string | null;
	createdBy: BanGhiNoi;
	company: BanGhiNoi | null;
	deal: BanGhiNoi | null;
};

type TongQuanPayload = { scope: string; overdueTasks: ViecPayload[] };

type Payload = { me: TongQuanPayload; team: TongQuanPayload };

type MaBuoc = { S3: string; S4: string; S5: string };

function tongQuan(): DashboardService {
	return new DashboardService(db, new ConversionService(db));
}

async function tongQuanLuc(luc: Date, userId: string, scope: CheDo) {
	setSystemTime(luc);
	return tongQuan().summary(userId, { scope });
}

type TongQuan = Awaited<ReturnType<typeof tongQuanLuc>>;

function ngayCong(ngay: string, soNgay: number): string {
	return new Date(Date.parse(`${ngay}T00:00:00Z`) + soNgay * DAY_MS)
		.toISOString()
		.slice(0, 10);
}

async function taoViec(
	userId: string,
	congTyId: string,
	subject: string,
	han: Date | null,
) {
	return db.activity.create({
		data: {
			type: ActivityType.TASK,
			subject,
			occurredAt: new Date(),
			dueAt: han,
			companyId: congTyId,
			createdById: userId,
		},
		select: { id: true },
	});
}

async function gieoNamViec() {
	const A = await gieoThanhVien(TEN_A);
	const congTy = await gieoCongTy();
	const homNay = dauNgayVN(LUC_GIUA);
	const truoc = (soNgay: number) =>
		dauNgayVN(new Date(LUC_GIUA.getTime() - soNgay * DAY_MS));
	const T1 = await taoViec(A.id, congTy.id, "T1", homNay);
	const T2 = await taoViec(A.id, congTy.id, "T2", truoc(1));
	const T3 = await taoViec(
		A.id,
		congTy.id,
		"T3",
		new Date(homNay.getTime() + GIO_T3 * GIO_MS),
	);
	const T4 = await taoViec(A.id, congTy.id, "T4", truoc(2));
	await db.activity.update({
		where: { id: T4.id },
		data: { completedAt: new Date() },
	});
	const T5 = await taoViec(A.id, congTy.id, "T5", null);
	return { A, T1, T2, T3, T4, T5 };
}

async function gieoCaDoi() {
	const A = await gieoThanhVien(TEN_A);
	const B = await gieoThanhVien(TEN_B);
	const congTy = await gieoCongTy();
	const homQua = dauNgayVN(new Date(LUC_GIUA.getTime() - DAY_MS));
	const T2 = await taoViec(A.id, congTy.id, "T2", homQua);
	const U = await taoViec(B.id, congTy.id, "U", homQua);
	const bp = await gieoBoPhan();
	const { plan } = await gieoKeHoach({
		camTrich: A.id,
		buoc: [
			{
				nhan: "Buoc qua han",
				boPhanId: bp.id,
				giao: A.id,
				han: ngayLich.parse(ngayCong(HOM_NAY, -2)),
			},
		],
	});
	await db.onboardingStep.updateMany({
		where: { planId: plan.id },
		data: {
			updatedAt: new Date(LUC_GIUA.getTime() - (NHAC.imSauNgay + 1) * DAY_MS),
		},
	});
	return { A, B, T2, U, congTyId: congTy.id };
}

function tapViec(
	ds: { id: string }[],
	gieo: Record<string, { id: string }>,
): string[] {
	const ten = new Map(Object.entries(gieo).map(([k, v]) => [v.id, k]));
	return ds
		.flatMap((v) => {
			const k = ten.get(v.id);
			return k ? [k] : [];
		})
		.sort();
}

beforeAll(moXuong);
afterEach(() => {
	setSystemTime();
});
afterAll(donDep);

describe("qua-han-ngay", () => {
	let g: Awaited<ReturnType<typeof gieoNamViec>>;

	beforeAll(async () => {
		g = await gieoNamViec();
	});

	test("qua-han-ngay: 20:54 VN 22/09, che do Toi, qua han dung T2", async () => {
		const { overdueTasks } = await tongQuanLuc(LUC_GIUA, g.A.id, "me");
		const co = (id: string) => overdueTasks.some((v) => v.id === id);

		expect(co(g.T1.id), "viec han hom nay chua qua han").toBe(false);
		expect(co(g.T2.id), "viec han hom qua da qua han").toBe(true);
		expect(co(g.T3.id), "viec han 14:00 hom nay chua qua han").toBe(false);
		expect(co(g.T4.id), "viec da xong khong qua han").toBe(false);
		expect(co(g.T5.id), "viec khong han khong qua han").toBe(false);
		expect(
			overdueTasks.map((v) => v.id),
			"tap viec qua han bang dung T2",
		).toEqual([g.T2.id]);
	});
});

describe("bien-nua-dem", () => {
	let g: Awaited<ReturnType<typeof gieoNamViec>>;

	beforeAll(async () => {
		g = await gieoNamViec();
	});

	test("bien-nua-dem: 23:59 VN 22/09 van dung T2, 00:30 VN 23/09 la T1 T2 T3", async () => {
		const cuoi = await tongQuanLuc(LUC_CUOI, g.A.id, "me");
		expect(
			tapViec(cuoi.overdueTasks, g),
			"23:59 VN 22/09 thi viec han 22/09 chua qua han",
		).toEqual(["T2"]);

		const sau = await tongQuanLuc(LUC_SAU, g.A.id, "me");
		expect(
			tapViec(sau.overdueTasks, g),
			"00:30 VN 23/09 thi viec han 22/09 da qua han",
		).toEqual(["T1", "T2", "T3"]);
	});
});

describe("ca-doi", () => {
	let g: Awaited<ReturnType<typeof gieoCaDoi>>;

	beforeAll(async () => {
		g = await gieoCaDoi();
	});

	test("ca-doi: Ca doi thay viec cua moi nguoi kem nguoi tao, Toi chi thay cua minh", async () => {
		const gieo = { T2: g.T2, U: g.U };
		const team = await tongQuanLuc(LUC_GIUA, g.A.id, "everyone");
		const me = await tongQuanLuc(LUC_GIUA, g.A.id, "me");
		const tim = (ds: TongQuan["overdueTasks"], id: string) =>
			ds.find((v) => v.id === id);

		expect(
			{
				tap: tapViec(team.overdueTasks, gieo),
				tenU: tim(team.overdueTasks, g.U.id)?.createdBy.name,
				nguoiT2: tim(team.overdueTasks, g.T2.id)?.createdBy.id,
			},
			"ca doi thay viec qua han cua B",
		).toEqual({ tap: ["T2", "U"], tenU: TEN_B, nguoiT2: g.A.id });
		expect(
			tapViec(me.overdueTasks, gieo),
			"che do Toi chi thay viec qua han cua A",
		).toEqual(["T2"]);

		const phanChung = (t: TongQuan) => ({
			mySteps: t.mySteps,
			keHoachCanDeY: t.keHoachCanDeY,
		});
		expect(
			{
				khacRong: [me, team].flatMap((t) => [
					t.mySteps.length > 0,
					t.keHoachCanDeY.length > 0,
				]),
				team: phanChung(team),
			},
			"buoc cua toi va ke hoach can de y khac rong va giong nhau o hai che do",
		).toEqual({ khacRong: [true, true, true, true], team: phanChung(me) });
	});
});

describe("buoc-cua-toi", () => {
	const cuaSo = ONBOARDING.viecCuaToi.cuaSoNgay;
	const han = {
		S3: ngayCong(HOM_NAY, cuaSo),
		S4: ngayCong(HOM_NAY, cuaSo + 1),
		S5: ngayCong(HOM_NAY, cuaSo + 2),
	};
	let A: Awaited<ReturnType<typeof gieoThanhVien>>;
	let ma: MaBuoc;

	beforeAll(async () => {
		A = await gieoThanhVien(TEN_A);
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({
			camTrich: A.id,
			buoc: Object.entries(han).map(([nhan, ngay]) => ({
				nhan,
				boPhanId: bp.id,
				giao: A.id,
				han: ngayLich.parse(ngay),
			})),
		});
		const buoc = await db.onboardingStep.findMany({
			where: { planId: plan.id },
			orderBy: { position: "asc" },
		});
		ma = {
			S3: phan(buoc, 0).id,
			S4: phan(buoc, 1).id,
			S5: phan(buoc, 2).id,
		};
	});

	test("buoc-cua-toi: khung hom nay cong cua so tinh theo ngay VN", async () => {
		const giua = (await tongQuanLuc(LUC_GIUA, A.id, "me")).mySteps;
		const coGiua = (id: string) => giua.some((b) => b.stepId === id);
		expect(
			{ S3: coGiua(ma.S3), S4: coGiua(ma.S4) },
			"20:54 VN 22/09: buoc cua toi co S3, chua co S4",
		).toEqual({ S3: true, S4: false });

		const sau = (await tongQuanLuc(LUC_SAU, A.id, "me")).mySteps;
		const coSau = (id: string) => sau.some((b) => b.stepId === id);
		expect(
			{ S3: coSau(ma.S3), S4: coSau(ma.S4), S5: coSau(ma.S5) },
			"cua so buoc cua toi tinh theo ngay VN",
		).toEqual({ S3: true, S4: true, S5: false });

		expect(
			sau.find((b) => b.stepId === ma.S4)?.dueAt,
			"han cua S4 tra ve theo ngay VN",
		).toBe(han.S4);
	});
});

describe("payload", () => {
	let g: Awaited<ReturnType<typeof gieoCaDoi>>;

	beforeAll(async () => {
		g = await gieoCaDoi();
	});

	function chuanHoa(t: TongQuan): TongQuanPayload {
		const maViec = new Map<string, string>([
			[g.T2.id, MA_VIEC.T2],
			[g.U.id, MA_VIEC.U],
		]);
		const maNguoi = new Map<string, string>([
			[g.A.id, MA_NGUOI.A],
			[g.B.id, MA_NGUOI.B],
		]);
		return {
			scope: t.scope,
			overdueTasks: t.overdueTasks
				.flatMap(({ dueAt: _boThoiGian, ...v }) => {
					const id = maViec.get(v.id);
					return id
						? [
								{
									...v,
									id,
									company:
										v.company?.id === g.congTyId
											? { id: MA_CONG_TY, name: MA_CONG_TY }
											: v.company,
									createdBy: {
										...v.createdBy,
										id: maNguoi.get(v.createdBy.id) ?? v.createdBy.id,
									},
								},
							]
						: [];
				})
				.sort((a, b) => a.id.localeCompare(b.id)),
		};
	}

	test("payload: dashboard.summary that cua A o hai che do bang fixture the Tasks", async () => {
		const mong: Payload = fixture;
		const that: Payload = {
			me: chuanHoa(await tongQuanLuc(LUC_GIUA, g.A.id, "me")),
			team: chuanHoa(await tongQuanLuc(LUC_GIUA, g.A.id, "everyone")),
		};
		expect(that, "fixture the Tasks khop dau ra that").toEqual(mong);
	});
});
