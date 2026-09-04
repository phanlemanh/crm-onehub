import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer-core";
import { z } from "../../../packages/validation/node_modules/zod/index.js";
import { suySlug } from "./slug.mjs";

const CHO_TAI = Number(process.env.CHO_TAI ?? 120000);
const CHO_VE = Number(process.env.CHO_VE ?? 90000);
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const TIENG = process.env.TIENG ?? "vi";

const chuTrong = z.string().trim().min(1);
const dong = z.object({
	name: chuTrong,
	owner: z.object({ name: chuTrong.nullish() }).nullable().default(null),
	lastActivityAt: z.coerce.date().nullable().default(null),
});
const danhSach = z.object({ rows: z.array(dong) });

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

const cookie = phien();

const url = `${API}/api/trpc/companies.list?input=${encodeURIComponent(
	JSON.stringify({ json: {} }),
)}`;
let res;
try {
	res = await fetch(url, {
		headers: { Cookie: `${cookie.name}=${cookie.value}` },
	});
} catch (loi) {
	console.log(
		`KHONG DO DUOC: khong noi duoc toi may chu o ${API} (${loi.cause?.code ?? loi.message}).\n` +
			"Dung may chu dev TU CAY LAM VIEC nay truoc khi tin bat ky con so nao.",
	);
	process.exit(2);
}
if (!res.ok) {
	console.log(`KHONG DO DUOC: may chu tra ${res.status}, khong doc duoc du lieu thu`);
	process.exit(2);
}
const { rows } = danhSach.parse((await res.json()).result.data);

const BA_MUOI_NGAY = 30 * 86_400_000;
const DAU =
	/[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

const can = [
	{
		ten: "khong nguoi phu trach",
		vi_sao: "khoa facets.unassigned chi hien khi co hang nay",
		loc: (r) => !r.owner,
		oPhaiTrong: ["Phụ trách", "Owner"],
		vi_sao_cho:
			"o Phu trach CUA DUNG HANG DO phai hien ky hieu o-trong chung cua bo dung " +
			"(EmptyCellValue), khong duoc de trang va khong duoc hien chu tieng Anh",
		cam: [/\bUnassigned\b/, /\bNo owner\b/, /\bNone\b/],
	},
	{
		ten: "co hoat dong trong 30 ngay",
		vi_sao: "ba chu thoi gian tuong doi chi hien khi co hang nay",
		loc: (r) =>
			r.lastActivityAt !== null &&
			Date.now() - r.lastActivityAt.getTime() < BA_MUOI_NGAY,
		choMau: [/\d+\s*(giây|phút|giờ|ngày|tuần|tháng|năm)\s+trước/, /vừa xong/],
		cam: [/\b\d+\s*(d|h|m)\s+ago\b/, /\bago\b/, /\bjust now\b/i],
	},
	{
		ten: "ten phap nhan 40-60 ky tu",
		vi_sao: "be rong cot chua bao gio gap ten that dai",
		loc: (r) => r.name.length >= 40 && r.name.length <= 60,
		oKhongCatTran: ["Tên", "Company"],
		cam: [],
	},
];

console.log(`-- tien de: ${rows.length} cong ty trong du lieu thu`);
let thieu = 0;
for (const c of can) {
	const hit = rows.filter(c.loc);
	c.viDu = hit[0]?.name ?? null;
	if (hit.length === 0) {
		console.log(`   KHONG DO DUOC: thieu hang cho trang thai ${c.ten}`);
		console.log(`         vi sao can: ${c.vi_sao}`);
		thieu += 1;
	} else {
		console.log(`   co    ${String(hit.length).padStart(3)} hang · ${c.ten} · vi du ${JSON.stringify(c.viDu)}`);
	}
}
if (thieu > 0) {
	console.log(
		`ket qua: KHONG DO DUOC — thieu ${thieu}/${can.length} trang thai bien.\n` +
			"   Day la TIEN DE, khong phai ket qua do: khong co hang thi khong co gi tren man de doc.\n" +
			"   Chay _acceptance/thuoc-cua-lat-3a-co-rang/gieo-du-lieu-bien.mjs roi do lai.",
	);
	process.exit(2);
}

const SLUG = await suySlug(cookie);
const browser = await puppeteer.launch({
	executablePath: CHROME,
	headless: "new",
	args: ["--no-sandbox"],
});

const DOC = () => {
	const ra = [];
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	for (let n = walker.nextNode(); n; n = walker.nextNode()) {
		const el = n.parentElement;
		if (!el || el.closest("script,style,noscript,template")) continue;
		if (el.closest('nav[aria-label="Primary"]')) continue;
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) continue;
		const t = n.nodeValue.replace(/\s+/g, " ").trim();
		if (t !== "") ra.push(t);
	}
	return ra;
};

const DOC_HANG = (ten) => {
	const dau = [...document.querySelectorAll('[data-slot="table-head"]')].map((h) =>
		(h.textContent ?? "").replace(/\s+/g, " ").trim(),
	);
	const hang = [
		...document.querySelectorAll('[data-slot="table-body"] [data-slot="table-row"]'),
	].find((r) => (r.textContent ?? "").includes(ten));
	if (!hang) return null;
	const o = [...hang.querySelectorAll('[data-slot="table-cell"]')].map((c, i) => {
		const trong = c.querySelector("span,div,a") ?? c;
		return {
			cot: dau[i] ?? `cot-${i}`,
			chu: (c.textContent ?? "").replace(/\s+/g, " ").trim(),
			oRong: Math.round(c.clientWidth),
			chuRong: Math.round(Math.max(c.scrollWidth, trong.scrollWidth)),
			baCham:
				getComputedStyle(trong).textOverflow === "ellipsis" ||
				getComputedStyle(c).textOverflow === "ellipsis",
		};
	});
	return { dau, o };
};

async function docMan(ten) {
	const page = await browser.newPage();
	await page.setViewport({ width: 1440, height: 1000 });
	await browser.setCookie(
		{ name: cookie.name, value: cookie.value, domain: "localhost", path: "/" },
		{ name: "lang", value: TIENG, domain: "localhost", path: "/" },
	);
	await page.goto(
		`${APP}/${SLUG}/companies?hide=nothing&q=${encodeURIComponent(ten)}`,
		{ waitUntil: "networkidle0", timeout: CHO_TAI },
	);
	await page.waitForSelector('[data-slot="table-body"] [data-slot="table-row"]', {
		timeout: CHO_VE,
	});
	await new Promise((r) => setTimeout(r, 800));
	const lang = await page.evaluate(() => document.documentElement.lang);
	const chu = await page.evaluate(DOC);
	const hang = await page.evaluate(DOC_HANG, ten);
	await page.close();
	return { lang, chu, hang };
}

console.log(`\n-- doc CHU TREN MAN cho tung trang thai (lang=${TIENG})`);
let hong = 0;
for (const c of can) {
	const { lang, chu, hang } = await docMan(c.viDu);
	if (lang !== TIENG) {
		console.log(`KHONG DO DUOC: trang khong o lang=${TIENG} (${lang})`);
		await browser.close();
		process.exit(2);
	}
	if (chu.length === 0 || hang === null) {
		console.log(
			`KHONG DO DUOC: khong tim thay hang cua ${JSON.stringify(c.viDu)} tren man cho ${c.ten}`,
		);
		await browser.close();
		process.exit(2);
	}
	const gop = chu.join(" · ");

	const anh = c.cam.filter((re) => re.test(gop));
	if (anh.length > 0) {
		const dong = chu.find((t) => c.cam.some((re) => re.test(t))) ?? "";
		console.log(`   CON TIENG ANH o trang thai ${c.ten}: ${JSON.stringify(dong)}`);
		hong += 1;
		continue;
	}

	let bangChung = null;

	if (c.oPhaiTrong) {
		const o = hang.o.find((x) => c.oPhaiTrong.includes(x.cot));
		if (!o) {
			console.log(
				`KHONG DO DUOC: khong thay cot ${JSON.stringify(c.oPhaiTrong)} — cot co: ${JSON.stringify(hang.dau)}`,
			);
			await browser.close();
			process.exit(2);
		}
		if (o.chu !== "\u2014") {
			console.log(
				`   O KHONG DUNG KY HIEU TRONG o trang thai ${c.ten}: cot ${JSON.stringify(o.cot)} doc ${JSON.stringify(o.chu)}, cho "\u2014"\n` +
					`         ${c.vi_sao_cho}`,
			);
			hong += 1;
			continue;
		}
		bangChung = `${o.cot}="${o.chu}"`;
	}

	if (c.choMau) {
		if (!c.choMau.some((re) => re.test(gop))) {
			console.log(
				`   THIEU DAU HIEU o trang thai ${c.ten}: cho mot trong ${JSON.stringify(c.choMau.map(String))}`,
			);
			hong += 1;
			continue;
		}
		bangChung = chu.find((t) => c.choMau.some((re) => re.test(t))) ?? null;
	}

	if (c.oKhongCatTran) {
		const o = hang.o.find((x) => c.oKhongCatTran.includes(x.cot));
		if (!o) {
			console.log(
				`KHONG DO DUOC: khong thay cot ${JSON.stringify(c.oKhongCatTran)} — cot co: ${JSON.stringify(hang.dau)}`,
			);
			await browser.close();
			process.exit(2);
		}
		const biCat = o.chuRong > o.oRong + 1;
		if (biCat && !o.baCham) {
			console.log(
				`   CAT TRAN o trang thai ${c.ten}: cot ${JSON.stringify(o.cot)} chu ${o.chuRong}px trong o ${o.oRong}px, KHONG co ba cham`,
			);
			hong += 1;
			continue;
		}
		if (!o.chu.includes(c.viDu) && !biCat) {
			console.log(
				`   TEN KHONG DAY DU o trang thai ${c.ten}: cot ${JSON.stringify(o.cot)} doc ${JSON.stringify(o.chu)}`,
			);
			hong += 1;
			continue;
		}
		bangChung = `${o.cot} chu=${o.chuRong}px o=${o.oRong}px ${biCat ? "cat + ba cham" : "du cho"}`;
	}

	console.log(
		`   doc duoc  ${c.ten.padEnd(30)} ${chu.length} doan chu · ${bangChung}`,
	);
}

await browser.close();
console.log(`\nket qua: trang thai hong=${hong}/${can.length}`);
process.exit(hong > 0 ? 1 : 0);
