import { mkdirSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const hoSo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const goc = resolve(hoSo, "../..");
const slug = "hop-thong-bao-tren-web";
const ra = join(hoSo, "evidence/design-pass");
mkdirSync(ra, { recursive: true });

const STATES = [
	"ST-ngu-canh",
	"ST-chuong-co-chua-doc",
	"ST-chuong-99",
	"ST-chuong-het-chua-doc",
	"ST-chuong-rong",
	"ST-chuong-cho-tai",
	"ST-chuong-loi",
	"ST-trang-co",
	"ST-trang-loc-chua-doc-rong",
	"ST-trang-rong",
	"ST-trang-cho-tai",
	"ST-trang-loi",
];
const KHO = [
	{ ten: "desktop-1280", w: 1280, h: 900 },
	{ ten: "mobile-375", w: 375, h: 812 },
];
const NEN = ["light", "dark"];

function ketLuan(ma, cau) {
	console.log(`KET LUAN ma ${ma}${cau ? ` — ${cau}` : ""}`);
	process.exit(ma);
}

const coSo = process.env.PROTO_URL;
if (!coSo) ketLuan(2, "dat PROTO_URL toi ban mau dang chay");

const bun = join(goc, "node_modules/.bun");
const thuMuc = readdirSync(bun).find((t) => t.startsWith("puppeteer-core@"));
if (!thuMuc) ketLuan(2, "khong tim thay puppeteer-core trong node_modules");
const goi = join(bun, thuMuc, "node_modules/puppeteer-core");
const puppeteer = createRequire(join(goi, "package.json"))(goi);

const trinh = await puppeteer.launch({
	executablePath:
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	headless: true,
});
const trang = await trinh.newPage();
let sai = 0;

for (const nen of NEN)
	for (const k of KHO)
		for (const state of STATES) {
			await trang.emulateMediaFeatures([
				{ name: "prefers-color-scheme", value: nen },
			]);
			await trang.setViewport({ width: k.w, height: k.h });
			const r = await trang.goto(`${coSo}/proto/${slug}?state=${state}`, {
				waitUntil: "networkidle0",
			});
			if (!r?.ok()) {
				sai++;
				console.log(`SAI ${state} ${k.ten} ${nen} — trang tra ${r?.status()}`);
				continue;
			}
			await trang.evaluate(() => {
				for (const s of [
					"nextjs-portal",
					".tsqd-parent-container",
					".tsqd-open-btn-container",
				])
					for (const el of document.querySelectorAll(s)) el.remove();
			});
			await new Promise((ok) => setTimeout(ok, 500));
			const kq = await trang.evaluate(() => {
				const loi = [];
				const doc = document.documentElement;
				if (doc.scrollWidth > doc.clientWidth + 1)
					loi.push(`cuon ngang ${doc.scrollWidth}>${doc.clientWidth}`);
				const o = document.querySelector("[data-slot=popover-content]");
				if (o) {
					const b = o.getBoundingClientRect();
					if (b.left < 0 || b.right > window.innerWidth + 1)
						loi.push(`o bat ra tran khung ${b.left}-${b.right}`);
				}
				const nut = document.querySelector("[data-slot=chuong-thong-bao]");
				if (nut && !nut.getAttribute("aria-label"))
					loi.push("chuong thieu aria-label");
				return loi;
			});
			const tep = `${state}--${k.ten}--${nen}.png`;
			await trang.screenshot({ path: join(ra, tep) });
			if (kq.length) {
				sai++;
				console.log(`SAI ${tep} — ${kq.join("; ")}`);
			} else console.log(`DUNG ${tep}`);
		}

await trinh.close();
ketLuan(sai ? 1 : 0, sai ? `${sai} anh co loi` : "");
