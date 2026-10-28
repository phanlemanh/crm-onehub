"use client";

import ChevronLeft from "@carbon/icons-react/es/ChevronLeft";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { Progress } from "@crm/ui/components/progress";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type KrCanCapNhat, NGUOI, type TuTin } from "./du-lieu";

type LanCapNhat = { ngay: string; so: string; tuTin: TuTin; ghiChu: string };

const LICH_SU: [LanCapNhat, ...LanCapNhat[]] = [
	{
		ngay: "16/10, 09:30",
		so: "4 hợp đồng",
		tuTin: "thap",
		ghiChu:
			"Hai đối tác lớn lùi lịch ký sang tháng 11, chờ pháp chế duyệt mẫu mới",
	},
	{
		ngay: "09/10, 10:05",
		so: "3 hợp đồng",
		tuTin: "vua",
		ghiChu: "Ký thêm một đối tác ở Hải Phòng",
	},
];

const GOI_Y = [
	"Điều ghi lần trước đã xong chưa?",
	"Đang vướng gì, cần ai giúp?",
	"Tuần tới làm gì?",
];

export function NganKr({
	kr,
	viTri,
	tong,
	dongVe,
	capNhat,
}: {
	kr: KrCanCapNhat;
	viTri: number;
	tong: number;
	dongVe: string;
	capNhat: string;
}) {
	const router = useRouter();
	return (
		<Sheet open onOpenChange={(mo) => (mo ? null : router.push(dongVe))}>
			<SheetContent data-ngan-kr={kr.id} side="right">
				<SheetHeader>
					<SheetTitle translate="no">{kr.tieuDe}</SheetTitle>
					<SheetDescription>
						<span translate="no">{kr.mucTieu}</span> · Phụ trách{" "}
						<span translate="no">{NGUOI}</span>
					</SheetDescription>
					<div className="flex items-center gap-2 pt-2">
						<Button asChild data-nut="cap-nhat-ngan-kr" size="sm">
							<Link href={capNhat}>Cập nhật</Link>
						</Button>
						<span className="ms-auto flex items-center gap-1 text-muted-foreground text-xs tabular-nums">
							<Button
								aria-label="KR trước"
								disabled={viTri === 1}
								size="icon"
								variant="ghost"
							>
								<Icon icon={ChevronLeft} />
							</Button>
							{viTri}/{tong}
							<Button aria-label="KR kế" size="icon" variant="ghost">
								<Icon icon={ChevronRight} />
							</Button>
						</span>
					</div>
				</SheetHeader>
				<SheetBody className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<div className="flex items-baseline justify-between">
							<span className="font-medium text-2xl tabular-nums">
								{kr.hienTai}
							</span>
							<span className="text-muted-foreground text-xs">
								đích 12 · lẽ ra đã tới 42%
							</span>
						</div>
						<Progress value={33} />
						{kr.tuTin ? (
							<ConfidenceIndicator level={kr.tuTin} size="sm" />
						) : null}
					</div>
					<div className="flex flex-col gap-2">
						<p className="font-medium text-sm">Các lần cập nhật</p>
						<ItemGroup className="gap-2">
							{LICH_SU.map((lan) => (
								<Item key={lan.ngay} variant="outline">
									<ItemContent>
										<ItemTitle>
											{lan.so} · {lan.ngay}
										</ItemTitle>
										<ItemDescription className="line-clamp-none">
											<span translate="no">{lan.ghiChu}</span>
										</ItemDescription>
									</ItemContent>
									<ConfidenceIndicator level={lan.tuTin} size="sm" />
								</Item>
							))}
						</ItemGroup>
					</div>
				</SheetBody>
			</SheetContent>
		</Sheet>
	);
}

export function NganKrKhongThay({ dongVe }: { dongVe: string }) {
	const router = useRouter();
	return (
		<Sheet open onOpenChange={(mo) => (mo ? null : router.push(dongVe))}>
			<SheetContent data-ngan-kr="khong-thay" side="right">
				<SheetHeader>
					<SheetTitle>KR</SheetTitle>
					<SheetDescription>Mở từ tin nhắc ngày 26/10</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Icon icon={WarningAlt} />
							</EmptyMedia>
							<EmptyTitle>Không thấy KR này</EmptyTitle>
							<EmptyDescription>
								KR đã bị xoá, đã lưu trữ, hoặc bạn không còn quyền xem bộ OKR
								chứa nó.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</SheetBody>
			</SheetContent>
		</Sheet>
	);
}

export function HopCapNhat({
	kr,
	dongVe,
}: {
	kr: KrCanCapNhat;
	dongVe: string;
}) {
	const router = useRouter();
	const truoc = LICH_SU[0];
	return (
		<Dialog open onOpenChange={(mo) => (mo ? null : router.push(dongVe))}>
			<DialogContent data-hop-cap-nhat-kr={kr.id}>
				<DialogHeader>
					<DialogTitle>Cập nhật KR</DialogTitle>
					<DialogDescription translate="no">{kr.tieuDe}</DialogDescription>
				</DialogHeader>
				<Item data-lan-truoc="" variant="muted">
					<ItemContent>
						<ItemTitle>Lần cập nhật trước · {truoc.ngay}</ItemTitle>
						<ItemDescription className="line-clamp-none">
							{truoc.so} · <span translate="no">«{truoc.ghiChu}»</span>
						</ItemDescription>
					</ItemContent>
					<ConfidenceIndicator level={truoc.tuTin} size="sm" />
				</Item>
				<Field>
					<FieldLabel htmlFor="ctlk-gia-tri">Giá trị</FieldLabel>
					<Input defaultValue="4" id="ctlk-gia-tri" inputMode="decimal" />
					<FieldDescription>Hiện tại {kr.hienTai} · đích 12</FieldDescription>
				</Field>
				<Field>
					<FieldLabel>Mức tự tin</FieldLabel>
					<ToggleGroup size="sm" type="single" variant="outline">
						<ToggleGroupItem value="cao">Cao</ToggleGroupItem>
						<ToggleGroupItem value="vua">Vừa</ToggleGroupItem>
						<ToggleGroupItem value="thap">Thấp</ToggleGroupItem>
					</ToggleGroup>
				</Field>
				<Field>
					<FieldLabel htmlFor="ctlk-ghi-chu">Ghi chú</FieldLabel>
					<Input
						id="ctlk-ghi-chu"
						maxLength={200}
						placeholder="Một dòng: điều gì đổi, cần ai giúp"
					/>
					<FieldDescription>{GOI_Y.join(" · ")}</FieldDescription>
				</Field>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button asChild>
						<Link href={dongVe}>Gửi cập nhật</Link>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
