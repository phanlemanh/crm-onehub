"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { type NghiaTrangThai, toneTheoNghia } from "@crm/ui/lib/status-tone";
import type { NhomTrangThai } from "@crm/validation/lo-trinh-du-lieu";
import { type LoTrinhMessages, loTrinhMessages } from "@/lib/messages/lo-trinh";
import { CHU_CUNG_NGHIA } from "./viec";

const NGHIA = {
	"da-giao": "xong",
	"dang-lam": "dangChay",
	"chua-bat-dau": "nhap",
	khac: "nhap",
} as const satisfies Record<NhomTrangThai, NghiaTrangThai>;

const KHOA_NHAN = {
	"da-giao": "daGiao",
	"dang-lam": "dangLam",
	"chua-bat-dau": "chuaBatDau",
	khac: "khac",
} as const satisfies Record<NhomTrangThai, keyof LoTrinhMessages["nhom"]>;

export function nhanNhom(m: LoTrinhMessages, nhom: NhomTrangThai): string {
	return m.nhom[KHOA_NHAN[nhom]];
}

type CoTrangThai = { nhom_trang_thai: NhomTrangThai; trang_thai: string };

export function ChamTrangThai({ v }: { v: CoTrangThai }) {
	const m = loTrinhMessages(useLocale());
	return (
		<StatusIndicator
			data-nhom-trang-thai={v.nhom_trang_thai}
			label={nhanNhom(m, v.nhom_trang_thai)}
			size="sm"
			tone={toneTheoNghia(NGHIA[v.nhom_trang_thai])}
		/>
	);
}

export function coTrangThaiPhu(m: LoTrinhMessages, v: CoTrangThai): boolean {
	return (
		v.trang_thai !== nhanNhom(m, v.nhom_trang_thai) &&
		!CHU_CUNG_NGHIA.has(v.trang_thai)
	);
}

export function OTrangThai({ v }: { v: CoTrangThai }) {
	const m = loTrinhMessages(useLocale());
	const phu = coTrangThaiPhu(m, v);
	return (
		<span className="flex flex-col gap-0.5">
			<ChamTrangThai v={v} />
			{phu ? (
				<span
					className="text-muted-foreground text-xs"
					data-lo-trinh-trang-thai-phu
					translate="no"
				>
					{v.trang_thai}
				</span>
			) : null}
		</span>
	);
}
