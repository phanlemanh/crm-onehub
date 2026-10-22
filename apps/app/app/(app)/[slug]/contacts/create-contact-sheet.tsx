"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
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
import { docSoDienThoai } from "@crm/validation/so-dien-thoai";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsBoolean, useQueryState } from "nuqs";
import { type ComponentProps, Suspense, useState } from "react";
import { toast } from "sonner";
import { CompanyPicker } from "@/components/crm/company-picker";
import { useFormTao } from "@/components/crm/fields/form-tao";
import { type MoTaTao, OTruongTao } from "@/components/crm/fields/kieu-truong";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { contactMessages } from "@/lib/messages/contacts";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const NONE = "none";

function AddButton(props: ComponentProps<typeof Button>) {
	const m = contactMessages(useLocale());
	return (
		<Button {...props}>
			<Icon icon={Add} data-icon="inline-start" />
			{m.create.newButton}
		</Button>
	);
}

export function CreateContactSheet({ companyId }: { companyId?: string }) {
	return (
		<Suspense fallback={<Skeleton className="h-8 w-28 rounded-md" />}>
			<CreateContactForm companyId={companyId} />
		</Suspense>
	);
}

function CreateContactForm({ companyId }: { companyId?: string }) {
	const m = contactMessages(useLocale());
	const openRecord = useOpenRecord();
	const trpc = useTRPC();
	const cache = useCrmCache();

	const [open, setOpen] = useQueryState(
		SEARCH_PARAM.dialog.create,
		parseAsBoolean.withDefault(false),
	);
	const form = useFormTao("CONTACT", open);
	const [company, setCompany] = useState(companyId ?? NONE);
	const users = useQuery(trpc.users.list.queryOptions());
	const nguoiDung = users.data ?? [];

	const moTaChuan = (key: string): MoTaTao => {
		if (key === "phone")
			return form.moTaChuan(key, {
				goiY: m.create.phonePlaceholder,
				kiemRieng: (chuoi) =>
					docSoDienThoai(chuoi).kind === "sai" ? m.create.phoneInvalid : null,
			});
		if (key === "title")
			return form.moTaChuan(key, { goiY: m.create.titlePlaceholder });
		if (key === "owner")
			return form.moTaChuan(key, {
				nguoiDung,
				nhanRong: m.create.unassigned,
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
		trpc.contacts.create.mutationOptions({
			onSuccess: async (contact) => {
				await cache.contact(contact.id);
				toast.success(
					m.created(
						[contact.firstName, contact.lastName].filter(Boolean).join(" "),
					),
				);
				await setOpen(null);
				form.xoa();
				openRecord({ kind: "contact", id: contact.id });
			},
			onError: (error) => {
				const loi = form.docLoi(error, dsMoTa);
				toast.error(loi ? loi.toast : error.message);
			},
		}),
	);

	const tuy = (key: string) => form.chuoiChuan(key) || undefined;

	return (
		<Sheet open={open} onOpenChange={(next) => setOpen(next || null)}>
			<SheetTrigger asChild>
				<AddButton />
			</SheetTrigger>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>{m.create.title}</SheetTitle>
					<SheetDescription>{m.create.description}</SheetDescription>
				</SheetHeader>

				<form
					id="create-contact"
					className="flex-1 overflow-y-auto px-4"
					aria-busy={form.dangTai || undefined}
					noValidate
					onSubmit={(event) => {
						event.preventDefault();
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
							companyId: company === NONE ? null : company,
							ownerId: form.chuoiChuan("owner") || null,
							fields: ket.fields,
						});
					}}
				>
					<FieldGroup>
						{hang.map((h) =>
							h.kind === "o" ? (
								<OTruongTao key={h.moTa.khoa} moTa={h.moTa} />
							) : (
								<Field key="company">
									<FieldLabel htmlFor="create-contact-company">
										{m.create.company}
									</FieldLabel>
									<CompanyPicker
										id="create-contact-company"
										value={company}
										onValueChange={setCompany}
										none={{ value: NONE, label: m.create.noCompany }}
									/>
								</Field>
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
						form="create-contact"
						disabled={
							create.isPending ||
							form.dangTai ||
							form.chuoiChuan("firstName") === ""
						}
					>
						{create.isPending ? <Spinner /> : null}
						{m.create.submit}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
