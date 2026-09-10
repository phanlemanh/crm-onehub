"use client";

import { authClient } from "@crm/auth/client";
import {
	type MailboxProviderId,
	MICROSOFT_SYNC_SCOPES,
	SYNC_SCOPES,
} from "@crm/auth/scopes";
import GoogleLogo from "@crm/ui/components/brand-logos/google";
import MicrosoftLogo from "@crm/ui/components/brand-logos/microsoft";
import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import type { FC, SVGProps } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { authMessages } from "@/lib/messages/auth";
import { signOutAndRedirect } from "@/lib/sign-out";

type ProviderGrant = {
	ten: string;
	scopes: readonly string[];
	Logo: FC<SVGProps<SVGSVGElement>>;
};

const PROVIDERS = {
	google: {
		ten: "Google",
		scopes: [...SYNC_SCOPES],
		Logo: GoogleLogo,
	},
	microsoft: {
		ten: "Microsoft",
		scopes: [...MICROSOFT_SYNC_SCOPES],
		Logo: MicrosoftLogo,
	},
} as const satisfies Record<MailboxProviderId, ProviderGrant>;

const MOC = "\u0000";

export function GrantAccess({
	providers,
}: {
	providers: readonly MailboxProviderId[];
}) {
	const [pending, setPending] = useState<MailboxProviderId | null>(null);
	const nhan = authMessages(useLocale()).grantAccess;

	function fail(message?: string) {
		setPending(null);
		toast.error(message ?? nhan.error.provider);
	}

	async function handleGrant(provider: MailboxProviderId) {
		setPending(provider);

		const origin = window.location.origin;

		try {
			const { error } = await authClient.linkSocial({
				provider,
				scopes: [...PROVIDERS[provider].scopes],
				callbackURL: `${origin}/`,
				errorCallbackURL: `${origin}/grant-access`,
			});

			if (error) fail(error.message);
		} catch {
			fail();
		}
	}

	const single = providers.length === 1;

	return (
		<div className="flex flex-col gap-3">
			{providers.map((provider) => {
				const { ten, Logo } = PROVIDERS[provider];

				return (
					<Button
						key={provider}
						className="w-full"
						disabled={pending !== null}
						onClick={() => {
							handleGrant(provider).catch(() => fail());
						}}
						type="button"
					>
						{pending === provider ? (
							<Spinner data-icon="inline-start" />
						) : (
							<Logo data-icon="inline-start" className="size-4" />
						)}
						{pending === provider ? (
							nhan.granting
						) : single ? (
							nhan.grantOne
						) : (
							<>
								{nhan.grant(MOC).split(MOC)[0]}
								<span translate="no">{ten}</span>
								{nhan.grant(MOC).split(MOC)[1]}
							</>
						)}
					</Button>
				);
			})}

			<Button
				className="w-full"
				onClick={() => {
					signOutAndRedirect(nhan.error.signOut).catch(() =>
						toast.error(nhan.error.signOut),
					);
				}}
				type="button"
				variant="ghost"
			>
				{nhan.signOut}
			</Button>
		</div>
	);
}
