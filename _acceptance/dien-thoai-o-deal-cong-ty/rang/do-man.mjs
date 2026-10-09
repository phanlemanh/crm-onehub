import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { recordSheetMessages } from "../../../apps/app/lib/messages/record-sheet.ts";
import { db } from "../../../packages/db/src/index.ts";
import { hienThiSoDienThoai } from "../../../packages/validation/src/so-dien-thoai.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "dien-thoai-o-deal-cong-ty", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const NGUOI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const DUNG_YEN_MS = 250;
const MA_TRAN = [
	"deal-bang-1440",
	"deal-bang-375",
	"cong-ty-bang-1440",
	"chon-nguoi-1440",
	"deal-bang-en-1440",
	"cong-ty-bang-en-1440",
	"dem",
];
const SO_O = MA_TRAN.length - 1;
const DANG_SO = /^0\d{3} \d{3} \d{3}$/;

const vi = recordSheetMessages("vi");
const en = recordSheetMessages("en");
const MA = Date.now().toString(36);
const TEN = `DT2 ${MA}`;
const MIEN = `dt2-${MA}.test`;

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
	return `+849${duoi}${dem}`;
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

async function gieo() {
	const chu = await db.user.findFirst({
		where: { email: NGUOI },
		select: { id: true },
	});
	if (!chu) khongDo(`kho do khong co nguoi dung ${NGUOI}`);
	const giaiDoan = await db.dealStage.findFirst({
		where: { kind: "OPEN" },
		orderBy: { position: "asc" },
		select: { id: true },
	});
	if (!giaiDoan) khongDo("kho do khong co giai doan mo nao");
	const congTy = await db.company.create({
		data: { name: `${TEN} Co`, domain: MIEN },
		select: { id: true, name: true },
	});
	const tao = (ten, phone, title) =>
		db.contact.create({
			data: { firstName: `${TEN} ${ten}`, phone, title, companyId: congTy.id },
			select: { id: true, firstName: true, phone: true },
		});
	const p = await tao("P", soRieng("0"), "Trưởng phòng");
	const q = await tao("Q", null, "Kế toán");
	const r = await tao("R", soRieng("1"), null);
	const deal = await db.deal.create({
		data: {
			name: `${TEN} Deal`,
			companyId: congTy.id,
			ownerId: chu.id,
			stage: giaiDoan.id,
		},
		select: { id: true },
	});
	await db.dealContact.createMany({
		data: [
			{ dealId: deal.id, contactId: p.id },
			{ dealId: deal.id, contactId: q.id },
		],
	});
	return { congTy, deal, p, q, r };
}

async function don() {
	const cu = await db.company.findMany({
		where: { domain: MIEN },
		select: { id: true },
	});
	const ids = cu.map((x) => x.id);
	await db.deal.deleteMany({ where: { companyId: { in: ids } } });
	await db.contact.deleteMany({ where: { firstName: { startsWith: TEN } } });
	await db.company.deleteMany({ where: { id: { in: ids } } });
}

async function trang(kho, cookie, lang) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: "lang", value: lang, domain: host, path: "/" },
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({
		width: kho,
		height: kho === 375 ? 812 : 900,
		deviceScaleFactor: 1,
	});
	return { ctx, p };
}

async function nganDungYen(p) {
	let truoc = "";
	for (let i = 0; i < 40; i += 1) {
		const nay = await p.evaluate(() => {
			const d = [...document.querySelectorAll('[role="dialog"]')].find(
				(x) => x.getClientRects().length > 0,
			);
			if (!d) return "";
			const r = d.getBoundingClientRect();
			return `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)}`;
		});
		if (nay && nay === truoc) return;
		truoc = nay;
		await new Promise((ok) => setTimeout(ok, DUNG_YEN_MS));
	}
	khongDo("ngan ban ghi khong dung yen");
}

async function moBang(p, url, cotNhan, tenP) {
	await p.goto(url, { waitUntil: "networkidle0", timeout: CHO_MS });
	await p
		.waitForFunction(
			(cot, ten) =>
				[
					...document.querySelectorAll('[role="dialog"] [data-slot="table"]'),
				].some(
					(t) =>
						[...t.querySelectorAll("thead th")].some(
							(th) => (th.innerText ?? "").trim() === cot,
						) && (t.innerText ?? "").includes(ten),
				),
			{ timeout: CHO_MS },
			cotNhan,
			tenP,
		)
		.catch(() =>
			khongDo(`khong thay bang co cot «${cotNhan}» va dong ${tenP}`),
		);
	await nganDungYen(p);
}

async function doOBang(p, cotNhan, tenCot, tenP, tenQ) {
	return p.evaluate(
		(cot, cotSo, ten, tenRong) => {
			const bang = [
				...document.querySelectorAll('[role="dialog"] [data-slot="table"]'),
			].find((t) =>
				[...t.querySelectorAll("thead th")].some(
					(th) => (th.innerText ?? "").trim() === cot,
				),
			);
			const tieuDe = [...bang.querySelectorAll("thead th")].map((th) =>
				(th.innerText ?? "").trim(),
			);
			const iTen = tieuDe.indexOf(cotSo.ten);
			const sauTen = tieuDe.slice(iTen + 1).find((t) => t !== "") ?? "";
			const iSo = tieuDe.indexOf(cotSo.so);
			const hang = (t) =>
				[...bang.querySelectorAll("tbody tr")].find((tr) =>
					(tr.innerText ?? "").includes(t),
				);
			const oP = hang(ten)?.querySelectorAll("td")[iSo] ?? null;
			const oQ = hang(tenRong)?.querySelectorAll("td")[iSo] ?? null;
			const chuSo = oP?.querySelector('[translate="no"]') ?? null;
			let hinh = null;
			if (chuSo && oP) {
				const rc = chuSo.getBoundingClientRect();
				const ro = oP.getBoundingClientRect();
				const cao = Number.parseFloat(getComputedStyle(chuSo).lineHeight);
				hinh = {
					scrollWidth: chuSo.scrollWidth,
					clientWidth: chuSo.clientWidth,
					caoChu: Math.round(rc.height),
					motDong: Math.round(cao),
					trongO:
						rc.left >= ro.left - 0.5 &&
						rc.right <= ro.right + 0.5 &&
						rc.top >= ro.top - 0.5 &&
						rc.bottom <= ro.bottom + 0.5,
				};
			}
			return {
				tieuDe: tieuDe.filter((t) => t !== ""),
				sauTen,
				soP: (oP?.innerText ?? "").trim(),
				soQ: (oQ?.innerText ?? "").trim(),
				hinh,
			};
		},
		cotNhan,
		tenCot,
		tenP,
		tenQ,
	);
}

async function chup(p, ten) {
	await nganDungYen(p);
	await p.screenshot({ path: join(RA, `${ten}.png`) });
}

async function doDeal(kho, ma, lang, cookie, slug, g) {
	const m = lang === "vi" ? vi : en;
	const c = m.deal.contactColumns;
	const { ctx, p } = await trang(kho, cookie, lang);
	try {
		await moBang(
			p,
			`${APP}/${slug}/deals?record=deal:${g.deal.id}`,
			c.role,
			g.p.firstName,
		);
		const o = await doOBang(
			p,
			c.role,
			{ ten: c.name, so: c.phone },
			g.p.firstName,
			g.q.firstName,
		);
		await chup(p, ma);
		const hien = hienThiSoDienThoai(g.p.phone);
		if (ma === "deal-bang-en-1440") {
			kiem(
				ma,
				`en: cot sau «${c.name}» la «${o.sauTen}»`,
				o.sauTen === "Phone",
			);
			return;
		}
		const thuTu = [c.name, c.phone, c.role, c.title, c.email];
		const dungThuTu = thuTu.every((t, i) => o.tieuDe[i] === t);
		const coBan = `tieu de [${o.tieuDe.join(", ")}]; so P «${o.soP}» (mong «${hien}»); o Q «${o.soQ}»`;
		const dungBan =
			dungThuTu && o.soP === hien && DANG_SO.test(o.soP) && o.soQ === "—";
		if (kho === 375) {
			const h = o.hinh;
			const khongCat = h && h.scrollWidth <= h.clientWidth;
			const motDong = h && h.caoChu <= h.motDong;
			kiem(
				ma,
				`375: ${coBan}; scrollWidth ${h?.scrollWidth} clientWidth ${h?.clientWidth}${khongCat ? "" : " — so bi cat o 375"}; cao ${h?.caoChu} mot dong ${h?.motDong}; trong o ${h?.trongO}`,
				dungBan && khongCat && motDong && h.trongO,
			);
			return;
		}
		kiem(
			ma,
			`1440: ${coBan}${o.tieuDe.includes(c.phone) ? "" : " — thieu cot Dien thoai"}`,
			dungBan,
		);
	} finally {
		await ctx.close();
	}
}

async function doCongTy(ma, lang, cookie, slug, g) {
	const m = lang === "vi" ? vi : en;
	const c = m.company.contactColumns;
	const { ctx, p } = await trang(1440, cookie, lang);
	try {
		await moBang(
			p,
			`${APP}/${slug}/companies?record=company:${g.congTy.id}&tab=contacts`,
			c.owner,
			g.p.firstName,
		);
		const o = await doOBang(
			p,
			c.owner,
			{ ten: c.name, so: c.phone },
			g.p.firstName,
			g.q.firstName,
		);
		await chup(p, ma);
		if (ma === "cong-ty-bang-en-1440") {
			kiem(
				ma,
				`en: cot sau «${c.name}» la «${o.sauTen}»`,
				o.sauTen === "Phone",
			);
			return;
		}
		const hien = hienThiSoDienThoai(g.p.phone);
		const conLai = [c.title, c.email, c.owner].every((t) =>
			o.tieuDe.includes(t),
		);
		kiem(
			ma,
			`1440: tieu de [${o.tieuDe.join(", ")}]; cot sau «${c.name}» la «${o.sauTen}»; so P «${o.soP}» (mong «${hien}»); con Chuc danh, Email, Phu trach ${conLai}`,
			o.sauTen === c.phone && o.soP === hien && DANG_SO.test(o.soP) && conLai,
		);
	} finally {
		await ctx.close();
	}
}

async function doChonNguoi(cookie, slug, g) {
	const c = vi.deal.contactColumns;
	const { ctx, p } = await trang(1440, cookie, "vi");
	try {
		await moBang(
			p,
			`${APP}/${slug}/deals?record=deal:${g.deal.id}`,
			c.role,
			g.p.firstName,
		);
		const nut = await p.evaluateHandle((chu) => {
			return (
				[
					...document.querySelectorAll(
						'[role="dialog"] button, [role="dialog"] tr',
					),
				].find(
					(x) =>
						x.getClientRects().length > 0 && (x.innerText ?? "").trim() === chu,
				) ?? null
			);
		}, vi.deal.addContact);
		if (!nut.asElement()) khongDo(`khong thay «${vi.deal.addContact}»`);
		await nut.asElement().click();
		const hop = await p
			.waitForSelector('[role="dialog"] [role="combobox"]', { timeout: CHO_MS })
			.catch(() => khongDo("khong thay o chon nguoi"));
		await hop.click();
		const chu = await p
			.waitForFunction(
				(t) =>
					[...document.querySelectorAll('[role="option"]')].find((x) =>
						(x.innerText ?? "").includes(t),
					)?.innerText ?? false,
				{ timeout: CHO_MS },
				g.r.firstName,
			)
			.then((h) => h.jsonValue())
			.catch(() => "");
		await p.screenshot({ path: join(RA, "chon-nguoi-1440.png") });
		const hien = hienThiSoDienThoai(g.r.phone);
		const gon = String(chu).replace(/\s+/g, " ").trim();
		kiem(
			"chon-nguoi-1440",
			`1440: lua chon cua R «${gon}» (mong chua «${hien}»)`,
			gon.includes(hien) && DANG_SO.test(hien),
		);
	} finally {
		await ctx.close();
	}
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	const g = await gieo();
	const cookie = phien();
	const slug = await suySlug(cookie);
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	await doDeal(1440, "deal-bang-1440", "vi", cookie, slug, g);
	await doDeal(375, "deal-bang-375", "vi", cookie, slug, g);
	await doCongTy("cong-ty-bang-1440", "vi", cookie, slug, g);
	await doChonNguoi(cookie, slug, g);
	await doDeal(1440, "deal-bang-en-1440", "en", cookie, slug, g);
	await doCongTy("cong-ty-bang-en-1440", "en", cookie, slug, g);
	const soO = MA_TRAN.filter((m) => m !== "dem" && daPhat.has(m)).length;
	kiem("dem", `${soO}/${SO_O} o`, soO === SO_O);
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
	await don().catch(() => {});
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
