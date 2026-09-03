import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer-core";

const CHO_TAI = Number(process.env.CHO_TAI ?? 120000);
const CHO_VE = Number(process.env.CHO_VE ?? 90000);

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const SLUG = process.env.SLUG ?? "crm";

const NO = [
	{ cu: "Search companies by name or domain…", o: "ô tìm trên màn công ty" },
	{ cu: "Archived", o: "nút chuyển sang màn lưu trữ" },
	{ cu: "Views", o: "nút bảng xem đã lưu" },
	{ cu: "New company", o: "nút tạo công ty" },
	{ cu: "Not researched", o: "nhãn trạng thái bổ sung dữ liệu" },
	{ cu: "Researching", o: "nhãn trạng thái bổ sung dữ liệu" },
	{ cu: "Enriched", o: "nhãn trạng thái bổ sung dữ liệu" },
	{ cu: "Enrichment failed", o: "nhãn trạng thái bổ sung dữ liệu" },
	{ cu: "Nothing found", o: "nhãn trạng thái bổ sung dữ liệu" },
	{ cu: "2d ago", o: "chữ thời gian tương đối" },
];

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

const DOC = () => {
	const ra = [];
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	for (let n = walker.nextNode(); n; n = walker.nextNode()) {
		const el = n.parentElement;
		if (!el || el.closest("script,style,noscript,template")) continue;
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) continue;
		const t = n.nodeValue.replace(/\s+/g, " ").trim();
		if (t !== "") ra.push(t);
	}
	for (const el of document.body.querySelectorAll("*")) {
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) continue;
		for (const a of ["placeholder", "title", "aria-label", "alt"]) {
			const v = el.getAttribute(a);
			if (v) ra.push(v.replace(/\s+/g, " ").trim());
		}
	}
	return ra;
};

const cookie = phien();
const browser = await puppeteer.launch({
	executablePath: CHROME,
	headless: "new",
	args: ["--no-sandbox"],
});

async function chu(locale) {
	const page = await browser.newPage();
	await page.setViewport({ width: 1440, height: 1000 });
	await browser.setCookie(
		{ name: cookie.name, value: cookie.value, domain: "localhost", path: "/" },
		{ name: "lang", value: locale, domain: "localhost", path: "/" },
	);
	await page.goto(`${APP}/${SLUG}/companies?hide=nothing`, {
		waitUntil: "networkidle0",
		timeout: CHO_TAI,
	});
	await page.waitForSelector('[data-slot="table-body"] [data-slot="table-row"]', {
		timeout: CHO_VE,
	});
	await new Promise((r) => setTimeout(r, 1200));
	const lang = await page.evaluate(() => document.documentElement.lang);
	const ra = await page.evaluate(DOC);
	await page.close();
	return { lang, ra };
}

const vi = await chu("vi");
const en = await chu("en");
await browser.close();

if (vi.lang !== "vi" || en.lang !== "en") {
	console.log(`RANG CUN: lang lech (vi->${vi.lang}, en->${en.lang})`);
	process.exit(2);
}

console.log(
	`-- nam chuoi vong ① dinh tuyen sang vong nay, goi ten tung cai (${NO.length} dong)`,
);
let hong = 0;
let khongThay = 0;
for (const { cu, o } of NO) {
	const conO = vi.ra.filter((t) => t.includes(cu)).length;
	const coOEn = en.ra.some((t) => t.includes(cu));
	if (conO > 0) {
		hong += 1;
		console.log(`   CON TIENG ANH  ${JSON.stringify(cu).padEnd(40)} ${conO} cho · ${o}`);
		continue;
	}
	if (!coOEn) {
		khongThay += 1;
		console.log(`   khong hien     ${JSON.stringify(cu).padEnd(40)} · ${o}`);
		continue;
	}
	console.log(`   da dich        ${JSON.stringify(cu).padEnd(40)} · ${o}`);
}
console.log(
	`ket qua: con tieng Anh=${hong} · khong hien de doi chieu=${khongThay} · tong=${NO.length}`,
);
process.exit(hong > 0 ? 1 : 0);
