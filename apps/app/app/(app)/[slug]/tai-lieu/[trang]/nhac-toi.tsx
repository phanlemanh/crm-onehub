"use client";

import { Alert, AlertAction, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardHeader,
	CardPanel,
	CardPanelEmpty,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { duongTrang } from "@/lib/tai-lieu-man";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

export type DongNhacToi = {
	slug: string;
	ten: string;
	cau: string;
	vanBan: string;
};

function CauNhac({ cau, vanBan }: { cau: string; vanBan: string }) {
	const viTri = cau.indexOf(vanBan);
	if (viTri < 0) return <span translate="no">{cau}</span>;
	return (
		<span translate="no">
			{cau.slice(0, viTri)}
			<strong>{vanBan}</strong>
			{cau.slice(viTri + vanBan.length)}
		</span>
	);
}

export function NhacToi({ slug }: { slug: string }) {
	const m = taiLieuMessages(useLocale()).doc.nhacToi;
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const ds = useQuery(trpc.taiLieu.nhacToi.queryOptions({ slug }));

	if (ds.isError && !ds.data) {
		return (
			<Alert data-nhac-toi-loi="">
				<AlertDescription>{m.loi}</AlertDescription>
				<AlertAction>
					<Button onClick={() => ds.refetch()} size="sm" variant="outline">
						{m.thuLai}
					</Button>
				</AlertAction>
			</Alert>
		);
	}
	if (!ds.data) return null;
	const rows = ds.data.rows;

	return (
		<Card data-nhac-toi="">
			<CardHeader>
				<CardTitle>{dien(m.tieuDe, { so: rows.length })}</CardTitle>
			</CardHeader>
			<CardPanel>
				{rows.length === 0 ? (
					<CardPanelEmpty>{m.rong}</CardPanelEmpty>
				) : (
					<ItemGroup>
						{rows.map((r) => (
							<Item asChild key={r.slug} variant="outline">
								<Link
									data-nhac-toi-dong={r.slug}
									href={url(duongTrang(r.slug))}
								>
									<ItemContent>
										<ItemTitle translate="no">{r.ten}</ItemTitle>
										<ItemDescription>
											<CauNhac cau={r.cau} vanBan={r.vanBan} />
										</ItemDescription>
									</ItemContent>
								</Link>
							</Item>
						))}
					</ItemGroup>
				)}
			</CardPanel>
		</Card>
	);
}
