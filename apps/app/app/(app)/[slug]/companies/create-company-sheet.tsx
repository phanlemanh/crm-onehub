"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
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
import { nenTangCuaTenMien } from "@crm/validation/ten-mien-nen-tang";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsBoolean, useQueryState } from "nuqs";
import { type ComponentProps, Suspense, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { companyMessages } from "@/lib/messages/companies";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const UNASSIGNED = "unassigned";

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
	const [name, setName] = useState("");
	const [domain, setDomain] = useState("");
	const [loiTenMien, setLoiTenMien] = useState<string | null>(null);
	const oTenMien = useRef<HTMLInputElement>(null);
	const [ownerId, setOwnerId] = useState(UNASSIGNED);

	const nameId = useId();
	const domainId = useId();
	const loiTenMienId = useId();

	const users = useQuery(trpc.users.list.queryOptions());

	const create = useMutation(
		trpc.companies.create.mutationOptions({
			onSuccess: async (company) => {
				await cache.company(company.id);
				toast.success(m.created(company.name));
				await setOpen(null);
				setName("");
				setDomain("");
				setOwnerId(UNASSIGNED);
				openRecord({ kind: "company", id: company.id });
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
				<SheetHeader>
					<SheetTitle>{m.create.title}</SheetTitle>
					<SheetDescription>{m.create.description}</SheetDescription>
				</SheetHeader>

				<form
					id="create-company"
					className="flex-1 overflow-y-auto px-4"
					onSubmit={(event) => {
						event.preventDefault();
						const nenTang = nenTangCuaTenMien(domain);
						if (nenTang) {
							setLoiTenMien(m.nenTang(nenTang.ten));
							oTenMien.current?.focus();
							return;
						}
						create.mutate({
							name,
							domain: domain || undefined,
							ownerId: ownerId === UNASSIGNED ? null : ownerId,
						});
					}}
				>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor={nameId}>{m.create.name}</FieldLabel>
							<Input
								id={nameId}
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder={m.create.namePlaceholder}
								autoComplete="off"
								required
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor={domainId}>{m.create.domain}</FieldLabel>
							<Input
								ref={oTenMien}
								id={domainId}
								value={domain}
								onChange={(event) => {
									setDomain(event.target.value);
									setLoiTenMien(null);
								}}
								placeholder={m.create.domainPlaceholder}
								autoComplete="off"
								inputMode="url"
								aria-invalid={loiTenMien ? true : undefined}
								aria-describedby={loiTenMien ? loiTenMienId : undefined}
							/>
							{loiTenMien ? (
								<FieldError id={loiTenMienId}>{loiTenMien}</FieldError>
							) : null}
							<FieldDescription>{m.create.domainHint}</FieldDescription>
						</Field>

						<Field>
							<FieldLabel htmlFor="create-company-owner">
								{m.create.owner}
							</FieldLabel>
							<Select value={ownerId} onValueChange={setOwnerId}>
								<SelectTrigger id="create-company-owner">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={UNASSIGNED}>
										{m.create.unassigned}
									</SelectItem>
									{(users.data ?? []).map((user) => (
										<SelectItem key={user.id} value={user.id}>
											{user.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					</FieldGroup>
				</form>

				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">{m.create.cancel}</Button>
					</SheetClose>
					<Button
						type="submit"
						form="create-company"
						disabled={create.isPending || name.trim() === ""}
					>
						{create.isPending ? <Spinner /> : null}
						{m.create.submit}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
