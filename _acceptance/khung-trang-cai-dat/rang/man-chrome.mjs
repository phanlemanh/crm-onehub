import { execFileSync, spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { khungUngDungMessages } from "../../../apps/app/lib/messages/khung-ung-dung.ts";
import { nhacQuaZaloMessages } from "../../../apps/app/lib/messages/nhac-qua-zalo.ts";
import { settingsMessages } from "../../../apps/app/lib/messages/settings.ts";
import { ketNoiMessages } from "../../../apps/app/lib/messages/settings-ket-noi.ts";
import { db } from "../../../packages/db/src/index.ts";
import { WORKSPACE_ID } from "../../../packages/db/src/workspace.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = join(DAY, "..", "..", "..");
const BANG_CHUNG = join(DAY, "..", "evidence");
const APP = process.env.APP_URL ?? "http://localhost:3720";
const API = process.env.API_URL ?? "http://localhost:3721";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const CHO_TAI = 180000;
const CHO_HYDRATE_MS = 1200;
const LECH = 1;
const KHOANG_BREADCRUMB = 12;
const LOI_HYDRATE = /hydrat/i;
const KY_MONG = 184;
const MA = `ktcd${Date.now().toString(36).slice(-6)}`;

const MUC = [
	"/settings",
	"/settings/currencies",
	"/settings/fields",
	"/settings/members",
	"/settings/organization",
	"/settings/onboarding",
	"/settings/connections",
	"/settings/tracking",
	"/settings/sso",
	"/settings/api-keys",
];
const CON = [
	"/settings/connections/google",
	"/settings/connections/microsoft",
	"/settings/connections/slack",
	"/settings/connections/slack/people",
	"/settings/connections/zalo",
	"/settings/connections/intake",
];
function nhanCua(tieng) {
	const k = ketNoiMessages(tieng);
	return {
		google: k.ten.google,
		microsoft: k.ten.microsoft,
		slack: k.ten.slack,
		zalo: k.ten.zalo,
		intake: k.tiepNhan.tieuDe,
		nguoi: k.nguoi.nhan,
		them: k.danhSach.them,
		go: k.slack.go,
		chuaCam: k.chung.chuaCam,
		ketNoi: k.danhSach.tieuDe,
		nhac: khungUngDungMessages(tieng).header.nhacBuoiSang,
		tieuDeNhac: nhacQuaZaloMessages(tieng).tieuDe,
		noiCuaToi: nhacQuaZaloMessages(tieng).ketNoi.noiCuaToi,
		caiDat: settingsMessages(tieng).thanhBen.nhan,
		menuTaiKhoan: khungUngDungMessages(tieng).header.accountMenu,
	};
}
const NHAN = { vi: nhanCua("vi"), en: nhanCua("en") };

mkdirSync(BANG_CHUNG, { recursive: true });

let dung = 0;
let sai = 0;
const noiDungTran = [];
const conTien = [];
let trinhDuyet = null;

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	await donDep().catch((e) => console.log(`don dep hong: ${e}`));
	for (const c of conTien) {
		try {
			process.kill(-c.pid, "SIGTERM");
		} catch {}
	}
	await db.$disconnect();
	process.exit(ma);
}

async function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	await ket(2);
}

function khang(dat, cau) {
	if (dat) dung += 1;
	else {
		sai += 1;
		console.log(`DO: ${cau}`);
	}
}

async function song(url) {
	try {
		const r = await fetch(url, {
			redirect: "manual",
			signal: AbortSignal.timeout(3000),
		});
		return r.status > 0;
	} catch {
		return false;
	}
}

async function dungMayChu() {
	const cong = (u) => new URL(u).port;
	const env = {
		...process.env,
		APP_URL: APP,
		API_URL: API,
		NEXT_PUBLIC_API_URL: API,
	};
	const moi = [
		[API, "apps/api", { ...env, PORT: cong(API) }],
		[APP, "apps/app", { ...env, PORT: cong(APP) }],
	];
	for (const [url, thuMuc, e] of moi) {
		if (await song(url)) continue;
		const c = spawn("bun", ["run", "dev"], {
			cwd: join(GOC, thuMuc),
			env: e,
			detached: true,
			stdio: "ignore",
		});
		conTien.push(c);
		console.log(`dung may chu ${thuMuc} tai ${url} (pid ${c.pid})`);
	}
	const han = Date.now() + CHO_TAI;
	for (const [url] of moi) {
		while (!(await song(url))) {
			if (Date.now() > han)
				await khongDo(`may chu ${url} khong len sau ${CHO_TAI}ms`);
			await new Promise((r) => setTimeout(r, 1000));
		}
	}
}

const QUAN_TRI = `${MA}-quan-tri@thu.test`;
let quanTriId = null;
const SLACK_ID = `${MA}-slack`;
let batDau = new Date();

async function donDep() {
	await db.account.deleteMany({ where: { id: SLACK_ID } });
	await db.agentTask.deleteMany({
		where: { kind: { startsWith: "slack-" }, createdAt: { gte: batDau } },
	});
	if (quanTriId) {
		await db.session.deleteMany({ where: { userId: quanTriId } });
		await db.member.deleteMany({ where: { userId: quanTriId } });
		await db.user.deleteMany({ where: { id: quanTriId } });
	}
}

function cookieTu(dong) {
	const dau = dong.indexOf("=");
	return { name: dong.slice(0, dau), value: dong.slice(dau + 1) };
}

async function moTrang(trang, duong, loi) {
	await trang.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: CHO_TAI,
	});
	await trang.waitForSelector("h1", { timeout: CHO_TAI }).catch(() => {});
	await trang
		.waitForFunction(() => !document.querySelector("[aria-busy='true']"), {
			timeout: CHO_TAI,
		})
		.catch(() => {});
	await new Promise((r) => setTimeout(r, CHO_HYDRATE_MS));
	return loi;
}

async function docH1(trang) {
	return trang.evaluate(() => {
		const h = [...document.querySelectorAll("h1")];
		const r = h[0]?.getBoundingClientRect();
		const bc = document
			.querySelector("nav[data-slot='breadcrumb']")
			?.getBoundingClientRect();
		return {
			so: h.length,
			left: r ? r.left : null,
			top: r ? r.top : null,
			chu: h[0]?.textContent?.trim() ?? null,
			dich: h[0]?.getAttribute("translate") ?? null,
			bc: bc ? bc.height : null,
		};
	});
}

await dungMayChu();
const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(cay.dong.join(" | "));

const dongPhien = execFileSync("bun", ["run", "dev:session", QUAN_TRI], {
	cwd: join(GOC, "apps", "api"),
	encoding: "utf8",
})
	.trim()
	.split("\n")
	.pop()
	.trim();
const phien = cookieTu(dongPhien);
const quanTri = await db.user.findUniqueOrThrow({
	where: { email: QUAN_TRI },
	select: { id: true },
});
quanTriId = quanTri.id;
await db.member.upsert({
	where: {
		organizationId_userId: { organizationId: WORKSPACE_ID, userId: quanTriId },
	},
	create: {
		id: `member-${quanTriId}`,
		organizationId: WORKSPACE_ID,
		userId: quanTriId,
		role: "admin",
		createdAt: new Date(),
	},
	update: { role: "admin" },
});
await db.session.updateMany({
	where: { userId: quanTriId },
	data: { activeOrganizationId: WORKSPACE_ID },
});
const to = await db.organization.findUniqueOrThrow({
	where: { id: WORKSPACE_ID },
	select: { slug: true },
});
const slug = to.slug;
const zalo = await db.appSetting.findFirst({ select: { zaloBotName: true } });
if (!zalo?.zaloBotName)
	await khongDo(
		"Zalo chua bat trong CSDL — lien ket Noi Zalo cua toi khong hien, khong bo o",
	);
batDau = new Date();

trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
const trang = await trinhDuyet.newPage();
const loiHydrate = [];
trang.on("pageerror", (e) => {
	if (LOI_HYDRATE.test(String(e))) loiHydrate.push(String(e));
});
trang.on("console", (m) => {
	if (m.type() === "error" && LOI_HYDRATE.test(m.text()))
		loiHydrate.push(m.text());
});
const host = new URL(APP).hostname;
async function datTieng(tieng) {
	await trang.setCookie(
		{ name: phien.name, value: phien.value, domain: host, path: "/" },
		{ name: "lang", value: tieng, domain: host, path: "/" },
	);
}
await datTieng("vi");

const duongDu = (d) => `/${slug}${d}`;

async function doTrangCon(tieng, loaiSlack) {
	const t = NHAN[tieng];
	const ca =
		loaiSlack === "chua"
			? [["/settings/connections/slack", t.slack, "no"]]
			: [
					["/settings/connections/google", t.google, "no"],
					["/settings/connections/microsoft", t.microsoft, "no"],
					["/settings/connections/slack", t.slack, "no"],
					["/settings/connections/slack/people", t.nguoi, null],
					["/settings/connections/zalo", t.zalo, "no"],
					["/settings/connections/intake", t.intake, null],
				];
	for (const [d, ten, dich] of ca) {
		await moTrang(trang, duongDu(d), loiHydrate);
		const h = await docH1(trang);
		khang(h.chu === ten, `${tieng} ${d}: h1 "${h.chu}", mong "${ten}"`);
		khang(h.dich === dich, `${tieng} ${d}: translate ${h.dich}, mong ${dich}`);
		if (d.endsWith("google") || d.endsWith("microsoft")) {
			const tieuDe = await trang.evaluate(
				() =>
					document.querySelector("[data-slot='card-title']")?.textContent ?? "",
			);
			khang(
				!tieuDe.includes(ten),
				`${d.split("/").pop()} ${tieng}: tieu de the chua ${ten}`,
			);
		}
		if (d.endsWith("/slack")) {
			const trongVung = await trang.evaluate(
				(chu, laChua) =>
					laChua
						? (
								document.querySelector("[data-slot='page-shell-content']")
									?.textContent ?? ""
							).includes(chu)
						: [
								...document.querySelectorAll(
									"[data-slot='page-shell-actions'] button",
								),
							].some((b) => b.textContent?.trim() === chu),
				loaiSlack === "chua" ? t.chuaCam : t.go,
				loaiSlack === "chua",
			);
			khang(
				trongVung,
				loaiSlack === "chua"
					? `${tieng} slack chua: "${t.chuaCam}" khong nam trong than trang`
					: `${tieng} slack da: nut "${t.go}" khong nam trong vung hanh dong dau trang`,
			);
		}
	}
	if (loaiSlack === "da") {
		await moTrang(trang, duongDu("/settings/connections"), loiHydrate);
		const coThem = await trang.evaluate(
			(chu) =>
				[
					...document.querySelectorAll(
						"[data-slot='page-shell-actions'] a, [data-slot='page-shell-actions'] button",
					),
				].some((b) => b.textContent?.trim() === chu),
			t.them,
		);
		khang(
			coThem,
			`${tieng} ket noi: nut "${t.them}" khong nam trong vung hanh dong dau trang`,
		);
	}
}

console.log("lan gieo 1: slack chua ket noi");
const slackNay = await db.account.count({
	where: { providerId: "slack", accessToken: { not: null } },
});
if (slackNay !== 0)
	await khongDo(
		`CSDL da co ${slackNay} tai khoan Slack — lan gieo 1 can Slack chua ket noi`,
	);
for (const tieng of ["vi", "en"]) {
	await datTieng(tieng);
	await doTrangCon(tieng, "chua");
}

console.log("lan gieo 2: slack da ket noi");
await db.account.create({
	data: {
		id: SLACK_ID,
		accountId: SLACK_ID,
		providerId: "slack",
		userId: quanTriId,
		accessToken: "lan-do-khong-phai-token",
		scope: "channels:read,chat:write",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
});
for (const tieng of ["vi", "en"]) {
	await datTieng(tieng);
	await doTrangCon(tieng, "da");
}
await datTieng("vi");

const TAT_CA = [...MUC, ...CON];
for (const rong of [1920, 1440, 768]) {
	await trang.setViewport({ width: rong, height: 900 });
	const vt = new Map();
	for (const d of TAT_CA) {
		await moTrang(trang, duongDu(d), loiHydrate);
		vt.set(d, await docH1(trang));
		if (rong !== 1920)
			await trang.screenshot({
				path: join(
					BANG_CHUNG,
					`${d.replaceAll("/", "_").replace(/^_/, "")}-${rong}.png`,
				),
			});
	}
	const chung = vt.get("/settings");
	const google = vt.get("/settings/connections/google");
	if (chung.left === null || google.top === null)
		await khongDo(`${rong}: khong doc duoc h1 cua Chung hoac Google`);
	for (const d of TAT_CA) {
		const h = vt.get(d);
		if (rong !== 1920)
			khang(h.so === 1, `${d.split("/").pop()} ${rong}: ${h.so} h1`);
		if (d !== "/settings")
			khang(
				h.left !== null && Math.abs(h.left - chung.left) <= LECH,
				`${d.replace("/settings/", "") || "chung"} ${rong}: h1 left lech ${Math.round((h.left ?? 0) - chung.left)}px so voi Chung`,
			);
		if (rong === 1920) continue;
		if (MUC.includes(d) && d !== "/settings")
			khang(
				Math.abs(h.top - chung.top) <= LECH,
				`${d.replace("/settings/", "")} ${rong}: h1 top lech ${Math.round(h.top - chung.top)}px so voi Chung`,
			);
		if (CON.includes(d) && d !== "/settings/connections/google")
			khang(
				Math.abs(h.top - google.top) <= LECH,
				`${d.replace("/settings/connections/", "")} ${rong}: h1 top lech ${Math.round(h.top - google.top)}px so voi Google`,
			);
	}
	if (rong !== 1920) {
		const mong = (google.bc ?? 0) + KHOANG_BREADCRUMB;
		khang(
			Math.abs(google.top - chung.top - mong) <= LECH,
			`google ${rong}: trang con thap hon ${Math.round(google.top - chung.top)}px, mong ${Math.round(mong)}px`,
		);
		await moTrang(trang, duongDu("/settings"), loiHydrate);
		const nhan = await trang.evaluate(
			() =>
				[
					...document.querySelectorAll("aside [data-slot='nav-group-label']"),
				].filter((e) => e.offsetParent !== null).length,
		);
		khang(nhan === 4, `${rong}: ${nhan}/4 nhan nhom hien`);
		await trang.screenshot({ path: join(BANG_CHUNG, `thanh-ben-${rong}.png`) });
	}
}

await trang.setViewport({ width: 375, height: 800 });
for (const d of [...TAT_CA, "/reminders"]) {
	await moTrang(trang, duongDu(d), loiHydrate);
	const tran = await trang.evaluate(() => {
		const rong = document.documentElement.clientWidth;
		const khung = [
			...document.querySelectorAll(
				"[data-slot='page-shell-header'], [data-slot='page-shell'], nav[aria-label]",
			),
		].filter((e) => e.offsetParent !== null);
		const khungTran = Math.max(
			0,
			...khung.map((e) => Math.ceil(e.getBoundingClientRect().right - rong)),
		);
		const noiDung = document.documentElement.scrollWidth - rong;
		let thuPham = null;
		if (noiDung > 0)
			for (const e of document.querySelectorAll(
				"[data-slot='page-shell-content'] *",
			))
				if (e.getBoundingClientRect().right > rong + 1) {
					const slot = e.getAttribute("data-slot");
					thuPham = `${e.tagName.toLowerCase()}${slot ? `[${slot}]` : ""}`;
					break;
				}
		return { khungTran, noiDung, thuPham };
	});
	khang(tran.khungTran <= 0, `${d} 375: khung tran ngang ${tran.khungTran}px`);
	if (tran.noiDung > 0)
		noiDungTran.push(
			`${d} 375: noi dung tran ${tran.noiDung}px tai ${tran.thuPham ?? "?"}`,
		);
}
await moTrang(trang, duongDu("/settings"), loiHydrate);
const hep = await trang.evaluate(() => {
	const nhan = [
		...document.querySelectorAll("[data-slot='nav-group-label']"),
	].filter((e) => e.offsetParent !== null).length;
	const hang = [...document.querySelectorAll("nav")].find(
		(n) => !n.closest("aside") && n.offsetParent !== null,
	);
	return { nhan, cuon: hang ? hang.scrollWidth > hang.clientWidth : false };
});
khang(hep.nhan === 0, `375: ${hep.nhan} nhan nhom hien`);
khang(hep.cuon, "375: hang thanh ben khong cuon ngang");
await trang.screenshot({ path: join(BANG_CHUNG, "thanh-ben-375.png") });

await trang.setViewport({ width: 1440, height: 900 });
for (const d of CON) {
	await moTrang(trang, duongDu(d), loiHydrate);
	const dau = await trang.$("nav[data-slot='breadcrumb'] a");
	khang(dau !== null, `${d.split("/").pop()}: khong co breadcrumb`);
	if (dau) {
		await Promise.all([
			trang
				.waitForNavigation({ waitUntil: "domcontentloaded", timeout: CHO_TAI })
				.catch(() => {}),
			dau.click(),
		]);
		await trang
			.waitForFunction(
				(p) => location.pathname === p,
				{ timeout: CHO_TAI },
				duongDu("/settings/connections"),
			)
			.catch(() => {});
		const p = await trang.evaluate(() => location.pathname);
		khang(
			p === duongDu("/settings/connections"),
			`${d.split("/").pop()}: bam Ket noi toi ${p}`,
		);
	} else khang(false, `${d.split("/").pop()}: khong bam duoc breadcrumb`);
}

await moTrang(trang, duongDu("/settings"), loiHydrate);
const nutMenu = await trang.$(`button[aria-label='${NHAN.vi.menuTaiKhoan}']`);
if (!nutMenu) await khongDo("khong thay nut mo menu nguoi dung");
await nutMenu.click();
await trang.waitForSelector("[role='menuitem']", { timeout: CHO_TAI });
const mucNhac = await trang.evaluateHandle(
	(chu) =>
		[...document.querySelectorAll("[role='menuitem']")].find(
			(m) => m.textContent?.trim() === chu,
		) ?? null,
	NHAN.vi.nhac,
);
const coMuc = await trang.evaluate((m) => m !== null, mucNhac);
if (!coMuc) await khongDo("menu nguoi dung khong co muc Nhac buoi sang");
await Promise.all([
	trang
		.waitForFunction(
			(p) => location.pathname === p,
			{ timeout: CHO_TAI },
			duongDu("/reminders"),
		)
		.catch(() => {}),
	mucNhac.click(),
]);
await moTrang(trang, duongDu("/reminders"), loiHydrate);
const nhac = await trang.evaluate(
	(caiDat) => ({
		p: location.pathname,
		h1: document.querySelector("h1")?.textContent?.trim(),
		khoi:
			Boolean(document.getElementById("khoi-zalo")) &&
			Boolean(document.getElementById("khoi-kenh")),
		thanhBen: document.querySelectorAll(`nav[aria-label='${caiDat}']`).length,
	}),
	NHAN.vi.caiDat,
);
khang(
	nhac.p === duongDu("/reminders"),
	`menu: bam Nhac buoi sang toi ${nhac.p}`,
);
khang(nhac.h1 === NHAN.vi.tieuDeNhac, `reminders: h1 "${nhac.h1}"`);
khang(nhac.khoi, "reminders: thieu khoi Zalo hoac khoi kenh");
khang(nhac.thanhBen === 0, "reminders: co thanh ben Cai dat");
await trang.screenshot({ path: join(BANG_CHUNG, "nhac-1440.png") });

await moTrang(trang, duongDu("/settings/connections/zalo"), loiHydrate);
const hrefNoi = await trang.evaluate(
	(chu) =>
		[...document.querySelectorAll("a")]
			.find((a) => a.textContent?.trim() === chu)
			?.getAttribute("href") ?? null,
	NHAN.vi.noiCuaToi,
);
if (hrefNoi === null)
	await khongDo(
		"Ket noi › Zalo khong co lien ket Noi Zalo cua toi — khong bo o",
	);
khang(
	hrefNoi === duongDu("/reminders"),
	`zalo: lien ket Noi Zalo cua toi tro ${hrefNoi}`,
);

await trang.goto(`${APP}${duongDu("/settings/notifications")}`, {
	waitUntil: "domcontentloaded",
	timeout: CHO_TAI,
});
await trang
	.waitForFunction(
		(p) => location.pathname === p,
		{ timeout: CHO_TAI },
		duongDu("/reminders"),
	)
	.catch(() => {});
const cuoi = await trang.evaluate(() => location.pathname);
khang(
	cuoi === duongDu("/reminders"),
	`duong cu khong chuyen huong (dung o ${cuoi})`,
);

if (loiHydrate.length > 0) {
	sai += 1;
	console.log(
		`DO: loi hydrate ${loiHydrate.length}: ${loiHydrate[0].slice(0, 200)}`,
	);
}

for (const x of noiDungTran) console.log(`ngoai-khung: ${x}`);
const tong = dung + sai - (loiHydrate.length > 0 ? 1 : 0);
console.log(`man-chrome: ${dung}/${tong} khang dinh dat`);
if (tong !== KY_MONG)
	await khongDo(`so khang dinh ${tong} lech KY_MONG ${KY_MONG}`);
await ket(sai === 0 ? 0 : 1);
