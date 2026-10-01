import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module";
import { TrpcModule } from "../trpc/trpc.module";
import { HoiKhoRouter } from "./hoi-kho.router";
import { khoNguonProvider } from "./kho-nguon";
import { TaiLieuRouter } from "./tai-lieu.router";
import { TaiLieuService } from "./tai-lieu.service";
import { TaiLieuHoiService } from "./tai-lieu-hoi.service";
import { TaiLieuNguonRouter } from "./tai-lieu-nguon.router";
import { TaiLieuNguonService } from "./tai-lieu-nguon.service";
import { TaiLieuTimService } from "./tai-lieu-tim.service";

@Module({
	imports: [TrpcModule, AgentModule],
	providers: [
		TaiLieuService,
		TaiLieuTimService,
		TaiLieuHoiService,
		HoiKhoRouter,
		TaiLieuRouter,
		khoNguonProvider,
		TaiLieuNguonService,
		TaiLieuNguonRouter,
	],
})
export class TaiLieuModule {}
