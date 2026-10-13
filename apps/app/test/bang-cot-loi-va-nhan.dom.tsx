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
import {
	type BangCotOutput,
	bangCotInput,
	planListInput,
} from "../../api/src/onboarding/onboarding.contracts";
import {
	bangCotTuHang,
	dungHang,
	type HangDanhMuc,
	hangCuaBangCot,
	type KeHoachTho,
	manDanhMucTuHang,
} from "../../api/src/onboarding/onboarding-danh-muc";

type BangCotVao = DanhMucInput & { cachChia: DanhMucCachChia };

type KichBan = { loai: "loi" } | { loai: "treo" } | { loai: "du-lieu" };

const BAY_GIO = new Date("2026-09-21T00:00:00.000Z");

function keHoach(
	i: number,
	ten: string,
	buoc: string,
	dong: boolean,
): KeHoachTho {
	return {
		id: `kh-${String(i).padStart(3, "0")}`,
		companyId: `ct-${i}`,
		company: { name: ten },
		startedAt: new Date("2026-09-01T00:00:00.000Z"),
		targetDays: 30,
		ownerId: "u-1",
		closedAt: dong ? new Date("2026-09-15T00:00:00.000Z") : null,
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

const TAP: HangDanhMuc[] = [
	keHoach(1, "Alpha Sàn", "Ky hop dong", false),
	keHoach(2, "Beta Sàn", "Dao tao", false),
	keHoach(3, "Gamma Hub", "Ky hop dong", true),
].map((k) => dungHang(k, BAY_GIO));

function theoQ(q: string): HangDanhMuc[] {
	const kim = q.trim().toLowerCase();
	return kim === ""
		? TAP
		: TAP.filter((h) => h.companyName.toLowerCase().includes(kim));
}

function tinhBangCot(dauVao: BangCotVao): BangCotOutput {
	const input = bangCotInput.parse(dauVao);
	return bangCotTuHang(hangCuaBangCot(theoQ(input.q), input), input, []);
}

let kichBan: KichBan[] = [];
let daGoiBangCot: BangCotVao[] = [];
let moTreo: (() => void)[] = [];
let daDieuHuong: string[] = [];
let duongHienTai = new URLSearchParams();

function khongGoi(ten: string) {
	return {
		mutationOptions: () => ({
			mutationFn: async () => {
				throw new Error(`${ten} khong duoc goi trong tep nay`);
			},
		}),
	};
}

function bangCot(dauVao: BangCotVao): Promise<BangCotOutput> {
	daGoiBangCot.push(dauVao);
	const buoc = kichBan.shift() ?? { loai: "du-lieu" };
	if (buoc.loai === "loi") return Promise.reject(new Error("may chu loi"));
	if (buoc.loai === "treo") {
		return new Promise((giai) => {
			moTreo.push(() => giai(tinhBangCot(dauVao)));
		});
	}
	return Promise.resolve(tinhBangCot(dauVao));
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

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		onboarding: {
			manDanhMuc: thuTuc("manDanhMuc", (dauVao: DanhMucInput) => {
				const input = planListInput.parse(dauVao);
				return manDanhMucTuHang(theoQ(input.q), input, 1);
			}),
			bangCot: thuTuc("bangCot", bangCot),
			listDepartments: thuTuc("listDepartments", () => [
				{ id: "bp-a", name: "Kinh doanh", position: 0, archivedAt: null },
			]),
			listTemplates: thuTuc("listTemplates", () => []),
			createFromTemplate: khongGoi("createFromTemplate"),
		},
		users: {
			list: thuTuc("users.list", () => [{ id: "u-1", name: "Lan" }]),
			me: thuTuc("users.me", () => ({ id: "u-1", name: "Lan" })),
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: (duong: string) => daDieuHuong.push(duong),
		replace: () => {},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => duongHienTai,
	usePathname: () => "/ws/onboarding",
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
				onClick: (e: ReactMouseEvent) => e.preventDefault(),
			},
			children,
		),
}));

const { DanhMucTable } = await import(
	"@/app/(app)/[slug]/onboarding/danh-muc-table"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { messages } = await import("@crm/ui/lib/messages");
const { onboardingMessages } = await import("@/lib/messages/onboarding");

const m = onboardingMessages("vi");
const mUi = messages("vi");

type San = {
	o: HTMLElement;
	root: Root;
	soLanGhiDuongDan: () => number;
	duongDan: () => string;
};

let dangMo: San[] = [];

async function mo(duong: string): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	let soLanGhi = 0;
	let hienTai = duong;
	duongHienTai = new URLSearchParams(duong);
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				searchParams={duong}
				hasMemory
				onUrlUpdate={(e) => {
					soLanGhi += 1;
					hienTai = e.queryString;
					duongHienTai = new URLSearchParams(e.searchParams);
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
	const san = {
		o,
		root,
		soLanGhiDuongDan: () => soLanGhi,
		duongDan: () => hienTai,
	};
	dangMo.push(san);
	await cho(o, () => !o.textContent?.includes(m.loading));
	return san;
}

async function cho(o: HTMLElement, xong: () => boolean): Promise<void> {
	for (let vong = 0; vong < 60; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`man khong toi trang thai mong doi — noi dung: ${o.textContent}`,
	);
}

async function nghi(ms: number): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
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

async function go(o: HTMLElement, chu: string): Promise<void> {
	const oTim = o.querySelector<HTMLInputElement>(
		`input[placeholder="${m.search}"]`,
	);
	if (!oTim) throw new Error("khong thay o tim");
	const datGiaTri = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		datGiaTri?.call(oTim, chu);
		oTim.dispatchEvent(new Event("input", { bubbles: true }));
	});
	await nghi(400);
}

function khungCho(o: HTMLElement): number {
	return o.querySelectorAll('[data-slot="skeleton"]').length;
}

function cotDangHien(o: HTMLElement): { khoa: string; tieuDe: string }[] {
	return [...o.querySelectorAll<HTMLElement>("[data-board-column]")].map(
		(c) => ({
			khoa: c.getAttribute("data-board-column") ?? "",
			tieuDe: c.querySelector("h3")?.textContent ?? "",
		}),
	);
}

function nhanMongDoi(
	cachChia: DanhMucCachChia,
	khoa: string,
	nhan: string | null,
): string {
	if (cachChia === "trang-thai")
		return khoa === "da-dong" ? m.facets.closed : m.facets.running;
	return nhan ?? khoa;
}

function tieuDeMongDoi(du: BangCotOutput): string[] {
	return du.cot.map(
		(c) => `${nhanMongDoi(du.cachChia, c.khoa, c.nhan)}${c.tong}`,
	);
}

function vungBang(o: HTMLElement): HTMLElement | null {
	return o.querySelector<HTMLElement>("[aria-busy]");
}

async function thao(san: San): Promise<void> {
	await act(async () => san.root.unmount());
	san.o.remove();
	dangMo = dangMo.filter((x) => x !== san);
}

const coLoi = (o: HTMLElement) =>
	o.textContent?.includes(m.boardError.title) === true;

beforeEach(() => {
	kichBan = [];
	daGoiBangCot = [];
	moTreo = [];
	daDieuHuong = [];
});

afterEach(async () => {
	for (const giai of moTreo) giai();
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
});

describe("loi-lan-dau", () => {
	test("loi-lan-dau: doi chung duong — thu tuc treo thi co khung cho", async () => {
		kichBan = [{ loai: "treo" }];
		const san = await mo("cachXem=bang-cot");
		await cho(san.o, () => daGoiBangCot.length > 0);
		expect(`khung cho khi treo: ${khungCho(san.o)}`).not.toBe(
			"khung cho khi treo: 0",
		);
	});

	test("loi-lan-dau: thu tuc loi thi hien loi, Tai lai, thanh loc con, khong khung cho", async () => {
		kichBan = [{ loai: "loi" }];
		const san = await mo("cachXem=bang-cot");
		await cho(san.o, () => coLoi(san.o));

		expect(
			`ST-bangcot-loi=${coLoi(san.o)} khung cho con lai: ${khungCho(san.o)}`,
		).toBe("ST-bangcot-loi=true khung cho con lai: 0");
		expect(nut(san.o, mUi.karaKhung.thuLai)).toBeTruthy();
		expect(
			san.o.querySelector(`input[placeholder="${m.search}"]`),
		).not.toBeNull();
		expect(san.o.textContent).toContain(mUi.table.filters);
		expect(cotDangHien(san.o)).toEqual([]);
	});

	test("loi-lan-dau: doi chung — thu tuc tra du lieu thi co cot, khong loi", async () => {
		const san = await mo("cachXem=bang-cot");
		await cho(san.o, () => cotDangHien(san.o).length > 0);
		expect(coLoi(san.o)).toBe(false);
	});
});

describe("tai-lai", () => {
	test("tai-lai: bam Tai lai goi lai dung mot lan, hien cot, khong ghi duong dan", async () => {
		kichBan = [{ loai: "loi" }, { loai: "du-lieu" }];
		const san = await mo("cachXem=bang-cot");
		await cho(san.o, () => coLoi(san.o));

		const goiTruoc = daGoiBangCot.length;
		const ghiTruoc = san.soLanGhiDuongDan();
		await bam(nut(san.o, mUi.karaKhung.thuLai));
		await cho(san.o, () => cotDangHien(san.o).length > 0);

		expect(`so lan goi them: ${daGoiBangCot.length - goiTruoc}`).toBe(
			"so lan goi them: 1",
		);
		const duLieu = tinhBangCot(
			daGoiBangCot[daGoiBangCot.length - 1] as BangCotVao,
		);
		expect(cotDangHien(san.o).map((c) => c.tieuDe)).toEqual(
			tieuDeMongDoi(duLieu),
		);
		expect(coLoi(san.o)).toBe(false);
		expect(`so lan ghi duong dan: ${san.soLanGhiDuongDan() - ghiTruoc}`).toBe(
			"so lan ghi duong dan: 0",
		);
	});
});

describe("loi-sau-du-lieu", () => {
	test("loi-sau-du-lieu: doi bo loc roi loi thi khong con cot cu", async () => {
		kichBan = [{ loai: "du-lieu" }, { loai: "loi" }];
		const san = await mo("cachXem=bang-cot");
		await cho(san.o, () => cotDangHien(san.o).length > 0);

		await go(san.o, "Sàn");
		await cho(san.o, () => coLoi(san.o));

		expect(`cot con lai: ${cotDangHien(san.o).length}`).toBe("cot con lai: 0");
		expect(nut(san.o, mUi.karaKhung.thuLai)).toBeTruthy();
	});
});

describe("tai-lai-bo-loc-moi", () => {
	test("tai-lai-bo-loc-moi: Tai lai mang q moi va hien cot cua lan goi do", async () => {
		kichBan = [{ loai: "du-lieu" }, { loai: "loi" }, { loai: "du-lieu" }];
		const san = await mo("cachXem=bang-cot");
		await cho(san.o, () => cotDangHien(san.o).length > 0);
		const lanMot = tinhBangCot(daGoiBangCot[0] as BangCotVao);

		await go(san.o, "Beta");
		await cho(san.o, () => coLoi(san.o));
		await bam(nut(san.o, mUi.karaKhung.thuLai));
		await cho(san.o, () => cotDangHien(san.o).length > 0);

		const lanBa = daGoiBangCot[daGoiBangCot.length - 1] as BangCotVao;
		expect(`q cua lan goi: ${lanBa.q}`).toBe("q cua lan goi: Beta");
		const duLieu = tinhBangCot(lanBa);
		expect(cotDangHien(san.o).map((c) => c.tieuDe)).toEqual(
			tieuDeMongDoi(duLieu),
		);
		expect(tieuDeMongDoi(duLieu)).not.toEqual(tieuDeMongDoi(lanMot));
	});
});

const CHIEU: { tu: DanhMucCachChia; sang: DanhMucCachChia }[] = [
	{ tu: "buoc", sang: "trang-thai" },
	{ tu: "trang-thai", sang: "buoc" },
];

describe("nhan-khi-cho", () => {
	test("nhan-khi-cho: hai chieu, cot dang hien giu nhan cua cach chia cu va bao dang tai", async () => {
		let soChieu = 0;
		for (const { tu, sang } of CHIEU) {
			kichBan = [{ loai: "du-lieu" }, { loai: "treo" }];
			daGoiBangCot = [];
			moTreo = [];
			const san = await mo(`cachXem=bang-cot&cachChia=${tu}`);
			await cho(san.o, () => cotDangHien(san.o).length > 0);
			const cu = tinhBangCot(daGoiBangCot[0] as BangCotVao);

			await bam(nut(san.o, m.chia[sang]));
			await cho(san.o, () => daGoiBangCot.length === 2);

			expect(
				`${tu}->${sang}: ${cotDangHien(san.o)
					.map((c) => c.tieuDe)
					.join("|")}`,
			).toBe(`${tu}->${sang}: ${tieuDeMongDoi(cu).join("|")}`);
			expect(
				`${tu}->${sang} aria-busy=${vungBang(san.o)?.getAttribute("aria-busy")}`,
			).toBe(`${tu}->${sang} aria-busy=true`);
			await thao(san);
			soChieu += 1;
		}
		expect(soChieu).toBe(2);
	});
});

describe("nhan-khi-ve", () => {
	test("nhan-khi-ve: hai chieu, du lieu moi ve thi nhan theo cach chia moi, thoi bao dang tai", async () => {
		let soChieu = 0;
		for (const { tu, sang } of CHIEU) {
			kichBan = [{ loai: "du-lieu" }, { loai: "treo" }];
			daGoiBangCot = [];
			moTreo = [];
			const san = await mo(`cachXem=bang-cot&cachChia=${tu}`);
			await cho(san.o, () => cotDangHien(san.o).length > 0);
			await bam(nut(san.o, m.chia[sang]));
			await cho(san.o, () => moTreo.length === 1);

			await act(async () => {
				moTreo[0]?.();
			});
			const moi = tinhBangCot(daGoiBangCot[1] as BangCotVao);
			await cho(
				san.o,
				() => vungBang(san.o)?.getAttribute("aria-busy") === "false",
			);

			expect(
				`${tu}->${sang}: ${cotDangHien(san.o)
					.map((c) => c.tieuDe)
					.join("|")}`,
			).toBe(`${tu}->${sang}: ${tieuDeMongDoi(moi).join("|")}`);
			expect(
				`${tu}->${sang} aria-busy=${vungBang(san.o)?.getAttribute("aria-busy")}`,
			).toBe(`${tu}->${sang} aria-busy=false`);
			await thao(san);
			soChieu += 1;
		}
		expect(soChieu).toBe(2);
	});
});
