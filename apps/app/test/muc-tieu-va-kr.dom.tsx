import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chamKrInput, ghiDieuHocDuocInput } from "@crm/validation/okr-khep";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
} from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactElement,
	type ReactNode,
} from "react";
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
	viecCuaToiOutput,
} from "../../api/src/okr/okr.contracts";
import {
	type BangChamOutput,
	bangChamOutput,
	type KrCham,
} from "../../api/src/okr/okr-khep.contracts";
import { danhSachOutput } from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

const HUNG = { id: "hung", name: "Trần Văn Hùng", email: "hung@onehub.vn" };
const LAN = { id: "lan", name: "Nguyễn Thị Lan", email: "lan@onehub.vn" };

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

const krCua = (mtId: string, so: number, doi: Partial<KrOutput> = {}) =>
	Array.from({ length: so }, (_, i) => kr(`${mtId}-kr${i + 1}`, mtId, doi));

function mucTieu(
	id: string,
	keyResults: KrOutput[],
	doi: Partial<MucTieuOutput> = {},
) {
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
		keyResults,
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

function chiTietTu(mt: MucTieuOutput, doi: Partial<ObjectiveOutput> = {}) {
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
		cycleName: "Quý 4/2026",
		kyGhiDuoc: true,
		mangSangToi: null,
		mangSangTu: null,
		trail: [],
		canEditKr: mt.canEdit ? mt.keyResults.map((k) => k.id) : [],
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

function quy(id: string, name: string, tu: string, den: string, phase: string) {
	return {
		id,
		kind: "quy",
		name,
		parentId: null,
		startsOn: tu,
		endsOn: den,
		phase,
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
}

const Q3 = quy("q3", "Quý 3/2026", "2026-07-01", "2026-09-30", "cham-diem");
const Q4 = quy("q4", "Quý 4/2026", "2026-10-01", "2026-12-31", "dang-chay");
const KY_CO = cyclesOutput.parse({ cycles: [Q4], currentId: "q4" });
const KY_KHONG = cyclesOutput.parse({ cycles: [], currentId: null });
const KY_CHAM = cyclesOutput.parse({
	cycles: [Q3, { ...Q4, phase: "lap-ke-hoach" }],
	currentId: "q3",
});

const CAY = orgTreeOutput.parse({
	divisions: [],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [],
	archived: { divisions: [], departments: [] },
	coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
});
const QUYEN = okrAccessOutput.parse({
	canManageProgram: false,
	headOf: { divisions: [], departments: [] },
});
const VIEC_RONG = viecCuaToiOutput.parse({ viec: [], lienQuanOkr: false });

const danhSachTu = (ds: MucTieuOutput[]) =>
	danhSachOutput.parse({
		rows: ds.map((mt) => ({ ...mt, krKhop: [] })),
		daBo: [],
		total: ds.length,
		facetCounts: {
			phuTrach: [],
			loai: [],
			trangThai: [],
			tuTin: [],
			gopY: [],
		},
		canEdit: false,
		canCreate: false,
	});

function nguonMay(loai: "crm" | "api" | "bang-tinh"): KrOutput["nguonMay"] {
	return {
		loai,
		chiSo: loai === "crm" ? "thoa-thuan-chot-duoc" : null,
		phamVi: loai === "crm" ? { kieu: "phong-ban", id: "pb-1" } : null,
		bac: null,
		sheetId: null,
		sheetO: null,
		docLuc: null,
		docGiaTri: null,
		docLoi: null,
	};
}

let cycles = KY_CO;
let mine = mineOutput.parse({ dangTheoDoi: [], objectives: [], daBo: [] });
let danhSach = danhSachTu([]);
let chiTiet = chiTietTu(mucTieu("mt-s", []));
let bangCham: BangChamOutput = bangChamOutput.parse({
	thang: "0-1",
	conLai: 0,
	chuaCham: [],
	hocTapChuaGhi: [],
	mucTieu: [],
});
let treo = new Set<string>();
let loi = new Set<string>();
let soLanDoc = new Map<string, number>();
type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
let daGhi: { duong: string; dauVao: DauVao }[] = [];
let duongTrang = "/ws/okr";

const PROGRAM = {
	objectiveCap: 5,
	krCap: 5,
	capMode: "canh-bao",
	scoreScale: "0-1",
	weightsOn: false,
	personalOn: false,
	version: 1,
};

function docThuTuc(duong: string): object | null {
	switch (duong) {
		case "okr.cycles":
			return cycles;
		case "okr.access":
			return QUYEN;
		case "okr.viecCuaToi":
			return VIEC_RONG;
		case "okr.mine":
			return mine;
		case "okr.countByUnit":
			return {};
		case "okr.danhSach":
			return danhSach;
		case "okr.objective":
			return chiTiet;
		case "okr.bangCham":
			return bangCham;
		case "okr.program":
			return PROGRAM;
		case "okr.comments":
			return { comments: [], dong: [] };
		case "okr.alignmentTargets":
			return { targets: [] };
		case "okr.mau":
			return { mau: [], quanTri: false };
		case "okr.thanhVien":
			return [HUNG, LAN];
		case "okr.troLySanSang":
			return { bat: false, lyDo: "tat" };
		case "okr.troLyDanhSach":
			return { dong: [], dangSoan: false, maKetThuc: null, lyDo: "tat" };
		case "org.tree":
			return CAY;
		case "workspace.get":
			return { name: "OneHub", viewerRole: "member" };
		case "users.list":
			return [
				{ ...HUNG, image: null },
				{ ...LAN, image: null },
			];
		case "users.me":
			return HUNG;
		default:
			return null;
	}
}

type KetGhi = { id: string; canhBao: null } | { sessionId: string };
type ChonGhi = {
	onSuccess?: (kq: KetGhi) => void;
	onError?: (e: Error) => void;
};

function thuTuc(duong: string) {
	return {
		queryKey: (vao?: DauVao) => [duong, vao ?? null],
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao | typeof skipToken) =>
			vao === skipToken
				? { queryKey: [duong, "skip"], queryFn: skipToken }
				: {
						queryKey: [duong, vao ?? null],
						queryFn: async () => {
							soLanDoc.set(duong, (soLanDoc.get(duong) ?? 0) + 1);
							if (treo.has(duong)) return new Promise<never>(() => {});
							if (loi.has(duong)) throw new Error(`loi gia: ${duong}`);
							return docThuTuc(duong);
						},
					},
		mutationOptions: (chon?: ChonGhi) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => {
				daGhi.push({ duong, dauVao: vao });
				return duong === "okr.moCapNhat"
					? { sessionId: "phien-1" }
					: { id: "ok", canhBao: null };
			},
		}),
	};
}

const nhanh = (goc: string) =>
	new Proxy({}, { get: (_dich, ten) => thuTuc(`${goc}.${String(ten)}`) });

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: nhanh("okr"),
		org: nhanh("org"),
		workspace: nhanh("workspace"),
		users: nhanh("users"),
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ okr: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => duongTrang,
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));

const { CuaToi } = await import("@/app/(app)/[slug]/okr/cua-toi");
const { BangMucTieu } = await import("@/app/(app)/[slug]/okr/bang-muc-tieu");
const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
const { ChamDiem } = await import("@/app/(app)/[slug]/okr/cham-diem");
const { ObjectiveSheet } = await import(
	"@/components/crm/record-sheet/objective-sheet"
);
const { DetailSheet } = await import("@/components/detail-sheet");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");
const { Card, CardHeader, CardTitle } = await import("@crm/ui/components/card");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrMessages } = await import("@/lib/messages/okr");
const { okrKhepMessages } = await import("@/lib/messages/okr-khep");
const { okrSoMessages } = await import("@/lib/messages/okr-so");

type DiemCam = import("@/app/(app)/[slug]/okr/diem-cam").DiemCam;

const m = okrMessages("vi");
const mk = okrKhepMessages("vi");
const ms = okrSoMessages("vi");

type San = {
	o: HTMLElement;
	root: Root;
	url: () => URLSearchParams;
	soLanGhiUrl: () => number;
};
let dangMo: San[] = [];

async function dung(man: ReactElement, thamSo = ""): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
		},
	});
	let url = new URLSearchParams(thamSo);
	let soLan = 0;
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					soLan += 1;
					url = new URLSearchParams(e.searchParams);
				}}
				searchParams={thamSo}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root, url: () => url, soLanGhiUrl: () => soLan };
	dangMo.push(san);
	return san;
}

async function nhip(lan = 1): Promise<void> {
	for (let i = 0; i < lan; i += 1)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 2));
		});
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 120; vong += 1) {
		if (xong()) return;
		await nhip();
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 400)}`,
	);
}

async function doi(xong: () => boolean): Promise<boolean> {
	for (let vong = 0; vong < 60; vong += 1) {
		if (xong()) return true;
		await nhip();
	}
	return xong();
}

const nguoiDung = () =>
	userEvent.setup({ document, pointerEventsCheck: 0, delay: null });

async function bamChuot(o: Element): Promise<void> {
	const u = nguoiDung();
	await act(async () => {
		await u.click(o);
	});
}

async function bamPhim(o: HTMLElement, phim: string): Promise<void> {
	const u = nguoiDung();
	o.focus();
	await act(async () => {
		await u.keyboard(phim);
	});
}

async function goChu(o: Element, chu: string): Promise<void> {
	const u = nguoiDung();
	await act(async () => {
		await u.type(o, chu);
	});
}

type Gia =
	| string
	| number
	| boolean
	| null
	| readonly Gia[]
	| { readonly [khoa: string]: Gia };

function soCa(
	thucTe: { readonly [khoa: string]: Gia },
	mongDoi: { readonly [khoa: string]: Gia },
	thongDiep: (truong: string) => string,
): void {
	const lech = Object.keys(mongDoi).find(
		(k) => !Bun.deepEquals(thucTe[k], mongDoi[k]),
	);
	expect(thucTe, lech === undefined ? "khop" : thongDiep(lech)).toEqual(
		mongDoi,
	);
}

const khoi = (id: string) =>
	document.body.querySelector<HTMLElement>(`[data-muc-tieu="${id}"]`);
const hangMt = (id: string) =>
	document.body.querySelector<HTMLTableRowElement>(
		`[data-hang-muc-tieu="${id}"]`,
	);
const hangKr = (id: string) =>
	document.body.querySelector<HTMLTableRowElement>(`[data-kr="${id}"]`);
const nutMo = (id: string) => hangMt(id)?.querySelector("button") ?? null;
const khoaHang = (tr: Element) =>
	tr.getAttribute("data-hang-muc-tieu") ??
	tr.getAttribute("data-kr") ??
	tr.getAttribute("data-chua-co-kr") ??
	"khac";
const hangTbody = (goc: Element) => [...goc.querySelectorAll("tbody tr")];
const nhanKr = (tr: Element) =>
	[...tr.querySelectorAll("span")]
		.map((s) => s.textContent ?? "")
		.find((t) => /^KR\d+$/.test(t)) ?? null;
const phanTram = (goc: Element) =>
	[...goc.querySelectorAll("[data-o-tien-do]")].map(
		(o) =>
			[...o.querySelectorAll("span")]
				.map((s) => s.textContent ?? "")
				.find((t) => /^\d+%$/.test(t)) ?? null,
	);
const vach = (goc: Element) =>
	[...goc.querySelectorAll("[data-expected]")].map((v) =>
		v.getAttribute("data-expected"),
	);
const tinhTu = (goc: Element) =>
	[...goc.querySelectorAll("[data-o-tien-do]")].map(
		(o) => /Tính từ \d+ KR/.exec(o.textContent ?? "")?.[0] ?? null,
	);
const sau = (a: Element | null, b: Element | null) =>
	a !== null &&
	b !== null &&
	(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

const daTaiXong = () =>
	document.body.querySelector(
		"[data-trang-thai]:not([data-trang-thai='ST-donvi-dangtai'])",
	) !== null;

async function dungCuaToi(ds: MucTieuOutput[], thamSo = ""): Promise<San> {
	mine = mineOutput.parse({ dangTheoDoi: [], objectives: ds, daBo: [] });
	const san = await dung(<CuaToi />, thamSo);
	await cho(daTaiXong, "cua toi tai xong");
	return san;
}

async function dungTheoDonVi(ds: MucTieuOutput[], thamSo = ""): Promise<San> {
	danhSach = danhSachTu(ds);
	duongTrang = "/ws/okr/theo-don-vi";
	const san = await dung(<TheoDonVi />, thamSo);
	await cho(daTaiXong, "theo don vi tai xong");
	return san;
}

async function dungBang(
	ds: MucTieuOutput[],
	chon: {
		diemCam?: DiemCam;
		dangMo?: ReadonlySet<string>;
		onDoiMo?: (id: string) => void;
		thamSo?: string;
	} = {},
): Promise<San> {
	const san = await dung(
		<BangMucTieu
			danhDauCuaToi
			dangMo={chon.dangMo}
			diemCam={chon.diemCam}
			ds={ds}
			hienDonVi
			onDoiMo={chon.onDoiMo}
		/>,
		chon.thamSo ?? "",
	);
	await cho(
		() =>
			document.body.querySelector("[data-so-kr-cho]") === null &&
			document.body.querySelector("[data-muc-tieu]") !== null,
		"bang muc tieu va quyen xem so",
	);
	return san;
}

async function dungSheet(ct: ObjectiveOutput, diemCam?: DiemCam) {
	chiTiet = ct;
	const san = await dung(
		<DetailSheet onOpenChange={() => {}} open>
			<ObjectiveSheet diemCam={diemCam} objectiveId={ct.id} />
		</DetailSheet>,
		`?record=objective:${ct.id}`,
	);
	await cho(
		() =>
			document.body.querySelector("[data-okr-sheet] [role=tab]") !== null &&
			document.body.querySelector("[data-so-kr-cho]") === null,
		"sheet tai xong",
	);
	return san;
}

async function dungCham(): Promise<San> {
	cycles = KY_CHAM;
	const san = await dung(<ChamDiem cycleId="q3" unit={{ loai: "goc" }} />);
	await cho(
		() =>
			document.body.querySelector("[data-cham-diem]") !== null &&
			document.body.querySelector("[data-nut='mang-sang']") !== null,
		"bang cham tai xong",
	);
	return san;
}

beforeEach(() => {
	cycles = KY_CO;
	mine = mineOutput.parse({ dangTheoDoi: [], objectives: [], daBo: [] });
	danhSach = danhSachTu([]);
	treo = new Set();
	loi = new Set();
	soLanDoc = new Map();
	daGhi = [];
	duongTrang = "/ws/okr";
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

function docHangMucTieu(id: string) {
	const k = khoi(id);
	const hang = hangMt(id);
	if (!k || !hang) throw new Error(`khong thay khoi ${id}`);
	const bang = k.querySelector("table");
	return {
		bang: k.querySelectorAll("table").length,
		hangDau: bang ? khoaHang(hangTbody(bang)[0] ?? bang) : null,
		hangTrongBang: bang ? hangTbody(bang).map(khoaHang) : [],
		phanTram: phanTram(hang),
		vach: vach(hang),
		tinhTu: tinhTu(hang),
		nhip:
			hang
				.querySelector("[data-tinh-trang]")
				?.getAttribute("data-tinh-trang") ?? null,
	};
}

describe("co-du-lieu", () => {
	test("co-du-lieu: phan tram muc tieu la progress API (10), khong phai trung binh KR 40", async () => {
		expect.assertions(1);
		await dungCuaToi([
			mucTieu(
				"mt10",
				[
					kr("mt10-kr1", "mt10", { progress: 30 }),
					kr("mt10-kr2", "mt10", { progress: 50 }),
				],
				{ progress: 10, expected: 47 },
			),
		]);
		soCa(
			{ phanTram: docHangMucTieu("mt10").phanTram },
			{ phanTram: ["10%", "10%"] },
			() => "phan tram khong tu api: 10",
		);
		console.log("so ca co-du-lieu progress-api: 1");
	});

	test("co-du-lieu: hai muc tieu progress 49 va 25, expected 47, KR trong cung bang", async () => {
		const MA_TRAN = [
			{
				id: "mt1",
				progress: 49,
				mongDoi: {
					viTri: 0,
					bang: 1,
					hangDau: "mt1",
					hangTrongBang: ["mt1", "mt1-kr1", "mt1-kr2", "mt1-kr3", "mt1-kr4"],
					phanTram: ["49%", "49%"],
					vach: ["47", "47"],
					tinhTu: ["Tính từ 4 KR", "Tính từ 4 KR"],
					nhip: "dung-nhip",
				},
			},
			{
				id: "mt2",
				progress: 25,
				mongDoi: {
					viTri: 1,
					bang: 1,
					hangDau: "mt2",
					hangTrongBang: ["mt2", "mt2-kr1", "mt2-kr2"],
					phanTram: ["25%", "25%"],
					vach: ["47", "47"],
					tinhTu: ["Tính từ 2 KR", "Tính từ 2 KR"],
					nhip: "cham-nhip",
				},
			},
		];
		expect.assertions(MA_TRAN.length);
		await dungCuaToi([
			mucTieu("mt1", krCua("mt1", 4), { progress: 49, expected: 47 }),
			mucTieu("mt2", krCua("mt2", 2), { progress: 25, expected: 47 }),
		]);
		const thuTuKhoi = [
			...document.body.querySelectorAll("[data-muc-tieu]"),
		].map((k) => k.getAttribute("data-muc-tieu"));
		for (const ca of MA_TRAN)
			soCa(
				{ viTri: thuTuKhoi.indexOf(ca.id), ...docHangMucTieu(ca.id) },
				ca.mongDoi,
				(truong) =>
					truong === "phanTram"
						? `phan tram khong tu api: ${ca.progress}`
						: `co-du-lieu sai: ${ca.id} ${truong}`,
			);
		console.log(`so ca co-du-lieu: ${MA_TRAN.length}`);
	});

	test("co-du-lieu: expected null va 0 khong co vach, nhip chua co ky vong; doi chung expected 47 co vach", async () => {
		const MA_TRAN = [
			{ id: "mt-47", mongDoi: { vach: ["47", "47"], nhip: "dung-nhip" } },
			{ id: "mt-null", mongDoi: { vach: [], nhip: "chua-co-ky-vong" } },
			{ id: "mt-0", mongDoi: { vach: [], nhip: "chua-co-ky-vong" } },
		];
		expect.assertions(MA_TRAN.length);
		await dungCuaToi([
			mucTieu("mt-47", krCua("mt-47", 2), { progress: 49, expected: 47 }),
			mucTieu("mt-null", krCua("mt-null", 2), { progress: 49, expected: null }),
			mucTieu("mt-0", krCua("mt-0", 2), { progress: 49, expected: 0 }),
		]);
		for (const ca of MA_TRAN) {
			const doc = docHangMucTieu(ca.id);
			soCa(
				{ vach: doc.vach, nhip: doc.nhip },
				ca.mongDoi,
				(truong) => `ky vong sai: ${ca.id} ${truong}`,
			);
		}
		console.log(`so ca co-du-lieu ky-vong: ${MA_TRAN.length}`);
	});
});

describe("theo-don-vi", () => {
	test("theo-don-vi: ba khoi theo thu tu, hang muc tieu dau tbody roi KR cua chinh no", async () => {
		const MA_TRAN = [
			["mt1", "mt1-kr1", "mt1-kr2"],
			["mt2", "mt2-kr1"],
			["mt3", "mt3-kr1", "mt3-kr2", "mt3-kr3"],
		];
		expect.assertions(MA_TRAN.length);
		await dungTheoDonVi([
			mucTieu("mt1", krCua("mt1", 2)),
			mucTieu("mt2", krCua("mt2", 1)),
			mucTieu("mt3", krCua("mt3", 3)),
		]);
		const cacKhoi = [...document.body.querySelectorAll("[data-muc-tieu]")];
		MA_TRAN.forEach((mongDoi, i) => {
			const id = mongDoi[0] ?? "";
			const k = cacKhoi[i];
			const bang = k?.querySelector("table") ?? null;
			const hang = bang ? hangTbody(bang) : [];
			soCa(
				{
					khoi: k?.getAttribute("data-muc-tieu") ?? null,
					bang: k?.querySelectorAll("table").length ?? 0,
					thuTu: hang.map(khoaHang),
					nhan: hang.slice(1).map(nhanKr),
					theadSrOnly:
						bang?.querySelector("thead")?.classList.contains("sr-only") ??
						false,
					th: bang?.querySelectorAll("thead th").length ?? 0,
				},
				{
					khoi: id,
					bang: 1,
					thuTu: mongDoi,
					nhan: mongDoi.slice(1).map((_, j) => `KR${j + 1}`),
					theadSrOnly: true,
					th: 4,
				},
				(truong) =>
					truong === "thuTu" || truong === "nhan"
						? `thu tu kr sai: ${id}`
						: `theo-don-vi sai: ${id} ${truong}`,
			);
		});
		console.log(`so ca theo-don-vi: ${MA_TRAN.length}`);
	});
});

const HAI_MT = () => [
	mucTieu("mt-a", krCua("mt-a", 2)),
	mucTieu("mt-b", krCua("mt-b", 2)),
];

describe("thu-mo", () => {
	const CACH = ["chuot", "enter", "space"] as const;
	const MA_TRAN = CACH.flatMap((cach) =>
		(["mt-a", "mt-b"] as const).map((id) => ({ cach, id })),
	);

	async function thaoTac(
		cach: (typeof CACH)[number],
		nut: HTMLButtonElement,
	): Promise<void> {
		if (cach === "chuot") await bamChuot(nut);
		else await bamPhim(nut, cach === "enter" ? "{Enter}" : " ");
		await nhip(2);
	}

	test("thu-mo: {chuot, Enter, Space} x {mt-a, mt-b} — KR roi DOM, aria-expanded false, URL ghi thuMucTieu", async () => {
		expect.assertions(MA_TRAN.length);
		for (const ca of MA_TRAN) {
			const san = await dungBang(HAI_MT());
			const khac = ca.id === "mt-a" ? "mt-b" : "mt-a";
			const nut = nutMo(ca.id);
			if (!nut) throw new Error(`khong co nut mo ${ca.id}`);
			await thaoTac(ca.cach, nut);
			await doi(() => san.url().get("thuMucTieu") !== null);
			soCa(
				{
					soKr: khoi(ca.id)?.querySelectorAll("[data-kr]").length ?? -1,
					ariaExpanded: nutMo(ca.id)?.getAttribute("aria-expanded") ?? null,
					khacMo: khoi(khac)?.querySelectorAll("[data-kr]").length ?? -1,
					url: san.url().get("thuMucTieu"),
				},
				{ soKr: 0, ariaExpanded: "false", khacMo: 2, url: ca.id },
				(truong) =>
					truong === "url"
						? "url khong ghi thuMucTieu"
						: `thu-mo sai: ${ca.cach} x ${ca.id} ${truong}`,
			);
			await act(async () => san.root.unmount());
			san.o.remove();
			dangMo = dangMo.filter((s) => s !== san);
		}
		console.log(`so ca thu-mo: ${MA_TRAN.length}`);
	});

	test("thu-mo: mo lai cai cuoi thi khoa roi URL; doi chung truoc do URL co khoa", async () => {
		expect.assertions(2);
		const san = await dungBang(HAI_MT());
		const nut = nutMo("mt-a");
		if (!nut) throw new Error("khong co nut mo mt-a");
		await bamChuot(nut);
		await doi(() => san.url().get("thuMucTieu") !== null);
		const truoc = san.url().get("thuMucTieu");
		const ghiTruoc = san.soLanGhiUrl();
		await bamChuot(nut);
		await doi(() => san.soLanGhiUrl() > ghiTruoc);
		expect(truoc, "url khong ghi thuMucTieu").toBe("mt-a");
		soCa(
			{
				url: san.url().get("thuMucTieu"),
				daGhi: san.soLanGhiUrl() > ghiTruoc,
				soKr: khoi("mt-a")?.querySelectorAll("[data-kr]").length ?? -1,
				ariaExpanded: nut.getAttribute("aria-expanded"),
			},
			{ url: null, daGhi: true, soKr: 2, ariaExpanded: "true" },
			(truong) => `mo lai khong xoa khoa: ${truong}`,
		);
		console.log("so ca thu-mo mo-lai: 2");
	});

	test("thu-mo: id la trong URL bi bo qua, moi muc tieu mo; thu tiep giu ca id dang khuat", async () => {
		expect.assertions(2);
		const san = await dungBang(HAI_MT(), {
			thamSo: "?thuMucTieu=khong-ton-tai",
		});
		soCa(
			{
				a: khoi("mt-a")?.querySelectorAll("[data-kr]").length ?? -1,
				b: khoi("mt-b")?.querySelectorAll("[data-kr]").length ?? -1,
			},
			{ a: 2, b: 2 },
			(truong) => `id la lam thu: ${truong}`,
		);
		const nut = nutMo("mt-a");
		if (!nut) throw new Error("khong co nut mo mt-a");
		await bamChuot(nut);
		await doi(() => san.url().get("thuMucTieu") !== "khong-ton-tai");
		expect(san.url().get("thuMucTieu"), "url mat id dang khuat").toBe(
			"khong-ton-tai,mt-a",
		);
		console.log("so ca thu-mo id-la: 2");
	});

	test("thu-mo: id trung va rong trong URL bi bo; ghi lai khong trung khong rong", async () => {
		const MA_TRAN = [
			{
				thamSo: "?thuMucTieu=mt-a,,mt-a",
				docMongDoi: { a: 0, b: 2 },
				bam: "mt-b",
				ghiMongDoi: ["mt-a,mt-b"],
			},
			{
				thamSo: "?thuMucTieu=&thuMucTieu=mt-a,mt-a",
				docMongDoi: { a: 2, b: 2 },
				bam: "mt-b",
				ghiMongDoi: ["mt-b"],
			},
		];
		expect.assertions(MA_TRAN.length);
		for (const ca of MA_TRAN) {
			const san = await dungBang(HAI_MT(), { thamSo: ca.thamSo });
			const doc = {
				a: khoi("mt-a")?.querySelectorAll("[data-kr]").length ?? -1,
				b: khoi("mt-b")?.querySelectorAll("[data-kr]").length ?? -1,
			};
			const nut = nutMo(ca.bam);
			if (!nut) throw new Error(`khong co nut mo ${ca.bam}`);
			const ghiTruoc = san.soLanGhiUrl();
			await bamChuot(nut);
			await doi(() => san.soLanGhiUrl() > ghiTruoc);
			soCa(
				{ ...doc, ghi: san.url().getAll("thuMucTieu") },
				{ ...ca.docMongDoi, ghi: ca.ghiMongDoi },
				(truong) =>
					truong === "ghi"
						? `url giu id trung hoac rong: ${ca.thamSo}`
						: `id trung rong doc sai: ${ca.thamSo} ${truong}`,
			);
			await thaoSan(san);
		}
		console.log(`so ca thu-mo trung-rong: ${MA_TRAN.length}`);
	});

	test("thu-mo: bam ten muc tieu mo sheet, khong doi thu/mo; doi chung URL co record", async () => {
		expect.assertions(1);
		const san = await dungBang(HAI_MT());
		const ten = hangMt("mt-a")?.querySelector("[data-mo-muc-tieu]");
		if (!ten) throw new Error("khong co nut ten mt-a");
		await bamChuot(ten);
		await doi(() => san.url().get("record") !== null);
		soCa(
			{
				record: san.url().get("record"),
				thu: san.url().get("thuMucTieu"),
				soKr: khoi("mt-a")?.querySelectorAll("[data-kr]").length ?? -1,
			},
			{ record: "objective:mt-a", thu: null, soKr: 2 },
			(truong) => `bam ten doi thu mo: ${truong}`,
		);
		console.log("so ca thu-mo bam-ten: 1");
	});

	test("thu-mo: bam lien tiep hai khoi bang ban phim, focus con tren nut vua bam", async () => {
		expect.assertions(2);
		await dungBang(HAI_MT());
		const a = nutMo("mt-a");
		const b = nutMo("mt-b");
		if (!a || !b) throw new Error("khong co nut mo");
		await thaoTac("enter", a);
		const sauA = {
			focus: document.activeElement === a,
			conTrongDom: a.isConnected,
			ariaExpanded: a.getAttribute("aria-expanded"),
		};
		await thaoTac("space", b);
		soCa(
			sauA,
			{ focus: true, conTrongDom: true, ariaExpanded: "false" },
			(truong) => `mat focus sau khi thu mt-a: ${truong}`,
		);
		soCa(
			{
				focus: document.activeElement === b,
				conTrongDom: b.isConnected,
				ariaExpanded: b.getAttribute("aria-expanded"),
				aVanThu: a.getAttribute("aria-expanded"),
			},
			{
				focus: true,
				conTrongDom: true,
				ariaExpanded: "false",
				aVanThu: "false",
			},
			(truong) => `mat focus sau khi thu mt-b: ${truong}`,
		);
		console.log("so ca thu-mo focus: 2");
	});
});

describe("o-tien-do", () => {
	const MA_TRAN = [
		{
			id: "tang-0",
			doi: { targetValue: 50, currentValue: 20, progress: 40 },
			mongDoi: {
				dongPhu: "Tăng tới",
				dongSo: "20 khách / 50 khách",
				phanTram: "40%",
				vach: "47",
				nhip: "dung-nhip",
				dauNguon: null,
				chuaChup: null,
				nutSoKr: false,
			},
		},
		{
			id: "tang-60",
			doi: {
				startValue: 60,
				targetValue: 100,
				currentValue: 70,
				unit: "%",
				progress: 25,
			},
			mongDoi: {
				dongPhu: "Tăng tới · từ 60%",
				dongSo: "70% / 100%",
				phanTram: "25%",
				vach: "47",
				nhip: "cham-nhip",
				dauNguon: null,
				chuaChup: null,
				nutSoKr: false,
			},
		},
		{
			id: "giam-8",
			doi: {
				kind: "giam-xuong",
				startValue: 8,
				targetValue: 2,
				currentValue: 3.5,
				unit: "giờ",
				progress: 75,
			},
			mongDoi: {
				dongPhu: "Giảm xuống · từ 8 giờ",
				dongSo: "3,5 giờ / 2 giờ",
				phanTram: "75%",
				vach: "47",
				nhip: "dung-nhip",
				dauNguon: null,
				chuaChup: null,
				nutSoKr: false,
			},
		},
		{
			id: "moc-chua",
			doi: {
				kind: "moc",
				targetValue: 1,
				currentValue: 0,
				unit: "",
				progress: 0,
			},
			mongDoi: {
				dongPhu: "Mốc",
				dongSo: "Chưa xong",
				phanTram: "0%",
				vach: null,
				nhip: "moc-chua",
				dauNguon: null,
				chuaChup: null,
				nutSoKr: false,
			},
		},
		{
			id: "moc-xong",
			doi: {
				kind: "moc",
				targetValue: 1,
				currentValue: 1,
				unit: "",
				progress: 100,
			},
			mongDoi: {
				dongPhu: "Mốc",
				dongSo: "Xong",
				phanTram: "100%",
				vach: null,
				nhip: "moc-xong",
				dauNguon: null,
				chuaChup: null,
				nutSoKr: false,
			},
		},
		{
			id: "may-chua-co-so",
			doi: {
				source: "crm",
				nguonMay: nguonMay("crm"),
				targetValue: 30,
				currentValue: 0,
				progress: 0,
			},
			mongDoi: {
				dongPhu: "Tăng tới",
				dongSo: "0 khách / 30 khách",
				phanTram: "0%",
				vach: "47",
				nhip: "truot",
				dauNguon: "crm",
				chuaChup: "Số máy: sáng mai",
				nutSoKr: true,
			},
		},
		{
			id: "may-do-canh",
			doi: {
				doCanh: true,
				soMay: { giaTri: 15, ngay: "2026-10-25", nguon: "crm" },
				nguonMay: nguonMay("crm"),
				targetValue: 40,
				currentValue: 12,
				unit: "thoả thuận",
				progress: 30,
			},
			mongDoi: {
				dongPhu: "Tăng tới",
				dongSo: "12 tay · 15 máy / 40 thoả thuận",
				phanTram: "30%",
				vach: "47",
				nhip: "cham-nhip",
				dauNguon: "crm",
				chuaChup: null,
				nutSoKr: true,
			},
		},
	] as const;

	const mtO = () =>
		mucTieu(
			"mt-o",
			MA_TRAN.map((ca) => kr(ca.id, "mt-o", ca.doi as Partial<KrOutput>)),
			{ expected: 47 },
		);

	function docO(id: string) {
		const hang = hangKr(id);
		const td = hang?.querySelector("td[data-nguon]");
		const o = td?.querySelector("[data-o-tien-do]");
		if (!hang || !o) throw new Error(`khong co o tien do cua ${id}`);
		const so = o.querySelector(
			"[data-so-kr],[data-so-kr-tran],[data-so-kr-cho]",
		);
		const ten = hang.querySelector('[translate="no"]');
		const phu = ten?.parentElement?.nextElementSibling;
		return {
			dongPhu: phu?.childNodes[0]?.textContent ?? null,
			dongSo: so
				? (so.parentElement?.textContent ?? null)
				: (o.childNodes[0]?.textContent ?? null),
			phanTram: phanTram(td ?? o)[0] ?? null,
			vach:
				o.querySelector("[data-expected]")?.getAttribute("data-expected") ??
				null,
			nhip:
				o.querySelector("[data-tinh-trang]")?.getAttribute("data-tinh-trang") ??
				null,
			dauNguon:
				o.querySelector("[data-dau-nguon]")?.getAttribute("data-dau-nguon") ??
				null,
			chuaChup: o.querySelector("[data-chua-chup]")?.textContent ?? null,
			nutSoKr: o.querySelector("button[data-so-kr]") !== null,
		};
	}

	test("o-tien-do: ma tran bay KR — dong so, phan tram, vach, dong phu, dau nguon, chua chup, nut so", async () => {
		expect.assertions(MA_TRAN.length);
		await dungBang([mtO()]);
		for (const ca of MA_TRAN)
			soCa(docO(ca.id), ca.mongDoi, (truong) =>
				truong === "dongPhu"
					? ca.mongDoi.dongPhu.includes(" · từ ")
						? `thieu tu khoi diem: ${ca.id}`
						: `thua tu khoi diem: ${ca.id}`
					: `o tien do sai: ${ca.id} ${truong}`,
			);
		console.log(`so khang dinh o-tien-do: ${MA_TRAN.length}`);
	});

	test("o-tien-do: khong thead nao chua «Đích»; doi chung thead co «Tiến độ»", async () => {
		expect.assertions(1);
		await dungBang([mtO()]);
		const thead = [...document.body.querySelectorAll("thead")].map(
			(t) => t.textContent ?? "",
		);
		soCa(
			{
				soThead: thead.length,
				coDich: thead.some((t) => t.includes(m.cot.dich)),
				coTienDo: thead.every((t) => t.includes(m.cot.tienDo)),
			},
			{ soThead: 1, coDich: false, coTienDo: true },
			(truong) => `thead sai: ${truong}`,
		);
		console.log("so ca o-tien-do thead: 1");
	});

	test("o-tien-do: bam so cua KR may mo so so; doi chung KR tay khong co nut", async () => {
		expect.assertions(1);
		const san = await dungBang([mtO()]);
		const nut = hangKr("may-chua-co-so")?.querySelector("button[data-so-kr]");
		if (!nut) throw new Error("khong co nut so cua may-chua-co-so");
		await bamChuot(nut);
		await doi(() => san.url().get("record") !== null);
		soCa(
			{
				record: san.url().get("record"),
				nutTay:
					(hangKr("tang-0")?.querySelector("button[data-so-kr]") ?? null) !==
					null,
			},
			{ record: "so-kr:may-chua-co-so", nutTay: false },
			(truong) => `nut so kr sai: ${truong}`,
		);
		console.log("so ca o-tien-do so-kr: 1");
	});

	test("o-tien-do: ban duoi ten cua KR may giu dau nguon, so do canh, chua chup va khong mang moc do trung", async () => {
		const MOC_TRUNG =
			"[data-so-kr],[data-so-kr-tran],[data-so-kr-cho],[data-dau-nguon],[data-chua-chup],[data-tinh-trang]";
		const CA = ["may-chua-co-so", "may-do-canh"] as const;
		expect.assertions(CA.length);
		await dungBang([mtO()]);
		for (const id of CA) {
			const hang = hangKr(id);
			const day = hang?.querySelector("td[data-nguon]");
			const gon = hang?.querySelector("td:not([data-nguon]) [data-o-tien-do]");
			const dau = day?.querySelector("[data-dau-nguon]")?.textContent ?? "";
			const chup = day?.querySelector("[data-chua-chup]")?.textContent ?? "";
			const soDay =
				day?.querySelector("[data-so-kr],[data-so-kr-tran],[data-so-kr-cho]")
					?.textContent ?? "";
			const chu = gon?.textContent ?? "";
			expect(
				{
					coBanGon: gon !== null && gon !== undefined,
					dau: dau !== "" && chu.includes(dau),
					so: soDay !== "" && chu.includes(soDay),
					chup: chup === "" || chu.includes(chup),
					mocTrung: gon?.querySelectorAll(MOC_TRUNG).length ?? -1,
					oLong: gon?.querySelectorAll("[data-o-tien-do]").length ?? -1,
				},
				`ban dien thoai mat thong tin may: ${id}`,
			).toEqual({
				coBanGon: true,
				dau: true,
				so: true,
				chup: true,
				mocTrung: 0,
				oLong: 0,
			});
		}
		console.log(`so ca o-tien-do ban gon may: ${CA.length}`);
	});
});

describe("chua-co-kr", () => {
	test("chua-co-kr: hang rong ngay sau hang muc tieu, o tien do «Chưa có KR để tính»; doi chung muc tieu co KR", async () => {
		const MA_TRAN = [
			{
				id: "mt-rong",
				mongDoi: {
					sauHangMt: "mt-rong",
					chu: m.chuaCoKr,
					oTienDo: [m.khoiMucTieu.chuaCoKrDeTinh, m.khoiMucTieu.chuaCoKrDeTinh],
					soKr: 0,
				},
			},
			{
				id: "mt-du",
				mongDoi: {
					sauHangMt: null,
					chu: null,
					oTienDo: ["Tính từ 2 KR", "Tính từ 2 KR"],
					soKr: 2,
				},
			},
		];
		expect.assertions(MA_TRAN.length);
		await dungBang([
			mucTieu("mt-rong", []),
			mucTieu("mt-du", krCua("mt-du", 2)),
		]);
		for (const ca of MA_TRAN) {
			const hang = hangMt(ca.id);
			const keTiep = hang?.nextElementSibling ?? null;
			const rong = khoi(ca.id)?.querySelector("[data-chua-co-kr]") ?? null;
			soCa(
				{
					sauHangMt: keTiep?.getAttribute("data-chua-co-kr") ?? null,
					chu: rong?.textContent ?? null,
					oTienDo: [...(hang?.querySelectorAll("[data-o-tien-do]") ?? [])].map(
						(o) =>
							o.textContent?.includes(m.khoiMucTieu.chuaCoKrDeTinh)
								? m.khoiMucTieu.chuaCoKrDeTinh
								: (/Tính từ \d+ KR/.exec(o.textContent ?? "")?.[0] ?? null),
					),
					soKr: khoi(ca.id)?.querySelectorAll("[data-kr]").length ?? -1,
				},
				ca.mongDoi,
				(truong) =>
					truong === "sauHangMt" || truong === "chu"
						? ca.mongDoi.chu === null
							? `hang chua co kr thua: ${ca.id}`
							: "thieu hang chua co kr"
						: `chua-co-kr sai: ${ca.id} ${truong}`,
			);
		}
		console.log(`so ca chua-co-kr: ${MA_TRAN.length}`);
	});
});

const WHY = "Khách doanh nghiệp chiếm 60% doanh thu quý trước.";
const NOI_GOP = {
	alignmentId: "al-1",
	targetObjectiveId: "mt-cha",
	targetKeyResultId: "kr-cha",
	unitName: "Toàn công ty",
	objectiveTitle: "Tăng doanh thu năm",
	keyResultTitle: "Doanh thu đạt 50 tỷ",
};
const mtSheet = (doi: Partial<MucTieuOutput> = {}) =>
	chiTietTu(
		mucTieu("mt-s", krCua("mt-s", 3), {
			whyNow: WHY,
			alignments: [NOI_GOP],
			progress: 49,
			canEdit: true,
			...doi,
		}),
	);

function docSheet() {
	const b = document.body;
	const viSao = b.querySelector("[data-khu='vi-sao']");
	const gopVao = b.querySelector("[data-khu='gop-vao']");
	const bangKr = b.querySelector("[data-kr]")?.closest("table") ?? null;
	const tienDoTu = b.querySelector("[data-tien-do-tu]");
	const ct = chiTiet;
	return {
		thuTu:
			[viSao, gopVao].filter((x) => x !== null).length < 2 ||
			(sau(viSao, gopVao) && sau(gopVao, bangKr) && sau(bangKr, tienDoTu)),
		viSao: viSao?.querySelector("p[translate='no']")?.textContent ?? null,
		gopVao: [...(gopVao?.querySelectorAll("[data-gop-vao]") ?? [])].map(
			(dong) =>
				[
					dong.querySelector("[data-slot='item-title']")?.textContent ?? "",
					dong.querySelector("[data-slot='item-description']")?.textContent ??
						"",
				].join(" · "),
		),
		nhanKr: [...b.querySelectorAll("[data-kr]")].map(nhanKr),
		tienDoTu: tienDoTu?.textContent ?? null,
		menu: ct.keyResults.filter((k) => {
			const nut = b.querySelector(
				`button[aria-label="${dien(m.sheet.menuKr, { ten: k.title })}"]`,
			);
			return nut?.getAttribute("aria-haspopup") === "menu";
		}).length,
		cotViec: b.querySelectorAll("[data-cot-viec]").length,
		themKr: b.querySelector("[data-nut='them-kr']") !== null,
	};
}

describe("sheet-chi-tiet", () => {
	const DONG_GOP =
		"Tăng doanh thu năm · Toàn công ty · qua KR «Doanh thu đạt 50 tỷ»";
	const TIEN_DO = "Tiến độ mục tiêu 49% tính từ 3 KR.";
	const MA_TRAN = [
		{
			ca: "a",
			ct: () => mtSheet(),
			mongDoi: {
				thuTu: true,
				viSao: WHY,
				gopVao: [DONG_GOP],
				nhanKr: ["KR1", "KR2", "KR3"],
				tienDoTu: TIEN_DO,
				menu: 3,
				cotViec: 3,
				themKr: true,
			},
		},
		{
			ca: "b",
			ct: () => mtSheet({ whyNow: "  " }),
			mongDoi: {
				thuTu: true,
				viSao: null,
				gopVao: [DONG_GOP],
				nhanKr: ["KR1", "KR2", "KR3"],
				tienDoTu: TIEN_DO,
				menu: 3,
				cotViec: 3,
				themKr: true,
			},
		},
		{
			ca: "c",
			ct: () => mtSheet({ alignments: [] }),
			mongDoi: {
				thuTu: true,
				viSao: WHY,
				gopVao: [],
				nhanKr: ["KR1", "KR2", "KR3"],
				tienDoTu: TIEN_DO,
				menu: 3,
				cotViec: 3,
				themKr: true,
			},
		},
		{
			ca: "chi-doc",
			ct: () => mtSheet({ canEdit: false }),
			mongDoi: {
				thuTu: true,
				viSao: WHY,
				gopVao: [DONG_GOP],
				nhanKr: ["KR1", "KR2", "KR3"],
				tienDoTu: TIEN_DO,
				menu: 0,
				cotViec: 3,
				themKr: false,
			},
		},
	];

	for (const ca of MA_TRAN)
		test(`sheet-chi-tiet ${ca.ca}: thu tu Vi sao -> Gop vao -> bang KR -> dong tien do; khu vang khi rong; quyen`, async () => {
			expect.assertions(1);
			await dungSheet(ca.ct());
			await cho(
				() => document.body.querySelector("[data-tien-do-tu]") !== null,
				"dong tien do tu",
			);
			soCa(docSheet(), ca.mongDoi, (truong) =>
				truong === "thuTu"
					? "thu tu khu sai"
					: `sheet-chi-tiet sai: ${ca.ca} ${truong}`,
			);
			console.log(`so ca sheet-chi-tiet ${ca.ca}: 1/${MA_TRAN.length}`);
		});
});

const BA_MT = () => [
	mucTieu("mt-a", krCua("mt-a", 2)),
	mucTieu("mt-b", []),
	mucTieu("mt-c", krCua("mt-c", 3)),
];

const DIEM_CAM_DU: DiemCam = {
	nhanMucTieu: (mt) => <span data-test={`nhan-${mt.id}`}>nhãn</span>,
	duoiMucTieu: (mt) => (
		<span data-test={`duoi-mt-${mt.id}`}>dưới mục tiêu</span>
	),
	duoiKr: (k) =>
		k.id === "mt-c-kr2" ? (
			<span data-test={`duoi-kr-${k.id}`}>dưới KR</span>
		) : null,
	sauTenKr: (k) => <span data-test={`sau-ten-${k.id}`}>sau tên</span>,
};

const DIEM_CAM_SHEET: DiemCam = {
	duoiMucTieu: (mt) => (
		<span data-test={`duoi-mt-${mt.id}`}>dưới mục tiêu</span>
	),
	duoiKr: (k) =>
		k.id === "mt-s-kr2" ? (
			<span data-test={`duoi-kr-${k.id}`}>dưới KR</span>
		) : null,
	sauTenKr: (k) => <span data-test={`sau-ten-${k.id}`}>sau tên</span>,
};

const theTest = (ten: string) =>
	document.body.querySelector(`[data-test="${ten}"]`);
const oTenKr = (id: string) =>
	hangKr(id)?.querySelector('[translate="no"]')?.closest("td") ?? null;

describe("diem-cam", () => {
	test("diem-cam a: khong diem cam va diem cam tra null cho cung so tr; moi KR nam trong dung khoi", async () => {
		const ds = BA_MT();
		const soTr =
			ds.length + ds.reduce((t, mt) => t + mt.keyResults.length, 0) + 1;
		const krMoi = ds.flatMap((mt) =>
			mt.keyResults.map((k) => ({ kr: k.id, mt: mt.id })),
		);
		const BIEN = [
			{
				ten: "khong diem cam",
				diemCam: undefined,
				thongDiep: "hang thua khong diem cam",
			},
			{
				ten: "diem cam tra null",
				diemCam: {
					nhanMucTieu: () => null,
					duoiMucTieu: () => null,
					duoiKr: () => null,
					sauTenKr: () => null,
				} satisfies DiemCam,
				thongDiep: "hang thua khi diem cam null",
			},
		];
		expect.assertions(BIEN.length * 2 + BIEN.length * krMoi.length);
		for (const bien of BIEN) {
			const san = await dungBang(BA_MT(), { diemCam: bien.diemCam });
			const tr = [...document.body.querySelectorAll("tbody tr")].length;
			expect({ ten: bien.ten, tr }, bien.thongDiep).toEqual({
				ten: bien.ten,
				tr: soTr,
			});
			expect(
				document.body.querySelectorAll("[data-muc-tieu]").length,
				`so khoi sai: ${bien.ten}`,
			).toBe(ds.length);
			for (const cap of krMoi)
				expect(
					hangKr(cap.kr)
						?.closest("[data-muc-tieu]")
						?.getAttribute("data-muc-tieu"),
					`kr ngoai khoi: ${cap.kr}`,
				).toBe(cap.mt);
			await act(async () => san.root.unmount());
			san.o.remove();
			dangMo = dangMo.filter((s) => s !== san);
		}
		console.log(
			`so ca diem-cam a: ${BIEN.length} bien x (tr + khoi + ${krMoi.length} KR) = ${BIEN.length * (2 + krMoi.length)}`,
		);
	});

	test("diem-cam b: du sau diem cam nam dung cho trong BangMucTieu", async () => {
		await dungBang(BA_MT(), { diemCam: DIEM_CAM_DU });
		const MA_TRAN = [
			...["mt-a", "mt-b", "mt-c"].map((id) => ({
				ten: `nhanMucTieu ${id}`,
				thucTe:
					theTest(`nhan-${id}`)?.closest("td") ===
					hangMt(id)?.querySelector("[data-mo-muc-tieu]")?.closest("td"),
			})),
			...["mt-a", "mt-c"].map((id) => {
				const tr = theTest(`duoi-mt-${id}`)?.closest("tr") ?? null;
				return {
					ten: `duoiMucTieu ${id}`,
					thucTe:
						tr !== null &&
						tr.previousElementSibling === hangMt(id) &&
						tr.nextElementSibling === hangKr(`${id}-kr1`),
				};
			}),
			{
				ten: "duoiKr mt-c-kr2",
				thucTe:
					hangKr("mt-c-kr2")?.nextElementSibling ===
						(theTest("duoi-kr-mt-c-kr2")?.closest("tr") ?? undefined) &&
					hangKr("mt-c-kr2")?.hasAttribute("data-joined") === true,
			},
			{
				ten: "duoiKr doi chung mt-c-kr1 khong joined",
				thucTe: hangKr("mt-c-kr1")?.hasAttribute("data-joined") === false,
			},
			...["mt-a-kr1", "mt-a-kr2", "mt-c-kr1", "mt-c-kr2", "mt-c-kr3"].map(
				(id) => ({
					ten: `sauTenKr ${id}`,
					thucTe:
						oTenKr(id) !== null &&
						theTest(`sau-ten-${id}`)?.closest("td") === oTenKr(id),
				}),
			),
		];
		expect.assertions(MA_TRAN.length);
		for (const ca of MA_TRAN)
			expect(ca.thucTe, `diem cam sai cho: ${ca.ten}`).toBe(true);
		console.log(`so ca diem-cam b: ${MA_TRAN.length}`);
	});

	test("diem-cam b: dangMo rong + onDoiMo — khong hang KR, bam mui ten goi onDoiMo dung mot lan", async () => {
		expect.assertions(1);
		const goi: string[] = [];
		const san = await dungBang(BA_MT(), {
			dangMo: new Set(),
			onDoiMo: (id) => goi.push(id),
		});
		const nut = nutMo("mt-c");
		if (!nut) throw new Error("khong co nut mo mt-c");
		const truoc = document.body.querySelectorAll("[data-kr]").length;
		await bamChuot(nut);
		soCa(
			{ krTruoc: truoc, goi, ghiUrl: san.soLanGhiUrl() },
			{ krTruoc: 0, goi: ["mt-c"], ghiUrl: 0 },
			(truong) => `dangMo/onDoiMo sai: ${truong}`,
		);
		console.log("so ca diem-cam dang-mo: 1");
	});
});

describe("diem-cam sheet", () => {
	test("diem-cam sheet c: duoiMucTieu, duoiKr, sauTenKr trong bang KR cua sheet", async () => {
		await dungSheet(mtSheet(), DIEM_CAM_SHEET);
		await cho(() => theTest("duoi-mt-mt-s") !== null, "diem cam sheet");
		const trDuoi = theTest("duoi-mt-mt-s")?.closest("tr") ?? null;
		const MA_TRAN = [
			{
				ten: "duoiMucTieu truoc KR1",
				thucTe:
					trDuoi !== null && trDuoi.nextElementSibling === hangKr("mt-s-kr1"),
			},
			{
				ten: "duoiKr dinh duoi mt-s-kr2",
				thucTe:
					hangKr("mt-s-kr2")?.nextElementSibling ===
						(theTest("duoi-kr-mt-s-kr2")?.closest("tr") ?? undefined) &&
					hangKr("mt-s-kr2")?.hasAttribute("data-joined") === true,
			},
			{
				ten: "duoiKr doi chung mt-s-kr1 khong joined",
				thucTe: hangKr("mt-s-kr1")?.hasAttribute("data-joined") === false,
			},
			...["mt-s-kr1", "mt-s-kr2", "mt-s-kr3"].map((id) => ({
				ten: `sauTenKr ${id}`,
				thucTe:
					oTenKr(id) !== null &&
					theTest(`sau-ten-${id}`)?.closest("td") === oTenKr(id),
			})),
		];
		expect.assertions(MA_TRAN.length);
		for (const ca of MA_TRAN)
			expect(ca.thucTe, `diem cam sheet sai cho: ${ca.ten}`).toBe(true);
		console.log(`so ca diem-cam sheet: ${MA_TRAN.length}`);
	});
});

function krCham(id: string, doi: Partial<KrCham> = {}) {
	return {
		id,
		title: `KR ${id}`,
		kind: "tang-toi",
		ownerName: "Phạm Thu Lan",
		unit: "khách",
		startValue: 10,
		targetValue: 30,
		soChot: 24,
		diemGoiY: 0.7,
		diem: null,
		lyDo: null,
		suaDuoc: true,
		doiDichNgoaiRa: [],
		...doi,
	};
}

const BANG_CHAM = () =>
	bangChamOutput.parse({
		thang: "0-1",
		conLai: 3,
		chuaCham: [],
		hocTapChuaGhi: [],
		mucTieu: [
			{
				id: "mt-c1",
				title: "Mục tiêu chấm một",
				kind: "cam-ket",
				ownerName: "Phạm Thu Lan",
				suaDuoc: true,
				diem: null,
				cachDoc: null,
				dieuHocDuoc: "",
				mangSangToi: null,
				mangSangTu: null,
				krs: [krCham("c1-k1"), krCham("c1-k2", { diem: 0.5, diemGoiY: 0.5 })],
			},
			{
				id: "mt-c2",
				title: "Mục tiêu chấm hai",
				kind: "cam-ket",
				ownerName: "Trần Văn Hùng",
				suaDuoc: true,
				diem: 0.7,
				cachDoc: "dat",
				dieuHocDuoc: "Đã ghi",
				mangSangToi: { objectiveId: "mt-x", cycleName: "Quý 4/2026" },
				mangSangTu: null,
				krs: [
					krCham("c2-k1", { diem: 0.7 }),
					krCham("c2-k2", { diem: 0.7 }),
					krCham("c2-k3", { diem: 0.7 }),
				],
			},
		],
	});

describe("cham-diem", () => {
	test("cham-diem: moi muc tieu la hang dau cua bang cham trong khoi; KR danh so; hoc va mang sang trong khoi", async () => {
		bangCham = BANG_CHAM();
		const MA_TRAN = [
			{
				id: "mt-c1",
				mongDoi: {
					khung: { cardHeader: 0, tenTrongHangDau: true },
					bang: 1,
					hangDau: "mt-c1",
					phuTrach: true,
					diem: mk.cham.daCham("1", "2"),
					nhan: ["KR1", "KR2"],
					oHoc: true,
					mangSang: "nut",
				},
			},
			{
				id: "mt-c2",
				mongDoi: {
					khung: { cardHeader: 0, tenTrongHangDau: true },
					bang: 1,
					hangDau: "mt-c2",
					phuTrach: true,
					diem: `${mk.cham.cot.diem} 0,7 · ${mk.cachDoc.dat}`,
					nhan: ["KR1", "KR2", "KR3"],
					oHoc: true,
					mangSang: "da",
				},
			},
		];
		expect.assertions(MA_TRAN.length);
		await dungCham();
		const mts = bangCham.mucTieu;
		for (const ca of MA_TRAN) {
			const mt = mts.find((x) => x.id === ca.id);
			const k = document.body.querySelector(`[data-muc-tieu-cham="${ca.id}"]`);
			const bang = k?.querySelector("table") ?? null;
			const dau = bang ? (hangTbody(bang)[0] ?? null) : null;
			const ten = [...(k?.querySelectorAll('[translate="no"]') ?? [])].find(
				(e) => e.textContent === mt?.title,
			);
			const hangDauChu = dau?.textContent ?? "";
			soCa(
				{
					khung: {
						cardHeader: document.body.querySelectorAll(
							"[data-cham-diem] [data-slot='card-header']",
						).length,
						tenTrongHangDau:
							dau !== null && ten !== undefined && dau.contains(ten),
					},
					bang: k?.querySelectorAll("table").length ?? 0,
					hangDau: dau?.getAttribute("data-hang-muc-tieu-cham") ?? null,
					phuTrach: hangDauChu.includes(mt?.ownerName ?? "?"),
					diem:
						[
							mk.cham.daCham("1", "2"),
							`${mk.cham.cot.diem} 0,7 · ${mk.cachDoc.dat}`,
						].find((d) => hangDauChu.includes(d)) ?? null,
					nhan: [...(k?.querySelectorAll("[data-kr-cham]") ?? [])].map(nhanKr),
					oHoc: k?.querySelector("[data-o-hoc]") !== null,
					mangSang: k?.querySelector("[data-nut='mang-sang']")
						? "nut"
						: k?.querySelector("[data-da-mang-sang]")
							? "da"
							: null,
				},
				ca.mongDoi,
				(truong) =>
					truong === "khung"
						? "muc tieu cham ngoai khung"
						: `cham-diem sai: ${ca.id} ${truong}`,
			);
		}
		console.log(`so ca cham-diem: ${MA_TRAN.length}`);
	});

	test("cham-diem: doi chung — bo chon card-header bat duoc CardHeader that", async () => {
		expect.assertions(1);
		await dung(
			<Card>
				<CardHeader>
					<CardTitle>doi chung</CardTitle>
				</CardHeader>
			</Card>,
		);
		expect(
			document.body.querySelectorAll("[data-slot='card-header']").length,
			"bo chon card-header khong bat duoc gi",
		).toBe(1);
		console.log("so ca cham-diem doi-chung: 1");
	});

	test("cham-diem: luu diem va luu hoc goi dung thu tuc, payload qua schema input that", async () => {
		bangCham = BANG_CHAM();
		expect.assertions(2);
		await dungCham();
		const luuDiem = document.body.querySelector(
			"[data-kr-cham='c1-k1'] [data-o-diem='lon'] [data-nut='luu-diem']",
		);
		if (!luuDiem) throw new Error("khong co nut luu diem c1-k1");
		await bamChuot(luuDiem);
		await doi(() => daGhi.some((g) => g.duong === "okr.chamKr"));
		const o = document.body.querySelector<HTMLTextAreaElement>(
			"[data-muc-tieu-cham='mt-c1'] [data-o-hoc] textarea",
		);
		if (!o) throw new Error("khong co o hoc mt-c1");
		await goChu(o, "Gọi lại khách cũ chốt nhanh hơn");
		const luuHoc = document.body.querySelector(
			"[data-muc-tieu-cham='mt-c1'] [data-nut='luu-hoc']",
		);
		if (!luuHoc) throw new Error("khong co nut luu hoc");
		await bamChuot(luuHoc);
		await doi(() => daGhi.some((g) => g.duong === "okr.ghiDieuHocDuoc"));
		const cham = daGhi.filter((g) => g.duong === "okr.chamKr");
		const hoc = daGhi.filter((g) => g.duong === "okr.ghiDieuHocDuoc");
		expect(
			cham.map((g) => chamKrInput.parse(g.dauVao)),
			"luu diem khong goi okr.chamKr dung payload",
		).toEqual([{ keyResultId: "c1-k1", diem: 0.7 }]);
		expect(
			hoc.map((g) => ghiDieuHocDuocInput.parse(g.dauVao)),
			"luu hoc khong goi okr.ghiDieuHocDuoc dung payload",
		).toEqual([
			{ objectiveId: "mt-c1", noiDung: "Gọi lại khách cũ chốt nhanh hơn" },
		]);
		console.log("so ca cham-diem luu: 2");
	});
});

const DUONG_DESIGN =
	process.env.MTKR_DESIGN_DOC ??
	join(
		import.meta.dir,
		"../../../docs/superpowers/specs/2026-10-02-muc-tieu-va-kr-design.md",
	);
const TIEN_TO = ["ST-mtkr-", "ST-cuatoi-", "ST-donvi-"];
const BO_CUC = "ST-mtkr-hep";

function idTrongBang(duong: string): string[] {
	const chu = readFileSync(duong, "utf8");
	const dau = chu.indexOf("<!-- <<<UX-STATE-TABLE -->");
	const cuoi = chu.indexOf("<!-- UX-STATE-TABLE>>> -->");
	if (dau < 0 || cuoi < dau)
		throw new Error(`khong thay bang UX-STATE-TABLE trong ${duong}`);
	return chu
		.slice(dau, cuoi)
		.split("\n")
		.map((dong) => /^\|\s*(ST-[a-z0-9-]+)\s*\|/.exec(dong)?.[1])
		.filter((id): id is string => id !== undefined)
		.filter((id) => TIEN_TO.some((t) => id.startsWith(t)));
}

const ID_BANG = idTrongBang(DUONG_DESIGN);

const trangThaiDau = () =>
	document.body
		.querySelector("[data-trang-thai]")
		?.getAttribute("data-trang-thai") ?? null;

async function thaoSan(san: San): Promise<void> {
	await act(async () => san.root.unmount());
	san.o.remove();
	dangMo = dangMo.filter((s) => s !== san);
	document.body.innerHTML = "";
}

async function haiMan(
	lam: (man: "cua-toi" | "theo-don-vi") => Promise<void>,
): Promise<void> {
	await lam("cua-toi");
	for (const san of [...dangMo]) await thaoSan(san);
	duongTrang = "/ws/okr/theo-don-vi";
	await lam("theo-don-vi");
}

const dungMan = (
	man: "cua-toi" | "theo-don-vi",
	ds: MucTieuOutput[],
	thamSo = "",
) => (man === "cua-toi" ? dungCuaToi(ds, thamSo) : dungTheoDonVi(ds, thamSo));

const CA_TRANG_THAI = {
	"ST-mtkr-co-du-lieu": () =>
		haiMan(async (man) => {
			await dungMan(man, HAI_MT());
			const k = khoi("mt-a");
			const bang = k?.querySelector("table") ?? null;
			soCa(
				{
					hangDau: bang ? khoaHang(hangTbody(bang)[0] ?? bang) : null,
					moSan: nutMo("mt-a")?.getAttribute("aria-expanded") ?? null,
					nhan: [...(k?.querySelectorAll("[data-kr]") ?? [])].map(nhanKr),
					theadAn:
						bang?.querySelector("thead")?.classList.contains("sr-only") ??
						false,
				},
				{ hangDau: "mt-a", moSan: "true", nhan: ["KR1", "KR2"], theadAn: true },
				(truong) => `ST-mtkr-co-du-lieu sai o ${man}: ${truong}`,
			);
		}),
	"ST-mtkr-da-thu": () =>
		haiMan(async (man) => {
			const san = await dungMan(man, HAI_MT(), "?thuMucTieu=mt-a");
			soCa(
				{
					hang: hangTbody(khoi("mt-a") ?? document.body).map(khoaHang),
					ariaExpanded: nutMo("mt-a")?.getAttribute("aria-expanded") ?? null,
					nhanNut: nutMo("mt-a")?.getAttribute("aria-label") ?? null,
					muiTenTheoNut:
						(nutMo("mt-a")?.classList.contains("group") ?? false) &&
						(nutMo("mt-a")
							?.querySelector("svg")
							?.classList.contains("group-aria-expanded:rotate-90") ??
							false),
					doiChungMo: nutMo("mt-b")?.getAttribute("aria-expanded") ?? null,
					url: san.url().get("thuMucTieu"),
				},
				{
					hang: ["mt-a"],
					ariaExpanded: "false",
					nhanNut: m.khoiMucTieu.moRa("Mục tiêu mt-a"),
					muiTenTheoNut: true,
					doiChungMo: "true",
					url: "mt-a",
				},
				(truong) => `ST-mtkr-da-thu sai o ${man}: ${truong}`,
			);
		}),
	"ST-mtkr-chua-co-kr": () =>
		haiMan(async (man) => {
			await dungMan(man, [mucTieu("mt-rong", [])]);
			soCa(
				{
					hang: hangTbody(khoi("mt-rong") ?? document.body).map(khoaHang),
					chu:
						khoi("mt-rong")?.querySelector("[data-chua-co-kr]")?.textContent ??
						null,
					oTienDo:
						hangMt("mt-rong")?.textContent?.includes(
							m.khoiMucTieu.chuaCoKrDeTinh,
						) ?? false,
				},
				{
					hang: ["mt-rong", "mt-rong"],
					chu: "Mục tiêu này chưa có KR.",
					oTienDo: true,
				},
				(truong) => `ST-mtkr-chua-co-kr sai o ${man}: ${truong}`,
			);
		}),
	"ST-mtkr-kr-moc": async () => {
		const moc = [
			kr("moc-1", "mt-m", {
				kind: "moc",
				targetValue: 1,
				currentValue: 0,
				unit: "",
				progress: 0,
			}),
			kr("moc-2", "mt-m", {
				kind: "moc",
				targetValue: 1,
				currentValue: 1,
				unit: "",
				progress: 100,
			}),
		];
		const doc = () =>
			["moc-1", "moc-2"].map((id) => {
				const o = hangKr(id)?.querySelector("td[data-nguon] [data-o-tien-do]");
				return {
					so: o?.childNodes[0]?.textContent ?? null,
					nhip:
						o
							?.querySelector("[data-tinh-trang]")
							?.getAttribute("data-tinh-trang") ?? null,
				};
			});
		const mongDoi = [
			{ so: "Chưa xong", nhip: "moc-chua" },
			{ so: "Xong", nhip: "moc-xong" },
		];
		const san = await dungCuaToi([mucTieu("mt-m", moc)]);
		soCa(
			{ cuaToi: doc() },
			{ cuaToi: mongDoi },
			() => "ST-mtkr-kr-moc sai o cua-toi",
		);
		await thaoSan(san);
		await dungSheet(chiTietTu(mucTieu("mt-m", moc)));
		soCa(
			{ sheet: doc() },
			{ sheet: mongDoi },
			() => "ST-mtkr-kr-moc sai o sheet",
		);
	},
	"ST-mtkr-kr-may": async () => {
		const san = await dungCuaToi([
			mucTieu("mt-may", [
				kr("kr-do-canh", "mt-may", {
					doCanh: true,
					soMay: { giaTri: 15, ngay: "2026-10-25", nguon: "crm" },
					nguonMay: nguonMay("crm"),
					currentValue: 12,
				}),
				kr("kr-chua-chup", "mt-may", {
					source: "crm",
					nguonMay: nguonMay("crm"),
				}),
			]),
		]);
		await cho(
			() => document.body.querySelectorAll("button[data-so-kr]").length === 2,
			"nut so kr",
		);
		const nut = hangKr("kr-do-canh")?.querySelector("button[data-so-kr]");
		const truoc = {
			dau: [...document.body.querySelectorAll("[data-dau-nguon]")].map((d) =>
				d.getAttribute("data-dau-nguon"),
			),
			doCanh: nut?.textContent ?? null,
			chuaChup:
				hangKr("kr-chua-chup")?.querySelector("[data-chua-chup]")
					?.textContent ?? null,
		};
		if (nut) await bamChuot(nut);
		await doi(() => san.url().get("record") !== null);
		soCa(
			{ ...truoc, record: san.url().get("record") },
			{
				dau: ["crm", "crm"],
				doCanh: ms.trangThai.bangKr.doCanh("12", "15"),
				chuaChup: ms.trangThai.bangKr.chuaChup,
				record: "so-kr:kr-do-canh",
			},
			(truong) => `ST-mtkr-kr-may sai: ${truong}`,
		);
	},
	"ST-mtkr-sheet": async () => {
		await dungSheet(mtSheet());
		const d = docSheet();
		soCa(
			{
				thuTu: d.thuTu,
				viSao: d.viSao,
				gop: d.gopVao.length,
				nhanKr: d.nhanKr,
				tienDoTu: d.tienDoTu,
				themKr: d.themKr,
			},
			{
				thuTu: true,
				viSao: WHY,
				gop: 1,
				nhanKr: ["KR1", "KR2", "KR3"],
				tienDoTu: "Tiến độ mục tiêu 49% tính từ 3 KR.",
				themKr: true,
			},
			(truong) => `ST-mtkr-sheet sai: ${truong}`,
		);
	},
	"ST-mtkr-sheet-khong-ly-do": async () => {
		await dungSheet(mtSheet({ whyNow: "" }));
		soCa(
			{
				viSao: document.body.querySelector("[data-khu='vi-sao']") !== null,
				chuViSao: document.body.textContent?.includes(m.sheet.khuViSao) ?? true,
				doiChungGopVao:
					document.body.querySelector("[data-khu='gop-vao']") !== null,
			},
			{ viSao: false, chuViSao: false, doiChungGopVao: true },
			(truong) => `ST-mtkr-sheet-khong-ly-do sai: ${truong}`,
		);
	},
	"ST-mtkr-cham": async () => {
		bangCham = BANG_CHAM();
		await dungCham();
		const k = document.body.querySelector("[data-muc-tieu-cham='mt-c1']");
		const bang = k?.querySelector("table") ?? null;
		soCa(
			{
				hangDau: bang
					? (hangTbody(bang)[0]?.getAttribute("data-hang-muc-tieu-cham") ??
						null)
					: null,
				nhan: [...(k?.querySelectorAll("[data-kr-cham]") ?? [])].map(nhanKr),
				hoc: k?.querySelector("[data-o-hoc] textarea") !== null,
				mangSang:
					k?.querySelector("[data-nut='mang-sang']")?.textContent ?? null,
			},
			{
				hangDau: "mt-c1",
				nhan: ["KR1", "KR2"],
				hoc: true,
				mangSang: `${mk.cham.mangSang} Quý 4/2026`,
			},
			(truong) => `ST-mtkr-cham sai: ${truong}`,
		);
	},
	"ST-cuatoi-codulieu": async () => {
		await dungCuaToi(HAI_MT());
		soCa(
			{
				dau: trangThaiDau(),
				boc: document.body.querySelectorAll(
					"[data-trang-thai='ST-cuatoi-codulieu'] [data-muc-tieu]",
				).length,
			},
			{ dau: "ST-cuatoi-codulieu", boc: 2 },
			(truong) => `ST-cuatoi-codulieu sai: ${truong}`,
		);
	},
	"ST-donvi-danhsach": async () => {
		await dungTheoDonVi(HAI_MT());
		soCa(
			{
				dau: trangThaiDau(),
				boc: document.body.querySelectorAll(
					"[data-trang-thai='ST-donvi-danhsach'] [data-muc-tieu]",
				).length,
				cardAction: document.body.querySelectorAll(
					"[data-don-vi] [data-slot=card-action]",
				).length,
			},
			{ dau: "ST-donvi-danhsach", boc: 2, cardAction: 0 },
			(truong) => `ST-donvi-danhsach sai: ${truong}`,
		);
	},
	"ST-cuatoi-rong": async () => {
		await dungCuaToi([]);
		const rong = document.body.querySelector(
			"[data-trang-thai='ST-cuatoi-rong']",
		);
		soCa(
			{
				dau: trangThaiDau(),
				tieuDe: rong?.textContent?.includes(m.cuaToiRong.title) ?? false,
				lienKet: rong?.querySelector("a")?.getAttribute("href") ?? null,
				khoi: document.body.querySelectorAll("[data-muc-tieu]").length,
			},
			{
				dau: "ST-cuatoi-rong",
				tieuDe: true,
				lienKet: "/ws/okr/theo-don-vi",
				khoi: 0,
			},
			(truong) => `ST-cuatoi-rong sai: ${truong}`,
		);
	},
	"ST-donvi-rong": async () => {
		await dungTheoDonVi([]);
		const rong = document.body.querySelector(
			"[data-trang-thai='ST-donvi-rong']",
		);
		soCa(
			{
				co: rong !== null,
				tieuDe:
					rong?.textContent?.includes(`OneHub ${m.rong.chuaDat} Quý 4/2026`) ??
					false,
				khoi: document.body.querySelectorAll("[data-muc-tieu]").length,
			},
			{ co: true, tieuDe: true, khoi: 0 },
			(truong) => `ST-donvi-rong sai: ${truong}`,
		);
	},
	"ST-donvi-dangtai": () =>
		haiMan(async (man) => {
			treo = new Set([man === "cua-toi" ? "okr.mine" : "okr.danhSach"]);
			mine = mineOutput.parse({
				dangTheoDoi: [],
				objectives: HAI_MT(),
				daBo: [],
			});
			danhSach = danhSachTu(HAI_MT());
			await dung(man === "cua-toi" ? <CuaToi /> : <TheoDonVi />);
			await cho(
				() =>
					document.body.querySelector(
						"[data-trang-thai='ST-donvi-dangtai']",
					) !== null,
				`dang tai ${man}`,
			);
			await nhip(5);
			const dang = document.body.querySelector(
				"[data-trang-thai='ST-donvi-dangtai']",
			);
			soCa(
				{
					co: dang !== null,
					busy: dang?.getAttribute("aria-busy") ?? null,
					chu: dang?.querySelector("[role='status']")?.textContent ?? null,
					khoi: document.body.querySelectorAll("[data-muc-tieu]").length,
				},
				{ co: true, busy: "true", chu: m.dangTai, khoi: 0 },
				(truong) => `ST-donvi-dangtai sai o ${man}: ${truong}`,
			);
		}),
	"ST-donvi-loi": () =>
		haiMan(async (man) => {
			const thuTucLoi = man === "cua-toi" ? "okr.mine" : "okr.danhSach";
			loi = new Set([thuTucLoi]);
			soLanDoc = new Map();
			mine = mineOutput.parse({
				dangTheoDoi: [],
				objectives: HAI_MT(),
				daBo: [],
			});
			danhSach = danhSachTu(HAI_MT());
			await dung(man === "cua-toi" ? <CuaToi /> : <TheoDonVi />);
			await cho(
				() =>
					document.body.querySelector("[data-trang-thai='ST-donvi-loi']") !==
					null,
				`loi ${man}`,
			);
			const truoc = soLanDoc.get(thuTucLoi) ?? 0;
			const nut = [
				...document.body.querySelectorAll(
					"[data-trang-thai='ST-donvi-loi'] button",
				),
			].find((b) => b.textContent?.trim() === m.loi.action);
			if (!nut) throw new Error(`khong co nut Thu lai o ${man}`);
			await bamChuot(nut);
			await doi(() => (soLanDoc.get(thuTucLoi) ?? 0) > truoc);
			await nhip(5);
			soCa(
				{
					dau: trangThaiDau(),
					tieuDe: document.body.textContent?.includes(m.loi.title) ?? false,
					goiLai: (soLanDoc.get(thuTucLoi) ?? 0) - truoc,
				},
				{ dau: "ST-donvi-loi", tieuDe: true, goiLai: 1 },
				(truong) => `ST-donvi-loi sai o ${man}: ${truong}`,
			);
		}),
	"ST-donvi-chuakychay": () =>
		haiMan(async (man) => {
			cycles = KY_KHONG;
			await dung(man === "cua-toi" ? <CuaToi /> : <TheoDonVi />);
			await cho(daTaiXong, `chua ky chay ${man}`);
			soCa(
				{
					dau: trangThaiDau(),
					tieuDe:
						document.body.textContent?.includes(m.chuaChuKy.title) ?? false,
					khoi: document.body.querySelectorAll("[data-muc-tieu]").length,
				},
				{ dau: "ST-donvi-chuakychay", tieuDe: true, khoi: 0 },
				(truong) => `ST-donvi-chuakychay sai o ${man}: ${truong}`,
			);
		}),
} satisfies Record<string, () => Promise<void>>;

const caCua = (id: string) =>
	Object.entries(CA_TRANG_THAI).find(([khoa]) => khoa === id)?.[1];

const tenCa = (id: string) => id.replace(/-/g, "_");

describe("trang-thai", () => {
	test("trang-thai: bang UX-STATE-TABLE doc duoc, khong ca la", () => {
		const la = Object.keys(CA_TRANG_THAI).filter((id) => !ID_BANG.includes(id));
		console.log(`trang-thai: ${ID_BANG.length} id tu ${DUONG_DESIGN}`);
		expect(ID_BANG.length > 0, "bang trang thai rong").toBe(true);
		expect(la[0] ?? null, `ca la: ${la[0]}`).toBeNull();
	});

	for (const id of ID_BANG) {
		if (id === BO_CUC) {
			test(`trang-thai: ${tenCa(id)} (bo cuc)`, () => {
				console.log(`giao E13: ${id}`);
			});
			continue;
		}
		test(`trang-thai: ${tenCa(id)}`, async () => {
			const ca = caCua(id);
			expect(ca === undefined ? null : id, `thieu ca: ${id}`).toBe(id);
			if (ca) await ca();
			console.log(`trang-thai da so: ${id}`);
		});
	}
});
