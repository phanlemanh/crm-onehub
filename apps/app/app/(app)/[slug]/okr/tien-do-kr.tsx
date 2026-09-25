"use client";

import { Badge } from "@crm/ui/components/badge";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Progress } from "@crm/ui/components/progress";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import {
	type LoaiMucTieu,
	type TinhTrang,
	type TrangThaiMucTieu,
	tinhTrang,
} from "@crm/validation/okr-muc-tieu";
import { okrMessages } from "@/lib/messages/okr";

const TONE_TINH_TRANG = {
	"dung-nhip": "success",
	"cham-nhip": "warning",
	truot: "error",
	"chua-co-ky-vong": "neutral",
} satisfies Record<TinhTrang, StatusTone>;

const TONE_TRANG_THAI = {
	nhap: "neutral",
	"cong-bo": "success",
	"da-bo": "neutral",
} satisfies Record<TrangThaiMucTieu, StatusTone>;

export function NhanTinhTrang({
	progress,
	expected,
	kind,
	laMoc = false,
}: {
	progress: number;
	expected: number | null;
	kind: LoaiMucTieu;
	laMoc?: boolean;
}) {
	const m = okrMessages(useLocale());
	if (laMoc)
		return progress >= 100 ? (
			<StatusIndicator size="sm" tone="success" label={m.moc.daXong} />
		) : (
			<StatusIndicator size="sm" tone="neutral" label={m.moc.dangCho} />
		);
	const t = tinhTrang(progress, expected, kind);
	return (
		<StatusIndicator
			size="sm"
			tone={TONE_TINH_TRANG[t]}
			label={m.tinhTrang[t]}
			data-tinh-trang={t}
		/>
	);
}

export function TienDoKr({
	ten,
	progress,
	expected,
	kind,
	laMoc = false,
}: {
	ten: string;
	progress: number;
	expected: number | null;
	kind: LoaiMucTieu;
	laMoc?: boolean;
}) {
	const m = okrMessages(useLocale());
	return (
		<div className="flex min-w-0 flex-col gap-1.5">
			<div className="flex items-center gap-2">
				<Progress value={progress} aria-label={m.tienDoCua(ten, progress)} />
				<span className="text-xs tabular-nums">{progress}%</span>
			</div>
			<NhanTinhTrang
				progress={progress}
				expected={expected}
				kind={kind}
				laMoc={laMoc}
			/>
		</div>
	);
}

export function NhanTrangThai({ status }: { status: TrangThaiMucTieu }) {
	const m = okrMessages(useLocale());
	return (
		<Badge variant={status === "cong-bo" ? "secondary" : "outline"}>
			{m.trangThai[status]}
		</Badge>
	);
}

export function ChamTrangThai({ status }: { status: TrangThaiMucTieu }) {
	const m = okrMessages(useLocale());
	return (
		<StatusIndicator
			size="sm"
			tone={TONE_TRANG_THAI[status]}
			label={m.trangThai[status]}
		/>
	);
}
