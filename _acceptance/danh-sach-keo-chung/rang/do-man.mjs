import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { settingsMessages } from "../../../apps/app/lib/messages/settings.ts";
import { db } from "../../../packages/db/src/index.ts";
import { messages } from "../../../packages/ui/src/lib/messages.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "danh-sach-keo-chung", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const NGUOI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const NHIP_PHIM_MS = 200;
const TEN_DO = `Đo E3 ${Date.now().toString(36)}`;
const MA_TRAN = [
	"sap-giai-doan-1440",
	"hoan-tac-giai-doan-1440",
	"sap-to-chuc-1440",
	"hoan-tac-to-chuc-1440",
	"luu-tru-khoi-phuc-1440",
	"hoan-tac-luu-tru-1440",
	"da-luu-tru-375",
	"dem",
];

const s = messages("vi").sortableList;
const g = settingsMessages("vi").giaiDoan;
const THE_MO = '[data-the-giai-doan="OPEN"] [data-hang-giai-doan]';
const MUC_TO_CHUC = "[data-muc-keo]";

const dong = [];
const daPhat = new Set();
const daTao = { giaiDoan: [], boPhan: [] };
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

async function trang(kho, cookie) {
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

async function mo(p, url, boChon) {
	await p.goto(url, { waitUntil: "networkidle0", timeout: CHO_MS });
	await p
		.waitForSelector(boChon, { timeout: CHO_MS })
		.catch(() => khongDo(`${url}: khong thay ${boChon}`));
}

async function thuTu(p, boChon, thuocTinh) {
	return p.$$eval(
		boChon,
		(els, tt) => els.map((e) => e.getAttribute(tt) ?? ""),
		thuocTinh,
	);
}

async function nghi(ms) {
	await new Promise((r) => setTimeout(r, ms));
}

async function keoLen(p, ten) {
	const thay = await p.evaluate((nhan) => {
		const nut = [...document.querySelectorAll("button")].find(
			(b) => b.querySelector(".sr-only")?.textContent === nhan,
		);
		if (!nut) return false;
		nut.scrollIntoView({ block: "center" });
		nut.focus();
		return document.activeElement === nut;
	}, s.reorder(ten));
	if (!thay) khongDo(`khong focus duoc tay keo «${ten}»`);
	await p.keyboard.press("Space");
	await nghi(NHIP_PHIM_MS);
	await p.keyboard.press("ArrowUp");
	await nghi(NHIP_PHIM_MS);
	await p.keyboard.press("Space");
}

async function choToast(p, chu) {
	await p
		.waitForFunction(
			(t) =>
				[...document.querySelectorAll("[data-sonner-toast]")].some((x) =>
					(x.textContent ?? "").includes(t),
				),
			{ timeout: CHO_MS },
			chu,
		)
		.catch(() => khongDo(`khong thay toast «${chu}»`));
}

async function coNutTrongToast(p, chu, nut) {
	return p.evaluate(
		(t, n) =>
			[...document.querySelectorAll("[data-sonner-toast]")]
				.filter((x) => (x.textContent ?? "").includes(t))
				.some((x) =>
					[...x.querySelectorAll("button")].some(
						(b) => (b.textContent ?? "").trim() === n,
					),
				),
		chu,
		nut,
	);
}

async function bamNutToast(p, chu, nut) {
	const ok = await p.evaluate(
		(t, n) => {
			const toast = [...document.querySelectorAll("[data-sonner-toast]")].find(
				(x) => (x.textContent ?? "").includes(t),
			);
			const b = [...(toast?.querySelectorAll("button") ?? [])].find(
				(x) => (x.textContent ?? "").trim() === n,
			);
			b?.click();
			return Boolean(b);
		},
		chu,
		nut,
	);
	if (!ok) khongDo(`toast «${chu}» khong co nut «${nut}»`);
}

async function choTayMo(p) {
	await p
		.waitForFunction(
			(dau) =>
				[...document.querySelectorAll("button")]
					.filter((b) =>
						b.querySelector(".sr-only")?.textContent?.startsWith(dau),
					)
					.every((b) => !b.disabled),
			{ timeout: CHO_MS },
			s.reorder(""),
		)
		.catch(() => khongDo("tay keo khong mo lai sau khi luu"));
}

async function giaiDoanMo() {
	return db.dealStage.findMany({
		where: { kind: "OPEN", archivedAt: null },
		orderBy: { position: "asc" },
		select: { id: true, label: true, position: true },
	});
}

async function doGiaiDoan(cookie, slug) {
	const { ctx, p } = await trang(1440, cookie);
	const url = `${APP}/${slug}/settings/giai-doan`;
	try {
		await mo(p, url, THE_MO);
		const ds = await giaiDoanMo();
		const ten = new Map(ds.map((x) => [x.id, x.label]));
		const truoc = await thuTu(p, THE_MO, "data-hang-giai-doan");
		const thu2 = ten.get(truoc[1] ?? "");
		if (!thu2) khongDo("nhom Dang mo co it hon hai giai doan");
		await keoLen(p, thu2);
		await choToast(p, s.saved);
		const coNut = await coNutTrongToast(p, s.saved, s.undo);
		await choTayMo(p);
		await p.screenshot({ path: join(RA, "sap-giai-doan-1440.png") });
		await mo(p, url, THE_MO);
		const sau = await thuTu(p, THE_MO, "data-hang-giai-doan");
		const mongDoi = [truoc[1], truoc[0], ...truoc.slice(2)];
		kiem(
			"sap-giai-doan-1440",
			`1440: sap-giai-doan — truoc ${truoc.map((x) => ten.get(x)).join(" | ")}; sau tai lai ${sau.map((x) => ten.get(x)).join(" | ")}; toast co Hoan tac ${coNut}`,
			coNut && sau.join() === mongDoi.join(),
		);

		const truoc2 = sau;
		const thu2b = ten.get(truoc2[1] ?? "");
		await keoLen(p, thu2b);
		await choToast(p, s.saved);
		await choTayMo(p);
		await bamNutToast(p, s.saved, s.undo);
		await choToast(p, s.restored);
		await choTayMo(p);
		await p.screenshot({ path: join(RA, "hoan-tac-giai-doan-1440.png") });
		await mo(p, url, THE_MO);
		const sau2 = await thuTu(p, THE_MO, "data-hang-giai-doan");
		kiem(
			"hoan-tac-giai-doan-1440",
			`1440: hoan-tac-giai-doan — truoc ${truoc2.map((x) => ten.get(x)).join(" | ")}; sau Hoan tac va tai lai ${sau2.map((x) => ten.get(x)).join(" | ")}`,
			sau2.join() === truoc2.join(),
		);
	} finally {
		await ctx.close();
	}
}

async function boPhanSong() {
	return db.division.findMany({
		where: { archivedAt: null },
		orderBy: { position: "asc" },
		select: { id: true, name: true, position: true },
	});
}

async function doToChuc(cookie, slug) {
	let song = await boPhanSong();
	for (let i = song.length; i < 2; i += 1) {
		const moi = await db.division.create({
			data: { name: `${TEN_DO} bộ phận ${i}`, position: 100 + i },
			select: { id: true },
		});
		daTao.boPhan.push(moi.id);
	}
	song = await boPhanSong();
	const ten = new Map(song.map((x) => [x.id, x.name]));
	const { ctx, p } = await trang(1440, cookie);
	const url = `${APP}/${slug}/settings/organization?don=goc`;
	try {
		await mo(p, url, MUC_TO_CHUC);
		const truoc = await thuTu(p, MUC_TO_CHUC, "data-muc-keo");
		await keoLen(p, ten.get(truoc[1] ?? "") ?? "");
		await choToast(p, s.saved);
		const coNut = await coNutTrongToast(p, s.saved, s.undo);
		await choTayMo(p);
		await p.screenshot({ path: join(RA, "sap-to-chuc-1440.png") });
		await mo(p, url, MUC_TO_CHUC);
		const sau = await thuTu(p, MUC_TO_CHUC, "data-muc-keo");
		const mongDoi = [truoc[1], truoc[0], ...truoc.slice(2)];
		kiem(
			"sap-to-chuc-1440",
			`1440: sap-to-chuc — truoc ${truoc.map((x) => ten.get(x)).join(" | ")}; sau tai lai ${sau.map((x) => ten.get(x)).join(" | ")}; toast co Hoan tac ${coNut}`,
			coNut && sau.join() === mongDoi.join(),
		);

		const truoc2 = sau;
		await keoLen(p, ten.get(truoc2[1] ?? "") ?? "");
		await choToast(p, s.saved);
		await choTayMo(p);
		const coNut2 = await coNutTrongToast(p, s.saved, s.undo);
		if (!coNut2) {
			kiem(
				"hoan-tac-to-chuc-1440",
				"1440: hoan-tac-to-chuc — khong co nut Hoàn tác",
				false,
			);
			return;
		}
		await bamNutToast(p, s.saved, s.undo);
		await choToast(p, s.restored);
		await choTayMo(p);
		await p.screenshot({ path: join(RA, "hoan-tac-to-chuc-1440.png") });
		await mo(p, url, MUC_TO_CHUC);
		const sau2 = await thuTu(p, MUC_TO_CHUC, "data-muc-keo");
		kiem(
			"hoan-tac-to-chuc-1440",
			`1440: hoan-tac-to-chuc — truoc ${truoc2.map((x) => ten.get(x)).join(" | ")}; sau Hoan tac va tai lai ${sau2.map((x) => ten.get(x)).join(" | ")}`,
			sau2.join() === truoc2.join(),
		);
	} finally {
		await ctx.close();
	}
}

async function taoGiaiDoanDo(duoi, viTri) {
	const moi = await db.dealStage.create({
		data: { label: `${TEN_DO} ${duoi}`, kind: "OPEN", position: viTri },
		select: { id: true, label: true },
	});
	daTao.giaiDoan.push(moi.id);
	return moi;
}

async function chonLuuTru(p, id) {
	const ok = await p.evaluate((ma) => {
		const nut = document.querySelector(
			`[data-hang-giai-doan="${ma}"] [data-menu-giai-doan]`,
		);
		if (!(nut instanceof HTMLElement)) return false;
		nut.scrollIntoView({ block: "center" });
		nut.focus();
		return true;
	}, id);
	if (!ok) khongDo(`khong thay menu cua giai doan ${id}`);
	await p.keyboard.press("Enter");
	await p
		.waitForSelector('[role="menuitem"]', { timeout: CHO_MS })
		.catch(() => khongDo("menu hang khong mo"));
	const bam = await p.evaluate((chu) => {
		const m = [...document.querySelectorAll('[role="menuitem"]')].find(
			(x) => (x.textContent ?? "").trim() === chu,
		);
		if (!(m instanceof HTMLElement)) return false;
		m.click();
		return true;
	}, g.luuTru);
	if (!bam) khongDo(`menu khong co muc «${g.luuTru}»`);
}

async function moDaLuuTru(p) {
	await p
		.waitForSelector('[data-slot="archived-list"] button', { timeout: CHO_MS })
		.catch(() => khongDo("khong co muc gap Da luu tru"));
	await p.evaluate(() => {
		const b = document.querySelector('[data-slot="archived-list"] button');
		if (b instanceof HTMLElement && b.getAttribute("aria-expanded") !== "true")
			b.click();
	});
	await p
		.waitForSelector("[data-luu-tru]", { timeout: CHO_MS })
		.catch(() => khongDo("muc gap Da luu tru khong mo"));
}

async function doLuuTruKhoiPhuc(cookie, slug) {
	const ds = await giaiDoanMo();
	const g1 = await taoGiaiDoanDo("khôi phục", (ds.at(-1)?.position ?? 0) + 1);
	const { ctx, p } = await trang(1440, cookie);
	const url = `${APP}/${slug}/settings/giai-doan`;
	try {
		await mo(p, url, `[data-hang-giai-doan="${g1.id}"]`);
		await chonLuuTru(p, g1.id);
		await nghi(300);
		const coHop = await p.evaluate(
			() =>
				document.querySelector('[role="dialog"], [role="alertdialog"]') !==
				null,
		);
		await p
			.waitForFunction(
				(ma) =>
					document.querySelector(`[data-hang-giai-doan="${ma}"]`) === null,
				{ timeout: CHO_MS },
				g1.id,
			)
			.catch(() => khongDo("giai doan vua luu tru van con tren the"));
		await moDaLuuTru(p);
		const bam = await p.evaluate(
			(ma, chu) => {
				const b = [
					...(document
						.querySelector(`[data-luu-tru="${ma}"]`)
						?.querySelectorAll("button") ?? []),
				].find((x) => (x.textContent ?? "").trim() === chu);
				b?.click();
				return Boolean(b);
			},
			g1.id,
			g.khoiPhuc,
		);
		if (!bam) khongDo(`dong Da luu tru khong co nut «${g.khoiPhuc}»`);
		await p
			.waitForSelector(`[data-hang-giai-doan="${g1.id}"]`, { timeout: CHO_MS })
			.catch(() => khongDo("giai doan khong hien lai sau Khoi phuc"));
		await p.screenshot({ path: join(RA, "luu-tru-khoi-phuc-1440.png") });
		const the = await thuTu(p, THE_MO, "data-hang-giai-doan");
		kiem(
			"luu-tru-khoi-phuc-1440",
			`1440: luu-tru-khoi-phuc — hop hoi ${coHop}; vi tri sau khoi phuc ${the.indexOf(g1.id) + 1}/${the.length}`,
			!coHop && the.at(-1) === g1.id,
		);
	} finally {
		await ctx.close();
	}
}

async function doHoanTacLuuTru(cookie, slug) {
	const ds = await giaiDoanMo();
	const g2 = await taoGiaiDoanDo("hoàn tác", ds[0]?.position ?? 0);
	const sapLai = [ds[0], { id: g2.id }, ...ds.slice(1)].filter(Boolean);
	for (const [i, x] of sapLai.entries()) {
		await db.dealStage.update({ where: { id: x.id }, data: { position: i } });
	}
	const { ctx, p } = await trang(1440, cookie);
	const url = `${APP}/${slug}/settings/giai-doan`;
	try {
		await mo(p, url, `[data-hang-giai-doan="${g2.id}"]`);
		const truoc = await thuTu(p, THE_MO, "data-hang-giai-doan");
		await chonLuuTru(p, g2.id);
		const chu = g.daLuuTruTen.replace("{ten}", g2.label);
		await choToast(p, chu);
		await bamNutToast(p, chu, g.hoanTac);
		await choToast(p, g.daKhoiPhucTen.replace("{ten}", g2.label));
		await p.screenshot({ path: join(RA, "hoan-tac-luu-tru-1440.png") });
		await mo(p, url, `[data-hang-giai-doan="${g2.id}"]`);
		const sau = await thuTu(p, THE_MO, "data-hang-giai-doan");
		const ten = new Map([...ds.map((x) => [x.id, x.label]), [g2.id, g2.label]]);
		kiem(
			"hoan-tac-luu-tru-1440",
			`1440: hoan-tac-luu-tru — truoc ${truoc.map((x) => ten.get(x)).join(" | ")}; sau Hoan tac va tai lai ${sau.map((x) => ten.get(x)).join(" | ")}`,
			sau.join() === truoc.join() && truoc[1] === g2.id,
		);
	} finally {
		await ctx.close();
	}
}

async function doDaLuuTru375(cookie, slug) {
	const g3 = await taoGiaiDoanDo("375", 900);
	await db.dealStage.update({
		where: { id: g3.id },
		data: { archivedAt: new Date() },
	});
	const { ctx, p } = await trang(375, cookie);
	const url = `${APP}/${slug}/settings/giai-doan`;
	try {
		await mo(p, url, THE_MO);
		await moDaLuuTru(p);
		const so = await p.evaluate(
			(ma, chu) => {
				const gap = document.querySelector(
					'[data-slot="archived-list"] button',
				);
				const dongDo = document.querySelector(`[data-luu-tru="${ma}"]`);
				dongDo?.scrollIntoView({ block: "center" });
				const nut = [...(dongDo?.querySelectorAll("button") ?? [])].find(
					(x) => (x.textContent ?? "").trim() === chu,
				);
				const hop = (el) => {
					if (!el) return null;
					const r = el.getBoundingClientRect();
					return { left: Math.round(r.left), right: Math.round(r.right) };
				};
				return {
					gap: hop(gap),
					nut: hop(nut),
					cuon: document.documentElement.scrollWidth,
				};
			},
			g3.id,
			g.khoiPhuc,
		);
		await p.screenshot({ path: join(RA, "da-luu-tru-375.png") });
		const trong = (h) => Boolean(h && h.left >= 0 && h.right <= 375);
		kiem(
			"da-luu-tru-375",
			`375: da-luu-tru — muc gap ${JSON.stringify(so.gap)}; nut Khoi phuc ${JSON.stringify(so.nut)}; scrollWidth ${so.cuon}`,
			trong(so.gap) && trong(so.nut) && so.cuon <= 375,
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
	const goc = {
		giaiDoan: await db.dealStage.findMany({
			select: { id: true, position: true },
		}),
		boPhan: await db.division.findMany({
			select: { id: true, position: true },
		}),
	};
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	try {
		await doGiaiDoan(cookie, slug);
		await doToChuc(cookie, slug);
		await doLuuTruKhoiPhuc(cookie, slug);
		await doHoanTacLuuTru(cookie, slug);
		await doDaLuuTru375(cookie, slug);
	} finally {
		await db.dealStage.deleteMany({ where: { id: { in: daTao.giaiDoan } } });
		await db.division.deleteMany({ where: { id: { in: daTao.boPhan } } });
		for (const x of goc.giaiDoan) {
			await db.dealStage.update({
				where: { id: x.id },
				data: { position: x.position },
			});
		}
		for (const x of goc.boPhan) {
			await db.division.update({
				where: { id: x.id },
				data: { position: x.position },
			});
		}
	}
	const soO = MA_TRAN.filter((m) => m !== "dem" && daPhat.has(m)).length;
	kiem("dem", `${soO}/7 o`, soO === 7);
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
