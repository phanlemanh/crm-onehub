import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "man-okr-truoc-r1";
const GIAY_MS = 1000;

const R1C = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		1440: { rong: 1440, cao: 900 },
		390: { rong: 390, cao: 844 },
	},
	tranThanh: { 1440: 80, 390: 120 },
	cho: { manMs: 120 * GIAY_MS, taiMs: 180 * GIAY_MS, yenMs: 1200 },
	nguoi: { chon: "le-hai-dang", nhanVien: "do-minh-khoa" },
	ma: { quy4: "quy4", khoiHoTro: "Khối Hỗ trợ" },
	buoc: ["hoi-y", "cap-nhat", "toan-canh"],
	anh: [
		"r1c-hoi-y-gon-1440",
		"r1c-hoi-y-gon-390",
		"r1c-hoi-y-mo-1440",
		"r1c-hoi-y-mo-390",
		"r1c-cap-nhat-xong-1440",
		"r1c-cap-nhat-xong-390",
		"r1c-cap-nhat-mot-phan-1440",
		"r1c-cap-nhat-mot-phan-390",
		"r1c-toan-canh-1440",
		"r1c-toan-canh-390",
	],
};

const CAY_DO = {
	"hoi-y": {
		nhan: "ban sao them lai defaultOpen vao thanh cong bo",
		tenCay: "r1c-chieu-do-hoi-y",
		chiBuoc: "hoi-y",
		tep: "apps/app/app/(app)/[slug]/okr/hoi-y/khoi-ket-luan.tsx",
		cam: (s) =>
			s.replace(
				'data-khoi="thanh-cong-bo"',
				'data-khoi="thanh-cong-bo"\n\t\t\t\tdefaultOpen',
			),
		dauVet: "defaultOpen",
		ghim: /hoi-y 1440: y chua gom bi thanh phu: [1-9]/,
	},
	"cap-nhat": {
		nhan: "ban sao bo nhanh da xong tuan nay",
		tenCay: "r1c-chieu-do-cap-nhat",
		chiBuoc: "cap-nhat",
		tep: "apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx",
		cam: (s) =>
			s.replace(
				"if (!dangSua && tong > 0 && soDaGuiTuanNay === tong)",
				"if (dangSua && tong < 0)",
			),
		dauVet: "if (dangSua && tong < 0)",
		ghim: /cap-nhat 1440: sau tai lai o ST-capnhat-dangdien, mong ST-capnhat-daxong/,
	},
	"toan-canh": {
		nhan: "ban sao tra chu the ve «chua dat»",
		tenCay: "r1c-chieu-do-toan-canh",
		chiBuoc: "toan-canh",
		tep: "apps/app/lib/messages/okr-toan-canh.ts",
		cam: (s) =>
			s.replace('chuaDat: "chưa có mục tiêu riêng",', 'chuaDat: "chưa đặt",'),
		dauVet: 'chuaDat: "chưa đặt",',
		ghim: /toan-canh 1440: the noi nguoc bang: Khối Hỗ trợ/,
	},
};

const coChieuDo = process.argv.find((a) => a.startsWith("--chieu-do"));
if (coChieuDo) {
	const ten = coChieuDo.split("=")[1] ?? "";
	const cay = CAY_DO[ten];
	if (!cay) {
		console.log(`KHONG DO DUOC: man-r1c khong co chieu do «${ten}»`);
		process.exit(2);
	}
	const { chieuDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
	await chieuDo(TEP_NAY, cay);
}

if (!process.env.PHIEN_DO || !process.env.API_URL || !process.env.APP_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/${HO_SO}/rang/man-r1c.mjs"`,
	);
	process.exit(2);
}

const APP = process.env.APP_URL;
const API = process.env.API_URL;
const ANH =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", HO_SO, "evidence");
const CHI = process.env.CHI_BUOC ? process.env.CHI_BUOC.split(",") : R1C.buoc;

const { idMau, laKhoDo, napBoMau, phienCookie, thuMau, tre, trpc } =
	await import("../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs");
const { db } = await import("../../../packages/db/src/index.ts");
const { okrMessages } = await import("../../../apps/app/lib/messages/okr.ts");
const { okrToanCanhMessages } = await import(
	"../../../apps/app/lib/messages/okr-toan-canh.ts"
);
const { okrHoiYMessages } = await import(
	"../../../apps/app/lib/messages/okr-hoi-y.ts"
);
const { messages } = await import("../../../packages/ui/src/lib/messages.ts");

const MC = okrMessages("vi").capNhat;
const MT = okrToanCanhMessages("vi").toanCanh;
const MH = okrHoiYMessages("vi").congBo;
const MU = messages("vi").saveBar;

const dong = [];
let sai = 0;
let trinhDuyet = null;

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	await db.$disconnect().catch(() => {});
	for (const d of dong) console.log(d);
	console.log(`KET LUAN: ${sai} SAI — ma thoat ${ma}`);
	process.exit(ma);
}

async function khongDo(cau) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	await ket(2);
}

function ketBuoc(nhan, loi) {
	if (loi.length === 0) dong.push(`${nhan}: dat`);
	else {
		sai += loi.length;
		for (const l of loi) dong.push(`${nhan}: ${l}`);
	}
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
	return dau && !["onboarding", "sign-in"].some((x) => dau.startsWith(x))
		? dau
		: null;
}

async function trang(cookie, kho) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	const { rong, cao } = R1C.kho[kho];
	await p.setViewport({ width: rong, height: cao, deviceScaleFactor: 1 });
	await p.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: "light" },
	]);
	p.setDefaultNavigationTimeout(R1C.cho.taiMs);
	return { ctx, p, kho };
}

async function mo(t, duong, cho) {
	await t.p.goto(`${APP}${duong}`, { waitUntil: "load" });
	await choCo(t, cho);
}

async function choCo(t, cho) {
	await t.p.waitForFunction(
		(s) => document.querySelector(s) !== null,
		{ timeout: R1C.cho.manMs },
		cho,
	);
	await t.p.evaluate(() => document.fonts.ready);
	await tre(R1C.cho.yenMs);
}

async function chup(t, ten) {
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
	dong.push(`ANH ${tep.startsWith(GOC) ? tep.slice(GOC.length + 1) : tep}`);
}

function tranNgang(t) {
	return t.p.evaluate(() => {
		const cuon = document.querySelector('[data-slot="page-shell-scroll"]');
		const tran = (e) => (e ? e.scrollWidth - e.clientWidth : 0);
		return Math.max(tran(document.documentElement), tran(cuon));
	});
}

function trangThai(t) {
	return t.p.evaluate(
		() =>
			document
				.querySelector("[data-trang-thai^='ST-capnhat']")
				?.getAttribute("data-trang-thai") ?? null,
	);
}

async function buocHoiY(cookie, slug) {
	for (const kho of ["1440", "390"]) {
		const loi = [];
		const t = await trang(cookie, kho);
		await mo(
			t,
			`/${slug}/okr/hoi-y`,
			"[data-khoi='thanh-cong-bo'] button[aria-controls]",
		);
		await choCo(t, "[data-khoi='y-chua-gom'] [data-y]");
		const dau = await t.p.evaluate(() => {
			const bar = document.querySelector("[data-khoi='thanh-cong-bo']");
			const cao = innerHeight;
			const ds = [
				...document.querySelectorAll("[data-khoi='y-chua-gom'] [data-y]"),
			];
			let phu = 0;
			let trongKhung = 0;
			for (const y of ds) {
				const r = y.getBoundingClientRect();
				if (r.top < 0 || r.bottom > cao) continue;
				trongKhung += 1;
				const tam = document.elementFromPoint(
					r.left + r.width / 2,
					r.top + r.height / 2,
				);
				if (tam?.closest("[data-khoi='thanh-cong-bo']")) phu += 1;
			}
			return {
				soY: ds.length,
				phu,
				trongKhung,
				caoThanh: Math.round(bar?.getBoundingClientRect().height ?? -1),
				moRong: bar
					?.querySelector("button[aria-controls]")
					?.getAttribute("aria-expanded"),
			};
		});
		dong.push(
			`GHI hoi-y ${kho}: ${dau.soY} y chua gom, ${dau.trongKhung} nam tron trong khung dau, ${dau.phu} bi phu, thanh cao ${dau.caoThanh}px, aria-expanded ${dau.moRong}`,
		);
		if (dau.soY === 0) loi.push("khong co y chua gom nao de do");
		if (dau.trongKhung === 0)
			loi.push(
				"khong y chua gom nao nam tron trong khung dau — so bi phu 0 la rong",
			);
		if (dau.phu > 0) loi.push(`y chua gom bi thanh phu: ${dau.phu}`);
		if (dau.caoThanh < 0 || dau.caoThanh > R1C.tranThanh[kho])
			loi.push(
				`thanh thu gon cao ${dau.caoThanh}px, tran ${R1C.tranThanh[kho]}px`,
			);
		await chup(t, `r1c-hoi-y-gon-${kho}`);
		const ids = await t.p.evaluate(() =>
			[...document.querySelectorAll("[data-khoi='y-chua-gom'] [data-y]")].map(
				(y) => y.getAttribute("data-y"),
			),
		);
		let trung = 0;
		for (const id of ids) {
			const dat = await t.p.evaluate((id) => {
				const y = document.querySelector(
					`[data-khoi='y-chua-gom'] [data-y="${id}"]`,
				);
				y.scrollIntoView({ block: "center" });
				const r = y.getBoundingClientRect();
				const tam = document.elementFromPoint(
					r.left + r.width / 2,
					r.top + r.height / 2,
				);
				return tam?.closest("[data-y]") === y;
			}, id);
			if (dat) trung += 1;
			else loi.push(`y ${id} cuon toi giua van khong bam trung`);
		}
		dong.push(
			`GHI hoi-y ${kho}: ${trung}/${ids.length} y bam trung sau khi cuon toi`,
		);
		const nut = await t.p.$(
			"[data-khoi='thanh-cong-bo'] button[aria-controls]",
		);
		const chuNut = await nut.evaluate((b) => b.textContent.trim());
		if (chuNut !== MU.hienDanhSach)
			loi.push(`nut danh sach ghi «${chuNut}», mong «${MU.hienDanhSach}»`);
		if (
			(await nut.evaluate((b) => b.getAttribute("aria-expanded"))) !== "true"
		) {
			await nut.click();
			await tre(R1C.cho.yenMs);
		}
		if ((await nut.evaluate((b) => b.getAttribute("aria-expanded"))) !== "true")
			loi.push("bam nut danh sach ma danh sach khong mo");
		await chup(t, `r1c-hoi-y-mo-${kho}`);
		const lienKet = await t.p.$$("[data-khoi='thanh-cong-bo'] ul a");
		let lienKetY = null;
		for (const a of lienKet)
			if (
				(await a.evaluate((x) => x.textContent.trim())) ===
				MH.thieu["y-chua-gom"]
			)
				lienKetY = a;
		if (!lienKetY) loi.push(`khong thay lien ket «${MH.thieu["y-chua-gom"]}»`);
		else {
			await t.p.evaluate(() => {
				const c = document.querySelector('[data-slot="page-shell-scroll"]');
				if (c) c.scrollTop = c.scrollHeight;
			});
			await tre(R1C.cho.yenMs);
			const truocBam = await t.p.evaluate(() => {
				const r = document
					.querySelector("[data-khoi='y-chua-gom']")
					.getBoundingClientRect();
				return r.bottom > 0 && r.top < innerHeight;
			});
			if (truocBam)
				loi.push(
					"danh sach y chua gom da nam trong khung truoc khi bam lien ket — phep do khong phan biet",
				);
			try {
				await lienKetY.click();
			} catch (e) {
				loi.push(`khong bam duoc lien ket y chua gom: ${e?.message ?? e}`);
			}
			await tre(R1C.cho.yenMs);
			const trongKhung = await t.p.evaluate(() => {
				const r = document
					.querySelector("[data-khoi='y-chua-gom']")
					.getBoundingClientRect();
				return r.bottom > 0 && r.top < innerHeight;
			});
			if (!trongKhung)
				loi.push("bam lien ket y chua gom ma danh sach khong vao khung nhin");
		}
		const tn = await tranNgang(t);
		if (tn > 0) loi.push(`tran ngang ${tn}px`);
		await t.ctx.close();
		ketBuoc(`hoi-y ${kho}`, loi);
	}
}

async function demCheckIn(ids, tuan) {
	return db.okrCheckIn.count({
		where: {
			keyResultId: { in: ids },
			weekStart: new Date(`${tuan}T00:00:00Z`),
		},
	});
}

async function xoaTuanNay(ids, tuan) {
	await db.okrCheckIn.deleteMany({
		where: {
			keyResultId: { in: ids },
			weekStart: new Date(`${tuan}T00:00:00Z`),
		},
	});
}

async function chonVaGui(t, chon) {
	for (const [id, muc] of chon) {
		const nut = await t.p.$$(`[data-kr="${id}"] [data-o="tu-tin"] button`);
		let trung = null;
		for (const b of nut)
			if ((await b.evaluate((x) => x.textContent.trim())) === MC.mucTuTin[muc])
				trung = b;
		if (!trung) return `khong thay nut ${MC.mucTuTin[muc]} cua KR ${id}`;
		await trung.click();
	}
	const gui = await t.p.$("[data-nut='gui']");
	if (!gui) return "khong thay nut gui";
	await gui.click();
	await choCo(t, "[data-trang-thai='ST-capnhat-dagui']");
	return null;
}

async function buocCapNhat(cookie, slug) {
	const nv = trpc(API, cookie);
	const ds = await nv.hoi("okr.capNhatTuan");
	const ids = ds.items.map((k) => k.keyResultId);
	const ten = new Map(ds.items.map((k) => [k.keyResultId, k.title]));
	const tuan = ds.weekStart;
	if (ids.length !== 2)
		await khongDo(`nhan vien mau phu trach ${ids.length} KR, mong 2`);
	const duong = `/${slug}/okr/cap-nhat-tuan?kyOkr=${idMau("chu-ky", R1C.ma.quy4)}`;
	const loi1440 = [];
	const loi390 = [];

	await xoaTuanNay(ids, tuan);
	const t = await trang(cookie, "1440");
	const t390 = await trang(cookie, "390");
	await mo(t390, duong, "[data-trang-thai^='ST-capnhat']");
	if ((await trangThai(t390)) !== "ST-capnhat-dangdien")
		loi390.push(`chua gui ma o ${await trangThai(t390)}`);
	const tn0 = await tranNgang(t390);
	if (tn0 > 0) loi390.push(`tran ngang ${tn0}px o ST-capnhat-dangdien`);

	await mo(t, duong, "[data-trang-thai^='ST-capnhat']");
	const truoc = await demCheckIn(ids, tuan);
	const loiGui = await chonVaGui(
		t,
		ids.map((id) => [id, "cao"]),
	);
	if (loiGui) loi1440.push(loiGui);
	const sauGui = await demCheckIn(ids, tuan);
	dong.push(
		`GHI cap-nhat 1440: check-in tuan nay ${truoc} -> ${sauGui} sau lan gui dau`,
	);
	if (sauGui - truoc !== 2)
		loi1440.push(`gui hai KR them ${sauGui - truoc} check-in, mong 2`);

	await mo(t, duong, "[data-trang-thai^='ST-capnhat']");
	const tt1 = await trangThai(t);
	if (tt1 !== "ST-capnhat-daxong")
		loi1440.push(`sau tai lai o ${tt1}, mong ST-capnhat-daxong`);
	else {
		const chu = await t.p.evaluate(() => document.body.innerText);
		for (const id of ids)
			if (!chu.includes(ten.get(id)))
				loi1440.push(`man da xong thieu KR «${ten.get(id)}»`);
		if (!chu.includes(MC.daXong.title))
			loi1440.push(`man da xong thieu «${MC.daXong.title}»`);
		for (const id of ids) {
			const hang = await t.p.evaluate(
				(id) => document.querySelector(`[data-kr="${id}"]`)?.innerText ?? "",
				id,
			);
			if (!hang.includes(MC.tuTinNhan(MC.mucTuTin.cao)))
				loi1440.push(
					`hang KR «${ten.get(id)}» khong mang nhan «${MC.tuTinNhan(MC.mucTuTin.cao)}» vua chon`,
				);
		}
		await chup(t, "r1c-cap-nhat-xong-1440");

		const sua = await t.p.$("[data-nut='sua-cap-nhat']");
		await sua.click();
		await choCo(t, "[data-trang-thai='ST-capnhat-dangdien']");
		const truocSua = await demCheckIn(ids, tuan);
		const loiSua = await chonVaGui(t, [[ids[0], "thap"]]);
		if (loiSua) loi1440.push(loiSua);
		const sauSua = await demCheckIn(ids, tuan);
		dong.push(
			`GHI cap-nhat 1440: check-in tuan nay ${truocSua} -> ${sauSua} sau khi sua mot KR`,
		);
		if (sauSua - truocSua !== 1)
			loi1440.push(`sua mot KR them ${sauSua - truocSua} check-in, mong 1`);
		await mo(t, duong, "[data-trang-thai^='ST-capnhat']");
		const tt2 = await trangThai(t);
		const hangDau = await t.p.evaluate(
			(id) => document.querySelector(`[data-kr="${id}"]`)?.innerText ?? "",
			ids[0],
		);
		if (tt2 !== "ST-capnhat-daxong")
			loi1440.push(`sau khi sua o ${tt2}, mong ST-capnhat-daxong`);
		else if (!hangDau.includes(MC.tuTinNhan(MC.mucTuTin.thap)))
			loi1440.push("KR vua sua khong mang muc tu tin moi");
	}

	await mo(t390, duong, "[data-trang-thai^='ST-capnhat']");
	if ((await trangThai(t390)) !== "ST-capnhat-daxong")
		loi390.push(`o ${await trangThai(t390)}, mong ST-capnhat-daxong`);
	const tn1 = await tranNgang(t390);
	if (tn1 > 0) loi390.push(`tran ngang ${tn1}px o ST-capnhat-daxong`);
	await chup(t390, "r1c-cap-nhat-xong-390");

	await xoaTuanNay([ids[1]], tuan);
	for (const [tt, loi, kho] of [
		[t, loi1440, "1440"],
		[t390, loi390, "390"],
	]) {
		await mo(tt, duong, "[data-trang-thai^='ST-capnhat']");
		const st = await trangThai(tt);
		const chu = await tt.p.evaluate(() => document.body.innerText);
		if (st !== "ST-capnhat-motphan")
			loi.push(`xoa mot KR ma o ${st}, mong ST-capnhat-motphan`);
		if (!chu.includes(MC.daGuiMotPhan(1, 2)))
			loi.push(`thieu dong «${MC.daGuiMotPhan(1, 2)}»`);
		const tn = await tranNgang(tt);
		if (tn > 0) loi.push(`tran ngang ${tn}px o ST-capnhat-motphan`);
		await chup(tt, `r1c-cap-nhat-mot-phan-${kho}`);
	}
	await t.ctx.close();
	await t390.ctx.close();
	ketBuoc("cap-nhat 1440", loi1440);
	ketBuoc("cap-nhat 390", loi390);
}

async function buocToanCanh(cookie, slug) {
	const duong = `/${slug}/okr/toan-canh?kyOkr=${idMau("chu-ky", R1C.ma.quy4)}`;
	for (const kho of ["1440", "390"]) {
		const loi = [];
		const t = await trang(cookie, kho);
		await mo(t, duong, "[data-trang-thai='ST-toancanh-codulieu']");
		const so = await t.p.evaluate(
			(nhan, ten) => {
				const the = [
					...document.querySelectorAll('[data-slot="stat-card"]'),
				].find((c) => c.innerText.includes(nhan));
				const hang = [
					...document.querySelectorAll("[data-hang-toan-canh]"),
				].find((h) => h.querySelector("td")?.innerText.trim() === ten);
				const o = hang ? [...hang.querySelectorAll("td")] : [];
				return {
					the: the?.innerText.replace(/\s+/g, " ").trim() ?? null,
					soMucTieu: o.length >= 5 ? Number(o[4].innerText.trim()) : null,
					chu: document.body.innerText,
				};
			},
			MT.donViCongBo,
			R1C.ma.khoiHoTro,
		);
		const cauThe = `${R1C.ma.khoiHoTro} ${MT.chuaDat}`;
		dong.push(
			`GHI toan-canh ${kho}: the «${so.the}» · hang ${R1C.ma.khoiHoTro} ${so.soMucTieu} muc tieu`,
		);
		if (!so.the?.includes(`${R1C.ma.khoiHoTro} chưa có mục tiêu riêng`))
			loi.push(
				`the noi nguoc bang: ${R1C.ma.khoiHoTro} — the ghi «${so.the}», mong co «${cauThe}»`,
			);
		if (kho === "1440" && !(so.soMucTieu > 0))
			loi.push(
				`hang ${R1C.ma.khoiHoTro} co ${so.soMucTieu} muc tieu, mong > 0 — bo mau khong con dung ca can do`,
			);
		if (kho === "1440" && !so.chu.includes(MT.theoDonViMoTa))
			loi.push("thieu cau mo ta bang moi");
		const tn = await tranNgang(t);
		if (tn > 0) loi.push(`tran ngang ${tn}px`);
		await chup(t, `r1c-toan-canh-${kho}`);
		await t.ctx.close();
		ketBuoc(`toan-canh ${kho}`, loi);
	}
}

if (!laKhoDo()) await khongDo("DATABASE_URL khong phai kho do rieng");
if (!existsSync(R1C.chrome)) await khongDo(`khong co Chrome o ${R1C.chrome}`);
mkdirSync(ANH, { recursive: true });
if (CHI.length === R1C.buoc.length)
	for (const f of readdirSync(ANH))
		if (f.startsWith("r1c-") && f.endsWith(".png")) rmSync(join(ANH, f));

const nap = napBoMau();
dong.push(`GHI okr:mau moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
if (nap.ma !== 0) await khongDo(`okr:mau thoat ${nap.ma}`);

const chon = phienCookie(thuMau(R1C.nguoi.chon));
const nhanVien = phienCookie(thuMau(R1C.nguoi.nhanVien));
const slug = await suySlug(chon);
if (!slug) await khongDo("khong suy duoc slug workspace");

trinhDuyet = await puppeteer.launch({
	executablePath: R1C.chrome,
	headless: true,
	args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
	if (CHI.includes("hoi-y")) await buocHoiY(chon, slug);
	if (CHI.includes("cap-nhat")) await buocCapNhat(nhanVien, slug);
	if (CHI.includes("toan-canh")) await buocToanCanh(chon, slug);
} catch (loi) {
	await khongDo(`buoc do nem loi: ${loi?.message ?? loi}`);
}

if (CHI.length === R1C.buoc.length) {
	const thieu = R1C.anh.filter((a) => !existsSync(join(ANH, `${a}.png`)));
	if (thieu.length > 0) {
		sai += 1;
		dong.push(`thieu anh: ${thieu.join(", ")}`);
	}
}

await ket(sai === 0 ? 0 : 1);
