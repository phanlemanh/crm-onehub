import { z } from "zod";

export const TO_CHUC_TRAN = { moTa: 500, chucDanh: 80 } as const;

export const moTaDonVi = z.string().max(TO_CHUC_TRAN.moTa);

export const chucDanh = z.string().max(TO_CHUC_TRAN.chucDanh);
