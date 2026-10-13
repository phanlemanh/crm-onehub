import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { Suspense } from "react";

import { getLocale } from "@/lib/locale/server";
import { ketNoiMessages } from "@/lib/messages/settings-ket-noi";
import { KhungKetNoi } from "./khung-ket-noi";

export type ConnectionQuery = Record<string, string | string[] | undefined>;

type OAuthConnectionPageProps = {
	connection: React.ComponentType<{ slug: string; connectError?: string }>;
	params: Promise<{ slug: string }>;
	provider: "google" | "microsoft";
	searchParams: Promise<ConnectionQuery>;
};

export async function OAuthConnectionPage(props: OAuthConnectionPageProps) {
	const locale = await getLocale();

	return (
		<KhungKetNoi
			params={props.params}
			kind={props.provider}
			locale={locale}
			tieuDe={ketNoiMessages(locale).ten[props.provider]}
			laTenRieng
		>
			<Suspense fallback={<KhungXuong hinh="the" />}>
				<OAuthConnectionPageContent {...props} />
			</Suspense>
		</KhungKetNoi>
	);
}

export function connectErrorOf(query: ConnectionQuery, provider: string) {
	return first(query.provider) === provider ? first(query.error) : undefined;
}

async function OAuthConnectionPageContent({
	connection: Connection,
	params,
	provider,
	searchParams,
}: OAuthConnectionPageProps) {
	const [{ slug }, query] = await Promise.all([params, searchParams]);

	return (
		<Connection connectError={connectErrorOf(query, provider)} slug={slug} />
	);
}

function first(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}
