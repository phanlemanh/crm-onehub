"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useKyHoiY } from "./chon-chu-ky";
import { nhanTuHoiYNhan } from "./hoi-y/man-hoi-y";
import { DauTrangOkr } from "./thanh-tab";

export function DauTrangOkrHoiY({
	chonChuKy,
	cauNoi = false,
}: {
	chonChuKy: ReactNode;
	cauNoi?: boolean;
}) {
	const trpc = useTRPC();
	const { cycleId } = useKyHoiY();
	const nhan = useQuery(
		trpc.okr.hoiYNhan.queryOptions(cycleId === null ? skipToken : { cycleId }),
	);
	return (
		<DauTrangOkr
			cauNoi={cauNoi}
			chonChuKy={chonChuKy}
			nhanHoiY={nhanTuHoiYNhan(nhan.data)}
		/>
	);
}
