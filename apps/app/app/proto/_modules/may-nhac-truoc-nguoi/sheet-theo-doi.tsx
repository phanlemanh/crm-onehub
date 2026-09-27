"use client";

import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import View from "@carbon/icons-react/es/View";
import ViewFilled from "@carbon/icons-react/es/ViewFilled";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { Checkbox } from "@crm/ui/components/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { EntityLogo } from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import { useState } from "react";
import {
	DetailSheet,
	DetailSheetBody,
	DetailSheetHeader,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
	DetailSheetTabs,
} from "@/components/detail-sheet";
import { BAN_THAN, BUOC_KE_HOACH, KE_HOACH, NGUOI_THEO_DOI } from "./du-lieu";

export type DauTheoDoi = "chua" | "dang" | "loi";

const THOI_GIAN_GUI_MS = 900;

const COT_BUOC: SimpleTableColumn[] = [
	{ id: "done", srLabel: "Đã xong", width: "w-8" },
	{ id: "step", header: "Bước" },
	{ id: "who", header: "Người được giao", width: "w-40" },
];

function NutTheoDoi({
	dau,
	onLoi,
}: {
	dau: DauTheoDoi;
	onLoi: (loi: boolean) => void;
}) {
	const [dang, setDang] = useState(dau === "dang");
	const [dangGui, setDangGui] = useState(false);
	const nguoi = dang ? [BAN_THAN, ...NGUOI_THEO_DOI] : NGUOI_THEO_DOI;

	const bam = () => {
		setDangGui(true);
		onLoi(false);
		setTimeout(() => {
			setDangGui(false);
			setDang((truoc) => !truoc);
		}, THOI_GIAN_GUI_MS);
	};

	const nut = (
		<Button
			aria-pressed={dang}
			disabled={dangGui}
			onClick={bam}
			size="sm"
			variant="outline"
		>
			<Icon icon={dang ? ViewFilled : View} />
			{dang ? "Đang theo dõi" : "Theo dõi"}
			{dang ? <span className="tabular-nums">· {nguoi.length}</span> : null}
		</Button>
	);

	if (!dang) return nut;

	return (
		<Tooltip defaultOpen={dau === "dang"}>
			<TooltipTrigger asChild>{nut}</TooltipTrigger>
			<TooltipContent>
				<span translate="no">{nguoi.join(", ")}</span>
			</TooltipContent>
		</Tooltip>
	);
}

function MenuKeHoach() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label="Thao tác với kế hoạch"
					size="icon-sm"
					variant="ghost"
				>
					<Icon icon={OverflowMenuHorizontal} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem>Đóng kế hoạch</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function TabBuoc() {
	return (
		<DetailSheetBody>
			<SimpleTable columns={COT_BUOC}>
				{BUOC_KE_HOACH.map((b) => (
					<SimpleTableRow key={b.id}>
						<TableCell>
							<Checkbox
								aria-label={`Đánh dấu xong ${b.nhan}`}
								checked={b.xong}
							/>
						</TableCell>
						<TableCell translate="no">{b.nhan}</TableCell>
						<TableCell translate="no">
							{b.nguoi ?? <EmptyCellValue />}
						</TableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
		</DetailSheetBody>
	);
}

export function SheetTheoDoi({
	dau,
	onClose,
}: {
	dau: DauTheoDoi;
	onClose: () => void;
}) {
	const [tab, setTab] = useState("buoc");
	const [loi, setLoi] = useState(dau === "loi");

	const tabs: DetailSheetTab[] = [
		{
			value: "buoc",
			label: "Bước",
			count: BUOC_KE_HOACH.length,
			content: <TabBuoc />,
		},
		{ value: "moi-gioi", label: "Môi giới", content: <span /> },
		{ value: "hoat-dong", label: "Hoạt động", content: <span /> },
	];

	return (
		<DetailSheet
			onOpenChange={(mo) => {
				if (!mo) onClose();
			}}
			open
		>
			<DetailSheetHeader
				actions={
					<>
						<NutTheoDoi dau={dau} onLoi={setLoi} />
						<MenuKeHoach />
					</>
				}
				description={
					<>
						Kế hoạch 30 ngày · khuôn {KE_HOACH.khuon} ·{" "}
						<button
							className="text-foreground underline-offset-2 hover:underline"
							type="button"
						>
							Hồ sơ công ty
						</button>
					</>
				}
				media={<EntityLogo name={KE_HOACH.congTy} size="lg" />}
				title={<span translate="no">{KE_HOACH.congTy}</span>}
			/>
			{loi ? (
				<div aria-live="polite" className="border-b px-5 py-3" role="status">
					<Alert variant="destructive">
						<AlertTitle>Không lưu được theo dõi</AlertTitle>
						<AlertDescription>
							Bạn vẫn chưa theo dõi kế hoạch này. Bấm «Theo dõi» để thử lại.
						</AlertDescription>
					</Alert>
				</div>
			) : null}
			<DetailSheetStats>
				<DetailSheetStat label="Ngày">
					<span className="tabular-nums">{KE_HOACH.ngay}</span>
				</DetailSheetStat>
				<DetailSheetStat label="Bước">
					<span className="tabular-nums">{KE_HOACH.buoc}</span>
				</DetailSheetStat>
				<DetailSheetStat label="Im lặng">
					<span className="tabular-nums">{KE_HOACH.im}</span>
				</DetailSheetStat>
				<DetailSheetStat label="Cầm trịch">
					<span className="flex items-center gap-1.5" translate="no">
						<PersonAvatar name={KE_HOACH.camTrich} size="sm" />
						{KE_HOACH.camTrich}
					</span>
				</DetailSheetStat>
			</DetailSheetStats>
			<DetailSheetTabs onValueChange={setTab} tabs={tabs} value={tab} />
		</DetailSheet>
	);
}
