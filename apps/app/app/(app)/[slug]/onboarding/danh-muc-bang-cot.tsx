"use client";

import { Board, type BoardColumn } from "@crm/ui/components/board";
import { useLocale } from "@crm/ui/components/locale-provider";
import Link from "next/link";
import { keHoachNoiMessages } from "@/lib/messages/ke-hoach-noi";
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

const COT_XONG = "";

const COT_CHUA_GIAO = "chua-giao";

type NhanCot = { label: string; userLabel: boolean };

const BAC_PHEU = [
	"chua-tai-khoan",
	"co-tai-khoan",
	"khoa-hoc",
	"hoat-dong",
	"giao-dich",
] as const;

function nhanCot(
	m: Messages,
	cachChia: DanhMucCachChia,
	cot: BangCotCot,
	chuaGiao: string,
): NhanCot {
	if (cot.khoa === COT_XONG && cot.nhan === null) {
		return { label: m.board.xong, userLabel: false };
	}
	if (cachChia === "bac") {
		const bac = BAC_PHEU.find((k) => k === cot.khoa);
		return { label: bac ? m.board.bac[bac] : cot.khoa, userLabel: false };
	}
	if (cachChia === "nguoi-giao" && cot.khoa === COT_CHUA_GIAO) {
		return { label: chuaGiao, userLabel: false };
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
	const chuaGiao = keHoachNoiMessages(useLocale()).danhMuc.chuaGiao;
	const columns: BoardColumn[] = cot.map((c) => ({
		id: c.khoa,
		...nhanCot(m, cachChia, c, chuaGiao),
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
