import { createParser, parseAsStringLiteral } from "nuqs";
import { chuyenOkrParsers } from "@/components/okr/hop-chuyen-okr-search-params";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export type DonChon =
	| { loai: "goc" }
	| { loai: "bp"; id: string }
	| { loai: "pb"; id: string }
	| { loai: "chua-co" };

const vietDon = (d: DonChon): string =>
	d.loai === "goc" || d.loai === "chua-co" ? d.loai : `${d.loai}:${d.id}`;

export const parseAsDon = createParser<DonChon>({
	parse: (v) => {
		if (v === "goc") return { loai: "goc" };
		if (v === "chua-co") return { loai: "chua-co" };
		const [loai, id, ...du] = v.split(":");
		if ((loai === "bp" || loai === "pb") && id && du.length === 0)
			return { loai, id };
		return null;
	},
	serialize: vietDon,
	eq: (a, b) => vietDon(a) === vietDon(b),
});

export const toChucParsers = {
	[SEARCH_PARAM.toChuc.don]: parseAsDon,
	[SEARCH_PARAM.toChuc.loc]: parseAsStringLiteral(["chua-truong"] as const),
	...chuyenOkrParsers,
};
