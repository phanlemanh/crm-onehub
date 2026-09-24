import type { Session, SessionUser } from "@crm/auth";
import type { Request } from "express";
import type { PhamViYeuCau } from "./pham-vi-yeu-cau";

export type BaseTrpcContext = {
	req?: Request;
	session: Session | null;
	phamViYeuCau?: PhamViYeuCau;
};

export type AuthedTrpcContext = BaseTrpcContext & {
	user: SessionUser;
};
