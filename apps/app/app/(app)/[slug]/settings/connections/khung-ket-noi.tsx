import type { Locale } from "@crm/ui/lib/locale";
import { type ReactNode, Suspense } from "react";
import { CaiDatBreadcrumb } from "@/components/cai-dat-breadcrumb";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { duongCaiDat } from "@/lib/cai-dat-breadcrumb";

export type TrangConKetNoi =
	| "google"
	| "microsoft"
	| "slack"
	| "slack/people"
	| "zalo"
	| "intake";

const GIU_CHO = "_";

async function DuongDanThat({
	params,
	con,
	locale,
}: {
	params: Promise<{ slug: string }>;
	con: TrangConKetNoi;
	locale: Locale;
}) {
	const { slug } = await params;
	const cap = duongCaiDat(`/${slug}/settings/connections/${con}`, locale);

	return cap ? <CaiDatBreadcrumb cap={cap} /> : null;
}

function DuongDanKetNoi({
	params,
	con,
	locale,
}: {
	params: Promise<{ slug: string }>;
	con: TrangConKetNoi;
	locale: Locale;
}) {
	const cho = duongCaiDat(`/${GIU_CHO}/settings/connections/${con}`, locale);

	return (
		<Suspense fallback={cho ? <CaiDatBreadcrumb cap={cho} dangTai /> : null}>
			<DuongDanThat params={params} con={con} locale={locale} />
		</Suspense>
	);
}

export function KhungKetNoi({
	params,
	con,
	locale,
	tieuDe,
	laTenRieng,
	moTa,
	hanhDong,
	children,
}: {
	params: Promise<{ slug: string }>;
	con: TrangConKetNoi;
	locale: Locale;
	tieuDe: string;
	laTenRieng: boolean;
	moTa?: ReactNode;
	hanhDong?: ReactNode;
	children: ReactNode;
}) {
	return (
		<PageShell width={con === "intake" ? "narrow" : "page"}>
			<PageShellHeader
				breadcrumb={
					<DuongDanKetNoi params={params} con={con} locale={locale} />
				}
			>
				<PageShellHeading>
					<PageShellTitle translate={laTenRieng ? "no" : undefined}>
						{tieuDe}
					</PageShellTitle>
					{moTa ? <PageShellDescription>{moTa}</PageShellDescription> : null}
				</PageShellHeading>
				{hanhDong ? <PageShellActions>{hanhDong}</PageShellActions> : null}
			</PageShellHeader>
			<PageShellContent>{children}</PageShellContent>
		</PageShell>
	);
}
