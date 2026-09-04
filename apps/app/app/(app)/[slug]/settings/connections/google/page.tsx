import type { Metadata } from "next";
import { getLocale } from "@/lib/locale/server";
import { ketNoiMessages } from "@/lib/messages/settings-ket-noi";
import { GoogleConnection } from "../google-connection";
import {
	type ConnectionQuery,
	OAuthConnectionPage,
} from "../oauth-connection-page";

export async function generateMetadata(): Promise<Metadata> {
	return { title: ketNoiMessages(await getLocale()).ten.googleWorkspace };
}

export default function GoogleConnectionPage(props: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<ConnectionQuery>;
}) {
	return (
		<OAuthConnectionPage
			{...props}
			connection={GoogleConnection}
			provider="google"
		/>
	);
}
