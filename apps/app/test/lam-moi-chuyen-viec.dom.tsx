import { afterEach, describe, expect, mock, test } from "bun:test";
import {
	type InvalidateQueryFilters,
	QueryClient,
	QueryClientProvider,
	type QueryKey,
} from "@tanstack/react-query";
import { createTRPCClient, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

type TraLoi = () => unknown;

const traLoi = new Map<string, TraLoi>();
let daGoi: { duong: string; dauVao: unknown }[] = [];

const linkGia: TRPCLink<AppRouter> =
	() =>
	({ op }) =>
		observable((nguoiXem) => {
			daGoi.push({ duong: op.path, dauVao: op.input });
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

const { ChuyenViecDialog } = await import(
	"@/app/(app)/[slug]/settings/members/chuyen-viec-dialog"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { keHoachNoiMessages } = await import("@/lib/messages/ke-hoach-noi");

const k = keHoachNoiMessages("vi").chuyen;
const HUONG = { userId: "u-h", name: "Huong Le" };
const NGUOI = [
	{ id: "u-h", name: "Huong Le", email: "u-h@thu.test", image: null },
	{ id: "u-t", name: "Tuan Do", email: "u-t@thu.test", image: null },
];

let daLamMoi: QueryKey[] = [];
let lanDong = 0;
let san: { o: HTMLElement; root: Root } | null = null;

function dungQueryClient(): QueryClient {
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const goc = qc.invalidateQueries.bind(qc);
	qc.invalidateQueries = ((bo?: InvalidateQueryFilters) => {
		if (bo?.queryKey) daLamMoi.push(bo.queryKey);
		return goc(bo);
	}) as QueryClient["invalidateQueries"];
	return qc;
}

type KhoaCoTen = { ten: string; khoa: QueryKey };

function khoaKhongLienQuan(): KhoaCoTen[] {
	const t = proxy();
	return [
		{
			ten: "onboarding.planById",
			khoa: t.onboarding.planById.queryKey({ id: "P1" }),
		},
		{
			ten: "onboarding.listSteps",
			khoa: t.onboarding.listSteps.queryKey({ planId: "P1" }),
		},
		{
			ten: "onboarding.listEnrollments",
			khoa: t.onboarding.listEnrollments.queryKey({ id: "P1" }),
		},
		{ ten: "activities.myTasks", khoa: t.activities.myTasks.queryKey() },
		{ ten: "companies.byId", khoa: t.companies.byId.queryKey({ id: "ct-1" }) },
	];
}

function khoaLienQuan(): KhoaCoTen[] {
	const t = proxy();
	return [
		{
			ten: "onboarding.manDanhMuc 25",
			khoa: t.onboarding.manDanhMuc.queryKey({ pageSize: 25 }),
		},
		{
			ten: "onboarding.manDanhMuc 50",
			khoa: t.onboarding.manDanhMuc.queryKey({ pageSize: 50 }),
		},
		{
			ten: "onboarding.bangCot",
			khoa: t.onboarding.bangCot.queryKey({ pageSize: 25 }),
		},
	];
}

async function mo(): Promise<void> {
	daLamMoi = [];
	daGoi = [];
	lanDong = 0;
	queryClient = dungQueryClient();
	for (const { khoa } of [...khoaLienQuan(), ...khoaKhongLienQuan()]) {
		queryClient.setQueryData(khoa, { gieo: true });
	}
	traLoi.set("users.list", () => NGUOI);
	traLoi.set("onboarding.nguoiNhanViec", () => NGUOI);
	traLoi.set("onboarding.transferPreview", () => ({ keHoach: 2, buoc: 3 }));
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	san = { o, root };
	await act(async () => {
		root.render(
			<QueryClientProvider client={queryClient}>
				<LocaleProvider locale="vi">
					<ChuyenViecDialog
						nguoi={HUONG}
						onDong={() => {
							lanDong += 1;
						}}
					/>
				</LocaleProvider>
			</QueryClientProvider>,
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

function nutXacNhan(): HTMLButtonElement | undefined {
	return [
		...document.body.querySelectorAll<HTMLButtonElement>(
			'[role="dialog"] button',
		),
	].find((b) => b.textContent?.trim() === k.xacNhan);
}

async function chonTuanRoiBam(): Promise<void> {
	await cho(
		() => document.body.textContent?.includes("2 kế hoạch") === true,
		"hop thoai neu so",
	);
	const o = document.body.querySelector(`[aria-label="${k.nguoiNhan}"]`);
	if (!o) throw new Error("khong thay o nguoi nhan");
	await bam(o);
	await cho(
		() => document.body.querySelectorAll("[cmdk-item]").length > 0,
		"danh sach nguoi nhan",
	);
	const tuan = [...document.body.querySelectorAll("[cmdk-item]")].find((i) =>
		i.textContent?.includes("Tuan Do"),
	);
	if (!tuan) throw new Error("khong thay Tuan Do");
	await bam(tuan);
	await cho(() => nutXacNhan()?.disabled === false, "nut chuyen mo khoa");
	const nut = nutXacNhan();
	if (!nut) throw new Error("khong thay nut chuyen");
	await bam(nut);
}

function soLan(duong: string): number {
	return daGoi.filter((g) => g.duong === duong).length;
}

function baKhoa(): QueryKey[] {
	const t = proxy();
	return [
		t.onboarding.manDanhMuc.queryKey(),
		t.onboarding.bangCot.queryKey(),
		t.onboarding.transferPreview.queryKey(),
	];
}

function sapXep(khoa: QueryKey[]): string[] {
	return khoa.map((x) => JSON.stringify(x)).sort();
}

describe("ba-khoa", () => {
	test("ba-khoa: chuyen thanh cong lam moi dung ba khoa, khong dung query khac", async () => {
		await mo();
		traLoi.set("onboarding.transferWork", () => ({ keHoach: 2, buoc: 3 }));
		await chonTuanRoiBam();
		await cho(() => lanDong === 1, "lenh dong hop");

		expect(sapXep(daLamMoi), "Expected dung ba khoa lam moi").toEqual(
			sapXep(baKhoa()),
		);
		for (const { ten, khoa } of khoaLienQuan()) {
			expect(
				queryClient.getQueryState(khoa)?.isInvalidated,
				`${ten} bi danh dau cu`,
			).toBe(true);
		}
		expect(
			soLan("onboarding.transferPreview"),
			"transferPreview tai them dung mot lan",
		).toBe(2);
		for (const { ten, khoa } of khoaKhongLienQuan()) {
			expect(
				queryClient.getQueryState(khoa)?.isInvalidated,
				`${ten} khong bi danh dau cu`,
			).toBe(false);
		}
		const chuyen = daGoi.filter((g) => g.duong === "onboarding.transferWork");
		expect(
			chuyen.map((g) => g.dauVao),
			"dung mot loi goi transferWork",
		).toEqual([{ fromUserId: "u-h", toUserId: "u-t" }]);
	});
});

describe("dong-sau-lam-moi", () => {
	test("dong-sau-lam-moi: tai lai xem truoc chua xong thi hop chua dong, xong thi dong", async () => {
		await mo();
		traLoi.set("onboarding.transferWork", () => ({ keHoach: 2, buoc: 3 }));
		let tha: () => void = () => {};
		const giu = new Promise<void>((r) => {
			tha = r;
		});
		traLoi.set("onboarding.transferPreview", async () => {
			if (soLan("onboarding.transferPreview") > 1) await giu;
			return { keHoach: 2, buoc: 3 };
		});
		await chonTuanRoiBam();
		await cho(
			() => soLan("onboarding.transferWork") === 1 && daLamMoi.length === 3,
			"chuyen va ba loi goi lam moi",
		);
		for (let i = 0; i < 20; i += 1) await nhip();
		expect(lanDong, "hop dong truoc khi lam moi xong").toBe(0);
		expect(
			document.body.querySelector('[role="dialog"]'),
			"hop dong truoc khi lam moi xong",
		).not.toBeNull();

		tha();
		await cho(() => lanDong === 1, "doi chung duong: tha tai lai thi hop dong");
	});
});

describe("loi-khong-lam-moi", () => {
	test("loi-khong-lam-moi: loi thi khong lam moi, lan hai thanh cong thi lam moi ba khoa", async () => {
		await mo();
		const CAU_LOI = "Nguoi nhan khong con trong khong gian";
		traLoi.set("onboarding.transferWork", () => {
			throw new Error(CAU_LOI);
		});
		await chonTuanRoiBam();
		await cho(
			() =>
				document.body
					.querySelector('[role="dialog"] [role="alert"]')
					?.textContent?.includes(CAU_LOI) === true,
			"cau loi trong hop",
		);
		for (let i = 0; i < 10; i += 1) await nhip();
		expect(daLamMoi.length, "khong lam moi khi loi").toBe(0);
		expect(lanDong, "hop khong dong khi loi").toBe(0);
		expect(
			document.body.querySelector('[role="dialog"]'),
			"hop van mo khi loi",
		).not.toBeNull();

		traLoi.set("onboarding.transferWork", () => ({ keHoach: 2, buoc: 3 }));
		await cho(() => nutXacNhan()?.disabled === false, "nut chuyen mo lai");
		const nut = nutXacNhan();
		if (!nut) throw new Error("khong thay nut chuyen");
		await bam(nut);
		await cho(() => lanDong === 1, "lan hai thanh cong thi hop dong");
		expect(
			sapXep(daLamMoi),
			"bo ghi con song: lan hai thanh cong phai co 3 loi goi",
		).toEqual(sapXep(baKhoa()));
	});
});
