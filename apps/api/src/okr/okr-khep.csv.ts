import { boDau } from "../to-chuc/nhap";

const BOM = "\uFEFF";
const XUONG_DONG = "\r\n";
const DAU_CONG_THUC = ["=", "+", "-", "@", "\t", "\r"] as const;
const CAN_BOC = /[",\n\r]/;
const LA_SO = /^-?\d+(\.\d+)?(e[+-]\d+)?$/;

export type OCsv = string | number | null;

function viet(o: OCsv): string {
	if (o === null) return "";
	const tho = String(o);
	const congThuc =
		!LA_SO.test(tho) && DAU_CONG_THUC.some((d) => tho.startsWith(d));
	const chu = congThuc ? `'${tho}` : tho;
	return CAN_BOC.test(chu) ? `"${chu.replaceAll('"', '""')}"` : chu;
}

export function dungCsv(cot: readonly string[], dong: OCsv[][]): string {
	return (
		BOM + [cot, ...dong].map((d) => d.map(viet).join(",") + XUONG_DONG).join("")
	);
}

export function tenTepXuat(tenKy: string, ngay: string): string {
	const ten = boDau(tenKy)
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return `${["okr", ten, ngay].filter(Boolean).join("-")}.csv`;
}
