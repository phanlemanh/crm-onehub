"use client";

import Close from "@carbon/icons-react/es/Close";
import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import TrashCan from "@carbon/icons-react/es/TrashCan";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@crm/ui/components/alert-dialog";
import {
	AsyncButtonContent,
	useAsyncAction,
} from "@crm/ui/components/async-action";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { hoiThoaiThaoTacMessages } from "@/lib/messages/agent-builder-hoi-thoai-thao-tac";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

export function DeleteChatAction({
	conversationId,
	title,
	trigger,
	className,
	returnToChatList = false,
	onDeleted,
}: {
	conversationId: string;
	title: string;
	trigger: "close" | "menu";
	className?: string;
	returnToChatList?: boolean;
	onDeleted?: () => void;
}) {
	const t = hoiThoaiThaoTacMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();
	const [confirming, setConfirming] = useState(false);
	const remove = useMutation(
		trpc.conversations.remove.mutationOptions({
			onSuccess: async () => {
				await cache.conversationRemoved(conversationId);
				setConfirming(false);
				toast.success(t.xoa.daXoa);
				onDeleted?.();

				if (returnToChatList) {
					router.replace(workspaceUrl("/chat"));
				}
			},
			onError: (error) => toast.error(error.message),
		}),
	);
	const removeAction = useAsyncAction({
		action: () => remove.mutateAsync({ id: conversationId }),
	});

	return (
		<>
			{trigger === "close" ? (
				<Button
					variant="ghost"
					size="icon-xs"
					className={className}
					disabled={removeAction.pending}
					aria-label={t.xoa.xoaMot(title)}
					onClick={() => setConfirming(true)}
				>
					<Icon icon={Close} />
				</Button>
			) : (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							disabled={removeAction.pending}
						>
							<Icon icon={OverflowMenuVertical} />
							<span className="sr-only">{t.xoa.themThaoTac}</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							variant="destructive"
							onSelect={() => setConfirming(true)}
						>
							<Icon icon={TrashCan} />
							{t.xoa.xoaHoiThoai}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}

			<AlertDialog
				open={confirming}
				onOpenChange={(open) => {
					if (!removeAction.pending) setConfirming(open);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t.xoa.xoaHoi(title)}</AlertDialogTitle>
						<AlertDialogDescription>{t.xoa.xoaMoTa}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={removeAction.pending}>
							{t.xoa.huy}
						</AlertDialogCancel>
						<Button
							variant="destructive"
							disabled={removeAction.pending}
							aria-busy={removeAction.pending}
							onClick={() => removeAction.run()}
						>
							<AsyncButtonContent
								status={removeAction.status}
								pendingLabel={t.xoa.dangXoa}
								successLabel={t.xoa.daXong}
								errorLabel={t.xoa.thuLai}
							>
								{t.xoa.xoa}
							</AsyncButtonContent>
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
