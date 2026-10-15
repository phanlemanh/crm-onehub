import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { TooltipProvider } from "@crm/ui/components/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

type TrangThaiNguon =
	| "CHO_DOC"
	| "CHO_SOAN"
	| "DANG_SOAN"
	| "DA_SOAN"
	| "CAN_GO_TAY"
	| "LOI";

const NGUON: TrangThaiNguon[] = [
	"CHO_DOC",
	"CHO_SOAN",
	"DANG_SOAN",
	"DA_SOAN",
	"CAN_GO_TAY",
	"LOI",
];

function hangNguon(trangThai: TrangThaiNguon) {
	return {
		id: `ng-${trangThai}`,
		tenTep: `tep-${trangThai}.docx`,
		kieu: "docx",
		trangThai,
		lyDo: null,
		taiLuc: new Date("2026-10-01T00:00:00.000Z"),
		taiBoi: { id: "u1", name: "Hà" },
		trang: { slug: "quy-dinh-a", ten: "Quy định A" },
		deXuatId: null,
		coTheSoanLai: false,
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieuNguon: {
			list: {
				queryKey: () => ["taiLieuNguon.list"],
				queryOptions: () => ({
					queryKey: ["taiLieuNguon.list"],
					queryFn: async () => ({ rows: NGUON.map(hangNguon) }),
				}),
			},
			soanLai: {
				mutationOptions: (tuy: Record<string, never> = {}) => ({
					...tuy,
					mutationKey: ["taiLieuNguon.soanLai"],
					mutationFn: async () => ({ ok: true as const }),
				}),
			},
		},
	}),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {},
		replace: () => {},
		refresh: () => {},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/tai-lieu",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));

const { ConfidenceIndicator, PaceIndicator } = await import(
	"@crm/ui/components/okr-status"
);
const { KaraSteps } = await import("@crm/ui/components/kara/steps");
const { AttendeeList } = await import("@crm/ui/components/attendee-list");
const { BangNguon } = await import("@/app/(app)/[slug]/tai-lieu/bang-nguon");

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(async () => {
	await act(async () => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

const nhip = () => new Promise((r) => setTimeout(r, 30));

async function dung(nut: ReactNode): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	await act(async () => {
		root?.render(
			<QueryClientProvider client={qc}>
				<LocaleProvider locale="vi">
					<TooltipProvider delayDuration={0}>{nut}</TooltipProvider>
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	for (let i = 0; i < 4; i += 1)
		await act(async () => {
			await nhip();
		});
	return khung;
}

function tone(goc: ParentNode | null): string | null {
	return (
		goc
			?.querySelector(
				'[data-slot="status-indicator"], [data-slot="indicator-dot"]',
			)
			?.getAttribute("data-tone") ?? null
	);
}

function ghim(that: string | null, mong: string, ten: string): void {
	if (that !== mong)
		throw new Error(`mtc-dom: ${ten} data-tone ${that}, ky vong ${mong}`);
}

const TU_TIN = { cao: "success", vua: "warning", thap: "error" } as const;
const NHIP = {
	"dung-nhip": "success",
	"cham-nhip": "warning",
	truot: "error",
	"chua-co-ky-vong": "neutral",
	"moc-xong": "success",
	"moc-chua": "neutral",
} as const;
const BUOC = {
	done: ["xong", "success"],
	running: ["dang-chay", "info"],
	error: ["loi", "error"],
	unsaved: ["chua-luu", "warning"],
	skipped: ["bo-qua", "neutral"],
} as const;
const PHAN_HOI = {
	accepted: "success",
	declined: "error",
	tentative: "warning",
	needsAction: "neutral",
} as const;
const MAU_NGUON = {
	CHO_DOC: "info",
	CHO_SOAN: "info",
	DANG_SOAN: "info",
	DA_SOAN: "success",
	CAN_GO_TAY: "warning",
	LOI: "error",
} as const satisfies Record<TrangThaiNguon, string>;

describe("mtc-dom", () => {
	test("ma tran 24 o: cham tren DOM mang mau cua nghia", async () => {
		let dem = 0;
		for (const [muc, mau] of Object.entries(TU_TIN)) {
			const g = await dung(
				<ConfidenceIndicator level={muc as keyof typeof TU_TIN} />,
			);
			ghim(tone(g), mau, `tu-tin ${muc}`);
			dem += 1;
			await act(async () => root?.unmount());
		}
		for (const [pace, mau] of Object.entries(NHIP)) {
			const g = await dung(<PaceIndicator pace={pace as keyof typeof NHIP} />);
			ghim(tone(g), mau, `nhip ${pace}`);
			dem += 1;
			await act(async () => root?.unmount());
		}
		for (const [state, [dau, mau]] of Object.entries(BUOC)) {
			const g = await dung(
				<KaraSteps
					steps={[
						{ id: "b1", label: "Bước đo", state: state as keyof typeof BUOC },
						{ id: "b2", label: "Bước mở khung", state: "running" },
					]}
				/>,
			);
			const muc =
				state === "running"
					? g.querySelector('[data-trang-thai="dang-chay"]')
					: g.querySelector(`[data-trang-thai="${dau}"]`);
			ghim(tone(muc), mau, `kara ${state}`);
			dem += 1;
			await act(async () => root?.unmount());
		}
		for (const [phanHoi, mau] of Object.entries(PHAN_HOI)) {
			const g = await dung(
				<AttendeeList
					attendees={[
						{
							email: "ha@vi.du",
							name: "Hà",
							responseStatus: phanHoi,
							isOrganizer: false,
						},
					]}
				/>,
			);
			const kich = g.querySelector('[data-slot="tooltip-trigger"]');
			if (!(kich instanceof HTMLElement))
				throw new Error("mtc-dom: khong thay nut mo tooltip nguoi du");
			await act(async () => {
				kich.dispatchEvent(
					new window.PointerEvent("pointermove", {
						bubbles: true,
						pointerType: "mouse",
					}),
				);
				kich.dispatchEvent(new window.FocusEvent("focusin", { bubbles: true }));
				await nhip();
			});
			ghim(tone(document.body), mau, `nguoi-du ${phanHoi}`);
			dem += 1;
			await act(async () => root?.unmount());
			document.body.innerHTML = "";
		}
		const g = await dung(<BangNguon />);
		for (const trangThai of NGUON) {
			const hang = [...g.querySelectorAll("tr")].find((tr) =>
				tr.textContent?.includes(`tep-${trangThai}.docx`),
			);
			ghim(tone(hang ?? null), MAU_NGUON[trangThai], `bang-nguon ${trangThai}`);
			dem += 1;
		}
		expect(dem).toBe(24);
	});
});
