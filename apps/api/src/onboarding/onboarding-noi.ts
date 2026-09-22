import type { Db } from "@crm/db";
import { Injectable } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type {
	CompanyPlanRow,
	ContactPlanRow,
	PlansOfCompanyInput,
	PlansOfContactInput,
	TransferOutput,
	TransferPreviewInput,
	TransferWorkInput,
} from "./onboarding.contracts";
import {
	boViTri,
	CHON_KE_HOACH_DANH_MUC,
	dungHang,
} from "./onboarding-danh-muc";
import { OnboardingGhi } from "./onboarding-ghi";

function bacDaDat(g: {
	accountAt: Date | null;
	courseAt: Date | null;
	activeAt: Date | null;
	dealAt: Date | null;
}): ContactPlanRow["bac"] {
	if (g.dealAt !== null) return "dealAt";
	if (g.activeAt !== null) return "activeAt";
	if (g.courseAt !== null) return "courseAt";
	if (g.accountAt !== null) return "accountAt";
	return null;
}

@Injectable()
export class OnboardingNoi {
	private readonly ghi: OnboardingGhi;

	constructor(@InjectDatabase() private readonly db: Db) {
		this.ghi = new OnboardingGhi(db);
	}

	transferPreview(
		input: TransferPreviewInput,
		actingUserId: string,
	): Promise<TransferOutput> {
		return this.ghi.transferPreview(input, actingUserId);
	}

	transferWork(
		input: TransferWorkInput,
		actingUserId: string,
	): Promise<TransferOutput> {
		return this.ghi.transferWork(input, actingUserId);
	}

	async plansOfCompany(input: PlansOfCompanyInput): Promise<CompanyPlanRow[]> {
		const plans = await this.db.onboardingPlan.findMany({
			where: { companyId: input.companyId },
			include: { ...CHON_KE_HOACH_DANH_MUC, owner: { select: { name: true } } },
		});
		const bayGio = new Date();
		return plans
			.map((plan) => ({
				...boViTri(dungHang(plan, bayGio)),
				ownerName: plan.owner.name,
			}))
			.sort(
				(a, b) =>
					Number(a.closedAt !== null) - Number(b.closedAt !== null) ||
					b.startedAt.getTime() - a.startedAt.getTime() ||
					a.id.localeCompare(b.id),
			);
	}

	async plansOfContact(input: PlansOfContactInput): Promise<ContactPlanRow[]> {
		const ghiDanh = await this.db.onboardingEnrollment.findMany({
			where: { contactId: input.contactId, plan: { closedAt: null } },
			orderBy: [{ plan: { startedAt: "desc" } }, { id: "asc" }],
			select: {
				planId: true,
				accountAt: true,
				courseAt: true,
				activeAt: true,
				dealAt: true,
				plan: { select: { company: { select: { name: true } } } },
			},
		});
		return ghiDanh.map((g) => ({
			planId: g.planId,
			companyName: g.plan.company.name,
			bac: bacDaDat(g),
		}));
	}
}
