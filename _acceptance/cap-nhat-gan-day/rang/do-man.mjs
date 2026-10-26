import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	ket,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	bao,
	choThay,
	DO,
	GOC,
	mo,
	nghi,
	tongKet,
} from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";
import { taoNguCanh } from "../../vo-khu-muc-tieu/rang/do-man-ngu-canh.mjs";

const HO_SO = "cap-nhat-gan-day";
const PHA = process.env.CNG_PHA ?? "";
const MOI_PHA = [
	"",
	"dao-thu-tu",
	"bot-dong",
	"khong-lam-moi",
	"tran",
	"cat-ten",
];
const MOI_EVAL = ["E3", "E14", "E16"];
const CHEP_ANH = process.env.CNG_CHEP_ANH === "1";
const BANG_CHUNG = join(GOC, ".acceptance-runs", HO_SO, "evidence");
const BANG_CHUNG_HO_SO = join(GOC, "_acceptance", HO_SO, "evidence");
const DONG = "[data-trang-thai='ST-cng-codulieu'] [data-dong-tin]";
const CHO_TRA_LOI_MS = 10_000;
const CHON = new Set(
	(process.env.EVAL ?? "")
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);
const chay = (e) => CHON.size === 0 || CHON.has(e);

if (!MOI_PHA.includes(PHA)) {
	console.log(`KHONG DO DUOC: CNG_PHA=${PHA} la`);
	process.exit(2);
}
const laMa = [...CHON].filter((e) => !MOI_EVAL.includes(e));
if (laMa.length > 0) {
	console.log(`KHONG DO DUOC: EVAL ${laMa.join(", ")} khong thuoc ban do nay`);
	process.exit(2);
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

function chepAnh(ten) {
	if (!CHEP_ANH) return;
	mkdirSync(BANG_CHUNG_HO_SO, { recursive: true });
	copyFileSync(join(BANG_CHUNG, ten), join(BANG_CHUNG_HO_SO, ten));
}

const duongTrang = (n) => n.w(`/okr/cap-nhat-gan-day?kyOkr=${n.ky.hienHanh}`);

async function docMan(trang) {
	return trang.evaluate((chon) => {
		const dong = [...document.querySelectorAll(chon)];
		const chip =
			document
				.querySelector("[data-pham-vi][data-state='on']")
				?.getAttribute("data-pham-vi") ?? "";
		const chan = [...document.querySelectorAll("span")]
			.map((s) => s.textContent ?? "")
			.find((s) => /trong số/.test(s));
		const tong = Number(
			(chan ?? "").split("trong số").at(-1)?.replace(/\D+/g, "") ?? "NaN",
		);
		const dau = dong[0];
		const thuTu = dau
			? [
					"[data-dong-nguoi]",
					"[data-dong-luc]",
					"[data-mo-kr]",
					"[data-dong-muc-tieu]",
					"[data-dong-so]",
				].map((c) => dau.querySelector(c))
			: [];
		const dungThuTu =
			thuTu.length > 0 &&
			thuTu.every(Boolean) &&
			thuTu.every(
				(el, i) =>
					i === 0 ||
					(thuTu[i - 1].compareDocumentPosition(el) &
						Node.DOCUMENT_POSITION_FOLLOWING) !==
						0,
			);
		return {
			ids: dong.map((d) => d.getAttribute("data-dong-tin") ?? ""),
			chip,
			tong,
			dungThuTu,
			coGhiChu: dau?.querySelector("[data-dong-ghi-chu]") !== null,
		};
	}, DONG);
}

async function e3(n) {
	const t = n.may.truong;
	const r = await mo(t, duongTrang(n), DONG);
	if (!r.thay) {
		const rong = await t.trang.$("[data-trang-thai='ST-cng-rong']");
		if (rong)
			await khongDo(
				"KHONG DO DUOC: khong dung duoc Given AC-2 — dong tin rong",
			);
		bao(false, "", "SAI AC-2 khong thay dong tin");
		return;
	}
	if (PHA === "bot-dong")
		await t.trang.evaluate((chon) => {
			const ds = document.querySelectorAll(chon);
			ds[ds.length - 1]?.remove();
		}, DONG);
	const man = await docMan(t.trang);
	const api = await n.api.truong.hoi("okr.capNhatGanDay", {
		cycleId: n.ky.hienHanh,
		phamVi: man.chip || "tat-ca",
		trang: 1,
	});
	if (api.total === 0)
		await khongDo("KHONG DO DUOC: khong dung duoc Given AC-2 — total 0");
	const rowsApi = PHA === "dao-thu-tu" ? [...api.rows].reverse() : api.rows;
	const idApi = rowsApi.map((d) => d.checkInId);
	const lech = [];
	if (man.ids.length !== idApi.length) lech.push("so dong != rows");
	if (man.ids.join("|") !== idApi.join("|")) lech.push("thu tu lech");
	if (man.tong !== api.total)
		lech.push(`chan ${man.tong} != total ${api.total}`);
	if (!man.dungThuTu) lech.push("dong dau thieu truong hay sai thu tu");
	if (Boolean(api.rows[0]?.ghiChu) !== man.coGhiChu)
		lech.push("ghi chu dong dau lech");
	bao(
		lech.length === 0,
		`DUNG AC-2 dong-tin: so-dong=${man.ids.length}, total=${api.total}, thu-tu=khop`,
		`SAI AC-2 ${lech.join("; ")}`,
	);

	const dong = await t.trang.$(`${DONG}:has([data-mo-tra-loi])`);
	if (!dong) {
		bao(false, "", "SAI AC-6 khong co lan moi nhat nao co nut Tra loi");
		return;
	}
	const id = await dong.evaluate((d) => d.getAttribute("data-dong-tin"));
	const chon = `[data-dong-tin='${id}']`;
	const truoc = await t.trang.$$eval(
		`${chon} [data-tra-loi]`,
		(ds) => ds.length,
	);
	const chu = `Bàn đo VK12 trả lời ${Date.now()}`;
	await t.trang.click(`${chon} [data-mo-tra-loi]`);
	await choThay(t.trang, `${chon} [data-o-tra-loi] textarea`);
	await t.trang.type(`${chon} [data-o-tra-loi] textarea`, chu);
	if (PHA === "khong-lam-moi") {
		await t.trang.setRequestInterception(true);
		t.trang.on("request", (req) =>
			req.url().includes("okr.capNhatGanDay") ? req.abort() : req.continue(),
		);
	}
	const moc = t.dieuHuong.length;
	await t.trang.click(`${chon} [data-gui-tra-loi]`);
	const dat = await t.trang
		.waitForFunction(
			(c, n0, s) => {
				const ds = [...document.querySelectorAll(`${c} [data-tra-loi]`)];
				return (
					ds.length === n0 + 1 && ds.some((d) => d.textContent?.includes(s))
				);
			},
			{ timeout: CHO_TRA_LOI_MS, polling: DO.cho.nhipMs },
			chon,
			truoc,
			chu,
		)
		.then(() => true)
		.catch(() => false);
	if (PHA === "khong-lam-moi") await t.trang.setRequestInterception(false);
	bao(
		dat && t.dieuHuong.length === moc,
		"DUNG AC-6 tra-loi tren man: +1",
		"SAI AC-6 tra loi khong hien duoi dong",
	);
}

async function doKho375(t) {
	return t.trang.evaluate((pha) => {
		if (pha === "tran") {
			const chen = document.createElement("div");
			chen.style.width = "500px";
			chen.style.height = "1px";
			document.querySelector("[data-dong-tin-ds]")?.appendChild(chen);
		}
		const ten = [...document.querySelectorAll("[data-mo-kr]")];
		if (pha === "cat-ten")
			for (const el of ten) {
				el.style.whiteSpace = "nowrap";
				el.style.overflow = "hidden";
				el.style.textOverflow = "ellipsis";
				el.style.maxWidth = "8rem";
			}
		const hang = document.querySelector("[data-loc-pham-vi]");
		const chip =
			hang !== null &&
			(hang.scrollWidth <= hang.clientWidth ||
				["auto", "scroll"].includes(getComputedStyle(hang).overflowX));
		const biCat = ten.filter((el) => {
			const s = getComputedStyle(el);
			return (
				s.textOverflow === "ellipsis" ||
				s.whiteSpace === "nowrap" ||
				el.scrollWidth > el.clientWidth + 1
			);
		}).length;
		const dongNhieu = ten.filter((el) => {
			const r = document.createRange();
			r.selectNodeContents(el);
			return (
				new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size >= 2
			);
		}).length;
		return {
			tran: document.documentElement.scrollWidth - window.innerWidth,
			chip,
			biCat,
			soTen: ten.length,
			dongNhieu,
		};
	}, PHA);
}

async function e16(n) {
	const t = n.may.truong;
	await t.trang.setViewport({
		width: DO.kho.dienThoai.rong,
		height: DO.kho.dienThoai.cao,
	});
	const r = await mo(t, duongTrang(n), DONG);
	const lech = [];
	if (!r.thay) {
		bao(false, "", "SAI AC-9 khong thay dong tin o 375");
		return;
	}
	const dau = await doKho375(t);
	await t.trang.click(`${DONG} [data-mo-tra-loi]`);
	if (!(await choThay(t.trang, "[data-o-tra-loi]")))
		lech.push("o tra loi khong mo");
	await nghi(DO.cho.langMs);
	const mo_ = await doKho375(t);
	if (dau.soTen === 0) lech.push("khong co ten KR nao");
	if (dau.dongNhieu === 0) lech.push("khong ten KR nao xuong dong");
	for (const [ten, d] of [
		["tat-ca", dau],
		["o-tra-loi", mo_],
	]) {
		if (d.tran > 0) lech.push(`tran ngang ${d.tran} (${ten})`);
		if (!d.chip) lech.push(`chip khong cuon (${ten})`);
		if (d.biCat > 0) lech.push(`ten KR bi cat ${d.biCat}/${d.soTen} (${ten})`);
	}
	bao(
		lech.length === 0,
		"DUNG AC-9 375: tran ngang 0, chip cuon, ten KR xuong dong",
		`SAI AC-9 ${lech.join("; ")}`,
	);
	await t.trang.setViewport({
		width: DO.kho.mayTinh.rong,
		height: DO.kho.mayTinh.cao,
	});
}

async function e14(n) {
	const t = n.may.truong;
	mkdirSync(BANG_CHUNG, { recursive: true });
	for (const kho of [DO.kho.mayTinh, DO.kho.dienThoai]) {
		await t.trang.setViewport({ width: kho.rong, height: kho.cao });
		await mo(t, duongTrang(n), DONG);
		const anh = `cap-nhat-${kho.ten}.png`;
		await t.trang.screenshot({ path: join(BANG_CHUNG, anh), fullPage: true });
		chepAnh(anh);
		await t.trang.click(`${DONG} [data-mo-tra-loi]`).catch(() => null);
		await choThay(t.trang, "[data-o-tra-loi]");
		await nghi(DO.cho.langMs);
		const anhTraLoi = `tra-loi-${kho.ten}.png`;
		await t.trang.screenshot({
			path: join(BANG_CHUNG, anhTraLoi),
			fullPage: true,
		});
		chepAnh(anhTraLoi);
	}
	await t.trang.setViewport({
		width: DO.kho.mayTinh.rong,
		height: DO.kho.mayTinh.cao,
	});
	bao(true, "DUNG E14 da chup 4 anh", "");
}

console.log(
	`do-man VK12: ${CHON.size === 0 ? "chay tron" : `chi ${[...CHON].join(", ")}`}${PHA ? ` · pha-thu ${PHA}` : ""}`,
);

try {
	const n = await taoNguCanh({ canSoan: false });
	if (chay("E14")) await e14(n);
	if (chay("E16")) await e16(n);
	if (chay("E3")) await e3(n);
	await n.trinhDuyet.close();
} catch (loi) {
	console.log(`KHONG DO DUOC: ban do vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}

console.log(
	CHEP_ANH
		? `anh: ${BANG_CHUNG_HO_SO}`
		: `anh: ${BANG_CHUNG} (khong chep sang ho so — dat CNG_CHEP_ANH=1 o buoc cua E14)`,
);
const { dung, sai } = tongKet();
console.log(`KET LUAN VK12: ${dung} DUNG, ${sai} SAI`);
await db.$disconnect();
await ket(sai === 0 ? 0 : 1);
