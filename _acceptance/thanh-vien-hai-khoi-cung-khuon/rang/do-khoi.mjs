import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { thanhVienMessages } from "../../../apps/app/lib/messages/settings-thanh-vien.ts";
import { ALLOWANCE_WITHOUT_EXPIRY } from "../../../packages/auth/src/allow-list.ts";
import { db } from "../../../packages/db/src/index.ts";
import { WORKSPACE_ID } from "../../../packages/db/src/workspace.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA = process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", "thanh-vien-hai-khoi-cung-khuon", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const QUAN_TRI = process.env.QUAN_TRI ?? "ada@trycomp.ai";
const KHONG_QUYEN = process.env.KHONG_QUYEN ?? "marcus@trycomp.ai";
const SO_LOI_CHO_PHEP = 15;
const TIEN_TO = "tvhk-lan-do-";
const MIEN = "lan-do.onehub.vn";
const BO_KHO = process.env.TVHK_BO_KHO ?? "";
const KHO = [
	{ ten: "1440", rong: 1440, cao: 900 },
	{ ten: "768", rong: 768, cao: 1024 },
	{ ten: "375", rong: 375, cao: 812 },
];
const CHO_MS = 60_000;
const CHO_THAO_TAC_MS = 15_000;
const LECH_PX = 1;
const SO_NAC_CON_LAN = 20;
const NAC_NGANG_PX = 200;
const CHO_CON_LAN_MS = 80;
const SO_NHIP_DUNG_YEN = 3;
const PHA_SAU_GIEO = process.env.TVHK_PHA_SAU_GIEO === "1";
const LOI_DA_CO = "That address is already on the list.";
const t = thanhVienMessages("vi");

const MA_TRAN = [
	...KHO.flatMap((k) => ["vo", "mep-tieu-de", "mep-du-lieu", "tran-ngang"].map((m) => `${k.ten}-${m}`)),
	"nut-vi-tri", "hop-mo", "hang-moi", "db-moi", "dem-tang",
	"loi-hop-mo", "loi-thong-diep", "loi-db", "loi-dem",
	"tieu-de-tren", "tieu-de-duoi", "section-ten", "loc-giu-n",
	"khong-rut-san", "phat-moi-hang", "menu-moi-hang", "menu-rut", "hop-rut", "hang-mat", "dem-giam", "db-rut",
	"mau-vai", "mau-nguoi", "can-phai", "co-chu",
	"mot-o-tim",
	"kq-tieu-de", "kq-khong-nut", "kq-khong-khoi",
	"cuon-ngang-vo", "con-lan-ngang",
	"don-truoc", "don-tien-to", "don-giu-nguyen",
];

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
const email = (duoi) => `${TIEN_TO}${duoi}@${MIEN}`;
const EMAIL_00 = email("00");
const EMAIL_01 = email("01");
const EMAIL_MOI = email(`moi-${process.pid}`);
const ID_LUOT = `${TIEN_TO}${process.pid}-`;
const PHAM_VI_TIEN_TO = { OR: [{ id: { startsWith: TIEN_TO } }, { email: { startsWith: TIEN_TO } }] };

function kiem(ma, nhan, dat) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ${ma} khong co trong MA_TRAN`);
	daPhat.add(ma);
	if (dat) dong.push(`DUNG ${nhan}`);
	else {
		sai += 1;
		dong.push(`SAI ${nhan}`);
	}
}

class KhongDo extends Error {}

function khongDo(cau) {
	throw new KhongDo(cau);
}

const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

function phien(dc) {
	const ra = execFileSync("bun", ["run", "dev:session", dc], { cwd: join(GOC, "apps/api"), encoding: "utf8" });
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) khongDo(`khong doc duoc cookie phien cua ${dc}`);
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, { redirect: "manual", headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` } });
	const dich = res.headers.get("location");
	if (!dich) khongDo(`${APP}/ tra ${res.status} khong co Location`);
	const dau = new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
	if (!dau || dau.startsWith("onboarding") || dau === "sign-in") khongDo(`${APP}/ chuyen toi ${dich} — tien de onboarding hoac phien hong`);
	return dau;
}

async function donTruoc() {
	const cu = await db.invitation.deleteMany({ where: PHAM_VI_TIEN_TO });
	kiem("don-truoc", `don-truoc: xoa ${cu.count} tan du tien to ${TIEN_TO}`, true);
}

async function chupTap() {
	return (await db.invitation.findMany({ select: { id: true, status: true } }))
		.map((r) => `${r.id}:${r.status}`)
		.sort();
}

async function gieo(nguoiMoiId) {
	const data = Array.from({ length: SO_LOI_CHO_PHEP }, (_, i) => ({
		id: `${ID_LUOT}${String(i).padStart(2, "0")}`,
		organizationId: WORKSPACE_ID,
		email: email(String(i).padStart(2, "0")),
		role: "member",
		status: "pending",
		expiresAt: ALLOWANCE_WITHOUT_EXPIRY,
		inviterId: nguoiMoiId,
	}));
	await db.invitation.createMany({ data });
	const lai = await db.invitation.count({ where: { id: { startsWith: ID_LUOT } } });
	if (lai !== SO_LOI_CHO_PHEP) khongDo(`gieo ${SO_LOI_CHO_PHEP} loi cho phep, doc lai ${lai}`);
}

async function don(truoc) {
	await db.invitation.deleteMany({ where: PHAM_VI_TIEN_TO });
	const con = await db.invitation.count({ where: PHAM_VI_TIEN_TO });
	const sau = await chupTap();
	kiem("don-tien-to", `don: con ${con} loi cho phep tien to ${TIEN_TO} (theo id va email)`, con === 0);
	kiem(
		"don-giu-nguyen",
		`don: loi cho phep co san truoc luot giu nguyen (${truoc.length} truoc, ${sau.length} sau, trang thai trung ${JSON.stringify(sau) === JSON.stringify(truoc)})`,
		JSON.stringify(sau) === JSON.stringify(truoc),
	);
}

const demCho = (dc) =>
	db.invitation.count({ where: { organizationId: WORKSPACE_ID, email: dc, status: "pending" } });

async function moTrang(ctx, kho, duong) {
	const p = await ctx.newPage();
	await p.setViewport({ width: kho.rong, height: kho.cao, deviceScaleFactor: 1 });
	await p.goto(`${APP}${duong}`, { waitUntil: "load", timeout: CHO_MS });
	const cuoi = new URL(p.url()).pathname;
	if (cuoi !== duong.split("?")[0]) khongDo(`${kho.ten}: trang cuoi la ${cuoi}, khong phai ${duong}`);
	return p;
}

function trongTrang(tieuDeDuoi) {
	const noiDung = document.querySelector("[data-slot=page-shell-content]");
	const muc = [...document.querySelectorAll("section")];
	const duoi =
		muc.find((s) => s.querySelector("[data-slot=card-title]")?.textContent?.startsWith(tieuDeDuoi)) ??
		muc.find((s) => s.textContent?.includes(tieuDeDuoi)) ??
		null;
	const voTren = noiDung?.querySelector("[data-slot=table-container]") ?? null;
	const voDuoi = duoi ? (duoi.querySelector("[data-slot=table-container]") ?? duoi.querySelector("table")) : null;
	return { noiDung, duoi, voTren, voDuoi };
}

async function choDu(p, soThanhVien, emailMoc) {
	await p
		.waitForFunction(
			(n, e, tieuDe) => {
				const noiDung = document.querySelector("[data-slot=page-shell-content]");
				const bang = noiDung?.querySelector("[data-slot=table-container]");
				const hang = bang ? bang.querySelectorAll("tbody tr").length : 0;
				const duoi = [...document.querySelectorAll("section")].find((s) => s.textContent?.includes(tieuDe));
				return document.querySelector("[hidden] [data-slot=table-container], [hidden] section") === null && (bang?.getBoundingClientRect().height ?? 0) > 0 && hang >= n && duoi?.textContent?.includes(e);
			},
			{ timeout: CHO_MS },
			soThanhVien,
			emailMoc,
			t.duocPhepVao.tieuDe,
		)
		.catch(() => khongDo(`het ${CHO_MS}ms cho du ${soThanhVien} hang thanh vien va ${emailMoc}`));
	await p.evaluate(() => document.fonts.ready);
}

async function doKho(p, kho) {
	const d = await p.evaluate(
		(tieuDeDuoi, trongTrangSrc) => {
			const trong = new Function(`return (${trongTrangSrc})`)();
			const { voTren, voDuoi } = trong(tieuDeDuoi);
			const kieu = (el) => (el ? getComputedStyle(el) : null);
			const vo = (el) => {
				if (!el) return null;
				const bang = el.tagName === "TABLE" ? el : el.querySelector("table");
				const s = kieu(el);
				return {
					vien: Number.parseFloat(s.borderTopWidth),
					goc: s.borderTopLeftRadius,
					nen: kieu(bang?.querySelector("thead"))?.backgroundColor ?? "khong co thead",
					co: kieu(bang?.querySelector("tbody td"))?.fontSize ?? "khong co td",
					cuonNgang: el.scrollLeft,
				};
			};
			const mep = (el, chon) => {
				const o = el?.querySelector(chon);
				if (!o) return null;
				const s = getComputedStyle(o);
				return o.getBoundingClientRect().left + Number.parseFloat(s.paddingLeft) + Number.parseFloat(s.borderLeftWidth);
			};
			const cuon = document.querySelector("[data-slot=page-shell-scroll]");
			return {
				tren: vo(voTren),
				duoi: vo(voDuoi),
				mepTieuDe: [mep(voTren, "thead th"), mep(voDuoi, "thead th")],
				mepDuLieu: [mep(voTren, "tbody tr td"), mep(voDuoi, "tbody tr td")],
				mepTrenLai: mep(voTren, "thead th"),
				tranNgang: Math.max(
					document.documentElement.scrollWidth - document.documentElement.clientWidth,
					cuon.scrollWidth - cuon.clientWidth,
				),
			};
		},
		t.duocPhepVao.tieuDe,
		trongTrang.toString(),
	);
	const { tren, duoi } = d;
	const moTa = (a, b) => `${a ?? "(khong co)"}/${b ?? "(khong co)"}`;
	const voDat =
		tren !== null &&
		duoi !== null &&
		tren.vien >= 1 &&
		tren.vien === duoi.vien &&
		tren.goc === duoi.goc &&
		tren.nen === duoi.nen &&
		tren.nen !== "rgba(0, 0, 0, 0)" &&
		tren.co === duoi.co;
	kiem(
		`${kho.ten}-vo`,
		`${kho.ten}: vo hai bang — vien tren ${moTa(tren?.vien, duoi?.vien)} px, goc ${moTa(tren?.goc, duoi?.goc)}, nen tieu de ${moTa(tren?.nen, duoi?.nen)}, co chu ${moTa(tren?.co, duoi?.co)}`,
		voDat,
	);
	if (duoi && duoi.cuonNgang !== 0) dong.push(`GHI CHU ${kho.ten}: vo bang duoi dang cuon ngang ${duoi.cuonNgang}px luc do mep`);
	for (const [ma, cap, ten] of [
		["mep-tieu-de", d.mepTieuDe, "o tieu de cot dau"],
		["mep-du-lieu", d.mepDuLieu, "o du lieu cot dau"],
	]) {
		const lech = cap[0] === null || cap[1] === null ? null : Math.abs(cap[0] - cap[1]);
		kiem(`${kho.ten}-${ma}`, `${kho.ten}: mep trai noi dung ${ten} lech ${lech === null ? "(thieu o)" : `${lech.toFixed(1)}px`}`, lech !== null && lech <= LECH_PX);
	}
	dong.push(`GHI CHU ${kho.ten}: doi chung mep tren do hai lan ${d.mepTieuDe[0]} / ${d.mepTrenLai}`);
	kiem(`${kho.ten}-tran-ngang`, `${kho.ten}: tran ngang ${d.tranNgang}px (document va main)`, d.tranNgang <= 0);
}

async function chup(p, kho) {
	mkdirSync(RA, { recursive: true });
	await p.screenshot({ path: join(RA, `tvhk-${kho.ten}-dau.png`) });
	await p.evaluate((tieuDe) => {
		const cuon = document.querySelector("[data-slot=page-shell-scroll]");
		const duoi = [...document.querySelectorAll("section")].find((s) => s.textContent?.includes(tieuDe));
		if (!duoi) return;
		const kc = cuon.getBoundingClientRect();
		cuon.scrollTop += duoi.getBoundingClientRect().top - (kc.top + kc.height / 2);
	}, t.duocPhepVao.tieuDe);
	await p.screenshot({ path: join(RA, `tvhk-${kho.ten}-noi.png`) });
	await p.evaluate(() => {
		document.querySelector("[data-slot=page-shell-scroll]").scrollTop = 0;
	});
}

async function doCuonNgang(p) {
	await p.evaluate(
		(tieuDeDuoi, src) => new Function(`return (${src})`)()(tieuDeDuoi).voDuoi?.scrollIntoView({ block: "start" }),
		t.duocPhepVao.tieuDe,
		trongTrang.toString(),
	);
	await ngu(CHO_CON_LAN_MS * 4);
	const vo = await p.evaluate(
		(tieuDeDuoi, src) => {
			const { voDuoi } = new Function(`return (${src})`)()(tieuDeDuoi);
			if (!voDuoi) return null;
			const r = voDuoi.getBoundingClientRect();
			const x = r.left + r.width / 2;
			const y = Math.max(r.top, 0) + Math.min(r.height / 2, 60);
			const o = document.elementFromPoint(x, y);
			return { x, y, rong: voDuoi.scrollWidth, khung: voDuoi.clientWidth, trung: o !== null && voDuoi.contains(o), tai: o ? `${o.tagName}[${o.getAttribute("data-slot") ?? ""}]` : "null" };
		},
		t.duocPhepVao.tieuDe,
		trongTrang.toString(),
	);
	if (vo) dong.push(`GHI CHU 375: con tro con lan tai (${Math.round(vo.x)}, ${Math.round(vo.y)}) tren ${vo.tai}, trong vo ${vo.trung}`);
	kiem("cuon-ngang-vo", `375: vo bang duoi cuon ngang duoc (scrollWidth ${vo?.rong} > clientWidth ${vo?.khung})`, vo !== null && vo.rong > vo.khung);
	if (vo === null) {
		kiem("con-lan-ngang", "375: con lan ngang — khong co vo bang duoi", false);
		return;
	}
	await p.mouse.move(vo.x, vo.y);
	let truoc = -1;
	let dungYen = 0;
	for (let i = 0; i < SO_NAC_CON_LAN && dungYen < SO_NHIP_DUNG_YEN; i++) {
		await p.mouse.wheel({ deltaX: NAC_NGANG_PX });
		await ngu(CHO_CON_LAN_MS);
		const nay = await p.evaluate(
			(tieuDeDuoi, src) => new Function(`return (${src})`)()(tieuDeDuoi).voDuoi.scrollLeft,
			t.duocPhepVao.tieuDe,
			trongTrang.toString(),
		);
		dungYen = nay === truoc ? dungYen + 1 : 0;
		truoc = nay;
	}
	const ket = await p.evaluate(
		(tieuDeDuoi, src, nhan) => {
			const { voDuoi } = new Function(`return (${src})`)()(tieuDeDuoi);
			const nut = voDuoi.querySelector(`button[aria-label="${nhan}"]`);
			if (!nut) return { cuon: voDuoi.scrollLeft, tron: false, co: false };
			const v = voDuoi.getBoundingClientRect();
			const n = nut.getBoundingClientRect();
			return { cuon: voDuoi.scrollLeft, tron: n.left >= v.left - 2 && n.right <= v.right + 2, co: true };
		},
		t.duocPhepVao.tieuDe,
		trongTrang.toString(),
		t.duocPhepVao.menu(EMAIL_00),
	);
	kiem(
		"con-lan-ngang",
		`375: con lan ngang dua vo toi scrollLeft ${ket.cuon} va nut «…» cua ${EMAIL_00} ${ket.co ? "" : "(khong co nut) "}nam tron trong vo (${ket.tron})`,
		ket.cuon > 0 && ket.tron,
	);
	await p.screenshot({ path: join(RA, "tvhk-375-cuon-ngang.png") });
}

async function tieuDeDuoi(p) {
	return p.evaluate(
		(tieuDe, src) => {
			const { duoi } = new Function(`return (${src})`)()(tieuDe);
			return duoi?.querySelector("[data-slot=card-title]")?.textContent?.trim() ?? "(khong co)";
		},
		t.duocPhepVao.tieuDe,
		trongTrang.toString(),
	);
}

async function choDieu(p, ham, ...doi) {
	return p
		.waitForFunction(ham, { timeout: CHO_THAO_TAC_MS }, ...doi)
		.then(() => true)
		.catch(() => false);
}

async function bamTheoChu(p, chon, chu) {
	const nut = await p.evaluateHandle(
		(c, ch) => [...document.querySelectorAll(c)].find((b) => b.textContent?.trim() === ch) ?? null,
		chon,
		chu,
	);
	const co = await nut.evaluate((b) => b !== null);
	if (co) await nut.click();
	return co;
}

async function goDiaChi(p, dc) {
	const o = await p.$("[role=dialog] input[name=email]");
	if (!o) return false;
	await o.focus();
	await o.evaluate((el) => el.select());
	await p.keyboard.press("Backspace");
	await o.type(dc);
	const gia = await o.evaluate((el) => el.value);
	if (gia !== dc) {
		dong.push(`GHI CHU o email chua ${JSON.stringify(gia)}, khong phai ${dc}`);
		return false;
	}
	return bamTheoChu(p, "[role=dialog] button", t.hopThoaiChoPhep.gui);
}

async function doLuongChoPhep(p, M) {
	const vi = await p.evaluate((chu) => {
		const nut = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === chu);
		if (!nut) return null;
		const r = nut.getBoundingClientRect();
		const o = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
		return {
			trongDau: nut.closest("[data-slot=page-shell-actions]") !== null,
			day: Math.round(r.bottom),
			tron: r.top >= 0 && r.bottom <= window.innerHeight,
			tam: o !== null && nut.contains(o),
		};
	}, t.duocPhepVao.nutThem);
	kiem(
		"nut-vi-tri",
		`1440: nut «${t.duocPhepVao.nutThem}» ${vi ? `trong page-shell-actions (${vi.trongDau}), tron trong khung nhin (bottom ${vi.day} <= 900: ${vi.tron}), tam tra ve chinh nut (${vi.tam})` : "khong co tren trang"}`,
		vi !== null && vi.trongDau && vi.tron && vi.tam,
	);
	const moDuoc = vi !== null && (await bamTheoChu(p, "button", t.duocPhepVao.nutThem));
	const hopMo = moDuoc && (await choDieu(p, (tieu) => [...document.querySelectorAll("[role=dialog]")].some((d) => d.textContent?.includes(tieu)), t.hopThoaiChoPhep.tieuDe));
	kiem("hop-mo", `1440: hop «${t.hopThoaiChoPhep.tieuDe}» mo (${hopMo})`, hopMo);

	const guiLoi = hopMo && (await goDiaChi(p, EMAIL_01));
	const coLoi = guiLoi && (await choDieu(p, (loi) => document.querySelector("[role=dialog]")?.textContent?.includes(loi) === true, LOI_DA_CO));
	await ngu(300);
	const conMo = hopMo && (await p.evaluate(() => document.querySelector("[role=dialog]") !== null));
	kiem("loi-hop-mo", `1440 loi: hop van mo sau khi API tu choi (${conMo})`, guiLoi && conMo);
	kiem("loi-thong-diep", `1440 loi: hop chua thong diep «${LOI_DA_CO}» (${coLoi})`, coLoi);
	const soLoi = await demCho(EMAIL_01);
	kiem("loi-db", `1440 loi: DB van ${soLoi} loi cho phep dang cho cho ${EMAIL_01}`, soLoi === 1);
	const tdLoi = await tieuDeDuoi(p);
	kiem("loi-dem", `1440 loi: tieu de van «${tdLoi}» (mong «${t.dem(t.duocPhepVao.tieuDe, M)}»)`, tdLoi === t.dem(t.duocPhepVao.tieuDe, M));

	const guiMoi = conMo && (await goDiaChi(p, EMAIL_MOI));
	const hienHang =
		guiMoi &&
		(await choDieu(
			p,
			(e, tieuDe) =>
				document.querySelector("[role=dialog]") === null &&
				[...document.querySelectorAll("section")].some((s) => s.textContent?.includes(tieuDe) && s.textContent?.includes(e)),
			EMAIL_MOI,
			t.duocPhepVao.tieuDe,
		));
	if (!hienHang) {
		const hop = await p.evaluate(() => document.querySelector("[role=dialog]")?.textContent?.slice(0, 300) ?? "(hop da dong)");
		dong.push(`GHI CHU 1440: sau khi gui ${EMAIL_MOI}, hop: ${hop}`);
	}
	kiem("hang-moi", `1440: hop dong va hang cua ${EMAIL_MOI} hien trong khoi duoi (${hienHang})`, hienHang);
	const soMoi = await demCho(EMAIL_MOI);
	kiem("db-moi", `1440: DB co ${soMoi} loi cho phep dang cho cho dia chi moi`, soMoi === 1);
	const tdMoi = await tieuDeDuoi(p);
	kiem("dem-tang", `1440: tieu de khoi duoi «${tdMoi}» (mong «${t.dem(t.duocPhepVao.tieuDe, M + 1)}»)`, tdMoi === t.dem(t.duocPhepVao.tieuDe, M + 1));
	return hienHang ? M + 1 : M;
}

async function doHangVaCot(p) {
	const d = await p.evaluate(
		(tieuDe, src, x) => {
			const { duoi, voTren } = new Function(`return (${src})`)()(tieuDe);
			if (!duoi) return null;
			const hienRo = (b) => {
				const r = b.getBoundingClientRect();
				return r.width > 0 && r.height > 0 && !b.closest("[role=menu]");
			};
			const nut = [...duoi.querySelectorAll("button")];
			const hang = [...duoi.querySelectorAll("tbody tr")];
			const cuaGieo = x.gieo.map((e) => hang.find((h) => h.textContent?.includes(e)) ?? null);
			const th = [...duoi.querySelectorAll("thead th")];
			const cot = (chu) => th.findIndex((o) => o.textContent?.trim() === chu);
			const hang00 = cuaGieo[0];
			const o = (i) => (hang00 && i >= 0 ? hang00.querySelectorAll("td")[i] : null);
			const mau = (el) => (el ? getComputedStyle(el).color : null);
			const canh = (el) => (el ? getComputedStyle(el).textAlign : null);
			const iVai = cot(x.vaiTro);
			const iNguoi = cot(x.nguoiChoPhep);
			const iLuc = cot(x.luc);
			return {
				rutSan: nut.filter((b) => b.textContent?.trim() === x.rut && hienRo(b)).length,
				phat: cuaGieo.filter((h) => h && [...h.querySelectorAll("button")].some((b) => b.textContent?.trim() === x.phat && hienRo(b))).length,
				menu: cuaGieo.filter((h, i) => h?.querySelector(`button[aria-label="${x.nhanMenu[i]}"]`)).length,
				mauVai: [mau(o(iVai)), mau(th[iVai])],
				mauNguoi: [mau(o(iNguoi)), mau(th[iNguoi])],
				canPhai: [canh(th[iLuc]), canh(o(iLuc))],
				coChu: [
					o(0) ? getComputedStyle(o(0)).fontSize : null,
					voTren?.querySelector("tbody td") ? getComputedStyle(voTren.querySelector("tbody td")).fontSize : null,
				],
			};
		},
		t.duocPhepVao.tieuDe,
		trongTrang.toString(),
		{
			gieo: Array.from({ length: SO_LOI_CHO_PHEP }, (_, i) => email(String(i).padStart(2, "0"))),
			nhanMenu: Array.from({ length: SO_LOI_CHO_PHEP }, (_, i) => t.duocPhepVao.menu(email(String(i).padStart(2, "0")))),
			rut: t.duocPhepVao.rut,
			phat: t.phatChia.nut,
			vaiTro: t.duocPhepVao.vaiTro,
			nguoiChoPhep: t.duocPhepVao.nguoiChoPhep,
			luc: t.duocPhepVao.luc,
		},
	);
	const n = SO_LOI_CHO_PHEP;
	kiem("khong-rut-san", `1440: ${d?.rutSan ?? "?"} nut chu «${t.duocPhepVao.rut}» hien san`, d !== null && d.rutSan === 0);
	kiem("phat-moi-hang", `1440: hang gieo co nut «${t.phatChia.nut}» hien san (${d?.phat ?? 0}/${n})`, d?.phat === n);
	kiem("menu-moi-hang", `1440: hang gieo co nut «…» ten «${t.duocPhepVao.menu("<dia chi>")}» (${d?.menu ?? 0}/${n})`, d?.menu === n);
	const bang = (cap) => cap && cap[0] !== null && cap[0] === cap[1];
	kiem("mau-vai", `1440: o «${t.duocPhepVao.vaiTro}» mau ${d?.mauVai?.[0]} bang mau tieu de cot ${d?.mauVai?.[1]}`, bang(d?.mauVai));
	kiem("mau-nguoi", `1440: o «${t.duocPhepVao.nguoiChoPhep}» mau ${d?.mauNguoi?.[0]} bang mau tieu de cot ${d?.mauNguoi?.[1]}`, bang(d?.mauNguoi));
	kiem("can-phai", `1440: cot «${t.duocPhepVao.luc}» can (tieu de ${d?.canPhai?.[0]}, du lieu ${d?.canPhai?.[1]})`, d?.canPhai?.[0] === "right" && d?.canPhai?.[1] === "right");
	kiem("co-chu", `1440: co chu o du lieu duoi ${d?.coChu?.[0]} bang tren ${d?.coChu?.[1]}`, bang(d?.coChu));
}

async function doLuongRut(p, M) {
	const nhan = t.duocPhepVao.menu(EMAIL_00);
	const nut = await p.$(`section button[aria-label="${nhan}"]`);
	let menuRut = false;
	let hopRut = false;
	let mat = false;
	if (nut) {
		await nut.evaluate((b) => b.scrollIntoView({ block: "center" }));
		await nut.click();
		menuRut = await choDieu(
			p,
			(chu) => [...document.querySelectorAll("[role=menuitem]")].some((m) => m.textContent?.trim() === chu && m.getAttribute("data-variant") === "destructive"),
			t.duocPhepVao.rut,
		);
		if (menuRut) await p.screenshot({ path: join(RA, "menu-rut-1440.png") });
		if (menuRut) await bamTheoChu(p, "[role=menuitem]", t.duocPhepVao.rut);
		hopRut = menuRut && (await choDieu(p, (tieu) => document.querySelector("[role=alertdialog]")?.textContent?.includes(tieu) === true, t.xacNhan.rut.tieuDe));
		if (hopRut) await bamTheoChu(p, "[role=alertdialog] button", t.xacNhan.rut.nut);
		mat =
			hopRut &&
			(await choDieu(
				p,
				(e, tieuDe) => ![...document.querySelectorAll("section")].some((s) => s.textContent?.includes(tieuDe) && s.textContent?.includes(e)),
				EMAIL_00,
				t.duocPhepVao.tieuDe,
			));
	}
	kiem("menu-rut", `1440: «…» cua ${EMAIL_00} ${nut ? "" : "(khong co nut) "}mo menu co muc «${t.duocPhepVao.rut}» data-variant=destructive (${menuRut})`, menuRut);
	kiem("hop-rut", `1440: hop «${t.xacNhan.rut.tieuDe}» mo (${hopRut})`, hopRut);
	kiem("hang-mat", `1440: hang ${EMAIL_00} bien mat sau khi xac nhan (${mat})`, mat);
	const td = await tieuDeDuoi(p);
	kiem("dem-giam", `1440: tieu de «${td}» (mong «${t.dem(t.duocPhepVao.tieuDe, M - 1)}»)`, mat && td === t.dem(t.duocPhepVao.tieuDe, M - 1));
	const ban = await db.invitation.findFirst({ where: { email: EMAIL_00 }, select: { status: true } });
	kiem("db-rut", `1440: DB — loi cho phep ${EMAIL_00} trang thai ${ban?.status ?? "(khong con)"}`, ban !== null && ban.status !== "pending");
}

async function doTieuDe(ctx, slug, p, N, M, tenLoc) {
	const d = await p.evaluate((tieuDe) => {
		const noiDung = document.querySelector("[data-slot=page-shell-content]");
		const tieu = [...noiDung.querySelectorAll("[data-slot=card-title]")].map((o) => o.textContent?.trim());
		const muc = [...noiDung.querySelectorAll("section[aria-labelledby]")];
		const coTen = muc.filter((s) => {
			const dich = document.getElementById(s.getAttribute("aria-labelledby"));
			return dich !== null && s.contains(dich) && dich.getAttribute("data-slot") === "card-title";
		}).length;
		const duoi = [...document.querySelectorAll("section")].find((s) => s.textContent?.includes(tieuDe));
		return {
			tren: tieu[0] ?? "(khong co)",
			duoi: duoi?.querySelector("[data-slot=card-title]")?.textContent?.trim() ?? "(khong co)",
			coTen,
		};
	}, t.duocPhepVao.tieuDe);
	const oTim = await p.evaluate(
		(ph) => document.querySelectorAll(`[data-slot=page-shell-content] input[placeholder="${ph}"]`).length,
		t.bang.tim,
	);
	kiem("tieu-de-tren", `1440: tieu de khoi tren «${d.tren}» (mong «${t.dem(t.bang.tieuDe, N)}»)`, d.tren === t.dem(t.bang.tieuDe, N));
	kiem("tieu-de-duoi", `1440: tieu de khoi duoi «${d.duoi}» (mong «${t.dem(t.duocPhepVao.tieuDe, M)}»)`, d.duoi === t.dem(t.duocPhepVao.tieuDe, M));
	kiem("section-ten", `1440: moi khoi la section aria-labelledby tro toi chinh card-title cua no (${d.coTen}/2)`, d.coTen === 2);
	kiem("mot-o-tim", `1440: ${oTim} o tim trong page-shell-content (mot DataTable)`, oTim === 1);

	const q = await moTrang(ctx, KHO[0], `/${slug}/settings/members?q=${encodeURIComponent(tenLoc)}`);
	const loc = await q
		.waitForFunction(
			(ten) => {
				const bang = document.querySelector("[data-slot=page-shell-content] [data-slot=table-container]");
				const hang = bang ? [...bang.querySelectorAll("tbody tr")] : [];
				if (!(document.querySelector("[hidden] [data-slot=table-container], [hidden] section") === null) || hang.length !== 1 || !hang[0].textContent?.includes(ten)) return null;
				return document.querySelector("[data-slot=page-shell-content] [data-slot=card-title]")?.textContent?.trim() ?? "(khong co)";
			},
			{ timeout: CHO_MS },
			tenLoc,
		)
		.then((h) => h.jsonValue())
		.catch(() => null);
	kiem(
		"loc-giu-n",
		`1440: loc «${tenLoc}» con 1 hang ${loc === null ? "(khong toi)" : ""}, tieu de «${loc}» (mong «${t.dem(t.bang.tieuDe, N)}»)`,
		loc === t.dem(t.bang.tieuDe, N),
	);
	await q.close();
}

async function doKhongQuyen(slug, N) {
	const cookie = phien(KHONG_QUYEN);
	const ctx = await trinhDuyet.createBrowserContext();
	const host = new URL(APP).hostname;
	await ctx.setCookie({ name: cookie.ten, value: cookie.gia, domain: host, path: "/" }, { name: "lang", value: "vi", domain: host, path: "/" });
	const p = await moTrang(ctx, KHO[0], `/${slug}/settings/members`);
	await p
		.waitForFunction(
			(n) => document.querySelector("[hidden] [data-slot=table-container], [hidden] section") === null && (document.querySelector("[data-slot=page-shell-content] [data-slot=table-container]")?.querySelectorAll("tbody tr").length ?? 0) >= n,
			{ timeout: CHO_MS },
			N,
		)
		.catch(() => khongDo(`khong-quyen: het ${CHO_MS}ms cho ${N} hang thanh vien`));
	await ngu(500);
	const d = await p.evaluate(
		(nutThem, tieuDe) => ({
			tren: document.querySelector("[data-slot=page-shell-content] [data-slot=card-title]")?.textContent?.trim() ?? "(khong co)",
			nut: [...document.querySelectorAll("button")].filter((b) => b.textContent?.trim() === nutThem).length,
			khoi: [...document.querySelectorAll("section, [data-slot=card-title]")].filter((s) => s.textContent?.includes(tieuDe)).length,
		}),
		t.duocPhepVao.nutThem,
		t.duocPhepVao.tieuDe,
	);
	kiem("kq-tieu-de", `1440 khong-quyen: tieu de «${d.tren}» (mong «${t.dem(t.bang.tieuDe, N)}»)`, d.tren === t.dem(t.bang.tieuDe, N));
	kiem("kq-khong-nut", `1440 khong-quyen: ${d.nut} nut «${t.duocPhepVao.nutThem}»`, d.nut === 0);
	kiem("kq-khong-khoi", `1440 khong-quyen: ${d.khoi} khoi «${t.duocPhepVao.tieuDe}»`, d.khoi === 0);
	await p.screenshot({ path: join(RA, "khong-quyen-1440.png") });
	await ctx.close();
}

async function doMan(slug, cookie, N, M, tenLoc) {
	mkdirSync(RA, { recursive: true });
	const host = new URL(APP).hostname;
	trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie({ name: cookie.ten, value: cookie.gia, domain: host, path: "/" }, { name: "lang", value: "vi", domain: host, path: "/" });
	for (const kho of KHO) {
		if (kho.ten === BO_KHO) {
			dong.push(`GHI CHU bo kho ${kho.ten} theo TVHK_BO_KHO`);
			continue;
		}
		const p = await moTrang(ctx, kho, `/${slug}/settings/members`);
		await choDu(p, N, EMAIL_00);
		await doKho(p, kho);
		await chup(p, kho);
		if (kho.ten === "375") await doCuonNgang(p);
		await p.close();
	}
	const p = await moTrang(ctx, KHO[0], `/${slug}/settings/members`);
	await choDu(p, N, EMAIL_00);
	await doTieuDe(ctx, slug, p, N, M, tenLoc);
	await doHangVaCot(p);
	const M2 = await doLuongChoPhep(p, M);
	await doLuongRut(p, M2);
	await p.close();
	await doKhongQuyen(slug, N);
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`);
	const quanTri = await db.user.findUnique({ where: { email: QUAN_TRI }, select: { id: true } });
	if (!quanTri) khongDo(`chua co ${QUAN_TRI} trong kho`);
	const nguoiLoc = await db.member.findFirst({
		where: { organizationId: WORKSPACE_ID, user: { email: KHONG_QUYEN } },
		select: { role: true, user: { select: { name: true } } },
	});
	if (nguoiLoc?.role !== "member" || !nguoiLoc.user.name) khongDo(`${KHONG_QUYEN} phai la thanh vien vai member co ten (dang: ${nguoiLoc?.role ?? "khong co"})`);
	const N = await db.member.count({ where: { organizationId: WORKSPACE_ID } });
	if (N < 2 || N > 25) khongDo(`workspace co ${N} thanh vien — ban do can 2..25 (mot trang)`);
	const cookie = phien(QUAN_TRI);
	const slug = await suySlug(cookie);
	await donTruoc();
	const truoc = await chupTap();
	try {
		await gieo(quanTri.id);
		if (PHA_SAU_GIEO) khongDo("pha-thu TVHK_PHA_SAU_GIEO: nem loi ngay sau khi gieo");
		const M = await db.invitation.count({ where: { organizationId: WORKSPACE_ID, status: "pending" } });
		await doMan(slug, cookie, N, M, nguoiLoc.user.name);
	} finally {
		await don(truoc);
	}
}

let ma;
try {
	await chay();
	for (const m of MA_TRAN) if (!daPhat.has(m)) kiem(m, `thieu ${m} — ma trong MA_TRAN khong phat dong nao`, false);
	ma = sai === 0 ? 0 : 1;
} catch (loi) {
	dong.push(`KHONG DO DUOC: ${loi instanceof KhongDo ? loi.message : (loi?.stack ?? String(loi))}`);
	ma = 2;
} finally {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	await db.$disconnect().catch(() => {});
}
for (const d of dong) console.log(d);
console.log(`ANH ${relative(GOC, RA)}/`);
console.log(`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`);
process.exit(ma);
