"use client";

import { Combobox } from "@crm/ui/components/combobox";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { DatePicker } from "@crm/ui/components/date-picker";
import { FieldError } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { formatDay } from "@crm/ui/lib/format";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { viecMessages } from "@/lib/messages/viec";
import { useTRPC } from "@/lib/trpc/client";

const KHONG_DU_AN = "khong";

export function OBatDauViec({
	batDauNgay,
	hanNgay,
	suaDuoc,
	onLuu,
}: {
	batDauNgay: string | null;
	hanNgay: string | null;
	suaDuoc: boolean;
	onLuu: (batDau: string | null) => void;
}) {
	const locale = useLocale();
	const m = viecMessages(locale);
	const [loi, setLoi] = useState<string | null>(null);
	if (!suaDuoc) {
		return (
			<span className="text-muted-foreground tabular-nums">
				{batDauNgay ? formatDay(batDauNgay, locale) : "—"}
			</span>
		);
	}
	return (
		<span className="flex flex-col gap-1" data-o-bat-dau="">
			<DatePicker
				onChange={(ngay) => {
					const batDau = ngay === "" ? null : ngay;
					if (batDau && hanNgay && batDau > hanNgay) {
						setLoi(m.khung.batDauSauHan);
						return;
					}
					setLoi(null);
					onLuu(batDau);
				}}
				placeholder={m.oSoan.chonHan}
				value={batDauNgay}
			/>
			{loi ? <FieldError>{loi}</FieldError> : null}
		</span>
	);
}

export function ODuAnViec({
	duAn,
	rieng,
	suaDuoc,
	dangDoi,
	onDoi,
}: {
	duAn: { id: string; ten: string } | null;
	rieng: boolean;
	suaDuoc: boolean;
	dangDoi: boolean;
	onDoi: (duAnId: string | null) => void;
}) {
	const m = viecMessages(useLocale()).khung;
	const trpc = useTRPC();
	const [hoi, setHoi] = useState<{ id: string; ten: string } | null>(null);
	const ds = useQuery({
		...trpc.duAn.list.queryOptions({ trangThai: "mo" }),
		enabled: suaDuoc,
	});
	const duAnMo = ds.data ?? [];
	const hienTaiMo = duAn ? duAnMo.some((d) => d.id === duAn.id) : true;

	if (!suaDuoc || !hienTaiMo) {
		return <span translate="no">{duAn?.ten ?? m.khongDuAn}</span>;
	}

	const chon = (id: string) => {
		if (id === (duAn?.id ?? KHONG_DU_AN)) return;
		const moi = id === KHONG_DU_AN ? null : id;
		const ten = duAnMo.find((d) => d.id === moi)?.ten;
		if (moi && ten && !duAn && rieng) {
			setHoi({ id: moi, ten });
			return;
		}
		onDoi(moi);
	};

	return (
		<>
			<Combobox
				aria-label={m.duAn}
				onValueChange={chon}
				options={[
					{ value: KHONG_DU_AN, label: m.khongDuAn },
					...duAnMo.map((d) => ({ value: d.id, label: d.ten })),
				]}
				selectedOption={duAn ? { value: duAn.id, label: duAn.ten } : undefined}
				translate="no"
				value={duAn?.id ?? KHONG_DU_AN}
			/>
			<ConfirmDialog
				nut={m.congKhaiNut}
				onConfirm={() => {
					if (hoi) onDoi(hoi.id);
					setHoi(null);
				}}
				onOpenChange={(mo) => {
					if (!mo) setHoi(null);
				}}
				open={hoi !== null}
				pending={dangDoi}
				than={m.congKhaiThan}
				thoi={m.congKhaiThoi}
				tieuDe={dien(m.congKhaiTieuDe, { ten: hoi?.ten ?? "" })}
				tone="default"
			/>
		</>
	);
}
