import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getLocale } from "@/lib/locale/server";
import { okrSoanMessages } from "@/lib/messages/okr-soan";
import { requireSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { donViCua, duongMoCuoc } from "../luat-ban-nhap";

type Params = Promise<{ slug: string; cuocSoanId: string }>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: okrSoanMessages(await getLocale()).trang.tieuDe };
}

export default function SoanOkrPage({ params }: { params: Params }) {
	return (
		<Suspense fallback={null}>
			<ChuyenSangKhung params={params} />
		</Suspense>
	);
}

async function ChuyenSangKhung({ params }: { params: Params }): Promise<null> {
	await requireSession();
	const { slug, cuocSoanId } = await params;
	const trpc = getServerTrpc();
	const du = await getServerQueryClient()
		.fetchQuery(trpc.okr.soanDanhSach.queryOptions({ cuocSoanId }))
		.catch(() => null);
	redirect(duongMoCuoc(slug, cuocSoanId, du ? donViCua(du.cuoc) : null));
}
