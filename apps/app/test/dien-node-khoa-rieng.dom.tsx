import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	test,
} from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { act, Fragment, isValidElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const traLoi = new Map<string, () => unknown>();

const linkGia: TRPCLink<AppRouter> =
	() =>
	({ op }) =>
		observable((nguoiXem) => {
			const lay = traLoi.get(op.path);
			Promise.resolve()
				.then(() => (lay ? lay() : null))
				.then(
					(data) => {
						nguoiXem.next({ result: { type: "data", data } });
						nguoiXem.complete();
					},
					(loi: Error) => nguoiXem.error(loi as never),
				);
			return () => {};
		});

const trpcClient = createTRPCClient<AppRouter>({ links: [linkGia] });
let queryClient = new QueryClient();
const proxy = () =>
	createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient });

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => proxy() }));

const hop = await import(
	"@/app/(app)/[slug]/settings/members/chuyen-viec-dialog"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { keHoachNoiMessages } = await import("@/lib/messages/ke-hoach-noi");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");

const HUONG = { userId: "u-h", name: "Huong Le" };
const NGUOI = [
	{ id: "u-h", name: "Huong Le", email: "u-h@thu.test", image: null },
	{ id: "u-t", name: "Tuan Do", email: "u-t@thu.test", image: null },
];

const goc = console.error;
let daGhi: string[] = [];
let san: { o: HTMLElement; root: Root }[] = [];

beforeEach(() => {
	daGhi = [];
	console.error = (...doiSo: unknown[]) => {
		daGhi.push(doiSo.map(String).join(" "));
	};
});

afterEach(async () => {
	console.error = goc;
	for (const { o, root } of san) {
		await act(async () => {
			root.unmount();
		});
		o.remove();
	}
	san = [];
	traLoi.clear();
	document.body.innerHTML = "";
});

function khoaTrung(): string[] {
	return daGhi.filter((dong) => dong.includes("same key"));
}

async function ve(nut: ReactNode): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	san.push({ o, root });
	await act(async () => {
		root.render(nut);
	});
	return o;
}

async function nhip(): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 200; vong += 1) {
		if (xong()) return;
		await nhip();
	}
	throw new Error(
		`khong toi trang thai ${moTa} — noi dung: ${document.body.textContent?.slice(0, 400)}`,
	);
}

const SO_CA_MAU_THAT = 4;
const MAU_THAT: ["vi" | "en", number, number][] = [
	["vi", 2, 3],
	["vi", 0, 0],
	["en", 2, 3],
	["en", 0, 0],
];

describe("mau-that", () => {
	let daChay = 0;

	afterAll(() => {
		expect(
			daChay,
			`nhom mau-that chay ${daChay} ca, phai ${SO_CA_MAU_THAT}`,
		).toBe(SO_CA_MAU_THAT);
	});

	test.each(MAU_THAT)("%s %i/%i", async (locale, keHoach, buoc) => {
		daChay += 1;
		const tenCa = `${locale} ${keHoach}/${buoc}`;
		const k = keHoachNoiMessages(locale).chuyen;
		queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		traLoi.set("users.list", () => NGUOI);
		traLoi.set("onboarding.transferPreview", () => ({ keHoach, buoc }));

		await ve(
			<QueryClientProvider client={queryClient}>
				<LocaleProvider locale={locale}>
					<hop.ChuyenViecDialog nguoi={HUONG} onDong={() => {}} />
				</LocaleProvider>
			</QueryClientProvider>,
		);
		const moTa = () =>
			document.body.querySelector<HTMLElement>(
				'[data-slot="dialog-description"]',
			);
		await cho(
			() => (moTa()?.textContent ?? "").includes(HUONG.name),
			`mo ta co ten o ${tenCa}`,
		);
		for (let i = 0; i < 5; i += 1) await nhip();

		const ten = HUONG.name;
		const moTaKyVong =
			keHoach > 0
				? dien(k.coViec, {
						ten,
						keHoach: String(keHoach),
						buoc: String(buoc),
					})
				: dien(k.khongViec, { ten });

		expect(khoaTrung(), `khoa trung o ${tenCa}`).toEqual([]);
		expect(
			document.body.querySelector('[data-slot="dialog-title"]')?.textContent,
			`tieu de sai o ${tenCa}`,
		).toBe(dien(k.tieuDe, { ten }));
		expect(moTa()?.textContent, `mo ta sai o ${tenCa}`).toBe(moTaKyVong);
		expect(
			[...(moTa()?.querySelectorAll('[translate="no"]') ?? [])].map(
				(n) => n.textContent,
			),
			`ten khong khoa dich o ${tenCa}`,
		).toContain(ten);
	});
});

const SO_CA_MA_TRAN = 11;
const MA_TRAN: [string, string][] = [
	["{a} sau", "A sau"],
	["truoc {a}", "truoc A"],
	["truoc {a} sau", "truoc A sau"],
	["{a}{b}", "AB"],
	["{a} {b}", "A B"],
	["{a}", "A"],
	["chu tron", "chu tron"],
	["", ""],
	["{a} va {a}", "A va A"],
	["{z} la", " la"],
	["{a}{b}{a}", "ABA"],
];

describe("ma-tran", () => {
	let daChay = 0;

	afterAll(() => {
		expect(
			daChay,
			`nhom ma-tran chay ${daChay} ca, phai ${SO_CA_MA_TRAN}`,
		).toBe(SO_CA_MA_TRAN);
	});

	test.each(MA_TRAN)("mau %p", async (mau, kyVong) => {
		daChay += 1;
		const nut = hop.dienNode(mau, { a: <b translate="no">A</b>, b: "B" });
		const khoa = nut.map((n) => (isValidElement(n) ? n.key : null));

		expect(
			nut.every((n) => isValidElement(n)),
			`phan tu khong phai element trong mau ${mau}`,
		).toBe(true);
		expect(new Set(khoa).size, `khoa trung trong mau ${mau}`).toBe(khoa.length);
		const o = await ve(nut);
		expect(o.textContent, `chu sai trong mau ${mau}`).toBe(kyVong);
		expect(khoaTrung(), `canh bao khoa trung trong mau ${mau}`).toEqual([]);
	});
});

describe("bo-bat-con-song", () => {
	test("bo bat thay khoa trung that, im khi khoa rieng", async () => {
		await ve([
			<Fragment key="trung">x</Fragment>,
			<Fragment key="trung">y</Fragment>,
		]);
		expect(
			khoaTrung().length,
			"bo bat console khong con song",
		).toBeGreaterThanOrEqual(1);

		daGhi = [];
		await ve([<Fragment key="p">x</Fragment>, <Fragment key="q">y</Fragment>]);
		expect(khoaTrung(), "bo bat bao gia khi khoa rieng").toEqual([]);
	});
});
