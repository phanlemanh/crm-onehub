"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageShell } from "@/components/page-shell";
import { DUONG_CAP_NHAT_GAN_DAY } from "../tab-okr";
import { laDuongSoDo } from "../toan-man-hinh-luat";
import { laTrangSoan } from "./luat-ban-nhap";

export function KhungTrangOkr({ children }: { children: ReactNode }) {
	const duong = usePathname() ?? "";
	if (laDuongSoDo(duong))
		return (
			<PageShell className="min-h-0" contained width="full">
				{children}
			</PageShell>
		);
	if (duong.endsWith(DUONG_CAP_NHAT_GAN_DAY))
		return <PageShell width="page">{children}</PageShell>;
	if (laTrangSoan(duong))
		return (
			<PageShell className="min-h-0" contained>
				{children}
			</PageShell>
		);
	return <PageShell>{children}</PageShell>;
}
