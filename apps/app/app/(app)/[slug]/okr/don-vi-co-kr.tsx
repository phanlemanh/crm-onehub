"use client";

import { Button } from "@crm/ui/components/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { okrHopTuanBoMessages } from "@/lib/messages/okr-hop-tuan-bo";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import type { CayDuLieu } from "./kieu";
import { type DonChonOkr, parseAsDonOkr } from "./okr-search-params";
import { hrefThe, useGocBoOkr } from "./theo-don-vi/the-con";
import { useHrefDanhSachBo } from "./theo-don-vi/vi-tri-bo";
import { LoiXem } from "./toan-canh/toan-canh";

type HangToanCanh = RouterOutputs["okr"]["toanCanh"]["hang"][number];

type DonViCoKrMuc = {
	khoa: string;
	ten: string;
	soKr: number;
	daCapNhat: number;
	don: DonChonOkr;
};

const KHUNG_TAI = ["a", "b", "c"] as const;

export function donViCoKr(
	hang: HangToanCanh[],
	cay: CayDuLieu,
): DonViCoKrMuc[] {
	const chuaXep = new Set(cay.chuaXep.map((p) => `pb:${p.id}`));
	return hang.flatMap((h) => {
		const duocLiet =
			h.soKr > 0 &&
			(h.cap === "bo-phan" || (h.cap === "phong-ban" && chuaXep.has(h.key)));
		const don = duocLiet ? parseAsDonOkr.parse(h.key) : null;
		return don
			? [
					{
						khoa: h.key,
						ten: h.ten,
						soKr: h.soKr,
						daCapNhat: h.daCapNhat,
						don,
					},
				]
			: [];
	});
}

export function XemMoiBo({ ky }: { ky: string | null }) {
	const m = okrHopTuanBoMessages(useLocale());
	const href = useHrefDanhSachBo(ky);
	return (
		<Button asChild size="sm" variant="outline">
			<Link data-nut="xem-moi-bo" href={href}>
				{m.donViCoKr.xemMoiBo}
			</Link>
		</Button>
	);
}

export function DonViCoKr({
	cycleId,
	ky,
}: {
	cycleId: string;
	ky: string | null;
}) {
	const m = okrHopTuanBoMessages(useLocale());
	const trpc = useTRPC();
	const goc = useGocBoOkr();
	const tc = useQuery(trpc.okr.toanCanh.queryOptions({ cycleId }));
	const cay = useQuery(trpc.org.tree.queryOptions());

	if (tc.isError || cay.isError)
		return (
			<LoiXem
				cau={m.donViCoKr.loi}
				thuLai={() => {
					if (tc.isError) void tc.refetch();
					if (cay.isError) void cay.refetch();
				}}
				trangThai="ST-hoptuan-donvi-loi"
			/>
		);
	if (tc.isPending || cay.isPending)
		return (
			<div
				aria-busy="true"
				className="flex flex-col gap-2"
				data-trang-thai="ST-hoptuan-donvi-tai"
			>
				{KHUNG_TAI.map((k) => (
					<Skeleton className="h-14 w-full" key={k} />
				))}
			</div>
		);

	const ds = donViCoKr(tc.data.hang, cay.data);
	if (ds.length === 0) return <XemMoiBo ky={ky} />;
	return (
		<div className="flex flex-col gap-3" data-don-vi-co-kr="">
			<SectionHeading level={4}>{m.donViCoKr.tieuDe}</SectionHeading>
			<ItemGroup>
				{ds.map((dv) => (
					<Item asChild key={dv.khoa} size="sm" variant="outline">
						<Link
							data-don-vi={dv.khoa}
							href={hrefThe({ goc, don: dv.don, ky, the: "hop-tuan" })}
						>
							<ItemContent>
								<ItemTitle translate="no">{dv.ten}</ItemTitle>
								<ItemDescription>
									{m.donViCoKr.dong(String(dv.soKr), String(dv.daCapNhat))}
								</ItemDescription>
							</ItemContent>
						</Link>
					</Item>
				))}
			</ItemGroup>
		</div>
	);
}
