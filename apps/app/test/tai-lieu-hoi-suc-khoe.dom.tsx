import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const CHU = { id: "u1", name: "Hà" };
const RONG = { rows: [], total: 0 };

type DongChua = {
	hoiId: string;
	cauHoi: string;
	ganNhat: { slug: string; ten: string }[];
};
type DongBao = {
	id: string;
	slug: string;
	ten: string;
	phienBan: number;
	cauHoi: string;
	ghiChu: string | null;
	chuTrang: typeof CHU;
};

const CHUA_GOC: DongChua[] = [
	{
		hoiId: "h1",
		cauHoi: "Thử việc có hoa hồng không?",
		ganNhat: [{ slug: "hoa-hong", ten: "Quy định hoa hồng" }],
	},
	{ hoiId: "h2", cauHoi: "Mẫu tạm ứng ở đâu?", ganNhat: [] },
];
const BAO_GOC: DongBao[] = [
	{
		id: "b1",
		slug: "hoa-hong",
		ten: "Quy định hoa hồng",
		phienBan: 3,
		cauHoi: "Tầng 2 hưởng bao nhiêu?",
		ghiChu: "Bảng mới là 1,5%.",
		chuTrang: CHU,
	},
	{
		id: "b2",
		slug: "nghi-phep",
		ten: "Nghỉ phép năm",
		phienBan: 1,
		cauHoi: "Nghỉ phép mấy ngày?",
		ghiChu: null,
		chuTrang: CHU,
	},
];

const canh = {
	loi: false,
	goi: 0,
	chua: [...CHUA_GOC],
	bao: [...BAO_GOC],
	xuLyChua: [] as unknown[],
	xuLyBao: [] as unknown[],
};

function duLieu() {
	return {
		quaHan: RONG,
		choDuyet: RONG,
		gay: RONG,
		chuaCo: RONG,
		moCoi: RONG,
		chuaTraLoi: { rows: canh.chua, total: canh.chua.length },
		baoSai: { rows: canh.bao, total: canh.bao.length },
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			sucKhoe: {
				queryKey: () => ["taiLieu.sucKhoe"],
				queryOptions: () => ({
					queryKey: ["taiLieu.sucKhoe"],
					queryFn: async () => {
						canh.goi += 1;
						if (canh.loi) throw new Error("mang");
						return duLieu();
					},
				}),
			},
			xuLyChuaTraLoi: {
				mutationOptions: (chon?: { onSuccess?: () => void }) => ({
					...chon,
					mutationFn: async (v: { hoiId: string }) => {
						canh.xuLyChua.push(v);
						canh.chua = canh.chua.filter((r) => r.hoiId !== v.hoiId);
						return { ok: true };
					},
				}),
			},
			xuLyBaoSai: {
				mutationOptions: (chon?: { onSuccess?: () => void }) => ({
					...chon,
					mutationFn: async (v: { id: string }) => {
						canh.xuLyBao.push(v);
						canh.bao = canh.bao.filter((r) => r.id !== v.id);
						return { ok: true };
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
	canh.chua = [...CHUA_GOC];
	canh.bao = [...BAO_GOC];
	canh.xuLyChua = [];
	canh.xuLyBao = [];
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
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
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

async function bam(b: Element | undefined | null): Promise<void> {
	if (!(b instanceof HTMLElement))
		throw new Error("tlk-man-suc-khoe: thieu nut");
	await act(async () => {
		b.click();
		await nhip();
	});
	await cho();
}

function khoi(goc: ParentNode, id: string): Element {
	const k = goc.querySelector(`[data-khoi-suc-khoe="${id}"]`);
	if (!k) throw new Error(`tlk-man-suc-khoe: thieu khoi ${id}`);
	return k;
}

function nutTrong(goc: ParentNode, chu: string): HTMLButtonElement | undefined {
	return [...goc.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
}

function dong(k: Element): Element[] {
	return [...k.querySelectorAll("[data-viec]")];
}

describe("tlk-man-suc-khoe", () => {
	test("tlk-man-suc-khoe: hai khoi moi dung ten va so dong, khong hien ten nguoi hoi", async () => {
		const goc = await mo();
		const chua = khoi(goc, "chua-tra-loi");
		const bao = khoi(goc, "bao-sai");
		expect(chua.textContent).toContain("Câu chưa trả lời được");
		expect(bao.textContent).toContain("Bị báo sai");
		expect(chua.querySelector("[data-so]")?.getAttribute("data-so")).toBe("2");
		expect(bao.querySelector("[data-so]")?.getAttribute("data-so")).toBe("2");
		expect(dong(chua)).toHaveLength(2);
		expect(dong(bao)).toHaveLength(2);
		expect(chua.textContent).toContain("Thử việc có hoa hồng không?");
		expect(
			chua.querySelector('a[href="/ws/tai-lieu/hoa-hong"]')?.textContent,
		).toBe("Quy định hoa hồng");
		expect(bao.textContent).toContain("Tầng 2 hưởng bao nhiêu?");
		expect(bao.textContent).toContain("Bảng mới là 1,5%.");
		expect(bao.textContent).toContain("phiên bản 3");
		expect(goc.querySelectorAll("[data-khoi-suc-khoe]")).toHaveLength(7);
	});

	test("tlk-man-suc-khoe: Da xu ly o cau chua tra loi goi dung hoiId va dong roi danh sach", async () => {
		const goc = await mo();
		const dau = dong(khoi(goc, "chua-tra-loi"))[0];
		await bam(dau ? nutTrong(dau, "Đã xử lý") : null);
		expect(canh.xuLyChua).toEqual([{ hoiId: "h1" }]);
		const conLai = dong(khoi(goc, "chua-tra-loi"));
		expect(conLai).toHaveLength(1);
		expect(conLai[0]?.textContent).toContain("Mẫu tạm ứng ở đâu?");
	});

	test("tlk-man-suc-khoe: Da xu ly o bao sai mo hop hai ket luan, chua chon thi khoa, chon sai roi gui", async () => {
		const goc = await mo();
		const dau = dong(khoi(goc, "bao-sai"))[0];
		await bam(dau ? nutTrong(dau, "Đã xử lý") : null);
		const hop = document.body.querySelector("[role=dialog]");
		expect(hop?.textContent).toContain("Trợ lý trả lời sai");
		expect(hop?.textContent).toContain("Trợ lý trả lời đúng theo trang");
		const gui = hop ? nutTrong(hop, "Đóng việc") : undefined;
		expect(gui?.disabled).toBe(true);
		expect(canh.xuLyBao).toEqual([]);
		const sai = [...(hop?.querySelectorAll("label") ?? [])].find(
			(l) => l.textContent?.trim() === "Trợ lý trả lời sai",
		);
		const o = sai?.getAttribute("for");
		await bam(o ? document.getElementById(o) : null);
		expect(gui?.disabled).toBe(false);
		await bam(gui);
		expect(canh.xuLyBao).toEqual([{ id: "b1", ketLuan: "SAI" }]);
		expect(document.body.querySelector("[role=dialog]")).toBeNull();
		expect(dong(khoi(goc, "bao-sai"))).toHaveLength(1);
	});

	test("tlk-man-suc-khoe: tai loi thi hien loi co Thu lai, khong hien danh sach rong", async () => {
		canh.loi = true;
		const goc = await mo();
		const chu = goc.textContent ?? "";
		if (
			chu.includes("Không có việc nào.") ||
			goc.querySelector("[data-khoi-suc-khoe]")
		) {
			throw new Error("tlk-man-suc-khoe: loi thanh rong");
		}
		expect(chu).toContain("Không tải được sức khoẻ kho.");
		const truoc = canh.goi;
		canh.loi = false;
		await bam(nutTrong(goc, "Thử lại"));
		expect(canh.goi).toBe(truoc + 1);
		expect(dong(khoi(goc, "chua-tra-loi"))).toHaveLength(2);
		expect(dong(khoi(goc, "bao-sai"))).toHaveLength(2);
	});
});
