"use client";

import { authClient } from "@crm/auth/client";
import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import type { Locale } from "@crm/ui/lib/locale";
import { useState } from "react";
import { toast } from "sonner";
import { ketNoiMessages } from "@/lib/messages/settings-ket-noi";

async function startSlackOAuth(slug: string, locale: Locale) {
	const t = ketNoiMessages(locale);
	try {
		const { error } = await authClient.oauth2.link({
			providerId: "slack",
			callbackURL: `${window.location.origin}/${slug}/settings/connections/slack/people`,
			errorCallbackURL: `${window.location.origin}/${slug}/settings/connections/slack?provider=slack`,
		});
		if (error) toast.error(error.message || t.slack.khongCamDuoc);
	} catch (error) {
		toast.error(error instanceof Error ? error.message : t.slack.khongCamDuoc);
	}
}

export function SlackReconnectButton({ slug }: { slug: string }) {
	const locale = useLocale();
	const t = ketNoiMessages(locale);
	const [pending, setPending] = useState(false);

	return (
		<Button
			disabled={pending}
			onClick={async () => {
				setPending(true);
				await startSlackOAuth(slug, locale);
				setPending(false);
			}}
			size="xs"
			variant="contrast"
		>
			{pending ? t.slack.dangMoSlack : t.slack.camLai}
		</Button>
	);
}

export function SlackConnectButton({
	slug,
	configured,
	connectError,
}: {
	slug: string;
	configured: boolean;
	connectError?: string;
}) {
	const locale = useLocale();
	const t = ketNoiMessages(locale);
	const [pending, setPending] = useState(false);
	const connect = async () => {
		setPending(true);
		await startSlackOAuth(slug, locale);
		setPending(false);
	};
	return (
		<div className="flex min-w-0 flex-col gap-2">
			<Button onClick={() => void connect()} disabled={!configured || pending}>
				{pending
					? t.slack.dangMoSlack
					: configured
						? t.slack.camSlack
						: t.slack.chuaCauHinh}
			</Button>
			{connectError ? (
				<p role="alert" className="max-w-sm text-destructive text-xs">
					{t.slack.loiCam.get(connectError) ??
						t.slack.camHongMac(connectError.replaceAll("_", " "))}
				</p>
			) : null}
		</div>
	);
}
