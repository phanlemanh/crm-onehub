"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Label } from "@crm/ui/components/label";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Switch } from "@crm/ui/components/switch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { theoDoiMessages } from "@/lib/messages/settings-theo-doi";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const RULES = [{ khoa: "crossDomain" }, { khoa: "limitToDomains" }] as const;

export function TrackingRules() {
	const t = theoDoiMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();

	const tracking = useQuery(trpc.tracking.settings.queryOptions());

	const setFlag = useMutation(
		trpc.tracking.setFlag.mutationOptions({
			onSuccess: () => cache.tracking({ settle: "record" }),
			onError: (error) => toast.error(error.message),
		}),
	);

	if (!tracking.data) return null;

	const { canManage } = tracking.data;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t.luat.tieuDe}</CardTitle>
				<CardDescription>{t.luat.moTa}</CardDescription>
			</CardHeader>

			<CardContent>
				{RULES.map((rule) => (
					<div
						key={rule.khoa}
						className="flex items-center justify-between gap-6"
					>
						<Label
							htmlFor={`tracking-${rule.khoa}`}
							className="flex flex-col items-start gap-1"
						>
							<span className="text-sm">{t.luat.co[rule.khoa].nhan}</span>
							<span className="font-normal text-muted-foreground text-xs">
								{t.luat.co[rule.khoa].goiY}
							</span>
						</Label>

						<Switch
							id={`tracking-${rule.khoa}`}
							checked={tracking.data[rule.khoa]}
							disabled={!canManage || setFlag.isPending}
							onCheckedChange={(enabled) =>
								setFlag.mutate({ flag: rule.khoa, enabled })
							}
						/>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
