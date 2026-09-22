import type { Db, Prisma } from "@crm/db";
import { vet } from "@crm/validation/onboarding-activity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type {
	NguoiTheoDoi,
	WatchInput,
	WatchOutput,
} from "./onboarding.contracts";
import { ONBOARDING } from "./onboarding-config";
import { ghiVet } from "./onboarding-ghi";

type Tx = Prisma.TransactionClient;

async function keHoachCo(
	tx: Tx,
	planId: string,
): Promise<{ id: string; companyId: string }> {
	const plan = await tx.onboardingPlan.findUnique({
		where: { id: planId },
		select: { id: true, companyId: true },
	});
	if (plan === null) {
		throw new NotFoundException(ONBOARDING.thongDiep.khongCoKeHoach(planId));
	}
	return plan;
}

async function dem(tx: Tx, planId: string): Promise<number> {
	return tx.onboardingWatch.count({ where: { planId } });
}

@Injectable()
export class OnboardingTheoDoi {
	constructor(@InjectDatabase() private readonly db: Db) {}

	bat(input: WatchInput, actingUserId: string): Promise<WatchOutput> {
		return this.db.$transaction(async (tx) => {
			const plan = await keHoachCo(tx, input.planId);
			const tao = await tx.onboardingWatch.createMany({
				data: [{ planId: plan.id, userId: actingUserId }],
				skipDuplicates: true,
			});
			if (tao.count > 0) {
				await ghiVet(tx, plan, vet.theoDoiBat(), actingUserId);
			}
			return { dangTheoDoi: true, soNguoiTheoDoi: await dem(tx, plan.id) };
		});
	}

	tat(input: WatchInput, actingUserId: string): Promise<WatchOutput> {
		return this.db.$transaction(async (tx) => {
			const plan = await keHoachCo(tx, input.planId);
			const xoa = await tx.onboardingWatch.deleteMany({
				where: { planId: plan.id, userId: actingUserId },
			});
			if (xoa.count > 0) {
				await ghiVet(tx, plan, vet.theoDoiTat(), actingUserId);
			}
			return { dangTheoDoi: false, soNguoiTheoDoi: await dem(tx, plan.id) };
		});
	}

	async cua(
		planId: string,
		actingUserId: string,
	): Promise<{ dangTheoDoi: boolean; nguoiTheoDoi: NguoiTheoDoi }> {
		const hang = await this.db.onboardingWatch.findMany({
			where: { planId },
			select: { user: { select: { id: true, name: true } } },
			orderBy: [{ user: { name: "asc" } }, { userId: "asc" }],
		});
		const nguoiTheoDoi = hang.map((h) => h.user);
		return {
			dangTheoDoi: nguoiTheoDoi.some((n) => n.id === actingUserId),
			nguoiTheoDoi,
		};
	}
}
