import { Button } from "@crm/ui/components/button";
import {
	laQuanTriWorkspace,
	toWorkspaceRole,
} from "@crm/validation/vai-workspace";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { KhongQuyenTatCa } from "@/components/tin-hieu/bang-tat-ca";
import { ThanhTheTinHieu } from "@/components/tin-hieu/thanh-the-tin-hieu";
import { docTepLoTrinh } from "@/lib/lo-trinh/doc-tep";
import { getLocale } from "@/lib/locale/server";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { requireSession } from "@/lib/session";
import { ghepTatCa } from "@/lib/tin-hieu/tat-ca";
import { HydrateClient } from "@/lib/trpc/hydrate";
import {
	getServerQueryClient,
	getServerTrpc,
	getServerTrpcClient,
} from "@/lib/trpc/server";
import { workspaceUrl } from "@/lib/workspace-url";
import { KhungChoTatCa } from "./khung-cho";
import { TatCaTrang } from "./tat-ca-trang";

export async function generateMetadata(): Promise<Metadata> {
	return { title: tinHieuMessages(await getLocale()).tatCa.tieuDe };
}

async function docBanVe(): Promise<string | null> {
	"use cache";
	return docTepLoTrinh();
}

async function NoiDung() {
	await requireSession();
	const m = tinHieuMessages(await getLocale());
	const tatCa = await getServerQueryClient().fetchQuery(
		getServerTrpc().tinHieu.tatCa.queryOptions(),
	);
	const kq = ghepTatCa({
		rows: tatCa.rows,
		html: await docBanVe(),
		now: new Date(),
		m,
	});
	return (
		<HydrateClient>
			<TatCaTrang
				banVeDocDuoc={kq.banVeDocDuoc}
				baSo={kq.baSo}
				trangThai={kq.trangThai}
			/>
		</HydrateClient>
	);
}

export default async function TatCaPage({
	params,
}: PageProps<"/[slug]/tin-hieu/tat-ca">) {
	const [{ slug }, workspace, locale] = await Promise.all([
		params,
		getServerTrpcClient().workspace.get.query(),
		getLocale(),
	]);
	const m = tinHieuMessages(locale);
	const laQuanTri = laQuanTriWorkspace(
		toWorkspaceRole(workspace.viewerRole ?? "member"),
	);
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.tatCa.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.tatCa.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<ThanhTheTinHieu
				hrefCuaToi={workspaceUrl(slug, "/tin-hieu")}
				hrefTatCa={workspaceUrl(slug, "/tin-hieu/tat-ca")}
				laQuanTri={laQuanTri}
				the="tat-ca"
			/>
			<PageShellContent>
				{laQuanTri ? (
					<Suspense fallback={<KhungChoTatCa />}>
						<NoiDung />
					</Suspense>
				) : (
					<KhongQuyenTatCa
						nutVe={
							<Button asChild variant="outline">
								<Link href={workspaceUrl(slug, "/tin-hieu")}>{m.tatCa.ve}</Link>
							</Button>
						}
					/>
				)}
			</PageShellContent>
		</PageShell>
	);
}
