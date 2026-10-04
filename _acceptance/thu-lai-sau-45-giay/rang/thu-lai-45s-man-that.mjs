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
	cho45sMs: 80 * GIAY_MS,
	choGuiLaiMs: 30 * GIAY_MS,
	nhipMs: 300,
	mauMs: 200,
	soMauToiThieu: 3,
	doHuyMs: 3 * GIAY_MS,
	nhipKiemDoDoMs: 10 * GIAY_MS,
	quanTri: "le-hai-dang",
	phong: { ma: "kd-bac", truong: "nguyen-thi-lan" },
	chuKy: "nam-ke",
	pha: "lap-ke-hoach",
	congMayGia: 3351,
	tienTo: "/eve/v1/session",
};

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = join(GOC, "_acceptance/thu-lai-sau-45-giay/evidence");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const m = okrSoanMessages("vi");
const KY = idMau("chu-ky", DO.chuKy);
const PHONG = idMau("pb", DO.phong.ma);
const KIEM_DO_DO = process.argv.includes("--kiem-do-do");

const dong = [];
let sai = 0;
let trinhDuyet = null;
function kiem(nhan, dat) {
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhan}`);
	if (!dat) sai += 1;
}

const nhatKy = [];
const dangGiu = new Map();
const mocDo = new Map();
const tinMo = new Map();
let soPhien = 0;

function ghi(phien, loai, trangThai) {
	nhatKy.push({ luc: Date.now(), phien, loai, trangThai });
	return trangThai;
}

function suKien(phien, i, type, data) {
	return `${JSON.stringify({
		type,
		data,
		meta: { id: `${phien}-${i}`, createdAt: new Date().toISOString() },
	})}\n`;
}

function luong(phien, batDau) {
	const ma = new TextEncoder();
	let hen = null;
	let daDong = false;
	return new ReadableStream({
		start(dk) {
			dangGiu.set(phien, () => {
				if (hen) clearInterval(hen);
				if (daDong) return;
				daDong = true;
				dk.close();
			});
			if (batDau > 0) return;
			const luot = `luot-${phien}`;
			dk.enqueue(ma.encode(suKien(phien, 1, "session.started", {})));
			dk.enqueue(
				ma.encode(
					suKien(phien, 2, "message.received", {
						message: tinMo.get(phien) ?? "",
						sequence: 1,
						turnId: luot,
					}),
				),
			);
			dk.enqueue(
				ma.encode(
					suKien(phien, 3, "turn.started", { sequence: 2, turnId: luot }),
				),
			);
			if (!KIEM_DO_DO) return;
			let i = 3;
			hen = setInterval(() => {
				i += 1;
				dk.enqueue(
					ma.encode(
						suKien(phien, i, "step.started", {
							sequence: i,
							stepIndex: i,
							turnId: luot,
						}),
					),
				);
			}, DO.nhipKiemDoDoMs);
		},
		cancel() {
			daDong = true;
			if (hen) clearInterval(hen);
		},
	});
}

const mayGia = Bun.serve({
	port: DO.congMayGia,
	idleTimeout: 0,
	async fetch(req) {
		const duong = new URL(req.url).pathname;
		if (req.method === "POST" && duong === DO.tienTo) {
			soPhien += 1;
			const phien = `phien-gia-${soPhien}-${Date.now()}`;
			const than = await req.json().catch(() => ({}));
			tinMo.set(phien, typeof than.message === "string" ? than.message : "");
			ghi(phien, "mo", 202);
			return Response.json(
				{ ok: true, sessionId: phien, continuationToken: `eve:${phien}` },
				{ status: 202, headers: { "x-eve-session-id": phien } },
			);
		}
		const khop = duong.match(
			/^\/eve\/v1\/session\/([^/]+)(\/stream|\/cancel)?$/,
		);
		if (!khop) return new Response("", { status: 404 });
		const phien = decodeURIComponent(khop[1]);
		if (khop[2] === "/stream") {
			const batDau = Number(
				new URL(req.url).searchParams.get("startIndex") ?? 0,
			);
			ghi(phien, `luong@${batDau}`, 200);
			return new Response(luong(phien, batDau), {
				status: 200,
				headers: { "content-type": "application/x-ndjson" },
			});
		}
		if (khop[2] === "/cancel") {
			ghi(phien, "huy-nhan", 0);
			await new Promise((xong) => setTimeout(xong, DO.doHuyMs));
			mocDo.set(phien, Date.now());
			dangGiu.get(phien)?.();
			ghi(phien, "huy-tra", 200);
			return Response.json({ ok: true, sessionId: phien, status: "accepted" });
		}
		const daDo = mocDo.get(phien);
		const truocMoc = daDo === undefined || Date.now() < daDo;
		if (truocMoc) {
			ghi(phien, "gui-lai", 409);
			return Response.json(
				{ error: "eve session is already processing a turn." },
				{ status: 409 },
			);
		}
		ghi(phien, "gui-lai", 202);
		return Response.json(
			{ ok: true, sessionId: phien, continuationToken: `eve:${phien}` },
			{ status: 202, headers: { "x-eve-session-id": phien } },
		);
	},
});

async function dongHet() {
	await trinhDuyet?.close().catch(() => {});
	mayGia.stop(true);
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
async function choDen(dieuKien, choMs) {
	const het = Date.now() + choMs;
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
dong.push(
	`KHO ${new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "")}`,
);

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
		sessionId: `${PHIEN_CHO_EVE}do-tl45-${ten}-${Date.now()}`,
		nac: "bat",
	});
	dong.push(`GIEO cuoc ${c.id} (${ten}) soLuot ${c.soLuot}`);
	return c;
}

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

async function layMau(p, phien, tenKho) {
	const mau = [];
	let chupLuc = null;
	const het = Date.now() + DO.choGuiLaiMs;
	while (Date.now() < het) {
		const coO = await p.$('[data-luot="loi"]').then((o) => o !== null);
		mau.push({ luc: Date.now(), coO });
		if (chupLuc === null && mau.length === 2) {
			chupLuc = Date.now();
			await chup(p, `E7-cho-khep-${tenKho}`);
		}
		if (
			nhatKy.some(
				(n) => n.phien === phien && n.loai === "gui-lai" && n.trangThai === 202,
			)
		)
			break;
		await tre(DO.mauMs);
	}
	return { mau, chupLuc };
}

async function doKho(kho, slug) {
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
	const loiTrang = [];
	p.on("console", (x) => {
		if (x.type() === "error" || x.type() === "warn")
			loiTrang.push(x.text().slice(0, 300));
	});
	p.on("pageerror", (x) => loiTrang.push(`pageerror ${x.message}`));
	const truocMo = nhatKy.length;
	await p.goto(
		`${APP}/${slug}/okr/theo-don-vi?kyOkr=${KY}&donOkr=pb:${PHONG}&cuocSoan=${cuoc.id}`,
		{ waitUntil: "networkidle2" },
	);
	const qua45s = await choDen(
		async () => (await chuLoi(p)).includes(m.hoiThoai.loiMoTa),
		DO.cho45sMs,
	);
	if (!qua45s) {
		kiem(`khong thay qua 45 giay: ${kho.ten}`, false);
		if (!KIEM_DO_DO) {
			await chup(p, `E7-khong-45s-${kho.ten}`);
			const chu = await p
				.$eval("[data-man-soan]", (o) => o.innerText)
				.catch(() => "(khong co data-man-soan)");
			dong.push(`MAN ${kho.ten}: ${chu.replace(/\s+/g, " ").slice(0, 600)}`);
			for (const l of loiTrang) dong.push(`CONSOLE ${kho.ten}: ${l}`);
		}
		await ctx.close();
		return;
	}
	kiem(`${kho.ten}: thay cau qua 45 giay`, true);
	const mo = nhatKy.slice(truocMo).find((n) => n.loai === "mo");
	if (!mo) {
		kiem(`${kho.ten}: tro ly gia khong nhan POST mo phien`, false);
		await ctx.close();
		return;
	}
	const phien = mo.phien;
	kiem(
		`${kho.ten}: khong tran ngang (qua 45s) ${await tranNgang(p)}`,
		(await tranNgang(p)) <= 0,
	);
	await chup(p, `E7-qua-45s-${kho.ten}`);
	const bam = Date.now();
	await p.click('[data-nut="thu-lai"]');
	const { mau, chupLuc } = await layMau(p, phien, kho.ten);
	const cuaPhien = nhatKy.filter((n) => n.phien === phien);
	const huy = cuaPhien.filter((n) => n.loai === "huy-nhan");
	kiem(
		`${kho.ten}: tro ly gia nhan ${huy.length} yeu cau huy`,
		huy.length === 1,
	);
	const doLuc = mocDo.get(phien);
	const traHuy = cuaPhien.filter((n) => n.loai === "huy-tra");
	kiem(
		`${kho.ten}: tro ly gia tra ${traHuy.length} hoi am huy 200 accepted`,
		traHuy.length === 1 && traHuy[0].trangThai === 200,
	);
	kiem(
		`${kho.ten}: moc do = nhan huy + ${doLuc && huy[0] ? doLuc - huy[0].luc : "?"} ms`,
		doLuc !== undefined &&
			huy[0] !== undefined &&
			doLuc - huy[0].luc >= DO.doHuyMs,
	);
	const tuChoi = cuaPhien.filter(
		(n) => n.loai === "gui-lai" && n.trangThai === 409,
	);
	kiem(
		`${kho.ten}: ${tuChoi.length} POST gui lai truoc moc do bi tra 409, deu truoc moc`,
		tuChoi.every((n) => doLuc === undefined || n.luc < doLuc),
	);
	const nhan = cuaPhien.filter(
		(n) => n.loai === "gui-lai" && n.trangThai === 202,
	);
	kiem(
		`${kho.ten}: ${nhan.length} POST gui lai 202, sau moc do ${nhan[0] && doLuc ? nhan[0].luc - doLuc : "?"} ms`,
		nhan.length === 1 && doLuc !== undefined && nhan[0].luc >= doLuc,
	);
	const giua = mau.filter(
		(x) => x.luc >= bam && (!nhan[0] || x.luc <= nhan[0].luc),
	);
	kiem(
		`${kho.ten}: ${giua.length} mau giua bam va gui lai, ${giua.filter((x) => x.coO).length} thay bao loi`,
		giua.length >= DO.soMauToiThieu && giua.every((x) => x.coO),
	);
	kiem(
		`${kho.ten}: anh cho khep chup truoc moc do`,
		chupLuc !== null && doLuc !== undefined && chupLuc < doLuc,
	);
	kiem(
		`${kho.ten}: khong tran ngang (cho khep) ${await tranNgang(p)}`,
		(await tranNgang(p)) <= 0,
	);
	await ctx.close();
}

mkdirSync(RA, { recursive: true });
const slug = await suySlug();
if (!slug) await khongDo(`${APP}/ khong chuyen toi trang cua workspace`);
trinhDuyet = await puppeteer.launch({
	executablePath: DO.chrome,
	headless: true,
});

try {
	for (const kho of DO.kho) await doKho(kho, slug);
} catch (loi) {
	await khongDo(`tl45: ${loi?.message ?? loi}`);
}
for (const n of nhatKy)
	dong.push(
		`NHAT KY ${new Date(n.luc).toISOString()} ${n.phien} ${n.loai} ${n.trangThai}`,
	);
await ket(sai === 0 ? 0 : 1);
