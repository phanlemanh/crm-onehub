import { Module } from "@nestjs/common";
import { ToChucModule } from "../to-chuc/to-chuc.module";
import { TrpcModule } from "../trpc/trpc.module";
import { OkrRouter } from "./okr.router";
import { OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";

@Module({
	imports: [TrpcModule, ToChucModule],
	providers: [OkrAccessService, OkrService, OkrRouter],
})
export class OkrModule {}
