"use client";

import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import ChevronLeft from "@carbon/icons-react/es/ChevronLeft";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import Renew from "@carbon/icons-react/es/Renew";
import ThumbsDown from "@carbon/icons-react/es/ThumbsDown";
import ThumbsUp from "@carbon/icons-react/es/ThumbsUp";
import Warning from "@carbon/icons-react/es/Warning";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import { Shimmer } from "@crm/ui/components/shimmer";
import { Skeleton } from "@crm/ui/components/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useState } from "react";
import { CAU, type CauMau, PHONG } from "./du-lieu";

export type HinhKhoi =
	| "co-cau"
	| "trich-dan"
	| "dang-soan"
	| "chua-cap-nhat"
	| "loc-het"
	| "da-phan-hoi"
	| "loi"
	| "dang-tai";

const TIEU_DE = "Tóm tắt tuần của Trợ lý OKR";

function TheTrichDan({
	cau,
	thuTu,
	moSan,
}: {
	cau: CauMau;
	thuTu: number;
	moSan: boolean;
}) {
	const [trang, setTrang] = useState(0);
	const tong = cau.nguon.length;
	const n = cau.nguon[trang] ?? cau.nguon[0];
	const dau = cau.nguon[0];
	if (!n || !dau) return null;
	return (
		<Popover defaultOpen={moSan}>
			<PopoverTrigger asChild>
				<Button
					aria-label={`Nguồn của câu ${thuTu}: ${tong} lần cập nhật, mới nhất ${dau.ngay}`}
					data-trich-dan={cau.id}
					size="xs"
					variant="outline"
				>
					Cập nhật {dau.ngay}
					{tong > 1 ? ` +${tong - 1}` : ""}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				collisionPadding={16}
				data-the-trich-dan={cau.id}
			>
				<PopoverHeader>
					<PopoverTitle translate="no">{n.kr}</PopoverTitle>
					<PopoverDescription translate="no">{n.mucTieu}</PopoverDescription>
				</PopoverHeader>
				<dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5">
					<dt className="text-muted-foreground">Cập nhật</dt>
					<dd className="tabular-nums">{n.ngay}</dd>
					<dt className="text-muted-foreground">Giá trị</dt>
					<dd className="tabular-nums">
						{n.giaTri}{" "}
						<span className="text-muted-foreground">(trước đó {n.truoc})</span>
					</dd>
					<dt className="text-muted-foreground">Mức tự tin</dt>
					<dd>
						<ConfidenceIndicator level={n.tuTin} size="sm" />
					</dd>
				</dl>
				{n.ghiChu ? (
					<figure className="flex flex-col gap-0.5">
						<figcaption className="text-muted-foreground">Ghi chú</figcaption>
						<blockquote translate="no">«{n.ghiChu}»</blockquote>
					</figure>
				) : null}
				<div className="flex items-center justify-between gap-2 border-t pt-2">
					{tong > 1 ? (
						<div className="flex items-center gap-1">
							<Button
								aria-label="Nguồn trước"
								disabled={trang === 0}
								onClick={() => setTrang(trang - 1)}
								size="icon-xs"
								variant="ghost"
							>
								<Icon icon={ChevronLeft} />
							</Button>
							<span aria-live="polite" className="tabular-nums">
								{trang + 1}/{tong}
							</span>
							<Button
								aria-label="Nguồn sau"
								disabled={trang === tong - 1}
								onClick={() => setTrang(trang + 1)}
								size="icon-xs"
								variant="ghost"
							>
								<Icon icon={ChevronRight} />
							</Button>
						</div>
					) : (
						<span />
					)}
					<Button size="xs" variant="ghost">
						Xem diễn biến KR
						<Icon icon={ArrowRight} data-icon="inline-end" />
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function PhanHoi({ daChon }: { daChon: boolean }) {
	const [chon, setChon] = useState(daChon ? "huu-ich" : "");
	return (
		<div className="flex flex-wrap items-center gap-3" data-phan-hoi={chon}>
			<ToggleGroup
				aria-label="Tóm tắt tuần này có hữu ích không"
				onValueChange={(v) => {
					if (v) setChon(v);
				}}
				size="sm"
				type="single"
				value={chon}
				variant="outline"
			>
				<ToggleGroupItem value="huu-ich">
					<Icon icon={ThumbsUp} data-icon="inline-start" />
					Hữu ích
				</ToggleGroupItem>
				<ToggleGroupItem value="khong-huu-ich">
					<Icon icon={ThumbsDown} data-icon="inline-start" />
					Không hữu ích
				</ToggleGroupItem>
			</ToggleGroup>
			<p className="text-muted-foreground text-xs" role="status">
				{chon ? "Cảm ơn, đã ghi" : ""}
			</p>
		</div>
	);
}

function DanhSachCau({ moCau }: { moCau: string | null }) {
	return (
		<ol className="flex max-w-3xl flex-col gap-2.5 text-sm">
			{CAU.map((c, i) => (
				<li className="text-pretty" data-cau={c.id} key={c.id}>
					<span translate="no">{c.van}</span>{" "}
					<TheTrichDan cau={c} moSan={c.id === moCau} thuTu={i + 1} />
				</li>
			))}
		</ol>
	);
}

function DongNguon() {
	return (
		<p className="text-muted-foreground text-xs">
			Trợ lý OKR tóm tắt từ {PHONG.soCapNhat} lần cập nhật · tuần {PHONG.tuan}
		</p>
	);
}

function NoiDung({ hinh }: { hinh: HinhKhoi }) {
	switch (hinh) {
		case "dang-tai":
			return (
				<CardContent aria-busy="true" data-trang-thai="ST-tomtat-dang-tai">
					<span className="sr-only">Đang tải tóm tắt tuần…</span>
					<Skeleton className="h-3 w-1/3" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
					<Skeleton className="h-4 w-2/3" />
				</CardContent>
			);
		case "dang-soan":
			return (
				<CardContent aria-busy="true" data-trang-thai="ST-tomtat-dang-soan">
					<p aria-live="polite" className="text-sm">
						<Shimmer>Trợ lý OKR đang tóm tắt tuần này…</Shimmer>
					</p>
					<p className="text-muted-foreground text-xs">
						Thường xong trong vài phút. Khối tự hiện khi có câu, không cần tải
						lại.
					</p>
				</CardContent>
			);
		case "chua-cap-nhat":
			return (
				<CardContent data-trang-thai="ST-tomtat-chua-cap-nhat">
					<Empty>
						<EmptyHeader>
							<EmptyTitle>Tuần này chưa có Cập nhật tuần nào</EmptyTitle>
							<EmptyDescription>
								Trợ lý OKR tóm tắt sáng hôm sau ngày cập nhật, khi phòng có ít
								nhất một lần Cập nhật tuần.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</CardContent>
			);
		case "loc-het":
			return (
				<CardContent data-trang-thai="ST-tomtat-loc-het">
					<Empty>
						<EmptyHeader>
							<EmptyTitle>
								Không có câu nào bạn xem được trong tóm tắt tuần này
							</EmptyTitle>
							<EmptyDescription>
								Mọi câu đều dựa vào Mục tiêu bạn không xem được. Bảng đáng bàn
								bên dưới vẫn đủ các KR bạn xem được.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</CardContent>
			);
		default: {
			const daPhanHoi = hinh === "da-phan-hoi";
			return (
				<CardContent
					data-trang-thai={
						daPhanHoi
							? "ST-tomtat-da-phan-hoi"
							: hinh === "trich-dan"
								? "ST-tomtat-trich-dan"
								: "ST-tomtat-co-cau"
					}
				>
					<DongNguon />
					<DanhSachCau moCau={hinh === "trich-dan" ? "c2" : null} />
					<PhanHoi daChon={daPhanHoi} />
				</CardContent>
			);
		}
	}
}

export function KhoiTomTat({ hinh }: { hinh: HinhKhoi }) {
	if (hinh === "loi") {
		return (
			<section aria-label={TIEU_DE} data-trang-thai="ST-tomtat-loi">
				<Alert>
					<Icon icon={Warning} />
					<AlertTitle>Không tải được tóm tắt tuần</AlertTitle>
					<AlertDescription>
						Bảng đáng bàn bên dưới vẫn dùng được.
					</AlertDescription>
					<AlertAction>
						<Button size="xs" variant="outline">
							<Icon icon={Renew} data-icon="inline-start" />
							Thử lại
						</Button>
					</AlertAction>
				</Alert>
			</section>
		);
	}
	return (
		<Card aria-labelledby="tieu-de-tom-tat" data-khoi="tom-tat" role="region">
			<CardHeader>
				<CardTitle id="tieu-de-tom-tat">{TIEU_DE}</CardTitle>
			</CardHeader>
			<NoiDung hinh={hinh} />
		</Card>
	);
}
