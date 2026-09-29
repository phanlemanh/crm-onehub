import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	ChuKyOutput,
	KrOutput,
	MucMoCoi,
	MucTieuOutput,
} from "../../api/src/okr/okr.contracts";
import type { TreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

const nguoi = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@onehub.vn`,
});
const HA = nguoi("ha", "Trần Hà");
const LINH = nguoi("linh", "Hồ Mỹ Linh");
const TUAN = nguoi("tuan", "Đinh Văn Tuấn");
const LAN = nguoi("lan", "Nguyễn Thị Lan");

const ky = (id: string, name: string, phase: ChuKyOutput["phase"]) => ({
	id,
	kind: "quy" as const,
	name,
	parentId: null,
	startsOn: "2026-10-01",
	endsOn: "2026-12-31",
	phase,
	breakStartsOn: null,
	breakEndsOn: null,
	updateWeekday: 1,
	cuaSoRa: null,
});
const Q4 = ky("q4", "Quý 4 · 2026", "dang-chay");
const Q3 = ky("q3", "Quý 3 · 2026", "da-dong");

function kr(id: string, objectiveId: string): KrOutput {
	return {
		id,
		objectiveId,
		title: `KR ${id}`,
		kind: "tang-toi",
		owner: HA,
		startValue: 0,
		targetValue: 10,
		currentValue: 0,
		unit: "",
		dueOn: null,
		weight: 1,
		source: "tay",
		doCanh: false,
		soMay: null,
		nguonMay: null,
		startLocked: false,
		progress: 0,
		laCuaToi: false,
		hienTaiQuaCapNhat: false,
	};
}

function mucTieu(
	id: string,
	title: string,
	status: MucTieuOutput["status"],
	owner: { id: string; name: string; email: string },
	soKr: number,
	unitId = "pb-1",
): MucTieuOutput {
	return {
		id,
		cycleId: Q4.id,
		level: "phong-ban",
		unitId,
		unitName: "Kinh doanh vùng 1",
		title,
		kind: "cam-ket",
		status,
		owner,
		participants: [],
		whyNow: "",
		publishedAt: null,
		droppedAt: status === "da-bo" ? "2026-10-05T00:00:00Z" : null,
		progress: 0,
		expected: null,
		keyResults: Array.from({ length: soKr }, (_, i) => kr(`${id}-k${i}`, id)),
		alignments: [],
		canEdit: true,
		following: false,
		followerCount: 0,
		theoDoi: false,
	};
}

const MUC_TIEU_PB1 = [
	mucTieu("o1", "Mở rộng kho Bình Dương", "cho-duyet", HA, 3),
	mucTieu("o2", "Tăng 25% sản lượng hàng lạnh", "cong-bo", HA, 4),
	mucTieu("o3", "Tối ưu tuyến giao Thủ Đức", "cong-bo", LINH, 2),
	mucTieu("o4", "Chuẩn hoá báo giá", "nhap", TUAN, 3),
	mucTieu("o5", "Mục tiêu đã bỏ", "da-bo", TUAN, 1),
];

function cayMau(): TreeOutput {
	const pb = (
		id: string,
		name: string,
		divisionId: string | null,
		okrMo: number,
	) => ({
		id,
		name,
		position: 0,
		divisionId,
		head: HA,
		stepCount: 0,
		okrMo,
		people: [{ ...HA, primary: true }],
	});
	return {
		divisions: [
			{
				id: "bp-kd",
				name: "Khối Kinh doanh",
				position: 0,
				head: LAN,
				okrMo: 0,
				departments: [
					pb("pb-1", "Kinh doanh vùng 1", "bp-kd", 4),
					pb("pb-2", "Kinh doanh vùng 2", "bp-kd", 0),
				],
			},
		],
		chuaXep: [pb("pb-pc", "Pháp chế", null, 0)],
		chuaCoPhongBan: [],
		people: [
			{
				...HA,
				primaryDepartmentId: "pb-1",
				secondaryDepartmentIds: [],
				managerOverrideId: null,
				manager: null,
				managerSource: "khong-co",
			},
		],
		archived: {
			divisions: [],
			departments: [
				{ id: "pb-cu", name: "Kho vận Củ Chi", okrMo: 1, purgeable: false },
			],
		},
		coverage: { members: 1, withPrimary: 1, departmentsWithoutHead: 0 },
	};
}

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = Json | undefined;

let cay: TreeOutput = cayMau();
let quanTri = true;
let moCoi: () => Promise<MucMoCoi[]> = async () => [];
let daGoi: { duong: string; dauVao: DauVao }[] = [];
let loiGhi = new Map<string, string>();
let daLamMoi = 0;

const docTheoDuong: Record<string, (vao: DauVao) => unknown> = {
	"org.tree": () => cay,
	"org.access": () => ({ canManage: quanTri }),
	"okr.cycles": () => ({ cycles: [Q4, Q3], currentId: Q4.id }),
	"okr.program": () => ({
		objectiveCap: 5,
		krCap: 5,
		capMode: "canh-bao",
		scoreScale: "0-1",
		weightsOn: false,
		personalOn: false,
		duyetCongBo: false,
		version: 3,
		canManage: quanTri,
	}),
	"okr.byUnit": (vao) => {
		const v = vao as { cycleId: string; unit: { id: string } };
		if (v.cycleId !== Q4.id) return { objectives: [], canEdit: true };
		if (v.unit.id === "pb-cu")
			return {
				objectives: [
					mucTieu(
						"o9",
						"Chuẩn hoá nhận hàng ca đêm",
						"cong-bo",
						HA,
						2,
						"pb-cu",
					),
				],
				canEdit: true,
				canhBao: null,
			};
		return {
			objectives: v.unit.id === "pb-1" ? MUC_TIEU_PB1 : [],
			canEdit: true,
			canhBao: null,
		};
	},
	"okr.moCoi": () => moCoi(),
	"onboarding.listTemplates": () => [],
	"onboarding.listDepartments": () => [],
	"onboarding.manDanhMuc": () => null,
};

const ketQuaGhi: Record<string, (vao: DauVao) => unknown> = {
	"okr.chuyenDonVi": (vao) => ({
		daChuyen: (vao as { objectiveIds: string[] }).objectiveIds.length,
		canhBao: null,
	}),
};

function thuTuc(duong: string) {
	return {
		queryKey: () => [duong],
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao) => ({
			queryKey: [duong, vao],
			queryFn: async () => {
				daGoi.push({ duong, dauVao: vao });
				const doc = docTheoDuong[duong];
				if (!doc) throw new Error(`khong doc ${duong}`);
				return doc(vao);
			},
		}),
		mutationOptions: (chon: object = {}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => {
				daGoi.push({ duong, dauVao: JSON.parse(JSON.stringify(vao)) });
				const loi = loiGhi.get(duong);
				if (loi !== undefined) throw new Error(loi);
				return ketQuaGhi[duong]?.(vao) ?? { id: "ok" };
			},
		}),
	};
}

const boDinhTuyen = (ten: string) =>
	new Proxy({}, { get: (_, thu) => thuTuc(`${ten}.${String(thu)}`) }) as Record<
		string,
		ReturnType<typeof thuTuc>
	>;

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		org: boDinhTuyen("org"),
		okr: boDinhTuyen("okr"),
		onboarding: boDinhTuyen("onboarding"),
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		okr: async () => {
			daLamMoi += 1;
		},
	}),
}));

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr/toan-canh/suc-khoe",
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) => createElement("a", { href, ...rest }, children),
}));

const { ToChuc } = await import(
	"@/app/(app)/[slug]/settings/organization/to-chuc"
);
const { KhoiMoCoi } = await import(
	"@/app/(app)/[slug]/okr/toan-canh/suc-khoe/okr-mo-coi"
);
const { FormCauHinh } = await import(
	"@/app/(app)/[slug]/settings/okr/form-cau-hinh"
);
const { LY_DO_KHONG_QUYEN } = await import(
	"@/app/(app)/[slug]/settings/okr/trang-thai-cai-dat"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { Toaster } = await import("@crm/ui/components/sonner");
const { toast } = await import("sonner");
const { okrTaiCoCauMessages } = await import("@/lib/messages/okr-tai-co-cau");
const { toChucMessages } = await import("@/lib/messages/to-chuc");

const t = okrTaiCoCauMessages("vi");
const tc = toChucMessages("vi");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];
let url = new URLSearchParams();

async function mo(noiDung: ReactNode, dau = ""): Promise<void> {
	url = new URLSearchParams(dau);
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
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
							{noiDung}
							<Toaster />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 500)}`,
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
				new Ev(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				} as PointerEventInit),
			);
		}
	});
}

const q = (chon: string) => document.body.querySelector(chon);
const tatCa = (chon: string) => [...document.body.querySelectorAll(chon)];
const chu = (o: Element | null) => o?.textContent?.trim() ?? null;
const khoa = (o: Element | null) =>
	o instanceof HTMLButtonElement ? o.disabled : null;
const nutTheoChu = (chuNut: string, goc: ParentNode = document.body) =>
	[...goc.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === chuNut,
	);
const hopChuyen = () => q("[data-hop='chuyen-okr']");
const nutChuyen = () => q("[data-nut='chuyen-okr'][type='submit']");
const goiCua = (duong: string) => daGoi.filter((g) => g.duong === duong);

async function luuTruTuMenu(ten: string): Promise<void> {
	const nut = [...document.body.querySelectorAll("button")].find((b) =>
		b.querySelector(".sr-only")?.textContent?.includes(ten),
	);
	await bam(nut);
	await cho(() => tatCa("[role='menuitem']").length > 0, `menu ${ten}`);
	await bam(
		tatCa("[role='menuitem']").find((x) => chu(x) === tc.luuTru) ?? null,
	);
}

async function moHopChuyenVaCho(): Promise<void> {
	await cho(
		() => tatCa("[data-muc-tieu-chuyen]").length > 0,
		"danh sach muc tieu trong hop chuyen",
	);
}

async function chonDonViNhan(ten: string): Promise<void> {
	await bam(hopChuyen()?.querySelector("[data-slot='combobox-trigger']"));
	await cho(() => tatCa("[cmdk-item]").length > 0, "o don vi nhan mo");
	await bam(tatCa("[cmdk-item]").find((x) => x.textContent?.includes(ten)));
}

async function boChon(id: string): Promise<void> {
	await bam(
		q(`[data-muc-tieu-chuyen='${id}'] [role='checkbox']`) ??
			q(`[data-muc-tieu-chuyen='${id}'] button`),
	);
}

beforeEach(() => {
	cay = cayMau();
	quanTri = true;
	moCoi = async () => [];
	daGoi = [];
	loiGhi = new Map();
	daLamMoi = 0;
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

describe("chuong-trinh-duyet", () => {
	test("ST-chuongtrinh-khong-quyen: thanh vien thuong — cong tac Cong bo can duyet khoa, tro dong ly do", async () => {
		quanTri = false;
		await mo(<FormCauHinh />);
		await cho(() => q("[data-cong-tac='duyet-cong-bo']") !== null, "cong tac");
		const o = q("[data-cong-tac='duyet-cong-bo']");
		expect({
			khoa: o?.hasAttribute("disabled"),
			lyDo: (o?.getAttribute("aria-describedby") ?? "").split(" "),
			nhan: chu(q(`label[for='${o?.id}']`)),
		}).toEqual({
			khoa: true,
			lyDo: [LY_DO_KHONG_QUYEN],
			nhan: t.chuongTrinh.duyetCongBo,
		});
	});

	test("ST-chuongtrinh-duyet: quan tri bat cong tac roi Luu — setProgram mang duyetCongBo true", async () => {
		await mo(<FormCauHinh />);
		await cho(() => q("[data-cong-tac='duyet-cong-bo']") !== null, "cong tac");
		const o = q("[data-cong-tac='duyet-cong-bo']");
		expect(o?.hasAttribute("disabled")).toBe(false);
		await bam(o);
		const luu = q("[data-nut='luu-cau-hinh']");
		expect(khoa(luu)).toBe(false);
		await bam(luu);
		await cho(() => goiCua("okr.setProgram").length > 0, "goi setProgram");
		expect(goiCua("okr.setProgram").map((g) => g.dauVao)).toEqual([
			{
				objectiveCap: 5,
				krCap: 5,
				capMode: "canh-bao",
				scoreScale: "0-1",
				weightsOn: false,
				personalOn: false,
				duyetCongBo: true,
			},
		]);
	});
});

describe("to-chuc-okr-mo", () => {
	test("ST-tochuc-okr-mo: chi tiet phong ban co dong OKR va nut Chuyen OKR mo hop qua dia chi", async () => {
		await mo(<ToChuc />, "?don=pb:pb-1");
		await cho(() => q("[data-dong-okr-mo]") !== null, "dong okr mo");
		expect(chu(q("[data-dong-okr-mo] [data-slot='item-title']"))).toBe(
			t.toChuc.okrMo(4),
		);
		await bam(q("[data-dong-okr-mo] [data-nut='chuyen-okr']"));
		await moHopChuyenVaCho();
		expect(url.get("chuyenOkr")).toBe("pb:pb-1");
	});

	test("doi chung: phong ban khong con OKR mo thi khong co dong OKR", async () => {
		await mo(<ToChuc />, "?don=pb:pb-2");
		await cho(() => q("[data-chi-tiet='phong-ban']") !== null, "chi tiet");
		expect(q("[data-dong-okr-mo]")).toBeNull();
	});

	test("khong quyen: dong OKR van hien, nut Chuyen OKR khoa", async () => {
		quanTri = false;
		await mo(<ToChuc />, "?don=pb:pb-1");
		await cho(() => q("[data-dong-okr-mo]") !== null, "dong okr mo");
		expect(khoa(q("[data-dong-okr-mo] [data-nut='chuyen-okr']"))).toBe(true);
	});
});

describe("luu-tru-chan", () => {
	test("ST-tochuc-luu-tru-chan: okrMo > 0 — nut luu tru khoa, noi ly do, Chuyen OKR mo hop chuyen, khong goi archiveDepartment", async () => {
		await mo(<ToChuc />, "?don=pb:pb-1");
		await cho(() => q("[data-chi-tiet='phong-ban']") !== null, "chi tiet");
		await luuTruTuMenu("Kinh doanh vùng 1");
		await cho(() => q("[data-hop='luu-tru-chan']") !== null, "hop luu tru");
		const nutLuu = q("[data-nut='luu-tru-khoa']");
		const lyDo = q("[data-ly-do-chan]");
		expect({
			khoa: khoa(nutLuu),
			lyDo: chu(lyDo),
			troLyDo: nutLuu?.getAttribute("aria-describedby") === lyDo?.id,
			alert: q("[role='alertdialog']"),
		}).toEqual({
			khoa: true,
			lyDo: t.toChuc.chan.lyDo["phong-ban"](4),
			troLyDo: true,
			alert: null,
		});
		await bam(q("[data-nut='chuyen-okr-tu-luu-tru']"));
		await moHopChuyenVaCho();
		expect({
			url: url.get("chuyenOkr"),
			hopLuuTru: q("[data-hop='luu-tru-chan']"),
			luuTru: goiCua("org.archiveDepartment").length,
		}).toEqual({ url: "pb:pb-1", hopLuuTru: null, luuTru: 0 });
	});

	test("doi chung: okrMo = 0 — hop hoi lai thuong, nut luu tru bat", async () => {
		await mo(<ToChuc />, "?don=pb:pb-2");
		await cho(() => q("[data-chi-tiet='phong-ban']") !== null, "chi tiet");
		await luuTruTuMenu("Kinh doanh vùng 2");
		await cho(() => q("[role='alertdialog']") !== null, "hop hoi lai");
		expect({
			chan: q("[data-hop='luu-tru-chan']"),
			khoa: khoa(q("[data-slot='alert-dialog-action']")),
		}).toEqual({ chan: null, khoa: false });
	});
});

describe("chuyen-okr", () => {
	test("ST-chuyen-hop: chi liet muc tieu chua bo o ky dang mo; bo chon mot → gui dung ba muc tieu da chon", async () => {
		await mo(<ToChuc />, "?don=pb:pb-1&chuyenOkr=pb:pb-1");
		await moHopChuyenVaCho();
		expect({
			muc: tatCa("[data-muc-tieu-chuyen]").map((o) =>
				o.getAttribute("data-muc-tieu-chuyen"),
			),
			kyDoc: goiCua("okr.byUnit").map(
				(g) => (g.dauVao as { cycleId: string }).cycleId,
			),
			nut: chu(nutChuyen()),
			khoaKhiChuaChonDen: khoa(nutChuyen()),
		}).toEqual({
			muc: ["o1", "o2", "o3", "o4"],
			kyDoc: [Q4.id],
			nut: t.chuyen.nut(4),
			khoaKhiChuaChonDen: true,
		});

		await chonDonViNhan("Kinh doanh vùng 2");
		const tenLuaChon = tatCa("[cmdk-item]").map((x) => x.textContent ?? "");
		expect(tenLuaChon.some((x) => x.includes("Kinh doanh vùng 1"))).toBe(false);
		await boChon("o3");
		await cho(() => chu(nutChuyen()) === t.chuyen.nut(3), "nut ba muc tieu");
		expect(khoa(nutChuyen())).toBe(false);
		await bam(nutChuyen());
		await cho(() => daLamMoi > 0, "lam moi sau khi chuyen");
		expect(goiCua("okr.chuyenDonVi").map((g) => g.dauVao)).toEqual([
			{
				objectiveIds: ["o1", "o2", "o4"],
				denDonVi: { level: "phong-ban", id: "pb-2" },
			},
		]);
		await cho(() => hopChuyen() === null, "hop dong sau khi chuyen");
		expect(url.get("chuyenOkr")).toBeNull();
	});

	test("ST-chuyen-loi: may chu tu choi — loi trong hop, giu lua chon, khong dong hop", async () => {
		loiGhi.set(
			"okr.chuyenDonVi",
			"Mục tiêu «Tối ưu tuyến giao Thủ Đức» đã bỏ — không chuyển nữa.",
		);
		await mo(<ToChuc />, "?don=pb:pb-1&chuyenOkr=pb:pb-1");
		await moHopChuyenVaCho();
		await chonDonViNhan("Pháp chế");
		await boChon("o4");
		await bam(nutChuyen());
		await cho(() => q("[data-loi-chuyen]") !== null, "loi chuyen");
		expect({
			tieuDe: chu(q("[data-loi-chuyen] [data-slot='alert-title']")),
			than: chu(q("[data-loi-chuyen] [data-slot='alert-description']")),
			hop: hopChuyen() !== null,
			nut: chu(nutChuyen()),
			url: url.get("chuyenOkr"),
			lamMoi: daLamMoi,
		}).toEqual({
			tieuDe: t.chuyen.loiChuyen,
			than: "Mục tiêu «Tối ưu tuyến giao Thủ Đức» đã bỏ — không chuyển nữa.",
			hop: true,
			nut: t.chuyen.nut(3),
			url: "pb:pb-1",
			lamMoi: 0,
		});
	});
});

const MO_COI: MucMoCoi[] = [
	{
		objectiveId: "o9",
		tieuDe: "Chuẩn hoá nhận hàng ca đêm",
		donVi: { level: "phong-ban", id: "pb-cu", ten: "Kho vận Củ Chi" },
		lyDo: ["don-vi-luu-tru"],
	},
	{
		objectiveId: "o10",
		tieuDe: "Giảm 20% hàng hư hỏng",
		donVi: { level: "phong-ban", id: "pb-2", ten: "Kinh doanh vùng 2" },
		lyDo: ["khong-ai-sua", "kr-phu-trach-roi"],
	},
];

describe("mo-coi", () => {
	test("ST-mocoi-dang-tai: dang tai co khung xuong va dong trang thai", async () => {
		moCoi = () => new Promise<MucMoCoi[]>(() => {});
		await mo(<KhoiMoCoi />);
		await cho(() => q("[data-khoi-mo-coi]") !== null, "khoi");
		expect({
			trangThai: q("[data-khoi-mo-coi]")?.getAttribute("data-trang-thai"),
			ban: q("[data-khoi-mo-coi] [aria-busy='true']") !== null,
			loaDoc: chu(q("[data-khoi-mo-coi] [role='status']")),
		}).toEqual({
			trangThai: "ST-mocoi-dang-tai",
			ban: true,
			loaDoc: t.moCoi.dangTai,
		});
	});

	test("ST-mocoi-rong: khong co muc thi Empty", async () => {
		await mo(<KhoiMoCoi />);
		await cho(
			() =>
				q("[data-khoi-mo-coi]")?.getAttribute("data-trang-thai") ===
				"ST-mocoi-rong",
			"rong",
		);
		expect(chu(q("[data-khoi-mo-coi] [data-slot='empty-title']"))).toBe(
			t.moCoi.rong.tieuDe,
		);
	});

	test("ST-mocoi-loi: loi thi Empty co Thu lai, thu lai doc lai va hien muc", async () => {
		let lan = 0;
		moCoi = async () => {
			lan += 1;
			if (lan === 1) throw new Error("may chu loi");
			return MO_COI;
		};
		await mo(<KhoiMoCoi />);
		await cho(
			() =>
				q("[data-khoi-mo-coi]")?.getAttribute("data-trang-thai") ===
				"ST-mocoi-loi",
			"loi",
		);
		expect(chu(q("[data-khoi-mo-coi] [data-slot='empty-title']"))).toBe(
			t.moCoi.loi.tieuDe,
		);
		await bam(nutTheoChu(t.moCoi.loi.thuLai));
		await cho(() => tatCa("[data-mo-coi]").length === 2, "muc sau thu lai");
		expect(lan).toBe(2);
	});

	test("ST-mocoi-co: moi muc co nhan ly do va hanh dong dung ly do; Chuyen OKR mo hop tu don vi da luu tru", async () => {
		moCoi = async () => MO_COI;
		await mo(<KhoiMoCoi />);
		await cho(() => tatCa("[data-mo-coi]").length === 2, "hai muc");
		const hang = tatCa("[data-mo-coi]").map((o) => ({
			id: o.getAttribute("data-mo-coi"),
			lyDo: [...o.querySelectorAll("[data-ly-do]")].map((b) => chu(b)),
			hanhDong: [...o.querySelectorAll("[data-hanh-dong]")].map((b) => [
				b.getAttribute("data-hanh-dong"),
				chu(b),
				b.getAttribute("href"),
			]),
		}));
		expect(hang).toEqual([
			{
				id: "o9",
				lyDo: [t.moCoi.lyDo["don-vi-luu-tru"]],
				hanhDong: [["chuyen", t.moCoi.hanhDong.chuyen, null]],
			},
			{
				id: "o10",
				lyDo: [t.moCoi.lyDo["khong-ai-sua"], t.moCoi.lyDo["kr-phu-trach-roi"]],
				hanhDong: [
					[
						"dat-truong",
						t.moCoi.hanhDong.datTruong,
						"/ws/settings/organization?don=pb%3Apb-2",
					],
					["nguoi-roi", t.moCoi.hanhDong.nguoiRoi, "/ws/settings/members"],
				],
			},
		]);
		await bam(q("[data-mo-coi='o9'] [data-hanh-dong='chuyen']"));
		await moHopChuyenVaCho();
		expect({
			url: url.get("chuyenOkr"),
			muc: tatCa("[data-muc-tieu-chuyen]").map((o) =>
				o.getAttribute("data-muc-tieu-chuyen"),
			),
			tu: chu(q("[data-hop='chuyen-okr'] [data-slot='dialog-description']")),
		}).toEqual({
			url: "pb:pb-cu",
			muc: ["o9"],
			tu: "Từ «Kho vận Củ Chi». Mục tiêu giữ KR, cập nhật tuần, căn chỉnh, người xem và vết.",
		});
	});
});
