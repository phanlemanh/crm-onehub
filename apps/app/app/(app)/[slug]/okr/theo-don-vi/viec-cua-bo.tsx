"use client";

import { Badge } from "@crm/ui/components/badge";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useQuery } from "@tanstack/react-query";
import { LocalDay } from "@/components/local-date-time";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import type { DonChonOkr } from "../okr-search-params";

type ViecBo = RouterOutputs["okr"]["viecCuaBo"]["nhom"][number]["viec"][number];

function TrangThaiViec({
	v,
	m,
}: {
	v: ViecBo;
	m: { daXong: string; chuaXong: string };
}) {
	return (
		<Badge
			data-xong={v.xong ? "co" : "khong"}
			variant={v.xong ? "secondary" : "outline"}
		>
			{v.xong ? m.daXong : m.chuaXong}
		</Badge>
	);
}

export function ViecCuaBo({
	cycleId,
	unit,
}: {
	cycleId: string;
	unit: DonChonOkr;
}) {
	const m = okrVoKhuMessages(useLocale()).boOkr.viec;
	const trpc = useTRPC();
	const ds = useQuery(trpc.okr.viecCuaBo.queryOptions({ cycleId, unit }));

	if (ds.isError)
		return (
			<VungTaiLoi
				data-trang-thai="ST-bo-viec-loi"
				dangTai={ds.isFetching}
				moTa={m.loi.moTa}
				onThuLai={() => void ds.refetch()}
				tieuDe={m.loi.tieuDe}
			/>
		);
	if (!ds.data) return <KhungXuong hinh="danh-sach" />;
	if (ds.data.nhom.length === 0)
		return (
			<Empty data-trang-thai="ST-bo-viec-rong">
				<EmptyHeader>
					<EmptyTitle>{m.rong.tieuDe}</EmptyTitle>
					<EmptyDescription>{m.rong.than}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);

	return (
		<div className="flex min-w-0 flex-col gap-6" data-trang-thai="ST-bo-viec">
			{ds.data.nhom.map((n) => (
				<section
					className="flex flex-col gap-2"
					data-nhom-kr={n.kr.id}
					key={n.kr.id}
				>
					<SectionHeading level={4}>
						<span translate="no">{n.kr.ten}</span>
					</SectionHeading>
					<p className="text-muted-foreground text-sm" translate="no">
						{n.kr.mucTieu.ten}
					</p>
					<div className="hidden md:block">
						<SimpleTable
							columns={[
								{ id: "tieu-de", header: m.cot.tieuDe },
								{ id: "nguoi-lam", header: m.cot.nguoiLam },
								{ id: "han", header: m.cot.han },
								{ id: "xong", header: m.cot.xong },
							]}
							surface="page"
						>
							{n.viec.map((v) => (
								<SimpleTableRow data-viec={v.id} key={v.id}>
									<TableCell translate="no">{v.tieuDe}</TableCell>
									<TableCell data-nguoi-lam="" translate="no">
										{v.nguoiLam?.name ?? <EmptyCellValue />}
									</TableCell>
									<TableCell className="tabular-nums" data-han="">
										{v.hanNgay ? (
											<LocalDay date={v.hanNgay} />
										) : (
											<EmptyCellValue />
										)}
									</TableCell>
									<TableCell>
										<TrangThaiViec m={m} v={v} />
									</TableCell>
								</SimpleTableRow>
							))}
						</SimpleTable>
					</div>
					<div className="md:hidden">
						<ItemGroup>
							{n.viec.map((v) => (
								<Item data-viec={v.id} key={v.id} variant="outline">
									<ItemContent>
										<ItemTitle translate="no">{v.tieuDe}</ItemTitle>
										<ItemDescription>
											{v.nguoiLam ? (
												<span translate="no">{v.nguoiLam.name} · </span>
											) : null}
											{v.hanNgay ? <LocalDay date={v.hanNgay} /> : null}
										</ItemDescription>
									</ItemContent>
									<TrangThaiViec m={m} v={v} />
								</Item>
							))}
						</ItemGroup>
					</div>
				</section>
			))}
		</div>
	);
}
