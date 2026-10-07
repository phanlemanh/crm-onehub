"use client";

import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { DatePicker } from "@crm/ui/components/date-picker";
import { Field, FieldLabel } from "@crm/ui/components/field";
import { useKhaiThayDoi } from "@crm/ui/components/giu-thay-doi";
import { Input } from "@crm/ui/components/input";
import { useLocale, useMessages } from "@crm/ui/components/locale-provider";
import { MoneyInput } from "@crm/ui/components/money-input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Spinner } from "@crm/ui/components/spinner";
import { parseMoneyInput } from "@crm/ui/lib/money-input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { contactName } from "@/components/crm/contact-name";
import { crmMessages } from "@/lib/messages/crm";
import { recordSheetMessages } from "@/lib/messages/record-sheet";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

function useNhap<T extends Record<string, string>>(dau: T) {
	const khai = useKhaiThayDoi();
	const [nhap, datNhap] = useState(dau);
	const coChu = (gia: T) => Object.values(gia).some((o) => o.trim() !== "");
	const doi = (thay: Partial<T>) => {
		const ke = { ...nhap, ...thay };
		datNhap(ke);
		khai(coChu(ke));
	};
	return { nhap, doi, ban: coChu(nhap), xong: () => khai(false) };
}

function QuickAddForm({
	submitLabel,
	pending,
	ready,
	dirty,
	onSubmit,
	onCancel,
	children,
}: {
	submitLabel: string;
	pending: boolean;
	ready: boolean;
	dirty: boolean;
	onSubmit: () => void;
	onCancel: () => void;
	children: React.ReactNode;
}) {
	const cancel = crmMessages(useLocale()).sheet.cancel;
	const hop = useMessages().dialog.boThayDoi;
	const [hoi, datHoi] = useState(false);

	return (
		<form
			className="flex shrink-0 flex-col gap-4 border-b px-5 py-4"
			action={onSubmit}
		>
			<div className="grid gap-4 sm:grid-cols-2">{children}</div>
			<div className="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={pending}
					onClick={() => (dirty ? datHoi(true) : onCancel())}
				>
					{cancel}
				</Button>
				<Button type="submit" size="sm" disabled={pending || !ready}>
					{pending ? <Spinner /> : null}
					{submitLabel}
				</Button>
			</div>
			<ConfirmDialog
				open={hoi}
				onOpenChange={datHoi}
				tieuDe={hop.tieuDe}
				than={hop.than}
				nut={hop.bo}
				thoi={hop.tiepTuc}
				pending={false}
				tone="destructive"
				onConfirm={() => {
					datHoi(false);
					onCancel();
				}}
			/>
		</form>
	);
}

export function QuickAddContact({
	companyId,
	ownerId,
	onDone,
}: {
	companyId: string;
	ownerId: string | null;
	onDone: () => void;
}) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const sheet = recordSheetMessages(useLocale());
	const m = sheet.contact;

	const { nhap, doi, ban, xong } = useNhap({
		firstName: "",
		lastName: "",
		email: "",
		title: "",
	});
	const { firstName, lastName, email, title } = nhap;

	const firstNameId = useId();
	const lastNameId = useId();
	const emailId = useId();
	const titleId = useId();

	const create = useMutation(
		trpc.contacts.create.mutationOptions({
			onSuccess: async (contact) => {
				await cache.contact(contact.id);
				toast.success(m.added(contact.firstName));
				xong();
				onDone();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<QuickAddForm
			submitLabel={sheet.company.addContact}
			pending={create.isPending}
			ready={firstName.trim() !== ""}
			dirty={ban}
			onCancel={onDone}
			onSubmit={() =>
				create.mutate({
					firstName,
					lastName: lastName || undefined,
					email: email || undefined,
					title: title || undefined,
					companyId,
					ownerId,
				})
			}
		>
			<Field>
				<FieldLabel htmlFor={firstNameId}>{m.firstName}</FieldLabel>
				<Input
					id={firstNameId}
					autoFocus
					value={firstName}
					onChange={(event) => doi({ firstName: event.target.value })}
					autoComplete="off"
				/>
			</Field>
			<Field>
				<FieldLabel htmlFor={lastNameId}>{m.lastName}</FieldLabel>
				<Input
					id={lastNameId}
					value={lastName}
					onChange={(event) => doi({ lastName: event.target.value })}
					autoComplete="off"
				/>
			</Field>
			<Field>
				<FieldLabel htmlFor={emailId}>{m.fields.email}</FieldLabel>
				<Input
					id={emailId}
					type="email"
					value={email}
					onChange={(event) => doi({ email: event.target.value })}
					autoComplete="off"
				/>
			</Field>
			<Field>
				<FieldLabel htmlFor={titleId}>{m.fields.title}</FieldLabel>
				<Input
					id={titleId}
					value={title}
					onChange={(event) => doi({ title: event.target.value })}
					placeholder={m.rolePlaceholder}
					autoComplete="off"
				/>
			</Field>
		</QuickAddForm>
	);
}

export function AttachDealContact({
	dealId,
	companyName,
	onDone,
}: {
	dealId: string;
	companyName: string;
	onDone: () => void;
}) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const locale = useLocale();
	const m = recordSheetMessages(locale).deal;

	const { nhap, doi, ban, xong } = useNhap({ contactId: "", role: "" });
	const { contactId, role } = nhap;

	const personId = useId();
	const roleId = useId();

	const options = useQuery(trpc.deals.contactOptions.queryOptions({ dealId }));
	const candidates = options.data ?? [];

	const attach = useMutation(
		trpc.deals.attachContact.mutationOptions({
			onSuccess: async (attached) => {
				const person = candidates.find(
					(candidate) => candidate.id === attached.contactId,
				);
				await cache.deal(dealId);
				toast.success(person ? m.onDeal(contactName(person)) : m.addedToDeal);
				xong();
				onDone();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const nobody = !options.isPending && candidates.length === 0;

	const placeholder = options.isPending
		? crmMessages(locale).misc.loading
		: nobody
			? m.everybodyOn(companyName)
			: m.chooseSomebody;

	return (
		<QuickAddForm
			submitLabel={m.addToDeal}
			pending={attach.isPending}
			ready={contactId !== ""}
			dirty={ban}
			onCancel={onDone}
			onSubmit={() =>
				attach.mutate({ dealId, contactId, role: role.trim() || null })
			}
		>
			<Field>
				<FieldLabel htmlFor={personId}>{m.personLabel}</FieldLabel>
				<Select
					value={contactId}
					onValueChange={(contactId) => doi({ contactId })}
				>
					<SelectTrigger id={personId} className="w-full" disabled={nobody}>
						<SelectValue placeholder={placeholder} />
					</SelectTrigger>
					<SelectContent>
						{candidates.map((candidate) => (
							<SelectItem key={candidate.id} value={candidate.id}>
								{contactName(candidate)}
								{candidate.title ? ` · ${candidate.title}` : ""}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Field>
			<Field>
				<FieldLabel htmlFor={roleId}>{m.role}</FieldLabel>
				<Input
					id={roleId}
					value={role}
					onChange={(event) => doi({ role: event.target.value })}
					placeholder={m.champion}
					autoComplete="off"
				/>
			</Field>
		</QuickAddForm>
	);
}

export function QuickAddDeal({
	companyId,
	companyName,
	ownerId,
	onDone,
}: {
	companyId: string;
	companyName: string;
	ownerId: string | null;
	onDone: () => void;
}) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const locale = useLocale();
	const m = recordSheetMessages(locale).deal;

	const { nhap, doi, ban, xong } = useNhap({
		name: "",
		amount: "",
		closeDate: "",
	});
	const { name, amount, closeDate } = nhap;

	const nameId = useId();
	const amountId = useId();
	const closeId = useId();

	const me = useQuery(trpc.users.me.queryOptions());
	const settings = useQuery(trpc.currency.settings.queryOptions());
	const owner = ownerId ?? me.data?.id ?? null;
	const currency = settings.data?.reportingCurrency ?? null;
	const currencyFailed = currency === null && settings.isError;
	const amountRef = useRef<HTMLInputElement>(null);

	const create = useMutation(
		trpc.deals.create.mutationOptions({
			onSuccess: async (deal) => {
				await cache.deal(deal.id);
				toast.success(m.created(deal.name));
				xong();
				onDone();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const submit = () => {
		if (!owner) {
			toast.error(m.noOwner);
			return;
		}

		if (currency === null && amount.trim() !== "") {
			amountRef.current?.focus();
			return;
		}

		const reading =
			currency === null ? null : parseMoneyInput(amount, { locale, currency });
		if (reading?.kind === "invalid") {
			amountRef.current?.focus();
			return;
		}

		create.mutate({
			name,
			companyId,
			ownerId: owner,
			amountCents: reading?.kind === "ok" ? reading.cents : null,
			currency: currency ?? undefined,
			expectedCloseDate: closeDate || null,
		});
	};

	return (
		<QuickAddForm
			submitLabel={m.create}
			pending={create.isPending}
			ready={name.trim() !== "" && (currency !== null || currencyFailed)}
			dirty={ban}
			onCancel={onDone}
			onSubmit={submit}
		>
			<Field className="sm:col-span-2">
				<FieldLabel htmlFor={nameId}>{m.contactColumns.name}</FieldLabel>
				<Input
					id={nameId}
					autoFocus
					value={name}
					onChange={(event) => doi({ name: event.target.value })}
					placeholder={m.namePlaceholder(companyName)}
					autoComplete="off"
				/>
			</Field>
			<Field>
				<FieldLabel htmlFor={amountId}>{m.fields.amount}</FieldLabel>
				<MoneyInput
					id={amountId}
					ref={amountRef}
					value={amount}
					onValueChange={(amount) => doi({ amount })}
					currency={currency}
					missingCurrency={
						currencyFailed ? m.currencyLoadFailed : m.currencyLoading
					}
					end={
						currencyFailed ? (
							<Button
								type="button"
								variant="outline"
								onClick={() => void settings.refetch()}
							>
								{m.retry}
							</Button>
						) : undefined
					}
				/>
			</Field>
			<Field>
				<FieldLabel htmlFor={closeId}>{m.expectedClose}</FieldLabel>
				<DatePicker
					id={closeId}
					value={closeDate}
					onChange={(closeDate) => doi({ closeDate })}
					placeholder={m.noDate}
				/>
			</Field>
		</QuickAddForm>
	);
}
