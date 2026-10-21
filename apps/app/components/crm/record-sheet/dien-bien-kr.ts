"use client";

import { parseAsString, useQueryStates } from "nuqs";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useOpenRecord } from "./record-stack";

export const TAB_SO_NGUON = "so-nguon";

const thamSo = {
	[SEARCH_PARAM.record.tab]: parseAsString,
	[SEARCH_PARAM.okr.kr]: parseAsString,
};

export function useKrDienBien() {
	const [url, dat] = useQueryStates(thamSo);
	return {
		krId: url[SEARCH_PARAM.okr.kr],
		chonKr: (id: string) => void dat({ [SEARCH_PARAM.okr.kr]: id }),
	};
}

export function useMoNganKr() {
	const openRecord = useOpenRecord();
	const [, dat] = useQueryStates(thamSo);
	return (keyResultId: string, tab: string | null = null) => {
		openRecord({ kind: "kr", id: keyResultId });
		if (tab !== null) void dat({ [SEARCH_PARAM.record.tab]: tab });
	};
}

export function useMoDienBien() {
	const moNganKr = useMoNganKr();
	return (_objectiveId: string, keyResultId: string) => moNganKr(keyResultId);
}
