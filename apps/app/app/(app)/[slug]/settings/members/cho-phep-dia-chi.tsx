"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { thanhVienMessages } from "@/lib/messages/settings-thanh-vien";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { AllowDialog } from "./allow-dialog";

export function ChoPhepDiaChi() {
	const t = thanhVienMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();

	const workspace = useQuery(trpc.workspace.get.queryOptions());
	const [mo, setMo] = useState(false);
	const [loi, setLoi] = useState<string | null>(null);

	const choPhep = useMutation(
		trpc.workspace.allowEmail.mutationOptions({
			onSuccess: async () => {
				setMo(false);
				setLoi(null);
				await cache.workspace();
				toast.success(t.hopThoaiChoPhep.xong);
			},
			onError: (error) => setLoi(error.message),
		}),
	);

	if (workspace.isPending) return null;
	if (workspace.data && !workspace.data.canManageMembers) return null;

	return (
		<>
			<Button aria-haspopup="dialog" onClick={() => setMo(true)}>
				<Icon icon={Add} data-icon="inline-start" />
				{t.duocPhepVao.nutThem}
			</Button>

			<AllowDialog
				t={t}
				open={mo}
				onOpenChange={(next) => {
					setMo(next);
					if (!next) setLoi(null);
				}}
				onSubmit={(values) => choPhep.mutate(values)}
				pending={choPhep.isPending}
				loi={loi}
			/>
		</>
	);
}
