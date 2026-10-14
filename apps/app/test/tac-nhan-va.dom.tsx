import { afterEach, describe, expect, mock, test } from "bun:test";
import {
	AgentActionStatus,
	AgentDefinitionStatus,
	AgentRunStatus,
	AgentTriggerType,
} from "@crm/db/enums";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { parseDealListResult } from "@crm/validation/deal-list";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, createElement as h, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type Agents = RouterOutputs["agents"]["list"];
type Runs = RouterOutputs["agents"]["history"];

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/agents",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({ href, children }: { href: string; children: ReactNode }) =>
		h("a", { href }, children),
}));

let danhSach: Agents = [];
mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		giaiDoan: {
			list: {
				queryOptions: () => ({
					queryKey: ["giaiDoan", "list"],
					queryFn: async () => [],
				}),
			},
		},
		agents: {
			list: {
				queryOptions: () => ({
					queryKey: ["agents", "list"],
					queryFn: async () => danhSach,
				}),
			},
		},
	}),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TeamAgentsIndex } = await import(
	"@/components/agent-builder/team-agents-index"
);
const { AgentRuns } = await import("@/components/agent-builder/agent-history");
const { DealListResultTable } = await import(
	"@/components/agent-builder/deal-list-result"
);
const { tacNhanMessages } = await import(
	"@/lib/messages/agent-builder-tac-nhan"
);
const { troChuyenMessages } = await import(
	"@/lib/messages/agent-builder-tro-chuyen"
);
const { ketQuaMessages } = await import("@/lib/messages/agent-builder-ket-qua");
const { NGHIA_TRANG_THAI_TAC_NHAN } = await import("@/lib/trang-thai-tac-nhan");
const { UserSubmission, builderSubmissions } = await import(
	"@/components/agent-builder/agent-builder-chat"
);

const dangMo: Root[] = [];

afterEach(() => {
	for (const root of dangMo.splice(0)) act(() => root.unmount());
	document.body.innerHTML = "";
});

async function ve(man: ReactNode): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">{man}</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	return o;
}

const NGUOI = { id: "u-1", name: "Lan", image: null };
const MOC = "2026-10-14T03:00:00.000Z";

function tacNhan(status: keyof typeof AgentDefinitionStatus): Agents[number] {
	return {
		id: `tn-${status}`,
		name: `Tác nhân ${status.length}`,
		description: null,
		status,
		createdAt: MOC,
		updatedAt: MOC,
		createdBy: NGUOI,
		currentVersion: null,
		triggers: [],
		runCount: 0,
	} as Agents[number];
}

describe("chu-tac-nhan", () => {
	const tn = tacNhanMessages("vi");
	const MA_TRAN = ["LIVE", "PAUSED", "ARCHIVED"] as const;

	test("chu-tac-nhan: bang chu va bang nghia phu du moi gia tri enum", () => {
		const enumCo = Object.values(AgentDefinitionStatus).sort();
		expect(Object.keys(tn.trangThai).sort()).toEqual(enumCo);
		expect(Object.keys(NGHIA_TRANG_THAI_TAC_NHAN).sort()).toEqual(enumCo);
	});

	test("chu-tac-nhan: ba dong mang cham va chu tieng Viet theo nghia", async () => {
		danhSach = MA_TRAN.map(tacNhan);
		const o = await ve(<TeamAgentsIndex initialAgents={danhSach} />);
		const dong = [...o.querySelectorAll("a")];
		expect(dong).toHaveLength(MA_TRAN.length);

		MA_TRAN.forEach((status, i) => {
			const cham = dong[i]?.querySelector('[data-slot="status-indicator"]');
			expect(cham, `dong ${status} khong co StatusIndicator`).not.toBe(null);
			expect(cham?.getAttribute("data-tone")).toBe(
				toneTheoNghia(NGHIA_TRANG_THAI_TAC_NHAN[status]),
			);
			expect(cham?.textContent).toBe(tn.trangThai[status]);
			expect(
				dong[i]?.textContent ?? "",
				"danh sach tac nhan in trang thai tho",
			).not.toMatch(/\b(live|paused|archived)\b/i);
		});
	});
});

function hanhDong(
	status: keyof typeof AgentActionStatus,
	i: number,
): Runs[number]["actions"][number] {
	return {
		id: `hd-${i}`,
		type: "crm.activity.create",
		provider: "crm",
		targetType: null,
		targetId: null,
		targetLabel: null,
		summary: `Viec ${i}`,
		status,
		externalId: null,
		attemptCount: 1,
		errorCode: null,
		errorMessage: null,
		plannedAt: new Date(Date.parse(MOC) + i * 1000).toISOString(),
		startedAt: null,
		completedAt: null,
	};
}

const SU_KIEN_DA_BIET = [
	"run.requested",
	"run.queued",
	"run.completed",
	"run.failed",
	"run.cancelled",
	"run.delivery_recovered",
	"session.started",
	"step.started",
	"step.completed",
	"step.failed",
] as const;
const SU_KIEN_LA = "x.khong-biet";

function luot(
	status: keyof typeof AgentRunStatus,
	triggerType: keyof typeof AgentTriggerType,
	i: number,
	day = false,
): Runs[number] {
	const suKien = day ? [...SU_KIEN_DA_BIET, SU_KIEN_LA] : [];
	return {
		id: `luot-${i}`,
		status,
		triggerType,
		summary: null,
		modelId: null,
		inputTokens: null,
		outputTokens: null,
		costUsd: null,
		errorCode: null,
		errorMessage: null,
		createdAt: MOC,
		startedAt: MOC,
		finishedAt: MOC,
		initiatedBy: null,
		version: { id: "ban-1", number: 1 },
		totalEvents: suKien.length,
		eventsTruncated: false,
		canCancel: false,
		events: suKien.map((type, k) => ({
			id: `sk-${i}-${k}`,
			sequence: k,
			type,
			data: {},
			emittedAt: new Date(Date.parse(MOC) + k * 1000).toISOString(),
		})),
		actions: day
			? (
					Object.keys(AgentActionStatus) as (keyof typeof AgentActionStatus)[]
				).map(hanhDong)
			: [],
	};
}

describe("chu-luot", () => {
	const t = troChuyenMessages("vi");
	const trangThaiLuot = Object.keys(
		AgentRunStatus,
	) as (keyof typeof AgentRunStatus)[];
	const mocKichHoat = Object.keys(
		AgentTriggerType,
	) as (keyof typeof AgentTriggerType)[];
	const trangThaiBuoc = Object.keys(AgentActionStatus);
	const MIEN = new Set(["UTC"]);

	function theoDong(o: HTMLElement, chon: string, khoa: string) {
		return [...o.querySelectorAll<HTMLElement>(`[${chon}]`)].map((e) => ({
			gia: e.getAttribute(chon) ?? khoa,
			chu: e.textContent?.trim() ?? "",
		}));
	}

	test("chu-luot: moi dong trang thai, moc, buoc, su kien bang chu cua bang", async () => {
		const runs = trangThaiLuot.map((status, i) =>
			luot(status, mocKichHoat[i % mocKichHoat.length] ?? "MANUAL", i, i === 0),
		);
		const o = await ve(
			<AgentRuns
				runs={runs}
				onCancel={() => {}}
				cancelling={false}
				onRetry={() => {}}
			/>,
		);
		const dongLuot = theoDong(o, "data-trang-thai-luot", "");
		expect(dongLuot.map((d) => d.gia).sort()).toEqual(
			[...trangThaiLuot].sort(),
		);
		for (const d of dongLuot)
			expect(d.chu, `trang thai luot ${d.gia}`).toBe(
				t.trangThai[d.gia as keyof typeof t.trangThai],
			);
		const dongMoc = theoDong(o, "data-moc", "");
		expect(dongMoc).toHaveLength(runs.length);
		for (const d of dongMoc)
			expect(d.chu, `moc ${d.gia}`).toBe(
				t.trangThai[d.gia as keyof typeof t.trangThai],
			);

		const nutLuotDau = [...o.querySelectorAll("button")].find((nut) =>
			nut.querySelector(`[data-trang-thai-luot="${runs[0]?.status}"]`),
		);
		expect(nutLuotDau, "khong tim thay luot dau de mo").toBeDefined();
		await act(async () => nutLuotDau?.click());

		const dongBuoc = theoDong(o, "data-trang-thai-buoc", "");
		expect(dongBuoc.map((d) => d.gia).sort()).toEqual(
			[...trangThaiBuoc].sort(),
		);
		for (const d of dongBuoc)
			expect(d.chu, "buoc PLANNED hien chu tho").toBe(
				t.trangThai[d.gia as keyof typeof t.trangThai],
			);

		const dongSuKien = theoDong(o, "data-su-kien", "");
		expect(dongSuKien.map((d) => d.gia).sort()).toEqual(
			[...SU_KIEN_DA_BIET, SU_KIEN_LA].sort(),
		);
		for (const d of dongSuKien)
			expect(d.chu, "su kien hien ten may").toBe(
				d.gia === SU_KIEN_LA
					? t.suKienKhac
					: t.suKien[d.gia as keyof typeof t.suKien],
			);
		expect(
			o.querySelector('[data-o-luot="nguoi-mo"]')?.textContent?.trim(),
		).toBe(t.luot.lichTuDong);
		expect(o.querySelector('[data-o-luot="model"]')?.textContent?.trim()).toBe(
			t.luot.macDinh,
		);

		const banSao = o.cloneNode(true) as HTMLElement;
		for (const chon of banSao.querySelectorAll("select")) chon.remove();
		const chu = banSao.textContent ?? "";
		const tenMay = [
			...(chu.match(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*\b/g) ?? []),
		].filter((tu) => tu.length > 1 && !MIEN.has(tu));
		expect(tenMay, "chu may viet hoa lot ra man").toEqual([]);
		expect(
			chu.match(/\b[a-z]+\.[a-z_]+\b/g) ?? [],
			"loai su kien tach cham lot ra man",
		).toEqual([]);
	});
});

function ketQua(status: string) {
	const ket = parseDealListResult({
		asOf: MOC,
		criteria: {
			status,
			inactiveForDays: null,
			companyId: null,
			ownerId: null,
		},
		deals: [1, 2].map((i) => ({
			id: `tt-${i}`,
			name: `Thoả thuận ${i}`,
			stage: "Đang bàn",
			stageId: null,
			amount: 1000 * i,
			currency: "VND",
			company: {
				id: `ct-${i}`,
				name: `Công ty ${i}`,
				domain: null,
				iconUrl: null,
				iconDarkUrl: null,
				iconTone: null,
				logoUrl: null,
			},
			owner: null,
			daysSinceLastActivity: 3,
			neverActive: false,
			expectedCloseDate: null,
		})),
		hasMore: false,
	});
	if (!ket)
		throw new Error("fixture DealListResult khong qua parseDealListResult");
	return ket;
}

describe("chu-thoa-thuan", () => {
	const k = ketQuaMessages("vi");
	const MA_TRAN = ["open", "won", "lost"] as const;

	async function tenVung(status: string) {
		const o = await ve(<DealListResultTable result={ketQua(status)} />);
		return o.querySelector("section")?.getAttribute("aria-label") ?? "";
	}

	for (const status of MA_TRAN) {
		test(`chu-thoa-thuan: loc ${status} ghi trong ten vung bang chu tu dien`, async () => {
			const nhan = await tenVung(status);
			expect(nhan, "ket qua luot chay in trang thai thoa thuan tho").toContain(
				k.thoaThuan.trangThai[status],
			);
			expect(nhan).not.toMatch(/\b(open|won|lost)\b/);
		});
	}

	test("chu-thoa-thuan: loc all khong chen chu trang thai vao ten vung", async () => {
		const nhan = await tenVung("all");
		expect(nhan.length, "vung bang khong co ten").toBeGreaterThan(0);
		for (const status of MA_TRAN)
			expect(nhan).not.toContain(k.thoaThuan.trangThai[status]);
	});
});

describe("gui-hong", () => {
	const t = troChuyenMessages("vi");
	const MA_TRAN = [
		{ ma: "DELIVERY_FAILED", chu: t.man.loiGui.DELIVERY_FAILED },
		{ ma: "DELIVERY_EXHAUSTED", chu: t.man.loiGui.DELIVERY_EXHAUSTED },
		{ ma: "MA_LA", chu: t.man.guiHong },
	] as const;

	for (const o of MA_TRAN) {
		test(`gui-hong: ${o.ma} hien chu theo ma, khong in thong diep may chu`, async () => {
			const [baiNop] = builderSubmissions.parse([
				{
					id: `bn-${o.ma}`,
					createdAt: MOC,
					clientRequestId: null,
					commandType: "CHAT",
					message: {
						text: "Tạo tác nhân báo cáo",
						resources: [],
						attachments: [],
					},
					status: "FAILED",
					errorCode: o.ma,
					errorMessage: "boom english",
				},
			]);
			if (!baiNop)
				throw new Error("khuon bai nop cua man khong doc duoc fixture");
			const khung = await ve(
				<UserSubmission
					submission={baiNop}
					failed
					errorCode={baiNop.errorCode}
				/>,
			);
			const chu = khung.textContent ?? "";
			expect(chu, "dong loi in thong diep may chu").not.toContain(
				"boom english",
			);
			expect(chu).toContain(o.chu);
		});
	}
});
