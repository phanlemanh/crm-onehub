"use client";

import Archive from "@carbon/icons-react/es/Archive";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { taiLieuLichSuMessages } from "@/lib/messages/tai-lieu-lich-su";
import { ngayTaiLieu } from "@/lib/tai-lieu-man";
import { HopViecTrang } from "./hop-viec-trang";

export type LuuTruTrang = {
	daLuuTru: { luc: string } | null;
	coLuuTruCho: boolean;
	coKhoiPhucCho: boolean;
};

export function DaiDaLuuTru({
	slug,
	luuTru,
}: {
	slug: string;
	luuTru: LuuTruTrang;
}) {
	const locale = useLocale();
	const m = taiLieuLichSuMessages(locale).luuTru.dai;
	const [mo, setMo] = useState(false);
	if (!luuTru.daLuuTru) return null;
	return (
		<Alert data-da-luu-tru="" role="status">
			<Icon icon={Archive} />
			<AlertTitle>
				{dien(m.tieuDe, { ngay: ngayTaiLieu(luuTru.daLuuTru.luc, locale) })}
			</AlertTitle>
			<AlertDescription>{m.than}</AlertDescription>
			<AlertAction placement="below">
				{luuTru.coKhoiPhucCho ? (
					<Badge data-co-khoi-phuc-cho="" variant="outline">
						{m.coKhoiPhucCho}
					</Badge>
				) : (
					<Button
						data-nut-de-xuat-khoi-phuc=""
						onClick={() => setMo(true)}
						size="sm"
						variant="outline"
					>
						{m.deXuatKhoiPhuc}
					</Button>
				)}
			</AlertAction>
			{mo ? (
				<HopViecTrang doiMo={setMo} mo slug={slug} viec="KHOI_PHUC" />
			) : null}
		</Alert>
	);
}

export function HuyHieuLuuTruCho({ luuTru }: { luuTru: LuuTruTrang }) {
	const m = taiLieuLichSuMessages(useLocale()).luuTru;
	if (luuTru.daLuuTru || !luuTru.coLuuTruCho) return null;
	return (
		<Badge data-co-luu-tru-cho="" variant="outline">
			{m.coLuuTruCho}
		</Badge>
	);
}

export function MenuTrang({
	slug,
	luuTru,
}: {
	slug: string;
	luuTru: LuuTruTrang;
}) {
	const m = taiLieuLichSuMessages(useLocale()).luuTru;
	const [mo, setMo] = useState(false);
	if (luuTru.daLuuTru) return null;
	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						aria-label={m.them}
						data-menu-trang=""
						size="icon-sm"
						variant="ghost"
					>
						<Icon icon={OverflowMenuHorizontal} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					<DropdownMenuItem
						data-muc-de-xuat-luu-tru=""
						disabled={luuTru.coLuuTruCho}
						onSelect={() => setMo(true)}
					>
						<Icon icon={Archive} />
						{m.deXuatLuuTru}
					</DropdownMenuItem>
					{luuTru.coLuuTruCho ? (
						<DropdownMenuLabel data-vi-sao-khoa="">
							{m.daCoCho}
						</DropdownMenuLabel>
					) : null}
				</DropdownMenuContent>
			</DropdownMenu>
			{mo ? <HopViecTrang doiMo={setMo} mo slug={slug} viec="LUU_TRU" /> : null}
		</>
	);
}
