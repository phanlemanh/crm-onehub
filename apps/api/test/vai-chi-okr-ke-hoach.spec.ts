import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { KHONG_TRONG_PHAM_VI } from "@crm/auth";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { ONBOARDING } from "../src/onboarding/onboarding-config";
import { OnboardingGhi } from "../src/onboarding/onboarding-ghi";
import { WorkspaceService } from "../src/workspace/workspace.service";
import { WORKSPACE_CONFIG } from "../src/workspace/workspace-config";
import { dangNhap, datMatKhau, goiTrpc } from "./ma-tran-thu";
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
	const plan = await db.onboardingPlan.create({
		data: {
			companyId: congTy.id,
			templateId: khuon.id,
			startedAt: new Date("2026-10-12T00:00:00.000Z"),
			targetDays: 30,
			ownerId: thuong.id,
		},
	});
	await db.onboardingStep.create({
		data: {
			planId: plan.id,
			label: "Buoc mot",
			departmentId: bp.id,
			dueAt: new Date("2026-10-12T00:00:00.000Z"),
			position: 0,
		},
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

const workspace = () =>
	new WorkspaceService(db, {
		workspaceChanged: async () => undefined,
	} as unknown as AgentTriggerService);

async function maMember(userId: string): Promise<string> {
	return (await db.member.findFirstOrThrow({ where: { userId } })).id;
}

async function vaiCua(userId: string): Promise<string> {
	return (await db.member.findFirstOrThrow({ where: { userId } })).role;
}

const demTheoDoi = (userId: string) =>
	db.onboardingWatch.count({ where: { userId } });

describe("vlr-doi-vai", () => {
	test.each([
		["chi-ke-hoach", 1, 0],
		["chi-buoc", 0, 1],
		["hai-ba", 2, 3],
	] as const)(
		"vlr-doi-vai: còn việc %s → 409 nguyên văn, vai và theo dõi giữ nguyên",
		async (bien, soKeHoach, soBuoc) => {
			const qt = await gieoThanhVien("QT VLR", "admin");
			const a = await gieoThanhVien(`A VLR ${bien}`, "member");
			const khac = await gieoThanhVien("Khác VLR", "member");
			const bp = await gieoBoPhan();
			for (let i = 0; i < soKeHoach; i += 1) {
				await gieoKeHoach({ camTrich: a.id, buoc: [] });
			}
			await gieoKeHoach({
				camTrich: khac.id,
				buoc: [
					...Array.from({ length: soBuoc }, () => ({
						nhan: "B",
						boPhanId: bp.id,
						giao: a.id,
					})),
					{ nhan: "Xong", boPhanId: bp.id, giao: a.id, xong: true },
				],
			});
			await gieoKeHoach({
				camTrich: a.id,
				buoc: [{ nhan: "D", boPhanId: bp.id, giao: a.id }],
				dong: true,
			});
			const { plan: theo } = await gieoKeHoach({ camTrich: khac.id, buoc: [] });
			await db.onboardingWatch.create({
				data: { planId: theo.id, userId: a.id },
			});
			const theoTruoc = await demTheoDoi(a.id);
			const ma = await maMember(a.id);
			let loi = "";
			try {
				await workspace().setMemberRole(qt.id, { memberId: ma, role: "okr" });
			} catch (e) {
				loi = e instanceof Error ? e.message : String(e);
			}
			if (loi === "") {
				throw new Error(`vlr: doi vai khi con viec khong bi chan ${bien}`);
			}
			if (loi !== WORKSPACE_CONFIG.messages.conViecKeHoach(soKeHoach, soBuoc)) {
				throw new Error(`vlr: loi doi vai sai ${loi}`);
			}
			if (!loi.includes("Chuyển việc")) {
				throw new Error("vlr: loi doi vai khong chi chuyen viec");
			}
			if ((await vaiCua(a.id)) !== "member") {
				throw new Error("vlr: vai da doi khi bi chan");
			}
			if ((await demTheoDoi(a.id)) !== theoTruoc) {
				throw new Error("vlr: theo doi bi xoa khi bi chan");
			}
		},
	);

	test("vlr-doi-vai: chỉ theo dõi → đổi được, xoá hết; về member giữ; lưu lại okr dọn theo dõi", async () => {
		const qt = await gieoThanhVien("QT2 VLR", "admin");
		const a = await gieoThanhVien("A2 VLR", "member");
		const khac = await gieoThanhVien("Khác2 VLR", "member");
		const { plan: mo } = await gieoKeHoach({ camTrich: khac.id, buoc: [] });
		const { plan: dong } = await gieoKeHoach({
			camTrich: khac.id,
			buoc: [],
			dong: true,
		});
		await db.onboardingWatch.createMany({
			data: [
				{ planId: mo.id, userId: a.id },
				{ planId: dong.id, userId: a.id },
			],
		});
		expect(await demTheoDoi(a.id)).toBe(2);
		await workspace().setMemberRole(qt.id, {
			memberId: await maMember(a.id),
			role: "okr",
		});
		if ((await vaiCua(a.id)) !== "okr") {
			throw new Error("vlr: doi vai khong xong");
		}
		const con = await demTheoDoi(a.id);
		if (con !== 0) throw new Error(`vlr: con theo doi sau doi vai ${con}`);

		const c = await gieoThanhVien("C VLR", "okr");
		await db.onboardingWatch.create({ data: { planId: mo.id, userId: c.id } });
		await workspace().setMemberRole(qt.id, {
			memberId: await maMember(c.id),
			role: "member",
		});
		if ((await demTheoDoi(c.id)) !== 1) {
			throw new Error("vlr: xoa theo doi khi doi sang vai doc doi tac");
		}

		const d = await gieoThanhVien("D VLR", "okr");
		await db.onboardingWatch.create({ data: { planId: mo.id, userId: d.id } });
		await workspace().setMemberRole(qt.id, {
			memberId: await maMember(d.id),
			role: "okr",
		});
		if ((await demTheoDoi(d.id)) !== 0) {
			throw new Error("vlr: luu lai vai okr khong don theo doi");
		}
		const bp = await gieoBoPhan();
		await gieoKeHoach({
			camTrich: khac.id,
			buoc: [{ nhan: "B", boPhanId: bp.id, giao: d.id }],
		});
		let loi = "";
		try {
			await workspace().setMemberRole(qt.id, {
				memberId: await maMember(d.id),
				role: "okr",
			});
		} catch (e) {
			loi = e instanceof Error ? e.message : String(e);
		}
		if (loi !== WORKSPACE_CONFIG.messages.conViecKeHoach(0, 1)) {
			throw new Error(`vlr: luu lai vai okr khi con viec khong bi chan ${loi}`);
		}
	});

	test("vlr-doi-vai: quản trị tự đổi mình khi còn việc → 409; memberId lạ → 404, không xoá theo dõi", async () => {
		const qt = await gieoThanhVien("QT3 VLR", "admin");
		await gieoKeHoach({ camTrich: qt.id, buoc: [] });
		const ma = await maMember(qt.id);
		const loiTu = await nem(
			() => workspace().setMemberRole(qt.id, { memberId: ma, role: "okr" }),
			"vlr: tu doi vai khi con viec khong bi chan",
		);
		expect(loiTu).toBe(WORKSPACE_CONFIG.messages.conViecKeHoach(1, 0));
		const tongTheoDoi = await db.onboardingWatch.count();
		const loiLa = await nem(
			() =>
				workspace().setMemberRole(qt.id, {
					memberId: "vlr-khong-co",
					role: "okr",
				}),
			"vlr: member la khong bi chan",
		);
		expect(loiLa).toBe("That person is not in this workspace.");
		expect(await db.onboardingWatch.count()).toBe(tongTheoDoi);
	});
});

const LOAI_KE_HOACH: readonly string[] = [
	"buoc-qua-han",
	"buoc-sap-han",
	"ke-hoach-im",
	"moc-ngay",
];

describe("vlr-viec-cua-toi", () => {
	let app: NestExpressApplication;

	beforeAll(async () => {
		app = await createApp();
		spyOn(app.get(BackfillService), "auto").mockResolvedValue({
			started: false,
		});
	});

	afterAll(async () => {
		await app.close();
	});

	async function cookieCua(userId: string): Promise<string> {
		await db.user.update({
			where: { id: userId },
			data: { emailVerified: true },
		});
		return dangNhap(await datMatKhau(userId));
	}

	test("vlr-viec-cua-toi: vai okr không thấy việc kế hoạch ở Việc của bạn, bị chặn ở Tổng quan; member thấy bước", async () => {
		const qt = await gieoThanhVien("QT VCT VLR", "admin");
		const okr = await gieoThanhVien("vlr-vct-okr", "member");
		const thuong = await gieoThanhVien("vlr-vct-member", "member");
		const bp = await gieoBoPhan();
		const han = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
		const { plan: keHoachOkr } = await gieoKeHoach({
			camTrich: qt.id,
			buoc: [{ nhan: "B okr", boPhanId: bp.id, han }],
		});
		const { plan: keHoachThuong } = await gieoKeHoach({
			camTrich: qt.id,
			buoc: [{ nhan: "B member", boPhanId: bp.id, han }],
		});
		const buocOkr = await db.onboardingStep.findFirstOrThrow({
			where: { planId: keHoachOkr.id },
		});
		const buocThuong = await db.onboardingStep.findFirstOrThrow({
			where: { planId: keHoachThuong.id },
		});
		await ghi().assignStep({ stepId: buocOkr.id, assigneeId: okr.id }, qt.id);
		await ghi().assignStep(
			{ stepId: buocThuong.id, assigneeId: thuong.id },
			qt.id,
		);
		await doiVai(okr.id, "okr");
		const tenCongTyOkr = (
			await db.company.findUniqueOrThrow({
				where: { id: keHoachOkr.companyId },
			})
		).name;
		const cookieOkr = await cookieCua(okr.id);
		const cookieThuong = await cookieCua(thuong.id);

		const viec = await goiTrpc(app, "okr.viecCuaToi", "query", undefined, {
			cookie: cookieOkr,
		});
		expect(viec.status, JSON.stringify(viec.body)).toBe(200);
		const ds: { loai: string }[] = viec.body?.result?.data?.viec ?? [];
		if (ds.some((m) => LOAI_KE_HOACH.includes(m.loai))) {
			throw new Error("vlr: viec cua toi co ke hoach cho vai okr");
		}
		if (JSON.stringify(viec.body).includes(tenCongTyOkr)) {
			throw new Error("vlr: viec cua toi mang ten doi tac");
		}

		const tq = await goiTrpc(
			app,
			"dashboard.summary",
			"query",
			{},
			{
				cookie: cookieOkr,
			},
		);
		const thanTq = JSON.stringify(tq.body);
		if (tq.status !== 403 || !thanTq.includes(KHONG_TRONG_PHAM_VI)) {
			throw new Error(`vlr: tong quan mo cho vai okr ${tq.status}`);
		}

		const tqThuong = await goiTrpc(
			app,
			"dashboard.summary",
			"query",
			{},
			{
				cookie: cookieThuong,
			},
		);
		const buoc: { stepId: string }[] =
			tqThuong.body?.result?.data?.mySteps ?? [];
		if (!buoc.some((b) => b.stepId === buocThuong.id)) {
			throw new Error(
				`vlr: doi chung tong quan thieu buoc ${tqThuong.status} ${JSON.stringify(tqThuong.body).slice(0, 400)}`,
			);
		}
	});
});
