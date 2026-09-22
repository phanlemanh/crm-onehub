import { workspaceUrl } from "@/lib/workspace-url";

export function recordHref(
	slug: string,
	list: "/companies" | "/contacts" | "/deals" | "/onboarding",
	kind: "company" | "contact" | "deal" | "plan",
	id: string,
): string {
	const query = new URLSearchParams({ record: `${kind}:${id}` });

	return `${workspaceUrl(slug, list)}?${query}`;
}
