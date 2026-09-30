import { createParser } from "nuqs";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export type NguonChuyenOkr = { level: "phong-ban" | "bo-phan"; id: string };

const TIEN_TO = { "phong-ban": "pb", "bo-phan": "bp" } as const;

const vietNguon = (n: NguonChuyenOkr): string => `${TIEN_TO[n.level]}:${n.id}`;

export const parseAsNguonChuyenOkr = createParser<NguonChuyenOkr>({
	parse: (v) => {
		const [loai, id, ...du] = v.split(":");
		if (!id || du.length > 0) return null;
		if (loai === "pb") return { level: "phong-ban", id };
		if (loai === "bp") return { level: "bo-phan", id };
		return null;
	},
	serialize: vietNguon,
	eq: (a, b) => vietNguon(a) === vietNguon(b),
});

export const chuyenOkrParsers = {
	[SEARCH_PARAM.toChuc.chuyenOkr]: parseAsNguonChuyenOkr,
};
