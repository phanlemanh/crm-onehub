import type { Db } from "@crm/db";
import { Injectable } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type {
	TransferOutput,
	TransferPreviewInput,
	TransferWorkInput,
} from "./onboarding.contracts";
import { OnboardingGhi } from "./onboarding-ghi";

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
}
