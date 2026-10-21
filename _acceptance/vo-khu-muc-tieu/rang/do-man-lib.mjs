import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	API,
	APP,
	CHO_TAI,
	chiaCookie,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

export const GOC = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);

const GIAY_MS = 1000;

export const DO = {
	kho: {
		mayTinh: { ten: "1280", rong: 1280, cao: 800 },
		dienThoai: { ten: "375", rong: 375, cao: 812 },
	},
	soMuc: 5,
	toiDaChuyen: 1,
	cho: {
		taiMs: CHO_TAI,
		dauHieuMs: 60 * GIAY_MS,
		thanhBenMs: 30 * GIAY_MS,
		hydrateMs: 1500,
		langMs: 2 * GIAY_MS,
		xoaThamSoMs: 20 * GIAY_MS,
		cuonMs: 3 * GIAY_MS,
		nhipMs: 250,
	},
};

const THU_TUC_THAN = ["toanCanh", "hoiY", "danhSach", "cayCanChinh"];
const MAU_RSC = new RegExp(
	`\\[\\\\?"okr\\\\?",\\\\?"(${THU_TUC_THAN.join("|")})\\\\?"\\],\\{\\\\?"input\\\\?":\\{\\\\?"cycleId\\\\?":\\\\?"([^"\\\\]+)`,
	"g",
);

export const nghi = (ms) => new Promise((xong) => setTimeout(xong, ms));

export function phienCua(email) {
	const ra = execFileSync("bun", ["run", "dev:session", email], {
		cwd: join(GOC, "apps", "api"),
		encoding: "utf8",
	});
	return chiaCookie(ra.trim().split("\n").pop().trim());
}

export function trpcCua(cookie) {
	const dau = { Cookie: `${cookie.ten}=${cookie.gia}; lang=vi` };
	async function doc(res, duong) {
		const chu = await res.text();
		if (!res.ok)
			throw new Error(`${duong} tra ${res.status}: ${chu.slice(0, 300)}`);
		return JSON.parse(chu).result.data;
	}
	return {
		hoi: async (duong, vao) => {
			const q =
				vao === undefined
					? ""
					: `?input=${encodeURIComponent(JSON.stringify(vao))}`;
			const res = await fetch(`${API}/api/trpc/${duong}${q}`, {
				redirect: "manual",
				headers: dau,
			});
			return doc(res, duong);
		},
		lam: async (duong, vao) => {
			const res = await fetch(`${API}/api/trpc/${duong}`, {
				method: "POST",
				redirect: "manual",
				headers: { ...dau, "content-type": "application/json" },
				body: JSON.stringify(vao),
			});
			return doc(res, duong);
		},
	};
}

function dichCua(url) {
	const u = new URL(url);
	u.searchParams.delete("_rsc");
	u.searchParams.sort();
	return `${u.pathname}?${u.searchParams}`;
}

export function khoaDich(url) {
	return dichCua(url);
}

function ghiMang(trang) {
	const su = [];
	trang.on("response", async (r) => {
		const url = r.url();
		const t = Date.now();
		try {
			if (url.includes("/api/trpc/")) {
				const u = new URL(url);
				const raw = u.searchParams.get("input");
				if (!raw) return;
				const vao = JSON.parse(raw);
				const thuTuc = decodeURIComponent(
					u.pathname.split("/api/trpc/")[1] ?? "",
				).split(",");
				thuTuc.forEach((p, i) => {
					const v = u.searchParams.has("batch") ? vao[i] : vao;
					const ten = p.replace(/^okr\./, "");
					if (v?.cycleId && THU_TUC_THAN.includes(ten))
						su.push({ t, ten, cycleId: v.cycleId, nguon: "trpc", dich: null });
				});
				return;
			}
			const req = r.request();
			const laRsc =
				req.headers().rsc === "1" ||
				url.includes("_rsc=") ||
				req.resourceType() === "document";
			if (!laRsc || r.status() >= 300) return;
			const chu = await r.text();
			for (const k of chu.matchAll(MAU_RSC))
				su.push({
					t,
					ten: k[1],
					cycleId: k[2],
					nguon: "rsc",
					dich: dichCua(url),
				});
		} catch {}
	});
	return su;
}

export async function trangMoi(trinhDuyet, cookie) {
	const ctx = await trinhDuyet.createBrowserContext();
	const trang = await ctx.newPage();
	const host = new URL(APP).hostname;
	await trang.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const dieuHuong = [];
	trang.on("framenavigated", (f) => {
		if (f === trang.mainFrame()) dieuHuong.push(f.url());
	});
	return { trang, mang: ghiMang(trang), dieuHuong };
}

export async function choThay(trang, chon, ms = DO.cho.dauHieuMs) {
	return trang
		.waitForFunction(
			(c) =>
				[...document.querySelectorAll(c)].some(
					(el) =>
						el.getClientRects().length > 0 &&
						getComputedStyle(el).visibility !== "hidden",
				),
			{ timeout: ms, polling: DO.cho.nhipMs },
			chon,
		)
		.then(() => true)
		.catch(() => false);
}

export async function choThanhBen(trang) {
	await trang
		.waitForFunction(
			() =>
				document.querySelector(
					"aside[data-slot='area-sidebar'] nav a[href], [data-slot='nav-strip'] a[href]",
				) &&
				!document.querySelector(
					"aside[data-slot='area-sidebar'] nav[aria-busy='true']",
				),
			{ timeout: DO.cho.thanhBenMs, polling: DO.cho.nhipMs },
		)
		.catch(() => {});
}

export async function mo(t, duong, cho = null) {
	const moc = t.dieuHuong.length;
	const res = await t.trang.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: DO.cho.taiMs,
	});
	const status = res?.status() ?? 0;
	const chuoi = res?.request().redirectChain().length ?? 0;
	const dich = new URL(t.trang.url()).pathname;
	if (dich.startsWith("/sign-in") || dich.includes("/onboarding"))
		await khongDo(`KHONG DO DUOC: ${duong} bi day ve ${dich}`);
	if (status === 404) return { status, chuoi, moc, thay: false };
	await choThanhBen(t.trang);
	const thay = cho === null ? true : await choThay(t.trang, cho);
	await nghi(DO.cho.hydrateMs);
	return { status, chuoi, moc, thay };
}

export function soLanChuyen(t, r) {
	const ds = t.dieuHuong.slice(r.moc).map((u) => new URL(u).pathname);
	let doi = 0;
	for (let i = 1; i < ds.length; i += 1) if (ds[i] !== ds[i - 1]) doi += 1;
	return r.chuoi + doi;
}

export async function docThanhBen(trang) {
	return trang.evaluate(() => {
		const hien = (el) =>
			!!el &&
			el.getClientRects().length > 0 &&
			getComputedStyle(el).visibility !== "hidden";
		const aside = document.querySelector("aside[data-slot='area-sidebar']");
		const strip = document.querySelector("[data-slot='area-sidebar-strip']");
		const vung = hien(aside) ? aside : hien(strip) ? strip : null;
		const nav =
			vung === null
				? null
				: vung === aside
					? aside.querySelector("nav")
					: strip.querySelector("[data-slot='nav-strip']");
		const muc = nav
			? [...nav.querySelectorAll("a[href]")].filter(hien).map((a) => {
					const u = new URL(a.getAttribute("href"), location.href);
					const so = a.querySelector("[data-slot='badge']");
					return {
						duong: u.pathname,
						truyVan: u.search,
						chu: a.innerText.trim(),
						sang: a.getAttribute("aria-current") === "page",
						so: so ? so.textContent.trim() : null,
					};
				})
			: [];
		const oKy = vung
			? ([...vung.querySelectorAll("[data-chon-chu-ky]")].find(hien) ?? null)
			: null;
		const nhanKy = oKy?.querySelector("span[translate='no']") ?? oKy ?? null;
		const nhanNhom = [
			...document.querySelectorAll("[data-slot='nav-group-label']"),
		]
			.filter(hien)
			.map((e) => e.textContent.trim());
		const chan = vung
			? [...vung.querySelectorAll("[data-slot='area-sidebar-footer'] a[href]")]
					.filter(hien)
					.map((a) => new URL(a.href).pathname)
			: [];
		const oKyNgoai = [
			...document.querySelectorAll("[data-chon-chu-ky]"),
		].filter(
			(e) =>
				hien(e) &&
				!e.closest(
					"[data-slot='area-sidebar'],[data-slot='area-sidebar-strip']",
				),
		).length;
		const tl = document.documentElement;
		const cuon = document.querySelector("[data-slot='page-shell-scroll']");
		return {
			vung: vung === null ? null : vung === aside ? "aside" : "strip",
			asideHien: hien(aside),
			stripHien: hien(strip),
			muc,
			tenKy: nhanKy ? nhanKy.textContent.trim() : null,
			oKyODau: !!oKy?.closest("[data-slot='area-sidebar-header']"),
			nhanNhom,
			chan,
			oKyNgoai,
			tran: Math.max(
				tl.scrollWidth - tl.clientWidth,
				cuon ? cuon.scrollWidth - cuon.clientWidth : 0,
			),
		};
	});
}

export async function demLop(trang) {
	return trang.evaluate(() => {
		const hien = (el) =>
			el.getClientRects().length > 0 &&
			getComputedStyle(el).visibility !== "hidden";
		const ds = [
			...document.querySelectorAll(
				"[role='tablist'],[data-view-switch],[data-slot='view-switch'],[data-khung-tab]",
			),
		].filter(
			(e) =>
				hien(e) &&
				!e.closest(
					"[data-slot='area-sidebar'],[data-slot='area-sidebar-strip']",
				),
		);
		const lop = ds.filter((e) => !ds.some((o) => o !== e && o.contains(e)));
		return lop.map(
			(e) =>
				e.getAttribute("data-view-switch") ??
				(e.hasAttribute("data-khung-tab")
					? "khung-tab"
					: e.getAttribute("role")),
		);
	});
}

export async function moTa(trang) {
	return trang.evaluate(
		() =>
			document
				.querySelector("[data-slot='page-shell-description']")
				?.textContent.trim() ?? null,
	);
}

export function kyThan(t, { tuLuc, url, ten }) {
	const dich = khoaDich(url);
	const sauBam = t.mang.filter((s) => s.ten === ten && s.t >= tuLuc);
	const trpc = sauBam.filter((s) => s.nguon === "trpc");
	if (trpc.length > 0) return trpc.at(-1);
	const rsc = t.mang.filter(
		(s) => s.ten === ten && s.nguon === "rsc" && s.dich === dich,
	);
	if (rsc.length > 0) return rsc.at(-1);
	return sauBam.at(-1) ?? null;
}

export function kyTheoTen(cycles, nhan) {
	if (nhan === null) return null;
	const khop = cycles.filter(
		(c) => nhan === c.name || nhan.startsWith(`${c.name} · `),
	);
	return khop.sort((a, b) => b.name.length - a.name.length)[0] ?? null;
}

export const PHA = process.env.VKM_PHA ?? "";

const tong = { dung: 0, sai: [] };

export function bao(dat, dongDung, dongSai) {
	if (dat) tong.dung += 1;
	else tong.sai.push(dongSai);
	console.log(dat ? dongDung : dongSai);
}

export function tongKet() {
	return { dung: tong.dung, sai: tong.sai.length };
}
