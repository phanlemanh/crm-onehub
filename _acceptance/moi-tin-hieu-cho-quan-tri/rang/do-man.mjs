import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { docDuLieu } from "../../../apps/app/lib/lo-trinh/doc-du-lieu.js";
import { tinHieuMessages } from "../../../apps/app/lib/messages/tin-hieu.ts";
import { db } from "../../../packages/db/src/index.ts";
import {
	coChoSauGom,
	demNguongSong,
	dongDemTuTatCa,
	idTep,
	parseDuongTinHieu,
} from "../../../packages/validation/src/tin-hieu.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import { CHUOI_RIENG, don, gieo, NGUOI, TIN_HIEU } from "./sinh-mau.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "moi-tin-hieu-cho-quan-tri", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const QUAN_TRI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const m = tinHieuMessages("vi");
const MA_TRAN = [
	"khong-quyen-tieu-de",
	"khong-quyen-cau",
	"khong-quyen-khong-the",
	"khong-quyen-html",
	"khong-quyen-doi-chung",
	"b1-the-1280",
	"b2-ba-so-1280",
	"b3-dong-1280",
	"b4-loc-1280",
	"b4-loc-tai-lai-1280",
	"b5-375",
	"b6-thanh-vien-1280",
];

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
let mau = null;

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

async function toChucCua(email) {
	const qt = await db.user.findUnique({
		where: { email },
		select: { members: { select: { organizationId: true }, take: 1 } },
	});
	const to = qt?.members[0]?.organizationId;
	if (!to) khongDo(`${email} khong thuoc workspace nao`);
	return to;
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
	if (sel) {
		const thay = await p
			.waitForSelector(sel, { timeout: CHO_MS })
			.then(() => true)
			.catch(() => false);
		if (!thay) {
			await p.screenshot({ path: join(RA, "khong-thay.png") }).catch(() => {});
			const dang = await p.evaluate(() => ({
				url: location.href,
				tieuDe: document.title,
			}));
			khongDo(
				`${url}: khong thay ${sel} — trang dang o ${dang.url} «${dang.tieuDe}»`,
			);
		}
	}
	await p
		.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
		.catch(() => {});
}

const anh = (p, ten) =>
	p.screenshot({ path: join(RA, `${ten}.png`), fullPage: true });

async function the(p) {
	return p.evaluate(() =>
		[...document.querySelectorAll("[role=tablist] a")]
			.filter((a) => a instanceof HTMLElement && a.offsetParent !== null)
			.map((a) => ({
				chu: (a.textContent ?? "").trim(),
				hienTai: a.getAttribute("aria-current") === "page",
			})),
	);
}

async function kyVongBaSo() {
	const rows = await db.tinHieu.findMany({
		select: {
			so: true,
			guiLuc: true,
			phongBan: { select: { id: true, name: true } },
		},
	});
	const html = readFileSync(join(GOC, "LO-TRINH.html"), "utf8");
	const kq = parseDuongTinHieu(docDuLieu(html).duLieu?.tin_hieu);
	const so = demNguongSong(
		dongDemTuTatCa(
			rows.map((r) => ({
				ma: idTep(r.so),
				guiLuc: r.guiLuc,
				phongBan: r.phongBan
					? { id: r.phongBan.id, ten: r.phongBan.name }
					: null,
			})),
		),
		new Date(),
		coChoSauGom(kq),
	);
	return {
		tong: rows.length,
		ba: [
			String(so.trongKy),
			String(so.soPhong),
			kq.kieu === "co" ? String(so.chuaCoCho) : "—",
		],
	};
}

async function baSoTrenTrang(p) {
	return p.evaluate(() =>
		["trong-ky", "so-phong", "chua-co-cho"].map(
			(k) =>
				document
					.querySelector(`[data-o-so=${k}] .text-3xl`)
					?.textContent?.trim() ?? "",
		),
	);
}

async function doKhongQuyen(slug) {
	const c = mau.cookie.minh;
	const { ctx, p } = await trang(c, 1280);
	try {
		await mo(p, `${APP}/${slug}/tin-hieu/tat-ca`, "[data-tat-ca-khong-quyen]");
		const o = await p.evaluate(() => ({
			tieuDe: document.querySelector("h1")?.textContent?.trim() ?? "",
			than:
				document.querySelector("[data-tat-ca-khong-quyen]")?.textContent ?? "",
			nutVe:
				document
					.querySelector("[data-tat-ca-khong-quyen] a")
					?.getAttribute("href") ?? "",
			soThe: [...document.querySelectorAll("[role=tablist]")].filter(
				(e) => e instanceof HTMLElement && e.offsetParent !== null,
			).length,
		}));
		await anh(p, "E3-khong-quyen-1280");
		kiem(
			"khong-quyen-tieu-de",
			`tieu de «${o.tieuDe}»`,
			o.tieuDe === m.tatCa.tieuDe,
		);
		kiem(
			"khong-quyen-cau",
			`than noi chi quan tri xem duoc, nut ve ${o.nutVe}`,
			o.than.includes(m.tatCa.khongQuyen) && o.nutVe === `/${slug}/tin-hieu`,
		);
		kiem("khong-quyen-khong-the", `so thanh the ${o.soThe}`, o.soThe === 0);
	} finally {
		await ctx.close();
	}
	const tai = async (ck) =>
		(
			await fetch(`${APP}/${slug}/tin-hieu/tat-ca`, {
				headers: { cookie: `${ck.ten}=${ck.gia}; lang=vi` },
			})
		).text();
	const cuaThanhVien = await tai(c);
	const cuaQuanTri = await tai(mau.qt);
	const rieng = CHUOI_RIENG.filter((x) => !x.includes(NGUOI[1].ten));
	const lo = rieng.filter((x) => cuaThanhVien.includes(x));
	kiem(
		"khong-quyen-html",
		`HTML cua thanh vien mang ${lo.length}/${rieng.length} chuoi rieng${lo.length ? `: ${lo.join(" | ")}` : ""}`,
		rieng.length > 0 &&
			lo.length === 0 &&
			cuaThanhVien.includes(m.tatCa.tieuDe),
	);
	const coO = rieng.filter((x) => cuaQuanTri.includes(x));
	kiem(
		"khong-quyen-doi-chung",
		`HTML cua quan tri mang ${coO.length}/${rieng.length} chuoi rieng (doi chung duong)`,
		coO.length > 0,
	);
}

async function doQuanTri(slug) {
	const ky = await kyVongBaSo();
	const { ctx, p } = await trang(mau.qt, 1280);
	try {
		await mo(p, `${APP}/${slug}/tin-hieu`, "[role=tablist]");
		const truoc = await the(p);
		await anh(p, "E10b-b1-cua-toi-1280");
		const tab = await p.evaluateHandle(
			(chu) =>
				[...document.querySelectorAll("[role=tablist] a")].find(
					(a) => (a.textContent ?? "").trim() === chu,
				) ?? null,
			m.the.tatCa,
		);
		const el = tab.asElement();
		if (!el) khongDo("khong thay the Tat ca");
		await el.click();
		await p.waitForFunction(
			() => location.pathname.endsWith("/tin-hieu/tat-ca"),
			{
				timeout: CHO_MS,
			},
		);
		await p.waitForSelector("[data-ba-so-tin-hieu]", { timeout: CHO_MS });
		await p
			.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
			.catch(() => {});
		const sau = await the(p);
		await anh(p, "E10b-b1-tat-ca-1280");
		kiem(
			"b1-the-1280",
			`truoc ${JSON.stringify(truoc)} sau ${JSON.stringify(sau)}`,
			truoc.length === 2 &&
				truoc[0]?.hienTai === true &&
				truoc[1]?.hienTai === false &&
				sau[1]?.hienTai === true &&
				sau[0]?.hienTai === false,
		);
		const ba = await baSoTrenTrang(p);
		kiem(
			"b2-ba-so-1280",
			`trang ${JSON.stringify(ba)} — tinh tu kho ${JSON.stringify(ky.ba)}`,
			JSON.stringify(ba) === JSON.stringify(ky.ba),
		);
		const hang = await p.evaluate(() => ({
			so: document.querySelectorAll("[data-tin-hieu-tat-ca]").length,
			chu: document.querySelector("table")?.textContent ?? "",
		}));
		const thieuTen = NGUOI.map((n) => n.ten).filter(
			(t) => !hang.chu.includes(t),
		);
		kiem(
			"b3-dong-1280",
			`${hang.so} dong (kho co ${ky.tong}); ten mau thieu: ${thieuTen.join(", ") || "khong"}`,
			hang.so === Math.min(ky.tong, 50) && thieuTen.length === 0,
		);
		const kd = mau.idPhong.kd;
		await mo(
			p,
			`${APP}/${slug}/tin-hieu/tat-ca?phongBan=${kd}`,
			"[data-ba-so-tin-hieu]",
		);
		const loc = async () =>
			p.evaluate(() =>
				[...document.querySelectorAll("[data-tin-hieu-tat-ca]")].map(
					(x) => x.closest("tr")?.textContent ?? "",
				),
			);
		const sauLoc = await loc();
		const soKd = TIN_HIEU.filter((t) => t.nguoi === "lan").length;
		await anh(p, "E10b-b4-loc-1280");
		kiem(
			"b4-loc-1280",
			`loc phong ban Kinh doanh: ${sauLoc.length} dong, ky vong ${soKd}, url ${p.url()}`,
			sauLoc.length === soKd &&
				sauLoc.every((x) => x.includes(NGUOI[0].ten)) &&
				p.url().includes(`phongBan=${kd}`),
		);
		await p.reload({ waitUntil: "domcontentloaded" });
		await p.waitForSelector("[data-ba-so-tin-hieu]", { timeout: CHO_MS });
		await p
			.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
			.catch(() => {});
		kiem(
			"b4-loc-tai-lai-1280",
			"tai lai giu loc",
			(await loc()).length === soKd && p.url().includes(`phongBan=${kd}`),
		);
	} finally {
		await ctx.close();
	}
	const nho = await trang(mau.qt, 375);
	try {
		await mo(nho.p, `${APP}/${slug}/tin-hieu/tat-ca`, "[data-ba-so-tin-hieu]");
		const o = await nho.p.evaluate(() => {
			const tr = document
				.querySelector("[data-tin-hieu-tat-ca]")
				?.closest("tr");
			const hien = (sel) => {
				const e = tr?.querySelector(sel);
				return !!e && e.getBoundingClientRect().width > 1;
			};
			return {
				rong: document.documentElement.scrollWidth,
				khung: document.documentElement.clientWidth,
				nguoi: hien("[data-nguoi-gui]"),
				trangThai: hien("[data-slot=status-indicator]"),
			};
		});
		await anh(nho.p, "E10b-b5-tat-ca-375");
		kiem(
			"b5-375",
			`rong ${o.rong} / khung ${o.khung}; doc duoc nguoi gui ${o.nguoi}, trang thai ${o.trangThai}`,
			o.rong <= o.khung + 1 && o.nguoi && o.trangThai,
		);
	} finally {
		await nho.ctx.close();
	}
	const tv = await trang(mau.cookie.minh, 1280);
	try {
		await mo(tv.p, `${APP}/${slug}/tin-hieu`, "h1");
		await tv.p
			.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
			.catch(() => {});
		const soThe = await tv.p.evaluate(
			() =>
				[...document.querySelectorAll("[role=tablist]")].filter(
					(e) => e instanceof HTMLElement && e.offsetParent !== null,
				).length,
		);
		await anh(tv.p, "E10b-b6-thanh-vien-1280");
		kiem("b6-thanh-vien-1280", `so thanh the ${soThe}`, soThe === 0);
	} finally {
		await tv.ctx.close();
	}
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	const qt = phien(QUAN_TRI);
	const slug = await suySlug(qt);
	const toChuc = await toChucCua(QUAN_TRI);
	mau = await gieo({
		db,
		toChuc,
		phien,
		app: APP,
		ma: Date.now().toString(36),
	});
	mau.qt = qt;
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	await doKhongQuyen(slug);
	await doQuanTri(slug);
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
	if (mau) await don(db, mau.tao).catch(() => {});
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
