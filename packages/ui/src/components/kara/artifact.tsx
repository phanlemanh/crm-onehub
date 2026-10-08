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
import { KaraState } from "@crm/ui/components/kara/state";
import { useMessages } from "@crm/ui/components/locale-provider";
import type { ReactNode } from "react";

export type KaraArtifactProps = {
	title: ReactNode;
	meta?: ReactNode;
	actions?: ReactNode;
	footer?: ReactNode;
	busy?: { label?: string; reasonShown?: boolean } | null;
	children: ReactNode;
};

export function KaraArtifact({
	title,
	meta,
	actions,
	footer,
	busy,
	children,
}: KaraArtifactProps) {
	const msg = useMessages();
	const chuBan = busy ? (busy.label ?? msg.karaKhung.dangSoan) : null;
	const trangThai: KaraBusyState = chuBan
		? { label: chuBan, reasonShown: busy?.reasonShown === true }
		: null;
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
							<KaraMark scope={meta} />
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
