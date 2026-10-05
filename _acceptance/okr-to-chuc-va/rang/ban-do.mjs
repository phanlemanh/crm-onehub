import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

export const GOC = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);
const GIAY = 1000;

export const BD = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		1440: { ten: "1440", rong: 1440, cao: 1000 },
		390: { ten: "390", rong: 390, cao: 844, dienThoai: true },
		375: { ten: "375", rong: 375, cao: 812, dienThoai: true },
	},
	cho: {
		dieuHuong: 240 * GIAY,
		phanTu: 120 * GIAY,
		yen: 1500,
		mangYen: 60 * GIAY,
		chan: 3 * GIAY,
	},
	vai: {
		"nhan-vien": { ma: "do-minh-khoa", pb: "kd-bac", mt: "q4-kd-bac-1" },
		"truong-phong": { ma: "nguyen-thi-lan", pb: "kd-bac", mt: "q4-kd-bac-1" },
		"chi-okr": { ma: "thai-minh-chau", pb: "tai-chinh", mt: "q4-tai-chinh-1" },
		"quan-tri": { ma: "le-hai-dang", pb: "kd-bac", mt: "q4-kd-bac-1" },
	},
	tenDai: "Nguyễn Thị Phương Thảo Hoàng",
	coDo: "--kiem-do-do",
};

export const CO_DO = process.argv.includes(BD.coDo);
export const thamSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i >= 0 ? process.argv[i + 1] : null;
};
export const tre = (ms) => new Promise((x) => setTimeout(x, ms));

const { db } = await import(join(GOC, "packages/db/src/index.ts"));
const { idMau, laKhoDo, napBoMau, phienCookie, thuMau, trpc } = await import(
	join(GOC, "_acceptance/tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs")
);
const { canhCay } = await import(
	join(GOC, "_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs")
);

export { db, idMau, thuMau, trpc };

export const APP = process.env.APP_URL ?? "http://localhost:3000";
export const API = process.env.API_URL ?? "http://localhost:3001";
export const KY4 = idMau("chu-ky", "quy4");
export const KYKE = idMau("chu-ky", "nam-ke");
export const ANH = join(
	GOC,
	CO_DO
		? ".acceptance-runs/okr-to-chuc-va/do-do"
		: "_acceptance/okr-to-chuc-va/evidence",
);

let trinhDuyet = null;
let soLoi = 0;

export function kiem(dung, thongDiep) {
	if (dung) return true;
	soLoi += 1;
	console.log(thongDiep);
	return false;
}

export async function ket(ma) {
	await trinhDuyet?.close().catch(() => {});
	await db.$disconnect().catch(() => {});
	process.exit(ma);
}

export async function ketThuc() {
	await ket(soLoi === 0 ? 0 : 1);
}

export async function chuanBi() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") {
		console.log(`KHONG DO: ${APP} khong phuc vu cay dang xet (${cay.ket})`);
		await ket(2);
	}
	if (!laKhoDo()) {
		console.log("KHONG DO: DATABASE_URL khong phai kho do rieng");
		await ket(2);
	}
	const nap = napBoMau();
	if (nap.ma !== 0) {
		console.log(`KHONG DO: okr:mau thoat ${nap.ma}: ${nap.dong}`);
		await ket(2);
	}
	const cookie = {};
	for (const [vai, v] of Object.entries(BD.vai))
		cookie[vai] = phienCookie(thuMau(v.ma));
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: {
			cookie: `${cookie["quan-tri"].ten}=${cookie["quan-tri"].gia}; lang=vi`,
		},
	});
	const dich = res.headers.get("location");
	const slug = dich
		? new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0]
		: null;
	if (!slug) {
		console.log("KHONG DO: khong suy duoc slug");
		await ket(2);
	}
	mkdirSync(ANH, { recursive: true });
	trinhDuyet = await puppeteer.launch({
		executablePath: BD.chrome,
		headless: true,
	});
	return { cookie, slug };
}

export async function moTrang(c, kho, { lang = "vi", theme = "light" } = {}) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: c.ten, value: c.gia, domain: host, path: "/" },
		{ name: "lang", value: lang, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({
		width: kho.rong,
		height: kho.cao,
		deviceScaleFactor: 1,
		isMobile: Boolean(kho.dienThoai),
		hasTouch: Boolean(kho.dienThoai),
	});
	await p.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: theme === "toi" ? "dark" : "light" },
	]);
	p.setDefaultNavigationTimeout(BD.cho.dieuHuong);
	const loiConsole = [];
	p.on("console", (m) => {
		if (m.type() === "error") loiConsole.push(m.text().slice(0, 200));
	});
	p.on("pageerror", (e) =>
		loiConsole.push(`pageerror ${e.message.slice(0, 200)}`),
	);
	return { ctx, p, loiConsole };
}

export async function yen(p) {
	await p
		.waitForNetworkIdle({ idleTime: 1000, timeout: BD.cho.mangYen })
		.catch(() => {});
	await p.evaluate(() => document.fonts.ready);
	await p.evaluate(() => {
		for (const s of [
			"nextjs-portal",
			".tsqd-parent-container",
			".tsqd-open-btn-container",
		])
			for (const el of document.querySelectorAll(s)) el.remove();
	});
	await tre(BD.cho.yen);
}

export async function chup(p, ten, toanTrang = false) {
	const tep = join(ANH, `${ten}.png`);
	await p.screenshot({ path: tep, fullPage: toanTrang });
	return tep.replace(`${GOC}/`, "");
}

export async function moKhung(p, slug, mt, ky = KY4) {
	await p.goto(
		`${APP}/${slug}/okr?kyOkr=${ky}&record=objective:${idMau("mt", mt)}`,
		{
			waitUntil: "domcontentloaded",
		},
	);
	await p.waitForSelector("[data-okr-sheet] [role=tab]", {
		timeout: BD.cho.phanTu,
	});
	await yen(p);
}

export async function chenStyle(p, css) {
	await p.addStyleTag({ content: css });
	await tre(300);
}
