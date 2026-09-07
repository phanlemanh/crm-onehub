import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { getLocale } from "@/lib/locale/server";
import { authMessages } from "@/lib/messages/auth";
import { requireMailboxAccess } from "@/lib/session";
import { ResearchForm } from "./research-form";

export async function generateMetadata(): Promise<Metadata> {
	return { title: authMessages(await getLocale()).docTitle.research };
}

export const instant = false;

export default function ResearchKeyPage() {
	return (
		<Suspense fallback={null}>
			<ResearchKeyPageShell />
		</Suspense>
	);
}

async function ResearchKeyPageShell() {
	await requireMailboxAccess();

	const m = authMessages(await getLocale()).research;

	return (
		<AuthShell>
			<AuthHeading title={m.title} description={m.description} />

			<ResearchForm />
		</AuthShell>
	);
}
