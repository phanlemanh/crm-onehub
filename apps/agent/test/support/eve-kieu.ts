export type ThuocTinhPhien = Record<string, string>;

export type CtxPhien = {
	session: {
		id: string;
		auth: {
			current: { attributes: ThuocTinhPhien } | null;
			initiator: null;
		};
	};
};

export type SuKienAudit = {
	type: string;
	data: {
		usage: {
			inputTokens: number | null;
			outputTokens: number | null;
			costUsd: number | null;
		};
	};
	meta: { id: string; at: string };
};

export type XuLyAudit = (e: SuKienAudit, c: CtxPhien) => Promise<void>;

export type SuKienTrong = Record<string, never>;

export type ChiDanRa = { markdown?: string } | null;

export type GiaiChiDan = (
	e: SuKienTrong,
	c: CtxPhien,
) => Promise<ChiDanRa> | ChiDanRa;

export type DauVaoCongCu = Record<string, string | number | null | undefined>;

export type CongCuGia = {
	execute: (input: DauVaoCongCu, ctx: CtxPhien | SuKienTrong) => unknown;
};

export type GiaiCongCu = (
	e: SuKienTrong,
	c: CtxPhien,
) =>
	| Promise<Record<string, CongCuGia> | null>
	| Record<string, CongCuGia>
	| null;

export type DuLieuSuKienKenh = Record<string, string>;

export type XuLySuKienKenh = (
	d: DuLieuSuKienKenh,
	c: { continuationToken: string },
	x?: CtxPhien,
) => Promise<void>;

export function phienAudit(sessionId: string, purpose: string): CtxPhien {
	return {
		session: {
			id: sessionId,
			auth: { current: { attributes: { purpose } }, initiator: null },
		},
	};
}

export type XuLySuKienKenhDoi = (
	d: DuLieuSuKienKenh,
	c: { continuationToken: string; setContinuationToken: (t: string) => void },
	x?: CtxPhien,
) => Promise<void>;
