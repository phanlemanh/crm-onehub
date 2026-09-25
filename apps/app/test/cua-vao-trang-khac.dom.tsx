import { describe, expect, it, mock } from "bun:test";
import { isValidElement, type ReactNode } from "react";

mock.module("@crm/db", () => ({
	db: { verification: { findFirst: async () => null } },
}));
mock.module("@/lib/session", () => ({
	getSession: async () => null,
	requireSession: async () => ({ user: { id: "u-lan-do" } }),
	requireMailboxAccess: async () => undefined,
}));
mock.module("@/lib/hop-thu", () => ({
	hopThuCanCap: async () => ["google"],
}));
mock.module("@/lib/trpc/server", () => ({
	getServerQueryClient: () => ({
		fetchQuery: async () => ({ google: true, microsoft: false, providers: [] }),
	}),
	getServerTrpc: () => ({
		sso: { signInOptions: { queryOptions: () => ({}) } },
	}),
}));
mock.module("@/lib/locale/server", () => ({
	getLocale: async () => "vi" as const,
}));
mock.module("next/navigation", () => ({
	redirect: (dich: string) => {
		throw new Error(`khong duoc chuyen huong toi ${dich}`);
	},
	unstable_rethrow: (loi: Error) => {
		throw loi;
	},
	notFound: () => {
		throw new Error("khong duoc notFound");
	},
	useRouter: () => ({ push: () => undefined, refresh: () => undefined }),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

const { AuthShell } = await import("@/components/auth-shell");

type Trang = {
	ten: string;
	nap: () => Promise<{ default: (p: never) => Promise<ReactNode> }>;
	props: unknown;
	coKhoi: boolean;
};

const MA_TRAN: Trang[] = [
	{
		ten: "sign-in",
		nap: () => import("@/app/(landing)/sign-in/page"),
		props: { params: Promise.resolve({}), searchParams: Promise.resolve({}) },
		coKhoi: true,
	},
	{
		ten: "dat-mat-khau",
		nap: () => import("@/app/(landing)/dat-mat-khau/[token]/page"),
		props: {
			params: Promise.resolve({ token: "khong-hop-le" }),
			searchParams: Promise.resolve({}),
		},
		coKhoi: false,
	},
	{
		ten: "grant-access",
		nap: () => import("@/app/(landing)/grant-access/page"),
		props: {},
		coKhoi: false,
	},
	{
		ten: "onboarding",
		nap: () => import("@/app/(landing)/onboarding/page"),
		props: {},
		coKhoi: false,
	},
	{
		ten: "onboarding/research",
		nap: () => import("@/app/(landing)/onboarding/research/page"),
		props: {},
		coKhoi: false,
	},
];

describe("chi sign-in dat khoi Lan dau vao vao AuthShell", () => {
	for (const { ten, nap, props, coKhoi } of MA_TRAN) {
		it(`${ten}: ${coKhoi ? "co" : "khong"} khoi cot trai`, async () => {
			const { default: Trang } = await nap();
			const cay = await Trang(props as never);
			if (!isValidElement<{ gioiThieu?: ReactNode }>(cay)) {
				throw new Error(`${ten}: trang khong tra ve mot phan tu`);
			}
			if (cay.type !== AuthShell) {
				throw new Error(`${ten}: phan tu ngoai cung khong phai AuthShell`);
			}
			const nhan = cay.props.gioiThieu !== undefined;
			if (coKhoi && !nhan) {
				throw new Error(`${ten}: AuthShell khong nhan khoi`);
			}
			if (!coKhoi && nhan) {
				throw new Error(`${ten}: AuthShell nhan khoi cot trai`);
			}
			expect(nhan).toBe(coKhoi);
		});
	}
});
