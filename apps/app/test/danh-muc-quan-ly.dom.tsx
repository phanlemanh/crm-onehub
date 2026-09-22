import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	createElement as h,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	DanhMucCachChia,
	DanhMucInput,
} from "@/app/(app)/[slug]/onboarding/onboarding-search-params";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import {
	bangCotInput,
	planListInput,
} from "../../api/src/onboarding/onboarding.contracts";
import { ONBOARDING } from "../../api/src/onboarding/onboarding-config";
import {
	bangCotTuHang,
	dungHang,
	type HangDanhMuc,
	hangCuaBangCot,
	type KeHoachTho,
	manDanhMucTuHang,
} from "../../api/src/onboarding/onboarding-danh-muc";

const SLUG = "ws";
const BO_PHAN = [
	{ id: "bp-a", name: "Kinh doanh", position: 0, archivedAt: null },
	{ id: "bp-b", name: "Dao tao", position: 1, archivedAt: null },
];
const NGUOI = [{ id: "u-1", name: "Lan" }];

let tap: HangDanhMuc[] = [];
let daDieuHuong: string[] = [];
let duongHienTai = new URLSearchParams();
let dauVaoCuoi: DanhMucInput | null = null;

function keHoach(i: number, buoc: string): KeHoachTho {
	return {
		id: `kh-${String(i).padStart(3, "0")}`,
		companyId: `ct-${i}`,
		company: { name: `Doi tac ${i}` },
		startedAt: new Date("2026-09-01T00:00:00.000Z"),
		targetDays: 30,
		ownerId: "u-1",
		closedAt: null,
		steps: [
			{
				completedAt: null,
				label: buoc,
				position: 0,
				updatedAt: new Date("2026-09-10T00:00:00.000Z"),
				assigneeId: null,
				assignee: null,
				department: { id: "bp-a", name: "Kinh doanh", position: 0 },
			},
		],
	};
}

function gieo(soKeHoach: number): void {
	const bayGio = new Date("2026-09-21T00:00:00.000Z");
	tap = Array.from({ length: soKeHoach }, (_, i) =>
		dungHang(keHoach(i, "Ky hop dong"), bayGio),
	);
}

function thuTuc<TVao, TRa>(ten: string, chay: (dauVao: TVao) => TRa) {
	return {
		queryKey: (dauVao: TVao) => [ten, dauVao],
		queryOptions: (dauVao: TVao) => ({
			queryKey: [ten, dauVao],
			queryFn: async () => chay(dauVao),
		}),
	};
}

function khongGoi(ten: string) {
	return {
		mutationOptions: () => ({
			mutationFn: async () => {
				throw new Error(`${ten} khong duoc goi trong tep nay`);
			},
		}),
	};
}

function manDanhMuc(dauVao: DanhMucInput) {
	dauVaoCuoi = dauVao;
	return manDanhMucTuHang(tap, planListInput.parse(dauVao), 1);
}

function bangCot(dauVao: DanhMucInput & { cachChia: DanhMucCachChia }) {
	const input = bangCotInput.parse(dauVao);
	return bangCotTuHang(hangCuaBangCot(tap, input), input, []);
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		onboarding: {
			manDanhMuc: thuTuc("manDanhMuc", manDanhMuc),
			bangCot: thuTuc("bangCot", bangCot),
			listDepartments: thuTuc("listDepartments", () => BO_PHAN),
			listTemplates: thuTuc("listTemplates", () => []),
			createFromTemplate: khongGoi("createFromTemplate"),
		},
		users: {
			list: thuTuc("users.list", () => NGUOI),
			me: thuTuc("users.me", () => NGUOI[0]),
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: (duong: string) => daDieuHuong.push(duong),
		replace: () => {},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: SLUG }),
	useSearchParams: () => duongHienTai,
	usePathname: () => `/${SLUG}/onboarding`,
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) =>
		h(
			"a",
			{
				...rest,
				href,
				onClick: (e: ReactMouseEvent) => {
					e.preventDefault();
					daDieuHuong.push(href);
				},
			},
			children,
		),
}));

const { DanhMucTable } = await import(
	"@/app/(app)/[slug]/onboarding/danh-muc-table"
);
const { Board } = await import("@crm/ui/components/board");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { messages } = await import("@crm/ui/lib/messages");
const { onboardingMessages } = await import("@/lib/messages/onboarding");

const m = onboardingMessages("vi");
const mUi = messages("vi");

type San = { o: HTMLElement; root: Root; duongDan: () => URLSearchParams };

async function dungMan(duong: string): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	let hienTai = new URLSearchParams(duong);
	duongHienTai = hienTai;
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				searchParams={duong}
				hasMemory
				onUrlUpdate={(e) => {
					hienTai = new URLSearchParams(e.searchParams);
					duongHienTai = hienTai;
				}}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							<DanhMucTable />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await cho(o, () => !o.textContent?.includes(m.loading));
	return { o, root, duongDan: () => hienTai };
}

async function cho(o: HTMLElement, xong: () => boolean): Promise<void> {
	for (let vong = 0; vong < 50; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`man khong toi trang thai mong doi — noi dung: ${o.textContent}`,
	);
}

function nut(goc: ParentNode, chu: string): HTMLElement {
	const tim = [...goc.querySelectorAll<HTMLElement>("button")].find((b) =>
		b.textContent?.trim().startsWith(chu),
	);
	if (!tim) {
		throw new Error(
			`khong thay nut "${chu}" — cac nut: ${[...goc.querySelectorAll("button")].map((b) => b.textContent?.trim()).join(" | ")}`,
		);
	}
	return tim;
}

async function bam(o: HTMLElement): Promise<void> {
	await act(async () => {
		o.dispatchEvent(
			new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
		);
		o.dispatchEvent(
			new MouseEvent("click", { bubbles: true, cancelable: true }),
		);
	});
}

function dangBat(o: HTMLElement): boolean {
	return (
		o.getAttribute("aria-pressed") === "true" ||
		o.getAttribute("data-state") === "on" ||
		o.getAttribute("aria-checked") === "true"
	);
}

function thanhLocCon(o: HTMLElement): boolean {
	return (
		o.querySelector(`input[placeholder="${m.search}"]`) !== null &&
		o.textContent?.includes(mUi.table.filters) === true
	);
}

let dangMo: San[] = [];

async function mo(duong: string): Promise<San> {
	const san = await dungMan(duong);
	dangMo.push(san);
	return san;
}

beforeEach(() => {
	daDieuHuong = [];
	dauVaoCuoi = null;
	gieo(2);
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
});

describe("khong-khop", () => {
	for (const cachXem of ["bang", "bang-cot"] as const) {
		test(`khong-khop: dang ${cachXem} giu thanh loc, hien khong khop va Bo loc`, async () => {
			const san = await mo(`boPhan=bp-b&cachXem=${cachXem}`);
			await cho(
				san.o,
				() => san.o.textContent?.includes(m.noMatch.title) === true,
			);

			expect(thanhLocCon(san.o)).toBe(true);
			expect(san.o.textContent).toContain(m.noMatch.title);
			expect(san.o.textContent).not.toContain(m.empty.noTemplate.title);
			expect(san.o.textContent).not.toContain(m.empty.noPlan.title);
			expect(san.o.querySelectorAll("[data-board-column]")).toHaveLength(0);

			await bam(nut(san.o, m.noMatch.action));
			await cho(san.o, () => !san.o.textContent?.includes(m.noMatch.title));

			const duong = san.duongDan();
			expect(duong.getAll("boPhan")).toEqual([]);
			expect(duong.get("q")).toBeNull();
			expect(duong.get("cachXem") ?? "bang").toBe(cachXem);

			await cho(san.o, () =>
				cachXem === "bang"
					? tap.every(
							(hang) => san.o.textContent?.includes(hang.companyName) === true,
						)
					: san.o.querySelectorAll("[data-board-card]").length === tap.length,
			);
		});
	}
});

describe("duong-dan", () => {
	const DAT = {
		q: "Doi tac",
		trangThai: "da-dong",
		boPhan: "bp-a",
		sort: "imNgay",
		dir: "desc",
		page: "2",
	};

	test("duong-dan: moi lua chon nam trong duong dan va doc lai nguyen ven", async () => {
		const dau = await mo(new URLSearchParams(DAT).toString());
		await bam(nut(dau.o, m.view["bang-cot"]));
		await cho(
			dau.o,
			() => dau.o.querySelector(`[aria-label="${m.chia.label}"]`) !== null,
		);
		await bam(nut(dau.o, m.chia["bo-phan"]));
		await cho(dau.o, () => dau.duongDan().get("cachChia") === "bo-phan");

		const duong = dau.duongDan();
		const mongDoi = {
			...DAT,
			cachXem: "bang-cot",
			cachChia: "bo-phan",
		};
		for (const [ten, giaTri] of Object.entries(mongDoi)) {
			expect(`${ten}=${duong.getAll(ten).join(",")}`).toBe(`${ten}=${giaTri}`);
		}

		const lai = await mo(duong.toString());
		const o = lai.o;
		expect(
			o.querySelector<HTMLInputElement>(`input[placeholder="${m.search}"]`)
				?.value,
		).toBe(DAT.q);
		expect(dangBat(nut(o, m.facets.closed))).toBe(true);
		expect(dangBat(nut(o, m.chia["bo-phan"]))).toBe(true);
		expect(dangBat(nut(o, m.view["bang-cot"]))).toBe(true);
		expect(nut(o, mUi.table.filters).textContent).toContain("(1)");
		expect(dauVaoCuoi).toMatchObject({
			q: DAT.q,
			status: "da-dong",
			boPhan: ["bp-a"],
			sort: "imNgay",
			dir: "desc",
			page: 2,
		});
	});

	test("duong-dan: duong dan trong la bang, khong loc", async () => {
		const san = await mo("");
		expect(dangBat(nut(san.o, m.view.bang))).toBe(true);
		expect(dangBat(nut(san.o, m.facets.running))).toBe(true);
		expect(san.o.querySelectorAll("[data-board-column]")).toHaveLength(0);
		expect(nut(san.o, mUi.table.filters).textContent).not.toContain("(");
		expect(dauVaoCuoi).toMatchObject({
			q: "",
			status: "dang-chay",
			boPhan: [],
			nguoiCam: [],
			page: 1,
		});
	});
});

describe("the-chi-de-xem", () => {
	test("the-chi-de-xem: khong co duong keo, the la lien ket, Enter mo ho so", async () => {
		const san = await mo("cachXem=bang-cot");
		await cho(
			san.o,
			() => san.o.querySelectorAll("[data-board-card]").length > 0,
		);

		const keo = san.o.querySelectorAll(
			'[draggable="true"], [aria-roledescription], [data-dnd-kit], [role="button"][aria-describedby]',
		);
		expect(
			`thuoc tinh keo: ${[...keo].map((e) => e.outerHTML.slice(0, 80)).join(" | ")}`,
		).toBe("thuoc tinh keo: ");

		const the = [
			...san.o.querySelectorAll<HTMLAnchorElement>("[data-board-card]"),
		];
		expect(the).toHaveLength(tap.length);
		for (const a of the) {
			expect(a.tagName).toBe("A");
			const href = a.getAttribute("href") ?? "";
			expect(href.startsWith("?")).toBe(true);
			expect(new URLSearchParams(href).get(SEARCH_PARAM.record.stack)).toBe(
				`plan:${a.getAttribute("data-board-card")}`,
			);
		}
		expect(the.map((a) => a.getAttribute("data-board-card")).sort()).toEqual(
			tap.map((hang) => hang.id).sort(),
		);

		const dau = the[0];
		if (!dau) throw new Error("khong co the nao");
		await act(async () => dau.focus());
		expect(document.activeElement).toBe(dau);
		let khongChan = false;
		await act(async () => {
			khongChan = dau.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "Enter",
					bubbles: true,
					cancelable: true,
				}),
			);
			if (khongChan) dau.click();
		});
		expect(khongChan).toBe(true);
		expect(daDieuHuong).toEqual([dau.getAttribute("href") ?? ""]);
	});

	test("the-chi-de-xem: Board dung rieng cung khong mang thuoc tinh keo", async () => {
		const o = document.createElement("div");
		document.body.appendChild(o);
		const root = createRoot(o);
		await act(async () => {
			root.render(
				<LocaleProvider locale="vi">
					<Board
						label="bang"
						columns={[
							{
								id: "c",
								label: "Cot",
								count: 1,
								cards: [{ id: "x", href: "/ws/onboarding/x", title: "X" }],
							},
						]}
					/>
				</LocaleProvider>,
			);
		});
		expect(
			o.querySelectorAll("[draggable], [aria-roledescription]"),
		).toHaveLength(0);
		expect(o.querySelector("a")?.getAttribute("href")).toBe("/ws/onboarding/x");
		await act(async () => root.unmount());
		o.remove();
	});
});

describe("tran-cot", () => {
	test("tran-cot: cot dai hien dung tran the, con N the, tieu de mang tong that", async () => {
		const tran = ONBOARDING.bangCot.tranThe;
		gieo(tran + 3);
		const kq = bangCot({
			...planListInput.parse({}),
			cachChia: "buoc",
		});
		const cotThat = kq.cot[0];
		if (!cotThat) throw new Error("thu tuc khong tra cot nao");
		const conLai = cotThat.tong - cotThat.the.length;

		const san = await mo("cachXem=bang-cot");
		await cho(
			san.o,
			() => san.o.querySelectorAll("[data-board-card]").length > 0,
		);

		const cot = san.o.querySelector<HTMLElement>(
			`[data-board-column="${cotThat.khoa}"]`,
		);
		if (!cot) throw new Error("man khong ve cot cua thu tuc");
		const tieuDe = cot.querySelector("h3")?.textContent ?? "";
		expect(`tieu de ${tieuDe}`).toBe(`tieu de ${cotThat.nhan}${tran + 3}`);
		expect(cot.querySelectorAll("[data-board-card]")).toHaveLength(tran);
		expect(conLai).toBe(3);
		expect(cot.textContent).toContain(mUi.board.more(String(conLai)));
	});
});
