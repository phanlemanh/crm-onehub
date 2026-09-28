import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell, PageShellLoading } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { type LuaChon, ManSoan } from "../man-soan";

export async function generateMetadata(): Promise<Metadata> {
	return { title: taiLieuMessages(await getLocale()).metadata.moi };
}

export default function TrangMoiPage() {
	return (
		<PageShell>
			<Suspense fallback={<PageShellLoading />}>
				<NoiDung />
			</Suspense>
		</PageShell>
	);
}

async function NoiDung() {
	const session = await requireSession();
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [thanhVien, toChuc] = await Promise.all([
		queryClient.fetchQuery(trpc.okr.thanhVien.queryOptions()).catch(() => []),
		queryClient.fetchQuery(trpc.org.tree.queryOptions()).catch(() => null),
	]);

	const toi = session.user.id;
	const chuTrang: LuaChon[] = [
		{ id: toi, ten: session.user.name },
		...thanhVien
			.filter((u) => u.id !== toi)
			.map((u) => ({ id: u.id, ten: u.name })),
	];
	const donVi: LuaChon[] = toChuc
		? [
				...toChuc.divisions.flatMap((b) => b.departments),
				...toChuc.chuaXep,
			].map((d) => ({ id: d.id, ten: d.name }))
		: [];

	return (
		<HydrateClient>
			<ManSoan vao={{ kieu: "moi", toiId: toi, chuTrang, donVi }} />
		</HydrateClient>
	);
}
