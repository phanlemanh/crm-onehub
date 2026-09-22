import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module";
import { TrpcModule } from "../trpc/trpc.module";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingRouter } from "./onboarding.router";
import { OnboardingService } from "./onboarding.service";
import { OnboardingIngestService } from "./onboarding-ingest.service";
import { OnboardingNoi } from "./onboarding-noi";

@Module({
	imports: [AgentModule, TrpcModule],
	controllers: [OnboardingController],
	providers: [
		OnboardingService,
		OnboardingNoi,
		OnboardingIngestService,
		OnboardingRouter,
	],
	exports: [OnboardingService],
})
export class OnboardingModule {}
