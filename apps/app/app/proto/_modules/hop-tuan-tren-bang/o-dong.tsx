"use client";

import ArrowDown from "@carbon/icons-react/es/ArrowDown";
import ArrowUp from "@carbon/icons-react/es/ArrowUp";
import Subtract from "@carbon/icons-react/es/Subtract";
import { Icon } from "@crm/ui/components/icon";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { Progress } from "@crm/ui/components/progress";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { type KrHop, type LyDo, type MucDoi, NHAN_TU_TIN } from "./du-lieu";
import { ghiChuMoiNhat, tienDoMoiNhat } from "./tinh";

export function NhanLyDo({ lyDo }: { lyDo: LyDo }) {
	switch (lyDo.loai) {
		case "tut":
			return (
				<StatusIndicator
					data-ly-do="tut"
					label={`Tụt từ ${NHAN_TU_TIN[lyDo.tu]} xuống ${NHAN_TU_TIN[lyDo.den]}`}
					size="sm"
					tone="error"
				/>
			);
		case "im":
			return (
				<StatusIndicator
					data-ly-do="im"
					label={`Im ${lyDo.soNgay} ngày`}
					size="sm"
					tone="warning"
				/>
			);
		case "ghi-chu":
			return (
				<StatusIndicator
					data-ly-do="ghi-chu"
					label="Ghi chú mới"
					size="sm"
					tone="info"
				/>
			);
	}
}

export function DongLyDo({ kr }: { kr: KrHop }) {
	if (kr.lyDo.length === 0) return null;
	return (
		<span className="flex flex-wrap gap-x-4 gap-y-1">
			{kr.lyDo.map((l) => (
				<NhanLyDo key={l.loai} lyDo={l} />
			))}
		</span>
	);
}

export function TienDoKr({ kr }: { kr: KrHop }) {
	const phanTram = tienDoMoiNhat(kr);
	return (
		<span className="flex flex-col gap-1.5" data-tien-do={phanTram}>
			<span className="flex items-center gap-3">
				<Progress label={kr.tieuDe} value={phanTram} />
				<span className="shrink-0 text-xs tabular-nums">{phanTram}%</span>
			</span>
			<ConfidenceIndicator level={kr.lan[0].tuTin} size="sm" />
		</span>
	);
}

export function GhiChuMoiNhat({ kr }: { kr: KrHop }) {
	const lan = ghiChuMoiNhat(kr);
	if (!lan) {
		return (
			<span className="text-muted-foreground text-sm" data-ghi-chu="trong">
				Chưa có ghi chú
			</span>
		);
	}
	return (
		<span className="flex flex-col gap-0.5" data-ghi-chu={kr.id}>
			<span className="text-sm" translate="no">
				«{lan.ghiChu}»
			</span>
			<span className="text-muted-foreground text-xs">{lan.ngay}</span>
		</span>
	);
}

const ICON_DOI = { tang: ArrowUp, giam: ArrowDown } as const;

export function chuMucDoi(doi: MucDoi): string {
	switch (doi.loai) {
		case "lan-dau":
			return `Lần đầu cập nhật · ${doi.den}%`;
		case "chua-doi":
			return `Chưa đổi · ${doi.den}%`;
		case "tang":
			return `+${doi.diem} điểm · ${doi.tu}% → ${doi.den}%`;
		case "giam":
			return `−${doi.diem} điểm · ${doi.tu}% → ${doi.den}%`;
	}
}

export function OMucDoi({ doi }: { doi: MucDoi }) {
	const icon =
		doi.loai === "tang" || doi.loai === "giam" ? ICON_DOI[doi.loai] : Subtract;
	return (
		<span className="flex flex-col gap-0.5" data-muc-doi={doi.loai}>
			<span className="flex items-center gap-1 text-sm tabular-nums">
				<Icon icon={icon} />
				{chuMucDoi(doi)}
			</span>
			<span className="text-muted-foreground text-xs">
				{doi.loai === "lan-dau"
					? "Chưa có lần trước để so"
					: `so với ${doi.ngayTruoc}`}
			</span>
		</span>
	);
}
