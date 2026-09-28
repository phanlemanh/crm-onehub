import { guiCapNhatInput, moCapNhatInput } from "@crm/validation/okr-cap-nhat";
import {
	chamKrInput,
	dongRaInput,
	ghiDieuHocDuocInput,
	mangSangInput,
	moLaiKyInput,
	moRaInput,
	xuatKyInput,
} from "@crm/validation/okr-khep";
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
	commentsOutput,
	countByUnitInput,
	createCycleInput,
	createKrInput,
	createObjectiveInput,
	cyclesOutput,
	followOutput,
	guiCapNhatOutput,
	idInput,
	mineInput,
	mineOutput,
	moCapNhatOutput,
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
	thanhVienOutput,
	transferOkrOutput,
	updateKrInput,
	updateObjectiveInput,
	viecCuaToiOutput,
} from "./okr.contracts";
import { OkrService } from "./okr.service";
import { OkrCapNhatService } from "./okr-cap-nhat.service";
import {
	bangChamInput,
	bangChamOutput,
	mangSangOutput,
	xuatKyOutput,
} from "./okr-khep.contracts";
import { OkrKhepService } from "./okr-khep.service";
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
	sucKhoeOutput,
	toanCanhOutput,
} from "./okr-xem.contracts";
import { OkrXemService } from "./okr-xem.service";
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

	@Query({
		output: aiChiTieuOutput,
		meta: restMeta("GET", "/okr/ai-spend", TAG),
	})
	aiChiTieu(@Ctx() ctx: AuthedTrpcContext) {
		return this.troLy.aiChiTieu(ctx.user.id);
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
	countByUnit(@Input() input: z.infer<typeof countByUnitInput>) {
		return this.okr.countByUnit(input.cycleId);
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
		meta: restMeta("POST", "/okr/objectives/{id}/drop", TAG),
	})
	dropObjective(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof idInput>,
	) {
		return this.okr.dropObjective(ctx.user.id, input.id);
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
	alignmentTargets(@Input() input: z.infer<typeof alignmentTargetsInput>) {
		return this.okr.alignmentTargets(input.objectiveId);
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
	dienBien(@Input() input: z.infer<typeof dienBienInput>) {
		return this.xem.dienBien(input.keyResultId);
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
	comments(@Input() input: z.infer<typeof commentsInput>) {
		return this.traoDoi.comments(input.objectiveId);
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
	lichSuSo(@Input() input: z.infer<typeof lichSuSoInput>) {
		return this.so.lichSuSo(input.keyResultId);
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
