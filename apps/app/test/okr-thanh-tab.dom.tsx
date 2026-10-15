import { afterEach, describe, expect, mock, test } from "bun:test";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

let duongHienTai = "/ws/okr/hoi-y";

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => duongHienTai,
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));

const khoi =
	(the: string) =>
	({ children }: { children?: ReactNode }) =>
		h(the, null, children);
mock.module("@/components/page-shell", () => ({
	PageShellHeader: khoi("header"),
	PageShellHeading: khoi("div"),
	PageShellTitle: khoi("h1"),
	PageShellDescription: khoi("p"),
	PageShellActions: khoi("div"),
}));
// Đầu trang khu hỏi quyền máy chủ (DH1); bài này chỉ đo tiêu đề và thanh tab nên
// mọi truy vấn treo — hàng hành động đứng ở khung xương.
const thuTucTreo = {
	queryOptions: () => ({
		queryKey: ["treo", Math.random()],
		queryFn: () => new Promise(() => {}),
	}),
};
mock.module("@/lib/trpc/client", () => ({
	useTRPC: () =>
		new Proxy({}, { get: () => new Proxy({}, { get: () => thuTucTreo }) }),
}));

const { DauTrangOkr, ThanhTabOkr } = await import(
	"@/app/(app)/[slug]/okr/thanh-tab"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { okrMessages } = await import("@/lib/messages/okr");
const { khungUngDungMessages } = await import("@/lib/messages/khung-ung-dung");
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);

const m = okrMessages("vi");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

afterEach(() => {
	for (const s of dangMo) {
		act(() => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	duongHienTai = "/ws/okr/hoi-y";
});

async function ve(noiDung: ReactNode): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	await act(async () => {
		root.render(
			<NuqsTestingAdapter searchParams="?kyOkr=q3">
				<QueryClientProvider client={new QueryClient()}>
					<LocaleProvider locale="vi">{noiDung}</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
	return o;
}

function tabHoiY(o: HTMLElement): HTMLElement {
	const tab = o.querySelector<HTMLElement>(
		'[role="tab"][href^="/ws/okr/hoi-y"]',
	);
	if (!tab) throw new Error("không thấy tab Hỏi ý");
	return tab;
}

function nhan(o: HTMLElement): string | null {
	return tabHoiY(o).querySelector('[data-slot="badge"]')?.textContent ?? null;
}

describe("thanh tab OKR — bốn tab và huy hiệu Hỏi ý", () => {
	test("bốn tab, tab Hỏi ý trỏ /okr/hoi-y và giữ kyOkr", async () => {
		const o = await ve(<ThanhTabOkr tab="hoi-y" />);
		const tab = [...o.querySelectorAll('[role="tab"]')];
		expect(tab.map((t) => t.getAttribute("href"))).toEqual([
			"/ws/okr?kyOkr=q3",
			"/ws/okr/theo-don-vi?kyOkr=q3",
			"/ws/okr/toan-canh?kyOkr=q3",
			"/ws/okr/hoi-y?kyOkr=q3",
		]);
		expect(tab.map((t) => t.getAttribute("aria-selected"))).toEqual([
			"false",
			"false",
			"false",
			"true",
		]);
		expect(tabHoiY(o).textContent).toBe(m.tab["hoi-y"]);
	});

	test("nhanHoiY «moi» in huy hiệu Mới", async () => {
		const o = await ve(<ThanhTabOkr nhanHoiY="moi" tab="cua-toi" />);
		expect(nhan(o)).toBe(m.nhanHoiYMoi);
		expect(nhan(o)).toBe("Mới");
	});

	test("nhanHoiY là số thì in đúng số", async () => {
		const o = await ve(<ThanhTabOkr nhanHoiY={2} tab="cua-toi" />);
		expect(nhan(o)).toBe("2");
	});

	test("nhanHoiY null hoặc không truyền thì không huy hiệu", async () => {
		const a = await ve(<ThanhTabOkr nhanHoiY={null} tab="cua-toi" />);
		const b = await ve(<ThanhTabOkr tab="cua-toi" />);
		expect([nhan(a), nhan(b)]).toEqual([null, null]);
		expect(a.querySelectorAll('[data-slot="badge"]')).toHaveLength(0);
	});

	test("cuộn tab đang đứng vào khung nhìn theo chiều ngang, không kéo trang", async () => {
		const goi: { tab: string | null; tuyChon: unknown }[] = [];
		const cu = HTMLElement.prototype.scrollIntoView;
		HTMLElement.prototype.scrollIntoView = function (
			this: HTMLElement,
			tuyChon?: boolean | ScrollIntoViewOptions,
		) {
			goi.push({ tab: this.getAttribute("href"), tuyChon });
		};
		try {
			const o = await ve(<ThanhTabOkr tab="hoi-y" />);
			expect(o.querySelector("[data-khung-tab]")).not.toBeNull();
		} finally {
			HTMLElement.prototype.scrollIntoView = cu;
		}
		expect(goi).toEqual([
			{
				tab: "/ws/okr/hoi-y?kyOkr=q3",
				tuyChon: { block: "nearest", inline: "nearest" },
			},
		]);
	});

	test("đầu trang ở /okr/hoi-y mang tiêu đề khu «Mục tiêu» và chuyển huy hiệu xuống thanh tab", async () => {
		const o = await ve(<DauTrangOkr chonChuKy={null} nhanHoiY={3} />);
		expect(o.querySelector("h1")?.textContent).toBe(
			khungUngDungMessages("vi").rail.okr,
		);
		expect(tabHoiY(o).getAttribute("aria-selected")).toBe("true");
		expect(nhan(o)).toBe("3");
	});
});
