import type { Metadata } from "next";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { GiaoViec } from "@/components/viec/giao-viec";
import { getLocale } from "@/lib/locale/server";
import { viecMessages } from "@/lib/messages/viec";
import { ViecCuaToi } from "./viec-cua-toi";

export async function generateMetadata(): Promise<Metadata> {
	return { title: viecMessages(await getLocale()).trang.tieuDe };
}

export default async function ViecPage() {
	const m = viecMessages(await getLocale());
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.trang.moTa}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<GiaoViec />
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				<ViecCuaToi />
			</PageShellContent>
		</PageShell>
	);
}
