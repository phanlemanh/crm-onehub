"use client";

import {
	Artifact,
	ArtifactActions,
	ArtifactContent,
	ArtifactHeader,
	ArtifactTitle,
} from "@crm/ui/components/ai-elements/artifact";
import { KaraMark } from "@crm/ui/components/kara";
import {
	KaraBusyProvider,
	type KaraBusyState,
} from "@crm/ui/components/kara/busy";
import {
	KaraDockBody,
	KaraDockFooter,
	KaraDockHeader,
} from "@crm/ui/components/kara/dock";
import { KaraState } from "@crm/ui/components/kara/state";
import { useMessages } from "@crm/ui/components/locale-provider";
import type { ReactNode } from "react";

export type KaraArtifactProps = {
	title: ReactNode;
	meta?: ReactNode;
	actions?: ReactNode;
	footer?: ReactNode;
	busy?: { label?: string; reasonShown?: boolean } | null;
	variant?: "card" | "docked";
	metaStyle?: "kara" | "muted";
	children: ReactNode;
};

function MetaArtifact({
	meta,
	metaStyle,
}: {
	meta: ReactNode;
	metaStyle: "kara" | "muted";
}) {
	if (metaStyle === "kara") return <KaraMark scope={meta} />;
	if (!meta) return null;
	return (
		<span
			data-slot="kara-artifact-meta"
			className="truncate text-muted-foreground text-xs"
		>
			{meta}
		</span>
	);
}

export function KaraArtifact({
	title,
	meta,
	actions,
	footer,
	busy,
	variant = "card",
	metaStyle = "kara",
	children,
}: KaraArtifactProps) {
	const msg = useMessages();
	const chuBan = busy ? (busy.label ?? msg.karaKhung.dangSoan) : null;
	const trangThai: KaraBusyState = chuBan
		? { label: chuBan, reasonShown: busy?.reasonShown === true }
		: null;
	if (variant === "docked")
		return (
			<KaraBusyProvider busy={trangThai}>
				<div
					data-slot="kara-artifact"
					data-variant="docked"
					data-ban={chuBan ? "" : undefined}
					className="flex h-full min-h-0 min-w-0 flex-col"
				>
					<KaraDockHeader>
						<div
							data-slot="kara-artifact-header"
							className="flex min-w-0 flex-1 items-center justify-between gap-3"
						>
							<div className="flex min-w-0 items-baseline gap-2 truncate">
								<ArtifactTitle>{title}</ArtifactTitle>
								<MetaArtifact meta={meta} metaStyle={metaStyle} />
								{chuBan ? <KaraState kind="working" label={chuBan} /> : null}
							</div>
							{actions ? <ArtifactActions>{actions}</ArtifactActions> : null}
						</div>
					</KaraDockHeader>
					<KaraDockBody>
						<div data-slot="kara-artifact-content" className="text-sm">
							{children}
						</div>
					</KaraDockBody>
					{footer ? (
						<KaraDockFooter divided>
							<div data-slot="kara-artifact-footer">{footer}</div>
						</KaraDockFooter>
					) : null}
				</div>
			</KaraBusyProvider>
		);
	return (
		<KaraBusyProvider busy={trangThai}>
			<Artifact
				data-slot="kara-artifact"
				data-ban={chuBan ? "" : undefined}
				className="h-full min-h-0 min-w-0"
			>
				<ArtifactHeader data-slot="kara-artifact-header">
					<div className="flex min-w-0 flex-col gap-1">
						<ArtifactTitle>{title}</ArtifactTitle>
						<div className="flex flex-wrap items-center gap-2">
							<MetaArtifact meta={meta} metaStyle={metaStyle} />
							{chuBan ? <KaraState kind="working" label={chuBan} /> : null}
						</div>
					</div>
					{actions ? <ArtifactActions>{actions}</ArtifactActions> : null}
				</ArtifactHeader>
				<ArtifactContent data-slot="kara-artifact-content">
					<div className="text-sm">{children}</div>
				</ArtifactContent>
				{footer ? (
					<div data-slot="kara-artifact-footer" className="border-t px-4 py-3">
						{footer}
					</div>
				) : null}
			</Artifact>
		</KaraBusyProvider>
	);
}
