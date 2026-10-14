"use client";

import Add from "@carbon/icons-react/es/Add";
import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { ForeignText } from "@crm/ui/components/foreign-text";
import { Icon } from "@crm/ui/components/icon";
import { KaraRetry } from "@crm/ui/components/kara/state";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Spinner } from "@crm/ui/components/spinner";
import { TableCell } from "@crm/ui/components/table";
import { useKhoMan } from "@crm/ui/hooks/use-kho-man";
import { formatMoney } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { type ReactNode, useState } from "react";
import {
	CuonCaKhungContext,
	DetailSheetHeader,
	DetailSheetProse,
	DetailSheetSection,
	type DetailSheetTab,
	DetailSheetTabs,
} from "@/components/detail-sheet";
import { LocalDateTime } from "@/components/local-date-time";
import type { LyDoLoi } from "@/lib/ly-do-loi";
import { crmMessages } from "@/lib/messages/crm";
import { karaBanGhiMessages } from "@/lib/messages/kara-ban-ghi";
import { recordSheetMessages } from "@/lib/messages/record-sheet";
import { NGAY_LUU_TRU } from "./record-actions";
import { useOpenRecord, useRecordStack } from "./record-stack";

export function KhungTaiLoi({
	lyDo = "mat-ket-noi",
	onRetry,
	coDong = true,
}: {
	lyDo?: LyDoLoi;
	onRetry?: () => void;
	coDong?: boolean;
}) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const t = karaBanGhiMessages(locale).khung;
	const { close } = useRecordStack();
	const chu =
		lyDo === "khong-con"
			? {
					tieuDe: t.khongCon.tieuDe,
					moTa: t.khongCon.moTa,
					dong: t.khongCon.dong,
				}
			: lyDo === "khong-quyen"
				? {
						tieuDe: t.khongQuyen.tieuDe,
						moTa: t.khongQuyen.moTa,
						dong: t.khongQuyen.dong,
					}
				: null;
	return (
		<div className="flex min-h-0 flex-1 items-center justify-center p-6">
			<Empty
				border="solid"
				size="compact"
				data-khung-tai-loi=""
				data-ly-do={lyDo}
			>
				<EmptyHeader>
					<EmptyTitle>{chu ? chu.tieuDe : m.misc.recordNotLoaded}</EmptyTitle>
					<EmptyDescription>{chu ? chu.moTa : t.loiMoTa}</EmptyDescription>
				</EmptyHeader>
				{chu && coDong ? (
					<EmptyContent>
						<Button variant="outline" size="sm" onClick={close}>
							{chu.dong}
						</Button>
					</EmptyContent>
				) : null}
				{!chu && onRetry ? (
					<EmptyContent>
						<KaraRetry onClick={onRetry} />
					</EmptyContent>
				) : null}
			</Empty>
		</div>
	);
}

export function RecordSheetFrame({
	loading,
	error,
	errorView,
	onRetry,
	lyDo,
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
	onRetry?: () => void;
	lyDo?: LyDoLoi;
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
				<KhungTaiLoi lyDo={lyDo} onRetry={onRetry} />
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

export type BanDaLuuTru = { id: string; name: string; archivedAt: string };

export function DongDaLuuTru({
	items,
	columns,
	kind,
}: {
	items: BanDaLuuTru[];
	columns: number;
	kind: "contact" | "deal";
}) {
	const m = recordSheetMessages(useLocale());
	const openRecord = useOpenRecord();
	const [mo, setMo] = useState(false);

	if (items.length === 0) return null;

	return (
		<>
			<SimpleTableRow>
				<TableCell colSpan={columns} className="p-0">
					<Button
						variant="ghost"
						size="sm"
						aria-expanded={mo}
						onClick={() => setMo((dangMo) => !dangMo)}
						className="h-9 w-full justify-start px-5 font-normal text-muted-foreground"
					>
						<Icon
							icon={mo ? ChevronDown : ChevronRight}
							data-icon="inline-start"
						/>
						{m.archivedRows.toggle(String(items.length))}
					</Button>
				</TableCell>
			</SimpleTableRow>
			{mo
				? items.map((item) => (
						<SimpleTableRow key={item.id} sub data-da-luu-tru={item.id}>
							<TableCell colSpan={columns} className="py-2.5 pr-3 pl-5">
								<span className="flex min-w-0 items-center gap-2">
									<button
										type="button"
										translate="no"
										onClick={() => openRecord({ kind, id: item.id })}
										className="min-w-0 truncate underline-offset-2 hover:underline"
									>
										{item.name}
									</button>
									<span className="shrink-0">
										{m.archivedRows.on}{" "}
										<LocalDateTime
											date={item.archivedAt}
											options={NGAY_LUU_TRU}
										/>
									</span>
								</span>
							</TableCell>
						</SimpleTableRow>
					))
				: null}
		</>
	);
}

export function BangDaLuuTru({
	items,
	columns,
	kind,
}: {
	items: BanDaLuuTru[];
	columns: SimpleTableColumn[];
	kind: "contact" | "deal";
}) {
	if (items.length === 0) return null;
	return (
		<SimpleTable variant="panel" header="sr-only" columns={columns}>
			<DongDaLuuTru items={items} columns={columns.length} kind={kind} />
		</SimpleTable>
	);
}

export function tenCaNhan(person: {
	firstName: string;
	lastName: string | null;
}): string {
	return [person.firstName, person.lastName].filter(Boolean).join(" ");
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
