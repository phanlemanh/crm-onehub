"use client";

import Add from "@carbon/icons-react/es/Add";
import { CURRENCIES } from "@crm/db/currency";
import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
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
import { Skeleton } from "@crm/ui/components/skeleton";
import { Spinner } from "@crm/ui/components/spinner";
import { parseMoneyInput } from "@crm/ui/lib/money-input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsBoolean, useQueryState } from "nuqs";
import { type ComponentProps, Fragment, Suspense, useState } from "react";
import { toast } from "sonner";
import { CompanyPicker } from "@/components/crm/company-picker";
import { useFormTao } from "@/components/crm/fields/form-tao";
import {
	idOTao,
	type MoTaTao,
	OTruongTao,
} from "@/components/crm/fields/kieu-truong";
import { nhanTruongChuan } from "@/components/crm/fields/truong-chuan";
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
		<Suspense fallback={<Skeleton className="h-8 w-28 rounded-md" />}>
			<CreateDealForm companyId={companyId} />
		</Suspense>
	);
}

function CreateDealForm({ companyId }: { companyId?: string }) {
	const [open, setOpen] = useQueryState(
		SEARCH_PARAM.dialog.create,
		parseAsBoolean.withDefault(false),
	);
	const form = useFormTao("DEAL", open);
	const [company, setCompany] = useState(companyId ?? UNSET);
	const [stage, setStage] = useState("");

	return (
		<Sheet open={open} onOpenChange={(next) => setOpen(next || null)}>
			<SheetTrigger asChild>
				<AddButton />
			</SheetTrigger>
			<SheetContent side="right">
				<CreateDealBody
					form={form}
					company={company}
					setCompany={setCompany}
					stage={stage}
					setStage={setStage}
					onDone={() => setOpen(null)}
				/>
			</SheetContent>
		</Sheet>
	);
}

function CreateDealBody({
	form,
	company,
	setCompany,
	stage,
	setStage,
	onDone,
}: {
	form: ReturnType<typeof useFormTao>;
	company: string;
	setCompany: (company: string) => void;
	stage: string;
	setStage: (stage: string) => void;
	onDone: () => Promise<unknown>;
}) {
	const locale = useLocale();
	const m = dealMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const openRecord = useOpenRecord();
	const giaiDoan = useGiaiDoan();
	const stageHien = stage || giaiDoan.open[0]?.id || "";

	const users = useQuery(trpc.users.list.queryOptions());
	const me = useQuery(trpc.users.me.queryOptions());
	const currencies = useQuery(trpc.currency.settings.queryOptions());
	const nguoiDung = users.data ?? [];

	const resolvedOwner = form.chuoiChuan("owner") || me.data?.id || UNSET;
	const workspaceCurrency = currencies.data?.reportingCurrency;
	const knownCurrency =
		form.chuoiChuan("currency") || workspaceCurrency || null;

	const moTaChuan = (key: string): MoTaTao => {
		if (key === "name")
			return form.moTaChuan(key, {
				goiY: m.create.namePlaceholder,
				tuDongFocus: true,
			});
		if (key === "amount")
			return form.moTaChuan(key, {
				tienTe: knownCurrency,
				thieuTienTe: currencies.isError
					? m.create.currencyLoadFailed
					: m.create.currencyLoading,
			});
		if (key === "currency")
			return form.moTaChuan(key, {
				giaTri: knownCurrency ?? "",
				goiY: m.create.currency,
				luaChon: CURRENCIES.map((entry) => ({
					value: entry.code,
					label: entry.code,
				})),
			});
		if (key === "owner")
			return form.moTaChuan(key, {
				giaTri: resolvedOwner,
				goiY: m.create.chooseOwner,
				nguoiDung,
			});
		return form.moTaChuan(key);
	};

	const hang = form.muc.map((muc) =>
		muc.kind === "standard"
			? muc.key === "company"
				? ({ kind: "congTy" } as const)
				: ({ kind: "o", moTa: moTaChuan(muc.key) } as const)
			: ({ kind: "o", moTa: form.moTaTuTao(muc.field, nguoiDung) } as const),
	);
	const dsMoTa = hang.flatMap((h) => (h.kind === "o" ? [h.moTa] : []));

	const create = useMutation(
		trpc.deals.create.mutationOptions({
			onSuccess: async (deal) => {
				await cache.deal(deal.id);
				toast.success(m.created(deal.name));
				await onDone();
				form.xoa();
				openRecord({ kind: "deal", id: deal.id });
			},
			onError: (error) => {
				const loi = form.docLoi(error, dsMoTa);
				toast.error(loi ? loi.toast : error.message);
			},
		}),
	);

	const ready =
		form.chuoiChuan("name") !== "" &&
		company !== UNSET &&
		resolvedOwner !== UNSET;

	const focusO = (key: string) =>
		document.getElementById(idOTao(form.khoaChuan(key)))?.focus();

	return (
		<>
			<SheetHeader>
				<SheetTitle>{m.create.title}</SheetTitle>
				<SheetDescription>{m.create.description}</SheetDescription>
			</SheetHeader>

			<form
				id="create-deal"
				className="flex-1 overflow-y-auto px-4"
				aria-busy={form.dangTai || undefined}
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					const ket = form.kiem(
						dsMoTa.filter((moTa) => moTa.khoa !== form.khoaChuan("currency")),
					);
					if (!ket.hopLe) return;
					const amount = form.chuoiChuan("amount");
					if (knownCurrency === null && amount !== "") {
						focusO("currency");
						return;
					}
					const reading =
						knownCurrency === null
							? null
							: parseMoneyInput(amount, { locale, currency: knownCurrency });
					if (reading?.kind === "invalid") {
						focusO("amount");
						return;
					}
					create.mutate({
						name: form.chuoiChuan("name"),
						companyId: company,
						stage: stage || undefined,
						expectedCloseDate: form.chuoiChuan("expectedCloseDate") || null,
						ownerId: resolvedOwner,
						amountCents: reading?.kind === "ok" ? reading.cents : null,
						currency: knownCurrency ?? undefined,
						fields: ket.fields,
					});
				}}
			>
				<FieldGroup>
					{hang.map((h) =>
						h.kind === "o" ? (
							<OTruongTao key={h.moTa.khoa} moTa={h.moTa} />
						) : (
							<Fragment key="company">
								<Field>
									<FieldLabel htmlFor="create-deal-company">
										{nhanTruongChuan("DEAL", "company", locale)}
									</FieldLabel>
									<CompanyPicker
										id="create-deal-company"
										value={company}
										onValueChange={setCompany}
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor="create-deal-stage">
										{m.create.stage}
									</FieldLabel>
									<Select value={stageHien} onValueChange={setStage}>
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
							</Fragment>
						),
					)}
				</FieldGroup>
			</form>

			<SheetFooter>
				<SheetClose asChild>
					<Button variant="outline">{m.create.cancel}</Button>
				</SheetClose>
				<Button
					type="submit"
					form="create-deal"
					disabled={create.isPending || form.dangTai || !ready}
				>
					{create.isPending ? <Spinner /> : null}
					{m.create.submit}
				</Button>
			</SheetFooter>
		</>
	);
}
