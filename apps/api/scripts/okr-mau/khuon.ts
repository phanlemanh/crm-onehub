import { PHAM_VI_CHI_SO } from "@crm/validation/okr-chi-so";
import { OKR_PROGRAM_MAC_DINH } from "@crm/validation/okr-chuong-trinh";
import { goiYDiem } from "@crm/validation/okr-khep";
import { KIEU_KR, kiemSoTheoKieu, krInput } from "@crm/validation/okr-kr";
import { crmHopKieu } from "@crm/validation/okr-nguon";
import { MA_CHI_SO } from "@crm/validation/okr-chi-so";
import { z } from "zod";

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

const nguoi = z.strictObject({
	ma,
	ten: z.string().trim().min(3).max(80),
	vai: z.enum(["admin", "member", "okr"]),
	phongBan: ma,
});

const boPhan = z.strictObject({ ma, ten: z.string().trim().min(2), truong: ma });

const phongBan = z.strictObject({
	ma,
	ten: z.string().trim().min(2),
	boPhan: ma,
	truong: ma,
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
	nguon: nguonCrm.optional(),
	ghiChu: z.partialRecord(z.enum(["1", "2", "3", "4", "5", "6"]), z.string().max(200)).optional(),
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
	trangThai: z.enum(["cong-bo", "nhap", "da-bo"]).default("cong-bo"),
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

const boTho = z.strictObject({
	congTy: z.string(),
	chuKy: z.strictObject({ nam: chuKy, quy3: chuKy, quy4: chuKy }),
	boPhan: z.array(boPhan).min(1),
	phongBan: z.array(phongBan).min(1),
	nguoi: z.array(nguoi).min(1),
	mucTieu: z.array(mucTieu).min(1),
});

export type BoOkrMau = z.infer<typeof boTho>;
export type NguoiMau = BoOkrMau["nguoi"][number];
export type MucTieuMau = BoOkrMau["mucTieu"][number];
export type KrMau = MucTieuMau["krs"][number];

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
	const bpTheoMa = new Map(bo.boPhan.map((b) => [b.ma, b]));
	const mtTheoMa = new Map(bo.mucTieu.map((m) => [m.ma, m]));
	const krTheoMa = new Map(bo.mucTieu.flatMap((m) => m.krs.map((k) => [k.ma, k] as const)));

	const trungNguoi = trungMa(bo.nguoi);
	if (trungNguoi) loi(["nguoi"], `mã người trùng: ${trungNguoi}`);
	const trungDonVi = trungMa([...bo.boPhan, ...bo.phongBan]);
	if (trungDonVi) loi(["phongBan"], `mã đơn vị trùng: ${trungDonVi}`);
	const trungMt = trungMa(bo.mucTieu);
	if (trungMt) loi(["mucTieu"], `mã mục tiêu trùng: ${trungMt}`);
	const trungKr = trungMa(bo.mucTieu.flatMap((m) => m.krs));
	if (trungKr) loi(["mucTieu"], `mã KR trùng: ${trungKr}`);

	bo.nguoi.forEach((n, i) => {
		if (!pbTheoMa.has(n.phongBan))
			loi(["nguoi", i, "phongBan"], `không có phòng ban ${n.phongBan}`);
	});
	bo.boPhan.forEach((b, i) => {
		if (!nguoiTheoMa.has(b.truong))
			loi(["boPhan", i, "truong"], `không có người ${b.truong}`);
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
		if (!nguoiTheoMa.has(m.chu)) loi(["mucTieu", i, "chu"], `không có người ${m.chu}`);
		if (m.cap === "onehub" && m.donVi !== undefined)
			loi(["mucTieu", i, "donVi"], "mục tiêu OneHub không có đơn vị");
		if (m.cap === "phong-ban" && !pbTheoMa.has(m.donVi ?? ""))
			loi(["mucTieu", i, "donVi"], `không có phòng ban ${m.donVi}`);
		if (m.cap === "bo-phan" && !bpTheoMa.has(m.donVi ?? ""))
			loi(["mucTieu", i, "donVi"], `không có bộ phận ${m.donVi}`);
		if (m.krs.length > OKR_PROGRAM_MAC_DINH.krCap)
			loi(["mucTieu", i, "krs"], `vượt trần ${OKR_PROGRAM_MAC_DINH.krCap} KR`);
		for (const t of m.thamGia)
			if (!nguoiTheoMa.has(t)) loi(["mucTieu", i, "thamGia"], `không có người ${t}`);
		if (m.canChinh) {
			const { mucTieu: dichMt, kr: dichKr } = m.canChinh;
			if ((dichMt === undefined) === (dichKr === undefined))
				loi(["mucTieu", i, "canChinh"], "căn chỉnh cần đúng một đích");
			if (dichMt && !mtTheoMa.has(dichMt))
				loi(["mucTieu", i, "canChinh", "mucTieu"], `không có mục tiêu ${dichMt}`);
			if (dichKr && !krTheoMa.has(dichKr))
				loi(["mucTieu", i, "canChinh", "kr"], `không có KR ${dichKr}`);
		}
		if (m.mangSangTu) {
			const tu = mtTheoMa.get(m.mangSangTu);
			if (!tu || tu.chuKy !== "quy3" || m.chuKy !== "quy4")
				loi(["mucTieu", i, "mangSangTu"], "mang sang chỉ từ quý 3 sang quý 4");
		}
		if (m.chuKy === "quy3" && m.trangThai === "cong-bo" && !m.dieuHocDuoc)
			loi(["mucTieu", i, "dieuHocDuoc"], "mục tiêu quý 3 đã khép cần điều học được");
		m.krs.forEach((k, j) => {
			const path = ["mucTieu", i, "krs", j];
			if (!nguoiTheoMa.has(k.chu)) loi([...path, "chu"], `không có người ${k.chu}`);
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
				loi([...path, "nguon"], `KR ${k.ma} kiểu ${k.kieu} không lấy số từ CRM được`);
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
		for (const m of bo.mucTieu.filter((x) => x.chuKy === chuKy && x.trangThai !== "da-bo")) {
			const khoa = `${m.cap}:${m.donVi ?? ""}`;
			dem.set(khoa, (dem.get(khoa) ?? 0) + 1);
		}
		for (const [khoa, so] of dem)
			if (so > OKR_PROGRAM_MAC_DINH.objectiveCap)
				loi(["mucTieu"], `${chuKy} ${khoa}: ${so} mục tiêu vượt trần ${OKR_PROGRAM_MAC_DINH.objectiveCap}`);
	}
});

export function docBoOkrMau(json: unknown): BoOkrMau {
	const r = boOkrMau.safeParse(json);
	if (r.success) return r.data;
	const dong = r.error.issues.map((i) => `${duongDan(i.path)}: ${i.message}`);
	throw new Error(dong.join("\n"));
}

export function duongDan(path: readonly PropertyKey[]): string {
	return path
		.map((p, i) => (typeof p === "number" ? `[${p}]` : `${i === 0 ? "" : "."}${String(p)}`))
		.join("");
}
