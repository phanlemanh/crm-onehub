"use client";

import DocumentBlank from "@carbon/icons-react/es/DocumentBlank";
import Upload from "@carbon/icons-react/es/Upload";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import Bot from "@crm/ui/components/icons/bot";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { cn } from "@crm/ui/lib/utils";
import { useState } from "react";
import { DE_XUAT, type DeXuatMau, NGUON, type NguonMau } from "./du-lieu";

const NHAN_TU = {
	may: "Máy soạn từ nguồn",
	nguoi: "Người sửa",
	soat: "Soát định kỳ",
} satisfies Record<DeXuatMau["tu"], string>;

const [DE_DAU] = DE_XUAT as [DeXuatMau, ...DeXuatMau[]];

export function ChoDuyet({ chonDau }: { chonDau: string }) {
	const [chon, setChon] = useState(chonDau);
	const [daXuLy, setDaXuLy] = useState<Record<string, "duyet" | "bo">>({});
	const conLai = DE_XUAT.filter((d) => daXuLy[d.id] === undefined);
	const dx = DE_XUAT.find((d) => d.id === chon) ?? DE_DAU;
	const ketQua = daXuLy[dx.id];

	return (
		<div className="flex min-w-0 flex-1 flex-col lg:flex-row">
			<ul
				aria-label="Bản chờ duyệt"
				className="flex shrink-0 flex-col border-b lg:w-80 lg:border-r lg:border-b-0"
			>
				{DE_XUAT.map((d) => (
					<li key={d.id}>
						<button
							aria-current={d.id === chon ? "true" : undefined}
							className={cn(
								"flex w-full flex-col gap-1 border-b px-4 py-3 text-left hover:bg-muted",
								d.id === chon && "bg-muted",
								daXuLy[d.id] !== undefined && "opacity-50",
							)}
							onClick={() => setChon(d.id)}
							type="button"
						>
							<span className="flex items-center gap-2 text-muted-foreground text-xs">
								{d.tu === "nguoi" ? null : <Icon icon={Bot} />}
								{NHAN_TU[d.tu]}
								<span className="ml-auto">{d.khi}</span>
							</span>
							<span className="font-medium text-sm" translate="no">
								{d.trang}
							</span>
							<span className="text-muted-foreground text-xs">{d.vi}</span>
							{d.matThuan ? (
								<Badge className="w-fit" variant="outline">
									Có mâu thuẫn
								</Badge>
							) : null}
						</button>
					</li>
				))}
				<li className="px-4 py-3 text-muted-foreground text-xs">
					Còn {conLai.length} bản chờ bạn
				</li>
			</ul>
			<section
				aria-label="Bản đang xem"
				className="flex min-w-0 max-w-3xl flex-1 flex-col gap-4 p-6"
			>
				<div className="flex flex-col gap-1">
					<span className="text-muted-foreground text-xs">
						{dx.ai} · {dx.khi}
					</span>
					<h3 className="font-semibold text-lg" translate="no">
						{dx.trang}
					</h3>
					<p className="text-sm">{dx.vi}</p>
				</div>
				{dx.nguon ? (
					<p className="flex items-center gap-2 text-muted-foreground text-xs">
						<Icon icon={DocumentBlank} />
						Theo
						<span
							className="text-foreground underline underline-offset-2"
							translate="no"
						>
							{dx.nguon}
						</span>
					</p>
				) : null}
				{dx.matThuan ? (
					<Alert>
						<Icon icon={WarningAlt} />
						<AlertTitle>Mâu thuẫn với bản đang dùng</AlertTitle>
						<AlertDescription>{dx.matThuan}</AlertDescription>
					</Alert>
				) : null}
				<div className="overflow-x-auto rounded-lg border font-mono text-xs">
					{dx.dong.map((d) => (
						<div
							className={cn(
								"flex gap-3 px-3 py-1.5",
								d.loai === "them" && "bg-muted font-medium",
								d.loai === "bo" && "text-muted-foreground line-through",
							)}
							key={`${dx.id}-${d.loai}-${d.chu}`}
						>
							<span aria-hidden="true" className="w-3 shrink-0 select-none">
								{d.loai === "them" ? "+" : d.loai === "bo" ? "−" : " "}
							</span>
							<span className="sr-only">
								{d.loai === "them" ? "Thêm" : d.loai === "bo" ? "Bỏ" : "Giữ"}
							</span>
							<span translate="no">{d.chu}</span>
						</div>
					))}
				</div>
				{ketQua ? (
					<p className="text-sm">
						{ketQua === "duyet"
							? "Đã duyệt. Trang lên phiên bản mới, và tác nhân trả lời theo bản này từ bây giờ."
							: "Đã bỏ. Máy sẽ không đề xuất lại đúng thay đổi này."}
					</p>
				) : (
					<div className="flex flex-wrap gap-2">
						<Button
							onClick={() => setDaXuLy((s) => ({ ...s, [dx.id]: "duyet" }))}
						>
							Duyệt và đăng
						</Button>
						<Button variant="outline">Sửa trước khi duyệt</Button>
						<Button
							onClick={() => setDaXuLy((s) => ({ ...s, [dx.id]: "bo" }))}
							variant="ghost"
						>
							Bỏ bản này
						</Button>
					</div>
				)}
			</section>
		</div>
	);
}

const TRANG_THAI_NGUON = {
	"dang-doc": { tone: "info", busy: true },
	"da-soan": { tone: "warning", busy: false },
	"da-duyet": { tone: "success", busy: false },
	"khong-doc-duoc": { tone: "error", busy: false },
} satisfies Record<NguonMau["trangThai"], { tone: StatusTone; busy: boolean }>;

const COT_NGUON = [
	{ id: "nguon", header: "Nguồn" },
	{ id: "nguoi", header: "Người tải" },
	{ id: "tinh-trang", header: "Tình trạng" },
	{ id: "luc", header: "Lúc", align: "right" as const },
];

export function DanhSachNguon() {
	return (
		<div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
			<div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center">
				<Icon icon={Upload} />
				<p className="font-medium text-sm">Kéo file vào đây, hoặc chọn file</p>
				<p className="max-w-md text-muted-foreground text-xs">
					PDF hoặc Word. Máy đọc file, tìm các trang liên quan và soạn bản đề
					xuất. Không trang nào đổi cho tới khi người giữ trang duyệt.
				</p>
				<Button className="mt-2" variant="outline">
					Chọn file
				</Button>
			</div>
			<SimpleTable columns={COT_NGUON} surface="page">
				{NGUON.map((n) => {
					const tt = TRANG_THAI_NGUON[n.trangThai];
					return (
						<SimpleTableRow key={n.id}>
							<TableCell>
								<span className="flex flex-col">
									<span className="font-medium" translate="no">
										{n.ten}
									</span>
									<span className="text-muted-foreground text-xs">
										{n.loai}
									</span>
								</span>
							</TableCell>
							<TableCell translate="no">{n.nguoiTai}</TableCell>
							<TableCell>
								<StatusIndicator
									busy={tt.busy}
									label={n.ghiChu}
									size="sm"
									tone={tt.tone}
								/>
							</TableCell>
							<TableCell className="text-right text-muted-foreground">
								{n.ngay}
							</TableCell>
						</SimpleTableRow>
					);
				})}
			</SimpleTable>
		</div>
	);
}
