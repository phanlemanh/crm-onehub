"use client";

import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import SendAlt from "@carbon/icons-react/es/SendAlt";
import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@crm/ui/components/dialog";
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
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableNote,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { Textarea } from "@crm/ui/components/textarea";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { useId, useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import type { ChuMau, DongMau, NgonNgu } from "./du-lieu";

function dinhGio(iso: string, nn: NgonNgu): string {
	return new Intl.DateTimeFormat(nn === "vi" ? "vi-VN" : "en-GB", {
		timeZone: "Asia/Ho_Chi_Minh",
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(iso));
}

function TrangThaiMoi({ dong, nn }: { dong: DongMau; nn: NgonNgu }) {
	const tt = dong.trangThai[nn];
	return (
		<div className="flex min-w-0 flex-col gap-0.5">
			<StatusIndicator
				label={tt.nhan}
				size="sm"
				tone={toneTheoNghia(tt.nghia)}
			/>
			<SimpleTableNote className="whitespace-normal break-words">
				{tt.cau}
			</SimpleTableNote>
		</div>
	);
}

function ThaoTac({
	dong,
	chu,
	moBanDau,
	onXoa,
	co,
}: {
	dong: DongMau;
	chu: ChuMau;
	moBanDau: boolean;
	onXoa: () => void;
	co: "icon-xs" | "icon-lg";
}) {
	return (
		<DropdownMenu defaultOpen={moBanDau}>
			<DropdownMenuTrigger asChild>
				<Button data-thao-tac-tin-hieu={dong.ma} size={co} variant="ghost">
					<Icon icon={OverflowMenuVertical} />
					<span className="sr-only">{dien(chu.thaoTac, { ma: dong.ma })}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					disabled={!dong.coTheXoa}
					onSelect={onXoa}
					variant="destructive"
				>
					{chu.xoa}
				</DropdownMenuItem>
				{dong.coTheXoa ? null : (
					<DropdownMenuLabel>{chu.khongXoaDuoc}</DropdownMenuLabel>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function DanhSachMoi({
	dong,
	chu,
	nn,
	hoiXoaBanDau,
	menuMoBanDau,
	baoLoi,
	daXoa,
	nutGui,
}: {
	dong: DongMau[];
	chu: ChuMau;
	nn: NgonNgu;
	hoiXoaBanDau?: string;
	menuMoBanDau?: string;
	baoLoi?: string;
	daXoa?: string;
	nutGui: React.ReactNode;
}) {
	const [hoiXoa, setHoiXoa] = useState<DongMau | null>(
		() => dong.find((d) => d.id === hoiXoaBanDau) ?? null,
	);
	if (dong.length === 0) {
		return (
			<Empty border="solid">
				<EmptyHeader>
					<EmptyTitle>{chu.rongTieuDe}</EmptyTitle>
					<EmptyDescription>{chu.rongMoTa}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>{nutGui}</EmptyContent>
			</Empty>
		);
	}
	return (
		<div className="flex flex-col gap-3">
			<span aria-live="polite" className="sr-only">
				{daXoa ? dien(chu.daXoa, { ma: daXoa }) : ""}
			</span>
			{baoLoi ? (
				<Alert variant="destructive">
					<AlertDescription>{baoLoi}</AlertDescription>
				</Alert>
			) : null}
			<div className="hidden md:block">
				<SimpleTable
					columns={[
						{ id: "ke", header: chu.cot.dieuDaKe },
						{ id: "gui", header: chu.cot.gui, width: "w-36" },
						{ id: "trang-thai", header: chu.cot.trangThai, width: "w-[30%]" },
						{ id: "thao-tac", srLabel: chu.cot.thaoTac, width: "w-12" },
					]}
					surface="page"
				>
					{dong.map((d) => (
						<SimpleTableRow data-tin-hieu={d.ma} key={d.id}>
							<SimpleTableCell className="whitespace-normal">
								<div className="flex min-w-0 flex-col gap-0.5">
									<span className="line-clamp-2 break-words" translate="no">
										{d.tieuDe}
									</span>
									<SimpleTableNote className="line-clamp-1 break-words">
										<span translate="no">{d.ma}</span> ·{" "}
										<span translate="no">
											{dien(chu.muonLam, { muonLam: d.muonLam })}
										</span>
									</SimpleTableNote>
								</div>
							</SimpleTableCell>
							<SimpleTableCell className="whitespace-normal">
								<div className="flex min-w-0 flex-col gap-0.5">
									<span data-ten-man="">{d.tenMan[nn]}</span>
									<SimpleTableNote className="tabular-nums" data-gio-gui="">
										{dinhGio(d.guiLuc, nn)}
									</SimpleTableNote>
								</div>
							</SimpleTableCell>
							<SimpleTableCell className="whitespace-normal">
								<TrangThaiMoi dong={d} nn={nn} />
							</SimpleTableCell>
							<SimpleTableCell align="right">
								<ThaoTac
									chu={chu}
									co="icon-xs"
									dong={d}
									moBanDau={menuMoBanDau === d.id}
									onXoa={() => setHoiXoa(d)}
								/>
							</SimpleTableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<ItemGroup className="md:hidden">
				{dong.map((d) => (
					<Item data-tin-hieu={d.ma} key={d.id} variant="outline">
						<ItemContent>
							<ItemTitle className="line-clamp-2 break-words" translate="no">
								{d.tieuDe}
							</ItemTitle>
							<ItemDescription>
								<span translate="no">{d.ma}</span> · {d.tenMan[nn]} ·{" "}
								{dinhGio(d.guiLuc, nn)}
							</ItemDescription>
							<TrangThaiMoi dong={d} nn={nn} />
						</ItemContent>
						<ItemActions>
							<ThaoTac
								chu={chu}
								co="icon-lg"
								dong={d}
								moBanDau={false}
								onXoa={() => setHoiXoa(d)}
							/>
						</ItemActions>
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
				nut={chu.xoaNut}
				onConfirm={() => setHoiXoa(null)}
				onOpenChange={(mo) => {
					if (!mo) setHoiXoa(null);
				}}
				open={hoiXoa !== null}
				pending={false}
				than={chu.xoaThan}
				thoi={chu.thoi}
				tieuDe={dien(chu.xoaTieuDe, { ma: hoiXoa?.ma ?? "" })}
				tone="destructive"
			/>
		</div>
	);
}

export type GiaiDoanMau = "soan" | "da-gui";

export function HopMoi({
	chu,
	tenMan,
	moBanDau,
	chuBanDau,
	giaiDoanBanDau,
	loi,
}: {
	chu: ChuMau;
	tenMan: string;
	moBanDau: boolean;
	chuBanDau: { muonLam: string; daXayRa: string };
	giaiDoanBanDau: GiaiDoanMau;
	loi: "qua-tran" | "may-chu" | null;
}) {
	const [mo, setMo] = useState(moBanDau);
	const [muonLam, setMuonLam] = useState(chuBanDau.muonLam);
	const [daXayRa, setDaXayRa] = useState(chuBanDau.daXayRa);
	const [giaiDoan, setGiaiDoan] = useState<GiaiDoanMau>(giaiDoanBanDau);
	const idMuonLam = useId();
	const idDaXayRa = useId();
	const idLoi = useId();
	const idLyDo = useId();
	const coChu = muonLam.trim().length > 0 && daXayRa.trim().length > 0;
	const quaTran = loi === "qua-tran";
	const coThayDoi =
		giaiDoan === "soan" &&
		(muonLam.trim().length > 0 || daXayRa.trim().length > 0);
	const cauLoi = quaTran ? chu.hop.quaTran : loi ? chu.hop.chuaGui : null;
	const moTa = [cauLoi ? idLoi : null, !coChu && !quaTran ? idLyDo : null]
		.filter(Boolean)
		.join(" ");

	return (
		<Dialog
			coThayDoi={coThayDoi}
			onOpenChange={(o) => {
				setMo(o);
				if (!o) {
					setGiaiDoan("soan");
				}
			}}
			open={mo}
		>
			<DialogTrigger asChild>
				<Button data-slot="nut-gui-tin-hieu-tao" variant="default">
					<SendAlt aria-hidden />
					{chu.nut}
				</Button>
			</DialogTrigger>
			<DialogContent data-hop-tin-hieu={giaiDoan}>
				{giaiDoan === "da-gui" ? (
					<>
						<DialogHeader>
							<DialogTitle aria-live="polite">
								{dien(chu.hop.daGuiTieuDe, { ma: "crm-42" })}
							</DialogTitle>
							<DialogDescription>{chu.hop.daGuiMoTa}</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">{chu.hop.dong}</Button>
							</DialogClose>
							<DialogClose asChild>
								<Button>{chu.hop.xemDaGui}</Button>
							</DialogClose>
						</DialogFooter>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>{chu.hop.tieuDe}</DialogTitle>
							<DialogDescription>
								{chu.hop.moTa} <span>{chu.hop.baoTruoc}</span>
							</DialogDescription>
						</DialogHeader>
						<Field>
							<FieldLabel htmlFor={idMuonLam}>{chu.hop.muonLam}</FieldLabel>
							<Textarea
								id={idMuonLam}
								onChange={(e) => setMuonLam(e.target.value)}
								placeholder={chu.hop.goiYMuonLam}
								rows={2}
								translate="no"
								value={muonLam}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor={idDaXayRa}>{chu.hop.daXayRa}</FieldLabel>
							<Textarea
								id={idDaXayRa}
								onChange={(e) => setDaXayRa(e.target.value)}
								placeholder={chu.hop.goiYDaXayRa}
								translate="no"
								value={daXayRa}
							/>
							<FieldDescription>
								{dien(chu.hop.man, { man: tenMan })}
							</FieldDescription>
						</Field>
						{cauLoi ? (
							<Alert id={idLoi} variant="destructive">
								<AlertDescription>{cauLoi}</AlertDescription>
							</Alert>
						) : null}
						{!coChu && !quaTran ? (
							<FieldDescription data-ly-do-khoa="" id={idLyDo}>
								{chu.hop.lyDoKhoa}
							</FieldDescription>
						) : null}
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">{chu.hop.huy}</Button>
							</DialogClose>
							<Button
								aria-describedby={moTa || undefined}
								disabled={!coChu || quaTran}
								onClick={() => {
									setMuonLam("");
									setDaXayRa("");
									setGiaiDoan("da-gui");
								}}
							>
								{chu.hop.gui}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
