import { describe, expect, mock, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse } from "node:querystring";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import { prepareDestination } from "next/dist/shared/lib/router/utils/prepare-destination";
import { isValidElement, type ReactElement, type ReactNode } from "react";

mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" }));
mock.module("@/lib/session", () => ({ requireSession: async () => null }));
mock.module("server-only", () => ({}));
mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));
mock.module("@/lib/trpc/hydrate", () => ({
	HydrateClient: ({ children }: { children: ReactNode }) => children,
}));
mock.module("@/lib/trpc/server", () => ({
	getServerTrpc: () => ({}),
	getServerQueryClient: () => ({}),
}));

const GOC_APP = resolve(import.meta.dir, "..");
const GOC_KHO = resolve(GOC_APP, "../..");
const O = join(GOC_APP, "app/(app)/[slug]/okr");

const { default: nextConfig } = await import("../next.config");
const { duongSoDoTuSucKhoe, duongSoDoTuBoOkr } = await import(
	"@/app/(app)/[slug]/okr/so-do/duong-so-do"
);
const { default: ToanCanhPage } = await import(
	"@/app/(app)/[slug]/okr/toan-canh/page"
);

type Luat = { source: string; destination: string };

function dichTheo(luat: Luat, duong: string): string | null {
	const [ten = "", chuoi = ""] = duong.split("?");
	const thamSo = getPathMatch(luat.source, {
		strict: true,
		removeUnnamedParams: true,
	})(ten);
	if (!thamSo) return null;
	const g = globalThis as { window?: unknown };
	const cu = g.window;
	g.window = undefined;
	try {
		const { parsedDestination } = prepareDestination({
			appendParamsToQuery: false,
			destination: luat.destination,
			params: thamSo,
			query: parse(chuoi),
		});
		return parsedDestination.pathname ?? null;
	} finally {
		g.window = cu;
	}
}

async function dsLuat() {
	const r = ((await nextConfig.redirects?.()) ?? []) as Luat[];
	const rw = (await nextConfig.rewrites?.()) as
		| { afterFiles?: Luat[]; beforeFiles?: Luat[]; fallback?: Luat[] }
		| undefined;
	return {
		r,
		rw: [
			...(rw?.beforeFiles ?? []),
			...(rw?.afterFiles ?? []),
			...(rw?.fallback ?? []),
		],
	};
}

type NutCay = ReactElement<{ children?: ReactNode }>;

function timThanhPhan(nut: ReactNode, ten: string): NutCay | null {
	if (Array.isArray(nut)) {
		for (const n of nut) {
			const tim = timThanhPhan(n, ten);
			if (tim) return tim;
		}
		return null;
	}
	if (!isValidElement(nut)) return null;
	const e = nut as NutCay;
	if (typeof e.type === "function" && e.type.name === ten) return e;
	return timThanhPhan(e.props.children, ten);
}

async function dichCuaTrangSucKhoe(
	thamSo: Record<string, string>,
): Promise<string | null> {
	const cay = ToanCanhPage({
		params: Promise.resolve({ slug: "ws" }),
		searchParams: Promise.resolve(thamSo),
	});
	const chuyen = timThanhPhan(cay, "ChuyenSoDoCu");
	if (!chuyen) return "khong co lop chuyen";
	try {
		await (chuyen.type as (p: unknown) => Promise<null>)(chuyen.props);
		return null;
	} catch (e) {
		const digest = (e as { digest?: string }).digest ?? "";
		if (!digest.startsWith("NEXT_REDIRECT")) throw e;
		return digest.split(";")[2] ?? null;
	}
}

function git(...lenh: string[]): string {
	const r = Bun.spawnSync(["git", "-C", GOC_KHO, ...lenh]);
	if (r.exitCode !== 0)
		throw new Error(`git ${lenh.join(" ")}: ${r.stderr.toString()}`);
	return r.stdout.toString();
}

function tepDuoi(thuMuc: string): string[] {
	return readdirSync(thuMuc).flatMap((t) => {
		const p = join(thuMuc, t);
		return statSync(p).isDirectory() ? tepDuoi(p) : [p];
	});
}

describe("vk6-duong-cu", () => {
	test("vk6-duong-cu: năm ca qua lớp chuyển thật", async () => {
		const ket: string[] = [];
		const { r, rw } = await dsLuat();

		const quanh = r
			.map((l) => dichTheo(l, "/ws/okr/quanh-muc-tieu/m1"))
			.find((d) => d !== null);
		const veThuMuc = rw
			.map((l) => dichTheo(l, "/ws/okr/so-do/muc-tieu/m1"))
			.find((d) => d !== null);
		const trangQuanh = readFileSync(
			join(O, "quanh-muc-tieu/[objectiveId]/page.tsx"),
			"utf8",
		);
		const trangSoDo = readFileSync(join(O, "so-do/page.tsx"), "utf8");
		const chungMan =
			trangQuanh.includes("so-do/man-so-do") &&
			trangSoDo.includes("./man-so-do") &&
			!/PageShell\b|PageShellHeader/.test(trangQuanh);
		ket.push(
			quanh === "/ws/okr/so-do/muc-tieu/m1" &&
				veThuMuc === "/ws/okr/quanh-muc-tieu/m1" &&
				chungMan
				? "DUNG trang-cu"
				: `SAI trang-cu: ${quanh} · ${veThuMuc} · chung man ${chungMan}`,
		);

		const mot = await dichCuaTrangSucKhoe({ xemToanCanh: "so-do" });
		ket.push(
			mot === "/ws/okr/so-do"
				? "DUNG so-do-tu-suc-khoe"
				: `SAI so-do-tu-suc-khoe: ${mot ?? "khong chuyen"}`,
		);

		const hai = await dichCuaTrangSucKhoe({
			xemToanCanh: "so-do",
			moDonVi: "pb:x",
			locSoDo: "chu-y",
		});
		const q = new URLSearchParams(hai?.split("?")[1] ?? "");
		ket.push(
			hai?.startsWith("/ws/okr/so-do?") &&
				q.get("moDonVi") === "pb:x" &&
				q.get("locSoDo") === "chu-y"
				? "DUNG giu-tham-so"
				: `SAI giu-tham-so: ${hai}`,
		);

		const khong = await dichCuaTrangSucKhoe({});
		const bang = await dichCuaTrangSucKhoe({ xemToanCanh: "bang" });
		ket.push(
			khong === null && bang === null
				? "DUNG khong-bat-nham"
				: `SAI khong-bat-nham: ${khong} · ${bang}`,
		);

		const goc = git("merge-base", "HEAD", "origin/onehub").trim();
		const doi = git(
			"diff",
			"--name-only",
			goc,
			"--",
			"apps/app/next.config.ts",
		);
		ket.push(doi.trim() === "" ? "DUNG next-config" : "SAI next-config-doi");

		expect(ket).toHaveLength(5);
		expect(ket.filter((k) => k.startsWith("SAI"))).toEqual([]);
	});

	test("vk6-duong-cu: Sức khoẻ thôi cách xem Sơ đồ", () => {
		const sai = tepDuoi(join(O, "toan-canh"))
			.filter((p) => /\.(ts|tsx)$/.test(p))
			.filter((p) => !p.endsWith("so-do-don-vi.tsx"))
			.filter((p) => {
				const s = readFileSync(p, "utf8");
				return /import\(["']\.\/so-do-don-vi["']\)|from ["']\.\/so-do-don-vi["']|xemToanCanh/.test(
					s,
				);
			});
		const thamSo = readFileSync(join(O, "okr-search-params.ts"), "utf8");
		expect(sai.map((p) => p.slice(O.length))).toEqual([]);
		expect(thamSo.includes("CACH_XEM_TOAN_CANH")).toBe(false);
	});

	test("vk6-duong-cu: ma trận hàm đường thuần", () => {
		const CA: [Record<string, string>, string | null][] = [
			[{}, null],
			[{ xemToanCanh: "bang" }, null],
			[{ xemToanCanh: "so-do" }, "/ws/okr/so-do"],
			[{ xemToanCanh: "so-do", kyOkr: "q4" }, "/ws/okr/so-do?kyOkr=q4"],
			[
				{ xemToanCanh: "so-do", moDonVi: "pb:a", locSoDo: "moi", kyOkr: "q4" },
				"/ws/okr/so-do?moDonVi=pb%3Aa&locSoDo=moi&kyOkr=q4",
			],
		];
		for (const [vao, mong] of CA)
			expect(`${JSON.stringify(vao)} → ${duongSoDoTuSucKhoe("ws", vao)}`).toBe(
				`${JSON.stringify(vao)} → ${mong}`,
			);
		const CAY: [Record<string, string>, string | null][] = [
			[{ xemOkr: "danh-sach" }, null],
			[{ xemOkr: "cay" }, "/ws/okr/so-do"],
			[{ xemOkr: "cay", donOkr: "goc" }, "/ws/okr/so-do"],
			[{ xemOkr: "cay", donOkr: "pb:a" }, "/ws/okr/so-do?moDonVi=pb%3Aa"],
			[
				{ xemOkr: "cay", donOkr: "pb:a", kyOkr: "q4" },
				"/ws/okr/so-do?moDonVi=pb%3Aa&kyOkr=q4",
			],
		];
		for (const [vao, mong] of CAY)
			expect(`${JSON.stringify(vao)} → ${duongSoDoTuBoOkr("ws", vao)}`).toBe(
				`${JSON.stringify(vao)} → ${mong}`,
			);
	});
});
