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

const CHU_VUNG = {
	vi: ["Chọn tệp", "Kéo tệp vào đây", "Word (.docx) hoặc PDF, tới 20 MB"],
	en: ["Choose file", "Drag a file here", "Word (.docx) or PDF, up to 20 MB"],
} as const satisfies Record<NgonNgu, readonly [string, string, string]>;
const DONG_TU_NUT = { vi: "chọn", en: "choose" } as const satisfies Record<
	NgonNgu,
	string
>;
const NGON_NGU: readonly NgonNgu[] = ["vi", "en"];

let dangMo: Root[] = [];

afterEach(() => {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
});

async function nhip(): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

function ghim(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

async function docVung(
	ngonNgu: NgonNgu,
): Promise<{ chu: string; goiY: string }> {
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
	const vung = document.body.querySelector(
		"[data-hop-tai-nguon] [data-slot='nguon-keo-tha']",
	);
	if (!vung) throw new Error("khong thay vung keo tha trong hop tai");
	const cot = vung.querySelector("button")?.nextElementSibling;
	return {
		chu: vung.textContent ?? "",
		goiY: cot?.firstElementChild?.textContent ?? "",
	};
}

async function kiemChu(ngonNgu: NgonNgu): Promise<void> {
	const { chu, goiY } = await docVung(ngonNgu);
	const thongDiep = `chu vung keo tha ${ngonNgu} lech`;
	ghim(chu === CHU_VUNG[ngonNgu].join(""), `${thongDiep}: «${chu}»`);
	ghim(
		goiY === taiLieuMessages(ngonNgu).nguon.hop.keoTha,
		`${thongDiep}: goi y «${goiY}» khong lay tu tep chu`,
	);
	expect(goiY).toBe(CHU_VUNG[ngonNgu][1]);
}

describe("keo-tha-khong-lap-chu — câu gợi ý không lặp chữ của nút", () => {
	test("chu-vi: vùng kéo-thả tiếng Việt đúng trọn nút, câu gợi ý, mô tả", async () => {
		await kiemChu("vi");
	});

	test("chu-en: vùng kéo-thả tiếng Anh đúng trọn nút, câu gợi ý, mô tả", async () => {
		await kiemChu("en");
	});

	test("khong-lap: câu gợi ý không chứa động từ của nhãn nút ở cả hai ngôn ngữ", () => {
		for (const l of NGON_NGU) {
			const m = taiLieuMessages(l).nguon.hop;
			const dongTu = (m.keoThaNut.split(" ")[0] ?? "").toLocaleLowerCase(l);
			ghim(dongTu === DONG_TU_NUT[l], `nhan nut doi: ${l} «${m.keoThaNut}»`);
			ghim(
				!m.keoTha.toLocaleLowerCase(l).includes(dongTu),
				`cau goi y ${l} lap dong tu cua nut: ${dongTu}`,
			);
		}
	});
});
