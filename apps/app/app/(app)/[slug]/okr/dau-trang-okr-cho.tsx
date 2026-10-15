import { Skeleton } from "@crm/ui/components/skeleton";
import {
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { NutHoiKara } from "./hoi/nut-hoi-kara";
import { LuoiDauTrangOkr } from "./luoi-dau-trang";

export function DauTrangOkrCho({
	tieuDe,
	moTa,
}: {
	tieuDe: string;
	moTa: string;
}) {
	return (
		<LuoiDauTrangOkr
			dau={
				<PageShellHeader>
					<PageShellHeading>
						<PageShellTitle>{tieuDe}</PageShellTitle>
						<PageShellDescription>{moTa}</PageShellDescription>
					</PageShellHeading>
				</PageShellHeader>
			}
			chonChuKy={
				<>
					<NutHoiKara />
					<Skeleton className="h-8 w-28 rounded-md" />
				</>
			}
			thanhTab={<Skeleton className="h-9 w-full max-w-xl" />}
		/>
	);
}
