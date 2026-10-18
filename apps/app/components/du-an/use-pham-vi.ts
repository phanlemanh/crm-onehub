"use client";

import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useCallback } from "react";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import {
	docPhamVi,
	giaTriPhamVi,
	KIEU_XEM_VIEC,
	type KieuXemViec,
	kieuXemCua,
	type PhamVi,
} from "./pham-vi";

const THAM_SO = {
	[SEARCH_PARAM.viec.phamVi]: parseAsString,
	[SEARCH_PARAM.viec.xem]: parseAsStringLiteral(KIEU_XEM_VIEC),
};

export function usePhamVi() {
	const [tho, setTho] = useQueryStates(THAM_SO, { shallow: false });
	const phamVi = docPhamVi(tho[SEARCH_PARAM.viec.phamVi]);
	const xem = kieuXemCua(tho[SEARCH_PARAM.viec.xem], phamVi);
	const chonPhamVi = useCallback(
		(moi: PhamVi, kieu?: KieuXemViec) =>
			void setTho({
				[SEARCH_PARAM.viec.phamVi]: giaTriPhamVi(moi),
				[SEARCH_PARAM.viec.xem]: kieu ?? null,
			}),
		[setTho],
	);
	const chonXem = useCallback(
		(kieu: KieuXemViec) => void setTho({ [SEARCH_PARAM.viec.xem]: kieu }),
		[setTho],
	);
	return { phamVi, xem, chonPhamVi, chonXem };
}
