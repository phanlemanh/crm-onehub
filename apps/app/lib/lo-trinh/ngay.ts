import type { LoTrinh, MocLoTrinh } from "@crm/validation/lo-trinh-du-lieu";
import { LO_TRINH } from "./cau-hinh";

const hai = (n: number) => String(n).padStart(2, "0");

export function homNayNguoiXem(d: Date): string {
	return `${d.getFullYear()}-${hai(d.getMonth() + 1)}-${hai(d.getDate())}`;
}

export function soNgay(tu: string, toi: string): number {
	const ms = (s: string) => {
		const [y, m, d] = s.split("-").map(Number);
		return Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1);
	};
	return Math.round((ms(toi) - ms(tu)) / LO_TRINH.ngayMs);
}

export function mocQuaConViec(moc: MocLoTrinh, homNay: string): boolean {
	return (
		/^\d{4}-\d{2}-\d{2}$/.test(moc.ngay) &&
		moc.ngay < homNay &&
		moc.con_viec === true
	);
}

export function viecTre(loTrinh: LoTrinh, homNay: string): string[] {
	const theoMa = new Map(loTrinh.hang.map((h) => [h.ma, h]));
	const ra: string[] = [];
	for (const m of loTrinh.moc) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(m.ngay) || !(m.ngay < homNay)) continue;
		for (const ma of m.hang) {
			const h = theoMa.get(ma);
			if (h && h.nhom_trang_thai !== "da-giao" && !ra.includes(ma)) ra.push(ma);
		}
	}
	return ra;
}
