import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { idMau, OKR_MAU } from "../../../apps/api/scripts/okr-mau/cau-hinh.ts";
import { okrMessages } from "../../../apps/app/lib/messages/okr.ts";
import { SEARCH_PARAM } from "../../../apps/app/lib/search-param-keys.ts";
import { db } from "../../../packages/db/src/index.ts";
import {
	APP,
	CHROME,
	datTrinhDuyet,
	khongDo,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	GOC,
	phienCua,
	trpcCua,
} from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";

const HO_SO = "hop-tuan-tren-bang";
const { z } = createRequire(join(GOC, "packages/validation/package.json"))(
	"zod",
);
const GIAY_MS = 1000;
export const DO = {
	kho: [
		{ ten: "1440", rong: 1440, cao: 900, loai: "tu-lg" },
		{ ten: "768", rong: 768, cao: 1024, loai: "md-lg" },
		{ ten: "375", rong: 375, cao: 812, loai: "duoi-md" },
	],
	theme: [
		{ ten: "sang", toi: false },
		{ ten: "toi", toi: true },
	],
	cho: {
		taiMs: 90 * GIAY_MS,
		dieuHuongMs: 45 * GIAY_MS,
		onDinhMs: 1500,
		nhipMs: 250,
		cuonMs: 300,
		guiMs: 30 * GIAY_MS,
	},
	cuon: { soLan: 12, lePx: 40 },
	soAnh: 12,
	lechPx: 1,
	khoiTran: 4000,
	conLaiToiThieu: 2,
	dongToiThieu: 3,
	ghiChuDai: 180,
	buocChia: 20,
	maP: "cham-soc",
};
export const THAM = {
	ky: SEARCH_PARAM.okr.ky,
	don: SEARCH_PARAM.okr.don,
	xem: SEARCH_PARAM.okr.xem,
};
export const HOP = "hop-tuan";
export const CHU_TU_TIN = okrMessages("vi").capNhat.mucTuTin;
const AN_CONG_CU_DEV =
	".tsqd-parent-container, .tsqd-open-btn-container, nextjs-portal { display: none !important; }";
const caHopTuan = z.object({
	truongP: z.string().min(1),
	thanhVienM: z.string().min(1),
	quanTriA: z.string().min(1),
	boP: z.string().startsWith("pb:"),
	boRong: z.string().startsWith("pb:"),
	chuKyCon: z.string().min(1),
	chuKyKeHoach: z.string().min(1),
});
const DA_THONG_CONG = new Set(["signed-off", "machine-cleared"]);
const trangThaiHopDong = (
	readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8").match(
		/^status:\s*(\S+)/m,
	)?.[1] ?? ""
).trim();
export const BANG_CHUNG =
	process.env.BANG_CHUNG ??
	(DA_THONG_CONG.has(trangThaiHopDong)
		? join(GOC, ".acceptance-runs", HO_SO, "evidence")
		: join(GOC, "_acceptance", HO_SO, "evidence"));

export const nghi = (ms) => new Promise((xong) => setTimeout(xong, ms));
export const giaTriCo = (co) => {
	const i = process.argv.indexOf(co);
	return i === -1 ? undefined : process.argv[i + 1];
};

const dem = { dung: 0, sai: 0 };
export const ketQua = () => ({ ...dem });
export function dong(ac, dat, ten, chu) {
	if (dat) dem.dung += 1;
	else dem.sai += 1;
	console.log(dat ? `DUNG ${ten}: ${chu}` : `SAI ${ac}: ${ten} ${chu}`);
}

let trinhDuyet = null;
export async function moTrinhDuyet() {
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	datTrinhDuyet(trinhDuyet);
}
export async function moTrang(cookie, duong, kho, toi, truocKhiMo) {
	const ctx = await trinhDuyet.createBrowserContext();
	const t = await ctx.newPage();
	const host = new URL(APP).hostname;
	await t.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	await t.setViewport({ width: kho.rong, height: kho.cao });
	await t.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: toi ? "dark" : "light" },
	]);
	await t.evaluateOnNewDocument(
		(css, laToi) => {
			document.addEventListener("DOMContentLoaded", () => {
				const s = document.createElement("style");
				s.textContent = css;
				document.head.appendChild(s);
				if (laToi) {
					document.documentElement.classList.add("dark");
					document.documentElement.style.colorScheme = "dark";
				}
			});
		},
		AN_CONG_CU_DEV,
		toi,
	);
	if (truocKhiMo) await truocKhiMo(t);
	await t.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: DO.cho.taiMs,
	});
	const dich = new URL(t.url()).pathname;
	if (dich.startsWith("/sign-in") || dich.includes("/onboarding"))
		await khongDo(`KHONG DO DUOC: ${duong} bi day ve ${dich}`);
	await t.bringToFront();
	return t;
}

export const dongTrang = (t) => t.browserContext().close();

export async function cho(t, chon, ms = DO.cho.taiMs) {
	const thay = await t
		.waitForFunction(
			(c) =>
				[...document.querySelectorAll(c)].some(
					(el) =>
						el.getClientRects().length > 0 &&
						getComputedStyle(el).visibility !== "hidden" &&
						Object.keys(el).some((k) => k.startsWith("__reactFiber")),
				),
			{ timeout: ms, polling: DO.cho.nhipMs },
			chon,
		)
		.then(() => true)
		.catch(() => false);
	await nghi(DO.cho.onDinhMs);
	return thay;
}

export async function choHet(t, chon, ms = DO.cho.dieuHuongMs) {
	return t
		.waitForFunction(
			(c) => document.querySelectorAll(c).length === 0,
			{
				timeout: ms,
				polling: DO.cho.nhipMs,
			},
			chon,
		)
		.then(() => true)
		.catch(() => false);
}

export async function choUrl(t, kiem, ms = DO.cho.dieuHuongMs) {
	return t
		.waitForFunction(
			(k) => {
				const q = new URL(location.href).searchParams;
				return Object.entries(k).every(([khoa, gia]) =>
					gia === null ? !q.has(khoa) : q.get(khoa) === gia,
				);
			},
			{ timeout: ms, polling: DO.cho.nhipMs },
			kiem,
		)
		.then(() => true)
		.catch(() => false);
}

export async function bam(t, chon) {
	await t
		.evaluate((c) => {
			const el = [...document.querySelectorAll(c)].find(
				(e) => e.getClientRects().length > 0,
			);
			el?.scrollIntoView({ block: "center", inline: "center" });
		}, chon)
		.catch(() => {});
	await nghi(DO.cho.cuonMs);
	for (let i = 0; i < DO.cuon.soLan; i += 1) {
		const r = await t.evaluate((c) => {
			const el = [...document.querySelectorAll(c)].find(
				(e) =>
					e.getClientRects().length > 0 &&
					getComputedStyle(e).visibility !== "hidden",
			);
			if (!el) return null;
			const b = el.getBoundingClientRect();
			return {
				x: b.left + b.width / 2,
				y: b.top + b.height / 2,
				tren: b.top,
				duoi: b.bottom,
				cao: window.innerHeight,
			};
		}, chon);
		if (r === null) return false;
		if (r.tren >= 0 && r.duoi <= r.cao) {
			await t.mouse.click(r.x, r.y);
			return true;
		}
		await t.mouse.move(r.x, r.cao / 2);
		await t.mouse.wheel({
			deltaY:
				r.tren < 0 ? r.tren - DO.cuon.lePx : r.duoi - r.cao + DO.cuon.lePx,
		});
		await nghi(DO.cho.cuonMs);
	}
	return false;
}

export async function bamChu(t, chon, chu) {
	const ok = await t.evaluate(
		(c, ch) => {
			const el = [...document.querySelectorAll(c)].find(
				(e) => e.textContent.trim() === ch,
			);
			if (!el) return false;
			el.setAttribute("data-htb-bam", "");
			return true;
		},
		chon,
		chu,
	);
	if (!ok) return false;
	const r = await bam(t, "[data-htb-bam]");
	await t.evaluate(() =>
		document.querySelector("[data-htb-bam]")?.removeAttribute("data-htb-bam"),
	);
	return r;
}

export async function go(t, chon, chu) {
	await t.click(chon, { count: 3 });
	await t.keyboard.press("Backspace");
	await t.type(chon, chu);
}

export const DOC_SO = () => {
	const o = document.querySelector(
		"[data-hang-so-hop]:not([aria-busy]) [data-o-so='da-cap-nhat']",
	);
	return o?.children[1]?.children[0]?.textContent.trim() ?? null;
};

export const DOC_DONG = () =>
	[...document.querySelectorAll("[data-kr-hop]")]
		.filter((el) => el.getClientRects().length > 0)
		.map((el) => ({
			id: el.getAttribute("data-kr-hop"),
			phan: el.closest("[data-con-lai]") ? "con-lai" : "dang-ban",
		}));

export async function choBo(t, tenBo) {
	await t
		.waitForFunction(
			(ten) =>
				document
					.querySelector(
						"[data-vi-tri-bo='mot-bo'] [data-slot='breadcrumb-page']",
					)
					?.textContent.trim() === ten,
			{ timeout: DO.cho.dieuHuongMs, polling: DO.cho.nhipMs },
			tenBo,
		)
		.catch(() => {});
	await nghi(DO.cho.onDinhMs);
}

export function duongBo(n, xem) {
	const q = new URLSearchParams({
		[THAM.don]: n.boP,
		[THAM.ky]: n.cur,
	});
	if (xem) q.set(THAM.xem, xem);
	return `/${n.slug}/okr/bo-okr?${q}`;
}

export function duongHop(n) {
	const q = new URLSearchParams({
		[THAM.don]: n.boP,
		[THAM.xem]: HOP,
		[THAM.ky]: n.cur,
	});
	return `/${n.slug}/okr/bo-okr?${q}`;
}

export function napCa() {
	const nap = spawnSync(
		"bun",
		["scripts/okr-mau.ts", OKR_MAU.co.ca, OKR_MAU.caHopTuan.ten],
		{ cwd: join(GOC, "apps", "api"), env: process.env, encoding: "utf8" },
	);
	const dongRa = (nap.stdout ?? "").trim().split("\n");
	const cuoi = dongRa.at(-1) ?? "";
	console.log(
		`nap bo OKR mau + ca hop-tuan: ma ${nap.status} — ${dongRa.at(-2)?.slice(0, 120) ?? ""}`,
	);
	if (nap.status !== 0) {
		console.log((nap.stderr ?? "").trim().split("\n").slice(-6).join("\n"));
		return null;
	}
	try {
		const ca = caHopTuan.safeParse(JSON.parse(cuoi));
		return ca.success ? ca.data : null;
	} catch {
		return null;
	}
}

export async function lanCua(keyResultId) {
	const ds = await db.okrCheckIn.findMany({
		where: { keyResultId },
		orderBy: { createdAt: "asc" },
		select: {
			id: true,
			value: true,
			note: true,
			confidence: true,
			weekStart: true,
			createdAt: true,
		},
	});
	return ds.map((l) => ({
		id: l.id,
		giaTri: Number(l.value),
		ghiChu: l.note,
		tuTin: l.confidence,
		tuan: l.weekStart.toISOString().slice(0, 10),
		luc: l.createdAt,
	}));
}

export async function krCuaP(pbId, cycleId) {
	return db.okrKeyResult.findMany({
		where: {
			objective: {
				cycleId,
				departmentId: pbId,
				level: "phong-ban",
				status: "cong-bo",
			},
		},
		orderBy: [{ objective: { position: "asc" } }, { position: "asc" }],
		select: {
			id: true,
			title: true,
			source: true,
			kind: true,
			currentValue: true,
			startValue: true,
			targetValue: true,
			ownerUserId: true,
		},
	});
}

export const GHI_CHU_DAI =
	"Đối tác miền Trung chậm ký phụ lục giá, cần trưởng phòng gặp trực tiếp tuần này để chốt chiết khấu bậc hai và lịch giao hàng quý tới; nếu trượt thì chỉ tiêu quý bốn hụt khoảng mười lăm phần trăm.";

async function gui(api, muc) {
	const { sessionId } = await api.lam("okr.moCapNhat", { entry: "sheet" });
	await api.lam("okr.guiCapNhat", { sessionId, items: muc });
}

export function buocCua(kr) {
	const tam = Math.abs(Number(kr.targetValue) - Number(kr.startValue));
	return Math.max(1, Math.round(tam / DO.buocChia));
}

export function giaTriMoiCua(kr, truoc) {
	const len = Math.floor(truoc) + buocCua(kr);
	const tran = kr.kind === "phan-tram" ? 100 : Number.POSITIVE_INFINITY;
	return len <= tran ? len : Math.max(0, Math.floor(truoc) - buocCua(kr));
}

export const tuanTruocCua = (lan, tuan) => lan.filter((l) => l.tuan < tuan);

async function gieoThem(n, hopTruoc) {
	const tuan = hopTruoc.tuan;
	const kr = await krCuaP(n.pb.id, n.cur);
	const theoId = new Map(kr.map((k) => [k.id, k]));
	const lan = new Map(
		await Promise.all(kr.map(async (k) => [k.id, await lanCua(k.id)])),
	);
	const a = hopTruoc.conLai
		.map((d) => theoId.get(d.keyResultId))
		.find(
			(k) =>
				k &&
				k.source === "tay" &&
				k.kind !== "moc" &&
				lan.get(k.id).some((l) => l.tuan === tuan) &&
				tuanTruocCua(lan.get(k.id), tuan).length > 0,
		);
	if (!a)
		await khongDo(
			`KHONG DO DUOC: ${n.pb.name} khong co KR nhap tay o Con lai da cap nhat tuan nay va tuan truoc de gieo lan thu hai`,
		);
	const l = lan.get(a.id);
	const truoc = l.at(-1).giaTri;
	const moi = giaTriMoiCua(a, truoc);
	const tuTin = tuanTruocCua(l, tuan).at(-1).tuTin;
	await gui(n.api, [
		{ keyResultId: a.id, value: moi, confidence: tuTin, note: GHI_CHU_DAI },
	]);
	console.log(
		`gieo them qua okr.guiCapNhat (truong P): KR ${a.id} lan thu hai tuan ${tuan} (${truoc} → ${moi}, tu tin ${tuTin}, ghi chu ${GHI_CHU_DAI.length} ky tu)`,
	);
	return { haiLan: a.id };
}

const hopCua = (n) =>
	n.api.hoi("okr.hopTuan", {
		cycleId: n.cur,
		unit: { loai: "pb", id: n.pb.id },
	});

function truongCua(maPb) {
	const congTy = JSON.parse(
		readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
	);
	const pb = congTy.phongBan.find((p) => p.ma === maPb);
	return pb ? `${pb.truong}@${OKR_MAU.mienThu}` : null;
}

export async function dungDuLieu() {
	const ca = napCa();
	if (!ca)
		await khongDo("KHONG DO DUOC: ca hop-tuan khong in dong JSON du khoa");
	const email = truongCua(DO.maP);
	if (!email)
		await khongDo(`KHONG DO DUOC: bo mau khong co phong ban ${DO.maP}`);
	const ck = phienCua(email);
	const api = trpcCua(ck);
	const [chuKy, cay, slug] = await Promise.all([
		api.hoi("okr.cycles"),
		api.hoi("org.tree"),
		suySlug(ck),
	]);
	const cur = chuKy.currentId;
	const pbId = idMau("pb", DO.maP);
	const moiPb = [
		...cay.divisions.flatMap((b) => b.departments),
		...cay.chuaXep,
	];
	const pb = moiPb.find((p) => p.id === pbId);
	if (!cur || !pb)
		await khongDo(`KHONG DO DUOC: thieu du lieu (ky ${cur}, P ${pbId})`);
	const n = { email, ck, api, slug, cur, pb, boP: `pb:${pbId}` };
	const gieo = await gieoThem(n, await hopCua(n));
	const hop = await hopCua(n);
	const lan = new Map(
		await Promise.all(
			[...hop.dangBan, ...hop.conLai].map(async (d) => [
				d.keyResultId,
				await lanCua(d.keyResultId),
			]),
		),
	);
	const haiLanTuan = [...lan].filter(
		([, l]) => l.filter((x) => x.tuan === hop.tuan).length >= 2,
	).length;
	const dai = [...hop.dangBan, ...hop.conLai].filter(
		(d) => (d.ghiChu ?? "").length >= DO.ghiChuDai,
	).length;
	console.log(
		`du lieu: P ${email} (${pb.name}) · ky ${cur} · tuan ${hop.tuan} · dang ban ${hop.dangBan.length} · con lai ${hop.conLai.length} · da cap nhat ${hop.daCapNhat}/${hop.tongKr} · KR hai lan tuan nay ${haiLanTuan} · ghi chu dai ${dai}`,
	);
	if (
		hop.conLai.length < DO.conLaiToiThieu ||
		hop.dangBan.length + hop.conLai.length < DO.dongToiThieu ||
		haiLanTuan === 0 ||
		dai === 0
	)
		await khongDo(
			"KHONG DO DUOC: bo mau khong du ca (can >=2 dong Con lai, >=3 dong, mot KR hai lan tuan nay, mot ghi chu dai)",
		);
	return { ...n, gieo, hop, lan, hopCua: () => hopCua(n) };
}
