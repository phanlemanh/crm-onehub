import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer-core";
import { z } from "../../../packages/validation/node_modules/zod/index.js";
import { suySlug } from "./slug.mjs";

const CHO_TAI = Number(process.env.CHO_TAI ?? 120000);
const CHO_VE = Number(process.env.CHO_VE ?? 90000);

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const chan = process.argv[2] ?? "khai-tieng";

const chu = z.string().trim().min(1);

function phien() {
	const raw = execFileSync(
		"bun",
		["run", "dev:session", "manh.phan@onemount.com"],
		{ cwd: "apps/api", encoding: "utf8" },
	);
	const line = raw.trim().split("\n").pop().trim();
	const eq = line.indexOf("=");
	return { name: line.slice(0, eq), value: line.slice(eq + 1) };
}

async function song(url) {
	try {
		await fetch(url, { method: "HEAD" });
		return true;
	} catch {
		return false;
	}
}

async function goi(cookie, path, input, lan = 0) {
	const url = `${API}/api/trpc/${path}?input=${encodeURIComponent(JSON.stringify(input))}`;
	let res;
	try {
		res = await fetch(url, {
			headers: { Cookie: `${cookie.name}=${cookie.value}` },
		});
	} catch (loi) {
		if (lan < 2) {
			await new Promise((r) => setTimeout(r, 2000 * (lan + 1)));
			return goi(cookie, path, input, lan + 1);
		}
		const co = await song(API);
		console.log(
			`RANG CUN: khong noi duoc toi ${API} sau 3 lan thu.\n` +
				`   cong 3001 ${co ? "CO tra loi — nghen hoac tu choi, khong phai chet" : "KHONG tra loi — may chu API chua chay"}\n` +
				`   loi goc: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
		process.exit(2);
	}
	if (!res.ok) {
		if (res.status >= 500 && lan < 2) {
			await new Promise((r) => setTimeout(r, 2000 * (lan + 1)));
			return goi(cookie, path, input, lan + 1);
		}
		console.log(
			`RANG CUN: ${path} tra ${res.status} sau ${lan + 1} lan thu — may chu API SONG nhung tu choi lenh nay. Day khong phai "API chua chay".`,
		);
		process.exit(2);
	}
	return (await res.json()).result.data;
}

const DOC = (canTim) => {
	const ra = [];
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	for (let n = walker.nextNode(); n; n = walker.nextNode()) {
		const t = n.nodeValue.replace(/\s+/g, " ").trim();
		if (t === "") continue;
		const el = n.parentElement;
		if (!el || el.closest("script,style,noscript,template")) continue;
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) continue;
		for (const gt of canTim) {
			if (!t.includes(gt)) continue;
			ra.push({ gt, boc: el.closest('[lang="en"]') !== null, chu: t.slice(0, 60) });
		}
	}
	return ra;
};

const cookie = phien();
const SLUG = await suySlug(cookie);
const [dsCongTy, dsThoaThuan] = await Promise.all([
	goi(cookie, "companies.list", {}),
	goi(cookie, "deals.list", {}),
]);
const congTy = z
	.object({ rows: z.array(z.object({ industry: chu.nullish() })) })
	.parse(dsCongTy).rows;
const thoaThuan = z
	.object({ rows: z.array(z.object({ stage: chu })) })
	.parse(dsThoaThuan).rows;

const GIAI_DOAN = [
	"Demo booked",
	"Qualified to buy",
	"Decision maker in",
	"Contract sent",
	"Closed won",
	"Closed lost",
	"Unqualified",
];
const NGANH = [...new Set(congTy.map((r) => r.industry).filter(Boolean))];
const MA_GIAI_DOAN = [...new Set(thoaThuan.map((r) => r.stage))];

const browser = await puppeteer.launch({
	executablePath: CHROME,
	headless: "new",
	args: ["--no-sandbox"],
});

async function xem(man, canTim, trang = "") {
	const page = await browser.newPage();
	await page.setViewport({ width: 1440, height: 1000 });
	await browser.setCookie(
		{ name: cookie.name, value: cookie.value, domain: "localhost", path: "/" },
		{ name: "lang", value: "vi", domain: "localhost", path: "/" },
	);
	await page.goto(`${APP}/${SLUG}/${man}${trang}`, {
		waitUntil: "networkidle0",
		timeout: CHO_TAI,
	});
	await page.waitForSelector('[data-slot="table-head"]', { timeout: CHO_VE });
	await new Promise((r) => setTimeout(r, 1200));
	const lang = await page.evaluate(() => document.documentElement.lang);
	if (lang !== "vi") {
		console.log(`RANG CUN: trang ${man} khong o lang=vi (${lang})`);
		process.exit(2);
	}
	const ra = await page.evaluate(DOC, canTim);
	await page.close();
	return ra;
}

if (chan === "giai-doan") {
	console.log(`-- bay gia tri giai doan, lay tu enum cua may chu: ${MA_GIAI_DOAN.length} ma dang dung`);
	if (GIAI_DOAN.length !== 7) {
		console.log(`RANG CUN: cho 7 gia tri giai doan, thay ${GIAI_DOAN.length}`);
		process.exit(2);
	}
	const thay = await xem("deals", GIAI_DOAN, "?hide=nothing");
	let hong = 0;
	for (const g of GIAI_DOAN) {
		const cho = thay.filter((x) => x.gt === g);
		if (cho.length === 0) {
			console.log(`   khong hien  ${g}`);
			continue;
		}
		const chuaBoc = cho.filter((x) => !x.boc);
		if (chuaBoc.length > 0) hong += chuaBoc.length;
		console.log(
			`   ${chuaBoc.length === 0 ? "boc du " : "CHUA BOC"} ${g.padEnd(20)} ${cho.length} cho, chua boc ${chuaBoc.length}`,
		);
	}
	console.log(`ket qua: cho chua khai lang=en=${hong}`);
	await browser.close();
	process.exit(hong > 0 ? 1 : 0);
}

console.log(`-- gia tri du lieu tieng Anh lay tu may chu: ${NGANH.length} nganh`);
const thay = await xem("companies", NGANH, "?hide=nothing");
let hong = 0;
for (const g of NGANH) {
	const cho = thay.filter((x) => x.gt === g);
	if (cho.length === 0) continue;
	const chuaBoc = cho.filter((x) => !x.boc);
	if (chuaBoc.length > 0) hong += chuaBoc.length;
	console.log(
		`   ${chuaBoc.length === 0 ? "boc du " : "CHUA BOC"} ${g.padEnd(22)} ${cho.length} cho, chua boc ${chuaBoc.length}`,
	);
}
console.log(`ket qua: cho chua khai lang=en=${hong}`);
await browser.close();
process.exit(hong > 0 ? 1 : 0);
