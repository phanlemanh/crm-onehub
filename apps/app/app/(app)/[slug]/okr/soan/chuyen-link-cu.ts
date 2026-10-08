"use client";

import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { useParams, useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { duongTrangSoan } from "./luat-ban-nhap";

export function useChuyenLinkCuSoan(): void {
	const [cuocSoan] = useQueryState(SEARCH_PARAM.okr.cuocSoan, parseAsString);
	const router = useRouter();
	const { slug } = useParams<{ slug: string }>();
	useMountEffect(() => {
		if (cuocSoan) router.replace(duongTrangSoan(slug, cuocSoan));
	});
}
