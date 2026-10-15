import type { CayDuLieu } from "./kieu";
import type { DonChonOkr } from "./okr-search-params";
import type { TabOkr } from "./tab-okr";

export const GOC: DonChonOkr = { loai: "goc" };

export type NguonDich = "chon" | "dan" | "url" | "goc";

export type DonDich = { don: DonChonOkr; nguon: NguonDich };

/**
 * Đơn vị mà ba hành động ở đầu trang khu (thêm, nhập, soạn) nhắm tới. Ở Theo
 * đơn vị là đơn vị đang chọn. Ở thẻ khác: đơn vị đầu tiên người xem dẫn (bộ
 * phận trước phòng ban, theo thứ tự cây máy chủ trả) — để trưởng đơn vị vừa xem
 * một đơn vị khác vẫn tạo được cho đơn vị mình ngay ở Của tôi —, không thì đơn
 * vị trên đường dẫn, không thì cấp công ty. Chốt ở Cổng Phạm vi 15/10 (Hỏi-2).
 */
export function donDich(
	tab: TabOkr,
	donUrl: DonChonOkr | null,
	headOf: { divisions: string[]; departments: string[] } | undefined,
): DonDich {
	if (tab === "theo-don-vi") return { don: donUrl ?? GOC, nguon: "chon" };
	const bp = headOf?.divisions[0];
	if (bp) return { don: { loai: "bp", id: bp }, nguon: "dan" };
	const pb = headOf?.departments[0];
	if (pb) return { don: { loai: "pb", id: pb }, nguon: "dan" };
	if (donUrl) return { don: donUrl, nguon: "url" };
	return { don: GOC, nguon: "goc" };
}

type DonDaGiai = { ten: string; truong: string | null; coTruong: boolean };

export function giaiDon(
	don: DonChonOkr,
	cay: CayDuLieu,
	tenGoc: string,
): DonDaGiai | null {
	const coTruong = (head: { name: string } | null) => ({
		truong: head?.name ?? null,
		coTruong: head !== null,
	});
	switch (don.loai) {
		case "goc":
			return { ten: tenGoc, truong: null, coTruong: true };
		case "bp": {
			const bp = cay.divisions.find((x) => x.id === don.id);
			return bp ? { ten: bp.name, ...coTruong(bp.head) } : null;
		}
		case "pb": {
			const pb = [
				...cay.divisions.flatMap((x) => x.departments),
				...cay.chuaXep,
			].find((x) => x.id === don.id);
			return pb ? { ten: pb.name, ...coTruong(pb.head) } : null;
		}
		case "nguoi": {
			const nguoi = cay.people.find((x) => x.id === don.id);
			return nguoi ? { ten: nguoi.name, truong: null, coTruong: true } : null;
		}
	}
}
