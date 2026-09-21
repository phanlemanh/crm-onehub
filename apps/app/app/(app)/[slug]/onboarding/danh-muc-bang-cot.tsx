"use client";

import { Board, type BoardColumn } from "@crm/ui/components/board";
import Link from "next/link";
import type { onboardingMessages } from "@/lib/messages/onboarding";
import type { DanhMucCachChia } from "./onboarding-search-params";

type Messages = ReturnType<typeof onboardingMessages>;

export type BangCotThe = {
	id: string;
	planId: string;
	tieuDe: string;
	phu: string | null;
	imNgay: number | null;
};

export type BangCotCot = {
	khoa: string;
	nhan: string | null;
	tong: number;
	the: BangCotThe[];
};

const COT_XONG = "xong";

type NhanCot = { label: string; userLabel: boolean };

function nhanCot(
	m: Messages,
	cachChia: DanhMucCachChia,
	cot: BangCotCot,
): NhanCot {
	if (cot.khoa === COT_XONG && cot.nhan === null) {
		return { label: m.board.xong, userLabel: false };
	}
	if (cachChia === "bac") {
		const bac = Object.entries(m.board.bac).find(([k]) => k === cot.khoa);
		return { label: bac?.[1] ?? cot.khoa, userLabel: false };
	}
	if (cachChia === "trang-thai") {
		return {
			label: cot.khoa === "da-dong" ? m.facets.closed : m.facets.running,
			userLabel: false,
		};
	}
	return { label: cot.nhan ?? cot.khoa, userLabel: true };
}

export function DanhMucBangCot({
	m,
	cachChia,
	cot,
	hrefCua,
}: {
	m: Messages;
	cachChia: DanhMucCachChia;
	cot: BangCotCot[];
	hrefCua: (planId: string) => string;
}) {
	const columns: BoardColumn[] = cot.map((c) => ({
		id: c.khoa,
		...nhanCot(m, cachChia, c),
		count: c.tong,
		cards: c.the.map((the) => ({
			id: the.id,
			href: hrefCua(the.planId),
			title: the.tieuDe,
			subtitle: the.phu,
			meta:
				the.imNgay !== null && the.imNgay > 0 ? (
					<span className="text-xs text-muted-foreground tabular-nums">
						{m.board.silent.replace("{n}", String(the.imNgay))}
					</span>
				) : null,
		})),
	}));

	return <Board columns={columns} label={m.board.label} linkComponent={Link} />;
}
