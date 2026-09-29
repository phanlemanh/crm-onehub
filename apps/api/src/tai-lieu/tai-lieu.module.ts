import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module";
import { TrpcModule } from "../trpc/trpc.module";
import { khoNguonProvider } from "./kho-nguon";
import { TaiLieuRouter } from "./tai-lieu.router";
import { TaiLieuService } from "./tai-lieu.service";
import { TaiLieuNguonRouter } from "./tai-lieu-nguon.router";
import { TaiLieuNguonService } from "./tai-lieu-nguon.service";
import { TaiLieuTimService } from "./tai-lieu-tim.service";

@Module({
	imports: [TrpcModule, AgentModule],
	providers: [
		TaiLieuService,
		TaiLieuTimService,
		TaiLieuRouter,
		khoNguonProvider,
		TaiLieuNguonService,
		TaiLieuNguonRouter,
	],
})
export class TaiLieuModule {}
