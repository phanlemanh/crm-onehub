import { InvalidInput } from "@crm/validation";
import {
	type OnboardingBatch,
	parseOnboardingBatch,
} from "@crm/validation/onboarding-ingest";
import {
	BadRequestException,
	Body,
	Controller,
	ForbiddenException,
	Headers,
	Post,
	ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	ApiBadRequestResponse,
	ApiForbiddenResponse,
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiServiceUnavailableResponse,
	ApiTags,
} from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import type { EnvironmentVariables } from "../config/env.validation";
import {
	type KetQuaNhan,
	OnboardingIngestService,
} from "./onboarding-ingest.service";

@ApiTags("Internal — Onboarding")
@ApiHeader({
	name: "authorization",
	description: "`Bearer <ONEHUB_PLATFORM_INGEST_SECRET>`",
	required: true,
})
@ApiForbiddenResponse({
	description: "ONEHUB_PLATFORM_INGEST_SECRET không khớp.",
})
@ApiServiceUnavailableResponse({
	description: "ONEHUB_PLATFORM_INGEST_SECRET chưa được khai.",
})
@ApiBadRequestResponse({ description: "Lô không đúng khuôn." })
@Controller("internal/onboarding")
export class OnboardingController {
	private readonly secret: string | undefined;

	constructor(
		private readonly nhanLo: OnboardingIngestService,
		config: ConfigService<EnvironmentVariables, true>,
	) {
		this.secret = config.get("ONEHUB_PLATFORM_INGEST_SECRET", { infer: true });
	}

	@Post("ingest")
	@AllowAnonymous()
	@ApiOperation({
		summary: "Nhận một lô mốc bậc của môi giới từ nền tảng OneHub",
	})
	@ApiOkResponse({
		description: "Lô được nhận; số khớp và số chuyển cho tác nhân.",
	})
	async ingest(
		@Headers("authorization") authorization: string | undefined,
		@Body() body: unknown,
	): Promise<KetQuaNhan> {
		if (this.secret === undefined || this.secret === "") {
			throw new ServiceUnavailableException(
				"ONEHUB_PLATFORM_INGEST_SECRET chưa khai — đường nhận số liệu chưa bật.",
			);
		}

		if (authorization !== `Bearer ${this.secret}`) {
			throw new ForbiddenException("Khoá không khớp.");
		}

		let batch: OnboardingBatch;
		try {
			batch = parseOnboardingBatch(body);
		} catch (loi) {
			if (loi instanceof InvalidInput) {
				throw new BadRequestException(loi.message);
			}
			throw loi;
		}

		return this.nhanLo.nhan(batch);
	}
}
