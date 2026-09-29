import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	test,
} from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json };

type DauVao = Json | undefined;

type LoiGoi = { duong: string; dauVao: DauVao };

type Lay = (dauVao: DauVao) => Json;

let daGoi: LoiGoi[] = [];
const duLieu = new Map<string, Lay>();

function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

function thuTuc(duong: string) {
	const doc = (v: DauVao): Json => {
		daGoi.push({ duong, dauVao: v });
		const lay = duLieu.get(duong);
		return lay ? lay(v) : null;
	};
	return {
		queryKey: (v?: DauVao) => (v === undefined ? [duong] : [duong, v]),
		pathKey: () => [duong],
		queryOptions: (v?: DauVao, chon?: { enabled?: boolean }) => ({
			...chon,
			queryKey: [duong, v],
			queryFn: async () => doc(v),
		}),
		mutationOptions: (chon?: {
			onSuccess?: (kq: Json, v: DauVao) => void;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (v: DauVao) => doc(v) ?? { id: "ok" },
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
				get: (_g, _ten: string) => async () => {},
			},
		),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws",
}));

const { MembersTable } = await import(
	"@/app/(app)/[slug]/settings/members/members-table"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { keHoachNoiMessages } = await import("@/lib/messages/ke-hoach-noi");
const { okrMessages } = await import("@/lib/messages/okr");
const { ChuyenOkrDialog } = await import(
	"@/app/(app)/[slug]/settings/members/chuyen-okr-dialog"
);
const { dien } = await import("@/components/crm/record-sheet/plan-copy");

const k = keHoachNoiMessages("vi").chuyen;
const kOkr = okrMessages("vi").chuyen;

const THANH_VIEN = [
	{ id: "m-h", userId: "u-h", name: "Huong Le" },
	{ id: "m-t", userId: "u-t", name: "Tuan Do" },
	{ id: "m-k", userId: "u-k", name: "Kim Anh" },
];

function datThanhVien(
	canManage: boolean,
	xemTruoc: { kr: number; mucTieu: number; viec: number },
) {
	dat("workspace.get", () => ({
		id: "ws",
		name: "OneHub",
		slug: "ws",
		viewerRole: "admin",
		canRename: true,
		canChangeRoles: false,
		canManageMembers: true,
		canIssuePasswordLink: false,
	}));
	dat("workspace.members", () => ({
		rows: THANH_VIEN.map((n) => ({
			...n,
			email: `${n.userId}@thu.test`,
			image: null,
			role: "member",
			joinedAt: "2026-09-01T00:00:00.000Z",
			isViewer: false,
			passwordLinkIssuedAt: null,
			passwordLinkIssuedByName: null,
		})),
		total: THANH_VIEN.length,
		facetCounts: { role: { member: 3 } },
	}));
	dat("onboarding.access", () => ({ canManage }));
	dat("onboarding.transferPreview", () => ({ keHoach: 0, buoc: 0 }));
	dat("okr.transferPreview", () => xemTruoc);
	dat("okr.thanhVien", () =>
		THANH_VIEN.map((n) => ({
			id: n.userId,
			name: n.name,
			email: `${n.userId}@thu.test`,
		})),
	);
}

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(man: ReactElement): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams="">
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
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

async function moMenuCua(ten: string): Promise<void> {
	await cho(
		() => document.body.textContent?.includes(ten) === true,
		`hang ${ten}`,
	);
	const hang = [...document.body.querySelectorAll("tr")].find((r) =>
		r.textContent?.includes(ten),
	);
	const trigger = hang?.querySelector('[aria-haspopup="menu"]');
	if (!trigger) throw new Error(`khong thay nut menu cua ${ten}`);
	await bam(trigger);
	await cho(
		() => document.body.querySelector('[role="menu"]') !== null,
		"menu mo",
	);
}

function mucMenu(nhan: string): HTMLElement | undefined {
	return [
		...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'),
	].find((o) => o.textContent?.trim() === nhan);
}

beforeEach(() => {
	daGoi = [];
	duLieu.clear();
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

describe("chuyen-okr-man", () => {
	test("chuyen-okr-man: menu co ca hai muc, xem truoc dung so, chon T, gui dung payload okr.transferWork", async () => {
		datThanhVien(true, { kr: 2, mucTieu: 1, viec: 3 });
		await mo(<MembersTable />);
		await moMenuCua("Huong Le");

		expect(mucMenu(k.menu), "co muc Chuyen viec 30 ngay").toBeDefined();
		const muc = mucMenu(kOkr.menu);
		if (!muc) throw new Error("khong thay muc Chuyen OKR");
		await bam(muc);

		await cho(
			() => document.body.textContent?.includes("2 KR") === true,
			"hop thoai neu so KR",
		);
		const hop = document.body.querySelector('[role="dialog"]');
		if (!hop) throw new Error("khong thay hop thoai");
		expect(hop.textContent).toContain("2 KR");
		expect(hop.textContent).toContain("1 mục tiêu");
		expect(hop.textContent).toContain("3 việc chưa xong");

		const xem = daGoi.filter((g) => g.duong === "okr.transferPreview");
		expect(xem.length, "dung mot loi goi transferPreview").toBe(1);
		expect(xem[0]?.dauVao).toEqual({ fromUserId: "u-h" });

		const o = hop.querySelector(`[aria-label="${kOkr.nguoiNhan}"]`);
		if (!o) throw new Error("khong thay o nguoi nhan");
		await bam(o);
		await cho(
			() => document.body.querySelectorAll("[cmdk-item]").length > 0,
			"danh sach nguoi nhan",
		);
		const ten = [...document.body.querySelectorAll("[cmdk-item]")].map(
			(i) => i.textContent?.trim() ?? "",
		);
		expect(ten.sort(), "nguoi nhan khong co H").toEqual(["Kim Anh", "Tuan Do"]);
		const chonT = [...document.body.querySelectorAll("[cmdk-item]")].find((i) =>
			i.textContent?.includes("Tuan Do"),
		);
		if (!chonT) throw new Error("khong thay Tuan Do");
		await bam(chonT);

		await cho(() => {
			const x = [...hop.querySelectorAll("button")].find(
				(b) => b.textContent?.trim() === kOkr.xacNhan,
			);
			return x !== undefined && !x.disabled;
		}, "nut chuyen mo khoa");
		const xacNhan = [...hop.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === kOkr.xacNhan,
		);
		if (!xacNhan) throw new Error("khong thay nut chuyen");
		await bam(xacNhan);

		await cho(
			() => daGoi.some((g) => g.duong === "okr.transferWork"),
			"loi goi chuyen okr",
		);
		const chuyen = daGoi.filter((g) => g.duong === "okr.transferWork");
		expect(chuyen.length, "dung mot loi goi okr.transferWork").toBe(1);
		expect(chuyen[0]?.dauVao, "payload fromUserId/toUserId dung").toEqual({
			fromUserId: "u-h",
			toUserId: "u-t",
		});
		expect(
			daGoi.some((g) => g.duong === "onboarding.transferWork"),
			"khong goi onboarding.transferWork",
		).toBe(false);
	});

	test("chuyen-okr-man: xem truoc 0 va 0 thi cau khong phu trach va nut khoa", async () => {
		datThanhVien(true, { kr: 0, mucTieu: 0, viec: 0 });
		await mo(<MembersTable />);
		await moMenuCua("Huong Le");
		const muc = mucMenu(kOkr.menu);
		if (!muc) throw new Error("khong thay muc Chuyen OKR");
		await bam(muc);

		await cho(
			() =>
				document.body.textContent?.includes(
					"không phụ trách KR hay mục tiêu nào",
				) === true,
			"cau khong co viec",
		);
		const xacNhan = [
			...document.body.querySelectorAll<HTMLButtonElement>(
				'[role="dialog"] button',
			),
		].find((b) => b.textContent?.trim() === kOkr.xacNhan);
		expect(xacNhan?.disabled, "nut chuyen khoa khi 0 va 0").toBe(true);
	});

	test("chuyen-okr-man: chi con viec chua xong thi van co cau chuyen va o nguoi nhan", async () => {
		datThanhVien(true, { kr: 0, mucTieu: 0, viec: 2 });
		await mo(<MembersTable />);
		await moMenuCua("Huong Le");
		const muc = mucMenu(kOkr.menu);
		if (!muc) throw new Error("khong thay muc Chuyen OKR");
		await bam(muc);

		await cho(
			() => document.body.textContent?.includes("2 việc chưa xong") === true,
			"cau co viec",
		);
		const hop = document.body.querySelector('[role="dialog"]');
		expect(
			hop?.querySelector(`[aria-label="${kOkr.nguoiNhan}"]`),
			"co o nguoi nhan khi chi con viec",
		).not.toBeNull();
	});

	test("chuyen-okr-man: doi chung am — khong co quyen thi khong co muc nao trong hai muc chuyen", async () => {
		datThanhVien(false, { kr: 2, mucTieu: 1, viec: 3 });
		await mo(<MembersTable />);
		await moMenuCua("Huong Le");
		await nghi(5);
		expect(mucMenu(k.menu), "khong co muc chuyen viec").toBeUndefined();
		expect(mucMenu(kOkr.menu), "khong co muc chuyen OKR").toBeUndefined();
	});
});

const SO_CA_KHOA_RIENG = 6;
const KHOA_RIENG: ["vi" | "en", number, number, number][] = [
	["vi", 2, 1, 3],
	["vi", 0, 0, 2],
	["vi", 0, 0, 0],
	["en", 2, 1, 3],
	["en", 0, 0, 2],
	["en", 0, 0, 0],
];

describe("chuyen-okr-khoa-rieng", () => {
	let daChay = 0;
	const goc = console.error;
	let daGhi: string[] = [];

	beforeEach(() => {
		daGhi = [];
		console.error = (...doiSo: unknown[]) => {
			daGhi.push(doiSo.map(String).join(" "));
		};
	});

	afterEach(() => {
		console.error = goc;
	});

	afterAll(() => {
		expect(
			daChay,
			`nhom chuyen-okr-khoa-rieng chay ${daChay} ca, phai ${SO_CA_KHOA_RIENG}`,
		).toBe(SO_CA_KHOA_RIENG);
	});

	test.each(KHOA_RIENG)(
		"chuyen-okr-khoa-rieng: %s %i KR / %i muc tieu / %i viec",
		async (locale, kr, mucTieu, viec) => {
			daChay += 1;
			const tenCa = `${locale} ${kr}/${mucTieu}/${viec}`;
			const kc = okrMessages(locale).chuyen;
			datThanhVien(true, { kr, mucTieu, viec });
			const o = document.createElement("div");
			document.body.appendChild(o);
			const root = createRoot(o);
			dangMo.push({ o, root });
			const client = new QueryClient({
				defaultOptions: { queries: { retry: false } },
			});
			await act(async () => {
				root.render(
					<QueryClientProvider client={client}>
						<LocaleProvider locale={locale}>
							<ChuyenOkrDialog
								nguoi={{ userId: "u-h", name: "Huong Le" }}
								onDong={() => {}}
							/>
						</LocaleProvider>
					</QueryClientProvider>,
				);
			});
			const moTa = () =>
				document.body.querySelector<HTMLElement>(
					'[data-slot="dialog-description"]',
				);
			await cho(
				() => (moTa()?.textContent ?? "").includes("Huong Le"),
				`mo ta co ten o ${tenCa}`,
			);
			await nghi(5);

			const ten = "Huong Le";
			const kyVong =
				kr > 0 || mucTieu > 0 || viec > 0
					? dien(kc.coViec, {
							ten,
							kr: String(kr),
							mucTieu: String(mucTieu),
							viec: String(viec),
						})
					: dien(kc.khongViec, { ten });
			expect(
				daGhi.filter((d) => d.includes("same key")),
				`khoa trung o ${tenCa}`,
			).toEqual([]);
			expect(
				document.body.querySelector('[data-slot="dialog-title"]')?.textContent,
				`tieu de sai o ${tenCa}`,
			).toBe(dien(kc.tieuDe, { ten }));
			expect(moTa()?.textContent, `mo ta sai o ${tenCa}`).toBe(kyVong);
			expect(
				[...(moTa()?.querySelectorAll('[translate="no"]') ?? [])].map(
					(n) => n.textContent,
				),
				`ten khong khoa dich o ${tenCa}`,
			).toContain(ten);
		},
	);
});
