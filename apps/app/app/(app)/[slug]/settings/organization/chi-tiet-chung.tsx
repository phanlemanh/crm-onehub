"use client";

import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import type { ReactNode } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";

export type MucMenu = { nhan: string; lam: () => void };

export function MenuDong({
	ten,
	muc,
	sua,
}: {
	ten: string;
	muc: MucMenu[];
	sua: boolean;
}) {
	const m = toChucMessages(useLocale());
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild disabled={!sua}>
				<Button variant="ghost" size="icon-xs" disabled={!sua}>
					<Icon icon={OverflowMenuVertical} />
					<span className="sr-only">{dien(m.menu, { ten })}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{muc.map((x) => (
					<DropdownMenuItem key={x.nhan} onSelect={x.lam}>
						{x.nhan}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function TieuDeChiTiet({
	duong,
	ten,
	menu,
	an = false,
}: {
	duong?: string;
	ten: string;
	menu?: ReactNode;
	an?: boolean;
}) {
	if (an) return menu ? <div className="flex justify-end">{menu}</div> : null;
	return (
		<div className="flex items-start justify-between gap-3">
			<div className="flex min-w-0 flex-col">
				{duong ? (
					<span className="text-muted-foreground text-xs" translate="no">
						{duong} ›
					</span>
				) : null}
				<h2 className="truncate font-medium text-lg" translate="no" data-ten>
					{ten}
				</h2>
			</div>
			{menu}
		</div>
	);
}

export function DongNguoi({
	nguoi,
	phu,
	nhan,
	cuoi,
}: {
	nguoi: { id: string; name: string; email: string };
	phu?: string | null;
	nhan?: string | null;
	cuoi: ReactNode;
}) {
	return (
		<li
			className="flex items-center gap-3 px-3 py-2"
			data-dong-nguoi={nguoi.id}
		>
			<PersonAvatar size="sm" name={nguoi.name} email={nguoi.email} />
			<span className="flex min-w-0 flex-1 flex-col gap-1">
				<span className="truncate text-sm" translate="no" data-ten>
					{nguoi.name}
				</span>
				<span className="truncate text-muted-foreground text-xs" translate="no">
					{phu ?? nguoi.email}
				</span>
				{nhan ? (
					<span className="flex">
						<Badge variant="outline">{nhan}</Badge>
					</span>
				) : null}
			</span>
			{cuoi}
		</li>
	);
}

export function TieuDeMuc({
	chu,
	children,
}: {
	chu: string;
	children?: ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<h3 className="font-medium text-sm">{chu}</h3>
			{children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
		</div>
	);
}
