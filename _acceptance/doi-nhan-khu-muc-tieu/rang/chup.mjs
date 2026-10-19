import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { okrMessages } from "../../../apps/app/lib/messages/okr.ts";
import { okrHoiYMessages } from "../../../apps/app/lib/messages/okr-hoi-y.ts";
import { THAM_SO_KY_OKR } from "../../../packages/validation/src/okr-chu-ky.ts";
import { idMau, laKhoDo, napBoMau, phienCookie, thuMau, tre, truyVan } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const TEP = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP), "..", "..", "..");
const HO_SO = join(GOC, "_acceptance/doi-nhan-khu-muc-tieu");
const RA = join(HO_SO, "evidence");
const RA_LUOT = join(GOC, ".acceptance-runs/doi-nhan-khu-muc-tieu/anh");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const GIAY_MS = 1000;
const MAN = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	rong: 1440,
	cao: 1000,
	cho: { manMs: 120 * GIAY_MS, yenMs: 1500 },
	nguoiXem: "le-hai-dang",
	thanhVien: "vo-duc-anh",
	mucTieuCoGop: "q4-kd-bac-1",
	chuKyHoiY: idMau("chu-ky", "nam-ke"),
	chuKyTrong: idMau("chu-ky", "quy4"),
	soAnh: 5,
};
const CAM_VI = ["căn chỉnh", "Căn chỉnh", "Hỏi ý", "Toàn công ty", "Toàn OneHub", "Đường lý do", "Chưa nối lên"];
const CAM_EN = ["Alignment", "Whole company", "All of OneHub", "Path of reasons"];
const DA_THONG_CONG = /^status: (signed-off|machine-cleared)$/m;
const vi = okrMessages("vi");
const en = okrMessages("en");
const hy = okrHoiYMessages("vi");

const dong = [];
let sai = 0;
let trinhDuyet = null;

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	for (const d of dong) console.log(d);
	console.log(`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`);
	process.exit(ma);
}
async function khongDo(cau) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	await ket(2);
}
function kiem(nhan, dat) {
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhan}`);
	if (!dat) sai += 1;
	return dat;
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, { redirect: "manual", headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` } });
	const dich = res.headers.get("location");
	if (!dich) return null;
	const dau = new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
	return dau && !["onboarding", "sign-in", "het-quyen"].some((x) => dau.startsWith(x)) ? dau : null;
}

const chuTrang = (p) => p.evaluate(() => `${document.body.innerText}\n${document.body.textContent ?? ""}`.replace(/[\u00a0\u202f]/g, " ").normalize("NFC"));
const choChu = (p, chu) =>
	p
		.waitForFunction(
			(c) => (document.body.textContent ?? "").replace(/[\u00a0\u202f]/g, " ").normalize("NFC").includes(c),
			{ timeout: MAN.cho.manMs },
			chu,
		)
		.then(() => true)
		.catch(() => false);
const camTrong = (chu, cam) => cam.filter((c) => chu.includes(c));

async function trang(ctx, duong) {
	const p = await ctx.newPage();
	await p.setViewport({ width: MAN.rong, height: MAN.cao, deviceScaleFactor: 1 });
	p.setDefaultNavigationTimeout(MAN.cho.manMs);
	p.setDefaultTimeout(MAN.cho.manMs);
	await p.goto(`${APP}${duong}`, { waitUntil: "load" });
	return p;
}

async function don(p) {
	await p.evaluate(() => document.fonts.ready);
	await tre(MAN.cho.yenMs);
	await p.evaluate(() => {
		for (const s of ["nextjs-portal", ".tsqd-parent-container", ".tsqd-open-btn-container"])
			for (const el of document.querySelectorAll(s)) el.remove();
	});
}

async function chup(p, ten) {
	mkdirSync(RA_LUOT, { recursive: true });
	const tep = join(RA_LUOT, `${ten}.png`);
	await p.screenshot({ path: tep });
	if (!DA_THONG_CONG.test(readFileSync(join(HO_SO, "contract.md"), "utf8"))) {
		mkdirSync(RA, { recursive: true });
		spawnSync("cp", [tep, join(RA, `${ten}.png`)]);
	}
	dong.push(`ANH _acceptance/doi-nhan-khu-muc-tieu/evidence/${ten}.png`);
}

async function bamThe(p, nhan) {
	return p.evaluate((n) => {
		const the = [...document.querySelectorAll('[role="tab"]')].find((e) => e.textContent?.trim().startsWith(n));
		if (!the) return false;
		the.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
		the.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
		the.click();
		return true;
	}, nhan);
}

async function coThe(p, nhan) {
	return p.evaluate(
		(n) => [...document.querySelectorAll('[role="tab"]')].some((e) => e.textContent?.trim().startsWith(n)),
		nhan,
	);
}

async function cuonKhoi(p) {
	await p.evaluate(() => document.querySelector("[data-khu=gop-vao]")?.scrollIntoView({ block: "center" }));
	await tre(MAN.cho.yenMs);
}

async function khongTran(p, nhan) {
	return p.evaluate((n) => {
		const el = [...document.querySelectorAll("button, a, [role=tab], h2, h3, div, p")].find(
			(e) => e.children.length === 0 && e.textContent?.trim() === n,
		);
		if (!el) return null;
		const khoi = getComputedStyle(el).display === "inline" ? (el.closest("[role=tab], button, a, h2, h3, div, p") ?? el) : el;
		const r = document.createRange();
		r.selectNodeContents(el);
		const dong = new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size;
		const dat = khoi.clientWidth > 0 && khoi.scrollWidth <= khoi.clientWidth + 1 && dong === 1;
		return { dat, chiTiet: `${khoi.tagName.toLowerCase()} rong ${khoi.scrollWidth}/${khoi.clientWidth}, ${dong} dong` };
	}, nhan);
}

async function vao(ngonNgu, cookie, slug) {
	const ctx = await trinhDuyet.createBrowserContext();
	const host = new URL(APP).hostname;
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: ngonNgu, domain: host, path: "/" },
	);
	return ctx;
}

const cay = await (await import("../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs")).canhCay();
if (cay.ket !== "dung-cay") await khongDo(`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`);
if (!laKhoDo()) await khongDo("DATABASE_URL khong phai kho do rieng — chay qua config:executors.script.dnk_chup");
const nap = napBoMau();
if (nap.ma !== 0) await khongDo(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
dong.push(`GHI NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
const cookie = phienCookie(thuMau(MAN.nguoiXem));
const slug = await suySlug(cookie);
if (!slug) await khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);
const url = process.env.DATABASE_URL;
const [ws] = await truyVan(url, 'select name from "organization" where slug = $1', [slug]);
const tenGoc = ws?.name;
if (!tenGoc) await khongDo(`khong doc duoc ten khong gian lam viec cua ${slug}`);
const [trong] = await truyVan(
	url,
	`select o.id from "okrObjective" o where o.level <> 'onehub' and o."droppedAt" is null
	 and o."cycleId" = $1 and o."hienThi" = 'cong-khai' and not exists (select 1 from "okrAlignment" a where a."objectiveId" = o.id) order by o.id limit 1`,
	[MAN.chuKyTrong],
);
if (!trong) await khongDo("bo mau khong co muc tieu cong khai quy 4 nao chua gop vao dau");

trinhDuyet = await puppeteer.launch({ executablePath: MAN.chrome, headless: true });
const idCoGop = idMau("mt", MAN.mucTieuCoGop);

{
	const ctx = await vao("vi", cookie, slug);
	const p = await trang(ctx, `/${slug}/okr/theo-don-vi?record=objective:${idCoGop}`);
	await p.waitForSelector(`[data-okr-sheet="${idCoGop}"] [data-khu=gop-vao]`);
	await don(p);
	kiem(`E15 khung-gop-vao: the «${vi.sheet.tabCanChinh}»`, await coThe(p, vi.sheet.tabCanChinh));
	kiem(`E15 khung-gop-vao: khoi «${vi.sheet.khuDuongLyDo}»`, await choChu(p, vi.sheet.khuDuongLyDo));
	await cuonKhoi(p);
	const chu = await chuTrang(p);
	kiem(`E15 khung-gop-vao: khong cum cam [${camTrong(chu, CAM_VI).join(", ")}]`, camTrong(chu, CAM_VI).length === 0);
	await chup(p, "E15-khung-gop-vao-1440");

	const t = await trang(ctx, `/${slug}/okr/theo-don-vi`);
	await don(t);
	const oChon = await t.$("[data-chon-don-vi]");
	if (!oChon) await khongDo("khong thay o chon don vi o Theo don vi");
	kiem(`E15 theo-don-vi: o chon goc mang «${tenGoc}»`, (await t.evaluate((e) => e.textContent ?? "", oChon)).includes(tenGoc));
	await oChon.click();
	await tre(MAN.cho.yenMs);
	const chuChon = await chuTrang(t);
	kiem(`E15 theo-don-vi: khong cum cam [${camTrong(chuChon, CAM_VI).join(", ")}]`, camTrong(chuChon, CAM_VI).length === 0);
	await chup(t, "E15-theo-don-vi-1440");

	await ctx.close();
	const ctxTv = await vao("vi", phienCookie(thuMau(MAN.thanhVien)), slug);
	const h = await trang(ctxTv, `/${slug}/okr/hoi-y?${THAM_SO_KY_OKR}=${encodeURIComponent(MAN.chuKyHoiY)}`);
	await don(h);
	kiem(`E15 do-phu: the khu «${vi.tab["hoi-y"]}»`, await choChu(h, vi.tab["hoi-y"]));
	const coBang = await h
		.waitForSelector('[data-khoi="do-phu"] [translate="no"]', { timeout: MAN.cho.manMs })
		.then(() => true)
		.catch(() => false);
	if (!coBang) {
		await chup(h, "E15-do-phu-loi-1440");
		await khongDo(`khong thay bang do phu «${hy.doPhu.tieuDe}» o lan lay y kien cua chu ky ${MAN.chuKyHoiY}`);
	}
	const hangGoc = await h.evaluate(
		(ten) => [...document.querySelectorAll('[translate="no"]')].some((e) => e.textContent === ten),
		tenGoc,
	);
	kiem(`E15 do-phu: hang goc mang dung «${tenGoc}» trong translate=no`, hangGoc);
	await h.evaluate(() => document.querySelector('[data-khoi="do-phu"]')?.scrollIntoView({ block: "start" }));
	await tre(MAN.cho.yenMs);
	const chuDoPhu = await chuTrang(h);
	kiem(`E15 do-phu: khong cum cam [${camTrong(chuDoPhu, CAM_VI).join(", ")}]`, camTrong(chuDoPhu, CAM_VI).length === 0);
	await chup(h, "E15-do-phu-1440");
	await ctxTv.close();
}

{
	const ctx = await vao("en", cookie, slug);
	const p = await trang(ctx, `/${slug}/okr/theo-don-vi?record=objective:${idCoGop}`);
	await p.waitForSelector(`[data-okr-sheet="${idCoGop}"] [data-khu=gop-vao]`);
	await don(p);
	kiem(`E15 en khung-gop-vao: the «${en.sheet.tabCanChinh}»`, await coThe(p, en.sheet.tabCanChinh));
	kiem(`E15 en khung-gop-vao: khoi «${en.sheet.khuDuongLyDo}»`, await choChu(p, en.sheet.khuDuongLyDo));
	await cuonKhoi(p);
	const chu = await chuTrang(p);
	kiem(`E15 en khung-gop-vao: khong cum cam [${camTrong(chu, CAM_EN).join(", ")}]`, camTrong(chu, CAM_EN).length === 0);
	await chup(p, "E15-khung-gop-vao-en-1440");

	const q = await trang(ctx, `/${slug}/okr/theo-don-vi?record=objective:${trong.id}`);
	await q.waitForSelector(`[data-okr-sheet="${trong.id}"]`);
	await don(q);
	kiem(`E15 en gop-vao-trong: bam the «${en.sheet.tabCanChinh}»`, await bamThe(q, en.sheet.tabCanChinh));
	await tre(MAN.cho.yenMs);
	kiem(`E15 en gop-vao-trong: «${en.chuaCanChinh}»`, await choChu(q, en.chuaCanChinh));
	for (const nhan of [en.sheet.tabCanChinh, en.chuaCanChinh]) {
		const kq = await khongTran(q, nhan);
		kiem(`E15 en gop-vao-trong: «${nhan}» khong tran hay cat (${kq?.chiTiet ?? "khong thay"})`, kq?.dat === true);
	}
	await chup(q, "E15-gop-vao-trong-en-1440");
	await ctx.close();
}

kiem(`du ${MAN.soAnh} anh (${dong.filter((d) => d.startsWith("ANH")).length})`, dong.filter((d) => d.startsWith("ANH")).length === MAN.soAnh);
await ket(sai === 0 ? 0 : 1);
