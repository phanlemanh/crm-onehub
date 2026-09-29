"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Heatmap } from "@crm/ui/components/heatmap";
import { ItemDescription } from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { okrHoiYMessages } from "@/lib/messages/okr-hoi-y";
import { useTRPC } from "@/lib/trpc/client";
import { type DoPhu, type HoiY, ngayCot } from "./man-hoi-y";

type HangDoPhu = DoPhu["hang"][number];

function NhanHang({ hang }: { hang: HangDoPhu }) {
	const m = okrHoiYMessages(useLocale()).doPhu;
	if (hang.loai === "goc") return m.goc;
	if (hang.loai === "chua-xep") return m.chuaXep;
	return <span translate="no">{hang.nhan}</span>;
}

export function BangDoPhu({
	doPhu,
	dangMo,
}: {
	doPhu: DoPhu;
	dangMo: boolean;
}) {
	const locale = useLocale();
	const m = okrHoiYMessages(locale).doPhu;
	const cuoi = doPhu.cot.length - 1;
	return (
		<Heatmap
			caption={m.bang}
			columns={doPhu.cot.map((c, i) => ({
				id: c.ngay,
				label: ngayCot(c.ngay, locale),
				current: dangMo && i === cuoi,
			}))}
			legend={{ cao: m.chuGiaiCao, trong: m.chuGiaiTrong }}
			rows={doPhu.hang.map((hang) => ({
				id: hang.id,
				label: <NhanHang hang={hang} />,
				indent: hang.loai === "phong-ban",
			}))}
			values={doPhu.hang.map((hang) => hang.giaTri)}
		/>
	);
}

export function KhoiDoPhu({ h }: { h: HoiY }) {
	const m = okrHoiYMessages(useLocale()).doPhu;
	const trpc = useTRPC();
	const doPhu = useQuery(
		trpc.okr.hoiYDoPhu.queryOptions({ hoiYId: h.hoiY.id }),
	);
	return (
		<Card data-khoi="do-phu">
			<CardHeader>
				<CardTitle>{m.tieuDe}</CardTitle>
				<CardDescription>{m.moTa}</CardDescription>
			</CardHeader>
			<CardContent>
				{doPhu.data ? (
					<BangDoPhu dangMo={h.trangThai === "dang-mo"} doPhu={doPhu.data} />
				) : doPhu.isError ? (
					<ItemDescription>{m.loi}</ItemDescription>
				) : (
					<Skeleton className="h-32 w-full" />
				)}
			</CardContent>
		</Card>
	);
}
