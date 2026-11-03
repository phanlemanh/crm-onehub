"use client";

import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { TU_XU_LY_ESC } from "@crm/ui/lib/tu-xu-ly-esc";
import { bangChungVao } from "@crm/validation/okr-canh-kr";
import type { KeyboardEvent } from "react";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";

export function loiDuongDan(url: string): boolean {
	return url.trim() !== "" && !bangChungVao.shape.url.safeParse(url).success;
}

export type ODuongDanBangChungProps = {
	id: string;
	value: string;
	onChange: (url: string) => void;
	disabled?: boolean;
	autoFocus?: boolean;
	loiThem?: string | null;
	tuXuLyEsc?: boolean;
	onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

export function ODuongDanBangChung({
	id,
	value,
	onChange,
	disabled,
	autoFocus,
	loiThem,
	tuXuLyEsc,
	onKeyDown,
}: ODuongDanBangChungProps) {
	const t = okrCanhKrMessages(useLocale());
	const sai = loiDuongDan(value);
	const loi = sai ? t.bangChung.loiDuongDan : (loiThem ?? null);
	return (
		<Field
			data-invalid={loi ? true : undefined}
			data-o="bang-chung"
			data-o-duong-dan-bang-chung=""
		>
			<FieldLabel htmlFor={id}>{t.capNhat.bangChung}</FieldLabel>
			<Input
				{...(tuXuLyEsc ? TU_XU_LY_ESC : {})}
				id={id}
				name="duong-dan-bang-chung"
				type="url"
				inputMode="url"
				autoComplete="off"
				autoFocus={autoFocus}
				spellCheck={false}
				translate="no"
				placeholder="https://…"
				value={value}
				disabled={disabled}
				aria-invalid={sai ? true : undefined}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={onKeyDown}
			/>
			{loi ? (
				<FieldError>{loi}</FieldError>
			) : (
				<FieldDescription>{t.capNhat.goiY}</FieldDescription>
			)}
		</Field>
	);
}
