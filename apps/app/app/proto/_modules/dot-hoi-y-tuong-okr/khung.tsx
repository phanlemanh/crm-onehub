"use client";

import CheckmarkFilled from "@carbon/icons-react/es/CheckmarkFilled";
import RadioButton from "@carbon/icons-react/es/RadioButton";
import RadioButtonChecked from "@carbon/icons-react/es/RadioButtonChecked";
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
import { StatGroup } from "@crm/ui/components/dashboard";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Heatmap } from "@crm/ui/components/heatmap";
import { type CarbonIcon, Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
} from "@crm/ui/components/item";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatCard } from "@crm/ui/components/stat-card";
import { type ReactNode, useState } from "react";
import {
	BO_SUNG_KHI_DU,
	CHENH_LECH_SO_LIEU,
	type ChuDeMau,
	type HangDoPhu,
	HOI_Y,
	type KetLuan,
	MOC_HOI_Y,
	type MocHoiY,
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

type TinhTrangMoc = "qua" | "hien-tai" | "chua";

const MOC_HIEN_TAI = {
	"dang-mo": "mo",
	"dang-gom": "gom",
	"da-cong-bo": "cong-bo",
} satisfies Record<Pha, MocHoiY["id"]>;

const DONG_PHA = {
	"dang-mo": `${HOI_Y.conLai} tới hạn`,
	"dang-gom": `${HOI_Y.daGop}/${HOI_Y.thanhVien} người đã góp`,
	"da-cong-bo": `Công bố ${HOI_Y.congBoLuc}`,
} satisfies Record<Pha, string>;

const NHAN_TINH_TRANG_MOC = {
	qua: "đã qua",
	"hien-tai": "đang ở đây",
	chua: "chưa tới",
} satisfies Record<TinhTrangMoc, string>;

function tinhTrangMoc(pha: Pha, i: number): TinhTrangMoc {
	const hienTai = MOC_HOI_Y.findIndex((m) => m.id === MOC_HIEN_TAI[pha]);
	if (i < hienTai) return "qua";
	return i === hienTai ? "hien-tai" : "chua";
}

const ICON_MOC = {
	qua: CheckmarkFilled,
	"hien-tai": RadioButtonChecked,
	chua: RadioButton,
} satisfies Record<TinhTrangMoc, CarbonIcon>;

export function DaiPha({ pha }: { pha: Pha }) {
	return (
		<div className="flex flex-col gap-2" data-khoi="dai-pha" data-pha={pha}>
			<div className="overflow-x-auto" data-khung-moc>
				<ol aria-label="Các mốc của lần hỏi ý" className="flex min-w-max">
					{MOC_HOI_Y.map((m, i) => {
						const tt = tinhTrangMoc(pha, i);
						const cuoi = i === MOC_HOI_Y.length - 1;
						return (
							<li
								aria-current={tt === "hien-tai" ? "step" : undefined}
								className={
									tt === "chua"
										? "flex min-w-0 flex-1 flex-col gap-1 pe-2 text-muted-foreground"
										: "flex min-w-0 flex-1 flex-col gap-1 pe-2"
								}
								data-moc={m.id}
								data-tinh-trang={tt}
								key={m.id}
							>
								<span className="text-muted-foreground text-xs tabular-nums">
									{m.luc}
								</span>
								<span className="flex items-center gap-1">
									<Icon icon={ICON_MOC[tt]} />
									{tt === "hien-tai" ? (
										<Badge variant="secondary">Bây giờ</Badge>
									) : null}
									{cuoi ? null : (
										<span
											aria-hidden="true"
											className={
												tt === "qua"
													? "flex-1 border-foreground border-t"
													: "flex-1 border-border border-t border-dashed"
											}
										/>
									)}
								</span>
								<span className="text-sm">
									{m.ten}
									<span className="sr-only">, {NHAN_TINH_TRANG_MOC[tt]}</span>
								</span>
							</li>
						);
					})}
				</ol>
			</div>
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
		<div className="flex flex-col gap-3" data-khoi="loi-mo">
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
			<StatGroup data-khoi="the-con-so">
				{SO_LIEU.map((s) => {
					const chenh = CHENH_LECH_SO_LIEU.find((c) => c.soLieuId === s.id);
					return (
						<StatCard
							delta={
								chenh
									? { value: chenh.giaTri, direction: chenh.huong }
									: undefined
							}
							key={s.id}
							label={<span translate="no">{s.nhan}</span>}
							value={<span translate="no">{s.giaTri}</span>}
						/>
					);
				})}
			</StatGroup>
		</div>
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
