import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	Children,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { taoTuMauInput } from "../../../packages/validation/src/okr-mau";
import {
	createObjectiveInput,
	cyclesOutput,
	okrAccessOutput,
	okrImportApplyInput,
	okrImportInput,
	okrImportPreviewOutput,
	soanSanSangOutput,
} from "../../api/src/okr/okr.contracts";
import { danhSachOutput } from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";
import {
	CUOC,
	cho,
	dat,
	datLai,
	dinhVi,
	diTrang,
	go,
	goiCua,
	nhip,
} from "./khung-soan-okr";

mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" }));
mock.module("@/lib/session", () => ({ requireSession: async () => null }));
mock.module("@/lib/trpc/hydrate", () => ({
	HydrateClient: ({ children }: { children: unknown }) => children,
}));
mock.module("server-only", () => ({}));
mock.module("@/lib/trpc/server", () => ({
	getServerTrpc: () => ({}),
	getServerQueryClient: () => ({}),
	getServerTrpcClient: () => ({}),
}));

const { duongSoan } = await import("@/app/(app)/[slug]/okr/soan/duong-soan");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrMessages } = await import("@/lib/messages/okr");
const { okrSoanMessages } = await import("@/lib/messages/okr-soan");
const { TRO_LY_OKR_TRAN } = await import("@crm/validation/okr-tro-ly");
const { DauTrangOkr } = await import("@/app/(app)/[slug]/okr/thanh-tab");
const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
const { ID_KHONG_THEM } = await import("@/app/(app)/[slug]/okr/hanh-dong-khu");
const { PageShellActions } = await import("@/components/page-shell");
const { Button } = await import("@crm/ui/components/button");
const TRANG_SO_DO = await import("@/app/(app)/[slug]/okr/so-do/page");
const TRANG_QUANH = await import(
	"@/app/(app)/[slug]/okr/quanh-muc-tieu/[objectiveId]/page"
);

const mVi = okrMessages("vi");
const sVi = okrSoanMessages("vi");
const { dauThangSau, homNayVn } = await import("@/lib/okr-chu-ky-nhan");
const TRAN = String(TRO_LY_OKR_TRAN.soan.cuocMoiDonViMoiKy);

const nguoi = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@onehub.vn`,
});
const LAN = nguoi("lan", "Nguyễn Thị Lan");
const HUNG = nguoi("hung", "Trần Văn Hùng");
const MAI = nguoi("mai", "Lê Thanh Mai");

const pb = (
	id: string,
	name: string,
	divisionId: string,
	head: typeof LAN | null,
) => ({
	id,
	name,
	moTa: "",
	position: 0,
	divisionId,
	head,
	stepCount: 0,
	okrMo: 0,
	people: head ? [{ ...head, primary: true }] : [],
});

export const CAY = orgTreeOutput.parse({
	divisions: [
		{
			id: "B1",
			name: "Kinh doanh",
			moTa: "",
			position: 0,
			head: LAN,
			okrMo: 0,
			departments: [
				pb("P2", "Kinh doanh vùng 1", "B1", HUNG),
				pb("P3", "Kinh doanh vùng 2", "B1", MAI),
			],
		},
	],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [],
	archived: { divisions: [], departments: [] },
	coverage: { members: 3, withPrimary: 3, departmentsWithoutHead: 0 },
});

export type Pha = "lap-ke-hoach" | "dang-chay" | "cham-diem" | "da-dong";
const KY_SAU = {
	id: "n27",
	kind: "quy",
	name: "Quý 1/2027",
	parentId: null,
	startsOn: "2027-01-01",
	endsOn: "2027-03-31",
	phase: "lap-ke-hoach",
	breakStartsOn: null,
	breakEndsOn: null,
	updateWeekday: 1,
	cuaSoRa: null,
	anLuc: null,
	anLyDo: null,
	quyConHien: 0,
	viec: {
		suaMoiO: false,
		suaTen: false,
		go: false,
		an: false,
		hienLai: false,
	},
};
export const chuKy = (pha: Pha, haiKy = false) =>
	cyclesOutput.parse({
		cycles: [
			...(haiKy ? [KY_SAU] : []),
			{
				id: "q4",
				kind: "quy",
				name: "Quý 4/2026",
				parentId: null,
				startsOn: "2026-10-01",
				endsOn: "2026-12-31",
				phase: pha,
				breakStartsOn: null,
				breakEndsOn: null,
				updateWeekday: 1,
				cuaSoRa: null,
				anLuc: null,
				anLyDo: null,
				quyConHien: 0,
				viec: {
					suaMoiO: false,
					suaTen: false,
					go: false,
					an: false,
					hienLai: false,
				},
			},
		],
		currentId: "q4",
	});

export type NguoiXem = {
	ten: string;
	quanTri: boolean;
	headOf: { divisions: string[]; departments: string[] };
};
export const QT: NguoiXem = {
	ten: "quan-tri",
	quanTri: true,
	headOf: { divisions: [], departments: [] },
};
export const TB1: NguoiXem = {
	ten: "truong",
	quanTri: false,
	headOf: { divisions: ["B1"], departments: [] },
};
export const TP2: NguoiXem = {
	ten: "truong-pb",
	quanTri: false,
	headOf: { divisions: [], departments: ["P2"] },
};
export const TP23: NguoiXem = {
	ten: "truong-hai-pb",
	quanTri: false,
	headOf: { divisions: [], departments: ["P2", "P3"] },
};
export const TV: NguoiXem = {
	ten: "thanh-vien",
	quanTri: false,
	headOf: { divisions: [], departments: [] },
};

export const BAT = soanSanSangOutput.parse({
	bat: true,
	nac: "bat",
	soCuocDaDung: 0,
	tranCuoc: TRO_LY_OKR_TRAN.soan.cuocMoiDonViMoiKy,
	cuocDang: null,
	thieuBoiCanh: false,
});

export type Nen = {
	xem?: NguoiXem;
	pha?: Pha;
	duoc?: boolean;
	sanSang?: unknown;
	treoQuyen?: boolean;
	mau?: unknown[];
	haiKy?: boolean;
	suaDuoc?: boolean;
	cauNoi?: boolean;
};

export function datNen({
	xem = TB1,
	pha = "lap-ke-hoach",
	duoc = true,
	sanSang = BAT,
	treoQuyen = false,
	mau = [],
	haiKy = false,
	suaDuoc = duoc,
}: Nen) {
	dat("okr.cycles", () => chuKy(pha, haiKy));
	dat("okr.access", () => {
		if (treoQuyen) return new Promise(() => {});
		return okrAccessOutput.parse({
			canManageProgram: xem.quanTri,
			headOf: xem.headOf,
		});
	});
	dat("org.tree", () => CAY);
	dat("workspace.get", () => ({ name: "OneHub" }));
	dat("okr.countByUnit", () => ({}));
	dat("okr.danhSach", () => {
		if (treoQuyen) return new Promise(() => {});
		return danhSachOutput.parse({
			rows: [],
			daBo: [],
			total: 0,
			facetCounts: {
				phuTrach: [],
				loai: [],
				trangThai: [],
				tuTin: [],
				gopY: [],
			},
			canEdit: suaDuoc,
			canCreate: duoc,
		});
	});
	dat("okr.soanSanSang", () => sanSang);
	dat("okr.soanMo", () => ({ ok: true, cuoc: { ...CUOC, id: "cuoc-moi" } }));
	dat("okr.hoiYNhan", () => null);
	dat("okr.mau", () => ({ mau }));
}

export type San = {
	o: HTMLElement;
	root: Root;
	url: () => URLSearchParams;
	lichSu: () => string[];
};
let dangMo: San[] = [];

beforeEach(() => {
	datLai();
	diTrang.length = 0;
});

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

export async function dung(
	man: ReactElement,
	{
		locale = "vi",
		thamSo = "",
		duong,
	}: { locale?: Locale; thamSo?: string; duong: string },
): Promise<San> {
	dinhVi.duong = duong;
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	let url = new URLSearchParams(thamSo);
	const lichSu: string[] = [];
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					url = new URLSearchParams(e.searchParams);
					lichSu.push(e.options.history);
				}}
				searchParams={thamSo}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root, url: () => url, lichSu: () => lichSu };
	dangMo.push(san);
	await nhip(10);
	return san;
}

export const q = (chon: string, goc: ParentNode = document) =>
	goc.querySelector<HTMLElement>(chon);
export const qa = (chon: string, goc: ParentNode = document) => [
	...goc.querySelectorAll<HTMLElement>(chon),
];

const nguoiDung = () =>
	userEvent.setup({ document, pointerEventsCheck: 0, delay: null });
export async function bam(o: Element | null, moTa: string) {
	if (!o) throw new Error(`khong thay: ${moTa}`);
	await act(async () => {
		await nguoiDung().click(o);
	});
	await nhip(6);
}

export function soSai() {
	const sai: string[] = [];
	return {
		kiem(dung: boolean, cau: string) {
			if (!dung) sai.push(cau);
		},
		xong(ten: string, soO: number) {
			console.log(`${ten}: ${soO - sai.length}/${soO} o dat`);
			if (sai.length > 0) throw new Error(sai.join("\n"));
		},
	};
}

export const soLanGoi = (duong: string) => goiCua(duong).length;

describe("mnt-soan", () => {
	const NGAY = "01/11/2026";
	const goc = {
		don: { loai: "pb", id: "P2" } as const,
		cycleId: "q4",
		phaKy: "lap-ke-hoach" as const,
		quanTri: false,
		canEdit: true,
		cauNoi: true,
		tenDon: "Kinh doanh vùng 1",
		sanSang: BAT,
		m: sVi,
		mo: mVi,
		ngayMoLai: NGAY,
	};
	const tat = (lyDo: string) => soanSanSangOutput.parse({ bat: false, lyDo });
	const MA_TRAN = [
		{ o: "mo", vao: {}, mong: { loai: "mo", cheDoAn: false } },
		{
			o: "tiep",
			vao: {
				sanSang: soanSanSangOutput.parse({ ...BAT, cuocDang: CUOC }),
			},
			mong: { loai: "tiep", cuocId: CUOC.id },
		},
		{
			o: "dang-chay",
			vao: { phaKy: "dang-chay" },
			mong: { loai: "khoa", lyDo: mVi.chonDuong.khoa.ngoaiPha },
		},
		{
			o: "het-cuoc",
			vao: { sanSang: tat("het-cuoc-ky") },
			mong: { loai: "khoa", lyDo: sVi.nut.hetCuoc(TRAN) },
		},
		{
			o: "het-tran",
			vao: { sanSang: tat("het-tran-thang") },
			mong: { loai: "khoa", lyDo: sVi.nut.tamNghi(NGAY) },
		},
		{
			o: "chua-khoa",
			vao: { sanSang: tat("chua-co-khoa-mo-hinh") },
			mong: { loai: "khoa", lyDo: sVi.lyDo["chua-co-khoa-mo-hinh"] },
		},
		{
			o: "chua-cau-hinh",
			vao: { cauNoi: false },
			mong: { loai: "khoa", lyDo: sVi.nut.chuaCauHinh },
		},
		{
			o: "khong-quyen",
			vao: { canEdit: false },
			mong: {
				loai: "khoa",
				lyDo: mVi.khoaTao.khongSua.replace("{ten}", "Kinh doanh vùng 1"),
			},
		},
		{
			o: "ca-nhan",
			vao: { don: { loai: "nguoi", id: "hung" } },
			mong: { loai: "khoa", lyDo: mVi.chonDuong.khoa.caNhan },
		},
		{
			o: "chua-bat",
			vao: { sanSang: tat("don-vi-chua-bat") },
			mong: { loai: "khoa", lyDo: sVi.lyDo["don-vi-chua-bat"] },
		},
		{
			o: "che-do-an-thanh-vien",
			vao: { sanSang: soanSanSangOutput.parse({ ...BAT, nac: "an" }) },
			mong: { loai: "khoa", lyDo: sVi.lyDo["don-vi-che-do-an"] },
		},
		{
			o: "che-do-an-quan-tri",
			vao: {
				quanTri: true,
				sanSang: soanSanSangOutput.parse({ ...BAT, nac: "an" }),
			},
			mong: { loai: "mo", cheDoAn: true },
		},
	];

	test("mnt-soan: 12 o trang thai duong Soan cung Kara, ly do rut tu messages", () => {
		const s = soSai();
		for (const o of MA_TRAN) {
			const kq = duongSoan({ ...goc, ...o.vao } as Parameters<
				typeof duongSoan
			>[0]);
			const khop = JSON.stringify({ ...kq, ...o.mong }) === JSON.stringify(kq);
			s.kiem(
				khop,
				`mnt-soan: ${o.o} mong ${JSON.stringify(o.mong)}, nhan ${JSON.stringify(kq)}`,
			);
		}
		s.xong("mnt-soan", MA_TRAN.length);
		expect(MA_TRAN.length).toBe(12);
	});
});

const DUONG_MAN = {
	"cua-toi": "/ws/okr",
	"bo-okr": "/ws/okr/bo-okr",
	"lay-y-kien": "/ws/okr/lay-y-kien",
	"suc-khoe": "/ws/okr/suc-khoe",
} as const;
type ManDau = keyof typeof DUONG_MAN;

async function dauTrang(
	man: ManDau,
	nen: Nen,
	thamSo = "",
	kemThan = false,
	locale: Locale = "vi",
): Promise<San> {
	datNen(nen);
	return dung(
		<>
			<DauTrangOkr cauNoi={nen.cauNoi ?? true} />
			{kemThan ? <TheoDonVi /> : null}
		</>,
		{ duong: DUONG_MAN[man], thamSo, locale },
	);
}

const hang = () => q("[data-hang-hanh-dong]");
const laNutChinh = (e: Element) => {
	const v = e.getAttribute("data-variant");
	return v === null || v === "default";
};
const nutChinh = (goc: ParentNode | null) =>
	goc ? qa("[data-slot=button]", goc).filter(laNutChinh) : [];
const CHON_TAO = [
	"[data-nut=them-muc-tieu]",
	"[data-nut=them-cach]",
	"[data-nut=nhap-bang-tinh]",
	"[data-nhom-soan]",
	"[data-nut=thong-tin-soan]",
];
const demTao = (goc: ParentNode | null) =>
	goc ? CHON_TAO.reduce((n, c) => n + qa(c, goc).length, 0) : 0;

describe("mnt-dau-trang", () => {
	const PHA: Pha[] = ["lap-ke-hoach", "dang-chay", "cham-diem", "da-dong"];
	test("mnt-dau-trang: 16 o — Cua toi va Bo OKR chi mot nut chinh Them muc tieu, cuoi hang; 2 o dang tai", async () => {
		const s = soSai();
		let soO = 0;
		for (const man of ["cua-toi", "bo-okr"] as const)
			for (const pha of PHA)
				for (const xem of [TB1, QT]) {
					soO += 1;
					const ten = `${man}/${pha}/${xem.ten}`;
					await dauTrang(
						man,
						{ xem, pha },
						man === "bo-okr" ? "?donOkr=goc" : "",
					);
					const h = hang();
					const chinh = nutChinh(h);
					const con = h ? [...h.children] : [];
					const cuoi = con.at(-1);
					s.kiem(
						chinh.length === 1 &&
							chinh[0]?.getAttribute("data-nut") === "them-muc-tieu",
						`mnt-dau-trang: ${ten} nut chinh = ${chinh.map((e) => e.getAttribute("data-nut")).join(",")}`,
					);
					s.kiem(
						cuoi?.getAttribute("data-nut") === "them-muc-tieu",
						`mnt-dau-trang: ${ten} nut cuoi hang = ${cuoi?.getAttribute("data-nut")}`,
					);
					for (const c of CHON_TAO.slice(1))
						s.kiem(
							qa(c, h ?? document).length === 0,
							`mnt-dau-trang: ${ten} con ${c.replace(/\[|\]|data-nut=/g, "")}`,
						);
					const khac = qa("[data-slot=button]", h ?? document).filter(
						(e) =>
							!["them-muc-tieu", "hoi-kara"].includes(
								e.getAttribute("data-nut") ?? "",
							),
					);
					s.kiem(
						khac.length === 0,
						`mnt-dau-trang: ${ten} con nut khac ${khac.map((e) => e.getAttribute("data-nut") ?? e.textContent).join(",")}`,
					);
					await don();
				}
		for (const man of ["cua-toi", "bo-okr"] as const) {
			soO += 1;
			await dauTrang(
				man,
				{ xem: TB1, treoQuyen: true },
				man === "bo-okr" ? "?donOkr=goc" : "",
			);
			const h = hang();
			s.kiem(
				qa("[data-hang-cho]", h ?? document).length === 1 &&
					qa("[data-nut=them-muc-tieu]", h ?? document).length === 0,
				`mnt-dau-trang: ${man}/dang-tai nut bam duoc`,
			);
			await don();
		}
		s.xong("mnt-dau-trang", soO);
		expect(soO).toBe(18);
	});
});

type PropsNut = {
	children?: ReactNode;
	variant?: string;
	"data-nut"?: string;
};

const NUT_MAU_DOI_CHUNG = "mau-doi-chung";

async function NutMauDoiChung() {
	return <Button data-nut={NUT_MAU_DOI_CHUNG}>{NUT_MAU_DOI_CHUNG}</Button>;
}

async function nutTrangServer(el: ReactNode): Promise<Element[]> {
	const ra: Element[] = [];
	const di = async (n: ReactNode, trongHang: boolean): Promise<void> => {
		for (const c of Children.toArray(n)) {
			if (!isValidElement<PropsNut>(c)) continue;
			const vaoHang = trongHang || c.type === PageShellActions;
			if (vaoHang && c.type === Button) {
				const o = document.createElement("button");
				o.setAttribute("data-slot", "button");
				if (c.props.variant) o.setAttribute("data-variant", c.props.variant);
				if (c.props["data-nut"])
					o.setAttribute("data-nut", c.props["data-nut"]);
				ra.push(o);
				continue;
			}
			if (
				vaoHang &&
				c.type instanceof Function &&
				c.type.constructor.name === "AsyncFunction"
			) {
				const ham = c.type as (p: PropsNut) => Promise<ReactNode>;
				await di(await ham(c.props), true);
				continue;
			}
			await di(c.props.children, vaoHang);
		}
	};
	await di(el, false);
	return ra;
}

async function dauTrangServer(man: "so-do" | "quanh"): Promise<Element[]> {
	const thamSo = Promise.resolve({});
	const el =
		man === "so-do"
			? await TRANG_SO_DO.default({ searchParams: thamSo })
			: await TRANG_QUANH.default({
					params: Promise.resolve({ slug: "ws", objectiveId: "m1" }),
				});
	return nutTrangServer(el);
}

describe("mnt-man-doc", () => {
	test("mnt-man-doc: 6 o client x vai, 2 o trang server tinh, 2 o dang tai — khong nut chinh, khong nut tao; doi chung duong", async () => {
		const s = soSai();
		let soO = 0;
		for (const xem of [QT, TB1, TV]) {
			for (const man of ["lay-y-kien", "suc-khoe"] as const) {
				soO += 1;
				await dauTrang(man, { xem });
				const h = q("[data-slot=page-shell-actions]");
				s.kiem(
					nutChinh(h).length === 0 && demTao(h) === 0,
					`mnt-man-doc: ${man}/${xem.ten} co nut chinh`,
				);
				await don();
			}
		}
		for (const man of ["so-do", "quanh"] as const) {
			soO += 1;
			datNen({ xem: TB1 });
			const nut = await dauTrangServer(man);
			s.kiem(
				nut.filter(laNutChinh).length === 0 &&
					nut.filter((e) => CHON_TAO.some((c) => e.matches(c))).length === 0,
				`mnt-man-doc: ${man} co nut chinh`,
			);
		}
		for (const man of ["lay-y-kien", "suc-khoe"] as const) {
			soO += 1;
			await dauTrang(man, { xem: TB1, treoQuyen: true });
			const h = q("[data-slot=page-shell-actions]");
			s.kiem(
				qa("[data-hang-cho]", h ?? document).length === 0 &&
					nutChinh(h).length === 0,
				`mnt-man-doc: ${man}/dang-tai co khung cho nut chinh`,
			);
			await don();
		}
		soO += 1;
		const mau = await nutTrangServer(
			<div>
				<PageShellActions>
					<NutMauDoiChung />
				</PageShellActions>
			</div>,
		);
		s.kiem(
			mau.some((e) => e.getAttribute("data-nut") === NUT_MAU_DOI_CHUNG),
			`mnt-man-doc: doi chung khong thay nut ${NUT_MAU_DOI_CHUNG} trong PageShellActions (bo duyet trang server mu)`,
		);
		soO += 1;
		await dauTrang("bo-okr", { xem: TB1 }, "?donOkr=goc");
		s.kiem(
			nutChinh(hang()).length === 1,
			"mnt-man-doc: doi chung bo-okr/truong khong thay nut chinh (bo dem mu)",
		);
		await don();
		s.xong("mnt-man-doc", soO);
		expect(soO).toBe(12);
	});
});

async function don() {
	for (const s of dangMo) await act(async () => s.root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
	datLai();
}

const hop = () => q("[data-hop-chon-duong]");
const dong = (d: string) => q(`[data-hop-chon-duong] [data-duong=${d}]`);
const THU_TU = ["tu-viet", "tu-mau", "bang-tinh", "soan"];

const hinhChu = (o: ReturnType<typeof okrMessages>["chonDuong"]) =>
	JSON.stringify(o, (_k, v) => (v instanceof Object ? v : ""));

describe("mnt-hop", () => {
	test("mnt-hop: (a) bo-okr pb:P2 — tieu de, ten don vi, bon duong dung thu tu, dau Kara", async () => {
		const s = soSai();
		await dauTrang("bo-okr", { xem: TP2 }, "?donOkr=pb:P2");
		await bam(q("[data-nut=them-muc-tieu]"), "nut them");
		const h = hop();
		s.kiem(h !== null, "mnt-hop: hop khong mo");
		s.kiem(
			q("[data-slot=dialog-title]", h ?? document)?.textContent ===
				mVi.themMucTieu,
			"mnt-hop: tieu de hop",
		);
		s.kiem(
			q("[data-slot=dialog-description] [translate=no]", h ?? document)
				?.textContent === "Kinh doanh vùng 1",
			"mnt-hop: mo ta khong goi ten don vi dich",
		);
		const thuTu = qa("[data-duong]", h ?? document).map((e) =>
			e.getAttribute("data-duong"),
		);
		s.kiem(
			JSON.stringify(thuTu) === JSON.stringify(THU_TU),
			`mnt-hop: thu tu duong ${thuTu.join(",")}`,
		);
		for (const d of THU_TU) {
			const o = dong(d);
			s.kiem(
				o?.tagName === "BUTTON" &&
					(q("[data-slot=item-title]", o)?.textContent ?? "") !== "" &&
					(q("[data-slot=item-description]", o)?.textContent ?? "") !== "",
				`mnt-hop: dong ${d} thieu nut, tieu de hay mo ta`,
			);
		}
		s.kiem(
			q("[data-slot=kara-mark]", dong("soan") ?? document) !== null,
			"mnt-hop: dong soan thieu dau Kara",
		);
		s.xong("mnt-hop", 4 + THU_TU.length);
	});

	test("mnt-hop: (b) cua-toi truong bo phan — mo ta goi ten bo phan donDich chon", async () => {
		await dauTrang("cua-toi", { xem: TB1 });
		await bam(q("[data-nut=them-muc-tieu]"), "nut them");
		const ten = q(
			"[data-hop-chon-duong] [data-slot=dialog-description] [translate=no]",
		)?.textContent;
		if (ten !== "Kinh doanh")
			throw new Error(`mnt-hop: cua-toi goi ten ${ten}`);
	});

	test("mnt-hop: (c)(d) tham so tren duong dan, tai lai van mo, Esc dong va tra focus, ghi bang history push", async () => {
		const san = await dauTrang("bo-okr", { xem: TP2 }, "?donOkr=pb:P2");
		await bam(q("[data-nut=them-muc-tieu]"), "nut them");
		if (san.url().get("themMucTieu") !== "true")
			throw new Error("mnt-hop: tai lai khong mo hop (tham so vang)");
		if (!san.lichSu().includes("push"))
			throw new Error("mnt-hop: hop mo khong ghi history push");
		await don();
		await dauTrang("bo-okr", { xem: TP2 }, "?donOkr=pb:P2&themMucTieu=true");
		if (!hop()) throw new Error("mnt-hop: tai lai khong mo hop");
		await act(async () => {
			await userEvent
				.setup({ document, pointerEventsCheck: 0, delay: null })
				.keyboard("{Escape}");
		});
		await nhip(6);
		if (hop()) throw new Error("mnt-hop: Esc khong dong hop");
		const san2 = dangMo.at(-1);
		if (san2?.url().get("themMucTieu"))
			throw new Error("mnt-hop: Esc khong go tham so");
		await don();
		await dauTrang("bo-okr", { xem: TP2 }, "?donOkr=pb:P2");
		const nut = q("[data-nut=them-muc-tieu]");
		await bam(nut, "nut them");
		await act(async () => {
			await userEvent
				.setup({ document, pointerEventsCheck: 0, delay: null })
				.keyboard("{Escape}");
		});
		await nhip(6);
		if (document.activeElement !== nut)
			throw new Error("mnt-hop: Esc khong tra focus ve nut them");
	});

	test("mnt-hop: (e) moi khoa chu cua hop co o ca ban vi va en", () => {
		const vi = hinhChu(okrMessages("vi").chonDuong);
		const en = hinhChu(okrMessages("en").chonDuong);
		if (vi !== en) throw new Error("mnt-hop: khoa thieu ban en");
		const so = vi.split('":""').length - 1;
		if (so < 12) throw new Error(`mnt-hop: chi ${so} khoa`);
	});

	test("mnt-hop: (f) loi Cac cuoc da soan khi da dung cuoc", async () => {
		await dauTrang(
			"bo-okr",
			{ xem: TP2, sanSang: { ...BAT, soCuocDaDung: 2 } },
			"?donOkr=pb:P2",
		);
		await bam(q("[data-nut=them-muc-tieu]"), "nut them");
		const nut = q("[data-hop-chon-duong] [data-nut=ds-cuoc]");
		if (!nut) throw new Error("mnt-hop: thieu loi cac cuoc da soan");
		await bam(nut, "ds-cuoc");
		if (dangMo.at(-1)?.url().get("dsCuoc") !== "1")
			throw new Error("mnt-hop: ds-cuoc khong mo danh sach");
		await don();
		await dauTrang("bo-okr", { xem: TP2 }, "?donOkr=pb:P2");
		await bam(q("[data-nut=them-muc-tieu]"), "nut them");
		if (q("[data-hop-chon-duong] [data-nut=ds-cuoc]"))
			throw new Error("mnt-hop: ds-cuoc hien khi chua dung cuoc");
	});
});

describe("mnt-soan", () => {
	const tat = (lyDo: string) => soanSanSangOutput.parse({ bat: false, lyDo });
	const O = [
		{
			o: "dang-chay",
			nen: { pha: "dang-chay" as Pha },
			ly: mVi.chonDuong.khoa.ngoaiPha,
		},
		{
			o: "het-cuoc",
			nen: { sanSang: tat("het-cuoc-ky") },
			ly: sVi.nut.hetCuoc(TRAN),
		},
		{
			o: "chua-khoa",
			nen: { sanSang: tat("chua-co-khoa-mo-hinh") },
			ly: sVi.lyDo["chua-co-khoa-mo-hinh"],
		},
		{
			o: "chua-bat",
			nen: { sanSang: tat("don-vi-chua-bat") },
			ly: sVi.lyDo["don-vi-chua-bat"],
		},
		{
			o: "het-tran",
			nen: { sanSang: tat("het-tran-thang") },
			ly: sVi.nut.tamNghi(dauThangSau(homNayVn(new Date()))),
		},
		{
			o: "chua-cau-hinh",
			nen: { cauNoi: false },
			ly: sVi.nut.chuaCauHinh,
		},
		{
			o: "khong-quyen",
			nen: { suaDuoc: false },
			ly: mVi.khoaTao.khongSua.replace("{ten}", "Kinh doanh vùng 1"),
		},
	];
	test("mnt-soan: chon dong — mo cuoc moi goi soanMo mot lan, tiep cuoc khong goi, dong khoa khong goi", async () => {
		const s = soSai();
		const san = await dauTrang("bo-okr", { xem: TP2 }, "?donOkr=pb:P2");
		await bam(q("[data-nut=them-muc-tieu]"), "nut them");
		await bam(dong("soan"), "dong soan");
		s.kiem(
			soLanGoi("okr.soanMo") === 1,
			`mnt-soan: mo goi soanMo ${soLanGoi("okr.soanMo")} lan`,
		);
		s.kiem(
			(san.url().get("record") ?? "").includes("cuoc-moi"),
			`mnt-soan: khung ban ghi khong mo cuoc moi (${san.url().get("record")})`,
		);
		await don();
		const san2 = await dauTrang(
			"bo-okr",
			{
				xem: TP2,
				sanSang: soanSanSangOutput.parse({ ...BAT, cuocDang: CUOC }),
			},
			"?donOkr=pb:P2",
		);
		await bam(q("[data-nut=them-muc-tieu]"), "nut them");
		s.kiem(
			q("[data-slot=item-title]", dong("soan") ?? document)?.textContent ===
				mVi.chonDuong.tiep,
			"mnt-soan: tiep tieu de khong phai Tiep cuoc dang soan",
		);
		await bam(dong("soan"), "dong soan tiep");
		s.kiem(
			soLanGoi("okr.soanMo") === 0,
			"mnt-soan: mo cuoc moi khi dang co cuoc",
		);
		s.kiem(
			(san2.url().get("record") ?? "").includes(CUOC.id),
			"mnt-soan: tiep khong mo dung cuoc",
		);
		await don();
		for (const o of O) {
			await dauTrang("bo-okr", { xem: TP2, ...o.nen }, "?donOkr=pb:P2");
			await bam(q("[data-nut=them-muc-tieu]"), "nut them");
			const d = dong("soan");
			s.kiem(d !== null, `mnt-soan: ${o.o} dong vang`);
			s.kiem(
				d?.getAttribute("aria-disabled") === "true" &&
					q("[data-slot=item-description]", d ?? document)?.textContent ===
						o.ly,
				`mnt-soan: ${o.o} khong khoa dung ly do`,
			);
			await bam(d, "dong soan khoa");
			s.kiem(soLanGoi("okr.soanMo") === 0, `mnt-soan: ${o.o} van goi soanMo`);
			await don();
		}
		s.xong("mnt-soan", 5 + O.length * 3);
	});

	test("mnt-soan: bam dong Soan hai lan khi dang cho chi goi soanMo mot lan", async () => {
		await dauTrang("bo-okr", { xem: TP2 }, "?donOkr=pb:P2");
		dat("okr.soanMo", () => new Promise(() => {}));
		await bam(q("[data-nut=them-muc-tieu]"), "nut them");
		const d = dong("soan");
		await act(async () => {
			d?.click();
			d?.click();
		});
		await nhip(6);
		if (soLanGoi("okr.soanMo") !== 1)
			throw new Error(
				`mnt-soan: bam hai lan goi ${soLanGoi("okr.soanMo")} lan`,
			);
	});

	test("mnt-soan: phan hoi soanMo — con cuoc thi mo cuoc do, tu choi thi doc lai san sang, loi thi bam lai duoc", async () => {
		const s = soSai();
		const san = await dauTrang("bo-okr", { xem: TP2 }, "?donOkr=pb:P2");
		dat("okr.soanMo", () => ({
			ok: false,
			lyDo: "con-cuoc-dang",
			cuocDang: { ...CUOC, id: "cuoc-cu" },
		}));
		await bam(q("[data-nut=them-muc-tieu]"), "nut them");
		await bam(dong("soan"), "dong soan");
		const vao = goiCua("okr.soanMo")[0]?.dauVao as
			| { level?: string; departmentId?: string | null }
			| undefined;
		s.kiem(
			vao?.level === "phong-ban" && vao.departmentId === "P2",
			`mnt-soan: soanMo gui sai don vi ${JSON.stringify(vao)}`,
		);
		await cho(
			() => (san.url().get("record") ?? "").includes("cuoc-cu"),
			"mnt-soan: con cuoc dang khong mo cuoc-cu",
		);
		await don();

		const san2 = await dauTrang("bo-okr", { xem: TP2 }, "?donOkr=pb:P2");
		dat("okr.soanMo", () => ({
			ok: false,
			lyDo: "het-cuoc-ky",
			cuocDang: null,
		}));
		await bam(q("[data-nut=them-muc-tieu]"), "nut them");
		const hoiTruoc = soLanGoi("okr.soanSanSang");
		await bam(dong("soan"), "dong soan");
		await nhip(6);
		s.kiem(
			soLanGoi("okr.soanSanSang") === hoiTruoc + 1,
			`mnt-soan: tu choi khong doc lai san sang (${hoiTruoc} → ${soLanGoi("okr.soanSanSang")})`,
		);
		s.kiem(
			san2.url().get("record") === null,
			`mnt-soan: tu choi van mo ban ghi ${san2.url().get("record")}`,
		);
		await don();

		const san3 = await dauTrang("bo-okr", { xem: TP2 }, "?donOkr=pb:P2");
		dat("okr.soanMo", () => {
			throw new Error("mat mang");
		});
		await bam(q("[data-nut=them-muc-tieu]"), "nut them");
		await bam(dong("soan"), "dong soan");
		await nhip(6);
		if (hop() === null)
			await bam(q("[data-nut=them-muc-tieu]"), "nut them lai");
		await bam(dong("soan"), "dong soan lan hai");
		await nhip(6);
		s.kiem(
			soLanGoi("okr.soanMo") === 2,
			`mnt-soan: loi xong bam lai goi soanMo ${soLanGoi("okr.soanMo")} lan`,
		);
		s.kiem(
			san3.url().get("record") === null,
			`mnt-soan: loi van mo ban ghi ${san3.url().get("record")}`,
		);
		s.xong("mnt-soan", 5);
	});
});

describe("mnt-khoa", () => {
	test("mnt-khoa: 4 o vai khoa nut kem ly do; 4 o duong dan mo thang bi go; doi chung duong", async () => {
		const s = soSai();
		const VAI = [
			{ man: "cua-toi" as const, xem: TV, tham: "", ly: mVi.khoaTao.chuaDan },
			{
				man: "bo-okr" as const,
				xem: TV,
				tham: "?donOkr=pb:P2",
				ly: mVi.khoaTao.khongSua.replace("{ten}", "Kinh doanh vùng 1"),
			},
			{
				man: "cua-toi" as const,
				xem: TP2,
				tham: "",
				ly: mVi.khoaTao.khongSua.replace("{ten}", "Kinh doanh vùng 1"),
			},
			{
				man: "bo-okr" as const,
				xem: TP2,
				tham: "?donOkr=pb:P3",
				ly: mVi.khoaTao.khongSua.replace("{ten}", "Kinh doanh vùng 2"),
			},
		];
		for (const v of VAI) {
			await dauTrang(v.man, { xem: v.xem, duoc: false }, v.tham);
			const n = q("[data-nut=them-muc-tieu]");
			s.kiem(
				n?.hasAttribute("disabled") === true &&
					n.getAttribute("aria-describedby") === ID_KHONG_THEM &&
					q(`#${ID_KHONG_THEM}`)?.textContent === v.ly,
				`mnt-khoa: ${v.man}/${v.xem.ten} nut khong khoa dung ly do (${q(`#${ID_KHONG_THEM}`)?.textContent})`,
			);
			await don();
		}
		const URL = [
			{
				o: "hop-chon",
				tham: "themMucTieu=true",
				khoa: ["themMucTieu"],
				dau: "[data-hop-chon-duong]",
			},
			{
				o: "ngan-tao",
				tham: "new=true",
				khoa: ["new"],
				dau: "[data-hop-thoai-muc-tieu]",
			},
			{
				o: "ngan-mau",
				tham: "new=true&tuMauOkr=true",
				khoa: ["new", "tuMauOkr"],
				dau: "[data-hop-thoai-muc-tieu]",
			},
			{
				o: "nhap",
				tham: "nhapOkr=true",
				khoa: ["nhapOkr"],
				dau: "[role=dialog]",
			},
		];
		const GHI = [
			"okr.createObjective",
			"okr.taoTuMau",
			"okr.previewImport",
			"okr.applyImport",
			"okr.soanMo",
		];
		for (const u of URL) {
			const san = await dauTrang(
				"bo-okr",
				{ xem: TV, duoc: false },
				`?donOkr=pb:P2&${u.tham}`,
				true,
			);
			s.kiem(
				qa("[role=dialog]").length === 0 && GHI.every((g) => soLanGoi(g) === 0),
				`mnt-khoa: ${u.o} hop mo khi khong quyen`,
			);
			s.kiem(
				u.khoa.every((k) => !san.url().get(k)),
				`mnt-khoa: ${u.o} tham so khong bi go`,
			);
			await don();
			await dauTrang("bo-okr", { xem: TP2 }, `?donOkr=pb:P2&${u.tham}`, true);
			s.kiem(
				q(u.dau) !== null,
				`mnt-khoa: doi chung ${u.o} khong mo khi co quyen`,
			);
			await don();
		}
		await dauTrang("bo-okr", { xem: TP2 }, "?donOkr=pb:P2");
		await bam(q("[data-nut=them-muc-tieu]"), "nut them");
		await bam(dong("soan"), "dong soan");
		s.kiem(
			soLanGoi("okr.soanMo") === 1,
			"mnt-khoa: doi chung bo dem ghi khong thay soanMo khi co quyen",
		);
		await don();
		s.xong("mnt-khoa", VAI.length + URL.length * 3 + 1);
	});
});

const M1 = {
	id: "m1",
	ten: "Giữ khách cũ",
	cap: "phong-ban",
	donViIds: ["P2"],
	soKr: 1,
	daDung: 0,
	luuTru: false,
	noiDung: {
		cauMucTieu: "Giữ chân khách hàng cũ quý này",
		loai: "cam-ket",
		krs: [
			{
				title: "Hoàn tất gọi lại toàn bộ khách cũ",
				kind: "moc",
				unit: "",
				startValue: null,
				targetValue: null,
			},
		],
	},
};
const M1_P3 = { ...M1, id: "m1p3", donViIds: ["P3"] };
const M1_BP = { ...M1, id: "m1bp", cap: "bo-phan", donViIds: ["B1"] };

async function moHop(man: ManDau, nen: Nen, thamSo = "") {
	const san = await dauTrang(man, nen, thamSo, man === "bo-okr");
	await bam(q("[data-nut=them-muc-tieu]"), "nut them");
	return san;
}

const duongCuoi = () => new URL(`http://x${diTrang.at(-1)?.duong ?? ""}`);

async function chonDiTrang(san: San, duong: string, ten: string) {
	const ghiTruoc = san.lichSu().length;
	const diTruoc = diTrang.length;
	await bam(dong(duong), duong);
	await nhip(6);
	const ghi = san.lichSu().length - ghiTruoc;
	const di = diTrang.length - diTruoc;
	if (di !== 1 || ghi !== 0)
		throw new Error(
			`${ten}: cua-toi chuyen trang ${di} lan, ghi URL tai cho ${ghi} lan — lan ghi tai cho de mat lan chuyen trang`,
		);
}

describe("mnt-tu-viet", () => {
	test("mnt-tu-viet: (a) bo-okr — ngan tao dung don vi, khong nut chen, luu goi createObjective", async () => {
		await moHop(
			"bo-okr",
			{ xem: TP23, haiKy: true },
			"?donOkr=pb:P3&kyOkr=n27",
		);
		await bam(dong("tu-viet"), "tu-viet");
		await cho(() => q("[data-hop-thoai-muc-tieu=moi]") !== null, "ngan tao mo");
		if (hop()) throw new Error("mnt-tu-viet: hop chon khong dong");
		const ngan = q("[data-hop-thoai-muc-tieu=moi]");
		const oDon = (ngan ?? document).querySelector<HTMLInputElement>(
			'input[id$="-don-vi"]',
		);
		if (oDon?.value !== "Kinh doanh vùng 2")
			throw new Error("mnt-tu-viet: unitId lech (o don vi)");
		if (q("[data-nut=bat-dau-tu-mau]"))
			throw new Error("mnt-tu-viet: ngan con bat-dau-tu-mau");
		dat("okr.createObjective", () => ({ id: "mt-moi", canhBao: null }));
		await go(q('input[id$="-ten"]', ngan ?? document), "Mục tiêu thử");
		await bam(q("[data-nut=gui-muc-tieu]"), "gui");
		const goiTao = goiCua("okr.createObjective");
		if (goiTao.length !== 1)
			throw new Error(`mnt-tu-viet: createObjective ${goiTao.length} lan`);
		const vao = createObjectiveInput.parse(goiTao[0]?.dauVao);
		if (
			vao.unit.level !== "phong-ban" ||
			!("departmentId" in vao.unit) ||
			vao.unit.departmentId !== "P3"
		)
			throw new Error(`mnt-tu-viet: unitId lech ${JSON.stringify(vao.unit)}`);
		if (vao.cycleId !== "n27")
			throw new Error(`mnt-tu-viet: cycleId lech ${vao.cycleId}`);
	});

	test("mnt-tu-viet: (b) cua-toi — sang Bo OKR cua don vi dich voi ngan tao mo, khong mang hop chon", async () => {
		const san = await moHop("cua-toi", { xem: TB1 });
		await chonDiTrang(san, "tu-viet", "mnt-tu-viet");
		const u = duongCuoi();
		if (
			!u.pathname.endsWith("/okr/bo-okr") ||
			u.searchParams.get("donOkr") !== "bp:B1" ||
			u.searchParams.get("new") !== "true" ||
			u.searchParams.has("themMucTieu")
		)
			throw new Error(
				`mnt-tu-viet: cua-toi dieu huong ${u.pathname}${u.search}`,
			);
		if (soLanGoi("okr.createObjective") !== 0)
			throw new Error("mnt-tu-viet: cua-toi goi createObjective");
	});
});

describe("mnt-tu-mau", () => {
	test("mnt-tu-mau: (a) co mau — ngan mo thang buoc chon mau, luu goi taoTuMau dung mau, don vi, chu ky", async () => {
		await moHop(
			"bo-okr",
			{ xem: TP23, mau: [M1_P3], haiKy: true },
			"?donOkr=pb:P3&kyOkr=n27",
		);
		await cho(
			() => dong("tu-mau")?.getAttribute("aria-disabled") !== "true",
			"dong tu-mau mo",
		);
		await bam(dong("tu-mau"), "tu-mau");
		await cho(
			() => q("[data-chon-mau=m1p3]") !== null,
			"mnt-tu-mau: khong vao buoc chon mau",
		);
		await bam(q("[data-chon-mau=m1p3]"), "chon m1p3");
		await cho(() => q("[data-form-tu-mau]") !== null, "form tu mau");
		if (q("[data-nut=viet-tay]"))
			throw new Error("mnt-tu-mau: con nut Viet muc tieu tay");
		if (!q("[data-nut=chon-mau-khac]"))
			throw new Error("mnt-tu-mau: thieu chon-mau-khac");
		dat("okr.taoTuMau", () => ({ id: "mt-mau", canhBao: null }));
		await bam(q("[data-nut=tao-tu-mau]"), "tao tu mau");
		const g = goiCua("okr.taoTuMau");
		if (g.length !== 1) throw new Error(`mnt-tu-mau: taoTuMau ${g.length} lan`);
		const vao = taoTuMauInput.parse(g[0]?.dauVao);
		if (
			vao.mauId !== "m1p3" ||
			!("departmentId" in vao.unit) ||
			vao.unit.departmentId !== "P3"
		)
			throw new Error(`mnt-tu-mau: dau vao lech ${JSON.stringify(vao)}`);
		if (vao.cycleId !== "n27") throw new Error("mnt-tu-mau: cycleId lech");
	});

	test("mnt-tu-mau: (b) khong co mau — dong khoa kem ly do, bam khong mo ngan", async () => {
		await moHop("bo-okr", { xem: TP2, mau: [] }, "?donOkr=pb:P2");
		const d = dong("tu-mau");
		if (!d) throw new Error("mnt-tu-mau: dong khoa vang");
		if (d.getAttribute("aria-disabled") !== "true")
			throw new Error("mnt-tu-mau: dong khong khoa");
		if (
			q("[data-slot=item-description]", d)?.textContent !==
			mVi.chonDuong.khoa.chuaCoMau
		)
			throw new Error("mnt-tu-mau: ly do khoa lech");
		await bam(d, "tu-mau khoa");
		if (q("[data-hop-thoai-muc-tieu]"))
			throw new Error("mnt-tu-mau: dong khoa mo ngan");
	});

	test("mnt-tu-mau: (c) cua-toi — sang Bo OKR voi ngan o buoc chon mau, khong goi ghi", async () => {
		const san = await moHop("cua-toi", { xem: TB1, mau: [M1_BP] });
		await cho(
			() => dong("tu-mau")?.getAttribute("aria-disabled") !== "true",
			"dong tu-mau mo",
		);
		await chonDiTrang(san, "tu-mau", "mnt-tu-mau");
		const u = duongCuoi();
		if (
			u.searchParams.get("donOkr") !== "bp:B1" ||
			u.searchParams.get("new") !== "true" ||
			u.searchParams.get("tuMauOkr") !== "true"
		)
			throw new Error(`mnt-tu-mau: cua-toi dieu huong ${u.search}`);
		if (soLanGoi("okr.taoTuMau") !== 0)
			throw new Error("mnt-tu-mau: cua-toi goi taoTuMau");
	});
});

describe("mnt-bang-tinh", () => {
	test("mnt-bang-tinh: (a) bo-okr — hop nhap mo dung don vi, xem truoc roi ghi", async () => {
		await moHop(
			"bo-okr",
			{ xem: TP23, haiKy: true },
			"?donOkr=pb:P3&kyOkr=n27",
		);
		await bam(dong("bang-tinh"), "bang-tinh");
		await cho(
			() => q("[data-buoc-nhap='1']") !== null,
			"mnt-bang-tinh: khong mo hop nhap",
		);
		if (hop()) throw new Error("mnt-bang-tinh: hop chon khong dong");
		dat("okr.previewImport", () =>
			okrImportPreviewOutput.parse({
				rows: [
					{
						line: 1,
						objective: "A",
						keyResult: "B",
						kind: "moc",
						start: "",
						target: "",
						unit: "",
						email: "hung@onehub.vn",
						error: null,
					},
				],
				summary: { valid: 1, invalid: 0, objectives: 1 },
			}),
		);
		dat("okr.applyImport", () => ({
			written: 1,
			objectives: 1,
			keyResults: 1,
		}));
		await go(
			q("[data-buoc-nhap='1'] textarea"),
			"A\tB\tmoc\t\t\t\thung@onehub.vn",
		);
		await bam(q("[data-nut=xem-truoc]"), "xem truoc");
		const xem = goiCua("okr.previewImport");
		if (xem.length !== 1)
			throw new Error(`mnt-bang-tinh: previewImport ${xem.length} lan`);
		const vao = okrImportInput.parse(xem[0]?.dauVao);
		if (vao.unit.loai !== "pb" || vao.unit.id !== "P3")
			throw new Error(`mnt-bang-tinh: don vi lech ${JSON.stringify(vao.unit)}`);
		if (vao.cycleId !== "n27")
			throw new Error(`mnt-bang-tinh: cycleId lech ${vao.cycleId}`);
		await cho(() => q("[data-nut=ghi-lo]") !== null, "nut ghi");
		await bam(q("[data-nut=ghi-lo]"), "ghi lo");
		const ghi = goiCua("okr.applyImport");
		if (ghi.length !== 1)
			throw new Error(`mnt-bang-tinh: applyImport ${ghi.length} lan`);
		okrImportApplyInput.parse(ghi[0]?.dauVao);
	});

	test("mnt-bang-tinh: (b) cua-toi — sang Bo OKR voi hop nhap mo", async () => {
		const san = await moHop("cua-toi", { xem: TB1 });
		await chonDiTrang(san, "bang-tinh", "mnt-bang-tinh");
		const u = duongCuoi();
		if (
			u.searchParams.get("donOkr") !== "bp:B1" ||
			u.searchParams.get("nhapOkr") !== "true"
		)
			throw new Error(`mnt-bang-tinh: cua-toi dieu huong ${u.search}`);
	});
});
