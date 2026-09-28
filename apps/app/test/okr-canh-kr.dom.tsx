import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { CanhKrOutput } from "../../api/src/okr/okr-canh-kr.contracts";

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

const { KrViecDanhSach } = await import(
	"@/components/crm/record-sheet/kr-viec"
);
const { KhungKr } = await import("@/components/crm/record-sheet/kr-sheet");
type TrangThaiCanh =
	import("@/components/crm/record-sheet/kr-viec").TrangThaiCanh;
const { DetailSheet } = await import("@/components/detail-sheet");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrCanhKrMessages } = await import("@/lib/messages/okr-canh-kr");

const m = okrCanhKrMessages("vi");

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
