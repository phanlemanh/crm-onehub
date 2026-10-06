import type { Session, SessionUser } from "@crm/auth";
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
