import type {
	ProposedChangeDecision,
	ProposedChangeProps,
	ProposedChangeTone,
} from "@crm/ui/components/proposed-change";
import type { TruongVietLai } from "@crm/validation/okr-tro-ly";
import type { OkrGopYMessages } from "@/lib/messages/okr-gop-y";
import type { RouterOutputs } from "@/lib/trpc/types";

export type DongHien = RouterOutputs["okr"]["troLyDanhSach"]["dong"][number];

export type KetQuyet = ProposedChangeDecision;

export type HanhDongThe =
	| "nhan"
	| "sua"
	| "bac"
	| "bo-qua"
	| "can-chinh"
	| "mo-kr"
	| "nhan-ban-sua"
	| "huy-sua";

export type NutThe = {
	id: HanhDongThe;
	label: string;
	tone: ProposedChangeTone;
	disabled?: boolean;
};

export type NguCanhThe = {
	m: OkrGopYMessages;
	ket?: KetQuyet;
	dangSua?: boolean;
	dangGui?: boolean;
	loi?: string;
	lyDoKhoa?: string;
	coMoKr?: boolean;
	lyDoKhoaMoKr?: string;
};

export type PhanThe = Pick<
	ProposedChangeProps,
	| "kind"
	| "label"
	| "before"
	| "value"
	| "rationale"
	| "pending"
	| "decided"
	| "error"
	| "lockedReason"
>;

export type PropsThe = {
	the: PhanThe;
	nut: NutThe[];
	truongChi: TruongVietLai | null;
};

type PhanDong = Omit<PhanThe, "pending"> & {
	nut: NutThe[];
	truongChi: TruongVietLai | null;
};

export function nhanO(d: DongHien, m: OkrGopYMessages): string {
	if (d.loai === "viet-lai" && d.truong) return m.dong.truong[d.truong];
	return m.dong.loai[d.loai];
}

function nutVietLai(c: NguCanhThe, m: OkrGopYMessages): NutThe[] {
	const khoa = c.lyDoKhoa !== undefined;
	if (c.dangSua) {
		return [
			{
				id: "nhan-ban-sua",
				label: m.dong.nhanBanSua,
				tone: "primary",
				disabled: khoa,
			},
			{ id: "huy-sua", label: m.dong.huySua, tone: "secondary" },
		];
	}
	return [
		{ id: "nhan", label: m.dong.nhan, tone: "primary", disabled: khoa },
		{ id: "sua", label: m.dong.sua, tone: "secondary" },
		{ id: "bac", label: m.dong.bac, tone: "quiet" },
	];
}

function nutCauHoi(d: DongHien, c: NguCanhThe, m: OkrGopYMessages): NutThe[] {
	const boQua: NutThe = { id: "bo-qua", label: m.dong.boQua, tone: "quiet" };
	if (d.keyResultId === null || !c.coMoKr) return [boQua];
	return [
		{
			id: "mo-kr",
			label: m.dong.moKr,
			tone: "secondary",
			disabled: c.lyDoKhoaMoKr !== undefined,
		},
		boQua,
	];
}

function phanDong(d: DongHien, c: NguCanhThe, m: OkrGopYMessages): PhanDong {
	if (d.loai === "hoi") {
		return {
			kind: "question",
			label: m.dong.loai.hoi,
			value: d.sau ?? d.lyDo,
			rationale: d.sau ? d.lyDo : undefined,
			error: c.loi,
			lockedReason: d.keyResultId !== null ? c.lyDoKhoaMoKr : undefined,
			nut: nutCauHoi(d, c, m),
			truongChi: null,
		};
	}
	if (d.loai === "can-chinh") {
		return {
			kind: "compact",
			label: m.dong.loai["can-chinh"],
			value: m.dong.gopVao(d.tenDich ?? ""),
			rationale: d.lyDo,
			error: c.loi,
			lockedReason: c.lyDoKhoa,
			nut: [
				{
					id: "can-chinh",
					label: m.dong.canChinh,
					tone: "primary",
					disabled: c.lyDoKhoa !== undefined,
				},
				{ id: "bac", label: m.dong.bac, tone: "quiet" },
			],
			truongChi: null,
		};
	}
	return {
		kind: "rewrite",
		label: `${m.dong.loai["viet-lai"]} · ${nhanO(d, m)}`,
		before: d.truoc ?? "",
		value: d.sau ?? "",
		rationale: d.lyDo,
		error: c.loi,
		lockedReason: c.lyDoKhoa,
		nut: nutVietLai(c, m),
		truongChi: d.truong,
	};
}

function chuDaQuyet(d: DongHien, m: OkrGopYMessages, ket: KetQuyet): string {
	return `${nhanO(d, m)} — ${m.dong.ket[ket]}`;
}

export function propsThe(d: DongHien, c: NguCanhThe): PropsThe {
	const { nut, truongChi, ...phan } = phanDong(d, c, c.m);
	if (c.ket) {
		return {
			the: {
				...phan,
				decided: {
					decision: c.ket,
					text: chuDaQuyet(d, c.m, c.ket),
				},
				pending: false,
			},
			nut: [],
			truongChi,
		};
	}
	return { the: { ...phan, pending: c.dangGui === true }, nut, truongChi };
}
