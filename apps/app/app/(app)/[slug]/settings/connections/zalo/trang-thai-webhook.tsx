"use client";

import Warning from "@carbon/icons-react/es/Warning";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { nhacQuaZaloMessages } from "@/lib/messages/nhac-qua-zalo";
import { ZALO_MAN } from "@/lib/nhac-qua-zalo-man";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

export type TrangThaiWebhook =
	| "da-dang-ky"
	| "can-https"
	| "chua-dang-ky"
	| "khoa-lech";

export function TrangThaiWebhookZalo({
	trangThai,
	canManage,
}: {
	trangThai: TrangThaiWebhook;
	canManage: boolean;
}) {
	const t = nhacQuaZaloMessages(useLocale()).ketNoi;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const router = useRouter();
	const dangKyLai = useMutation(
		trpc.zalo.luuBot.mutationOptions({
			onSuccess: async (kq) => {
				if (kq.ketQua !== "da-luu" || kq.webhook === "zalo-tu-choi") {
					toast.warning(t.dangKyLaiChuaXong);
				} else {
					toast.success(t.daDangKyLai);
				}
				await cache.zalo();
				router.refresh();
			},
			onError: (e) => toast.error(e.message),
		}),
	);

	if (trangThai === "da-dang-ky") {
		return (
			<StatusIndicator tone="success" size="sm" label={t.nhanQuaWebhook} />
		);
	}

	if (trangThai === "can-https") {
		return (
			<Alert variant="warning">
				<Icon icon={Warning} />
				<AlertTitle>{t.canHttpsTieuDe}</AlertTitle>
				<AlertDescription>
					{t.canHttpsMoTa}{" "}
					<code className="font-mono" translate="no">
						{ZALO_MAN.lenhPoll}
					</code>
					.
				</AlertDescription>
			</Alert>
		);
	}

	const khoaLech = trangThai === "khoa-lech";
	return (
		<Alert variant="warning">
			<Icon icon={Warning} />
			<AlertTitle>
				{khoaLech ? t.khoaLechTieuDe : t.chuaWebhookTieuDe}
			</AlertTitle>
			<AlertDescription>
				<p>{khoaLech ? t.khoaLechMoTa : t.chuaWebhookMoTa}</p>
				{canManage ? (
					<Button
						variant="outline"
						size="sm"
						disabled={dangKyLai.isPending}
						onClick={() => dangKyLai.mutate({})}
					>
						{dangKyLai.isPending ? <Spinner data-icon="inline-start" /> : null}
						{t.dangKyLai}
					</Button>
				) : null}
			</AlertDescription>
		</Alert>
	);
}
