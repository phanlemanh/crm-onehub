"use client";

import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useQuery } from "@tanstack/react-query";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { type DuAnMessages, duAnMessages } from "@/lib/messages/du-an";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { khoangNgay, ngayNgan } from "./pham-vi";

type DuAnDong = RouterOutputs["duAn"]["list"][number];

const DONG_CHO = ["a", "b", "c", "d", "e"];

function nhanMoc(m: DuAnMessages["ds"], da: DuAnDong): string | null {
	if (!da.mocKe) return null;
	const chu = `${da.mocKe.ten} ${ngayNgan(da.mocKe.ngay)}`;
	return da.mocKe.tre ? `${chu} · ${m.tre}` : chu;
}

function BangDuAn({
	ds,
	onChon,
}: {
	ds: DuAnDong[];
	onChon: (id: string) => void;
}) {
	const m = duAnMessages(useLocale()).ds;
	return (
		<>
			<div className="hidden md:block">
				<SimpleTable
					columns={[
						{ id: "ten", header: m.cotTen },
						{ id: "tienDo", header: m.cotTienDo, align: "right" },
						{ id: "khoang", header: m.cotKhoang, align: "right" },
						{ id: "moc", header: m.cotMoc },
						{ id: "nguoiTao", header: m.cotNguoiTao },
					]}
					surface="page"
				>
					{ds.map((da) => {
						const moc = nhanMoc(m, da);
						return (
							<SimpleTableRow
								clickable
								data-du-an={da.id}
								key={da.id}
								onClick={() => onChon(da.id)}
							>
								<SimpleTableCell>
									<span className="font-medium" translate="no">
										{da.ten}
									</span>
								</SimpleTableCell>
								<SimpleTableCell numeric>
									{dien(m.tienDo, { x: da.soXong, y: da.soViec })}
								</SimpleTableCell>
								<SimpleTableCell numeric>
									{khoangNgay(da.batDauSom, da.hanMuon) ?? "—"}
								</SimpleTableCell>
								<SimpleTableCell>
									{moc && da.mocKe ? (
										<StatusIndicator
											label={<span translate="no">{moc}</span>}
											tone={da.mocKe.tre ? "error" : "neutral"}
										/>
									) : (
										"—"
									)}
								</SimpleTableCell>
								<SimpleTableCell>
									<span translate="no">{da.taoBoi.name}</span>
								</SimpleTableCell>
							</SimpleTableRow>
						);
					})}
				</SimpleTable>
			</div>
			<ItemGroup className="gap-2 md:hidden">
				{ds.map((da) => {
					const moc = nhanMoc(m, da);
					const khoang = khoangNgay(da.batDauSom, da.hanMuon);
					return (
						<Item asChild data-du-an={da.id} key={da.id} variant="outline">
							<button onClick={() => onChon(da.id)} type="button">
								<ItemContent>
									<ItemTitle translate="no">{da.ten}</ItemTitle>
									<ItemDescription>
										{[
											dien(m.tienDo, { x: da.soXong, y: da.soViec }),
											khoang,
											moc,
										]
											.filter((x): x is string => Boolean(x))
											.join(" · ")}
									</ItemDescription>
								</ItemContent>
							</button>
						</Item>
					);
				})}
			</ItemGroup>
		</>
	);
}

export function TatCaDuAn({
	onChon,
	onTao,
}: {
	onChon: (id: string) => void;
	onTao: () => void;
}) {
	const m = duAnMessages(useLocale()).ds;
	const trpc = useTRPC();
	const mo = useQuery(trpc.duAn.list.queryOptions({ trangThai: "mo" }));
	const dong = useQuery(trpc.duAn.list.queryOptions({ trangThai: "dong" }));

	if (mo.isPending) {
		return (
			<div aria-busy="true" className="flex flex-col gap-2" data-du-an-cho="">
				{DONG_CHO.map((k) => (
					<Skeleton className="h-10 w-full" key={k} />
				))}
			</div>
		);
	}
	if (!mo.data) {
		return (
			<VungTaiLoi
				dangTai={mo.isFetching}
				moTa={m.loiMoTa}
				onThuLai={() => void mo.refetch()}
				tieuDe={m.loi}
			/>
		);
	}
	const dsDong = dong.data ?? [];
	return (
		<div className="flex flex-col gap-4">
			{mo.data.length === 0 ? (
				<Empty border="solid">
					<EmptyHeader>
						<EmptyTitle>{m.rong}</EmptyTitle>
						<EmptyDescription>{m.rongMoTa}</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={onTao} variant="outline">
							{m.taoDuAn}
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<BangDuAn ds={mo.data} onChon={onChon} />
			)}
			{dsDong.length > 0 ? (
				<Collapsible>
					<CollapsibleTrigger asChild>
						<Button size="sm" variant="ghost">
							{dien(m.daDong, { n: dsDong.length })}
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<BangDuAn ds={dsDong} onChon={onChon} />
					</CollapsibleContent>
				</Collapsible>
			) : null}
		</div>
	);
}
