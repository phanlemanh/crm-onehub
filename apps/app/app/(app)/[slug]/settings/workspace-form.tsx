"use client";

import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@crm/ui/components/input-group";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { settingsMessages } from "@/lib/messages/settings";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceSlug } from "@/lib/use-workspace-url";
import { workspaceUrl } from "@/lib/workspace-url";

export function WorkspaceForm() {
	const t = settingsMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const router = useRouter();
	const slug = useWorkspaceSlug();

	const nameId = useId();
	const websiteId = useId();

	const workspace = useQuery(trpc.workspace.get.queryOptions());

	const [draft, setDraft] = useState<{ name: string; website: string } | null>(
		null,
	);

	const save = useMutation(
		trpc.workspace.update.mutationOptions({
			onSuccess: async (saved) => {
				await cache.workspace();
				setDraft(null);
				toast.success(t.congTy.daLuu);

				if (saved.slug !== slug) {
					router.replace(workspaceUrl(saved.slug, "/settings"));
				}
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (!workspace.data) return null;

	const { name, website, canRename } = workspace.data;

	const values = draft ?? { name, website: website ?? "" };
	const dirty = values.name !== name || values.website !== (website ?? "");

	const edit = (patch: Partial<typeof values>) =>
		setDraft({ ...values, ...patch });

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t.congTy.tieuDe}</CardTitle>
				<CardDescription>{t.congTy.moTa}</CardDescription>

				<CardAction>
					<Button
						type="submit"
						form="workspace"
						disabled={
							!canRename ||
							save.isPending ||
							!dirty ||
							values.name.trim() === "" ||
							values.website.trim() === ""
						}
					>
						{save.isPending ? <Spinner data-icon="inline-start" /> : null}
						{t.congTy.luu}
					</Button>
				</CardAction>
			</CardHeader>

			<CardContent>
				<form
					id="workspace"
					onSubmit={(event) => {
						event.preventDefault();
						save.mutate({
							name: values.name,
							website: values.website.trim(),
						});
					}}
				>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor={nameId}>{t.congTy.ten}</FieldLabel>
							<Input
								id={nameId}
								value={values.name}
								onChange={(event) => edit({ name: event.target.value })}
								placeholder={t.congTy.tenGoiY}
								autoComplete="organization"
								disabled={!canRename || save.isPending}
								required
							/>
							<FieldDescription>{t.congTy.tenMoTa}</FieldDescription>
						</Field>

						<Field>
							<FieldLabel htmlFor={websiteId}>{t.congTy.website}</FieldLabel>
							<InputGroup>
								<InputGroupAddon>
									<InputGroupText>{t.congTy.websiteTienTo}</InputGroupText>
								</InputGroupAddon>
								<InputGroupInput
									id={websiteId}
									value={values.website}
									onChange={(event) => edit({ website: event.target.value })}
									placeholder={t.congTy.websiteGoiY}
									autoComplete="off"
									autoCapitalize="off"
									autoCorrect="off"
									spellCheck={false}
									inputMode="url"
									disabled={!canRename || save.isPending}
								/>
							</InputGroup>
							<FieldDescription>{t.congTy.websiteMoTa}</FieldDescription>
						</Field>
					</FieldGroup>
				</form>

				{canRename ? null : (
					<p className="text-muted-foreground text-xs">
						{t.congTy.khongDuQuyen}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
