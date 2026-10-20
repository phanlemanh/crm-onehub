import { describe, expect, test } from "bun:test";
import { tachLoiConsole } from "./loi-console.mjs";

const NEN =
	'Error: Route "/[slug]": Next.js encountered uncached data during prerendering or a navigation.';

describe("vk7-man loi console", () => {
	test("loi tuyen chan cua /[slug] da do tren nen thi vao biet, khong vao moi", () => {
		expect(tachLoiConsole([NEN])).toEqual({ biet: [NEN], moi: [] });
	});

	test("cung thong diep o tuyen khac van la loi moi", () => {
		const khac = NEN.replace("/[slug]", "/[slug]/okr");
		expect(tachLoiConsole([khac]).moi).toEqual([khac]);
	});

	test("loi hydrat hay loi bat ky khac van la loi moi", () => {
		const hydrat =
			"A tree hydrated but some attributes of the server rendered HTML didn't match";
		expect(tachLoiConsole([NEN, hydrat])).toEqual({
			biet: [NEN],
			moi: [hydrat],
		});
	});
});
