import { workspaceUrl } from "@/lib/workspace-url";

type DanhSachBanGhi =
	| "/companies"
	| "/contacts"
	| "/deals"
	| "/onboarding"
	| "/viec"
	| "/okr/theo-don-vi";

export function recordHref(
	slug: string,
	list: DanhSachBanGhi,
	kind: "company" | "contact" | "deal" | "plan" | "soan" | "viec",
	id: string,
): string {
	const query = new URLSearchParams({ record: `${kind}:${id}` });

	return `${workspaceUrl(slug, list)}?${query}`;
}
