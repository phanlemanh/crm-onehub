"use client";

import { DashboardSection, StatGroup } from "@crm/ui/components/dashboard";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { StatCard } from "@crm/ui/components/stat-card";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crm/ui/components/table";
import { cn } from "@crm/ui/lib/utils";
import { useEffect, useRef } from "react";
import {
	type HangToanCanh,
	KY,
	type MucTuTin,
	TOAN_CANH,
	TUAN_CUA_KY,
} from "./du-lieu";
import {
	ChuThichVach,
	DangTai,
	Loi,
	NHAN_TU_TIN,
	ThanhTienDo,
	TONE_TU_TIN,
} from "./phan-chung";

export type HinhToanCanh = "co-du-lieu" | "tuan-dau" | "dang-tai" | "loi";

const MUC: MucTuTin[] = ["cao", "vua", "thap"];

function PhanBoTuTin({ hang }: { hang: HangToanCanh }) {
	return (
		<span className="flex flex-wrap items-center gap-x-3 gap-y-1">
			{MUC.map((m) => (
				<StatusIndicator
					key={m}
					label={
						<span className="tabular-nums">
							{hang.tuTin[m]} {NHAN_TU_TIN[m].toLowerCase()}
						</span>
					}
					size="sm"
					tone={TONE_TU_TIN[m]}
				/>
			))}
		</span>
	);
}

function TenDonVi({ hang }: { hang: HangToanCanh }) {
	return (
		<span
			className={cn(
				"block truncate",
				hang.cap === "bo-phan" ? "font-medium" : "ps-4 text-muted-foreground",
			)}
			translate="no"
		>
			{hang.ten}
		</span>
	);
}

function BangDonVi() {
	return (
		<>
			<div className="hidden overflow-hidden rounded-lg border md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[22%] ps-4">Đơn vị</TableHead>
							<TableHead className="w-[22%]">Tiến độ</TableHead>
							<TableHead className="w-[22%]">Mức tự tin</TableHead>
							<TableHead className="text-right">Cập nhật tuần này</TableHead>
							<TableHead className="w-[24%] pe-4">Đáng bàn</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{TOAN_CANH.map((h) => (
							<TableRow key={h.id}>
								<TableCell className="ps-4">
									<TenDonVi hang={h} />
								</TableCell>
								<TableCell>
									<span className="flex items-center gap-3">
										<ThanhTienDo nhan={h.ten} phanTram={h.tienDo} />
										<span className="w-9 shrink-0 text-right text-xs tabular-nums">
											{h.tienDo}%
										</span>
									</span>
								</TableCell>
								<TableCell>
									<PhanBoTuTin hang={h} />
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{h.daCapNhat}/{h.tongKr}
								</TableCell>
								<TableCell className="pe-4 text-muted-foreground text-xs">
									{h.dangBan ?? "—"}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<ul className="flex flex-col divide-y rounded-lg border md:hidden">
				{TOAN_CANH.map((h) => (
					<li className="flex flex-col gap-2 px-4 py-3" key={h.id}>
						<div className="flex items-baseline justify-between gap-3">
							<TenDonVi hang={h} />
							<span className="shrink-0 text-muted-foreground text-xs tabular-nums">
								Cập nhật {h.daCapNhat}/{h.tongKr}
							</span>
						</div>
						<span className="flex items-center gap-3">
							<ThanhTienDo nhan={h.ten} phanTram={h.tienDo} />
							<span className="w-9 shrink-0 text-right text-xs tabular-nums">
								{h.tienDo}%
							</span>
						</span>
						<PhanBoTuTin hang={h} />
						{h.dangBan ? (
							<span className="text-muted-foreground text-xs">{h.dangBan}</span>
						) : null}
					</li>
				))}
			</ul>
		</>
	);
}

const BAC_NHIET = [
	{ toi: 0, lop: "bg-muted" },
	{ toi: 25, lop: "bg-foreground/10" },
	{ toi: 50, lop: "bg-foreground/25" },
	{ toi: 75, lop: "bg-foreground/45 text-background" },
	{ toi: 100, lop: "bg-foreground/70 text-background" },
] as const;

function lopNhiet(v: number): string {
	return (BAC_NHIET.find((b) => v <= b.toi) ?? BAC_NHIET[4]).lop;
}

function BanDoNhiet({ trong }: { trong: boolean }) {
	const tuanHienTai = TUAN_CUA_KY.indexOf("30/11");
	const cuon = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = cuon.current;
		const cot = el?.querySelector<HTMLElement>("[data-tuan-hien-tai]");
		if (el && cot && el.scrollWidth > el.clientWidth) {
			el.scrollLeft = cot.offsetLeft + cot.offsetWidth - el.clientWidth + 8;
		}
	}, []);
	return (
		<div className="flex flex-col gap-3">
			<div className="relative overflow-x-auto rounded-lg border" ref={cuon}>
				<table className="w-full border-separate border-spacing-1 p-2 text-xs">
					<caption className="sr-only">
						Tỷ lệ KR có mức tự tin cao, theo đơn vị và tuần của {KY.ten}
					</caption>
					<thead>
						<tr>
							<th
								className="sticky left-0 min-w-36 bg-background px-2 text-left font-medium text-muted-foreground"
								scope="col"
							>
								Đơn vị
							</th>
							{TUAN_CUA_KY.map((t, i) => (
								<th
									className={cn(
										"min-w-11 px-1 text-center font-normal text-muted-foreground tabular-nums",
										i === tuanHienTai && "font-medium text-foreground",
									)}
									data-tuan-hien-tai={i === tuanHienTai ? "" : undefined}
									key={t}
									scope="col"
								>
									{t}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{TOAN_CANH.map((h) => (
							<tr key={h.id}>
								<th
									className="sticky left-0 bg-background px-2 text-left font-normal"
									scope="row"
								>
									<TenDonVi hang={h} />
								</th>
								{h.theoTuan.map((v, i) => {
									const giaTri = trong ? null : v;
									return (
										<td
											className={cn(
												"h-8 rounded-sm text-center tabular-nums",
												giaTri === null
													? "border border-dashed"
													: lopNhiet(giaTri),
											)}
											key={TUAN_CUA_KY[i]}
										>
											{giaTri === null ? (
												<span className="sr-only">chưa có</span>
											) : (
												`${giaTri}%`
											)}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-xs">
				<span>Ô càng nổi khỏi nền, càng nhiều KR tự tin cao.</span>
				<span className="flex items-center gap-1" aria-hidden="true">
					{BAC_NHIET.map((b) => (
						<span className={cn("size-3 rounded-sm", b.lop)} key={b.toi} />
					))}
				</span>
				<span className="flex items-center gap-1">
					<span
						aria-hidden="true"
						className="size-3 rounded-sm border border-dashed"
					/>
					tuần chưa tới hoặc chưa ai cập nhật
				</span>
			</div>
		</div>
	);
}

export function ToanCanh({ hinh }: { hinh: HinhToanCanh }) {
	if (hinh === "dang-tai") return <DangTai dong={2} />;
	if (hinh === "loi")
		return (
			<Loi cau="Không dựng được toàn cảnh. Số của từng đơn vị vẫn xem được ở Theo đơn vị." />
		);

	const tuanDau = hinh === "tuan-dau";

	return (
		<>
			<StatGroup className="rounded-lg">
				<StatCard
					description={
						tuanDau
							? "Chưa có lần cập nhật nào sau ngày công bố"
							: `Lẽ ra đã tới ${KY.kyVong}% vào ${KY.homNay}`
					}
					label="Tiến độ trung bình"
					value={tuanDau ? "—" : "46%"}
				/>
				<StatCard
					description={
						tuanDau ? "Hạn đầu tiên: Thứ Hai 09/11" : "Hạn hết hôm nay"
					}
					label="KR đã cập nhật tuần này"
					value={tuanDau ? "0/43" : "34/43"}
				/>
				<StatCard
					description={tuanDau ? "—" : "Tuần trước: 3"}
					label="KR tự tin thấp"
					value={tuanDau ? "—" : "5"}
				/>
				<StatCard
					description="Tài chính, Kho vận, Pháp chế chưa đặt"
					label="Đơn vị đã công bố OKR"
					value="7/10"
				/>
			</StatGroup>

			{tuanDau ? (
				<Empty className="rounded-lg border">
					<EmptyHeader>
						<EmptyTitle>Chưa có số để so</EmptyTitle>
						<EmptyDescription>
							OKR {KY.ten} công bố 02/11. Tiến độ và mức tự tin hiện ở đây sau
							lần cập nhật tuần đầu tiên, Thứ Hai 09/11.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<DashboardSection
					action={<ChuThichVach />}
					description="Bộ phận in đậm và gộp số của các phòng ban thụt vào bên dưới."
					title="Theo đơn vị"
				>
					<BangDonVi />
				</DashboardSection>
			)}

			<DashboardSection
				description="Tỷ lệ KR có mức tự tin cao ở mỗi lần cập nhật tuần. Một hàng nhạt dần là đơn vị đang mất tự tin."
				title="Mức tự tin theo tuần"
			>
				<BanDoNhiet trong={tuanDau} />
			</DashboardSection>
		</>
	);
}
