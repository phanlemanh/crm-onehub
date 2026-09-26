import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { laVaiChiOkr, toWorkspaceRole } from "@crm/validation/vai-workspace";

export type PrincipalThanhVien = {
	authenticator: string;
	principalId: string;
	principalType: "user";
};

export async function thanhVienPrincipal(
	userId: string,
	authenticator: string,
): Promise<PrincipalThanhVien | null> {
	const member = await db.member.findUnique({
		where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId } },
		select: { role: true },
	});
	if (!member || laVaiChiOkr(toWorkspaceRole(member.role))) return null;
	return { authenticator, principalId: userId, principalType: "user" };
}
