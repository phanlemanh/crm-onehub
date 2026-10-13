"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useQuery } from "@tanstack/react-query";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import type { TimelineAnchor } from "@/components/crm/timeline/timeline";
import { viecMessages } from "@/lib/messages/viec";
import { useTRPC } from "@/lib/trpc/client";
import { HanViec, TrangThaiViecNhan, type ViecDong } from "./trang-thai-viec";

function DongViec({ viec }: { viec: ViecDong }) {
	const open = useOpenRecord();
	const toi = viecMessages(useLocale()).oSoan.toi;
	const trpc = useTRPC();
	const toiId = useQuery(trpc.users.me.queryOptions()).data?.id;
	return (
		<Item asChild data-viec={viec.id} size="sm" variant="outline">
			<button onClick={() => open({ kind: "viec", id: viec.id })} type="button">
				<ItemContent>
					<ItemTitle translate="no">{viec.tieuDe}</ItemTitle>
					<ItemDescription>
						<TrangThaiViecNhan trangThai={viec.trangThai} />
						<span aria-hidden> · </span>
						<HanViec viec={viec} />
						<span aria-hidden> · </span>
						<span translate="no">
							{viec.nguoiThucHien.id === toiId ? toi : viec.nguoiThucHien.name}
						</span>
					</ItemDescription>
				</ItemContent>
			</button>
		</Item>
	);
}

export function DongGapViec({ nhan, ds }: { nhan: string; ds: ViecDong[] }) {
	if (ds.length === 0) return null;
	return (
		<Collapsible data-dong-gap="">
			<CollapsibleTrigger asChild>
				<Button size="sm" variant="ghost">
					{nhan}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<ItemGroup>
					{ds.map((v) => (
						<DongViec key={v.id} viec={v} />
					))}
				</ItemGroup>
			</CollapsibleContent>
		</Collapsible>
	);
}

export function KhoiViec({ anchor }: { anchor: TimelineAnchor }) {
	const m = viecMessages(useLocale());
	const trpc = useTRPC();
	const q = useQuery(trpc.viec.cuaBanGhi.queryOptions(anchor));
	if (q.isError) {
		return (
			<section className="pt-3" data-khoi-viec="">
				<VungTaiLoi
					dangTai={q.isFetching}
					moTa={m.loi.moTa}
					onThuLai={() => void q.refetch()}
					tieuDe={m.loi.tieuDe}
				/>
			</section>
		);
	}
	const du = q.data;
	if (!du || du.mo.length + du.daXong.length + du.daHuy.length === 0) {
		return null;
	}
	return (
		<section className="flex flex-col gap-2 pt-3" data-khoi-viec="">
			<SectionHeading
				actions={<Badge variant="secondary">{du.mo.length}</Badge>}
			>
				{m.khoi.tieuDe}
			</SectionHeading>
			<ItemGroup>
				{du.mo.map((v) => (
					<DongViec key={v.id} viec={v} />
				))}
			</ItemGroup>
			<div className="flex flex-wrap gap-2">
				<DongGapViec
					nhan={dien(m.daXong, { n: du.daXong.length })}
					ds={du.daXong}
				/>
				<DongGapViec
					nhan={dien(m.daHuy, { n: du.daHuy.length })}
					ds={du.daHuy}
				/>
			</div>
		</section>
	);
}
