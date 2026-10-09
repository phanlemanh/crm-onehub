import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { contactMessages } from "../../../apps/app/lib/messages/contacts.ts";
import { recordSheetMessages } from "../../../apps/app/lib/messages/record-sheet.ts";
import { db } from "../../../packages/db/src/index.ts";
import { hienThiSoDienThoai } from "../../../packages/validation/src/so-dien-thoai.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "dien-thoai-ca-nhan", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const NGUOI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const CHO_GHI_MS = 15_000;
const CHO_LOC_MS = 20_000;
const MA_TRAN = [
	"them-tab-1440",
	"them-tab-375",
	"tao-sheet-1440",
	"so-sai-375",
	"bang-1440",
	"tim-bang-1440",
	"cmdk-1440",
	"dem",
];
const THU_TU_O = ["Tên", "Họ", "Điện thoại", "Email", "Chức danh"];

const rs = recordSheetMessages("vi");
const cm = contactMessages("vi");
const MA = Date.now().toString(36);
const TEN = `DT ${MA}`;

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;

function kiem(ma, nhan, dat) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ${ma} khong co trong MA_TRAN`);
	daPhat.add(ma);
	dong.push(`${dat ? "DUNG" : "SAI"} ${ma}: ${nhan}`);
	if (!dat) sai += 1;
}

class KhongDo extends Error {}
function khongDo(cau) {
	throw new KhongDo(cau);
}

function soRieng(duoi) {
	const dem = String(Date.now() % 10_000_000).padStart(7, "0");
	return `09${duoi}${dem}`;
}

function phien() {
	const ra = execFileSync("bun", ["run", "dev:session", NGUOI], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) khongDo(`khong doc duoc cookie phien cua ${NGUOI}`);
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) khongDo(`${APP}/ tra ${res.status} khong co Location`);
	const dau = new URL(dich, APP).pathname.split("/").filter(Boolean)[0];
	if (!dau || dau === "sign-in" || dau.startsWith("onboarding"))
		khongDo(`${APP}/ chuyen toi ${dich}`);
	return dau;
}

async function trang(kho, cookie) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: "lang", value: "vi", domain: host, path: "/" },
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({
		width: kho,
		height: kho === 375 ? 812 : 900,
		deviceScaleFactor: 1,
	});
	const goiTao = [];
	p.on("request", (r) => {
		if (r.url().includes("contacts.create")) goiTao.push(r.url());
	});
	return { ctx, p, goiTao };
}

async function bamNutChu(p, boChon, chu) {
	const ok = await p.evaluate(
		(sel, t) => {
			const b = [...document.querySelectorAll(sel)].find(
				(x) =>
					x.getClientRects().length > 0 && (x.innerText ?? "").trim() === t,
			);
			if (!b) return false;
			b.scrollIntoView({ block: "nearest" });
			b.click();
			return true;
		},
		boChon,
		chu,
	);
	if (!ok) khongDo(`khong thay nut «${chu}»`);
}

async function nhanTrongForm(p, boChonForm) {
	return p.evaluate((sel) => {
		const f = [...document.querySelectorAll(sel)].find(
			(x) => x.getClientRects().length > 0,
		);
		if (!f) return null;
		return [...f.querySelectorAll("label")]
			.filter((l) => l.getClientRects().length > 0)
			.map((l) => (l.innerText ?? "").trim());
	}, boChonForm);
}

async function oTheoNhan(p, boChonForm, nhan) {
	const id = await p.evaluate(
		(sel, t) => {
			const f = [...document.querySelectorAll(sel)].find(
				(x) => x.getClientRects().length > 0,
			);
			const l = [...(f?.querySelectorAll("label") ?? [])].find(
				(x) => (x.innerText ?? "").trim() === t,
			);
			return l?.htmlFor ?? null;
		},
		boChonForm,
		nhan,
	);
	if (!id) khongDo(`khong thay o «${nhan}»`);
	return `[id="${id}"]`;
}

async function choCaNhan(ten) {
	const het = Date.now() + CHO_GHI_MS;
	while (Date.now() < het) {
		const c = await db.contact.findFirst({
			where: { firstName: ten },
			select: { id: true, phone: true, source: true, companyId: true },
		});
		if (c) return c;
		await new Promise((r) => setTimeout(r, 300));
	}
	return null;
}

function thuTuDung(nhan) {
	const loc = (nhan ?? []).filter((n) => THU_TU_O.includes(n));
	return loc.join(",") === THU_TU_O.join(",");
}

async function moFormTabCongTy(p, slug, congTy) {
	await p.goto(
		`${APP}/${slug}/companies?record=company:${congTy.id}&tab=contacts`,
		{ waitUntil: "networkidle0", timeout: CHO_MS },
	);
	await p
		.waitForFunction(
			(t) =>
				[...document.querySelectorAll("button")].some(
					(b) =>
						b.getClientRects().length > 0 && (b.innerText ?? "").trim() === t,
				),
			{ timeout: CHO_MS },
			rs.company.addContact,
		)
		.catch(() => khongDo(`khong thay nut «${rs.company.addContact}»`));
	await bamNutChu(p, "button", rs.company.addContact);
	await p
		.waitForSelector("form input[type=tel]", { timeout: CHO_MS })
		.catch(() => khongDo("thieu o Dien thoai"));
}

async function doThemTab(kho, cookie, slug, congTy, oMa) {
	const { ctx, p } = await trang(kho, cookie);
	try {
		await moFormTabCongTy(p, slug, congTy);
		const nhan = await nhanTrongForm(p, "form");
		const ten = `${TEN} Lan ${kho}`;
		const so = soRieng(kho === 1440 ? "1" : "2");
		const oSo = await oTheoNhan(p, "form", "Điện thoại");
		const kieu = await p.$eval(oSo, (o) => o.type);
		await p.type(await oTheoNhan(p, "form", "Tên"), ten);
		await p.type(oSo, `${so.slice(0, 4)} ${so.slice(4, 7)} ${so.slice(7)}`);
		await p.screenshot({ path: join(RA, `${oMa}.png`) });
		await p.click("form button[type=submit]");
		const c = await choCaNhan(ten);
		const mong = `+84${so.slice(1)}`;
		kiem(
			oMa,
			`${kho}: thu tu nhan [${(nhan ?? []).join(", ")}], type=${kieu}; CSDL phone=${c?.phone ?? "khong co"} (mong ${mong}), source=${c?.source}, cong ty dung=${c?.companyId === congTy.id}`,
			thuTuDung(nhan) &&
				kieu === "tel" &&
				c?.phone === mong &&
				c?.source === "MANUAL" &&
				c?.companyId === congTy.id,
		);
		return { ten, so: mong, id: c?.id };
	} finally {
		await ctx.close();
	}
}

async function doTaoSheet(cookie, slug) {
	const { ctx, p } = await trang(1440, cookie);
	try {
		await p.goto(`${APP}/${slug}/contacts?new=true`, {
			waitUntil: "networkidle0",
			timeout: CHO_MS,
		});
		await p
			.waitForSelector("form#create-contact input[type=tel]", {
				timeout: CHO_MS,
			})
			.catch(() => khongDo("thieu o Dien thoai"));
		const nhan = await nhanTrongForm(p, "form#create-contact");
		const ten = `${TEN} Ban`;
		await p.type(await oTheoNhan(p, "form#create-contact", "Tên"), ten);
		await p.type(
			await oTheoNhan(p, "form#create-contact", "Điện thoại"),
			"+84 28 3812 3456",
		);
		await p.screenshot({ path: join(RA, "tao-sheet-1440.png") });
		await bamNutChu(p, "button", cm.create.submit);
		const c = await choCaNhan(ten);
		const dauBon = (nhan ?? []).filter((n) => THU_TU_O.includes(n)).slice(0, 4);
		kiem(
			"tao-sheet-1440",
			`1440: thu tu nhan [${(nhan ?? []).join(", ")}]; CSDL phone=${c?.phone ?? "khong co"} (mong +842838123456), source=${c?.source}`,
			dauBon.join(",") === "Tên,Họ,Điện thoại,Email" &&
				c?.phone === "+842838123456" &&
				c?.source === "MANUAL",
		);
	} finally {
		await ctx.close();
	}
}

async function doSoSai(cookie, slug, congTy) {
	const { ctx, p, goiTao } = await trang(375, cookie);
	try {
		await moFormTabCongTy(p, slug, congTy);
		await p.type(await oTheoNhan(p, "form", "Tên"), `${TEN} Sai`);
		const oSo = await oTheoNhan(p, "form", "Điện thoại");
		await p.type(oSo, "abc");
		await p.click("form button[type=submit]");
		await new Promise((r) => setTimeout(r, 1000));
		const loi = await p.evaluate(
			() =>
				document
					.querySelector('[data-slot="field-error"]')
					?.innerText?.trim() ?? "",
		);
		const conTro = await p.evaluate(
			(sel) => document.activeElement === document.querySelector(sel),
			oSo,
		);
		await p.screenshot({ path: join(RA, "so-sai-375.png") });
		kiem(
			"so-sai-375",
			`375: ${goiTao.length} yeu cau contacts.create; loi «${loi}»; con tro o o Dien thoai ${conTro}`,
			goiTao.length === 0 && loi === rs.contact.phoneInvalid && conTro,
		);
	} finally {
		await ctx.close();
	}
}

async function choDong(p, ten) {
	return p
		.waitForFunction(
			(t) =>
				[...document.querySelectorAll('[data-slot="table"] tbody tr')].some(
					(tr) => (tr.innerText ?? "").includes(t),
				),
			{ timeout: CHO_MS },
			ten,
		)
		.then(() => true)
		.catch(() => false);
}

async function doBang(cookie, slug, nguoi) {
	const { ctx, p } = await trang(1440, cookie);
	try {
		await p.goto(`${APP}/${slug}/contacts`, {
			waitUntil: "networkidle0",
			timeout: CHO_MS,
		});
		const tieuDe = await p.evaluate(() =>
			[...document.querySelectorAll('[data-slot="table"] thead th')].map((th) =>
				(th.innerText ?? "").trim(),
			),
		);
		const iTen = tieuDe.indexOf("Tên");
		const sauTen = tieuDe.slice(iTen + 1).find((t) => t !== "") ?? "";
		const thay = await choDong(p, nguoi.ten);
		const chuDong = await p.evaluate(
			(t) =>
				[...document.querySelectorAll('[data-slot="table"] tbody tr')].find(
					(tr) => (tr.innerText ?? "").includes(t),
				)?.innerText ?? "",
			nguoi.ten,
		);
		const hien = hienThiSoDienThoai(nguoi.so);
		await p.screenshot({ path: join(RA, "bang-1440.png") });
		await p.goto(`${APP}/${slug}/contacts?record=contact:${nguoi.id}`, {
			waitUntil: "networkidle0",
			timeout: CHO_MS,
		});
		const lienKet = await p
			.waitForFunction(
				() => {
					const a = [...document.querySelectorAll('a[href^="tel:"]')].find(
						(x) => x.getClientRects().length > 0,
					);
					return a
						? `${a.getAttribute("href")}|${(a.innerText ?? "").trim()}`
						: false;
				},
				{ timeout: CHO_MS },
			)
			.then((h) => h.jsonValue())
			.catch(() => "khong co|");
		const [href, chuGoi] = String(lienKet).split("|");
		await p.screenshot({ path: join(RA, "bang-1440-ngan.png") });
		kiem(
			"bang-1440",
			`1440: cot sau «Tên» la «${sauTen}»; dong cua ${nguoi.ten} ${thay ? "co" : "khong co"}, chua «${hien}» ${chuDong.includes(hien)}; ngan chi tiet: lien ket ${href} chu «${chuGoi}»`,
			sauTen === "Điện thoại" &&
				thay &&
				chuDong.includes(hien) &&
				href === `tel:${nguoi.so}` &&
				chuGoi === hien,
		);
	} finally {
		await ctx.close();
	}
}

async function goTim(p, chu) {
	const sel = `input[placeholder="${cm.search}"]`;
	const o = await p.$(sel);
	if (!o) khongDo(`khong thay o tim «${cm.search}»`);
	await p.$eval(sel, (x) => {
		const dat = Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			"value",
		)?.set;
		dat?.call(x, "");
		x.dispatchEvent(new Event("input", { bubbles: true }));
	});
	await o.click();
	await o.type(chu);
	const giaTri = await p.$eval(sel, (x) => x.value);
	if (giaTri !== chu) khongDo(`o tim mang «${giaTri}» thay vi «${chu}»`);
}

async function choLocXong(p, ten) {
	return p
		.waitForFunction(
			(t) => {
				const dong = [
					...document.querySelectorAll('[data-slot="table"] tbody tr'),
				];
				return (
					dong.length > 0 &&
					dong.every((tr) => (tr.innerText ?? "").includes(t))
				);
			},
			{ timeout: CHO_LOC_MS },
			ten,
		)
		.then(() => true)
		.catch(() => false);
}

async function demDong(p) {
	return p.evaluate(
		() => document.querySelectorAll('[data-slot="table"] tbody tr').length,
	);
}

async function doTimBang(cookie, slug, nguoi) {
	const { ctx, p } = await trang(1440, cookie);
	try {
		await p.goto(`${APP}/${slug}/contacts`, {
			waitUntil: "networkidle0",
			timeout: CHO_MS,
		});
		const quocNoi = nguoi.so.slice(3);
		const cachGo = [
			`+84 ${quocNoi.slice(0, 3)} ${quocNoi.slice(3, 6)} ${quocNoi.slice(6)}`,
			`0${quocNoi}`,
		];
		const truoc = await demDong(p);
		const ketQua = [];
		for (const chu of cachGo) {
			await goTim(p, chu);
			const loc = await choLocXong(p, nguoi.ten);
			ketQua.push(
				`${chu} -> ${loc ? "chi con" : "KHONG chi con"} dong cua nguoi do (${await demDong(p)} dong)`,
			);
		}
		await p.screenshot({ path: join(RA, "tim-bang-1440.png") });
		kiem(
			"tim-bang-1440",
			`1440: truoc khi tim ${truoc} dong; ${ketQua.join("; ")}`,
			truoc > 1 && ketQua.every((k) => k.includes("-> chi con")),
		);
	} finally {
		await ctx.close();
	}
}

async function doCmdk(cookie, slug, nguoi, congTy) {
	const { ctx, p } = await trang(1440, cookie);
	try {
		await p.goto(`${APP}/${slug}/contacts`, {
			waitUntil: "networkidle0",
			timeout: CHO_MS,
		});
		await p.keyboard.down("Meta");
		await p.keyboard.press("k");
		await p.keyboard.up("Meta");
		await p
			.waitForSelector("[cmdk-input]", { timeout: CHO_MS })
			.catch(() => khongDo("⌘K khong mo"));
		await p.type("[cmdk-input]", hienThiSoDienThoai(nguoi.so));
		const dongPhu = await p
			.waitForFunction(
				(t) =>
					[...document.querySelectorAll("[cmdk-item]")].find((x) =>
						(x.innerText ?? "").includes(t),
					)?.innerText ?? false,
				{ timeout: CHO_MS },
				nguoi.ten,
			)
			.then((h) => h.jsonValue())
			.catch(() => "");
		await p.screenshot({ path: join(RA, "cmdk-1440.png") });
		kiem(
			"cmdk-1440",
			`1440: muc ca nhan «${String(dongPhu).replace(/\s+/g, " ")}» (mong co ten cong ty «${congTy.name}»)`,
			String(dongPhu).includes(nguoi.ten) &&
				String(dongPhu).includes(congTy.name),
		);
	} finally {
		await ctx.close();
	}
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	const congTy = await db.company.findFirst({
		where: { archivedAt: null },
		orderBy: { createdAt: "asc" },
		select: { id: true, name: true },
	});
	if (!congTy) khongDo("kho do khong co cong ty nao");
	const cookie = phien();
	const slug = await suySlug(cookie);
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	const nguoi = await doThemTab(1440, cookie, slug, congTy, "them-tab-1440");
	await doThemTab(375, cookie, slug, congTy, "them-tab-375");
	await doTaoSheet(cookie, slug);
	await doSoSai(cookie, slug, congTy);
	await doBang(cookie, slug, nguoi);
	await doTimBang(cookie, slug, nguoi);
	await doCmdk(cookie, slug, nguoi, congTy);
	const soO = MA_TRAN.filter((m) => m !== "dem" && daPhat.has(m)).length;
	kiem("dem", `${soO}/7 o`, soO === 7);
}

let ma = 0;
try {
	await chay();
	const thieu = MA_TRAN.filter((m) => !daPhat.has(m));
	if (thieu.length > 0) {
		dong.push(`SAI ma tran thieu dong: ${thieu.join(", ")}`);
		sai += 1;
	}
	ma = sai > 0 ? 1 : 0;
} catch (e) {
	dong.push(
		`KHONG DO DUOC: ${e instanceof KhongDo ? e.message : (e?.stack ?? e)}`,
	);
	ma = 2;
} finally {
	await trinhDuyet?.close().catch(() => {});
	await db.contact
		.deleteMany({ where: { firstName: { startsWith: TEN } } })
		.catch(() => {});
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
