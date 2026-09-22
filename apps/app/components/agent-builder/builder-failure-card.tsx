"use client";

import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { AsyncButtonContent } from "@crm/ui/components/async-action";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import type { AgentTurnFailure } from "@/lib/agent-transcript";
import { troChuyenMessages } from "@/lib/messages/agent-builder-tro-chuyen";

export function BuilderFailureCard({
	failure,
	creatingAgent,
	retrying,
	onRetry,
}: {
	failure: AgentTurnFailure;
	creatingAgent: boolean;
	retrying: boolean;
	onRetry: (() => void) | null;
}) {
	const t = troChuyenMessages(useLocale());
	const message =
		failure.kind === "rate-limit"
			? t.loi.choPhut
			: failure.kind === "restricted"
				? t.loi.canTra
				: failure.kind === "credits"
					? t.loi.hetTien
					: t.loi.chung;

	return (
		<div
			role="alert"
			className="flex flex-col items-stretch gap-3 rounded-lg border border-destructive/30 bg-card px-4 py-3 sm:flex-row sm:items-start"
		>
			<div className="flex min-w-0 flex-1 items-start gap-3">
				<Icon icon={WarningAlt} className="mt-0.5 size-4 text-destructive" />
				<div className="min-w-0 flex-1">
					<p className="font-medium text-sm">
						{creatingAgent ? t.dung.daDungTao : t.dung.daDungTraLoi}
					</p>
					<p className="mt-0.5 text-pretty text-muted-foreground text-xs leading-5">
						{message}
					</p>
					<p className="mt-1 break-all text-muted-foreground text-xs leading-5">
						{t.loi.maLoi}:{" "}
						<span translate="no" className="select-all font-mono">
							{failure.code}
						</span>
					</p>
				</div>
			</div>
			{onRetry ? (
				<Button
					variant="outline"
					size="sm"
					disabled={retrying}
					aria-busy={retrying}
					onClick={onRetry}
				>
					<AsyncButtonContent
						status={retrying ? "pending" : "idle"}
						pendingLabel={t.dung.dangThuLai}
					>
						{t.dung.thuLai}
					</AsyncButtonContent>
				</Button>
			) : null}
		</div>
	);
}
