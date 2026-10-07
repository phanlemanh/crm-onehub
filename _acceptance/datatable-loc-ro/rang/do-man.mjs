import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { dealMessages } from "../../../apps/app/lib/messages/deals.ts";
import { db } from "../../../packages/db/src/index.ts";
import { messages } from "../../../packages/ui/src/lib/messages.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "datatable-loc-ro", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const NGUOI = process.env.NGUOI ?? "ada@trycomp.ai";
const KHO = { 1440: { rong: 1440, cao: 900 }, 375: { rong: 375, cao: 812 } };
const CHO_MS = 90_000;
const MA_TRAN = [
	"menu-giai-doan-1440",
	"rong-vi-loc-1440",
	"sau-bo-loc-1440",
	"truong-tuy-chinh-1440",
	"rong-vi-loc-375",
	"sau-bo-loc-375",
	"dem",
];

const ui = messages("vi").table;
const d = dealMessages("vi");
const GIAI_DOAN_RONG = "Giai đoạn đo E7";
const TRUONG = "Nguồn đo E7";
const LUA_CHON = ["Hội chợ đo E7", "Chưa dùng đo E7"];

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
const daTao = { stageId: null, fieldId: null };

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

function khoDoRieng() {
	const url = process.env.DATABASE_URL ?? "";
	const ten = url.split("?")[0].split("/").pop() ?? "";
	if (!/^crm_[a-z0-9_]+_do$/.test(ten))
		khongDo(
			`DATABASE_URL tro toi «${ten}», khong phai kho do rieng crm_<cay>_do — khong ghi du lieu`,
		);
	return ten;
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

async function dungDuLieu() {
	const soThoaThuan = await db.deal.count({ where: { archivedAt: null } });
	if (soThoaThuan === 0)
		khongDo("kho do khong co thoa thuan nao — can it nhat 1 de do sau-bo-loc");
	const caNhan = await db.contact.findFirst({ where: { archivedAt: null } });
	if (!caNhan) khongDo("kho do khong co ca nhan nao");
	const cuoi = await db.dealStage.aggregate({ _max: { position: true } });
	const stage = await db.dealStage.create({
		data: {
			label: GIAI_DOAN_RONG,
			kind: "OPEN",
			position: (cuoi._max.position ?? 0) + 1,
		},
	});
	daTao.stageId = stage.id;
	const cuoiTruong = await db.fieldDefinition.aggregate({
		where: { entity: "CONTACT" },
		_max: { position: true },
	});
	const truong = await db.fieldDefinition.create({
		data: {
			entity: "CONTACT",
			key: `do_e7_${Date.now()}`,
			label: TRUONG,
			type: "SELECT",
			showOnFilter: true,
			position: (cuoiTruong._max.position ?? 0) + 1,
			options: {
				create: LUA_CHON.map((label, position) => ({ label, position })),
			},
		},
		include: { options: true },
	});
	daTao.fieldId = truong.id;
	const dung = truong.options.find((o) => o.label === LUA_CHON[0]);
	await db.fieldValue.create({
		data: { fieldId: truong.id, contactId: caNhan.id, optionId: dung.id },
	});
}

async function don() {
	if (daTao.fieldId)
		await db.fieldDefinition
			.delete({ where: { id: daTao.fieldId } })
			.catch(() => {});
	if (daTao.stageId)
		await db.dealStage.delete({ where: { id: daTao.stageId } }).catch(() => {});
}

async function trang(kho, cookie) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: "lang", value: "vi", domain: host, path: "/" },
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({
		width: KHO[kho].rong,
		height: KHO[kho].cao,
		deviceScaleFactor: 1,
	});
	return { ctx, p };
}

async function bamChu(p, boChon, chu) {
	const toaDo = await p.evaluate(
		(sel, t) => {
			const el = [...document.querySelectorAll(sel)].find(
				(x) =>
					x.getClientRects().length > 0 && (x.textContent ?? "").includes(t),
			);
			if (!el) return null;
			el.scrollIntoView({ block: "nearest" });
			const r = el.getBoundingClientRect();
			return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
		},
		boChon,
		chu,
	);
	if (!toaDo) return false;
	await p.mouse.click(toaDo.x, toaDo.y);
	return true;
}

async function moMenuCon(p, nhan) {
	const thu = await p.evaluate((t) => {
		const b = [
			...document.querySelectorAll("button[aria-expanded][aria-controls]"),
		].find(
			(x) => x.getClientRects().length > 0 && (x.textContent ?? "").includes(t),
		);
		return b ? b.getAttribute("aria-expanded") : null;
	}, ui.filters);
	if (thu === "false")
		await bamChu(p, "button[aria-expanded][aria-controls]", ui.filters);
	if (!(await bamChu(p, 'button[aria-haspopup="menu"]', ui.filters)))
		khongDo(`khong thay nut «${ui.filters}»`);
	await p
		.waitForSelector('[data-slot="dropdown-menu-sub-trigger"]', {
			timeout: CHO_MS,
		})
		.catch(() => khongDo(`menu «${ui.filters}» khong mo`));
	if (!(await bamChu(p, '[data-slot="dropdown-menu-sub-trigger"]', nhan)))
		khongDo(`khong thay tieu chi «${nhan}»`);
	await p
		.waitForSelector('[data-slot="dropdown-menu-sub-content"]', {
			timeout: CHO_MS,
		})
		.catch(() => khongDo(`tieu chi «${nhan}» khong mo`));
	await new Promise((r) => setTimeout(r, 400));
}

function soCuaMuc(nhan) {
	const muc = [
		...document.querySelectorAll(
			'[data-slot="dropdown-menu-sub-content"] [role="menuitemcheckbox"]',
		),
	].find((x) => (x.textContent ?? "").includes(nhan));
	if (!muc) return "VANG";
	return (
		muc.querySelector('[data-slot="facet-count"]')?.textContent ?? "KHONG SO"
	);
}

function viTriMenuCon(nhan) {
	const muc = [
		...document.querySelectorAll(
			'[data-slot="dropdown-menu-sub-content"] [role="menuitemcheckbox"]',
		),
	].find((x) => (x.textContent ?? "").includes(nhan));
	const r = muc?.getBoundingClientRect();
	const hop = document
		.querySelector('[data-slot="dropdown-menu-sub-content"]')
		?.getBoundingClientRect();
	return {
		trongKhung: Boolean(
			r &&
				r.width > 0 &&
				r.left >= 0 &&
				r.right <= innerWidth &&
				r.top >= 0 &&
				r.bottom <= innerHeight,
		),
		khung: r
			? `muc ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}; hop ${Math.round(hop.left)},${Math.round(hop.top)} ${Math.round(hop.width)}x${Math.round(hop.height)} trong ${innerWidth}x${innerHeight}`
			: "khong co muc",
	};
}

function docRong(tieuDe, chuNut) {
	const rong = document.querySelector('[data-slot="empty"]');
	const nut = [...document.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === chuNut,
	);
	const r = nut?.getBoundingClientRect();
	return {
		tieuDe: (rong?.textContent ?? "").includes(tieuDe),
		nutTrongKhung: Boolean(
			r &&
				r.top >= 0 &&
				r.left >= 0 &&
				r.bottom <= innerHeight &&
				r.right <= innerWidth &&
				r.width > 0,
		),
		tran:
			document.documentElement.scrollWidth -
			document.documentElement.clientWidth,
	};
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

async function doThoaThuan(kho, cookie, slug) {
	const { ctx, p } = await trang(kho, cookie);
	try {
		if (kho === 375) {
			await p.goto(`${APP}/${slug}/deals?stage=${daTao.stageId}`, {
				waitUntil: "networkidle0",
				timeout: CHO_MS,
			});
			await choBang(p);
		} else {
			await p.goto(`${APP}/${slug}/deals`, {
				waitUntil: "networkidle0",
				timeout: CHO_MS,
			});
			await choBang(p);
			await moMenuCon(p, d.facets.stage);
			await p.evaluate(() => document.fonts.ready);
			const so = await p.evaluate(soCuaMuc, GIAI_DOAN_RONG);
			const viTri = await p.evaluate(viTriMenuCon, GIAI_DOAN_RONG);
			await p.screenshot({ path: join(RA, `menu-giai-doan-${kho}.png`) });
			kiem(
				`menu-giai-doan-${kho}`,
				`${kho}: menu-giai-doan — «${GIAI_DOAN_RONG}» mang so ${so} (mong 0), lua chon trong khung nhin ${viTri.trongKhung} (${viTri.khung})`,
				so === "0" && viTri.trongKhung,
			);
			await bamChu(
				p,
				'[data-slot="dropdown-menu-sub-content"] [role="menuitemcheckbox"]',
				GIAI_DOAN_RONG,
			);
			await p.keyboard.press("Escape");
			await p.keyboard.press("Escape");
		}
		await p
			.waitForFunction(
				(t) =>
					(
						document.querySelector('[data-slot="empty"]')?.textContent ?? ""
					).includes(t),
				{ timeout: CHO_MS },
				ui.noMatch,
			)
			.catch(() => null);
		const rong = await p.evaluate(docRong, ui.noMatch, ui.resetFilters);
		await p.screenshot({ path: join(RA, `rong-vi-loc-${kho}.png`) });
		kiem(
			`rong-vi-loc-${kho}`,
			`${kho}: rong-vi-loc — «${ui.noMatch}» ${rong.tieuDe}, nut «${ui.resetFilters}» trong khung nhin ${rong.nutTrongKhung}, tran ngang ${rong.tran}px`,
			rong.tieuDe && rong.nutTrongKhung && rong.tran === 0,
		);
		const truoc = await p.evaluate(() => location.search);
		const daLoc = new URLSearchParams(truoc).has("stage");
		await bamChu(p, "button", ui.resetFilters);
		const coDong = await p
			.waitForFunction(
				() =>
					document.querySelector('[data-slot="table"] tbody tr td') !== null &&
					!document.querySelector('[data-slot="empty"]'),
				{ timeout: CHO_MS },
			)
			.then(() => true)
			.catch(() => false);
		const tim = await p.evaluate(() => location.search);
		const conLoc = ["stage", "fields", "q"].filter((k) =>
			new URLSearchParams(tim).has(k),
		);
		await p.screenshot({ path: join(RA, `sau-bo-loc-${kho}.png`) });
		kiem(
			`sau-bo-loc-${kho}`,
			`${kho}: sau-bo-loc — truoc khi bam da loc theo giai doan ${daLoc} («${truoc}»), bang co dong ${coDong}, dia chi «${tim}» con tham so loc [${conLoc.join(", ")}]`,
			daLoc && coDong && conLoc.length === 0,
		);
	} finally {
		await ctx.close();
	}
}

async function doTruong(kho, cookie, slug) {
	const { ctx, p } = await trang(kho, cookie);
	try {
		await p.goto(`${APP}/${slug}/contacts`, {
			waitUntil: "networkidle0",
			timeout: CHO_MS,
		});
		await choBang(p);
		await moMenuCon(p, TRUONG);
		const so = await p.evaluate(soCuaMuc, LUA_CHON[1]);
		const soDung = await p.evaluate(soCuaMuc, LUA_CHON[0]);
		await p.screenshot({ path: join(RA, `truong-tuy-chinh-${kho}.png`) });
		kiem(
			`truong-tuy-chinh-${kho}`,
			`${kho}: truong-tuy-chinh — «${LUA_CHON[1]}» mang so ${so} (mong 0), «${LUA_CHON[0]}» mang so ${soDung} (mong 1)`,
			so === "0" && soDung === "1",
		);
	} finally {
		await ctx.close();
	}
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	khoDoRieng();
	mkdirSync(RA, { recursive: true });
	await dungDuLieu();
	const cookie = phien();
	const slug = await suySlug(cookie);
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	await doThoaThuan(1440, cookie, slug);
	await doTruong(1440, cookie, slug);
	await doThoaThuan(375, cookie, slug);
	const soO = MA_TRAN.filter((m) => m !== "dem" && daPhat.has(m)).length;
	kiem("dem", `${soO}/6 o`, soO === 6);
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
	await don().catch(() => {});
	await trinhDuyet?.close().catch(() => {});
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
