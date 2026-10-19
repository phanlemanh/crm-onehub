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
import { banDungHienTai } from "@/lib/lo-trinh/chon-nguon";
import { docBanChupCrm } from "@/lib/lo-trinh/doc-ban-chup";
import { docTepLoTrinh } from "@/lib/lo-trinh/doc-tep";
import {
	type DauVaoLoTrinh,
	docDauVaoChoVai,
	docTrangLoTrinh,
} from "@/lib/lo-trinh/doc-trang";
import { getLocale } from "@/lib/locale/server";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import { requireSession } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
	return { title: loTrinhMessages(await getLocale()).trang.tieuDe };
}

async function docBanDung(): Promise<DauVaoLoTrinh> {
	"use cache";
	return docTrangLoTrinh(docTepLoTrinh());
}

function ghiCanhBao(o: { ca: "loi" | "hong"; lyDo: string }) {
	console.warn("lo-trinh: roi ve ban dung", o);
}

async function NoiDung() {
	const session = await requireSession();
	const vai = await workspaceRoleOf(session.user.id);
	const dauVao = await docDauVaoChoVai(vai, {
		docBanChup: docBanChupCrm,
		docBanDung,
		banDung: banDungHienTai(),
		ghiCanhBao,
	});
	return <NoiDungLoTrinh dauVao={dauVao} />;
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
