import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { okrMessages } from "../../../apps/app/lib/messages/okr.ts";
import { okrToanCanhMessages } from "../../../apps/app/lib/messages/okr-toan-canh.ts";
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
const ANH = join(GOC, "_acceptance/cay-can-chinh-co-ly-do/evidence");
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
	rongChen: "4000px",
};
const CA = JSON.parse(readFileSync(join(dirname(TEP), "ca-man.json"), "utf8"));
const m = okrMessages("vi").sheet;
const mt = okrToanCanhMessages("vi").cay;

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
	const hopTren = (el) => {
		const ds = [];
		for (let x = el?.parentElement ?? null; x; x = x.parentElement) {
			if (x.clientWidth > 0) ds.push(x);
			if (x.matches(chon.dinh)) return { ds, gap: true };
		}
		return { ds, gap: false };
	};
	const tran = (ds) => ds.filter((x) => x.scrollWidth > x.clientWidth + 1).length;
	const cay = document.querySelector("[data-trang-thai=ST-donvi-caycanchinh]");
	const { ds, gap } = hopTren(cay);
	let doiChungTran = null;
	if (cay) {
		const rong = document.createElement("div");
		rong.style.width = chon.rongChen;
		rong.style.height = "1px";
		cay.appendChild(rong);
		doiChungTran = tran(hopTren(cay).ds) > 0;
		rong.remove();
	}
	const ca = chon.ca.map(({ id }) => {
		const n = document.querySelector(`[data-nut-can-chinh="${id}"]`);
		const dong = n?.querySelector("[data-ly-do-canh]") ?? null;
		let doiChungCat = null;
		if (dong) {
			const ban = dong.cloneNode(true);
			ban.style.display = "-webkit-box";
			ban.style.webkitBoxOrient = "vertical";
			ban.style.webkitLineClamp = "1";
			ban.style.overflow = "hidden";
			dong.parentElement.appendChild(ban);
			doiChungCat = cat(ban);
			ban.remove();
		}
		return {
			id,
			coMat: n !== null,
			nhan: n?.querySelector("[data-muc-tin]")?.textContent ?? null,
			coDong: dong !== null,
			catDong: cat(dong),
			doiChungCat,
		};
	});
	return { soHop: ds.length, gap, tranNgang: cay ? tran(ds) > 0 : null, doiChungTran, ca };
}

async function doKho(tenKho) {
	const kho = MAN.kho[tenKho];
	const cookie = JSON.parse(process.env.L3_COOKIE);
	const slug = process.env.L3_SLUG;
	const host = new URL(APP).hostname;
	const caId = CA.ca.map((c) => ({ ...c, id: idMau("mt", c.ma) }));
	const trinhDuyet = await puppeteer.launch({ executablePath: MAN.chrome, headless: true });
	try {
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
		await p.goto(`${APP}/${slug}/okr/theo-don-vi?xemOkr=cay`, { waitUntil: "load" });
		await p.waitForSelector("[data-trang-thai=ST-donvi-caycanchinh] [data-muc-tin]");
		await p.evaluate(() => document.fonts.ready);
		const chup = async (ten) => {
			await tre(MAN.cho.yenMs);
			await p.evaluate(() => {
				for (const s of ["nextjs-portal", ".tsqd-parent-container", ".tsqd-open-btn-container"])
					for (const el of document.querySelectorAll(s)) el.remove();
			});
			const tep = join(ANH, `${ten}-${tenKho}.png`);
			await p.screenshot({ path: tep });
			dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
		};
		const chon = { dinh: "body", rongChen: MAN.rongChen, ca: caId };
		await p.evaluate((id) => document.querySelector(`[data-nut-can-chinh="${id}"]`)?.scrollIntoView({ block: "center" }), caId[0].id);
		const o = await p.evaluate(doTrongTrang, chon);
		if (o.soHop === 0 || !o.gap) throw new Error(`khong toi duoc body tu cay (${o.soHop} hop)`);
		for (const c of caId) {
			const d = o.ca.find((x) => x.id === c.id);
			kiem(`tat-ca ${tenKho} ${c.ma}: nhan «${d?.nhan}» === «${m.mucTin[c.mucTin]}»`, d?.nhan === m.mucTin[c.mucTin]);
			kiem(`tat-ca ${tenKho} ${c.ma}: dong ly do ${d?.coDong ? "co" : "khong"}`, d?.coDong === (c.mucTin !== "chua-co-ly-do"));
			if (d?.coDong) {
				kiem(`tat-ca ${tenKho} ${c.ma}: khong cat chu (${d.catDong})`, d.catDong === false);
				kiem(`tat-ca ${tenKho} ${c.ma}: doi chung do — ban sao kep 1 dong bi bao cat chu`, d.doiChungCat === true);
			}
		}
		kiem(`tat-ca ${tenKho}: khong tran ngang tren ${o.soHop} hop tu cay toi body (${o.tranNgang})`, o.tranNgang === false);
		kiem(`tat-ca ${tenKho}: doi chung do — chen khoi rong thi bao tran ngang`, o.doiChungTran === true);
		await chup("tat-ca");
		for (const [loc, mong] of [
			["chua-co-ly-do", (c) => c.mucTin === "chua-co-ly-do"],
			["dat-cuoc", (c) => c.mucTin === "dat-cuoc"],
		]) {
			await p.click(`[data-loc-muc-tin="${loc}"]`);
			await p.waitForFunction((l) => new URL(location.href).searchParams.get("mucTinCay") === l, {}, loc);
			await tre(MAN.cho.yenMs);
			const hien = await p.evaluate((ds) => ds.map((id) => document.querySelector(`[data-nut-can-chinh="${id}"]`) !== null), caId.map((c) => c.id));
			const dung = caId.every((c, i) => hien[i] === mong(c));
			kiem(`${loc} ${tenKho}: tap nut mau hien ${JSON.stringify(caId.map((c, i) => `${c.ma}:${hien[i] ? "co" : "khong"}`))}`, dung);
			await chup(loc);
		}
		kiem(`${tenKho}: console khong loi (${loiConsole.length})${loiConsole.length ? ` — ${loiConsole[0]}` : ""}`, loiConsole.length === 0);
		await ctx.close();
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
if (!laKhoDo()) khongDo("DATABASE_URL khong phai kho do rieng — chay qua config:executors.script.l3_man");
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
		env: { ...process.env, L3_COOKIE: JSON.stringify(cookie), L3_SLUG: slug },
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
