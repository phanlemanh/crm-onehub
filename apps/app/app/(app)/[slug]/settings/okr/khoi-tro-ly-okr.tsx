"use client";

import { TheGopYSoDo } from "./the-gop-y-so-do";
import { TheSoChiPhi } from "./the-so-chi-phi";
import { TheSoanSoDo } from "./the-soan-so-do";
import { TheTroLyOkr } from "./the-tro-ly-okr";
import { useQuyenChuongTrinh } from "./trang-thai-cai-dat";

export function KhoiTroLyOkr() {
	const { canManage } = useQuyenChuongTrinh();
	if (!canManage) return null;
	return (
		<>
			<TheTroLyOkr />
			<TheGopYSoDo />
			<TheSoanSoDo />
			<TheSoChiPhi />
		</>
	);
}
