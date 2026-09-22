import puppeteer from "puppeteer-core";
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
const LE = 0.5;

const MAN = [
	{ ten: "deals", duong: "/deals" },
	{ ten: "companies", duong: "/companies" },
	{ ten: "contacts", duong: "/contacts" },
	{ ten: "campaigns", duong: "/campaigns" },
	{ ten: "members", duong: "/settings/members" },
];

const chiDoc = (() => {
	const chon = process.env.CHI_MAN;
	return chon ? MAN.filter((m) => chon.split(",").includes(m.ten)) : MAN;
})();
const CHI_TIET = process.env.CHI_TIET === "1";

function doTrenTrang(le) {
	const tieuDe = [...document.querySelectorAll("thead th")]
		.filter((th) => th.offsetWidth > 0 && th.textContent?.trim())
		.filter((th) => !th.querySelector(".sr-only") || th.textContent.trim() !== th.querySelector(".sr-only").textContent.trim())
		.map((th) => {
			const nhan = th.querySelector('[data-slot="table-head-label"], span.truncate, span.block');
			const nut = th.querySelector("button");
			const hinh = nut?.querySelector("svg") ?? null;
			const o = th.getBoundingClientRect();
			const h = hinh?.getBoundingClientRect() ?? null;
			const catNhan =
				nhan !== null && nhan.scrollWidth > nhan.clientWidth + le;
			const catO = th.scrollWidth > th.clientWidth + le;
			const hinhHien = h !== null && h.width > 0 && h.height > 0;
			const catHinh =
				hinhHien && (h.right > o.right + le || h.left < o.left - le);
			return {
				chu: th.textContent.trim(),
				docDuoc: nhan !== null,
				sapDuoc: nut !== null,
				rong: Math.round(o.width),
				dong: nhan ? Math.round(nhan.getBoundingClientRect().height / Number.parseFloat(getComputedStyle(nhan).lineHeight)) : 0,
				cao: Math.round(o.height),
				canNhan: nhan ? nhan.scrollWidth : 0,
				cat: catNhan || catO || catHinh,
				ly: [catNhan && "nhan", catO && "o", catHinh && "hinh"].filter(Boolean),
			};
		});
	const dau = document.querySelector("tbody tr");
	const oDau = dau ? [...dau.children].find((td) => !td.querySelector('[role="checkbox"]') && td.offsetWidth > 0) : null;
	const chuDau = oDau ? [...oDau.querySelectorAll("*")].find((el) => getComputedStyle(el).textOverflow === "ellipsis") : null;
	const khung = document.querySelector('[data-slot="table-container"]');
	return {
		hang: document.querySelectorAll("tbody tr").length,
		tran: document.documentElement.scrollWidth - innerWidth,
		cuonBang: khung ? khung.scrollWidth - khung.clientWidth : null,
		chuTen: chuDau
			? (() => {
					const c = chuDau.getBoundingClientRect();
					const t = oDau.getBoundingClientRect();
					const cs = getComputedStyle(oDau);
					const trai = Math.max(c.left, t.left + Number.parseFloat(cs.paddingLeft));
					const phai = Math.min(c.right, t.right - Number.parseFloat(cs.paddingRight));
					return Math.round(Math.max(0, phai - trai));
				})()
			: null,
		tieuDe,
	};
}

async function moTrang(trinhDuyet, cookie, slug, man, tieng, rong) {
	const trang = await trinhDuyet.newPage();
	await trang.setViewport({ width: rong, height: CAO, deviceScaleFactor: 1 });
	const host = new URL(APP).hostname;
	await trinhDuyet.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: tieng, domain: host, path: "/" },
	);
	const doi = `/${slug}${man.duong}`;
	await trang.goto(`${APP}${doi}`, { waitUntil: "load", timeout: CHO_TAI });
	const duong = new URL(trang.url());
	if (duong.pathname !== doi) {
		await khongDo(
			`KHONG DO DUOC: ${doi} ve ${duong.pathname}, khong phai man can do.`,
		);
	}
	await trang
		.waitForFunction(
			() => document.querySelectorAll("tbody tr td").length > 1,
			{ timeout: CHO_HANG_MS },
		)
		.catch(() => null);
	await trang.evaluate(() => document.fonts.ready);
	await new Promise((r) => setTimeout(r, 300));
	const d = await trang.evaluate(doTrenTrang, LE);
	await trang.close();
	return d;
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

const hong = [];
for (const man of chiDoc) {
	for (const tieng of TIENG) {
		for (const rong of KHO) {
			const d = await moTrang(trinhDuyet, cookie, slug, man, tieng, rong);
			const o = `${man.ten}@${rong}/${tieng}`;
			if (d.hang === 0) await khongDo(`KHONG DO DUOC: ${o} bang khong co hang`);
			const cat = d.tieuDe.filter((t) => t.cat);
			if (d.tran > 0) hong.push(`${o} tran ngang ${d.tran}px`);
			for (const t of cat) hong.push(`${o} tieu de bi cat: ${t.chu} (${t.ly.join("+")}, o ${t.rong}px, nhan ${t.canNhan}px)`);
			console.log(
				`${cat.length === 0 && d.tran <= 0 ? "dat " : "HONG"} ${o} cot=${d.tieuDe.length} cuonBang=${d.cuonBang} chuTen=${d.chuTen}`,
			);
			if (CHI_TIET)
				console.log(
					`     ${d.tieuDe.map((t) => `${t.chu}:${t.rong}/${t.canNhan}${t.dong > 1 ? `x${t.dong}` : ""}${t.cat ? "!" : ""}`).join(" | ")}`,
				);
		}
	}
}
for (const l of hong) console.log(`HONG: ${l}`);
await ket(hong.length === 0 ? 0 : 1);
