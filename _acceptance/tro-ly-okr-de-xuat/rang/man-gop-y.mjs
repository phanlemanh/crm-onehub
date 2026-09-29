import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { okrMessages } from "../../../apps/app/lib/messages/okr.ts";
import { okrGopYMessages } from "../../../apps/app/lib/messages/okr-gop-y.ts";
import {
	batTacTu,
	cauThieuKhoa,
	chayTrongPhienCoTacTu,
	coKhoaMoHinh,
	docSql,
	GOC,
	idMau,
	laKhoDo,
	napBoMau,
	PHIEN_TRO_LY,
	phienCookie,
	RA,
	thangVN,
	thuMau,
	tre,
	trongPhienCoTacTu,
	trpc,
	truyVan,
} from "./phien-tro-ly.mjs";

const GIAY_MS = 1000;
const PHUT_MS = 60 * GIAY_MS;

const E4 = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: [
		{ rong: 1440, cao: 1000 },
		{ rong: 390, cao: 844 },
	],
	cho: {
		manMs: 60 * GIAY_MS,
		gopYMs: 3 * PHUT_MS,
		luotAnMs: 3 * PHUT_MS,
		lamMoiMs: 400,
		moLaiMs: 5 * GIAY_MS,
		nhipMs: 500,
	},
	conLan: { soLanToiDa: 40, buocPx: 400, lePx: 16, leMinPx: 40, choMs: 250 },
	quanTri: "le-hai-dang",
	chuKy: "quy4",
	bat: {
		phong: "kd-bac",
		truong: "nguyen-thi-lan",
		mucTieu: "q4-kd-bac-1",
		tenYeu: "Doanh thu quý 4 miền Bắc",
		viSaoThu: [
			"Quý 4 là mùa cao điểm; đội cần giữ đối tác mới ở lại sau đơn đầu.",
			"Mùa mua sắm cuối năm dồn đơn; đối tác mới cần chạy ổn trước tháng 12.",
		],
		krYeu: {
			title: "Gọi điện cho đối tác mới mỗi tuần",
			kind: "tang-toi",
			startValue: 0,
			targetValue: 200,
			currentValue: 0,
			unit: "cuộc",
			dueOn: null,
			weight: 1,
		},
	},
	an: { phong: "kd-nam", truong: "ly-thanh-tam", mucTieu: "q4-kd-nam-2" },
	hauToSuaAn: " — bản đo chế độ ẩn",
	chuGo: "x",
	lenh: 'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/tro-ly-okr-de-xuat/rang/man-gop-y.mjs"',
	hoanTacSql: join(GOC, "_acceptance/tro-ly-okr-de-xuat/rang/hoan-tac.sql"),
	thongDiep: { nhanKhongDoi: "nhan khong doi gi" },
};

const THU_MUC = join(RA, "man");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const m = okrMessages("vi");
const g = okrGopYMessages("vi");
const QUY4 = idMau("chu-ky", E4.chuKy);
const bo = JSON.parse(
	readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
);
const krNguon = bo.mucTieu
	.find((x) => x.ma === E4.bat.mucTieu)
	?.krs.find((k) => k.nguon);

const dong = [];
let sai = 0;
let trinhDuyet = null;
let tacTu = null;
let buoc = "";

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	if (tacTu) await tacTu.dung();
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
	return { ctx, p, rong };
}

async function moiKho(cookie, lam) {
	for (const kho of E4.kho) {
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
	for (let i = 0; i < E4.conLan.soLanToiDa; i += 1) {
		const v = await viTriCuon(p, chon);
		if (!v) return false;
		if (v.dinh >= v.tren && v.dinh < v.duoi - E4.conLan.leMinPx) return true;
		const buoc = Math.max(
			-E4.conLan.buocPx,
			Math.min(E4.conLan.buocPx, v.dinh - v.tren - E4.conLan.lePx),
		);
		await p.mouse.move(v.x, v.y);
		await p.mouse.wheel({ deltaY: buoc });
		await tre(E4.conLan.choMs);
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
	await tre(E4.cho.lamMoiMs);
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
	const han = Date.now() + E4.cho.manMs;
	for (;;) {
		const h = await p.waitForFunction(
			tim,
			{ timeout: E4.cho.manMs },
			...thamSo,
		);
		try {
			await h.asElement().click();
			return;
		} catch (loi) {
			if (Date.now() > han) throw loi;
			await tre(E4.cho.lamMoiMs);
		}
	}
}

async function bam(p, trong, chu, vaiTro = "button") {
	const chon = vaiTro === "menuitem" ? '[role="menuitem"]' : "button";
	await bamKhiYen(
		p,
		(trong, chon, chu) =>
			[...document.querySelectorAll(`${trong} ${chon}`)].find(
				(x) => x.textContent?.trim() === chu && x.checkVisibility(),
			) ?? null,
		trong,
		chon,
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

async function hien(p, chon, hanMs = E4.cho.manMs) {
	return p
		.waitForSelector(chon, { visible: true, timeout: hanMs })
		.then(() => true)
		.catch(() => false);
}

function duongDonVi(phong, them = "") {
	return `${APP}/${slug}/okr/theo-don-vi?kyOkr=${QUY4}&donOkr=pb:${idMau("pb", phong)}${them}`;
}

async function moSheet(p, phong, mtId) {
	await p.goto(duongDonVi(phong), { waitUntil: "load" });
	const han = Date.now() + E4.cho.manMs;
	for (;;) {
		await bamNhan(p, `[data-mo-muc-tieu="${mtId}"]`);
		const mo = await p
			.waitForFunction(
				(nhan) =>
					[...document.querySelectorAll(`button[aria-label="${nhan}"]`)].some(
						(b) => b.checkVisibility(),
					),
				{ timeout: E4.cho.moLaiMs },
				m.sheet.menu,
			)
			.then(() => true)
			.catch(() => false);
		if (mo) return;
		if (Date.now() > han) throw new Error(`khong mo duoc sheet cua ${mtId}`);
	}
}

async function moHopMucTieu(p, phong, mtId, { choNut = true } = {}) {
	await moSheet(p, phong, mtId);
	await bamNhan(p, `button[aria-label="${m.sheet.menu}"]`);
	const sanSang = p
		.waitForResponse((r) => r.url().includes("okr.troLySanSang"), {
			timeout: E4.cho.manMs,
		})
		.catch(() => null);
	await bam(p, "", m.sheet.sua, "menuitem");
	await p.waitForSelector(`[data-hop-thoai-muc-tieu="${mtId}"]`, {
		visible: true,
		timeout: E4.cho.manMs,
	});
	if (choNut)
		await p.waitForSelector('[data-nut-gop-y="nho"]', {
			visible: true,
			timeout: E4.cho.manMs,
		});
	else {
		await sanSang;
		await tre(E4.cho.lamMoiMs);
	}
}

const O_TEN = '[data-hop-thoai-muc-tieu] input[id$="-ten"]';
const O_CUA_TRUONG = {
	title: O_TEN,
	whyNow: '[data-hop-thoai-muc-tieu] textarea[id$="-vi-sao"]',
};

async function buocCaiDat(qt) {
	buoc = "ST-caidat-nac";
	await moiKho(qt, async (t) => {
		await t.p.goto(`${APP}/${slug}/settings/okr`, { waitUntil: "load" });
		kiem(
			`ST-caidat-nac ${t.rong}: the Tro ly OKR da tai`,
			await hien(t.p, '[data-the="tro-ly-okr"]:not([aria-busy])'),
		);
		await chup(t, "ST-caidat-nac", '[data-the="tro-ly-okr"]');
	});
}

async function buocNut(tl) {
	buoc = "ST-muctieu-nut";
	await moiKho(tl, async (t) => {
		const { p } = t;
		await moHopMucTieu(p, E4.bat.phong, MT);
		const chu = await p.$eval('[data-nut-gop-y="nho"] button', (b) =>
			b.textContent?.trim(),
		);
		kiem(`ST-muctieu-nut ${t.rong}: nut «${chu}»`, chu === g.nut.nho);
		await chup(t, "ST-muctieu-nut");

		await p.focus(O_TEN);
		await p.keyboard.press("End");
		await p.keyboard.type(E4.chuGo);
		await p.waitForSelector('[data-nut-gop-y="khoa"]', {
			visible: true,
			timeout: E4.cho.manMs,
		});
		const khoa = await p.$eval('[data-nut-gop-y="khoa"]', (o) => ({
			tat: o.querySelector("button")?.disabled ?? false,
			chu: o.innerText,
		}));
		kiem(
			`ST-muctieu-nut-khoa-sua ${t.rong}: nut tat ${khoa.tat}, co «${g.nut.khoaSua}»`,
			khoa.tat && khoa.chu.includes(g.nut.khoaSua),
		);
		await chup(t, "ST-muctieu-nut-khoa-sua");
		await p.focus(O_TEN);
		await p.keyboard.press("End");
		await p.keyboard.press("Backspace");
		kiem(
			`hoan lai chu da go ${t.rong}: nut mo lai`,
			await hien(p, '[data-nut-gop-y="nho"]'),
		);
	});
}

async function buocXuHuong(tl) {
	buoc = "ST-kr-xu-huong";
	if (!krNguon) {
		kiem(`bo mau co KR nguon CRM o ${E4.bat.mucTieu}`, false);
		return;
	}
	await moiKho(tl, async (t) => {
		const { p } = t;
		await moSheet(p, E4.bat.phong, MT);
		await bamNhan(p, `button[aria-label*="${krNguon.ten}"]`);
		await bamNhan(p, '[data-muc="sua-kr"]');
		const co = await hien(p, "[data-hop-thoai-kr] [data-xu-huong]");
		const chu = co
			? await p.$eval("[data-hop-thoai-kr] [data-xu-huong]", (o) => o.innerText)
			: "";
		kiem(`ST-kr-xu-huong ${t.rong}: «${chu.trim()}»`, co && chu.trim() !== "");
		await chup(t, "ST-kr-xu-huong", "[data-hop-thoai-kr] [data-xu-huong]");
	});
}

async function docTen(cookie, id) {
	return (await trpc(API, cookie).hoi("okr.objective", { id })).title;
}

async function docTruong(cookie, id, truong) {
	return (await trpc(API, cookie).hoi("okr.objective", { id }))[truong] ?? "";
}

async function choDieuKien(doc, hanMs) {
	const han = Date.now() + hanMs;
	while (Date.now() < han) {
		const v = await doc();
		if (v) return v;
		await tre(E4.cho.nhipMs);
	}
	return null;
}

async function moCotHaiKho(tl) {
	const ds = [];
	for (const kho of E4.kho) {
		const t = await trang(tl, kho);
		await moHopMucTieu(t.p, E4.bat.phong, MT);
		ds.push(t);
	}
	for (const t of ds) {
		await bamNhan(t.p, '[data-nut-gop-y="nho"] button');
		await t.p.waitForSelector("[data-cot-gop-y]", {
			visible: true,
			timeout: E4.cho.manMs,
		});
	}
	return ds;
}

async function dongVietLaiMucTieu(url) {
	const [d] = await truyVan(
		url,
		`SELECT id, truong, truoc, sau FROM "okrDeXuat"
		 WHERE "objectiveId" = $1 AND "keyResultId" IS NULL AND "trangThai" = 'cho'
		   AND loai = 'viet-lai' AND truong IN ('title', 'whyNow')
		 ORDER BY (truong = 'title') DESC, "createdAt" DESC LIMIT 1`,
		[MT],
	);
	return d ?? null;
}

async function choCotCoDong(ds, lan) {
	for (const t of ds) {
		const coDong = await t.p
			.waitForFunction(
				() =>
					document.querySelectorAll("[data-cot-gop-y] [data-dong]").length > 0,
				{ timeout: E4.cho.gopYMs },
			)
			.then(() => true)
			.catch(() => false);
		kiem(`cot gop y co dong ${t.rong} (lan ${lan})`, coDong);
		await chup(
			t,
			coDong ? "ST-muctieu-co-dong" : "ST-muctieu-khong-dong",
			"[data-cot-gop-y]",
		);
	}
}

async function luotCoDongMucTieu(tl, url) {
	let ds = await moCotHaiKho(tl);
	for (const t of ds) await chup(t, "ST-muctieu-dang-soan", "[data-cot-gop-y]");
	for (let lan = 1; ; lan += 1) {
		await choCotCoDong(ds, lan);
		const d = await dongVietLaiMucTieu(url);
		if (d || lan > E4.bat.viSaoThu.length) return { ds, d, lan };
		for (const t of ds) await t.ctx.close();
		await trpc(API, tl).lam("okr.updateObjective", {
			id: MT,
			whyNow: E4.bat.viSaoThu[lan - 1],
		});
		ds = await moCotHaiKho(tl);
	}
}

async function quyetDongKhac(t, d) {
	const khac = await t.p.evaluate(
		(id) =>
			[...document.querySelectorAll("[data-cot-gop-y] [data-dong]")]
				.filter(
					(o) =>
						o.getAttribute("data-dong") !== id &&
						!o.hasAttribute("data-decided"),
				)
				.map((o) => o.getAttribute("data-dong"))[0] ?? null,
		d.id,
	);
	if (!khac) {
		kiem(
			`ST-muctieu-da-quyet ${t.rong}: can mot dong thu hai de quyet o kho nay — luot chi co mot dong`,
			false,
		);
		return;
	}
	const hang = `[data-cot-gop-y] [data-dong="${khac}"]`;
	const nut = await t.p.evaluate(
		(hang, chu) =>
			[...document.querySelectorAll(`${hang} button`)].some(
				(b) => b.textContent?.trim() === chu,
			),
		hang,
		g.dong.bac,
	);
	await bam(t.p, hang, nut ? g.dong.bac : g.dong.boQua);
	kiem(
		`ST-muctieu-da-quyet ${t.rong}: dong ${khac} thu gon`,
		await hien(t.p, `${hang}[data-decided]`),
	);
	await chup(t, "ST-muctieu-da-quyet", hang);
}

async function buocGopY(tl) {
	buoc = "gop-y";
	const url = process.env.DATABASE_URL;
	await trpc(API, tl).lam("okr.updateObjective", {
		id: MT,
		title: E4.bat.tenYeu,
	});
	await trpc(API, tl).lam("okr.createKeyResult", {
		objectiveId: MT,
		...E4.bat.krYeu,
		ownerUserId: idMau("nguoi", E4.bat.truong),
	});
	const { ds, d, lan } = await luotCoDongMucTieu(tl, url);
	if (
		!kiem(
			`co dong viet lai Muc tieu de nhan: ${d ? d.truong : "khong"} sau ${lan} lan thu (toi da ${E4.bat.viSaoThu.length + 1})`,
			Boolean(d),
		)
	)
		return;
	const O = O_CUA_TRUONG[d.truong];
	const hang = `[data-cot-gop-y] [data-dong="${d.id}"]`;
	for (const t of ds) {
		await bam(t.p, hang, g.dong.sua);
		kiem(
			`ST-muctieu-sua-dong ${t.rong}: o sua mo`,
			await hien(t.p, `${hang} [data-slot="proposed-change-edit"]`),
		);
		await chup(t, "ST-muctieu-sua-dong", hang);
		await bam(t.p, hang, g.dong.huySua);
	}

	const [p1, p2] = ds;
	const truocNhan = await docTruong(tl, MT, d.truong);
	if (truocNhan === d.sau) {
		dong.push(
			`${E4.thongDiep.nhanKhongDoi}: ${d.truong} da luu «${truocNhan}» bang cau moi`,
		);
		await ket(3);
	}
	await quyetDongKhac(p2, d);
	await bam(p1.p, hang, g.dong.nhan);
	await p1.p.waitForSelector(`${hang}[data-decided="accepted"]`, {
		visible: true,
		timeout: E4.cho.manMs,
	});
	const oTen = await p1.p.$eval(O, (o) => o.value);
	const docLai = await docTruong(tl, MT, d.truong);
	kiem(
		`ST-muctieu-da-quyet: o ${d.truong} «${oTen}» = okr.objective «${docLai}» = cau da nhan`,
		oTen === d.sau && docLai === d.sau,
	);
	const toast = await p1.p
		.waitForFunction(
			(chu) =>
				[...document.querySelectorAll("[data-sonner-toast] button")].some(
					(b) => b.textContent?.trim() === chu,
				),
			{ timeout: E4.cho.manMs },
			g.toast.hoanTac,
		)
		.then(() => true)
		.catch(() => false);
	kiem(`toast co «${g.toast.hoanTac}»`, toast);
	await chup(p1, "ST-muctieu-da-quyet");
	const [vet] = await truyVan(
		url,
		`SELECT count(*)::int AS n FROM "okrTrail" WHERE note = $1`,
		[`tro-ly-okr:${d.id}`],
	);
	kiem(`OkrTrail co note tro-ly-okr:${d.id} (${vet.n} hang)`, vet.n >= 1);

	await bam(p1.p, "[data-sonner-toast]", g.toast.hoanTac);
	const veCu = await choDieuKien(
		async () => (await docTruong(tl, MT, d.truong)) === d.truoc,
		E4.cho.manMs,
	);
	kiem(
		`Hoan tac: okr.objective ${d.truong} doc lai «${d.truoc}»`,
		Boolean(veCu),
	);
	const ht = await docSql(url, E4.hoanTacSql, thangVN());
	const htBat = ht.find((h) => h.nac === "bat");
	kiem(`hoan-tac.sql dem ${htBat?.hoan_tac}`, htBat?.hoan_tac === 1);
	for (const t of ds) await t.ctx.close();

	await moiKho(tl, async (t) => {
		await t.p.goto(
			duongDonVi(E4.bat.phong, `&record=objective:${MT}&tab=vet`),
			{
				waitUntil: "load",
			},
		);
		const coVet = await t.p
			.waitForFunction(
				(chu) => document.body.innerText.includes(chu),
				{ timeout: E4.cho.manMs },
				g.vet.theoTroLy,
			)
			.then(() => true)
			.catch(() => false);
		kiem(`tab Vet ${t.rong} co «${g.vet.theoTroLy}»`, coVet);
		await chup(t, "vet-theo-tro-ly");
	});
}

async function choLuotAn(url, mtAn, batDau) {
	return choDieuKien(async () => {
		const [h] = await truyVan(
			url,
			`SELECT id, outcome FROM "agentTask"
			 WHERE kind = 'okr-de-xuat' AND payload ->> 'objectiveId' = $1
			   AND payload ->> 'nac' = 'an' AND "createdAt" >= $2::timestamptz AND "finishedAt" IS NOT NULL
			 ORDER BY "createdAt" DESC LIMIT 1`,
			[mtAn, batDau.toISOString()],
		);
		return h ?? null;
	}, E4.cho.luotAnMs);
}

async function buocCheDoAn(qt, tlAn) {
	buoc = "che-do-an";
	const url = process.env.DATABASE_URL;
	const mtAn = idMau("mt", E4.an.mucTieu);
	await trpc(API, qt).lam("okr.setProgram", {
		aiDeXuatAnPhamVi: "danh-sach",
		aiDeXuatAnDonVi: [idMau("pb", E4.an.phong)],
	});
	const cu = await docTen(tlAn, mtAn);
	const batDau = new Date();
	await trpc(API, tlAn).lam("okr.updateObjective", {
		id: mtAn,
		title: `${cu}${E4.hauToSuaAn}`,
	});
	const goi = await fetch(`${process.env.AGENT_URL}/internal/crm/dispatch`, {
		method: "POST",
		headers: { authorization: `Bearer ${process.env.AGENT_BRIDGE_SECRET}` },
	});
	if (goi.status !== 202)
		throw new Error(
			`goi dispatch cua tac tu tra ${goi.status}, khong phai 202`,
		);
	const luot = await choLuotAn(url, mtAn, batDau);
	if (!kiem(`luot an xong (${luot?.outcome ?? "chua dong"})`, Boolean(luot)))
		return;

	await moiKho(qt, async (t) => {
		await t.p.goto(`${APP}/${slug}/settings/okr`, { waitUntil: "load" });
		kiem(
			`ST-sodo-co-so ${t.rong}: bang co luot ${luot.id}`,
			await hien(t.p, `[data-the="gop-y-so-do"] [data-luot="${luot.id}"]`),
		);
		await chup(t, "ST-sodo-co-so", '[data-the="gop-y-so-do"]');
		await bamNhan(t.p, `[data-luot="${luot.id}"] [data-nut="mo-luot"]`);
		kiem(
			`ST-sodo-ngan ${t.rong}: ngan mot luot mo`,
			await hien(t.p, `[data-ngan-luot="${luot.id}"]`),
		);
		await chup(t, "ST-sodo-ngan");
	});

	await moiKho(tlAn, async (t) => {
		await moHopMucTieu(t.p, E4.an.phong, mtAn, { choNut: false });
		const con = await t.p.evaluate(() => ({
			nut: document.querySelector("[data-nut-gop-y]") !== null,
			cot: document.querySelector("[data-cot-gop-y]") !== null,
		}));
		kiem(
			`che do an ${t.rong}: truong phong ${E4.an.phong} khong thay nut (${con.nut}) va cot (${con.cot})`,
			!con.nut && !con.cot,
		);
		await chup(t, "ST-muctieu-an-khong-nut");
	});
}

if (!trongPhienCoTacTu()) {
	console.log(
		"-- API cua phien nay khong noi tac tu (thieu AGENT_BRIDGE_SECRET/AGENT_URL) — mo phien do rieng co tac tu",
	);
	process.exit(await chayTrongPhienCoTacTu(E4.lenh));
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

const MT = idMau("mt", E4.bat.mucTieu);
let qt;
let tl;
let tlAn;
let slug;
try {
	buoc = "chuan-bi";
	const nap = napBoMau();
	if (nap.ma !== 0)
		throw new Error(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	dong.push(`NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
	qt = phienCookie(thuMau(E4.quanTri));
	tl = phienCookie(thuMau(E4.bat.truong));
	tlAn = phienCookie(thuMau(E4.an.truong));
	slug = await suySlug(qt);
	if (!slug)
		throw new Error(`${APP}/ khong chuyen toi trang chinh cua workspace`);
	await trpc(API, qt).lam("okr.setProgram", {
		aiOn: true,
		aiDeXuatPhamVi: "danh-sach",
		aiDeXuatDonVi: [idMau("pb", E4.bat.phong)],
	});
	const ct = await trpc(API, qt).hoi("okr.program");
	kiem(
		`setProgram: aiOn ${ct.aiOn}, de xuat ${ct.aiDeXuatPhamVi} [${ct.aiDeXuatDonVi}]`,
		ct.aiOn === true && ct.aiDeXuatDonVi.includes(idMau("pb", E4.bat.phong)),
	);
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

mkdirSync(THU_MUC, { recursive: true });
trinhDuyet = await puppeteer.launch({
	executablePath: E4.chrome,
	headless: true,
});

try {
	await buocCaiDat(qt);
	await buocNut(tl);
	await buocXuHuong(tl);
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

if (!coKhoaMoHinh())
	await khongDo(`${cauThieuKhoa()} — buoc «Bam gop y» can model that co ZDR`);

try {
	tacTu = await batTacTu({
		cong: Number(process.env[PHIEN_TRO_LY.bienCongTacTu]),
		thuMuc: THU_MUC,
	});
	await buocGopY(tl);
	await buocCheDoAn(qt, tlAn);
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

await ket(sai === 0 ? 0 : 1);
