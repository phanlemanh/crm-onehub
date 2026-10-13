import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { okrMessages } from "../../../apps/app/lib/messages/okr.ts";
import {
	idMau,
	laKhoDo,
	napBoMau,
	phienCookie,
	thuMau,
	tre,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const TEP = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP), "..", "..", "..");
const ANH = join(GOC, "_acceptance/duong-ly-do-muc-tieu/evidence");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const GIAY_MS = 1000;
const MAN = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		1440: { rong: 1440, cao: 1000 },
		390: { rong: 390, cao: 844 },
	},
	cho: { manMs: 120 * GIAY_MS, yenMs: 1500 },
	soAnh: 6,
};
const CA = JSON.parse(readFileSync(join(dirname(TEP), "ca-man.json"), "utf8"));
const m = okrMessages("vi").sheet;

const dong = [];
let sai = 0;

function ket(ma) {
	for (const d of dong) console.log(d);
	console.log(`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`);
	process.exit(ma);
}
function khongDo(cau) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	ket(2);
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

function doTrongTrang(chon) {
	const khoi = (el) => (el ? (getComputedStyle(el).display === "inline" ? el.closest("p, div") : el) : null);
	const cat = (el) => {
		if (!el) return null;
		const cs = getComputedStyle(el);
		return (
			el.scrollHeight > el.clientHeight + 1 ||
			el.scrollWidth > el.clientWidth + 1 ||
			cs.textOverflow === "ellipsis" ||
			(cs.webkitLineClamp !== "" && cs.webkitLineClamp !== "none")
		);
	};
	const soDong = (el) => {
		if (!el) return 0;
		const lh = Number.parseFloat(getComputedStyle(el).lineHeight);
		return Math.round(el.getBoundingClientRect().height / lh);
	};
	const dongNoi = document.querySelector(`[data-khu=gop-vao] [data-gop-vao]`);
	const cauEl = khoi(dongNoi?.querySelector("[data-ly-do-cau]"));
	const canCuEl = dongNoi?.querySelector("[data-ly-do-can-cu]") ?? null;
	let doiChung = null;
	if (cauEl) {
		const ban = cauEl.cloneNode(true);
		ban.style.display = "-webkit-box";
		ban.style.webkitBoxOrient = "vertical";
		ban.style.webkitLineClamp = "1";
		ban.style.overflow = "hidden";
		cauEl.parentElement.appendChild(ban);
		doiChung = cat(ban);
		ban.remove();
	}
	const vungGoc = document.querySelector("[data-khu=gop-vao]");
	const hopTren = (el) => {
		const ds = [];
		for (let x = el?.parentElement ?? null; x; x = x.parentElement) {
			if (x.clientWidth > 0) ds.push(x);
			if (x.matches(chon.dinh)) break;
		}
		return ds;
	};
	const tran = (el) => hopTren(el).filter((x) => x.scrollWidth > x.clientWidth + 1).length;
	const hop = hopTren(vungGoc);
	const tranThat = vungGoc ? tran(vungGoc) : null;
	let doiChungTran = null;
	if (vungGoc) {
		const rong = document.createElement("div");
		rong.style.width = "4000px";
		rong.style.height = "1px";
		vungGoc.appendChild(rong);
		doiChungTran = tran(vungGoc) > 0;
		rong.remove();
	}
	return {
		soHop: hop.length,
		coHopCuon: hop.some((x) => x.matches(chon.cuon)),
		coVung: document.querySelector("[data-khu=gop-vao]") !== null,
		nhan: dongNoi?.querySelector("[data-muc-tin]")?.textContent ?? null,
		coCau: dongNoi?.querySelector("[data-ly-do-cau]") !== null,
		coCanCu: canCuEl !== null,
		kara: dongNoi?.querySelectorAll("[data-slot=kara-trace]").length ?? 0,
		catCau: cat(cauEl),
		catCanCu: cat(canCuEl),
		soDongCau: soDong(cauEl),
		tranNgang: tranThat === null ? null : tranThat > 0,
		doiChungTran,
		doiChung,
	};
}

async function doKho(tenKho) {
	const kho = MAN.kho[tenKho];
	const cookie = JSON.parse(process.env.L2_COOKIE);
	const slug = process.env.L2_SLUG;
	const host = new URL(APP).hostname;
	const trinhDuyet = await puppeteer.launch({ executablePath: MAN.chrome, headless: true });
	try {
		for (const ca of CA.ca) {
			const id = idMau("mt", ca.ma);
			const ctx = await trinhDuyet.createBrowserContext();
			await ctx.setCookie(
				{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
				{ name: "lang", value: "vi", domain: host, path: "/" },
			);
			const p = await ctx.newPage();
			await p.setViewport({ width: kho.rong, height: kho.cao, deviceScaleFactor: 1 });
			p.setDefaultNavigationTimeout(MAN.cho.manMs);
			p.setDefaultTimeout(MAN.cho.manMs);
			const loiConsole = [];
			p.on("console", (msg) => {
				if (msg.type() === "error") loiConsole.push(msg.text());
			});
			await p.goto(`${APP}/${slug}/okr/theo-don-vi?record=objective:${id}`, { waitUntil: "load" });
			await p.waitForSelector(`[data-okr-sheet="${id}"] [data-khu=gop-vao] [data-muc-tin]`);
			await p.evaluate(() => document.fonts.ready);
			await tre(MAN.cho.yenMs);
			await p.evaluate(() => {
				document.querySelector("[data-khu=gop-vao]")?.scrollIntoView({ block: "center" });
				for (const s of ["nextjs-portal", ".tsqd-parent-container", ".tsqd-open-btn-container"])
					for (const el of document.querySelectorAll(s)) el.remove();
			});
			const o = await p.evaluate(doTrongTrang, { dinh: "[data-slot=sheet-content]", cuon: "[data-slot=sheet-body], .overflow-y-auto" });
			const ten = `${ca.mucTin} ${tenKho}`;
			if (o.soHop === 0 || !o.coHopCuon) throw new Error(`khong co hop cuon co kich thuoc tu vung Duong ly do toi sheet-content (${o.soHop} hop)`);
			kiem(`${ten}: nhan «${o.nhan}» === «${m.mucTin[ca.mucTin]}»`, o.nhan === m.mucTin[ca.mucTin]);
			kiem(`${ten}: cau ly do ${o.coCau ? "co" : "khong"}`, o.coCau === (ca.mucTin !== "chua-co-ly-do"));
			kiem(`${ten}: dong can cu ${o.coCanCu ? "co" : "khong"}`, o.coCanCu === (ca.mucTin === "co-so-lieu"));
			kiem(`${ten}: dau Kara ${o.kara}`, o.kara === (ca.kara ? 1 : 0));
			kiem(`${ten}: khong cat chu (cau ${o.catCau}, can cu ${o.catCanCu})`, o.catCau !== true && o.catCanCu !== true);
			kiem(`${ten}: khong tran ngang tren ${o.soHop} hop tu vung toi sheet (${o.tranNgang})`, o.tranNgang === false);
			kiem(`${ten}: doi chung do — chen khoi rong 4000px thi bao tran ngang`, o.doiChungTran === true);
			if (o.coCau) kiem(`${ten}: doi chung do — ban sao kep 1 dong bi bao cat chu`, o.doiChung === true);
			if (ca.dai && tenKho === "390") kiem(`${ten}: cau dai xuong ${o.soDongCau} dong (>= 2)`, o.soDongCau >= 2);
			const tep = join(ANH, `${ca.mucTin}-${tenKho}.png`);
			await p.screenshot({ path: tep });
			dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
			kiem(`${ten}: console khong loi (${loiConsole.length})${loiConsole.length ? ` — ${loiConsole[0]}` : ""}`, loiConsole.length === 0);
			await ctx.close();
		}
	} finally {
		await trinhDuyet.close().catch(() => {});
	}
}

const chiKho = process.argv.includes("--kho") ? process.argv[process.argv.indexOf("--kho") + 1] : null;
if (chiKho) {
	try {
		await doKho(chiKho);
	} catch (loi) {
		khongDo(`kho ${chiKho}: ${loi?.message ?? loi}`);
	}
	ket(sai === 0 ? 0 : 1);
}

mkdirSync(ANH, { recursive: true });
const { canhCay } = await import("../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs");
const cay = await canhCay();
if (cay.ket !== "dung-cay") khongDo(`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`);
if (!laKhoDo()) khongDo("DATABASE_URL khong phai kho do rieng — chay qua config:executors.script.l2_man");
const nap = napBoMau();
if (nap.ma !== 0) khongDo(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
dong.push(`GHI NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
const cookie = phienCookie(thuMau(CA.nguoiXem));
const slug = await suySlug(cookie);
if (!slug) khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);
let soAnh = 0;
for (const tenKho of Object.keys(MAN.kho)) {
	const r = spawnSync("bun", [TEP, "--kho", tenKho], {
		cwd: GOC,
		env: { ...process.env, L2_COOKIE: JSON.stringify(cookie), L2_SLUG: slug },
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});
	for (const d of `${r.stdout}`.split("\n").filter((x) => /^(DUNG|SAI|ANH|KHONG DO DUOC)/.test(x))) {
		dong.push(d);
		if (d.startsWith("SAI")) sai += 1;
		if (d.startsWith("ANH")) soAnh += 1;
	}
	if (r.status === 2) khongDo(`tien trinh kho ${tenKho} khong do duoc: ${`${r.stderr}`.trim().split("\n").slice(-2).join(" | ")}`);
	if (r.status !== 0 && r.status !== 1) khongDo(`tien trinh kho ${tenKho} thoat ${r.status}`);
}
kiem(`du ${MAN.soAnh} anh (${soAnh})`, soAnh === MAN.soAnh);
ket(sai === 0 ? 0 : 1);
