import { randomUUID } from "node:crypto";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	API,
	APP,
	CHO_TAI,
	CHROME,
	datTrinhDuyet,
	ket,
	khongDo,
	mu,
	phien,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "thanh-ben-khu-dung-chung";
const BANG_CHUNG = join(GOC, ".acceptance-runs", HO_SO, "evidence");
const BANG_CHUNG_HO_SO = join(GOC, "_acceptance", HO_SO, "evidence");
const DO = {
	beRong: 224,
	beRongPha: 230,
	soCuoc: 8,
	choHydrateMs: 1200,
	lech: 0.5,
	kho: [
		{ rong: 1280, cao: 800 },
		{ rong: 375, cao: 812 },
	],
	mayTinhTu: 768,
	tranPha: "1200px",
	cuocDaiPx: 3000,
};
const KIEU = [
	"fontSize",
	"fontWeight",
	"letterSpacing",
	"textTransform",
	"color",
];

const PHA = process.env.TBK_PHA ?? "";
if (!["", "rong", "tran", "cuon"].includes(PHA)) {
	console.log(
		`KHONG DO DUOC: TBK_PHA=${PHA} la; chi nhan "rong", "tran" hoac "cuon"`,
	);
	process.exit(2);
}
const beRongMong = PHA === "rong" ? DO.beRongPha : DO.beRong;

const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();
if (!isMeasureDatabase(tenKho))
	await khongDo(
		`KHONG DO DUOC: can mot phien do (kho _do) — kho "${tenKho}". Chay qua scripts/lan-do/tien-de.mjs`,
	);

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

const cookie = phien();
const slug = await suySlug(cookie);

async function taoCuoc(i) {
	const res = await fetch(`${API}/api/trpc/conversations.createBuilder`, {
		method: "POST",
		redirect: "manual",
		headers: { ...mu(cookie, "vi"), "content-type": "application/json" },
		body: JSON.stringify({
			clientRequestId: randomUUID(),
			message: `Do thanh ben khu ${i + 1}`,
		}),
	});
	const chu = await res.text();
	if (!res.ok)
		await khongDo(
			`KHONG DO DUOC: conversations.createBuilder tra ${res.status}: ${chu.slice(0, 200)}`,
		);
	return JSON.parse(chu).result.data.id;
}

const cuoc = [];
for (let i = 0; i < DO.soCuoc; i += 1) cuoc.push(await taoCuoc(i));
console.log(
	`gieo ${cuoc.length} cuoc hoi thoai qua conversations.createBuilder`,
);

mkdirSync(BANG_CHUNG, { recursive: true });
mkdirSync(BANG_CHUNG_HO_SO, { recursive: true });

const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
datTrinhDuyet(trinhDuyet);
const host = new URL(APP).hostname;
const trang = await trinhDuyet.newPage();
await trang.setCookie(
	{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	{ name: "lang", value: "vi", domain: host, path: "/" },
);

const KHU = [
	{ ten: "cai-dat", duong: `/${slug}/settings` },
	{ ten: "hoi-thoai", duong: `/${slug}/chat/${cuoc[0]}` },
];

let dung = 0;
const sai = [];
const nhanTheoKhu = {};

function bao(dat, dongDung, dongSai) {
	if (dat) {
		dung += 1;
		console.log(dongDung);
	} else {
		sai.push(dongSai);
		console.log(dongSai);
	}
}

async function mo(duong) {
	await trang.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: CHO_TAI,
	});
	const dich = new URL(trang.url()).pathname;
	if (dich.startsWith("/sign-in") || dich.includes("/onboarding"))
		await khongDo(`KHONG DO DUOC: ${duong} bi day ve ${dich}`);
	await trang
		.waitForFunction(
			() =>
				document.querySelector("aside nav, [data-slot='nav-strip']") &&
				!document.querySelector("aside nav[aria-busy='true']"),
			{ timeout: CHO_TAI },
		)
		.catch(() => {});
	await new Promise((r) => setTimeout(r, DO.choHydrateMs));
}

async function doc(kieu) {
	return trang.evaluate((KIEU_) => {
		const hien = (el) =>
			!!el &&
			el.getClientRects().length > 0 &&
			getComputedStyle(el).visibility !== "hidden";
		const asides = [...document.querySelectorAll("aside")].filter(
			(a) => hien(a) && a.querySelector("nav, a"),
		);
		const aside = document.querySelector("aside[data-slot='area-sidebar']");
		const asideHien = hien(aside) ? aside : (asides[0] ?? null);
		const nhan = [
			...document.querySelectorAll("[data-slot='nav-group-label']"),
		].filter(hien);
		const kieuNhan = nhan[0]
			? Object.fromEntries(KIEU_.map((k) => [k, getComputedStyle(nhan[0])[k]]))
			: null;
		const strip =
			[...document.querySelectorAll("[data-slot='nav-strip']")].find(hien) ??
			null;
		const doc_ = document.documentElement;
		const dongHoiThoai = asideHien
			? [...asideHien.querySelectorAll("a[href*='/chat/']")].filter((a) => {
					const r = a.getBoundingClientRect();
					return hien(a) && r.bottom <= window.innerHeight && r.top >= 0;
				}).length
			: 0;
		return {
			asideRong: asideHien ? asideHien.getBoundingClientRect().width : null,
			asideCoSlot:
				!!asideHien && asideHien.getAttribute("data-slot") === "area-sidebar",
			soNhan: nhan.length,
			kieuNhan,
			strip: strip
				? {
						cuon: strip.scrollWidth > strip.clientWidth,
						so: strip.querySelectorAll("a").length,
					}
				: null,
			tran: doc_.scrollWidth - doc_.clientWidth,
			dongHoiThoai,
		};
	}, kieu);
}

for (const khu of KHU) {
	for (const kho of DO.kho) {
		await trang.setViewport({ width: kho.rong, height: kho.cao });
		await mo(khu.duong);
		if (PHA === "tran" && khu.ten === "hoi-thoai")
			await trang.evaluate((w) => {
				for (const s of document.querySelectorAll("[data-slot='nav-strip']"))
					s.style.minWidth = w;
			}, DO.tranPha);
		const d = await doc(KIEU);
		const anh = `${khu.ten}-${kho.rong}.png`;
		await trang.screenshot({ path: join(BANG_CHUNG, anh) });
		copyFileSync(join(BANG_CHUNG, anh), join(BANG_CHUNG_HO_SO, anh));
		const nhan = `${khu.ten} ${kho.rong}`;

		if (kho.rong >= DO.mayTinhTu) {
			const rongDung =
				d.asideRong !== null && Math.abs(d.asideRong - beRongMong) <= DO.lech;
			bao(
				rongDung && d.asideCoSlot,
				`DUNG AC-8 ${nhan}: aside ${d.asideRong}px (area-sidebar)`,
				`SAI AC-8 ${nhan}: aside ${d.asideRong ?? "khong thay"}px${d.asideCoSlot ? "" : " khong phai area-sidebar"} (mong ${beRongMong}px)`,
			);
			bao(
				d.soNhan > 0 && d.kieuNhan !== null,
				`DUNG AC-8 ${nhan}: ${d.soNhan} nhan nhom ${KIEU.map((k) => d.kieuNhan[k]).join("/")}`,
				`SAI AC-8 ${nhan}: 0 nhan nhom [data-slot=nav-group-label] hien`,
			);
			bao(
				d.strip === null,
				`DUNG AC-8 ${nhan}: hang ngang an`,
				`SAI AC-8 ${nhan}: hang ngang hien o may tinh`,
			);
			nhanTheoKhu[khu.ten] = d.kieuNhan;
			if (khu.ten === "hoi-thoai")
				console.log(
					`GHI CHU AC-8 ${nhan}: ${d.dongHoiThoai} dong hoi thoai thay duoc trong khung nhin`,
				);
		} else {
			bao(
				d.asideRong === null,
				`DUNG AC-8 ${nhan}: aside an`,
				`SAI AC-8 ${nhan}: aside hien ${d.asideRong}px o dien thoai`,
			);
			bao(
				d.soNhan === 0,
				`DUNG AC-8 ${nhan}: 0 nhan nhom hien`,
				`SAI AC-8 ${nhan}: ${d.soNhan} nhan nhom hien o dien thoai`,
			);
			const canCuon = khu.ten === "hoi-thoai";
			const stripDat = d.strip !== null && (!canCuon || d.strip.cuon);
			bao(
				stripDat,
				`DUNG AC-8 ${nhan}: hang ngang hien (${d.strip?.cuon ? "cuon" : "vua khung"}, ${d.strip?.so} muc)`,
				`SAI AC-8 ${nhan}: ${d.strip === null ? "khong thay hang ngang" : `hang ngang ${d.strip.so} muc khong cuon`}`,
			);
			bao(
				d.tran <= 0,
				`DUNG AC-8 ${nhan}: tran ngang 0`,
				`SAI AC-8 ${nhan}: tran ngang ${d.tran}px`,
			);
		}
	}
}

await trang.setViewport({ width: 375, height: 812 });
await mo(KHU[1].duong);
if (PHA === "cuon")
	await trang.evaluate(() => {
		const vo = document.querySelector("[data-slot='area-sidebar-strip'] ~ div");
		if (vo) vo.style.minHeight = "auto";
	});
const dai = await trang.evaluate(async (caoPx) => {
	const noiDung = document.querySelector(
		"[data-slot='message-scroller-content']",
	);
	const vung = document.querySelector(
		"[data-slot='message-scroller-viewport']",
	);
	const oSoan = document.querySelector("main [role='textbox'], main textarea");
	if (!noiDung || !vung || !oSoan) return null;
	const dem = document.createElement("div");
	dem.style.height = `${caoPx}px`;
	noiDung.appendChild(dem);
	await new Promise((r) =>
		requestAnimationFrame(() => requestAnimationFrame(r)),
	);
	const doc_ = document.documentElement;
	return {
		cuon: vung.scrollHeight > vung.clientHeight,
		sh: vung.scrollHeight,
		ch: vung.clientHeight,
		dayVung: Math.round(vung.getBoundingClientRect().bottom),
		daySoan: Math.round(oSoan.getBoundingClientRect().bottom),
		cao: window.innerHeight,
		tranDoc: doc_.scrollHeight - doc_.clientHeight,
	};
}, DO.cuocDaiPx);
if (dai === null)
	await khongDo(
		"KHONG DO DUOC: AC-11 khong thay vung tin hay o soan tren trang tro chuyen",
	);
await trang.screenshot({ path: join(BANG_CHUNG, "hoi-thoai-375-dai.png") });
copyFileSync(
	join(BANG_CHUNG, "hoi-thoai-375-dai.png"),
	join(BANG_CHUNG_HO_SO, "hoi-thoai-375-dai.png"),
);
{
	const lech = [];
	if (!dai.cuon) lech.push(`vung tin khong cuon (${dai.sh}/${dai.ch})`);
	if (dai.dayVung > dai.cao)
		lech.push(`day vung tin ${dai.dayVung}px > ${dai.cao}px`);
	if (dai.daySoan > dai.cao)
		lech.push(`day o soan ${dai.daySoan}px > ${dai.cao}px`);
	if (dai.tranDoc > 0) lech.push(`tran doc ${dai.tranDoc}px`);
	bao(
		lech.length === 0,
		`DUNG AC-11 hoi-thoai 375 cuoc dai: vung tin cuon (${dai.sh}/${dai.ch}), day vung tin ${dai.dayVung}px, day o soan ${dai.daySoan}px <= ${dai.cao}, tran doc 0`,
		`SAI AC-11 hoi-thoai 375 cuoc dai: ${lech.join(", ")}`,
	);
}

const a = nhanTheoKhu["cai-dat"];
const b = nhanTheoKhu["hoi-thoai"];
if (a && b) {
	const lech = KIEU.filter((k) => a[k] !== b[k]);
	bao(
		lech.length === 0,
		`DUNG AC-8 nhan nhom hai khu giong nhau: ${KIEU.map((k) => a[k]).join("/")}`,
		`SAI AC-8 nhan nhom hai khu khac nhau: ${lech.map((k) => `${k} ${a[k]}≠${b[k]}`).join(", ")}`,
	);
} else {
	bao(
		false,
		"",
		`SAI AC-8 nhan nhom hai khu: thieu nhan o ${a ? "hoi-thoai" : "cai-dat"}`,
	);
}

console.log(`anh: ${BANG_CHUNG_HO_SO}`);
console.log(`KET LUAN AC-8 AC-11: ${dung} DUNG, ${sai.length} SAI`);
await ket(sai.length === 0 ? 0 : 1);
