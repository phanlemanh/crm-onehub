"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { formatNgayGio } from "@crm/ui/lib/format";
import { useSyncExternalStore } from "react";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";

export type NguonHien = { kieu: "ban-chup" | "ban-dung"; layLuc: string };

const khongDoi = () => () => {};
const muiGioTrinhDuyet = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export function DongGioLay({ nguon }: { nguon: NguonHien }) {
	const locale = useLocale();
	const m = loTrinhMessages(locale);
	const mui = useSyncExternalStore(khongDoi, muiGioTrinhDuyet, () => null);
	if (mui === null) return null;
	const gio = formatNgayGio(nguon.layLuc, locale, {
		timeZone: mui,
		phan: "ngay-gio",
	});
	return (
		<p className="text-muted-foreground text-sm" data-slot="gio-lay-lo-trinh">
			{m.gioLay.capNhat(gio)}
			{nguon.kieu === "ban-dung" ? ` ${m.gioLay.banDung}` : null}
		</p>
	);
}
