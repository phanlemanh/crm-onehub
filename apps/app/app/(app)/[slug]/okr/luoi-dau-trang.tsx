import type { ReactNode } from "react";
import {
	PageShellActions,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";

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
