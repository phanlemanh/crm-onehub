"use client";

import Renew from "@carbon/icons-react/es/Renew";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
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
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Heatmap } from "@crm/ui/components/heatmap";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StepList, StepListItem } from "@crm/ui/components/step-list";
import { type ReactNode, useState } from "react";
import {
	BO_SUNG_KHI_DU,
	type ChuDeMau,
	type HangDoPhu,
	HOI_Y,
	type KetLuan,
	NGAY_DO_PHU,
	NHAN_KET_LUAN,
	SO_LIEU,
} from "./du-lieu";

export type NhanCau = "giu-nguyen" | "doi" | "bo";

export const NHAN_CAU = {
	"giu-nguyen": "Giữ nguyên",
	doi: "Đổi",
	bo: "Bỏ",
} satisfies Record<NhanCau, string>;

export function apBoSung(c: ChuDeMau): ChuDeMau {
	const bu = BO_SUNG_KHI_DU.find((b) => b.chuDeId === c.id);
	if (!bu) return c;
	return {
		...c,
		lyDo: bu.lyDo ?? c.lyDo,
		noiBanTruoc: bu.noiBanTruoc ?? c.noiBanTruoc,
	};
}

function chuan(chu: string): string {
	return chu.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
}

export type DanhGiaCau = { nhan: NhanCau; noi: ChuDeMau | null };

export function danhGiaCau(
	so: number,
	cau: string,
	chuDe: ChuDeMau[],
): DanhGiaCau {
	const noi =
		chuDe.find((c) => c.ketLuan === "chon" && c.noiBanTruoc === so) ?? null;
	if (!noi) return { nhan: "bo", noi };
	return {
		nhan: chuan(noi.cauMucTieu) === chuan(cau) ? "giu-nguyen" : "doi",
		noi,
	};
}

export type Pha = "dang-mo" | "dang-gom" | "da-cong-bo";

const BUOC_PHA: { pha: Pha; ten: string }[] = [
	{ pha: "dang-mo", ten: "Đang mở" },
	{ pha: "dang-gom", ten: "Đang gom" },
	{ pha: "da-cong-bo", ten: "Đã công bố" },
];

const DONG_PHA = {
	"dang-mo": `Hạn ${HOI_Y.han} · ${HOI_Y.conLai}`,
	"dang-gom": `Đã hết hạn ${HOI_Y.han} · ${HOI_Y.daGop}/${HOI_Y.thanhVien} người đã góp`,
	"da-cong-bo": `Công bố ${HOI_Y.congBoLuc}`,
} satisfies Record<Pha, string>;

export function DaiPha({ pha }: { pha: Pha }) {
	return (
		<div className="flex flex-col gap-2" data-khoi="dai-pha" data-pha={pha}>
			<StepList label="Pha của lần hỏi ý" tinh>
				{BUOC_PHA.map((b, i) => (
					<StepListItem
						key={b.pha}
						step={i + 1}
						title={
							b.pha === pha ? (
								<span className="flex items-center gap-2" data-buoc-hien-tai>
									{b.ten}
									<Badge variant="secondary">Bây giờ</Badge>
								</span>
							) : (
								b.ten
							)
						}
					/>
				))}
			</StepList>
			<ItemDescription data-dong-pha>
				{DONG_PHA[pha]} · Người chọn:{" "}
				<span translate="no">{HOI_Y.nguoiChon.ten}</span>
			</ItemDescription>
		</div>
	);
}

export function VanBan({ children }: { children: ReactNode }) {
	return (
		<p className="text-sm" translate="no">
			{children}
		</p>
	);
}

export function LoiNguoiNoi({
	nguoi,
	vai,
	loi,
}: {
	nguoi: string;
	vai: string;
	loi: string;
}) {
	return (
		<Item data-khoi="loi-nguoi-noi" size="sm" variant="muted">
			<ItemContent>
				<ItemDescription>
					<span translate="no">{nguoi}</span> · {vai}
				</ItemDescription>
				<VanBan>«{loi}»</VanBan>
			</ItemContent>
		</Item>
	);
}

export function LoiMo() {
	const [mo, setMo] = useState(false);
	return (
		<Card data-khoi="loi-mo">
			<CardContent>
				<Collapsible onOpenChange={setMo} open={mo}>
					{mo ? null : (
						<p className="line-clamp-3 text-sm" translate="no">
							{HOI_Y.loiMo}
						</p>
					)}
					<CollapsibleContent>
						<div className="flex flex-col gap-3">
							<VanBan>{HOI_Y.loiMo}</VanBan>
							<ItemGroup data-khoi="ghi-chu-con-so">
								{SO_LIEU.map((s) => (
									<Item key={s.id} size="xs">
										<ItemContent>
											<ItemDescription>
												<span translate="no">{s.nhan}</span> —{" "}
												<span translate="no">{s.ghiChu}</span>
											</ItemDescription>
										</ItemContent>
									</Item>
								))}
							</ItemGroup>
						</div>
					</CollapsibleContent>
					<div className="flex flex-wrap items-center gap-x-2">
						<ItemDescription>
							Lời mở của <span translate="no">{HOI_Y.nguoiChon.ten}</span>
						</ItemDescription>
						<CollapsibleTrigger asChild>
							<Button size="xs" variant="link">
								{mo ? "Thu gọn" : "Đọc thêm"}
							</Button>
						</CollapsibleTrigger>
					</div>
				</Collapsible>
				<div
					className="grid grid-cols-2 gap-2 lg:grid-cols-4"
					data-khoi="the-con-so"
				>
					{SO_LIEU.map((s) => (
						<Item key={s.id} size="xs" variant="outline">
							<ItemContent>
								<ItemDescription translate="no">{s.nhan}</ItemDescription>
								<ItemTitle className="tabular-nums" translate="no">
									{s.giaTri}
								</ItemTitle>
							</ItemContent>
						</Item>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function CauHoi({ ghiChu }: { ghiChu: string }) {
	return (
		<CardHeader data-khoi="cau-hoi">
			<CardTitle translate="no">{HOI_Y.cauHoi}</CardTitle>
			<CardDescription>{ghiChu}</CardDescription>
		</CardHeader>
	);
}

export function DoPhu({ hang }: { hang: HangDoPhu[] }) {
	return (
		<Card data-khoi="do-phu">
			<CardHeader>
				<CardTitle>Độ phủ theo đơn vị</CardTitle>
				<CardDescription>
					Phần trăm người trong mỗi đơn vị đã góp ít nhất một ý, tính tới hết
					ngày. Đích là 100%. Không màn nào liệt tên người chưa góp.
				</CardDescription>
			</CardHeader>
			<Heatmap
				caption="Độ phủ góp ý theo đơn vị và ngày"
				columns={NGAY_DO_PHU.map((n, i) => ({
					id: n.id,
					label: n.nhan,
					current: i === 0 && hang[0]?.theoNgay[1] === null,
				}))}
				rows={hang.map((h) => ({
					id: h.id,
					label: <span translate="no">{h.ten}</span>,
					indent: h.cap === "phong-ban",
				}))}
				values={hang.map((h) => h.theoNgay)}
			/>
		</Card>
	);
}

export function NhanKetLuan({ ketLuan }: { ketLuan: KetLuan }) {
	return (
		<Badge
			data-ket-luan={ketLuan}
			variant={ketLuan === "chon" ? "secondary" : "outline"}
		>
			{NHAN_KET_LUAN[ketLuan]}
		</Badge>
	);
}

const KHUNG_TAI = ["mot", "hai", "ba"] as const;

export function DangTaiHoiY() {
	return (
		<div aria-busy="true" className="flex flex-col gap-6" data-khoi="dang-tai">
			<span className="sr-only">Đang tải lần hỏi ý…</span>
			<Card>
				<CardHeader>
					<Skeleton className="h-5 w-2/3" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-4/5" />
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{["a", "b", "c", "d"].map((k) => (
							<Skeleton className="h-20" key={k} />
						))}
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<Skeleton className="h-5 w-3/4" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-8 w-24" />
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<Skeleton className="h-5 w-40" />
				</CardHeader>
				<CardContent>
					{KHUNG_TAI.map((k) => (
						<div className="flex flex-col gap-2" key={k}>
							<Skeleton className="h-4 w-5/6" />
							<Skeleton className="h-3 w-1/2" />
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}

export function LoiHoiY() {
	return (
		<Empty className="border" data-khoi="loi">
			<EmptyHeader>
				<EmptyTitle>Không tải được lần hỏi ý</EmptyTitle>
				<EmptyDescription>
					Máy chủ không trả lời. Ý bạn đã gửi trước đó vẫn còn.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button size="sm" variant="outline">
					<Icon data-icon="inline-start" icon={Renew} />
					Thử lại
				</Button>
			</EmptyContent>
		</Empty>
	);
}

export function TrongHoiY({
	quanTri,
	onMo,
}: {
	quanTri: boolean;
	onMo?: () => void;
}) {
	return (
		<Empty className="border" data-khoi={quanTri ? "trong-quan-tri" : "trong"}>
			<EmptyHeader>
				<EmptyTitle>
					{quanTri
						? "Chưa hỏi ý cho kỳ này"
						: "Chưa có lần hỏi ý nào cho kỳ này"}
				</EmptyTitle>
				<EmptyDescription>
					{quanTri
						? `Hỏi cả công ty một câu trước khi đặt mục tiêu ${HOI_Y.chuKy}. Chu kỳ đang ở pha «${HOI_Y.pha}».`
						: "Khi quản trị mở, bạn nhận nhắc buổi sáng và góp ý ở đây."}
				</EmptyDescription>
			</EmptyHeader>
			{quanTri ? (
				<EmptyContent>
					<Button onClick={onMo}>Mở hỏi ý</Button>
				</EmptyContent>
			) : null}
		</Empty>
	);
}
