import puppeteer from "puppeteer-core";
import { onboardingMessages } from "../../../apps/app/lib/messages/onboarding.ts";
import { dealMessages } from "../../../apps/app/lib/messages/deals.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	APP,
	CHROME,
	CHO_TAI,
	datTrinhDuyet,
	ket,
	khongDo,
	phien,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

const KHO = [320, 375, 768, 1024, 1440];
const TIENG = ["vi", "en"];
const CAO = 900;
const CHO_HANG_MS = 20000;
const KHO_SM = 640;
const O_MONG = 30;
const KY_MONG = 70;
const SO_COT_HEP = 3;

const MAN = [
	{
		ten: "onboarding-bang",
		duong: "/onboarding?cachXem=bang",
		coBang: true,
		nut: (t) => onboardingMessages(t).tao.keHoach.toolbar,
	},
	{
		ten: "onboarding-bang-cot",
		duong: "/onboarding?cachXem=bang-cot",
		coBang: false,
		nut: (t) => onboardingMessages(t).tao.keHoach.toolbar,
	},
	{
		ten: "deals",
		duong: "/deals",
		coBang: true,
		boQuaTieuDe: true,
		nut: (t) => dealMessages(t).create.newButton,
	},
];

const chiDoc = (() => {
	const chon = process.env.CHI_MAN;
	if (chon && process.env.DUOI_CONG) {
		console.log("KHONG DO DUOC: CHI_MAN khong dung duoc duoi cong — ma tran phai du 30 o");
		process.exit(2);
	}
	return chon ? MAN.filter((m) => chon.split(",").includes(m.ten)) : MAN;
})();

function doTrenTrang(nhanNut, coBang) {
	const hien = (el) => {
		if (!el) return false;
		const r = el.getBoundingClientRect();
		const s = getComputedStyle(el);
		return (
			r.width > 0 &&
			r.height > 0 &&
			s.visibility !== "hidden" &&
			s.display !== "none" &&
			r.right <= innerWidth + 0.5 &&
			r.bottom > 0
		);
	};
	const vung = document.querySelector('[data-slot="page-shell-actions"]');
	const nut = vung
		? [...vung.querySelectorAll("button")].find(
				(b) => b.textContent?.trim() === nhanNut,
			)
		: null;
	const tieuDe = coBang
		? [...document.querySelectorAll("thead th")]
				.filter((th) => th.offsetWidth > 0 && th.textContent?.trim())
				.map((th) => {
					const nhan = th.querySelector("span.truncate, span.block");
					return {
						chu: th.textContent.trim(),
						docDuoc: nhan !== null,
						cat:
							th.scrollWidth > th.clientWidth + 0.5 ||
							(nhan !== null && nhan.scrollWidth > nhan.clientWidth + 0.5),
					};
				})
		: [];
	return {
		hang: document.querySelectorAll("tbody tr").length,
		tran: document.documentElement.scrollWidth - innerWidth,
		nut: {
			coVung: vung !== null,
			co: nut !== null && nut !== undefined,
			hien: hien(nut),
			bienThe: nut?.getAttribute("data-variant") ?? null,
			bieuTuong: Boolean(nut) && nut.querySelector("svg") !== null,
		},
		tieuDe,
	};
}

async function moTrang(trinhDuyet, cookie, slug, man, tieng, rong) {
	const trang = await trinhDuyet.newPage();
	await trang.setViewport({ width: rong, height: CAO, deviceScaleFactor: 1 });
	await trinhDuyet.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: "localhost", path: "/" },
		{ name: "lang", value: tieng, domain: "localhost", path: "/" },
	);
	const doi = `/${slug}${man.duong}`;
	await trang.goto(`${APP}${doi}`, { waitUntil: "load", timeout: CHO_TAI });
	const duong = new URL(trang.url());
	if (`${duong.pathname}` !== doi.split("?")[0]) {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — ${doi} ve ${duong.pathname}, khong phai man can do.`,
		);
	}
	await trang
		.waitForFunction(
			(coBang) =>
				coBang
					? document.querySelectorAll("tbody tr td").length > 1
					: document.querySelector('[data-trang-thai="ST-bangcot-codulieu"]') !==
						null,
			{ timeout: CHO_HANG_MS },
			man.coBang,
		)
		.catch(() => null);
	await new Promise((r) => setTimeout(r, 400));
	const ket = await trang.evaluate(doTrenTrang, man.nut(tieng), man.coBang);
	await trang.close();
	return ket;
}

function cham(man, tieng, rong, d) {
	const o = `${man.ten}@${rong}/${tieng}`;
	const loi = [];
	let khang = 0;
	if (man.coBang && d.hang === 0) {
		return { tienDe: `${o}: bang khong co hang nao — du lieu chua gieo` };
	}
	khang += 1;
	if (d.tran > 0) loi.push(`${o} tran ngang ${d.tran}px`);
	khang += 1;
	const n = d.nut;
	if (!(n.coVung && n.co && n.hien && n.bienThe === "default" && n.bieuTuong)) {
		loi.push(
			`${o} nut tao "${man.nut(tieng)}" khong o dau trang: vung=${n.coVung} co=${n.co} hien=${n.hien} bienThe=${n.bienThe} bieuTuong=${n.bieuTuong}`,
		);
	}
	if (man.coBang && !man.boQuaTieuDe) {
		khang += 1;
		const cat = d.tieuDe.filter((t) => t.cat).map((t) => t.chu);
		if (d.tieuDe.length === 0) loi.push(`${o} khong doc duoc tieu de cot nao`);
		for (const t of d.tieuDe.filter((x) => !x.docDuoc)) {
			loi.push(`${o} khong doc duoc nhan: ${t.chu}`);
		}
		if (cat.length > 0) loi.push(`${o} tieu de bi cat: ${cat.join(", ")}`);
		if (rong < KHO_SM && d.tieuDe.length !== SO_COT_HEP) {
			loi.push(
				`${o} duoi ${KHO_SM}px hien ${d.tieuDe.length} cot, mong ${SO_COT_HEP}: ${d.tieuDe.map((t) => t.chu).join(", ")}`,
			);
		}
	}
	return { khang, loi };
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

let tongKhang = 0;
let tongO = 0;
const hong = [];
for (const man of chiDoc) {
	for (const tieng of TIENG) {
		for (const rong of KHO) {
			const d = await moTrang(trinhDuyet, cookie, slug, man, tieng, rong);
			const c = cham(man, tieng, rong, d);
			if (c.tienDe) await khongDo(`KHONG DO DUOC: ${c.tienDe}`);
			tongO += 1;
			tongKhang += c.khang;
			hong.push(...c.loi);
			console.log(
				`${c.loi.length === 0 ? "dat " : "HONG"} ${man.ten}@${rong}/${tieng}`,
			);
		}
	}
}

const ky = chiDoc.reduce(
	(s, m) =>
		s + TIENG.length * KHO.length * (m.coBang && !m.boQuaTieuDe ? 3 : 2),
	0,
);
console.log(`o=${tongO} khang-dinh=${tongKhang}/${ky}`);
const duMaTran = chiDoc.length === MAN.length;
if (duMaTran && (tongO !== O_MONG || ky !== KY_MONG)) {
	console.log(
		`KHONG DO DUOC: ma tran lech ban khai — o=${tongO}/${O_MONG} khang-dinh=${ky}/${KY_MONG}`,
	);
	await ket(2);
}
if (tongKhang !== ky) {
	console.log(`KHONG DO DUOC: dem khang dinh ${tongKhang} khac ma tran ${ky}`);
	await ket(2);
}
for (const l of hong) console.log(`HONG: ${l}`);
await ket(hong.length === 0 ? 0 : 1);
