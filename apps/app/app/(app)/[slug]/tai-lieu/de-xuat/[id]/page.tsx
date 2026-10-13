import { soSanh, suKienDoi } from "@crm/validation/tai-lieu-diff";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageShell, PageShellLoading } from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { requireSession } from "@/lib/session";
import { doanTrongNguon, dongSoMay } from "@/lib/tai-lieu-ban-may";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { nullIfMissing } from "../../../(agent-builder)/missing-record";
import type { BanMay } from "./ban-may";
import { ManDuyet } from "./man-duyet";
import { ManDuyetViecTrang } from "./man-duyet-viec-trang";

type Params = Promise<{ slug: string; id: string }>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: taiLieuMessages(await getLocale()).metadata.duyet };
}

export default function DeXuatPage({ params }: { params: Params }) {
	return (
		<PageShell>
			<Suspense fallback={<PageShellLoading />}>
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

	if (dx.loai !== "NOI_DUNG")
		return (
			<HydrateClient>
				<ManDuyetViecTrang
					deXuat={{
						id: dx.id,
						slug: dx.slug,
						ten: dx.ten,
						loai: dx.loai,
						lyDoDeXuat: dx.lyDoDeXuat ?? "",
						taoBoi: dx.taoBoi.name,
						taoLuc: dx.taoLuc,
						trangThai: dx.trangThai,
						lyDo: dx.lyDo,
						duyetDuoc: dx.duyetDuoc,
						diffHash: dx.diffHash,
					}}
					key={`${dx.id}-${dx.trangThai}`}
				/>
			</HydrateClient>
		);

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
					tuPhienBanSo: dx.tuPhienBanSo,
				}}
				key={`${dx.id}-${dx.trangThai}-${dx.cu}`}
			/>
		</HydrateClient>
	);
}
