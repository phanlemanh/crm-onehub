"use client";

import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { Skeleton } from "@crm/ui/components/skeleton";
import { TargetLineChart } from "@crm/ui/components/target-line-chart";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { formatDayShort } from "@crm/ui/lib/format";
import { useQuery } from "@tanstack/react-query";
import { luc } from "@/app/(app)/[slug]/okr/bang-vet";
import { HangCamXuc } from "@/app/(app)/[slug]/okr/cam-xuc/hang-cam-xuc";
import { giaTri } from "@/app/(app)/[slug]/okr/gia-tri-kr";
import {
	DetailSheetProse,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { dien } from "./plan-copy";

type LichSu = RouterOutputs["okr"]["lichSuKr"];

export type KrLichSu = { id: string; title: string; objectiveId: string };

function NoiDungLichSu({
	d,
	tenKr,
	objectiveId,
}: {
	d: LichSu;
	tenKr: string;
	objectiveId: string;
}) {
	const locale = useLocale();
	const t = okrToanCanhMessages(locale).dienBien;
	const kieu = { kind: d.kieu, unit: d.donVi };
	const lan = [...d.lan].reverse();
	const coDoThi = d.kieu !== "moc" && d.lan.some((p) => p.giaTri !== null);
	return (
		<div className="flex flex-col gap-3">
			{coDoThi ? (
				<TargetLineChart
					data={d.chuoi.map((p) => ({
						x: formatDayShort(p.ngay, locale),
						value: p.giaTri,
						expected: p.kyVong,
					}))}
					height={160}
					label={dien(t.bieuDoMoiLan, { ten: tenKr })}
					nhip="lan"
					target={d.dich}
					targetLabel={t.dich(giaTri(kieu, d.dich, locale))}
				/>
			) : null}
			{lan.length === 0 ? (
				<DetailSheetProse>{t.chuaCo}</DetailSheetProse>
			) : (
				<ItemGroup data-lich-su-kr>
					{lan.map((p) => (
						<Item
							data-lan-cap-nhat={p.checkInId}
							data-ngay={p.ngay}
							key={p.checkInId}
							size="sm"
							variant="outline"
						>
							<ItemContent>
								<ItemTitle>
									<span className="tabular-nums" data-luc-lan>
										{luc(p.luc, locale)}
									</span>
									{p.giaTri === null ? null : (
										<span data-gia-tri-lan>
											{giaTri(kieu, p.giaTri, locale)}
										</span>
									)}
								</ItemTitle>
								{p.ghiChu ? (
									<ItemDescription translate="no" unclamped>
										{p.ghiChu}
									</ItemDescription>
								) : null}
								<HangCamXuc
									camXuc={p.camXuc}
									checkInId={p.checkInId}
									objectiveId={objectiveId}
								/>
							</ItemContent>
							<ItemActions>
								<ConfidenceIndicator level={p.tuTin} size="sm" />
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
			)}
		</div>
	);
}

export function LichSuKr({ kr }: { kr: KrLichSu }) {
	const locale = useLocale();
	const m = okrCanhKrMessages(locale).khung;
	const t = okrToanCanhMessages(locale).dienBien;
	const trpc = useTRPC();
	const ls = useQuery(trpc.okr.lichSuKr.queryOptions({ keyResultId: kr.id }));
	return (
		<DetailSheetSection data-muc-ngan="lich-su" title={m.lichSu}>
			{ls.isPending ? (
				<Skeleton className="h-40 w-full" />
			) : ls.isError || !ls.data ? (
				<VungTaiLoi
					dangTai={ls.isFetching}
					moTa={ls.error?.message ?? t.loi}
					onThuLai={() => void ls.refetch()}
					tieuDe={t.loi}
				/>
			) : (
				<NoiDungLichSu
					d={ls.data}
					objectiveId={kr.objectiveId}
					tenKr={kr.title}
				/>
			)}
		</DetailSheetSection>
	);
}
