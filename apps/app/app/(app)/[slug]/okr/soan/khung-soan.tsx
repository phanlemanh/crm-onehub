"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@crm/ui/components/resizable";
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
import { SOAN_UI } from "./cau-hinh";

export const TAB_SOAN = ["tro-chuyen", "ban-nhap"] as const;

export const CO_O_HOI_THOAI = {
	defaultSize: SOAN_UI.ocHoiThoai.macDinhPx,
	minSize: SOAN_UI.ocHoiThoai.toiThieuPx,
	maxSize: SOAN_UI.ocHoiThoai.toiDaPhanTram,
} as const;
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
			<Tabs
				value={tab}
				onValueChange={(v) => {
					if (laTab(v)) void datTab(v);
				}}
				className="flex min-h-0 flex-1 flex-col"
				data-khung="hep"
			>
				<TabsList aria-label={m.man.tabs} className="w-full">
					<TabsTrigger value="tro-chuyen">{m.man.tabTroChuyen}</TabsTrigger>
					<TabsTrigger value="ban-nhap">
						{m.man.tabBanNhap(String(soDong))}
					</TabsTrigger>
				</TabsList>
				<TabsContent
					value="tro-chuyen"
					className="flex min-h-0 flex-1 flex-col"
					data-o="hoi-thoai"
				>
					{hoiThoai}
				</TabsContent>
				<TabsContent
					value="ban-nhap"
					className="flex min-h-0 flex-1 flex-col"
					data-o="ban-nhap"
				>
					{banNhap}
				</TabsContent>
			</Tabs>
		);
	return (
		<ResizablePanelGroup
			orientation="horizontal"
			className="min-h-0 flex-1"
			data-khung="rong"
		>
			<ResizablePanel
				id="hoi-thoai"
				{...CO_O_HOI_THOAI}
				groupResizeBehavior="preserve-pixel-size"
				data-o="hoi-thoai"
			>
				<div className="flex h-full min-h-0 flex-col gap-3 pe-4">
					{hoiThoai}
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle aria-label={m.trang.thanhKeo} />
			<ResizablePanel id="ban-nhap" data-o="ban-nhap">
				<div className="flex h-full min-h-0 flex-col ps-4">{banNhap}</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
