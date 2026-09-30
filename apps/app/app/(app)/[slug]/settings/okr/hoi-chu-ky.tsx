"use client";

import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ChuKy } from "@/app/(app)/[slug]/okr/kieu";
import { okrMessages } from "@/lib/messages/okr";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

type HoiProps = {
	ky: ChuKy;
	open: boolean;
	dong: () => void;
};

export function HoiGoChuKy({ ky, open, dong }: HoiProps) {
	const g = okrMessages(useLocale()).caiDat.chuKy.go;
	const trpc = useTRPC();
	const cache = useCrmCache();

	const go = useMutation(
		trpc.okr.goChuKy.mutationOptions({
			onSuccess: async () => {
				dong();
				await cache.okr();
				toast.success(g.xong(ky.name));
			},
			onError: async (error) => {
				dong();
				toast.error(error.message);
				await cache.okr();
			},
		}),
	);

	return (
		<ConfirmDialog
			tone="destructive"
			tieuDe={g.tieuDe(ky.name)}
			than={g.than(ky.name)}
			nut={g.nut}
			thoi={g.huy}
			open={open}
			pending={go.isPending}
			onOpenChange={(mo) => {
				if (!mo && !go.isPending) dong();
			}}
			onConfirm={() => {
				if (!go.isPending) go.mutate({ id: ky.id });
			}}
		/>
	);
}

export function HoiHienLaiChuKy({ ky, open, dong }: HoiProps) {
	const c = okrMessages(useLocale()).caiDat;
	const h = c.chuKy.hienLai;
	const trpc = useTRPC();
	const cache = useCrmCache();

	const hienLai = useMutation(
		trpc.okr.hienChuKy.mutationOptions({
			onSuccess: async () => {
				dong();
				await cache.okr();
				toast.success(h.xong(ky.name));
			},
			onError: async (error) => {
				dong();
				toast.error(error.message);
				await cache.okr();
			},
		}),
	);

	return (
		<ConfirmDialog
			tone="default"
			tieuDe={h.tieuDe(ky.name)}
			than={h.than(c.pha[ky.phase])}
			nut={h.nut}
			thoi={h.huy}
			open={open}
			pending={hienLai.isPending}
			onOpenChange={(mo) => {
				if (!mo && !hienLai.isPending) dong();
			}}
			onConfirm={() => {
				if (!hienLai.isPending) hienLai.mutate({ id: ky.id });
			}}
		/>
	);
}
