import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { okrMessages } from "../../../apps/app/lib/messages/okr.ts";
import { okrKhepMessages } from "../../../apps/app/lib/messages/okr-khep.ts";
import { troLyOkrMessages } from "../../../apps/app/lib/messages/tro-ly-okr.ts";
import {
	batTacTu,
	cauThieuKhoa,
	chayTrongPhienCoTacTu,
	coKhoaMoHinh,
	GOC,
	idMau,
	laKhoDo,
	napBoMau,
	PHIEN_TRO_LY,
	phienCookie,
	thuMau,
	tre,
	trongPhienCoTacTu,
	trpc,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const GIAY_MS = 1000;
const PHUT_MS = 60 * GIAY_MS;

const E13 = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: [
		{ rong: 1440, cao: 1000 },
		{ rong: 390, cao: 844 },
	],
	cho: {
		moLaiMs: 5 * GIAY_MS,
		manMs: 60 * GIAY_MS,
		kiemMs: 4 * PHUT_MS,
		nhipMs: GIAY_MS,
		lamMoiMs: 400,
	},
	quanTri: "le-hai-dang",
	truong: "nguyen-thi-lan",
	phong: "kd-bac",
	chuKy: "quy4",
	mucTieu: "q4-kd-bac-1",
	tenKr: "Hợp đồng bán lẻ chốt được đạt 6 tỷ đồng",
	donVi: "tỷ đồng",
	lenh: 'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/va-tro-ly-okr-sau-thu/rang/man-that.mjs"',
};

const THU_MUC = join(GOC, ".acceptance-runs/va-tro-ly-okr-sau-thu/man");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const m = okrMessages("vi");
const kr = okrKhepMessages("vi");
const s = troLyOkrMessages("vi").troLy.sanSang;
const bo = JSON.parse(
	readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
);
const krMau = bo.mucTieu
	.find((x) => x.ma === E13.mucTieu)
	?.krs.find((k) => k.ten === E13.tenKr);

const dong = [];
let sai = 0;
let trinhDuyet = null;
let tacTu = null;
let buoc = "";
let slug = "";

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	if (tacTu) await tacTu.dung();
	for (const d of dong) console.log(d);
	console.log(
		`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
	);
	process.exit(ma);
}

async function khongDo(cau, ma = 2) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	await ket(ma);
}

function kiem(nhan, dat) {
	if (dat) dong.push(`DUNG ${nhan}`);
	else {
		sai += 1;
		dong.push(`SAI ${nhan}`);
	}
	return dat;
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) return null;
	const dau = new URL(dich, APP).pathname
		.replace(/^\/+|\/+$/g, "")
		.split("/")[0];
	return dau &&
		!["onboarding", "sign-in", "het-quyen"].some((x) => dau.startsWith(x))
		? dau
		: null;
}

async function moiKho(cookie, lam) {
	const host = new URL(APP).hostname;
	for (const { rong, cao } of E13.kho) {
		const ctx = await trinhDuyet.createBrowserContext();
		await ctx.setCookie(
			{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
			{ name: "lang", value: "vi", domain: host, path: "/" },
		);
		const p = await ctx.newPage();
		await p.setViewport({ width: rong, height: cao, deviceScaleFactor: 1 });
		try {
			await lam({ p, rong });
		} finally {
			await ctx.close();
		}
	}
}

async function chup({ p, rong }, ten) {
	await tre(E13.cho.lamMoiMs);
	await p.evaluate(() => document.fonts.ready);
	const tran = await p.evaluate(() => {
		const goc = document.documentElement;
		const hop = [...document.querySelectorAll('[role="dialog"]')].filter((d) =>
			d.checkVisibility(),
		);
		return [
			{ o: "trang", sw: goc.scrollWidth, cw: goc.clientWidth },
			...hop.map((d) => ({ o: "hop", sw: d.scrollWidth, cw: d.clientWidth })),
		];
	});
	const tep = join(THU_MUC, `${ten}-${rong}.png`);
	await p.screenshot({ path: tep, fullPage: !tran.some((t) => t.o === "hop") });
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
	kiem(
		`${ten} ${rong}: scrollWidth <= clientWidth (${tran.map((t) => `${t.o} ${t.sw}/${t.cw}`).join(", ")})`,
		tran.every((t) => t.sw <= t.cw),
	);
}

async function bamNhan(p, chon) {
	const han = Date.now() + E13.cho.manMs;
	for (;;) {
		const h = await p.waitForFunction(
			(chon) =>
				[...document.querySelectorAll(chon)]
					.filter((x) => x.checkVisibility())
					.at(-1) ?? null,
			{ timeout: E13.cho.manMs },
			chon,
		);
		try {
			await h.asElement().click();
			return;
		} catch (loi) {
			if (Date.now() > han) throw loi;
			await tre(E13.cho.lamMoiMs);
		}
	}
}

async function moSheet(p, mtId) {
	await p.goto(
		`${APP}/${slug}/okr/theo-don-vi?kyOkr=${idMau("chu-ky", E13.chuKy)}&donOkr=pb:${idMau("pb", E13.phong)}`,
		{ waitUntil: "load" },
	);
	const han = Date.now() + E13.cho.manMs;
	for (;;) {
		await bamNhan(p, `[data-mo-muc-tieu="${mtId}"]`);
		const mo = await p
			.waitForFunction(
				(nhan) =>
					[...document.querySelectorAll(`button[aria-label="${nhan}"]`)].some(
						(b) => b.checkVisibility(),
					),
				{ timeout: E13.cho.moLaiMs },
				m.sheet.menu,
			)
			.then(() => true)
			.catch(() => false);
		if (mo) return;
		if (Date.now() > han) throw new Error(`khong mo duoc sheet cua ${mtId}`);
	}
}

async function buocHopKr(tl) {
	buoc = "hop-kr";
	if (!krMau)
		await khongDo(`bo mau khong co KR «${E13.tenKr}» o ${E13.mucTieu}`);
	await moiKho(tl, async (t) => {
		const { p } = t;
		buoc = `hop-kr ${t.rong}: mo sheet`;
		await moSheet(p, idMau("mt", E13.mucTieu));
		buoc = `hop-kr ${t.rong}: mo menu KR`;
		await bamNhan(
			p,
			`button[aria-haspopup="menu"][aria-label*="${E13.tenKr}"]`,
		);
		buoc = `hop-kr ${t.rong}: bam Sua`;
		await bamNhan(p, '[data-muc="sua-kr"]');
		buoc = `hop-kr ${t.rong}: cho hop`;
		await p.waitForSelector("[data-hop-thoai-kr]", {
			visible: true,
			timeout: E13.cho.manMs,
		});
		const ten = await p.$eval(
			'[data-hop-thoai-kr] input[id$="-ten"]',
			(o) => o.value,
		);
		if (ten !== E13.tenKr) await khongDo(`sai kr: ${ten}`, 3);
		await p
			.waitForSelector("[data-hop-thoai-kr] [data-xu-huong]", {
				visible: true,
				timeout: E13.cho.manMs,
			})
			.catch(() => null);
		const chu = await p.$eval("[data-hop-thoai-kr]", (o) => o.innerText);
		kiem(
			`hop KR ${t.rong}: khong co goi y «${kr.luat["kr-la-viec"]}»`,
			!chu.includes(kr.luat["kr-la-viec"]),
		);
		const xuHuong = await p
			.$eval("[data-hop-thoai-kr] [data-xu-huong]", (o) => o.innerText.trim())
			.catch(() => "");
		kiem(
			`hop KR ${t.rong}: dong xu huong co don vi «${xuHuong}»`,
			xuHuong.endsWith(E13.donVi),
		);
		await chup(t, "ST-kr-xu-huong-don-vi");
	});
}

async function buocCaiDat(qt) {
	buoc = "cai-dat";
	await moiKho(qt, async (t) => {
		const { p } = t;
		await p.goto(`${APP}/${slug}/settings/okr`, { waitUntil: "load" });
		await p.waitForSelector("[data-san-sang]", {
			visible: true,
			timeout: E13.cho.manMs,
		});
		const chu = await p.$eval("[data-san-sang]", (o) => o.innerText.trim());
		kiem(
			`the Tro ly OKR ${t.rong}: «${chu}»`,
			chu === s.sanSangNguon["khoa-chung"],
		);
		await p.$eval("[data-san-sang]", (o) =>
			o.scrollIntoView({ block: "center" }),
		);
		await chup(t, "ST-caidat-san-sang-chung");
	});
}

async function choNguonKhoa(qt) {
	buoc = "cho-kiem-san-sang";
	const han = Date.now() + E13.cho.kiemMs;
	for (;;) {
		const ct = await trpc(API, qt).hoi("okr.aiChiTieu");
		if (ct.nguonKhoa !== null && !ct.dangKiem) return ct.nguonKhoa;
		if (Date.now() > han) return ct.nguonKhoa;
		await tre(E13.cho.nhipMs);
	}
}

if (!trongPhienCoTacTu()) {
	console.log(
		"-- API cua phien nay khong noi tac tu (thieu AGENT_BRIDGE_SECRET/AGENT_URL) — mo phien do rieng co tac tu",
	);
	process.exit(await chayTrongPhienCoTacTu(E13.lenh));
}

const { canhCay } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
);
const cay = await canhCay();
if (cay.ket !== "dung-cay")
	await khongDo(
		`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
	);
if (!laKhoDo())
	await khongDo(
		"DATABASE_URL khong phai kho do rieng — chay qua scripts/lan-do/tien-de.mjs",
	);
if (!coKhoaMoHinh())
	await khongDo(`${cauThieuKhoa()} — can khoa chung de the ghi «khoa chung»`);

let qt;
let tl;
try {
	buoc = "chuan-bi";
	const nap = napBoMau();
	if (nap.ma !== 0)
		throw new Error(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	dong.push(`NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
	qt = phienCookie(thuMau(E13.quanTri));
	tl = phienCookie(thuMau(E13.truong));
	slug = (await suySlug(qt)) ?? "";
	if (!slug)
		throw new Error(`${APP}/ khong chuyen toi trang chinh cua workspace`);
	await trpc(API, qt).lam("okr.setProgram", {
		aiOn: true,
		aiDeXuatPhamVi: "toan-cong-ty",
	});
	mkdirSync(THU_MUC, { recursive: true });
	tacTu = await batTacTu({
		cong: Number(process.env[PHIEN_TRO_LY.bienCongTacTu]),
		thuMuc: THU_MUC,
	});
	const nguon = await choNguonKhoa(qt);
	kiem(`kiem san sang ghi nguon: ${nguon}`, nguon === "khoa-chung");
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

trinhDuyet = await puppeteer.launch({
	executablePath: E13.chrome,
	headless: true,
});

try {
	await buocHopKr(tl);
	await buocCaiDat(qt);
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

await ket(sai === 0 ? 0 : 1);
