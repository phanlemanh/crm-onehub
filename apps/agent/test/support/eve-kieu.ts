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

export type CtxPhienKenh = CtxPhien & {
	agent: { name: string };
	channel: { kind: string; continuationToken?: string };
};

export type HanhDongYeuCau = {
	kind: string;
	callId: string;
	subagentName?: string;
	toolName?: string;
};

export type SuKienYeuCauHanhDong = {
	type: "actions.requested";
	data: { actions: HanhDongYeuCau[]; turnId: string; stepIndex: number };
};

export type XuLyYeuCauHanhDong = (
	e: SuKienYeuCauHanhDong,
	c: CtxPhienKenh,
) => void;

export type SuKienKetQuaHanhDong = {
	type: "action.result";
	data: {
		result: {
			kind: string;
			subagentName: string;
			callId: string;
			isError: boolean;
			output: { code: string; message: string };
		};
	};
};

export type XuLyKetQuaHanhDong = (
	e: SuKienKetQuaHanhDong,
	c: CtxPhienKenh,
) => Promise<void>;

export type SuKienPhien = { type: string; data: SuKienTrong };

export type XuLySuKienPhien = (
	e: SuKienPhien,
	c: CtxPhienKenh,
) => Promise<void>;
