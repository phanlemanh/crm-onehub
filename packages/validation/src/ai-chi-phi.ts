import {
	KET_QUA_DOI_SOAT,
	NHOM_VIEC_AI,
	TINH_NANG,
} from "@crm/db/ai-chi-phi-danh-muc";
import { z } from "zod";

export {
	KET_QUA_DOI_SOAT,
	ketQuaDoiSoat,
	laTinhNang,
	MOC_BAO_TRAN,
	type MocBaoTran,
	mocBaoTran,
	NGUONG_LECH_DOI_SOAT,
	type NguonBuoc,
	NHOM_CUA_TINH_NANG,
	NHOM_VIEC_AI,
	type NhomViecAi,
	SUBAGENT_CO_SO,
	type SubagentCoSo,
	TINH_NANG,
	TINH_NANG_TRO_LY_OKR,
	type TinhNang,
	tinhNangCua,
} from "@crm/db/ai-chi-phi-danh-muc";

export const tinhNang = z.enum(TINH_NANG);

export const nhomViecAi = z.enum(NHOM_VIEC_AI);

export const ketQuaDoiSoatEnum = z.enum(KET_QUA_DOI_SOAT);

export const doiSoat = z.object({
	thang: z.string().regex(/^\d{4}-\d{2}$/),
	soSoUsd: z.number(),
	soGatewayUsd: z.number().nullable(),
	lechPhanTram: z.number().nullable(),
	ketQua: ketQuaDoiSoatEnum,
	lyDo: z.string().nullable(),
	luc: z.date(),
});

export type DoiSoat = z.infer<typeof doiSoat>;
