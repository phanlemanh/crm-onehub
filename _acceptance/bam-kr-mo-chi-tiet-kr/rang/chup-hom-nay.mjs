import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP), "..", "..", "..");
const RA = join(GOC, "_acceptance/bam-kr-mo-chi-tiet-kr/evidence/hom-nay");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const MAN = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		1440: { rong: 1440, cao: 900 },
		375: { rong: 375, cao: 812 },
	},
	cho: { manMs: 120_000, phanMs: 15_000, yenMs: 1500 },
	ungVien: ["ly-thanh-tam"],
	chuKr: "huynh-gia-phuc",
	caMan: {
		chuKy: "quy4",
		phongBan: "kd-nam",
		mucTieu: "q4-kd-nam-1",
		kr: "q4-kd-nam-1-k1",
	},
};

const doiSo = (ten) =>
	process.argv.includes(ten)
		? (process.argv[process.argv.indexOf(ten) + 1] ?? "")
		: "";

function ket(ma) {
	console.log(`KET LUAN: ma ${ma}`);
	process.exit(ma);
}

function khongDo(ly) {
	console.log(`KHONG DO DUOC: ${ly}`);
	ket(2);
}

async function chup(p, ten, tenKho) {
	await new Promise((r) => setTimeout(r, MAN.cho.yenMs));
	await p.screenshot({ path: join(RA, `${ten}--${tenKho}.png`) });
	console.log(`ANH ${ten}--${tenKho}.png`);
}

async function bam(p, chon) {
	const el = await p
		.waitForSelector(chon, { visible: true, timeout: MAN.cho.phanMs })
		.catch(() => null);
	if (!el) return false;
	await el.click();
	return true;
}

async function doKho(tenKho, ca) {
	const { default: puppeteer } = await import("puppeteer-core");
	const kho = MAN.kho[tenKho];
	const host = new URL(APP).hostname;
	const trinh = await puppeteer.launch({
		executablePath: MAN.chrome,
		headless: true,
	});
	try {
		const ctx = await trinh.createBrowserContext();
		await ctx.setCookie(
			{ name: ca.cookie.ten, value: ca.cookie.gia, domain: host, path: "/" },
			{ name: "lang", value: "vi", domain: host, path: "/" },
		);
		const p = await ctx.newPage();
		await p.setViewport({
			width: kho.rong,
			height: kho.cao,
			deviceScaleFactor: 1,
		});
		await p.emulateMediaFeatures([
			{ name: "prefers-color-scheme", value: "light" },
		]);
		p.setDefaultNavigationTimeout(MAN.cho.manMs);
		p.setDefaultTimeout(MAN.cho.manMs);
		const di = async (duong) => {
			await p.goto(`${APP}/${ca.slug}${duong}`, { waitUntil: "load" });
			await p.evaluate(() => document.fonts.ready);
		};
		const choNgan = () =>
			p
				.waitForSelector("[role=dialog]", {
					visible: true,
					timeout: MAN.cho.phanMs,
				})
				.catch(() => null);
		const ghiUrl = (ten) =>
			console.log(
				`URL ${ten} ${tenKho} ${new URL(p.url()).searchParams.get("record")}`,
			);

		await di(`/okr?kyOkr=${ca.ky}`);
		await p
			.waitForSelector("[data-viec-okr]", {
				visible: true,
				timeout: MAN.cho.phanMs,
			})
			.catch(() => null);
		await p.screenshot({
			path: join(RA, `cua-toi--${tenKho}.png`),
			fullPage: true,
		});
		console.log(`ANH cua-toi--${tenKho}.png`);
		if (await bam(p, "[data-viec-okr] [data-mo-muc-tieu]")) {
			await choNgan();
			await chup(p, "viec-bam-mo", tenKho);
			ghiUrl("viec-bam-mo");
			await di(`/okr?kyOkr=${ca.ky}`);
		} else
			console.log(`THIEU viec-bam-mo ${tenKho}: khong thay nut cua viec OKR`);
		const ctxB = await trinh.createBrowserContext();
		await ctxB.setCookie(
			{ name: ca.cookieB.ten, value: ca.cookieB.gia, domain: host, path: "/" },
			{ name: "lang", value: "vi", domain: host, path: "/" },
		);
		const pB = await ctxB.newPage();
		await pB.setViewport({
			width: kho.rong,
			height: kho.cao,
			deviceScaleFactor: 1,
		});
		await pB.emulateMediaFeatures([
			{ name: "prefers-color-scheme", value: "light" },
		]);
		pB.setDefaultNavigationTimeout(MAN.cho.manMs);
		pB.setDefaultTimeout(MAN.cho.manMs);
		await pB.goto(`${APP}/${ca.slug}/okr?kyOkr=${ca.ky}`, {
			waitUntil: "load",
		});
		await pB
			.waitForSelector("[data-kr] [data-mo-muc-tieu]", {
				visible: true,
				timeout: MAN.cho.phanMs,
			})
			.catch(() => null);
		await pB.screenshot({
			path: join(RA, `cua-toi-kr--${tenKho}.png`),
			fullPage: true,
		});
		console.log(`ANH cua-toi-kr--${tenKho}.png`);
		if (await bam(pB, "[data-kr] [data-mo-muc-tieu]")) {
			await pB
				.waitForSelector("[role=dialog]", {
					visible: true,
					timeout: MAN.cho.phanMs,
				})
				.catch(() => null);
			await chup(pB, "cua-toi-bam-kr", tenKho);
			console.log(
				`URL cua-toi-bam-kr ${tenKho} ${new URL(pB.url()).searchParams.get("record")}`,
			);
		} else
			console.log(
				`THIEU cua-toi-bam-kr ${tenKho}: khong thay ten KR o KR ban phu trach`,
			);
		await ctxB.close();
		await di(`/okr/bo-okr?kyOkr=${ca.ky}&donOkr=pb:${ca.pb}&xemOkr=cay`);
		await p
			.waitForSelector("[data-cap-nut]", {
				visible: true,
				timeout: MAN.cho.phanMs,
			})
			.catch(() => null);
		await chup(p, "so-do", tenKho);
		if (await bam(p, '[data-cap-nut="kr"]')) {
			await p
				.waitForSelector("[role=dialog]", {
					visible: true,
					timeout: MAN.cho.phanMs,
				})
				.catch(() => null);
			await chup(p, "so-do-bam-kr", tenKho);
			console.log(
				`URL so-do-bam-kr ${tenKho} ${new URL(p.url()).searchParams.get("record")}`,
			);
		} else
			console.log(`THIEU so-do-bam-kr ${tenKho}: khong thay nut KR tren cay`);

		await di(
			`/okr/bo-okr?kyOkr=${ca.ky}&donOkr=pb:${ca.pb}&record=objective:${ca.m}`,
		);
		await p
			.waitForSelector("[role=dialog] [data-kr-hang]", {
				visible: true,
				timeout: MAN.cho.phanMs,
			})
			.catch(() => null);
		await chup(p, "chi-tiet-muc-tieu", tenKho);

		await di(`/okr/bo-okr?kyOkr=${ca.ky}&donOkr=pb:${ca.pb}&record=kr:${ca.k}`);
		await p
			.waitForSelector("[role=dialog]", {
				visible: true,
				timeout: MAN.cho.phanMs,
			})
			.catch(() => null);
		await chup(p, "chi-tiet-kr", tenKho);
		await ctx.close();
	} finally {
		await trinh.close().catch(() => {});
	}
}

if (process.argv.includes("--kho")) {
	const tenKho = doiSo("--kho");
	try {
		await doKho(tenKho, JSON.parse(doiSo("--ca")));
	} catch (loi) {
		khongDo(`kho ${tenKho}: ${loi?.message ?? loi}`);
	}
	ket(0);
}

if (["3000", "3001"].includes(new URL(APP).port))
	khongDo(`APP_URL ${APP} la cong cua nguoi — chay qua mot-luot.sh`);
mkdirSync(RA, { recursive: true });
const phien = await import("../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs");
if (!phien.laKhoDo()) khongDo("DATABASE_URL khong phai kho do rieng");
const nap = phien.napBoMau();
if (nap.ma !== 0) khongDo(`okr:mau thoat ${nap.ma}: ${nap.dong}`);
const { idMau } = phien;
const ky = idMau("chu-ky", MAN.caMan.chuKy);
let chon = null;
for (const ma of MAN.ungVien) {
	const cookie = phien.phienCookie(phien.thuMau(ma));
	const mine = await phien
		.trpc(API, cookie)
		.hoi("okr.mine", { cycleId: ky })
		.catch(() => null);
	const soKr = (mine?.objectives ?? []).reduce(
		(t, o) => t + (o.keyResults?.length ?? 0),
		0,
	);
	console.log(`UNG VIEN ${ma}: ${soKr} KR phu trach`);
	if (soKr > 0) {
		chon = { ma, cookie };
		break;
	}
}
if (!chon) {
	console.log("UNG VIEN: khong dem duoc KR qua okr.mine, dung nguoi dau");
	chon = {
		ma: MAN.ungVien[0],
		cookie: phien.phienCookie(phien.thuMau(MAN.ungVien[0])),
	};
}
const res = await fetch(`${APP}/`, {
	redirect: "manual",
	headers: { cookie: `${chon.cookie.ten}=${chon.cookie.gia}; lang=vi` },
});
const slug = new URL(res.headers.get("location") ?? "/", APP).pathname
	.split("/")
	.filter(Boolean)[0];
if (!slug) khongDo(`khong suy duoc slug workspace (status ${res.status})`);
const ca = {
	cookie: chon.cookie,
	cookieB: phien.phienCookie(phien.thuMau(MAN.chuKr)),
	slug,
	ky,
	pb: idMau("pb", MAN.caMan.phongBan),
	m: idMau("mt", MAN.caMan.mucTieu),
	k: idMau("kr", MAN.caMan.kr),
};
console.log(`NGUOI XEM ${chon.ma} · workspace ${slug}`);
for (const tenKho of Object.keys(MAN.kho)) {
	const r = spawnSync(
		"bun",
		[TEP, "--kho", tenKho, "--ca", JSON.stringify(ca)],
		{
			cwd: GOC,
			env: process.env,
			encoding: "utf8",
			maxBuffer: 64 << 20,
		},
	);
	process.stdout.write(`${r.stdout}`);
	if (r.status !== 0)
		khongDo(
			`kho ${tenKho} thoat ${r.status}: ${`${r.stderr}`.trim().split("\n").slice(-2).join(" | ")}`,
		);
}
ket(0);
