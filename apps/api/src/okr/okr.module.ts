import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module";
import { ToChucModule } from "../to-chuc/to-chuc.module";
import { TrpcModule } from "../trpc/trpc.module";
import { OkrRouter } from "./okr.router";
import { OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import { OkrCanhKrService } from "./okr-canh-kr.service";
import { OkrCapNhatService } from "./okr-cap-nhat.service";
import { OkrDuyetService } from "./okr-duyet.service";
import { OkrHienThiService } from "./okr-hien-thi.service";
import { OkrKhepService } from "./okr-khep.service";
import { OkrMauService } from "./okr-mau.service";
import { OkrSoService } from "./okr-so.service";
import { OkrTraoDoiService } from "./okr-trao-doi.service";
import { OkrXemService } from "./okr-xem.service";
import { TroLyOkrService } from "./tro-ly.service";

@Module({
	imports: [TrpcModule, ToChucModule, AgentModule],
	providers: [
		OkrAccessService,
		OkrService,
		OkrXemService,
		OkrCapNhatService,
		OkrTraoDoiService,
		OkrSoService,
		TroLyOkrService,
		OkrKhepService,
		OkrCanhKrService,
		OkrMauService,
		OkrHienThiService,
		OkrDuyetService,
		OkrRouter,
	],
})
export class OkrModule {}
