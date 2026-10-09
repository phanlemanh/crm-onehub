"use client";

import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export function useChuyenLinkCuSoan(): void {
	const [q] = useQueryStates({
		[SEARCH_PARAM.okr.cuocSoan]: parseAsString,
		[SEARCH_PARAM.record.stack]: parseAsArrayOf(parseAsString, ",").withDefault(
			[],
		),
	});
	const router = useRouter();
	const duong = usePathname();
	const thamSo = useSearchParams();
	const cuocSoan = q[SEARCH_PARAM.okr.cuocSoan];
	const chong = q[SEARCH_PARAM.record.stack];
	useMountEffect(() => {
		if (!cuocSoan) return;
		const khoa = `soan:${cuocSoan}`;
		const moi = new URLSearchParams(thamSo.toString());
		moi.delete(SEARCH_PARAM.okr.cuocSoan);
		moi.set(
			SEARCH_PARAM.record.stack,
			[...chong.filter((muc) => muc !== khoa), khoa].join(","),
		);
		router.replace(`${duong}?${moi.toString()}`);
	});
}
