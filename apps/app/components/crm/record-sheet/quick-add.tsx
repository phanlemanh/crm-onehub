"use client";

import { CURRENCIES } from "@crm/db/currency";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { Field, FieldLabel } from "@crm/ui/components/field";
import { useKhaiThayDoi } from "@crm/ui/components/giu-thay-doi";
import { Input } from "@crm/ui/components/input";
import { useLocale, useMessages } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Spinner } from "@crm/ui/components/spinner";
import { parseMoneyInput } from "@crm/ui/lib/money-input";
import { docSoDienThoai } from "@crm/validation/so-dien-thoai";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { contactName } from "@/components/crm/contact-name";
import { useFormTao } from "@/components/crm/fields/form-tao";
import {
	idOTao,
	type MoTaTao,
	OTruongTao,
} from "@/components/crm/fields/kieu-truong";
import { SoDienThoai } from "@/components/crm/so-dien-thoai";
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
			noValidate
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

function useKhaiForm(ban: boolean) {
	const khai = useKhaiThayDoi();
	useEffect(() => {
		khai(ban);
	}, [khai, ban]);
	return () => khai(false);
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
	const form = useFormTao("CONTACT");
	const xong = useKhaiForm(form.banTatCa);
	const users = useQuery(trpc.users.list.queryOptions());
	const nguoiDung = users.data ?? [];
	const chuDangChon = form.chuan("owner");
	const chu = chuDangChon === undefined ? (ownerId ?? "") : String(chuDangChon);

	const moTaChuan = (key: string, dau: boolean): MoTaTao => {
		if (key === "phone")
			return form.moTaChuan(key, {
				goiY: m.phonePlaceholder,
				kiemRieng: (chuoi) =>
					docSoDienThoai(chuoi).kind === "sai" ? m.phoneInvalid : null,
				tuDongFocus: dau,
			});
		if (key === "title")
			return form.moTaChuan(key, { goiY: m.rolePlaceholder, tuDongFocus: dau });
		if (key === "owner")
			return form.moTaChuan(key, { giaTri: chu, nguoiDung, tuDongFocus: dau });
		return form.moTaChuan(key, { tuDongFocus: dau });
	};

	const dsMoTa = form.muc
		.filter((muc) => !(muc.kind === "standard" && muc.key === "company"))
		.map((muc, i) =>
			muc.kind === "standard"
				? moTaChuan(muc.key, i === 0)
				: form.moTaTuTao(muc.field, nguoiDung),
		);

	const create = useMutation(
		trpc.contacts.create.mutationOptions({
			onSuccess: async (contact) => {
				await cache.contact(contact.id);
				toast.success(m.added(contact.firstName));
				xong();
				onDone();
			},
			onError: (error) => {
				const loi = form.docLoi(error, dsMoTa);
				toast.error(loi ? loi.toast : error.message);
			},
		}),
	);

	const tuy = (key: string) => form.chuoiChuan(key) || undefined;

	return (
		<QuickAddForm
			submitLabel={sheet.company.addContact}
			pending={create.isPending}
			ready={!form.dangTai && form.chuoiChuan("firstName") !== ""}
			dirty={form.banTatCa}
			onCancel={onDone}
			onSubmit={() => {
				const ket = form.kiem(dsMoTa);
				if (!ket.hopLe) return;
				create.mutate({
					firstName: form.chuoiChuan("firstName"),
					lastName: tuy("lastName"),
					phone: tuy("phone"),
					email: tuy("email"),
					title: tuy("title"),
					linkedinUrl: tuy("linkedin"),
					twitterUrl: tuy("x"),
					githubUrl: tuy("github"),
					companyId,
					ownerId: chu.trim() || null,
					fields: ket.fields,
				});
			}}
		>
			{dsMoTa.map((moTa) => (
				<OTruongTao key={moTa.khoa} moTa={moTa} />
			))}
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
								{candidate.phone ? (
									<>
										{" · "}
										<SoDienThoai so={candidate.phone} />
									</>
								) : null}
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
	const form = useFormTao("DEAL");
	const xong = useKhaiForm(form.banTatCa);

	const users = useQuery(trpc.users.list.queryOptions());
	const me = useQuery(trpc.users.me.queryOptions());
	const settings = useQuery(trpc.currency.settings.queryOptions());
	const nguoiDung = users.data ?? [];
	const owner = form.chuoiChuan("owner") || ownerId || me.data?.id || null;
	const currency =
		form.chuoiChuan("currency") || settings.data?.reportingCurrency || null;
	const currencyFailed = currency === null && settings.isError;

	const moTaChuan = (key: string, dau: boolean): MoTaTao => {
		if (key === "name")
			return form.moTaChuan(key, {
				goiY: m.namePlaceholder(companyName),
				tuDongFocus: dau,
			});
		if (key === "amount")
			return form.moTaChuan(key, {
				tienTe: currency,
				thieuTienTe: currencyFailed ? m.currencyLoadFailed : m.currencyLoading,
				cuoi: currencyFailed ? (
					<Button
						type="button"
						variant="outline"
						onClick={() => void settings.refetch()}
					>
						{m.retry}
					</Button>
				) : undefined,
				tuDongFocus: dau,
			});
		if (key === "currency")
			return form.moTaChuan(key, {
				giaTri: currency ?? "",
				luaChon: CURRENCIES.map((entry) => ({
					value: entry.code,
					label: entry.code,
				})),
				tuDongFocus: dau,
			});
		if (key === "owner")
			return form.moTaChuan(key, {
				giaTri: owner ?? "",
				nguoiDung,
				tuDongFocus: dau,
			});
		return form.moTaChuan(key, { tuDongFocus: dau });
	};

	const dsMoTa = form.muc
		.filter((muc) => !(muc.kind === "standard" && muc.key === "company"))
		.map((muc, i) =>
			muc.kind === "standard"
				? moTaChuan(muc.key, i === 0)
				: form.moTaTuTao(muc.field, nguoiDung),
		);

	const create = useMutation(
		trpc.deals.create.mutationOptions({
			onSuccess: async (deal) => {
				await cache.deal(deal.id);
				toast.success(m.created(deal.name));
				xong();
				onDone();
			},
			onError: (error) => {
				const loi = form.docLoi(error, dsMoTa);
				toast.error(loi ? loi.toast : error.message);
			},
		}),
	);

	const focusO = (key: string) =>
		document.getElementById(idOTao(form.khoaChuan(key)))?.focus();

	const submit = () => {
		if (!owner) {
			toast.error(m.noOwner);
			return;
		}
		const ket = form.kiem(
			dsMoTa.filter((moTa) => moTa.khoa !== form.khoaChuan("currency")),
		);
		if (!ket.hopLe) return;

		const amount = form.chuoiChuan("amount");
		if (currency === null && amount !== "") {
			focusO("amount");
			return;
		}

		const reading =
			currency === null ? null : parseMoneyInput(amount, { locale, currency });
		if (reading?.kind === "invalid") {
			focusO("amount");
			return;
		}

		create.mutate({
			name: form.chuoiChuan("name"),
			companyId,
			ownerId: owner,
			amountCents: reading?.kind === "ok" ? reading.cents : null,
			currency: currency ?? undefined,
			expectedCloseDate: form.chuoiChuan("expectedCloseDate") || null,
			fields: ket.fields,
		});
	};

	return (
		<QuickAddForm
			submitLabel={m.create}
			pending={create.isPending}
			ready={
				!form.dangTai &&
				form.chuoiChuan("name") !== "" &&
				(currency !== null || currencyFailed)
			}
			dirty={form.banTatCa}
			onCancel={onDone}
			onSubmit={submit}
		>
			{dsMoTa.map((moTa) => (
				<OTruongTao key={moTa.khoa} moTa={moTa} />
			))}
		</QuickAddForm>
	);
}
