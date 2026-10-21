import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type HoiYDu = NonNullable<RouterOutputs["okr"]["hoiY"]>;
type VaoGop = {
	hoiYId: string;
	noiDung: string;
	viSao: string;
	doBangGi: string;
};
type TuyChonGop = {
	onSuccess?: (kq: { id: string }, vao: VaoGop) => void;
	onError?: (e: Error) => void;
};

const GIO = 3_600_000;
const BAY_GIO = Date.now();
const goi: VaoGop[] = [];

mock.module("sonner", () => ({
	toast: Object.assign(() => {}, {
		success: () => {},
		error: () => {},
		warning: () => {},
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ hoiY: async () => {} }),
}));
mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			gopY: {
				mutationOptions: (chon?: TuyChonGop) => ({
					...chon,
					mutationKey: ["gopY"],
					mutationFn: async (vao: VaoGop) => {
						goi.push(vao);
						return { id: "moi" };
					},
				}),
			},
		},
	}),
}));

const { OSoanY } = await import("@/app/(app)/[slug]/okr/hoi-y/khoi-gop");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

function hoiY(): HoiYDu {
	return {
		hoiY: {
			id: "h1",
			cauHoi: "Nếu là CEO, mục tiêu nào quan trọng cho năm 2027?",
			loiMo: "Năm nay giữ được khách cũ nhưng khách mới về chậm.",
			soLieu: [],
			hanLuc: new Date(BAY_GIO + 30 * GIO).toISOString(),
			createdAt: new Date(BAY_GIO - 18 * GIO).toISOString(),
			congBoLuc: null,
		},
		trangThai: "dang-mo",
		nguoiChon: { id: "dang", name: "Lê Hải Đăng" },
		cuaToi: { y: [], daHieu: false },
		y: { khoa: false, lyDoKhoa: null, ds: [] },
		chuDe: null,
		banTruoc: null,
		ketQua: null,
		quyen: {
			moDuoc: false,
			gopDuoc: true,
			gomDuoc: false,
			chonDuoc: false,
			congBoDuoc: false,
			niemPhongDuoc: false,
			dongYDuoc: true,
			cauHoiKhoa: false,
			nguoiChonKhoa: false,
			lyDoChuaCongBo: [],
		},
	};
}

let san: { o: HTMLElement; root: Root } | null = null;

afterEach(() => {
	act(() => san?.root.unmount());
	san?.o.remove();
	san = null;
	goi.length = 0;
	document.body.innerHTML = "";
});

async function mo(): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { mutations: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">
					<OSoanY h={hoiY()} />
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	san = { o, root };
	return o;
}

function oY(o: HTMLElement): HTMLTextAreaElement {
	const label = [...o.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === "Ý của bạn",
	);
	const el = document.getElementById(label?.getAttribute("for") ?? "");
	if (!(el instanceof HTMLTextAreaElement)) throw new Error("không thấy ô Ý");
	return el;
}

async function go(o: HTMLTextAreaElement, chu: string) {
	const dat = Object.getOwnPropertyDescriptor(
		HTMLTextAreaElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function guiBang(o: HTMLElement) {
	const nut = [...o.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === "Gửi",
	);
	if (!nut) throw new Error("không thấy nút Gửi");
	await act(async () => nut.click());
}

describe("gdl-gui-sai", () => {
	test("gdl-gui-sai: ý 5 ký tự — câu lỗi ghim, tiêu điểm về ô Ý, không gọi gopY", async () => {
		const o = await mo();
		const y = oY(o);
		await go(y, "ngắn!");
		(document.activeElement as HTMLElement | null)?.blur();
		await guiBang(o);
		const loi = o.querySelector(
			'[data-khoi="o-soan"] [data-slot="field-error"]',
		);
		expect(loi?.textContent).toBe("Ý cần ít nhất 10 ký tự — hiện có 5.");
		expect(
			document.activeElement === y,
			"gdl-gui-sai: tieu diem khong ve o Y",
		).toBe(true);
		expect(goi.length).toBe(0);
	});

	test("gdl-gui-sai: đối chứng dương — ý 12 ký tự gửi đúng một lần, không câu lỗi", async () => {
		const o = await mo();
		await go(oY(o), "Bán gói lạnh");
		await guiBang(o);
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
		expect(goi.length).toBe(1);
		expect(goi[0]?.noiDung).toBe("Bán gói lạnh");
		expect(o.querySelector('[data-slot="field-error"]')).toBeNull();
	});

	test("gdl-gui-sai: hàng Gửi là hàng bám đáy dùng chung", async () => {
		const o = await mo();
		const hang = o.querySelector('[data-slot="hang-hanh-dong-bam-day"]');
		expect(hang?.querySelector('button[type="submit"]')?.textContent).toBe(
			"Gửi",
		);
	});
});
