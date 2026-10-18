import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { LichLamViecRouter } from "./lich-lam-viec.router";
import { LichLamViecService } from "./lich-lam-viec.service";

@Module({
	imports: [TrpcModule],
	providers: [LichLamViecService, LichLamViecRouter],
})
export class LichLamViecModule {}
