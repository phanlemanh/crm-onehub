import Chat from "@carbon/icons-react/es/Chat";
import GoogleLogo from "@crm/ui/components/brand-logos/google";
import MicrosoftLogo from "@crm/ui/components/brand-logos/microsoft";
import SlackLogo from "@crm/ui/components/brand-logos/slack";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { ketNoiMessages } from "@/lib/messages/settings-ket-noi";
import { requireSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { AddConnectionDialog } from "./add-connection-dialog";

export async function generateMetadata(): Promise<Metadata> {
	return { title: ketNoiMessages(await getLocale()).danhSach.tieuDe };
}

export default async function ConnectionsSettingsPage(
	props: PageProps<"/[slug]/settings/connections">,
) {
	const t = ketNoiMessages(await getLocale());

	return (
		<PageShell width="page">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{t.danhSach.tieuDe}</PageShellTitle>
					<PageShellDescription>{t.danhSach.moTa}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<Button asChild variant="outline">
						<Link href="?add=1">{t.danhSach.them}</Link>
					</Button>
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				<Suspense fallback={<KhungXuong hinh="danh-sach" />}>
					<ConnectionsSettingsPageContent {...props} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}

async function ConnectionsSettingsPageContent({
	params,
	searchParams,
}: PageProps<"/[slug]/settings/connections">) {
	await requireSession();
	const t = ketNoiMessages(await getLocale());
	const [{ slug }, query] = await Promise.all([params, searchParams]);
	const queryClient = getServerQueryClient();
	const trpc = getServerTrpc();
	const [google, microsoft, slack, zalo] = await Promise.all([
		queryClient.fetchQuery(trpc.google.status.queryOptions()),
		queryClient.fetchQuery(trpc.microsoft.status.queryOptions()),
		queryClient.fetchQuery(trpc.slack.status.queryOptions()),
		queryClient.fetchQuery(trpc.zalo.xuong.queryOptions()),
	]);
	const rows = [
		...(google.linked
			? [
					{
						name: t.ten.googleWorkspace,
						status: t.chung.daCam,
						bringsIn: t.danhSach.googleMangVe,
						sends: t.danhSach.chuaGuiGi,
						href: `/${slug}/settings/connections/google`,
						logo: GoogleLogo,
					},
				]
			: []),
		...(slack.connected
			? [
					{
						name: t.ten.slack,
						status: slack.workspace
							? t.danhSach.daCamVoi(slack.workspace)
							: t.chung.daCam,
						bringsIn: t.danhSach.slackMangVe,
						sends: t.danhSach.slackGui,
						href: `/${slug}/settings/connections/slack`,
						logo: SlackLogo,
					},
				]
			: []),
		...(zalo.bat
			? [
					{
						name: t.ten.zalo,
						status: t.chung.daCam,
						bringsIn: t.danhSach.zaloMangVe,
						sends: t.danhSach.zaloGui,
						href: `/${slug}/settings/connections/zalo`,
						logo: Chat,
					},
				]
			: []),
		...(microsoft.linked
			? [
					{
						name: t.ten.microsoft365,
						status: t.chung.daCam,
						bringsIn: t.danhSach.microsoftMangVe,
						sends: t.danhSach.chuaGuiGi,
						href: `/${slug}/settings/connections/microsoft`,
						logo: MicrosoftLogo,
					},
				]
			: []),
	];

	return (
		<>
			{rows.length > 0 ? (
				<div className="flex flex-col gap-3">
					{rows.map((row) => (
						<ConnectionCard
							key={row.name}
							{...row}
							manageLabel={t.danhSach.quanLy}
							bringsInLabel={t.danhSach.mangVe}
							sendsLabel={t.danhSach.gui}
						/>
					))}
				</div>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>{t.danhSach.trongTieuDe}</CardTitle>
						<CardDescription>{t.danhSach.trongMoTa}</CardDescription>
					</CardHeader>
					<div className="flex flex-col divide-y rounded-lg border bg-card px-(--spacing-block-inline)">
						<StarterRow
							logo={GoogleLogo}
							name={t.ten.googleWorkspace}
							description={t.danhSach.googleKhoiDau}
							href={`/${slug}/settings/connections/google`}
							connectLabel={t.danhSach.cam}
						/>
						<StarterRow
							logo={SlackLogo}
							name={t.ten.slack}
							description={t.danhSach.slackKhoiDau}
							href={`/${slug}/settings/connections/slack`}
							connectLabel={t.danhSach.cam}
						/>
						<StarterRow
							logo={Chat}
							name={t.ten.zalo}
							description={t.danhSach.zaloKhoiDau}
							href={`/${slug}/settings/connections/zalo`}
							connectLabel={t.danhSach.cam}
						/>
						<StarterRow
							logo={MicrosoftLogo}
							name={t.ten.microsoft365}
							description={t.danhSach.microsoftKhoiDau}
							href={`/${slug}/settings/connections/microsoft`}
							connectLabel={t.danhSach.cam}
						/>
					</div>
					<p className="text-muted-foreground text-sm">
						{t.danhSach.timGiKhac}{" "}
						<Link
							className="font-medium text-foreground underline underline-offset-4"
							href={`/${slug}/settings/connections?add=1`}
						>
							{t.danhSach.xemTatCa}
						</Link>
					</p>
				</Card>
			)}
			<AddConnectionDialog
				slug={slug}
				open={first(query.add) === "1"}
				connected={rows.map((row) => row.name)}
			/>
		</>
	);
}

function ConnectionCard({
	name,
	status,
	bringsIn,
	sends,
	href,
	logo: Logo,
	manageLabel,
	bringsInLabel,
	sendsLabel,
}: {
	name: string;
	status: string;
	bringsIn: string;
	sends: string;
	href: string;
	logo: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	manageLabel: string;
	bringsInLabel: string;
	sendsLabel: string;
}) {
	return (
		<section className="flex flex-col gap-4 rounded-lg border bg-card px-(--spacing-block-inline) py-4">
			<div className="flex items-center gap-3">
				<Logo className="size-5 shrink-0" />
				<h2 className="font-medium text-sm" translate="no">
					{name}
				</h2>
				<p className="ml-auto text-right text-muted-foreground text-xs">
					{status}
				</p>
				<Button asChild size="sm" variant="outline">
					<Link href={href}>{manageLabel}</Link>
				</Button>
			</div>
			<div className="flex flex-col gap-2 pl-8 text-sm">
				<CapabilityRow label={bringsInLabel} value={bringsIn} />
				<CapabilityRow label={sendsLabel} value={sends} />
			</div>
		</section>
	);
}

function CapabilityRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex gap-4">
			<span className="w-22 shrink-0 text-muted-foreground">{label}</span>
			<span>{value}</span>
		</div>
	);
}

function StarterRow({
	logo: Logo,
	name,
	description,
	href,
	connectLabel,
}: {
	logo: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	name: string;
	description: string;
	href: string;
	connectLabel: string;
}) {
	return (
		<div className="flex items-center gap-3 py-4 text-left">
			<Logo className="size-5 shrink-0" />
			<div className="min-w-0 flex-1">
				<h2 className="font-medium text-sm" translate="no">
					{name}
				</h2>
				<p className="text-muted-foreground text-xs">{description}</p>
			</div>
			<Button asChild variant="outline" size="sm">
				<Link href={href}>{connectLabel}</Link>
			</Button>
		</div>
	);
}

function first(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}
