import { Button } from "@crm/ui/components/button";
import type { Metadata } from "next";
import Link from "next/link";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { ngoaiPhamViMessages } from "@/lib/messages/ngoai-pham-vi";
import { requireSession } from "@/lib/session";
import { workspaceUrl } from "@/lib/workspace-url";

export async function generateMetadata(): Promise<Metadata> {
	return { title: ngoaiPhamViMessages(await getLocale()).tieuDe };
}

export default async function NgoaiPhamViPage({
	params,
}: PageProps<"/[slug]/ngoai-pham-vi">) {
	await requireSession();
	const t = ngoaiPhamViMessages(await getLocale());
	const { slug } = await params;

	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.than}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<div>
					<Button asChild variant="outline">
						<Link href={workspaceUrl(slug)}>{t.veTongQuan}</Link>
					</Button>
				</div>
			</PageShellContent>
		</PageShell>
	);
}
