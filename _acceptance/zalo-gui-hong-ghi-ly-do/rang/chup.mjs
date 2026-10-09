import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { nhacQuaZaloMessages } from "../../../apps/app/lib/messages/nhac-qua-zalo.ts";
import { db } from "../../../packages/db/src/index.ts";
import { SETTINGS_ID } from "../../../packages/db/src/settings.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const RA = join(HERE, "..", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const EMAIL = process.env.QUAN_TRI ?? "ada@trycomp.ai";
const KHO = [
	[1440, 1000],
	[390, 844],
];
const CHO_MS = 30_000;
const TEN_MOI = "Bot Mới";
const SO_LIEN_KET = 3;
const TOKEN_MOI = "222:moi-chup";
const t = nhacQuaZaloMessages("vi");

const dong = [];
let sai = 0;
let trinhDuyet = null;
let tacTu = null;

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	if (tacTu) tacTu.stop(true);
	for (const d of dong) console.log(d);
	console.log(
		`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
	);
	process.exit(ma);
}

async function khongDo(cau) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	await ket(2);
}

function kiem(nhan, dat) {
	if (dat) dong.push(`DUNG ${nhan}`);
	else {
		sai += 1;
		dong.push(`SAI ${nhan}`);
	}
}

function phien(email) {
	const ra = execFileSync("bun", ["run", "dev:session", email], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) return null;
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) return null;
	const dau = new URL(dich, APP).pathname
		.replace(/^\/+|\/+$/g, "")
		.split("/")[0];
	return dau && !dau.startsWith("onboarding") && dau !== "sign-in" ? dau : null;
}

function moTacTuGia() {
	const goc = process.env.AGENT_URL;
	const cong = goc ? Number(new URL(goc).port) : 0;
	if (!cong) return null;
	return Bun.serve({
		port: cong,
		fetch: (req) =>
			new URL(req.url).pathname === "/internal/zalo/bot"
				? Response.json({
						outcome: "can-xac-nhan-doi-bot",
						soLienKet: SO_LIEN_KET,
						tenBotMoi: TEN_MOI,
					})
				: new Response(null, { status: 404 }),
	});
}

function guiWebhookLech() {
	const ma = `
import { nhanWebhook } from "./agent/lib/zalo-webhook";
import { thanWebhook, yeuCauWebhook } from "./test/support/zalo-tin";
const than = JSON.stringify(thanWebhook({ messageId: "chup-e20", fromId: "z-chup", text: "chao" }));
const r = await nhanWebhook(yeuCauWebhook(than, "khoa-sai-chup").request, { env: { token: "111:cu", khoa: "khoa-dung-chup" } });
console.log("status=" + r.status);
`;
	return execFileSync("bun", ["-e", ma], {
		cwd: join(GOC, "apps/agent"),
		encoding: "utf8",
	}).trim();
}

async function chup(ctx, duong, rong, cao, ten) {
	const p = await ctx.newPage();
	await p.setViewport({ width: rong, height: cao, deviceScaleFactor: 1 });
	await p.goto(`${APP}${duong}`, { waitUntil: "load" });
	return { p, tep: join(RA, `${ten}-${rong}.png`) };
}

const cay = await canhCay();
if (cay.ket !== "dung-cay")
	await khongDo(
		`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
	);
tacTu = moTacTuGia();
if (!tacTu) await khongDo("thieu AGENT_URL co cong de mo agent gia");

const nguoi = await db.user.findUnique({
	where: { email: EMAIL },
	select: { id: true },
});
if (!nguoi) await khongDo(`kho do khong co ${EMAIL}`);
await db.appSetting.upsert({
	where: { id: SETTINGS_ID },
	create: {
		id: SETTINGS_ID,
		zaloBotName: "Bot Cũ",
		zaloBotToken: "111:cu",
		zaloWebhookSecret: "khoa-dung-chup",
		zaloWebhookUrl: `${APP}/zalo/webhook`,
		zaloWebhookLyDo: null,
	},
	update: {
		zaloBotName: "Bot Cũ",
		zaloBotToken: "111:cu",
		zaloWebhookSecret: "khoa-dung-chup",
		zaloWebhookUrl: `${APP}/zalo/webhook`,
		zaloWebhookLyDo: null,
	},
});
await db.zaloLink.deleteMany({ where: { crmUserId: nguoi.id } });
await db.notificationPreference.upsert({
	where: { userId: nguoi.id },
	create: { userId: nguoi.id, channel: "ZALO" },
	update: { channel: "ZALO" },
});

const webhook = guiWebhookLech();
kiem(`E20: webhook khoa lech tra ${webhook}`, webhook === "status=403");
const lyDo = await db.appSetting.findUnique({
	where: { id: SETTINGS_ID },
	select: { zaloWebhookLyDo: true },
});
kiem(
	`E20: ly do sau 403 la ${lyDo?.zaloWebhookLyDo}`,
	lyDo?.zaloWebhookLyDo === "khoa-lech",
);

const cookie = phien(EMAIL);
if (!cookie) await khongDo(`khong doc duoc cookie phien cua ${EMAIL}`);
const slug = await suySlug(cookie);
if (!slug) await khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);

mkdirSync(RA, { recursive: true });
const host = new URL(APP).hostname;
trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
const tran = (p) =>
	p.evaluate(
		() =>
			document.documentElement.scrollWidth -
			document.documentElement.clientWidth,
	);
const chu = (p) => p.evaluate(() => document.body.innerText);

for (const [rong, cao] of KHO) {
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);

	const zalo = await chup(
		ctx,
		`/${slug}/settings/connections/zalo`,
		rong,
		cao,
		"E20-khoa-lech",
	);
	await zalo.p
		.waitForFunction(
			(c) => document.body.innerText.includes(c),
			{ timeout: CHO_MS },
			t.ketNoi.khoaLechTieuDe,
		)
		.catch(() => null);
	await zalo.p.evaluate((c) => {
		const el = [
			...document.querySelectorAll("[data-slot=alert-title], [role=alert]"),
		].find((e) => e.textContent?.includes(c));
		el?.scrollIntoView({ block: "center" });
	}, t.ketNoi.khoaLechTieuDe);
	await zalo.p.evaluate(() => document.fonts.ready);
	await zalo.p.screenshot({ path: zalo.tep });
	const chuZalo = await chu(zalo.p);
	kiem(
		`E20 ${rong}: co canh bao khoa lech`,
		chuZalo.includes(t.ketNoi.khoaLechTieuDe),
	);
	kiem(`E20 ${rong}: co nut Dang ky lai`, chuZalo.includes(t.ketNoi.dangKyLai));
	kiem(
		`E20 ${rong}: tran ngang ${await tran(zalo.p)}px`,
		(await tran(zalo.p)) <= 0,
	);
	dong.push(`ANH ${zalo.tep.slice(GOC.length + 1)}`);

	const o = await zalo.p.$("input");
	if (!o) await khongDo(`E13 ${rong}: khong thay o token`);
	await o.type(TOKEN_MOI);
	await zalo.p.evaluate(() =>
		document.querySelector("button[type=submit]")?.click(),
	);
	await zalo.p
		.waitForFunction(
			(c) => document.body.innerText.includes(c),
			{ timeout: CHO_MS },
			t.ketNoi.doiBotTieuDe,
		)
		.catch(() => null);
	await new Promise((r) => setTimeout(r, 400));
	const tepHop = join(RA, `E13-doi-bot-${rong}.png`);
	await zalo.p.screenshot({ path: tepHop });
	const chuHop = await chu(zalo.p);
	kiem(
		`E13 ${rong}: hop neu ten bot moi va so lien ket`,
		chuHop.includes(t.ketNoi.doiBotThan(TEN_MOI, SO_LIEN_KET)),
	);
	kiem(
		`E13 ${rong}: co nut ${t.ketNoi.doiBotNut} va ${t.ketNoi.doiBotThoi}`,
		chuHop.includes(t.ketNoi.doiBotNut) && chuHop.includes(t.ketNoi.doiBotThoi),
	);
	dong.push(`ANH ${tepHop.slice(GOC.length + 1)}`);

	const tb = await chup(
		ctx,
		`/${slug}/settings/notifications`,
		rong,
		cao,
		"E13-can-noi-lai",
	);
	await tb.p
		.waitForFunction(
			(c) => document.body.innerText.includes(c),
			{ timeout: CHO_MS },
			t.khoiZalo.canNoiLai,
		)
		.catch(() => null);
	await tb.p.evaluate((c) => {
		const el = [...document.querySelectorAll("p")].find((e) =>
			e.textContent?.includes(c),
		);
		el?.scrollIntoView({ block: "center" });
	}, t.khoiZalo.canNoiLai);
	await tb.p.screenshot({ path: tb.tep });
	kiem(
		`E13 ${rong}: thong bao cua ban bao can noi lai`,
		(await chu(tb.p)).includes(t.khoiZalo.canNoiLai),
	);
	kiem(
		`E13 ${rong}: tran ngang ${await tran(tb.p)}px`,
		(await tran(tb.p)) <= 0,
	);
	dong.push(`ANH ${tb.tep.slice(GOC.length + 1)}`);
	await ctx.close();
}

await ket(sai === 0 ? 0 : 1);
