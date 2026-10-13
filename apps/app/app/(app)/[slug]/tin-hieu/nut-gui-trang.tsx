"use client";

import { NutGuiTao } from "@/components/tin-hieu/hop-gui-tin-hieu";
import { NutGuiTinHieu } from "@/components/tin-hieu/nut-gui-tin-hieu";

export function NutGuiTrang() {
	return <NutGuiTinHieu nut={<NutGuiTao variant="default" />} />;
}
