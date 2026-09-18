export const ANONYMOUS: readonly string[] = ["/t", "/proto"];

export function isUnder(pathname: string, prefix: string): boolean {
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isAnonymous(pathname: string): boolean {
	return ANONYMOUS.some((prefix) => isUnder(pathname, prefix));
}
