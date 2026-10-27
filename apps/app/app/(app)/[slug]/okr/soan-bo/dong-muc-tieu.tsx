"use client";

import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Textarea } from "@crm/ui/components/textarea";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import { ChamTrangThai } from "../tien-do-kr";
import { laEnterGhi, TrangThaiDong } from "./dong-kr";
import type { TrangThaiLuu } from "./use-luu-dong";

export function MenuMucTieu({
	ten,
	onXoa,
}: {
	ten: string;
	onXoa: () => void;
}) {
	const m = okrSoanBoMessages(useLocale()).taiLieu;
	const [hoi, datHoi] = useState(false);
	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						type="button"
						aria-label={m.thaoTacMucTieu}
						data-nut="menu-muc-tieu"
					>
						<Icon icon={OverflowMenuHorizontal} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						variant="destructive"
						data-nut="xoa-muc-tieu"
						onSelect={() => datHoi(true)}
					>
						{m.xoaMucTieu}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ConfirmDialog
				tieuDe={m.hoiXoa.tieuDe(ten)}
				than={m.hoiXoa.than}
				nut={m.hoiXoa.nut}
				thoi={m.hoiXoa.thoi}
				open={hoi}
				onOpenChange={datHoi}
				pending={false}
				onConfirm={() => {
					datHoi(false);
					onXoa();
				}}
			/>
		</>
	);
}

export function DongMucTieuMoi({
	ten,
	lanFocus,
	trangThai,
	menu,
	onDoi,
	onEnter,
	onRoi,
}: {
	ten: string;
	lanFocus: number | null;
	trangThai: TrangThaiLuu;
	menu: ReactNode;
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
				{menu ? <div className="ml-auto">{menu}</div> : null}
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

export function OViSao({
	value,
	disabled,
	onDoi,
	onRoi,
}: {
	value: string;
	disabled: boolean;
	onDoi: (viSao: string) => void;
	onRoi: () => void;
}) {
	const m = okrSoanBoMessages(useLocale()).taiLieu;
	return (
		<Textarea
			variant="tai-lieu"
			size="dong"
			rows={1}
			aria-label={m.viSao}
			placeholder={m.viSao}
			value={value}
			disabled={disabled}
			onChange={(e) => onDoi(e.target.value)}
			onBlur={onRoi}
			onKeyDown={(e) => {
				if (!laEnterGhi(e)) return;
				e.preventDefault();
				onRoi();
			}}
			translate="no"
			data-o-nhap="vi-sao"
		/>
	);
}

export function NutThemKr({ onThem }: { onThem: () => void }) {
	const m = okrSoanBoMessages(useLocale()).taiLieu;
	return (
		<Button
			variant="ghost"
			size="sm"
			type="button"
			className="w-fit"
			data-nut="them-kr"
			onClick={onThem}
		>
			{m.themKr}
			<Badge variant="mono">{m.phimThemKr}</Badge>
		</Button>
	);
}
