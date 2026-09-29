"use client";

import Add from "@carbon/icons-react/es/Add";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Checkbox } from "@crm/ui/components/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
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
import { useState } from "react";
import {
	CHU_DE_GOM,
	type ChuDeMau,
	HOI_Y,
	Y_CHUA_GOM,
	Y_LA,
	Y_RUT_GON,
} from "./du-lieu";

function MenuDuaVao({ nhan, nutNhan }: { nhan: string; nutNhan: string }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button aria-label={nhan} size="sm" variant="outline">
					{nutNhan}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Đưa vào chủ đề</DropdownMenuLabel>
				{CHU_DE_GOM.map((c) => (
					<DropdownMenuItem key={c.id}>
						<span translate="no">{c.ten}</span>
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem>Ý lạ — đứng riêng</DropdownMenuItem>
				<DropdownMenuItem>
					<Icon icon={Add} />
					Chủ đề mới…
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function YChuaGom() {
	const [chon, setChon] = useState<string[]>(["g-1", "g-2"]);

	return (
		<Card data-khoi="y-chua-gom">
			<CardHeader>
				<CardTitle>Ý chưa gom ({Y_CHUA_GOM.length})</CardTitle>
				<CardDescription>
					Mỗi ý phải vào một chủ đề, hoặc đứng riêng thành ý lạ, trước khi công
					bố.
				</CardDescription>
				{chon.length > 0 ? (
					<CardAction>
						<MenuDuaVao
							nhan={`Đưa ${chon.length} ý đã chọn vào chủ đề`}
							nutNhan={`Đưa ${chon.length} ý vào…`}
						/>
					</CardAction>
				) : null}
			</CardHeader>
			<ItemGroup>
				{Y_CHUA_GOM.map((y) => {
					const daChon = chon.includes(y.id);
					return (
						<Item data-y={y.id} key={y.id} variant="outline">
							<ItemMedia>
								<Checkbox
									aria-label={`Chọn ý «${y.noiDung}»`}
									checked={daChon}
									onCheckedChange={(v) =>
										setChon((cu) =>
											v === true
												? [...cu, y.id]
												: cu.filter((id) => id !== y.id),
										)
									}
								/>
							</ItemMedia>
							<ItemContent>
								<ItemTitle translate="no">{y.noiDung}</ItemTitle>
								<ItemDescription>
									<span translate="no">{y.tacGia.ten}</span> ·{" "}
									<span translate="no">{y.tacGia.donVi}</span> ·{" "}
									{y.dongY > 0
										? `${y.dongY} người cũng nghĩ vậy`
										: "chưa ai cũng nghĩ vậy"}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<MenuDuaVao
									nhan={`Đưa ý «${y.noiDung}» vào chủ đề`}
									nutNhan="Đưa vào chủ đề…"
								/>
							</ItemActions>
						</Item>
					);
				})}
			</ItemGroup>
		</Card>
	);
}

export function DongYRutGon({ yId, coTen }: { yId: string; coTen: boolean }) {
	const y = Y_RUT_GON.get(yId);
	if (!y) return null;
	return (
		<Item data-y={yId} size="xs">
			<ItemContent>
				<ItemTitle translate="no">{y.noiDung}</ItemTitle>
				{coTen ? (
					<ItemDescription>
						<span translate="no">{y.tacGia.ten}</span> ·{" "}
						<span translate="no">{y.tacGia.donVi}</span>
					</ItemDescription>
				) : null}
			</ItemContent>
		</Item>
	);
}

export function moTaBangChung(c: ChuDeMau): string {
	return `${c.yIds.length} ý · ${c.soNguoi} người ở ${c.soDonVi} đơn vị · ${c.dongY} người cũng nghĩ vậy`;
}

function TheChuDeGom({ c }: { c: ChuDeMau }) {
	return (
		<Card data-chu-de={c.id}>
			<CardHeader>
				<CardTitle translate="no">{c.ten}</CardTitle>
				<CardDescription>{moTaBangChung(c)}</CardDescription>
				<CardAction>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								aria-label={`Việc với chủ đề «${c.ten}»`}
								size="icon-sm"
								variant="ghost"
							>
								<Icon icon={OverflowMenuHorizontal} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>Đổi tên</DropdownMenuItem>
							<DropdownMenuItem disabled variant="destructive">
								Gỡ chủ đề (còn ý)
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</CardAction>
			</CardHeader>
			<CardContent>
				<ItemGroup>
					{c.yIds.map((id) => (
						<DongYRutGon coTen key={id} yId={id} />
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}

export function GomMan() {
	return (
		<div className="flex flex-col gap-6" data-hinh="gom">
			<Card>
				<CardHeader>
					<CardTitle>Gom ý thành chủ đề</CardTitle>
					<CardDescription>
						Hết hạn lúc {HOI_Y.han}. {HOI_Y.daGop}/{HOI_Y.thanhVien} người đã
						góp {HOI_Y.soY} ý. Bạn và{" "}
						<span translate="no">{HOI_Y.nguoiChon.ten}</span> cùng gom; chỉ
						người chọn kết luận.
					</CardDescription>
				</CardHeader>
			</Card>
			<YChuaGom />
			<Card data-khoi="chu-de">
				<CardHeader>
					<CardTitle>Chủ đề ({CHU_DE_GOM.length})</CardTitle>
					<CardAction>
						<Button size="sm" variant="outline">
							<Icon data-icon="inline-start" icon={Add} />
							Chủ đề mới
						</Button>
					</CardAction>
				</CardHeader>
				<div className="grid gap-6 md:grid-cols-2">
					{CHU_DE_GOM.map((c) => (
						<TheChuDeGom c={c} key={c.id} />
					))}
				</div>
			</Card>
			<Card data-khoi="y-la">
				<CardHeader>
					<CardTitle>Ý lạ (1)</CardTitle>
					<CardDescription>
						Ý đứng riêng, không nhập vào chủ đề nào. Người chọn vẫn kết luận và
						viết lý do như một chủ đề.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ItemGroup>
						{Y_LA.yIds.map((id) => (
							<DongYRutGon coTen key={id} yId={id} />
						))}
					</ItemGroup>
				</CardContent>
			</Card>
		</div>
	);
}
