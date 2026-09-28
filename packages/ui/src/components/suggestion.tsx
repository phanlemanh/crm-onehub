"use client";

import Checkmark from "@carbon/icons-react/es/Checkmark";
import Close from "@carbon/icons-react/es/Close";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { Spinner } from "@crm/ui/components/spinner";
import { useId, useState, type ReactNode } from "react";
import { useMessages } from "@crm/ui/components/locale-provider";

export type SuggestionDecision = "accepted" | "dismissed";

export function Suggestion({
	value,
	rationale,
	pending = false,
	onAccept,
	onDismiss,
	before,
	label,
	onEdit,
	editing,
	decided,
	error,
	acceptDisabledReason,
}: {
	value: ReactNode;
	rationale?: ReactNode;
	pending?: boolean;
	onAccept: () => void;
	onDismiss: () => void;
	before?: ReactNode;
	label?: ReactNode;
	onEdit?: (value: string) => void;
	editing?: boolean;
	decided?: SuggestionDecision;
	error?: ReactNode;
	acceptDisabledReason?: ReactNode;
}) {
	const msg = useMessages();
	const [moSuaTaiCho, datMoSuaTaiCho] = useState(false);
	const idLyDoKhoa = useId();

	const dangDangMoi =
		before !== undefined ||
		label !== undefined ||
		onEdit !== undefined ||
		editing !== undefined ||
		decided !== undefined ||
		error !== undefined ||
		acceptDisabledReason !== undefined;

	if (!dangDangMoi) {
		return (
			<div
				data-slot="suggestion"
				className="flex min-w-0 items-start gap-2 py-1 text-muted-foreground text-xs"
			>
				<div className="min-w-0 flex-1 space-y-0.5">
					<p className="truncate">
						<span className="text-foreground">{value}</span>
					</p>
					{rationale ? <p className="text-pretty">{rationale}</p> : null}
				</div>

				<div className="flex shrink-0 items-center gap-1">
					{pending ? (
						<Spinner className="size-3" />
					) : (
						<>
							<Button
								variant="ghost"
								size="icon-xs"
								onClick={onAccept}
								aria-label={msg.suggestion.accept}
							>
								<Icon icon={Checkmark} />
							</Button>
							<Button
								variant="ghost"
								size="icon-xs"
								onClick={onDismiss}
								aria-label={msg.suggestion.dismiss}
							>
								<Icon icon={Close} />
							</Button>
						</>
					)}
				</div>
			</div>
		);
	}

	const dangSua = editing ?? moSuaTaiCho;
	const chuMoi = typeof value === "string" ? value : "";
	const dangQuyet = pending || decided !== undefined;

	return (
		<div
			data-decided={decided}
			data-slot="suggestion"
			className="flex min-w-0 flex-col gap-1.5 py-1 text-muted-foreground text-xs"
		>
			{label ? <p className="font-medium text-foreground">{label}</p> : null}
			<div className="flex min-w-0 items-start gap-2">
				<div className="min-w-0 flex-1 space-y-1">
					{dangSua ? (
						<Input
							aria-label={msg.suggestion.edit}
							defaultValue={chuMoi}
							onChange={(su) => onEdit?.(su.target.value)}
						/>
					) : (
						<p className="text-pretty">
							{before !== undefined ? (
								<>
									<del className="text-muted-foreground line-through decoration-diff-bo">
										{before}
									</del>{" "}
									→{" "}
								</>
							) : null}
							<ins className="bg-diff-them/15 text-foreground underline decoration-diff-them underline-offset-4">
								{value}
							</ins>
						</p>
					)}
					{rationale ? <p className="text-pretty">{rationale}</p> : null}
				</div>

				<div className="flex shrink-0 flex-col items-end gap-1">
					<div className="flex items-center gap-1">
						{pending ? (
							<Spinner className="size-3" />
						) : decided ? (
							<span data-slot="suggestion-decided">
								{decided === "accepted"
									? msg.suggestion.accepted
									: msg.suggestion.dismissed}
							</span>
						) : (
							<>
								<Button
									aria-describedby={
										acceptDisabledReason ? idLyDoKhoa : undefined
									}
									disabled={!!acceptDisabledReason}
									onClick={onAccept}
									size="xs"
									variant="ghost"
								>
									{msg.suggestion.accept}
								</Button>
								{onEdit ? (
									<Button
										onClick={() => datMoSuaTaiCho((truoc) => !truoc)}
										size="xs"
										variant="ghost"
									>
										{msg.suggestion.edit}
									</Button>
								) : null}
								<Button onClick={onDismiss} size="xs" variant="ghost">
									{msg.suggestion.dismiss}
								</Button>
							</>
						)}
					</div>
					{!dangQuyet && acceptDisabledReason ? (
						<p id={idLyDoKhoa}>{acceptDisabledReason}</p>
					) : null}
				</div>
			</div>
			{error ? (
				<p className="text-xs font-normal text-destructive" role="alert">
					{error}
				</p>
			) : null}
		</div>
	);
}
