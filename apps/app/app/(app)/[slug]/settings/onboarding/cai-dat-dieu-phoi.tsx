"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";

export function CaiDatDieuPhoi() {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();

	const khuon = useQuery(trpc.onboarding.listTemplates.queryOptions());
	const boPhan = useQuery(trpc.onboarding.listDepartments.queryOptions());

	if (khuon.isPending || boPhan.isPending) {
		return (
			<div aria-live="polite" className="flex flex-col gap-2">
				<span className="text-muted-foreground text-sm">{m.loading}</span>
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}

	const dsKhuon = khuon.data ?? [];
	const dsBoPhan = boPhan.data ?? [];

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>{m.settings.templates}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					{dsKhuon.length === 0 ? (
						<Empty>
							<EmptyHeader>
								<EmptyTitle>{m.empty.noTemplate.title}</EmptyTitle>
								<EmptyDescription>{m.settings.noTemplate}</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						dsKhuon.map((k) => (
							<div
								className="flex items-baseline justify-between gap-3"
								key={k.id}
							>
								<span className="min-w-0 truncate font-medium text-sm">
									{k.name}
								</span>
								<div className="flex shrink-0 items-center gap-2">
									{k.partnerType === null ? null : (
										<Badge variant="outline">{k.partnerType}</Badge>
									)}
									<span className="text-muted-foreground text-xs tabular-nums">
										{k.steps.length}
									</span>
								</div>
							</div>
						))
					)}
					<div>
						<Button variant="outline">{m.settings.newTemplate}</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{m.settings.departments}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					{dsBoPhan.length === 0 ? (
						<Empty>
							<EmptyHeader>
								<EmptyTitle>{m.settings.departments}</EmptyTitle>
								<EmptyDescription>{m.settings.noDepartment}</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						dsBoPhan.map((d) => (
							<div
								className="flex items-baseline justify-between gap-3"
								key={d.id}
							>
								<span className="min-w-0 truncate text-sm">{d.name}</span>
								<span className="shrink-0 text-muted-foreground text-xs tabular-nums">
									{d.position}
								</span>
							</div>
						))
					)}
					<div>
						<Button variant="outline">{m.settings.newDepartment}</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
