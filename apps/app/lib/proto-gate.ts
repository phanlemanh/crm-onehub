import { PROTO_CATALOG } from "@/app/proto/catalog";

export const PROTO_PREFIX = "/proto";

export function protoMoDuoc(): boolean {
	return process.env.PROTO_ROUTE === "1";
}

export function duongProtoHopLe(
	pathname: string,
	state: string | null,
): boolean {
	if (pathname === PROTO_PREFIX) return true;

	const sau = pathname.slice(PROTO_PREFIX.length + 1);
	if (sau === "" || sau.includes("/")) return false;

	const muc = PROTO_CATALOG.find((m) => m.slug === sau);
	if (muc === undefined) return false;

	if (state === null) return true;

	return muc.states.some((s) => s.id === state);
}
