import type { CayDuLieu } from "./kieu";
import type { DonChonOkr } from "./okr-search-params";
import type { TabOkr } from "./tab-okr";

export const GOC: DonChonOkr = { loai: "goc" };

export type NguonDich = "chon" | "dan" | "url" | "goc";

export type DonDich = { don: DonChonOkr; nguon: NguonDich };

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
