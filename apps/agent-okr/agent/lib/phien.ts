import type { SessionContext } from "eve/tools";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "./config";

export const phienSoan = z.object({
	purpose: z.literal(TRO_LY_OKR_SOAN.purpose),
	cuocSoanId: z.string().trim().min(1),
	vai: z.enum(TRO_LY_OKR_SOAN.vaiDuocVao),
});

export type PhienSoan = z.infer<typeof phienSoan>;

export type NguCanhPhien = {
	readonly session: Pick<SessionContext["session"], "id" | "auth">;
};

export type ThuocTinhPhien = {
	cuocSoanId: string | null;
	userId: string | null;
	purpose: PhienSoan["purpose"] | null;
	vai: PhienSoan["vai"] | null;
};

const khuon = phienSoan.shape;
const hoacNull = <T extends z.ZodType>(s: T) => s.nullable().catch(null);
const nguoiDung = hoacNull(z.string().trim().min(1));

export function thuocTinhPhien(ctx: NguCanhPhien): ThuocTinhPhien {
	const khoi = ctx.session.auth.initiator;
	return {
		cuocSoanId: hoacNull(khuon.cuocSoanId).parse(khoi?.attributes.cuocSoanId),
		userId: nguoiDung.parse(khoi?.principalId),
		purpose: hoacNull(khuon.purpose).parse(khoi?.attributes.purpose),
		vai: hoacNull(khuon.vai).parse(khoi?.attributes.vai),
	};
}
