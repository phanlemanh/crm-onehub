import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const goc = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const coSo = process.env.PROTO_URL ?? "http://localhost:3910";
const bun = join(goc, "node_modules/.bun");
const thuMuc = readdirSync(bun).find((t) => t.startsWith("puppeteer-core@"));
const goi = join(bun, thuMuc, "node_modules/puppeteer-core");
const puppeteer = createRequire(join(goi, "package.json"))(goi);

const trinh = await puppeteer.launch({
	executablePath:
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	headless: true,
});
const trang = await trinh.newPage();
await trang.setViewport({ width: 375, height: 812 });
for (const id of process.argv.slice(2)) {
	await trang.goto(`${coSo}/proto/tro-ly-okr-de-xuat?state=${id}`, {
		waitUntil: "networkidle0",
	});
	const ket = await trang.evaluate(() => {
		const w = document.documentElement.clientWidth;
		const ra = [];
		for (const el of document.querySelectorAll("body *")) {
			const r = el.getBoundingClientRect();
			if (r.right > w + 1 && r.width > 0) {
				ra.push(
					`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 80)} right=${Math.round(r.right)}`,
				);
			}
		}
		return {
			sw: document.documentElement.scrollWidth,
			w,
			ra: ra.slice(0, 8),
		};
	});
	console.log(id, JSON.stringify(ket, null, 1));
}
await trinh.close();
