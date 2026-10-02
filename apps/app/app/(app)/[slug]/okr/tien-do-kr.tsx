"use client";

import { Badge } from "@crm/ui/components/badge";
import { useLocale, useMessages } from "@crm/ui/components/locale-provider";
import {
	type NhipOkr,
	PaceIndicator,
	TONE_NHIP,
} from "@crm/ui/components/okr-status";
import { Progress } from "@crm/ui/components/progress";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import {
	type LoaiMucTieu,
	type TrangThaiMucTieu,
	tinhTrang,
} from "@crm/validation/okr-muc-tieu";
import type { ReactNode } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";

const TONE_TRANG_THAI = {
	nhap: "neutral",
	"cho-duyet": "warning",
	"cong-bo": "success",
	"da-bo": "neutral",
} satisfies Record<TrangThaiMucTieu, StatusTone>;

export function nhipCua(
	progress: number,
	expected: number | null,
	kind: LoaiMucTieu,
	laMoc: boolean,
): NhipOkr {
	if (laMoc) return progress >= 100 ? "moc-xong" : "moc-chua";
	return tinhTrang(progress, expected, kind);
}

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
	return (
		<PaceIndicator pace={nhipCua(progress, expected, kind, laMoc)} size="sm" />
	);
}

export function kyVongCo(expected: number | null) {
	return expected !== null && expected > 0 ? expected : null;
}

export function ThanhTienDo({
	ten,
	progress,
	expected,
}: {
	ten: string;
	progress: number;
	expected: number | null;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const mt = okrToanCanhMessages(locale);
	const vach = kyVongCo(expected);
	return (
		<Progress
			expected={vach}
			value={progress}
			valueText={
				vach === null
					? m.tienDoCua(ten, progress)
					: mt.tienDoLeRa(ten, String(progress), String(vach))
			}
			variant="neutral"
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
	return (
		<div className="flex min-w-0 flex-col gap-1.5">
			<div className="flex items-center gap-2">
				<ThanhTienDo
					expected={laMoc ? null : expected}
					progress={progress}
					ten={ten}
				/>
				<span className="text-xs tabular-nums">{progress}%</span>
			</div>
			<NhanTinhTrang
				expected={expected}
				kind={kind}
				laMoc={laMoc}
				progress={progress}
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

function NhipGon({ pace }: { pace: NhipOkr }) {
	const msg = useMessages().okr;
	const nhan = {
		"dung-nhip": msg.dungNhip,
		"cham-nhip": msg.chamNhip,
		truot: msg.truot,
		"chua-co-ky-vong": msg.chuaCoKyVong,
		"moc-xong": msg.mocXong,
		"moc-chua": msg.mocChua,
	} satisfies Record<NhipOkr, string>;
	return (
		<StatusIndicator label={nhan[pace]} size="sm" tone={TONE_NHIP[pace]} />
	);
}

export function TienDoGon({
	ten,
	dong,
	progress,
	expected,
	kind,
	laMoc = false,
	tren,
}: {
	ten: string;
	dong: string;
	progress: number;
	expected: number | null;
	kind: LoaiMucTieu;
	laMoc?: boolean;
	tren?: ReactNode;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-1.5" data-o-tien-do>
			{tren}
			<div className="flex items-baseline justify-between gap-3 text-xs">
				{dong ? (
					<span className="min-w-0 truncate tabular-nums" translate="no">
						{dong}
					</span>
				) : (
					<span />
				)}
				<span className="tabular-nums">{progress}%</span>
			</div>
			<ThanhTienDo
				expected={laMoc ? null : expected}
				progress={progress}
				ten={ten}
			/>
			<NhipGon pace={nhipCua(progress, expected, kind, laMoc)} />
		</div>
	);
}

export function TienDoMucTieu({
	ten,
	progress,
	expected,
	kind,
	soKr,
}: {
	ten: string;
	progress: number;
	expected: number | null;
	kind: LoaiMucTieu;
	soKr: number;
}) {
	const m = okrMessages(useLocale()).khoiMucTieu;
	if (soKr === 0)
		return (
			<span className="text-muted-foreground text-xs" data-o-tien-do>
				{m.chuaCoKrDeTinh}
			</span>
		);
	return (
		<div className="flex min-w-0 flex-col gap-1.5" data-o-tien-do>
			<div className="flex items-baseline justify-between gap-3 text-xs">
				<span className="text-muted-foreground">{m.tinhTu(soKr)}</span>
				<span className="font-medium text-sm tabular-nums">{progress}%</span>
			</div>
			<ThanhTienDo expected={expected} progress={progress} ten={ten} />
			<NhanTinhTrang expected={expected} kind={kind} progress={progress} />
		</div>
	);
}

export function TienDoMucTieuGon({
	ten,
	progress,
	expected,
	kind,
	soKr,
}: {
	ten: string;
	progress: number;
	expected: number | null;
	kind: LoaiMucTieu;
	soKr: number;
}) {
	const m = okrMessages(useLocale()).khoiMucTieu;
	if (soKr === 0)
		return (
			<span className="text-muted-foreground text-xs" data-o-tien-do>
				{m.chuaCoKrDeTinh}
			</span>
		);
	return (
		<TienDoGon
			dong={m.tinhTu(soKr)}
			expected={expected}
			kind={kind}
			progress={progress}
			ten={ten}
		/>
	);
}
