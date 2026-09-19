import type { MailboxProviderId } from "@crm/auth/scopes";
import { Separator } from "@crm/ui/components/separator";
import type { Metadata } from "next";
import { redirect, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { getLocale } from "@/lib/locale/server";
import { authMessages } from "@/lib/messages/auth";
import { getSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { PasswordSignIn } from "./password-sign-in";
import { SocialSignIn } from "./social-sign-in";
import { SsoSignIn } from "./sso-sign-in";

const TEN_HANG = {
	google: "Google",
	microsoft: "Microsoft",
} as const satisfies Record<MailboxProviderId, string>;

type NhaCungCap = {
	providerId: string;
	name: string;
};

type SignInOptions = {
	google: boolean;
	microsoft: boolean;
	providers: NhaCungCap[];
};

export async function generateMetadata(): Promise<Metadata> {
	return { title: authMessages(await getLocale()).docTitle.signIn };
}

async function signInOptions(): Promise<SignInOptions | null> {
	try {
		return await getServerQueryClient().fetchQuery(
			getServerTrpc().sso.signInOptions.queryOptions(),
		);
	} catch (error) {
		unstable_rethrow(error);
		console.error("Sign-in: could not read the sign-in options.", error);
		return null;
	}
}

async function currentSession() {
	try {
		return await getSession();
	} catch (error) {
		unstable_rethrow(error);
		console.error("Sign-in: could not read the session.", error);
		return null;
	}
}

export default async function SignInPage({
	searchParams,
}: PageProps<"/sign-in">) {
	const m = authMessages(await getLocale()).signIn;

	return (
		<AuthShell>
			<Suspense
				fallback={<AuthHeading title={m.title} description={m.description} />}
			>
				<SignIn searchParams={searchParams} />
			</Suspense>
		</AuthShell>
	);
}

async function SignIn({
	searchParams,
}: Pick<PageProps<"/sign-in">, "searchParams">) {
	const [session, options, { method }, locale] = await Promise.all([
		currentSession(),
		signInOptions(),
		searchParams,
		getLocale(),
	]);

	if (session) {
		redirect("/");
	}

	const m = authMessages(locale).signIn;

	const configured: MailboxProviderId[] = [];
	if (options?.google ?? true) configured.push("google");
	if (options?.microsoft ?? false) configured.push("microsoft");

	const providers = options?.providers ?? [];

	const insisted = configured.find((provider) => provider === method);
	const showSso = providers.length > 0 && insisted === undefined;
	const social =
		insisted !== undefined
			? [insisted]
			: providers.length === 0
				? configured
				: [];

	const coCuaKhac = showSso || social.length > 0;

	return (
		<>
			<AuthHeading title={m.title} description={m.description} />

			{showSso ? (
				<SsoSignIn
					providers={providers.map((provider) => ({
						...provider,
						nhan: m.continueWith(provider.name),
					}))}
					dangGui={m.signingIn}
					loi={m.error.unreachable}
				/>
			) : null}
			{social.map((provider) => (
				<SocialSignIn
					key={provider}
					provider={provider}
					nhan={m.continueWith(TEN_HANG[provider])}
					dangGui={m.signingIn}
					loi={m.error.unreachable}
				/>
			))}

			{coCuaKhac ? (
				<div className="flex items-center gap-3">
					<Separator className="flex-1" />
					<span className="text-muted-foreground text-xs">{m.hoac}</span>
					<Separator className="flex-1" />
				</div>
			) : null}

			<PasswordSignIn
				dangGui={m.signingIn}
				dangNhap={m.dangNhap}
				diaChi={m.diaChi}
				matKhau={m.matKhau}
				saiChung={m.saiChung}
			/>
		</>
	);
}
