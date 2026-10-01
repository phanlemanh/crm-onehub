import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "ux-lai-thu-8c-okr";
const TAM =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", HO_SO, "man");


const { default: puppeteer } = await import("puppeteer-core");
const { chepSangBangChung } = await import("./noi-bang-chung.mjs");
const { db } = await import("../../../packages/db/src/index.ts");
const { okrGioiHanMessages } = await import(
	"../../../apps/app/lib/messages/okr-gioi-han.ts"
);
const { okrTaiCoCauMessages } = await import(
	"../../../apps/app/lib/messages/okr-tai-co-cau.ts"
);
const { okrMessages } = await import("../../../apps/app/lib/messages/okr.ts");
const { TO_CHUC } = await import(
	"../../../apps/api/src/to-chuc/to-chuc-config.ts"
);
const { toChucMessages } = await import(
	"../../../apps/app/lib/messages/to-chuc.ts"
);
const { thanhVienMessages } = await import(
	"../../../apps/app/lib/messages/settings-thanh-vien.ts"
);
const { canhCay } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
);
const { APP, CHO_TAI, CHROME, chiaCookie, datTrinhDuyet, ket, khongDo } =
	await import("../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs");
const API = process.env.API_URL ?? "http://localhost:3001";

const DO = {
	rong: 1440,
	hep: 390,
	cao: 900,
	choMs: 30_000,
	choHydrateMs: 800,
	choKhongHienMs: 1500,
	choGhiMs: 1500,
	choMoHopMs: 10_000,
	kho: [1440, 390],
	lanMoHop: 3,
	lanDiChuyen: 60,
	soMucTieuChuyen: 4,
};
const MA = `g${Date.now().toString(36).slice(-6)}`;
const LOI_BO_QUA = /Download the React DevTools/;
const LOI_NGOAI = /Hydration failed[\s\S]*AppIconRailFallback/;
const CHU = okrGioiHanMessages("vi");
const CHU_TCC = okrTaiCoCauMessages("vi");
const CHU_OKR = okrMessages("vi");
const CHU_TC = toChucMessages("vi");
const CHU_TV = thanhVienMessages("vi");
const TIEN_TO_MAU = "mau-okr-";
const MIEN_MAU = "mau.onehub.test";
const idMau = (loai, ma) => `${TIEN_TO_MAU}${loai}-${ma}`;
const dien = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
const QUY4 = idMau("chu-ky", "quy4");
const PB = { bac: idMau("pb", "kd-bac"), nam: idMau("pb", "kd-nam") };

const NGUOI = {
	quanTri: "le-hai-dang",
	truong: "nguyen-thi-lan",
	duyet: "tran-quoc-bao",
	ngoai: "vo-duc-anh",
};
const NGUOI_XEM = "tran-quoc-bao";
const NGUOI_ROI = "lu-quoc-viet";

const TEN = {
	nhap: `Khách bán lẻ miền Bắc quay lại mua ${MA}`,
	kr: "Tỷ lệ khách bán lẻ mua lại trong 60 ngày",
};
const LY_DO_TRA = `Thêm KR đo doanh thu từ khách quay lại ${MA}`;
const G = idMau("mt", "q4-phap-che-3");
const PHAP_CHE = idMau("pb", "phap-che");

const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);

const { isMeasureDatabase } = await import(
	"../../../packages/db/src/measure-database.ts"
);
const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();
if (!isMeasureDatabase(tenKho) || process.env.PHIEN_DO !== tenKho)
	await khongDo(
		`KHONG DO DUOC: can mot phien do (kho _do cua chinh phien) — kho "${tenKho}", PHIEN_DO "${process.env.PHIEN_DO ?? ""}". Chay qua scripts/lan-do/tien-de.mjs`,
	);

const cookie = {};
const id = {};
const ten = {};
const K = {};

let khang = 0;
const hong = [];
const anh = [];
const mang = [];
const loiConsole = [];
const loiNgoai = [];
let nhom = "";
const kiem = (nhan, dat) => {
	khang += 1;
	if (!dat) hong.push(nhan);
	return dat;
};
const cho = (ms) => new Promise((r) => setTimeout(r, ms));
let slug = "";
let trinhDuyet = null;
const ngu = new Map();

const phienCua = (email) =>
	chiaCookie(
		execFileSync("bun", ["run", "dev:session", email], {
			cwd: join(GOC, "apps", "api"),
			encoding: "utf8",
		})
			.trim()
			.split("\n")
			.pop()
			.trim(),
	);

const chuoiCookie = (c) => `${c.ten}=${c.gia}; lang=vi`;
const mu = (c) => ({ Cookie: chuoiCookie(c) });

async function lam(c, duong, vao) {
	const res = await fetch(`${API}/api/trpc/${duong}`, {
		method: "POST",
		redirect: "manual",
		headers: { ...mu(c), "content-type": "application/json" },
		body: JSON.stringify(vao),
	});
	const chu = await res.text();
	if (!res.ok)
		throw new Error(`${duong} tra ${res.status}: ${chu.slice(0, 300)}`);
	return JSON.parse(chu).result.data;
}

async function hoi(c, duong, vao) {
	const res = await fetch(
		`${API}/api/trpc/${duong}?input=${encodeURIComponent(JSON.stringify(vao))}`,
		{ redirect: "manual", headers: mu(c) },
	);
	const chu = await res.text();
	if (!res.ok)
		throw new Error(`${duong} tra ${res.status}: ${chu.slice(0, 300)}`);
	return JSON.parse(chu).result.data;
}

async function suySlugCua(c) {
	const res = await fetch(`${APP}/`, { redirect: "manual", headers: mu(c) });
	const dich = res.headers.get("location") ?? "";
	const dau = new URL(dich || "/", APP).pathname
		.replace(/^\/+|\/+$/g, "")
		.split("/")[0];
	if (!dau || ["sign-in", "onboarding", "het-quyen"].includes(dau))
		await khongDo(
			`KHONG DO DUOC: ${APP}/ tro ve "${dich}" — khong suy duoc slug workspace`,
		);
	return dau;
}

async function napBoMau() {
	const truoc = await db.okrCycle.count();
	if (truoc > 0)
		await khongDo(
			`KHONG DO DUOC: kho do da co ${truoc} chu ky OKR truoc khi nap bo mau — can kho sach`,
		);
	const nap = spawnSync("bun", ["scripts/okr-mau.ts"], {
		cwd: join(GOC, "apps", "api"),
		env: process.env,
		encoding: "utf8",
	});
	const dong = `${nap.stdout ?? ""}${nap.stderr ?? ""}`
		.trim()
		.split("\n")
		.at(-1);
	console.log(`  nap bo OKR mau: ma ${nap.status} — ${dong}`);
	if (nap.status !== 0)
		await khongDo(`KHONG DO DUOC: nap bo OKR mau thoat ${nap.status}: ${dong}`);
	const quy4 = await db.okrCycle.findUnique({
		where: { id: QUY4 },
		select: { phase: true },
	});
	if (quy4?.phase !== "dang-chay")
		await khongDo(
			`KHONG DO DUOC: bo mau khong co quy 4 dang chay (thay ${quy4?.phase ?? "khong co"})`,
		);
}

async function vaoNguoi() {
	for (const [k, ma] of Object.entries({
		...NGUOI,
		nguoiXem: NGUOI_XEM,
		roi: NGUOI_ROI,
	})) {
		const u = await db.user.findUnique({
			where: { email: `${ma}@${MIEN_MAU}` },
			select: { id: true, name: true },
		});
		if (!u)
			await khongDo(`KHONG DO DUOC: bo mau khong co nguoi ${ma}@${MIEN_MAU}`);
		id[k] = u.id;
		ten[k] = u.name;
		if (k in NGUOI) cookie[k] = phienCua(`${ma}@${MIEN_MAU}`);
	}
	const vai = await db.member.findMany({
		where: { userId: { in: Object.values(id) } },
		select: { userId: true, role: true },
	});
	const vaiCua = new Map(vai.map((v) => [v.userId, v.role]));
	console.log(
		`  nguoi mau: ${Object.keys(NGUOI)
			.map((k) => `${k}=${ten[k]} (${vaiCua.get(id[k])})`)
			.join(", ")}; nguoi xem ${ten.nguoiXem}; nguoi se roi ${ten.roi}`,
	);
	if (vaiCua.get(id.quanTri) !== "admin" || vaiCua.get(id.ngoai) !== "member")
		await khongDo(
			"KHONG DO DUOC: vai cua nguoi mau khong dung (can quanTri=admin, ngoai=member)",
		);
}

const NHI_PHAN = new Set(["Font", "Image", "Media"]);

async function ghiMang(trang, may) {
	const cdp = await trang.createCDPSession();
	await cdp.send("Network.enable", {
		maxTotalBufferSize: 200_000_000,
		maxResourceBufferSize: 50_000_000,
	});
	const cuaCho = new Map();
	cdp.on("Network.responseReceived", (e) =>
		cuaCho.set(e.requestId, {
			url: e.response.url,
			loai: e.type,
			ma: e.response.status,
		}),
	);
	cdp.on("Network.loadingFinished", (e) => {
		const r = cuaCho.get(e.requestId);
		if (!r) return;
		may.dang += 1;
		cdp
			.send("Network.getResponseBody", { requestId: e.requestId })
			.then((b) => {
				may.phan.push({
					...r,
					than: b.base64Encoded
						? Buffer.from(b.body, "base64").toString("utf8")
						: b.body,
				});
			})
			.catch((loi) => {
				may.hong += 1;
				if (!NHI_PHAN.has(r.loai)) may.hongChu += 1;
				may.khongDoc.push(
					`${r.ma} ${r.loai} ${r.url.slice(0, 140)} (${String(loi?.message ?? loi).slice(0, 80)})`,
				);
			})
			.finally(() => {
				may.dang -= 1;
			});
	});
}

async function nguCua(khoa) {
	const co = ngu.get(khoa);
	if (co) return co;
	const ctx = await trinhDuyet.createBrowserContext();
	const host = new URL(APP).hostname;
	await ctx.setCookie(
		{
			name: cookie[khoa].ten,
			value: cookie[khoa].gia,
			domain: host,
			path: "/",
		},
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	ngu.set(khoa, ctx);
	return ctx;
}

async function trangMoi(khoa, rong, tuy = {}) {
	const ctx = await nguCua(khoa);
	const trang = await ctx.newPage();
	const ghi = (d) => mang.push(`${new Date().toISOString()} ${khoa} ${d}`);
	const tenNhom = nhom;
	trang.on("pageerror", (e) => {
		ghi(`pageerror ${String(e).slice(0, 3000)}`);
		if (LOI_NGOAI.test(String(e))) {
			loiNgoai.push(`${tenNhom} ${khoa}: hydrat thanh bieu tuong`);
			return;
		}
		loiConsole.push(`${tenNhom} ${khoa}: pageerror ${String(e).slice(0, 200)}`);
	});
	trang.on("console", (m) => {
		if (m.type() !== "error") return;
		const t = m.text();
		ghi(`console.error ${t.slice(0, 300)}`);
		if (LOI_BO_QUA.test(t)) return;
		if (process.env.CHIEU_DO) return;
		if (trang.boQua?.test(t)) return;
		loiConsole.push(
			`${tenNhom} ${khoa} ${trang.url()}: console.error ${t.slice(0, 200)}`,
		);
	});
	trang.on("requestfailed", (r) =>
		ghi(`requestfailed ${r.url()} ${r.failure()?.errorText ?? ""}`),
	);
	trang.on("response", (r) => {
		if (r.status() >= 400)
			ghi(`${r.status()} ${r.request().method()} ${r.url()}`);
	});
	await trang.evaluateOnNewDocument(() => {
		window.__hien = (e) => {
			let x = e;
			while (x && getComputedStyle(x).display === "contents")
				x = x.parentElement;
			return x ? x.checkVisibility() : false;
		};
		window.__tim = (s) =>
			[...document.querySelectorAll(s)].filter((e) => window.__hien(e));
	});
	await trang.setViewport({ width: rong, height: DO.cao });
	if (tuy.may) await ghiMang(trang, tuy.may);
	if (tuy.truocKhiMo) await tuy.truocKhiMo(trang);
	if (tuy.boQua) trang.boQua = tuy.boQua;
	return trang;
}

async function goDevtools(trang) {
	await trang
		.evaluate(() => {
			for (const e of document.querySelectorAll(
				"nextjs-portal, .tsqd-parent-container, .tsqd-open-btn-container",
			))
				e.remove();
		})
		.catch(() => null);
}

async function diToi(trang, url) {
	await trang.goto(url, { waitUntil: "load", timeout: CHO_TAI });
	await trang
		.waitForNetworkIdle({ idleTime: 500, timeout: DO.choMs })
		.catch(() => null);
	await cho(DO.choHydrateMs);
	await goDevtools(trang);
}

async function moTrang(khoa, rong, duong, tuy = {}) {
	const trang = await trangMoi(khoa, rong, tuy);
	await diToi(trang, `${APP}/${slug}${duong}`);
	return trang;
}

const thayTrong = (trang, ms, fn, ...doiSo) =>
	trang
		.waitForFunction(fn, { timeout: ms, polling: 200 }, ...doiSo)
		.then(() => true)
		.catch(() => false);
const thayNgay = (trang, fn, ...doiSo) =>
	thayTrong(trang, DO.choMs, fn, ...doiSo);

async function doi(trang, nhan, fn, ...doiSo) {
	return kiem(
		`${nhan}: het ${DO.choMs}ms van chua thay`,
		await thayNgay(trang, fn, ...doiSo),
	);
}

const coMat = (trang, sel, nhan = `co ${sel}`) =>
	doi(trang, nhan, (s) => window.__tim(s).length > 0, sel);
const coSel = (trang, sel) =>
	trang.evaluate((s) => window.__tim(s).length > 0, sel);
const chuSel = (trang, sel) =>
	trang.evaluate(
		(s) => window.__tim(s)[0]?.innerText?.replace(/\s+/g, " ").trim() ?? "",
		sel,
	);
const nutTat = (trang, sel) =>
	trang.evaluate((s) => window.__tim(s)[0]?.disabled ?? null, sel);
const chuTrang = (trang) =>
	trang.evaluate(() => document.body.innerText.replace(/\s+/g, " "));

async function bamEl(tay, nhan) {
	const el = tay.asElement();
	if (!el) return kiem(`${nhom}: khong thay ${nhan} de bam`, false);
	try {
		await el.click();
	} catch {
		await el.evaluate((e) => e.click());
	}
	return true;
}

async function bamIm(trang, sel) {
	await trang.bringToFront();
	const el = (
		await trang.evaluateHandle((s) => window.__tim(s)[0] ?? null, sel)
	).asElement();
	if (!el) return false;
	try {
		await el.click();
	} catch {
		await el.evaluate((e) => e.click());
	}
	return true;
}

async function bam(trang, sel) {
	await trang.bringToFront();
	return bamEl(
		await trang.evaluateHandle((s) => window.__tim(s)[0] ?? null, sel),
		sel,
	);
}

async function bamChu(trang, sel, chu) {
	await trang.bringToFront();
	return bamEl(
		await trang.evaluateHandle(
			(s, c) =>
				window
					.__tim(s)
					.find((e) => e.innerText.replace(/\s+/g, " ").trim() === c) ?? null,
			sel,
			chu,
		),
		`${sel} chu «${chu}»`,
	);
}

const HOP_MO = "[data-state='open'] [cmdk-input]";
const LUA_CHON_MO = "[data-state='open'] [role='option']";

const hopDangMo = (trang, triggerSel) =>
	trang.evaluate(
		(s) => window.__tim(s)[0]?.getAttribute("aria-expanded") === "true",
		triggerSel,
	);

async function moHopLyDo(trang, triggerSel) {
	if (
		!(await thayNgay(
			trang,
			(s) => window.__tim(s)[0]?.disabled === false,
			triggerSel,
		))
	)
		return `${triggerSel} van khoa sau ${DO.choMs}ms (danh sach chua tai)`;
	for (let lan = 0; lan < DO.lanMoHop; lan += 1) {
		if (
			!(await hopDangMo(trang, triggerSel)) &&
			!(await bamIm(trang, triggerSel))
		)
			return `khong thay ${triggerSel} de bam`;
		const mo = await thayTrong(
			trang,
			DO.choMoHopMs,
			(s, o) =>
				window.__tim(s)[0]?.getAttribute("aria-expanded") === "true" &&
				window.__tim(o).length > 0,
			triggerSel,
			HOP_MO,
		);
		if (mo) return null;
	}
	return `hop chon cua ${triggerSel} khong mo sau ${DO.lanMoHop} lan`;
}

async function goTim(trang, chu) {
	for (let lan = 0; lan < DO.lanMoHop; lan += 1) {
		const el = (
			await trang.evaluateHandle((s) => window.__tim(s)[0] ?? null, HOP_MO)
		).asElement();
		if (!el) return false;
		await el.evaluate((e) => {
			e.focus();
			e.select();
		});
		await trang.keyboard.press("Backspace");
		await el.type(chu, { delay: 20 });
		if (
			await thayTrong(
				trang,
				DO.choMoHopMs,
				(s, c) => document.querySelector(s)?.value === c,
				HOP_MO,
				chu,
			)
		)
			return true;
	}
	return false;
}

async function chonLyDo(trang, triggerSel, tenMuc, timChu = tenMuc) {
	let daGo = false;
	for (let lan = 0; lan < DO.lanMoHop && !daGo; lan += 1) {
		const loiMo = await moHopLyDo(trang, triggerSel);
		if (loiMo) return loiMo;
		daGo = await goTim(trang, timChu);
	}
	const coMuc = await thayNgay(
		trang,
		(s, c) =>
			window
				.__tim(s)
				.some((o) => o.innerText.replace(/\s+/g, " ").trim().startsWith(c)),
		LUA_CHON_MO,
		tenMuc,
	);
	if (coMuc)
		for (let i = 0; i < DO.lanDiChuyen; i += 1) {
			const { dangChon, tieuDiem } = await trang.evaluate(
				(s, o) => ({
					dangChon:
						window
							.__tim(`${s}[aria-selected='true']`)[0]
							?.innerText.replace(/\s+/g, " ")
							.trim() ?? null,
					tieuDiem: document.activeElement?.matches(o) === true,
				}),
				LUA_CHON_MO,
				HOP_MO,
			);
			if (!tieuDiem) break;
			if (dangChon?.startsWith(tenMuc)) {
				await trang.keyboard.press("Enter");
				return null;
			}
			await trang.keyboard.press("ArrowDown");
		}
	const thay = await trang.evaluate(
		(o, l) => ({
			o: document.querySelector(o)?.value ?? null,
			luaChon: window
				.__tim(l)
				.slice(0, 6)
				.map((x) => x.innerText.replace(/\s+/g, " ").trim()),
			rong: window.__tim("[cmdk-empty]").map((e) => e.innerText.trim()),
			tieuDiem: document.activeElement?.outerHTML.slice(0, 120) ?? null,
		}),
		HOP_MO,
		LUA_CHON_MO,
	);
	if (await hopDangMo(trang, triggerSel)) await trang.keyboard.press("Escape");
	return `khong ${coMuc ? "di toi" : "co"} lua chon «${tenMuc}» o ${triggerSel} (go «${timChu}» ${daGo ? "dung" : "lech"}; hop dang co ${JSON.stringify(thay)})`;
}

async function chonHop(trang, triggerSel, tenMuc, timChu = tenMuc) {
	const loi = await chonLyDo(trang, triggerSel, tenMuc, timChu);
	if (loi) return kiem(`${nhom}: ${loi}`, false);
	await cho(300);
	return true;
}

async function chup(trang, tenAnh) {
	await goDevtools(trang);
	const rong = await trang.evaluate(() => [
		document.documentElement.scrollWidth,
		window.innerWidth,
	]);
	kiem(
		`${tenAnh}: tran ngang scrollWidth ${rong[0]} > innerWidth ${rong[1]}`,
		rong[0] <= rong[1],
	);
	const hopTran = await trang.evaluate(() =>
		window
			.__tim("[role='dialog'], [role='alertdialog']")
			.filter((h) => h.scrollWidth > h.clientWidth + 1)
			.map((h) => `${h.scrollWidth}>${h.clientWidth}`),
	);
	kiem(
		`${tenAnh}: hop tran ngang ${JSON.stringify(hopTran)}`,
		hopTran.length === 0,
	);
	await cho(300);
	await trang.screenshot({ path: join(TAM, tenAnh) });
	anh.push(tenAnh);
}

async function kho(trang, rong) {
	await trang.setViewport({ width: rong, height: DO.cao });
	await cho(DO.choKhongHienMs);
}

const SHEET = (mt) => `[data-okr-sheet='${mt}']`;
const TRAN_DO = 5;

async function moSheet(trang, mt, nhan) {
	if (
		!(await coMat(
			trang,
			`[data-mo-muc-tieu='${mt}']`,
			`${nhan}: nut mo muc tieu ${mt}`,
		))
	)
		return false;
	await bam(trang, `[data-mo-muc-tieu='${mt}']`);
	return doi(
		trang,
		`${nhan}: khung muc tieu ${mt} tai xong`,
		(s) => window.__tim(`${s}[data-dau-khung]`).length > 0,
		SHEET(mt),
	);
}

async function tapMo(pb) {
	const ds = await db.okrObjective.findMany({
		where: {
			departmentId: pb,
			status: { not: "da-bo" },
			cycle: { phase: { in: ["lap-ke-hoach", "dang-chay", "cham-diem"] } },
		},
		select: { id: true },
		orderBy: { createdAt: "asc" },
	});
	return ds.map((d) => d.id);
}

function chepBangChung() {
	if (process.env.CHIEU_DO || hong.length > 0 || anh.length === 0) {
		console.log(
			`  bang chung: ${anh.length} anh o ${relative(GOC, TAM)}/ · KHONG chep sang evidence/ (${process.env.CHIEU_DO ? "chieu do" : hong.length > 0 ? "lan chay co hong" : "khong co anh"})`,
		);
		return;
	}
	chepSangBangChung(
		anh.map((a) => join(TAM, a)),
		anh.map((a) => join("man", a)),
	);
}

const MUI_GIO = "Asia/Ho_Chi_Minh";
const ngayThang = (d) => {
	const p = new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "2-digit",
		timeZone: MUI_GIO,
	}).formatToParts(d);
	const lay = (k) => p.find((x) => x.type === k)?.value ?? "";
	return `${lay("day")}/${lay("month")}`;
};

async function haiKho(trang, ten, conMat, moLai) {
	for (const rong of DO.kho) {
		await kho(trang, rong);
		if (moLai && !(await dangHien(trang, conMat))) await moLai();
		if (
			conMat &&
			!(await coMat(trang, conMat, `${ten} ${rong}: con ${conMat}`))
		)
			return;
		if (conMat)
			kiem(
				`${ten} ${rong}: ${conMat} nam tren cung, khong bi che`,
				await dangHien(trang, conMat),
			);
		await chup(trang, `E15-${ten}-${rong}.png`);
	}
	await kho(trang, DO.rong);
	if (moLai && !(await dangHien(trang, conMat))) {
		await moLai();
		await coMat(trang, conMat, `${ten}: mo lai ${conMat}`);
	}
}

async function dangHien(trang, sel) {
	return trang.evaluate((s) => {
		const el = window.__tim(s)[0];
		if (!el) return false;
		el.scrollIntoView({ block: "center", inline: "nearest" });
		const r = el.getBoundingClientRect();
		const tren = document.elementFromPoint(
			r.left + Math.min(r.width / 2, 8),
			r.top + r.height / 2,
		);
		return tren !== null && (el === tren || el.contains(tren));
	}, sel);
}

async function soMucTieuQ4(pb) {
	return db.okrObjective.count({
		where: {
			cycleId: QUY4,
			level: "phong-ban",
			departmentId: pb,
			status: { not: "da-bo" },
		},
	});
}

async function buocDanhSach() {
	nhom = "danh-sach-gioi-han";
	const t = await moTrang(
		"duyet",
		DO.rong,
		`/okr/theo-don-vi?donOkr=pb:${PHAP_CHE}`,
	);
	const nhan = `[data-muc-tieu='${G}'] [data-nhan-gioi-han]`;
	await coMat(t, nhan, `${nhom}: the G co nhan Gioi han`);
	const chuNhan = await chuSel(t, nhan);
	kiem(
		`${nhom}: nhan «${CHU.nhan.gioiHan}» (thay «${chuNhan}»)`,
		chuNhan === CHU.nhan.gioiHan,
	);
	const cay = await t.evaluate(
		() =>
			window
				.__tim("[role='treeitem']")
				.map((e) => e.innerText.replace(/\s+/g, " ").trim())
				.find((x) => x.startsWith("Pháp chế")) ?? "",
	);
	kiem(
		`${nhom}: cay ghi Phap che «${CHU_OKR.demMucTieu(3)}» (thay «${cay}»)`,
		cay.includes(CHU_OKR.demMucTieu(3)),
	);
	await haiKho(t, nhom, nhan);
	await t.close();
}

async function buocDangTai() {
	nhom = "theo-don-vi-dang-tai";
	const t = await trangMoi("duyet", DO.rong);
	const giu = [];
	let chan = false;
	await t.setRequestInterception(true);
	t.on("request", (r) => {
		if (chan && r.url().includes("okr.danhSach")) giu.push(r);
		else r.continue().catch(() => null);
	});
	await diToi(t, `${APP}/${slug}/okr/theo-don-vi?donOkr=pb:${PHAP_CHE}`);
	await coMat(
		t,
		`[data-muc-tieu='${G}']`,
		`${nhom}: danh sach Phap che tai xong`,
	);
	chan = true;
	await bamEl(
		await t.evaluateHandle(
			() =>
				window
					.__tim("[role='treeitem']")
					.find((e) => e.innerText.trim().startsWith("Kho vận")) ?? null,
		),
		"don vi Kho van",
	);
	await doi(
		t,
		`${nhom}: khung xuong aria-busy`,
		() => window.__tim("[aria-busy='true']").length > 0,
	);
	const khung = await t.evaluate(
		(g) => ({
			cuG: window.__tim(`[data-muc-tieu='${g}']`).length,
			rong: window.__tim("[data-trang-thai='ST-donvi-rong']").length,
			chu:
				window.__tim("[aria-busy='true'] [role='status']")[0]?.innerText ?? "",
		}),
		G,
	);
	kiem(
		`${nhom}: dang tai khong con the G cua Phap che (thay ${khung.cuG})`,
		khung.cuG === 0,
	);
	kiem(
		`${nhom}: dang tai khong hien trang thai rong (thay ${khung.rong})`,
		khung.rong === 0,
	);
	kiem(
		`${nhom}: dang tai neu «${CHU_OKR.dangTai}» (thay «${khung.chu}»)`,
		khung.chu === CHU_OKR.dangTai,
	);
	await haiKho(t, nhom, "[aria-busy='true']");
	const cayKho = await t.evaluate(
		() =>
			window
				.__tim("[role='treeitem']")
				.map((e) => e.innerText.replace(/\s+/g, " ").trim())
				.find((x) => x.startsWith("Kho vận")) ?? "",
	);
	const soKho = Number((cayKho.match(/(\d+)/) ?? [])[1] ?? Number.NaN);
	chan = false;
	for (const r of giu) await r.continue().catch(() => null);
	await doi(
		t,
		`${nhom}: giai xong thi het khung xuong`,
		() => window.__tim("[aria-busy='true']").length === 0,
	);
	const theSau = await t.evaluate(() =>
		window.__tim("[data-muc-tieu]").map((e) => e.getAttribute("data-muc-tieu")),
	);
	const hang = await db.okrObjective.findMany({
		where: { id: { in: theSau } },
		select: { status: true, department: { select: { name: true } } },
	});
	const congBo = hang.filter((h) => h.status === "cong-bo").length;
	const ngoaiKho = hang.filter((h) => h.department?.name !== "Kho vận").length;
	kiem(
		`${nhom}: giai xong hien ${theSau.length} the, deu cua Kho van (ngoai ${ngoaiKho}), ${congBo} the cong-bo bang so cay ${soKho} (cay «${cayKho}»)`,
		theSau.length > 0 &&
			ngoaiKho === 0 &&
			Number.isInteger(soKho) &&
			congBo === soKho,
	);
	await t.close();
}

async function taoNhapRong() {
	const mt = await lam(cookie.truong, "okr.createObjective", {
		cycleId: QUY4,
		unit: { level: "phong-ban", departmentId: PB.bac },
		title: TEN.nhap,
		kind: "cam-ket",
		ownerUserId: id.truong,
		participantIds: [],
		whyNow: "",
	});
	return mt.id;
}

async function themKr(mt) {
	await lam(cookie.truong, "okr.createKeyResult", {
		objectiveId: mt,
		title: TEN.kr,
		kind: "tang-toi",
		ownerUserId: id.truong,
		startValue: 0,
		targetValue: 40,
		currentValue: 0,
		unit: "%",
		dueOn: null,
		weight: 1,
	});
}

async function moKhung(ai, mt, ten) {
	const t = await moTrang(ai, DO.rong, `/okr/theo-don-vi?donOkr=pb:${PB.bac}`);
	await moSheet(t, mt, ten);
	return t;
}

async function buocDuyet() {
	nhom = "gui-duyet-khoa";
	K.nhap = await taoNhapRong();
	let t = await moKhung("truong", K.nhap, nhom);
	const lyDoSel = `${SHEET(K.nhap)} [data-ly-do-gui-khoa]`;
	await coMat(t, lyDoSel, `${nhom}: dong ly do khoa`);
	const lyDo = await chuSel(t, lyDoSel);
	kiem(
		`${nhom}: ly do «${CHU.duyet.canKr}» (thay «${lyDo}»)`,
		lyDo === CHU.duyet.canKr,
	);
	kiem(
		`${nhom}: nut Gui duyet khoa`,
		(await nutTat(t, `${SHEET(K.nhap)} [data-nut='gui-duyet']`)) === true,
	);
	await haiKho(t, nhom, lyDoSel);
	await t.close();

	nhom = "gui-duyet-hoi";
	await themKr(K.nhap);
	t = await moKhung("truong", K.nhap, nhom);
	await bam(t, `${SHEET(K.nhap)} [data-nut='gui-duyet']`);
	await coMat(t, "[role='alertdialog']", `${nhom}: hop hoi gui`);
	const mong = dien(CHU.duyet.seDuyet, { nguoi: ten.duyet });
	const hoiChu = await chuSel(t, "[role='alertdialog']");
	kiem(`${nhom}: hop co «${mong}» (thay «${hoiChu}»)`, hoiChu.includes(mong));
	await haiKho(t, nhom, "[role='alertdialog']", () =>
		bam(t, `${SHEET(K.nhap)} [data-nut='gui-duyet']`),
	);
	await bamChu(t, "[role='alertdialog'] button", CHU.duyet.hoiGui.nut);
	await doi(
		t,
		`${nhom}: dai cho nguoi gui`,
		(s) => window.__tim(s).length > 0,
		`${SHEET(K.nhap)} [data-dai='cho-nguoi-gui']`,
	);
	await t.close();

	nhom = "cong-bo-phu";
	await lam(cookie.duyet, "okr.traLaiMucTieu", {
		objectiveId: K.nhap,
		lyDo: LY_DO_TRA,
	});
	t = await moKhung("duyet", K.nhap, nhom);
	const nutCb = `${SHEET(K.nhap)} [data-nut='cong-bo']`;
	await doi(
		t,
		`${nhom}: Cong bo dang phu cho nguoi vua tra lai`,
		(s) => window.__tim(s)[0]?.getAttribute("data-variant") === "outline",
		nutCb,
	);
	await haiKho(t, nhom, nutCb);
	await t.close();

	nhom = "tra-lai-truoc";
	await lam(cookie.truong, "okr.guiDuyet", { id: K.nhap });
	const [traLai] = await db.okrTrail.findMany({
		where: { objectiveId: K.nhap, action: "tra-lai" },
		orderBy: { at: "desc" },
		take: 1,
		select: { at: true },
	});
	t = await moKhung("duyet", K.nhap, nhom);
	const dong = `${SHEET(K.nhap)} [data-lan-tra-lai-truoc]`;
	const dau = dien(CHU.duyet.lanTruocBan, {
		ngay: ngayThang(traLai?.at ?? new Date()),
	});
	await doi(
		t,
		`${nhom}: dai neu «${dau}»`,
		(s, d) => (window.__tim(s)[0]?.innerText ?? "").startsWith(d),
		dong,
		dau,
	);
	const chuDong = await chuSel(t, dong);
	kiem(
		`${nhom}: dai co ly do tra lai (thay «${chuDong}»)`,
		chuDong.includes(LY_DO_TRA),
	);
	await haiKho(t, nhom, dong);

	nhom = "vet-tra-lai";
	const moVet = async () =>
		bamEl(
			await t.evaluateHandle(
				(s, c) =>
					window
						.__tim(`${s} [role='tab']`)
						.find((e) => e.innerText.trim().startsWith(c)) ?? null,
				SHEET(K.nhap),
				CHU_OKR.sheet.tabVet,
			),
			"tab Vet",
		);
	await moVet();
	const vet = `${SHEET(K.nhap)} [data-ly-do-vet]`;
	await coMat(t, vet, `${nhom}: dong Tra lai co ly do`);
	const chuVet = await chuSel(t, vet);
	kiem(
		`${nhom}: ly do trong Vet «${LY_DO_TRA}» (thay «${chuVet}»)`,
		chuVet === LY_DO_TRA,
	);
	await haiKho(t, nhom, vet, moVet);
	await t.close();
}

async function moHopLuuTru(t) {
	await bamEl(
		await t.evaluateHandle(
			(s, m) =>
				window.__tim(`${s} button`).find((b) => b.textContent.includes(m)) ??
				null,
			`[data-chi-tiet='phong-ban'][data-phong-ban='${PB.bac}']`,
			dien(CHU_TC.menu, { ten: "" }),
		),
		"menu phong ban",
	);
	await doi(
		t,
		`${nhom}: menu co «${CHU_TC.luuTru}»`,
		(c) =>
			window.__tim("[role='menuitem']").some((e) => e.innerText.trim() === c),
		CHU_TC.luuTru,
	);
	await bamChu(t, "[role='menuitem']", CHU_TC.luuTru);
}

async function dongHopDangMo(t) {
	await t.evaluate(
		(huy) => {
			for (const hop of document.querySelectorAll(
				"[data-hop='luu-tru-chan'], [data-hop='chuyen-okr']",
			))
				[...hop.querySelectorAll("button")]
					.find((b) => huy.includes(b.innerText.trim()))
					?.click();
		},
		[CHU_TCC.toChuc.chan.huy, CHU_TCC.chuyen.huy],
	);
	await doi(
		t,
		`${nhom}: hop cu da dong`,
		() =>
			window.__tim("[data-hop='luu-tru-chan'], [data-hop='chuyen-okr']")
				.length === 0,
	);
}

async function buocLuuTruChuyen() {
	nhom = "luu-tru-hai-dieu-kien";
	const soNam = await soMucTieuQ4(PB.nam);
	await lam(cookie.quanTri, "okr.setProgram", {
		objectiveCap: TRAN_DO,
		capMode: "canh-bao",
	});
	const mo = await tapMo(PB.bac);
	const moQ4 = await db.okrObjective.count({
		where: { id: { in: mo }, cycleId: QUY4 },
	});
	const soNguoi = await db.orgPlacement.count({
		where: { primaryDepartmentId: PB.bac },
	});
	console.log(
		`  gieo: KD Bac ${mo.length} muc tieu mo (${moQ4} o quy 4), ${soNguoi} nguoi chinh; KD Nam ${soNam} muc tieu quy 4, tran ${TRAN_DO}`,
	);
	const mongLyDo = [
		["nguoi", TO_CHUC.thongDiep.phongBanConNguoi(soNguoi)],
		["okr", TO_CHUC.thongDiep.phongBanConOkrMo(mo.length)],
	];
	const xem = await hoi(cookie.quanTri, "org.luuTruXemTruoc", { id: PB.bac });
	kiem(
		`${nhom}: xem truoc tra dung hai ly do dem doc lap (thay ${JSON.stringify(xem.lyDo)})`,
		JSON.stringify(xem.lyDo.map((l) => [l.loai, l.cau])) ===
			JSON.stringify(mongLyDo),
	);
	const t = await moTrang(
		"quanTri",
		DO.rong,
		`/settings/organization?don=pb:${PB.bac}`,
	);
	await moHopLuuTru(t);
	await doi(
		t,
		`${nhom}: hop neu ${mongLyDo.length} ly do`,
		(n) => window.__tim("[data-ly-do-chan]").length === n,
		mongLyDo.length,
	);
	const dongHop = await t.evaluate(() =>
		window
			.__tim("[data-ly-do-chan]")
			.map((e) => [e.getAttribute("data-ly-do-chan"), e.innerText.trim()]),
	);
	kiem(
		`${nhom}: hop neu «còn ${mo.length} mục tiêu» va «còn ${soNguoi} người» (thay ${JSON.stringify(dongHop)})`,
		JSON.stringify(dongHop) === JSON.stringify(mongLyDo),
	);
	kiem(
		`${nhom}: nut luu tru khoa`,
		(await nutTat(t, "[data-nut='luu-tru-khoa']")) === true,
	);
	await haiKho(t, nhom, "[data-hop='luu-tru-chan']", async () => {
		await dongHopDangMo(t);
		await moHopLuuTru(t);
	});

	nhom = "chuyen-vuot-tran";
	const tenNam =
		(
			await db.department.findUnique({
				where: { id: PB.nam },
				select: { name: true },
			})
		)?.name ?? PB.nam;
	const moChuyen = async () => {
		await bam(
			t,
			"[data-hop='luu-tru-chan'] [data-nut='chuyen-okr-tu-luu-tru']",
		);
		await doi(
			t,
			`${nhom}: hop chuyen liet ${mo.length} muc tieu`,
			(n) =>
				window.__tim("[data-hop='chuyen-okr'] [data-muc-tieu-chuyen]")
					.length === n,
			mo.length,
		);
		await chonHop(t, "[data-hop='chuyen-okr'] [role='combobox']", tenNam);
	};
	await moChuyen();
	const soSau = soNam + moQ4;
	kiem(
		`${nhom}: gieo vuot tran (${soSau} > ${TRAN_DO})`,
		soSau > TRAN_DO,
	);
	const tran = await hoi(cookie.quanTri, "okr.chuyenDonViXemTruoc", {
		objectiveIds: mo,
		denDonVi: { level: "phong-ban", id: PB.nam },
	});
	kiem(
		`${nhom}: xem truoc tra {soSau ${soSau}, tran ${TRAN_DO}} dem doc lap (thay ${JSON.stringify(tran)})`,
		tran.vuotTran?.soSau === soSau && tran.vuotTran?.tran === TRAN_DO,
	);
	const mong = dien(CHU_TCC.chuyen.seVuotTran, {
		ten: tenNam,
		n: soSau,
		tran: TRAN_DO,
	});
	await doi(
		t,
		`${nhom}: canh bao «${mong}»`,
		(s, c) => (window.__tim(s)[0]?.innerText ?? "").includes(c),
		"[data-canh-bao-tran]",
		mong,
	);
	await haiKho(t, nhom, "[data-canh-bao-tran]", async () => {
		await dongHopDangMo(t);
		await moHopLuuTru(t);
		await moChuyen();
	});
	await t.close();
}

async function buocGoNguoi() {
	nhom = "go-nguoi-co-okr";
	const xem = await hoi(cookie.quanTri, "okr.transferPreview", {
		fromUserId: id.roi,
	});
	kiem(
		`${nhom}: nguoi se go con OKR (thay ${JSON.stringify(xem)})`,
		xem.kr + xem.mucTieu > 0,
	);
	const t = await moTrang(
		"quanTri",
		DO.rong,
		`/settings/members?q=${encodeURIComponent(ten.roi)}`,
	);
	await doi(
		t,
		`${nhom}: hang ${ten.roi}`,
		(n) =>
			[...document.querySelectorAll("tr")].some((r) => r.innerText.includes(n)),
		ten.roi,
	);
	await bamEl(
		await t.evaluateHandle(
			(n) =>
				[...document.querySelectorAll("tr")]
					.find((r) => r.innerText.includes(n))
					?.querySelector("[aria-haspopup='menu']") ?? null,
			ten.roi,
		),
		"menu nguoi",
	);
	await doi(
		t,
		`${nhom}: menu co «${CHU_TV.go}»`,
		(c) =>
			window.__tim("[role='menuitem']").some((e) => e.innerText.trim() === c),
		CHU_TV.go,
	);
	await bamChu(t, "[role='menuitem']", CHU_TV.go);
	const mong = dien(CHU_TV.xacNhan.go.coOkr, {
		kr: xem.kr,
		mucTieu: xem.mucTieu,
	});
	await doi(
		t,
		`${nhom}: hop go neu «${mong}»`,
		(c) => (window.__tim("[data-go-co-okr]")[0]?.innerText ?? "").includes(c),
		mong,
	);
	kiem(
		`${nhom}: nut Chuyen OKR trong hop go`,
		await coSel(t, "[role='alertdialog'] [data-nut-phu]"),
	);
	await haiKho(t, nhom, "[data-go-co-okr]");
	await t.close();
}

rmSync(TAM, { recursive: true, force: true });
mkdirSync(TAM, { recursive: true });

trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
datTrinhDuyet(trinhDuyet);

let ma = 0;
const bat = Date.now();
try {
	await napBoMau();
	await vaoNguoi();
	slug = await suySlugCua(cookie.quanTri);
	await lam(cookie.quanTri, "okr.setProgram", { duyetCongBo: true });
	for (const [ten, fn] of [
		["danh-sach", buocDanhSach],
		["dang-tai", buocDangTai],
		["duyet", buocDuyet],
		["luu-tru-chuyen", buocLuuTruChuyen],
		["go-nguoi", buocGoNguoi],
	]) {
		const b = Date.now();
		await fn().catch((e) =>
			hong.push(`${ten}: nem ${String(e?.stack ?? e).slice(0, 600)}`),
		);
		console.log(`  ${ten}: ${Math.round((Date.now() - b) / 1000)} s`);
	}
	kiem(
		`khong loi console (${loiConsole.length}): ${loiConsole.slice(0, 6).join(" || ")}`,
		loiConsole.length === 0,
	);
	kiem(`du 20 anh (thay ${anh.length})`, anh.length === 20);
} catch (e) {
	hong.push(`tien de: nem ${String(e?.stack ?? e).slice(0, 600)}`);
} finally {
	writeFileSync(join(TAM, "man-ux-8d-network.txt"), mang.join("\n"));
	console.log(
		`man-ux-8d: ${khang} khang dinh, ${hong.length} hong, ${anh.length} anh (${anh.join(", ")}), ${Math.round((Date.now() - bat) / 1000)} s`,
	);
	console.log(`  anh o ${relative(GOC, TAM)}/`);
	for (const h of hong) console.log(`  HONG: ${h}`);
	ma = hong.length === 0 ? 0 : 1;
	chepBangChung();
}
await ket(ma);
