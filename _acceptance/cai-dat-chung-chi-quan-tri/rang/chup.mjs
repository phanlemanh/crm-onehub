import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { settingsMessages } from "../../../apps/app/lib/messages/settings.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const RA = join(HERE, "..", "evidence");
const CHROME =
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const VAI = {
	"quan-tri": {
		email: process.env.QUAN_TRI ?? "ada@trycomp.ai",
		coQuyen: true,
	},
	"thanh-vien": {
		email: process.env.THANH_VIEN ?? "marcus@trycomp.ai",
		coQuyen: false,
	},
};
const KHO = [1440, 768];
const CAO = 1800;
const CHO_MS = 30_000;
const t = settingsMessages("vi");
const LY_DO = [
	t.nghienCuu.khongDuQuyen,
	t.luuTru.khongDuQuyen,
	t.model.khongDuQuyen,
];

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

async function traLoiKhoa(cookie) {
	const res = await fetch(`${API}/api/trpc/settings.researchKey`, {
		headers: { cookie: `${cookie.ten}=${cookie.gia}` },
	});
	const body = await res.json().catch(() => null);
	return { ma: res.status, data: body?.result?.data ?? null };
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) return null;
	const dau = new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
	return dau && !dau.startsWith("onboarding") && dau !== "sign-in" ? dau : null;
}

const cay = await canhCay();
if (cay.ket !== "dung-cay")
	await khongDo(`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`);

const cookies = {};
for (const [vai, { email, coQuyen }] of Object.entries(VAI)) {
	const cookie = phien(email);
	if (!cookie) await khongDo(`khong doc duoc cookie phien cua ${email}`);
	const tra = await traLoiKhoa(cookie);
	if (tra.ma !== 200 || tra.data === null)
		await khongDo(`settings.researchKey cua ${vai} tra HTTP ${tra.ma}`);
	if (tra.data.configured !== true)
		await khongDo(
			`tien de: settings.researchKey.configured la ${tra.data.configured} — chay qua scripts/lan-do/tien-de.mjs`,
		);
	if (tra.data.canManage !== coQuyen)
		await khongDo(
			`tien de: ${email} tra canManage ${tra.data.canManage}, can ${coQuyen} de dong vai ${vai}`,
		);
	cookies[vai] = cookie;
}

const slug = await suySlug(cookies["quan-tri"]);
if (!slug) await khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);

mkdirSync(RA, { recursive: true });
const host = new URL(APP).hostname;
trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });

for (const [vai, { coQuyen }] of Object.entries(VAI)) {
	for (const rong of KHO) {
		const ctx = await trinhDuyet.createBrowserContext();
		await ctx.setCookie(
			{ name: cookies[vai].ten, value: cookies[vai].gia, domain: host, path: "/" },
			{ name: "lang", value: "vi", domain: host, path: "/" },
		);
		const p = await ctx.newPage();
		await p.setViewport({ width: rong, height: CAO, deviceScaleFactor: 1 });
		await p.goto(`${APP}/${slug}/settings`, { waitUntil: "load" });
		const duong = new URL(p.url()).pathname;
		if (duong !== `/${slug}/settings`)
			await khongDo(`${vai} ${rong}: trang cuoi la ${duong}, khong phai /${slug}/settings`);
		await p
			.waitForFunction(
				() =>
					document.querySelectorAll("[data-slot=card]").length >= 4 &&
					document.querySelector("[role=combobox]") !== null &&
					(document.querySelector("input[inputmode=numeric]")?.value ?? "") !== "",
				{ timeout: CHO_MS },
			)
			.catch(() => null);
		await p.evaluate(() => document.fonts.ready);
		const tep = join(RA, `E9-${vai}-${rong}.png`);
		await p.screenshot({ path: tep, fullPage: true });
		const soNgay = await p.evaluate(
			() => document.querySelector("input[inputmode=numeric]")?.value ?? "",
		);
		const doc = await p.evaluate((lyDo) => {
			const chu = document.body.innerText;
			const cacO = [
				document.querySelector("input[type=password]"),
				document.querySelector("input[inputmode=numeric]"),
				document.querySelector("[role=combobox]"),
			];
			return {
				lyDo: lyDo.map((c) => chu.includes(c)),
				khoa: cacO.map((o) => (o ? o.disabled === true : null)),
				tran: document.documentElement.scrollWidth - document.documentElement.clientWidth,
			};
		}, LY_DO);
		const nhan = `${vai} ${rong}`;
		kiem(
			`${nhan}: ly do ba card ${doc.lyDo.join(",")}`,
			doc.lyDo.every((c) => c === !coQuyen),
		);
		kiem(
			`${nhan}: control khoa ${doc.khoa.join(",")}`,
			doc.khoa.every((k) => k === !coQuyen),
		);
		kiem(`${nhan}: tran ngang ${doc.tran}px`, doc.tran <= 0);
		kiem(`${nhan}: so ngay hien "${soNgay}"`, /^\d+$/.test(soNgay));
		dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
		await ctx.close();
	}
}

await ket(sai === 0 ? 0 : 1);
