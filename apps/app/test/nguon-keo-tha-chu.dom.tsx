import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

function truyVan<R>(khoa: string, tra: () => R) {
	return {
		queryKey: () => [khoa],
		queryOptions: () => ({ queryKey: [khoa], queryFn: async () => tra() }),
	};
}

function dotBien(ten: string) {
	return {
		mutationOptions: () => ({
			mutationKey: [ten],
			mutationFn: async () => {
				throw new Error(`${ten} khong duoc goi trong phep do chu`);
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieuNguon: {
			trangThai: truyVan("taiLieuNguon.trangThai", () => ({ bat: true })),
			list: truyVan("taiLieuNguon.list", () => ({ rows: [] })),
			xinCho: dotBien("taiLieuNguon.xinCho"),
			nhan: dotBien("taiLieuNguon.nhan"),
		},
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

const { NutTaiNguon } = await import(
	"@/app/(app)/[slug]/tai-lieu/hop-tai-nguon"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { taiLieuMessages } = await import("@/lib/messages/tai-lieu");

type LuaChonTai = ComponentProps<typeof NutTaiNguon>["luaChon"];
type NgonNgu = "vi" | "en";

const LUA_CHON: LuaChonTai = {
	toiId: "u-1",
	chuTrang: [{ id: "u-1", ten: "Nguyễn Thu Hà" }],
	donVi: [],
	trangDangDung: [],
};
const SO_NHIP = 4;

let dangMo: Root[] = [];

function don(): void {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
}

afterEach(don);

async function nhip(): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

function ghim(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

async function nhanNutChon(ngonNgu: NgonNgu): Promise<string> {
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
				<LocaleProvider locale={ngonNgu}>
					<NutTaiNguon luaChon={LUA_CHON} />
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	for (let i = 0; i < SO_NHIP; i += 1) await nhip();
	const moHop =
		document.body.querySelector<HTMLButtonElement>("[data-tai-nguon]");
	if (!moHop) throw new Error("khong thay nut tai nguon");
	await act(async () => {
		moHop.click();
	});
	for (let i = 0; i < SO_NHIP; i += 1) await nhip();
	const n = document.body.querySelector(
		"[data-hop-tai-nguon] [data-slot='nguon-keo-tha'] button",
	);
	if (!n) throw new Error("khong thay nut chon trong hop tai");
	return n.textContent ?? "";
}

describe("chu-nut — nhãn nút chọn tệp lấy từ tệp chữ", () => {
	test("chu-nut: vi và en đúng trọn chuỗi keoThaNut", async () => {
		const vi = await nhanNutChon("vi");
		don();
		const en = await nhanNutChon("en");
		ghim(
			vi === taiLieuMessages("vi").nguon.hop.keoThaNut,
			"nhan nut khong lay tu tep chu",
		);
		ghim(
			en === taiLieuMessages("en").nguon.hop.keoThaNut,
			"nhan nut khong lay tu tep chu",
		);
		expect(vi).not.toBe(en);
	});
});
