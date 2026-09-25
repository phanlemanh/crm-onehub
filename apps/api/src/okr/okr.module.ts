import { Module } from "@nestjs/common";
import { ToChucModule } from "../to-chuc/to-chuc.module";
import { TrpcModule } from "../trpc/trpc.module";
import { OkrRouter } from "./okr.router";
import { OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import { OkrCapNhatService } from "./okr-cap-nhat.service";

@Module({
	imports: [TrpcModule, ToChucModule],
	providers: [OkrAccessService, OkrService, OkrCapNhatService, OkrRouter],
})
export class OkrModule {}
