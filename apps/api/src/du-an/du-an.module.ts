import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { DuAnRouter } from "./du-an.router";
import { DuAnService } from "./du-an.service";

@Module({
	imports: [TrpcModule],
	providers: [DuAnService, DuAnRouter],
})
export class DuAnModule {}
