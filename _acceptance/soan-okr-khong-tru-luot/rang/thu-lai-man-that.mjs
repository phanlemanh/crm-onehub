import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { okrSoanMessages } from "../../../apps/app/lib/messages/okr-soan.ts";
import { db } from "../../../packages/db/src/index.ts";
import { moCuoc } from "../../../packages/db/src/okr-cuoc-soan.ts";
import { PHIEN_CHO_EVE } from "../../../packages/validation/src/okr-cuoc-soan.ts";
import {
	idMau,
	laKhoDo,
	napBoMau,
	phienCookie,
	thuMau,
	trpc,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const GIAY_MS = 1000;
const DO = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: [
		{ ten: "1440", rong: 1440, cao: 1000 },
		{ ten: "390", rong: 390, cao: 844 },
	],
	choMs: 60 * GIAY_MS,
	nhipMs: 300,
	quanTri: "le-hai-dang",
	phong: { ma: "kd-bac", truong: "nguyen-thi-lan" },
	chuKy: "nam-ke",
	pha: "lap-ke-hoach",
	moPhien: "/eve/agents/okr/eve/v1/session",
	congMayGia: 3351,
};

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = join(GOC, "_acceptance/soan-okr-khong-tru-luot/evidence");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const m = okrSoanMessages("vi");
const KY = idMau("chu-ky", DO.chuKy);
const PHONG = idMau("pb", DO.phong.ma);
const KIEM_DO_DO = process.argv.includes("--kiem-do-do");
const CAU_LOI = m.hoiThoai.lyDoHong["khong-noi-duoc"];

const dong = [];
let sai = 0;
let trinhDuyet = null;
let mayGia = null;
function kiem(nhan, dat) {
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhan}`);
	if (!dat) sai += 1;
}
async function dongHet() {
	await trinhDuyet?.close().catch(() => {});
	mayGia?.stop(true);
	await db.$disconnect().catch(() => {});
}
async function ket(ma) {
	for (const d of dong) console.log(d);
	console.log(
		`${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI`,
	);
	await dongHet();
	process.exit(ma);
}
async function khongDo(cau) {
	console.log(`KHONG DO ${cau}`);
	await ket(2);
}
const tre = (ms) => new Promise((xong) => setTimeout(xong, ms));
async function choDen(dieuKien) {
	const het = Date.now() + DO.choMs;
	while (Date.now() < het) {
		if (await dieuKien()) return true;
		await tre(DO.nhipMs);
	}
	return false;
}

const { canhCay } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
);
const cay = await canhCay();
if (cay.ket !== "dung-cay")
	await khongDo(
		`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
	);
if (!laKhoDo())
	await khongDo("DATABASE_URL khong phai kho do rieng — chay qua mot-luot.sh");
const tenKho = new URL(process.env.DATABASE_URL ?? "").pathname.replace(
	/^\//,
	"",
);
dong.push(`KHO ${tenKho}`);

if (KIEM_DO_DO) {
	mayGia = Bun.serve({
		port: DO.congMayGia,
		fetch(req) {
			const phien = `phien-gia-${Date.now()}`;
			if (req.method === "POST")
				return Response.json(
					{ ok: true, sessionId: phien, continuationToken: `eve:${phien}` },
					{ status: 202, headers: { "x-eve-session-id": phien } },
				);
			return new Response("", {
				status: 200,
				headers: { "content-type": "application/x-ndjson" },
			});
		},
	});
}

const nap = napBoMau();
if (nap.ma !== 0)
	await khongDo(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
const qt = phienCookie(thuMau(DO.quanTri));
const tl = phienCookie(thuMau(DO.phong.truong));
await trpc(API, qt).lam("okr.setProgram", {
	aiOn: true,
	aiSoanPhamVi: "danh-sach",
	aiSoanDonVi: [PHONG],
});
const ky = (await trpc(API, qt).hoi("okr.cycles")).cycles.find(
	(c) => c.id === KY,
);
if (ky?.phase !== DO.pha)
	await khongDo(`chu ky ${KY} o pha ${ky?.phase ?? "khong co"}, can ${DO.pha}`);
const truong = await db.user.findUnique({
	where: { email: thuMau(DO.phong.truong) },
	select: { id: true },
});
if (!truong) await khongDo("khong thay truong phong trong bo mau");

async function gieoCuoc(ten) {
	await db.okrCuocSoan.updateMany({
		where: { departmentId: PHONG, cycleId: KY, trangThai: "dang" },
		data: { trangThai: "bo" },
	});
	const c = await moCuoc(db, {
		cycleId: KY,
		level: "phong-ban",
		divisionId: null,
		departmentId: PHONG,
		nguoiMoUserId: truong.id,
		sessionId: `${PHIEN_CHO_EVE}do-r1h-${ten}-${Date.now()}`,
		nac: "bat",
	});
	dong.push(`GIEO cuoc ${c.id} (${ten}) soLuot ${c.soLuot}`);
	return c;
}

const soLuot = async (id) =>
	(await db.okrCuocSoan.findUnique({ where: { id }, select: { soLuot: true } }))
		?.soLuot ?? null;

async function tranNgang(p) {
	return p.evaluate(() => {
		const trang = document.documentElement.scrollWidth - innerWidth;
		const vung = [...document.querySelectorAll("[data-man-soan] *")]
			.filter((e) => ["auto", "scroll"].includes(getComputedStyle(e).overflowX))
			.map((e) => e.scrollWidth - e.clientWidth);
		return Math.max(trang, 0, ...vung);
	});
}

async function chup(p, ten) {
	if (KIEM_DO_DO) return;
	await p.screenshot({ path: join(RA, `${ten}.png`) });
	writeFileSync(join(RA, `${ten}.html`), await p.content());
}

const chuLoi = (p) =>
	p.$eval('[data-luot="loi"]', (o) => o.innerText).catch(() => "");

async function suySlug() {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${tl.ten}=${tl.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	return dich
		? new URL(dich, APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0]
		: null;
}

mkdirSync(RA, { recursive: true });
const slug = await suySlug();
if (!slug) await khongDo(`${APP}/ khong chuyen toi trang cua workspace`);
trinhDuyet = await puppeteer.launch({
	executablePath: DO.chrome,
	headless: true,
});

try {
	for (const kho of DO.kho) {
		const cuoc = await gieoCuoc(kho.ten);
		const host = new URL(APP).hostname;
		const ctx = await trinhDuyet.createBrowserContext();
		await ctx.setCookie(
			{ name: tl.ten, value: tl.gia, domain: host, path: "/" },
			{ name: "lang", value: "vi", domain: host, path: "/" },
		);
		const p = await ctx.newPage();
		await p.setViewport({
			width: kho.rong,
			height: kho.cao,
			deviceScaleFactor: 1,
		});
		let soPost = 0;
		p.on("request", (r) => {
			if (r.method() === "POST" && new URL(r.url()).pathname === DO.moPhien)
				soPost += 1;
		});
		await p.goto(
			`${APP}/${slug}/okr/theo-don-vi?kyOkr=${KY}&donOkr=pb:${PHONG}&cuocSoan=${cuoc.id}`,
			{
				waitUntil: "networkidle2",
			},
		);
		const coLoi = await choDen(async () => (await chuLoi(p)).includes(CAU_LOI));
		kiem(
			coLoi
				? `${kho.ten}: thay cau khong-noi-duoc`
				: `khong thay cau khong-noi-duoc: ${kho.ten}`,
			coLoi,
		);
		kiem(`${kho.ten}: cua da nhan POST mo phien (${soPost})`, soPost > 0);
		kiem(
			`${kho.ten}: thay cau khong bi tinh`,
			(await chuLoi(p)).includes(m.hoiThoai.khongTinh),
		);
		const sauMo = await soLuot(cuoc.id);
		kiem(
			sauMo === 0
				? `${kho.ten}: soLuot sau mo 0`
				: `luot tang: ${sauMo} (${kho.ten}, sau mo)`,
			sauMo === 0,
		);
		kiem(
			`${kho.ten}: khong tran ngang (loi) ${await tranNgang(p)}`,
			(await tranNgang(p)) <= 0,
		);
		await chup(p, `E9-loi-${kho.ten}`);
		const nut = await p.$('[data-nut="thu-lai"]');
		if (nut) await nut.click();
		const daDem = await choDen(async () =>
			(await chuLoi(p)).includes(m.hoiThoai.daThuLai("1")),
		);
		kiem(`${kho.ten}: sau bam thay Da thu lai 1 lan`, daDem);
		const sauBam = await soLuot(cuoc.id);
		kiem(
			sauBam === 0
				? `${kho.ten}: soLuot sau bam 0`
				: `luot tang: ${sauBam} (${kho.ten}, sau bam)`,
			sauBam === 0,
		);
		kiem(
			`${kho.ten}: khong tran ngang (thu lai) ${await tranNgang(p)}`,
			(await tranNgang(p)) <= 0,
		);
		await chup(p, `E9-thu-lai-${kho.ten}`);
		await ctx.close();
	}
} catch (loi) {
	await khongDo(`r1h: ${loi?.message ?? loi}`);
}

if (KIEM_DO_DO) {
	const thayDoCau = dong.some((d) =>
		d.startsWith("SAI khong thay cau khong-noi-duoc"),
	);
	const thayLuotTang = dong.some((d) => /^SAI luot tang: 1 /.test(d));
	for (const d of dong) console.log(d);
	if (!thayLuotTang) console.log("SAI khong-thay-luot-tang");
	const dung = thayDoCau && thayLuotTang;
	console.log(
		dung
			? "chieu do: phep do bat duoc loi nhu ky vong"
			: "SAI chieu do khong do",
	);
	await dongHet();
	process.exit(dung ? 1 : 2);
}
await ket(sai === 0 ? 0 : 1);
