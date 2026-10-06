import { LogoLockup } from "@crm/ui/components/logo-lockup";
import Link from "next/link";
import type { ReactNode } from "react";

export function DauCuaVao({
	title,
	description,
	trangChu,
	cap = "h2",
}: {
	title: string;
	description: ReactNode;
	trangChu: string;
	cap?: "h1" | "h2";
}) {
	const TieuDe = cap;

	return (
		<div className="flex flex-col gap-3 text-left">
			<Link href="/" aria-label={trangChu} className="flex">
				<LogoLockup className="h-6 w-auto shrink-0" />
			</Link>
			<div className="flex flex-col gap-1">
				<TieuDe className="text-2xl/8 font-semibold tracking-tight text-balance">
					{title}
				</TieuDe>
				<p className="max-w-[32ch] text-sm/5 text-muted-foreground text-pretty">
					{description}
				</p>
			</div>
		</div>
	);
}
