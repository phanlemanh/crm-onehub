"use client";

import { Badge } from "@crm/ui/components/badge";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Textarea } from "@crm/ui/components/textarea";
import { useEffect, useRef } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import { ChamTrangThai } from "../tien-do-kr";
import { laEnterGhi, TrangThaiDong } from "./dong-kr";
import type { TrangThaiLuu } from "./use-luu-dong";

export function DongMucTieuMoi({
	ten,
	lanFocus,
	trangThai,
	onDoi,
	onEnter,
	onRoi,
}: {
	ten: string;
	lanFocus: number | null;
	trangThai: TrangThaiLuu;
	onDoi: (ten: string) => void;
	onEnter: () => void;
	onRoi: () => void;
}) {
	const locale = useLocale();
	const m = okrSoanBoMessages(locale);
	const okr = okrMessages(locale);
	const o = useRef<HTMLTextAreaElement>(null);
	useEffect(() => {
		if (lanFocus !== null) o.current?.focus();
	}, [lanFocus]);
	return (
		<>
			<div className="flex flex-wrap items-center gap-2">
				<ChamTrangThai status="nhap" />
				<Badge variant="outline">{okr.loai["cam-ket"]}</Badge>
			</div>
			<Textarea
				ref={o}
				variant="tai-lieu"
				size="tieu-de"
				rows={1}
				aria-label={okr.hopThoai.tenMucTieu}
				placeholder={m.taiLieu.goMucTieu}
				value={ten}
				onChange={(e) => onDoi(e.target.value)}
				onKeyDown={(e) => {
					if (!laEnterGhi(e)) return;
					e.preventDefault();
					onEnter();
				}}
				onBlur={onRoi}
				translate="no"
				data-o-nhap="ten"
			/>
			<TrangThaiDong trangThai={trangThai} />
		</>
	);
}
