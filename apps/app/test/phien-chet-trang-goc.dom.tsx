import { afterEach, describe, expect, it, mock } from "bun:test";
import { isValidElement, type ReactElement } from "react";

class ChuyenHuong extends Error {
	constructor(readonly dich: string) {
		super(`chuyen huong toi ${dich}`);
	}
}

type Phien = { user: { id: string } };

const may = {
	phien: null as Phien | null,
	workspace: async (): Promise<{ slug: string | null }> => ({
		slug: "comp-ai",
	}),
	goiPhien: 0,
	goiWorkspace: 0,
	chuyen: [] as string[],
};

mock.module("@/lib/session", () => ({
	getSession: async () => {
		may.goiPhien += 1;
		return may.phien;
	},
	requireSession: async () => may.phien,
	requireMailboxAccess: async () => may.phien,
}));
mock.module("@/lib/trpc/server", () => ({
	getServerQueryClient: () => ({
		fetchQuery: async () => {
			may.goiWorkspace += 1;
			return may.workspace();
		},
	}),
	getServerTrpc: () => ({ workspace: { get: { queryOptions: () => ({}) } } }),
}));
mock.module("next/navigation", () => ({
	redirect: (dich: string) => {
		may.chuyen.push(dich);
		throw new ChuyenHuong(dich);
	},
	useRouter: () => ({ push: () => undefined, refresh: () => undefined }),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

const { default: Home } = await import("@/app/(landing)/page");
const { Hero } = await import("@/components/landing/hero");

const coThat = process.env.IS_MARKETING;

function datLai(marketing: string | undefined) {
	if (marketing === undefined) delete process.env.IS_MARKETING;
	else process.env.IS_MARKETING = marketing;
	may.phien = null;
	may.workspace = async () => ({ slug: "comp-ai" });
	may.goiPhien = 0;
	may.goiWorkspace = 0;
	may.chuyen = [];
}

afterEach(() => datLai(coThat));

const bat = (p: unknown) =>
	Promise.resolve(p).then(
		() => null,
		(loi: unknown) => loi,
	);

describe("trang goc", () => {
	it("khong-phien: sends a stranger to sign in", async () => {
		datLai(undefined);

		const loi = await bat(Home());
		const dung =
			loi instanceof ChuyenHuong &&
			loi.dich === "/sign-in" &&
			may.goiWorkspace === 0;

		expect(dung ? "" : "/: khong phien ma khong ve /sign-in").toBe("");
	});

	it("con-phien: takes a live session into the workspace, and never to sign in on failure", async () => {
		const sai: string[] = [];

		datLai(undefined);
		may.phien = { user: { id: "u" } };
		const a = await bat(Home());
		if (!(a instanceof ChuyenHuong && a.dich === "/comp-ai")) {
			sai.push("(a) con phien khong vao workspace");
		}

		datLai(undefined);
		may.phien = { user: { id: "u" } };
		const apiChet = new Error("API chet");
		may.workspace = async () => {
			throw apiChet;
		};
		const b = await bat(Home());
		if (b !== apiChet || may.chuyen.length !== 0) {
			sai.push("(b) API loi ma van chuyen huong");
		}

		datLai(undefined);
		may.phien = { user: { id: "u" } };
		may.workspace = async () => ({ slug: null });
		const c = await bat(Home());
		if (
			!(c instanceof Error) ||
			c instanceof ChuyenHuong ||
			may.chuyen.length !== 0
		) {
			sai.push("(c) khong slug ma van chuyen huong");
		}

		expect(sai).toEqual([]);
	});

	it("marketing-bat: shows the landing page without reading the session", async () => {
		datLai("true");

		const trang = (await Home()) as ReactElement<{ children: unknown }>;
		const con = isValidElement(trang) ? [trang.props.children].flat() : [];
		const coHero = con.some((c) => isValidElement(c) && c.type === Hero);

		expect(coHero ? "" : "marketing bat: landing khong con").toBe("");
		expect(
			may.goiPhien === 0 && may.chuyen.length === 0
				? ""
				: "marketing bat: trang doc phien",
		).toBe("");
	});
});
