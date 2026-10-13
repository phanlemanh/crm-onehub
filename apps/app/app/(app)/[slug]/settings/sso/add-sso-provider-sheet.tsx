"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import { CopyValue } from "@crm/ui/components/copy-value";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crm/ui/components/input-group";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsBoolean, useQueryState } from "nuqs";
import { type ComponentProps, Suspense, useId, useState } from "react";
import { toast } from "sonner";
import { PageShellNote } from "@/components/page-shell-note";
import { ssoMessages } from "@/lib/messages/settings-sso";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const FORM = "add-sso-provider";

const EMPTY = {
	providerId: "",
	issuer: "",
	domain: "",
	clientId: "",
	clientSecret: "",
};

function AddButton(props: ComponentProps<typeof Button>) {
	const t = ssoMessages(useLocale());

	return (
		<Button {...props}>
			<Icon icon={Add} data-icon="inline-start" />
			{t.them.nut}
		</Button>
	);
}

export const ID_KHOA_SSO = "sso-khoa-them";

export function DongKhoaSso() {
	const t = ssoMessages(useLocale());
	const trpc = useTRPC();
	const settings = useQuery(trpc.sso.settings.queryOptions());
	if (settings.data?.canConfigure !== false) return null;
	return (
		<PageShellNote data-ly-do-khoa="" id={ID_KHOA_SSO}>
			{t.them.khoaLyDo}
		</PageShellNote>
	);
}

export function AddSsoProviderSheet() {
	return (
		<Suspense fallback={<Skeleton className="h-8 w-28 rounded-md" />}>
			<AddSsoProviderForm />
		</Suspense>
	);
}

function AddSsoProviderForm() {
	const t = ssoMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();

	const settings = useQuery(trpc.sso.settings.queryOptions());

	const providerIdId = useId();
	const issuerId = useId();
	const domainId = useId();
	const clientIdId = useId();
	const clientSecretId = useId();
	const redirectId = useId();

	const [open, setOpen] = useQueryState(
		SEARCH_PARAM.dialog.create,
		parseAsBoolean.withDefault(false),
	);
	const [values, setValues] = useState(EMPTY);

	const register = useMutation(
		trpc.sso.register.mutationOptions({
			onSuccess: async (provider) => {
				await cache.sso();
				toast.success(t.them.daLuu(provider.name));
				await setOpen(null);
				setValues(EMPTY);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const edit = (patch: Partial<typeof values>) =>
		setValues({ ...values, ...patch });

	const providerId = values.providerId.trim().toLowerCase();

	const callbackURL = `${settings.data?.callbackBase ?? ""}/${
		providerId || "…"
	}`;

	const complete = Object.values(values).every((value) => value.trim() !== "");

	return (
		<Sheet open={open} onOpenChange={(next) => setOpen(next || null)}>
			<SheetTrigger asChild>
				<AddButton
					disabled={!settings.data?.canConfigure}
					aria-describedby={
						settings.data?.canConfigure === false ? ID_KHOA_SSO : undefined
					}
				/>
			</SheetTrigger>

			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>{t.them.tieuDe}</SheetTitle>
					<SheetDescription>{t.them.moTa}</SheetDescription>
				</SheetHeader>

				<form
					id={FORM}
					className="flex-1 overflow-y-auto px-4"
					onSubmit={(event) => {
						event.preventDefault();
						register.mutate({
							providerId,
							issuer: values.issuer.trim(),
							domain: values.domain.trim(),
							clientId: values.clientId.trim(),
							clientSecret: values.clientSecret.trim(),
						});
					}}
				>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor={providerIdId}>{t.them.ten}</FieldLabel>
							<Input
								id={providerIdId}
								value={values.providerId}
								onChange={(event) => edit({ providerId: event.target.value })}
								placeholder={t.them.tenGoiY}
								autoComplete="off"
								autoCapitalize="off"
								autoCorrect="off"
								spellCheck={false}
								translate="no"
								required
							/>
							<FieldDescription>{t.them.tenMoTa}</FieldDescription>
						</Field>

						<Field>
							<FieldLabel htmlFor={issuerId}>{t.them.issuer}</FieldLabel>
							<Input
								id={issuerId}
								type="url"
								value={values.issuer}
								onChange={(event) => edit({ issuer: event.target.value })}
								placeholder="https://acme.okta.com"
								autoComplete="off"
								autoCapitalize="off"
								autoCorrect="off"
								spellCheck={false}
								inputMode="url"
								translate="no"
								required
							/>
							<FieldDescription>{t.them.issuerMoTa}</FieldDescription>
						</Field>

						<Field>
							<FieldLabel htmlFor={domainId}>{t.them.tenMien}</FieldLabel>
							<Input
								id={domainId}
								value={values.domain}
								onChange={(event) => edit({ domain: event.target.value })}
								placeholder={t.them.tenMienGoiY}
								autoComplete="off"
								autoCapitalize="off"
								autoCorrect="off"
								spellCheck={false}
								translate="no"
								required
							/>
							<FieldDescription>{t.them.tenMienMoTa}</FieldDescription>
						</Field>

						<Field>
							<FieldLabel htmlFor={clientIdId}>{t.them.maClient}</FieldLabel>
							<Input
								id={clientIdId}
								value={values.clientId}
								onChange={(event) => edit({ clientId: event.target.value })}
								autoComplete="off"
								autoCapitalize="off"
								autoCorrect="off"
								spellCheck={false}
								translate="no"
								required
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor={clientSecretId}>{t.them.maBiMat}</FieldLabel>
							<Input
								id={clientSecretId}
								type="password"
								value={values.clientSecret}
								onChange={(event) => edit({ clientSecret: event.target.value })}
								autoComplete="off"
								translate="no"
								required
							/>
							<FieldDescription>{t.them.maBiMatMoTa}</FieldDescription>
						</Field>

						<Field>
							<FieldLabel htmlFor={redirectId}>
								{t.them.uriChuyenHuong}
							</FieldLabel>
							<InputGroup>
								<InputGroupInput
									id={redirectId}
									value={callbackURL}
									readOnly
									translate="no"
								/>
								<InputGroupAddon align="inline-end">
									<CopyValue
										value={callbackURL}
										label={t.them.uriChuyenHuong}
									/>
								</InputGroupAddon>
							</InputGroup>
							<FieldDescription>{t.them.uriMoTa}</FieldDescription>
						</Field>
					</FieldGroup>
				</form>

				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">{t.them.huy}</Button>
					</SheetClose>
					<Button
						type="submit"
						form={FORM}
						disabled={!complete || register.isPending}
					>
						{register.isPending ? <Spinner /> : null}
						{t.them.nut}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
