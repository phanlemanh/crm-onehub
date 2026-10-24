import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { BanChup } from "./chup-tin-nhac";

const TEP_CAP = join(
	import.meta.dir,
	"../../../../_acceptance/bam-kr-mo-chi-tiet-kr/rang/cap-chu.json",
);
const TIN_NHAC = "apps/agent/agent/lib/tin-nhac.ts";

type CapChu = { tep: string; cu: string; moi: string };

function giaTri(dong: string): string {
	const m = /:\s*"(.*)"$/.exec(dong);
	if (!m?.[1]) throw new Error(`cap-chu: khong doc duoc gia tri «${dong}»`);
	return m[1];
}

export function capTinNhac(): [string, string][] {
	const cap = JSON.parse(readFileSync(TEP_CAP, "utf8")) as CapChu[];
	return cap
		.filter((c) => c.tep === TIN_NHAC)
		.map((c): [string, string] => [giaTri(c.cu), giaTri(c.moi)])
		.sort((a, b) => b[0].length - a[0].length);
}

export function theoCapChu(ban: BanChup): BanChup {
	const cap = capTinNhac();
	const thay = (chu: string) =>
		cap.reduce((kq, [cu, moi]) => kq.split(cu).join(moi), chu);
	return Object.fromEntries(
		Object.entries(ban).map(([loai, b]) => [
			loai,
			{ zalo: thay(b.zalo), slack: thay(b.slack), duong: b.duong },
		]),
	);
}
