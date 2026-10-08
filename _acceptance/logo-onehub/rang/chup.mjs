import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { markupAnhDaiDien } from "../../../packages/ui/test/logo-markup.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const RA =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", "logo-onehub", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const NGUOI = process.env.NGUOI ?? "ada@trycomp.ai";
const CAO = 900;
const CHO_MS = 30_000;
const LOCKUP_VIEWBOX = "0 0 2048 622";
const LOCKUP_CAO_TOI_THIEU = 20;
const ANH_DAI_DIEN_CANH = 32;
const ANH_DAI_DIEN_LOGO = 20;
const DUNG_SAI_PX = 0.5;
const ICON_KHAI = {
	"/favicon.ico": "apps/app/app/favicon.ico",
	"/favicon.svg": "apps/app/public/favicon.svg",
	"/favicon-96x96.png": "apps/app/public/favicon-96x96.png",
	"/apple-touch-icon.png": "apps/app/public/apple-touch-icon.png",
	"/site.webmanifest": "apps/app/public/site.webmanifest",
	"/web-app-manifest-192x192.png": "apps/app/public/web-app-manifest-192x192.png",
	"/web-app-manifest-512x512.png": "apps/app/public/web-app-manifest-512x512.png",
};

const dong = [];
let sai = 0;
let trinhDuyet = null;

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	for (const d of dong) console.log(d);
	console.log(`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`);
	process.exit(ma);
}

async function khongDo(cau) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	await ket(2);
}

function kiem(nhan, dat) {
	if (dat) dong.push(`DUNG ${nhan}`);
	else {
		sai += 1;
		dong.push(`SAI ${nhan}`);
	}
}

function phien(email) {
	const ra = execFileSync("bun", ["run", "dev:session", email], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) return null;
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) return null;
	const dau = new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
	return dau && !dau.startsWith("onboarding") && dau !== "sign-in" ? dau : null;
}

async function congTyDau(cookie) {
	const res = await fetch(`${API}/api/trpc/companies.list?input=${encodeURIComponent("{}")}`, {
		headers: { cookie: `${cookie.ten}=${cookie.gia}` },
	});
	const body = await res.json().catch(() => null);
	return body?.result?.data?.rows?.[0]?.id ?? null;
}

async function moTrang(opts) {
	const ctx = await trinhDuyet.createBrowserContext();
	const host = new URL(APP).hostname;
	const banh = [{ name: "lang", value: "vi", domain: host, path: "/" }];
	if (opts.cookie)
		banh.push({ name: opts.cookie.ten, value: opts.cookie.gia, domain: host, path: "/" });
	await ctx.setCookie(...banh);
	const p = await ctx.newPage();
	await p.setViewport({ width: opts.rong, height: CAO, deviceScaleFactor: 2 });
	if (opts.giaoDien)
		await p.evaluateOnNewDocument((g) => localStorage.setItem("theme", g), opts.giaoDien);
	await p.goto(`${APP}${opts.duong}`, { waitUntil: "networkidle0" });
	return { ctx, p };
}

async function logoNhinThay(p, vung) {
	return p.evaluate(
		(chon, vb) => {
			const goc = chon ? document.querySelector(chon) : document;
			if (!goc) return { dem: 0, lockup: [] };
			const svgs = Array.from(goc.querySelectorAll('svg[aria-label="OneHub"]'));
			const thay = svgs.filter((s) => {
				const r = s.getBoundingClientRect();
				return (
					r.width > 0 &&
					r.height > 0 &&
					s.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
				);
			});
			const lockup = thay
				.filter((s) => s.getAttribute("viewBox") === vb)
				.map((s) => {
					const r = s.getBoundingClientRect();
					const c = s.parentElement?.getBoundingClientRect();
					const tron = c
						? r.left >= c.left - 0.5 &&
							r.right <= c.right + 0.5 &&
							r.top >= c.top - 0.5 &&
							r.bottom <= c.bottom + 0.5
						: false;
					return { cao: r.height, tron };
				});
			return { dem: thay.length, lockup };
		},
		vung ?? null,
		LOCKUP_VIEWBOX,
	);
}

async function chup(opts) {
	const { ctx, p } = await moTrang(opts);
	const cuoi = new URL(p.url()).pathname;
	if (!cuoi.startsWith(opts.duongCuoi))
		await khongDo(`${opts.ten}: trang cuoi la ${cuoi}, khong phai ${opts.duongCuoi}`);
	if (opts.cho)
		await p.waitForFunction(opts.cho, { timeout: CHO_MS }).catch(() => null);
	await p.evaluate(() => document.fonts.ready);
	const tep = join(RA, `E11-${opts.ten}.png`);
	await p.screenshot({ path: tep });
	const logo = await logoNhinThay(p, opts.vung);
	kiem(`${opts.ten}: ${logo.dem} logo nhin thay (can >= ${opts.toiThieu})`, logo.dem >= opts.toiThieu);
	for (const [i, l] of logo.lockup.entries())
		kiem(
			`${opts.ten}: ban ngang ${i + 1} cao ${l.cao.toFixed(1)}px, tron trong khung cha ${l.tron}`,
			l.cao >= LOCKUP_CAO_TOI_THIEU - 0.5 && l.tron,
		);
	if (opts.canLockup)
		kiem(
			`${opts.ten}: ${logo.lockup.length >= 1 ? opts.canLockup.co : opts.canLockup.thieu}`,
			logo.lockup.length >= 1,
		);
	const tran = await p.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
	);
	kiem(`${opts.ten}: tran ngang ${tran}px`, tran <= 0);
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
	return { ctx, p };
}

async function kiemAnhDaiDien() {
	const markup = markupAnhDaiDien();
	for (const giaoDien of ["light", "dark"]) {
		const nhan = giaoDien === "light" ? "sang" : "toi";
		const ctx = await trinhDuyet.createBrowserContext();
		const p = await ctx.newPage();
		await p.setViewport({ width: 1440, height: CAO, deviceScaleFactor: 4 });
		await p.evaluateOnNewDocument((g) => localStorage.setItem("theme", g), giaoDien);
		await p.goto(`${APP}/sign-in`, { waitUntil: "networkidle0" });
		await p.evaluate((m, toi) => {
			document.documentElement.classList.toggle("dark", toi);
			const san = document.createElement("div");
			san.id = "san-anh-dai-dien";
			san.className = "bg-background p-6";
			san.style.cssText = "position:fixed;left:0;top:0;z-index:2147483647";
			san.innerHTML = `<div data-slot="message" class="group/message flex">${m}</div>`;
			document.body.appendChild(san);
		}, markup, giaoDien === "dark");
		const kq = await p.evaluate(() => {
			const khung = document.querySelector('[data-slot="message-avatar"]');
			const svg = khung?.querySelector('svg[aria-label="OneHub"]');
			if (!khung || !svg) return null;
			const k = khung.getBoundingClientRect();
			const s = svg.getBoundingClientRect();
			return {
				rong: k.width,
				cao: k.height,
				nen: getComputedStyle(khung).backgroundColor,
				logo: s.height,
				lechX: Math.abs(s.left + s.width / 2 - (k.left + k.width / 2)),
				lechY: Math.abs(s.top + s.height / 2 - (k.top + k.height / 2)),
			};
		});
		if (!kq) {
			kiem(`anh-dai-dien-${nhan}: khong dung duoc anh dai dien`, false);
			await ctx.close();
			continue;
		}
		const vuong =
			Math.abs(kq.rong - ANH_DAI_DIEN_CANH) <= DUNG_SAI_PX && Math.abs(kq.cao - ANH_DAI_DIEN_CANH) <= DUNG_SAI_PX;
		kiem(
			vuong
				? `anh-dai-dien-${nhan}: khoi vuong ${kq.rong}x${kq.cao}`
				: `anh-dai-dien-${nhan}: anh dai dien khong vuong ${kq.rong}x${kq.cao}`,
			vuong,
		);
		const trong = kq.nen === "transparent" || /\/\s*0\)$|,\s*0\)$/.test(kq.nen);
		kiem(`anh-dai-dien-${nhan}: nen ${kq.nen}`, !trong);
		kiem(
			`anh-dai-dien-${nhan}: logo cao ${kq.logo}px, lech tam ${kq.lechX.toFixed(1)}/${kq.lechY.toFixed(1)}px`,
			Math.abs(kq.logo - ANH_DAI_DIEN_LOGO) <= DUNG_SAI_PX && kq.lechX <= 1 && kq.lechY <= 1,
		);
		const tep = join(RA, `E15-anh-dai-dien-${nhan}.png`);
		const san = await p.$("#san-anh-dai-dien");
		await san.screenshot({ path: tep });
		dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
		await ctx.close();
	}
}

async function kiemIcon(p) {
	const khai = await p.evaluate(() =>
		Array.from(
			document.querySelectorAll(
				'link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]',
			),
		).map((l) => l.href),
	);
	const manifestHref = khai.find((h) => new URL(h).pathname === "/site.webmanifest");
	const tuManifest = manifestHref
		? ((await (await fetch(manifestHref)).json()).icons ?? []).map((i) =>
				new URL(i.src, manifestHref).href,
			)
		: [];
	const tatCa = [...new Set([...khai, ...tuManifest])];
	const duong = new Set(tatCa.map((h) => new URL(h).pathname));
	const mong = new Set(Object.keys(ICON_KHAI));
	const ngoaiBang = [...duong].filter((d) => !mong.has(d));
	const thieu = [...mong].filter((d) => !duong.has(d));
	kiem(
		ngoaiBang.length > 0 ? `icon ngoai bang: ${ngoaiBang.join(", ")}` : "khong icon nao ngoai bang",
		ngoaiBang.length === 0,
	);
	kiem(thieu.length > 0 ? `icon khai thieu: ${thieu.join(", ")}` : "du bay icon cua bang thiet ke", thieu.length === 0);
	for (const href of tatCa) {
		const tep = ICON_KHAI[new URL(href).pathname];
		if (!tep) continue;
		const res = await fetch(href);
		const may = new Uint8Array(await res.arrayBuffer());
		const kho = new Uint8Array(readFileSync(join(GOC, tep)));
		const giong = res.status === 200 && may.length === kho.length && may.every((v, i) => v === kho[i]);
		kiem(`${new URL(href).pathname} may chu tra ${res.status} giong tung byte ${tep}: ${giong}`, giong);
	}
	const goc = await fetch(`${APP}/favicon.ico`);
	const may = new Uint8Array(await goc.arrayBuffer());
	const kho = new Uint8Array(readFileSync(join(GOC, ICON_KHAI["/favicon.ico"])));
	kiem(
		`/favicon.ico (khong tham so) giong tung byte apps/app/app/favicon.ico`,
		goc.status === 200 && may.length === kho.length && may.every((v, i) => v === kho[i]),
	);
}

const cay = await canhCay();
if (cay.ket !== "dung-cay")
	await khongDo(`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`);

const cookie = phien(NGUOI);
if (!cookie) await khongDo(`khong doc duoc cookie phien cua ${NGUOI}`);
const slug = await suySlug(cookie);
if (!slug) await khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);

mkdirSync(RA, { recursive: true });
trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });

for (const rong of [1440, 390]) {
	const { ctx, p } = await chup({
		ten: `dang-nhap-${rong}`,
		duong: "/sign-in",
		duongCuoi: "/sign-in",
		rong,
		toiThieu: rong === 1440 ? 2 : 1,
		canLockup: rong === 1440 ? null : { co: "dau form co ban ngang", thieu: "dau form thieu logo" },
		vung: rong === 1440 ? null : "main > section.bg-background",
	});
	if (rong === 1440) {
		await kiemIcon(p);
		await kiemAnhDaiDien();
	}
	await ctx.close();
}

for (const giaoDien of ["light", "dark"]) {
	const nhan = giaoDien === "light" ? "sang" : "toi";
	const tren = await chup({
		ten: `thanh-tren-${nhan}`,
		duong: `/${slug}`,
		duongCuoi: `/${slug}`,
		rong: 1440,
		giaoDien,
		cookie,
		toiThieu: 1,
		vung: "header",
		cho: () => document.querySelector('header svg[aria-label="OneHub"]') !== null,
	});
	await tren.ctx.close();

	const hoSo = await congTyDau(cookie);
	if (!hoSo) await khongDo(`companies.list cua ${NGUOI} khong tra ho so cong ty nao de mo tab Agent`);
	const url = new URL(`/${slug}/companies`, APP);
	url.searchParams.set("record", `company:${hoSo}`);
	url.searchParams.set("tab", "agent");
	const agent = await chup({
		ten: `agent-${nhan}`,
		duong: `${url.pathname}${url.search}`,
		duongCuoi: url.pathname,
		rong: 1440,
		giaoDien,
		cookie,
		toiThieu: 0,
		vung: '[role="dialog"]',
		cho: () => document.querySelector('[role="dialog"]') !== null,
	});
	await agent.ctx.close();
}

await ket(sai === 0 ? 0 : 1);
