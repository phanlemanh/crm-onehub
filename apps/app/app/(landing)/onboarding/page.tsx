import { DEFAULT_WORKSPACE_NAME } from "@crm/auth";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { getLocale } from "@/lib/locale/server";
import { authMessages } from "@/lib/messages/auth";
import { requireMailboxAccess } from "@/lib/session";
import { OnboardingForm } from "./onboarding-form";

export async function generateMetadata(): Promise<Metadata> {
	return { title: authMessages(await getLocale()).docTitle.onboarding };
}

export const instant = false;

export default function OnboardingPage() {
	return (
		<Suspense fallback={null}>
			<OnboardingPageShell />
		</Suspense>
	);
}

async function OnboardingPageShell() {
	await requireMailboxAccess();

	const m = authMessages(await getLocale()).onboarding;

	return (
		<AuthShell>
			<AuthHeading title={m.title} description={m.description} />

			<OnboardingForm placeholder={DEFAULT_WORKSPACE_NAME} />
		</AuthShell>
	);
}
