"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import {
	Field,
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
import { Spinner } from "@crm/ui/components/spinner";
import { docSoDienThoai } from "@crm/validation/so-dien-thoai";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsBoolean, useQueryState } from "nuqs";
import {
	type ComponentProps,
	Suspense,
	useId,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import { CompanyPicker } from "@/components/crm/company-picker";
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
		<Suspense fallback={<AddButton disabled />}>
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
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phone, setPhone] = useState("");
	const [phoneInvalid, setPhoneInvalid] = useState(false);
	const phoneRef = useRef<HTMLInputElement>(null);
	const [email, setEmail] = useState("");
	const [title, setTitle] = useState("");
	const [company, setCompany] = useState(companyId ?? NONE);
	const [ownerId, setOwnerId] = useState(NONE);

	const firstNameId = useId();
	const lastNameId = useId();
	const phoneId = useId();
	const emailId = useId();
	const titleId = useId();

	const users = useQuery(trpc.users.list.queryOptions());

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
				setFirstName("");
				setLastName("");
				setPhone("");
				setEmail("");
				setTitle("");
				openRecord({ kind: "contact", id: contact.id });
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
					id="create-contact"
					className="flex-1 overflow-y-auto px-4"
					onSubmit={(event) => {
						event.preventDefault();
						if (docSoDienThoai(phone).kind === "sai") {
							setPhoneInvalid(true);
							phoneRef.current?.focus();
							return;
						}
						create.mutate({
							firstName,
							lastName: lastName || undefined,
							phone: phone || undefined,
							email: email || undefined,
							title: title || undefined,
							companyId: company === NONE ? null : company,
							ownerId: ownerId === NONE ? null : ownerId,
						});
					}}
				>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor={firstNameId}>
								{m.create.firstName}
							</FieldLabel>
							<Input
								id={firstNameId}
								value={firstName}
								onChange={(event) => setFirstName(event.target.value)}
								autoComplete="off"
								required
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor={lastNameId}>{m.create.lastName}</FieldLabel>
							<Input
								id={lastNameId}
								value={lastName}
								onChange={(event) => setLastName(event.target.value)}
								autoComplete="off"
							/>
						</Field>

						<Field data-invalid={phoneInvalid || undefined}>
							<FieldLabel htmlFor={phoneId}>{m.create.phone}</FieldLabel>
							<Input
								id={phoneId}
								ref={phoneRef}
								type="tel"
								inputMode="tel"
								value={phone}
								onChange={(event) => {
									setPhoneInvalid(false);
									setPhone(event.target.value);
								}}
								placeholder={m.create.phonePlaceholder}
								aria-invalid={phoneInvalid || undefined}
								autoComplete="off"
							/>
							{phoneInvalid ? (
								<FieldError>{m.create.phoneInvalid}</FieldError>
							) : null}
						</Field>

						<Field>
							<FieldLabel htmlFor={emailId}>{m.create.email}</FieldLabel>
							<Input
								id={emailId}
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								autoComplete="off"
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor={titleId}>{m.create.jobTitle}</FieldLabel>
							<Input
								id={titleId}
								value={title}
								onChange={(event) => setTitle(event.target.value)}
								placeholder={m.create.titlePlaceholder}
								autoComplete="off"
							/>
						</Field>

						<Field>
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

						<Field>
							<FieldLabel htmlFor="create-contact-owner">
								{m.create.owner}
							</FieldLabel>
							<Select value={ownerId} onValueChange={setOwnerId}>
								<SelectTrigger id="create-contact-owner">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={NONE}>{m.create.unassigned}</SelectItem>
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
						form="create-contact"
						disabled={create.isPending || firstName.trim() === ""}
					>
						{create.isPending ? <Spinner /> : null}
						{m.create.submit}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
