import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { tenDb } from "../../../scripts/lan-do/kho-nhap.mjs";
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

const HERE = dirname(fileURLToPath(import.meta.url));
const BANG_CHUNG = join(
	HERE,
	"..",
	"..",
	"..",
	".acceptance-runs",
	"tien-te-chua-tai-khong-doan",
	"evidence",
);
const RONG = 1440;
const CAO = 900;
const KY_MONG = 10;
const MA = `tcct${Date.now().toString(36)}`;
const NHAN_SO_TIEN = "Giá trị";
const NHAN_TIEN_TE = "Tiền tệ";
const THU_LAI = "Thử lại";
const CAU_TAO_LOI =
	"Không tải được đồng tiền báo cáo — chọn đồng tiền bên cạnh để nhập số tiền.";
const CAU_NHANH_LOI =
	"Không tải được đồng tiền báo cáo, nên chưa lưu được số tiền. Bỏ trống số tiền để tạo thoả thuận, hoặc thử lại.";
const UNG_VIEN = ["EUR", "VND", "JPY"];
const DONG_BAO_CAO = "VND";
const SO = "150.000.000";
const CENTS = 15_000_000_000;
const CHO_DONG = 20_000;
const NBSP = /[  ]/g;

const CHO_SAN_SANG = 120_000;
const NGHI = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(BANG_CHUNG, { recursive: true });

async function choMayChu(url) {
	const han = Date.now() + CHO_SAN_SANG;
	let cuoi = "";
	while (Date.now() < han) {
		try {
			const res = await fetch(url, { redirect: "manual" });
			if (res.status < 500) return;
			cuoi = `tra ${res.status}`;
		} catch (e) {
			cuoi = String(e);
		}
		await NGHI(2000);
	}
	await khongDo(
		`KHONG DO DUOC: may chu ${url} khong san sang sau ${CHO_SAN_SANG / 1000}s — ${cuoi}`,
	);
}

await choMayChu(`${API}/`);
await choMayChu(`${APP}/`);

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

async function phienBen() {
	let cuoi = null;
	for (let lan = 0; lan < 6; lan += 1) {
		try {
			return phien();
		} catch (e) {
			cuoi = e;
			await NGHI(5000);
		}
	}
	return khongDo(
		`KHONG DO DUOC: tien de thieu — khong xin duoc phien dang nhap sau 6 lan: ${String(cuoi).slice(0, 200)}`,
	);
}

const cookie = await phienBen();
const slug = await suySlug(cookie);

async function doc(duong, vao) {
	const q =
		vao === undefined
			? ""
			: `?input=${encodeURIComponent(JSON.stringify(vao))}`;
	const res = await fetch(`${API}/api/trpc/${duong}${q}`, {
		headers: mu(cookie),
	});
	const chu = await res.text();
	if (!res.ok)
		return { loi: `${duong} tra ${res.status}: ${chu.slice(0, 160)}` };
	return { gia: JSON.parse(chu).result.data };
}

const thietLap = await doc("currency.settings");
if (thietLap.loi)
	await khongDo(`KHONG DO DUOC: tien de thieu — ${thietLap.loi}`);
const baoCaoGoc = thietLap.gia.reportingCurrency;
let baoCao = baoCaoGoc;

async function traBaoCao() {
	if (baoCao === baoCaoGoc) return;
	await goiApiTao(cookie, "currency.setReportingCurrency", {
		currency: baoCaoGoc,
	});
}

async function khongDoTraLai(...dong) {
	await traBaoCao();
	await khongDo(...dong);
}

async function vaiQuanTriTrongKhoDo() {
	const kho = tenDb(process.env.DATABASE_URL ?? "");
	if (kho === null || !isMeasureDatabase(kho)) {
		await khongDo(
			`KHONG DO DUOC: DATABASE_URL tro kho "${kho ?? "?"}" khong phai kho do dung-mot-lan — khong cap vai admin cho nguoi cua phien, khong ghi gi`,
		);
	}
	const { db } = await import("../../../packages/db/src/index.ts");
	const { WORKSPACE_ID } = await import(
		"../../../packages/db/src/workspace.ts"
	);
	const toi = await db.user.findUnique({
		where: { email: NGUOI },
		select: { id: true },
	});
	if (!toi)
		await khongDo(`KHONG DO DUOC: tien de thieu — khong thay nguoi ${NGUOI}`);
	await db.member.upsert({
		where: {
			organizationId_userId: { organizationId: WORKSPACE_ID, userId: toi.id },
		},
		create: {
			id: `member-${toi.id}`,
			organizationId: WORKSPACE_ID,
			userId: toi.id,
			role: "admin",
			createdAt: new Date(),
		},
		update: { role: "admin" },
	});
	console.log(`tien de: ${NGUOI} co vai admin trong kho do ${kho}`);
}

if (baoCao === "USD") {
	await vaiQuanTriTrongKhoDo();
	const doi = await goiApiTao(cookie, "currency.setReportingCurrency", {
		currency: DONG_BAO_CAO,
	});
	if (doi.loi) await khongDo(`KHONG DO DUOC: tien de thieu — ${doi.loi}`);
	baoCao = DONG_BAO_CAO;
	const doc2 = await doc("currency.settings");
	if (doc2.loi || doc2.gia.reportingCurrency !== DONG_BAO_CAO) {
		await khongDoTraLai(
			`KHONG DO DUOC: doi dong tien bao cao sang ${DONG_BAO_CAO} khong an — ${doc2.loi ?? doc2.gia.reportingCurrency}`,
		);
	}
	console.log(`tien de: dong tien bao cao ${baoCaoGoc} -> ${DONG_BAO_CAO}`);
}
const dongChon = UNG_VIEN.find((ma) => ma !== baoCao && ma !== "USD");

const toi = await doc("users.me");
if (toi.loi) await khongDoTraLai(`KHONG DO DUOC: tien de thieu — ${toi.loi}`);
const tenCongTy = `Cong ty ${MA}`;
const congTy = await goiApiTao(cookie, "companies.create", { name: tenCongTy });
if (congTy.loi)
	await khongDoTraLai(`KHONG DO DUOC: tien de thieu — ${congTy.loi}`);

async function donDep() {
	await traBaoCao();
	const tao = await doc("deals.list", { q: MA, pageSize: 50 });
	const ids = (tao.gia?.rows ?? []).map((r) => r.id);
	if (ids.length > 0) {
		await goiApiTao(cookie, "deals.bulkArchive", { ids });
		await goiApiTao(cookie, "deals.bulkPurge", { ids });
	}
	await goiApiTao(cookie, "companies.bulkArchive", { ids: [congTy.gia.id] });
	await goiApiTao(cookie, "companies.bulkPurge", { ids: [congTy.gia.id] });
}

async function dung(...dong) {
	await donDep();
	await khongDo(...dong);
}

const tienVi = (ma) =>
	new Intl.NumberFormat("vi", {
		style: "currency",
		currency: ma,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	})
		.format(CENTS / 100)
		.replace(NBSP, " ");

async function timThoaThuan(ten) {
	const tim = await doc("deals.list", { q: ten, pageSize: 5 });
	const hang = (tim.gia?.rows ?? []).find((r) => r.name === ten);
	if (!hang) return null;
	return (await doc("deals.byId", { id: hang.id })).gia ?? null;
}

let chan = false;
let daChan = 0;

const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
datTrinhDuyet(trinhDuyet);

async function moTrang(duong) {
	const trang = await trinhDuyet.newPage();
	await trang.setViewport({ width: RONG, height: CAO });
	const host = new URL(APP).hostname;
	await trang.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	await trang.setRequestInterception(true);
	trang.on("request", async (yc) => {
		const url = yc.url();
		if (
			!chan ||
			!url.includes("/api/trpc/") ||
			!url.includes("currency.settings")
		) {
			await yc.continue();
			return;
		}
		daChan += 1;
		const duongThuTuc = decodeURIComponent(new URL(url).pathname)
			.replace(/^.*\/api\/trpc\//, "")
			.split(",");
		const that = await fetch(url, {
			headers: { Cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
		});
		let lo = [];
		try {
			lo = JSON.parse(await that.text());
		} catch {
			lo = duongThuTuc.map(() => null);
		}
		const moi = duongThuTuc.map((ten, i) =>
			ten === "currency.settings"
				? {
						error: {
							json: {
								message: "chan boi thuoc do",
								code: -32603,
								data: {
									code: "INTERNAL_SERVER_ERROR",
									httpStatus: 500,
									path: ten,
								},
							},
						},
					}
				: lo[i],
		);
		await yc.respond({
			status: duongThuTuc.length === 1 ? 500 : 207,
			contentType: "application/json",
			body: JSON.stringify(moi),
		});
	});
	await trang.goto(`${APP}/${slug}${duong}`, {
		waitUntil: "load",
		timeout: CHO_TAI,
	});
	return trang;
}

const docO = (nhan) => {
	const nhanO = [...document.querySelectorAll('[role="dialog"] label')].filter(
		(l) => l.textContent?.trim() === nhan,
	);
	for (const l of nhanO.reverse()) {
		const o = l.htmlFor ? document.getElementById(l.htmlFor) : null;
		if (o instanceof HTMLInputElement) {
			o.setAttribute("data-do-o", "");
			const khung = o.closest('[data-slot="money-input"]');
			const form = o.closest("form");
			return {
				dong: khung?.querySelector("[aria-live]")?.textContent ?? null,
				coThuLai: [...(khung?.querySelectorAll("button") ?? [])].some(
					(b) => b.textContent?.trim() === "Thử lại",
				),
				nutTaoKhoa:
					form?.querySelector('button[type="submit"]')?.disabled ?? null,
				oChon:
					form
						?.querySelector(
							'[data-slot="select-trigger"][aria-label="Tiền tệ"]',
						)
						?.textContent?.trim() ?? null,
			};
		}
	}
	return null;
};

async function choDong(trang, nhan, muon) {
	await trang
		.waitForFunction(
			(nhan, muon) => {
				const l = [...document.querySelectorAll('[role="dialog"] label')].find(
					(x) => x.textContent?.trim() === nhan,
				);
				const o = l?.htmlFor ? document.getElementById(l.htmlFor) : null;
				const dong = o
					?.closest('[data-slot="money-input"]')
					?.querySelector("[aria-live]")
					?.textContent?.replace(/[  ]/g, " ");
				return dong === muon;
			},
			{ timeout: CHO_DONG },
			nhan,
			muon,
		)
		.catch(() => null);
	const d = await trang.evaluate(docO, nhan);
	if (d) d.dong = (d.dong ?? "").replace(NBSP, " ");
	return d;
}

async function goSo(trang, chu) {
	const thay = await trang
		.waitForFunction(
			(nhan) =>
				[...document.querySelectorAll('[role="dialog"] label')].some(
					(l) =>
						l.textContent?.trim() === nhan &&
						document.getElementById(l.htmlFor) instanceof HTMLInputElement,
				),
			{ timeout: CHO_TAI },
			NHAN_SO_TIEN,
		)
		.catch(() => null);
	if (!thay) await dung("KHONG DO DUOC: khong thay o so tien");
	await trang.evaluate(docO, NHAN_SO_TIEN);
	const o = await trang.$("[data-do-o]");
	await o.evaluate((el) => {
		el.focus();
		el.select();
	});
	await trang.keyboard.type(chu);
}

async function chonCongTy(trang) {
	await trang.click("#create-deal-company");
	await trang.waitForSelector("[cmdk-input]", {
		visible: true,
		timeout: CHO_TAI,
	});
	await trang.type("[cmdk-input]", tenCongTy);
	const muc = await trang
		.waitForFunction(
			(chu) =>
				[...document.querySelectorAll("[cmdk-item]")].find(
					(x) =>
						x.textContent?.includes(chu) &&
						x.getAttribute("aria-disabled") !== "true",
				) ?? null,
			{ timeout: CHO_TAI },
			tenCongTy,
		)
		.catch(() => null);
	if (!muc) await dung("KHONG DO DUOC: khong thay cong ty gieo trong o chon");
	await muc.asElement().click();
	await new Promise((r) => setTimeout(r, 300));
}

async function moTamTao(ten) {
	const trang = await moTrang("/deals?new=true");
	const form = await trang
		.waitForSelector("form#create-deal", { visible: true, timeout: CHO_TAI })
		.catch(() => null);
	if (!form) await dung("KHONG DO DUOC: tam tao thoa thuan khong mo");
	await trang.type(
		'form#create-deal input:not([data-slot="money-input"] input)',
		ten,
	);
	await chonCongTy(trang);
	return trang;
}

let khang = 0;
const hong = [];

try {
	chan = true;
	const tenCoSo = `${MA} tao co so`;
	const t1 = await moTamTao(tenCoSo);
	await goSo(t1, SO);
	const truoc = await choDong(t1, NHAN_SO_TIEN, CAU_TAO_LOI);
	khang += 1;
	if (truoc?.dong !== CAU_TAO_LOI) {
		hong.push(`tao truoc khi chon: dong «${truoc?.dong}» != «${CAU_TAO_LOI}»`);
	}
	khang += 1;
	if (truoc?.oChon !== NHAN_TIEN_TE) {
		hong.push(
			`tao truoc khi chon: o chon dong tien «${truoc?.oChon}» != «${NHAN_TIEN_TE}»`,
		);
	}
	await t1.screenshot({ path: join(BANG_CHUNG, "tao-loi-truoc-khi-chon.png") });
	await t1.click(`[data-slot="select-trigger"][aria-label="${NHAN_TIEN_TE}"]`);
	await t1.waitForSelector('[role="option"]', {
		visible: true,
		timeout: CHO_TAI,
	});
	await t1.evaluate((ma) => {
		const el = [...document.querySelectorAll('[role="option"]')].find(
			(x) => x.textContent?.trim() === ma,
		);
		el?.click();
	}, dongChon);
	const muonSau = `Đọc là ${tienVi(dongChon)}`;
	const sau = await choDong(t1, NHAN_SO_TIEN, muonSau);
	khang += 1;
	if (sau?.dong !== muonSau) {
		hong.push(
			`tao sau khi chon ${dongChon}: dong «${sau?.dong}» != «${muonSau}»`,
		);
	}
	await t1
		.waitForFunction(
			() => document.querySelectorAll('[role="option"]').length === 0,
			{
				timeout: CHO_TAI,
			},
		)
		.catch(() => null);
	await t1.screenshot({ path: join(BANG_CHUNG, "tao-sau-khi-chon.png") });
	await t1.click('button[type="submit"][form="create-deal"]');
	await new Promise((r) => setTimeout(r, 3000));
	const ban1 = await timThoaThuan(tenCoSo);
	khang += 1;
	if (ban1?.amountCents !== CENTS || ban1?.currency !== dongChon) {
		hong.push(
			`tao co so: ${ban1 ? `${ban1.amountCents} ${ban1.currency}` : "khong thay thoa thuan vua tao"} != ${CENTS} ${dongChon}`,
		);
	}
	await t1.close();

	const tenTrong = `${MA} tao so trong`;
	const t2 = await moTamTao(tenTrong);
	await t2.click('button[type="submit"][form="create-deal"]');
	await new Promise((r) => setTimeout(r, 3000));
	const ban2 = await timThoaThuan(tenTrong);
	khang += 1;
	if (ban2?.currency !== baoCao) {
		hong.push(
			`tao so trong: currency ${ban2 ? ban2.currency : "khong thay thoa thuan vua tao"} != ${baoCao}`,
		);
	}
	await t2.close();

	const tenNhanh = `${MA} nhanh`;
	const t3 = await moTrang(`/deals?record=company:${congTy.gia.id}&add=deal`);
	const thayNhanh = await t3
		.waitForFunction(
			(nhan) =>
				[...document.querySelectorAll('[role="dialog"] label')].some(
					(l) =>
						l.textContent?.trim() === nhan &&
						document.getElementById(l.htmlFor)?.closest("form"),
				),
			{ timeout: CHO_TAI },
			NHAN_SO_TIEN,
		)
		.catch(() => null);
	if (!thayNhanh)
		await dung("KHONG DO DUOC: them nhanh khong mo tren tam cong ty");
	await t3.evaluate(docO, NHAN_SO_TIEN);
	await t3.evaluate(() => {
		const form = document.querySelector("[data-do-o]")?.closest("form");
		form
			?.querySelector('input:not([data-slot="money-input"] input)')
			?.setAttribute("data-do-ten", "");
	});
	await t3.type("[data-do-ten]", tenNhanh);
	await goSo(t3, SO);
	const nhanhLoi = await choDong(t3, NHAN_SO_TIEN, CAU_NHANH_LOI);
	khang += 1;
	if (nhanhLoi?.dong !== CAU_NHANH_LOI || !nhanhLoi?.coThuLai) {
		hong.push(
			nhanhLoi?.coThuLai
				? `nhanh loi: dong «${nhanhLoi?.dong}» != «${CAU_NHANH_LOI}»`
				: "nhanh loi: khong thay nut Thử lại",
		);
	}
	khang += 1;
	if (nhanhLoi?.nutTaoKhoa !== false) {
		hong.push(`nhanh loi: nut Tao khoa ${nhanhLoi?.nutTaoKhoa} != false`);
	}
	await t3.screenshot({ path: join(BANG_CHUNG, "nhanh-loi.png") });
	chan = false;
	await t3.evaluate((chu) => {
		const khung = document
			.querySelector("[data-do-o]")
			?.closest('[data-slot="money-input"]');
		const b = [...(khung?.querySelectorAll("button") ?? [])].find(
			(x) => x.textContent?.trim() === chu,
		);
		b?.click();
	}, THU_LAI);
	const muonNhanh = `Đọc là ${tienVi(baoCao)}`;
	const nhanhSau = await choDong(t3, NHAN_SO_TIEN, muonNhanh);
	khang += 1;
	if (nhanhSau?.dong !== muonNhanh) {
		hong.push(`nhanh sau thu lai: dong «${nhanhSau?.dong}» != «${muonNhanh}»`);
	}
	khang += 1;
	if (nhanhSau?.coThuLai) hong.push("nhanh sau thu lai: nut Thử lại van con");
	await t3.screenshot({ path: join(BANG_CHUNG, "nhanh-sau-thu-lai.png") });
	await t3.evaluate(() => {
		document
			.querySelector("[data-do-o]")
			?.closest("form")
			?.querySelector('button[type="submit"]')
			?.click();
	});
	await new Promise((r) => setTimeout(r, 3000));
	const ban3 = await timThoaThuan(tenNhanh);
	khang += 1;
	if (ban3?.amountCents !== CENTS || ban3?.currency !== baoCao) {
		hong.push(
			`nhanh: ${ban3 ? `${ban3.amountCents} ${ban3.currency}` : "khong thay thoa thuan vua tao"} != ${CENTS} ${baoCao}`,
		);
	}
	await t3.close();
} finally {
	await donDep();
}

console.log(
	`dong bao cao=${baoCao} dong chon=${dongChon} yeu cau da chan=${daChan} khang-dinh=${khang}/${KY_MONG}`,
);
if (daChan === 0) {
	await khongDo("KHONG DO DUOC: khong yeu cau thiet lap tien te nao bi chan");
}
if (khang !== KY_MONG) {
	await khongDo(`KHONG DO DUOC: ma tran lech ban khai — khang-dinh=${khang}`);
}
for (const h of hong) console.log(`HONG ${h}`);
await ket(hong.length === 0 ? 0 : 1);
