import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { dungGoiDeXuat } from "../../../apps/agent/agent/lib/okr/goi-ngu-canh.ts";
import { okrGopYMessages } from "../../../apps/app/lib/messages/okr-gop-y.ts";
import { db } from "../../../packages/db/src/index.ts";
import { xepViecTroLy } from "../../../packages/db/src/okr-tro-ly.ts";
import { TRO_LY_OKR_TRAN } from "../../../packages/validation/src/okr-tro-ly.ts";
import { datLaiGopY, dongKho, SAN } from "../../gop-y-dung-cho/rang/san-gop-y.mjs";
import { gieoGopY } from "./gieo.mjs";
import {
	chayTrongPhienCoTacTu,
	idMau,
	laKhoDo,
	napBoMau,
	phienCookie,
	thuMau,
	tre,
	trongPhienCoTacTu,
	trpc,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const ANH = join(GOC, "_acceptance/kara-gop-y-luot-2/evidence");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const GIAY_MS = 1000;
const MAN = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: [
		{ ten: "1440", rong: 1440, cao: 1000 },
		{ ten: "390", rong: 390, cao: 844 },
	],
	cho: { manMs: 120 * GIAY_MS, yenMs: 1500, hienMs: 1200, quaHanMs: TRO_LY_OKR_TRAN.tranChoMs + 5 * GIAY_MS },
	nguoiHaiKr: "hoang-yen-nhi",
	maJsonRpc: { FORBIDDEN: -32003, NOT_FOUND: -32004, INTERNAL_SERVER_ERROR: -32603 },
	chanBoi: "chan boi kara-gop-y-luot-2/man.mjs",
	soAnh: 20,
};
const m = okrGopYMessages("vi");

const dong = [];
let sai = 0;
let trinhDuyet = null;

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	await dongKho().catch(() => {});
	for (const d of dong) console.log(d);
	console.log(`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`);
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
const ghi = (cau) => dong.push(`GHI ${cau}`);

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, { redirect: "manual", headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` } });
	const dich = res.headers.get("location");
	if (!dich) return null;
	const dau = new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
	return dau && !["onboarding", "sign-in", "het-quyen"].some((x) => dau.startsWith(x)) ? dau : null;
}

async function trang(cookie, kho) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({ width: kho.rong, height: kho.cao, deviceScaleFactor: 1 });
	p.setDefaultNavigationTimeout(MAN.cho.manMs);
	p.setDefaultTimeout(MAN.cho.manMs);
	const loiConsole = [];
	p.on("console", (msg) => {
		if (msg.type() === "error") loiConsole.push(msg.text());
	});
	return { ctx, p, kho: kho.ten, cookie, loiConsole };
}

async function moKhung(t, c, id, them = "") {
	await t.p.goto(`${APP}/${c.slug}/okr/theo-don-vi?donOkr=pb:${c.g.phongBan}&record=objective:${id}${them}`, { waitUntil: "load" });
	await t.p.waitForSelector(`[data-okr-sheet="${id}"]`);
	await t.p.evaluate(() => document.fonts.ready);
}

async function chup(t, ten) {
	await tre(MAN.cho.yenMs);
	await t.p.evaluate(() => {
		for (const s of ["nextjs-portal", ".tsqd-parent-container", ".tsqd-open-btn-container"])
			for (const el of document.querySelectorAll(s)) el.remove();
	});
	const tep = join(ANH, `${ten}-${t.kho}.png`);
	await t.p.screenshot({ path: tep });
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
}

function kiemConsole(t, ten, maChan) {
	const la = t.loiConsole.filter((x) => !maChan.some((s) => x.includes(`status of ${s}`)));
	kiem(`${ten} ${t.kho}: console khong loi ngoai yeu cau bi chan (${la.length})${la.length ? ` — ${la[0]}` : ""}`, la.length === 0);
}

const loiTrpc = (duong, ma, http) => () => ({
	error: { message: MAN.chanBoi, code: MAN.maJsonRpc[ma], data: { code: ma, httpStatus: http, path: duong } },
});
const traVe = (data) => () => ({ result: { data } });

async function traLoi(t, r, thay) {
	if (r.isInterceptResolutionHandled()) return;
	const u = new URL(r.url());
	if (!u.pathname.startsWith("/api/trpc/")) return r.continue();
	const duong = decodeURIComponent(u.pathname.slice("/api/trpc/".length)).split(",");
	if (!duong.some((d) => d in thay)) return r.continue();
	if (r.method() !== "GET" && !duong.every((d) => d in thay)) {
		ghi(`lo POST tron khong chan duoc: ${duong.join(",")}`);
		return r.continue();
	}
	const vao = JSON.parse((r.method() === "GET" ? u.searchParams.get("input") : r.postData()) ?? "{}");
	const ra = await Promise.all(
		duong.map(async (d, i) => {
			if (d in thay) return thay[d](vao[String(i)]);
			const res = await fetch(`${APP}/api/trpc/${d}?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: vao[String(i)] }))}`, {
				headers: { cookie: `${t.cookie.ten}=${t.cookie.gia}; lang=vi` },
			});
			return (await res.json())[0];
		}),
	);
	const loi = ra.filter((x) => x.error);
	const status = loi.length === 0 ? 200 : loi.length === ra.length ? loi[0].error.data.httpStatus : 207;
	return r.respond({ status, contentType: "application/json", body: JSON.stringify(ra) });
}

async function chan(t, thay) {
	await t.p.setRequestInterception(true);
	t.p.on("request", (r) => void traLoi(t, r, thay));
}

const dongViec = (objectiveId, ketQua) =>
	db.agentTask.updateMany({
		where: { kind: "okr-de-xuat", finishedAt: null, payload: { path: ["objectiveId"], equals: objectiveId } },
		data: { finishedAt: new Date(), outcome: ketQua },
	});
const datVeCho = (ids) =>
	db.okrDeXuat.updateMany({ where: { id: { in: ids } }, data: { trangThai: "cho", quyetLuc: null, nguoiQuyet: null, giaTriCuoi: null } });
const lienKetCua = async (c, id) =>
	(await trpc(API, c.tr).hoi("okr.objective", { id })).alignments.map((g) => g.alignmentId);

async function chuanBi() {
	const nap = napBoMau();
	if (nap.ma !== 0) throw new Error(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	ghi(`NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
	const qt = phienCookie(thuMau(SAN.nguoi.quanTri));
	const tr = phienCookie(thuMau(SAN.nguoi.truong));
	const hy = phienCookie(thuMau(MAN.nguoiHaiKr));
	const slug = await suySlug(tr);
	if (!slug) throw new Error(`${APP}/ khong chuyen toi trang chinh cua workspace`);
	const a = idMau("mt", SAN.ma.a);
	const truongId = idMau("nguoi", SAN.nguoi.truong);
	const goi = await dungGoiDeXuat(a, truongId, { keyResultId: null, nac: "bat" });
	const dich = goi?.dichCanChinh.find((d) => d.loai === "kr") ?? goi?.dichCanChinh[0];
	if (!dich) throw new Error(`${a} khong con dich can chinh nao trong goi cua agent`);
	const g = await gieoGopY({
		api: API,
		quanTri: qt,
		themA: [
			{
				loai: "can-chinh",
				targetObjectiveId: dich.loai === "muc-tieu" ? dich.id : null,
				targetKeyResultId: dich.loai === "kr" ? dich.id : null,
				lyDo: "Mục tiêu này góp thẳng vào đích của OneHub.",
			},
		],
	});
	const [can] = g.them;
	const kr3 = await db.okrKeyResult.findUniqueOrThrow({ where: { id: g.kr3 }, select: { ownerUserId: true } });
	ghi(`GIEO A ${g.a} (3 dong + can chinh ${can}), B ${g.b} luot rong`);
	return { qt, tr, hy, slug, g, can, truongId, chuKr3: kr3.ownerUserId };
}

async function coKhung(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		await moKhung(t, c, c.g.a);
		await t.p.waitForSelector("[data-vung-kara] [data-nhom-kara=co-gop-y]");
		const o = await t.p.evaluate(() => {
			const vung = document.querySelector("[data-vung-kara]");
			const ben = document.querySelector("[data-khu=vi-sao] section");
			return {
				cungKhung: (vung?.closest("section")?.className ?? "x") === (ben?.className ?? "y"),
				tia:
					(vung?.querySelectorAll("[data-slot=kara-mark]").length ?? 0) +
					(vung?.querySelectorAll("[data-slot=proposed-change] > [data-slot=item-media]").length ?? 0),
			};
		});
		kiem(`co-khung ${t.kho}: vung cung khung vung ben canh`, o.cungKhung);
		kiem(`co-khung ${t.kho}: mot tia sang (${o.tia})`, o.tia === 1);
		await chup(t, "co-khung");
		kiemConsole(t, "co-khung", []);
	} finally {
		await t.ctx.close();
	}
}

async function neoKr(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		await moKhung(t, c, c.g.a, `&neoGopY=true&neoGopYKr=${c.g.kr3}`);
		await t.p.waitForFunction(
			(kr) => document.activeElement?.closest("[data-kara-proposal-kr]")?.getAttribute("data-kara-proposal-kr") === kr,
			{},
			c.g.kr3,
		);
		const noi = await t.p.evaluate(() => document.activeElement?.closest("[data-kara-proposal-kr]")?.getAttribute("data-highlighted"));
		kiem(`neo-kr ${t.kho}: focus va lam noi gop y cua KR3`, noi === "true");
		await chup(t, "neo-kr");
		kiemConsole(t, "neo-kr", []);
	} finally {
		await t.ctx.close();
	}
}

async function loiDong(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		await chan(t, { "okr.troLyQuyet": loiTrpc("okr.troLyQuyet", "NOT_FOUND", 404) });
		await moKhung(t, c, c.g.a);
		const sel = `[data-gop-y="${c.g.dong.vietLaiKr1}"]`;
		await t.p.waitForSelector(`${sel} [data-hanh-dong="nhan"]`);
		await t.p.click(`${sel} [data-hanh-dong="nhan"]`);
		await t.p.waitForSelector(`${sel} [data-slot=field-error]`);
		const chu = await t.p.$eval(`${sel} [data-slot=field-error]`, (e) => e.textContent ?? "");
		kiem(`loi-dong ${t.kho}: cau san pham khong con, khong ma tho («${chu}»)`, chu === m.loiDong["khong-con"] && !chu.includes(MAN.chanBoi));
		await chup(t, "loi-dong");
		kiemConsole(t, "loi-dong", [404]);
	} finally {
		await t.ctx.close();
	}
}

async function canChinh(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		const truoc = await lienKetCua(c, c.g.a);
		await moKhung(t, c, c.g.a);
		const sel = `[data-gop-y="${c.can}"]`;
		await t.p.waitForSelector(`${sel} [data-hanh-dong="can-chinh"]`);
		await t.p.click(`${sel} [data-hanh-dong="can-chinh"]`);
		await t.p.waitForSelector(`${sel} [data-slot=proposed-change-receipt] button`);
		const sauNhan = await lienKetCua(c, c.g.a);
		kiem(`can-chinh ${t.kho}: nhan tao dung mot lien ket moi (${truoc.length} -> ${sauNhan.length})`, sauNhan.length === truoc.length + 1);
		await chup(t, "can-chinh-hoan");
		await t.p.click(`${sel} [data-slot=proposed-change-receipt] button`);
		await t.p.waitForSelector(`${sel}[data-trang-thai="da-hoan-tac"]`);
		const sauHoan = await lienKetCua(c, c.g.a);
		kiem(
			`can-chinh ${t.kho}: Hoan tac ve so cu, lien ket co san con nguyen (${sauHoan.length})`,
			sauHoan.length === truoc.length && truoc.every((id) => sauHoan.includes(id)),
		);
		kiemConsole(t, "can-chinh", []);
	} finally {
		await t.ctx.close();
	}
}

async function taiLoi(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		await chan(t, { "okr.troLyDanhSach": loiTrpc("okr.troLyDanhSach", "INTERNAL_SERVER_ERROR", 500) });
		await moKhung(t, c, c.g.a);
		await t.p.waitForSelector("[data-nhom-kara=tai-loi] [data-kara-state=error] [data-slot=kara-retry]");
		kiem(`tai-loi ${t.kho}: vung con, KaraState loi co Thu lai`, true);
		await chup(t, "tai-loi");
		kiemConsole(t, "tai-loi", [500, 207]);
	} finally {
		await t.ctx.close();
	}
}

async function haiKr(c, kho) {
	await db.okrKeyResult.update({ where: { id: c.g.kr3 }, data: { ownerUserId: idMau("nguoi", MAN.nguoiHaiKr) } });
	const t = await trang(c.hy, kho);
	const biChan = [];
	t.p.on("response", (res) => {
		if (res.url().includes("okr.troLyDeXuat") && res.status() !== 200) biChan.push(res.status());
	});
	try {
		await moKhung(t, c, c.g.a);
		await t.p.waitForSelector("[data-okr-sheet] [data-gop-y]");
		const thay = await t.p.evaluate(() =>
			[...document.querySelectorAll("[data-okr-sheet] [data-gop-y]")].map((o) => o.getAttribute("data-gop-y")).sort(),
		);
		kiem(`hai-kr ${t.kho}: chi thay gop y cua KR minh (${thay.join(",")})`, JSON.stringify(thay) === JSON.stringify([c.g.dong.hoiKr3]));
		await t.p.click(`[data-gop-y="${c.g.dong.hoiKr3}"] [data-hanh-dong="bo-qua"]`);
		await t.p.waitForSelector("[data-vung-kara] [data-nut=nho-kara]:not([disabled])").catch(async (loi) => {
			const vung = await t.p.evaluate(() => {
				const v = document.querySelector("[data-vung-kara]");
				const nut = [...(v?.querySelectorAll("button") ?? [])].map((b) => `${b.textContent?.trim()}|${b.getAttribute("data-nut") ?? ""}|${b.disabled ? "khoa" : "mo"}`);
				return `${v?.textContent?.replace(/\s+/g, " ").trim() ?? "khong co vung"} · nut: ${nut.join(" ; ")}`;
			});
			const sanSang = await t.p.evaluate(async (id) => {
				const r = await fetch(`/api/trpc/okr.troLySanSang?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: { objectiveId: id } }))}`);
				return `${r.status} ${await r.text()}`;
			}, c.g.a);
			throw new Error(`${loi.message} — vung: ${vung} — troLySanSang: ${sanSang.slice(0, 400)}`);
		});
		await t.p.click("[data-vung-kara] [data-nut=nho-kara]");
		await t.p.waitForSelector("[data-vung-kara] [data-kara-state=working]");
		kiem(`hai-kr ${t.kho}: Nho Kara cho ca Muc tieu khong bi tu choi (${biChan.join(",")})`, biChan.length === 0);
		await tre(MAN.cho.hienMs);
		await chup(t, "hai-kr");
		kiemConsole(t, "hai-kr", []);
	} finally {
		await t.ctx.close();
		await dongViec(c.g.a, "loi");
		await db.okrKeyResult.update({ where: { id: c.g.kr3 }, data: { ownerUserId: c.chuKr3 } });
	}
}

async function dangDocQuaHan(c, kho) {
	await db.okrObjective.update({ where: { id: c.g.b }, data: { updatedAt: new Date() } });
	const viec = await xepViecTroLy(db, { viec: "de-xuat", objectiveId: c.g.b, keyResultId: null, nguoiYeuCau: c.truongId, nac: "bat" });
	if (!viec.bat) throw new Error(`khong xep duoc viec treo cho B: ${viec.lyDo}`);
	if (viec.dungLai) throw new Error("viec treo cho B dung lai viec da nop — khong co viec dang chay");
	const t = await trang(c.tr, kho);
	try {
		await moKhung(t, c, c.g.b);
		await t.p.waitForSelector("[data-vung-kara] [data-kara-state=working]");
		await tre(MAN.cho.hienMs);
		kiem(`dang-doc ${t.kho}: Kara dang doc`, true);
		await chup(t, "dang-doc");
		await t.p.waitForSelector("[data-vung-kara] [data-kara-state=error] [data-slot=kara-retry]", { timeout: MAN.cho.quaHanMs + MAN.cho.manMs });
		kiem(`qua-han ${t.kho}: qua tran that thi sang loi co Thu lai`, true);
		await chup(t, "qua-han");
		kiemConsole(t, "dang-doc+qua-han", []);
	} finally {
		await t.ctx.close();
		await dongViec(c.g.b, "loi");
	}
}

async function nhoLoi(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		await chan(t, { "okr.troLyDeXuat": loiTrpc("okr.troLyDeXuat", "FORBIDDEN", 403) });
		await moKhung(t, c, c.g.b);
		await t.p.waitForSelector("[data-nhom-kara=loi] [data-slot=kara-retry]");
		await t.p.click("[data-nhom-kara=loi] [data-slot=kara-retry]");
		await t.p.waitForSelector("[data-nhom-kara=nho-loi] [data-kara-state=error]");
		const moTa = await t.p.$eval("[data-nhom-kara=nho-loi] [data-slot=empty-description]", (e) => e.textContent ?? "");
		kiem(`nho-loi ${t.kho}: cau san pham cua 403 («${moTa}»)`, moTa === m.vung.nhoLoi["khong-quyen"]);
		await chup(t, "nho-loi");
		kiemConsole(t, "nho-loi", [403]);
	} finally {
		await t.ctx.close();
	}
}

async function hetLuot(c, kho) {
	const t = await trang(c.tr, kho);
	try {
		await chan(t, { "okr.troLySanSang": traVe({ bat: false, lyDo: "het-tran-ngay" }) });
		await moKhung(t, c, c.g.b);
		await t.p.waitForSelector("[data-vung-kara] [data-kara-state=off]");
		const o = await t.p.evaluate((thuLai) => {
			const vung = document.querySelector("[data-vung-kara]");
			return {
				lyDo: vung?.querySelector("[data-kara-state=off] [data-slot=field-description]")?.textContent ?? "",
				xam: [...(vung?.querySelectorAll("button[disabled]") ?? [])].filter((b) => b.textContent?.trim() === thuLai).length,
			};
		}, "Thử lại");
		kiem(`het-luot ${t.kho}: noi vi sao va khi nao mo lai, khong Thu lai xam (${o.xam})`, o.lyDo === m.vung.hetLuot && o.xam === 0);
		await chup(t, "het-luot");
		kiemConsole(t, "het-luot", []);
	} finally {
		await t.ctx.close();
	}
}

const TRANG_THAI = [
	["co-khung", coKhung],
	["neo-kr", neoKr],
	["loi-dong", loiDong],
	["can-chinh-hoan", canChinh],
	["tai-loi", taiLoi],
	["hai-kr", haiKr],
	["dang-doc+qua-han", dangDocQuaHan],
	["nho-loi", nhoLoi],
	["het-luot", hetLuot],
];

const CHI = process.argv.includes("--chi") ? (process.argv[process.argv.indexOf("--chi") + 1] ?? null) : null;
if (!trongPhienCoTacTu()) {
	console.log("-- Nho Kara can API co cau noi tac tu — mo phien do rieng co cau noi (ban do tu gieo gop y, khong can tac tu chay)");
	process.exit(await chayTrongPhienCoTacTu(`bun _acceptance/kara-gop-y-luot-2/rang/man.mjs${CHI ? ` --chi ${CHI}` : ""}`));
}
mkdirSync(ANH, { recursive: true });
const { canhCay } = await import("../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs");
const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`);
if (!laKhoDo()) await khongDo("DATABASE_URL khong phai kho do rieng — chay qua config:executors.script.k3_man");

let c;
try {
	c = await chuanBi();
} catch (loi) {
	await khongDo(`chuan bi: ${loi?.message ?? loi}`);
}

trinhDuyet = await puppeteer.launch({ executablePath: MAN.chrome, headless: true });
let buoc = "";
try {
	for (const kho of MAN.kho) {
		await datLaiGopY(c.g, { api: API, truong: c.tr });
		await datVeCho([c.can]);
		for (const [ten, lam] of TRANG_THAI.filter(([ten]) => CHI === null || ten === CHI)) {
			buoc = `${ten} ${kho.ten}`;
			await lam(c, kho);
		}
	}
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}
const soAnh = dong.filter((d) => d.startsWith("ANH")).length;
if (CHI === null) kiem(`du ${MAN.soAnh} anh (${soAnh})`, soAnh === MAN.soAnh);
await ket(sai === 0 ? 0 : 1);
