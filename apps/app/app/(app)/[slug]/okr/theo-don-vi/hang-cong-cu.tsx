"use client";

import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { useLocale } from "@crm/ui/components/locale-provider";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import type { ReactNode } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { CACH_XEM, type CachXem } from "../okr-search-params";

export const LOP_HANG_CONG_CU =
	"flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between";

const LOP_KHOI = "flex flex-col gap-2 sm:flex-row sm:items-center";

export function HangCongCuDonVi({
	chon,
	xem,
	coCham,
	doiXem,
}: {
	chon: ReactNode;
	xem: CachXem;
	coCham: boolean;
	doiXem: (x: CachXem) => void;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const mt = okrToanCanhMessages(locale);
	const mk = okrKhepMessages(locale);
	return (
		<div className={LOP_KHOI} data-hang-cong-cu-don-vi>
			{chon}
			<ViewSwitch
				items={[
					{ value: "danh-sach", label: m.danhSach },
					{ value: "cay", label: m.cayCanChinh },
					{ value: "hop-tuan", label: mt.hopTuan.cachXem },
					...(coCham ? [{ value: "cham", label: mk.cham.cachXem }] : []),
				]}
				label={m.cachXem}
				onValueChange={(v) => {
					const moi = CACH_XEM.find((c) => c === v);
					if (moi) doiXem(moi);
				}}
				value={xem}
			/>
		</div>
	);
}

export function KhungHangCongCu({ children }: { children: ReactNode }) {
	return <div className={LOP_HANG_CONG_CU}>{children}</div>;
}

export function KhungDangTaiDonVi({ hang }: { hang?: ReactNode }) {
	const m = okrMessages(useLocale());
	return (
		<div aria-busy="true" data-trang-thai="ST-donvi-dangtai">
			<KhungXuong hinh="bang-hai-dong" nhan={m.dangTai} thanhCongCu={hang} />
		</div>
	);
}
