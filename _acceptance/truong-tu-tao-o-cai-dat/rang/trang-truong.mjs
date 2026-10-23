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
const THU_ANH =
	process.env.TTC_CHEP_ANH === "1"
		? `${HERE}/..`
		: resolve(HERE, "../../../.acceptance-runs/truong-tu-tao-o-cai-dat");
const ANH = `${THU_ANH}/evidence`;
const EMAIL = process.env.EMAIL_DO ?? "manh.phan@onemount.com";
const TIEN_TO = "ZZ thu ";
const HET_HAN_MS = Number(process.env.HET_HAN_MS ?? 32_000);

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

const docTieuDe = () => {
	const h1 = document.querySelector("main h1");
	const mo = document.querySelector(
		'main [data-slot="page-shell-description"]',
	);
	return {
		tieuDe: h1?.textContent.trim() ?? "",
		moTa: mo?.textContent.trim() ?? "",
		coPhanTuMoTa: Boolean(mo),
	};
};

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
		doi(
			t.coPhanTuMoTa,
			`tieng ${tieng}: trang KHONG co phan tu mo ta nao mang data-slot page-shell-description`,
		);
		doi(t.moTa.length > 0, `tieng ${tieng}: phan mo ta RONG`);
		doi(
			t.moTa !== t.tieuDe && !t.moTa.startsWith(t.tieuDe),
			`tieng ${tieng}: phan mo ta doc ra la ${JSON.stringify(t.moTa.slice(0, 50))}, ` +
				"tuc dang bat mot the bao CA tieu de LAN mo ta — khang dinh mo-ta-khong-rong " +
				"se luon dung du mo ta that co trong",
		);

		if (tieng === "vi") {
			doi(
				CO_DAU.test(t.tieuDe) || t.tieuDe === "Trường",
				`tieu de tieng Viet ${JSON.stringify(t.tieuDe)} khong mang dau tieng Viet`,
			);
			const oTieuDe = await page.$("main h1");
			if (oTieuDe) {
				const h = await oTieuDe.boundingBox();
				if (h)
					await page.screenshot({
						path: chupVao("tieu-de-vi"),
						clip: {
							x: Math.max(0, h.x - 16),
							y: Math.max(0, h.y - 16),
							width: Math.min(h.width + 520, 1200),
							height: h.height + 44,
						},
					});
			} else {
				await page.screenshot({ path: chupVao("tieu-de-vi") });
			}
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

	const oThe = await page.$('[role="tablist"]');
	if (oThe) {
		const h = await oThe.boundingBox();
		if (h)
			await page.screenshot({
				path: chupVao("ba-the"),
				clip: {
					x: Math.max(0, h.x - 12),
					y: Math.max(0, h.y - 12),
					width: h.width + 24,
					height: h.height + 24,
				},
			});
	} else {
		await page.screenshot({ path: chupVao("ba-the") });
	}
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
	await mot.screenshot({ path: chupVao("khong-bat-khay-ve-mot-khong-khay") });
	await mot.close();

	const hai = await moTrang(
		browser,
		"vi",
		cookie,
		`/${slug}/settings/fields?manageFields=contact`,
	);
	const soHai = await hai.evaluate(demKhay);
	await hai.screenshot({ path: chupVao("khong-bat-khay-ve-hai-co-khay") });
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

async function goiApi(cookie, thu_tuc, vao) {
	const q = vao ? `?input=${encodeURIComponent(JSON.stringify(vao))}` : "";
	const r = await fetch(`${API}/api/trpc/${thu_tuc}${q}`, {
		headers: { Cookie: `${cookie.name}=${cookie.value}` },
	});
	if (!r.ok) tuChoi(`goi ${thu_tuc} tra ve HTTP ${r.status}`);
	const j = await r.json();
	if (j.error)
		tuChoi(`goi ${thu_tuc} bao loi: ${JSON.stringify(j.error).slice(0, 300)}`);
	return j.result.data;
}

async function ghiApi(cookie, thu_tuc, than) {
	const r = await fetch(`${API}/api/trpc/${thu_tuc}`, {
		method: "POST",
		headers: {
			Cookie: `${cookie.name}=${cookie.value}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(than),
	});
	if (!r.ok) tuChoi(`ghi ${thu_tuc} tra ve HTTP ${r.status}`);
	const j = await r.json();
	if (j.error)
		tuChoi(`ghi ${thu_tuc} bao loi: ${JSON.stringify(j.error).slice(0, 300)}`);
	return j.result.data;
}

const lietKe = (cookie, entity, keCaLuuTru = true) =>
	goiApi(cookie, "fields.list", { entity, includeArchived: keCaLuuTru });

async function xoaTheoKhoa(cookie, entity, khoa) {
	const list = await lietKe(cookie, entity);
	for (const f of list.filter((x) => x.key === khoa)) {
		await ghiApi(cookie, "fields.delete", { id: f.id });
	}
}

async function donRac(cookie, entity) {
	const list = await lietKe(cookie, entity);
	for (const f of list.filter((x) => x.label.startsWith(TIEN_TO))) {
		await ghiApi(cookie, "fields.delete", { id: f.id });
	}
}

const docGoiY = () =>
	[...document.querySelectorAll("button")]
		.filter((b) => b.textContent.trim() === "Thêm")
		.map((b) => {
			const dong = b.closest("li") ?? b.parentElement?.parentElement;
			return (dong?.textContent ?? "").replace(/Thêm$/, "").trim();
		});

async function bamGoiYDau(page) {
	const nut = await page.$$("button");
	for (const n of nut) {
		const chu = await n.evaluate((el) => el.textContent.trim());
		if (chu === "Thêm") {
			const nhan = await n.evaluate((el) => {
				const dong = el.closest("li") ?? el.parentElement?.parentElement;
				const chu = (dong?.textContent ?? "").replace(/Thêm$/, "").trim();
				return chu.split(" · ")[0].trim();
			});
			await n.click();
			await new Promise((r) => setTimeout(r, 2500));
			return nhan;
		}
	}
	return null;
}

async function moKhoiGoiY(page) {
	const nut = await page.$$("button");
	for (const n of nut) {
		const chu = await n.evaluate((el) => el.textContent.trim());
		if (/^Trường gợi ý/.test(chu)) {
			await n.click();
			await new Promise((r) => setTimeout(r, 1200));
			return true;
		}
	}
	return false;
}

const docNhom = () =>
	[...document.querySelectorAll("button")]
		.map((e) => e.textContent.trim())
		.filter((t) => /^(Trường chuẩn|Trường gợi ý|Đã lưu trữ)/.test(t))
		.map((t) => {
			const m = t.match(/^(.+?)(\d+) ·/);
			return m
				? { ten: m[1].trim(), so: Number(m[2]) }
				: { ten: t.replace(/\d+ ·.*$/, "").trim(), so: null };
		});

const docTieuDeNhom = () =>
	[...document.querySelectorAll("button")]
		.map((e) => e.textContent.trim())
		.filter((t) => /^(Trường chuẩn|Trường gợi ý|Đã lưu trữ)/.test(t))
		.map((t) => t.replace(/\d+ ·.*$/, "").trim());

const demDongTuTao = () => {
	const nhan = [...document.querySelectorAll("main [data-slot]")].filter((e) =>
		/^Thêm hành động cho /.test(e.textContent.trim()),
	);
	return nhan.length;
};

async function donNhanKhuon(cookie, entity, nhan) {
	const list = await lietKe(cookie, entity);
	for (const f of list.filter((x) => x.label === nhan)) {
		await ghiApi(cookie, "fields.delete", { id: f.id });
	}
}

async function taoTuGoiY(browser, cookie, slug) {
	const KHUNG = [
		{ the: "Cá nhân", entity: "CONTACT" },
		{ the: "Thoả thuận", entity: "DEAL" },
	];

	const { FIELD_TEMPLATES } = await import(
		resolve(GOC, "packages/validation/src/field-templates.ts")
	);

	const daTao = [];

	for (const k of KHUNG) {
		const page = await moTrang(
			browser,
			"vi",
			cookie,
			`/${slug}/settings/fields`,
		);
		const bam = await bamThe(page, k.the);
		doi(bam, `khong tim thay the ${k.the}`);
		if (!bam) {
			await page.close();
			continue;
		}

		await moKhoiGoiY(page);
		const truoc = await page.evaluate(docGoiY);
		doi(
			truoc.length > 0,
			`the ${k.the}: khoi goi y KHONG co goi y nao bam duoc`,
		);
		if (truoc.length === 0) {
			await page.close();
			continue;
		}

		const nhan = truoc[0].split(" · ")[0].trim();
		daTao.push({ entity: k.entity, nhan });
		await donNhanKhuon(cookie, k.entity, nhan);
		const khuon = (FIELD_TEMPLATES[k.entity] ?? []).find(
			(t) => t.label === nhan,
		);
		doi(
			Boolean(khuon),
			`the ${k.the}: man hien goi y ${JSON.stringify(nhan)} ma bo goi y khong co dong nao mang nhan do`,
		);

		const daBam = await bamGoiYDau(page);
		doi(
			daBam === nhan,
			`the ${k.the}: bam goi y ${JSON.stringify(nhan)} nhung doc lai duoc ${JSON.stringify(daBam)}`,
		);

		const sau = await lietKe(cookie, k.entity);
		const moi = sau.find((f) => f.label === nhan);

		doi(
			Boolean(moi),
			`the ${k.the}: bam goi y ${JSON.stringify(nhan)} nhung API KHONG co truong nao mang nhan do`,
		);

		if (moi && khuon) {
			doi(
				moi.type === khuon.type,
				`the ${k.the}: truong ${JSON.stringify(nhan)} mang kieu ${moi.type}, goi y khai ${khuon.type}`,
			);
			const cho = [...(khuon.options ?? [])];
			const co = (moi.options ?? []).map((o) => o.label);
			doi(
				co.length === cho.length,
				`the ${k.the}: truong ${JSON.stringify(nhan)} co ${co.length} lua chon, goi y khai ${cho.length}`,
			);
			doi(
				co.join("|") === cho.join("|"),
				`the ${k.the}: lua chon cua ${JSON.stringify(nhan)} la ${co.join(" · ")}, goi y khai ${cho.join(" · ")}`,
			);

			const tren = await page.evaluate(
				(n) => document.querySelector("main")?.innerText.includes(n) ?? false,
				nhan,
			);
			doi(
				tren,
				`the ${k.the}: truong ${JSON.stringify(nhan)} co trong API nhung KHONG hien tren man`,
			);

			await page.screenshot({ path: chupVao(`tao-tu-goi-y-${k.entity}`) });
		}

		await page.close();
	}

	for (const x of daTao) await donNhanKhuon(cookie, x.entity, x.nhan);

	ketLuan("tao-tu-goi-y");
}

async function baNhom(browser, cookie, slug) {
	const { LISTING } = await import(
		resolve(GOC, "apps/api/src/listings/listings-config.ts")
	);
	const khoaBoCao = LISTING.fields.map((f) => f.key);

	await donRac(cookie, "CONTACT");

	const page = await moTrang(browser, "vi", cookie, `/${slug}/settings/fields`);
	const bam = await bamThe(page, "Cá nhân");
	doi(bam, "khong tim thay the Ca nhan");

	const nhom = await page.evaluate(docNhom);
	const chuan = nhom.find((x) => x.ten.startsWith("Trường chuẩn"));
	doi(
		Boolean(chuan),
		`the Ca nhan: KHONG co nhom truong chuan. Cac nhom doc duoc: ${JSON.stringify(nhom.map((x) => x.ten))}`,
	);
	doi(
		(chuan?.so ?? 0) >= 1,
		`nhom truong chuan dem ${chuan?.so} phan tu, cho it nhat mot`,
	);

	const dangDung = await lietKe(cookie, "CONTACT", false);
	const coBoCao = dangDung.filter((f) => khoaBoCao.includes(f.key));
	console.log(
		`khoa bo cao khai: ${khoaBoCao.length} · dang co tren co so du lieu nay: ${coBoCao.length}`,
	);
	if (coBoCao.length === 0) {
		await page.close();
		console.log(
			"KHONG DO DUOC: co so du lieu nay khong co truong nao cua bo cao tren Ca nhan, " +
				"nen phep do khong chung duoc rang man hien duoc truong may gieo. Chay lo " +
				"tiep nhan roi do lai.",
		);
		process.exit(2);
	}

	const chuTren = await page.evaluate(
		() => document.querySelector("main")?.innerText ?? "",
	);
	for (const f of dangDung) {
		doi(
			chuTren.includes(f.label),
			`truong ${JSON.stringify(f.label)} co trong API nhung KHONG hien tren man`,
		);
	}

	const soTren = await page.evaluate(demDongTuTao);
	doi(
		soTren === dangDung.length,
		`man liet ke ${soTren} truong tu tao nhung API tra ve ${dangDung.length} — hai so PHAI bang nhau`,
	);

	const nhan = `${TIEN_TO}chuyen nhom ${Date.now()}`;
	const tao = await ghiApi(cookie, "fields.create", {
		entity: "CONTACT",
		label: nhan,
		type: "TEXT",
	});

	try {
		await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
		await bamThe(page, "Cá nhân");
		const truoc = await page.evaluate(
			() => document.querySelector("main")?.innerText ?? "",
		);
		doi(
			truoc.includes(nhan),
			`truong vua tao KHONG hien tren man truoc khi luu tru`,
		);

		await ghiApi(cookie, "fields.archive", { id: tao.id });
		await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
		await bamThe(page, "Cá nhân");

		const nhomSau = await page.evaluate(docNhom);
		const luuTru = nhomSau.find((x) => /Đã lưu trữ/.test(x.ten));
		doi(
			Boolean(luuTru),
			`sau khi luu tru mot truong, nhom "Đã lưu trữ" KHONG xuat hien. Cac nhom: ${JSON.stringify(nhomSau.map((x) => x.ten))}`,
		);
		doi(
			nhomSau.some((x) => x.ten.startsWith("Trường chuẩn")),
			"sau khi luu tru, nhom truong chuan BIEN MAT khoi man",
		);

		const heTat = await lietKe(cookie, "CONTACT");
		const heDang = await lietKe(cookie, "CONTACT", false);
		doi(
			(luuTru?.so ?? -1) === heTat.length - heDang.length,
			`nhom da luu tru dem ${luuTru?.so} phan tu, hieu giua hai duong API la ${heTat.length - heDang.length} — hai so PHAI bang nhau`,
		);

		const soDangDungTren = await page.evaluate(demDongTuTao);
		doi(
			soDangDungTren === heDang.length,
			`sau khi luu tru, man liet ke ${soDangDungTren} truong dang dung nhung API tra ve ${heDang.length}`,
		);

		const daLuu = await lietKe(cookie, "CONTACT");
		const no = daLuu.find((f) => f.id === tao.id);
		doi(
			Boolean(no?.archived),
			`API khong bao truong vua luu tru la da luu tru`,
		);

		const conDangDung = await lietKe(cookie, "CONTACT", false);
		doi(
			!conDangDung.some((f) => f.id === tao.id),
			"truong da luu tru VAN nam trong danh sach dang dung",
		);

		await page.screenshot({ path: chupVao("ba-nhom") });
	} finally {
		await donRac(cookie, "CONTACT");
		await page.close();
	}

	ketLuan("ba-nhom");
}

async function dienNhan(page, nhan, goc = "main") {
	const o = await page.$(`${goc} input`);
	if (!o) return false;
	await o.click();
	const daiCu = (await o.evaluate((el) => el.value)).length;
	await page.keyboard.press("End");
	for (let i = 0; i < daiCu + 4; i++) await page.keyboard.press("Backspace");
	await new Promise((r) => setTimeout(r, 300));
	const conLai = await o.evaluate((el) => el.value);
	if (conLai !== "") {
		loi.push(
			`khong xoa sach duoc o Nhan truoc khi go: con lai ${JSON.stringify(conLai)}`,
		);
		return false;
	}
	await o.type(nhan, { delay: 12 });
	await new Promise((r) => setTimeout(r, 800));
	const doc = await o.evaluate((el) => el.value);
	if (doc !== nhan) {
		loi.push(
			`dien nhan that bai: o mang gia tri ${JSON.stringify(doc)} thay vi ${JSON.stringify(nhan)}`,
		);
		return false;
	}
	return true;
}

async function bamChuCo(page, chu, goc = "") {
	const nut = await page.$$(goc ? `${goc} button` : "button");
	for (const n of nut) {
		const t = await n.evaluate((el) => el.textContent.trim());
		if (t === chu) {
			const tat = await n.evaluate((el) => el.disabled === true);
			if (tat) return false;
			await n.click();
			await new Promise((r) => setTimeout(r, 2500));
			return true;
		}
	}
	return false;
}

async function bamMucMenu(page, chu) {
	const muc = await page.$$('[role="menuitem"]');
	for (const m of muc) {
		const t = await m.evaluate((el) => el.textContent.trim());
		if (t === chu) {
			await m.click();
			await new Promise((r) => setTimeout(r, 1500));
			return true;
		}
	}
	return false;
}

async function xepLaiTrongKhay(page, truoc) {
	const tay = await page.$$(
		'[data-slot] [aria-roledescription], main [role="button"]',
	);
	const keo = await page.$$("button");
	for (const n of keo) {
		const chu = await n.evaluate((el) => el.textContent.trim());
		if (/^Đổi thứ tự /.test(chu)) {
			await n.focus();
			await page.keyboard.press("Space");
			await new Promise((r) => setTimeout(r, 500));
			await page.keyboard.press("ArrowDown");
			await new Promise((r) => setTimeout(r, 500));
			await page.keyboard.press("Space");
			await new Promise((r) => setTimeout(r, 2500));
			return { lam: true, vi: "" };
		}
	}
	return {
		lam: false,
		vi: `khong tim thay tay cam "Đổi thứ tự" nao trong khay (${tay.length} phan tu co vai keo)`,
	};
}

async function moMenuCua(page, nhan) {
	const nut = await page.$$('[data-slot="dropdown-menu-trigger"]');
	for (const n of nut) {
		const t = await n.evaluate((el) => el.textContent.trim());
		if (t.includes(nhan)) {
			await n.click();
			await new Promise((r) => setTimeout(r, 900));
			return true;
		}
	}
	return false;
}

async function baViec(browser, cookie, slug) {
	await donRac(cookie, "COMPANY");
	const nhan = `${TIEN_TO}ba viec ${Date.now()}`;
	const nhanMoi = `${nhan} sua`;

	const page = await moTrang(browser, "vi", cookie, `/${slug}/settings/fields`);

	try {
		const moO = await bamChuCo(page, "Trường mới");
		doi(moO, "khong bam duoc nut Truong moi");

		if (moO) {
			doi(await dienNhan(page, nhan), "khong tim thay o Nhan de dien");
			const daTao = await bamChuCo(page, "Tạo trường");
			doi(daTao, "khong bam duoc nut Tao truong sau khi dien nhan");

			const sau1 = await lietKe(cookie, "COMPANY");
			const moi = sau1.find((f) => f.label === nhan);
			doi(
				Boolean(moi),
				`viec 1 tao tu dau: API KHONG co truong nao mang nhan ${JSON.stringify(nhan)}`,
			);

			if (moi) {
				await page.goto(`${APP}/${slug}/settings/fields?truong=${moi.key}`, {
					waitUntil: "networkidle0",
					timeout: 60000,
				});
				doi(await dienNhan(page, nhanMoi), "khong mo duoc o sua de doi nhan");
				const daLuu = await bamChuCo(page, "Lưu thay đổi");
				doi(daLuu, "khong bam duoc nut Luu thay doi");

				const sau2 = await lietKe(cookie, "COMPANY");
				doi(
					sau2.some((f) => f.id === moi.id && f.label === nhanMoi),
					`viec 2 sua nhan: API khong tra ve nhan moi ${JSON.stringify(nhanMoi)}`,
				);
				doi(
					!sau2.some((f) => f.label === nhan),
					`viec 2 sua nhan: API VAN con nhan cu ${JSON.stringify(nhan)}`,
				);

				await page.goto(`${APP}/${slug}/settings/fields`, {
					waitUntil: "networkidle0",
					timeout: 60000,
				});
				const moMenu = await moMenuCua(page, nhanMoi);
				doi(
					moMenu,
					`khong mo duoc menu hanh dong cua ${JSON.stringify(nhanMoi)}`,
				);
				if (moMenu) {
					const chonLuuTru = await bamMucMenu(page, "Lưu trữ");
					doi(
						chonLuuTru,
						"menu hanh dong mo ra nhung khong co muc Luu tru de bam",
					);
					await new Promise((r) => setTimeout(r, 2000));
				}

				const sau3 = await lietKe(cookie, "COMPANY");
				const no = sau3.find((f) => f.id === moi.id);
				doi(
					Boolean(no?.archived),
					"viec 3 luu tru: API khong bao truong la da luu tru",
				);
				const dangDung = await lietKe(cookie, "COMPANY", false);
				doi(
					!dangDung.some((f) => f.id === moi.id),
					"viec 3 luu tru: truong VAN nam trong danh sach dang dung",
				);
			}
		}
	} finally {
		await donRac(cookie, "COMPANY");
		await page.close();
	}

	ketLuan("ba-viec");
}

async function khayCu(browser, cookie, slug) {
	await donRac(cookie, "CONTACT");
	const nhan = `${TIEN_TO}khay ${Date.now()}`;
	const nhanSua = `${nhan} sua`;
	const nhanKhuon = [];

	const page = await moTrang(
		browser,
		"vi",
		cookie,
		`/${slug}/contacts?manageFields=contact`,
	);

	try {
		const soKhay = await page.evaluate(demKhay);
		doi(soKhay > 0, "mo duong cu bang tham so manageFields ma khay KHONG hien");

		const the = await page.evaluate(docThe);
		doi(
			the.length === 3,
			`viec 1 xem: khay co ${the.length} the thuc the, cho ba`,
		);

		const api = await lietKe(cookie, "CONTACT", false);
		const chuKhay = await page.evaluate(
			() => document.querySelector('[role="dialog"]')?.innerText ?? "",
		);
		for (const f of api) {
			doi(
				chuKhay.includes(f.label),
				`viec 1 xem: truong ${JSON.stringify(f.label)} co trong API nhung KHONG hien trong khay`,
			);
		}

		await moKhoiGoiY(page);
		const daBam = await bamGoiYDau(page);
		doi(
			Boolean(daBam),
			"viec 2 tao tu goi y: khong bam duoc goi y nao trong khay",
		);
		if (daBam) {
			nhanKhuon.push(daBam);
			const sau = await lietKe(cookie, "CONTACT");
			doi(
				sau.some((f) => f.label === daBam),
				`viec 2 tao tu goi y: API KHONG co truong ${JSON.stringify(daBam)}`,
			);
		}

		const moO = await bamChuCo(page, "Trường mới", '[role="dialog"]');
		doi(moO, "viec 3 tao tu dau: khong bam duoc nut Truong moi trong khay");
		let tao = null;
		if (moO) {
			const dien = await dienNhan(page, nhan, '[role="dialog"]');
			doi(dien, "viec 3 tao tu dau: khong dien duoc o Nhan trong khay");
			if (dien) {
				const daTao = await bamChuCo(page, "Tạo trường", '[role="dialog"]');
				doi(
					daTao,
					"viec 3 tao tu dau: khong bam duoc nut Tao truong trong khay",
				);
				const sau = await lietKe(cookie, "CONTACT");
				tao = sau.find((f) => f.label === nhan) ?? null;
				doi(
					Boolean(tao),
					`viec 3 tao tu dau: API KHONG co truong ${JSON.stringify(nhan)}`,
				);
			}
		}

		if (tao) {
			await page.goto(
				`${APP}/${slug}/contacts?manageFields=contact&manageField=${tao.key}`,
				{ waitUntil: "networkidle0", timeout: 60000 },
			);
			const dienSua = await dienNhan(page, nhanSua, '[role="dialog"]');
			doi(dienSua, "viec 4 sua nhan: khong dien duoc o Nhan trong khay");
			if (dienSua) {
				const daLuu = await bamChuCo(page, "Lưu thay đổi", '[role="dialog"]');
				doi(
					daLuu,
					"viec 4 sua nhan: khong bam duoc nut Luu thay doi trong khay",
				);
				const sau = await lietKe(cookie, "CONTACT");
				doi(
					sau.some((f) => f.id === tao.id && f.label === nhanSua),
					`viec 4 sua nhan: API khong tra ve nhan moi ${JSON.stringify(nhanSua)}`,
				);
				doi(
					!sau.some((f) => f.label === nhan),
					`viec 4 sua nhan: API VAN con nhan cu ${JSON.stringify(nhan)}`,
				);
			}

			await page.goto(`${APP}/${slug}/contacts?manageFields=contact`, {
				waitUntil: "networkidle0",
				timeout: 60000,
			});

			const truocXep = (await lietKe(cookie, "CONTACT", false)).map(
				(f) => f.key,
			);
			doi(
				truocXep.length >= 2,
				`viec 5 xep lai: chi co ${truocXep.length} truong dang dung, can it nhat hai de doi cho`,
			);

			if (truocXep.length >= 2) {
				const xep = await xepLaiTrongKhay(page, truocXep);
				doi(
					xep.lam,
					`viec 5 xep lai: khong doi duoc thu tu trong khay — ${xep.vi}`,
				);
				if (xep.lam) {
					const sauXep = (await lietKe(cookie, "CONTACT", false)).map(
						(f) => f.key,
					);
					doi(
						sauXep.join("|") !== truocXep.join("|"),
						"viec 5 xep lai: API tra ve NGUYEN thu tu cu, ca day khong doi",
					);
					doi(
						sauXep.length === truocXep.length &&
							sauXep.every((k) => truocXep.includes(k)),
						"viec 5 xep lai: tap khoa doi sau khi xep lai, khong chi thu tu",
					);
				}
			}

			const moMenu = await moMenuCua(page, nhanSua);
			doi(
				moMenu,
				`viec 6 luu tru: khong mo duoc menu cua ${JSON.stringify(nhanSua)}`,
			);
			if (moMenu) {
				const chon = await bamMucMenu(page, "Lưu trữ");
				doi(chon, "viec 6 luu tru: menu khong co muc Luu tru");
				await new Promise((r) => setTimeout(r, 2000));

				const heTat = await lietKe(cookie, "CONTACT");
				const no = heTat.find((f) => f.id === tao.id);
				doi(
					Boolean(no?.archived),
					"viec 6 luu tru: API khong bao truong la da luu tru",
				);
				const heDang = await lietKe(cookie, "CONTACT", false);
				doi(
					!heDang.some((f) => f.id === tao.id),
					"viec 6 luu tru: truong VAN nam trong danh sach dang dung",
				);
			}
		}

		await page.screenshot({ path: chupVao("khay-cu") });
	} finally {
		for (const x of nhanKhuon) await donNhanKhuon(cookie, "CONTACT", x);
		await donRac(cookie, "CONTACT");
		await page.close();
	}

	ketLuan("khay-cu");
}

async function trangThai(browser, cookie, slug) {
	const rong = await moTrang(
		browser,
		"vi",
		cookie,
		`/${slug}/settings/fields?thucThe=deal`,
	);
	const dangDungDeal = await lietKe(cookie, "DEAL", false);

	if (dangDungDeal.length === 0) {
		const chu = await rong.evaluate(
			() => document.querySelector("main")?.innerText ?? "",
		);
		doi(
			chu.includes("Chưa có trường tự tạo nào"),
			"the Thoa thuan chua co truong nao ma man KHONG hien loi trang thai rong",
		);
		await moKhoiGoiY(rong);
		const goi = await rong.evaluate(docGoiY);
		doi(goi.length > 0, "trang thai rong KHONG kem khoi goi y nao bam duoc");
		await rong.screenshot({ path: chupVao("trang-thai-rong") });
	} else {
		await rong.close();
		console.log(
			`KHONG DO DUOC: the Thoa thuan dang co ${dangDungDeal.length} truong tu tao ` +
				`(${dangDungDeal.map((f) => f.label).join(", ")}) nen ve trang thai RONG ` +
				"khong dung duoc. Bao dat o day la bao mot ve chua he do, va anh cu trong " +
				"evidence/trang-thai-rong.png se la anh cua luot truoc. Don thuc the Thoa " +
				"thuan roi do lai.",
		);
		process.exit(2);
	}
	await rong.close();

	const loiTrang = await moTrang(
		browser,
		"vi",
		cookie,
		`/${slug}/settings/fields`,
	);

	console.log(
		`cho ${Math.round(HET_HAN_MS / 1000)}s cho du lieu nap truoc het han, roi moi chan duong goi`,
	);
	await new Promise((r) => setTimeout(r, HET_HAN_MS));

	await loiTrang.setRequestInterception(true);
	loiTrang.on("request", (r) => {
		if (r.url().includes("fields.list")) r.abort();
		else r.continue();
	});

	const daBamThe = await bamThe(loiTrang, "Cá nhân");
	doi(
		daBamThe,
		"khong bam duoc the Ca nhan de bat duong goi danh sach da het han",
	);
	await new Promise((r) => setTimeout(r, 8000));

	const chuLoi = await loiTrang.evaluate(
		() => document.querySelector("main")?.innerText ?? "",
	);
	doi(
		chuLoi.includes("Chưa tải được các trường của bạn"),
		"cho du lieu het han roi chan duong goi va doi the, ma man KHONG hien loi tai " +
			"that bai. Trang may chu nap truoc CA BA the, nen chi sau khi du lieu het han " +
			"moi co mot luot goi that de chan.",
	);
	doi(chuLoi.includes("Thử lại"), "man loi KHONG co nut Thu lai");
	await loiTrang.screenshot({ path: chupVao("trang-thai-loi") });
	await loiTrang.close();

	ketLuan("trang-thai");
}

async function napTruocDungThucThe(browser, cookie, slug) {
	const KHUNG = [
		{ tham: "contact", the: "Cá nhân", entity: "CONTACT" },
		{ tham: "deal", the: "Thoả thuận", entity: "DEAL" },
	];

	for (const k of KHUNG) {
		const goi = [];
		const page = await browser.newPage();
		await page.setViewport({ width: 1280, height: 900 });
		await page.setCookie(
			{ name: LANG, value: "vi", url: APP },
			{ name: cookie.name, value: cookie.value, url: APP },
		);
		page.on("request", (r) => {
			if (r.url().includes("fields.list")) goi.push(r.url());
		});

		await page.goto(`${APP}/${slug}/settings/fields?thucThe=${k.tham}`, {
			waitUntil: "networkidle0",
			timeout: 60000,
		});
		await new Promise((r) => setTimeout(r, 2500));

		const dang = await page.evaluate(
			() =>
				[...document.querySelectorAll('[role="tab"]')]
					.find((t) => t.getAttribute("aria-selected") === "true")
					?.textContent.trim() ?? "",
		);
		doi(
			dang === k.the,
			`mo dia chi ?thucThe=${k.tham} nhung the dang mo la ${JSON.stringify(dang)}, cho ${JSON.stringify(k.the)}`,
		);

		const nhamThucThe = goi.filter((u) => u.includes(k.entity));
		doi(
			nhamThucThe.length === 0,
			`may chu KHONG nap truoc danh sach cua ${k.entity}: trinh duyet phai tu goi ` +
				`${nhamThucThe.length} lan cho dung thuc the do (${nhamThucThe[0] ?? ""}). ` +
				"Nghia la mo lai hay chia se duong dan phai cho mot luot tai thu hai.",
		);

		const coVongCho = await page.evaluate(() =>
			Boolean(document.querySelector("main [class*=animate-spin]")),
		);
		doi(
			!coVongCho,
			`mo dia chi ?thucThe=${k.tham} ma man con vong cho sau khi mang da yen — ` +
				"dau hieu du lieu khong den tu lan nap truoc cua may chu",
		);

		await page.screenshot({ path: chupVao(`nap-truoc-${k.entity}`) });
		await page.close();
	}

	ketLuan("nap-truoc-dung-thuc-the");
}

const ANH_TK = `${ANH}/design-pass`;

function chupTK(ten) {
	if (!existsSync(ANH_TK)) mkdirSync(ANH_TK, { recursive: true });
	return `${ANH_TK}/${ten}.png`;
}

const KHO = [
	{ ten: "mobile-375", w: 375, h: 812 },
	{ ten: "desktop-1280", w: 1280, h: 900 },
];

const docTran = () => {
	const de = document.documentElement;
	const tran = [...document.querySelectorAll("main *")]
		.filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1)
		.slice(0, 5)
		.map((e) => ({
			tag: e.tagName,
			cls: String(e.className ?? "").slice(0, 60),
			phai: Math.round(e.getBoundingClientRect().right),
		}));
	const tl = document.querySelector('[role="tablist"]');
	return {
		khung: window.innerWidth,
		trangTranNgang: de.scrollWidth > de.clientWidth + 1,
		soPhanTuTran: tran.length,
		mauTran: tran,
		tablist: tl
			? {
					cuonDuoc: tl.scrollWidth > tl.clientWidth + 1,
					scrollW: Math.round(tl.scrollWidth),
					clientW: Math.round(tl.clientWidth),
					overflowX: getComputedStyle(tl).overflowX,
				}
			: null,
		the: [...document.querySelectorAll('[role="tab"]')].map((t) => {
			const b = t.getBoundingClientRect();
			return {
				chu: t.textContent.trim(),
				w: Math.round(b.width),
				h: Math.round(b.height),
				trongKhung: b.left >= -1 && b.right <= window.innerWidth + 1,
			};
		}),
	};
};

async function banPhimVaKhoHep(browser, cookie, slug) {
	for (const k of KHO) {
		const page = await browser.newPage();
		await page.setViewport({ width: k.w, height: k.h });
		await page.setCookie(
			{ name: LANG, value: "vi", url: APP },
			{ name: cookie.name, value: cookie.value, url: APP },
		);
		await page.goto(`${APP}/${slug}/settings/fields`, {
			waitUntil: "networkidle0",
			timeout: 60000,
		});
		await new Promise((r) => setTimeout(r, 1500));

		const d = await page.evaluate(docTran);
		console.log(`kho ${k.ten}: ${JSON.stringify(d.tablist)}`);

		doi(
			!d.trangTranNgang,
			`kho ${k.ten}: TRANG tran ngang — nguoi phai cuon ngang ca trang`,
		);
		doi(
			d.soPhanTuTran === 0,
			`kho ${k.ten}: ${d.soPhanTuTran} phan tu trong than trang tran khoi khung: ${JSON.stringify(d.mauTran)}`,
		);
		doi(d.the.length === 3, `kho ${k.ten}: co ${d.the.length} the, cho ba`);
		for (const t of d.the) {
			doi(
				t.w > 0 && t.h >= 24,
				`kho ${k.ten}: the ${JSON.stringify(t.chu)} co hop ${t.w}x${t.h} — qua nho de bam`,
			);
		}

		if (k.w < 768) {
			const bo = d.tablist;
			const vuaKhung = d.the.every((t) => t.trongKhung);
			doi(
				bo?.cuonDuoc === true || vuaKhung,
				`kho ${k.ten}: ba the KHONG vua khung ma hang the cung KHONG cuon ngang duoc ` +
					`(scrollW ${bo?.scrollW} vs clientW ${bo?.clientW}, overflowX ${bo?.overflowX}) — ` +
					"nguoi o kho hep khong voi duoc the cuoi",
			);
		}

		await page.screenshot({ path: chupTK(`co-du-lieu--${k.ten}`) });

		const rong = await browser.newPage();
		await rong.setViewport({ width: k.w, height: k.h });
		await rong.setCookie(
			{ name: LANG, value: "vi", url: APP },
			{ name: cookie.name, value: cookie.value, url: APP },
		);
		await rong.goto(`${APP}/${slug}/settings/fields?thucThe=deal`, {
			waitUntil: "networkidle0",
			timeout: 60000,
		});
		await new Promise((r) => setTimeout(r, 1500));
		await rong.screenshot({ path: chupTK(`rong--${k.ten}`) });
		await rong.close();

		if (k.w >= 768) {
			const ok = await duongBanPhim(page);
			doi(ok.doiThe, `duong ban phim: ${ok.viDoiThe}`);
			doi(ok.escDong, `duong ban phim: ${ok.viEsc}`);
			doi(ok.thayVongFocus, `duong ban phim: ${ok.viFocus}`);
		}

		await page.close();
	}

	ketLuan("ban-phim-va-kho-hep");
}

async function duongBanPhim(page) {
	const ra = {
		doiThe: false,
		escDong: false,
		thayVongFocus: false,
		viDoiThe: "",
		viEsc: "",
		viFocus: "",
	};

	const the = await page.$$('[role="tab"]');
	if (the.length < 2) {
		ra.viDoiThe = "khong du the de thu mui ten";
		return ra;
	}

	await the[0].focus();
	const focusTruoc = await page.evaluate(() => {
		const el = document.activeElement;
		const s = el ? getComputedStyle(el) : null;
		return {
			chu: el?.textContent?.trim() ?? "",
			vien: s ? `${s.outlineStyle} ${s.outlineWidth}` : "",
			bong: s ? s.boxShadow : "",
		};
	});
	ra.thayVongFocus =
		(focusTruoc.vien !== "" && !/none 0px/.test(focusTruoc.vien)) ||
		(focusTruoc.bong !== "none" && focusTruoc.bong !== "");
	ra.viFocus = ra.thayVongFocus
		? ""
		: `the dang focus (${JSON.stringify(focusTruoc.chu)}) KHONG co vong focus thay duoc: ` +
			`outline ${JSON.stringify(focusTruoc.vien)}, box-shadow ${JSON.stringify(focusTruoc.bong)}`;

	await page.keyboard.press("ArrowRight");
	await new Promise((r) => setTimeout(r, 1200));
	const sau = await page.evaluate(
		() =>
			[...document.querySelectorAll('[role="tab"]')]
				.find((t) => t.getAttribute("aria-selected") === "true")
				?.textContent.trim() ?? "",
	);
	ra.doiThe = sau === "Cá nhân";
	ra.viEsc = "";
	ra.viDoiThe = ra.doiThe
		? ""
		: `bam mui ten phai tren hang the ma the dang mo la ${JSON.stringify(sau)}, cho "Cá nhân"`;

	let moO = false;
	const hangTruong = await page.$$('[data-slot="dropdown-menu-trigger"]');
	if (hangTruong.length > 0) {
		const nhan = await hangTruong[0].evaluate((el) =>
			el.textContent.trim().replace(/^Thêm hành động cho /, ""),
		);
		const nutTruong = await page.$$("main button");
		for (const n of nutTruong) {
			const t = await n.evaluate((el) => el.textContent.trim());
			if (t.startsWith(nhan)) {
				await n.click();
				await new Promise((r) => setTimeout(r, 1800));
				moO = await page.evaluate(() =>
					Boolean(document.querySelector("main input")),
				);
				if (moO) break;
			}
		}
	}

	if (!moO) {
		const nut = await page.$$("button");
		for (const n of nut) {
			const t = await n.evaluate((el) => el.textContent.trim());
			if (t === "Trường mới") {
				await n.click();
				await new Promise((r) => setTimeout(r, 1500));
				moO = true;
				ra.viEsc =
					"khong mo duoc o SUA cua truong co that nen thu Esc tren o TAO MOI";
				break;
			}
		}
	}
	if (!moO) {
		ra.viEsc = "khong mo duoc o sua de thu Esc";
		return ra;
	}

	const oNhan = await page.$("main input");
	if (!oNhan) {
		ra.viEsc = "o sua mo ra ma khong co o nhap nao de dat con tro";
		return ra;
	}
	await oNhan.click();
	await new Promise((r) => setTimeout(r, 400));

	await page.screenshot({ path: chupTK("ban-phim-truoc-esc--o-sua-mo") });

	await page.keyboard.press("Escape");
	await new Promise((r) => setTimeout(r, 1200));
	const conO = await page.evaluate(() =>
		Boolean(document.querySelector("main input")),
	);
	await page.screenshot({ path: chupTK("ban-phim-sau-esc--o-sua-dong") });
	ra.escDong = !conO;
	if (!ra.escDong)
		ra.viEsc =
			"bam Esc tren o sua ma o van mo — dac ta UX muc 4 khai Esc dong o sua";

	return ra;
}

const CHE_DO = {
	"duong-vao": duongVao,
	"tieu-de-trang": tieuDeTrang,
	"ba-the": baThe,
	"the-tren-dia-chi": theTrenDiaChi,
	"khong-bat-khay": khongBatKhay,
	"tao-tu-goi-y": taoTuGoiY,
	"ba-nhom": baNhom,
	"ba-viec": baViec,
	"khay-cu": khayCu,
	"trang-thai": trangThai,
	"nap-truoc-dung-thuc-the": napTruocDungThucThe,
	"ban-phim-va-kho-hep": banPhimVaKhoHep,
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
