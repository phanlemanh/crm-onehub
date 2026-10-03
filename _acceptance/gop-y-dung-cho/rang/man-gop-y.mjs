import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import {
	DANH_SACH as DANH_SACH_PROTO,
	soGopYCho as soGopYProto,
} from "../../../apps/app/app/proto/_modules/gop-y-dung-cho/du-lieu.ts";
import { okrGopYMessages } from "../../../apps/app/lib/messages/okr-gop-y.ts";
import {
	idMau,
	laKhoDo,
	napBoMau,
	phienCookie,
	thuMau,
	tre,
	trpc,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { datLaiGopY, dongKho, gieoGopY, SAN } from "./san-gop-y.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const GIAY_MS = 1000;

const GY = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		1440: { rong: 1440, cao: 1000 },
		375: { rong: 375, cao: 812 },
		thap: { rong: 1440, cao: 360 },
	},
	cho: {
		manMs: 120 * GIAY_MS,
		taiMs: 180 * GIAY_MS,
		lamMoiMs: 400,
		yenMs: 1500,
		cuonMs: 1200,
		bamMs: 15 * GIAY_MS,
	},
	theme: { sang: "light", toi: "dark" },
	coChu: ["14px", "12px"],
	khoangToiDa: 16,
	lopCu: "text-sm",
	epCotCu: "900px",
	coDo: "--kiem-do-do",
	proto: { slug: "gop-y-dung-cho", hienTai: "ST-hien-tai" },
	thongDiep: {
		thieuChip: "thieu chip",
		chipLa: "chip la",
		coChuLech: "co chu lech",
		tranNgang: "tran ngang",
		nutBiCat: "nut bi cat",
	},
};

const CO_DO = process.argv.includes(GY.coDo);
const ANH = join(
	GOC,
	CO_DO
		? ".acceptance-runs/gop-y-dung-cho/do-do"
		: "_acceptance/gop-y-dung-cho/evidence",
);
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const m = okrGopYMessages("vi");
const T = GY.thongDiep;

const dong = [];
let sai = 0;
let trinhDuyet = null;

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	await dongKho().catch(() => {});
	for (const d of dong) console.log(d);
	console.log(
		`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
	);
	process.exit(ma);
}

async function khongDo(cau) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	await ket(2);
}

function kiem(nhan, dat) {
	if (dat) dong.push(`DUNG ${nhan}`);
	else {
		sai += 1;
		dong.push(`SAI ${nhan}`);
	}
	return dat;
}

function ghi(cau) {
	dong.push(`GHI ${cau}`);
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

async function trang(cookie, kho, theme) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	if (cookie)
		await ctx.setCookie(
			{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
			{ name: "lang", value: "vi", domain: host, path: "/" },
		);
	const p = await ctx.newPage();
	await p.setViewport({
		width: kho.rong,
		height: kho.cao,
		deviceScaleFactor: 1,
	});
	await p.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: GY.theme[theme] },
	]);
	p.setDefaultNavigationTimeout(GY.cho.taiMs);
	return { ctx, p, kho: kho.rong, theme };
}

async function moTrang(t, duong, cho) {
	await t.p.goto(`${APP}${duong}`, { waitUntil: "load" });
	await t.p.waitForSelector(cho, { timeout: GY.cho.manMs });
	await t.p.evaluate(() => document.fonts.ready);
	await tre(GY.cho.yenMs);
}

async function chup(t, ten) {
	await tre(GY.cho.lamMoiMs);
	await t.p.evaluate(() => {
		for (const s of [
			"nextjs-portal",
			".tsqd-parent-container",
			".tsqd-open-btn-container",
		])
			for (const el of document.querySelectorAll(s)) el.remove();
	});
	const tep = join(ANH, `${ten}.png`);
	await t.p.screenshot({ path: tep });
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
}

const duongDs = (ctx) =>
	`/${ctx.slug}/okr/theo-don-vi?donOkr=pb:${ctx.g.phongBan}`;
const duongKhung = (ctx, id) => `${duongDs(ctx)}&record=objective:${id}`;
const duongProto = () => `/proto/${GY.proto.slug}?state=${GY.proto.hienTai}`;

function docChip() {
	return Object.fromEntries(
		[...document.querySelectorAll("[data-chip-gop-y]")].map((c) => [
			c.getAttribute("data-chip-gop-y"),
			c.innerText.replace(/\s+/g, " ").trim(),
		]),
	);
}

function kiemChip(nguon, chip, nhan) {
	for (const r of nguon) {
		const co = chip[r.id];
		if (r.so > 0) {
			const mong = `Kara · ${m.chip(String(r.so))}`;
			kiem(
				co === mong
					? `${nhan}: chip ${r.id} «${co}» (soGopYCho ${r.so})`
					: `${T.thieuChip}: ${r.id} (${nhan}: thay «${co ?? "khong co"}», can «${mong}»)`,
				co === mong,
			);
		} else
			kiem(
				co === undefined
					? `${nhan}: ${r.id} soGopYCho 0, khong co chip`
					: `${T.chipLa}: ${r.id} (${nhan}: «${co}» du soGopYCho 0)`,
				co === undefined,
			);
	}
}

function viTriNhom() {
	const n = document.querySelector("[data-okr-sheet] [data-nhom-kara]");
	if (!n) return null;
	let c = n.parentElement;
	while (c && c !== document.body) {
		const s = getComputedStyle(c);
		if (/(auto|scroll)/.test(s.overflowY) && c.scrollHeight > c.clientHeight)
			break;
		c = c.parentElement;
	}
	const vung = c && c !== document.body ? c : document.scrollingElement;
	const rv =
		vung === document.scrollingElement
			? { top: 0, bottom: innerHeight }
			: vung.getBoundingClientRect();
	const top = Math.round(n.getBoundingClientRect().top);
	const vungTop = Math.max(0, Math.round(rv.top));
	const vungDuoi = Math.min(innerHeight, Math.round(rv.bottom));
	return {
		top,
		vungTop,
		vungDuoi,
		trong: top >= vungTop - 1 && top < vungDuoi,
		scrollTop: Math.round(vung.scrollTop),
		coVungCuon: vung !== document.scrollingElement,
	};
}

const ariaHang = (p, id) =>
	p.evaluate(
		(id) =>
			document
				.querySelector(`[data-hang-muc-tieu="${id}"] button[aria-expanded]`)
				?.getAttribute("aria-expanded") ?? null,
		id,
	);

async function buocE2(ctx, theme) {
	const a = ctx.g.a;
	const t = await trang(ctx.tr, GY.kho[1440], theme);
	try {
		await moTrang(t, duongDs(ctx), `[data-hang-muc-tieu="${a}"]`);
		kiemChip(ctx.nguon, await t.p.evaluate(docChip), `E2 1440 ${theme}`);
		await chup(t, `E2-danh-sach-1440-${theme}`);
		const truoc = await ariaHang(t.p, a);
		await t.p.click(`[data-chip-gop-y="${a}"]`);
		await t.p.waitForSelector("[data-okr-sheet] [data-nhom-kara]", {
			timeout: GY.cho.manMs,
		});
		await tre(GY.cho.cuonMs);
		const vt = await t.p.evaluate(viTriNhom);
		kiem(
			`E2 ${theme}: dinh [data-nhom-kara] ${vt?.top} trong khung nhin vung cuon ${vt?.vungTop}-${vt?.vungDuoi}${vt?.coVungCuon ? "" : " (khung khong cuon)"}`,
			vt?.trong === true,
		);
		const sau = await ariaHang(t.p, a);
		kiem(
			`E2 ${theme}: aria-expanded hang A ${truoc} -> ${sau} khong doi`,
			truoc !== null && truoc === sau,
		);
		await chup(t, `E2-chi-tiet-1440-${theme}`);
		await moLoiDi(
			t,
			ctx.g.dong.doiTrong,
			m.de.themDoiTrong,
			'[data-hop-thoai-kr="moi"]',
			`E2-chi-tiet-doi-trong-1440-${theme}`,
		);
		await moLoiDi(
			t,
			ctx.g.dong.hoiKr3,
			m.de.suaKrNay,
			`[data-hop-thoai-kr="${ctx.g.kr3}"]`,
			`E2-chi-tiet-sua-kr3-1440-${theme}`,
		);
		await t.p.keyboard.press("Escape");
		const daDong = await t.p
			.waitForFunction(() => !document.querySelector("[data-okr-sheet]"), {
				timeout: GY.cho.bamMs,
			})
			.then(() => true)
			.catch(() => false);
		if (!daDong) await moTrang(t, duongDs(ctx), `[data-hang-muc-tieu="${a}"]`);
		await t.p.click(`[data-mo-muc-tieu="${a}"]`);
		await t.p.waitForSelector("[data-okr-sheet] [data-nhom-kara]", {
			timeout: GY.cho.manMs,
		});
		await tre(GY.cho.cuonMs);
		const ten = await t.p.evaluate(viTriNhom);
		kiem(
			`E2 ${theme}: mo bang ten — scrollTop vung cuon khung ${ten?.scrollTop} (can 0)`,
			ten?.scrollTop === 0,
		);
		const url = new URL(t.p.url());
		kiem(
			`E2 ${theme}: mo bang ten khong dat neoGopY (${url.searchParams.get("neoGopY")})`,
			url.searchParams.get("neoGopY") === null,
		);
	} finally {
		await t.ctx.close();
	}
}

async function buocE2Thap(ctx) {
	const a = ctx.g.a;
	const t = await trang(ctx.tr, GY.kho.thap, "sang");
	try {
		await moTrang(t, duongDs(ctx), `[data-chip-gop-y="${a}"]`);
		await t.p.click(`[data-chip-gop-y="${a}"]`);
		await t.p.waitForSelector("[data-okr-sheet] [data-nhom-kara]", {
			timeout: GY.cho.manMs,
		});
		await tre(GY.cho.cuonMs);
		const chip = await t.p.evaluate(viTriNhom);
		kiem(
			`E2 khung thap 1440x${GY.kho.thap.cao}: mo tu chip da cuon (scrollTop ${chip?.scrollTop} > 0) va dinh nhom ${chip?.top} trong ${chip?.vungTop}-${chip?.vungDuoi}`,
			chip?.coVungCuon === true && chip.scrollTop > 0 && chip.trong,
		);
		await chup(t, `E2-khung-thap-tu-chip-${GY.kho.thap.cao}`);
		await moTrang(t, duongKhung(ctx, a), "[data-okr-sheet] [data-nhom-kara]");
		await tre(GY.cho.cuonMs);
		const ten = await t.p.evaluate(viTriNhom);
		kiem(
			`E2 khung thap: mo thang khong cuon (scrollTop ${ten?.scrollTop}) va nhom nam duoi mep (${ten?.top} >= ${ten?.vungDuoi})`,
			ten !== null && ten.scrollTop === 0 && !ten.trong,
		);
	} finally {
		await t.ctx.close();
	}
}

async function chupPhan(t, chon, ten) {
	await tre(GY.cho.lamMoiMs);
	const o = await t.p.$(chon);
	if (!o) throw new Error(`khong thay ${chon} de chup`);
	const tep = join(ANH, `${ten}.png`);
	await o.screenshot({ path: tep });
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
}

async function moLoiDi(t, idGopY, chu, hop, ten) {
	await bamTrong(t.p, idGopY, chu);
	await t.p.waitForSelector(hop, { timeout: GY.cho.manMs });
	await tre(GY.cho.yenMs);
	await chup(t, ten);
	await t.p.keyboard.press("Escape");
	await t.p
		.waitForFunction(
			(h) => !document.querySelector(h),
			{ timeout: GY.cho.bamMs },
			hop,
		)
		.catch(() => ghi(`${ten}: hop chua dong sau Escape`));
	await tre(GY.cho.lamMoiMs);
}

async function bamTrong(p, idGopY, chu) {
	const goc = `[data-gop-y="${idGopY}"]`;
	await p.waitForSelector(goc, { timeout: GY.cho.manMs });
	const nut = await p.$$(`${goc} button`);
	for (const n of nut) {
		const nhan = await n.evaluate((b) => b.innerText.trim());
		if (nhan === chu) {
			await n.click();
			return;
		}
	}
	throw new Error(`khong thay nut «${chu}» trong ${goc}`);
}

async function choQuyet(p, idGopY) {
	await p.waitForSelector(`[data-gop-y="${idGopY}"][data-decided]`, {
		timeout: GY.cho.manMs,
	});
	await tre(GY.cho.lamMoiMs);
}

function doCoChu({ px, kr1, kr3, them }) {
	const h1 = document.querySelector(`[data-duoi-kr="${kr1}"]`);
	const h3 = document.querySelector(`[data-duoi-kr="${kr3}"]`);
	if (!h1 || !h3) return null;
	h1.style.fontSize = px;
	h3.style.fontSize = px;
	const v = h1.querySelector('[data-slot="proposed-change-value"]');
	const r = h3.querySelector('[data-slot="proposed-change-receipt"]');
	if (them && v) v.classList.add(them);
	const co = (o) => (o ? getComputedStyle(o).fontSize : null);
	return { cha1: co(h1), gia: co(v), cha3: co(h3), bienNhan: co(r) };
}

function khoangBoQua({ kr1, boQua }) {
	const nhom = document.querySelector(
		`[data-duoi-kr="${kr1}"] [data-slot="proposed-change-actions"]`,
	);
	const nut = nhom ? [...nhom.querySelectorAll("button")] : [];
	const i = nut.findIndex((b) => b.innerText.trim() === boQua);
	if (i < 1) return null;
	return Math.round(
		nut[i].getBoundingClientRect().left -
			nut[i - 1].getBoundingClientRect().right,
	);
}

async function doMaTranCoChu(t, ctx, them, nhan) {
	for (const px of GY.coChu) {
		const so = await t.p.evaluate(doCoChu, {
			px,
			kr1: ctx.g.kr1,
			kr3: ctx.g.kr3,
			them: px === GY.coChu.at(-1) ? them : null,
		});
		const khop = so !== null && so.gia === so.cha1 && so.bienNhan === so.cha3;
		kiem(
			khop
				? `${nhan} ${px}: than de xuat ${so.gia} == cha ${so.cha1}; bien nhan ${so.bienNhan} == cha ${so.cha3}`
				: `${T.coChuLech}: ${px} (${nhan}: than ${so?.gia} / cha ${so?.cha1}; bien nhan ${so?.bienNhan} / cha ${so?.cha3})`,
			khop,
		);
	}
}

async function moKhungA(ctx, theme, kho = GY.kho[1440]) {
	const t = await trang(ctx.tr, kho, theme);
	await moTrang(
		t,
		duongKhung(ctx, ctx.g.a),
		`[data-duoi-kr="${ctx.g.kr1}"] [data-slot="proposed-change"]`,
	);
	return t;
}

async function buocE22(ctx) {
	const t = await moKhungA(ctx, "sang");
	try {
		await bamTrong(t.p, ctx.g.dong.hoiKr3, m.de.boQua);
		await choQuyet(t.p, ctx.g.dong.hoiKr3);
		await doMaTranCoChu(t, ctx, null, "E22");
		const k = await t.p.evaluate(khoangBoQua, {
			kr1: ctx.g.kr1,
			boQua: m.de.boQua,
		});
		kiem(
			`E22: mep trai «${m.de.boQua}» cach nut dung truoc ${k}px (<= ${GY.khoangToiDa})`,
			k !== null && k <= GY.khoangToiDa,
		);
	} finally {
		await t.ctx.close();
		await datLaiGopY(ctx.g, { api: API, truong: ctx.tr });
	}
}

function doO() {
	const sw = document.documentElement.scrollWidth;
	const iw = innerWidth;
	const nut = [
		...document.querySelectorAll(
			'[data-slot="proposed-change"] button, [data-dan-sang] button',
		),
	].filter((b) => b.checkVisibility());
	const cat = [];
	for (const b of nut) {
		b.scrollIntoView({ block: "center", inline: "nearest" });
		for (let c = b.parentElement; c; c = c.parentElement) c.scrollLeft = 0;
		window.scrollTo(0, window.scrollY);
		const r = b.getBoundingClientRect();
		const vung = { trai: 0, phai: innerWidth, tren: 0, duoi: innerHeight };
		for (
			let c = b.parentElement;
			c && c !== document.documentElement;
			c = c.parentElement
		) {
			const s = getComputedStyle(c);
			if (s.overflowX === "visible" && s.overflowY === "visible") continue;
			const rc = c.getBoundingClientRect();
			vung.trai = Math.max(vung.trai, rc.left);
			vung.phai = Math.min(vung.phai, rc.right);
			vung.tren = Math.max(vung.tren, rc.top);
			vung.duoi = Math.min(vung.duoi, rc.bottom);
		}
		if (
			r.left < vung.trai - 1 ||
			r.right > vung.phai + 1 ||
			r.top < vung.tren - 1 ||
			r.bottom > vung.duoi + 1
		)
			cat.push(
				`«${b.innerText.trim().slice(0, 20)}» ${Math.round(r.left)}-${Math.round(r.right)} ngoai ${Math.round(vung.trai)}-${Math.round(vung.phai)}`,
			);
	}
	const tranKhung = [
		...document.querySelectorAll('[data-slot="sheet-content"]'),
	]
		.flatMap((k) => [k, ...k.querySelectorAll("*")])
		.filter((o) => {
			if (!o.checkVisibility()) return false;
			const s = getComputedStyle(o);
			return (
				o.matches('[data-slot="sheet-content"]') ||
				/(auto|scroll)/.test(s.overflowY)
			);
		})
		.filter((o) => o.scrollWidth > o.clientWidth + 1)
		.map(
			(o) =>
				`${o.getAttribute("data-slot") ?? o.tagName.toLowerCase()} ${o.scrollWidth}/${o.clientWidth}`,
		);
	return { sw, iw, soNut: nut.length, cat, tranKhung };
}

function kiemO(so, nhan) {
	kiem(
		so.sw === so.iw
			? `${nhan}: scrollWidth ${so.sw} == innerWidth ${so.iw}`
			: `${T.tranNgang} ${nhan}: scrollWidth ${so.sw} != innerWidth ${so.iw}`,
		so.sw === so.iw,
	);
	kiem(
		so.tranKhung.length === 0
			? `${nhan}: vung cuon trong khung khong tran ngang`
			: `${T.tranNgang} trong khung ${nhan}: ${so.tranKhung.join("; ")}`,
		so.tranKhung.length === 0,
	);
	kiem(
		so.cat.length === 0
			? `${nhan}: 0/${so.soNut} nut bi cat`
			: `${T.nutBiCat} ${nhan}: ${so.cat.length}/${so.soNut} — ${so.cat.join("; ")}`,
		so.cat.length === 0,
	);
	return `${nhan.padEnd(34)} sw ${so.sw}/${so.iw} · khung tran ${so.tranKhung.length} · ${so.soNut} nut · ${so.cat.length} cat`;
}

function manE23(ctx) {
	const a = ctx.g.a;
	const chip = `[data-chip-gop-y="${a}"]`;
	return [
		{ ten: "danh-sach", duong: duongDs(ctx), cho: chip },
		{ ten: "danh-sach-loc", duong: `${duongDs(ctx)}&gopYOkr=cho`, cho: chip },
		{
			ten: "khung",
			duong: duongKhung(ctx, a),
			cho: '[data-nhom-kara="co-gop-y"]',
		},
		{
			ten: "khung-bien-nhan",
			duong: duongKhung(ctx, a),
			cho: `[data-gop-y="${ctx.g.dong.vietLaiKr1}"]`,
			lam: async (p) => {
				await bamTrong(p, ctx.g.dong.vietLaiKr1, m.de.doiTenKr);
				await choQuyet(p, ctx.g.dong.vietLaiKr1);
				await bamTrong(p, ctx.g.dong.hoiKr3, m.de.boQua);
				await choQuyet(p, ctx.g.dong.hoiKr3);
				await p
					.waitForSelector(
						`[data-kr="${ctx.g.kr1}"] [data-slot="kara-trace"]`,
						{
							timeout: GY.cho.bamMs,
						},
					)
					.catch(() =>
						ghi("khung-bien-nhan: chua thay dau doi theo Kara sau 15s"),
					);
			},
			datLai: true,
		},
		{
			ten: "khung-rong",
			duong: duongKhung(ctx, ctx.g.b),
			cho: '[data-nhom-kara="rong"]',
		},
		{
			ten: "hop-sua-muc-tieu",
			duong: `${duongKhung(ctx, a)}&hopOkr=muc-tieu`,
			cho: "[data-hop-thoai-muc-tieu] [data-dan-sang]",
		},
		{
			ten: "hop-sua-kr",
			duong: `${duongKhung(ctx, a)}&hopOkr=kr:${ctx.g.kr1}`,
			cho: "[data-hop-thoai-kr] [data-dan-sang]",
		},
	];
}

async function sauQuyet(ctx, t, theme) {
	const so = (await docDanhSach(ctx)).find((r) => r.id === ctx.g.a)?.so;
	const p2 = await t.ctx.newPage();
	await p2.setViewport({
		width: GY.kho[1440].rong,
		height: GY.kho[1440].cao,
		deviceScaleFactor: 1,
	});
	await p2.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: GY.theme[theme] },
	]);
	const t2 = { ...t, p: p2 };
	await moTrang(t2, duongDs(ctx), `[data-chip-gop-y="${ctx.g.a}"]`);
	const chip = (await p2.evaluate(docChip))[ctx.g.a];
	const mong = `Kara · ${m.chip(String(so))}`;
	kiem(
		`E2 sau quyet ${theme}: chip A «${chip}» == so API ${so} (con 1 sau mot lan nhan, mot lan bo qua)`,
		chip === mong && so === 1,
	);
	await chup(t2, `E2-danh-sach-sau-quyet-1440-${theme}`);
	ghi(
		`E2 sau quyet ${theme}: so «Vet» tren anh tang 2 dong moi o bien nhan truoc do (nhan doi ten KR1 + dat lai ten qua okr.updateKeyResult), nen sang va toi khac nhau`,
	);
	await p2.close();
}

async function docDanhSach(ctx) {
	const ky = await trpc(API, ctx.tr).hoi("okr.cycles");
	const ds = await trpc(API, ctx.tr).hoi("okr.danhSach", {
		cycleId: ky.currentId,
		unit: { loai: "pb", id: ctx.g.phongBan },
		loc: { phuTrach: [], loai: [], trangThai: [], tuTin: [], gopY: [] },
	});
	return ds.rows.map((r) => ({ id: r.id, so: r.soGopYCho }));
}

async function buocE23(ctx) {
	const bang = [];
	for (const kho of [375, 1440])
		for (const theme of ["sang", "toi"])
			for (const man of manE23(ctx)) {
				const t = await trang(ctx.tr, GY.kho[kho], theme);
				try {
					await moTrang(t, man.duong, man.cho);
					if (man.lam) await man.lam(t.p);
					await chup(t, `E23-${man.ten}-${kho}-${theme}`);
					if (man.ten === "khung-bien-nhan" && kho === 1440) {
						await chup(t, `E2-chi-tiet-bien-nhan-1440-${theme}`);
						await chupPhan(
							t,
							`[data-gop-y="${ctx.g.dong.hoiKr3}"]`,
							`E2-bo-qua-kr3-1440-${theme}`,
						);
						await sauQuyet(ctx, t, theme);
					}
					bang.push(
						kiemO(await t.p.evaluate(doO), `E23 ${man.ten} ${kho} ${theme}`),
					);
				} finally {
					await t.ctx.close();
					if (man.datLai) await datLaiGopY(ctx.g, { api: API, truong: ctx.tr });
				}
			}
	ghi(`E23 bang ${bang.length} o:`);
	for (const b of bang) ghi(`  ${b}`);
}

async function kiemDoDo(ctx) {
	const tDs = await trang(ctx.tr, GY.kho[1440], "sang");
	try {
		await moTrang(tDs, duongProto(), "[data-cot-gop-y]");
		const nguon = DANH_SACH_PROTO.map((mt) => ({
			id: mt.id,
			so: soGopYProto(mt.id),
		}));
		kiemChip(
			nguon,
			await tDs.p.evaluate(docChip),
			"do-do E2 proto ST-hien-tai",
		);
	} finally {
		await tDs.ctx.close();
	}
	const tKhung = await moKhungA(ctx, "sang");
	try {
		await bamTrong(tKhung.p, ctx.g.dong.hoiKr3, m.de.boQua);
		await choQuyet(tKhung.p, ctx.g.dong.hoiKr3);
		await doMaTranCoChu(tKhung, ctx, GY.lopCu, `do-do E22 them ${GY.lopCu}`);
	} finally {
		await tKhung.ctx.close();
		await datLaiGopY(ctx.g, { api: API, truong: ctx.tr });
	}
	const tHep = await trang(ctx.tr, GY.kho[375], "sang");
	try {
		await moTrang(tHep, duongProto(), "[data-cot-gop-y]");
		await chup(tHep, "do-do-E23-proto-hien-tai-375");
		kiemO(await tHep.p.evaluate(doO), "do-do E23 proto ST-hien-tai 375");
		await tHep.p.evaluate((rong) => {
			const cot = document.querySelector("[data-cot-gop-y]");
			if (cot) cot.style.width = rong;
		}, GY.epCotCu);
		kiemO(
			await tHep.p.evaluate(doO),
			`do-do E23 bo sung: ep cot cu rong ${GY.epCotCu} o 375`,
		);
	} finally {
		await tHep.ctx.close();
	}
}

async function chuanBi() {
	const nap = napBoMau();
	if (nap.ma !== 0)
		throw new Error(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	ghi(`NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
	const qt = phienCookie(thuMau(SAN.nguoi.quanTri));
	const tr = phienCookie(thuMau(SAN.nguoi.truong));
	const slug = await suySlug(tr);
	if (!slug)
		throw new Error(`${APP}/ khong chuyen toi trang chinh cua workspace`);
	const g = await gieoGopY({ api: API, quanTri: qt, truong: tr });
	ghi(
		`GIEO A ${g.a}: 3 dong cho (doi trong ${g.dong.doiTrong}, viet lai KR1 ${g.dong.vietLaiKr1}, kr-la-viec KR3 ${g.dong.hoiKr3}); B ${g.b}: luot rong`,
	);
	const nguon = await docDanhSach({ tr, g });
	ghi(
		`TIEN DE okr.danhSach pb:${SAN.ma.phongBan}: ${nguon.map((r) => `${r.id}=${r.so}`).join(", ")}`,
	);
	const soA = nguon.find((r) => r.id === g.a)?.so;
	const soB = nguon.find((r) => r.id === g.b)?.so;
	if (soA !== 3 || soB !== 0)
		throw new Error(`soGopYCho A=${soA} B=${soB}, can 3 va 0`);
	return { qt, tr, slug, g, nguon, truongId: idMau("nguoi", SAN.nguoi.truong) };
}

mkdirSync(ANH, { recursive: true });

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
const maProto = (
	await fetch(`${APP}${duongProto()}`, { redirect: "manual" }).catch(() => null)
)?.status;
if (maProto !== 200)
	await khongDo(`${APP}${duongProto()} tra ${maProto} — can PROTO_ROUTE=1`);

let ctx;
try {
	ctx = await chuanBi();
} catch (loi) {
	await khongDo(`chuan bi: ${loi?.message ?? loi}`);
}

trinhDuyet = await puppeteer.launch({
	executablePath: GY.chrome,
	headless: true,
});

let buoc = "";
try {
	if (CO_DO) {
		buoc = "kiem-do-do";
		await kiemDoDo(ctx);
	} else {
		buoc = "E2";
		await buocE2(ctx, "sang");
		await buocE2(ctx, "toi");
		await buocE2Thap(ctx);
		buoc = "E22";
		await buocE22(ctx);
		buoc = "E23";
		await buocE23(ctx);
	}
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

await ket(sai === 0 ? 0 : 1);
