import type { Metadata } from "next";
import { docPhamVi } from "@/components/du-an/pham-vi";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { GiaoViec } from "@/components/viec/giao-viec";
import { getLocale } from "@/lib/locale/server";
import { duAnMessages } from "@/lib/messages/du-an";
import { viecMessages } from "@/lib/messages/viec";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { ViecCuaToi } from "./viec-cua-toi";
import { loadViecSearchParams } from "./viec-search-params";

export async function generateMetadata(): Promise<Metadata> {
	return { title: viecMessages(await getLocale()).trang.tieuDe };
}

export default async function ViecPage({
	searchParams,
}: Partial<Pick<PageProps<"/[slug]/viec">, "searchParams">> = {}) {
	const locale = await getLocale();
	const m = viecMessages(locale);
	const d = duAnMessages(locale);
	const thamSo = searchParams ? await loadViecSearchParams(searchParams) : null;
	const phamVi = docPhamVi(thamSo?.[SEARCH_PARAM.viec.phamVi]);
	const moTa =
		phamVi.loai === "cua-toi"
			? m.trang.moTa
			: phamVi.loai === "tat-ca"
				? d.moTa.tatCa
				: d.moTa.duAn;
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{moTa}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<GiaoViec />
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				<ViecCuaToi />
			</PageShellContent>
		</PageShell>
	);
}
