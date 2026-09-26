import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { DbGhi } from "@crm/db/zalo-lien-ket";
import { laVaiChiOkr, toWorkspaceRole } from "@crm/validation/vai-workspace";

export type PrincipalThanhVien = {
	authenticator: string;
	principalId: string;
	principalType: "user";
};

export async function thanhVienPrincipal(
	userId: string,
	authenticator: string,
	client: DbGhi = db,
): Promise<PrincipalThanhVien | null> {
	const member = await client.member.findUnique({
		where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId } },
		select: { role: true },
	});
	if (!member || laVaiChiOkr(toWorkspaceRole(member.role))) return null;
	return { authenticator, principalId: userId, principalType: "user" };
}
