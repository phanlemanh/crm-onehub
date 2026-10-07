import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import {
	ketQuaKhoiPhuc,
	lyDoChanLuuTru,
} from "@crm/validation/to-chuc-luu-tru";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
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
	troLyDanhSachOutput,
} from "../../api/src/okr/okr.contracts";
import { danhSachOutput } from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";
import { cho, dat, datLai, nhip } from "./khung-soan-okr";

const { BangMucTieu } = await import("@/app/(app)/[slug]/okr/bang-muc-tieu");
const { BangKr } = await import("@/app/(app)/[slug]/okr/bang-kr");
const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
const { ObjectiveSheet } = await import(
	"@/components/crm/record-sheet/objective-sheet"
);
const { DetailSheet } = await import("@/components/detail-sheet");
const { SEARCH_PARAM } = await import("@/lib/search-param-keys");
const { XacNhanLuuTru } = await import(
	"@/app/(app)/[slug]/settings/organization/xac-nhan-luu-tru"
);
const { DaLuuTruToChuc } = await import(
	"@/app/(app)/[slug]/settings/organization/da-luu-tru-to-chuc"
);
const { Toaster } = await import("@crm/ui/components/sonner");
const { okrTaiCoCauMessages } = await import("@/lib/messages/okr-tai-co-cau");
const { toChucMessages } = await import("@/lib/messages/to-chuc");
const { useKhoMan } = await import("@crm/ui/hooks/use-kho-man");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");

const HUNG = { id: "hung", name: "Trần Văn Hùng", email: "h@onehub.vn" };

type San = { o: HTMLElement; root: Root; url: () => URLSearchParams };
let dangMo: San[] = [];

beforeEach(() => {
	datLai();
	dat("workspace.get", () => ({ name: "OneHub", viewerRole: "member" }));
	dat("users.me", () => HUNG);
	dat("users.list", () => [{ ...HUNG, image: null }]);
	dat("okr.access", () => ({
		canManageProgram: false,
		headOf: { divisions: [], departments: [] },
	}));
	dat("okr.program", () => ({
		objectiveCap: 5,
		krCap: 5,
		capMode: "canh-bao",
		scoreScale: "0-1",
		weightsOn: false,
		personalOn: false,
		version: 1,
	}));
});

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

async function dung(
	man: ReactElement,
	{
		locale = "vi",
		thamSo = "",
		truoc,
	}: {
		locale?: Locale;
		thamSo?: string;
		truoc?: (qc: QueryClient) => void;
	} = {},
): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
		},
	});
	truoc?.(client);
	let url = new URLSearchParams(thamSo);
	const ve = (m: ReactElement) => (
		<NuqsTestingAdapter
			hasMemory
			onUrlUpdate={(e) => {
				url = new URLSearchParams(e.searchParams);
			}}
			searchParams={thamSo}
		>
			<QueryClientProvider client={client}>
				<LocaleProvider locale={locale}>
					<TooltipProvider>{m}</TooltipProvider>
				</LocaleProvider>
			</QueryClientProvider>
		</NuqsTestingAdapter>
	);
	await act(async () => {
		root.render(ve(man));
	});
	const san = { o, root, url: () => url };
	dangMo.push(san);
	await nhip(6);
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

const q = (chon: string, goc: ParentNode = document) =>
	goc.querySelector<HTMLElement>(chon);

function kr(id: string, objectiveId: string, doi: Partial<KrOutput> = {}) {
	return krOutput.parse({
		id,
		objectiveId,
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
		laCuaToi: false,
		hienTaiQuaCapNhat: false,
		...doi,
	});
}

function mucTieu(id: string, doi: Partial<MucTieuOutput> = {}): MucTieuOutput {
	return mucTieuOutput.parse({
		id,
		cycleId: "q4",
		level: "phong-ban",
		unitId: "pb-1",
		unitName: "Kinh doanh vùng 1",
		title: `Mục tiêu ${id}`,
		kind: "cam-ket",
		status: "cong-bo",
		owner: HUNG,
		participants: [],
		whyNow: "",
		publishedAt: "2026-10-02T00:00:00.000Z",
		droppedAt: null,
		progress: 40,
		expected: 47,
		keyResults: [kr(`${id}-kr1`, id)],
		alignments: [],
		canEdit: false,
		following: false,
		followerCount: 0,
		theoDoi: false,
		hienThi: "cong-khai",
		soNguoiXem: 0,
		soGopYCho: 0,
		...doi,
	});
}

describe("thu-gon", () => {
	const A = mucTieu("mt-a");
	const B = mucTieu("mt-b");
	const C = mucTieu("mt-c");
	const CACH = [
		{ ten: "loc", khuat: [B] },
		{ ten: "doi-don-vi", khuat: [C] },
	] as const;

	const nutThu = (id: string, goc: ParentNode) =>
		q(`[data-hang-muc-tieu="${id}"] [aria-expanded]`, goc) ??
		q(`[data-muc-tieu="${id}"] [aria-expanded]`, goc);

	test("thu-gon: id cua muc tieu dang khuat giu nguyen khi thu muc tieu khac", async () => {
		expect.assertions(CACH.length * 4);
		for (const cach of CACH) {
			const o = document.createElement("div");
			document.body.appendChild(o);
			const root = createRoot(o);
			const client = new QueryClient({
				defaultOptions: { queries: { retry: false } },
			});
			let url = new URLSearchParams(`thuMucTieu=${A.id}`);
			const ve = (ds: MucTieuOutput[]) => (
				<NuqsTestingAdapter
					hasMemory
					onUrlUpdate={(e) => {
						url = new URLSearchParams(e.searchParams);
					}}
					searchParams={`thuMucTieu=${A.id}`}
				>
					<QueryClientProvider client={client}>
						<LocaleProvider locale="vi">
							<TooltipProvider>
								<BangMucTieu danhDauCuaToi={false} ds={ds} hienDonVi />
							</TooltipProvider>
						</LocaleProvider>
					</QueryClientProvider>
				</NuqsTestingAdapter>
			);
			dangMo.push({ o, root, url: () => url });
			await act(async () => root.render(ve([A, B])));
			await nhip(6);
			await act(async () => root.render(ve([...cach.khuat])));
			await nhip(4);
			const id = cach.khuat[0].id;
			await bam(nutThu(id, o), `nut thu ${id}`);
			await cho(
				() => (url.getAll("thuMucTieu").join(",").includes(id) ? true : false),
				`url ghi ${id}`,
			);
			const sauThu = url.getAll("thuMucTieu").join(",");
			expect(sauThu.includes(A.id), `mat id khuat: ${cach.ten}`).toBe(true);
			await act(async () => root.render(ve([A, B, C])));
			await nhip(4);
			expect(
				nutThu(A.id, o)?.getAttribute("aria-expanded"),
				`A mo lai: ${cach.ten}`,
			).toBe("false");
			expect(
				nutThu(id, o)?.getAttribute("aria-expanded"),
				`${id} khong thu: ${cach.ten}`,
			).toBe("false");
			await bam(nutThu(id, o), `mo lai ${id}`);
			await nhip(4);
			expect(
				url.getAll("thuMucTieu").join(",").includes(A.id),
				`mo ${id} lam mat A: ${cach.ten}`,
			).toBe(true);
		}
		console.log(`so ca: ${CACH.length}`);
	});
});

describe("so-kr", () => {
	const MAY = kr("kr-may", "mt-s", {
		source: "crm",
		nguonMay: {
			loai: "crm",
			chiSo: "thoa-thuan-chot-duoc",
			phamVi: { kieu: "phong-ban", id: "pb-1" },
			bac: null,
			sheetId: null,
			sheetO: null,
			docLuc: null,
			docGiaTri: null,
			docLoi: null,
		},
	});
	const TAY = kr("kr-tay", "mt-s");

	const KHO = [
		{ rong: 390, ban: "dien-thoai", chon: ".md\\:hidden" },
		{ rong: 1440, ban: "may-tinh", chon: ".md\\:table-cell" },
	] as const;

	test("so-kr: moi kho dung mot nut data-so-kr, nam o ban dang hien; KR tay khong co", async () => {
		expect.assertions(KHO.length * 4);
		const rongGoc = window.innerWidth;
		for (const kho of KHO) {
			window.innerWidth = kho.rong;
			const san = await dung(
				<BangKr
					danhDauCuaToi={false}
					expected={47}
					keyResults={[MAY, TAY]}
					kind="cam-ket"
				/>,
			);
			await cho(() => q("[data-so-kr-cho]", san.o) === null, "quyen xem so");
			const nut = [
				...san.o.querySelectorAll<HTMLElement>(
					`button[data-so-kr="${MAY.id}"]`,
				),
			];
			const dungBan = nut.filter((n) => n.closest(kho.chon) !== null);
			expect(dungBan.length, `${kho.ban} thieu moc: so-kr`).toBe(1);
			expect(nut.length, `so nut so-kr: ${kho.ban}`).toBe(1);
			expect(
				san.o.querySelectorAll(`button[data-so-kr="${TAY.id}"]`).length,
				`kr tay co nut so: ${kho.ban}`,
			).toBe(0);
			await bam(dungBan[0] ?? null, `nut so ${kho.ban}`);
			expect(
				san.url().get("record") ?? "",
				`nut ${kho.ban} khong mo so`,
			).toContain(MAY.id);
		}
		window.innerWidth = rongGoc;
		console.log(`so kho: ${KHO.length}`);
	});
});

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
		canEditKr: [],
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

function datDonVi(vai: {
	canCreate: boolean;
	canEdit: boolean;
	quanTri: boolean;
}) {
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
				},
			],
			currentId: "q1",
		}),
	);
	dat("okr.access", () =>
		okrAccessOutput.parse({
			canManageProgram: vai.quanTri,
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
	dat("okr.countByUnit", () => ({}));
	dat("okr.danhSach", () =>
		danhSachOutput.parse({
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
			canEdit: vai.canEdit,
			canCreate: vai.canCreate,
		}),
	);
	dat("okr.mine", () => mineOutput.parse({ objectives: [], daBo: [] }));
	dat("okr.viecCuaToi", () => ({ viec: [], lienQuanOkr: false }));
	dat("okr.thanhVien", () => [HUNG]);
}

describe("nut-them", () => {
	const VAI = [
		{
			ten: "quan-tri",
			canCreate: true,
			canEdit: false,
			quanTri: true,
			thay: true,
		},
		{
			ten: "truong-phong",
			canCreate: true,
			canEdit: true,
			quanTri: false,
			thay: true,
		},
		{
			ten: "thanh-vien",
			canCreate: false,
			canEdit: false,
			quanTri: false,
			thay: false,
		},
	] as const;

	test("nut-them: quan tri khong la truong va truong phong thay Them muc tieu; thanh vien khong", async () => {
		expect.assertions(VAI.length * 2 + 1);
		for (const vai of VAI) {
			datDonVi(vai);
			const san = await dung(<TheoDonVi cauNoiOkr={false} />);
			await cho(() => q("[data-hang-nut]", san.o) !== null, "thanh don vi");
			await nhip(6);
			const them = q("[data-nut=them-muc-tieu]", san.o);
			const nhap = q("[data-nut=nhap-bang-tinh]", san.o);
			expect(
				them !== null,
				vai.thay
					? `quan tri khong thay nut them: ${vai.ten}`
					: `nguoi thuong thay nut them: ${vai.ten}`,
			).toBe(vai.thay);
			expect(nhap !== null, `nut nhap sai: ${vai.ten}`).toBe(vai.thay);
			if (vai.ten === "quan-tri") {
				await bam(them, "nut them muc tieu");
				expect(
					san.url().has(SEARCH_PARAM.dialog.create),
					"nut them khong mo ngan tao",
				).toBe(true);
			}
			await act(async () => san.root.unmount());
			san.o.remove();
			dangMo = dangMo.filter((x) => x !== san);
		}
		console.log(`so vai: ${VAI.length}`);
	});

	test("nut-them: khung Muc tieu hien Them KR khi themKrLe du canEdit false", async () => {
		const mt = mucTieu("mt-le", { canEdit: false });
		const ca = [
			{ themKrLe: true, thay: true },
			{ themKrLe: false, thay: false },
		];
		expect.assertions(ca.length);
		for (const c of ca) {
			dat("okr.objective", () => chiTiet(mt, { themKrLe: c.themKrLe }));
			dat("okr.comments", () => ({ comments: [], dong: [] }));
			dat("okr.alignmentTargets", () => ({ targets: [] }));
			const san = await dung(
				<DetailSheet onOpenChange={() => {}} open>
					<ObjectiveSheet objectiveId={mt.id} />
				</DetailSheet>,
				{ thamSo: `record=objective:${mt.id}` },
			);
			await cho(
				() => document.querySelector("[data-okr-sheet] [role=tab]") !== null,
				"khung tai xong",
			);
			expect(
				q("[data-nut=them-kr]") !== null,
				c.thay
					? "quan tri khong thay them KR"
					: "them KR hien khi khong co quyen",
			).toBe(c.thay);
			await act(async () => san.root.unmount());
			san.o.remove();
			dangMo = dangMo.filter((x) => x !== san);
			document.body.innerHTML = "";
		}
	});
});

const coChuViet = (chu: string): boolean =>
	/[đĐ]/.test(chu) || /[\u0300-\u036f]/.test(chu.normalize("NFD"));

const chuDich = (o: Element): string => {
	const ban = o.cloneNode(true) as Element;
	for (const x of ban.querySelectorAll("[translate=no]")) x.remove();
	return ban.textContent ?? "";
};

describe("ly-do-luu-tru", () => {
	const LY_DO = [
		lyDoChanLuuTru.parse({
			loai: "khuon",
			khuon: ["Khuôn Bán hàng"],
			cau: "Phòng ban này còn nằm trong khuôn Khuôn Bán hàng — sửa khuôn trước.",
		}),
		lyDoChanLuuTru.parse({ loai: "nguoi", so: 2, cau: "x" }),
		lyDoChanLuuTru.parse({ loai: "okr", so: 3, cau: "x" }),
	];

	test("ly-do-luu-tru: ba ly do in theo ngon ngu nguoi xem, so va ten dung, ten khuon khong dich", async () => {
		expect.assertions(2 * LY_DO.length * 2 + 2);
		for (const locale of ["en", "vi"] as const) {
			dat("org.luuTruXemTruoc", () => ({ lyDo: LY_DO }));
			const san = await dung(
				<XacNhanLuuTru
					daLuu={() => {}}
					dong={() => {}}
					hoi={{ loai: "phong-ban", id: "pb-1", name: "Kinh doanh miền Bắc" }}
					moChuyen={() => {}}
					okrMo={0}
				/>,
				{ locale },
			);
			await cho(() => q("[data-ly-do-chan=okr]") !== null, "hop ly do");
			const c = okrTaiCoCauMessages(locale).toChuc.chan;
			const mong = {
				khuon: c.lyDoKhuon.replace("{khuon}", "Khuôn Bán hàng"),
				nguoi: c.lyDoNguoi(2),
				okr: c.lyDo["phong-ban"](3),
			};
			for (const l of LY_DO) {
				const o = q(`[data-ly-do-chan=${l.loai}]`);
				expect(
					locale === "en" ? coChuViet(chuDich(o ?? document.body)) : false,
					`cau tieng viet o en: ${l.loai}`,
				).toBe(false);
				expect(o?.textContent ?? "", `cau sai: ${locale} ${l.loai}`).toBe(
					mong[l.loai],
				);
			}
			if (locale === "en") {
				const khuon = q("[data-ly-do-chan=khuon]");
				expect(
					coChuViet(khuon?.textContent ?? ""),
					"doi chung: ten co dau",
				).toBe(true);
				expect(
					q("[data-ly-do-chan=khuon] [translate=no]")?.textContent,
					"ten khuon khong o phan khong dich",
				).toBe("Khuôn Bán hàng");
			}
			await act(async () => san.root.unmount());
			san.o.remove();
			dangMo = dangMo.filter((x) => x !== san);
			document.body.innerHTML = "";
		}
		console.log(`so o: ${2 * LY_DO.length}`);
	});
});

describe("khoi-phuc-toast", () => {
	const CA = [
		{
			loai: "cha-luu-tru",
			ten: "Khối Kinh doanh",
			id: "pb-x",
			thuTuc: "org.restoreDepartment",
		},
		{
			loai: "trung-ten",
			ten: "Kinh doanh miền Bắc",
			id: "bp-y",
			thuTuc: "org.restoreDivision",
		},
	] as const;

	test("khoi-phuc-toast: tu choi khoi phuc bao bang ngon ngu nguoi xem, khong bao thanh cong", async () => {
		expect.assertions(2 * CA.length * 3);
		for (const locale of ["en", "vi"] as const)
			for (const ca of CA) {
				dat(ca.thuTuc, () =>
					ketQuaKhoiPhuc.parse({ chan: { loai: ca.loai, ten: ca.ten } }),
				);
				const cay = orgTreeOutput.parse({
					divisions: [],
					chuaXep: [],
					chuaCoPhongBan: [],
					people: [],
					archived: {
						divisions: [
							{
								id: "bp-y",
								name: "Kinh doanh miền Bắc",
								okrMo: 0,
								purgeable: false,
							},
						],
						departments: [
							{
								id: "pb-x",
								name: "Kinh doanh miền Bắc",
								okrMo: 0,
								purgeable: false,
							},
						],
					},
					coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
				});
				const san = await dung(
					<>
						<DaLuuTruToChuc cay={cay} sua />
						<Toaster />
					</>,
					{ locale },
				);
				await bam(q("[data-slot=archived-list] button", san.o), "mo danh sach");
				const nut = [
					...san.o.querySelectorAll<HTMLElement>(
						"[data-slot=archived-list] button",
					),
				].filter(
					(b) => b.textContent?.trim() === toChucMessages(locale).khoiPhuc,
				);
				await bam(nut[ca.id === "bp-y" ? 0 : 1] ?? null, `khoi phuc ${ca.id}`);
				await cho(() => q("[data-sonner-toast]") !== null, "toast");
				const toast = q("[data-sonner-toast]");
				const m = toChucMessages(locale);
				const mau =
					ca.loai === "cha-luu-tru" ? m.khoiPhucChaLuuTru : m.khoiPhucTrungTen;
				expect(
					q("[data-chan-khoi-phuc]")?.textContent ?? "",
					`toast khong theo ngon ngu: ${locale} ${ca.loai}`,
				).toBe(mau.replace("{ten}", ca.ten));
				expect(
					locale === "en"
						? coChuViet(chuDich(q("[data-chan-khoi-phuc]") ?? document.body))
						: false,
					`toast con chu viet: ${ca.loai}`,
				).toBe(false);
				expect(
					toast?.getAttribute("data-type"),
					`toast khong phai loi: ${locale} ${ca.loai}`,
				).toBe("error");
				await act(async () => san.root.unmount());
				san.o.remove();
				dangMo = dangMo.filter((x) => x !== san);
				document.body.innerHTML = "";
			}
		console.log(`so o: ${2 * CA.length}`);
	});
});

describe("neo-kara", () => {
	const MT = mucTieu("mt-kara", { canEdit: true });
	const CT = () =>
		chiTiet(MT, {
			canEditKr: MT.keyResults.map((k) => k.id),
			kyGhiDuoc: true,
		});
	const DS = troLyDanhSachOutput.parse({
		dong: [],
		dangSoan: false,
		maKetThuc: "da-nop",
		docLuc: "2026-10-03T02:15:00.000Z",
		lyDo: null,
	});

	type Goi = { coKhung: boolean; laVung: boolean };
	let goiCuon: Goi[] = [];
	const cuonGoc = HTMLElement.prototype.scrollIntoView;
	const rongGoc = window.innerWidth;
	afterEach(() => {
		HTMLElement.prototype.scrollIntoView = cuonGoc;
		window.innerWidth = rongGoc;
	});

	const KHO = [
		{ rong: 390, ten: "dien-thoai", khung: true },
		{ rong: 1440, ten: "may-tinh", khung: false },
	] as const;

	test("neo-kara: du lieu co san tu lan ve dau — chi cuon sau khi biet kho, dung mot lan, roi moi bo neoGopY", async () => {
		expect.assertions(KHO.length * 3);
		for (const kho of KHO) {
			goiCuon = [];
			HTMLElement.prototype.scrollIntoView = function (this: HTMLElement) {
				goiCuon.push({
					coKhung: document.querySelector("[data-cuon-ca-khung]") !== null,
					laVung: this.hasAttribute("data-vung-kara"),
				});
			};
			window.innerWidth = kho.rong;
			dat("okr.objective", () => CT());
			dat("okr.troLyDanhSach", () => DS);
			dat("okr.comments", () => ({ comments: [], dong: [] }));
			dat("okr.alignmentTargets", () => ({ targets: [] }));
			const san = await dung(
				<DetailSheet onOpenChange={() => {}} open>
					<ObjectiveSheet objectiveId={MT.id} />
				</DetailSheet>,
				{
					thamSo: `record=objective:${MT.id}&${SEARCH_PARAM.okr.neoGopY}=true`,
					truoc: (qc) => {
						qc.setQueryData(["okr.objective", { id: MT.id }], CT());
						qc.setQueryData(["okr.troLyDanhSach", { objectiveId: MT.id }], DS);
					},
				},
			);
			await cho(() => !san.url().has(SEARCH_PARAM.okr.neoGopY), "neo roi url");
			const vung = goiCuon.filter((g) => g.laVung);
			expect(
				vung.map((g) => g.coKhung),
				kho.khung ? "cuon truoc khi biet kho" : `cuon sai khung: ${kho.ten}`,
			).toEqual([kho.khung]);
			expect(
				document.querySelector("[data-cuon-ca-khung]") !== null,
				`khung cuon sai: ${kho.ten}`,
			).toBe(kho.khung);
			expect(
				san.url().has(SEARCH_PARAM.okr.neoGopY),
				`neo con: ${kho.ten}`,
			).toBe(false);
			await act(async () => san.root.unmount());
			san.o.remove();
			dangMo = dangMo.filter((x) => x !== san);
			document.body.innerHTML = "";
		}
	});

	test("neo-kara: hook kho man that tra chua-biet o lan ve dau roi dien-thoai", async () => {
		window.innerWidth = 390;
		const thay: string[] = [];
		function Do() {
			thay.push(useKhoMan());
			return null;
		}
		await dung(<Do />);
		expect(thay[0], "lan ve dau da biet kho").toBe("chua-biet");
		expect(thay.at(-1), "khong sang dien-thoai").toBe("dien-thoai");
		console.log("so ca: 3");
	});
});

describe("kr-quan-tri", () => {
	const CA = [
		{ ten: "quan-tri", canEdit: false },
		{ ten: "truong-phong", canEdit: true },
	] as const;
	const O = ["kieu", "khoi", "chu"] as const;

	test("kr-quan-tri: hop KR moi mo du o loai, gia tri dau, nguoi phu trach cho quan tri va truong phong", async () => {
		expect.assertions(CA.length * O.length);
		for (const ca of CA) {
			const mt = mucTieu(`mt-kr-${ca.ten}`, {
				canEdit: ca.canEdit,
				status: "nhap",
			});
			dat("okr.objective", () => chiTiet(mt, { themKrLe: true }));
			dat("okr.comments", () => ({ comments: [], dong: [] }));
			dat("okr.alignmentTargets", () => ({ targets: [] }));
			dat("okr.troLyDanhSach", () =>
				troLyDanhSachOutput.parse({
					dong: [],
					dangSoan: false,
					maKetThuc: null,
					docLuc: null,
					lyDo: null,
				}),
			);
			const san = await dung(
				<DetailSheet onOpenChange={() => {}} open>
					<ObjectiveSheet objectiveId={mt.id} />
				</DetailSheet>,
				{ thamSo: `record=objective:${mt.id}` },
			);
			await cho(() => q("[data-nut=them-kr]") !== null, "nut them KR");
			await bam(q("[data-nut=them-kr]"), "them KR");
			await cho(() => q("label[for$='-kieu']") !== null, "hop KR moi");
			for (const o of O) {
				const truong = q(`label[for$='-${o}']`)?.closest("[data-slot=field]");
				expect(
					truong?.getAttribute("data-disabled") === "true",
					`hop KR khoa cot: ${ca.ten} ${o}`,
				).toBe(false);
			}
			await act(async () => san.root.unmount());
			san.o.remove();
			dangMo = dangMo.filter((x) => x !== san);
			document.body.innerHTML = "";
		}
		console.log(`so ca: ${CA.length}`);
	});
});
