import { NHAC } from "@crm/db/onboarding-nhac";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale } from "@/lib/locale/server";
import { ngayGio } from "@/lib/nhac-qua-zalo-man";
import { requireSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { ConnectionPage, ConnectionPageLoading } from "../connection-page";
import { KetNoiZaloThan } from "./ket-noi-zalo-than";

export async function generateMetadata(): Promise<Metadata> {
	return { title: "Zalo" };
}

type ZaloConnectionPageProps = { params: Promise<{ slug: string }> };

export default function ZaloConnectionPage(props: ZaloConnectionPageProps) {
	return (
		<Suspense fallback={<ConnectionPageLoading />}>
			<ZaloConnectionPageContent {...props} />
		</Suspense>
	);
}

async function ZaloConnectionPageContent({ params }: ZaloConnectionPageProps) {
	await requireSession();
	const locale = await getLocale();
	const { slug } = await params;
	const xuong = await getServerQueryClient().fetchQuery(
		getServerTrpc().zalo.xuong.queryOptions(),
	);

	return (
		<ConnectionPage>
			<KetNoiZaloThan
				locale={locale}
				hrefThongBao={`/${slug}/settings/notifications`}
				du={{
					bat: xuong.bat,
					tenBot: xuong.tenBot,
					pollCuoi: xuong.pollCuoi
						? ngayGio(locale, xuong.pollCuoi, NHAC.muiGio)
						: null,
					im: xuong.im,
					daNoi: xuong.daNoi,
					tong: xuong.tong,
					nguoi: xuong.nguoi,
					canManage: xuong.canManage,
					nguonToken: xuong.nguonToken,
					goiToken: xuong.goiToken,
					webhook: xuong.webhook.trangThai,
				}}
			/>
		</ConnectionPage>
	);
}
