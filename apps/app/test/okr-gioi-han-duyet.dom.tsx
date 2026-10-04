import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	ChuKyOutput,
	KrCanhOutput,
	ObjectiveOutput,
	ViecCuaToiOutput,
} from "../../api/src/okr/okr.contracts";

const nguoi = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@onehub.vn`,
});
const HA = nguoi("ha", "Trần Hà");
const MINH = nguoi("minh", "Lê Minh");
const LINH = nguoi("linh", "Hồ Mỹ Linh");

const TEN_G = "Mở rộng kho Bình Dương";
const GUI_LUC = "2026-09-28T18:30:00.000Z";
const LY_DO = "KR thứ hai chưa có khởi điểm đo được, bổ sung rồi gửi lại.";
const CAN_CHINH_CON =
	"Mục tiêu còn 2 căn chỉnh — gỡ hết căn chỉnh (góp vào và nhận góp) rồi mới đặt mức giới hạn.";

const QUY: ChuKyOutput = {
	id: "q4",
	kind: "quy",
	name: "Quý 4/2026",
	parentId: null,
	startsOn: "2026-10-01",
	endsOn: "2026-12-31",
	phase: "dang-chay",
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

const KR: KrCanhOutput = {
	id: "kr-1",
	objectiveId: "mt-g",
	title: "Đưa 30 chủ hàng mới vào kho",
	kind: "tang-toi",
	owner: HA,
	startValue: 0,
	targetValue: 30,
	currentValue: 0,
	unit: "chủ hàng",
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
	soViec: { xong: 0, tong: 0 },
	soSangKien: 0,
	coBangChung: false,
};

const KHONG_QUYEN = {
	datHienThi: false,
	congBo: false,
	guiDuyet: false,
	duyet: false,
	rutDuyet: false,
};

function mucTieu(doi: Partial<ObjectiveOutput>): ObjectiveOutput {
	return {
		themKrLe: false,
		id: "mt-g",
		cycleId: QUY.id,
		cycleName: QUY.name,
		kyGhiDuoc: true,
		mangSangToi: null,
		mangSangTu: null,
		level: "phong-ban",
		unitId: "pb-1",
		unitName: "Kinh doanh vùng 1",
		title: TEN_G,
		kind: "cam-ket",
		status: "cong-bo",
		owner: HA,
		participants: [],
		whyNow: "",
		publishedAt: "2026-10-02T00:00:00.000Z",
		droppedAt: null,
		progress: 0,
		expected: null,
		keyResults: [KR],
		alignments: [],
		canEdit: true,
		following: false,
		followerCount: 0,
		theoDoi: false,
		soNguoiXem: 0,
		soGopYCho: 0,
		trail: [],
		canEditKr: ["kr-1"],
		hienThi: "cong-khai",
		nguoiXem: [],
		nguoiDuyetDuKien: null,
		choDuyet: null,
		traLaiGanNhat: null,
		quyen: { ...KHONG_QUYEN, datHienThi: true },
		...doi,
	};
}

const TRANG_THAI = [
	"cong-khai",
	"gioi-han",
	"cho-duyet-nguoi-gui",
	"cho-duyet-nguoi-duyet",
	"bi-tra-lai",
	"khong-thay",
] as const;
type TrangThai = (typeof TRANG_THAI)[number];

const LOI_KHONG_THAY = "khong-thay";

const DU_LIEU = {
	"cong-khai": mucTieu({}),
	"gioi-han": mucTieu({
		hienThi: "gioi-han",
		nguoiXem: [{ id: LINH.id, name: LINH.name }],
	}),
	"cho-duyet-nguoi-gui": mucTieu({
		status: "cho-duyet",
		publishedAt: null,
		choDuyet: {
			nguoiGui: HA,
			guiLuc: GUI_LUC,
			nguoiDuyet: { ten: MINH.name },
			lanTraLaiTruoc: null,
		},
		quyen: { ...KHONG_QUYEN, rutDuyet: true },
	}),
	"cho-duyet-nguoi-duyet": mucTieu({
		status: "cho-duyet",
		publishedAt: null,
		choDuyet: {
			nguoiGui: HA,
			guiLuc: GUI_LUC,
			nguoiDuyet: { ten: MINH.name },
			lanTraLaiTruoc: null,
		},
		quyen: { ...KHONG_QUYEN, congBo: true, duyet: true },
	}),
	"bi-tra-lai": mucTieu({
		status: "nhap",
		publishedAt: null,
		traLaiGanNhat: { lyDo: LY_DO, nguoi: MINH, luc: GUI_LUC },
		quyen: { ...KHONG_QUYEN, datHienThi: true, guiDuyet: true },
	}),
	"khong-thay": LOI_KHONG_THAY,
} satisfies Record<TrangThai, ObjectiveOutput | typeof LOI_KHONG_THAY>;

const DAU = {
	"cong-khai": '[data-okr-sheet][data-dau-khung="cong-khai"]',
	"gioi-han": "[data-nhan-gioi-han]",
	"cho-duyet-nguoi-gui": '[data-dai="cho-nguoi-gui"] [data-nut="rut-lai"]',
	"cho-duyet-nguoi-duyet": '[data-dai="cho-nguoi-duyet"] [data-nut="duyet"]',
	"bi-tra-lai": '[data-dai="bi-tra-lai"]',
	"khong-thay": "[data-khung-khong-thay]",
} satisfies Record<TrangThai, string>;

let chiTiet: ObjectiveOutput | typeof LOI_KHONG_THAY = DU_LIEU["cong-khai"];
let viecCuaToi: ViecCuaToiOutput = { viec: [], lienQuanOkr: true };

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
let daGoi: { duong: string; dauVao: DauVao }[] = [];
let daLamMoi: string[] = [];
let loiGhi: { duong: string; loi: string; code: string } | null = null;

function loiTrpc(thongDiep: string, code: string): Error {
	return Object.assign(new Error(thongDiep), { data: { code } });
}

function doc(duong: string): Json | ObjectiveOutput | ViecCuaToiOutput {
	switch (duong) {
		case "okr.objective":
			if (chiTiet === LOI_KHONG_THAY)
				throw loiTrpc(
					"Không thấy mục tiêu này — có thể nó không còn, hoặc bạn không được xem.",
					"NOT_FOUND",
				);
			return chiTiet;
		case "okr.cycles":
			return { cycles: [{ ...QUY }], currentId: QUY.id };
		case "okr.comments":
			return { comments: [], dong: [] };
		case "okr.thanhVien":
		case "users.list":
			return [HA, MINH, LINH];
		case "users.me":
			return HA;
		case "okr.viecCuaToi":
			return viecCuaToi;
		case "okr.program":
			return {
				objectiveCap: 5,
				krCap: 5,
				capMode: "canh-bao",
				scoreScale: "0-1",
				weightsOn: false,
				personalOn: false,
				version: 1,
			};
		case "workspace.get":
			return { viewerRole: "member" };
		case "okr.troLySanSang":
			return { bat: false, lyDo: "tat" };
		case "okr.troLyDanhSach":
			return {
				dong: [],
				dangSoan: false,
				maKetThuc: null,
				docLuc: null,
				lyDo: "tat",
			};
		default:
			return null;
	}
}

function thuTuc(duong: string) {
	return {
		queryKey: (vao?: DauVao) => [duong, vao ?? null],
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao) => ({
			queryKey: [duong, vao ?? null],
			queryFn: async () => doc(duong),
		}),
		mutationOptions: (chon?: {
			onSuccess?: (kq: { id: string; canhBao: null }) => unknown;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => {
				daGoi.push({ duong, dauVao: vao });
				if (loiGhi?.duong === duong) throw loiTrpc(loiGhi.loi, loiGhi.code);
				return { id: "mt-g", canhBao: null };
			},
		}),
	};
}

const nhanh = (goc: string) =>
	new Proxy({}, { get: (_, ten) => thuTuc(`${goc}.${String(ten)}`) });

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: nhanh("okr"),
		workspace: nhanh("workspace"),
		users: nhanh("users"),
		org: nhanh("org"),
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		okr: async (id?: string) => {
			daLamMoi.push(id ?? "");
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr/theo-don-vi",
}));

const { ObjectiveSheet } = await import(
	"@/components/crm/record-sheet/objective-sheet"
);
const { ViecOkrCuaToi } = await import("@/app/(app)/[slug]/okr/viec-cua-toi");
const { DetailSheet } = await import("@/components/detail-sheet");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrGioiHanMessages } = await import("@/lib/messages/okr-gioi-han");
const { okrMessages } = await import("@/lib/messages/okr");

const g = okrGioiHanMessages("vi");
const m = okrMessages("vi");

let dangMo: { o: HTMLElement; root: Root }[] = [];
let khach = new QueryClient();

async function dung(noiDung: ReactElement): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	khach = client;
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams="?record=objective:mt-g">
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{noiDung}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
}

async function moSheet(): Promise<void> {
	await dung(
		<DetailSheet onOpenChange={() => {}} open>
			<ObjectiveSheet objectiveId="mt-g" />
		</DetailSheet>,
	);
	await cho(
		() =>
			document.body.querySelector(
				"[data-okr-sheet] [role=tab], [data-khung-khong-thay]",
			) !== null,
		"sheet tai xong",
	);
}

async function dong(): Promise<void> {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 600)}`,
	);
}

async function bam(o: Element): Promise<void> {
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		]) {
			const Kieu = loai.startsWith("pointer") ? PointerEvent : MouseEvent;
			o.dispatchEvent(
				new Kieu(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				} as PointerEventInit),
			);
		}
	});
}

async function go(o: Element | null, chu: string): Promise<void> {
	if (!(o instanceof HTMLTextAreaElement)) throw new Error("khong phai o nhap");
	const dat = Object.getOwnPropertyDescriptor(
		HTMLTextAreaElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function motCai<T extends Element = HTMLElement>(chon: string): T {
	const o = document.body.querySelector<T>(chon);
	if (!o) throw new Error(`khong co ${chon}`);
	return o;
}

function nut(chu: string, goc: ParentNode = document.body): HTMLButtonElement {
	const tim = [...goc.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
	if (!tim)
		throw new Error(
			`khong thay nut "${chu}" — ${[...goc.querySelectorAll("button")].map((b) => b.textContent?.trim()).join(" | ")}`,
		);
	return tim;
}

async function moMenu(muc: string): Promise<void> {
	await bam(motCai(`[aria-label="${m.sheet.menu}"]`));
	await cho(
		() => document.body.querySelector('[role="menuitem"]') !== null,
		"menu muc tieu mo",
	);
	const chon = [...document.body.querySelectorAll('[role="menuitem"]')].find(
		(o) => o.textContent === muc,
	);
	if (!chon) throw new Error(`khong co muc ${muc}`);
	await bam(chon);
}

beforeEach(() => {
	daGoi = [];
	daLamMoi = [];
	loiGhi = null;
	chiTiet = DU_LIEU["cong-khai"];
	viecCuaToi = { viec: [], lienQuanOkr: true };
});

afterEach(dong);

describe("dau-khung", () => {
	test("ma tran 6 x 6: moi trang thai co dau rieng, nam dau kia vang", async () => {
		const thay = {} as Record<TrangThai, Record<TrangThai, boolean>>;
		const mong = {} as Record<TrangThai, Record<TrangThai, boolean>>;
		for (const tt of TRANG_THAI) {
			chiTiet = DU_LIEU[tt];
			await moSheet();
			thay[tt] = {} as Record<TrangThai, boolean>;
			mong[tt] = {} as Record<TrangThai, boolean>;
			for (const dau of TRANG_THAI) {
				thay[tt][dau] = document.body.querySelector(DAU[dau]) !== null;
				mong[tt][dau] = tt === dau;
			}
			await dong();
		}
		const soO = TRANG_THAI.length * TRANG_THAI.length;
		const lech = TRANG_THAI.flatMap((tt) =>
			TRANG_THAI.filter((d) => thay[tt][d] !== mong[tt][d]).map(
				(d) => `(${tt}, ${d}): thay ${thay[tt][d]}`,
			),
		);
		console.log(`dau-khung: so o = ${soO}, lech = ${lech.length}`);
		for (const l of lech) console.log(`  lech ${l}`);
		expect(soO).toBe(36);
		expect(thay).toEqual(mong);
	});

	test("khong-thay: cau ghim, khong tieu de muc tieu, khong tab", async () => {
		chiTiet = LOI_KHONG_THAY;
		await moSheet();
		const khung = motCai("[data-khung-khong-thay]");
		expect(khung.textContent).toContain("Không tìm thấy mục tiêu này");
		expect(document.body.textContent).not.toContain(TEN_G);
		expect(
			document.body.querySelector("[data-okr-sheet] [role=tab]"),
		).toBeNull();
	});

	test("gioi-han: nhan khoa mang goi y so nguoi xem, chu nguoi nhap translate=no", async () => {
		chiTiet = DU_LIEU["gioi-han"];
		await moSheet();
		const nhan = motCai("[data-nhan-gioi-han]");
		expect(nhan.textContent).toBe(g.nhan.gioiHan);
		expect(nhan.getAttribute("aria-label")).toBe(
			"Giới hạn: Chỉ người liên quan và 1 người xem có tên thấy",
		);
		await bam(nhan);
		await cho(
			() => document.body.querySelector('[data-hop="muc-hien-thi"]') !== null,
			"nhan mo hop muc",
		);
	});

	test("cho-duyet: dai nguoi gui ghi nguoi duyet va ngay gio VN, Them KR an, menu Sua va Muc hien thi khoa", async () => {
		chiTiet = DU_LIEU["cho-duyet-nguoi-gui"];
		await moSheet();
		const dai = motCai('[data-dai="cho-nguoi-gui"]');
		expect(dai.querySelector('[data-slot="alert-title"]')?.textContent).toBe(
			"Chờ Lê Minh duyệt · gửi 29/09",
		);
		expect(document.body.querySelector('[data-nut="them-kr"]')).toBeNull();
		expect(document.body.querySelector('[data-nut="cong-bo"]')).toBeNull();
		expect(document.body.querySelector('[data-nut="gui-duyet"]')).toBeNull();
		await bam(motCai(`[aria-label="${m.sheet.menu}"]`));
		await cho(
			() => document.body.querySelector('[role="menuitem"]') !== null,
			"menu mo",
		);
		const khoa = Object.fromEntries(
			[...document.body.querySelectorAll('[role="menuitem"]')].map((o) => [
				o.textContent,
				o.hasAttribute("data-disabled"),
			]),
		);
		expect(khoa).toEqual({
			[m.sheet.sua]: true,
			[g.menuMucHienThi]: true,
			[m.sheet.bo]: false,
		});
	});

	test("nguoi-duyet: Duyet va cong bo goi duyetMucTieu, lam moi khung", async () => {
		chiTiet = DU_LIEU["cho-duyet-nguoi-duyet"];
		await moSheet();
		const dai = motCai('[data-dai="cho-nguoi-duyet"]');
		expect(dai.querySelector('[data-slot="alert-title"]')?.textContent).toBe(
			"Trần Hà gửi duyệt · 29/09",
		);
		expect(dai.querySelector('[data-nut="rut-lai"]')).toBeNull();
		expect(document.body.querySelector('[data-nut="cong-bo"]')).toBeNull();
		await bam(motCai('[data-nut="duyet"]'));
		await cho(() => daLamMoi.length > 0, "lam moi sau duyet");
		expect(daGoi).toEqual([
			{ duong: "okr.duyetMucTieu", dauVao: { id: "mt-g" } },
		]);
	});
});

describe("gui-duyet", () => {
	test("nhap co quyen gui duyet: Gui duyet thay Cong bo, hoi lai roi goi guiDuyet", async () => {
		chiTiet = mucTieu({
			status: "nhap",
			publishedAt: null,
			quyen: { ...KHONG_QUYEN, datHienThi: true, guiDuyet: true },
		});
		await moSheet();
		expect(document.body.querySelector('[data-nut="cong-bo"]')).toBeNull();
		await bam(motCai('[data-nut="gui-duyet"]'));
		await cho(
			() => document.body.querySelector('[role="alertdialog"]') !== null,
			"hoi gui duyet",
		);
		const hoi = motCai('[role="alertdialog"]');
		await bam(nut(g.duyet.hoiGui.nut, hoi));
		await cho(() => daLamMoi.length > 0, "lam moi sau gui");
		expect(daGoi).toEqual([{ duong: "okr.guiDuyet", dauVao: { id: "mt-g" } }]);
	});

	test("bi tra lai: ly do translate=no, Gui duyet nam trong dai, dau khung khong lap nut", async () => {
		chiTiet = DU_LIEU["bi-tra-lai"];
		await moSheet();
		const lyDo = motCai("[data-ly-do-tra-lai]");
		expect(lyDo.textContent).toBe(LY_DO);
		expect(lyDo.getAttribute("translate")).toBe("no");
		expect(
			document.body.querySelectorAll('[data-nut="gui-duyet"]').length,
		).toBe(1);
		expect(
			document.body.querySelector(
				'[data-dai="bi-tra-lai"] [data-nut="gui-duyet"]',
			),
		).not.toBeNull();
	});
});

describe("hop-muc-hien-thi", () => {
	test("chon Gioi han bi tu choi conCanChinh: FieldError cau ghim, Luu khoa, giu lua chon; doi lai mo Luu", async () => {
		loiGhi = {
			duong: "okr.datHienThi",
			loi: CAN_CHINH_CON,
			code: "BAD_REQUEST",
		};
		await moSheet();
		await moMenu(g.menuMucHienThi);
		await cho(
			() => document.body.querySelector('[data-hop="muc-hien-thi"]') !== null,
			"hop muc mo",
		);
		const hop = motCai('[data-hop="muc-hien-thi"]');
		const luu = motCai<HTMLButtonElement>('[data-nut="luu-muc-hien-thi"]');
		expect(luu.disabled).toBe(true);
		await bam(motCai('[role="radio"][value="gioi-han"]'));
		expect(luu.disabled).toBe(false);
		await bam(luu);
		await cho(
			() => hop.querySelector('[data-slot="field-error"]') !== null,
			"loi trong hop",
		);
		expect(hop.querySelector('[data-slot="field-error"]')?.textContent).toBe(
			CAN_CHINH_CON,
		);
		expect(luu.disabled).toBe(true);
		expect(
			motCai('[role="radio"][value="gioi-han"]').getAttribute("aria-checked"),
		).toBe("true");
		expect(daGoi).toEqual([
			{
				duong: "okr.datHienThi",
				dauVao: { objectiveId: "mt-g", hienThi: "gioi-han", nguoiXem: [] },
			},
		]);
		await bam(motCai('[role="radio"][value="cong-khai"]'));
		expect(hop.querySelector('[data-slot="field-error"]')).toBeNull();
		expect(hop.querySelector("[data-slot='dialog-close']")?.textContent).toBe(
			g.hienThi.huy,
		);
	});

	test("chon Cong khai tu gioi han gui nguoiXem rong", async () => {
		chiTiet = DU_LIEU["gioi-han"];
		await moSheet();
		await moMenu(g.menuMucHienThi);
		await cho(
			() => document.body.querySelector('[data-hop="muc-hien-thi"]') !== null,
			"hop muc mo",
		);
		expect(motCai("[data-nguoi-xem]").textContent).toContain(LINH.name);
		await bam(motCai('[role="radio"][value="cong-khai"]'));
		await bam(motCai('[data-nut="luu-muc-hien-thi"]'));
		await cho(() => daLamMoi.length > 0, "lam moi sau luu");
		expect(daGoi).toEqual([
			{
				duong: "okr.datHienThi",
				dauVao: { objectiveId: "mt-g", hienThi: "cong-khai", nguoiXem: [] },
			},
		]);
	});
});

describe("cong-bo-tu-cho-duyet", () => {
	test("o duyet da tat, muc con cho duyet: Cong bo o dau khung theo quyen.congBo, dai noi gui tu truoc, bam goi publishObjective", async () => {
		chiTiet = mucTieu({
			status: "cho-duyet",
			publishedAt: null,
			choDuyet: {
				nguoiGui: MINH,
				guiLuc: GUI_LUC,
				nguoiDuyet: { ten: MINH.name },
				lanTraLaiTruoc: null,
			},
			quyen: { ...KHONG_QUYEN, congBo: true },
		});
		await moSheet();
		const dai = motCai('[data-dai="cho-nguoi-gui"]');
		const truoc = {
			congBo: document.body.querySelectorAll('[data-nut="cong-bo"]').length,
			rutLai: dai.querySelector('[data-nut="rut-lai"]') !== null,
			cauTuTruoc: dai.textContent?.includes(g.duyet.choTuTruoc),
			cauKhoaSua: dai.textContent?.includes(g.duyet.khoaSua),
		};
		expect(truoc).toEqual({
			congBo: 1,
			rutLai: false,
			cauTuTruoc: true,
			cauKhoaSua: false,
		});
		await bam(motCai('[data-nut="cong-bo"]'));
		await cho(
			() => document.body.querySelector('[role="alertdialog"]') !== null,
			"hoi cong bo",
		);
		await bam(nut(m.sheet.hoiCongBo.action, motCai('[role="alertdialog"]')));
		await cho(() => daLamMoi.length > 0, "lam moi sau cong bo");
		expect(daGoi).toEqual([
			{ duong: "okr.publishObjective", dauVao: { id: "mt-g" } },
		]);
	});

	test("doi chung: o bat, nguoi sua khong duyet duoc (quyen.congBo false) khong co Cong bo", async () => {
		chiTiet = DU_LIEU["cho-duyet-nguoi-gui"];
		await moSheet();
		expect(document.body.querySelector('[data-nut="cong-bo"]')).toBeNull();
		expect(
			motCai('[data-dai="cho-nguoi-gui"]').textContent?.includes(
				g.duyet.khoaSua,
			),
		).toBe(true);
	});
});

describe("tai-lai-thanh-404", () => {
	test("da tai xong roi tai lai ra 404: khung thanh khong-thay, dau khung khong con tieu de cu", async () => {
		await moSheet();
		expect(document.body.textContent).toContain(TEN_G);
		chiTiet = LOI_KHONG_THAY;
		await act(async () => {
			await khach.refetchQueries();
		});
		await cho(
			() => document.body.querySelector("[data-khung-khong-thay]") !== null,
			"khung khong thay sau tai lai",
		);
		expect(document.body.textContent).not.toContain(TEN_G);
		expect(
			document.body.querySelector("[data-nhan-gioi-han], [data-dai]"),
		).toBeNull();
	});
});

describe("hop-tra-lai-va-rut-lai", () => {
	test("tra lai hong o may chu: hop con mo, giu ly do, loi trong hop", async () => {
		chiTiet = DU_LIEU["cho-duyet-nguoi-duyet"];
		loiGhi = {
			duong: "okr.traLaiMucTieu",
			loi: "Mục tiêu này không còn chờ duyệt.",
			code: "BAD_REQUEST",
		};
		await moSheet();
		await bam(motCai('[data-nut="tra-lai"]'));
		await cho(
			() => document.body.querySelector('[data-hop="tra-lai"]') !== null,
			"hop tra lai",
		);
		await go(motCai('[data-hop="tra-lai"] textarea'), LY_DO);
		await bam(motCai('[data-nut="xac-nhan-tra-lai"]'));
		await cho(
			() =>
				document.body.querySelector(
					'[data-hop="tra-lai"] [data-slot="field-error"]',
				) !== null,
			"loi trong hop tra lai",
		);
		expect({
			loi: motCai('[data-hop="tra-lai"] [data-slot="field-error"]').textContent,
			lyDo: motCai<HTMLTextAreaElement>('[data-hop="tra-lai"] textarea').value,
			lamMoi: daLamMoi.length,
		}).toEqual({
			loi: "Mục tiêu này không còn chờ duyệt.",
			lyDo: LY_DO,
			lamMoi: 0,
		});
	});

	test("tra lai: 9 ky tu khoa, 10 ky tu bat, gui dung ly do; Huy boc DialogClose", async () => {
		chiTiet = DU_LIEU["cho-duyet-nguoi-duyet"];
		await moSheet();
		await bam(motCai('[data-nut="tra-lai"]'));
		await cho(
			() => document.body.querySelector('[data-hop="tra-lai"]') !== null,
			"hop tra lai",
		);
		const hop = motCai('[data-hop="tra-lai"]');
		const oLyDo = hop.querySelector("textarea");
		expect(oLyDo?.getAttribute("translate")).toBe("no");
		const gui = motCai<HTMLButtonElement>('[data-nut="xac-nhan-tra-lai"]');
		expect(gui.disabled).toBe(true);
		await go(oLyDo, "123456789");
		const chin = gui.disabled;
		await go(oLyDo, "1234567890");
		const muoi = gui.disabled;
		expect({ chin, muoi }).toEqual({ chin: true, muoi: false });
		expect(hop.querySelector("[data-slot='dialog-close']")?.textContent).toBe(
			g.duyet.hopTraLai.huy,
		);
		await go(oLyDo, LY_DO);
		await bam(gui);
		await cho(() => daLamMoi.length > 0, "lam moi sau tra lai");
		expect(daGoi).toEqual([
			{
				duong: "okr.traLaiMucTieu",
				dauVao: { objectiveId: "mt-g", lyDo: LY_DO },
			},
		]);
	});

	test("rut lai: ConfirmDialog nhu Gui duyet, Huy la nut dong cua hop, nut chinh goi rutDuyet", async () => {
		chiTiet = DU_LIEU["cho-duyet-nguoi-gui"];
		await moSheet();
		await bam(motCai('[data-nut="rut-lai"]'));
		await cho(
			() => document.body.querySelector('[role="alertdialog"]') !== null,
			"hop rut lai",
		);
		const hop = motCai('[role="alertdialog"]');
		expect({
			tieuDe: hop.querySelector("[data-slot='alert-dialog-title']")
				?.textContent,
			huy: hop.querySelector("[data-slot='alert-dialog-cancel']")?.textContent,
			nut: hop.querySelector("[data-slot='alert-dialog-action']")?.textContent,
			tone: hop
				.querySelector("[data-slot='alert-dialog-action']")
				?.getAttribute("data-variant"),
		}).toEqual({
			tieuDe: g.duyet.hopRut.tieuDe,
			huy: g.duyet.hopRut.huy,
			nut: g.duyet.hopRut.nut,
			tone: "default",
		});
		await bam(nut(g.duyet.hopRut.nut, hop));
		await cho(() => daLamMoi.length > 0, "lam moi sau rut");
		expect(daGoi).toEqual([{ duong: "okr.rutDuyet", dauVao: { id: "mt-g" } }]);
	});
});

describe("viec-cua-toi", () => {
	test("cho duyet va bi tra lai: tieu de mang ten muc tieu, chu nguoi nhap translate=no", async () => {
		viecCuaToi = {
			lienQuanOkr: true,
			viec: [
				{
					loai: "okr-cho-duyet",
					objectiveId: "mt-g",
					nhan: TEN_G,
					nguoiGui: HA.name,
				},
				{
					loai: "okr-tra-lai",
					objectiveId: "mt-h",
					nhan: "Giảm chi phí vận chuyển",
					nguoiTraLai: MINH.name,
					lyDo: LY_DO,
				},
			],
		};
		await dung(
			<ViecOkrCuaToi noi="tong-quan" khiHien="luon" anKhiLoi={false} />,
		);
		await cho(
			() =>
				document.body.querySelector('[data-viec-okr="okr-cho-duyet"]') !== null,
			"viec cho duyet",
		);
		const cho1 = motCai('[data-viec-okr="okr-cho-duyet"]');
		const tra = motCai('[data-viec-okr="okr-tra-lai"]');
		expect({
			choTieuDe: cho1.querySelector('[data-slot="item-title"]')?.textContent,
			choMoTa: cho1.querySelector('[data-slot="item-description"]')
				?.textContent,
			traTieuDe: tra.querySelector('[data-slot="item-title"]')?.textContent,
			traMoTa: tra.querySelector('[data-slot="item-description"]')?.textContent,
			traMoTaDich: tra
				.querySelector('[data-slot="item-description"]')
				?.getAttribute("translate"),
			tenKhongDich: [
				...cho1.querySelectorAll('[data-slot="item-title"] [translate="no"]'),
			].map((o) => o.textContent),
		}).toEqual({
			choTieuDe: `Chờ bạn duyệt: ${TEN_G}`,
			choMoTa: "Trần Hà gửi duyệt",
			traTieuDe: "Lê Minh trả lại: Giảm chi phí vận chuyển",
			traMoTa: LY_DO,
			traMoTaDich: "no",
			tenKhongDich: [TEN_G],
		});
	});
});

const nhapGuiDuoc = (doi: Partial<ObjectiveOutput>) =>
	mucTieu({
		status: "nhap",
		publishedAt: null,
		quyen: { ...KHONG_QUYEN, datHienThi: true, guiDuyet: true },
		...doi,
	});

describe("gui-duyet-khoa", () => {
	test("gui-duyet-khoa: 2 cho x 2 du lieu — 0 KR thi nut khoa, ly do hien chu noi aria-describedby, bam khong hoi lai; 1 KR thi nut mo", async () => {
		const CA: {
			ten: string;
			du: ObjectiveOutput;
			chon: string;
			khoa: boolean;
		}[] = [
			{
				ten: "dau-khung-0",
				du: nhapGuiDuoc({ keyResults: [] }),
				chon: '[data-nut="gui-duyet"]',
				khoa: true,
			},
			{
				ten: "dau-khung-1",
				du: nhapGuiDuoc({}),
				chon: '[data-nut="gui-duyet"]',
				khoa: false,
			},
			{
				ten: "tra-lai-0",
				du: { ...DU_LIEU["bi-tra-lai"], keyResults: [] },
				chon: '[data-dai="bi-tra-lai"] [data-nut="gui-duyet"]',
				khoa: true,
			},
			{
				ten: "tra-lai-1",
				du: DU_LIEU["bi-tra-lai"],
				chon: '[data-dai="bi-tra-lai"] [data-nut="gui-duyet"]',
				khoa: false,
			},
		];
		const ra: unknown[] = [];
		for (const c of CA) {
			chiTiet = c.du;
			daGoi = [];
			await moSheet();
			const nutGui = motCai<HTMLButtonElement>(c.chon);
			const moTa = document.getElementById(
				nutGui.getAttribute("aria-describedby") ?? "",
			);
			await bam(nutGui);
			await cho(() => true, "sau khi bam");
			ra.push({
				ten: c.ten,
				khoa: nutGui.disabled,
				lyDo: moTa?.textContent ?? null,
				hoiLai: document.body.querySelector('[role="alertdialog"]') !== null,
				guiDuyet: daGoi.filter((x) => x.duong === "okr.guiDuyet").length,
			});
			await dong();
		}
		expect(ra).toEqual(
			CA.map((c) => ({
				ten: c.ten,
				khoa: c.khoa,
				lyDo: c.khoa ? g.duyet.canKr : null,
				hoiLai: !c.khoa,
				guiDuyet: 0,
			})),
		);
	});
});

describe("duyet-chu", () => {
	const L = "Thêm KR đo doanh thu từ khách quay lại.";

	test("duyet-chu: hop gui neu nguoi duyet du kien; null giu than cu", async () => {
		chiTiet = nhapGuiDuoc({ nguoiDuyetDuKien: { ten: MINH.name } });
		await moSheet();
		await bam(motCai('[data-nut="gui-duyet"]'));
		await cho(
			() => document.body.querySelector('[role="alertdialog"]') !== null,
			"hoi gui",
		);
		const coTen = motCai('[role="alertdialog"]').textContent ?? "";
		await dong();
		chiTiet = nhapGuiDuoc({ nguoiDuyetDuKien: null });
		await moSheet();
		await bam(motCai('[data-nut="gui-duyet"]'));
		await cho(
			() => document.body.querySelector('[role="alertdialog"]') !== null,
			"hoi gui",
		);
		const khongTen = motCai(
			'[role="alertdialog"] [data-slot="alert-dialog-description"]',
		).textContent;
		expect({
			coTen: coTen.includes(`${MINH.name} sẽ duyệt.`),
			khongTen,
		}).toEqual({ coTen: true, khongTen: g.duyet.hoiGui.than });
	});

	test("duyet-chu: dai nguoi duyet neu lan tra lai truoc — «ban» khi chinh nguoi xem, ten khi nguoi khac, khong co khi null", async () => {
		const voi = (nguoi: typeof HA | null) =>
			mucTieu({
				status: "cho-duyet",
				publishedAt: null,
				choDuyet: {
					nguoiGui: HA,
					guiLuc: GUI_LUC,
					nguoiDuyet: { ten: MINH.name },
					lanTraLaiTruoc: nguoi ? { lyDo: L, nguoi, luc: GUI_LUC } : null,
				},
				quyen: { ...KHONG_QUYEN, congBo: true, duyet: true },
			});
		const ra: (string | null)[] = [];
		for (const n of [HA, MINH, null]) {
			chiTiet = voi(n);
			await moSheet();
			await cho(
				() =>
					document.body.querySelector('[data-dai="cho-nguoi-duyet"]') !== null,
				"dai",
			);
			if (n === HA)
				await cho(
					() =>
						document.body
							.querySelector("[data-lan-tra-lai-truoc]")
							?.textContent?.startsWith("Lần trước bạn") === true,
					"dai noi ban tra lai",
				);
			ra.push(
				document.body.querySelector("[data-lan-tra-lai-truoc]")?.textContent ??
					null,
			);
			await dong();
		}
		expect({
			ban:
				ra[0]?.startsWith("Lần trước bạn trả lại") === true &&
				ra[0]?.includes(L) === true,
			ten: ra[1]?.includes(MINH.name) === true && ra[1]?.includes(L) === true,
			khong: ra[2],
		}).toEqual({ ban: true, ten: true, khong: null });
	});

	test("duyet-chu: nguoi vua tra lai thay Cong bo dang phu, nguoi khac thay dang chinh; Vet hien ly do tra lai", async () => {
		const voi = (nguoi: typeof HA) =>
			mucTieu({
				status: "nhap",
				publishedAt: null,
				traLaiGanNhat: { lyDo: L, nguoi, luc: GUI_LUC },
				quyen: { ...KHONG_QUYEN, congBo: true },
				trail: [
					{
						id: "v-tra",
						at: GUI_LUC,
						actor: nguoi,
						action: "tra-lai",
						keyResultId: null,
						before: { status: "cho-duyet" },
						after: { status: "nhap" },
						note: L,
					},
				],
			});
		const bienThe: (string | null)[] = [];
		for (const n of [HA, MINH]) {
			chiTiet = voi(n);
			await moSheet();
			if (n === HA)
				await cho(
					() =>
						document.body
							.querySelector('[data-nut="cong-bo"]')
							?.getAttribute("data-variant") === "outline",
					"cong bo dang phu cho nguoi vua tra lai",
				);
			bienThe.push(motCai('[data-nut="cong-bo"]').getAttribute("data-variant"));
			if (n === MINH) {
				const tab = [
					...document.body.querySelectorAll("[data-okr-sheet] [role=tab]"),
				].find((t) => t.textContent?.startsWith(m.sheet.tabVet));
				if (!tab) throw new Error("khong thay tab Vet");
				await bam(tab);
				await cho(
					() => document.body.querySelector("[data-ly-do-vet]") !== null,
					"vet co ly do",
				);
			}
			if (n === MINH)
				bienThe.push(
					document.body.querySelector("[data-ly-do-vet]")?.textContent ?? null,
				);
			await dong();
		}
		expect(bienThe).toEqual(["outline", "default", L]);
	});
});
