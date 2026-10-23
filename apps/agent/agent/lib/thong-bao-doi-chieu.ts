import type { Db } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
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
	quaZalo: number;
	quaSlack: number;
	suKienDaDay: number;
	kenhCoThongBao: number;
	kenhLech: { userId: string; khoa: string }[];
};

export type KetQuaDoiChieu = {
	ngay: DongNgay[];
	nguoiCoThongBao: number;
	nguoiDaBamMo: number;
	nguoiKhacMacDinh: number;
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
	const dongCua = (ngay: string): DongNgay => {
		const d = theoNgay.get(ngay) ?? {
			ngay,
			nguoiCoLuot: 0,
			coKenh: 0,
			khongKenh: 0,
			mucDaTinh: 0,
			mucCoThongBao: 0,
			mucMat: [],
			luotThieuDanhSach: [],
			quaZalo: 0,
			quaSlack: 0,
			suKienDaDay: 0,
			kenhCoThongBao: 0,
			kenhLech: [],
		};
		theoNgay.set(ngay, d);
		return d;
	};
	for (const l of trongKhoang) {
		const { userId, ngay } = l;
		const d = dongCua(ngay);
		d.nguoiCoLuot += 1;
		if (l.outcome?.startsWith("da-gui") || l.outcome?.startsWith("da-tat-het"))
			d.coKenh += 1;
		else if (KHONG_KENH.has(l.outcome ?? "")) d.khongKenh += 1;
		if (l.outcome === "khong-viec") continue;
		const payload = parseNhacPayload(l.payload);
		const mucTinh = payload.mucTinh;
		for (const khoa of payload.daGuiKhoa ?? []) {
			if (payload.kenh === "zalo") d.quaZalo += 1;
			if (payload.kenh === "slack") d.quaSlack += 1;
			if (phu(userId, khoa, ngay)) d.kenhCoThongBao += 1;
			else d.kenhLech.push({ userId, khoa });
		}
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
	const daDay = await db.thongBao.groupBy({
		by: ["dayLuc"],
		where: { dayKenh: { not: null }, dayLuc: { not: null }, dayLoi: null },
		_count: { _all: true },
	});
	for (const h of daDay) {
		const ngay = h.dayLuc ? ngayVN(h.dayLuc) : null;
		if (ngay && ngay >= khoang.tu && ngay <= khoang.den) {
			dongCua(ngay).suKienDaDay += h._count._all;
		}
	}
	const khacMacDinh = await db.caiDatThongBao.groupBy({ by: ["userId"] });
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
		nguoiKhacMacDinh: khacMacDinh.length,
	};
}

export function coMat(kq: KetQuaDoiChieu): boolean {
	return kq.ngay.some(
		(d) =>
			d.mucMat.length > 0 ||
			d.luotThieuDanhSach.length > 0 ||
			d.kenhLech.length > 0,
	);
}

export function inKetQua(kq: KetQuaDoiChieu): string {
	const dong = kq.ngay.flatMap((d) => [
		`${d.ngay} · luot ${d.nguoiCoLuot} (co kenh ${d.coKenh}, khong kenh ${d.khongKenh}) · muc da tinh ${d.mucDaTinh} · co thong bao ${d.mucCoThongBao} · mat ${d.mucMat.length} · luot thieu danh sach ${d.luotThieuDanhSach.length}`,
		...d.mucMat.map((m) => `  mat ${m.userId} ${m.khoa}`),
		...d.luotThieuDanhSach.map((id) => `  luot thieu danh sach ${id}`),
		`${d.ngay} · kenh ngoai · qua Zalo ${d.quaZalo} · qua Slack ${d.quaSlack} · su kien da day ${d.suKienDaDay} · co ban trong chuong ${d.kenhCoThongBao} · lech ${d.kenhLech.length}`,
		...d.kenhLech.map((m) => `  lech ${m.userId} ${m.khoa}`),
	]);
	return [
		...dong,
		`ca khoang · nguoi co thong bao ${kq.nguoiCoThongBao} · da bam mo it nhat mot ${kq.nguoiDaBamMo}`,
		`ca khoang · nguoi co cai dat khac mac dinh ${kq.nguoiKhacMacDinh}`,
	].join("\n");
}
