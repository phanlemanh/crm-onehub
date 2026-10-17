import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { okrMessages } from "../../../apps/app/lib/messages/okr.ts";
import { okrKhepMessages } from "../../../apps/app/lib/messages/okr-khep.ts";
import {
	idMau,
	laKhoDo,
	napBoMau,
	phienCookie,
	thuMau,
	tre,
	trpc,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const GIAY_MS = 1000;
const KB = 1024;

const MTKR = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		rong: { rong: 1440, cao: 1000 },
		hep: { rong: 375, cao: 812 },
	},
	cho: {
		manMs: 120 * GIAY_MS,
		taiMs: 180 * GIAY_MS,
		lamMoiMs: 400,
		yenMs: 1500,
		nhipMs: 300,
		bamMs: 10 * GIAY_MS,
	},
	nguoi: { quanTri: "le-hai-dang", phuTrach: "tran-quoc-bao" },
	ma: {
		boPhan: "kinh-doanh",
		phongBanAnh: "phap-che",
		chuKy: "quy4",
		chuKyCham: "quy3",
		mucTieuSheet: "q4-kd-bac-1",
	},
	gieo: {
		mucTieu: {
			title: "Khối Kinh doanh giữ chân đối tác mới sau đơn đầu",
			kind: "tham-vong",
			whyNow: "",
		},
		doDaiTenDai: 120,
		tenDai: "GiaoHangDungHen".repeat(8),
		kr: [
			{
				kind: "tang-toi",
				startValue: 0,
				targetValue: 100,
				currentValue: 40,
				unit: "",
				dueOn: null,
				weight: 1,
			},
			{
				title: "Số đối tác mới đặt đơn thứ hai trong quý đạt 20",
				kind: "tang-toi",
				startValue: 0,
				targetValue: 20,
				currentValue: 5,
				unit: "đối tác",
				dueOn: null,
				weight: 1,
			},
		],
		lyDoMoLai: "Mở lại quý 3 để đo màn chấm điểm của vòng muc-tieu-va-kr",
	},
	toiThieu: {
		"cua-toi": { mt: 2, kr: 4 },
		"theo-don-vi": { mt: 2, kr: 4 },
		sheet: { mt: 1, kr: 2 },
		cham: { mt: 2, kr: 4 },
	},
	theoDonViAnh: { mt: 3 },
	anh: { toiThieuByte: 10 * KB },
	proto: {
		slug: "muc-tieu-va-kr",
		hienTai: "ST-hien-tai",
		cuaToi: "ST-cua-toi",
		vungHienTai: "[data-ban-hien-tai]",
		vungCuaToi: "[data-muc-tieu]",
	},
	doDo: { rongPx: 500 },
	theme: { sang: "light", toi: "dark" },
	coDo: "--kiem-do-do",
	coDoRong: "--kiem-do-do-rong",
	coDoCuon: "--kiem-do-do-cuon",
	bienProto: "PROTO_ROUTE",
	hauToCayProto: "proto",
	thongDiep: {
		ngoaiKhung: "muc tieu ngoai khung",
		reloadMat: "reload mat trang thai thu",
		tranNgang: "tran ngang",
		bangCuon: "bang cuon ngang",
		bangCuonDoc: "bang cuon doc",
		manRong: "man rong",
		thieuViSao: "thieu khu vi-sao trong anh",
		thieuGopVao: "thieu khu gop-vao trong anh",
	},
	maNgat: { SIGINT: 130, SIGTERM: 143, SIGHUP: 129 },
	lenh: "bun _acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs",
};

const CO_DO = process.argv.includes(MTKR.coDo);
const CO_DO_RONG = process.argv.includes(MTKR.coDoRong);
const CO_DO_CUON = process.argv.includes(MTKR.coDoCuon);
const ANH = join(
	GOC,
	CO_DO || CO_DO_RONG || CO_DO_CUON
		? ".acceptance-runs/muc-tieu-va-kr/do-do"
		: "_acceptance/muc-tieu-va-kr/evidence",
);
const SOI = join(GOC, ".acceptance-runs/muc-tieu-va-kr/soi");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const m = okrMessages("vi");
const mk = okrKhepMessages("vi").cham;
const T = MTKR.thongDiep;

const dong = [];
let sai = 0;
let trinhDuyet = null;

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
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

function tenCay() {
	const top = spawnSync("git", ["rev-parse", "--show-toplevel"], {
		cwd: GOC,
		encoding: "utf8",
	});
	const ten =
		process.env.PHIEN_DO_TEN_CAY ??
		(top.status === 0 ? top.stdout.trim().split("/").pop() : "crm");
	return `${ten}-${MTKR.hauToCayProto}`;
}

function urlKhoChung() {
	const u = new URL(process.env.DATABASE_URL ?? "");
	u.pathname = "/postgres";
	return u.toString();
}

async function chayLaiCoProto() {
	const co = [MTKR.coDo, MTKR.coDoRong, MTKR.coDoCuon].filter((c) =>
		process.argv.includes(c),
	);
	const lenh = [MTKR.lenh, ...co].join(" ");
	const env = {
		...process.env,
		DATABASE_URL: urlKhoChung(),
		[MTKR.bienProto]: "1",
		PHIEN_DO_TEN_CAY: tenCay(),
	};
	delete env.PHIEN_DO;
	delete env.APP_URL;
	delete env.API_URL;
	console.log(
		`-- ${MTKR.bienProto} khong bang "1" trong phien nay: mo phien do rieng cay ${env.PHIEN_DO_TEN_CAY} co ${MTKR.bienProto}=1`,
	);
	const con = spawn(
		"bun",
		[join(GOC, "scripts/lan-do/tien-de.mjs"), "--chay", lenh],
		{ cwd: GOC, stdio: "inherit", env },
	);
	for (const tin of Object.keys(MTKR.maNgat))
		process.on(tin, () => con.kill(tin));
	return new Promise((xong) => {
		con.on("error", () => xong(2));
		con.on("exit", (ma, tin) => xong(ma ?? MTKR.maNgat[tin] ?? 2));
	});
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

async function trang(cookie, { rong, cao }, theme) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	if (cookie)
		await ctx.setCookie(
			{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
			{ name: "lang", value: "vi", domain: host, path: "/" },
		);
	const p = await ctx.newPage();
	await p.setViewport({ width: rong, height: cao, deviceScaleFactor: 1 });
	await p.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: MTKR.theme[theme] },
	]);
	p.setDefaultNavigationTimeout(MTKR.cho.taiMs);
	return { ctx, p, rong, theme };
}

async function moTrang(t, duong, cho) {
	await t.p.goto(`${APP}${duong}`, { waitUntil: "load" });
	await t.p.waitForFunction(
		(cho) => document.querySelector(cho) !== null,
		{ timeout: MTKR.cho.manMs },
		cho,
	);
	await t.p.evaluate(() => document.fonts.ready);
	await tre(MTKR.cho.yenMs);
}

async function chup(t, ten) {
	await tre(MTKR.cho.lamMoiMs);
	await t.p.evaluate(() => {
		for (const s of [
			"nextjs-portal",
			".tsqd-parent-container",
			".tsqd-open-btn-container",
		])
			for (const el of document.querySelectorAll(s)) el.remove();
	});
	await t.p.evaluate(() => document.fonts.ready);
	const tep = join(ANH, `${ten}.png`);
	await t.p.screenshot({ path: tep });
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
	return tep;
}

function docKhung(vungSel) {
	const hien = (o) => o.checkVisibility() && o.offsetParent !== null;
	const vung = document.querySelector(vungSel);
	const khoi = [...document.querySelectorAll("[data-muc-tieu]")].map((k) => {
		const id = k.getAttribute("data-muc-tieu");
		const bang = k.querySelectorAll("table");
		const t = bang[0] ?? null;
		const hang = t?.querySelector("[data-hang-muc-tieu]") ?? null;
		const o = hang
			? [...hang.querySelectorAll("[data-o-tien-do]")].filter(hien)
			: [];
		const chu = o[0]?.innerText ?? "";
		const phan = [...chu.matchAll(/(\d+)\s*%/g)].map((x) => Number(x[1]));
		const vach = o[0]?.querySelector("[data-expected]") ?? null;
		return {
			id,
			soTable: bang.length,
			hangId: hang?.getAttribute("data-hang-muc-tieu") ?? null,
			krTable: t
				? [...t.querySelectorAll("[data-kr]")].map((x) =>
						x.getAttribute("data-kr"),
					)
				: [],
			krKhoi: [...k.querySelectorAll("[data-kr]")].map((x) =>
				x.getAttribute("data-kr"),
			),
			soO: o.length,
			phan: phan.at(-1) ?? null,
			vach: vach ? Number(vach.getAttribute("data-expected")) : null,
			dongHang: hang?.innerText.replace(/\s+/g, " ") ?? "",
		};
	});
	return {
		coVung: vung !== null,
		cardHeader: vung
			? vung.querySelectorAll('[data-slot="card-header"]').length
			: -1,
		khoi,
	};
}

function vachMongDoi(expected) {
	return expected === null || expected === 0
		? null
		: Math.max(0, Math.min(100, Math.round(expected)));
}

function kiemE1(ref, so, nhan) {
	kiem(`${nhan}: co vung danh sach`, so.coVung);
	kiem(
		`${nhan}: vung danh sach co ${so.cardHeader} [data-slot=card-header] (can 0)`,
		so.cardHeader === 0,
	);
	const idTrang = so.khoi.map((k) => k.id);
	const idRef = ref.map((r) => r.id);
	for (const id of idTrang.filter((x) => !idRef.includes(x)))
		kiem(`${nhan}: khoi la khong co trong nguon: ${id}`, false);
	let soKr = 0;
	for (const r of ref) {
		const k = so.khoi.find((x) => x.id === r.id);
		const trong =
			k !== undefined &&
			k.soTable === 1 &&
			k.hangId === r.id &&
			r.krIds.every((id) => k.krTable.includes(id)) &&
			k.krTable.length === r.krIds.length &&
			k.krKhoi.length === k.krTable.length;
		if (!trong) {
			kiem(
				`${T.ngoaiKhung}: ${r.id} (khoi ${k ? "co" : "khong co"}, table ${k?.soTable ?? 0}, hang ${k?.hangId ?? "khong"}, kr trong table ${k?.krTable.length ?? 0}/${r.krIds.length})`,
				false,
			);
			continue;
		}
		soKr += r.krIds.length;
		kiem(
			`${nhan} ${r.id}: mot table chua hang muc tieu va ${k.krTable.length}/${r.krIds.length} hang KR`,
			true,
		);
		kiem(
			`${nhan} ${r.id}: dung mot o tien do hien tren hang muc tieu (${k.soO})`,
			k.soO === 1,
		);
		kiem(
			`${nhan} ${r.id}: chu ${k.phan}% == progress ${r.progress} cua API`,
			k.phan === r.progress,
		);
		const vach = vachMongDoi(r.expected);
		kiem(
			`${nhan} ${r.id}: vach [data-expected]=${k.vach} == expected ${r.expected}${vach === null ? " (vang)" : ` (lam tron ${vach})`}`,
			k.vach === vach,
		);
		const tinh = m.khoiMucTieu.tinhTu(r.krIds.length);
		kiem(`${nhan} ${r.id}: dong phu co «${tinh}»`, k.dongHang.includes(tinh));
	}
	ghi(
		`${nhan}: ma tran ${ref.length} muc tieu (nguon) · ${idTrang.length} khoi tren trang · ${soKr} KR da so`,
	);
}

async function buocE1(ctx, theme) {
	const t = await trang(ctx.pt, MTKR.kho.rong, theme);
	try {
		await moTrang(
			t,
			`/${ctx.slug}/okr`,
			'[data-trang-thai="ST-cuatoi-codulieu"] [data-muc-tieu]',
		);
		const so = await t.p.evaluate(
			docKhung,
			'[data-trang-thai="ST-cuatoi-codulieu"]',
		);
		kiemE1(ctx.mine, so, `E1 1440 ${theme}`);
		await chup(t, `E1-1440-${theme}`);
	} finally {
		await t.ctx.close();
	}
}

async function soKrKhoi(p, id) {
	return p.evaluate(
		(id) =>
			document.querySelectorAll(`[data-muc-tieu="${id}"] [data-kr]`).length,
		id,
	);
}

async function bamMuiTen(p, id, moMuon) {
	const han = Date.now() + MTKR.cho.manMs;
	while (Date.now() < han) {
		const nut = await p.$(`[data-hang-muc-tieu="${id}"] button[aria-expanded]`);
		if (nut) {
			await nut.click().catch(() => {});
			const dat = await p
				.waitForFunction(
					(id, moMuon) =>
						document
							.querySelector(
								`[data-hang-muc-tieu="${id}"] button[aria-expanded]`,
							)
							?.getAttribute("aria-expanded") === String(moMuon),
					{ timeout: MTKR.cho.bamMs },
					id,
					moMuon,
				)
				.then(() => true)
				.catch(() => false);
			if (dat) return true;
		}
		await tre(MTKR.cho.nhipMs);
	}
	return false;
}

async function docThu(p, id) {
	return p.evaluate((id) => {
		const nut = document.querySelector(
			`[data-hang-muc-tieu="${id}"] button[aria-expanded]`,
		);
		return {
			aria: nut?.getAttribute("aria-expanded") ?? null,
			search: location.search,
		};
	}, id);
}

function coThu(search, id) {
	const gia = new URLSearchParams(search).get("thuMucTieu");
	return gia === null ? null : gia.split(",").includes(id);
}

async function chuyenDong(p, id) {
	return p.evaluate((id) => {
		const nut = document.querySelector(
			`[data-hang-muc-tieu="${id}"] button[aria-expanded]`,
		);
		const icon = nut?.querySelector('[class*="transition-transform"]') ?? null;
		if (!icon) return null;
		const cs = getComputedStyle(icon);
		return {
			duration: cs.transitionDuration,
			property: cs.transitionProperty,
		};
	}, id);
}

async function e5ThuVaTaiLai(t, duong, cho, nhan, chupTen) {
	await moTrang(t, duong, cho);
	const id = await t.p.evaluate(
		() =>
			document
				.querySelector("[data-muc-tieu]")
				?.getAttribute("data-muc-tieu") ?? null,
	);
	if (!kiem(`${nhan}: co muc tieu dau (${id})`, id !== null)) return null;
	const truoc = await soKrKhoi(t.p, id);
	kiem(`${nhan} ${id}: truoc khi thu co ${truoc} hang KR (> 0)`, truoc > 0);
	const daBam = await bamMuiTen(t.p, id, false);
	kiem(`${nhan} ${id}: bam mui ten doi aria-expanded`, daBam);
	await tre(MTKR.cho.lamMoiMs);
	const sau = await soKrKhoi(t.p, id);
	const doc = await docThu(t.p, id);
	kiem(`${nhan} ${id}: sau bam con ${sau} hang [data-kr] (can 0)`, sau === 0);
	kiem(
		`${nhan} ${id}: aria-expanded=${doc.aria} (can false)`,
		doc.aria === "false",
	);
	ghi(`${nhan}: location.search sau bam «${doc.search}»`);
	if (chupTen) await chup(t, chupTen);
	await t.p.reload({ waitUntil: "load" });
	await t.p.waitForFunction(
		(id) => document.querySelector(`[data-hang-muc-tieu="${id}"]`) !== null,
		{ timeout: MTKR.cho.manMs },
		id,
	);
	await tre(MTKR.cho.yenMs);
	const sauTai = await soKrKhoi(t.p, id);
	kiem(
		sauTai === 0
			? `${nhan} ${id}: sau tai lai con 0 hang [data-kr]`
			: `${T.reloadMat}: ${id} co ${sauTai} hang [data-kr] sau tai lai`,
		sauTai === 0,
	);
	return { id, doc };
}

async function buocE5(ctx) {
	const t = await trang(ctx.pt, MTKR.kho.rong, "sang");
	try {
		const r = await e5ThuVaTaiLai(
			t,
			`/${ctx.slug}/okr`,
			'[data-trang-thai="ST-cuatoi-codulieu"] [data-muc-tieu]',
			"E5 1440",
			"E5-da-thu",
		);
		if (!r) return;
		kiem(
			`E5 1440 ${r.id}: location.search co thuMucTieu=${r.id}`,
			coThu(r.doc.search, r.id) === true,
		);
		const moLai = await bamMuiTen(t.p, r.id, true);
		await t.p
			.waitForFunction(
				(id) =>
					document.querySelectorAll(`[data-muc-tieu="${id}"] [data-kr]`)
						.length > 0,
				{ timeout: MTKR.cho.bamMs },
				r.id,
			)
			.catch(() => {});
		await tre(MTKR.cho.lamMoiMs);
		const doc = await docThu(t.p, r.id);
		kiem(
			`E5 1440 ${r.id}: mo lai (${moLai}) → location.search «${doc.search}» khong con thuMucTieu`,
			moLai && new URLSearchParams(doc.search).get("thuMucTieu") === null,
		);
		ghi(
			`E5 1440 ${r.id}: sau mo lai ${await soKrKhoi(t.p, r.id)} hang [data-kr]`,
		);
		const thuong = await chuyenDong(t.p, r.id);
		ghi(
			`E5 no-preference: icon transition-duration ${thuong?.duration} · property ${thuong?.property}`,
		);
		await t.p.emulateMediaFeatures([
			{ name: "prefers-color-scheme", value: MTKR.theme.sang },
			{ name: "prefers-reduced-motion", value: "reduce" },
		]);
		await tre(MTKR.cho.lamMoiMs);
		const giam = await chuyenDong(t.p, r.id);
		kiem(
			`E5 prefers-reduced-motion reduce: icon transition-duration ${giam?.duration} (can 0s) · property ${giam?.property}`,
			giam?.duration === "0s",
		);
	} finally {
		await t.ctx.close();
	}
}

function docMan(cauHinh) {
	const hien = (o) => o.checkVisibility() && o.offsetParent !== null;
	const ten = (hang) => hang.querySelector('[translate="no"]');
	const hangMt = [...document.querySelectorAll(cauHinh.mt)];
	const hangKr = [...document.querySelectorAll(cauHinh.kr)];
	const tienDo = (hang) => {
		const td = ten(hang)?.closest("td") ?? null;
		const o = [...hang.querySelectorAll("[data-o-tien-do]")].filter(hien);
		return {
			id: hang.getAttribute(cauHinh.idMt) ?? hang.getAttribute(cauHinh.idKr),
			ok: td !== null && o.length === 1 && o[0].closest("td") === td,
			mo: `${o.length} o hien${o.length === 1 && td && o[0].closest("td") !== td ? ", khac td" : ""}`,
		};
	};
	const diemMt = (hang) => {
		const td = ten(hang)?.closest("td") ?? null;
		const id = hang.getAttribute(cauHinh.idMt);
		const nhan = cauHinh.nhanMt[id] ?? null;
		const thay = td
			? [...td.querySelectorAll("*")]
					.filter(hien)
					.map((o) => o.innerText.trim())
					.find((c) => nhan !== null && c.startsWith(nhan))
			: undefined;
		return { id, ok: thay !== undefined, mo: `«${thay ?? nhan}»` };
	};
	const diemKr = (hang) => {
		const td = ten(hang)?.closest("td") ?? null;
		const o = td
			? [...td.querySelectorAll("[data-o-diem],[data-diem-doc]")].filter(hien)
			: [];
		return {
			id: hang.getAttribute(cauHinh.idKr),
			ok: o.length >= 1,
			mo: `${o.length} o diem hien cung td`,
		};
	};
	const neo = cauHinh.khung ? document.querySelector(cauHinh.khung) : null;
	const khung = neo ? (neo.closest('[role="dialog"]') ?? neo) : null;
	return {
		sw: document.documentElement.scrollWidth,
		iw: window.innerWidth,
		soMt: hangMt.length,
		soKr: hangKr.length,
		mt:
			cauHinh.kieu === "diem"
				? hangMt.map(diemMt)
				: cauHinh.khung
					? hangMt.map((h) => {
							const o = h.querySelector("[data-tien-do-tu]");
							return {
								id: h.getAttribute(cauHinh.idMt),
								ok: o !== null && hien(o),
								mo: "[data-tien-do-tu] hien",
							};
						})
					: hangMt.map(tienDo),
		kr: cauHinh.kieu === "diem" ? hangKr.map(diemKr) : hangKr.map(tienDo),
		khungTran: khung ? { sw: khung.scrollWidth, cw: khung.clientWidth } : null,
		soBang: [
			...document.querySelectorAll('[data-slot="table-container"]'),
		].filter((o) => hien(o) && o.closest(cauHinh.khoiCuon) !== null).length,
		cuon: [...document.querySelectorAll('[data-slot="table-container"]')]
			.filter(
				(o) =>
					hien(o) &&
					o.closest(cauHinh.khoiCuon) !== null &&
					o.scrollWidth > o.clientWidth + 1,
			)
			.map((o) => ({
				the:
					o
						.closest("[data-muc-tieu],[data-okr-sheet],[data-muc-tieu-cham]")
						?.getAttributeNames()
						.filter((a) => a.startsWith("data-"))
						.map((a) => `${a}=${o.closest(`[${a}]`)?.getAttribute(a)}`)[0] ??
					"table-container",
				du: o.scrollWidth - o.clientWidth,
			})),
		cuonDoc: [...document.querySelectorAll('[data-slot="table-container"]')]
			.filter(
				(o) =>
					hien(o) &&
					o.closest(cauHinh.khoiCuon) !== null &&
					o.scrollHeight > o.clientHeight + 1,
			)
			.map((o) => ({
				the:
					o
						.closest("[data-muc-tieu],[data-okr-sheet],[data-muc-tieu-cham]")
						?.getAttributeNames()
						.filter((a) => a.startsWith("data-"))
						.map((a) => `${a}=${o.closest(`[${a}]`)?.getAttribute(a)}`)[0] ??
					"table-container",
				du: o.scrollHeight - o.clientHeight,
			})),
		ngoaiMan: [...hangMt, ...hangKr]
			.flatMap((h) => [...h.querySelectorAll('[translate="no"]')])
			.filter(
				(o) => hien(o) && o.getBoundingClientRect().right > innerWidth + 1,
			)
			.map((o) => ({
				chu: o.innerText.slice(0, 24),
				phai: Math.round(o.getBoundingClientRect().right),
			})),
	};
}

function kiemTran(so, nhan) {
	kiem(
		so.sw === so.iw
			? `${nhan}: scrollWidth ${so.sw} == innerWidth ${so.iw}`
			: `${T.tranNgang} ${nhan}: scrollWidth ${so.sw} != innerWidth ${so.iw}`,
		so.sw === so.iw,
	);
}

function kiemE13(man, so, nhan) {
	kiemTran(so, nhan);
	const can = MTKR.toiThieu[man];
	ghi(
		`${nhan}: ${so.soMt} hang muc tieu · ${so.soKr} hang KR (toi thieu ${can.mt} · ${can.kr})`,
	);
	if (so.soMt < can.mt || so.soKr < can.kr) {
		kiem(
			`${T.manRong}: ${man} (${nhan}: ${so.soMt}/${can.mt} muc tieu, ${so.soKr}/${can.kr} KR)`,
			false,
		);
		return;
	}
	for (const [loai, ds] of [
		["muc tieu", so.mt],
		["KR", so.kr],
	]) {
		const hong = ds.filter((h) => !h.ok);
		kiem(
			`${nhan}: ${ds.length - hong.length}/${ds.length} hang ${loai} co tien do/diem hien cung td voi ten${hong.length > 0 ? ` — hong ${hong.map((h) => `${h.id} (${h.mo})`).join(", ")}` : ""}`,
			hong.length === 0,
		);
	}
	if (so.khungTran)
		ghi(
			`${nhan}: khung sheet scrollWidth ${so.khungTran.sw} · clientWidth ${so.khungTran.cw}`,
		);
	kiemCuon(man, so, nhan);
}

function kiemCuon(man, so, nhan) {
	kiem(
		so.cuon.length === 0
			? `${nhan}: 0/${so.soBang} table-container trong khoi cuon ngang (scrollWidth <= clientWidth + 1)`
			: `${T.bangCuon}: ${man} (${nhan}: ${so.cuon.length}/${so.soBang} table-container — ${so.cuon.map((c) => `${c.the} +${c.du}px`).join(", ")})`,
		so.cuon.length === 0,
	);
	kiem(
		so.cuonDoc.length === 0
			? `${nhan}: 0/${so.soBang} table-container trong khoi cuon doc (scrollHeight <= clientHeight + 1)`
			: `${T.bangCuonDoc}: ${man} (${nhan}: ${so.cuonDoc.length}/${so.soBang} table-container — ${so.cuonDoc.map((c) => `${c.the} +${c.du}px`).join(", ")})`,
		so.cuonDoc.length === 0,
	);
	ghi(
		`${nhan}: ${so.ngoaiMan.length} chu ten vuot mep phai${so.ngoaiMan.length > 0 ? ` (${so.ngoaiMan.map((c) => `«${c.chu}…» phai ${c.phai}`).join(", ")})` : ""}`,
	);
}

function cauHinhMan(ctx, man) {
	const goc = {
		idMt: "data-hang-muc-tieu",
		idKr: "data-kr",
		khoiCuon: "[data-muc-tieu],[data-okr-sheet],[data-muc-tieu-cham]",
		kieu: "tien-do",
		nhanMt: {},
		khung: null,
	};
	if (man === "cua-toi")
		return {
			...goc,
			duong: `/${ctx.slug}/okr`,
			cho: '[data-trang-thai="ST-cuatoi-codulieu"] [data-muc-tieu]',
			mt: "[data-muc-tieu] [data-hang-muc-tieu]",
			kr: "[data-muc-tieu] [data-kr]",
		};
	if (man === "theo-don-vi")
		return {
			...goc,
			duong: duongDonVi(ctx, ctx.ky, { loai: "bp", id: ctx.boPhan }),
			// AC-14 cach-toi: trang-don-vi-mot-bang AC-3 — moi muc tieu la mot dong cua mot bang (o ten mang ca data-muc-tieu lan data-hang-muc-tieu), KR la dong con [data-kr] cung bang.
			cho: "[data-hang-muc-tieu]",
			mt: "[data-hang-muc-tieu]",
			kr: "[data-kr]",
			khoiCuon: '[data-trang-thai="ST-donvi-danhsach"]',
			moDong: true,
		};
	if (man === "sheet")
		return {
			...goc,
			duong: `/${ctx.slug}/okr?record=objective:${ctx.moi}`,
			cho: `[data-okr-sheet="${ctx.moi}"] [data-kr]`,
			mt: "[data-okr-sheet]",
			kr: "[data-okr-sheet] [data-kr]",
			idMt: "data-okr-sheet",
			khung: "[data-okr-sheet]",
		};
	return {
		...goc,
		duong: duongDonVi(
			ctx,
			ctx.kyCham,
			{ loai: "bp", id: ctx.boPhan },
			"&xemOkr=cham",
		),
		cho: "[data-hang-muc-tieu-cham]",
		mt: "[data-hang-muc-tieu-cham]",
		kr: "[data-kr-cham]",
		idMt: "data-hang-muc-tieu-cham",
		idKr: "data-kr-cham",
		kieu: "diem",
		nhanMt: ctx.nhanCham,
	};
}

function duongDonVi(ctx, ky, don, them = "") {
	return `/${ctx.slug}/okr/theo-don-vi?kyOkr=${ky}&donOkr=${don.loai}:${don.id}${them}`;
}

async function choMan(t, cauHinh) {
	await t.p.goto(`${APP}${cauHinh.duong}`, { waitUntil: "load" });
	await t.p
		.waitForFunction(
			(cho) =>
				document.querySelector(cho) !== null ||
				[...document.querySelectorAll("[data-trang-thai]")].some(
					(o) => !o.getAttribute("data-trang-thai").includes("dangtai"),
				),
			{ timeout: MTKR.cho.manMs },
			cauHinh.cho,
		)
		.catch(() => {});
	await t.p
		.waitForSelector(cauHinh.cho, { timeout: MTKR.cho.bamMs })
		.catch(() => {});
	await t.p.evaluate(() => document.fonts.ready);
	await tre(MTKR.cho.yenMs);
}

async function moMoiDong(t) {
	for (const nut of await t.p.$$('[data-mo-dong][aria-expanded="false"]'))
		await nut.click().catch(() => {});
	await t.p
		.waitForFunction(
			() =>
				document.querySelectorAll('[data-mo-dong][aria-expanded="false"]')
					.length === 0,
			{ timeout: MTKR.cho.bamMs },
		)
		.catch(() => {});
	await tre(MTKR.cho.yenMs);
}

async function doMotMan(ctx, man, theme, { chen = false, ky = null } = {}) {
	const cauHinh = cauHinhMan(ctx, man);
	if (ky) cauHinh.duong = cauHinh.duong.replace(ctx.kyCham, ky);
	const t = await trang(ctx.pt, MTKR.kho.hep, theme);
	try {
		await choMan(t, cauHinh);
		// trang-don-vi-mot-bang AC-3: mac dinh moi dong thu — bam nut mo tung dong de KR hien nhu khoi mo san cu.
		if (cauHinh.moDong) await moMoiDong(t);
		if (chen)
			await t.p.evaluate((rong) => {
				const o = document.createElement("div");
				o.setAttribute("data-chen-do-do", "");
				o.style.width = `${rong}px`;
				o.style.height = "10px";
				document.body.appendChild(o);
			}, MTKR.doDo.rongPx);
		const so = await t.p.evaluate(docMan, cauHinh);
		kiemE13(man, so, `E13 375 ${man} ${theme}`);
		await chup(t, `E13-375-${man}-${theme}`);
		if (so.ngoaiMan.length > 0 || so.cuon.length > 0)
			await soiTran(t, `E13-375-${man}-${theme}-soi`);
	} finally {
		await t.ctx.close();
	}
}

async function soiTran(t, ten) {
	await t.p.evaluate(() => {
		const ds = [...document.querySelectorAll('[data-kr] [translate="no"]')];
		const xa = ds.sort(
			(a, b) =>
				b.getBoundingClientRect().right - a.getBoundingClientRect().right,
		)[0];
		xa?.scrollIntoView({ block: "center" });
	});
	await tre(MTKR.cho.lamMoiMs);
	const tep = join(SOI, `${ten}.png`);
	await t.p.screenshot({ path: tep });
	dong.push(`ANH SOI ${tep.slice(GOC.length + 1)}`);
}

async function buocE13(ctx) {
	for (const man of Object.keys(MTKR.toiThieu))
		for (const theme of Object.keys(MTKR.theme))
			await doMotMan(ctx, man, theme);
}

function bam256(tep) {
	return createHash("sha256").update(readFileSync(tep)).digest("hex");
}

function kiemAnh(tep, nhan) {
	const co = statSync(tep, { throwIfNoEntry: false });
	kiem(
		`${nhan}: ${tep.slice(GOC.length + 1)} ${co ? Math.round(co.size / KB) : 0} KB > ${MTKR.anh.toiThieuByte / KB} KB`,
		(co?.size ?? 0) > MTKR.anh.toiThieuByte,
	);
}

function kiemCap(tep, nhan) {
	kiemAnh(tep.sang, `${nhan} sang`);
	kiemAnh(tep.toi, `${nhan} toi`);
	const a = bam256(tep.sang);
	const b = bam256(tep.toi);
	kiem(
		`${nhan}: sha256 sang ${a.slice(0, 16)}… != toi ${b.slice(0, 16)}…`,
		a !== b,
	);
}

async function anhDonVi(ctx, theme) {
	const t = await trang(ctx.pt, MTKR.kho.rong, theme);
	try {
		await moTrang(
			t,
			duongDonVi(ctx, ctx.ky, { loai: "pb", id: ctx.phongBanAnh }),
			// AC-14 cach-toi: o ten cua dong muc tieu mang ca data-muc-tieu lan data-hang-muc-tieu (trang-don-vi-mot-bang AC-3).
			"[data-hang-muc-tieu]",
		);
		const so = await t.p.evaluate(
			() => document.querySelectorAll("[data-muc-tieu]").length,
		);
		kiem(
			`E16 theo-don-vi ${theme}: don vi co ${so} muc tieu (>= ${MTKR.theoDonViAnh.mt})`,
			so >= MTKR.theoDonViAnh.mt,
		);
		ghi(
			`E16 theo-don-vi ${theme}: html.dark=${await t.p.evaluate(() => document.documentElement.classList.contains("dark"))}`,
		);
		return await chup(t, `E16-1440-theo-don-vi-${theme}`);
	} finally {
		await t.ctx.close();
	}
}

async function anhSheet(ctx, id, theme, ten) {
	const t = await trang(ctx.pt, MTKR.kho.rong, theme);
	try {
		await moTrang(
			t,
			`/${ctx.slug}/okr?record=objective:${id}`,
			`[data-okr-sheet="${id}"] [data-kr]`,
		);
		const khu = await t.p.evaluate((id) => {
			const trongAnh = (sel) => {
				const o = document.querySelector(`[data-okr-sheet="${id}"] ${sel}`);
				if (!o?.checkVisibility()) return false;
				const r = o.getBoundingClientRect();
				return r.height > 0 && r.top < window.innerHeight && r.bottom > 0;
			};
			return {
				viSao: trongAnh('[data-khu="vi-sao"]'),
				gopVao: trongAnh('[data-khu="gop-vao"]'),
				dark: document.documentElement.classList.contains("dark"),
			};
		}, id);
		ghi(`E16 sheet ${id} ${theme}: html.dark=${khu.dark}`);
		kiem(
			khu.viSao
				? `E16 sheet ${id} ${theme}: [data-khu=vi-sao] hien trong anh`
				: `${T.thieuViSao}: ${id} ${theme}`,
			khu.viSao,
		);
		kiem(
			khu.gopVao
				? `E16 sheet ${id} ${theme}: [data-khu=gop-vao] hien trong anh`
				: `${T.thieuGopVao}: ${id} ${theme}`,
			khu.gopVao,
		);
		return await chup(t, ten);
	} finally {
		await t.ctx.close();
	}
}

async function buocE16(ctx) {
	const donVi = {
		sang: await anhDonVi(ctx, "sang"),
		toi: await anhDonVi(ctx, "toi"),
	};
	kiemCap(donVi, "E16 theo-don-vi");
	const sheet = {
		sang: await anhSheet(ctx, ctx.mtSheet, "sang", "E16-1440-sheet-sang"),
		toi: await anhSheet(ctx, ctx.mtSheet, "toi", "E16-1440-sheet-toi"),
	};
	kiemCap(sheet, "E16 sheet");
	const t = await trang(ctx.pt, MTKR.kho.rong, "sang");
	try {
		await moTrang(t, duongProto(MTKR.proto.hienTai), MTKR.proto.vungHienTai);
		kiemAnh(await chup(t, "E16-hien-tai"), "E16 hien-tai");
	} finally {
		await t.ctx.close();
	}
}

function duongProto(state) {
	return `/proto/${MTKR.proto.slug}?state=${state}`;
}

async function refProto() {
	const du = await import(
		"../../../apps/app/app/proto/_modules/muc-tieu-va-kr/du-lieu.ts"
	);
	return du.CUA_TOI.map((mt) => ({
		id: mt.id,
		progress: du.tienDoMucTieu(mt),
		expected: null,
		krIds: mt.kr.map((k) => k.id),
	}));
}

async function doDoE1(ctx) {
	const t = await trang(ctx.pt, MTKR.kho.rong, "sang");
	try {
		await moTrang(t, duongProto(MTKR.proto.hienTai), MTKR.proto.vungHienTai);
		const so = await t.p.evaluate(docKhung, MTKR.proto.vungHienTai);
		kiemE1(await refProto(), so, `E1 do-do ${MTKR.proto.hienTai}`);
		await chup(t, "do-do-E1-hien-tai");
	} finally {
		await t.ctx.close();
	}
}

async function doDoE5(ctx) {
	const t = await trang(ctx.pt, MTKR.kho.rong, "sang");
	try {
		await e5ThuVaTaiLai(
			t,
			duongProto(MTKR.proto.cuaToi),
			MTKR.proto.vungCuaToi,
			`E5 do-do ${MTKR.proto.cuaToi}`,
			"do-do-E5-da-thu",
		);
	} finally {
		await t.ctx.close();
	}
}

async function kiemDoDo(ctx) {
	await doDoE1(ctx);
	await doDoE5(ctx);
	await doMotMan(ctx, "cua-toi", "sang", { chen: true });
	await anhSheet(ctx, ctx.moi, "sang", "do-do-E16-sheet-khong-vi-sao");
	const can = [`${T.ngoaiKhung}: `, T.reloadMat, T.tranNgang, T.thieuViSao];
	const thay = can.filter((c) => dong.some((d) => d.includes(c)));
	dong.push(
		`KIEM DO DO: ${thay.length}/${can.length} thong diep ghim do dung (${thay.join(" · ")})`,
	);
	await ket(thay.length === can.length ? 1 : 0);
}

async function kiemDoDoRong(ctx) {
	await doMotMan(ctx, "cham", "sang", { ky: ctx.ky });
	const can = `${T.manRong}: cham`;
	const thay = dong.some((d) => d.includes(can));
	dong.push(
		`KIEM DO DO RONG: ${thay ? 1 : 0}/1 thong diep ghim do dung (${thay ? can : "khong thay"})`,
	);
	await ket(thay ? 1 : 0);
}

async function kiemDoDoCuon(ctx) {
	const man = "cua-toi";
	const cauHinh = {
		...cauHinhMan(ctx, man),
		duong: duongProto(MTKR.proto.cuaToi),
		cho: "[data-muc-tieu] [data-kr]",
	};
	const t = await trang(ctx.pt, MTKR.kho.hep, "sang");
	try {
		await choMan(t, cauHinh);
		const chen = await t.p.evaluate((ten) => {
			const o = document.querySelector(
				'[data-muc-tieu] [data-kr] [translate="no"]',
			);
			if (!o) return false;
			o.textContent = ten;
			return true;
		}, MTKR.gieo.tenDai);
		ghi(
			`KIEM DO DO CUON: chen ten KR ${MTKR.gieo.tenDai.length} ky tu khong dau cach vao ${MTKR.proto.cuaToi} (${chen})`,
		);
		await tre(MTKR.cho.lamMoiMs);
		const so = await t.p.evaluate(docMan, cauHinh);
		kiemTran(so, `E13 do-do-cuon 375 ${man}`);
		kiemCuon(man, so, `E13 do-do-cuon 375 ${man}`);
		await chup(t, `do-do-cuon-${man}`);
	} finally {
		await t.ctx.close();
	}
	const can = `${T.bangCuon}: ${man}`;
	const thay = dong.some((d) => d.includes(can));
	dong.push(
		`KIEM DO DO CUON: ${thay ? 1 : 0}/1 thong diep ghim do dung (${thay ? can : "khong thay"})`,
	);
	await ket(thay ? 1 : 0);
}

async function gieoMucTieuMoi(ctx) {
	const g = MTKR.gieo;
	if (g.tenDai.length !== g.doDaiTenDai || /\s/.test(g.tenDai))
		throw new Error(
			`ten KR dai phai ${g.doDaiTenDai} ky tu khong dau cach (dang ${g.tenDai.length})`,
		);
	const chu = idMau("nguoi", MTKR.nguoi.phuTrach);
	const mt = await trpc(API, ctx.pt).lam("okr.createObjective", {
		cycleId: ctx.ky,
		unit: { level: "bo-phan", divisionId: ctx.boPhan },
		title: g.mucTieu.title,
		kind: g.mucTieu.kind,
		ownerUserId: chu,
		participantIds: [],
		whyNow: g.mucTieu.whyNow,
	});
	const [dau, ...con] = g.kr;
	for (const kr of [{ ...dau, title: g.tenDai }, ...con])
		await trpc(API, ctx.pt).lam("okr.createKeyResult", {
			objectiveId: mt.id,
			ownerUserId: chu,
			...kr,
		});
	let congBo = "phu trach";
	await trpc(API, ctx.pt)
		.lam("okr.publishObjective", { id: mt.id })
		.catch(async (loi) => {
			congBo = `quan tri (phu trach bi tu choi: ${String(loi?.message ?? loi).slice(0, 160)})`;
			await trpc(API, ctx.qt).lam("okr.publishObjective", { id: mt.id });
		});
	ghi(
		`GIEO muc tieu ${mt.id} (whyNow rong, 1 KR ten ${g.tenDai.length} ky tu khong dau cach + 1 KR), cong bo boi ${congBo}`,
	);
	return mt.id;
}

async function kiemTienDe(ctx) {
	const ct = await trpc(API, ctx.pt).hoi("okr.objective", { id: ctx.mtSheet });
	const quaKr = ct.alignments.filter((a) => a.keyResultTitle);
	ghi(
		`TIEN DE sheet ${ctx.mtSheet}: whyNow ${ct.whyNow.length} ky tu · ${ct.alignments.length} noi gop (${quaKr.length} qua KR «${quaKr[0]?.keyResultTitle ?? ""}») · ${ct.keyResults.length} KR`,
	);
	if (ct.whyNow.trim() === "" || quaKr.length === 0 || ct.keyResults.length < 2)
		throw new Error(
			`muc tieu ${ctx.mtSheet} thieu whyNow / gop qua KR / >= 2 KR`,
		);
	const coCongBo = ctx.mine.some(
		(r) =>
			r.status === "cong-bo" && r.ownerId === ctx.ptId && r.krIds.length >= 2,
	);
	ghi(
		`TIEN DE okr.mine ${MTKR.nguoi.phuTrach}: ${ctx.mine.length} muc tieu (${ctx.mine.map((r) => `${r.id}:${r.status}:${r.krIds.length}KR`).join(", ")})`,
	);
	if (!coCongBo)
		throw new Error(
			`${MTKR.nguoi.phuTrach} khong phu trach muc tieu da cong bo nao co >= 2 KR`,
		);
	const bang = await trpc(API, ctx.pt).hoi("okr.bangCham", {
		cycleId: ctx.kyCham,
		donVi: { loai: "bp", id: ctx.boPhan },
	});
	const chamDuoc = bang.mucTieu.filter(
		(mt) => mt.krs.length >= 2 && mt.krs.every((k) => k.suaDuoc),
	);
	ghi(
		`TIEN DE cham ${ctx.kyCham}: ${bang.mucTieu.length} muc tieu, ${chamDuoc.length} muc tieu >= 2 KR ma ${MTKR.nguoi.phuTrach} cham duoc`,
	);
	if (chamDuoc.length < MTKR.toiThieu.cham.mt)
		throw new Error(
			`chu ky cham chi co ${chamDuoc.length} muc tieu >= 2 KR cham duoc`,
		);
	return Object.fromEntries(
		bang.mucTieu.map((mt) => [
			mt.id,
			mt.diem === null
				? mk.daCham(
						String(mt.krs.filter((k) => k.diem !== null).length),
						String(mt.krs.length),
					)
				: `${mk.cot.diem} `,
		]),
	);
}

async function docMine(ctx) {
	const ky = await trpc(API, ctx.pt).hoi("okr.cycles");
	if (ky.currentId !== ctx.ky)
		throw new Error(
			`chu ky hien tai ${ky.currentId} khac ${ctx.ky} — man Cua toi se doc chu ky khac`,
		);
	const mine = await trpc(API, ctx.pt).hoi("okr.mine", {
		cycleId: ky.currentId,
	});
	return mine.objectives.map((mt) => ({
		id: mt.id,
		status: mt.status,
		ownerId: mt.owner.id,
		progress: mt.progress,
		expected: mt.expected,
		krIds: mt.keyResults.map((k) => k.id),
	}));
}

async function chuanBi() {
	const nap = napBoMau();
	if (nap.ma !== 0)
		throw new Error(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	ghi(`NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
	const qt = phienCookie(thuMau(MTKR.nguoi.quanTri));
	const pt = phienCookie(thuMau(MTKR.nguoi.phuTrach));
	const slug = await suySlug(pt);
	if (!slug)
		throw new Error(`${APP}/ khong chuyen toi trang chinh cua workspace`);
	const ctx = {
		qt,
		pt,
		slug,
		ptId: idMau("nguoi", MTKR.nguoi.phuTrach),
		ky: idMau("chu-ky", MTKR.ma.chuKy),
		kyCham: idMau("chu-ky", MTKR.ma.chuKyCham),
		boPhan: idMau("bp", MTKR.ma.boPhan),
		phongBanAnh: idMau("pb", MTKR.ma.phongBanAnh),
		mtSheet: idMau("mt", MTKR.ma.mucTieuSheet),
	};
	ctx.moi = await gieoMucTieuMoi(ctx);
	await trpc(API, qt).lam("okr.moLaiKy", {
		id: ctx.kyCham,
		lyDo: MTKR.gieo.lyDoMoLai,
	});
	ghi(`GIEO okr.moLaiKy ${ctx.kyCham} → pha cham-diem`);
	ctx.mine = await docMine(ctx);
	ctx.nhanCham = await kiemTienDe(ctx);
	return ctx;
}

async function kiemProto() {
	const res = await fetch(`${APP}${duongProto(MTKR.proto.hienTai)}`, {
		redirect: "manual",
	}).catch(() => null);
	return res?.status ?? 0;
}

mkdirSync(ANH, { recursive: true });
mkdirSync(SOI, { recursive: true });

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
if (process.env[MTKR.bienProto] !== "1") process.exit(await chayLaiCoProto());
const maProto = await kiemProto();
if (maProto !== 200)
	await khongDo(
		`${APP}${duongProto(MTKR.proto.hienTai)} tra ${maProto} du ${MTKR.bienProto}=1`,
	);

let ctx;
try {
	ctx = await chuanBi();
} catch (loi) {
	await khongDo(`chuan bi: ${loi?.message ?? loi}`);
}

trinhDuyet = await puppeteer.launch({
	executablePath: MTKR.chrome,
	headless: true,
});

let buoc = "";
try {
	if (CO_DO) {
		buoc = "kiem-do-do";
		await kiemDoDo(ctx);
	}
	if (CO_DO_RONG) {
		buoc = "kiem-do-do-rong";
		await kiemDoDoRong(ctx);
	}
	if (CO_DO_CUON) {
		buoc = "kiem-do-do-cuon";
		await kiemDoDoCuon(ctx);
	}
	buoc = "E1";
	await buocE1(ctx, "sang");
	await buocE1(ctx, "toi");
	buoc = "E5";
	await buocE5(ctx);
	buoc = "E13";
	await buocE13(ctx);
	buoc = "E16";
	await buocE16(ctx);
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

await ket(sai === 0 ? 0 : 1);
