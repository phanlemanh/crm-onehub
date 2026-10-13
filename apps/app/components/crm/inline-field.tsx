"use client";

import { Button } from "@crm/ui/components/button";
import { DatePicker } from "@crm/ui/components/date-picker";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { MoneyInput } from "@crm/ui/components/money-input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { SOURCED_VALUE, SourcedValue } from "@crm/ui/components/sourced-value";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import { formatMoney } from "@crm/ui/lib/format";
import { formatMoneyInput, parseMoneyInput } from "@crm/ui/lib/money-input";
import { cn } from "@crm/ui/lib/utils";
import { useId, useRef, useState } from "react";
import { PROPERTY_LABEL, PROPERTY_ROW } from "@/components/detail-sheet";

const ROW = cn(PROPERTY_ROW, "items-center");
const LABEL = PROPERTY_LABEL;
const CONTROL =
	"h-8 w-full justify-start px-2 font-normal hover:border-input hover:bg-muted/40 border border-transparent";
const BLOCK_CONTROL = cn(
	CONTROL,
	"h-auto min-h-16 items-start whitespace-pre-wrap py-2 text-left leading-5",
);

export function savingField(update: {
	isPending: boolean;
	variables?: { data?: object } | undefined;
}): (field: string) => boolean {
	const fields = update.isPending
		? Object.keys(update.variables?.data ?? {})
		: [];
	return (field) => fields.includes(field);
}

export function savingValue(update: {
	isPending: boolean;
	variables?: { data?: { fields?: Record<string, unknown> } } | undefined;
}): (key: string) => boolean {
	const fields = update.isPending ? (update.variables?.data?.fields ?? {}) : {};
	return (key) => key in fields;
}

export function InlineField({
	label,
	value,
	onSave,
	saving = false,
	placeholder,
	type = "text",
	render,
	provenance,
	suggestion,
}: {
	label: string;
	value: string | null;
	onSave: (next: string) => void;
	saving?: boolean;
	placeholder?: string;
	type?: "text" | "url" | "email" | "tel";
	render?: (value: string) => React.ReactNode;
	provenance?: React.ReactNode;
	suggestion?: React.ReactNode;
}) {
	const id = useId();
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value ?? "");

	const commit = () => {
		setEditing(false);
		if (draft.trim() !== (value ?? "")) onSave(draft.trim());
	};

	const shown = saving ? draft.trim() : (value ?? "");

	const sourced = Boolean(provenance) && !editing && shown !== "";

	const control = editing ? (
		<Input
			id={id}
			type={type}
			autoFocus
			value={draft}
			placeholder={placeholder}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={commit}
			onKeyDown={(event) => {
				if (event.key === "Enter") {
					event.preventDefault();
					commit();
				}
				if (event.key === "Escape") {
					setDraft(value ?? "");
					setEditing(false);
				}
			}}
		/>
	) : (
		<Button
			variant="ghost"
			size="sm"
			className={CONTROL}
			disabled={saving}
			onClick={() => {
				setDraft(value ?? "");
				setEditing(true);
			}}
		>
			{saving ? <Spinner /> : null}
			{shown ? (
				<span className={cn("truncate", sourced && SOURCED_VALUE)}>
					{render ? render(shown) : shown}
				</span>
			) : (
				<span className="truncate text-muted-foreground">
					{placeholder ?? <EmptyCellValue />}
				</span>
			)}
		</Button>
	);

	const body =
		sourced && provenance ? (
			<SourcedValue source={provenance}>{control}</SourcedValue>
		) : (
			control
		);

	if (!suggestion) {
		return (
			<div className={ROW}>
				<label htmlFor={id} className={LABEL}>
					{label}
				</label>
				{body}
			</div>
		);
	}

	return (
		<div className={cn(ROW, "items-start")}>
			<label htmlFor={id} className={cn(LABEL, "pt-2")}>
				{label}
			</label>
			<div className="min-w-0">
				{body}
				{suggestion}
			</div>
		</div>
	);
}

export function InlineMoneyField({
	label,
	cents,
	currency,
	onSave,
	saving = false,
}: {
	label: string;
	cents: number | null;
	currency: string;
	onSave: (next: number | null) => void;
	saving?: boolean;
}) {
	const id = useId();
	const locale = useLocale();
	const [editing, setEditing] = useState(false);
	const initial =
		cents === null ? "" : formatMoneyInput(cents, { locale, currency });
	const [draft, setDraft] = useState(initial);
	const closed = useRef(false);

	const open = () => {
		closed.current = false;
		setDraft(initial);
		setEditing(true);
	};

	const close = () => {
		closed.current = true;
		setEditing(false);
	};

	const commit = (text: string) => {
		if (closed.current) return;
		if (text.trim() === initial) return close();
		const reading = parseMoneyInput(text, { locale, currency });
		if (reading.kind === "invalid") return;
		const next = reading.kind === "ok" ? reading.cents : null;
		close();
		if (next !== cents) onSave(next);
	};

	const control = editing ? (
		<MoneyInput
			id={id}
			autoFocus
			value={draft}
			currency={currency}
			onValueChange={setDraft}
			onBlur={(event) => commit(event.currentTarget.value)}
			onKeyDown={(event) => {
				if (event.key === "Enter") {
					event.preventDefault();
					commit(event.currentTarget.value);
				}
				if (event.key === "Escape") {
					setDraft(initial);
					close();
				}
			}}
		/>
	) : (
		<Button
			variant="ghost"
			size="sm"
			className={CONTROL}
			disabled={saving}
			onClick={open}
		>
			{saving ? <Spinner /> : null}
			{cents === null ? (
				<span className="truncate text-muted-foreground">
					<EmptyCellValue />
				</span>
			) : (
				<span className="truncate" translate="no">
					{formatMoney(cents, currency, locale)}
				</span>
			)}
		</Button>
	);

	return (
		<div className={cn(ROW, editing && "items-start")}>
			<label htmlFor={id} className={cn(LABEL, editing && "pt-2")}>
				{label}
			</label>
			{control}
		</div>
	);
}

export function InlineTextCell({
	label,
	value,
	onSave,
	saving = false,
	placeholder,
	maxLength,
}: {
	label: string;
	value: string | null;
	onSave: (next: string) => void;
	saving?: boolean;
	placeholder?: string;
	maxLength?: number;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value ?? "");

	const commit = () => {
		setEditing(false);
		if (draft.trim() !== (value ?? "")) onSave(draft.trim());
	};

	if (editing) {
		return (
			<Input
				aria-label={label}
				autoFocus
				value={draft}
				placeholder={placeholder}
				maxLength={maxLength}
				onClick={(event) => event.stopPropagation()}
				onChange={(event) => setDraft(event.target.value)}
				onBlur={commit}
				onKeyDown={(event) => {
					if (event.key === "Enter") {
						event.preventDefault();
						commit();
					}
					if (event.key === "Escape") {
						setDraft(value ?? "");
						setEditing(false);
					}
				}}
			/>
		);
	}

	const shown = saving ? draft.trim() : (value ?? "");

	return (
		<Button
			variant="ghost"
			size="sm"
			aria-label={label}
			className={CONTROL}
			disabled={saving}
			onClick={(event) => {
				event.stopPropagation();
				setDraft(value ?? "");
				setEditing(true);
			}}
		>
			{saving ? <Spinner /> : null}
			{shown ? (
				<span className="truncate">{shown}</span>
			) : (
				<span className="truncate text-muted-foreground">
					{placeholder ?? <EmptyCellValue />}
				</span>
			)}
		</Button>
	);
}

export function InlineTextArea({
	label,
	value,
	onSave,
	saving = false,
	placeholder,
	maxLength,
}: {
	label: string;
	value: string | null;
	onSave: (next: string) => void;
	saving?: boolean;
	placeholder?: string;
	maxLength?: number;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value ?? "");

	const commit = () => {
		setEditing(false);
		if (draft.trim() !== (value ?? "")) onSave(draft.trim());
	};

	if (editing) {
		return (
			<Textarea
				aria-label={label}
				autoFocus
				value={draft}
				placeholder={placeholder}
				maxLength={maxLength}
				onChange={(event) => setDraft(event.target.value)}
				onBlur={commit}
				onKeyDown={(event) => {
					if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
						event.preventDefault();
						commit();
					}
					if (event.key === "Escape") {
						setDraft(value ?? "");
						setEditing(false);
					}
				}}
			/>
		);
	}

	const shown = saving ? draft.trim() : (value ?? "");

	return (
		<Button
			variant="ghost"
			size="sm"
			aria-label={label}
			className={BLOCK_CONTROL}
			disabled={saving}
			onClick={() => {
				setDraft(value ?? "");
				setEditing(true);
			}}
		>
			{saving ? <Spinner /> : null}
			{shown ? (
				<span className="min-w-0">{shown}</span>
			) : (
				<span className="min-w-0 text-muted-foreground">
					{placeholder ?? <EmptyCellValue />}
				</span>
			)}
		</Button>
	);
}

export function InlineDateField({
	label,
	value,
	onSave,
	saving = false,
	placeholder = "—",
}: {
	label: string;
	value: string | null;
	onSave: (next: string) => void;
	saving?: boolean;
	placeholder?: string;
}) {
	const id = useId();

	return (
		<div className={ROW}>
			<label htmlFor={id} className={LABEL}>
				{label}
			</label>
			<div className="flex min-w-0 items-center gap-1.5">
				<DatePicker
					id={id}
					variant="ghost"
					value={value?.slice(0, 10) ?? null}
					placeholder={placeholder}
					onChange={onSave}
				/>
				{saving ? <Spinner /> : null}
			</div>
		</div>
	);
}

export function InlineSelectField({
	label,
	value,
	options,
	onSave,
	saving = false,
	placeholder,
	emptyValue,
}: {
	label: string;
	value: string;
	options: { value: string; label: string }[];
	onSave: (next: string) => void;
	saving?: boolean;
	placeholder?: string;
	emptyValue?: string;
}) {
	const id = useId();

	return (
		<div className={ROW}>
			<label htmlFor={id} className={LABEL}>
				{label}
			</label>
			<div className="flex min-w-0 items-center gap-1.5">
				<Select value={value} onValueChange={onSave} disabled={saving}>
					<SelectTrigger id={id} variant="ghost" className="w-full">
						<SelectValue placeholder={placeholder ?? <EmptyCellValue />}>
							{emptyValue !== undefined && value === emptyValue ? (
								<EmptyCellValue />
							) : undefined}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{options.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{saving ? <Spinner /> : null}
			</div>
		</div>
	);
}
