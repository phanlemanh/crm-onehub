import { OKR_PHIEN_HOI } from "@crm/validation/okr-phien-hoi";
import {
	OKR_PHIEN_SOAN,
	type ThuocTinhPhienSoan,
	thuocTinhPhienSoan,
} from "@crm/validation/okr-phien-soan";
import type { SessionContext } from "eve/tools";
import { z } from "zod";

export type NguCanhPhien = {
	readonly session: Pick<SessionContext["session"], "id" | "auth">;
};

const PURPOSE = [OKR_PHIEN_SOAN.purpose, OKR_PHIEN_HOI.purpose] as const;

export type ThuocTinhPhien = {
	cuocSoanId: string | null;
	cuocHoiId: string | null;
	userId: string | null;
	purpose: (typeof PURPOSE)[number] | null;
	vai: ThuocTinhPhienSoan["vai"] | null;
};

const khuon = thuocTinhPhienSoan.shape;
const hoacNull = <T extends z.ZodType>(s: T) => s.nullable().catch(null);
const chuoi = hoacNull(z.string().trim().min(1));

export function thuocTinhPhien(ctx: NguCanhPhien): ThuocTinhPhien {
	const khoi = ctx.session.auth.initiator;
	return {
		cuocSoanId: hoacNull(khuon.cuocSoanId).parse(khoi?.attributes.cuocSoanId),
		cuocHoiId: chuoi.parse(khoi?.attributes.cuocHoiId),
		userId: chuoi.parse(khoi?.principalId),
		purpose: hoacNull(z.enum(PURPOSE)).parse(khoi?.attributes.purpose),
		vai: hoacNull(khuon.vai).parse(khoi?.attributes.vai),
	};
}
