import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "@crm/ui/lib/locale";
import { chuanHoa } from "@crm/validation/okr-kiem";
import type { CuocDangSoan } from "@/app/(app)/[slug]/okr/soan/dung-cuoc-soan";
import {
	type CuocSoanOutput,
	commentsOutput,
	type DongSoanOutput,
	soanSanSangOutput,
	vetOutput,
} from "../../api/src/okr/okr.contracts";
import {
	bamChuot,
	chiTietTu,
	cho,
	dsTroLy,
	dung,
	HUNG,
	kho,
	kiemCa,
	MT_ID,
	mtSheet,
	okrGopYMessages,
	qs,
	qsa,
	thaoHet,
} from "./khung-gop-y-dung-cho";
import { KHUNG, MOC_GIO } from "./khung-gop-y-luot-2";

const { BangVet } = await import("@/app/(app)/[slug]/okr/bang-vet");
const { DongGhiNhan } = await import(
	"@/components/crm/record-sheet/objective-ghi-nhan"
);
const { DongThoiGian } = await import(
	"@/components/crm/record-sheet/objective-trao-doi"
);
const { NutSoan } = await import("@/app/(app)/[slug]/okr/soan/nut-soan");
const { DanhSachCuoc } = await import(
	"@/app/(app)/[slug]/okr/soan/danh-sach-cuoc"
);
const { BanNhap } = await import("@/app/(app)/[slug]/okr/soan/bang-nhap");
const { cayNhap, demDong } = await import(
	"@/app/(app)/[slug]/okr/soan/luat-ban-nhap"
);
const { okrSoanMessages } = await import("@/lib/messages/okr-soan");

type Phan = "ngay-gio" | "ngay" | "ngay-thang" | "gio";
type BeMat =
	| "nhom-kara"
	| "bang-vet"
	| "ghi-nhan"
	| "trao-doi"
	| "nut-soan"
	| "danh-sach-cuoc"
	| "bang-nhap";
const MAU = JSON.parse(
	readFileSync(
		join(
			import.meta.dir,
			"../../../_acceptance/kara-gop-y-luot-2/rang/ngay-gio-mau.json",
		),
		"utf8",
	),
) as {
	vi: Record<Phan, string>;
	en: Record<Phan, string>;
	"be-mat": Record<BeMat, Phan>;
};

const CUOC_SOAN: CuocSoanOutput = {
	id: "cuoc-1",
	cycleId: "q1",
	level: "phong-ban",
	divisionId: null,
	departmentId: "pb-1",
	tenDonVi: "Kinh doanh miền Bắc",
	tenChuKy: "Quý 1 · 2027",
	nguoiMo: { id: "hai", name: "Trần Minh Hải" },
	sessionId: "phien-1",
	nac: "bat",
	trangThai: "dang",
	soLuot: 2,
	tranLuot: 12,
	moLuc: MOC_GIO,
	duaVaoLuc: null,
	soDongNhan: 2,
	soDongTong: 5,
};
const DV_SOAN = {
	cycleId: "q1",
	level: "phong-ban",
	divisionId: null,
	departmentId: "pb-1",
} as const;
const DONG_MT: DongSoanOutput = {
	viSao: "Vì kỳ trước hụt.",
	maLoai: null,
	giaTriCuoi: null,
	taoRaId: null,
	id: "1",
	khoa: "m1",
	khoaDong: `muc-tieu-moi:${chuanHoa("Giữ khách lớn miền Bắc")}`,
	loai: "muc-tieu-moi",
	ten: "Giữ khách lớn miền Bắc",
	viSaoLucNay: "Đầu quý là mùa ký lại.",
	loaiMucTieu: "cam-ket",
	trangThai: "cho",
};
const S_GIA = {
	cay: cayNhap([DONG_MT]),
	gioNopCuoi: Date.parse(MOC_GIO),
	dangTraLoi: false,
	so: new Map(),
	thieu: [],
	nhan: new Map(),
	truocTen: new Map(),
	dongNoi: null,
	nhomDaNhan: new Map(),
	dem: { soMucTieu: 1, soKr: 0 },
	quyet: { isPending: false, variables: undefined, mutate: () => {} },
	duaVao: { isPending: false, data: undefined, error: null, mutate: () => {} },
	datSo: () => {},
	guiDuaVao: () => {},
	themQuyetBang: () => {},
	noiDong: () => {},
	ghiNhom: () => {},
	cuonToiDong: () => {},
	datHoiVeDong: () => {},
} as unknown as CuocDangSoan;

const chuCua = (sel: string) => qs(sel)?.textContent ?? "";
const coChua = (chu: string, mong: string) => (chu.includes(mong) ? mong : chu);

type DungBeMat = (locale: Locale, mau: string) => Promise<[string, string]>;

const DUNG = {
	"nhom-kara": async (locale, mau) => {
		kho.chiTiet = () => chiTietTu(mtSheet({ soGopYCho: 0 }));
		kho.troLy = () => dsTroLy([], { docLuc: MOC_GIO });
		await dung(KHUNG(), `?record=objective:${MT_ID}`, locale);
		await cho(() => qs("[data-nhom-kara=rong]") !== null, "vung rong");
		return [
			chuCua("[data-nhom-kara=rong] [data-slot=empty-description]"),
			okrGopYMessages(locale).vung.rongMoTa(mau),
		];
	},
	"bang-vet": async (locale, mau) => {
		const vet = vetOutput.parse({
			id: "v1",
			at: MOC_GIO,
			actor: HUNG,
			action: "tao",
			keyResultId: null,
			before: null,
			after: null,
			note: null,
		});
		await dung(
			<BangVet alignments={[]} keyResults={[]} trail={[vet]} />,
			"",
			locale,
		);
		await cho(() => qsa("td").length > 0, "bang vet");
		const o = qsa("td").map((td) => td.textContent ?? "");
		return [o.includes(mau) ? mau : o.join(" | "), mau];
	},
	"ghi-nhan": async (locale, mau) => {
		await dung(
			<DongGhiNhan
				ghiNhan={{
					loai: "ghi-nhan",
					id: "g1",
					createdAt: MOC_GIO,
					nguoiGui: HUNG,
					nguoiNhan: [HUNG],
					keyResultId: null,
					keyResultTitle: null,
					loiNhan: "Cảm ơn",
					goDuoc: false,
				}}
				onGo={() => {}}
			/>,
			"",
			locale,
		);
		return [chuCua("[data-ghi-nhan] [data-slot=item-description]"), mau];
	},
	"trao-doi": async (locale, mau) => {
		const duLieu = commentsOutput.parse({
			comments: [
				{
					id: "c1",
					author: HUNG,
					keyResultId: null,
					keyResultTitle: null,
					body: "Ổn",
					createdAt: MOC_GIO,
					mentions: [],
				},
			],
			dong: [{ loai: "binh-luan", id: "c1", createdAt: MOC_GIO }],
		});
		await dung(
			<DongThoiGian duLieu={duLieu} onGoGhiNhan={async () => {}} />,
			"",
			locale,
		);
		return [chuCua("[data-binh-luan] [data-slot=item-description]"), mau];
	},
	"nut-soan": async (locale, mau) => {
		kho.rieng.set("okr.soanSanSang", () =>
			soanSanSangOutput.parse({
				bat: true,
				nac: "bat",
				cuocDang: CUOC_SOAN,
				soCuocDaDung: 1,
				tranCuoc: 3,
				thieuBoiCanh: false,
			}),
		);
		await dung(
			<NutSoan
				canEdit
				cauNoi
				cycleId="q1"
				don={{ loai: "pb", id: "pb-1" }}
				phaKy="lap-ke-hoach"
				quanTri={false}
			/>,
			"",
			locale,
		);
		await cho(
			() => qs('[data-nut="thong-tin-soan"]') !== null,
			"nut thong tin soan",
		);
		await bamChuot(qs('[data-nut="thong-tin-soan"]') ?? document.body);
		await cho(() => qs("[data-thong-tin-soan]") !== null, "thong tin soan");
		const mong = okrSoanMessages(locale).nut.tiepMoTa(mau, "2", "3");
		return [coChua(chuCua("[data-thong-tin-soan]"), mong), mong];
	},
	"danh-sach-cuoc": async (locale, mau) => {
		kho.rieng.set("okr.soanDanhSachCuoc", () => ({
			cuoc: [CUOC_SOAN],
			soCuocDaDung: 1,
			tranCuoc: 3,
		}));
		await dung(
			<DanhSachCuoc donVi={DV_SOAN} dong={() => {}} mo={() => {}} />,
			"",
			locale,
		);
		await cho(() => qs("[data-cuoc-id]") !== null, "danh sach cuoc");
		return [chuCua("[data-cuoc-id] [data-slot=item-title]"), mau];
	},
	"bang-nhap": async (locale, mau) => {
		await dung(
			<BanNhap
				cuoc={{ ...CUOC_SOAN, trangThai: "bo" }}
				hoi={() => {}}
				s={S_GIA}
				veMoc={() => {}}
			/>,
			"",
			locale,
		);
		await cho(
			() => qs('[data-slot="kara-artifact-header"]') !== null,
			"dau ban nhap",
		);
		const mong = okrSoanMessages(locale).dong.meta(
			String(demDong(S_GIA.cay)),
			mau,
		);
		return [coChua(chuCua('[data-slot="kara-artifact-header"]'), mong), mong];
	},
} satisfies Record<BeMat, DungBeMat>;

describe("k3-ngay-gio", () => {
	test("k3-ngay-gio bay be mat x hai tieng cung mot khuon ngay gio, gio Viet Nam", async () => {
		let soO = 0;
		for (const locale of ["vi", "en"] as const)
			for (const beMat of Object.keys(DUNG) as BeMat[]) {
				const mau = MAU[locale][MAU["be-mat"][beMat]];
				const [thuc, mong] = await DUNG[beMat](locale, mau);
				kiemCa(
					{ chu: thuc },
					{ chu: mong },
					() => `${beMat}/${locale} lech khuon ngay gio`,
				);
				soO += 1;
				await thaoHet();
				kho.rieng.clear();
			}
		expect(soO).toBe(14);
		console.log(`k3-ngay-gio: ${soO}/14 o`);
	}, 60_000);
});
