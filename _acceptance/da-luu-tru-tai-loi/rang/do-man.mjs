import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { settingsMessages } from "../../../apps/app/lib/messages/settings.ts";
import { db } from "../../../packages/db/src/index.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "da-luu-tru-tai-loi", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const NGUOI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const CHO_LOI_MS = 20_000;
const THU_TUC = "giaiDoan.archived";
const MA_TRAN = [
	"loi-1440",
	"dang-thu-lai-1440",
	"thu-lai-1440",
	"loi-375",
	"dem",
];

const g = settingsMessages("vi").giaiDoan;
const LOI = "[data-da-luu-tru-loi]";

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
let daTao = null;

function kiem(ma, nhan, dat) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ${ma} khong co trong MA_TRAN`);
	daPhat.add(ma);
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhan}`);
	if (!dat) sai += 1;
}

class KhongDo extends Error {}
function khongDo(cau) {
	throw new KhongDo(cau);
}

function phien() {
	const ra = execFileSync("bun", ["run", "dev:session", NGUOI], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) khongDo(`khong doc duoc cookie phien cua ${NGUOI}`);
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) khongDo(`${APP}/ tra ${res.status} khong co Location`);
	const dau = new URL(dich, APP).pathname.split("/").filter(Boolean)[0];
	if (!dau || dau === "sign-in" || dau.startsWith("onboarding"))
		khongDo(`${APP}/ chuyen toi ${dich}`);
	return dau;
}

function thuTucCua(url) {
	const duong = new URL(url).pathname;
	const dau = duong.indexOf("/api/trpc/");
	if (dau < 0) return [];
	return decodeURIComponent(duong.slice(dau + "/api/trpc/".length)).split(",");
}

const LOI_500 = JSON.stringify([
	{
		error: {
			message: "do loi tai da luu tru",
			code: -32603,
			data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500, path: THU_TUC },
		},
	},
]);

async function trang(kho, cookie, cheDo) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: "lang", value: "vi", domain: host, path: "/" },
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({
		width: kho,
		height: kho === 375 ? 812 : 900,
		deviceScaleFactor: 1,
	});
	const chan = { cheDo, giu: [], loLan: [] };
	await p.setRequestInterception(true);
	p.on("request", (req) => {
		const ds = thuTucCua(req.url());
		if (!ds.includes(THU_TUC)) return req.continue();
		if (ds.length > 1) {
			chan.loLan.push(ds.join(","));
			return req.continue();
		}
		if (chan.cheDo === "loi") {
			return req.respond({
				status: 500,
				contentType: "application/json",
				body: LOI_500,
			});
		}
		if (chan.cheDo === "giu") {
			chan.giu.push(req);
			return;
		}
		return req.continue();
	});
	return { ctx, p, chan };
}

async function mo(p, url) {
	await p.goto(url, { waitUntil: "domcontentloaded", timeout: CHO_MS });
	await p
		.waitForSelector('[data-the-giai-doan="LOST"]', { timeout: CHO_MS })
		.catch(() => khongDo(`${url}: khong thay the nhom giai doan`));
}

async function choLoi(p, chan) {
	await p.waitForSelector(LOI, { timeout: CHO_LOI_MS }).catch(() => {
		if (chan.loLan.length > 0)
			khongDo(`${THU_TUC} di chung lo voi: ${chan.loLan.join(" | ")}`);
		return null;
	});
}

async function soTrang(p) {
	return p.evaluate(
		(loiTrang) => ({
			the: document.querySelectorAll("[data-the-giai-doan]").length,
			loiTrang: [
				...document.querySelectorAll('[data-slot="empty-title"]'),
			].some((e) => (e.textContent ?? "").trim() === loiTrang),
		}),
		g.loiTai,
	);
}

async function hopCua(p) {
	return p.evaluate(
		(sel, chu) => {
			const khung = document.querySelector(sel);
			if (!khung) return null;
			khung.scrollIntoView({ block: "center" });
			const nut = [...khung.querySelectorAll("button")].find(
				(b) => (b.textContent ?? "").trim() === chu,
			);
			const hop = (el) => {
				if (!el) return null;
				const r = el.getBoundingClientRect();
				return { left: Math.round(r.left), right: Math.round(r.right) };
			};
			return {
				khung: hop(khung),
				nut: hop(nut),
				khoa: nut ? nut.disabled : null,
				dangTai: document.querySelector("[data-da-luu-tru-dang-tai]") !== null,
				cuon: document.documentElement.scrollWidth,
			};
		},
		LOI,
		g.thuLai,
	);
}

function trongNgang(h, kho) {
	return Boolean(h && h.left >= 0 && h.right <= kho);
}

async function do1440(cookie, slug) {
	const { ctx, p, chan } = await trang(1440, cookie, "loi");
	const url = `${APP}/${slug}/settings/giai-doan`;
	try {
		await mo(p, url);
		await choLoi(p, chan);
		const tr = await soTrang(p);
		const h = await hopCua(p);
		await p.screenshot({ path: join(RA, "loi-1440.png") });
		kiem(
			"loi-1440",
			`1440: loi — khung ${JSON.stringify(h?.khung)} nut ${JSON.stringify(h?.nut)}; the ${tr.the}; loi ca trang ${tr.loiTrang}`,
			Boolean(h) &&
				trongNgang(h.khung, 1440) &&
				trongNgang(h.nut, 1440) &&
				tr.the === 3 &&
				!tr.loiTrang,
		);
		if (!h) return;

		await p.evaluate(() => {
			window.__khongTaiLai = true;
		});
		chan.cheDo = "giu";
		await p.evaluate(
			(sel, chu) => {
				const nut = [
					...(document.querySelector(sel)?.querySelectorAll("button") ?? []),
				].find((b) => (b.textContent ?? "").trim() === chu);
				nut?.click();
			},
			LOI,
			g.thuLai,
		);
		const doiGiu = Date.now() + CHO_LOI_MS;
		while (chan.giu.length === 0 && Date.now() < doiGiu) {
			await new Promise((r) => setTimeout(r, 100));
		}
		if (chan.giu.length === 0) {
			if (chan.loLan.length > 0)
				khongDo(`${THU_TUC} di chung lo voi: ${chan.loLan.join(" | ")}`);
			khongDo("bam Thu lai khong phat yeu cau giaiDoan.archived");
		}
		await new Promise((r) => setTimeout(r, 400));
		const giu = await hopCua(p);
		const tr2 = await soTrang(p);
		await p.screenshot({ path: join(RA, "dang-thu-lai-1440.png") });
		kiem(
			"dang-thu-lai-1440",
			`1440: dang-thu-lai — khung con ${giu !== null}; nut khoa ${giu?.khoa}; khung xuong ${giu?.dangTai}; the ${tr2.the}`,
			giu !== null &&
				giu.khoa === true &&
				giu.dangTai === false &&
				tr2.the === 3,
		);

		chan.cheDo = "qua";
		for (const req of chan.giu.splice(0)) req.continue();
		const hien = await p
			.waitForSelector('[data-slot="archived-list"] button', {
				timeout: CHO_MS,
			})
			.then(() => true)
			.catch(() => false);
		const sau = await p.evaluate((sel) => {
			const nut = document.querySelector('[data-slot="archived-list"] button');
			return {
				nhan: (nut?.textContent ?? "").trim(),
				khung: document.querySelector(sel) !== null,
				khongTaiLai: window.__khongTaiLai === true,
			};
		}, LOI);
		await p.screenshot({ path: join(RA, "thu-lai-1440.png") });
		const so = Number(/\((\d+)\)/.exec(sau.nhan)?.[1] ?? 0);
		kiem(
			"thu-lai-1440",
			`1440: thu-lai — muc gap «${sau.nhan}»; khung loi con ${sau.khung}; trang khong tai lai ${sau.khongTaiLai}`,
			hien && so >= 1 && !sau.khung && sau.khongTaiLai,
		);
	} finally {
		await ctx.close();
	}
}

async function do375(cookie, slug) {
	const { ctx, p, chan } = await trang(375, cookie, "loi");
	const url = `${APP}/${slug}/settings/giai-doan`;
	try {
		await mo(p, url);
		await choLoi(p, chan);
		await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		const tr = await soTrang(p);
		const h = await hopCua(p);
		await p.screenshot({ path: join(RA, "loi-375.png") });
		kiem(
			"loi-375",
			`375: loi — khung ${JSON.stringify(h?.khung)} nut ${JSON.stringify(h?.nut)}; scrollWidth ${h?.cuon}; the ${tr.the}; loi ca trang ${tr.loiTrang}`,
			Boolean(h) &&
				trongNgang(h.khung, 375) &&
				trongNgang(h.nut, 375) &&
				h.cuon <= 375 &&
				tr.the === 3 &&
				!tr.loiTrang,
		);
	} finally {
		await ctx.close();
	}
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	const cookie = phien();
	const slug = await suySlug(cookie);
	daTao = (
		await db.dealStage.create({
			data: {
				label: `Đo E3b ${Date.now().toString(36)}`,
				kind: "OPEN",
				position: 900,
				archivedAt: new Date(),
			},
			select: { id: true },
		})
	).id;
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	await do1440(cookie, slug);
	await do375(cookie, slug);
	const soO = MA_TRAN.filter((m) => m !== "dem" && daPhat.has(m)).length;
	kiem("dem", `${soO}/4 o`, soO === 4);
}

let ma = 0;
try {
	await chay();
	const thieu = MA_TRAN.filter((m) => !daPhat.has(m));
	if (thieu.length > 0) {
		dong.push(`SAI ma tran thieu dong: ${thieu.join(", ")}`);
		sai += 1;
	}
	ma = sai > 0 ? 1 : 0;
} catch (e) {
	dong.push(
		`KHONG DO DUOC: ${e instanceof KhongDo ? e.message : (e?.stack ?? e)}`,
	);
	ma = 2;
} finally {
	await trinhDuyet?.close().catch(() => {});
	if (daTao) await db.dealStage.deleteMany({ where: { id: daTao } });
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
