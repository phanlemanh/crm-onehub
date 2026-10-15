import { type TinhTrang, tinhTrang } from "@crm/validation/okr-muc-tieu";
import type { CayDuLieu, MucTieu } from "../kieu";
import { type DonChonOkr, khoaDon } from "../okr-search-params";
import { nhipCua } from "../tien-do-kr";

/* Logic thuần của bảng đơn vị (DH2): lọc nhanh, sắp xếp, lựa chọn của ô chọn
   đơn vị và con trực tiếp. Tách khỏi giao diện để bài kiểm chạy không cần DOM. */

export const LOC_NHANH = ["can-ban", "chua-gop"] as const;
export type LocNhanh = (typeof LOC_NHANH)[number];

/** «N KR chậm» dưới tên mục tiêu: KR đang chậm nhịp hoặc trượt (mốc không tính). */
export function soKrCham(mt: MucTieu): number {
	return mt.keyResults.filter((kr) => {
		const nhip = nhipCua(kr.progress, mt.expected, mt.kind, kr.kind === "moc");
		return nhip === "cham-nhip" || nhip === "truot";
	}).length;
}

/** «Cần bàn» dùng đúng phép đếm «N KR chậm» (Hỏi-1). */
export function canBan(mt: MucTieu): boolean {
	return soKrCham(mt) > 0;
}

/** «Chưa góp vào đâu»: không ở cấp công ty và không góp vào mục tiêu hay KR nào. */
export function chuaGop(mt: MucTieu): boolean {
	return mt.level !== "onehub" && mt.alignments.length === 0;
}

const KHOP_LOC = {
	"can-ban": canBan,
	"chua-gop": chuaGop,
} satisfies Record<LocNhanh, (mt: MucTieu) => boolean>;

export function locNhanh(ds: MucTieu[], loc: LocNhanh | null): MucTieu[] {
	return loc === null ? ds : ds.filter(KHOP_LOC[loc]);
}

export function demLocNhanh(ds: MucTieu[]) {
	return {
		"can-ban": ds.filter(canBan).length,
		"chua-gop": ds.filter(chuaGop).length,
	} satisfies Record<LocNhanh, number>;
}

/** «detail» là mục «Dòng có chi tiết lên trước» DataTable tự thêm khi có dòng mở rộng. */
export const COT_SAP = ["tien-do", "tinh-trang", "detail"] as const;
export type CotSap = (typeof COT_SAP)[number];
export const CHIEU_SAP = ["asc", "desc"] as const;
export type ChieuSap = (typeof CHIEU_SAP)[number];

/** Bậc tình trạng khi sắp xếp: trượt → chậm nhịp → đúng nhịp → chưa có kỳ vọng. */
const BAC_TINH_TRANG = {
	truot: 0,
	"cham-nhip": 1,
	"dung-nhip": 2,
	"chua-co-ky-vong": 3,
} satisfies Record<TinhTrang, number>;

/** Tình trạng của dòng mục tiêu: mục tiêu chưa có KR thì chưa có kỳ vọng để so. */
export function tinhTrangMucTieu(mt: MucTieu): TinhTrang {
	if (mt.keyResults.length === 0) return "chua-co-ky-vong";
	return tinhTrang(mt.progress, mt.expected, mt.kind);
}

const KHOA_SAP = {
	"tien-do": (mt: MucTieu) => mt.progress,
	"tinh-trang": (mt: MucTieu) => BAC_TINH_TRANG[tinhTrangMucTieu(mt)],
	detail: (mt: MucTieu) => (mt.keyResults.length > 0 ? 0 : 1),
} satisfies Record<CotSap, (mt: MucTieu) => number>;

/** Sắp ổn định: mục tiêu cùng khoá giữ thứ tự máy chủ trả, ở cả hai chiều. */
export function sapXep(
	ds: MucTieu[],
	cot: CotSap | null,
	chieu: ChieuSap,
): MucTieu[] {
	if (cot === null) return ds;
	const khoa = KHOA_SAP[cot];
	const dau = chieu === "asc" ? 1 : -1;
	return ds
		.map((mt, i) => ({ mt, i, k: khoa(mt) }))
		.sort((a, b) => (a.k - b.k) * dau || a.i - b.i)
		.map((x) => x.mt);
}

/** Gấp dấu để tìm: «Phòng Kế toán» → «phong ke toan», «Đ» → «d». */
export function gapDau(s: string): string {
	return s
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.toLowerCase()
		.replace(/đ/g, "d");
}

export type LuaChonDonVi = {
	khoa: string;
	ten: string;
	goiY: string;
	tuKhoa: string[];
};

type ChuLuaChon = {
	caCongTy: string;
	thuoc: (duong: string) => string;
	demMucTieu: (n: number) => string;
};

const NOI_DUONG = " › ";

function voiDem(
	goiY: string,
	khoa: string,
	dem: Record<string, number> | undefined,
	m: ChuLuaChon,
): string {
	return dem ? `${goiY} · ${m.demMucTieu(dem[khoa] ?? 0)}` : goiY;
}

/**
 * Lựa chọn của ô chọn đơn vị: công ty, mọi bộ phận và phòng ban của nó, phòng
 * ban chưa xếp; người trên đường dẫn đứng đầu. Gợi ý bỏ tên công ty ở đầu đường
 * khi đơn vị sâu hơn một cấp (gợi ý dài cắt tên đơn vị trong ô).
 */
export function luaChonDonVi(
	cay: CayDuLieu,
	tenGoc: string,
	dem: Record<string, number> | undefined,
	nguoi: { id: string; ten: string } | null,
	m: ChuLuaChon,
): LuaChonDonVi[] {
	const goc: LuaChonDonVi = {
		khoa: "goc",
		ten: tenGoc,
		goiY: voiDem(m.caCongTy, "goc", dem, m),
		tuKhoa: [],
	};
	const theoBoPhan = cay.divisions.flatMap((bp) => [
		{
			khoa: `bp:${bp.id}`,
			ten: bp.name,
			goiY: voiDem(m.thuoc(tenGoc), `bp:${bp.id}`, dem, m),
			tuKhoa: [],
		},
		...bp.departments.map((pb) => ({
			khoa: `pb:${pb.id}`,
			ten: pb.name,
			goiY: voiDem(m.thuoc(bp.name), `pb:${pb.id}`, dem, m),
			tuKhoa: [bp.name],
		})),
	]);
	const chuaXep = cay.chuaXep.map((pb) => ({
		khoa: `pb:${pb.id}`,
		ten: pb.name,
		goiY: voiDem(m.thuoc(tenGoc), `pb:${pb.id}`, dem, m),
		tuKhoa: [],
	}));
	const conNguoi = nguoi ? [luaChonNguoi(cay, tenGoc, nguoi, m)] : [];
	return [...conNguoi, goc, ...theoBoPhan, ...chuaXep];
}

function luaChonNguoi(
	cay: CayDuLieu,
	tenGoc: string,
	nguoi: { id: string; ten: string },
	m: ChuLuaChon,
): LuaChonDonVi {
	const pbId = cay.people.find((p) => p.id === nguoi.id)?.primaryDepartmentId;
	const pb = [
		...cay.divisions.flatMap((bp) => bp.departments),
		...cay.chuaXep,
	].find((x) => x.id === pbId);
	return {
		khoa: `nguoi:${nguoi.id}`,
		ten: nguoi.ten,
		goiY: m.thuoc(pb?.name ?? tenGoc),
		tuKhoa: pb ? [pb.name] : [],
	};
}

export function khopTim(lc: LuaChonDonVi, chuoi: string): boolean {
	const q = gapDau(chuoi.trim());
	if (q === "") return true;
	return [lc.ten, ...lc.tuKhoa].some((t) => gapDau(t).includes(q));
}

/** Đường cha của đơn vị (gồm tên công ty) cho «Thuộc A › B» ở chân bảng. */
export function duongCha(
	cay: CayDuLieu,
	don: DonChonOkr,
	tenGoc: string,
): string | null {
	if (don.loai === "goc" || don.loai === "nguoi") return null;
	if (don.loai === "bp") return tenGoc;
	const bp = cay.divisions.find((x) =>
		x.departments.some((pb) => pb.id === don.id),
	);
	return bp ? [tenGoc, bp.name].join(NOI_DUONG) : tenGoc;
}

export type DonViCon = { khoa: string; ten: string; coTruong: boolean };

/** Con trực tiếp theo cây tổ chức: công ty → bộ phận và phòng ban chưa xếp; bộ phận → phòng ban. */
export function conTrucTiep(cay: CayDuLieu, don: DonChonOkr): DonViCon[] {
	const thanh = (
		loai: "bp" | "pb",
		x: { id: string; name: string; head: { name: string } | null },
	): DonViCon => ({
		khoa: khoaDon({ loai, id: x.id }),
		ten: x.name,
		coTruong: x.head !== null,
	});
	switch (don.loai) {
		case "goc":
			return [
				...cay.divisions.map((bp) => thanh("bp", bp)),
				...cay.chuaXep.map((pb) => thanh("pb", pb)),
			];
		case "bp":
			return (
				cay.divisions
					.find((bp) => bp.id === don.id)
					?.departments.map((pb) => thanh("pb", pb)) ?? []
			);
		case "pb":
		case "nguoi":
			return [];
	}
}
