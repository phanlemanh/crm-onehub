import type { Metadata } from "next";
import {
	AuthHeading,
	AuthShell,
	tiengCuaNguoiDoc,
} from "@/components/auth-shell";
import { authMessages } from "@/lib/messages/auth";
import { requireMailboxAccess } from "@/lib/session";
import { ResearchForm } from "./research-form";

export async function generateMetadata(): Promise<Metadata> {
	return { title: authMessages(await tiengCuaNguoiDoc()).docTitle.research };
}

export const instant = false;

export default async function ResearchKeyPage() {
	await requireMailboxAccess();

	const m = authMessages(await tiengCuaNguoiDoc()).research;

	return (
		<AuthShell>
			<AuthHeading title={m.title} description={m.description} />

			<ResearchForm
				nhan={{
					title: m.title,
					description: m.description,
					label: m.label,
					placeholder: m.placeholder,
					noKey: m.noKey,
					signUp: m.signUp,
					submit: m.submit,
					submitting: m.submitting,
				}}
			/>
		</AuthShell>
	);
}
