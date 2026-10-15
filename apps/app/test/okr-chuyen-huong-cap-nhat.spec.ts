import { describe, expect, mock, test } from "bun:test";

class ChuyenHuong extends Error {
	constructor(readonly dich: string) {
		super(`chuyen huong toi ${dich}`);
	}
}

const dieuHuongThat = await import("next/navigation");

mock.module("next/navigation", () => ({
	...dieuHuongThat,
	redirect: (dich: string) => {
		throw new ChuyenHuong(dich);
	},
}));

const { default: TrangCu } = await import(
	"@/app/(app)/[slug]/okr/cap-nhat-tuan/page"
);

type Vao = Record<string, string | string[] | undefined>;

async function dichDen(slug: string, vao: Vao): Promise<string> {
	try {
		await TrangCu({
			params: Promise.resolve({ slug }),
			searchParams: Promise.resolve(vao),
		});
	} catch (loi) {
		if (loi instanceof ChuyenHuong) return loi.dich;
		throw loi;
	}
	throw new Error("khong chuyen huong — trang cu van tra noi dung");
}

function kyVong(slug: string, vao: Vao): string {
	const q = new URLSearchParams();
	for (const [k, v] of Object.entries(vao))
		for (const x of Array.isArray(v) ? v : v === undefined ? [] : [v])
			q.append(k, x);
	const s = q.toString();
	return s ? `/${slug}/okr?${s}` : `/${slug}/okr`;
}

const MA_TRAN: [string, Vao, string][] = [
	["rong", {}, "/ws/okr"],
	["tu nhac", { tu: "nhac" }, "/ws/okr?tu=nhac"],
	["tu nhac + ky", { tu: "nhac", kyOkr: "k1" }, "/ws/okr?tu=nhac&kyOkr=k1"],
	[
		"ky + don",
		{ kyOkr: "k1", donOkr: "bp:x" },
		"/ws/okr?kyOkr=k1&donOkr=bp%3Ax",
	],
	["tham so la", { la: "1" }, "/ws/okr?la=1"],
	["don dang mang", { donOkr: ["a", "b"] }, "/ws/okr?donOkr=a&donOkr=b"],
];

describe("ctbp-chuyen-huong", () => {
	test("ctbp-chuyen-huong: duong cu /okr/cap-nhat-tuan ve Cua toi, giu moi tham so va thu tu, 6 o", async () => {
		const ket: [string, string][] = [];
		for (const [ten, vao, mong] of MA_TRAN) {
			const dich = await dichDen("ws", vao);
			if (dich !== mong)
				throw new Error(`ctbp-chuyen-huong: dich «${dich}», mong «${mong}»`);
			ket.push([ten, dich]);
		}
		expect(ket).toEqual(MA_TRAN.map(([ten, , dich]) => [ten, dich]));
		for (const [, vao, dich] of MA_TRAN) expect(kyVong("ws", vao)).toBe(dich);
	});
});
