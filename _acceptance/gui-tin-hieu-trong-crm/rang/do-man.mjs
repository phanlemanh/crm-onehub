import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { tinHieuMessages } from "../../../apps/app/lib/messages/tin-hieu.ts";
import { db } from "../../../packages/db/src/index.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "gui-tin-hieu-trong-crm", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const QUAN_TRI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const m = tinHieuMessages("vi");
const MAN_1280 = [
	["tong-quan", ""],
	["okr", "/okr"],
	["tai-lieu", "/tai-lieu"],
	["lo-trinh", "/lo-trinh"],
];
const MA_TRAN = [
	...MAN_1280.map(([t]) => `nut-${t}-1280`),
	"nut-375",
	"hop-1280",
	"trang-1280",
	"trang-375",
	"menu-1280",
	"menu-375",
];

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
const tao = { user: null, member: null };

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

async function nguoiChiOkr() {
	const qt = await db.user.findUnique({
		where: { email: QUAN_TRI },
		select: { members: { select: { organizationId: true }, take: 1 } },
	});
	const to = qt?.members[0]?.organizationId;
	if (!to) khongDo(`${QUAN_TRI} khong thuoc workspace nao`);
	const ma = Date.now().toString(36);
	const email = `gth-${ma}@thu.test`;
	const nguoi = await db.user.create({
		data: {
			id: `gth-${ma}`,
			email,
			name: "Người đo Tín hiệu",
			emailVerified: true,
		},
		select: { id: true },
	});
	tao.user = nguoi.id;
	await db.member.create({
		data: {
			id: `member-gth-${ma}`,
			organizationId: to,
			userId: nguoi.id,
			role: "okr",
			createdAt: new Date(),
		},
	});
	tao.member = `member-gth-${ma}`;
	const c = phien(email);
	await db.session.updateMany({
		where: { userId: nguoi.id },
		data: { activeOrganizationId: to },
	});
	return c;
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
	if (sel)
		await p
			.waitForSelector(sel, { timeout: CHO_MS })
			.catch(() => khongDo(`${url}: khong thay ${sel}`));
	await p
		.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
		.catch(() => {});
}

const cuon = (p) => p.evaluate(() => document.documentElement.scrollWidth);
const anh = (p, ten) => p.screenshot({ path: join(RA, `${ten}.png`) });
const NUT = "[data-slot=nut-gui-tin-hieu]";

async function trongKhung(p) {
	return p.evaluate((sel) => {
		const b = document.querySelector(sel);
		if (!b || b.offsetParent === null) return false;
		const r = b.getBoundingClientRect();
		return (
			r.top >= 0 &&
			r.left >= 0 &&
			r.right <= window.innerWidth &&
			r.bottom <= window.innerHeight
		);
	}, NUT);
}

async function bamTheoChu(p, sel, chu) {
	const h = await p.evaluateHandle(
		(s, c) =>
			[...document.querySelectorAll(s)].find(
				(e) => (e.textContent ?? "").trim() === c,
			) ?? null,
		sel,
		chu,
	);
	const el = h.asElement();
	if (!el) return false;
	await el.click();
	return true;
}

async function moMenu(p) {
	await p.click("header button[aria-haspopup=menu]");
	await p.waitForSelector("[role=menu]", { timeout: CHO_MS });
}

async function do1280(okr, slug) {
	const { ctx, p } = await trang(okr, 1280);
	try {
		for (const [ten, duong] of MAN_1280) {
			await mo(p, `${APP}/${slug}${duong}`, NUT);
			kiem(
				`nut-${ten}-1280`,
				`nut gui tin hieu hien trong khung o /${slug}${duong}`,
				await trongKhung(p),
			);
			await anh(p, `nut-${ten}-1280`);
		}
		await mo(p, `${APP}/${slug}/okr`, NUT);
		await p.click(NUT);
		await p.waitForSelector("[data-hop-tin-hieu]", { timeout: CHO_MS });
		const manHop = await p.evaluate(
			() => document.querySelector("[data-hop-tin-hieu]")?.textContent ?? "",
		);
		await p.type("textarea[name=muon-lam]", "Đo màn: cập nhật số tuần này");
		await p.type(
			"textarea[name=da-xay-ra]",
			"Đo màn: không thấy số tuần trước",
		);
		await anh(p, "hop-1280");
		await bamTheoChu(p, "[data-hop-tin-hieu] button", m.hop.gui);
		const bienNhan = await p
			.waitForFunction(
				() => /Đã nhận tín hiệu crm-\d+/.test(document.body.textContent ?? ""),
				{ timeout: CHO_MS },
			)
			.then(() => true)
			.catch(() => false);
		await anh(p, "hop-da-gui-1280");
		kiem(
			"hop-1280",
			"hop ghi man khong slug, gui xong co bien nhan ma crm-<so>",
			manHop.includes("Gửi từ màn: /okr") && !manHop.includes(slug) && bienNhan,
		);
		await bamTheoChu(p, "a", m.hop.xemDaGui);
		await p.waitForFunction(() => location.pathname.endsWith("/tin-hieu"), {
			timeout: CHO_MS,
		});
		await p.waitForSelector("tr[data-tin-hieu]", { timeout: CHO_MS });
		const dau = await p.evaluate(() => {
			const r = document.querySelector("tr[data-tin-hieu]");
			return {
				chu: r?.textContent ?? "",
				cau: r?.querySelector("[data-cau-trang-thai]")?.textContent ?? "",
			};
		});
		kiem(
			"trang-1280",
			"dong dau co dieu vua ke va cau cho lay ve",
			dau.chu.includes("Đo màn: không thấy số tuần trước") &&
				dau.cau === m.trangThai.choKeoVe,
		);
		await anh(p, "trang-1280");
		await mo(p, `${APP}/${slug}`, "header button[aria-haspopup=menu]");
		await moMenu(p);
		await bamTheoChu(p, "[role=menuitem]", m.menu);
		const toi = await p
			.waitForFunction(() => location.pathname.endsWith("/tin-hieu"), {
				timeout: CHO_MS,
			})
			.then(() => true)
			.catch(() => false);
		kiem("menu-1280", "menu nguoi dung mo trang tin hieu da gui", toi);
		await anh(p, "menu-1280");
	} finally {
		await ctx.close();
	}
}

async function do375(okr, slug) {
	const { ctx, p } = await trang(okr, 375);
	try {
		await mo(p, `${APP}/${slug}/okr`, NUT);
		const nut = await p.evaluate((sel) => {
			const b = document.querySelector(sel);
			return {
				nhan: b?.getAttribute("aria-label") ?? "",
				chu: (b?.innerText ?? "").trim(),
			};
		}, NUT);
		kiem(
			"nut-375",
			"nut chi bieu tuong, co ten doc duoc, khong cuon ngang",
			nut.nhan === m.nut && nut.chu === "" && (await cuon(p)) <= 375,
		);
		await anh(p, "nut-375");
		await mo(p, `${APP}/${slug}/tin-hieu`, "[data-slot=item][data-tin-hieu]");
		const item = await p.evaluate(() =>
			[...document.querySelectorAll("[data-slot=item][data-tin-hieu]")].some(
				(e) => e.offsetParent !== null,
			),
		);
		kiem(
			"trang-375",
			"danh sach Item hien, khong cuon ngang",
			item && (await cuon(p)) <= 375,
		);
		await anh(p, "trang-375");
		await mo(p, `${APP}/${slug}`, "header button[aria-haspopup=menu]");
		await moMenu(p);
		await bamTheoChu(p, "[role=menuitem]", m.menu);
		const toi = await p
			.waitForFunction(() => location.pathname.endsWith("/tin-hieu"), {
				timeout: CHO_MS,
			})
			.then(() => true)
			.catch(() => false);
		kiem("menu-375", "menu nguoi dung mo trang tin hieu da gui", toi);
		await anh(p, "menu-375");
	} finally {
		await ctx.close();
	}
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	const qt = phien(QUAN_TRI);
	const slug = await suySlug(qt);
	const okr = await nguoiChiOkr();
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	await do1280(okr, slug);
	await do375(okr, slug);
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
	if (tao.user)
		await db.tinHieu.deleteMany({ where: { nguoiGuiId: tao.user } });
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
