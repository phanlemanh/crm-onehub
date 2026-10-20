import { workspaceRoleOf } from "@crm/auth";
import type { Metadata } from "next";
import { Fragment, Suspense } from "react";
import { BoChonSanPham } from "@/components/lo-trinh/bo-chon-san-pham";
import { KhungCho } from "@/components/lo-trinh/khung-cho";
import { NoiDungLoTrinh } from "@/components/lo-trinh/noi-dung";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { banDungHienTai } from "@/lib/lo-trinh/chon-nguon";
import { docBanChupCrm } from "@/lib/lo-trinh/doc-ban-chup";
import {
	docBanChupSanPham,
	sanPhamThayDuoc,
} from "@/lib/lo-trinh/doc-san-pham";
import { docTepLoTrinh } from "@/lib/lo-trinh/doc-tep";
import {
	type DauVaoLoTrinh,
	docDauVaoChoVai,
	docTrangLoTrinh,
} from "@/lib/lo-trinh/doc-trang";
import {
	chonSanPham,
	danhSachChon,
	docDauVaoSanPham,
} from "@/lib/lo-trinh/san-pham";
import { loadLoTrinhSearchParams } from "@/lib/lo-trinh/tham-so-san-pham";
import { getLocale } from "@/lib/locale/server";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { requireSession } from "@/lib/session";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
	return { title: loTrinhMessages(await getLocale()).trang.tieuDe };
}

async function docBanDung(): Promise<DauVaoLoTrinh> {
	"use cache";
	return docTrangLoTrinh(docTepLoTrinh());
}

function ghiCanhBao(o: { ca: "loi" | "hong"; lyDo: string }) {
	console.warn("lo-trinh: roi ve ban dung", o);
}

async function nguoiXem(searchParams: SearchParams | undefined) {
	const session = await requireSession();
	const vai = await workspaceRoleOf(session.user.id);
	const thayDuoc = await sanPhamThayDuoc(session.user.id, vai);
	const thamSo = searchParams
		? (await loadLoTrinhSearchParams(searchParams))[
				SEARCH_PARAM.loTrinh.sanPham
			]
		: null;
	return { vai, thayDuoc, dangMo: chonSanPham(thayDuoc, thamSo) };
}

async function BoChon({ searchParams }: { searchParams?: SearchParams }) {
	const { thayDuoc, dangMo } = await nguoiXem(searchParams);
	return <BoChonSanPham dangMo={dangMo} ds={danhSachChon(thayDuoc)} />;
}

async function NoiDung({ searchParams }: { searchParams?: SearchParams }) {
	const { vai, thayDuoc, dangMo } = await nguoiXem(searchParams);
	const sp = thayDuoc.find((s) => s.ma === dangMo);
	const dauVao = sp
		? await docDauVaoSanPham(sp, vai, docBanChupSanPham)
		: await docDauVaoChoVai(vai, {
				docBanChup: docBanChupCrm,
				docBanDung,
				banDung: banDungHienTai(),
				ghiCanhBao,
			});
	return (
		<Fragment key={dangMo}>
			<NoiDungLoTrinh dauVao={dauVao} />
		</Fragment>
	);
}

export default async function LoTrinhPage({
	searchParams,
}: {
	searchParams?: SearchParams;
} = {}) {
	const m = loTrinhMessages(await getLocale());
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.trang.moTa}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<Suspense fallback={null}>
						<BoChon searchParams={searchParams} />
					</Suspense>
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				<Suspense fallback={<KhungCho />}>
					<NoiDung searchParams={searchParams} />
				</Suspense>
			</PageShellContent>
		</PageShell>
	);
}
