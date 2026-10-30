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
import { homNayVN } from "@crm/validation/ngay-vn";
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

export type XemTruocLichSu = { so: number; nhan: string };

type DiemBieuDo = {
	x: string;
	value: number | null;
	expected: number | null;
};

export function chenXemTruoc(
	diem: DiemBieuDo[],
	ngay: string[],
	homNay: string,
	xemTruoc: XemTruocLichSu,
): DiemBieuDo[] {
	const viTri = ngay.reduce((cuoi, n, i) => (n <= homNay ? i + 1 : cuoi), 0);
	const kyVong = diem[Math.max(viTri - 1, 0)]?.expected ?? null;
	return [
		...diem.slice(0, viTri),
		{ x: xemTruoc.nhan, value: null, expected: kyVong },
		...diem.slice(viTri),
	];
}

function NoiDungLichSu({
	d,
	tenKr,
	objectiveId,
	xemTruoc,
}: {
	d: LichSu;
	tenKr: string;
	objectiveId: string;
	xemTruoc: XemTruocLichSu | null;
}) {
	const locale = useLocale();
	const t = okrToanCanhMessages(locale).dienBien;
	const kieu = { kind: d.kieu, unit: d.donVi };
	const lan = [...d.lan].reverse();
	const coDoThi =
		d.kieu !== "moc" &&
		(xemTruoc !== null || d.lan.some((p) => p.giaTri !== null));
	const diem = d.chuoi.map((p) => ({
		x: formatDayShort(p.ngay, locale),
		value: p.giaTri,
		expected: p.kyVong,
	}));
	return (
		<div className="flex flex-col gap-3">
			{coDoThi ? (
				<TargetLineChart
					data={
						xemTruoc === null
							? diem
							: chenXemTruoc(
									diem,
									d.chuoi.map((p) => p.ngay),
									homNayVN(new Date()),
									xemTruoc,
								)
					}
					height={160}
					label={dien(t.bieuDoMoiLan, { ten: tenKr })}
					nhip="lan"
					previewPoint={
						xemTruoc === null
							? undefined
							: { x: xemTruoc.nhan, value: xemTruoc.so }
					}
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

export function LichSuKr({
	kr,
	xemTruoc = null,
}: {
	kr: KrLichSu;
	xemTruoc?: XemTruocLichSu | null;
}) {
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
					xemTruoc={xemTruoc}
				/>
			)}
		</DetailSheetSection>
	);
}
