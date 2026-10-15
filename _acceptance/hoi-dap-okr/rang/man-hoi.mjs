import { readdirSync } from "node:fs";
import { join } from "node:path";
import {
	batAgentOkr,
	cauThieuKhoaSoan,
	chayTrongPhienSoan,
	coKhoaMoHinhSoan,
	PHIEN_SOAN,
	trongPhienSoan,
} from "../../soan-okr-cung-tro-ly/rang/phien-soan.mjs";
import {
	napBoMau,
	phienCookie,
	thuMau,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { chepSangEvidence, GOC, PHIEN_HOI, RA_HOI } from "./phien-hoi.mjs";

const LENH =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/hoi-dap-okr/rang/man-hoi.mjs"';
const KHO = { rong: 1280, hep: 375 };
const CHO_TRA_LOI_MS = 180_000;
const NGUOI = { thanhVien: "ngo-van-toan", vaiOkr: "thai-minh-chau" };
const CAU = "Mục tiêu giữ đà tăng trưởng bán lẻ miền Bắc đang thế nào?";
const CHU_QUAY_LAI = "Quay lại";
const CAU_HAI = "KR nào trong Mục tiêu đó đang chậm nhất?";
const SEL = {
	nut: '[data-nut="hoi-kara"]',
	khung: '[data-khung="hoi-okr"]',
	oGo: '[data-khung="hoi-okr"] textarea',
	nhanTrich: "[data-nhan-trich]",
	moTrich: "[data-trich-okr]",
	phanHoi: '[data-slot="ai-feedback"]',
	thuLai: '[data-slot="kara-retry"]',
	ngan: "[data-slot='sheet-content'], [data-slot='drawer-content']",
	nutGo: '[data-khung="hoi-okr"] [data-slot="kara-composer"] button',
	nutKhung: "[data-slot='sheet-content'] button, [data-slot='drawer-content'] button",
};

process.env.BANG_CHUNG ??= join(RA_HOI, "evidence");

async function guiCau(d, t) {
	await d.bamSel(t, SEL.oGo);
	await t.keyboard.type(CAU);
	await t.keyboard.press("Enter");
}

async function trongPhien() {
	const nap = napBoMau();
	if (nap.ma !== 0) {
		console.log(`KHONG DO DUOC: okr:mau thoat ${nap.ma}: ${nap.dong}`);
		return PHIEN_HOI.ma.khongDo;
	}
	const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");
	const okr = await batAgentOkr({
		cong: Number(process.env[PHIEN_SOAN.bienCong]),
		thuMuc: RA_HOI,
	});
	let daTat = false;
	const tat = async () => {
		if (!daTat) await okr.dung();
		daTat = true;
	};
	const hong = [];
	const loiConsole = [];
	const ghiLoi = (t, nhan) =>
		t.on("console", (m) => {
			if (m.type() === "error")
				loiConsole.push(`${nhan}: ${m.text().slice(0, 200)}`);
		});
	let d = null;
	const buoc = async (so, ham) => {
		try {
			await ham();
		} catch (e) {
			hong.push(`buoc ${so}: ${e?.message ?? e}`);
			console.log(`buoc ${so}: HONG — ${e?.message ?? e}`);
			await d
				?.trangCuoi()
				?.screenshot({
					path: join(process.env.BANG_CHUNG, `hdo-loi-buoc-${so}.png`),
				})
				.catch(() => null);
		}
	};
	try {
		d = await lib.moDo();
		const tv = phienCookie(thuMau(NGUOI.thanhVien));
		await d.batTrinhDuyet(tv);

		await buoc(1, async () => {
			const t = await d.moTrang(tv, KHO.rong, "/okr");
			ghiLoi(t, "1280");
			await d.bamSel(t, SEL.nut);
			await d.doi(
				t,
				() =>
					window.location.search.includes("record=hoi-okr%3A") ||
					window.location.search.includes("record=hoi-okr:"),
			);
			await d.doi(t, (s) => window.__tim(s).length > 0, SEL.khung);
			await d.chup(t, "hdo-01-cot-trong.png");
			console.log("buoc 1: dat — nut Hoi Kara mo cot, URL co record=hoi-okr");
		});

		await buoc(2, async () => {
			const t = d.trangCuoi();
			await guiCau(d, t);
			await t.waitForFunction(
				(s) => window.__tim(s).length > 0,
				{ timeout: CHO_TRA_LOI_MS },
				SEL.nhanTrich,
			);
			const so = await t.evaluate(
				(a, b) => ({
					trich: window.__tim(a).length,
					phanHoi: window.__tim(b).length,
				}),
				SEL.nhanTrich,
				SEL.phanHoi,
			);
			if (so.trich < 1 || so.phanHoi < 1)
				throw new Error(`hdo man: trich ${so.trich}, phan hoi ${so.phanHoi}`);
			await d.chup(t, "hdo-02-tra-loi.png");
			console.log(`buoc 2: dat — ${so.trich} trich, ${so.phanHoi} phan hoi`);
		});

		await buoc(3, async () => {
			const t = d.trangCuoi();
			await d.bamSel(t, SEL.nhanTrich);
			await d.bamSel(t, SEL.moTrich);
			await d.doi(t, () =>
				/record=[^&]*(objective|kr)(%3A|:)/.test(window.location.search),
			);
			await d.chup(t, "hdo-03-mo-trich.png");
			console.log("buoc 3: dat — bam trich mo khung Muc tieu hay KR chong len");
		});

		await buoc("3b", async () => {
			const t = d.trangCuoi();
			await d.bamChu(t, SEL.nutKhung, CHU_QUAY_LAI);
			await d.doi(t, (s) => window.__tim(s).length > 0, SEL.khung);
			await t.waitForFunction(
				(s) => window.__tim(s).length > 0,
				{ timeout: CHO_TRA_LOI_MS },
				SEL.phanHoi,
			);
			const truoc = await t.evaluate(
				(s) => window.__tim(s).length,
				SEL.phanHoi,
			);
			await t.waitForFunction(
				(s) => {
					const nut = [...document.querySelectorAll(s)];
					return nut.length > 0 && nut.every((n) => !n.disabled);
				},
				{ timeout: CHO_TRA_LOI_MS },
				SEL.nutGo,
			);
			await d.bamSel(t, SEL.oGo);
			await t.keyboard.type(CAU_HAI);
			await t.keyboard.press("Enter");
			await t.waitForFunction(
				([s, n]) => window.__tim(s).length > n,
				{ timeout: CHO_TRA_LOI_MS },
				[SEL.phanHoi, truoc],
			);
			const thuLai = await t.evaluate(
				(s) => window.__tim(s).length,
				SEL.thuLai,
			);
			if (thuLai > 0)
				throw new Error(`hdo man: quay lai roi hoi tiep hien ${thuLai} Thu lai`);
			await d.chup(t, "hdo-03b-quay-lai-hoi-tiep.png");
			console.log(
				`buoc 3b: dat — quay lai thay ${truoc} cau tra loi cu, hoi tiep nhan cau moi`,
			);
		});

		await buoc(4, async () => {
			const t = await d.moTrang(tv, KHO.hep, "/okr");
			ghiLoi(t, "375");
			await d.bamSel(t, SEL.nut);
			await d.doi(t, (s) => window.__tim(s).length > 0, SEL.khung);
			const r = await t.evaluate((s) => {
				const e = document.querySelector(s)?.getBoundingClientRect();
				return e
					? {
							trai: Math.round(e.left),
							rong: Math.round(e.width),
							man: window.innerWidth,
						}
					: null;
			}, SEL.ngan);
			if (!r || r.trai > 1 || r.rong < r.man - 1)
				throw new Error(`hdo man: 375 khong phu toan man ${JSON.stringify(r)}`);
			const ngang = await d.cuonNgang(t);
			if (ngang.length > 0)
				throw new Error(`hdo man: cuon ngang ${ngang.join(", ")}`);
			await d.chup(t, "hdo-04-375.png");
			console.log(`buoc 4: dat — 375 px cot phu ${r.rong}/${r.man}`);
		});

		await buoc(5, async () => {
			const ok = phienCookie(thuMau(NGUOI.vaiOkr));
			const t = await d.moTrang(ok, KHO.rong, "");
			ghiLoi(t, "tong-quan");
			await d.doi(t, (s) => window.__tim(s).length > 0, SEL.nut);
			await d.chup(t, "hdo-05-tong-quan-chi-okr.png");
			console.log("buoc 5: dat — tong quan vai chi OKR co nut Hoi Kara");
		});

		await buoc(6, async () => {
			await tat();
			const t = await d.moTrang(tv, KHO.rong, "/okr");
			await d.bamSel(t, SEL.nut);
			await d.doi(t, (s) => window.__tim(s).length > 0, SEL.khung);
			await guiCau(d, t);
			await t.waitForFunction(
				(s) => window.__tim(s).length > 0,
				{ timeout: CHO_TRA_LOI_MS },
				SEL.thuLai,
			);
			await d.chup(t, "hdo-06-loi-thu-lai.png");
			console.log("buoc 6: dat — Kara hong thi hien Thu lai");
		});

		for (const ten of readdirSync(process.env.BANG_CHUNG).filter(
			(t) => t.startsWith("hdo-") && t.endsWith(".png"),
		))
			chepSangEvidence(join(process.env.BANG_CHUNG, ten), ten);
		if (loiConsole.length > 0) {
			hong.push(`loi console app buoc 1-5: ${loiConsole.length}`);
			for (const l of loiConsole.slice(0, 10)) console.log(`  ${l}`);
		}
		console.log(hong.length === 0 ? "DAT" : `KHONG DAT — ${hong.join(" · ")}`);
		return hong.length === 0 ? PHIEN_HOI.ma.dat : PHIEN_HOI.ma.khongDat;
	} finally {
		await d
			?.trangCuoi()
			?.browser()
			.close()
			.catch(() => null);
		await tat();
	}
}

async function main() {
	if (!coKhoaMoHinhSoan()) {
		console.log(`KHONG DO DUOC: ${cauThieuKhoaSoan()}`);
		return PHIEN_HOI.ma.khongDo;
	}
	if (!trongPhienSoan()) return chayTrongPhienSoan(LENH);
	try {
		return await trongPhien();
	} catch (e) {
		console.log(`KHONG DO DUOC: ${e?.stack ?? e}`);
		return PHIEN_HOI.ma.khongDo;
	}
}

process.exit(await main());
