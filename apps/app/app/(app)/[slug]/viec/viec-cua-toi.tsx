"use client";

import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { NHOM_VIEC, VIEC } from "@crm/validation/viec";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { BangViec } from "@/components/viec/bang-viec";
import { useMoGiaoViec } from "@/components/viec/giao-viec";
import { DongGapViec } from "@/components/viec/khoi-viec";
import { viecMessages } from "@/lib/messages/viec";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";

const DONG_CHO = Array.from({ length: VIEC.soDongCho }, (_, i) => `cho-${i}`);

const nhomParser = parseAsStringLiteral(NHOM_VIEC).withDefault("giao-cho-toi");

export function ViecCuaToi() {
	const m = viecMessages(useLocale());
	const trpc = useTRPC();
	const moGiao = useMoGiaoViec();
	const [nhom, setNhom] = useQueryState(SEARCH_PARAM.viec.nhom, nhomParser);
	const q = useQuery({
		...trpc.viec.cuaToi.queryOptions({ nhom }),
		placeholderData: (truoc) => truoc,
	});

	const [nhomDaTai, setNhomDaTai] = useState(nhom);
	if (q.data && !q.isPlaceholderData && nhomDaTai !== nhom) {
		setNhomDaTai(nhom);
	}
	const nhomHienThi = q.isPlaceholderData ? nhomDaTai : nhom;

	if (q.isPending) {
		return (
			<div
				aria-busy="true"
				className="flex flex-col gap-3"
				data-viec-cho-tai=""
			>
				<Skeleton className="h-8 w-80" />
				{DONG_CHO.map((khoa) => (
					<Skeleton className="h-10 w-full" key={khoa} />
				))}
			</div>
		);
	}
	const du = q.data;
	const chip = (
		<div className="max-w-full overflow-x-auto">
			<ToggleGroup
				onValueChange={(v) => {
					const chon = NHOM_VIEC.find((n) => n === v);
					if (chon) void setNhom(chon);
				}}
				size="sm"
				type="single"
				value={nhom}
				variant="outline"
			>
				{NHOM_VIEC.map((n) => (
					<ToggleGroupItem data-nhom={n} key={n} value={n}>
						{m.nhom[n]}
						{du ? (
							<span className="text-muted-foreground tabular-nums" data-dem="">
								{du.demNhom[n]}
							</span>
						) : null}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
	if (!du) {
		return (
			<div className="flex flex-col gap-4">
				{chip}
				<VungTaiLoi
					dangTai={q.isFetching}
					moTa={m.loi.moTa}
					onThuLai={() => void q.refetch()}
					tieuDe={m.loi.tieuDe}
				/>
			</div>
		);
	}
	const rong = du.mo.length + du.soXong + du.soHuy === 0;
	return (
		<div aria-busy={q.isPlaceholderData} className="flex flex-col gap-4">
			{chip}
			{rong ? (
				<Empty border="solid">
					<EmptyHeader>
						<EmptyTitle>{m.rong[nhomHienThi]}</EmptyTitle>
						<EmptyDescription>{m.rong.moTa}</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={moGiao} variant="outline">
							{m.trang.giaoViec}
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<>
					<BangViec ds={du.mo} nhom={nhomHienThi} />
					<div className="flex flex-wrap gap-2">
						<DongGapViec
							ds={du.daXong}
							nhan={dien(m.daXong, { n: du.soXong })}
						/>
						<DongGapViec ds={du.daHuy} nhan={dien(m.daHuy, { n: du.soHuy })} />
					</div>
				</>
			)}
		</div>
	);
}
