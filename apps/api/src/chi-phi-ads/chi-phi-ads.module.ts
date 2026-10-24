import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { ChiPhiAdsRouter } from "./chi-phi-ads.router";
import { ChiPhiAdsService } from "./chi-phi-ads.service";

@Module({
	imports: [TrpcModule],
	providers: [ChiPhiAdsService, ChiPhiAdsRouter],
	exports: [ChiPhiAdsService],
})
export class ChiPhiAdsModule {}
