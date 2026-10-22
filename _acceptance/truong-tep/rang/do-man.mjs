import { execFileSync, spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { WORKSPACE_ID } from "../../../packages/db/src/workspace.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	API,
	APP,
	CHO_TAI,
	CHROME,
	chiaCookie,
	datTrinhDuyet,
	goiApiTao,
	ket,
	khongDo,
	NGUOI,
	phien,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import { dungKhoGia, HOST_GIA, KHOA_GIA } from "./blob-gia.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const BANG_CHUNG = (() => {
	const dat = process.env.BANG_CHUNG ?? "_acceptance/truong-tep/evidence";
	return isAbsolute(dat) ? dat : join(GOC, dat);
})();
const DO = {
	choHydrateMs: 1500,
	choNutMs: 600,
	choApiMs: 120_000,
	giuPutMs: 2_000,
	choBuocMs: 30_000,
	lon: { width: 1280, height: 900 },
	hep: { width: 375, height: 812 },
};
const NHAN_VIEN = "ttp-nhan-vien@onehub.test";
const CHU = {
	kieuTep: "Tệp — hợp đồng, bản quét, ảnh",
	tenTruong: "Hợp đồng",
	cot: "Cho chọn làm cột ở bảng Thoả thuận",
	loc: "Cho chọn làm bộ lọc ở bảng Thoả thuận",
	taoTruong: "Tạo trường",
	truongMoi: "Trường mới",
	chuaCo: "Chưa có tệp.",
	keoTha: "Kéo tệp vào đây",
	chonTep: "Chọn tệp",
	dangTai: "Đang tải lên…",
	nutMo: "Mở",
	nutXoa: "Xoá",
	khongMo: "Chỉ quản trị mở được tệp.",
	tat: "Kho tệp chưa bật trên máy chủ nên chưa tải tệp lên được.",
	saiKieu: "Tệp này không phải PDF, DOCX hay ảnh PNG, JPG.",
	huy: "Huỷ",
	xoaTep: "Xoá tệp",
	hoiXoa: (ten) => `Xoá tệp «${ten}»?`,
	boLoc: "Lọc",
	coTep: "Có tệp",
	chuaCoTep: "Chưa có tệp",
	soTep: (n) => `${n} tệp`,
};
const TEP = {
	dai: "Hợp đồng hợp tác An Phú — bản ký chính thức có phụ lục giá năm 2026.pdf",
	phuLuc: "Phụ lục 01.pdf",
	thu3: "Biên bản bàn giao.pdf",
	bang: "Bảng giá.xlsx",
};

const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();
if (!isMeasureDatabase(tenKho))
	await khongDo(
		`KHONG DO DUOC: can mot phien do (kho _do) — kho "${tenKho}". Chay qua scripts/lan-do/tien-de.mjs`,
	);

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const khoGia = dungKhoGia();
const thuMucTep = mkdtempSync(join(tmpdir(), "ttp-man-"));
let apiCuaTa = null;

async function dungApi(apiCua) {
	if (!apiCua) return;
	try {
		process.kill(-apiCua.pid, "SIGTERM");
	} catch {}
	for (let i = 0; i < 50 && nhomSong(apiCua.pid); i += 1) await ngu(100);
	try {
		process.kill(-apiCua.pid, "SIGKILL");
	} catch {}
}

function nhomSong(pgid) {
	try {
		process.kill(-pgid, 0);
		return true;
	} catch {
		return false;
	}
}

async function thoat(ma, cau) {
	if (cau) console.log(cau);
	await dungApi(apiCuaTa);
	khoGia.dung();
	rmSync(thuMucTep, { recursive: true, force: true });
	await ket(ma);
}

const GO_LOI = join(GOC, ".acceptance-runs", "truong-tep");
const trangMo = [];
async function hong(cau) {
	mkdirSync(GO_LOI, { recursive: true });
	for (const [i, t] of trangMo.entries()) {
		await t.screenshot({ path: join(GO_LOI, `do-man-loi-${i}.png`) }).catch(() => {});
	}
	await thoat(1, cau);
}

for (const tin of ["SIGINT", "SIGTERM", "SIGHUP"]) {
	process.on(tin, () => {
		void thoat(2, `KHONG DO DUOC: bi ngat ${tin}`);
	});
}

const congApi = new URL(API).port;

function nhomCuaCong(cong) {
	const ra = spawnSync("lsof", ["-ti", `tcp:${cong}`, "-sTCP:LISTEN"], { encoding: "utf8" });
	const pid = Number((ra.stdout ?? "").trim().split("\n")[0]);
	if (!pid) return null;
	const nhom = spawnSync("ps", ["-o", "pgid=", "-p", String(pid)], { encoding: "utf8" });
	return Number((nhom.stdout ?? "").trim()) || null;
}

async function khoiApi(khoa) {
	const cu = nhomCuaCong(congApi);
	if (cu && cu !== process.pid) {
		try {
			process.kill(-cu, "SIGTERM");
		} catch {}
		for (let i = 0; i < 100 && nhomCuaCong(congApi); i += 1) await ngu(100);
	}
	if (nhomCuaCong(congApi)) await thoat(2, `KHONG DO DUOC: cong ${congApi} van ban sau khi dung API cu`);
	const con = spawn(
		"bun",
		["--preload", join(HERE, "nap-blob-gia.mjs"), "src/main.ts"],
		{
			cwd: join(GOC, "apps/api"),
			env: {
				...process.env,
				PORT: congApi,
				TEP_BAN_GHI_BLOB_TOKEN: khoa,
				VERCEL_BLOB_API_URL: khoGia.url,
				TTP_BLOB_GIA: khoGia.url,
			},
			detached: true,
			stdio: ["ignore", "ignore", "ignore"],
		},
	);
	apiCuaTa = con;
	const han = Date.now() + DO.choApiMs;
	while (Date.now() < han) {
		if (con.exitCode !== null) await thoat(2, `KHONG DO DUOC: API cua rang thoat ${con.exitCode}`);
		const ok = await fetch(`${API}/health`).then((r) => r.ok).catch(() => false);
		if (ok) return;
		await ngu(500);
	}
	await thoat(2, "KHONG DO DUOC: API cua rang khong san sang");
}

const cookie = phien();
const cookieNv = chiaCookie(
	execFileSync("bun", ["run", "dev:session", NHAN_VIEN], { cwd: join(GOC, "apps/api"), encoding: "utf8" })
		.trim()
		.split("\n")
		.pop()
		.trim(),
);
for (const [email, role] of [
	[NGUOI, "admin"],
	[NHAN_VIEN, "member"],
]) {
	const u = await db.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
	await db.member.upsert({
		where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId: u.id } },
		create: { id: `member-${u.id}`, organizationId: WORKSPACE_ID, userId: u.id, role, createdAt: new Date() },
		update: { role },
	});
}
const slug = await suySlug(cookie);

await khoiApi(KHOA_GIA);
console.log(`API cua phien do khoi lai voi kho Blob gia ${khoGia.url}`);

async function tao(duong, vao) {
	const kq = await goiApiTao(cookie, duong, vao);
	if (kq.loi) await thoat(2, `KHONG DO DUOC: ${kq.loi}`);
	return kq.gia;
}

const toi = await db.user.findUniqueOrThrow({ where: { email: NGUOI }, select: { id: true } });
const congTy = await tao("companies.create", { name: "Công ty An Phú ttp" });
const deal = {};
for (const ten of ["T1", "T2", "T3"]) {
	deal[ten] = await tao("deals.create", {
		name: `Thoả thuận ${ten} ttp`,
		companyId: congTy.id,
		ownerId: toi.id,
	});
}
console.log("gieo ba thoa thuan qua API that");

const pdf = (nhan, co) => {
	const dau = Buffer.from(`%PDF-1.4\n% ${nhan}\n`);
	const duoi = Buffer.from("\n%%EOF\n");
	return Buffer.concat([dau, Buffer.alloc(co - dau.length - duoi.length, 0x20), duoi]);
};
const duongTep = {};
for (const [k, ten] of Object.entries(TEP)) {
	const p = join(thuMucTep, ten);
	writeFileSync(p, k === "bang" ? Buffer.from("PK\u0003\u0004ttp-xlsx") : pdf(ten, 24 * 1024));
	duongTep[k] = p;
}

mkdirSync(BANG_CHUNG, { recursive: true });
const trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
datTrinhDuyet(trinhDuyet);
const host = new URL(APP).hostname;

async function trangCua(c) {
	const nguCanh = await trinhDuyet.createBrowserContext();
	const t = await nguCanh.newPage();
	await t.setCookie(
		{ name: c.ten, value: c.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	trangMo.push(t);
	return t;
}

const qt = await trangCua(cookie);
const nv = await trangCua(cookieNv);

async function mo(trang, duong, cho, kho = DO.lon) {
	await trang.setViewport(kho);
	await trang.goto(`${APP}${duong}`, { waitUntil: "domcontentloaded", timeout: CHO_TAI });
	const dich = new URL(trang.url()).pathname;
	if (dich.startsWith("/sign-in") || dich.includes("/onboarding"))
		await thoat(2, `KHONG DO DUOC: ${duong} bi day ve ${dich}`);
	await trang
		.waitForFunction((chu) => document.body.innerText.includes(chu), { timeout: CHO_TAI }, cho)
		.catch(() => {});
	await ngu(DO.choHydrateMs);
}

async function cho(trang, ham, arg, cau) {
	const dat = await trang
		.waitForFunction(ham, { timeout: DO.choBuocMs, polling: 100 }, arg)
		.then(() => true)
		.catch(() => false);
	if (!dat) await hong(cau);
}

async function bamChu(trang, chon, chu) {
	const ok = await trang.evaluate(
		(s, c) => {
			const el = [...document.querySelectorAll(s)].find((x) => x.textContent?.trim() === c);
			if (!el) return false;
			el.scrollIntoView({ block: "center" });
			el.click();
			return true;
		},
		chon,
		chu,
	);
	await ngu(DO.choNutMs);
	return ok;
}

async function chup(trang, ten) {
	await trang.evaluate(() => {
		document.querySelector('[data-slot="o-tep"]')?.scrollIntoView({ block: "center" });
	});
	await ngu(DO.choNutMs);
	await trang.screenshot({ path: join(BANG_CHUNG, `${ten}.png`), fullPage: false });
	console.log(`anh ${ten}.png`);
}

await mo(qt, `/${slug}/settings/fields?thucThe=deal&truong=new`, CHU.taoTruong);
const CHON_TEN = 'input[id]:not([type=hidden]):not([role=combobox])';
let oTen = await qt.waitForSelector(CHON_TEN, { timeout: DO.choBuocMs }).catch(() => null);
if (!oTen) {
	await bamChu(qt, "button", CHU.truongMoi);
	oTen = await qt.waitForSelector(CHON_TEN, { timeout: DO.choBuocMs }).catch(() => null);
}
if (!oTen) await hong("ttp man: cai dat khong co o ten");
await oTen.click();
await oTen.type(CHU.tenTruong);
const oKieu = await qt.$('[role="combobox"]');
if (!oKieu) await hong("ttp man: cai dat thieu kieu");
await oKieu.click();
await ngu(DO.choNutMs);
if (!(await bamChu(qt, '[role="option"]', CHU.kieuTep))) await hong("ttp man: cai dat thieu kieu");
for (const nhan of [CHU.cot, CHU.loc]) {
	await qt.evaluate((n) => {
		const l = [...document.querySelectorAll("label")].find((x) => x.textContent?.includes(n));
		const o = l?.querySelector('[role="checkbox"],[role="switch"]') ?? l?.parentElement?.querySelector('[role="checkbox"],[role="switch"]');
		if (o && o.getAttribute("aria-checked") !== "true") o.click();
	}, nhan);
	await ngu(DO.choNutMs);
}
await bamChu(qt, "button", CHU.taoTruong);
let truong = null;
for (let i = 0; i < 60 && !truong; i += 1) {
	truong = await db.fieldDefinition.findFirst({
		where: { entity: "DEAL", label: CHU.tenTruong, type: "FILE", archivedAt: null },
	});
	if (!truong) await ngu(250);
}
if (!truong) await hong("ttp man: cai dat khong luu duoc truong Tep");
if (!truong.showOnTable || !truong.showOnFilter)
	await hong(`ttp man: cai dat co ${truong.showOnTable}/${truong.showOnFilter}`);
console.log(`truong Tep «${truong.label}» khoa ${truong.key} tao tren man Cai dat`);

const phieu = (id) => `/${slug}/deals?record=deal:${id}`;
const soO = (trang) =>
	trang.evaluate(() => {
		const o = document.querySelector('[data-slot="o-tep"]');
		return {
			tep: o?.querySelectorAll("[data-tep]").length ?? -1,
			dang: o?.querySelectorAll('[data-dong-tai="dang"]').length ?? 0,
			loi: o?.querySelectorAll('[data-dong-tai="loi"]').length ?? 0,
			chu: o?.textContent ?? "",
		};
	});

await mo(qt, phieu(deal.T1.id), CHU.chuaCo);
const rong = await soO(qt);
if (!rong.chu.includes(CHU.chuaCo) || !rong.chu.includes(CHU.keoTha) || !rong.chu.includes(CHU.chonTep))
	await hong("ttp man: rong thieu chu");
await chup(qt, "ttp-rong-1280");

khoGia.giuTuPut(2, DO.giuPutMs);
const vao = await qt.$('[data-slot="o-tep"] input[type=file]');
if (!vao) await hong("ttp man: thieu o chon tep");
await vao.uploadFile(duongTep.dai, duongTep.phuLuc);
await cho(
	qt,
	() => {
		const o = document.querySelector('[data-slot="o-tep"]');
		return o?.querySelectorAll("[data-tep]").length === 1 && o?.querySelectorAll('[data-dong-tai="dang"]').length === 1;
	},
	null,
	"ttp man: dang tai khong bat duoc mot dong cho",
);
await chup(qt, "ttp-dang-tai-1280");
await cho(qt, () => document.querySelectorAll('[data-slot="o-tep"] [data-tep]').length === 2, null, "ttp man: co tep khong du hai dong");
khoGia.boGiu();
await ngu(DO.choNutMs);
const coTep = await soO(qt);
if (coTep.dang + coTep.loi > 0) await hong(`ttp man: co tep con ${coTep.dang} dang, ${coTep.loi} loi`);
await chup(qt, "ttp-co-tep-1280");
const hang = await db.fieldFile.count({ where: { fieldId: truong.id, dealId: deal.T1.id } });
if (hang !== 2) await hong(`ttp man: co tep hang ${hang}`);

await mo(qt, phieu(deal.T1.id), CHU.nutMo, DO.hep);
const vaoHep = await qt.$('[data-slot="o-tep"] input[type=file]');
await vaoHep.uploadFile(duongTep.bang, duongTep.thu3);
await cho(
	qt,
	(c) => {
		const o = document.querySelector('[data-slot="o-tep"]');
		return o?.querySelectorAll("[data-tep]").length === 3 && (o?.textContent ?? "").includes(c);
	},
	CHU.saiKieu,
	"ttp man: loi tep khong bao sai kieu hay PDF khong xong",
);
await chup(qt, "ttp-loi-tep-375");
const tran = await qt.evaluate(() => document.documentElement.scrollWidth);
if (tran > DO.hep.width) await hong("ttp man: 375 cuon ngang");

await mo(qt, phieu(deal.T1.id), CHU.nutMo);
const bamXoa = (ten) =>
	qt.evaluate((n) => {
		const b = [...document.querySelectorAll("button")].find((x) => x.getAttribute("aria-label") === `Xoá ${n}`);
		b?.click();
		return Boolean(b);
	}, ten);
if (!(await bamXoa(TEP.thu3))) await hong("ttp man: hoi xoa thieu nut");
await cho(qt, (t) => [...document.querySelectorAll('[role="alertdialog"],[role="dialog"]')].some((d) => d.textContent?.includes(t)), CHU.hoiXoa(TEP.thu3), "ttp man: hoi xoa khong neu ten");
await chup(qt, "ttp-hoi-xoa-1280");
await bamChu(qt, '[role="alertdialog"] button, [role="dialog"] button', CHU.huy);
if ((await soO(qt)).tep !== 3) await hong("ttp man: huy van xoa");
await bamXoa(TEP.thu3);
await ngu(DO.choNutMs);
await bamChu(qt, '[role="alertdialog"] button, [role="dialog"] button', CHU.xoaTep);
await cho(qt, () => document.querySelectorAll('[data-slot="o-tep"] [data-tep]').length === 2, null, "ttp man: xoa that khong bot tep");

await mo(nv, phieu(deal.T1.id), CHU.khongMo, DO.hep);
const nvXem = await nv.evaluate((m) => {
	const o = document.querySelector('[data-slot="o-tep"]');
	const mo = [...(o?.querySelectorAll("button") ?? [])].filter((b) => b.textContent?.trim() === m);
	return { mo: mo.length, khoa: mo.every((b) => b.disabled), chu: o?.textContent ?? "" };
}, CHU.nutMo);
if (nvXem.mo === 0 || !nvXem.khoa || !nvXem.chu.includes(CHU.khongMo)) await hong("ttp man: nhan vien mo duoc");
await chup(nv, "ttp-khong-mo-375");
const tabMoi = trinhDuyet.waitForTarget((t) => t.url().includes(HOST_GIA), { timeout: DO.choBuocMs }).catch(() => null);
await qt.evaluate((n) => {
	[...document.querySelectorAll("button")].find((x) => x.getAttribute("aria-label") === `Mở ${n}`)?.click();
}, TEP.phuLuc);
const dich = await tabMoi;
if (!dich) await hong("ttp man: mo khong ra");
const urlMo = new URL(dich.url());
if (!urlMo.searchParams.has("vercel-blob-signature")) await hong("ttp man: mo khong ky");
await (await dich.page())?.close().catch(() => {});
console.log(`mo tep ra tab ${urlMo.host}${urlMo.pathname} co chu ky`);

await khoiApi("");
console.log("API cua phien do khoi lai khong co TEP_BAN_GHI_BLOB_TOKEN");
await mo(qt, phieu(deal.T1.id), CHU.tat);
const tat = await qt.evaluate((t) => {
	const o = document.querySelector('[data-slot="o-tep"]');
	const vung = o?.querySelector('[data-slot="nguon-keo-tha"]');
	const mo = [...(o?.querySelectorAll("button") ?? [])].filter((b) => b.textContent?.trim() === "Mở");
	return {
		tep: o?.querySelectorAll("[data-tep]").length ?? 0,
		vungTat: vung?.getAttribute("data-tat") === "true",
		moKhoa: mo.length > 0 && mo.every((b) => b.disabled),
		lyDo: (o?.textContent ?? "").includes(t),
	};
}, CHU.tat);
if (tat.tep !== 2 || !tat.vungTat || !tat.moKhoa || !tat.lyDo) await hong(`ttp man: tat ${JSON.stringify(tat)}`);
await chup(qt, "ttp-tat-1280");

await mo(qt, `/${slug}/deals?q=ttp`, CHU.tenTruong);
const cot = await qt.evaluate((ten) => {
	const ra = {};
	for (const tr of document.querySelectorAll("tr")) {
		const chu = tr.textContent ?? "";
		const k = ["T1", "T2", "T3"].find((x) => chu.includes(`Thoả thuận ${x} ttp`));
		if (!k) continue;
		const th = [...document.querySelectorAll("th")].findIndex((h) => h.textContent?.trim() === ten);
		ra[k] = th >= 0 ? (tr.children[th]?.textContent?.trim() ?? null) : null;
	}
	return ra;
}, CHU.tenTruong);
if (cot.T1 !== CHU.soTep(2) || cot.T2 !== "—" || cot.T3 !== "—") await hong(`ttp man: cot ${JSON.stringify(cot)}`);
const nutLoc = await qt.$$('button[aria-haspopup="menu"]');
for (const b of nutLoc) {
	const chu = await b.evaluate((x) => x.textContent ?? "");
	if (chu.includes(CHU.boLoc)) {
		await b.click();
		break;
	}
}
await ngu(DO.choNutMs);
const mucCha = await qt.$$('[data-slot="dropdown-menu-sub-trigger"]');
for (const m of mucCha) {
	if ((await m.evaluate((x) => x.textContent ?? "")).includes(CHU.tenTruong)) {
		await m.click();
		break;
	}
}
await ngu(DO.choNutMs);
const menu = await qt.evaluate(() =>
	[...document.querySelectorAll('[data-slot="dropdown-menu-sub-content"] [role="menuitemcheckbox"]')].map((x) => ({
		chu: x.textContent?.trim() ?? "",
		so: x.querySelector('[data-slot="facet-count"]')?.textContent ?? null,
	})),
);
const so = (n) => menu.find((x) => x.chu.startsWith(n))?.so;
if (so(CHU.coTep) !== "1" || so(CHU.chuaCoTep) !== "2") await hong(`ttp man: menu loc ${JSON.stringify(menu)}`);
await bamChu(qt, '[data-slot="dropdown-menu-sub-content"] [role="menuitemcheckbox"] span', CHU.chuaCoTep);
await cho(qt, (k) => new URLSearchParams(location.search).getAll(`field:${k}`).includes("none"), truong.key, "ttp man: loc url chua doi");
const qs = await qt.evaluate(() => location.search);
if (!new URLSearchParams(qs).getAll(`field:${truong.key}`).includes("none")) await hong(`ttp man: loc url ${qs}`);
await cho(
	qt,
	() => {
		const chu = [...document.querySelectorAll("tbody tr")].map((t) => t.textContent ?? "").join("|");
		return !chu.includes("Thoả thuận T1 ttp") && chu.includes("Thoả thuận T2 ttp") && chu.includes("Thoả thuận T3 ttp");
	},
	null,
	"ttp man: loc bang con T1 hay thieu T2 T3",
);
await chup(qt, "ttp-loc-1280");

await tao("deals.archive", { id: deal.T1.id });
await mo(qt, phieu(deal.T1.id), CHU.tenTruong);
const luuTru = await qt.evaluate((x) => {
	const o = document.querySelector('[data-slot="o-tep"]');
	return {
		o: Boolean(o),
		vung: Boolean(o?.querySelector('[data-slot="nguon-keo-tha"]')),
		xoa: [...(o?.querySelectorAll("button") ?? [])].some((b) => b.textContent?.trim() === x),
	};
}, CHU.nutXoa);
if (!luuTru.o || luuTru.vung || luuTru.xoa) await hong("ttp man: luu tru sua duoc");
console.log("luu tru T1: o chi doc, khong vung tai, khong Xoa");

console.log(`anh: ${BANG_CHUNG}`);
await thoat(0, "ttp man: dat");
