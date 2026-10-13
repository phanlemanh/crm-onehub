import { afterAll, describe, expect, it } from "bun:test";
import { db, type Prisma, TrangThaiViec } from "@crm/db";
import {
	DIRECT_KINDS,
	KHONG_VAO_LAN_NGHIEN_CUU,
	TASK_KINDS,
} from "@crm/db/agent-tasks";
import { hanTheoNgayVN, VIEC } from "@crm/db/viec";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	LOAI_VIEC_MA_LECH,
	MA_NEN_TANG_KEY,
	onboardingIdentifyPayload,
} from "@crm/validation/onboarding-identify";
import { runDirect } from "../agent/lib/dispatch";
import { claimDue, type LeasedTask } from "../agent/lib/tasks";

const LY_DO = "dieu-phoi-va-test";
const UU_TIEN = 2_000_000;
const MACH_LIEN = "dpv-mach-lien-";

let dem = 0;
const da = {
	nguoi: [] as string[],
	congTy: [] as string[],
	keHoach: [] as string[],
	caNhan: [] as string[],
	viec: [] as string[],
};

function duy(tien: string): string {
	dem += 1;
	return `${tien}-${Date.now()}-${dem}`;
}

async function gieoKeHoach(dong = false) {
	const nguoi = await db.user.create({
		data: {
			id: duy("u"),
			name: "Nguoi cam trich",
			email: `${duy("e")}@thu.test`,
		},
	});
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		update: {},
		create: {
			id: WORKSPACE_ID,
			name: "CRM",
			slug: "crm",
			createdAt: new Date(),
		},
	});
	await db.member.create({
		data: {
			id: duy("m"),
			organizationId: WORKSPACE_ID,
			userId: nguoi.id,
			role: "member",
			createdAt: new Date(0),
		},
	});
	const congTy = await db.company.create({ data: { name: duy("Cong ty") } });
	const keHoach = await db.onboardingPlan.create({
		data: {
			companyId: congTy.id,
			ownerId: nguoi.id,
			startedAt: new Date(),
			targetDays: 30,
			closedAt: dong ? new Date() : null,
		},
	});
	da.nguoi.push(nguoi.id);
	da.congTy.push(congTy.id);
	da.keHoach.push(keHoach.id);
	return keHoach;
}

async function gieoViec(
	payload: Prisma.InputJsonValue,
	kind = LOAI_VIEC_MA_LECH,
) {
	const viec = await db.agentTask.create({
		data: {
			kind,
			reason: LY_DO,
			dueAt: new Date(Date.now() - 1000),
			priority: UU_TIEN,
			budget: 2,
			payload,
		},
	});
	da.viec.push(viec.id);
	return viec;
}

function hopLe(planId: string, ma: string): Prisma.InputJsonValue {
	return onboardingIdentifyPayload.parse({ planId, platformBrokerId: ma });
}

function leased(viec: {
	id: string;
	kind: string;
	reason: string;
	payload: Prisma.JsonValue | null;
	budget: number;
	attempts: number;
	priority: number;
	dueAt: Date;
}): LeasedTask {
	return {
		id: viec.id,
		contactId: null,
		companyId: null,
		dealId: null,
		kind: viec.kind,
		reason: viec.reason,
		payload: viec.payload,
		budget: viec.budget,
		attempts: viec.attempts,
		priority: viec.priority,
		dueAt: viec.dueAt,
	};
}

async function chay(viecId: string) {
	const viec = await db.agentTask.findUniqueOrThrow({ where: { id: viecId } });
	await runDirect(leased(viec));
	return db.agentTask.findUniqueOrThrow({
		where: { id: viecId },
		select: { finishedAt: true, outcome: true, sessionId: true },
	});
}

async function viecMo(planId: string) {
	return db.viec.findMany({
		where: {
			gan: { some: { planId } },
			trangThai: { notIn: [TrangThaiViec.XONG, TrangThaiViec.HUY] },
		},
		select: {
			id: true,
			nguoiGiaoId: true,
			nguoiThucHienId: true,
			hanNgay: true,
			tieuDe: true,
			khoaNguon: true,
		},
	});
}

async function truongMa(): Promise<string> {
	const co = await db.fieldDefinition.findUnique({
		where: { entity_key: { entity: "CONTACT", key: MA_NEN_TANG_KEY } },
		select: { id: true },
	});
	if (co) return co.id;
	const moi = await db.fieldDefinition.create({
		data: {
			entity: "CONTACT",
			key: MA_NEN_TANG_KEY,
			label: "Mã môi giới trên nền tảng",
			type: "TEXT",
			agentFilled: false,
			position: 9999,
		},
		select: { id: true },
	});
	return moi.id;
}

afterAll(async () => {
	await db.viec.deleteMany({ where: { taoBoiId: { in: da.nguoi } } });
	await db.member.deleteMany({ where: { userId: { in: da.nguoi } } });
	await db.agentTask.deleteMany({ where: { id: { in: da.viec } } });
	await db.onboardingPlan.deleteMany({ where: { id: { in: da.keHoach } } });
	await db.company.deleteMany({ where: { id: { in: da.congTy } } });
	await db.contact.deleteMany({ where: { id: { in: da.caNhan } } });
	await db.user.deleteMany({ where: { id: { in: da.nguoi } } });
});

describe("ma-lech", () => {
	it("onboarding-identify o lan truc tiep, ra mot viec cua nguoi cam trich", async () => {
		expect(
			TASK_KINDS.includes(LOAI_VIEC_MA_LECH),
			"onboarding-identify khong o TASK_KINDS",
		).toBe(true);
		expect(
			(DIRECT_KINDS as readonly string[]).includes(LOAI_VIEC_MA_LECH),
			"onboarding-identify khong o lan truc tiep",
		).toBe(true);

		const keHoach = await gieoKeHoach();
		const ma = duy("mg-lech");
		const caNhan = await db.contact.create({
			data: { firstName: duy("Ca nhan") },
		});
		da.caNhan.push(caNhan.id);
		const viec = await gieoViec(hopLe(keHoach.id, ma));
		const doiChung = await db.agentTask.create({
			data: {
				kind: "identify",
				reason: LY_DO,
				dueAt: new Date(Date.now() - 1000),
				priority: UU_TIEN,
				budget: 2,
				contactId: caNhan.id,
			},
		});
		da.viec.push(doiChung.id);

		const nghienCuu = await claimDue(1, { except: KHONG_VAO_LAN_NGHIEN_CUU });
		expect(
			nghienCuu.map((t) => t.id),
			"lan nghien cuu khong nhan viec hop le cua no",
		).toContain(doiChung.id);
		expect(
			nghienCuu.map((t) => t.id),
			"lan nghien cuu nhan onboarding-identify",
		).not.toContain(viec.id);

		const truoc = Date.now();
		const xong = await chay(viec.id);
		const sau = Date.now();

		const mo = await viecMo(keHoach.id);
		expect(mo.length).toBe(1);
		const [mot] = mo;
		expect(mot?.nguoiGiaoId).toBe(keHoach.ownerId);
		expect(mot?.nguoiThucHienId).toBe(keHoach.ownerId);
		const hanDung = [
			hanTheoNgayVN(new Date(truoc)).getTime(),
			hanTheoNgayVN(new Date(sau)).getTime(),
		];
		expect(hanDung).toContain(mot?.hanNgay?.getTime() ?? -1);
		expect(mot?.tieuDe.includes(ma)).toBe(true);
		expect(mot?.khoaNguon).toBe(VIEC.khoaMaLech(ma));
		expect(xong.finishedAt === null).toBe(false);
		expect(xong.outcome).toContain("đã giao việc cho người cầm trịch");
		expect(
			xong.sessionId,
			"lan truc tiep mo phien nghien cuu cho onboarding-identify",
		).toBe(null);
	});
});

describe("khong-trung", () => {
	it("cung ke hoach + ma khi viec cu con mo thi khong giao them", async () => {
		const keHoach = await gieoKeHoach();
		const khac = await gieoKeHoach();
		const ma = duy("mg-trung");

		await chay((await gieoViec(hopLe(keHoach.id, ma))).id);
		const lan2 = await chay((await gieoViec(hopLe(keHoach.id, ma))).id);
		expect((await viecMo(keHoach.id)).length, "ghi trung viec ma lech").toBe(1);
		expect(lan2.outcome).toContain("không giao trùng");
		expect(lan2.finishedAt === null).toBe(false);

		await db.viec.updateMany({
			where: { gan: { some: { planId: keHoach.id } } },
			data: { trangThai: TrangThaiViec.XONG, khepLuc: new Date() },
		});
		await chay((await gieoViec(hopLe(keHoach.id, ma))).id);
		expect(
			await db.viec.count({
				where: { gan: { some: { planId: keHoach.id } } },
			}),
		).toBe(2);
		expect((await viecMo(keHoach.id)).length).toBe(1);

		await chay((await gieoViec(hopLe(khac.id, ma))).id);
		expect((await viecMo(khac.id)).length).toBe(1);
	});
});

describe("dong-som", () => {
	it("ma da khop thi dong viec, khong giao", async () => {
		const keHoach = await gieoKeHoach();
		const ma = duy("mg-khop-muon");
		const caNhan = await db.contact.create({
			data: { firstName: duy("Ca nhan") },
		});
		da.caNhan.push(caNhan.id);
		const fieldId = await truongMa();
		await db.fieldValue.create({
			data: { fieldId, contactId: caNhan.id, text: ma },
		});

		const xong = await chay((await gieoViec(hopLe(keHoach.id, ma))).id);
		expect((await viecMo(keHoach.id)).length, "ghi viec cho ma da khop").toBe(
			0,
		);
		expect(xong.finishedAt === null).toBe(false);
		expect(xong.outcome).toContain("mã đã khớp");
	});

	it("ke hoach da dong thi dong viec, khong giao", async () => {
		const keHoach = await gieoKeHoach(true);
		const xong = await chay(
			(await gieoViec(hopLe(keHoach.id, duy("mg-dong")))).id,
		);
		expect((await viecMo(keHoach.id)).length).toBe(0);
		expect(xong.finishedAt === null).toBe(false);
		expect(xong.outcome).toContain("kế hoạch đã đóng hoặc không còn");
	});

	it("payload hong thi dong viec kem thong diep parse", async () => {
		const xong = await chay((await gieoViec({ planId: 1 })).id);
		expect(xong.finishedAt === null).toBe(false);
		expect(xong.outcome).toContain("payload onboarding-identify hỏng");
		expect(xong.outcome).toContain("planId");
	});

	it("doi chung: ma van lech, ke hoach mo thi giao mot viec", async () => {
		const keHoach = await gieoKeHoach();
		await chay((await gieoViec(hopLe(keHoach.id, duy("mg-van-lech")))).id);
		expect((await viecMo(keHoach.id)).length).toBe(1);
	});
});

describe.skipIf(process.env.DPV_MACH_LIEN !== "1")("mach-lien-doc", () => {
	it("lan truc tiep nhan dung hang API ghi va giao viec cho tung ma", async () => {
		const hang = await db.agentTask.findMany({
			where: {
				kind: LOAI_VIEC_MA_LECH,
				finishedAt: null,
				payload: { path: ["planId"], string_starts_with: MACH_LIEN },
			},
			select: { id: true, payload: true },
		});
		expect(hang.length, "khong co hang API ghi cho mach lien").toBe(2);
		const planIds = [
			...new Set(hang.map((h) => (h.payload as { planId: string }).planId)),
		];
		expect(planIds.length).toBe(1);
		const planId = planIds[0] ?? "";

		await db.agentTask.updateMany({
			where: { id: { in: hang.map((h) => h.id) } },
			data: { priority: UU_TIEN + 1 },
		});
		const nhan = await claimDue(2, { only: DIRECT_KINDS });
		expect(
			nhan.map((t) => t.id).sort(),
			"lan truc tiep khong nhan hang API ghi",
		).toEqual(hang.map((h) => h.id).sort());

		for (const viec of nhan) await runDirect(viec);

		const mo = await viecMo(planId);
		expect(mo.length).toBe(2);
		const ma = mo.map((v) => v.khoaNguon).sort();
		expect(new Set(ma).size).toBe(2);
		const dong = await db.agentTask.count({
			where: { id: { in: hang.map((h) => h.id) }, finishedAt: { not: null } },
		});
		expect(dong).toBe(2);

		const keHoach = await db.onboardingPlan.findUnique({
			where: { id: planId },
			select: { companyId: true, ownerId: true },
		});
		await db.viec.deleteMany({ where: { gan: { some: { planId } } } });
		await db.agentTask.deleteMany({
			where: { id: { in: hang.map((h) => h.id) } },
		});
		await db.onboardingPlan.deleteMany({ where: { id: planId } });
		if (keHoach) {
			await db.company.deleteMany({ where: { id: keHoach.companyId } });
			await db.member.deleteMany({ where: { userId: keHoach.ownerId } });
			await db.user.deleteMany({ where: { id: keHoach.ownerId } });
		}
	});
});
