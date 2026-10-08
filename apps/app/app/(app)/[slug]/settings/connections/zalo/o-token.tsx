"use client";

import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { Field, FieldError, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { nhacQuaZaloMessages } from "@/lib/messages/nhac-qua-zalo";
import { ZALO_MAN } from "@/lib/nhac-qua-zalo-man";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

export function OToken({
	daBat,
	goiToken,
}: {
	daBat: boolean;
	goiToken: string | null;
}) {
	const t = nhacQuaZaloMessages(useLocale()).ketNoi;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const router = useRouter();
	const id = useId();
	const o = useRef<HTMLInputElement>(null);
	const [nhap, setNhap] = useState("");
	const [loi, setLoi] = useState<string | null>(null);
	const [doiBot, setDoiBot] = useState<{
		token: string;
		soLienKet: number;
		tenBotMoi: string;
	} | null>(null);

	const baoLoi = (chu: string) => {
		setLoi(chu);
		o.current?.focus();
	};

	const luu = useMutation(
		trpc.zalo.luuBot.mutationOptions({
			onSuccess: async (kq, bien) => {
				if ("ketQua" in kq) {
					setDoiBot({
						token: bien.token ?? "",
						soLienKet: kq.soLienKet,
						tenBotMoi: kq.tenBotMoi,
					});
					return;
				}
				setDoiBot(null);
				setNhap("");
				setLoi(null);
				if (kq.webhook === "zalo-tu-choi") {
					toast.warning(t.daLuuChuaNhanTin(kq.tenBot));
				} else {
					toast.success(t.daLuu(kq.tenBot));
				}
				await cache.zalo();
				router.refresh();
			},
			onError: (e) => baoLoi(e.message),
		}),
	);

	return (
		<form
			className="flex flex-col gap-3"
			onSubmit={(e) => {
				e.preventDefault();
				const token = nhap.trim();
				if (!ZALO_MAN.botToken.test(token)) {
					baoLoi(t.saiDang);
					return;
				}
				setLoi(null);
				luu.mutate({ token });
			}}
		>
			<Field data-invalid={loi ? true : undefined}>
				<FieldLabel htmlFor={id}>{t.nhanToken}</FieldLabel>
				<Input
					ref={o}
					id={id}
					type="password"
					value={nhap}
					onChange={(e) => setNhap(e.target.value)}
					placeholder={goiToken ? `••••${goiToken}` : t.goiYToken}
					autoComplete="off"
					autoCapitalize="off"
					autoCorrect="off"
					spellCheck={false}
					readOnly={luu.isPending}
					aria-invalid={loi ? true : undefined}
				/>
				<div aria-live="polite">
					{loi ? <FieldError>{loi}</FieldError> : null}
				</div>
			</Field>
			<div>
				<Button
					type="submit"
					size="sm"
					variant={daBat ? "outline" : "default"}
					disabled={luu.isPending}
				>
					{luu.isPending ? <Spinner data-icon="inline-start" /> : null}
					{luu.isPending ? t.dangKiem : daBat ? t.thayToken : t.luu}
				</Button>
			</div>
			<ConfirmDialog
				tieuDe={t.doiBotTieuDe}
				than={doiBot ? t.doiBotThan(doiBot.tenBotMoi, doiBot.soLienKet) : ""}
				nut={t.doiBotNut}
				thoi={t.doiBotThoi}
				tone="destructive"
				open={doiBot !== null}
				onOpenChange={(mo) => {
					if (!mo) setDoiBot(null);
				}}
				pending={luu.isPending}
				onConfirm={() => {
					if (doiBot) luu.mutate({ token: doiBot.token, xacNhanDoiBot: true });
				}}
			/>
		</form>
	);
}
