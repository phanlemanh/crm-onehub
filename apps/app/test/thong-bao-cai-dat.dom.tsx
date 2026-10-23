import { afterEach, describe, expect, mock, test } from "bun:test";
import { LOAI_THONG_BAO, MUC_THONG_BAO } from "@crm/validation/thong-bao";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

type Kenh = "zalo" | "slack" | null;
type DongRa = {
	loai: (typeof LOAI_THONG_BAO)[number];
	muc: "can-lam" | "de-biet";
	dayRa: boolean;
	macDinh: boolean;
};

let kenh: Kenh = "zalo";
let loiTai = false;
let loiLuu = false;
let choMai = false;
let daLuu: { loai: string; dayRa: boolean }[] = [];
let toastOk: string[] = [];
let toastLoi: string[] = [];

function macDinh(): DongRa[] {
	return LOAI_THONG_BAO.map((loai) => ({
		loai,
		muc: MUC_THONG_BAO[loai].muc,
		dayRa: MUC_THONG_BAO[loai].macDinhDayRa,
		macDinh: true,
	}));
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		thongBao: {
			caiDat: {
				queryKey: () => ["thongBao.caiDat"],
				queryOptions: () => ({
					queryKey: ["thongBao.caiDat"],
					queryFn: async () => {
						if (choMai) await new Promise(() => {});
						if (loiTai) throw new Error("hong");
						return {
							kenh,
							lyDo: kenh === null ? "chua-noi" : null,
							loai: macDinh(),
						};
					},
				}),
			},
			luuCaiDat: {
				mutationOptions: <T extends object>(o: T) => ({
					mutationKey: ["thongBao.luuCaiDat"],
					mutationFn: async (v: { loai: DongRa["loai"]; dayRa: boolean }) => {
						daLuu.push(v);
						if (loiLuu) throw new Error("hong");
						return {
							loai: v.loai,
							muc: MUC_THONG_BAO[v.loai].muc,
							dayRa: v.dayRa,
							macDinh: false,
						};
					},
					...o,
				}),
			},
		},
	}),
}));

mock.module("sonner", () => ({
	toast: Object.assign(() => {}, {
		error: (chu: string) => toastLoi.push(chu),
		success: (chu: string) => toastOk.push(chu),
	}),
	Toaster: () => null,
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { KhoiLoaiThongBao } = await import(
	"@/components/thong-bao/khoi-loai-thong-bao"
);
const { ChuongThongBaoKhung } = await import(
	"@/components/thong-bao/chuong-thong-bao"
);
const { thongBaoMessages } = await import("@/lib/messages/thong-bao");

const m = thongBaoMessages("vi");
let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	kenh = "zalo";
	loiTai = false;
	loiLuu = false;
	choMai = false;
	daLuu = [];
	toastOk = [];
	toastLoi = [];
});

async function cho(ms = 30) {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function ve(nut: ReactNode) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">{nut}</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	await cho();
}

const bang = () => document.querySelector("[data-bang-loai]")?.parentElement;
const congTacKenh = (loai: string) =>
	document.querySelector<HTMLButtonElement>(
		`[data-bang-loai] [data-cong-tac=kenh][data-loai=${loai}]`,
	);

async function bam(o: Element) {
	await act(async () => {
		o.dispatchEvent(
			new MouseEvent("click", { bubbles: true, cancelable: true }),
		);
	});
	await cho();
}

describe("tbk-man", () => {
	for (const k of ["zalo", "slack"] as const) {
		test(`tbk-man: a — ${k}: hai nhom, du dong, cot mang ten kenh, chuong khoa`, async () => {
			kenh = k;
			await ve(<KhoiLoaiThongBao />);
			for (const [muc, ten] of [
				["can-lam", m.caiDat.canLam],
				["de-biet", m.caiDat.deBiet],
			] as const) {
				const the = document.querySelector(`[data-muc=${muc}]`);
				expect(the?.textContent ?? "").toContain(ten);
				const soDong = the?.querySelectorAll(
					"[data-bang-loai] [data-dong-loai]",
				).length;
				expect(soDong).toBe(
					LOAI_THONG_BAO.filter((l) => MUC_THONG_BAO[l].muc === muc).length,
				);
				const tieuDe = [...(the?.querySelectorAll("th") ?? [])].map(
					(th) => th.textContent,
				);
				expect(tieuDe[2], "ten cot khong theo kenh").toBe(
					k === "zalo" ? "Zalo" : "Slack",
				);
			}
			const chuong = [
				...document.querySelectorAll<HTMLButtonElement>(
					"[data-bang-loai] [data-cong-tac=chuong]",
				),
			];
			expect(chuong.length).toBe(LOAI_THONG_BAO.length);
			for (const c of chuong) {
				expect(c.getAttribute("aria-checked"), "chuong tat duoc").toBe("true");
				expect(c.disabled, "chuong tat duoc").toBe(true);
			}
		});
	}

	test("tbk-man: b — bam cong tac kenh luu dung loai va bao da luu", async () => {
		await ve(<KhoiLoaiThongBao />);
		const nut = congTacKenh("okr-duoc-giao");
		if (!nut) throw new Error("khong thay cong tac okr-duoc-giao");
		await bam(nut);
		expect(daLuu).toEqual([{ loai: "okr-duoc-giao", dayRa: false }]);
		expect(toastOk).toEqual([m.caiDat.daLuu]);
		expect(congTacKenh("okr-duoc-giao")?.getAttribute("aria-checked")).toBe(
			"false",
		);
	});

	test("tbk-man: c — luu hong thi cong tac tro ve gia tri cu", async () => {
		loiLuu = true;
		await ve(<KhoiLoaiThongBao />);
		const nut = congTacKenh("okr-duoc-giao");
		if (!nut) throw new Error("khong thay cong tac okr-duoc-giao");
		await bam(nut);
		expect(
			congTacKenh("okr-duoc-giao")?.getAttribute("aria-checked"),
			"cong tac khong tro ve khi luu hong",
		).toBe("true");
		expect(toastLoi).toEqual([m.caiDat.luuLoi]);
	});

	test("tbk-man: d — khong kenh thi cot kenh khoa va co dong ly do", async () => {
		kenh = null;
		await ve(<KhoiLoaiThongBao />);
		const kenhNut = [
			...document.querySelectorAll<HTMLButtonElement>(
				"[data-bang-loai] [data-cong-tac=kenh]",
			),
		];
		expect(kenhNut.length).toBe(LOAI_THONG_BAO.length);
		for (const n of kenhNut) expect(n.disabled).toBe(true);
		expect(document.querySelector("[data-ly-do-khoa]")?.textContent).toBe(
			m.caiDat.lyDoChuaNoi,
		);
	});

	test("tbk-man: e — dang tai la khung xuong, tai hong la vung loi co thu lai", async () => {
		choMai = true;
		await ve(<KhoiLoaiThongBao />);
		expect(document.querySelector("[data-khung-xuong]")).not.toBeNull();
		act(() => root?.unmount());
		document.body.innerHTML = "";
		choMai = false;
		loiTai = true;
		await ve(<KhoiLoaiThongBao />);
		const loi = document.querySelector("[data-vung-tai-loi]");
		expect(loi?.textContent ?? "").toContain(m.caiDat.taiLoiTieuDe);
		expect(loi?.querySelector("button")).not.toBeNull();
	});

	test("tbk-man: f — o bat ra cua chuong co loi toi cai dat", async () => {
		await ve(
			<ChuongThongBaoKhung
				dangDocHet={false}
				homNay={[]}
				hrefCaiDat="/ws/reminders#loai-thong-bao"
				hrefTatCa="/ws/thong-bao"
				onDocHet={() => {}}
				onMo={() => {}}
				onOpenChange={() => {}}
				onThuLai={() => {}}
				open
				soChuaDoc={0}
				tranSo={99}
				trangThai="xong"
				truocDo={[]}
			/>,
		);
		const loi = document.querySelector<HTMLAnchorElement>(
			"[data-slot=cai-dat-thong-bao]",
		);
		expect(loi?.getAttribute("href")).toBe("/ws/reminders#loai-thong-bao");
		expect(loi?.getAttribute("aria-label")).toBe(m.caiDat.moChuong);
	});

	test("tbk-man: doi kenh thi ten cot doi, cong tac giu trang thai", async () => {
		await ve(<KhoiLoaiThongBao />);
		expect(bang()).toBeTruthy();
		act(() => root?.unmount());
		document.body.innerHTML = "";
		kenh = "slack";
		await ve(<KhoiLoaiThongBao />);
		const th = [...document.querySelectorAll("[data-muc=can-lam] th")].map(
			(x) => x.textContent,
		);
		expect(th[2]).toBe("Slack");
		expect(congTacKenh("okr-cap-nhat")?.getAttribute("aria-checked")).toBe(
			"true",
		);
	});
});
