import type {
	HangLoTrinh,
	LoTrinhDuLieu,
	MocLoTrinh,
	NhomTrangThai,
} from "@crm/validation/lo-trinh-du-lieu";
import { soNgay, viecTre } from "@/lib/lo-trinh/ngay";
import type { BoLoc, VongDoi } from "./tham-so";

export const KHONG_NHOM = "__khong-nhom";
export const KHONG_MOC = "__khong-moc";
export const TRE = "__tre";

export const THU_TU_NHOM = [
	"chua-bat-dau",
	"dang-lam",
	"da-giao",
	"khac",
] as const satisfies readonly NhomTrangThai[];

export const CHU_CUNG_NGHIA: ReadonlySet<string> = new Set([
	"Chưa mở",
	"Đã giao",
	"Đang làm",
]);

export type Viec = HangLoTrinh & {
	loTep: string;
	loTen: string;
	moc: MocLoTrinh | null;
	tre: boolean;
	conNgay: number | null;
	khoa: string;
};

export type BoLocChon = Record<BoLoc, string[]>;

export type TuyChonLoc = Record<BoLoc, string[]>;

export function phangViec(
	duLieu: LoTrinhDuLieu,
	homNay: string | null,
): Viec[] {
	return duLieu.lo_trinh.flatMap((lo) => {
		const theoMoc = new Map<string, MocLoTrinh>();
		for (const m of lo.moc)
			for (const ma of m.hang) if (!theoMoc.has(ma)) theoMoc.set(ma, m);
		const tre = new Set(homNay === null ? [] : viecTre(lo, homNay));
		return lo.hang.map((h) => {
			const moc = theoMoc.get(h.ma) ?? null;
			return {
				...h,
				loTep: lo.tep,
				loTen: lo.ten ?? lo.tep,
				moc,
				tre: tre.has(h.ma),
				conNgay:
					homNay !== null && moc?.ngayHopLe
						? soNgay(homNay, moc.ngayHopLe)
						: null,
				khoa: `${lo.tep}#${h.ma}`,
			};
		});
	});
}

export function khoaMocCua(tep: string, moc: MocLoTrinh): string {
	return `${tep}@${moc.ngay}@${moc.ten}`;
}

export function khoaMoc(v: Viec): string {
	return v.moc ? khoaMocCua(v.loTep, v.moc) : KHONG_MOC;
}

export function giaTriLoc(v: Viec, chieu: BoLoc): string[] {
	if (chieu === "loTrinh") return [v.loTep];
	if (chieu === "nhom") return [v.nhom || KHONG_NHOM];
	return [khoaMoc(v), ...(v.tre ? [TRE] : [])];
}

export function hopLoc(v: Viec, loc: BoLocChon, boQua?: BoLoc): boolean {
	return (["loTrinh", "nhom", "moc"] as const).every((chieu) => {
		const chon = loc[chieu];
		if (chieu === boQua || chon.length === 0) return true;
		return giaTriLoc(v, chieu).some((g) => chon.includes(g));
	});
}

export function hopTim(v: Viec, q: string): boolean {
	const tim = q.trim().toLowerCase();
	return (
		tim === "" ||
		v.cau_giao.toLowerCase().includes(tim) ||
		v.ma.toLowerCase().includes(tim)
	);
}

export function thuocVongDoi(v: Viec, vongDoi: VongDoi): boolean {
	if (vongDoi === "chua-xong")
		return (
			v.nhom_trang_thai === "chua-bat-dau" || v.nhom_trang_thai === "dang-lam"
		);
	if (vongDoi === "tat-ca") return true;
	return v.nhom_trang_thai === vongDoi;
}

export function tuyChonLoc(duLieu: LoTrinhDuLieu, viec: Viec[]): TuyChonLoc {
	const nhom = [...new Set(viec.map((v) => v.nhom))].filter(Boolean);
	const moc = duLieu.lo_trinh.flatMap((lo) =>
		lo.moc.filter((m) => m.hang.length > 0).map((m) => khoaMocCua(lo.tep, m)),
	);
	return {
		loTrinh: duLieu.lo_trinh.map((l) => l.tep),
		nhom: [...nhom, KHONG_NHOM],
		moc: [TRE, ...moc, KHONG_MOC],
	};
}

export function locHopLe(loc: BoLocChon, tuyChon: TuyChonLoc): BoLocChon {
	return {
		loTrinh: loc.loTrinh.filter((g) => tuyChon.loTrinh.includes(g)),
		nhom: loc.nhom.filter((g) => tuyChon.nhom.includes(g)),
		moc: loc.moc.filter((g) => tuyChon.moc.includes(g)),
	};
}

export function demLoc(
	viec: Viec[],
	loc: BoLocChon,
	chieu: BoLoc,
): Record<string, number> {
	const dem = new Map<string, number>();
	for (const v of viec)
		if (hopLoc(v, loc, chieu))
			for (const g of giaTriLoc(v, chieu)) dem.set(g, (dem.get(g) ?? 0) + 1);
	return Object.fromEntries(dem);
}

export function sapXep(
	viec: Viec[],
	sort: string,
	dir: "asc" | "desc",
): Viec[] {
	const dau = dir === "asc" ? 1 : -1;
	return [...viec].sort((a, b) => {
		if (sort === "trangThai")
			return (
				dau *
				(THU_TU_NHOM.indexOf(a.nhom_trang_thai) -
					THU_TU_NHOM.indexOf(b.nhom_trang_thai))
			);
		if (!a.moc || !b.moc) return a.moc ? -1 : b.moc ? 1 : 0;
		return dau * a.moc.ngay.localeCompare(b.moc.ngay);
	});
}
