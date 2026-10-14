"use client";

import Archive from "@carbon/icons-react/es/Archive";
import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
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
import { DiffTrang } from "@crm/ui/components/diff-trang";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { MarkdownReader } from "@crm/ui/components/markdown-reader";
import { Separator } from "@crm/ui/components/separator";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { Textarea } from "@crm/ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { soSanh, suKienDoi } from "@crm/validation/tai-lieu-diff";
import { useState } from "react";
import { PageShellTitle } from "@/components/page-shell";
import {
	BAN_DANG_DUNG,
	DE_XUAT,
	type DeXuatMau,
	PHIEN_BAN,
	type PhienBanMau,
	TRANG_DA_LUU_TRU,
	TRANG_MAU,
} from "./du-lieu";

const LY_DO_TRAN = 500;

function DauTrang({ phu, ve }: { phu: string; ve: string }) {
	return (
		<div className="flex flex-col gap-2">
			<Button className="w-fit" size="sm" variant="ghost">
				<Icon icon={ArrowLeft} />
				{ve}
			</Button>
			<PageShellTitle translate="no">{TRANG_MAU.ten}</PageShellTitle>
			<p className="text-muted-foreground text-sm">{phu}</p>
		</div>
	);
}

export function LichSu({ chiMotBan }: { chiMotBan: boolean }) {
	const ban = chiMotBan ? PHIEN_BAN.slice(-1) : PHIEN_BAN;
	return (
		<div className="flex flex-col gap-6 p-6" data-man="lich-su">
			<DauTrang
				phu="Lịch sử phiên bản — mỗi lần chủ trang duyệt là một phiên bản"
				ve="Về trang"
			/>
			{chiMotBan ? (
				<p className="text-muted-foreground text-sm">
					Trang mới có một phiên bản.
				</p>
			) : null}
			<div className="hidden md:block">
				<SimpleTable
					columns={[
						{ id: "so", header: "Phiên bản" },
						{ id: "duyet", header: "Duyệt" },
						{ id: "de-xuat", header: "Người đề xuất" },
						{ id: "trang-thai", header: "", srLabel: "Trạng thái" },
					]}
					surface="page"
				>
					{ban.map((b, i) => (
						<SimpleTableRow key={b.so}>
							<SimpleTableCell>
								<span className="font-medium">Phiên bản {b.so}</span>
							</SimpleTableCell>
							<SimpleTableCell>
								{b.duyetLuc} · <span translate="no">{b.nguoiDuyet}</span>
							</SimpleTableCell>
							<SimpleTableCell>
								<span translate="no">{b.nguoiDeXuat}</span>
							</SimpleTableCell>
							<SimpleTableCell>
								{i === 0 ? (
									<StatusIndicator label="Đang dùng" tone="success" />
								) : null}
							</SimpleTableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<div className="flex flex-col gap-2 md:hidden">
				{ban.map((b, i) => (
					<Item key={b.so} variant="outline">
						<ItemContent>
							<ItemTitle>Phiên bản {b.so}</ItemTitle>
							<ItemDescription>
								Duyệt {b.duyetLuc} · <span translate="no">{b.nguoiDeXuat}</span>{" "}
								đề xuất
							</ItemDescription>
						</ItemContent>
						{i === 0 ? (
							<ItemActions>
								<StatusIndicator label="Đang dùng" tone="success" />
							</ItemActions>
						) : null}
					</Item>
				))}
			</div>
		</div>
	);
}

export function BanCu({
	ban,
	toanVanSan,
}: {
	ban: PhienBanMau;
	toanVanSan: boolean;
}) {
	const [kieu, setKieu] = useState(toanVanSan ? "toan-van" : "so-sanh");
	const laDangDung = ban.so === BAN_DANG_DUNG.so;
	const khoi = soSanh(BAN_DANG_DUNG.noiDung, ban.noiDung);
	return (
		<div className="flex flex-col gap-6 p-6" data-man="ban-cu">
			<DauTrang
				phu={`Phiên bản ${ban.so} · duyệt ${ban.duyetLuc} · ${ban.nguoiDeXuat} đề xuất`}
				ve="Về lịch sử"
			/>
			{laDangDung ? (
				<p className="text-muted-foreground text-sm">Đây là bản đang dùng.</p>
			) : (
				<div className="flex flex-wrap items-center gap-2">
					<ToggleGroup
						onValueChange={(v) => v && setKieu(v)}
						size="sm"
						type="single"
						value={kieu}
						variant="outline"
					>
						<ToggleGroupItem value="so-sanh">
							So với bản đang dùng
						</ToggleGroupItem>
						<ToggleGroupItem value="toan-van">Toàn văn</ToggleGroupItem>
					</ToggleGroup>
					<Button size="sm" variant="outline">
						Quay lại phiên bản {ban.so}
					</Button>
				</div>
			)}
			<Separator />
			<div className="max-w-3xl" translate="no">
				{kieu === "so-sanh" && !laDangDung ? (
					<DiffTrang
						dai={suKienDoi(khoi)}
						khoi={khoi}
						nhanBo="Quay lại sẽ bỏ"
						nhanDaiSo="Số và ngày sẽ đổi"
						nhanThem="Quay lại sẽ thêm"
					/>
				) : (
					<MarkdownReader>{ban.noiDung}</MarkdownReader>
				)}
			</div>
		</div>
	);
}

function HopLyDo({
	mo,
	tieuDe,
	moTa,
	nutGui,
}: {
	mo: boolean;
	tieuDe: string;
	moTa: string;
	nutGui: string;
}) {
	const [mo2, setMo2] = useState(mo);
	const [lyDo, setLyDo] = useState("");
	const gon = lyDo.trim();
	return (
		<Dialog onOpenChange={setMo2} open={mo2}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{tieuDe}</DialogTitle>
					<DialogDescription>{moTa}</DialogDescription>
				</DialogHeader>
				<Field>
					<FieldLabel htmlFor="ly-do">Lý do</FieldLabel>
					<Textarea
						id="ly-do"
						maxLength={LY_DO_TRAN + 50}
						onChange={(e) => setLyDo(e.target.value)}
						value={lyDo}
					/>
					<FieldDescription>
						Chủ trang đọc lý do này khi duyệt. Tối đa {LY_DO_TRAN} ký tự.
					</FieldDescription>
				</Field>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button disabled={gon.length === 0 || gon.length > LY_DO_TRAN}>
						{nutGui}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function DocTrang({
	trangThai,
}: {
	trangThai: "hop-luu-tru" | "cho-luu-tru" | "da-luu-tru";
}) {
	const daLuuTru = trangThai === "da-luu-tru";
	const choLuuTru = trangThai === "cho-luu-tru";
	return (
		<div
			className="flex flex-col gap-4 p-6"
			data-man="doc"
			data-trang-thai={trangThai}
		>
			<DauTrang
				phu={`${TRANG_MAU.loai} · Phiên bản ${BAN_DANG_DUNG.so} · duyệt ${BAN_DANG_DUNG.duyetLuc}`}
				ve="Tất cả trang"
			/>
			{daLuuTru ? (
				<Alert data-da-luu-tru="">
					<Icon icon={Archive} />
					<AlertTitle>Trang đã lưu trữ ngày {TRANG_MAU.luuTruLuc}</AlertTitle>
					<AlertDescription>
						Trang không còn hiện trong danh sách, tìm kiếm và trợ lý AI. Đề xuất
						khôi phục nếu trang cần dùng lại.
					</AlertDescription>
					<AlertAction placement="below">
						<Button size="sm" variant="outline">
							Đề xuất khôi phục
						</Button>
					</AlertAction>
				</Alert>
			) : null}
			<div className="flex flex-wrap items-center gap-2">
				{choLuuTru ? (
					<Badge variant="outline">Có đề xuất lưu trữ chờ duyệt</Badge>
				) : null}
				{daLuuTru ? null : (
					<Button size="sm" variant="outline">
						Sửa trang
					</Button>
				)}
				<Button size="sm" variant="outline">
					Lịch sử
				</Button>
				{daLuuTru ? null : (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button aria-label="Thêm" size="icon" variant="ghost">
								<Icon icon={OverflowMenuHorizontal} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							<DropdownMenuItem disabled={choLuuTru}>
								Đề xuất lưu trữ
							</DropdownMenuItem>
							{choLuuTru ? (
								<p className="px-2 pb-1.5 text-muted-foreground text-xs">
									Đã có một đề xuất lưu trữ chờ chủ trang duyệt.
								</p>
							) : null}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
			<Separator />
			<div className="max-w-3xl" translate="no">
				<MarkdownReader>{BAN_DANG_DUNG.noiDung}</MarkdownReader>
			</div>
			{trangThai === "hop-luu-tru" ? (
				<HopLyDo
					moTa="Chủ trang duyệt thì trang rời danh sách, tìm kiếm và trợ lý AI. Lịch sử và nội dung vẫn giữ nguyên."
					mo
					nutGui="Gửi đề xuất"
					tieuDe="Đề xuất lưu trữ trang"
				/>
			) : null}
		</div>
	);
}

export function DuyetDeXuat({ deXuat }: { deXuat: DeXuatMau }) {
	const laLuuTru = deXuat.loai === "luu-tru";
	const khoi = soSanh(BAN_DANG_DUNG.noiDung, PHIEN_BAN[2]?.noiDung ?? "");
	return (
		<div
			className="flex flex-col gap-4 p-6"
			data-man="duyet"
			data-loai={deXuat.loai}
		>
			<div className="flex flex-col gap-2">
				<Button className="w-fit" size="sm" variant="ghost">
					<Icon icon={ArrowLeft} />
					Chờ duyệt
				</Button>
				<PageShellTitle translate="no">{deXuat.trang}</PageShellTitle>
				<p className="text-muted-foreground text-sm">
					<span translate="no">{deXuat.nguoiDeXuat}</span> đề xuất lúc{" "}
					{deXuat.luc}
				</p>
			</div>
			{laLuuTru ? (
				<Alert>
					<Icon icon={Archive} />
					<AlertTitle>Đề xuất lưu trữ trang</AlertTitle>
					<AlertDescription>
						<span translate="no">{deXuat.lyDo}</span>
					</AlertDescription>
				</Alert>
			) : (
				<>
					<div>
						<Badge variant="secondary">
							Quay lại phiên bản {deXuat.tuPhienBan}
						</Badge>
					</div>
					<div className="max-w-3xl" translate="no">
						<DiffTrang
							dai={suKienDoi(khoi)}
							khoi={khoi}
							nhanBo="Bớt so với bản đang dùng"
							nhanDaiSo="Số và ngày đổi"
							nhanThem="Thêm so với bản đang dùng"
						/>
					</div>
				</>
			)}
			<div className="flex flex-wrap gap-2">
				<Button>{laLuuTru ? "Duyệt lưu trữ" : "Duyệt"}</Button>
				<Button variant="outline">Trả lại</Button>
			</div>
		</div>
	);
}

const NHAN_TRANG_THAI = {
	"da-duyet": { label: "Đã duyệt", tone: "success" },
	"tra-lai": { label: "Đã trả lại", tone: "error" },
	cu: { label: "Cũ", tone: "neutral" },
	cho: { label: "Chờ duyệt", tone: "warning" },
} as const;

export function DaXuLy() {
	const ds = DE_XUAT.filter((d) => d.trangThai !== "cho");
	return (
		<div className="flex flex-col gap-4 p-6" data-man="da-xu-ly">
			<ToggleGroup size="sm" type="single" value="da-xu-ly" variant="outline">
				<ToggleGroupItem value="cho">Đang chờ</ToggleGroupItem>
				<ToggleGroupItem value="da-xu-ly">Đã xử lý</ToggleGroupItem>
			</ToggleGroup>
			<div className="flex flex-col gap-2">
				{ds.map((d) => (
					<Item key={d.id} variant="outline">
						<ItemContent>
							<ItemTitle translate="no">{d.trang}</ItemTitle>
							<ItemDescription>
								<span translate="no">{d.nguoiDeXuat}</span> · {d.luc}
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<StatusIndicator
								label={NHAN_TRANG_THAI[d.trangThai].label}
								tone={NHAN_TRANG_THAI[d.trangThai].tone}
							/>
						</ItemActions>
					</Item>
				))}
			</div>
		</div>
	);
}

export function DanhSachDaLuuTru({ rong }: { rong: boolean }) {
	return (
		<div className="flex flex-col gap-4 p-6" data-man="da-luu-tru">
			<div className="flex flex-wrap items-center gap-2">
				<Button size="sm" variant="outline">
					Đơn vị
				</Button>
				<Button size="sm" variant="outline">
					Loại
				</Button>
				<Button aria-pressed size="sm" variant="secondary">
					<Icon icon={Archive} />
					Đã lưu trữ
				</Button>
			</div>
			{rong ? (
				<Empty border="solid">
					<EmptyHeader>
						<EmptyTitle>Chưa có trang nào đã lưu trữ</EmptyTitle>
						<EmptyDescription>
							Trang được lưu trữ sau khi chủ trang duyệt đề xuất lưu trữ sẽ hiện
							ở đây.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<SimpleTable
					columns={[
						{ id: "ten", header: "Trang" },
						{ id: "loai", header: "Loại" },
						{ id: "chu", header: "Chủ trang" },
						{ id: "luc", header: "Lưu trữ ngày" },
					]}
					surface="page"
				>
					{TRANG_DA_LUU_TRU.map((t) => (
						<SimpleTableRow key={t.slug}>
							<SimpleTableCell>
								<span className="font-medium" translate="no">
									{t.ten}
								</span>
							</SimpleTableCell>
							<SimpleTableCell>{t.loai}</SimpleTableCell>
							<SimpleTableCell>
								<span translate="no">{t.chuTrang}</span>
							</SimpleTableCell>
							<SimpleTableCell>{t.luuTruLuc}</SimpleTableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			)}
		</div>
	);
}
