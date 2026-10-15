import {
	danhDauViecInput,
	ganSangKienInput,
	guiGhiNhanInput,
	suaViecInput,
	themBangChungInput,
	themViecInput,
} from "@crm/validation/okr-canh-kr";
import { guiCapNhatInput, moCapNhatInput } from "@crm/validation/okr-cap-nhat";
import {
	goChuKyInput,
	hienChuKyInput,
	suaChuKyInput,
} from "@crm/validation/okr-chu-ky";
import { soanDuaVaoInput } from "@crm/validation/okr-cuoc-soan";
import {
	chuyenDonViInput,
	datHienThiInput,
	moCoiInput,
	traLaiInput,
} from "@crm/validation/okr-hien-thi";
import {
	chuDeIdInput,
	cycleIdInput,
	dongYInput,
	ganYInput,
	gopYInput,
	hoiYIdInput,
	ketLuanInput,
	moHoiYInput,
	niemPhongInput,
	suaChuDeInput,
	suaHoiYInput,
	suaYInput,
	taoChuDeInput,
	yIdInput,
} from "@crm/validation/okr-hoi-y";
import {
	anChuKyInput,
	chamKrInput,
	dongRaInput,
	ghiDieuHocDuocInput,
	mangSangInput,
	moLaiKyInput,
	moRaInput,
	xuatKyInput,
} from "@crm/validation/okr-khep";
import { taoTuMauInput } from "@crm/validation/okr-mau";
import {
	troLyTomTatInput,
	troLyTomTatOutput,
	troLyTomTatPhanHoiInput,
	troLyTomTatPhanHoiOutput,
	troLyTomTatQuanTriInput,
	troLyTomTatQuanTriOutput,
} from "@crm/validation/okr-tom-tat";
import {
	addCommentInput,
	commentsInput,
	followInput,
	transferOkrInput,
	transferOkrPreviewInput,
} from "@crm/validation/okr-trao-doi";
import { Inject } from "@nestjs/common";
import {
	Ctx,
	Input,
	Mutation,
	Query,
	Router,
	UseMiddlewares,
} from "nestjs-trpc";
import type { z } from "zod";
import type { AuthedTrpcContext } from "../trpc/context.types";
import { PhamViOkrMiddleware } from "../trpc/middlewares/pham-vi-du-lieu.middleware";
import { restMeta } from "../trpc/openapi";
import {
	addCommentOutput,
	aiChiTieuOutput,
	alignmentInput,
	alignmentTargetsInput,
	alignmentTargetsOutput,
	alignmentTreeInput,
	alignmentTreeOutput,
	byUnitInput,
	byUnitOutput,
	capNhatTuanOutput,
	chuyenDonViOutput,
	chuyenDonViXemTruocOutput,
	commentsOutput,
	countByUnitInput,
	createCycleInput,
	createKrInput,
	createObjectiveInput,
	cuocIdInput,
	cyclesOutput,
	datHienThiOutput,
	donViSoanVao,
	dungLaiOutput,
	followOutput,
	guiCapNhatOutput,
	idInput,
	luuMauVao,
	mauInput,
	mauOutput,
	mineInput,
	mineOutput,
	moCapNhatOutput,
	moCoiOutput,
	objectiveInput,
	objectiveOutput,
	okOutput,
	okrAccessOutput,
	okrCountByUnitOutput,
	okrImportApplyInput,
	okrImportApplyOutput,
	okrImportInput,
	okrImportPreviewOutput,
	programOutput,
	setCyclePhaseInput,
	setProgramInput,
	soanAnOutput,
	soanDanhSachCuocOutput,
	soanDanhSachOutput,
	soanDuaVaoOutput,
	soanMoOutput,
	soanMoVao,
	soanQuyetInput,
	soanQuyetOutput,
	soanSanSangOutput,
	soanSoDoInput,
	soanSoDoOutput,
	soanTangLuotOutput,
	suaLyDoCanChinhInput,
	thanhVienOutput,
	transferOkrOutput,
	troLyAnInput,
	troLyAnOutput,
	troLyDanhSachOutput,
	troLyDeXuatOutput,
	troLyDichInput,
	troLyQuyetInput,
	troLyQuyetOutput,
	troLySanSangOutput,
	troLySoDoInput,
	troLySoDoOutput,
	updateKrInput,
	updateObjectiveInput,
	viecCuaToiOutput,
	xuHuongKrInput,
	xuHuongKrOutput,
} from "./okr.contracts";
import { OkrService } from "./okr.service";
import {
	canhKrInput,
	canhKrOutput,
	goBangChungInput,
	goGhiNhanInput,
	goViecInput,
	idOutput,
} from "./okr-canh-kr.contracts";
import { OkrCanhKrService } from "./okr-canh-kr.service";
import { OkrCapNhatService } from "./okr-cap-nhat.service";
import { OkrChuKyService } from "./okr-chu-ky.service";
import { OkrDuyetService } from "./okr-duyet.service";
import { OkrHienThiService } from "./okr-hien-thi.service";
import {
	congBoOutput,
	hieuViSaoOutput,
	hoiYDocOutput,
	hoiYDoPhuOutput,
	hoiYGhiOutput,
	hoiYNhanOutput,
} from "./okr-hoi-y.contracts";
import { OkrHoiYService } from "./okr-hoi-y.service";
import {
	bangChamInput,
	bangChamOutput,
	mangSangOutput,
	xuatKyOutput,
} from "./okr-khep.contracts";
import { OkrKhepService } from "./okr-khep.service";
import { OkrMauService } from "./okr-mau.service";
import {
	banGhiChiSoInput,
	banGhiChiSoOutput,
	chiSoOutput,
	datNguonKrOutput,
	datNguonKrVao,
	ghiSoKrInput,
	ghiSoKrOutput,
	lichSuSoInput,
	lichSuSoOutput,
	xemTruocChiSoInput,
	xemTruocChiSoOutput,
} from "./okr-so.contracts";
import { OkrSoService } from "./okr-so.service";
import { OkrTaiCoCauService } from "./okr-tai-co-cau.service";
import { OkrTraoDoiService } from "./okr-trao-doi.service";
import {
	cayCanChinhOutput,
	cycleOnlyInput,
	danhSachInput,
	danhSachOutput,
	dienBienInput,
	dienBienOutput,
	hopTuanInput,
	hopTuanOutput,
	khoiCuaToiInput,
	khoiCuaToiOutput,
	moHopTuanOutput,
	soDoDonViOutput,
	sucKhoeOutput,
	toanCanhOutput,
} from "./okr-xem.contracts";
import { OkrXemService } from "./okr-xem.service";
import { SoanService } from "./soan.service";
import { TroLyOkrService } from "./tro-ly.service";

const TAG = ["OKR"];

@Router({ alias: "okr" })
@UseMiddlewares(PhamViOkrMiddleware)
export class OkrRouter {
	constructor(
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrXemService) private readonly xem: OkrXemService,
		@Inject(OkrCapNhatService) private readonly capNhat: OkrCapNhatService,
		@Inject(OkrTraoDoiService) private readonly traoDoi: OkrTraoDoiService,
		@Inject(OkrSoService) private readonly so: OkrSoService,
		@Inject(TroLyOkrService) private readonly troLy: TroLyOkrService,
		@Inject(OkrKhepService) private readonly khep: OkrKhepService,
		@Inject(OkrCanhKrService) private readonly canh: OkrCanhKrService,
		@Inject(OkrMauService) private readonly khuon: OkrMauService,
		@Inject(SoanService) private readonly soan: SoanService,
		@Inject(OkrHoiYService) private readonly hoiYDv: OkrHoiYService,
		@Inject(OkrHienThiService) private readonly hienThi: OkrHienThiService,
		@Inject(OkrDuyetService) private readonly duyet: OkrDuyetService,
		@Inject(OkrTaiCoCauService) private readonly taiCoCau: OkrTaiCoCauService,
		@Inject(OkrChuKyService) private readonly chuKy: OkrChuKyService,
	) {}

	@Query({ output: okrAccessOutput, meta: restMeta("GET", "/okr/access", TAG) })
	access(@Ctx() ctx: AuthedTrpcContext) {
		return this.okr.access(ctx.user.id);
	}

	@Query({ output: cyclesOutput, meta: restMeta("GET", "/okr/cycles", TAG) })
	cycles() {
		return this.okr.cycles();
	}

	@Mutation({
		input: createCycleInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/cycles", TAG),
	})
	createCycle(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof createCycleInput>,
	) {
		return this.okr.createCycle(ctx.user.id, input);
	}

	@Mutation({
		input: setCyclePhaseInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/cycles/{id}/phase", TAG),
	})
	setCyclePhase(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof setCyclePhaseInput>,
	) {
		return this.okr.setCyclePhase(ctx.user.id, input.id, input.phase);
	}

	@Mutation({
		input: suaChuKyInput,
		output: okOutput,
		meta: restMeta("PATCH", "/okr/cycles/{id}", TAG),
	})
	suaChuKy(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof suaChuKyInput>,
	) {
		return this.chuKy.suaChuKy(ctx.user.id, input);
	}

	@Mutation({
		input: goChuKyInput,
		output: okOutput,
		meta: restMeta("DELETE", "/okr/cycles/{id}", TAG),
	})
	goChuKy(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof goChuKyInput>,
	) {
		return this.chuKy.goChuKy(ctx.user.id, input);
	}

	@Mutation({
		input: anChuKyInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/cycles/{id}/hide", TAG),
	})
	anChuKy(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof anChuKyInput>,
	) {
		return this.chuKy.anChuKy(ctx.user.id, input);
	}

	@Mutation({
		input: hienChuKyInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/cycles/{id}/unhide", TAG),
	})
	hienChuKy(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof hienChuKyInput>,
	) {
		return this.chuKy.hienChuKy(ctx.user.id, input);
	}

	@Query({
		output: aiChiTieuOutput,
		meta: restMeta("GET", "/okr/ai-spend", TAG),
	})
	aiChiTieu(@Ctx() ctx: AuthedTrpcContext) {
		return this.troLy.aiChiTieu(ctx.user.id);
	}

	@Query({
		input: troLyDichInput,
		output: troLySanSangOutput,
		meta: restMeta("GET", "/okr/objectives/{objectiveId}/assistant", TAG),
	})
	troLySanSang(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof troLyDichInput>,
	) {
		return this.troLy.troLySanSang(ctx.user.id, input);
	}

	@Mutation({
		input: troLyDichInput,
		output: troLyDeXuatOutput,
		meta: restMeta("POST", "/okr/objectives/{objectiveId}/assistant/run", TAG),
	})
	troLyDeXuat(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof troLyDichInput>,
	) {
		return this.troLy.troLyDeXuat(ctx.user.id, input);
	}

	@Query({
		input: troLyDichInput,
		output: troLyDanhSachOutput,
		meta: restMeta(
			"GET",
			"/okr/objectives/{objectiveId}/assistant/suggestions",
			TAG,
		),
	})
	troLyDanhSach(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof troLyDichInput>,
	) {
		return this.troLy.troLyDanhSach(ctx.user.id, input);
	}

	@Mutation({
		input: troLyQuyetInput,
		output: troLyQuyetOutput,
		meta: restMeta(
			"POST",
			"/okr/assistant/suggestions/{deXuatId}/decision",
			TAG,
		),
	})
	troLyQuyet(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof troLyQuyetInput>,
	) {
		return this.troLy.troLyQuyet(ctx.user.id, input);
	}

	@Query({
		input: troLyAnInput,
		output: troLyAnOutput,
		meta: restMeta("GET", "/okr/assistant/runs", TAG),
	})
	troLyAn(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof troLyAnInput>,
	) {
		return this.troLy.troLyAn(ctx.user.id, input);
	}

	@Query({
		input: troLySoDoInput,
		output: troLySoDoOutput,
		meta: restMeta("GET", "/okr/assistant/metrics", TAG),
	})
	troLySoDo(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof troLySoDoInput>,
	) {
		return this.troLy.troLySoDo(ctx.user.id, input);
	}

	@Query({
		input: troLyTomTatInput,
		output: troLyTomTatOutput,
		meta: restMeta("GET", "/okr/weekly-summary", TAG),
	})
	troLyTomTat(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof troLyTomTatInput>,
	) {
		return this.troLy.troLyTomTat(ctx.user.id, input);
	}

	@Mutation({
		input: troLyTomTatPhanHoiInput,
		output: troLyTomTatPhanHoiOutput,
		meta: restMeta("POST", "/okr/weekly-summary/{tomTatId}/feedback", TAG),
	})
	troLyTomTatPhanHoi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof troLyTomTatPhanHoiInput>,
	) {
		return this.troLy.troLyTomTatPhanHoi(ctx.user.id, input);
	}

	@Query({
		input: troLyTomTatQuanTriInput,
		output: troLyTomTatQuanTriOutput,
		meta: restMeta("GET", "/okr/weekly-summary/admin", TAG),
	})
	troLyTomTatQuanTri(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof troLyTomTatQuanTriInput>,
	) {
		return this.troLy.troLyTomTatQuanTri(ctx.user.id, input);
	}

	@Query({
		input: xuHuongKrInput,
		output: xuHuongKrOutput,
		meta: restMeta("GET", "/okr/key-results/{keyResultId}/trend", TAG),
	})
	xuHuongKr(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof xuHuongKrInput>,
	) {
		return this.troLy.xuHuongKr(ctx.user.id, input.keyResultId);
	}

	@Query({
		input: donViSoanVao,
		output: soanSanSangOutput,
		meta: restMeta("GET", "/okr/soan/ready", TAG),
	})
	soanSanSang(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof donViSoanVao>,
	) {
		return this.soan.sanSang(ctx.user.id, input);
	}

	@Mutation({
		input: soanMoVao,
		output: soanMoOutput,
		meta: restMeta("POST", "/okr/soan/sessions", TAG),
	})
	soanMo(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof soanMoVao>,
	) {
		return this.soan.mo(ctx.user.id, input);
	}

	@Query({
		input: donViSoanVao,
		output: soanDanhSachCuocOutput,
		meta: restMeta("GET", "/okr/soan/sessions", TAG),
	})
	soanDanhSachCuoc(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof donViSoanVao>,
	) {
		return this.soan.danhSachCuoc(ctx.user.id, input);
	}

	@Mutation({
		input: cuocIdInput,
		output: soanTangLuotOutput,
		meta: restMeta("POST", "/okr/soan/sessions/{cuocSoanId}/turn", TAG),
	})
	soanTangLuot(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof cuocIdInput>,
	) {
		return this.soan.tangLuot(ctx.user.id, input.cuocSoanId);
	}

	@Query({
		input: cuocIdInput,
		output: soanDanhSachOutput,
		meta: restMeta("GET", "/okr/soan/sessions/{cuocSoanId}/draft", TAG),
	})
	soanDanhSach(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof cuocIdInput>,
	) {
		return this.soan.danhSach(ctx.user.id, input.cuocSoanId);
	}

	@Mutation({
		input: soanQuyetInput,
		output: soanQuyetOutput,
		meta: restMeta("POST", "/okr/soan/lines/{deXuatId}/decision", TAG),
	})
	soanQuyet(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof soanQuyetInput>,
	) {
		return this.soan.quyet(ctx.user.id, input);
	}

	@Mutation({
		input: soanDuaVaoInput,
		output: soanDuaVaoOutput,
		meta: restMeta("POST", "/okr/soan/sessions/{cuocSoanId}/apply", TAG),
	})
	soanDuaVao(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof soanDuaVaoInput>,
	) {
		return this.soan.duaVao(ctx.user.id, input);
	}

	@Query({
		input: cuocIdInput,
		output: soanAnOutput,
		meta: restMeta("GET", "/okr/soan/sessions/{cuocSoanId}/admin", TAG),
	})
	soanAn(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof cuocIdInput>,
	) {
		return this.soan.an(ctx.user.id, input.cuocSoanId);
	}

	@Query({
		input: soanSoDoInput,
		output: soanSoDoOutput,
		meta: restMeta("GET", "/okr/soan/metrics", TAG),
	})
	soanSoDo(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof soanSoDoInput>,
	) {
		return this.soan.soDo(ctx.user.id, input.cycleId);
	}

	@Mutation({
		input: moRaInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/cycles/{cycleId}/review-window", TAG),
	})
	moRa(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof moRaInput>,
	) {
		return this.khep.moRa(ctx.user.id, input);
	}

	@Mutation({
		input: dongRaInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/review-windows/{id}/close", TAG),
	})
	dongRa(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof dongRaInput>,
	) {
		return this.khep.dongRa(ctx.user.id, input.id);
	}

	@Mutation({
		input: moHoiYInput,
		output: hoiYGhiOutput,
		meta: restMeta("POST", "/okr/hoi-y", TAG),
	})
	moHoiY(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof moHoiYInput>,
	) {
		return this.hoiYDv.moHoiY(ctx.user.id, input);
	}

	@Mutation({
		input: suaHoiYInput,
		output: hoiYGhiOutput,
		meta: restMeta("POST", "/okr/hoi-y/{hoiYId}", TAG),
	})
	suaHoiY(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof suaHoiYInput>,
	) {
		return this.hoiYDv.suaHoiY(ctx.user.id, input);
	}

	@Query({
		input: cycleIdInput,
		output: hoiYDocOutput,
		meta: restMeta("GET", "/okr/hoi-y", TAG),
	})
	hoiY(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof cycleIdInput>,
	) {
		return this.hoiYDv.hoiY(ctx.user.id, input);
	}

	@Query({
		input: cycleIdInput,
		output: hoiYNhanOutput,
		meta: restMeta("GET", "/okr/hoi-y/nhan", TAG),
	})
	hoiYNhan(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof cycleIdInput>,
	) {
		return this.hoiYDv.hoiYNhan(ctx.user.id, input);
	}

	@Query({
		input: hoiYIdInput,
		output: hoiYDoPhuOutput,
		meta: restMeta("GET", "/okr/hoi-y/do-phu", TAG),
	})
	hoiYDoPhu(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof hoiYIdInput>,
	) {
		return this.hoiYDv.hoiYDoPhu(ctx.user.id, input);
	}

	@Mutation({
		input: gopYInput,
		output: hoiYGhiOutput,
		meta: restMeta("POST", "/okr/hoi-y/{hoiYId}/y", TAG),
	})
	gopY(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof gopYInput>,
	) {
		return this.hoiYDv.gopY(ctx.user.id, input);
	}

	@Mutation({
		input: suaYInput,
		output: hoiYGhiOutput,
		meta: restMeta("POST", "/okr/hoi-y/y/{yId}/sua", TAG),
	})
	suaY(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof suaYInput>,
	) {
		return this.hoiYDv.suaY(ctx.user.id, input);
	}

	@Mutation({
		input: yIdInput,
		output: hoiYGhiOutput,
		meta: restMeta("POST", "/okr/hoi-y/y/{yId}/go", TAG),
	})
	goY(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof yIdInput>) {
		return this.hoiYDv.goY(ctx.user.id, input);
	}

	@Mutation({
		input: dongYInput,
		output: hoiYGhiOutput,
		meta: restMeta("POST", "/okr/hoi-y/y/{yId}/dong-y", TAG),
	})
	dongY(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof dongYInput>,
	) {
		return this.hoiYDv.dongY(ctx.user.id, input);
	}

	@Mutation({
		input: niemPhongInput,
		output: hoiYGhiOutput,
		meta: restMeta("POST", "/okr/hoi-y/{hoiYId}/niem-phong", TAG),
	})
	niemPhong(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof niemPhongInput>,
	) {
		return this.hoiYDv.niemPhong(ctx.user.id, input);
	}

	@Mutation({
		input: taoChuDeInput,
		output: hoiYGhiOutput,
		meta: restMeta("POST", "/okr/hoi-y/{hoiYId}/chu-de", TAG),
	})
	taoChuDe(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taoChuDeInput>,
	) {
		return this.hoiYDv.taoChuDe(ctx.user.id, input);
	}

	@Mutation({
		input: suaChuDeInput,
		output: hoiYGhiOutput,
		meta: restMeta("POST", "/okr/hoi-y/chu-de/{chuDeId}/sua", TAG),
	})
	suaChuDe(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof suaChuDeInput>,
	) {
		return this.hoiYDv.suaChuDe(ctx.user.id, input);
	}

	@Mutation({
		input: chuDeIdInput,
		output: hoiYGhiOutput,
		meta: restMeta("POST", "/okr/hoi-y/chu-de/{chuDeId}/go", TAG),
	})
	goChuDe(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof chuDeIdInput>,
	) {
		return this.hoiYDv.goChuDe(ctx.user.id, input);
	}

	@Mutation({
		input: ganYInput,
		output: hoiYGhiOutput,
		meta: restMeta("POST", "/okr/hoi-y/y/gan", TAG),
	})
	ganY(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof ganYInput>,
	) {
		return this.hoiYDv.ganY(ctx.user.id, input);
	}

	@Mutation({
		input: ketLuanInput,
		output: hoiYGhiOutput,
		meta: restMeta("POST", "/okr/hoi-y/chu-de/{chuDeId}/ket-luan", TAG),
	})
	ketLuanChuDe(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof ketLuanInput>,
	) {
		return this.hoiYDv.ketLuanChuDe(ctx.user.id, input);
	}

	@Mutation({
		input: hoiYIdInput,
		output: congBoOutput,
		meta: restMeta("POST", "/okr/hoi-y/{hoiYId}/cong-bo", TAG),
	})
	congBo(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof hoiYIdInput>,
	) {
		return this.hoiYDv.congBo(ctx.user.id, input);
	}

	@Mutation({
		input: hoiYIdInput,
		output: hieuViSaoOutput,
		meta: restMeta("POST", "/okr/hoi-y/{hoiYId}/hieu-vi-sao", TAG),
	})
	hieuViSao(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof hoiYIdInput>,
	) {
		return this.hoiYDv.hieuViSao(ctx.user.id, input);
	}

	@Query({
		input: bangChamInput,
		output: bangChamOutput,
		meta: restMeta("POST", "/okr/cycles/{cycleId}/scores", TAG),
	})
	bangCham(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof bangChamInput>,
	) {
		return this.khep.bangCham(ctx.user.id, input);
	}

	@Query({
		input: xuatKyInput,
		output: xuatKyOutput,
		meta: restMeta("GET", "/okr/cycles/{cycleId}/export", TAG),
	})
	xuatKy(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof xuatKyInput>,
	) {
		return this.khep.xuatKy(ctx.user.id, input);
	}

	@Mutation({
		input: chamKrInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/key-results/{keyResultId}/score", TAG),
	})
	chamKr(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof chamKrInput>,
	) {
		return this.khep.chamKr(ctx.user.id, input);
	}

	@Mutation({
		input: ghiDieuHocDuocInput,
		output: okOutput,
		meta: restMeta("PUT", "/okr/objectives/{objectiveId}/lessons", TAG),
	})
	ghiDieuHocDuoc(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof ghiDieuHocDuocInput>,
	) {
		return this.khep.ghiDieuHocDuoc(ctx.user.id, input);
	}

	@Mutation({
		input: moLaiKyInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/cycles/{id}/reopen", TAG),
	})
	moLaiKy(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof moLaiKyInput>,
	) {
		return this.khep.moLaiKy(ctx.user.id, input);
	}

	@Mutation({
		input: mangSangInput,
		output: mangSangOutput,
		meta: restMeta("POST", "/okr/objectives/{objectiveId}/carry-over", TAG),
	})
	mangSang(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof mangSangInput>,
	) {
		return this.khep.mangSang(ctx.user.id, input);
	}

	@Mutation({
		input: datHienThiInput,
		output: datHienThiOutput,
		meta: restMeta("PUT", "/okr/objectives/{objectiveId}/visibility", TAG),
	})
	datHienThi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof datHienThiInput>,
	) {
		return this.hienThi.datHienThi(ctx.user.id, input);
	}

	@Query({ output: programOutput, meta: restMeta("GET", "/okr/program", TAG) })
	program(@Ctx() ctx: AuthedTrpcContext) {
		return this.okr.programFor(ctx.user.id);
	}

	@Mutation({
		input: setProgramInput,
		output: programOutput,
		meta: restMeta("PUT", "/okr/program", TAG),
	})
	setProgram(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof setProgramInput>,
	) {
		return this.okr.setProgram(ctx.user.id, input);
	}

	@Query({
		input: byUnitInput,
		output: byUnitOutput,
		meta: restMeta("POST", "/okr/units/objectives", TAG),
	})
	byUnit(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof byUnitInput>,
	) {
		return this.okr.byUnit(ctx.user.id, input.cycleId, input.unit);
	}

	@Query({
		input: countByUnitInput,
		output: okrCountByUnitOutput,
		meta: restMeta("GET", "/okr/units/count", TAG),
	})
	countByUnit(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof countByUnitInput>,
	) {
		return this.okr.countByUnit(ctx.user.id, input.cycleId);
	}

	@Query({
		input: mineInput,
		output: mineOutput,
		meta: restMeta("GET", "/okr/mine", TAG),
	})
	mine(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof mineInput>,
	) {
		return this.okr.mine(ctx.user.id, input.cycleId);
	}

	@Query({
		input: objectiveInput,
		output: objectiveOutput,
		meta: restMeta("GET", "/okr/objectives/{id}", TAG),
	})
	objective(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof objectiveInput>,
	) {
		return this.okr.objective(ctx.user.id, input.id);
	}

	@Mutation({
		input: createObjectiveInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/objectives", TAG),
	})
	createObjective(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof createObjectiveInput>,
	) {
		return this.okr.createObjective(ctx.user.id, input);
	}

	@Mutation({
		input: updateObjectiveInput,
		output: okOutput,
		meta: restMeta("PATCH", "/okr/objectives/{id}", TAG),
	})
	updateObjective(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof updateObjectiveInput>,
	) {
		return this.okr.updateObjective(ctx.user.id, input);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/objectives/{id}/publish", TAG),
	})
	publishObjective(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.okr.publishObjective(ctx.user.id, input.id);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/objectives/{id}/submit", TAG),
	})
	guiDuyet(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.duyet.guiDuyet(ctx.user.id, input.id);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/objectives/{id}/approve", TAG),
	})
	duyetMucTieu(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.duyet.duyetMucTieu(ctx.user.id, input.id);
	}

	@Mutation({
		input: traLaiInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/objectives/{objectiveId}/return", TAG),
	})
	traLaiMucTieu(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof traLaiInput>,
	) {
		return this.duyet.traLaiMucTieu(ctx.user.id, input);
	}

	@Query({
		input: chuyenDonViInput,
		output: chuyenDonViXemTruocOutput,
		meta: restMeta("POST", "/okr/objectives/move-unit/check", TAG),
	})
	chuyenDonViXemTruoc(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof chuyenDonViInput>,
	) {
		return this.taiCoCau.chuyenDonViXemTruoc(ctx.user.id, input);
	}

	@Mutation({
		input: chuyenDonViInput,
		output: chuyenDonViOutput,
		meta: restMeta("POST", "/okr/objectives/move-unit", TAG),
	})
	chuyenDonVi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof chuyenDonViInput>,
	) {
		return this.taiCoCau.chuyenDonVi(ctx.user.id, input);
	}

	@Query({
		input: moCoiInput,
		output: moCoiOutput,
		meta: restMeta("GET", "/okr/orphans", TAG),
	})
	moCoi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof moCoiInput>,
	) {
		return this.taiCoCau.moCoi(ctx.user.id, input);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/objectives/{id}/withdraw", TAG),
	})
	rutDuyet(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.duyet.rutDuyet(ctx.user.id, input.id);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/objectives/{id}/drop", TAG),
	})
	dropObjective(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.okr.dropObjective(ctx.user.id, input.id);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("DELETE", "/okr/objectives/{id}", TAG),
	})
	xoaMucTieu(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.okr.xoaMucTieu(ctx.user.id, input.id);
	}

	@Mutation({
		input: idInput,
		output: dungLaiOutput,
		meta: restMeta("POST", "/okr/objectives/{id}/reuse", TAG),
	})
	dungLaiMucTieu(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.okr.dungLaiMucTieu(ctx.user.id, input.id);
	}

	@Mutation({
		input: createKrInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/key-results", TAG),
	})
	createKeyResult(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof createKrInput>,
	) {
		return this.okr.createKeyResult(ctx.user.id, input);
	}

	@Mutation({
		input: updateKrInput,
		output: okOutput,
		meta: restMeta("PATCH", "/okr/key-results/{id}", TAG),
	})
	updateKeyResult(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof updateKrInput>,
	) {
		return this.okr.updateKeyResult(ctx.user.id, input);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("DELETE", "/okr/key-results/{id}", TAG),
	})
	removeKeyResult(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.okr.removeKeyResult(ctx.user.id, input.id);
	}

	@Query({
		input: alignmentTreeInput,
		output: alignmentTreeOutput,
		meta: restMeta("GET", "/okr/alignment-tree", TAG),
	})
	alignmentTree(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof alignmentTreeInput>,
	) {
		return this.okr.alignmentTree(ctx.user.id, input.cycleId);
	}

	@Query({
		input: alignmentTargetsInput,
		output: alignmentTargetsOutput,
		meta: restMeta(
			"GET",
			"/okr/objectives/{objectiveId}/alignment-targets",
			TAG,
		),
	})
	alignmentTargets(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof alignmentTargetsInput>,
	) {
		return this.okr.alignmentTargets(ctx.user.id, input.objectiveId);
	}

	@Mutation({
		input: alignmentInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/alignments", TAG),
	})
	addAlignment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof alignmentInput>,
	) {
		return this.okr.addAlignment(ctx.user.id, input);
	}

	@Mutation({
		input: suaLyDoCanChinhInput,
		output: okOutput,
		meta: restMeta("PATCH", "/okr/alignments/{id}", TAG),
	})
	suaLyDoCanChinh(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof suaLyDoCanChinhInput>,
	) {
		return this.okr.suaLyDoCanChinh(ctx.user.id, input);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("DELETE", "/okr/alignments/{id}", TAG),
	})
	removeAlignment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.okr.removeAlignment(ctx.user.id, input.id);
	}

	@Mutation({
		input: okrImportInput,
		output: okrImportPreviewOutput,
		meta: restMeta("POST", "/okr/import/preview", TAG),
	})
	previewImport(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof okrImportInput>,
	) {
		return this.okr.previewImport(ctx.user.id, input);
	}

	@Mutation({
		input: okrImportApplyInput,
		output: okrImportApplyOutput,
		meta: restMeta("POST", "/okr/import", TAG),
	})
	applyImport(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof okrImportApplyInput>,
	) {
		return this.okr.applyImport(ctx.user.id, input);
	}

	@Query({
		input: danhSachInput,
		output: danhSachOutput,
		meta: restMeta("POST", "/okr/units/list", TAG),
	})
	danhSach(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof danhSachInput>,
	) {
		return this.xem.danhSach(ctx.user.id, input);
	}

	@Query({
		input: cycleOnlyInput,
		output: toanCanhOutput,
		meta: restMeta("GET", "/okr/overview", TAG),
	})
	toanCanh(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof cycleOnlyInput>,
	) {
		return this.xem.toanCanh(ctx.user.id, input.cycleId);
	}

	@Query({
		input: cycleOnlyInput,
		output: sucKhoeOutput,
		meta: restMeta("GET", "/okr/program-health", TAG),
	})
	sucKhoe(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof cycleOnlyInput>,
	) {
		return this.xem.sucKhoe(ctx.user.id, input.cycleId);
	}

	@Query({
		input: cycleOnlyInput,
		output: cayCanChinhOutput,
		meta: restMeta("GET", "/okr/alignment-tree-full", TAG),
	})
	cayCanChinh(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof cycleOnlyInput>,
	) {
		return this.xem.cayCanChinh(ctx.user.id, input.cycleId);
	}

	@Query({
		input: cycleOnlyInput,
		output: soDoDonViOutput,
		meta: restMeta("GET", "/okr/unit-map", TAG),
	})
	soDoDonVi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof cycleOnlyInput>,
	) {
		return this.xem.soDoDonVi(ctx.user.id, input.cycleId);
	}

	@Query({
		input: hopTuanInput,
		output: hopTuanOutput,
		meta: restMeta("POST", "/okr/weekly-meeting", TAG),
	})
	hopTuan(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof hopTuanInput>,
	) {
		return this.xem.hopTuan(ctx.user.id, input);
	}

	@Mutation({
		input: hopTuanInput,
		output: moHopTuanOutput,
		meta: restMeta("POST", "/okr/weekly-meeting/opened", TAG),
	})
	moHopTuan(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof hopTuanInput>,
	) {
		return this.xem.moHopTuan(ctx.user.id, input);
	}

	@Query({
		input: dienBienInput,
		output: dienBienOutput,
		meta: restMeta("GET", "/okr/key-results/{keyResultId}/history", TAG),
	})
	dienBien(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof dienBienInput>,
	) {
		return this.xem.dienBien(ctx.user.id, input.keyResultId);
	}

	@Query({
		input: khoiCuaToiInput,
		output: khoiCuaToiOutput,
		meta: restMeta("POST", "/okr/my-key-results", TAG),
	})
	khoiCuaToi(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof khoiCuaToiInput>,
	) {
		return this.xem.khoiCuaToi(ctx.user.id, input);
	}

	@Query({
		output: capNhatTuanOutput,
		meta: restMeta("GET", "/okr/check-ins/mine", TAG),
	})
	capNhatTuan(@Ctx() ctx: AuthedTrpcContext) {
		return this.capNhat.capNhatTuan(ctx.user.id);
	}

	@Mutation({
		input: moCapNhatInput,
		output: moCapNhatOutput,
		meta: restMeta("POST", "/okr/check-in-sessions", TAG),
	})
	moCapNhat(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof moCapNhatInput>,
	) {
		return this.capNhat.moCapNhat(ctx.user.id, input);
	}

	@Mutation({
		input: guiCapNhatInput,
		output: guiCapNhatOutput,
		meta: restMeta("POST", "/okr/check-ins", TAG),
	})
	guiCapNhat(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof guiCapNhatInput>,
	) {
		return this.capNhat.guiCapNhat(ctx.user.id, input);
	}

	@Query({
		output: viecCuaToiOutput,
		meta: restMeta("GET", "/okr/my-work", TAG),
	})
	viecCuaToi(@Ctx() ctx: AuthedTrpcContext) {
		return this.traoDoi.viecCuaToi(ctx.user.id);
	}

	@Query({
		output: thanhVienOutput,
		meta: restMeta("GET", "/okr/members", TAG),
	})
	thanhVien() {
		return this.traoDoi.thanhVien();
	}

	@Query({
		input: commentsInput,
		output: commentsOutput,
		meta: restMeta("GET", "/okr/objectives/{objectiveId}/comments", TAG),
	})
	comments(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof commentsInput>,
	) {
		return this.traoDoi.comments(ctx.user.id, input.objectiveId);
	}

	@Mutation({
		input: addCommentInput,
		output: addCommentOutput,
		meta: restMeta("POST", "/okr/objectives/{objectiveId}/comments", TAG),
	})
	addComment(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof addCommentInput>,
	) {
		return this.traoDoi.addComment(ctx.user.id, input);
	}

	@Query({
		input: canhKrInput,
		output: canhKrOutput,
		meta: restMeta("GET", "/okr/key-results/{keyResultId}/canh", TAG),
	})
	canhKr(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof canhKrInput>,
	) {
		return this.canh.canhKr(ctx.user.id, input.keyResultId);
	}

	@Mutation({
		input: themViecInput,
		output: idOutput,
		meta: restMeta("POST", "/okr/key-results/{keyResultId}/viec", TAG),
	})
	themViec(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof themViecInput>,
	) {
		return this.canh.themViec(ctx.user.id, input);
	}

	@Mutation({
		input: suaViecInput,
		output: idOutput,
		meta: restMeta("POST", "/okr/viec/{id}", TAG),
	})
	suaViec(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof suaViecInput>,
	) {
		return this.canh.suaViec(ctx.user.id, input);
	}

	@Mutation({
		input: danhDauViecInput,
		output: idOutput,
		meta: restMeta("POST", "/okr/viec/{id}/xong", TAG),
	})
	danhDauViec(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof danhDauViecInput>,
	) {
		return this.canh.danhDauViec(ctx.user.id, input);
	}

	@Mutation({
		input: goViecInput,
		output: idOutput,
		meta: restMeta("POST", "/okr/viec/{id}/go", TAG),
	})
	goViec(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof goViecInput>,
	) {
		return this.canh.goViec(ctx.user.id, input);
	}

	@Mutation({
		input: ganSangKienInput,
		output: idOutput,
		meta: restMeta("POST", "/okr/key-results/{keyResultId}/sang-kien", TAG),
	})
	ganSangKien(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof ganSangKienInput>,
	) {
		return this.canh.ganSangKien(ctx.user.id, input);
	}

	@Mutation({
		input: themBangChungInput,
		output: idOutput,
		meta: restMeta("POST", "/okr/key-results/{keyResultId}/bang-chung", TAG),
	})
	themBangChung(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof themBangChungInput>,
	) {
		return this.canh.themBangChung(ctx.user.id, input);
	}

	@Mutation({
		input: goBangChungInput,
		output: idOutput,
		meta: restMeta("POST", "/okr/bang-chung/{id}/go", TAG),
	})
	goBangChung(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof goBangChungInput>,
	) {
		return this.canh.goBangChung(ctx.user.id, input);
	}

	@Mutation({
		input: guiGhiNhanInput,
		output: idOutput,
		meta: restMeta("POST", "/okr/objectives/{objectiveId}/ghi-nhan", TAG),
	})
	guiGhiNhan(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof guiGhiNhanInput>,
	) {
		return this.canh.guiGhiNhan(ctx.user.id, input);
	}

	@Mutation({
		input: goGhiNhanInput,
		output: idOutput,
		meta: restMeta("POST", "/okr/ghi-nhan/{id}/go", TAG),
	})
	goGhiNhan(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof goGhiNhanInput>,
	) {
		return this.canh.goGhiNhan(ctx.user.id, input);
	}

	@Query({
		input: mauInput,
		output: mauOutput,
		meta: restMeta("GET", "/okr/mau", TAG),
	})
	mau(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof mauInput>) {
		return this.khuon.mau(ctx.user.id, input);
	}

	@Mutation({
		input: luuMauVao,
		output: okOutput,
		meta: restMeta("POST", "/okr/mau", TAG),
	})
	luuMau(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof luuMauVao>,
	) {
		return this.khuon.luuMau(ctx.user.id, input);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/mau/{id}/luu-tru", TAG),
	})
	luuTruMau(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.khuon.luuTruMau(ctx.user.id, input.id);
	}

	@Mutation({
		input: idInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/mau/{id}/khoi-phuc", TAG),
	})
	khoiPhucMau(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.khuon.khoiPhucMau(ctx.user.id, input.id);
	}

	@Mutation({
		input: taoTuMauInput,
		output: okOutput,
		meta: restMeta("POST", "/okr/mau/{mauId}/muc-tieu", TAG),
	})
	taoTuMau(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof taoTuMauInput>,
	) {
		return this.khuon.taoTuMau(ctx.user.id, input);
	}

	@Mutation({
		input: followInput,
		output: followOutput,
		meta: restMeta("PUT", "/okr/objectives/{objectiveId}/follow", TAG),
	})
	follow(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof followInput>,
	) {
		return this.traoDoi.follow(ctx.user.id, input);
	}

	@Query({
		input: transferOkrPreviewInput,
		output: transferOkrOutput,
		meta: restMeta("GET", "/okr/transfer/{fromUserId}", TAG),
	})
	transferPreview(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof transferOkrPreviewInput>,
	) {
		return this.traoDoi.transferPreview(ctx.user.id, input);
	}

	@Mutation({
		input: transferOkrInput,
		output: transferOkrOutput,
		meta: restMeta("POST", "/okr/transfer", TAG),
	})
	transferWork(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof transferOkrInput>,
	) {
		return this.traoDoi.transferWork(ctx.user.id, input);
	}

	@Query({ output: chiSoOutput, meta: restMeta("GET", "/okr/metrics", TAG) })
	chiSo() {
		return this.so.chiSo();
	}

	@Query({
		input: xemTruocChiSoInput,
		output: xemTruocChiSoOutput,
		meta: restMeta("POST", "/okr/metrics/preview", TAG),
	})
	xemTruocChiSo(@Input() input: z.infer<typeof xemTruocChiSoInput>) {
		return this.so.xemTruocChiSo(input);
	}

	@Mutation({
		input: datNguonKrVao,
		output: datNguonKrOutput,
		meta: restMeta("POST", "/okr/key-results/{keyResultId}/source", TAG),
	})
	datNguonKr(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof datNguonKrVao>,
	) {
		return this.so.datNguonKr(ctx.user.id, input);
	}

	@Query({
		input: lichSuSoInput,
		output: lichSuSoOutput,
		meta: restMeta("GET", "/okr/key-results/{keyResultId}/snapshots", TAG),
	})
	lichSuSo(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof lichSuSoInput>,
	) {
		return this.so.lichSuSo(ctx.user.id, input.keyResultId);
	}

	@Query({
		input: banGhiChiSoInput,
		output: banGhiChiSoOutput,
		meta: restMeta("GET", "/okr/key-results/{keyResultId}/records", TAG),
	})
	banGhiChiSo(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof banGhiChiSoInput>,
	) {
		return this.so.banGhiChiSo(ctx.user.id, input);
	}

	@Mutation({
		input: ghiSoKrInput,
		output: ghiSoKrOutput,
		meta: restMeta("POST", "/okr/key-results/{id}/value", TAG),
	})
	ghiSoKr(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof ghiSoKrInput>,
	) {
		return this.so.ghiSoKr(ctx.user.id, input);
	}
}
