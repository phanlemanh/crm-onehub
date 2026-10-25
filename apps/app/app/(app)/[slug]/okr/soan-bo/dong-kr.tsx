"use client";

import { Button } from "@crm/ui/components/button";
import { Combobox, type ComboboxOption } from "@crm/ui/components/combobox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { InputGroup, InputGroupInput } from "@crm/ui/components/input-group";
import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { Textarea } from "@crm/ui/components/textarea";
import type { Locale } from "@crm/ui/lib/locale";
import { docSoOkr, KIEU_KR } from "@crm/validation/okr-kr";
import { type FocusEvent, type KeyboardEvent, useEffect, useRef } from "react";
import { crmMessages } from "@/lib/messages/crm";
import { okrMessages } from "@/lib/messages/okr";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import { hienSo } from "../hop-thoai-kr";
import type { KrNhap } from "./ban-nhap";
import type { DongKrNhap } from "./du-lieu-bo";
import { usePhuThuocSoan } from "./phu-thuoc";
import type { MucTieuSoan } from "./use-bo-soan";
import type { LyChuaLuu, TrangThaiLuu } from "./use-luu-dong";

type KrSoan = MucTieuSoan["keyResults"][number];

function chuSo(kr: KrSoan, so: number, locale: Locale): string {
	return kr.kind === "moc" ? "" : hienSo(so, locale);
}

export function DongKrDoc({
	kr,
	khoa,
	locale,
}: {
	kr: KrSoan;
	khoa: boolean;
	locale: Locale;
}) {
	const m = okrMessages(locale).hopThoai;
	return (
		<li className="flex flex-col gap-2 border-l py-1 pl-4" data-dong-kr={kr.id}>
			<Textarea
				variant="tai-lieu"
				size="dong"
				rows={1}
				aria-label={m.tenKr}
				defaultValue={kr.title}
				disabled={khoa}
				translate="no"
			/>
			<div className="flex flex-wrap items-center gap-2" data-o-so={kr.id}>
				<InputGroup className="w-24">
					<InputGroupInput
						aria-label={m.khoiDiem}
						defaultValue={chuSo(kr, kr.startValue, locale)}
						inputMode="decimal"
						disabled={khoa}
					/>
				</InputGroup>
				<InputGroup className="w-24">
					<InputGroupInput
						aria-label={m.dich}
						defaultValue={chuSo(kr, kr.targetValue, locale)}
						inputMode="decimal"
						disabled={khoa}
					/>
				</InputGroup>
				<InputGroup className="w-28">
					<InputGroupInput
						aria-label={m.donViDo}
						defaultValue={kr.unit}
						disabled={khoa}
						translate="no"
					/>
				</InputGroup>
			</div>
		</li>
	);
}

export function cauChuaLuu(ly: LyChuaLuu, locale: Locale): string {
	return ly === "so-sai"
		? crmMessages(locale).truongKieu.tuChoi.so
		: okrSoanBoMessages(locale).taiLieu.chuaLuu[ly];
}

export function TrangThaiDong({ trangThai }: { trangThai: TrangThaiLuu }) {
	const locale = useLocale();
	const m = okrSoanBoMessages(locale);
	switch (trangThai.loai) {
		case "yen":
			return null;
		case "dang-luu":
			return <StatusIndicator size="sm" busy label={m.taiLieu.dangLuu} />;
		case "chua-luu":
			return (
				<StatusIndicator
					size="sm"
					tone="warning"
					label={cauChuaLuu(trangThai.ly, locale)}
				/>
			);
		case "loi":
			return <StatusIndicator size="sm" tone="error" label={trangThai.cau} />;
	}
}

export function laEnterGhi(e: KeyboardEvent<HTMLElement>): boolean {
	return (
		e.key === "Enter" &&
		!e.shiftKey &&
		!e.nativeEvent.isComposing &&
		(e.target instanceof HTMLInputElement ||
			e.target instanceof HTMLTextAreaElement)
	);
}

export function roiKhoi(e: FocusEvent<HTMLElement>): boolean {
	const toi = e.relatedTarget;
	return !(toi instanceof Node && e.currentTarget.contains(toi));
}

const soCua = (chu: string): number | null =>
	chu.trim() === "" ? null : docSoOkr(chu);

const laKieu = (v: string): v is (typeof KIEU_KR)[number] =>
	(KIEU_KR as readonly string[]).includes(v);

export function DongKrMoi({
	kr,
	thuTu,
	lanFocus,
	trangThai,
	idDaLuu,
	nguoiMacDinh,
	nguoi,
	onDoi,
	onEnter,
	onRoi,
}: {
	kr: KrNhap;
	thuTu: number;
	lanFocus: number | null;
	trangThai: TrangThaiLuu;
	idDaLuu: string | null;
	nguoiMacDinh: string;
	nguoi: ComboboxOption[];
	onDoi: (phan: Partial<DongKrNhap>) => void;
	onEnter: () => void;
	onRoi: () => void;
}) {
	const locale = useLocale();
	const m = okrSoanBoMessages(locale);
	const okr = okrMessages(locale);
	const phuThuoc = usePhuThuocSoan();
	const ten = useRef<HTMLTextAreaElement>(null);
	useEffect(() => {
		if (lanFocus !== null) ten.current?.focus();
	}, [lanFocus]);
	const kieuHien = kr.kieu ?? phuThuoc.suyKieu(soCua(kr.khoi), soCua(kr.dich));
	const nhan = m.taiLieu.krThu(String(thuTu));
	return (
		<li
			className="flex flex-col gap-2 border-l py-1 pl-4"
			data-dong-kr-moi={kr.khoa}
			data-dong-kr={idDaLuu ?? undefined}
			data-luu={trangThai.loai}
			onKeyDown={(e) => {
				if (!laEnterGhi(e)) return;
				e.preventDefault();
				onEnter();
			}}
			onBlur={(e) => {
				if (roiKhoi(e)) onRoi();
			}}
		>
			<div className="flex items-start gap-2">
				<span className="shrink-0 whitespace-nowrap pt-0.5 text-muted-foreground text-sm tabular-nums">
					{nhan}
				</span>
				<Textarea
					ref={ten}
					variant="tai-lieu"
					size="dong"
					rows={1}
					aria-label={nhan}
					placeholder={m.taiLieu.goKr}
					value={kr.ten}
					onChange={(e) => onDoi({ ten: e.target.value })}
					translate="no"
					data-o-nhap="ten"
				/>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<InputGroup className="w-24">
					<InputGroupInput
						aria-label={m.taiLieu.khoiDiem}
						placeholder={m.taiLieu.khoiDiem}
						value={kr.khoi}
						onChange={(e) => onDoi({ khoi: e.target.value })}
						inputMode="decimal"
						data-o-nhap="khoi"
					/>
				</InputGroup>
				<span aria-hidden className="text-muted-foreground text-sm">
					→
				</span>
				<InputGroup className="w-24">
					<InputGroupInput
						aria-label={m.taiLieu.dich}
						placeholder={m.taiLieu.dich}
						value={kr.dich}
						onChange={(e) => onDoi({ dich: e.target.value })}
						inputMode="decimal"
						data-o-nhap="dich"
					/>
				</InputGroup>
				<InputGroup className="w-28">
					<InputGroupInput
						aria-label={m.taiLieu.donViDo}
						placeholder={m.taiLieu.donViDo}
						value={kr.donVi}
						onChange={(e) => onDoi({ donVi: e.target.value })}
						translate="no"
						data-o-nhap="don-vi"
					/>
				</InputGroup>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" type="button">
							{kieuHien ? okr.kieu[kieuHien] : m.taiLieu.kieu}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						<DropdownMenuRadioGroup
							value={kr.kieu ?? ""}
							onValueChange={(v) => {
								if (laKieu(v)) onDoi({ kieu: v });
							}}
						>
							{KIEU_KR.map((k) => (
								<DropdownMenuRadioItem key={k} value={k}>
									{okr.kieu[k]}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>
				<div className="w-44">
					<Combobox
						size="sm"
						translate="no"
						aria-label={m.taiLieu.nguoiPhuTrach}
						options={nguoi}
						value={kr.nguoi ?? nguoiMacDinh}
						onValueChange={(v) => onDoi({ nguoi: v })}
						placeholder={okr.hopThoai.chonNguoi}
						searchPlaceholder={okr.hopThoai.timNguoi}
						empty={okr.hopThoai.khongAi}
					/>
				</div>
			</div>
			<TrangThaiDong trangThai={trangThai} />
		</li>
	);
}
