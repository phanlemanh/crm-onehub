"use client";

import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { DatePicker } from "@crm/ui/components/date-picker";
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
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { Textarea } from "@crm/ui/components/textarea";
import { CHUA_CHAM_THEO_DON_VI, KY_CHAM } from "./du-lieu";

export type HinhCaiDat = "ra" | "dong-chan" | "dong" | "mo-lai";

type DongChuKy = {
	ten: string;
	ngay: string;
	pha: string;
	tone: StatusTone;
	phu: string | null;
};

function dongChuKy(hinh: HinhCaiDat): DongChuKy[] {
	const quy4: DongChuKy =
		hinh === "ra"
			? {
					ten: KY_CHAM.ten,
					ngay: "01/10 – 31/12/2026",
					pha: "Đang chạy",
					tone: "success",
					phu: `Rà giữa kỳ: ${KY_CHAM.raTu} – ${KY_CHAM.raDen}`,
				}
			: hinh === "mo-lai"
				? {
						ten: KY_CHAM.ten,
						ngay: "01/10 – 31/12/2026",
						pha: "Đã đóng",
						tone: "neutral",
						phu: "Đóng 12/01/2027",
					}
				: {
						ten: KY_CHAM.ten,
						ngay: "01/10 – 31/12/2026",
						pha: "Chấm điểm",
						tone: "warning",
						phu: hinh === "dong-chan" ? "Còn 9 KR chưa chấm" : "Mọi KR đã chấm",
					};
	return [
		{
			ten: "Năm 2026",
			ngay: "01/01 – 31/12/2026",
			pha: "Đang chạy",
			tone: "success",
			phu: null,
		},
		quy4,
		{
			ten: KY_CHAM.ke,
			ngay: "01/01 – 31/03/2027",
			pha: "Lập kế hoạch",
			tone: "info",
			phu: null,
		},
	];
}

const COT = [
	{ id: "ten", header: "Chu kỳ" },
	{
		id: "ngay",
		header: "Ngày",
		width: "w-[28%]",
		className: "hidden md:table-cell",
	},
	{ id: "pha", header: "Pha", width: "w-[26%]" },
	{ id: "menu", header: "", width: "w-12" },
] satisfies SimpleTableColumn[];

function BangChuKy({ hinh }: { hinh: HinhCaiDat }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Chu kỳ</CardTitle>
				<CardDescription>
					Menu của mỗi dòng: Mở rà giữa kỳ · Sang chấm điểm · Đóng kỳ · Mở lại
					kỳ — mục nào hiện tuỳ pha.
				</CardDescription>
				<CardAction>
					<Button size="sm" variant="outline">
						Mở chu kỳ
					</Button>
				</CardAction>
			</CardHeader>
			<SimpleTable columns={COT}>
				{dongChuKy(hinh).map((d) => (
					<SimpleTableRow key={d.ten}>
						<TableCell className="px-3 py-3 align-top whitespace-normal">
							<span className="flex flex-col gap-0.5">
								<span className="text-sm">{d.ten}</span>
								<span className="text-muted-foreground text-xs md:hidden">
									{d.ngay}
								</span>
								{d.phu ? (
									<span className="text-muted-foreground text-xs">{d.phu}</span>
								) : null}
							</span>
						</TableCell>
						<TableCell className="hidden px-3 py-3 align-top text-sm md:table-cell">
							{d.ngay}
						</TableCell>
						<TableCell className="px-3 py-3 align-top">
							<StatusIndicator label={d.pha} size="sm" tone={d.tone} />
						</TableCell>
						<TableCell className="px-3 py-3 align-top">
							<Button
								aria-label={`Menu ${d.ten}`}
								size="icon-sm"
								variant="ghost"
							>
								<Icon icon={OverflowMenuHorizontal} />
							</Button>
						</TableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
		</Card>
	);
}

function MoRa() {
	return (
		<Sheet open>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Mở rà giữa kỳ · {KY_CHAM.ten}</SheetTitle>
					<SheetDescription>
						Trong khoảng này, sửa đích của KR đã công bố không cần lý do. Ngoài
						khoảng này, sửa đích phải ghi lý do và KR mang nhãn «đích sửa ngoài
						rà» tới lúc chấm.
					</SheetDescription>
				</SheetHeader>
				<FieldGroup className="px-4">
					<Field>
						<FieldLabel htmlFor="ra-tu">Từ ngày</FieldLabel>
						<DatePicker id="ra-tu" onChange={() => {}} value="2026-11-16" />
					</Field>
					<Field>
						<FieldLabel htmlFor="ra-den">Đến hết ngày</FieldLabel>
						<DatePicker id="ra-den" onChange={() => {}} value="2026-11-22" />
						<FieldDescription>
							Hai ngày nằm trong chu kỳ. Đóng sớm được từ menu của dòng.
						</FieldDescription>
					</Field>
				</FieldGroup>
				<SheetFooter>
					<Button>Mở rà giữa kỳ</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

function DongChan() {
	return (
		<Dialog open>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Chưa đóng được {KY_CHAM.ten}</DialogTitle>
					<DialogDescription>
						Kỳ chỉ đóng khi mọi KR của mục tiêu đã công bố có điểm. Còn 9 KR
						chưa chấm:
					</DialogDescription>
				</DialogHeader>
				<ItemGroup>
					{CHUA_CHAM_THEO_DON_VI.map((d) => (
						<Item key={d.donVi} size="sm" variant="outline">
							<ItemContent>
								<ItemTitle>
									<span translate="no">{d.donVi}</span>
								</ItemTitle>
							</ItemContent>
							<ItemActions>
								<span className="text-sm tabular-nums">{d.conLai} KR</span>
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Đóng hộp thoại</Button>
					</DialogClose>
					<Button disabled>Đóng kỳ</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function MoLai() {
	return (
		<Dialog open>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Mở lại {KY_CHAM.ten}</DialogTitle>
					<DialogDescription>
						Kỳ về pha «Chấm điểm»: điểm và điều học được sửa được lại. Số chốt
						giữ nguyên. Lý do nằm trong vết của chu kỳ.
					</DialogDescription>
				</DialogHeader>
				<Field>
					<FieldLabel htmlFor="ly-do-mo-lai">Lý do mở lại</FieldLabel>
					<Textarea id="ly-do-mo-lai" rows={3} />
					<FieldDescription>Từ 10 đến 500 ký tự.</FieldDescription>
				</Field>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button disabled>Mở lại kỳ</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function CaiDatChuKy({ hinh }: { hinh: HinhCaiDat }) {
	return (
		<div
			className="mx-auto flex w-full max-w-[820px] flex-col gap-6"
			data-ban-mau={`cai-dat-${hinh}`}
		>
			<Card>
				<CardHeader>
					<CardTitle>Chương trình OKR</CardTitle>
					<CardDescription>
						Cài đặt › Chương trình OKR — khung trang Cài đặt thật đứng quanh hai
						thẻ này; bản mẫu chỉ dựng thẻ Chu kỳ.
					</CardDescription>
				</CardHeader>
			</Card>
			<BangChuKy hinh={hinh} />
			{hinh === "ra" ? <MoRa /> : null}
			{hinh === "dong-chan" ? <DongChan /> : null}
			{hinh === "mo-lai" ? <MoLai /> : null}
			{hinh === "dong" ? (
				<ConfirmDialog
					nut="Đóng kỳ"
					onConfirm={() => {}}
					onOpenChange={() => {}}
					open
					pending={false}
					than={`Mọi KR đã chấm. Sau khi đóng, số, điểm và điều học được của ${KY_CHAM.ten} chỉ còn để đọc; mở lại cần lý do và để vết.`}
					thoi="Huỷ"
					tieuDe={`Đóng ${KY_CHAM.ten}?`}
					tone="default"
				/>
			) : null}
		</div>
	);
}
