import type { PhamViDuLieu, WorkspaceRole } from "@crm/auth";
import type { Request } from "express";

export type PhamViYeuCau = {
	role: WorkspaceRole | null;
	phamVi: PhamViDuLieu | null;
};

const theoYeuCau = new WeakMap<Request, PhamViYeuCau>();

export function ghiPhamViYeuCau(
	req: Request | undefined,
	phamVi: PhamViYeuCau,
): void {
	if (req) theoYeuCau.set(req, phamVi);
}

export function docPhamViYeuCau(req: Request | undefined): PhamViYeuCau {
	return (req && theoYeuCau.get(req)) ?? { role: null, phamVi: null };
}
