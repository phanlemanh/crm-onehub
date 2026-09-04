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

const NGANH = [...new Set(congTy.map((r) => r.industry).filter(Boolean))];
const MA_GIAI_DOAN = [...new Set(thoaThuan.map((r) => r.stage))];

function nhanGiaiDoan(ma) {
	const kichBan = `
import { DealStage } from "@crm/db/enums";
import { dealStageLabel } from "./lib/deal-stage";
const ma = ${JSON.stringify(ma)};
const duEnum = Object.values(DealStage);
console.log(JSON.stringify({
  nhan: Object.fromEntries(ma.map((m) => [m, dealStageLabel(m)])),
  duEnum,
}));
`;
	let ra;
	try {
		ra = execFileSync("bun", ["-e", kichBan], {
			cwd: "apps/app",
			encoding: "utf8",
		});
	} catch (loi) {
		console.log(
			"KHONG DO DUOC: khong goi duoc dealStageLabel cua san pham — " +
				String(loi.stderr ?? loi.message).slice(0, 300),
		);
		process.exit(2);
	}
	return JSON.parse(ra.trim().split("\n").pop());
}

const { nhan: NHAN_GIAI_DOAN, duEnum: ENUM_GIAI_DOAN } = nhanGiaiDoan(MA_GIAI_DOAN);
const GIAI_DOAN = MA_GIAI_DOAN.map((m) => NHAN_GIAI_DOAN[m]);

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
	if (GIAI_DOAN.length === 0) {
		console.log(
			"KHONG DO DUOC: tap giai doan tu may chu RONG — deals.list khong tra ve hang nao.\n" +
				"   Tap so rong khong phai la dat: khong co gi de doi chieu.",
		);
		process.exit(2);
	}
	const chuaPhu = ENUM_GIAI_DOAN.filter((m) => !MA_GIAI_DOAN.includes(m));
	if (chuaPhu.length > 0) {
		console.log(
			`KHONG DO DUOC: enum co ${ENUM_GIAI_DOAN.length} ma, du lieu thu chi phu ${MA_GIAI_DOAN.length}.\n` +
				`   Chua phu: ${chuaPhu.join(" · ")}\n` +
				"   AC-1 doi SO KHANG DINH BANG SO GIA TRI ENUM. Mot ma khong co thoa thuan nao\n" +
				"   thi nhan cua no khong hien duoc, nen khong khang dinh duoc — do la TIEN DE\n" +
				"   thieu, khong phai dat. Gieo du lieu thu cho du bay giai doan roi do lai.",
		);
		await browser.close();
		process.exit(2);
	}
	console.log(
		`-- DAN SO: ${MA_GIAI_DOAN.length} ma giai doan doc tu may chu trong chinh luot chay nay\n` +
			`   nhan lay tu dealStageLabel() CUA SAN PHAM, khong tu mot hang trong file do:\n` +
			MA_GIAI_DOAN.map((m) => `     ${m.padEnd(26)} -> ${JSON.stringify(NHAN_GIAI_DOAN[m])}`).join("\n") +
			`\n-- DO PHU: enum co ${ENUM_GIAI_DOAN.length} ma, du lieu thu phu ${MA_GIAI_DOAN.length}` +

			"\n-- KHANG DINH: moi nhan phai hien tren man, trong mot phan tu tu khai lang=en (AC-14 vong ③a)",
	);
	const thay = await xem("deals", GIAI_DOAN, process.env.TRANG ?? "?hide=nothing");
	let hong = 0;
	for (const g of GIAI_DOAN) {
		const cho = thay.filter((x) => x.gt === g);
		if (cho.length === 0) {
			console.log(`   GIAI DOAN KHONG THAY TREN MAN: ${g}`);
			hong += 1;
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

if (NGANH.length === 0) {
	console.log(
		"KHONG DO DUOC: tap nganh nghe RONG — khong cong ty nao co truong industry.\n" +
			"   Tap so rong khong phai la dat: khong co gi de doi chieu.",
	);
	await browser.close();
	process.exit(2);
}
console.log(
	`-- DAN SO: ${NGANH.length} nganh doc tu may chu trong chinh luot chay nay`,
);
const thay = await xem("companies", NGANH, process.env.TRANG ?? "?hide=nothing");
let hong = 0;
for (const g of NGANH) {
	const cho = thay.filter((x) => x.gt === g);
	if (cho.length === 0) {
		console.log(`   NGANH KHONG THAY TREN MAN: ${g}`);
		hong += 1;
		continue;
	}
	const chuaBoc = cho.filter((x) => !x.boc);
	if (chuaBoc.length > 0) hong += chuaBoc.length;
	console.log(
		`   ${chuaBoc.length === 0 ? "boc du " : "CHUA BOC"} ${g.padEnd(22)} ${cho.length} cho, chua boc ${chuaBoc.length}`,
	);
}
console.log(`ket qua: cho chua khai lang=en=${hong}`);
await browser.close();
process.exit(hong > 0 ? 1 : 0);
