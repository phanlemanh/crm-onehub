import { describe, expect, it, mock } from "bun:test";
import { Separator } from "@crm/ui/components/separator";
import { isValidElement, type ReactElement, type ReactNode } from "react";

const OMatKhau = function OMatKhau() {
	return null;
};
const CuaNgoai = function CuaNgoai() {
	return null;
};
const CuaSso = function CuaSso() {
	return null;
};

mock.module("@/app/(landing)/sign-in/password-sign-in", () => ({
	PasswordSignIn: OMatKhau,
}));
mock.module("@/app/(landing)/sign-in/social-sign-in", () => ({
	SocialSignIn: CuaNgoai,
}));
mock.module("@/app/(landing)/sign-in/sso-sign-in", () => ({
	SsoSignIn: CuaSso,
}));

mock.module("@/lib/session", () => ({
	getSession: async () => null,
}));

mock.module("@/lib/trpc/server", () => ({
	getServerQueryClient: () => ({
		fetchQuery: async () => ({
			google: false,
			microsoft: false,
			providers: [],
		}),
	}),
	getServerTrpc: () => ({
		sso: { signInOptions: { queryOptions: () => ({}) } },
	}),
	getServerTrpcClient: () => ({}),
}));

mock.module("@/lib/locale/server", () => ({
	getLocale: async () => "vi" as const,
}));

mock.module("next/navigation", () => ({
	redirect: (dich: string) => {
		throw new Error(`khong duoc chuyen huong toi ${dich} khi chua dang nhap`);
	},
	unstable_rethrow: (loi: Error) => {
		throw loi;
	},
}));

const { default: SignInPage } = await import("@/app/(landing)/sign-in/page");

function gomTheoKieu(
	goc: ReactNode,
	kieuCanTim: ReactElement["type"],
	thay: ReactElement[] = [],
): ReactElement[] {
	if (Array.isArray(goc)) {
		for (const con of goc) gomTheoKieu(con, kieuCanTim, thay);
		return thay;
	}
	if (!isValidElement<{ children?: ReactNode }>(goc)) return thay;
	if (goc.type === kieuCanTim) thay.push(goc);
	return gomTheoKieu(goc.props.children ?? null, kieuCanTim, thay);
}

type ThamSoSignIn = Pick<PageProps<"/sign-in">, "searchParams">;
type HamSignIn = (props: ThamSoSignIn) => Promise<ReactNode>;

async function dungManDangNhap(): Promise<ReactNode> {
	const props: PageProps<"/sign-in"> = {
		params: Promise.resolve({}),
		searchParams: Promise.resolve({}),
	};

	const trang = await SignInPage(props);
	if (!isValidElement<{ children?: ReactNode }>(trang)) {
		throw new Error("SignInPage khong tra ve mot node");
	}
	const suspense = trang.props.children;
	if (!isValidElement<{ children?: ReactNode }>(suspense)) {
		throw new Error("khong tim thay Suspense trong SignInPage");
	}
	const signInEl = suspense.props.children;
	if (!isValidElement(signInEl)) {
		throw new Error("khong tim thay <SignIn /> trong Suspense");
	}

	const chaySignIn = signInEl.type as HamSignIn;
	return await chaySignIn(signInEl.props as ThamSoSignIn);
}

describe("man dang nhap khi khong co nha cung cap nao duoc cau hinh", () => {
	it("van ve o email va o mat khau, khong an sau nhanh chua co loi vao", async () => {
		const man = await dungManDangNhap();

		expect(gomTheoKieu(man, OMatKhau)).toHaveLength(1);
	});

	it("khong cua ngoai nao, nen khong dung vach phan cach lo lung", async () => {
		const man = await dungManDangNhap();

		expect(gomTheoKieu(man, CuaNgoai)).toHaveLength(0);
		expect(gomTheoKieu(man, CuaSso)).toHaveLength(0);
		expect(gomTheoKieu(man, Separator)).toHaveLength(0);
	});
});
