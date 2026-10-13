import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json };
type DauVao = Json | undefined;
type LoiGoi = { duong: string; vao: DauVao };
type TuyChonGhi = {
	onSuccess?: (kq: Json, vao: DauVao) => void;
	onError?: (e: Error) => void;
};

let daGoi: LoiGoi[] = [];
let giai: ((kq: Json) => void) | null = null;

const goiCua = (duong: string) => daGoi.filter((g) => g.duong === duong);

function thuTuc(duong: string) {
	return {
		queryKey: (vao?: DauVao) => (vao === undefined ? [duong] : [duong, vao]),
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao) => ({
			queryKey: [duong, vao ?? null],
			queryFn: async () => null,
		}),
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: (vao: DauVao) => {
				daGoi.push({ duong, vao });
				return new Promise<Json>((xong) => {
					giai = xong;
				});
			},
		}),
	};
}

const trpcGia = new Proxy(
	{},
	{
		get: (_g, khong: string) =>
			new Proxy({}, { get: (_h, ten: string) => thuTuc(`${khong}.${ten}`) }),
	},
);

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws",
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { crmMessages } = await import("@/lib/messages/crm");
const { DaiLuuTruBanGhi } = await import(
	"@/components/crm/record-sheet/record-actions"
);

const VI = crmMessages("vi");
const THU_TUC = {
	company: "companies",
	contact: "contacts",
	deal: "deals",
} as const;
type Loai = keyof typeof THU_TUC;
const LOAI: Loai[] = ["company", "contact", "deal"];

let root: Root | null = null;

function don() {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	daGoi = [];
	giai = null;
}

afterEach(don);

function ve(loai: Loai): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	act(() =>
		root?.render(
			<QueryClientProvider client={qc}>
				<LocaleProvider locale="vi">
					<DaiLuuTruBanGhi
						record={{ kind: loai, id: "r-1" }}
						archivedAt="2026-09-15T03:00:00.000Z"
					/>
				</LocaleProvider>
			</QueryClientProvider>,
		),
	);
	return o;
}

function nut(o: HTMLElement): HTMLButtonElement {
	const n = [...o.querySelectorAll("button")].find(
		(b) => b.textContent === VI.bulk.restore,
	);
	if (!n) throw new Error("dlt: khong thay nut khoi phuc tren ngan");
	return n;
}

async function cho(dk: () => boolean) {
	for (let i = 0; i < 50 && !dk(); i++)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 10));
		});
}

describe("dlt-ngan-cho", () => {
	test("ma trận 3 loại: đang chờ khôi phục thì nút tắt, bấm hai lần gửi một lần", async () => {
		const o: Loai[] = [];
		for (const loai of LOAI) {
			const goc = ve(loai);
			const ue = userEvent.setup({ document, pointerEventsCheck: 0 });
			const n = nut(goc);
			expect(n.matches(":disabled")).toBe(false);
			await ue.click(n);
			await cho(() => nut(goc).matches(":disabled"));
			await ue.click(nut(goc));
			const duong = `${THU_TUC[loai]}.restore`;
			if (goiCua(duong).length !== 1 || !nut(goc).matches(":disabled"))
				throw new Error("dlt: ngan cho khoi phuc van bam duoc");
			expect(goiCua(duong)[0]?.vao).toEqual({ id: "r-1" });
			await act(async () => giai?.({ id: "r-1", name: "X" }));
			await cho(() => !nut(goc).matches(":disabled"));
			expect(nut(goc).matches(":disabled")).toBe(false);
			o.push(loai);
			don();
		}
		expect(o.length).toBe(3);
	});
});
