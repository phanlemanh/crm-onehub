import { loaiGiaiDoan, nhanGiaiDoan } from "@crm/validation/giai-doan";
import { z } from "zod";

export const giaiDoanRow = z.object({
	id: z.string(),
	label: z.string(),
	kind: loaiGiaiDoan,
	position: z.number().int(),
	dealCount: z.number().int(),
});

export const giaiDoanListOutput = z.object({
	canManage: z.boolean(),
	tran: z.number().int(),
	stages: z.array(giaiDoanRow),
});

export type GiaiDoanList = z.infer<typeof giaiDoanListOutput>;

export const giaiDoanCreateInput = z.object({
	label: nhanGiaiDoan,
	kind: loaiGiaiDoan,
});

export const giaiDoanRenameInput = z.object({
	id: z.string().min(1),
	label: nhanGiaiDoan,
});

export const giaiDoanReorderInput = z.object({
	kind: loaiGiaiDoan,
	ids: z.array(z.string().min(1)).min(1),
});

export const giaiDoanArchiveInput = z.object({
	id: z.string().min(1),
	moveTo: z.string().min(1).optional(),
});

export const giaiDoanRestoreInput = z.object({
	id: z.string().min(1),
});

export const giaiDoanArchivedOutput = z.array(
	z.object({
		id: z.string(),
		label: z.string(),
		kind: loaiGiaiDoan,
		archivedAt: z.string(),
	}),
);

export type GiaiDoanArchived = z.infer<typeof giaiDoanArchivedOutput>;

export const giaiDoanWriteOutput = z.object({ id: z.string() });

export type GiaiDoanCreateInput = z.infer<typeof giaiDoanCreateInput>;
export type GiaiDoanRenameInput = z.infer<typeof giaiDoanRenameInput>;
export type GiaiDoanReorderInput = z.infer<typeof giaiDoanReorderInput>;
export type GiaiDoanArchiveInput = z.infer<typeof giaiDoanArchiveInput>;
export type GiaiDoanRestoreInput = z.infer<typeof giaiDoanRestoreInput>;
