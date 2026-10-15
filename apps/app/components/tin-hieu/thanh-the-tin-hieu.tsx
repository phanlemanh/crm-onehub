"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import Link from "next/link";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";

export type TheTinHieu = "cua-toi" | "tat-ca";

export function ThanhTheTinHieu({
	the,
	laQuanTri,
	hrefCuaToi,
	hrefTatCa,
}: {
	the: TheTinHieu;
	laQuanTri: boolean;
	hrefCuaToi: string;
	hrefTatCa: string;
}) {
	const m = tinHieuMessages(useLocale()).the;
	if (!laQuanTri) return null;
	const muc = [
		{ id: "cua-toi" as const, nhan: m.cuaToi, href: hrefCuaToi },
		{ id: "tat-ca" as const, nhan: m.tatCa, href: hrefTatCa },
	];
	return (
		<Tabs value={the}>
			<TabsList aria-label={m.nhan} variant="line">
				{muc.map((x) => (
					<TabsTrigger asChild key={x.id} value={x.id}>
						<Link
							aria-current={x.id === the ? "page" : undefined}
							data-the-tin-hieu={x.id}
							href={x.href}
						>
							{x.nhan}
						</Link>
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}
