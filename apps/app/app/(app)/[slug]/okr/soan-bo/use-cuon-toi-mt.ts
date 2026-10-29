"use client";

import { parseAsString, useQueryState } from "nuqs";
import { type RefObject, useEffect } from "react";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export function useCuonToiMucTieu(goc: RefObject<HTMLElement | null>): void {
	const [soanMt, datSoanMt] = useQueryState(
		SEARCH_PARAM.okr.soanMt,
		parseAsString,
	);
	useEffect(() => {
		if (soanMt === null) return;
		const khoi = goc.current?.querySelector<HTMLElement>(
			`[data-dong-mt="${CSS.escape(soanMt)}"]`,
		);
		if (khoi) {
			const giam = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;
			khoi.scrollIntoView({
				block: "start",
				behavior: giam ? "auto" : "smooth",
			});
		}
		void datSoanMt(null);
	}, [soanMt, goc, datSoanMt]);
}
