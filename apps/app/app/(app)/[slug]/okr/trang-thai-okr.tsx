"use client";

import Target from "@carbon/icons-react/es/Target";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Button } from "@crm/ui/components/button";
import { Card, CardContent } from "@crm/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import Link from "next/link";
import { okrMessages } from "@/lib/messages/okr";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

const KHUNG_TAI = ["mot", "hai", "ba"] as const;

export function DangTai() {
	const m = okrMessages(useLocale());
	return (
		<div
			aria-busy="true"
			className="flex flex-col gap-4"
			data-trang-thai="ST-donvi-dangtai"
		>
			<p className="text-muted-foreground text-sm" role="status">
				{m.dangTai}
			</p>
			{KHUNG_TAI.map((id) => (
				<Card key={id}>
					<CardContent>
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-1/2" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export function Loi({ thuLai }: { thuLai: () => void }) {
	const m = okrMessages(useLocale());
	return (
		<VungTaiLoi
			data-trang-thai="ST-donvi-loi"
			moTa={m.loi.body}
			onThuLai={thuLai}
			tieuDe={m.loi.title}
		/>
	);
}

export function ChuaChuKy({ quanTri }: { quanTri: boolean }) {
	const m = okrMessages(useLocale());
	const url = useWorkspaceUrl();
	return (
		<Empty data-trang-thai="ST-donvi-chuakychay">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Icon icon={Target} />
				</EmptyMedia>
				<EmptyTitle>{m.chuaChuKy.title}</EmptyTitle>
				<EmptyDescription>
					{quanTri ? m.chuaChuKy.quanTri : m.chuaChuKy.nguoiKhac}
				</EmptyDescription>
			</EmptyHeader>
			{quanTri ? (
				<EmptyContent>
					<Button asChild variant="outline">
						<Link href={url("/settings/okr")}>{m.chuaChuKy.action}</Link>
					</Button>
				</EmptyContent>
			) : null}
		</Empty>
	);
}

export function Rong({
	tenDon,
	tenKy,
	chuaTruong,
	quanTri,
}: {
	tenDon: string;
	tenKy: string;
	chuaTruong: boolean;
	quanTri: boolean;
}) {
	const m = okrMessages(useLocale());
	const url = useWorkspaceUrl();
	return (
		<Empty data-trang-thai="ST-donvi-rong">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Icon icon={Target} />
				</EmptyMedia>
				<EmptyTitle>
					<span translate="no">{tenDon}</span> {m.rong.chuaDat}{" "}
					<span translate="no">{tenKy}</span>
				</EmptyTitle>
				<EmptyDescription>
					{chuaTruong ? m.rong.chuaTruong : m.rong.body}
				</EmptyDescription>
			</EmptyHeader>
			{chuaTruong && quanTri ? (
				<EmptyContent>
					<Button asChild variant="outline">
						<Link href={url("/settings/organization")}>{m.rong.ganTruong}</Link>
					</Button>
				</EmptyContent>
			) : null}
		</Empty>
	);
}

export function DonKhongThay({ veGoc }: { veGoc: () => void }) {
	const m = okrMessages(useLocale());
	return (
		<Empty data-trang-thai="ST-donvi-khongthay">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Icon icon={WarningAlt} />
				</EmptyMedia>
				<EmptyTitle>{m.khongThay.title}</EmptyTitle>
				<EmptyDescription>{m.khongThay.body}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button variant="outline" onClick={veGoc}>
					{m.khongThay.action}
				</Button>
			</EmptyContent>
		</Empty>
	);
}
