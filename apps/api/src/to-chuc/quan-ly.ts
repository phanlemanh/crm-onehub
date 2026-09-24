import type { NguonQuanLy } from "./to-chuc.contracts";

export type NgCanhQuanLy = {
	hieuLuc: ReadonlySet<string>;
	chonTay: ReadonlyMap<string, string>;
	phongBanChinh: ReadonlyMap<string, string>;
	truongPhongBan: ReadonlyMap<string, string>;
	boPhanCuaPhongBan: ReadonlyMap<string, string>;
	truongBoPhan: ReadonlyMap<string, string>;
};

export type QuanLy = { managerId: string | null; source: NguonQuanLy };

export function quanLyTrucTiep(userId: string, ng: NgCanhQuanLy): QuanLy {
	const hop = (id: string | undefined): id is string =>
		id !== undefined && id !== userId && ng.hieuLuc.has(id);
	const tay = ng.chonTay.get(userId);
	if (hop(tay)) return { managerId: tay, source: "chon-tay" };
	const pb = ng.phongBanChinh.get(userId);
	if (pb === undefined) return { managerId: null, source: "khong-co" };
	const truongPb = ng.truongPhongBan.get(pb);
	if (hop(truongPb)) return { managerId: truongPb, source: "truong-phong-ban" };
	const bp = ng.boPhanCuaPhongBan.get(pb);
	const truongBp = bp === undefined ? undefined : ng.truongBoPhan.get(bp);
	if (hop(truongBp)) return { managerId: truongBp, source: "truong-bo-phan" };
	return { managerId: null, source: "khong-co" };
}
