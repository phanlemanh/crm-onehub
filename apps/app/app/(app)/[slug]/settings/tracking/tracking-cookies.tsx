"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Label } from "@crm/ui/components/label";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Switch } from "@crm/ui/components/switch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId } from "react";
import { toast } from "sonner";
import { theoDoiMessages } from "@/lib/messages/settings-theo-doi";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const TOGGLES = [
	{ khoa: "cookieSubdomains" },
	{ khoa: "secureCookies" },
	{ khoa: "honourDnt" },
] as const;

export function TrackingCookies() {
	const t = theoDoiMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const lifetimeId = useId();

	const tracking = useQuery(trpc.tracking.settings.queryOptions());

	const setFlag = useMutation(
		trpc.tracking.setFlag.mutationOptions({
			onSuccess: () => cache.tracking({ settle: "record" }),
			onError: (error) => toast.error(error.message),
		}),
	);

	const setLifetime = useMutation(
		trpc.tracking.setCookieLifetime.mutationOptions({
			onSuccess: async () => {
				await cache.tracking();
				toast.success(t.cookie.daLuuHan);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (!tracking.data) return null;

	const { canManage, cookieDays, cookieLifetimes } = tracking.data;
	const busy = !canManage || setFlag.isPending || setLifetime.isPending;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t.cookie.tieuDe}</CardTitle>
				<CardDescription>{t.cookie.moTa}</CardDescription>
			</CardHeader>

			<CardContent>
				{TOGGLES.map((toggle) => (
					<div
						key={toggle.khoa}
						className="flex items-center justify-between gap-6"
					>
						<Label
							htmlFor={`tracking-${toggle.khoa}`}
							className="flex flex-col items-start gap-1"
						>
							<span className="text-sm">{t.cookie.co[toggle.khoa].nhan}</span>
							<span className="font-normal text-muted-foreground text-xs">
								{t.cookie.co[toggle.khoa].goiY}
							</span>
						</Label>

						<Switch
							id={`tracking-${toggle.khoa}`}
							checked={tracking.data[toggle.khoa]}
							disabled={busy}
							onCheckedChange={(enabled) =>
								setFlag.mutate({ flag: toggle.khoa, enabled })
							}
						/>
					</div>
				))}

				<Field>
					<FieldLabel htmlFor={lifetimeId}>{t.cookie.hanNhan}</FieldLabel>
					<Select
						value={String(cookieDays)}
						disabled={busy}
						onValueChange={(value) =>
							setLifetime.mutate({ days: Number(value) })
						}
					>
						<SelectTrigger id={lifetimeId} className="w-full max-w-sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{cookieLifetimes.map((lifetime) => (
								<SelectItem key={lifetime.days} value={String(lifetime.days)}>
									{t.cookie.hanTheoNgay[
										String(lifetime.days) as keyof typeof t.cookie.hanTheoNgay
									] ?? lifetime.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FieldDescription>{t.cookie.hanMoTa}</FieldDescription>
				</Field>
			</CardContent>
		</Card>
	);
}
