import type { RouterOutputs } from "@/lib/trpc/types";

export type CayDuLieu = RouterOutputs["org"]["tree"];
export type ChuKy = RouterOutputs["okr"]["cycles"]["cycles"][number];
export type MucTieu = RouterOutputs["okr"]["byUnit"]["objectives"][number];
export type KetQua = MucTieu["keyResults"][number];
export type NutCay = RouterOutputs["okr"]["alignmentTree"]["roots"][number];
export type DuLieuCapNhat = RouterOutputs["okr"]["capNhatTuan"];
export type KrCapNhat = DuLieuCapNhat["items"][number];
export type ViecOkr = RouterOutputs["okr"]["viecCuaToi"]["viec"][number];

export const CELL = "px-3 py-2.5 align-middle";

export const nhanKr = (thuTu: number): string => `KR${thuTu}`;

export const THUT_CAY = { dauRem: 1, moiCapRem: 1.25 } as const;

export const CANH_KR = { soGoiY: 20 } as const;
