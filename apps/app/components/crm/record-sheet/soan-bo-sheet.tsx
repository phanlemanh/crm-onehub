"use client";

import { KhungSoanBo } from "@/app/(app)/[slug]/okr/soan-bo/khung-soan-bo";

export function SoanBoSheet({
	khoaBo,
	cauNoi,
}: {
	khoaBo: string;
	cauNoi: boolean;
}) {
	return <KhungSoanBo khoaBo={khoaBo} cauNoi={cauNoi} />;
}
