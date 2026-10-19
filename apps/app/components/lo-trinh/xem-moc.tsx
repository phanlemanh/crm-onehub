"use client";

import { Button } from "@crm/ui/components/button";
import { Card, CardContent } from "@crm/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { ItemGroup } from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Timeline,
	TimelineContent,
	TimelineDate,
	TimelineHeader,
	TimelineIndicator,
	TimelineItem,
	TimelineSeparator,
	TimelineTitle,
} from "@crm/ui/components/reui/timeline";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { formatDay } from "@crm/ui/lib/format";
import type { DuLieuChoXem } from "@crm/validation/lo-trinh-du-lieu";
import { duKienMoc } from "@/lib/lo-trinh/du-kien";
import { soSanhMoc } from "@/lib/lo-trinh/ngay";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import { DongLienQuan } from "./dong-lien-quan";
import { KhungTrong } from "./khung-trong";
import { ODuKien } from "./o-du-kien";
import { khoaMoc, mocHienCua, type Viec } from "./viec";

export function XemMoc({
	viec,
	duLieu,
	homNay,
	moViec,
}: {
	viec: Viec[];
	duLieu: DuLieuChoXem;
	homNay: string | null;
	moViec: (khoa: string) => void;
}) {
	const locale = useLocale();
	const m = loTrinhMessages(locale);
	const theoKhoa = new Map(
		mocHienCua(duLieu).map((x) => [
			x.khoa,
			{ ...x, lo: x.loTrinh.ten ?? x.loTrinh.tep, ds: [] as Viec[] },
		]),
	);
	for (const v of viec) theoKhoa.get(khoaMoc(v))?.ds.push(v);
	const mocs = [...theoKhoa.entries()]
		.filter(([, x]) => x.ds.length > 0)
		.sort((a, b) => soSanhMoc(a[1].moc, b[1].moc))
		.map(
			([khoa, x]) =>
				[khoa, { ...x, duKien: duKienMoc(x.loTrinh, x.moc, homNay) }] as const,
		);
	const daQua =
		homNay === null
			? 0
			: mocs.filter(
					([, x]) => x.moc.ngayHopLe !== null && x.moc.ngayHopLe < homNay,
				).length;
	const khongMoc = viec.filter((v) => v.chuaHen);
	if (!mocs.length && !khongMoc.length)
		return (
			<KhungTrong
				ca="khong-khop"
				moTa={m.trong.khongKhopMoTa}
				tieuDe={m.trong.khongKhopTieuDe}
			/>
		);
	return (
		<Card data-lo-trinh-xem-moc>
			<CardContent className="flex flex-col gap-6">
				<Timeline rail value={daQua}>
					{mocs.map(([khoa, x], i) => (
						<TimelineItem data-lo-trinh-moc={khoa} key={khoa} step={i + 1}>
							<TimelineHeader>
								<TimelineSeparator />
								<TimelineDate>{formatDay(x.moc.ngay, locale)}</TimelineDate>
								<TimelineTitle translate="no">{x.moc.ten}</TimelineTitle>
								<TimelineIndicator />
							</TimelineHeader>
							<TimelineContent className="flex flex-col gap-2 pt-1">
								<span className="text-muted-foreground text-xs" translate="no">
									{x.lo}
								</span>
								{x.dem ? (
									<span
										className="text-muted-foreground text-xs tabular-nums"
										data-lo-trinh-moc-dem={khoa}
									>
										{x.dem.conLai > 0
											? `${m.moc.conLai(String(x.dem.conLai), String(x.dem.tong))}${x.dem.tong > x.dem.conLai ? m.moc.daGiaoThem(String(x.dem.tong - x.dem.conLai)) : ""}`
											: m.moc.giaoDu(String(x.dem.tong))}
									</span>
								) : null}
								{x.duKien ? (
									<span className="text-sm" data-lo-trinh-du-kien-moc={khoa}>
										<ODuKien duKien={x.duKien} gon={false} />
									</span>
								) : null}
								<ItemGroup>
									{x.ds.map((v) => (
										<DongLienQuan key={v.khoa} moViec={moViec} x={v} />
									))}
								</ItemGroup>
							</TimelineContent>
						</TimelineItem>
					))}
				</Timeline>
				{khongMoc.length ? (
					<Collapsible className="flex flex-col gap-2" data-lo-trinh-khong-moc>
						<SectionHeading
							actions={
								<CollapsibleTrigger asChild>
									<Button size="sm" variant="ghost">
										{m.moc.xem}
									</Button>
								</CollapsibleTrigger>
							}
							level={4}
						>
							{m.loc.chuaHenMoc}{" "}
							<span className="text-muted-foreground tabular-nums">
								{khongMoc.length}
							</span>
						</SectionHeading>
						<CollapsibleContent>
							<ItemGroup>
								{khongMoc.map((v) => (
									<DongLienQuan key={v.khoa} moViec={moViec} x={v} />
								))}
							</ItemGroup>
						</CollapsibleContent>
					</Collapsible>
				) : null}
			</CardContent>
		</Card>
	);
}
