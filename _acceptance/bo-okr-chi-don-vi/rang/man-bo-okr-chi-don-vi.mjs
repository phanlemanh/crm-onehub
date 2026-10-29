import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { OKR_MAU } from "../../../apps/api/scripts/okr-mau/cau-hinh.ts";
import { SEARCH_PARAM } from "../../../apps/app/lib/search-param-keys.ts";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	APP,
	CHROME,
	datTrinhDuyet,
	ket,
	khongDo,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	GOC,
	phienCua,
	trpcCua,
} from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";

const HO_SO = "bo-okr-chi-don-vi";
const DA_THONG_CONG = new Set(["signed-off", "machine-cleared"]);
const trangThai = (
	readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8").match(
		/^status:\s*(\S+)/m,
	)?.[1] ?? ""
).trim();
const BANG_CHUNG =
	process.env.BANG_CHUNG ??
	(process.env.BCD_CHEP_ANH === "1" || !DA_THONG_CONG.has(trangThai)
		? join(GOC, "_acceptance", HO_SO, "evidence")
		: join(GOC, ".acceptance-runs", HO_SO, "evidence"));

const GIAY_MS = 1000;
const DO = {
	kho: {
		rong: { ten: "1440", rong: 1440, cao: 900 },
		hep: { ten: "375", rong: 375, cao: 812 },
	},
	cho: { taiMs: 60 * GIAY_MS, onDinhMs: 1500, nhipMs: 250 },
	lechPx: 1,
};
const NGUOI_XEM = "le-hai-dang";
const KHOI = [
	{ ten: "Khối Kinh doanh", nguong: 1 },
	{ ten: "Khối Vận hành", nguong: 1 },
	{ ten: "Khối Hỗ trợ", nguong: 0 },
];
const THE_KHAC = ["hop-tuan", "viec", "cham"];
const AN_CONG_CU_DEV =
	".tsqd-parent-container, .tsqd-open-btn-container, nextjs-portal { display: none !important; }";

const nghi = (ms) => new Promise((xong) => setTimeout(xong, ms));

let dung = 0;
let sai = 0;
function dong(dat, chu) {
	if (dat) dung += 1;
	else sai += 1;
	console.log(dat ? `DUNG ${chu}` : `SAI ${chu}`);
}

function napBoMau() {
	const nap = spawnSync("bun", ["scripts/okr-mau.ts"], {
		cwd: join(GOC, "apps", "api"),
		env: process.env,
		encoding: "utf8",
	});
	const cuoi = `${nap.stdout ?? ""}${nap.stderr ?? ""}`
		.trim()
		.split("\n")
		.at(-1);
	console.log(`nap bo OKR mau: ma ${nap.status} — ${cuoi}`);
	return nap.status === 0;
}

let trinhDuyet = null;

async function moTrang(cookie, duong, kho, toi = false) {
	const ctx = await trinhDuyet.createBrowserContext();
	const t = await ctx.newPage();
	const host = new URL(APP).hostname;
	await t.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	await t.setViewport({ width: kho.rong, height: kho.cao });
	await t.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: toi ? "dark" : "light" },
	]);
	await t.evaluateOnNewDocument((css) => {
		document.addEventListener("DOMContentLoaded", () => {
			const s = document.createElement("style");
			s.textContent = css;
			document.head.appendChild(s);
		});
	}, AN_CONG_CU_DEV);
	await t.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: DO.cho.taiMs,
	});
	if (toi)
		await t.evaluate(() => {
			document.documentElement.classList.add("dark");
			document.documentElement.style.colorScheme = "dark";
		});
	return t;
}

const dongTrang = (t) => t.browserContext().close();

async function cho(t, chon, ms = DO.cho.taiMs) {
	const thay = await t
		.waitForFunction(
			(c) =>
				[...document.querySelectorAll(c)].some(
					(el) =>
						el.getClientRects().length > 0 &&
						Object.keys(el).some((k) => k.startsWith("__reactFiber")),
				),
			{ timeout: ms, polling: DO.cho.nhipMs },
			chon,
		)
		.then(() => true)
		.catch(() => false);
	await nghi(DO.cho.onDinhMs);
	return thay;
}

async function bam(t, chon) {
	const r = await t.evaluate((c) => {
		const el = [...document.querySelectorAll(c)].find(
			(e) => e.getClientRects().length > 0,
		);
		if (!el) return null;
		el.scrollIntoView({ block: "center" });
		const b = el.getBoundingClientRect();
		return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
	}, chon);
	if (r === null) return false;
	await t.mouse.click(r.x, r.y);
	await nghi(DO.cho.onDinhMs);
	return true;
}

async function chup(t, ten) {
	mkdirSync(BANG_CHUNG, { recursive: true });
	await t.screenshot({ path: join(BANG_CHUNG, `${ten}.png`), fullPage: true });
}

const soTu = (chu) => {
	const m = (chu ?? "").replace(/\./g, "").match(/-?\d+/);
	return m ? Number(m[0]) : null;
};

async function chuanBi() {
	const tenKho = (() => {
		try {
			return new URL(process.env.DATABASE_URL ?? "").pathname.replace(
				/^\//,
				"",
			);
		} catch {
			return "";
		}
	})();
	if (!isMeasureDatabase(tenKho))
		await khongDo(
			`KHONG DO DUOC: can mot phien do (kho _do) — kho "${tenKho}". Chay qua scripts/lan-do/tien-de.mjs`,
		);
	const cayKiem = await canhCay();
	if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);
	if (!napBoMau()) await khongDo("KHONG DO DUOC: nap bo OKR mau that bai");
	const ck = phienCua(`${NGUOI_XEM}@${OKR_MAU.mienThu}`);
	const api = trpcCua(ck);
	const slug = await suySlug(ck);
	const cay = await api.hoi("org.tree");
	const chuKy = await api.hoi("okr.cycles");
	const ky = chuKy.cycles.find((c) => c.id === chuKy.currentId);
	if (!ky) await khongDo("KHONG DO DUOC: bo mau khong co chu ky hien tai");
	const khoi = KHOI.map((k) => {
		const bp = cay.divisions.find((d) => d.name === k.ten);
		if (!bp) return null;
		return { ...k, bp, khoa: `bp:${bp.id}` };
	});
	if (khoi.some((k) => k === null))
		await khongDo(
			`KHONG DO DUOC: bo mau thieu mot trong ${KHOI.map((k) => k.ten).join(", ")}`,
		);
	return { ck, api, slug, ky, khoi };
}

const duongBo = (n, khoa, xem = null) => {
	const q = new URLSearchParams({
		[SEARCH_PARAM.okr.don]: khoa,
		[SEARCH_PARAM.okr.ky]: n.ky.id,
	});
	if (xem) q.set(SEARCH_PARAM.okr.xem, xem);
	return `/${n.slug}/okr/bo-okr?${q}`;
};

async function tenMucTieuPhongCon(n, k) {
	const ten = [];
	for (const pb of k.bp.departments) {
		const ds = await n.api.hoi("okr.danhSach", {
			cycleId: n.ky.id,
			unit: { loai: "pb", id: pb.id },
			loc: { phuTrach: [], loai: [], trangThai: [], tuTin: [], gopY: [] },
		});
		for (const mt of [...ds.rows, ...ds.daBo]) {
			ten.push(mt.title);
			for (const kr of mt.keyResults) ten.push(kr.title);
		}
	}
	return ten;
}

async function demTheOkr(n, k, so) {
	const t = await moTrang(n.ck, duongBo(n, k.khoa), DO.kho.rong);
	const coBang = await cho(
		t,
		"[data-hang-muc-tieu], [data-rong-bo-phan], [data-trang-thai='ST-donvi-rong']",
	);
	const doc = await t.evaluate(() => ({
		hang: document.querySelectorAll("[data-hang-muc-tieu]").length,
		rongRieng: document.querySelector("[data-rong-bo-phan]")?.innerText ?? null,
		chonDonVi: document.querySelectorAll("[data-chon-don-vi]").length,
		luoi: document.querySelectorAll("[data-don-vi-con]").length,
		gap: document.querySelectorAll("[data-nhom-da-bo]").length,
		menu: document.querySelectorAll("[data-menu-vi-tri]").length,
		o: Object.fromEntries(
			[...document.querySelectorAll("[data-hang-so-bo='co'] [data-o-so]")].map(
				(el) => {
					const la = [...el.querySelectorAll("*")]
						.filter((e) => e.children.length === 0)
						.map((e) => e.innerText.trim())
						.filter(Boolean);
					return [el.getAttribute("data-o-so"), la[1] ?? ""];
				},
			),
		),
	}));
	console.log(
		`DEM ${k.ten} the OKR: ${doc.hang} muc tieu (soBo ${so.soMucTieu}, nguong ${k.nguong})`,
	);
	dong(
		coBang && doc.hang === k.nguong && doc.hang === so.soMucTieu,
		`${k.ten} the OKR ${doc.hang} muc tieu = nguong ${k.nguong} = soBo ${so.soMucTieu}`,
	);
	if (k.nguong === 0)
		dong(
			(doc.rongRieng ?? "").includes(
				`${k.ten} chưa có mục tiêu riêng trong ${n.ky.name}`,
			),
			`${k.ten} cau rong rieng: ${doc.rongRieng ?? "khong co"}`,
		);
	dong(
		doc.chonDonVi === 0 && doc.luoi === 0 && doc.gap === 0 && doc.menu === 1,
		`${k.ten} trang gon: o chon ${doc.chonDonVi}, luoi ${doc.luoi}, muc gap ${doc.gap}, menu ${doc.menu}`,
	);
	if (k.ten === "Khối Kinh doanh") await chup(t, "bcd-khoi-1440-sang");
	if (k.nguong === 0) await chup(t, "bcd-rong-1440-sang");
	await dongTrang(t);
	return doc.o;
}

async function demTheKhac(n, k, conTen) {
	for (const xem of THE_KHAC) {
		if (xem === "cham" && !["cham-diem", "da-dong"].includes(n.ky.phase)) {
			console.log(`DEM ${k.ten} the ${xem}: bo qua — chu ky ${n.ky.phase}`);
			continue;
		}
		const t = await moTrang(n.ck, duongBo(n, k.khoa, xem), DO.kho.rong);
		await cho(t, "[data-the-con-bo]");
		await nghi(DO.cho.onDinhMs * 2);
		const chu = await t.evaluate(
			() =>
				document.querySelector("main")?.innerText ?? document.body.innerText,
		);
		const lot = conTen.filter((ten) => chu.includes(ten));
		console.log(
			`DEM ${k.ten} the ${xem}: ${lot.length} muc tieu/KR cua phong ban con tren man`,
		);
		dong(
			lot.length === 0,
			`${k.ten} the ${xem} khong co phong ban con${lot.length ? ` (lot: ${lot.slice(0, 3).join("; ")})` : ""}`,
		);
		await dongTrang(t);
	}
}

async function quanHe(n, oTheoKhoi, dem) {
	const t = await moTrang(
		n.ck,
		`/${n.slug}/okr/bo-okr?${SEARCH_PARAM.okr.ky}=${n.ky.id}`,
		DO.kho.rong,
	);
	await cho(t, "[data-bang-bo] [data-bo]");
	const hang = await t.evaluate(() =>
		Object.fromEntries(
			[...document.querySelectorAll("[data-bang-bo] [data-bo]")].map((r) => [
				r.getAttribute("data-bo"),
				[...r.querySelectorAll("td")].map((c) => c.innerText.trim()),
			]),
		),
	);
	await chup(t, "bcd-danh-sach-1440-sang");
	await dongTrang(t);
	for (const k of n.khoi) {
		const so = await n.api.hoi("okr.soBo", {
			cycleId: n.ky.id,
			unit: { loai: "bp", id: k.bp.id },
		});
		const r = hang[k.khoa] ?? [];
		const o = oTheoKhoi.get(k.khoa) ?? {};
		const cot = [
			["Muc tieu", soTu(r[2]), null, dem[k.khoa] ?? 0],
			["Tien do", soTu(r[3]), soTu(o["tien-do"]), so.tienDo],
			["KR tu tin thap", soTu(r[4]), soTu(o["tu-tin-thap"]), so.tuTin.thap],
		];
		for (const [ten, ds, oSo, may] of cot) {
			const khop =
				ds === may && (oSo === null || ten === "Muc tieu" || oSo === may);
			console.log(
				`DEM QUAN HE ${k.ten} ${ten}: danh sach ${ds} · o so ${oSo} · may ${may}`,
			);
			if (!khop) console.log(`bcd-man: ${k.ten} ${ten} lech`);
			dong(khop, `${k.ten} ${ten} khop ba nguon`);
		}
	}
}

async function menu(n) {
	const kd = n.khoi[0];
	for (const [kho, toi, ten] of [
		[DO.kho.rong, false, "bcd-menu-1440-sang"],
		[DO.kho.hep, false, "bcd-menu-375-sang"],
		[DO.kho.hep, true, "bcd-menu-375-toi"],
	]) {
		const t = await moTrang(n.ck, duongBo(n, kd.khoa), kho, toi);
		await cho(t, "[data-menu-vi-tri]");
		const mo = await bam(t, "[data-menu-vi-tri]");
		await cho(t, "[data-menu-don]");
		const doc = await t.evaluate(() => {
			const noi = document.querySelector("[role='menu']");
			const b = noi?.getBoundingClientRect();
			return {
				nhom: [...document.querySelectorAll("[data-nhom-menu]")].map((g) =>
					g.getAttribute("data-nhom-menu"),
				),
				trongMan: b ? b.left >= 0 && b.right <= window.innerWidth + 1 : false,
				tran: document.documentElement.scrollWidth - window.innerWidth,
				soMuc: document.querySelectorAll("[data-menu-don]").length,
			};
		});
		await chup(t, ten);
		dong(
			mo &&
				doc.nhom.join(" · ") === "Thuộc · Cùng cấp · Trực thuộc" &&
				doc.soMuc > 0,
			`${ten}: menu ${doc.nhom.join(" · ")}, ${doc.soMuc} muc`,
		);
		dong(
			doc.trongMan && doc.tran <= DO.lechPx,
			`${ten}: menu trong man, tran ngang ${doc.tran}px`,
		);
		if (ten === "bcd-menu-1440-sang") {
			const sang = await bam(t, "[data-menu-don^='pb:']");
			await nghi(DO.cho.onDinhMs);
			const don = new URL(t.url()).searchParams.get(SEARCH_PARAM.okr.don) ?? "";
			dong(
				sang && don.startsWith("pb:"),
				`tu bo khoi sang bo phong trong 2 lan bam: ${don}`,
			);
		}
		await dongTrang(t);
	}
}

const n = await chuanBi();
trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
datTrinhDuyet(trinhDuyet);
console.log(
	`man-bo-okr-chi-don-vi: nguoi xem ${NGUOI_XEM} · ky ${n.ky.name} (${n.ky.phase})`,
);
try {
	const dem = await n.api.hoi("okr.countByUnit", { cycleId: n.ky.id });
	const oTheoKhoi = new Map();
	for (const k of n.khoi) {
		const so = await n.api.hoi("okr.soBo", {
			cycleId: n.ky.id,
			unit: { loai: "bp", id: k.bp.id },
		});
		oTheoKhoi.set(k.khoa, await demTheOkr(n, k, so));
		await demTheKhac(n, k, await tenMucTieuPhongCon(n, k));
	}
	await quanHe(n, oTheoKhoi, dem);
	await menu(n);
} catch (loi) {
	console.log(`KHONG DO DUOC: thuoc vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}
console.log(`anh: ${BANG_CHUNG}`);
console.log(`KET LUAN bcd: ${dung} DUNG, ${sai} SAI`);
await db.$disconnect();
await ket(sai === 0 ? 0 : 1);
