"use client";

import { Badge } from "@crm/ui/components/badge";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import { RadioGroup, RadioGroupItem } from "@crm/ui/components/radio-group";
import { useId } from "react";
import type { KhoaApiMessages } from "@/lib/messages/settings-khoa-api";

export const LOAI_KHOA = [
	"toan-quyen",
	"keo-tin-hieu",
	"day-lo-trinh",
] as const;

export type LoaiKhoa = (typeof LOAI_KHOA)[number];

function laLoaiKhoa(v: string): v is LoaiKhoa {
	return (LOAI_KHOA as readonly string[]).includes(v);
}

export function LoaiKhoaField({
	t,
	value,
	onValueChange,
	disabled,
}: {
	t: KhoaApiMessages;
	value: LoaiKhoa;
	onValueChange: (value: LoaiKhoa) => void;
	disabled?: boolean;
}) {
	const id = useId();
	const muc = [
		{
			value: "toan-quyen",
			nhan: t.tao.loaiToanQuyen,
			moTa: t.tao.loaiToanQuyenMoTa,
		},
		{
			value: "keo-tin-hieu",
			nhan: t.tao.loaiKeoTinHieu,
			moTa: t.tao.loaiKeoTinHieuMoTa,
		},
		{
			value: "day-lo-trinh",
			nhan: t.tao.loaiDayLoTrinh,
			moTa: t.tao.loaiDayLoTrinhMoTa,
		},
	] as const;

	return (
		<FieldSet data-slot="loai-khoa">
			<FieldLegend variant="label">{t.tao.loai}</FieldLegend>
			<RadioGroup
				disabled={disabled}
				value={value}
				onValueChange={(v) => {
					if (laLoaiKhoa(v)) onValueChange(v);
				}}
			>
				{muc.map((m) => (
					<Field key={m.value} orientation="horizontal">
						<RadioGroupItem id={`${id}-${m.value}`} value={m.value} />
						<FieldContent>
							<FieldLabel htmlFor={`${id}-${m.value}`}>{m.nhan}</FieldLabel>
							<FieldDescription>{m.moTa}</FieldDescription>
						</FieldContent>
					</Field>
				))}
			</RadioGroup>
		</FieldSet>
	);
}

export function NhanLoaiKhoa({
	t,
	loai,
}: {
	t: KhoaApiMessages;
	loai: LoaiKhoa;
}) {
	if (loai === "toan-quyen") return null;
	return (
		<Badge variant="secondary" data-slot="nhan-loai-khoa">
			{loai === "keo-tin-hieu" ? t.bang.loaiKeoTinHieu : t.bang.loaiDayLoTrinh}
		</Badge>
	);
}
