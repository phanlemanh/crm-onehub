"use client";

import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@crm/ui/components/input-group";
import { type MucTuTin, NGHIA_TU_TIN } from "@crm/ui/components/okr-status";
import { IndicatorDot } from "@crm/ui/components/status-indicator";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import type { ReactNode, Ref } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import type { KrNgan } from "./du-lieu";
import { CAU_HINH, MOC, MUC_TU_TIN } from "./tinh";

const T = okrMessages("vi");
const TC = okrCanhKrMessages("vi");

export function OGiaTri({
	kr,
	value,
	loi,
	moTa,
	datGiaTri,
	khoa,
	oRef,
}: {
	kr: KrNgan;
	value: string;
	loi: boolean;
	moTa: ReactNode;
	datGiaTri: (v: string) => void;
	khoa: boolean;
	oRef?: Ref<HTMLInputElement>;
}) {
	const id = `${kr.id}-gia-tri`;
	if (kr.kieu === "moc") {
		return (
			<Field data-o="gia-tri">
				<FieldLabel id={id}>{T.capNhat.moc}</FieldLabel>
				<ToggleGroup
					aria-labelledby={id}
					className="w-full sm:w-fit"
					disabled={khoa}
					onValueChange={(v) => {
						if (v) datGiaTri(v);
					}}
					size="lg"
					spacing={0}
					type="single"
					value={value}
					variant="outline"
				>
					<ToggleGroupItem className="flex-1 sm:flex-none" value={MOC.chuaXong}>
						{T.moc.chuaXong}
					</ToggleGroupItem>
					<ToggleGroupItem className="flex-1 sm:flex-none" value={MOC.xong}>
						{T.moc.xong}
					</ToggleGroupItem>
				</ToggleGroup>
				{moTa}
			</Field>
		);
	}
	return (
		<Field data-invalid={loi || undefined} data-o="gia-tri">
			<FieldLabel htmlFor={id}>{T.capNhat.giaTri}</FieldLabel>
			<InputGroup>
				<InputGroupInput
					aria-invalid={loi || undefined}
					className="tabular-nums"
					disabled={khoa}
					id={id}
					inputMode="decimal"
					onChange={(e) => datGiaTri(e.target.value)}
					ref={oRef}
					value={value}
				/>
				<InputGroupAddon align="inline-end">
					<InputGroupText translate="no">{kr.donVi}</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
			{loi ? <FieldError>{T.capNhat.loiSo(CAU_HINH.viDuSo)}</FieldError> : moTa}
		</Field>
	);
}

export function ChonTuTin({
	id,
	value,
	lanTruoc,
	datTuTin,
	khoa,
}: {
	id: string;
	value: MucTuTin | null;
	lanTruoc: MucTuTin | null;
	datTuTin: (v: MucTuTin) => void;
	khoa: boolean;
}) {
	const m = T.capNhat;
	const nhanId = `${id}-tu-tin`;
	return (
		<Field data-o="tu-tin">
			<FieldLabel id={nhanId}>{m.tuTin}</FieldLabel>
			<ToggleGroup
				aria-labelledby={nhanId}
				className="w-full sm:w-fit"
				disabled={khoa}
				onValueChange={(v) => {
					const muc = MUC_TU_TIN.find((x) => x === v);
					if (muc) datTuTin(muc);
				}}
				size="lg"
				spacing={0}
				type="single"
				value={value ?? ""}
				variant="outline"
			>
				{MUC_TU_TIN.map((muc) => (
					<ToggleGroupItem
						className="flex-1 gap-2 sm:flex-none"
						key={muc}
						value={muc}
					>
						<IndicatorDot
							aria-hidden="true"
							tone={toneTheoNghia(NGHIA_TU_TIN[muc])}
						/>
						{m.mucTuTin[muc]}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
			<FieldDescription>
				{lanTruoc === null
					? m.chuaCapNhat
					: `${m.lanTruoc["lan-truoc"]}: ${m.mucTuTin[lanTruoc].toLowerCase()}`}
			</FieldDescription>
		</Field>
	);
}

export function OGhiChu({
	id,
	value,
	datGhiChu,
	khoa,
}: {
	id: string;
	value: string;
	datGhiChu: (v: string) => void;
	khoa: boolean;
}) {
	const m = T.capNhat;
	return (
		<Field data-o="ghi-chu">
			<FieldLabel htmlFor={`${id}-ghi-chu`}>{m.ghiChu}</FieldLabel>
			<Input
				disabled={khoa}
				id={`${id}-ghi-chu`}
				maxLength={CAU_HINH.ghiChuToiDa}
				onChange={(e) => datGhiChu(e.target.value)}
				placeholder={m.ghiChuGoiY}
				value={value}
			/>
			<FieldDescription className="tabular-nums">
				{value.length}/{CAU_HINH.ghiChuToiDa} ký tự
			</FieldDescription>
		</Field>
	);
}

export function OBangChung({
	id,
	value,
	sai,
	datBangChung,
	khoa,
}: {
	id: string;
	value: string;
	sai: boolean;
	datBangChung: (v: string) => void;
	khoa: boolean;
}) {
	return (
		<Field data-invalid={sai || undefined} data-o="bang-chung">
			<FieldLabel htmlFor={`${id}-bang-chung`}>
				{TC.capNhat.bangChung}
			</FieldLabel>
			<Input
				aria-invalid={sai || undefined}
				autoComplete="off"
				disabled={khoa}
				id={`${id}-bang-chung`}
				inputMode="url"
				onChange={(e) => datBangChung(e.target.value)}
				placeholder="https://…"
				spellCheck={false}
				translate="no"
				type="url"
				value={value}
			/>
			{sai ? (
				<FieldError>{TC.bangChung.loiDuongDan}</FieldError>
			) : (
				<FieldDescription>{TC.capNhat.goiY}</FieldDescription>
			)}
		</Field>
	);
}
