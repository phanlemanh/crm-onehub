"use client";

import Add from "@carbon/icons-react/es/Add";
import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import Target from "@carbon/icons-react/es/Target";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
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
import { Combobox } from "@crm/ui/components/combobox";
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
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { Switch } from "@crm/ui/components/switch";
import { TreeNav, type TreeNavNode } from "@crm/ui/components/tree-nav";
import { useState } from "react";
import {
	PageShell,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { TenNguoi } from "../ban-mau-okr/phan-chung";
import {
	CAY_TO_CHUC,
	DON_VI_NHAN,
	type DonViCay,
	KY,
	MUC_TIEU_CHUYEN,
	type MucTieuChuyen,
	PHONG_BAN_CHON,
} from "./du-lieu";

export type HinhChuongTrinh = "duyet" | "khong-quyen";

export type HinhToChuc = "okr-mo" | "luu-tru-chan" | "chuyen" | "chuyen-loi";

const LY_DO_KHONG_QUYEN = "ly-do-khong-quyen";

function DongCongTac({
	id,
	nhan,
	moTa,
	bat,
	khoa,
}: {
	id: string;
	nhan: string;
	moTa: string;
	bat: boolean;
	khoa: boolean;
}) {
	return (
		<Field orientation="horizontal" data-cong-tac={id}>
			<FieldContent>
				<FieldLabel htmlFor={id}>{nhan}</FieldLabel>
				<FieldDescription>{moTa}</FieldDescription>
			</FieldContent>
			<Switch
				aria-describedby={khoa ? LY_DO_KHONG_QUYEN : undefined}
				checked={bat}
				disabled={khoa}
				id={id}
			/>
		</Field>
	);
}

export function ChuongTrinhOkr({ hinh }: { hinh: HinhChuongTrinh }) {
	const khoa = hinh === "khong-quyen";
	return (
		<PageShell width="page">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Chương trình OKR</PageShellTitle>
					{khoa ? (
						<PageShellDescription id={LY_DO_KHONG_QUYEN}>
							Chỉ quản trị đổi được chương trình OKR.
						</PageShellDescription>
					) : null}
				</PageShellHeading>
			</PageShellHeader>
			<Card data-the="cau-hinh">
				<CardHeader>
					<CardTitle>Cấu hình</CardTitle>
					<CardDescription>
						Áp cho mọi chu kỳ từ lần lưu này; chu kỳ đã đóng giữ cấu hình cũ.
					</CardDescription>
					<CardAction>
						<Button
							aria-describedby={khoa ? LY_DO_KHONG_QUYEN : undefined}
							disabled={khoa}
							form="cau-hinh-okr"
							type="submit"
						>
							Lưu
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent>
					<form id="cau-hinh-okr">
						<FieldGroup>
							<div className="grid items-start gap-3 sm:grid-cols-2">
								<Field>
									<FieldLabel htmlFor="tran-muc-tieu">
										Tối đa mục tiêu mỗi đơn vị
									</FieldLabel>
									<Input
										aria-describedby={khoa ? LY_DO_KHONG_QUYEN : undefined}
										autoComplete="off"
										defaultValue="5"
										disabled={khoa}
										id="tran-muc-tieu"
										inputMode="numeric"
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor="tran-kr">
										Tối đa KR mỗi mục tiêu
									</FieldLabel>
									<Input
										aria-describedby={khoa ? LY_DO_KHONG_QUYEN : undefined}
										autoComplete="off"
										defaultValue="5"
										disabled={khoa}
										id="tran-kr"
										inputMode="numeric"
									/>
								</Field>
							</div>
							<DongCongTac
								bat={false}
								id="trong-so"
								khoa={khoa}
								moTa="KR đóng góp vào tiến độ mục tiêu theo trọng số người đặt."
								nhan="Trọng số KR"
							/>
							<DongCongTac
								bat
								id="ca-nhan"
								khoa={khoa}
								moTa="Mỗi người đặt được mục tiêu của riêng mình."
								nhan="Mục tiêu cá nhân"
							/>
							<DongCongTac
								bat={!khoa}
								id="duyet-cong-bo"
								khoa={khoa}
								moTa="Mục tiêu phải được duyệt trước khi công bố: trưởng bộ phận duyệt mục tiêu phòng ban, quản trị duyệt mục tiêu bộ phận, trưởng phòng ban duyệt mục tiêu cá nhân. Mục tiêu cấp công ty không qua duyệt."
								nhan="Công bố cần duyệt"
							/>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</PageShell>
	);
}

const DE_MO = ["goc", "khoi-kd", "khoi-ht"];

function nutCay(ds: DonViCay[]): TreeNavNode<null>[] {
	return ds.map((d) => ({
		id: d.id,
		name: d.ten,
		data: null,
		children: d.con ? nutCay(d.con) : undefined,
	}));
}

function CayDonVi() {
	const [mo, setMo] = useState<string[]>(DE_MO);
	return (
		<div className="p-2">
			<TreeNav
				expanded={mo}
				label="Cây tổ chức"
				nodes={nutCay(CAY_TO_CHUC)}
				onExpandedChange={setMo}
				renderLabel={(nut) => (
					<span className="truncate" translate="no">
						{nut.name}
					</span>
				)}
				selectedId={PHONG_BAN_CHON.id}
			/>
		</div>
	);
}

function ChiTietPhongBan() {
	const pb = PHONG_BAN_CHON;
	return (
		<section
			className="flex flex-col gap-5 p-4"
			data-chi-tiet="phong-ban"
			data-phong-ban={pb.id}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-col">
					<span className="text-muted-foreground text-xs" translate="no">
						{pb.boPhan} ›
					</span>
					<CardTitle>
						<span translate="no">{pb.ten}</span>
					</CardTitle>
				</div>
				<Button
					aria-label={`Thao tác với ${pb.ten}`}
					size="icon-xs"
					variant="ghost"
				>
					<Icon icon={OverflowMenuVertical} />
				</Button>
			</div>
			<Item size="sm" variant="outline" data-dong-okr-mo={pb.okrMo}>
				<ItemMedia variant="icon">
					<Icon icon={Target} />
				</ItemMedia>
				<ItemContent>
					<ItemTitle>OKR: {pb.okrMo} mục tiêu ở kỳ đang mở</ItemTitle>
					<ItemDescription>
						{KY} · chuyển sang phòng ban khác trước khi lưu trữ, gộp hay tách
						phòng ban.
					</ItemDescription>
				</ItemContent>
				<ItemActions>
					<Button aria-haspopup="dialog" size="sm" variant="outline">
						Chuyển OKR…
					</Button>
				</ItemActions>
			</Item>
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between gap-2">
					<span className="font-medium text-sm">Người ({pb.nguoi.length})</span>
					<Button size="sm" variant="outline">
						<Icon icon={Add} data-icon="inline-start" />
						Thêm người
					</Button>
				</div>
				<ItemGroup className="gap-2">
					{pb.nguoi.map((x) => (
						<Item key={x.id} size="sm" variant="outline">
							<ItemContent>
								<ItemTitle>
									<TenNguoi ten={x.ten} />
								</ItemTitle>
							</ItemContent>
							{x.id === pb.truong.id ? (
								<ItemActions>
									<Badge variant="outline">Trưởng phòng ban</Badge>
								</ItemActions>
							) : null}
						</Item>
					))}
				</ItemGroup>
			</div>
		</section>
	);
}

function HopLuuTruChan() {
	const pb = PHONG_BAN_CHON;
	return (
		<Dialog open>
			<DialogContent data-hop="luu-tru">
				<DialogHeader>
					<DialogTitle>
						Lưu trữ «<span translate="no">{pb.ten}</span>»?
					</DialogTitle>
					<DialogDescription>
						Phòng ban lưu trữ rời khỏi cây; người trong đó giữ tài khoản.
					</DialogDescription>
				</DialogHeader>
				<Alert variant="warning">
					<Icon icon={WarningAlt} />
					<AlertTitle>Chưa lưu trữ được</AlertTitle>
					<AlertDescription>
						<p id="ly-do-chan-luu-tru">
							Phòng ban còn {pb.okrMo} mục tiêu ở kỳ đang mở — chuyển OKR hoặc
							bỏ mục tiêu trước khi lưu trữ.
						</p>
						<div className="flex flex-col gap-2 sm:flex-row">
							<Button aria-haspopup="dialog" size="sm" variant="outline">
								Chuyển OKR…
								<Icon icon={ArrowRight} data-icon="inline-end" />
							</Button>
						</div>
					</AlertDescription>
				</Alert>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button
						aria-describedby="ly-do-chan-luu-tru"
						disabled
						variant="destructive"
					>
						Lưu trữ
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function DongChuyen({ mt, loi }: { mt: MucTieuChuyen; loi: boolean }) {
	const hong = loi && mt.hong !== undefined;
	const id = `chuyen-${mt.id}`;
	return (
		<Item size="sm" variant="outline" data-muc-tieu-chuyen={mt.id}>
			<ItemMedia>
				<Checkbox
					aria-describedby={hong ? "loi-chuyen" : undefined}
					aria-invalid={hong || undefined}
					checked
					id={id}
				/>
			</ItemMedia>
			<ItemContent>
				<ItemTitle>
					<label htmlFor={id} translate="no">
						{mt.ten}
					</label>
				</ItemTitle>
				<ItemDescription>{mt.chiTiet}</ItemDescription>
			</ItemContent>
			{hong ? (
				<ItemActions>
					<Badge variant="destructive">{mt.hong}</Badge>
				</ItemActions>
			) : null}
		</Item>
	);
}

function HopChuyen({ loi }: { loi: boolean }) {
	const hong = MUC_TIEU_CHUYEN.find((m) => m.hong !== undefined);
	return (
		<Dialog open>
			<DialogContent data-hop="chuyen-okr" size="wide">
				<DialogHeader>
					<DialogTitle>Chuyển OKR</DialogTitle>
					<DialogDescription>
						Từ «<span translate="no">{PHONG_BAN_CHON.ten}</span>» · {KY}. Mục
						tiêu giữ KR, cập nhật tuần, căn chỉnh, người xem và vết.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					{loi && hong ? (
						<Alert id="loi-chuyen" variant="destructive">
							<Icon icon={WarningAlt} />
							<AlertTitle>Không mục tiêu nào được chuyển</AlertTitle>
							<AlertDescription>
								<p>
									«<span translate="no">{hong.ten}</span>» đã bị bỏ sau khi bạn
									mở hộp này. Bỏ chọn mục tiêu đó rồi chuyển lại.
								</p>
							</AlertDescription>
						</Alert>
					) : null}
					<Field>
						<FieldLabel htmlFor="don-vi-nhan">Chuyển sang</FieldLabel>
						<Combobox
							id="don-vi-nhan"
							onValueChange={() => {}}
							options={DON_VI_NHAN}
							placeholder="Chọn phòng ban…"
							searchPlaceholder="Tìm phòng ban…"
							translate="no"
							value="kd2"
						/>
						<FieldDescription>
							Chỉ phòng ban còn hoạt động. Quyền sửa theo trưởng của phòng ban
							nhận.
						</FieldDescription>
					</Field>
					<FieldSet>
						<FieldLegend variant="label">
							Mục tiêu ở kỳ đang mở ({MUC_TIEU_CHUYEN.length})
						</FieldLegend>
						<ItemGroup className="gap-2">
							{MUC_TIEU_CHUYEN.map((mt) => (
								<DongChuyen key={mt.id} loi={loi} mt={mt} />
							))}
						</ItemGroup>
					</FieldSet>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button>Chuyển {MUC_TIEU_CHUYEN.length} mục tiêu</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function ToChuc({ hinh }: { hinh: HinhToChuc }) {
	return (
		<PageShell width="full">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Tổ chức</PageShellTitle>
				</PageShellHeading>
			</PageShellHeader>
			<div className="grid grid-cols-1 rounded-lg border lg:grid-cols-[18rem_minmax(0,1fr)]">
				<div className="min-w-0 border-b lg:border-e lg:border-b-0">
					<CayDonVi />
				</div>
				<div className="min-w-0">
					<ChiTietPhongBan />
				</div>
			</div>
			{hinh === "luu-tru-chan" ? <HopLuuTruChan /> : null}
			{hinh === "chuyen" ? <HopChuyen loi={false} /> : null}
			{hinh === "chuyen-loi" ? <HopChuyen loi /> : null}
		</PageShell>
	);
}
