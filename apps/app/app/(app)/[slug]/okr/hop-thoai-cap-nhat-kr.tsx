"use client";

import Renew from "@carbon/icons-react/es/Renew";
import UserFollow from "@carbon/icons-react/es/UserFollow";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { FieldGroup } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { mucCapNhat } from "@crm/validation/okr-cap-nhat";
import { useMutation } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { okrMessages } from "@/lib/messages/okr";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import {
	ChonTuTin,
	docGiaTri,
	type LanTruoc,
	loiSo,
	OGhiChu,
	OGiaTri,
	oBanDau,
} from "./cap-nhat-tuan/cap-nhat-tuan";
import type { KetQua, KrCapNhat } from "./kieu";

type ChiTiet = RouterOutputs["okr"]["objective"];

export function krCapNhatTuSheet(mt: ChiTiet, kr: KetQua): KrCapNhat {
	const lanCuoi = mt.trail
		.filter((v) => v.action === "cap-nhat-tuan" && v.keyResultId === kr.id)
		.reduce<ChiTiet["trail"][number] | null>(
			(moi, v) => (moi === null || v.at > moi.at ? v : moi),
			null,
		);
	const tuTin = mucCapNhat.shape.confidence.safeParse(
		lanCuoi?.after?.confidence,
	);
	return {
		keyResultId: kr.id,
		title: kr.title,
		objectiveId: mt.id,
		objectiveTitle: mt.title,
		unitName: mt.unitName,
		kind: kr.kind,
		unit: kr.unit,
		targetValue: kr.targetValue,
		currentValue: kr.currentValue,
		lastConfidence: tuTin.success ? tuTin.data : null,
		lastAt: lanCuoi?.at ?? null,
		updatedThisWeek: false,
	};
}

export function HopThoaiCapNhatKr({
	kr,
	chuTen,
	ghiHo,
	sessionId,
	loiMo,
	moLai,
	dong,
}: {
	kr: KrCapNhat;
	chuTen: string;
	ghiHo: boolean;
	sessionId: string | null;
	loiMo: boolean;
	moLai: () => void;
	dong: () => void;
}) {
	const locale = useLocale();
	const t = okrMessages(locale);
	const m = t.hopCapNhat;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ma = useId();
	const [o, setO] = useState(() => oBanDau(kr, locale));
	const gui = useMutation(
		trpc.okr.guiCapNhat.mutationOptions({
			onSuccess: async () => {
				toast.success(m.daGui);
				await cache.okr(kr.objectiveId, { settle: "record" });
				dong();
			},
		}),
	);

	const so = docGiaTri(kr, o.giaTri);
	const loi = loiSo(kr, so);
	const lan: LanTruoc | null = kr.lastAt === null ? null : "lan-truoc";
	const khoa = gui.isPending;
	const dangMo = sessionId === null && !loiMo;
	const sanSang =
		sessionId !== null && o.tuTin !== null && so !== null && loi === null;
	const loiMayChu =
		gui.error?.data?.httpStatus !== undefined && gui.error.data.httpStatus < 500
			? gui.error.message
			: t.capNhat.loiGui.mayChu;

	const guiDi = () => {
		if (
			!sanSang ||
			khoa ||
			sessionId === null ||
			o.tuTin === null ||
			so === null
		)
			return;
		gui.mutate({
			sessionId,
			items: [
				{
					keyResultId: kr.keyResultId,
					value: so,
					confidence: o.tuTin,
					note: o.ghiChu.trim(),
				},
			],
		});
	};

	return (
		<Dialog
			open
			onOpenChange={(mo) => {
				if (!mo && !khoa) dong();
			}}
		>
			<DialogContent data-hop-cap-nhat-kr={kr.keyResultId}>
				<DialogHeader>
					<DialogTitle>{m.tieuDe}</DialogTitle>
					<DialogDescription translate="no">{kr.title}</DialogDescription>
				</DialogHeader>
				{ghiHo ? (
					<Alert data-ghi-ho>
						<Icon icon={UserFollow} />
						<AlertTitle>
							{m.ghiHo} <span translate="no">{chuTen}</span>
						</AlertTitle>
						<AlertDescription>{m.ghiHoMoTa}</AlertDescription>
					</Alert>
				) : null}
				{loiMo ? (
					<Alert variant="destructive">
						<Icon icon={WarningAlt} />
						<AlertTitle>{m.loiMo}</AlertTitle>
						<AlertDescription>
							<Button onClick={moLai} size="sm" variant="outline">
								<Icon data-icon="inline-start" icon={Renew} />
								{m.moLai}
							</Button>
						</AlertDescription>
					</Alert>
				) : null}
				{gui.isError && !khoa ? (
					<Alert variant="destructive">
						<Icon icon={WarningAlt} />
						<AlertTitle>{t.capNhat.loiGui.title}</AlertTitle>
						<AlertDescription>
							{loiMayChu} {t.capNhat.loiGui.conNguyen}
						</AlertDescription>
					</Alert>
				) : null}
				<form
					id={`${ma}-form`}
					onSubmit={(e) => {
						e.preventDefault();
						guiDi();
					}}
				>
					<FieldGroup>
						<OGiaTri
							datGiaTri={(giaTri) => setO({ ...o, giaTri })}
							khoa={khoa}
							kr={kr}
							lan={lan}
							loi={loi}
							so={so}
							value={o.giaTri}
						/>
						<ChonTuTin
							datTuTin={(tuTin) => setO({ ...o, tuTin })}
							khoa={khoa}
							kr={kr}
							lan={lan}
							value={o.tuTin}
						/>
						<OGhiChu
							datGhiChu={(ghiChu) => setO({ ...o, ghiChu })}
							id={kr.keyResultId}
							khoa={khoa}
							value={o.ghiChu}
						/>
					</FieldGroup>
				</form>
				<DialogFooter>
					<Button disabled={khoa} onClick={dong} variant="outline">
						{m.huy}
					</Button>
					<Button
						data-nut="gui-cap-nhat-kr"
						disabled={!sanSang || khoa}
						form={`${ma}-form`}
						type="submit"
					>
						{khoa || dangMo ? <Spinner data-icon="inline-start" /> : null}
						{khoa ? t.capNhat.dangGui : dangMo ? m.dangMo : m.gui}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
