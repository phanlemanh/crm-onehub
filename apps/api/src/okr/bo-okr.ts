import type { WorkspaceRole } from "@crm/validation/vai-workspace";
import {
	chonHangViec,
	type HangSangKien,
	type HangViec,
	lienKetChoVai,
	ngayCuaCot,
} from "./canh-kr";
import type {
	DanhSachBoOutput,
	HangBo,
	HangToanCanh,
	NhomViecBo,
} from "./okr-xem.contracts";
import type { CayGon } from "./toan-canh";

type NguoiGon = { id: string; name: string };
type DonViGon = { id: string; name: string; head: NguoiGon | null };

export type DanDonVi = {
	boPhan: ReadonlySet<string>;
	phongBan: ReadonlySet<string>;
};

export type DauVaoDanhSachBo = {
	cay: CayGon;
	tenGoc: string;
	soMucTieu: Readonly<Record<string, number>>;
	toanCanh: readonly HangToanCanh[];
	dan: DanDonVi;
	theoDoi: ReadonlySet<string>;
};

type KhungHang = Pick<
	HangBo,
	"don" | "ten" | "cap" | "cha" | "truong" | "toiDan"
>;

export function gopDanhSachBo(v: DauVaoDanhSachBo): DanhSachBoOutput {
	const so = new Map(v.toanCanh.map((h) => [h.key, h]));
	const hang = (k: KhungHang): HangBo => {
		const tc = so.get(k.don);
		return {
			...k,
			soMucTieu: v.soMucTieu[k.don] ?? 0,
			tienDo: tc?.tienDo ?? null,
			tuTinThap: tc?.tuTin.thap ?? 0,
			dangTheoDoi: v.theoDoi.has(k.don),
		};
	};
	const phongBan = (p: DonViGon, cha: string) =>
		hang({
			don: `pb:${p.id}`,
			ten: p.name,
			cap: "phong-ban",
			cha,
			truong: p.head,
			toiDan: v.dan.phongBan.has(p.id),
		});
	return {
		hang: [
			hang({
				don: "goc",
				ten: v.tenGoc,
				cap: "goc",
				cha: null,
				truong: null,
				toiDan: false,
			}),
			...v.cay.divisions.flatMap((b) => [
				hang({
					don: `bp:${b.id}`,
					ten: b.name,
					cap: "bo-phan",
					cha: "goc",
					truong: b.head,
					toiDan: v.dan.boPhan.has(b.id),
				}),
				...b.departments.map((p) => phongBan(p, `bp:${b.id}`)),
			]),
			...v.cay.chuaXep.map((p) => phongBan(p, "goc")),
		],
	};
}

export const chonViecBo = {
	...chonHangViec,
	nguoiLam: { select: { id: true, name: true } },
	campaign: { select: { id: true, name: true, status: true } },
	plan: {
		select: {
			id: true,
			closedAt: true,
			company: { select: { name: true, archivedAt: true } },
		},
	},
} as const;

export type HangViecBo = HangViec & {
	nguoiLam: NguoiGon | null;
	campaign: HangSangKien["campaign"];
	plan: HangSangKien["plan"];
};

type ViecBo = NhomViecBo["viec"][number];

function tieuDeViec(h: HangViecBo, role: WorkspaceRole): string {
	if (h.loai === "viec") return h.tieuDe;
	const lk = lienKetChoVai(role, {
		loai: h.loai,
		campaign: h.campaign,
		plan: h.plan,
	});
	return lk.coQuyen ? (lk.ten ?? "") : "";
}

export function viecBoTu(h: HangViecBo, role: WorkspaceRole): ViecBo {
	return {
		id: h.id,
		loai: h.loai,
		tieuDe: tieuDeViec(h, role),
		nguoiLam: h.nguoiLam,
		hanNgay: ngayCuaCot(h.hanNgay),
		xong: h.xongLuc !== null,
	};
}
