import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { TRO_LY_OKR_SOAN } from "../../../apps/agent-okr/agent/lib/config.ts";
import { khoiDongEve } from "../../../apps/agent-okr/test/support/khoi-dong.ts";
import { chepAppGia } from "../../../apps/agent-okr/test/support/mo-hinh-gia.ts";
import { okrSoanMessages } from "../../../apps/app/lib/messages/okr-soan.ts";
import { messages } from "../../../packages/ui/src/lib/messages.ts";
import {
	chayTrongPhienSoan,
	PHIEN_SOAN,
	trongPhienSoan,
} from "../../soan-okr-cung-tro-ly/rang/phien-soan.mjs";
import {
	duongPath,
	GOC,
	idMau,
	laKhoDo,
	napBoMau,
	pg,
	phienCookie,
	thuMau,
	tre,
	trpc,
	truyVan,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { agentGiaNguon, docVao, TEP } from "./kich-ban.mjs";

const GIAY_MS = 1000;
const PHUT_MS = 60 * GIAY_MS;

export const MAN = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		1440: { rong: 1440, cao: 900 },
		1024: { rong: 1024, cao: 800 },
		768: { rong: 768, cao: 1024 },
		375: { rong: 375, cao: 812 },
	},
	nen: ["light", "dark"],
	cho: { manMs: 60 * GIAY_MS, luotMs: 2 * PHUT_MS, nhipMs: 250, yenMs: 400 },
	quanTri: "le-hai-dang",
	phong: { ma: "kd-bac", truong: "nguyen-thi-lan" },
	chuKy: "nam-ke",
	phaSoan: "lap-ke-hoach",
	cua: "/eve/",
	tran: { tren: 8, oHoiThoaiPx: 380 },
};

const TIENG_ON_DEV = /\/_next\/hmr/;

export const m = okrSoanMessages("vi");
export const mui = messages("vi");
export const APP = process.env.APP_URL ?? "http://localhost:3000";
export const API = process.env.API_URL ?? "http://localhost:3001";
export const KY = idMau("chu-ky", MAN.chuKy);
export const PHONG = idMau("pb", MAN.phong.ma);
export const BANG = { evidence: join(GOC, "_acceptance/soan-okr-trang-rieng/evidence") };

const dong = [];
let sai = 0;
const don = [];
export const the = { slug: null, tl: null, qt: null, trinhDuyet: null, ra: null };

export function ghi(cau) {
	dong.push(cau);
	console.log(cau);
}

export function kiem(nhan, dat) {
	if (dat) ghi(`DUNG ${nhan}`);
	else {
		sai += 1;
		ghi(`SAI ${nhan}`);
	}
	return dat;
}

export function buoc(n, loi) {
	if (loi === null) ghi(`buoc ${n}: dat`);
	else {
		sai += 1;
		ghi(`buoc ${n}: ${loi}`);
	}
	return loi === null;
}

export async function ket(ma = sai === 0 ? 0 : 1) {
	for (const viec of don.splice(0).reverse()) await viec().catch(() => {});
	ghi(`KET LUAN: ${sai} SAI — ma thoat ${ma}`);
	process.exit(ma);
}

export async function khongDo(cau) {
	ghi(`KHONG DO DUOC: ${cau}`);
	await ket(2);
}

export async function moPhien(lenh) {
	if (!trongPhienSoan()) {
		console.log("-- chua co cong agent-okr trong phien — mo phien do rieng");
		process.exit(await chayTrongPhienSoan(lenh));
	}
	const { canhCay } = await import(
		"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
	);
	const cay = await canhCay();
	if (cay.ket !== "dung-cay")
		await khongDo(`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`);
	if (!laKhoDo())
		await khongDo("DATABASE_URL khong phai kho do rieng — chay qua scripts/lan-do/tien-de.mjs");
}

export async function chuanBi(phan) {
	const nap = napBoMau();
	if (nap.ma !== 0) await khongDo(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	the.qt = phienCookie(thuMau(MAN.quanTri));
	the.tl = phienCookie(thuMau(MAN.phong.truong));
	the.slug = await suySlug(the.qt);
	if (!the.slug) await khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);
	await trpc(API, the.qt).lam("okr.setProgram", {
		aiOn: true,
		aiSoanPhamVi: "danh-sach",
		aiSoanDonVi: [PHONG],
	});
	const ky = (await trpc(API, the.qt).hoi("okr.cycles")).cycles.find((c) => c.id === KY);
	if (ky?.phase !== MAN.phaSoan)
		await khongDo(`chu ky ${KY} o pha ${ky?.phase ?? "khong co"}, can ${MAN.phaSoan}`);
	the.ra = join(GOC, ".acceptance-runs/soan-okr-trang-rieng/man", phan);
	rmSync(the.ra, { recursive: true, force: true });
	mkdirSync(the.ra, { recursive: true });
	const app = chepAppGia({ them: { "agent/agent.ts": agentGiaNguon(the.ra) } });
	don.push(async () => app.don());
	const may = await khoiDongEve({
		goc: app.goc,
		cong: Number(process.env[PHIEN_SOAN.bienCong]),
		env: { NODE_ENV: "development", CRM_TELEMETRY_DISABLED: "1", PATH: duongPath() },
	});
	don.push(() => may.dung());
	ghi(`AGENT-OKR GIA ${may.url} · ${TRO_LY_OKR_SOAN.tinhNang}`);
	the.trinhDuyet = await puppeteer.launch({ executablePath: MAN.chrome, headless: true });
	don.push(() => the.trinhDuyet.close());
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) return null;
	const dau = new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
	return dau && !["onboarding", "sign-in", "het-quyen"].some((x) => dau.startsWith(x))
		? dau
		: null;
}

export async function moCuoc() {
	const kq = await trpc(API, the.tl).lam("okr.soanMo", {
		cycleId: KY,
		level: "phong-ban",
		divisionId: null,
		departmentId: PHONG,
	});
	const cuoc = kq.ok ? kq.cuoc : kq.cuocDang;
	if (!cuoc) await khongDo(`okr.soanMo tu choi: ${kq.lyDo}`);
	return cuoc;
}

export async function datLuot(cuocId, soLuot) {
	await truyVan(process.env.DATABASE_URL, `UPDATE "okrCuocSoan" SET "soLuot" = $2 WHERE id = $1`, [
		cuocId,
		soLuot,
	]);
}

export async function khoaBangCuoc() {
	if (!laKhoDo()) throw new Error("chi khoa bang trong kho do rieng");
	const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
	await c.connect();
	await c.query("BEGIN");
	await c.query('LOCK TABLE "okrCuocSoan" IN ACCESS EXCLUSIVE MODE');
	return async () => {
		await c.query("ROLLBACK").catch(() => {});
		await c.end().catch(() => {});
	};
}

export const sql = (cau, thamSo = []) => truyVan(process.env.DATABASE_URL, cau, thamSo);

export async function trang(kho = MAN.kho[1440], nen = "light", cookie = the.tl) {
	const host = new URL(APP).hostname;
	const ctx = await the.trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({ width: kho.rong, height: kho.cao, deviceScaleFactor: 1 });
	await p.emulateMediaFeatures([{ name: "prefers-color-scheme", value: nen }]);
	const loi = [];
	p.on("console", (msg) => {
		if (msg.type() === "error" && !TIENG_ON_DEV.test(msg.text())) loi.push(msg.text());
	});
	p.on("pageerror", (e) => loi.push(e.message));
	p.on("dialog", (d) => {
		if (d.type() !== "beforeunload") return;
		ghi("   (hop roi trang hien — nhan Tai lai)");
		void d.accept();
	});
	return { ctx, p, rong: kho.rong, nen, loi, dong: () => ctx.close() };
}

export const duongSoan = (id) => `${APP}/${the.slug}/okr/soan/${id}`;
export const duongDonVi = () =>
	`${APP}/${the.slug}/okr/theo-don-vi?kyOkr=${encodeURIComponent(KY)}&donOkr=${encodeURIComponent(`pb:${PHONG}`)}`;

export async function choThay(p, ham, moTa, ms = MAN.cho.manMs, ...thamSo) {
	try {
		await p.waitForFunction(ham, { timeout: ms, polling: MAN.cho.nhipMs }, ...thamSo);
		return true;
	} catch {
		ghi(`-- het gio cho: ${moTa}`);
		return false;
	}
}

export async function moTrang(t, id, thamSo = "") {
	await t.p.goto(`${duongSoan(id)}${thamSo}`, { waitUntil: "load" });
	return choThay(
		t.p,
		() =>
			[...document.querySelectorAll("[data-trang-soan]")].some(
				(o) => o.checkVisibility() && o.getAttribute("data-trang-soan") !== "dang-mo",
			),
		"trang soan mo",
	);
}

export const CHON = {
	oSoan: "[data-o-soan] textarea",
	gui: '[data-slot="kara-composer"] button[aria-label="Gửi"]',
	dung: '[data-slot="kara-composer"] button[aria-label="Dừng"]',
	dangLam: '[data-kara-turn="kara"] [data-kara-state="working"]',
	dong: "[data-dong]",
	moc: '[data-kara-turn="checkpoint"] button',
	nguoi: '[data-kara-turn="user"]',
	heThong: '[data-kara-turn="system"]',
	chip: '[data-slot="kara-context"]',
	thanh: '[data-slot="resizable-handle"]',
	oHoiThoai: '[data-cot="hoi-thoai"]',
	oBanNhap: '[data-cot="ban-nhap"]',
};

export async function choYen(p, ms = MAN.cho.luotMs) {
	const yen = await choThay(
		p,
		(gui, dangLam) => !!document.querySelector(gui) && !document.querySelector(dangLam),
		"luot yen",
		ms,
		CHON.gui,
		CHON.dangLam,
	);
	await tre(MAN.cho.yenMs);
	return yen;
}

export async function choMoHinh(soTruoc, ms = MAN.cho.luotMs) {
	const han = Date.now() + ms;
	while (Date.now() < han) {
		if (docVao(the.ra).length > soTruoc) return true;
		await tre(MAN.cho.nhipMs);
	}
	return false;
}

export async function guiTin(t, chu, { choXong = true, choToi = true } = {}) {
	const truoc = docVao(the.ra).length;
	const o = await t.p.waitForFunction(
		(chon) => [...document.querySelectorAll(chon)].find((x) => x.checkVisibility() && !x.disabled) ?? null,
		{ timeout: MAN.cho.manMs, polling: MAN.cho.nhipMs },
		CHON.oSoan,
	);
	await o.asElement().click();
	await t.p.keyboard.type(chu);
	await t.p.keyboard.press("Enter");
	if (!choToi) return true;
	const toi = await choMoHinh(truoc);
	if (!toi) return false;
	return choXong ? choYen(t.p) : true;
}

export async function choSoDong(p, n) {
	return choThay(p, (chon, n) => document.querySelectorAll(chon).length === n, `${n} dong`, MAN.cho.luotMs, CHON.dong, n);
}

export async function mo(t, id) {
	if (!(await moTrang(t, id))) return false;
	if (docVao(the.ra).length === 0 && !(await choMoHinh(0))) return false;
	return choYen(t.p);
}

export const vao = () => docVao(the.ra);

export function giuMoHinh(bat) {
	const tep = join(the.ra, TEP.giu);
	if (bat) writeFileSync(tep, "giu");
	else if (existsSync(tep)) rmSync(tep);
}

export async function dongCua(p, ten) {
	return p.evaluateHandle(
		(ten) => [...document.querySelectorAll("[data-dong]")].find((d) => d.textContent?.includes(ten)) ?? null,
		ten,
	);
}

export async function bamTrongDong(p, ten, nhan) {
	const ok = await p.evaluate(
		(ten, nhan) => {
			const d = [...document.querySelectorAll("[data-dong]")].find((x) => x.checkVisibility() && x.textContent?.includes(ten));
			const nut = d && [...d.querySelectorAll("button")].find((b) => b.textContent?.trim() === nhan || b.getAttribute("aria-label") === nhan);
			if (!nut || nut.disabled) return false;
			nut.click();
			return true;
		},
		ten,
		nhan,
	);
	if (ok) await tre(MAN.cho.yenMs);
	return ok;
}

export async function choBienNhan(p, ten) {
	return choThay(
		p,
		(ten) => {
			const d = [...document.querySelectorAll("[data-dong]")].find((x) => x.textContent?.includes(ten));
			return !!d?.querySelector('[data-slot="proposed-change-receipt"]');
		},
		`bien nhan ${ten}`,
		MAN.cho.manMs,
		ten,
	);
}

export async function tranVaCuon(p) {
	return p.evaluate(() => {
		const g = document.scrollingElement ?? document.documentElement;
		return { sw: g.scrollWidth, cw: g.clientWidth, sh: g.scrollHeight, ch: g.clientHeight };
	});
}
