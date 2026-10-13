import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { ViecRouter } from "./viec.router";
import { ViecService } from "./viec.service";
import { ViecBangService } from "./viec-bang.service";

@Module({
	imports: [TrpcModule],
	providers: [ViecService, ViecBangService, ViecRouter],
	exports: [ViecService],
})
export class ViecModule {}
