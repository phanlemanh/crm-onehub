import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	CommentsOutput,
	MauInput,
	MauOutput,
} from "../../api/src/okr/okr.contracts";
import type { CanhKrOutput } from "../../api/src/okr/okr-canh-kr.contracts";
import type { TreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

type Dong = CanhKrOutput["dong"][number];

const HUNG = { id: "hung", name: "Trần Văn Hùng", daRoi: false };
const LAN_ROI = { id: "lan", name: "Phạm Thị Lan", daRoi: true };

function viec(id: string, doi: Partial<Extract<Dong, { loai: "viec" }>>): Dong {
	return {
		id,
		loai: "viec",
		tieuDe: `Việc ${id}`,
		nguoiLam: HUNG,
		hanNgay: "2026-10-10",
		quaHan: false,
		xong: false,
		laNguoiLam: false,
		...doi,
	};
}

const SANG_KIEN: Dong = {
	id: "sk-1",
	loai: "ke-hoach",
	lienKet: {
		loai: "ke-hoach",
		coQuyen: true,
		id: "p-1",
		ten: "Công ty Minh Long",
		trangThai: "dang-chay",
	},
};

function canh(doi: Partial<CanhKrOutput>): CanhKrOutput {
	return {
		kr: {
			id: "kr-1",
			title: "Tăng 40 đối tác hoạt động",
			kind: "tang-toi",
			objectiveId: "mt-1",
			ownerName: "Trần Văn Hùng",
			xong: false,
		},
		dong: [
			viec("v-1", { xong: true, tieuDe: "Gọi lại 20 đối tác cũ" }),
			viec("v-2", { tieuDe: "Họp với phòng đào tạo" }),
			SANG_KIEN,
		],
		bangChung: [],
		quyen: { suaDuoc: true, ganDuoc: true },
		khoa: false,
		choDuyet: false,
		...doi,
	};
}

const TRANG_THAI = [
	"dang-tai",
	"rong",
	"loi",
	"co-viec",
	"khoa",
	"nguoi-roi",
] as const;
type TenTrangThai = (typeof TRANG_THAI)[number];

type MauDong = MauOutput["mau"][number];
type LuuMauVao = {
	id: string | null;
	ten: string;
	cap: string;
	donViIds: string[];
	noiDung: MauDong["noiDung"];
};
type TaoTuMauVao = {
	mauId: string;
	cycleId: string;
	unit: { level: string; departmentId?: string };
	ownerUserId: string;
	krs: {
		startValue: number | null;
		targetValue: number | null;
		ownerUserId: string;
	}[];
};
type GoiMay =
	| { duong: "okr.luuMau"; vao: LuuMauVao }
	| { duong: "okr.taoTuMau"; vao: TaoTuMauVao }
	| { duong: "okr.luuTruMau" | "okr.khoiPhucMau"; vao: { id: string } }
	| { duong: "okr.createObjective"; vao: object };

let khoMau: MauDong[] = [];
let quanTriMau = true;
let hoiMau: MauInput[] = [];
let goiMay: GoiMay[] = [];

function locNhuMay(vao: MauInput): MauDong[] {
	if (quanTriMau && vao.cap === undefined && vao.donViId === undefined)
		return khoMau;
	return khoMau.filter(
		(x) =>
			!x.luuTru &&
			(vao.cap === undefined || x.cap === vao.cap) &&
			(vao.donViId === undefined ||
				x.donViIds.length === 0 ||
				x.donViIds.includes(vao.donViId)),
	);
}

const CAY_TO_CHUC = {
	divisions: [
		{
			id: "bp-1",
			name: "Khối Kinh doanh",
			moTa: "",
			position: 0,
			head: null,
			okrMo: 0,
			departments: [
				{
					id: "p1",
					name: "Chăm sóc khách hàng",
					moTa: "",
					position: 0,
					divisionId: "bp-1",
					head: null,
					stepCount: 0,
					okrMo: 0,
					people: [],
				},
				{
					id: "p2",
					name: "Hỗ trợ môi giới",
					moTa: "",
					position: 1,
					divisionId: "bp-1",
					head: null,
					stepCount: 0,
					okrMo: 0,
					people: [],
				},
			],
		},
	],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [],
	archived: { divisions: [], departments: [] },
	coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
} satisfies TreeOutput;

function thuTucMau<TVao, TRa>(duong: string, doc: (vao: TVao) => TRa) {
	return {
		queryKey: () => [duong],
		pathKey: () => [duong],
		queryOptions: (vao: TVao) => ({
			queryKey: [duong, vao],
			queryFn: async () => doc(vao),
		}),
	};
}

function ghiMau<TVao>(duong: GoiMay["duong"]) {
	return {
		mutationOptions: (chon?: {
			onSuccess?: (kq: { id: string; canhBao: string | null }) => void;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: TVao) => {
				goiMay.push({ duong, vao } as GoiMay);
				return { id: "moi-1", canhBao: null };
			},
		}),
	};
}

function khongGoi(duong: string) {
	return {
		mutationOptions: () => ({
			mutationKey: [duong],
			mutationFn: async () => {
				throw new Error(`${duong} khong duoc goi khi tao muc tieu`);
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			mau: thuTucMau("okr.mau", (vao: MauInput) => {
				hoiMau.push(vao);
				return { mau: locNhuMay(vao), quanTri: quanTriMau };
			}),
			program: thuTucMau("okr.program", () => ({
				objectiveCap: 5,
				krCap: 5,
				capMode: "canh-bao",
				scoreScale: "0-1",
				weightsOn: false,
				personalOn: false,
				version: 1,
				canManage: quanTriMau,
			})),
			luuMau: ghiMau<LuuMauVao>("okr.luuMau"),
			luuTruMau: ghiMau<{ id: string }>("okr.luuTruMau"),
			khoiPhucMau: ghiMau<{ id: string }>("okr.khoiPhucMau"),
			taoTuMau: ghiMau<TaoTuMauVao>("okr.taoTuMau"),
			createObjective: ghiMau<object>("okr.createObjective"),
			updateObjective: ghiMau<object>("okr.createObjective"),
			troLySanSang: thuTucMau("okr.troLySanSang", () => ({
				bat: false,
				lyDo: null,
			})),
			troLyDanhSach: thuTucMau("okr.troLyDanhSach", () => ({
				dong: [],
				dangSoan: false,
			})),
			troLyDeXuat: khongGoi("okr.troLyDeXuat"),
			troLyQuyet: khongGoi("okr.troLyQuyet"),
			updateKeyResult: khongGoi("okr.updateKeyResult"),
		},
		users: {
			list: thuTucMau("users.list", () => [
				{ id: "an", name: "Nguyễn An", email: "an@onehub.vn" },
			]),
			me: thuTucMau("users.me", () => ({
				id: "an",
				name: "Nguyễn An",
				email: "an@onehub.vn",
			})),
		},
		org: { tree: thuTucMau("org.tree", () => CAY_TO_CHUC) },
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ okr: async () => {} }),
}));

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

const { KrViecDanhSach, loiTheoNguoiLam, NguoiLamKhongConThanhVien } =
	await import("@/components/crm/record-sheet/kr-viec");
const { KhungKr, useDuongVe } = await import(
	"@/components/crm/record-sheet/kr-sheet"
);
const { SoViecKr } = await import("@/app/(app)/[slug]/okr/bang-kr");
type TrangThaiCanh =
	import("@/components/crm/record-sheet/kr-viec").TrangThaiCanh;
const { DetailSheet } = await import("@/components/detail-sheet");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrCanhKrMessages } = await import("@/lib/messages/okr-canh-kr");

const m = okrCanhKrMessages("vi");
const { okrGioiHanMessages } = await import("@/lib/messages/okr-gioi-han");

const BO_DU_LIEU = {
	"dang-tai": { loai: "dang-tai" },
	rong: { loai: "xong", canh: canh({ dong: [] }) },
	loi: { loai: "loi", thongDiep: "Máy chủ không trả lời", khongCo: false },
	"co-viec": { loai: "xong", canh: canh({}) },
	khoa: { loai: "xong", canh: canh({ khoa: true }) },
	"nguoi-roi": {
		loai: "xong",
		canh: canh({
			dong: [viec("v-3", { nguoiLam: LAN_ROI, tieuDe: "Soạn bộ câu hỏi" })],
		}),
	},
} satisfies Record<TenTrangThai, TrangThaiCanh>;

type Goi = {
	them: ReturnType<typeof mock>;
	sua: ReturnType<typeof mock>;
	danhDau: ReturnType<typeof mock>;
	go: ReturnType<typeof mock>;
	gan: ReturnType<typeof mock>;
	mo: ReturnType<typeof mock>;
	thuLai: ReturnType<typeof mock>;
	ve: ReturnType<typeof mock>;
};

function taoGoi(): Goi {
	return {
		them: mock(async () => {}),
		sua: mock(async () => {}),
		danhDau: mock(() => {}),
		go: mock(async () => {}),
		gan: mock(() => {}),
		mo: mock(() => {}),
		thuLai: mock(() => {}),
		ve: mock(() => {}),
	};
}

let dangMo: Root[] = [];

async function dung(man: ReactElement): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	await act(async () => {
		root.render(
			<LocaleProvider locale="vi">
				<TooltipProvider>{man}</TooltipProvider>
			</LocaleProvider>,
		);
	});
	return o;
}

function danhSach(duLieu: TrangThaiCanh, goi: Goi): ReactElement {
	return (
		<KrViecDanhSach
			duLieu={duLieu}
			nguoi={[{ value: "hung", label: "Trần Văn Hùng" }]}
			nguoiDangTai={false}
			nguoiMacDinh="hung"
			hanhDong={{
				onThem: goi.them,
				onSua: goi.sua,
				onDanhDau: goi.danhDau,
				onGo: goi.go,
				onGan: goi.gan,
				onMo: goi.mo,
				onThuLai: goi.thuLai,
				ve: { onVe: goi.ve, coMucTieuDuoi: true },
			}}
		/>
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

async function go(o: HTMLInputElement, chu: string): Promise<void> {
	const dat = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function phim(o: Element, key: string): Promise<void> {
	await act(async () => {
		o.dispatchEvent(
			new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
		);
	});
}

function motCai<T extends Element>(goc: ParentNode, chon: string): T {
	const tim = goc.querySelectorAll<T>(chon);
	if (tim.length !== 1)
		throw new Error(`can dung mot ${chon}, co ${tim.length}`);
	return tim[0] as T;
}

async function moDongNhap(o: HTMLElement): Promise<HTMLInputElement> {
	await bam(motCai(o, '[data-nut="them-viec"]'));
	return motCai<HTMLInputElement>(
		o,
		"[data-dong-nhap] input[name='tieu-de-viec']",
	);
}

afterEach(() => {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
});

describe("khung KR: sau trang thai cua danh sach viec", () => {
	test("ma tran 6 x 6: moi bo du lieu co dung dau trang thai cua no, nam dau kia vang", async () => {
		const lech: string[] = [];
		for (const bo of TRANG_THAI) {
			const o = await dung(danhSach(BO_DU_LIEU[bo], taoGoi()));
			for (const dau of TRANG_THAI) {
				const co = o.querySelectorAll(
					`[data-trang-thai="ST-khungkr-${dau}"]`,
				).length;
				const mong = dau === bo ? 1 : 0;
				if (co !== mong) lech.push(`${bo} x ${dau}: co ${co}, mong ${mong}`);
			}
			act(() => dangMo.pop()?.unmount());
			document.body.innerHTML = "";
		}
		expect(lech).toEqual([]);
	});

	test("dang-tai: khung xuong ban, khong dong viec nao", async () => {
		const o = await dung(danhSach(BO_DU_LIEU["dang-tai"], taoGoi()));
		expect(o.querySelector('[aria-busy="true"]')).not.toBeNull();
		expect(o.querySelector("[data-viec]")).toBeNull();
	});

	test("rong: Empty cau ghim va nut Them viec cho nguoi sua duoc", async () => {
		const o = await dung(danhSach(BO_DU_LIEU.rong, taoGoi()));
		expect(o.textContent).toContain(m.khung.rong.tieuDe);
		expect(o.querySelector('[data-nut="them-viec"]')).not.toBeNull();
	});

	test("loi: Empty cau ghim, bam Thu lai goi tai lai", async () => {
		const goi = taoGoi();
		const o = await dung(danhSach(BO_DU_LIEU.loi, goi));
		expect(o.textContent).toContain(m.khung.loi.tieuDe);
		await bam(motCai(o, '[data-nut="thu-lai"]'));
		expect(goi.thuLai).toHaveBeenCalledTimes(1);
	});

	test("co-viec: hai dong viec, mot dong sang kien co ten va trang thai; tieu de mang translate=no", async () => {
		const o = await dung(danhSach(BO_DU_LIEU["co-viec"], taoGoi()));
		expect(o.querySelectorAll("[data-viec]").length).toBe(2);
		const sk = motCai(o, '[data-sang-kien="sk-1"]');
		expect(sk.textContent).toContain("Công ty Minh Long");
		expect(sk.textContent).toContain(m.sangKien.trangThai["dang-chay"]);
		const tieuDe = motCai(o, '[data-viec="v-1"] [data-tieu-de-viec]');
		expect(tieuDe.getAttribute("translate")).toBe("no");
		expect(o.textContent).not.toContain(m.viec.daRoi);
		expect(o.textContent).not.toContain(m.khung.khoa);
	});

	test("khoa: dong chi doc, o danh dau khoa, nut ghi khoa", async () => {
		const o = await dung(danhSach(BO_DU_LIEU.khoa, taoGoi()));
		expect(o.textContent).toContain(m.khung.khoa);
		for (const oDanh of o.querySelectorAll('[data-viec] [role="checkbox"]'))
			expect(oDanh.hasAttribute("disabled")).toBe(true);
		expect(
			motCai<HTMLButtonElement>(o, '[data-nut="them-viec"]').disabled,
		).toBe(true);
		expect(
			o.querySelector('[data-viec] [data-nut="thao-tac-viec"]'),
		).toBeNull();
	});

	test("cho-duyet: viec, sang kien, bang chung khoa; o danh dau xong van mo", async () => {
		const o = await dung(
			danhSach({ loai: "xong", canh: canh({ choDuyet: true }) }, taoGoi()),
		);
		expect(o.textContent).toContain(okrGioiHanMessages("vi").canhKrChoDuyet);
		expect(o.textContent).not.toContain(m.khung.khoa);
		const oDanh = [...o.querySelectorAll('[data-viec] [role="checkbox"]')];
		expect(oDanh.length).toBeGreaterThan(0);
		for (const x of oDanh) expect(x.hasAttribute("disabled")).toBe(false);
		expect(
			motCai<HTMLButtonElement>(o, '[data-nut="them-viec"]').disabled,
		).toBe(true);
		expect(
			o.querySelector('[data-viec] [data-nut="thao-tac-viec"]'),
		).toBeNull();
	});

	test("nguoi-roi: ten nguoi lam kem «da roi»", async () => {
		const o = await dung(danhSach(BO_DU_LIEU["nguoi-roi"], taoGoi()));
		const d = motCai(o, '[data-viec="v-3"]');
		expect(d.textContent).toContain("Phạm Thị Lan");
		expect(d.textContent).toContain(m.viec.daRoi);
	});
});

describe("khung KR: dong nhap viec", () => {
	test("Enter voi tieu de mot ky tu: FieldError cau ghim, onThem khong goi, dong giu chu", async () => {
		const goi = taoGoi();
		const o = await dung(danhSach(BO_DU_LIEU["co-viec"], goi));
		const oNhap = await moDongNhap(o);
		await go(oNhap, "a");
		await phim(oNhap, "Enter");
		const loi = motCai(o, '[data-dong-nhap] [data-slot="field-error"]');
		expect(loi.textContent).toBe("Tiêu đề việc cần từ 2 đến 200 ký tự.");
		expect(goi.them).toHaveBeenCalledTimes(0);
		expect(motCai<HTMLInputElement>(o, "[data-dong-nhap] input").value).toBe(
			"a",
		);
	});

	test("Esc huy dong nhap, onThem khong goi", async () => {
		const goi = taoGoi();
		const o = await dung(danhSach(BO_DU_LIEU["co-viec"], goi));
		const oNhap = await moDongNhap(o);
		await go(oNhap, "Gọi lại 20 đối tác cũ");
		await phim(oNhap, "Escape");
		expect(o.querySelector("[data-dong-nhap]")).toBeNull();
		expect(goi.them).toHaveBeenCalledTimes(0);
	});

	test("Enter voi tieu de 200 ky tu lien: onThem nhan nguyen chuoi, nguoi lam mac dinh, han trong", async () => {
		const goi = taoGoi();
		const o = await dung(danhSach(BO_DU_LIEU["co-viec"], goi));
		const oNhap = await moDongNhap(o);
		const dai = "x".repeat(200);
		await go(oNhap, dai);
		await phim(oNhap, "Enter");
		expect(goi.them).toHaveBeenCalledTimes(1);
		expect(goi.them.mock.calls[0]).toEqual([
			{ tieuDe: dai, nguoiLamUserId: "hung", hanNgay: null },
		]);
	});

	test("may chu tu choi vi nguoi lam khong con la thanh vien: loi duoi o Nguoi lam, o tieu de khong loi, dong giu nguyen; loi khac van duoi tieu de", async () => {
		const loiO = (o: HTMLElement) => {
			const dong = motCai<HTMLElement>(o, "[data-dong-nhap]");
			const oCua = (chon: string) =>
				dong.querySelector(chon)?.closest('[data-slot="field"]') ?? null;
			return {
				nguoi:
					oCua('[role="combobox"]')?.querySelector('[data-slot="field-error"]')
						?.textContent ?? null,
				tieuDe:
					oCua("input[name='tieu-de-viec']")?.querySelector(
						'[data-slot="field-error"]',
					)?.textContent ?? null,
				conDong: o.querySelector("[data-dong-nhap]") !== null,
			};
		};
		const goi = taoGoi();
		goi.them.mockImplementation(async () => {
			throw new NguoiLamKhongConThanhVien();
		});
		const o = await dung(danhSach(BO_DU_LIEU["co-viec"], goi));
		await go(await moDongNhap(o), "Gọi lại 20 đối tác cũ");
		await phim(
			motCai(o, "[data-dong-nhap] input[name='tieu-de-viec']"),
			"Enter",
		);
		const khongConThanhVien = loiO(o);

		const goiKhac = taoGoi();
		goiKhac.them.mockImplementation(async () => {
			throw new Error("Kỳ đang chấm điểm — việc chỉ đọc.");
		});
		const o2 = await dung(danhSach(BO_DU_LIEU["co-viec"], goiKhac));
		await go(await moDongNhap(o2), "Gọi lại 20 đối tác cũ");
		await phim(
			motCai(o2, "[data-dong-nhap] input[name='tieu-de-viec']"),
			"Enter",
		);
		expect({ khongConThanhVien, loiKhac: loiO(o2) }).toEqual({
			khongConThanhVien: {
				nguoi: m.nhap.nguoiLamDaRoi,
				tieuDe: null,
				conDong: true,
			},
			loiKhac: {
				nguoi: null,
				tieuDe: "Kỳ đang chấm điểm — việc chỉ đọc.",
				conDong: true,
			},
		});
	});

	test("loiTheoNguoiLam: danh sach thanh vien doc lai khong con nguoi lam thi doi thanh loi nguoi lam; con thi giu loi goc; khong doc duoc thi giu loi goc", async () => {
		const goc = new Error("Máy chủ từ chối");
		const ket = async (ds: { id: string }[] | undefined) => {
			try {
				await loiTheoNguoiLam(goc, "lan", async () => ds);
				return "khong-nem";
			} catch (e) {
				return e instanceof NguoiLamKhongConThanhVien
					? "nguoi-lam"
					: e === goc
						? "goc"
						: String(e);
			}
		};
		expect({
			daRoi: await ket([{ id: "hung" }]),
			conDo: await ket([{ id: "hung" }, { id: "lan" }]),
			khongDoc: await ket(undefined),
		}).toEqual({ daRoi: "nguoi-lam", conDo: "goc", khongDoc: "goc" });
	});

	test("tieu de 200 ky tu lien khong tran: Item giu min-w-0 va wrap-anywhere, khong them class tai cho goi", async () => {
		const dai = "y".repeat(200);
		const o = await dung(
			danhSach(
				{
					loai: "xong",
					canh: canh({ dong: [viec("v-dai", { tieuDe: dai })] }),
				},
				taoGoi(),
			),
		);
		const tieuDe = motCai(o, '[data-viec="v-dai"] [data-tieu-de-viec]');
		expect(tieuDe.textContent).toBe(dai);
		const noiDung = tieuDe.closest('[data-slot="item-content"]');
		const tieuDeItem = tieuDe.closest('[data-slot="item-title"]');
		expect(noiDung?.classList.contains("min-w-0")).toBe(true);
		expect(tieuDeItem?.classList.contains("wrap-anywhere")).toBe(true);
		expect(tieuDeItem?.classList.contains("max-w-full")).toBe(true);
	});
});

describe("khung KR: tab theo kieu KR", () => {
	async function tabCua(kind: CanhKrOutput["kr"]["kind"]): Promise<string[]> {
		const du: TrangThaiCanh = {
			loai: "xong",
			canh: canh({
				kr: {
					id: "kr-1",
					title: "KR thử",
					kind,
					objectiveId: "mt-1",
					ownerName: "Trần Văn Hùng",
					xong: false,
				},
			}),
		};
		const o = await dung(
			<DetailSheet open onOpenChange={() => {}}>
				<KhungKr
					duLieu={du}
					tab="viec"
					onTab={() => {}}
					viec={<div />}
					bangChung={<div />}
				/>
			</DetailSheet>,
		);
		void o;
		return [...document.querySelectorAll('[role="tab"]')].map(
			(t) => t.textContent ?? "",
		);
	}

	test("KR tang toi: chi co tab «Viec va sang kien», khong co tab «Bang chung»", async () => {
		const tab = await tabCua("tang-toi");
		expect(tab).toEqual([m.khung.tabViec]);
	});

	test("KR moc: co ca hai tab", async () => {
		const tab = await tabCua("moc");
		expect(tab).toEqual([m.khung.tabViec, m.khung.tabBangChung]);
	});
});

const KHONG_CO: TrangThaiCanh = {
	loai: "loi",
	thongDiep: "Không có KR kr-ma",
	khongCo: true,
};

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(`khong toi: ${moTa}`);
}

function coUrl(duong: string, man: ReactElement) {
	let hienTai = new URLSearchParams(duong);
	return {
		url: () => hienTai,
		man: (
			<NuqsTestingAdapter
				hasMemory
				searchParams={duong}
				onUrlUpdate={(su) => {
					hienTai = new URLSearchParams(su.queryString);
				}}
			>
				{man}
			</NuqsTestingAdapter>
		),
	};
}

function KhongCoKr() {
	const ve = useDuongVe();
	const goi = taoGoi();
	return (
		<KrViecDanhSach
			duLieu={KHONG_CO}
			nguoi={[]}
			nguoiDangTai={false}
			nguoiMacDinh=""
			hanhDong={{
				onThem: goi.them,
				onSua: goi.sua,
				onDanhDau: goi.danhDau,
				onGo: goi.go,
				onGan: goi.gan,
				onMo: goi.mo,
				onThuLai: goi.thuLai,
				ve,
			}}
		/>
	);
}

describe("khung KR: ma KR khong ton tai luon co duong ve", () => {
	test("mo tran ?record=kr:<ma sai>: Empty loi co nut, bam thi dong khung KR ve trang dang mo", async () => {
		const san = coUrl("?record=kr:kr-ma", <KhongCoKr />);
		const o = await dung(san.man);
		const nut = motCai<HTMLButtonElement>(o, '[data-nut="ve-muc-tieu"]');
		expect(nut.textContent).toBe(m.khung.khongCo.dongKhung);
		await bam(nut);
		await cho(() => san.url().get("record") === null, "record bi xoa");
		expect(san.url().get("record")).toBeNull();
	});

	test("co khung muc tieu ben duoi: nut «Ve khung muc tieu» dua ve khung do", async () => {
		const san = coUrl("?record=objective:mt-1,kr:kr-ma", <KhongCoKr />);
		const o = await dung(san.man);
		const nut = motCai<HTMLButtonElement>(o, '[data-nut="ve-muc-tieu"]');
		expect(nut.textContent).toBe(m.khung.khongCo.veMucTieu);
		await bam(nut);
		await cho(
			() => san.url().get("record") === "objective:mt-1",
			"record ve objective:mt-1",
		);
		expect(san.url().get("record")).toBe("objective:mt-1");
	});
});

describe("khung KR: Esc o dong nhap trong DetailSheet that", () => {
	test("Esc huy dong nhap, khung van mo, khong hoi bo thay doi", async () => {
		const goi = taoGoi();
		const dongKhung = mock(() => {});
		const o = await dung(
			<DetailSheet open onOpenChange={dongKhung}>
				{danhSach(BO_DU_LIEU["co-viec"], goi)}
			</DetailSheet>,
		);
		void o;
		await bam(motCai(document, '[data-nut="them-viec"]'));
		const oNhap = motCai<HTMLInputElement>(
			document,
			"[data-dong-nhap] input[name='tieu-de-viec']",
		);
		await go(oNhap, "Gọi lại 20 đối tác cũ");
		await phim(oNhap, "Escape");
		expect(document.querySelector("[data-dong-nhap]")).toBeNull();
		expect(dongKhung).toHaveBeenCalledTimes(0);
		expect(document.querySelector('[role="alertdialog"]')).toBeNull();
		expect(
			document.querySelector('[data-slot="sheet-content"]'),
		).not.toBeNull();
		expect(goi.them).toHaveBeenCalledTimes(0);
	});

	test("kho 390 (Drawer): Esc huy dong nhap, khung van mo", async () => {
		const rong = window.innerWidth;
		window.innerWidth = 390;
		try {
			const goi = taoGoi();
			const dongKhung = mock(() => {});
			await dung(
				<DetailSheet open onOpenChange={dongKhung}>
					{danhSach(BO_DU_LIEU["co-viec"], goi)}
				</DetailSheet>,
			);
			await cho(
				() => document.querySelector('[data-slot="drawer-content"]') !== null,
				"drawer mo",
			);
			await bam(motCai(document, '[data-nut="them-viec"]'));
			const oNhap = motCai<HTMLInputElement>(
				document,
				"[data-dong-nhap] input[name='tieu-de-viec']",
			);
			await go(oNhap, "Gọi lại 20 đối tác cũ");
			await phim(oNhap, "Escape");
			expect(document.querySelector("[data-dong-nhap]")).toBeNull();
			expect(dongKhung).toHaveBeenCalledTimes(0);
			expect(document.querySelector('[role="alertdialog"]')).toBeNull();
		} finally {
			window.innerWidth = rong;
		}
	});

	test("doi chung: Esc ngoai dong nhap van dong khung nhu cu", async () => {
		const dongKhung = mock(() => {});
		await dung(
			<DetailSheet open onOpenChange={dongKhung}>
				{danhSach(BO_DU_LIEU["co-viec"], taoGoi())}
			</DetailSheet>,
		);
		await phim(motCai(document, '[data-nut="them-viec"]'), "Escape");
		expect(dongKhung).toHaveBeenCalledWith(false);
	});
});

describe("bang KR: o Viec «—» cua nguoi chi doc van mo khung KR", () => {
	test("KR khong viec, khong sang kien, nguoi khong sua duoc: nut «—» co ten, bam mo record=kr", async () => {
		const san = coUrl(
			"",
			<SoViecKr
				kr={{ id: "kr-3", title: "Bộ câu hỏi công bố" }}
				dem={{
					xong: 0,
					tong: 0,
					sangKien: 0,
					coBangChung: true,
					suaDuoc: false,
				}}
			/>,
		);
		const o = await dung(san.man);
		const nut = motCai<HTMLButtonElement>(o, '[data-mo-khung-kr="kr-3"]');
		expect(nut.textContent).toBe("—");
		expect(nut.getAttribute("aria-label")).toBe(
			"Mở việc và sáng kiến của KR Bộ câu hỏi công bố",
		);
		await bam(nut);
		await cho(() => san.url().get("record") === "kr:kr-3", "record=kr:kr-3");
		expect(san.url().get("record")).toBe("kr:kr-3");
	});
});

type DongTraoDoi = CommentsOutput["dong"][number];

const NGUOI_TRAO_DOI = [
	["an", "Nguyễn An"],
	["binh", "Trần Bình"],
	["chi", "Lê Chi"],
	["dung", "Phạm Dũng"],
	["giang", "Võ Giang"],
	["ha", "Đỗ Hà"],
	["khoa", "Bùi Khoa"],
] as const;

const LUA_CHON = [...NGUOI_TRAO_DOI, ["em", "Hồ Em"] as const].map(
	([value, label]) => ({
		value,
		label,
		hint: `${value}@onehub.vn`,
		keywords: [`${value}@onehub.vn`],
	}),
);

const { OSoanTraoDoi, DongThoiGian } = await import(
	"@/components/crm/record-sheet/objective-trao-doi"
);
type BinhLuanVao =
	import("@/components/crm/record-sheet/objective-trao-doi").BinhLuanVao;
type GhiNhanVao =
	import("@/components/crm/record-sheet/objective-trao-doi").GhiNhanVao;

type GoiSoan = {
	binhLuan: ReturnType<typeof mock>;
	ghiNhan: ReturnType<typeof mock>;
};

function taoGoiSoan(): GoiSoan {
	return {
		binhLuan: mock((_vao: BinhLuanVao, datLai: () => void) => datLai()),
		ghiNhan: mock((_vao: GhiNhanVao, datLai: () => void) => datLai()),
	};
}

function soan(goi: GoiSoan): ReactElement {
	return (
		<OSoanTraoDoi
			keyResults={[{ id: "kr-1", title: "Tăng 40 đối tác hoạt động" }]}
			thanhVien={LUA_CHON}
			thanhVienDangTai={false}
			toiId="giang"
			ghiNhanDuoc
			dangGui={false}
			loi={null}
			onGuiBinhLuan={goi.binhLuan}
			onGuiGhiNhan={goi.ghiNhan}
		/>
	);
}

async function goVung(o: HTMLTextAreaElement, chu: string): Promise<void> {
	const dat = Object.getOwnPropertyDescriptor(
		HTMLTextAreaElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function sangGhiNhan(o: HTMLElement): Promise<void> {
	const nut = [...o.querySelectorAll('[data-o-loai-tin] [role="radio"]')].find(
		(n) => n.textContent === m.ghiNhan.cheDo.ghiNhan,
	);
	if (!nut) throw new Error("khong co nut Ghi nhan o o soan");
	await bam(nut);
}

async function chonNguoiNhan(o: HTMLElement, ten: string): Promise<void> {
	await bam(motCai(o, "[data-o-nguoi-nhan]"));
	await cho(
		() => document.body.querySelectorAll("[cmdk-item]").length > 0,
		"danh sach nguoi nhan",
	);
	const muc = [...document.body.querySelectorAll("[cmdk-item]")].find((i) =>
		i.textContent?.includes(ten),
	);
	if (!muc) throw new Error(`khong thay ${ten}`);
	await bam(muc);
	await cho(
		() => document.body.querySelectorAll("[cmdk-item]").length === 0,
		"danh sach nguoi nhan dong",
	);
}

function nutGuiGhiNhan(o: HTMLElement): HTMLButtonElement {
	return motCai<HTMLButtonElement>(o, '[data-nut="gui-ghi-nhan"]');
}

describe("trao doi: o soan che do Ghi nhan", () => {
	test("chua co nguoi nhan: nut gui khoa du da co loi; chon mot nguoi thi mo", async () => {
		const goi = taoGoiSoan();
		const o = await dung(soan(goi));
		await sangGhiNhan(o);
		await goVung(
			motCai<HTMLTextAreaElement>(o, "[data-o-loi-nhan]"),
			"Cảm ơn hai bạn đã giữ ca tối.",
		);
		expect(nutGuiGhiNhan(o).disabled).toBe(true);
		await chonNguoiNhan(o, "Trần Bình");
		expect(nutGuiGhiNhan(o).disabled).toBe(false);
		expect(o.querySelector('[data-nut="gui-binh-luan"]')).toBeNull();
	});

	test("sau nguoi nhan: cau «Tối đa 5 người.» va nut khoa; bo mot nguoi thi het loi, nut mo", async () => {
		const goi = taoGoiSoan();
		const o = await dung(soan(goi));
		await sangGhiNhan(o);
		await goVung(
			motCai<HTMLTextAreaElement>(o, "[data-o-loi-nhan]"),
			"Cảm ơn cả nhóm.",
		);
		for (const [ma, ten] of NGUOI_TRAO_DOI)
			if (ma !== "giang") await chonNguoiNhan(o, ten);
		expect(o.querySelectorAll("[data-token-nguoi-nhan]").length).toBe(6);
		const loi = motCai(o, '[data-truong-nguoi-nhan] [data-slot="field-error"]');
		expect(loi.textContent).toBe("Tối đa 5 người.");
		expect(nutGuiGhiNhan(o).disabled).toBe(true);
		await bam(motCai(o, '[data-token-nguoi-nhan="ha"] [data-slot="button"]'));
		expect(
			o.querySelector('[data-truong-nguoi-nhan] [data-slot="field-error"]'),
		).toBeNull();
		expect(nutGuiGhiNhan(o).disabled).toBe(false);
		await bam(nutGuiGhiNhan(o));
		expect(goi.ghiNhan).toHaveBeenCalledTimes(1);
	});

	test("gui: onGuiGhiNhan nhan dung mang id theo thu tu chon, loi da cat, KR trong; xong thi o soan tro ve trong", async () => {
		const goi = taoGoiSoan();
		const o = await dung(soan(goi));
		await sangGhiNhan(o);
		await chonNguoiNhan(o, "Lê Chi");
		await chonNguoiNhan(o, "Nguyễn An");
		await chonNguoiNhan(o, "Bùi Khoa");
		await goVung(
			motCai<HTMLTextAreaElement>(o, "[data-o-loi-nhan]"),
			"  Cảm ơn ba bạn đã giữ ca tối suốt tuần cao điểm.  ",
		);
		await bam(nutGuiGhiNhan(o));
		expect(goi.binhLuan).toHaveBeenCalledTimes(0);
		expect(goi.ghiNhan.mock.calls.map((c) => c[0])).toEqual([
			{
				nguoiNhan: ["chi", "an", "khoa"],
				loiNhan: "Cảm ơn ba bạn đã giữ ca tối suốt tuần cao điểm.",
				keyResultId: null,
			},
		]);
		await cho(
			() => o.querySelectorAll("[data-token-nguoi-nhan]").length === 0,
			"nguoi nhan xoa sau khi gui",
		);
		expect(motCai<HTMLTextAreaElement>(o, "[data-o-loi-nhan]").value).toBe("");
	});

	test("nguoi nhan va loi mang translate=no; dem ky tu hien duoi o", async () => {
		const goi = taoGoiSoan();
		const o = await dung(soan(goi));
		await sangGhiNhan(o);
		await chonNguoiNhan(o, "Trần Bình");
		await goVung(motCai<HTMLTextAreaElement>(o, "[data-o-loi-nhan]"), "Cảm ơn");
		expect(
			motCai(o, '[data-token-nguoi-nhan="binh"]').getAttribute("translate"),
		).toBe("no");
		expect(motCai(o, "[data-o-loi-nhan]").getAttribute("translate")).toBe("no");
		expect(motCai(o, "[data-dem-loi-nhan]").textContent).toBe("6/500 ký tự.");
	});

	test("nguoi dang dung (toiId) khong co trong danh sach nguoi nhan", async () => {
		const o = await dung(soan(taoGoiSoan()));
		await sangGhiNhan(o);
		await bam(motCai(o, "[data-o-nguoi-nhan]"));
		await cho(
			() => document.body.querySelectorAll("[cmdk-item]").length > 0,
			"danh sach nguoi nhan",
		);
		const ten = [...document.body.querySelectorAll("[cmdk-item]")].map(
			(i) => i.textContent ?? "",
		);
		expect(ten.length).toBe(LUA_CHON.length - 1);
		expect(ten.some((t) => t.includes("Võ Giang"))).toBe(false);
	});

	test("muc tieu chua cong bo: khong co lua chon Ghi nhan", async () => {
		const o = await dung(
			<OSoanTraoDoi
				keyResults={[]}
				thanhVien={LUA_CHON}
				thanhVienDangTai={false}
				toiId={null}
				ghiNhanDuoc={false}
				dangGui={false}
				loi={null}
				onGuiBinhLuan={mock(() => {})}
				onGuiGhiNhan={mock(() => {})}
			/>,
		);
		expect(o.querySelector("[data-o-loai-tin]")).toBeNull();
		expect(o.querySelector('[data-nut="gui-binh-luan"]')).not.toBeNull();
	});
});

const BINH_LUAN_1: CommentsOutput["comments"][number] = {
	id: "bl-1",
	author: { id: "binh", name: "Trần Bình", email: "binh@onehub.vn" },
	keyResultId: null,
	keyResultTitle: null,
	body: "Tuần này ca tối thiếu người.",
	createdAt: "2026-09-20T02:00:00.000Z",
	mentions: [],
};

function ghiNhan(
	id: string,
	doi: Partial<Extract<DongTraoDoi, { loai: "ghi-nhan" }>>,
): DongTraoDoi {
	return {
		loai: "ghi-nhan",
		id,
		createdAt: "2026-09-21T02:00:00.000Z",
		nguoiGui: { id: "an", name: "Nguyễn An", email: "an@onehub.vn" },
		nguoiNhan: [
			{ id: "binh", name: "Trần Bình", email: "binh@onehub.vn" },
			{ id: "chi", name: "Lê Chi", email: "chi@onehub.vn" },
		],
		keyResultId: "kr-1",
		keyResultTitle: "Tăng 40 đối tác hoạt động",
		loiNhan: "Cảm ơn hai bạn đã giữ ca tối suốt tuần cao điểm.",
		goDuoc: true,
		...doi,
	};
}

function traoDoi(dong: DongTraoDoi[]): CommentsOutput {
	return { comments: [BINH_LUAN_1], dong };
}

describe("trao doi: dong ghi nhan xen giua binh luan", () => {
	test("dong theo thu tu cua `dong`; dong ghi nhan khac dong binh luan: data-ghi-nhan, bieu tuong, mot cau «X ghi nhận Y, Z», KR, loi translate=no", async () => {
		const o = await dung(
			<DongThoiGian
				duLieu={traoDoi([
					ghiNhan("gn-0", { createdAt: "2026-09-19T02:00:00.000Z" }),
					{ loai: "binh-luan", id: "bl-1", createdAt: BINH_LUAN_1.createdAt },
					ghiNhan("gn-1", {}),
				])}
				onGoGhiNhan={mock(async () => {})}
			/>,
		);
		const thuTu = [
			...o.querySelectorAll("[data-binh-luan], [data-ghi-nhan]"),
		].map(
			(d) =>
				d.getAttribute("data-ghi-nhan") ??
				`bl:${d.getAttribute("data-binh-luan")}`,
		);
		expect(thuTu).toEqual(["gn-0", "bl:bl-1", "gn-1"]);
		const d = motCai(o, '[data-ghi-nhan="gn-1"]');
		expect(d.hasAttribute("data-binh-luan")).toBe(false);
		expect(d.querySelector('[data-slot="item-media"] svg')).not.toBeNull();
		expect(motCai(d, '[data-slot="item-title"]').textContent).toBe(
			"Nguyễn An ghi nhận Trần Bình, Lê Chi",
		);
		for (const ten of d.querySelectorAll("[data-ten-nguoi]"))
			expect(ten.getAttribute("translate")).toBe("no");
		expect(motCai(d, "[data-chip-kr]").textContent).toBe(
			"Tăng 40 đối tác hoạt động",
		);
		const loi = motCai(d, "[data-loi-ghi-nhan]");
		expect(loi.textContent).toBe(
			"Cảm ơn hai bạn đã giữ ca tối suốt tuần cao điểm.",
		);
		expect(loi.getAttribute("translate")).toBe("no");
		expect(
			motCai(o, '[data-binh-luan="bl-1"]').querySelector("[data-loi-ghi-nhan]"),
		).toBeNull();
	});

	test("nguoi gui (goDuoc) thay «Gỡ ghi nhận», xac nhan thi onGoGhiNhan nhan dung id", async () => {
		const goGhiNhan = mock(async (_id: string) => {});
		const o = await dung(
			<DongThoiGian
				duLieu={traoDoi([ghiNhan("gn-1", { goDuoc: true })])}
				onGoGhiNhan={goGhiNhan}
			/>,
		);
		await bam(
			motCai(o, '[data-ghi-nhan="gn-1"] [data-nut="thao-tac-ghi-nhan"]'),
		);
		await cho(
			() => document.body.querySelector('[role="menuitem"]') !== null,
			"menu ghi nhan mo",
		);
		const go = [...document.body.querySelectorAll('[role="menuitem"]')].find(
			(i) => i.textContent === m.ghiNhan.go,
		);
		if (!go) throw new Error("khong co muc Go ghi nhan");
		expect(go.textContent).toBe("Gỡ ghi nhận");
		await bam(go);
		await cho(
			() => document.body.querySelector('[role="alertdialog"]') !== null,
			"hoi go",
		);
		const xacNhan = [
			...document.body.querySelectorAll('[role="alertdialog"] button'),
		].find((b) => b.textContent === m.ghiNhan.hoiGo.nut);
		if (!xacNhan) throw new Error("khong co nut xac nhan go");
		await bam(xacNhan);
		expect(goGhiNhan.mock.calls).toEqual([["gn-1"]]);
	});

	test("nguoi khac (goDuoc false) khong co menu go", async () => {
		const o = await dung(
			<DongThoiGian
				duLieu={traoDoi([ghiNhan("gn-1", { goDuoc: false })])}
				onGoGhiNhan={mock(async () => {})}
			/>,
		);
		expect(motCai(o, '[data-ghi-nhan="gn-1"]')).not.toBeNull();
		expect(o.querySelector('[data-nut="thao-tac-ghi-nhan"]')).toBeNull();
		expect(o.textContent).not.toContain(m.ghiNhan.go);
	});
});

const { KhoiMauOkr } = await import(
	"@/app/(app)/[slug]/settings/okr/khoi-mau-okr"
);
const { LyDoKhongQuyen, LY_DO_KHONG_QUYEN } = await import(
	"@/app/(app)/[slug]/settings/okr/trang-thai-cai-dat"
);
const { HopThoaiMucTieu } = await import(
	"@/app/(app)/[slug]/okr/hop-thoai-muc-tieu"
);
const { okrMessages } = await import("@/lib/messages/okr");
const mo = okrMessages("vi");

function krMau(
	title: string,
	kind: MauDong["noiDung"]["krs"][number]["kind"],
	unit: string,
): MauDong["noiDung"]["krs"][number] {
	return { title, kind, unit, startValue: null, targetValue: null };
}

function mauMot(
	id: string,
	ten: string,
	doi: Partial<Omit<MauDong, "noiDung">> & {
		krs?: MauDong["noiDung"]["krs"];
	} = {},
): MauDong {
	const krs = doi.krs ?? [
		krMau("Tăng khách quay lại", "tang-toi", "khách"),
		krMau("Giảm thời gian phản hồi", "giam-xuong", "giờ"),
	];
	return {
		id,
		ten,
		cap: "phong-ban",
		donViIds: [],
		soKr: krs.length,
		daDung: 0,
		luuTru: false,
		...doi,
		noiDung: {
			cauMucTieu: `Khách của ${ten} quay lại nhiều hơn`,
			loai: "cam-ket",
			krs,
		},
	};
}

const M_MOI = mauMot("m-moi", "Chăm sóc chung", { daDung: 3 });
const M_P1 = mauMot("m-p1", "Riêng P1", { donViIds: ["p1"] });
const M_LUU = mauMot("m-luu", "Mẫu cũ", { luuTru: true });
const M_BP = mauMot("m-bp", "Khối", { cap: "bo-phan", donViIds: ["bp-1"] });

function datLaiMay(mau: MauDong[], quanTri: boolean): void {
	khoMau = mau;
	quanTriMau = quanTri;
	hoiMau = [];
	goiMay = [];
}

function mayCo(man: ReactElement, thamSo = "") {
	let hienTai = new URLSearchParams(thamSo);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return {
		url: () => hienTai,
		man: (
			<NuqsTestingAdapter
				hasMemory
				searchParams={thamSo}
				onUrlUpdate={(su) => {
					hienTai = new URLSearchParams(su.queryString);
				}}
			>
				<QueryClientProvider client={client}>{man}</QueryClientProvider>
			</NuqsTestingAdapter>
		),
	};
}

const q = <T extends Element = HTMLElement>(chon: string) =>
	document.body.querySelector<T>(chon);
const tatCa = (chon: string) => [...document.body.querySelectorAll(chon)];

async function goO(o: Element | null, chu: string): Promise<void> {
	if (!(o instanceof HTMLInputElement || o instanceof HTMLTextAreaElement))
		throw new Error("khong phai o nhap");
	const dat = Object.getOwnPropertyDescriptor(
		o instanceof HTMLInputElement
			? HTMLInputElement.prototype
			: HTMLTextAreaElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function chonTrongSelect(trigger: Element, nhan: string): Promise<void> {
	await bam(trigger);
	await cho(() => tatCa('[role="option"]').length > 0, "select mo");
	const muc = tatCa('[role="option"]').find((o) => o.textContent === nhan);
	if (!muc) throw new Error(`select khong co ${nhan}`);
	await act(async () => {
		muc.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
				cancelable: true,
			}),
		);
	});
	await cho(() => tatCa('[role="option"]').length === 0, "select dong");
}

function nutTat(chon: string): boolean {
	const nut = q(chon);
	if (!(nut instanceof HTMLButtonElement)) throw new Error(`khong co ${chon}`);
	return nut.disabled;
}

async function moCaiDatMau(thamSo = "") {
	const san = mayCo(
		<>
			<LyDoKhongQuyen />
			<KhoiMauOkr />
		</>,
		thamSo,
	);
	await dung(san.man);
	await cho(
		() =>
			q("[data-mau]") !== null || q('[data-trang-thai="ST-mau-rong"]') !== null,
		"danh sach mau tai xong",
	);
	return san;
}

function krCuaSheet(i: number): HTMLElement {
	return motCai<HTMLElement>(document, `[data-sheet-mau] [data-kr-mau="${i}"]`);
}

describe("cai dat: khoi Mau OKR", () => {
	test("quan tri: moi mau mot dong kem cap, so don vi, so KR, so lan dung; okr.mau goi voi {} va ra ca mau da luu tru", async () => {
		datLaiMay([M_MOI, M_P1, M_LUU], true);
		await moCaiDatMau();
		expect(hoiMau).toEqual([{}]);
		const dong = tatCa("[data-mau]");
		expect(dong.map((d) => d.getAttribute("data-mau"))).toEqual([
			"m-moi",
			"m-p1",
			"m-luu",
		]);
		const moi = motCai(document, '[data-mau="m-moi"]');
		expect(moi.textContent).toContain("Phòng ban");
		expect(moi.textContent).toContain("Mọi phòng ban");
		expect(moi.textContent).toContain("2 KR");
		expect(moi.textContent).toContain("đã dùng 3 lần");
		expect(motCai(document, '[data-mau="m-p1"]').textContent).toContain(
			"1 đơn vị",
		);
		expect(motCai(document, '[data-mau="m-luu"]').textContent).toContain(
			m.mau.dong.luuTru,
		);
		expect(
			motCai(document, '[data-mau="m-moi"] [translate="no"]').textContent,
		).toBe("Chăm sóc chung");
		expect(q('[data-trang-thai="ST-mau-danh-sach"]')).not.toBeNull();
	});

	test("rong: Empty cau ghim va nut Them mau", async () => {
		datLaiMay([], true);
		await moCaiDatMau();
		const rong = motCai(document, '[data-trang-thai="ST-mau-rong"]');
		expect(rong.textContent).toContain(m.mau.the.rong.tieuDe);
	});

	test("Them mau: URL mang mau=moi, sheet mo; Luu mau khoa khi trong", async () => {
		datLaiMay([M_MOI], true);
		const san = await moCaiDatMau();
		await bam(motCai(document, '[data-nut="them-mau"]'));
		await cho(() => q("[data-sheet-mau]") !== null, "sheet mau mo");
		expect(san.url().get("mau")).toBe("moi");
		expect(nutTat('[data-nut="luu-mau"]')).toBe(true);
		const chan = motCai(
			document,
			'[data-sheet-mau] [data-slot="sheet-footer"]',
		);
		const nut = [...chan.querySelectorAll("button")].map((b) => b.textContent);
		expect(nut).toEqual([m.mau.sheet.huy, m.mau.sheet.luu]);
	});

	test("KR mau «giam xuong» khoi diem 4 dich 8: loi duoi dung KR do, Luu khoa; sua dich thi Luu goi luuMau dung khuon", async () => {
		datLaiMay([M_MOI], true);
		const san = await moCaiDatMau("?mau=moi");
		await cho(() => q("[data-sheet-mau]") !== null, "sheet mau mo");
		await goO(q("[data-o-ten-mau]"), "Chăm sóc khách");
		await goO(q("[data-o-cau-muc-tieu]"), "Khách quay lại nhiều hơn");
		await goO(
			krCuaSheet(0).querySelector("[data-o-ten-kr]"),
			"Tăng khách quay lại",
		);
		await bam(motCai(document, '[data-nut="them-kr-mau"]'));
		const kr2 = krCuaSheet(1);
		await goO(kr2.querySelector("[data-o-ten-kr]"), "Giảm thời gian phản hồi");
		const kieu = kr2.querySelector("[data-o-kieu-kr]");
		if (!kieu) throw new Error("khong co o kieu KR 2");
		await chonTrongSelect(kieu, mo.kieu["giam-xuong"]);
		await goO(krCuaSheet(1).querySelector("[data-o-khoi-diem]"), "4");
		await goO(krCuaSheet(1).querySelector("[data-o-dich]"), "8");

		const loi = motCai(krCuaSheet(1), '[data-slot="field-error"]');
		expect(loi.textContent).toBe(
			mo.hopThoai.soTheoKieu["dich-phai-nho-hon-khoi-diem"],
		);
		expect(krCuaSheet(0).querySelector('[data-slot="field-error"]')).toBeNull();
		expect(
			krCuaSheet(1)
				.querySelector("[data-o-dich]")
				?.getAttribute("aria-invalid"),
		).toBe("true");
		expect(nutTat('[data-nut="luu-mau"]')).toBe(true);
		expect(document.body.textContent).not.toContain("dich-phai");

		await goO(krCuaSheet(1).querySelector("[data-o-dich]"), "2");
		expect(krCuaSheet(1).querySelector('[data-slot="field-error"]')).toBeNull();
		expect(nutTat('[data-nut="luu-mau"]')).toBe(false);
		await bam(motCai(document, '[data-nut="luu-mau"]'));
		await cho(() => goiMay.length === 1, "luuMau duoc goi");
		expect(goiMay[0]).toEqual({
			duong: "okr.luuMau",
			vao: {
				id: null,
				ten: "Chăm sóc khách",
				cap: "phong-ban",
				donViIds: [],
				noiDung: {
					cauMucTieu: "Khách quay lại nhiều hơn",
					loai: "cam-ket",
					krs: [
						{
							title: "Tăng khách quay lại",
							kind: "tang-toi",
							unit: "",
							startValue: null,
							targetValue: null,
						},
						{
							title: "Giảm thời gian phản hồi",
							kind: "giam-xuong",
							unit: "",
							startValue: 4,
							targetValue: 2,
						},
					],
				},
			},
		});
		await cho(() => san.url().get("mau") === null, "sheet dong");
	});

	test("ten mau ngan: loi noi tran {min} {max} tu OKR_MAU", async () => {
		datLaiMay([], true);
		await moCaiDatMau("?mau=moi");
		await cho(() => q("[data-sheet-mau]") !== null, "sheet mau mo");
		await goO(q("[data-o-ten-mau]"), "ab");
		const { OKR_MAU } = await import("@crm/validation/okr-mau");
		expect(document.body.textContent).toContain(
			`Tên mẫu cần từ ${OKR_MAU.ten.min} đến ${OKR_MAU.ten.max} ký tự.`,
		);
	});

	test("ten KR mau va cau muc tieu hai ky tu: loi duoi dung o, noi tran tu khuon KR tay va muc tieu tay, Luu khoa; du ba ky tu thi het loi", async () => {
		datLaiMay([], true);
		await moCaiDatMau("?mau=moi");
		await cho(() => q("[data-sheet-mau]") !== null, "sheet mau mo");
		const { OKR_MAU } = await import("@crm/validation/okr-mau");
		const { krInput } = await import("@crm/validation/okr-kr");
		const { mucTieuInput } = await import("@crm/validation/okr-muc-tieu");
		await goO(q("[data-o-ten-mau]"), "Chăm sóc khách");
		await goO(q("[data-o-cau-muc-tieu]"), "Ab");
		await goO(krCuaSheet(0).querySelector("[data-o-ten-kr]"), "KH");
		const loiDuoi = () => ({
			cau: q("[data-loi-cau-muc-tieu]")?.textContent ?? null,
			kr: krCuaSheet(0).querySelector("[data-loi-ten-kr]")?.textContent ?? null,
			krInvalid:
				krCuaSheet(0)
					.querySelector("[data-o-ten-kr]")
					?.getAttribute("aria-invalid") ?? null,
			luuKhoa: nutTat('[data-nut="luu-mau"]'),
		});
		expect({
			kr: {
				min: krInput.shape.title.minLength,
				max: krInput.shape.title.maxLength,
			},
			cau: {
				min: mucTieuInput.shape.title.minLength,
				max: mucTieuInput.shape.title.maxLength,
			},
		}).toEqual({ kr: OKR_MAU.tenKr, cau: OKR_MAU.cauMucTieu });
		expect(loiDuoi()).toEqual({
			cau: `Câu mục tiêu cần từ ${OKR_MAU.cauMucTieu.min} đến ${OKR_MAU.cauMucTieu.max} ký tự.`,
			kr: `Tên KR cần từ ${OKR_MAU.tenKr.min} đến ${OKR_MAU.tenKr.max} ký tự.`,
			krInvalid: "true",
			luuKhoa: true,
		});
		expect(document.body.textContent).not.toContain("too_small");

		await goO(q("[data-o-cau-muc-tieu]"), "Abc");
		await goO(krCuaSheet(0).querySelector("[data-o-ten-kr]"), "KH1");
		expect(loiDuoi()).toEqual({
			cau: null,
			kr: null,
			krInvalid: null,
			luuKhoa: false,
		});
	});

	test("thanh vien thuong: danh sach doc duoc, Them mau va menu khoa, tro toi dong ly do duoi tieu de; ?mau=moi khong mo sheet", async () => {
		datLaiMay([M_MOI, M_P1], false);
		await moCaiDatMau("?mau=moi");
		await cho(() => q(`#${LY_DO_KHONG_QUYEN}`) !== null, "dong ly do");
		expect(tatCa("[data-mau]").length).toBe(2);
		expect(q(`#${LY_DO_KHONG_QUYEN}`)?.textContent).toBe(mo.caiDat.khongQuyen);
		const khoa = [
			motCai<HTMLButtonElement>(document, '[data-nut="them-mau"]'),
			...tatCa('[data-nut="thao-tac-mau"]'),
		];
		expect(khoa.length).toBe(3);
		for (const nut of khoa) {
			expect((nut as HTMLButtonElement).disabled).toBe(true);
			expect(nut.getAttribute("aria-describedby")).toBe(LY_DO_KHONG_QUYEN);
		}
		expect(q('[data-trang-thai="ST-mau-khong-quyen"]')).not.toBeNull();
		expect(q("[data-sheet-mau]")).toBeNull();
	});

	test("luu tru qua ConfirmDialog: luuTruMau nhan dung id", async () => {
		datLaiMay([M_MOI], true);
		await moCaiDatMau();
		await bam(motCai(document, '[data-mau="m-moi"] [data-nut="thao-tac-mau"]'));
		await cho(() => tatCa('[role="menuitem"]').length > 0, "menu mo");
		const muc = tatCa('[role="menuitem"]').find(
			(o) => o.textContent === m.mau.dong.luuTruNut,
		);
		if (!muc) throw new Error("khong co muc Luu tru");
		await bam(muc);
		await cho(() => q('[role="alertdialog"]') !== null, "hoi lai");
		expect(goiMay).toEqual([]);
		const xacNhan = [
			...(q('[role="alertdialog"]')?.querySelectorAll("button") ?? []),
		].find((b) => b.textContent === m.mau.hoiLuuTru.nut);
		if (!xacNhan) throw new Error("khong co nut Luu tru");
		await bam(xacNhan);
		await cho(() => goiMay.length === 1, "luuTruMau duoc goi");
		expect(goiMay[0]).toEqual({ duong: "okr.luuTruMau", vao: { id: "m-moi" } });
	});
});

async function moDatMucTieu(donVi: string) {
	const san = mayCo(
		<HopThoaiMucTieu
			yeuCau={{
				loai: "tao",
				cycleId: "q4",
				don: { loai: "pb", id: donVi },
				tenDon: donVi === "p1" ? "Chăm sóc khách hàng" : "Hỗ trợ môi giới",
			}}
			dong={() => {}}
		/>,
	);
	await dung(san.man);
	await cho(
		() => hoiMau.length > 0 && q('[data-nut="gui-muc-tieu"]') !== null,
		"hop thoai dat muc tieu va okr.mau",
	);
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
	return san;
}

async function chonMau(id: string): Promise<void> {
	await bam(motCai(document, '[data-nut="bat-dau-tu-mau"]'));
	await cho(() => q(`[data-chon-mau="${id}"]`) !== null, `mau ${id} hien`);
	await bam(motCai(document, `[data-chon-mau="${id}"]`));
	await cho(() => q("[data-form-tu-mau]") !== null, "form tu mau");
}

function krTuMau(i: number): HTMLElement {
	return motCai<HTMLElement>(document, `[data-kr-tu-mau="${i}"]`);
}

describe("dat muc tieu: bat dau tu mau", () => {
	test("khong mau nao hop don vi: khong co nut «Bat dau tu mau»; okr.mau hoi dung cap va don vi", async () => {
		datLaiMay([M_P1, M_LUU, M_BP], false);
		await moDatMucTieu("p2");
		expect(hoiMau.at(-1)).toEqual({ cap: "phong-ban", donViId: "p2" });
		expect(q('[data-nut="bat-dau-tu-mau"]')).toBeNull();
	});

	test("truong P1 thay hai mau con song, truong P2 thay mot: loc o may chu, man khong loc lai", async () => {
		datLaiMay([M_MOI, M_P1, M_LUU, M_BP], false);
		await moDatMucTieu("p1");
		await bam(motCai(document, '[data-nut="bat-dau-tu-mau"]'));
		await cho(() => tatCa("[data-chon-mau]").length > 0, "danh sach mau");
		expect(
			tatCa("[data-chon-mau]").map((x) => x.getAttribute("data-chon-mau")),
		).toEqual(["m-moi", "m-p1"]);
		for (const root of dangMo) act(() => root.unmount());
		dangMo = [];
		document.body.innerHTML = "";

		datLaiMay([M_MOI, M_P1, M_LUU, M_BP], false);
		await moDatMucTieu("p2");
		expect(hoiMau.at(-1)).toEqual({ cap: "phong-ban", donViId: "p2" });
		await bam(motCai(document, '[data-nut="bat-dau-tu-mau"]'));
		await cho(() => tatCa("[data-chon-mau]").length > 0, "danh sach mau");
		expect(
			tatCa("[data-chon-mau]").map((x) => x.getAttribute("data-chon-mau")),
		).toEqual(["m-moi"]);
	});

	test("chon mau: form dien san cau muc tieu va hai KR, o so trong", async () => {
		datLaiMay([M_MOI], false);
		await moDatMucTieu("p1");
		await chonMau("m-moi");
		const cau = motCai<HTMLInputElement>(document, "[data-o-cau-tu-mau]");
		expect(cau.value).toBe(M_MOI.noiDung.cauMucTieu);
		expect(cau.getAttribute("translate")).toBe("no");
		expect(tatCa("[data-kr-tu-mau]").length).toBe(2);
		for (const i of [0, 1]) {
			expect(
				krTuMau(i).querySelector<HTMLInputElement>("[data-o-khoi-diem]")?.value,
			).toBe("");
			expect(
				krTuMau(i).querySelector<HTMLInputElement>("[data-o-dich]")?.value,
			).toBe("");
		}
		expect(krTuMau(0).textContent).toContain("Tăng khách quay lại");
		expect(q('[data-trang-thai="ST-datmt-tu-mau"]')).not.toBeNull();
	});

	test("bam «Tao ban nhap» khi o so trong: loi duoi hai KR, o trong vien loi, taoTuMau khong goi", async () => {
		datLaiMay([M_MOI], false);
		await moDatMucTieu("p1");
		await chonMau("m-moi");
		await bam(motCai(document, '[data-nut="tao-tu-mau"]'));
		for (const i of [0, 1]) {
			expect(motCai(krTuMau(i), '[data-slot="field-error"]').textContent).toBe(
				m.mau.tuMau.thieuSo,
			);
			expect(
				krTuMau(i)
					.querySelector("[data-o-khoi-diem]")
					?.getAttribute("aria-invalid"),
			).toBe("true");
			expect(
				krTuMau(i).querySelector("[data-o-dich]")?.getAttribute("aria-invalid"),
			).toBe("true");
		}
		expect(goiMay).toEqual([]);
	});

	test("so trai kieu o KR giam xuong: cau dich cua kieu duoi dung KR, khong ma tho", async () => {
		datLaiMay([M_MOI], false);
		await moDatMucTieu("p1");
		await chonMau("m-moi");
		await goO(krTuMau(0).querySelector("[data-o-khoi-diem]"), "10");
		await goO(krTuMau(0).querySelector("[data-o-dich]"), "20");
		await goO(krTuMau(1).querySelector("[data-o-khoi-diem]"), "4");
		await goO(krTuMau(1).querySelector("[data-o-dich]"), "8");
		await bam(motCai(document, '[data-nut="tao-tu-mau"]'));
		expect(krTuMau(0).querySelector('[data-slot="field-error"]')).toBeNull();
		expect(motCai(krTuMau(1), '[data-slot="field-error"]').textContent).toBe(
			mo.hopThoai.soTheoKieu["dich-phai-nho-hon-khoi-diem"],
		);
		expect(goiMay).toEqual([]);
	});

	test("dien du: taoTuMau nhan mauId, don vi, nguoi phu trach va so cua tung KR", async () => {
		datLaiMay([M_MOI], false);
		await moDatMucTieu("p1");
		await chonMau("m-moi");
		await goO(krTuMau(0).querySelector("[data-o-khoi-diem]"), "10");
		await goO(krTuMau(0).querySelector("[data-o-dich]"), "20");
		await goO(krTuMau(1).querySelector("[data-o-khoi-diem]"), "8");
		await goO(krTuMau(1).querySelector("[data-o-dich]"), "2,5");
		await bam(motCai(document, '[data-nut="tao-tu-mau"]'));
		await cho(() => goiMay.length === 1, "taoTuMau duoc goi");
		expect(goiMay[0]).toEqual({
			duong: "okr.taoTuMau",
			vao: {
				mauId: "m-moi",
				cycleId: "q4",
				unit: { level: "phong-ban", departmentId: "p1" },
				ownerUserId: "an",
				krs: [
					{ startValue: 10, targetValue: 20, ownerUserId: "an" },
					{ startValue: 8, targetValue: 2.5, ownerUserId: "an" },
				],
			},
		});
	});
});
