"use client";

import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import { Button } from "@crm/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { Textarea } from "@crm/ui/components/textarea";
import { cn } from "@crm/ui/lib/utils";
import { LoaiMucTieuNhan, so } from "../ban-mau-okr/phan-chung";
import {
	cauDoc,
	diemChu,
	diemMucTieu,
	type KrChamMau,
	KY_CHAM,
	LUOI_DIEM,
	MT_CAM_KET,
	MT_THAM_VONG,
	type MucTieuChamMau,
} from "../khep-ky-okr/du-lieu";

const AN_DUOI_MD = "hidden md:table-cell";

const COT: SimpleTableColumn[] = [
	{ id: "ten", header: "Mục tiêu và KR" },
	{ id: "so", header: "Số", width: "w-48", className: AN_DUOI_MD },
	{ id: "goiY", header: "Gợi ý", width: "w-20", className: AN_DUOI_MD },
	{ id: "diem", header: "Điểm", width: "w-56", className: AN_DUOI_MD },
];

const DONG_CON = "bg-muted/30";

function giaTriCham(k: KrChamMau, v: number): string {
	if (k.kieu === "moc") return v >= 1 ? "Xong" : "Chưa xong";
	return k.donVi === "%" ? `${so(v)}%` : `${so(v)} ${k.donVi}`;
}

function DiemMucTieuO({ mt }: { mt: MucTieuChamMau }) {
	const diem = diemMucTieu(mt);
	const daCham = mt.kr.filter((k) => k.diem !== null).length;
	if (diem === null)
		return (
			<StatusIndicator
				label={`Đã chấm ${daCham}/${mt.kr.length} KR`}
				size="sm"
				tone="warning"
			/>
		);
	return (
		<div className="flex flex-col gap-1">
			<span className="font-medium text-sm tabular-nums">
				Điểm {diemChu(diem)}
			</span>
			<span className="text-muted-foreground text-xs">
				{cauDoc(mt.loai, diem)}
			</span>
		</div>
	);
}

function ODiem({ k }: { k: KrChamMau }) {
	if (!k.suaDuoc)
		return (
			<span className="text-muted-foreground text-xs">
				{k.diem === null ? "Chờ người phụ trách chấm" : diemChu(k.diem)}
			</span>
		);
	return (
		<Select defaultValue={String(k.diem ?? k.diemGoiY)}>
			<SelectTrigger aria-label={`Điểm cho «${k.ten}»`} size="sm">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{LUOI_DIEM.map((d) => (
					<SelectItem key={d} value={String(d)}>
						{diemChu(d)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function HangKrCham({ k, thuTu }: { k: KrChamMau; thuTu: number }) {
	const soDong = (
		<span className="flex flex-col gap-0.5 tabular-nums">
			<span translate="no">
				{k.kieu === "moc"
					? "Mốc"
					: `${giaTriCham(k, k.khoiDiem)} → ${giaTriCham(k, k.dich)}`}
			</span>
			<span className="text-muted-foreground text-xs">
				{k.kieu === "moc" ? "Kết quả" : "Số chốt"} {giaTriCham(k, k.soChot)}
			</span>
		</span>
	);
	return (
		<SimpleTableRow className={DONG_CON} data-kr-cham={k.id}>
			<SimpleTableCell className="whitespace-normal py-2.5 align-top">
				<div className="flex min-w-0 gap-3">
					<span className="w-8 shrink-0 pt-px text-muted-foreground text-xs tabular-nums">
						KR{thuTu}
					</span>
					<div className="flex min-w-0 flex-col gap-1">
						<span translate="no">{k.ten}</span>
						<span className="text-muted-foreground text-xs">
							Phụ trách <span translate="no">{k.phuTrach.ten}</span>
						</span>
						<div className="flex flex-col gap-2 pt-1 md:hidden">
							{soDong}
							<span className="text-muted-foreground text-xs">
								Gợi ý {diemChu(k.diemGoiY)}
							</span>
							<ODiem k={k} />
						</div>
					</div>
				</div>
			</SimpleTableCell>
			<SimpleTableCell className={cn(AN_DUOI_MD, "py-2.5 align-top")}>
				{soDong}
			</SimpleTableCell>
			<SimpleTableCell
				className={cn(AN_DUOI_MD, "py-2.5 align-top tabular-nums")}
			>
				{diemChu(k.diemGoiY)}
			</SimpleTableCell>
			<SimpleTableCell className={cn(AN_DUOI_MD, "py-2 align-top")}>
				<ODiem k={k} />
			</SimpleTableCell>
		</SimpleTableRow>
	);
}

function KhoiCham({ mt }: { mt: MucTieuChamMau }) {
	return (
		<SimpleTable className="table-fixed" columns={COT}>
			<SimpleTableRow data-muc-tieu-cham={mt.id}>
				<SimpleTableCell className="whitespace-normal py-3 align-top">
					<div className="flex min-w-0 flex-col gap-1">
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
							<span className="font-medium" translate="no">
								{mt.ten}
							</span>
							<LoaiMucTieuNhan loai={mt.loai} />
						</div>
						<span className="text-muted-foreground text-xs">
							Phụ trách <span translate="no">{mt.phuTrach.ten}</span> ·{" "}
							{mt.kr.length} KR
						</span>
						<div className="pt-1 md:hidden">
							<DiemMucTieuO mt={mt} />
						</div>
					</div>
				</SimpleTableCell>
				<SimpleTableCell className={AN_DUOI_MD} />
				<SimpleTableCell className={AN_DUOI_MD} />
				<SimpleTableCell className={cn(AN_DUOI_MD, "py-3 align-top")}>
					<DiemMucTieuO mt={mt} />
				</SimpleTableCell>
			</SimpleTableRow>
			{mt.kr.map((k, i) => (
				<HangKrCham k={k} key={k.id} thuTu={i + 1} />
			))}
			<SimpleTableRow className={DONG_CON} data-hang-hoc={mt.id}>
				<SimpleTableCell className="whitespace-normal py-3" colSpan={4}>
					<div className="flex flex-col gap-3 md:pl-11">
						<Field data-o-hoc>
							<FieldLabel htmlFor={`hoc-${mt.id}`}>Điều học được</FieldLabel>
							<Textarea
								defaultValue={mt.dieuHocDuoc}
								id={`hoc-${mt.id}`}
								placeholder="Điều gì kỳ sau nên làm khác…"
								rows={2}
								translate="no"
							/>
							<FieldDescription>
								Ghi một hai câu cho người đặt mục tiêu kỳ sau đọc.
							</FieldDescription>
						</Field>
						<div className="flex flex-wrap gap-2">
							<Button size="sm" variant="outline">
								Lưu điều học được
							</Button>
							<Button data-nut="mang-sang" size="sm" variant="ghost">
								Mang sang {KY_CHAM.ke}
								<Icon data-icon="inline-end" icon={ArrowRight} />
							</Button>
						</div>
					</div>
				</SimpleTableCell>
			</SimpleTableRow>
		</SimpleTable>
	);
}

export function ChamDiemMau() {
	return (
		<div className="flex flex-col gap-6" data-ban-cham>
			<KhoiCham mt={MT_CAM_KET} />
			<KhoiCham mt={MT_THAM_VONG} />
		</div>
	);
}
