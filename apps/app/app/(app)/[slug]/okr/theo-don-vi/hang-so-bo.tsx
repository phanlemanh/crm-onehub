"use client";

import { StatGroup } from "@crm/ui/components/dashboard";
import { HangSoDangTai } from "@crm/ui/components/khung-xuong";
import { useLocale } from "@crm/ui/components/locale-provider";
import { StatCard } from "@crm/ui/components/stat-card";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { homNayVN } from "@crm/validation/ngay-vn";
import { useQuery } from "@tanstack/react-query";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { useTRPC } from "@/lib/trpc/client";
import type { DonChonOkr } from "../okr-search-params";
import { type ChuOSo, type KhungChuKy, oSoBo } from "./o-so-bo";

function useChuOSo(): ChuOSo {
	const locale = useLocale();
	const m = okrVoKhuMessages(locale).boOkr;
	const tc = okrToanCanhMessages(locale).toanCanh;
	const dinh = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
		day: "2-digit",
		month: "2-digit",
		timeZone: "UTC",
	});
	return {
		ngayConLai: m.so.ngayConLai,
		tienDo: m.cot.tienDo,
		daCapNhat: tc.daCapNhat,
		tuTinThap: tc.tuTinThap,
		den: m.so.den,
		batDau: m.so.batDau,
		daKetThuc: m.so.daKetThuc,
		leRa: tc.leRa,
		chuaCoVach: tc.chuaCoVach,
		vuaCongBo: tc.vuaCongBo,
		ngay: (iso) => dinh.format(new Date(`${iso}T00:00:00Z`)),
	};
}

export function HangSoBo({
	cycleId,
	unit,
	chuKy,
}: {
	cycleId: string;
	unit: DonChonOkr;
	chuKy: KhungChuKy | null;
}) {
	const m = okrVoKhuMessages(useLocale()).boOkr.so;
	const chu = useChuOSo();
	const trpc = useTRPC();
	const so = useQuery(trpc.okr.soBo.queryOptions({ cycleId, unit }));
	if (so.isPending || chuKy === null)
		return (
			<div data-hang-so-bo="dang-tai">
				<HangSoDangTai nhan={m.dangTai} />
			</div>
		);
	if (so.isError)
		return (
			<VungTaiLoi
				dangTai={so.isFetching}
				data-trang-thai="ST-bocoso-loi"
				moTa={m.loi.moTa}
				onThuLai={() => void so.refetch()}
				tieuDe={m.loi.tieuDe}
			/>
		);
	return (
		<StatGroup data-hang-so-bo="co">
			{oSoBo(so.data, chuKy, homNayVN(new Date()), chu).map((o) => (
				<StatCard
					data-o-so={o.ma}
					description={o.moTa ?? undefined}
					key={o.ma}
					label={o.nhan}
					value={o.giaTri}
				/>
			))}
		</StatGroup>
	);
}
