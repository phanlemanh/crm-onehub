export function traBangChu<T extends Record<string, string>>(
	bang: T,
	khoa: string,
): string | undefined {
	return Object.hasOwn(bang, khoa) ? bang[khoa] : undefined;
}
