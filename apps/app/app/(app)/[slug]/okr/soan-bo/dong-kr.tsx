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
import { KaraTrace } from "@crm/ui/components/kara";
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
import { type DongKrNhap, dongKrTrong } from "./du-lieu-bo";
import { usePhuThuocSoan } from "./phu-thuoc";
import type { MucTieuSoan } from "./use-bo-soan";
import type { LyChuaLuu, TrangThaiLuu } from "./use-luu-dong";

type KrSoan = MucTieuSoan["keyResults"][number];

function chuSo(kr: KrSoan, so: number, locale: Locale): string {
	return kr.kind === "moc" ? "" : hienSo(so, locale);
}

export function giaKrCo(
	kr: KrSoan,
	sua: Partial<DongKrNhap> | undefined,
	locale: Locale,
): DongKrNhap {
	return {
		ten: sua?.ten ?? kr.title,
		khoi: sua?.khoi ?? chuSo(kr, kr.startValue, locale),
		dich: sua?.dich ?? chuSo(kr, kr.targetValue, locale),
		donVi: sua?.donVi ?? kr.unit,
		kieu: kr.kind,
		nguoi: sua?.nguoi ?? kr.owner.id,
	};
}

export function laBackspaceXoa(
	e: KeyboardEvent<HTMLTextAreaElement>,
	gia: DongKrNhap,
): boolean {
	const o = e.currentTarget;
	return (
		e.key === "Backspace" &&
		!e.nativeEvent.isComposing &&
		o.selectionStart === 0 &&
		o.selectionEnd === 0 &&
		dongKrTrong(gia)
	);
}

export function focusDongTren(o: HTMLElement): void {
	const khoi = o.closest("[data-dong-mt], [data-dong-moi]");
	const ten = khoi
		? [...khoi.querySelectorAll<HTMLElement>("[data-o-nhap=ten]")]
		: [];
	ten[ten.indexOf(o) - 1]?.focus();
}

export function DauTheoKara() {
	return <KaraTrace label={okrSoanBoMessages(useLocale()).taiLieu.theoKara} />;
}

function MuiTen() {
	return (
		<span aria-hidden className="text-muted-foreground text-sm">
			→
		</span>
	);
}

function ONguoi({
	value,
	nguoi,
	daChon,
	disabled,
	onDoi,
}: {
	value: string;
	nguoi: ComboboxOption[];
	daChon?: ComboboxOption;
	disabled: boolean;
	onDoi: (nguoi: string) => void;
}) {
	const locale = useLocale();
	const m = okrSoanBoMessages(locale);
	const okr = okrMessages(locale);
	return (
		<div className="w-44">
			<Combobox
				size="sm"
				translate="no"
				aria-label={m.taiLieu.nguoiPhuTrach}
				options={nguoi}
				selectedOption={daChon}
				value={value}
				onValueChange={onDoi}
				disabled={disabled}
				placeholder={okr.hopThoai.chonNguoi}
				searchPlaceholder={okr.hopThoai.timNguoi}
				empty={okr.hopThoai.khongAi}
			/>
		</div>
	);
}

function NhanKr({ nhan }: { nhan: string }) {
	return (
		<span className="shrink-0 whitespace-nowrap pt-0.5 text-muted-foreground text-sm tabular-nums">
			{nhan}
		</span>
	);
}

export function DongKrDoc({
	kr,
	thuTu,
	gia,
	nguoi,
	khoaTen,
	khoaSo,
	trangThai,
	xoaDuoc,
	theoKara,
	onDoi,
	onRoi,
	onXoa,
}: {
	kr: KrSoan;
	thuTu: number;
	gia: DongKrNhap;
	nguoi: ComboboxOption[];
	khoaTen: boolean;
	khoaSo: boolean;
	trangThai: TrangThaiLuu | null;
	xoaDuoc: boolean;
	theoKara: boolean;
	onDoi: (phan: Partial<DongKrNhap>) => void;
	onRoi: () => void;
	onXoa: () => void;
}) {
	const locale = useLocale();
	const m = okrMessages(locale).hopThoai;
	const nhan = okrSoanBoMessages(locale).taiLieu.krThu(String(thuTu));
	const dangBo = useRef(false);
	const doi = (phan: Partial<DongKrNhap>, khoa: boolean) => {
		if (!khoa) onDoi(phan);
	};
	return (
		<li
			className="flex flex-col gap-2 border-l py-1 pl-4"
			data-dong-kr={kr.id}
			data-luu={trangThai?.loai}
			onKeyDown={(e) => {
				if (!laEnterGhi(e)) return;
				e.preventDefault();
				onRoi();
			}}
			onBlur={(e) => {
				if (!dangBo.current && roiKhoi(e)) onRoi();
			}}
		>
			<div className="flex items-start gap-2">
				<NhanKr nhan={nhan} />
				<Textarea
					variant="tai-lieu"
					size="dong"
					rows={1}
					aria-label={m.tenKr}
					value={gia.ten}
					onChange={(e) => doi({ ten: e.target.value }, khoaTen)}
					onKeyDown={(e) => {
						if (!xoaDuoc || khoaTen || !laBackspaceXoa(e, gia)) return;
						e.preventDefault();
						dangBo.current = true;
						onXoa();
						focusDongTren(e.currentTarget);
					}}
					disabled={khoaTen}
					translate="no"
					data-o-nhap="ten"
				/>
			</div>
			<div className="flex flex-wrap items-center gap-2" data-o-so={kr.id}>
				<InputGroup className="w-24">
					<InputGroupInput
						aria-label={m.khoiDiem}
						value={gia.khoi}
						onChange={(e) => doi({ khoi: e.target.value }, khoaSo)}
						inputMode="decimal"
						disabled={khoaSo}
						data-o-nhap="khoi"
					/>
				</InputGroup>
				<MuiTen />
				<InputGroup className="w-24">
					<InputGroupInput
						aria-label={m.dich}
						value={gia.dich}
						onChange={(e) => doi({ dich: e.target.value }, khoaSo)}
						inputMode="decimal"
						disabled={khoaSo}
						data-o-nhap="dich"
					/>
				</InputGroup>
				<InputGroup className="w-28">
					<InputGroupInput
						aria-label={m.donViDo}
						value={gia.donVi}
						onChange={(e) => doi({ donVi: e.target.value }, khoaSo)}
						disabled={khoaSo}
						translate="no"
						data-o-nhap="don-vi"
					/>
				</InputGroup>
				<ONguoi
					value={gia.nguoi ?? kr.owner.id}
					nguoi={nguoi}
					daChon={{ value: kr.owner.id, label: kr.owner.name }}
					disabled={khoaSo}
					onDoi={(v) => doi({ nguoi: v }, khoaSo)}
				/>
				{theoKara ? <DauTheoKara /> : null}
			</div>
			{trangThai ? <TrangThaiDong trangThai={trangThai} /> : null}
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
	onXoa,
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
	onXoa: () => void;
}) {
	const locale = useLocale();
	const m = okrSoanBoMessages(locale);
	const okr = okrMessages(locale);
	const phuThuoc = usePhuThuocSoan();
	const ten = useRef<HTMLTextAreaElement>(null);
	const dangBo = useRef(false);
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
				if (!dangBo.current && roiKhoi(e)) onRoi();
			}}
		>
			<div className="flex items-start gap-2">
				<NhanKr nhan={nhan} />
				<Textarea
					ref={ten}
					variant="tai-lieu"
					size="dong"
					rows={1}
					aria-label={nhan}
					placeholder={m.taiLieu.goKr}
					value={kr.ten}
					onChange={(e) => onDoi({ ten: e.target.value })}
					onKeyDown={(e) => {
						if (!laBackspaceXoa(e, kr)) return;
						e.preventDefault();
						dangBo.current = true;
						onXoa();
						focusDongTren(e.currentTarget);
					}}
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
				<MuiTen />
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
				<ONguoi
					value={kr.nguoi ?? nguoiMacDinh}
					nguoi={nguoi}
					disabled={false}
					onDoi={(v) => onDoi({ nguoi: v })}
				/>
			</div>
			<TrangThaiDong trangThai={trangThai} />
		</li>
	);
}
