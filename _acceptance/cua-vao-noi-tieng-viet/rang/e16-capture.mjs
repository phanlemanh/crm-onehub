import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import puppeteer from "puppeteer-core";

const APP = process.env.APP_URL || "http://localhost:3000";
const [tieng, outPng, outHtml] = process.argv.slice(2);
if (!tieng || !outPng || !outHtml) {
	console.error("usage: e16-capture.mjs <vi|en> <out.png> <out.html>");
	process.exit(2);
}

const CANDIDATES = [
	process.env.CHROME_PATH,
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	"/Applications/Chromium.app/Contents/MacOS/Chromium",
	"/usr/bin/google-chrome",
	"/usr/bin/chromium",
].filter(Boolean);
const exe = CANDIDATES.find((p) => {
	try {
		return existsSync(p);
	} catch {
		return false;
	}
});
if (!exe) {
	console.error("e16-capture: no Chrome/Chromium found");
	process.exit(2);
}

mkdirSync(dirname(outPng), { recursive: true });
mkdirSync(dirname(outHtml), { recursive: true });

const browser = await puppeteer.launch({
	executablePath: exe,
	headless: "new",
	args: ["--no-sandbox"],
});
try {
	const page = await browser.newPage();
	await page.setViewport({ width: 1280, height: 900 });
	await page.setCookie({
		name: "lang",
		value: tieng,
		url: APP,
	});
	await page.goto(`${APP}/sign-in`, {
		waitUntil: "networkidle2",
		timeout: 30000,
	});
	await new Promise((r) => setTimeout(r, 500));
	const htmlLang = await page.evaluate(() => document.documentElement.lang);
	await page.screenshot({ path: outPng, fullPage: true });
	const html = await page
		.content()
		.then((h) => h.replace(/<head([^>]*)>/i, `<head$1><base href="${APP}/">`));
	writeFileSync(outHtml, html, "utf8");
	console.log(`saved ${outPng} and ${outHtml} (lang=${htmlLang})`);
} finally {
	await browser.close();
}
