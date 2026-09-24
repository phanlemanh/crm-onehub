import type { PhamViDuLieu, WorkspaceRole } from "@crm/auth";

export type PhamViYeuCau = {
	role: WorkspaceRole | null;
	phamVi: PhamViDuLieu | null;
};

export type CoPhamViYeuCau = { phamViYeuCau?: PhamViYeuCau };

export function moPhamViYeuCau(): PhamViYeuCau {
	return { role: null, phamVi: null };
}

export function ghiPhamViYeuCau(
	ctx: CoPhamViYeuCau,
	phamVi: PhamViYeuCau,
): void {
	if (ctx.phamViYeuCau) {
		ctx.phamViYeuCau.role = phamVi.role;
		ctx.phamViYeuCau.phamVi = phamVi.phamVi;
	}
}

export function docPhamViYeuCau(ctx: CoPhamViYeuCau): PhamViYeuCau {
	return ctx.phamViYeuCau ?? moPhamViYeuCau();
}
