"use client";

import { KaraDock } from "@crm/ui/components/kara/dock";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crm/ui/components/tabs";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { okrSoanMessages } from "@/lib/messages/okr-soan";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export const TAB_SOAN = ["tro-chuyen", "ban-nhap"] as const;

export type TabSoan = (typeof TAB_SOAN)[number];

const laTab = (v: string): v is TabSoan =>
	(TAB_SOAN as readonly string[]).includes(v);

export function useTabSoan() {
	return useQueryState(
		SEARCH_PARAM.okr.tabSoan,
		parseAsStringLiteral(TAB_SOAN).withDefault("tro-chuyen"),
	);
}

export function KhungSoan({
	hep,
	soDong,
	hoiThoai,
	banNhap,
}: {
	hep: boolean;
	soDong: number;
	hoiThoai: ReactNode;
	banNhap: ReactNode;
}) {
	const m = okrSoanMessages(useLocale());
	const [tab, datTab] = useTabSoan();
	if (hep)
		return (
			<KaraDock side="fill" alone data-khung="hep">
				<Tabs
					value={tab}
					onValueChange={(v) => {
						if (laTab(v)) void datTab(v);
					}}
					className="flex min-h-0 flex-1 flex-col gap-0"
				>
					<TabsList
						variant="line"
						aria-label={m.man.tabs}
						className="w-full shrink-0 justify-start border-b px-4"
					>
						<TabsTrigger value="tro-chuyen">{m.man.tabTroChuyen}</TabsTrigger>
						<TabsTrigger value="ban-nhap">
							{m.man.tabBanNhap(String(soDong))}
						</TabsTrigger>
					</TabsList>
					<TabsContent
						value="tro-chuyen"
						className="flex min-h-0 flex-1 flex-col"
						data-o="hoi-thoai"
						data-cot="hoi-thoai"
					>
						{hoiThoai}
					</TabsContent>
					<TabsContent
						value="ban-nhap"
						className="flex min-h-0 flex-1 flex-col"
						data-o="ban-nhap"
						data-cot="ban-nhap"
					>
						{banNhap}
					</TabsContent>
				</Tabs>
			</KaraDock>
		);
	return (
		<div className="flex min-h-0 flex-1" data-khung="rong">
			{soDong > 0 ? (
				<KaraDock
					side="fill"
					aria-label={m.man.banNhap}
					data-o="ban-nhap"
					data-cot="ban-nhap"
				>
					{banNhap}
				</KaraDock>
			) : null}
			<KaraDock
				side="rail"
				alone={soDong === 0}
				aria-label={m.man.tabTroChuyen}
				data-o="hoi-thoai"
				data-cot="hoi-thoai"
			>
				{hoiThoai}
			</KaraDock>
		</div>
	);
}
