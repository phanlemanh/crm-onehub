import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { z } from "zod";
import {
	cyclesOutput,
	type KrOutput,
	krCanhOutput,
	krOutput,
	type MucTieuOutput,
	mineOutput,
	mucTieuOutput,
	type ObjectiveOutput,
	objectiveOutput,
	okrAccessOutput,
	type SoanSanSangOutput,
	soanSanSangOutput,
	troLyDanhSachOutput,
	troLySanSangOutput,
} from "../../api/src/okr/okr.contracts";
import { OKR } from "../../api/src/okr/okr-config";
import { danhSachOutput } from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";
import { CUOC, cho, dat, datLai, nhip } from "./khung-soan-okr";

const { DauTrangOkr } = await import("@/app/(app)/[slug]/okr/thanh-tab");
const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
const { CuaToi } = await import("@/app/(app)/[slug]/okr/cua-toi");
const { ObjectiveSheet } = await import(
	"@/components/crm/record-sheet/objective-sheet"
);
const { DetailSheet } = await import("@/components/detail-sheet");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrMessages } = await import("@/lib/messages/okr");
const { okrSoanMessages } = await import("@/lib/messages/okr-soan");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");
const { okrGioiHanMessages } = await import("@/lib/messages/okr-gioi-han");
const { okrGopYMessages } = await import("@/lib/messages/okr-gop-y");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");
const { ngayThangVn, dauThangSau, homNayVn } = await import(
	"@/lib/okr-chu-ky-nhan"
);
const { TRO_LY_OKR_TRAN } = await import("@crm/validation/okr-tro-ly");

const ms = okrSoanMessages("vi");
const HUNG = { id: "hung", name: "Trần Văn Hùng", email: "h@onehub.vn" };
const MT_ID = "mt-k";

type San = { o: HTMLElement; root: Root; url: () => URLSearchParams };
let dangMo: San[] = [];

beforeEach(() => {
	datLai();
	datNen({});
});

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
	document.body.removeAttribute("style");
});

async function dung(
	man: ReactElement,
	{ locale = "vi", thamSo = "" }: { locale?: Locale; thamSo?: string } = {},
): Promise<San> {
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

const nguoiDung = () =>
	userEvent.setup({ document, pointerEventsCheck: 0, delay: null });

async function bam(o: Element | null, moTa: string): Promise<void> {
	if (!o) throw new Error(`khong thay: ${moTa}`);
	await act(async () => {
		await nguoiDung().click(o);
	});
	await nhip(4);
}

async function phim(o: Element | null, ten: string, moTa: string) {
	if (!(o instanceof HTMLElement)) throw new Error(`khong thay: ${moTa}`);
	await act(async () => {
		o.focus();
	});
	await act(async () => {
		await nguoiDung().keyboard(ten);
	});
	await nhip(4);
}

const q = (chon: string, goc: ParentNode = document) =>
	goc.querySelector<HTMLElement>(chon);
const qa = (chon: string, goc: ParentNode = document) => [
	...goc.querySelectorAll<HTMLElement>(chon),
];

function kr(id: string, doi: Partial<KrOutput> = {}): KrOutput {
	return krOutput.parse({
		id,
		objectiveId: MT_ID,
		title: `KR ${id}`,
		kind: "tang-toi",
		owner: HUNG,
		startValue: 0,
		targetValue: 50,
		currentValue: 20,
		unit: "khách",
		dueOn: null,
		weight: 1,
		source: "tay",
		doCanh: false,
		soMay: null,
		nguonMay: null,
		startLocked: true,
		progress: 40,
		laCuaToi: true,
		hienTaiQuaCapNhat: false,
		...doi,
	});
}

function mucTieu(
	id: string,
	krs: KrOutput[],
	doi: Partial<MucTieuOutput> = {},
): MucTieuOutput {
	return mucTieuOutput.parse({
		id,
		cycleId: "q1",
		level: "onehub",
		unitId: null,
		unitName: "OneHub",
		title: `Mục tiêu ${id}`,
		kind: "cam-ket",
		status: "cong-bo",
		owner: HUNG,
		participants: [],
		whyNow: "Quý 3 mất dấu 9 thoả thuận.",
		publishedAt: "2026-10-02T00:00:00.000Z",
		droppedAt: null,
		progress: 35,
		expected: 40,
		keyResults: krs,
		alignments: [],
		canEdit: true,
		following: false,
		followerCount: 0,
		theoDoi: false,
		hienThi: "cong-khai",
		soNguoiXem: 0,
		soGopYCho: 0,
		...doi,
	});
}

function chiTiet(
	mt: MucTieuOutput,
	doi: Partial<ObjectiveOutput> = {},
): ObjectiveOutput {
	return objectiveOutput.parse({
		...mt,
		keyResults: mt.keyResults.map((k) =>
			krCanhOutput.parse({
				...k,
				soViec: { xong: 0, tong: 0 },
				soSangKien: 0,
				coBangChung: false,
			}),
		),
		cycleName: "Quý 1 · 2027",
		kyGhiDuoc: true,
		mangSangToi: null,
		mangSangTu: null,
		trail: [],
		canEditKr: mt.keyResults.map((k) => k.id),
		nguoiXem: [],
		nguoiDuyetDuKien: null,
		choDuyet: null,
		traLaiGanNhat: null,
		quyen: {
			datHienThi: false,
			congBo: false,
			guiDuyet: false,
			duyet: false,
			rutDuyet: false,
			xoa: false,
			dungLai: false,
		},
		themKrLe: false,
		...doi,
	});
}

function datNen({
	pha = "lap-ke-hoach",
	quanTri = false,
	canEdit = true,
	rows = [],
}: {
	pha?: "lap-ke-hoach" | "dang-chay";
	quanTri?: boolean;
	canEdit?: boolean;
	rows?: MucTieuOutput[];
}): void {
	dat("okr.cycles", () =>
		cyclesOutput.parse({
			cycles: [
				{
					id: "q1",
					kind: "quy",
					name: "Quý 1 · 2027",
					parentId: null,
					startsOn: "2027-01-01",
					endsOn: "2027-03-31",
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
			currentId: "q1",
		}),
	);
	dat("okr.access", () =>
		okrAccessOutput.parse({
			canManageProgram: quanTri,
			headOf: { divisions: [], departments: [] },
		}),
	);
	dat("org.tree", () =>
		orgTreeOutput.parse({
			divisions: [],
			chuaXep: [],
			chuaCoPhongBan: [],
			people: [],
			archived: { divisions: [], departments: [] },
			coverage: { members: 1, withPrimary: 1, departmentsWithoutHead: 0 },
		}),
	);
	dat("workspace.get", () => ({ name: "OneHub", viewerRole: "member" }));
	dat("okr.countByUnit", () => ({}));
	dat("okr.danhSach", () =>
		danhSachOutput.parse({
			rows: rows.map((mt) => ({ ...mt, krKhop: [] })),
			daBo: [],
			total: rows.length,
			facetCounts: {
				phuTrach: [],
				loai: [],
				trangThai: [],
				tuTin: [],
				gopY: [{ value: "cho", count: 0 }],
			},
			canEdit,
			canCreate: canEdit || quanTri,
		}),
	);
	dat("okr.mine", () =>
		mineOutput.parse({ dangTheoDoi: [], objectives: rows, daBo: [] }),
	);
	dat("okr.viecCuaToi", () => ({ viec: [], lienQuanOkr: false }));
	dat("okr.capNhatTuan", () => ({
		items: [],
		weekStart: "2026-10-12",
		dueWeekday: 5,
	}));
	dat("okr.comments", () => ({ comments: [], dong: [] }));
	dat("okr.thanhVien", () => [HUNG]);
	dat("users.me", () => HUNG);
	dat("okr.troLySanSang", () =>
		troLySanSangOutput.parse({ bat: true, conLaiUsd: 5 }),
	);
	dat("okr.troLyDanhSach", () =>
		troLyDanhSachOutput.parse({
			dong: [],
			dangSoan: false,
			maKetThuc: "da-nop",
			docLuc: "2026-10-03T02:15:00.000Z",
			lyDo: null,
		}),
	);
}

const cuocDang = { ...CUOC, soLuot: 3, soDongTong: 5, soDongNhan: 3 };

type DangSoan = {
	ten: string;
	sanSang: SoanSanSangOutput;
	quanTri?: boolean;
	chuPhu: string[];
};

const SS = (x: z.input<typeof soanSanSangOutput>) => soanSanSangOutput.parse(x);
const BAT = {
	bat: true,
	nac: "bat",
	cuocDang: null,
	soCuocDaDung: 0,
	tranCuoc: 3,
	thieuBoiCanh: false,
} as const;
const TRAN = String(TRO_LY_OKR_TRAN.soan.cuocMoiDonViMoiKy);
const CO_DS = new Set(["nut-tiep", "nut-an", "mo-co-cuoc", "nut-het-cuoc"]);

const DANG_CO_CHU_PHU: DangSoan[] = [
	{
		ten: "nut-tiep",
		sanSang: SS({ ...BAT, cuocDang, soCuocDaDung: 1 }),
		chuPhu: [
			ms.nut.tiepMoTa(
				ngayThangVn(new Date(cuocDang.moLuc)),
				String(cuocDang.soLuot),
				String(cuocDang.soDongTong - cuocDang.soDongNhan),
			),
			ms.nut.dsCuoc("1", "3"),
		],
	},
	{
		ten: "nut-an",
		quanTri: true,
		sanSang: SS({ ...BAT, nac: "an", soCuocDaDung: 2 }),
		chuPhu: [ms.nut.cheDoAn, ms.nut.cheDoAnMoTa, ms.nut.dsCuoc("2", "3")],
	},
	{
		ten: "mo-co-cuoc",
		sanSang: SS({ ...BAT, soCuocDaDung: 1 }),
		chuPhu: [ms.nut.dsCuoc("1", "3")],
	},
	{
		ten: "nut-het-cuoc",
		sanSang: SS({ bat: false, lyDo: "het-cuoc-ky" }),
		chuPhu: [ms.nut.hetCuoc(TRAN), ms.nut.dsCuoc(TRAN, TRAN)],
	},
	{
		ten: "nut-het-tran",
		sanSang: SS({ bat: false, lyDo: "het-tran-thang" }),
		chuPhu: [ms.nut.tamNghi(dauThangSau(homNayVn(new Date())))],
	},
	{
		ten: "nut-chua-khoa",
		sanSang: SS({ bat: false, lyDo: "chua-co-khoa-mo-hinh" }),
		chuPhu: [ms.lyDo["chua-co-khoa-mo-hinh"]],
	},
];

async function moDonVi({
	sanSang,
	quanTri = false,
	canEdit = true,
	cauNoi = true,
	treo = false,
	loi = false,
	rows = [],
}: {
	sanSang?: SoanSanSangOutput;
	quanTri?: boolean;
	canEdit?: boolean;
	cauNoi?: boolean;
	treo?: boolean;
	loi?: boolean;
	rows?: MucTieuOutput[];
}): Promise<San> {
	datNen({ quanTri, canEdit, rows });
	dat("okr.soanSanSang", () => {
		if (treo) return new Promise(() => {});
		if (loi) throw new Error("mang loi");
		return sanSang ?? SS(BAT);
	});
	const san = await dung(
		<>
			<DauTrangOkr cauNoi={cauNoi} chonChuKy={null} />
			<TheoDonVi />
		</>,
	);
	await cho(() => q("[data-hang-nut]") !== null, "thanh don vi");
	await nhip(10);
	return san;
}

const theDonVi = () => q("[data-don-vi]");
const chuNgoaiPopover = () => {
	const the = theDonVi();
	if (!the) return "";
	const ban = the.cloneNode(true) as HTMLElement;
	for (const p of qa("[data-thong-tin-soan]", ban)) p.remove();
	return ban.textContent ?? "";
};

describe("nut-soan", () => {
	test("tám dạng: nhóm soạn đứng ngay trước nút chính ở hàng hành động đầu trang, ≤ 2 nút, không chữ phụ trên thẻ", async () => {
		const tam: {
			ten: string;
			dung: () => Promise<San>;
			chuPhu: string[];
		}[] = [
			{
				ten: "dang-tai",
				dung: () => moDonVi({ treo: true }),
				chuPhu: [],
			},
			{
				ten: "mo-duoc",
				dung: () => moDonVi({ sanSang: SS(BAT) }),
				chuPhu: [],
			},
			...DANG_CO_CHU_PHU.filter((d) => d.ten !== "mo-co-cuoc").map((d) => ({
				ten: d.ten,
				dung: () => moDonVi({ sanSang: d.sanSang, quanTri: d.quanTri }),
				chuPhu: d.chuPhu,
			})),
			{
				ten: "chua-cau-hinh",
				dung: () => moDonVi({ cauNoi: false, quanTri: true }),
				chuPhu: [ms.nut.chuaCauHinh],
			},
		];
		expect(tam.length).toBe(8);
		for (const d of tam) {
			await d.dung();
			const hang = q("[data-hang-hanh-dong]");
			const nhom = q("[data-nhom-soan]");
			expect(nhom, `thieu nhom soan: ${d.ten}`).not.toBeNull();
			expect(
				hang?.lastElementChild?.previousElementSibling,
				`nhom soan khong dung truoc nut chinh: ${d.ten}`,
			).toBe(nhom);
			expect(
				qa("button", nhom as HTMLElement).length,
				`chu phu tren thanh: ${d.ten}`,
			).toBeLessThanOrEqual(2);
			expect(
				qa("[data-slot=field-description]", theDonVi() ?? document).length,
				`chu phu tren thanh: ${d.ten}`,
			).toBe(0);
			for (const c of d.chuPhu)
				expect(
					chuNgoaiPopover().includes(c),
					`chu phu tren thanh: ${d.ten}`,
				).toBe(false);
			if (d.ten === "dang-tai") {
				const nut = q("button", nhom as HTMLElement) as HTMLButtonElement;
				expect(nut.disabled).toBe(true);
				expect(nut.textContent?.trim()).toBe(ms.nut.soan);
			}
			for (const s of dangMo) await act(async () => s.root.unmount());
			dangMo = [];
			document.body.innerHTML = "";
		}
		console.log(`so dang: ${tam.length}`);
	});

	test("truy vấn sẵn sàng lỗi: nút giữ chỗ, khoá, không chữ phụ", async () => {
		await moDonVi({ loi: true });
		await nhip(10);
		const nhom = q("[data-nhom-soan]");
		expect(nhom, "loi mang mat nhom soan").not.toBeNull();
		const nut = q("button", nhom as HTMLElement) as HTMLButtonElement;
		expect(nut.disabled).toBe(true);
		expect(q("[data-nut=thong-tin-soan]")).toBeNull();
	});
});

describe("popover-soan", () => {
	test("sáu dạng có chữ phụ: «i» mở popover chứa đúng chữ, Esc trả focus", async () => {
		let soBamDs = 0;
		for (const d of DANG_CO_CHU_PHU) {
			const san = await moDonVi({ sanSang: d.sanSang, quanTri: d.quanTri });
			const i = q("[data-nut=thong-tin-soan]");
			expect(i, `thieu chu phu: ${d.ten}`).not.toBeNull();
			expect(i?.getAttribute("aria-label")).toBe(ms.nut.thongTin);
			await bam(i, "nut i");
			const pop = q("[data-thong-tin-soan]");
			for (const c of d.chuPhu)
				expect(pop?.textContent?.includes(c), `thieu chu phu: ${d.ten}`).toBe(
					true,
				);
			await phim(i, "{Escape}", "nut i");
			expect(q("[data-thong-tin-soan]")).toBeNull();
			expect(document.activeElement).toBe(i);
			await phim(i, "{Enter}", "nut i");
			expect(
				q("[data-thong-tin-soan]"),
				`enter khong mo: ${d.ten}`,
			).not.toBeNull();
			const ds = qa("[data-thong-tin-soan] [data-nut=ds-cuoc]")[0] ?? null;
			expect(Boolean(ds), `ds cuoc lech ma tran: ${d.ten}`).toBe(
				CO_DS.has(d.ten),
			);
			if (ds) {
				await bam(ds, "ds cuoc");
				expect(san.url().get("dsCuoc"), `ds cuoc khong mo: ${d.ten}`).toBe("1");
				soBamDs += 1;
			}
			for (const s of dangMo) await act(async () => s.root.unmount());
			dangMo = [];
			document.body.innerHTML = "";
		}
		expect(soBamDs, "so lan bam ds cuoc").toBe(CO_DS.size);
		console.log(`so dang: ${DANG_CO_CHU_PHU.length} · bam ds: ${soBamDs}`);
	});
});

describe("chua-cau-hinh", () => {
	test("quản trị thấy nút khoá kèm lý do; người sửa được không quản trị không thấy gì", async () => {
		await moDonVi({ cauNoi: false, quanTri: true, sanSang: SS(BAT) });
		const nhom = q("[data-nhom-soan]");
		expect(nhom, "quan tri thieu nut chua cau hinh").not.toBeNull();
		expect(
			(q("button", nhom as HTMLElement) as HTMLButtonElement).disabled,
		).toBe(true);
		await bam(q("[data-nut=thong-tin-soan]"), "nut i");
		expect(q("[data-thong-tin-soan]")?.textContent).toContain(
			ms.nut.chuaCauHinh,
		);
		for (const s of dangMo) await act(async () => s.root.unmount());
		dangMo = [];
		document.body.innerHTML = "";

		await moDonVi({
			cauNoi: false,
			quanTri: false,
			canEdit: true,
			sanSang: SS(BAT),
		});
		expect(
			q("[data-nhom-soan]"),
			"nguoi thuong thay nut chua cau hinh",
		).toBeNull();
		expect(q("[data-nut-soan]")).toBeNull();
		expect(document.body.textContent?.includes(ms.nut.chuaCauHinh)).toBe(false);
	});
});

async function moSheet(
	mt: MucTieuOutput,
	{
		locale = "vi",
		doi = {},
	}: { locale?: Locale; doi?: Partial<ObjectiveOutput> } = {},
): Promise<San> {
	dat("okr.objective", () => chiTiet(mt, doi));
	const san = await dung(
		<DetailSheet onOpenChange={() => {}} open>
			<ObjectiveSheet objectiveId={MT_ID} />
		</DetailSheet>,
		{ locale, thamSo: `?record=objective:${MT_ID}` },
	);
	await cho(() => q("[data-okr-sheet] [role=tab]") !== null, "sheet tai xong");
	return san;
}

const nhanTab = () =>
	qa("[data-okr-sheet] [role=tab]").map((t) =>
		[...t.childNodes]
			.filter((n) => n.nodeType === Node.TEXT_NODE)
			.map((n) => n.textContent)
			.join("")
			.trim(),
	);

describe("tab-khung", () => {
	test("năm nhãn tab không trùng ở cả tiếng Việt và tiếng Anh", async () => {
		const mt = mucTieu(MT_ID, [kr("k1"), kr("k2")]);
		for (const locale of ["vi", "en"] as const) {
			await moSheet(mt, { locale });
			const nhan = nhanTab();
			expect(nhan.length).toBe(5);
			expect(new Set(nhan).size, `tab trung: ${locale} History`).toBe(5);
			const m = okrMessages(locale).sheet;
			const d = okrToanCanhMessages(locale).dienBien.tab;
			expect(nhan).toEqual([
				m.tabKr,
				m.tabCanChinh,
				m.tabVetNhan,
				m.tabTraoDoi,
				d,
			]);
			if (locale === "en") {
				expect(nhan[2], "tab trung: en History").toBe("Changes");
				expect(nhan[4]).toBe("History");
			}
			for (const s of dangMo) await act(async () => s.root.unmount());
			dangMo = [];
			document.body.innerHTML = "";
		}
	});
});

describe("so-it", () => {
	test("dòng tiến độ đúng số ít và số nhiều ở hai ngôn ngữ", async () => {
		const ca = [
			{
				locale: "en",
				krs: [kr("k1")],
				p: 0,
				mong: "Objective progress 0% from 1 KR.",
			},
			{
				locale: "en",
				krs: [kr("k1"), kr("k2")],
				p: 35,
				mong: "Objective progress 35% from 2 KRs.",
			},
			{
				locale: "vi",
				krs: [kr("k1")],
				p: 0,
				mong: "Tiến độ mục tiêu 0% tính từ 1 KR.",
			},
			{
				locale: "vi",
				krs: [kr("k1"), kr("k2")],
				p: 35,
				mong: "Tiến độ mục tiêu 35% tính từ 2 KR.",
			},
		] as const;
		for (const c of ca) {
			await moSheet(mucTieu(MT_ID, [...c.krs], { progress: c.p }), {
				locale: c.locale,
			});
			expect(
				q("[data-tien-do-tu]")?.textContent?.trim(),
				`so it sai: ${c.locale} ${c.krs.length}`,
			).toBe(c.mong);
			for (const s of dangMo) await act(async () => s.root.unmount());
			dangMo = [];
			document.body.innerHTML = "";
		}
		console.log(`so o: ${ca.length}`);
	});
});

describe("chip", () => {
	test("chip là Badge bấm được cùng biến thể với nhãn loại; Enter và Space mở khung", async () => {
		const mtA = mucTieu("mt-a", [kr("a1"), kr("a2")], {
			title: "Giữ chân khách miền Bắc",
			soGopYCho: 2,
		});
		const man = [
			{ ten: "cua-toi", dung: () => dung(<CuaToi />) },
			{ ten: "theo-don-vi", dung: () => dung(<TheoDonVi />) },
		];
		let soCa = 0;
		for (const mn of man)
			for (const ten of ["{Enter}", " "]) {
				datNen({ rows: [mtA], pha: "dang-chay" });
				const san = await mn.dung();
				await cho(
					() => q('[data-chip-gop-y="mt-a"]') !== null,
					`chip ${mn.ten}`,
				);
				const chip = q('[data-chip-gop-y="mt-a"]');
				const nhom = q(
					"[data-nhom-nhan]",
					q('[data-hang-muc-tieu="mt-a"]') ?? document,
				);
				const nhanLoai = q('[data-slot="badge"]', nhom ?? document);
				expect(chip?.tagName, `chip khong la badge: ${mn.ten}`).toBe("BUTTON");
				expect(
					chip?.getAttribute("data-slot"),
					`chip khong la badge: ${mn.ten}`,
				).toBe("badge");
				expect(chip?.getAttribute("data-variant")).toBe(
					nhanLoai?.getAttribute("data-variant") ?? "",
				);
				const mo = q(
					'[data-hang-muc-tieu="mt-a"] [aria-expanded]',
				)?.getAttribute("aria-expanded");
				await phim(chip, ten, "chip");
				expect(
					san.url().get("record"),
					`chip khong mo khung: ${mn.ten} ${ten}`,
				).toBe("objective:mt-a");
				expect(san.url().get("neoGopY")).not.toBeNull();
				expect(
					q('[data-hang-muc-tieu="mt-a"] [aria-expanded]')?.getAttribute(
						"aria-expanded",
					) ?? null,
				).toBe(mo ?? null);
				soCa += 1;
				for (const s of dangMo) await act(async () => s.root.unmount());
				dangMo = [];
				document.body.innerHTML = "";
			}
		expect(okrGopYMessages("vi").chip("2")).toBeTruthy();
		console.log(`so ca: ${soCa}`);
	});
});

class LoiTrpc extends Error {
	data: { code: string };
	constructor(code: string, thongDiep: string) {
		super(thongDiep);
		this.data = { code };
	}
}

describe("lien-ket-cheo", () => {
	const g = okrGioiHanMessages("vi");
	const ui = uiMessages("vi");
	const coCanChinh = (mt: MucTieuOutput) =>
		chiTiet(mt, {
			alignments: [
				{
					alignmentId: "al-1",
					targetObjectiveId: "mt-cha",
					targetKeyResultId: null,
					objectiveTitle: "Mục tiêu cha",
					keyResultTitle: null,
					unitName: "OneHub",
					lyDo: null,
					canCu: null,
					lyDoTuKara: false,
					mucTin: "chua-co-ly-do",
				},
			],
		}).alignments;

	async function moHop(hienThi: "cong-khai" | "gioi-han") {
		const mt = mucTieu(MT_ID, [kr("k1")], { hienThi });
		dat("okr.datHienThi", () => {
			throw new LoiTrpc("BAD_REQUEST", OKR.thongDiep.hienThi.conCanChinh(1));
		});
		const san = await moSheet(mt, {
			doi: {
				alignments: coCanChinh(mt),
				nguoiXem:
					hienThi === "gioi-han" ? [{ id: HUNG.id, name: HUNG.name }] : [],
				quyen: {
					datHienThi: true,
					congBo: false,
					guiDuyet: false,
					duyet: false,
					rutDuyet: false,
					xoa: false,
					dungLai: false,
				},
			},
		});
		await bam(
			q(`[aria-label="${okrMessages("vi").sheet.menu}"]`),
			"menu muc tieu",
		);
		await bam(q('[data-muc="muc-hien-thi"]'), "muc hien thi");
		await cho(
			() => q('[data-hop="muc-hien-thi"]') !== null,
			"hop muc hien thi",
		);
		return san;
	}

	async function choTuChoi(themNguoi: boolean) {
		if (themNguoi) {
			await bam(q('[id$="-gioi-han"]'), "radio gioi han");
			const o = q(
				'[data-hop="muc-hien-thi"] [role=combobox], [data-hop="muc-hien-thi"] button[aria-haspopup]',
			);
			await bam(o, "o nguoi xem");
			await bam(qa("[role=option]")[0] ?? null, "chon nguoi");
		}
		await bam(q('[data-nut="luu-muc-hien-thi"]'), "luu");
		await cho(
			() => q('[data-nut="mo-can-chinh"]') !== null,
			"nut mo can chinh",
		);
	}

	const tabChon = () =>
		qa("[data-okr-sheet] [role=tab]").find(
			(t) => t.getAttribute("aria-selected") === "true",
		);

	test("ba ca: ở lại giữ thay đổi, bỏ thì sang tab, không thay đổi thì đi thẳng", async () => {
		await moHop("cong-khai");
		await choTuChoi(true);
		const truoc = q("[data-nguoi-xem]")?.textContent;
		expect(truoc ?? "", "chua them duoc nguoi xem").toContain(HUNG.name);
		await bam(q('[data-nut="mo-can-chinh"]'), "mo can chinh");
		expect(
			document.body.textContent?.includes(ui.dialog.boThayDoi.tieuDe),
			"mat thay doi khong hoi",
		).toBe(true);
		await bam(
			qa("button").find(
				(b) => b.textContent?.trim() === ui.dialog.boThayDoi.tiepTuc,
			) ?? null,
			"o lai",
		);
		expect(q('[data-hop="muc-hien-thi"]')).not.toBeNull();
		expect(
			(q('[id$="-gioi-han"]') as HTMLElement | null)?.getAttribute(
				"aria-checked",
			) ??
				(q('[id$="-gioi-han"]') as HTMLElement | null)?.getAttribute(
					"data-state",
				),
		).toMatch(/true|checked/);
		expect(q("[data-nguoi-xem]")?.textContent).toBe(truoc);
		expect(tabChon()?.textContent).toContain(okrMessages("vi").sheet.tabKr);

		await bam(q('[data-nut="mo-can-chinh"]'), "mo can chinh lan hai");
		await bam(
			qa("button").find(
				(b) => b.textContent?.trim() === ui.dialog.boThayDoi.bo,
			) ?? null,
			"bo",
		);
		await cho(() => q('[data-hop="muc-hien-thi"]') === null, "hop dong");
		expect(tabChon()?.textContent).toContain(
			okrMessages("vi").sheet.tabCanChinh,
		);
		for (const s of dangMo) await act(async () => s.root.unmount());
		dangMo = [];
		document.body.innerHTML = "";

		await moHop("gioi-han");
		expect(
			q('[data-nut="mo-can-chinh"]'),
			"nut mo can chinh hien khi chua luu lan nao",
		).toBeNull();
		expect(
			(q('[data-nut="luu-muc-hien-thi"]') as HTMLButtonElement | null)
				?.disabled,
		).toBe(true);
		expect(g.hienThi.moCanChinh).toBeTruthy();
		console.log("so ca: 3");
	});
});
