import { describe, expect, test } from "bun:test";
import { parse } from "node:querystring";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import { prepareDestination } from "next/dist/shared/lib/router/utils/prepare-destination";
import nextConfig from "../next.config";

const NGUON = "/:slug/okr/cap-nhat-tuan";

type ChuyenHuong = { source: string; destination: string; permanent?: boolean };

async function luatCu(): Promise<ChuyenHuong> {
	const ds = ((await nextConfig.redirects?.()) ?? []) as ChuyenHuong[];
	const luat = ds.find((r) => r.source === NGUON);
	if (!luat)
		throw new Error(
			`ctbp-chuyen-huong: next.config khong co redirect ${NGUON}`,
		);
	return luat;
}

function oMayChu<T>(lam: () => T): T {
	const g = globalThis as { window?: unknown };
	const cu = g.window;
	g.window = undefined;
	try {
		return lam();
	} finally {
		g.window = cu;
	}
}

async function dichTheo(
	luat: ChuyenHuong,
	duong: string,
): Promise<string | null> {
	const [ten = "", chuoi = ""] = duong.split("?");
	const khop = getPathMatch(luat.source, {
		strict: true,
		removeUnnamedParams: true,
	})(ten);
	if (!khop) return null;
	const { parsedDestination } = oMayChu(() =>
		prepareDestination({
			appendParamsToQuery: false,
			destination: luat.destination,
			params: khop,
			query: parse(chuoi),
		}),
	);
	const q = new URLSearchParams();
	for (const [k, v] of Object.entries(parsedDestination.query))
		for (const x of Array.isArray(v) ? v : v === undefined ? [] : [v])
			q.append(k, String(x));
	const s = q.toString();
	return s ? `${parsedDestination.pathname}?${s}` : parsedDestination.pathname;
}

const dichDen = async (duong: string) => dichTheo(await luatCu(), duong);

const MA_TRAN: [string, string, string][] = [
	["rong", "/ws/okr/cap-nhat-tuan", "/ws/okr"],
	["tu nhac", "/ws/okr/cap-nhat-tuan?tu=nhac", "/ws/okr?tu=nhac"],
	[
		"tu nhac + ky",
		"/ws/okr/cap-nhat-tuan?tu=nhac&kyOkr=k1",
		"/ws/okr?tu=nhac&kyOkr=k1",
	],
	[
		"ky + don",
		"/ws/okr/cap-nhat-tuan?kyOkr=k1&donOkr=bp%3Ax",
		"/ws/okr?kyOkr=k1&donOkr=bp%3Ax",
	],
	["tham so la", "/ws/okr/cap-nhat-tuan?la=1", "/ws/okr?la=1"],
	[
		"don dang mang",
		"/ws/okr/cap-nhat-tuan?donOkr=a&donOkr=b",
		"/ws/okr?donOkr=a&donOkr=b",
	],
];

const KHONG_BAT: string[] = [
	"/ws/okr/cap-nhat-tuan-x",
	"/ws/okr/cap-nhat-tuan/x",
	"/ws/okr",
	"/ws/okr/theo-don-vi",
];

describe("ctbp-chuyen-huong", () => {
	test("ctbp-chuyen-huong: duong cu /okr/cap-nhat-tuan ve Cua toi o may chu, giu moi tham so va thu tu, 6 o", async () => {
		const ket: [string, string | null][] = [];
		for (const [ten, vao, mong] of MA_TRAN) {
			const dich = await dichDen(vao);
			if (dich !== mong)
				throw new Error(`ctbp-chuyen-huong: dich «${dich}», mong «${mong}»`);
			ket.push([ten, dich]);
		}
		if ((await luatCu()).permanent !== false)
			throw new Error(
				"ctbp-chuyen-huong: chuyen huong vinh vien, mong tam thoi (permanent false)",
			);
		expect(ket).toEqual(MA_TRAN.map(([ten, , dich]) => [ten, dich]));
	});

	test("ctbp-chuyen-huong: doi chung — duong khac khong bi bat nham", async () => {
		const ds = ((await nextConfig.redirects?.()) ?? []) as ChuyenHuong[];
		for (const duong of KHONG_BAT)
			for (const luat of ds) {
				const dich = await dichTheo(luat, duong);
				if (dich !== null)
					throw new Error(`ctbp-chuyen-huong: bat nham ${duong} → ${dich}`);
			}
		expect(await dichDen("/ws/okr/cap-nhat-tuan?tu=nhac")).toBe(
			"/ws/okr?tu=nhac",
		);
	});
});
