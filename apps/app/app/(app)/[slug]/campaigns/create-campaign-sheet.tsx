"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
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
import { Textarea } from "@crm/ui/components/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import { type ComponentProps, Suspense, useId, useState } from "react";
import { toast } from "sonner";
import { campaignMessages } from "@/lib/messages/campaigns";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { createState } from "./campaign-state";

type SavedViewRow = RouterOutputs["savedViews"]["list"][number];

function AddButton(props: ComponentProps<typeof Button>) {
	const m = campaignMessages(useLocale());
	return (
		<Button {...props}>
			<Icon icon={Add} data-icon="inline-start" />
			{m.newButton}
		</Button>
	);
}

function SegmentField({
	views,
	value,
	onValueChange,
}: {
	views: SavedViewRow[];
	value: string;
	onValueChange: (next: string) => void;
}) {
	const m = campaignMessages(useLocale());
	const workspaceUrl = useWorkspaceUrl();
	const selectId = useId();

	if (createState(views) === "no-views") {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>{m.empty.noViews}</EmptyTitle>
					<EmptyDescription>{m.create.segmentHint}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild variant="outline">
						<Link href={workspaceUrl("/contacts")}>
							{m.create.openContacts}
						</Link>
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	return (
		<Field>
			<FieldLabel htmlFor={selectId}>{m.create.segment}</FieldLabel>
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger id={selectId}>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{views.map((view) => (
						<SelectItem key={view.id} value={view.id}>
							<span translate="no">{view.name}</span>
							{view.size === null ? null : (
								<span className="text-muted-foreground">
									{m.create.segmentSize(String(view.size))}
								</span>
							)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<FieldDescription>{m.create.segmentHint}</FieldDescription>
		</Field>
	);
}

export function CreateCampaignSheet() {
	return (
		<Suspense fallback={<Skeleton className="h-8 w-28 rounded-md" />}>
			<CreateCampaignForm />
		</Suspense>
	);
}

function CreateCampaignForm() {
	const m = campaignMessages(useLocale());
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();
	const trpc = useTRPC();
	const cache = useCrmCache();

	const [open, setOpen] = useQueryState(
		SEARCH_PARAM.dialog.create,
		parseAsBoolean.withDefault(false),
	);
	const [name, setName] = useState("");
	const [savedViewId, setSavedViewId] = useState("");
	const [script, setScript] = useState("");

	const nameId = useId();
	const scriptId = useId();

	const views = useQuery(
		trpc.savedViews.list.queryOptions({ entity: "CONTACT" }),
	);

	const create = useMutation(
		trpc.campaigns.create.mutationOptions({
			onSuccess: async (campaign) => {
				await cache.campaignList();
				await setOpen(null);
				setName("");
				setSavedViewId("");
				setScript("");
				router.push(workspaceUrl(`/campaigns/${campaign.id}`));
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
					id="create-campaign"
					className="flex-1 overflow-y-auto px-4"
					onSubmit={(event) => {
						event.preventDefault();
						create.mutate({
							name,
							savedViewId,
							script: script.trim() || undefined,
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
								translate="no"
								required
							/>
						</Field>

						{views.isPending ? (
							<Spinner />
						) : (
							<SegmentField
								views={views.data ?? []}
								value={savedViewId}
								onValueChange={setSavedViewId}
							/>
						)}

						<Field>
							<FieldLabel htmlFor={scriptId}>{m.create.script}</FieldLabel>
							<Textarea
								id={scriptId}
								value={script}
								onChange={(event) => setScript(event.target.value)}
								placeholder={m.create.scriptPlaceholder}
								translate="no"
								rows={4}
							/>
						</Field>
					</FieldGroup>
				</form>

				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">{m.create.cancel}</Button>
					</SheetClose>
					<Button
						type="submit"
						form="create-campaign"
						disabled={
							create.isPending || name.trim() === "" || savedViewId === ""
						}
					>
						{create.isPending ? <Spinner /> : null}
						{create.isPending ? m.create.submitting : m.create.submit}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
