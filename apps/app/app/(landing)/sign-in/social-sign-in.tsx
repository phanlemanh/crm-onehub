"use client";

import { signIn } from "@crm/auth/client";
import type { MailboxProviderId } from "@crm/auth/scopes";
import GoogleLogo from "@crm/ui/components/brand-logos/google";
import MicrosoftLogo from "@crm/ui/components/brand-logos/microsoft";
import { Button } from "@crm/ui/components/button";
import { Spinner } from "@crm/ui/components/spinner";
import type { FC, SVGProps } from "react";
import { useState } from "react";
import { toast } from "sonner";

const LOGO = {
	google: GoogleLogo,
	microsoft: MicrosoftLogo,
} as const satisfies Record<MailboxProviderId, FC<SVGProps<SVGSVGElement>>>;

export function SocialSignIn({
	provider,
	nhan,
	dangGui,
	loi,
}: {
	provider: MailboxProviderId;
	nhan: string;
	dangGui: string;
	loi: string;
}) {
	const [pending, setPending] = useState(false);

	const Logo = LOGO[provider];

	function fail(message?: string) {
		setPending(false);
		toast.error(message ?? loi);
	}

	async function handleClick() {
		setPending(true);

		const origin = window.location.origin;

		const { error } = await signIn.social({
			provider,
			callbackURL: `${origin}/`,
			errorCallbackURL: `${origin}/sign-in`,
		});

		if (error) fail(error.message);
	}

	return (
		<Button
			className="w-full"
			disabled={pending}
			onClick={() => {
				handleClick().catch(() => fail());
			}}
			type="button"
			variant="outline"
		>
			{pending ? (
				<Spinner data-icon="inline-start" />
			) : (
				<Logo data-icon="inline-start" className="size-4" />
			)}
			<span translate="no">{pending ? dangGui : nhan}</span>
		</Button>
	);
}
