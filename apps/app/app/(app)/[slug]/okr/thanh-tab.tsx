"use client";

import { Badge } from "@crm/ui/components/badge";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import {
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { okrParsers } from "./okr-search-params";

const TAB = [
	"cua-toi",
	"cap-nhat-tuan",
	"theo-don-vi",
	"toan-canh",
	"hoi-y",
] as const;
export type TabOkr = (typeof TAB)[number];

const DUONG = {
	"cua-toi": "/okr",
	"cap-nhat-tuan": "/okr/cap-nhat-tuan",
	"theo-don-vi": "/okr/theo-don-vi",
	"toan-canh": "/okr/toan-canh",
	"hoi-y": "/okr/hoi-y",
} satisfies Record<TabOkr, string>;

export function tabTuDuong(duong: string): TabOkr {
	const phan = duong.split("/").filter(Boolean);
	const con = phan[phan.indexOf("okr") + 1];
	return TAB.find((t) => t === con) ?? "cua-toi";
}

export type NhanHoiY = "moi" | number | null;

function cuonVaoKhung(tab: HTMLElement | null) {
	tab?.scrollIntoView({ block: "nearest", inline: "nearest" });
}

export function ThanhTabOkr({
	tab,
	nhanHoiY = null,
}: {
	tab: TabOkr;
	nhanHoiY?: NhanHoiY;
}) {
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
	const huyHieu = nhanHoiY === "moi" ? m.nhanHoiYMoi : nhanHoiY;
	return (
		<Tabs value={tab}>
			<div className="min-w-0 overflow-x-auto pb-1" data-khung-tab>
				<TabsList variant="line" aria-label={m.tabNhan}>
					{TAB.map((t) => (
						<TabsTrigger key={t} value={t} asChild>
							<Link
								href={toi(t)}
								aria-current={t === tab ? "page" : undefined}
								ref={t === tab ? cuonVaoKhung : undefined}
							>
								{m.tab[t]}
								{t === "hoi-y" && huyHieu !== null ? (
									<Badge variant="secondary">{huyHieu}</Badge>
								) : null}
							</Link>
						</TabsTrigger>
					))}
				</TabsList>
			</div>
		</Tabs>
	);
}

export function DauTrangOkr({
	chonChuKy,
	nhanHoiY = null,
}: {
	chonChuKy: ReactNode;
	nhanHoiY?: NhanHoiY;
}) {
	const m = okrMessages(useLocale());
	const tab = tabTuDuong(usePathname());
	return (
		<div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3">
			<div className="col-start-1 row-start-1 min-w-0 md:col-span-2">
				<PageShellHeader>
					<PageShellHeading>
						<PageShellTitle>{m.tieuDe[tab]}</PageShellTitle>
						<PageShellDescription>{m.moTa[tab]}</PageShellDescription>
					</PageShellHeading>
				</PageShellHeader>
			</div>
			<div className="col-start-2 row-start-1 flex items-center gap-2 md:row-start-2">
				{chonChuKy}
			</div>
			<div className="col-span-2 row-start-2 min-w-0 md:col-span-1 md:col-start-1">
				<ThanhTabOkr nhanHoiY={nhanHoiY} tab={tab} />
			</div>
		</div>
	);
}
