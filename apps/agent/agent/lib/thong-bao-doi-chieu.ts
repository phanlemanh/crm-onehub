import type { Db } from "@crm/db";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import { LOAI_VIEC_NHAC } from "./nhac-ke-hoach";

const CHU_DE = /^user:(.+):(\d{4}-\d{2}-\d{2})$/;
const KHONG_KENH = new Set(["khong-khop", "khong-slack"]);

export type DongNgay = {
	ngay: string;
	nguoiCoLuot: number;
	coKenh: number;
	khongKenh: number;
	mucDaTinh: number;
	mucCoThongBao: number;
	mucMat: { userId: string; khoa: string }[];
	luotThieuDanhSach: string[];
};

export type KetQuaDoiChieu = {
	ngay: DongNgay[];
	nguoiCoThongBao: number;
	nguoiDaBamMo: number;
};

export async function doiChieu(
	db: Db,
	khoang: { tu: string; den: string },
): Promise<KetQuaDoiChieu> {
	const luot = await db.agentTask.findMany({
		where: { kind: LOAI_VIEC_NHAC, subject: { not: null } },
		select: { id: true, subject: true, payload: true, outcome: true },
	});
	const trongKhoang = luot.flatMap((l) => {
		const khop = CHU_DE.exec(l.subject ?? "");
		const userId = khop?.[1];
		const ngay = khop?.[2];
		return userId && ngay && ngay >= khoang.tu && ngay <= khoang.den
			? [{ ...l, userId, ngay }]
			: [];
	});
	const nguoiTrongKhoang = new Set(trongKhoang.map((l) => l.userId));
	const thongBao = await db.thongBao.findMany({
		where: {
			nguoiNhanId: { in: [...nguoiTrongKhoang] },
			thayNgay: { gte: khoang.tu },
			ngayDau: { lte: khoang.den },
		},
		select: { nguoiNhanId: true, khoa: true, ngayDau: true, thayNgay: true },
	});
	const phu = (userId: string, khoa: string, ngay: string) =>
		thongBao.some(
			(h) =>
				h.nguoiNhanId === userId &&
				h.khoa === khoa &&
				h.ngayDau <= ngay &&
				h.thayNgay >= ngay,
		);
	const theoNgay = new Map<string, DongNgay>();
	for (const l of trongKhoang) {
		const { userId, ngay } = l;
		const d = theoNgay.get(ngay) ?? {
			ngay,
			nguoiCoLuot: 0,
			coKenh: 0,
			khongKenh: 0,
			mucDaTinh: 0,
			mucCoThongBao: 0,
			mucMat: [],
			luotThieuDanhSach: [],
		};
		theoNgay.set(ngay, d);
		d.nguoiCoLuot += 1;
		if (l.outcome?.startsWith("da-gui")) d.coKenh += 1;
		else if (KHONG_KENH.has(l.outcome ?? "")) d.khongKenh += 1;
		if (l.outcome === "khong-viec") continue;
		const mucTinh = parseNhacPayload(l.payload).mucTinh;
		if (!mucTinh) {
			d.luotThieuDanhSach.push(l.id);
			continue;
		}
		for (const khoa of mucTinh.khoa) {
			d.mucDaTinh += 1;
			if (phu(userId, khoa, ngay)) d.mucCoThongBao += 1;
			else d.mucMat.push({ userId, khoa });
		}
	}
	const nguoi = [...nguoiTrongKhoang];
	const coThongBao = await db.thongBao.groupBy({
		by: ["nguoiNhanId"],
		where: { nguoiNhanId: { in: nguoi } },
	});
	const daBamMo = await db.thongBao.groupBy({
		by: ["nguoiNhanId"],
		where: { nguoiNhanId: { in: nguoi }, moLuc: { not: null } },
	});
	return {
		ngay: [...theoNgay.values()].sort((a, b) => a.ngay.localeCompare(b.ngay)),
		nguoiCoThongBao: coThongBao.length,
		nguoiDaBamMo: daBamMo.length,
	};
}

export function coMat(kq: KetQuaDoiChieu): boolean {
	return kq.ngay.some(
		(d) => d.mucMat.length > 0 || d.luotThieuDanhSach.length > 0,
	);
}

export function inKetQua(kq: KetQuaDoiChieu): string {
	const dong = kq.ngay.flatMap((d) => [
		`${d.ngay} · luot ${d.nguoiCoLuot} (co kenh ${d.coKenh}, khong kenh ${d.khongKenh}) · muc da tinh ${d.mucDaTinh} · co thong bao ${d.mucCoThongBao} · mat ${d.mucMat.length} · luot thieu danh sach ${d.luotThieuDanhSach.length}`,
		...d.mucMat.map((m) => `  mat ${m.userId} ${m.khoa}`),
		...d.luotThieuDanhSach.map((id) => `  luot thieu danh sach ${id}`),
	]);
	return [
		...dong,
		`ca khoang · nguoi co thong bao ${kq.nguoiCoThongBao} · da bam mo it nhat mot ${kq.nguoiDaBamMo}`,
	].join("\n");
}
