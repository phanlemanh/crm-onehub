import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { dien } from "../../../apps/app/components/crm/record-sheet/plan-copy.tsx";
import { tinHieuMessages } from "../../../apps/app/lib/messages/tin-hieu.ts";
import { db } from "../../../packages/db/src/index.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "tieu-diem-sau-hop-xoa-tin-hieu", "evidence");
const SO_O = join(RA, "o.jsonl");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const QUAN_TRI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const ON_DINH_MS = 600;
const TAB_TOI_DA = 120;
const KHO = [375, 1280];
const CA = ["giu-lai", "esc", "lay-ve", "mang", "xoa-xong"];
const MA_TRAN = CA.flatMap((c) => KHO.map((w) => `${c}-${w}`));
const m = tinHieuMessages("vi");

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
const tao = { user: [], member: [] };

function kiem(o, nhan, dat, ghi) {
	if (!MA_TRAN.includes(o)) throw new Error(`o ${o} khong co trong MA_TRAN`);
	daPhat.add(o);
	dong.push(`${dat ? "DUNG" : "SAI"} ${o}: ${nhan}`);
	appendFileSync(
		SO_O,
		`${JSON.stringify({ o, ...ghi, ket_luan: dat ? "DUNG" : "SAI" })}\n`,
	);
	if (!dat) sai += 1;
}

class KhongDo extends Error {}
function khongDo(cau) {
	throw new KhongDo(cau);
}

function phien(email) {
	const ra = execFileSync("bun", ["run", "dev:session", email], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) khongDo(`khong doc duoc cookie phien cua ${email}`);
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) khongDo(`${APP}/ tra ${res.status} khong co Location`);
	const dau = new URL(dich, APP).pathname.split("/").filter(Boolean)[0];
	if (!dau || dau === "sign-in" || dau.startsWith("onboarding"))
		khongDo(`${APP}/ chuyen toi ${dich}`);
	return dau;
}

async function nguoiThanhVien(o) {
	const qt = await db.user.findUnique({
		where: { email: QUAN_TRI },
		select: { members: { select: { organizationId: true }, take: 1 } },
	});
	const to = qt?.members[0]?.organizationId;
	if (!to) khongDo(`${QUAN_TRI} khong thuoc workspace nao`);
	const ma = `${o}-${Date.now().toString(36)}`;
	const email = `tdx-${ma}@thu.test`;
	const nguoi = await db.user.create({
		data: {
			id: `tdx-${ma}`,
			email,
			name: "Người đo TH6b",
			emailVerified: true,
		},
		select: { id: true },
	});
	tao.user.push(nguoi.id);
	await db.member.create({
		data: {
			id: `member-tdx-${ma}`,
			organizationId: to,
			userId: nguoi.id,
			role: "member",
			createdAt: new Date(),
		},
	});
	tao.member.push(`member-tdx-${ma}`);
	const c = phien(email);
	await db.session.updateMany({
		where: { userId: nguoi.id },
		data: { activeOrganizationId: to },
	});
	return c;
}

async function goiApi(cookie, duong, than) {
	const res = await fetch(`${API}/rest${duong}`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			cookie: `${cookie.ten}=${cookie.gia}`,
		},
		body: JSON.stringify(than ?? {}),
	});
	const chu = await res.text();
	if (res.status >= 300) khongDo(`POST ${duong} tra ${res.status}: ${chu}`);
	return chu ? JSON.parse(chu) : null;
}

async function gieoBa(cookie, o) {
	const ma = [];
	for (const thu of [1, 2, 3]) {
		const ra = await goiApi(cookie, "/tin-hieu", {
			muonLam: `Đo TH6b ${o} số ${thu}`,
			daXayRa: `Đo TH6b: ô ${o}, tín hiệu thứ ${thu}`,
			man: "/okr",
		});
		if (!ra?.ma) khongDo(`gui tin hieu ${thu} cua ${o} khong tra ma`);
		ma.push(ra.ma);
		await new Promise((r) => setTimeout(r, 20));
	}
	return ma;
}

async function trang(cookie, kho) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: "lang", value: "vi", domain: host, path: "/" },
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({
		width: kho,
		height: kho === 375 ? 812 : 900,
		deviceScaleFactor: 1,
	});
	return { ctx, p };
}

async function mo(p, url, sel) {
	await p.goto(url, { waitUntil: "domcontentloaded", timeout: CHO_MS });
	const thay = await p
		.waitForSelector(sel, { timeout: CHO_MS })
		.then(() => true)
		.catch(() => false);
	if (!thay) khongDo(`${url}: khong thay ${sel}`);
	await p
		.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
		.catch(() => {});
}

function tieuDiem(p) {
	return p.evaluate(() => {
		const e = document.activeElement;
		return {
			ma: e?.getAttribute("data-thao-tac-tin-hieu") ?? null,
			chu: (e?.textContent ?? "").trim(),
			hien: e ? e.getClientRects().length > 0 : false,
			focusVisible: e ? e.matches(":focus-visible") : false,
			body: e === document.body,
		};
	});
}

async function tabToi(p, dung) {
	for (let i = 0; i < TAB_TOI_DA; i += 1) {
		await p.keyboard.press("Tab");
		if (dung(await tieuDiem(p))) return;
	}
	khongDo(`Tab ${TAB_TOI_DA} lan khong toi dich`);
}

async function moHopXoa(p, ma) {
	await tabToi(p, (t) => t.ma === ma && t.hien);
	await p.keyboard.press("Enter");
	await p.waitForSelector(`[data-xoa-tin-hieu='${ma}']`, { timeout: CHO_MS });
	await p.keyboard.press("Enter");
	await p.waitForSelector("[role=alertdialog]", { timeout: CHO_MS });
}

async function nutHop(p, chu) {
	await tabToi(p, (t) => t.chu === chu);
	await p.keyboard.press("Enter");
}

const onDinh = () => new Promise((r) => setTimeout(r, ON_DINH_MS));

function thuTuHien(p) {
	return p.evaluate(() =>
		[...document.querySelectorAll("[data-thao-tac-tin-hieu]")]
			.filter((e) => e.getClientRects().length > 0)
			.map((e) => e.getAttribute("data-thao-tac-tin-hieu")),
	);
}

function cuonNgang(p) {
	return p.evaluate(
		() =>
			document.documentElement.scrollWidth >
			document.documentElement.clientWidth,
	);
}

function canhBao(p) {
	return p.evaluate(() =>
		[...document.querySelectorAll("[role=alert]")].map((e) =>
			(e.textContent ?? "").trim(),
		),
	);
}

async function doO(qt, slug, ca, w) {
	const o = `${ca}-${w}`;
	const nguoi = await nguoiThanhVien(o);
	const [, giua, cuoi] = await gieoBa(nguoi, o);
	const { ctx, p } = await trang(nguoi, w);
	try {
		await mo(p, `${APP}/${slug}/tin-hieu`, `[data-tin-hieu='${cuoi}']`);
		const truoc = await thuTuHien(p);
		const moTu = ca === "esc" ? cuoi : giua;
		let dich = moTu;
		const them = [];
		if (ca === "xoa-xong") dich = truoc[truoc.indexOf(giua) + 1] ?? null;
		if (ca === "lay-ve") await goiApi(qt, "/tin-hieu/keo-ve");
		if (ca === "mang") {
			await p.setRequestInterception(true);
			p.on("request", (r) =>
				r.url().includes("tinHieu.xoa") ? r.abort() : r.continue(),
			);
		}
		await moHopXoa(p, moTu);
		if (ca === "giu-lai") await nutHop(p, m.trang.thoi);
		else if (ca === "esc") await p.keyboard.press("Escape");
		else await nutHop(p, m.trang.xoaNut);
		if (ca === "xoa-xong")
			await p
				.waitForFunction(
					(x) => !document.querySelector(`[data-tin-hieu='${x}']`),
					{ timeout: CHO_MS },
					giua,
				)
				.catch(() => {});
		if (ca === "lay-ve" || ca === "mang")
			await p
				.waitForSelector("[role=alert]", { timeout: CHO_MS })
				.catch(() => {});
		await p
			.waitForNetworkIdle({ idleTime: 500, timeout: CHO_MS })
			.catch(() => {});
		await onDinh();
		const t = await tieuDiem(p);
		const ngang = await cuonNgang(p);
		await p.screenshot({ path: join(RA, `${o}.png`) });
		let dat = t.ma === dich && t.focusVisible && t.hien && !ngang;
		if (ca === "lay-ve" || ca === "mang") {
			const mong = dien(
				ca === "lay-ve" ? m.trang.xoaHongDaLayVe : m.trang.xoaHong,
				{ ma: moTu },
			);
			const bao = await canhBao(p);
			them.push(`canh bao ${JSON.stringify(bao)}`);
			dat = dat && bao.length === 1 && bao[0] === mong;
		}
		if (ca === "lay-ve") {
			await p.keyboard.press("Enter");
			await p
				.waitForSelector(`[data-xoa-tin-hieu='${moTu}']`, { timeout: CHO_MS })
				.catch(() => {});
			const menu = await p.evaluate(
				(x, ly) => ({
					khoa:
						document
							.querySelector(`[data-xoa-tin-hieu='${x}']`)
							?.getAttribute("aria-disabled") ?? null,
					lyDo: [...document.querySelectorAll("[role=menu] *")].some(
						(e) => (e.textContent ?? "").trim() === ly,
					),
				}),
				moTu,
				m.trang.khongXoaDuoc,
			);
			await p.screenshot({ path: join(RA, `${o}-menu.png`) });
			await p.keyboard.press("Escape");
			them.push(`menu Xoa khoa ${menu.khoa}, ly do ${menu.lyDo}`);
			dat = dat && menu.khoa === "true" && menu.lyDo;
		}
		kiem(
			o,
			`ma dich ${dich}, tieu diem ${t.ma ?? (t.body ? "body" : `«${t.chu}»`)}, focus-visible ${t.focusVisible}, ban dang hien ${t.hien}, cuon ngang ${ngang}${them.length ? `, ${them.join(", ")}` : ""}`,
			dat,
			{
				ma_dich: dich,
				ma_tieu_diem: t.ma,
				focus_visible: t.focusVisible,
			},
		);
	} finally {
		await ctx.close();
	}
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	writeFileSync(SO_O, "");
	const qt = phien(QUAN_TRI);
	const slug = await suySlug(qt);
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	for (const ca of CA) for (const w of KHO) await doO(qt, slug, ca, w);
}

let ma = 0;
try {
	await chay();
	const thieu = MA_TRAN.filter((x) => !daPhat.has(x));
	if (thieu.length > 0) {
		dong.push(`SAI ma tran thieu dong: ${thieu.join(", ")}`);
		sai += 1;
	}
	ma = sai > 0 ? 1 : 0;
} catch (e) {
	dong.push(
		`KHONG DO DUOC: ${e instanceof KhongDo ? e.message : (e?.stack ?? e)}`,
	);
	ma = 2;
} finally {
	await trinhDuyet?.close().catch(() => {});
	if (tao.user.length > 0)
		await db.tinHieu.deleteMany({ where: { nguoiGuiId: { in: tao.user } } });
	if (tao.member.length > 0)
		await db.member.deleteMany({ where: { id: { in: tao.member } } });
	if (tao.user.length > 0) {
		await db.session.deleteMany({ where: { userId: { in: tao.user } } });
		await db.user.deleteMany({ where: { id: { in: tao.user } } });
	}
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
