import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
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
	{ locale = "vi", thamSo = "" }: { locale?: Locale; thamSo?: string } = {},
): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
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
	dat("okr.mine", () => mineOutput.parse({ objectives: [] }));
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
