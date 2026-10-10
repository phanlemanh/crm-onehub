import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { docDuLieu } from "../../../apps/app/lib/lo-trinh/doc-du-lieu.js";
import { db } from "../../../packages/db/src/index.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "trang-lo-trinh-trong-crm", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const QUAN_TRI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const MA_TRAN = [
	"rail-1280",
	"thanh-cong-cu-1280",
	"bang-1280",
	"bang-cot-1280",
	"moc-1280",
	"khong-dich-1280",
	"ho-so-375",
	"bang-375",
	"bang-cot-375",
	"moc-375",
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
	const email = `lt1-${ma}@thu.test`;
	const nguoi = await db.user.create({
		data: {
			id: `lt1-${ma}`,
			email,
			name: "Người đo Lộ trình",
			emailVerified: true,
		},
		select: { id: true },
	});
	tao.user = nguoi.id;
	await db.member.create({
		data: {
			id: `member-lt1-${ma}`,
			organizationId: to,
			userId: nguoi.id,
			role: "okr",
			createdAt: new Date(),
		},
	});
	tao.member = `member-lt1-${ma}`;
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

async function anh(p, ten) {
	await p.screenshot({ path: join(RA, `${ten}.png`) });
}

async function bamCachXem(p, nhan, sel) {
	const nut = await p.evaluateHandle(
		(n) =>
			[
				...document.querySelectorAll(
					"[data-view-switch=nut] [data-slot=toggle-group-item]",
				),
			].find((b) => (b.textContent ?? "").trim() === n) ?? null,
		nhan,
	);
	const el = nut.asElement();
	if (!el) return false;
	await el.click();
	return p
		.waitForSelector(sel, { timeout: CHO_MS })
		.then(() => true)
		.catch(() => false);
}

async function thuTuCongCu(p) {
	let kq = null;
	for (let lan = 0; lan < 5; lan++) {
		kq = await docCongCu(p);
		if (kq.ds) return kq;
		await new Promise((r) => setTimeout(r, 1000));
	}
	return kq;
}

function docCongCu(p) {
	return p.evaluate(() => {
		const tim = [...document.querySelectorAll("[data-slot=input-group]")].find(
			(e) =>
				!e.closest("header, nav, [role=dialog]") && e.offsetParent !== null,
		);
		if (!tim) return { loi: "khong thay o tim trong noi dung trang" };
		let hang = tim.parentElement;
		while (hang && hang.querySelectorAll("button").length < 2)
			hang = hang.parentElement;
		if (!hang) return { loi: "khong thay hang chua o tim" };
		const chu = (el) => (el.textContent ?? "").trim();
		const loai = (el) => {
			if (el.matches("[data-slot=input-group]")) return "tim";
			if (el.matches("[data-view-switch=nut], [data-slot=toggle-group]"))
				return [...el.querySelectorAll("[data-slot=toggle-group-item]")].some(
					(i) => chu(i) === "Bảng",
				)
					? "cach-xem"
					: "trang-thai";
			if (el.getAttribute("aria-haspopup"))
				return /^(Lọc|Sắp xếp|Cột)/.test(chu(el)) ? "loc" : "trang-thai";
			return "nut";
		};
		const ds = [
			...hang.querySelectorAll(
				"[data-slot=input-group], [data-view-switch=nut], [data-slot=toggle-group], button",
			),
		].filter(
			(el) =>
				el.offsetParent !== null &&
				!el.parentElement?.closest(
					"[data-slot=input-group], [data-view-switch=nut], [data-slot=toggle-group]",
				),
		);
		return {
			ds: ds.map((el) => {
				const r = el.getBoundingClientRect();
				return { loai: loai(el), giua: Math.round(r.top + r.height / 2) };
			}),
		};
	});
}

async function do1280(okr, qt, slug, cauKeHoach) {
	const LT = `${APP}/${slug}/lo-trinh`;
	const { ctx, p } = await trang(okr, 1280);
	try {
		await mo(p, `${APP}/${slug}/okr`, "nav a[href]");
		const coMuc = await p.evaluate(() => {
			const a = [...document.querySelectorAll("nav a[href]")].find((x) =>
				x.getAttribute("href")?.endsWith("/lo-trinh"),
			);
			a?.click();
			return Boolean(a);
		});
		if (coMuc)
			await p
				.waitForFunction(() => location.pathname.endsWith("/lo-trinh"), {
					timeout: CHO_MS,
				})
				.catch(() => {});
		const duong = new URL(p.url()).pathname;
		await anh(p, "rail-1280");
		kiem(
			"rail-1280",
			coMuc ? `bam muc Lo trinh -> ${duong}` : "khong thay muc Lo trinh",
			coMuc && duong.endsWith("/lo-trinh") && !duong.includes("ngoai-pham-vi"),
		);

		await mo(p, LT, "[data-viec-khoa]");
		const ltCongCu = await thuTuCongCu(p);
		const soViec = await p.$$eval("[data-viec-khoa]", (x) => x.length);
		await anh(p, "bang-1280");
		kiem(
			"bang-1280",
			`${soViec} viec, scrollWidth ${await cuon(p)}`,
			soViec >= 1 && (await cuon(p)) <= 1280,
		);

		const khongDich = await p.evaluate((cau) => {
			const sai = [];
			const di = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
			for (let n = di.nextNode(); n; n = di.nextNode()) {
				if (n.parentElement?.closest("script, style, noscript, template"))
					continue;
				const chu = n.textContent ?? "";
				if (!cau.some((c) => c && chu.includes(c))) continue;
				if (!n.parentElement?.closest('[translate="no"]'))
					sai.push(chu.slice(0, 60));
			}
			return sai;
		}, cauKeHoach);
		kiem(
			"khong-dich-1280",
			khongDich.length
				? `chu ke hoach khong nam trong translate=no: ${khongDich[0]}`
				: "moi chu ke hoach nam trong translate=no",
			khongDich.length === 0,
		);

		const coCot = await bamCachXem(p, "Bảng cột", "[data-board-column]");
		await anh(p, "bang-cot-1280");
		kiem(
			"bang-cot-1280",
			`cot ${await p.$$eval("[data-board-column]", (x) => x.length)}, scrollWidth ${await cuon(p)}`,
			coCot && (await cuon(p)) <= 1280,
		);
		const coMoc = await bamCachXem(p, "Mốc", "[data-lo-trinh-moc]");
		await anh(p, "moc-1280");
		kiem(
			"moc-1280",
			`moc ${await p.$$eval("[data-lo-trinh-moc]", (x) => x.length)}, scrollWidth ${await cuon(p)}`,
			coMoc && (await cuon(p)) <= 1280,
		);

		const q = await trang(qt, 1280);
		let dealCongCu = null;
		try {
			await mo(q.p, `${APP}/${slug}/deals`, "[data-slot=input-group]");
			dealCongCu = await thuTuCongCu(q.p);
			await anh(q.p, "thanh-cong-cu-deals-1280");
		} finally {
			await q.ctx.close();
		}
		if (!ltCongCu?.ds || !dealCongCu?.ds)
			khongDo(
				`khong doc duoc thanh cong cu: lo-trinh ${ltCongCu?.loi ?? "ok"}, deals ${dealCongCu?.loi ?? "ok"}`,
			);
		const ltDs = ltCongCu.ds;
		const dealDs = dealCongCu.ds;
		const chung = new Set(
			ltDs.map((x) => x.loai).filter((l) => dealDs.some((y) => y.loai === l)),
		);
		const rut = (ds) => ds.map((x) => x.loai).filter((l) => chung.has(l));
		const gon = (ds) => ds.filter((l, i) => l !== ds[i - 1]);
		const giua = ltDs.map((x) => x.giua);
		const cungHang = Math.max(...giua) - Math.min(...giua) <= 2;
		kiem(
			"thanh-cong-cu-1280",
			`lo-trinh ${gon(rut(ltDs)).join(">")} · deals ${gon(rut(dealDs)).join(">")} · mot hang ${cungHang}`,
			JSON.stringify(gon(rut(ltDs))) === JSON.stringify(gon(rut(dealDs))) &&
				cungHang,
		);
	} finally {
		await ctx.close();
	}
}

async function do375(okr, slug) {
	const LT = `${APP}/${slug}/lo-trinh`;
	const { ctx, p } = await trang(okr, 375);
	try {
		await mo(p, LT, "[data-viec-khoa]");
		const bang = await p.evaluate(() => {
			const hien = (el) => el.offsetParent !== null;
			const theNgoai = [...document.querySelectorAll("[data-vong-doi]")].filter(
				hien,
			).length;
			const rongCot = [
				...document.querySelectorAll("[data-lo-trinh-ten]"),
				...document.querySelectorAll("[data-lo-trinh-trang-thai-phu]"),
			].map((e) => e.closest("td")?.offsetWidth ?? 0);
			const viec = [...document.querySelectorAll("[data-viec-khoa]")];
			const coCham = viec.every((v) =>
				v.querySelector("[data-nhom-trang-thai]"),
			);
			const tim = document.querySelector("main [data-slot=input-group]");
			const hang = tim?.parentElement;
			return {
				theNgoai,
				rongCot: Math.max(0, ...rongCot),
				coCham,
				congCu: hang ? hang.scrollWidth <= hang.clientWidth : false,
			};
		});
		await anh(p, "bang-375");
		kiem(
			"bang-375",
			`nut vong doi hien ${bang.theNgoai}, cot an rong ${bang.rongCot}, cham trong o Viec ${bang.coCham}, cong cu vua ${bang.congCu}`,
			bang.theNgoai === 0 && bang.rongCot === 0 && bang.coCham && bang.congCu,
		);

		await p.click("tbody [data-viec-khoa]");
		const coNgan = await p
			.waitForSelector("[data-lo-trinh-chi-tiet-viec]", { timeout: CHO_MS })
			.then(() => true)
			.catch(() => false);
		await anh(p, "ho-so-375");
		kiem(
			"ho-so-375",
			`ngan ho so ${coNgan}, scrollWidth ${await cuon(p)}`,
			coNgan && (await cuon(p)) <= 375,
		);

		for (const [ma, xem, sel] of [
			["bang-cot-375", "bang-cot", "[data-board-column]"],
			["moc-375", "moc", "[data-lo-trinh-moc]"],
		]) {
			await mo(p, `${LT}?xemLoTrinh=${xem}`, sel);
			await anh(p, ma);
			kiem(ma, `scrollWidth ${await cuon(p)}`, (await cuon(p)) <= 375);
		}
	} finally {
		await ctx.close();
	}
}

async function chay() {
	const html = readFileSync(join(GOC, "LO-TRINH.html"), "utf8");
	const { duLieu } = docDuLieu(html);
	if (duLieu === null) khongDo("LO-TRINH.html chưa mang khối — cần kit ≥ 2.26");
	const cauKeHoach = duLieu.lo_trinh.flatMap((lo) =>
		lo.hang.map((h) => h.cau_giao),
	);
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
	await do1280(okr, qt, slug, cauKeHoach);
	await do375(okr, slug);
}

let ma = 0;
try {
	await chay();
	const thieu = MA_TRAN.filter((m) => !daPhat.has(m));
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
