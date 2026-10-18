"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
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

function XuongPhaiHang() {
	return (
		<>
			<Skeleton className="hidden h-7 w-44 sm:block" />
			<div className="hidden gap-2 sm:flex lg:ml-auto">
				<Skeleton className="h-7 w-16" />
				<Skeleton className="h-7 w-24" />
				<Skeleton className="h-7 w-20" />
			</div>
			<Skeleton className="h-7 w-full sm:hidden" />
		</>
	);
}

export function XuongHangCongCu() {
	return (
		<div className={LOP_HANG_CONG_CU} data-khung-hang="thanh-cong-cu">
			<div className={LOP_KHOI} data-hang-cong-cu-don-vi-khung>
				<Skeleton className="h-7 w-full sm:w-72" />
				<Skeleton className="h-7 w-32 md:w-92" />
			</div>
			<XuongPhaiHang />
		</div>
	);
}

const DONG_KHUNG = ["mot", "hai", "ba", "bon", "nam"] as const;

export function KhungDangTaiDonVi({ hang }: { hang?: ReactNode }) {
	const m = okrMessages(useLocale());
	return (
		<div
			aria-busy="true"
			className="flex flex-col gap-3"
			data-trang-thai="ST-donvi-dangtai"
		>
			<span className="sr-only" role="status">
				{m.dangTai}
			</span>
			{hang ? (
				<KhungHangCongCu>
					{hang}
					<XuongPhaiHang />
				</KhungHangCongCu>
			) : (
				<XuongHangCongCu />
			)}
			<div className="flex flex-col gap-1 overflow-hidden rounded-lg border bg-card">
				<Skeleton className="h-11 w-full" data-khung-hang="dau-bang" />
				{DONG_KHUNG.map((k) => (
					<div
						className="flex items-center gap-4 px-4 py-3"
						data-khung-hang="hang"
						key={k}
					>
						<div className="flex min-w-0 flex-1 flex-col gap-2">
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-3 w-1/2" />
						</div>
						<Skeleton className="hidden h-3 w-56 md:block" />
						<Skeleton className="h-4 w-24" />
					</div>
				))}
			</div>
		</div>
	);
}
