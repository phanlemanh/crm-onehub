import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { companyMessages } from "../../../apps/app/lib/messages/companies.ts";
import { recordSheetMessages } from "../../../apps/app/lib/messages/record-sheet.ts";
import { db } from "../../../packages/db/src/index.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const RA = join(HERE, "..", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const EMAIL = process.env.QUAN_TRI ?? "ada@trycomp.ai";
const KHO = [
	[1440, 1000],
	[390, 844],
];
const NGON_NGU = ["vi", "en"];
const CHO_MS = 30_000;
const TEN_CONG_TY = "Titan chụp E10";
const MIEN_CONG_TY = "e10-tthv.vn";
const DAN = "https://www.facebook.com/titanmiennam";

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

const tenVung = (locale) =>
	new Intl.DisplayNames([locale], { type: "region" }).of("US");

const cay = await canhCay();
if (cay.ket !== "dung-cay")
	await khongDo(
		`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
	);

await db.company.deleteMany({ where: { domain: MIEN_CONG_TY } });
await db.company.create({
	data: {
		name: TEN_CONG_TY,
		domain: MIEN_CONG_TY,
		website: `https://${MIEN_CONG_TY}`,
		city: "Menlo Park",
		stateCode: "CA",
		country: "United States",
		countryCode: "US",
		enrichmentStatus: "COMPLETE",
	},
});

const cookie = phien(EMAIL);
if (!cookie) await khongDo(`khong doc duoc cookie phien cua ${EMAIL}`);
const slug = await suySlug(cookie);
if (!slug) await khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);

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

for (const lang of NGON_NGU) {
	const r = recordSheetMessages(lang);
	const mong = tenVung(lang);
	for (const [rong, cao] of KHO) {
		const { ctx, p } = await moTrang(lang, rong, cao, `/${slug}/companies`);
		if (!(await choChu(p, TEN_CONG_TY)))
			await khongDo(`E10 ${lang} ${rong}: danh sach khong co ${TEN_CONG_TY}`);
		await p.evaluate((ten) => {
			const o = [...document.querySelectorAll("a, button, td, span")].find(
				(e) => e.textContent?.trim() === ten,
			);
			o?.click();
		}, TEN_CONG_TY);
		await choChu(p, r.company.fields.country);
		await new Promise((xong) => setTimeout(xong, 600));
		const ket = await p.evaluate((nhan) => {
			const label = [...document.querySelectorAll("label")].find(
				(l) => l.textContent?.trim() === nhan,
			);
			const hang = label?.parentElement;
			hang?.scrollIntoView({ block: "center" });
			return {
				o: hang?.textContent ?? "",
				than: document.body.innerText,
			};
		}, r.company.fields.country);
		const tep = join(RA, `E10-quoc-gia-${lang}-${rong}.png`);
		await p.screenshot({ path: tep });
		kiem(`E10 ${lang} ${rong}: o Quoc gia la ${mong}`, ket.o.includes(mong));
		kiem(
			`E10 ${lang} ${rong}: dong phu co Menlo Park, CA, ${mong}`,
			ket.than.includes(`Menlo Park, CA, ${mong}`),
		);
		kiem(
			`E10 ${lang} ${rong}: tran ngang ${await tran(p)}px`,
			(await tran(p)) <= 0,
		);
		dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
		await ctx.close();
	}
}

const m = companyMessages("vi");
for (const [rong, cao] of KHO) {
	const { ctx, p } = await moTrang(
		"vi",
		rong,
		cao,
		`/${slug}/companies?new=true`,
	);
	await p.waitForSelector("form#create-company input", { timeout: CHO_MS });
	const o = await p.$$("form#create-company input");
	await o[0].type("Titan");
	await o[1].type(DAN);
	await p.evaluate(() =>
		document.querySelector('button[form="create-company"]')?.click(),
	);
	const thay = await choChu(p, m.nenTang("Facebook"));
	const viTri = await p.evaluate(() => {
		const oNhap = document.querySelector(
			"form#create-company input[inputmode=url]",
		);
		const id = oNhap?.getAttribute("aria-describedby");
		const loi = id ? document.getElementById(id) : null;
		if (!oNhap || !loi) return null;
		const a = oNhap.getBoundingClientRect();
		const b = loi.getBoundingClientRect();
		return { duoi: b.top >= a.bottom - 1, sat: b.top - a.bottom < 24 };
	});
	const tep = join(RA, `E10-loi-nen-tang-${rong}.png`);
	await p.screenshot({ path: tep });
	kiem(`E10 vi ${rong}: dong loi goi ten Facebook`, thay);
	kiem(
		`E10 vi ${rong}: dong loi nam ngay duoi o Ten mien`,
		viTri?.duoi === true && viTri?.sat === true,
	);
	kiem(`E10 vi ${rong}: tran ngang ${await tran(p)}px`, (await tran(p)) <= 0);
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
	await ctx.close();
}

await db.company.deleteMany({ where: { domain: MIEN_CONG_TY } });
await ket(sai === 0 ? 0 : 1);
