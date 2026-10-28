import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { homNayVN } from "../../../packages/validation/src/ngay-vn.ts";
import {
	APP,
	CHROME,
	datTrinhDuyet,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	AN_CONG_CU_DEV,
	BANG_CHUNG,
	DO,
	donTuKhoa,
	NHAN,
	NUT,
	nghi,
	THAM,
} from "./man-bo-okr-co-so-du-lieu.mjs";

let dung = 0;
let sai = 0;
function dong(dat, chu) {
	if (dat) dung += 1;
	else sai += 1;
	console.log(dat ? `DUNG ${chu}` : `SAI ${chu}`);
}
export const ketQua = () => ({ dung, sai });

let trinhDuyet = null;
export async function moTrinhDuyet() {
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	datTrinhDuyet(trinhDuyet);
}

async function moTrang(cookie, duong, kho, toi = false) {
	const ctx = await trinhDuyet.createBrowserContext();
	const t = await ctx.newPage();
	const host = new URL(APP).hostname;
	await t.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	await t.setViewport({ width: kho.rong, height: kho.cao });
	await t.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: toi ? "dark" : "light" },
	]);
	await t.evaluateOnNewDocument((css) => {
		document.addEventListener("DOMContentLoaded", () => {
			const s = document.createElement("style");
			s.textContent = css;
			document.head.appendChild(s);
		});
	}, AN_CONG_CU_DEV);
	await t.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: DO.cho.taiMs,
	});
	const dich = new URL(t.url()).pathname;
	if (dich.startsWith("/sign-in") || dich.includes("/onboarding"))
		await khongDo(`KHONG DO DUOC: ${duong} bi day ve ${dich}`);
	if (toi)
		await t.evaluate(() => {
			document.documentElement.classList.add("dark");
			document.documentElement.style.colorScheme = "dark";
		});
	return t;
}

const dongTrang = (t) => t.browserContext().close();

async function cho(t, chon, ms = DO.cho.taiMs) {
	const thay = await t
		.waitForFunction(
			(c) =>
				[...document.querySelectorAll(c)].some(
					(el) =>
						el.getClientRects().length > 0 &&
						Object.keys(el).some((k) => k.startsWith("__reactFiber")),
				),
			{ timeout: ms, polling: DO.cho.nhipMs },
			chon,
		)
		.then(() => true)
		.catch(() => false);
	await nghi(DO.cho.onDinhMs);
	return thay;
}

async function bam(t, chon) {
	for (let i = 0; i < DO.cuon.soLan; i += 1) {
		const r = await t.evaluate((c) => {
			const el = [...document.querySelectorAll(c)].find(
				(e) => e.getClientRects().length > 0,
			);
			if (!el) return null;
			const b = el.getBoundingClientRect();
			return {
				x: b.left + b.width / 2,
				y: b.top + b.height / 2,
				tren: b.top,
				duoi: b.bottom,
				cao: window.innerHeight,
			};
		}, chon);
		if (r === null) return false;
		if (r.tren >= 0 && r.duoi <= r.cao) {
			await t.mouse.click(r.x, r.y);
			await nghi(DO.cho.onDinhMs);
			return true;
		}
		await t.mouse.move(r.x, r.cao / 2);
		await t.mouse.wheel({
			deltaY:
				r.tren < 0 ? r.tren - DO.cuon.lePx : r.duoi - r.cao + DO.cuon.lePx,
		});
		await nghi(DO.cho.cuonMs);
	}
	return false;
}

const duongBo = (n, khoa, them = {}) =>
	`/${n.slug}/okr/bo-okr?${new URLSearchParams({ [THAM.don]: khoa, [THAM.ky]: n.ky.id, ...them })}`;

const DOC_HANG = () => {
	const nhom = document.querySelector("[data-hang-so-bo='co']");
	const o = [...(nhom?.querySelectorAll("[data-o-so]") ?? [])].map((el) => {
		const la = [...el.querySelectorAll("*")]
			.filter((e) => e.children.length === 0)
			.map((e) => e.innerText.trim())
			.filter(Boolean);
		return { nhan: la[0] ?? "", gia: la[1] ?? "", moTa: la[2] ?? "" };
	});
	const theCon = document.querySelector("[data-the-con-bo]");
	const nut =
		document.querySelector("[data-nut-mo-gap-tat-ca]") ??
		document.querySelector("[data-slot=page-shell-content] table");
	const truoc = (a, b) =>
		a !== null &&
		b !== null &&
		(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
	return {
		o,
		soNhom: document.querySelectorAll("[data-hang-so-bo]").length,
		viTri: truoc(theCon, nhom) && truoc(nhom, nut),
	};
};

const DEM_BANG = () => {
	const hien = (el) => el.getClientRects().length > 0;
	const nut = [...document.querySelectorAll("[data-mo-dong]")].filter(hien);
	return {
		kr: [...document.querySelectorAll("[data-kr]")].filter(hien).length,
		mo: nut.filter((b) => b.getAttribute("aria-expanded") === "true").length,
		nutId: nut.map((b) => b.getAttribute("data-mo-dong")),
		nhanNut:
			document.querySelector("[data-nut-mo-gap-tat-ca]")?.innerText.trim() ??
			"",
	};
};

const trungBinh = (so) =>
	so.length === 0
		? null
		: Math.round(so.reduce((a, b) => a + b, 0) / so.length);

function ngayConLai(ky) {
	const hom = homNayVN(new Date());
	if (hom < ky.startsOn) return "—";
	if (hom > ky.endsOn) return "0";
	const ms =
		Date.parse(`${ky.endsOn}T00:00:00Z`) - Date.parse(`${hom}T00:00:00Z`);
	return String(Math.round(ms / 86_400_000) + 1);
}

const LOC_TRONG = {
	phuTrach: [],
	loai: [],
	trangThai: [],
	tuTin: [],
	gopY: [],
};

async function mongDoi(n, khoa, tc, dsBo) {
	const so = await n.api.hoi("okr.soBo", {
		cycleId: n.ky.id,
		unit: donTuKhoa(khoa),
	});
	if (khoa.startsWith("nguoi:")) {
		const ds = await n.api.hoi("okr.danhSach", {
			cycleId: n.ky.id,
			unit: donTuKhoa(khoa),
			loc: LOC_TRONG,
		});
		const congBo = ds.rows.filter((m) => m.status !== "nhap");
		return {
			tienDo: trungBinh(congBo.map((m) => m.progress)),
			kyVong: so.kyVong,
			soKr: congBo.reduce((t, m) => t + m.keyResults.length, 0),
			daCapNhat: so.daCapNhat,
			thap: so.tuTin.thap,
			bo: null,
		};
	}
	const h = tc.hang.find((x) => x.key === khoa);
	const b = dsBo.hang.find((x) => x.don === khoa);
	if (!h) return null;
	return {
		tienDo: h.tienDo,
		kyVong: h.kyVong,
		soKr: h.soKr,
		daCapNhat: h.daCapNhat,
		thap: h.tuTin.thap,
		bo: b ? { tienDo: b.tienDo, thap: b.tuTinThap } : null,
	};
}

export async function e1(n) {
	const [tc, dsBo] = await Promise.all([
		n.api.hoi("okr.toanCanh", { cycleId: n.ky.id }),
		n.api.hoi("okr.danhSachBo", { cycleId: n.ky.id }),
	]);
	const ngay = ngayConLai(n.ky);
	for (const khoa of n.bo) {
		const mong = await mongDoi(n, khoa, tc, dsBo);
		const t = await moTrang(n.ck, duongBo(n, khoa), DO.kho.rong);
		const thay = await cho(t, "[data-hang-so-bo='co'] [data-o-so]");
		const d = await t.evaluate(DOC_HANG);
		await dongTrang(t);
		if (!thay || mong === null) {
			dong(
				false,
				`AC-1 ${khoa}: khong thay hang so (api ${mong ? "co" : "khong co"} hang)`,
			);
			continue;
		}
		const gia = d.o.map((x) => x.gia);
		const muon = [
			ngay,
			mong.tienDo === null || mong.soKr === 0 ? "—" : `${mong.tienDo}%`,
			mong.soKr === 0 ? "0/0" : `${mong.daCapNhat}/${mong.soKr}`,
			mong.soKr === 0 ? "0" : String(mong.thap),
		];
		const tenO = ["ngay-con-lai", "tien-do", "da-cap-nhat", "tu-tin-thap"];
		const lech = tenO.filter((_, i) => gia[i] !== muon[i]);
		const nhanLech = NHAN.some((x, i) => d.o[i]?.nhan !== x);
		const kyVongLech =
			mong.kyVong !== null &&
			mong.kyVong > 0 &&
			!d.o[1]?.moTa.includes(`${mong.kyVong}%`);
		const boLech =
			mong.bo !== null &&
			(mong.bo.tienDo !== mong.tienDo || mong.bo.thap !== mong.thap);
		if (lech.length > 0)
			for (const ten of lech)
				dong(
					false,
					`AC-1 ${khoa}: ${ten} man=${gia[tenO.indexOf(ten)]} api=${muon[tenO.indexOf(ten)]}`,
				);
		else if (nhanLech || kyVongLech || boLech || d.soNhom !== 1 || !d.viTri)
			dong(
				false,
				`AC-1 ${khoa}: ${nhanLech ? "nhan sai thu tu " : ""}${kyVongLech ? "mo ta thieu ky vong " : ""}${boLech ? "lech danh sach Bo OKR " : ""}${d.soNhom !== 1 ? `${d.soNhom} hang so ` : ""}${d.viTri ? "" : "sai vi tri"}`,
			);
		else dong(true, `AC-1 ${khoa}: ${gia.join(" · ")}`);
	}
}

async function moBoPb(n, them = {}) {
	const t = await moTrang(n.ck, duongBo(n, `pb:${n.pb.id}`, them), DO.kho.rong);
	await cho(t, "[data-hang-muc-tieu]");
	return t;
}

export async function e6(n) {
	const ds = await n.api.hoi("okr.danhSach", {
		cycleId: n.ky.id,
		unit: { loai: "pb", id: n.pb.id },
		loc: LOC_TRONG,
	});
	const coKr = ds.rows.filter((m) => m.keyResults.length > 0);
	const tongKr = coKr.reduce((t, m) => t + m.keyResults.length, 0);
	const t = await moBoPb(n);
	const d = await t.evaluate(DEM_BANG);
	await dongTrang(t);
	n.soKrMoSan = tongKr;
	if (!ds.rows.some((m) => m.id === n.gieo.khongKr))
		await khongDo(
			"KHONG DO DUOC: muc tieu khong KR vua gieo khong co trong okr.danhSach",
		);
	const daBoCoNut = d.nutId.includes(n.gieo.daBo);
	const khongKrCoNut = d.nutId.includes(n.gieo.khongKr);
	if (d.kr !== tongKr || d.mo !== coKr.length)
		dong(
			false,
			`AC-4 mo-san: man=${d.kr} KR, ${d.mo} dong mo · api=${tongKr} KR, ${coKr.length} dong`,
		);
	else if (daBoCoNut) dong(false, "AC-4 da-bo: muc tieu da bo co nut mo");
	else if (khongKrCoNut)
		dong(false, "AC-4 khong-kr: muc tieu khong KR co nut mo");
	else
		dong(
			true,
			`AC-4 mo-san: ${d.kr}/${tongKr} KR · da-bo khong nut · khong-kr khong nut`,
		);
}

async function tabToi(t, chon) {
	for (let i = 0; i < DO.tab.toiDa; i += 1) {
		await t.keyboard.press("Tab");
		const toi = await t.evaluate(
			(c) => document.activeElement?.matches(c) ?? false,
			chon,
		);
		if (toi) return true;
	}
	return false;
}

export async function e8(n) {
	const chonNut = "[data-nut-mo-gap-tat-ca]";
	const t = await moBoPb(n);
	await bam(t, chonNut);
	const sauGap = await t.evaluate(DEM_BANG);
	const url = new URL(t.url());
	const coGap = url.searchParams.has(THAM.gap);
	dong(
		sauGap.kr === 0 && coGap,
		`AC-5 gap-tat-ca: ${sauGap.kr} KR hien · URL ${coGap ? "co" : "KHONG co"} gap`,
	);
	await t.reload({ waitUntil: "domcontentloaded" });
	await cho(t, "[data-hang-muc-tieu]");
	const sauTai = await t.evaluate(DEM_BANG);
	dong(
		sauTai.kr === 0 && sauTai.nhanNut === NUT.mo,
		`AC-5 tai-lai: ${sauTai.kr} KR hien · nut «${sauTai.nhanNut}»`,
	);
	const t2 = await moTrang(n.ck, `${url.pathname}${url.search}`, DO.kho.rong);
	await cho(t2, "[data-hang-muc-tieu]");
	const tabMoi = await t2.evaluate(DEM_BANG);
	await dongTrang(t2);
	dong(tabMoi.kr === 0, `AC-5 tab-moi: ${tabMoi.kr} KR hien`);
	const toi = await tabToi(t, chonNut);
	const ten = await t.evaluate((c) => {
		const el = document.querySelector(c);
		return el?.getAttribute("aria-label") ?? el?.innerText.trim() ?? "";
	}, chonNut);
	if (toi) await t.keyboard.press("Enter");
	await nghi(DO.cho.onDinhMs);
	const sauMo = await t.evaluate(DEM_BANG);
	const conGap = new URL(t.url()).searchParams.has(THAM.gap);
	await dongTrang(t);
	const mong = n.soKrMoSan ?? sauMo.kr;
	dong(
		toi && ten === NUT.mo && sauMo.kr === mong && !conGap,
		`AC-5 ban-phim: ${toi ? "Tab toi nut" : "Tab KHONG toi nut"} «${ten}» · Enter → ${sauMo.kr}/${mong} KR · URL ${conGap ? "CON gap" : "khong gap"}`,
	);
}

const DOC_KHO = () => {
	const o = [
		...document.querySelectorAll("[data-hang-so-bo='co'] [data-o-so]"),
	];
	const nhanCat = o.some((el) => {
		const la = [...el.querySelectorAll("*")].find(
			(e) => e.children.length === 0 && e.innerText.trim().length > 0,
		);
		return la ? la.scrollWidth > la.clientWidth + 1 : true;
	});
	const tren = [
		...new Set(o.map((el) => Math.round(el.getBoundingClientRect().top))),
	];
	const nut = document.querySelector("[data-nut-mo-gap-tat-ca]");
	if (nut) nut.scrollIntoView({ block: "center" });
	const b = nut?.getBoundingClientRect();
	return {
		soO: o.length,
		hang: tren.length,
		sw: document.scrollingElement.scrollWidth,
		iw: window.innerWidth,
		nhanCat,
		nutThay:
			b !== undefined &&
			b.width > 0 &&
			b.height > 0 &&
			b.top >= 0 &&
			b.bottom <= window.innerHeight,
	};
};

async function chup(n, ten, duong, kho, toi, chon) {
	const t = await moTrang(n.ck, duong, kho, toi);
	if (!(await cho(t, chon)))
		await khongDo(`KHONG DO DUOC: anh ${ten} khong thay ${chon}`);
	mkdirSync(BANG_CHUNG, { recursive: true });
	await t.screenshot({ path: join(BANG_CHUNG, `${ten}.png`) });
	await dongTrang(t);
	console.log(`ANH ${ten}.png`);
}

export async function e11(n) {
	for (const kho of [DO.kho.rong, DO.kho.hep]) {
		const t = await moTrang(n.ck, duongBo(n, `pb:${n.pb.id}`), kho);
		await cho(t, "[data-hang-so-bo='co'] [data-o-so]");
		const d = await t.evaluate(DOC_KHO);
		await dongTrang(t);
		const hangMong = kho === DO.kho.rong ? 1 : 2;
		const khongCuon = d.sw <= d.iw + DO.lechPx;
		const dat =
			d.soO === 4 &&
			d.hang === hangMong &&
			khongCuon &&
			!d.nhanCat &&
			d.nutThay;
		dong(
			dat,
			`AC-8 ${kho.ten}: ${d.soO} o · ${d.hang} hang (mong ${hangMong}) · ${khongCuon ? "khong cuon ngang" : `CUON NGANG ${d.sw} > ${d.iw}`} · ${d.nhanCat ? "nhan cat" : "nhan du chu"} · nut ${d.nutThay ? "thay khong mo Loc" : "KHONG thay"}`,
		);
	}
	const mot = duongBo(n, `pb:${n.pb.id}`);
	const tc = `/${n.slug}/okr/suc-khoe?${new URLSearchParams({ [THAM.ky]: n.ky.id })}`;
	const chon = "[data-hang-so-bo='co'] [data-o-so]";
	await chup(n, "bco-1440-sang", mot, DO.kho.rong, false, chon);
	await chup(n, "bco-1440-toi", mot, DO.kho.rong, true, chon);
	await chup(n, "bco-375-sang", mot, DO.kho.hep, false, chon);
	await chup(n, "bco-375-toi", mot, DO.kho.hep, true, chon);
	await chup(
		n,
		"bco-toan-canh-1440-sang",
		tc,
		DO.kho.rong,
		false,
		"[data-slot=stat-group]",
	);
	await chup(
		n,
		"bco-toan-canh-375-sang",
		tc,
		DO.kho.hep,
		false,
		"[data-slot=stat-group]",
	);
}
