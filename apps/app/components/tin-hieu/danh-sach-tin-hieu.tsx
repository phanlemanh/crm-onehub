"use client";

import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableNote,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import type { Locale } from "@crm/ui/lib/locale";
import type { NghiaTrangThai } from "@crm/ui/lib/status-tone";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { NGAY_VN } from "@crm/validation/ngay-vn";
import { useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { tenMan } from "@/lib/tin-hieu/ten-man";

export type TrangThaiDong = {
	nhan: string;
	cau: string;
	nghia: NghiaTrangThai;
	khongDich?: boolean;
};

export type DongTinHieu = {
	id: string;
	ma: string;
	tieuDe: string;
	muonLam: string;
	man: string;
	guiLuc: string;
	coTheXoa: boolean;
	trangThai: TrangThaiDong;
};

export type DanhSachTinHieuProps = {
	dong: DongTinHieu[];
	banVeDocDuoc: boolean;
	nutGui: React.ReactNode;
	dangXoa: string | null;
	onXoa: (id: string) => void;
	hoiXoaBanDau?: string;
	daXoa?: string | null;
	xoaHong?: string | null;
};

const KHUON_GIO: Intl.DateTimeFormatOptions = {
	timeZone: NGAY_VN.muiGio,
	day: "2-digit",
	month: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
};

const GIO: Record<Locale, Intl.DateTimeFormat> = {
	vi: new Intl.DateTimeFormat("vi-VN", KHUON_GIO),
	en: new Intl.DateTimeFormat("en-GB", KHUON_GIO),
};

export function TrangThai({
	trangThai,
	gon = false,
}: {
	trangThai: TrangThaiDong;
	gon?: boolean;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-0.5">
			<StatusIndicator
				data-nghia={trangThai.nghia}
				label={trangThai.nhan}
				size="sm"
				tone={toneTheoNghia(trangThai.nghia)}
			/>
			<SimpleTableNote
				className={
					gon
						? "hidden whitespace-normal break-words md:block"
						: "whitespace-normal break-words"
				}
				data-cau-trang-thai=""
				translate={trangThai.khongDich ? "no" : undefined}
			>
				{trangThai.cau}
			</SimpleTableNote>
		</div>
	);
}

export function DanhSachTinHieu({
	dong,
	banVeDocDuoc,
	nutGui,
	dangXoa,
	onXoa,
	hoiXoaBanDau,
	daXoa,
	xoaHong,
}: DanhSachTinHieuProps) {
	const locale = useLocale();
	const m = tinHieuMessages(locale).trang;
	const [hoiXoa, setHoiXoa] = useState<DongTinHieu | null>(
		() => dong.find((d) => d.id === hoiXoaBanDau) ?? null,
	);
	const gio = (d: DongTinHieu) => GIO[locale].format(new Date(d.guiLuc));
	const thongBao = (
		<span aria-live="polite" className="sr-only" data-da-xoa="">
			{daXoa ? dien(m.daXoa, { ma: daXoa }) : ""}
		</span>
	);

	if (dong.length === 0) {
		return (
			<>
				{thongBao}
				<Empty border="solid" data-tin-hieu-rong="">
					<EmptyHeader>
						<EmptyTitle>{m.rongTieuDe}</EmptyTitle>
						<EmptyDescription>{m.rongMoTa}</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>{nutGui}</EmptyContent>
				</Empty>
			</>
		);
	}

	const thaoTac = (d: DongTinHieu, co: "icon-xs" | "icon-lg") => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button data-thao-tac-tin-hieu={d.ma} size={co} variant="ghost">
					<Icon icon={OverflowMenuVertical} />
					<span className="sr-only">{dien(m.thaoTac, { ma: d.ma })}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					data-xoa-tin-hieu={d.ma}
					disabled={!d.coTheXoa}
					onSelect={() => setHoiXoa(d)}
					variant="destructive"
				>
					{m.xoa}
				</DropdownMenuItem>
				{d.coTheXoa ? null : (
					<DropdownMenuLabel>{m.khongXoaDuoc}</DropdownMenuLabel>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);

	const maVaMuon = (d: DongTinHieu) => (
		<>
			<span translate="no">{d.ma}</span> ·{" "}
			<span translate="no">{dien(m.muonLam, { muonLam: d.muonLam })}</span>
		</>
	);

	return (
		<div className="flex flex-col gap-3">
			{thongBao}
			{xoaHong ? (
				<Alert data-xoa-hong="" variant="destructive">
					<AlertDescription>{xoaHong}</AlertDescription>
				</Alert>
			) : null}
			{banVeDocDuoc ? null : (
				<SimpleTableNote aria-live="polite" data-ban-ve-chua-doc="">
					{m.banVeChuaDoc}
				</SimpleTableNote>
			)}
			<div className="hidden md:block">
				<SimpleTable
					columns={[
						{ id: "ke", header: m.cot.dieuDaKe },
						{ id: "gui", header: m.cot.gui, width: "w-36" },
						{ id: "trang-thai", header: m.cot.trangThai, width: "w-[30%]" },
						{ id: "thao-tac", srLabel: m.cot.thaoTac, width: "w-12" },
					]}
					surface="page"
				>
					{dong.map((d) => (
						<SimpleTableRow data-tin-hieu={d.ma} key={d.id} tabIndex={-1}>
							<SimpleTableCell className="whitespace-normal">
								<div className="flex min-w-0 flex-col gap-0.5">
									<span
										className="line-clamp-2 break-words"
										title={d.tieuDe}
										translate="no"
									>
										{d.tieuDe}
									</span>
									<SimpleTableNote
										className="line-clamp-1 break-words"
										data-muon-lam=""
									>
										{maVaMuon(d)}
									</SimpleTableNote>
								</div>
							</SimpleTableCell>
							<SimpleTableCell className="whitespace-normal">
								<div className="flex min-w-0 flex-col gap-0.5">
									<span className="break-words" data-ten-man="">
										{tenMan(d.man, locale)}
									</span>
									<SimpleTableNote className="tabular-nums" data-gio-gui="">
										{gio(d)}
									</SimpleTableNote>
								</div>
							</SimpleTableCell>
							<SimpleTableCell className="whitespace-normal">
								<TrangThai trangThai={d.trangThai} />
							</SimpleTableCell>
							<SimpleTableCell align="right">
								{thaoTac(d, "icon-xs")}
							</SimpleTableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<ItemGroup className="md:hidden">
				{dong.map((d) => (
					<Item data-tin-hieu={d.ma} key={d.id} tabIndex={-1} variant="outline">
						<ItemContent>
							<ItemTitle className="line-clamp-2 break-words" translate="no">
								{d.tieuDe}
							</ItemTitle>
							<ItemDescription data-muon-lam="">{maVaMuon(d)}</ItemDescription>
							<ItemDescription>
								<span data-ten-man="">{tenMan(d.man, locale)}</span> ·{" "}
								<span className="tabular-nums" data-gio-gui="">
									{gio(d)}
								</span>
							</ItemDescription>
							<TrangThai trangThai={d.trangThai} />
						</ItemContent>
						<ItemActions>{thaoTac(d, "icon-lg")}</ItemActions>
					</Item>
				))}
			</ItemGroup>
			<ConfirmDialog
				noiDung={
					hoiXoa ? (
						<p className="text-sm" translate="no">
							«{hoiXoa.tieuDe}»
						</p>
					) : null
				}
				nut={m.xoaNut}
				onCloseAutoFocus={(e) => e.preventDefault()}
				onConfirm={() => {
					if (hoiXoa) onXoa(hoiXoa.id);
					setHoiXoa(null);
				}}
				onOpenChange={(mo) => {
					if (!mo) setHoiXoa(null);
				}}
				open={hoiXoa !== null}
				pending={dangXoa !== null}
				than={m.xoaThan}
				thoi={m.thoi}
				tieuDe={dien(m.xoaTieuDe, { ma: hoiXoa?.ma ?? "" })}
				tone="destructive"
			/>
		</div>
	);
}
