"use client";

import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { LOAI_TRANG, type LoaiTrang } from "@crm/validation/tai-lieu";
import { useId } from "react";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { TAI_LIEU_MAN } from "@/lib/tai-lieu-man";

export type LuaChon = { id: string; ten: string };

export type TrangMoiChon = { loai: LoaiTrang; donVi: string; chuTrang: string };

type Props = {
	toiId: string;
	chuTrang: LuaChon[];
	donVi: LuaChon[];
	giaTri: TrangMoiChon;
	onDoi: (giaTri: TrangMoiChon) => void;
};

function laLoai(v: string): v is LoaiTrang {
	return LOAI_TRANG.some((l) => l === v);
}

export function trangMoiMacDinh(toiId: string): TrangMoiChon {
	return {
		loai: LOAI_TRANG[0],
		donVi: TAI_LIEU_MAN.khongDonVi,
		chuTrang: toiId,
	};
}

export function donViDaChon(donVi: string): string | null {
	return donVi === TAI_LIEU_MAN.khongDonVi ? null : donVi;
}

export function TruongTrangMoi({
	toiId,
	chuTrang,
	donVi,
	giaTri,
	onDoi,
}: Props) {
	const t = taiLieuMessages(useLocale());
	const m = t.soan;
	const ma = useId();
	const moTaLoai =
		giaTri.loai === "chien-luoc" ? m.loaiMoTa[giaTri.loai] : null;
	const id = {
		loai: `${ma}-loai`,
		donVi: `${ma}-don-vi`,
		chuTrang: `${ma}-chu-trang`,
	};

	return (
		<div className="grid gap-4 sm:grid-cols-3">
			<Field>
				<FieldLabel htmlFor={id.loai}>{m.loaiTrang}</FieldLabel>
				<Select
					onValueChange={(v) => {
						if (laLoai(v)) onDoi({ ...giaTri, loai: v });
					}}
					value={giaTri.loai}
				>
					<SelectTrigger id={id.loai}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{LOAI_TRANG.map((l) => (
							<SelectItem key={l} value={l}>
								{t.loai[l]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{moTaLoai ? (
					<FieldDescription data-mo-ta-loai>{moTaLoai}</FieldDescription>
				) : null}
			</Field>
			<Field>
				<FieldLabel htmlFor={id.donVi}>{m.donVi}</FieldLabel>
				<Select
					onValueChange={(v) => onDoi({ ...giaTri, donVi: v })}
					value={giaTri.donVi}
				>
					<SelectTrigger id={id.donVi}>
						<SelectValue placeholder={m.chonDonVi} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={TAI_LIEU_MAN.khongDonVi}>
							{m.khongDonVi}
						</SelectItem>
						{donVi.map((d) => (
							<SelectItem key={d.id} translate="no" value={d.id}>
								{d.ten}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Field>
			<Field>
				<FieldLabel htmlFor={id.chuTrang}>{m.chuTrang}</FieldLabel>
				<Select
					onValueChange={(v) => onDoi({ ...giaTri, chuTrang: v })}
					value={giaTri.chuTrang}
				>
					<SelectTrigger id={id.chuTrang}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{chuTrang.map((c) =>
							c.id === toiId ? (
								<SelectItem key={c.id} value={c.id}>
									{m.ban}
								</SelectItem>
							) : (
								<SelectItem key={c.id} translate="no" value={c.id}>
									{c.ten}
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>
			</Field>
		</div>
	);
}
