import { db } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { ghiKetQuaHoi } from "@crm/db/tai-lieu-hoi";
import {
	cauLoiHoi,
	dungTraLoiZalo,
	dungTuChoi,
	LY_DO_LOI,
	parseGanNhat,
	parseTraLoi,
} from "@crm/validation/tai-lieu-hoi";
import { z } from "zod";

const lyDoLoi = z.enum(LY_DO_LOI);

export function ngayVnTuIso(iso: string): string {
	return ngayVN(new Date(iso)).split("-").reverse().join("/");
}

export async function cauKhoChoZalo(
	zaloHoiId: string | null | undefined,
): Promise<string | null> {
	if (!zaloHoiId) return null;
	const hang = await db.taiLieuHoi.findUnique({
		where: { zaloHoiId },
		select: {
			id: true,
			trangThai: true,
			traLoi: true,
			ganNhat: true,
			lyDo: true,
		},
	});
	if (!hang) return null;
	if (hang.trangThai === "TRA_LOI")
		return dungTraLoiZalo(parseTraLoi(hang.traLoi), ngayVnTuIso);
	if (hang.trangThai === "TU_CHOI")
		return dungTuChoi(parseGanNhat(hang.ganNhat ?? []));
	if (hang.trangThai === "LOI") return cauLoiHoi(lyDoLoi.parse(hang.lyDo));
	await ghiKetQuaHoi(
		db,
		hang.id,
		{ trangThai: "LOI", lyDo: "loi-model" },
		new Date(),
	);
	return cauLoiHoi("loi-model");
}
