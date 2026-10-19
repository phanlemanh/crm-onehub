"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { FieldDescription } from "@crm/ui/components/field";
import { Heatmap } from "@crm/ui/components/heatmap";
import { ItemDescription } from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { okrHoiYMessages } from "@/lib/messages/okr-hoi-y";
import { useTRPC } from "@/lib/trpc/client";
import { useTenGoc } from "../ten-goc";
import { type DoPhu, type HoiY, ngayCot } from "./man-hoi-y";

type HangDoPhu = DoPhu["hang"][number];

function NhanHang({ hang }: { hang: HangDoPhu }) {
	const m = okrHoiYMessages(useLocale()).doPhu;
	const tenGoc = useTenGoc(m.goc);
	if (hang.loai === "goc") return <span translate="no">{tenGoc}</span>;
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
			</CardHeader>
			<CardContent>
				<FieldDescription data-mo-ta>{m.moTa}</FieldDescription>
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
