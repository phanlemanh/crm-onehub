"use client";

import type { ReactNode } from "react";
import { DauTrangOkr } from "./thanh-tab";

export function DauTrangOkrHoiY({
	cauNoi = false,
}: {
	chonChuKy?: ReactNode;
	cauNoi?: boolean;
}) {
	return <DauTrangOkr cauNoi={cauNoi} />;
}
