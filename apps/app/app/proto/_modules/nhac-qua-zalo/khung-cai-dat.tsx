import { Button } from "@crm/ui/components/button";
import { cn } from "@crm/ui/lib/utils";
import type { ReactNode } from "react";
import { MUC_CAI_DAT } from "./du-lieu";

export function KhungCaiDat({
	dangMo,
	children,
}: {
	dangMo: (typeof MUC_CAI_DAT)[number];
	children: ReactNode;
}) {
	return (
		<div className="flex min-h-[640px] min-w-0 flex-col rounded-lg border md:flex-row">
			<aside className="hidden w-56 shrink-0 border-r md:block">
				<nav aria-label="Cài đặt" className="flex flex-col gap-0.5 p-3">
					{MUC_CAI_DAT.map((muc) => (
						<Button
							key={muc}
							variant="ghost"
							aria-current={muc === dangMo ? "page" : undefined}
							className={cn(
								"justify-start font-normal text-muted-foreground",
								muc === dangMo &&
									"bg-muted text-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							{muc}
						</Button>
					))}
				</nav>
			</aside>
			<nav
				aria-label="Cài đặt"
				className="flex gap-1 overflow-x-auto border-b p-2 md:hidden"
			>
				{MUC_CAI_DAT.map((muc) => (
					<Button
						key={muc}
						variant="ghost"
						size="sm"
						aria-current={muc === dangMo ? "page" : undefined}
						className={cn(
							"shrink-0 font-normal text-muted-foreground",
							muc === dangMo && "bg-muted text-foreground",
						)}
					>
						{muc}
					</Button>
				))}
			</nav>
			{children}
		</div>
	);
}
