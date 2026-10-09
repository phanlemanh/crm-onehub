import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
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

const RANG = dirname(fileURLToPath(import.meta.url));
const HO_SO = join(RANG, "..");
export const GOC = join(HO_SO, "..", "..");
const SLUG_HO_SO = "soan-okr-trong-khung";

export const MAN = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		1920: { rong: 1920, cao: 1080 },
		1440: { rong: 1440, cao: 1000 },
		1280: { rong: 1280, cao: 900 },
		1024: { rong: 1024, cao: 768 },
		1023: { rong: 1023, cao: 768 },
		768: { rong: 768, cao: 1024 },
		375: { rong: 375, cao: 812 },
	},
	nen: ["light", "dark"],
	cho: { manMs: 60 * GIAY_MS, luotMs: 2 * PHUT_MS, nhipMs: 250, yenMs: 400, dungYenMs: 250 },
	quanTri: "le-hai-dang",
	phong: { ma: "kd-bac", truong: "nguyen-thi-lan" },
	chuKy: "nam-ke",
	phaSoan: "lap-ke-hoach",
	nguongHep: 1024,
	nguongDienThoai: 768,
};

const TIENG_ON_DEV = /\/_next\/hmr|webpack-hmr|\[HMR\]|\[Fast Refresh\]/;

export const m = okrSoanMessages("vi");
export const mui = messages("vi");
export const APP = process.env.APP_URL ?? "http://localhost:3000";
export const API = process.env.API_URL ?? "http://localhost:3001";
export const KY = idMau("chu-ky", MAN.chuKy);
export const PHONG = idMau("pb", MAN.phong.ma);
export const BANG = { evidence: join(HO_SO, "evidence") };
export const KHUNG = '[data-slot="sheet-content"],[data-slot="drawer-content"]';

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

export function saiThem(cau) {
	sai += 1;
	ghi(cau);
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

export const lenhCua = (phan, doDo) =>
	`bun scripts/lan-do/tien-de.mjs --chay "bun ${relative(GOC, join(RANG, "man.mjs"))} --phan ${phan}${doDo ? ` --kiem-do-do ${doDo}` : ""}"`;

export async function moPhien(lenh) {
	if (!trongPhienSoan()) {
		console.log("-- chua co cong agent-okr trong phien — mo phien do rieng");
		process.exit(await chayTrongPhienSoan(lenh));
	}
	const { canhCay } = await import("../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs");
	const cay = await canhCay();
	if (cay.ket !== "dung-cay")
		await khongDo(`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`);
	if (!laKhoDo()) await khongDo("DATABASE_URL khong phai kho do rieng — chay qua scripts/lan-do/tien-de.mjs");
}

export async function chuanBi(phan) {
	const nap = napBoMau();
	if (nap.ma !== 0) await khongDo(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	the.qt = phienCookie(thuMau(MAN.quanTri));
	the.tl = phienCookie(thuMau(MAN.phong.truong));
	the.slug = await suySlug(the.qt);
	if (!the.slug) await khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);
	await trpc(API, the.qt).lam("okr.setProgram", { aiOn: true, aiSoanPhamVi: "danh-sach", aiSoanDonVi: [PHONG] });
	const ky = (await trpc(API, the.qt).hoi("okr.cycles")).cycles.find((c) => c.id === KY);
	if (ky?.phase !== MAN.phaSoan) await khongDo(`chu ky ${KY} o pha ${ky?.phase ?? "khong co"}, can ${MAN.phaSoan}`);
	the.ra = join(GOC, ".acceptance-runs", SLUG_HO_SO, "man", phan);
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
	const res = await fetch(`${APP}/`, { redirect: "manual", headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` } });
	const dich = res.headers.get("location");
	if (!dich) return null;
	const dau = new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
	return dau && !["onboarding", "sign-in", "het-quyen"].some((x) => dau.startsWith(x)) ? dau : null;
}

export const sql = (cau, thamSo = []) => truyVan(process.env.DATABASE_URL, cau, thamSo);

const DON_VI = { cycleId: KY, level: "phong-ban", divisionId: null, departmentId: PHONG };

export async function moCuoc() {
	const kq = await trpc(API, the.tl).lam("okr.soanMo", DON_VI);
	const cuoc = kq.ok ? kq.cuoc : kq.cuocDang;
	if (!cuoc) await khongDo(`okr.soanMo tu choi: ${kq.lyDo}`);
	return cuoc;
}

export async function moCuocMoi() {
	await sql(`UPDATE "okrCuocSoan" SET "soLuot" = 0 WHERE "cycleId" = $1 AND "departmentId" = $2 AND "trangThai" <> 'dang'`, [KY, PHONG]);
	const dau = await trpc(API, the.tl).lam("okr.soanMo", DON_VI);
	if (dau.ok) return dau.cuoc;
	if (!dau.cuocDang) await khongDo(`okr.soanMo tu choi: ${dau.lyDo}`);
	await sql(`UPDATE "okrCuocSoan" SET "soLuot" = 0 WHERE "cycleId" = $1 AND "departmentId" = $2 AND id <> $3`, [KY, PHONG, dau.cuocDang.id]);
	const kq = await trpc(API, the.tl).lam("okr.soanMo", { ...DON_VI, boCuocDangId: dau.cuocDang.id });
	if (!kq.ok) await khongDo(`okr.soanMo (bo cuoc cu) tu choi: ${kq.lyDo}`);
	return kq.cuoc;
}

export async function docCuoc(id) {
	const [c] = await sql(`SELECT "soLuot", "lanNopMoiNhat", "trangThai", "sessionId" FROM "okrCuocSoan" WHERE id = $1`, [id]);
	const [{ nop }] = await sql(`SELECT count(DISTINCT "inputHash")::int AS nop FROM "okrDeXuat" WHERE "cuocSoanId" = $1`, [id]);
	return { soLuot: c?.soLuot ?? null, nop, lanNop: c?.lanNopMoiNhat ?? null, trangThai: c?.trangThai ?? null, phien: c?.sessionId ?? null };
}

export async function datLuot(cuocId, soLuot) {
	await sql(`UPDATE "okrCuocSoan" SET "soLuot" = $2 WHERE id = $1`, [cuocId, soLuot]);
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
	const hop = [];
	p.on("console", (msg) => {
		if (msg.type() === "error" && !TIENG_ON_DEV.test(msg.text())) loi.push(msg.text());
	});
	p.on("pageerror", (e) => loi.push(e.message));
	p.on("dialog", (d) => {
		hop.push(d.type());
		ghi(`   (hop trinh duyet ${d.type()} — nhan)`);
		void d.accept();
	});
	return { ctx, p, rong: kho.rong, cao: kho.cao, nen, loi, hop, dong: () => ctx.close() };
}

export const duongDonVi = () =>
	`${APP}/${the.slug}/okr/theo-don-vi?kyOkr=${encodeURIComponent(KY)}&donOkr=${encodeURIComponent(`pb:${PHONG}`)}`;
export const duongKhung = (id, them = "") => `${duongDonVi()}&record=${encodeURIComponent(`soan:${id}`)}${them}`;

export async function choThay(p, ham, moTa, ms = MAN.cho.manMs, ...thamSo) {
	try {
		await p.waitForFunction(ham, { timeout: ms, polling: MAN.cho.nhipMs }, ...thamSo);
		return true;
	} catch {
		ghi(`-- het gio cho: ${moTa}`);
		return false;
	}
}

export async function dungYen(p, chon = KHUNG, ms = 10 * GIAY_MS) {
	const han = Date.now() + ms;
	let truoc = null;
	while (Date.now() < han) {
		const r = await p.evaluate((chon) => {
			const o = [...document.querySelectorAll(chon)].find((x) => x.checkVisibility());
			if (!o) return null;
			const k = o.getBoundingClientRect();
			return `${k.left.toFixed(1)},${k.top.toFixed(1)},${k.width.toFixed(1)},${k.height.toFixed(1)}`;
		}, chon);
		if (r !== null && r === truoc) return true;
		truoc = r;
		await tre(MAN.cho.dungYenMs);
	}
	return false;
}

export async function moTrang(t, id, them = "") {
	await t.p.goto(duongKhung(id, them), { waitUntil: "load" });
	const thay = await choThay(
		t.p,
		(khung) =>
			[...document.querySelectorAll(`:is(${khung}) [data-trang-soan]`)].some(
				(o) => o.checkVisibility() && o.getAttribute("data-trang-soan") !== "dang-mo",
			),
		"khung soan mo",
		MAN.cho.manMs,
		KHUNG,
	);
	await dungYen(t.p);
	return thay;
}

export const CHON = {
	oSoan: "[data-o-soan] textarea",
	gui: '[data-slot="kara-composer"] button[aria-label="Gửi"]',
	dangLam: '[data-kara-turn="kara"] [data-kara-state="working"]',
	dong: "[data-dong]",
	hoiThoai: '[data-o="hoi-thoai"]',
	banNhap: '[data-o="ban-nhap"]',
	thanh: '[data-slot="resizable-handle"]',
	hopHoi: '[role="alertdialog"]',
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

export const vao = () => docVao(the.ra);

export async function guiTin(t, chu, { choXong = true, choToi = true } = {}) {
	const truoc = vao().length;
	const o = await t.p.waitForFunction(
		(chon) => [...document.querySelectorAll(chon)].find((x) => x.checkVisibility() && !x.disabled) ?? null,
		{ timeout: MAN.cho.manMs, polling: MAN.cho.nhipMs },
		CHON.oSoan,
	);
	await o.asElement().click();
	await t.p.keyboard.type(chu);
	await t.p.keyboard.press("Enter");
	if (!choToi) return true;
	if (!(await choMoHinh(truoc))) return false;
	return choXong ? choYen(t.p) : true;
}

export async function mo(t, id) {
	const truoc = vao().length;
	const { soLuot } = await docCuoc(id);
	if (!(await moTrang(t, id))) return false;
	if (soLuot === 0 && !(await choMoHinh(truoc))) return false;
	return choYen(t.p);
}

export async function nop1(t, lenh = "nop1") {
	const { LENH, DEM } = await import("./kich-ban.mjs");
	if (!(await guiTin(t, LENH[lenh]))) return false;
	return choThay(t.p, (chon, n) => document.querySelectorAll(chon).length === n, "dong nhap", MAN.cho.luotMs, CHON.dong, DEM.nop1.mucTieu + DEM.nop1.kr);
}

export function giuMoHinh(bat) {
	const tep = join(the.ra, TEP.giu);
	if (bat) writeFileSync(tep, "giu");
	else if (existsSync(tep)) rmSync(tep);
}

export async function anh(t, ten, doDo) {
	const thuMuc = doDo ? the.ra : BANG.evidence;
	mkdirSync(thuMuc, { recursive: true });
	const tep = join(thuMuc, `${ten}.png`);
	await t.p.screenshot({ path: tep });
	ghi(`   ANH ${relative(GOC, tep)}`);
}

export async function chungTrang(p, nhan = "") {
	const c = await p.evaluate((khung) => {
		const k = [...document.querySelectorAll(khung)].find((x) => x.checkVisibility());
		return {
			url: location.pathname + location.search,
			khung: k ? `${k.getAttribute("data-slot")}[${k.getAttribute("data-size") ?? ""}]` : "khong",
			dau: k?.querySelector('[data-slot="sheet-title"],[data-slot="drawer-title"]')?.innerText?.trim() ?? "",
		};
	}, KHUNG);
	ghi(`   chung trang${nhan ? ` ${nhan}` : ""}: ${c.url} · khung ${c.khung} · tieu de «${c.dau}»`);
	return c;
}

export async function dongBangNut(p) {
	return p.evaluate((khung) => {
		const k = [...document.querySelectorAll(khung)].find((x) => x.checkVisibility());
		const nut = k?.querySelector('[data-slot="sheet-close"],[data-slot="drawer-close"]');
		nut?.click();
		return !!nut;
	}, KHUNG);
}

export async function bamNutChu(p, chon, chu) {
	return p.evaluate(
		(chon, chu) => {
			const b = [...document.querySelectorAll(chon)].find((x) => x.checkVisibility() && x.innerText?.trim() === chu);
			b?.click();
			return !!b;
		},
		chon,
		chu,
	);
}

export async function bamTab(p, i) {
	await p.evaluate((i) => {
		const tab = [...document.querySelectorAll('[data-khung="hep"] [role="tab"]')].filter((x) => x.checkVisibility())[i];
		tab?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
	}, i);
	await tre(MAN.cho.yenMs);
}

export async function tranVaCuon(p) {
	return p.evaluate(() => {
		const g = document.scrollingElement ?? document.documentElement;
		return { sw: document.documentElement.scrollWidth, iw: innerWidth, sy: window.scrollY, sh: g.scrollHeight, ch: g.clientHeight };
	});
}

export async function hopKhung(p) {
	return p.evaluate(
		(khung, hoi, nhap) => {
			const k = [...document.querySelectorAll(khung)].find((x) => x.checkVisibility());
			const r = (o) => {
				if (!o || !o.checkVisibility()) return null;
				const b = o.getBoundingClientRect();
				return { trai: b.left, phai: b.right, tren: b.top, duoi: b.bottom, rong: b.width, cao: b.height };
			};
			const css = getComputedStyle(document.documentElement);
			return {
				slot: k?.getAttribute("data-slot") ?? null,
				size: k?.getAttribute("data-size") ?? null,
				phuToanMan: k?.hasAttribute("data-phu-toan-man") ?? false,
				khung: r(k),
				hoi: r(k?.querySelector(hoi)),
				nhap: r(k?.querySelector(nhap)),
				tab: k ? [...k.querySelectorAll('[role="tablist"] [role="tab"]')].map((x) => x.innerText.trim()) : [],
				R: Number.parseFloat(css.getPropertyValue("--container-assist-rail")),
				A: Number.parseFloat(css.getPropertyValue("--container-assist")),
				rem: Number.parseFloat(css.fontSize),
				iw: innerWidth,
				ih: innerHeight,
			};
		},
		KHUNG,
		CHON.hoiThoai,
		CHON.banNhap,
	);
}
