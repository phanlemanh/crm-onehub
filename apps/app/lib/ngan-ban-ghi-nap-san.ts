import { hashKey, type Query, type QueryClient } from "@tanstack/react-query";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";

type Trpc = TRPCOptionsProxy<AppRouter>;

export const KHOA_NAP_SAN = {
	"okr.access": {
		khoa: (trpc: Trpc) => trpc.okr.access.queryKey(),
		nap: (trpc: Trpc, client: QueryClient) =>
			client.prefetchQuery(trpc.okr.access.queryOptions()),
	},
	"users.list": {
		khoa: (trpc: Trpc) => trpc.users.list.queryKey(),
		nap: (trpc: Trpc, client: QueryClient) =>
			client.prefetchQuery(trpc.users.list.queryOptions()),
	},
	"giaiDoan.list": {
		khoa: (trpc: Trpc) => trpc.giaiDoan.list.queryKey(),
		nap: (trpc: Trpc, client: QueryClient) =>
			client.prefetchQuery(trpc.giaiDoan.list.queryOptions()),
	},
} as const;

export type KhoaNapSan = keyof typeof KHOA_NAP_SAN;

const NAP_SAN_THEO_VAI = {
	chiOkr: ["okr.access"],
	dayDu: ["okr.access", "users.list", "giaiDoan.list"],
} as const satisfies Record<string, readonly KhoaNapSan[]>;

export function khoaNapSan(chiOkr: boolean): KhoaNapSan[] {
	return [...NAP_SAN_THEO_VAI[chiOkr ? "chiOkr" : "dayDu"]];
}

export function napSan(
	khoa: readonly KhoaNapSan[],
	trpc: Trpc,
	client: QueryClient,
): Promise<void[]> {
	return Promise.all(khoa.map((k) => KHOA_NAP_SAN[k].nap(trpc, client)));
}

export function chiKhoaNapSan(khoa: readonly KhoaNapSan[], trpc: Trpc) {
	const bam = new Set(khoa.map((k) => hashKey(KHOA_NAP_SAN[k].khoa(trpc))));
	return (query: Query) =>
		query.state.status === "success" && bam.has(query.queryHash);
}
