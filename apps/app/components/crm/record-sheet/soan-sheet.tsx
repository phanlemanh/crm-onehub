"use client";

import { CuocSoanTrongKhung } from "@/app/(app)/[slug]/okr/soan/trang-soan";

export function SoanSheet({
	cuocSoanId,
	cauNoi,
}: {
	cuocSoanId: string;
	cauNoi: boolean;
}) {
	return <CuocSoanTrongKhung cuocSoanId={cuocSoanId} cauNoi={cauNoi} />;
}
