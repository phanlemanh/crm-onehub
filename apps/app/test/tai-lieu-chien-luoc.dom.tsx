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

type VaoDuyet = { id: string; diffHash: string };
type VaoTraLai = { id: string; lyDo: string };
type TuyChonDotBien = { onSuccess?: () => unknown; onError?: () => unknown };

const goiDuyet: VaoDuyet[] = [];

function dotBien<V, R>(ten: string, ghi: V[], tra: R) {
	return {
		mutationOptions: (tuy: TuyChonDotBien = {}) => ({
			...tuy,
			mutationKey: [ten],
			mutationFn: async (v: V) => {
				ghi.push(v);
				return tra;
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			approve: dotBien("approve", goiDuyet, {
				slug: "s",
				so: 1,
				canhBaoTuCam: [],
			}),
			reject: dotBien<VaoTraLai, { ok: boolean }>("reject", [], { ok: true }),
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
const { TruongTrangMoi, trangMoiMacDinh } = await import(
	"@/app/(app)/[slug]/tai-lieu/truong-trang-moi"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { taiLieuMessages } = await import("@/lib/messages/tai-lieu");

const t = taiLieuMessages("vi");
type DeXuat = ComponentProps<typeof ManDuyet>["deXuat"];
const KHOI = soSanh("", "Hải Đăng vận chuyển hàng lạnh.");
const GOC: DeXuat = {
	id: "dx-1",
	slug: "chien-luoc-nam",
	ten: "Chiến lược năm",
	taoBoi: "Trần An",
	taoLuc: "2026-09-26T20:30:00.000Z",
	trangThai: "CHO_DUYET",
	lyDo: null,
	cu: false,
	duyetDuoc: true,
	khoi: KHOI,
	dai: suKienDoi(KHOI),
};

let dangMo: Root[] = [];
async function mo(node: ReactNode) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">{node}</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}
afterEach(() => {
	for (const r of dangMo) act(() => r.unmount());
	dangMo = [];
	document.body.innerHTML = "";
	goiDuyet.length = 0;
});
const q = (s: string) => document.body.querySelector(s);

describe("tao-trang", () => {
	test("ô loại có «Chiến lược»; chọn loại này hiện mô tả «Trợ lý OKR đọc bản đang dùng của loại này»", async () => {
		expect(t.loai["chien-luoc"]).toBe("Chiến lược");
		await mo(
			<TruongTrangMoi
				chuTrang={[{ id: "toi", ten: "Tôi" }]}
				donVi={[]}
				giaTri={{ ...trangMoiMacDinh("toi"), loai: "chien-luoc" }}
				onDoi={() => {}}
				toiId="toi"
			/>,
		);
		expect(q("[data-mo-ta-loai]")?.textContent).toBe(
			"Trợ lý OKR đọc bản đang dùng của loại này",
		);
	});
	test("loại quy-dinh không có mô tả loại", async () => {
		await mo(
			<TruongTrangMoi
				chuTrang={[{ id: "toi", ten: "Tôi" }]}
				donVi={[]}
				giaTri={trangMoiMacDinh("toi")}
				onDoi={() => {}}
				toiId="toi"
			/>,
		);
		expect(q("[data-mo-ta-loai]")).toBeNull();
	});
});

describe("duyet-chien-luoc", () => {
	test("có từ cấm → Alert nêu đúng các chữ, nút duyệt vẫn có", async () => {
		await mo(
			<ManDuyet
				deXuat={{
					...GOC,
					chienLuoc: {
						soKyTu: 19_000,
						tranKyTu: 20_000,
						canhBaoTuCam: ["thưởng", "xếp hạng"],
					},
				}}
			/>,
		);
		const canhBao = q("[data-canh-bao-tu-cam]");
		expect(canhBao, "canh bao khong hien").not.toBeNull();
		expect(canhBao?.textContent).toContain(
			"Có chữ về thưởng, xếp hạng — Trợ lý OKR không được nhắc tới những thứ này",
		);
		expect(q("[data-nut-duyet]")).not.toBeNull();
		expect(q("[data-qua-tran]")).toBeNull();
	});
	test("quá trần → lỗi có số 20.000 và 24.310, không có nút duyệt, còn nút trả lại", async () => {
		await mo(
			<ManDuyet
				deXuat={{
					...GOC,
					chienLuoc: { soKyTu: 24_310, tranKyTu: 20_000, canhBaoTuCam: [] },
				}}
			/>,
		);
		expect(q("[data-qua-tran]")?.textContent).toContain(
			"Trang chiến lược tối đa 20.000 ký tự (đang 24.310)",
		);
		expect(q("[data-nut-duyet]"), "nut duyet con khi qua tran").toBeNull();
		expect(q("[data-nut-tra-lai]")).not.toBeNull();
	});
	test("trang không phải chiến lược: không Alert nào", async () => {
		await mo(<ManDuyet deXuat={GOC} />);
		expect([q("[data-canh-bao-tu-cam]"), q("[data-qua-tran]")]).toEqual([
			null,
			null,
		]);
		expect(q("[data-nut-duyet]")).not.toBeNull();
	});
});
