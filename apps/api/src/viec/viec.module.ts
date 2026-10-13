import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { ViecRouter } from "./viec.router";
import { ViecService } from "./viec.service";

@Module({
	imports: [TrpcModule],
	providers: [ViecService, ViecRouter],
	exports: [ViecService],
})
export class ViecModule {}
