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
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { keHoachNoiMessages } = await import("@/lib/messages/ke-hoach-noi");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");

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

let san: { o: HTMLElement; root: Root } | null = null;

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
					<LocaleProvider locale="vi">{man}</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
}

async function dongSan(): Promise<void> {
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
}

afterEach(dongSan);

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

const kChuyen = keHoachNoiMessages("vi").chuyen;
const HUONG = { userId: "u-huong", name: "Hương Lê" };

describe("vc-man-chuyen", () => {
	test("vc-man-chuyen: hộp nêu «3 việc» cạnh số kế hoạch; preview 0 việc thì không in dòng việc", async () => {
		for (const [viec, coDong] of [
			[3, true],
			[0, false],
		] as const) {
			traLoi.set("onboarding.transferPreview", () => ({
				keHoach: 1,
				buoc: 0,
				viec,
			}));
			traLoi.set("onboarding.nguoiNhanViec", () => BA);
			await mo(<ChuyenViecDialog nguoi={HUONG} onDong={() => {}} />);
			const moTa = () =>
				document.body.querySelector('[data-slot="dialog-description"]')
					?.textContent ?? "";
			await cho(() => moTa().includes(HUONG.name), "mo ta co ten");
			const dong = document.body.querySelector("[data-dong-viec]");
			if (
				coDong &&
				!(dong?.textContent ?? "").includes(dien(kChuyen.soViec, { n: "3" }))
			) {
				throw new Error("vc: hop chuyen viec thieu so viec");
			}
			if (coDong && !moTa().includes("3 việc")) {
				throw new Error("vc: hop chuyen viec thieu so viec");
			}
			if (!coDong && dong !== null) {
				throw new Error("vc: hop chuyen viec in dong rong");
			}
			expect(moTa()).toContain(
				dien(kChuyen.coViec, { ten: HUONG.name, keHoach: "1", buoc: "0" }),
			);
			await dongSan();
		}
	});
});
