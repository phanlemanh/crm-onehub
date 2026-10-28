import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME =
	process.env.CHROME_PATH ??
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const GOC = process.env.PROTO_URL ?? "http://localhost:3302";
const ra = process.argv[2];
const STATES = [
	"ST-camxuc-cng",
	"ST-camxuc-nhieu",
	"ST-camxuc-hop",
	"ST-camxuc-ngan",
];
const KHO = [
	{ ten: "desktop-1280", width: 1280, height: 800, cham: false },
	{ ten: "mobile-375", width: 375, height: 812, cham: true },
];

mkdirSync(ra, { recursive: true });
const tr = await puppeteer.launch({ executablePath: CHROME, headless: true });
for (const k of KHO) {
	const p = await tr.newPage();
	await p.setViewport({
		width: k.width,
		height: k.height,
		isMobile: k.cham,
		hasTouch: k.cham,
	});
	await p.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: "light" },
	]);
	for (const s of STATES) {
		await p.goto(`${GOC}/proto/cam-xuc-tren-cap-nhat?state=${s}`, {
			waitUntil: "networkidle0",
		});
		await new Promise((r) => setTimeout(r, 600));
		if (s === "ST-camxuc-nhieu") {
			if (k.cham) await p.tap("[data-mo-cam-xuc]");
			else await p.hover("[data-cam-xuc]");
			await new Promise((r) => setTimeout(r, 500));
		}
		const tran = await p.evaluate(
			() => document.documentElement.scrollWidth - window.innerWidth,
		);
		console.log(`${s} ${k.ten} tran-ngang=${tran}`);
		await p.screenshot({
			path: `${ra}/${s}--${k.ten}.png`,
			fullPage: s !== "ST-camxuc-nhieu",
		});
	}
	await p.close();
}
await tr.close();
