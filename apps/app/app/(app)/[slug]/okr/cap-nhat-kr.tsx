"use client";

import { useMutation } from "@tanstack/react-query";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { HopThoaiCapNhatKr, krCapNhatTuSheet } from "./hop-thoai-cap-nhat-kr";
import type { KetQua } from "./kieu";
import { lanTruocTuVet } from "./lan-truoc-kr";

type ChiTiet = RouterOutputs["okr"]["objective"];

type Hop = {
	lan: number;
	mt: ChiTiet;
	kr: KetQua;
	sessionId: string | null;
};

export function coTheCapNhat(mt: ChiTiet, kr: KetQua): boolean {
	return kr.hienTaiQuaCapNhat && mt.canEditKr.includes(kr.id);
}

export function coNutCapNhat(mt: ChiTiet, kr: KetQua): boolean {
	return coTheCapNhat(mt, kr) && mt.kyGhiDuoc && mt.status !== "da-bo";
}

export type CapNhatKr = {
	mo: (mt: ChiTiet, kr: KetQua) => void;
	hop: ReactNode;
};

export function useCapNhatKr(
	tuyChon: { onDaGui?: (keyResultId: string) => void } = {},
): CapNhatKr {
	const trpc = useTRPC();
	const [hop, setHop] = useState<Hop | null>(null);
	const lanMo = useRef(0);
	const nutMo = useRef<HTMLElement | null>(null);
	const moPhien = useMutation(trpc.okr.moCapNhat.mutationOptions());
	const goiMo = moPhien.mutate;

	const mo = useCallback(
		(mt: ChiTiet, kr: KetQua) => {
			lanMo.current += 1;
			const lan = lanMo.current;
			nutMo.current =
				document.activeElement instanceof HTMLElement
					? document.activeElement
					: null;
			setHop({ lan, mt, kr, sessionId: null });
			goiMo(
				{ entry: "sheet" },
				{
					onSuccess: ({ sessionId }) =>
						setHop((cu) => (cu?.lan === lan ? { ...cu, sessionId } : cu)),
				},
			);
		},
		[goiMo],
	);

	const noiDung = hop ? (
		<HopThoaiCapNhatKr
			key={hop.lan}
			kr={krCapNhatTuSheet(hop.mt, hop.kr)}
			lanTruoc={lanTruocTuVet(hop.mt.trail, hop.kr.id)}
			chuTen={hop.kr.owner.name}
			ghiHo={!hop.kr.laCuaToi}
			sessionId={hop.sessionId}
			loiMo={moPhien.isError}
			moLai={() => mo(hop.mt, hop.kr)}
			dong={() => {
				setHop(null);
				const nut = nutMo.current;
				requestAnimationFrame(() => {
					if (nut?.isConnected) nut.focus();
				});
			}}
			onDaGui={tuyChon.onDaGui}
		/>
	) : null;

	return { mo, hop: noiDung };
}
