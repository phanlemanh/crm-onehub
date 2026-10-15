"use client";

import { Badge } from "@crm/ui/components/badge";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { DongLyDoKhu, HanhDongKhu, useQuyenKhu } from "./hanh-dong-khu";
import { LuoiDauTrangOkr } from "./luoi-dau-trang";
import { khoaDon, okrParsers } from "./okr-search-params";
import { laTrangSoan } from "./soan/luat-ban-nhap";
import { DUONG, TAB, type TabOkr, tabTuDuong } from "./tab-okr";
import { tieuDeKhu } from "./tieu-de-khu";

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
	const don = thamSo[SEARCH_PARAM.okr.don];
	const xem = thamSo[SEARCH_PARAM.okr.xem];
	const giu = new URLSearchParams();
	if (ky) giu.set(SEARCH_PARAM.okr.ky, ky);
	if (don) giu.set(SEARCH_PARAM.okr.don, khoaDon(don));
	// Cách xem đi theo để quay lại Theo đơn vị đúng chỗ (trang-don-vi-mot-bang AC-13).
	if (xem) giu.set(SEARCH_PARAM.okr.xem, xem);
	const toi = (t: TabOkr) => {
		const goc = url(DUONG[t]);
		return giu.size > 0 ? `${goc}?${giu}` : goc;
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
	cauNoi = false,
}: {
	chonChuKy: ReactNode;
	nhanHoiY?: NhanHoiY;
	cauNoi?: boolean;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const duong = usePathname();
	const tab = tabTuDuong(duong);
	const q = useQuyenKhu(tab);
	if (laTrangSoan(duong ?? "")) return null;
	return (
		<LuoiDauTrangOkr
			ghiChu={<DongLyDoKhu q={q} />}
			hanhDong={
				<HanhDongKhu cauNoi={cauNoi} chonChuKy={chonChuKy} q={q} tab={tab} />
			}
			moTa={m.moTa[tab]}
			thanhTab={<ThanhTabOkr nhanHoiY={nhanHoiY} tab={tab} />}
			tieuDe={tieuDeKhu(locale)}
		/>
	);
}
