import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { ViecCuaToiOutput } from "../../api/src/okr/okr.contracts";

const DU: ViecCuaToiOutput = {
	lienQuanOkr: true,
	viec: [
		{
			loai: "okr-cap-nhat",
			krIds: ["kr-1", "kr-2"],
			nhan: "Doanh thu gia hạn, Tỉ lệ hài lòng",
			soKr: 2,
		},
		{
			loai: "okr-kr-im",
			keyResultId: "kr-3",
			objectiveId: "mt-1",
			nhan: "Bộ câu hỏi thường gặp",
			soNgay: 15,
			chuTen: null,
		},
		{
			loai: "okr-duoc-giao",
			objectiveId: "mt-2",
			keyResultId: "kr-4",
			nhan: "Mười đối tác mới",
		},
		{
			loai: "okr-nhac-ten",
			commentId: "bl-1",
			objectiveId: "mt-3",
			nhan: "Giữ khách quay lại",
			nguoiTen: "Võ Phương Thảo",
		},
		{
			loai: "okr-ghi-nhan",
			ghiNhanId: "gn-1",
			objectiveId: "mt-5",
			nhan: "Chốt kho mới",
			nguoiGui: "Đặng Minh Khoa",
		},
		{
			loai: "okr-theo-doi",
			objectiveId: "mt-4",
			nhan: "Mở rộng miền Trung",
			capNhat: 0,
			binhLuan: 2,
		},
	],
};

const RONG_LIEN_QUAN: ViecCuaToiOutput = { viec: [], lienQuanOkr: true };
const RONG_NGOAI: ViecCuaToiOutput = { viec: [], lienQuanOkr: false };

let traVe: () => ViecCuaToiOutput = () => DU;
let soLanGoi = 0;

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			viecCuaToi: {
				queryKey: () => ["okr.viecCuaToi"],
				queryOptions: () => ({
					queryKey: ["okr.viecCuaToi"],
					queryFn: async () => {
						soLanGoi += 1;
						return traVe();
					},
				}),
			},
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws",
}));

const { ViecOkrCuaToi } = await import("@/app/(app)/[slug]/okr/viec-cua-toi");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { okrMessages } = await import("@/lib/messages/okr");

const m = okrMessages("vi").viecCuaToi;

type KhiHien = "luon" | "khi-lien-quan" | "khi-co-viec";

let dangMo: Root[] = [];
let url = "";

async function mo(khiHien: KhiHien, anKhiLoi: boolean): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					url = e.queryString;
				}}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<ViecOkrCuaToi
							noi="tong-quan"
							khiHien={khiHien}
							anKhiLoi={anKhiLoi}
						/>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 40; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(`khong toi: ${moTa} — ${document.body.textContent}`);
}

async function choTraLoi(): Promise<void> {
	await cho(() => soLanGoi > 0, "goi okr.viecCuaToi");
	for (let vong = 0; vong < 5; vong += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

const the = () => document.body.querySelector("[data-the-viec-okr]");
const dong = () => [
	...document.body.querySelectorAll<HTMLElement>("[data-viec-okr]"),
];

afterEach(() => {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
	url = "";
	soLanGoi = 0;
	traVe = () => DU;
});

describe("the viec OKR", () => {
	test("moi loai mot dong, dong cap nhat dan toi man cap nhat voi loi vao viec-cua-toi", async () => {
		await mo("khi-lien-quan", true);
		await cho(() => dong().length === 6, "sau dong");
		expect(dong().map((d) => d.dataset.viecOkr)).toEqual([
			"okr-cap-nhat",
			"okr-kr-im",
			"okr-duoc-giao",
			"okr-nhac-ten",
			"okr-ghi-nhan",
			"okr-theo-doi",
		]);
		const [capNhat, im, giao, nhac, ghiNhan, theo] = dong();
		expect(capNhat?.textContent).toContain("2 KR chờ cập nhật tuần này");
		expect(capNhat?.querySelector("a")?.getAttribute("href")).toBe(
			"/ws/okr?tu=viec-cua-toi",
		);
		expect(im?.textContent).toContain("KR im 15 ngày");
		expect(giao?.textContent).toContain(m.cau.giaoKr);
		expect(nhac?.textContent).toContain("Võ Phương Thảo nhắc tên bạn");
		expect(ghiNhan?.textContent).toContain("Đặng Minh Khoa ghi nhận bạn");
		expect(ghiNhan?.querySelector("[translate=no]")?.textContent).toBe(
			"Đặng Minh Khoa",
		);
		expect(theo?.textContent).toContain("2 bình luận mới");
		expect(theo?.textContent).not.toContain("0 cập nhật");
		expect(nhac?.querySelector("[translate=no]")?.textContent).toBe(
			"Võ Phương Thảo",
		);
		expect(
			nhac
				?.querySelector("[data-slot=item-description]")
				?.getAttribute("translate"),
		).toBe("no");
	});

	test("hai loai hoi y: moi loai mot dong co bieu tuong, cau rieng, ten chu ky khong dich va lien ket toi tab Hoi y", async () => {
		traVe = () => ({
			lienQuanOkr: false,
			viec: [
				{
					loai: "okr-hoi-y-gop",
					hoiYId: "hy-1",
					cycleId: "n27",
					nhan: "Năm 2027",
					hanLuc: "2026-10-14T10:00:00.000Z",
				},
				{
					loai: "okr-hoi-y-cong-bo",
					hoiYId: "hy-2",
					cycleId: "n26",
					nhan: "Năm 2026",
				},
			],
		});
		await mo("khi-co-viec", false);
		await cho(() => dong().length === 2, "hai dong hoi y");
		const [gop, congBo] = dong();
		expect(dong().map((d) => d.dataset.viecOkr)).toEqual([
			"okr-hoi-y-gop",
			"okr-hoi-y-cong-bo",
		]);
		expect(gop?.textContent).toContain(m.cau.hoiYGop);
		expect(congBo?.textContent).toContain(m.cau.hoiYCongBo);
		expect(gop?.querySelector("[translate=no]")?.textContent).toBe("Năm 2027");
		expect(congBo?.querySelector("[translate=no]")?.textContent).toBe(
			"Năm 2026",
		);
		expect(
			dong().map((d) => d.querySelector("a")?.getAttribute("href")),
		).toEqual(["/ws/okr/hoi-y?kyOkr=n27", "/ws/okr/hoi-y?kyOkr=n26"]);
		expect(dong().map((d) => d.querySelector("svg") !== null)).toEqual([
			true,
			true,
		]);
	});

	test("bam dong khac mo sheet muc tieu dung ma", async () => {
		await mo("khi-lien-quan", true);
		await cho(() => dong().length === 6, "sau dong");
		const nut = dong()[3]?.querySelector("button");
		await act(async () => nut?.click());
		await cho(() => url !== "", "doi url");
		expect(decodeURIComponent(url)).toContain("record=objective:mt-3");
	});

	test("vai chi OKR: rong van hien the voi cau rong", async () => {
		traVe = () => RONG_NGOAI;
		await mo("luon", false);
		await cho(() => the() !== null, "the");
		expect(the()?.textContent).toContain(m.rong);
		expect(dong()).toHaveLength(0);
	});

	test("vai day du: khong dinh OKR thi khong co the", async () => {
		traVe = () => RONG_NGOAI;
		await mo("khi-lien-quan", true);
		await choTraLoi();
		expect(the()).toBeNull();
	});

	test("vai day du: dinh OKR ma rong thi hien cau rong", async () => {
		traVe = () => RONG_LIEN_QUAN;
		await mo("khi-lien-quan", true);
		await cho(() => the() !== null, "the");
		expect(the()?.textContent).toContain(m.rong);
	});

	test("vai day du: co dong ma co lien quan sai thi khong co the", async () => {
		traVe = () => ({ ...DU, lienQuanOkr: false });
		await mo("khi-lien-quan", true);
		await choTraLoi();
		expect(the()).toBeNull();
	});

	test("tab Cua toi: co dong thi hien khoi du co lien quan sai", async () => {
		traVe = () => ({ ...DU, lienQuanOkr: false });
		await mo("khi-co-viec", false);
		await cho(() => dong().length === 6, "sau dong");
	});

	test("tab Cua toi: rong thi khong co khoi", async () => {
		traVe = () => RONG_LIEN_QUAN;
		await mo("khi-co-viec", false);
		await choTraLoi();
		expect(the()).toBeNull();
	});

	test("loi tai: an o vai day du, cau loi va Thu lai o cho khac", async () => {
		traVe = () => {
			throw new Error("hong");
		};
		await mo("khi-lien-quan", true);
		await choTraLoi();
		expect(the()).toBeNull();
		for (const root of dangMo) act(() => root.unmount());
		dangMo = [];
		document.body.innerHTML = "";

		await mo("luon", false);
		await cho(() => the() !== null, "the loi");
		expect(the()?.textContent).toContain(m.loi.title);
		traVe = () => DU;
		const thuLai = [...document.body.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === m.loi.action,
		);
		await act(async () => thuLai?.click());
		await cho(() => dong().length === 6, "tai lai xong");
	});
});
