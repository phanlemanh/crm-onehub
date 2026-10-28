import { z } from "zod";

export const BINH_LUAN_TOI_DA = 2000;
export const NHAC_TEN_TOI_DA = 20;
const ma = z.string().trim().min(1).max(120);

export const LOI_KHUON_TRAO_DOI = {
	rong: "Bình luận không được để trống.",
	quaDai: `Bình luận tối đa ${BINH_LUAN_TOI_DA.toLocaleString("vi-VN")} ký tự.`,
} as const;

export const commentsInput = z.object({ objectiveId: ma }).strict();
export const addCommentInput = z
	.object({
		objectiveId: ma,
		keyResultId: ma.optional(),
		checkInId: ma.optional(),
		body: z
			.string()
			.trim()
			.min(1, { error: LOI_KHUON_TRAO_DOI.rong })
			.max(BINH_LUAN_TOI_DA, { error: LOI_KHUON_TRAO_DOI.quaDai }),
		mentionUserIds: z.array(ma).max(NHAC_TEN_TOI_DA),
	})
	.strict();
export type AddCommentInput = z.infer<typeof addCommentInput>;
export const followInput = z
	.object({ objectiveId: ma, on: z.boolean() })
	.strict();
export type FollowInput = z.infer<typeof followInput>;
export const transferOkrPreviewInput = z.object({ fromUserId: ma }).strict();
export type TransferOkrPreviewInput = z.infer<typeof transferOkrPreviewInput>;
export const transferOkrInput = z
	.object({ fromUserId: ma, toUserId: ma })
	.strict();
export type TransferOkrInput = z.infer<typeof transferOkrInput>;
