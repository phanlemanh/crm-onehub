"use client";

import Add from "@carbon/icons-react/es/Add";
import { CURRENCIES } from "@crm/db/currency";
import { Button } from "@crm/ui/components/button";
import { DatePicker } from "@crm/ui/components/date-picker";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
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
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@crm/ui/components/sheet";
import { Spinner } from "@crm/ui/components/spinner";
import { parseMoneyInput } from "@crm/ui/lib/money-input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsBoolean, useQueryState } from "nuqs";
import { type ComponentProps, Suspense, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { CompanyPicker } from "@/components/crm/company-picker";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { useGiaiDoan } from "@/lib/giai-doan";
import { dealMessages } from "@/lib/messages/deals";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const UNSET = "";

function AddButton(props: ComponentProps<typeof Button>) {
	const m = dealMessages(useLocale());
	return (
		<Button {...props}>
			<Icon icon={Add} data-icon="inline-start" />
			{m.create.newButton}
		</Button>
	);
}

export function CreateDealSheet({ companyId }: { companyId?: string }) {
	return (
		<Suspense fallback={<AddButton disabled />}>
			<CreateDealForm companyId={companyId} />
		</Suspense>
	);
}

type DealDraft = {
	name: string;
	company: string;
	ownerId: string;
	stage: string;
	amount: string;
	currency: string;
	closeDate: string;
};

type DealChoices = {
	ownerId: string;
	amountCents: number | null;
	currency: string | undefined;
};

function CreateDealForm({ companyId }: { companyId?: string }) {
	const m = dealMessages(useLocale());
	const openRecord = useOpenRecord();
	const trpc = useTRPC();
	const cache = useCrmCache();

	const [open, setOpen] = useQueryState(
		SEARCH_PARAM.dialog.create,
		parseAsBoolean.withDefault(false),
	);
	const [draft, setDraft] = useState<DealDraft>({
		name: "",
		company: companyId ?? UNSET,
		ownerId: UNSET,
		stage: "",
		amount: "",
		currency: "",
		closeDate: "",
	});
	const edit = (patch: Partial<DealDraft>) =>
		setDraft((current) => ({ ...current, ...patch }));

	const create = useMutation(
		trpc.deals.create.mutationOptions({
			onSuccess: async (deal) => {
				await cache.deal(deal.id);
				toast.success(m.created(deal.name));
				await setOpen(null);
				edit({ name: "", amount: "", currency: "", closeDate: "" });
				openRecord({ kind: "deal", id: deal.id });
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<Sheet open={open} onOpenChange={(next) => setOpen(next || null)}>
			<SheetTrigger asChild>
				<AddButton />
			</SheetTrigger>
			<SheetContent side="right">
				<CreateDealBody
					draft={draft}
					onEdit={edit}
					pending={create.isPending}
					onCreate={(choices) =>
						create.mutate({
							name: draft.name,
							companyId: draft.company,
							stage: draft.stage || undefined,
							expectedCloseDate: draft.closeDate || null,
							...choices,
						})
					}
				/>
			</SheetContent>
		</Sheet>
	);
}

function CreateDealBody({
	draft,
	onEdit,
	pending,
	onCreate,
}: {
	draft: DealDraft;
	onEdit: (patch: Partial<DealDraft>) => void;
	pending: boolean;
	onCreate: (choices: DealChoices) => void;
}) {
	const locale = useLocale();
	const m = dealMessages(locale);
	const trpc = useTRPC();
	const giaiDoan = useGiaiDoan();
	const stageHien = draft.stage || giaiDoan.open[0]?.id || "";

	const nameId = useId();
	const amountId = useId();
	const amountRef = useRef<HTMLInputElement>(null);
	const currencyRef = useRef<HTMLButtonElement>(null);
	const closeDateId = useId();

	const users = useQuery(trpc.users.list.queryOptions());
	const me = useQuery(trpc.users.me.queryOptions());
	const currencies = useQuery(trpc.currency.settings.queryOptions());

	const resolvedOwner = draft.ownerId || me.data?.id || UNSET;
	const workspaceCurrency = currencies.data?.reportingCurrency;
	const knownCurrency = draft.currency || workspaceCurrency || null;

	const ready =
		draft.name.trim() !== "" &&
		draft.company !== UNSET &&
		resolvedOwner !== UNSET;

	return (
		<>
			<SheetHeader>
				<SheetTitle>{m.create.title}</SheetTitle>
				<SheetDescription>{m.create.description}</SheetDescription>
			</SheetHeader>

			<form
				id="create-deal"
				className="flex-1 overflow-y-auto px-4"
				onSubmit={(event) => {
					event.preventDefault();
					if (knownCurrency === null && draft.amount.trim() !== "") {
						currencyRef.current?.focus();
						return;
					}
					const reading =
						knownCurrency === null
							? null
							: parseMoneyInput(draft.amount, {
									locale,
									currency: knownCurrency,
								});
					if (reading?.kind === "invalid") {
						amountRef.current?.focus();
						return;
					}
					onCreate({
						ownerId: resolvedOwner,
						amountCents: reading?.kind === "ok" ? reading.cents : null,
						currency: knownCurrency ?? undefined,
					});
				}}
			>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor={nameId}>{m.create.name}</FieldLabel>
						<Input
							id={nameId}
							value={draft.name}
							onChange={(event) => onEdit({ name: event.target.value })}
							placeholder={m.create.namePlaceholder}
							autoComplete="off"
							required
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor="create-deal-company">
							{m.create.company}
						</FieldLabel>
						<CompanyPicker
							id="create-deal-company"
							value={draft.company}
							onValueChange={(company) => onEdit({ company })}
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor="create-deal-owner">
							{m.create.owner}
						</FieldLabel>
						<Select
							value={resolvedOwner}
							onValueChange={(ownerId) => onEdit({ ownerId })}
						>
							<SelectTrigger id="create-deal-owner">
								<SelectValue placeholder={m.create.chooseOwner} />
							</SelectTrigger>
							<SelectContent>
								{(users.data ?? []).map((user) => (
									<SelectItem key={user.id} value={user.id}>
										{user.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>

					<Field>
						<FieldLabel htmlFor="create-deal-stage">
							{m.create.stage}
						</FieldLabel>
						<Select
							value={stageHien}
							onValueChange={(stage) => onEdit({ stage })}
						>
							<SelectTrigger id="create-deal-stage">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{giaiDoan.open.map((option) => (
									<SelectItem key={option.id} value={option.id}>
										<span translate="no">{option.label}</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FieldDescription>{m.create.stageHint}</FieldDescription>
					</Field>

					<Field>
						<FieldLabel htmlFor={amountId}>{m.create.amount}</FieldLabel>
						<MoneyInput
							id={amountId}
							ref={amountRef}
							value={draft.amount}
							onValueChange={(amount) => onEdit({ amount })}
							currency={knownCurrency}
							missingCurrency={
								currencies.isError
									? m.create.currencyLoadFailed
									: m.create.currencyLoading
							}
							end={
								<Select
									value={knownCurrency ?? ""}
									onValueChange={(currency) => onEdit({ currency })}
								>
									<SelectTrigger
										ref={currencyRef}
										aria-label={m.create.currency}
										className="w-28 shrink-0"
									>
										<SelectValue placeholder={m.create.currency} />
									</SelectTrigger>
									<SelectContent>
										{CURRENCIES.map((entry) => (
											<SelectItem key={entry.code} value={entry.code}>
												{entry.code}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							}
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor={closeDateId}>{m.create.closeDate}</FieldLabel>
						<DatePicker
							id={closeDateId}
							value={draft.closeDate}
							onChange={(closeDate) => onEdit({ closeDate })}
							placeholder={m.create.noDate}
						/>
					</Field>
				</FieldGroup>
			</form>

			<SheetFooter>
				<SheetClose asChild>
					<Button variant="outline">{m.create.cancel}</Button>
				</SheetClose>
				<Button type="submit" form="create-deal" disabled={pending || !ready}>
					{pending ? <Spinner /> : null}
					{m.create.submit}
				</Button>
			</SheetFooter>
		</>
	);
}
