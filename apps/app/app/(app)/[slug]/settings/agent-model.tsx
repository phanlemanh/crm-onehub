"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@crm/ui/components/command";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import {
	type SettingsMessages,
	settingsMessages,
} from "@/lib/messages/settings";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

type CatalogModel = {
	id: string;
	name: string;
	provider: string;
	contextWindowTokens: number;
	pricing: { input: number; output: number } | null;
};

const FOLLOW_DEFAULT = "__default__";

function perMillion(rate: number): string {
	const dollars = rate * 1_000_000;
	return `$${dollars.toFixed(2).replace(/\.?0+$/, "")}`;
}

function priceHint(model: CatalogModel, t: SettingsMessages): string | null {
	if (!model.pricing) return null;
	return t.model.gia(
		perMillion(model.pricing.input),
		perMillion(model.pricing.output),
	);
}

function contextHint(tokens: number, t: SettingsMessages): string {
	return tokens >= 1_000_000
		? t.model.nguCanhTrieu(String(Math.round(tokens / 1_000_000)))
		: t.model.nguCanhNghin(String(Math.round(tokens / 1_000)));
}

function byProvider(models: CatalogModel[]): [string, CatalogModel[]][] {
	const groups = new Map<string, CatalogModel[]>();

	for (const model of models) {
		const list = groups.get(model.provider) ?? [];
		list.push(model);
		groups.set(model.provider, list);
	}

	return [...groups];
}

export function AgentModel() {
	const t = settingsMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [open, setOpen] = useState(false);
	const lyDoId = useId();

	const settings = useQuery(trpc.settings.agentModel.queryOptions());
	const catalog = useQuery(trpc.settings.modelCatalog.queryOptions());

	const save = useMutation(
		trpc.settings.setAgentModel.mutationOptions({
			onSuccess: async () => {
				await cache.settings();
				toast.success(t.model.daLuu);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (!settings.data) return null;

	const {
		selectedId,
		effectiveId,
		defaultId,
		effective,
		canManage,
		selectedMissing,
	} = settings.data;
	const models = catalog.data?.models ?? [];
	const unavailable = catalog.data !== undefined && !catalog.data.available;

	const defaultModel = models.find((model) => model.id === defaultId);
	const current = selectedId ?? FOLLOW_DEFAULT;

	const effectiveName = effective?.name ?? effectiveId;

	const currentLabel = selectedId
		? effectiveName
		: `${t.model.macDinh} ${effectiveName}`;

	const choose = (id: string) => {
		setOpen(false);
		if (id === current) return;
		save.mutate({ modelId: id === FOLLOW_DEFAULT ? null : id });
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t.model.tieuDe}</CardTitle>
				<CardDescription>{t.model.moTa}</CardDescription>
			</CardHeader>

			<CardContent>
				{selectedMissing ? (
					<Alert>
						<AlertDescription>{t.model.biGo}</AlertDescription>
					</Alert>
				) : null}

				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							aria-label={t.model.nhan}
							disabled={
								!canManage || save.isPending || catalog.isPending || unavailable
							}
							aria-describedby={canManage ? undefined : lyDoId}
						>
							{currentLabel}
							<Icon icon={ChevronDown} data-icon="inline-end" />
						</Button>
					</PopoverTrigger>

					<PopoverContent align="start" size="fit" className="w-96">
						<Command>
							<CommandInput placeholder={t.model.tim} />
							<CommandList>
								<CommandEmpty>{t.model.khongKhop}</CommandEmpty>

								<CommandGroup>
									<CommandItem
										value={`default ${defaultId}`}
										data-checked={current === FOLLOW_DEFAULT}
										onSelect={() => choose(FOLLOW_DEFAULT)}
									>
										{t.model.macDinh} {defaultModel?.name ?? defaultId}
									</CommandItem>
								</CommandGroup>

								{byProvider(models).map(([provider, group]) => (
									<CommandGroup key={provider} heading={provider}>
										{group.map((model) => {
											const price = priceHint(model, t);

											return (
												<CommandItem
													key={model.id}
													value={`${model.name} ${model.provider} ${model.id}`}
													data-checked={current === model.id}
													onSelect={() => choose(model.id)}
												>
													<span>{model.name}</span>
													<span className="ml-auto text-muted-foreground text-xs">
														{price ?? contextHint(model.contextWindowTokens, t)}
													</span>
												</CommandItem>
											);
										})}
									</CommandGroup>
								))}
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>

				<p className="text-muted-foreground text-xs">
					{unavailable
						? t.model.khongVoiToi(effectiveId)
						: effective
							? `${effectiveId} · ${contextHint(effective.contextWindowTokens, t)}${
									priceHint(effective, t) ? ` · ${priceHint(effective, t)}` : ""
								}`
							: effectiveId}
				</p>

				{canManage ? null : (
					<p id={lyDoId} className="text-muted-foreground text-xs">
						{t.model.khongDuQuyen}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
