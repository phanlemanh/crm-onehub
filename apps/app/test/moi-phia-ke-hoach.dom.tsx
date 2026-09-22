import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import payload from "../../api/test/fixtures/moi-phia-payload.json";

type LoiGoi = { duong: string; dauVao: unknown };

let daGoi: LoiGoi[] = [];
let daLamMoi: string[] = [];
let duLieu: Record<string, (dauVao: unknown) => unknown> = {};

function thuTuc(duong: string) {
	const doc = (v: unknown) => {
		daGoi.push({ duong, dauVao: v });
		const lay = duLieu[duong];
		return lay ? lay(v) : null;
	};
	return {
		queryKey: (v?: unknown) => [duong, v],
		pathKey: () => [duong],
		queryOptions: (v?: unknown, chon?: object) => ({
			...chon,
			queryKey: [duong, v],
			queryFn: async () => doc(v),
		}),
		infiniteQueryOptions: (v?: unknown) => ({
			queryKey: [duong, v],
			queryFn: async () => doc(v),
			initialPageParam: null,
			getNextPageParam: () => null,
		}),
		mutationOptions: (chon?: {
			onSuccess?: (kq: unknown, v: unknown) => void;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (v: unknown) => doc(v) ?? { id: "ok" },
		}),
	};
}

const trpcGia = new Proxy(
	{},
	{
		get: (_goc, khongGian: string) =>
			new Proxy(
				{},
				{ get: (_g, ten: string) => thuTuc(`${khongGian}.${ten}`) },
			),
	},
);

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () =>
		new Proxy(
			{},
			{
				get: (_g, ten: string) => async (id?: string) => {
					daLamMoi.push(`${ten}:${id ?? ""}`);
				},
			},
		),
}));

mock.module("@/components/crm/agent-panel", () => ({ AgentPanel: () => null }));
mock.module("@/components/crm/timeline/timeline", () => ({
	Timeline: () => null,
}));
mock.module("@/components/crm/website-activity", () => ({
	WebsiteActivity: () => null,
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws",
}));

const { CompanySheet } = await import(
	"@/components/crm/record-sheet/company-sheet"
);
const { DetailSheet } = await import("@/components/detail-sheet");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { keHoachNoiMessages } = await import("@/lib/messages/ke-hoach-noi");

const k = keHoachNoiMessages("vi");

const CONG_TY_K = "ct-k";
const TOI = { id: "u-toi", name: "Lan", email: "lan@thu.test", image: null };

function congTy(soKeHoach: number, xuongCoKhuon: boolean) {
	return {
		id: CONG_TY_K,
		name: "One Mount",
		domain: null,
		website: null,
		description: null,
		logoUrl: null,
		logoDarkUrl: null,
		iconUrl: null,
		iconDarkUrl: null,
		iconTone: null,
		brandColor: null,
		industry: null,
		subIndustry: null,
		city: null,
		stateCode: null,
		country: null,
		countryCode: null,
		phone: null,
		email: null,
		linkedinUrl: null,
		twitterUrl: null,
		githubUrl: null,
		pricingUrl: null,
		careersUrl: null,
		enrichmentStatus: "COMPLETE",
		enrichmentError: null,
		source: "MANUAL",
		owner: null,
		contacts: [],
		fields: [],
		queued: false,
		createdAt: "2026-09-01T00:00:00.000Z",
		archivedAt: null,
		enrichedAt: null,
		primaryContactId: null,
		primaryContact: null,
		reportingCurrency: "VND",
		soKeHoach,
		xuongCoKhuon,
		deals: [],
	};
}

function hangKeHoach(id: string, dong: boolean) {
	return {
		id,
		companyId: CONG_TY_K,
		companyName: "One Mount",
		startedAt: "2026-09-10T00:00:00.000Z",
		targetDays: 30,
		ngayThu: 12,
		buocXong: 1,
		buocTong: 4,
		tacO: dong ? null : "Dao tao",
		boPhanTac: null,
		boPhanTacId: null,
		imNgay: 2,
		ownerId: TOI.id,
		closedAt: dong ? "2026-09-20T00:00:00.000Z" : null,
		ownerName: TOI.name,
		templateName: `Khuon ${id}`,
	};
}

type San = { o: HTMLElement; root: Root; url: () => URLSearchParams };
let dangMo: San[] = [];

async function mo(man: ReactElement, duong = ""): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	let hienTai = new URLSearchParams(duong);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(su) => {
					hienTai = new URLSearchParams(su.queryString);
				}}
				searchParams={duong}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root, url: () => hienTai };
	dangMo.push(san);
	return san;
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 120; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi trang thai ${moTa} — noi dung: ${document.body.textContent?.slice(0, 500)}`,
	);
}

async function nghi(ms: number): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
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
			const Kieu = loai.startsWith("pointer") ? PointerEvent : MouseEvent;
			o.dispatchEvent(
				new Kieu(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				} as PointerEventInit),
			);
		}
	});
}

function nut(chu: string, goc: ParentNode = document.body): HTMLElement {
	const tim = [
		...goc.querySelectorAll<HTMLElement>(
			"button, [role='tab'], [role='menuitem']",
		),
	].find((b) => b.textContent?.trim().startsWith(chu));
	if (!tim) {
		throw new Error(
			`khong thay nut "${chu}" — cac nut: ${[...goc.querySelectorAll("button, [role='tab'], [role='menuitem']")].map((b) => b.textContent?.trim()).join(" | ")}`,
		);
	}
	return tim;
}

function coNut(chu: string): boolean {
	return [
		...document.body.querySelectorAll<HTMLElement>("button, [role='tab']"),
	].some((b) => b.textContent?.trim().startsWith(chu));
}

function trongSheet(con: ReactElement): ReactElement {
	return (
		<DetailSheet onOpenChange={() => {}} open>
			{con}
		</DetailSheet>
	);
}

beforeEach(() => {
	daGoi = [];
	daLamMoi = [];
	duLieu = {
		"users.list": () => [TOI],
		"users.me": () => TOI,
		"onboarding.listTemplates": () => [],
	};
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => {
			san.root.unmount();
		});
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("tab-cong-ty-man", () => {
	test("tab-cong-ty-man: so tren nhan bang so dong, bam dong hai chong ke hoach P2", async () => {
		duLieu["companies.byId"] = () => congTy(2, true);
		duLieu["onboarding.plansOfCompany"] = () => [
			hangKeHoach("P1", false),
			hangKeHoach("P2", true),
		];
		const san = await mo(
			trongSheet(<CompanySheet companyId={CONG_TY_K} />),
			`?record=company:${CONG_TY_K}`,
		);
		await cho(() => coNut(k.congTy.tab), "tab 30 ngay dau");
		const tab = nut(k.congTy.tab);
		expect(tab.textContent, "nhan tab mang so 2").toContain("2");

		await bam(tab);
		await cho(
			() => document.body.querySelectorAll("[data-ke-hoach]").length === 2,
			"hai dong ke hoach",
		);
		const goi = daGoi.filter((g) => g.duong === "onboarding.plansOfCompany");
		expect(goi.length, "dung mot loi goi plansOfCompany").toBe(1);
		expect(goi[0]?.dauVao, "input bang muc keHoachCongTy").toEqual({
			...payload.keHoachCongTy,
			companyId: CONG_TY_K,
		});
		expect(Object.keys(payload.keHoachCongTy)).toEqual(["companyId"]);

		const dong2 = document.body.querySelector('[data-ke-hoach="P2"]');
		if (!dong2) throw new Error("khong thay dong P2");
		await bam(dong2);
		await nghi(1);
		expect(san.url().get("record"), "Expected plan:P2").toBe(
			`company:${CONG_TY_K},plan:P2`,
		);
	});

	test("tab-cong-ty-man: xuong khong khuon va cong ty khong ke hoach thi khong co tab", async () => {
		duLieu["companies.byId"] = () => congTy(0, false);
		await mo(
			trongSheet(<CompanySheet companyId={CONG_TY_K} />),
			`?record=company:${CONG_TY_K}`,
		);
		await cho(
			() => document.body.textContent?.includes("One Mount") === true,
			"sheet cong ty",
		);
		await nghi(5);
		expect(coNut(k.congTy.tab), "khong co tab khi 0 khuon 0 ke hoach").toBe(
			false,
		);
	});

	test("tab-cong-ty-man: doi chung duong — co mot ke hoach thi co tab", async () => {
		duLieu["companies.byId"] = () => congTy(1, false);
		duLieu["onboarding.plansOfCompany"] = () => [hangKeHoach("P1", false)];
		await mo(
			trongSheet(<CompanySheet companyId={CONG_TY_K} />),
			`?record=company:${CONG_TY_K}`,
		);
		await cho(() => coNut(k.congTy.tab), "co tab");
	});

	test("tab-cong-ty-man: co khuon ma chua co ke hoach thi man rong mo tao ke hoach khoa cong ty", async () => {
		duLieu["companies.byId"] = () => congTy(0, true);
		duLieu["onboarding.plansOfCompany"] = () => [];
		await mo(
			trongSheet(<CompanySheet companyId={CONG_TY_K} />),
			`?record=company:${CONG_TY_K}&tab=plans`,
		);
		await cho(
			() => document.body.textContent?.includes(k.congTy.rongTieuDe) === true,
			"man rong",
		);
		const nutTao = [...document.body.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === k.congTy.tao,
		);
		if (!nutTao) throw new Error("khong thay nut tao ke hoach");
		await bam(nutTao);
		await cho(
			() =>
				[...document.body.querySelectorAll("input")].some(
					(i) => i.value === "One Mount" && i.disabled,
				),
			"o cong ty dien san va khoa",
		);
	});
});
