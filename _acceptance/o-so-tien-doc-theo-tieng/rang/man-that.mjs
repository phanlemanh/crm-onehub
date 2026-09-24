import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
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
	phien,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANG_CHUNG = join(HERE, "..", "..", "..", ".acceptance-runs", "o-so-tien-doc-theo-tieng", "evidence");
const CAO = 900;
const KHO_TAO = [1440, 375];
const KY_MONG = 11;
const MA = `stdt${Date.now().toString(36)}`;
const NHAN_SO_TIEN = { vi: "Giá trị", en: "Amount" };
const NHAN_TIEN_TE = { vi: "Tiền tệ", en: "Currency" };
const CHO_NGAN = 1500;
const NBSP = /[  ]/g;

mkdirSync(BANG_CHUNG, { recursive: true });

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

const cookie = phien();
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

const toi = await doc("users.me");
if (toi.loi) await khongDo(`KHONG DO DUOC: tien de thieu — ${toi.loi}`);
const congTy = await goiApiTao(cookie, "companies.create", {
	name: `Cong ty ${MA}`,
});
if (congTy.loi) await khongDo(`KHONG DO DUOC: tien de thieu — ${congTy.loi}`);

const daGieo = [];
let trinhDuyet = null;

async function donDep() {
	const tao = await doc("deals.list", { q: MA, pageSize: 50 });
	const ids = [
		...new Set([...daGieo, ...(tao.gia?.rows ?? []).map((r) => r.id)]),
	];
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

const gieo = await goiApiTao(cookie, "deals.create", {
	name: `${MA} sua`,
	companyId: congTy.gia.id,
	ownerId: toi.gia.id,
	amountCents: 100_000,
	currency: "USD",
});
if (gieo.loi) await dung(`KHONG DO DUOC: tien de thieu — ${gieo.loi}`);
daGieo.push(gieo.gia.id);

trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
datTrinhDuyet(trinhDuyet);

async function moTrang(tieng, rong, duong) {
	const trang = await trinhDuyet.newPage();
	await trang.setViewport({ width: rong, height: CAO });
	const host = new URL(APP).hostname;
	await trang.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: tieng, domain: host, path: "/" },
	);
	await trang.goto(`${APP}/${slug}${duong}`, {
		waitUntil: "load",
		timeout: CHO_TAI,
	});
	await trang
		.waitForNetworkIdle({ idleTime: 500, timeout: CHO_TAI })
		.catch(() => null);
	return trang;
}

const danhDauO = (nhan) => {
	for (const cu of document.querySelectorAll("[data-do-o]")) {
		cu.removeAttribute("data-do-o");
	}
	const nhanO = [...document.querySelectorAll('[role="dialog"] label')].filter(
		(l) => l.textContent?.trim() === nhan,
	);
	for (const l of nhanO.reverse()) {
		const o = l.htmlFor ? document.getElementById(l.htmlFor) : null;
		if (o instanceof HTMLInputElement) {
			o.setAttribute("data-do-o", "");
			return true;
		}
	}
	return false;
};

const docO = () => {
	const o = document.querySelector("[data-do-o]");
	const khung = o?.closest('[data-slot="money-input"]');
	return {
		co: o instanceof HTMLInputElement && o.isConnected,
		gia: o?.value ?? null,
		invalid: o?.getAttribute("aria-invalid") ?? null,
		dong: khung?.querySelector("[aria-live]")?.textContent ?? null,
		tran: document.documentElement.scrollWidth > innerWidth + 1,
	};
};

const sach = (chu) => (chu ?? "").replace(NBSP, " ");

async function goVao(trang, nhan, chu) {
	const thay = await trang
		.waitForFunction(danhDauO, { timeout: CHO_TAI }, nhan)
		.catch(() => null);
	if (!thay) await dung(`KHONG DO DUOC: khong thay o nhap cua nhan «${nhan}»`);
	const o = await trang.$("[data-do-o]");
	await o.evaluate((el) => {
		el.focus();
		el.select();
	});
	if (chu === "") await trang.keyboard.press("Backspace");
	else await trang.keyboard.type(chu);
	return o;
}

async function bamTheoChu(trang, chon, chu) {
	const ok = await trang.evaluate(
		(chon, chu) => {
			const el = [...document.querySelectorAll(chon)].find(
				(x) => x.textContent?.trim() === chu,
			);
			if (!el) return false;
			el.click();
			return true;
		},
		chon,
		chu,
	);
	return ok;
}

let khang = 0;
const hong = [];

for (const rong of KHO_TAO) {
	const trang = await moTrang("vi", rong, "/deals?new=true");
	const form = await trang
		.waitForSelector("form#create-deal", { visible: true, timeout: CHO_TAI })
		.catch(() => null);
	if (!form)
		await dung(`KHONG DO DUOC: ${rong}/vi tam tao thoa thuan khong mo`);
	const ten = `${MA} tao ${rong}`;
	await trang.type(
		'form#create-deal input:not([data-slot="money-input"] input)',
		ten,
	);

	const tenCongTy = `Cong ty ${MA}`;
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
	if (!muc)
		await dung(
			`KHONG DO DUOC: ${rong}/vi khong thay cong ty gieo trong o chon`,
		);
	await muc.asElement().click();
	await new Promise((r) => setTimeout(r, 300));
	const daChon = await trang.$eval(
		"#create-deal-company",
		(el) => el.textContent ?? "",
	);
	if (!daChon.includes(tenCongTy)) {
		await dung(
			`KHONG DO DUOC: ${rong}/vi chon cong ty khong an — o hien «${daChon}»`,
		);
	}

	await trang.click(`[aria-label="${NHAN_TIEN_TE.vi}"]`);
	await trang.waitForSelector('[role="option"]', {
		visible: true,
		timeout: CHO_TAI,
	});
	await bamTheoChu(trang, '[role="option"]', "VND");
	await new Promise((r) => setTimeout(r, 300));

	await goVao(trang, NHAN_SO_TIEN.vi, "150.000.000");
	const o1 = await trang.evaluate(docO);
	khang += 1;
	const muon = "Đọc là 150.000.000 ₫";
	if (sach(o1.dong) !== muon) {
		hong.push(
			o1.dong
				? `tao vi/${rong}: dong «${sach(o1.dong)}» != «${muon}»`
				: `tao vi/${rong}: khong thay dong doc lai`,
		);
	}
	khang += 1;
	if (o1.tran) hong.push(`tao vi/${rong}: trang tran ngang`);
	await trang.screenshot({ path: join(BANG_CHUNG, `tao-doc-lai-${rong}.png`) });

	await trang.click('button[type="submit"][form="create-deal"]');
	await new Promise((r) => setTimeout(r, CHO_NGAN * 2));
	const tim = await doc("deals.list", { q: ten, pageSize: 5 });
	const hang = (tim.gia?.rows ?? []).find((r) => r.name === ten);
	khang += 1;
	if (!hang) {
		hong.push(`tao vi/${rong}: khong thay thoa thuan vua tao`);
	} else {
		daGieo.push(hang.id);
		const ban = (await doc("deals.byId", { id: hang.id })).gia ?? {};
		if (ban.amountCents !== 15_000_000_000 || ban.currency !== "VND") {
			hong.push(
				`tao vi/VND: amountCents ${ban.amountCents} ${ban.currency} != 15000000000 VND`,
			);
		}
	}
	await trang.close();
}

async function moSoTien(tieng) {
	const trang = await moTrang(tieng, 1440, `/deals?record=deal:${gieo.gia.id}`);
	const nhan = NHAN_SO_TIEN[tieng];
	await trang
		.waitForFunction(
			(nhan) =>
				[...document.querySelectorAll("label")].some(
					(l) => l.textContent === nhan,
				),
			{ timeout: CHO_TAI },
			nhan,
		)
		.catch(() => null);
	const moDuoc = await trang.evaluate((nhan) => {
		const l = [...document.querySelectorAll("label")].find(
			(x) => x.textContent === nhan,
		);
		const nut = l?.parentElement?.querySelector("button");
		if (!nut) return false;
		nut.click();
		return true;
	}, nhan);
	if (!moDuoc)
		await dung(
			`KHONG DO DUOC: ${tieng} khong mo duoc o so tien tren tam thoa thuan`,
		);
	return trang;
}

{
	const trang = await moSoTien("en");
	await goVao(trang, NHAN_SO_TIEN.en, "1,500,000.50");
	const o2 = await trang.evaluate(docO);
	khang += 1;
	const muon = "Reads as $1,500,000.50";
	if (sach(o2.dong) !== muon) {
		hong.push(
			o2.dong
				? `sua en: dong «${sach(o2.dong)}» != «${muon}»`
				: "sua en: khong thay dong doc lai",
		);
	}
	await trang.screenshot({ path: join(BANG_CHUNG, "sua-doc-lai-en.png") });
	await trang.keyboard.press("Enter");
	await new Promise((r) => setTimeout(r, CHO_NGAN));
	const ban = (await doc("deals.byId", { id: gieo.gia.id })).gia ?? {};
	khang += 1;
	if (ban.amountCents !== 150_000_050) {
		hong.push(
			`sua en «1,500,000.50»: amountCents ${ban.amountCents} != 150000050`,
		);
	}
	await trang.close();
}

{
	const trang = await moSoTien("vi");
	await goVao(trang, NHAN_SO_TIEN.vi, "1.5");
	await trang.keyboard.press("Enter");
	await new Promise((r) => setTimeout(r, CHO_NGAN));
	await trang.evaluate(() => document.querySelector("[data-do-o]")?.blur());
	await new Promise((r) => setTimeout(r, CHO_NGAN));
	const o3 = await trang.evaluate(docO);
	khang += 1;
	if (!o3.co || o3.invalid !== "true") {
		hong.push(
			`sua vi «1.5» Enter + roi o: o ${o3.co ? "con" : "mat"}, aria-invalid ${o3.invalid}`,
		);
	}
	khang += 1;
	if (!sach(o3.dong).startsWith("Số này viết theo kiểu tiếng Anh")) {
		hong.push(`sua vi «1.5»: dong «${sach(o3.dong)}»`);
	}
	await trang.screenshot({ path: join(BANG_CHUNG, "sua-tieng-kia-vi.png") });
	const ban = (await doc("deals.byId", { id: gieo.gia.id })).gia ?? {};
	khang += 1;
	if (ban.amountCents !== 150_000_050) {
		hong.push(
			`sua vi «1.5» Enter: amountCents ${ban.amountCents} != 150000050`,
		);
	}
	await trang.focus("[data-do-o]").catch(() => null);
	await trang.keyboard.press("Escape");
	await trang.close();
}

await donDep();

console.log(`khang-dinh=${khang}/${KY_MONG}`);
if (khang !== KY_MONG) {
	await khongDo(`KHONG DO DUOC: ma tran lech ban khai — khang-dinh=${khang}`);
}
for (const h of hong) console.log(`HONG ${h}`);
await ket(hong.length === 0 ? 0 : 1);
