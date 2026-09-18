import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import {
	API,
	APP,
	CHROME,
	chotMayChu,
	LANG,
	phien,
	tuChoi,
} from "../../cua-vao-noi-tieng-viet/rang/may-chu.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = process.env.GOC_CAY
	? resolve(process.env.GOC_CAY)
	: resolve(HERE, "../../..");
const ANH = `${HERE}/../evidence`;
const EMAIL = process.env.EMAIL_DO ?? "manh.phan@onemount.com";
const TIEN_TO = "ZZ thu ";

const CO_DAU =
	/[ăâđêôơưàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹấầậẩẫắằặẳẵếềệểễốồộổỗớờợởỡứừựửữ]/i;

const loi = [];
const doi = (dieu, cau) => {
	if (!dieu) loi.push(cau);
};

function ketLuan(ten) {
	if (loi.length === 0) {
		console.log(`DAT ${ten}`);
		process.exit(0);
	}
	console.log(`DO ${ten}`);
	for (const c of loi) console.log(`  - ${c}`);
	process.exit(1);
}

function chupVao(ten) {
	if (!existsSync(ANH)) mkdirSync(ANH, { recursive: true });
	return `${ANH}/${ten}.png`;
}

async function moTrinhDuyet() {
	return puppeteer.launch({
		executablePath: CHROME,
		headless: "new",
		args: ["--no-sandbox"],
	});
}

async function moTrang(browser, tieng, cookie, duong) {
	const page = await browser.newPage();
	await page.setViewport({ width: 1280, height: 900 });
	await page.setCookie(
		{ name: LANG, value: tieng, url: APP },
		{ name: cookie.name, value: cookie.value, url: APP },
	);
	await page.goto(`${APP}${duong}`, {
		waitUntil: "networkidle0",
		timeout: 60000,
	});
	return page;
}

async function timSlug(browser, cookie) {
	const page = await moTrang(browser, "vi", cookie, "/settings");
	const duong = new URL(page.url()).pathname;
	await page.close();
	const slug = duong.split("/").filter(Boolean)[0];
	if (!slug || slug === "settings")
		tuChoi(`khong suy duoc slug khu lam viec tu duong ${duong}`);
	return slug;
}

const docMucThanhBen = () =>
	[...document.querySelectorAll('nav[aria-label] a[href*="/settings"]')].map(
		(a) => ({ chu: a.textContent.trim(), href: a.getAttribute("href") }),
	);

const docThe = () =>
	[...document.querySelectorAll('[role="tab"]')].map((t) => {
		const b = t.getBoundingClientRect();
		return {
			chu: t.textContent.trim(),
			chon: t.getAttribute("aria-selected") === "true",
			rong: Math.round(b.width),
			cao: Math.round(b.height),
			trongKhung:
				b.left >= 0 &&
				b.top >= 0 &&
				b.right <= window.innerWidth &&
				b.bottom <= window.innerHeight,
		};
	});

const docTieuDe = () => ({
	tieuDe: document.querySelector("main h1")?.textContent.trim() ?? "",
	moTa:
		document
			.querySelector("main h1")
			?.parentElement?.nextElementSibling?.textContent.trim() ??
		document
			.querySelector('main [data-slot="page-shell-header"] div div')
			?.textContent.trim() ??
		"",
});

const demKhay = () => document.querySelectorAll('[role="dialog"]').length;

async function duongVao(browser, cookie, slug) {
	const luot = {};

	for (const tieng of ["vi", "en"]) {
		const page = await moTrang(browser, tieng, cookie, `/${slug}/settings`);
		const muc = await page.evaluate(docMucThanhBen);
		const chiTruong = muc.findIndex((m) => m.href.endsWith("/settings/fields"));
		const chiTienTe = muc.findIndex((m) =>
			m.href.endsWith("/settings/currencies"),
		);

		doi(
			chiTruong >= 0,
			`tieng ${tieng}: thanh ben KHONG co muc nao tro toi /settings/fields`,
		);
		doi(
			chiTienTe >= 0 && chiTruong === chiTienTe + 1,
			`tieng ${tieng}: muc Truong khong dung NGAY SAU muc Tien te ` +
				`(Tien te o vi tri ${chiTienTe}, Truong o vi tri ${chiTruong})`,
		);

		if (chiTruong >= 0) {
			luot[tieng] = muc[chiTruong].chu;
			if (tieng === "vi")
				await page.screenshot({ path: chupVao("thanh-ben-vi") });

			await Promise.all([
				page.waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 }),
				page.click(`nav[aria-label] a[href$="/settings/fields"]`),
			]);
			doi(
				new URL(page.url()).pathname === `/${slug}/settings/fields`,
				`tieng ${tieng}: bam muc Truong khong dua toi /settings/fields, dang o ${page.url()}`,
			);
			if (tieng === "vi") await page.screenshot({ path: chupVao("trang-vi") });
		}

		await page.close();
	}

	doi(
		luot.vi === "Trường",
		`nhan tieng Viet cua muc la ${JSON.stringify(luot.vi)}, cho "Trường"`,
	);
	doi(
		luot.vi !== luot.en,
		`nhan muc Truong GIONG NHAU o hai thu tieng (${JSON.stringify(luot.vi)}) — chua noi tieng nguoi dung`,
	);

	ketLuan("duong-vao");
}

async function tieuDeTrang(browser, cookie, slug) {
	const luot = {};

	for (const tieng of ["vi", "en"]) {
		const page = await moTrang(
			browser,
			tieng,
			cookie,
			`/${slug}/settings/fields`,
		);
		const t = await page.evaluate(docTieuDe);
		luot[tieng] = t;

		doi(t.tieuDe.length > 0, `tieng ${tieng}: trang KHONG co tieu de`);
		doi(t.moTa.length > 0, `tieng ${tieng}: trang KHONG co phan mo ta`);

		if (tieng === "vi") {
			doi(
				CO_DAU.test(t.tieuDe) || t.tieuDe === "Trường",
				`tieu de tieng Viet ${JSON.stringify(t.tieuDe)} khong mang dau tieng Viet`,
			);
			await page.screenshot({ path: chupVao("tieu-de-vi") });
		}

		await page.close();
	}

	doi(
		luot.vi.tieuDe !== luot.en.tieuDe,
		`tieu de GIONG NHAU o hai thu tieng (${JSON.stringify(luot.vi.tieuDe)})`,
	);
	doi(
		luot.vi.moTa !== luot.en.moTa,
		`phan mo ta GIONG NHAU o hai thu tieng (${JSON.stringify(luot.vi.moTa)})`,
	);

	ketLuan("tieu-de-trang");
}

async function baThe(browser, cookie, slug) {
	const page = await moTrang(browser, "vi", cookie, `/${slug}/settings/fields`);
	const the = await page.evaluate(docThe);

	doi(the.length === 3, `trang co ${the.length} the, cho dung ba`);

	const chu = the.map((t) => t.chu);
	doi(
		chu.join("|") === "Công ty|Cá nhân|Thoả thuận",
		`ba the mang nhan ${JSON.stringify(chu)}, cho dung thu tu Cong ty, Ca nhan, Thoa thuan`,
	);
	doi(
		new Set(chu).size === chu.length,
		`hai the mang cung mot nhan: ${JSON.stringify(chu)}`,
	);
	doi(
		the[0]?.chon === true,
		`the dang mo la ${JSON.stringify(the.find((t) => t.chon)?.chu)}, cho the Cong ty khi dia chi khong mang tham so`,
	);

	for (const t of the) {
		doi(
			t.rong > 0 && t.cao > 0,
			`the ${JSON.stringify(t.chu)} co hop bang KHONG (${t.rong}x${t.cao}) — dung ra ma khong ai nhin thay`,
		);
		doi(t.trongKhung, `the ${JSON.stringify(t.chu)} nam NGOAI khung nhin`);
	}

	await page.screenshot({ path: chupVao("ba-the") });
	await page.close();
	ketLuan("ba-the");
}

async function bamThe(page, nhan) {
	const the = await page.$$('[role="tab"]');
	for (const t of the) {
		const chu = await t.evaluate((el) => el.textContent.trim());
		if (chu === nhan) {
			await t.click();
			await new Promise((r) => setTimeout(r, 1500));
			return true;
		}
	}
	return false;
}

async function theTrenDiaChi(browser, cookie, slug) {
	const page = await moTrang(browser, "vi", cookie, `/${slug}/settings/fields`);

	const bam = await bamThe(page, "Cá nhân");
	doi(bam, "khong tim thay the Ca nhan de bam");

	if (bam) {
		const dc = new URL(page.url());
		doi(
			dc.search.length > 1,
			`bam the Ca nhan nhung dia chi KHONG mang tham so nao: ${page.url()}`,
		);

		const page2 = await moTrang(
			browser,
			"vi",
			cookie,
			`${dc.pathname}${dc.search}`,
		);
		const dang = await page2.evaluate(
			() =>
				[...document.querySelectorAll('[role="tab"]')]
					.find((t) => t.getAttribute("aria-selected") === "true")
					?.textContent.trim() ?? "",
		);
		doi(
			dang === "Cá nhân",
			`sau khi TAI LAI tu dia chi ${dc.pathname}${dc.search}, the dang mo la ${JSON.stringify(dang)}, cho "Cá nhân"`,
		);
		await page2.close();
	}

	await page.close();
	ketLuan("the-tren-dia-chi");
}

async function khongBatKhay(browser, cookie, slug) {
	const mot = await moTrang(browser, "vi", cookie, `/${slug}/settings/fields`);
	const soMot = await mot.evaluate(demKhay);
	doi(
		soMot === 0,
		`mo trang Cai dat > Truong ma khay truot VAN BAT: dem duoc ${soMot} hop thoai`,
	);
	await mot.screenshot({ path: chupVao("khong-bat-khay") });
	await mot.close();

	const hai = await moTrang(
		browser,
		"vi",
		cookie,
		`/${slug}/settings/fields?manageFields=contact`,
	);
	const soHai = await hai.evaluate(demKhay);
	await hai.close();

	if (soHai === 0) {
		console.log(
			"KHONG DO DUOC: ve doi chung khong thay khay du dia chi mang dung tham so " +
				"manageFields=contact. Nghia la phep do nay mat suc phan biet: ve mot se xanh " +
				"ca khi trang thuc su bat khay.",
		);
		process.exit(2);
	}

	ketLuan("khong-bat-khay");
}

const CHE_DO = {
	"duong-vao": duongVao,
	"tieu-de-trang": tieuDeTrang,
	"ba-the": baThe,
	"the-tren-dia-chi": theTrenDiaChi,
	"khong-bat-khay": khongBatKhay,
};

const che = process.argv[2];
if (!CHE_DO[che])
	tuChoi(
		`che do ${JSON.stringify(che)} khong co. Cac che do: ${Object.keys(CHE_DO).join(" · ")}`,
	);

console.log(`goc cay: ${GOC}`);
console.log(`may chu ung dung: ${APP} · API: ${API}`);
await chotMayChu();
const cookie = phien(EMAIL);
const browser = await moTrinhDuyet();
try {
	const slug = await timSlug(browser, cookie);
	console.log(`khu lam viec: ${slug}`);
	await CHE_DO[che](browser, cookie, slug);
} finally {
	await browser.close();
}
