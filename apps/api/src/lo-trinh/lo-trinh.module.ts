import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { LoTrinhBanChupRouter } from "./lo-trinh-ban-chup.router";
import { LoTrinhBanChupService } from "./lo-trinh-ban-chup.service";
import { SanPhamLoTrinhRouter } from "./san-pham.router";
import { SanPhamLoTrinhService } from "./san-pham.service";

@Module({
	imports: [TrpcModule],
	providers: [
		LoTrinhBanChupService,
		LoTrinhBanChupRouter,
		SanPhamLoTrinhService,
		SanPhamLoTrinhRouter,
	],
})
export class LoTrinhModule {}
