import { describe, expect, test } from "bun:test";
import { parse } from "node:querystring";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import { prepareDestination } from "next/dist/shared/lib/router/utils/prepare-destination";
import nextConfig from "../next.config";

type Luat = { source: string; destination: string; permanent?: boolean };
type BoRewrite = {
	beforeFiles?: Luat[];
	afterFiles?: Luat[];
	fallback?: Luat[];
};

async function dsRedirect(): Promise<Luat[]> {
	return ((await nextConfig.redirects?.()) ?? []) as Luat[];
}

async function dsRewrite(): Promise<Luat[]> {
	const ra = (await nextConfig.rewrites?.()) as Luat[] | BoRewrite | undefined;
	if (!ra) return [];
	if (Array.isArray(ra)) return ra;
	return [
		...(ra.beforeFiles ?? []),
		...(ra.afterFiles ?? []),
		...(ra.fallback ?? []),
	];
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

function khop(luat: Luat, duong: string) {
	const [ten = ""] = duong.split(/[?#]/);
	return getPathMatch(luat.source, {
		strict: true,
		removeUnnamedParams: true,
	})(ten);
}

function dichTheo(luat: Luat, duong: string): string | null {
	const [truocHash = ""] = duong.split("#");
	const [, chuoi = ""] = truocHash.split("?");
	const thamSo = khop(luat, duong);
	if (!thamSo) return null;
	const { parsedDestination } = oMayChu(() =>
		prepareDestination({
			appendParamsToQuery: false,
			destination: luat.destination,
			params: thamSo,
			query: parse(chuoi),
		}),
	);
	const q = new URLSearchParams();
	for (const [k, v] of Object.entries(parsedDestination.query))
		for (const x of Array.isArray(v) ? v : v === undefined ? [] : [v])
			q.append(k, String(x));
	const s = q.toString();
	return `${parsedDestination.pathname}${s ? `?${s}` : ""}${parsedDestination.hash ?? ""}`;
}

const DUONG_CU: [string, string, string, boolean][] = [
	[
		"/okr/theo-don-vi",
		"/ws/okr/theo-don-vi?xemOkr=hop-tuan&donOkr=pb%3Ad1&kyOkr=k1",
		"/ws/okr/bo-okr?xemOkr=hop-tuan&donOkr=pb%3Ad1&kyOkr=k1",
		true,
	],
	["/okr/hoi-y", "/ws/okr/hoi-y?kyOkr=k1", "/ws/okr/lay-y-kien?kyOkr=k1", true],
	[
		"/okr/toan-canh",
		"/ws/okr/toan-canh?kyOkr=k1&donOkr=bp%3Ab1",
		"/ws/okr/suc-khoe?kyOkr=k1&donOkr=bp%3Ab1",
		true,
	],
	[
		"/okr/toan-canh/suc-khoe",
		"/ws/okr/toan-canh/suc-khoe?kyOkr=k1",
		"/ws/okr/suc-khoe?kyOkr=k1#chuong-trinh",
		true,
	],
	[
		"/okr/quanh-muc-tieu/:id",
		"/ws/okr/quanh-muc-tieu/m1?kyOkr=k1",
		"/ws/okr/so-do/muc-tieu/m1?kyOkr=k1",
		true,
	],
	[
		"/okr/cap-nhat-tuan",
		"/ws/okr/cap-nhat-tuan?tu=nhac",
		"/ws/okr?tu=nhac",
		false,
	],
];

const DUONG_MOI: [string, string, string][] = [
	["/okr/bo-okr", "/ws/okr/bo-okr", "/ws/okr/theo-don-vi"],
	["/okr/lay-y-kien", "/ws/okr/lay-y-kien", "/ws/okr/hoi-y"],
	["/okr/suc-khoe", "/ws/okr/suc-khoe", "/ws/okr/toan-canh"],
	[
		"/okr/so-do/muc-tieu/:id",
		"/ws/okr/so-do/muc-tieu/m1",
		"/ws/okr/quanh-muc-tieu/m1",
	],
];

const MAU_THAM_SO: Record<string, string> = { slug: "ws", id: "m1" };

function mauDuong(luatDuong: string): string {
	const [ten = ""] = luatDuong.split(/[?#]/);
	return ten.replace(/:([A-Za-z]+)/g, (_, k: string) => MAU_THAM_SO[k] ?? k);
}

function tenSauOkr(duong: string): string {
	const i = duong.indexOf("/okr/");
	return i >= 0 ? duong.slice(i + 5) : duong;
}

describe("vkm-chuyen-huong", () => {
	test("vkm-chuyen-huong: sau duong cu, moi duong dung mot redirect toi dung dich, giu truy van", async () => {
		const ds = await dsRedirect();
		const ket: [string, string | null][] = [];
		for (const [ten, vao, mong, vinhVien] of DUONG_CU) {
			const trung = ds.filter((r) => khop(r, vao));
			if (trung.length === 0)
				throw new Error(`vkm-chuyen-huong: thieu chuyen huong ${ten}`);
			if (trung.length > 1)
				throw new Error(
					`vkm-chuyen-huong: ${trung.length} chuyen huong cung bat ${ten}`,
				);
			const [luat] = trung as [Luat];
			const dich = dichTheo(luat, vao);
			if (dich !== mong)
				throw new Error(
					`vkm-chuyen-huong: ${ten} toi «${dich}», mong «${mong}»`,
				);
			if ((luat.permanent ?? false) !== vinhVien)
				throw new Error(
					`vkm-chuyen-huong: ${ten} permanent ${String(luat.permanent)}, mong ${String(vinhVien)}`,
				);
			ket.push([ten, dich]);
		}
		expect(ket).toEqual(DUONG_CU.map(([ten, , mong]) => [ten, mong]));
	});

	test("vkm-chuyen-huong: bon duong moi, moi duong dung mot rewrite ve thu muc cu", async () => {
		const ds = await dsRewrite();
		const ket: [string, string | null][] = [];
		for (const [ten, vao, mong] of DUONG_MOI) {
			const trung = ds.filter((r) => khop(r, vao));
			if (trung.length !== 1)
				throw new Error(
					`vkm-chuyen-huong: ${trung.length} rewrite cho ${ten}, mong 1`,
				);
			const dich = dichTheo(trung[0] as Luat, vao);
			if (dich !== mong)
				throw new Error(
					`vkm-chuyen-huong: rewrite ${ten} toi «${dich}», mong «${mong}»`,
				);
			ket.push([ten, dich]);
		}
		expect(ket).toEqual(DUONG_MOI.map(([ten, , mong]) => [ten, mong]));
	});

	test("vkm-chuyen-huong: khong dich nao cua redirect la nguon cua redirect khac", async () => {
		const ds = await dsRedirect();
		for (const r of ds) {
			const dich = mauDuong(r.destination);
			const tiep = ds.filter((s) => s !== r && khop(s, dich));
			if (tiep.length > 0)
				throw new Error(
					`vkm-chuyen-huong: chuoi chuyen huong ${tenSauOkr(dich)} (${r.source} → ${r.destination} → ${tiep[0]?.destination})`,
				);
		}
		expect(ds.length).toBeGreaterThanOrEqual(DUONG_CU.length);
	});

	test("vkm-chuyen-huong: khong rewrite nao co nguon bi redirect bat", async () => {
		const chuyen = await dsRedirect();
		const viet = await dsRewrite();
		for (const w of viet) {
			const mau = mauDuong(w.source);
			const bat = chuyen.find((r) => r.source === w.source || khop(r, mau));
			if (bat)
				throw new Error(
					`vkm-chuyen-huong: rewrite ${w.source} trung redirect ${bat.source}`,
				);
		}
		expect(viet.length).toBeGreaterThanOrEqual(DUONG_MOI.length);
	});
});
