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
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "bang-thanh-vien-giu-hang", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const QUAN_TRI = process.env.QUAN_TRI ?? "ada@trycomp.ai";
const NGUOI_BI_DOI = process.env.NGUOI_BI_DOI ?? "marcus@trycomp.ai";
const SO_LOI_MOI = Number(process.env.SO_LOI_MOI ?? 15);
const TIEN_TO = "ttv-lan-do-";
const MIEN = "lan-do.onehub.vn";
const KHO = [
	{ rong: 1440, cao: 900, doTran: true },
	{ rong: 768, cao: 1024, doTran: true },
	{ rong: 375, cao: 812, doTran: false },
];
const CHO_MS = 60_000;
const LECH_PX = 2;
const TIM_KHONG_AI = "ttv-khong-ai-trung-tu-nay";
const CO_TRANG = 25;
const PHA_SAU_GIEO = process.env.TTV_PHA_SAU_GIEO === "1";
const SO_NAC_CON_LAN = 40;
const NAC_CON_LAN_PX = 600;
const CHO_CON_LAN_MS = 80;
const SO_NHIP_DUNG_YEN = 3;
const t = thanhVienMessages("vi");

const dong = [];
let sai = 0;
let trinhDuyet = null;
const idLuot = `${TIEN_TO}${process.pid}-`;

function kiem(nhan, dat) {
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

function phien(email) {
	const ra = execFileSync("bun", ["run", "dev:session", email], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) khongDo(`khong doc duoc cookie phien cua ${email}`);
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) khongDo(`${APP}/ tra ${res.status} khong co Location`);
	const dau = new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
	if (!dau || dau.startsWith("onboarding") || dau === "sign-in")
		khongDo(`${APP}/ chuyen toi ${dich} — tien de onboarding hoac phien hong`);
	return dau;
}

async function donRacCu() {
	const cu = await db.invitation.deleteMany({
		where: { id: { startsWith: TIEN_TO }, NOT: { id: { startsWith: idLuot } } },
	});
	if (cu.count > 0) dong.push(`GHI CHU don ${cu.count} loi moi sot tu luot truoc`);
}

async function gieo(nguoiMoiId) {
	const data = Array.from({ length: SO_LOI_MOI }, (_, i) => ({
		id: `${idLuot}${String(i).padStart(2, "0")}`,
		organizationId: WORKSPACE_ID,
		email: `${TIEN_TO}${String(i).padStart(2, "0")}@${MIEN}`,
		role: "member",
		status: "pending",
		expiresAt: ALLOWANCE_WITHOUT_EXPIRY,
		inviterId: nguoiMoiId,
	}));
	await db.invitation.createMany({ data });
	const lai = await db.invitation.count({ where: { id: { startsWith: idLuot } } });
	if (lai !== SO_LOI_MOI) khongDo(`gieo ${SO_LOI_MOI} loi moi, doc lai ${lai}`);
}

async function don(truoc) {
	await db.invitation.deleteMany({ where: { id: { startsWith: idLuot } } });
	const con = await db.invitation.count({ where: { id: { startsWith: TIEN_TO } } });
	const sau = (await db.invitation.findMany({ select: { id: true } })).map((r) => r.id).sort();
	kiem(`don: con ${con} loi moi cua ban do`, con === 0);
	kiem(
		`don: loi moi co san truoc luot giu nguyen (${truoc.length} truoc, ${sau.length} sau)`,
		JSON.stringify(sau) === JSON.stringify(truoc),
	);
}

async function moTrang(ctx, kho, duong) {
	const p = await ctx.newPage();
	await p.setViewport({ width: kho.rong, height: kho.cao, deviceScaleFactor: 1 });
	await p.goto(`${APP}${duong}`, { waitUntil: "load", timeout: CHO_MS });
	const cuoi = new URL(p.url()).pathname;
	if (cuoi !== duong.split("?")[0]) khongDo(`${kho.rong}: trang cuoi la ${cuoi}, khong phai ${duong}`);
	return p;
}

async function doDoc(p, soThanhVien, emailMoc) {
	await p
		.waitForFunction(
			(n, e, tieuDe) => {
				const bang = document.querySelector("[data-slot=page-shell-content] [data-slot=table-container]");
				const hang = bang ? bang.querySelectorAll("tbody tr").length : 0;
				const muc = [...document.querySelectorAll("section")].find((s) => s.textContent?.includes(tieuDe));
				return hang >= n && muc?.textContent?.includes(e);
			},
			{ timeout: CHO_MS },
			soThanhVien,
			emailMoc,
			t.duocPhepVao.tieuDe,
		)
		.catch(() => khongDo(`het ${CHO_MS}ms cho du ${soThanhVien} hang thanh vien va ${emailMoc}`));
	await p.evaluate(() => document.fonts.ready);
	return p.evaluate((tieuDe) => {
		const cuon = document.querySelector("[data-slot=page-shell-scroll]");
		const bang = document.querySelector("[data-slot=page-shell-content] [data-slot=table-container]");
		const goc = bang.parentElement;
		const muc = [...document.querySelectorAll("section")].find((s) => s.textContent?.includes(tieuDe));
		const hopBang = bang.getBoundingClientRect();
		const hang = [...bang.querySelectorAll("tbody tr")];
		const hienTron = hang.filter((h) => {
			const r = h.getBoundingClientRect();
			return r.height > 0 && r.top >= hopBang.top - 2 && r.bottom <= hopBang.bottom + 2;
		}).length;
		const catHang = hang.filter((h) => h.getBoundingClientRect().bottom > hopBang.bottom + 2).length;
		return {
			soHang: hienTron,
			caoBang: Math.round(hopBang.height),
			catHang,
			tranTrong: bang.scrollHeight - bang.clientHeight,
			dayGoc: Math.round(goc.getBoundingClientRect().bottom),
			dinhMuc: Math.round(muc.getBoundingClientRect().top),
			tranNgang: Math.max(
				document.documentElement.scrollWidth - document.documentElement.clientWidth,
				cuon.scrollWidth - cuon.clientWidth,
			),
			tranDocTaiLieu: document.documentElement.scrollHeight - document.documentElement.clientHeight,
		};
	}, t.duocPhepVao.tieuDe);
}

async function cuonBangConLan(p) {
	const tam = await p.evaluate(() => {
		const r = document.querySelector("[data-slot=page-shell-scroll]").getBoundingClientRect();
		return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
	});
	await p.mouse.move(tam.x, tam.y);
	let truoc = -1;
	let dungYen = 0;
	for (let i = 0; i < SO_NAC_CON_LAN && dungYen < SO_NHIP_DUNG_YEN; i++) {
		await p.mouse.wheel({ deltaY: NAC_CON_LAN_PX });
		await new Promise((r) => setTimeout(r, CHO_CON_LAN_MS));
		const nay = await p.evaluate(() => document.querySelector("[data-slot=page-shell-scroll]").scrollTop);
		dungYen = nay === truoc ? dungYen + 1 : 0;
		truoc = nay;
	}
	const ket = await p.evaluate((tieuDe) => {
		const cuon = document.querySelector("[data-slot=page-shell-scroll]");
		const muc = [...document.querySelectorAll("section")].find((s) => s.textContent?.includes(tieuDe));
		const hangCuoi = [...muc.querySelectorAll("tbody tr")].at(-1).getBoundingClientRect();
		const khung = cuon.getBoundingClientRect();
		return {
			daCuon: cuon.scrollTop,
			denDuoc: hangCuoi.top >= khung.top - 2 && hangCuoi.bottom <= khung.bottom + 2,
		};
	}, t.duocPhepVao.tieuDe);
	await p.evaluate(() => {
		document.querySelector("[data-slot=page-shell-scroll]").scrollTop = 0;
	});
	return ket;
}

async function chupHaiCho(p, kho) {
	await p.screenshot({ path: join(RA, `thanh-vien-${kho.rong}-dau.png`) });
	await p.evaluate(() => {
		const cuon = document.querySelector("[data-slot=page-shell-scroll]");
		const goc = document.querySelector("[data-slot=page-shell-content] [data-slot=table-container]").parentElement;
		const kc = cuon.getBoundingClientRect();
		cuon.scrollTop += goc.getBoundingClientRect().bottom - (kc.top + kc.height / 2);
	});
	await p.screenshot({ path: join(RA, `thanh-vien-${kho.rong}-noi.png`) });
	await p.evaluate(() => {
		document.querySelector("[data-slot=page-shell-scroll]").scrollTop = 0;
	});
}

async function doMenu(p, kho, tenNguoi) {
	const nhan = t.bang.doiVaiTro(tenNguoi);
	const nut = await p.evaluateHandle((n) => {
		const sr = [...document.querySelectorAll("button .sr-only")].find((s) => s.textContent === n);
		return sr?.closest("button") ?? null;
	}, nhan);
	if (!(await nut.evaluate((b) => b !== null))) khongDo(`${kho.rong}: khong co nut «${nhan}» tren trang`);
	const doiChung = await p.evaluate(() => {
		const h1 = document.querySelector("[data-slot=page-shell-title]");
		const r = h1?.getBoundingClientRect();
		const o = r ? document.elementFromPoint(r.left + Math.min(r.width, 40) / 2, r.top + r.height / 2) : null;
		return o !== null && h1.contains(o);
	});
	kiem(`${kho.rong}: doi chung — tam tieu de trang tra ve chinh tieu de`, doiChung);
	await nut.evaluate((b) => b.scrollIntoView({ block: "center" }));
	const trung = await nut.evaluate((b) => {
		const h = b.getBoundingClientRect();
		const x = h.left + h.width / 2;
		const y = h.top + h.height / 2;
		const trongKhung = x >= 0 && y >= 0 && x <= window.innerWidth && y <= window.innerHeight;
		const o = document.elementFromPoint(x, y);
		return { trongKhung, khongChe: o !== null && b.contains(o) };
	});
	kiem(
		`${kho.rong}: nut menu vai cua ${tenNguoi} nam trong khung nhin (${trung.trongKhung}) va khong bi khoi nao de len (${trung.khongChe})`,
		trung.trongKhung && trung.khongChe,
	);
	await nut.click();
	const muc = await p
		.waitForSelector("[role='menuitem']", { visible: true, timeout: 5000 })
		.then(() =>
			p.evaluate(() => [...document.querySelectorAll("[role='menuitem']")].map((e) => e.textContent?.trim())),
		)
		.catch(() => []);
	const canCo = Object.values(t.vaiTro);
	kiem(
		`${kho.rong}: menu vai mo, co du ${canCo.length} vai ${JSON.stringify(muc)}`,
		canCo.every((v) => muc.includes(v)),
	);
	if (kho.rong === 1440) await p.screenshot({ path: join(RA, "menu-vai-1440.png") });
	await p.keyboard.press("Escape");
}

async function doRong(ctx, slug) {
	const kho = KHO[0];
	const p = await moTrang(ctx, kho, `/${slug}/settings/members?q=${TIM_KHONG_AI}`);
	const thay = await p
		.waitForFunction(
			(cau) => {
				const bang = document.querySelector("[data-slot=page-shell-content] [data-slot=table-container]");
				const o = [...(bang?.querySelectorAll("div") ?? [])].find((d) => d.textContent?.trim() === cau);
				if (!o) return null;
				const hb = bang.getBoundingClientRect();
				const ho = o.getBoundingClientRect();
				const giua = document.elementFromPoint(ho.left + ho.width / 2, ho.top + ho.height / 2);
				return { cao: Math.round(ho.height), trong: ho.top >= hb.top && ho.bottom <= hb.bottom + 2, nhin: giua !== null && o.contains(giua) };
			},
			{ timeout: CHO_MS },
			t.bang.trong,
		)
		.then((h) => h.jsonValue())
		.catch(() => null);
	if (thay === null) khongDo(`het ${CHO_MS}ms cho cau «${t.bang.trong}» khi tim ${TIM_KHONG_AI}`);
	kiem(
		`1440: tim khong ra ai thi thay «${t.bang.trong}» (cao ${thay.cao}px, trong khung ${thay.trong}, khong bi che ${thay.nhin})`,
		thay.cao >= 16 && thay.trong && thay.nhin,
	);
	await p.screenshot({ path: join(RA, "tim-khong-ra-1440.png") });
	await p.close();
}

async function doLapDay(ctx, slug) {
	const kho = KHO[0];
	const p = await moTrang(ctx, kho, `/${slug}/settings/api-keys`);
	await p
		.waitForSelector("[data-slot=page-shell-content] [data-slot=table-container]", { timeout: CHO_MS })
		.catch(() => khongDo(`het ${CHO_MS}ms cho bang Khoa API`));
	const lech = await p.evaluate(() => {
		const bang = document.querySelector("[data-slot=page-shell-content] [data-slot=table-container]");
		const khung = document.querySelector("[data-slot=page-shell]");
		return Math.round(khung.getBoundingClientRect().bottom - bang.parentElement.getBoundingClientRect().bottom);
	});
	kiem(`1440: bang Khoa API van lap day khung trang (lech day ${lech}px)`, Math.abs(lech) <= LECH_PX);
	await p.close();
}

async function doMan(slug, cookie, soThanhVien, tenNguoi) {
	mkdirSync(RA, { recursive: true });
	const host = new URL(APP).hostname;
	trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const emailMoc = `${TIEN_TO}00@${MIEN}`;
	for (const kho of KHO) {
		const p = await moTrang(ctx, kho, `/${slug}/settings/members`);
		const d = await doDoc(p, soThanhVien, emailMoc);
		const nhan = `${kho.rong}x${kho.cao}`;
		kiem(`${nhan}: bang thanh vien hien ${d.soHang}/${soThanhVien} hang`, d.soHang === soThanhVien);
		kiem(`${nhan}: bang cao ${d.caoBang}px, ${d.catHang} hang bi cat, tran trong ${d.tranTrong}px`, d.catHang === 0 && d.tranTrong <= LECH_PX);
		kiem(`${nhan}: muc Duoc phep vao bat dau o ${d.dinhMuc}px, duoi day bang ${d.dayGoc}px`, d.dinhMuc >= d.dayGoc);
		const c = await cuonBangConLan(p);
		kiem(`${nhan}: con lan cuon trang ${c.daCuon}px va toi duoc loi moi cuoi (${c.denDuoc})`, c.daCuon > 0 && c.denDuoc);
		kiem(`${nhan}: chi mot vung cuon — tai lieu tran doc ${d.tranDocTaiLieu}px`, d.tranDocTaiLieu <= 0);
		if (kho.doTran) kiem(`${nhan}: tran ngang ${d.tranNgang}px (tai lieu va vung cuon)`, d.tranNgang <= 0);
		else dong.push(`GHI CHU ${nhan}: tran ngang ${d.tranNgang}px (tai lieu va vung cuon) — bang Duoc phep vao ve tay sau cot, ngoai pham vi`);
		await chupHaiCho(p, kho);
		await doMenu(p, kho, tenNguoi);
		await p.close();
	}
	await doRong(ctx, slug);
	await doLapDay(ctx, slug);
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`);
	const quanTri = await db.user.findUnique({ where: { email: QUAN_TRI }, select: { id: true } });
	if (!quanTri) khongDo(`chua co ${QUAN_TRI} trong kho`);
	const nguoiBiDoi = await db.user.findUnique({ where: { email: NGUOI_BI_DOI }, select: { name: true } });
	if (!nguoiBiDoi?.name) khongDo(`chua co ${NGUOI_BI_DOI} trong kho`);
	const soThanhVien = await db.member.count({ where: { organizationId: WORKSPACE_ID } });
	if (soThanhVien < 2 || soThanhVien > CO_TRANG)
		khongDo(`workspace co ${soThanhVien} thanh vien — ban do can tu 2 toi ${CO_TRANG} (mot trang) de dem du hang`);
	const cookie = phien(QUAN_TRI);
	const slug = await suySlug(cookie);
	await donRacCu();
	const truoc = (await db.invitation.findMany({ select: { id: true } })).map((r) => r.id).sort();
	try {
		await gieo(quanTri.id);
		if (PHA_SAU_GIEO) khongDo("pha-thu TTV_PHA_SAU_GIEO: nem loi ngay sau khi gieo");
		await doMan(slug, cookie, soThanhVien, nguoiBiDoi.name);
	} finally {
		await don(truoc);
	}
}

let ma;
try {
	await chay();
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
