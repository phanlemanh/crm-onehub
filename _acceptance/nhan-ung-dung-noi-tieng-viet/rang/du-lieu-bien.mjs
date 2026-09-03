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
		cho: ["\u2014"],
		vi_sao_cho:
			"o Phu trach trong phai hien ky hieu o-trong chung cua bo dung (EmptyCellValue), " +
			"khong duoc de trong va khong duoc hien chu tieng Anh",
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
		cho: [],
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
	await page.close();
	return { lang, chu };
}

console.log(`\n-- doc CHU TREN MAN cho tung trang thai (lang=${TIENG})`);
let hong = 0;
for (const c of can) {
	const { lang, chu } = await docMan(c.viDu);
	if (lang !== TIENG) {
		console.log(`KHONG DO DUOC: trang khong o lang=${TIENG} (${lang})`);
		await browser.close();
		process.exit(2);
	}
	if (chu.length === 0) {
		console.log(`KHONG DO DUOC: khong doc duoc chu nao tren man cho ${c.ten}`);
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

	const thieuCho =
		(c.cho?.length > 0 && !c.cho.some((m) => gop.includes(m))) ||
		(c.choMau?.length > 0 && !c.choMau.some((re) => re.test(gop)));
	if (thieuCho) {
		console.log(
			`   THIEU DAU HIEU o trang thai ${c.ten}: cho mot trong ${JSON.stringify(c.cho ?? c.choMau?.map(String))}` +
				(c.vi_sao_cho ? `\n         ${c.vi_sao_cho}` : ""),
		);
		hong += 1;
		continue;
	}

	const tenDay = chu.some((t) => t.includes(c.viDu));
	if (!tenDay) {
		console.log(`   TEN BI CAT o trang thai ${c.ten}: khong thay ${JSON.stringify(c.viDu)} nguyen ven`);
		hong += 1;
		continue;
	}

	const bangChung =
		chu.find((t) => (c.cho ?? []).some((m) => t.includes(m))) ??
		chu.find((t) => (c.choMau ?? []).some((re) => re.test(t))) ??
		c.viDu;
	console.log(
		`   doc duoc  ${c.ten.padEnd(30)} ${chu.length} doan chu · dau hieu ${JSON.stringify(bangChung)}`,
	);
}

await browser.close();
console.log(`\nket qua: trang thai hong=${hong}/${can.length}`);
process.exit(hong > 0 ? 1 : 0);
