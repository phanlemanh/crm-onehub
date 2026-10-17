"use client";

import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { formatDay } from "@crm/ui/lib/format";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import { ODuKien } from "./o-du-kien";
import type { Viec } from "./viec";

export function ChuConNgay({ v }: { v: Viec }) {
	const m = loTrinhMessages(useLocale());
	if (v.conNgay === null || v.nhom_trang_thai === "da-giao") return null;
	if (v.tre)
		return (
			<StatusIndicator
				data-lo-trinh-con-ngay="tre"
				label={m.moc.tre(String(Math.abs(v.conNgay)))}
				size="sm"
				tone={toneTheoNghia("hong")}
			/>
		);
	return (
		<span
			className="text-muted-foreground text-xs tabular-nums"
			data-lo-trinh-con-ngay={v.conNgay === 0 ? "hom-nay" : "con"}
		>
			{v.conNgay === 0 ? m.moc.homNay : m.moc.conNgay(String(v.conNgay))}
		</span>
	);
}

export function OMoc({ v }: { v: Viec }) {
	const locale = useLocale();
	if (!v.moc) return <EmptyCellValue />;
	return (
		<span
			className="inline-flex flex-col items-end gap-0.5"
			data-lo-trinh-moc-viec={v.moc.ngay}
		>
			<span className="tabular-nums">{formatDay(v.moc.ngay, locale)}</span>
			<ChuConNgay v={v} />
			{v.duKien ? <ODuKien duKien={v.duKien} gon /> : null}
		</span>
	);
}
