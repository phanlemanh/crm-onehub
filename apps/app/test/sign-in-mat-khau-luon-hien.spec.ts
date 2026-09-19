import { describe, expect, it, mock } from "bun:test";
import { isValidElement, type ReactElement, type ReactNode } from "react";

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
const { PasswordSignIn } = await import(
	"@/app/(landing)/sign-in/password-sign-in"
);

type NutCoCon = ReactElement<{ children?: ReactNode }>;

function laNutCoCon(giaTri: ReactNode): giaTri is NutCoCon {
	return isValidElement<{ children?: ReactNode }>(giaTri);
}

function conCuaNut(nut: NutCoCon): ReactNode {
	return nut.props.children ?? null;
}

function timTheoKieu(
	goc: ReactNode,
	kieuCanTim: ReactElement["type"],
): ReactElement | null {
	if (Array.isArray(goc)) {
		for (const con of goc) {
			const thay = timTheoKieu(con, kieuCanTim);
			if (thay) return thay;
		}
		return null;
	}
	if (!laNutCoCon(goc)) return null;
	if (goc.type === kieuCanTim) return goc;
	return timTheoKieu(conCuaNut(goc), kieuCanTim);
}

type ThamSoSignIn = Pick<PageProps<"/sign-in">, "searchParams">;
type HamSignIn = (props: ThamSoSignIn) => Promise<ReactNode>;

describe("man dang nhap khi khong co nha cung cap nao duoc cau hinh", () => {
	it("van ve o email va o mat khau, khong an sau nhanh chua co loi vao", async () => {
		const props: PageProps<"/sign-in"> = {
			params: Promise.resolve({}),
			searchParams: Promise.resolve({}),
		};

		const trang = await SignInPage(props);

		if (!laNutCoCon(trang)) throw new Error("SignInPage khong tra ve mot node");
		const suspense = conCuaNut(trang);

		if (!laNutCoCon(suspense))
			throw new Error("khong tim thay Suspense trong SignInPage");
		const signInEl = conCuaNut(suspense);

		if (!laNutCoCon(signInEl))
			throw new Error("khong tim thay <SignIn /> trong Suspense");

		const chaySignIn = signInEl.type as HamSignIn;
		const ketQua = await chaySignIn(signInEl.props as ThamSoSignIn);

		const coOMatKhau = timTheoKieu(ketQua, PasswordSignIn);
		expect(coOMatKhau).not.toBeNull();
	});
});
