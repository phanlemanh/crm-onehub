"use client";

import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	ConfidenceIndicator,
	PaceIndicator,
} from "@crm/ui/components/okr-status";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { TableCell } from "@crm/ui/components/table";
import { skipToken, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMoDienBien } from "@/components/crm/record-sheet/dien-bien-kr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { ThanhTienDo } from "./tien-do-kr";

type DongKr = RouterOutputs["okr"]["khoiCuaToi"]["kr"][number];

function Dong({ d }: { d: DongKr }) {
	const moDienBien = useMoDienBien();
	return (
		<SimpleTableRow data-kr-cua-toi={d.keyResultId} data-nhip={d.nhip}>
			<TableCell className="px-3 py-2.5 align-top whitespace-normal">
				<button
					className="block text-start text-sm underline-offset-2 hover:underline focus-visible:underline"
					data-mo-kr={d.keyResultId}
					onClick={() => moDienBien(d.objectiveId, d.keyResultId)}
					translate="no"
					type="button"
				>
					{d.tieuDe}
				</button>
				<span className="block text-muted-foreground text-xs" translate="no">
					{d.mucTieu}
				</span>
			</TableCell>
			<TableCell className="px-3 py-2.5 align-top">
				<span className="flex flex-col gap-1.5">
					<ThanhTienDo
						expected={d.expected}
						progress={d.progress}
						ten={d.tieuDe}
					/>
					<span className="flex items-center justify-between gap-2 text-xs">
						<PaceIndicator pace={d.nhip} size="sm" />
						<span className="text-muted-foreground tabular-nums">
							{d.progress}%
						</span>
					</span>
				</span>
			</TableCell>
			<TableCell className="hidden px-3 py-2.5 align-top sm:table-cell">
				{d.tuTin ? (
					<ConfidenceIndicator level={d.tuTin} size="sm" />
				) : (
					<span className="text-muted-foreground">—</span>
				)}
			</TableCell>
		</SimpleTableRow>
	);
}

export function KhoiKrCuaToi({
	cycleId,
	userId,
}: {
	cycleId?: string;
	userId?: string;
}) {
	const mt = okrToanCanhMessages(useLocale());
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const cycles = useQuery({
		...trpc.okr.cycles.queryOptions(),
		enabled: cycleId === undefined,
	});
	const ky = cycleId ?? cycles.data?.currentId ?? null;
	const khoi = useQuery(
		trpc.okr.khoiCuaToi.queryOptions(
			ky === null ? skipToken : { cycleId: ky, userId: userId ?? null },
		),
	);
	const laNguoi = userId !== undefined;

	if (ky === null && !cycles.isPending) return null;
	const cot: SimpleTableColumn[] = [
		{ id: "kr", header: mt.khoiCuaToi.cotKr },
		{ id: "tien-do", header: mt.hopTuan.cotTienDo, width: "w-[34%]" },
		{
			id: "tu-tin",
			header: mt.loc.tuTin,
			width: "w-[16%]",
			className: "hidden sm:table-cell",
		},
	];
	const rong = khoi.data?.kr.length === 0;

	return (
		<Card
			data-khoi="okr-cua-toi"
			data-trang-thai={
				khoi.data === undefined
					? undefined
					: laNguoi
						? rong
							? "ST-nguoi-rong"
							: "ST-nguoi-codulieu"
						: rong
							? "ST-tongquan-rong"
							: "ST-tongquan-khoi"
			}
		>
			<CardHeader>
				<CardTitle>
					{laNguoi ? mt.khoiCuaToi.tieuDeNguoi : mt.khoiCuaToi.tieuDe}
				</CardTitle>
				<CardDescription>
					{rong
						? laNguoi
							? mt.khoiCuaToi.rongNguoi
							: mt.khoiCuaToi.rong
						: mt.khoiCuaToi.moTa}
				</CardDescription>
				{laNguoi ? null : (
					<CardAction>
						<Button asChild size="sm" variant="outline">
							<Link data-nut="mo-okr" href={url("/okr")}>
								{mt.khoiCuaToi.moOkr}
								<Icon icon={ArrowRight} data-icon="inline-end" />
							</Link>
						</Button>
					</CardAction>
				)}
			</CardHeader>
			{khoi.isError ? (
				<CardContent>
					<p className="text-muted-foreground text-sm">{mt.khoiCuaToi.loi}</p>
				</CardContent>
			) : khoi.data === undefined ? (
				<CardContent>
					<Skeleton className="h-24 w-full" />
				</CardContent>
			) : rong ? null : (
				<SimpleTable columns={cot} surface="page">
					{khoi.data.kr.map((d) => (
						<Dong d={d} key={d.keyResultId} />
					))}
				</SimpleTable>
			)}
			{khoi.data && khoi.data.tong > khoi.data.kr.length ? (
				<CardFooter>
					<span className="text-muted-foreground text-xs">
						{mt.khoiCuaToi.conNua(String(khoi.data.tong - khoi.data.kr.length))}
					</span>
				</CardFooter>
			) : null}
		</Card>
	);
}
