"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import Link from "next/link";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { type CachXem, type DonChonOkr, khoaDon } from "../okr-search-params";
import { DUONG_SO_DO } from "../tab-okr";

const THE_SO_DO = "so-do";
const THU_TU_THE = ["danh-sach", "hop-tuan", "viec", THE_SO_DO] as const;

export type TheBo = CachXem | typeof THE_SO_DO;

export function cacThe(coCham: boolean): TheBo[] {
	return coCham ? [...THU_TU_THE, "cham"] : [...THU_TU_THE];
}

export function hrefThe({
	goc,
	soDo,
	don,
	ky,
	the,
}: {
	goc: string;
	soDo: string;
	don: DonChonOkr;
	ky: string | null;
	the: TheBo;
}) {
	if (the === THE_SO_DO) {
		const q = new URLSearchParams();
		if (don.loai !== "goc") q.set(SEARCH_PARAM.okr.moDonVi, khoaDon(don));
		if (ky) q.set(SEARCH_PARAM.okr.ky, ky);
		const s = q.toString();
		return s ? `${soDo}?${s}` : soDo;
	}
	const q = new URLSearchParams({ [SEARCH_PARAM.okr.don]: khoaDon(don) });
	if (ky) q.set(SEARCH_PARAM.okr.ky, ky);
	if (the !== "danh-sach") q.set(SEARCH_PARAM.okr.xem, the);
	return `${goc}?${q.toString()}`;
}

export function useGocBoOkr(): string {
	return useWorkspaceUrl()("/okr/bo-okr");
}

export function TheConBo({
	don,
	ky,
	xem,
	coCham,
}: {
	don: DonChonOkr;
	ky: string | null;
	xem: CachXem;
	coCham: boolean;
}) {
	const locale = useLocale();
	const vk = okrVoKhuMessages(locale);
	const m = vk.boOkr.the;
	const nhan = {
		"danh-sach": m["danh-sach"],
		"hop-tuan": okrToanCanhMessages(locale).hopTuan.cachXem,
		viec: m.viec,
		[THE_SO_DO]: vk.soDo.soDoGopVao,
		cham: okrKhepMessages(locale).cham.cachXem,
	} satisfies Record<TheBo, string>;
	const url = useWorkspaceUrl();
	const goc = url("/okr/bo-okr");
	const soDo = url(DUONG_SO_DO);
	return (
		<Tabs value={xem}>
			<div className="max-w-full overflow-x-auto" data-the-con-bo="">
				<TabsList aria-label={m.nhan} variant="line">
					{cacThe(coCham).map((the) => (
						<TabsTrigger asChild key={the} value={the}>
							<Link
								aria-current={xem === the ? "page" : undefined}
								data-the={the}
								href={hrefThe({ goc, soDo, don, ky, the })}
							>
								{nhan[the]}
							</Link>
						</TabsTrigger>
					))}
				</TabsList>
			</div>
		</Tabs>
	);
}
