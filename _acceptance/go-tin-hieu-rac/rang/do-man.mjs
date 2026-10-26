import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { tinHieuMessages } from "../../../apps/app/lib/messages/tin-hieu.ts";
import { db } from "../../../packages/db/src/index.ts";
import { TIN_HIEU as CAU_HINH } from "../../../packages/validation/src/tin-hieu.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import { don, gieo } from "./sinh-mau.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "go-tin-hieu-rac", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const QUAN_TRI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const MS_NGAY = 86_400_000;
const m = tinHieuMessages("vi");
const t = m.tatCa.luuTru;
const MA_TRAN = [
	"doi-chung-dong-hien",
	"ba-so-truoc",
	"luu-tru-menu",
	"luu-tru-roi-bang",
	"luu-tru-toast",
	"ba-so-sau-luu-tru",
	"hoan-tac-ve",
	"ba-so-sau-hoan-tac",
	"da-luu-tru-cot",
	"khoi-phuc-roi",
	"khoi-phuc-ve-dang-dung",
	"ba-so-sau-khoi-phuc",
	"da-lay-ve-khoa",
	"tai-lai-giu",
	"nguoi-gui-nhan",
	"nguoi-gui-doi-chung",
	"375-dang-dung",
	"375-da-luu-tru",
	"375-doi-chung",
];

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
let mau = null;

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

function phien(email) {
	const ra = execFileSync("bun", ["run", "dev:session", email], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) khongDo(`khong doc duoc cookie phien cua ${email}`);
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

async function toChucCua(email) {
	const qt = await db.user.findUnique({
		where: { email },
		select: { name: true, members: { select: { organizationId: true }, take: 1 } },
	});
	const to = qt?.members[0]?.organizationId;
	if (!to) khongDo(`${email} khong thuoc workspace nao`);
	return { toChuc: to, ten: qt.name };
}

async function trang(cookie, kho) {
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
	return { ctx, p };
}

async function yen(p) {
	await p
		.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
		.catch(() => {});
}

async function mo(p, url, sel) {
	await p.goto(url, { waitUntil: "domcontentloaded", timeout: CHO_MS });
	const thay = await p
		.waitForSelector(sel, { timeout: CHO_MS })
		.then(() => true)
		.catch(() => false);
	if (!thay) {
		await p.screenshot({ path: join(RA, "khong-thay.png") }).catch(() => {});
		khongDo(`${url}: khong thay ${sel} — trang dang o ${p.url()}`);
	}
	await yen(p);
}

async function anh(p, ten) {
	await p.evaluate(() => {
		for (const s of [
			"nextjs-portal",
			".tsqd-parent-container",
			".tsqd-open-btn-container",
		])
			for (const e of document.querySelectorAll(s)) e.remove();
	});
	await p.screenshot({ path: join(RA, `${ten}.png`) });
}

async function soHien(p, chon) {
	return p.evaluate(
		(c) =>
			[...document.querySelectorAll(c)].filter(
				(e) => e.getClientRects().length > 0,
			).length,
		chon,
	);
}

async function phanTuHien(p, chon) {
	const ds = await p.$$(chon);
	for (const e of ds)
		if (await e.evaluate((x) => x.getClientRects().length > 0)) return e;
	return null;
}

async function bamHien(p, chon) {
	const e = await phanTuHien(p, chon);
	if (!e) khongDo(`khong thay ${chon} dang hien`);
	await e.click();
	await new Promise((r) => setTimeout(r, 400));
}

async function moMenu(p, ma) {
	await bamHien(p, `[data-thao-tac-tat-ca="${ma}"]`);
	await p.waitForSelector("[role=menu]", { timeout: CHO_MS });
	await new Promise((r) => setTimeout(r, 300));
}

async function oThuNhat(p) {
	return p.evaluate(
		() =>
			document
				.querySelector("[data-o-so=trong-ky] .text-3xl")
				?.textContent?.trim() ?? "",
	);
}

async function soTuApi() {
	const r = await fetch(`${APP}/api/trpc/tinHieu.tatCa`, {
		headers: { cookie: `${mau.qt.ten}=${mau.qt.gia}; lang=vi` },
	});
	if (r.status !== 200) khongDo(`tinHieu.tatCa tra ${r.status}`);
	const rows = (await r.json()).result.data.rows;
	const now = Date.now();
	return {
		ids: rows.map((x) => x.id),
		trongKy: rows.filter(
			(x) => (now - Date.parse(x.guiLuc)) / MS_NGAY <= CAU_HINH.ngayDem,
		).length,
	};
}

async function cuaSoToast(p, chu) {
	return p
		.waitForFunction(
			(c) =>
				[...document.querySelectorAll("[data-sonner-toast]")].some((e) =>
					(e.textContent ?? "").includes(c),
				),
			{ timeout: 10_000 },
			chu,
		)
		.then(() => true)
		.catch(() => false);
}

async function batDaLuuTru(p) {
	await bamHien(p, "[data-nut-da-luu-tru]");
	await p.waitForFunction(() => location.search.includes("archived=true"), {
		timeout: CHO_MS,
	});
	await yen(p);
}

async function doLuuTru(slug) {
	const X = mau.ma.X;
	const Y = mau.ma.Y;
	const { ctx, p } = await trang(mau.qt, 1280);
	const dongX = `[data-tin-hieu-tat-ca="${X.ma}"]`;
	try {
		await mo(p, `${APP}/${slug}/tin-hieu/tat-ca`, "[data-ba-so-tin-hieu]");
		kiem(
			"doi-chung-dong-hien",
			`dong ${X.ma} hien ${await soHien(p, dongX)} lan truoc khi luu tru`,
			(await soHien(p, dongX)) === 1,
		);
		const s0 = await soTuApi();
		const o0 = await oThuNhat(p);
		kiem(
			"ba-so-truoc",
			`o «${o0}» — api ${s0.trongKy}`,
			o0 === String(s0.trongKy),
		);
		await moMenu(p, X.ma);
		const muc = await p.evaluate(
			(ma) =>
				document.querySelector(`[role=menu] [data-luu-tru-tin-hieu="${ma}"]`)
					?.textContent ?? "",
			X.ma,
		);
		kiem("luu-tru-menu", `menu co «${muc}»`, muc === t.luuTru);
		await bamHien(p, `[role=menu] [data-luu-tru-tin-hieu="${X.ma}"]`);
		const coToast = await cuaSoToast(p, t.daLuuTru.replace("{ma}", X.ma));
		await yen(p);
		await anh(p, "E5c-vua-luu-tru-1280");
		const hienSau = await soHien(p, dongX);
		kiem(
			"luu-tru-roi-bang",
			`dong ${X.ma} hien ${hienSau} lan; api dang dung ${(await soTuApi()).ids.includes(X.id) ? "con" : "khong con"} ${X.ma}`,
			hienSau === 0 && !(await soTuApi()).ids.includes(X.id),
		);
		const nutHoanTac = await p.evaluate(
			(chu) =>
				[...document.querySelectorAll("[data-sonner-toast] button")].some(
					(b) => (b.textContent ?? "").trim() === chu,
				),
			t.hoanTac,
		);
		kiem(
			"luu-tru-toast",
			`thong bao ${coToast ? "co" : "khong co"}, nut Hoan tac ${nutHoanTac ? "co" : "khong co"}`,
			coToast && nutHoanTac,
		);
		const s1 = await soTuApi();
		const o1 = await oThuNhat(p);
		kiem(
			"ba-so-sau-luu-tru",
			`o «${o1}» — api ${s1.trongKy}, truoc ${s0.trongKy}; ba o so con dem tin hieu vua luu tru neu SAI`,
			o1 === String(s1.trongKy) && s1.trongKy === s0.trongKy - 1,
		);
		await p.evaluate((chu) => {
			const b = [...document.querySelectorAll("[data-sonner-toast] button")].find(
				(x) => (x.textContent ?? "").trim() === chu,
			);
			b?.click();
		}, t.hoanTac);
		await new Promise((r) => setTimeout(r, 600));
		await yen(p);
		const s2 = await soTuApi();
		kiem(
			"hoan-tac-ve",
			`dong ${X.ma} hien ${await soHien(p, dongX)} lan; api ${s2.ids.includes(X.id) ? "co" : "khong co"}`,
			(await soHien(p, dongX)) === 1 && s2.ids.includes(X.id),
		);
		const o2 = await oThuNhat(p);
		kiem(
			"ba-so-sau-hoan-tac",
			`o «${o2}» — api ${s2.trongKy}`,
			o2 === String(s2.trongKy) && s2.trongKy === s0.trongKy,
		);
		await moMenu(p, X.ma);
		await bamHien(p, `[role=menu] [data-luu-tru-tin-hieu="${X.ma}"]`);
		await yen(p);
		await batDaLuuTru(p);
		await p.waitForSelector(dongX, { timeout: CHO_MS });
		const cot = await p.evaluate(
			(ma) => {
				const tr = [
					...document.querySelectorAll(`[data-tin-hieu-tat-ca="${ma}"]`),
				]
					.find((e) => e.getClientRects().length > 0)
					?.closest("tr");
				return {
					dau: [...document.querySelectorAll("thead th")].map(
						(x) => x.textContent ?? "",
					),
					luc: tr?.querySelector("[data-luu-tru-luc]")?.textContent ?? "",
					nguoi: tr?.querySelector("[data-nguoi-luu-tru]")?.textContent ?? "",
				};
			},
			X.ma,
		);
		await anh(p, "E5c-da-luu-tru-1280");
		kiem(
			"da-luu-tru-cot",
			`cot ${cot.dau.filter(Boolean).join(" | ")}; luc «${cot.luc}»; nguoi «${cot.nguoi}»`,
			cot.dau.includes(t.cotLuc) &&
				cot.dau.includes(t.cotNguoi) &&
				cot.luc.length > 0 &&
				cot.nguoi === mau.tenQt,
		);
		await moMenu(p, X.ma);
		await bamHien(p, `[role=menu] [data-khoi-phuc-tin-hieu="${X.ma}"]`);
		await yen(p);
		kiem(
			"khoi-phuc-roi",
			`dang luu tru con ${await soHien(p, dongX)} dong ${X.ma}`,
			(await soHien(p, dongX)) === 0,
		);
		await bamHien(p, "[data-nut-da-luu-tru]");
		await p.waitForFunction(() => !location.search.includes("archived=true"), {
			timeout: CHO_MS,
		});
		await yen(p);
		kiem(
			"khoi-phuc-ve-dang-dung",
			`dang dung co ${await soHien(p, dongX)} dong ${X.ma}`,
			(await soHien(p, dongX)) === 1,
		);
		const s3 = await soTuApi();
		const o3 = await oThuNhat(p);
		kiem(
			"ba-so-sau-khoi-phuc",
			`o «${o3}» — api ${s3.trongKy}`,
			o3 === String(s3.trongKy) && s3.trongKy === s0.trongKy,
		);
		await moMenu(p, Y.ma);
		const khoa = await p.evaluate(
			(ma) => {
				const e = document.querySelector(
					`[role=menu] [data-luu-tru-tin-hieu="${ma}"]`,
				);
				return {
					khoa:
						e?.getAttribute("aria-disabled") === "true" ||
						e?.hasAttribute("data-disabled"),
					lyDo:
						document.querySelector("[role=menu] [data-khong-luu-tru-duoc]")
							?.textContent ?? "",
				};
			},
			Y.ma,
		);
		await anh(p, "E6b-da-lay-ve-1280");
		kiem(
			"da-lay-ve-khoa",
			`muc Luu tru cua ${Y.ma} ${khoa.khoa ? "khoa" : "BAT DUOC"}; ly do «${khoa.lyDo}»`,
			khoa.khoa && khoa.lyDo === t.khongLuuTruDuoc,
		);
		await p.keyboard.press("Escape");
		await batDaLuuTru(p);
		await p.reload({ waitUntil: "domcontentloaded" });
		await p.waitForSelector("[data-nut-da-luu-tru]", { timeout: CHO_MS });
		await yen(p);
		const giu = await p.evaluate(() => ({
			bam:
				[...document.querySelectorAll("[data-nut-da-luu-tru]")]
					.find((e) => e.getClientRects().length > 0)
					?.getAttribute("aria-pressed") ?? "",
			dau: [...document.querySelectorAll("thead th")].map(
				(x) => x.textContent ?? "",
			),
		}));
		kiem(
			"tai-lai-giu",
			`sau tai lai: nut aria-pressed=${giu.bam}, co cot «${t.cotLuc}» ${giu.dau.includes(t.cotLuc)}`,
			giu.bam === "true" && giu.dau.includes(t.cotLuc),
		);
	} finally {
		await ctx.close();
	}
}

async function doNguoiGui(slug) {
	const G = mau.ma.G;
	const H = mau.ma.H;
	await mau.goi(mau.qt, "tinHieu.luuTru", { id: G.id });
	const { ctx, p } = await trang(mau.cookie.minh, 1280);
	try {
		await mo(p, `${APP}/${slug}/tin-hieu`, `[data-tin-hieu="${G.ma}"]`);
		const chu = await p.evaluate(
			(a, b) => {
				const doc = (ma) =>
					[...document.querySelectorAll(`[data-tin-hieu="${ma}"]`)].find(
						(e) => e.getClientRects().length > 0,
					)?.textContent ?? "";
				return { g: doc(a), h: doc(b) };
			},
			G.ma,
			H.ma,
		);
		await anh(p, "E8b-nguoi-gui-1280");
		kiem(
			"nguoi-gui-nhan",
			`dong ${G.ma}: «${chu.g.slice(0, 160)}»`,
			chu.g.includes(m.nhan.daLuuTru) && chu.g.includes(m.trangThai.daLuuTru),
		);
		kiem(
			"nguoi-gui-doi-chung",
			`dong ${H.ma} chua luu tru khong mang nhan Da luu tru`,
			chu.h.length > 0 && !chu.h.includes(m.nhan.daLuuTru),
		);
	} finally {
		await ctx.close();
	}
	await mau.goi(mau.qt, "tinHieu.khoiPhuc", { id: G.id });
}

async function do375(slug) {
	const { ctx, p } = await trang(mau.qt, 375);
	const tran = () =>
		p.evaluate(() => {
			const ra = [...document.querySelectorAll("[data-thao-tac-tat-ca]")]
				.filter((e) => e.getClientRects().length > 0)
				.map((e) => e.getBoundingClientRect().right);
			return {
				rong: document.documentElement.scrollWidth,
				khung: document.documentElement.clientWidth,
				phai: ra.length ? Math.max(...ra) : -1,
				so: ra.length,
			};
		});
	try {
		await mo(p, `${APP}/${slug}/tin-hieu/tat-ca`, "[data-ba-so-tin-hieu]");
		const a = await tran();
		await anh(p, "E9b-dang-dung-375");
		kiem(
			"375-dang-dung",
			`rong ${a.rong}/${a.khung}; ${a.so} nut thao tac, mep phai xa nhat ${a.phai}`,
			a.rong <= a.khung + 1 && a.so > 0 && a.phai <= a.khung,
		);
		await mau.goi(mau.qt, "tinHieu.luuTru", { id: mau.ma.X.id });
		await mo(
			p,
			`${APP}/${slug}/tin-hieu/tat-ca?archived=true`,
			"[data-ba-so-tin-hieu]",
		);
		await p.waitForSelector("[data-thao-tac-tat-ca]", { timeout: CHO_MS });
		const b = await tran();
		await anh(p, "E9b-da-luu-tru-375");
		kiem(
			"375-da-luu-tru",
			`rong ${b.rong}/${b.khung}; ${b.so} nut thao tac, mep phai xa nhat ${b.phai}`,
			b.rong <= b.khung + 1 && b.so > 0 && b.phai <= b.khung,
		);
		await p.evaluate(() => {
			const d = document.createElement("div");
			d.style.width = "600px";
			d.style.height = "1px";
			d.setAttribute("data-doi-chung-tran", "");
			document.body.appendChild(d);
		});
		const c = await tran();
		kiem(
			"375-doi-chung",
			`chen khoi 600px: rong ${c.rong}/${c.khung} — phep do bao tran`,
			c.rong > c.khung + 1,
		);
		await mau.goi(mau.qt, "tinHieu.khoiPhuc", { id: mau.ma.X.id });
	} finally {
		await ctx.close();
	}
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	const qt = phien(QUAN_TRI);
	const slug = await suySlug(qt);
	const { toChuc, ten } = await toChucCua(QUAN_TRI);
	mau = await gieo({
		db,
		toChuc,
		phien,
		app: APP,
		ma: Date.now().toString(36),
		quanTri: qt,
	});
	mau.qt = qt;
	mau.tenQt = ten;
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	await doLuuTru(slug);
	await doNguoiGui(slug);
	await do375(slug);
}

let ma = 0;
try {
	await chay();
	const thieu = MA_TRAN.filter((x) => !daPhat.has(x));
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
	if (mau) await don(db, mau.tao).catch(() => {});
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
