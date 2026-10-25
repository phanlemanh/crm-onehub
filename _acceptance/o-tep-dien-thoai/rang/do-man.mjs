import { spawn, spawnSync } from "node:child_process";
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
	datTrinhDuyet,
	goiApiTao,
	ket,
	khongDo,
	mu,
	NGUOI,
	phien,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import { dungKhoGia, KHOA_GIA } from "../../truong-tep/rang/blob-gia.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const NAP_BLOB = join(GOC, "_acceptance", "truong-tep", "rang", "nap-blob-gia.mjs");
const BANG_CHUNG = (() => {
	const dat = process.env.BANG_CHUNG ?? "_acceptance/o-tep-dien-thoai/evidence";
	return isAbsolute(dat) ? dat : join(GOC, dat);
})();
const GO_LOI = join(GOC, ".acceptance-runs", "o-tep-dien-thoai");
const DO = {
	choHydrateMs: 1500,
	choNutMs: 600,
	choApiMs: 120_000,
	choBuocMs: 30_000,
	lon: { width: 1280, height: 900 },
	hep: { width: 375, height: 812 },
	chuToiThieu: 0.75,
	leLech: 12,
	moTaToiDa: 2,
};
const KHOA_NGUON_GIA = "vercel_blob_rw_otdtnguon_khonglakhoathat";
const CHU = {
	nhanTruong: "Hợp đồng (thử DA19 khổ hẹp)",
	chuaCo: "Chưa có tệp.",
	keoTha: "Kéo tệp vào đây",
	nutMo: "Mở",
	nguonTieuDe: "Tải nguồn lên",
};
const TEP_DAI = "Hợp đồng hợp tác An Phú — bản ký chính thức có phụ lục giá năm 2026.pdf";

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
const thuMucTep = mkdtempSync(join(tmpdir(), "otdt-man-"));
const loi = [];
const trangMo = [];
let apiCuaTa = null;

function nhomSong(pgid) {
	try {
		process.kill(-pgid, 0);
		return true;
	} catch {
		return false;
	}
}

async function dungApi(con) {
	if (!con) return;
	try {
		process.kill(-con.pid, "SIGTERM");
	} catch {}
	for (let i = 0; i < 50 && nhomSong(con.pid); i += 1) await ngu(100);
	try {
		process.kill(-con.pid, "SIGKILL");
	} catch {}
}

async function thoat(ma, cau) {
	if (cau) console.log(cau);
	await dungApi(apiCuaTa);
	khoGia.dung();
	rmSync(thuMucTep, { recursive: true, force: true });
	await ket(ma);
}

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

async function khoiApi() {
	const cu = nhomCuaCong(congApi);
	if (cu && cu !== process.pid) {
		try {
			process.kill(-cu, "SIGTERM");
		} catch {}
		for (let i = 0; i < 100 && nhomCuaCong(congApi); i += 1) await ngu(100);
	}
	if (nhomCuaCong(congApi)) await thoat(2, `KHONG DO DUOC: cong ${congApi} van ban sau khi dung API cu`);
	const con = spawn("bun", ["--preload", NAP_BLOB, "src/main.ts"], {
		cwd: join(GOC, "apps/api"),
		env: {
			...process.env,
			PORT: congApi,
			TEP_BAN_GHI_BLOB_TOKEN: KHOA_GIA,
			KHO_TAI_LIEU_BLOB_TOKEN: KHOA_NGUON_GIA,
			VERCEL_BLOB_API_URL: khoGia.url,
			TTP_BLOB_GIA: khoGia.url,
		},
		detached: true,
		stdio: ["ignore", "ignore", "ignore"],
	});
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
const toi = await db.user.findUniqueOrThrow({ where: { email: NGUOI }, select: { id: true } });
await db.member.upsert({
	where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId: toi.id } },
	create: { id: `member-${toi.id}`, organizationId: WORKSPACE_ID, userId: toi.id, role: "admin", createdAt: new Date() },
	update: { role: "admin" },
});
const slug = await suySlug(cookie);

await khoiApi();
console.log(`API cua phien do khoi lai voi kho Blob gia ${khoGia.url} cho tep truong va kho nguon`);

async function tao(duong, vao) {
	const kq = await goiApiTao(cookie, duong, vao);
	if (kq.loi) await thoat(2, `KHONG DO DUOC: ${kq.loi}`);
	return kq.gia;
}

const congTy = await tao("companies.create", { name: "Công ty An Phú otdt" });
const deal = {};
for (const ten of ["T1", "T2"]) {
	deal[ten] = await tao("deals.create", { name: `Thoả thuận ${ten} otdt`, companyId: congTy.id, ownerId: toi.id });
}
const truong = await tao("fields.create", {
	entity: "DEAL",
	label: CHU.nhanTruong,
	type: "FILE",
	showOnSheet: true,
	showOnTable: true,
});
console.log(`gieo cong ty, hai thoa thuan, truong Tep «${CHU.nhanTruong}» qua API that`);

const duongTep = join(thuMucTep, TEP_DAI);
{
	const dau = Buffer.from("%PDF-1.4\n% otdt\n");
	const duoi = Buffer.from("\n%%EOF\n");
	writeFileSync(duongTep, Buffer.concat([dau, Buffer.alloc(24 * 1024 - dau.length - duoi.length, 0x20), duoi]));
}

mkdirSync(BANG_CHUNG, { recursive: true });
const trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
datTrinhDuyet(trinhDuyet);
const host = new URL(APP).hostname;
const nguCanh = await trinhDuyet.createBrowserContext();
const qt = await nguCanh.newPage();
await qt.setCookie(
	{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	{ name: "lang", value: "vi", domain: host, path: "/" },
);
trangMo.push(qt);

async function mo(duong, cho, kho) {
	await qt.setViewport(kho);
	await qt.goto(`${APP}${duong}`, { waitUntil: "domcontentloaded", timeout: CHO_TAI });
	const dich = new URL(qt.url()).pathname;
	if (dich.startsWith("/sign-in") || dich.includes("/onboarding")) await thoat(2, `KHONG DO DUOC: ${duong} bi day ve ${dich}`);
	const thay = await qt
		.waitForFunction((c) => document.body.innerText.includes(c), { timeout: CHO_TAI }, cho)
		.then(() => true)
		.catch(() => false);
	if (!thay) await hong(`otdt man: ${duong} khong hien «${cho}»`);
	await ngu(DO.choHydrateMs);
}

async function chup(ten, chon) {
	await qt.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "center" }), chon);
	await ngu(DO.choNutMs);
	await qt.screenshot({ path: join(BANG_CHUNG, `${ten}.png`), fullPage: false });
	console.log(`anh ${ten}.png`);
}

const DO_KHUNG = (chonGoc) => {
	const goc = document.querySelector(chonGoc);
	const vung = goc?.querySelector('[data-slot="nguon-keo-tha"]');
	if (!vung) return { co: false };
	const nut = vung.querySelector(":scope > button");
	const khoi = vung.querySelector(":scope > div");
	const nhan = khoi?.firstElementChild;
	const moTa = khoi?.querySelector('[data-slot="field-description"]');
	const dong = (el) => {
		const kieu = getComputedStyle(el);
		const co = Number.parseFloat(kieu.fontSize);
		const lh = kieu.lineHeight === "normal" ? 1.2 * co : Number.parseFloat(kieu.lineHeight);
		return Math.round(el.getBoundingClientRect().height / lh);
	};
	const kv = getComputedStyle(vung);
	const trong = vung.clientWidth - Number.parseFloat(kv.paddingLeft) - Number.parseFloat(kv.paddingRight);
	const n = nut.getBoundingClientRect();
	const k = khoi.getBoundingClientRect();
	return {
		co: true,
		nutTren: n.bottom <= k.top + 1,
		cungHang: n.top < k.bottom && k.top < n.bottom && k.left >= n.right,
		dongNhan: dong(nhan),
		dongMoTa: dong(moTa),
		rongChu: Math.round(k.width),
		trong: Math.round(trong),
		phai: vung.getBoundingClientRect().right,
	};
};

const DO_HANG = () => {
	const o = document.querySelector('[data-slot="o-tep"]');
	const giaTri = o?.parentElement;
	const nhan = giaTri?.previousElementSibling;
	if (!o || !nhan) return { co: false };
	const n = nhan.getBoundingClientRect();
	const g = giaTri.getBoundingClientRect();
	let tran = null;
	let phaiCuon = window.innerWidth;
	for (let el = o.parentElement; el; el = el.parentElement) {
		const ox = getComputedStyle(el).overflowX;
		if (ox === "auto" || ox === "scroll") {
			phaiCuon = Math.min(phaiCuon, el.getBoundingClientRect().right);
			if (el.scrollWidth > el.clientWidth + 1 && tran === null) tran = el.scrollWidth - el.clientWidth;
		}
	}
	const tep = [...o.querySelectorAll("[data-tep]")];
	return {
		co: true,
		chuNhan: nhan.textContent,
		nhanCat: nhan.scrollWidth > nhan.clientWidth + 1,
		nhanTren: n.bottom <= g.top + 1,
		nhanTrai: n.right <= g.left + 1,
		leLech: Math.round(Math.abs(n.left - g.left)),
		tran,
		trangRong: document.documentElement.scrollWidth,
		soTep: tep.length,
		tepTran: tep.some((t) => t.getBoundingClientRect().right > phaiCuon + 1),
		phaiCuon,
	};
};

function xetKhung(nhan, k, mongHep) {
	if (!k.co) return loi.push(`otdt man: ${nhan} khong thay vung keo tha`);
	if (![k.dongNhan, k.dongMoTa].every(Number.isFinite)) return thoat(2, `KHONG DO DUOC: dong NaN o ${nhan}`);
	if (mongHep) {
		if (!k.nutTren) loi.push(`otdt man: ${nhan} nut canh chu`);
		if (k.rongChu < DO.chuToiThieu * k.trong) loi.push(`otdt man: ${nhan} chu hep ${k.rongChu}/${k.trong}px`);
	} else if (!k.cungHang) loi.push(`otdt man: ${nhan} khung xep doc`);
	if (k.dongNhan !== 1) loi.push(`otdt man: ${nhan} nhan ${k.dongNhan} dong`);
	if (k.dongMoTa > DO.moTaToiDa) loi.push(`otdt man: ${nhan} mo ta ${k.dongMoTa} dong`);
}

const phieu = (id) => `/${slug}/deals?record=deal:${id}`;

await mo(phieu(deal.T2.id), CHU.chuaCo, DO.lon);
const vao = await qt.$('[data-slot="o-tep"] input[type=file]');
if (!vao) await hong("otdt man: thieu o chon tep");
await vao.uploadFile(duongTep);
const len = await qt
	.waitForFunction(() => document.querySelectorAll('[data-slot="o-tep"] [data-tep]').length === 1, {
		timeout: DO.choBuocMs,
		polling: 100,
	})
	.then(() => true)
	.catch(() => false);
if (!len) await hong("otdt man: tep cua T2 khong tai len");
const hangTep = await db.fieldFile.count({ where: { fieldId: truong.id, dealId: deal.T2.id } });
if (hangTep !== 1) await hong(`otdt man: T2 co ${hangTep} hang tep`);
console.log("T2 co mot tep ten dai qua requestUpload → PUT → complete");

await mo(phieu(deal.T1.id), CHU.chuaCo, DO.hep);
const k1 = await qt.evaluate(DO_KHUNG, '[data-slot="o-tep"]');
const h1 = await qt.evaluate(DO_HANG);
console.log(`phieu 375 rong: ${JSON.stringify({ ...k1, ...h1 })}`);
xetKhung("phieu 375", k1, true);
if (!h1.co) loi.push("otdt man: phieu 375 khong thay hang Tep");
else {
	if (h1.nhanCat) loi.push("otdt man: phieu 375 nhan truong bi cat");
	if (!h1.nhanTren) loi.push("otdt man: phieu 375 nhan canh gia tri");
	if (h1.leLech > DO.leLech) loi.push(`otdt man: phieu 375 le lech ${h1.leLech}px`);
}
await chup("otdt-phieu-rong-375", '[data-slot="o-tep"]');

await mo(phieu(deal.T2.id), CHU.nutMo, DO.hep);
const k2 = await qt.evaluate(DO_KHUNG, '[data-slot="o-tep"]');
const h2 = await qt.evaluate(DO_HANG);
console.log(`phieu 375 co tep: ${JSON.stringify({ ...k2, ...h2 })}`);
xetKhung("phieu 375 co tep", k2, true);
if (h2.trangRong > DO.hep.width) loi.push(`otdt man: phieu 375 cuon ngang ${h2.trangRong}px`);
if (h2.tran !== null) loi.push(`otdt man: phieu 375 vung cuon tran ${h2.tran}px`);
if (h2.soTep !== 1) loi.push(`otdt man: phieu 375 co tep ${h2.soTep}`);
if (h2.tepTran || k2.phai > h2.phaiCuon + 1) loi.push("otdt man: phieu 375 tran phieu");
await chup("otdt-phieu-co-tep-375", '[data-slot="o-tep"]');

await mo(phieu(deal.T1.id), CHU.chuaCo, DO.lon);
const k3 = await qt.evaluate(DO_KHUNG, '[data-slot="o-tep"]');
const h3 = await qt.evaluate(DO_HANG);
console.log(`phieu 1280: ${JSON.stringify({ ...k3, ...h3 })}`);
xetKhung("phieu 1280", k3, false);
if (h3.co && !h3.nhanTrai) loi.push("otdt man: phieu 1280 nhan tren gia tri");
await chup("otdt-phieu-rong-1280", '[data-slot="o-tep"]');

const bat = await fetch(`${API}/api/trpc/taiLieuNguon.trangThai`, { headers: mu(cookie) })
	.then((r) => r.json())
	.then((j) => j?.result?.data?.bat === true)
	.catch(() => false);
if (!bat) await thoat(2, "KHONG DO DUOC: kho nguon tat");

async function moHop(kho) {
	await mo(`/${slug}/tai-lieu`, CHU.nguonTieuDe, kho);
	const bam = await qt.evaluate(() => {
		const b = document.querySelector("[data-tai-nguon]:not([disabled])");
		b?.click();
		return Boolean(b);
	});
	if (!bam) await hong("otdt man: nut tai nguon khoa hay vang");
	const thay = await qt
		.waitForFunction(() => document.querySelector('[data-hop-tai-nguon] [data-slot="nguon-keo-tha"]'), {
			timeout: DO.choBuocMs,
		})
		.then(() => true)
		.catch(() => false);
	if (!thay) await hong("otdt man: hop tai nguon khong mo");
	await ngu(DO.choNutMs);
}

const DO_HOP = () => {
	const hop = document.querySelector("[data-hop-tai-nguon]");
	return {
		tranHop: hop ? hop.scrollWidth > hop.clientWidth + 1 : true,
		trangRong: document.documentElement.scrollWidth,
	};
};

await moHop(DO.lon);
const k4 = await qt.evaluate(DO_KHUNG, "[data-hop-tai-nguon]");
console.log(`nguon 1280: ${JSON.stringify(k4)}`);
xetKhung("nguon 1280", k4, false);
await chup("otdt-nguon-1280", "[data-hop-tai-nguon]");

await moHop(DO.hep);
const k5 = await qt.evaluate(DO_KHUNG, "[data-hop-tai-nguon]");
const p5 = await qt.evaluate(DO_HOP);
console.log(`nguon 375: ${JSON.stringify({ ...k5, ...p5 })}`);
if (!k5.co) loi.push("otdt man: nguon 375 khong thay vung keo tha");
else {
	if (k5.dongNhan !== 1) loi.push(`otdt man: nguon 375 nhan ${k5.dongNhan} dong`);
	if (k5.dongMoTa > DO.moTaToiDa) loi.push(`otdt man: nguon 375 mo ta ${k5.dongMoTa} dong`);
}
if (p5.tranHop || p5.trangRong > DO.hep.width) loi.push("otdt man: nguon 375 cuon ngang");
await chup("otdt-nguon-375", "[data-hop-tai-nguon]");

console.log(`anh: ${BANG_CHUNG}`);
if (loi.length > 0) {
	for (const l of loi) console.log(l);
	await hong(`otdt man: ${loi.length} loi`);
}
await thoat(0, "otdt man: dat");
