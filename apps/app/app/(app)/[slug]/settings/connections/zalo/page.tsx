import { NHAC } from "@crm/db/onboarding-nhac";
import { KhungXuong } from "@crm/ui/components/khung-xuong";
import type { Metadata } from "next";
import { Suspense } from "react";

import { getLocale } from "@/lib/locale/server";
import { nhacQuaZaloMessages } from "@/lib/messages/nhac-qua-zalo";
import { ketNoiMessages } from "@/lib/messages/settings-ket-noi";
import { ngayGio } from "@/lib/nhac-qua-zalo-man";
import { requireSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { KhungKetNoi } from "../khung-ket-noi";
import { KetNoiZaloThan } from "./ket-noi-zalo-than";

export async function generateMetadata(): Promise<Metadata> {
	return { title: ketNoiMessages(await getLocale()).ten.zalo };
}

type ZaloConnectionPageProps = { params: Promise<{ slug: string }> };

export default async function ZaloConnectionPage(
	props: ZaloConnectionPageProps,
) {
	const locale = await getLocale();

	return (
		<KhungKetNoi
			params={props.params}
			kind="zalo"
			locale={locale}
			tieuDe={ketNoiMessages(locale).ten.zalo}
			laTenRieng
			moTa={nhacQuaZaloMessages(locale).ketNoi.moTa}
		>
			<Suspense fallback={<KhungXuong hinh="the" />}>
				<ZaloConnectionPageContent {...props} />
			</Suspense>
		</KhungKetNoi>
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
		<KetNoiZaloThan
			locale={locale}
			hrefThongBao={`/${slug}/reminders`}
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
	);
}
