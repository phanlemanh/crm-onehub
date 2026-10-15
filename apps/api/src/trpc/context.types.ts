import type { Session, SessionUser, WorkspaceRole } from "@crm/auth";
import type { Request } from "express";
import type { PhamViYeuCau } from "./pham-vi-yeu-cau";

export type BaseTrpcContext = {
	req?: Request;
	session: Session | null;
	sessionError: boolean;
	phamViYeuCau?: PhamViYeuCau;
};

export type AuthedTrpcContext = BaseTrpcContext & {
	user: SessionUser;
};

export type KhoaKeoTinHieu = {
	apiKeyId: string;
	userId: string;
	role: WorkspaceRole | null;
};

export type KhoaTrpcContext = BaseTrpcContext & {
	khoaKeoTinHieu: KhoaKeoTinHieu;
};
