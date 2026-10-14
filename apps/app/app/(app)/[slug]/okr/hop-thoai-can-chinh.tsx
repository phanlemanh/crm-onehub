"use client";

import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
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
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { Textarea } from "@crm/ui/components/textarea";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import {
	LY_DO_CAN_CHINH,
	mucTinCanChinh,
} from "@crm/validation/ly-do-can-chinh";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { NGHIA_MUC_TIN } from "@/components/crm/record-sheet/ly-do-noi-gop";
import { okrMessages } from "@/lib/messages/okr";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

type DaGop = { targetObjectiveId: string; targetKeyResultId: string | null };

export type CheDoHopThoai =
	| { loai: "gan" }
	| {
			loai: "sua";
			alignmentId: string;
			tenDich: string;
			lyDo: string | null;
			canCu: string | null;
	  }
	| {
			loai: "nhan";
			tenDich: string;
			lyDo: string;
			canCu: string | null;
			guiNhan: (lyDo: string, canCu: string | null) => void;
	  };

const khoaDich = (objectiveId: string, keyResultId: string | null) =>
	`${objectiveId}|${keyResultId ?? ""}`;

const GAN: CheDoHopThoai = { loai: "gan" };

export function HopThoaiCanChinh({
	objectiveId,
	daGop,
	dong,
	cheDo = GAN,
}: {
	objectiveId: string;
	daGop: DaGop[];
	dong: () => void;
	cheDo?: CheDoHopThoai;
}) {
	const m = okrMessages(useLocale());
	const h = m.hopThoai;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ma = useId();
	const [chon, setChon] = useState("");
	const [lyDo, setLyDo] = useState(
		cheDo.loai === "gan" ? "" : (cheDo.lyDo ?? ""),
	);
	const [canCu, setCanCu] = useState(
		cheDo.loai === "gan" ? "" : (cheDo.canCu ?? ""),
	);
	const [loi, setLoi] = useState<string | null>(null);

	const ungVien = useQuery({
		...trpc.okr.alignmentTargets.queryOptions({ objectiveId }),
		enabled: cheDo.loai === "gan",
	});
	const xong = (chu: string) => () => {
		toast.success(chu);
		void cache.okr(objectiveId);
		dong();
	};
	const gan = useMutation(
		trpc.okr.addAlignment.mutationOptions({
			onSuccess: (kq) => {
				if (kq.canhBao) toast.warning(kq.canhBao);
				xong(h.daGan)();
			},
			onError: (e) => setLoi(e.message),
		}),
	);
	const sua = useMutation(
		trpc.okr.suaLyDoCanChinh.mutationOptions({
			onSuccess: xong(h.daSuaLyDo),
			onError: (e) => setLoi(e.message),
		}),
	);
	const dangGui = gan.isPending || sua.isPending;

	const coRoi = new Set(
		daGop.map((g) => khoaDich(g.targetObjectiveId, g.targetKeyResultId)),
	);
	const dich = (ungVien.data?.targets ?? []).filter(
		(t) => !coRoi.has(khoaDich(t.objectiveId, t.keyResultId)),
	);
	const luaChon = dich.map((t) => ({
		value: khoaDich(t.objectiveId, t.keyResultId),
		label: t.label,
		hint: t.unitName,
		keywords: [t.unitName],
	}));
	const daChon = dich.find(
		(t) => khoaDich(t.objectiveId, t.keyResultId) === chon,
	);

	const mucTin = mucTinCanChinh(lyDo, canCu);
	const loiCanCu = canCu.trim() !== "" && lyDo.trim() === "";
	const chu = {
		lyDo: lyDo.trim() === "" ? null : lyDo.trim(),
		canCu: canCu.trim() === "" ? null : canCu.trim(),
	};
	const guiDuoc =
		!dangGui &&
		!loiCanCu &&
		(cheDo.loai === "gan"
			? Boolean(daChon)
			: cheDo.loai === "sua" || chu.lyDo !== null);

	const gui = () => {
		if (!guiDuoc) return;
		setLoi(null);
		if (cheDo.loai === "sua") {
			sua.mutate({ id: cheDo.alignmentId, ...chu });
			return;
		}
		if (cheDo.loai === "nhan") {
			if (chu.lyDo === null) return;
			cheDo.guiNhan(chu.lyDo, chu.canCu);
			dong();
			return;
		}
		if (!daChon) return;
		gan.mutate({
			objectiveId,
			targetObjectiveId:
				daChon.keyResultId === null ? daChon.objectiveId : null,
			targetKeyResultId: daChon.keyResultId,
			...chu,
		});
	};

	const tieuDe = cheDo.loai === "sua" ? h.suaLyDoCanChinh : h.ganCanChinh;
	const moTa =
		cheDo.loai === "gan"
			? h.moTaCanChinh
			: cheDo.loai === "sua"
				? h.moTaSuaLyDo
				: h.moTaNhanDeXuat;

	return (
		<Dialog
			open
			onOpenChange={(mo) => {
				if (!mo && !dangGui) dong();
			}}
		>
			<DialogContent data-hop-thoai-can-chinh data-che-do={cheDo.loai}>
				<DialogHeader>
					<DialogTitle>{tieuDe}</DialogTitle>
					<DialogDescription>{moTa}</DialogDescription>
				</DialogHeader>
				<form
					id={`${ma}-form`}
					onSubmit={(e) => {
						e.preventDefault();
						gui();
					}}
				>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor={`${ma}-dich`}>{h.ganVao}</FieldLabel>
							{cheDo.loai === "gan" ? (
								<Combobox
									id={`${ma}-dich`}
									translate="no"
									disabled={ungVien.isPending || luaChon.length === 0}
									options={luaChon}
									value={chon}
									onValueChange={setChon}
									placeholder={
										ungVien.isPending
											? h.dangTai
											: luaChon.length === 0
												? h.khongDich
												: h.chonDich
									}
									searchPlaceholder={h.timDich}
									empty={h.khongDich}
								/>
							) : (
								<FieldTitle id={`${ma}-dich`} data-dich-khoa translate="no">
									{cheDo.tenDich}
								</FieldTitle>
							)}
						</Field>
						<Field>
							<FieldLabel htmlFor={`${ma}-ly-do`}>{h.lyDoCanChinh}</FieldLabel>
							<Textarea
								id={`${ma}-ly-do`}
								data-o="vi-sao"
								translate="no"
								maxLength={LY_DO_CAN_CHINH.lyDoToiDa}
								disabled={dangGui}
								value={lyDo}
								onChange={(e) => setLyDo(e.target.value)}
							/>
							<FieldDescription>{h.lyDoCanChinhMoTa}</FieldDescription>
						</Field>
						<Field data-invalid={loiCanCu || undefined}>
							<FieldLabel htmlFor={`${ma}-can-cu`}>
								{h.canCuCanChinh}
							</FieldLabel>
							<Textarea
								id={`${ma}-can-cu`}
								data-o="can-cu"
								translate="no"
								maxLength={LY_DO_CAN_CHINH.canCuToiDa}
								aria-invalid={loiCanCu || undefined}
								disabled={dangGui}
								value={canCu}
								onChange={(e) => setCanCu(e.target.value)}
							/>
							{loiCanCu ? (
								<FieldError data-loi-can-cu>{h.loiCanCuCanChinh}</FieldError>
							) : (
								<FieldDescription>{h.canCuCanChinhMoTa}</FieldDescription>
							)}
						</Field>
						<Field orientation="horizontal">
							<FieldTitle>{h.mucTinCanChinh}</FieldTitle>
							<StatusIndicator
								data-muc-tin={mucTin}
								label={m.sheet.mucTin[mucTin]}
								size="sm"
								tone={toneTheoNghia(NGHIA_MUC_TIN[mucTin])}
							/>
						</Field>
						{loi ? <FieldError>{loi}</FieldError> : null}
					</FieldGroup>
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={dangGui}>
							{h.huy}
						</Button>
					</DialogClose>
					<Button
						type="submit"
						form={`${ma}-form`}
						data-nut="gui-can-chinh"
						disabled={!guiDuoc}
					>
						{dangGui ? <Spinner /> : null}
						{cheDo.loai === "sua" ? h.luu : h.gan}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
