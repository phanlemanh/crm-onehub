import {
	guiGhiNhanInput,
	themBangChungInput,
	themViecInput,
} from "@crm/validation/okr-canh-kr";
import { MA_CHI_SO, PHAM_VI_CHI_SO } from "@crm/validation/okr-chi-so";
import { OKR_PROGRAM_MAC_DINH } from "@crm/validation/okr-chuong-trinh";
import {
	MUC_HIEN_THI,
	OKR_HIEN_THI,
	traLaiInput,
} from "@crm/validation/okr-hien-thi";
import {
	gopYInput,
	KET_LUAN_CHON,
	ketLuanChuDe,
	ketLuanInput,
	moHoiYInput,
	NOI_MOI,
	niemPhongInput,
	noiBanTruoc,
	OKR_HOI_Y,
	soCauCuaNoi,
	taoChuDeInput,
} from "@crm/validation/okr-hoi-y";
import { goiYDiem } from "@crm/validation/okr-khep";
import { KIEU_KR, kiemSoTheoKieu, krInput } from "@crm/validation/okr-kr";
import { luuMauInput, mauNoiDung } from "@crm/validation/okr-mau";
import { TRANG_THAI_MUC_TIEU } from "@crm/validation/okr-muc-tieu";
import { crmHopKieu } from "@crm/validation/okr-nguon";
import { LOAI_TRANG } from "@crm/validation/tai-lieu";
import { TO_CHUC_TRAN } from "@crm/validation/to-chuc";
import { z } from "zod";
import { OKR_MAU } from "./cau-hinh";

const [CONG_KHAI, GIOI_HAN] = MUC_HIEN_THI;
const [NHAP, CHO_DUYET] = TRANG_THAI_MUC_TIEU;

const ma = z
	.string()
	.trim()
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "mã chỉ gồm chữ thường, số và gạch nối");

export const KICH_BAN = [
	"deu",
	"cham",
	"tut",
	"bo",
	"vuot",
	"ghi-chu",
	"chua-gui",
] as const;
export type KichBan = (typeof KICH_BAN)[number];

const moTaDonVi = z.string().trim().min(20).max(TO_CHUC_TRAN.moTa);

const nguoi = z.strictObject({
	ma,
	ten: z.string().trim().min(3).max(80),
	vai: z.enum(["admin", "member", "okr"]),
	phongBan: ma,
	chucDanh: z.string().trim().min(3).max(TO_CHUC_TRAN.chucDanh),
	quanLy: ma,
});

const boPhan = z.strictObject({
	ma,
	ten: z.string().trim().min(2),
	truong: ma,
	moTa: moTaDonVi,
});

const phongBan = z.strictObject({
	ma,
	ten: z.string().trim().min(2),
	boPhan: ma,
	truong: ma,
	moTa: moTaDonVi,
});

export const KICH_BAN_QUY3 = ["deu", "troi"] as const;
export type KichBanQuy3 = (typeof KICH_BAN_QUY3)[number];
export const TUAN_QUY3 = ["3", "6", "9", "13"] as const;
const phongBanLuuTru = z.strictObject({
	ma,
	ten: z.string().trim().min(2),
	boPhan: ma,
});

const duyetMau = z.strictObject({
	traLai: z
		.strictObject({ nguoi: ma, lyDo: traLaiInput.shape.lyDo })
		.optional(),
});

const nguonCrm = z.strictObject({
	chiSo: z.enum(MA_CHI_SO),
	phamVi: z.discriminatedUnion("kieu", [
		z.strictObject({ kieu: z.literal("toan-cong-ty") }),
		z.strictObject({ kieu: z.literal("bo-phan"), ma }),
		z.strictObject({ kieu: z.literal("phong-ban"), ma }),
		z.strictObject({ kieu: z.literal("nguoi"), ma }),
	]),
});

const kr = z.strictObject({
	ma,
	ten: z.string(),
	kieu: z.enum(KIEU_KR),
	chu: ma,
	khoi: z.number(),
	dich: z.number(),
	donVi: z.string().trim().max(24),
	kichBan: z.enum(KICH_BAN).optional(),
	kichBanQuy3: z.enum(KICH_BAN_QUY3).optional(),
	nguon: nguonCrm.optional(),
	ghiChu: z
		.partialRecord(
			z.enum(["1", "2", "3", "4", "5", "6", "9", "13"]),
			z.string().max(200),
		)
		.optional(),
	chot: z.number().optional(),
	diem: z.number().min(0).max(1).optional(),
	lyDo: z.string().trim().min(10).max(500).optional(),
});

const mucTieu = z.strictObject({
	ma,
	chuKy: z.enum(["nam", "quy3", "quy4"]),
	cap: z.enum(["onehub", "bo-phan", "phong-ban"]),
	donVi: ma.optional(),
	chu: ma,
	kieu: z.enum(["cam-ket", "tham-vong"]),
	trangThai: z
		.enum(["cong-bo", "nhap", "cho-duyet", "da-bo"])
		.default("cong-bo"),
	hienThi: z.enum(MUC_HIEN_THI).default("cong-khai"),
	nguoiXem: z.array(ma).max(OKR_HIEN_THI.nguoiXemToiDa).default([]),
	duyet: duyetMau.optional(),
	ten: z.string().trim().min(3).max(200),
	viSao: z.string().trim().max(500).default(""),
	canChinh: z
		.strictObject({ mucTieu: ma.optional(), kr: ma.optional() })
		.optional(),
	thamGia: z.array(ma).default([]),
	mangSangTu: ma.optional(),
	dieuHocDuoc: z.string().trim().min(10).max(2000).optional(),
	krs: z.array(kr).min(1),
});

const chuKy = z.strictObject({ ten: z.string().trim().min(2).max(80) });

const tuanQuy = z.number().int().min(1).max(OKR_MAU.tuan.tuanMoiQuy);
const tuanDaQua = z.number().int().min(1).max(OKR_MAU.tuan.soTuanCapNhat);

const viecMau = z.strictObject({
	ma,
	kr: ma,
	tieuDe: themViecInput.shape.tieuDe,
	nguoiLam: ma,
	hanTuan: tuanQuy.optional(),
	xongTuan: tuanDaQua.optional(),
});

const bangChungMau = z.strictObject({
	ma,
	kr: ma,
	url: themBangChungInput.shape.url,
	ghiChu: themBangChungInput.shape.ghiChu,
});

const ghiNhanMau = z.strictObject({
	ma,
	mucTieu: ma,
	kr: ma.optional(),
	tacGia: ma,
	nhan: guiGhiNhanInput.shape.nguoiNhan,
	loiNhan: guiGhiNhanInput.shape.loiNhan,
	tuan: tuanDaQua,
});

const mauOkr = z.strictObject({
	ma,
	ten: luuMauInput.shape.ten,
	cap: luuMauInput.shape.cap,
	donVi: z.array(ma),
	noiDung: mauNoiDung,
});

const canhKr = z.strictObject({
	viec: z.array(viecMau).min(1),
	bangChung: z.array(bangChungMau),
	ghiNhan: z.array(ghiNhanMau),
	mau: z.array(mauOkr),
	tuMau: z.array(z.strictObject({ mucTieu: ma, mau: ma })),
});

const taiLieu = z.strictObject({
	ma,
	ten: z.string().trim().min(3).max(160),
	loai: z.enum(LOAI_TRANG),
	chuTrang: ma,
	noiDung: z.string().min(200).max(20_000),
});

const yHoiYMau = z.strictObject({
	ma,
	tacGia: ma,
	gio: z.number().int().min(OKR_MAU.hoiY.niemPhongSauMoGio),
	noiDung: gopYInput.shape.noiDung,
	viSao: gopYInput.shape.viSao.default(""),
	doBangGi: gopYInput.shape.doBangGi.default(""),
});

const ketLuanMau = z.discriminatedUnion("loai", [
	z.strictObject({
		loai: z.literal(KET_LUAN_CHON),
		lyDo: ketLuanInput.shape.lyDo,
		cauMucTieu: ketLuanInput.shape.cauMucTieu,
		noi: noiBanTruoc,
	}),
	z.strictObject({
		loai: ketLuanChuDe.exclude([KET_LUAN_CHON]),
		lyDo: ketLuanInput.shape.lyDo,
	}),
]);

const chuDeMau = z.strictObject({
	ma,
	ten: taoChuDeInput.shape.ten,
	y: z.array(ma).min(1),
	ketLuan: ketLuanMau.optional(),
});

const hoiYMau = z.strictObject({
	nguoiChon: ma,
	cauHoi: moHoiYInput.shape.cauHoi,
	loiMo: moHoiYInput.shape.loiMo,
	soLieu: moHoiYInput.shape.soLieu,
	banTruoc: niemPhongInput.shape.cau.unwrap(),
	y: z.array(yHoiYMau).min(1),
	dongY: z.array(z.strictObject({ y: ma, nguoi: ma })),
	chuDe: z.array(chuDeMau),
	yLa: z.array(ma),
});

const boTho = z.strictObject({
	congTy: z.string(),
	chuKy: z.strictObject({ nam: chuKy, namKe: chuKy, quy3: chuKy, quy4: chuKy }),
	boPhan: z.array(boPhan).min(1),
	phongBan: z.array(phongBan).min(1),
	phongBanLuuTru: z.array(phongBanLuuTru).default([]),
	nguoi: z.array(nguoi).min(1),
	mucTieu: z.array(mucTieu).min(1),
	canhKr,
	taiLieu: z.array(taiLieu),
	hoiY: hoiYMau,
});

export type BoOkrMau = z.infer<typeof boTho>;
export type NguoiMau = BoOkrMau["nguoi"][number];
export type MucTieuMau = BoOkrMau["mucTieu"][number];
export type KrMau = MucTieuMau["krs"][number];
export type CanhKrMau = BoOkrMau["canhKr"];
export type TaiLieuMau = BoOkrMau["taiLieu"][number];
export type HoiYMau = BoOkrMau["hoiY"];
export type KetLuanHoiYMau = NonNullable<HoiYMau["chuDe"][number]["ketLuan"]>;

function trungMa(ds: { ma: string }[]): string | null {
	const thay = new Set<string>();
	for (const x of ds) {
		if (thay.has(x.ma)) return x.ma;
		thay.add(x.ma);
	}
	return null;
}

export const boOkrMau = boTho.superRefine((bo, ctx) => {
	const loi = (path: (string | number)[], message: string) =>
		ctx.addIssue({ code: "custom", path, message });
	const nguoiTheoMa = new Map(bo.nguoi.map((n) => [n.ma, n]));
	const pbTheoMa = new Map(bo.phongBan.map((p) => [p.ma, p]));
	const pbLuuTruTheoMa = new Map(bo.phongBanLuuTru.map((p) => [p.ma, p]));
	const bpTheoMa = new Map(bo.boPhan.map((b) => [b.ma, b]));
	const mtTheoMa = new Map(bo.mucTieu.map((m) => [m.ma, m]));
	const krTheoMa = new Map(
		bo.mucTieu.flatMap((m) => m.krs.map((k) => [k.ma, k] as const)),
	);

	const trungNguoi = trungMa(bo.nguoi);
	if (trungNguoi) loi(["nguoi"], `mã người trùng: ${trungNguoi}`);
	const trungDonVi = trungMa([
		...bo.boPhan,
		...bo.phongBan,
		...bo.phongBanLuuTru,
	]);
	if (trungDonVi) loi(["phongBan"], `mã đơn vị trùng: ${trungDonVi}`);
	const trungMt = trungMa(bo.mucTieu);
	if (trungMt) loi(["mucTieu"], `mã mục tiêu trùng: ${trungMt}`);
	const trungKr = trungMa(bo.mucTieu.flatMap((m) => m.krs));
	if (trungKr) loi(["mucTieu"], `mã KR trùng: ${trungKr}`);

	bo.nguoi.forEach((n, i) => {
		if (!pbTheoMa.has(n.phongBan))
			loi(["nguoi", i, "phongBan"], `không có phòng ban ${n.phongBan}`);
		if (!nguoiTheoMa.has(n.quanLy))
			loi(["nguoi", i, "quanLy"], `không có người ${n.quanLy}`);
		if (n.quanLy === n.ma)
			loi(["nguoi", i, "quanLy"], "quản lý phải là người khác");
	});
	bo.boPhan.forEach((b, i) => {
		if (!nguoiTheoMa.has(b.truong))
			loi(["boPhan", i, "truong"], `không có người ${b.truong}`);
	});
	bo.phongBanLuuTru.forEach((p, i) => {
		if (!bpTheoMa.has(p.boPhan))
			loi(["phongBanLuuTru", i, "boPhan"], `không có bộ phận ${p.boPhan}`);
	});
	bo.phongBan.forEach((p, i) => {
		if (!bpTheoMa.has(p.boPhan))
			loi(["phongBan", i, "boPhan"], `không có bộ phận ${p.boPhan}`);
		const truong = nguoiTheoMa.get(p.truong);
		if (!truong) loi(["phongBan", i, "truong"], `không có người ${p.truong}`);
		else if (truong.phongBan !== p.ma)
			loi(
				["phongBan", i, "truong"],
				`trưởng ${p.truong} không thuộc phòng ${p.ma} mà thuộc ${truong.phongBan}`,
			);
	});

	bo.mucTieu.forEach((m, i) => {
		if (!nguoiTheoMa.has(m.chu))
			loi(["mucTieu", i, "chu"], `không có người ${m.chu}`);
		if (m.cap === "onehub" && m.donVi !== undefined)
			loi(["mucTieu", i, "donVi"], "mục tiêu OneHub không có đơn vị");
		if (
			m.cap === "phong-ban" &&
			!pbTheoMa.has(m.donVi ?? "") &&
			!pbLuuTruTheoMa.has(m.donVi ?? "")
		)
			loi(["mucTieu", i, "donVi"], `không có phòng ban ${m.donVi}`);
		if (
			m.cap === "phong-ban" &&
			pbLuuTruTheoMa.has(m.donVi ?? "") &&
			m.chuKy !== "quy3"
		)
			loi(
				["mucTieu", i, "chuKy"],
				`phòng ban lưu trữ ${m.donVi} chỉ còn mục tiêu quý 3 đã khép`,
			);
		kiemHienThiVaDuyet(bo, m, i, loi);
		if (m.cap === "bo-phan" && !bpTheoMa.has(m.donVi ?? ""))
			loi(["mucTieu", i, "donVi"], `không có bộ phận ${m.donVi}`);
		if (m.krs.length > OKR_PROGRAM_MAC_DINH.krCap)
			loi(["mucTieu", i, "krs"], `vượt trần ${OKR_PROGRAM_MAC_DINH.krCap} KR`);
		for (const t of m.thamGia)
			if (!nguoiTheoMa.has(t))
				loi(["mucTieu", i, "thamGia"], `không có người ${t}`);
		if (m.canChinh) {
			const { mucTieu: dichMt, kr: dichKr } = m.canChinh;
			if ((dichMt === undefined) === (dichKr === undefined))
				loi(["mucTieu", i, "canChinh"], "căn chỉnh cần đúng một đích");
			if (dichMt && !mtTheoMa.has(dichMt))
				loi(
					["mucTieu", i, "canChinh", "mucTieu"],
					`không có mục tiêu ${dichMt}`,
				);
			if (dichKr && !krTheoMa.has(dichKr))
				loi(["mucTieu", i, "canChinh", "kr"], `không có KR ${dichKr}`);
		}
		if (m.mangSangTu) {
			const tu = mtTheoMa.get(m.mangSangTu);
			if (tu?.chuKy !== "quy3" || m.chuKy !== "quy4")
				loi(["mucTieu", i, "mangSangTu"], "mang sang chỉ từ quý 3 sang quý 4");
		}
		if (m.chuKy === "quy3" && m.trangThai === "cong-bo" && !m.dieuHocDuoc)
			loi(
				["mucTieu", i, "dieuHocDuoc"],
				"mục tiêu quý 3 đã khép cần điều học được",
			);
		m.krs.forEach((k, j) => {
			const path = ["mucTieu", i, "krs", j];
			if (!nguoiTheoMa.has(k.chu))
				loi([...path, "chu"], `không có người ${k.chu}`);
			const nhap = krInput.safeParse({
				title: k.ten,
				kind: k.kieu,
				ownerUserId: k.chu,
				startValue: k.khoi,
				targetValue: k.dich,
				currentValue: k.khoi,
				unit: k.donVi,
				dueOn: null,
				weight: 1,
			});
			if (!nhap.success)
				loi(path, `KR sai khuôn nhập: ${nhap.error.issues[0]?.message ?? ""}`);
			const soSai = kiemSoTheoKieu(k.kieu, k.khoi, k.dich);
			if (soSai) loi(path, `KR ${k.ma}: ${soSai}`);
			if (k.nguon && !crmHopKieu(k.kieu))
				loi(
					[...path, "nguon"],
					`KR ${k.ma} kiểu ${k.kieu} không lấy số từ CRM được`,
				);
			if (k.nguon && !PHAM_VI_CHI_SO.includes(k.nguon.phamVi.kieu))
				loi([...path, "nguon", "phamVi"], "phạm vi chỉ số không hợp lệ");
			if (k.nguon && "ma" in k.nguon.phamVi) {
				const maPv = k.nguon.phamVi.ma;
				const co =
					k.nguon.phamVi.kieu === "phong-ban"
						? pbTheoMa.has(maPv)
						: k.nguon.phamVi.kieu === "bo-phan"
							? bpTheoMa.has(maPv)
							: nguoiTheoMa.has(maPv);
				if (!co) loi([...path, "nguon", "phamVi"], `không có ${maPv}`);
			}
			if (k.kichBanQuy3 && m.chuKy !== "quy3")
				loi([...path, "kichBanQuy3"], "kịch bản quý 3 chỉ cho KR quý 3");
			if (
				k.kichBanQuy3 === "troi" &&
				TUAN_QUY3.filter((t) => (k.ghiChu?.[t] ?? "") !== "").length < 2
			)
				loi(
					[...path, "ghiChu"],
					`KR ${k.ma} trôi cần ghi chú ở ít nhất hai tuần ${TUAN_QUY3.join("/")}`,
				);
			if (m.chuKy === "quy3") {
				if (k.chot === undefined || k.diem === undefined)
					loi(path, `KR quý 3 ${k.ma} cần số chốt và điểm`);
				else if (goiYDiem(k.kieu, k.khoi, k.dich, k.chot) !== k.diem && !k.lyDo)
					loi([...path, "lyDo"], `KR ${k.ma} chấm khác gợi ý cần lý do`);
			} else if (!k.kichBan) {
				loi([...path, "kichBan"], `KR ${k.ma} cần kịch bản sáu tuần`);
			}
		});
	});

	for (const chuKy of ["nam", "quy3", "quy4"] as const) {
		const dem = new Map<string, number>();
		for (const m of bo.mucTieu.filter(
			(x) => x.chuKy === chuKy && x.trangThai !== "da-bo",
		)) {
			const khoa = `${m.cap}:${m.donVi ?? ""}`;
			dem.set(khoa, (dem.get(khoa) ?? 0) + 1);
		}
		for (const [khoa, so] of dem)
			if (so > OKR_PROGRAM_MAC_DINH.objectiveCap)
				loi(
					["mucTieu"],
					`${chuKy} ${khoa}: ${so} mục tiêu vượt trần ${OKR_PROGRAM_MAC_DINH.objectiveCap}`,
				);
	}

	const trungTaiLieu = trungMa(bo.taiLieu);
	if (trungTaiLieu) loi(["taiLieu"], `mã tài liệu trùng: ${trungTaiLieu}`);
	bo.taiLieu.forEach((t, i) => {
		if (!nguoiTheoMa.has(t.chuTrang))
			loi(["taiLieu", i, "chuTrang"], `không có người ${t.chuTrang}`);
	});

	kiemCanhKr(bo, loi);
	kiemHoiY(bo, loi);
});

type BaoLoi = (path: (string | number)[], message: string) => void;

function kiemHienThiVaDuyet(
	bo: BoOkrMau,
	m: MucTieuMau,
	i: number,
	loi: BaoLoi,
): void {
	const nguoi = new Set(bo.nguoi.map((n) => n.ma));
	if (m.hienThi === CONG_KHAI && m.nguoiXem.length > 0)
		loi(["mucTieu", i, "nguoiXem"], "mục tiêu công khai không có người xem");
	if (m.hienThi === GIOI_HAN) {
		if (m.nguoiXem.length === 0)
			loi(["mucTieu", i, "nguoiXem"], "mục tiêu giới hạn cần người xem có tên");
		if (m.canChinh)
			loi(["mucTieu", i, "canChinh"], "mục tiêu giới hạn không căn chỉnh được");
		const krCua = new Set(m.krs.map((k) => k.ma));
		const nhamVao = bo.mucTieu.find(
			(x) =>
				x.canChinh?.mucTieu === m.ma ||
				(x.canChinh?.kr !== undefined && krCua.has(x.canChinh.kr)),
		);
		if (nhamVao)
			loi(
				["mucTieu", i, "hienThi"],
				`mục tiêu ${nhamVao.ma} căn chỉnh vào mục tiêu giới hạn ${m.ma}`,
			);
	}
	if (new Set(m.nguoiXem).size !== m.nguoiXem.length)
		loi(["mucTieu", i, "nguoiXem"], "người xem trùng");
	for (const n of m.nguoiXem)
		if (!nguoi.has(n)) loi(["mucTieu", i, "nguoiXem"], `không có người ${n}`);

	if (m.trangThai === CHO_DUYET) {
		if (m.chuKy !== "quy4" || m.cap === "onehub")
			loi(
				["mucTieu", i, "trangThai"],
				"chờ duyệt chỉ ở mục tiêu quý 4 cấp bộ phận hay phòng ban",
			);
		if (!m.duyet || m.duyet.traLai)
			loi(
				["mucTieu", i, "duyet"],
				"mục tiêu chờ duyệt có vết gửi, không trả lại",
			);
	} else if (m.duyet) {
		if (m.trangThai !== NHAP)
			loi(
				["mucTieu", i, "duyet"],
				"vết duyệt chỉ ở mục tiêu nháp hay chờ duyệt",
			);
		if (m.duyet.traLai && !nguoi.has(m.duyet.traLai.nguoi))
			loi(
				["mucTieu", i, "duyet", "traLai", "nguoi"],
				`không có người ${m.duyet.traLai.nguoi}`,
			);
		if (m.duyet.traLai?.nguoi === m.chu)
			loi(
				["mucTieu", i, "duyet", "traLai", "nguoi"],
				"người trả lại không phải người gửi",
			);
	}
}

function kiemCanhKr(bo: BoOkrMau, loi: BaoLoi): void {
	const ck = bo.canhKr;
	const nguoi = new Set(bo.nguoi.map((n) => n.ma));
	const mtTheoMa = new Map(bo.mucTieu.map((m) => [m.ma, m]));
	const krTheoMa = new Map(
		bo.mucTieu.flatMap((m) => m.krs.map((k) => [k.ma, { k, m }] as const)),
	);
	const mauTheoMa = new Map(ck.mau.map((m) => [m.ma, m]));

	for (const [ten, ds] of [
		["viec", ck.viec],
		["bangChung", ck.bangChung],
		["ghiNhan", ck.ghiNhan],
		["mau", ck.mau],
	] as const) {
		const trung = trungMa(ds);
		if (trung) loi(["canhKr", ten], `mã trùng: ${trung}`);
	}
	const trungTuMau = trungMa(ck.tuMau.map((t) => ({ ma: t.mucTieu })));
	if (trungTuMau)
		loi(["canhKr", "tuMau"], `mục tiêu sinh từ mẫu hai lần: ${trungTuMau}`);

	ck.viec.forEach((v, i) => {
		const path = ["canhKr", "viec", i];
		const kr = krTheoMa.get(v.kr);
		if (!kr) loi([...path, "kr"], `không có KR ${v.kr}`);
		else if (kr.m.chuKy === "quy3" || kr.m.trangThai === "da-bo")
			loi([...path, "kr"], `KR ${v.kr} đang khoá ghi`);
		if (!nguoi.has(v.nguoiLam))
			loi([...path, "nguoiLam"], `không có người ${v.nguoiLam}`);
	});

	ck.bangChung.forEach((b, i) => {
		const path = ["canhKr", "bangChung", i];
		const kr = krTheoMa.get(b.kr);
		if (!kr) loi([...path, "kr"], `không có KR ${b.kr}`);
		else if (kr.k.kieu !== "moc")
			loi(
				[...path, "kr"],
				`bằng chứng chỉ cho KR mốc, ${b.kr} là ${kr.k.kieu}`,
			);
		else if (kr.m.trangThai !== "cong-bo")
			loi([...path, "kr"], `KR ${b.kr} thuộc mục tiêu chưa công bố`);
		const url = `https://docs.${OKR_MAU.mienThu}/${b.ma}`;
		if (b.url !== url) loi([...path, "url"], `đường dẫn mẫu phải là ${url}`);
	});

	ck.ghiNhan.forEach((g, i) => {
		const path = ["canhKr", "ghiNhan", i];
		const mt = mtTheoMa.get(g.mucTieu);
		if (!mt) loi([...path, "mucTieu"], `không có mục tiêu ${g.mucTieu}`);
		else if (mt.trangThai !== "cong-bo")
			loi([...path, "mucTieu"], `mục tiêu ${g.mucTieu} chưa công bố`);
		if (g.kr && krTheoMa.get(g.kr)?.m.ma !== g.mucTieu)
			loi([...path, "kr"], `KR ${g.kr} không thuộc mục tiêu ${g.mucTieu}`);
		if (!nguoi.has(g.tacGia))
			loi([...path, "tacGia"], `không có người ${g.tacGia}`);
		for (const n of g.nhan)
			if (!nguoi.has(n)) loi([...path, "nhan"], `không có người ${n}`);
		if (g.nhan.includes(g.tacGia))
			loi([...path, "nhan"], "không tự ghi nhận chính mình");
	});

	if (ck.mau.length > 0 && !bo.nguoi.some((n) => n.vai === "admin"))
		loi(["canhKr", "mau"], "mẫu OKR cần một người vai admin đứng tên");
	const boPhan = new Set(bo.boPhan.map((b) => b.ma));
	const phongBan = new Set(bo.phongBan.map((p) => p.ma));
	ck.mau.forEach((m, i) => {
		const co = m.cap === "bo-phan" ? boPhan : phongBan;
		for (const dv of m.donVi)
			if (!co.has(dv))
				loi(
					["canhKr", "mau", i, "donVi"],
					`không có đơn vị ${dv} ở cấp ${m.cap}`,
				);
	});

	ck.tuMau.forEach((t, i) => {
		const path = ["canhKr", "tuMau", i];
		const mau = mauTheoMa.get(t.mau);
		const mt = mtTheoMa.get(t.mucTieu);
		if (!mau) loi([...path, "mau"], `không có mẫu ${t.mau}`);
		if (!mt) loi([...path, "mucTieu"], `không có mục tiêu ${t.mucTieu}`);
		if (!mau || !mt) return;
		const sai = saiVoiMau(mt, mau);
		if (sai)
			loi(
				path,
				`mục tiêu ${t.mucTieu} không sinh được từ mẫu ${t.mau}: ${sai}`,
			);
	});
}

function kiemHoiY(bo: BoOkrMau, loi: BaoLoi): void {
	const h = bo.hoiY;
	const vai = new Map(bo.nguoi.map((n) => [n.ma, n.vai]));
	const cuaHoiY = OKR_MAU.hoiY;

	if (!vai.has(h.nguoiChon))
		loi(["hoiY", "nguoiChon"], `không có người ${h.nguoiChon}`);
	else if (vai.get(h.nguoiChon) !== "admin")
		loi(["hoiY", "nguoiChon"], `người chọn ${h.nguoiChon} phải là quản trị`);

	const yTheoMa = new Map<string, HoiYMau["y"][number]>();
	const soY = new Map<string, number>();
	h.y.forEach((y, i) => {
		const path = ["hoiY", "y", i];
		if (yTheoMa.has(y.ma)) loi([...path, "ma"], `mã ý trùng: ${y.ma}`);
		yTheoMa.set(y.ma, y);
		if (!vai.has(y.tacGia))
			loi([...path, "tacGia"], `không có người ${y.tacGia}`);
		else if (y.tacGia === h.nguoiChon)
			loi([...path, "tacGia"], "người chọn không góp ý");
		const so = (soY.get(y.tacGia) ?? 0) + 1;
		soY.set(y.tacGia, so);
		if (so > OKR_HOI_Y.yMoiNguoi)
			loi([...path, "tacGia"], `${y.tacGia} góp quá ${OKR_HOI_Y.yMoiNguoi} ý`);
		if (y.gio + cuaHoiY.dongYSauYGio >= cuaHoiY.hanSauMoGio)
			loi(
				[...path, "gio"],
				`ý phải góp trước giờ thứ ${cuaHoiY.hanSauMoGio - cuaHoiY.dongYSauYGio} sau khi mở, để còn chỗ cho lượt đồng ý trước hạn`,
			);
	});

	const cap = new Set<string>();
	h.dongY.forEach((d, i) => {
		const path = ["hoiY", "dongY", i];
		const y = yTheoMa.get(d.y);
		if (!y) loi([...path, "y"], `không có ý ${d.y}`);
		if (!vai.has(d.nguoi)) loi([...path, "nguoi"], `không có người ${d.nguoi}`);
		else if (d.nguoi === h.nguoiChon)
			loi(path, "người chọn không đồng ý ý nào");
		else if (y?.tacGia === d.nguoi)
			loi(path, `${d.nguoi} không đồng ý ý của chính mình`);
		const khoa = `${d.y}:${d.nguoi}`;
		if (cap.has(khoa)) loi(path, `lượt đồng ý trùng: ${khoa}`);
		cap.add(khoa);
	});

	const daGom = new Map<string, string>();
	const gom = (ma: string, noi: string, path: (string | number)[]) => {
		if (!yTheoMa.has(ma)) loi(path, `không có ý ${ma}`);
		else if (daGom.has(ma)) loi(path, `ý ${ma} đã nằm ở ${daGom.get(ma)}`);
		else daGom.set(ma, noi);
	};
	const trungChuDe = trungMa(h.chuDe);
	if (trungChuDe) loi(["hoiY", "chuDe"], `mã chủ đề trùng: ${trungChuDe}`);
	h.chuDe.forEach((c, i) => {
		const path = ["hoiY", "chuDe", i];
		c.y.forEach((ma, j) => {
			gom(ma, `chủ đề ${c.ma}`, [...path, "y", j]);
		});
		const kl = c.ketLuan;
		if (!kl) return;
		const chon = kl.loai === KET_LUAN_CHON;
		const r = ketLuanInput.safeParse({
			chuDeId: c.ma,
			ketLuan: kl.loai,
			lyDo: kl.lyDo,
			cauMucTieu: "cauMucTieu" in kl ? kl.cauMucTieu : "",
			noiBanTruoc: "noi" in kl ? kl.noi : null,
		});
		if (!r.success)
			for (const is of r.error.issues)
				loi(
					[
						...path,
						"ketLuan",
						...is.path.map((k) => (k === "noiBanTruoc" ? "noi" : String(k))),
					],
					is.message,
				);
		if (chon && "noi" in kl && kl.noi !== NOI_MOI) {
			const soCau = soCauCuaNoi(kl.noi);
			if (soCau !== null && soCau > h.banTruoc.length)
				loi(
					[...path, "ketLuan", "noi"],
					`nối ${kl.noi} nhưng chỉ có ${h.banTruoc.length} câu viết trước`,
				);
		}
	});
	h.yLa.forEach((ma, j) => {
		gom(ma, "ý lạ", ["hoiY", "yLa", j]);
	});
}

function saiVoiMau(
	mt: MucTieuMau,
	mau: BoOkrMau["canhKr"]["mau"][number],
): string | null {
	const nd = mau.noiDung;
	if (mt.chuKy !== "quy4" || mt.trangThai === "da-bo")
		return "chỉ mục tiêu quý 4 còn sống";
	if (mt.mangSangTu) return "mục tiêu mang sang không sinh từ mẫu";
	if (mt.cap !== mau.cap) return `cấp ${mt.cap} khác cấp mẫu ${mau.cap}`;
	if (mau.donVi.length > 0 && !mau.donVi.includes(mt.donVi ?? ""))
		return `đơn vị ${mt.donVi} ngoài danh sách của mẫu`;
	if (mt.ten !== nd.cauMucTieu) return "tên khác câu mục tiêu của mẫu";
	if (mt.kieu !== nd.loai) return "loại khác loại của mẫu";
	if (mt.krs.length !== nd.krs.length) return "số KR khác mẫu";
	const lech = mt.krs.findIndex((k, j) => {
		const m = nd.krs[j];
		return (
			!m ||
			k.nguon !== undefined ||
			k.ten !== m.title ||
			k.kieu !== m.kind ||
			k.donVi !== m.unit ||
			(m.startValue !== null && m.startValue !== k.khoi) ||
			(m.targetValue !== null && m.targetValue !== k.dich)
		);
	});
	return lech === -1 ? null : `KR thứ ${lech + 1} khác KR mẫu`;
}

export function docBoOkrMau(chu: string): BoOkrMau {
	let json: BoOkrMau;
	try {
		json = JSON.parse(chu);
	} catch (loi) {
		throw new Error(
			`không phải JSON: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
	}
	const r = boOkrMau.safeParse(json);
	if (r.success) return r.data;
	const dong = r.error.issues.map((i) => `${duongDan(i.path)}: ${i.message}`);
	throw new Error(dong.join("\n"));
}

export function duongDan(path: readonly PropertyKey[]): string {
	return path
		.map((p, i) =>
			Number.isInteger(p)
				? `[${String(p)}]`
				: `${i === 0 ? "" : "."}${String(p)}`,
		)
		.join("");
}
