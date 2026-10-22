"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import { FieldDescription, FieldGroup } from "@crm/ui/components/field";
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
import { nenTangCuaTenMien } from "@crm/validation/ten-mien-nen-tang";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsBoolean, useQueryState } from "nuqs";
import { type ComponentProps, Suspense } from "react";
import { toast } from "sonner";
import { useFormTao } from "@/components/crm/fields/form-tao";
import { type MoTaTao, OTruongTao } from "@/components/crm/fields/kieu-truong";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { companyMessages } from "@/lib/messages/companies";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

function AddButton(props: ComponentProps<typeof Button>) {
	const m = companyMessages(useLocale());
	return (
		<Button {...props}>
			<Icon icon={Add} data-icon="inline-start" />
			{m.create.newButton}
		</Button>
	);
}

export function CreateCompanySheet() {
	return (
		<Suspense fallback={<Skeleton className="h-8 w-28 rounded-md" />}>
			<CreateCompanyForm />
		</Suspense>
	);
}

function CreateCompanyForm() {
	const m = companyMessages(useLocale());
	const openRecord = useOpenRecord();
	const trpc = useTRPC();
	const cache = useCrmCache();

	const [open, setOpen] = useQueryState(
		SEARCH_PARAM.dialog.create,
		parseAsBoolean.withDefault(false),
	);
	const form = useFormTao("COMPANY", open);
	const users = useQuery(trpc.users.list.queryOptions());
	const nguoiDung = users.data ?? [];

	const moTaChuan = (key: string): MoTaTao => {
		if (key === "name")
			return form.moTaChuan(key, {
				goiY: m.create.namePlaceholder,
				tuDongFocus: true,
			});
		if (key === "domain")
			return form.moTaChuan(key, {
				goiY: m.create.domainPlaceholder,
				moTaPhu: <FieldDescription>{m.create.domainHint}</FieldDescription>,
				kiemRieng: (chuoi) => {
					const nenTang = nenTangCuaTenMien(chuoi);
					return nenTang ? m.nenTang(nenTang.ten) : null;
				},
			});
		if (key === "owner")
			return form.moTaChuan(key, {
				nguoiDung,
				nhanRong: m.create.unassigned,
			});
		return form.moTaChuan(key);
	};

	const dsMoTa = form.muc.map((muc) =>
		muc.kind === "standard"
			? moTaChuan(muc.key)
			: form.moTaTuTao(muc.field, nguoiDung),
	);

	const create = useMutation(
		trpc.companies.create.mutationOptions({
			onSuccess: async (company) => {
				await cache.company(company.id);
				toast.success(m.created(company.name));
				await setOpen(null);
				form.xoa();
				openRecord({ kind: "company", id: company.id });
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
					id="create-company"
					className="flex-1 overflow-y-auto px-4"
					aria-busy={form.dangTai || undefined}
					noValidate
					onSubmit={(event) => {
						event.preventDefault();
						const ket = form.kiem(dsMoTa);
						if (!ket.hopLe) return;
						create.mutate({
							name: form.chuoiChuan("name"),
							domain: tuy("domain"),
							website: tuy("website"),
							phone: tuy("phone"),
							email: tuy("email"),
							city: tuy("city"),
							country: tuy("country"),
							ownerId: form.chuoiChuan("owner") || null,
							fields: ket.fields,
						});
					}}
				>
					<FieldGroup>
						{dsMoTa.map((moTa) => (
							<OTruongTao key={moTa.khoa} moTa={moTa} />
						))}
					</FieldGroup>
				</form>

				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">{m.create.cancel}</Button>
					</SheetClose>
					<Button
						type="submit"
						form="create-company"
						disabled={
							create.isPending || form.dangTai || form.chuoiChuan("name") === ""
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
