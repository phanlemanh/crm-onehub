import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

type HoiMo = { cuocHoiId: string };

const goiHoiMo: unknown[] = [];
const urlDoi: string[] = [];
const traLoi: { cho: Promise<HoiMo> | null } = { cho: null };

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {},
		replace: () => {},
		refresh: () => {},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/okr/toan-canh",
	useSearchParams: () => new URLSearchParams(),
}));

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			hoiMo: {
				mutationOptions: (tuy: Record<string, unknown>) => ({
					...tuy,
					mutationFn: async (vao: unknown) => {
						goiHoiMo.push(vao);
						return traLoi.cho ?? { cuocHoiId: "hoi-1" };
					},
				}),
			},
		},
	}),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { DauTrangOkrCho } = await import(
	"@/app/(app)/[slug]/okr/dau-trang-okr-cho"
);
const { NutHoiKara } = await import("@/app/(app)/[slug]/okr/hoi/nut-hoi-kara");
const { okrHoiMessages } = await import("@/lib/messages/okr-hoi");

let root: Root | null = null;
let o: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	o?.remove();
	root = null;
	o = null;
	goiHoiMo.length = 0;
	urlDoi.length = 0;
	traLoi.cho = null;
	document.body.innerHTML = "";
});

function boc(
	man: ReactElement,
	ngonNgu: "vi" | "en",
	client: QueryClient,
): ReactElement {
	return (
		<NuqsTestingAdapter
			hasMemory
			onUrlUpdate={(e) => urlDoi.push(e.queryString)}
		>
			<QueryClientProvider client={client}>
				<LocaleProvider locale={ngonNgu}>{man}</LocaleProvider>
			</QueryClientProvider>
		</NuqsTestingAdapter>
	);
}

function moi() {
	return new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
}

async function nhip(lan = 3): Promise<void> {
	for (let i = 0; i < lan; i += 1) {
		await act(async () => {
			await new Promise((xong) => setTimeout(xong, 0));
		});
	}
}

async function dung(man: ReactElement, ngonNgu: "vi" | "en" = "vi") {
	const client = moi();
	o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	await act(async () => root?.render(boc(man, ngonNgu, client)));
	await nhip();
	return client;
}

const KHUNG = (
	<DauTrangOkrCho tieuDe="Toàn cảnh" moTa="Mục tiêu của cả công ty." />
);

function nutCho(): HTMLButtonElement[] {
	return [
		...(o?.querySelectorAll<HTMLButtonElement>("[data-nut=hoi-kara]") ?? []),
	];
}

function banGhiCuoi(): string | null {
	const chuoi = urlDoi.at(-1);
	return chuoi === undefined ? null : new URLSearchParams(chuoi).get("record");
}

describe("dto-cho", () => {
	let soO = 0;
	afterEach(() => {
		soO += 1;
	});

	for (const ngonNgu of ["vi", "en"] as const) {
		test(`${ngonNgu}: khung chờ có nút Hỏi Kara thật trước ô chọn kỳ`, async () => {
			const nhan = `dto-cho ${ngonNgu}`;
			await dung(KHUNG, ngonNgu);
			const nut = nutCho();
			expect(`${nhan}: co nut hoi kara ${nut.length}`).toBe(
				`${nhan}: co nut hoi kara 1`,
			);
			const [n] = nut;
			const chu = okrHoiMessages(ngonNgu).nut.hoi;
			expect(
				`${nhan}: chu ${n?.textContent?.trim().endsWith(chu) ? chu : n?.textContent}`,
			).toBe(`${nhan}: chu ${chu}`);
			expect(`${nhan}: khong khoa ${n?.disabled === false}`).toBe(
				`${nhan}: khong khoa true`,
			);
			const vo = n?.parentElement;
			const cum = vo?.parentElement;
			const oKy = cum?.querySelector("[data-slot=skeleton]");
			const truoc =
				vo !== null &&
				vo !== undefined &&
				oKy !== null &&
				oKy !== undefined &&
				(vo.compareDocumentPosition(oKy) & Node.DOCUMENT_POSITION_FOLLOWING) !==
					0;
			expect(`${nhan}: dung truoc o ky ${truoc}`).toBe(
				`${nhan}: dung truoc o ky true`,
			);
			const ngoai = document.createElement("div");
			document.body.appendChild(ngoai);
			const rieng = createRoot(ngoai);
			await act(async () => rieng.render(boc(<NutHoiKara />, ngonNgu, moi())));
			await nhip();
			const mau = ngoai.querySelector("[data-nut=hoi-kara]")?.outerHTML;
			act(() => rieng.unmount());
			ngoai.remove();
			expect(`${nhan}: nut giong luc xong ${n?.outerHTML === mau}`).toBe(
				`${nhan}: nut giong luc xong true`,
			);
		});
	}

	test("đếm ô dto-cho", () => {
		expect(soO).toBe(2);
	});
});

describe("dto-bam", () => {
	let soO = 0;
	afterEach(() => {
		soO += 1;
	});

	test("dung-yen: bấm ở khung chờ mở một cuộc hỏi", async () => {
		const nhan = "dto-bam dung-yen";
		await dung(KHUNG);
		expect(`${nhan}: truoc khi bam ${goiHoiMo.length}`).toBe(
			`${nhan}: truoc khi bam 0`,
		);
		await act(async () => nutCho()[0]?.click());
		await nhip(5);
		expect(`${nhan}: goi hoiMo 1 lan ${JSON.stringify(goiHoiMo)}`).toBe(
			`${nhan}: goi hoiMo 1 lan [{}]`,
		);
		expect(`${nhan}: mo cot hoi ${banGhiCuoi()}`).toBe(
			`${nhan}: mo cot hoi hoi-okr:hoi-1`,
		);
	});

	test("go-giua-chung: khung chờ bị thay trước khi lời mở trả về", async () => {
		const nhan = "dto-bam go-giua-chung";
		let tha: (kq: HoiMo) => void = () => {};
		traLoi.cho = new Promise<HoiMo>((xong) => {
			tha = xong;
		});
		const client = await dung(KHUNG);
		await act(async () => nutCho()[0]?.click());
		await nhip();
		await act(async () =>
			root?.render(
				boc(
					<div data-dau-trang-xong="">
						<NutHoiKara />
					</div>,
					"vi",
					client,
				),
			),
		);
		await nhip();
		await act(async () => tha({ cuocHoiId: "hoi-2" }));
		await nhip(5);
		expect(`${nhan}: goi hoiMo 1 lan ${goiHoiMo.length}`).toBe(
			`${nhan}: goi hoiMo 1 lan 1`,
		);
		expect(`${nhan}: mo cot hoi ${banGhiCuoi()}`).toBe(
			`${nhan}: mo cot hoi hoi-okr:hoi-2`,
		);
	});

	test("đếm ô dto-bam", () => {
		expect(soO).toBe(2);
	});
});
