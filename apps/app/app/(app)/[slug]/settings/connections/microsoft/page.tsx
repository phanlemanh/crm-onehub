import type { Metadata } from "next";
import { getLocale } from "@/lib/locale/server";
import { ketNoiMessages } from "@/lib/messages/settings-ket-noi";
import { MicrosoftConnection } from "../microsoft-connection";
import {
	type ConnectionQuery,
	OAuthConnectionPage,
} from "../oauth-connection-page";

export async function generateMetadata(): Promise<Metadata> {
	return { title: ketNoiMessages(await getLocale()).ten.microsoft365 };
}

export default function MicrosoftConnectionPage(props: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<ConnectionQuery>;
}) {
	return (
		<OAuthConnectionPage
			{...props}
			connection={MicrosoftConnection}
			provider="microsoft"
		/>
	);
}
