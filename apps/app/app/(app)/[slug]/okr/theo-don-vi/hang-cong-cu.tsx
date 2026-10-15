"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import type { ReactNode } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { CACH_XEM, type CachXem } from "../okr-search-params";

/* Đúng lớp khung hàng công cụ của DataTable (packages/ui data-table.tsx). Ba
   cách xem không phải bảng bọc ô chọn + cách xem trong khung này, nên hàng công
   cụ đứng yên khi đổi cách xem. Bài dvb-hang-cong-cu so lớp này với DOM thật. */
export const LOP_HANG_CONG_CU =
	"flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between";

const LOP_KHOI = "flex flex-col gap-2 sm:flex-row sm:items-center";

/**
 * Ô chọn đơn vị + cách xem. Ở Danh sách nó đứng TRONG ô `search` của DataTable
 * (không ở `leadingActions`, thứ DataTable giấu sau «Lọc» trên điện thoại).
 */
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

/* Phần phải của hàng công cụ lúc tải: chỗ của ô lọc nhanh, «Lọc», «Sắp xếp»,
   «Cột» — và nút «Lọc» gộp trên điện thoại — cùng cỡ với DataTable. */
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

/* Khung xương của hàng công cụ: cùng khung, cùng cỡ ô chọn và chỗ của cách
   xem, nên đỉnh ô chọn không nhảy khi dữ liệu về. */
export function KhungXuongHangCongCu() {
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

/**
 * Lúc tải: hàng công cụ (thật khi đã có cây tổ chức, khung xương khi chưa) và
 * các dòng bảng bằng khung xương — không vòng quay toàn trang, không cây.
 */
export function KhungDangTaiDonVi({ hang }: { hang?: ReactNode }) {
	const b = okrMessages(useLocale()).donViBang;
	return (
		<div
			aria-busy="true"
			className="flex flex-col gap-3"
			data-trang-thai="ST-donvi-dangtai"
		>
			<span className="sr-only" role="status">
				{b.dangTai}
			</span>
			{hang ? (
				<KhungHangCongCu>
					{hang}
					<XuongPhaiHang />
				</KhungHangCongCu>
			) : (
				<KhungXuongHangCongCu />
			)}
			<div className="flex flex-col gap-1 overflow-hidden rounded-lg border bg-card">
				<Skeleton
					className="h-11 w-full rounded-none"
					data-khung-hang="dau-bang"
				/>
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
