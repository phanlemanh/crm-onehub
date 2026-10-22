import { kieuTepSchema, TEP_TRUONG } from "@crm/validation/tep-truong";
import { z } from "zod";
import { fieldEntity } from "./fields.contracts";

const oTep = {
	entity: fieldEntity,
	recordId: z.string().trim().min(1),
	fieldKey: z.string().trim().min(1),
	tenTep: z.string().trim().min(1).max(TEP_TRUONG.tenToiDa),
};

export const fieldFileStatusOutput = z.object({ bat: z.boolean() });

export const fieldFileRequestUploadInput = z.object({
	...oTep,
	kieu: kieuTepSchema,
	kichThuoc: z.number().int().nonnegative(),
});

export type FieldFileRequestUploadInput = z.infer<
	typeof fieldFileRequestUploadInput
>;

export const fieldFileRequestUploadOutput = z.object({
	pathname: z.string(),
	url: z.string().url(),
	hetHan: z.number().int(),
	phieu: z.string(),
});

export const fieldFileCompleteInput = z.object({
	...oTep,
	pathname: z.string().trim().min(1),
	phieu: z.string().trim().min(1),
});

export type FieldFileCompleteInput = z.infer<typeof fieldFileCompleteInput>;

export const fieldFileCompleteOutput = z.object({
	tepId: z.string(),
	trung: z.boolean(),
});

export const fieldFileIdInput = z.object({ tepId: z.string().trim().min(1) });

export const fieldFileDownloadOutput = z.object({
	url: z.string().url(),
	hetHan: z.number().int(),
});

export const fieldFileRemoveOutput = z.object({ tepId: z.string() });
