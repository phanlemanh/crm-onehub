import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module";
import { ToChucModule } from "../to-chuc/to-chuc.module";
import { TrpcModule } from "../trpc/trpc.module";
import { DONG_HO_HOI_Y, MOC_SAU_KHOA_CHU_KY } from "./dong-ho";
import { HoiService } from "./hoi.service";
import { OkrRouter } from "./okr.router";
import { OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import { OkrCanhKrService } from "./okr-canh-kr.service";
import { OkrCapNhatService } from "./okr-cap-nhat.service";
import { OkrChuKyService } from "./okr-chu-ky.service";
import { OkrDuyetService } from "./okr-duyet.service";
import { OkrHienThiService } from "./okr-hien-thi.service";
import { OkrHoiYService } from "./okr-hoi-y.service";
import { OkrKhepService } from "./okr-khep.service";
import { OkrMauService } from "./okr-mau.service";
import { OkrSoService } from "./okr-so.service";
import { OkrTaiCoCauService } from "./okr-tai-co-cau.service";
import { OkrTraoDoiService } from "./okr-trao-doi.service";
import { OkrXemService } from "./okr-xem.service";
import { SoanService } from "./soan.service";
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
		SoanService,
		HoiService,
		OkrHoiYService,
		{ provide: DONG_HO_HOI_Y, useValue: () => new Date() },
		OkrChuKyService,
		{ provide: MOC_SAU_KHOA_CHU_KY, useValue: async () => {} },
		OkrHienThiService,
		OkrDuyetService,
		OkrTaiCoCauService,
		OkrRouter,
	],
})
export class OkrModule {}
