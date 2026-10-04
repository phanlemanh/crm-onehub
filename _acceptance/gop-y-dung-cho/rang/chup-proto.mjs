import { mkdirSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const hoSo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const goc = resolve(hoSo, "../..");
const slug = "gop-y-dung-cho";
const coSo = process.env.PROTO_URL ?? "http://localhost:3300";
const ra = join(hoSo, "evidence/design-pass");
mkdirSync(ra, { recursive: true });

const bun = join(goc, "node_modules/.bun");
const thuMuc = readdirSync(bun).find((t) => t.startsWith("puppeteer-core@"));
if (!thuMuc) {
	console.error("khong tim thay puppeteer-core");
	process.exit(2);
}
const goi = join(bun, thuMuc, "node_modules/puppeteer-core");
const puppeteer = createRequire(join(goi, "package.json"))(goi);

const { PROTO_CATALOG } = await import(
	join(goc, "apps/app/app/proto/catalog.ts")
);
const muc = PROTO_CATALOG.find((m) => m.slug === slug);
const chon = process.argv.slice(2);
const states = muc.states
	.map((s) => s.id)
	.filter((id) => chon.length === 0 || chon.includes(id));
const kho = [
	{ ten: "desktop-1280", w: 1280, h: 900 },
	{ ten: "mobile-375", w: 375, h: 812 },
];
const themes = (process.env.THEMES ?? "light,dark").split(",");

const trinh = await puppeteer.launch({
	executablePath:
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	headless: true,
});
const trang = await trinh.newPage();
await trang.setCookie({ name: "lang", value: "vi", url: coSo });
let tran = 0;
const bang = [];
for (const theme of themes) {
	await trang.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: theme },
	]);
	for (const k of kho) {
		for (const id of states) {
			await trang.setViewport({ width: k.w, height: k.h });
			const url = `${coSo}/proto/${slug}?state=${id}`;
			const r = await trang.goto(url, { waitUntil: "networkidle0" });
			if (!r?.ok()) {
				console.error(`loi ${r?.status()} ${url}`);
				process.exitCode = 1;
				continue;
			}
			await trang.evaluate(() => {
				for (const s of [
					"nextjs-portal",
					".tsqd-parent-container",
					".tsqd-open-btn-container",
				]) {
					for (const el of document.querySelectorAll(s)) el.remove();
				}
			});
			await new Promise((ok) => setTimeout(ok, 400));
			const cao = await trang.evaluate(
				() => document.documentElement.scrollHeight,
			);
			await trang.setViewport({ width: k.w, height: Math.max(k.h, cao) });
			await new Promise((ok) => setTimeout(ok, 300));
			const do_ = await trang.evaluate(() => ({
				sw: document.documentElement.scrollWidth,
				cw: document.documentElement.clientWidth,
			}));
			const tranNgang = do_.sw > do_.cw;
			if (tranNgang) {
				tran++;
				console.error(`tran ngang: ${id} ${k.ten} ${theme}`);
			}
			const tep = `${process.env.TIEN_TO ?? ""}${id}--${k.ten}--${theme}.png`;
			await trang.screenshot({ path: join(ra, tep) });
			bang.push({ id, kho: k.ten, theme, sw: do_.sw, cw: do_.cw, tep });
			console.log(`${id} ${k.ten} ${theme}`);
		}
	}
}
await trinh.close();
console.log("| state | kho | theme | scrollWidth | clientWidth | tran |");
console.log("|---|---|---|---|---|---|");
for (const b of bang) {
	console.log(
		`| ${b.id} | ${b.kho} | ${b.theme} | ${b.sw} | ${b.cw} | ${b.sw > b.cw ? "CO" : "khong"} |`,
	);
}
console.log(`xong; ${bang.length} anh; tran ngang: ${tran}`);
if (tran > 0) process.exitCode = 3;
