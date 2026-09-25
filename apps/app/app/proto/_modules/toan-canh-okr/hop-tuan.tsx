"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { KY, NGUOI } from "../ban-mau-okr/du-lieu";
import {
	ChuThichVach,
	DangTai,
	giaTri,
	Loi,
	NHAN_TU_TIN,
	TenNguoi,
	ThanhTienDo,
	TuTin,
	tienDo,
} from "../ban-mau-okr/phan-chung";
import {
	CON_LAI,
	DANG_BAN,
	type DongHopTuan,
	type LyDoBan,
	TUAN_HOP,
} from "./du-lieu";

export type HinhHopTuan =
	| "co-du-lieu"
	| "tab-rieng"
	| "yen-ang"
	| "tuan-dau"
	| "dang-tai"
	| "loi";

function NhanLyDo({ lyDo }: { lyDo: LyDoBan }) {
	switch (lyDo.loai) {
		case "tu-tin-tut":
			return (
				<StatusIndicator
					label={`Tự tin tụt: ${NHAN_TU_TIN[lyDo.tu]} → ${NHAN_TU_TIN[lyDo.xuong]}`}
					size="sm"
					tone="error"
				/>
			);
		case "im":
			return (
				<StatusIndicator
					label={`Im ${lyDo.ngay} ngày`}
					size="sm"
					tone="warning"
				/>
			);
		case "ghi-chu-moi":
			return <StatusIndicator label="Ghi chú mới" size="sm" tone="info" />;
	}
}

const COT = [
	{ id: "kr", header: "KR và vì sao đáng bàn" },
	{
		id: "tien-do",
		header: "Tiến độ",
		width: "w-[26%]",
		className: "hidden md:table-cell",
	},
	{
		id: "ghi-chu",
		header: "Ghi chú mới nhất",
		width: "w-[30%]",
		className: "hidden lg:table-cell",
	},
] satisfies SimpleTableColumn[];

function TienDoDong({ dong }: { dong: DongHopTuan }) {
	const { kr } = dong;
	const laMoc = kr.kieu === "moc";
	return (
		<div className="flex flex-col gap-1.5">
			<ThanhTienDo
				kyVong={laMoc ? null : undefined}
				nhan={kr.ten}
				phanTram={tienDo(kr)}
			/>
			<div className="flex items-center justify-between gap-3 text-muted-foreground text-xs">
				<TuTin muc={kr.tuTin} size="sm" />
				<span className="tabular-nums">
					{giaTri(kr)} / {laMoc ? "mốc" : giaTri(kr, kr.dich)}
				</span>
			</div>
		</div>
	);
}

function GhiChuDong({ dong }: { dong: DongHopTuan }) {
	const { kr, lyDo } = dong;
	const ghiChu =
		lyDo.find((l) => l.loai === "ghi-chu-moi")?.ghiChu ?? kr.ghiChu;
	if (!ghiChu) return <span className="text-muted-foreground">—</span>;
	return (
		<figure className="flex flex-col gap-1">
			<blockquote translate="no">«{ghiChu}»</blockquote>
			<figcaption className="text-muted-foreground text-xs">
				cập nhật {kr.capNhatLuc ?? "—"}
			</figcaption>
		</figure>
	);
}

function DongBan({ dong }: { dong: DongHopTuan }) {
	const { kr, mucTieu, lyDo } = dong;
	return (
		<SimpleTableRow clickable data-kr={kr.id}>
			<TableCell className="px-3 py-3 align-top whitespace-normal">
				<div className="flex flex-col gap-1.5">
					<span className="text-sm" translate="no">
						{kr.ten}
					</span>
					<span className="text-muted-foreground text-xs">
						<span translate="no">{mucTieu.ten}</span> · Phụ trách{" "}
						<TenNguoi avatar={false} ten={kr.phuTrach.ten} />
					</span>
					{lyDo.length > 0 ? (
						<span className="flex flex-wrap gap-x-4 gap-y-1">
							{lyDo.map((l) => (
								<NhanLyDo key={l.loai} lyDo={l} />
							))}
						</span>
					) : null}
					<span className="md:hidden">
						<TienDoDong dong={dong} />
					</span>
				</div>
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top md:table-cell">
				<TienDoDong dong={dong} />
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top text-sm whitespace-normal lg:table-cell">
				<GhiChuDong dong={dong} />
			</TableCell>
		</SimpleTableRow>
	);
}

function BangBan({ dong }: { dong: DongHopTuan[] }) {
	return (
		<SimpleTable columns={COT}>
			{dong.map((d) => (
				<DongBan dong={d} key={d.kr.id} />
			))}
		</SimpleTable>
	);
}

function DauBang({ tabRieng }: { tabRieng: boolean }) {
	return (
		<div className="flex flex-col gap-3">
			{tabRieng ? (
				<Tabs value="hop-tuan">
					<div className="relative -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
						<TabsList
							aria-label="Hướng B — tab riêng"
							className="w-full justify-start gap-6 border-b"
							variant="line"
						>
							<TabsTrigger value="cua-toi">Của tôi</TabsTrigger>
							<TabsTrigger value="cap-nhat">Cập nhật tuần</TabsTrigger>
							<TabsTrigger value="theo-don-vi">Theo đơn vị</TabsTrigger>
							<TabsTrigger value="hop-tuan">Họp tuần</TabsTrigger>
							<TabsTrigger value="toan-canh">Toàn cảnh</TabsTrigger>
						</TabsList>
					</div>
				</Tabs>
			) : null}
			<Card>
				<CardHeader>
					<CardTitle>
						<span translate="no">Chăm sóc khách hàng</span>
					</CardTitle>
					<CardDescription>
						Phòng ban · Trưởng <TenNguoi avatar={false} ten={NGUOI.thao.ten} />{" "}
						· {TUAN_HOP.nhan} · đã cập nhật {TUAN_HOP.daCapNhat}/
						{TUAN_HOP.tongKr} KR
					</CardDescription>
					{tabRieng ? null : (
						<CardAction>
							<ToggleGroup
								aria-label="Cách xem"
								size="sm"
								type="single"
								value="hop-tuan"
								variant="outline"
							>
								<ToggleGroupItem value="danh-sach">Danh sách</ToggleGroupItem>
								<ToggleGroupItem value="cay">Cây căn chỉnh</ToggleGroupItem>
								<ToggleGroupItem value="hop-tuan">Họp tuần</ToggleGroupItem>
							</ToggleGroup>
						</CardAction>
					)}
				</CardHeader>
			</Card>
			<p className="text-muted-foreground text-sm">
				{tabRieng
					? "Hướng B — «Họp tuần» là tab thứ năm; chọn đơn vị lại ở đầu tab."
					: "Hướng A (máy khuyên) — «Họp tuần» là cách xem thứ ba của «Theo đơn vị»: đơn vị đã chọn bên trái, không chọn lại, và bốn tab giữ nguyên như bản mẫu đã duyệt."}
			</p>
		</div>
	);
}

function PhanConLai() {
	return (
		<Collapsible>
			<CollapsibleTrigger asChild>
				<Button className="self-start" size="sm" variant="ghost">
					<Icon icon={ChevronDown} data-icon="inline-start" />
					Còn lại {CON_LAI.length} KR — không có gì mới
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="pt-3">
				<BangBan dong={CON_LAI} />
			</CollapsibleContent>
		</Collapsible>
	);
}

export function HopTuan({ hinh }: { hinh: HinhHopTuan }) {
	if (hinh === "dang-tai") return <DangTai dong={3} />;
	if (hinh === "loi")
		return (
			<Loi cau="Không dựng được bảng họp tuần. OKR của đơn vị vẫn xem được ở cách xem Danh sách." />
		);

	const tabRieng = hinh === "tab-rieng";

	return (
		<div className="flex flex-col gap-6" data-ban-mau="hop-tuan">
			<DauBang tabRieng={tabRieng} />
			{hinh === "tuan-dau" ? (
				<Empty className="rounded-lg border">
					<EmptyHeader>
						<EmptyTitle>Chưa có lần cập nhật nào để bàn</EmptyTitle>
						<EmptyDescription>
							OKR {KY.ten} của phòng ban công bố 02/11. Bảng họp tuần xếp KR
							theo mức tự tin tụt, KR im và ghi chú mới — sau lần cập nhật tuần
							đầu tiên, Thứ Hai 09/11.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : hinh === "yen-ang" ? (
				<>
					<Empty className="rounded-lg border">
						<EmptyHeader>
							<EmptyTitle>Tuần này không KR nào đáng bàn</EmptyTitle>
							<EmptyDescription>
								Không KR nào tụt mức tự tin, không KR nào im quá 14 ngày, không
								có ghi chú mới từ {TUAN_HOP.truoc}.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
					<PhanConLai />
				</>
			) : (
				<section aria-labelledby="dang-ban" className="flex flex-col gap-3">
					<div className="flex flex-wrap items-baseline justify-between gap-2">
						<h3 className="font-medium text-sm" id="dang-ban">
							Đáng bàn tuần này{" "}
							<Badge variant="secondary">{DANG_BAN.length}</Badge>
						</h3>
						<ChuThichVach />
					</div>
					<p className="text-muted-foreground text-xs">
						Xếp theo: tự tin tụt, rồi KR im lâu nhất, rồi ghi chú mới. Mỗi dòng
						là một KR — bảng không liệt kê người chưa cập nhật.
					</p>
					<BangBan dong={DANG_BAN} />
					<PhanConLai />
				</section>
			)}
		</div>
	);
}
