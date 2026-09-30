"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { RestrictedBadge } from "@crm/ui/components/restricted-badge";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { okrGioiHanMessages } from "@/lib/messages/okr-gioi-han";

export function NhanGioiHan({
	soNguoiXem,
	moHop,
	focusable = true,
}: {
	soNguoiXem: number;
	moHop: (() => void) | null;
	focusable?: boolean;
}) {
	const m = okrGioiHanMessages(useLocale()).nhan;
	const goiY =
		soNguoiXem === 0 ? m.goiYKhongTen : dien(m.goiY, { n: soNguoiXem });
	return (
		<RestrictedBadge
			focusable={focusable}
			hint={goiY}
			label={m.gioiHan}
			onOpen={moHop}
		/>
	);
}
