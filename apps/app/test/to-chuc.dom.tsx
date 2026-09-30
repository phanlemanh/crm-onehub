import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	ImportPreviewOutput,
	TreeOutput,
} from "../../api/src/to-chuc/to-chuc.contracts";
import { TO_CHUC } from "../../api/src/to-chuc/to-chuc-config";

const nguoi = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@onehub.vn`,
});
const LAN = nguoi("lan", "Nguyễn Thị Lan");
const HUNG = nguoi("hung", "Trần Văn Hùng");
const MAI = nguoi("mai", "Lê Thanh Mai");
const THAO = nguoi("thao", "Võ Phương Thảo");
const TUAN = nguoi("tuan", "Hoàng Quốc Tuấn");
const QUAN = nguoi("quan", "Phan Minh Quân");

function cayMau(): TreeOutput {
	const pb1 = {
		id: "pb-1",
		name: "Kinh doanh vùng 1",
		moTa: "",
		position: 0,
		divisionId: "bp-kd",
		head: HUNG,
		stepCount: 3,
		okrMo: 0,
		people: [
			{ ...HUNG, primary: true },
			{ ...MAI, primary: true },
		],
	};
	const cskh = {
		id: "pb-cskh",
		name: "Chăm sóc khách hàng",
		moTa: "",
		position: 0,
		divisionId: "bp-vh",
		head: null,
		stepCount: 1,
		okrMo: 0,
		people: [
			{ ...THAO, primary: true },
			{ ...MAI, primary: false },
		],
	};
	const kho = {
		id: "pb-kho",
		name: "Kho vận",
		moTa: "",
		position: 1,
		divisionId: "bp-vh",
		head: null,
		stepCount: 0,
		okrMo: 0,
		people: [{ ...TUAN, primary: true }],
	};
	const pc = {
		id: "pb-pc",
		name: "Pháp chế",
		moTa: "",
		position: 0,
		divisionId: null,
		head: null,
		stepCount: 0,
		okrMo: 0,
		people: [],
	};
	const viTri = (
		n: typeof LAN,
		chinh: string | null,
		phu: string[],
		quanLy: typeof LAN | null,
		nguon: TreeOutput["people"][number]["managerSource"],
		tay: string | null = null,
	) => ({
		...n,
		primaryDepartmentId: chinh,
		secondaryDepartmentIds: phu,
		managerOverrideId: tay,
		manager: quanLy,
		managerSource: nguon,
		chucDanh: "",
	});
	return {
		divisions: [
			{
				id: "bp-kd",
				name: "Kinh doanh",
				moTa: "",
				position: 0,
				head: LAN,
				okrMo: 0,
				departments: [pb1],
			},
			{
				id: "bp-vh",
				name: "Vận hành",
				moTa: "",
				position: 1,
				head: null,
				okrMo: 0,
				departments: [cskh, kho],
			},
		],
		chuaXep: [pc],
		chuaCoPhongBan: [LAN, QUAN],
		people: [
			viTri(HUNG, "pb-1", [], LAN, "truong-bo-phan"),
			viTri(MAI, "pb-1", ["pb-cskh"], HUNG, "truong-phong-ban"),
			viTri(THAO, "pb-cskh", [], LAN, "chon-tay", "lan"),
			viTri(TUAN, "pb-kho", [], null, "khong-co"),
			viTri(LAN, null, [], null, "khong-co"),
			viTri(QUAN, null, [], null, "khong-co"),
		],
		archived: {
			divisions: [],
			departments: [
				{ id: "pb-cu", name: "Marketing (cũ)", okrMo: 0, purgeable: true },
			],
		},
		coverage: { members: 7, withPrimary: 5, departmentsWithoutHead: 2 },
	};
}

const LOI = "may chu tu choi thao tac nay";
let cay: TreeOutput = cayMau();
let quyen = true;
let cheDo = new Map<string, string>();
let daGoi: { ten: string; dauVao: unknown }[] = [];
let duongGoi: string[] = [];
let xemTruoc: ImportPreviewOutput | null = null;

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined };
type ChonGhi = {
	onSuccess?: (...a: never[]) => void;
	onError?: (e: Error) => void;
	onSettled?: () => void;
};

function viet(ten: string, router: string) {
	return async (dauVao: DauVao) => {
		daGoi.push({ ten, dauVao: JSON.parse(JSON.stringify(dauVao)) });
		duongGoi.push(`${router}.${ten}`);
		const cd = cheDo.get(ten);
		if (cd !== undefined) throw new Error(cd === "loi" ? LOI : cd);
		if (ten === "previewImport") return xemTruoc;
		return { id: `${ten}-ok`, written: 4, newDepartments: 0, newDivisions: 0 };
	};
}

function thuTuc<TRa>(ten: string, doc: () => TRa, router = "org") {
	return {
		queryKey: () => [ten],
		queryOptions: () => ({ queryKey: [ten], queryFn: async () => doc() }),
		mutationOptions: (chon: ChonGhi = {}) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: viet(ten, router),
		}),
	};
}

const GHI_CU = [
	"createDepartment",
	"updateDepartment",
	"reorderDepartments",
	"archiveDepartment",
	"restoreDepartment",
	"purgeDepartment",
] as const;

const khongDoc = () => {
	throw new Error("khong doc thu tuc nay");
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		org: {
			tree: thuTuc("tree", () => cay),
			access: thuTuc("access", () => ({ canManage: quyen })),
			createDivision: thuTuc("createDivision", khongDoc),
			renameDivision: thuTuc("renameDivision", khongDoc),
			reorderDivisions: thuTuc("reorderDivisions", khongDoc),
			archiveDivision: thuTuc("archiveDivision", khongDoc),
			restoreDivision: thuTuc("restoreDivision", khongDoc),
			purgeDivision: thuTuc("purgeDivision", khongDoc),
			createDepartment: thuTuc("createDepartment", khongDoc),
			renameDepartment: thuTuc("renameDepartment", khongDoc),
			moveDepartment: thuTuc("moveDepartment", khongDoc),
			setHead: thuTuc("setHead", khongDoc),
			setPlacement: thuTuc("setPlacement", khongDoc),
			previewImport: thuTuc("previewImport", khongDoc),
			applyImport: thuTuc("applyImport", khongDoc),
			luuTruXemTruoc: thuTuc("luuTruXemTruoc", () => ({ lyDo: [] })),
			archiveDepartment: thuTuc("archiveDepartment", khongDoc),
			restoreDepartment: thuTuc("restoreDepartment", khongDoc),
			purgeDepartment: thuTuc("purgeDepartment", khongDoc),
		},
		onboarding: {
			listDepartments: thuTuc("listDepartments", () => [], "onboarding"),
			manDanhMuc: thuTuc("manDanhMuc", () => null, "onboarding"),
			...Object.fromEntries(
				GHI_CU.map((ten) => [ten, thuTuc(ten, khongDoc, "onboarding")]),
			),
		},
	}),
}));

const { ToChuc } = await import(
	"@/app/(app)/[slug]/settings/organization/to-chuc"
);
const { HanhDongToChuc } = await import(
	"@/app/(app)/[slug]/settings/organization/hanh-dong-dau-trang"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { Toaster } = await import("@crm/ui/components/sonner");
const { toChucMessages } = await import("@/lib/messages/to-chuc");
const { toast } = await import("sonner");

const m = toChucMessages("vi");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(man: ReactElement, don = ""): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter searchParams={don} hasMemory>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							<div data-slot="page-shell-actions">
								<HanhDongToChuc />
							</div>
							{man}
							<Toaster />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
	dangMo.push(san);
	await cho(() => !o.textContent?.includes(m.loading), "tai xong");
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
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 400)}`,
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
			const Ev =
				loai.startsWith("pointer") && "PointerEvent" in globalThis
					? PointerEvent
					: MouseEvent;
			o.dispatchEvent(
				new Ev(loai, { bubbles: true, cancelable: true, button: 0 }),
			);
		}
	});
}

function nutCo(goc: ParentNode, chu: string): boolean {
	return [...goc.querySelectorAll("button:not(:disabled)")].some((b) =>
		b.textContent?.trim().startsWith(chu),
	);
}

function nut(chu: string, goc: ParentNode = document.body): HTMLButtonElement {
	const tim = [...goc.querySelectorAll("button")].find((b) =>
		b.textContent?.trim().startsWith(chu),
	);
	if (!tim) throw new Error(`khong thay nut "${chu}"`);
	return tim;
}

function hopThoai(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>('[role="dialog"]');
}

function dauVaoCuoi(ten: string): unknown {
	return [...daGoi].reverse().find((g) => g.ten === ten)?.dauVao;
}

async function moMenu(ten: string): Promise<void> {
	const nhan = m.menu.replace("{ten}", ten);
	const trigger = [...document.body.querySelectorAll("button")].find(
		(b) => b.querySelector(".sr-only")?.textContent === nhan,
	);
	if (!trigger) throw new Error(`khong thay menu cua ${ten}`);
	await bam(trigger);
	await cho(
		() => document.body.querySelectorAll('[role="menuitem"]').length > 0,
		`menu ${ten}`,
	);
}

async function chonMuc(chu: string): Promise<void> {
	const muc = [...document.body.querySelectorAll('[role="menuitem"]')].find(
		(x) => x.textContent?.trim() === chu,
	);
	if (!muc) throw new Error(`menu khong co "${chu}"`);
	await bam(muc);
}

beforeEach(() => {
	cay = cayMau();
	quyen = true;
	cheDo = new Map();
	daGoi = [];
	duongGoi = [];
	xemTruoc = null;
});

afterEach(async () => {
	await act(async () => {
		toast.dismiss();
	});
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

const BON_NUT = (o: HTMLElement) => [
	nutCo(o, m.themBoPhan),
	nutCo(o, m.nhap),
	[...o.querySelectorAll("button:not(:disabled) .sr-only")].some((s) =>
		s.textContent?.startsWith("Thao tác với"),
	),
	o.querySelectorAll('[aria-haspopup="dialog"][data-nguoi]:not(:disabled)')
		.length > 0,
];

describe("chi-doc", () => {
	test("chi-doc: thanh vien thuong thay cay va do phu, khong co nut sua nao", async () => {
		quyen = false;
		const s = await mo(<ToChuc />);
		expect(s.o.textContent).toContain(
			"5/7 thành viên có phòng ban chính · 2 phòng ban chưa có trưởng",
		);
		for (const ten of [
			"Kinh doanh",
			"Vận hành",
			"Kinh doanh vùng 1",
			"Chăm sóc khách hàng",
			"Pháp chế",
		]) {
			expect(`${ten}: ${s.o.textContent?.includes(ten)}`).toBe(`${ten}: true`);
		}
		expect(BON_NUT(s.o)).toEqual([false, false, false, false]);
	});

	test("chi-doc: doi chung — quan tri thay du bon loai nut", async () => {
		const s = await mo(<ToChuc />, "?don=pb:pb-1");
		expect(BON_NUT(s.o)).toEqual([true, true, true, true]);
	});
});

describe("cay-man", () => {
	test("cay-man: nguoi, nhan phu, hai nhom cuoi, huy hieu truong, translate no", async () => {
		const s = await mo(<ToChuc />);
		const anh = document.createElement("div");
		for (const nutCay of ["pb:pb-1", "pb:pb-cskh", "chua-co", "bp:bp-kd"]) {
			await bam(s.o.querySelector(`[data-nut-cay="${nutCay}"]`) as HTMLElement);
			await cho(
				() =>
					s.o
						.querySelector(`[data-nut-cay="${nutCay}"]`)
						?.getAttribute("aria-current") === "page",
				`chon ${nutCay}`,
			);
			anh.appendChild(s.o.cloneNode(true));
		}
		const trong = (sel: string, chu: string) =>
			[...anh.querySelectorAll(sel)].some(
				(x) => x.textContent?.includes(chu) ?? false,
			);
		const nguoiTrongPb = (pb: string, id: string) =>
			anh.querySelector(`[data-phong-ban="${pb}"] [data-dong-nguoi="${id}"]`)
				?.textContent ?? "";
		expect({
			maiDuoiPb1: nguoiTrongPb("pb-1", "mai").includes(m.phu),
			maiDuoiCskh: nguoiTrongPb("pb-cskh", "mai").includes(m.phu),
			quanChuaCo: trong('[data-nhom="chua-co-phong-ban"]', QUAN.name),
			phapCheChuaXep: trong('[data-nhom="chua-xep"]', "Pháp chế"),
			hungTruong: nguoiTrongPb("pb-1", "hung").includes(m.truongPhongBan),
			lanTruong: trong('[data-bo-phan="bp-kd"]', m.truongBoPhan),
		}).toEqual({
			maiDuoiPb1: false,
			maiDuoiCskh: true,
			quanChuaCo: true,
			phapCheChuaXep: true,
			hungTruong: true,
			lanTruong: true,
		});
		const coTen = anh.querySelectorAll("[data-ten]").length;
		const coTenKhongDich = anh.querySelectorAll(
			'[data-ten][translate="no"]',
		).length;
		expect(`${coTenKhongDich}/${coTen}`).toBe(`${coTen}/${coTen}`);
		expect(coTen).toBeGreaterThan(10);
	});
});

describe("vi-tri-man", () => {
	test("vi-tri-man: theo truong khong co nut ve; chon tay co nut, bam roi luu gui managerUserId null", async () => {
		await mo(<ToChuc />);
		const phongBanCua = { mai: "pb-1", thao: "pb-cskh" } as const;
		const moNguoi = async (id: keyof typeof phongBanCua) => {
			await bam(
				document.body.querySelector(
					`[data-nut-cay="pb:${phongBanCua[id]}"]`,
				) as HTMLElement,
			);
			await cho(
				() =>
					document.body.querySelector(
						`[data-phong-ban] [data-nguoi="${id}"]`,
					) !== null,
				`khung phong ban cua ${id}`,
			);
			const n = document.body.querySelector(
				`[data-phong-ban] [data-nguoi="${id}"]`,
			);
			if (!n) throw new Error(`khong thay ${id}`);
			await bam(n);
			await cho(() => hopThoai() !== null, `mo vi tri ${id}`);
			return hopThoai() as HTMLElement;
		};
		const hop1 = await moNguoi("mai");
		expect({
			theoTruong: hop1.textContent?.includes("Theo trưởng phòng ban chính"),
			coNutVe: nutCo(hop1, m.viTri.veTheoTruong),
		}).toEqual({ theoTruong: true, coNutVe: false });
		await bam(nut(m.viTri.huy, hop1));
		await cho(() => hopThoai() === null, "dong hop 1");

		const hop2 = await moNguoi("thao");
		expect({
			chonTay: hop2.textContent?.includes("Đã chọn tay"),
			coNutVe: nutCo(hop2, m.viTri.veTheoTruong),
		}).toEqual({ chonTay: true, coNutVe: true });
		await bam(nut(m.viTri.veTheoTruong, hop2));
		await bam(nut(m.viTri.luu, hopThoai() as HTMLElement));
		await cho(
			() => dauVaoCuoi("setPlacement") !== undefined,
			"goi setPlacement",
		);
		expect(dauVaoCuoi("setPlacement")).toEqual({
			userId: "thao",
			primaryDepartmentId: "pb-cskh",
			secondaryDepartmentIds: [],
			managerUserId: null,
			chucDanh: "",
		});
	});
});

describe("luu-tru-man", () => {
	test("luu-tru-man: da luu tru co khoi phuc va xoa han, don vi song khong co xoa han, o chon khong co don vi da luu tru, loi hien dung cau", async () => {
		const s = await mo(<ToChuc />, "?don=pb:pb-1");
		const trigger = nut(m.daLuuTru.replace("{n}", "1"));
		await bam(trigger);
		await cho(
			() => s.o.querySelector('[data-luu-tru="pb-cu"]') !== null,
			"mo da luu tru",
		);
		const dong = s.o.querySelector('[data-luu-tru="pb-cu"]') as HTMLElement;
		expect([nutCo(dong, m.khoiPhuc), nutCo(dong, m.xoaHan)]).toEqual([
			true,
			true,
		]);
		const xoaTrongCay = [...s.o.querySelectorAll("[data-phong-ban]")].some(
			(d) => nutCo(d, m.xoaHan),
		);
		expect(`don vi song co Xoa han: ${xoaTrongCay}`).toBe(
			"don vi song co Xoa han: false",
		);

		const mai = s.o.querySelector(
			'[data-phong-ban="pb-1"] [data-nguoi="mai"]',
		) as Element;
		await bam(mai);
		await cho(() => hopThoai() !== null, "mo vi tri mai");
		const oChon = (hopThoai() as HTMLElement).querySelector(
			'[role="combobox"]',
		) as Element;
		await bam(oChon);
		await cho(
			() => document.body.querySelectorAll('[role="option"]').length > 0,
			"mo o chon",
		);
		const luaChon = [...document.body.querySelectorAll('[role="option"]')].map(
			(o) => o.textContent?.trim(),
		);
		expect(`co Marketing (cu): ${luaChon.includes("Marketing (cũ)")}`).toBe(
			"co Marketing (cu): false",
		);
		expect(luaChon).toContain("Kinh doanh vùng 1");
		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});
		for (const san of dangMo) await act(async () => san.root.unmount());
		dangMo = [];
		document.body.innerHTML = "";

		const cau = "Còn 2 người có phòng ban chính ở đây — chuyển họ trước.";
		cheDo = new Map([["archiveDepartment", cau]]);
		const s2 = await mo(<ToChuc />, "?don=bp:bp-kd");
		await moMenu("Kinh doanh vùng 1");
		await chonMuc(m.luuTru);
		await cho(
			() => document.body.querySelector('[role="alertdialog"]') !== null,
			"hop xac nhan",
		);
		await bam(
			nut(
				m.luuTru,
				document.body.querySelector('[role="alertdialog"]') as HTMLElement,
			),
		);
		await cho(
			() => document.body.textContent?.includes(cau) === true,
			"toast loi",
		);
		expect(
			`con trong cay: ${s2.o.querySelector('[data-phong-ban="pb-1"]') !== null}`,
		).toBe("con trong cay: true");
	});
});

const CHU_GOC = [
	"hung@onehub.vn\tKinh doanh vùng 1\tKinh doanh\tphòng ban",
	"mai@onehub.vn\tKinh doanh vùng 1\tKinh doanh\t",
	"thao@onehub.vn\tChăm sóc khách hàng\tVận hành\t",
	"tuan@onehub.vn\tKho vận\tVận hành\t",
	"an@onehub.vn\tKế toán\tTài chính\t",
	"duc@onehub.vn\tKinh doanh vùng 1\tVận hành\t",
	"lan@onehub.vn\tPháp chế\t\tcó",
].join("\n");

const N = TO_CHUC.thongDiep.nhap;

function xem(hongTu: number): ImportPreviewOutput {
	const loi = [
		N.emailKhongPhaiThanhVien,
		N.phongBanBoPhanKhac("Kinh doanh vùng 1", "Kinh doanh"),
		N.truongLa,
	];
	const rows = CHU_GOC.split("\n").map((d, i) => {
		const [email = "", department = "", division = "", head = ""] =
			d.split("\t");
		return {
			line: i + 1,
			email,
			department,
			division,
			head,
			error: i >= hongTu ? (loi[i - 4] ?? N.truongLa) : null,
		};
	});
	const valid = rows.filter((r) => r.error === null).length;
	return {
		rows,
		summary: {
			valid,
			invalid: rows.length - valid,
			newDepartments: 0,
			newDivisions: 0,
		},
		newNames: { departments: [], divisions: [] },
	};
}

async function moNhap(ketQua: ImportPreviewOutput): Promise<HTMLElement> {
	xemTruoc = ketQua;
	await mo(<ToChuc />);
	await bam(nut(m.nhap));
	await cho(() => hopThoai() !== null, "mo hop nhap");
	const hop = hopThoai() as HTMLElement;
	const o = hop.querySelector("textarea") as HTMLTextAreaElement;
	await act(async () => {
		const dat = Object.getOwnPropertyDescriptor(
			HTMLTextAreaElement.prototype,
			"value",
		)?.set;
		dat?.call(o, CHU_GOC);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
	await bam(nut(m.nhapHop.xemTruoc, hop));
	await cho(() => hop.querySelector("tbody tr") !== null, "bang xem truoc");
	return hop;
}

describe("nhap-man", () => {
	test("nhap-man: nut ghi noi so dong, bang du dong, loi tung dong, ghi gui chu goc", async () => {
		const hop = await moNhap(xem(4));
		const nutGhi = nut("Ghi ", hop);
		expect(nutGhi.textContent?.trim()).toBe("Ghi 4 dòng · bỏ 3 dòng hỏng");
		expect(hop.querySelectorAll("tbody tr").length).toBe(7);
		const oNguoiNhap = [...hop.querySelectorAll("tbody tr")].flatMap((tr) =>
			[...tr.querySelectorAll("td")]
				.slice(1, 5)
				.filter((td) => td.getAttribute("translate") !== "no")
				.map(
					(td) =>
						`dong ${tr.firstElementChild?.textContent}: ${td.textContent}`,
				),
		);
		expect(oNguoiNhap).toEqual([]);
		const loi = [
			...hop.querySelectorAll(`[aria-label="${m.nhapHop.dongHong}"] li`),
		].map((l) => l.textContent);
		expect(loi).toEqual([
			`Dòng 5: ${N.emailKhongPhaiThanhVien}`,
			`Dòng 6: ${N.phongBanBoPhanKhac("Kinh doanh vùng 1", "Kinh doanh")}`,
			`Dòng 7: ${N.truongLa}`,
		]);
		await bam(nutGhi);
		await cho(() => dauVaoCuoi("applyImport") !== undefined, "goi applyImport");
		expect(dauVaoCuoi("applyImport")).toEqual({ text: CHU_GOC, traTen: true });
	});

	test("nhap-man: moi dong hong thi nut ghi khoa", async () => {
		const hop = await moNhap(xem(0));
		const nutGhi = nut(m.nhapHop.khongGhi, hop);
		expect(nutGhi.disabled).toBe(true);
	});
});

const T = TO_CHUC.thongDiep;

function soLanGoi(duong: string): number {
	return duongGoi.filter((d) => d === duong).length;
}

function hopXacNhan(): HTMLElement {
	return document.body.querySelector('[role="alertdialog"]') as HTMLElement;
}

async function luuTruPb1(s: San): Promise<void> {
	await moMenu("Kinh doanh vùng 1");
	await chonMuc(m.luuTru);
	await cho(() => hopXacNhan() !== null, "hop xac nhan luu tru");
	await bam(nut(m.luuTru, hopXacNhan()));
	void s;
}

async function moDaLuuTru(s: San): Promise<HTMLElement> {
	await bam(nut(m.daLuuTru.replace("{n}", "1")));
	await cho(
		() => s.o.querySelector('[data-luu-tru="pb-cu"]') !== null,
		"mo da luu tru",
	);
	return s.o.querySelector('[data-luu-tru="pb-cu"]') as HTMLElement;
}

async function xoaHanPbCu(s: San): Promise<void> {
	const dong = await moDaLuuTru(s);
	await bam(nut(m.xoaHan, dong));
	await cho(() => hopXacNhan() !== null, "hop xac nhan xoa han");
	await bam(nut(m.xoaHan, hopXacNhan()));
}

async function donMan(): Promise<void> {
	await act(async () => {
		toast.dismiss();
	});
	for (const san of dangMo) await act(async () => san.root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
}

describe("mdg-man-goi-org", () => {
	test("mdg-man-goi-org: luu tru, hoan tac, khoi phuc, xoa han deu goi org.*; tu choi hien nguyen cau may chu", async () => {
		let soKhangDinh = 0;
		const s1 = await mo(<ToChuc />, "?don=bp:bp-kd");
		await luuTruPb1(s1);
		await cho(
			() => soLanGoi("org.archiveDepartment") === 1,
			"goi luu tru",
		).catch(() => undefined);
		expect(
			`luu tru: org.archiveDepartment ${soLanGoi("org.archiveDepartment")} loi goi`,
		).toBe("luu tru: org.archiveDepartment 1 loi goi");
		expect(JSON.stringify(dauVaoCuoi("archiveDepartment"))).toBe(
			'{"id":"pb-1"}',
		);
		await cho(() => nutCo(document.body, m.hoanTac), "nut hoan tac");
		await bam(nut(m.hoanTac));
		await cho(
			() => soLanGoi("org.restoreDepartment") === 1,
			"goi hoan tac",
		).catch(() => undefined);
		expect(
			`hoan tac: org.restoreDepartment ${soLanGoi("org.restoreDepartment")} loi goi`,
		).toBe("hoan tac: org.restoreDepartment 1 loi goi");
		expect(JSON.stringify(dauVaoCuoi("restoreDepartment"))).toBe(
			'{"id":"pb-1"}',
		);
		soKhangDinh += 4;
		await donMan();

		const s2 = await mo(<ToChuc />, "?don=pb:pb-1");
		const dong = await moDaLuuTru(s2);
		await bam(nut(m.khoiPhuc, dong));
		await cho(
			() => soLanGoi("org.restoreDepartment") === 2,
			"goi khoi phuc",
		).catch(() => undefined);
		expect(
			`khoi phuc: org.restoreDepartment ${soLanGoi("org.restoreDepartment") - 1} loi goi`,
		).toBe("khoi phuc: org.restoreDepartment 1 loi goi");
		expect(JSON.stringify(dauVaoCuoi("restoreDepartment"))).toBe(
			'{"id":"pb-cu"}',
		);
		await donMan();
		const s3 = await mo(<ToChuc />, "?don=pb:pb-1");
		await xoaHanPbCu(s3);
		await cho(() => soLanGoi("org.purgeDepartment") === 1, "goi xoa han").catch(
			() => undefined,
		);
		expect(
			`xoa han: org.purgeDepartment ${soLanGoi("org.purgeDepartment")} loi goi`,
		).toBe("xoa han: org.purgeDepartment 1 loi goi");
		expect(JSON.stringify(dauVaoCuoi("purgeDepartment"))).toBe(
			'{"id":"pb-cu"}',
		);
		soKhangDinh += 4;
		expect(
			duongGoi.filter(
				(d) => d.startsWith("onboarding.") && d.endsWith("Department"),
			),
		).toEqual([]);
		soKhangDinh += 1;
		await donMan();

		const TU_CHOI = [
			{
				ten: "luu tru tu choi",
				thuTuc: "archiveDepartment",
				cau: T.phongBanConNguoi(2),
				don: "?don=bp:bp-kd",
				lam: luuTruPb1,
				con: (s: San) => s.o.querySelector('[data-phong-ban="pb-1"]') !== null,
			},
			{
				ten: "xoa han tu choi",
				thuTuc: "purgeDepartment",
				cau: T.phongBanConBuoc,
				don: "?don=pb:pb-1",
				lam: xoaHanPbCu,
				con: (s: San) => s.o.querySelector('[data-luu-tru="pb-cu"]') !== null,
			},
			{
				ten: "khoi phuc tu choi",
				thuTuc: "restoreDepartment",
				cau: T.phongBanTrongKhuon(["Khuôn A"]),
				don: "?don=pb:pb-1",
				lam: async (s: San) => {
					await bam(nut(m.khoiPhuc, await moDaLuuTru(s)));
				},
				con: (s: San) => s.o.querySelector('[data-luu-tru="pb-cu"]') !== null,
			},
		] as const;
		for (const ca of TU_CHOI) {
			cheDo = new Map([[ca.thuTuc, ca.cau]]);
			const s = await mo(<ToChuc />, ca.don);
			await ca.lam(s);
			await cho(
				() => document.body.textContent?.includes(ca.cau) === true,
				`${ca.ten}: toast`,
			).catch(() => undefined);
			expect(
				`${ca.ten}: ${document.body.textContent?.includes(ca.cau) ? "toast dung cau may chu" : "toast khac cau may chu"}`,
			).toBe(`${ca.ten}: toast dung cau may chu`);
			expect(`${ca.ten}: con ${ca.con(s)}`).toBe(`${ca.ten}: con true`);
			soKhangDinh += 2;
			await donMan();
		}
		expect(soKhangDinh).toBe(15);
	});
});
