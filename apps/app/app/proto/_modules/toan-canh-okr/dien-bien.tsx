"use client";

import Target from "@carbon/icons-react/es/Target";
import {
	CartesianGrid,
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	Line,
	LineChart,
	ReferenceLine,
	XAxis,
	YAxis,
} from "@crm/ui/components/chart";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { useState } from "react";
import {
	DetailSheet,
	DetailSheetBody,
	DetailSheetHeader,
	DetailSheetSection,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
	DetailSheetTabs,
} from "@/components/detail-sheet";
import { KY, MT_CSKH_1 } from "../ban-mau-okr/du-lieu";
import {
	LoaiMucTieuNhan,
	TenNguoi,
	TinhTrangKr,
	TuTin,
} from "../ban-mau-okr/phan-chung";
import { DIEN_BIEN_C1K2, DIEN_BIEN_MOC } from "./du-lieu";

export type HinhDienBien = "so" | "moc" | "chua-co";

const CAU_HINH = {
	giaTri: { label: "Giá trị", color: "var(--foreground)" },
	kyVong: { label: "Lẽ ra", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const DICH = 85;

function BieuDoKr() {
	return (
		<div className="flex flex-col gap-3">
			<ChartContainer
				aria-label={`Đối tác chấm hài lòng từ 4/5 theo tuần, đích ${DICH}%`}
				className="aspect-auto h-56 w-full"
				config={CAU_HINH}
				role="img"
			>
				<LineChart
					data={DIEN_BIEN_C1K2}
					margin={{ top: 16, right: 72, bottom: 0, left: 0 }}
				>
					<CartesianGrid stroke="var(--border)" vertical={false} />
					<XAxis
						axisLine={false}
						dataKey="tuan"
						tickLine={false}
						tickMargin={12}
					/>
					<YAxis
						axisLine={false}
						domain={[50, 100]}
						tickFormatter={(v: number) => `${v}%`}
						tickLine={false}
						width={40}
					/>
					<ChartTooltip content={<ChartTooltipContent indicator="line" />} />
					<ReferenceLine
						label={{
							value: `Đích ${DICH}%`,
							position: "right",
							fill: "var(--foreground)",
							fontSize: 12,
						}}
						stroke="var(--foreground)"
						strokeDasharray="0"
						y={DICH}
					/>
					<Line
						dataKey="kyVong"
						dot={false}
						stroke="var(--color-kyVong)"
						strokeDasharray="4 4"
						strokeWidth={2}
						type="linear"
					/>
					<Line
						connectNulls={false}
						dataKey="giaTri"
						dot={{ r: 4 }}
						stroke="var(--color-giaTri)"
						strokeWidth={2}
						type="linear"
					/>
				</LineChart>
			</ChartContainer>
			<p className="text-muted-foreground text-xs">
				Đường liền: giá trị mỗi lần cập nhật tuần. Đường đứt: lẽ ra đã tới. Vạch
				ngang: đích.
			</p>
			<ol
				aria-label="Mức tự tin theo tuần"
				className="flex flex-wrap gap-x-4 gap-y-2"
			>
				{DIEN_BIEN_C1K2.filter((d) => d.tuTin !== null).map((d) => (
					<li className="flex items-center gap-1.5 text-xs" key={d.tuan}>
						<span className="text-muted-foreground tabular-nums">{d.tuan}</span>
						{d.tuTin ? <TuTin coNhan={false} muc={d.tuTin} size="sm" /> : null}
					</li>
				))}
			</ol>
		</div>
	);
}

function DongThoiMoc() {
	return (
		<ol aria-label="Diễn biến mốc" className="flex flex-col gap-3">
			{DIEN_BIEN_MOC.map((d) => (
				<li className="flex flex-col gap-1 text-sm" key={d.tuan}>
					<span className="flex items-center gap-3">
						<span className="text-muted-foreground tabular-nums">{d.tuan}</span>
						<span>Chưa xong</span>
						<TuTin coNhan={false} muc={d.tuTin} size="sm" />
					</span>
					{d.ghiChu ? (
						<span className="text-muted-foreground text-xs" translate="no">
							«{d.ghiChu}»
						</span>
					) : null}
				</li>
			))}
		</ol>
	);
}

export function SheetDienBien({ hinh }: { hinh: HinhDienBien }) {
	const [tab, setTab] = useState("dien-bien");
	const krId = hinh === "moc" ? "c1k3" : "c1k2";
	const tabs: DetailSheetTab[] = [
		{ value: "kr", label: "KR", count: MT_CSKH_1.kr.length, content: null },
		{
			value: "dien-bien",
			label: "Diễn biến",
			content: (
				<DetailSheetBody>
					<DetailSheetSection title="Diễn biến theo tuần">
						<Select defaultValue={krId}>
							<SelectTrigger aria-label="KR" size="sm">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{MT_CSKH_1.kr.map((k) => (
									<SelectItem key={k.id} value={k.id}>
										{k.ten}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{hinh === "chua-co" ? (
							<Empty className="rounded-lg border">
								<EmptyHeader>
									<EmptyTitle>Chưa có lần cập nhật nào</EmptyTitle>
									<EmptyDescription>
										Đường giá trị và mức tự tin hiện ở đây từ lần cập nhật tuần
										đầu tiên, Thứ Hai 09/11.
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						) : hinh === "moc" ? (
							<DongThoiMoc />
						) : (
							<BieuDoKr />
						)}
					</DetailSheetSection>
				</DetailSheetBody>
			),
		},
		{ value: "can-chinh", label: "Căn chỉnh", content: null },
		{ value: "vet", label: "Vết", content: null },
	];

	return (
		<DetailSheet onOpenChange={() => undefined} open>
			<DetailSheetHeader
				description={
					<>
						Mục tiêu · <span translate="no">{MT_CSKH_1.donVi}</span> · {KY.ten}
					</>
				}
				media={
					<span className="flex size-10 items-center justify-center rounded-lg border">
						<Icon icon={Target} />
					</span>
				}
				note={<LoaiMucTieuNhan loai={MT_CSKH_1.loai} />}
				onClose={() => undefined}
				title={<span translate="no">{MT_CSKH_1.ten}</span>}
			/>
			<DetailSheetStats>
				<DetailSheetStat label={`Tiến độ · lẽ ra ${KY.kyVong}%`}>
					<span className="tabular-nums">52%</span>
				</DetailSheetStat>
				<DetailSheetStat label="Tình trạng">
					<TinhTrangKr loai={MT_CSKH_1.loai} phanTram={52} />
				</DetailSheetStat>
				<DetailSheetStat label="Phụ trách">
					<TenNguoi ten={MT_CSKH_1.phuTrach.ten} />
				</DetailSheetStat>
			</DetailSheetStats>
			<DetailSheetTabs onValueChange={setTab} tabs={tabs} value={tab} />
		</DetailSheet>
	);
}
