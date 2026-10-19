"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import { okrMessages } from "@/lib/messages/okr";
import { useTRPC } from "@/lib/trpc/client";

export function useTenGoc(): string {
	const trpc = useTRPC();
	const workspace = useQuery(trpc.workspace.get.queryOptions());
	return workspace.data?.name || okrMessages(useLocale()).goc;
}
