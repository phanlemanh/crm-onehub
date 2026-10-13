import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageShell, PageShellHeader } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { nullIfMissing } from "../../(agent-builder)/missing-record";
import { DuongDanTaiLieu } from "../duong-dan-tai-lieu";
import { ManDoc } from "./man-doc";

type Params = Promise<{ slug: string; trang: string }>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: taiLieuMessages(await getLocale()).metadata.danhSach };
}

export default async function TrangTaiLieuPage({ params }: { params: Params }) {
	const [{ slug }, locale] = await Promise.all([params, getLocale()]);
	return (
		<PageShell>
			<PageShellHeader
				breadcrumb={<DuongDanTaiLieu locale={locale} slug={slug} />}
			/>
			<Suspense fallback={<KhungXuong hinh="chi-tiet" />}>
				<NoiDung params={params} />
			</Suspense>
		</PageShell>
	);
}

async function NoiDung({ params }: { params: Params }) {
	await requireSession();

	const { trang: slug } = await params;
	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const [trang, cho] = await Promise.all([
		nullIfMissing(
			queryClient.fetchQuery(trpc.taiLieu.get.queryOptions({ slug })),
		),
		queryClient
			.fetchQuery(trpc.taiLieu.proposals.queryOptions({ nhom: "cho", slug }))
			.catch(() => null),
		queryClient.prefetchQuery(trpc.taiLieu.nhacToi.queryOptions({ slug })),
	]);
	if (!trang) notFound();

	const choCuaTrang = (cho?.rows ?? []).filter(
		(r) => r.slug === trang.slug && r.trangThai === "CHO_DUYET" && !r.cu,
	);
	const soBanCho = trang.coBanCho ? Math.max(1, choCuaTrang.length) : 0;

	return (
		<HydrateClient>
			<ManDoc
				trang={{
					slug: trang.slug,
					ten: trang.ten,
					loai: trang.loai,
					chuTrang: trang.chuTrang.name,
					donVi: trang.donVi?.name ?? null,
					phienBan: trang.phienBan,
					noiDung: trang.noiDung ?? "",
					choLanDau: trang.choLanDau
						? {
								dangCho: trang.choLanDau.dangCho,
								nguon: trang.choLanDau.nguon,
							}
						: null,
					soBanCho,
					deXuatChoId: choCuaTrang[0]?.id ?? null,
					nguon: trang.nguon,
					xacMinh: {
						den: trang.xacMinhDen,
						quaHan: trang.quaHanXacMinh,
						coQuyen: trang.coQuyenXacMinh,
					},
				}}
			/>
		</HydrateClient>
	);
}
