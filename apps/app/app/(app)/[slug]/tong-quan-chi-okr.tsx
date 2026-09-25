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
import { CAI_DAT_MAC_DINH_CHI_OKR } from "@/lib/pham-vi-man";
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
				<div className="flex gap-2">
					<Button asChild variant="outline">
						<Link href={workspaceUrl(slug, "/okr")}>{m.chiOkr.noiKhu}</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href={workspaceUrl(slug, CAI_DAT_MAC_DINH_CHI_OKR)}>
							{m.chiOkr.noiKenh}
						</Link>
					</Button>
				</div>
			</PageShellContent>
		</PageShell>
	);
}
