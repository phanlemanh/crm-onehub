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
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { settingsMessages } from "@/lib/messages/settings";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

export function ArchiveRetention() {
	const t = settingsMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const daysId = useId();
	const lyDoId = useId();
	const [draft, setDraft] = useState("");

	const retention = useQuery(trpc.settings.archiveRetention.queryOptions());

	useEffect(() => {
		if (retention.data) setDraft(String(retention.data.days));
	}, [retention.data]);

	const save = useMutation(
		trpc.settings.setArchiveRetention.mutationOptions({
			onSuccess: async () => {
				await cache.settings();
				toast.success(t.luuTru.daLuu);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (!retention.data) return null;

	const { canManage } = retention.data;
	const lyDo = canManage ? undefined : lyDoId;
	const days = Number.parseInt(draft, 10);
	const unchanged = days === retention.data.days;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t.luuTru.tieuDe}</CardTitle>
				<CardDescription>{t.luuTru.moTa}</CardDescription>

				<CardAction>
					<Button
						type="submit"
						form="archive-retention"
						aria-describedby={lyDo}
						disabled={
							!canManage ||
							save.isPending ||
							unchanged ||
							draft.trim() === "" ||
							!Number.isFinite(days)
						}
					>
						{save.isPending ? <Spinner data-icon="inline-start" /> : null}
						{t.luuTru.luu}
					</Button>
				</CardAction>
			</CardHeader>

			<CardContent>
				<form
					id="archive-retention"
					onSubmit={(event) => {
						event.preventDefault();
						if (!Number.isFinite(days)) {
							toast.error(t.luuTru.phaiLaSo);
							return;
						}
						save.mutate({ days });
					}}
				>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor={daysId}>{t.luuTru.nhan}</FieldLabel>
							<Input
								id={daysId}
								inputMode="numeric"
								value={draft}
								disabled={!canManage || save.isPending}
								aria-describedby={lyDo}
								onChange={(event) => setDraft(event.target.value)}
							/>
							<FieldDescription>{t.luuTru.donVi}</FieldDescription>
						</Field>
					</FieldGroup>
				</form>

				{canManage ? null : (
					<p id={lyDoId} className="text-muted-foreground text-xs">
						{t.luuTru.khongDuQuyen}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
