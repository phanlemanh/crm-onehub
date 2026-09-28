import { afterEach, describe, expect, mock, test } from "bun:test";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { CommentsOutput } from "../../api/src/okr/okr.contracts";
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
