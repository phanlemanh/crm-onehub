import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { LO_TRINH } from "../../../apps/app/lib/lo-trinh/cau-hinh.ts";
import { docDuLieu } from "../../../apps/app/lib/lo-trinh/doc-du-lieu.js";
import { loTrinhMessages } from "../../../apps/app/lib/messages/lo-trinh.ts";
import { db } from "../../../packages/db/src/index.ts";
import { formatNgayGio } from "../../../packages/ui/src/lib/format.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "lo-trinh-doc-ban-chup", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const CHU = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const NHIP_DOI_MS = 10_000;
const BIEN_MS = 15_000;
const DAU = `LT1C-DAU-${Date.now().toString(36)}`;
const VN = "Asia/Ho_Chi_Minh";
const NY = "America/New_York";
const DONG_GIO = "[data-slot=gio-lay-lo-trinh]";
const O = [
	["1280", "vi", VN],
	["1280", "en", VN],
	["375", "vi", VN],
	["375", "en", NY],
];
const O_CHUP = [
	["1280", "vi", NY],
	["1280", "en", VN],
	["375", "vi", VN],
	["375", "en", VN],
];
const MA_TRAN = [
	...O.map(([k, l]) => `ban-dung-${k}-${l}`),
	"hien-trong-mot-nhip",
	...O_CHUP.map(([k, l]) => `ban-chup-${k}-${l}`),
	"vai-member",
];

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
const tao = { user: null, member: null, khoa: null };

function kiem(ma, nhan, dat) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ${ma} khong co trong MA_TRAN`);
	daPhat.add(ma);
	dong.push(`${dat ? "DUNG" : "SAI"} ${ma}: ${nhan}`);
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

async function nguoiThuong() {
	const chu = await db.user.findUnique({
		where: { email: CHU },
		select: { members: { select: { organizationId: true }, take: 1 } },
	});
	const to = chu?.members[0]?.organizationId;
	if (!to) khongDo(`${CHU} khong thuoc workspace nao`);
	const ma = Date.now().toString(36);
	const email = `ldbc-${ma}@thu.test`;
	const nguoi = await db.user.create({
		data: { id: `ldbc-${ma}`, email, name: "Người đo bản chụp", emailVerified: true },
		select: { id: true },
	});
	tao.user = nguoi.id;
	await db.member.create({
		data: {
			id: `member-ldbc-${ma}`,
			organizationId: to,
			userId: nguoi.id,
			role: "member",
			createdAt: new Date(),
		},
	});
	tao.member = `member-ldbc-${ma}`;
	const c = phien(email);
	await db.session.updateMany({
		where: { userId: nguoi.id },
		data: { activeOrganizationId: to },
	});
	return c;
}

async function taoKhoa(cookie) {
	const res = await fetch(`${API}/rest/api-keys`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			cookie: `${cookie.ten}=${cookie.gia}`,
		},
		body: JSON.stringify({ name: `do ${DAU}`, expiresInDays: 1, loai: "day-lo-trinh" }),
	});
	const than = await res.json().catch(() => null);
	if (!res.ok || !than?.key)
		khongDo(`tao khoa Day lo trinh tra ${res.status}: ${JSON.stringify(than)}`);
	tao.khoa = than.id ?? null;
	return than.key;
}

async function dayBanChup(khoa) {
	const khoi = docDuLieu(readFileSync(join(GOC, "LO-TRINH.html"), "utf8"));
	if (khoi.duLieu === null) khongDo("LO-TRINH.html khong mang khoi");
	for (const lo of khoi.duLieu.lo_trinh)
		for (const h of lo.hang) h.cau_giao = `${h.cau_giao} ${DAU}`;
	const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: GOC, encoding: "utf8" }).trim();
	const res = await fetch(`${API}/rest/lo-trinh/ban-chup`, {
		method: "POST",
		headers: { "content-type": "application/json", "x-api-key": khoa },
		body: JSON.stringify({
			nguon: LO_TRINH.nguonCrm,
			sha,
			commitLuc: new Date().toISOString(),
			duLieu: khoi.duLieu,
			canhBao: khoi.canhBao,
		}),
	});
	const than = await res.json().catch(() => null);
	if (!res.ok || than?.ketQua !== "nhan")
		khongDo(`day ban chup tra ${res.status}: ${JSON.stringify(than)}`);
	const hang = await db.banChupLoTrinh.findUnique({
		where: { nguon: LO_TRINH.nguonCrm },
		select: { layLuc: true },
	});
	if (!hang) khongDo("may chu tra nhan ma khong co hang ban chup");
	return hang.layLuc.toISOString();
}

async function trang(cookie, kho, lang, mui) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: "lang", value: lang, domain: host, path: "/" },
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.emulateTimezone(mui);
	await p.setViewport({ width: Number(kho), height: kho === "375" ? 812 : 900, deviceScaleFactor: 1 });
	return { ctx, p };
}

async function mo(p, url) {
	await p.goto(url, { waitUntil: "domcontentloaded", timeout: CHO_MS });
	const thay = await p
		.waitForSelector(DONG_GIO, { timeout: CHO_MS })
		.then(() => true)
		.catch(() => false);
	if (!thay) {
		await p.screenshot({ path: join(RA, "khong-thay.png") }).catch(() => {});
		khongDo(`${url}: khong thay dong gio lay — trang dang o ${p.url()}`);
	}
	await p.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS }).catch(() => {});
}

const docTrang = (p) =>
	p.evaluate(
		(sel, dau) => ({
			gio: document.querySelector(sel)?.textContent ?? "",
			coDau: (document.body.textContent ?? "").includes(dau),
			cuon: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
			khongDich: [...document.querySelectorAll("[data-viec-khoa]")].every(
				(e) => e.closest("[translate=no]") !== null,
			),
		}),
		DONG_GIO,
		DAU,
	);

async function oBanDung(cookie, slug) {
	for (const [kho, lang, mui] of O) {
		const m = loTrinhMessages(lang);
		const { ctx, p } = await trang(cookie, kho, lang, mui);
		try {
			await mo(p, `${APP}/${slug}/lo-trinh`);
			const t = await docTrang(p);
			kiem(
				`ban-dung-${kho}-${lang}`,
				`«${t.gio}» co nhan ban dung, khong chuoi danh dau, khong cuon ngang`,
				t.gio.includes(m.gioLay.banDung) && !t.coDau && t.cuon && t.khongDich,
			);
			await p.screenshot({ path: join(RA, `ban-dung-${kho}-${lang}.png`) });
		} finally {
			await ctx.close();
		}
	}
}

async function choHien(cookie, slug) {
	const { ctx, p } = await trang(cookie, "1280", "vi", VN);
	const batDau = Date.now();
	try {
		for (;;) {
			await mo(p, `${APP}/${slug}/lo-trinh`);
			if ((await docTrang(p)).coDau) break;
			if (Date.now() - batDau > LO_TRINH.nhipLamMoiMs + BIEN_MS) break;
			await new Promise((r) => setTimeout(r, NHIP_DOI_MS));
		}
		const cho = Date.now() - batDau;
		const hien = (await docTrang(p)).coDau;
		kiem(
			"hien-trong-mot-nhip",
			`ban chup hien sau ${Math.round(cho / 1000)} giay (tran ${(LO_TRINH.nhipLamMoiMs + BIEN_MS) / 1000})`,
			hien && cho <= LO_TRINH.nhipLamMoiMs + BIEN_MS,
		);
	} finally {
		await ctx.close();
	}
}

async function oBanChup(cookie, slug, layLuc) {
	for (const [kho, lang, mui] of O_CHUP) {
		const m = loTrinhMessages(lang);
		const kyVong = m.gioLay.capNhat(formatNgayGio(layLuc, lang, { timeZone: mui, phan: "ngay-gio" }));
		const { ctx, p } = await trang(cookie, kho, lang, mui);
		try {
			await mo(p, `${APP}/${slug}/lo-trinh`);
			const t = await docTrang(p);
			kiem(
				`ban-chup-${kho}-${lang}`,
				`«${t.gio}» == «${kyVong}» (${mui}), co chuoi danh dau, khong cuon ngang`,
				t.gio.trim() === kyVong && t.coDau && t.cuon && t.khongDich,
			);
			await p.screenshot({ path: join(RA, `ban-chup-${kho}-${lang}.png`) });
		} finally {
			await ctx.close();
		}
	}
}

async function html(cookie, slug) {
	const res = await fetch(`${APP}/${slug}/lo-trinh`, {
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	return res.text();
}

const SO_LIEU_CHU = /chu_kho\\?"\s*:\s*\{/;

async function oVai(chu, member, slug) {
	const cuaChu = SO_LIEU_CHU.test(await html(chu, slug));
	const cuaMember = SO_LIEU_CHU.test(await html(member, slug));
	kiem(
		"vai-member",
		`so lieu chu kho trong trang: chu ${cuaChu}, thanh vien ${cuaMember}`,
		cuaChu && !cuaMember,
	);
	const { ctx, p } = await trang(member, "1280", "vi", VN);
	try {
		await mo(p, `${APP}/${slug}/lo-trinh`);
		await p.screenshot({ path: join(RA, "vai-member-1280.png") });
	} finally {
		await ctx.close();
	}
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	const chu = phien(CHU);
	const slug = await suySlug(chu);
	trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
	await oBanDung(chu, slug);
	const khoa = await taoKhoa(chu);
	const layLuc = await dayBanChup(khoa);
	await choHien(chu, slug);
	await oBanChup(chu, slug, layLuc);
	await oVai(chu, await nguoiThuong(), slug);
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
	dong.push(`KHONG DO DUOC: ${e instanceof KhongDo ? e.message : (e?.stack ?? e)}`);
	ma = 2;
} finally {
	await trinhDuyet?.close().catch(() => {});
	await db.banChupLoTrinh.deleteMany({ where: { nguon: LO_TRINH.nguonCrm } }).catch(() => {});
	if (tao.khoa) await db.apikey.deleteMany({ where: { id: tao.khoa } }).catch(() => {});
	if (tao.member) await db.member.deleteMany({ where: { id: tao.member } });
	if (tao.user) {
		await db.session.deleteMany({ where: { userId: tao.user } });
		await db.user.deleteMany({ where: { id: tao.user } });
	}
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
