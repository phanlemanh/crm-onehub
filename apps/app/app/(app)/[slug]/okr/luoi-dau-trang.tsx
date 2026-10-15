import type { ReactNode } from "react";
import {
	PageShellActions,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";

/**
 * Đầu trang của cả khu Mục tiêu, cùng khuôn với Thoả thuận: tên khu ở trái, hàng
 * hành động ở phải, dòng lý do (khi có) dưới tiêu đề, thanh thẻ ngay dưới.
 */
export function LuoiDauTrangOkr({
	tieuDe,
	moTa,
	ghiChu,
	hanhDong,
	thanhTab,
}: {
	tieuDe: string;
	moTa: string;
	ghiChu?: ReactNode;
	hanhDong: ReactNode;
	thanhTab: ReactNode;
}) {
	return (
		<>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{tieuDe}</PageShellTitle>
					<PageShellDescription>{moTa}</PageShellDescription>
					{ghiChu}
				</PageShellHeading>
				<PageShellActions data-hang-hanh-dong="">{hanhDong}</PageShellActions>
			</PageShellHeader>
			{thanhTab}
		</>
	);
}
