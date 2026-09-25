"use client";

import { useMessages } from "@crm/ui/components/locale-provider";
import {
	type StatusSize,
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";

export type MucTuTin = "cao" | "vua" | "thap";

export type NhipOkr =
	| "dung-nhip"
	| "cham-nhip"
	| "truot"
	| "chua-co-ky-vong"
	| "moc-xong"
	| "moc-chua";

const TONE_TU_TIN = {
	cao: "success",
	vua: "warning",
	thap: "error",
} satisfies Record<MucTuTin, StatusTone>;

const TONE_NHIP = {
	"dung-nhip": "success",
	"cham-nhip": "warning",
	truot: "error",
	"chua-co-ky-vong": "neutral",
	"moc-xong": "success",
	"moc-chua": "neutral",
} satisfies Record<NhipOkr, StatusTone>;

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
			tone={TONE_TU_TIN[level]}
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
			tone={TONE_NHIP[pace]}
		/>
	);
}

export { ConfidenceIndicator, PaceIndicator, TONE_NHIP, TONE_TU_TIN };
