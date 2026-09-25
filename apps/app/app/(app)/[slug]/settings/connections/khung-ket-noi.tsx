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

const DUONG_CON = {
	google: { path: "google" },
	microsoft: { path: "microsoft" },
	slack: { path: "slack" },
	slackNguoi: { path: "slack/people" },
	zalo: { path: "zalo" },
	intake: { path: "intake" },
} as const;

export type TrangConKetNoi = keyof typeof DUONG_CON;

const GIU_CHO = "_";

async function DuongDanThat({
	params,
	kind,
	locale,
}: {
	params: Promise<{ slug: string }>;
	kind: TrangConKetNoi;
	locale: Locale;
}) {
	const { slug } = await params;
	const cap = duongCaiDat(
		`/${slug}/settings/connections/${DUONG_CON[kind].path}`,
		locale,
	);

	return cap ? <CaiDatBreadcrumb cap={cap} /> : null;
}

function DuongDanKetNoi({
	params,
	kind,
	locale,
}: {
	params: Promise<{ slug: string }>;
	kind: TrangConKetNoi;
	locale: Locale;
}) {
	const cho = duongCaiDat(
		`/${GIU_CHO}/settings/connections/${DUONG_CON[kind].path}`,
		locale,
	);

	return (
		<Suspense fallback={cho ? <CaiDatBreadcrumb cap={cho} dangTai /> : null}>
			<DuongDanThat params={params} kind={kind} locale={locale} />
		</Suspense>
	);
}

export function KhungKetNoi({
	params,
	kind,
	locale,
	tieuDe,
	laTenRieng,
	moTa,
	hanhDong,
	children,
}: {
	params: Promise<{ slug: string }>;
	kind: TrangConKetNoi;
	locale: Locale;
	tieuDe: string;
	laTenRieng: boolean;
	moTa?: ReactNode;
	hanhDong?: ReactNode;
	children: ReactNode;
}) {
	return (
		<PageShell width={kind === "intake" ? "narrow" : "page"}>
			<PageShellHeader
				breadcrumb={
					<DuongDanKetNoi params={params} kind={kind} locale={locale} />
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
