import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json | undefined };

type DauVao = Json | undefined;

type Goi = { path: string; input: DauVao };
const traLoi = new Map<string, (input: DauVao) => Json | Promise<Json>>();
const daGoi: Goi[] = [];

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
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/deals",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("sonner", () => ({
	toast: { error: () => {}, success: () => {} },
}));

const { Timeline } = await import("@/components/crm/timeline/timeline");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { viecMessages } = await import("@/lib/messages/viec");
const { activityLabel } = await import("@/lib/activity-presentation");

const V = viecMessages("vi");
const TOI = {
	id: "u-toi",
	name: "Phạm Thu Hà",
	email: "ha@thu.test",
	image: null,
};
const BINH = {
	id: "u-b",
	name: "Lê Bình",
	email: "binh@thu.test",
	image: null,
};
const DONG_DAU = {
	id: "a1",
	type: "NOTE",
	subject: null,
	body: "Ghi chú đầu tiên",
	occurredAt: "2026-10-12T03:00:00.000Z",
	dueAt: null,
	completedAt: null,
	meta: null,
	createdAt: "2026-10-12T03:00:00.000Z",
	createdBy: { id: TOI.id, name: TOI.name, email: TOI.email, image: null },
	company: null,
	contact: null,
	deal: null,
	planId: null,
	emailThread: null,
	calendarEvent: null,
};
const VIEC_MO = {
	id: "v1",
	tieuDe: "Gửi bảng phí mới cho anh Tuấn",
	trangThai: "CHUA_LAM",
	hanNgay: "2026-10-12",
	quaHan: true,
	nguoiGiao: { ...TOI },
	nguoiThucHien: { ...BINH },
	banGhi: [{ loai: "deal", id: "d1", ten: "Thoả thuận An Phát" }],
};

let san: { o: HTMLElement; root: Root } | null = null;

function datMacDinh(khoi: Json) {
	traLoi.set("activities.timelineCounts", () => ({
		all: 1,
		notes: 1,
		upcoming: 0,
		done: 0,
		email: 0,
		meetings: 0,
	}));
	traLoi.set("activities.timeline", (vao) =>
		(vao as { filter?: string })?.filter === "upcoming"
			? { entries: [], nextCursor: null }
			: { entries: [DONG_DAU], nextCursor: null },
	);
	traLoi.set("viec.cuaBanGhi", () => khoi);
	traLoi.set("onboarding.nguoiNhanViec", () => [TOI, BINH]);
	traLoi.set("users.me", () => TOI);
}

async function mo(man: ReactElement) {
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
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
}

afterEach(async () => {
	if (san) {
		const { o, root } = san;
		await act(async () => root.unmount());
		o.remove();
	}
	san = null;
	traLoi.clear();
	daGoi.length = 0;
	document.body.innerHTML = "";
});

async function nhip() {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

async function cho(dk: () => boolean, moTa: string) {
	for (let i = 0; i < 200; i += 1) {
		if (dk()) return;
		await nhip();
	}
	throw new Error(`het gio cho ${moTa}`);
}

async function bam(el: Element | null) {
	if (!el) throw new Error("khong co phan tu de bam");
	await act(async () => {
		el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
		el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
		(el as HTMLElement).click();
	});
	await nhip();
}

async function go(el: HTMLInputElement, chu: string) {
	const datGiaTri = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		datGiaTri?.call(el, chu);
		el.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

const nutChu = (chu: string) =>
	[...document.querySelectorAll("button")].find(
		(b) => (b.textContent ?? "").trim() === chu,
	) ?? null;

async function moOSoanViec() {
	await cho(
		() => document.querySelector(`[aria-label="${V.oSoan.loai}"]`) !== null,
		"loai Viec",
	);
	await bam(document.querySelector(`[aria-label="${V.oSoan.loai}"]`));
	await cho(
		() => document.querySelector("[data-o-soan-viec] input") !== null,
		"o soan viec",
	);
}

describe("vc-o-soan-giao", () => {
	test("vc-o-soan-giao: loại «Việc» thay «Việc cần làm», mặc định «Tôi», giao gọi viec.create đúng mốc; khối Việc đứng trước dòng sự kiện", async () => {
		datMacDinh({ mo: [VIEC_MO], daXong: [], daHuy: [] });
		traLoi.set("viec.create", () => ({ id: "v-moi" }));
		await mo(<Timeline anchor={{ dealId: "d1" }} />);
		await cho(
			() => document.querySelector("[data-khoi-viec]") !== null,
			"khoi viec",
		);
		await cho(
			() => (document.body.textContent ?? "").includes("Ghi chú đầu tiên"),
			"dong su kien",
		);
		const tieuDeViec =
			[...document.querySelectorAll("[data-khoi-viec] *")].find(
				(e) => e.textContent === VIEC_MO.tieuDe,
			) ?? null;
		const dongSuKien = document.querySelector("[data-slot=timeline] > li");
		if (
			!tieuDeViec ||
			!dongSuKien ||
			!(
				tieuDeViec.compareDocumentPosition(dongSuKien) &
				Node.DOCUMENT_POSITION_FOLLOWING
			)
		) {
			throw new Error("vc: khoi viec khong dung dau the");
		}
		if (
			document.querySelector(
				`[aria-label="${activityLabel("TASK", "vi")}"]`,
			) !== null
		) {
			throw new Error("vc: o soan con viec can lam");
		}
		await moOSoanViec();
		const chonNguoi = document.querySelector(
			`[role="combobox"][aria-label="${V.oSoan.nguoiThucHien}"]`,
		);
		if ((chonNguoi?.textContent ?? "").trim() !== V.oSoan.toi)
			throw new Error("vc: mac dinh khong phai toi");
		const oTieuDe = document.querySelector<HTMLInputElement>(
			"[data-o-soan-viec] input",
		);
		if (!oTieuDe) throw new Error("vc: o soan goi sai khong co o tieu de");
		await go(oTieuDe, "Gọi lại anh Tuấn");
		await bam(chonNguoi);
		await cho(
			() =>
				[...document.querySelectorAll('[role="option"]')].some((o) =>
					o.textContent?.includes(BINH.name),
				),
			"lua chon Binh",
		);
		await bam(
			[...document.querySelectorAll('[role="option"]')].find((o) =>
				o.textContent?.includes(BINH.name),
			) ?? null,
		);
		await bam(nutChu(V.oSoan.chonHan));
		await cho(
			() =>
				document.querySelector("[data-day] button, button[data-day]") !== null,
			"lich",
		);
		await bam(document.querySelector("[data-day] button, button[data-day]"));
		await bam(nutChu(V.oSoan.giao));
		await cho(() => daGoi.some((g) => g.path === "viec.create"), "goi create");
		const goi = daGoi.filter((g) => g.path === "viec.create");
		const vao = goi[0]?.input as
			| { dealId?: string; tieuDe?: string; nguoiThucHienId?: string }
			| undefined;
		if (
			goi.length !== 1 ||
			vao?.dealId !== "d1" ||
			vao.tieuDe !== "Gọi lại anh Tuấn" ||
			vao.nguoiThucHienId !== BINH.id
		) {
			throw new Error(`vc: o soan goi sai ${JSON.stringify(goi)}`);
		}
	});

	test("vc-o-soan-giao: bam hai lan — bấm «Giao việc» hai lần liền chỉ gọi viec.create một lần", async () => {
		datMacDinh({ mo: [], daXong: [], daHuy: [] });
		let mo1: (v: Json) => void = () => {};
		traLoi.set(
			"viec.create",
			() =>
				new Promise<Json>((r) => {
					mo1 = r;
				}),
		);
		await mo(<Timeline anchor={{ dealId: "d1" }} />);
		await moOSoanViec();
		const oTieuDe = document.querySelector<HTMLInputElement>(
			"[data-o-soan-viec] input",
		);
		if (!oTieuDe) throw new Error("khong co o tieu de");
		await go(oTieuDe, "Một việc");
		const nut = nutChu(V.oSoan.giao);
		await act(async () => {
			nut?.click();
			nut?.click();
		});
		await nhip();
		expect(daGoi.filter((g) => g.path === "viec.create")).toHaveLength(1);
		mo1({ id: "v" });
	});

	test("vc-o-soan-giao: đối chứng — bản ghi không có việc nào (kể cả đã khép) thì không hiện khối", async () => {
		datMacDinh({ mo: [], daXong: [], daHuy: [] });
		await mo(<Timeline anchor={{ dealId: "d1" }} />);
		await cho(
			() => (document.body.textContent ?? "").includes("Ghi chú đầu tiên"),
			"dong su kien",
		);
		for (let i = 0; i < 5; i += 1) await nhip();
		if (document.querySelector("[data-khoi-viec]") !== null)
			throw new Error("vc: khoi rong van hien");
	});
});

describe("vc-o-soan-loi", () => {
	test("vc-o-soan-loi: tạo hỏng thì lời lỗi dưới nút, chữ đã gõ còn nguyên", async () => {
		datMacDinh({ mo: [], daXong: [], daHuy: [] });
		traLoi.set("viec.create", () => {
			throw new Error("Máy chủ từ chối việc này");
		});
		await mo(<Timeline anchor={{ dealId: "d1" }} />);
		await moOSoanViec();
		const oTieuDe = document.querySelector<HTMLInputElement>(
			"[data-o-soan-viec] input",
		);
		if (!oTieuDe) throw new Error("khong co o tieu de");
		await go(oTieuDe, "Việc sẽ hỏng");
		await bam(nutChu(V.oSoan.giao));
		await cho(
			() =>
				document.querySelector("[data-o-soan-viec] [data-slot=field-error]") !==
				null,
			"loi",
		);
		const loi =
			document.querySelector("[data-o-soan-viec] [data-slot=field-error]")
				?.textContent ?? "";
		const conChu = document.querySelector<HTMLInputElement>(
			"[data-o-soan-viec] input",
		)?.value;
		if (
			!loi.includes("Máy chủ từ chối việc này") ||
			conChu !== "Việc sẽ hỏng"
		) {
			throw new Error("vc: o soan mat chu khi loi");
		}
	});
});

const KHOA = {
	id: "u-k",
	name: "Đỗ Khoa",
	email: "khoa@thu.test",
	image: null,
};
const LAN = { id: "u-l", name: "Vũ Lan", email: "lan@thu.test", image: null };

const luaChon = (ten: string) =>
	[...document.querySelectorAll('[role="option"]')].find((o) =>
		o.textContent?.includes(ten),
	) ?? null;

describe("vc-o-soan-giao-nhieu-theo-doi", () => {
	test("vc-o-soan-giao-nhieu-theo-doi: chọn hai người theo dõi thì viec.create nhận đúng hai mã", async () => {
		datMacDinh({ mo: [], daXong: [], daHuy: [] });
		traLoi.set("onboarding.nguoiNhanViec", () => [TOI, BINH, KHOA, LAN]);
		traLoi.set("viec.create", () => ({ id: "v-moi" }));
		await mo(<Timeline anchor={{ dealId: "d1" }} />);
		await moOSoanViec();
		const oTieuDe = document.querySelector<HTMLInputElement>(
			"[data-o-soan-viec] input",
		);
		if (!oTieuDe) throw new Error("khong co o tieu de");
		await go(oTieuDe, "Việc có hai người theo dõi");
		await bam(
			document.querySelector(
				`[role="combobox"][aria-label="${V.oSoan.nguoiTheoDoi}"]`,
			),
		);
		await cho(
			() => luaChon(BINH.name) !== null && luaChon(KHOA.name) !== null,
			"lua chon nguoi theo doi",
		);
		await bam(luaChon(BINH.name));
		await bam(luaChon(KHOA.name));
		await bam(nutChu(V.oSoan.giao));
		await cho(() => daGoi.some((g) => g.path === "viec.create"), "goi create");
		const goi = daGoi.filter((g) => g.path === "viec.create");
		const ma = [
			...((goi[0]?.input as { nguoiTheoDoiIds?: string[] } | undefined)
				?.nguoiTheoDoiIds ?? []),
		].sort();
		if (
			goi.length !== 1 ||
			JSON.stringify(ma) !== JSON.stringify([BINH.id, KHOA.id].sort())
		) {
			throw new Error("vc: o soan mat nguoi theo doi");
		}
	});

	test("vc-o-soan-giao-nhieu-theo-doi: người thực hiện không nằm trong danh sách theo dõi, đổi người thực hiện thì bỏ họ khỏi người theo dõi đã chọn", async () => {
		datMacDinh({ mo: [], daXong: [], daHuy: [] });
		traLoi.set("onboarding.nguoiNhanViec", () => [TOI, BINH, KHOA, LAN]);
		traLoi.set("viec.create", () => ({ id: "v-moi" }));
		await mo(<Timeline anchor={{ dealId: "d1" }} />);
		await moOSoanViec();
		const oTieuDe = document.querySelector<HTMLInputElement>(
			"[data-o-soan-viec] input",
		);
		if (!oTieuDe) throw new Error("khong co o tieu de");
		await go(oTieuDe, "Việc đổi người");
		const chonTheoDoi = () =>
			document.querySelector(
				`[role="combobox"][aria-label="${V.oSoan.nguoiTheoDoi}"]`,
			);
		await bam(chonTheoDoi());
		await cho(() => luaChon(KHOA.name) !== null, "lua chon theo doi");
		await bam(luaChon(KHOA.name));
		await bam(luaChon(LAN.name));
		await bam(chonTheoDoi());
		await cho(() => luaChon(KHOA.name) === null, "dong danh sach theo doi");
		await bam(
			document.querySelector(
				`[role="combobox"][aria-label="${V.oSoan.nguoiThucHien}"]`,
			),
		);
		await cho(() => luaChon(KHOA.name) !== null, "lua chon nguoi thuc hien");
		await bam(luaChon(KHOA.name));
		await bam(chonTheoDoi());
		await cho(() => luaChon(LAN.name) !== null, "mo lai danh sach theo doi");
		if (luaChon(KHOA.name) !== null)
			throw new Error("vc: theo doi con nguoi thuc hien");
		await bam(chonTheoDoi());
		await bam(nutChu(V.oSoan.giao));
		await cho(() => daGoi.some((g) => g.path === "viec.create"), "goi create");
		const vao = daGoi.find((g) => g.path === "viec.create")?.input as
			| { nguoiThucHienId?: string; nguoiTheoDoiIds?: string[] }
			| undefined;
		if (
			vao?.nguoiThucHienId !== KHOA.id ||
			JSON.stringify(vao.nguoiTheoDoiIds) !== JSON.stringify([LAN.id])
		) {
			throw new Error(
				`vc: theo doi trung nguoi thuc hien ${JSON.stringify(vao)}`,
			);
		}
	});
});
