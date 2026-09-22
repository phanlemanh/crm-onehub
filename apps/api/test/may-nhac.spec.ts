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
import { parseOnboardingActivityMeta } from "@crm/validation/onboarding-activity";
import { ConversionService } from "../src/currency/conversion.service";
import { DashboardService } from "../src/dashboard/dashboard.service";
import { watchInput } from "../src/onboarding/onboarding.contracts";
import { OnboardingTheoDoi } from "../src/onboarding/onboarding-theo-doi";
import fixture from "./fixtures/may-nhac-payload.json";
import {
	DAY_MS,
	dichVu,
	donDep,
	gieoBoPhan,
	gieoKeHoach,
	gieoThanhVien,
	moXuong,
} from "./support/ke-hoach-gieo";

const LUC_NHAC = new Date("2026-10-10T02:00:00Z");

const IM_NGAY = 8;

const MA_P1 = "KE_HOACH_P1";

const TEN_P1 = "CONG_TY_P1";

const MA_P = "KE_HOACH_P";

function theoDoi(): OnboardingTheoDoi {
	return new OnboardingTheoDoi(db);
}

function tongQuan(): DashboardService {
	return new DashboardService(db, new ConversionService(db));
}

async function hangTheoDoi(planId: string) {
	const hang = await db.onboardingWatch.findMany({ where: { planId } });
	return hang.map((h) => `${h.planId}:${h.userId}`);
}

async function vetTheoDoi(planId: string) {
	const hang = await db.activity.findMany({
		where: { planId },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
	});
	return hang.map((h) => ({
		kind: parseOnboardingActivityMeta(h.meta).kind,
		createdById: h.createdById,
	}));
}

async function gieoAc8() {
	const O = await gieoThanhVien("Oanh");
	const W = await gieoThanhVien("Vy");
	const X = await gieoThanhVien("Xuan");
	const bp = await gieoBoPhan();
	setSystemTime(LUC_NHAC);
	const truoc = await tongQuan().summary(O.id, { scope: "me" });
	setSystemTime();
	const { plan } = await gieoKeHoach({
		camTrich: O.id,
		batDau: new Date("2026-09-27T00:00:00+07:00"),
		buoc: [
			{
				nhan: "Ky hop dong",
				boPhanId: bp.id,
				giao: W.id,
				xong: true,
				han: new Date("2026-10-01T00:00:00Z"),
			},
			{
				nhan: "Dao tao",
				boPhanId: bp.id,
				han: new Date("2026-10-20T00:00:00Z"),
			},
			{
				nhan: "Kich hoat",
				boPhanId: bp.id,
				giao: X.id,
				han: new Date("2026-10-25T00:00:00Z"),
			},
		],
	});
	await db.onboardingStep.updateMany({
		where: { planId: plan.id },
		data: { updatedAt: new Date(LUC_NHAC.getTime() - IM_NGAY * DAY_MS) },
	});
	await db.onboardingWatch.create({ data: { planId: plan.id, userId: W.id } });
	const congTy = await db.company.findUniqueOrThrow({
		where: { id: plan.companyId },
	});
	return { O, W, X, P1: plan, tenP1: congTy.name, truoc };
}

async function keHoachCanDeY(userId: string) {
	setSystemTime(LUC_NHAC);
	const { keHoachCanDeY } = await tongQuan().summary(userId, { scope: "me" });
	return keHoachCanDeY;
}

type MucCanDeY = Awaited<ReturnType<typeof keHoachCanDeY>>[number];

type MucSoSanh = Omit<MucCanDeY, "loai" | "soBuocXong" | "soBuocTong"> & {
	loai: string;
	soBuocXong?: number;
	soBuocTong?: number;
};

type ChieuMuc = Pick<MucSoSanh, "loai" | "planId" | "companyName"> & {
	coGoiY: boolean;
	soBuocXong?: number;
	soBuocTong?: number;
};

function chieu(ds: MucCanDeY[]): ChieuMuc[] {
	return ds.map(
		({ loai, planId, companyName, goiY, soBuocXong, soBuocTong }) => ({
			loai,
			planId,
			companyName,
			coGoiY: goiY.length > 0,
			soBuocXong,
			soBuocTong,
		}),
	);
}

beforeAll(moXuong);
afterEach(() => {
	setSystemTime();
});
afterAll(donDep);

describe("theo-doi", () => {
	test("theo-doi: bat hai lan roi tat, doc lai hang, vet va planById sau moi buoc", async () => {
		const O = await gieoThanhVien("Oanh");
		const W = await gieoThanhVien("Vy");
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({
			camTrich: O.id,
			buoc: [{ nhan: "S1", boPhanId: bp.id }],
		});
		const buoc = async () => {
			const chiTiet = await dichVu().planById({ id: plan.id }, W.id);
			return {
				hang: await hangTheoDoi(plan.id),
				vet: await vetTheoDoi(plan.id),
				dangTheoDoi: chiTiet.dangTheoDoi,
				nguoiTheoDoi: chiTiet.nguoiTheoDoi,
			};
		};

		await theoDoi().bat({ planId: plan.id }, W.id);
		expect(await buoc(), "bat lan dau: mot hang, mot vet cua W").toEqual({
			hang: [`${plan.id}:${W.id}`],
			vet: [{ kind: "theoDoi.bat", createdById: W.id }],
			dangTheoDoi: true,
			nguoiTheoDoi: [{ id: W.id, name: W.name }],
		});

		await theoDoi().bat({ planId: plan.id }, W.id);
		expect(await buoc(), "bat lan hai khong ghi vet thu hai").toEqual({
			hang: [`${plan.id}:${W.id}`],
			vet: [{ kind: "theoDoi.bat", createdById: W.id }],
			dangTheoDoi: true,
			nguoiTheoDoi: [{ id: W.id, name: W.name }],
		});

		await theoDoi().tat({ planId: plan.id }, W.id);
		expect(await buoc(), "tat: khong con hang, them vet tat").toEqual({
			hang: [],
			vet: [
				{ kind: "theoDoi.bat", createdById: W.id },
				{ kind: "theoDoi.tat", createdById: W.id },
			],
			dangTheoDoi: false,
			nguoiTheoDoi: [],
		});
	});
});

describe("tong-quan", () => {
	let g: Awaited<ReturnType<typeof gieoAc8>>;

	beforeAll(async () => {
		g = await gieoAc8();
	});

	test("tong-quan: O va W thay dung im va moc cua P1", async () => {
		const [cuaO, cuaW] = [
			await keHoachCanDeY(g.O.id),
			await keHoachCanDeY(g.W.id),
		];
		const buoc = await db.onboardingStep.findMany({
			where: { planId: g.P1.id },
		});
		const chung = { planId: g.P1.id, companyName: g.tenP1, coGoiY: true };
		const mong = [
			{ ...chung, loai: "ke-hoach-im" },
			{
				...chung,
				loai: "moc-ngay",
				soBuocXong: buoc.filter((b) => b.completedAt !== null).length,
				soBuocTong: buoc.length,
			},
		];

		expect(
			{ O: chieu(cuaO), W: chieu(cuaW) },
			"O va W: dung im va moc cua P1, moi muc mang ma, ten cong ty, goi y",
		).toEqual({ O: mong, W: mong });
	});

	test("tong-quan: X khong lien quan khong co muc", async () => {
		expect(
			await keHoachCanDeY(g.X.id),
			"X khong lien quan thi khong co muc",
		).toEqual([]);
	});

	test("tong-quan: mySteps cua O khong doi khi co P1", async () => {
		setSystemTime(LUC_NHAC);
		expect(
			(await tongQuan().summary(g.O.id, { scope: "me" })).mySteps,
			"mySteps cua O khong doi khi co P1",
		).toEqual(g.truoc.mySteps);
	});
});

function chuanHoa(
	ds: MucCanDeY[],
	g: Awaited<ReturnType<typeof gieoAc8>>,
): MucSoSanh[] {
	return ds.map((m) => ({
		...m,
		planId: m.planId === g.P1.id ? MA_P1 : m.planId,
		companyName: m.companyName === g.tenP1 ? TEN_P1 : m.companyName,
	}));
}

describe("payload", () => {
	let g: Awaited<ReturnType<typeof gieoAc8>>;

	beforeAll(async () => {
		g = await gieoAc8();
	});

	test("payload: keHoachCanDeY that cua O bang fixture the Tasks", async () => {
		const that = chuanHoa(await keHoachCanDeY(g.O.id), g);
		expect(that, "fixture the Tasks khop dau ra that").toEqual(
			fixture.keHoachCanDeY,
		);
	});
});

describe("payload-theo-doi", () => {
	test("payload-theo-doi: payload man gui qua schema watch roi ghi dung mot hang", async () => {
		const O = await gieoThanhVien("Oanh");
		const W = await gieoThanhVien("Vy");
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({
			camTrich: O.id,
			buoc: [{ nhan: "S1", boPhanId: bp.id }],
		});
		const thayMa = (gui: Record<string, string>) =>
			Object.fromEntries(
				Object.entries(gui).map(([k, v]) => [k, v === MA_P ? plan.id : v]),
			);
		const { planId: _bo, ...thieu } = thayMa(fixture.batTheoDoi);

		const tuChoi = watchInput.safeParse(thieu);
		expect(
			{ success: tuChoi.success, hang: await hangTheoDoi(plan.id) },
			"doi chung am: thieu planId thi schema tu choi, 0 hang",
		).toEqual({ success: false, hang: [] });

		const nhan = watchInput.safeParse(thayMa(fixture.batTheoDoi));
		if (nhan.success) await theoDoi().bat(nhan.data, W.id);
		expect(
			{ success: nhan.success, hang: await hangTheoDoi(plan.id) },
			"payload man gui khop schema watch",
		).toEqual({ success: true, hang: [`${plan.id}:${W.id}`] });
	});
});
