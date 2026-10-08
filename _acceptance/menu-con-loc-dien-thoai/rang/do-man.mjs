import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { contactMessages } from "../../../apps/app/lib/messages/contacts.ts";
import { crmMessages } from "../../../apps/app/lib/messages/crm.ts";
import { dealMessages } from "../../../apps/app/lib/messages/deals.ts";
import { db } from "../../../packages/db/src/index.ts";
import { messages } from "../../../packages/ui/src/lib/messages.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "menu-con-loc-dien-thoai", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const NGUOI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const LE = 8;
const DUNG_SAI = 1;
const MA_TRAN = [
	"giai-doan-375",
	"cham-375",
	"cong-ty-375",
	"doi-chung-1440",
	"hang-loat-768",
	"dem",
];

const ui = messages("vi").table;
const d = dealMessages("vi");
const c = contactMessages("vi");
const crm = crmMessages("vi");
const HOP = '[data-slot="dropdown-menu-sub-content"]';
const TRIG = '[data-slot="dropdown-menu-sub-trigger"]';

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;

function kiem(ma, nhan, dat) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ${ma} khong co trong MA_TRAN`);
	daPhat.add(ma);
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhan}`);
	if (!dat) sai += 1;
}

class KhongDo extends Error {}
function khongDo(cau) {
	throw new KhongDo(cau);
}

function phien() {
	const ra = execFileSync("bun", ["run", "dev:session", NGUOI], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) khongDo(`khong doc duoc cookie phien cua ${NGUOI}`);
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

async function trang(kho, cookie, cham) {
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
		hasTouch: cham,
		isMobile: cham,
	});
	await p.evaluateOnNewDocument(() => {
		window.__loaiTro = [];
		document.addEventListener(
			"pointerdown",
			(e) => window.__loaiTro.push(e.pointerType),
			true,
		);
	});
	return { ctx, p };
}

async function toaDo(p, boChon, chu) {
	return p.evaluate(
		(sel, t) => {
			const el = [...document.querySelectorAll(sel)].find(
				(x) =>
					x.getClientRects().length > 0 &&
					(t === null || (x.textContent ?? "").includes(t)),
			);
			if (!el) return null;
			el.scrollIntoView({ block: "nearest" });
			const r = el.getBoundingClientRect();
			return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
		},
		boChon,
		chu,
	);
}

async function bam(p, cham, boChon, chu) {
	const td = await toaDo(p, boChon, chu);
	if (!td) return false;
	if (cham) await p.touchscreen.tap(td.x, td.y);
	else await p.mouse.click(td.x, td.y);
	return true;
}

async function choBang(p) {
	await p
		.waitForFunction(
			() =>
				document.querySelector('[data-slot="table"] tbody tr td') !== null ||
				document.querySelector('[data-slot="empty"]') !== null,
			{ timeout: CHO_MS },
		)
		.catch(() => khongDo("bang khong hien dong hay o rong"));
}

async function moTieuChi(p, cham, nhan) {
	const mo = await p.evaluate((t) => {
		const b = [
			...document.querySelectorAll("button[aria-expanded][aria-controls]"),
		].find(
			(x) => x.getClientRects().length > 0 && (x.textContent ?? "").includes(t),
		);
		return b ? b.getAttribute("aria-expanded") : null;
	}, ui.filters);
	if (mo === "false")
		await bam(p, cham, "button[aria-expanded][aria-controls]", ui.filters);
	if (!(await bam(p, cham, 'button[aria-haspopup="menu"]', ui.filters)))
		khongDo(`khong thay nut «${ui.filters}»`);
	await p
		.waitForSelector(TRIG, { timeout: CHO_MS })
		.catch(() => khongDo(`menu «${ui.filters}» khong mo`));
	if (!(await bam(p, cham, TRIG, nhan)))
		khongDo(`khong thay tieu chi «${nhan}»`);
	await p
		.waitForSelector(HOP, { timeout: CHO_MS })
		.catch(() => khongDo(`tieu chi «${nhan}» khong mo`));
	await new Promise((r) => setTimeout(r, 400));
}

function hopVaTrig(nhanTrig) {
	const hop = document.querySelector('[data-slot="dropdown-menu-sub-content"]');
	const trig = [
		...document.querySelectorAll('[data-slot="dropdown-menu-sub-trigger"]'),
	].find((x) => (x.textContent ?? "").includes(nhanTrig));
	const o = hop?.querySelector("input");
	const r = (el) => {
		if (!el) return null;
		const b = el.getBoundingClientRect();
		return {
			left: Math.round(b.left * 10) / 10,
			right: Math.round(b.right * 10) / 10,
			width: Math.round(b.width * 10) / 10,
		};
	};
	return {
		hop: r(hop),
		trig: r(trig),
		oTim: r(o),
		w: innerWidth,
		tran:
			document.documentElement.scrollWidth -
			document.documentElement.clientWidth,
		loaiTro: [...new Set(window.__loaiTro ?? [])].join(","),
	};
}

const trong = (h, w) =>
	Boolean(
		h && h.width > 0 && h.left >= LE - DUNG_SAI && h.right <= w - LE + DUNG_SAI,
	);

async function doThoaThuan375(cookie, slug) {
	const { ctx, p } = await trang(375, cookie, true);
	try {
		await p.goto(`${APP}/${slug}/deals`, {
			waitUntil: "networkidle0",
			timeout: CHO_MS,
		});
		await choBang(p);
		await moTieuChi(p, true, d.facets.stage);
		const s = await p.evaluate(hopVaTrig, d.facets.stage);
		await p.screenshot({ path: join(RA, "giai-doan-375.png") });
		kiem(
			"giai-doan-375",
			`375: giai-doan — hop left ${s.hop?.left} right ${s.hop?.right} rong ${s.hop?.width} trong khung ${s.w} (mong [${LE - DUNG_SAI}, ${s.w - LE + DUNG_SAI}]), tran ngang ${s.tran}px, con tro ${s.loaiTro}`,
			trong(s.hop, s.w) && s.tran === 0,
		);
		const chon = await p.evaluate(() => {
			const muc = [
				...document.querySelectorAll(
					'[data-slot="dropdown-menu-sub-content"] [role="menuitemcheckbox"]',
				),
			][0];
			const nhan =
				muc?.querySelector("span.flex-1")?.textContent?.trim() || null;
			return nhan;
		});
		if (!chon) khongDo("menu con Giai doan khong co lua chon nao");
		await bam(p, true, `${HOP} [role="menuitemcheckbox"]`, chon);
		await p
			.waitForFunction(
				() => new URLSearchParams(location.search).has("stage"),
				{
					timeout: CHO_MS,
				},
			)
			.catch(() => null);
		const tim = await p.evaluate(() => location.search);
		const id = new URLSearchParams(tim).get("stage");
		const giaiDoan = await db.dealStage.findFirst({ where: { label: chon } });
		await p.screenshot({ path: join(RA, "cham-375.png") });
		const loai = await p.evaluate(() =>
			[...new Set(window.__loaiTro)].join(","),
		);
		kiem(
			"cham-375",
			`375: cham — tap «${chon}» (con tro ${loai}) → stage=${id} (mong ${giaiDoan?.id ?? "?"})`,
			Boolean(id) && id === giaiDoan?.id && loai === "touch",
		);
	} finally {
		await ctx.close();
	}
}

async function doCongTy375(cookie, slug) {
	const { ctx, p } = await trang(375, cookie, true);
	try {
		await p.goto(`${APP}/${slug}/contacts`, {
			waitUntil: "networkidle0",
			timeout: CHO_MS,
		});
		await choBang(p);
		await moTieuChi(p, true, c.facets.company);
		const mau = await p.evaluate((boQua) => {
			const nhan = [
				...document.querySelectorAll(
					'[data-slot="dropdown-menu-sub-content"] [data-slot="command-item"] span.flex-1',
				),
			]
				.map((x) => x.textContent?.trim() ?? "")
				.find((t) => t.length >= 3 && t !== boQua);
			return nhan ? nhan.slice(0, 3) : null;
		}, c.noCompany);
		if (!mau) khongDo("menu con Cong ty khong co cong ty nao truoc khi go");
		await bam(p, true, `${HOP} input`, null);
		await p.keyboard.type(mau);
		await new Promise((r) => setTimeout(r, 800));
		const s = await p.evaluate(hopVaTrig, c.facets.company);
		const giaTri = await p.evaluate(
			() =>
				document.querySelector('[data-slot="dropdown-menu-sub-content"] input')
					?.value ?? null,
		);
		const soMuc = await p.evaluate(
			(w) =>
				[
					...document.querySelectorAll(
						'[data-slot="dropdown-menu-sub-content"] [data-slot="command-item"]',
					),
				].filter((x) => {
					const b = x.getBoundingClientRect();
					return b.width > 0 && b.left >= 0 && b.right <= w;
				}).length,
			375,
		);
		await p.screenshot({ path: join(RA, "cong-ty-375.png") });
		kiem(
			"cong-ty-375",
			`375: cong-ty — hop left ${s.hop?.left} right ${s.hop?.right}, o tim left ${s.oTim?.left} right ${s.oTim?.right}, go «${mau}» → gia tri «${giaTri}», ${soMuc} muc cong ty trong khung, con tro ${s.loaiTro}`,
			trong(s.hop, s.w) && trong(s.oTim, s.w) && giaTri === mau && soMuc >= 1,
		);
	} finally {
		await ctx.close();
	}
}

async function doDoiChung1440(cookie, slug) {
	const { ctx, p } = await trang(1440, cookie, false);
	try {
		await p.goto(`${APP}/${slug}/deals`, {
			waitUntil: "networkidle0",
			timeout: CHO_MS,
		});
		await choBang(p);
		await moTieuChi(p, false, d.facets.stage);
		const s = await p.evaluate(hopVaTrig, d.facets.stage);
		await p.screenshot({ path: join(RA, "doi-chung-1440.png") });
		const goc = await p.evaluate(() => {
			const hop = document.querySelector(
				'[data-slot="dropdown-menu-sub-content"]',
			);
			if (!hop) return null;
			const ben = hop.getAttribute("data-side");
			hop.style.translate = "none";
			const b = hop.getBoundingClientRect();
			return { left: Math.round(b.left * 10) / 10, ben };
		});
		const lech = s.hop && goc ? Math.abs(s.hop.left - goc.left) : null;
		kiem(
			"doi-chung-1440",
			`1440: doi-chung — Radix dat menu con phia ${goc?.ben}; hop left ${s.hop?.left}, khi tat lop dich left ${goc?.left}, lech ${lech}px (mong 0, khong dich khi du cho), hop trong khung ${trong(s.hop, s.w)}`,
			lech !== null && lech <= DUNG_SAI && trong(s.hop, s.w),
		);
	} finally {
		await ctx.close();
	}
}

async function doHangLoat768(cookie, slug) {
	const { ctx, p } = await trang(768, cookie, false);
	try {
		await p.goto(`${APP}/${slug}/deals`, {
			waitUntil: "networkidle0",
			timeout: CHO_MS,
		});
		await choBang(p);
		const chon = await bam(
			p,
			false,
			'[data-slot="table"] tbody button[role="checkbox"]',
			null,
		);
		if (!chon) khongDo("khong thay o chon dong o kho 768");
		if (
			!(await bam(
				p,
				false,
				'button[aria-haspopup="menu"]',
				crm.bulkMenu.actions,
			))
		)
			khongDo(`khong thay nut «${crm.bulkMenu.actions}»`);
		await p
			.waitForSelector(TRIG, { timeout: CHO_MS })
			.catch(() => khongDo("menu hang loat khong mo"));
		if (!(await bam(p, false, TRIG, crm.bulkMenu.assignOwner)))
			khongDo(`khong thay muc «${crm.bulkMenu.assignOwner}»`);
		await p
			.waitForSelector(HOP, { timeout: CHO_MS })
			.catch(() => khongDo("menu con hang loat khong mo"));
		await new Promise((r) => setTimeout(r, 400));
		const moi = await p.evaluate(hopVaTrig, crm.bulkMenu.assignOwner);
		await p.screenshot({ path: join(RA, "hang-loat-768.png") });
		const goc = await p.evaluate(() => {
			const hop = document.querySelector(
				'[data-slot="dropdown-menu-sub-content"]',
			);
			if (!hop) return null;
			hop.style.translate = "none";
			const b = hop.getBoundingClientRect();
			return { left: Math.round(b.left), right: Math.round(b.right) };
		});
		const gocTran = Boolean(goc && (goc.left < 0 || goc.right > 768));
		kiem(
			"hang-loat-768",
			`768: hang-loat — ban moi left ${moi.hop?.left} right ${moi.hop?.right}; ban goc (tat lop dich) left ${goc?.left} right ${goc?.right} — ${gocTran ? "ban goc tran, ban moi khong" : "khong hoi quy"}`,
			Boolean(moi.hop && moi.hop.left >= 0 && moi.hop.right <= 768),
		);
	} finally {
		await ctx.close();
	}
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	const cookie = phien();
	const slug = await suySlug(cookie);
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	await doThoaThuan375(cookie, slug);
	await doCongTy375(cookie, slug);
	await doDoiChung1440(cookie, slug);
	await doHangLoat768(cookie, slug);
	const soO = MA_TRAN.filter((m) => m !== "dem" && daPhat.has(m)).length;
	kiem("dem", `${soO}/5 o`, soO === 5);
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
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
