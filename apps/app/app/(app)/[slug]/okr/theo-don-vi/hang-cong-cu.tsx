"use client";

import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { useLocale } from "@crm/ui/components/locale-provider";
import type { ReactNode } from "react";
import { okrMessages } from "@/lib/messages/okr";

export const LOP_HANG_CONG_CU =
	"flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between";

const LOP_KHOI = "flex flex-col gap-2 sm:flex-row sm:items-center";

export function HangCongCuDonVi({ chon }: { chon: ReactNode }) {
	return (
		<div className={LOP_KHOI} data-hang-cong-cu-don-vi>
			{chon}
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
