import {
	type MailboxProviderId,
	mailboxGrantsNeeded,
	workspaceRoleOf,
} from "@crm/auth";
import { db } from "@crm/db";
import { cache } from "react";

export const signInAccounts = cache(async (userId: string) =>
	db.account.findMany({
		where: { userId },
		select: { providerId: true, scope: true },
	}),
);

export async function hopThuCanCap(
	userId: string,
): Promise<MailboxProviderId[]> {
	const [accounts, role] = await Promise.all([
		signInAccounts(userId),
		workspaceRoleOf(userId),
	]);

	return mailboxGrantsNeeded(accounts, role);
}
