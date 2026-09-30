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
	type YMau,
} from "./du-lieu";
import { DaiPha, VanBan } from "./khung";

function MenuDuaVao() {
	return (
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
	);
}

export function DanhSachYChuaGom({
	danhSach,
	chonSan,
}: {
	danhSach: YMau[];
	chonSan: string[];
}) {
	const [chon, setChon] = useState<string[]>(chonSan);

	return (
		<Card data-khoi="y-chua-gom" id="y-chua-gom" tabIndex={-1}>
			{chon.length > 0 ? (
				<CardHeader data-khoi="thanh-chon">
					<CardTitle>{chon.length} ý đã chọn</CardTitle>
					<CardAction>
						<div
							aria-label="Việc với các ý đã chọn"
							className="flex items-center gap-1"
							role="toolbar"
						>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button size="sm" variant="outline">
										Đưa vào chủ đề…
									</Button>
								</DropdownMenuTrigger>
								<MenuDuaVao />
							</DropdownMenu>
							<Button onClick={() => setChon([])} size="sm" variant="ghost">
								Bỏ chọn
							</Button>
						</div>
					</CardAction>
				</CardHeader>
			) : (
				<CardHeader>
					<CardTitle>Ý chưa gom ({danhSach.length})</CardTitle>
					<CardDescription>
						Mỗi ý phải vào một chủ đề, hoặc đứng riêng thành ý lạ, trước khi
						công bố. Chọn nhiều ý để gom một lần.
					</CardDescription>
				</CardHeader>
			)}
			<ItemGroup>
				{danhSach.map((y) => {
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
								<VanBan>{y.noiDung}</VanBan>
								<ItemDescription data-dong-phu>
									<span translate="no">{y.tacGia.ten}</span> ·{" "}
									<span translate="no">{y.tacGia.donVi}</span> ·{" "}
									{y.dongY > 0
										? `${y.dongY} người cũng nghĩ vậy`
										: "chưa ai cũng nghĩ vậy"}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											aria-label={`Việc với ý «${y.noiDung}»`}
											size="icon-sm"
											variant="ghost"
										>
											<Icon icon={OverflowMenuHorizontal} />
										</Button>
									</DropdownMenuTrigger>
									<MenuDuaVao />
								</DropdownMenu>
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
			<DaiPha pha="dang-gom" />
			<Card>
				<CardHeader>
					<CardTitle>Gom ý thành chủ đề</CardTitle>
					<CardDescription>
						{HOI_Y.soY} ý. Bạn và{" "}
						<span translate="no">{HOI_Y.nguoiChon.ten}</span> cùng gom; chỉ
						người chọn kết luận.
					</CardDescription>
				</CardHeader>
			</Card>
			<DanhSachYChuaGom chonSan={["g-1", "g-2"]} danhSach={Y_CHUA_GOM} />
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
