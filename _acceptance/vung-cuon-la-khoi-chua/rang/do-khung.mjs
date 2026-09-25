import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { db } from "../../../packages/db/src/index.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const CAY_TRANG = join(GOC, "apps", "app", "app", "(app)", "[slug]");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "vung-cuon-la-khoi-chua", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const QUAN_TRI = process.env.QUAN_TRI ?? "ada@trycomp.ai";
const KHO = [
	{ rong: 1440, cao: 900 },
	{ rong: 768, cao: 1024 },
	{ rong: 375, cao: 812 },
];
const CHO_MS = 90_000;
const MAU_MS = 400;
const SO_MAU_ON = 3;
const SO_MAU_TOI_DA = 60;
const LECH_PX = 1;
const HE_SO_DEM = 2;
const DAY_NGANG = "150vw";
const SO_NAC_TOI_DA = 40;
const NAC_PX = 600;
const NAC_THEM = 3;
const NAC_ANH_PX = 300;
const CHO_ANH_MS = 300;
const CHO_NAC_MS = 60;
const NGAN_SACH_MS = 540_000;
const TRANG_ANH = "/settings/fields";
const MA_GIA = "vckc-khong-co-ban-ghi";
const PHA_DOAN = process.env.VCKC_PHA_DOAN === "1";
const PHA_GHIM = process.env.VCKC_PHA_GHIM === "1";

const GHIM = {
	"/contacts/[contactId]": "chuyen-huong",
	"/deals/[dealId]": "chuyen-huong",
	"/companies/[companyId]": "chuyen-huong",
	"/onboarding/[planId]": "chuyen-huong",
	"/settings/notifications": "chuyen-huong",
	"/settings/connections/slack/people": "chuyen-huong",
	"/agents/[agentId]": "contained",
	"/chat": "khong-khung",
	"/chat/[chatId]": "khong-khung",
};
if (PHA_GHIM) delete GHIM["/settings/notifications"];

const DOAN = {
	contactId: () => db.contact.findFirst({ select: { id: true } }),
	dealId: () => db.deal.findFirst({ select: { id: true } }),
	companyId: () => db.company.findFirst({ select: { id: true } }),
	planId: () => db.onboardingPlan.findFirst({ select: { id: true } }),
	campaignId: () => db.campaign.findFirst({ select: { id: true } }),
	agentId: () => db.agentDefinition.findFirst({ select: { id: true } }),
	chatId: (nguoi) =>
		db.agentConversation.findFirst({
			where: { userId: nguoi },
			select: { id: true },
		}),
};

const dong = [];
let sai = 0;
let trinhDuyet = null;
const batDau = Date.now();

function kiem(nhan, dat) {
	if (dat) dong.push(`DUNG ${nhan}`);
	else {
		sai += 1;
		dong.push(`SAI ${nhan}`);
	}
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
	const dau = new URL(dich, APP).pathname
		.replace(/^\/+|\/+$/g, "")
		.split("/")[0];
	if (!dau || dau.startsWith("onboarding") || dau === "sign-in")
		khongDo(`${APP}/ chuyen toi ${dich} — tien de onboarding hoac phien hong`);
	return dau;
}

function duongMau(thuMuc) {
	const doan = relative(CAY_TRANG, thuMuc)
		.split(/[\\/]/)
		.filter((d) => d && !(d.startsWith("(") && d.endsWith(")")));
	return `/${doan.join("/")}`.replace(/\/$/, "") || "/";
}

function maTranTuDia() {
	const ra = [];
	const di = (thuMuc) => {
		for (const muc of readdirSync(thuMuc, { withFileTypes: true })) {
			const d = join(thuMuc, muc.name);
			if (muc.isDirectory()) di(d);
			else if (muc.name === "page.tsx") ra.push(duongMau(thuMuc));
		}
	};
	di(CAY_TRANG);
	if (PHA_DOAN) ra.push("/[doanLa]");
	return ra.sort();
}

async function dienDoan(mau, nguoiId) {
	let duong = mau;
	for (const [, ten] of mau.matchAll(/\[([^\]]+)\]/g)) {
		const lay = DOAN[ten];
		if (!lay)
			khongDo(
				`doan dong [${ten}] o ${mau} — ban do chua biet lay ma ban ghi nao`,
			);
		const banGhi = await lay(nguoiId);
		let ma = banGhi?.id;
		if (!ma) {
			if (!(mau in GHIM))
				khongDo(`doan dong [${ten}] o ${mau} khong co ban ghi nao trong kho`);
			dong.push(`GHI CHU ${mau}: khong co ban ghi, mo bang ma gia`);
			ma = MA_GIA;
		}
		duong = duong.replace(`[${ten}]`, ma);
	}
	return duong;
}

function mauTrang() {
	const main = document.querySelector("main[data-slot=page-shell-scroll]");
	const de = document.documentElement;
	return JSON.stringify({
		duong: location.pathname,
		main: !!main,
		ban: !!document.querySelector("[data-slot=page-shell][aria-busy=true]"),
		cao: de.scrollHeight,
		rong: de.scrollWidth,
		caoMain: main?.scrollHeight ?? 0,
		soPhanTu: main ? main.getElementsByTagName("*").length : 0,
	});
}

async function choDungYen(p, nhan) {
	let truoc = "";
	let lienTiep = 0;
	for (let i = 0; i < SO_MAU_TOI_DA; i += 1) {
		await new Promise((r) => setTimeout(r, MAU_MS));
		const mau = await p.evaluate(mauTrang);
		const ban = JSON.parse(mau).ban;
		lienTiep = mau === truoc && !ban ? lienTiep + 1 : 0;
		truoc = mau;
		if (lienTiep >= SO_MAU_ON - 1) return JSON.parse(mau);
	}
	khongDo(`${nhan}: trang khong dung yen sau ${SO_MAU_TOI_DA} mau`);
}

function doTuNhien() {
	const main = document.querySelector("main[data-slot=page-shell-scroll]");
	const de = document.documentElement;
	const tatCa = [...main.getElementsByTagName("*")];
	const abs = tatCa.filter((e) => getComputedStyle(e).position === "absolute");
	const thoat = abs.filter((e) => e.offsetParent === document.body);
	const shell = main.querySelector(":scope > [data-slot=page-shell]");
	const thamDo = document.createElement("span");
	thamDo.className = "sr-only";
	thamDo.textContent = "vckc";
	shell.append(thamDo);
	const cu = main.style.position;
	main.style.position = "static";
	const batDuoc =
		getComputedStyle(thamDo).position === "absolute" &&
		thamDo.offsetParent === document.body;
	main.style.position = cu;
	thamDo.remove();
	const mau = thoat[0];
	return {
		k: abs.length,
		thoat: thoat.length,
		mau: mau
			? `${mau.tagName.toLowerCase()} «${(mau.textContent ?? "").trim().slice(0, 40)}»`
			: "",
		doc: de.scrollHeight - de.clientHeight,
		ngang: de.scrollWidth - de.clientWidth,
		coDinh: tatCa.filter((e) => getComputedStyle(e).position === "fixed")
			.length,
		doiChung: batDuoc,
	};
}

function chenDem(heSo, dayNgang) {
	const main = document.querySelector("main[data-slot=page-shell-scroll]");
	const shell = main.querySelector(":scope > [data-slot=page-shell]");
	const dem = document.createElement("div");
	dem.dataset.vckc = "dem";
	dem.style.height = `${heSo * window.innerHeight}px`;
	dem.style.flexShrink = "0";
	const duoi = document.createElement("div");
	duoi.dataset.vckc = "duoi";
	duoi.style.flexShrink = "0";
	const thamDo = document.createElement("span");
	thamDo.className = "sr-only";
	thamDo.textContent = "vckc";
	thamDo.style.marginLeft = dayNgang;
	duoi.append(thamDo);
	shell.prepend(dem);
	shell.append(duoi);
	return main.contains(dem) && main.contains(thamDo);
}

function goDem() {
	for (const e of document.querySelectorAll("[data-vckc]")) e.remove();
	const main = document.querySelector("main[data-slot=page-shell-scroll]");
	main.style.position = "";
	main.scrollTop = 0;
	main.scrollLeft = 0;
	window.scrollTo(0, 0);
}

function tranTaiLieu() {
	const de = document.documentElement;
	return {
		doc: de.scrollHeight - de.clientHeight,
		ngang: de.scrollWidth - de.clientWidth,
	};
}

function datKhoiChua(tat) {
	document.querySelector("main[data-slot=page-shell-scroll]").style.position =
		tat ? "static" : "";
}

async function haiKhung(p) {
	await p.evaluate(
		() =>
			new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
	);
}

async function doDem(p, nhan) {
	const trong = await p.evaluate(chenDem, HE_SO_DEM, DAY_NGANG);
	if (!trong) khongDo(`${nhan}: tham do ngoai main`);
	await haiKhung(p);
	const that = await p.evaluate(tranTaiLieu);
	await p.evaluate(datKhoiChua, true);
	await haiKhung(p);
	const tat = await p.evaluate(tranTaiLieu);
	await p.evaluate(datKhoiChua, false);
	await haiKhung(p);
	if (!(tat.doc > 0 && tat.ngang > 0))
		khongDo(
			`doi chung khong do duoc o ${nhan}: tat khoi chua ma document tran doc ${tat.doc}px, ngang ${tat.ngang}px`,
		);
	return that;
}

async function lanToiCuoi(p) {
	const hop = await p.evaluate(() => {
		const r = document
			.querySelector("main[data-slot=page-shell-scroll]")
			.getBoundingClientRect();
		return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
	});
	await p.mouse.move(hop.x, hop.y);
	const cuon = () =>
		p.evaluate(
			() =>
				document.querySelector("main[data-slot=page-shell-scroll]").scrollTop,
		);
	let truoc = -1;
	for (let i = 0; i < SO_NAC_TOI_DA; i += 1) {
		await p.mouse.wheel({ deltaY: NAC_PX });
		await new Promise((r) => setTimeout(r, CHO_NAC_MS));
		const nay = await cuon();
		if (nay === truoc) break;
		truoc = nay;
	}
	for (let i = 0; i < NAC_THEM; i += 1) {
		await p.mouse.wheel({ deltaY: NAC_PX });
		await new Promise((r) => setTimeout(r, CHO_NAC_MS));
	}
	return p.evaluate(() => {
		const dau = [...document.querySelectorAll("header")].find(
			(h) => !h.closest("main"),
		);
		return {
			cuonMain: document.querySelector("main[data-slot=page-shell-scroll]")
				.scrollTop,
			scrollY: Math.round(window.scrollY),
			dauTop: dau ? Math.round(dau.getBoundingClientRect().top) : null,
		};
	});
}

async function doLan(p, nhan, anh) {
	const r = await lanToiCuoi(p);
	if (r.dauTop === null)
		khongDo(`${nhan}: khong thay header cua khung ung dung`);
	if (!(r.cuonMain > 0)) khongDo(`khong lan duoc main o ${nhan}`);
	if (anh) await p.screenshot({ path: join(RA, `${anh}-cuoi.png`) });
	return r;
}

async function chupDoiChung(p, anh) {
	await p.evaluate(() => {
		document.querySelector("main[data-slot=page-shell-scroll]").scrollTop = 0;
		window.scrollTo(0, 0);
	});
	await p.evaluate(datKhoiChua, true);
	await haiKhung(p);
	await p.evaluate(() => {
		const main = document.querySelector("main[data-slot=page-shell-scroll]");
		main.scrollTop = main.scrollHeight;
	});
	await haiKhung(p);
	await p.mouse.wheel({ deltaY: NAC_ANH_PX });
	await new Promise((r) => setTimeout(r, CHO_ANH_MS));
	await p.screenshot({ path: join(RA, `${anh}-doi-chung.png`) });
	await p.evaluate(datKhoiChua, false);
}

function doToaDo(lech) {
	const main = document.querySelector("main[data-slot=page-shell-scroll]");
	const shell = main.querySelector(":scope > [data-slot=page-shell]");
	const coToaDo = (e) => {
		const a = e.getBoundingClientRect();
		const cu = e.style.cssText;
		for (const k of ["top", "right", "bottom", "left"])
			e.style.setProperty(k, "auto", "important");
		const b = e.getBoundingClientRect();
		e.style.cssText = cu;
		return (
			Math.max(
				Math.abs(a.left - b.left),
				Math.abs(a.top - b.top),
				Math.abs(a.width - b.width),
				Math.abs(a.height - b.height),
			) > lech
		);
	};
	const thamDo = document.createElement("span");
	thamDo.style.cssText = "position:absolute;top:0;right:0;width:1px;height:1px";
	shell.prepend(thamDo);
	const batDuoc = coToaDo(thamDo);
	thamDo.remove();
	const xet = [...main.getElementsByTagName("*")].filter(
		(e) =>
			getComputedStyle(e).position === "absolute" && e.offsetParent === main,
	);
	const neo = xet.filter(coToaDo);
	const mau = neo[0];
	return {
		j: xet.length,
		neo: neo.length,
		mau: mau
			? `${mau.tagName.toLowerCase()}.${String(mau.className).slice(0, 40)}`
			: "",
		doiChung: batDuoc,
	};
}

function doHop(lech) {
	const main = document.querySelector("main[data-slot=page-shell-scroll]");
	main.scrollTop = 0;
	const tatCa = [...main.getElementsByTagName("*")];
	const lay = () =>
		tatCa.map((e) => {
			const r = e.getBoundingClientRect();
			return [r.left, r.top, r.width, r.height];
		});
	const a = lay();
	main.style.position = "static";
	const b = lay();
	main.style.position = "";
	let lechNhieu = 0;
	let mau = "";
	for (let i = 0; i < a.length; i += 1) {
		const d = Math.max(...a[i].map((v, k) => Math.abs(v - b[i][k])));
		if (d > lech) {
			lechNhieu += 1;
			if (!mau)
				mau = `${tatCa[i].tagName.toLowerCase()} lech ${d.toFixed(1)}px`;
		}
	}
	return { m: a.length, lech: lechNhieu, mau };
}

function nhanCuaO(yeuCau, mau) {
	const cuoi = mau.duong;
	const dau = cuoi.split("/").filter(Boolean)[0];
	if (dau === "sign-in" || dau === "onboarding")
		khongDo(`${yeuCau} ket thuc o ${cuoi} — phien hoac tien de hong`);
	if (cuoi !== yeuCau) return `chuyen-huong -> ${cuoi}`;
	if (!mau.main) return "khong-khung";
	return null;
}

function ghiTrongCho(bang, ac, kho, muc) {
	const k = `${ac}|${kho}`;
	if (!bang.has(k)) bang.set(k, []);
	if (muc) bang.get(k).push(muc);
}

async function doMotDuong(ctx, mau, duong, kq) {
	const t0 = Date.now();
	const p = await ctx.newPage();
	await p.setViewport({
		width: KHO[0].rong,
		height: KHO[0].cao,
		deviceScaleFactor: 1,
	});
	await p.goto(`${APP}${duong}`, { waitUntil: "load", timeout: CHO_MS });
	await p.evaluate(() => document.fonts.ready);
	for (const kho of KHO) {
		const nhanKho = `${kho.rong}x${kho.cao}`;
		const nhan = `${mau} ${nhanKho}`;
		await p.setViewport({
			width: kho.rong,
			height: kho.cao,
			deviceScaleFactor: 1,
		});
		const m = await choDungYen(p, nhan);
		let loai = nhanCuaO(duong, m);
		if (!loai) {
			const cuon = await p.evaluate(
				() =>
					getComputedStyle(
						document.querySelector("main[data-slot=page-shell-scroll]"),
					).overflowY,
			);
			loai = cuon === "hidden" ? "contained" : "do";
		}
		dong.push(`NHAN ${mau} ${nhanKho}: ${loai}`);
		kq.nhan.push({ mau, kho: nhanKho, loai });
		if (loai !== "do") continue;
		kq.soDo.set(nhanKho, (kq.soDo.get(nhanKho) ?? 0) + 1);
		const tn = await p.evaluate(doTuNhien);
		if (!tn.doiChung)
			khongDo(
				`doi chung AC-2 khong do duoc o ${nhan}: tat khoi chua ma bo chon khong bat duoc tham do`,
			);
		kq.k.set(nhanKho, (kq.k.get(nhanKho) ?? 0) + tn.k);
		kq.coDinh.set(nhanKho, (kq.coDinh.get(nhanKho) ?? 0) + tn.coDinh);
		ghiTrongCho(
			kq.loi,
			"AC-2",
			nhanKho,
			tn.thoat > 0 ? `${mau} (${tn.thoat}: ${tn.mau})` : null,
		);
		ghiTrongCho(
			kq.loi,
			"AC-3",
			nhanKho,
			tn.doc > 0 || tn.ngang > 0
				? `${mau} (doc ${tn.doc}, ngang ${tn.ngang})`
				: null,
		);
		const hop = await p.evaluate(doHop, LECH_PX);
		kq.m.set(nhanKho, (kq.m.get(nhanKho) ?? 0) + hop.m);
		ghiTrongCho(
			kq.loi,
			"AC-7",
			nhanKho,
			hop.lech > 0 ? `${mau} (${hop.lech}: ${hop.mau})` : null,
		);
		const td = await p.evaluate(doToaDo, LECH_PX);
		if (!td.doiChung)
			khongDo(
				`doi chung AC-6 khong do duoc o ${nhan}: bo do khong bat duoc tham do top:0 right:0`,
			);
		kq.j.set(nhanKho, (kq.j.get(nhanKho) ?? 0) + td.j);
		ghiTrongCho(
			kq.loi,
			"AC-6",
			nhanKho,
			td.neo > 0 ? `${mau} (${td.neo}: ${td.mau})` : null,
		);
		const dem = await doDem(p, nhan);
		ghiTrongCho(
			kq.loi,
			"AC-4",
			nhanKho,
			dem.doc > 0 || dem.ngang > 0
				? `${mau} (doc ${dem.doc}, ngang ${dem.ngang})`
				: null,
		);
		const anh = mau === TRANG_ANH ? `truong-${kho.rong}` : null;
		const lan = await doLan(p, nhan, anh);
		ghiTrongCho(
			kq.loi,
			"AC-5",
			nhanKho,
			lan.scrollY !== 0 || lan.dauTop !== 0
				? `${mau} (scrollY ${lan.scrollY}, dau trang top ${lan.dauTop})`
				: null,
		);
		if (anh) await chupDoiChung(p, anh);
		await p.evaluate(goDem);
		await haiKhung(p);
	}
	await p.close();
	dong.push(`THOI GIAN ${mau}: ${Date.now() - t0}ms`);
	if (Date.now() - batDau > NGAN_SACH_MS)
		khongDo(`vuot ngan sach ${NGAN_SACH_MS / 1000}s o ${mau}`);
}

function chamTheoKho(kq) {
	const TEN = {
		"AC-2": (n, kho) =>
			`trang do co phan tu absolute trong main lay body lam offsetParent (${kq.k.get(kho) ?? 0} phan tu absolute da xet)`,
		"AC-3": () => "trang do co document tran (doc <= 0, ngang <= 0)",
		"AC-4": () =>
			"trang do co document tran khi noi dung bi day duoi mep (doc <= 0, ngang <= 0)",
		"AC-5": () =>
			"trang do lam khung ung dung truot (scrollY 0, dau trang top 0)",
		"AC-6": (n, kho) =>
			`trang do co phan tu dat toa do ma khoi chua la main (${kq.j.get(kho) ?? 0} phan tu da xet)`,
		"AC-7": (n, kho) =>
			`trang co hop lech > ${LECH_PX}px khi doi khoi chua (${kq.m.get(kho) ?? 0} phan tu so)`,
	};
	for (const ac of Object.keys(TEN)) {
		for (const kho of KHO) {
			const nk = `${kho.rong}x${kho.cao}`;
			const n = kq.soDo.get(nk) ?? 0;
			const loi = kq.loi.get(`${ac}|${nk}`) ?? [];
			const cau = `${ac} ${nk}: ${loi.length}/${n} ${TEN[ac](n, nk)}`;
			kiem(loi.length ? `${cau} — ${loi.join(", ")}` : cau, loi.length === 0);
		}
	}
	for (const kho of KHO) {
		const nk = `${kho.rong}x${kho.cao}`;
		if ((kq.k.get(nk) ?? 0) === 0)
			khongDo(
				`AC-2 ${nk}: bo chon rong — 0 phan tu absolute tren moi trang do`,
			);
		const n = kq.soDo.get(nk) ?? 0;
		dong.push(
			`DUNG doi chung ${nk}: N/N = ${n}/${n} trang — AC-2 bat duoc tham do khi tat khoi chua, AC-4 tat khoi chua thi tran document ca doc lan ngang, AC-6 bo do bat duoc tham do dat toa do`,
		);
		dong.push(
			`GHI CHU ${nk}: ${kq.coDinh.get(nk) ?? 0} phan tu fixed trong main (khong cham)`,
		);
	}
}

function chamMaTran(kq, soTep) {
	const sai1 = kq.nhan.filter((o) =>
		o.mau in GHIM ? o.loai === "do" : o.loai !== "do",
	);
	const soDo = kq.nhan.filter((o) => o.loai === "do").length;
	const cau = `AC-1: ${soTep} tep x ${KHO.length} kho = ${kq.nhan.length} nhan (do ${soDo}, khac ${kq.nhan.length - soDo}, ngoai tap ghim ${sai1.length})`;
	const du = kq.nhan.length === soTep * KHO.length;
	kiem(
		sai1.length
			? `${cau} — ${sai1.map((o) => `${o.mau} ${o.kho} ${o.loai}`).join(", ")}`
			: cau,
		du && sai1.length === 0,
	);
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay")
		khongDo(
			`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
		);
	const quanTri = await db.user.findUnique({
		where: { email: QUAN_TRI },
		select: { id: true },
	});
	if (!quanTri) khongDo(`chua co ${QUAN_TRI} trong kho`);
	const maTran = maTranTuDia();
	const duongs = [];
	for (const mau of maTran)
		duongs.push({ mau, duong: await dienDoan(mau, quanTri.id) });
	const cookie = phien(QUAN_TRI);
	const slug = await suySlug(cookie);
	mkdirSync(RA, { recursive: true });
	const host = new URL(APP).hostname;
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const kq = {
		nhan: [],
		soDo: new Map(),
		loi: new Map(),
		k: new Map(),
		j: new Map(),
		m: new Map(),
		coDinh: new Map(),
	};
	for (const { mau, duong } of duongs) {
		await doMotDuong(ctx, mau, `/${slug}${duong === "/" ? "" : duong}`, kq);
	}
	chamMaTran(kq, maTran.length);
	chamTheoKho(kq);
}

let ma;
try {
	await chay();
	ma = sai === 0 ? 0 : 1;
} catch (loi) {
	dong.push(
		`KHONG DO DUOC: ${loi instanceof KhongDo ? loi.message : (loi?.stack ?? String(loi))}`,
	);
	ma = 2;
} finally {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	await db.$disconnect().catch(() => {});
}
dong.push(`THOI GIAN tong: ${Math.round((Date.now() - batDau) / 1000)}s`);
for (const d of dong) console.log(d);
console.log(`ANH ${relative(GOC, RA)}/`);
console.log(
	`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
