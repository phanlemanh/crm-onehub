import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { LO_TRINH } from "../../../apps/app/lib/lo-trinh/cau-hinh.ts";
import { docDuLieu } from "../../../apps/app/lib/lo-trinh/doc-du-lieu.js";
import { db } from "../../../packages/db/src/index.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "trang-lo-trinh-mo-hinh-hien-thi", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const CHU = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const VN = "Asia/Ho_Chi_Minh";
const O = [];
for (const kho of ["375", "1280"])
	for (const lang of ["vi", "en"])
		for (const nen of ["sang", "toi"]) O.push([kho, lang, nen]);
const MA_TRAN = O.map(([k, l, n]) => `moc-${k}-${l}-${n}`);

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;

class KhongDo extends Error {}
function khongDo(cau) {
	throw new KhongDo(cau);
}

function kiem(ma, nhan, dat) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ${ma} khong co trong MA_TRAN`);
	daPhat.add(ma);
	dong.push(`${dat ? "DUNG" : "SAI"} ${ma}: ${nhan}`);
	if (!dat) sai += 1;
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

function chuDem(lang, conLai, tong) {
	if (conLai === 0)
		return lang === "vi" ? `đã giao đủ ${tong} việc` : `All ${tong} delivered`;
	const k = tong - conLai;
	const dau =
		lang === "vi" ? `còn ${conLai}/${tong} việc` : `${conLai} of ${tong} left`;
	if (k === 0) return dau;
	return lang === "vi" ? `${dau} · ${k} đã giao` : `${dau} · ${k} delivered`;
}

function kyVong(lang) {
	const khoi = docDuLieu(readFileSync(join(GOC, "LO-TRINH.html"), "utf8"));
	if (khoi.duLieu === null) khongDo("LO-TRINH.html khong mang khoi");
	const moc = {};
	const ten = {};
	let chuaHen = 0;
	for (const lo of khoi.duLieu.lo_trinh) {
		chuaHen += lo.chua_hen_moc.length;
		for (const m of lo.moc) {
			const k = `${lo.tep}@${m.ngay}@${m.ten}`;
			ten[k] = { moc: m.ten, lo: lo.ten ?? lo.tep };
			if (m.hien) moc[k] = chuDem(lang, m.con_lai, m.viec_hien.length);
		}
	}
	return { moc, ten, chuaHen };
}

async function trang(cookie, kho, lang, nen) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: "lang", value: lang, domain: host, path: "/" },
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.emulateTimezone(VN);
	await p.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: nen === "toi" ? "dark" : "light" },
	]);
	await p.setViewport({
		width: Number(kho),
		height: kho === "375" ? 812 : 900,
		deviceScaleFactor: 1,
	});
	return { ctx, p };
}

async function mo(p, url) {
	await p.goto(url, { waitUntil: "domcontentloaded", timeout: CHO_MS });
	const thay = await p
		.waitForSelector("[data-lo-trinh-moc-dem]", { timeout: CHO_MS })
		.then(() => true)
		.catch(() => false);
	if (!thay) {
		await p.screenshot({ path: join(RA, "khong-thay.png") }).catch(() => {});
		khongDo(`${url}: khong thay dong so moc — trang dang o ${p.url()}`);
	}
	await p
		.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
		.catch(() => {});
	await p.evaluate(() => {
		for (const s of [
			"nextjs-portal",
			".tsqd-parent-container",
			".tsqd-open-btn-container",
		])
			for (const e of document.querySelectorAll(s)) e.remove();
	});
	const nut = await p.$("[data-lo-trinh-khong-moc] button");
	if (!nut) khongDo("khong thay nut mo nhom chua hen moc");
	await nut.click();
	await p
		.waitForSelector("[data-lo-trinh-khong-moc][data-state=open]", {
			timeout: CHO_MS,
		})
		.catch(() => khongDo("nhom chua hen moc khong mo"));
	await new Promise((r) => setTimeout(r, 400));
}

async function chupDayDu(p, tep) {
	const vp = p.viewport();
	const them = await p.evaluate(() => {
		let max = document.documentElement.scrollHeight - window.innerHeight;
		for (const e of document.querySelectorAll("*")) {
			const oy = getComputedStyle(e).overflowY;
			if (oy === "auto" || oy === "scroll")
				max = Math.max(max, e.scrollHeight - e.clientHeight);
		}
		return Math.max(0, max);
	});
	if (them > 0)
		await p.setViewport({ ...vp, height: Math.min(vp.height + them, 12000) });
	await new Promise((r) => setTimeout(r, 500));
	await p.screenshot({ path: tep });
	await p.setViewport(vp);
}

const docMan = (p, ten) =>
	p.evaluate((tenMoc) => {
		const hien = (e) => e.getClientRects().length > 0;
		const vung = document.querySelector("[data-lo-trinh-xem-moc]");
		const phai = vung?.getBoundingClientRect().right ?? 0;
		const dem = {};
		const tran = [];
		const duoi = [];
		const dich = [];
		for (const li of document.querySelectorAll("[data-lo-trinh-moc]")) {
			const k = li.getAttribute("data-lo-trinh-moc") ?? "";
			const d = li.querySelector("[data-lo-trinh-moc-dem]");
			if (!d || !hien(d)) continue;
			dem[k] = (d.textContent ?? "").trim();
			if (d.getBoundingClientRect().right > phai + 0.5) tran.push(k);
			const can = tenMoc[k];
			const khong = [...li.querySelectorAll("[translate=no]")].map((x) =>
				(x.textContent ?? "").trim(),
			);
			const tenLo = [...li.querySelectorAll("[translate=no]")].find(
				(x) => (x.textContent ?? "").trim() === can?.lo,
			);
			if (!can || !khong.includes(can.moc) || !tenLo) dich.push(k);
			if (
				tenLo &&
				d.getBoundingClientRect().top <
					tenLo.getBoundingClientRect().bottom - 0.5
			)
				duoi.push(k);
		}
		const tenViec = [
			...document.querySelectorAll(
				"[data-lo-trinh-xem-moc] [data-viec-khoa] [data-slot=item-title], [data-lo-trinh-moc] [data-slot=timeline-title]",
			),
		].filter(hien);
		const cat = tenViec.filter((e) => e.scrollWidth > e.clientWidth + 1);
		const viecKhongDich = tenViec.filter(
			(e) =>
				!e.closest("[translate=no]") && e.getAttribute("translate") !== "no",
		);
		const nhom = document.querySelector("[data-lo-trinh-khong-moc]");
		const soNhom = Number(
			(nhom?.querySelector(".tabular-nums")?.textContent ?? "").trim(),
		);
		return {
			dem,
			tran,
			duoi,
			dich,
			soTen: tenViec.length,
			cat: cat.map((e) => e.textContent ?? ""),
			viecKhongDich: viecKhongDich.length,
			soNhom,
			cuon:
				document.documentElement.scrollWidth <=
				document.documentElement.clientWidth,
		};
	}, ten);

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	await db.banChupLoTrinh.deleteMany({ where: { nguon: LO_TRINH.nguonCrm } });
	const chu = phien(CHU);
	const slug = await suySlug(chu);
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	for (const [kho, lang, nen] of O) {
		const ky = kyVong(lang);
		const { ctx, p } = await trang(chu, kho, lang, nen);
		try {
			await mo(p, `${APP}/${slug}/lo-trinh?xemLoTrinh=moc&vongDoi=tat-ca`);
			const t = await docMan(p, ky.ten);
			const lech = Object.keys(ky.moc).filter((k) => t.dem[k] !== ky.moc[k]);
			const thua = Object.keys(t.dem).filter((k) => !(k in ky.moc));
			const conViec = Object.values(t.dem).filter(
				(x) => !x.startsWith(lang === "vi" ? "đã giao đủ" : "All "),
			).length;
			const giaoDu = Object.keys(t.dem).length - conViec;
			await chupDayDu(p, join(RA, `moc-${kho}-${lang}-${nen}.png`));
			kiem(
				`moc-${kho}-${lang}-${nen}`,
				`${Object.keys(t.dem).length}/${Object.keys(ky.moc).length} moc co dong so (${conViec} con viec, ${giaoDu} giao du), lech: ${lech.join(" | ") || "khong"}, thua: ${thua.length}, nhom chua hen ${t.soNhom}/${ky.chuaHen}, cuon ngang ${!t.cuon}, tran ${t.tran.length}, dong so khong duoi ten lo trinh ${t.duoi.length}, ten bi dich ${t.dich.length + t.viecKhongDich}, ${t.soTen} ten xet, cat chu ${t.cat.length}`,
				lech.length === 0 &&
					thua.length === 0 &&
					conViec > 0 &&
					giaoDu > 0 &&
					t.soNhom === ky.chuaHen &&
					t.cuon &&
					t.tran.length === 0 &&
					t.duoi.length === 0 &&
					t.dich.length === 0 &&
					t.viecKhongDich === 0 &&
					t.soTen > 0 &&
					t.cat.length === 0,
			);
		} finally {
			await ctx.close();
		}
	}
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
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
