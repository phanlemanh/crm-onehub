"use client";

import {
	ArtifactActions,
	ArtifactTitle,
} from "@crm/ui/components/ai-elements/artifact";
import {
	KaraDockBody,
	KaraDockFooter,
	KaraDockHeader,
} from "@crm/ui/components/kara/dock";
import type { ReactNode } from "react";

export type VatPhamDockProps = {
	title: ReactNode;
	meta?: ReactNode;
	actions?: ReactNode;
	footer?: ReactNode;
	children: ReactNode;
};

export function VatPhamDock({
	title,
	meta,
	actions,
	footer,
	children,
}: VatPhamDockProps) {
	return (
		<div
			data-slot="vat-pham"
			data-variant="docked"
			className="flex h-full min-h-0 min-w-0 flex-col"
		>
			<KaraDockHeader>
				<div
					data-slot="vat-pham-header"
					className="flex min-w-0 flex-1 items-center justify-between gap-3"
				>
					<div className="flex min-w-0 items-baseline gap-2 truncate">
						<ArtifactTitle>{title}</ArtifactTitle>
						{meta ? (
							<span
								data-slot="vat-pham-meta"
								className="truncate text-muted-foreground text-xs"
							>
								{meta}
							</span>
						) : null}
					</div>
					{actions ? <ArtifactActions>{actions}</ArtifactActions> : null}
				</div>
			</KaraDockHeader>
			<KaraDockBody>
				<div data-slot="vat-pham-content" className="text-sm">
					{children}
				</div>
			</KaraDockBody>
			{footer ? (
				<KaraDockFooter divided>
					<div data-slot="vat-pham-footer">{footer}</div>
				</KaraDockFooter>
			) : null}
		</div>
	);
}
