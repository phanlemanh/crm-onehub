import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { okrSoanMessages } from "../../../apps/app/lib/messages/okr-soan.ts";
import { OKR_SOAN_CUA } from "../../../apps/app/lib/okr-soan-record.ts";
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
	choTraLoiMs: 10 * GIAY_MS,
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
const soPhien = new Map();
let demPhien = 0;
const TRA_LOI_MOI = "Câu trả lời của lượt mới (Trợ lý giả)";

function ghi(phien, loai, trangThai, them = {}) {
	nhatKy.push({ luc: Date.now(), phien, loai, trangThai, ...them });
	return trangThai;
}

function phienGia(phien) {
	if (!soPhien.has(phien))
		soPhien.set(phien, {
			so: [],
			nghe: new Set(),
			token: `eve:${phien}:0`,
			soLuot: 0,
			mocDo: null,
			hen: null,
		});
	return soPhien.get(phien);
}

function themSuKien(phien, type, data) {
	const p = phienGia(phien);
	p.so.push({
		type,
		data,
		meta: { id: `${phien}-${p.so.length}`, at: new Date().toISOString() },
	});
	for (const f of p.nghe) f();
}

function batDauLuot(phien, tin) {
	const p = phienGia(phien);
	p.soLuot += 1;
	const luot = `luot-${p.soLuot}`;
	themSuKien(phien, "message.received", {
		message: tin,
		sequence: 0,
		turnId: luot,
	});
	themSuKien(phien, "turn.started", { sequence: 1, turnId: luot });
	if (KIEM_DO_DO) {
		let i = 1;
		p.hen = setInterval(() => {
			i += 1;
			themSuKien(phien, "step.started", {
				sequence: i,
				stepIndex: i,
				turnId: luot,
			});
		}, DO.nhipKiemDoDoMs);
	}
	return luot;
}

function luong(phien, tu, signal) {
	const p = phienGia(phien);
	const ma = new TextEncoder();
	let da = tu;
	let nghe = null;
	const dongLai = () => {
		if (nghe) p.nghe.delete(nghe);
		nghe = null;
	};
	return new ReadableStream({
		start(dk) {
			nghe = () => {
				while (da < p.so.length) {
					dk.enqueue(ma.encode(`${JSON.stringify(p.so[da])}\n`));
					da += 1;
				}
			};
			p.nghe.add(nghe);
			nghe();
			signal.addEventListener("abort", () => {
				if (!nghe) return;
				ghi(phien, `dong@${tu}`, 0);
				dongLai();
			});
		},
		cancel() {
			if (!nghe) return;
			ghi(phien, `dong@${tu}`, 0);
			dongLai();
		},
	});
}

const mayGia = Bun.serve({
	port: DO.congMayGia,
	idleTimeout: 0,
	async fetch(req) {
		const duong = new URL(req.url).pathname;
		if (req.method === "POST" && duong === DO.tienTo) {
			demPhien += 1;
			const phien = `phien-gia-${demPhien}-${Date.now()}`;
			const than = await req.json();
			batDauLuot(phien, String(than.message ?? ""));
			ghi(phien, "mo", 202);
			return Response.json(
				{
					ok: true,
					sessionId: phien,
					continuationToken: phienGia(phien).token,
				},
				{ status: 202, headers: { "x-eve-session-id": phien } },
			);
		}
		const khop = duong.match(
			/^\/eve\/v1\/session\/([^/]+)(\/stream|\/cancel)?$/,
		);
		if (!khop) return new Response("", { status: 404 });
		const phien = decodeURIComponent(khop[1]);
		const p = phienGia(phien);
		if (khop[2] === "/stream") {
			const tu = Number(new URL(req.url).searchParams.get("startIndex") ?? 0);
			ghi(phien, `luong@${tu}`, 200);
			return new Response(luong(phien, tu, req.signal), {
				status: 200,
				headers: { "content-type": "application/x-ndjson" },
			});
		}
		if (khop[2] === "/cancel") {
			const than = await req.json();
			ghi(phien, "huy", 202, { turnId: than.turnId ?? null });
			setTimeout(() => {
				if (p.hen) clearInterval(p.hen);
				p.token = `eve:${phien}:${p.soLuot}`;
				p.mocDo = Date.now();
				themSuKien(phien, "turn.cancelled", {
					sequence: 2,
					turnId: `luot-${p.soLuot}`,
				});
				themSuKien(phien, "session.waiting", {
					continuationToken: p.token,
					wait: "next-user-message",
				});
				ghi(phien, "moc-do", 0);
			}, DO.doHuyMs);
			return Response.json(
				{ ok: true, sessionId: phien, status: "accepted" },
				{ status: 202, headers: { "x-eve-session-id": phien } },
			);
		}
		const than = await req.json();
		const hopLe = p.mocDo !== null && than.continuationToken === p.token;
		if (!hopLe) {
			ghi(phien, "gui-lai", 409, { token: than.continuationToken });
			return Response.json(
				{ ok: false, error: "eve session is already processing a turn." },
				{ status: 409 },
			);
		}
		ghi(phien, "gui-lai", 200, { token: than.continuationToken });
		const luot = batDauLuot(phien, String(than.message ?? ""));
		setTimeout(() => {
			themSuKien(phien, "message.completed", {
				message: TRA_LOI_MOI,
				finishReason: "stop",
				sequence: 2,
				stepIndex: 0,
				turnId: luot,
			});
			themSuKien(phien, "session.waiting", {
				continuationToken: p.token,
				wait: "next-user-message",
			});
		}, 300);
		return Response.json(
			{ ok: true, sessionId: phien },
			{ status: 200, headers: { "x-eve-session-id": phien } },
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

async function gieoCuoc(ten, sessionId) {
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
		sessionId: sessionId ?? `${PHIEN_CHO_EVE}do-tl45-${ten}-${Date.now()}`,
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

const daGuiLai = (phien) =>
	nhatKy.find(
		(n) => n.phien === phien && n.loai === "gui-lai" && n.trangThai === 200,
	);

const GHI_TRANG = () => {
	const dauVet = { mau: [], bam: null, guiLai: null, hen: null };
	window.__tl45 = dauVet;
	const fetchCu = window.fetch;
	window.fetch = function (input, init) {
		const url = new URL(
			input instanceof Request ? input.url : String(input),
			location.href,
		);
		const phuongThuc =
			init?.method ?? (input instanceof Request ? input.method : "GET");
		if (
			dauVet.bam !== null &&
			dauVet.guiLai === null &&
			phuongThuc === "POST" &&
			/\/eve\/v1\/session\/[^/]+$/.test(url.pathname)
		)
			dauVet.guiLai = performance.now();
		return fetchCu.apply(this, [input, init]);
	};
};

async function bamVaLayMau(p, phien, tenKho) {
	await p.evaluate((mauMs) => {
		const dauVet = window.__tl45;
		dauVet.bam = performance.now();
		dauVet.hen = setInterval(() => {
			dauVet.mau.push({
				t: performance.now(),
				coO: document.querySelector('[data-luot="loi"]') !== null,
			});
		}, mauMs);
	}, DO.mauMs);
	await p.click('[data-nut="thu-lai"]');
	await tre(2 * DO.mauMs);
	const chupLuc = Date.now();
	await chup(p, `E7-cho-khep-${tenKho}`);
	await choDen(async () => daGuiLai(phien) !== undefined, DO.choGuiLaiMs);
	const dauVet = await p.evaluate(() => {
		const d = window.__tl45;
		clearInterval(d.hen);
		return { mau: d.mau, bam: d.bam, guiLai: d.guiLai };
	});
	return { ...dauVet, chupLuc };
}

async function doiChungDongLuong() {
	const phien = `phien-doi-chung-${Date.now()}`;
	const cuoc = await gieoCuoc("doi-chung", phien);
	themSuKien(phien, "session.started", {});
	const huy = new AbortController();
	const res = await fetch(
		`${APP}/eve/agents/okr/eve/v1/session/${phien}/stream`,
		{
			headers: {
				cookie: `${tl.ten}=${tl.gia}; lang=vi`,
				[OKR_SOAN_CUA.header]: cuoc.id,
			},
			signal: huy.signal,
		},
	);
	const doc = res.body?.getReader();
	await doc?.read().catch(() => null);
	await tre(GIAY_MS);
	huy.abort();
	const thay = await choDen(
		async () =>
			nhatKy.some((n) => n.phien === phien && n.loai.startsWith("dong@")),
		3 * GIAY_MS,
	);
	kiem(
		`doi chung: cua tra ${res.status}, tro ly gia ghi duoc luc dong luong`,
		thay,
	);
	if (!thay)
		await khongDo(
			"tro ly gia khong thay luc mot luong bi dong — phep do 'luong cu khong bi cat' vo nghia o may nay",
		);
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
	await p.evaluateOnNewDocument(GHI_TRANG);
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
	const luotCu = `luot-${phienGia(phien).soLuot}`;
	kiem(
		`${kho.ten}: khong tran ngang (qua 45s) ${await tranNgang(p)}`,
		(await tranNgang(p)) <= 0,
	);
	await chup(p, `E7-qua-45s-${kho.ten}`);
	const { mau, bam, guiLai, chupLuc } = await bamVaLayMau(p, phien, kho.ten);
	const cuaPhien = nhatKy.filter((n) => n.phien === phien);
	const huy = cuaPhien.filter((n) => n.loai === "huy");
	kiem(
		`${kho.ten}: tro ly gia nhan ${huy.length} yeu cau huy, turnId ${huy[0]?.turnId ?? "khong co"} (dang chay ${luotCu}), tra 202`,
		huy.length === 1 && huy[0].turnId === luotCu && huy[0].trangThai === 202,
	);
	const doLuc = phienGia(phien).mocDo;
	kiem(
		`${kho.ten}: moc do = nhan huy + ${doLuc && huy[0] ? doLuc - huy[0].luc : "?"} ms`,
		doLuc !== null && huy[0] !== undefined && doLuc - huy[0].luc >= DO.doHuyMs,
	);
	const catSom = cuaPhien.filter(
		(n) => n.loai === "dong@0" && (doLuc === null || n.luc < doLuc),
	);
	kiem(
		`${kho.ten}: luong cu bi dong truoc moc do ${catSom.length} lan`,
		catSom.length === 0,
	);
	const tuChoi = cuaPhien.filter(
		(n) => n.loai === "gui-lai" && n.trangThai === 409,
	);
	kiem(
		`${kho.ten}: ${tuChoi.length} POST gui lai bi tra 409 (truoc moc do hay token cu)`,
		true,
	);
	const nhan = cuaPhien.filter(
		(n) => n.loai === "gui-lai" && n.trangThai === 200,
	);
	kiem(
		`${kho.ten}: ${nhan.length} POST gui lai 200, sau moc do ${nhan[0] && doLuc ? nhan[0].luc - doLuc : "?"} ms, token ${nhan[0]?.token === phienGia(phien).token ? "moi" : "cu"}`,
		nhan.length === 1 &&
			doLuc !== null &&
			nhan[0].luc >= doLuc &&
			nhan[0].token === phienGia(phien).token,
	);
	const giua = mau.filter((x) => x.t >= bam && guiLai !== null && x.t < guiLai);
	kiem(
		`${kho.ten}: trinh duyet gui lai ${guiLai === null ? "khong ghi duoc" : `sau bam ${Math.round(guiLai - bam)} ms`}; ${giua.length} mau truoc do, ${giua.filter((x) => x.coO).length} thay bao loi`,
		guiLai !== null &&
			giua.length >= DO.soMauToiThieu &&
			giua.every((x) => x.coO),
	);
	kiem(
		`${kho.ten}: anh cho khep chup truoc moc do`,
		chupLuc !== null && doLuc !== null && chupLuc < doLuc,
	);
	const thayTraLoi = await choDen(
		async () =>
			(
				await p.$eval("[data-man-soan]", (o) => o.innerText).catch(() => "")
			).includes(TRA_LOI_MOI),
		DO.choTraLoiMs,
	);
	kiem(`${kho.ten}: cau tra loi luot moi hien tren man`, thayTraLoi);
	kiem(
		`${kho.ten}: bao loi da tat sau tra loi moi`,
		(await p.$('[data-luot="loi"]')) === null,
	);
	await chup(p, `E7-tra-loi-moi-${kho.ten}`);
	kiem(
		`${kho.ten}: khong tran ngang (tra loi moi) ${await tranNgang(p)}`,
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
	await doiChungDongLuong();
	for (const kho of DO.kho) await doKho(kho, slug);
} catch (loi) {
	await khongDo(`tl45: ${loi?.message ?? loi}`);
}
for (const n of nhatKy)
	dong.push(
		`NHAT KY ${new Date(n.luc).toISOString()} ${n.phien} ${n.loai} ${n.trangThai}${n.turnId ? ` turnId=${n.turnId}` : ""}${n.token ? ` token=${n.token}` : ""}`,
	);
await ket(sai === 0 ? 0 : 1);
