"use client";

import { Button } from "@crm/ui/components/button";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { ThanhVienMessages } from "@/lib/messages/settings-thanh-vien";
import { useTRPC } from "@/lib/trpc/client";
import { PhatChiaDialog } from "./phat-chia-dialog";

export function PhatChiaButton({
	t,
	email,
	ten,
	coQuyen,
	onDaPhat,
}: {
	t: ThanhVienMessages;
	email: string;
	ten: string;
	coQuyen: boolean;
	onDaPhat?: () => void;
}) {
	const trpc = useTRPC();
	const [url, setUrl] = useState<string | null>(null);
	const [loi, setLoi] = useState<string | null>(null);
	const [moHopThoai, setMoHopThoai] = useState(false);

	const phatChia = useMutation(
		trpc.workspace.issuePasswordLink.mutationOptions({
			onSuccess: (data) => {
				setUrl(data.url);
				setLoi(null);
				setMoHopThoai(true);
				onDaPhat?.();
			},
			onError: (error) => {
				setUrl(null);
				setLoi(error.message);
				setMoHopThoai(true);
			},
		}),
	);

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				disabled={phatChia.isPending || !coQuyen}
				title={coQuyen ? undefined : t.phatChia.canQuyen}
				onClick={() => phatChia.mutate({ email })}
			>
				{phatChia.isPending ? (
					<>
						<Spinner data-icon="inline-start" />
						{t.phatChia.dangPhat}
					</>
				) : (
					t.phatChia.nut
				)}
			</Button>

			<PhatChiaDialog
				t={t}
				ten={ten}
				url={url}
				loi={loi}
				open={moHopThoai}
				onOpenChange={(next) => {
					setMoHopThoai(next);
					if (!next) {
						setUrl(null);
						setLoi(null);
					}
				}}
			/>
		</>
	);
}
