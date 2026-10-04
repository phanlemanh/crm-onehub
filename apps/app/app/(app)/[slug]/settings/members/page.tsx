import type { Metadata } from "next";
import { Suspense } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellLoading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { thanhVienMessages } from "@/lib/messages/settings-thanh-vien";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { AllowancesTable } from "./allowances-table";
import { ChoPhepDiaChi } from "./cho-phep-dia-chi";
import { membersSearchParams } from "./members-search-params";
import { MembersTable } from "./members-table";
import { TenMienNoiBo } from "./ten-mien-noi-bo";

export async function generateMetadata(): Promise<Metadata> {
	return { title: thanhVienMessages(await getLocale()).trang.tieuDeTab };
}

export default async function MembersSettingsPage({
	searchParams,
}: PageProps<"/[slug]/settings/members">) {
	const t = thanhVienMessages(await getLocale());

	return (
		<PageShell width="wide">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.trang.moTa}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<Suspense fallback={null}>
						<HanhDongDauTrang />
					</Suspense>
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent>
				<Suspense fallback={<PageShellLoading />}>
					<Members searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function quyenQuanTri(): Promise<boolean> {
	const trpc = getServerTrpc();
	const workspace = await getServerQueryClient()
		.fetchQuery(trpc.workspace.get.queryOptions())
		.catch(() => null);
	return workspace?.canManageMembers ?? false;
}

async function HanhDongDauTrang() {
	await requireSession();

	return (await quyenQuanTri()) ? <ChoPhepDiaChi /> : null;
}

async function Members({
	searchParams,
}: Pick<PageProps<"/[slug]/settings/members">, "searchParams">) {
	await requireSession();

	const values = await membersSearchParams.load(searchParams);

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();

	await Promise.all([
		quyenQuanTri().then((quanTri) =>
			quanTri
				? queryClient.prefetchQuery(trpc.workspace.allowances.queryOptions())
				: undefined,
		),
		queryClient.prefetchQuery(
			trpc.workspace.members.queryOptions(membersSearchParams.toInput(values)),
		),
		queryClient.prefetchQuery(
			trpc.workspace.members.queryOptions(membersSearchParams.defaultInput()),
		),
		queryClient.prefetchQuery(trpc.workspace.staffDomains.queryOptions()),
	]);

	return (
		<HydrateClient>
			<div className="flex flex-col gap-8">
				<MembersTable />
				<AllowancesTable />
				<TenMienNoiBo />
			</div>
		</HydrateClient>
	);
}
