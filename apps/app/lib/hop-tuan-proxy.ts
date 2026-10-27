import {
	boHopTuan,
	cayChonBo,
	nguoiXemBo,
	quyenChonBo,
} from "@crm/validation/okr-bo-hop-tuan";
import { type NextRequest, NextResponse } from "next/server";
import { DUONG } from "@/app/(app)/[slug]/okr/tab-okr";
import {
	duongChuyenHopTuan,
	laHopTuanKhongDon,
} from "@/app/(app)/[slug]/okr/theo-don-vi/chuyen-hop-tuan";
import { readProcedure } from "@/lib/onboarding";
import { workspaceUrl } from "@/lib/workspace-url";

const DUONG_BO_OKR = DUONG["theo-don-vi"];

const HTTP_CHUYEN_TAM = 307;

export const THU_TUC_HOP_TUAN = {
	quyen: "okr.access",
	cay: "org.tree",
	nguoiXem: "users.me",
} as const;

export function laDuongHopTuan(
	duong: string,
	thamSo: URLSearchParams,
): boolean {
	return duong === DUONG_BO_OKR && laHopTuanKhongDon(thamSo);
}

export async function chuyenHopTuan(
	request: NextRequest,
	slug: string,
	duong: string,
): Promise<NextResponse | null> {
	const thamSo = request.nextUrl.searchParams;
	if (!laDuongHopTuan(duong, thamSo)) return null;

	const [quyen, cay, nguoiXem] = await Promise.all([
		readProcedure(request, THU_TUC_HOP_TUAN.quyen),
		readProcedure(request, THU_TUC_HOP_TUAN.cay),
		readProcedure(request, THU_TUC_HOP_TUAN.nguoiXem),
	]);
	const access = quyenChonBo.safeParse(quyen.data);
	const cayDoc = cayChonBo.safeParse(cay.data);
	const toi = nguoiXemBo.safeParse(nguoiXem.data);
	if (!access.success || !cayDoc.success || !toi.success) return null;

	const { don } = boHopTuan({
		access: access.data,
		cay: cayDoc.data,
		userId: toi.data.id,
	});
	const dich = duongChuyenHopTuan(thamSo, don);
	if (dich === null) return null;

	return NextResponse.redirect(
		new URL(`${workspaceUrl(slug, DUONG_BO_OKR)}${dich}`, request.nextUrl),
		HTTP_CHUYEN_TAM,
	);
}
