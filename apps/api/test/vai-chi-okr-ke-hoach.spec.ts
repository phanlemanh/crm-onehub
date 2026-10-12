import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { ONBOARDING } from "../src/onboarding/onboarding-config";
import { OnboardingGhi } from "../src/onboarding/onboarding-ghi";
import {
	dichVu,
	doiVai,
	donDep,
	gieoBoPhan,
	gieoCongTy,
	gieoKeHoach,
	gieoNguoiNgoai,
	gieoThanhVien,
	moXuong,
} from "./support/ke-hoach-gieo";

beforeAll(moXuong);
afterAll(donDep);

const ghi = () => new OnboardingGhi(db);

async function nem(goi: () => Promise<unknown>, ten: string): Promise<string> {
	try {
		await goi();
	} catch (loi) {
		return loi instanceof Error ? loi.message : String(loi);
	}
	throw new Error(ten);
}

async function gieoKhuon() {
	const bp = await gieoBoPhan();
	const khuon = await dichVu().createTemplate({
		name: `khuon ${bp.name}`,
		partnerType: null,
		steps: [
			{ label: "Buoc mot", departmentId: bp.id, position: 0, offsetDays: 0 },
		],
	});
	return { khuon, bp };
}

async function dung() {
	const okr = await gieoThanhVien("Người OKR VLR", "okr");
	const thuong = await gieoThanhVien("Người Thường VLR", "member");
	const quanTri = await gieoThanhVien("Quản Trị VLR", "admin");
	const { khuon, bp } = await gieoKhuon();
	const congTy = await gieoCongTy();
	const plan = await dichVu().createFromTemplate({
		companyId: congTy.id,
		templateId: khuon.id,
		startedAt: new Date("2026-10-12T00:00:00.000Z"),
		ownerId: thuong.id,
	});
	const buoc = await db.onboardingStep.findFirstOrThrow({
		where: { planId: plan.id },
	});
	return { okr, thuong, quanTri, khuon, bp, plan, buoc };
}

describe("vlr-ghi", () => {
	test("vlr-ghi: giao bước cho vai okr bị chặn, không vết; giao cho member được", async () => {
		const f = await dung();
		const vetTruoc = await db.activity.count({ where: { planId: f.plan.id } });
		const loi = await nem(
			() =>
				ghi().assignStep(
					{ stepId: f.buoc.id, assigneeId: f.okr.id },
					f.quanTri.id,
				),
			"vlr: giao buoc cho vai okr khong bi chan",
		);
		if (!loi.includes("Người OKR VLR") || !loi.includes("chỉ OKR")) {
			throw new Error(`vlr: giao buoc cho vai okr khong bi chan ${loi}`);
		}
		const sau = await db.onboardingStep.findUniqueOrThrow({
			where: { id: f.buoc.id },
		});
		if (sau.assigneeId !== null) throw new Error("vlr: buoc da doi nguoi");
		const vetSau = await db.activity.count({ where: { planId: f.plan.id } });
		if (vetSau !== vetTruoc) throw new Error("vlr: co vet khi bi chan");
		const duoc = await ghi().assignStep(
			{ stepId: f.buoc.id, assigneeId: f.thuong.id },
			f.quanTri.id,
		);
		if (duoc.assigneeId !== f.thuong.id) {
			throw new Error("vlr: giao cho member hong");
		}
	});

	test("vlr-ghi: thêm bước và đổi cầm trịch sang vai okr bị chặn", async () => {
		const f = await dung();
		const dem = () => db.onboardingStep.count({ where: { planId: f.plan.id } });
		const truoc = await dem();
		const them = {
			planId: f.plan.id,
			label: "Buoc them",
			departmentId: f.bp.id,
			dueAt: new Date("2026-10-20T00:00:00.000Z"),
		};
		const loiThem = await nem(
			() => ghi().addStep({ ...them, assigneeId: f.okr.id }, f.quanTri.id),
			"vlr: them buoc cho vai okr khong bi chan",
		);
		if (!loiThem.includes("chỉ OKR") || (await dem()) !== truoc) {
			throw new Error(`vlr: them buoc cho vai okr khong bi chan ${loiThem}`);
		}
		const loiCam = await nem(
			() =>
				ghi().setPlanOwner(
					{ planId: f.plan.id, ownerId: f.okr.id },
					f.quanTri.id,
				),
			"vlr: cam trich cho vai okr khong bi chan",
		);
		const plan = await db.onboardingPlan.findUniqueOrThrow({
			where: { id: f.plan.id },
		});
		if (!loiCam.includes("chỉ OKR") || plan.ownerId !== f.thuong.id) {
			throw new Error(`vlr: cam trich cho vai okr khong bi chan ${loiCam}`);
		}
		await ghi().addStep({ ...them, assigneeId: f.thuong.id }, f.quanTri.id);
		expect(await dem()).toBe(truoc + 1);
	});
});

describe("vlr-khuon", () => {
	test("vlr-khuon: tạo từ khuôn chặn cầm trịch vai okr và người ngoài; member được", async () => {
		const f = await dung();
		const ngoai = await gieoNguoiNgoai("vlr-ngoai");
		const congTy = await gieoCongTy();
		const dem = () =>
			db.onboardingPlan.count({ where: { companyId: congTy.id } });
		const vao = (ownerId: string) => ({
			companyId: congTy.id,
			templateId: f.khuon.id,
			startedAt: new Date("2026-10-12T00:00:00.000Z"),
			ownerId,
		});
		const loiOkr = await nem(
			() => dichVu().createFromTemplate(vao(f.okr.id)),
			"vlr: tao tu khuon cho vai okr khong bi chan",
		);
		if (!loiOkr.includes("chỉ OKR") || (await dem()) !== 0) {
			throw new Error(`vlr: tao tu khuon cho vai okr khong bi chan ${loiOkr}`);
		}
		const loiNgoai = await nem(
			() => dichVu().createFromTemplate(vao(ngoai.id)),
			"vlr: tao tu khuon cho nguoi ngoai khong bi chan",
		);
		const loiMong = ONBOARDING.thongDiep.khongPhaiThanhVien(ngoai.id);
		if (loiNgoai !== loiMong || (await dem()) !== 0) {
			throw new Error(
				`vlr: tao tu khuon cho nguoi ngoai khong bi chan ${loiNgoai}`,
			);
		}
		await dichVu().createFromTemplate(vao(f.thuong.id));
		expect(await dem()).toBe(1);
	});
});

describe("vlr-chuyen", () => {
	test("vlr-chuyen: chuyển việc sang vai okr bị chặn", async () => {
		const f = await dung();
		await ghi().assignStep(
			{ stepId: f.buoc.id, assigneeId: f.thuong.id },
			f.quanTri.id,
		);
		const loi = await nem(
			() =>
				ghi().transferWork(
					{ fromUserId: f.thuong.id, toUserId: f.okr.id },
					f.quanTri.id,
				),
			"vlr: chuyen viec sang vai okr khong bi chan",
		);
		const plan = await db.onboardingPlan.findUniqueOrThrow({
			where: { id: f.plan.id },
		});
		const buoc = await db.onboardingStep.findUniqueOrThrow({
			where: { id: f.buoc.id },
		});
		const giuNguyen =
			plan.ownerId === f.thuong.id && buoc.assigneeId === f.thuong.id;
		if (!loi.includes("chỉ OKR") || !giuNguyen) {
			throw new Error(`vlr: chuyen viec sang vai okr khong bi chan ${loi}`);
		}
	});

	test("vlr-chuyen: chuyển việc từ người vai okr (dữ liệu cũ) sang member được", async () => {
		const f = await dung();
		const cu = await gieoThanhVien("Người Cũ VLR", "member");
		const { plan } = await gieoKeHoach({
			camTrich: cu.id,
			buoc: [{ nhan: "B", boPhanId: f.bp.id, giao: cu.id }],
		});
		await doiVai(cu.id, "okr");
		const ket = await ghi().transferWork(
			{ fromUserId: cu.id, toUserId: f.thuong.id },
			f.quanTri.id,
		);
		const sauPlan = await db.onboardingPlan.findUniqueOrThrow({
			where: { id: plan.id },
		});
		const sauBuoc = await db.onboardingStep.findFirstOrThrow({
			where: { planId: plan.id },
		});
		const sang =
			ket.keHoach === 1 &&
			ket.buoc === 1 &&
			sauPlan.ownerId === f.thuong.id &&
			sauBuoc.assigneeId === f.thuong.id;
		if (!sang) {
			throw new Error(
				`vlr: khong chuyen duoc tu vai okr ${JSON.stringify(ket)}`,
			);
		}
	});
});

describe("vlr-danh-sach", () => {
	test("vlr-danh-sach: chỉ owner, admin, member; xếp theo tên rồi email", async () => {
		const chu = await gieoThanhVien("VLR DS A Chủ", "owner");
		const qt = await gieoThanhVien("VLR DS B Quản trị", "admin");
		const tv = await gieoThanhVien("VLR DS C Thành viên", "member");
		const okr = await gieoThanhVien("VLR DS D OKR", "okr");
		const ngoai = await gieoNguoiNgoai("VLR DS E Ngoài");
		const ma = new Set([chu.id, qt.id, tv.id, okr.id, ngoai.id]);
		const ds = (await dichVu().nguoiNhanViec()).filter((u) => ma.has(u.id));
		const thay = ds.map((u) => u.id);
		if (JSON.stringify(thay) !== JSON.stringify([chu.id, qt.id, tv.id])) {
			throw new Error(
				`vlr: danh sach nguoi nhan viec sai ${JSON.stringify(thay)}`,
			);
		}
		expect(ds.map((u) => Object.keys(u).sort().join(","))).toEqual(
			Array(3).fill("email,id,image,name"),
		);
	});
});
