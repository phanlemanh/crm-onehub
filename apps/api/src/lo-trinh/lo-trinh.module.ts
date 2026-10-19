import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { LoTrinhBanChupRouter } from "./lo-trinh-ban-chup.router";
import { LoTrinhBanChupService } from "./lo-trinh-ban-chup.service";

@Module({
	imports: [TrpcModule],
	providers: [LoTrinhBanChupService, LoTrinhBanChupRouter],
})
export class LoTrinhModule {}
