export type LyDoLoi = "khong-con" | "khong-quyen" | "mat-ket-noi";

export function lyDoLoi(
	loi: { data?: { code?: string } | null } | null | undefined,
): LyDoLoi {
	const ma = loi?.data?.code;
	if (ma === "NOT_FOUND") return "khong-con";
	if (ma === "FORBIDDEN") return "khong-quyen";
	return "mat-ket-noi";
}
