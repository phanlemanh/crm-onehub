import { redirect } from "next/navigation";
import { giaiDichKr } from "@/lib/okr-duong-kr";
import { requireSession } from "@/lib/session";
import { getServerTrpcClient } from "@/lib/trpc/server";

export const instant = false;

export default async function KrTrongBoPage({
	params,
}: {
	params: Promise<{ slug: string; keyResultId: string }>;
}) {
	await requireSession();
	const { slug, keyResultId } = await params;
	const trpc = getServerTrpcClient();
	const dich = await giaiDichKr(slug, keyResultId, (id) =>
		trpc.okr.viTriKr.query({ keyResultId: id }),
	);
	redirect(dich);
}
