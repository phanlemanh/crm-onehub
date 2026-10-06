import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { authMessages } from "../../../apps/app/lib/messages/auth.ts";
import { trangLoiMessages } from "../../../apps/app/lib/messages/trang-loi.ts";
import { db } from "../../../packages/db/src/index.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "cua-vao-va", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const NGUOI = process.env.NGUOI ?? "ada@trycomp.ai";
const KHO = { 1440: { rong: 1440, cao: 900 }, 375: { rong: 375, cao: 812 } };
const CHO_MS = 90_000;
const BANG = "session";
const BANG_TAM = "session_cvv";
const MA_CHUYEN = new Set([301, 302, 303, 307, 308]);
const q = authMessages("vi").quenMatKhau;
const loi = trangLoiMessages("vi");

const MA_TRAN = [
	"qmk-375-nhap",
	"qmk-375-da-gui",
	"qmk-1440-nhap",
	"qmk-1440-da-gui",
	"qmk-dem",
	"api-doi-chung",
	"api-khong-cookie",
	"api-workspace-503",
	"api-research-503",
	"khong-session-data",
	"loi-375-dia-chi",
	"loi-375-nut",
	"loi-375-cap",
	"loi-1440-dia-chi",
	"loi-1440-nut",
	"loi-1440-cap",
	"thu-lai-van-loi",
	"thu-lai-lanh",
	"don",
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

async function goiApi(thuTuc, cookie) {
	const res = await fetch(`${API}/api/trpc/${thuTuc}`, {
		headers: cookie ? { cookie: `${cookie.ten}=${cookie.gia}` } : {},
	});
	const than = await res.json().catch(() => null);
	return { status: res.status, code: than?.error?.data?.code ?? null };
}

async function tenBangCon() {
	const hang = await db.$queryRawUnsafe(
		`SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name IN ('${BANG}', '${BANG_TAM}')`,
	);
	return hang.map((h) => h.table_name).sort();
}

async function lamHong() {
	await db.$executeRawUnsafe(`ALTER TABLE "${BANG}" RENAME TO "${BANG_TAM}"`);
}

async function lamLanh() {
	const con = await tenBangCon();
	if (con.includes(BANG_TAM) && !con.includes(BANG)) {
		await db.$executeRawUnsafe(`ALTER TABLE "${BANG_TAM}" RENAME TO "${BANG}"`);
	}
}

async function ngu(ms) {
	await new Promise((r) => setTimeout(r, ms));
}

async function trang(kho, cookie) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	const ds = [{ name: "lang", value: "vi", domain: host, path: "/" }];
	if (cookie)
		ds.push({ name: cookie.ten, value: cookie.gia, domain: host, path: "/" });
	await ctx.setCookie(...ds);
	const p = await ctx.newPage();
	await p.setViewport({
		width: KHO[kho].rong,
		height: KHO[kho].cao,
		deviceScaleFactor: 1,
	});
	const chuyen = [];
	p.on("response", (r) => {
		if (MA_CHUYEN.has(r.status())) chuyen.push(r.headers().location ?? "");
	});
	return { ctx, p, chuyen };
}

function logoTruoc(tieuDe) {
	const h = [...document.querySelectorAll("h1, h2")].find(
		(x) => x.textContent?.trim() === tieuDe,
	);
	const logo =
		h?.parentElement?.parentElement?.querySelector(
			":scope > a[href='/'] svg",
		) ?? null;
	if (!logo || !h) return { co: false, trongKhung: false, tran: -1 };
	const r = logo.getBoundingClientRect();
	return {
		co: Boolean(
			logo.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING,
		),
		trongKhung:
			r.top >= 0 &&
			r.left >= 0 &&
			r.bottom <= innerHeight &&
			r.right <= innerWidth &&
			r.width > 0,
		tran:
			document.documentElement.scrollWidth -
			document.documentElement.clientWidth,
		khung: `${Math.round(r.top)},${Math.round(r.left)},${Math.round(r.width)}x${Math.round(r.height)} trong ${innerWidth}x${innerHeight}`,
	};
}

async function doQuen(kho) {
	const { ctx, p } = await trang(kho, null);
	try {
		await p.goto(`${APP}/quen-mat-khau`, {
			waitUntil: "networkidle0",
			timeout: CHO_MS,
		});
		await p
			.waitForSelector("form input[type='email']", { timeout: CHO_MS })
			.catch(() => khongDo(`${kho}: /quen-mat-khau khong hien bieu mau`));
		await p.evaluate(() => document.fonts.ready);
		const nhap = await p.evaluate(logoTruoc, q.title);
		await p.screenshot({ path: join(RA, `quen-mat-khau-${kho}.png`) });
		kiem(
			`qmk-${kho}-nhap`,
			`${kho}: quen-mat-khau nhap — logo truoc tieu de ${nhap.co}, trong khung nhin ${nhap.trongKhung} (${nhap.khung}), tran ngang ${nhap.tran}px`,
			nhap.co && nhap.trongKhung && nhap.tran === 0,
		);
		await p.type(
			"form input[type='email']",
			`cvv-${kho}-${Date.now()}@example.test`,
		);
		await p.evaluate(() => document.querySelector("form")?.requestSubmit());
		await p
			.waitForFunction(
				(t) =>
					[...document.querySelectorAll("h1, h2")].some(
						(h) => h.textContent?.trim() === t,
					),
				{ timeout: CHO_MS },
				q.xong.title,
			)
			.catch(async () =>
				khongDo(
					`${kho}: khong sang trang thai «${q.xong.title}» — trang dang hien: ${(await p.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").slice(0, 300)}`,
				),
			);
		const daGui = await p.evaluate(logoTruoc, q.xong.title);
		await p.screenshot({ path: join(RA, `quen-mat-khau-da-gui-${kho}.png`) });
		kiem(
			`qmk-${kho}-da-gui`,
			`${kho}: quen-mat-khau da gui — logo truoc tieu de ${daGui.co}, trong khung nhin ${daGui.trongKhung} (${daGui.khung}), tran ngang ${daGui.tran}px`,
			daGui.co && daGui.trongKhung && daGui.tran === 0,
		);
	} finally {
		await ctx.close();
	}
}

function trangLoi(tieuDe, chuNut) {
	const h = [...document.querySelectorAll("[role='heading']")].find(
		(x) => x.textContent?.trim() === tieuDe,
	);
	const nut = [...document.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === chuNut,
	);
	const r = nut?.getBoundingClientRect();
	return {
		coLoi: Boolean(h),
		nutTrongKhung: Boolean(
			r && r.top >= 0 && r.bottom <= innerHeight && r.width > 0,
		),
		cap:
			document
				.querySelector("main[data-cap-loi]")
				?.getAttribute("data-cap-loi") ?? null,
		header: [...document.querySelectorAll("header")].some(
			(h) => h.getClientRects().length > 0 && !h.closest("[hidden]"),
		),
		dsCap: [...document.querySelectorAll("main[data-cap-loi]")].map((m) =>
			m.getAttribute("data-cap-loi"),
		),
		next: document.body.innerText.includes("Application error"),
		duong: location.pathname,
	};
}

async function choLoi(p) {
	await p
		.waitForFunction(
			(t) =>
				[...document.querySelectorAll("[role='heading']")].some(
					(x) => x.textContent?.trim() === t,
				),
			{ timeout: CHO_MS },
			loi.tieuDe,
		)
		.catch(() => null);
}

async function doLoi(kho, cookie, slug) {
	const { ctx, p, chuyen } = await trang(kho, cookie);
	await p.goto(`${APP}/${slug}`, { waitUntil: "load", timeout: CHO_MS });
	await choLoi(p);
	await p.evaluate(() => document.fonts.ready);
	const kq = await p.evaluate(trangLoi, loi.tieuDe, loi.thuLai);
	await p.screenshot({ path: join(RA, `trang-loi-${kho}.png`) });
	const quaSignIn = chuyen.filter((d) => d.includes("/sign-in")).length;
	kiem(
		`loi-${kho}-dia-chi`,
		`${kho}: dia chi van ${kq.duong} (mong /${slug}), chuyen huong qua /sign-in ${quaSignIn} lan`,
		kq.duong === `/${slug}` && quaSignIn === 0,
	);
	kiem(
		`loi-${kho}-nut`,
		`${kho}: tieu de «${loi.tieuDe}» ${kq.coLoi}, nut «${loi.thuLai}» trong khung nhin ${kq.nutTrongKhung}, chu "Application error" ${kq.next}`,
		kq.coLoi && kq.nutTrongKhung && !kq.next,
	);
	kiem(
		`loi-${kho}-cap`,
		`${kho}: cap loi ${kq.cap} (mong ngoai-khung), header dang hien ${kq.header} — moi cap ${JSON.stringify(kq.dsCap)}`,
		kq.cap === "ngoai-khung" && !kq.header && kq.dsCap.length === 1,
	);
	return { ctx, p };
}

async function bamThuLai(p) {
	await p.evaluate((chuNut) => {
		[...document.querySelectorAll("button")]
			.find((b) => b.textContent?.trim() === chuNut)
			?.click();
	}, loi.thuLai);
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});

	await doQuen(375);
	await doQuen(1440);
	const soO = [
		"qmk-375-nhap",
		"qmk-375-da-gui",
		"qmk-1440-nhap",
		"qmk-1440-da-gui",
	].filter((m) => daPhat.has(m)).length;
	kiem("qmk-dem", `${soO}/4 o quen-mat-khau`, soO === 4);

	const cookie = phien();
	const slug = await suySlug(cookie);
	const truocWs = await goiApi("workspace.get", cookie);
	const truocRk = await goiApi("settings.researchKey", cookie);
	kiem(
		"api-doi-chung",
		`truoc khi gay loi: workspace.get ${truocWs.status}, settings.researchKey ${truocRk.status} (mong 200)`,
		truocWs.status === 200 && truocRk.status === 200,
	);
	const khongCk = await goiApi("workspace.get", null);
	kiem(
		"api-khong-cookie",
		`khong cookie: workspace.get ${khongCk.status} ${khongCk.code} (mong 401)`,
		khongCk.status === 401,
	);

	let giuTrang = null;
	try {
		await lamHong();
		const ws = await goiApi("workspace.get", cookie);
		const rk = await goiApi("settings.researchKey", cookie);
		kiem(
			"api-workspace-503",
			`api: workspace.get ${ws.status} ${ws.code} (mong 503 SERVICE_UNAVAILABLE)`,
			ws.status === 503 && ws.code === "SERVICE_UNAVAILABLE",
		);
		kiem(
			"api-research-503",
			`api: settings.researchKey ${rk.status} ${rk.code} (mong 503)`,
			rk.status === 503,
		);

		await doLoi(375, cookie, slug).then(({ ctx }) => ctx.close());
		giuTrang = await doLoi(1440, cookie, slug);
		const cookieTrinhDuyet = (await giuTrang.ctx.cookies()).map((c) => c.name);
		kiem(
			"khong-session-data",
			`cookie trong trinh duyet: ${cookieTrinhDuyet.join(", ")} — khong co session_data`,
			!cookieTrinhDuyet.some((t) => t.endsWith("session_data")),
		);

		await bamThuLai(giuTrang.p);
		await ngu(3000);
		const vanLoi = await giuTrang.p.evaluate(trangLoi, loi.tieuDe, loi.thuLai);
		kiem(
			"thu-lai-van-loi",
			`1440: bam «${loi.thuLai}» khi loi con — van trang loi ${vanLoi.coLoi}, van ${vanLoi.duong}`,
			vanLoi.coLoi && vanLoi.duong === `/${slug}`,
		);
	} finally {
		await lamLanh();
	}

	if (giuTrang) {
		await choLoi(giuTrang.p);
		await bamThuLai(giuTrang.p);
		const het = await giuTrang.p
			.waitForFunction(
				(t) =>
					![...document.querySelectorAll("[role='heading']")].some(
						(x) => x.textContent?.trim() === t,
					),
				{ timeout: CHO_MS },
				loi.tieuDe,
			)
			.then(() => true)
			.catch(() => false);
		await giuTrang.p.screenshot({ path: join(RA, "sau-thu-lai-1440.png") });
		const duong = await giuTrang.p.evaluate(() => location.pathname);
		kiem(
			"thu-lai-lanh",
			`1440: go loi roi bam «${loi.thuLai}» — trang tro lai ${het}, dia chi ${duong}`,
			het && duong === `/${slug}`,
		);
		await giuTrang.ctx.close();
	}

	const con = await tenBangCon();
	kiem(
		"don",
		`don: bang con ${con.join(", ")} (mong chi ${BANG})`,
		con.length === 1 && con[0] === BANG,
	);
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
	if (e instanceof KhongDo) {
		dong.push(`KHONG DO DUOC: ${e.message}`);
		ma = 2;
	} else {
		dong.push(`KHONG DO DUOC: ${e?.stack ?? e}`);
		ma = 2;
	}
} finally {
	await lamLanh().catch(() => {});
	await trinhDuyet?.close().catch(() => {});
	await db.$disconnect();
}

for (const d of dong) console.log(d);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
