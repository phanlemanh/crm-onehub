import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { soSanh, suKienDoi } from "@crm/validation/tai-lieu-diff";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { requireSession } from "@/lib/session";
import { doanTrongNguon, dongSoMay } from "@/lib/tai-lieu-ban-may";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { nullIfMissing } from "../../../(agent-builder)/missing-record";
import type { BanMay } from "./ban-may";
import { ManDuyet } from "./man-duyet";

type Params = Promise<{ slug: string; id: string }>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: taiLieuMessages(await getLocale()).metadata.duyet };
}

export default function DeXuatPage({ params }: { params: Params }) {
	return (
		<PageShell>
			<Suspense fallback={<KhungXuong hinh="chi-tiet" />}>
				<NoiDung params={params} />
			</Suspense>
		</PageShell>
	);
}

async function NoiDung({ params }: { params: Params }) {
	await requireSession();

	const { id } = await params;
	const trpc = getServerTrpc();
	const dx = await nullIfMissing(
		getServerQueryClient().fetchQuery(
			trpc.taiLieu.proposal.queryOptions({ id }),
		),
	);
	if (!dx) notFound();

	const khoi = soSanh(dx.banGoc, dx.noiDung);
	const chuNguon = dx.chuNguon ?? "";
	const may: BanMay | undefined = dx.nguon
		? {
				tenTep: dx.nguon.tenTep,
				chuNguon,
				noiDung: dx.noiDung,
				coBanGoc: dx.banGoc.trim() !== "",
				doanTrich: dx.trichDoan.map((t) => doanTrongNguon(chuNguon, t.trich)),
				dong: dongSoMay(dx.soMoi, dx.trichDoan).map((d) => ({
					so: d.so,
					trich: d.trich === null ? null : doanTrongNguon(chuNguon, d.trich),
				})),
			}
		: undefined;

	return (
		<HydrateClient>
			<ManDuyet
				deXuat={{
					id: dx.id,
					slug: dx.slug,
					ten: dx.ten,
					taoBoi: dx.taoBoi.name,
					taoLuc: dx.taoLuc,
					trangThai: dx.trangThai,
					lyDo: dx.lyDo,
					cu: dx.cu,
					duyetDuoc: dx.duyetDuoc,
					khoi,
					dai: suKienDoi(khoi),
					may,
					chienLuoc: dx.chienLuoc ?? undefined,
				}}
				key={`${dx.id}-${dx.trangThai}-${dx.cu}`}
			/>
		</HydrateClient>
	);
}
