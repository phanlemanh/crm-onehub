import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { OKR_MAU } from "../../../apps/api/scripts/okr-mau/cau-hinh.ts";
import { okrToanCanhMessages } from "../../../apps/app/lib/messages/okr-toan-canh.ts";
import { SEARCH_PARAM } from "../../../apps/app/lib/search-param-keys.ts";
import { db } from "../../../packages/db/src/index.ts";
import {
	APP,
	CHROME,
	datTrinhDuyet,
	khongDo,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	GOC,
	phienCua,
	trpcCua,
} from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";

const HO_SO = "hop-tuan-mo-dung-bo";
const { z } = createRequire(join(GOC, "packages/validation/package.json"))(
	"zod",
);
const GIAY_MS = 1000;
export const DO = {
	kho: [
		{ ten: "1440", rong: 1440, cao: 900, hang: 1 },
		{ ten: "375", rong: 375, cao: 812, hang: 2 },
	],
	theme: [
		{ ten: "sang", toi: false },
		{ ten: "toi", toi: true },
	],
	cho: {
		taiMs: 90 * GIAY_MS,
		dieuHuongMs: 45 * GIAY_MS,
		onDinhMs: 1500,
		nhipMs: 250,
		cuonMs: 300,
	},
	cuon: { soLan: 12, lePx: 40 },
	soDong: 7,
	soAnh: 12,
	soMucToiThieu: 2,
	soO: 4,
	lechPx: 1,
	khoiTran: 4000,
	toiDaChuyen: 5,
};
export const THAM = {
	ky: SEARCH_PARAM.okr.ky,
	don: SEARCH_PARAM.okr.don,
	xem: SEARCH_PARAM.okr.xem,
	loc: SEARCH_PARAM.okr.phamViBo,
};
export const HOP = "hop-tuan";
export const CHU = { viTri: "Bộ OKR", tieuDeKhu: "Mục tiêu" };
export const CAU_TUAN_DAU = okrToanCanhMessages("vi").hopTuan.tuanDau;
export const KHONG_KHONG = /(^|[^\d])0\/0([^\d]|$)/;
const AN_CONG_CU_DEV =
	".tsqd-parent-container, .tsqd-open-btn-container, nextjs-portal { display: none !important; }";
const caHopTuan = z.object({
	truongP: z.string().min(1),
	thanhVienM: z.string().min(1),
	quanTriA: z.string().min(1),
	boP: z.string().startsWith("pb:"),
	boRong: z.string().startsWith("pb:"),
	chuKyCon: z.string().min(1),
	chuKyKeHoach: z.string().min(1),
});
const DA_THONG_CONG = new Set(["signed-off", "machine-cleared"]);
const trangThaiHopDong = (
	readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8").match(
		/^status:\s*(\S+)/m,
	)?.[1] ?? ""
).trim();
export const BANG_CHUNG =
	process.env.BANG_CHUNG ??
	(DA_THONG_CONG.has(trangThaiHopDong)
		? join(GOC, ".acceptance-runs", HO_SO, "evidence")
		: join(GOC, "_acceptance", HO_SO, "evidence"));

export const nghi = (ms) => new Promise((xong) => setTimeout(xong, ms));
export const giaTriCo = (co) => {
	const i = process.argv.indexOf(co);
	return i === -1 ? undefined : process.argv[i + 1];
};

const dem = { dung: 0, sai: 0, soDong: 0 };
export const ketQua = () => ({ ...dem });
export function dong(ac, dat, ten, chu) {
	dem.soDong += 1;
	if (dat) dem.dung += 1;
	else dem.sai += 1;
	console.log(dat ? `DUNG ${ten}: ${chu}` : `SAI ${ac}: ${ten} ${chu}`);
}
export function dongDo(dat, ten, chu) {
	if (dat) dem.dung += 1;
	else dem.sai += 1;
	console.log(dat ? `DUNG ${ten}: ${chu}` : `SAI AC-9: ${ten} ${chu}`);
}

let trinhDuyet = null;
export async function moTrinhDuyet() {
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	datTrinhDuyet(trinhDuyet);
}
export async function moTrang(cookie, duong, kho, toi) {
	const ctx = await trinhDuyet.createBrowserContext();
	const t = await ctx.newPage();
	const host = new URL(APP).hostname;
	await t.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	await t.setViewport({ width: kho.rong, height: kho.cao });
	await t.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: toi ? "dark" : "light" },
	]);
	await t.evaluateOnNewDocument(
		(css, laToi) => {
			document.addEventListener("DOMContentLoaded", () => {
				const s = document.createElement("style");
				s.textContent = css;
				document.head.appendChild(s);
				if (laToi) {
					document.documentElement.classList.add("dark");
					document.documentElement.style.colorScheme = "dark";
				}
			});
		},
		AN_CONG_CU_DEV,
		toi,
	);
	await t.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: DO.cho.taiMs,
	});
	const dich = new URL(t.url()).pathname;
	if (dich.startsWith("/sign-in") || dich.includes("/onboarding"))
		await khongDo(`KHONG DO DUOC: ${duong} bi day ve ${dich}`);
	await t.bringToFront();
	return t;
}

export async function gacGoc(t, tenGoc) {
	await t.evaluateOnNewDocument((ten) => {
		const KHOA = "htmb-vi-tri-goc";
		const ghi = () => {
			for (const el of document.querySelectorAll("[data-vi-tri-bo]")) {
				const chu = el.textContent ?? "";
				if (chu.includes(ten)) {
					const cu = JSON.parse(sessionStorage.getItem(KHOA) ?? "[]");
					cu.push(`${location.pathname}${location.search} «${chu.trim()}»`);
					sessionStorage.setItem(KHOA, JSON.stringify(cu));
				}
			}
		};
		const gan = () => {
			ghi();
			new MutationObserver(ghi).observe(document.documentElement, {
				subtree: true,
				childList: true,
				characterData: true,
			});
		};
		if (document.documentElement) gan();
		else document.addEventListener("readystatechange", gan, { once: true });
	}, tenGoc);
}

export const docGoc = (t) =>
	t.evaluate(() =>
		JSON.parse(sessionStorage.getItem("htmb-vi-tri-goc") ?? "[]"),
	);

export const dongTrang = (t) => t.browserContext().close();

export async function cho(t, chon, ms = DO.cho.taiMs) {
	const thay = await t
		.waitForFunction(
			(c) =>
				[...document.querySelectorAll(c)].some(
					(el) =>
						el.getClientRects().length > 0 &&
						getComputedStyle(el).visibility !== "hidden" &&
						Object.keys(el).some((k) => k.startsWith("__reactFiber")),
				),
			{ timeout: ms, polling: DO.cho.nhipMs },
			chon,
		)
		.then(() => true)
		.catch(() => false);
	await nghi(DO.cho.onDinhMs);
	return thay;
}

export async function choUrl(t, kiem, ms = DO.cho.dieuHuongMs) {
	return t
		.waitForFunction(
			(k) => {
				const q = new URL(location.href).searchParams;
				return Object.entries(k).every(([khoa, gia]) =>
					gia === null ? !q.has(khoa) : q.get(khoa) === gia,
				);
			},
			{ timeout: ms, polling: DO.cho.nhipMs },
			kiem,
		)
		.then(() => true)
		.catch(() => false);
}

export async function bam(t, chon) {
	await t
		.evaluate((c) => {
			const el = [...document.querySelectorAll(c)].find(
				(e) => e.getClientRects().length > 0,
			);
			el?.scrollIntoView({ block: "center", inline: "center" });
		}, chon)
		.catch(() => {});
	await nghi(DO.cho.cuonMs);
	for (let i = 0; i < DO.cuon.soLan; i += 1) {
		const r = await t.evaluate((c) => {
			const el = [...document.querySelectorAll(c)].find(
				(e) =>
					e.getClientRects().length > 0 &&
					getComputedStyle(e).visibility !== "hidden",
			);
			if (!el) return null;
			const b = el.getBoundingClientRect();
			return {
				x: b.left + b.width / 2,
				y: b.top + b.height / 2,
				tren: b.top,
				duoi: b.bottom,
				cao: window.innerHeight,
			};
		}, chon);
		if (r === null) return false;
		if (r.tren >= 0 && r.duoi <= r.cao) {
			await t.mouse.click(r.x, r.y);
			return true;
		}
		await t.mouse.move(r.x, r.cao / 2);
		await t.mouse.wheel({
			deltaY:
				r.tren < 0 ? r.tren - DO.cuon.lePx : r.duoi - r.cao + DO.cuon.lePx,
		});
		await nghi(DO.cho.cuonMs);
	}
	return false;
}

export const DOC_BO = () => {
	const vt = document.querySelector("[data-vi-tri-bo='mot-bo']");
	const o = document.querySelector(
		"[data-hang-so-hop]:not([aria-busy]) [data-o-so='da-cap-nhat']",
	);
	return {
		viTri: vt
			? [
					...vt.querySelectorAll(
						"[data-slot='breadcrumb-link'],[data-slot='breadcrumb-page']",
					),
				]
					.map((e) => e.textContent.trim())
					.join(" › ")
			: null,
		tieuDe:
			document
				.querySelector("[data-slot='page-shell-title']")
				?.textContent.trim() ?? null,
		daCapNhat: o?.children[1]?.children[0]?.textContent.trim() ?? null,
		chu: document.body.textContent ?? "",
	};
};

export async function choBo(t, tenBo) {
	await t
		.waitForFunction(
			(ten) =>
				document
					.querySelector(
						"[data-vi-tri-bo='mot-bo'] [data-slot='breadcrumb-page']",
					)
					?.textContent.trim() === ten,
			{ timeout: DO.cho.dieuHuongMs, polling: DO.cho.nhipMs },
			tenBo,
		)
		.catch(() => {});
	await nghi(DO.cho.onDinhMs);
}

function napCa() {
	const nap = spawnSync(
		"bun",
		["scripts/okr-mau.ts", OKR_MAU.co.ca, OKR_MAU.caHopTuan.ten],
		{ cwd: join(GOC, "apps", "api"), env: process.env, encoding: "utf8" },
	);
	const dongRa = (nap.stdout ?? "").trim().split("\n");
	const cuoi = dongRa.at(-1) ?? "";
	console.log(
		`nap bo OKR mau + ca hop-tuan: ma ${nap.status} — ${dongRa.at(-2)?.slice(0, 120) ?? ""}`,
	);
	if (nap.status !== 0) {
		console.log((nap.stderr ?? "").trim().split("\n").slice(-6).join("\n"));
		return null;
	}
	try {
		const ca = caHopTuan.safeParse(JSON.parse(cuoi));
		return ca.success ? ca.data : null;
	} catch {
		return null;
	}
}

export async function dungDuLieu() {
	const ca = napCa();
	if (!ca)
		await khongDo("KHONG DO DUOC: ca hop-tuan khong in dong JSON du khoa");
	const ck = {
		p: phienCua(ca.truongP),
		m: phienCua(ca.thanhVienM),
		a: phienCua(ca.quanTriA),
	};
	const api = trpcCua(ck.p);
	const [chuKy, cay, slug] = await Promise.all([
		api.hoi("okr.cycles"),
		api.hoi("org.tree"),
		suySlug(ck.p),
	]);
	const cur = chuKy.currentId;
	const ds = await api.hoi("okr.danhSachBo", { cycleId: cur });
	const tenGoc = ds.hang.find((h) => h.don === "goc")?.ten ?? null;
	const pbId = ca.boP.split(":")[1];
	const rongId = ca.boRong.split(":")[1];
	const moiPb = [
		...cay.divisions.flatMap((b) => b.departments),
		...cay.chuaXep,
	];
	const pb = moiPb.find((p) => p.id === pbId);
	const rong = moiPb.find((p) => p.id === rongId);
	const nguoiM = await db.user.findUnique({
		where: { email: ca.thanhVienM },
		select: { id: true },
	});
	const q = cay.people.find((n) => n.id === nguoiM?.id)?.primaryDepartmentId;
	const tenKy = (id) => chuKy.cycles.find((c) => c.id === id)?.name ?? null;
	if (!cur || !tenGoc || !pb || !rong || !q || !tenKy(ca.chuKyCon))
		await khongDo(
			`KHONG DO DUOC: thieu du lieu ca (ky ${cur}, goc ${tenGoc}, P ${pb?.name}, rong ${rong?.name}, Q ${q}, ky con ${tenKy(ca.chuKyCon)})`,
		);
	console.log(
		`du lieu: P ${ca.truongP} (${pb.name}) · M ${ca.thanhVienM} (Q ${q}) · A ${ca.quanTriA} · ky ${cur} · ky con ${ca.chuKyCon} · goc «${tenGoc}» · rong «${rong.name}»`,
	);
	return {
		ca,
		ck,
		api,
		slug,
		cur,
		tenGoc,
		pb,
		rong,
		q,
		tenKy,
	};
}
