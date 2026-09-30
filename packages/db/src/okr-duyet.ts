import { type CayOkr, VAI_QUAN_TRI_OKR } from "./okr-hien-thi";

export const PHA_GHI_DUOC = ["lap-ke-hoach", "dang-chay"] as const;

export const CHO_DUYET = "cho-duyet";

export type NguoiDuyet =
	| { loai: "nguoi"; userId: string }
	| { loai: "quan-tri" };

export type NenDuyet = {
	truongCuaBoPhan: ReadonlyMap<string, string>;
	truongCuaPhongBan: ReadonlyMap<string, string>;
	boPhanCua: ReadonlyMap<string, string | null>;
	phongBanChinh: ReadonlyMap<string, string | null>;
};

export type DonViDuyet = {
	level: string;
	departmentId: string | null;
	personUserId: string | null;
};

const QUAN_TRI: NguoiDuyet = { loai: "quan-tri" };

function nguoiHoacQuanTri(userId: string | undefined): NguoiDuyet {
	return userId === undefined ? QUAN_TRI : { loai: "nguoi", userId };
}

export function nguoiDuyetMucTieu(nen: NenDuyet, mt: DonViDuyet): NguoiDuyet {
	const truongBoPhanCua = (pb: string) => {
		const bp = nen.boPhanCua.get(pb) ?? null;
		return bp === null ? undefined : nen.truongCuaBoPhan.get(bp);
	};
	if (mt.level === "phong-ban")
		return mt.departmentId === null
			? QUAN_TRI
			: nguoiHoacQuanTri(truongBoPhanCua(mt.departmentId));
	if (mt.level === "ca-nhan") {
		const pb =
			mt.personUserId === null
				? null
				: (nen.phongBanChinh.get(mt.personUserId) ?? null);
		if (pb === null) return QUAN_TRI;
		const truong = nen.truongCuaPhongBan.get(pb);
		return nguoiHoacQuanTri(
			truong === mt.personUserId ? truongBoPhanCua(pb) : truong,
		);
	}
	return QUAN_TRI;
}

export function nguoiNhanDuyet(cay: CayOkr, nd: NguoiDuyet): string[] {
	if (nd.loai === "nguoi") return [nd.userId];
	return [...cay.vai]
		.filter(([, vai]) => VAI_QUAN_TRI_OKR.has(vai))
		.map(([userId]) => userId)
		.sort();
}
