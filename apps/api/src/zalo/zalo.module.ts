import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module";
import { TrpcModule } from "../trpc/trpc.module";
import { ZaloRouter } from "./zalo.router";
import { ZaloService } from "./zalo.service";

@Module({
	imports: [TrpcModule, AgentModule],
	providers: [ZaloService, ZaloRouter],
})
export class ZaloModule {}
