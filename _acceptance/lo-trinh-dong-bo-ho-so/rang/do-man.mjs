import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { db } from "../../../packages/db/src/index.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "lo-trinh-dong-bo-ho-so", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const QUAN_TRI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const MA_TRAN = [
	"ngan-1280",
	"ngan-375",
	"cot-moc-375",
	"cot-moc-1280",
	"the-bang-cot",
	"da-bac",
];
const NGAN_VIEC = "[data-lo-trinh-chi-tiet-viec]";
const DAI_O = "[data-slot=detail-sheet-stats]";

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
const tao = { company: null, deal: null };

function kiem(ma, nhan, dat) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ${ma} khong co trong MA_TRAN`);
	daPhat.add(ma);
	dong.push(`${dat ? "DUNG" : "SAI"} ${ma}: ${nhan}`);
	if (!dat) sai += 1;
}

class KhongDo extends Error {}
function khongDo(cau) {
	throw new KhongDo(cau);
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

async function thoaThuan() {
	const co = await db.deal.findFirst({
		where: { archivedAt: null },
		select: { id: true, name: true },
		orderBy: { createdAt: "asc" },
	});
	if (co) return co;
	const nguoi = await db.user.findUnique({
		where: { email: QUAN_TRI },
		select: { id: true },
	});
	const giaiDoan = await db.dealStage.findFirst({
		where: { archivedAt: null },
		orderBy: { position: "asc" },
		select: { id: true },
	});
	if (!nguoi || !giaiDoan)
		khongDo(
			"kho do khong co nguoi quan tri hay giai doan thoa thuan de tao thoa thuan tam",
		);
	const ma = Date.now().toString(36);
	const cty = await db.company.create({
		data: { name: `Công ty đo ${ma}` },
		select: { id: true },
	});
	tao.company = cty.id;
	const deal = await db.deal.create({
		data: {
			name: `Thoả thuận đo ${ma}`,
			companyId: cty.id,
			ownerId: nguoi.id,
			stage: giaiDoan.id,
		},
		select: { id: true, name: true },
	});
	tao.deal = deal.id;
	return deal;
}

async function trang(cookie, kho) {
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

async function mo(p, url, sel) {
	await p.goto(url, { waitUntil: "domcontentloaded", timeout: CHO_MS });
	if (sel)
		await p
			.waitForSelector(sel, { timeout: CHO_MS })
			.catch(() => khongDo(`${url}: khong thay ${sel}`));
	await p
		.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
		.catch(() => {});
}

const cuon = (p) => p.evaluate(() => document.documentElement.scrollWidth);
const nghi = (ms) => new Promise((r) => setTimeout(r, ms));

async function anh(p, ten) {
	await p.screenshot({ path: join(RA, `${ten}.png`) });
}

async function dongNgan(p, sel) {
	await p.keyboard.press("Escape");
	await p
		.waitForFunction(
			(s) => !document.querySelector(s),
			{ timeout: 15_000 },
			sel,
		)
		.catch(() => {});
	await nghi(400);
}

async function moViecCoMuc(p, canMuc) {
	const so = await p.$$eval("tbody [data-viec-khoa]", (ds) => ds.length);
	for (let i = 0; i < Math.min(so, canMuc ? 12 : 1); i++) {
		const ds = await p.$$("tbody [data-viec-khoa]");
		for (let lan = 0; lan < 4; lan++) {
			await ds[i].click();
			const daNhan = await p
				.waitForFunction(() => location.search.includes("viec="), {
					timeout: 4000,
				})
				.then(() => true)
				.catch(() => false);
			if (daNhan) break;
		}
		const co = await p
			.waitForSelector(`${NGAN_VIEC} ${DAI_O}`, { timeout: 20_000 })
			.then(() => true)
			.catch(() => false);
		if (!co) return false;
		await nghi(500);
		const coH3 = await p.$eval(
			NGAN_VIEC,
			(n) => n.querySelector("section h3") !== null,
		);
		if (coH3 || !canMuc) return true;
		await dongNgan(p, NGAN_VIEC);
		await nghi(1200);
	}
	return p.$(NGAN_VIEC).then((x) => x !== null);
}

async function moThoaThuan(p, slug) {
	await mo(p, `${APP}/${slug}/deals`, "tbody tr");
	const dongDau = await p.evaluateHandle(
		() =>
			[...document.querySelectorAll("tbody tr")].find(
				(e) => e.offsetParent !== null,
			) ?? null,
	);
	const el = dongDau.asElement();
	if (!el) khongDo("trang Thoa thuan khong co dong nao dang hien");
	await el.click();
	const co = await p
		.waitForFunction(
			(s) =>
				[
					...document.querySelectorAll(
						"[data-slot=sheet-content], [data-slot=drawer-content]",
					),
				].some((n) => n.querySelector(s)),
			{ timeout: CHO_MS },
			DAI_O,
		)
		.then(() => true)
		.catch(() => false);
	await nghi(800);
	return co;
}

function docKieu(p, selNgan) {
	return p.evaluate(
		(selNgan, dai) => {
			const ngan = [
				...document.querySelectorAll(
					"[data-slot=sheet-content], [data-slot=drawer-content]",
				),
			].find(
				(n) => n.matches(selNgan) || (selNgan === "*" && n.querySelector(dai)),
			);
			if (!ngan) return null;
			const k = (el, ds) => {
				if (!el) return null;
				const s = getComputedStyle(el);
				return Object.fromEntries(ds.map((d) => [d, s.getPropertyValue(d)]));
			};
			const o = ngan.querySelector(dai);
			return {
				rong: Math.round(ngan.getBoundingClientRect().width),
				tieuDe: k(ngan.querySelector("[data-slot$=-title]"), [
					"font-size",
					"font-weight",
				]),
				daiO: k(o, ["background-color"]),
				nhanO: k(o?.querySelector("dt"), ["font-size", "color"]),
				muc: k(ngan.querySelector("section h3"), [
					"font-size",
					"font-weight",
					"text-transform",
					"color",
				]),
				huong: ngan.getAttribute("data-vaul-drawer-direction"),
				tayKeo: (() => {
					const t = ngan.firstElementChild;
					if (!t) return false;
					const r = t.getBoundingClientRect();
					return (
						getComputedStyle(t).display !== "none" &&
						r.height > 0 &&
						r.height <= 8 &&
						r.width >= 40
					);
				})(),
				laNganKeo: ngan.matches("[data-slot=drawer-content]"),
			};
		},
		selNgan,
		DAI_O,
	);
}

function lechDau(a, b) {
	for (const nhom of ["tieuDe", "daiO", "nhanO", "muc"]) {
		for (const [k, v] of Object.entries(b[nhom] ?? {})) {
			if (a[nhom]?.[k] !== v)
				return `${nhom}.${k}: viec=${a[nhom]?.[k]} thoa-thuan=${v}`;
		}
	}
	if (Math.abs(a.rong - b.rong) > 1)
		return `rong: viec=${a.rong} thoa-thuan=${b.rong}`;
	return null;
}

async function doNgan(qt, slug, deal, kho) {
	const ma = kho === 1280 ? "ngan-1280" : "ngan-375";
	const tr1 = await trang(qt, kho);
	let tt;
	try {
		const p = tr1.p;
		if (!(await moThoaThuan(p, slug)))
			khongDo("ngăn thoả thuận không mang khung chi tiết chung");
		tt = await docKieu(p, "*");
		if (!tt?.daiO || !tt?.muc)
			khongDo("ngăn thoả thuận không mang khung chi tiết chung");
		if (kho === 375 && !(tt.laNganKeo && tt.huong === "bottom"))
			khongDo("ngăn thoả thuận ở 375 không phải ngăn kéo");
		await anh(p, `ngan-thoa-thuan-${kho}`);
	} finally {
		await tr1.ctx.close();
	}
	const { ctx, p } = await trang(qt, kho);
	try {
		await mo(
			p,
			`${APP}/${slug}/lo-trinh?vongDoi=tat-ca`,
			"tbody [data-viec-khoa]",
		);
		await moViecCoMuc(p, kho === 1280);
		const vc = await docKieu(p, NGAN_VIEC);
		await anh(p, `ngan-viec-${kho}`);
		if (!vc?.daiO) {
			const tinh = await p.evaluate(() => ({
				q: location.search,
				keo: document.querySelectorAll("[data-slot=drawer-content]").length,
			}));
			kiem(
				ma,
				`${kho === 1280 ? "ngan viec khong co dai o chung" : "ngan viec o 375 khong phai ngan keo"} (url ${tinh.q}, ngan keo ${tinh.keo})`,
				false,
			);
			return;
		}
		if (kho === 1280) {
			const lech = lechDau(vc, tt);
			kiem(
				ma,
				lech ??
					`cung khung: rong ${vc.rong}, tieu de ${vc.tieuDe["font-size"]}/${vc.tieuDe["font-weight"]}, muc ${vc.muc?.["text-transform"]}`,
				lech === null,
			);
			return;
		}
		const ok =
			vc.laNganKeo &&
			vc.huong === "bottom" &&
			vc.tayKeo &&
			Math.abs(vc.rong - tt.rong) <= 1;
		const cuonTruoc = await cuon(p);
		await dongNgan(p, NGAN_VIEC);
		const daDong = (await p.$(NGAN_VIEC)) === null;
		kiem(
			ma,
			ok
				? `ngan keo tu duoi, rong ${vc.rong} == ${tt.rong}, tay keo co, scrollWidth ${cuonTruoc}, Esc dong ${daDong}`
				: `ngan viec o 375 khong phai ngan keo (keo ${vc.laNganKeo}, huong ${vc.huong}, tay keo ${vc.tayKeo}, rong ${vc.rong}/${tt.rong})`,
			ok && cuonTruoc <= 375 && daDong,
		);
	} finally {
		await ctx.close();
	}
}

async function doCotMoc(qt, slug) {
	const LT = `${APP}/${slug}/lo-trinh?vongDoi=tat-ca`;
	{
		const { ctx, p } = await trang(qt, 375);
		try {
			await mo(p, LT, "tbody [data-viec-khoa]");
			const kq = await p.evaluate(() => {
				const o = [
					...document.querySelectorAll("[data-lo-trinh-moc-viec]"),
				].filter((e) => e.offsetParent !== null);
				const dem = { con: 0, "hom-nay": 0, tre: 0 };
				let cat = null;
				for (const m of o) {
					const td = m.closest("td");
					const r = td.getBoundingClientRect();
					if (td.scrollWidth > td.clientWidth)
						cat ??= m.getAttribute("data-lo-trinh-moc-viec");
					for (const e of [m, ...m.querySelectorAll("*")]) {
						const x = e.getBoundingClientRect();
						const s = getComputedStyle(e);
						if (
							x.right > r.right + 0.5 ||
							x.left < r.left - 0.5 ||
							(e.scrollWidth > e.clientWidth + 0.5 && s.display !== "inline") ||
							(s.textOverflow === "ellipsis" && e.scrollWidth > e.clientWidth)
						)
							cat ??= `${m.closest("tr")?.querySelector("[data-viec-khoa]")?.getAttribute("data-viec-khoa")} (${(e.textContent ?? "").trim()})`;
					}
					const phu = m
						.querySelector("[data-lo-trinh-con-ngay]")
						?.getAttribute("data-lo-trinh-con-ngay");
					if (phu && phu in dem) dem[phu]++;
				}
				return { so: o.length, dem, cat };
			});
			await anh(p, "bang-375");
			const ca = await cuon(p);
			if (kq.dem.con + kq.dem["hom-nay"] + kq.dem.tre === 0)
				khongDo("khong co o moc nao co dong phu de do");
			kiem(
				"cot-moc-375",
				kq.cat
					? `o moc bi cat: ${kq.cat}`
					: `${kq.so} o moc tron (con ${kq.dem.con}, hom nay ${kq.dem["hom-nay"]}, tre ${kq.dem.tre}), scrollWidth ${ca}`,
				!kq.cat && ca <= 375,
			);
		} finally {
			await ctx.close();
		}
	}
	const { ctx, p } = await trang(qt, 1280);
	try {
		await mo(p, LT, "tbody [data-viec-khoa]");
		const tl = await p.evaluate(() => {
			const td = document
				.querySelector("[data-lo-trinh-moc-viec]")
				?.closest("td");
			const bang = td?.closest("table");
			return td && bang
				? td.getBoundingClientRect().width / bang.getBoundingClientRect().width
				: null;
		});
		kiem(
			"cot-moc-1280",
			`ty le cot Moc ${tl === null ? "khong do duoc" : tl.toFixed(3)}`,
			tl !== null && tl >= 0.14 && tl <= 0.18,
		);
	} finally {
		await ctx.close();
	}
}

async function doBangCot(qt, slug) {
	const { ctx, p } = await trang(qt, 1280);
	try {
		await mo(
			p,
			`${APP}/${slug}/lo-trinh?vongDoi=tat-ca&xemLoTrinh=bang-cot`,
			"button[data-viec-khoa]",
		);
		const kq = await p.evaluate(() => {
			const the = [
				...document.querySelectorAll("button[data-viec-khoa]"),
			].filter((e) => e.offsetParent !== null);
			let saiThe = null;
			for (const b of the) {
				const s = getComputedStyle(b);
				const trai =
					b.getBoundingClientRect().left +
					Number.parseFloat(s.paddingLeft) +
					Number.parseFloat(s.borderLeftWidth);
				const w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT);
				const nut = w.nextNode();
				let lech = 0;
				if (nut && (nut.textContent ?? "").trim()) {
					const rg = document.createRange();
					rg.selectNodeContents(nut);
					const r = rg.getClientRects()[0];
					lech = r ? r.left - trai : 0;
				}
				if (!["start", "left"].includes(s.textAlign) || lech > 2)
					saiThe ??= `${b.getAttribute("data-viec-khoa")} (text-align ${s.textAlign}, cach mep ${lech.toFixed(1)}px)`;
			}
			return { so: the.length, saiThe };
		});
		await anh(p, "bang-cot-1280");
		kiem(
			"the-bang-cot",
			kq.saiThe
				? `the bang cot can giua: ${kq.saiThe}`
				: `${kq.so} the can dau dong`,
			kq.so > 0 && !kq.saiThe,
		);
	} finally {
		await ctx.close();
	}
}

async function doDaBac(qt, slug) {
	const { ctx, p } = await trang(qt, 1280);
	const NUT = "[data-lo-trinh-nut-da-bac]";
	const doc = () =>
		p.$eval(NUT, (b) => {
			const s = getComputedStyle(b);
			return {
				pressed: b.getAttribute("aria-pressed"),
				kieu: ["border-color", "background-color", "box-shadow", "color"].map(
					(d) => s.getPropertyValue(d),
				),
			};
		});
	const khoa = () =>
		p.$$eval("tbody [data-viec-khoa]", (ds) =>
			ds.map((d) => d.getAttribute("data-viec-khoa")).join("|"),
		);
	try {
		await mo(p, `${APP}/${slug}/lo-trinh`, NUT);
		await p.mouse.move(0, 0);
		await nghi(300);
		const truocKhoa = await khoa();
		const tat = await doc();
		await anh(p, "da-bac-tat");
		await p.click(NUT);
		await p
			.waitForSelector("[data-lo-trinh-da-bac-mo]", { timeout: CHO_MS })
			.catch(() => {});
		await p.mouse.move(0, 0);
		await nghi(500);
		const bat = await doc();
		await anh(p, "da-bac-bat");
		await p.click(NUT);
		await p
			.waitForSelector("tbody [data-viec-khoa]", { timeout: CHO_MS })
			.catch(() => {});
		await p.mouse.move(0, 0);
		await nghi(500);
		const lai = await doc();
		const sauKhoa = await khoa();
		const khac = bat.kieu.some((v, i) => v !== tat.kieu[i]);
		const ve = lai.kieu.every((v, i) => v === tat.kieu[i]);
		const ok =
			tat.pressed === "false" &&
			bat.pressed === "true" &&
			khac &&
			lai.pressed === "false" &&
			ve &&
			sauKhoa === truocKhoa;
		kiem(
			"da-bac",
			khac
				? `bat ${bat.pressed}/${bat.kieu.join(" ; ")} — tat ${tat.pressed}/${tat.kieu.join(" ; ")}; tat lai ve ${ve}, danh sach ve ${sauKhoa === truocKhoa}`
				: "nut Da bac bat trong nhu tat",
			ok,
		);
	} finally {
		await ctx.close();
	}
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	const qt = phien(QUAN_TRI);
	const slug = await suySlug(qt);
	const deal = await thoaThuan();
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	await doNgan(qt, slug, deal, 1280);
	await doNgan(qt, slug, deal, 375);
	await doCotMoc(qt, slug);
	await doBangCot(qt, slug);
	await doDaBac(qt, slug);
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
	if (tao.deal) await db.deal.deleteMany({ where: { id: tao.deal } });
	if (tao.company) await db.company.deleteMany({ where: { id: tao.company } });
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
