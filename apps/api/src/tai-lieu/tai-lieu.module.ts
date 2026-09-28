import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { TaiLieuRouter } from "./tai-lieu.router";
import { TaiLieuService } from "./tai-lieu.service";

@Module({
	imports: [TrpcModule],
	providers: [TaiLieuService, TaiLieuRouter],
})
export class TaiLieuModule {}
