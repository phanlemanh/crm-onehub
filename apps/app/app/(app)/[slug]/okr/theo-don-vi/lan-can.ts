import type { CayDuLieu } from "../kieu";
import { type DonChonOkr, khoaDon } from "../okr-search-params";

export type DonLanCan = { don: DonChonOkr; khoa: string; ten: string };

export type LanCan = {
	cha: DonLanCan | null;
	cungCap: DonLanCan[];
	trucThuoc: DonLanCan[];
};

type DonViCay = { id: string; name: string };

const thanh = (loai: "bp" | "pb", x: DonViCay): DonLanCan => {
	const don: DonChonOkr = { loai, id: x.id };
	return { don, khoa: khoaDon(don), ten: x.name };
};

const khac = (ds: DonLanCan[], khoa: string) =>
	ds.filter((d) => d.khoa !== khoa);

export function lanCan(
	cay: CayDuLieu,
	don: DonChonOkr,
	tenGoc: string,
): LanCan | null {
	const goc: DonLanCan = { don: { loai: "goc" }, khoa: "goc", ten: tenGoc };
	const khoi = cay.divisions.map((bp) => thanh("bp", bp));
	const chuaXep = cay.chuaXep.map((pb) => thanh("pb", pb));
	switch (don.loai) {
		case "nguoi":
			return null;
		case "goc":
			return { cha: null, cungCap: [], trucThuoc: [...khoi, ...chuaXep] };
		case "bp": {
			const bp = cay.divisions.find((x) => x.id === don.id);
			if (!bp) return null;
			return {
				cha: goc,
				cungCap: khac(khoi, khoaDon(don)),
				trucThuoc: bp.departments.map((pb) => thanh("pb", pb)),
			};
		}
		case "pb": {
			const bp = cay.divisions.find((x) =>
				x.departments.some((pb) => pb.id === don.id),
			);
			if (bp)
				return {
					cha: thanh("bp", bp),
					cungCap: khac(
						bp.departments.map((pb) => thanh("pb", pb)),
						khoaDon(don),
					),
					trucThuoc: [],
				};
			if (!cay.chuaXep.some((pb) => pb.id === don.id)) return null;
			return {
				cha: goc,
				cungCap: khac(chuaXep, khoaDon(don)),
				trucThuoc: [],
			};
		}
	}
}
