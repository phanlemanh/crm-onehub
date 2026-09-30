import { mkdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
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
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const GIAY_MS = 1000;

const KTO = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		rong: { rong: 1440, cao: 900 },
		moc: { rong: 1024, cao: 900 },
		duoiMoc: { rong: 1023, cao: 900 },
		hep: { rong: 390, cao: 844 },
	},
	nguong: {
		khopPx: 1,
		lechHangPx: 8,
		dungSaiPx: 2,
		chanPhaiPx: 24,
		tuHangPx: 640,
		tamHangPx: 2,
		haiXPx: 8,
	},
	gia: { rongPx: 384, hepPx: 292, lechPx: 20, tranPx: 600, dauLechPx: 11 },
	cho: {
		manMs: 120 * GIAY_MS,
		nganMs: 60 * GIAY_MS,
		hoatMs: 5 * GIAY_MS,
		nhipMs: 100,
		lamMoiMs: 400,
		theMs: 4 * 60 * GIAY_MS,
	},
	quanTri: "le-hai-dang",
	chuKy: "quy4",
	phong: "kd-bac",
	truong: "nguyen-thi-lan",
	mucTieu: "q4-kd-bac-1",
	huy: "Huỷ",
	nutDev: "nextjs-portal, .tsqd-parent-container, .tsqd-open-btn-container",
	lenh: 'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-tao-okr-nhu-deal/rang/man-khung.mjs"',
	lenhDauCot:
		'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-tao-okr-nhu-deal/rang/man-khung.mjs --chi dau-cot"',
	thongDiep: {
		lechBeNgang: "lech be ngang",
		tranNgang: "tran ngang",
		huyKhongBenTrai: "huy khong ben trai",
		dauLechTrai: "dau cot lech trai",
		dauKhacCo: "dau cot khac co chu",
	},
};

const ANH = join(GOC, "_acceptance/khung-tao-okr-nhu-deal/evidence");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";

const g = okrGopYMessages("vi");
const CHI_DAU_COT = process.argv.includes("--chi");
const dong = [];
let sai = 0;
let trinhDuyet = null;
let tacTu = null;
let slug = null;
let MT = null;
let KR = null;

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

const tron = (x) =>
	x === null || x === undefined ? "?" : Math.round(x * 10) / 10;

function doNgan(chon) {
	const ngan = [...document.querySelectorAll(chon)].find((o) =>
		o.checkVisibility(),
	);
	if (!ngan) return null;
	const khung = (o) => {
		if (!o) return null;
		const r = o.getBoundingClientRect();
		return {
			top: r.top,
			bottom: r.bottom,
			left: r.left,
			right: r.right,
			width: r.width,
			height: r.height,
		};
	};
	const moTa = (o) => {
		const s = o.getAttribute("data-slot");
		return `${o.tagName.toLowerCase()}${s ? `[data-slot=${s}]` : ""}`;
	};
	const tieuDe = ngan.querySelector('[data-slot="sheet-title"]');
	const chan = ngan.querySelector('[data-slot="sheet-footer"]');
	const boQua = new Set(["sheet-header", "sheet-footer", "sheet-close"]);
	const than =
		ngan.querySelector('[data-slot="sheet-body"]') ??
		[...ngan.children].find(
			(c) =>
				!boQua.has(c.getAttribute("data-slot")) &&
				Number.parseFloat(getComputedStyle(c).flexGrow) > 0,
		) ??
		null;
	const cuon = [ngan, ...ngan.querySelectorAll("*")].filter((o) => {
		const oy = getComputedStyle(o).overflowY;
		return (
			(oy === "auto" || oy === "scroll") &&
			o.checkVisibility() &&
			(o.scrollHeight > o.clientHeight + 1 || o === than)
		);
	});
	let xa = null;
	for (const o of ngan.querySelectorAll("*")) {
		if (!o.checkVisibility()) continue;
		const q = o.getBoundingClientRect();
		if (q.width === 0 || q.height === 0) continue;
		if (!xa || q.right > xa.right)
			xa = { right: q.right, moTa: moTa(o), rong: q.width };
	}
	const nut = chan
		? [...chan.querySelectorAll("button")].filter((b) => b.checkVisibility())
		: [];
	const laHuy = (b) => b.textContent.trim().normalize() === "Huỷ".normalize();
	const huy = nut.find(laHuy) ?? null;
	const chinh = nut.filter((b) => b !== huy).at(-1) ?? null;
	const cot = ngan.querySelector("[data-cot-gop-y]");
	const form = ngan.querySelector("form");
	return {
		iw: window.innerWidth,
		ih: window.innerHeight,
		size: ngan.getAttribute("data-size"),
		side: ngan.getAttribute("data-side"),
		ngan: khung(ngan),
		nganSw: ngan.scrollWidth,
		nganCw: ngan.clientWidth,
		tieuDe: khung(tieuDe),
		than: than
			? { moTa: moTa(than), sw: than.scrollWidth, cw: than.clientWidth }
			: null,
		cuon: cuon.map((o) => ({
			moTa: moTa(o),
			laThan: o === than,
			chuaChan: chan ? o.contains(chan) : false,
			sh: o.scrollHeight,
			ch: o.clientHeight,
		})),
		chan: khung(chan),
		xa,
		huy: huy ? { ...khung(huy), chu: huy.textContent.trim() } : null,
		chinh: chinh
			? {
					...khung(chinh),
					chu: chinh.textContent.trim(),
					tat: chinh.disabled,
					variant: chinh.getAttribute("data-variant"),
				}
			: null,
		cot: khung(cot),
		form: khung(form),
	};
}

function kiemTranNgan(so, nhan, ten) {
	const k = KTO.nguong.khopPx;
	const nganOk = so.nganSw <= so.nganCw;
	const thanOk = so.than ? so.than.sw <= so.than.cw : true;
	const xaOk = so.xa ? so.xa.right <= so.ngan.right + k : true;
	const soLieu = `ngan sw ${so.nganSw}/cw ${so.nganCw} · than sw ${so.than?.sw ?? "-"}/cw ${so.than?.cw ?? "-"} · con xa nhat ${so.xa?.moTa ?? "-"} right ${tron(so.xa?.right)} <= ngan right ${tron(so.ngan.right)} + ${k}`;
	const dat = nganOk && thanOk && xaOk;
	kiem(
		dat
			? `${nhan}: khong tran ngang trong ngan (${soLieu})`
			: `${KTO.thongDiep.tranNgang}: ${ten} ${so.iw} (${soLieu})`,
		dat,
	);
}

function kiemE3(so, deal, ten) {
	const k = KTO.nguong.khopPx;
	const nhan = `E3 ${so.iw} ${ten}`;
	const n = so.ngan;
	kiem(
		`${nhan}: data-side=${so.side} · right ${tron(n.right)} == innerWidth ${so.iw}`,
		so.side === "right" && Math.abs(n.right - so.iw) <= k,
	);
	kiem(`${nhan}: top ${tron(n.top)} == 0`, Math.abs(n.top) <= k);
	kiem(
		`${nhan}: height ${tron(n.height)} == innerHeight ${so.ih}`,
		Math.abs(n.height - so.ih) <= k,
	);
	if (deal && deal !== so) {
		const lech = Math.abs(n.width - deal.ngan.width);
		kiem(
			lech <= k
				? `${nhan}: be ngang ${tron(n.width)} chenh ngan deal ${tron(deal.ngan.width)} = ${tron(lech)} <= ${k}`
				: `${KTO.thongDiep.lechBeNgang}: ${tron(lech)} — ${ten} ${so.iw} rong ${tron(n.width)}, ngan deal ${tron(deal.ngan.width)}`,
			lech <= k,
		);
		const lechTd =
			so.tieuDe && deal.tieuDe
				? Math.abs(so.tieuDe.top - deal.tieuDe.top)
				: Number.POSITIVE_INFINITY;
		kiem(
			`${nhan}: top tieu de ${tron(so.tieuDe?.top)} chenh ngan deal ${tron(deal.tieuDe?.top)} = ${tron(lechTd)} <= ${k}`,
			lechTd <= k,
		);
	}
	const moTaCuon = so.cuon
		.map(
			(c) =>
				`${c.moTa}${c.laThan ? " (than)" : ""} sh ${c.sh}/ch ${c.ch}${c.chuaChan ? " CHUA CHAN" : ""}`,
		)
		.join(" · ");
	kiem(
		`${nhan}: dung mot vung cuon doc la than ngan ${so.than?.moTa ?? "khong co than"} va khong chua chan (${so.cuon.length}: ${moTaCuon || "khong co"})`,
		so.cuon.length === 1 && so.cuon[0].laThan && !so.cuon[0].chuaChan,
	);
	kiem(
		`${nhan}: bottom chan ${tron(so.chan?.bottom)} == bottom ngan ${tron(n.bottom)}`,
		so.chan !== null && Math.abs(so.chan.bottom - n.bottom) <= k,
	);
	kiemTranNgan(so, nhan, ten);
}

function kiemE5(so, ten, laTao) {
	const N = KTO.nguong;
	const nhan = `E5 ${so.iw} ${ten}`;
	const { huy, chinh, chan } = so;
	if (
		!kiem(
			`${nhan}: chan co «${KTO.huy}» va nut chinh («${chinh?.chu ?? "-"}» variant ${chinh?.variant ?? "-"})`,
			Boolean(huy && chinh && chan),
		)
	)
		return;
	if (so.iw >= N.tuHangPx) {
		kiem(
			huy.right <= chinh.left
				? `${nhan}: «${KTO.huy}».right ${tron(huy.right)} <= nut chinh.left ${tron(chinh.left)}`
				: `${KTO.thongDiep.huyKhongBenTrai}: ${ten} ${so.iw} («${KTO.huy}».right ${tron(huy.right)} > nut chinh.left ${tron(chinh.left)})`,
			huy.right <= chinh.left,
		);
		const lechTop = Math.abs(huy.top - chinh.top);
		kiem(
			`${nhan}: top hai nut chenh ${tron(lechTop)} < ${N.dungSaiPx}`,
			lechTop < N.dungSaiPx,
		);
		const cach = chan.right - chinh.right;
		kiem(
			`${nhan}: nut chinh right ${tron(chinh.right)} cach chan right ${tron(chan.right)} = ${tron(cach)} <= ${N.chanPhaiPx}`,
			cach >= 0 && cach <= N.chanPhaiPx,
		);
	} else {
		kiem(
			`${nhan}: nut chinh bottom ${tron(chinh.bottom)} <= «${KTO.huy}» top ${tron(huy.top)}`,
			chinh.bottom <= huy.top,
		);
	}
	if (laTao)
		kiem(
			`${nhan}: ngan tao rong co nut gui «${chinh.chu}» disabled=${chinh.tat}`,
			chinh.tat === true,
		);
}

function kiemRong(so, ten) {
	const N = KTO.nguong;
	const nhan = `E3 rong ${so.iw} ${ten}`;
	kiem(`${nhan}: data-size=${so.size}`, so.size === "assist");
	if (!kiem(`${nhan}: co form va cot gop y`, Boolean(so.form && so.cot)))
		return;
	if (so.iw >= KTO.kho.moc.rong) {
		const lech = Math.abs(so.cot.top - so.form.top);
		kiem(
			`${nhan}: cot cung hang form (top cot ${tron(so.cot.top)} · top form ${tron(so.form.top)} · lech ${tron(lech)} < ${N.lechHangPx}) · rong ngan ${tron(so.ngan.width)} · form ${tron(so.form.width)} · cot ${tron(so.cot.width)}`,
			lech < N.lechHangPx,
		);
	} else {
		kiem(
			`${nhan}: cot duoi form (top cot ${tron(so.cot.top)} >= bottom form ${tron(so.form.bottom)} - ${N.dungSaiPx}) · rong ngan ${tron(so.ngan.width)} · form ${tron(so.form.width)} · cot ${tron(so.cot.width)}`,
			so.cot.top >= so.form.bottom - N.dungSaiPx,
		);
	}
	kiemTranNgan(so, nhan, ten);
}

async function choNgan(p, chon, hanMs = KTO.cho.nganMs) {
	await p.waitForSelector(chon, { visible: true, timeout: hanMs });
	const han = Date.now() + KTO.cho.hoatMs;
	let truoc = null;
	while (Date.now() < han) {
		const bay = await p.evaluate((chon) => {
			const o = [...document.querySelectorAll(chon)].find((x) =>
				x.checkVisibility(),
			);
			if (!o) return null;
			const r = o.getBoundingClientRect();
			const chay = o
				.getAnimations({ subtree: true })
				.filter((a) => a.playState === "running").length;
			return { r: `${r.left},${r.top},${r.width},${r.height}`, chay };
		}, chon);
		if (bay && bay.chay === 0 && truoc === bay.r) break;
		truoc = bay?.r ?? null;
		await tre(KTO.cho.nhipMs);
	}
	await p.evaluate(() => document.fonts.ready);
	await tre(KTO.cho.nhipMs);
}

async function chup(p, ten) {
	await p.addStyleTag({
		content: `${KTO.nutDev} { display: none !important; }`,
	});
	await tre(KTO.cho.lamMoiMs);
	await p.evaluate(() => document.fonts.ready);
	const tep = join(ANH, `${ten}.png`);
	await p.screenshot({ path: tep });
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
}

function doDauCot(chon, tieuDe, nhanDong) {
	const ngan = [...document.querySelectorAll(chon)].find((o) =>
		o.checkVisibility(),
	);
	const cot = ngan?.querySelector("[data-cot-gop-y]");
	if (!ngan || !cot) return null;
	const khung = (o) => {
		if (!o) return null;
		const r = o.getBoundingClientRect();
		return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
	};
	const khungChu = (o) => {
		if (!o) return null;
		const vung = document.createRange();
		vung.selectNodeContents(o);
		const r = vung.getBoundingClientRect();
		return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
	};
	const tieu = [...cot.querySelectorAll("*")].find(
		(o) =>
			tieuDe.includes(o.textContent?.trim() ?? "") &&
			![...o.children].some(
				(c) => c.textContent?.trim() === o.textContent?.trim(),
			),
	);
	const x = cot.querySelector(`button[aria-label="${nhanDong}"]`);
	let hang = tieu;
	while (hang && x && !hang.contains(x) && hang !== cot)
		hang = hang.parentElement;
	const ke = hang && hang !== cot ? hang.nextElementSibling : null;
	const laChu =
		ke !== null &&
		ke.children.length === 0 &&
		(ke.textContent?.trim() ?? "") !== "";
	const moTa = laChu ? ke : null;
	const sau = laChu ? ke.nextElementSibling : ke;
	const dau =
		sau?.getAttribute("data-slot") === "empty"
			? sau
			: (sau?.firstElementChild ?? sau);
	const nutForm = [...ngan.querySelectorAll("form button")].find((b) =>
		b.checkVisibility(),
	);
	const xNgan = ngan.querySelector(':scope > [data-slot="sheet-close"]');
	const tieuNgan = ngan.querySelector('[data-slot="sheet-title"]');
	const kieu = (o) =>
		o
			? {
					co: Number.parseFloat(getComputedStyle(o).fontSize),
					dam: getComputedStyle(o).fontWeight,
				}
			: null;
	return {
		tieu: khungChu(tieu),
		x: khung(x),
		moTa: khungChu(moTa),
		dau: khung(dau),
		nutForm: khung(nutForm),
		xNgan: khung(xNgan),
		kieuTieu: kieu(tieu),
		kieuMoTa: kieu(moTa),
		kieuNgan: kieu(tieuNgan),
		coThe: cot.querySelector('[data-slot="proposed-change"]') !== null,
	};
}

function kiemDauCot(so, nhan, rong) {
	const N = KTO.nguong;
	if (!so?.tieu || !so.x || !so.dau) {
		kiem(`E24 ${nhan}: thay du tieu de, dau X, phan tu dau`, false);
		return;
	}
	const lechMoTa = so.moTa ? so.tieu.left - so.moTa.left : 0;
	const lechDau = so.tieu.left - so.dau.left;
	const lech = Math.max(Math.abs(lechMoTa), Math.abs(lechDau));
	kiem(
		lech <= N.khopPx
			? `E24 ${nhan}: tieu de bam mep trai (lech mo ta ${tron(lechMoTa)} · lech phan tu dau ${tron(lechDau)})`
			: `${KTO.thongDiep.dauLechTrai}: ${tron(lech)} (${nhan})`,
		lech <= N.khopPx,
	);
	const lechX = Math.abs(so.x.right - so.dau.right);
	kiem(
		`E24 ${nhan}: dau X dong cot bam mep phai (lech ${tron(lechX)} <= ${N.khopPx})`,
		lechX <= N.khopPx,
	);
	const cungCo =
		so.kieuTieu &&
		so.kieuNgan &&
		so.kieuTieu.co === so.kieuNgan.co &&
		so.kieuTieu.dam === so.kieuNgan.dam;
	kiem(
		cungCo
			? `E24 ${nhan}: tieu de cot cung co chu tieu de ngan (${so.kieuTieu.co}px/${so.kieuTieu.dam})`
			: `${KTO.thongDiep.dauKhacCo}: cot ${so.kieuTieu?.co}px/${so.kieuTieu?.dam} · ngan ${so.kieuNgan?.co}px/${so.kieuNgan?.dam} (${nhan})`,
		cungCo,
	);
	if (so.moTa)
		kiem(
			`E24 ${nhan}: dong mo ta ${so.kieuMoTa?.co}px khong to hon tieu de ${so.kieuTieu?.co}px`,
			(so.kieuMoTa?.co ?? 99) <= (so.kieuTieu?.co ?? 0),
		);
	if (rong >= KTO.kho.moc.rong) {
		if (!so.nutForm) kiem(`E24 ${nhan}: thay nut dau cua form`, false);
		else {
			const tam = (k) => (k.top + k.bottom) / 2;
			const lechTam = Math.abs(tam(so.tieu) - tam(so.nutForm));
			kiem(
				`E24 ${nhan}: tam hang tieu de cot lech tam nut dau form ${tron(lechTam)} <= ${N.tamHangPx}`,
				lechTam <= N.tamHangPx,
			);
		}
	}
	if (so.xNgan) {
		const ngang = Math.max(
			so.x.left - so.xNgan.right,
			so.xNgan.left - so.x.right,
		);
		const doc = Math.max(
			so.x.top - so.xNgan.bottom,
			so.xNgan.top - so.x.bottom,
		);
		const cach = Math.max(ngang, doc);
		kiem(
			`E24 ${nhan}: hai dau X cach nhau ${tron(cach)} >= ${N.haiXPx}`,
			cach >= N.haiXPx,
		);
	}
}

function trangGia(ngan) {
	return `<!doctype html><html><head><style>*{box-sizing:border-box}body{margin:0;font:14px sans-serif}[data-slot=sheet-content]{position:fixed;top:0;right:0;height:100vh;display:flex;flex-direction:column;background:#fff;border-left:1px solid #ccc}[data-slot=sheet-header]{padding:16px}[data-slot=sheet-title]{margin:0;font-size:14px}[data-slot=sheet-body]{flex:1;min-height:0;overflow-y:auto;padding:0 16px}[data-slot=sheet-footer]{margin-top:auto;display:flex;flex-direction:column-reverse;gap:8px;padding:16px}@media (min-width:640px){[data-slot=sheet-footer]{flex-direction:row;justify-content:flex-end}}</style></head><body>${ngan}</body></html>`;
}

function nganGia({ rong, conThan = "", chinhTruoc = false }) {
	const huy = '<button type="button" data-variant="outline">Huỷ</button>';
	const chinh =
		'<button type="submit" data-variant="default" disabled>Tạo</button>';
	return `<div data-slot="sheet-content" data-side="right" data-size="sm" style="width:${rong}px"><div data-slot="sheet-header"><h2 data-slot="sheet-title">Ngăn giả</h2></div><div data-slot="sheet-body"><form><input style="width:100%"></form>${conThan}</div><div data-slot="sheet-footer">${chinhTruoc ? chinh + huy : huy + chinh}</div></div>`;
}

async function doGia(p, kho, ngan) {
	await p.setViewport({ width: kho.rong, height: kho.cao });
	await p.setContent(trangGia(ngan));
	return p.evaluate(doNgan, '[data-slot="sheet-content"]');
}

function nganDauGia({ thut = 0, coTieu = 14 }) {
	return `<div data-slot="sheet-content" data-side="right" style="width:800px"><div data-slot="sheet-header"><h2 data-slot="sheet-title" style="font-size:14px;font-weight:500">Sửa mục tiêu</h2></div><button data-slot="sheet-close" style="position:absolute;top:12px;right:12px;width:28px;height:28px">x</button><div data-slot="sheet-body" style="display:grid;grid-template-columns:1fr 380px;gap:24px;align-items:start"><form><button type="button" style="height:32px">Nhờ</button></form><section data-cot-gop-y><div style="display:flex;align-items:center;justify-content:space-between;height:32px;padding-left:${thut}px"><p style="margin:0;font-size:${coTieu}px;font-weight:500">${g.cot.tieuDe}</p><button aria-label="${g.cot.dong}" style="width:28px;height:28px">x</button></div><p style="margin:0;font-size:12px">Trợ lý OKR đang đọc</p><div><div style="height:80px;border:1px solid #ccc"></div></div></section></div></div>`;
}

async function kiemDoDo() {
	if (process.argv[process.argv.indexOf("--kiem-do-do") + 1] === "dau-cot") {
		trinhDuyet = await puppeteer.launch({
			executablePath: KTO.chrome,
			headless: true,
		});
		const p = await trinhDuyet.newPage();
		const doDau = async (tuyChon) => {
			await p.setViewport({ width: 1440, height: 900 });
			await p.setContent(trangGia(nganDauGia(tuyChon)));
			return p.evaluate(
				doDauCot,
				'[data-slot="sheet-content"]',
				[g.cot.tieuDe, g.cot.tieuDeKr],
				g.cot.dong,
			);
		};
		const soLanhTruoc = sai;
		const lanh = await doDau({});
		kiemDauCot(lanh, "doi-chung", 1440);
		const doiChungSai = sai - soLanhTruoc;
		kiemDauCot(await doDau({ thut: KTO.gia.dauLechPx }), "gia-thut", 1440);
		kiemDauCot(await doDau({ coTieu: 12 }), "gia-co-chu", 1440);
		const coThut = dong.some(
			(d) =>
				d.startsWith("SAI") &&
				d.includes(`${KTO.thongDiep.dauLechTrai}: ${KTO.gia.dauLechPx}`),
		);
		const coCo = dong.some(
			(d) => d.startsWith("SAI") && d.includes(KTO.thongDiep.dauKhacCo),
		);
		dong.push(
			`KIEM DO DO dau-cot: doi chung ${doiChungSai === 0 ? "xanh" : `DO (${doiChungSai} SAI)`} · «${KTO.thongDiep.dauLechTrai}: ${KTO.gia.dauLechPx}» ${coThut ? "co" : "KHONG CO"} · «${KTO.thongDiep.dauKhacCo}» ${coCo ? "co" : "KHONG CO"}`,
		);
		await ket(coThut && coCo && doiChungSai === 0 ? 1 : 3);
	}
	const loai = ["tran", "chan"].includes(
		process.argv[process.argv.indexOf("--kiem-do-do") + 1],
	)
		? process.argv[process.argv.indexOf("--kiem-do-do") + 1]
		: "be-ngang";
	trinhDuyet = await puppeteer.launch({
		executablePath: KTO.chrome,
		headless: true,
	});
	const p = await trinhDuyet.newPage();
	const G = KTO.gia;
	const { rong, hep } = KTO.kho;
	let can;
	let doiChungSai = 0;
	if (loai === "be-ngang") {
		const deal = await doGia(p, rong, nganGia({ rong: G.rongPx }));
		kiemE3(deal, null, "deal-gia");
		kiemE3(
			await doGia(p, rong, nganGia({ rong: G.rongPx })),
			deal,
			"doi-chung",
		);
		doiChungSai = sai;
		kiemE3(
			await doGia(p, rong, nganGia({ rong: G.rongPx - G.lechPx })),
			deal,
			"gia",
		);
		can = `${KTO.thongDiep.lechBeNgang}: ${G.lechPx}`;
	} else if (loai === "tran") {
		const deal = await doGia(p, hep, nganGia({ rong: G.hepPx }));
		kiemE3(deal, null, "deal-gia");
		kiemE3(await doGia(p, hep, nganGia({ rong: G.hepPx })), deal, "doi-chung");
		doiChungSai = sai;
		kiemE3(
			await doGia(
				p,
				hep,
				nganGia({
					rong: G.hepPx,
					conThan: `<div style="width:${G.tranPx}px;height:10px"></div>`,
				}),
			),
			deal,
			"gia",
		);
		can = `${KTO.thongDiep.tranNgang}: gia`;
	} else {
		kiemE5(
			await doGia(p, rong, nganGia({ rong: G.rongPx })),
			"doi-chung",
			true,
		);
		kiemE5(await doGia(p, hep, nganGia({ rong: G.hepPx })), "doi-chung", true);
		doiChungSai = sai;
		kiemE5(
			await doGia(p, rong, nganGia({ rong: G.rongPx, chinhTruoc: true })),
			"gia",
			true,
		);
		can = KTO.thongDiep.huyKhongBenTrai;
	}
	const thay = dong.some((d) => d.startsWith("SAI") && d.includes(can));
	dong.push(
		`KIEM DO DO ${loai}: doi chung ${doiChungSai === 0 ? "xanh" : `DO (${doiChungSai} SAI)`} · thong diep ghim «${can}» ${thay ? "co" : "KHONG CO"}`,
	);
	await ket(thay && doiChungSai === 0 ? 1 : 3);
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
	p.setDefaultNavigationTimeout(KTO.cho.manMs);
	return { ctx, p };
}

function duongDonVi(them = "") {
	return `${APP}/${slug}/okr/theo-don-vi?kyOkr=${idMau("chu-ky", KTO.chuKy)}&donOkr=pb:${idMau("pb", KTO.phong)}${them}`;
}

function nganCan() {
	return [
		{
			ten: "deal",
			laTao: true,
			url: () => `${APP}/${slug}/deals?new=true`,
			chon: '[data-slot="sheet-content"]',
		},
		{
			ten: "tao-muc-tieu",
			laTao: true,
			url: () => duongDonVi("&new=true"),
			chon: '[data-hop-thoai-muc-tieu="moi"]',
		},
		{
			ten: "sua-muc-tieu",
			laTao: false,
			url: () => duongDonVi(`&record=objective:${MT}&hopOkr=muc-tieu`),
			chon: `[data-hop-thoai-muc-tieu="${MT}"]`,
		},
		{
			ten: "them-kr",
			laTao: true,
			url: () => duongDonVi(`&record=objective:${MT}&hopOkr=kr-moi`),
			chon: '[data-hop-thoai-kr="moi"]',
		},
		{
			ten: "sua-kr",
			laTao: false,
			url: () => duongDonVi(`&record=objective:${MT}&hopOkr=kr:${KR}`),
			chon: `[data-hop-thoai-kr="${KR}"]`,
		},
	];
}

async function moVaDo(cookie, kho, ngan) {
	const t = await trang(cookie, kho);
	try {
		await t.p.goto(ngan.url(), { waitUntil: "load" });
		await choNgan(t.p, ngan.chon);
		return { t, so: await t.p.evaluate(doNgan, ngan.chon) };
	} catch (loi) {
		await t.ctx.close().catch(() => {});
		kiem(
			`E3 ${kho.rong} ${ngan.ten}: mo duoc ngan (${`${loi?.message ?? loi}`.split("\n")[0]})`,
			false,
		);
		return null;
	}
}

async function buocNamNgan(tl) {
	for (const kho of [KTO.kho.rong, KTO.kho.hep]) {
		let deal = null;
		for (const ngan of nganCan()) {
			const kq = await moVaDo(tl, kho, ngan);
			if (!kq) continue;
			try {
				if (ngan.ten === "deal") deal = kq.so;
				dong.push(
					`GHI ${kho.rong} ${ngan.ten}: ngan ${tron(kq.so.ngan.left)},${tron(kq.so.ngan.top)} ${tron(kq.so.ngan.width)}x${tron(kq.so.ngan.height)} · data-size ${kq.so.size} · tieu de top ${tron(kq.so.tieuDe?.top)} · chan ${tron(kq.so.chan?.top)}-${tron(kq.so.chan?.bottom)} · «${KTO.huy}» ${tron(kq.so.huy?.left)}-${tron(kq.so.huy?.right)}/${tron(kq.so.huy?.top)} · chinh «${kq.so.chinh?.chu}» ${tron(kq.so.chinh?.left)}-${tron(kq.so.chinh?.right)}/${tron(kq.so.chinh?.top)}`,
				);
				if (ngan.ten !== "deal" && !deal)
					kiem(`E3 ${kho.rong} ${ngan.ten}: co ngan deal de so`, false);
				kiemE3(kq.so, deal, ngan.ten);
				await chup(kq.t.p, `E3-${kho.rong}-${ngan.ten}`);
				kiemE5(kq.so, ngan.ten, ngan.laTao);
				await chup(kq.t.p, `E5-${kho.rong}-${ngan.ten}`);
			} finally {
				await kq.t.ctx.close();
			}
		}
	}
}

async function buocMoChuKy(qt) {
	const ngan = {
		ten: "mo-chu-ky",
		url: () => `${APP}/${slug}/settings/okr?moChuKy=true`,
		chon: "[data-sheet-mo-chu-ky]",
	};
	for (const kho of [KTO.kho.rong, KTO.kho.hep]) {
		const kq = await moVaDo(qt, kho, ngan);
		if (!kq) continue;
		try {
			kiemE5(kq.so, ngan.ten, false);
			await chup(kq.t.p, `E5-${kho.rong}-${ngan.ten}`);
		} finally {
			await kq.t.ctx.close();
		}
	}
}

async function moCot(p, chon, nhan) {
	const co = await p.$(`${chon} [data-cot-gop-y]`);
	if (co) {
		dong.push(`GHI ${nhan}: cot da mo san khi vao`);
	} else {
		const nut = await p
			.waitForSelector(`${chon} [data-nut-gop-y]`, {
				visible: true,
				timeout: KTO.cho.nganMs,
			})
			.catch(() => null);
		const loai = nut
			? await nut.evaluate((o) => o.getAttribute("data-nut-gop-y"))
			: null;
		if (loai !== "nho" && loai !== "cho") return loai ?? "khong-hien";
		await p.click(`${chon} [data-nut-gop-y="${loai}"] button`);
		dong.push(`GHI ${nhan}: bam nut gop y (${loai})`);
	}
	await p.waitForSelector(`${chon} [data-cot-gop-y]`, {
		visible: true,
		timeout: KTO.cho.nganMs,
	});
	await p.waitForFunction(
		(chon) =>
			document.querySelector(chon)?.getAttribute("data-size") === "assist",
		{ timeout: KTO.cho.nganMs },
		chon,
	);
	await choNgan(p, chon);
	return null;
}

async function buocRong(tl) {
	const [, , suaMt, , suaKr] = nganCan();
	for (const kho of [KTO.kho.rong, KTO.kho.moc, KTO.kho.duoiMoc, KTO.kho.hep]) {
		for (const [ngan, tenAnh] of [
			[suaMt, "cot-muc-tieu"],
			[suaKr, "cot-kr"],
		]) {
			const kq = await moVaDo(tl, kho, ngan);
			if (!kq) continue;
			try {
				const nhan = `E3 rong ${kho.rong} ${ngan.ten}`;
				const loi = await moCot(kq.t.p, ngan.chon, nhan);
				if (loi !== null) {
					const s = await trpc(API, tl)
						.hoi("okr.troLySanSang", {
							objectiveId: MT,
							keyResultId: ngan.ten === "sua-kr" ? KR : undefined,
						})
						.catch((e) => ({ loi: e.message }));
					return { nut: loi, sanSang: s };
				}
				const so = await kq.t.p.evaluate(doNgan, ngan.chon);
				kiemRong(so, ngan.ten);
				await kq.t.p.evaluate((chon) => {
					document
						.querySelector(`${chon} [data-cot-gop-y]`)
						?.scrollIntoView({ block: "start" });
				}, ngan.chon);
				await chup(kq.t.p, `E3-${kho.rong}-${tenAnh}`);
			} finally {
				await kq.t.ctx.close();
			}
		}
	}
	return null;
}

async function doVaKiemDau(p, ngan, nhan, rong, tenAnh) {
	await p.evaluate((chon) => {
		document
			.querySelector(`${chon} [data-cot-gop-y]`)
			?.scrollIntoView({ block: "start" });
	}, ngan.chon);
	const so = await p.evaluate(
		doDauCot,
		ngan.chon,
		[g.cot.tieuDe, g.cot.tieuDeKr],
		g.cot.dong,
	);
	dong.push(`GHI E24 ${nhan}: ${JSON.stringify(so)}`);
	kiemDauCot(so, nhan, rong);
	await chup(p, tenAnh);
	return so;
}

async function buocDauCot(tl) {
	const [, , suaMt, , suaKr] = nganCan();
	let soLanCoThe = 0;
	for (const kho of [KTO.kho.rong, KTO.kho.hep]) {
		for (const ngan of [suaMt, suaKr]) {
			const kq = await moVaDo(tl, kho, ngan);
			if (!kq) continue;
			try {
				const loi = await moCot(
					kq.t.p,
					ngan.chon,
					`E24 ${kho.rong} ${ngan.ten}`,
				);
				if (loi !== null) {
					kiem(
						`E24 ${kho.rong} ${ngan.ten}: mo duoc cot gop y (${loi})`,
						false,
					);
					continue;
				}
				await doVaKiemDau(
					kq.t.p,
					ngan,
					`${kho.rong} ${ngan.ten} dang-soan`,
					kho.rong,
					`E24-${kho.rong}-${ngan.ten}-dang-soan`,
				);
				const coThe = await kq.t.p
					.waitForSelector(
						`${ngan.chon} [data-cot-gop-y] [data-slot="proposed-change"]`,
						{
							visible: true,
							timeout: KTO.cho.theMs,
						},
					)
					.then(() => true)
					.catch(() => false);
				dong.push(
					`GHI E24 ${kho.rong} ${ngan.ten}: ${coThe ? "cot co the gop y" : "cot khong co the (model khong goi y) — do trang thai cuoi"}`,
				);
				if (coThe) soLanCoThe += 1;
				else
					await doVaKiemDau(
						kq.t.p,
						ngan,
						`${kho.rong} ${ngan.ten} trang-thai-cuoi`,
						kho.rong,
						`E24-${kho.rong}-${ngan.ten}-cuoi`,
					);
				if (coThe)
					await doVaKiemDau(
						kq.t.p,
						ngan,
						`${kho.rong} ${ngan.ten} co-the`,
						kho.rong,
						`E24-${kho.rong}-${ngan.ten}-co-the`,
					);
			} finally {
				await kq.t.ctx.close();
			}
		}
	}
	kiem(
		`E24: do duoc trang thai co the o it nhat mot ngan (${soLanCoThe} lan)`,
		soLanCoThe > 0,
	);
}

mkdirSync(ANH, { recursive: true });

if (process.argv.includes("--kiem-do-do")) await kiemDoDo();

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

MT = idMau("mt", KTO.mucTieu);
let tl;
let qt;
try {
	const nap = napBoMau();
	if (nap.ma !== 0)
		throw new Error(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	dong.push(`NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
	qt = phienCookie(thuMau(KTO.quanTri));
	tl = phienCookie(thuMau(KTO.truong));
	slug = await suySlug(qt);
	if (!slug)
		throw new Error(`${APP}/ khong chuyen toi trang chinh cua workspace`);
	await trpc(API, qt).lam("okr.setProgram", {
		aiOn: true,
		aiDeXuatPhamVi: "danh-sach",
		aiDeXuatDonVi: [idMau("pb", KTO.phong)],
	});
	const mt = await trpc(API, tl).hoi("okr.objective", { id: MT });
	KR = mt.canEditKr[0] ?? null;
	if (!KR) throw new Error(`${KTO.truong} khong sua duoc KR nao cua ${MT}`);
	dong.push(
		`GHI workspace ${slug} · muc tieu ${MT} (${mt.keyResults.length} KR) · KR sua ${KR}`,
	);
} catch (loi) {
	await khongDo(`chuan bi: ${loi?.message ?? loi}`);
}

const sanSang = await trpc(API, tl)
	.hoi("okr.troLySanSang", { objectiveId: MT })
	.catch((e) => ({ bat: false, lyDo: e.message }));
dong.push(`GHI okr.troLySanSang ${MT}: ${JSON.stringify(sanSang)}`);
if (CHI_DAU_COT && !trongPhienCoTacTu()) {
	if (!coKhoaMoHinh())
		await khongDo(`${cauThieuKhoa()} — E24 can the gop y that tu tac tu`);
	for (const d of dong) console.log(d);
	console.log("-- E24 can tac tu — mo phien do rieng co tac tu");
	process.exit(await chayTrongPhienCoTacTu(KTO.lenhDauCot));
}
if (sanSang?.lyDo === "chua-noi-tac-tu" && !trongPhienCoTacTu()) {
	if (!coKhoaMoHinh())
		await khongDo(
			`${cauThieuKhoa()} — API khong noi tac tu, cot gop y khong mo duoc`,
		);
	for (const d of dong) console.log(d);
	console.log("-- API khong noi tac tu — mo phien do rieng co tac tu");
	process.exit(await chayTrongPhienCoTacTu(KTO.lenh));
}

trinhDuyet = await puppeteer.launch({
	executablePath: KTO.chrome,
	headless: true,
});
if (CHI_DAU_COT) {
	try {
		tacTu = await batTacTu({
			cong: Number(process.env[PHIEN_TRO_LY.bienCongTacTu]),
			thuMuc: join(GOC, ".acceptance-runs/khung-tao-okr-nhu-deal"),
		});
		await buocDauCot(tl);
	} catch (loi) {
		await khongDo(`${loi?.message ?? loi}`);
	}
	await ket(sai === 0 ? 0 : 1);
}
try {
	await buocNamNgan(tl);
	await buocMoChuKy(qt);
	const hong = await buocRong(tl);
	if (hong)
		await khongDo(
			`nut «Nhờ Trợ lý OKR góp ý» khong hien (${hong.nut}) — okr.troLySanSang: ${JSON.stringify(hong.sanSang)}`,
		);
} catch (loi) {
	await khongDo(`${loi?.message ?? loi}`);
}

await ket(sai === 0 ? 0 : 1);
