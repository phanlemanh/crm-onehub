import { DEFAULT_WORKSPACE_NAME } from "@crm/auth";
import type { Metadata } from "next";
import {
	AuthHeading,
	AuthShell,
	tiengCuaNguoiDoc,
} from "@/components/auth-shell";
import { authMessages } from "@/lib/messages/auth";
import { requireMailboxAccess } from "@/lib/session";
import { OnboardingForm } from "./onboarding-form";

export async function generateMetadata(): Promise<Metadata> {
	return { title: authMessages(await tiengCuaNguoiDoc()).docTitle.onboarding };
}

export const instant = false;

export default async function OnboardingPage() {
	await requireMailboxAccess();

	const m = authMessages(await tiengCuaNguoiDoc()).onboarding;

	return (
		<AuthShell>
			<AuthHeading title={m.title} description={m.description} />

			<OnboardingForm
				placeholder={DEFAULT_WORKSPACE_NAME}
				nhan={{
					title: m.title,
					description: m.description,
					name: m.name,
					slug: m.slug,
					slugHint: m.slugHint,
					website: m.website,
					websiteHint: m.websiteHint,
					submit: m.submit,
					submitting: m.submitting,
				}}
			/>
		</AuthShell>
	);
}
