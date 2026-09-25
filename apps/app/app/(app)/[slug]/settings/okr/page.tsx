import type { Metadata } from "next";
import type * as React from "react";
import { Suspense } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellLoading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { okrMessages } from "@/lib/messages/okr";
import { goiYChuKy, homNayVn } from "@/lib/okr-chu-ky-nhan";
import { settingsMessages } from "@/lib/messages/settings";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { BangChuKy } from "./bang-chu-ky";
import { FormCauHinh } from "./form-cau-hinh";
import { LyDoKhongQuyen } from "./trang-thai-cai-dat";

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: settingsMessages(await getLocale()).tieuDeTab.chuongTrinhOkr,
	};
}

function DauTrang({
	tieuDe,
	moTa,
	lyDo,
}: {
	tieuDe: string;
	moTa: string;
	lyDo?: React.ReactNode;
}) {
	return (
		<PageShellHeader>
			<PageShellHeading>
				<PageShellTitle>{tieuDe}</PageShellTitle>
				<PageShellDescription>{moTa}</PageShellDescription>
				{lyDo}
			</PageShellHeading>
		</PageShellHeader>
	);
}

export default async function CaiDatChuongTrinhOkrPage() {
	const m = okrMessages(await getLocale()).caiDat;

	return (
		<PageShell width="page">
			<Suspense
				fallback={
					<>
						<DauTrang tieuDe={m.tieuDe} moTa={m.moTa} />
						<PageShellLoading />
					</>
				}
			>
				<NoiDung tieuDe={m.tieuDe} moTa={m.moTa} />
			</Suspense>
		</PageShell>
	);
}

async function NoiDung({ tieuDe, moTa }: { tieuDe: string; moTa: string }) {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();

	await Promise.all([
		queryClient.prefetchQuery(trpc.okr.cycles.queryOptions()),
		queryClient.prefetchQuery(trpc.okr.program.queryOptions()),
	]);

	return (
		<HydrateClient>
			<DauTrang tieuDe={tieuDe} moTa={moTa} lyDo={<LyDoKhongQuyen />} />
			<PageShellContent>
				<div className="flex flex-col gap-6">
					<BangChuKy goiY={goiYChuKy(homNayVn(new Date()))} />
					<FormCauHinh />
				</div>
			</PageShellContent>
		</HydrateClient>
	);
}
