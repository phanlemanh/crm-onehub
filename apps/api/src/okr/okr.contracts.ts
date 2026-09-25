import {
	chuKyInput,
	LOAI_CHU_KY,
	PHA_CHU_KY,
} from "@crm/validation/okr-chu-ky";
import { okrProgram } from "@crm/validation/okr-chuong-trinh";
import { KIEU_KR, krInput, NGUON_KR } from "@crm/validation/okr-kr";
import {
	CAP_MUC_TIEU,
	LOAI_MUC_TIEU,
	mucTieuInput,
	mucTieuUpdate,
	TRANG_THAI_MUC_TIEU,
} from "@crm/validation/okr-muc-tieu";
import { HANH_DONG_VET, okrVetSnapshot } from "@crm/validation/okr-vet";
import { z } from "zod";
import { OKR } from "./okr-config";

const ma = z.string().trim().min(1).max(120);
const ngay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const nguoiOkr = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
});

export const chuKyOutput = z.object({
	id: z.string(),
	kind: z.enum(LOAI_CHU_KY),
	name: z.string(),
	parentId: z.string().nullable(),
	startsOn: ngay,
	endsOn: ngay,
	phase: z.enum(PHA_CHU_KY),
	breakStartsOn: ngay.nullable(),
	breakEndsOn: ngay.nullable(),
	updateWeekday: z.number(),
});
export const cyclesOutput = z.object({
	cycles: z.array(chuKyOutput),
	currentId: z.string().nullable(),
});
export const createCycleInput = chuKyInput;
export const setCyclePhaseInput = z.object({
	id: ma,
	phase: z.enum(PHA_CHU_KY),
});
export const programOutput = okrProgram.extend({
	version: z.number(),
	canManage: z.boolean(),
});
export const setProgramInput = okrProgram;
export const okrAccessOutput = z.object({
	canManageProgram: z.boolean(),
	headOf: z.object({
		divisions: z.array(z.string()),
		departments: z.array(z.string()),
	}),
});

export const krOutput = z.object({
	id: z.string(),
	objectiveId: z.string(),
	title: z.string(),
	kind: z.enum(KIEU_KR),
	owner: nguoiOkr,
	startValue: z.number(),
	targetValue: z.number(),
	currentValue: z.number(),
	unit: z.string(),
	dueOn: ngay.nullable(),
	weight: z.number(),
	source: z.enum(NGUON_KR),
	startLocked: z.boolean(),
	progress: z.number(),
	laCuaToi: z.boolean(),
});
export const noiGopOutput = z.object({
	alignmentId: z.string(),
	targetObjectiveId: z.string(),
	targetKeyResultId: z.string().nullable(),
	unitName: z.string(),
	objectiveTitle: z.string(),
	keyResultTitle: z.string().nullable(),
});
export const mucTieuOutput = z.object({
	id: z.string(),
	cycleId: z.string(),
	level: z.enum(CAP_MUC_TIEU),
	unitId: z.string().nullable(),
	unitName: z.string(),
	title: z.string(),
	kind: z.enum(LOAI_MUC_TIEU),
	status: z.enum(TRANG_THAI_MUC_TIEU),
	owner: nguoiOkr,
	participants: z.array(nguoiOkr),
	whyNow: z.string(),
	publishedAt: z.string().nullable(),
	droppedAt: z.string().nullable(),
	progress: z.number(),
	expected: z.number().nullable(),
	keyResults: z.array(krOutput),
	alignments: z.array(noiGopOutput),
	canEdit: z.boolean(),
});
export const vetOutput = z.object({
	id: z.string(),
	at: z.string(),
	actor: nguoiOkr.nullable(),
	action: z.enum(HANH_DONG_VET),
	keyResultId: z.string().nullable(),
	before: okrVetSnapshot.nullable(),
	after: okrVetSnapshot.nullable(),
	note: z.string().nullable(),
});
export const donViChon = z.union([
	z.object({ loai: z.literal("goc") }),
	z.object({ loai: z.literal("bp"), id: ma }),
	z.object({ loai: z.literal("pb"), id: ma }),
	z.object({ loai: z.literal("nguoi"), id: ma }),
]);
export const byUnitInput = z.object({ cycleId: ma, unit: donViChon });
export const byUnitOutput = z.object({
	objectives: z.array(mucTieuOutput),
	canEdit: z.boolean(),
	canhBao: z.string().nullable(),
});
export const countByUnitInput = z.object({ cycleId: ma });
export const okrCountByUnitOutput = z.record(z.string(), z.number());
export const mineInput = z.object({ cycleId: ma });
export const mineOutput = z.object({ objectives: z.array(mucTieuOutput) });
export const objectiveInput = z.object({ id: ma });
export const objectiveOutput = mucTieuOutput.extend({
	trail: z.array(vetOutput),
	canEditKr: z.array(z.string()),
});
export const createObjectiveInput = mucTieuInput;
export const updateObjectiveInput = mucTieuUpdate;
export const idInput = z.object({ id: ma });
export const okOutput = z.object({
	id: z.string(),
	canhBao: z.string().nullable(),
});
export const createKrInput = krInput.extend({ objectiveId: ma });
export const updateKrInput = krInput.partial().extend({ id: ma });
export const alignmentInput = z.object({
	objectiveId: ma,
	targetObjectiveId: ma.nullable(),
	targetKeyResultId: ma.nullable(),
});
export const alignmentTargetsInput = z.object({ objectiveId: ma });
export const alignmentTargetsOutput = z.object({
	targets: z.array(
		z.object({
			objectiveId: z.string(),
			keyResultId: z.string().nullable(),
			label: z.string(),
			unitName: z.string(),
		}),
	),
});
export const nutCanChinh: z.ZodType<NutCanChinh> = z.lazy(() =>
	z.object({
		id: z.string(),
		loai: z.enum(["muc-tieu", "kr"]),
		objectiveId: z.string(),
		unitName: z.string(),
		title: z.string(),
		progress: z.number(),
		status: z.enum(TRANG_THAI_MUC_TIEU),
		kind: z.enum(LOAI_MUC_TIEU),
		gop: z.number(),
		lapLai: z.boolean(),
		children: z.array(nutCanChinh),
	}),
);
export type NutCanChinh = {
	id: string;
	loai: "muc-tieu" | "kr";
	objectiveId: string;
	unitName: string;
	title: string;
	progress: number;
	status: (typeof TRANG_THAI_MUC_TIEU)[number];
	kind: (typeof LOAI_MUC_TIEU)[number];
	gop: number;
	lapLai: boolean;
	children: NutCanChinh[];
};
export const alignmentTreeInput = z.object({ cycleId: ma });
export const alignmentTreeOutput = z.object({
	roots: z.array(nutCanChinh),
	chuaCanChinh: z.array(nutCanChinh),
});
export const okrImportInput = z.object({
	cycleId: ma,
	unit: donViChon,
	text: z.string().max(OKR.lo.toiDaKyTu),
});
export const okrImportApplyInput = okrImportInput.extend({
	congBo: z.boolean(),
});
export const okrDongNhapOutput = z.object({
	line: z.number(),
	objective: z.string(),
	keyResult: z.string(),
	kind: z.string(),
	start: z.string(),
	target: z.string(),
	unit: z.string(),
	email: z.string(),
	error: z.string().nullable(),
});
export const okrImportPreviewOutput = z.object({
	rows: z.array(okrDongNhapOutput),
	summary: z.object({
		valid: z.number(),
		invalid: z.number(),
		objectives: z.number(),
	}),
});
export const okrImportApplyOutput = z.object({
	written: z.number(),
	objectives: z.number(),
	keyResults: z.number(),
});

export type ChuKyOutput = z.infer<typeof chuKyOutput>;
export type MucTieuOutput = z.infer<typeof mucTieuOutput>;
export type AlignmentTreeOutput = z.infer<typeof alignmentTreeOutput>;
export type KrOutput = z.infer<typeof krOutput>;
export type DonViChon = z.infer<typeof donViChon>;
export type OkrDongNhapOutput = z.infer<typeof okrDongNhapOutput>;
export type VetOutput = z.infer<typeof vetOutput>;
export type ObjectiveOutput = z.infer<typeof objectiveOutput>;
export type CreateKrInput = z.infer<typeof createKrInput>;
export type UpdateKrInput = z.infer<typeof updateKrInput>;
export type { DonViMucTieu } from "@crm/validation/okr-muc-tieu";
