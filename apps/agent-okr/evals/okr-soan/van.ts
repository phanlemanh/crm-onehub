import type { GoiSoan } from "../../agent/lib/goi-soan";
import type { DongDoc } from "./phien";

export function tenDichCua(goi: GoiSoan | null): Map<string, string> {
	return new Map((goi?.lop2a.ungVienCanChinh ?? []).map((u) => [u.id, u.ten]));
}

export function idUngVien(goi: GoiSoan | null): Set<string> {
	return new Set((goi?.lop2a.ungVienCanChinh ?? []).map((u) => u.id));
}

function dongKr(d: DongDoc): string {
	if (d.dong.loai !== "kr-moi") return "";
	const khoiDiem =
		d.dong.khoiDiemGoiY === null ? "" : `, khởi điểm ${d.dong.khoiDiemGoiY}`;
	return `  - KR: ${d.dong.ten} (${d.dong.kieu}, ${d.dong.donVi}${khoiDiem}) — ${d.dong.viSao}`;
}

export function vanBanNhap(
	dong: readonly DongDoc[],
	tenDich: Map<string, string>,
): string {
	return dong
		.flatMap((m) => {
			if (m.dong.loai !== "muc-tieu-moi") return [];
			const khoa = m.dong.khoa;
			const con = dong.filter(
				(d) => d.dong.loai !== "muc-tieu-moi" && d.dong.chaKhoa === khoa,
			);
			return [
				`Mục tiêu (${m.dong.loaiMucTieu}): ${m.dong.ten} — vì sao lúc này: ${m.dong.viSaoLucNay} — ${m.dong.viSao}`,
				...con.map((d) =>
					d.dong.loai === "can-chinh-moi"
						? `  - Căn chỉnh tới: ${tenDich.get(d.dong.targetObjectiveId ?? d.dong.targetKeyResultId ?? "") ?? "?"}`
						: dongKr(d),
				),
			];
		})
		.join("\n");
}

export function nguCanhJudge(goi: GoiSoan | null): string {
	if (!goi) return "(không có)";
	return JSON.stringify({
		trangChienLuoc: goi.lop05.map((t) => ({ ten: t.ten, noiDung: t.noiDung })),
		donVi: goi.lop1,
		capTren: goi.lop2a.capTren,
		kyTruoc: goi.lop3,
		soCrm: goi.lop4.chiSo,
	});
}
