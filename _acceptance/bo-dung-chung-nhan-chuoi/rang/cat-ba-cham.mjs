import puppeteer from "puppeteer-core";
import { dealMessages } from "../../../apps/app/lib/messages/deals.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	APP,
	CHO_TAI,
	CHROME,
	datTrinhDuyet,
	ket,
	khongDo,
	phien,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

const KHO = 768;
const TIENG = ["vi", "en"];
const CAO = 900;
const CHO_HANG_MS = 20000;
const LE = 0.5;
const LAP_CHU = 8;
const DONG_CAT = "2";
const KY_MONG = 4;

async function moTrang(trinhDuyet, cookie, slug, tieng) {
	const trang = await trinhDuyet.newPage();
	await trang.setViewport({ width: KHO, height: CAO, deviceScaleFactor: 1 });
	const host = new URL(APP).hostname;
	await trinhDuyet.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: tieng, domain: host, path: "/" },
	);
	const doi = `/${slug}/deals`;
	await trang.goto(`${APP}${doi}`, { waitUntil: "load", timeout: CHO_TAI });
	if (new URL(trang.url()).pathname !== doi)
		await khongDo(
			`KHONG DO DUOC: ${doi} ve ${new URL(trang.url()).pathname}, khong phai man can do.`,
		);
	const hienRa = await trang
		.waitForFunction(
			() => {
				const khung = document.querySelector('[data-slot="table-container"]');
				return (
					khung !== null &&
					khung.getBoundingClientRect().width > 0 &&
					document.querySelectorAll("tbody tr td").length > 1
				);
			},
			{ timeout: CHO_HANG_MS },
		)
		.then(() => true)
		.catch(() => false);
	if (!hienRa)
		await khongDo(
			`KHONG DO DUOC: ${doi} kho ${KHO} tieng ${tieng} — bang chua hien ra sau ${CHO_HANG_MS}ms.`,
		);
	await trang.evaluate(() => document.fonts.ready);
	return trang;
}

function doCat(nhanGoc, lap, le) {
	const th = [...document.querySelectorAll("thead th")].find(
		(x) =>
			x.querySelector('[data-slot="table-head-label"]')?.textContent?.trim() ===
			nhanGoc,
	);
	if (!th) return null;
	const nhan = th.querySelector('[data-slot="table-head-label"]');
	const nut = [...nhan.childNodes].find(
		(n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim() === nhanGoc,
	);
	if (!nut) return null;
	nut.textContent = Array(lap).fill(nhanGoc).join(" ");
	const kieu = getComputedStyle(nhan);
	return {
		title: th.getAttribute("title"),
		cat: nhan.scrollHeight > nhan.clientHeight + le,
		kep: kieu.webkitLineClamp || kieu.getPropertyValue("-webkit-line-clamp"),
		tran: kieu.overflow,
		cao: Math.round(nhan.clientHeight),
		caoCan: Math.round(nhan.scrollHeight),
	};
}

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

const cookie = phien();
const slug = await suySlug(cookie);
const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
datTrinhDuyet(trinhDuyet);

let khang = 0;
const hong = [];
for (const tieng of TIENG) {
	const o = `deals@${KHO}/${tieng}`;
	const nhanGoc = dealMessages(tieng).headers.owner;
	const trang = await moTrang(trinhDuyet, cookie, slug, tieng);
	const d = await trang.evaluate(doCat, nhanGoc, LAP_CHU, LE);
	await trang.close();
	if (d === null)
		await khongDo(`KHONG DO DUOC: ${o} khong tim thay tieu de «${nhanGoc}»`);
	khang += 1;
	if (!(d.cat && d.kep === DONG_CAT && d.tran === "hidden"))
		hong.push(
			`${o} tieu de dai khong cat bang dau ba cham: cat=${d.cat} line-clamp=${d.kep || "none"} overflow=${d.tran} cao ${d.cao}/${d.caoCan}px`,
		);
	khang += 1;
	if (d.title !== nhanGoc)
		hong.push(`${o} title cua o tieu de la «${d.title}», mong «${nhanGoc}»`);
	console.log(
		`${hong.some((h) => h.startsWith(o)) ? "HONG" : "dat "} ${o} cat=${d.cat} line-clamp=${d.kep} title=«${d.title}»`,
	);
}
console.log(`khang-dinh=${khang}/${KY_MONG}`);
if (khang !== KY_MONG) {
	console.log(`KHONG DO DUOC: dem khang dinh ${khang} khac ${KY_MONG}`);
	await ket(2);
}
for (const l of hong) console.log(`HONG: ${l}`);
await ket(hong.length === 0 ? 0 : 1);
