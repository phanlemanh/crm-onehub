import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docTep } from "../../man-cai-dat-noi-tieng-viet/rang/tep-thay.mjs";
import puppeteer from "puppeteer-core";
import {
	APP,
	canhCong,
	datTrinhDuyet,
	ket,
	phien,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANG = JSON.parse(docTep(join(HERE, "chu-la-cua-kho.json")));
const LOAI_TRU = BANG.loai_tru;
const THUOC = ["aria-label", "title", "placeholder", "alt"];
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

let soFileQuet = 0;

function coTrongNguon(chu) {
	const bo = LOAI_TRU.map((t) => `--exclude-dir=${t}`).join(" ");
	const ra = execFileSync(
		"bash",
		["-lc", `cd ${GOC} && grep -rl ${bo} --include=*.ts --include=*.tsx -F ${JSON.stringify(chu)} apps packages 2>/dev/null | head -1`],
		{ encoding: "utf8" },
	).trim();
	return ra.length > 0;
}

function demFileQuet() {
	const bo = LOAI_TRU.map((t) => `-path "*/${t}/*" -prune -o`).join(" ");
	const ra = execFileSync(
		"bash",
		["-lc", `cd ${GOC} && find apps packages ${bo} \\( -name "*.ts" -o -name "*.tsx" \\) -print 2>/dev/null | wc -l`],
		{ encoding: "utf8" },
	).trim();
	return Number(ra);
}

async function gomMan(trinhDuyet, cookie, slug, man) {
	const trang = await trinhDuyet.newPage();
	await trang.setViewport({ width: 1280, height: 900 });
	await trinhDuyet.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: "localhost", path: "/" },
		{ name: "lang", value: "vi", domain: "localhost", path: "/" },
	);
	const duong = `/${slug}${man}`;
	let loi = null;
	try {
		const res = await trang.goto(`${APP}${duong}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
		if (res === null || res.status() >= 400) loi = `HTTP ${res === null ? "?" : res.status()}`;
	} catch (e) {
		loi = String(e).slice(0, 80);
	}
	await new Promise((r) => setTimeout(r, 6000));
	if (loi === null && new URL(trang.url()).pathname !== duong)
		loi = `chuyen huong ve ${new URL(trang.url()).pathname}`;
	if (loi !== null) {
		await trang.close();
		return { loi, chuoi: [] };
	}
	const chuoi = await trang.evaluate((thuoc) => {
		const bo = (el) => el.closest("script,style,noscript,template,nextjs-portal,[data-nextjs-toast]") !== null;
		const ra = [];
		for (const el of document.body.querySelectorAll("*")) {
			if (bo(el)) continue;
			const r = el.getBoundingClientRect();
			if (el.children.length === 0 && r.width > 1 && r.height > 1) {
				const c = (el.textContent ?? "").trim();
				if (c) ra.push({ chu: c, tu: "van ban" });
			}
			for (const a of thuoc) {
				const v = el.getAttribute(a);
				if (v && v.trim()) ra.push({ chu: v.trim(), tu: a });
			}
		}
		return ra;
	}, THUOC);
	await trang.close();
	return { loi: null, chuoi };
}

const DONG = process.argv[2] ?? "quet";

const cookie = phien();
const slug = await suySlug(cookie);
await canhCong(cookie, slug);
const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: "new",
	args: ["--no-sandbox", "--window-size=1280,900"],
});
datTrinhDuyet(trinhDuyet);

soFileQuet = demFileQuet();
console.log(`tap loai tru ghim ten: ${LOAI_TRU.join(" · ")} — con ${soFileQuet} file nguon de hoi`);

const dongChuoi = new Map();
const dongMau = [];
for (const d of BANG.dong) {
	if (String(d.chu) === d.chu) dongChuoi.set(d.chu, d);
	else dongMau.push({ ...d, re: new RegExp(d.mau) });
}
const khopBoi = new Map();
const thay = new Map();
const manHong = [];
for (const m of BANG.man) {
	const ra = await gomMan(trinhDuyet, cookie, slug, m.duong);
	if (ra.loi !== null) {
		manHong.push(`${m.duong} — ${ra.loi}`);
		continue;
	}
	const rieng = new Set(ra.chuoi.map((o) => o.chu));
	console.log(`-- man ${m.duong} · ${rieng.size} chuoi nhin thay duoc (neo toi thieu ${m.toi_thieu})`);
	if (rieng.size < m.toi_thieu) {
		console.log(`KHONG DO DUOC: man ${m.duong} chi ve ra ${rieng.size} chuoi, neo doi it nhat ${m.toi_thieu} — man co the da chuyen huong hoac chua kip ve.`);
		await ket(2);
	}
	for (const o of ra.chuoi) if (!thay.has(o.chu)) thay.set(o.chu, { ...o, man: m.duong });
}

if (manHong.length > 0) {
	console.log("KHONG DO DUOC: khong dung duoc het cac man trong ban khai:");
	for (const d of manHong) console.log(`   ${d}`);
	await ket(2);
}

const ANH = (c) => /^[\x20-\x7E]+$/.test(c) && /[a-z]/.test(c) && c.length > 2 && c.length < 200;
const la = [];
for (const [chu, o] of thay) {
	if (!ANH(chu)) continue;
	if (coTrongNguon(chu)) continue;
	la.push({ ...o, chu });
}

const khongKhai = [];
for (const o of la) {
	if (dongChuoi.has(o.chu)) {
		khopBoi.set(o.chu, o.chu);
		continue;
	}
	const m = dongMau.find((d) => d.re.test(o.chu));
	if (m !== undefined) {
		khopBoi.set(m.mau, o.chu);
		continue;
	}
	khongKhai.push(o);
}
console.log(`\nchuoi tieng Anh KHONG co trong file nguon nao: ${la.length} · da khai ${la.length - khongKhai.length} · chua khai ${khongKhai.length}`);
for (const o of khongKhai) console.log(`   LA: ${o.man}:${o.tu}: ${JSON.stringify(o.chu)}`);
if (khongKhai.length > 0) await ket(1);

const dongChet = BANG.dong
	.filter((d) => !khopBoi.has(String(d.chu) === d.chu ? d.chu : d.mau))
	.map((d) => JSON.stringify(d.chu ?? d.mau));
for (const d of dongChet) console.log(`   DONG KHAI CHET: ${d} — khai trong bang ma khong chuoi nao tren man khop no`);
if (dongChet.length > 0) await ket(1);

const kho = readFileSync(join(GOC, "packages/ui/src/lib/messages.ts"), "utf8");
const khoaChet = BANG.dong
	.filter((d) => d.ly_do === "sinh tu kho chuoi" && !new RegExp(`\\b${d.khoa}\\b`).test(kho))
	.map((d) => `${JSON.stringify(d.chu)} tro khoa ${d.khoa} — khong con trong kho chuoi`);
for (const d of khoaChet) console.log(`   KHOA CHET: ${d}`);
if (khoaChet.length > 0) await ket(1);

if (DONG === "dong-khai") {
	console.log(`XANH (dong-khai): ca ${BANG.dong.length} dong khai deu con doi tuong that tren man.`);
	await ket(0);
}
console.log(`XANH: moi chuoi khong-thuoc-ve-ai deu nam trong bang ${BANG.dong.length} dong nam ly do, va moi dong "sinh tu kho chuoi" con tro mot khoa co that.`);
await ket(0);
