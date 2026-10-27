"use client";

import ChevronLeft from "@carbon/icons-react/es/ChevronLeft";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
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
import { DANG_BAN, type TuTin } from "./du-lieu";

const KR = DANG_BAN[0];

type LanCapNhatMau = { ngay: string; so: string; tuTin: TuTin; ghiChu: string };

const LICH_SU: [LanCapNhatMau, ...LanCapNhatMau[]] = [
	{
		ngay: "16/10, 09:30",
		so: "4 hợp đồng",
		tuTin: "thap",
		ghiChu: KR.ghiChu ?? "",
	},
	{
		ngay: "09/10, 10:05",
		so: "3 hợp đồng",
		tuTin: "vua",
		ghiChu: "Ký thêm một đối tác ở Hải Phòng",
	},
	{
		ngay: "02/10, 08:50",
		so: "2 hợp đồng",
		tuTin: "vua",
		ghiChu: "Hai đối tác cũ gia hạn",
	},
];

const GOI_Y = [
	"Điều ghi lần trước đã xong chưa?",
	"Đang vướng gì, cần ai giúp?",
	"Tuần tới làm gì?",
];

export function NganKrMau({
	dongVe,
	capNhat,
}: {
	dongVe: string;
	capNhat: string;
}) {
	const router = useRouter();
	return (
		<Sheet open onOpenChange={(mo) => (mo ? null : router.push(dongVe))}>
			<SheetContent data-ngan-kr="" side="right">
				<SheetHeader>
					<SheetTitle translate="no">{KR.tieuDe}</SheetTitle>
					<SheetDescription>
						<span translate="no">{KR.mucTieu}</span> · Phụ trách {KR.chuTen}
					</SheetDescription>
					<div className="flex items-center gap-2 pt-2">
						<Button asChild data-nut="cap-nhat-ngan-kr" size="sm">
							<Link href={capNhat}>Cập nhật</Link>
						</Button>
						<span className="ms-auto flex items-center gap-1 text-muted-foreground text-xs tabular-nums">
							<Button
								aria-label="KR trước"
								disabled
								size="icon"
								variant="ghost"
							>
								<Icon icon={ChevronLeft} />
							</Button>
							1/5
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
								4 hợp đồng
							</span>
							<span className="text-muted-foreground text-xs">
								đích 12 · lẽ ra đã tới 42%
							</span>
						</div>
						<Progress value={KR.tienDo} />
						<ConfidenceIndicator level="thap" size="sm" />
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

export function HopCapNhatMau({ dongVe }: { dongVe: string }) {
	const router = useRouter();
	const truoc = LICH_SU[0];
	return (
		<Dialog open onOpenChange={(mo) => (mo ? null : router.push(dongVe))}>
			<DialogContent data-hop-cap-nhat-kr="">
				<DialogHeader>
					<DialogTitle>Cập nhật KR</DialogTitle>
					<DialogDescription translate="no">{KR.tieuDe}</DialogDescription>
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
					<FieldLabel htmlFor="htmb-gia-tri">Giá trị</FieldLabel>
					<Input defaultValue="4" id="htmb-gia-tri" inputMode="decimal" />
					<FieldDescription>Hiện tại 4 hợp đồng · đích 12</FieldDescription>
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
					<FieldLabel htmlFor="htmb-ghi-chu">Ghi chú</FieldLabel>
					<Input
						id="htmb-ghi-chu"
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
