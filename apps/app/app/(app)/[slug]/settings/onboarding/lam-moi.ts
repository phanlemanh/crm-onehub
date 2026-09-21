"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

export function useLamMoiDieuPhoi(): () => Promise<void> {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	return async () => {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: trpc.onboarding.listDepartments.queryKey(),
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.onboarding.listTemplates.queryKey(),
			}),
		]);
	};
}
