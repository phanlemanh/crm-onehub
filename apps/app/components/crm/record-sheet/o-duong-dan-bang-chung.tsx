"use client";

import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
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
	onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

export function ODuongDanBangChung({
	id,
	value,
	onChange,
	disabled,
	autoFocus,
	loiThem,
	onKeyDown,
}: ODuongDanBangChungProps) {
	const m = okrCanhKrMessages(useLocale()).bangChung;
	const sai = loiDuongDan(value);
	const loi = sai ? m.loiDuongDan : (loiThem ?? null);
	return (
		<Field data-invalid={loi ? true : undefined} data-o-duong-dan-bang-chung="">
			<FieldLabel htmlFor={id}>{m.o.nhan}</FieldLabel>
			<Input
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
				<FieldDescription>{m.o.goiY}</FieldDescription>
			)}
		</Field>
	);
}
