import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module";
import { DealsModule } from "../deals/deals.module";
import { TrpcModule } from "../trpc/trpc.module";
import { GiaiDoanRouter } from "./giai-doan.router";
import { GiaiDoanService } from "./giai-doan.service";

@Module({
	imports: [TrpcModule, AgentModule, DealsModule],
	providers: [GiaiDoanService, GiaiDoanRouter],
})
export class GiaiDoanModule {}
