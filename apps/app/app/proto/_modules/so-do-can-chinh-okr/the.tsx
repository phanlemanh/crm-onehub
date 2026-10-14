"use client";

import { Button } from "@crm/ui/components/button";
import { FlowMapCard, type NodeProps } from "@crm/ui/components/flow-map";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import Link from "next/link";
import {
	giaTri,
	LoaiMucTieuNhan,
	ThanhTienDo,
	TinhTrangKr,
	tienDo,
} from "../ban-mau-okr/phan-chung";
import type {
	DemTinhTrang,
	NutDonVi,
	NutKr,
	NutMucTieu,
	TomTatDonVi,
} from "./du-lieu";

export const DUONG = "/proto/so-do-can-chinh-okr";

const NHAN_DEM = {
	success: "đúng nhịp",
	warning: "chậm nhịp",
	error: "trượt",
} satisfies Record<keyof DemTinhTrang, string>;

const THU_TU_DEM = ["success", "warning", "error"] as const;

function DemKr({ dem }: { dem: DemTinhTrang }) {
	const cac = THU_TU_DEM.filter((k) => dem[k] > 0);
	return (
		<span className="flex flex-wrap items-center gap-x-3 gap-y-1">
			{cac.map((k) => (
				<StatusIndicator
					key={k}
					label={`${dem[k]} ${NHAN_DEM[k]}`}
					size="sm"
					tone={k}
				/>
			))}
		</span>
	);
}

function DauThe({ t }: { t: TomTatDonVi }) {
	return (
		<span className="flex items-start justify-between gap-2">
			<span className="min-w-0 truncate font-medium" translate="no">
				{t.ten}
			</span>
			<span className="shrink-0 text-muted-foreground text-xs tabular-nums">
				{t.mucTieu.length === 0
					? "chưa đặt"
					: `${t.mucTieu.length} mục tiêu · ${t.soKr} KR`}
			</span>
		</span>
	);
}

function Truong({ t }: { t: TomTatDonVi }) {
	return t.truong ? (
		<span className="flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs">
			<PersonAvatar name={t.truong.ten} size="sm" />
			<span className="truncate" translate="no">
				{t.truong.ten}
			</span>
		</span>
	) : (
		<StatusIndicator label="Chưa có trưởng" size="sm" tone="warning" />
	);
}

function TienDoDonVi({ t }: { t: TomTatDonVi }) {
	if (t.tienDoTb === null) {
		return (
			<span className="text-muted-foreground text-xs">
				Chưa đặt OKR cho Quý 4 · 2026
			</span>
		);
	}
	return (
		<span className="flex items-center gap-2">
			<ThanhTienDo nhan={`Tiến độ ${t.ten}`} phanTram={t.tienDoTb} />
			<span className="w-9 shrink-0 text-right text-xs tabular-nums">
				{t.tienDoTb}%
			</span>
		</span>
	);
}

export function TheDonVi({ data, selected }: NodeProps<NutDonVi>) {
	const t = data.donVi;
	return (
		<FlowMapCard
			active={selected || data.mo}
			aria-expanded={data.mo}
			data-can-chu-y={data.canChuY || undefined}
			data-don-vi={t.id}
		>
			<DauThe t={t} />
			<Truong t={t} />
			<TienDoDonVi t={t} />
			<DemKr dem={t.dem} />
			{t.chuaCanChinh > 0 ? (
				<StatusIndicator
					label={`${t.chuaCanChinh} mục tiêu chưa góp vào đâu`}
					size="sm"
					tone="warning"
				/>
			) : null}
			{data.mo ? (
				<span className="mt-1 flex min-h-0 flex-col gap-2 border-t pt-2">
					{t.mucTieu.map((mt) => {
						const p = Math.round(
							mt.kr.reduce((s, k) => s + tienDo(k), 0) /
								Math.max(1, mt.kr.length),
						);
						return (
							<span className="flex flex-col gap-1" key={mt.id}>
								<span className="line-clamp-2 text-sm">{mt.ten}</span>
								<span className="flex items-center justify-between gap-2">
									<TinhTrangKr loai={mt.loai} phanTram={p} size="sm" />
									<Button asChild size="xs" variant="ghost">
										<Link
											className="nodrag"
											href={`${DUONG}?state=ST-sodo-quanh-muc-tieu`}
										>
											Xem quanh mục tiêu
										</Link>
									</Button>
								</span>
							</span>
						);
					})}
				</span>
			) : null}
		</FlowMapCard>
	);
}

export function TheMucTieu({ data, selected }: NodeProps<NutMucTieu>) {
	const mt = data.mucTieu;
	const p = Math.round(
		mt.kr.reduce((s, k) => s + tienDo(k), 0) / Math.max(1, mt.kr.length),
	);
	return (
		<FlowMapCard active={selected || data.laTam} data-muc-tieu={mt.id}>
			<span className="flex items-center justify-between gap-2 text-muted-foreground text-xs">
				<span className="truncate" translate="no">
					{mt.donVi}
				</span>
				<LoaiMucTieuNhan loai={mt.loai} />
			</span>
			<span className="line-clamp-2 font-medium">{mt.ten}</span>
			<span className="mt-auto flex items-center gap-2">
				<ThanhTienDo nhan={`Tiến độ ${mt.ten}`} phanTram={p} />
				<span className="w-9 shrink-0 text-right text-xs tabular-nums">
					{p}%
				</span>
				<PersonAvatar name={mt.phuTrach.ten} size="sm" />
			</span>
		</FlowMapCard>
	);
}

export function TheKr({ data, selected }: NodeProps<NutKr>) {
	const k = data.kr;
	const p = tienDo(k);
	return (
		<FlowMapCard active={selected} data-kr={k.id}>
			<span className="line-clamp-2">
				<span className="text-muted-foreground">KR · </span>
				{k.ten}
			</span>
			<span className="mt-auto flex items-center gap-2">
				<ThanhTienDo nhan={`Tiến độ ${k.ten}`} phanTram={p} />
				<span className="shrink-0 text-muted-foreground text-xs tabular-nums">
					{giaTri(k)}
				</span>
			</span>
		</FlowMapCard>
	);
}

export const KIEU_NUT = {
	"don-vi": TheDonVi,
	"muc-tieu": TheMucTieu,
	kr: TheKr,
};
