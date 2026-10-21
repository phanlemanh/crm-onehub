import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { OKR_MAU } from "../../../apps/api/scripts/okr-mau/cau-hinh.ts";
import { kyMacDinhHoiY } from "../../../apps/app/app/(app)/[slug]/okr/okr-search-params.ts";
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
import { chayChieuDo, doGoc } from "./man-gui-chieu-do.mjs";

const HO_SO = "gon-dau-trang-lay-y-kien";
const DA_THONG_CONG = new Set(["signed-off", "machine-cleared"]);
const trangThaiHopDong = (
	readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8").match(
		/^status:\s*(\S+)/m,
	)?.[1] ?? ""
).trim();
const BANG_CHUNG =
	process.env.BANG_CHUNG ??
	(DA_THONG_CONG.has(trangThaiHopDong)
		? join(GOC, ".acceptance-runs", HO_SO, "evidence")
		: join(GOC, "_acceptance", HO_SO, "evidence"));
const KHO = {
	390: { rong: 390, cao: 812 },
	375: { rong: 375, cao: 812 },
	1280: { rong: 1280, cao: 800 },
};
const CHO_MS = 60_000;
const AN_CONG_CU_DEV =
	".tsqd-parent-container, .tsqd-open-btn-container, nextjs-portal { display: none !important; }";
const NHIP_MS = 250;
const LECH_MAY_TINH_PX = 1;
const LO_CHAM_PX = 12;
const NGHI_SAU_GO_MS = 300;
const CHO_ON_DINH_MS = 1200;
const CHON = {
	gui: "[data-khoi='o-soan'] button[type='submit']",
	hang: "[data-slot='hang-hanh-dong-bam-day']",
	soan: "[data-khoi='o-soan']",
	loi: "[data-khoi='o-soan'] [data-slot='field-error']",
	cuon: "[data-slot='page-shell-scroll']",
};
const O = [
	{ ten: "y", nhan: "Ý của bạn" },
	{ ten: "vi-sao", nhan: "Vì sao (tuỳ chọn)" },
	{ ten: "do-bang", nhan: "Đo bằng gì (tuỳ chọn)" },
];

const iChieu = process.argv.indexOf("--chieu-do");
if (iChieu >= 0) {
	const ma = await chayChieuDo(process.argv[iChieu + 1]);
	process.exit(ma);
}

const laGoc = process.env.GDL_GOC === "1";
const CHON_EVAL = new Set(
	(process.env.EVAL ?? "")
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);
const chay = (...e) => CHON_EVAL.size === 0 || e.some((x) => CHON_EVAL.has(x));

let dung = 0;
let sai = 0;
function dong(dat, chu) {
	if (dat) dung += 1;
	else sai += 1;
	console.log(dat ? chu : `SAI ${chu}`);
}

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

const thuMau = (ma) => `${ma}@${OKR_MAU.mienThu}`;

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

async function xoaHoiYTren(cycleId) {
	const ids = (
		await db.okrHoiY.findMany({ where: { cycleId }, select: { id: true } })
	).map((h) => h.id);
	await db.okrHoiYHieu.deleteMany({ where: { hoiYId: { in: ids } } });
	await db.okrY.deleteMany({ where: { hoiYId: { in: ids } } });
	await db.okrChuDe.deleteMany({ where: { hoiYId: { in: ids } } });
	await db.okrHoiYBanTruoc.deleteMany({ where: { hoiYId: { in: ids } } });
	await db.okrHoiY.deleteMany({ where: { id: { in: ids } } });
}

async function dungDuLieu() {
	if (!napBoMau()) await khongDo("KHONG DO DUOC: nap bo OKR mau that bai");
	const congTy = JSON.parse(
		readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
	);
	const ma = {
		quanTri: congTy.hoiY.nguoiChon,
		gop: congTy.hoiY.y[0].tacGia,
		du: congTy.hoiY.y.find((y) => y.tacGia !== congTy.hoiY.y[0].tacGia).tacGia,
	};
	const ck = Object.fromEntries(
		Object.entries(ma).map(([k, m]) => [k, phienCua(thuMau(m))]),
	);
	const api = Object.fromEntries(
		Object.entries(ck).map(([k, c]) => [k, trpcCua(c)]),
	);
	const chuKy = await api.quanTri.hoi("okr.cycles");
	const keHoach = kyMacDinhHoiY(chuKy);
	if (!keHoach)
		await khongDo("KHONG DO DUOC: bo mau khong co chu ky lap ke hoach");
	await xoaHoiYTren(keHoach);
	const quanTri = await db.user.findUniqueOrThrow({
		where: { email: thuMau(ma.quanTri) },
		select: { id: true },
	});
	await api.quanTri.lam("okr.moHoiY", {
		cycleId: keHoach,
		cauHoi: congTy.hoiY.cauHoi,
		loiMo: congTy.hoiY.loiMo,
		soLieu: congTy.hoiY.soLieu,
		hanLuc: new Date(Date.now() + 48 * 3_600_000).toISOString(),
		nguoiChonUserId: quanTri.id,
	});
	const h = await api.du.hoi("okr.hoiY", { cycleId: keHoach });
	for (let i = 1; i <= 3; i += 1)
		await api.du.lam("okr.gopY", {
			hoiYId: h.hoiY.id,
			noiDung: `Ý mẫu số ${i} của người đã góp đủ`,
			viSao: "",
			doBangGi: "",
		});
	const q = await api.gop.hoi("okr.hoiY", { cycleId: keHoach });
	if (!q.quyen.gopDuoc)
		await khongDo(`KHONG DO DUOC: ${ma.gop} khong gop duoc (${q.trangThai})`);
	console.log(
		`du lieu: lay y kien ${h.hoiY.id} tren ${keHoach} · gop ${ma.gop} · du ${ma.du} · khong quyen ${ma.quanTri}`,
	);
	return { ck, slug: await suySlug(ck.quanTri) };
}

const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
datTrinhDuyet(trinhDuyet);

async function moTrang(cookie, slug, kho, toi = false) {
	const ctx = await trinhDuyet.createBrowserContext();
	const t = await ctx.newPage();
	const host = new URL(APP).hostname;
	await t.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	await t.setViewport({ width: KHO[kho].rong, height: KHO[kho].cao });
	await t.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: toi ? "dark" : "light" },
	]);
	await t.evaluateOnNewDocument(() => {
		window.__vungCuon = () => {
			let el = document.querySelector("[data-khoi='o-soan']")?.parentElement;
			while (el) {
				const oy = getComputedStyle(el).overflowY;
				if (
					(oy === "auto" || oy === "scroll") &&
					el.scrollHeight > el.clientHeight
				)
					return el;
				el = el.parentElement;
			}
			return document.scrollingElement;
		};
	});
	const goiGop = [];
	t.on("request", (r) => {
		if (r.method() === "POST" && r.url().includes("okr.gopY"))
			goiGop.push(r.url());
	});
	await t.goto(`${APP}/${slug}/okr/lay-y-kien`, {
		waitUntil: "domcontentloaded",
		timeout: CHO_MS,
	});
	await t.addStyleTag({ content: AN_CONG_CU_DEV });
	await t.bringToFront();
	if (toi)
		await t.evaluate(() => {
			document.documentElement.classList.add("dark");
			document.documentElement.style.colorScheme = "dark";
		});
	return { t, goiGop };
}

async function cho(t, chon) {
	return t
		.waitForFunction(
			(c) => {
				const el = document.querySelector(c);
				return (
					el !== null &&
					el.getClientRects().length > 0 &&
					Object.keys(el).some((k) => k.startsWith("__reactFiber"))
				);
			},
			{ timeout: CHO_MS, polling: NHIP_MS },
			chon,
		)
		.then(() => true)
		.catch(() => false);
}

async function lenDau(t) {
	await t.evaluate((c) => {
		const k = window.__vungCuon();
		if (k) k.scrollTop = 0;
		window.scrollTo(0, 0);
	}, CHON.cuon);
	await new Promise((x) => setTimeout(x, 300));
}

const hop = (t, chon) =>
	t.evaluate((c) => {
		const el = document.querySelector(c);
		if (!el) return null;
		const r = el.getBoundingClientRect();
		return { tren: Math.round(r.top), duoi: Math.round(r.bottom) };
	}, chon);

const hopO = (t, nhan) =>
	t.evaluate((n) => {
		const l = [...document.querySelectorAll("[data-khoi='o-soan'] label")].find(
			(x) => x.textContent?.trim() === n,
		);
		const el = document.getElementById(l?.getAttribute("for") ?? "");
		if (!el) return null;
		const r = el.getBoundingClientRect();
		return {
			tren: Math.round(r.top),
			duoi: Math.round(r.bottom),
			dangTro: document.activeElement === el,
		};
	}, nhan);

function chup(t, ten) {
	mkdirSync(BANG_CHUNG, { recursive: true });
	return t.screenshot({ path: join(BANG_CHUNG, `${ten}.png`) });
}

async function e1(ck, slug) {
	for (const kho of ["390", "375"]) {
		const { t } = await moTrang(ck.gop, slug, kho);
		if (!(await cho(t, CHON.gui)))
			await khongDo(`KHONG DO DUOC: khong thay nut Gui o ${kho}`);
		await lenDau(t);
		const r = await t.evaluate((c) => {
			const n = document.querySelector(c);
			const b = n.getBoundingClientRect();
			const tam = document.elementFromPoint(
				b.left + b.width / 2,
				b.top + b.height / 2,
			);
			return {
				tren: Math.round(b.top),
				duoi: Math.round(b.bottom),
				tamLaNut: tam !== null && n.contains(tam),
			};
		}, CHON.gui);
		const cao = KHO[kho].cao;
		dong(
			r.duoi <= cao && r.tren >= 0 && r.tamLaNut,
			`${r.duoi <= cao && r.tren >= 0 && r.tamLaNut ? "" : "AC-1: "}GUI ${kho} day ${r.duoi}px <= ${cao} · dinh ${r.tren}px >= 0 · tam nut ${r.tamLaNut ? "la nut Gui" : "BI CHE"}`,
		);
		if (kho === "390") await chup(t, "gdl-390-sang");
		await t.close();
	}
}

async function e2va7(ck, slug) {
	for (const toi of [false, true]) {
		const { t } = await moTrang(ck.gop, slug, "390", toi);
		await cho(t, CHON.gui);
		if (!toi) {
			await t.evaluate((c) => {
				const k = window.__vungCuon();
				if (k) k.scrollTop = k.scrollHeight;
				window.scrollTo(0, document.body.scrollHeight);
			}, CHON.cuon);
			await new Promise((x) => setTimeout(x, 400));
			const hang = await hop(t, CHON.hang);
			const o = await Promise.all(O.map((x) => hopO(t, x.nhan)));
			const doBang = o[2];
			const che = o.filter(
				(x) => x && hang && x.duoi > hang.tren && x.tren < hang.duoi,
			).length;
			const datDong =
				hang !== null && doBang !== null && hang.tren >= doBang.duoi;
			dong(
				datDong && che === 0,
				`${datDong && che === 0 ? "" : "AC-2: "}DONG CHAY: hang ${hang?.tren}px >= day o Do bang gi ${doBang?.duoi}px · ${che === 0 ? "khong che o nao" : `hang che o ${che}`}`,
			);
			await lenDau(t);
		}
		await chup(t, toi ? "gdl-390-toi" : "gdl-390-sang");
		await t.evaluate((c) => {
			const k = window.__vungCuon();
			const s = document.querySelector("[data-khoi='o-soan']");
			if (k && s) k.scrollTop += s.getBoundingClientRect().top - 120;
		}, CHON.cuon);
		await new Promise((x) => setTimeout(x, 400));
		await chup(t, toi ? "gdl-390-cuon-toi" : "gdl-390-cuon-sang");
		await t.close();
	}
}

async function e3(ck, slug) {
	const { t } = await moTrang(ck.gop, slug, "390");
	await cho(t, CHON.gui);
	for (const [i, x] of O.entries())
		for (const cach of ["tab", "cham"]) {
			await lenDau(t);
			if (cach === "cham") {
				const diem = await t.evaluate(
					(n, cCuon, cHang, lo) => {
						const l = [
							...document.querySelectorAll("[data-khoi='o-soan'] label"),
						].find((y) => y.textContent?.trim() === n);
						const el = document.getElementById(l?.getAttribute("for") ?? "");
						const k = window.__vungCuon();
						const hang = document.querySelector(cHang);
						if (!el || !k || !hang) return null;
						k.scrollTop +=
							el.getBoundingClientRect().top -
							(hang.getBoundingClientRect().top - lo);
						const r = el.getBoundingClientRect();
						return { x: r.left + r.width / 2, y: r.top + lo / 2 };
					},
					x.nhan,
					CHON.cuon,
					CHON.hang,
					LO_CHAM_PX,
				);
				if (diem) await t.mouse.click(diem.x, diem.y);
			} else {
				await t.evaluate(
					(n, truoc) => {
						const nhanTruoc = truoc ?? n;
						const l = [
							...document.querySelectorAll("[data-khoi='o-soan'] label"),
						].find((y) => y.textContent?.trim() === nhanTruoc);
						const el = document.getElementById(l?.getAttribute("for") ?? "");
						if (truoc) el?.focus({ preventScroll: true });
						else {
							const ds = [
								...document.querySelectorAll(
									"a[href], button, textarea, input, select, [tabindex]",
								),
							].filter((e) => e.tabIndex >= 0 && e.getClientRects().length > 0);
							ds[ds.indexOf(el) - 1]?.focus({ preventScroll: true });
						}
					},
					x.nhan,
					i > 0 ? O[i - 1].nhan : null,
				);
				await t.keyboard.press("Tab");
			}
			await new Promise((r) => setTimeout(r, CHO_ON_DINH_MS));
			const o = await hopO(t, x.nhan);
			const hang = await hop(t, CHON.hang);
			const dat = o?.dangTro === true && hang !== null && o.duoi <= hang.tren;
			dong(
				dat,
				`${dat ? "" : "AC-3: "}TIEU DIEM ${x.ten} ${cach}: ${o?.dangTro ? "dang tro" : "KHONG tro"} · day o ${o?.duoi}px <= dinh hang ${hang?.tren}px`,
			);
		}
	await t.close();
}

async function goVaGui(t, chu) {
	await t.evaluate(
		(n, c) => {
			const l = [
				...document.querySelectorAll("[data-khoi='o-soan'] label"),
			].find((y) => y.textContent?.trim() === n);
			const el = document.getElementById(l?.getAttribute("for") ?? "");
			const dat = Object.getOwnPropertyDescriptor(
				HTMLTextAreaElement.prototype,
				"value",
			)?.set;
			dat?.call(el, c);
			el?.dispatchEvent(new Event("input", { bubbles: true }));
			el?.blur();
		},
		O[0].nhan,
		chu,
	);
	await new Promise((r) => setTimeout(r, NGHI_SAU_GO_MS));
	await t.evaluate((c) => document.querySelector(c)?.click(), CHON.gui);
}

async function e4b(ck, slug) {
	{
		const { t, goiGop } = await moTrang(ck.gop, slug, "390");
		await cho(t, CHON.gui);
		await goVaGui(t, "Bán gói lạnh theo quý");
		const het = Date.now() + CHO_MS;
		while (goiGop.length === 0 && Date.now() < het)
			await new Promise((r) => setTimeout(r, NHIP_MS));
		await new Promise((r) => setTimeout(r, 1500));
		if (goiGop.length !== 1)
			await khongDo(
				`KHONG DO DUOC: doi chung duong gui y hop le dem ${goiGop.length} yeu cau gopY, mong 1`,
			);
		console.log("GUI DUNG: 1 yeu cau gopY");
		await t.close();
	}
	for (const kho of ["390", "375"])
		for (const viTri of ["chua-cuon", "da-cuon"]) {
			const { t, goiGop } = await moTrang(ck.gop, slug, kho);
			await cho(t, CHON.gui);
			await lenDau(t);
			if (viTri === "da-cuon")
				await t.evaluate(
					(c, n, cHang) => {
						const k = window.__vungCuon();
						const l = [
							...document.querySelectorAll("[data-khoi='o-soan'] label"),
						].find((y) => y.textContent?.trim() === n);
						const o = document.getElementById(l?.getAttribute("for") ?? "");
						const hang = document.querySelector(cHang);
						if (!k || !o || !hang) return;
						k.scrollTop +=
							o.getBoundingClientRect().bottom -
							(hang.getBoundingClientRect().top + 20);
					},
					CHON.cuon,
					O[0].nhan,
					CHON.hang,
				);
			await new Promise((r) => setTimeout(r, 400));
			await goVaGui(t, "ngắn");
			await cho(t, CHON.loi);
			await new Promise((r) => setTimeout(r, 600));
			const o = await hopO(t, O[0].nhan);
			const loi = await hop(t, CHON.loi);
			const hang = await hop(t, CHON.hang);
			const dat =
				o?.dangTro === true &&
				hang !== null &&
				loi !== null &&
				o.duoi <= hang.tren &&
				loi.duoi <= hang.tren &&
				goiGop.length === 0;
			dong(
				dat,
				`${dat ? "" : "AC-4: "}GUI SAI ${kho} ${viTri}: ${o?.dangTro ? "tieu diem o Y" : "TIEU DIEM LECH"} · day o Y ${o?.duoi}px <= dinh hang ${hang?.tren}px · day loi ${loi?.duoi}px <= dinh hang ${hang?.tren}px · ${goiGop.length} yeu cau gopY`,
			);
			await t.close();
		}
}

async function doMayTinh(ck, slug) {
	const { t } = await moTrang(ck.gop, slug, "1280");
	await cho(t, CHON.gui);
	await lenDau(t);
	const r = await t.evaluate(
		(cGui, cSoan) => {
			const g = document.querySelector(cGui).getBoundingClientRect();
			const s = document.querySelector(cSoan).getBoundingClientRect();
			const hang = document.querySelector(cGui).closest("[role='group']");
			const st = hang ? getComputedStyle(hang) : null;
			return {
				dinh: Math.round(g.top - s.top),
				position: st?.position ?? "",
				vien: st?.borderTopWidth ?? "",
				tron: s.bottom <= window.innerHeight,
			};
		},
		CHON.gui,
		CHON.soan,
	);
	await t.close();
	return r;
}

async function e5(ck, slug) {
	const r = await doMayTinh(ck, slug);
	const goc = await doGoc();
	if (goc === null)
		await khongDo(
			"KHONG DO DUOC: khong do duoc dinh nut Gui tren cay origin/onehub",
		);
	const lech = Math.abs(r.dinh - goc);
	const dat =
		lech <= LECH_MAY_TINH_PX && r.position !== "sticky" && r.vien === "0px";
	dong(
		dat,
		`${dat ? "" : "AC-5: "}MAY TINH: dinh Gui ${r.dinh}px (goc ${goc}px) · lech ${lech} <= ${LECH_MAY_TINH_PX} · position hang ${r.position} != sticky · border-top-width ${r.vien} · khung soan ${r.tron ? "tron trong man" : "KHONG tron"}`,
	);
}

async function e6(ck, slug) {
	{
		const { t } = await moTrang(ck.gop, slug, "390");
		await cho(t, CHON.gui);
		const n = await t.evaluate(
			(c) => document.querySelectorAll(c).length,
			CHON.hang,
		);
		await t.close();
		if (n !== 1)
			await khongDo(
				`KHONG DO DUOC: doi chung duong CO BAM gop dem ${n}, mong 1`,
			);
		console.log("CO BAM gop: 1 [data-slot=hang-hanh-dong-bam-day]");
	}
	for (const ca of ["du", "quanTri"]) {
		const { t } = await moTrang(ck[ca], slug, "390");
		await t
			.waitForFunction(
				() =>
					document.querySelector(
						"[data-khoi='du-y'], [data-khoi='dai-moc']",
					) !== null,
				{ timeout: CHO_MS, polling: NHIP_MS },
			)
			.catch(() => {});
		await new Promise((r) => setTimeout(r, 800));
		const n = await t.evaluate(
			(c) => document.querySelectorAll(c).length,
			CHON.hang,
		);
		await t.close();
		const ten = ca === "du" ? "du-3-y" : "khong-quyen";
		dong(
			n === 0,
			`${n === 0 ? "" : "AC-6: "}KHONG BAM ${ten}: ${n} [data-slot=hang-hanh-dong-bam-day]`,
		);
	}
}

console.log(
	"an cong cu chi co o may chu dev truoc khi do: nut TanStack Query Devtools, chi bao Next.js",
);
try {
	const { ck, slug } = await dungDuLieu();
	if (laGoc) {
		const r = await doMayTinh(ck, slug);
		console.log(`GOC MAY TINH: dinh Gui ${r.dinh}px`);
		await db.$disconnect();
		await ket(0);
	}
	if (chay("E1")) await e1(ck, slug);
	if (chay("E2", "E7")) await e2va7(ck, slug);
	if (chay("E3")) await e3(ck, slug);
	if (chay("E6")) await e6(ck, slug);
	if (chay("E5")) await e5(ck, slug);
	if (chay("E4B", "E4")) await e4b(ck, slug);
} catch (loi) {
	console.log(`KHONG DO DUOC: thuoc vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}
console.log(`anh: ${BANG_CHUNG}`);
console.log(`KET LUAN gdl: ${dung} DUNG, ${sai} SAI`);
await db.$disconnect();
await ket(sai === 0 ? 0 : 1);
