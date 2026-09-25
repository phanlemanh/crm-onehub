import { Button } from "@crm/ui/components/button";
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
import { tongQuanMessages } from "@/lib/messages/tong-quan";
import { DUONG_NHAC_BUOI_SANG } from "@/lib/pham-vi-man";
import { workspaceUrl } from "@/lib/workspace-url";

export async function TongQuanChiOkr({ slug }: { slug: string }) {
	const m = tongQuanMessages(await getLocale());

	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.greeting.title}</PageShellTitle>
					<PageShellDescription>{m.chiOkr.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>

			<PageShellContent>
				<div>
					<Button asChild variant="outline">
						<Link href={workspaceUrl(slug, DUONG_NHAC_BUOI_SANG)}>
							{m.chiOkr.noiKenh}
						</Link>
					</Button>
				</div>
			</PageShellContent>
		</PageShell>
	);
}
