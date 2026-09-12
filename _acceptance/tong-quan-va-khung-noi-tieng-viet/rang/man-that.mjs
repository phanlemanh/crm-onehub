import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { giuDoc } from "../../man-cai-dat-noi-tieng-viet/rang/khoa-cay.mjs";
import {
	API,
	APP,
	CAO,
	CHI_SO,
	CHROME,
	DAU_VIET,
	DO_RONG,
	datTrinhDuyet,
	docCay,
	docKhai,
	GOM,
	HEP,
	ket,
	khongDo,
	mu,
	phien,
	RONG,
	soCap,
	suySlug,
	tsCua,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

await giuDoc();

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const KHAI = docKhai(`${HERE}/lat-tong-quan.json`, "lat-tong-quan");
const CHO_TAI = Number(process.env.CHO_TAI ?? 120000);
const CHO_LANG = Number(process.env.CHO_LANG ?? 2500);
const CHO_BAM = 700;
const CHUOI_KHONG_KHOP = "zzqx";
const DON_VI_RUT_GON = ["N", "Tr", "T", "K", "M", "B"];
const laSoTien = (chu) => {
	const con = chu
		.replace(/[\d.,\s\u00a0+\-−%]/g, "")
		.replace(new RegExp(`^(${DON_VI_RUT_GON.join("|")})`), "");
	return (
		con !== chu && /^[^\p{L}]*$|^(US\$|CA\$|A\$|NZ\$|HK\$|[A-Z]{3})$/u.test(con)
	);
};

const KHUNG = (await import(`${GOC}/apps/app/lib/messages/khung-ung-dung.ts`))
	.khungUngDungMessages;
const TONG_QUAN = (await import(`${GOC}/apps/app/lib/messages/tong-quan.ts`))
	.tongQuanMessages;
const GIAI_DOAN = (await import(`${GOC}/apps/app/lib/deal-stage.ts`))
	.DEAL_STAGE_OPTIONS;

const SLOT = {
	menu: '[data-slot="dropdown-menu-content"]',
	ck: '[data-slot="dialog-content"]',
	nganKeo: '[data-slot="sheet-content"]',
	nganKeoRail: '[data-slot="sheet-content"] nav',
};

let TD = null;

async function goiApiTho(cookie, duong, vao) {
	const url = `${API}/api/trpc/${duong}?input=${encodeURIComponent(JSON.stringify(vao))}`;
	const res = await fetch(url, { redirect: "manual", headers: mu(cookie) });
	if (!res.ok)
		await khongDo(`KHONG DO DUOC: tien de thieu — ${duong} tra ${res.status}.`);
	return (await res.json()).result.data;
}

async function moTrang(cookie, slug, duong, tieng, rong) {
	const trang = await TD.newPage();
	await trang.setViewport({ width: rong, height: CAO, deviceScaleFactor: 1 });
	await trang.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
	await TD.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: "localhost", path: "/" },
		{ name: "lang", value: tieng, domain: "localhost", path: "/" },
	);
	const duoi =
		duong === "/" ? "" : duong.startsWith("/?") ? duong.slice(1) : duong;
	const dich = new URL(`/${slug}${duoi}`, APP);
	const res = await trang.goto(dich.href, {
		waitUntil: "networkidle0",
		timeout: CHO_TAI,
	});
	const chang = res?.request().redirectChain().length ?? 0;
	const ve = new URL(trang.url());
	const loi =
		chang > 0
			? `${duong} bi chuyen huong ${chang} chang`
			: ve.pathname.replace(/\/$/, "") !== dich.pathname.replace(/\/$/, "")
				? `xin ${dich.pathname} nhung dung o ${ve.pathname}`
				: null;
	if (loi !== null)
		return { trang, loi: `KHONG DO DUOC: tien de thieu — ${loi}.` };
	await new Promise((r) => setTimeout(r, CHO_LANG));
	const langThat = await trang.evaluate(() => document.documentElement.lang);
	if (langThat !== tieng)
		return {
			trang,
			loi: `KHONG DO DUOC: tien de thieu — xin lang=${tieng} nhung trang ve lang=${langThat}.`,
		};
	return { trang, loi: null };
}

async function langEnTrenTrang(trang) {
	return new Set(
		await trang.evaluate(() =>
			[...document.querySelectorAll('[lang="en"]')].map((e) =>
				(e.textContent ?? "").replace(/\s+/g, " ").trim(),
			),
		),
	);
}

async function docHai(cookie, slug, duong, rong, goc, lai) {
	const ra = { title: {}, langEn: new Set(), nav: {} };
	for (const tieng of ["vi", "en"]) {
		const mo = await moTrang(cookie, slug, duong, tieng, rong);
		if (mo.loi !== null) {
			await mo.trang.close();
			return { tuChoi: `${duong} (lang=${tieng}) — ${mo.loi}` };
		}
		if (lai !== undefined) {
			const loiLai = await lai(mo.trang, tieng);
			if (loiLai) {
				await mo.trang.close();
				return { tuChoi: `${duong} (lang=${tieng}) — ${loiLai}` };
			}
		}
		const gia = await mo.trang.evaluate(GOM, goc);
		ra.title[tieng] = await mo.trang.title();
		for (const c of await langEnTrenTrang(mo.trang)) ra.langEn.add(c);
		ra.nav[tieng] = await mo.trang.evaluate(() =>
			[...document.querySelectorAll("nav")]
				.filter((n) => n.getBoundingClientRect().width > 0)
				.map((n) => n.getAttribute("aria-label") ?? ""),
		);
		ra[tieng] = gia;
		await mo.trang.close();
		if (gia === null || gia.length === 0)
			return {
				tuChoi: `${duong} (lang=${tieng}) gom ra ${gia === null ? "khong co goc" : "0 chuoi"} trong ${goc}`,
			};
	}
	return ra;
}

function bangKhongDich() {
	const k = docKhai(`${HERE}/khong-dich-cua-lat.json`, "khong-dich-cua-lat");
	const gia = new Map();
	for (const d of k.dong) {
		if (d.gia_tri !== undefined) gia.set(d.gia_tri, d);
		if (d.nguon === "lib/deal-stage.ts")
			for (const s of GIAI_DOAN)
				gia.set(s.label, { ...d, gia_tri: s.label, stage: s.value });
	}
	return { khai: k, gia };
}

function boiChung(mienDau, khongDich, langEn) {
	return (chu, g) => {
		if (CHI_SO.test(chu)) return "so-thuan";
		if (laSoTien(chu)) return "so-tien";
		if (g.khongDich) return "du-lieu-nguoi-nhap";
		if (g.khoa.endsWith("@value")) return "o-nhap";
		if (langEn.has(chu)) return "lang-en";
		if (khongDich.has(chu)) return "khong-dich";
		if (mienDau.has(chu) && DAU_VIET.test(chu) === false) return "mien-dau";
		return null;
	};
}

function baVe(ten, hai, boi) {
	let hong = 0;
	console.log(
		`\n-- ${ten} · vi=${hai.vi.length} chuoi · en=${hai.en.length} chuoi`,
	);
	if (hai.vi.length !== hai.en.length) {
		console.log(`   VE 1 HONG: so chuoi hai luot khong bang nhau.`);
		hong += 1;
	}
	const k = soCap(hai.vi, hai.en, boi);
	for (const l of k.lech.slice(0, 5))
		console.log(
			`   VE 1 HONG: cap ${l.so} lech duong DOM — vi=${l.vi} · en=${l.en}`,
		);
	for (const o of k.trung)
		console.log(
			`   VE 2 HONG: ${JSON.stringify(o.chu)} giong het hai luot — ${o.khoa}`,
		);
	for (const o of k.khongDau)
		console.log(
			`   VE 3 HONG: luot vi khong dau — ${JSON.stringify(o.chu)} — ${o.khoa}`,
		);
	hong += k.lech.length + k.trung.length + k.khongDau.length;
	console.log(
		`   cap doi chieu=${k.soCap} · lech=${k.lech.length} · giong=${k.trung.length} · khong dau=${k.khongDau.length}`,
	);
	return { hong, soCap: k.soCap };
}

function navKhacNhau(ten, hai) {
	let hong = 0;
	for (const tieng of ["vi", "en"]) {
		const nhan = hai.nav[tieng];
		const trung = nhan.filter((n, i) => nhan.indexOf(n) !== i);
		if (trung.length > 0) {
			console.log(
				`   NAV TRUNG NHAN (${tieng}) tren ${ten}: ${JSON.stringify(trung)} — hai nav cung hien mang cung aria-label`,
			);
			hong += trung.length;
		}
	}
	return hong;
}

function tieuDeHaiLuot(hai) {
	const { vi, en } = hai.title;
	console.log(
		`   document.title: vi=${JSON.stringify(vi)} · en=${JSON.stringify(en)}`,
	);
	if (vi === en || !DAU_VIET.test(vi)) {
		console.log(
			"   TIEU DE HONG: hai luot phai khac nhau va luot vi phai co dau.",
		);
		return 1;
	}
	return 0;
}

function mienDauCuaLat() {
	return new Map((KHAI.mien_dau ?? []).map((m) => [m.chuoi, m.vi_sao]));
}

async function chanHaiTieng(cookie, slug) {
	const { gia: khongDich } = bangKhongDich();
	let hong = 0;
	let capTong = 0;
	for (const duong of ["/", "/?scope=everyone"]) {
		const hai = await docHai(cookie, slug, duong, RONG, true);
		if (hai.tuChoi !== undefined) await khongDo(`KHONG DO DUOC: ${hai.tuChoi}`);
		const boi = boiChung(mienDauCuaLat(), khongDich, hai.langEn);
		const r = baVe(`man ${duong} (goc toan man)`, hai, boi);
		hong += r.hong + tieuDeHaiLuot(hai) + navKhacNhau(duong, hai);
		capTong += r.soCap;
	}
	console.log(`\nket qua: ${capTong} cap doi chieu · hong=${hong}`);
	if (capTong === 0) await khongDo("KHONG DO DUOC: 0 cap doi chieu.");
	await ket(hong > 0 ? 1 : 0);
}

function laiMenu(trang, tieng) {
	return trang
		.click(`button[aria-label="${KHUNG(tieng).header.accountMenu}"]`)
		.then(() => new Promise((r) => setTimeout(r, CHO_BAM)))
		.then(() => null)
		.catch((e) => `khong bam duoc menu tai khoan: ${e.message}`);
}

async function laiCk(trang) {
	await trang.keyboard.down("Meta");
	await trang.keyboard.press("k");
	await trang.keyboard.up("Meta");
	await new Promise((r) => setTimeout(r, CHO_BAM));
	const mo = await trang.$(SLOT.ck);
	if (mo === null) return "⌘K khong mo hop tim nhanh";
	await trang.keyboard.type(CHUOI_KHONG_KHOP);
	await new Promise((r) => setTimeout(r, CHO_BAM));
	return null;
}

function laiNganKeo(trang, tieng) {
	return trang
		.click(`button[aria-label="${KHUNG(tieng).nav.open}"]`)
		.then(() => new Promise((r) => setTimeout(r, CHO_BAM)))
		.then(() => null)
		.catch((e) => `khong bam duoc nut mo dieu huong: ${e.message}`);
}

const BE_MAT = [
	{
		ten: "menu tai khoan",
		duong: "/",
		rong: RONG,
		goc: SLOT.menu,
		lai: laiMenu,
	},
	{ ten: "hop ⌘K", duong: "/", rong: RONG, goc: SLOT.ck, lai: laiCk },
	{
		ten: "ngan keo tren /",
		duong: "/",
		rong: HEP,
		goc: SLOT.nganKeo,
		lai: laiNganKeo,
	},
	{
		ten: "ngan keo tren /chat (chi rail)",
		duong: "/chat",
		rong: HEP,
		goc: SLOT.nganKeoRail,
		lai: laiNganKeo,
		tru: SLOT.nganKeo,
		chuSoHuu: "cua-so-tro-chuyen-noi-tieng-viet",
	},
];

async function chanSauBam(cookie, slug) {
	const { gia: khongDich } = bangKhongDich();
	const mienDau = mienDauCuaLat();
	let hong = 0;
	let capTong = 0;
	const tuChoi = [];
	for (const b of BE_MAT) {
		const hai = await docHai(cookie, slug, b.duong, b.rong, b.goc, b.lai);
		if (hai.tuChoi !== undefined) {
			tuChoi.push(`${b.ten}: ${hai.tuChoi}`);
			continue;
		}
		if (b.tru !== undefined) {
			const ca = await docHai(cookie, slug, b.duong, b.rong, b.tru, b.lai);
			if (ca.tuChoi === undefined)
				console.log(
					`\n-- ${b.ten}: da tru ${ca.vi.length - hai.vi.length} chuoi cua ho so ${b.chuSoHuu} (thanh ben hoi thoai)`,
				);
		}
		const r = baVe(b.ten, hai, boiChung(mienDau, khongDich, hai.langEn));
		if (b.ten === "hop ⌘K") {
			const co = hai.vi.some((g) => g.chu === KHUNG("vi").switcher.noMatch);
			console.log(`   cau khong-khop cua ⌘K ${co ? "co mat" : "KHONG co mat"}`);
			if (!co) hong += 1;
		}
		hong += r.hong + navKhacNhau(b.ten, hai);
		capTong += r.soCap;
	}
	console.log(
		`\nket qua: ${BE_MAT.length - tuChoi.length}/${BE_MAT.length} be mat · ${capTong} cap · hong=${hong}`,
	);
	if (hong > 0) await ket(1);
	if (tuChoi.length > 0) {
		for (const t of tuChoi) console.log(`KHONG DO DUOC: ${t}`);
		await ket(2);
	}
	if (capTong === 0)
		await khongDo("KHONG DO DUOC: 0 cap doi chieu tren ba be mat.");
	await ket(0);
}

async function chanTrangThaiRong(cookie, slug) {
	const tomTat = await goiApiTho(cookie, "dashboard.summary", { scope: "me" });
	const day = ["biggestOpen", "overdueTasks", "recentActivity"].filter(
		(k) => tomTat[k].length > 0,
	);
	if (day.length > 0)
		await khongDo(
			`KHONG DO DUOC: tien de thieu — tai khoan do so huu du lieu o ${day.join(", ")}; scope=me khong rong.`,
		);
	const { gia: khongDich } = bangKhongDich();
	const hai = await docHai(cookie, slug, "/?scope=me", RONG, true);
	if (hai.tuChoi !== undefined) await khongDo(`KHONG DO DUOC: ${hai.tuChoi}`);
	const r = baVe(
		"man /?scope=me (rong)",
		hai,
		boiChung(mienDauCuaLat(), khongDich, hai.langEn),
	);
	let hong = r.hong;
	const m = TONG_QUAN("vi");
	const cauRong = [
		["bang thoa thuan", m.open.empty],
		["bang viec", m.tasks.empty],
		["bang hoat dong", m.activity.empty],
	];
	const co = new Set(hai.vi.map((g) => g.chu));
	for (const [ten, cau] of cauRong) {
		const thay = co.has(cau);
		console.log(
			`   cau rong ${ten}: ${thay ? "co mat" : "KHONG CO MAT"} — ${JSON.stringify(cau)}`,
		);
		if (!thay) hong += 1;
	}
	const nguon = readFileSync(
		`${GOC}/apps/app/app/(app)/[slug]/sales-dashboard.tsx`,
		"utf8",
	);
	for (const [ten, khoa] of [
		["bieu do xu huong", "m.trend.empty"],
		["bieu do giai doan", "m.byStage.empty"],
	]) {
		const trenMan = co.has(
			ten === "bieu do xu huong" ? m.trend.empty : m.byStage.empty,
		);
		const trongMa = new RegExp(
			`<EmptyChart label=\\{${khoa.replace(/\./g, "\\.")}\\} />`,
		).test(nguon);
		console.log(
			`   cau rong ${ten}: ${trenMan ? "co mat tren man" : `khong dung duoc tren man (so lieu ca workspace) — do o muc ma: ${trongMa ? "prop doc tu kho" : "KHONG doc tu kho"}`}`,
		);
		if (!trenMan && !trongMa) hong += 1;
	}
	console.log(`\nket qua: ${r.soCap} cap · hong=${hong}`);
	if (r.soCap === 0) await khongDo("KHONG DO DUOC: 0 cap doi chieu.");
	await ket(hong > 0 ? 1 : 0);
}

async function chanKhongDich(cookie, slug) {
	const { khai, gia } = bangKhongDich();
	const tomTat = await goiApiTho(cookie, "dashboard.summary", {
		scope: "everyone",
	});
	const giaiDoanHien = new Set([
		...tomTat.pipeline.stages
			.filter((s) => s.valueCents > 0)
			.map((s) => s.stage),
		...tomTat.biggestOpen.map((d) => d.stage),
	]);
	const dat = new Map();
	const khongDo_ = [];
	for (const [gt, d] of gia) {
		const dk = d.dieu_kien;
		const ok =
			dk === "luon-hien" ||
			(dk === "ban-dev" && /localhost|127\.0\.0\.1/.test(APP)) ||
			(dk === "can-thoa-thuan-o-giai-doan" && giaiDoanHien.has(d.stage)) ||
			(dk === "can-thoa-thuan-chua-quy-doi" && tomTat.unconverted.count > 0);
		if (ok) dat.set(gt, d);
		else khongDo_.push({ gt, d });
	}
	console.log(
		`-- dieu kien: ${dat.size} dong dat · ${khongDo_.length} dong khong dung duoc tren man (do o muc ma)`,
	);
	const nguonGiaiDoan = readFileSync(
		`${GOC}/apps/app/app/(app)/[slug]/sales-dashboard.tsx`,
		"utf8",
	);
	let hongMa = 0;
	for (const { gt, d } of khongDo_) {
		const coLangEn =
			d.stage !== undefined
				? /lang="en"[\s\S]{0,80}\{slice\.label\}/.test(nguonGiaiDoan)
				: /m\.unconverted\.sentence\([\s\S]{0,200}reportingCurrency/.test(
						nguonGiaiDoan,
					);
		console.log(
			`   KHONG DO DUOC TREN MAN: ${JSON.stringify(gt)} — ${d.dieu_kien} · muc ma: ${coLangEn ? (d.stage !== undefined ? "phan tu render mang lang=en" : "gia tri la tham so cua cau, khong phai chu dich") : "KHONG dat"}`,
		);
		if (!coLangEn) hongMa += 1;
	}
	const hai = await docHai(cookie, slug, "/?scope=everyone", RONG, true);
	if (hai.tuChoi !== undefined) await khongDo(`KHONG DO DUOC: ${hai.tuChoi}`);
	if (hai.vi.length !== hai.en.length) {
		console.log(
			`DO: hai luot lech so phan tu (vi=${hai.vi.length}, en=${hai.en.length}) — tap ung vien khong doi xung.`,
		);
		await ket(1);
	}
	const ung = new Map();
	for (let i = 0; i < hai.vi.length; i += 1) {
		const a = hai.vi[i];
		const b = hai.en[i];
		const kd = a.khongDich || b.khongDich;
		if (!kd && !(a.khoa === b.khoa && a.chu === b.chu)) continue;
		if (
			CHI_SO.test(a.chu) ||
			laSoTien(a.chu) ||
			kd ||
			hai.langEn.has(a.chu) ||
			a.khoa.endsWith("@value")
		)
			continue;
		ung.set(a.chu, (ung.get(a.chu) ?? 0) + 1);
	}
	console.log(`-- ung vien sinh tu man (sau ba luat): ${ung.size} gia tri`);
	const thua = [...ung.keys()].filter((v) => !dat.has(v));
	const thieu = [...dat.keys()].filter(
		(v) => !ung.has(v) && !hai.langEn.has(v),
	);
	for (const v of thua)
		console.log(`THUA: man co ${JSON.stringify(v)} ma bang khong khai`);
	for (const v of thieu)
		console.log(
			`THIEU: bang khai ${JSON.stringify(v)} (dieu kien dat) ma man khong co`,
		);
	const giaiDoanTrenMan = [...dat.values()].filter(
		(d) => d.stage !== undefined && hai.langEn.has(d.gia_tri),
	).length;
	console.log(
		`-- nhan giai doan mang lang=en tren man: ${giaiDoanTrenMan}/${[...dat.values()].filter((d) => d.stage !== undefined).length}`,
	);
	const giaiDoanThieuLangEn = [...dat.values()].filter(
		(d) => d.stage !== undefined && !hai.langEn.has(d.gia_tri),
	);
	for (const d of giaiDoanThieuLangEn)
		console.log(
			`DO: ${JSON.stringify(d.gia_tri)} hien tren man ma khong nam trong phan tu lang=en`,
		);
	console.log(
		`\nket qua: thua=${thua.length} · thieu=${thieu.length} · giai doan thieu lang=en=${giaiDoanThieuLangEn.length} · muc ma hong=${hongMa}`,
	);
	if (thua.length + giaiDoanThieuLangEn.length + hongMa > 0) await ket(1);
	if (thieu.length > 0) await ket(2);
	if (khai.dong.length === 0)
		await khongDo("KHONG DO DUOC: bang khong-dich rong.");
	await ket(0);
}

function bocTranslateNo(file, bieuThuc) {
	const ts = tsCua();
	const nguon = docCay(file);
	const ra = [];
	const mang = (n) => {
		for (let e = n; e; e = e.parent) {
			const mo = ts.isJsxElement(e)
				? e.openingElement
				: ts.isJsxSelfClosingElement(e)
					? e
					: null;
			if (
				mo &&
				mo.attributes.properties.some(
					(p) =>
						ts.isJsxAttribute(p) &&
						p.name.getText(nguon) === "translate" &&
						p.initializer?.getText(nguon) === '"no"',
				)
			)
				return true;
		}
		return false;
	};
	const di = (n) => {
		if (
			ts.isJsxExpression(n) &&
			(ts.isJsxElement(n.parent) || ts.isJsxFragment(n.parent)) &&
			n.expression?.getText(nguon) === bieuThuc
		)
			ra.push({
				dong: nguon.getLineAndCharacterOfPosition(n.getStart(nguon)).line + 1,
				co: mang(n),
			});
		ts.forEachChild(n, di);
	};
	di(nguon);
	return ra;
}

async function chanDuLieuNguoiNhap(cookie, slug) {
	const bang = docKhai(`${HERE}/du-lieu-nguoi-nhap.json`, "du-lieu-nguoi-nhap");
	let thieuMa = 0;
	let chet = 0;
	console.log('-- CHAN MA: phan tu JSX boc bieu thuc phai mang translate="no"');
	for (const o of bang.o) {
		const thay = bocTranslateNo(o.file, o.bieu_thuc);
		if (thay.length === 0) {
			console.log(
				`   KHONG DO DUOC: ${o.file} khong con JSX nao boc ${JSON.stringify(o.bieu_thuc)} — ban khai da cu`,
			);
			chet += 1;
			continue;
		}
		for (const t of thay) {
			console.log(
				`   ${t.co ? "co  " : "THIEU"} translate="no" — ${o.file}:${t.dong} boc ${JSON.stringify(o.bieu_thuc)}`,
			);
			if (!t.co) thieuMa += 1;
		}
	}
	if (chet > 0) await ket(2);
	console.log(
		"\n-- CHAN MAN: vat san co tren workspace, gia tri lay tu API trong cung luot",
	);
	const ws = await goiApiTho(cookie, "workspace.get", undefined);
	const tomTat = await goiApiTho(cookie, "dashboard.summary", {
		scope: "everyone",
	});
	const NGUON = {
		"workspace.get.name": ws.name,
		"phien.email": process.env.NGUOI ?? "dev@localhost",
		"phien.chuCaiDau": (process.env.NGUOI ?? "dev@localhost")
			.split("@")[0]
			.split(" ")
			.map((p) => p[0])
			.filter(Boolean)
			.slice(0, 2)
			.join("")
			.toUpperCase(),
		"biggestOpen[0].name": tomTat.biggestOpen[0]?.name,
		"biggestOpen[0].company.name": tomTat.biggestOpen[0]?.company?.name,
		"overdueTasks[0].subject": tomTat.overdueTasks[0]?.subject,
		"recentActivity[0].createdBy.name":
			tomTat.recentActivity[0]?.createdBy?.name,
		"recentActivity[0].subject": tomTat.recentActivity[0]?.subject ?? undefined,
	};
	const mo = await moTrang(cookie, slug, "/?scope=everyone", "vi", RONG);
	if (mo.loi !== null) await khongDo(mo.loi);
	await laiMenu(mo.trang, "vi");
	const gia = await mo.trang.evaluate(GOM, true);
	await mo.trang.close();
	let doDuoc = 0;
	let khongDoDuoc = 0;
	let thieuMan = 0;
	for (const o of bang.o) {
		if (o.nguon_san === undefined) {
			khongDoDuoc += 1;
			console.log(`   KHONG DO TREN MAN: ${o.truong} — ${o.vi_sao_san}`);
			continue;
		}
		const gt = NGUON[o.nguon_san];
		if (gt === undefined || gt === null || gt === "") {
			khongDoDuoc += 1;
			console.log(
				`   KHONG DO TREN MAN: ${o.truong} — nguon ${o.nguon_san} rong tren workspace nay`,
			);
			continue;
		}
		const cho = gia.filter(
			(g) => g.chu === String(gt).replace(/\s+/g, " ").trim(),
		);
		if (cho.length === 0) {
			console.log(
				`   DO: ${o.truong} = ${JSON.stringify(gt)} co o API ma khong hien tren man`,
			);
			thieuMan += 1;
			continue;
		}
		doDuoc += 1;
		for (const c of cho) {
			console.log(
				`   ${c.khongDich ? "co  " : "THIEU"} translate="no" — ${o.truong} ${c.khoa} = ${JSON.stringify(c.chu)}`,
			);
			if (!c.khongDich) thieuMan += 1;
		}
	}
	console.log(
		`\nket qua: chan ma thieu=${thieuMa} · chan man do duoc=${doDuoc} · khong do duoc=${khongDoDuoc} · thieu tren man=${thieuMan} · dong bang=${bang.o.length}`,
	);
	if (thieuMa + thieuMan > 0) await ket(1);
	if (doDuoc + khongDoDuoc !== bang.o.length) {
		console.log("KHONG DO DUOC: do duoc + khong do duoc != so dong bang.");
		await ket(2);
	}
	if (doDuoc === 0) await khongDo("KHONG DO DUOC: 0 o do duoc tren man.");
	await ket(0);
}

async function doRongHai(cookie, slug, duong, goc, lai) {
	const ra = {};
	for (const tieng of ["vi", "en"]) {
		const mo = await moTrang(cookie, slug, duong, tieng, HEP);
		if (mo.loi !== null) {
			await mo.trang.close();
			return null;
		}
		if (lai !== undefined) await lai(mo.trang, tieng);
		const gia = await mo.trang.evaluate(DO_RONG, goc);
		await mo.trang.close();
		if (gia === null) return null;
		ra[tieng] = new Map(gia.map((g) => [g.khoa, g]));
	}
	return ra;
}

async function chanBeRong(cookie, slug) {
	let nhan = 0;
	let viTran = 0;
	let caHai = 0;
	const tuChoi = [];
	for (const b of [
		{ ten: "man /?scope=everyone", duong: "/?scope=everyone", goc: true },
		{ ten: "ngan keo di dong", duong: "/", goc: SLOT.nganKeo, lai: laiNganKeo },
	]) {
		const hai = await doRongHai(cookie, slug, b.duong, b.goc, b.lai);
		if (hai === null) {
			tuChoi.push(b.ten);
			continue;
		}
		const cap = [...hai.vi.keys()].filter(
			(k) => hai.en.has(k) && hai.en.get(k).chu !== hai.vi.get(k).chu,
		);
		console.log(`\n-- ${b.ten} o ${HEP}px · nhan dich duoc=${cap.length}`);
		nhan += cap.length;
		for (const k of cap) {
			const a = hai.vi.get(k);
			const c = hai.en.get(k);
			const ta = a.scrollWidth > a.clientWidth;
			const tb = c.scrollWidth > c.clientWidth;
			if (ta && tb) {
				caHai += 1;
				console.log(
					`   TRAN CA HAI LUOT: ${JSON.stringify(a.chu)} — vi ${a.scrollWidth}/${a.clientWidth} · en ${c.scrollWidth}/${c.clientWidth} — ${k}`,
				);
			} else if (ta) {
				viTran += 1;
				console.log(
					`   TRAN: ${JSON.stringify(a.chu)} — vi ${a.scrollWidth}/${a.clientWidth}px · en ${c.scrollWidth}/${c.clientWidth}px vua — ${k}`,
				);
			}
		}
	}
	console.log(`\nGIOI HAN KE THUA: mu voi vung chua cho xuong dong.`);
	console.log(
		`ket qua ${HEP}px: ${nhan} nhan dich duoc · vi tran ma en vua=${viTran} · tran ca hai=${caHai} · tu choi=${tuChoi.length}`,
	);
	if (viTran + caHai > 0) await ket(1);
	if (nhan === 0) await khongDo(`KHONG DO DUOC: 0 nhan dich duoc o ${HEP}px.`);
	if (tuChoi.length > 0) await ket(2);
	await ket(0);
}

async function chanGocThuoc(cookie, slug) {
	const ws = await goiApiTho(cookie, "workspace.get", undefined);
	const mo = await moTrang(cookie, slug, "/", "vi", RONG);
	if (mo.loi !== null) await khongDo(mo.loi);
	const h = KHUNG("vi").header;
	const MOC = {
		GOM: [h.homepage, h.accountMenu],
		DO_RONG: [ws.name],
	};
	let hong = 0;
	for (const [ten, HAM] of [
		["GOM", GOM],
		["DO_RONG", DO_RONG],
	]) {
		const a = await mo.trang.evaluate(HAM);
		const b = await mo.trang.evaluate(HAM, false);
		const c = await mo.trang.evaluate(HAM, true);
		const chu = (x) => new Set((x ?? []).map((g) => g.chu));
		const bang = JSON.stringify(a) === JSON.stringify(b);
		const cuThay = MOC[ten].filter((m) => chu(a).has(m));
		const moiThay = MOC[ten].filter((m) => chu(c).has(m));
		console.log(
			`-- ${ten}: khong tham so ≡ (false): ${bang ? "BANG" : "KHAC"} · goc cu thay ${cuThay.length}/${MOC[ten].length} moc thanh dau · goc moi thay ${moiThay.length}/${MOC[ten].length} · so phan tu cu=${a?.length ?? 0} moi=${c?.length ?? 0}`,
		);
		if (!bang) {
			hong += 1;
			console.log(`   DO ${ten}: mui goi khong tham so khong con la goc cu.`);
		}
		if (cuThay.length > 0) {
			hong += 1;
			console.log(
				`   DO ${ten}: goc cu thay thanh dau — ${cuThay.join(" · ")}`,
			);
		}
		if (moiThay.length < MOC[ten].length) {
			hong += 1;
			console.log(
				`   DO ${ten}: goc moi thieu ${MOC[ten].filter((m) => !moiThay.includes(m)).join(" · ")}`,
			);
		}
	}
	await mo.trang.close();
	console.log(`\nket qua: hong=${hong}`);
	await ket(hong > 0 ? 1 : 0);
}

const HOP_CO_TRAN = (duoi) => {
	const chat = (el) => {
		const s = getComputedStyle(el);
		return (
			s.whiteSpace === "nowrap" ||
			s.textOverflow === "ellipsis" ||
			s.overflowX === "hidden"
		);
	};
	const ra = [];
	for (const el of document.body.querySelectorAll("*")) {
		const r = el.getBoundingClientRect();
		if (r.width <= 1 || r.height <= 1) continue;
		if (!chat(el)) continue;
		const nut = [...el.childNodes].filter(
			(n) => n.nodeType === 3 && (n.nodeValue ?? "").trim() !== "",
		);
		if (nut.length === 0) continue;
		const chu = nut
			.map((n) => n.nodeValue.replace(/\s+/g, " ").trim())
			.join(" ");
		const giu = nut[0].nodeValue;
		nut[0].nodeValue = `${giu}${duoi}`;
		const tran = el.scrollWidth > el.clientWidth;
		nut[0].nodeValue = giu;
		ra.push({ chu, tran });
	}
	return ra;
};

async function chanBeRongTienDe(cookie, slug) {
	const nhom = TONG_QUAN("vi");
	const chuoi = (o) =>
		Object.values(o).flatMap((v) => (v instanceof Object ? [] : [String(v)]));
	const nhanLat = new Set([
		...Object.values(KHUNG("vi").rail),
		...chuoi(KHUNG("vi").header),
		...chuoi(KHUNG("vi").nav),
		...chuoi(nhom.stats),
		...chuoi(nhom.open),
		...chuoi(nhom.tasks),
		...chuoi(nhom.activity),
		...chuoi(nhom.trend),
		...chuoi(nhom.byStage),
		...chuoi(nhom.scope),
		...chuoi(nhom.greeting),
	]);
	const DUOI = " và còn dài thêm một đoạn nữa cho tràn hẳn";
	let tong = 0;
	let cuaLat = 0;
	const tranDuoc = [];
	for (const b of [
		{ ten: "man /?scope=everyone", duong: "/?scope=everyone" },
		{ ten: "ngan keo di dong", duong: "/", lai: laiNganKeo },
	]) {
		const mo = await moTrang(cookie, slug, b.duong, "vi", HEP);
		if (mo.loi !== null) {
			await mo.trang.close();
			await khongDo(mo.loi);
		}
		if (b.lai !== undefined) await b.lai(mo.trang, "vi");
		const hop = await mo.trang.evaluate(HOP_CO_TRAN, DUOI);
		await mo.trang.close();
		tong += hop.length;
		for (const h of hop)
			if (nhanLat.has(h.chu)) {
				cuaLat += 1;
				if (h.tran) tranDuoc.push(`${b.ten}: ${JSON.stringify(h.chu)}`);
			}
		console.log(
			`-- ${b.ten} o ${HEP}px: ${hop.length} hop chat cung mang chu · ${hop.filter((h) => h.tran).length} hop tran khi noi chu`,
		);
	}
	for (const v of tranDuoc)
		console.log(`   NHAN CUA LAT TRAN DUOC KHI NOI CHU: ${v}`);
	console.log(
		`\nket qua: ${cuaLat}/${tong} hop chat cung mang nhan cua lat · ${tranDuoc.length} trong so do TRAN DUOC khi noi chu. ${tranDuoc.length === 0 ? "Chieu do cua chan be-rong KHONG CO DOI TUONG o lat nay: moi nhan cua lat nam trong hop tu nong ra hoac cho xuong dong, nen mot nhan dai chi lam hop rong ra chu khong bao gio tran." : "Chieu do co doi tuong — cam vet vao mot trong cac nhan tren."}`,
	);
	await ket(0);
}

const BO_CHAN = {
	"be-rong-tien-de": chanBeRongTienDe,
	"hai-tieng": chanHaiTieng,
	"sau-bam": chanSauBam,
	"trang-thai-rong": chanTrangThaiRong,
	"khong-dich": chanKhongDich,
	"du-lieu-nguoi-nhap": chanDuLieuNguoiNhap,
	"be-rong": chanBeRong,
	"goc-thuoc": chanGocThuoc,
};

const chan = process.argv[2] ?? "";
if (BO_CHAN[chan] === undefined) {
	console.log(
		`KHONG DO DUOC: chan phai la mot trong: ${Object.keys(BO_CHAN).join(" | ")}. Nhan duoc: ${JSON.stringify(chan)}`,
	);
	process.exit(2);
}

const cookie = phien();
const slug = await suySlug(cookie);
TD = await puppeteer.launch({
	executablePath: CHROME,
	headless: "new",
	args: ["--no-sandbox", `--window-size=${RONG},${CAO}`],
});
datTrinhDuyet(TD);
console.log(
	`-- kho ${GOC} · workspace "${slug}" · lat ${KHAI.lat} · chan ${chan}`,
);
await BO_CHAN[chan](cookie, slug);
