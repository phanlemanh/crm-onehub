"use client";

import {
	GiuContext,
	useChanLienKet,
	useGiuGoc,
} from "@crm/ui/components/giu-thay-doi";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef } from "react";

export function GiuTrangSoan({ children }: { children: ReactNode }) {
	const router = useRouter();
	const dich = useRef<string | null>(null);
	const giu = useGiuGoc({
		open: true,
		onOpenChange: (mo) => {
			if (!mo && dich.current) router.push(dich.current);
		},
		tuNhanThayDoi: false,
	});
	const coThayDoi = giu.coThayDoi;

	useEffect(() => {
		if (!coThayDoi) return;
		const hoi = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener("beforeunload", hoi);
		return () => window.removeEventListener("beforeunload", hoi);
	}, [coThayDoi]);

	const doiMo = giu.onOpenChange;
	const roi = useCallback(
		(toi: string) => {
			dich.current = toi;
			doiMo(false);
		},
		[doiMo],
	);
	useChanLienKet(coThayDoi, roi);

	return (
		<GiuContext.Provider value={giu.ngucCanh}>
			{children}
			{giu.hopHoi}
		</GiuContext.Provider>
	);
}
