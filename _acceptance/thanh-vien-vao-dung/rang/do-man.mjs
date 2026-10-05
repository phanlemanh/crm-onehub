import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { APP_SETTING_ID } from "../../../apps/api/src/workspace/staff-domains.ts";
import { WORKSPACE_CONFIG } from "../../../apps/api/src/workspace/workspace-config.ts";
import {
	COT_DA_LUU_AC1,
	TEN_MIEN_GO_AC1,
} from "../../../apps/api/test/thanh-vien-vao-dung.fixture.ts";
import { thanhVienMessages } from "../../../apps/app/lib/messages/settings-thanh-vien.ts";
import { db } from "../../../packages/db/src/index.ts";
import { WORKSPACE_ID } from "../../../packages/db/src/workspace.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "thanh-vien-vao-dung", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const QUAN_TRI = process.env.QUAN_TRI ?? "ada@trycomp.ai";
const THANH_VIEN = process.env.KHONG_QUYEN ?? "marcus@trycomp.ai";
const KHO = { 1440: { rong: 1440, cao: 900 }, 375: { rong: 375, cao: 812 } };
const CHO_MS = 60_000;
const LOI_CONG_CONG = "gmail.com";
const t = thanhVienMessages("vi");

const MA_TRAN = [
	"1440-quan-tri-anh",
	"375-quan-tri-anh",
	"375-quan-tri-tran",
	"1440-loi-anh",
	"1440-loi-duoi-o",
	"1440-thanh-vien-anh",
	"375-thanh-vien-anh",
	"375-thanh-vien-tran",
	"1440-thanh-vien-khoa",
	"1440-luu-db",
	"1440-luu-o",
	"1440-luu-tat",
	"1440-hop-da-la-thanh-vien-anh",
	"1440-hop-giu-mo",
	"1440-hop-thong-diep",
	"don-cot",
	"don-loi-cho-phep",
];

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;

function kiem(ma, nhan, dat) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ${ma} khong co trong MA_TRAN`);
	daPhat.add(ma);
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhan}`);
	if (!dat) sai += 1;
}

class KhongDo extends Error {}
function khongDo(cau) {
	throw new KhongDo(cau);
}

function phien(dc) {
	const ra = execFileSync("bun", ["run", "dev:session", dc], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) khongDo(`khong doc duoc cookie phien cua ${dc}`);
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) khongDo(`${APP}/ tra ${res.status} khong co Location`);
	const dau = new URL(dich, APP).pathname
		.replace(/^\/+|\/+$/g, "")
		.split("/")[0];
	if (!dau || dau.startsWith("onboarding") || dau === "sign-in")
		khongDo(`${APP}/ chuyen toi ${dich}`);
	return dau;
}

async function docCot() {
	const hang = await db.appSetting.findUnique({
		where: { id: APP_SETTING_ID },
		select: { staffEmailDomains: true },
	});
	return hang?.staffEmailDomains ?? null;
}

async function datCot(gia) {
	await db.appSetting.upsert({
		where: { id: APP_SETTING_ID },
		create: { id: APP_SETTING_ID, staffEmailDomains: gia },
		update: { staffEmailDomains: gia },
	});
}

async function ngu_canh(cookie) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	return ctx;
}

async function moThe(ctx, kho, slug) {
	const p = await ctx.newPage();
	await p.setViewport({
		width: KHO[kho].rong,
		height: KHO[kho].cao,
		deviceScaleFactor: 1,
	});
	await p.goto(`${APP}/${slug}/settings/members`, {
		waitUntil: "load",
		timeout: CHO_MS,
	});
	await p
		.waitForFunction(
			(tieuDe) => {
				const the = [...document.querySelectorAll("[data-slot=card]")].find(
					(c) =>
						c.querySelector("[data-slot=card-title]")?.textContent?.trim() ===
						tieuDe,
				);
				return (
					document.querySelector("[hidden] [data-slot=card]") === null &&
					the?.querySelector("form input") != null
				);
			},
			{ timeout: CHO_MS },
			t.tenMienNoiBo.tieuDe,
		)
		.catch(() =>
			khongDo(`${kho}: het ${CHO_MS}ms cho the «${t.tenMienNoiBo.tieuDe}»`),
		);
	await p.evaluate(() => document.fonts.ready);
	return p;
}

function trongThe(tieuDe) {
	const the = [...document.querySelectorAll("[data-slot=card]")].find(
		(c) =>
			c.querySelector("[data-slot=card-title]")?.textContent?.trim() === tieuDe,
	);
	const o = the?.querySelector("form input") ?? null;
	const luu =
		[...(the?.querySelectorAll("button") ?? [])].find(
			(b) => b.getAttribute("form") === "ten-mien-noi-bo",
		) ?? null;
	return { the, o, luu };
}

async function doThe(p) {
	return p.evaluate(
		(tieuDe, src) => {
			const { the, o, luu } = new Function(`return (${src})`)()(tieuDe);
			const cuon = document.querySelector("[data-slot=page-shell-scroll]");
			return {
				gia: o?.value ?? null,
				oKhoa: o?.disabled ?? null,
				luuKhoa: luu?.disabled ?? null,
				chu: the?.innerText ?? "",
				loi: the?.querySelector("[data-slot=field-error]")?.innerText ?? null,
				tran: Math.max(
					document.documentElement.scrollWidth -
						document.documentElement.clientWidth,
					cuon ? cuon.scrollWidth - cuon.clientWidth : 0,
				),
			};
		},
		t.tenMienNoiBo.tieuDe,
		trongThe.toString(),
	);
}

async function chupThe(p, ten) {
	await p.evaluate(
		(tieuDe, src) =>
			new Function(`return (${src})`)()(tieuDe).the?.scrollIntoView({
				block: "center",
			}),
		t.tenMienNoiBo.tieuDe,
		trongThe.toString(),
	);
	await p.screenshot({ path: join(RA, ten) });
}

async function go(p, chu) {
	const o = await p.evaluateHandle(
		(tieuDe, src) => new Function(`return (${src})`)()(tieuDe).o,
		t.tenMienNoiBo.tieuDe,
		trongThe.toString(),
	);
	await o.focus();
	await o.evaluate((el) => el.select());
	await p.keyboard.press("Backspace");
	const conLai = await o.evaluate((el) => el.value);
	if (conLai !== "") khongDo(`khong xoa duoc o truoc khi go — con «${conLai}»`);
	await o.type(chu);
}

async function bamLuu(p) {
	await p.evaluate(
		(tieuDe, src) => new Function(`return (${src})`)()(tieuDe).luu?.click(),
		t.tenMienNoiBo.tieuDe,
		trongThe.toString(),
	);
}

async function doQuanTri(cookie, slug) {
	const ctx = await ngu_canh(cookie);
	const p = await moThe(ctx, "1440", slug);

	await go(p, TEN_MIEN_GO_AC1);
	await bamLuu(p);
	await p
		.waitForFunction(
			(tieuDe, src, mong) =>
				new Function(`return (${src})`)()(tieuDe).o?.value === mong,
			{ timeout: CHO_MS },
			t.tenMienNoiBo.tieuDe,
			trongThe.toString(),
			"onehub.center, onehub.vn",
		)
		.catch(() => {});
	const sau = await doThe(p);
	const cot = await docCot();
	kiem(
		"1440-luu-db",
		`1440: luu -> DB staffEmailDomains = ${cot}`,
		cot === COT_DA_LUU_AC1,
	);
	kiem(
		"1440-luu-o",
		`1440: o hien ${sau.gia}`,
		sau.gia === "onehub.center, onehub.vn",
	);
	kiem(
		"1440-luu-tat",
		`1440: «${t.tenMienNoiBo.luu}» tat lai (${sau.luuKhoa})`,
		sau.luuKhoa === true,
	);
	await chupThe(p, "the-quan-tri-1440.png");
	kiem("1440-quan-tri-anh", "1440: anh the-quan-tri-1440.png", true);

	const goLoi = `onehub.center, ${LOI_CONG_CONG}`;
	await go(p, goLoi);
	await bamLuu(p);
	await p
		.waitForFunction(
			(tieuDe, src) =>
				new Function(`return (${src})`)()(tieuDe).the?.querySelector(
					"[data-slot=field-error]",
				) != null,
			{ timeout: CHO_MS },
			t.tenMienNoiBo.tieuDe,
			trongThe.toString(),
		)
		.catch(() => {});
	const loi = await doThe(p);
	kiem(
		"1440-loi-duoi-o",
		`1440 loi: duoi o «${loi.loi}», o giu «${loi.gia}», cot van ${await docCot()}`,
		loi.loi?.includes(LOI_CONG_CONG) === true &&
			loi.gia === goLoi &&
			(await docCot()) === COT_DA_LUU_AC1,
	);
	await chupThe(p, "the-loi-1440.png");
	kiem("1440-loi-anh", "1440: anh the-loi-1440.png", true);

	const p375 = await moThe(ctx, "375", slug);
	const d375 = await doThe(p375);
	kiem(
		"375-quan-tri-tran",
		`375 quan tri: tran ngang ${d375.tran}px (document va main)`,
		d375.tran <= 0,
	);
	await chupThe(p375, "the-quan-tri-375.png");
	kiem("375-quan-tri-anh", "375: anh the-quan-tri-375.png", true);

	const nut = await p.$$eval(
		"button",
		(bs, chu) => bs.filter((b) => b.textContent?.trim() === chu).length,
		t.duocPhepVao.nutThem,
	);
	if (nut === 0) khongDo(`1440: khong thay nut «${t.duocPhepVao.nutThem}»`);
	const truoc = await db.invitation.count({
		where: { organizationId: WORKSPACE_ID, email: THANH_VIEN },
	});
	await p.evaluate(
		(chu) =>
			[...document.querySelectorAll("button")]
				.find((b) => b.textContent?.trim() === chu)
				?.click(),
		t.duocPhepVao.nutThem,
	);
	await p.waitForSelector("[role=dialog] input[type=email]", {
		timeout: CHO_MS,
	});
	await p.type("[role=dialog] input[type=email]", THANH_VIEN.toUpperCase());
	await p.evaluate(
		(chu) =>
			[...document.querySelectorAll("[role=dialog] button")]
				.find((b) => b.textContent?.trim() === chu)
				?.click(),
		t.hopThoaiChoPhep.gui,
	);
	await p
		.waitForFunction(
			(loi) =>
				document.querySelector("[role=dialog]")?.textContent?.includes(loi),
			{ timeout: CHO_MS },
			WORKSPACE_CONFIG.messages.alreadyAMember,
		)
		.catch(() => {});
	const hop = await p.evaluate(
		() => document.querySelector("[role=dialog]")?.textContent ?? null,
	);
	const sauHop = await db.invitation.count({
		where: { organizationId: WORKSPACE_ID, email: THANH_VIEN },
	});
	kiem("1440-hop-giu-mo", `1440: hop giu mo (${hop !== null})`, hop !== null);
	kiem(
		"1440-hop-thong-diep",
		`1440: hop chua «${WORKSPACE_CONFIG.messages.alreadyAMember}» (${hop?.includes(WORKSPACE_CONFIG.messages.alreadyAMember) === true}), loi cho phep ${truoc} -> ${sauHop}`,
		hop?.includes(WORKSPACE_CONFIG.messages.alreadyAMember) === true &&
			truoc === sauHop,
	);
	await p.screenshot({ path: join(RA, "hop-da-la-thanh-vien-1440.png") });
	kiem(
		"1440-hop-da-la-thanh-vien-anh",
		"1440: anh hop-da-la-thanh-vien-1440.png",
		true,
	);
	await ctx.close();
	return truoc;
}

async function doThanhVien(slug) {
	const ctx = await ngu_canh(phien(THANH_VIEN));
	const p = await moThe(ctx, "1440", slug);
	const d = await doThe(p);
	kiem(
		"1440-thanh-vien-khoa",
		`1440 thanh vien: o khoa ${d.oKhoa}, «${t.tenMienNoiBo.luu}» khoa ${d.luuKhoa}, dong ly do ${d.chu.includes(t.tenMienNoiBo.khoa)}`,
		d.oKhoa === true &&
			d.luuKhoa === true &&
			d.chu.includes(t.tenMienNoiBo.khoa),
	);
	await chupThe(p, "the-thanh-vien-1440.png");
	kiem("1440-thanh-vien-anh", "1440: anh the-thanh-vien-1440.png", true);
	const p375 = await moThe(ctx, "375", slug);
	const d375 = await doThe(p375);
	kiem(
		"375-thanh-vien-tran",
		`375 thanh vien: tran ngang ${d375.tran}px (document va main)`,
		d375.tran <= 0,
	);
	await chupThe(p375, "the-thanh-vien-375.png");
	kiem("375-thanh-vien-anh", "375: anh the-thanh-vien-375.png", true);
	await ctx.close();
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay")
		khongDo(
			`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
		);
	const thanhVien = await db.member.findFirst({
		where: { organizationId: WORKSPACE_ID, user: { email: THANH_VIEN } },
		select: { role: true },
	});
	if (thanhVien?.role !== "member")
		khongDo(
			`${THANH_VIEN} phai la thanh vien vai member (dang: ${thanhVien?.role ?? "khong co"})`,
		);
	mkdirSync(RA, { recursive: true });
	const cotGoc = await docCot();
	const cookie = phien(QUAN_TRI);
	const slug = await suySlug(cookie);
	let loiChoPhepTruoc = null;
	try {
		await datCot(null);
		trinhDuyet = await puppeteer.launch({
			executablePath: CHROME,
			headless: true,
		});
		loiChoPhepTruoc = await doQuanTri(cookie, slug);
		await doThanhVien(slug);
	} finally {
		await datCot(cotGoc);
		const cotSau = await docCot();
		kiem(
			"don-cot",
			`don: cot staffEmailDomains tra ve ${JSON.stringify(cotSau)} (truoc ${JSON.stringify(cotGoc)})`,
			cotSau === cotGoc,
		);
		const conLai = await db.invitation.count({
			where: { organizationId: WORKSPACE_ID, email: THANH_VIEN },
		});
		kiem(
			"don-loi-cho-phep",
			`don: loi cho phep cua ${THANH_VIEN} ${loiChoPhepTruoc} -> ${conLai}`,
			loiChoPhepTruoc === null || conLai === loiChoPhepTruoc,
		);
	}
}

let ma;
try {
	await chay();
	for (const m of MA_TRAN)
		if (!daPhat.has(m))
			kiem(m, `thieu ${m} — ma trong MA_TRAN khong phat dong nao`, false);
	ma = sai === 0 ? 0 : 1;
} catch (loi) {
	dong.push(
		`KHONG DO DUOC: ${loi instanceof KhongDo ? loi.message : (loi?.stack ?? String(loi))}`,
	);
	ma = 2;
} finally {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	await db.$disconnect().catch(() => {});
}
for (const d of dong) console.log(d);
console.log(`ANH ${relative(GOC, RA)}/`);
console.log(
	`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
