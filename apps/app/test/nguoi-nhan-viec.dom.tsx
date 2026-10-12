import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	createElement as h,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

const traLoi = new Map<string, () => unknown>();

const linkGia: TRPCLink<AppRouter> =
	() =>
	({ op }) =>
		observable((nguoiXem) => {
			const lay = traLoi.get(op.path);
			Promise.resolve()
				.then(() => (lay ? lay() : null))
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
const proxy = () =>
	createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient });

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => proxy() }));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/onboarding",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({ href, children }: { href: string; children: ReactNode }) =>
		h("a", { href }, children),
}));

const { ChuyenViecDialog } = await import(
	"@/app/(app)/[slug]/settings/members/chuyen-viec-dialog"
);
const { TaoKeHoach } = await import(
	"@/app/(app)/[slug]/onboarding/tao-ke-hoach"
);
const { PlanSteps } = await import("@/components/crm/record-sheet/plan-steps");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { keHoachNoiMessages } = await import("@/lib/messages/ke-hoach-noi");
const { onboardingMessages } = await import("@/lib/messages/onboarding");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");

type PlanDetail = Parameters<typeof PlanSteps>[0]["plan"];

const kChuyen = keHoachNoiMessages("vi").chuyen;
const mOnb = onboardingMessages("vi");

const nguoiCo = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@thu.test`,
	image: null,
});

const BA = [
	nguoiCo("u-chu", "Chủ"),
	nguoiCo("u-qt", "Quản trị"),
	nguoiCo("u-tv", "Thành viên"),
];
const NAM = [
	...BA,
	nguoiCo("u-okr", "Người OKR"),
	nguoiCo("u-ngoai", "Người Ngoài"),
];
const TEN_BA = BA.map((u) => u.name).sort();

let san: { o: HTMLElement; root: Root } | null = null;

function datChung(): void {
	traLoi.set("onboarding.nguoiNhanViec", () => BA);
	traLoi.set("users.list", () => NAM);
	traLoi.set("users.me", () => nguoiCo("u-chu", "Chủ"));
}

async function mo(man: ReactElement): Promise<void> {
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
		await act(async () => {
			root.unmount();
		});
		o.remove();
	}
	san = null;
	traLoi.clear();
	document.body.innerHTML = "";
});

async function nhip(): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 200; vong += 1) {
		if (xong()) return;
		await nhip();
	}
	throw new Error(
		`khong toi trang thai ${moTa} — noi dung: ${document.body.textContent?.slice(0, 400)}`,
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

function tenTrong(chon: string): string[] {
	return [...document.body.querySelectorAll(chon)]
		.map((i) => i.textContent?.trim() ?? "")
		.filter((t) => t !== "");
}

function soSanh(o: string, thay: string[], mong: string[]): void {
	const sapThay = [...thay].sort();
	if (JSON.stringify(sapThay) !== JSON.stringify(mong)) {
		const la = sapThay.find((t) => !mong.includes(t)) ?? sapThay.join(",");
		throw new Error(`vlr: o chon ${o} liet ke sai ${la}`);
	}
}

const BUOC_CHUA_GIAO = {
	id: "b-1",
	planId: "kh-1",
	label: "Gọi khách",
	departmentId: "bp-1",
	departmentName: "Kinh doanh",
	assigneeId: null,
	assignee: null,
	dueAt: new Date("2026-10-20T00:00:00.000Z"),
	completedAt: null,
	position: 0,
};

const BUOC_DANG_GIU = {
	...BUOC_CHUA_GIAO,
	id: "b-2",
	label: "Gửi hợp đồng",
	position: 1,
	assigneeId: "u-okr",
	assignee: { id: "u-okr", name: "Người OKR", image: null },
};

const KE_HOACH = {
	id: "kh-1",
	companyId: "ct-1",
	templateId: "k-1",
	startedAt: new Date("2026-10-01T00:00:00.000Z"),
	targetDays: 30,
	closedAt: null,
	ownerId: "u-chu",
	companyName: "Công ty A",
	company: {
		id: "ct-1",
		name: "Công ty A",
		iconUrl: null,
		iconDarkUrl: null,
		iconTone: null,
		logoUrl: null,
	},
	owner: nguoiCo("u-chu", "Chủ"),
	templateName: "Khuôn A",
} as unknown as PlanDetail;

describe("vlr-o-chon", () => {
	test("vlr-o-chon: ô người nhận ở hộp Chuyển việc chỉ liệt kê người nhận được việc", async () => {
		datChung();
		traLoi.set("onboarding.transferPreview", () => ({ keHoach: 1, buoc: 0 }));
		await mo(
			<ChuyenViecDialog
				nguoi={{ userId: "u-x", name: "Người Rời" }}
				onDong={() => {}}
			/>,
		);
		await cho(
			() =>
				document.body.querySelector(`[aria-label="${kChuyen.nguoiNhan}"]`) !==
				null,
			"o nguoi nhan",
		);
		const o = document.body.querySelector(
			`[aria-label="${kChuyen.nguoiNhan}"]`,
		);
		if (!o) throw new Error("khong thay o nguoi nhan");
		await cho(() => !(o as HTMLButtonElement).disabled, "o nguoi nhan mo khoa");
		await bam(o);
		await cho(() => tenTrong("[cmdk-item]").length > 0, "danh sach nguoi nhan");
		soSanh("chuyen-viec", tenTrong("[cmdk-item]"), TEN_BA);
	});

	test("vlr-o-chon: ô người cầm trịch khi tạo kế hoạch chỉ liệt kê người nhận được việc", async () => {
		datChung();
		traLoi.set("onboarding.listTemplates", () => []);
		await mo(<TaoKeHoach nhanNut="Tạo kế hoạch" mo doiMo={() => {}} />);
		await cho(
			() =>
				document.body.querySelector(
					`[aria-label="${mOnb.tao.keHoach.owner}"]`,
				) !== null,
			"o nguoi cam trich",
		);
		await cho(() => queryClient.isFetching() === 0, "tai xong danh sach");
		const o = document.body.querySelector(
			`[aria-label="${mOnb.tao.keHoach.owner}"]`,
		);
		if (!o) throw new Error("khong thay o nguoi cam trich");
		await bam(o);
		await cho(
			() => tenTrong('[role="option"]').length > 0,
			"mo o nguoi cam trich",
		);
		soSanh("tao-ke-hoach", tenTrong('[role="option"]'), TEN_BA);
	});

	test("vlr-o-chon: ô người làm của bước chỉ liệt kê người nhận được việc; bước đang giữ vẫn hiện tên", async () => {
		datChung();
		traLoi.set("onboarding.listSteps", () => ({
			rows: [BUOC_CHUA_GIAO, BUOC_DANG_GIU],
			total: 2,
		}));
		traLoi.set("onboarding.listDepartments", () => []);
		await mo(<PlanSteps plan={KE_HOACH} />);
		const nhanChuaGiao = dien(mOnb.sheet.assignTo, {
			nhan: BUOC_CHUA_GIAO.label,
		});
		const nhanDangGiu = dien(mOnb.sheet.assignTo, {
			nhan: BUOC_DANG_GIU.label,
		});
		await cho(
			() =>
				document.body.querySelector(`[aria-label="${nhanDangGiu}"]`) !== null,
			"o nguoi lam",
		);
		await cho(() => queryClient.isFetching() === 0, "tai xong danh sach");
		const dangGiu = document.body.querySelector(
			`[aria-label="${nhanDangGiu}"]`,
		);
		if (!dangGiu?.textContent?.includes("Người OKR")) {
			throw new Error("vlr: o chon mat ten nguoi dang giu");
		}
		const chuaGiao = document.body.querySelector(
			`[aria-label="${nhanChuaGiao}"]`,
		);
		if (!chuaGiao) throw new Error("khong thay o nguoi lam chua giao");
		await bam(chuaGiao);
		await cho(() => tenTrong("[cmdk-item]").length > 0, "danh sach nguoi lam");
		soSanh("nguoi-lam", tenTrong("[cmdk-item]"), TEN_BA);
		expect(tenTrong("[cmdk-item]").length).toBe(3);
	});
});
