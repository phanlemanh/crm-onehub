import GoogleLogo from "@crm/ui/components/brand-logos/google";
import MicrosoftLogo from "@crm/ui/components/brand-logos/microsoft";
import SlackLogo from "@crm/ui/components/brand-logos/slack";
import { Button } from "@crm/ui/components/button";
import { Spinner } from "@crm/ui/components/spinner";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getLocale } from "@/lib/locale/server";
import { ketNoiMessages } from "@/lib/messages/settings-ket-noi";
import { requireSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { AddConnectionDialog } from "./add-connection-dialog";

export async function generateMetadata(): Promise<Metadata> {
	return { title: ketNoiMessages(await getLocale()).danhSach.tieuDe };
}

export default function ConnectionsSettingsPage(
	props: PageProps<"/[slug]/settings/connections">,
) {
	return (
		<Suspense fallback={<ConnectionsFallback />}>
			<ConnectionsSettingsPageContent {...props} />
		</Suspense>
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
	const [google, microsoft, slack] = await Promise.all([
		queryClient.fetchQuery(trpc.google.status.queryOptions()),
		queryClient.fetchQuery(trpc.microsoft.status.queryOptions()),
		queryClient.fetchQuery(trpc.slack.status.queryOptions()),
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
		<main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-(--spacing-page-inline) pt-(--spacing-page-top) pb-(--spacing-page-bottom)">
			{rows.length > 0 ? (
				<div className="mx-auto flex w-full max-w-(--container-page) flex-col gap-(--spacing-page-gap)">
					<header className="flex items-start justify-between gap-4 px-(--spacing-block-inline)">
						<div className="flex flex-col gap-2">
							<h1 className="font-medium text-2xl tracking-tight">
								{t.danhSach.tieuDe}
							</h1>
							<p className="max-w-2xl text-muted-foreground text-sm">
								{t.danhSach.moTa}
							</p>
						</div>
						<Button asChild variant="outline">
							<Link href={`/${slug}/settings/connections?add=1`}>
								{t.danhSach.them}
							</Link>
						</Button>
					</header>
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
				</div>
			) : (
				<div className="mx-auto flex w-full max-w-(--container-narrow) flex-1 flex-col justify-center gap-(--spacing-page-gap) text-center">
					<div className="flex flex-col gap-2 px-(--spacing-block-inline)">
						<h1 className="font-medium text-2xl tracking-tight">
							{t.danhSach.trongTieuDe}
						</h1>
						<p className="text-muted-foreground text-sm leading-relaxed">
							{t.danhSach.trongMoTa}
						</p>
					</div>
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
							logo={MicrosoftLogo}
							name={t.ten.microsoft365}
							description={t.danhSach.microsoftKhoiDau}
							href={`/${slug}/settings/connections/microsoft`}
							connectLabel={t.danhSach.cam}
						/>
					</div>
					<p className="px-(--spacing-block-inline) text-muted-foreground text-sm">
						{t.danhSach.timGiKhac}{" "}
						<Link
							className="font-medium text-foreground underline underline-offset-4"
							href={`/${slug}/settings/connections?add=1`}
						>
							{t.danhSach.xemTatCa}
						</Link>
					</p>
				</div>
			)}
			<AddConnectionDialog
				slug={slug}
				open={first(query.add) === "1"}
				connected={rows.map((row) => row.name)}
			/>
		</main>
	);
}

function ConnectionsFallback() {
	return (
		<main className="flex min-h-0 min-w-0 flex-1 items-center justify-center px-(--spacing-page-inline) pt-(--spacing-page-top) pb-(--spacing-page-bottom)">
			<Spinner size="lg" />
		</main>
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
