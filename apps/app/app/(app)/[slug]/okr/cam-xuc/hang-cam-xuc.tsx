"use client";

import { useLocale, useMessages } from "@crm/ui/components/locale-provider";
import {
	type LoaiTrongBo,
	type MucCamXuc,
	ThanhCamXuc,
} from "@crm/ui/components/thanh-cam-xuc";
import { LOAI_CAM_XUC, OKR_CAM_XUC } from "@crm/validation/okr-cam-xuc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { okrCapNhatGanDayMessages } from "@/lib/messages/okr-cap-nhat-gan-day";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";

export type TomTatCamXuc = RouterOutputs["okr"]["thaCamXuc"];
type LoaiCamXuc = TomTatCamXuc[number]["loai"];

const EMOJI = {
	"dong-y": "👍",
	"chuc-mung": "🎉",
	"co-len": "💪",
	"da-xem": "👀",
} as const satisfies Record<LoaiCamXuc, string>;

const laLoai = (v: string): v is LoaiCamXuc => v in EMOJI;

export function daoLacQuan(tom: TomTatCamXuc, loai: LoaiCamXuc): TomTatCamXuc {
	const co = tom.find((m) => m.loai === loai);
	if (co?.cuaToi) {
		return co.so <= 1
			? tom.filter((m) => m.loai !== loai)
			: tom.map((m) =>
					m.loai === loai ? { ...m, so: m.so - 1, cuaToi: false } : m,
				);
	}
	if (co)
		return tom.map((m) =>
			m.loai === loai ? { ...m, so: m.so + 1, cuaToi: true } : m,
		);
	return [...tom, { loai, so: 1, cuaToi: true, nguoi: [] }].sort(
		(a, b) => LOAI_CAM_XUC.indexOf(a.loai) - LOAI_CAM_XUC.indexOf(b.loai),
	);
}

export function HangCamXuc({
	checkInId,
	objectiveId,
	camXuc,
}: {
	checkInId: string;
	objectiveId: string;
	camXuc: TomTatCamXuc;
}) {
	const locale = useLocale();
	const m = okrCapNhatGanDayMessages(locale);
	const tenLoai = useMessages().camXuc.loai;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [ghiDe, setGhiDe] = useState<{
		goc: TomTatCamXuc;
		tom: TomTatCamXuc;
	} | null>(null);
	const [moBang, setMoBang] = useState(false);
	const tenDuQuery = useQuery({
		...trpc.okr.nguoiThaCamXuc.queryOptions({ checkInId }),
		enabled: moBang,
	});
	const tom = ghiDe && ghiDe.goc === camXuc ? ghiDe.tom : camXuc;
	const dao = useMutation(
		trpc.okr.thaCamXuc.mutationOptions({
			onMutate: (vao) => {
				setGhiDe({ goc: camXuc, tom: daoLacQuan(tom, vao.loai) });
			},
			onSuccess: async (moi) => {
				setGhiDe({ goc: camXuc, tom: moi });
				await cache.okr(objectiveId);
			},
			onError: (loi) => {
				setGhiDe(null);
				toast.error(m.chuaTha(loi.message));
			},
		}),
	);
	const bo: LoaiTrongBo[] = LOAI_CAM_XUC.map((loai) => ({
		loai,
		emoji: EMOJI[loai],
		ten: tenLoai[loai],
	}));
	const muc: MucCamXuc[] = tom.map((x) => ({
		loai: x.loai,
		emoji: EMOJI[x.loai],
		ten: tenLoai[x.loai],
		so: x.so,
		cuaToi: x.cuaToi,
		nguoi: x.nguoi.map((n) => n.name),
	}));
	const tenDu = tenDuQuery.data
		? Object.fromEntries(
				tenDuQuery.data.map((x) => [x.loai, x.nguoi.map((n) => n.name)]),
			)
		: undefined;
	return (
		<div className="pt-2" data-hang-cam-xuc={checkInId}>
			<ThanhCamXuc
				bo={bo}
				dangGui={dao.isPending}
				muc={muc}
				onDao={(loai) => {
					if (laLoai(loai)) dao.mutate({ checkInId, loai });
				}}
				onMoBang={() => setMoBang(true)}
				tenDu={tenDu}
				tenToiDa={OKR_CAM_XUC.tenToiDa}
			/>
		</div>
	);
}
