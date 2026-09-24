"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { StatTile } from "@crm/ui/components/stat-tile";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import type { CayDuLieu } from "./kieu";

export function OSo({
	coverage,
	chonChuaCo,
	locChuaTruong,
	moChuaCo,
	doiLoc,
}: {
	coverage: CayDuLieu["coverage"];
	chonChuaCo: boolean;
	locChuaTruong: boolean;
	moChuaCo: () => void;
	doiLoc: () => void;
}) {
	const t = toChucMessages(useLocale());
	const m = t.oSo;
	const { members, withPrimary, departmentsWithoutHead } = coverage;
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-o-so>
			<p className="sr-only" aria-live="polite" data-do-phu>
				{dien(t.doPhu, {
					x: withPrimary,
					m: members,
					k: departmentsWithoutHead,
				})}
			</p>
			<StatTile
				data-o="chua-co"
				label={m.coPhongBan}
				value={`${withPrimary}/${members}`}
				action={dien(m.xemChuaCo, { n: members - withPrimary })}
				pressed={chonChuaCo}
				onClick={moChuaCo}
			/>
			<StatTile
				data-o="chua-truong"
				label={m.chuaTruong}
				value={departmentsWithoutHead}
				action={locChuaTruong ? m.boLoc : m.xemChuaTruong}
				pressed={locChuaTruong}
				onClick={doiLoc}
			/>
		</div>
	);
}
