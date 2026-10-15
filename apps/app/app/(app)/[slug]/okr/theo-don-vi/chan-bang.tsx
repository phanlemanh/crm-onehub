"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { okrMessages } from "@/lib/messages/okr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import type { DonChonOkr } from "../okr-search-params";

type TruongDon = { truong: string | null; coTruong: boolean };

/**
 * Chân bảng (`meta` của DataTable): trưởng đơn vị hoặc cờ «Chưa có trưởng»,
 * «N mục tiêu · M KR» đếm trên các dòng máy chủ trả, «Thuộc A › B». Đơn vị
 * người: phòng ban chính và quản lý như thẻ đơn vị hôm trước.
 */
export function ChanBang({
	don,
	dv,
	nguoi,
	dem,
	duong,
}: {
	don: DonChonOkr;
	dv: TruongDon;
	nguoi: { phongBan: string | null; quanLy: string | null } | null;
	dem: { mucTieu: number; kr: number } | null;
	duong: string | null;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const mt = okrToanCanhMessages(locale);
	const coTruongDon = don.loai === "bp" || don.loai === "pb";
	return (
		<span
			className="flex flex-wrap items-center gap-x-4 gap-y-1"
			data-dong-don-vi
		>
			{coTruongDon && dv.truong ? (
				<span className="flex items-center gap-1.5">
					{m.truong}
					<PersonAvatar name={dv.truong} size="sm" />
					<span translate="no">{dv.truong}</span>
				</span>
			) : null}
			{coTruongDon && !dv.coTruong ? (
				<StatusIndicator label={m.chuaCoTruong} size="sm" tone="warning" />
			) : null}
			{nguoi ? (
				<>
					<span>
						{nguoi.phongBan ? (
							<>
								{mt.nguoi.phongBanChinh}{" "}
								<span translate="no">{nguoi.phongBan}</span>
							</>
						) : (
							mt.nguoi.chuaCoPhongBan
						)}
					</span>
					<span>
						{nguoi.quanLy ? (
							<>
								{mt.nguoi.quanLy} <span translate="no">{nguoi.quanLy}</span>
							</>
						) : (
							mt.nguoi.khongQuanLy
						)}
					</span>
				</>
			) : null}
			{dem ? (
				<span className="tabular-nums">{m.demDonVi(dem.mucTieu, dem.kr)}</span>
			) : null}
			{duong ? <span translate="no">{m.donViBang.thuoc(duong)}</span> : null}
		</span>
	);
}
