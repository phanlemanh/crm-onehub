"use client";

import ChartLine from "@carbon/icons-react/es/ChartLine";
import { useLocale } from "@crm/ui/components/locale-provider";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Skeleton } from "@crm/ui/components/skeleton";
import { TargetLineChart } from "@crm/ui/components/target-line-chart";
import { useQuery } from "@tanstack/react-query";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useKrDienBien } from "./dien-bien-kr";

type DienBien = RouterOutputs["okr"]["dienBien"];

export type KrChon = { id: string; title: string };

const nhanTuan = (tuan: string) => `${tuan.slice(8, 10)}/${tuan.slice(5, 7)}`;

function DayTuTin({ diem }: { diem: DienBien["diem"] }) {
	const co = diem.filter((d) => d.tuTin !== null);
	return (
		<ol className="flex flex-col gap-2" data-day-tu-tin>
			{co.map((d) => (
				<li className="flex flex-col gap-0.5" key={d.tuan}>
					<span className="flex items-center gap-3 text-sm">
						<span className="w-12 shrink-0 text-muted-foreground text-xs tabular-nums">
							{nhanTuan(d.tuan)}
						</span>
						{d.tuTin ? <ConfidenceIndicator level={d.tuTin} size="sm" /> : null}
					</span>
					{d.ghiChu ? (
						<span
							className="ps-15 text-muted-foreground text-xs"
							translate="no"
						>
							«{d.ghiChu}»
						</span>
					) : null}
				</li>
			))}
		</ol>
	);
}

function NoiDung({ kr }: { kr: KrChon }) {
	const mt = okrToanCanhMessages(useLocale());
	const trpc = useTRPC();
	const db = useQuery(trpc.okr.dienBien.queryOptions({ keyResultId: kr.id }));
	if (db.isPending)
		return (
			<DetailSheetSection>
				<Skeleton className="h-56 w-full" />
			</DetailSheetSection>
		);
	if (db.isError)
		return (
			<DetailSheetEmpty
				description={db.error.message}
				icon={ChartLine}
				title={mt.dienBien.loi}
			/>
		);
	const d = db.data;
	if (!d.coCapNhat)
		return (
			<div className="contents" data-trang-thai="ST-dienbien-chuaco">
				<DetailSheetEmpty
					description={mt.dienBien.chuaCoMoTa}
					icon={ChartLine}
					title={mt.dienBien.chuaCo}
				/>
			</div>
		);
	if (d.kieu === "moc")
		return (
			<div className="contents" data-trang-thai="ST-dienbien-moc">
				<DetailSheetSection title={mt.dienBien.tuTinTheoTuan}>
					<DayTuTin diem={d.diem} />
				</DetailSheetSection>
			</div>
		);
	return (
		<div className="contents" data-trang-thai="ST-dienbien-so">
			<DetailSheetSection>
				<TargetLineChart
					data={d.diem.map((p) => ({
						x: nhanTuan(p.tuan),
						value: p.giaTri,
						expected: p.kyVong,
					}))}
					label={mt.dienBien.bieuDo(kr.title)}
					target={d.dich}
					targetLabel={mt.dienBien.dich(
						d.donVi === "%" ? `${d.dich}%` : `${d.dich} ${d.donVi}`.trim(),
					)}
				/>
			</DetailSheetSection>
			<DetailSheetSection title={mt.dienBien.tuTinTheoTuan}>
				<DayTuTin diem={d.diem} />
			</DetailSheetSection>
		</div>
	);
}

export function TabDienBien({ keyResults }: { keyResults: KrChon[] }) {
	const mt = okrToanCanhMessages(useLocale());
	const { krId, chonKr } = useKrDienBien();
	const kr = keyResults.find((k) => k.id === krId) ?? keyResults[0];
	if (!kr)
		return (
			<DetailSheetBody>
				<DetailSheetEmpty
					description={mt.dienBien.khongKr}
					icon={ChartLine}
					title={mt.dienBien.tab}
				/>
			</DetailSheetBody>
		);
	return (
		<DetailSheetBody>
			<DetailSheetSection>
				<Select onValueChange={chonKr} value={kr.id}>
					<SelectTrigger aria-label={mt.dienBien.chonKr} data-chon-kr size="sm">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{keyResults.map((k) => (
							<SelectItem key={k.id} value={k.id}>
								<span translate="no">{k.title}</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</DetailSheetSection>
			<NoiDung key={kr.id} kr={kr} />
		</DetailSheetBody>
	);
}
