import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { LO_TRINH } from "../../../apps/app/lib/lo-trinh/cau-hinh.ts";
import { docDuLieu } from "../../../apps/app/lib/lo-trinh/doc-du-lieu.js";
import { loTrinhMessages } from "../../../apps/app/lib/messages/lo-trinh.ts";
import { db } from "../../../packages/db/src/index.ts";
import { formatDay } from "../../../packages/ui/src/lib/format.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "lo-trinh-hien-ngay-du-kien", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const CHU = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const NHIP_DOI_MS = 5_000;
const VN = "Asia/Ho_Chi_Minh";
const MOC = "[data-lo-trinh-du-kien-moc]";
const O_MOC = [];
for (const kho of ["375", "1280"])
	for (const lang of ["vi", "en"])
		for (const nen of ["sang", "toi"]) O_MOC.push([kho, lang, nen]);
const O_NGAN = [
	["375", "vi"],
	["1280", "en"],
];
const MA_TRAN = [
	"dong-goi-moc-1280-vi",
	"dong-goi-moc-375-en",
	...O_MOC.map(([k, l, n]) => `ban-chup-moc-${k}-${l}-${n}`),
	...O_NGAN.map(([k, l]) => `ban-chup-ngan-${k}-${l}`),
];

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
const tao = { khoa: null };

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

function homNayVn() {
	return new Intl.DateTimeFormat("en-CA", { timeZone: VN }).format(new Date());
}

function luiNgay(ngay, n) {
	const d = new Date(`${ngay}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() - n);
	return d.toISOString().slice(0, 10);
}

const khoaMoc = (lo, m) => `${lo.tep}@${m.ngay}@${m.ten}`;

function mocDauTien(lo, ma) {
	return lo.moc.find((m) => m.hang.includes(ma)) ?? null;
}

function mocHien(duLieu) {
	const ra = [];
	for (const lo of duLieu.lo_trinh)
		for (const m of lo.moc) {
			if (!m.con_viec) continue;
			if (lo.hang.some((h) => mocDauTien(lo, h.ma) === m)) ra.push({ lo, m });
		}
	return ra;
}

const NGAY_ISO = /^\d{4}-\d{2}-\d{2}$/;

function kyVongMoc(m, lang) {
	const t = loTrinhMessages(lang).duKien;
	const h = m.du_kien?.hoan_tat;
	if (h && NGAY_ISO.test(h)) return { co: [t.ngay(formatDay(h, lang))] };
	return { co: [t.chuaCo], motTrong: Object.values(t.lyDo) };
}

async function taoKhoa(cookie) {
	const res = await fetch(`${API}/rest/api-keys`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			cookie: `${cookie.ten}=${cookie.gia}`,
		},
		body: JSON.stringify({
			name: `do LT1e ${Date.now().toString(36)}`,
			expiresInDays: 1,
			loai: "day-lo-trinh",
		}),
	});
	const than = await res.json().catch(() => null);
	if (!res.ok || !than?.key)
		khongDo(`tao khoa Day lo trinh tra ${res.status}: ${JSON.stringify(than)}`);
	tao.khoa = than.id ?? null;
	return than.key;
}

function khoiBanChup() {
	const khoi = docDuLieu(readFileSync(join(GOC, "LO-TRINH.html"), "utf8"));
	if (khoi.duLieu === null) khongDo("LO-TRINH.html khong mang khoi");
	const hien = mocHien(khoi.duLieu);
	const chon = hien[0];
	if (!chon) khongDo("khoi that khong co moc dang chay");
	const hom = homNayVn();
	chon.m.du_kien = {
		ngay_tinh: luiNgay(hom, 6),
		hoan_tat: luiNgay(hom, 2),
		chu: "dự báo lúc bắt đầu: hoàn tất",
	};
	chon.m.qua_tai = "mốc quá tải";
	const viec = chon.lo.hang.find(
		(h) =>
			mocDauTien(chon.lo, h.ma) === chon.m && h.nhom_trang_thai !== "da-giao",
	);
	if (!viec) khongDo("moc chon khong co viec mo");
	viec.gio_may = {
		thap: 4,
		cao: 6.5,
		nguon: "luat",
		chu: "4–6,5 giờ máy (máy ước)",
		co: "máy ước",
		phan_tram_tuan: null,
		phan_tram_chu: "chưa ước (0/5 vòng đo)",
	};
	return {
		khoi,
		ngayTinh: chon.m.du_kien.ngay_tinh,
		khoa: khoaMoc(chon.lo, chon.m),
		viec: `${chon.lo.tep}#${viec.ma}`,
		ma: viec.ma,
	};
}

async function dayBanChup(khoa, khoi) {
	const sha = execFileSync("git", ["rev-parse", "HEAD"], {
		cwd: GOC,
		encoding: "utf8",
	}).trim();
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

async function mo(p, url, cho) {
	await p.goto(url, { waitUntil: "domcontentloaded", timeout: CHO_MS });
	const thay = await p
		.waitForSelector(cho, { timeout: CHO_MS })
		.then(() => true)
		.catch(() => false);
	if (!thay) {
		await p.screenshot({ path: join(RA, "khong-thay.png") }).catch(() => {});
		khongDo(`${url}: khong thay ${cho} — trang dang o ${p.url()}`);
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
}

function tenTheoKhoa(duLieu) {
	const ra = {};
	for (const lo of duLieu.lo_trinh)
		for (const m of lo.moc) ra[khoaMoc(lo, m)] = m.ten;
	return ra;
}

async function chupMoc(p, khoa, tep) {
	const el = await p.evaluateHandle(
		(k) =>
			[...document.querySelectorAll("[data-lo-trinh-moc]")].find(
				(e) => e.getAttribute("data-lo-trinh-moc") === k,
			) ?? null,
		khoa,
	);
	const phanTu = el.asElement();
	if (!phanTu) khongDo(`khong thay moc ${khoa} de chup can canh`);
	await phanTu.scrollIntoView();
	await new Promise((r) => setTimeout(r, 300));
	await phanTu.screenshot({ path: tep });
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
		await p.setViewport({ ...vp, height: Math.min(vp.height + them, 8000) });
	await new Promise((r) => setTimeout(r, 500));
	await p.screenshot({ path: tep });
	await p.setViewport(vp);
}

const docMan = (p, vung, ten) =>
	p.evaluate(
		(selMoc, selVung, tenMoc) => {
			const hien = (e) => e.getClientRects().length > 0;
			const moc = {};
			for (const e of document.querySelectorAll(selMoc))
				if (hien(e))
					moc[e.getAttribute("data-lo-trinh-du-kien-moc")] =
						e.textContent ?? "";
			const catChu = [];
			for (const e of document.querySelectorAll(
				"[data-lo-trinh-du-kien], [data-lo-trinh-du-kien-co], [data-lo-trinh-uoc-luong]",
			)) {
				if (!hien(e)) continue;
				const chua = e.closest(selVung);
				if (!chua) continue;
				if (
					e.getBoundingClientRect().right >
					chua.getBoundingClientRect().right + 0.5
				)
					catChu.push(e.textContent ?? "");
				for (const n of e.querySelectorAll(
					"[data-slot=status-indicator-label]",
				))
					if (n.scrollWidth > n.clientWidth + 1)
						catChu.push(n.textContent ?? "");
			}
			const tieuDe = [
				...document.querySelectorAll("[data-lo-trinh-moc]"),
			].filter(hien);
			return {
				moc,
				catChu,
				cuon:
					document.documentElement.scrollWidth <=
					document.documentElement.clientWidth,
				khongDich:
					tieuDe.length > 0 &&
					tieuDe.every((e) => {
						const can = tenMoc[e.getAttribute("data-lo-trinh-moc")];
						return (
							can !== undefined &&
							[...e.querySelectorAll("[translate=no]")].some(
								(x) => (x.textContent ?? "").trim() === can,
							)
						);
					}),
			};
		},
		MOC,
		vung,
		ten,
	);

async function phanDongGoi(cookie, slug) {
	const khoi = docDuLieu(readFileSync(join(GOC, "LO-TRINH.html"), "utf8"));
	if (khoi.duLieu === null) khongDo("LO-TRINH.html khong mang khoi");
	const hien = mocHien(khoi.duLieu);
	for (const [kho, lang] of [
		["1280", "vi"],
		["375", "en"],
	]) {
		const { ctx, p } = await trang(cookie, kho, lang, "sang");
		try {
			await mo(p, `${APP}/${slug}/lo-trinh?xemLoTrinh=moc&vongDoi=tat-ca`, MOC);
			const t = await docMan(
				p,
				"[data-lo-trinh-xem-moc]",
				tenTheoKhoa(khoi.duLieu),
			);
			const thieu = [];
			for (const { lo, m } of hien) {
				const k = khoaMoc(lo, m);
				const chu = t.moc[k];
				const ky = kyVongMoc(m, lang);
				if (
					chu === undefined ||
					!ky.co.every((c) => chu.includes(c)) ||
					(ky.motTrong &&
						ky.motTrong.filter((c) => chu.includes(c)).length !== 1)
				)
					thieu.push(m.ten);
			}
			const coNgay = hien.filter(({ m }) =>
				NGAY_ISO.test(m.du_kien?.hoan_tat ?? ""),
			).length;
			await chupDayDu(p, join(RA, `dong-goi-moc-${kho}-${lang}.png`));
			const coNgayDau = hien.find(({ m }) =>
				NGAY_ISO.test(m.du_kien?.hoan_tat ?? ""),
			);
			if (coNgayDau)
				await chupMoc(
					p,
					khoaMoc(coNgayDau.lo, coNgayDau.m),
					join(RA, `dong-goi-moc-${kho}-${lang}-can.png`),
				);
			kiem(
				`dong-goi-moc-${kho}-${lang}`,
				`${hien.length} moc dang chay (${coNgay} co ngay, ${hien.length - coNgay} co co), thieu: ${thieu.join(" | ") || "khong"}, tren man ${Object.keys(t.moc).length}, cuon ngang ${!t.cuon}, cat chu ${t.catChu.length}`,
				hien.length > 0 &&
					thieu.length === 0 &&
					Object.keys(t.moc).length === hien.length &&
					t.cuon &&
					t.catChu.length === 0 &&
					t.khongDich,
			);
		} finally {
			await ctx.close();
		}
	}
}

async function choBanChup(cookie, slug, khoa) {
	const { ctx, p } = await trang(cookie, "1280", "vi", "sang");
	try {
		const het = Date.now() + CHO_MS;
		while (Date.now() < het) {
			await mo(p, `${APP}/${slug}/lo-trinh?xemLoTrinh=moc&vongDoi=tat-ca`, MOC);
			const co = await p.evaluate(
				(k) =>
					[...document.querySelectorAll("[data-lo-trinh-du-kien-moc]")].some(
						(e) =>
							e.getAttribute("data-lo-trinh-du-kien-moc") === k &&
							e.querySelector("[data-lo-trinh-du-kien-co=qua-tai]") !== null,
					),
				khoa,
			);
			if (co) return;
			await new Promise((r) => setTimeout(r, NHIP_DOI_MS));
		}
		khongDo(`trang khong doc ban chup sau ${CHO_MS} ms`);
	} finally {
		await ctx.close();
	}
}

async function phanBanChup(cookie, slug, chon) {
	for (const [kho, lang, nen] of O_MOC) {
		const t9 = loTrinhMessages(lang).duKien;
		const { ctx, p } = await trang(cookie, kho, lang, nen);
		try {
			await mo(p, `${APP}/${slug}/lo-trinh?xemLoTrinh=moc&vongDoi=tat-ca`, MOC);
			const t = await docMan(
				p,
				"[data-lo-trinh-xem-moc]",
				tenTheoKhoa(chon.khoi.duLieu),
			);
			const coBa = await p.evaluate((k) => {
				const e = [
					...document.querySelectorAll("[data-lo-trinh-du-kien-moc]"),
				].find((x) => x.getAttribute("data-lo-trinh-du-kien-moc") === k);
				return e
					? [...e.querySelectorAll("[data-lo-trinh-du-kien-co]")]
							.map((x) => x.getAttribute("data-lo-trinh-du-kien-co"))
							.sort()
					: [];
			}, chon.khoa);
			const chu = t.moc[chon.khoa] ?? "";
			await chupDayDu(p, join(RA, `ban-chup-moc-${kho}-${lang}-${nen}.png`));
			await chupMoc(
				p,
				chon.khoa,
				join(RA, `ban-chup-moc-${kho}-${lang}-${nen}-can.png`),
			);
			kiem(
				`ban-chup-moc-${kho}-${lang}-${nen}`,
				`co: ${coBa.join(",")}, cau cach tinh ${chu.includes(t9.cachTinh(formatDay(chon.ngayTinh, lang)))}, cuon ngang ${!t.cuon}, cat chu ${t.catChu.join(" | ") || 0}`,
				JSON.stringify(coBa) ===
					JSON.stringify(["chua-du-so-do", "da-qua", "qua-tai"]) &&
					chu.includes(t9.cachTinh(formatDay(chon.ngayTinh, lang))) &&
					t.cuon &&
					t.catChu.length === 0 &&
					t.khongDich,
			);
		} finally {
			await ctx.close();
		}
	}
	for (const [kho, lang] of O_NGAN) {
		const t9 = loTrinhMessages(lang).duKien;
		const { ctx, p } = await trang(cookie, kho, lang, "sang");
		try {
			await mo(
				p,
				`${APP}/${slug}/lo-trinh?vongDoi=tat-ca&q=${encodeURIComponent(chon.ma)}`,
				"[data-viec-khoa]",
			);
			const dongBang = await p.$$("tbody tr");
			let mo2 = false;
			for (const d of dongBang) {
				const k = await d
					.$eval("[data-viec-khoa]", (e) => e.getAttribute("data-viec-khoa"))
					.catch(() => null);
				if (k === chon.viec) {
					await d.click();
					mo2 = true;
					break;
				}
			}
			if (!mo2) khongDo(`khong thay dong cua viec ${chon.viec}`);
			await p.waitForSelector(
				"[data-lo-trinh-chi-tiet-viec] [data-lo-trinh-du-kien]",
				{ timeout: CHO_MS },
			);
			await new Promise((r) => setTimeout(r, 600));
			const t = await docMan(p, "[role=dialog]", tenTheoKhoa(chon.khoi.duLieu));
			const ngan = await p.evaluate(() => {
				const n = document.querySelector("[data-lo-trinh-chi-tiet-viec]");
				return {
					co: [
						...(n?.querySelectorAll(
							"[data-lo-trinh-du-kien] [data-lo-trinh-du-kien-co]",
						) ?? []),
					]
						.map((x) => x.getAttribute("data-lo-trinh-du-kien-co"))
						.sort(),
					uocLuong:
						n?.querySelector("[data-lo-trinh-uoc-luong]")?.textContent ?? "",
				};
			});
			await p.screenshot({
				path: join(RA, `ban-chup-ngan-${kho}-${lang}.png`),
			});
			kiem(
				`ban-chup-ngan-${kho}-${lang}`,
				`co: ${ngan.co.join(",")}, uoc luong «${ngan.uocLuong}», cuon ngang ${!t.cuon}, cat chu ${t.catChu.join(" | ") || 0}`,
				JSON.stringify(ngan.co) ===
					JSON.stringify(["chua-du-so-do", "da-qua", "qua-tai"]) &&
					ngan.uocLuong.includes(t9.gio(lang === "vi" ? "4–6,5" : "4–6.5")) &&
					t.cuon &&
					t.catChu.length === 0,
			);
		} finally {
			await ctx.close();
		}
	}
}

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
	await phanDongGoi(chu, slug);
	const chon = khoiBanChup();
	await dayBanChup(await taoKhoa(chu), chon.khoi);
	await choBanChup(chu, slug, chon.khoa);
	await phanBanChup(chu, slug, chon);
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
	await db.banChupLoTrinh
		.deleteMany({ where: { nguon: LO_TRINH.nguonCrm } })
		.catch(() => {});
	if (tao.khoa)
		await db.apikey.deleteMany({ where: { id: tao.khoa } }).catch(() => {});
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
