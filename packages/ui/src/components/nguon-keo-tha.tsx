"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldError,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	type FileWithPreview,
	useFileUpload,
} from "@crm/ui/hooks/use-file-upload";
import { cn } from "@crm/ui/lib/utils";
import { cva } from "class-variance-authority";
import { useEffect, useId } from "react";

export type LyDoTuChoi = "loai" | "co";

export type NguonKeoThaProps = {
	nhan: string;
	moTa: string;
	nutChon: string;
	chapNhan: string;
	toiDaByte: number;
	tat?: { lyDo: string };
	nhieu?: boolean;
	onChon: (tep: File) => void;
	onTuChoi?: (tep: File, lyDo: LyDoTuChoi) => void;
	loi?: string;
};

const vungKeoThaVariants = cva(
	"flex flex-wrap items-center gap-3 rounded-lg border border-input border-dashed bg-card p-4 transition-colors",
	{
		variants: {
			trangThai: {
				thuong: "hover:bg-muted/50",
				keo: "border-ring bg-muted/50",
				loi: "border-destructive",
				tat: "opacity-50",
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
	nutChon,
	chapNhan,
	toiDaByte,
	tat,
	nhieu = false,
	onChon,
	onTuChoi,
	loi,
}: NguonKeoThaProps) {
	const goc = useId();
	const idMoTa = `${goc}-mo-ta`;
	const idTat = `${goc}-tat`;
	const idLoi = `${goc}-loi`;
	const biTat = tat !== undefined;

	const nhanTep = (them: FileWithPreview[]) => {
		const cacTep = (nhieu ? them : them.slice(0, 1))
			.map((muc) => muc.file)
			.filter((tep): tep is File => tep instanceof File);
		for (const tep of cacTep) {
			const lyDo = lyDoTuChoiTep(tep, chapNhan, toiDaByte);
			if (lyDo) onTuChoi?.(tep, lyDo);
			else onChon(tep);
		}
	};

	const [
		{ isDragging, files },
		{
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			getInputProps,
			clearFiles,
		},
	] = useFileUpload({ onFilesAdded: nhanTep, multiple: nhieu });

	useEffect(() => {
		if (files.length > 0) clearFiles();
	}, [files, clearFiles]);

	const moTaBoi = [idMoTa, biTat ? idTat : null, loi ? idLoi : null]
		.filter(Boolean)
		.join(" ");
	const dangKeo = isDragging && !biTat;
	const trangThai = biTat ? "tat" : dangKeo ? "keo" : loi ? "loi" : "thuong";

	return (
		<Field data-disabled={biTat || undefined} data-invalid={!!loi || undefined}>
			<div
				className={cn(vungKeoThaVariants({ trangThai }))}
				data-keo={dangKeo}
				data-slot="nguon-keo-tha"
				data-tat={biTat}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<input
					{...getInputProps({ accept: chapNhan, multiple: nhieu })}
					aria-describedby={moTaBoi}
					aria-invalid={loi ? true : undefined}
					aria-label={nutChon}
					className="sr-only"
					disabled={biTat}
					tabIndex={-1}
				/>
				<Button
					aria-describedby={moTaBoi}
					disabled={biTat}
					onClick={openFileDialog}
					size="sm"
					type="button"
					variant="outline"
				>
					<Icon icon={Add} />
					{nutChon}
				</Button>
				<div className="flex min-w-0 flex-1 basis-48 flex-col gap-0.5">
					<span className="font-medium text-sm">{nhan}</span>
					<FieldDescription id={idMoTa}>{moTa}</FieldDescription>
				</div>
			</div>
			{tat ? <FieldDescription id={idTat}>{tat.lyDo}</FieldDescription> : null}
			<FieldError id={idLoi}>{loi}</FieldError>
		</Field>
	);
}
