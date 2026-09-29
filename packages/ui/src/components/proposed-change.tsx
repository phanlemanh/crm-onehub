"use client";

import {
	Confirmation,
	ConfirmationAccepted,
	ConfirmationActions,
	ConfirmationRejected,
	ConfirmationRequest,
} from "@crm/ui/components/ai-elements/confirmation";
import { Button } from "@crm/ui/components/button";
import { FieldError } from "@crm/ui/components/field";
import { useMessages } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import {
	type ComponentProps,
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useId,
	useRef,
} from "react";

export type ProposedChangeDecision = "accepted" | "dismissed" | "skipped";

export type ProposedChangeTone = "primary" | "secondary" | "quiet";

export type ProposedChangeAction = {
	id: string;
	label: ReactNode;
	tone: ProposedChangeTone;
	onClick: () => void;
	disabled?: boolean;
};

export type ProposedChangeEditing = {
	value: string;
	onChange: (value: string) => void;
	onCancel: () => void;
};

export type ProposedChangeKind = "rewrite" | "compact" | "question";

export type ProposedChangeProps = Omit<
	ComponentProps<"div">,
	"children" | "role"
> & {
	id?: string;
	kind: ProposedChangeKind;
	label?: ReactNode;
	before?: ReactNode;
	value: ReactNode;
	rationale?: ReactNode;
	pending?: boolean;
	decided?: { decision: ProposedChangeDecision; text: ReactNode };
	error?: ReactNode;
	lockedReason?: ReactNode;
	editing?: ProposedChangeEditing;
	actions: readonly ProposedChangeAction[];
};

const BIEN_THE = {
	primary: "default",
	secondary: "outline",
	quiet: "ghost",
} as const satisfies Record<ProposedChangeTone, string>;

function NutHanhDong({
	action,
	pending,
	describedBy,
}: {
	action: ProposedChangeAction;
	pending: boolean;
	describedBy: string | undefined;
}) {
	return (
		<Button
			variant={BIEN_THE[action.tone]}
			size="sm"
			type="button"
			data-hanh-dong={action.id}
			disabled={pending || action.disabled}
			aria-describedby={action.disabled ? describedBy : undefined}
			onClick={action.onClick}
		>
			{pending && action.tone === "primary" ? <Spinner /> : null}
			{action.label}
		</Button>
	);
}

function OSua({ editing }: { editing: ProposedChangeEditing }) {
	const msg = useMessages();
	const ref = useRef<HTMLTextAreaElement>(null);
	useEffect(() => {
		ref.current?.focus();
	}, []);
	const phim = (su: KeyboardEvent<HTMLTextAreaElement>) => {
		if (su.key !== "Escape") return;
		su.stopPropagation();
		editing.onCancel();
	};
	return (
		<Textarea
			ref={ref}
			aria-label={msg.proposedChange.edit}
			data-slot="proposed-change-edit"
			size="sm"
			translate="no"
			value={editing.value}
			onChange={(su) => editing.onChange(su.target.value)}
			onKeyDown={phim}
		/>
	);
}

function GiaTri({
	kind,
	value,
	editing,
}: {
	kind: ProposedChangeKind;
	value: ReactNode;
	editing: ProposedChangeEditing | undefined;
}) {
	if (editing) return <OSua editing={editing} />;
	return (
		<p
			data-slot="proposed-change-value"
			translate="no"
			className="text-foreground text-sm text-pretty wrap-anywhere"
		>
			{kind === "rewrite" ? (
				<ins className="bg-diff-them/15 no-underline">{value}</ins>
			) : (
				value
			)}
		</p>
	);
}

export function ProposedChange({
	id,
	kind,
	label,
	before,
	value,
	rationale,
	pending = false,
	decided,
	error,
	lockedReason,
	editing,
	actions,
	...props
}: ProposedChangeProps) {
	const maTuSinh = useId();
	const ma = id ?? maTuSinh;
	const idKhoa = `${ma}-khoa`;
	const chinh = actions.filter((a) => a.tone !== "quiet");
	const phu = actions.filter((a) => a.tone === "quiet");
	const describedBy = lockedReason ? idKhoa : undefined;
	return (
		<Confirmation
			role="group"
			data-slot="proposed-change"
			data-kind={kind}
			data-decided={decided?.decision}
			approval={
				decided
					? { id: ma, approved: decided.decision === "accepted" }
					: { id: ma }
			}
			state={decided ? "approval-responded" : "approval-requested"}
			{...props}
		>
			<ConfirmationAccepted>
				<p data-slot="proposed-change-decided">{decided?.text}</p>
			</ConfirmationAccepted>
			<ConfirmationRejected>
				<p data-slot="proposed-change-decided">{decided?.text}</p>
			</ConfirmationRejected>
			<ConfirmationRequest>
				<div data-slot="proposed-change-body" className="flex flex-col gap-1">
					{label ? (
						<p
							data-slot="proposed-change-label"
							className="font-medium text-foreground"
						>
							{label}
						</p>
					) : null}
					{before !== undefined ? (
						<p translate="no" className="text-muted-foreground wrap-anywhere">
							<del className="line-through decoration-diff-bo">{before}</del>
						</p>
					) : null}
					<GiaTri kind={kind} value={value} editing={editing} />
					{rationale ? (
						<p className="text-muted-foreground text-pretty">{rationale}</p>
					) : null}
				</div>
			</ConfirmationRequest>
			<ConfirmationActions
				data-slot="proposed-change-actions"
				className="flex-wrap justify-start self-stretch"
			>
				{chinh.map((a) => (
					<NutHanhDong
						key={a.id}
						action={a}
						pending={pending}
						describedBy={describedBy}
					/>
				))}
				{phu.length > 0 ? (
					<div className="ms-auto flex items-center gap-2">
						{phu.map((a) => (
							<NutHanhDong
								key={a.id}
								action={a}
								pending={pending}
								describedBy={describedBy}
							/>
						))}
					</div>
				) : null}
			</ConfirmationActions>
			{!decided && lockedReason ? (
				<p id={idKhoa} className="text-muted-foreground">
					{lockedReason}
				</p>
			) : null}
			{error ? <FieldError>{error}</FieldError> : null}
		</Confirmation>
	);
}
