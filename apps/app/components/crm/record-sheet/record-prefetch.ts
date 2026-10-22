"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useTRPC } from "@/lib/trpc/client";
import type { RecordRef } from "./record-stack";

export function usePrefetchRecord() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	return useCallback(
		({ kind, id }: RecordRef) => {
			switch (kind) {
				case "company":
					void queryClient.prefetchQuery(
						trpc.companies.byId.queryOptions({ id }),
					);
					void queryClient.prefetchQuery(
						trpc.fields.layout.queryOptions({ entity: "COMPANY" }),
					);
					return;
				case "contact":
					void queryClient.prefetchQuery(
						trpc.contacts.byId.queryOptions({ id }),
					);
					void queryClient.prefetchQuery(
						trpc.fields.layout.queryOptions({ entity: "CONTACT" }),
					);
					return;
				case "deal":
					void queryClient.prefetchQuery(trpc.deals.byId.queryOptions({ id }));
					void queryClient.prefetchQuery(
						trpc.fields.layout.queryOptions({ entity: "DEAL" }),
					);
					return;
				case "plan":
					void queryClient.prefetchQuery(
						trpc.onboarding.planById.queryOptions({ id }),
					);
					return;
				case "objective":
					void queryClient.prefetchQuery(
						trpc.okr.objective.queryOptions({ id }),
					);
					return;
			}
		},
		[trpc, queryClient],
	);
}
