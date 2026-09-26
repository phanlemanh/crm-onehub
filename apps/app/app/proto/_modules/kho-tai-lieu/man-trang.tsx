"use client";

import Add from "@carbon/icons-react/es/Add";
import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import Book from "@carbon/icons-react/es/Book";
import Search from "@carbon/icons-react/es/Search";
import Upload from "@carbon/icons-react/es/Upload";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
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
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crm/ui/components/tabs";
import { Textarea } from "@crm/ui/components/textarea";
import { cn } from "@crm/ui/lib/utils";
import { useState } from "react";
import {
	LICH_SU,
	LIEN_KET_DEN,
	NHOM,
	type Nhom,
	nhanNhom,
	THAN_TRANG,
	TOM_TAT,
	TRANG,
	TRANG_DANG_DOC,
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

const MUC_LUC = readerHeadings(THAN_TRANG);

function timTrang(ten: string): ReaderLink | null {
	const t = TOM_TAT.get(ten);
	return t ? { title: ten, summary: t.summary, meta: t.meta } : null;
}

export function NutDauKho({
	onViet,
	onTaiNguon,
}: {
	onViet: () => void;
	onTaiNguon: () => void;
}) {
	return (
		<>
			<Button onClick={onTaiNguon} variant="outline">
				<Icon icon={Upload} />
				Tải nguồn lên
			</Button>
			<Button onClick={onViet}>
				<Icon icon={Add} />
				Trang mới
			</Button>
		</>
	);
}

const COT_TRANG = [
	{ id: "ten", header: "Trang" },
	{ id: "nhom", header: "Nhóm" },
	{ id: "giu", header: "Người giữ trang" },
	{ id: "pham", header: "Ai xem được" },
	{ id: "capnhat", header: "Cập nhật", align: "right" as const },
];

export function DanhSachTrang({ onMo }: { onMo: () => void }) {
	const [nhom, setNhom] = useState<Nhom | null>(null);
	const hang = nhom === null ? TRANG : TRANG.filter((t) => t.nhom === nhom);

	return (
		<div className="flex min-w-0 flex-1">
			<aside
				aria-label="Nhóm tài liệu"
				className="hidden w-52 shrink-0 flex-col gap-1 border-r p-3 lg:flex"
			>
				<Button
					className={cn(
						"justify-between",
						nhom === null && "bg-muted hover:bg-muted",
					)}
					onClick={() => setNhom(null)}
					variant="ghost"
				>
					Tất cả
					<span className="text-muted-foreground tabular-nums">
						{TRANG.length}
					</span>
				</Button>
				{NHOM.map((n) => (
					<Button
						className={cn(
							"justify-between",
							nhom === n.id && "bg-muted hover:bg-muted",
						)}
						key={n.id}
						onClick={() => setNhom(n.id)}
						variant="ghost"
					>
						{n.nhan}
						<span className="text-muted-foreground tabular-nums">
							{TRANG.filter((t) => t.nhom === n.id).length}
						</span>
					</Button>
				))}
			</aside>
			<div className="flex min-w-0 flex-1 flex-col gap-3 p-6">
				<InputGroup className="max-w-md">
					<InputGroupAddon>
						<Icon icon={Search} />
					</InputGroupAddon>
					<InputGroupInput placeholder="Tìm trong tên và nội dung trang" />
				</InputGroup>
				<SimpleTable columns={COT_TRANG} surface="page">
					{hang.map((t) => (
						<SimpleTableRow clickable key={t.id} onClick={onMo}>
							<TableCell className="font-medium">
								<span className="flex items-center gap-2">
									<span translate="no">{t.ten}</span>
									{t.coDeXuat ? (
										<Badge variant="outline">Có bản chờ duyệt</Badge>
									) : null}
								</span>
							</TableCell>
							<TableCell>{nhanNhom(t.nhom)}</TableCell>
							<TableCell translate="no">{t.nguoiGiu}</TableCell>
							<TableCell className="text-muted-foreground">{t.pham}</TableCell>
							<TableCell className="text-right text-muted-foreground tabular-nums">
								{t.capNhat}
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
		</div>
	);
}

export function DocTrang({
	onVe,
	onXemDeXuat,
}: {
	onVe: () => void;
	onXemDeXuat: () => void;
}) {
	const t = TRANG_DANG_DOC;
	return (
		<div className="flex min-w-0 flex-1 flex-col gap-4 p-6 xl:flex-row">
			<article className="flex min-w-0 max-w-3xl flex-1 flex-col gap-4">
				<Button className="w-fit" onClick={onVe} size="sm" variant="ghost">
					<Icon icon={ArrowLeft} />
					Tất cả trang
				</Button>
				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
						<span>{nhanNhom(t.nhom)}</span>
						<span aria-hidden="true">·</span>
						<span>Phiên bản {t.phienBan}</span>
						<span aria-hidden="true">·</span>
						<span>Hiệu lực từ 01/07/2026</span>
					</div>
					<h3 className="font-semibold text-xl" translate="no">
						{t.ten}
					</h3>
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="outline">{t.pham}</Badge>
						<Badge variant="outline">Có 1 bản chờ duyệt</Badge>
					</div>
				</div>
				<div className="flex gap-2">
					<Button size="sm" variant="outline">
						Sửa trang
					</Button>
					<Button onClick={onXemDeXuat} size="sm" variant="ghost">
						Xem bản chờ duyệt
					</Button>
				</div>
				<Separator />
				<div translate="no">
					<MarkdownReader {...DOC_CHU} resolveLink={timTrang}>
						{THAN_TRANG}
					</MarkdownReader>
				</div>
			</article>
			<aside className="flex w-full shrink-0 flex-col gap-5 xl:sticky xl:top-4 xl:w-72 xl:self-start">
				<ReaderToc headings={MUC_LUC} label="Trên trang này" />
				<section className="flex flex-col gap-2">
					<h4 className="font-medium text-sm">Người giữ trang</h4>
					<p className="text-sm" translate="no">
						{t.nguoiGiu}
					</p>
					<p className="text-muted-foreground text-xs">
						Duyệt mọi thay đổi của trang này
					</p>
				</section>
				<section className="flex flex-col gap-2">
					<h4 className="font-medium text-sm">Lịch sử</h4>
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
							</li>
						))}
					</ol>
				</section>
				<section className="flex flex-col gap-2">
					<h4 className="font-medium text-sm">Trang dẫn tới đây</h4>
					<ul className="flex flex-col gap-1 text-xs">
						{LIEN_KET_DEN.map((l) => (
							<li className="flex items-center gap-2" key={l}>
								<Icon icon={Book} />
								<span className="underline underline-offset-2" translate="no">
									{l}
								</span>
							</li>
						))}
					</ul>
				</section>
			</aside>
		</div>
	);
}

export function SoanTrang({ onHuy }: { onHuy: () => void }) {
	const [than, setThan] = useState(
		"## Mục đích\n\nVì sao có quy định này. Liên quan tới [[Hợp đồng hợp tác mẫu]].\n\n> [!NOTE]\n> Ghi chú hiện thành hộp riêng.\n\n## Các bước\n\n1. ",
	);
	return (
		<div className="flex min-w-0 max-w-3xl flex-1 flex-col gap-4 p-6">
			<h3 className="font-semibold text-lg">Trang mới</h3>
			<Field>
				<FieldLabel htmlFor="ten-trang">Tên trang</FieldLabel>
				<Input
					defaultValue="Tiếp nhận hồ sơ cá nhân mới"
					id="ten-trang"
					translate="no"
				/>
			</Field>
			<div className="grid gap-4 sm:grid-cols-3">
				<Field>
					<FieldLabel>Nhóm</FieldLabel>
					<Select defaultValue="quy-trinh">
						<SelectTrigger aria-label="Nhóm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{NHOM.map((n) => (
								<SelectItem key={n.id} value={n.id}>
									{n.nhan}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
				<Field>
					<FieldLabel>Ai xem được</FieldLabel>
					<Select defaultValue="cong-ty">
						<SelectTrigger aria-label="Ai xem được">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="cong-ty">Toàn công ty</SelectItem>
							<SelectItem value="bo-phan">Chỉ bộ phận của tôi</SelectItem>
						</SelectContent>
					</Select>
				</Field>
				<Field>
					<FieldLabel>Người duyệt</FieldLabel>
					<Select defaultValue="vinh">
						<SelectTrigger aria-label="Người duyệt">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="vinh">Lê Quang Vinh</SelectItem>
							<SelectItem value="ha">Nguyễn Thu Hà</SelectItem>
						</SelectContent>
					</Select>
				</Field>
			</div>
			<Tabs defaultValue="viet">
				<TabsList>
					<TabsTrigger value="viet">Viết</TabsTrigger>
					<TabsTrigger value="xem">Xem trước</TabsTrigger>
				</TabsList>
				<TabsContent value="viet">
					<Textarea
						aria-label="Nội dung trang"
						className="min-h-72 font-mono"
						onChange={(e) => setThan(e.target.value)}
						translate="no"
						value={than}
					/>
				</TabsContent>
				<TabsContent className="min-h-72 rounded-lg border p-4" value="xem">
					<div translate="no">
						<MarkdownReader {...DOC_CHU} resolveLink={timTrang}>
							{than}
						</MarkdownReader>
					</div>
				</TabsContent>
			</Tabs>
			<FieldDescription>
				Trang chỉ hiện với mọi người sau khi người duyệt đồng ý.
			</FieldDescription>
			<div className="flex gap-2">
				<Button>Gửi duyệt</Button>
				<Button variant="outline">Lưu nháp</Button>
				<Button onClick={onHuy} variant="ghost">
					Huỷ
				</Button>
			</div>
		</div>
	);
}

export function KhoRong({ onViet }: { onViet: () => void }) {
	return (
		<div className="flex flex-1 items-center justify-center p-6">
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Icon icon={Book} />
					</EmptyMedia>
					<EmptyTitle>Chưa có trang nào</EmptyTitle>
					<EmptyDescription>
						Viết trang đầu tiên, hoặc tải lên một quy định sẵn có để máy soạn
						thành trang cho bạn duyệt.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent layout="row">
					<Button onClick={onViet}>Viết trang đầu tiên</Button>
					<Button variant="outline">Tải nguồn lên</Button>
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
