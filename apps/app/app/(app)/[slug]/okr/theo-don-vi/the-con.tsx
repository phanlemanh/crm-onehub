"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import Link from "next/link";
import { okrMessages } from "@/lib/messages/okr";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { type CachXem, type DonChonOkr, khoaDon } from "../okr-search-params";

const THU_TU_THE = ["danh-sach", "hop-tuan", "viec", "cay"] as const;

export function cacThe(coCham: boolean): CachXem[] {
	return coCham ? [...THU_TU_THE, "cham"] : [...THU_TU_THE];
}

export function hrefThe({
	goc,
	don,
	ky,
	the,
}: {
	goc: string;
	don: DonChonOkr;
	ky: string | null;
	the: CachXem;
}) {
	const q = new URLSearchParams({ [SEARCH_PARAM.okr.don]: khoaDon(don) });
	if (ky) q.set(SEARCH_PARAM.okr.ky, ky);
	if (the !== "danh-sach") q.set(SEARCH_PARAM.okr.xem, the);
	return `${goc}?${q.toString()}`;
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
	const m = okrVoKhuMessages(locale).boOkr.the;
	const nhan = {
		"danh-sach": m["danh-sach"],
		"hop-tuan": okrToanCanhMessages(locale).hopTuan.cachXem,
		viec: m.viec,
		cay: okrMessages(locale).cayCanChinh,
		cham: okrKhepMessages(locale).cham.cachXem,
	} satisfies Record<CachXem, string>;
	const goc = useWorkspaceUrl()("/okr/bo-okr");
	return (
		<Tabs value={xem}>
			<div className="max-w-full overflow-x-auto" data-the-con-bo="">
				<TabsList aria-label={m.nhan} variant="line">
					{cacThe(coCham).map((the) => (
						<TabsTrigger asChild key={the} value={the}>
							<Link
								aria-current={xem === the ? "page" : undefined}
								data-the={the}
								href={hrefThe({ goc, don, ky, the })}
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
