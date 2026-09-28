"use client";

import Close from "@carbon/icons-react/es/Close";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import Trophy from "@carbon/icons-react/es/Trophy";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Textarea } from "@crm/ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import {
	TokenField,
	TokenFieldAction,
	TokenFieldItem,
} from "@crm/ui/components/token-field";
import { NGUOI } from "../ban-mau-okr/du-lieu";
import { KR_CANH, TRAO_DOI } from "./du-lieu";

export type HinhTraoDoi = "dong" | "soan";

function DongTraoDoi({ d }: { d: (typeof TRAO_DOI)[number] }) {
	if (d.loai === "ghi-nhan") {
		return (
			<Item size="sm" variant="muted" data-ghi-nhan={d.id}>
				<ItemMedia variant="icon">
					<Icon icon={Trophy} />
				</ItemMedia>
				<ItemContent>
					<ItemTitle>
						<span>
							<span translate="no">{d.nguoiGui.ten}</span> ghi nhận{" "}
							<span translate="no">
								{d.nguoiNhan.map((n) => n.ten).join(", ")}
							</span>
						</span>
					</ItemTitle>
					<ItemDescription className="line-clamp-none">
						<span translate="no">{d.loi}</span>
					</ItemDescription>
					<span className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
						{d.kr ? (
							<Badge variant="outline">
								<span translate="no">{d.kr}</span>
							</Badge>
						) : null}
						<span>{d.luc}</span>
					</span>
				</ItemContent>
				<ItemActions>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								aria-label="Thao tác với ghi nhận"
								size="icon-sm"
								variant="ghost"
							>
								<Icon icon={OverflowMenuHorizontal} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem variant="destructive">
								Gỡ ghi nhận
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</ItemActions>
			</Item>
		);
	}
	return (
		<Item size="sm" data-binh-luan={d.id}>
			<ItemMedia>
				<PersonAvatar name={d.nguoi.ten} size="sm" />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>
					<span translate="no">{d.nguoi.ten}</span>
				</ItemTitle>
				<ItemDescription className="line-clamp-none">
					<span translate="no">{d.noiDung}</span>
				</ItemDescription>
				<span className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
					{d.kr ? (
						<Badge variant="outline">
							<span translate="no">{d.kr}</span>
						</Badge>
					) : null}
					<span>{d.luc}</span>
				</span>
			</ItemContent>
		</Item>
	);
}

function OSoan({ ghiNhan }: { ghiNhan: boolean }) {
	return (
		<div className="flex flex-col gap-3 rounded-lg border p-3" data-o-soan>
			<ToggleGroup
				aria-label="Loại tin"
				type="single"
				value={ghiNhan ? "ghi-nhan" : "binh-luan"}
				variant="outline"
			>
				<ToggleGroupItem value="binh-luan">Bình luận</ToggleGroupItem>
				<ToggleGroupItem value="ghi-nhan">Ghi nhận</ToggleGroupItem>
			</ToggleGroup>
			{ghiNhan ? (
				<Field>
					<FieldLabel>Ghi nhận ai</FieldLabel>
					<TokenField>
						<TokenFieldItem>
							{NGUOI.nga.ten}
							<TokenFieldAction aria-label={`Bỏ ${NGUOI.nga.ten}`}>
								<Icon icon={Close} />
							</TokenFieldAction>
						</TokenFieldItem>
						<TokenFieldItem>
							{NGUOI.khoa.ten}
							<TokenFieldAction aria-label={`Bỏ ${NGUOI.khoa.ten}`}>
								<Icon icon={Close} />
							</TokenFieldAction>
						</TokenFieldItem>
					</TokenField>
					<FieldDescription>Tối đa 5 người.</FieldDescription>
				</Field>
			) : null}
			<Field>
				<FieldLabel htmlFor="noi-dung-trao-doi">
					{ghiNhan ? "Lời ghi nhận" : "Bình luận"}
				</FieldLabel>
				<Textarea
					defaultValue={
						ghiNhan
							? "Cảm ơn hai bạn đã giữ ca tối suốt tuần cao điểm."
							: undefined
					}
					id="noi-dung-trao-doi"
					name="noi-dung"
					placeholder={ghiNhan ? "Cảm ơn vì…" : "Hỏi, nhắc tên bằng @…"}
				/>
				{ghiNhan ? <FieldDescription>52/500 ký tự.</FieldDescription> : null}
			</Field>
			<div className="flex flex-wrap items-end justify-between gap-2">
				<Field className="w-full sm:w-72">
					<FieldLabel htmlFor="kr-trao-doi">Gắn KR (tuỳ chọn)</FieldLabel>
					<Select defaultValue="k1">
						<SelectTrigger id="kr-trao-doi">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ca-muc-tieu">Cả mục tiêu</SelectItem>
							{KR_CANH.map((k) => (
								<SelectItem key={k.id} value={k.id}>
									{k.ten}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
				<Button>{ghiNhan ? "Gửi ghi nhận" : "Gửi"}</Button>
			</div>
		</div>
	);
}

export function TraoDoiGhiNhan({ hinh }: { hinh: HinhTraoDoi }) {
	return (
		<div className="flex flex-col gap-4" data-trao-doi>
			<ItemGroup className="gap-2">
				{TRAO_DOI.map((d) => (
					<DongTraoDoi d={d} key={d.id} />
				))}
			</ItemGroup>
			<OSoan ghiNhan={hinh === "soan"} />
		</div>
	);
}
