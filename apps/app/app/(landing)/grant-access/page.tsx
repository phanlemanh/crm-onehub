import { mailboxGrantsNeeded } from "@crm/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { getLocale } from "@/lib/locale/server";
import { authMessages } from "@/lib/messages/auth";
import { requireSession, signInAccounts } from "@/lib/session";
import { GrantAccess } from "./grant-access";

export async function generateMetadata(): Promise<Metadata> {
	return { title: authMessages(await getLocale()).docTitle.grantAccess };
}

export const instant = false;

export default function GrantAccessPage() {
	return (
		<Suspense fallback={null}>
			<GrantAccessPageShell />
		</Suspense>
	);
}

async function GrantAccessPageShell() {
	const { user } = await requireSession();

	const providers = mailboxGrantsNeeded(await signInAccounts(user.id));

	if (providers.length === 0) {
		redirect("/");
	}

	const only = providers.length === 1 ? providers[0] : undefined;

	const m = authMessages(await getLocale()).grantAccess;

	return (
		<AuthShell>
			<AuthHeading
				title={m.title}
				description={(only ? m[only] : undefined) ?? m.both}
			/>

			<GrantAccess providers={providers} />

			<p className="text-center text-muted-foreground text-sm/5">{m.privacy}</p>
		</AuthShell>
	);
}
