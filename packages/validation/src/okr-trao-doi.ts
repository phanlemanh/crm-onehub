import { z } from "zod";

export const BINH_LUAN_TOI_DA = 2000;
const ma = z.string().trim().min(1).max(120);

export const commentsInput = z.object({ objectiveId: ma }).strict();
export const addCommentInput = z
	.object({
		objectiveId: ma,
		keyResultId: ma.optional(),
		body: z.string().trim().min(1).max(BINH_LUAN_TOI_DA),
		mentionUserIds: z.array(ma).max(20),
	})
	.strict();
export const followInput = z
	.object({ objectiveId: ma, on: z.boolean() })
	.strict();
export const transferOkrPreviewInput = z.object({ fromUserId: ma }).strict();
export const transferOkrInput = z
	.object({ fromUserId: ma, toUserId: ma })
	.strict();
