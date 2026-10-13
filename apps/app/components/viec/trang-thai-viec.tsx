"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { formatDay } from "@crm/ui/lib/format";
import { type NghiaTrangThai, toneTheoNghia } from "@crm/ui/lib/status-tone";
import { viecMessages } from "@/lib/messages/viec";
import type { RouterOutputs } from "@/lib/trpc/types";

export type ViecDong = RouterOutputs["viec"]["cuaToi"]["mo"][number];

export type TrangThaiViec = ViecDong["trangThai"];

const NGHIA = {
	CHUA_LAM: "nhap",
	DANG_LAM: "dangChay",
	CHO_DANH_GIA: "cho",
	XONG: "xong",
} as const satisfies Record<Exclude<TrangThaiViec, "HUY">, NghiaTrangThai>;

export function TrangThaiViecNhan({ trangThai }: { trangThai: TrangThaiViec }) {
	const m = viecMessages(useLocale());
	if (trangThai === "HUY") {
		return (
			<span className="text-muted-foreground text-sm">{m.trangThai.HUY}</span>
		);
	}
	return (
		<StatusIndicator
			label={m.trangThai[trangThai]}
			tone={toneTheoNghia(NGHIA[trangThai])}
		/>
	);
}

export function HanViec({
	viec,
}: {
	viec: Pick<ViecDong, "hanNgay" | "quaHan">;
}) {
	const locale = useLocale();
	const m = viecMessages(locale);
	if (viec.hanNgay === null) {
		return <span className="text-muted-foreground">{m.khongHan}</span>;
	}
	const nhan = formatDay(viec.hanNgay, locale);
	if (viec.quaHan) {
		return <StatusIndicator label={nhan} tone={toneTheoNghia("hong")} />;
	}
	return <span className="text-muted-foreground tabular-nums">{nhan}</span>;
}
