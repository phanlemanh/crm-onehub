import type { CauHoi, LuotTroLy } from "./kieu";

const DONG_HOI = /^\s*\d+[.)]\s+(.+\?)\s*$/;
const DONG_GOI_Y = /^\s*[-•*]?\s*gợi ý:\s*(.+)$/i;

export function tachCauHoi(chu: string): CauHoi[] {
	const ra: CauHoi[] = [];
	for (const dong of chu.split("\n")) {
		const hoi = dong.match(DONG_HOI);
		if (hoi?.[1]) {
			ra.push({ hoi: hoi[1].trim(), goiY: [] });
			continue;
		}
		const goiY = dong.match(DONG_GOI_Y);
		const cuoi = ra.at(-1);
		if (goiY?.[1] && cuoi)
			cuoi.goiY = goiY[1]
				.split(/\s*[·|]\s*/)
				.map((g) => g.trim())
				.filter(Boolean);
	}
	return ra;
}

export function tachLuotTroLy(chu: string): LuotTroLy {
	const cauHoi = tachCauHoi(chu);
	if (cauHoi.length === 0) return { loiDan: chu, cauHoi };
	const loiDan = chu
		.split("\n")
		.filter((d) => !DONG_HOI.test(d) && !DONG_GOI_Y.test(d))
		.join("\n")
		.trim();
	return { loiDan, cauHoi };
}
