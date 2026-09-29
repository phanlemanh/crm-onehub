import { z } from "zod";

export const hoiYGhiOutput = z.object({ id: z.string() });
export type HoiYGhiOutput = z.infer<typeof hoiYGhiOutput>;
