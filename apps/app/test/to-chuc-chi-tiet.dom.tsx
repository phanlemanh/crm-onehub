import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	spyOn,
	test,
} from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	ImportPreviewOutput,
	TreeOutput,
} from "../../api/src/to-chuc/to-chuc.contracts";

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
	const viTri = (n: typeof LAN, chinh: string | null, phu: string[]) => ({
		...n,
		primaryDepartmentId: chinh,
		secondaryDepartmentIds: phu,
		managerOverrideId: null,
		manager: null,
		managerSource: "khong-co" as const,
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
			viTri(HUNG, "pb-1", []),
			viTri(MAI, "pb-1", ["pb-cskh"]),
			viTri(THAO, "pb-cskh", []),
			viTri(TUAN, "pb-kho", []),
			viTri(LAN, null, []),
			viTri(QUAN, null, []),
		],
		archived: {
			divisions: [],
			departments: [
				{ id: "pb-cu", name: "Marketing (cũ)", okrMo: 0, purgeable: true },
			],
		},
		coverage: { members: 6, withPrimary: 4, departmentsWithoutHead: 3 },
	};
}

function cayRong(): TreeOutput {
	return {
		divisions: [],
		chuaXep: [],
		chuaCoPhongBan: [LAN],
		people: [],
		archived: { divisions: [], departments: [] },
		coverage: { members: 1, withPrimary: 0, departmentsWithoutHead: 0 },
	};
}

let cay: TreeOutput = cayMau();
let quyen = true;
let treoCay = false;
let loiCay = false;
let soLanDocCay = 0;
let daGoi: { ten: string; dauVao: unknown }[] = [];
let cheDo = new Map<string, string>();
let khuonLuuTru: { id: string; name: string; purgeable: boolean }[] = [];
type TenDaTao = ImportPreviewOutput["newNames"];
const CHUA_TAO: TenDaTao = { departments: [], divisions: [] };
let daTao: TenDaTao = CHUA_TAO;

const LOI_NHAP = [
	"Thiếu email",
	"Thiếu phòng ban",
	"Trưởng bộ phận cần cột bộ phận, hoặc phòng ban đã thuộc một bộ phận",
];

function xemTruocMau(): ImportPreviewOutput {
	const dong = (
		line: number,
		email: string,
		department: string,
		division: string,
		error: string | null,
	) => ({ line, email, department, division, head: "", error });
	return {
		rows: [
			dong(1, "hung@onehub.vn", "Bảo hành", "Tài chính", null),
			dong(2, "mai@onehub.vn", "Kinh doanh vùng 1", "Kinh doanh", null),
			dong(3, "", "Kho vận", "", LOI_NHAP[0] ?? ""),
			dong(4, "tuan@onehub.vn", "", "", LOI_NHAP[1] ?? ""),
			dong(5, "thao@onehub.vn", "Pháp chế", "", LOI_NHAP[2] ?? ""),
		],
		summary: { valid: 2, invalid: 3, newDepartments: 1, newDivisions: 1 },
		newNames: { departments: ["Bảo hành"], divisions: ["Tài chính"] },
	};
}

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

function thuTuc<TRa>(ten: string, doc: () => Promise<TRa> | TRa) {
	return {
		queryKey: () => [ten],
		queryOptions: () => ({ queryKey: [ten], queryFn: async () => doc() }),
		mutationOptions: (chon: ChonGhi = {}) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: async (dauVao: DauVao) => {
				daGoi.push({ ten, dauVao: JSON.parse(JSON.stringify(dauVao)) });
				const loi = cheDo.get(ten);
				if (loi !== undefined) throw new Error(loi);
				if (ten === "previewImport") return xemTruocMau();
				const ra = {
					id: `${ten}-ok`,
					written: 4,
					newDepartments: daTao.departments.length,
					newDivisions: daTao.divisions.length,
				};
				return dauVao.traTen === true ? { ...ra, newNames: daTao } : ra;
			},
		}),
	};
}

const khongDoc = () => {
	throw new Error("khong doc thu tuc nay");
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		org: {
			tree: thuTuc("tree", () => {
				soLanDocCay += 1;
				if (treoCay) return new Promise<TreeOutput>(() => {});
				if (loiCay) throw new Error("may chu khong tra loi");
				return cay;
			}),
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
			attachDepartments: thuTuc("attachDepartments", khongDoc),
			addPeople: thuTuc("addPeople", khongDoc),
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
			listDepartments: thuTuc("listDepartments", () => []),
			manDanhMuc: thuTuc("manDanhMuc", () => null),
			listTemplates: thuTuc("listTemplates", () => khuonLuuTru),
			archiveTemplate: thuTuc("archiveTemplate", khongDoc),
			restoreTemplate: thuTuc("restoreTemplate", khongDoc),
			purgeTemplate: thuTuc("purgeTemplate", khongDoc),
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

type San = { o: HTMLElement; root: Root; client: QueryClient };
let dangMo: San[] = [];
let url = new URLSearchParams();
let loiKhiVe: unknown[] = [];

async function mo(dau = "", choTai = true): Promise<San> {
	url = new URLSearchParams(dau);
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o, {
		onUncaughtError: (e) => loiKhiVe.push(e),
		onRecoverableError: (e) => loiKhiVe.push(e),
	});
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				searchParams={dau}
				hasMemory
				onUrlUpdate={(e: UrlUpdateEvent) => {
					url = new URLSearchParams(e.searchParams);
				}}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							<div data-slot="page-shell-actions">
								<HanhDongToChuc />
							</div>
							<ToChuc />
							<Toaster />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root, client };
	dangMo.push(san);
	if (choTai)
		await cho(
			() => o.querySelector("[data-slot='page-shell-loading']") === null,
			"tai xong",
		);
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

async function bam(o: Element | null | undefined): Promise<void> {
	if (!o) throw new Error("khong thay phan tu de bam");
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

function nutTheoChu(goc: ParentNode, chu: string): HTMLButtonElement[] {
	return [...goc.querySelectorAll("button")].filter(
		(b) => b.textContent?.trim() === chu,
	);
}

function nutTheoNhanAn(goc: ParentNode, dau: string): HTMLButtonElement[] {
	return [...goc.querySelectorAll("button")].filter((b) =>
		b.querySelector(".sr-only")?.textContent?.startsWith(dau),
	);
}

function khung(): string | null {
	return (
		document.body
			.querySelector("[data-chi-tiet]")
			?.getAttribute("data-chi-tiet") ?? null
	);
}

function dangChon(): string[] {
	return [...document.body.querySelectorAll("nav [aria-current='page']")].map(
		(x) => x.getAttribute("data-nut-cay") ?? "?",
	);
}

function phongBanTrenCay(): string[] {
	return [...document.body.querySelectorAll("nav [data-nut-cay^='pb:']")]
		.map((x) => x.querySelector("[data-ten]")?.textContent ?? "")
		.sort();
}

beforeEach(() => {
	cay = cayMau();
	quyen = true;
	treoCay = false;
	loiCay = false;
	soLanDocCay = 0;
	daGoi = [];
	loiKhiVe = [];
	cheDo = new Map();
	khuonLuuTru = [];
	daTao = CHUA_TAO;
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

const BON_NUT = [
	{ nut: "goc", chiTiet: "goc", don: "goc" },
	{ nut: "bp:bp-vh", chiTiet: "bo-phan", don: "bp:bp-vh" },
	{ nut: "pb:pb-kho", chiTiet: "phong-ban", don: "pb:pb-kho" },
	{ nut: "chua-co", chiTiet: "chua-co-phong-ban", don: "chua-co" },
] as const;

describe("chon-nut", () => {
	test("chon-nut: bam tung loai nut thi khung, aria-current va dia chi trang dung nut do", async () => {
		await mo("?don=bp:bp-kd");
		const thay: string[] = [];
		for (const x of BON_NUT) {
			await bam(document.body.querySelector(`[data-nut-cay='${x.nut}']`));
			await cho(() => khung() === x.chiTiet, `khung ${x.chiTiet}`);
			thay.push(`bam ${x.nut}: khung=${khung()}`);
			thay.push(`bam ${x.nut}: aria-current=${dangChon().join(",")}`);
			thay.push(`bam ${x.nut}: ?don=${url.get("don")}`);
		}
		expect(thay).toEqual(
			BON_NUT.flatMap((x) => [
				`bam ${x.nut}: khung=${x.chiTiet}`,
				`bam ${x.nut}: aria-current=${x.nut}`,
				`bam ${x.nut}: ?don=${x.don}`,
			]),
		);
	});

	test("chon-nut: ?don= khong giai duoc thi mo khung goc, khong loi", async () => {
		const thay: string[] = [];
		for (const rac of ["bp:khong-co", "pb:pb-cu", "rac"]) {
			await mo(`?don=${rac}`);
			thay.push(
				khung() === "goc"
					? `?don=${rac}: khung goc`
					: `?don=${rac}: khung chi tiet khong phai goc (${khung()})`,
			);
			for (const san of dangMo) {
				await act(async () => san.root.unmount());
				san.o.remove();
			}
			dangMo = [];
		}
		expect({ thay, loi: loiKhiVe.length }).toEqual({
			thay: [
				"?don=bp:khong-co: khung goc",
				"?don=pb:pb-cu: khung goc",
				"?don=rac: khung goc",
			],
			loi: 0,
		});
	});

	test("chon-nut: dung moi tu dia chi trang mo dung nut, khong can bam", async () => {
		const thay: string[] = [];
		for (const x of BON_NUT) {
			await mo(`?don=${x.don}`);
			thay.push(`?don=${x.don} mo ra ${khung()}`);
			thay.push(`?don=${x.don} aria-current=${dangChon().join(",")}`);
			for (const san of dangMo) {
				await act(async () => san.root.unmount());
				san.o.remove();
			}
			dangMo = [];
		}
		expect(thay).toEqual(
			BON_NUT.flatMap((x) => [
				`?don=${x.don} mo ra ${x.chiTiet}`,
				`?don=${x.don} aria-current=${x.nut}`,
			]),
		);
	});

	test("chon-nut: dung tu ?loc=chua-truong thi cay chi con phong ban chua co truong", async () => {
		await mo("?loc=chua-truong");
		expect(phongBanTrenCay()).toEqual(
			["Chăm sóc khách hàng", "Kho vận", "Pháp chế"].sort(),
		);
	});
});

async function moOTruong(): Promise<string[]> {
	const trigger = document.body.querySelector(
		"[data-o-truong='department'] [data-slot='combobox-trigger']",
	);
	await bam(trigger);
	await cho(
		() => document.body.querySelectorAll("[cmdk-item]").length > 0,
		"o truong mo",
	);
	return [...document.body.querySelectorAll("[cmdk-item]")].map(
		(x) => x.querySelector("span")?.textContent ?? "",
	);
}

describe("truong-tai-cho", () => {
	test("truong-tai-cho: o truong chi liet ke nguoi cua phong ban, chon thi goi setHead mot lan", async () => {
		await mo("?don=pb:pb-cskh");
		const ten = await moOTruong();
		const cuaPb = new Set(
			cay.chuaXep
				.concat(cay.divisions.flatMap((d) => d.departments))
				.find((d) => d.id === "pb-cskh")
				?.people.map((n) => n.name),
		);
		const ngoai = ten.filter((x) => !cuaPb.has(x));
		expect(`o truong co nguoi ngoai phong ban: ${ngoai.join(", ")}`).toBe(
			"o truong co nguoi ngoai phong ban: ",
		);
		expect(new Set(ten)).toEqual(cuaPb);
		const muc = [...document.body.querySelectorAll("[cmdk-item]")].find((x) =>
			x.textContent?.includes(THAO.name),
		);
		await bam(muc);
		await cho(() => daGoi.some((g) => g.ten === "setHead"), "goi setHead");
		expect(daGoi.filter((g) => g.ten === "setHead")).toEqual([
			{
				ten: "setHead",
				dauVao: { kind: "department", id: "pb-cskh", userId: "thao" },
			},
		]);
	});

	test("truong-tai-cho: phong ban chua co ai thi o truong mo, cau goi y ghim, khung trong co nut Them nguoi", async () => {
		await mo("?don=pb:pb-pc");
		const o = document.body.querySelector("[data-o-truong='department']");
		const trigger = o?.querySelector<HTMLButtonElement>(
			"[data-slot='combobox-trigger']",
		);
		const trong = document.body.querySelector(
			"[data-trang-thai='ST-tochuc-phongban-trong']",
		);
		expect({
			mo: trigger?.disabled,
			cau: o?.querySelector("[data-slot='field-description']")?.textContent,
			nut: trong ? nutTheoChu(trong, m.chiTiet.themNguoi).length : 0,
		}).toEqual({
			mo: true,
			cau: "Thêm người vào phòng ban trước, rồi chọn trưởng trong số họ.",
			nut: 1,
		});
	});
});

describe("o-so-man", () => {
	test("o-so-man: o thu nhat noi X/M va mo dung M - X nguoi chua co phong ban", async () => {
		await mo();
		const x = cay.people.filter((n) => n.primaryDepartmentId !== null).length;
		const mm = cay.people.length;
		const o = document.body.querySelector("[data-o='chua-co']");
		expect(o?.textContent).toContain(`${x}/${mm}`);
		await bam(o);
		await cho(() => khung() === "chua-co-phong-ban", "khung chua co");
		const ten = [
			...document.body.querySelectorAll(
				"[data-chi-tiet='chua-co-phong-ban'] [data-dong-nguoi] [data-ten]",
			),
		]
			.map((e) => e.textContent)
			.sort();
		expect({ don: url.get("don"), so: ten.length, ten }).toEqual({
			don: "chua-co",
			so: mm - x,
			ten: cay.people
				.filter((n) => n.primaryDepartmentId === null)
				.map((n) => n.name)
				.sort(),
		});
	});

	test("o-so-man: o thu hai noi K, bam loc cay con dung K phong ban, bam lai bo loc", async () => {
		await mo();
		const chuaTruong = [
			...cay.divisions.flatMap((d) => d.departments),
			...cay.chuaXep,
		]
			.filter((d) => d.head === null)
			.map((d) => d.name)
			.sort();
		const k = chuaTruong.length;
		const o = document.body.querySelector("[data-o='chua-truong']");
		expect(o?.textContent).toContain(String(k));
		await bam(o);
		await cho(() => url.get("loc") === "chua-truong", "loc bat");
		const loc = phongBanTrenCay();
		expect(loc.length === k ? "" : `cay loc con ${loc.length} != ${k}`).toBe(
			"",
		);
		expect({ loc, nhan: o?.getAttribute("aria-pressed") }).toEqual({
			loc: chuaTruong,
			nhan: "true",
		});
		await bam(o);
		await cho(() => url.get("loc") === null, "loc tat");
		expect({
			so: phongBanTrenCay().length,
			nhan: o?.getAttribute("aria-pressed"),
		}).toEqual({
			so: 4,
			nhan: "false",
		});
	});
});

async function chonNut(nut: string): Promise<void> {
	await bam(document.body.querySelector(`[data-nut-cay='${nut}']`));
	await cho(() => dangChon().join(",") === nut, `chon nut ${nut}`);
}

async function maTran(): Promise<string[]> {
	const ra: string[] = [];
	const ghi = (vung: string, o: string, nut: HTMLButtonElement[]) => {
		ra.push(
			`${vung}/${o}: co=${nut.length > 0} mo=${nut.length > 0 && nut.every((b) => b.disabled)}`,
		);
	};
	const dau = document.body.querySelector(
		"[data-slot='page-shell-actions']",
	) as HTMLElement;
	ghi("dau-trang", "nhap", nutTheoChu(dau, m.nhap));
	ghi("dau-trang", "them-bo-phan", nutTheoChu(dau, m.themBoPhan));

	await chonNut("goc");
	let k = document.body.querySelector("[data-chi-tiet]") as HTMLElement;
	ghi("goc", "tay-keo-bo-phan", nutTheoNhanAn(k, "Đổi thứ tự "));
	ghi("goc", "them-bo-phan", nutTheoChu(k, m.themBoPhan));
	ghi("goc", "gan-vao-bo-phan", nutTheoChu(k, m.chiTiet.ganVaoBoPhan));
	ghi("goc", "menu-dong-bo-phan", nutTheoNhanAn(k, "Thao tác với Kinh doanh"));

	await chonNut("bp:bp-vh");
	k = document.body.querySelector("[data-chi-tiet]") as HTMLElement;
	ghi("bo-phan", "o-truong", [
		...k.querySelectorAll<HTMLButtonElement>("[data-slot='combobox-trigger']"),
	]);
	ghi("bo-phan", "gan-co-san", nutTheoChu(k, m.chiTiet.ganCoSan));
	ghi("bo-phan", "phong-ban-moi", nutTheoChu(k, m.chiTiet.phongBanMoi));
	ghi("bo-phan", "tay-keo-phong-ban", nutTheoNhanAn(k, "Đổi thứ tự "));
	ghi("bo-phan", "menu", nutTheoNhanAn(k, "Thao tác với Vận hành"));
	ghi(
		"bo-phan",
		"menu-dong-phong-ban",
		nutTheoNhanAn(k, "Thao tác với Kho vận"),
	);

	await chonNut("pb:pb-1");
	k = document.body.querySelector("[data-chi-tiet]") as HTMLElement;
	ghi("phong-ban", "o-truong", [
		...k.querySelectorAll<HTMLButtonElement>("[data-slot='combobox-trigger']"),
	]);
	ghi("phong-ban", "them-nguoi", nutTheoChu(k, m.chiTiet.themNguoi));
	ghi("phong-ban", "menu", nutTheoNhanAn(k, "Thao tác với Kinh doanh vùng 1"));
	ghi("phong-ban", "nut-vi-tri-dong-nguoi", [
		...k.querySelectorAll<HTMLButtonElement>("button[data-nguoi]"),
	]);

	await chonNut("chua-co");
	k = document.body.querySelector("[data-chi-tiet]") as HTMLElement;
	ghi("chua-co", "xep-phong-ban", nutTheoChu(k, m.chiTiet.xepPhongBan));

	const luu = document.body.querySelector(
		"[data-slot='archived-list']",
	) as HTMLElement;
	await bam(nutTheoChu(luu, `${m.daLuuTru} (1)`)[0]);
	ghi("da-luu-tru", "khoi-phuc", nutTheoChu(luu, m.khoiPhuc));
	ghi("da-luu-tru", "xoa-han", nutTheoChu(luu, m.xoaHan));
	return ra;
}

const O_MA_TRAN = [
	"dau-trang/nhap",
	"dau-trang/them-bo-phan",
	"goc/tay-keo-bo-phan",
	"goc/them-bo-phan",
	"goc/gan-vao-bo-phan",
	"goc/menu-dong-bo-phan",
	"bo-phan/o-truong",
	"bo-phan/gan-co-san",
	"bo-phan/phong-ban-moi",
	"bo-phan/tay-keo-phong-ban",
	"bo-phan/menu",
	"bo-phan/menu-dong-phong-ban",
	"phong-ban/o-truong",
	"phong-ban/them-nguoi",
	"phong-ban/menu",
	"phong-ban/nut-vi-tri-dong-nguoi",
	"chua-co/xep-phong-ban",
	"da-luu-tru/khoi-phuc",
	"da-luu-tru/xoa-han",
];

describe("chi-doc", () => {
	test("chi-doc: thanh vien thuong thay moi o sua nhung mo, kem dong ghi chu", async () => {
		quyen = false;
		await mo();
		const ghiChu = document.body.querySelector(
			"[data-trang-thai='ST-tochuc-chidoc']",
		)?.textContent;
		const ra = await maTran();
		const xep = ra.find((x) => x.startsWith("chua-co/"));
		expect(
			xep?.endsWith("mo=true") ? "" : "Xep phong ban khong mo o vai chi doc",
		).toBe("");
		expect({ ghiChu, ra }).toEqual({
			ghiChu: "Chỉ quản trị sửa được cây tổ chức.",
			ra: O_MA_TRAN.map((o) => `${o}: co=true mo=true`),
		});
	});

	test("chi-doc: quan tri thay cung ma tran, khong o nao mo", async () => {
		await mo();
		const ra = await maTran();
		expect({
			ghiChu:
				document.body.querySelector("[data-trang-thai='ST-tochuc-chidoc']") !==
				null,
			ra,
		}).toEqual({
			ghiChu: false,
			ra: O_MA_TRAN.map((o) => `${o}: co=true mo=false`),
		});
	});
});

describe("trang-thai", () => {
	test("trang-thai: dang tai hien vo tai chung cua Cai dat", async () => {
		treoCay = true;
		await mo("", false);
		await cho(() => soLanDocCay > 0, "bat dau doc cay");
		expect(
			document.body.querySelector("[data-slot='page-shell-loading']") !== null,
		).toBe(true);
	});

	test("trang-thai: loi tai hien Empty co bieu tuong, cau mo ta va nut Thu lai goi lai truy van", async () => {
		loiCay = true;
		await mo();
		const trong = document.body.querySelector(
			"[data-trang-thai='ST-tochuc-loi']",
		) as HTMLElement;
		const truoc = soLanDocCay;
		expect({
			bieuTuong: trong.querySelector("[data-slot='empty-icon']") !== null,
			moTa: trong.querySelector("[data-slot='empty-description']")?.textContent,
			nut: nutTheoChu(trong, m.loi.action).length,
		}).toEqual({ bieuTuong: true, moTa: m.loi.body, nut: 1 });
		loiCay = false;
		await bam(nutTheoChu(trong, m.loi.action)[0]);
		await cho(() => soLanDocCay > truoc, "doc lai cay");
		await cho(() => khung() === "goc", "cay hien sau thu lai");
	});

	test("trang-thai: chua co cay hien Empty co hai nut dung nhan", async () => {
		cay = cayRong();
		await mo();
		const trong = document.body.querySelector(
			"[data-trang-thai='ST-tochuc-trong']",
		) as HTMLElement;
		expect(
			[...trong.querySelectorAll("button")].map((b) => b.textContent?.trim()),
		).toEqual([m.nhap, m.themBoPhan]);
	});
});

describe("chon-nut", () => {
	test("chon-nut: don vi dang mo bi luu tru o noi khac thi khung roi ve goc, khong trang trang", async () => {
		const san = await mo("?don=bp:bp-vh");
		expect(khung()).toBe("bo-phan");
		const vh = cay.divisions[1];
		cay = {
			...cay,
			divisions: cay.divisions.filter((d) => d.id !== "bp-vh"),
			chuaXep: [...cay.chuaXep, ...(vh?.departments ?? [])],
			archived: {
				...cay.archived,
				divisions: [
					{ id: "bp-vh", name: "Vận hành", okrMo: 0, purgeable: false },
				],
			},
		};
		await act(async () => {
			await san.client.invalidateQueries();
		});
		await cho(() => khung() === "goc", "roi ve goc");
		expect({ khung: khung(), loi: loiKhiVe.length }).toEqual({
			khung: "goc",
			loi: 0,
		});
	});

	test("chon-nut: tim ten mot nguoi thi cay hien phong ban chua nguoi do", async () => {
		await mo(`?q=${encodeURIComponent("Tuấn")}`);
		expect({
			phongBan: phongBanTrenCay(),
			boPhan:
				document.body.querySelector("nav [data-nut-cay='bp:bp-vh']") !== null,
		}).toEqual({ phongBan: ["Kho vận"], boPhan: true });
	});
});

async function go(o: HTMLInputElement, chu: string): Promise<void> {
	const dat = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function hop(): HTMLElement {
	const h = [
		...document.body.querySelectorAll<HTMLElement>("[role='dialog']"),
	].at(-1);
	if (!h) throw new Error("khong thay hop thoai");
	return h;
}

function mucChon(): { id: string; ten: string; phu: string }[] {
	return [...hop().querySelectorAll("[data-slot='pick-list-item']")].map(
		(x) => {
			const chu = [...x.querySelectorAll("label span span")].map(
				(e) => e.textContent ?? "",
			);
			return {
				id: x.getAttribute("data-id") ?? "",
				ten: chu[0] ?? "",
				phu: chu[1] ?? "",
			};
		},
	);
}

async function tich(id: string): Promise<void> {
	await bam(
		hop().querySelector(
			`[data-slot='pick-list-item'][data-id='${id}'] [role='checkbox']`,
		),
	);
}

async function moMenu(ten: string): Promise<void> {
	const [nut] = nutTheoNhanAn(document.body, `Thao tác với ${ten}`);
	await bam(nut);
	await cho(
		() => document.body.querySelectorAll("[role='menuitem']").length > 0,
		`menu ${ten}`,
	);
}

async function chonMuc(chu: string): Promise<void> {
	const muc = [...document.body.querySelectorAll("[role='menuitem']")].find(
		(x) => x.textContent?.trim() === chu,
	);
	if (!muc) throw new Error(`menu khong co "${chu}"`);
	await bam(muc);
}

function dauVaoCuoiCua(ten: string): unknown {
	return [...daGoi].reverse().find((g) => g.ten === ten)?.dauVao;
}

function goiCua(ten: string) {
	return daGoi.filter((g) => g.ten === ten);
}

describe("gan-man", () => {
	test("gan-man: hop gan co dong phu dung, tich hai thi goi attachDepartments mot lan dung thu tu", async () => {
		await mo("?don=bp:bp-kd");
		await bam(nutTheoChu(document.body, m.chiTiet.ganCoSan)[0]);
		await cho(() => mucChon().length > 0, "hop gan mo");
		const muc = mucChon();
		const phuHopLe = (phu: string) =>
			phu === "Chưa xếp vào bộ phận" || /^Đang ở .+/.test(phu);
		const nut0 = nutTheoChu(hop(), "Gắn 0 phòng ban")[0];
		expect({
			phuLa: muc.filter((x) => !phuHopLe(x.phu)).map((x) => x.phu),
			ids: muc.map((x) => x.id).sort(),
			mo0: nut0?.disabled,
		}).toEqual({
			phuLa: [],
			ids: ["pb-cskh", "pb-kho", "pb-pc"],
			mo0: true,
		});
		await tich("pb-kho");
		await tich("pb-pc");
		const nut = nutTheoChu(hop(), "Gắn 2 phòng ban")[0];
		await bam(nut);
		await cho(
			() =>
				goiCua("attachDepartments").length + goiCua("moveDepartment").length >
				0,
			"da ghi",
		);
		const gan = goiCua("attachDepartments");
		expect(
			gan.length === 1 ? "" : `attachDepartments goi ${gan.length} lan`,
		).toBe("");
		expect({ gan, moveDepartment: goiCua("moveDepartment").length }).toEqual({
			gan: [
				{
					ten: "attachDepartments",
					dauVao: { divisionId: "bp-kd", departmentIds: ["pb-kho", "pb-pc"] },
				},
			],
			moveDepartment: 0,
		});
	});

	test("gan-man: o truong bo phan liet ke moi thanh vien", async () => {
		await mo("?don=bp:bp-kd");
		await bam(
			document.body.querySelector(
				"[data-o-truong='division'] [data-slot='combobox-trigger']",
			),
		);
		await cho(
			() => document.body.querySelectorAll("[cmdk-item]").length > 0,
			"o truong mo",
		);
		const ten = [...document.body.querySelectorAll("[cmdk-item]")].map(
			(x) => x.querySelector("span")?.textContent ?? "",
		);
		expect(new Set(ten)).toEqual(new Set(cay.people.map((n) => n.name)));
	});
});

function khungMoi(): number {
	return document.body.querySelectorAll("[role='dialog']").length;
}

describe("them-nguoi-man", () => {
	test("them-nguoi-man: hop them nguoi co dong phu dung, nguoi phu co mat, tich hai goi addPeople mot lan", async () => {
		await mo("?don=pb:pb-cskh");
		await bam(nutTheoChu(document.body, m.chiTiet.themNguoi)[0]);
		await cho(() => mucChon().length > 0, "hop them mo");
		const muc = mucChon();
		const theoId = Object.fromEntries(muc.map((x) => [x.id, x.phu]));
		expect(
			muc.some((x) => x.phu.startsWith("Đang ở")) ? "" : "khong thay 'Dang o'",
		).toBe("");
		expect("mai" in theoId ? "" : "nguoi phu vang mat trong hop").toBe("");
		expect(theoId).toEqual({
			hung: "Đang ở Kinh doanh vùng 1 — sẽ chuyển",
			mai: "Đang ở Kinh doanh vùng 1 — sẽ chuyển",
			tuan: "Đang ở Kho vận — sẽ chuyển",
			lan: "Chưa có phòng ban",
			quan: "Chưa có phòng ban",
		});
		await tich("mai");
		await tich("lan");
		await bam(nutTheoChu(hop(), "Thêm 2 người")[0]);
		await cho(() => khungMoi() === 0, "hop dong");
		expect(goiCua("addPeople")).toEqual([
			{
				ten: "addPeople",
				dauVao: { departmentId: "pb-cskh", userIds: ["mai", "lan"] },
			},
		]);
	});

	test("them-nguoi-man: phong ban da co moi thanh vien thi hop noi trong va nut xac nhan mo", async () => {
		cay = {
			...cay,
			people: cay.people.map((n) => ({ ...n, primaryDepartmentId: "pb-cskh" })),
		};
		await mo("?don=pb:pb-cskh");
		await bam(nutTheoChu(document.body, m.chiTiet.themNguoi)[0]);
		await cho(() => khungMoi() > 0, "hop them mo");
		expect({
			muc: mucChon().length,
			trong: hop().textContent?.includes(m.them.rong),
			mo: nutTheoChu(hop(), "Thêm 0 người")[0]?.disabled,
		}).toEqual({ muc: 0, trong: true, mo: true });
	});
});

const gocRect = Element.prototype.getBoundingClientRect;

function datViTri(): void {
	Element.prototype.getBoundingClientRect = function viTri(this: Element) {
		if (this.querySelector(":scope > [data-muc-keo]") === null) {
			return {
				x: 0,
				y: -10000,
				top: -10000,
				left: 0,
				bottom: 10000,
				right: 1000,
				width: 1000,
				height: 20000,
				toJSON: () => ({}),
			} as DOMRect;
		}
		const cha = this.parentElement;
		const i = cha ? [...cha.children].indexOf(this) : 0;
		const doi =
			this instanceof HTMLElement
				? Number(
						/translate3d\([^,]+,\s*(-?[\d.]+)px/.exec(
							this.style.transform,
						)?.[1] ?? 0,
					)
				: 0;
		const tren = i * 40 + doi;
		return {
			x: 0,
			y: tren,
			top: tren,
			left: 0,
			bottom: tren + 32,
			right: 300,
			width: 300,
			height: 32,
			toJSON: () => ({}),
		} as DOMRect;
	};
}

async function nghi(ms: number): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function phim(o: Element, key: string): Promise<void> {
	await act(async () => {
		o.dispatchEvent(
			new KeyboardEvent("keydown", {
				key,
				code: key === " " ? "Space" : key,
				bubbles: true,
				cancelable: true,
			}),
		);
	});
	await nghi(5);
}

async function keoLen(ten: string, soBuoc: number): Promise<void> {
	const [tay] = nutTheoNhanAn(document.body, `Đổi thứ tự ${ten}`);
	if (!tay) throw new Error(`khong thay tay keo ${ten}`);
	tay.focus();
	await phim(tay, " ");
	await nghi(20);
	for (let i = 0; i < soBuoc; i += 1) {
		await phim(tay, "ArrowUp");
		await nghi(20);
	}
	await phim(tay, " ");
}

function baBoPhan(): TreeOutput {
	const c = cayMau();
	return {
		...c,
		divisions: [
			...c.divisions,
			{
				id: "bp-tc",
				name: "Tài chính",
				moTa: "",
				position: 2,
				head: null,
				okrMo: 0,
				departments: [],
			},
		],
	};
}

describe("sap", () => {
	afterEach(() => {
		Element.prototype.getBoundingClientRect = gocRect;
	});

	test("sap: keo bo phan thu ba len dau goi reorderDivisions dung day id moi", async () => {
		cay = baBoPhan();
		datViTri();
		await mo("?don=goc");
		await keoLen("Tài chính", 2);
		await cho(() => goiCua("reorderDivisions").length > 0, "goi reorder");
		expect(goiCua("reorderDivisions")).toEqual([
			{ ten: "reorderDivisions", dauVao: { ids: ["bp-tc", "bp-kd", "bp-vh"] } },
		]);
	});

	test("sap: ban phim Space mui ten Space tren phong ban goi moveDepartment dung", async () => {
		datViTri();
		await mo("?don=bp:bp-vh");
		await keoLen("Kho vận", 1);
		await cho(() => goiCua("moveDepartment").length > 0, "goi move");
		expect(goiCua("moveDepartment")).toEqual([
			{
				ten: "moveDepartment",
				dauVao: { id: "pb-kho", divisionId: "bp-vh", index: 0 },
			},
		]);
	});

	test("sap: khong menu nao con muc Len tren hay Xuong duoi", async () => {
		await mo("?don=bp:bp-vh");
		const cam = ["Lên trên", "Xuống dưới", "Move up", "Move down"];
		const thay: string[] = [];
		for (const ten of ["Vận hành"]) {
			await moMenu(ten);
			for (const x of document.body.querySelectorAll("[role='menuitem']"))
				if (cam.includes(x.textContent?.trim() ?? ""))
					thay.push(x.textContent ?? "");
			await act(async () => {
				document.dispatchEvent(
					new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
				);
			});
		}
		const chuMan = JSON.stringify([toChucMessages("vi"), toChucMessages("en")]);
		expect({
			menu: thay.length === 0 ? "" : "con muc sap bang menu",
			chu: cam.filter((c) => chuMan.includes(c)),
		}).toEqual({ menu: "", chu: [] });
	});

	test("sap: dang loc chua co truong thi danh sach phong ban cua bo phan van du, khong ghi thu tu thieu", async () => {
		await mo("?don=bp:bp-kd&loc=chua-truong");
		const k = document.body.querySelector(
			"[data-chi-tiet='bo-phan']",
		) as HTMLElement;
		const hang = [...k.querySelectorAll("[data-muc-keo]")].map(
			(x) => x.getAttribute("data-muc-keo") ?? "",
		);
		expect(hang).toEqual(
			cay.divisions
				.find((d) => d.id === "bp-kd")
				?.departments.map((d) => d.id) ?? ["khong co bo phan"],
		);
	});
});

async function xacNhanLuuTru(ten: string): Promise<HTMLElement> {
	await moMenu(ten);
	await chonMuc(m.luuTru);
	await cho(
		() => document.body.querySelector("[role='alertdialog']") !== null,
		"hop xac nhan",
	);
	return document.body.querySelector("[role='alertdialog']") as HTMLElement;
}

describe("luu-tru-chung", () => {
	test("luu-tru-chung: To chuc — luu tru khong to pha huy, xoa han to pha huy, muc Da luu tru dung chung", async () => {
		await mo("?don=pb:pb-kho");
		const xn = await xacNhanLuuTru("Kho vận");
		const luu = xn.querySelector("[data-slot='alert-dialog-action']");
		const luuTo = luu?.getAttribute("data-variant");
		expect(luuTo === "destructive" ? "luu tru to mau pha huy" : "").toBe("");
		await bam(nutTheoChu(xn, m.xacNhanLuuTru.giu)[0]);
		await cho(
			() => document.body.querySelector("[role='alertdialog']") === null,
			"dong xac nhan",
		);
		const vung = document.body.querySelector(
			"[data-slot='archived-list']",
		) as HTMLElement;
		const trigger = nutTheoChu(vung, `${m.daLuuTru} (1)`)[0];
		await bam(trigger);
		await bam(nutTheoChu(vung, m.xoaHan)[0]);
		await cho(
			() => document.body.querySelector("[role='alertdialog']") !== null,
			"hop xoa",
		);
		expect({
			luu: luuTo,
			xoa: document.body
				.querySelector("[role='alertdialog'] [data-slot='alert-dialog-action']")
				?.getAttribute("data-variant"),
			nhan: trigger?.textContent?.trim(),
		}).toEqual({ luu: "default", xoa: "destructive", nhan: "Đã lưu trữ (1)" });
	});

	test("luu-tru-chung: Dieu phoi — cung thanh phan, luu tru khong to, xoa han to", async () => {
		const { DanhSachKhuon } = await import(
			"@/app/(app)/[slug]/settings/onboarding/danh-sach-khuon"
		);
		const { DaLuuTru } = await import(
			"@/app/(app)/[slug]/settings/onboarding/da-luu-tru"
		);
		const { onboardingMessages } = await import("@/lib/messages/onboarding");
		const mo2 = onboardingMessages("vi");
		khuonLuuTru = [
			{ id: "k-cu", name: "Khuôn cũ", purgeable: true },
			{ id: "k-cu2", name: "Khuôn cũ 2", purgeable: false },
		];
		const o = document.createElement("div");
		document.body.appendChild(o);
		const root = createRoot(o);
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		await act(async () => {
			root.render(
				<NuqsTestingAdapter searchParams="" hasMemory>
					<QueryClientProvider client={client}>
						<LocaleProvider locale="vi">
							<TooltipProvider>
								<DanhSachKhuon
									khuon={[
										{
											id: "k-1",
											name: "Khuôn A",
											partnerType: null,
											steps: [],
										},
									]}
									boPhan={[]}
									khoa={false}
								/>
								<DaLuuTru khoa={false} />
							</TooltipProvider>
						</LocaleProvider>
					</QueryClientProvider>
				</NuqsTestingAdapter>,
			);
		});
		dangMo.push({ o, root, client });
		await cho(
			() => document.body.querySelector("[data-slot='archived-list']") !== null,
			"muc da luu tru",
		);
		const [menu] = nutTheoNhanAn(document.body, `${mo2.quanLy.menu} Khuôn A`);
		await bam(menu);
		await cho(
			() => document.body.querySelectorAll("[role='menuitem']").length > 0,
			"menu khuon",
		);
		await chonMuc(mo2.quanLy.luuTru);
		await cho(
			() => document.body.querySelector("[role='alertdialog']") !== null,
			"xac nhan luu tru khuon",
		);
		const luuTo = document.body
			.querySelector("[role='alertdialog'] [data-slot='alert-dialog-action']")
			?.getAttribute("data-variant");
		await bam(
			nutTheoChu(
				document.body.querySelector("[role='alertdialog']") as HTMLElement,
				mo2.quanLy.giu,
			)[0],
		);
		await cho(
			() => document.body.querySelector("[role='alertdialog']") === null,
			"dong",
		);
		const vung = document.body.querySelector(
			"[data-slot='archived-list']",
		) as HTMLElement;
		const trigger = nutTheoChu(vung, `${mo2.quanLy.daLuuTru} (2)`)[0];
		await bam(trigger);
		await bam(nutTheoChu(vung, mo2.quanLy.xoaVinhVien)[0]);
		await cho(
			() => document.body.querySelector("[role='alertdialog']") !== null,
			"hop xoa khuon",
		);
		expect({
			luu: luuTo,
			xoa: document.body
				.querySelector("[role='alertdialog'] [data-slot='alert-dialog-action']")
				?.getAttribute("data-variant"),
			nhan: trigger?.textContent?.trim(),
		}).toEqual({ luu: "default", xoa: "destructive", nhan: "Đã lưu trữ (2)" });
	});
});

async function bamNhuNguoi(nut: HTMLButtonElement | undefined): Promise<void> {
	await act(async () => {
		nut?.focus();
	});
	await bam(nut);
}

async function hopDonVi(ten: string): Promise<void> {
	await cho(() => hop().querySelector("input") !== null, "hop don vi");
	await go(hop().querySelector("input") as HTMLInputElement, ten);
	await bamNhuNguoi(nutTheoChu(hop(), m.donVi.luu)[0]);
}

async function doiDong(): Promise<void> {
	await cho(
		() =>
			document.body.querySelector("[role='dialog'], [role='alertdialog']") ===
			null,
		"hop dong lai",
	);
}

describe("trang-thai", () => {
	afterEach(() => {
		Element.prototype.getBoundingClientRect = gocRect;
	});

	test("trang-thai: moi thu tuc ghi cua man thanh cong bao toast.success dung mot lan", async () => {
		const bao = spyOn(toast, "success");
		datViTri();
		await mo("?don=goc");
		const thay: string[] = [];
		const dem = async (ten: string, lam: () => Promise<void>) => {
			const truoc = bao.mock.calls.length;
			await lam();
			await cho(() => goiCua(ten).length > 0, `goi ${ten}`);
			await nghi(20);
			const n = bao.mock.calls.length - truoc;
			thay.push(
				n === 1
					? `${ten}: bao thanh cong`
					: n === 0
						? `${ten} khong bao thanh cong`
						: `${ten} bao ${n} lan`,
			);
		};
		const chon = async (nut: string) => {
			await bam(document.body.querySelector(`[data-nut-cay='${nut}']`));
			await cho(() => dangChon().join(",") === nut, `chon ${nut}`);
		};

		await dem("reorderDivisions", async () => {
			await keoLen("Vận hành", 1);
		});
		await dem("createDivision", async () => {
			await bam(
				nutTheoChu(
					document.body.querySelector(
						"[data-slot='page-shell-actions']",
					) as HTMLElement,
					m.themBoPhan,
				)[0],
			);
			await hopDonVi("Pháp lý");
			await doiDong();
		});
		await chon("bp:bp-vh");
		await dem("moveDepartment", async () => {
			await keoLen("Kho vận", 1);
		});
		await dem("createDepartment", async () => {
			await bam(nutTheoChu(document.body, m.chiTiet.phongBanMoi)[0]);
			await hopDonVi("Bảo hành");
			await doiDong();
		});
		await dem("renameDivision", async () => {
			await moMenu("Vận hành");
			await chonMuc(m.doiTen);
			await hopDonVi("Vận hành mới");
			await doiDong();
		});
		await dem("attachDepartments", async () => {
			await bam(nutTheoChu(document.body, m.chiTiet.ganCoSan)[0]);
			await cho(() => mucChon().length > 0, "hop gan");
			await tich("pb-pc");
			await bam(nutTheoChu(hop(), "Gắn 1 phòng ban")[0]);
			await doiDong();
		});
		await chon("pb:pb-cskh");
		await dem("setHead", async () => {
			await moOTruong();
			await bam(
				[...document.body.querySelectorAll("[cmdk-item]")].find((x) =>
					x.textContent?.includes(THAO.name),
				),
			);
		});
		await dem("addPeople", async () => {
			await bam(nutTheoChu(document.body, m.chiTiet.themNguoi)[0]);
			await cho(() => mucChon().length > 0, "hop them");
			await tich("lan");
			await bam(nutTheoChu(hop(), "Thêm 1 người")[0]);
			await doiDong();
		});
		await dem("renameDepartment", async () => {
			await moMenu("Chăm sóc khách hàng");
			await chonMuc(m.doiTen);
			await hopDonVi("CSKH");
			await doiDong();
		});
		await dem("setPlacement", async () => {
			await bam(document.body.querySelector("button[data-nguoi='thao']"));
			await cho(() => khungMoi() > 0, "hop vi tri");
			await bam(nutTheoChu(hop(), m.viTri.luu)[0]);
			await doiDong();
		});
		await dem("archiveDepartment", async () => {
			const xn = await xacNhanLuuTru("Chăm sóc khách hàng");
			await bam(nutTheoChu(xn, m.luuTru)[0]);
			await doiDong();
		});
		await dem("restoreDepartment", async () => {
			const vung = document.body.querySelector(
				"[data-slot='archived-list']",
			) as HTMLElement;
			await bam(nutTheoChu(vung, `${m.daLuuTru} (1)`)[0]);
			await bam(nutTheoChu(vung, m.khoiPhuc)[0]);
		});
		bao.mockRestore();
		expect(
			thay.find((x) => x.startsWith("addPeople")) ===
				"addPeople: bao thanh cong"
				? ""
				: "addPeople khong bao thanh cong",
		).toBe("");
		expect(thay).toEqual(
			[
				"reorderDivisions",
				"createDivision",
				"moveDepartment",
				"createDepartment",
				"renameDivision",
				"attachDepartments",
				"setHead",
				"addPeople",
				"renameDepartment",
				"setPlacement",
				"archiveDepartment",
				"restoreDepartment",
			].map((ten) => `${ten}: bao thanh cong`),
		);
	});

	test("trang-thai: hop thoai cua man bi may chu tu choi thi loi hien duoi o dau va con tro o o do", async () => {
		const LOI = "May chu tu choi";
		for (const ten of [
			"createDivision",
			"setPlacement",
			"attachDepartments",
			"addPeople",
		])
			cheDo.set(ten, `${LOI} ${ten}`);
		await mo("?don=pb:pb-cskh");
		const thay: string[] = [];
		const do_ = async (ten: string) => {
			await cho(
				() => hop().querySelector("[data-slot='field-error']") !== null,
				`loi ${ten}`,
			);
			const loi = hop().querySelector(
				"[data-slot='field-error']",
			) as HTMLElement;
			const o = loi.closest("[data-slot='field']");
			const dong = `${ten}: loi=${loi.textContent === `${LOI} ${ten}`} con-tro=${o?.contains(document.activeElement) === true}`;
			await act(async () => {
				hop().dispatchEvent(
					new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
				);
			});
			const hoi = document.body.querySelector("[role='alertdialog']");
			thay.push(`${dong} hoi=${hoi !== null}`);
			if (hoi) await bam(nutTheoChu(hoi, "Bỏ")[0]);
			await doiDong();
		};

		await bam(
			nutTheoChu(
				document.body.querySelector(
					"[data-slot='page-shell-actions']",
				) as HTMLElement,
				m.themBoPhan,
			)[0],
		);
		await hopDonVi("Pháp lý");
		await do_("createDivision");

		await bam(document.body.querySelector("button[data-nguoi='thao']"));
		await cho(() => khungMoi() > 0, "hop vi tri");
		await bamNhuNguoi(nutTheoChu(hop(), m.viTri.luu)[0]);
		await do_("setPlacement");

		await bam(nutTheoChu(document.body, m.chiTiet.themNguoi)[0]);
		await cho(() => mucChon().length > 0, "hop them");
		await tich("lan");
		await bamNhuNguoi(nutTheoChu(hop(), "Thêm 1 người")[0]);
		await do_("addPeople");

		await bam(document.body.querySelector("[data-nut-cay='bp:bp-kd']"));
		await cho(() => khung() === "bo-phan", "khung bo phan");
		await bam(nutTheoChu(document.body, m.chiTiet.ganCoSan)[0]);
		await cho(() => mucChon().length > 0, "hop gan");
		await tich("pb-pc");
		await bamNhuNguoi(nutTheoChu(hop(), "Gắn 1 phòng ban")[0]);
		await do_("attachDepartments");

		expect(thay).toEqual([
			"createDivision: loi=true con-tro=true hoi=true",
			"setPlacement: loi=true con-tro=true hoi=false",
			"addPeople: loi=true con-tro=true hoi=false",
			"attachDepartments: loi=true con-tro=true hoi=false",
		]);
	});
});

async function goVung(o: HTMLTextAreaElement, chu: string): Promise<void> {
	const dat = Object.getOwnPropertyDescriptor(
		HTMLTextAreaElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function buocDangO(): string | null {
	return (
		hop()
			.querySelector("[role='listitem'][aria-current='step']")
			?.getAttribute("data-step") ??
		String(
			[...hop().querySelectorAll("[role='listitem']")].findIndex(
				(x) => x.getAttribute("aria-current") === "step",
			) + 1,
		)
	);
}

async function moNhap(): Promise<void> {
	await bam(
		nutTheoChu(
			document.body.querySelector(
				"[data-slot='page-shell-actions']",
			) as HTMLElement,
			m.nhap,
		)[0],
	);
	await cho(() => khungMoi() > 0, "hop nhap");
}

describe("nhap-ba-buoc", () => {
	test("nhap-ba-buoc: buoc dan, xem truoc neu ten don vi moi, ket qua co nut Xem cay", async () => {
		await mo("?don=bp:bp-kd");
		await moNhap();
		const thay: string[] = [];
		thay.push(`buoc 1: dang o ${buocDangO()}`);
		thay.push(
			`buoc 1: o dan ${hop().querySelector("[data-buoc-nhap='1'] textarea") !== null}`,
		);
		await goVung(
			hop().querySelector("textarea") as HTMLTextAreaElement,
			"hung@onehub.vn\tBảo hành\tTài chính",
		);
		await bam(nutTheoChu(hop(), m.nhapHop.xemTruoc)[0]);
		await cho(
			() => hop().querySelector("[data-buoc-nhap='2']") !== null,
			"buoc 2",
		);
		thay.push(`buoc 2: dang o ${buocDangO()}`);
		const tom = hop().querySelector("[data-tom-tat]");
		const ten = [...(tom?.querySelectorAll("[translate='no']") ?? [])].map(
			(x) => x.textContent,
		);
		thay.push(
			ten.join("|") === "Bảo hành|Tài chính"
				? "buoc 2: neu ten don vi moi"
				: "buoc 2 khong neu ten don vi moi",
		);
		for (const [i, loi] of LOI_NHAP.entries()) {
			const li = [
				...hop().querySelectorAll(`[aria-label="${m.nhapHop.dongHong}"] li`),
			].find((x) => x.textContent?.startsWith(`Dòng ${i + 3}:`));
			thay.push(
				li?.textContent === `Dòng ${i + 3}: ${loi}`
					? `dong ${i + 3}: dung cau`
					: `dong ${i + 3}: ${li?.textContent}`,
			);
		}
		daTao = { departments: ["Kho mới"], divisions: ["Tài chính"] };
		await bam(nutTheoChu(hop(), "Ghi 2 dòng · bỏ 3 dòng hỏng")[0]);
		await cho(
			() => hop().querySelector("[data-buoc-nhap='3']") !== null,
			"buoc 3",
		);
		thay.push(`buoc 3: dang o ${buocDangO()}`);
		const kq = hop().querySelector("[data-buoc-nhap='3']")?.textContent ?? "";
		thay.push(
			`buoc 3: ${kq.includes("Đã ghi 4 người.") && kq.includes("Tài chính")} xem-cay=${nutTheoChu(hop(), m.nhapHop.xemCay).length}`,
		);
		thay.push(
			kq.includes("Bảo hành")
				? "buoc 3 neu don vi ban xem truoc hua ma luot ghi khong tao"
				: "buoc 3: chi neu don vi luot ghi tao",
		);
		const dongMoi = [...hop().querySelectorAll("[data-buoc-nhap='3'] li")].map(
			(li) => li.textContent?.trim(),
		);
		thay.push(`buoc 3 theo loai: ${dongMoi.join(" | ")}`);
		thay.push(
			`applyImport xin ten: ${JSON.stringify(dauVaoCuoiCua("applyImport"))}`,
		);
		await bam(nutTheoChu(hop(), m.nhapHop.xemCay)[0]);
		await doiDong();
		expect({ thay, don: url.get("don"), khung: khung() }).toEqual({
			thay: [
				"buoc 1: dang o 1",
				"buoc 1: o dan true",
				"buoc 2: dang o 2",
				"buoc 2: neu ten don vi moi",
				"dong 3: dung cau",
				"dong 4: dung cau",
				"dong 5: dung cau",
				"buoc 3: dang o 3",
				"buoc 3: true xem-cay=1",
				"buoc 3: chi neu don vi luot ghi tao",
				`buoc 3 theo loai: ${m.nhapHop.pbMoi} Kho mới | ${m.nhapHop.bpMoi} Tài chính`,
				`applyImport xin ten: ${JSON.stringify({ text: "hung@onehub.vn\tBảo hành\tTài chính", traTen: true })}`,
			],
			don: "goc",
			khung: "goc",
		});
	});

	test("nhap-ba-buoc: ghi thanh cong bao toast.success mot lan, may chu tu choi thi loi duoi o dan va con tro o do", async () => {
		const bao = spyOn(toast, "success");
		await mo();
		await moNhap();
		await goVung(hop().querySelector("textarea") as HTMLTextAreaElement, "x");
		await bam(nutTheoChu(hop(), m.nhapHop.xemTruoc)[0]);
		await cho(() => hop().querySelector("[data-buoc-nhap='2']") !== null, "b2");
		const truoc = bao.mock.calls.length;
		await bam(nutTheoChu(hop(), "Ghi 2 dòng · bỏ 3 dòng hỏng")[0]);
		await cho(() => hop().querySelector("[data-buoc-nhap='3']") !== null, "b3");
		const lan = bao.mock.calls.length - truoc;
		bao.mockRestore();
		await bam(nutTheoChu(hop(), m.nhapHop.dongHop)[0]);
		await doiDong();

		cheDo.set("previewImport", "May chu tu choi previewImport");
		await moNhap();
		await goVung(hop().querySelector("textarea") as HTMLTextAreaElement, "x");
		const nut = nutTheoChu(hop(), m.nhapHop.xemTruoc)[0];
		await act(async () => {
			nut?.focus();
		});
		await bam(nut);
		await cho(
			() => hop().querySelector("[data-slot='field-error']") !== null,
			"loi nhap",
		);
		const loi = hop().querySelector("[data-slot='field-error']") as HTMLElement;
		expect({
			applyImport: lan === 1 ? "bao thanh cong" : `bao ${lan} lan`,
			loi: loi.textContent,
			conTro:
				loi.closest("[data-slot='field']")?.contains(document.activeElement) ===
				true,
		}).toEqual({
			applyImport: "bao thanh cong",
			loi: "May chu tu choi previewImport",
			conTro: true,
		});
	});
});
