import { ActivityType, db } from "@crm/db";
import { lockIdempotencyKey } from "@crm/db/idempotency";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import {
	LOAI_VIEC_MA_LECH,
	MA_NEN_TANG_KEY,
	type OnboardingIdentifyPayload,
	parseOnboardingIdentifyPayload,
} from "@crm/validation/onboarding-identify";
import { completeTask, type LeasedTask } from "./tasks";

export { LOAI_VIEC_MA_LECH };

export type KetQuaMaLech =
	| "da-giao"
	| "ma-da-khop"
	| "ke-hoach-dong"
	| "da-co-viec-mo"
	| "payload-hong";

export const LY_DO_MA_LECH = {
	"da-giao": "đã giao việc cho người cầm trịch kế hoạch",
	"ma-da-khop": "mã đã khớp một cá nhân, không cần giao việc",
	"ke-hoach-dong": "kế hoạch đã đóng hoặc không còn, không giao việc",
	"da-co-viec-mo": "đã có việc mở cho mã này trong kế hoạch, không giao trùng",
	"payload-hong": "payload onboarding-identify hỏng",
} as const satisfies Record<KetQuaMaLech, string>;

function tieuDe(ma: string): string {
	return `Gắn mã nền tảng ${ma} vào đúng cá nhân`;
}

function noiDung(ma: string): string {
	return `Lô từ nền tảng báo mã ${ma} nhưng chưa cá nhân nào mang mã này. Mở đúng cá nhân và điền trường «Mã môi giới trên nền tảng».`;
}

async function maDaKhop(ma: string): Promise<boolean> {
	const hang = await db.fieldValue.findFirst({
		where: {
			text: ma,
			contactId: { not: null },
			field: { entity: "CONTACT", key: MA_NEN_TANG_KEY },
		},
		select: { id: true },
	});
	return hang !== null;
}

async function giaoViec(
	payload: OnboardingIdentifyPayload,
	now: Date,
): Promise<KetQuaMaLech> {
	return db.$transaction(async (tx) => {
		await lockIdempotencyKey(
			tx,
			`${LOAI_VIEC_MA_LECH}:${payload.planId}:${payload.platformBrokerId}`,
		);

		const keHoach = await tx.onboardingPlan.findUnique({
			where: { id: payload.planId },
			select: { ownerId: true, companyId: true, closedAt: true },
		});
		if (keHoach === null || keHoach.closedAt !== null) return "ke-hoach-dong";

		const dangMo = await tx.activity.findFirst({
			where: {
				type: ActivityType.TASK,
				completedAt: null,
				planId: payload.planId,
				meta: { path: ["platformBrokerId"], equals: payload.platformBrokerId },
			},
			select: { id: true },
		});
		if (dangMo !== null) return "da-co-viec-mo";

		await tx.activity.create({
			data: {
				type: ActivityType.TASK,
				subject: tieuDe(payload.platformBrokerId),
				body: noiDung(payload.platformBrokerId),
				dueAt: dauNgayVN(now),
				planId: payload.planId,
				companyId: keHoach.companyId,
				createdById: keHoach.ownerId,
				meta: {
					agent: LOAI_VIEC_MA_LECH,
					platformBrokerId: payload.platformBrokerId,
				},
			},
		});
		return "da-giao";
	});
}

export async function xuLyMaLech(
	task: LeasedTask,
	now: Date = new Date(),
): Promise<KetQuaMaLech> {
	let payload: OnboardingIdentifyPayload;
	try {
		payload = parseOnboardingIdentifyPayload(task.payload);
	} catch (loi) {
		const thongDiep = loi instanceof Error ? loi.message : String(loi);
		await completeTask(
			task.id,
			`${LY_DO_MA_LECH["payload-hong"]}: ${thongDiep}`,
		);
		return "payload-hong";
	}

	const ketQua = (await maDaKhop(payload.platformBrokerId))
		? "ma-da-khop"
		: await giaoViec(payload, now);

	await completeTask(task.id, LY_DO_MA_LECH[ketQua]);
	return ketQua;
}
