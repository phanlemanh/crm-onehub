import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { ActivityType, db, TrangThaiViec } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { VIEC } from "@crm/db/viec";
import { chepViecCanLam, doiTrangThai } from "@crm/db/viec-ghi";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	LOAI_VIEC_MA_LECH,
	onboardingIdentifyPayload,
} from "@crm/validation/onboarding-identify";
import { LY_DO_MA_LECH, xuLyMaLech } from "../agent/lib/ma-lech";
import type { LeasedTask } from "../agent/lib/tasks";

const TIEN = `cvml${Date.now().toString(36)}`;
let dem = 0;
const da = {
	nguoi: [] as string[],
	congTy: [] as string[],
	viec: [] as string[],
};

function duy(ten: string): string {
	dem += 1;
	return `${TIEN}-${ten}-${dem}`;
}

function hong(dieu: boolean, thongDiep: string): void {
	if (!dieu) throw new Error(thongDiep);
}

async function nguoi(vai: string): Promise<string> {
	const id = duy("u");
	await db.user.create({ data: { id, name: id, email: `${id}@thu.test` } });
	await db.member.create({
		data: {
			id: `m-${id}`,
			organizationId: WORKSPACE_ID,
			userId: id,
			role: vai,
			createdAt: new Date(0),
		},
	});
	da.nguoi.push(id);
	return id;
}

async function keHoach(ownerId: string) {
	const congTy = await db.company.create({ data: { name: duy("cty") } });
	da.congTy.push(congTy.id);
	return db.onboardingPlan.create({
		data: {
			companyId: congTy.id,
			ownerId,
			startedAt: new Date(),
			targetDays: 30,
		},
	});
}

async function chay(planId: string, ma: string, now = new Date()) {
	const payload = onboardingIdentifyPayload.parse({
		planId,
		platformBrokerId: ma,
	});
	const viec = await db.agentTask.create({
		data: {
			kind: LOAI_VIEC_MA_LECH,
			reason: "cvc-ma-lech",
			dueAt: new Date(Date.now() - 1000),
			priority: 1,
			budget: 1,
			payload,
		},
	});
	da.viec.push(viec.id);
	const thue: LeasedTask = {
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
	const ket = await xuLyMaLech(thue, now);
	const xong = await db.agentTask.findUniqueOrThrow({
		where: { id: viec.id },
		select: { outcome: true },
	});
	return { ket, outcome: xong.outcome ?? "" };
}

function viecCua(planId: string) {
	return db.viec.findMany({
		where: { gan: { some: { planId } } },
		include: { gan: true, vet: true },
	});
}

beforeAll(async () => {
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
});

afterAll(async () => {
	await db.viec.deleteMany({ where: { taoBoiId: { in: da.nguoi } } });
	await db.activity.deleteMany({ where: { createdById: { in: da.nguoi } } });
	await db.agentTask.deleteMany({ where: { id: { in: da.viec } } });
	await db.company.deleteMany({ where: { id: { in: da.congTy } } });
	await db.member.deleteMany({ where: { userId: { in: da.nguoi } } });
	await db.user.deleteMany({ where: { id: { in: da.nguoi } } });
});

describe("cvc-ma-lech", () => {
	test("cvc-ma-lech: giao một Việc cho người cầm trịch, không giao trùng, giao lại sau khi xong", async () => {
		const o = await nguoi("member");
		const p = await keHoach(o);
		const truocTask = await db.activity.count({
			where: { type: ActivityType.TASK },
		});
		const now = new Date();
		const lan1 = await chay(p.id, "MB-9", now);
		const ds = await viecCua(p.id);
		hong(
			ds.length === 1 && lan1.ket === "da-giao",
			`cvc: ma lech giao viec sai so ${ds.length}`,
		);
		const v = ds[0];
		if (!v) throw new Error("cvc: ma lech giao viec sai so 0");
		hong(
			v.nguoiGiaoId === o && v.nguoiThucHienId === o,
			"cvc: ma lech giao viec sai nguoi",
		);
		hong(
			v.gan.length === 1 && v.gan[0]?.planId === p.id,
			"cvc: ma lech giao viec sai gan",
		);
		hong(
			v.hanNgay?.toISOString() === `${ngayVN(now)}T00:00:00.000Z`,
			"cvc: ma lech giao viec sai hanNgay",
		);
		hong(
			v.khoaNguon === VIEC.khoaMaLech("MB-9"),
			"cvc: ma lech giao viec sai khoaNguon",
		);
		hong(
			v.vet.length === 1 && v.vet[0]?.nguon === "tac-nhan",
			"cvc: ma lech giao viec sai vet",
		);
		hong(
			(await db.activity.count({ where: { type: ActivityType.TASK } })) ===
				truocTask,
			"cvc: ma lech giao viec sai TASK",
		);

		const lan2 = await chay(p.id, "MB-9");
		hong(
			lan2.ket === "da-co-viec-mo" &&
				lan2.outcome.includes("không giao trùng") &&
				(await viecCua(p.id)).length === 1,
			"cvc: ma lech giao trung",
		);

		await db.$transaction((tx) =>
			doiTrangThai(tx, {
				viecId: v.id,
				nguoiId: o,
				nguon: "web",
				now: new Date(),
				den: TrangThaiViec.XONG,
			}),
		);
		await chay(p.id, "MB-9");
		hong(
			(await viecCua(p.id)).length === 2,
			"cvc: ma lech khong giao lai sau xong",
		);
	});

	test("cvc-ma-lech: việc cần làm cũ cùng mã đang mở chưa chép thì không giao; đã chép thì bản chép chặn", async () => {
		const o = await nguoi("member");
		const p2 = await keHoach(o);
		const cu = await db.activity.create({
			data: {
				type: ActivityType.TASK,
				subject: "Gắn mã nền tảng MB-8 vào đúng cá nhân",
				body: "Mở đúng cá nhân",
				dueAt: new Date(),
				planId: p2.id,
				companyId: p2.companyId,
				createdById: o,
				meta: { agent: LOAI_VIEC_MA_LECH, platformBrokerId: "MB-8" },
			},
			select: { id: true },
		});
		const lan1 = await chay(p2.id, "MB-8");
		hong(
			lan1.ket === "da-co-viec-mo" &&
				lan1.outcome.includes("không giao trùng") &&
				(await viecCua(p2.id)).length === 0,
			"cvc: ma lech giao trung khi con viec cu",
		);
		await db.$transaction((tx) =>
			chepViecCanLam(tx, {
				activityId: cu.id,
				nguoiChay: { id: o, ten: o },
				now: new Date(),
			}),
		);
		const lan2 = await chay(p2.id, "MB-8");
		hong(
			lan2.ket === "da-co-viec-mo" && (await viecCua(p2.id)).length === 1,
			"cvc: ma lech khong thay ban chep",
		);
	});

	test("cvc-ma-lech-nguoi-khong-nhan: người cầm trịch vai «chỉ OKR» thì kết quả có tên, không ghi Việc", async () => {
		const o = await nguoi("okr");
		const p = await keHoach(o);
		const ket = await chay(p.id, "MB-7");
		expect(ket.ket).toBe("nguoi-cam-trich-khong-nhan");
		expect(ket.outcome).toBe(LY_DO_MA_LECH["nguoi-cam-trich-khong-nhan"]);
		expect((await viecCua(p.id)).length).toBe(0);
	});
});
