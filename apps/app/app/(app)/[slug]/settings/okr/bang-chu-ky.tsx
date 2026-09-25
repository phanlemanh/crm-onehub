"use client";

import Add from "@carbon/icons-react/es/Add";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { CardTableEmpty } from "@crm/ui/components/card-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { formatDay } from "@crm/ui/lib/format";
import { type PhaChuKy, phaSau } from "@crm/validation/okr-chu-ky";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { CELL, type ChuKy } from "@/app/(app)/[slug]/okr/kieu";
import { ConfirmDialog } from "@/app/(app)/[slug]/settings/members/confirm-dialog";
import { okrMessages } from "@/lib/messages/okr";
import type { GoiYChuKy } from "@/lib/okr-chu-ky-nhan";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { parseMoChuKy, THAM_SO_MO_CHU_KY } from "./okr-settings-search-params";
import { SheetMoChuKy } from "./sheet-mo-chu-ky";
import { DangTaiThe, LoiThe, useQuyenChuongTrinh } from "./trang-thai-cai-dat";

const TONE_PHA = {
	"lap-ke-hoach": "info",
	"dang-chay": "success",
	"cham-diem": "warning",
	"da-dong": "neutral",
} as const satisfies Record<PhaChuKy, StatusTone>;

function theoNam(cycles: ChuKy[]): ChuKy[] {
	const nam = cycles.filter((c) => c.kind === "nam");
	const coCha = new Set(nam.map((c) => c.id));
	return [
		...nam.flatMap((n) => [n, ...cycles.filter((c) => c.parentId === n.id)]),
		...cycles.filter(
			(c) =>
				c.kind !== "nam" && (c.parentId === null || !coCha.has(c.parentId)),
		),
	];
}

export function BangChuKy({ goiY }: { goiY: GoiYChuKy }) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const c = m.caiDat;
	const trpc = useTRPC();
	const cycles = useQuery(trpc.okr.cycles.queryOptions());
	const { canManage, lyDo } = useQuyenChuongTrinh();
	const [, setMo] = useQueryState(THAM_SO_MO_CHU_KY, parseMoChuKy);

	const cot: SimpleTableColumn[] = [
		{ id: "ten", header: c.chuKy.cot.ten },
		{ id: "loai", header: c.chuKy.cot.loai, width: "w-24" },
		{ id: "tu", header: c.chuKy.cot.tu, width: "w-32" },
		{ id: "den", header: c.chuKy.cot.den, width: "w-32" },
		{ id: "pha", header: c.chuKy.cot.pha, width: "w-36" },
		{ id: "hanhDong", srLabel: c.chuKy.menu, width: "w-12" },
	];

	const ds = cycles.data ? theoNam(cycles.data.cycles) : [];

	return (
		<Card data-the="chu-ky">
			<CardHeader>
				<CardTitle>{c.chuKy.tieuDe}</CardTitle>
				<CardDescription>{c.chuKy.moTa}</CardDescription>
				<CardAction>
					<Button
						disabled={!canManage}
						aria-describedby={lyDo}
						data-nut="mo-chu-ky"
						onClick={() => void setMo(true)}
					>
						<Icon icon={Add} data-icon="inline-start" />
						{c.chuKy.moChuKy}
					</Button>
				</CardAction>
			</CardHeader>

			{cycles.isError ? (
				<LoiThe thuLai={() => void cycles.refetch()} />
			) : !cycles.data ? (
				<DangTaiThe />
			) : ds.length === 0 ? (
				<CardTableEmpty>{c.chuKy.rong}</CardTableEmpty>
			) : (
				<SimpleTable columns={cot}>
					{ds.map((ky) => (
						<SimpleTableRow key={ky.id} data-chu-ky={ky.id}>
							<TableCell className={CELL}>
								<span translate="no">{ky.name}</span>
							</TableCell>
							<TableCell className={`${CELL} text-muted-foreground`}>
								{m.loaiChuKy[ky.kind]}
							</TableCell>
							<TableCell className={`${CELL} tabular-nums`}>
								{formatDay(ky.startsOn, locale)}
							</TableCell>
							<TableCell className={`${CELL} tabular-nums`}>
								{formatDay(ky.endsOn, locale)}
							</TableCell>
							<TableCell className={CELL}>
								<StatusIndicator
									size="sm"
									tone={TONE_PHA[ky.phase]}
									label={c.pha[ky.phase]}
								/>
							</TableCell>
							<TableCell className={`${CELL} text-right`}>
								<MenuChuKy ky={ky} canManage={canManage} lyDo={lyDo} />
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			)}

			<SheetMoChuKy
				canManage={canManage}
				cacNam={ds.filter((ky) => ky.kind === "nam")}
				goiY={goiY}
			/>
		</Card>
	);
}

function MenuChuKy({
	ky,
	canManage,
	lyDo,
}: {
	ky: ChuKy;
	canManage: boolean;
	lyDo: string | undefined;
}) {
	const m = okrMessages(useLocale());
	const c = m.caiDat;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [hoi, setHoi] = useState(false);
	const ke = phaSau(ky.phase);

	const chuyen = useMutation(
		trpc.okr.setCyclePhase.mutationOptions({
			onSuccess: async () => {
				await cache.okr();
				if (ke) toast.success(c.chuKy.daChuyen(ky.name, c.pha[ke]));
				setHoi(false);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						aria-label={c.chuKy.menu}
						aria-describedby={lyDo}
						size="icon-sm"
						variant="ghost"
						disabled={!canManage || ke === null}
						data-menu-chu-ky={ky.id}
					>
						<Icon icon={OverflowMenuHorizontal} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{ke ? (
						<DropdownMenuItem onSelect={() => setHoi(true)}>
							{c.chuKy.chuyenSang(c.pha[ke])}
						</DropdownMenuItem>
					) : null}
				</DropdownMenuContent>
			</DropdownMenu>
			{ke ? (
				<ConfirmDialog
					tone="default"
					tieuDe={c.chuKy.hoi.title(ky.name, c.pha[ke])}
					than={c.chuKy.hoi.body}
					nut={c.chuKy.hoi.action}
					thoi={c.chuKy.hoi.cancel}
					open={hoi}
					pending={chuyen.isPending}
					onOpenChange={(mo) => {
						if (!mo && !chuyen.isPending) setHoi(false);
					}}
					onConfirm={() => {
						if (!chuyen.isPending) chuyen.mutate({ id: ky.id, phase: ke });
					}}
				/>
			) : null}
		</>
	);
}
