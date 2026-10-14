"use client";

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
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Textarea } from "@crm/ui/components/textarea";
import { chuanNfc, TAI_LIEU } from "@crm/validation/tai-lieu";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { taiLieuLichSuMessages } from "@/lib/messages/tai-lieu-lich-su";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const MA_LOI_MAY_CHU = 500;

export type ViecTrang = "LUU_TRU" | "KHOI_PHUC";

type LoiMay = { message: string; data?: { httpStatus?: number } | null };

export function HopViecTrang({
	slug,
	viec,
	mo,
	doiMo,
}: {
	slug: string;
	viec: ViecTrang;
	mo: boolean;
	doiMo: (mo: boolean) => void;
}) {
	const m = taiLieuLichSuMessages(useLocale()).luuTru.hop;
	const chu = m[viec];
	const trpc = useTRPC();
	const cache = useCrmCache();
	const router = useRouter();
	const ma = useId();
	const idLyDo = `${ma}-ly-do`;
	const idMoTa = `${ma}-mo-ta`;
	const [lyDo, setLyDo] = useState("");
	const [loi, setLoi] = useState<string | null>(null);
	const gon = chuanNfc(lyDo).trim();
	const quaDai = gon.length > TAI_LIEU.lyDo.max;

	const thuTuc =
		viec === "LUU_TRU"
			? trpc.taiLieu.deXuatLuuTru
			: trpc.taiLieu.deXuatKhoiPhuc;
	const gui = useMutation(
		thuTuc.mutationOptions({
			onSuccess: async () => {
				setLyDo("");
				doiMo(false);
				await cache.taiLieu(slug);
				router.refresh();
			},
			onError: (e: LoiMay) =>
				setLoi(
					dien(m.loi, {
						loi:
							e.data?.httpStatus !== undefined &&
							e.data.httpStatus < MA_LOI_MAY_CHU
								? e.message
								: m.mayChu,
					}),
				),
		}),
	);

	const bamGui = () => {
		if (gon.length < TAI_LIEU.lyDo.min || quaDai || gui.isPending) return;
		setLoi(null);
		gui.mutate({ slug, lyDo: gon });
	};

	return (
		<Dialog onOpenChange={doiMo} open={mo}>
			<DialogContent data-hop-viec-trang={viec}>
				<DialogHeader>
					<DialogTitle>{chu.tieuDe}</DialogTitle>
					<DialogDescription>{chu.moTa}</DialogDescription>
				</DialogHeader>
				<Field data-invalid={quaDai ? true : undefined}>
					<FieldLabel htmlFor={idLyDo}>{m.lyDo}</FieldLabel>
					<Textarea
						aria-describedby={idMoTa}
						aria-invalid={quaDai ? true : undefined}
						id={idLyDo}
						onChange={(e) => setLyDo(e.target.value)}
						translate="no"
						value={lyDo}
					/>
					{quaDai ? (
						<FieldError data-ly-do-dai="">
							{dien(m.lyDoDai, { max: TAI_LIEU.lyDo.max })}
						</FieldError>
					) : (
						<FieldDescription id={idMoTa}>
							{dien(m.lyDoMoTa, { max: TAI_LIEU.lyDo.max })}
						</FieldDescription>
					)}
					{loi ? <FieldError data-loi-gui="">{loi}</FieldError> : null}
				</Field>
				<DialogFooter>
					<DialogClose asChild>
						<Button data-nut-huy="" variant="outline">
							{m.huy}
						</Button>
					</DialogClose>
					<Button
						data-nut-gui=""
						disabled={gon.length < TAI_LIEU.lyDo.min || quaDai || gui.isPending}
						onClick={bamGui}
					>
						{gui.isPending ? m.dangGui : loi ? m.thuLai : m.gui}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
