import { execFileSync } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { docDuLieu } from "../../../apps/app/lib/lo-trinh/doc-du-lieu.js";
import { sanPhamMessages } from "../../../apps/app/lib/messages/san-pham.ts";
import { db } from "../../../packages/db/src/index.ts";
import { datNguoiXem } from "../../../packages/db/src/san-pham-lo-trinh.ts";
import { PHIEN_DO } from "../../../scripts/lan-do/cau-hinh.mjs";
import { taoGithubGia } from "../../../scripts/lo-trinh-san-pham/github-gia.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "lo-trinh-nhieu-san-pham", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const CHU = process.env.NGUOI ?? PHIEN_DO.nguoi;
const NGUOI_A = "ltsp-a@lan-do.onehub.vn";
const NGUOI_B = "ltsp-b@lan-do.onehub.vn";
const CHO_MS = 90_000;
const VN = "Asia/Ho_Chi_Minh";
const HTML_KIT = readFileSync(join(GOC, "apps/agent/test/mau/lo-trinh-kit.html"), "utf8");
const KIT = { ten: "Kit nghiệm thu", ma: "kit-nghiem-thu", kho: "phanlemanh/acceptance-gate-kit", nhanh: "main" };
const HONG = { ten: "Kho hỏng", ma: "kho-hong", kho: "phanlemanh/kho-hong", nhanh: "main" };
const O = [];
for (const kho of ["375", "1280"])
	for (const lang of ["vi", "en"])
		for (const nen of ["sang", "toi"]) O.push([kho, lang, nen]);
const MA_TRAN = [
	"AC-1-cai-dat",
	"AC-1-lo-trinh",
	"AC-1-ho-so",
	"o-1280-vi-sang-pr",
	...O.flatMap(([k, l, n]) => [1, 2, 3, 4, 5].map((d) => `o-${k}-${l}-${n}-${d}`)),
];

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
let mayGia = null;

class KhongDo extends Error {}
function khongDo(cau) {
	throw new KhongDo(cau);
}

function kiem(ma, nhan, dat) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ${ma} khong co trong MA_TRAN`);
	daPhat.add(ma);
	const nhanAc = ma.startsWith("AC-1") ? "[AC-1] " : "";
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhanAc}${ma}: ${nhan}`);
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

async function datVai(email, role) {
	const u = await db.user.findUnique({ where: { email }, select: { id: true } });
	if (!u) khongDo(`khong co nguoi ${email}`);
	const org = await db.organization.findFirst({ select: { id: true } });
	await db.member.upsert({
		where: { organizationId_userId: { organizationId: org.id, userId: u.id } },
		create: { id: `ltsp-${u.id}`, organizationId: org.id, userId: u.id, role, createdAt: new Date() },
		update: { role },
	});
	return u.id;
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
	await p.setViewport({ width: Number(kho), height: kho === "375" ? 812 : 900, deviceScaleFactor: 1 });
	return { ctx, p };
}

async function den(p, url, cho) {
	await p.goto(url, { waitUntil: "domcontentloaded", timeout: CHO_MS });
	const thay = await p
		.waitForSelector(cho, { timeout: CHO_MS })
		.then(() => true)
		.catch(() => false);
	if (!thay) {
		await p.screenshot({ path: join(RA, "khong-thay.png") }).catch(() => {});
		khongDo(`${url}: khong thay ${cho} — trang dang o ${p.url()}`);
	}
	await p.waitForNetworkIdle({ idleTime: 600, timeout: CHO_MS }).catch(() => {});
	await p.evaluate(() => {
		for (const s of ["nextjs-portal", ".tsqd-parent-container", ".tsqd-open-btn-container"])
			for (const e of document.querySelectorAll(s)) e.remove();
	});
}

async function chup(p, tep) {
	const vp = p.viewport();
	const h = await p.evaluate(() => document.documentElement.scrollHeight);
	await p.setViewport({ ...vp, height: Math.min(Math.max(vp.height, h), 6000) });
	await new Promise((r) => setTimeout(r, 300));
	await p.screenshot({ path: tep });
	await p.setViewport(vp);
}

const khongCuon = (p) =>
	p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

async function khaiQuaMan(p, slug, sp) {
	await den(p, `${APP}/${slug}/settings/san-pham`, "[data-trang-san-pham]");
	await p.click('[data-nut="them-san-pham"]');
	await p.waitForSelector('[data-o="ten"] input', { timeout: CHO_MS });
	for (const [o, gt] of [["ten", sp.ten], ["kho", sp.kho], ["nhanh", sp.nhanh]]) {
		const sel = `[data-o="${o}"] input`;
		await p.click(sel, { clickCount: 3 });
		await p.keyboard.press("Backspace");
		await p.type(sel, gt);
	}
	await p.click('[data-nut="luu-san-pham"]');
	await p
		.waitForSelector(`[data-san-pham="${sp.ma}"]`, { timeout: CHO_MS })
		.catch(() => khongDo(`khai ${sp.ma} qua man khong hien dong`));
}

function tepCoViec() {
	const k = docDuLieu(HTML_KIT).duLieu;
	return k.lo_trinh.filter((l) => l.hang.length > 0).map((l) => l.tep).sort();
}

function viecCoChuKho() {
	const k = docDuLieu(HTML_KIT).duLieu;
	for (const l of k.lo_trinh)
		for (const h of l.hang) if (h.tom_tat?.chu_kho?.ma) return { tep: l.tep, ma: h.ma };
	khongDo("mau kit khong co viec mang so lieu chu kho");
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	for (const sp of [KIT, HONG]) {
		await db.banChupLoTrinh.deleteMany({ where: { nguon: sp.ma } });
		await db.sanPhamLoTrinh.deleteMany({ where: { ma: sp.ma } });
	}

	const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
	const gia = taoGithubGia({
		khoaCongKhai: publicKey.export({ type: "spki", format: "pem" }).toString(),
		idUngDung: "4242",
		kho: {
			[KIT.kho]: { html: () => HTML_KIT, dauNhanh: { sha: "c".repeat(40), commitLuc: "2026-10-19T10:00:00Z" }, caiLuc: "2026-10-19T09:00:00Z" },
			[HONG.kho]: { html: () => null, dauNhanh: { sha: "d".repeat(40), commitLuc: "2026-10-19T10:00:00Z" }, caiLuc: "2026-10-19T09:00:00Z" },
		},
	});
	mayGia = Bun.serve({ port: 0, fetch: gia.xuLy });
	process.env.GITHUB_APP_ID = "4242";
	process.env.GITHUB_APP_PRIVATE_KEY = privateKey.export({ type: "pkcs1", format: "pem" }).toString();
	process.env.GITHUB_API_URL = `http://localhost:${mayGia.port}`;

	const chu = phien(CHU);
	await datVai(CHU, "owner");
	phien(NGUOI_A);
	phien(NGUOI_B);
	const idA = await datVai(NGUOI_A, "member");
	await datVai(NGUOI_B, "member");
	const cookieA = phien(NGUOI_A);
	const cookieB = phien(NGUOI_B);
	const slug = await suySlug(chu);
	trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });

	const { ctx: ctx0, p: p0 } = await trang(chu, "1280", "vi", "sang");
	try {
		await khaiQuaMan(p0, slug, KIT);
		await khaiQuaMan(p0, slug, HONG);
	} finally {
		await ctx0.close();
	}
	await datNguoiXem(db, KIT.ma, [idA]);

	const { layLoTrinhSanPham } = await import("../../../apps/agent/agent/lib/lo-trinh-san-pham.ts");
	const nhip = await layLoTrinhSanPham(new Date());
	dong.push(`-- nhip lay that: ${JSON.stringify(nhip)}, goi GitHub gia: ${gia.goi.length}`);

	const tt = sanPhamMessages("vi").trangThai;
	{
		const { ctx, p } = await trang(chu, "1280", "vi", "sang");
		try {
			await den(p, `${APP}/${slug}/settings/san-pham`, `[data-san-pham="${KIT.ma}"]`);
			const o = await p.$eval(`[data-san-pham="${KIT.ma}"]`, (e) => ({
				tt: e.querySelector("[data-san-pham-trang-thai]")?.textContent?.trim() ?? "",
				moTa: e.textContent ?? "",
			}));
			kiem("AC-1-cai-dat", `kit trang thai "${o.tt}", co gio lay ${o.moTa.includes("lấy lúc")}`, o.tt === tt["da-lay"] && o.moTa.includes("lấy lúc"));
			await den(p, `${APP}/${slug}/lo-trinh?sanPham=${KIT.ma}&xemLoTrinh=moc&vongDoi=tat-ca`, "[data-lo-trinh-gio-lay]");
			const tep = await p.evaluate(() => [...new Set([...document.querySelectorAll("[data-viec-khoa]")].map((e) => (e.getAttribute("data-viec-khoa") ?? "").split("#")[0]))].sort());
			const ky = tepCoViec();
			kiem("AC-1-lo-trinh", `lo trinh tren man ${tep.length}/${ky.length}: ${tep.join(",")}`, JSON.stringify(tep) === JSON.stringify(ky));
			const v = viecCoChuKho();
			await den(p, `${APP}/${slug}/lo-trinh?sanPham=${KIT.ma}&vongDoi=tat-ca&q=${encodeURIComponent(v.ma)}&viec=${encodeURIComponent(`${v.tep}#${v.ma}`)}`, "[role=dialog]");
			const tieuDe = await p.$eval("[role=dialog]", (e) => (e.querySelector("[data-slot=sheet-title], h2")?.textContent ?? "").trim());
			kiem("AC-1-ho-so", `ngan ho so mo, tieu de "${tieuDe.slice(0, 40)}"`, tieuDe !== "");
			await chup(p, join(RA, "ac1-ho-so-1280-vi-sang.png"));
			const tab = await p.$$("[role=tab]");
			let href = "";
			for (const t of tab) {
				const chu2 = await t.evaluate((e) => e.textContent ?? "");
				if (chu2.includes("Số liệu")) {
					await t.click();
					await p.waitForSelector("[data-lo-trinh-so-lieu] a[href*='github.com/search']", { timeout: CHO_MS }).catch(() => {});
					href = await p.$eval("[data-lo-trinh-so-lieu] a[href*='github.com/search']", (a) => a.getAttribute("href") ?? "").catch(() => "");
				}
			}
			kiem("o-1280-vi-sang-pr", `lien ket tim PR ${href.slice(0, 90)}`, decodeURIComponent(href).includes(`repo:${KIT.kho}`));
		} finally {
			await ctx.close();
		}
	}

	for (const [kho, lang, nen] of O) {
		const o = `o-${kho}-${lang}-${nen}`;
		const ttL = sanPhamMessages(lang).trangThai;
		const { ctx, p } = await trang(chu, kho, lang, nen);
		try {
			await den(p, `${APP}/${slug}/lo-trinh`, "[data-lo-trinh-bo-chon]");
			await p.click("[data-lo-trinh-bo-chon]");
			await p.waitForSelector(`[data-lo-trinh-san-pham="${KIT.ma}"]`, { timeout: CHO_MS });
			await p.click(`[data-lo-trinh-san-pham="${KIT.ma}"]`);
			await p.waitForSelector("[data-lo-trinh-gio-lay]", { timeout: CHO_MS }).catch(() => {});
			const urlChon = p.url();
			await den(p, urlChon, "[data-lo-trinh-gio-lay]");
			const m1 = await p.evaluate(() => ({
				gio: document.querySelector("[data-lo-trinh-gio-lay]")?.textContent ?? "",
				chon: document.querySelector("[data-lo-trinh-bo-chon]")?.textContent ?? "",
			}));
			kiem(`${o}-1`, `url ${new URL(urlChon).search}, giu sau tai lai, dong nguon "${m1.gio.trim()}"`, urlChon.includes(`sanPham=${KIT.ma}`) && m1.gio.includes(KIT.kho) && m1.gio.includes(KIT.nhanh) && m1.chon.includes(KIT.ten));
			await den(p, `${APP}/${slug}/lo-trinh?sanPham=${KIT.ma}&xemLoTrinh=moc&vongDoi=tat-ca`, "[data-lo-trinh-moc]");
			const m3 = await p.evaluate(() => ({
				chon: Boolean(document.querySelector("[data-lo-trinh-bo-chon] [translate=no]")),
				moc: [...document.querySelectorAll("[data-lo-trinh-moc]")].filter((li) => !li.querySelector("[translate=no]")).length,
				soMoc: document.querySelectorAll("[data-lo-trinh-moc]").length,
			}));
			kiem(`${o}-3`, `ten san pham khong dich ${m3.chon}, moc thieu translate=no ${m3.moc}/${m3.soMoc}`, m3.chon && m3.moc === 0 && m3.soMoc > 0);
			const cuon1 = await khongCuon(p);
			await chup(p, join(RA, `lo-trinh-${kho}-${lang}-${nen}.png`));
			await den(p, `${APP}/${slug}/settings/san-pham`, `[data-san-pham="${HONG.ma}"]`);
			const m4 = await p.evaluate((ma) => {
				const hang = [...document.querySelectorAll("[data-san-pham-trang-thai]")];
				return {
					rong: hang.filter((h) => (h.textContent ?? "").trim() === "").length,
					so: hang.length,
					hong: document.querySelector(`[data-san-pham="${ma}"] [data-san-pham-trang-thai]`)?.textContent?.trim() ?? "",
				};
			}, HONG.ma);
			kiem(`${o}-4`, `${m4.so} hang co chu trang thai, rong ${m4.rong}, hang hong "${m4.hong}"`, m4.so >= 2 && m4.rong === 0 && m4.hong === ttL["khong-thay-tep"]);
			const cuon2 = await khongCuon(p);
			await chup(p, join(RA, `cai-dat-${kho}-${lang}-${nen}.png`));
			kiem(`${o}-5`, `khong cuon ngang lo trinh ${cuon1}, cai dat ${cuon2}`, cuon1 && cuon2);
		} finally {
			await ctx.close();
		}
		const { ctx: ctxB, p: pB } = await trang(cookieB, kho, lang, nen);
		try {
			await den(pB, `${APP}/${slug}/lo-trinh?sanPham=${KIT.ma}`, "[data-lo-trinh-trang], [data-lo-trinh-moc], table, [data-lo-trinh-bo-chon], main");
			await pB.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS }).catch(() => {});
			const m2 = await pB.evaluate((ten) => ({
				chon: Boolean(document.querySelector("[data-lo-trinh-bo-chon]")),
				lo: (document.body.textContent ?? "").includes(ten),
			}), KIT.ten);
			kiem(`${o}-2`, `nguoi khong duoc cap: o chon ${m2.chon}, lo ten ${m2.lo}`, !m2.chon && !m2.lo);
		} finally {
			await ctxB.close();
		}
	}
	void cookieA;
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
	mayGia?.stop(true);
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`);
process.exit(ma);
