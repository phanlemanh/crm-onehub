import { PASSWORD } from "@crm/auth";

export const GIAY_MOI_PHUT = 60;

export function phutLienKetDatMatKhau(): number {
	return Math.round(PASSWORD.tokenTtlSeconds / GIAY_MOI_PHUT);
}
