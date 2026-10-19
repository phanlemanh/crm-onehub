"use client";

import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { useLocale } from "@crm/ui/components/locale-provider";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { viecMessages } from "@/lib/messages/viec";

export function HoiDongCha({
	den,
	conMo,
	open,
	pending,
	onOpenChange,
	onDongY,
}: {
	den: "XONG" | "HUY";
	conMo: number;
	open: boolean;
	pending: boolean;
	onOpenChange: (open: boolean) => void;
	onDongY: () => void;
}) {
	const m = viecMessages(useLocale());
	const huy = den === "HUY";
	return (
		<ConfirmDialog
			nut={huy ? m.con.dongYHuy : m.con.dongYXong}
			onConfirm={onDongY}
			onOpenChange={onOpenChange}
			open={open}
			pending={pending}
			than={dien(huy ? m.con.hoiHuy : m.con.hoiXong, { n: conMo })}
			thoi={m.con.thoi}
			tieuDe={m.con.hoiTieuDe}
			tone={huy ? "destructive" : "default"}
		/>
	);
}
