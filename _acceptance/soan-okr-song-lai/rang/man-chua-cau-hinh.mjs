import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { CUA_OKR } from "../../../apps/app/lib/cua-okr-config.ts";
import { okrSoanMessages } from "../../../apps/app/lib/messages/okr-soan.ts";
import { db } from "../../../packages/db/src/index.ts";
import { moCuoc, tangLuot } from "../../../packages/db/src/okr-cuoc-soan.ts";
import { PHIEN_CHO_EVE } from "../../../packages/validation/src/okr-cuoc-soan.ts";
import {
	idMau,
	laKhoDo,
	napBoMau,
	phienCookie,
	thuMau,
	trpc,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const GIAY_MS = 1000;
const DO = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: [
		{ ten: "1440", rong: 1440, cao: 1000 },
		{ ten: "390", rong: 390, cao: 844 },
	],
	choMs: 60 * GIAY_MS,
	nhipMs: 300,
	quanTri: "le-hai-dang",
	phong: { ma: "kd-bac", truong: "nguyen-thi-lan" },
	chuKy: "nam-ke",
	pha: "lap-ke-hoach",
	cua: "/eve/agents/okr/",
};

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = join(GOC, "_acceptance/soan-okr-song-lai/evidence");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const m = okrSoanMessages("vi");
const KY = idMau("chu-ky", DO.chuKy);
const PHONG = idMau("pb", DO.phong.ma);
const PHA = process.argv.includes("--pha") ? process.argv[process.argv.indexOf("--pha") + 1] : "rong";
const KIEM_DO_DO = process.argv.includes("--kiem-do-do");

const dong = [];
let sai = 0;
let trinhDuyet = null;
function kiem(nhan, dat) {
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhan}`);
	if (!dat) sai += 1;
}
async function ket(ma) {
	for (const d of dong) console.log(d);
	console.log(`${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI`);
	await trinhDuyet?.close().catch(() => {});
	await db.$disconnect().catch(() => {});
	process.exit(ma);
}
async function khongDo(cau) {
	console.log(`KHONG DO ${cau}`);
	await ket(2);
}
const tre = (ms) => new Promise((xong) => setTimeout(xong, ms));
async function cho(p, chon) {
	const het = Date.now() + DO.choMs;
	while (Date.now() < het) {
		if (await p.$(chon)) return true;
		await tre(DO.nhipMs);
	}
	return false;
}

const { canhCay } = await import("../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs");
const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`);
if (!laKhoDo()) await khongDo("DATABASE_URL khong phai kho do rieng — chay qua mot-luot.sh");

const nap = napBoMau();
if (nap.ma !== 0) await khongDo(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
const qt = phienCookie(thuMau(DO.quanTri));
const tl = phienCookie(thuMau(DO.phong.truong));
await trpc(API, qt).lam("okr.setProgram", { aiOn: true, aiSoanPhamVi: "danh-sach", aiSoanDonVi: [PHONG] });
const ky = (await trpc(API, qt).hoi("okr.cycles")).cycles.find((c) => c.id === KY);
if (ky?.phase !== DO.pha) await khongDo(`chu ky ${KY} o pha ${ky?.phase ?? "khong co"}, can ${DO.pha}`);
const truong = await db.user.findUnique({ where: { email: thuMau(DO.phong.truong) }, select: { id: true } });
if (!truong) await khongDo("khong thay truong phong trong bo mau");
const cuoc = await moCuoc(db, {
	cycleId: KY,
	level: "phong-ban",
	divisionId: null,
	departmentId: PHONG,
	nguoiMoUserId: truong.id,
	sessionId: `${PHIEN_CHO_EVE}do-${PHA}-${Date.now()}`,
	nac: "bat",
});
dong.push(`GIEO cuoc ${cuoc.id} dang soLuot ${cuoc.soLuot}`);

async function soLuot() {
	const ds = await trpc(API, tl).hoi("okr.soanDanhSachCuoc", { cycleId: KY, level: "phong-ban", divisionId: null, departmentId: PHONG });
	return ds.cuoc.find((c) => c.id === cuoc.id)?.soLuot ?? null;
}

async function trang(kho) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: tl.ten, value: tl.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({ width: kho.rong, height: kho.cao, deviceScaleFactor: 1 });
	const cuaGoi = [];
	if (PHA === "loi") {
		await p.setRequestInterception(true);
		p.on("request", (r) => {
			if (!new URL(r.url()).pathname.startsWith(DO.cua)) return void r.continue();
			cuaGoi.push(r.url());
			void r.respond({
				status: CUA_OKR.trangThaiChuaCauHinh,
				contentType: "application/json",
				body: JSON.stringify({ error: CUA_OKR.loi.chuaCauHinh }),
			});
		});
	} else {
		p.on("request", (r) => {
			if (new URL(r.url()).pathname.startsWith(DO.cua)) cuaGoi.push(r.url());
		});
	}
	return { ctx, p, cuaGoi };
}

async function tranNgang(p) {
	return p.evaluate(() => {
		const trang = document.documentElement.scrollWidth - innerWidth;
		const vung = [...document.querySelectorAll("[data-man-soan] *")]
			.filter((e) => ["auto", "scroll"].includes(getComputedStyle(e).overflowX))
			.map((e) => e.scrollWidth - e.clientWidth);
		return Math.max(trang, 0, ...vung);
	});
}

async function chup(p, ten) {
	if (KIEM_DO_DO) return;
	await p.screenshot({ path: join(RA, `${ten}.png`) });
	writeFileSync(join(RA, `${ten}.html`), await p.content());
}

const URL_DON = (slug, them = "") => `${APP}/${slug}/okr/theo-don-vi?kyOkr=${KY}&donOkr=pb:${PHONG}${them}`;

async function suySlug() {
	const res = await fetch(`${APP}/`, { redirect: "manual", headers: { cookie: `${tl.ten}=${tl.gia}; lang=vi` } });
	const dich = res.headers.get("location");
	return dich ? new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0] : null;
}

mkdirSync(RA, { recursive: true });
const slug = await suySlug();
if (!slug) await khongDo(`${APP}/ khong chuyen toi trang cua workspace`);
trinhDuyet = await puppeteer.launch({ executablePath: DO.chrome, headless: true });

try {
	for (const kho of DO.kho) {
		const { ctx, p, cuaGoi } = await trang(kho);
		if (PHA === "rong") {
			await p.goto(URL_DON(slug), { waitUntil: "networkidle2" });
			const coNut = await cho(p, "[data-nut-soan]");
			const hinh = coNut ? await p.$eval("[data-nut-soan]", (o) => o.getAttribute("data-nut-soan")) : null;
			kiem(hinh === "nut-chua-cau-hinh" ? `${kho.ten}: nut khoa nut-chua-cau-hinh` : `nut khong khoa khi da cau hinh gia: ${kho.ten} thay ${hinh}`, hinh === "nut-chua-cau-hinh");
			const moTa = coNut ? await p.$eval("[data-nut-soan]", (o) => o.innerText) : "";
			kiem(moTa.includes(m.nut.chuaCauHinh) ? `${kho.ten}: cau chua bat nhin thay` : `thieu cau chua cau hinh: ${kho.ten}`, moTa.includes(m.nut.chuaCauHinh));
			kiem(`${kho.ten}: nut disabled`, coNut && (await p.$eval("[data-nut-soan] button", (b) => b.disabled)));
			kiem(`${kho.ten}: khong tran ngang (nut) ${await tranNgang(p)}`, (await tranNgang(p)) <= 0);
			await chup(p, `E11-nut-${kho.ten}`);
			await p.goto(URL_DON(slug, `&cuocSoan=${cuoc.id}`), { waitUntil: "networkidle2" });
			const coMan = await cho(p, "[data-man-chua-cau-hinh]");
			kiem(`${kho.ten}: man soan trang trong`, coMan);
			const chuMan = coMan ? await p.$eval("[data-man-chua-cau-hinh]", (o) => o.innerText) : "";
			kiem(`${kho.ten}: man co cau chua bat`, chuMan.includes(m.nut.chuaCauHinh));
			kiem(`${kho.ten}: man khong co o soan`, (await p.$("[data-man-soan] textarea")) === null);
			await tre(2 * GIAY_MS);
			kiem(`${kho.ten}: 0 request ${DO.cua} (thay ${cuaGoi.length})`, cuaGoi.length === 0);
			kiem(`${kho.ten}: khong tran ngang (man) ${await tranNgang(p)}`, (await tranNgang(p)) <= 0);
			await chup(p, `E11-man-${kho.ten}`);
			if (kho.ten === "1440") {
				const truoc = await soLuot();
				kiem(`soLuot sau khi mo man: ${truoc}`, truoc === 0);
				if (!KIEM_DO_DO) await tangLuot(db, cuoc.id);
				const sau = await soLuot();
				kiem(sau === 1 ? "soLuot sau tangLuot: 1" : `phep doc soLuot khong nhay: ${sau}`, sau === 1);
			}
		} else {
			await p.goto(URL_DON(slug, `&cuocSoan=${cuoc.id}`), { waitUntil: "networkidle2" });
			const coLoi = await cho(p, '[data-tu-choi="chua-cau-hinh"]');
			kiem(`${kho.ten}: cua 503 -> cau chua bat`, coLoi && (await p.$eval('[data-tu-choi="chua-cau-hinh"]', (o) => o.innerText)).includes(m.nut.chuaCauHinh));
			kiem(`${kho.ten}: khong nut Thu lai`, (await p.$('[data-nut="thu-lai"]')) === null);
			kiem(`${kho.ten}: cua da duoc goi (${cuaGoi.length})`, cuaGoi.length > 0);
			kiem(`${kho.ten}: khong tran ngang (loi) ${await tranNgang(p)}`, (await tranNgang(p)) <= 0);
			await chup(p, `E11-loi-${kho.ten}`);
		}
		await ctx.close();
	}
} catch (loi) {
	await khongDo(`${PHA}: ${loi?.message ?? loi}`);
}

if (KIEM_DO_DO) {
	const dungKyVong = dong.some((d) => /^SAI (nut khong khoa khi da cau hinh gia|thieu cau chua cau hinh|phep doc soLuot khong nhay)/.test(d));
	for (const d of dong) console.log(d);
	console.log(dungKyVong ? "chieu do: phep do bat duoc loi nhu ky vong" : "SAI chieu do khong do");
	await db.$disconnect().catch(() => {});
	await trinhDuyet?.close().catch(() => {});
	process.exit(dungKyVong ? 1 : 2);
}
await ket(sai === 0 ? 0 : 1);
