"use client";

import Add from "@carbon/icons-react/es/Add";
import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import Book from "@carbon/icons-react/es/Book";
import Heading from "@carbon/icons-react/es/Heading";
import Information from "@carbon/icons-react/es/Information";
import LinkIcon from "@carbon/icons-react/es/Link";
import ListBulleted from "@carbon/icons-react/es/ListBulleted";
import ListNumbered from "@carbon/icons-react/es/ListNumbered";
import Redo from "@carbon/icons-react/es/Redo";
import Search from "@carbon/icons-react/es/Search";
import TableIcon from "@carbon/icons-react/es/Table";
import TextBold from "@carbon/icons-react/es/TextBold";
import TextItalic from "@carbon/icons-react/es/TextItalic";
import Undo from "@carbon/icons-react/es/Undo";
import Upload from "@carbon/icons-react/es/Upload";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Card, CardContent } from "@crm/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crm/ui/components/input-group";
import {
	MarkdownReader,
	type ReaderLink,
	ReaderToc,
	readerHeadings,
} from "@crm/ui/components/markdown-reader";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Separator } from "@crm/ui/components/separator";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { TableCell } from "@crm/ui/components/table";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { cn } from "@crm/ui/lib/utils";
import { memo, useState } from "react";
import {
	CHU_TRANG_CHON,
	DO_THI_CUC_BO,
	DON_VI,
	deXuatTheoPhamVi,
	LICH_SU,
	LIEN_KET_DEN,
	LOAI_TRANG,
	type LoaiTrang,
	nhanLoai,
	type PhamVi,
	SUC_KHOE,
	THAN_TRANG,
	THAN_TRANG_LUOT_1,
	THAN_TRANG_MOI,
	THEO_DOI,
	TOM_TAT,
	TRANG,
	TRANG_DANG_DOC,
	TRANG_MOI,
} from "./du-lieu";

const DOC_CHU = {
	calloutLabels: {
		note: "Ghi chú",
		tip: "Mẹo",
		important: "Quan trọng",
		warning: "Cần lưu ý",
		caution: "Thận trọng",
	},
	missingLabel: "Chưa có trang này",
	sourcesLabel: "Nguồn",
	sourceBackLabel: "Về chỗ trích",
};

const MUC_LUC = {
	dayDu: readerHeadings(THAN_TRANG),
	luot1: readerHeadings(THAN_TRANG_LUOT_1),
	moi: readerHeadings(THAN_TRANG_MOI),
};

const GOI_Y_SOAN = "Viết nội dung trang, hoặc dán từ Word.";

function timTrang(ten: string): ReaderLink | null {
	const t = TOM_TAT.get(ten);
	return t ? { title: ten, summary: t.summary, meta: t.meta } : null;
}

function boWikilink(chu: string): string {
	return chu.replace(
		/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g,
		(_, ten, nhan) => nhan ?? ten,
	);
}

function DoThiCucBo() {
	const { giua, lanCan } = DO_THI_CUC_BO;
	return (
		<section
			aria-label="Đồ thị cục bộ"
			className="flex flex-col gap-2"
			data-do-thi=""
		>
			<h4 className="font-medium text-sm">Quanh trang này</h4>
			<svg
				aria-hidden="true"
				className="w-full rounded-lg border"
				viewBox="0 0 300 195"
			>
				{lanCan.map((n) => (
					<line
						className={
							n.loai === "chưa có trang"
								? "stroke-border"
								: "stroke-muted-foreground"
						}
						key={`l-${n.ten}`}
						strokeDasharray={n.loai === "chưa có trang" ? "4 3" : undefined}
						x1={giua.x}
						x2={n.x}
						y1={giua.y}
						y2={n.y}
					/>
				))}
				{lanCan.map((n) => (
					<g key={n.ten}>
						<circle
							className={
								n.loai === "chưa có trang"
									? "fill-background stroke-muted-foreground"
									: "fill-muted-foreground"
							}
							cx={n.x}
							cy={n.y}
							r={6}
							strokeDasharray={n.loai === "chưa có trang" ? "2 2" : undefined}
						/>
						<text
							className="fill-muted-foreground text-[10px]"
							textAnchor="middle"
							x={n.x}
							y={n.y + 18}
						>
							{n.ten}
						</text>
					</g>
				))}
				<circle className="fill-primary" cx={giua.x} cy={giua.y} r={9} />
				<text
					className="fill-foreground font-medium text-[10px]"
					textAnchor="middle"
					x={giua.x}
					y={giua.y + 22}
				>
					{giua.ten}
				</text>
			</svg>
			<ul className="flex flex-col gap-0.5 text-muted-foreground text-xs">
				{lanCan.map((n) => (
					<li key={n.ten}>
						{n.ten} · {n.loai}
					</li>
				))}
			</ul>
		</section>
	);
}

export function SucKhoeKho() {
	return (
		<div
			className="flex min-w-0 max-w-3xl flex-1 flex-col gap-5 p-6"
			data-suc-khoe=""
		>
			<p className="text-muted-foreground text-sm">
				Việc phải làm của chủ trang, xếp theo mức cần xử lý. Danh sách này đi
				trước đồ thị toàn kho.
			</p>
			{SUC_KHOE.map((nhom) => (
				<section className="flex flex-col gap-2" key={nhom.id}>
					<h3 className="flex items-center gap-2 font-medium text-sm">
						{nhom.nhan}
						<Badge variant="outline">{nhom.trang.length}</Badge>
					</h3>
					<ul className="flex flex-col gap-1 text-sm">
						{nhom.trang.map((t) => (
							<li className="flex items-center gap-2" key={t}>
								<Icon icon={Book} />
								<span translate="no">{t}</span>
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}

export function KhongCoQuyen() {
	return (
		<div
			className="flex flex-1 items-center justify-center p-6"
			data-khong-co=""
		>
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Không tìm thấy trang</EmptyTitle>
					<EmptyDescription>
						Trang không tồn tại, hoặc bạn không có quyền xem. Hai trường hợp
						hiện giống nhau để không lộ trang bị hạn chế.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	);
}

export function NutDauKho({
	phamVi,
	onViet,
	onTaiNguon,
}: {
	phamVi: PhamVi;
	onViet: () => void;
	onTaiNguon: () => void;
}) {
	return (
		<>
			{phamVi === "day-du" ? (
				<Button onClick={onTaiNguon} variant="outline">
					<Icon icon={Upload} />
					Tải nguồn lên
				</Button>
			) : null}
			<Button onClick={onViet}>
				<Icon icon={Add} />
				Trang mới
			</Button>
		</>
	);
}

const COT_TRANG = {
	luot1: [
		{ id: "ten", header: "Trang" },
		{ id: "loai", header: "Loại" },
		{ id: "chu", header: "Chủ trang" },
		{ id: "don-vi", header: "Đơn vị" },
		{ id: "capnhat", header: "Cập nhật", align: "right" as const },
	],
	dayDu: [
		{ id: "ten", header: "Trang" },
		{ id: "loai", header: "Loại" },
		{ id: "giu", header: "Chủ · phó" },
		{ id: "pham", header: "Ai xem được" },
		{ id: "xacminh", header: "Xác minh đến" },
		{ id: "capnhat", header: "Cập nhật", align: "right" as const },
	],
};

function trangCoBanCho(phamVi: PhamVi): Set<string> {
	return new Set(deXuatTheoPhamVi(phamVi).map((d) => d.trang));
}

export function DanhSachTrang({
	phamVi,
	onMo,
}: {
	phamVi: PhamVi;
	onMo: () => void;
}) {
	const [loai, setLoai] = useState<LoaiTrang | null>(null);
	const hang = loai === null ? TRANG : TRANG.filter((t) => t.loai === loai);
	const luot1 = phamVi === "luot-1";
	const coBanCho = trangCoBanCho(phamVi);

	return (
		<div className="flex min-w-0 flex-1" data-pham-vi={phamVi}>
			<aside
				aria-label="Loại trang"
				className="hidden w-52 shrink-0 flex-col gap-1 border-r p-3 lg:flex"
			>
				<Button
					className={cn(
						"justify-between",
						loai === null && "bg-muted hover:bg-muted",
					)}
					onClick={() => setLoai(null)}
					variant="ghost"
				>
					Tất cả
					<span className="text-muted-foreground tabular-nums">
						{TRANG.length}
					</span>
				</Button>
				{LOAI_TRANG.map((n) => (
					<Button
						className={cn(
							"justify-between",
							loai === n.id && "bg-muted hover:bg-muted",
						)}
						key={n.id}
						onClick={() => setLoai(n.id)}
						variant="ghost"
					>
						{n.nhan}
						<span className="text-muted-foreground tabular-nums">
							{TRANG.filter((t) => t.loai === n.id).length}
						</span>
					</Button>
				))}
			</aside>
			<div className="flex min-w-0 flex-1 flex-col gap-3 p-6">
				{luot1 ? null : (
					<InputGroup className="max-w-md">
						<InputGroupAddon>
							<Icon icon={Search} />
						</InputGroupAddon>
						<InputGroupInput placeholder="Tìm trong tên và nội dung trang" />
					</InputGroup>
				)}
				<SimpleTable
					columns={luot1 ? COT_TRANG.luot1 : COT_TRANG.dayDu}
					surface="page"
				>
					{hang.map((t) => (
						<SimpleTableRow clickable key={t.id} onClick={onMo}>
							<TableCell className="font-medium">
								<span className="flex items-center gap-2">
									<span translate="no">{t.ten}</span>
									{coBanCho.has(t.ten) ? (
										<Badge variant="outline">Có bản chờ duyệt</Badge>
									) : null}
								</span>
							</TableCell>
							<TableCell>{nhanLoai(t.loai)}</TableCell>
							{luot1 ? (
								<>
									<TableCell translate="no">{t.chuTrang}</TableCell>
									<TableCell className="text-muted-foreground">
										{t.donVi ?? <EmptyCellValue />}
									</TableCell>
								</>
							) : (
								<>
									<TableCell translate="no">
										<span className="flex flex-col">
											<span>{t.chuTrang}</span>
											<span className="text-muted-foreground text-xs">
												{THEO_DOI.get(t.id)?.pho}
											</span>
										</span>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{t.pham}
									</TableCell>
									<TableCell className="tabular-nums">
										{THEO_DOI.get(t.id)?.quaHan ? (
											<Badge variant="outline">Quá hạn xác minh</Badge>
										) : (
											<span className="text-muted-foreground">
												{THEO_DOI.get(t.id)?.xacMinh}
											</span>
										)}
									</TableCell>
								</>
							)}
							<TableCell className="text-right text-muted-foreground tabular-nums">
								{t.duyetLuc}
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
		</div>
	);
}

function LichSuTrang() {
	const [khoiPhuc, setKhoiPhuc] = useState<number | null>(null);
	return (
		<section className="flex flex-col gap-2">
			<h4 className="font-medium text-sm">Lịch sử</h4>
			{khoiPhuc !== null ? (
				<p className="text-xs" data-khoi-phuc="" role="status">
					Đã tạo đề xuất khôi phục phiên bản {khoiPhuc}. Bản đang dùng chưa đổi
					cho tới khi được duyệt như mọi thay đổi khác.
				</p>
			) : null}
			<ol className="flex flex-col gap-3">
				{LICH_SU.map((l) => (
					<li className="flex flex-col gap-0.5 text-xs" key={l.ban}>
						<span className="font-medium">
							Phiên bản {l.ban}
							<span className="font-normal text-muted-foreground">
								{" "}
								· {l.khi}
							</span>
						</span>
						<span className="text-muted-foreground">{l.ai}</span>
						<span>{l.vi}</span>
						{l.ban < TRANG_DANG_DOC.phienBan ? (
							<Button
								className="w-fit"
								onClick={() => setKhoiPhuc(l.ban)}
								size="sm"
								variant="ghost"
							>
								Khôi phục bản này
							</Button>
						) : null}
					</li>
				))}
			</ol>
		</section>
	);
}

function TrangDanToi() {
	return (
		<section className="flex flex-col gap-2">
			<h4 className="font-medium text-sm">Trang dẫn tới đây</h4>
			<ul className="flex flex-col gap-1 text-xs">
				{LIEN_KET_DEN.map((l) => (
					<li className="flex flex-col gap-0.5" key={l.ten}>
						<span className="flex items-center gap-2">
							<Icon icon={Book} />
							<span className="underline underline-offset-2" translate="no">
								{l.ten}
							</span>
						</span>
						<span className="text-muted-foreground" translate="no">
							{boWikilink(l.doan)}
						</span>
					</li>
				))}
			</ul>
		</section>
	);
}

function noiDungDoc(phamVi: PhamVi, choLanDau: boolean) {
	if (choLanDau)
		return { trang: TRANG_MOI, than: THAN_TRANG_MOI, mucLuc: MUC_LUC.moi };
	if (phamVi === "luot-1")
		return {
			trang: TRANG_DANG_DOC,
			than: THAN_TRANG_LUOT_1,
			mucLuc: MUC_LUC.luot1,
		};
	return { trang: TRANG_DANG_DOC, than: THAN_TRANG, mucLuc: MUC_LUC.dayDu };
}

export function DocTrang({
	phamVi,
	choLanDau,
	onVe,
	onSua,
	onXemDeXuat,
}: {
	phamVi: PhamVi;
	choLanDau: boolean;
	onVe: () => void;
	onSua: () => void;
	onXemDeXuat: () => void;
}) {
	const luot1 = phamVi === "luot-1";
	const { trang: t, than, mucLuc } = noiDungDoc(phamVi, choLanDau);
	const soBanCho = choLanDau
		? 0
		: deXuatTheoPhamVi(phamVi).filter((d) => d.trang === t.ten).length;

	return (
		<div
			className="flex min-w-0 flex-1 flex-col gap-4 p-6 xl:flex-row"
			data-cho-lan-dau={choLanDau ? "" : undefined}
			data-pham-vi={phamVi}
		>
			<article className="flex min-w-0 max-w-3xl flex-1 flex-col gap-4">
				<Button className="w-fit" onClick={onVe} size="sm" variant="ghost">
					<Icon icon={ArrowLeft} />
					Tất cả trang
				</Button>
				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
						<span>{nhanLoai(t.loai)}</span>
						<span aria-hidden="true">·</span>
						{choLanDau ? (
							<span>Chưa có phiên bản đang dùng</span>
						) : (
							<>
								<span>Phiên bản {t.phienBan}</span>
								<span aria-hidden="true">·</span>
								<span>duyệt {t.duyetLuc}</span>
							</>
						)}
					</div>
					<h3 className="font-semibold text-xl" translate="no">
						{t.ten}
					</h3>
					{luot1 && soBanCho === 0 ? null : (
						<div className="flex flex-wrap items-center gap-2">
							{luot1 ? null : <Badge variant="outline">{t.pham}</Badge>}
							{soBanCho > 0 ? (
								<Badge variant="outline">Có {soBanCho} bản chờ duyệt</Badge>
							) : null}
						</div>
					)}
				</div>
				{choLanDau ? (
					<Alert data-cho-duyet-lan-dau="" role="status">
						<Icon icon={Information} />
						<AlertTitle>Trang này chưa hiện cho mọi người.</AlertTitle>
						<AlertDescription translate="no">
							Đang chờ {t.chuTrang} duyệt.
						</AlertDescription>
					</Alert>
				) : (
					<div className="flex gap-2">
						<Button onClick={onSua} size="sm" variant="outline">
							Sửa trang
						</Button>
						{soBanCho > 0 ? (
							<Button onClick={onXemDeXuat} size="sm" variant="ghost">
								Xem bản chờ duyệt
							</Button>
						) : null}
					</div>
				)}
				<Separator />
				<div translate="no">
					<MarkdownReader {...DOC_CHU} resolveLink={timTrang}>
						{than}
					</MarkdownReader>
				</div>
			</article>
			<aside className="flex w-full shrink-0 flex-col gap-5 xl:sticky xl:top-4 xl:w-72 xl:self-start">
				<ReaderToc headings={mucLuc} label="Trên trang này" />
				{luot1 ? null : <DoThiCucBo />}
				<section className="flex flex-col gap-2">
					<h4 className="font-medium text-sm">Chủ trang</h4>
					<p className="text-sm" translate="no">
						{t.chuTrang}
					</p>
					{t.donVi ? (
						<p className="text-muted-foreground text-xs" translate="no">
							{t.donVi}
						</p>
					) : null}
					<p className="text-muted-foreground text-xs">
						Duyệt mọi thay đổi của trang này
					</p>
				</section>
				{luot1 ? null : (
					<>
						<LichSuTrang />
						<TrangDanToi />
					</>
				)}
			</aside>
		</div>
	);
}

const NoiDungSoan = memo(function NoiDungSoan({
	than,
	onDoi,
}: {
	than: string;
	onDoi: (daDoi: boolean) => void;
}) {
	return (
		<div
			aria-describedby="goi-y-noi-dung"
			className="min-h-72"
			contentEditable
			data-o-soan=""
			onInput={() => onDoi(true)}
			suppressContentEditableWarning
			translate="no"
		>
			<MarkdownReader {...DOC_CHU}>{than}</MarkdownReader>
		</div>
	);
});

function ThanhCongCu() {
	const [kieuDoan, setKieuDoan] = useState("");
	const [kieuChu, setKieuChu] = useState<string[]>([]);
	const [danhSach, setDanhSach] = useState("");
	return (
		<div
			aria-label="Định dạng"
			className="flex items-center gap-1 overflow-x-auto"
			data-thanh-cong-cu=""
			role="toolbar"
		>
			<ToggleGroup
				aria-label="Tiêu đề"
				onValueChange={setKieuDoan}
				size="sm"
				spacing={1}
				type="single"
				value={kieuDoan}
			>
				<ToggleGroupItem aria-label="Tiêu đề 2" title="Tiêu đề 2" value="h2">
					<Icon icon={Heading} />2
				</ToggleGroupItem>
				<ToggleGroupItem aria-label="Tiêu đề 3" title="Tiêu đề 3" value="h3">
					<Icon icon={Heading} />3
				</ToggleGroupItem>
			</ToggleGroup>
			<Separator orientation="vertical" />
			<ToggleGroup
				aria-label="Kiểu chữ"
				onValueChange={setKieuChu}
				size="sm"
				spacing={1}
				type="multiple"
				value={kieuChu}
			>
				<ToggleGroupItem aria-label="Đậm" title="Đậm (⌘B)" value="dam">
					<Icon icon={TextBold} />
				</ToggleGroupItem>
				<ToggleGroupItem
					aria-label="Nghiêng"
					title="Nghiêng (⌘I)"
					value="nghieng"
				>
					<Icon icon={TextItalic} />
				</ToggleGroupItem>
			</ToggleGroup>
			<Separator orientation="vertical" />
			<ToggleGroup
				aria-label="Danh sách"
				onValueChange={setDanhSach}
				size="sm"
				spacing={1}
				type="single"
				value={danhSach}
			>
				<ToggleGroupItem
					aria-label="Danh sách số"
					title="Danh sách số"
					value="so"
				>
					<Icon icon={ListNumbered} />
				</ToggleGroupItem>
				<ToggleGroupItem
					aria-label="Danh sách chấm"
					title="Danh sách chấm"
					value="cham"
				>
					<Icon icon={ListBulleted} />
				</ToggleGroupItem>
			</ToggleGroup>
			<Separator orientation="vertical" />
			<Button aria-label="Bảng" size="icon-sm" title="Bảng" variant="ghost">
				<Icon icon={TableIcon} />
			</Button>
			<Button
				aria-label="Liên kết"
				size="icon-sm"
				title="Liên kết"
				variant="ghost"
			>
				<Icon icon={LinkIcon} />
			</Button>
			<Separator orientation="vertical" />
			<Button
				aria-label="Hoàn tác"
				size="icon-sm"
				title="Hoàn tác (⌘Z)"
				variant="ghost"
			>
				<Icon icon={Undo} />
			</Button>
			<Button
				aria-label="Làm lại"
				size="icon-sm"
				title="Làm lại (⇧⌘Z)"
				variant="ghost"
			>
				<Icon icon={Redo} />
			</Button>
		</div>
	);
}

export function SoanTrang({
	sua,
	onHuy,
	onGui,
}: {
	sua: boolean;
	onHuy: () => void;
	onGui: () => void;
}) {
	const goc = sua ? TRANG_DANG_DOC : TRANG_MOI;
	const [ten, setTen] = useState(goc.ten);
	const [loiTen, setLoiTen] = useState(false);
	const [daDoi, setDaDoi] = useState(false);
	const [dangGui, setDangGui] = useState(false);
	const chuaDoi = sua && !daDoi && ten === goc.ten;

	const gui = () => {
		if (ten.trim() === "") {
			setLoiTen(true);
			document.getElementById("ten-trang")?.focus();
			return;
		}
		setDangGui(true);
		window.setTimeout(onGui, 700);
	};

	return (
		<div
			className="flex min-w-0 max-w-3xl flex-1 flex-col gap-4 p-6"
			data-soan={sua ? "sua" : "moi"}
		>
			<h3 className="font-semibold text-lg">
				{sua ? "Sửa trang" : "Trang mới"}
			</h3>
			<Field data-invalid={loiTen || undefined}>
				<FieldLabel htmlFor="ten-trang">Tên trang</FieldLabel>
				<Input
					aria-invalid={loiTen || undefined}
					id="ten-trang"
					maxLength={160}
					onChange={(e) => {
						setTen(e.target.value);
						if (e.target.value.trim() !== "") setLoiTen(false);
					}}
					translate="no"
					value={ten}
				/>
				{loiTen ? <FieldError>Nhập tên trang.</FieldError> : null}
			</Field>
			<div className="grid gap-4 sm:grid-cols-3">
				<Field>
					<FieldLabel htmlFor="loai-trang">Loại trang</FieldLabel>
					<Select defaultValue={goc.loai}>
						<SelectTrigger id="loai-trang">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{LOAI_TRANG.map((n) => (
								<SelectItem key={n.id} value={n.id}>
									{n.nhan}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
				<Field>
					<FieldLabel htmlFor="don-vi">Đơn vị (tuỳ chọn)</FieldLabel>
					<Select defaultValue={DON_VI.find((d) => d.nhan === goc.donVi)?.id}>
						<SelectTrigger id="don-vi">
							<SelectValue placeholder="Chọn đơn vị" />
						</SelectTrigger>
						<SelectContent>
							{DON_VI.map((d) => (
								<SelectItem key={d.id} value={d.id}>
									{d.nhan}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
				<Field>
					<FieldLabel htmlFor="chu-trang">Chủ trang</FieldLabel>
					<Select defaultValue={sua ? "ha" : "ban"}>
						<SelectTrigger id="chu-trang">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{CHU_TRANG_CHON.map((c) => (
								<SelectItem key={c.id} value={c.id}>
									{c.nhan}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
			</div>
			<Field>
				<FieldLabel>Nội dung</FieldLabel>
				<FieldDescription id="goi-y-noi-dung">{GOI_Y_SOAN}</FieldDescription>
				<Card>
					<CardContent>
						<ThanhCongCu />
						<Separator />
						<NoiDungSoan
							onDoi={setDaDoi}
							than={sua ? THAN_TRANG_LUOT_1 : THAN_TRANG_MOI}
						/>
					</CardContent>
				</Card>
			</Field>
			<FieldDescription>
				Trang chỉ hiện với mọi người sau khi chủ trang duyệt.
			</FieldDescription>
			<div className="flex flex-wrap items-center gap-2">
				<Button disabled={dangGui || chuaDoi} onClick={gui}>
					{dangGui ? "Đang gửi…" : "Gửi duyệt"}
				</Button>
				<Button disabled={dangGui} onClick={onHuy} variant="outline">
					Huỷ
				</Button>
				{chuaDoi ? (
					<span className="text-muted-foreground text-xs">
						Chưa có thay đổi
					</span>
				) : null}
			</div>
		</div>
	);
}

export function KhoRong({
	phamVi,
	onViet,
}: {
	phamVi: PhamVi;
	onViet: () => void;
}) {
	const luot1 = phamVi === "luot-1";
	return (
		<div className="flex flex-1 items-center justify-center p-6">
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Icon icon={Book} />
					</EmptyMedia>
					<EmptyTitle>Chưa có trang nào</EmptyTitle>
					<EmptyDescription>
						{luot1
							? "Viết trang đầu tiên cho quy định, quy trình hay biểu mẫu của phòng mình."
							: "Viết trang đầu tiên, hoặc tải lên một quy định sẵn có để máy soạn thành trang cho bạn duyệt."}
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent layout="row">
					<Button onClick={onViet}>Viết trang đầu tiên</Button>
					{luot1 ? null : <Button variant="outline">Tải nguồn lên</Button>}
				</EmptyContent>
			</Empty>
		</div>
	);
}

export function DangTai() {
	return (
		<div aria-busy="true" className="flex flex-1 flex-col gap-3 p-6">
			<Skeleton className="h-8 w-full max-w-md" />
			{["a", "b", "c", "d", "e", "f"].map((k) => (
				<Skeleton className="h-9 w-full" key={k} />
			))}
		</div>
	);
}
