"use client";

import { Badge } from "@crm/ui/components/badge";
import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { formatDay, formatDayShort, formatDecimal } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import type { GioMayViec } from "@crm/validation/lo-trinh-du-lieu";
import { type DuKienMoc, gioMayChuaDu } from "@/lib/lo-trinh/du-kien";
import { type LoTrinhMessages, loTrinhMessages } from "@/lib/messages/lo-trinh";

function CoDuKien({
	duKien,
	m,
}: {
	duKien: Extract<DuKienMoc, { kieu: "co-ngay" }>;
	m: LoTrinhMessages["duKien"];
}) {
	return (
		<>
			{duKien.chuaDuSoDo ? (
				<Badge data-lo-trinh-du-kien-co="chua-du-so-do" variant="outline">
					{m.chuaDuSoDo}
				</Badge>
			) : null}
			{duKien.quaTai ? (
				<StatusIndicator
					data-lo-trinh-du-kien-co="qua-tai"
					label={m.quaTai}
					size="sm"
					tone={toneTheoNghia("cho")}
				/>
			) : null}
			{duKien.daQua ? (
				<StatusIndicator
					data-lo-trinh-du-kien-co="da-qua"
					label={m.daQua}
					size="sm"
					tone={toneTheoNghia("cho")}
				/>
			) : null}
		</>
	);
}

export function ODuKien({ duKien, gon }: { duKien: DuKienMoc; gon: boolean }) {
	const locale = useLocale();
	const m = loTrinhMessages(locale).duKien;
	if (duKien.kieu === "chua-co")
		return gon ? (
			<span
				className="text-muted-foreground text-xs"
				data-lo-trinh-du-kien="chua-co"
				data-ly-do={duKien.lyDo}
			>
				{m.chuaCo}
			</span>
		) : (
			<span
				className="flex flex-col gap-0.5"
				data-lo-trinh-du-kien="chua-co"
				data-ly-do={duKien.lyDo}
			>
				<StatusIndicator
					label={m.chuaCo}
					size="sm"
					tone={toneTheoNghia("nhap")}
				/>
				<span className="text-muted-foreground text-xs">
					{m.lyDo[duKien.lyDo]}
				</span>
			</span>
		);
	if (gon)
		return (
			<span
				className="inline-flex flex-col items-end gap-1 text-muted-foreground text-xs"
				data-hoan-tat={duKien.hoanTat}
				data-lo-trinh-du-kien="co-ngay"
			>
				<span className="tabular-nums">
					{m.ngayGon(formatDayShort(duKien.hoanTat, locale))}
				</span>
				<CoDuKien duKien={duKien} m={m} />
			</span>
		);
	return (
		<span
			className="flex flex-col gap-1"
			data-hoan-tat={duKien.hoanTat}
			data-lo-trinh-du-kien="co-ngay"
		>
			<span className="flex flex-wrap items-center gap-2">
				<span className="tabular-nums">
					{m.ngay(formatDay(duKien.hoanTat, locale))}
				</span>
				<CoDuKien duKien={duKien} m={m} />
			</span>
			<span className="text-muted-foreground text-xs">
				{duKien.ngayTinh
					? m.cachTinh(formatDay(duKien.ngayTinh, locale))
					: m.cachTinhKhongNgay}
				{duKien.chuaDuSoDo ? ` ${m.chuaDuSoDoMoTa}` : ""}
			</span>
		</span>
	);
}

function khoangGio(gioMay: GioMayViec, locale: Locale): string | null {
	if (gioMay.thap === null || gioMay.cao === null) return null;
	const thap = formatDecimal(gioMay.thap, locale);
	return gioMay.thap === gioMay.cao
		? thap
		: `${thap}–${formatDecimal(gioMay.cao, locale)}`;
}

export function OUocLuong({ gioMay }: { gioMay: GioMayViec | null }) {
	const locale = useLocale();
	const m = loTrinhMessages(locale).duKien;
	const khoang = gioMay ? khoangGio(gioMay, locale) : null;
	if (khoang === null) return null;
	return (
		<span
			className="flex flex-wrap items-center gap-2"
			data-lo-trinh-uoc-luong={gioMay?.nguon ?? ""}
		>
			<span className="tabular-nums">{m.gio(khoang)}</span>
			{gioMayChuaDu(gioMay) ? (
				<Badge data-lo-trinh-du-kien-co="chua-du-so-do" variant="outline">
					{m.chuaDuSoDo}
				</Badge>
			) : null}
		</span>
	);
}
