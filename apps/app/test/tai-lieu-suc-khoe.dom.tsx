import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const CHU = { id: "u1", name: "Hà" };

const DU = {
	quaHan: {
		rows: [
			{
				slug: "zalo",
				ten: "Dùng Zalo với đối tác",
				chuTrang: CHU,
				xacMinhDen: "2026-08-28T00:00:00.000Z",
			},
		],
		total: 1,
	},
	choDuyet: {
		rows: [{ slug: "hoa-hong", ten: "Hoa hồng", chuTrang: CHU, soBan: 2 }],
		total: 1,
	},
	gay: {
		rows: [
			{
				slug: "zalo",
				ten: "Dùng Zalo với đối tác",
				chuTrang: CHU,
				lienKet: [{ denSlug: "quy-che-thuong", vanBan: "quy chế thưởng" }],
			},
		],
		total: 1,
	},
	chuaCo: {
		rows: [
			{ denSlug: "quy-che-thuong", vanBan: "quy chế thưởng", soTrang: 2 },
			{ denSlug: "bang-gia", vanBan: "bảng giá", soTrang: 1 },
		],
		total: 2,
	},
	moCoi: {
		rows: [
			{
				slug: "nghi-phep",
				ten: "Nghỉ phép năm",
				chuTrang: CHU,
				duyetLuc: "2026-09-01T00:00:00.000Z",
			},
		],
		total: 1,
	},
	chuaTraLoi: { rows: [], total: 0 },
	baoSai: { rows: [], total: 0 },
};

const canh = { loi: false, goi: 0 };

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			sucKhoe: {
				queryOptions: () => ({
					queryKey: ["taiLieu.sucKhoe"],
					queryFn: async () => {
						canh.goi += 1;
						if (canh.loi) throw new Error("mang");
						return DU;
					},
				}),
			},
		},
	}),
}));
mock.module("next/navigation", () => ({
	useParams: () => ({ slug: "ws" }),
	useRouter: () => ({ push: () => {}, prefetch: () => {} }),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: {
		children: ReactNode;
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

const { SucKhoe } = await import("@/app/(app)/[slug]/tai-lieu/suc-khoe");

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	canh.loi = false;
	canh.goi = 0;
});

const nhip = () => new Promise((r) => setTimeout(r, 30));

async function cho(): Promise<void> {
	for (let i = 0; i < 6; i += 1) {
		await act(async () => {
			await nhip();
		});
	}
}

async function mo(): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	await act(async () => {
		root?.render(
			<QueryClientProvider client={qc}>
				<LocaleProvider locale="vi">
					<SucKhoe />
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	await cho();
	return khung;
}

describe("man-suc-khoe", () => {
	test("man-suc-khoe: nam khoi dung ten va so, dong trang dan toi man doc, co chu trang", async () => {
		const goc = await mo();
		const khoi = [...goc.querySelectorAll("[data-khoi-suc-khoe]")].map((k) => ({
			id: k.getAttribute("data-khoi-suc-khoe"),
			so: k.querySelector("[data-so]")?.getAttribute("data-so"),
		}));
		expect(khoi).toEqual([
			{ id: "qua-han", so: "1" },
			{ id: "cho-duyet", so: "1" },
			{ id: "gay", so: "1" },
			{ id: "chua-co", so: "2" },
			{ id: "mo-coi", so: "1" },
			{ id: "chua-tra-loi", so: "0" },
			{ id: "bao-sai", so: "0" },
		]);
		const chu = goc.textContent ?? "";
		for (const tieuDe of [
			"Quá hạn xác minh",
			"Có đề xuất chờ duyệt",
			"Liên kết gãy",
			"Được nhắc mà chưa có trang",
			"Mồ côi: không trang nào dẫn tới",
		]) {
			expect(chu).toContain(tieuDe);
		}
		const quaHan =
			goc.querySelector('[data-khoi-suc-khoe="qua-han"]')?.textContent ?? "";
		if (quaHan.includes("hết hạn") || !quaHan.includes("xác minh đến")) {
			throw new Error(
				`man-suc-khoe: dong qua han khong theo tu dien: ${quaHan}`,
			);
		}
		expect(chu).toContain("2 bản chờ duyệt");
		expect(chu).toContain("liên kết tới «quy chế thưởng»");
		expect(chu).toContain("2 trang nhắc tới");
		const moCoi = goc.querySelector('[data-khoi-suc-khoe="mo-coi"] a');
		expect(moCoi?.getAttribute("href")).toBe("/ws/tai-lieu/nghi-phep");
		expect(moCoi?.textContent).toContain("Hà");
	});

	test("man-suc-khoe: tai loi thi hien loi co nut thu lai, khong hien danh sach rong", async () => {
		canh.loi = true;
		const goc = await mo();
		const chu = goc.textContent ?? "";
		if (chu.includes("Không có trang nào.")) {
			throw new Error("man-suc-khoe: loi hien thanh rong");
		}
		expect(chu).toContain("Không tải được sức khoẻ kho.");
		const truoc = canh.goi;
		canh.loi = false;
		await act(async () => {
			[...goc.querySelectorAll("button")]
				.find((b) => b.textContent === "Thử lại")
				?.click();
			await nhip();
		});
		await cho();
		expect(canh.goi).toBe(truoc + 1);
		expect(goc.querySelectorAll("[data-khoi-suc-khoe]")).toHaveLength(7);
	});
});
