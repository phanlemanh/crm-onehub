import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { troLyOkrMessages } from "../../../apps/app/lib/messages/tro-ly-okr.ts";
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
const CHO_MS = 30_000;
const CAM_VI = [
	"Trợ lý",
	"trợ lý",
	"Máy soạn",
	"máy soạn",
	"Máy góp ý",
	"Máy tóm tắt",
	"Máy ghi số",
	"Máy chạy ở chế độ ẩn",
	"Máy đang soạn",
	"máy không đọc",
	"Tác nhân nghiên cứu",
];
const t = troLyOkrMessages("vi");

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

async function mo(ctx, duong, rong, cao) {
	const p = await ctx.newPage();
	await p.setViewport({ width: rong, height: cao, deviceScaleFactor: 1 });
	await p.goto(`${APP}${duong}`, { waitUntil: "load" });
	return p;
}

const chuChinh = (p) =>
	p.evaluate(() => (document.querySelector("main") ?? document.body).innerText);
const camTrong = (chu) => CAM_VI.filter((c) => chu.includes(c));
const tran = (p) =>
	p.evaluate(
		() =>
			document.documentElement.scrollWidth -
			document.documentElement.clientWidth,
	);
const choChu = (p, chu) =>
	p
		.waitForFunction(
			(c) => document.body.innerText.includes(c),
			{ timeout: CHO_MS },
			chu,
		)
		.catch(() => null);

const cay = await canhCay();
if (cay.ket !== "dung-cay")
	await khongDo(
		`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
	);

const congTy = await db.company.findFirst({
	select: { id: true },
	orderBy: { createdAt: "asc" },
});
const cookie = phien(EMAIL);
if (!cookie) await khongDo(`khong doc duoc cookie phien cua ${EMAIL}`);
const slug = await suySlug(cookie);
if (!slug) await khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);

mkdirSync(RA, { recursive: true });
const host = new URL(APP).hostname;
trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });

for (const [rong, cao] of KHO) {
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const p = await mo(ctx, `/${slug}/settings/okr`, rong, cao);
	await choChu(p, t.troLy.tieuDe);
	await p.evaluate(() => document.fonts.ready);
	const chu = await chuChinh(p);
	kiem(
		`E14 ${rong}: cai dat OKR co tieu de «${t.troLy.tieuDe}»`,
		chu.includes(t.troLy.tieuDe),
	);
	kiem(
		`E14 ${rong}: cai dat OKR khong cum cam [${camTrong(chu).join(", ")}]`,
		camTrong(chu).length === 0,
	);
	kiem(`E14 ${rong}: tran ngang ${await tran(p)}px`, (await tran(p)) <= 0);
	const tep = join(RA, `E14-cai-dat-okr-${rong}.png`);
	await p.screenshot({ path: tep, fullPage: true });
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);

	if (rong === 1440) {
		const man = [
			["soan-okr", `/${slug}/okr/soan`],
			["tai-lieu", `/${slug}/tai-lieu`],
			...(congTy
				? [
						[
							"tab-kara",
							`/${slug}/companies?record=company:${congTy.id}&tab=agent`,
						],
					]
				: []),
		];
		if (!congTy)
			dong.push("KHONG DO DUOC: kho do khong co cong ty nao de mo tab Kara");
		for (const [ten, duong] of man) {
			const q = await mo(ctx, duong, rong, cao);
			await new Promise((r) => setTimeout(r, 2500));
			const c = await chuChinh(q);
			kiem(
				`E14 ${ten}: khong cum cam [${camTrong(c).join(", ")}]`,
				camTrong(c).length === 0,
			);
			const anh = join(RA, `E14-${ten}-1440.png`);
			await q.screenshot({ path: anh });
			dong.push(`ANH ${anh.slice(GOC.length + 1)}`);
		}
	}
	await ctx.close();
}

await ket(sai === 0 ? 0 : 1);
