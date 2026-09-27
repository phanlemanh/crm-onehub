import { z } from "zod";
import { DISPATCH } from "./dispatch-config";

const oDon = z.union([z.string(), z.number().finite(), z.boolean(), z.null()]);

const oDanhSach = z
	.array(z.union([z.string(), z.number().finite()]))
	.max(DISPATCH.run.resultListMax);

export const ketQuaLuot = z.record(z.string(), z.union([oDon, oDanhSach]));

export type KetQuaLuot = z.infer<typeof ketQuaLuot>;
