import puppeteer from "puppeteer-core";
import { dealsSearchParams } from "../../../apps/app/app/(app)/[slug]/deals/deals-search-params.ts";
import { campaignMessages } from "../../../apps/app/lib/messages/campaigns.ts";
import { companyMessages } from "../../../apps/app/lib/messages/companies.ts";
import { contactMessages } from "../../../apps/app/lib/messages/contacts.ts";
import { dealMessages } from "../../../apps/app/lib/messages/deals.ts";
import { thanhVienMessages } from "../../../apps/app/lib/messages/settings-thanh-vien.ts";
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

const KHO = [320, 375, 768, 1024, 1440];
const TIENG = ["vi", "en"];
const CAO = 900;
const CHO_HANG_MS = 20000;
const CHO_SAP_MS = 10000;
const LE = 0.5;
const SAN_MEP = 1.5;
const SAN_MUI_TEN = 6;
const SAN_CHU_TEN = 40;
const O_CHON_RONG = 40;
const O_CHON_LE = 1;
const CAO_TIEU_DE = 44;
const CAO_LE = 1;
const DONG_TOI_DA = 2;
const KHO_CO_O_CHON = [768, 1024, 1440];
const O_MONG = 50;
const KY_MONG = 276;
const CHIEU_ARIA = { asc: "ascending", desc: "descending" };
const CHIEU_DAU = CHIEU_ARIA[dealsSearchParams.config.defaultDir];
const CHIEU_SAU =
	CHIEU_ARIA[dealsSearchParams.config.defaultDir === "asc" ? "desc" : "asc"];

const NHAN = {
	deals: (t) => dealMessages(t).headers,
	companies: (t) => companyMessages(t).headers,
	contacts: (t) => contactMessages(t).headers,
	campaigns: (t) => campaignMessages(t).columns,
	members: (t) => thanhVienMessages(t).bang,
};

const COT_MONG = {
	deals: {
		320: ["name", "company", "stage"],
		375: ["name", "company", "stage"],
		768: ["name", "company", "stage", "amount", "owner"],
		1024: [
			"name",
			"company",
			"stage",
			"amount",
			"owner",
			"closeDate",
			"lastActivity",
		],
		1440: [
			"name",
			"company",
			"stage",
			"amount",
			"owner",
			"closeDate",
			"lastActivity",
		],
	},
	companies: {
		320: ["name"],
		375: ["name"],
		768: ["name", "domain", "owner", "openDeals", "lastActivity"],
		1024: [
			"name",
			"domain",
			"industry",
			"owner",
			"contacts",
			"openDeals",
			"lastActivity",
		],
		1440: [
			"name",
			"domain",
			"industry",
			"owner",
			"contacts",
			"openDeals",
			"lastActivity",
		],
	},
	contacts: {
		320: ["name", "company"],
		375: ["name", "company"],
		768: ["name", "email", "company", "owner", "lastActivity"],
		1024: ["name", "title", "email", "company", "owner", "lastActivity"],
		1440: ["name", "title", "email", "company", "owner", "lastActivity"],
	},
	campaigns: {
		320: ["name", "status", "answered"],
		375: ["name", "status", "answered"],
		768: ["name", "segment", "status", "called", "answered", "created"],
		1024: [
			"name",
			"segment",
			"status",
			"called",
			"answered",
			"owner",
			"created",
		],
		1440: [
			"name",
			"segment",
			"status",
			"called",
			"answered",
			"owner",
			"created",
		],
	},
	members: {
		320: ["ten", "vaiTro"],
		375: ["ten", "vaiTro"],
		768: ["ten", "email", "vaiTro"],
		1024: ["ten", "email", "vaiTro", "thamGia"],
		1440: ["ten", "email", "vaiTro", "thamGia"],
	},
};

const MAN = [
	{ ten: "deals", duong: "/deals", oChon: true },
	{ ten: "companies", duong: "/companies", oChon: true },
	{ ten: "contacts", duong: "/contacts", oChon: true },
	{ ten: "campaigns", duong: "/campaigns", oChon: false },
	{ ten: "members", duong: "/settings/members", oChon: false },
];

const chiDoc = (() => {
	const chon = process.env.CHI_MAN;
	if (chon && process.env.DUOI_CONG) {
		console.log(
			"KHONG DO DUOC: CHI_MAN khong dung duoc duoi cong — ma tran phai du 50 o",
		);
		process.exit(2);
	}
	return chon ? MAN.filter((m) => chon.split(",").includes(m.ten)) : MAN;
})();
const CHI_TIET = process.env.CHI_TIET === "1";

function doTrenTrang(le) {
	const hopChu = (el) => {
		const di = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
		const hop = [];
		for (let nut = di.nextNode(); nut !== null; nut = di.nextNode()) {
			if (!nut.textContent.trim()) continue;
			const r = document.createRange();
			r.selectNodeContents(nut);
			hop.push(
				...[...r.getClientRects()].filter((x) => x.width > 0 && x.height > 0),
			);
		}
		return hop.length > 0 ? hop : null;
	};
	const hien = (el) => {
		if (!el) return false;
		const r = el.getBoundingClientRect();
		return r.width > 0 && r.height > 0;
	};
	const oThan = [...(document.querySelector("tbody tr")?.children ?? [])];
	const tieuDe = [...document.querySelectorAll("thead th")]
		.map((th, i) => ({ th, i }))
		.filter(({ th }) => th.offsetWidth > 0)
		.map(({ th, i }) => {
			const nhan = th.querySelector('[data-slot="table-head-label"]');
			const oChon = th.querySelector('[role="checkbox"]') !== null;
			const sr = th.querySelector(".sr-only");
			const srOnly =
				sr !== null &&
				(nhan === null || nhan.textContent.trim() === sr.textContent.trim());
			const nut = th.querySelector("button");
			const hinh = nut?.querySelector("svg") ?? null;
			const o = th.getBoundingClientRect();
			const h = hien(hinh) ? hinh.getBoundingClientRect() : null;
			const nhanHop = nhan ? nhan.getBoundingClientRect() : null;
			const chuHop = nhan ? hopChu(nhan) : null;
			const td = oThan[i] ?? null;
			const tdHop = td ? td.getBoundingClientRect() : null;
			const tdKieu = td ? getComputedStyle(td) : null;
			const canPhai = getComputedStyle(th).textAlign === "right";
			let lechMep = null;
			if (nhan && chuHop && tdHop && tdKieu) {
				const chuTrai = Math.min(...chuHop.map((c) => c.left));
				const chuPhai = Math.max(...chuHop.map((c) => c.right));
				lechMep = canPhai
					? Math.abs(
							chuPhai - (tdHop.right - Number.parseFloat(tdKieu.paddingRight)),
						)
					: Math.abs(
							chuTrai - (tdHop.left + Number.parseFloat(tdKieu.paddingLeft)),
						);
			}
			let cachMuiTen = null;
			if (h && chuHop) {
				cachMuiTen = Math.min(
					...chuHop.map((c) => Math.max(h.left - c.right, c.left - h.right, 0)),
				);
			}
			const dong =
				nhan && nhanHop
					? Math.round(
							nhanHop.height /
								Number.parseFloat(getComputedStyle(nhan).lineHeight),
						)
					: 0;
			return {
				chu:
					srOnly || oChon
						? ""
						: (nhan?.textContent?.trim() ?? th.textContent.trim()),
				oChon,
				srOnly,
				docDuoc: nhan !== null,
				rong: Math.round(o.width),
				cao: Math.round(o.height),
				dong,
				canNhan: nhan ? nhan.scrollWidth : 0,
				catNgang: nhan !== null && nhan.scrollWidth > nhan.clientWidth + le,
				catDoc: nhan !== null && nhan.scrollHeight > nhan.clientHeight + le,
				hinhNgoai:
					h !== null && (h.right > o.right + le || h.left < o.left - le),
				cachMuiTen,
				lechMep,
				canPhai,
			};
		});
	const khung = document.querySelector('[data-slot="table-container"]');
	const oDau =
		oThan.find(
			(td) =>
				td.offsetWidth > 0 && td.querySelector('[role="checkbox"]') === null,
		) ?? null;
	const chuDau = oDau
		? [...oDau.querySelectorAll("*")].find(
				(el) => getComputedStyle(el).textOverflow === "ellipsis",
			)
		: null;
	let chuTen = null;
	if (chuDau && oDau) {
		const c = chuDau.getBoundingClientRect();
		const t = oDau.getBoundingClientRect();
		const cs = getComputedStyle(oDau);
		const trai = Math.max(c.left, t.left + Number.parseFloat(cs.paddingLeft));
		const phai = Math.min(
			c.right,
			t.right - Number.parseFloat(cs.paddingRight),
		);
		chuTen = Math.round(Math.max(0, phai - trai));
	}
	const oCatTrongThan = [...document.querySelectorAll("tbody td")].some(
		(td) => {
			const el = [...td.querySelectorAll("*")].find(
				(x) => getComputedStyle(x).textOverflow === "ellipsis",
			);
			if (!el) return false;
			const c = el.getBoundingClientRect();
			const t = td.getBoundingClientRect();
			const cs = getComputedStyle(td);
			return (
				el.scrollWidth > el.clientWidth + le &&
				c.right <= t.right - Number.parseFloat(cs.paddingRight) + le
			);
		},
	);
	return {
		hang: document.querySelectorAll("tbody tr").length,
		tran: document.documentElement.scrollWidth - innerWidth,
		cuonBang: khung ? khung.scrollWidth - khung.clientWidth : null,
		chuTen,
		oCatTrongThan,
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
			`KHONG DO DUOC: ${doi} kho ${rong} tieng ${tieng} — bang chua hien ra sau ${CHO_HANG_MS}ms (trang con dang stream, hoac khong co du lieu).`,
		);
	await trang.evaluate(() => document.fonts.ready);
	await trang.evaluate(
		() =>
			new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
	);
	return trang;
}

function cham(man, tieng, rong, d) {
	const o = `${man.ten}@${rong}/${tieng}`;
	const loi = [];
	let khang = 0;
	const bang = NHAN[man.ten](tieng);
	const mong = COT_MONG[man.ten][rong].map((k) => bang[k]);
	const cot = d.tieuDe.filter((t) => !t.oChon && !t.srOnly);
	const thay = cot.map((t) => t.chu);

	khang += 1;
	const thieu = mong.filter((x) => !thay.includes(x));
	const thua = thay.filter((x) => !mong.includes(x));
	if (thieu.length > 0) loi.push(`${o} thieu cot: ${thieu.join(", ")}`);
	if (thua.length > 0) loi.push(`${o} thua cot: ${thua.join(", ")}`);

	khang += 1;
	for (const t of cot) {
		if (!t.docDuoc) {
			loi.push(`${o} khong doc duoc nhan: ${t.chu}`);
			continue;
		}
		if (t.catNgang || t.catDoc || t.hinhNgoai)
			loi.push(
				`${o} tieu de bi cat: ${t.chu} (${[t.catNgang && "ngang", t.catDoc && "doc", t.hinhNgoai && "hinh"].filter(Boolean).join("+")}, o ${t.rong}px, nhan ${t.canNhan}px)`,
			);
		if (t.dong > DONG_TOI_DA)
			loi.push(
				`${o} tieu de ${t.chu} chiem ${t.dong} dong, toi da ${DONG_TOI_DA}`,
			);
		if (Math.abs(t.cao - CAO_TIEU_DE) > CAO_LE)
			loi.push(`${o} hang tieu de cao ${t.cao}px, mong ${CAO_TIEU_DE}`);
	}

	khang += 1;
	if (d.tran > 0) loi.push(`${o} tran ngang ${d.tran}px`);
	if (d.cuonBang > 0) loi.push(`${o} bang cuon ngang ${d.cuonBang}px`);

	khang += 1;
	for (const t of cot) {
		if (t.lechMep !== null && t.lechMep > SAN_MEP)
			loi.push(
				`${o} lech mep ${t.chu} ${t.lechMep.toFixed(1)}px, san ${SAN_MEP}`,
			);
		if (t.cachMuiTen !== null && t.cachMuiTen > SAN_MUI_TEN)
			loi.push(
				`${o} mui ten cach chu ${t.cachMuiTen.toFixed(1)}px o cot ${t.chu}, san ${SAN_MUI_TEN}`,
			);
	}

	if (man.oChon && KHO_CO_O_CHON.includes(rong)) {
		khang += 1;
		const oc = d.tieuDe.find((t) => t.oChon);
		if (!oc) loi.push(`${o} khong thay cot o chon`);
		else if (Math.abs(oc.rong - O_CHON_RONG) > O_CHON_LE)
			loi.push(`${o} o chon rong ${oc.rong}px, mong ${O_CHON_RONG}`);
	}

	khang += 1;
	if (d.chuTen === null) loi.push(`${o} khong thay phan tu cat chu o o ten`);
	else if (d.chuTen < SAN_CHU_TEN)
		loi.push(`${o} chu ten ${d.chuTen}px, san ${SAN_CHU_TEN}`);

	if (man.ten === "deals" && rong === 320) {
		khang += 1;
		if (!d.oCatTrongThan) loi.push(`${o} o than khong cat bang dau ba cham`);
	}

	return { khang, loi };
}

async function chamSap(trinhDuyet, cookie, slug, rong) {
	const o = `deals@${rong}/vi`;
	const loi = [];
	const trang = await moTrang(trinhDuyet, cookie, slug, MAN[0], "vi", rong);
	const nhan = dealMessages("vi").headers.company;
	const doc = () =>
		trang.evaluate((n) => {
			const th = [...document.querySelectorAll("thead th")].find(
				(x) =>
					x
						.querySelector('[data-slot="table-head-label"]')
						?.textContent?.trim() === n,
			);
			return th
				? {
						sort: th.getAttribute("aria-sort"),
						svg: th.querySelector("svg")?.outerHTML ?? null,
					}
				: null;
		}, nhan);
	const bam = () =>
		trang.evaluate((n) => {
			const th = [...document.querySelectorAll("thead th")].find(
				(x) =>
					x
						.querySelector('[data-slot="table-head-label"]')
						?.textContent?.trim() === n,
			);
			th?.querySelector("button")?.click();
		}, nhan);

	const s0 = await doc();
	if (s0 === null) {
		await trang.close();
		return { khang: 3, loi: [`${o} khong tim thay tieu de ${nhan}`] };
	}
	await bam();
	await trang
		.waitForFunction(
			() => new URL(location.href).searchParams.get("sort") === "company",
			{ timeout: CHO_SAP_MS },
		)
		.catch(() => null);
	const s1 = await doc();
	await bam();
	await trang
		.waitForFunction(
			(n, sau) =>
				[...document.querySelectorAll("thead th")]
					.find(
						(x) =>
							x
								.querySelector('[data-slot="table-head-label"]')
								?.textContent?.trim() === n,
					)
					?.getAttribute("aria-sort") === sau,
			{ timeout: CHO_SAP_MS },
			nhan,
			CHIEU_SAU,
		)
		.catch(() => null);
	const s2 = await doc();
	const url = new URL(trang.url());
	await trang.close();

	if (s1?.sort !== CHIEU_DAU)
		loi.push(
			`${o} bam ${nhan} lan mot: aria-sort=${s1?.sort}, mong ${CHIEU_DAU}`,
		);
	if (url.searchParams.get("sort") !== "company")
		loi.push(
			`${o} bam ${nhan}: duong dan mang sort=${url.searchParams.get("sort")}, mong company`,
		);
	if (s2?.sort !== CHIEU_SAU)
		loi.push(
			`${o} bam ${nhan} lan hai: aria-sort=${s2?.sort}, mong ${CHIEU_SAU}`,
		);
	if (s0.svg === s1?.svg || s1?.svg === s2?.svg || s0.svg === s2?.svg)
		loi.push(`${o} ${nhan} sap nhung mui ten khong doi giua ba luc`);
	return { khang: 3, loi };
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

let tongO = 0;
let tongKhang = 0;
const hong = [];
for (const man of chiDoc) {
	for (const tieng of TIENG) {
		for (const rong of KHO) {
			const trang = await moTrang(trinhDuyet, cookie, slug, man, tieng, rong);
			const d = await trang.evaluate(doTrenTrang, LE);
			await trang.close();
			if (d.hang === 0)
				await khongDo(
					`KHONG DO DUOC: ${man.ten}@${rong}/${tieng} bang khong co hang — du lieu chua gieo`,
				);
			const c = cham(man, tieng, rong, d);
			tongO += 1;
			tongKhang += c.khang;
			hong.push(...c.loi);
			const cot = d.tieuDe.filter((t) => !t.oChon && !t.srOnly);
			console.log(
				`${c.loi.length === 0 ? "dat " : "HONG"} ${man.ten}@${rong}/${tieng} cot=${cot.length} cuonBang=${d.cuonBang} chuTen=${d.chuTen}`,
			);
			if (CHI_TIET)
				console.log(
					`     ${cot.map((t) => `${t.chu}:${t.rong}/${t.canNhan}${t.dong > 1 ? `x${t.dong}` : ""}`).join(" | ")}`,
				);
		}
	}
}

if (chiDoc.length === MAN.length) {
	for (const rong of [375, 1024]) {
		const c = await chamSap(trinhDuyet, cookie, slug, rong);
		tongKhang += c.khang;
		hong.push(...c.loi);
		console.log(`${c.loi.length === 0 ? "dat " : "HONG"} sap deals@${rong}/vi`);
	}
}

console.log(`o=${tongO} khang-dinh=${tongKhang}/${KY_MONG}`);
if (
	chiDoc.length === MAN.length &&
	(tongO !== O_MONG || tongKhang !== KY_MONG)
) {
	console.log(
		`KHONG DO DUOC: ma tran lech ban khai — o=${tongO}/${O_MONG} khang-dinh=${tongKhang}/${KY_MONG}`,
	);
	await ket(2);
}
for (const l of hong) console.log(`HONG: ${l}`);
await ket(hong.length === 0 ? 0 : 1);
