"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Field, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import { useMutation } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { useId, useState } from "react";
import { toast } from "sonner";
import { useGiaiDoan } from "@/lib/giai-doan";
import { crmMessages } from "@/lib/messages/crm";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { DealStageIndicator } from "./deal-stage";

const closeReasonParams = {
	[SEARCH_PARAM.dialog.closeDeal]: parseAsString,
	[SEARCH_PARAM.dialog.closeStage]: parseAsString,
};

function useStageMutation(onDone?: () => void) {
	const trpc = useTRPC();
	const cache = useCrmCache();

	return useMutation(
		trpc.deals.setStage.mutationOptions({
			onSuccess: async (_, variables) => {
				await cache.deal(variables.id);
				onDone?.();
			},
			onError: (error) => toast.error(error.message),
		}),
	);
}

export function DealStageMenu({
	dealId,
	stage,
	variant = "inline",
	wrapLabel = false,
}: {
	dealId: string;
	stage: string;
	variant?: "inline" | "control";
	wrapLabel?: boolean;
}) {
	const [, setCloseParams] = useQueryStates(closeReasonParams);
	const setStage = useStageMutation();
	const giaiDoan = useGiaiDoan();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{variant === "control" ? (
					<Button
						variant="outline"
						size="sm"
						disabled={setStage.isPending}
						onClick={(event) => event.stopPropagation()}
					>
						<DealStageIndicator stage={stage} className="text-foreground" />
						<Icon icon={ChevronDown} className="text-muted-foreground" />
					</Button>
				) : (
					<button
						type="button"
						onClick={(event) => event.stopPropagation()}
						disabled={setStage.isPending}
						className="flex min-w-0 max-w-full items-center text-left hover:text-foreground disabled:opacity-50"
					>
						<DealStageIndicator stage={stage} wrapLabel={wrapLabel} />
					</button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align={variant === "control" ? "end" : "start"}
				className="min-w-52"
				onClick={(event) => event.stopPropagation()}
			>
				<DropdownMenuRadioGroup
					value={stage}
					onValueChange={(next) => {
						const chosen = next;
						if (chosen === stage) return;
						if (giaiDoan.laThua(chosen)) {
							void setCloseParams({
								[SEARCH_PARAM.dialog.closeDeal]: dealId,
								[SEARCH_PARAM.dialog.closeStage]: chosen,
							});
							return;
						}
						setStage.mutate({ id: dealId, stage: chosen });
					}}
				>
					{giaiDoan.stages.map((option) => (
						<DropdownMenuRadioItem key={option.id} value={option.id}>
							<span translate="no">{option.label}</span>
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function CloseReasonDialog() {
	const reasonId = useId();
	const [closeValues, setCloseParams] = useQueryStates(closeReasonParams);
	const closing = closeValues[SEARCH_PARAM.dialog.closeDeal];
	const closingStage = closeValues[SEARCH_PARAM.dialog.closeStage];
	const [reason, setReason] = useState("");
	const m = crmMessages(useLocale());

	const close = () => {
		setReason("");
		void setCloseParams({
			[SEARCH_PARAM.dialog.closeDeal]: null,
			[SEARCH_PARAM.dialog.closeStage]: null,
		});
	};

	const setStage = useStageMutation(() => {
		toast.success(m.close.done);
		close();
	});

	const stage = closingStage;
	const open = Boolean(closing && stage);

	return (
		<Dialog open={open} onOpenChange={(next) => !next && close()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{m.close.asLost}</DialogTitle>
					<DialogDescription>{m.close.lostReason}</DialogDescription>
				</DialogHeader>

				<form
					id="close-reason"
					className="px-4"
					onSubmit={(event) => {
						event.preventDefault();
						if (!closing || !stage) return;
						setStage.mutate({ id: closing, stage, closedReason: reason });
					}}
				>
					<Field>
						<FieldLabel htmlFor={reasonId}>{m.close.reason}</FieldLabel>
						<Textarea
							id={reasonId}
							value={reason}
							onChange={(event) => setReason(event.target.value)}
							placeholder={m.close.reasonPlaceholder}
							rows={3}
						/>
					</Field>
				</form>

				<DialogFooter>
					<Button
						type="submit"
						form="close-reason"
						disabled={setStage.isPending || reason.trim() === ""}
					>
						{setStage.isPending ? <Spinner /> : null}
						{m.close.save}
					</Button>
					<DialogClose asChild>
						<Button variant="outline">{m.sheet.cancel}</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
