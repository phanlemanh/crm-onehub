import {
	afterEach,
	beforeAll,
	describe,
	expect,
	mock,
	setSystemTime,
	test,
} from "bun:test";
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
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	cyclesOutput,
	krOutput,
	mucTieuOutput,
	okrAccessOutput,
} from "../../api/src/okr/okr.contracts";
import {
	danhSachOutput,
	hopTuanOutput,
} from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

type OrgTree = ReturnType<typeof orgTreeOutput.parse>;
type MucTieu = ReturnType<typeof mucTieuOutput.parse>;
type DanhSach = ReturnType<typeof danhSachOutput.parse>;

const LAN = { id: "U1", name: "Nguyễn Thị Lan", email: "u1@onehub.vn" };

const phongBan = (id: string, name: string, divisionId: string | null) => ({
	id,
	name,
	moTa: "",
	position: 0,
	divisionId,
	head: LAN,
	stepCount: 0,
	okrMo: 0,
	people: [{ ...LAN, primary: true }],
});

const khoi = (id: string, name: string, departments: unknown[]) => ({
	id,
	name,
	moTa: "",
	position: 0,
	head: LAN,
	okrMo: 0,
	departments,
});

function cayVoi(divisions: unknown[], chuaXep: unknown[]): OrgTree {
	return orgTreeOutput.parse({
		divisions,
		chuaXep,
		chuaCoPhongBan: [],
		people: [
			{
				...LAN,
				primaryDepartmentId: "P1",
				secondaryDepartmentIds: [],
				managerOverrideId: null,
				manager: null,
				managerSource: "khong-co",
				chucDanh: "",
			},
		],
		archived: { divisions: [], departments: [] },
		coverage: { members: 1, withPrimary: 1, departmentsWithoutHead: 0 },
	});
}

const CAY = cayVoi(
	[
		khoi("B", "Khối Kinh doanh", [
			phongBan("P1", "Phòng Bán lẻ", "B"),
			phongBan("P2", "Phòng Dự án", "B"),
		]),
		khoi("C", "Khối Vận hành", []),
		khoi("D", "Khối Hỗ trợ", [phongBan("Q", "Phòng Nhân sự", "D")]),
	],
	[phongBan("X", "Phòng Pháp chế", null)],
);

const CAY_LAN_CAN = cayVoi(
	[
		khoi("B", "B", [phongBan("P1", "P1", "B"), phongBan("P2", "P2", "B")]),
		khoi("C", "C", []),
	],
	[phongBan("X", "X", null)],
);

const chuKy = (phase: string) =>
	cyclesOutput.parse({
		cycles: [
			{
				id: "q4",
				kind: "quy",
				name: "Quý 4 2026",
				parentId: null,
				startsOn: "2026-10-01",
				endsOn: "2026-12-31",
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
			},
		],
		currentId: "q4",
	});

const QUYEN = okrAccessOutput.parse({
	canManageProgram: false,
	headOf: { divisions: [], departments: [] },
});

function mucTieu(id: string, status: "cong-bo" | "da-bo" = "cong-bo"): MucTieu {
	return mucTieuOutput.parse({
		id,
		cycleId: "q4",
		level: "bo-phan",
		unitId: "B",
		unitName: "Khối Kinh doanh",
		title: `Mục tiêu ${id}`,
		kind: "cam-ket",
		status,
		owner: LAN,
		participants: [],
		whyNow: "",
		publishedAt: "2026-10-02T00:00:00.000Z",
		droppedAt: status === "da-bo" ? "2026-10-20T00:00:00.000Z" : null,
		progress: 40,
		expected: 50,
		keyResults: [
			krOutput.parse({
				id: `${id}-kr`,
				objectiveId: id,
				title: `KR ${id}`,
				kind: "tang-toi",
				owner: LAN,
				startValue: 0,
				targetValue: 50,
				currentValue: 20,
				unit: "",
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
			}),
		],
		alignments: [],
		canEdit: false,
		following: false,
		followerCount: 0,
		theoDoi: false,
		hienThi: "cong-khai",
		soNguoiXem: 0,
		soGopYCho: 0,
	});
}

function danhSach(rows: MucTieu[], daBo: MucTieu[]): DanhSach {
	return danhSachOutput.parse({
		rows: rows.map((mt) => ({ ...mt, krKhop: [] })),
		daBo: daBo.map((mt) => ({ ...mt, krKhop: [] })),
		total: rows.length,
		facetCounts: { phuTrach: [], loai: [], trangThai: [], tuTin: [], gopY: [] },
		canEdit: false,
		canCreate: false,
	});
}

const HOP_RONG = hopTuanOutput.parse({
	tuan: "2026-11-09",
	tuanDau: false,
	daCapNhat: 0,
	tongKr: 0,
	dangBan: [],
	conLai: [],
});

type Gia = {
	phase: string;
	theoDon: Map<string, { rows: MucTieu[]; daBo: MucTieu[] }>;
	dem: Record<string, number> | undefined;
	hopTuan: () => unknown;
};

const TREO_MAI = () => new Promise<never>(() => {});

const giaMacDinh = (): Gia => ({
	phase: "cham-diem",
	theoDon: new Map(),
	dem: { "pb:P1": 2, "pb:P2": 0, goc: 1, "bp:C": 1 },
	hopTuan: TREO_MAI,
});

let gia = giaMacDinh();
const daGoi = new Map<string, number>();

type DauVao = {
	readonly cycleId?: string;
	readonly unit?: { loai: string; id?: string };
	readonly loc?: { trangThai?: readonly string[] };
};

const khoaVao = (vao: DauVao | undefined) => {
	const u = vao?.unit;
	return !u || u.loai === "goc" ? "goc" : `${u.loai}:${u.id}`;
};

function thuTuc<TRa>(ten: string, doc: (vao?: DauVao) => TRa | Promise<TRa>) {
	return {
		queryKey: () => [ten],
		pathKey: () => [ten],
		queryOptions: (vao?: DauVao | typeof skipToken) =>
			vao === skipToken
				? { queryKey: [ten, "skip"], queryFn: skipToken }
				: {
						queryKey: [ten, vao ?? null],
						queryFn: async () => {
							daGoi.set(ten, (daGoi.get(ten) ?? 0) + 1);
							return doc(vao);
						},
					},
		mutationOptions: () => ({ mutationFn: async () => null }),
		mutationKey: () => [ten],
	};
}

const docDanhSach = (vao?: DauVao) => {
	const d = gia.theoDon.get(khoaVao(vao)) ?? { rows: [], daBo: [] };
	const locTrangThai = (vao?.loc?.trangThai?.length ?? 0) > 0;
	return danhSach(d.rows, locTrangThai ? [] : d.daBo);
};

const OKR_GIA = {
	cycles: thuTuc("cycles", () => chuKy(gia.phase)),
	access: thuTuc("access", () => QUYEN),
	countByUnit: thuTuc("countByUnit", () => gia.dem ?? TREO_MAI()),
	danhSach: thuTuc("danhSach", docDanhSach),
	hopTuan: thuTuc("hopTuan", () => gia.hopTuan()),
	toanCanh: thuTuc("toanCanh", TREO_MAI),
};
const okrGia = new Proxy(OKR_GIA, {
	get: (dich, ten: string) =>
		ten in dich ? dich[ten as keyof typeof OKR_GIA] : thuTuc(ten, TREO_MAI),
});

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		org: { tree: thuTuc("tree", () => CAY) },
		workspace: { get: thuTuc("workspace", () => ({ name: "OneHub" })) },
		okr: okrGia,
	}),
}));
mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/okr/bo-okr",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		prefetch: _prefetch,
		transitionTypes: _transitionTypes,
		...props
	}: ComponentProps<"a"> & {
		children?: ReactNode;
		prefetch?: boolean;
		transitionTypes?: string[];
	}) => h("a", props, children),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
const { lanCan } = await import("@/app/(app)/[slug]/okr/theo-don-vi/lan-can");
const { okrVoKhuMessages } = await import("@/lib/messages/okr-vo-khu");
const { okrHopTuanBoMessages } = await import("@/lib/messages/okr-hop-tuan-bo");

const voKhu = okrVoKhuMessages("vi").boOkr;
const hopBo = okrHopTuanBoMessages("vi");

type San = { o: HTMLElement; root: Root; url: () => URLSearchParams };
let dangMo: San[] = [];

beforeAll(() => {
	window.HTMLElement.prototype.scrollIntoView = () => {};
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
	gia = giaMacDinh();
	daGoi.clear();
	setSystemTime();
});

async function nhip(lan = 6) {
	for (let i = 0; i < lan; i += 1)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
}

async function cho(xong: () => boolean, moTa: string) {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await nhip(1);
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 300)}`,
	);
}

async function ve(tham: string): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
		},
	});
	let urlCuoi = new URLSearchParams(tham);
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					urlCuoi = new URLSearchParams(e.searchParams);
				}}
				searchParams={`?${tham}`}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							<TheoDonVi />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root, url: () => urlCuoi };
	dangMo.push(san);
	await cho(
		() =>
			o.querySelector('[data-vi-tri-bo="mot-bo"] [aria-current="page"]') !==
			null,
		"trang mot bo",
	);
	return san;
}

const nguoiDung = () =>
	userEvent.setup({ document, pointerEventsCheck: 0, delay: null });

async function bam(o: Element | null, moTa: string) {
	if (!o) throw new Error(`khong thay: ${moTa}`);
	await act(async () => {
		await nguoiDung().click(o);
	});
	await nhip();
}

const truoc = (a: Element | null, b: Element | null) =>
	a !== null &&
	b !== null &&
	(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

function sauDeuRong(goc: Element, moc: Element): boolean {
	const di = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT);
	for (let n = di.nextNode(); n; n = di.nextNode()) {
		if (moc.contains(n)) continue;
		if (!truoc(moc, n.parentElement)) continue;
		if ((n.textContent ?? "").trim() !== "") return false;
	}
	return true;
}

function kiemOGon(o: HTMLElement, ten: string, laDanhSach: boolean): string[] {
	const loi: string[] = [];
	if (o.querySelector("[data-don-vi-con]"))
		loi.push(`bcd-gon: ${ten} con luoi truc thuoc`);
	if (o.querySelector("[data-nhom-da-bo]"))
		loi.push(`bcd-gon: ${ten} con muc gap da bo`);
	if (o.querySelector("[data-chon-don-vi]"))
		loi.push(`bcd-gon: ${ten} con o chon don vi`);
	const gap = [...o.querySelectorAll('[data-slot="collapsible"]')].filter((c) =>
		/\(\d+\)/.test(c.textContent ?? ""),
	);
	if (gap.length > 0) loi.push(`bcd-gon: ${ten} con nhom gap co so dem`);
	const viTri = o.querySelectorAll('[data-vi-tri-bo="mot-bo"]');
	const theCon = o.querySelectorAll("[data-the-con-bo]");
	const hang = o.querySelectorAll("[data-hang-cong-cu]");
	if (viTri.length !== 1) loi.push(`bcd-gon: ${ten} vi tri ${viTri.length}`);
	if (theCon.length !== 1) loi.push(`bcd-gon: ${ten} the con ${theCon.length}`);
	if (hang.length > 1 || (laDanhSach && hang.length !== 1))
		loi.push(`bcd-gon: ${ten} hang cong cu ${hang.length}`);
	if (!truoc(viTri[0] ?? null, theCon[0] ?? null))
		loi.push(`bcd-gon: ${ten} the con truoc vi tri`);
	if (laDanhSach)
		loi.push(...kiemThuTuBang(o, ten, theCon[0] ?? null, hang[0] ?? null));
	return loi;
}

function kiemThuTuBang(
	o: HTMLElement,
	ten: string,
	theCon: Element | null,
	hang: Element | null,
): string[] {
	const loi: string[] = [];
	const bang = o.querySelector("table");
	const chan = o.querySelector("[data-dong-don-vi]");
	if (!truoc(theCon, hang))
		loi.push(`bcd-gon: ${ten} hang cong cu truoc the con`);
	if (!truoc(hang, bang)) loi.push(`bcd-gon: ${ten} bang truoc hang cong cu`);
	if (!truoc(bang, chan)) loi.push(`bcd-gon: ${ten} chan truoc bang`);
	if (chan && !sauDeuRong(o, chan))
		loi.push(`bcd-gon: ${ten} con khoi sau chan bang`);
	return loi;
}

const hangMucTieu = (o: Element) =>
	[...o.querySelectorAll("[data-hang-muc-tieu]")].map((e) =>
		e.getAttribute("data-hang-muc-tieu"),
	);

function gieoKhoiKinhDoanh() {
	gia.theoDon.set("bp:B", {
		rows: [mucTieu("B1"), mucTieu("B3"), mucTieu("B4")],
		daBo: [mucTieu("B2", "da-bo"), mucTieu("B5", "da-bo")],
	});
	gia.theoDon.set("pb:P1", { rows: [mucTieu("P1a")], daBo: [] });
	gia.theoDon.set("goc", { rows: [mucTieu("G1")], daBo: [] });
}

describe("bo-okr-chi-don-vi — trang một bộ", () => {
	test("bcd-gon: 3 đơn vị × 4 thẻ con không còn ô chọn, lưới trực thuộc, mục gập Đã bỏ", async () => {
		gieoKhoiKinhDoanh();
		const DON = [
			["goc", ""],
			["bp:B", "donOkr=bp:B"],
			["pb:P1", "donOkr=pb:P1"],
		] as const;
		const THE = ["danh-sach", "hop-tuan", "viec", "cham"] as const;
		const loi: string[] = [];
		let soO = 0;
		for (const [nhan, don] of DON)
			for (const the of THE) {
				const tham = [
					"kyOkr=q4",
					don,
					the === "danh-sach" ? "" : `xemOkr=${the}`,
				]
					.filter(Boolean)
					.join("&");
				const san = await ve(tham);
				if (the === "danh-sach")
					await cho(
						() => san.o.querySelector("table") !== null,
						`bang ${nhan}`,
					);
				loi.push(...kiemOGon(san.o, `${nhan} ${the}`, the === "danh-sach"));
				soO += 1;
				await act(async () => san.root.unmount());
				san.o.remove();
				dangMo = dangMo.filter((x) => x !== san);
			}
		expect(soO).toBe(12);
		expect(loi).toEqual([]);
	}, 60_000);

	test("bcd-menu: lanCan trên cây sáu đơn vị", () => {
		const ten = (ds: { ten: string }[]) => ds.map((d) => d.ten);
		const ra = (don: Parameters<typeof lanCan>[1]) => {
			const lc = lanCan(CAY_LAN_CAN, don, "OneHub");
			return lc === null
				? null
				: {
						cha: lc.cha?.ten ?? null,
						cungCap: ten(lc.cungCap),
						trucThuoc: ten(lc.trucThuoc),
					};
		};
		const maTran = {
			goc: ra({ loai: "goc" }),
			"bp:B": ra({ loai: "bp", id: "B" }),
			"bp:C": ra({ loai: "bp", id: "C" }),
			"pb:P1": ra({ loai: "pb", id: "P1" }),
			"pb:X": ra({ loai: "pb", id: "X" }),
			nguoi: ra({ loai: "nguoi", id: "U1" }),
		};
		const loi: string[] = [];
		if (maTran["bp:B"]?.cungCap.includes("P1"))
			loi.push("bcd-menu: bp:B cung cap lot P1");
		expect(loi).toEqual([]);
		expect(maTran).toEqual({
			goc: { cha: null, cungCap: [], trucThuoc: ["B", "C", "X"] },
			"bp:B": { cha: "OneHub", cungCap: ["C"], trucThuoc: ["P1", "P2"] },
			"bp:C": { cha: "OneHub", cungCap: ["B"], trucThuoc: [] },
			"pb:P1": { cha: "B", cungCap: ["P2"], trucThuoc: [] },
			"pb:X": { cha: "OneHub", cungCap: [], trucThuoc: [] },
			nguoi: null,
		});
	});

	test("bcd-menu: menu dòng vị trí ba nhóm, liên kết giữ chu kỳ và thẻ con, Esc trả tiêu điểm", async () => {
		gieoKhoiKinhDoanh();
		const san = await ve("kyOkr=q4&donOkr=bp:B&xemOkr=hop-tuan&daBoOkr=1");
		const nut = san.o.querySelector<HTMLElement>("[data-menu-vi-tri]");
		expect(nut?.getAttribute("aria-label")).toBe(
			voKhu.menu.doiBo("Khối Kinh doanh"),
		);
		await bam(nut, "mat xich cuoi");
		await cho(
			() => document.querySelector("[data-menu-don]") !== null,
			"menu mo",
		);
		const nhom = [...document.querySelectorAll("[data-nhom-menu]")].map((g) =>
			g.getAttribute("data-nhom-menu"),
		);
		expect(nhom).toEqual([
			voKhu.menu.thuoc,
			voKhu.menu.cungCap,
			voKhu.menu.trucThuoc,
		]);
		const p1 = document.querySelector<HTMLAnchorElement>(
			'[data-menu-don="pb:P1"]',
		);
		expect(p1?.textContent).toContain(voKhu.menu.demMucTieu(2));
		const href = new URL(p1?.getAttribute("href") ?? "", "http://x");
		const loi: string[] = [];
		if (href.searchParams.get("xemOkr") !== "hop-tuan")
			loi.push("bcd-menu: lien ket mat the con");
		expect(loi).toEqual([]);
		expect({
			don: href.searchParams.get("donOkr"),
			ky: href.searchParams.get("kyOkr"),
			daBo: href.searchParams.get("daBoOkr"),
		}).toEqual({ don: "pb:P1", ky: "q4", daBo: null });
		await act(async () => {
			await nguoiDung().keyboard("{Escape}");
		});
		await nhip();
		expect(document.querySelector("[data-menu-don]")).toBeNull();
		expect(document.activeElement).toBe(nut);
	});

	test("bcd-menu: số mục tiêu chưa về thì mục menu không kèm số; trang người không có menu", async () => {
		gia.dem = undefined;
		const san = await ve("kyOkr=q4&donOkr=bp:B");
		await bam(san.o.querySelector("[data-menu-vi-tri]"), "mat xich cuoi");
		await cho(
			() => document.querySelector("[data-menu-don]") !== null,
			"menu mo",
		);
		const muc = document.querySelector('[data-menu-don="pb:P1"]');
		expect(muc?.textContent).toBe("Phòng Bán lẻ");
		await act(async () => san.root.unmount());
		document.body.innerHTML = "";
		dangMo = [];
		const nguoi = await ve("kyOkr=q4&donOkr=nguoi:U1");
		expect(nguoi.o.querySelector("[data-menu-vi-tri]")).toBeNull();
	});

	test("bcd-da-bo: nút Đã bỏ (n) trên hàng công cụ, ghi daBoOkr lên đường dẫn", async () => {
		gieoKhoiKinhDoanh();
		const loi: string[] = [];
		const san = await ve("kyOkr=q4&donOkr=bp:B");
		await cho(() => hangMucTieu(san.o).length === 3, "ba hang");
		const nut = () => san.o.querySelector<HTMLElement>("[data-nut-da-bo]");
		expect(nut()?.textContent).toBe(voKhu.daBo(2));
		expect(nut()?.getAttribute("aria-pressed")).toBe("false");
		expect(nut()?.closest("[data-hang-cong-cu]")).not.toBeNull();
		await bam(nut(), "nut da bo");
		await cho(() => hangMucTieu(san.o).length === 2, "hai hang da bo");
		expect(san.url().get("daBoOkr")).toBe("1");
		expect(nut()?.getAttribute("aria-pressed")).toBe("true");
		expect(hangMucTieu(san.o).sort()).toEqual(["B2", "B5"]);
		const lai = await ve("kyOkr=q4&donOkr=bp:B&daBoOkr=1");
		await cho(() => hangMucTieu(lai.o).length > 0, "dung lai");
		if (hangMucTieu(lai.o).length !== 2)
			loi.push("bcd-da-bo: tai lai mat trang thai");
		await bam(nut(), "nut da bo lan hai");
		await cho(() => hangMucTieu(san.o).length === 3, "ve ba hang");
		expect(san.url().get("daBoOkr")).toBeNull();
		gia.theoDon.set("pb:P1", { rows: [mucTieu("P1a")], daBo: [] });
		const khong = await ve("kyOkr=q4&donOkr=pb:P1");
		await cho(() => hangMucTieu(khong.o).length === 1, "mot hang");
		if (khong.o.querySelector("[data-nut-da-bo]"))
			loi.push("bcd-da-bo: nut hien khi 0");
		if (khong.o.querySelector("[data-slot=data-table-toggles]"))
			loi.push("bcd-da-bo: khung bo nut rong van dung khi 0");
		const loc = await ve("kyOkr=q4&donOkr=bp:B&trangThaiOkr=cong-bo");
		await cho(() => hangMucTieu(loc.o).length === 3, "loc trang thai");
		if (loc.o.querySelector("[data-nut-da-bo]"))
			loi.push("bcd-da-bo: nut hien khi dang loc trang thai");
		expect(loi).toEqual([]);
	});

	test("bcd-rong: bộ phận không có mục tiêu riêng có câu riêng, phòng và OneHub giữ câu cũ", async () => {
		const loi: string[] = [];
		const maTran = [
			["bp:D", "donOkr=bp:D", true],
			["pb:P2", "donOkr=pb:P2", false],
			["goc", "", false],
		] as const;
		for (const [nhan, don, rieng] of maTran) {
			const san = await ve(["kyOkr=q4", don].filter(Boolean).join("&"));
			await cho(
				() =>
					san.o.querySelector(
						'[data-trang-thai="ST-donvi-rong"], [data-rong-bo-phan]',
					) !== null,
				`rong ${nhan}`,
			);
			const cau = san.o.querySelector("[data-rong-bo-phan]");
			if (rieng && !cau) loi.push(`bcd-rong: ${nhan} thieu cau rieng`);
			if (!rieng && cau) loi.push(`bcd-rong: ${nhan} lai co cau bo phan`);
			if (hangMucTieu(san.o).length > 0) loi.push(`bcd-rong: ${nhan} co hang`);
			if (rieng && cau) {
				const chu = cau.textContent ?? "";
				if (
					!chu.includes("Khối Hỗ trợ chưa có mục tiêu riêng trong Quý 4 2026")
				)
					loi.push(`bcd-rong: ${nhan} sai cau: ${chu}`);
				const tenKhong = [...cau.querySelectorAll('[translate="no"]')].map(
					(e) => e.textContent,
				);
				if (!tenKhong.includes("Khối Hỗ trợ"))
					loi.push(`bcd-rong: ${nhan} ten khoi khong danh dau khong dich`);
				if (!chu.includes(voKhu.rongBoPhan.chiSangMenu("Khối Hỗ trợ")))
					loi.push(`bcd-rong: ${nhan} thieu cau chi sang menu`);
			}
		}
		expect(loi).toEqual([]);
	});

	test("bcd-hop-tuan-goc: Họp tuần OneHub rỗng chỉ sang menu, không đọc Toàn cảnh", async () => {
		gia.phase = "dang-chay";
		gia.hopTuan = () => HOP_RONG;
		setSystemTime(new Date("2026-11-12T03:00:00Z"));
		const san = await ve("kyOkr=q4&xemOkr=hop-tuan");
		await cho(
			() =>
				san.o.querySelector('[data-trang-thai="ST-hoptuan-chua-kr"]') !== null,
			"hop tuan rong",
		);
		const loi: string[] = [];
		const chu = san.o.textContent ?? "";
		if (san.o.querySelector("[data-don-vi-co-kr]"))
			loi.push("bcd-hop-tuan-goc: con danh sach don vi co KR");
		expect(loi).toEqual([]);
		expect(chu).toContain("OneHub chưa có KR công bố trong Quý 4 2026.");
		expect(chu).toContain(hopBo.rong.chiSangMenu("OneHub"));
		expect(
			san.o.querySelector('[data-nut="xem-moi-bo"]')?.getAttribute("href"),
		).toBe("/ws/okr/bo-okr?kyOkr=q4");
		expect(daGoi.get("toanCanh") ?? 0).toBe(0);
	});
});
