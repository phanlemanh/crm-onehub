import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	cyclesOutput,
	okrAccessOutput,
	soanSanSangOutput,
} from "../../api/src/okr/okr.contracts";
import { danhSachOutput } from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";
import {
	CUOC,
	dat,
	datLai,
	diTrang,
	dinhVi,
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

const mVi = okrMessages("vi");
const sVi = okrSoanMessages("vi");
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
export const chuKy = (pha: Pha) =>
	cyclesOutput.parse({
		cycles: [
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
};

export function datNen({
	xem = TB1,
	pha = "lap-ke-hoach",
	duoc = true,
	sanSang = BAT,
	treoQuyen = false,
	mau = [],
}: Nen) {
	dat("okr.cycles", () => chuKy(pha));
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
			canEdit: duoc,
			canCreate: duoc,
		});
	});
	dat("okr.soanSanSang", () => sanSang);
	dat("okr.soanMo", () => ({ ok: true, cuoc: { ...CUOC, id: "cuoc-moi" } }));
	dat("okr.hoiYNhan", () => null);
	dat("okr.mau", () => ({ mau }));
}

export type San = { o: HTMLElement; root: Root; url: () => URLSearchParams };
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
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					url = new URLSearchParams(e.searchParams);
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
	const san = { o, root, url: () => url };
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
			const khop = Object.entries(o.mong).every(
				([k, v]) => (kq as Record<string, unknown>)[k] === v,
			);
			s.kiem(
				khop,
				`mnt-soan: ${o.o} mong ${JSON.stringify(o.mong)}, nhan ${JSON.stringify(kq)}`,
			);
		}
		s.xong("mnt-soan", MA_TRAN.length);
		expect(MA_TRAN.length).toBe(12);
	});
});
