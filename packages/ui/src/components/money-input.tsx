"use client";

import { minorUnitsOf, normalizeCurrency } from "@crm/db/currency";
import { Input } from "@crm/ui/components/input";
import { useLocale, useMessages } from "@crm/ui/components/locale-provider";
import { formatMoney } from "@crm/ui/lib/format";
import type { Messages } from "@crm/ui/lib/messages";
import {
	formatMoneyInput,
	MONEY_EXAMPLE_CENTS,
	type MoneyInputOptions,
	type MoneyReading,
	type MoneyRejection,
	parseMoneyInput,
} from "@crm/ui/lib/money-input";
import { cn } from "@crm/ui/lib/utils";
import { type ComponentProps, type ReactNode, useId } from "react";

type MoneyInputProps = Omit<
	ComponentProps<typeof Input>,
	"value" | "defaultValue" | "onChange" | "type"
> & {
	value: string;
	onValueChange: (text: string) => void;
	currency: string | null;
	missingCurrency?: string;
	end?: ReactNode;
};

type MoneyState = MoneyReading | { kind: "noCurrency" };

function rejection(
	reason: MoneyRejection,
	m: Messages["soTien"],
	options: MoneyInputOptions,
): string {
	const minor = minorUnitsOf(options.currency);
	const example = formatMoneyInput(
		minor > 0 ? MONEY_EXAMPLE_CENTS.fraction : MONEY_EXAMPLE_CENTS.whole,
		options,
	);
	const code = normalizeCurrency(options.currency);
	switch (reason) {
		case "otherLocale":
			return m.otherLocale(example);
		case "fraction":
			return minor > 0
				? m.fractionMax(code, String(minor))
				: m.fractionNone(
						code,
						formatMoneyInput(MONEY_EXAMPLE_CENTS.whole, options),
					);
		case "negative":
			return m.negative;
		case "tooLarge":
			return m.tooLarge;
		case "format":
			return m.format(example);
	}
}

export function useMoneyReading(text: string, currency: string): MoneyReading {
	const locale = useLocale();
	return parseMoneyInput(text, { locale, currency });
}

export function MoneyInput({
	value,
	onValueChange,
	currency,
	missingCurrency,
	end,
	id,
	onBlur,
	placeholder,
	className,
	...props
}: MoneyInputProps) {
	const locale = useLocale();
	const m = useMessages().soTien;
	const generated = useId();
	const inputId = id ?? generated;
	const noteId = `${inputId}-reading`;
	const reading: MoneyState =
		currency === null
			? value.trim() === ""
				? { kind: "empty" }
				: { kind: "noCurrency" }
			: parseMoneyInput(value, { locale, currency });
	const invalid = reading.kind === "invalid";
	const minor = currency === null ? null : minorUnitsOf(currency);

	const input = (
		<Input
			{...props}
			id={inputId}
			type="text"
			inputMode={minor === 0 ? "numeric" : "decimal"}
			autoComplete="off"
			spellCheck={false}
			value={value}
			placeholder={
				placeholder ??
				formatMoneyInput(MONEY_EXAMPLE_CENTS.whole, { locale, currency: "" })
			}
			aria-invalid={invalid || undefined}
			aria-describedby={reading.kind === "empty" ? undefined : noteId}
			className={cn("tabular-nums", className)}
			onChange={(event) => onValueChange(event.target.value)}
			onBlur={(event) => {
				if (reading.kind === "ok" && currency !== null) {
					const tidy = formatMoneyInput(reading.cents, { locale, currency });
					if (tidy !== value) onValueChange(tidy);
				}
				onBlur?.(event);
			}}
		/>
	);

	return (
		<div data-slot="money-input" className="flex min-w-0 flex-col">
			{end ? <div className="flex min-w-0 gap-2">{input}{end}</div> : input}
			<p
				id={noteId}
				aria-live="polite"
				className={cn(
					"text-xs",
					reading.kind !== "empty" && "mt-1.5",
					invalid ? "text-destructive" : "text-muted-foreground",
				)}
			>
				{reading.kind === "ok" && currency !== null ? (
					<>
						{m.docLa}{" "}
						<span translate="no" className="tabular-nums">
							{formatMoney(reading.cents, currency, locale)}
						</span>
					</>
				) : reading.kind === "invalid" && currency !== null ? (
					rejection(reading.reason, m, { locale, currency })
				) : reading.kind === "noCurrency" ? (
					(missingCurrency ?? m.canDongTien)
				) : null}
			</p>
		</div>
	);
}
