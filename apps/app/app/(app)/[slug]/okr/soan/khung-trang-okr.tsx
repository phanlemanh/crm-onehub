"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageShell } from "@/components/page-shell";
import { laTrangSoan } from "./luat-ban-nhap";

export function KhungTrangOkr({ children }: { children: ReactNode }) {
	if (laTrangSoan(usePathname() ?? ""))
		return (
			<PageShell className="min-h-0" contained>
				{children}
			</PageShell>
		);
	return <PageShell>{children}</PageShell>;
}
