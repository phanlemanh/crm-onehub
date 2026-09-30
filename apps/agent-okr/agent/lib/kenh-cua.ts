import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { toWorkspaceRole } from "@crm/validation/vai-workspace";
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

const thuocTinhCua = z.object({
	purpose: z.literal(TRO_LY_OKR_SOAN.purpose),
	cuocSoanId: z.string().trim().min(1),
	email: z.string().optional(),
	name: z.string().optional(),
});

const vaiDuocVao = z.enum(TRO_LY_OKR_SOAN.vaiDuocVao);

export function repTuCuaOkr(
	secret: string,
	client: typeof db = db,
): AuthFn<Request> {
	return withAuthChallenges(
		async (request: Request) => {
			const kq = await verifyJwtHmac(
				extractBearerToken(request.headers.get("authorization")),
				{
					algorithm: "HS256",
					audiences: [BRIDGE_AUDIENCE_OKR],
					issuer: BRIDGE_ISSUER_OKR,
					secret,
				},
			);
			if (!kq.ok) return null;
			const userId = kq.sessionAuth.subject;
			if (!userId) return null;
			const thuoc = thuocTinhCua.safeParse(kq.sessionAuth.attributes ?? {});
			if (!thuoc.success) return null;
			const member = await client.member.findUnique({
				where: {
					organizationId_userId: { organizationId: WORKSPACE_ID, userId },
				},
				select: { role: true },
			});
			const vai = vaiDuocVao.safeParse(
				member ? toWorkspaceRole(member.role) : null,
			);
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
				attributes: { ...thuoc.data, vai: vai.data },
			};
		},
		[{ scheme: "Bearer" }],
	);
}
