"use client";

import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardPanel,
	CardPanelEmpty,
	CardTitle,
} from "@crm/ui/components/card";
import { Checkbox } from "@crm/ui/components/checkbox";
import { EntityLogo } from "@crm/ui/components/entity-logo";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import type { CSSProperties } from "react";
import {
	DONG_TASKS,
	type DongTasksMau,
	MO_TA_TASKS,
	THOA_THUAN_MO,
} from "./du-lieu";

const CELL = "px-3 py-2.5 align-middle";

const COT_TASKS: SimpleTableColumn[] = [
	{ id: "done", srLabel: "Đã xong", width: "w-8" },
	{ id: "task", header: "Việc" },
	{ id: "overdue", header: "Quá hạn", width: "w-24", align: "right" },
];

const COT_MO: SimpleTableColumn[] = [
	{ id: "deal", header: "Thoả thuận" },
	{
		id: "stage",
		header: "Giai đoạn",
		width: "w-32",
		className: "hidden lg:table-cell",
	},
	{
		id: "share",
		srLabel: "Tỷ lệ so với cái lớn nhất",
		width: "w-24",
		className: "hidden sm:table-cell",
	},
	{ id: "value", header: "Giá trị", width: "w-24", align: "right" },
];

function TheThoaThuanMo() {
	return (
		<Card className="min-w-0">
			<CardHeader>
				<CardTitle>Thoả thuận đang mở</CardTitle>
				<CardDescription>
					Những thoả thuận mở lớn nhất, và mỗi cái đã ở giai đoạn hiện tại bao
					lâu
				</CardDescription>
				<CardAction>
					<Button size="sm" variant="contrast">
						Mở danh sách
					</Button>
				</CardAction>
			</CardHeader>
			<CardPanel>
				<SimpleTable columns={COT_MO} surface="page" variant="panel">
					{THOA_THUAN_MO.map((d) => (
						<SimpleTableRow clickable key={d.id}>
							<TableCell className={CELL}>
								<span className="flex min-w-0 items-center gap-2">
									<EntityLogo name={d.congTy} size="sm" />
									<span className="flex min-w-0 flex-col" translate="no">
										<span className="truncate font-medium">{d.ten}</span>
										<span className="truncate text-muted-foreground">
											{d.congTy} · {d.tuLuc}
										</span>
									</span>
								</span>
							</TableCell>
							<TableCell className={`${CELL} hidden lg:table-cell`}>
								<StatusIndicator label={d.giaiDoan} tone="primary" />
							</TableCell>
							<TableCell className={`${CELL} hidden sm:table-cell`}>
								<span className="flex h-1.5 w-full overflow-hidden bg-muted">
									<span
										className="h-full w-(--share) bg-primary"
										style={{ "--share": `${d.ty}%` } as CSSProperties}
									/>
								</span>
							</TableCell>
							<TableCell className={`${CELL} text-right tabular-nums`}>
								{d.giaTri}
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</CardPanel>
		</Card>
	);
}

function DongKhongTich({
	dong,
	onMo,
}: {
	dong: Extract<DongTasksMau, { loai: "im" | "moc" }>;
	onMo: () => void;
}) {
	const im = dong.loai === "im";
	return (
		<SimpleTableRow clickable data-dong={dong.loai} onClick={onMo}>
			<TableCell className={CELL} />
			<TableCell className={CELL}>
				<span className="flex min-w-0 flex-col">
					<span className="flex min-w-0 gap-1">
						<span className="shrink-0">{im ? "Kế hoạch im" : "Mốc ngày"}</span>
						<span aria-hidden>·</span>
						<span className="truncate" translate="no">
							{dong.congTy}
						</span>
					</span>
					<span className="flex min-w-0 gap-1 text-muted-foreground">
						<span className="truncate">{dong.goiY}</span>
						<span aria-hidden>·</span>
						<span>Kế hoạch</span>
					</span>
				</span>
			</TableCell>
			<TableCell className={`${CELL} text-right`}>
				<StatusIndicator label={dong.han} tone={im ? "error" : "neutral"} />
			</TableCell>
		</SimpleTableRow>
	);
}

function DongCoTich({
	dong,
}: {
	dong: Extract<DongTasksMau, { loai: "viec" | "buoc" }>;
}) {
	const buoc = dong.loai === "buoc";
	return (
		<SimpleTableRow data-dong={dong.loai}>
			<TableCell className={CELL}>
				<Checkbox
					aria-label={buoc ? `Đánh dấu xong ${dong.nhan}` : "Đánh dấu đã xong"}
					checked={false}
				/>
			</TableCell>
			<TableCell className={CELL}>
				<span className="flex min-w-0 flex-col">
					<span className="truncate" translate="no">
						{dong.nhan}
					</span>
					<span className="flex min-w-0 gap-1 text-muted-foreground">
						<span className="truncate" translate="no">
							{dong.congTy}
						</span>
						{buoc ? (
							<>
								<span aria-hidden>·</span>
								<span>Kế hoạch</span>
							</>
						) : null}
					</span>
				</span>
			</TableCell>
			<TableCell className={`${CELL} text-right`}>
				<StatusIndicator
					label={dong.han}
					tone={!buoc || dong.quaHan ? "error" : "neutral"}
				/>
			</TableCell>
		</SimpleTableRow>
	);
}

function TheTasks({ rong, onMo }: { rong: boolean; onMo: () => void }) {
	return (
		<Card className="min-w-0">
			<CardHeader>
				<CardTitle>Việc quá hạn</CardTitle>
				<CardDescription>
					{rong
						? "Mọi việc bạn ghi đều đã xong hoặc chưa tới hạn"
						: MO_TA_TASKS}
				</CardDescription>
			</CardHeader>
			<CardPanel>
				{rong ? (
					<CardPanelEmpty>Không có việc quá hạn.</CardPanelEmpty>
				) : (
					<SimpleTable columns={COT_TASKS} surface="page" variant="panel">
						{DONG_TASKS.map((d) =>
							d.loai === "im" || d.loai === "moc" ? (
								<DongKhongTich dong={d} key={d.id} onMo={onMo} />
							) : (
								<DongCoTich dong={d} key={d.id} />
							),
						)}
					</SimpleTable>
				)}
			</CardPanel>
		</Card>
	);
}

export function TheTongQuan({
	rong,
	onMo,
}: {
	rong: boolean;
	onMo: () => void;
}) {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<TheThoaThuanMo />
			<TheTasks onMo={onMo} rong={rong} />
		</div>
	);
}
