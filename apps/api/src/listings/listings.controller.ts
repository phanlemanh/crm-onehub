import { InvalidInput } from "@crm/validation";
import {
	type ListingBatch,
	parseListingBatch,
} from "@crm/validation/listing-ingest";
import {
	BadRequestException,
	Body,
	Controller,
	ForbiddenException,
	Headers,
	Logger,
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
import { ListingIngestService } from "./listing-ingest.service";

@ApiTags("Internal — Listings")
@ApiHeader({
	name: "authorization",
	description: "`Bearer <LISTING_INGEST_SECRET>`",
	required: true,
})
@ApiForbiddenResponse({ description: "LISTING_INGEST_SECRET did not match." })
@ApiServiceUnavailableResponse({
	description: "LISTING_INGEST_SECRET is not set.",
})
@ApiBadRequestResponse({ description: "The batch did not match the schema." })
@Controller("internal/listings")
export class ListingsController {
	private readonly logger = new Logger(ListingsController.name);
	private readonly secret: string | undefined;

	constructor(
		private readonly ingest: ListingIngestService,
		config: ConfigService<EnvironmentVariables, true>,
	) {
		this.secret = config.get("LISTING_INGEST_SECRET", { infer: true });
	}

	@Post("ingest")
	@AllowAnonymous()
	@ApiOperation({
		summary: "Accept one batch of broker pages from a listing site",
	})
	@ApiOkResponse({
		description: "The batch was accepted; created and updated counts.",
	})
	async run(
		@Body() body: ListingBatch,
		@Headers("authorization") authorization?: string,
	) {
		if (!this.secret) {
			this.logger.error({
				message: "LISTING_INGEST_SECRET is not set — refusing the batch.",
			});
			throw new ServiceUnavailableException(
				"Listing ingest is not configured.",
			);
		}

		if (!timingSafeEquals(authorization ?? "", `Bearer ${this.secret}`)) {
			throw new ForbiddenException();
		}

		try {
			return await this.ingest.ingest(parseListingBatch(body));
		} catch (error) {
			if (error instanceof InvalidInput) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
	}
}

function timingSafeEquals(a: string, b: string): boolean {
	if (a.length !== b.length) return false;

	let mismatch = 0;
	for (let index = 0; index < a.length; index += 1) {
		mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
	}

	return mismatch === 0;
}
