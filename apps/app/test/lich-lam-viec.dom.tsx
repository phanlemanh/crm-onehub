import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { z } from "zod";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json | undefined };
type DauVao = Json | undefined;

const traLoi = new Map<string, (input: DauVao) => Json | Promise<Json>>();
const daGoi: { path: string; input: DauVao }[] = [];

const linkGia: TRPCLink<AppRouter> =
	() =>
	({ op }) =>
		observable((nguoiXem) => {
			const vao: DauVao = JSON.parse(JSON.stringify(op.input ?? null));
			daGoi.push({ path: op.path, input: vao });
			const lay = traLoi.get(op.path);
			Promise.resolve()
				.then(() => (lay ? lay(vao) : null))
				.then(
					(data) => {
						nguoiXem.next({ result: { type: "data", data } });
						nguoiXem.complete();
					},
					(loi: Error) => nguoiXem.error(loi as never),
				);
			return () => {};
		});

const trpcClient = createTRPCClient<AppRouter>({ links: [linkGia] });
let queryClient = new QueryClient();
mock.module("@/lib/trpc/client", () => ({
	useTRPC: () =>
		createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient }),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () =>
		new Proxy({}, { get: () => async () => queryClient.invalidateQueries() }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/viec",
	useSearchParams: () => new URLSearchParams(),
}));
type Toast = {
	loai: string;
	msg: string;
	action?: { label: string; onClick: () => void };
};
const toast: Toast[] = [];
mock.module("sonner", () => ({
	toast: {
		error: (msg: string) => toast.push({ loai: "loi", msg }),
		success: (
			msg: string,
			o?: { action?: { label: string; onClick: () => void } },
		) => toast.push({ loai: "xong", msg, action: o?.action }),
	},
}));

const { LichLamViec } = await import(
	"@/app/(app)/[slug]/settings/lich-lam-viec/lich-lam-viec"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { settingsMessages } = await import("@/lib/messages/settings");
const { NHOM_CAI_DAT } = await import("@/lib/cai-dat-dieu-huong");

const T = settingsMessages("vi");
const L = T.lichLamViec;
let san: { o: HTMLElement; root: Root } | null = null;

afterEach(async () => {
	if (san) {
		const { o, root } = san;
		await act(async () => root.unmount());
		o.remove();
	}
	san = null;
	traLoi.clear();
	daGoi.length = 0;
	toast.length = 0;
	document.body.innerHTML = "";
});

async function nhip(ms = 0) {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function cho(dk: () => boolean, moTa: string) {
	for (let i = 0; i < 200; i += 1) {
		if (dk()) return;
		await nhip();
	}
	throw new Error(`het gio cho ${moTa}`);
}

async function bam(el: Element | null | undefined) {
	if (!el) throw new Error("khong co phan tu de bam");
	await act(async () => {
		el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
		el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
		(el as HTMLElement).click();
	});
	await nhip();
}

const chuCua = (el: Element | null | undefined) =>
	(el?.textContent ?? "").trim();

const LE = { id: "le-1", ngay: "2026-10-26", ten: "Nghỉ bù" };

async function moTrang(sua: boolean) {
	let tuan = [6, 7];
	let le = [LE];
	traLoi.set("lichLamViec.get", () => ({
		ngayNghiTuan: tuan,
		ngayLe: le,
		sua,
	}));
	traLoi.set("lichLamViec.datNgayNghiTuan", (vao) => {
		const kq = z.object({ ngayNghiTuan: z.array(z.number()) }).safeParse(vao);
		if (kq.success) tuan = kq.data.ngayNghiTuan;
		return { ok: true };
	});
	traLoi.set("lichLamViec.xoaNgayLe", () => {
		le = [];
		return { ok: true };
	});
	traLoi.set("lichLamViec.themNgayLe", () => {
		le = [LE];
		return { ok: true };
	});
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	san = { o, root };
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory>
				<QueryClientProvider client={queryClient}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							<LichLamViec />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await cho(
		() => document.querySelector("[data-the-nghi-tuan]") !== null,
		"trang",
	);
}

const nutThu = (thu: number) =>
	document.querySelector<HTMLButtonElement>(`[data-thu="${thu}"]`);

const goiTuan = () =>
	daGoi
		.filter((g) => g.path === "lichLamViec.datNgayNghiTuan")
		.map((g) => JSON.stringify(g.input));

describe("dg-man-lich", () => {
	test("dg-man-lich: quản trị bật tắt có Hoàn tác, xoá ngày lễ có Hoàn tác, nút xoá có nhãn", async () => {
		await moTrang(true);
		const tuan = chuCua(document.querySelector("[data-the-nghi-tuan]"));
		const ngayLe = chuCua(document.querySelector("[data-the-ngay-le]"));
		if (
			!tuan.includes(L.nghiTuan) ||
			nutThu(6)?.getAttribute("data-state") !== "on" ||
			nutThu(7)?.getAttribute("data-state") !== "on" ||
			!ngayLe.includes(L.ngayLe)
		) {
			throw new Error("llv: khung trang sai");
		}
		if (document.querySelector("[data-khong-du-quyen]") !== null) {
			throw new Error("llv: doi chung admin hong");
		}

		await bam(nutThu(3));
		await cho(() => goiTuan().length > 0 && toast.length > 0, "bat thu tu");
		const hoanTac = toast.find((x) => x.action?.label === L.hoanTac);
		if (
			goiTuan()[0] !== JSON.stringify({ ngayNghiTuan: [3, 6, 7] }) ||
			!hoanTac
		) {
			throw new Error("llv: bat tat sai");
		}
		await act(async () => hoanTac.action?.onClick());
		await cho(() => goiTuan().length > 1, "hoan tac");
		if (goiTuan()[1] !== JSON.stringify({ ngayNghiTuan: [6, 7] })) {
			throw new Error("llv: hoan tac khong goi");
		}

		const nutXoa = document.querySelector('[data-ngay-le="2026-10-26"] button');
		if (!nutXoa?.getAttribute("aria-label"))
			throw new Error("llv: nut xoa khong nhan");
		toast.length = 0;
		await bam(nutXoa);
		await cho(
			() => daGoi.some((g) => g.path === "lichLamViec.xoaNgayLe"),
			"xoa le",
		);
		await cho(() => toast.length > 0, "toast xoa");
		if (!toast.some((x) => x.action?.label === L.hoanTac)) {
			throw new Error("llv: xoa le khong hoan tac");
		}
		expect(goiTuan().length).toBe(2);
	});

	test("dg-man-lich: thành viên thấy mọi điều khiển khoá và dòng Không đủ quyền", async () => {
		await moTrang(false);
		const dong = chuCua(document.querySelector("[data-khong-du-quyen]"));
		const nut = [
			...document.querySelectorAll<HTMLButtonElement>(
				"[data-the-nghi-tuan] button, [data-the-ngay-le] button",
			),
		];
		if (
			!dong.includes("Không đủ quyền") ||
			nut.length === 0 ||
			nut.some((b) => !b.disabled)
		) {
			throw new Error("llv: member khong khoa");
		}
	});

	test("dg-man-lich: mục Lịch làm việc nằm trong nhóm Không gian làm việc", () => {
		const nhom = NHOM_CAI_DAT.find((n) => n.khoa === "khongGian");
		if (!nhom?.muc.some((m) => m.khoa === "lichLamViec")) {
			throw new Error("llv: thieu muc dieu huong");
		}
	});
});
