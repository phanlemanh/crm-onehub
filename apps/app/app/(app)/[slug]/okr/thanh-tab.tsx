"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import {
	PageShellActions,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { okrParsers } from "./okr-search-params";

const TAB = ["cua-toi", "cap-nhat-tuan", "theo-don-vi", "toan-canh"] as const;
export type TabOkr = (typeof TAB)[number];

const DUONG = {
	"cua-toi": "/okr",
	"cap-nhat-tuan": "/okr/cap-nhat-tuan",
	"theo-don-vi": "/okr/theo-don-vi",
	"toan-canh": "/okr/toan-canh",
} satisfies Record<TabOkr, string>;

export function tabTuDuong(duong: string): TabOkr {
	const phan = duong.split("/").filter(Boolean);
	const con = phan[phan.indexOf("okr") + 1];
	return TAB.find((t) => t === con) ?? "cua-toi";
}

export function ThanhTabOkr({ tab }: { tab: TabOkr }) {
	const m = okrMessages(useLocale());
	const url = useWorkspaceUrl();
	const [thamSo] = useQueryStates(okrParsers);
	const ky = thamSo[SEARCH_PARAM.okr.ky];
	const toi = (t: TabOkr) => {
		const goc = url(DUONG[t]);
		return ky
			? `${goc}?${new URLSearchParams({ [SEARCH_PARAM.okr.ky]: ky })}`
			: goc;
	};
	return (
		<Tabs value={tab}>
			<TabsList variant="line" aria-label={m.tabNhan}>
				{TAB.map((t) => (
					<TabsTrigger key={t} value={t} asChild>
						<Link href={toi(t)} aria-current={t === tab ? "page" : undefined}>
							{m.tab[t]}
						</Link>
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}

export function DauTrangOkr({ chonChuKy }: { chonChuKy: ReactNode }) {
	const m = okrMessages(useLocale());
	const tab = tabTuDuong(usePathname());
	return (
		<>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.tieuDe[tab]}</PageShellTitle>
					<PageShellDescription>{m.moTa[tab]}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>{chonChuKy}</PageShellActions>
			</PageShellHeader>
			<ThanhTabOkr tab={tab} />
		</>
	);
}
