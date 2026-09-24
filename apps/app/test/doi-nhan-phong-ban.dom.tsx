import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	createElement as h,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import type { DanhMucInput } from "@/app/(app)/[slug]/onboarding/onboarding-search-params";
import { planListInput } from "../../api/src/onboarding/onboarding.contracts";
import {
	dungHang,
	type HangDanhMuc,
	type KeHoachTho,
	locHang,
	manDanhMucTuHang,
} from "../../api/src/onboarding/onboarding-danh-muc";

const SLUG = "ws";
const BO_PHAN_CAP_TREN = [
	{ id: "kd", name: "Kinh doanh" },
	{ id: "vh", name: "Vận hành" },
];
const PHONG_BAN = [
	{ id: "pb-1", name: "Kinh doanh vùng 1", position: 0, divisionId: "kd" },
	{ id: "pb-2", name: "Kinh doanh vùng 2", position: 1, divisionId: "kd" },
	{ id: "pb-3", name: "Chăm sóc khách hàng", position: 2, divisionId: null },
];
const NGUOI = [{ id: "u-1", name: "Lan", email: "lan@thu.test", image: null }];

let tap: HangDanhMuc[] = [];
let dauVaoCuoi: DanhMucInput | null = null;

function keHoach(i: number, pb: (typeof PHONG_BAN)[number]): KeHoachTho {
	return {
		id: `kh-${i}`,
		companyId: `ct-${i}`,
		company: { name: `Doi tac ${i}` },
		startedAt: new Date("2026-09-01T00:00:00.000Z"),
		targetDays: 30,
		ownerId: "u-1",
		closedAt: null,
		steps: [
			{
				completedAt: null,
				label: "Ky hop dong",
				position: 0,
				updatedAt: new Date("2026-09-10T00:00:00.000Z"),
				assigneeId: null,
				assignee: null,
				department: pb,
			},
		],
	};
}

function thuTuc(ten: string, chay: (v: never) => unknown = () => null) {
	return {
		queryKey: (v?: unknown) => (v === undefined ? [ten] : [ten, v]),
		pathKey: () => [ten],
		queryOptions: (v?: unknown) => ({
			queryKey: v === undefined ? [ten] : [ten, v],
			queryFn: async () => chay(v as never),
		}),
		mutationOptions: (chon: Record<string, unknown> = {}) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: async () => ({ id: "ok" }),
		}),
	};
}

function nhom(ten: string, biet: Record<string, unknown>) {
	return new Proxy(biet, {
		get: (t, k) => (k in t ? t[k as string] : thuTuc(`${ten}.${String(k)}`)),
	});
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		onboarding: nhom("onboarding", {
			manDanhMuc: thuTuc("manDanhMuc", (v: DanhMucInput) => {
				dauVaoCuoi = v;
				return {
					...manDanhMucTuHang(tap, planListInput.parse(v), 1),
					boPhanCapTren: BO_PHAN_CAP_TREN,
				};
			}),
			listDepartments: thuTuc("listDepartments", () =>
				PHONG_BAN.map((d) => ({ ...d, archivedAt: null, purgeable: false })),
			),
			listTemplates: thuTuc("listTemplates", () => []),
			access: thuTuc("access", () => ({ canManage: true })),
			listSteps: thuTuc("listSteps", () => ({ rows: [], total: 0 })),
		}),
		users: nhom("users", {
			list: thuTuc("users.list", () => NGUOI),
			me: thuTuc("users.me", () => NGUOI[0]),
		}),
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: SLUG }),
	useSearchParams: () => new URLSearchParams(),
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
	}) => h("a", { ...rest, href }, children),
}));

const { DanhMucTable } = await import(
	"@/app/(app)/[slug]/onboarding/danh-muc-table"
);
const { CaiDatDieuPhoi } = await import(
	"@/app/(app)/[slug]/settings/onboarding/cai-dat-dieu-phoi"
);
const { PlanSteps } = await import("@/components/crm/record-sheet/plan-steps");
const { DetailSheet } = await import("@/components/detail-sheet");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { messages } = await import("@crm/ui/lib/messages");
const { onboardingMessages } = await import("@/lib/messages/onboarding");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(
	man: ReactElement,
	duong = "",
	locale: "vi" | "en" = "vi",
): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter searchParams={duong} hasMemory>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
	dangMo.push(san);
	await cho(() => !document.body.textContent?.includes("Đang tải"), "tai xong");
	return san;
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 60; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 300)}`,
	);
}

async function bam(o: Element): Promise<void> {
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		]) {
			o.dispatchEvent(
				new MouseEvent(loai, { bubbles: true, cancelable: true, button: 0 }),
			);
		}
	});
}

function nut(goc: ParentNode, chu: string): HTMLElement {
	const tim = [...goc.querySelectorAll<HTMLElement>("button")].find((b) =>
		b.textContent?.trim().startsWith(chu),
	);
	if (!tim) throw new Error(`khong thay nut "${chu}"`);
	return tim;
}

function nutLoc(goc: ParentNode): HTMLElement {
	const tim = [...goc.querySelectorAll<HTMLElement>("button")].find(
		(b) =>
			b.getAttribute("aria-haspopup") === "menu" &&
			b.textContent?.trim().startsWith(mUi.table.filters),
	);
	if (!tim) throw new Error("khong thay nut mo bo loc");
	return tim;
}

async function dongHet(): Promise<void> {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
}

function moiChuoi(o: unknown, duong = ""): [string, string][] {
	if (typeof o === "string") return [[duong, o]];
	if (o && typeof o === "object") {
		return Object.entries(o).flatMap(([k, v]) =>
			moiChuoi(v, duong ? `${duong}.${k}` : k),
		);
	}
	return [];
}

beforeEach(() => {
	const bayGio = new Date("2026-09-21T00:00:00.000Z");
	tap = [
		keHoach(1, PHONG_BAN[0] as (typeof PHONG_BAN)[number]),
		keHoach(2, PHONG_BAN[1] as (typeof PHONG_BAN)[number]),
		keHoach(3, PHONG_BAN[2] as (typeof PHONG_BAN)[number]),
	].map((k) => dungHang(k, bayGio));
	dauVaoCuoi = null;
});

afterEach(dongHet);

const m = onboardingMessages("vi");
const mUi = messages("vi");

describe("nhan-dieu-phoi", () => {
	test("nhan-dieu-phoi: chu cap duoi la phong ban, bo loc cap tren la Bo phan", () => {
		expect([
			m.columns.department,
			m.facets.department,
			m.chia["bo-phan"],
			m.tao.khuon.stepDepartment,
		]).toEqual(["Phòng ban", "Phòng ban đang cầm", "Phòng ban", "Phòng ban"]);
		expect(m.facets.division).toBe("Bộ phận");
		const viPham = moiChuoi(m)
			.filter(([duong]) => duong !== "facets.division")
			.filter(([, chu]) => /bộ phận/i.test(chu));
		expect(viPham.map(([d]) => d)).toEqual([]);
	});

	test("nhan-dieu-phoi: tren man — cot va hai bo loc doc dung chu; Cai dat Dieu phoi tro sang To chuc", async () => {
		const s = await mo(<DanhMucTable />);
		await cho(() => s.o.textContent?.includes("Doi tac 1") === true, "co hang");
		const tieuDe = [...s.o.querySelectorAll("th")].map((t) =>
			t.textContent?.trim(),
		);
		expect(tieuDe).toContain(m.columns.department);
		await bam(nutLoc(s.o));
		await cho(
			() => document.body.textContent?.includes(m.facets.division) === true,
			"menu loc",
		);
		expect({
			phongBanDangCam: document.body.textContent?.includes(m.facets.department),
			boPhan: document.body.textContent?.includes(m.facets.division),
		}).toEqual({ phongBanDangCam: true, boPhan: true });
		await dongHet();

		const c = await mo(<CaiDatDieuPhoi />);
		await cho(
			() => c.o.textContent?.includes(m.settings.departmentsMoved) === true,
			"cai dat",
		);
		const lienKet = c.o.querySelector<HTMLAnchorElement>("a[href]");
		expect({
			conDanhSachCu: c.o.querySelector("[data-bo-phan]") !== null,
			lienKet: lienKet?.getAttribute("href"),
		}).toEqual({
			conDanhSachCu: false,
			lienKet: `/${SLUG}/settings/organization`,
		});
	});
});

describe("thoi-luong", () => {
	test("thoi-luong: o so ngay mang nhan Thoi luong / Duration", () => {
		expect(onboardingMessages("vi").sheet.fields.target).toBe("Thời lượng");
		expect(onboardingMessages("en").sheet.fields.target).toBe("Duration");
	});

	test("thoi-luong: tren sheet ke hoach — nhan canh 30 ngay, khong con Muc tieu / Target", async () => {
		const plan = {
			id: "kh-1",
			companyId: "ct-1",
			companyName: "One Mount",
			templateId: null,
			templateName: null,
			startedAt: "2026-09-10T00:00:00.000Z",
			targetDays: 30,
			closedAt: null,
			ownerId: "u-1",
			owner: NGUOI[0],
		};
		const ketQua: string[] = [];
		for (const [tieng, nhan, cu] of [
			["vi", "Thời lượng", "Mục tiêu"],
			["en", "Duration", "Target"],
		] as const) {
			const mm = onboardingMessages(tieng).sheet;
			await mo(
				<DetailSheet onOpenChange={() => {}} open>
					<PlanSteps plan={plan as never} />
				</DetailSheet>,
				"",
				tieng,
			);
			await cho(
				() => document.body.textContent?.includes(nhan) === true,
				`${tieng} nhan`,
			);
			const chu = document.body.textContent ?? "";
			ketQua.push(
				`${tieng}: ${nhan} ${chu.includes(nhan)} ${mm.days.replace("{n}", "30")} ${chu.includes(mm.days.replace("{n}", "30"))}`,
				`${tieng}: con ${cu} ${chu.includes(cu)}`,
			);
			await dongHet();
		}
		expect(ketQua).toEqual([
			"vi: Thời lượng true 30 ngày true",
			"vi: con Mục tiêu false",
			"en: Duration true 30 days true",
			"en: con Target false",
		]);
	});
});

describe("loc-bo-phan-man", () => {
	test("loc-bo-phan-man: truy van mang ma bo phan, danh sach theo phan hoi, giu khi tai lai, bo loc thi het", async () => {
		const s = await mo(<DanhMucTable />, "division=kd");
		await cho(() => dauVaoCuoi !== null, "goi danh muc");
		expect(
			`truy van danh muc: ${(dauVaoCuoi?.division ?? []).includes("kd") ? "co" : "thieu"} ma bo phan A`,
		).toBe("truy van danh muc: co ma bo phan A");
		const kyVong = locHang(tap, planListInput.parse({ division: ["kd"] })).map(
			(h) => h.companyName,
		);
		await cho(
			() => s.o.textContent?.includes(kyVong[0] ?? "") === true,
			"co hang",
		);
		expect(
			tap.map(
				(h) => `${h.companyName}: ${s.o.textContent?.includes(h.companyName)}`,
			),
		).toEqual(
			tap.map((h) => `${h.companyName}: ${kyVong.includes(h.companyName)}`),
		);
		await bam(nutLoc(s.o));
		await cho(
			() => document.body.textContent?.includes(m.facets.division) === true,
			"menu loc",
		);
		expect(document.body.textContent?.includes("Kinh doanh")).toBe(true);
		await dongHet();

		dauVaoCuoi = null;
		await mo(<DanhMucTable />, "division=kd");
		await cho(() => dauVaoCuoi !== null, "tai lai");
		expect((dauVaoCuoi as DanhMucInput | null)?.division).toEqual(["kd"]);
		await dongHet();

		dauVaoCuoi = null;
		const s3 = await mo(<DanhMucTable />, "division=vh");
		await cho(
			() => s3.o.textContent?.includes(m.noMatch.title) === true,
			"khong khop",
		);
		await bam(nut(s3.o, m.noMatch.action));
		await cho(
			() =>
				((dauVaoCuoi as DanhMucInput | null)?.division ?? ["x"]).length === 0,
			"bo loc",
		);
		expect((dauVaoCuoi as DanhMucInput | null)?.division ?? []).toEqual([]);
	});
});
