import type { TargetLinePoint } from "@crm/ui/components/target-line-chart";
import {
	type KrMau,
	KY,
	MT_CSKH_1,
	type MucTieuMau,
} from "../ban-mau-okr/du-lieu";

export const MUC_TIEU: MucTieuMau = MT_CSKH_1;

export const KR_CUA_MUC_TIEU: KrMau[] = MUC_TIEU.kr;

export const SO_TUAN_CHU_KY = 10;

const TUAN_DA_QUA = 6;

const NHAN_TUAN = [
	"26/10",
	"02/11",
	"09/11",
	"16/11",
	"23/11",
	"30/11",
] as const;

export type LanCapNhat = {
	tuan: string;
	giaTri: number;
	tuTin: KrMau["tuTin"];
	ghiChu: string | null;
};

function giaTriTuan(kr: KrMau, tuan: number): number {
	const buoc = (kr.hienTai - kr.khoiDiem) / TUAN_DA_QUA;
	return Math.round((kr.khoiDiem + buoc * tuan) * 10) / 10;
}

export function lichSu(kr: KrMau): LanCapNhat[] {
	if (kr.kieu === "moc") {
		return [
			{
				tuan: "09/11",
				giaTri: 0,
				tuTin: "vua",
				ghiChu: "Bản nháp gửi pháp chế.",
			},
			{ tuan: "15/11", giaTri: kr.hienTai, tuTin: kr.tuTin, ghiChu: kr.ghiChu },
		];
	}
	return NHAN_TUAN.map((tuan, i) => ({
		tuan,
		giaTri: i === TUAN_DA_QUA - 1 ? kr.hienTai : giaTriTuan(kr, i + 1),
		tuTin: i === TUAN_DA_QUA - 1 ? kr.tuTin : "vua",
		ghiChu: i === TUAN_DA_QUA - 1 ? kr.ghiChu : null,
	})).reverse();
}

function leRa(kr: KrMau, tuan: number): number {
	return (
		Math.round(
			(kr.khoiDiem + ((kr.dich - kr.khoiDiem) * tuan) / SO_TUAN_CHU_KY) * 10,
		) / 10
	);
}

export function diemDoThi(kr: KrMau, moi: number | null): TargetLinePoint[] {
	const cu = [...lichSu(kr)].reverse().map((l, i) => ({
		x: l.tuan,
		value: l.giaTri,
		expected: leRa(kr, i + 1),
	}));
	if (moi === null) return cu;
	return [
		...cu,
		{ x: "Hôm nay", value: moi, expected: leRa(kr, TUAN_DA_QUA + 1) },
	];
}

export function tienDoVoi(kr: KrMau, giaTri: number): number {
	if (kr.kieu === "moc") return giaTri >= 1 ? 100 : 0;
	const pham = kr.dich - kr.khoiDiem;
	if (pham === 0) return 0;
	const p = ((giaTri - kr.khoiDiem) / pham) * 100;
	return Math.max(0, Math.min(100, Math.round(p)));
}

export const KY_VONG = KY.kyVong;
