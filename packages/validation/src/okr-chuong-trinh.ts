import { z } from "zod";

export const CHE_DO_TRAN = ["canh-bao", "chan"] as const;
export const THANG_CHAM = ["0-1", "0-100"] as const;

export const okrProgram = z.object({
	objectiveCap: z.int().min(1).max(50),
	krCap: z.int().min(1).max(50),
	capMode: z.enum(CHE_DO_TRAN),
	scoreScale: z.enum(THANG_CHAM),
	weightsOn: z.boolean(),
	personalOn: z.boolean(),
});

export type OkrProgram = z.infer<typeof okrProgram>;

export const OKR_PROGRAM_MAC_DINH: OkrProgram = {
	objectiveCap: 5,
	krCap: 5,
	capMode: "canh-bao",
	scoreScale: "0-1",
	weightsOn: false,
	personalOn: false,
};
