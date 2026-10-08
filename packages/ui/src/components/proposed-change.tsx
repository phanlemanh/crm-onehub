"use client";

import AiGenerate from "@carbon/icons-react/es/AiGenerate";
import Checkmark from "@carbon/icons-react/es/Checkmark";
import {
	Confirmation,
	ConfirmationAccepted,
	ConfirmationActions,
	ConfirmationRejected,
	ConfirmationRequest,
} from "@crm/ui/components/ai-elements/confirmation";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { FieldError } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Item, ItemContent, ItemMedia } from "@crm/ui/components/item";
import { useMessages } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import {
	type ComponentProps,
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useId,
	useLayoutEffect,
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

export type ProposedChangeDensity = "inline" | "card";

export type ProposedChangeDecided = {
	decision: ProposedChangeDecision;
	text: ReactNode;
	onUndo?: () => void;
};

export type ProposedChangeProps = Omit<
	ComponentProps<"div">,
	"children" | "role"
> & {
	id?: string;
	density?: ProposedChangeDensity;
	kind: ProposedChangeKind;
	label?: ReactNode;
	before?: ReactNode;
	value: ReactNode;
	rationale?: ReactNode;
	fields?: ReactNode;
	tag?: ReactNode;
	pending?: boolean;
	decided?: ProposedChangeDecided;
	error?: ReactNode;
	lockedReason?: ReactNode;
	lockedReasonHidden?: boolean;
	media?: boolean;
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
	density,
	kind,
	value,
	editing,
}: {
	density: ProposedChangeDensity;
	kind: ProposedChangeKind;
	value: ReactNode;
	editing: ProposedChangeEditing | undefined;
}) {
	if (editing) return <OSua editing={editing} />;
	return (
		<p
			data-slot="proposed-change-value"
			translate="no"
			className={
				density === "card"
					? "text-foreground text-sm text-pretty wrap-anywhere"
					: "text-foreground text-pretty wrap-anywhere"
			}
		>
			{kind === "rewrite" ? (
				<ins className="bg-diff-them/15 no-underline">{value}</ins>
			) : (
				value
			)}
		</p>
	);
}

export function ProposedChangeReceipt({
	decision,
	text,
	onUndo,
}: ProposedChangeDecided) {
	const msg = useMessages();
	const daNhan = decision === "accepted";
	return (
		<div
			role="status"
			data-slot="proposed-change-receipt"
			tabIndex={-1}
			className="flex flex-wrap items-center gap-2 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
		>
			{daNhan ? <Icon icon={Checkmark} /> : null}
			<p
				data-slot="proposed-change-decided"
				className={daNhan ? undefined : "text-muted-foreground"}
			>
				{text}
			</p>
			{onUndo ? (
				<Button size="xs" variant="ghost" type="button" onClick={onUndo}>
					{msg.proposedChange.undo}
				</Button>
			) : null}
		</div>
	);
}

function ThanDeXuat({
	density,
	kind,
	label,
	before,
	value,
	rationale,
	fields,
	tag,
	editing,
}: Pick<
	ProposedChangeProps,
	| "kind"
	| "label"
	| "before"
	| "value"
	| "rationale"
	| "fields"
	| "tag"
	| "editing"
> & { density: ProposedChangeDensity }) {
	return (
		<div data-slot="proposed-change-body" className="flex flex-col gap-1">
			{label || tag ? (
				<p
					data-slot="proposed-change-label"
					className="flex flex-wrap items-center gap-2 font-medium text-foreground"
				>
					{label}
					{tag ? (
						<Badge variant="outline" data-slot="proposed-change-tag">
							{tag}
						</Badge>
					) : null}
				</p>
			) : null}
			{before !== undefined ? (
				<p translate="no" className="text-muted-foreground wrap-anywhere">
					<del className="line-through decoration-diff-bo">{before}</del>
				</p>
			) : null}
			<GiaTri density={density} kind={kind} value={value} editing={editing} />
			{rationale ? (
				<p className="text-muted-foreground text-pretty">{rationale}</p>
			) : null}
			{fields ? (
				<div data-slot="proposed-change-fields" className="flex flex-col gap-2">
					{fields}
				</div>
			) : null}
		</div>
	);
}

function NhomNut({
	density,
	actions,
	pending,
	describedBy,
}: {
	density: ProposedChangeDensity;
	actions: readonly ProposedChangeAction[];
	pending: boolean;
	describedBy: string | undefined;
}) {
	const chinh = actions.filter((a) => a.tone !== "quiet");
	const phu = actions.filter((a) => a.tone === "quiet");
	if (density === "inline")
		return (
			<>
				{[...chinh, ...phu].map((a) => (
					<NutHanhDong
						key={a.id}
						action={a}
						pending={pending}
						describedBy={describedBy}
					/>
				))}
			</>
		);
	return (
		<>
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
		</>
	);
}

type MocFocus = {
	dangSua: boolean;
	quyet: ProposedChangeDecision | undefined;
	coHoanTac: boolean;
};

function useGiuFocus(
	dangSua: boolean,
	decided: ProposedChangeDecided | undefined,
) {
	const goc = useRef<HTMLDivElement>(null);
	const quyet = decided?.decision;
	const coHoanTac = decided?.onUndo !== undefined;
	const truoc = useRef<MocFocus>({ dangSua, quyet, coHoanTac });
	useLayoutEffect(() => {
		const cu = truoc.current;
		truoc.current = { dangSua, quyet, coHoanTac };
		const el = goc.current;
		if (!el) return;
		const dang = document.activeElement;
		if (dang && dang !== document.body && !el.contains(dang)) return;
		const tim = (sel: string) => el.querySelector<HTMLElement>(sel);
		if (cu.dangSua && !dangSua && quyet === undefined) {
			tim('[data-hanh-dong="sua"]')?.focus();
			return;
		}
		const vuaQuyet = quyet !== undefined && cu.quyet === undefined;
		const vuaHoanTac = quyet !== undefined && cu.coHoanTac && !coHoanTac;
		if (vuaQuyet && coHoanTac) {
			tim('[data-slot="proposed-change-receipt"] button')?.focus();
			return;
		}
		if (vuaQuyet || vuaHoanTac)
			tim('[data-slot="proposed-change-receipt"]')?.focus();
	}, [dangSua, quyet, coHoanTac]);
	return goc;
}

export function ProposedChange({
	id,
	density = "inline",
	kind,
	label,
	before,
	value,
	rationale,
	fields,
	tag,
	pending = false,
	decided,
	error,
	lockedReason,
	lockedReasonHidden = false,
	media = true,
	editing,
	actions,
	...props
}: ProposedChangeProps) {
	const maTuSinh = useId();
	const ma = id ?? maTuSinh;
	const goc = useGiuFocus(editing !== undefined, decided);
	const idKhoa = `${ma}-khoa`;
	const describedBy = lockedReason ? idKhoa : undefined;
	const than = (
		<ThanDeXuat
			density={density}
			kind={kind}
			label={label}
			before={before}
			value={value}
			rationale={rationale}
			fields={fields}
			tag={tag}
			editing={editing}
		/>
	);
	const khoa =
		!decided && lockedReason ? (
			<p
				id={idKhoa}
				className={lockedReasonHidden ? "sr-only" : "text-muted-foreground"}
			>
				{lockedReason}
			</p>
		) : null;
	const loi = error ? <FieldError>{error}</FieldError> : null;
	const nut = (
		<NhomNut
			density={density}
			actions={actions}
			pending={pending}
			describedBy={describedBy}
		/>
	);

	if (density === "card") {
		return (
			<Confirmation
				ref={goc}
				role="group"
				data-slot="proposed-change"
				data-density="card"
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
					{decided ? <ProposedChangeReceipt {...decided} /> : null}
				</ConfirmationAccepted>
				<ConfirmationRejected>
					{decided ? <ProposedChangeReceipt {...decided} /> : null}
				</ConfirmationRejected>
				<ConfirmationRequest>{than}</ConfirmationRequest>
				<ConfirmationActions
					data-slot="proposed-change-actions"
					className="flex-wrap justify-start self-stretch"
				>
					{nut}
				</ConfirmationActions>
				{khoa}
				{loi}
			</Confirmation>
		);
	}

	return (
		<Item
			ref={goc}
			role="group"
			text="inherit"
			size={decided ? "xs" : "sm"}
			data-slot="proposed-change"
			data-density="inline"
			data-kind={kind}
			data-decided={decided?.decision}
			{...props}
		>
			{decided || !media ? null : (
				<ItemMedia>
					<span className="text-muted-foreground">
						<Icon icon={AiGenerate} />
					</span>
				</ItemMedia>
			)}
			<ItemContent>
				{decided ? (
					<ProposedChangeReceipt {...decided} />
				) : (
					<>
						{than}
						<div
							data-slot="proposed-change-actions"
							className="flex flex-wrap items-center gap-2"
						>
							{nut}
						</div>
					</>
				)}
				{khoa}
				{loi}
			</ItemContent>
		</Item>
	);
}
