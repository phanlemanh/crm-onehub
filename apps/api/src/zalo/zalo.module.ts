import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module";
import { TrpcModule } from "../trpc/trpc.module";
import { ZaloRouter } from "./zalo.router";
import { ZaloService } from "./zalo.service";
import { ZaloCauNoiService } from "./zalo-cau-noi.service";

@Module({
	imports: [TrpcModule, AgentModule],
	providers: [ZaloService, ZaloCauNoiService, ZaloRouter],
})
export class ZaloModule {}
