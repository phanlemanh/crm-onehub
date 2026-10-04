import {
	type ThuocTinhPhienSoan,
	thuocTinhPhienSoan,
} from "@crm/validation/okr-phien-soan";
import type { SessionContext } from "eve/tools";
import { z } from "zod";

export type NguCanhPhien = {
	readonly session: Pick<SessionContext["session"], "id" | "auth">;
};

export type ThuocTinhPhien = {
	cuocSoanId: string | null;
	userId: string | null;
	purpose: ThuocTinhPhienSoan["purpose"] | null;
	vai: ThuocTinhPhienSoan["vai"] | null;
};

const khuon = thuocTinhPhienSoan.shape;
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
