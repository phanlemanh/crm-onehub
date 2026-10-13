import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import type * as React from "react";
import { Suspense } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { getLocale } from "@/lib/locale/server";
import { okrMessages } from "@/lib/messages/okr";
import { settingsMessages } from "@/lib/messages/settings";
import { goiYChuKy, homNayVn } from "@/lib/okr-chu-ky-nhan";
import { requireSession } from "@/lib/session";
import { HydrateClient } from "@/lib/trpc/hydrate";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { BangChuKy } from "./bang-chu-ky";
import { FormCauHinh } from "./form-cau-hinh";
import { KhoiMauOkr } from "./khoi-mau-okr";
import { KhoiTroLyOkr } from "./khoi-tro-ly-okr";
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
						<KhungXuong hinh="the" />
					</>
				}
			>
				<NoiDung tieuDe={m.tieuDe} moTa={m.moTa} />
			</Suspense>
		</PageShell>
	);
}

async function loadProgram() {
	try {
		return await getServerQueryClient().fetchQuery(
			getServerTrpc().okr.program.queryOptions(),
		);
	} catch (error) {
		unstable_rethrow(error);
		return null;
	}
}

async function NoiDung({ tieuDe, moTa }: { tieuDe: string; moTa: string }) {
	await requireSession();

	const trpc = getServerTrpc();
	const queryClient = getServerQueryClient();
	const homNay = homNayVn(new Date());

	const [, program] = await Promise.all([
		queryClient.prefetchQuery(trpc.okr.cycles.queryOptions()),
		loadProgram(),
		queryClient.prefetchQuery(trpc.okr.mau.queryOptions({})),
	]);
	if (program?.canManage) {
		await Promise.all([
			queryClient.prefetchQuery(trpc.okr.aiChiTieu.queryOptions()),
			queryClient.prefetchQuery(trpc.org.tree.queryOptions()),
		]);
	}

	return (
		<HydrateClient>
			<DauTrang tieuDe={tieuDe} moTa={moTa} lyDo={<LyDoKhongQuyen />} />
			<PageShellContent>
				<div className="flex flex-col gap-6">
					<BangChuKy goiY={goiYChuKy(homNay)} homNay={homNay} />
					<FormCauHinh />
					<KhoiMauOkr />
					<KhoiTroLyOkr />
				</div>
			</PageShellContent>
		</HydrateClient>
	);
}
