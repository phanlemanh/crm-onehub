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
const thuTucTreo = {
	queryOptions: () => ({
		queryKey: ["treo", Math.random()],
		queryFn: () => new Promise(() => {}),
	}),
	mutationKey: () => ["treo"],
	mutationOptions: () => ({ mutationFn: async () => null }),
};
mock.module("@/lib/trpc/client", () => ({
	useTRPC: () =>
		new Proxy({}, { get: () => new Proxy({}, { get: () => thuTucTreo }) }),
}));

const { DauTrangOkr } = await import("@/app/(app)/[slug]/okr/thanh-tab");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { khungUngDungMessages } = await import("@/lib/messages/khung-ung-dung");
const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);

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

describe("thanh tab OKR — bốn tab và huy hiệu Hỏi ý", () => {
	test("đầu trang ở /okr/hoi-y mang tiêu đề khu «Mục tiêu»", async () => {
		const o = await ve(<DauTrangOkr chonChuKy={null} />);
		expect(o.querySelector("h1")?.textContent).toBe(
			khungUngDungMessages("vi").rail.okr,
		);
	});
});
