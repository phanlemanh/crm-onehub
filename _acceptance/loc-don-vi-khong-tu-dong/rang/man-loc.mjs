#!/usr/bin/env bun
/**
 * Lọc trang Theo đơn vị không tự đóng, đo trên trình duyệt thật (hồ sơ loc-don-vi-khong-tu-dong, DH13).
 *
 *   bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs"
 *
 * Phiên đo riêng của cây đang xét, bộ OKR mẫu, quản trị mẫu qua dev:session. Bàn đo giữ thủ tục okr.danhSach của
 * trình duyệt tới khi rang thả, nên «còn đang nạp» là khoảng có chủ đích. Bộ lấy mẫu chạy trong trang mỗi 50 ms.
 * Sáu đường: tích lọc 1440 (AC-1, AC-3), tích lọc 390 (AC-2), lọc không khớp rồi bỏ lọc (AC-4), lọc lỗi (AC-5),
 * đổi chu kỳ (AC-6). Ảnh E8 vào evidence/.
 * Mã thoát: 0 đạt · 1 có dòng SAI · 2 không đo được.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HO_SO = "loc-don-vi-khong-tu-dong";
const daThongCong = ["signed-off", "machine-cleared"].includes(
	/^status:\s*(\S+)/m.exec(
		readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8"),
	)?.[1] ?? "",
);
process.env.BANG_CHUNG ??= daThongCong
	? join(GOC, ".acceptance-runs", HO_SO, "evidence")
	: join(GOC, "_acceptance", HO_SO, "evidence");
const BANG_CHUNG = process.env.BANG_CHUNG;

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man-loc.mjs"`,
	);
	process.exit(2);
}

const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");
const { chiaCookie } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs"
);

const MAU = JSON.parse(
	readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
);
const MIEN = "mau.onehub.test";
const idMau = (loai, ma) => `mau-okr-${loai}-${ma}`;
const KY = idMau("chu-ky", "quy4");
const GIU_MS = 700;
const MO_SAU_MS = 250;
const MAU_TOI_THIEU = 3;
const MAT_LOC = [/^Trạng thái/, /^Loại/];
const d = await lib.moDo();
const sai = [];
const dong = (dung, cau) => {
	console.log(dung ? cau : `SAI ${cau}`);
	if (!dung) sai.push(cau);
	return dung;
};
const khongDo = async (cau) => {
	console.log(`KHONG DO DUOC: ${cau}`);
	await d.khongDoDuoc(cau).catch(() => process.exit(2));
};
const choMs = (ms) => new Promise((r) => setTimeout(r, ms));
const duongDon = (don, ky = KY) =>
	`/okr/theo-don-vi?kyOkr=${ky}${don ? `&donOkr=${don}` : ""}`;
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

async function napBoMau() {
	if ((await d.db.okrCycle.count()) > 0) return;
	const nap = spawnSync("bun", ["scripts/okr-mau.ts"], {
		cwd: join(GOC, "apps", "api"),
		env: process.env,
		encoding: "utf8",
	});
	if (nap.status !== 0) await khongDo(`nap bo OKR mau thoat ${nap.status}`);
}

const batMau = (idCu) => {
	window.__ldv = [];
	const cu = new Set(idCu ?? []);
	const hien = (e) =>
		e.getClientRects().length > 0 &&
		e.closest("[hidden]") === null &&
		getComputedStyle(e).visibility !== "hidden";
	const tat = (s, goc = document) => [...goc.querySelectorAll(s)].filter(hien);
	const batDau = performance.now();
	window.__ldvBatDau = batDau;
	const lay = () => {
		const vung = tat("[data-slot=vung-dang-tai]")[0] ?? null;
		const bang = tat("[data-slot=table-container]")[0] ?? null;
		const nut = document.querySelector("[data-ldv-nut-khung]");
		const khungLoc = nut
			? document.getElementById(nut.getAttribute("aria-controls") ?? "")
			: null;
		const hang = tat("[data-hang-muc-tieu]");
		window.__ldv.push({
			luc: Math.round(performance.now() - batDau),
			url: location.search,
			menu: tat("[role=menu]").length,
			hang: hang.length,
			hangCu: hang.filter((e) => cu.has(e.getAttribute("data-hang-muc-tieu")))
				.length,
			bang: bang !== null,
			khung: tat("[data-khung-xuong]").length,
			khungDich: tat("[data-khung-xuong=bang-hai-dong]").length,
			banDung:
				vung !== null &&
				vung.getAttribute("aria-busy") === "true" &&
				vung.hasAttribute("data-dang-tai") &&
				bang !== null &&
				vung.contains(bang),
			mo: vung ? Number(getComputedStyle(vung).opacity) : 1,
			congCuMo:
				tat(
					"[data-dang-tai] [data-hang-cong-cu-don-vi], [data-dang-tai] button[aria-haspopup=menu]",
				).length > 0,
			ban: tat("[aria-busy=true]").filter(
				(e) => e.closest("[data-slot=page-shell-content]") !== null,
			).length,
			khungMo: nut ? nut.getAttribute("aria-expanded") === "true" : null,
			khungHien: khungLoc ? hien(khungLoc) : null,
			loi: tat("[data-trang-thai=ST-donvi-loi]").length > 0,
			khongKhop: tat("[data-trang-thai=ST-donvi-loc-khongkhop]").length > 0,
		});
	};
	lay();
	window.__ldvId = setInterval(lay, 50);
};
const dungMau = (t) =>
	t.evaluate(() => {
		clearInterval(window.__ldvId);
		return window.__ldv;
	});

const datChan = async (t) => {
	await t.setRequestInterception(true);
	const c = { che: "di", giu: [], so: 0 };
	t.on("request", (r) => {
		if (r.isInterceptResolutionHandled()) return;
		if (/\/api\/trpc\/[^?]*okr\.danhSach/.test(r.url())) {
			c.so += 1;
			if (c.che === "giu") {
				c.giu.push(r);
				return;
			}
			if (c.che === "loi") {
				r.abort("failed").catch(() => null);
				return;
			}
		}
		r.continue().catch(() => null);
	});
	c.thaRa = () => {
		c.che = "di";
		for (const r of c.giu.splice(0)) r.continue().catch(() => null);
	};
	return c;
};

const choBang = (t) =>
	d.doi(
		t,
		() =>
			document.querySelector("[data-hang-muc-tieu]") !== null &&
			document.querySelector("[data-slot=page-shell-content] thead") !== null,
	);
const choHetBan = (t) =>
	d.doi(
		t,
		() =>
			document.querySelector(
				"[data-slot=page-shell-content] [aria-busy=true]",
			) === null,
	);

const timNut = (t, s, chu) =>
	t.evaluateHandle(
		(s, chu) =>
			[...document.querySelectorAll(s)].find(
				(e) =>
					e.getClientRects().length > 0 &&
					(e.textContent ?? "").trim().startsWith(chu),
			) ?? null,
		s,
		chu,
	);

async function moMatLoc(t, mat = MAT_LOC[0]) {
	const nut = await timNut(t, "button[aria-haspopup=menu]", "Lọc");
	if (!(await nut.evaluate((e) => e !== null)))
		await khongDo("khong thay nut Loc");
	await nut.click();
	await d.doi(t, () => document.querySelector("[role=menu]") !== null);
	const muc = await t.evaluateHandle(
		(nguon) =>
			[...document.querySelectorAll("[role=menu] [role=menuitem]")].find((e) =>
				new RegExp(nguon).test((e.textContent ?? "").trim()),
			) ?? null,
		mat.source,
	);
	if (!(await muc.evaluate((e) => e !== null)))
		await khongDo(`menu Loc khong co mat ${mat.source}`);
	await muc.evaluate((e) => e.focus());
	await t.keyboard.press("ArrowRight");
	await d.doi(
		t,
		() =>
			[...document.querySelectorAll("[role=menu]")].filter(
				(e) => e.getClientRects().length > 0,
			).length >= 2,
	);
}

const luaChon = (t) =>
	t.evaluate(() =>
		[...document.querySelectorAll("[role=menuitemcheckbox]")]
			.filter((e) => e.getClientRects().length > 0)
			.map((e, i) => {
				const chu = (e.textContent ?? "").trim();
				const so = Number(/·\s*(\d+)\s*$/.exec(chu)?.[1] ?? "-1");
				return { i, chu, so };
			}),
	);

async function bamLuaChon(t, i) {
	const o = await t.evaluateHandle(
		(i) =>
			[...document.querySelectorAll("[role=menuitemcheckbox]")].filter(
				(e) => e.getClientRects().length > 0,
			)[i] ?? null,
		i,
	);
	await o.evaluate((e) => e.focus());
	await t.keyboard.press("Enter");
	return o;
}

async function dongMenu(t) {
	for (let i = 0; i < 3; i += 1) {
		const con = await t.evaluate(
			() => document.querySelector("[role=menu]") !== null,
		);
		if (!con) return;
		await t.keyboard.press("Escape");
		await choMs(150);
	}
}

async function chonMat(t) {
	for (const mat of MAT_LOC) {
		await moMatLoc(t, mat);
		const ds = await luaChon(t);
		await dongMenu(t);
		const coDong = ds.filter((x) => x.so > 0).length;
		const rong = ds.some((x) => x.so === 0);
		if (coDong >= 2 && rong) return mat;
	}
	return null;
}

const daTich = (o) => o.evaluate((e) => e.getAttribute("aria-checked") === "true");

const demNeu = (ds, ham) => ds.filter(ham).length;

try {
	await napBoMau();
	const quanTriMa = MAU.nguoi.find((n) => n.vai === "admin")?.ma;
	const P_DS = MAU.phongBan.find((p) => p.ma === "phap-che");
	if (!quanTriMa || !P_DS) await khongDo("bo mau thieu quan tri hoac phap-che");
	const QT = phienCua(`${quanTriMa}@${MIEN}`);
	await d.batTrinhDuyet(QT);
	let DON = `pb:${idMau("pb", P_DS.ma)}`;
	let MAT = null;
	for (const don of [DON, null]) {
		const t = await d.moTrang(QT, 1440, duongDon(don));
		await choBang(t);
		MAT = await chonMat(t);
		await t.close();
		if (MAT) {
			DON = don;
			break;
		}
	}
	if (!MAT)
		await khongDo("khong don vi nao co mat Loc >= 2 gia tri co dong va 1 gia tri rong");
	console.log(`don: ${DON ?? "goc"} · mat loc: ${MAT.source}`);
	const tichDuoc = (ds) => ds.filter((x) => x.so > 0);

	console.log("== tich loc 1440");
	{
		const t = await d.moTrang(QT, 1440, duongDon(DON));
		await choBang(t);
		const chan = await datChan(t);
		await moMatLoc(t, MAT);
		const ds = await luaChon(t);
		const co = tichDuoc(ds);
		if (co.length < 2)
			await khongDo(`mat loc can >= 2 gia tri co dong, co ${co.length}`);
		chan.che = "giu";
		await t.evaluate(batMau, null);
		const o1 = await bamLuaChon(t, co[0].i);
		const lucBam = await t.evaluate(() =>
			Math.round(performance.now() - window.__ldvBatDau),
		);
		await choMs(GIU_MS);
		await t.screenshot({ path: join(BANG_CHUNG, "E8-cho-1440.png") });
		chan.thaRa();
		await choHetBan(t);
		await choMs(150);
		const s = await dungMau(t);
		const tich1 = await daTich(o1);
		await t.screenshot({ path: join(BANG_CHUNG, "E8-xong-1440.png") });
		const menuTruoc = await t.evaluate(
			() =>
				[...document.querySelectorAll("[role=menu]")].filter(
					(e) => e.getClientRects().length > 0,
				).length,
		);
		let tich2 = false;
		if (menuTruoc >= 2) tich2 = await daTich(await bamLuaChon(t, co[1].i));
		const luc = s.filter((x) => x.luc >= lucBam && x.luc <= GIU_MS);
		const k = luc.length;
		const a = demNeu(s, (x) => x.menu < 1);
		const b = demNeu(s, (x) => x.menu < 2);
		console.log(
			`AC-1 1440: ${k} mau · menu dong ${a} · menu con dong ${b} · da tich ${tich1 ? "co" : "khong"} · tich lan hai ${tich2 ? "co" : "khong"}`,
		);
		if (k < MAU_TOI_THIEU) await khongDo("khong bat duoc luc cho");
		if (a > 0 || b > 0 || !tich1 || !tich2)
			dong(false, "AC-1: menu Loc dong khi doi loc");
		const g = demNeu(luc, (x) => !x.bang);
		const c = demNeu(luc, (x) => x.khung > 0);
		const sb = demNeu(luc, (x) => !x.banDung);
		const m = demNeu(luc, (x) => x.congCuMo);
		const om = demNeu(luc, (x) => x.luc - lucBam >= MO_SAU_MS && !(x.mo < 1));
		const v = s.at(-1)?.ban ?? 0;
		console.log(
			`AC-3 1440: ${k} mau · bang go ${g} · khung cho ${c} · ban sai ${sb} · cong cu mo ${m} · chua mo ${om} · sau khi ve ban ${v}`,
		);
		if (g > 0 || c > 0) dong(false, "AC-3: bang bi go khi doi loc");
		else if (sb > 0 || om > 0)
			dong(false, "AC-3: vung bang khong ban khi doi loc");
		if (m > 0) dong(false, "AC-3: cong cu nam trong vung mo");
		if (v > 0) dong(false, "AC-3: con ban sau khi danh sach ve");
		await t.close();
	}

	console.log("== tich loc 390");
	{
		const t = await d.moTrang(QT, 390, duongDon(DON));
		await choBang(t);
		const chan = await datChan(t);
		await t.evaluate(() => {
			const nut = [...document.querySelectorAll("button[aria-controls][aria-expanded]")].find(
				(e) =>
					e.getClientRects().length > 0 &&
					(e.textContent ?? "").trim().startsWith("Lọc"),
			);
			nut?.setAttribute("data-ldv-nut-khung", "");
		});
		const coNut = await t.evaluate(
			() => document.querySelector("[data-ldv-nut-khung]") !== null,
		);
		if (!coNut) await khongDo("khong thay nut mo khung Loc o 390");
		await t.click("[data-ldv-nut-khung]");
		await d.doi(
			t,
			() =>
				document.querySelector("[data-ldv-nut-khung]")?.getAttribute("aria-expanded") ===
				"true",
		);
		await moMatLoc(t, MAT);
		const co = tichDuoc(await luaChon(t));
		if (co.length < 1) await khongDo("mat loc o 390 khong co gia tri");
		chan.che = "giu";
		await t.evaluate(batMau, null);
		const o = await bamLuaChon(t, co[0].i);
		await choMs(GIU_MS);
		await t.screenshot({ path: join(BANG_CHUNG, "E8-cho-390.png") });
		chan.thaRa();
		await choHetBan(t);
		const s = await dungMau(t);
		const tich = await daTich(o).catch(() => false);
		const k = demNeu(s, (x) => x.luc <= GIU_MS);
		const a = demNeu(s, (x) => x.khungHien === false);
		const b = demNeu(s, (x) => x.khungMo === false);
		const giu = chan.so > 0;
		console.log(
			`AC-2 390: ${k} mau · khung thu ${a} · aria-expanded sai ${b} · da tich ${tich ? "co" : "khong"}`,
		);
		if (k < MAU_TOI_THIEU || !giu)
			await khongDo("khong bat duoc luc cho o 390");
		if (a > 0 || b > 0 || !tich)
			dong(false, "AC-2: khung Loc thu lai khi doi loc");
		await t.close();
	}

	console.log("== khong khop roi bo loc 1440");
	{
		const t = await d.moTrang(QT, 1440, duongDon(DON));
		await choBang(t);
		const chan = await datChan(t);
		await moMatLoc(t, MAT);
		const rong = (await luaChon(t)).find((x) => x.so === 0);
		if (!rong) await khongDo("mat loc khong co gia tri 0 dong");
		await bamLuaChon(t, rong.i);
		await d.doi(
			t,
			() =>
				document.querySelector("[data-trang-thai=ST-donvi-loc-khongkhop]") !==
				null,
		);
		const kq = await t.evaluate(() => ({
			khop:
				document.querySelector("[data-trang-thai=ST-donvi-loc-khongkhop]") !==
				null,
			menu: [...document.querySelectorAll("[role=menu]")].filter(
				(e) => e.getClientRects().length > 0,
			).length,
		}));
		await t.keyboard.press("Escape");
		await t.keyboard.press("Escape");
		await d.doi(t, () => document.querySelector("[role=menu]") === null);
		chan.che = "giu";
		await t.evaluate(batMau, null);
		const nut = await timNut(
			t,
			"[data-trang-thai=ST-donvi-loc-khongkhop] button",
			"",
		);
		await nut.click();
		await choMs(GIU_MS);
		chan.thaRa();
		await choBang(t);
		const s = await dungMau(t);
		const k = demNeu(s, (x) => x.luc <= GIU_MS);
		const c = demNeu(s, (x) => x.khung > 0);
		console.log(
			`AC-4 1440: khong khop ${kq.khop ? "co" : "khong"} · menu mo ${kq.menu >= 1 ? "co" : "khong"} · ${k} mau · khung cho khi bo loc ${c}`,
		);
		if (k < MAU_TOI_THIEU) await khongDo("khong bat duoc luc cho khi bo loc");
		if (!kq.khop || kq.menu < 1)
			dong(false, "AC-4: khong khop dong menu Loc");
		if (c > 0) dong(false, "AC-4: bo loc qua khung cho");
		await t.close();
	}

	console.log("== loc loi 1440");
	{
		const t = await d.moTrang(QT, 1440, duongDon(DON));
		await choBang(t);
		const idCu = await t.evaluate(() =>
			[...document.querySelectorAll("[data-hang-muc-tieu]")].map((e) =>
				e.getAttribute("data-hang-muc-tieu"),
			),
		);
		const chan = await datChan(t);
		await moMatLoc(t, MAT);
		const co = tichDuoc(await luaChon(t));
		if (co.length < 1) await khongDo("mat loc khong co gia tri de loi");
		chan.che = "loi";
		await t.evaluate(batMau, idCu);
		await bamLuaChon(t, co[0].i);
		await d.doi(
			t,
			() => document.querySelector("[data-trang-thai=ST-donvi-loi]") !== null,
		);
		await choMs(500);
		const s = await dungMau(t);
		const sauLoi = s.filter((x) => x.loi);
		const k = sauLoi.length;
		const a = s.at(-1)?.loi === true;
		const b = demNeu(sauLoi, (x) => x.hangCu > 0);
		const c = s.at(-1)?.ban ?? 0;
		chan.che = "di";
		const truoc = chan.so;
		await t.keyboard.press("Escape").catch(() => null);
		await t.keyboard.press("Escape").catch(() => null);
		const thuLai = await timNut(
			t,
			"[data-trang-thai=ST-donvi-loi] button",
			"Thử lại",
		);
		if (await thuLai.evaluate((e) => e !== null)) await thuLai.click();
		await choMs(1500);
		const n = chan.so - truoc;
		console.log(
			`AC-5 1440: ${k} mau · khung loi ${a ? "co" : "khong"} · dong cu treo ${b} · ban con ${c} · goi lai ${n}`,
		);
		if (!a) dong(false, "AC-5: doi loc loi khong hien khung loi");
		else if (k < MAU_TOI_THIEU) await khongDo("khong bat duoc sau loi");
		if (b > 0) dong(false, "AC-5: loi doi loc treo bang cu");
		if (c > 0) dong(false, "AC-5: con ban sau loi");
		if (n < 1) dong(false, "AC-5: thu lai khong goi lai danh sach");
		await t.close();
	}

	console.log("== doi chu ky 1440");
	{
		const t = await d.moTrang(QT, 1440, duongDon(DON));
		await choBang(t);
		const idCu = await t.evaluate(() =>
			[...document.querySelectorAll("[data-hang-muc-tieu]")].map((e) =>
				e.getAttribute("data-hang-muc-tieu"),
			),
		);
		const chan = await datChan(t);
		await t.click("[data-chon-chu-ky]");
		await d.doi(t, () => document.querySelector("[role=option]") !== null);
		const kyKhac = await t.evaluateHandle(
			() =>
				[...document.querySelectorAll("[role=option]")].find(
					(e) =>
						e.getClientRects().length > 0 &&
						(e.textContent ?? "").includes("Quý 3"),
				) ?? null,
		);
		if (!(await kyKhac.evaluate((e) => e !== null)))
			await khongDo("o chon chu ky khong co Quy 3");
		chan.che = "giu";
		await t.evaluate(batMau, idCu);
		await kyKhac.click();
		await choMs(GIU_MS);
		chan.thaRa();
		await choHetBan(t);
		const s = await dungMau(t);
		const luc = s.filter((x) => x.luc <= GIU_MS && !x.url.includes(KY));
		const k = luc.length;
		const dc = demNeu(luc, (x) => x.hangCu > 0);
		const b = demNeu(luc, (x) => x.khungDich > 0);
		console.log(
			`AC-6 chu ky: ${k} mau · dong cu ${dc} · khung bang-hai-dong ${b}/${k}`,
		);
		if (k < MAU_TOI_THIEU) await khongDo("khong bat duoc luc doi chu ky");
		if (dc > 0 || b < k) dong(false, "AC-6: doi chu ky giu bang cu");
		await t.close();
	}
} catch (e) {
	await d.khongDoDuoc(e);
}
console.log(
	sai.length === 0 ? "KET LUAN: dat" : `KET LUAN: ${sai.length} dong SAI`,
);
if (sai.length > 0) d.dat("ket", false, `${sai.length} dong SAI`);
await d.ket("man-loc");
