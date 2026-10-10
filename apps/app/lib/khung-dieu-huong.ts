import type { Locale } from "@crm/ui/lib/locale";
import { khungUngDungMessages } from "@/lib/messages/khung-ung-dung";

export type MucRailKey =
	| "overview"
	| "chat"
	| "companies"
	| "contacts"
	| "deals"
	| "campaigns"
	| "onboarding"
	| "okr"
	| "taiLieu"
	| "loTrinh"
	| "settings";

export type MucRail = {
	key: MucRailKey;
	href: string;
	match: "exact" | "prefix";
	related?: readonly string[];
};

export const MUC_RAIL: readonly MucRail[] = [
	{ key: "overview", href: "/", match: "exact" },
	{ key: "chat", href: "/chat", match: "prefix", related: ["/agents"] },
	{ key: "companies", href: "/companies", match: "prefix" },
	{ key: "contacts", href: "/contacts", match: "prefix" },
	{ key: "deals", href: "/deals", match: "prefix" },
	{ key: "campaigns", href: "/campaigns", match: "prefix" },
	{ key: "onboarding", href: "/onboarding", match: "prefix" },
	{ key: "okr", href: "/okr", match: "prefix" },
	{ key: "taiLieu", href: "/tai-lieu", match: "prefix" },
	{ key: "loTrinh", href: "/lo-trinh", match: "prefix" },
	{ key: "settings", href: "/settings", match: "prefix" },
];

export function laMucHoiThoai(muc: MucRail): boolean {
	return muc.key === "chat";
}

export function mucDangMo(
	muc: MucRail,
	pathname: string,
	workspaceUrl: (path: string) => string,
): boolean {
	const href = workspaceUrl(muc.href);
	return (
		pathname === href ||
		(muc.match === "prefix" && pathname.startsWith(href)) ||
		Boolean(muc.related?.some((p) => pathname.startsWith(workspaceUrl(p))))
	);
}

export function nhanRail(muc: MucRail, locale: Locale): string {
	return khungUngDungMessages(locale).rail[muc.key];
}
