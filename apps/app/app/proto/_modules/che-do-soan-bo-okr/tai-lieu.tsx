"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { InputGroup, InputGroupInput } from "@crm/ui/components/input-group";
import { KaraMark } from "@crm/ui/components/kara";
import { Separator } from "@crm/ui/components/separator";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { Textarea } from "@crm/ui/components/textarea";
import type { DongKr, DongMucTieu } from "./du-lieu";

const CHU = {
	nhap: "Nháp",
	congBo: "Đã công bố",
	tenMt: "Tên mục tiêu",
	goMt: "Gõ mục tiêu — Enter để xuống dòng KR",
	viSao: "Vì sao bây giờ (không bắt buộc)",
	goKr: "Gõ KR — Tab sang số",
	themKr: "Thêm KR",
	phimKr: "Enter",
	themMt: "Thêm mục tiêu",
	khoiDiem: "Khởi điểm",
	dich: "Đích",
	donViDo: "Đơn vị",
	khoaSo: "Số của mục tiêu đã công bố sửa ở ngăn KR",
	chuaLuu: "Chưa lưu — thiếu đích",
	daLuu: "Đã lưu nháp",
	theoKara: "đổi theo Kara",
	nhoKara: "Nhờ Kara soạn nháp",
	nhoKaraMoTa:
		"Mở cuộc soạn: Kara đọc trang chiến lược và đề nghị một bộ để bạn quyết từng dòng.",
	trong:
		"Bộ OKR của quý này chưa có mục tiêu nào. Gõ mục tiêu đầu tiên ngay dưới đây.",
} as const;

function OSo({ kr, khoa }: { kr: DongKr; khoa: boolean }) {
	return (
		<div className="flex flex-wrap items-center gap-2" data-o-so={kr.id}>
			<InputGroup className="w-24">
				<InputGroupInput
					aria-label={CHU.khoiDiem}
					defaultValue={kr.khoiDiem}
					inputMode="decimal"
					disabled={khoa}
				/>
			</InputGroup>
			<span className="text-muted-foreground text-sm" aria-hidden>
				→
			</span>
			<InputGroup className="w-24">
				<InputGroupInput
					aria-label={CHU.dich}
					defaultValue={kr.dich}
					inputMode="decimal"
					disabled={khoa}
				/>
			</InputGroup>
			<InputGroup className="w-28">
				<InputGroupInput
					aria-label={CHU.donViDo}
					defaultValue={kr.donViDo}
					disabled={khoa}
				/>
			</InputGroup>
			<Button variant="outline" size="sm" type="button" disabled={khoa}>
				<span translate="no">{kr.nguoi}</span>
			</Button>
		</div>
	);
}

function DongKrSoan({
	kr,
	thuTu,
	khoa,
}: {
	kr: DongKr;
	thuTu: number;
	khoa: boolean;
}) {
	const thieu = kr.dich === "";
	return (
		<li className="flex flex-col gap-2 border-l py-1 pl-4" data-dong-kr={kr.id}>
			<div className="flex items-start gap-2">
				<span className="shrink-0 whitespace-nowrap pt-0.5 text-muted-foreground text-sm tabular-nums">
					KR {thuTu}
				</span>
				<Textarea
					variant="composer"
					size="composer"
					rows={1}
					aria-label={`KR ${thuTu}`}
					placeholder={CHU.goKr}
					defaultValue={kr.ten}
					disabled={khoa}
					translate="no"
				/>
			</div>
			<div className="flex flex-wrap items-center gap-3 pl-9">
				<OSo kr={kr} khoa={khoa} />
				{kr.theoKara ? (
					<span className="flex items-center gap-1 text-muted-foreground text-xs">
						<KaraMark />
						{CHU.theoKara}
					</span>
				) : null}
				{thieu ? (
					<StatusIndicator tone="warning" size="sm" label={CHU.chuaLuu} />
				) : null}
			</div>
		</li>
	);
}

function KhoiMucTieu({
	mt,
	noi,
	chiXem,
}: {
	mt: DongMucTieu;
	noi?: boolean;
	chiXem?: boolean;
}) {
	const khoa = mt.trangThai === "cong-bo" || chiXem === true;
	return (
		<section
			className="flex flex-col gap-3"
			data-dong-mt={mt.id}
			data-noi={noi ? "" : undefined}
			aria-label={mt.ten || CHU.tenMt}
		>
			<div className="flex flex-wrap items-center gap-2">
				{khoa ? (
					<StatusIndicator tone="success" size="sm" label={CHU.congBo} />
				) : (
					<StatusIndicator tone="neutral" size="sm" label={CHU.nhap} />
				)}
				<Badge variant="outline">{mt.loai}</Badge>
				{mt.trangThai === "cong-bo" && !chiXem ? (
					<span className="text-muted-foreground text-xs">{CHU.khoaSo}</span>
				) : null}
			</div>
			<Textarea
				variant="composer"
				size="composer"
				rows={1}
				aria-label={CHU.tenMt}
				placeholder={CHU.goMt}
				defaultValue={mt.ten}
				translate="no"
				disabled={chiXem}
				autoFocus={mt.dangGo && mt.ten === ""}
			/>
			<Textarea
				variant="composer"
				size="composer"
				rows={1}
				aria-label={CHU.viSao}
				placeholder={CHU.viSao}
				defaultValue={mt.viSao}
				translate="no"
				disabled={chiXem}
			/>
			{mt.kr.length > 0 ? (
				<ol className="flex flex-col gap-2">
					{mt.kr.map((kr, i) => (
						<DongKrSoan key={kr.id} kr={kr} thuTu={i + 1} khoa={khoa} />
					))}
				</ol>
			) : null}
			{khoa ? null : (
				<Button variant="ghost" size="sm" type="button" className="w-fit">
					{CHU.themKr}
					<Badge variant="mono">{CHU.phimKr}</Badge>
				</Button>
			)}
		</section>
	);
}

export function TaiLieuBo({
	muc,
	noi,
	trong,
	chiXem,
}: {
	muc: DongMucTieu[];
	noi?: string;
	trong?: boolean;
	chiXem?: boolean;
}) {
	return (
		<div className="flex flex-col gap-6" data-tai-lieu-bo="">
			{trong ? (
				<p className="text-muted-foreground text-sm">{CHU.trong}</p>
			) : null}
			{muc.map((mt, i) => (
				<div key={mt.id} className="flex flex-col gap-6">
					{i > 0 ? <Separator /> : null}
					<KhoiMucTieu mt={mt} noi={noi === mt.id} chiXem={chiXem} />
				</div>
			))}
			{chiXem ? null : <Separator />}
			{chiXem ? null : (
				<div className="flex flex-wrap items-center gap-2">
					<Button variant="ghost" size="sm" type="button">
						{CHU.themMt}
					</Button>
					{trong ? (
						<Button
							variant="ghost"
							size="sm"
							type="button"
							data-nut="nho-kara-soan"
						>
							<KaraMark />
							{CHU.nhoKara}
						</Button>
					) : null}
				</div>
			)}
			{trong ? (
				<p className="text-muted-foreground text-xs">{CHU.nhoKaraMoTa}</p>
			) : null}
		</div>
	);
}
