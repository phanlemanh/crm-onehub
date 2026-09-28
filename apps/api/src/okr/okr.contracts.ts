import { doiSoat, nhomViecAi } from "@crm/validation/ai-chi-phi";
import { viecOkr } from "@crm/validation/nhac-ke-hoach";
import { MUC_TU_TIN } from "@crm/validation/okr-cap-nhat";
import {
	chuKyInput,
	LOAI_CHU_KY,
	PHA_CHU_KY,
} from "@crm/validation/okr-chu-ky";
import { okrProgram, okrProgramSua } from "@crm/validation/okr-chuong-trinh";
import { lyDoDoiDich } from "@crm/validation/okr-khep";
import { KIEU_KR, krInput, NGUON_KR } from "@crm/validation/okr-kr";
import {
	CAP_MUC_TIEU,
	LOAI_MUC_TIEU,
	mucTieuInput,
	mucTieuUpdate,
	TRANG_THAI_MUC_TIEU,
} from "@crm/validation/okr-muc-tieu";
import { LOAI_NGUON_MAY, okrNguonDong } from "@crm/validation/okr-nguon";
import {
	lyDoKhongSanSang,
	MA_VAN_DE,
	maLoaiDeXuat,
	TRUONG_VIET_LAI,
	trangThaiDeXuat,
	troLySanSang,
} from "@crm/validation/okr-tro-ly";
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

export const cuaSoRaOutput = z.object({
	id: z.string(),
	tuNgay: ngay,
	denNgay: ngay,
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
	cuaSoRa: cuaSoRaOutput.nullable(),
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
export const setProgramInput = okrProgramSua;

export const aiChiTieuOutput = z.object({
	thang: z.string(),
	theoNhom: z.array(
		z.object({
			nhom: nhomViecAi,
			soBuoc: z.number().int().nonnegative(),
			usd: z.number().nonnegative(),
		}),
	),
	tongUsd: z.number().nonnegative(),
	troLyOkr: z.object({
		chiUsd: z.number().nonnegative(),
		tranUsd: z.number().nonnegative(),
		phanTram: z.number().nonnegative(),
	}),
	sanSang: troLySanSang,
	dangKiem: z.boolean(),
	doiSoat: doiSoat.nullable(),
});

export type AiChiTieuOutput = z.infer<typeof aiChiTieuOutput>;

export const CACH_QUYET = ["nhan", "sua", "bac", "bo-qua"] as const;
const nacLuot = z.enum(["bat", "an"]);
const thang = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export const troLyDichInput = z.object({
	objectiveId: ma,
	keyResultId: ma.optional(),
});
export const troLySanSangOutput = troLySanSang;
export const troLyDeXuatOutput = z.discriminatedUnion("bat", [
	z.object({ bat: z.literal(true), taskId: z.string(), dungLai: z.boolean() }),
	z.object({ bat: z.literal(false), lyDo: lyDoKhongSanSang }),
]);
const noiDungDong = {
	id: z.string(),
	loai: z.enum(["viet-lai", "hoi", "can-chinh"]),
	objectiveId: z.string(),
	keyResultId: z.string().nullable(),
	truong: z.enum(TRUONG_VIET_LAI).nullable(),
	truoc: z.string().nullable(),
	sau: z.string().nullable(),
	maVanDe: z.enum(MA_VAN_DE).nullable(),
	targetObjectiveId: z.string().nullable(),
	targetKeyResultId: z.string().nullable(),
	lyDo: z.string(),
};
export const dongHien = z.object({
	...noiDungDong,
	tenDich: z.string().nullable(),
});
export const troLyDanhSachOutput = z.object({
	dong: z.array(dongHien),
	dangSoan: z.boolean(),
	maKetThuc: z.string().nullable(),
	lyDo: lyDoKhongSanSang.nullable(),
});
export const troLyQuyetInput = z.object({
	deXuatId: ma,
	cach: z.enum(CACH_QUYET),
	giaTri: z.string().trim().min(1).max(OKR.ten.viSao).optional(),
});
export const troLyQuyetOutput = z.discriminatedUnion("ok", [
	z.object({ ok: z.literal(true) }),
	z.object({ ok: z.literal(false), lyDo: lyDoKhongSanSang }),
]);
export const troLyAnInput = z.object({
	thang: thang.optional(),
	nac: nacLuot.optional(),
});
export const dongLuot = z.object({
	...noiDungDong,
	trangThai: trangThaiDeXuat,
	maLoai: maLoaiDeXuat.nullable(),
});
export const luotTroLy = z.object({
	taskId: z.string(),
	nac: nacLuot,
	objectiveId: z.string().nullable(),
	tenMucTieu: z.string().nullable(),
	keyResultId: z.string().nullable(),
	nguoiYeuCau: z.string().nullable(),
	taoLuc: z.string(),
	xongLuc: z.string().nullable(),
	ketQua: z.string().nullable(),
	doTreMs: z.number().nullable(),
	chiPhiUsd: z.number(),
	dong: z.array(dongLuot),
});
export const troLyAnOutput = z.object({
	thang,
	luot: z.array(luotTroLy),
});
export const troLySoDoInput = z.object({ thang: thang.optional() });
const tyLe = z.number().nullable();
export const soDoNac = z.object({
	soLuot: z.number().int(),
	sinhRa: z.number().int(),
	daHien: z.number().int(),
	nhan: z.number().int(),
	sua: z.number().int(),
	bac: z.number().int(),
	boQua: z.number().int(),
	tyLeNhan: tyLe,
	tyLeSua: tyLe,
	tyLeBac: tyLe,
	tyLeBoQua: tyLe,
	tyLeDuocNhan: tyLe,
	daNhan: z.number().int(),
	hoanTac: z.number().int(),
	tyLeHoanTac: tyLe,
	soLuotDo: z.number().int(),
	p50Ms: z.number().int().nullable(),
	p90Ms: z.number().int().nullable(),
	tongCau: z.number().int(),
	biLoai: z.number().int(),
	tyLeBiLoai: tyLe,
	theoMa: z.array(z.object({ maLoai: maLoaiDeXuat, so: z.number().int() })),
	tienUsd: z.number(),
	chiPhiMoiNhanUsd: z.number().nullable(),
	chiPhiMoiLuotUsd: z.number().nullable(),
});
export const troLySoDoOutput = z.object({
	thang,
	bat: soDoNac,
	an: soDoNac,
});
export const xuHuongKrInput = z.object({ keyResultId: ma });
export const xuHuongKrOutput = z
	.object({ moiTuan: z.number(), uocCuoiKy: z.number() })
	.nullable();

export type TroLyDichInput = z.infer<typeof troLyDichInput>;
export type TroLyDeXuatOutput = z.infer<typeof troLyDeXuatOutput>;
export type DongHien = z.infer<typeof dongHien>;
export type TroLyDanhSachOutput = z.infer<typeof troLyDanhSachOutput>;
export type TroLyQuyetInput = z.infer<typeof troLyQuyetInput>;
export type TroLyQuyetOutput = z.infer<typeof troLyQuyetOutput>;
export type TroLyAnInput = z.infer<typeof troLyAnInput>;
export type DongLuot = z.infer<typeof dongLuot>;
export type LuotTroLy = z.infer<typeof luotTroLy>;
export type TroLyAnOutput = z.infer<typeof troLyAnOutput>;
export type SoDoNac = z.infer<typeof soDoNac>;
export type TroLySoDoOutput = z.infer<typeof troLySoDoOutput>;
export type XuHuongKrOutput = z.infer<typeof xuHuongKrOutput>;
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
	doCanh: z.boolean(),
	soMay: z
		.object({
			giaTri: z.number(),
			ngay,
			nguon: z.enum(LOAI_NGUON_MAY),
		})
		.nullable(),
	nguonMay: okrNguonDong
		.extend({ docLuc: z.string().nullable(), docGiaTri: z.number().nullable() })
		.nullable(),
	startLocked: z.boolean(),
	progress: z.number(),
	laCuaToi: z.boolean(),
	hienTaiQuaCapNhat: z.boolean(),
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
	following: z.boolean(),
	followerCount: z.number(),
	theoDoi: z.boolean(),
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
export const lienKetMangSang = z
	.object({ objectiveId: z.string(), cycleName: z.string() })
	.nullable();

export const objectiveOutput = mucTieuOutput.extend({
	cycleName: z.string(),
	mangSangToi: lienKetMangSang,
	mangSangTu: lienKetMangSang,
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
export const updateKrInput = krInput
	.partial()
	.extend({ id: ma, lyDoDoiDich: lyDoDoiDich.optional() });
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
export const capNhatTuanOutput = z.object({
	items: z.array(
		z.object({
			keyResultId: z.string(),
			title: z.string(),
			objectiveId: z.string(),
			objectiveTitle: z.string(),
			unitName: z.string(),
			kind: z.enum(KIEU_KR),
			unit: z.string(),
			targetValue: z.number(),
			currentValue: z.number(),
			lastConfidence: z.enum(MUC_TU_TIN).nullable(),
			lastAt: z.string().nullable(),
			updatedThisWeek: z.boolean(),
			nguon: z.enum(NGUON_KR),
			doCanh: z.boolean(),
			soMay: z
				.object({
					giaTri: z.number(),
					ngay,
					nguon: z.enum(LOAI_NGUON_MAY),
				})
				.nullable(),
		}),
	),
	weekStart: ngay,
	dueWeekday: z.number().nullable(),
});
export const moCapNhatOutput = z.object({ sessionId: z.string() });
export const guiCapNhatOutput = z.object({
	written: z.number(),
	seconds: z.number(),
});

export const commentsOutput = z.object({
	comments: z.array(
		z.object({
			id: z.string(),
			author: nguoiOkr,
			keyResultId: z.string().nullable(),
			keyResultTitle: z.string().nullable(),
			body: z.string(),
			createdAt: z.string(),
			mentions: z.array(nguoiOkr),
		}),
	),
});
export const addCommentOutput = z.object({ id: z.string() });
export const thanhVienOutput = z.array(nguoiOkr);
export const followOutput = z.object({
	following: z.boolean(),
	followerCount: z.number(),
});
export const viecCuaToiOutput = z.object({
	viec: z.array(viecOkr),
	lienQuanOkr: z.boolean(),
});
export const transferOkrOutput = z.object({
	kr: z.number(),
	mucTieu: z.number(),
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
export type CapNhatTuanOutput = z.infer<typeof capNhatTuanOutput>;
export type CommentsOutput = z.infer<typeof commentsOutput>;
export type FollowOutput = z.infer<typeof followOutput>;
export type ThanhVienOutput = z.infer<typeof thanhVienOutput>;
export type ViecOkrOutput = z.infer<typeof viecOkr>;
export type ViecCuaToiOutput = z.infer<typeof viecCuaToiOutput>;
export type TransferOkrOutput = z.infer<typeof transferOkrOutput>;
export type { DonViMucTieu } from "@crm/validation/okr-muc-tieu";
