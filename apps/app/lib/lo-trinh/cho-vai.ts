import type { WorkspaceRole } from "@crm/validation/vai-workspace";
import { LO_TRINH } from "./cau-hinh";
import type { DauVaoLoTrinh } from "./doc-trang";

export function choVaiXem(
	dauVao: DauVaoLoTrinh,
	vai: WorkspaceRole | null,
): DauVaoLoTrinh {
	if (dauVao.kieu !== "co-du-lieu" || vai === LO_TRINH.vaiThaySoLieu)
		return dauVao;
	return {
		...dauVao,
		duLieu: {
			...dauVao.duLieu,
			lo_trinh: dauVao.duLieu.lo_trinh.map((lo) => ({
				...lo,
				hang: lo.hang.map((h) =>
					h.tom_tat ? { ...h, tom_tat: { ...h.tom_tat, chu_kho: null } } : h,
				),
			})),
		},
	};
}
