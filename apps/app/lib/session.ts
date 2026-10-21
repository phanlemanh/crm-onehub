import { auth, type Session } from "@crm/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { hopThuCanCap, signInAccounts } from "./hop-thu";

export { hopThuCanCap, signInAccounts };

export const getSession = cache(async (): Promise<Session | null> => {
	await connection();
	return auth.api.getSession({ headers: await headers() });
});

export async function requireSession(): Promise<Session> {
	const session = await getSession();

	if (!session) {
		redirect("/sign-in");
	}

	return session;
}

export async function requireMailboxAccess(): Promise<Session> {
	const session = await requireSession();

	if ((await hopThuCanCap(session.user.id)).length > 0) {
		redirect("/grant-access");
	}

	return session;
}
