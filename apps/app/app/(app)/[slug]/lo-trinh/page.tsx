import { workspaceRoleOf } from "@crm/auth";
import type { Metadata } from "next";
import { Suspense } from "react";
import { KhungCho } from "@/components/lo-trinh/khung-cho";
import { NoiDungLoTrinh } from "@/components/lo-trinh/noi-dung";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { choVaiXem } from "@/lib/lo-trinh/cho-vai";
import { docTepLoTrinh } from "@/lib/lo-trinh/doc-tep";
import { type DauVaoLoTrinh, docTrangLoTrinh } from "@/lib/lo-trinh/doc-trang";
import { getLocale } from "@/lib/locale/server";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import { requireSession } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
	return { title: loTrinhMessages(await getLocale()).trang.tieuDe };
}

async function docDauVao(): Promise<DauVaoLoTrinh> {
	"use cache";
	return docTrangLoTrinh(docTepLoTrinh());
}

async function NoiDung() {
	const session = await requireSession();
	const vai = await workspaceRoleOf(session.user.id);
	return <NoiDungLoTrinh dauVao={choVaiXem(await docDauVao(), vai)} />;
}

export default async function LoTrinhPage() {
	const m = loTrinhMessages(await getLocale());
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.trang.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<Suspense fallback={<KhungCho />}>
					<NoiDung />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}
