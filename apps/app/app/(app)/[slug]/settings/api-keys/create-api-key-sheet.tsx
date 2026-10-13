"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldDescription,
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
import { useMutation } from "@tanstack/react-query";
import { parseAsBoolean, useQueryState } from "nuqs";
import { type ComponentProps, Suspense, useId, useState } from "react";
import { toast } from "sonner";
import {
	type KhoaApiMessages,
	khoaApiMessages,
} from "@/lib/messages/settings-khoa-api";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { CreatedApiKeyDialog } from "./created-api-key-dialog";

const FORM = "create-api-key";

type ExpirationValue = "30" | "90" | "365" | "never";

function expirationOptions(
	t: KhoaApiMessages,
): { value: ExpirationValue; nhan: string }[] {
	return [
		{ value: "30", nhan: t.tao.han30 },
		{ value: "90", nhan: t.tao.han90 },
		{ value: "365", nhan: t.tao.han365 },
		{ value: "never", nhan: t.tao.khongHetHan },
	];
}

type CreatedApiKey = RouterOutputs["apiKeys"]["create"];

function NewApiKeyButton(props: ComponentProps<typeof Button>) {
	const t = khoaApiMessages(useLocale());

	return (
		<Button {...props}>
			<Icon icon={Add} data-icon="inline-start" />
			{t.tao.nut}
		</Button>
	);
}

export function CreateApiKeySheet() {
	return (
		<Suspense fallback={<Skeleton className="h-8 w-28 rounded-md" />}>
			<CreateApiKeyForm />
		</Suspense>
	);
}

function CreateApiKeyForm() {
	const t = khoaApiMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();

	const nameId = useId();
	const expirationId = useId();

	const [open, setOpen] = useQueryState(
		SEARCH_PARAM.dialog.create,
		parseAsBoolean.withDefault(false),
	);
	const [name, setName] = useState("");
	const [expiration, setExpiration] = useState<ExpirationValue>("90");
	const [created, setCreated] = useState<CreatedApiKey | null>(null);

	const create = useMutation(
		trpc.apiKeys.create.mutationOptions({
			onSuccess: async (apiKey) => {
				await cache.apiKeys();
				await setOpen(null);
				setName("");
				setExpiration("90");
				setCreated(apiKey);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<>
			<Sheet open={open} onOpenChange={(next) => setOpen(next || null)}>
				<SheetTrigger asChild>
					<NewApiKeyButton />
				</SheetTrigger>

				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>{t.tao.tieuDe}</SheetTitle>
						<SheetDescription>{t.tao.moTa}</SheetDescription>
					</SheetHeader>

					<form
						id={FORM}
						className="flex-1 overflow-y-auto px-4"
						onSubmit={(event) => {
							event.preventDefault();
							create.mutate({
								name: name.trim(),
								expiresInDays:
									expiration === "never" ? null : Number(expiration),
							});
						}}
					>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor={nameId}>{t.tao.ten}</FieldLabel>
								<Input
									id={nameId}
									value={name}
									onChange={(event) => setName(event.target.value)}
									placeholder={t.tao.tenGoiY}
									maxLength={64}
									autoComplete="off"
									autoCapitalize="off"
									autoCorrect="off"
									spellCheck={false}
									translate="no"
									required
								/>
								<FieldDescription>{t.tao.tenMoTa}</FieldDescription>
							</Field>

							<Field>
								<FieldLabel htmlFor={expirationId}>{t.tao.hetHan}</FieldLabel>
								<Select
									value={expiration}
									onValueChange={(value) =>
										setExpiration(value as ExpirationValue)
									}
								>
									<SelectTrigger id={expirationId} className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{expirationOptions(t).map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.nhan}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						</FieldGroup>
					</form>

					<SheetFooter>
						<SheetClose asChild>
							<Button variant="outline">{t.tao.huy}</Button>
						</SheetClose>
						<Button
							type="submit"
							form={FORM}
							disabled={!name.trim() || create.isPending}
						>
							{create.isPending ? <Spinner /> : null}
							{t.tao.taoKhoa}
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>

			<CreatedApiKeyDialog
				apiKey={created}
				onOpenChange={(next) => {
					if (!next) setCreated(null);
				}}
			/>
		</>
	);
}
