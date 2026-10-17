import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { companyMessages } from "../../../apps/app/lib/messages/companies.ts";
import { BANG_NGANH } from "../../../apps/app/lib/ten-nganh.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

// Chạy qua executors.script.dtn_chup (mot-luot.sh dựng phiên đo, kho dùng-một-lần).
const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const RA = join(HERE, "..", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const EMAIL = process.env.QUAN_TRI ?? "ada@trycomp.ai";
const KHO = [
	[1440, 1000],
	[390, 844],
];
const NGON_NGU = ["vi", "en"];
const CHO_MS = 30_000;
const DAU_TEN = "Ngành chụp E8";
const MO_NGAN = "Real Estate & PropTech";
const LUOT = Date.now().toString(36);

const dong = [];
let sai = 0;
let trinhDuyet = null;

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	for (const d of dong) console.log(d);
	console.log(
		`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
	);
	process.exit(ma);
}

async function khongDo(cau) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	await ket(2);
}

function kiem(nhan, dat) {
	if (dat) dong.push(`DUNG ${nhan}`);
	else {
		sai += 1;
		dong.push(`SAI ${nhan}`);
	}
}

function phien(email) {
	const ra = execFileSync("bun", ["run", "dev:session", email], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) return null;
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

async function ghi(cookie, thuTuc, vao) {
	const res = await fetch(`${API}/api/trpc/${thuTuc}`, {
		method: "POST",
		headers: {
			cookie: `${cookie.ten}=${cookie.gia}`,
			"content-type": "application/json",
		},
		body: JSON.stringify(vao),
	});
	if (!res.ok) return null;
	return (await res.json())?.result?.data ?? null;
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) return null;
	const dau = new URL(dich, APP).pathname
		.replace(/^\/+|\/+$/g, "")
		.split("/")[0];
	return dau && !dau.startsWith("onboarding") && dau !== "sign-in" ? dau : null;
}

const cay = await canhCay();
if (cay.ket !== "dung-cay")
	await khongDo(
		`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
	);

const cookie = phien(EMAIL);
if (!cookie) await khongDo(`khong doc duoc cookie phien cua ${EMAIL}`);
const slug = await suySlug(cookie);
if (!slug) await khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);

// Dữ liệu mẫu qua đường ghi thật: tạo công ty rồi sửa ngành bằng API của bàn đo.
const NGANH = Object.keys(BANG_NGANH);
for (const [i, nganh] of NGANH.entries()) {
	const so = String(i + 1).padStart(2, "0");
	const tao = await ghi(cookie, "companies.create", {
		name: `${DAU_TEN} ${so}`,
		domain: `e8-${so}-${LUOT}.dtn.vn`,
	});
	if (!tao?.id) await khongDo(`API khong tao duoc cong ty mau ${so}`);
	const sua = await ghi(cookie, "companies.update", {
		id: tao.id,
		data: { industry: nganh },
	});
	if (!sua) await khongDo(`API khong sua duoc nganh cua cong ty mau ${so}`);
}
dong.push(`DU LIEU ${NGANH.length} cong ty mau qua API (luot ${LUOT})`);

mkdirSync(RA, { recursive: true });
const host = new URL(APP).hostname;
trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
const tran = (p) =>
	p.evaluate(
		() =>
			document.documentElement.scrollWidth -
			document.documentElement.clientWidth,
	);

async function moTrang(lang, rong, cao, duong) {
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: lang, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({ width: rong, height: cao, deviceScaleFactor: 1 });
	await p.goto(`${APP}${duong}`, { waitUntil: "load" });
	return { ctx, p };
}

const choChu = (p, chu) =>
	p
		.waitForFunction(
			(c) => document.body.innerText.includes(c),
			{ timeout: CHO_MS },
			chu,
		)
		.then(() => true)
		.catch(() => false);

const tim = encodeURIComponent(`${DAU_TEN}`);
for (const lang of NGON_NGU) {
	const mong = (goc) => (lang === "vi" ? BANG_NGANH[goc] : goc);
	const tieuDe = companyMessages(lang).headers.industry;
	for (const [rong, cao] of KHO) {
		const { ctx, p } = await moTrang(
			lang,
			rong,
			cao,
			`/${slug}/companies?q=${tim}`,
		);
		if (!(await choChu(p, `${DAU_TEN} 01`)))
			await khongDo(`E8 ${lang} ${rong}: bang khong co ${DAU_TEN} 01`);
		await new Promise((xong) => setTimeout(xong, 600));
		const o = await p.evaluate((td) => {
			const th = [...document.querySelectorAll("th")];
			const cot = th.findIndex((e) => e.textContent?.trim() === td);
			if (cot < 0) return { cot: -1, hang: [] };
			return {
				cot,
				hang: [...document.querySelectorAll("tbody tr")].map((tr) => {
					const o = tr.querySelectorAll("td")[cot];
					const chu = o?.querySelector("span") ?? o;
					return {
						ten: tr.textContent ?? "",
						nganh: o?.textContent?.trim() ?? "",
						cat: chu ? chu.scrollWidth > chu.clientWidth : false,
					};
				}),
			};
		}, tieuDe);
		const tep = join(RA, `E8-bang-${lang}-${rong}.png`);
		await p.screenshot({ path: tep, fullPage: true });
		dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
		if (o.cot < 0) {
			// Cột Ngành ẩn dưới khổ lg — đúng thiết kế bảng, không phải lỗi của vòng.
			dong.push(
				`E8 cat ${lang} ${rong}: cot Nganh an o kho nay (hideBelow lg)`,
			);
		} else {
			const hienRa = new Set(o.hang.map((h) => h.nganh));
			const thieu = NGANH.filter((g) => !hienRa.has(mong(g)));
			kiem(
				`E8 ${lang} ${rong}: cot Nganh hien ${lang === "vi" ? "ten Viet" : "chu goc"} cua ca ${NGANH.length} nganh${thieu.length ? ` (thieu: ${thieu.join(", ")})` : ""}`,
				thieu.length === 0,
			);
			const cat = o.hang.filter((h) => h.cat).map((h) => h.nganh);
			dong.push(
				`E8 cat ${lang} ${rong}: ${cat.length}/${NGANH.length}${cat.length ? ` — ${cat.join(" | ")}` : ""}`,
			);
		}
		kiem(
			`E8 ${lang} ${rong}: bang tran ngang ${await tran(p)}px`,
			(await tran(p)) <= 0,
		);

		const soMo = String(NGANH.indexOf(MO_NGAN) + 1).padStart(2, "0");
		await p.evaluate((ten) => {
			const o = [...document.querySelectorAll("a, button, td, span")].find(
				(e) => e.textContent?.trim() === ten,
			);
			o?.click();
		}, `${DAU_TEN} ${soMo}`);
		const thay = await choChu(p, mong(MO_NGAN));
		await new Promise((xong) => setTimeout(xong, 600));
		const tepNgan = join(RA, `E8-ngan-${lang}-${rong}.png`);
		await p.screenshot({ path: tepNgan });
		dong.push(`ANH ${tepNgan.slice(GOC.length + 1)}`);
		kiem(`E8 ${lang} ${rong}: ngan cong ty hien ${mong(MO_NGAN)}`, thay);
		kiem(
			`E8 ${lang} ${rong}: ngan tran ngang ${await tran(p)}px`,
			(await tran(p)) <= 0,
		);
		await ctx.close();
	}
}

await ket(sai === 0 ? 0 : 1);
