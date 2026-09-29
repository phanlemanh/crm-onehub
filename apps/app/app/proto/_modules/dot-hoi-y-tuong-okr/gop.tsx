"use client";

import Edit from "@carbon/icons-react/es/Edit";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import ThumbsUp from "@carbon/icons-react/es/ThumbsUp";
import TrashCan from "@carbon/icons-react/es/TrashCan";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { Textarea } from "@crm/ui/components/textarea";
import { Toggle } from "@crm/ui/components/toggle";
import { useState } from "react";
import {
	DO_PHU_DANG_MO,
	DO_PHU_HET_HAN,
	HOI_Y,
	TRAN,
	Y_CUA_TOI,
	Y_NGUOI_KHAC,
	Y_TOI_DA_DONG_Y,
	type YMau,
} from "./du-lieu";
import { CauHoi, DoPhu, LoiMo } from "./khung";

export type HinhGop = "chua-gop" | "da-gop" | "het-han";

function ChiTietY({ y }: { y: YMau }) {
	return (
		<>
			<ItemTitle translate="no">{y.noiDung}</ItemTitle>
			{y.viSao ? (
				<ItemDescription>
					Vì sao: <span translate="no">{y.viSao}</span>
				</ItemDescription>
			) : null}
			{y.doBangGi ? (
				<ItemDescription>
					Đo bằng: <span translate="no">{y.doBangGi}</span>
				</ItemDescription>
			) : null}
		</>
	);
}

function OSoanY({ conLai }: { conLai: number }) {
	const [noiDung, setNoiDung] = useState("");
	const [viSao, setViSao] = useState("");
	const [doBangGi, setDoBangGi] = useState("");
	const hopLe =
		noiDung.trim().length >= TRAN.noiDung.it &&
		noiDung.length <= TRAN.noiDung.nhieu;

	return (
		<CardContent data-khoi="o-soan">
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="y-moi">Ý của bạn</FieldLabel>
					<Textarea
						id="y-moi"
						maxLength={TRAN.noiDung.nhieu}
						onChange={(e) => setNoiDung(e.target.value)}
						placeholder="Một mục tiêu, viết như bạn sẽ nói với cả công ty"
						translate="no"
						value={noiDung}
					/>
					<FieldDescription>
						{noiDung.length}/{TRAN.noiDung.nhieu} ký tự, ít nhất{" "}
						{TRAN.noiDung.it}
					</FieldDescription>
				</Field>
				<Field>
					<FieldLabel htmlFor="y-vi-sao">Vì sao (tuỳ chọn)</FieldLabel>
					<Textarea
						id="y-vi-sao"
						maxLength={TRAN.viSao}
						onChange={(e) => setViSao(e.target.value)}
						translate="no"
						value={viSao}
					/>
					<FieldDescription>
						{viSao.length}/{TRAN.viSao} ký tự
					</FieldDescription>
				</Field>
				<Field>
					<FieldLabel htmlFor="y-do-bang">Đo bằng gì (tuỳ chọn)</FieldLabel>
					<Input
						id="y-do-bang"
						maxLength={TRAN.doBangGi}
						onChange={(e) => setDoBangGi(e.target.value)}
						translate="no"
						value={doBangGi}
					/>
					<FieldDescription>
						{doBangGi.length}/{TRAN.doBangGi} ký tự
					</FieldDescription>
				</Field>
				<Field orientation="horizontal">
					<FieldDescription>
						Bạn còn góp được {conLai} ý. Hạn {HOI_Y.han}, giờ Việt Nam.
					</FieldDescription>
					<Button disabled={!hopLe}>Gửi</Button>
				</Field>
			</FieldGroup>
		</CardContent>
	);
}

function YCuaBan({ chiDoc }: { chiDoc: boolean }) {
	const [goY, setGoY] = useState<YMau | null>(null);

	return (
		<Card data-khoi="y-cua-ban">
			<CardHeader>
				<CardTitle>
					Ý của bạn ({Y_CUA_TOI.length}/{TRAN.yMoiNguoi})
				</CardTitle>
				<CardDescription>
					{chiDoc
						? "Đã hết hạn nên không sửa được. Bạn sẽ thấy mỗi ý đi đâu khi có công bố."
						: "Đồng nghiệp đọc được ý nhưng không thấy tên bạn. Người chọn và quản trị thấy tên."}
				</CardDescription>
			</CardHeader>
			<ItemGroup>
				{Y_CUA_TOI.map((y) => (
					<Item data-y={y.id} key={y.id} variant="outline">
						<ItemContent>
							<ChiTietY y={y} />
						</ItemContent>
						{chiDoc ? null : (
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
									<DropdownMenuContent align="end">
										<DropdownMenuItem>
											<Icon icon={Edit} />
											Sửa
										</DropdownMenuItem>
										<DropdownMenuItem
											onSelect={() => setGoY(y)}
											variant="destructive"
										>
											<Icon icon={TrashCan} />
											Gỡ
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</ItemActions>
						)}
					</Item>
				))}
			</ItemGroup>
			<ConfirmDialog
				nut="Gỡ ý"
				onConfirm={() => setGoY(null)}
				onOpenChange={(mo) => {
					if (!mo) setGoY(null);
				}}
				open={goY !== null}
				pending={false}
				than="Ý và mọi lượt «Tôi cũng nghĩ vậy» của nó bị xoá. Bạn góp lại được khi chưa tới hạn."
				thoi="Giữ lại"
				tieuDe="Gỡ ý này?"
			/>
		</Card>
	);
}

function YNguoiKhac({
	daDongY,
	chiDoc,
}: {
	daDongY: string[];
	chiDoc: boolean;
}) {
	const [bat, setBat] = useState<string[]>(daDongY);

	return (
		<Card data-khoi="y-nguoi-khac">
			<CardHeader>
				<CardTitle>Ý của đồng nghiệp</CardTitle>
				<CardDescription>
					Không kèm tên. «Tôi cũng nghĩ vậy» không hiện số đếm ở đây — chỉ người
					gom thấy.
				</CardDescription>
			</CardHeader>
			<ItemGroup>
				{Y_NGUOI_KHAC.map((y) => {
					const dangBat = bat.includes(y.id);
					return (
						<Item data-y={y.id} key={y.id} variant="outline">
							<ItemContent>
								<ChiTietY y={y} />
							</ItemContent>
							<ItemActions>
								<Toggle
									aria-label={`Tôi cũng nghĩ vậy: ${y.noiDung}`}
									disabled={chiDoc}
									onPressedChange={(p) =>
										setBat((cu) =>
											p ? [...cu, y.id] : cu.filter((id) => id !== y.id),
										)
									}
									pressed={dangBat}
									size="sm"
									variant="outline"
								>
									<Icon data-icon="inline-start" icon={ThumbsUp} />
									Tôi cũng nghĩ vậy
								</Toggle>
							</ItemActions>
						</Item>
					);
				})}
			</ItemGroup>
		</Card>
	);
}

export function GopMan({ hinh }: { hinh: HinhGop }) {
	const hetHan = hinh === "het-han";
	const daGop = hinh !== "chua-gop";
	const conLai = TRAN.yMoiNguoi - (daGop ? Y_CUA_TOI.length : 0);

	return (
		<div className="flex flex-col gap-6" data-hinh-gop={hinh}>
			{hetHan ? (
				<Alert data-khoi="het-han">
					<AlertTitle>Đã hết hạn góp — đang chờ công bố</AlertTitle>
					<AlertDescription>
						Hạn là {HOI_Y.han}. Khi{" "}
						<span translate="no">{HOI_Y.nguoiChon.ten}</span> công bố, bạn nhận
						nhắc buổi sáng và thấy mỗi ý của mình đi đâu, vì sao.
					</AlertDescription>
				</Alert>
			) : null}
			<LoiMo />
			<Card>
				<CauHoi
					ghiChu={
						hetHan
							? `${HOI_Y.daGop}/${HOI_Y.thanhVien} người đã góp ${HOI_Y.soY} ý.`
							: `Góp 1–${TRAN.yMoiNguoi} ý. Hạn ${HOI_Y.han}.`
					}
					hetHan={hetHan}
				/>
				{hetHan ? null : <OSoanY conLai={conLai} />}
			</Card>
			{daGop ? <YCuaBan chiDoc={hetHan} /> : null}
			<YNguoiKhac chiDoc={hetHan} daDongY={daGop ? [Y_TOI_DA_DONG_Y] : []} />
			<DoPhu hang={hetHan ? DO_PHU_HET_HAN : DO_PHU_DANG_MO} />
		</div>
	);
}
