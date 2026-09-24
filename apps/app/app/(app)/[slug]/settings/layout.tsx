import { Suspense } from "react";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { SettingsSidebar, SettingsSidebarFallback } from "./settings-sidebar";

export default function SettingsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
			<Suspense fallback={<SettingsSidebarFallback />}>
				<ThanhBenTheoVai />
			</Suspense>
			{children}
		</div>
	);
}

async function ThanhBenTheoVai() {
	await getServerQueryClient().prefetchQuery(
		getServerTrpc().workspace.get.queryOptions(),
	);

	return (
		<HydrateClient>
			<SettingsSidebar />
		</HydrateClient>
	);
}
