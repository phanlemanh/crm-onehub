import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA = join(GOC, "_acceptance", "doi-ten-onehub-center", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3860";
const API = process.env.API_URL ?? "http://localhost:3861";
const CHO_MS = 120_000;
const CO_NEO_TOI_THIEU = 36;
const RONG_KHOI_TOI_DA = 576;
const LECH_TOI_DA = 1;
const NGUONG_THUONG = 4.5;
const NGUONG_LON = 3;
const CO_LON_PX = 24;
const CO_LON_DAM_PX = 18.66;
const DAM = 700;
const SANG_GIUA = 0.5;
const ANH_TOI_THIEU_BYTE = 20 * 1024;

const KHO = {
	375: { ten: "375", rong: 375, cao: 812 },
	1440: { ten: "1440", rong: 1440, cao: 900 },
	1920: { ten: "1920", rong: 1920, cao: 1080 },
};
const GIAO_DIEN = ["light", "dark"];
const THAM = process.argv.slice(2);
const CHI_VI_TRI = THAM.includes("--chi-vi-tri");
const CHUP = THAM.includes("--chup");
const KHO_CHON = THAM.includes("--kho")
	? THAM[THAM.indexOf("--kho") + 1]
	: null;

const KHO_DO = KHO_CHON ? [KHO[KHO_CHON]] : [KHO[1440], KHO[1920]];
const VACH_BO_CUC = CHI_VI_TRI
	? ["vi-tri", "tran"]
	: ["card", "neo", "mep", "rong", "h1"];
const VACH_MAU = ["nen", "cham", "duong-noi", "tuong-phan"];
const KHO_CHUP = [KHO[375], KHO[1440], KHO[1920]];

export const MA_TRAN = CHUP
	? KHO_CHUP.flatMap((k) => GIAO_DIEN.map((g) => `anh-${k.ten}-${g}`))
	: [
			...KHO_DO.flatMap((k) =>
				GIAO_DIEN.flatMap((g) => VACH_BO_CUC.map((v) => `${k.ten}/${g}-${v}`)),
			),
			...(CHI_VI_TRI
				? []
				: GIAO_DIEN.flatMap((g) => VACH_MAU.map((v) => `${g}-${v}`))),
		];

const dong = [];
function ghi(ma, dat, chu) {
	dong.push({ ma, dat, chu });
	console.log(`${dat ? "DUNG" : "SAI"} ${chu}`);
}

async function mo(trang, giaoDien, kho) {
	await trang.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: giaoDien },
	]);
	await trang.setViewport({ width: kho.rong, height: kho.cao });
	await trang.goto(`${APP}/sign-in`, {
		waitUntil: "networkidle0",
		timeout: CHO_MS,
	});
	await trang.waitForSelector("[data-khoi-huong-dan] [role=listitem]", {
		timeout: CHO_MS,
	});
}

async function docSignInOptions() {
	const res = await fetch(`${API}/api/trpc/sso.signInOptions`);
	if (!res.ok) throw new Error(`signInOptions ${res.status}`);
	const data = (await res.json())?.result?.data;
	return data?.json ?? data;
}

async function doBoCuc(trang, kho, g) {
	await mo(trang, g, kho);
	const r = await trang.evaluate(() => {
		const khoi = document.querySelector("[data-khoi-huong-dan] > div");
		const cot = khoi?.closest("section");
		const logo = cot?.querySelector("svg");
		const neo = [...(cot?.querySelectorAll("p") ?? [])].find((p) => {
			const cs = getComputedStyle(p);
			return cs.display !== "none" && Number.parseFloat(cs.fontSize) >= 30;
		});
		const hop = (e) => e?.getBoundingClientRect();
		return {
			card: cot ? cot.querySelectorAll("[data-slot=card]").length : -1,
			neoTag: neo?.tagName ?? null,
			neoCo: neo ? Number.parseFloat(getComputedStyle(neo).fontSize) : 0,
			lechKhoi: Math.abs((hop(khoi)?.left ?? -999) - (hop(logo)?.left ?? 0)),
			lechNeo: Math.abs((hop(neo)?.left ?? -999) - (hop(logo)?.left ?? 0)),
			rongKhoi: Math.round(hop(khoi)?.width ?? 0),
			h1: document.querySelectorAll("h1").length,
			cotTrai: (hop(cot)?.left ?? 999) < 10,
			tran: document.documentElement.scrollWidth > window.innerWidth,
		};
	});
	const o = `${kho.ten}/${g}`;
	if (CHI_VI_TRI) {
		ghi(
			`${o}-vi-tri`,
			r.cotTrai,
			`${o}: khoi ${r.cotTrai ? "o" : "KHONG o"} cot trai`,
		);
		ghi(`${o}-tran`, !r.tran, `${o}: ${r.tran ? "CO" : "khong"} tran ngang`);
		return;
	}
	ghi(
		`${o}-card`,
		r.card === 0,
		`${o}: ${r.card === 0 ? "khong co" : "co"} card trong cot trai`,
	);
	ghi(
		`${o}-neo`,
		r.neoTag === "P" && r.neoCo >= CO_NEO_TOI_THIEU,
		`${o}: dong gioi thieu ${r.neoTag ?? "-"} ${r.neoCo}px (can P >= ${CO_NEO_TOI_THIEU}px)`,
	);
	ghi(
		`${o}-mep`,
		r.lechKhoi <= LECH_TOI_DA && r.lechNeo <= LECH_TOI_DA,
		`${o}: lech mep voi logo — khoi ${r.lechKhoi}px, dong neo ${r.lechNeo}px (toi da ${LECH_TOI_DA})`,
	);
	ghi(
		`${o}-rong`,
		r.rongKhoi <= RONG_KHOI_TOI_DA,
		`${o}: khoi rong ${r.rongKhoi}px (toi da ${RONG_KHOI_TOI_DA})`,
	);
	ghi(`${o}-h1`, r.h1 === 1, `${o}: ${r.h1} h1 (can 1)`);
}

async function doMau(trang, g) {
	await mo(trang, g, KHO[1440]);
	const r = await trang.evaluate(
		({ NGUONG_THUONG, NGUONG_LON, CO_LON_PX, CO_LON_DAM_PX, DAM }) => {
			const ve = document
				.createElement("canvas")
				.getContext("2d", { willReadFrequently: true });
			const rgba = (mau) => {
				ve.clearRect(0, 0, 1, 1);
				ve.fillStyle = "#000";
				ve.fillStyle = mau;
				ve.fillRect(0, 0, 1, 1);
				const [r0, g0, b0, a0] = ve.getImageData(0, 0, 1, 1).data;
				return [r0, g0, b0, a0 / 255];
			};
			const pha = (tren, duoi) =>
				tren
					.slice(0, 3)
					.map((v, i) => Math.round(tren[3] * v + (1 - tren[3]) * duoi[i]));
			const kenh = (v) => {
				const s = v / 255;
				return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
			};
			const sang = ([a, b, c]) =>
				0.2126 * kenh(a) + 0.7152 * kenh(b) + 0.0722 * kenh(c);
			const tiLe = (a, b) => {
				const [x, y] = [sang(a), sang(b)].sort((m, n) => n - m);
				return (x + 0.05) / (y + 0.05);
			};
			const khoi = document.querySelector("[data-khoi-huong-dan]");
			const cot = khoi?.closest("section");
			const nenCot = rgba(getComputedStyle(cot).backgroundColor);
			const nenBody = rgba(getComputedStyle(document.body).backgroundColor);
			const luoi = cot?.querySelector("[data-slot=luoi-cham]");
			const anhLuoi = luoi ? getComputedStyle(luoi).backgroundImage : "";
			const mauCham =
				anhLuoi.match(/radial-gradient\((.+?)\s+1px/)?.[1] ?? null;
			const sep = cot?.querySelector("[data-slot=stepper-separator]");
			const mauSep = sep ? rgba(getComputedStyle(sep).backgroundColor) : null;
			const khac = (a, b) => a.some((v, i) => Math.abs(v - b[i]) > 2);
			const phanTu = [...(khoi?.querySelectorAll("*") ?? [])].filter((e) =>
				[...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
			);
			const tuongPhan = phanTu.map((e) => {
				const cs = getComputedStyle(e);
				const chu = pha(rgba(cs.color), nenCot);
				const co = Number.parseFloat(cs.fontSize);
				const lon =
					co >= CO_LON_PX ||
					(co >= CO_LON_DAM_PX && Number(cs.fontWeight) >= DAM);
				const t = tiLe(chu, nenCot);
				return {
					chu: e.textContent.trim().slice(0, 30),
					tiLe: Math.round(t * 100) / 100,
					dat: t >= (lon ? NGUONG_LON : NGUONG_THUONG),
				};
			});
			return {
				sangBody: sang(nenBody),
				cham:
					mauCham === null
						? null
						: khac(pha(rgba(mauCham), nenCot), nenCot.slice(0, 3)),
				sep:
					mauSep === null
						? null
						: khac(pha(mauSep, nenCot), nenCot.slice(0, 3)),
				tuongPhan,
			};
		},
		{ NGUONG_THUONG, NGUONG_LON, CO_LON_PX, CO_LON_DAM_PX, DAM },
	);
	const nenDat =
		g === "light" ? r.sangBody > SANG_GIUA : r.sangBody < SANG_GIUA;
	ghi(`${g}-nen`, nenDat, `${g}: do sang nen trang ${r.sangBody.toFixed(3)}`);
	ghi(
		`${g}-cham`,
		r.cham === true,
		`${g}: ${r.cham === null ? "khong thay luoi-cham" : r.cham ? "cham khac mau nen" : "cham trung mau nen"}`,
	);
	ghi(
		`${g}-duong-noi`,
		r.sep === true,
		`${g}: ${r.sep === null ? "khong thay duong noi" : r.sep ? "duong noi khac mau nen" : "duong noi trung mau nen"}`,
	);
	const truot = r.tuongPhan.filter((t) => !t.dat);
	ghi(
		`${g}-tuong-phan`,
		r.tuongPhan.length > 0 && truot.length === 0,
		`${g}: ${r.tuongPhan.length} chu, truot AA: ${truot.map((t) => `«${t.chu}» ${t.tiLe}`).join(", ") || "-"}`,
	);
}

async function chup(trang) {
	mkdirSync(RA, { recursive: true });
	for (const k of KHO_CHUP) {
		for (const g of GIAO_DIEN) {
			await mo(trang, g, k);
			const tep = join(RA, `sign-in-${k.ten}-${g}.png`);
			await trang.screenshot({ path: tep });
			const co = statSync(tep).size;
			ghi(
				`anh-${k.ten}-${g}`,
				co > ANH_TOI_THIEU_BYTE,
				`anh ${relative(GOC, tep)} ${co} byte`,
			);
		}
	}
}

async function main() {
	await canhCay();
	const options = await docSignInOptions();
	if (options?.google !== true) {
		console.log("KHONG DO DUOC: tien de khong dung — API tra google=false");
		process.exit(2);
	}
	const trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	try {
		const trang = await (await trinhDuyet.createBrowserContext()).newPage();
		await trang.setExtraHTTPHeaders({ "accept-language": "vi" });
		if (CHUP) {
			await chup(trang);
		} else {
			for (const k of KHO_DO)
				for (const g of GIAO_DIEN) await doBoCuc(trang, k, g);
			if (!CHI_VI_TRI) for (const g of GIAO_DIEN) await doMau(trang, g);
		}
	} finally {
		await trinhDuyet.close();
	}
	const thay = new Set(dong.map((d) => d.ma));
	for (const ma of MA_TRAN) if (!thay.has(ma)) ghi(ma, false, `thieu ${ma}`);
	if (!CHUP && !CHI_VI_TRI) {
		mkdirSync(RA, { recursive: true });
		writeFileSync(
			join(RA, "do-cot-trai.json"),
			`${JSON.stringify(dong, null, "\t")}\n`,
		);
	}
	const sai = dong.filter((d) => !d.dat).length;
	const ma = sai === 0 ? 0 : 1;
	console.log(
		`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI — ma thoat ${ma}`,
	);
	process.exit(ma);
}

main().catch((loi) => {
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(2);
});
