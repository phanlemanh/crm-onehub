"use client";

import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import { Badge } from "@crm/ui/components/badge";
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
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KrMau, MucTieuMau } from "./du-lieu";

const COT_KR: SimpleTableColumn[] = [
	{ id: "kr", header: "KR" },
	{ id: "hien-tai", header: "Hiện tại", className: "hidden md:table-cell" },
	{ id: "tu-tin", header: "Tự tin" },
];

export function NganMucTieuMau({
	mucTieu,
	dongVe,
	moKr,
	ghiChu,
}: {
	mucTieu: MucTieuMau;
	dongVe: string;
	moKr: (kr: KrMau) => string | null;
	ghiChu?: string;
}) {
	const router = useRouter();
	return (
		<Sheet open onOpenChange={(mo) => (mo ? null : router.push(dongVe))}>
			<SheetContent data-ngan-muc-tieu={mucTieu.id} side="right">
				<SheetHeader>
					<SheetTitle translate="no">{mucTieu.tieuDe}</SheetTitle>
					<SheetDescription>
						<span translate="no">{mucTieu.donVi}</span> · Phụ trách{" "}
						<span translate="no">{mucTieu.chuTen}</span>
					</SheetDescription>
				</SheetHeader>
				<SheetBody className="flex flex-col gap-4">
					{ghiChu ? (
						<p className="text-muted-foreground text-xs" data-ghi-chu-mau="">
							{ghiChu}
						</p>
					) : null}
					<div className="flex flex-col gap-2">
						<span className="font-medium text-2xl tabular-nums">
							{mucTieu.tienDo}%
						</span>
						<Progress value={mucTieu.tienDo} />
					</div>
					<SimpleTable columns={COT_KR}>
						{mucTieu.kr.map((kr) => {
							const den = moKr(kr);
							return (
								<SimpleTableRow data-kr={kr.id} key={kr.id}>
									<SimpleTableCell className="whitespace-normal">
										{den ? (
											<Button
												asChild
												data-mo-kr={kr.id}
												size="xs-wrap"
												variant="link"
											>
												<Link href={den}>
													<span translate="no">{kr.tieuDe}</span>
												</Link>
											</Button>
										) : (
											<span data-ten-chu={kr.id} translate="no">
												{kr.tieuDe}
											</span>
										)}
									</SimpleTableCell>
									<SimpleTableCell className="hidden tabular-nums md:table-cell">
										{kr.hienTai}
									</SimpleTableCell>
									<SimpleTableCell>
										<ConfidenceIndicator level={kr.tuTin} size="sm" />
									</SimpleTableCell>
								</SimpleTableRow>
							);
						})}
					</SimpleTable>
				</SheetBody>
			</SheetContent>
		</Sheet>
	);
}

export function NganKrMau({
	kr,
	mucTieu,
	dongVe,
	capNhat,
	veMucTieu,
}: {
	kr: KrMau;
	mucTieu: MucTieuMau;
	dongVe: string;
	capNhat: string;
	veMucTieu: string | null;
}) {
	const router = useRouter();
	return (
		<Sheet open onOpenChange={(mo) => (mo ? null : router.push(dongVe))}>
			<SheetContent data-ngan-kr={kr.id} side="right">
				<SheetHeader>
					{veMucTieu ? (
						<Button
							asChild
							className="self-start"
							data-ve-muc-tieu=""
							size="sm"
							variant="ghost"
						>
							<Link href={veMucTieu}>
								<Icon icon={ArrowLeft} data-icon="inline-start" />
								<span translate="no">{mucTieu.tieuDe}</span>
							</Link>
						</Button>
					) : null}
					<div className="flex items-center gap-2">
						<Badge variant="secondary">KR</Badge>
						<SheetTitle translate="no">{kr.tieuDe}</SheetTitle>
					</div>
					<SheetDescription>
						<span translate="no">{mucTieu.tieuDe}</span> · Phụ trách{" "}
						<span translate="no">{kr.chuTen}</span>
					</SheetDescription>
					<div className="pt-2">
						<Button asChild data-nut="cap-nhat-ngan-kr" size="sm">
							<Link href={capNhat}>Cập nhật</Link>
						</Button>
					</div>
				</SheetHeader>
				<SheetBody className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<div className="flex items-baseline justify-between">
							<span className="font-medium text-2xl tabular-nums">
								{kr.hienTai}
							</span>
							<span className="text-muted-foreground text-xs">
								đích {kr.dich}
							</span>
						</div>
						<Progress value={kr.tienDo} />
						<ConfidenceIndicator level={kr.tuTin} size="sm" />
					</div>
					<div className="flex flex-col gap-2">
						<p className="font-medium text-sm">Các lần cập nhật</p>
						<ItemGroup className="gap-2">
							{kr.lan.map((lan) => (
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

export function HopCapNhatMau({ kr, dongVe }: { kr: KrMau; dongVe: string }) {
	const router = useRouter();
	const [truoc] = kr.lan;
	return (
		<Dialog open onOpenChange={(mo) => (mo ? null : router.push(dongVe))}>
			<DialogContent data-hop-cap-nhat-kr={kr.id}>
				<DialogHeader>
					<DialogTitle>Cập nhật</DialogTitle>
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
					<FieldLabel htmlFor="bkr-gia-tri">Giá trị</FieldLabel>
					<Input defaultValue={truoc.so} id="bkr-gia-tri" />
					<FieldDescription>Đích {kr.dich}</FieldDescription>
				</Field>
				<Field>
					<FieldLabel>Mức tự tin</FieldLabel>
					<ToggleGroup
						defaultValue={truoc.tuTin}
						size="sm"
						type="single"
						variant="outline"
					>
						<ToggleGroupItem value="cao">Cao</ToggleGroupItem>
						<ToggleGroupItem value="vua">Vừa</ToggleGroupItem>
						<ToggleGroupItem value="thap">Thấp</ToggleGroupItem>
					</ToggleGroup>
				</Field>
				<Field>
					<FieldLabel htmlFor="bkr-ghi-chu">Ghi chú</FieldLabel>
					<Input
						id="bkr-ghi-chu"
						maxLength={200}
						placeholder="Một dòng: điều gì đổi, cần ai giúp"
					/>
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
