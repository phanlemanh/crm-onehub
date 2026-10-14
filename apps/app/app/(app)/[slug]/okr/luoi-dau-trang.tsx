import type { ReactNode } from "react";

export function LuoiDauTrangOkr({
	dau,
	chonChuKy,
	thanhTab,
}: {
	dau: ReactNode;
	chonChuKy: ReactNode;
	thanhTab: ReactNode;
}) {
	return (
		<div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3">
			<div className="col-start-1 row-start-1 min-w-0 md:col-span-2">{dau}</div>
			<div className="col-start-2 row-start-1 flex items-center gap-2 md:row-start-2">
				{chonChuKy}
			</div>
			<div className="col-span-2 row-start-2 min-w-0 md:col-span-1 md:col-start-1">
				{thanhTab}
			</div>
		</div>
	);
}
