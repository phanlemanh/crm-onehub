import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module";
import { ToChucModule } from "../to-chuc/to-chuc.module";
import { TrpcModule } from "../trpc/trpc.module";
import { OkrRouter } from "./okr.router";
import { OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import { OkrCapNhatService } from "./okr-cap-nhat.service";
import { OkrSoService } from "./okr-so.service";
import { OkrTraoDoiService } from "./okr-trao-doi.service";
import { OkrXemService } from "./okr-xem.service";

@Module({
	imports: [TrpcModule, ToChucModule, AgentModule],
	providers: [
		OkrAccessService,
		OkrService,
		OkrXemService,
		OkrCapNhatService,
		OkrTraoDoiService,
		OkrSoService,
		OkrRouter,
	],
})
export class OkrModule {}
