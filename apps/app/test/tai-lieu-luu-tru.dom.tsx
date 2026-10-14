import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { taiLieuLichSuMessages } from "@/lib/messages/tai-lieu-lich-su";
import { ngayTaiLieu } from "@/lib/tai-lieu-man";

type ChonMutation = {
	onSuccess?: (ket: never) => unknown;
	onError?: (loi: never) => unknown;
};
const L = taiLieuLichSuMessages("vi").luuTru;
const D = taiLieuMessages("vi");

type LoiTrpc = Error & { data?: { httpStatus?: number } };

const canh = {
	loiGui: null as LoiTrpc | null,
	gui: [] as { thuTuc: string; slug: string; lyDo: string }[],
	duyet: [] as { id: string }[],
};

const thuTucGui = (ten: string) => ({
	mutationOptions: (chon: ChonMutation) => ({
		...chon,
		mutationFn: async (vao: { slug: string; lyDo: string }) => {
			canh.gui.push({ thuTuc: ten, ...vao });
			if (canh.loiGui) throw canh.loiGui;
			return { deXuatId: "dx-moi" };
		},
	}),
});

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			nhacToi: {
				queryOptions: (vao: { slug: string }) => ({
					queryKey: ["taiLieu.nhacToi", vao],
					queryFn: () => new Promise<never>(() => {}),
				}),
			},
			deXuatLuuTru: thuTucGui("deXuatLuuTru"),
			deXuatKhoiPhuc: thuTucGui("deXuatKhoiPhuc"),
			approve: {
				mutationOptions: (chon: ChonMutation) => ({
					...chon,
					mutationFn: async (vao: { id: string }) => {
						canh.duyet.push({ id: vao.id });
						return { slug: "hoa-hong", so: 3, canhBaoTuCam: [] };
					},
				}),
			},
			reject: {
				mutationOptions: (chon: ChonMutation) => ({
					...chon,
					mutationFn: async () => ({ ok: true }),
				}),
			},
		},
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ taiLieu: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useParams: () => ({ slug: "ws" }),
	useRouter: () => ({ push: () => {}, prefetch: () => {}, refresh: () => {} }),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));
const khoi =
	(the: string) =>
	({ children, ...props }: { children?: ReactNode }) =>
		h(the, props, children);
mock.module("@/components/page-shell", () => ({
	PageShellHeader: khoi("header"),
	PageShellHeading: khoi("div"),
	PageShellTitle: khoi("h1"),
	PageShellDescription: khoi("p"),
	PageShellActions: khoi("div"),
	PageShellContent: khoi("div"),
}));

const { ManDoc } = await import("@/app/(app)/[slug]/tai-lieu/[trang]/man-doc");
const { HopViecTrang } = await import(
	"@/app/(app)/[slug]/tai-lieu/[trang]/hop-viec-trang"
);
const { ManDuyetViecTrang } = await import(
	"@/app/(app)/[slug]/tai-lieu/de-xuat/[id]/man-duyet-viec-trang"
);

type TrangDoc = ComponentProps<typeof ManDoc>["trang"];
type LuuTru = NonNullable<TrangDoc["luuTru"]>;

const TEN = "Quy định hoa hồng đối tác";
const NGAY_LUU = "2026-10-12T03:00:00.000Z";
const LY_DO = "Đã thay bằng quy định mới.";

function trang(luuTru: LuuTru): TrangDoc {
	return {
		slug: "hoa-hong",
		ten: TEN,
		loai: "quy-dinh",
		chuTrang: "Nguyễn Thu Hà",
		donVi: null,
		phienBan: { so: 3, duyetLuc: "2026-10-08T03:00:00.000Z" },
		noiDung: "## Mức\n\nTầng 2 hưởng 1,2%.",
		choLanDau: null,
		soBanCho: 0,
		deXuatChoId: null,
		nguon: null,
		luuTru,
	};
}

const DANG_DUNG: LuuTru = {
	daLuuTru: null,
	coLuuTruCho: false,
	coKhoiPhucCho: false,
};

function deXuat(loai: "LUU_TRU" | "KHOI_PHUC") {
	return {
		id: `dx-${loai}`,
		slug: "hoa-hong",
		ten: TEN,
		loai,
		lyDoDeXuat: LY_DO,
		taoBoi: "Trần Minh Quân",
		taoLuc: "2026-10-12T02:00:00.000Z",
		trangThai: "CHO_DUYET" as const,
		lyDo: null,
		duyetDuoc: true,
		diffHash: "a".repeat(64),
	};
}

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	canh.loiGui = null;
	canh.gui = [];
	canh.duyet = [];
});

const nhip = () => new Promise((r) => setTimeout(r, 30));

async function cho(): Promise<void> {
	for (let i = 0; i < 6; i += 1)
		await act(async () => {
			await nhip();
		});
}

async function mo(nut: ReactElement): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<QueryClientProvider client={qc}>
				<LocaleProvider locale="vi">{nut}</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	await cho();
	return khung;
}

async function bamTro(el: Element | null | undefined): Promise<void> {
	if (!(el instanceof HTMLElement)) throw new Error("khong co phan tu de bam");
	await act(async () => {
		for (const loai of ["pointerdown", "mousedown", "pointerup", "click"])
			el.dispatchEvent(
				new window.PointerEvent(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				}),
			);
	});
	await cho();
}

async function go(o: HTMLTextAreaElement, chu: string): Promise<void> {
	const dat = Object.getOwnPropertyDescriptor(
		window.HTMLTextAreaElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function ngoaiVungKhongDich(goc: ParentNode, chu: readonly string[]): string[] {
	return chu.flatMap((c) => {
		const nut = [...goc.querySelectorAll("*")].filter((e) =>
			[...e.childNodes].some(
				(n) => n.nodeType === 3 && (n.textContent ?? "").includes(c),
			),
		);
		if (nut.length === 0) return [`khong thay: ${c}`];
		return nut
			.filter((n) => !n.closest('[translate="no"]'))
			.map((n) => `${n.tagName.toLowerCase()}: ${c}`);
	});
}

const nutGui = () =>
	document.body.querySelector<HTMLButtonElement>("[data-nut-gui]");
const oLyDo = () => document.body.querySelector("textarea");

describe("tai-lieu-luu-tru", () => {
	test("hop: nut gui khoa khi ly do rong hay chi khoang trang, mo khi co chu, 501 ky tu bao loi", async () => {
		await mo(
			<HopViecTrang doiMo={() => {}} mo slug="hoa-hong" viec="LUU_TRU" />,
		);
		expect(document.body.textContent).toContain(L.hop.LUU_TRU.tieuDe);
		expect(nutGui()?.disabled).toBe(true);
		const o = oLyDo();
		if (!o) throw new Error("khong co o ly do");
		await go(o, "   ");
		expect(nutGui()?.disabled).toBe(true);
		await go(o, "Hết dùng.");
		expect(nutGui()?.disabled).toBe(false);
		await go(o, "ữ".repeat(501));
		expect(nutGui()?.disabled).toBe(true);
		expect(document.body.querySelector("[data-ly-do-dai]")).not.toBeNull();
		await go(o, "ữ".repeat(500));
		expect(nutGui()?.disabled).toBe(false);
	});

	test("hop: Huy boc DialogClose — bam Huy dong hop", async () => {
		let dong = 0;
		await mo(
			<HopViecTrang
				doiMo={(m) => {
					if (!m) dong += 1;
				}}
				mo
				slug="hoa-hong"
				viec="LUU_TRU"
			/>,
		);
		await bamTro(document.body.querySelector("[data-nut-huy]"));
		expect(dong).toBe(1);
	});

	test("hop: gui loi mang — giu chu, hien Thu lai; gui dung thu tuc va ly do da cat", async () => {
		canh.loiGui = Object.assign(new Error("ECONNRESET"), {
			data: { httpStatus: 502 },
		});
		await mo(
			<HopViecTrang doiMo={() => {}} mo slug="hoa-hong" viec="KHOI_PHUC" />,
		);
		const o = oLyDo();
		if (!o) throw new Error("khong co o ly do");
		await go(o, "  Cần dùng lại.  ");
		await bamTro(nutGui());
		expect(canh.gui).toEqual([
			{ thuTuc: "deXuatKhoiPhuc", slug: "hoa-hong", lyDo: "Cần dùng lại." },
		]);
		expect(oLyDo()?.value).toBe("  Cần dùng lại.  ");
		expect(nutGui()?.textContent).toBe(L.hop.thuLai);
		expect(document.body.querySelector("[data-loi-gui]")).not.toBeNull();
		expect(ngoaiVungKhongDich(document.body, ["Cần dùng lại."])).toEqual([]);
	});

	test("doc: co de xuat luu tru cho — huy hieu, muc trinh don khoa kem cau vi sao", async () => {
		const goc = await mo(
			<ManDoc trang={trang({ ...DANG_DUNG, coLuuTruCho: true })} />,
		);
		expect(goc.querySelector("[data-co-luu-tru-cho]")?.textContent).toBe(
			L.coLuuTruCho,
		);
		await bamTro(goc.querySelector("[data-menu-trang]"));
		const muc = document.body.querySelector("[data-muc-de-xuat-luu-tru]");
		expect(muc?.getAttribute("aria-disabled")).toBe("true");
		expect(document.body.querySelector("[data-vi-sao-khoa]")?.textContent).toBe(
			L.daCoCho,
		);
	});

	test("doc: trang da luu tru — dai co ngay, nut De xuat khoi phuc, khong Sua trang; chieu do trang dang dung khong co dai", async () => {
		const goc = await mo(
			<ManDoc trang={trang({ ...DANG_DUNG, daLuuTru: { luc: NGAY_LUU } })} />,
		);
		const dai = goc.querySelector("[data-da-luu-tru]");
		expect(dai?.textContent).toContain(
			L.dai.tieuDe.replace("{ngay}", ngayTaiLieu(NGAY_LUU, "vi")),
		);
		expect(
			dai?.querySelector("[data-nut-de-xuat-khoi-phuc]")?.textContent,
		).toBe(L.dai.deXuatKhoiPhuc);
		expect(
			[...goc.querySelectorAll("a")].some(
				(a) => a.textContent === D.doc.suaTrang,
			),
		).toBe(false);
		expect(goc.querySelector("[data-menu-trang]")).toBeNull();
		expect(ngoaiVungKhongDich(goc, [TEN])).toEqual([]);

		act(() => root?.unmount());
		const dangDung = await mo(<ManDoc trang={trang(DANG_DUNG)} />);
		expect(dangDung.querySelector("[data-da-luu-tru]")).toBeNull();
		expect(
			[...dangDung.querySelectorAll("a")].some(
				(a) => a.textContent === D.doc.suaTrang,
			),
		).toBe(true);
	});

	test("doc: da luu tru co de xuat khoi phuc cho — huy hieu thay nut", async () => {
		const goc = await mo(
			<ManDoc
				trang={trang({
					daLuuTru: { luc: NGAY_LUU },
					coLuuTruCho: false,
					coKhoiPhucCho: true,
				})}
			/>,
		);
		expect(goc.querySelector("[data-co-khoi-phuc-cho]")?.textContent).toBe(
			L.dai.coKhoiPhucCho,
		);
		expect(goc.querySelector("[data-nut-de-xuat-khoi-phuc]")).toBeNull();
	});

	test("duyet: LUU_TRU va KHOI_PHUC hien ten viec, ly do, nut rieng, khong DiffTrang; duyet goi dung id", async () => {
		for (const loai of ["LUU_TRU", "KHOI_PHUC"] as const) {
			const goc = await mo(<ManDuyetViecTrang deXuat={deXuat(loai)} />);
			expect(
				goc.querySelector(`[data-viec-trang="${loai}"]`)?.textContent,
			).toContain(L.duyet[loai].tieuDe);
			expect(goc.textContent).toContain(LY_DO);
			expect(goc.querySelector("[data-diff-trang]")).toBeNull();
			const nut = goc.querySelector<HTMLElement>("[data-nut-duyet]");
			expect(nut?.textContent).toBe(L.duyet[loai].nut);
			await bamTro(nut);
			expect(canh.duyet.at(-1)).toEqual({ id: `dx-${loai}` });
			expect(ngoaiVungKhongDich(goc, [TEN, LY_DO])).toEqual([]);
			act(() => root?.unmount());
			khung?.remove();
		}
	});

	test("duyet: chieu do — bo translate o ly do thi phep do bat duoc", async () => {
		const goc = await mo(<ManDuyetViecTrang deXuat={deXuat("LUU_TRU")} />);
		const p = [...goc.querySelectorAll("p")].find((e) =>
			(e.textContent ?? "").includes(LY_DO),
		);
		p?.removeAttribute("translate");
		expect(ngoaiVungKhongDich(goc, [LY_DO])).toEqual([`p: ${LY_DO}`]);
	});
});
