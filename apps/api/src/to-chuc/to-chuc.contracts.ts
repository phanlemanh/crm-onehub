import {
	ketQuaKhoiPhuc,
	lyDoChanLuuTru,
} from "@crm/validation/to-chuc-luu-tru";
import { z } from "zod";
import { TO_CHUC } from "./to-chuc-config";

const ma = z.string().trim().min(1).max(120);
const tenTho = z.string().max(500);
const moTaVao = z.string().max(TO_CHUC.vao.moTaToiDa);
const chucDanhVao = z.string().max(TO_CHUC.vao.chucDanhToiDa);

export const orgIdInput = z.object({ id: ma });
export const orgDivisionCreateInput = z.object({ name: tenTho });
export const orgRenameInput = z.object({
	id: ma,
	name: tenTho,
	moTa: moTaVao.optional(),
});
export const orgReorderInput = z.object({ ids: z.array(ma).min(1).max(200) });
export const orgDepartmentCreateInput = z.object({
	name: tenTho,
	divisionId: ma.nullable(),
});
export const orgAttachInput = z.object({
	divisionId: ma,
	departmentIds: z.array(ma).min(1).max(TO_CHUC.lo.toiDa),
});
export const orgAddPeopleInput = z.object({
	departmentId: ma,
	userIds: z.array(ma).min(1).max(TO_CHUC.lo.toiDa),
});
export const orgDepartmentMoveInput = z.object({
	id: ma,
	divisionId: ma.nullable(),
	index: z.int().min(0).max(500),
});
export const orgHeadInput = z.object({
	kind: z.enum(["division", "department"]),
	id: ma,
	userId: ma.nullable(),
});
export const orgPlacementInput = z.object({
	userId: ma,
	primaryDepartmentId: ma.nullable(),
	secondaryDepartmentIds: z.array(ma).max(50),
	managerUserId: ma.nullable(),
	chucDanh: chucDanhVao.optional(),
});
export const orgImportInput = z.object({
	text: z.string().max(TO_CHUC.nhap.toiDaKyTu),
});
export const orgImportApplyInput = orgImportInput.extend({
	traTen: z.boolean().optional(),
});

export const nguoiOutput = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
});
export const nguoiTrongPhongBan = nguoiOutput.extend({ primary: z.boolean() });
export const phongBanNode = z.object({
	id: z.string(),
	name: z.string(),
	moTa: z.string(),
	position: z.number(),
	divisionId: z.string().nullable(),
	head: nguoiOutput.nullable(),
	stepCount: z.number(),
	okrMo: z.number(),
	people: z.array(nguoiTrongPhongBan),
});
export const boPhanNode = z.object({
	id: z.string(),
	name: z.string(),
	moTa: z.string(),
	position: z.number(),
	head: nguoiOutput.nullable(),
	okrMo: z.number(),
	departments: z.array(phongBanNode),
});
export const nguonQuanLy = z.enum([
	"chon-tay",
	"truong-phong-ban",
	"truong-bo-phan",
	"khong-co",
]);
export const viTriNguoi = nguoiOutput.extend({
	primaryDepartmentId: z.string().nullable(),
	secondaryDepartmentIds: z.array(z.string()),
	managerOverrideId: z.string().nullable(),
	manager: nguoiOutput.nullable(),
	managerSource: nguonQuanLy,
	chucDanh: z.string(),
});
export const donViLuuTru = z.object({
	id: z.string(),
	name: z.string(),
	okrMo: z.number(),
	purgeable: z.boolean(),
});
export const orgTreeOutput = z.object({
	divisions: z.array(boPhanNode),
	chuaXep: z.array(phongBanNode),
	chuaCoPhongBan: z.array(nguoiOutput),
	people: z.array(viTriNguoi),
	archived: z.object({
		divisions: z.array(donViLuuTru),
		departments: z.array(donViLuuTru),
	}),
	coverage: z.object({
		members: z.number(),
		withPrimary: z.number(),
		departmentsWithoutHead: z.number(),
	}),
});
export const orgAccessOutput = z.object({ canManage: z.boolean() });
export const orgOkOutput = z.object({ id: z.string() });
export type {
	KetQuaKhoiPhuc,
	LyDoChanLuuTru,
} from "@crm/validation/to-chuc-luu-tru";
export const orgKhoiPhucOutput = ketQuaKhoiPhuc;
export { lyDoChanLuuTru };
export const orgLuuTruXemTruocOutput = z.object({
	lyDo: z.array(lyDoChanLuuTru),
});
export const orgDepartmentArchiveOutput = orgOkOutput.extend({
	purgeable: z.boolean(),
});
export const dongNhapOutput = z.object({
	line: z.number(),
	email: z.string(),
	department: z.string(),
	division: z.string(),
	head: z.string(),
	error: z.string().nullable(),
});
export const orgImportPreviewOutput = z.object({
	rows: z.array(dongNhapOutput),
	summary: z.object({
		valid: z.number(),
		invalid: z.number(),
		newDepartments: z.number(),
		newDivisions: z.number(),
	}),
	newNames: z.object({
		departments: z.array(z.string()),
		divisions: z.array(z.string()),
	}),
});
export const orgImportApplyOutput = z.object({
	written: z.number(),
	newDepartments: z.number(),
	newDivisions: z.number(),
	newNames: z
		.object({
			departments: z.array(z.string()),
			divisions: z.array(z.string()),
		})
		.optional(),
});

export type RenameInput = z.infer<typeof orgRenameInput>;
export type TreeOutput = z.infer<typeof orgTreeOutput>;
export type NguoiOutput = z.infer<typeof nguoiOutput>;
export type NguonQuanLy = z.infer<typeof nguonQuanLy>;
export type PlacementInput = z.infer<typeof orgPlacementInput>;
export type HeadInput = z.infer<typeof orgHeadInput>;
export type DepartmentMoveInput = z.infer<typeof orgDepartmentMoveInput>;
export type AttachInput = z.infer<typeof orgAttachInput>;
export type AddPeopleInput = z.infer<typeof orgAddPeopleInput>;
export type DepartmentCreateInput = z.infer<typeof orgDepartmentCreateInput>;
export type ImportPreviewOutput = z.infer<typeof orgImportPreviewOutput>;
export type ImportApplyOutput = z.infer<typeof orgImportApplyOutput>;
