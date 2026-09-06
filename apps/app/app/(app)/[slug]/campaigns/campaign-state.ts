type CoKhoa = { readonly id: string };

export type ListState = "loading" | "empty" | "rows";
export type CreateState = "no-views" | "ready";

export function listState(
	rows: readonly CoKhoa[],
	isLoading: boolean,
): ListState {
	if (isLoading) return "loading";
	return rows.length === 0 ? "empty" : "rows";
}

export function createState(views: readonly CoKhoa[]): CreateState {
	return views.length === 0 ? "no-views" : "ready";
}
