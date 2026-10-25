import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { thongBaoMessages } from "../../../apps/app/lib/messages/thong-bao.ts";
import { db } from "../../../packages/db/src/index.ts";
import { SETTINGS_ID } from "../../../packages/db/src/settings.ts";
import {
	LOAI_THONG_BAO,
	MUC_THONG_BAO,
} from "../../../packages/validation/src/thong-bao.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "thong-bao-mot-nguon-nhieu-kenh", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const QUAN_TRI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const m = thongBaoMessages("vi");
const MA_TRAN = [
	"vao-1280",
	"bang-1280",
	"tat-1280",
	"bang-375",
	"khong-kenh-1280",
	"toi-1280",
	"toi-375",
];
const CHUONG = "[data-slot=chuong-thong-bao]";
const CAI_DAT = "[data-slot=cai-dat-thong-bao]";
const MUC = "#loai-thong-bao";
const LOAI_TAT = "okr-duoc-giao";

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
const tao = { user: null, member: null, botCu: undefined };

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

async function nguoiCoZalo() {
	const qt = await db.user.findUnique({
		where: { email: QUAN_TRI },
		select: { members: { select: { organizationId: true }, take: 1 } },
	});
	const to = qt?.members[0]?.organizationId;
	if (!to) khongDo(`${QUAN_TRI} khong thuoc workspace nao`);
	const ma = Date.now().toString(36);
	const email = `tbk-${ma}@thu.test`;
	const nguoi = await db.user.create({
		data: {
			id: `tbk-${ma}`,
			email,
			name: "Người đo Loại thông báo",
			emailVerified: true,
		},
		select: { id: true },
	});
	tao.user = nguoi.id;
	tao.member = `member-tbk-${ma}`;
	await db.member.create({
		data: {
			id: tao.member,
			organizationId: to,
			userId: nguoi.id,
			role: "member",
			createdAt: new Date(),
		},
	});
	const cu = await db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: { zaloBotName: true },
	});
	tao.botCu = cu?.zaloBotName ?? null;
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, zaloBotName: "Bot đo màn" },
		update: { zaloBotName: cu?.zaloBotName ?? "Bot đo màn" },
	});
	await db.zaloLink.create({
		data: {
			crmUserId: nguoi.id,
			zaloUserId: `Z-${ma}`,
			zaloDisplayName: "Zalo đo màn",
		},
	});
	return { id: nguoi.id, email };
}

async function trang(cookie, kho, toi = false) {
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
	if (toi) {
		await p.emulateMediaFeatures([
			{ name: "prefers-color-scheme", value: "dark" },
		]);
		await p.evaluateOnNewDocument(() => {
			try {
				localStorage.setItem("theme", "dark");
			} catch {}
		});
	}
	return { ctx, p };
}

async function mo(p, url, sel) {
	await p.goto(url, { waitUntil: "domcontentloaded", timeout: CHO_MS });
	const thay = await p
		.waitForSelector(sel, { timeout: CHO_MS })
		.then(() => true)
		.catch(() => false);
	if (!thay) {
		await p.screenshot({ path: join(RA, "khong-thay.png") }).catch(() => {});
		khongDo(`${url}: khong thay ${sel}`);
	}
	await p
		.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
		.catch(() => {});
	await p.evaluate(() => {
		for (const s of [
			"nextjs-portal",
			".tsqd-parent-container",
			".tsqd-open-btn-container",
		])
			for (const el of document.querySelectorAll(s)) el.remove();
	});
}

async function anhMuc(p, ten) {
	await p.evaluate((s) => {
		document.querySelector(s)?.scrollIntoView({ block: "start" });
	}, MUC);
	await p.screenshot({ path: join(RA, `${ten}.png`), fullPage: true });
}

const cuon = (p) =>
	p.evaluate(() => ({
		rong: document.documentElement.scrollWidth,
		khung: document.documentElement.clientWidth,
	}));

async function caiDatApi(p) {
	return p.evaluate(async () => {
		const r = await fetch("/api/trpc/thongBao.caiDat", {
			credentials: "include",
		});
		const j = await r.json();
		return j?.result?.data?.json ?? j?.result?.data ?? null;
	});
}

async function goZalo(p) {
	return p.evaluate(async () => {
		const r = await fetch("/api/trpc/zalo.go", {
			method: "POST",
			credentials: "include",
			headers: { "content-type": "application/json" },
			body: "{}",
		});
		return r.status;
	});
}

const nhom = (p) =>
	p.evaluate((s) => {
		const muc = document.querySelector(s);
		return [...(muc?.querySelectorAll("[data-muc]") ?? [])].map((the) => ({
			muc: the.getAttribute("data-muc"),
			soDong: the.querySelectorAll("[data-bang-loai] [data-dong-loai]").length,
			cot: [...the.querySelectorAll("[data-bang-loai] th")].map(
				(th) => th.textContent?.trim() ?? "",
			),
		}));
	}, MUC);

async function do1280(c, slug) {
	const { ctx, p } = await trang(c, 1280);
	try {
		await mo(p, `${APP}/${slug}/okr`, CHUONG);
		await p.click(CHUONG);
		await p.waitForSelector(CAI_DAT, { timeout: CHO_MS });
		await p.click(CAI_DAT);
		const toi = await p
			.waitForFunction(
				() =>
					location.pathname.endsWith("/reminders") &&
					location.hash === "#loai-thong-bao",
				{ timeout: CHO_MS },
			)
			.then(() => true)
			.catch(() => false);
		await p
			.waitForSelector(`${MUC} [data-bang-loai]`, { timeout: CHO_MS })
			.catch(() => {});
		const thay = await p.evaluate((s) => {
			const r = document.querySelector(s)?.getBoundingClientRect();
			return r ? r.top < window.innerHeight && r.bottom > 0 : false;
		}, MUC);
		kiem(
			"vao-1280",
			`chuong → «${m.caiDat.moChuong}» → /reminders#loai-thong-bao, muc trong khung nhin`,
			toi && thay,
		);
		await anhMuc(p, "vao-1280");

		const api = await caiDatApi(p);
		if (!api) khongDo("khong doc duoc thongBao.caiDat cua phien");
		const theMuc = await nhom(p);
		const kyVong = (muc) => api.loai.filter((l) => l.muc === muc).length;
		kiem(
			"bang-1280",
			`hai the ${JSON.stringify(theMuc.map((t) => [t.muc, t.soDong, t.cot[2]]))}; API ${api.loai.length} loai, kenh ${api.kenh}`,
			theMuc.length === 2 &&
				theMuc.every(
					(t) => t.soDong === kyVong(t.muc) && t.cot[2] === "Zalo",
				) &&
				api.loai.length === LOAI_THONG_BAO.length,
		);
		await anhMuc(p, "bang-1280");

		const sel = `${MUC} [data-bang-loai] [data-cong-tac=kenh][data-loai=${LOAI_TAT}]`;
		await p.click(sel);
		const toast = await p
			.waitForFunction(
				(chu) => document.body.textContent?.includes(chu) ?? false,
				{ timeout: CHO_MS },
				m.caiDat.daLuu,
			)
			.then(() => true)
			.catch(() => false);
		await anhMuc(p, "tat-1280");
		await mo(p, `${APP}/${slug}/reminders`, `${MUC} [data-bang-loai]`);
		const sauTai = await p.evaluate(
			(s) => document.querySelector(s)?.getAttribute("aria-checked"),
			sel,
		);
		const api2 = await caiDatApi(p);
		const dong = api2?.loai.find((l) => l.loai === LOAI_TAT);
		kiem(
			"tat-1280",
			`tat ${LOAI_TAT} qua Zalo: toast ${toast}, sau tai lai aria-checked=${sauTai}, API dayRa=${dong?.dayRa} (mac dinh ${MUC_THONG_BAO[LOAI_TAT].macDinhDayRa})`,
			toast && sauTai === "false" && dong?.dayRa === false,
		);

		const go = await goZalo(p);
		if (go !== 200) khongDo(`go Zalo tra ${go}`);
		await mo(p, `${APP}/${slug}/reminders`, `${MUC} [data-bang-loai]`);
		const khoa = await p.evaluate((s) => {
			const nut = [
				...document.querySelectorAll(
					`${s} [data-bang-loai] [data-cong-tac=kenh]`,
				),
			];
			return {
				so: nut.length,
				khoa: nut.every((n) => n.disabled),
				lyDo:
					document.querySelector(`${s} [data-ly-do-khoa]`)?.textContent ?? "",
			};
		}, MUC);
		kiem(
			"khong-kenh-1280",
			`go Zalo: ${khoa.so} cong tac kenh, khoa het ${khoa.khoa}, ly do «${khoa.lyDo}»`,
			khoa.so === LOAI_THONG_BAO.length &&
				khoa.khoa &&
				khoa.lyDo === m.caiDat.lyDoChuaNoi,
		);
		await anhMuc(p, "khong-kenh-1280");
	} finally {
		await ctx.close();
	}
}

async function do375(c, slug) {
	const { ctx, p } = await trang(c, 375);
	try {
		await mo(p, `${APP}/${slug}/reminders`, `${MUC} [data-the-loai]`);
		const k = await cuon(p);
		const soThe = await p.evaluate(
			(s) =>
				[
					...document.querySelectorAll(`${s} [data-the-loai] [data-dong-loai]`),
				].filter((e) => e.getBoundingClientRect().height > 0).length,
			MUC,
		);
		kiem(
			"bang-375",
			`375: ${soThe} dong hien, rong trang ${k.rong} / ${k.khung}`,
			soThe === LOAI_THONG_BAO.length && k.rong <= k.khung,
		);
		await anhMuc(p, "bang-375");
	} finally {
		await ctx.close();
	}
}

async function doToi(c, slug) {
	for (const kho of [1280, 375]) {
		const { ctx, p } = await trang(c, kho, true);
		try {
			const sel = kho === 1280 ? "[data-bang-loai]" : "[data-the-loai]";
			await mo(p, `${APP}/${slug}/reminders`, `${MUC} ${sel}`);
			const nen = await p.evaluate(() => {
				const goc = document.documentElement;
				return {
					toi: goc.classList.contains("dark"),
					mau: getComputedStyle(document.body).backgroundColor,
				};
			});
			const k = await cuon(p);
			kiem(
				`toi-${kho}`,
				`nen toi ${nen.toi} (${nen.mau}), rong ${k.rong} / ${k.khung}`,
				nen.toi && k.rong <= k.khung,
			);
			await anhMuc(p, `toi-${kho}`);
		} finally {
			await ctx.close();
		}
	}
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	const qt = phien(QUAN_TRI);
	const slug = await suySlug(qt);
	const nguoi = await nguoiCoZalo();
	const c = phien(nguoi.email);
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	await do375(c, slug);
	await doToi(c, slug);
	await do1280(c, slug);
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
	if (tao.user) {
		await db.caiDatThongBao.deleteMany({ where: { userId: tao.user } });
		await db.zaloLink.deleteMany({ where: { crmUserId: tao.user } });
	}
	if (tao.botCu !== undefined) {
		await db.appSetting.updateMany({
			where: { id: SETTINGS_ID },
			data: { zaloBotName: tao.botCu },
		});
	}
	if (tao.member) await db.member.deleteMany({ where: { id: tao.member } });
	if (tao.user) {
		await db.session.deleteMany({ where: { userId: tao.user } });
		await db.user.deleteMany({ where: { id: tao.user } });
	}
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
