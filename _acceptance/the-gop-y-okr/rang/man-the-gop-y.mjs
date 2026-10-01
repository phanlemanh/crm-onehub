import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { okrMessages } from "../../../apps/app/lib/messages/okr.ts";
import { okrGopYMessages } from "../../../apps/app/lib/messages/okr-gop-y.ts";
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
	truyVan,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const GIAY_MS = 1000;
const PHUT_MS = 60 * GIAY_MS;

const TGY = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		rong: { rong: 1440, cao: 1000 },
		moc: { rong: 1024, cao: 900 },
		duoiMoc: { rong: 1023, cao: 900 },
		hep: { rong: 390, cao: 844 },
	},
	nguong: { cotPx: 360, cauPx: 320, lechHangPx: 8, dungSaiPx: 2 },
	cho: {
		manMs: 60 * GIAY_MS,
		gopYMs: 3 * PHUT_MS,
		lamMoiMs: 400,
		nhipMs: 500,
		moLaiMs: 5 * GIAY_MS,
	},
	quanTri: "le-hai-dang",
	chuKy: "quy4",
	phong: "kd-bac",
	truong: "nguyen-thi-lan",
	mucTieu: "q4-kd-bac-1",
	tenYeu: "Doanh thu quý 4 miền Bắc",
	viSaoThu: [
		"Quý 4 là mùa cao điểm; đội cần giữ đối tác mới ở lại sau đơn đầu.",
		"Mùa mua sắm cuối năm dồn đơn; đối tác mới cần chạy ổn trước tháng 12.",
		"Đối tác mới bỏ đi sau đơn đầu; quý 4 là lúc giữ họ ở lại.",
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
	chuSua: {
		title: "Không thoả thuận nào của miền Bắc bị mất dấu trong quý 4",
		whyNow:
			"Quý 3 mất dấu chín thoả thuận; quý 4 là mùa ký lại với đối tác lớn.",
	},
	lenh: 'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs"',
	thongDiep: { nhanKhongDoi: "nhan khong doi gi" },
};

const ANH = join(GOC, process.env.BANG_CHUNG ?? "_acceptance/the-gop-y-okr/evidence");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const m = okrMessages("vi");
const g = okrGopYMessages("vi");
const HOP_MT = "[data-hop-thoai-muc-tieu]";
const HOP_KR = "[data-hop-thoai-kr]";

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

function doBoCuc(chonHop) {
	const hop = document.querySelector(chonHop);
	if (!hop) return null;
	const khung = (o) => {
		if (!o) return null;
		const r = o.getBoundingClientRect();
		return { top: r.top, bottom: r.bottom, left: r.left, width: r.width };
	};
	const cot = hop.querySelector("[data-cot-gop-y]");
	const cau = cot?.querySelector(
		'[data-kind="rewrite"] [data-slot="proposed-change-value"]',
	);
	return {
		size: hop.getAttribute("data-size"),
		form: khung(hop.querySelector("form")),
		cot: khung(cot),
		cau: cau ? cau.getBoundingClientRect().width : null,
		the: [
			...(cot?.querySelectorAll('[data-slot="proposed-change"]') ?? []),
		].map((o) => o.getBoundingClientRect().width),
		sw: document.documentElement.scrollWidth,
		iw: window.innerWidth,
		soHop: document.querySelectorAll(
			"[data-hop-thoai-muc-tieu],[data-hop-thoai-kr]",
		).length,
	};
}

function kiemE1(so, ten, formTruoc) {
	const hauTo = ten === "kr" ? " (kr)" : "";
	const N = TGY.nguong;
	kiem(`E1 ${ten}: hop data-size=${so.size}`, so.size === "assist");
	kiem(
		`E1 ${ten}: cot gop y ${Math.round(so.cot?.width ?? 0)} >= ${N.cotPx}`,
		(so.cot?.width ?? 0) >= N.cotPx,
	);
	kiem(
		(so.cau ?? 0) >= N.cauPx
			? `E1 ${ten}: cau moi ${Math.round(so.cau)} >= ${N.cauPx}`
			: `cau moi hep${hauTo}: ${Math.round(so.cau ?? 0)} < ${N.cauPx}`,
		(so.cau ?? 0) >= N.cauPx,
	);
	kiem(
		`E1 ${ten}: cot form ${Math.round(so.form?.width ?? 0)} >= khi chua co cot ${Math.round(formTruoc)}`,
		(so.form?.width ?? 0) >= formTruoc - N.dungSaiPx,
	);
	kiemTran(so, `E1 ${ten}`);
}

function kiemTran(so, nhan) {
	kiem(
		so.sw <= so.iw
			? `${nhan}: scrollWidth ${so.sw} == innerWidth ${so.iw}`
			: `tran ngang ${nhan}: scrollWidth ${so.sw} > innerWidth ${so.iw}`,
		so.sw <= so.iw,
	);
}

function kiemE11(so, ten, rong) {
	const N = TGY.nguong;
	const nhan = `E11 ${ten} ${rong}`;
	if (!so.form || !so.cot) {
		kiem(`${nhan}: co form va cot`, false);
		return;
	}
	if (rong >= TGY.kho.moc.rong) {
		const lech = Math.abs(so.cot.top - so.form.top);
		kiem(
			`${nhan}: form va cot cung hang (lech ${Math.round(lech)} < ${N.lechHangPx})`,
			lech < N.lechHangPx,
		);
	} else {
		kiem(
			`${nhan}: cot duoi form (top cot ${Math.round(so.cot.top)} >= bottom form ${Math.round(so.form.bottom)})`,
			so.cot.top >= so.form.bottom - N.dungSaiPx,
		);
		kiem(
			`${nhan}: moi the trai het be ngang cot (${so.the.map(Math.round).join(",")} / cot ${Math.round(so.cot.width)})`,
			so.the.length > 0 && so.the.every((w) => w >= so.cot.width - N.dungSaiPx),
		);
	}
	kiemTran(so, nhan);
}

async function chup(p, ten) {
	await tre(TGY.cho.lamMoiMs);
	await p.evaluate(() => document.fonts.ready);
	const tep = join(ANH, `${ten}.png`);
	await p.screenshot({ path: tep });
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
}

async function kiemMotHop(p, nhan) {
	const so = await p.evaluate(
		() =>
			document.querySelectorAll("[data-hop-thoai-muc-tieu],[data-hop-thoai-kr]")
				.length,
	);
	kiem(`${nhan}: con dung mot hop OKR (${so})`, so === 1);
}

async function kiemDoDo() {
	trinhDuyet = await puppeteer.launch({
		executablePath: TGY.chrome,
		headless: true,
	});
	const p = await trinhDuyet.newPage();
	const hop = (thuocTinh, size) =>
		`<div role="dialog" ${thuocTinh} data-size="${size}" style="width:800px;display:grid;grid-template-columns:1fr 292px;gap:24px"><form style="height:120px"></form><section data-cot-gop-y><div data-slot="proposed-change" data-kind="rewrite"><p data-slot="proposed-change-value">Câu mới</p></div></section></div>`;
	await p.setViewport({ width: TGY.kho.rong.rong, height: TGY.kho.rong.cao });
	await p.setContent(
		`<body style="margin:0">${hop("data-hop-thoai-muc-tieu", "assist")}</body>`,
	);
	kiemE1(await p.evaluate(doBoCuc, HOP_MT), "muc tieu", 0);
	await p.setContent(
		`<body style="margin:0">${hop("data-hop-thoai-kr", "wide")}</body>`,
	);
	kiemE1(await p.evaluate(doBoCuc, HOP_KR), "kr", 0);
	await p.setViewport({ width: TGY.kho.hep.rong, height: TGY.kho.hep.cao });
	await p.setContent(
		'<body style="margin:0"><div style="width:500px;height:10px"></div></body>',
	);
	kiemTran(
		await p.evaluate(() => ({
			sw: document.documentElement.scrollWidth,
			iw: window.innerWidth,
		})),
		"trang 390",
	);
	const can = [
		"cau moi hep: 292 < 320",
		"cau moi hep (kr): 292 < 320",
		"tran ngang",
	];
	const thay = can.filter((c) => dong.some((d) => d.includes(c)));
	dong.push(
		`KIEM DO DO: ${thay.length}/${can.length} thong diep ghim do dung (${thay.join(" · ")})`,
	);
	await ket(thay.length === can.length ? 1 : 0);
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

async function bamKhiYen(p, tim, ...thamSo) {
	const han = Date.now() + TGY.cho.manMs;
	for (;;) {
		const h = await p.waitForFunction(
			tim,
			{ timeout: TGY.cho.manMs },
			...thamSo,
		);
		try {
			await h.asElement().click();
			return;
		} catch (loi) {
			if (Date.now() > han) throw loi;
			await tre(TGY.cho.lamMoiMs);
		}
	}
}

async function bam(p, trong, chu, vaiTro = "button") {
	const chon = vaiTro === "menuitem" ? '[role="menuitem"]' : "button";
	await bamKhiYen(
		p,
		(trong, chon, chu) =>
			[...document.querySelectorAll(`${trong} ${chon}`)].find(
				(x) =>
					x.textContent?.trim() === chu && x.checkVisibility() && !x.disabled,
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

async function hien(p, chon, hanMs = TGY.cho.manMs) {
	return p
		.waitForSelector(chon, { visible: true, timeout: hanMs })
		.then(() => true)
		.catch(() => false);
}

function duongDonVi(them = "") {
	return `${APP}/${slug}/okr/theo-don-vi?kyOkr=${idMau("chu-ky", TGY.chuKy)}&donOkr=pb:${idMau("pb", TGY.phong)}${them}`;
}

async function moSheet(p) {
	await p.goto(duongDonVi(), { waitUntil: "load" });
	const han = Date.now() + TGY.cho.manMs;
	for (;;) {
		await bamNhan(p, `[data-mo-muc-tieu="${MT}"]`);
		const mo = await p
			.waitForFunction(
				(nhan) =>
					[...document.querySelectorAll(`button[aria-label="${nhan}"]`)].some(
						(b) => b.checkVisibility(),
					),
				{ timeout: TGY.cho.moLaiMs },
				m.sheet.menu,
			)
			.then(() => true)
			.catch(() => false);
		if (mo) return;
		if (Date.now() > han) throw new Error(`khong mo duoc sheet cua ${MT}`);
	}
}

async function moHopMucTieu(p) {
	await moSheet(p);
	await bamNhan(p, `button[aria-label="${m.sheet.menu}"]`);
	await bam(p, "", m.sheet.sua, "menuitem");
	await p.waitForSelector(HOP_MT, { visible: true, timeout: TGY.cho.manMs });
	await p.waitForSelector("[data-nut-gop-y]", {
		visible: true,
		timeout: TGY.cho.manMs,
	});
}

async function moHopKr(p) {
	await moSheet(p);
	await bamNhan(p, `button[aria-label*="${TGY.krYeu.title}"]`);
	await bamNhan(p, '[data-muc="sua-kr"]');
	await p.waitForSelector(HOP_KR, { visible: true, timeout: TGY.cho.manMs });
	await p.waitForSelector("[data-nut-gop-y]", {
		visible: true,
		timeout: TGY.cho.manMs,
	});
}

async function coTheVietLai(p, chonHop, hanMs) {
	return p
		.waitForFunction(
			(chonHop) =>
				document.querySelector(
					`${chonHop} [data-cot-gop-y] [data-the-cho][data-kind="rewrite"]`,
				) !== null,
			{ timeout: hanMs },
			chonHop,
		)
		.then(() => true)
		.catch(() => false);
}

async function loaiTheCho(p, chonHop) {
	await p
		.waitForFunction(
			(chonHop) =>
				document
					.querySelector(`${chonHop} [data-cot-gop-y]`)
					?.getAttribute("aria-busy") !== "true",
			{ timeout: TGY.cho.gopYMs },
			chonHop,
		)
		.catch(() => {});
	return p.evaluate((chonHop) => {
		const cot = document.querySelector(`${chonHop} [data-cot-gop-y]`);
		const co = (k) =>
			cot?.querySelector(`[data-the-cho][data-kind="${k}"]`) !== null &&
			cot?.querySelector(`[data-the-cho][data-kind="${k}"]`) !== undefined;
		return {
			rewrite: co("rewrite"),
			question: co("question"),
			compact: co("compact"),
		};
	}, chonHop);
}

const duLoai = (l) => Boolean(l?.rewrite && l.question && l.compact);

async function nhoVaCho(p, chonHop) {
	await bamNhan(p, `${chonHop} [data-nut-gop-y="nho"] button`);
	return coTheVietLai(p, chonHop, TGY.cho.gopYMs);
}

async function buocE1(tl) {
	buoc = "E1";
	const t = await trang(tl, TGY.kho.rong);
	try {
		await moHopKr(t.p);
		const krTruoc = await t.p.evaluate(doBoCuc, HOP_KR);
		await t.ctx.close();

		const t2 = await trang(tl, TGY.kho.rong);
		await moHopMucTieu(t2.p);
		const mtTruoc = await t2.p.evaluate(doBoCuc, HOP_MT);
		let co = await nhoVaCho(t2.p, HOP_MT);
		let loai = co ? await loaiTheCho(t2.p, HOP_MT) : null;
		for (
			let lan = 0;
			!(co && duLoai(loai)) && lan < TGY.viSaoThu.length;
			lan += 1
		) {
			await t2.ctx.close();
			await trpc(API, tl).lam("okr.updateObjective", {
				id: MT,
				whyNow: TGY.viSaoThu[lan],
			});
			await trpc(API, tl).lam("okr.troLyDeXuat", { objectiveId: MT });
			const t3 = await trang(tl, TGY.kho.rong);
			await moHopMucTieu(t3.p);
			co = await coTheVietLai(t3.p, HOP_MT, TGY.cho.gopYMs);
			loai = co ? await loaiTheCho(t3.p, HOP_MT) : null;
			Object.assign(t2, t3);
		}
		dong.push(
			`GHI loai the cho sau nho gop y: viet lai ${loai?.rewrite} · cau hoi ${loai?.question} · can chinh ${loai?.compact}`,
		);
		if (
			!kiem(
				"E1 muc tieu: cot co the viet lai sau khi nho gop y (model that)",
				co,
			)
		)
			return;
		await chup(t2.p, "E1-1440-muc-tieu");
		kiemE1(
			await t2.p.evaluate(doBoCuc, HOP_MT),
			"muc tieu",
			mtTruoc?.form?.width ?? 0,
		);
		await t2.ctx.close();

		const t4 = await trang(tl, TGY.kho.rong);
		await moHopKr(t4.p);
		let coKr = await coTheVietLai(t4.p, HOP_KR, TGY.cho.moLaiMs);
		if (!coKr) coKr = await nhoVaCho(t4.p, HOP_KR);
		if (kiem("E1 kr: cot co the viet lai ten KR", coKr)) {
			await chup(t4.p, "E1-1440-kr");
			kiemE1(
				await t4.p.evaluate(doBoCuc, HOP_KR),
				"kr",
				krTruoc?.form?.width ?? 0,
			);
		}
		await t4.ctx.close();
	} catch (loi) {
		await t.ctx.close().catch(() => {});
		throw loi;
	}
}

async function buocE11(tl) {
	buoc = "E11";
	for (const kho of [TGY.kho.hep, TGY.kho.duoiMoc, TGY.kho.moc, TGY.kho.rong]) {
		for (const [ten, moHop, chon] of [
			["muc-tieu", moHopMucTieu, HOP_MT],
			["kr", moHopKr, HOP_KR],
		]) {
			const t = await trang(tl, kho);
			try {
				await moHop(t.p);
				if (
					!kiem(
						`E11 ${ten} ${kho.rong}: cot mo lai voi the cho`,
						await coTheVietLai(t.p, chon, TGY.cho.manMs),
					)
				)
					continue;
				kiemE11(await t.p.evaluate(doBoCuc, chon), ten, kho.rong);
				await t.p.evaluate((chon) => {
					document
						.querySelector(`${chon} [data-cot-gop-y]`)
						?.scrollIntoView({ block: "start" });
				}, chon);
				await chup(t.p, `E11-${kho.rong}-${ten}`);
			} finally {
				await t.ctx.close();
			}
		}
	}
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

async function docTruong(cookie, truong) {
	return (
		(await trpc(API, cookie).hoi("okr.objective", { id: MT }))[truong] ?? ""
	);
}

async function choDieuKien(doc, hanMs) {
	const han = Date.now() + hanMs;
	while (Date.now() < han) {
		const v = await doc();
		if (v) return v;
		await tre(TGY.cho.nhipMs);
	}
	return null;
}

async function idTheCho(p, loc) {
	return p.evaluate(
		(loc) =>
			[...document.querySelectorAll(`[data-cot-gop-y] [data-the-cho]${loc}`)]
				.map((o) => o.getAttribute("data-dong"))
				.filter(Boolean),
		loc,
	);
}

async function buocE13(tl) {
	buoc = "E13";
	const url = process.env.DATABASE_URL;
	const d = await dongVietLaiMucTieu(url);
	if (
		!kiem(
			`E13: co dong viet lai Muc tieu cho nhan (${d?.truong ?? "khong"})`,
			Boolean(d),
		)
	)
		return;
	const p1 = await trang(tl, TGY.kho.rong);
	const p2 = await trang(tl, TGY.kho.hep);
	try {
		for (const t of [p1, p2]) {
			await moHopMucTieu(t.p);
			kiem(
				`E13 ${t.rong}: cot co dong`,
				await coTheVietLai(t.p, HOP_MT, TGY.cho.manMs),
			);
			await t.p.evaluate(() =>
				document
					.querySelector("[data-cot-gop-y]")
					?.scrollIntoView({ block: "start" }),
			);
			await chup(t.p, `E13-${t.rong}-co-dong`);
			const coCanChinh = await t.p.evaluate(() => {
				const the = document.querySelector(
					'[data-cot-gop-y] [data-the-cho][data-kind="compact"]',
				);
				the?.scrollIntoView({ block: "center" });
				return the !== null;
			});
			if (kiem(`E13 ${t.rong}: co the can chinh de chup tron`, coCanChinh))
				await chup(t.p, `E13-${t.rong}-can-chinh`);
		}

		const khac = (await idTheCho(p2.p, ':not([data-kind="question"])')).filter(
			(id) => id !== d.id,
		)[0];
		if (
			kiem(
				`E13 390: co mot the cho khac de Bac (${khac ?? "khong"})`,
				Boolean(khac),
			)
		) {
			await bam(p2.p, `[data-dong="${khac}"]`, g.dong.bac);
			await hien(p2.p, `[data-dong="${khac}"][data-decided]`);
			await kiemMotHop(p2.p, "E13 390 sau Bac");
			await chup(p2.p, "E13-390-bac");
		}
		const hoi = (await idTheCho(p2.p, '[data-kind="question"]'))[0];
		if (
			kiem(`E13 390: co cau hoi de Bo qua (${hoi ?? "khong"})`, Boolean(hoi))
		) {
			await bam(p2.p, `[data-dong="${hoi}"]`, g.dong.boQua);
			await hien(p2.p, `[data-dong="${hoi}"][data-decided]`);
			await kiemMotHop(p2.p, "E13 390 sau Bo qua");
			await chup(p2.p, "E13-390-bo-qua");
		}

		const truoc = await docTruong(tl, d.truong);
		const chuSua = TGY.chuSua[d.truong];
		if (truoc === chuSua) {
			dong.push(
				`${TGY.thongDiep.nhanKhongDoi}: ${d.truong} da luu «${truoc}» bang chu se sua`,
			);
			await ket(3);
		}
		const hang = `[data-dong="${d.id}"]`;
		await p1.p.reload({ waitUntil: "load" });
		await moHopMucTieu(p1.p);
		await coTheVietLai(p1.p, HOP_MT, TGY.cho.manMs);
		await bam(p1.p, hang, g.dong.sua);
		await kiemMotHop(p1.p, "E13 1440 sau Sua");
		const o = `${hang} [data-slot="proposed-change-edit"]`;
		await p1.p.waitForSelector(o, { visible: true, timeout: TGY.cho.manMs });
		await p1.p.$eval(o, (x) => {
			x.focus();
			x.select();
		});
		await p1.p.keyboard.press("Backspace");
		await p1.p.type(o, chuSua);
		await kiemMotHop(p1.p, "E13 1440 sau go");
		await chup(p1.p, "E13-1440-dang-sua");
		await bam(p1.p, hang, g.dong.nhanBanSua);
		await p1.p.waitForSelector(`${hang}[data-decided="accepted"]`, {
			visible: true,
			timeout: TGY.cho.manMs,
		});
		await kiemMotHop(p1.p, "E13 1440 sau Nhan ban da sua");
		const docLai = await choDieuKien(
			async () => (await docTruong(tl, d.truong)) === chuSua,
			TGY.cho.manMs,
		);
		kiem(
			`E13: okr.objective ${d.truong} doc lai bang chu da sua va khac cau truoc («${truoc}»)`,
			Boolean(docLai) && truoc !== chuSua,
		);
		await chup(p1.p, "E13-1440-da-nhan");
		const [vet] = await truyVan(
			url,
			`SELECT count(*)::int AS n FROM "okrTrail" WHERE note = $1`,
			[`tro-ly-okr:${d.id}`],
		);
		kiem(
			`E13: OkrTrail co note tro-ly-okr:${d.id} (${vet.n} hang)`,
			vet.n >= 1,
		);
	} finally {
		await p1.ctx.close();
		await p2.ctx.close();
	}
	for (const kho of [TGY.kho.rong, TGY.kho.hep]) {
		const t = await trang(tl, kho);
		try {
			await t.p.goto(duongDonVi(`&record=objective:${MT}&tab=vet`), {
				waitUntil: "load",
			});
			const coVet = await t.p
				.waitForFunction(
					(chu) => document.body.innerText.includes(chu),
					{ timeout: TGY.cho.manMs },
					g.vet.theoTroLy,
				)
				.then(() => true)
				.catch(() => false);
			kiem(`E13 tab Vet ${kho.rong} co «${g.vet.theoTroLy}»`, coVet);
			await chup(t.p, `E13-${kho.rong}-vet`);
		} finally {
			await t.ctx.close();
		}
	}
}

mkdirSync(ANH, { recursive: true });

if (process.argv.includes("--kiem-do-do")) await kiemDoDo();

if (!trongPhienCoTacTu()) {
	console.log(
		"-- API cua phien nay khong noi tac tu — mo phien do rieng co tac tu",
	);
	process.exit(await chayTrongPhienCoTacTu(TGY.lenh));
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

const MT = idMau("mt", TGY.mucTieu);
let slug;
let tl;
try {
	buoc = "chuan-bi";
	const nap = napBoMau();
	if (nap.ma !== 0)
		throw new Error(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	dong.push(`NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
	const qt = phienCookie(thuMau(TGY.quanTri));
	tl = phienCookie(thuMau(TGY.truong));
	slug = await suySlug(qt);
	if (!slug)
		throw new Error(`${APP}/ khong chuyen toi trang chinh cua workspace`);
	await trpc(API, qt).lam("okr.setProgram", {
		aiOn: true,
		aiDeXuatPhamVi: "danh-sach",
		aiDeXuatDonVi: [idMau("pb", TGY.phong)],
	});
	await trpc(API, tl).lam("okr.updateObjective", { id: MT, title: TGY.tenYeu });
	await trpc(API, tl).lam("okr.createKeyResult", {
		objectiveId: MT,
		...TGY.krYeu,
		ownerUserId: idMau("nguoi", TGY.truong),
	});
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

if (!coKhoaMoHinh())
	await khongDo(`${cauThieuKhoa()} — buoc nho gop y can model that`);

trinhDuyet = await puppeteer.launch({
	executablePath: TGY.chrome,
	headless: true,
});
try {
	tacTu = await batTacTu({
		cong: Number(process.env[PHIEN_TRO_LY.bienCongTacTu]),
		thuMuc: join(GOC, ".acceptance-runs/the-gop-y-okr"),
	});
	await buocE1(tl);
	await buocE11(tl);
	await buocE13(tl);
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

await ket(sai === 0 ? 0 : 1);
