import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	theCuaPhienSoan,
	thuocTinhPhienSoan,
} from "@crm/validation/okr-phien-soan";
import {
	type AuthFn,
	extractBearerToken,
	ForbiddenError,
	verifyJwtHmac,
	withAuthChallenges,
} from "eve/channels/auth";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "./config";

export const BRIDGE_ISSUER_OKR = TRO_LY_OKR_SOAN.issuer;
export const BRIDGE_AUDIENCE_OKR = TRO_LY_OKR_SOAN.audience;

const vaiDuocVao = z.enum(TRO_LY_OKR_SOAN.vaiDuocVao);

const phanThan = z.object({ exp: z.number().finite() });

function coHanDung(token: string): boolean {
	const giua = token.split(".")[1];
	if (!giua) return false;
	try {
		const json: unknown = JSON.parse(
			Buffer.from(giua, "base64url").toString("utf8"),
		);
		return phanThan.safeParse(json).success;
	} catch {
		return false;
	}
}

export function repTuCuaOkr(
	secret: string,
	client: typeof db = db,
): AuthFn<Request> {
	return withAuthChallenges(
		async (request: Request) => {
			const token = extractBearerToken(request.headers.get("authorization"));
			const kq = await verifyJwtHmac(token, {
				algorithm: "HS256",
				audiences: [BRIDGE_AUDIENCE_OKR],
				issuer: BRIDGE_ISSUER_OKR,
				secret,
			});
			if (!kq.ok || !token || !coHanDung(token)) return null;
			const userId = kq.sessionAuth.subject;
			if (!userId) return null;
			const thuoc = theCuaPhienSoan.safeParse(kq.sessionAuth.attributes ?? {});
			if (!thuoc.success) return null;
			const member = await client.member.findUnique({
				where: {
					organizationId_userId: { organizationId: WORKSPACE_ID, userId },
				},
				select: { role: true },
			});
			const vai = vaiDuocVao.safeParse(member?.role);
			if (!vai.success) return null;
			const cuoc = await client.okrCuocSoan.findUnique({
				where: { id: thuoc.data.cuocSoanId },
				select: { nguoiMoUserId: true, trangThai: true },
			});
			if (!cuoc || cuoc.nguoiMoUserId !== userId) {
				throw new ForbiddenError({
					message: TRO_LY_OKR_SOAN.tuChoi.cuocKhongThuocPhien,
				});
			}
			if (cuoc.trangThai !== "dang") {
				throw new ForbiddenError({
					message: TRO_LY_OKR_SOAN.tuChoi.cuocKhongDang,
				});
			}
			return {
				authenticator: "crm-okr-cua",
				principalId: userId,
				principalType: "user",
				attributes: thuocTinhPhienSoan.parse({ ...thuoc.data, vai: vai.data }),
			};
		},
		[{ scheme: "Bearer" }],
	);
}
