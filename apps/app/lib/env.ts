export const API_URL =
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function khoaXacThuc(): string | undefined {
	const khoa = process.env.BETTER_AUTH_SECRET;
	return khoa && khoa.length > 0 ? khoa : undefined;
}

export function isMarketing(): boolean {
	return process.env.IS_MARKETING === "true";
}
