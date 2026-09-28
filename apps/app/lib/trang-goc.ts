import { getSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { workspaceUrl } from "@/lib/workspace-url";

export async function duongTrangGoc(): Promise<string> {
	const phien = await getSession();

	if (!phien) return "/sign-in";

	const workspace = await getServerQueryClient().fetchQuery(
		getServerTrpc().workspace.get.queryOptions(),
	);

	if (!workspace.slug) {
		throw new Error(
			"Trang gốc: workspace.get không trả slug cho một phiên còn sống.",
		);
	}

	return workspaceUrl(workspace.slug);
}
