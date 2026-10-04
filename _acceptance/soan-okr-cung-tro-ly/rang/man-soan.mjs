import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { TRO_LY_OKR_SOAN } from "../../../apps/agent-okr/agent/lib/config.ts";
import { okrSoanMessages } from "../../../apps/app/lib/messages/okr-soan.ts";
import {
	docSoOkr,
	kiemSoTheoKieu,
} from "../../../packages/validation/src/okr-kr.ts";
import {
	GOC,
	idMau,
	laKhoDo,
	napBoMau,
	phienCookie,
	thuMau,
	tre,
	trpc,
	truyVan,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import {
	batAgentOkr,
	cauThieuKhoaSoan,
	chayTrongPhienSoan,
	coKhoaMoHinhSoan,
	PHIEN_SOAN,
	RA_SOAN,
	trongPhienSoan,
} from "./phien-soan.mjs";

const GIAY_MS = 1000;
const PHUT_MS = 60 * GIAY_MS;

const E13 = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: { rong: { rong: 1440, cao: 1000 }, hep: { rong: 390, cao: 844 } },
	cho: {
		manMs: 60 * GIAY_MS,
		luotMs: 3 * PHUT_MS,
		banMs: 20 * GIAY_MS,
		lamMoiMs: 400,
		nhipMs: 500,
	},
	conLan: { soLanToiDa: 40, buocPx: 400, lePx: 16, leMinPx: 40, choMs: 250 },
	quanTri: "le-hai-dang",
	phong: { ma: "kd-bac", truong: "nguyen-thi-lan" },
	chuKy: "nam-ke",
	phaSoan: "lap-ke-hoach",
	chu: {
		duaNhap: "Đưa bản nháp",
		duaNhapLai:
			"Đưa bản nháp ngay bây giờ, dùng những gì bạn đã biết về đơn vị.",
		boMuc: (stt) => `bỏ mục tiêu ${stt}`,
	},
	dich: 10,
	khoiMacDinh: { "giam-xuong": 100, "phan-tram": 50, khac: 0 },
	vongNhanToiDa: 40,
	moDau: TRO_LY_OKR_SOAN.danhGia.moDau.cauHoi,
	banNhapToiThieu: TRO_LY_OKR_SOAN.danhGia.banNhap.mucTieu.min,
	tinhNang: TRO_LY_OKR_SOAN.tinhNang,
	cua: "/eve/agents/okr/",
	lenh: 'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/soan-okr-cung-tro-ly/rang/man-soan.mjs"',
	thongDiep: { khongTao: "dua vao khong tao gi" },
};

const THU_MUC = join(RA_SOAN, "man");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const m = okrSoanMessages("vi");
const KY = idMau("chu-ky", E13.chuKy);
const PHONG = idMau("pb", E13.phong.ma);

const dong = [];
let sai = 0;
let trinhDuyet = null;
let tacTu = null;
let buoc = "";
let slug = null;
let cuocId = null;

async function chiPhi() {
	try {
		const [h] = await truyVan(
			process.env.DATABASE_URL,
			`SELECT count(*)::int AS n, count(*) FILTER (WHERE "costUsd" IS NULL)::int AS rong,
			        coalesce(sum("costUsd"), 0)::float AS usd
			 FROM "aiChiPhi" WHERE "tinhNang" = $1`,
			[E13.tinhNang],
		);
		return `CHI PHI ${E13.tinhNang}: ${h.usd.toFixed(4)} USD · ${h.n} dong AiChiPhi · ${h.rong} dong khong gia`;
	} catch (loi) {
		return `CHI PHI ${E13.tinhNang}: khong doc duoc (${loi?.message ?? loi})`;
	}
}

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	if (tacTu) await tacTu.dung();
	if (laKhoDo()) dong.push(await chiPhi());
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

async function trang(cookie, { rong, cao }) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({ width: rong, height: cao, deviceScaleFactor: 1 });
	p.on("response", (res) => {
		const duong = new URL(res.url()).pathname;
		if (!duong.startsWith(E13.cua) || res.status() < 400) return;
		void res
			.text()
			.catch(() => "")
			.then((than) =>
				dong.push(
					`GHI cua ${res.request().method()} ${duong} tra ${res.status()} ${than.slice(0, 160)}`,
				),
			);
	});
	return { ctx, p, rong };
}

async function moiKho(cookie, lam) {
	for (const kho of Object.values(E13.kho)) {
		const t = await trang(cookie, kho);
		try {
			await lam(t);
		} finally {
			await t.ctx.close();
		}
	}
}

async function viTriCuon(p, chon) {
	return p.evaluate((chon) => {
		const o = [...document.querySelectorAll(chon)].find((x) =>
			x.checkVisibility(),
		);
		if (!o) return null;
		const cuonDuoc = (x) => {
			const kieu = getComputedStyle(x).overflowY;
			return (
				["auto", "scroll", "overlay"].includes(kieu) &&
				x.scrollHeight > x.clientHeight
			);
		};
		let hop = o.parentElement;
		while (hop && hop !== document.body && !cuonDuoc(hop))
			hop = hop.parentElement;
		const khung =
			hop && hop !== document.body
				? hop.getBoundingClientRect()
				: { top: 0, left: 0, bottom: innerHeight, right: innerWidth };
		const tren = Math.max(khung.top, 0);
		const duoi = Math.min(khung.bottom, innerHeight);
		const r = o.getBoundingClientRect();
		return {
			dinh: r.top,
			tren,
			duoi,
			x: (Math.max(khung.left, 0) + Math.min(khung.right, innerWidth)) / 2,
			y: (tren + duoi) / 2,
		};
	}, chon);
}

async function cuonBangConLan(p, chon) {
	for (let i = 0; i < E13.conLan.soLanToiDa; i += 1) {
		const v = await viTriCuon(p, chon);
		if (!v) return false;
		if (v.dinh >= v.tren && v.dinh < v.duoi - E13.conLan.leMinPx) return true;
		const buocCuon = Math.max(
			-E13.conLan.buocPx,
			Math.min(E13.conLan.buocPx, v.dinh - v.tren - E13.conLan.lePx),
		);
		await p.mouse.move(v.x, v.y);
		await p.mouse.wheel({ deltaY: buocCuon });
		await tre(E13.conLan.choMs);
		const sau = await viTriCuon(p, chon);
		if (!sau || sau.dinh === v.dinh) return false;
	}
	return false;
}

async function chup({ p, rong }, ten, toi = null) {
	if (toi)
		kiem(
			`${ten} ${rong}: con lan dua ${toi} vao khung nhin`,
			await cuonBangConLan(p, toi),
		);
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

async function bamKhiYen(p, tim, ...thamSo) {
	const han = Date.now() + E13.cho.manMs;
	for (;;) {
		const h = await p.waitForFunction(
			tim,
			{ timeout: E13.cho.manMs },
			...thamSo,
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

async function bam(p, trong, chu) {
	await bamKhiYen(
		p,
		(trong, chu) =>
			[...document.querySelectorAll(`${trong} button`)].find(
				(x) => x.textContent?.trim() === chu && x.checkVisibility(),
			) ?? null,
		trong,
		chu,
	);
}

async function bamNhan(p, chon) {
	await bamKhiYen(
		p,
		(chon) =>
			[...document.querySelectorAll(chon)]
				.filter((x) => x.checkVisibility())
				.at(-1) ?? null,
		chon,
	);
}

async function bamDau(p, chon) {
	await bamKhiYen(
		p,
		(chon) =>
			[...document.querySelectorAll(chon)].find((x) => x.checkVisibility()) ??
			null,
		chon,
	);
}

async function hien(p, chon, hanMs = E13.cho.manMs) {
	return p
		.waitForSelector(chon, { visible: true, timeout: hanMs })
		.then(() => true)
		.catch(() => false);
}

async function demHien(p, chon) {
	return p.evaluate(
		(chon) =>
			[...document.querySelectorAll(chon)].filter((x) => x.checkVisibility())
				.length,
		chon,
	);
}

async function choDem(p, chon, toiThieu, hanMs) {
	return p
		.waitForFunction(
			(chon, toiThieu) =>
				[...document.querySelectorAll(chon)].filter((x) => x.checkVisibility())
					.length >= toiThieu,
			{ timeout: hanMs },
			chon,
			toiThieu,
		)
		.then(() => true)
		.catch(() => false);
}

async function choDieuKien(doc, hanMs) {
	const han = Date.now() + hanMs;
	while (Date.now() < han) {
		const v = await doc();
		if (v) return v;
		await tre(E13.cho.nhipMs);
	}
	return null;
}

function duongDonVi() {
	return `${APP}/${slug}/okr/theo-don-vi?kyOkr=${KY}&donOkr=pb:${PHONG}`;
}

async function moLaiCuoc(p, dangSoan) {
	await p.goto(duongDonVi(), { waitUntil: "load" });
	if (dangSoan) {
		await bam(p, '[data-nut-soan="nut-tiep"]', m.nut.tiep);
	} else {
		await bamNhan(p, '[data-nut="ds-cuoc"]');
		await hien(p, '[data-cuoc="danh-sach"]');
		await bamNhan(p, `[data-cuoc-id="${cuocId}"] [data-nut="mo-cuoc"]`);
	}
	return hien(
		p,
		`[data-man-soan="${dangSoan ? "dang" : "da-dua-vao"}"]`,
		E13.cho.manMs,
	);
}

async function bamTab(p, tab) {
	const dau = tab === "ban-nhap" ? m.man.banNhap : m.man.tabTroChuyen;
	await bamKhiYen(
		p,
		(dau) =>
			[...document.querySelectorAll('[data-khong="hep"] [role="tab"]')].find(
				(x) => x.textContent?.trim().startsWith(dau) && x.checkVisibility(),
			) ?? null,
		dau,
	);
	return hien(
		p,
		`[data-khong="hep"] [role="tabpanel"] [data-cot="${tab === "ban-nhap" ? "ban-nhap" : "hoi-thoai"}"]`,
	);
}

async function anhHep(
	cookie,
	ten,
	{ dangSoan = true, tab, cho, lam, toi } = {},
) {
	const t = await trang(cookie, E13.kho.hep);
	try {
		kiem(
			`${ten} ${t.rong}: mo lai cuoc bang nut`,
			await moLaiCuoc(t.p, dangSoan),
		);
		if (tab) kiem(`${ten} ${t.rong}: tab ${tab}`, await bamTab(t.p, tab));
		if (cho) kiem(`${ten} ${t.rong}: ${cho} hien`, await hien(t.p, cho));
		if (lam) await lam(t);
		await chup(t, ten, toi);
	} finally {
		await t.ctx.close();
	}
}

async function choLuotXong(p) {
	const ra = await p
		.waitForFunction(
			() => {
				const thay = (chon) =>
					[...document.querySelectorAll(chon)].some((x) => x.checkVisibility());
				if (thay('[data-luot="loi"]')) return "loi";
				if (thay("[data-tu-choi]")) return "tu-choi";
				if (thay('[role="log"] [role="status"][aria-busy="true"]')) return null;
				return thay('[data-o-soan="mo"]') ? "xong" : null;
			},
			{ timeout: E13.cho.luotMs },
		)
		.then((h) => h.jsonValue())
		.catch(() => "het-gio");
	if (ra !== "xong") {
		const chu = await p.evaluate(
			() =>
				[
					...document.querySelectorAll('[data-luot="loi"], [data-tu-choi]'),
				].find((x) => x.checkVisibility())?.innerText ?? "",
		);
		throw new Error(
			`luot tro ly khong xong: ${ra} ${chu.replace(/\s+/g, " ")}`,
		);
	}
}

async function guiChu(p, chu) {
	await bamDau(p, '[data-o-soan="mo"] textarea');
	await p.keyboard.type(chu);
	await p.keyboard.press("Enter");
	if (!(await hien(p, '[data-o-soan="khoa"]', E13.cho.banMs)))
		dong.push(
			`GHI sau khi gui «${chu}» o soan khong khoa trong ${E13.cho.banMs / GIAY_MS} s`,
		);
}

async function buocNut(tl) {
	buoc = "ST-soan-nut";
	await moiKho(tl, async (t) => {
		await t.p.goto(duongDonVi(), { waitUntil: "load" });
		const co = await hien(t.p, '[data-nut-soan="nut"]');
		const chu = co
			? await t.p.$eval('[data-nut-soan="nut"]', (b) => b.textContent?.trim())
			: "";
		kiem(`ST-soan-nut ${t.rong}: nut «${chu}»`, co && chu === m.nut.soan);
		await chup(t, "ST-soan-nut");
	});
}

async function buocMoDau(tl, A) {
	buoc = "ST-soan-mo-dau";
	await A.p.goto(duongDonVi(), { waitUntil: "load" });
	await bamNhan(A.p, '[data-nut-soan="nut"]');
	kiem(
		`ST-soan-mo-dau ${A.rong}: man soan mo`,
		await hien(A.p, '[data-man-soan="dang"]'),
	);
	cuocId = await choDieuKien(
		() => new URL(A.p.url()).searchParams.get("cuocSoan"),
		E13.cho.manMs,
	);
	if (!cuocId) throw new Error("URL khong co cuocSoan sau khi bam nut");
	dong.push(`CUOC ${cuocId}`);
	const mo = await A.p
		.waitForFunction(
			() => {
				const thay = (chon) =>
					[...document.querySelectorAll(chon)].find((x) => x.checkVisibility());
				const hong = thay('[data-luot="loi"], [data-tu-choi]');
				if (hong) return `hong: ${hong.innerText.replace(/\s+/g, " ")}`;
				return thay('[role="log"] [data-goi-y]') ? "goi-y" : null;
			},
			{ timeout: E13.cho.luotMs },
		)
		.then((h) => h.jsonValue())
		.catch(() => "het-gio");
	if (mo !== "goi-y") {
		kiem(`ST-soan-mo-dau ${A.rong}: luot mo dau (${mo})`, false);
		await chup(A, "ST-soan-mo-dau");
		await ket(1);
	}
	const md = await A.p.evaluate(() => {
		const l = [...document.querySelectorAll('[data-luot="tro-ly"]')]
			.filter((x) => x.checkVisibility())
			.at(-1);
		return {
			cau: l ? l.querySelectorAll("[data-cau-hoi]").length : 0,
			goiY: l ? l.querySelectorAll("[data-goi-y]").length : 0,
		};
	});
	kiem(
		`ST-soan-mo-dau ${A.rong}: ${md.cau} cau hoi (${E13.moDau.min}–${E13.moDau.max}), ${md.goiY} goi y`,
		md.cau >= E13.moDau.min && md.cau <= E13.moDau.max && md.goiY >= 1,
	);
	await chup(A, "ST-soan-mo-dau");
	await anhHep(tl, "ST-soan-mo-dau", { cho: '[role="log"] [data-goi-y]' });
}

async function buocTraLoi(A) {
	buoc = "ST-soan-dang-tra-loi";
	await bamDau(A.p, '[role="log"] [data-goi-y]');
	kiem(
		`ST-soan-dang-tra-loi ${A.rong}: dong dang soan hien`,
		await hien(
			A.p,
			'[role="log"] [role="status"][aria-busy="true"]',
			E13.cho.banMs,
		),
	);
	await chup(A, "ST-soan-dang-tra-loi");
	await choLuotXong(A.p);
}

async function dsDong(tl) {
	return (await trpc(API, tl).hoi("okr.soanDanhSach", { cuocSoanId: cuocId }))
		.dong;
}

function soChoKr(kieu, khoiGo) {
	const docDuoc = docSoOkr(khoiGo);
	const khoi = docDuoc ?? E13.khoiMacDinh[kieu] ?? E13.khoiMacDinh.khac;
	if (kieu === "tang-toi") return { khoi, dich: khoi + E13.dich };
	if (kieu === "giam-xuong") {
		const k = khoi > 0 ? khoi : E13.khoiMacDinh["giam-xuong"];
		return { khoi: k, dich: k / 2 };
	}
	if (kieu === "phan-tram")
		return { khoi, dich: Math.min(100, Math.max(0, khoi + E13.dich)) };
	return { khoi, dich: E13.dich };
}

const chuSo = (so) => String(so).replace(".", ",");

async function dienSo(p, tl) {
	const ds = await dsDong(tl);
	const ids = await p.evaluate(() =>
		[...document.querySelectorAll('input[id^="dich-"]')]
			.filter(
				(o) => o.checkVisibility() && !o.disabled && o.value.trim() === "",
			)
			.map((o) => o.id.slice("dich-".length)),
	);
	const daDien = [];
	for (const id of ids) {
		const kr = ds.find((d) => d.id === id && d.loai === "kr-moi");
		if (!kr) continue;
		const oKhoi = `[id="khoi-${id}"]`;
		const khoiGo = await p.$eval(oKhoi, (o) => o.value);
		const so = soChoKr(kr.kieu, khoiGo);
		if (kiemSoTheoKieu(kr.kieu, so.khoi, so.dich) !== null)
			throw new Error(
				`so cho KR ${id} (${kr.kieu}) sai kieu: ${so.khoi} → ${so.dich}`,
			);
		if (docSoOkr(khoiGo) !== so.khoi) {
			await p.$eval(oKhoi, (o) => o.select());
			await p.keyboard.type(chuSo(so.khoi));
		}
		await p.$eval(`[id="dich-${id}"]`, (o) => o.select());
		await p.keyboard.type(chuSo(so.dich));
		daDien.push(`${kr.kieu} ${so.khoi}→${so.dich}`);
	}
	return daDien;
}

async function nhanDong(p, id) {
	const hang = `[data-cot="ban-nhap"] [data-dong="${id}"]`;
	await bam(p, hang, m.banNhap.nut.nhan);
	return hien(p, `${hang}[data-decided]`);
}

async function buocBanNhap(tl, A) {
	buoc = "ST-soan-ban-nhap";
	const khoi = '[data-cot="ban-nhap"] [data-khoi-muc-tieu]';
	let coBan = false;
	for (const chu of [E13.chu.duaNhap, E13.chu.duaNhapLai]) {
		await guiChu(A.p, chu);
		if (chu === E13.chu.duaNhap)
			await anhHep(tl, "ST-soan-dang-tra-loi", {
				cho: '[role="log"] [role="status"][aria-busy="true"]',
			});
		await choLuotXong(A.p);
		coBan = await choDem(A.p, khoi, E13.banNhapToiThieu, E13.cho.manMs);
		if (coBan) break;
		dong.push(`GHI luot «${chu}» chua co ban nhap — gui lai mot lan`);
	}
	const soKhoi = await demHien(A.p, khoi);
	kiem(
		`ST-soan-ban-nhap ${A.rong}: ${soKhoi} Muc tieu nhap (>= ${E13.banNhapToiThieu})`,
		coBan,
	);
	const [db] = await truyVan(
		process.env.DATABASE_URL,
		`SELECT count(*)::int AS n,
		        count(*) FILTER (WHERE dich IS NOT NULL AND jsonb_typeof(dich) <> 'null')::int AS co_dich
		 FROM "okrDeXuat" WHERE "cuocSoanId" = $1`,
		[cuocId],
	);
	kiem(
		`okrDeXuat cua cuoc: ${db.n} dong, ${db.co_dich} dong co dich (may khong ghi dich)`,
		db.n > 0 && db.co_dich === 0,
	);
	await chup(A, "ST-soan-ban-nhap");
	await anhHep(tl, "ST-soan-ban-nhap", {
		tab: "ban-nhap",
		cho: khoi,
	});
	if (!coBan) throw new Error("tro ly khong dua ban nhap sau hai lan");

	buoc = "ST-soan-dong-sua";
	const krDau = await A.p.evaluate(
		() =>
			[...document.querySelectorAll('[data-cot="ban-nhap"] [data-the-kr]')]
				.find((x) => x.checkVisibility())
				?.getAttribute("data-the-kr") ?? null,
	);
	if (!krDau) throw new Error("ban nhap khong co KR nao hien");
	const hang = `[data-cot="ban-nhap"] [data-dong="${krDau}"]`;
	await bam(A.p, hang, m.banNhap.nut.sua);
	kiem(
		`ST-soan-dong-sua ${A.rong}: o sua mo`,
		await hien(A.p, `${hang} [data-slot="proposed-change-edit"]`),
	);
	await chup(A, "ST-soan-dong-sua", hang);
	await anhHep(tl, "ST-soan-dong-sua", {
		tab: "ban-nhap",
		toi: hang,
		lam: async (t) => {
			await bam(t.p, hang, m.banNhap.nut.sua);
			kiem(
				`ST-soan-dong-sua ${t.rong}: o sua mo`,
				await hien(t.p, `${hang} [data-slot="proposed-change-edit"]`),
			);
		},
	});
	await bam(A.p, hang, m.banNhap.nut.huy);

	buoc = "ST-soan-dong-da-quyet";
	await bam(A.p, hang, m.banNhap.nut.nhan);
	kiem(
		`ST-soan-dong-da-quyet ${A.rong}: KR ${krDau} da nhan`,
		await hien(A.p, `${hang}[data-decided="accepted"]`),
	);
	await chup(A, "ST-soan-dong-da-quyet", hang);
	await anhHep(tl, "ST-soan-dong-da-quyet", {
		tab: "ban-nhap",
		cho: `${hang}[data-decided="accepted"]`,
		toi: hang,
	});

	buoc = "nhan-con-lai";
	const giu = await A.p.evaluate(() => {
		const khoi = [
			...document.querySelectorAll(
				'[data-cot="ban-nhap"] [data-khoi-muc-tieu]',
			),
		].filter((x) => x.checkVisibility());
		const cuoi = khoi.at(-1);
		return {
			id: cuoi?.getAttribute("data-khoi-muc-tieu") ?? null,
			stt: khoi.length,
			dong: cuoi
				? [...cuoi.querySelectorAll("[data-dong]")].map((x) =>
						x.getAttribute("data-dong"),
					)
				: [],
		};
	});
	if (!giu.id) throw new Error("ban nhap khong co khoi Muc tieu nao");
	dong.push(
		`GHI de cho Muc tieu ${giu.stt} (${giu.id}) va ${giu.dong.length - 1} dong con cho buoc sua qua chat`,
	);
	const daThu = new Set(giu.dong);
	for (let i = 0; i < E13.vongNhanToiDa; i += 1) {
		const id = await A.p.evaluate(
			(bo) =>
				[
					...document.querySelectorAll(
						'[data-cot="ban-nhap"] [data-the-cho][data-loai-dong="muc-tieu"], [data-cot="ban-nhap"] [data-the-cho][data-loai-dong="kr"]',
					),
				]
					.filter((x) => x.checkVisibility())
					.map((x) => x.getAttribute("data-dong"))
					.find((x) => !bo.includes(x)) ?? null,
			[...daThu],
		);
		if (!id) break;
		daThu.add(id);
		if (!(await nhanDong(A.p, id))) dong.push(`GHI dong ${id} khong nhan duoc`);
	}
	const conCho = await A.p.evaluate(
		(bo) =>
			[
				...document.querySelectorAll(
					'[data-cot="ban-nhap"] [data-the-cho][data-loai-dong="muc-tieu"], [data-cot="ban-nhap"] [data-the-cho][data-loai-dong="kr"]',
				),
			].filter(
				(x) => x.checkVisibility() && !bo.includes(x.getAttribute("data-dong")),
			).length,
		giu.dong,
	);
	kiem(
		`nhan moi Muc tieu va KR ngoai Muc tieu ${giu.stt}: con ${conCho} dong cho`,
		conCho === 0,
	);

	buoc = "ST-soan-dua-vao-thieu-dich";
	await bamNhan(A.p, '[data-nut="dua-vao"]').catch(() => {});
	const tt = await A.p.evaluate(() => {
		const b = [...document.querySelectorAll('[data-nut="dua-vao"]')].find((x) =>
			x.checkVisibility(),
		);
		const d = [...document.querySelectorAll("[data-thieu-dich]")].find((x) =>
			x.checkVisibility(),
		);
		return {
			tat: b?.disabled ?? false,
			chu: d?.innerText.trim() ?? "",
			hop: [...document.querySelectorAll('[role="alertdialog"]')].some((x) =>
				x.checkVisibility(),
			),
		};
	});
	kiem(
		`ST-soan-dua-vao-thieu-dich ${A.rong}: nut tat ${tt.tat}, khong mo hop (${!tt.hop}), «${tt.chu}»`,
		tt.tat && !tt.hop && tt.chu !== "",
	);
	await chup(A, "ST-soan-dua-vao-thieu-dich", '[data-chan="dua-vao"]');
	await anhHep(tl, "ST-soan-dua-vao-thieu-dich", { cho: "[data-thieu-dich]" });

	buoc = "dien-so";
	const daDien = await dienSo(A.p, tl);
	dong.push(`GHI dien so ${daDien.length} KR: ${daDien.join(" · ")}`);
	const conThieu = await demHien(A.p, "[data-thieu-dich]");
	const nutMo = await A.p.evaluate(
		() =>
			[...document.querySelectorAll('[data-nut="dua-vao"]')].find((x) =>
				x.checkVisibility(),
			)?.disabled === false,
	);
	kiem(
		`dien khoi diem va dich: het thieu (${conThieu}), nut dua vao mo (${nutMo})`,
		conThieu === 0 && nutMo,
	);
	return giu;
}

async function buocSuaQuaChat(tl, A, giu) {
	buoc = "ST-soan-sua-qua-chat";
	const daNhan = await A.p.evaluate(() =>
		[
			...document.querySelectorAll(
				'[data-cot="ban-nhap"] [data-dong][data-decided="accepted"]',
			),
		]
			.filter((x) => x.checkVisibility())
			.map((x) => x.getAttribute("data-dong")),
	);
	const hang = `[data-cot="ban-nhap"] [data-dong="${giu.id}"]`;
	const daBo = `${hang}[data-decided="dismissed"] [data-nhan="da-bo"]`;
	const B = await trang(tl, E13.kho.hep);
	let coAnhHep = false;
	try {
		const moB = await moLaiCuoc(B.p, true);
		const tabB = moB && (await bamTab(B.p, "ban-nhap"));
		await guiChu(A.p, E13.chu.boMuc(giu.stt));
		await choLuotXong(A.p);
		kiem(
			`ST-soan-sua-qua-chat ${A.rong}: Muc tieu ${giu.stt} chua quyet roi bang voi nhan «${m.banNhap.nhan["da-bo"]}»`,
			await hien(A.p, daBo),
		);
		const conNhan = await A.p.evaluate(
			(ids) =>
				ids.filter(
					(id) =>
						![
							...document.querySelectorAll(
								`[data-cot="ban-nhap"] [data-dong="${id}"][data-decided="accepted"]`,
							),
						].some((x) => x.checkVisibility()),
				),
			daNhan,
		);
		kiem(
			`sau «${E13.chu.boMuc(giu.stt)}»: ${daNhan.length - conNhan.length}/${daNhan.length} dong da nhan con nguyen${conNhan.length ? ` (mat: ${conNhan.join(", ")})` : ""}`,
			conNhan.length === 0,
		);
		await chup(A, "ST-soan-sua-qua-chat", hang);
		if (tabB) {
			await B.p.evaluate(() =>
				document.dispatchEvent(new Event("visibilitychange")),
			);
			await B.p.bringToFront();
			if (await hien(B.p, daBo)) {
				kiem(`ST-soan-sua-qua-chat ${B.rong}: nhan da bo`, true);
				await chup(B, "ST-soan-sua-qua-chat", hang);
				coAnhHep = true;
			} else
				dong.push(
					`GHI ST-soan-sua-qua-chat ${B.rong}: trang hep mo truoc luot khong doc lai sau luot — anh hep chup tren trang rong thu ve 390`,
				);
			await A.p.bringToFront();
		}
	} finally {
		await B.ctx.close();
	}
	if (!coAnhHep) {
		const H = { ...A, rong: E13.kho.hep.rong };
		await A.p.setViewport({
			width: E13.kho.hep.rong,
			height: E13.kho.hep.cao,
			deviceScaleFactor: 1,
		});
		try {
			kiem(
				`ST-soan-sua-qua-chat ${H.rong}: tab ban-nhap`,
				await bamTab(A.p, "ban-nhap"),
			);
			kiem(
				`ST-soan-sua-qua-chat ${H.rong}: ${daBo} hien`,
				await hien(A.p, daBo),
			);
			await chup(H, "ST-soan-sua-qua-chat", hang);
		} finally {
			await A.p.setViewport({
				width: E13.kho.rong.rong,
				height: E13.kho.rong.cao,
				deviceScaleFactor: 1,
			});
			await hien(A.p, '[data-khong="rong"] [data-cot="ban-nhap"]');
		}
	}
	const them = await dienSo(A.p, tl);
	if (them.length > 0)
		dong.push(
			`GHI dien so them ${them.length} KR sau luot sua: ${them.join(" · ")}`,
		);
}

async function demMucTieuPhong() {
	const [h] = await truyVan(
		process.env.DATABASE_URL,
		`SELECT count(*)::int AS n FROM "okrObjective" WHERE "cycleId" = $1 AND "departmentId" = $2`,
		[KY, PHONG],
	);
	return h.n;
}

async function buocDuaVao(tl, A) {
	buoc = "ST-soan-dua-vao-xac-nhan";
	const truocN = await demMucTieuPhong();
	const dem = await A.p.evaluate(() => {
		const dem = (loai) =>
			[
				...document.querySelectorAll(
					`[data-cot="ban-nhap"] [data-loai-dong="${loai}"][data-decided="accepted"]`,
				),
			].filter((x) => x.checkVisibility()).length;
		return {
			mt: dem("muc-tieu"),
			kr: dem("kr"),
			nut:
				[...document.querySelectorAll('[data-nut="dua-vao"]')]
					.find((x) => x.checkVisibility())
					?.textContent?.trim() ?? "",
		};
	});
	dong.push(
		`GHI truoc dua vao: ${truocN} Muc tieu cua phong trong chu ky; nut «${dem.nut}»`,
	);
	kiem(
		`nut dua vao dem ${dem.mt} Muc tieu, ${dem.kr} KR da nhan`,
		dem.nut === m.banNhap.duaVao(String(dem.mt), String(dem.kr)),
	);
	await bamNhan(A.p, '[data-nut="dua-vao"]');
	kiem(
		`ST-soan-dua-vao-xac-nhan ${A.rong}: hop xac nhan mo`,
		await hien(A.p, '[role="alertdialog"]'),
	);
	await chup(A, "ST-soan-dua-vao-xac-nhan");
	await anhHep(tl, "ST-soan-dua-vao-xac-nhan", {
		lam: async (t) => {
			await bamTab(t.p, "ban-nhap");
			await dienSo(t.p, tl);
			await bamNhan(t.p, '[data-nut="dua-vao"]');
			kiem(
				`ST-soan-dua-vao-xac-nhan ${t.rong}: hop xac nhan mo`,
				await hien(t.p, '[role="alertdialog"]'),
			);
		},
	});

	buoc = "ST-soan-da-dua-vao";
	await bam(A.p, '[role="alertdialog"]', m.banNhap.xacNhan.nut);
	kiem(
		`ST-soan-da-dua-vao ${A.rong}: bao da dua vao`,
		await hien(A.p, "[data-da-dua-vao]", E13.cho.manMs),
	);
	await chup(A, "ST-soan-da-dua-vao", "[data-da-dua-vao]");
	const sauN = await demMucTieuPhong();
	if (!(truocN < sauN)) {
		dong.push(`${E13.thongDiep.khongTao}: truoc ${truocN}, sau ${sauN}`);
		await ket(3);
	}
	kiem(
		`Muc tieu cua phong tang ${sauN - truocN} = so Muc tieu da nhan ${dem.mt}`,
		sauN - truocN === dem.mt,
	);
	const tao = await truyVan(
		process.env.DATABASE_URL,
		`SELECT "taoRaId", "noiDung" ->> 'loai' AS loai FROM "okrDeXuat"
		 WHERE "cuocSoanId" = $1 AND "taoRaId" IS NOT NULL`,
		[cuocId],
	);
	const [vet] = await truyVan(
		process.env.DATABASE_URL,
		`SELECT count(*)::int AS n FROM "okrTrail" WHERE note LIKE $1`,
		[`soan-okr:${cuocId}:%`],
	);
	kiem(
		`OkrTrail soan-okr:${cuocId}:* co ${vet.n} hang >= ${tao.length} ban ghi da tao (>= ${dem.mt + dem.kr})`,
		vet.n >= tao.length && tao.length >= dem.mt + dem.kr,
	);
	const donVi = await trpc(API, tl).hoi("okr.byUnit", {
		cycleId: KY,
		unit: { loai: "pb", id: PHONG },
	});
	const idTao = new Set(tao.map((h) => h.taoRaId));
	const nhapMoi = donVi.objectives.filter(
		(o) => idTao.has(o.id) && o.status === "nhap",
	).length;
	kiem(
		`okr.byUnit cua phong doc lai ${nhapMoi} Muc tieu nhap moi = ${dem.mt}`,
		nhapMoi === dem.mt,
	);
	await anhHep(tl, "ST-soan-da-dua-vao", {
		dangSoan: false,
		tab: "ban-nhap",
		cho: "[data-da-dua-vao]",
	});
}

async function buocSauKhi(tl) {
	buoc = "ST-cuoc-danh-sach";
	await moiKho(tl, async (t) => {
		await t.p.goto(duongDonVi(), { waitUntil: "load" });
		const coDs = await hien(t.p, '[data-nut="ds-cuoc"]');
		const conTiep = await demHien(t.p, '[data-nut-soan="nut-tiep"]');
		kiem(
			`sau khi dua vao ${t.rong}: co nut danh sach (${coDs}), khong con «${m.nut.tiep}» (${conTiep})`,
			coDs && conTiep === 0,
		);
		await bamNhan(t.p, '[data-nut="ds-cuoc"]');
		kiem(
			`ST-cuoc-danh-sach ${t.rong}: danh sach co cuoc ${cuocId}`,
			await hien(t.p, `[data-cuoc="danh-sach"] [data-cuoc-id="${cuocId}"]`),
		);
		await chup(t, "ST-cuoc-danh-sach");
	});
}

async function buocHep(tl) {
	buoc = "ST-soan-hep";
	const t = await trang(tl, E13.kho.hep);
	try {
		kiem(`ST-soan-hep ${t.rong}: mo lai cuoc`, await moLaiCuoc(t.p, false));
		kiem(
			`ST-soan-hep ${t.rong}: hai tab`,
			await hien(t.p, '[data-khong="hep"] [role="tablist"]'),
		);
		await chup(t, "ST-soan-hep");
		kiem(
			`ST-soan-hep-ban-nhap ${t.rong}: tab ban nhap`,
			await bamTab(t.p, "ban-nhap"),
		);
		await chup(t, "ST-soan-hep-ban-nhap");
	} finally {
		await t.ctx.close();
	}
}

async function buocSoDo(qt) {
	buoc = "ST-sodo-soan";
	await moiKho(qt, async (t) => {
		await t.p.goto(`${APP}/${slug}/settings/okr`, { waitUntil: "load" });
		kiem(
			`ST-sodo-soan ${t.rong}: the so do soan da tai`,
			await hien(t.p, '[data-the="soan-so-do"]:not([aria-busy])'),
		);
		await chup(t, "ST-sodo-soan", '[data-the="soan-so-do"]');
	});
}

if (!trongPhienSoan()) {
	console.log(
		"-- phien nay chua co agent-okr (thieu OKR_AGENT_BRIDGE_SECRET/OKR_AGENT_URL) — mo phien do rieng",
	);
	process.exit(await chayTrongPhienSoan(E13.lenh));
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

let qt;
let tl;
try {
	buoc = "chuan-bi";
	const nap = napBoMau();
	if (nap.ma !== 0)
		throw new Error(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	dong.push(`NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
	qt = phienCookie(thuMau(E13.quanTri));
	tl = phienCookie(thuMau(E13.phong.truong));
	slug = await suySlug(qt);
	if (!slug)
		throw new Error(`${APP}/ khong chuyen toi trang chinh cua workspace`);
	await trpc(API, qt).lam("okr.setProgram", {
		aiOn: true,
		aiSoanPhamVi: "danh-sach",
		aiSoanDonVi: [PHONG],
	});
	const ct = await trpc(API, qt).hoi("okr.program");
	kiem(
		`setProgram: aiOn ${ct.aiOn}, soan ${ct.aiSoanPhamVi} [${ct.aiSoanDonVi}]`,
		ct.aiOn === true && ct.aiSoanDonVi.includes(PHONG),
	);
	const ky = (await trpc(API, qt).hoi("okr.cycles")).cycles.find(
		(c) => c.id === KY,
	);
	if (ky?.phase !== E13.phaSoan)
		throw new Error(
			`chu ky ${KY} o pha ${ky?.phase ?? "khong co"}, can ${E13.phaSoan}`,
		);
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

try {
	buoc = "bat-agent-okr";
	tacTu = await batAgentOkr({
		cong: Number(process.env[PHIEN_SOAN.bienCong]),
		thuMuc: THU_MUC,
	});
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}
if (tacTu.cay.ket !== "dung-cay")
	await khongDo(
		`agent-okr o ${tacTu.url} phuc vu cay ${tacTu.cay.co}, can ${tacTu.cay.can}`,
	);
dong.push(`AGENT-OKR ${tacTu.url} · cay ${tacTu.cay.co}`);
if (!coKhoaMoHinhSoan()) await khongDo(cauThieuKhoaSoan());

mkdirSync(THU_MUC, { recursive: true });
trinhDuyet = await puppeteer.launch({
	executablePath: E13.chrome,
	headless: true,
});

try {
	await buocNut(tl);
	const A = await trang(tl, E13.kho.rong);
	await buocMoDau(tl, A);
	await buocTraLoi(A);
	const giu = await buocBanNhap(tl, A);
	await buocSuaQuaChat(tl, A, giu);
	await buocDuaVao(tl, A);
	await A.ctx.close();
	await buocSauKhi(tl);
	await buocHep(tl);
	await buocSoDo(qt);
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

await ket(sai === 0 ? 0 : 1);
