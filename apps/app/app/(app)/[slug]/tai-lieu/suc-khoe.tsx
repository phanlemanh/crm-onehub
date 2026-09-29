"use client";

import { Alert, AlertAction, AlertDescription } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardHeader,
	CardPanel,
	CardPanelEmpty,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { duongTrang, ngayTaiLieu } from "@/lib/tai-lieu-man";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { DangTaiDanhSach } from "./dang-tai";

export type DongSucKhoe = {
	khoa: string;
	ten: string;
	href: string | null;
	moTa: ReactNode;
};

function Khoi({
	id,
	tieuDe,
	tong,
	dong,
	rong,
}: {
	id: string;
	tieuDe: string;
	tong: number;
	dong: DongSucKhoe[];
	rong: string;
}) {
	return (
		<Card data-khoi-suc-khoe={id}>
			<CardHeader>
				<CardTitle>{tieuDe}</CardTitle>
				<CardAction>
					<Badge data-so={tong} variant="secondary">
						{tong}
					</Badge>
				</CardAction>
			</CardHeader>
			<CardPanel>
				{dong.length === 0 ? (
					<CardPanelEmpty>{rong}</CardPanelEmpty>
				) : (
					<ItemGroup>
						{dong.map((d) =>
							d.href ? (
								<Item asChild key={d.khoa} variant="outline">
									<Link href={d.href}>
										<ItemContent>
											<ItemTitle translate="no">{d.ten}</ItemTitle>
											<ItemDescription>{d.moTa}</ItemDescription>
										</ItemContent>
									</Link>
								</Item>
							) : (
								<Item key={d.khoa} variant="outline">
									<ItemContent>
										<ItemTitle translate="no">{d.ten}</ItemTitle>
										<ItemDescription>{d.moTa}</ItemDescription>
									</ItemContent>
								</Item>
							),
						)}
					</ItemGroup>
				)}
			</CardPanel>
		</Card>
	);
}

function Chu({ ten, chiTiet }: { ten: string; chiTiet: string }) {
	return (
		<>
			<span translate="no">{ten}</span> · {chiTiet}
		</>
	);
}

export function SucKhoe() {
	const locale = useLocale();
	const m = taiLieuMessages(locale).sucKhoe;
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const sk = useQuery(trpc.taiLieu.sucKhoe.queryOptions());

	if (sk.isError && !sk.data) {
		return (
			<Alert data-suc-khoe-loi="">
				<AlertDescription>{m.loi}</AlertDescription>
				<AlertAction>
					<Button onClick={() => sk.refetch()} size="sm" variant="outline">
						{m.thuLai}
					</Button>
				</AlertAction>
			</Alert>
		);
	}
	if (!sk.data) return <DangTaiDanhSach />;

	const { quaHan, choDuyet, gay, chuaCo, moCoi } = sk.data;
	const toiTrang = (slug: string) => url(duongTrang(slug));

	return (
		<div className="flex min-w-0 max-w-3xl flex-col gap-4" data-suc-khoe="">
			<p className="text-muted-foreground text-sm">{m.moTa}</p>
			<Khoi
				dong={quaHan.rows.map((r) => ({
					khoa: r.slug,
					ten: r.ten,
					href: toiTrang(r.slug),
					moTa: (
						<Chu
							chiTiet={dien(m.xacMinhDen, {
								ngay: ngayTaiLieu(r.xacMinhDen, locale),
							})}
							ten={r.chuTrang.name}
						/>
					),
				}))}
				id="qua-han"
				rong={m.rong}
				tieuDe={m.quaHan}
				tong={quaHan.total}
			/>
			<Khoi
				dong={choDuyet.rows.map((r) => ({
					khoa: r.slug,
					ten: r.ten,
					href: toiTrang(r.slug),
					moTa: (
						<Chu
							chiTiet={dien(m.soBan, { so: r.soBan })}
							ten={r.chuTrang.name}
						/>
					),
				}))}
				id="cho-duyet"
				rong={m.rong}
				tieuDe={m.choDuyet}
				tong={choDuyet.total}
			/>
			<Khoi
				dong={gay.rows.map((r) => ({
					khoa: r.slug,
					ten: r.ten,
					href: toiTrang(r.slug),
					moTa: (
						<Chu
							chiTiet={r.lienKet
								.map((l) => dien(m.toi, { chu: l.vanBan || l.denSlug }))
								.join(", ")}
							ten={r.chuTrang.name}
						/>
					),
				}))}
				id="gay"
				rong={m.rong}
				tieuDe={m.gay}
				tong={gay.total}
			/>
			<Khoi
				dong={chuaCo.rows.map((r) => ({
					khoa: r.denSlug,
					ten: r.vanBan || r.denSlug,
					href: null,
					moTa: dien(m.soTrang, { so: r.soTrang }),
				}))}
				id="chua-co"
				rong={m.rong}
				tieuDe={m.chuaCo}
				tong={chuaCo.total}
			/>
			<Khoi
				dong={moCoi.rows.map((r) => ({
					khoa: r.slug,
					ten: r.ten,
					href: toiTrang(r.slug),
					moTa: (
						<Chu
							chiTiet={dien(m.duyet, { ngay: ngayTaiLieu(r.duyetLuc, locale) })}
							ten={r.chuTrang.name}
						/>
					),
				}))}
				id="mo-coi"
				rong={m.rong}
				tieuDe={m.moCoi}
				tong={moCoi.total}
			/>
		</div>
	);
}
