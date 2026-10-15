import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { TAI_LIEU_HOI } from "@crm/validation/tai-lieu-hoi";
import { WORKSPACE_ROLES } from "@crm/validation/vai-workspace";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const GOC = "GOC-VIET-ABC";
const TRAN = TAI_LIEU_HOI.tranNgay.replace(
	"{so}",
	String(TAI_LIEU_HOI.tran.ngay),
);

const TRA_LOI = {
	trangThai: "TRA_LOI",
	goc: GOC,
	traLoi: {
		cau: [
			{
				chu: "Nhân viên thử việc chưa được hưởng hoa hồng.",
				trich: [
					{
						slug: "hoa-hong",
						ten: "Quy định hoa hồng",
						phienBan: 3,
						duyetLuc: "2026-09-05T03:00:00.000Z",
						doan: "Nhân viên thử việc không hưởng hoa hồng.",
					},
				],
			},
			{
				chu: "Tầng 2 hưởng 1,2%.",
				trich: [
					{
						slug: "bang-hoa-hong",
						ten: "Bảng hoa hồng đối tác",
						phienBan: 1,
						duyetLuc: "2026-08-20T03:00:00.000Z",
						doan: "Tầng 2 hưởng 1,2% doanh thu.",
					},
				],
			},
		],
		quaHan: [],
	},
};

const QUA_HAN = {
	...TRA_LOI,
	traLoi: {
		...TRA_LOI.traLoi,
		quaHan: [
			{
				slug: "hoa-hong",
				ten: "Quy định hoa hồng",
				xacMinhDen: "2026-09-20T05:00:00.000Z",
				chuTrang: "Hà",
			},
		],
	},
};

const TU_CHOI = {
	trangThai: "TU_CHOI",
	ganNhat: [{ slug: "nghi-phep", ten: "Nghỉ phép năm" }],
};

type LoiTrpc = Error & { data?: { httpStatus?: number; code?: string } };
type KetQuaGia =
	| typeof TRA_LOI
	| typeof QUA_HAN
	| typeof TU_CHOI
	| { trangThai: "LOI"; lyDo: "het-tran" };
type BaoSaiVao = { hoiId: string; cauHoi: string; ghiChu?: string };
type ChonMutation = { onSuccess?: () => void };
type Canh = {
	ketQua: KetQuaGia | null;
	loiHoi: LoiTrpc | null;
	goiHoi: string[];
	goiBaoSai: BaoSaiVao[];
};

function canhMoi(): Canh {
	return { ketQua: null, loiHoi: null, goiHoi: [], goiBaoSai: [] };
}

const canh = canhMoi();

const treo = () => new Promise<never>(() => {});

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			proposals: {
				queryKey: () => ["taiLieu.proposals"],
				queryOptions: () => ({
					queryKey: ["taiLieu.proposals"],
					queryFn: treo,
				}),
			},
		},
		hoiKho: {
			hoi: {
				mutationOptions: (chon?: ChonMutation) => ({
					...chon,
					mutationFn: async (v: { cauHoi: string }) => {
						canh.goiHoi.push(v.cauHoi);
						if (canh.loiHoi) throw canh.loiHoi;
						return { hoiId: `h${canh.goiHoi.length}` };
					},
				}),
			},
			ketQua: {
				queryOptions: (vao: { hoiId: string }) => ({
					queryKey: ["hoiKho.ketQua", vao],
					queryFn: async () => canh.ketQua ?? { trangThai: "DANG_HOI" },
				}),
			},
			baoSai: {
				mutationOptions: (chon?: ChonMutation) => ({
					...chon,
					mutationFn: async (v: BaoSaiVao) => {
						canh.goiBaoSai.push(v);
						return { soViec: 1 };
					},
				}),
			},
		},
	}),
}));
mock.module("@/app/(app)/[slug]/tai-lieu/hop-tai-nguon", () => ({
	NutTaiNguon: () => null,
}));
mock.module("next/navigation", () => ({
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/tai-lieu",
	useSearchParams: () => new URLSearchParams(),
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		href,
		scroll: _scroll,
		...props
	}: {
		children: ReactNode;
		href: string;
		scroll?: boolean;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));
mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
mock.module("@/app/(app)/[slug]/tai-lieu/danh-sach-trang", () => ({
	DanhSachTrang: () => <div data-noi-dung-trang="" />,
}));

const { HoiKho } = await import("@/app/(app)/[slug]/tai-lieu/hoi");
const { DanhSach } = await import("@/app/(app)/[slug]/tai-lieu/danh-sach");
const { coHoiCuaVai } = await import("@/app/(app)/[slug]/tai-lieu/co-hoi");

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	Object.assign(canh, canhMoi());
});

const nhip = () => new Promise((r) => setTimeout(r, 30));

async function cho(): Promise<void> {
	for (let i = 0; i < 6; i += 1) {
		await act(async () => {
			await nhip();
		});
	}
}

async function mo(con: ReactNode): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter hasMemory>
				<QueryClientProvider client={qc}>
					<LocaleProvider locale="vi">{con}</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await cho();
	return khung;
}

function nut(goc: ParentNode, chu: string): HTMLButtonElement | undefined {
	return [...goc.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
}

async function bam(b: HTMLElement | undefined | null): Promise<void> {
	if (!b) throw new Error("tlk-man-hoi: khong thay nut");
	await act(async () => {
		b.click();
		await nhip();
	});
	await cho();
}

function oNhap(goc: ParentNode): HTMLTextAreaElement {
	const o = goc.querySelector("textarea");
	if (!o) throw new Error("tlk-man-hoi: khong thay o nhap");
	return o;
}

async function go(o: HTMLTextAreaElement, chu: string): Promise<void> {
	const dat = Object.getOwnPropertyDescriptor(
		HTMLTextAreaElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
		await nhip();
	});
}

async function hoiGoiY(goc: HTMLElement): Promise<string> {
	const goiY = goc.querySelector<HTMLButtonElement>("[data-goi-y] button");
	const cau = goiY?.textContent?.trim() ?? "";
	await bam(goiY);
	return cau;
}

describe("tlk-man-hoi", () => {
	test("tlk-man-hoi: ST-hoi-trong co cau mo dau va ba goi y", async () => {
		const goc = await mo(<HoiKho />);
		expect(goc.textContent).toContain(
			"Hỏi về quy định, chính sách, quy trình hay biểu mẫu của OneHub.",
		);
		expect(goc.textContent).toContain(
			"Kara chỉ trả lời từ bản đang dùng của các trang đã duyệt.",
		);
		expect(goc.querySelectorAll("[data-goi-y] button")).toHaveLength(3);
		expect(oNhap(goc).disabled).toBe(false);
	});

	test("tlk-man-hoi: ST-hoi-dang-doc hien tro ly dang doc kho", async () => {
		const goc = await mo(<HoiKho />);
		const cau = await hoiGoiY(goc);
		expect(canh.goiHoi).toEqual([cau]);
		expect(goc.textContent).toContain(cau);
		expect(goc.textContent).toContain("Kara đang đọc kho…");
	});

	test("tlk-man-hoi: ST-hoi-tra-loi dung tung y tu traLoi da kiem, trich duoi tung y, bao sai thanh da bao sai", async () => {
		canh.ketQua = TRA_LOI;
		const goc = await mo(<HoiKho />);
		const cau = await hoiGoiY(goc);
		const y = [...goc.querySelectorAll("[data-y-tra-loi]")];
		const chuY = y.map((e) =>
			e.querySelector("[data-chu-y]")?.textContent?.trim(),
		);
		const mong = TRA_LOI.traLoi.cau.map((c) => c.chu);
		if (
			JSON.stringify(chuY) !== JSON.stringify(mong) ||
			goc.textContent?.includes(GOC)
		) {
			throw new Error(
				`tlk-man-hoi: tra-loi khong khop hang: ${JSON.stringify(chuY)}`,
			);
		}
		TRA_LOI.traLoi.cau.forEach((c, i) => {
			const t = c.trich[0];
			if (!t) throw new Error("tlk-man-hoi: thieu trich");
			const khoi = y[i];
			const a = khoi?.querySelector(`a[href$="/tai-lieu/${t.slug}"]`);
			expect(a?.textContent).toBe(t.ten);
			expect(khoi?.textContent).toContain(`Phiên bản ${t.phienBan}`);
			expect(khoi?.textContent).toContain(`«${t.doan}»`);
		});
		expect(y[0]?.textContent).toContain("05/09/2026");
		expect(goc.querySelector("[data-nhan-tra-loi]")?.textContent).toBe(
			"Kara · theo bản đang dùng",
		);
		expect(goc.querySelector("[aria-live=polite]")?.textContent).toContain(
			TRA_LOI.traLoi.cau[0]?.chu ?? "x",
		);
		await bam(nut(goc, "Báo sai"));
		expect(document.body.textContent).toContain("Báo câu trả lời sai");
		await bam(nut(document.body, "Gửi cho chủ trang"));
		expect(canh.goiBaoSai).toEqual([{ hoiId: "h1", cauHoi: cau }]);
		const daBao = nut(goc, "Đã báo sai");
		expect(daBao?.disabled).toBe(true);
	});

	test("tlk-man-hoi: chu y la chu thuong, khong dung link hay anh model viet", async () => {
		const cau0 = TRA_LOI.traLoi.cau[0];
		if (!cau0) throw new Error("tlk-man-hoi: thieu cau mau");
		canh.ketQua = {
			...TRA_LOI,
			traLoi: {
				...TRA_LOI.traLoi,
				cau: [
					{
						...cau0,
						chu: "Xem [ở đây](https://ngoai.test/x) ![ảnh](https://ngoai.test/a.png) nhé.",
					},
				],
			},
		};
		const goc = await mo(<HoiKho />);
		await hoiGoiY(goc);
		const y = goc.querySelector("[data-chu-y]");
		if (
			y?.querySelector('a[href^="https://ngoai.test"]') ||
			y?.querySelector("img")
		) {
			throw new Error("tlk-man-hoi: dung link hay anh cua model");
		}
		expect(y?.textContent).toContain("[ở đây](https://ngoai.test/x)");
	});

	test("tlk-man-hoi: ST-hoi-qua-han co Alert ten trang qua han", async () => {
		canh.ketQua = QUA_HAN;
		const goc = await mo(<HoiKho />);
		await hoiGoiY(goc);
		const canhBao = goc.querySelector("[data-qua-han]");
		expect(canhBao?.getAttribute("role")).toBe("alert");
		expect(canhBao?.textContent).toContain("Quy định hoa hồng");
		expect(canhBao?.textContent).toContain("quá hạn xác minh từ 20/09/2026");
		expect(canhBao?.textContent).toContain("Hà");
	});

	test("tlk-man-hoi: ST-hoi-tu-choi chu tu choi dung hang, trang gan nhat la lien ket", async () => {
		canh.ketQua = TU_CHOI;
		const goc = await mo(<HoiKho />);
		await hoiGoiY(goc);
		const chu = goc.textContent ?? "";
		expect(chu).toContain(TAI_LIEU_HOI.tuChoi);
		expect(chu).toContain("Trang gần nhất");
		expect(chu).toContain("Câu hỏi đã vào hàng chưa trả lời được.");
		const a = goc.querySelector('a[href$="/tai-lieu/nghi-phep"]');
		expect(a?.textContent).toBe("Nghỉ phép năm");
		expect(nut(goc, "Báo sai")).toBeUndefined();
	});

	test("tlk-man-hoi: ST-hoi-loi het-tran hien cau het han muc va Hoi lai gui lai dung cau", async () => {
		canh.ketQua = { trangThai: "LOI", lyDo: "het-tran" };
		const goc = await mo(<HoiKho />);
		const cau = await hoiGoiY(goc);
		expect(goc.textContent).toContain(TAI_LIEU_HOI.hetTran);
		await bam(nut(goc, "Hỏi lại"));
		expect(canh.goiHoi).toEqual([cau, cau]);
	});

	test("tlk-man-hoi: ST-hoi-tran o nhap bi khoa va hien cau tran", async () => {
		canh.loiHoi = Object.assign(new Error(TRAN), {
			data: { httpStatus: 429, code: "TOO_MANY_REQUESTS" },
		});
		const goc = await mo(<HoiKho />);
		await hoiGoiY(goc);
		expect(goc.textContent).toContain(TRAN);
		expect(oNhap(goc).disabled).toBe(true);
	});

	test("tlk-man-hoi: gui loi mang thi chu trong o con nguyen va Thu lai gui lai", async () => {
		canh.loiHoi = new TypeError("Failed to fetch");
		const goc = await mo(<HoiKho />);
		const cau = "Quy định công tác phí thế nào?";
		const o = oNhap(goc);
		await go(o, cau);
		await act(async () => {
			o.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
			);
			await nhip();
		});
		await cho();
		expect(canh.goiHoi).toEqual([cau]);
		if (oNhap(goc).value !== cau) {
			throw new Error(
				`tlk-man-hoi: mat chu khi loi: ${JSON.stringify(oNhap(goc).value)}`,
			);
		}
		expect(goc.textContent).toContain("Chưa gửi được: máy chủ không trả lời");
		canh.loiHoi = null;
		await bam(nut(goc, "Thử lại"));
		expect(canh.goiHoi).toEqual([cau, cau]);
	});

	test("tlk-man-hoi: vai okr khong co tab Hoi, vai khac co", async () => {
		const tab = async (vai: string | null) => {
			const goc = await mo(<DanhSach coHoi={coHoiCuaVai(vai)} />);
			const ten = [...goc.querySelectorAll("[role=tablist] a")].map((a) =>
				a.textContent?.trim(),
			);
			act(() => root?.unmount());
			root = null;
			return ten;
		};
		const thay: string[] = [];
		for (const vai of [...WORKSPACE_ROLES, null]) {
			if ((await tab(vai)).includes("Hỏi")) thay.push(String(vai));
		}
		expect(thay, "tlk-man-hoi: tab Hoi theo vai sai").toEqual([
			"owner",
			"admin",
			"member",
		]);
	});
});
