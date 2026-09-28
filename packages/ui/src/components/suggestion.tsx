"use client";

import Checkmark from "@carbon/icons-react/es/Checkmark";
import Close from "@carbon/icons-react/es/Close";
import { Button } from "@crm/ui/components/button";
import { FieldError } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import {
	useEffect,
	useId,
	useRef,
	useState,
	type KeyboardEvent,
	type ReactNode,
} from "react";
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
	onAcceptEdited,
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
	onAcceptEdited?: (value: string) => void;
	editing?: boolean;
	decided?: SuggestionDecision;
	error?: ReactNode;
	acceptDisabledReason?: ReactNode;
}) {
	const msg = useMessages();
	const [moSuaTaiCho, datMoSuaTaiCho] = useState(false);
	const idLyDoKhoa = useId();
	const oSuaRef = useRef<HTMLTextAreaElement>(null);
	const chuMoi = typeof value === "string" ? value : "";
	const dangSua = editing ?? moSuaTaiCho;
	const dangSuaTruoc = useRef(dangSua);
	const [chuDangSua, datChuDangSua] = useState(chuMoi);

	useEffect(() => {
		if (dangSua && !dangSuaTruoc.current) {
			datChuDangSua(chuMoi);
			oSuaRef.current?.focus();
		}
		dangSuaTruoc.current = dangSua;
	}, [dangSua, chuMoi]);

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

	const dangQuyet = pending || decided !== undefined;

	function huySua() {
		datChuDangSua(chuMoi);
		datMoSuaTaiCho(false);
	}

	function huyPhimTrongOSua(su: KeyboardEvent<HTMLTextAreaElement>) {
		if (su.key !== "Escape") return;
		su.stopPropagation();
		huySua();
	}

	return (
		<div
			data-decided={decided}
			data-slot="suggestion"
			className="flex min-w-0 flex-col gap-1.5 py-1 text-muted-foreground text-xs"
		>
			{label ? <p className="font-medium text-foreground">{label}</p> : null}
			<div className="flex min-w-0 items-start gap-2">
				<div className="min-w-0 flex-1 space-y-1">
					{before !== undefined ? (
						<p translate="no">
							<del className="text-muted-foreground line-through decoration-diff-bo">
								{before}
							</del>
						</p>
					) : null}
					{dangSua ? (
						<Textarea
							aria-label={msg.suggestion.edit}
							data-slot="suggestion-edit"
							onChange={(su) => {
								datChuDangSua(su.target.value);
								onEdit?.(su.target.value);
							}}
							onKeyDown={huyPhimTrongOSua}
							ref={oSuaRef}
							size="sm"
							translate="no"
							value={chuDangSua}
						/>
					) : (
						<p translate="no">
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
						) : dangSua ? (
							<>
								<Button
									onClick={() => onAcceptEdited?.(chuDangSua)}
									size="xs"
									variant="ghost"
								>
									{msg.suggestion.acceptEdited}
								</Button>
								<Button onClick={huySua} size="xs" variant="ghost">
									{msg.suggestion.cancelEdit}
								</Button>
							</>
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
									{msg.suggestion.acceptShort}
								</Button>
								{onEdit ? (
									<Button
										onClick={() => datMoSuaTaiCho(true)}
										size="xs"
										variant="ghost"
									>
										{msg.suggestion.edit}
									</Button>
								) : null}
								<Button onClick={onDismiss} size="xs" variant="ghost">
									{msg.suggestion.dismissShort}
								</Button>
							</>
						)}
					</div>
					{!dangQuyet && !dangSua && acceptDisabledReason ? (
						<p id={idLyDoKhoa}>{acceptDisabledReason}</p>
					) : null}
				</div>
			</div>
			{error ? <FieldError>{error}</FieldError> : null}
		</div>
	);
}
