import { afterEach, describe, expect, mock, test } from "bun:test";
import { soSanh, suKienDoi } from "@crm/validation/tai-lieu-diff";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

const thuTucCho = {
	mutationOptions: (tuy: object = {}) => ({
		...tuy,
		mutationFn: () => new Promise<never>(() => {}),
	}),
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: { approve: thuTucCho, reject: thuTucCho },
		taiLieuNguon: { taiVe: thuTucCho },
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ taiLieu: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {},
		replace: () => {},
		refresh: () => {},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/tai-lieu",
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
	PageShellContent: khoi("div"),
}));

const { ManDuyet } = await import(
	"@/app/(app)/[slug]/tai-lieu/de-xuat/[id]/man-duyet"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { taiLieuMessages } = await import("@/lib/messages/tai-lieu");

type DeXuat = ComponentProps<typeof ManDuyet>["deXuat"];

const MM = taiLieuMessages("vi").duyetMay;

const BAN_GOC = "## Hoa hồng\n\nMức cũ: tầng hai hưởng 1,2% kể từ quý trước.";
const BAN_MAY =
	"## Hoa hồng\n\nTừ ngày 01/10/2026, tầng hai hưởng 1,5% và tầng ba hưởng 1,8%.";
const TRICH = ["Kể từ ngày 01/10/2026", "tầng 2 là 1,5%", "tầng 3 là 1,8%"];
const KHOI = soSanh(BAN_GOC, BAN_MAY);

const MAY_CO_GOC: DeXuat = {
	id: "dx-may-goc",
	slug: "quy-dinh-hoa-hong",
	ten: "Quy định hoa hồng",
	taoBoi: "Trần An",
	taoLuc: "2026-09-26T20:30:00.000Z",
	trangThai: "CHO_DUYET",
	lyDo: null,
	cu: false,
	duyetDuoc: true,
	khoi: KHOI,
	dai: suKienDoi(KHOI),
	may: {
		tenTep: "quyet-dinh-12.docx",
		chuNguon: `Quyết định số 12. ${TRICH.join(", ")}. Hết.`,
		noiDung: BAN_MAY,
		coBanGoc: true,
		doanTrich: TRICH,
		dong: [
			{ so: "01/10/2026", trich: TRICH[0] ?? "" },
			{ so: "1,5%", trich: TRICH[1] ?? "" },
			{ so: "1,8%", trich: TRICH[2] ?? "" },
		],
	},
};

const matchMediaGoc = window.matchMedia;
let dangMo: Root[] = [];

afterEach(() => {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
	window.matchMedia = matchMediaGoc;
});

const nhip = () =>
	act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});

async function mo(deXuat: DeXuat): Promise<void> {
	window.matchMedia = ((query: string) => ({
		matches: true,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	})) as typeof window.matchMedia;
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">
					<ManDuyet deXuat={deXuat} />
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	await nhip();
}

async function docXong(): Promise<void> {
	const nut = [...document.body.querySelectorAll<HTMLElement>("button")].find(
		(b) => b.textContent?.trim() === MM.daDoc,
	);
	if (!nut) throw new Error("khong thay nut da doc nguon");
	await act(async () => {
		nut.click();
	});
	for (let i = 0; i < 6; i += 1) await nhip();
}

function tieuDeSoSanh(): string {
	return (
		document.body.querySelector("[data-so-voi-ban] [data-slot=card-title]")
			?.textContent ?? ""
	);
}

describe("ssct-duyet-may-cu", () => {
	for (const cu of [true, false] as const) {
		test(`ssct-duyet-may-cu: bản máy có bản gốc, đã đọc, cu=${cu}`, async () => {
			await mo({ ...MAY_CO_GOC, cu });
			await docXong();
			expect(tieuDeSoSanh()).toBe(cu ? MM.soVoiBanGocMay : MM.soVoiBan);
		});
	}
});
