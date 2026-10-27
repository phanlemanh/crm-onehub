"use client";

import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { GOC } from "../don-dich";
import { HangSoBoDangTai } from "./hang-so-bo";
import { loadOkrSearchParams } from "../okr-search-params";
import { TheConBo } from "./the-con";
import { ViTriBo } from "./vi-tri-bo";

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

function KhungTheoUrl({ children }: { children: ReactNode }) {
	const url = loadOkrSearchParams(new URLSearchParams(useSearchParams()));
	const ky = url[SEARCH_PARAM.okr.ky];
	const don = url[SEARCH_PARAM.okr.don];
	const xem = url[SEARCH_PARAM.okr.xem];
	if (don === null && xem === null)
		return (
			<div className="flex min-w-0 flex-col gap-4" data-khung-bo="">
				<ViTriBo ky={ky} />
				{children}
			</div>
		);
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 pb-1">
				<ViTriBo ky={ky} tenBo={null} />
				<TheConBo
					coCham={xem === "cham"}
					don={don ?? GOC}
					ky={ky}
					xem={xem ?? "danh-sach"}
				/>
			</div>
			{(xem ?? "danh-sach") === "danh-sach" ? <HangSoBoDangTai /> : null}
			{children}
		</div>
	);
}

export function KhungDangTaiDonVi({
	hang,
	theoUrl = false,
}: {
	hang?: ReactNode;
	theoUrl?: boolean;
}) {
	const m = okrMessages(useLocale());
	const xuong = (
		<div aria-busy="true" data-trang-thai="ST-donvi-dangtai">
			<KhungXuong hinh="bang-hai-dong" nhan={m.dangTai} thanhCongCu={hang} />
		</div>
	);
	return theoUrl ? <KhungTheoUrl>{xuong}</KhungTheoUrl> : xuong;
}
