import { redirect } from "next/navigation";
import { recordHref } from "@/lib/record-href";

export const instant = false;

export default async function PlanRedirect({
	params,
}: {
	params: Promise<{ slug: string; planId: string }>;
}) {
	const { slug, planId } = await params;
	redirect(recordHref(slug, "/onboarding", "plan", planId));
}
