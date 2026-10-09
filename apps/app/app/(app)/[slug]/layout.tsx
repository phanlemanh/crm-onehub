import { laVaiChiOkr, toWorkspaceRole } from "@crm/validation/vai-workspace";
import { notFound, unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ApiOriginProvider } from "@/components/api-origin";
import { AppHeader, AppHeaderFallback } from "@/components/app-header";
import { AppIconRail, AppIconRailFallback } from "@/components/app-icon-rail";
import { QuickSwitcher } from "@/components/crm/quick-switcher";
import { RecordSheetHost } from "@/components/crm/record-sheet/record-sheet-host";
import { MobileNavProvider } from "@/components/mobile-nav";
import { okrBridgeConfigured } from "@/lib/agent-bridge";
import { API_URL } from "@/lib/env";
import { requireMailboxAccess } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";

export default function AppLayout({
	children,
	params,
}: LayoutProps<"/[slug]">) {
	return (
		<MobileNavProvider>
			<ApiOriginProvider origin={API_URL}>
				<div className="isolate flex h-svh flex-col">
					<Suspense fallback={<AppHeaderFallback />}>
						<WorkspaceHeader params={params} />
					</Suspense>

					<div className="flex min-h-0 flex-1">
						<Suspense fallback={<AppIconRailFallback />}>
							<RailTheoVai />
						</Suspense>
						{children}
					</div>

					<Suspense fallback={null}>
						<RecordSheetHost cauNoiOkr={okrBridgeConfigured()} />
					</Suspense>

					<Suspense fallback={null}>
						<TimNhanhTheoVai />
					</Suspense>
				</div>
			</ApiOriginProvider>
		</MobileNavProvider>
	);
}

async function loadWorkspace() {
	try {
		return await getServerQueryClient().fetchQuery(
			getServerTrpc().workspace.get.queryOptions(),
		);
	} catch (error) {
		unstable_rethrow(error);
		return null;
	}
}

function chiOkr(viewerRole: string | null | undefined): boolean {
	return viewerRole ? laVaiChiOkr(toWorkspaceRole(viewerRole)) : false;
}

async function WorkspaceHeader({
	params,
}: Pick<LayoutProps<"/[slug]">, "params">) {
	await connection();
	const [{ user }, { slug }, workspace] = await Promise.all([
		requireMailboxAccess(),
		params,
		loadWorkspace(),
	]);

	if (workspace && workspace.slug !== slug) notFound();

	return (
		<HydrateClient>
			<AppHeader
				user={{
					name: user.name,
					email: user.email,
					image: user.image ?? null,
				}}
			/>
		</HydrateClient>
	);
}

async function RailTheoVai() {
	await connection();
	const workspace = await loadWorkspace();

	return (
		<HydrateClient>
			<AppIconRail
				workspace={workspace ? { viewerRole: workspace.viewerRole } : null}
			/>
		</HydrateClient>
	);
}

async function TimNhanhTheoVai() {
	await connection();
	const workspace = await loadWorkspace();

	return (
		<HydrateClient>
			<QuickSwitcher coDoiTac={!chiOkr(workspace?.viewerRole)} />
		</HydrateClient>
	);
}
