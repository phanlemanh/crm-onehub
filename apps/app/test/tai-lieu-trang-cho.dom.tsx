import { afterEach, describe, expect, mock, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import { DANG_CHO, type DangCho } from "@crm/validation/tai-lieu";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => ({}) }));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/tai-lieu/chinh-sach",
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

const { ManDoc } = await import("@/app/(app)/[slug]/tai-lieu/[trang]/man-doc");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { taiLieuMessages } = await import("@/lib/messages/tai-lieu");
const { duongNguon, duongSuaTrang } = await import("@/lib/tai-lieu-man");
const { workspaceUrl } = await import("@/lib/workspace-url");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");

type TrangDoc = ComponentProps<typeof ManDoc>["trang"];

const CHU = "Phan Lê Mạnh";
const TEP = "Chinh_sach_nhan_vien_2026_ban_cuoi_cung.pdf";
const LY_DO = "Máy soạn hết thời gian.";
const SLUG = "chinh-sach-nhan-vien";
const NGUON_ID = "nguon-thu-1";

type Nut = "vietTay" | "xemNguon";
const NUT: Record<DangCho, readonly Nut[]> = {
	duyet: [],
	"may-soan": ["xemNguon"],
	"go-tay": ["vietTay", "xemNguon"],
	loi: ["vietTay", "xemNguon"],
	"tra-lai": ["vietTay"],
	"chua-co-ban": ["vietTay"],
};
const CO_NGUON: Record<DangCho, boolean> = {
	duyet: false,
	"may-soan": true,
	"go-tay": true,
	loi: true,
	"tra-lai": false,
	"chua-co-ban": false,
};

function trangVoi(dangCho: DangCho, lyDo: string | null = LY_DO): TrangDoc {
	return {
		slug: SLUG,
		ten: "Chính sách nhân viên",
		loai: "quy-dinh",
		chuTrang: CHU,
		donVi: null,
		phienBan: null,
		noiDung: "",
		choLanDau: {
			dangCho,
			nguon: CO_NGUON[dangCho] ? { id: NGUON_ID, tenTep: TEP, lyDo } : null,
		},
		soBanCho: dangCho === "duyet" ? 1 : 0,
		deXuatChoId: dangCho === "duyet" ? "dx-1" : null,
		nguon: null,
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
});

function mo(trang: TrangDoc, locale: Locale): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => {
		root?.render(
			<LocaleProvider locale={locale}>
				<ManDoc trang={trang} />
			</LocaleProvider>,
		);
	});
	return khung;
}

function khongDich(goc: HTMLElement, chu: string): boolean {
	const la = [...goc.querySelectorAll("*")].filter((e) =>
		[...e.childNodes].some(
			(n) => n.nodeType === Node.TEXT_NODE && n.textContent?.includes(chu),
		),
	);
	return la.length > 0 && la.every((e) => e.closest('[translate="no"]'));
}

describe("man-trang-cho", () => {
	for (const locale of ["vi", "en"] as const) {
		const m = taiLieuMessages(locale).doc;
		const nhan: Record<Nut, string> = {
			vietTay: m.vietTay,
			xemNguon: m.xemNguon,
		};
		const href: Record<Nut, string> = {
			vietTay: workspaceUrl("ws", duongSuaTrang(SLUG)),
			xemNguon: workspaceUrl("ws", duongNguon(NGUON_ID)),
		};

		for (const dc of DANG_CHO) {
			test(`man-trang-cho: ${locale} ${dc} noi dang cho gi va dung nut di tiep`, () => {
				const goc = mo(trangVoi(dc), locale);
				const khoiCho = goc.querySelector(`[data-cho-lan-dau="${dc}"]`);
				if (!khoiCho) throw new Error(`${dc}: thieu khung dang cho`);
				const chu = khoiCho.textContent ?? "";
				expect(chu).toContain(m.cho[dc].tieuDe);
				expect(chu).toContain(dien(m.cho[dc].than, { ten: CHU }));
				expect(khongDich(goc, CHU)).toBe(true);
				if (CO_NGUON[dc]) {
					const dong =
						dc === "loi"
							? dien(m.nguonLyDo, { tep: TEP, lyDo: LY_DO })
							: dien(m.nguonTep, { tep: TEP });
					expect(chu).toContain(dong);
					expect(khongDich(goc, TEP)).toBe(true);
				}
				const nut = [...goc.querySelectorAll("a")];
				for (const k of ["vietTay", "xemNguon"] as const) {
					const a = nut.filter((e) => e.textContent === nhan[k]);
					if (NUT[dc].includes(k)) {
						if (a.length !== 1) throw new Error(`${dc}: thieu nut ${nhan[k]}`);
						expect(a[0]?.getAttribute("href")).toBe(href[k]);
					} else if (a.length > 0) {
						throw new Error(`${dc}: thua nut ${nhan[k]}`);
					}
				}
				const suaTrang = nut.some((e) => e.textContent === m.suaTrang);
				if (suaTrang) throw new Error(`${dc}: con nut Sua trang`);
			});
		}

		test(`man-trang-cho: ${locale} loi khong co ly do chi hien ten tep`, () => {
			const goc = mo(trangVoi("loi", null), locale);
			const chu =
				goc.querySelector('[data-cho-lan-dau="loi"]')?.textContent ?? "";
			expect(chu).toContain(dien(m.nguonTep, { tep: TEP }));
			if (chu.includes(`${TEP}:`)) throw new Error("loi: dau hai cham treo");
		});
	}
});
