import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { TreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

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
		position: 0,
		divisionId: "bp-kd",
		head: HUNG,
		stepCount: 3,
		people: [
			{ ...HUNG, primary: true },
			{ ...MAI, primary: true },
		],
	};
	const cskh = {
		id: "pb-cskh",
		name: "Chăm sóc khách hàng",
		position: 0,
		divisionId: "bp-vh",
		head: null,
		stepCount: 1,
		people: [
			{ ...THAO, primary: true },
			{ ...MAI, primary: false },
		],
	};
	const kho = {
		id: "pb-kho",
		name: "Kho vận",
		position: 1,
		divisionId: "bp-vh",
		head: null,
		stepCount: 0,
		people: [{ ...TUAN, primary: true }],
	};
	const pc = {
		id: "pb-pc",
		name: "Pháp chế",
		position: 0,
		divisionId: null,
		head: null,
		stepCount: 0,
		people: [],
	};
	const viTri = (n: typeof LAN, chinh: string | null, phu: string[]) => ({
		...n,
		primaryDepartmentId: chinh,
		secondaryDepartmentIds: phu,
		managerOverrideId: null,
		manager: null,
		managerSource: "khong-co" as const,
	});
	return {
		divisions: [
			{
				id: "bp-kd",
				name: "Kinh doanh",
				position: 0,
				head: LAN,
				departments: [pb1],
			},
			{
				id: "bp-vh",
				name: "Vận hành",
				position: 1,
				head: null,
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
			departments: [{ id: "pb-cu", name: "Marketing (cũ)", purgeable: true }],
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
				return { id: `${ten}-ok` };
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
		},
		onboarding: {
			listDepartments: thuTuc("listDepartments", () => []),
			manDanhMuc: thuTuc("manDanhMuc", () => null),
			archiveDepartment: thuTuc("archiveDepartment", khongDoc),
			restoreDepartment: thuTuc("restoreDepartment", khongDoc),
			purgeDepartment: thuTuc("purgeDepartment", khongDoc),
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
	const san = { o, root };
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
				"[data-chi-tiet='chua-co-phong-ban'] [data-nguoi] [data-ten]",
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

	await chonNut("bp:bp-vh");
	k = document.body.querySelector("[data-chi-tiet]") as HTMLElement;
	ghi("bo-phan", "o-truong", [
		...k.querySelectorAll<HTMLButtonElement>("[data-slot='combobox-trigger']"),
	]);
	ghi("bo-phan", "gan-co-san", nutTheoChu(k, m.chiTiet.ganCoSan));
	ghi("bo-phan", "phong-ban-moi", nutTheoChu(k, m.chiTiet.phongBanMoi));
	ghi("bo-phan", "tay-keo-phong-ban", nutTheoNhanAn(k, "Đổi thứ tự "));
	ghi("bo-phan", "menu", nutTheoNhanAn(k, "Thao tác với Vận hành"));

	await chonNut("pb:pb-1");
	k = document.body.querySelector("[data-chi-tiet]") as HTMLElement;
	ghi("phong-ban", "o-truong", [
		...k.querySelectorAll<HTMLButtonElement>("[data-slot='combobox-trigger']"),
	]);
	ghi("phong-ban", "them-nguoi", nutTheoChu(k, m.chiTiet.themNguoi));
	ghi("phong-ban", "menu", nutTheoNhanAn(k, "Thao tác với Kinh doanh vùng 1"));
	ghi(
		"phong-ban",
		"menu-dong-nguoi",
		nutTheoNhanAn(k, `Thao tác với ${HUNG.name}`),
	);

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
	"bo-phan/o-truong",
	"bo-phan/gan-co-san",
	"bo-phan/phong-ban-moi",
	"bo-phan/tay-keo-phong-ban",
	"bo-phan/menu",
	"phong-ban/o-truong",
	"phong-ban/them-nguoi",
	"phong-ban/menu",
	"phong-ban/menu-dong-nguoi",
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
