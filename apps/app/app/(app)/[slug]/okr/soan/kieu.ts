import type { RouterOutputs } from "@/lib/trpc/types";

type DanhSachSoan = RouterOutputs["okr"]["soanDanhSach"];

export type CuocSoan = DanhSachSoan["cuoc"];
export type DongSoan = DanhSachSoan["dong"][number];
export type DongMucTieu = Extract<DongSoan, { loai: "muc-tieu-moi" }>;
export type DongKr = Extract<DongSoan, { loai: "kr-moi" }>;
export type DongCanChinh = Extract<DongSoan, { loai: "can-chinh-moi" }>;
export type NhanDong = "vua-them" | "vua-sua" | "vua-chuyen" | "da-bo";
export type SoKr = { khoiDiem: string; dich: string };
export type SoGo = SoKr & { khoaDong?: string };
export type SoDaGo = Readonly<Record<string, SoGo | undefined>>;
export type KhoiNhap = {
	mucTieu: DongMucTieu;
	kr: DongKr[];
	canChinh: DongCanChinh[];
};
export type CauHoi = { hoi: string; goiY: string[] };
export type DonViSoan = Pick<
	CuocSoan,
	"cycleId" | "level" | "divisionId" | "departmentId"
>;
export type LyDoLuot = Extract<
	RouterOutputs["okr"]["soanTangLuot"],
	{ ok: false }
>["lyDo"];
export type KetSoBanNhap = {
	dong: DongSoan[];
	nhan: ReadonlyMap<string, NhanDong>;
	truocTen: ReadonlyMap<string, string>;
};
export type DemDuaVao = { soMucTieu: number; soKr: number };
export type LuotTroLy = { loiDan: string; cauHoi: CauHoi[] };
