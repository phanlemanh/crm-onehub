"use client";

import { parseAsString, useQueryStates } from "nuqs";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useOpenRecord } from "./record-stack";

export const TAB_DIEN_BIEN = "dien-bien";

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

export function useMoDienBien() {
	const openRecord = useOpenRecord();
	const [, dat] = useQueryStates(thamSo);
	return (objectiveId: string, keyResultId: string) => {
		openRecord({ kind: "objective", id: objectiveId });
		void dat({
			[SEARCH_PARAM.record.tab]: TAB_DIEN_BIEN,
			[SEARCH_PARAM.okr.kr]: keyResultId,
		});
	};
}
