"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { ForeignText } from "@crm/ui/components/foreign-text";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SimpleTableRow } from "@crm/ui/components/simple-table";
import { Spinner } from "@crm/ui/components/spinner";
import { TableCell } from "@crm/ui/components/table";
import { useKhoMan } from "@crm/ui/hooks/use-kho-man";
import { formatMoney } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import type { ReactNode } from "react";
import {
	CuonCaKhungContext,
	DetailSheetHeader,
	DetailSheetProse,
	DetailSheetSection,
	type DetailSheetTab,
	DetailSheetTabs,
} from "@/components/detail-sheet";
import { crmMessages } from "@/lib/messages/crm";
import { useRecordStack } from "./record-stack";

export function RecordSheetFrame({
	loading,
	error,
	errorView,
	title,
	description,
	note,
	media,
	actions,
	stats,
	tabs,
	tab,
	onTabChange,
	cuonCaKhung = false,
}: {
	loading: boolean;
	error: string | null;
	errorView?: ReactNode;
	title: ReactNode;
	description?: ReactNode;
	note?: ReactNode;
	media?: ReactNode;
	actions?: ReactNode;
	stats?: ReactNode;
	tabs: DetailSheetTab[];
	tab: string;
	onTabChange: (tab: string) => void;
	cuonCaKhung?: boolean;
}) {
	const m = crmMessages(useLocale());
	const { stack, close } = useRecordStack();
	const kho = useKhoMan();
	const cuon = cuonCaKhung && kho === "dien-thoai";
	const ngu = cuonCaKhung && kho === "chua-biet" ? "chua-biet" : cuon;

	const khung = (
		<>
			<DetailSheetHeader
				media={media}
				title={title}
				description={description}
				note={note}
				actions={actions}
				onBack={stack.length > 1 ? close : undefined}
			/>

			{loading ? (
				<div className="flex min-h-0 flex-1 items-center justify-center">
					<Spinner />
				</div>
			) : error && errorView ? (
				errorView
			) : error ? (
				<div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
					<p className="font-medium text-sm">{m.misc.recordNotLoaded}</p>
					<p className="text-muted-foreground text-xs">{error}</p>
				</div>
			) : (
				<>
					{stats}
					<DetailSheetTabs
						tabs={tabs}
						value={tab}
						onValueChange={onTabChange}
					/>
				</>
			)}
		</>
	);

	return (
		<CuonCaKhungContext.Provider value={ngu}>
			<div
				data-cuon-ca-khung={cuon ? "" : undefined}
				className={
					cuon ? "flex min-h-0 flex-1 flex-col overflow-y-auto" : "contents"
				}
			>
				{khung}
			</div>
		</CuonCaKhungContext.Provider>
	);
}

export function AddRow({
	label,
	columns,
	onClick,
}: {
	label: string;
	columns: number;
	onClick: () => void;
}) {
	return (
		<SimpleTableRow>
			<TableCell colSpan={columns} className="p-0">
				<Button
					variant="ghost"
					size="sm"
					onClick={onClick}
					className="h-9 w-full justify-start px-5 font-normal text-muted-foreground"
				>
					<Icon icon={Add} data-icon="inline-start" />
					{label}
				</Button>
			</TableCell>
		</SimpleTableRow>
	);
}

export function DealAmount({
	amountCents,
	currency,
}: {
	amountCents: number | null;
	currency: string;
}) {
	const locale = useLocale();
	if (amountCents === null) return <EmptyCellValue />;
	return (
		<span className="tabular-nums">
			{formatMoney(amountCents, currency, locale)}
		</span>
	);
}

export type MetaPart = { text: string | null | undefined; lang?: Locale };

export function MetaLine({
	lead,
	parts,
}: {
	lead?: ReactNode;
	parts: (MetaPart | null | undefined)[];
}) {
	const seen = new Set<string>();
	const rest: { text: string; lang?: Locale }[] = [];

	for (const part of parts) {
		const value = part?.text?.trim();
		if (!value) continue;

		const key = value.toLowerCase();
		if (seen.has(key)) continue;

		seen.add(key);
		rest.push({ text: value, lang: part?.lang });
	}

	return (
		<>
			{lead}
			{rest.map((part, index) => (
				<span key={part.text}>
					{index === 0 && !lead ? null : " · "}
					{part.lang ? (
						<ForeignText lang={part.lang}>{part.text}</ForeignText>
					) : (
						part.text
					)}
				</span>
			))}
		</>
	);
}

export function CompanyAbout({
	title,
	description,
}: {
	title: ReactNode;
	description: string | null | undefined;
}) {
	if (!description) return null;

	return (
		<DetailSheetSection title={title}>
			<DetailSheetProse>
				<ForeignText lang="en">{description}</ForeignText>
			</DetailSheetProse>
		</DetailSheetSection>
	);
}

export function DomainLink({
	domain,
	website,
}: {
	domain: string | null;
	website: string | null;
}) {
	const href = website ?? (domain ? `https://${domain}` : null);
	const label = domain ?? website;
	if (!href || !label) return null;

	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer noopener"
			onClick={(event) => event.stopPropagation()}
			className="text-foreground underline-offset-2 hover:underline"
		>
			{label}
		</a>
	);
}
