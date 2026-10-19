"use client";

import { useMessages } from "@crm/ui/components/locale-provider";
import {
	type StatusSize,
	StatusIndicator,
} from "@crm/ui/components/status-indicator";
import { type NghiaTrangThai, toneTheoNghia } from "@crm/ui/lib/status-tone";

export type MucTuTin = "cao" | "vua" | "thap";

export type NhipOkr =
	| "dung-nhip"
	| "cham-nhip"
	| "truot"
	| "chua-co-ky-vong"
	| "moc-xong"
	| "moc-chua";

const NGHIA_TU_TIN = {
	cao: "xong",
	vua: "cho",
	thap: "hong",
} as const satisfies Record<MucTuTin, NghiaTrangThai>;

const NGHIA_NHIP = {
	"dung-nhip": "xong",
	"cham-nhip": "cho",
	truot: "hong",
	"chua-co-ky-vong": "nhap",
	"moc-xong": "xong",
	"moc-chua": "nhap",
} as const satisfies Record<NhipOkr, NghiaTrangThai>;

function ConfidenceIndicator({
	level,
	size,
}: {
	level: MucTuTin;
	size?: StatusSize;
}) {
	const msg = useMessages();
	const nhan = {
		cao: msg.okr.tuTinCao,
		vua: msg.okr.tuTinVua,
		thap: msg.okr.tuTinThap,
	} satisfies Record<MucTuTin, string>;
	return (
		<StatusIndicator
			data-tu-tin={level}
			label={nhan[level]}
			size={size}
			tone={toneTheoNghia(NGHIA_TU_TIN[level])}
		/>
	);
}

function PaceIndicator({ pace, size }: { pace: NhipOkr; size?: StatusSize }) {
	const msg = useMessages();
	const nhan = {
		"dung-nhip": msg.okr.dungNhip,
		"cham-nhip": msg.okr.chamNhip,
		truot: msg.okr.truot,
		"chua-co-ky-vong": msg.okr.chuaCoKyVong,
		"moc-xong": msg.okr.mocXong,
		"moc-chua": msg.okr.mocChua,
	} satisfies Record<NhipOkr, string>;
	return (
		<StatusIndicator
			data-tinh-trang={pace}
			label={nhan[pace]}
			size={size}
			tone={toneTheoNghia(NGHIA_NHIP[pace])}
		/>
	);
}

export { ConfidenceIndicator, NGHIA_NHIP, NGHIA_TU_TIN, PaceIndicator };
