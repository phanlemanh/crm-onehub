import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";
import { APP, CHROME, phien, suySlug } from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

const RA = process.env.RA;
const MAN = (process.env.MAN ?? "deals,campaigns").split(",");
const KHO = (process.env.KHO ?? "320,768,1024,1440").split(",").map(Number);
const TIENG = (process.env.TIENG ?? "vi").split(",");
mkdirSync(RA, { recursive: true });
const cookie = phien();
const slug = await suySlug(cookie);
const host = new URL(APP).hostname;
const b = await puppeteer.launch({ executablePath: CHROME, headless: true });
for (const man of MAN)
	for (const tieng of TIENG)
		for (const rong of KHO) {
			const p = await b.newPage();
			await p.setViewport({ width: rong, height: 560, deviceScaleFactor: 1 });
			await b.setCookie(
				{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
				{ name: "lang", value: tieng, domain: host, path: "/" },
			);
			await p.goto(`${APP}/${slug}/${man === "members" ? "settings/members" : man}`, { waitUntil: "load" });
			await p.waitForFunction(() => document.querySelectorAll("tbody tr td").length > 1, { timeout: 20000 }).catch(() => null);
			await p.evaluate(() => document.fonts.ready);
			await new Promise((r) => setTimeout(r, 300));
			await p.screenshot({ path: `${RA}/${man}-${rong}-${tieng}.png` });
			await p.close();
		}
await b.close();
console.log(RA);
