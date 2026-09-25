import { Button } from "@crm/ui/components/button";
import Link from "next/link";
import { Suspense } from "react";
import { PageShellLoading } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { ketNoiMessages } from "@/lib/messages/settings-ket-noi";
import { requireSession } from "@/lib/session";
import { KhungKetNoi } from "../khung-ket-noi";

export default async function IntakeConnectionPage(
	props: PageProps<"/[slug]/settings/connections/intake">,
) {
	const locale = await getLocale();
	const t = ketNoiMessages(locale);

	return (
		<KhungKetNoi
			params={props.params}
			con="intake"
			locale={locale}
			tieuDe={t.tiepNhan.tieuDe}
			laTenRieng={false}
			moTa={t.tiepNhan.moTa}
		>
			<Suspense fallback={<PageShellLoading />}>
				<IntakeConnectionPageContent {...props} />
			</Suspense>
		</KhungKetNoi>
	);
}

async function IntakeConnectionPageContent({
	params,
}: PageProps<"/[slug]/settings/connections/intake">) {
	await requireSession();
	const t = ketNoiMessages(await getLocale());
	const { slug } = await params;

	return (
		<div>
			<Button asChild variant="outline">
				<Link href={`/${slug}/settings/connections`}>{t.tiepNhan.quayLai}</Link>
			</Button>
		</div>
	);
}
