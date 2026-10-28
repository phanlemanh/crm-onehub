"use client";

import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Icon } from "@crm/ui/components/icon";
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
import { SectionHeading } from "@crm/ui/components/section-heading";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { okrMessages } from "@/lib/messages/okr";
import { dichKrTrongBo } from "@/lib/okr-duong-kr";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceSlug } from "@/lib/use-workspace-url";
import { congNgay, ngayThang, TUAN } from "./cap-nhat-tuan/cap-nhat-tuan";
import { giaTri } from "./gia-tri-kr";
import { LoiPhan } from "./loi-phan";

type KrCanCapNhat = RouterOutputs["okr"]["capNhatTuan"]["items"][number];

function ngayVN(luc: string): string {
	return new Date(luc).toLocaleDateString("en-CA", {
		timeZone: "Asia/Ho_Chi_Minh",
	});
}

export function PhanCanCapNhat() {
	const locale = useLocale();
	const m = okrMessages(locale).baPhan;
	const trpc = useTRPC();
	const ds = useQuery(trpc.okr.capNhatTuan.queryOptions());

	if (ds.isPending)
		return (
			<VoPhan tieuDe={m.phan1}>
				<Skeleton className="h-24 w-full" data-khung-xuong="" />
			</VoPhan>
		);
	if (!ds.data)
		return (
			<VoPhan tieuDe={m.phan1}>
				<LoiPhan thuLai={() => void ds.refetch()} />
			</VoPhan>
		);

	const duLieu = ds.data;
	const thieu = duLieu.items.filter((kr) => !kr.updatedThisWeek);
	const tuan = ngayThang(duLieu.weekStart);

	if (duLieu.items.length === 0)
		return (
			<VoPhan tieuDe={m.phan1}>
				<p className="text-muted-foreground text-sm">{m.khongKr}</p>
			</VoPhan>
		);

	if (thieu.length === 0)
		return (
			<VoPhan tieuDe={m.phan1}>
				<p className="text-muted-foreground text-sm">
					{m.daDu(tuan)} {m.suaThiMoKr}
				</p>
			</VoPhan>
		);

	return (
		<VoPhan tieuDe={m.phan1}>
			<p className="text-muted-foreground text-sm">
				{m.conThieu(
					thieu.length,
					tuan,
					ngayThang(congNgay(duLieu.weekStart, TUAN.chuNhat)),
				)}{" "}
				{m.goiYMoKr}
			</p>
			<ItemGroup>
				{thieu.map((kr) => (
					<DongKr key={kr.keyResultId} kr={kr} />
				))}
			</ItemGroup>
		</VoPhan>
	);
}

function DongKr({ kr }: { kr: KrCanCapNhat }) {
	const locale = useLocale();
	const m = okrMessages(locale).baPhan;
	const slug = useWorkspaceSlug();
	const lan =
		kr.lastAt === null
			? m.chuaCapNhatLanNao
			: m.lanTruoc(ngayThang(ngayVN(kr.lastAt)));
	const so = giaTri(kr, kr.currentValue, locale);
	return (
		<Item asChild variant="outline">
			<Link
				data-kr={kr.keyResultId}
				href={dichKrTrongBo(slug, kr.keyResultId, {
					donOkr: kr.donOkr,
					cycleId: kr.cycleId,
				})}
			>
				<ItemContent>
					<ItemTitle translate="no">{kr.title}</ItemTitle>
					<ItemDescription>
						<span translate="no">{kr.unitName}</span> ·{" "}
						<span translate="no">{kr.objectiveTitle}</span>
					</ItemDescription>
					<ItemDescription className="sm:hidden">
						<span className="tabular-nums">{so}</span> · {lan}
					</ItemDescription>
				</ItemContent>
				<ItemActions>
					<span className="hidden flex-col items-end gap-0.5 text-xs sm:flex">
						<span className="font-medium tabular-nums">{so}</span>
						<span className="text-muted-foreground">{lan}</span>
					</span>
					{kr.lastConfidence ? (
						<span className="hidden sm:inline-flex">
							<ConfidenceIndicator level={kr.lastConfidence} size="sm" />
						</span>
					) : null}
					<Icon className="text-muted-foreground" icon={ChevronRight} />
				</ItemActions>
			</Link>
		</Item>
	);
}

function VoPhan({
	tieuDe,
	children,
}: {
	tieuDe: string;
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col gap-3" data-phan="can-cap-nhat">
			<SectionHeading level={2}>{tieuDe}</SectionHeading>
			{children}
		</section>
	);
}
