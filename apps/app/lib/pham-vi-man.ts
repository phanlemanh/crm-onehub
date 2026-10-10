import { laVaiChiOkr, toWorkspaceRole } from "@crm/validation/vai-workspace";
import {
	GOC_CAI_DAT,
	MUC_CAI_DAT,
	type MucCaiDat,
	NHOM_CAI_DAT,
	type NhomCaiDat,
} from "@/lib/cai-dat-dieu-huong";
import { MUC_RAIL, type MucRail } from "@/lib/khung-dieu-huong";
import { isUnder } from "@/lib/proxy-paths";

export const KHU_DOI_TAC = [
	"/companies",
	"/contacts",
	"/deals",
	"/campaigns",
	"/onboarding",
	"/chat",
	"/agents",
] as const;

export const DUONG_NGOAI_PHAM_VI = "/ngoai-pham-vi";

export const CAI_DAT_MAC_DINH_CHI_OKR = `${GOC_CAI_DAT}/api-keys`;

export const DUONG_NHAC_BUOI_SANG = "/reminders";

const DUONG_CU_NHAC_BUOI_SANG = `${GOC_CAI_DAT}/notifications`;

const MUC_CAI_DAT_CHI_OKR: readonly MucCaiDat["khoa"][] = ["khoaApi"];

export type DieuHuong = { toi: string } | "ok";

function chiOkr(role: string | null): boolean {
	return role !== null && laVaiChiOkr(toWorkspaceRole(role));
}

const RAIL_CHI_OKR: readonly MucRail[] = MUC_RAIL.flatMap((muc) => {
	if (muc.key === "overview") return [muc];
	if (muc.key === "okr") return [muc];
	if (muc.key === "taiLieu") return [muc];
	if (muc.key === "loTrinh") return [muc];
	if (muc.key === "settings") {
		return [{ ...muc, href: CAI_DAT_MAC_DINH_CHI_OKR, related: [GOC_CAI_DAT] }];
	}
	return [];
});

const CAI_DAT_CHI_OKR: readonly MucCaiDat[] = MUC_CAI_DAT_CHI_OKR.flatMap(
	(khoa) => MUC_CAI_DAT.filter((muc) => muc.khoa === khoa),
);

export function mucRailChoVai(role: string | null): readonly MucRail[] {
	return chiOkr(role) ? RAIL_CHI_OKR : MUC_RAIL;
}

export function mucCaiDatChoVai(role: string | null): readonly MucCaiDat[] {
	return chiOkr(role) ? CAI_DAT_CHI_OKR : MUC_CAI_DAT;
}

const NHOM_CAI_DAT_CHI_OKR: readonly NhomCaiDat[] = NHOM_CAI_DAT.flatMap(
	(nhom) => {
		const muc = nhom.muc.filter((m) => CAI_DAT_CHI_OKR.includes(m));
		return muc.length > 0 ? [{ ...nhom, muc }] : [];
	},
);

export function nhomCaiDatChoVai(role: string | null): readonly NhomCaiDat[] {
	return chiOkr(role) ? NHOM_CAI_DAT_CHI_OKR : NHOM_CAI_DAT;
}

export function dieuHuongTheoVai(
	role: string | null,
	pathname: string,
): DieuHuong {
	if (!chiOkr(role)) return "ok";
	if (KHU_DOI_TAC.some((khu) => isUnder(pathname, khu))) {
		return { toi: DUONG_NGOAI_PHAM_VI };
	}
	if (pathname === GOC_CAI_DAT) return { toi: CAI_DAT_MAC_DINH_CHI_OKR };
	if (pathname === DUONG_CU_NHAC_BUOI_SANG) return "ok";
	if (
		isUnder(pathname, GOC_CAI_DAT) &&
		!CAI_DAT_CHI_OKR.some((muc) => isUnder(pathname, muc.href))
	) {
		return { toi: DUONG_NGOAI_PHAM_VI };
	}
	return "ok";
}
