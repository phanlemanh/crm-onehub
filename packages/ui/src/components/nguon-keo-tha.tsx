"use client";

import CloudUpload from "@carbon/icons-react/es/CloudUpload";
import {
	Field,
	FieldDescription,
	FieldError,
} from "@crm/ui/components/field";
import { EmptyMedia } from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { cn } from "@crm/ui/lib/utils";
import { cva } from "class-variance-authority";
import { type ChangeEvent, type DragEvent, useId, useState } from "react";

export type LyDoTuChoi = "loai" | "co";

export type NguonKeoThaProps = {
	nhan: string;
	moTa: string;
	chapNhan: string;
	toiDaByte: number;
	tat?: { lyDo: string };
	onChon: (tep: File) => void;
	onTuChoi?: (tep: File, lyDo: LyDoTuChoi) => void;
	loi?: string;
};

const vungKeoThaVariants = cva(
	"flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-input border-dashed bg-card px-6 py-10 text-center transition-colors hover:bg-muted/50 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring/60",
	{
		variants: {
			trangThai: {
				thuong: "",
				keo: "border-ring bg-muted/50",
				loi: "border-destructive",
				tat: "cursor-not-allowed opacity-50 hover:bg-card",
			},
		},
		defaultVariants: { trangThai: "thuong" },
	},
);

function duoiTep(ten: string): string {
	const cham = ten.lastIndexOf(".");
	return cham < 0 ? "" : ten.slice(cham).toLowerCase();
}

function dungLoai(tep: File, chapNhan: string): boolean {
	const duoi = duoiTep(tep.name);
	return chapNhan
		.split(",")
		.map((m) => m.trim().toLowerCase())
		.filter(Boolean)
		.some((m) => {
			if (m.startsWith(".")) return m === duoi;
			if (m.endsWith("/*")) return tep.type.startsWith(m.slice(0, -1));
			return tep.type === m;
		});
}

export function lyDoTuChoiTep(
	tep: File,
	chapNhan: string,
	toiDaByte: number,
): LyDoTuChoi | null {
	if (!dungLoai(tep, chapNhan)) return "loai";
	if (tep.size > toiDaByte) return "co";
	return null;
}

export function NguonKeoTha({
	nhan,
	moTa,
	chapNhan,
	toiDaByte,
	tat,
	onChon,
	onTuChoi,
	loi,
}: NguonKeoThaProps) {
	const goc = useId();
	const idO = `${goc}-o`;
	const idMoTa = `${goc}-mo-ta`;
	const idTat = `${goc}-tat`;
	const idLoi = `${goc}-loi`;
	const [dangKeo, datDangKeo] = useState(false);
	const biTat = tat !== undefined;

	const nhanTep = (tep: File | undefined) => {
		if (!tep || biTat) return;
		const lyDo = lyDoTuChoiTep(tep, chapNhan, toiDaByte);
		if (lyDo) onTuChoi?.(tep, lyDo);
		else onChon(tep);
	};

	const khiDoi = (e: ChangeEvent<HTMLInputElement>) => {
		nhanTep(e.target.files?.[0]);
		e.target.value = "";
	};

	const khiKeoVao = (e: DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		if (!biTat) datDangKeo(true);
	};

	const khiKeoRa = (e: DragEvent<HTMLLabelElement>) => {
		if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
		datDangKeo(false);
	};

	const khiTha = (e: DragEvent<HTMLLabelElement>) => {
		e.preventDefault();
		datDangKeo(false);
		nhanTep(e.dataTransfer?.files?.[0]);
	};

	const moTaBoi = [idMoTa, biTat ? idTat : null, loi ? idLoi : null]
		.filter(Boolean)
		.join(" ");

	const trangThai = biTat ? "tat" : dangKeo ? "keo" : loi ? "loi" : "thuong";

	return (
		<Field data-disabled={biTat || undefined} data-invalid={!!loi || undefined}>
			<label
				className={cn(vungKeoThaVariants({ trangThai }))}
				data-keo={dangKeo}
				data-slot="nguon-keo-tha"
				data-tat={biTat}
				htmlFor={idO}
				onDragEnter={khiKeoVao}
				onDragLeave={khiKeoRa}
				onDragOver={khiKeoVao}
				onDrop={khiTha}
			>
				<EmptyMedia variant="icon">
					<Icon icon={CloudUpload} />
				</EmptyMedia>
				<span className="font-medium text-sm">{nhan}</span>
				<span className="text-muted-foreground text-xs" id={idMoTa}>
					{moTa}
				</span>
				<input
					accept={chapNhan}
					aria-describedby={moTaBoi}
					aria-invalid={loi ? true : undefined}
					className="sr-only"
					disabled={biTat}
					id={idO}
					onChange={khiDoi}
					type="file"
				/>
			</label>
			{tat ? <FieldDescription id={idTat}>{tat.lyDo}</FieldDescription> : null}
			<FieldError id={idLoi}>{loi}</FieldError>
		</Field>
	);
}
