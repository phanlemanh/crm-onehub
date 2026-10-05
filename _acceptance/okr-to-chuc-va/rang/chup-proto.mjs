import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const ANH = join(GOC, "_acceptance/okr-to-chuc-va/evidence/design-pass");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const KHO = [
	{ ten: "mobile-375", rong: 375, cao: 812 },
	{ ten: "desktop-1280", rong: 1280, cao: 900 },
];
const TRANG_THAI = [
	{ id: "ST-donvi-quantri-them", cho: "[data-nut=them-muc-tieu]" },
	{ id: "ST-donvi-thanhvien", cho: "[data-don-vi]" },
	{ id: "ST-luutru-chan-en", cho: "[role=alertdialog] [data-ly-do-chan=okr]" },
	{
		id: "ST-luutru-khoiphuc-chan",
		cho: "[data-slot=archived-list]",
		bam: true,
	},
];

mkdirSync(ANH, { recursive: true });
const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
let loi = 0;
try {
	for (const kho of KHO)
		for (const tt of TRANG_THAI) {
			const p = await trinhDuyet.newPage();
			await p.setViewport({ width: kho.rong, height: kho.cao });
			const res = await p.goto(`${APP}/proto/okr-to-chuc-va?state=${tt.id}`, {
				waitUntil: "domcontentloaded",
				timeout: 240_000,
			});
			let co = await p
				.waitForSelector(tt.cho, { visible: true, timeout: 120_000 })
				.catch(() => null);
			if (co && tt.bam) {
				await p.click("[data-slot=archived-list] button");
				await p.waitForFunction(
					() =>
						[
							...document.querySelectorAll("[data-slot=archived-list] button"),
						].filter((b) => b.textContent?.trim() === "Khôi phục").length >= 2,
					{ timeout: 10_000 },
				);
				await p.evaluate(() => {
					const nut = [
						...document.querySelectorAll("[data-slot=archived-list] button"),
					].filter((b) => b.textContent?.trim() === "Khôi phục");
					nut[1].click();
				});
				co = await p
					.waitForSelector("[data-sonner-toast]", {
						visible: true,
						timeout: 10_000,
					})
					.catch(() => null);
			}
			await new Promise((x) => setTimeout(x, 800));
			const tep = join(ANH, `${tt.id}--${kho.ten}--light.png`);
			await p.screenshot({ path: tep, fullPage: true });
			if (res?.status() !== 200 || !co) {
				loi += 1;
				console.log(
					`khong ve duoc: ${tt.id} ${kho.ten} status=${res?.status()}`,
				);
			} else console.log(`chup ok ${tt.id} ${kho.ten}`);
			await p.close();
		}
} finally {
	await trinhDuyet.close();
}
process.exit(loi === 0 ? 0 : 1);
