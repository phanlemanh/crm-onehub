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
import { dungKhoGia, HOST_GIA, KHOA_GIA } from "../../truong-tep/rang/blob-gia.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const NAP_BLOB_GIA = join(GOC, "_acceptance", "truong-tep", "rang", "nap-blob-gia.mjs");
const BANG_CHUNG = (() => {
	const dat = process.env.BANG_CHUNG ?? "_acceptance/tep-theo-chu-ban-ghi/evidence";
	return isAbsolute(dat) ? dat : join(GOC, dat);
})();
const DO = {
	choHydrateMs: 1500,
	choNutMs: 600,
	choApiMs: 120_000,
	choBuocMs: 30_000,
	lon: { width: 1280, height: 900 },
	hep: { width: 375, height: 812 },
};
const NV_A = { email: "tcb-a@onehub.test", ten: "Ngô Thị Lan" };
const NV_B = { email: "tcb-b@onehub.test", ten: "Trần Văn Minh" };
const CHU = {
	tenTruong: "Hợp đồng",
	nutMo: "Mở",
	phuTrach: "Phụ trách",
	khongPhuTrach: (ten) => `Chỉ ${ten} và quản trị mở được tệp.`,
	chuaPhuTrach: "Bản ghi chưa có người phụ trách nên chỉ quản trị mở được tệp.",
	matQuyen: "Bạn không còn phụ trách bản ghi này nên không mở được tệp.",
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
const thuMucTep = mkdtempSync(join(tmpdir(), "tcb-man-"));
let apiCuaTa = null;

function nhomSong(pgid) {
	try {
		process.kill(-pgid, 0);
		return true;
	} catch {
		return false;
	}
}

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

async function thoat(ma, cau) {
	if (cau) console.log(cau);
	await dungApi(apiCuaTa);
	khoGia.dung();
	rmSync(thuMucTep, { recursive: true, force: true });
	await ket(ma);
}

const GO_LOI = join(GOC, ".acceptance-runs", "tep-theo-chu-ban-ghi");
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
	const con = spawn("bun", ["--preload", NAP_BLOB_GIA, "src/main.ts"], {
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

function cookieCua(email) {
	return chiaCookie(
		execFileSync("bun", ["run", "dev:session", email], { cwd: join(GOC, "apps/api"), encoding: "utf8" })
			.trim()
			.split("\n")
			.pop()
			.trim(),
	);
}

const cookie = phien();
const cookieA = cookieCua(NV_A.email);
const cookieB = cookieCua(NV_B.email);
const id = {};
for (const [email, role, ten] of [
	[NGUOI, "admin", null],
	[NV_A.email, "member", NV_A.ten],
	[NV_B.email, "member", NV_B.ten],
]) {
	const u = await db.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
	if (ten) await db.user.update({ where: { id: u.id }, data: { name: ten } });
	await db.member.upsert({
		where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId: u.id } },
		create: { id: `member-${u.id}`, organizationId: WORKSPACE_ID, userId: u.id, role, createdAt: new Date() },
		update: { role },
	});
	id[email] = u.id;
}
const slug = await suySlug(cookie);

await khoiApi(KHOA_GIA);
console.log(`API cua phien do khoi lai voi kho Blob gia ${khoGia.url}`);

async function tao(duong, vao) {
	const kq = await goiApiTao(cookie, duong, vao);
	if (kq.loi) await thoat(2, `KHONG DO DUOC: ${kq.loi}`);
	return kq.gia;
}

const truong = {};
for (const entity of ["DEAL", "COMPANY", "CONTACT"]) {
	truong[entity] = await tao("fields.create", {
		entity,
		label: CHU.tenTruong,
		type: "FILE",
		options: [],
		agentFilled: false,
		agentBrief: null,
		required: false,
		showOnSheet: true,
		showOnTable: true,
		showOnFilter: true,
	});
}
const congTy = await tao("companies.create", { name: "Công ty An Phú tcb", ownerId: id[NV_A.email] });
const c0 = await tao("companies.create", { name: "Công ty Bình Minh tcb", ownerId: null });
const t1 = await tao("deals.create", { name: "Thoả thuận T1 tcb", companyId: congTy.id, ownerId: id[NV_A.email] });
const p1 = await tao("contacts.create", { firstName: "Hà tcb", companyId: congTy.id, ownerId: id[NV_A.email] });
console.log("gieo ban ghi qua API that: T1 va P1 do A phu trach, C0 khong nguoi phu trach");

const pdf = (nhan) => {
	const dau = Buffer.from(`%PDF-1.4\n% ${nhan}\n`);
	const duoi = Buffer.from("\n%%EOF\n");
	return Buffer.concat([dau, Buffer.alloc(16 * 1024, 0x20), duoi]);
};
const duongTep = {};
for (const ten of ["Hợp đồng chính.pdf", "Phụ lục 01.pdf", "Hồ sơ cá nhân.pdf", "Hợp đồng Bình Minh.pdf"]) {
	const p = join(thuMucTep, ten);
	writeFileSync(p, pdf(ten));
	duongTep[ten] = p;
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
const a = await trangCua(cookieA);
const b = await trangCua(cookieB);

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

async function chup(trang, ten) {
	await trang.evaluate(() => {
		document.querySelector('[data-slot="o-tep"]')?.scrollIntoView({ block: "center" });
	});
	await ngu(DO.choNutMs);
	await trang.screenshot({ path: join(BANG_CHUNG, `${ten}.png`), fullPage: false });
	console.log(`anh ${ten}.png`);
}

const phieu = {
	deal: (x) => `/${slug}/deals?record=deal:${x}`,
	company: (x) => `/${slug}/companies?record=company:${x}`,
	contact: (x) => `/${slug}/contacts?record=contact:${x}`,
};

async function taiLen(trang, duong, tenTep, soCan) {
	await mo(trang, duong, CHU.tenTruong);
	const vao = await trang.$('[data-slot="o-tep"] input[type=file]');
	if (!vao) await hong(`tcb man: thieu o chon tep ${duong}`);
	await vao.uploadFile(...tenTep.map((t) => duongTep[t]));
	await cho(
		trang,
		(n) => document.querySelectorAll('[data-slot="o-tep"] [data-tep]').length === n,
		soCan,
		`tcb man: tai len khong du ${soCan} tep ${duong}`,
	);
}

await taiLen(qt, phieu.deal(t1.id), ["Hợp đồng chính.pdf", "Phụ lục 01.pdf"], 2);
await taiLen(qt, phieu.contact(p1.id), ["Hồ sơ cá nhân.pdf"], 1);
await taiLen(qt, phieu.company(c0.id), ["Hợp đồng Bình Minh.pdf"], 1);
console.log("quan tri tai bon PDF len ba phieu");

const xemO = (trang) =>
	trang.evaluate((m) => {
		const o = document.querySelector('[data-slot="o-tep"]');
		const nut = [...(o?.querySelectorAll("button") ?? [])].filter((x) => x.textContent?.trim() === m);
		const khoa = nut.filter((x) => x.disabled);
		const ariaDung = khoa.every((x) => {
			const idDong = x.getAttribute("aria-describedby");
			const dong = idDong ? document.getElementById(idDong) : null;
			return Boolean(dong?.textContent?.trim());
		});
		return { mo: nut.length, khoa: khoa.length, chu: o?.textContent ?? "", ariaDung };
	}, CHU.nutMo);

async function moTab(trang, tenTep) {
	const tabMoi = trinhDuyet
		.waitForTarget((t) => t.url().includes(HOST_GIA), { timeout: 8_000 })
		.catch(() => null);
	await trang.evaluate((n) => {
		[...document.querySelectorAll("button")].find((x) => x.getAttribute("aria-label") === `Mở ${n}`)?.click();
	}, tenTep);
	const dich = await tabMoi;
	if (dich) await (await dich.page())?.close().catch(() => {});
	return Boolean(dich);
}

await mo(a, phieu.deal(t1.id), CHU.nutMo);
const xA = await xemO(a);
if (xA.mo !== 2 || xA.khoa !== 0 || xA.chu.includes("mở được tệp.")) await hong(`tcb man: A truoc ${JSON.stringify(xA)}`);
await chup(a, "tcb-phu-trach-1280");
if (!(await moTab(a, "Hợp đồng chính.pdf"))) await hong("tcb man: A khong mo");

await mo(b, phieu.deal(t1.id), CHU.nutMo, DO.hep);
const xB = await xemO(b);
if (xB.khoa !== 2 || !xB.chu.includes(CHU.khongPhuTrach(NV_A.ten)) || !xB.ariaDung)
	await hong(`tcb man: B truoc ${JSON.stringify(xB)}`);
const tran = await b.evaluate(() => document.documentElement.scrollWidth);
if (tran > DO.hep.width) await hong("tcb man: 375 cuon ngang");
await chup(b, "tcb-khong-phu-trach-375");

const giuA = { bat: false, hang: [] };
await a.setRequestInterception(true);
a.on("request", (yc) => {
	if (giuA.bat && yc.url().includes("deals.byId")) giuA.hang.push(yc);
	else yc.continue().catch(() => {});
});
giuA.bat = true;
await mo(qt, phieu.deal(t1.id), CHU.phuTrach);
const idO = await qt.evaluate((nhan) => {
	const nhanEl = [...document.querySelectorAll("label[for]")].find((x) => x.textContent?.trim() === nhan);
	const o = nhanEl ? document.getElementById(nhanEl.getAttribute("for") ?? "") : null;
	o?.scrollIntoView({ block: "center" });
	return o ? o.id : null;
}, CHU.phuTrach);
const oPhuTrach = idO ? await qt.$(`[id="${idO}"]`) : null;
if (oPhuTrach) await oPhuTrach.click();
const daMo = Boolean(oPhuTrach);
if (!daMo) await hong("tcb man: khong thay o Phu trach");
await ngu(DO.choNutMs);
const luaChonB = await qt.waitForFunction(
	(ten) => [...document.querySelectorAll('[role="option"]')].find((x) => x.textContent?.includes(ten)),
	{ timeout: DO.choBuocMs },
	NV_B.ten,
).catch(() => null);
const phanTuB = luaChonB?.asElement();
if (phanTuB) await phanTuB.click();
const daChon = Boolean(phanTuB);
if (!daChon) await hong("tcb man: khong chon duoc B");
let doi = null;
for (let i = 0; i < 40 && doi !== id[NV_B.email]; i += 1) {
	doi = (await db.deal.findUnique({ where: { id: t1.id }, select: { ownerId: true } }))?.ownerId;
	if (doi !== id[NV_B.email]) await ngu(250);
}
if (doi !== id[NV_B.email]) await hong("tcb man: doi chu khong luu");
await chup(qt, "tcb-doi-chu-1280");

await a.bringToFront();
let tabTrongLuc = 0;
const demTab = (t) => {
	if (t.url().includes(HOST_GIA)) tabTrongLuc += 1;
};
trinhDuyet.on("targetcreated", demTab);
const choToast = a
	.waitForFunction((m) => document.body.innerText.includes(m), { timeout: DO.choBuocMs, polling: 50 }, CHU.matQuyen)
	.then(() => true)
	.catch(() => false);
await a.evaluate((n) => {
	[...document.querySelectorAll("button")].find((x) => x.getAttribute("aria-label") === `Mở ${n}`)?.click();
}, "Hợp đồng chính.pdf");
const coToast = await choToast;
giuA.bat = false;
for (const yc of giuA.hang.splice(0)) await yc.continue().catch(() => {});
if (!coToast) await hong("tcb man: mat quyen khong bao");
await cho(
	a,
	(ten) => {
		const o = document.querySelector('[data-slot="o-tep"]');
		return (o?.textContent ?? "").includes(ten);
	},
	CHU.khongPhuTrach(NV_B.ten),
	"tcb man: mat quyen khong neu ten B",
);
await chup(a, "tcb-mat-quyen-1280");
await ngu(2_000);
trinhDuyet.off("targetcreated", demTab);
if (tabTrongLuc > 0) await hong("tcb man: mat quyen mo tab");
const xA2 = await xemO(a);
if (xA2.khoa !== 2) await hong(`tcb man: mat quyen nut ${JSON.stringify(xA2)}`);

await mo(b, phieu.deal(t1.id), CHU.nutMo);
const xB2 = await xemO(b);
if (xB2.khoa !== 0) await hong(`tcb man: B sau ${JSON.stringify(xB2)}`);
await chup(b, "tcb-nguoi-moi-1280");
if (!(await moTab(b, "Phụ lục 01.pdf"))) await hong("tcb man: B khong mo");

await mo(b, phieu.contact(p1.id), CHU.nutMo);
const xBp = await xemO(b);
if (xBp.khoa !== 1 || !xBp.chu.includes(CHU.khongPhuTrach(NV_A.ten))) await hong(`tcb man: ca nhan B ${JSON.stringify(xBp)}`);
await chup(b, "tcb-ca-nhan-1280");
await mo(a, phieu.contact(p1.id), CHU.nutMo);
if (!(await moTab(a, "Hồ sơ cá nhân.pdf"))) await hong("tcb man: ca nhan A khong mo");

await mo(a, phieu.company(c0.id), CHU.nutMo, DO.hep);
const xC = await xemO(a);
if (xC.khoa !== 1 || !xC.chu.includes(CHU.chuaPhuTrach)) await hong(`tcb man: chua phu trach ${JSON.stringify(xC)}`);
await chup(a, "tcb-chua-phu-trach-375");

for (const duong of [phieu.deal(t1.id), phieu.company(c0.id)]) {
	await mo(qt, duong, CHU.nutMo);
	const x = await xemO(qt);
	if (x.mo === 0 || x.khoa !== 0) await hong("tcb man: quan tri bi khoa");
}
if (!xB.ariaDung || !xC.ariaDung) await hong("tcb man: aria");

console.log(`anh: ${BANG_CHUNG}`);
await thoat(0, "tcb man: dat");
