import { setSystemTime } from "bun:test";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { okrToanCanhMessages } from "../../../apps/app/lib/messages/okr-toan-canh.ts";
import { messages } from "../../../packages/ui/src/lib/messages.ts";
import {
	batTacTu,
	cauThieuKhoa,
	chayTrongPhienCoTacTu,
	coKhoaMoHinh,
	GOC,
	idMau,
	laKhoDo,
	napBoMau,
	ngayVN,
	PHIEN_TRO_LY,
	phienCookie,
	thuMau,
	tre,
	trongPhienCoTacTu,
	trpc,
	truyVan,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { gioNhacSau } from "./gio-nhac.mjs";
import { docSo } from "./so-lech-lot.mjs";

const GIAY_MS = 1000;
const PHUT_MS = 60 * GIAY_MS;
const GIO_MS = 60 * PHUT_MS;
const NGAY_MS = 24 * GIO_MS;

const E9 = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: [
		{ rong: 1440, cao: 1000 },
		{ rong: 390, cao: 844 },
	],
	cho: {
		manMs: 60 * GIAY_MS,
		xaMs: 8 * PHUT_MS,
		goiLaiMs: 15 * GIAY_MS,
		lamMoiMs: 400,
		nhipMs: 2 * GIAY_MS,
		vetMs: 15 * GIAY_MS,
	},
	quanTri: "le-hai-dang",
	chuKy: "quy4",
	phong: { a: "kd-bac", b: "cham-soc" },
	gioNhac: { gio: 8, phut: 31, gioVN: 7 },
	xep: {
		loai: "okr-tom-tat-xep",
		loaiTomTat: "okr-tom-tat-tuan",
		uuTien: 90,
		hauTo: "do-man",
	},
	zaloGia: "Z-tts-e9",
	dongTomTat: /Tóm tắt tuần/,
	lenh: 'PHIEN_DO_TEN_CAY=tts-e9 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/tro-ly-okr-tom-tat/rang/man-tom-tat.mjs"',
	thongDiep: { khongCauCoSo: "khong cau co so" },
};

const THU_MUC = join(GOC, ".acceptance-runs/tro-ly-okr-tom-tat/man");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const m = okrToanCanhMessages("vi").tomTat;
const phanHoi = messages("vi").aiFeedback;
const KY = idMau("chu-ky", E9.chuKy);
const PB = { a: idMau("pb", E9.phong.a), b: idMau("pb", E9.phong.b) };
const bo = JSON.parse(
	readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
);
const truongCua = (ma) => bo.phongBan.find((p) => p.ma === ma)?.truong ?? "";

const dong = [];
let sai = 0;
let trinhDuyet = null;
let tacTu = null;
let buoc = "";

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	if (tacTu) await tacTu.dung();
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
	return dat;
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
	return dau &&
		!["onboarding", "sign-in", "het-quyen"].some((x) => dau.startsWith(x))
		? dau
		: null;
}

async function trang(cookie, { rong, cao }) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({ width: rong, height: cao, deviceScaleFactor: 1 });
	return { ctx, p, rong };
}

async function moiKho(cookie, lam) {
	for (const kho of E9.kho) {
		const t = await trang(cookie, kho);
		try {
			await lam(t);
		} finally {
			await t.ctx.close();
		}
	}
}

async function duaVaoKhung(p, chons) {
	return p.evaluate(async (dsChon) => {
		const khungDoc = (n) => {
			for (let x = n.parentElement; x; x = x.parentElement) {
				const o = getComputedStyle(x).overflowY;
				if ((o === "auto" || o === "scroll") && x.scrollHeight > x.clientHeight)
					return x;
			}
			return document.scrollingElement;
		};
		const veTrang = () =>
			new Promise((xong) =>
				requestAnimationFrame(() => requestAnimationFrame(xong)),
			);
		const dsNut = dsChon.map((c) => document.querySelector(c));
		if (dsNut.some((n) => n === null))
			return dsChon.map((c, i) => ({
				chon: c,
				thay: dsNut[i] !== null,
				vuaKhung: false,
			}));
		const goc = khungDoc(dsNut[0]);
		const cuaSo = () => {
			const r =
				goc === document.scrollingElement
					? { top: 0, bottom: innerHeight }
					: goc.getBoundingClientRect();
			return {
				top: Math.max(0, r.top),
				bottom: Math.min(innerHeight, r.bottom),
			};
		};
		const hop = () => {
			const rs = dsNut.map((n) => n.getBoundingClientRect());
			return {
				top: Math.min(...rs.map((r) => r.top)),
				bottom: Math.max(...rs.map((r) => r.bottom)),
			};
		};
		dsNut[0].scrollIntoView({ block: "center", behavior: "instant" });
		await veTrang();
		const h = hop();
		const k = cuaSo();
		const lech =
			h.bottom - h.top > k.bottom - k.top
				? h.top - k.top
				: (h.top + h.bottom) / 2 - (k.top + k.bottom) / 2;
		goc.scrollBy({ top: lech, behavior: "instant" });
		await veTrang();
		const k2 = cuaSo();
		return dsChon.map((c, i) => {
			const r = dsNut[i].getBoundingClientRect();
			return {
				chon: c,
				thay: true,
				vuaKhung: r.top >= k2.top - 1 && r.bottom <= k2.bottom + 1,
			};
		});
	}, chons);
}

async function chup({ p, rong }, ten, vung = []) {
	await tre(E9.cho.lamMoiMs);
	await p.evaluate(() => document.fonts.ready);
	if (vung.length > 0) {
		const kq = await duaVaoKhung(p, vung);
		kiem(
			`${ten} ${rong}: anh chua tron ${kq.map((k) => `${k.chon} ${k.vuaKhung}`).join(", ")}`,
			kq.every((k) => k.thay && k.vuaKhung),
		);
		await tre(E9.cho.lamMoiMs);
	}
	const tran = await p.evaluate(() => {
		const goc = document.documentElement;
		const hop = [
			...document.querySelectorAll('[role="dialog"], [data-the-trich-dan]'),
		].filter((d) => d.checkVisibility());
		return [
			{ o: "trang", sw: goc.scrollWidth, cw: goc.clientWidth },
			...hop.map((d) => ({ o: "hop", sw: d.scrollWidth, cw: d.clientWidth })),
		];
	});
	const tep = join(THU_MUC, `${ten}-${rong}.png`);
	await p.screenshot({
		path: tep,
		fullPage: vung.length === 0 && !tran.some((t) => t.o === "hop"),
	});
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
	kiem(
		`${ten} ${rong}: scrollWidth <= clientWidth (${tran.map((t) => `${t.o} ${t.sw}/${t.cw}`).join(", ")})`,
		tran.every((t) => t.sw <= t.cw),
	);
}

async function hien(p, chon, hanMs = E9.cho.manMs) {
	return p
		.waitForSelector(chon, { visible: true, timeout: hanMs })
		.then(() => true)
		.catch(() => false);
}

async function bam(p, chon) {
	const han = Date.now() + E9.cho.manMs;
	for (;;) {
		const h = await p.waitForSelector(chon, {
			visible: true,
			timeout: E9.cho.manMs,
		});
		try {
			await h.click();
			return;
		} catch (loi) {
			if (Date.now() > han) throw loi;
			await tre(E9.cho.lamMoiMs);
		}
	}
}

function duongHopTuan(pb) {
	const q = new URLSearchParams({
		kyOkr: KY,
		donOkr: `pb:${pb}`,
		xemOkr: "hop-tuan",
	});
	return `${APP}/${slug}/okr/theo-don-vi?${q}`;
}

const KHOI = '[data-khoi="tom-tat"]';

function thuISO(ngay) {
	const thu = new Date(`${ngay}T00:00:00Z`).getUTCDay();
	return ((thu + 6) % 7) + 1;
}

async function xepVaXa(url) {
	const homNay = ngayVN();
	const homQua = ngayVN(new Date(Date.now() - NGAY_MS));
	await truyVan(
		url,
		`UPDATE "okrCycle" SET "updateWeekday" = $1 WHERE id = $2`,
		[thuISO(homQua), KY],
	);
	dong.push(
		`GHI THANG kho do: chu ky ${E9.chuKy} doi ngay cap nhat sang thu ${thuISO(homQua)} (hom qua ${homQua}); dat mot viec xep den han ngay thay cho 06:00`,
	);
	const idXep = `${E9.xep.hauTo}-${Date.now().toString(36)}`;
	await truyVan(
		url,
		`INSERT INTO "agentTask" (id, kind, reason, priority, budget, subject, "dueAt", "createdAt")
		 VALUES ($1, $2, $2, $3, 0, $4, now() AT TIME ZONE 'UTC', now() AT TIME ZONE 'UTC')`,
		[
			idXep,
			E9.xep.loai,
			E9.xep.uuTien,
			`${E9.xep.loai}:${homNay}:${E9.xep.hauTo}`,
		],
	);
	const han = Date.now() + E9.cho.xaMs;
	let lanGoi = 0;
	for (;;) {
		if (Date.now() >= lanGoi + E9.cho.goiLaiMs) {
			const goi = await fetch(
				`${process.env.AGENT_URL}/internal/crm/dispatch`,
				{
					method: "POST",
					headers: {
						authorization: `Bearer ${process.env.AGENT_BRIDGE_SECRET}`,
					},
				},
			);
			if (goi.status !== 202)
				throw new Error(
					`goi dispatch cua tac tu tra ${goi.status}, khong phai 202`,
				);
			lanGoi = Date.now();
		}
		const [xep] = await truyVan(
			url,
			`SELECT outcome, "finishedAt" FROM "agentTask" WHERE id = $1`,
			[idXep],
		);
		const viec = await truyVan(
			url,
			`SELECT id, outcome, "finishedAt", payload ->> 'departmentId' AS phong, payload ->> 'nac' AS nac
			 FROM "agentTask" WHERE kind = $1 AND "createdAt" >= (now() AT TIME ZONE 'UTC') - interval '1 hour'`,
			[E9.xep.loaiTomTat],
		);
		const xong =
			xep?.finishedAt &&
			[PB.a, PB.b].every((pb) =>
				viec.some((v) => v.phong === pb && v.finishedAt),
			);
		if (xong || Date.now() > han) return { xep, viec };
		await tre(E9.cho.nhipMs);
	}
}

async function banCua(url, pb) {
	const [b] = await truyVan(
		url,
		`SELECT id, "trangThai", cau, (extract(epoch from "createdAt") * 1000)::float8 AS tao_ms FROM "okrTomTat" WHERE "cycleId" = $1 AND "departmentId" = $2
		 ORDER BY "createdAt" DESC LIMIT 1`,
		[KY, pb],
	);
	return b ?? null;
}

async function lanTrongKho(url, ids) {
	const ds = await truyVan(
		url,
		`SELECT id, value::text AS gia, confidence, note FROM "okrCheckIn" WHERE id = ANY($1::text[])`,
		[ids],
	);
	return new Map(ds.map((d) => [d.id, d]));
}

const vietSo = (so) => String(so).replace(".", ",");

async function docThe(p, i) {
	return p.evaluate((i) => {
		const the = document.querySelector(`[data-the-trich-dan="${i}"]`);
		if (!the) return null;
		const hienRa = [...the.querySelectorAll("[data-nguon]")].filter((n) =>
			n.checkVisibility(),
		);
		return hienRa.map((n) => ({
			id: n.getAttribute("data-nguon"),
			giaTri: n.querySelector("[data-gia-tri]")?.textContent?.trim() ?? "",
			tuTin:
				n.querySelector("[data-tu-tin]")?.getAttribute("data-tu-tin") ?? "",
			ghiChu: n.querySelector("[data-ghi-chu]")?.textContent?.trim() ?? "",
		}));
	}, i);
}

async function soThe(t, url, i, cau) {
	const kho = await lanTrongKho(
		url,
		cau.nguon.map((n) => n.id),
	);
	const thay = new Map();
	for (let lan = 0; lan < cau.nguon.length; lan += 1) {
		for (const n of (await docThe(t.p, i)) ?? []) thay.set(n.id, n);
		if (thay.size >= cau.nguon.length) break;
		const sau = await t.p.$(
			`[data-the-trich-dan="${i}"] button[aria-label="Nguồn sau"]`,
		);
		if (!sau) break;
		await sau.click();
		await tre(E9.cho.lamMoiMs);
	}
	for (const n of cau.nguon) {
		const h = kho.get(n.id);
		const tren = thay.get(n.id);
		kiem(
			`the trich dan cau ${i} ${t.rong} nguon ${n.id}: gia tri «${tren?.giaTri ?? "-"}» tu tin ${tren?.tuTin ?? "-"} ghi chu «${tren?.ghiChu ?? "-"}» = kho (${h?.gia ?? "mat"}, ${h?.confidence ?? "-"}, «${h?.note ?? ""}»)`,
			h !== undefined &&
				tren?.giaTri.startsWith(vietSo(Number(h.gia))) === true &&
				tren.tuTin === h.confidence &&
				tren.ghiChu === h.note.trim(),
		);
	}
}

async function buocKhoi(tlA, url, api) {
	buoc = "ST-tomtat-co-cau";
	await moiKho(tlA, async (t) => {
		await t.p.goto(duongHopTuan(PB.a), { waitUntil: "load" });
		kiem(
			`ST-tomtat-co-cau ${t.rong}: khoi co cau`,
			await hien(t.p, `${KHOI} [data-trang-thai="ST-tomtat-co-cau"]`),
		);
		await chup(t, "ST-tomtat-co-cau");
	});

	buoc = "ST-tomtat-trich-dan";
	await moiKho(tlA, async (t) => {
		await t.p.goto(duongHopTuan(PB.a), { waitUntil: "load" });
		await hien(t.p, `${KHOI} [data-cau="1"]`);
		for (const [k, cau] of api.cau.entries()) {
			const i = k + 1;
			await bam(t.p, `[data-trich-dan="${i}"]`);
			kiem(
				`ST-tomtat-trich-dan cau ${i} ${t.rong}: the mo bang bam`,
				await hien(t.p, `[data-the-trich-dan="${i}"]`),
			);
			await soThe(t, url, i, cau);
			await chup(t, `ST-tomtat-trich-dan-${i}`);
			await t.p.keyboard.press("Escape");
			await tre(E9.cho.lamMoiMs);
		}
		if (t.rong !== E9.kho[0].rong) return;
		for (const phim of ["Enter", "Space"]) {
			await t.p.focus('[data-trich-dan="1"]');
			await t.p.keyboard.press(phim);
			kiem(
				`nhan trich dan mo bang ${phim}`,
				await hien(t.p, '[data-the-trich-dan="1"]', 5 * GIAY_MS),
			);
			await t.p.keyboard.press("Escape");
			const daDong = await t.p
				.waitForSelector('[data-the-trich-dan="1"]', {
					hidden: true,
					timeout: 5 * GIAY_MS,
				})
				.then(() => true)
				.catch(() => false);
			kiem(`the trich dan dong bang Esc (sau ${phim})`, daDong);
		}
	});

	buoc = "xem-dien-bien";
	const dau = api.cau[0]?.nguon[0];
	await moiKho(tlA, async (t) => {
		await t.p.goto(duongHopTuan(PB.a), { waitUntil: "load" });
		await bam(t.p, '[data-trich-dan="1"]');
		await bam(
			t.p,
			`[data-the-trich-dan="1"] [data-xem-dien-bien="${dau.keyResultId}"]`,
		);
		const dung = await t.p
			.waitForFunction(
				(mt, kr) => {
					const q = new URL(location.href).searchParams;
					return (
						q.get("record") === `objective:${mt}` &&
						q.get("tab") === "dien-bien" &&
						q.get("krOkr") === kr
					);
				},
				{ timeout: E9.cho.manMs },
				dau.mucTieuId,
				dau.keyResultId,
			)
			.then(() => true)
			.catch(() => false);
		kiem(
			`Xem dien bien KR ${t.rong}: URL record=objective:${dau.mucTieuId}, tab=dien-bien, krOkr=${dau.keyResultId} (${t.p.url()})`,
			dung,
		);
		await chup(t, "ST-tomtat-dien-bien");
	});

	buoc = "ST-tomtat-da-phan-hoi";
	await moiKho(tlA, async (t) => {
		await t.p.goto(duongHopTuan(PB.a), { waitUntil: "load" });
		if (t.rong === E9.kho[0].rong) {
			await hien(t.p, `${KHOI} [data-phan-hoi]`);
			const nut = await t.p.$$(`${KHOI} [data-phan-hoi] button`);
			const huuIch = await Promise.all(
				nut.map((b) => b.evaluate((x) => x.textContent?.trim() ?? "")),
			);
			const i = huuIch.indexOf(phanHoi.useful);
			if (i < 0) throw new Error(`khong thay nut «${phanHoi.useful}»`);
			await nut[i].click();
		}
		kiem(
			`ST-tomtat-da-phan-hoi ${t.rong}: nut da chon, «${m.daGhi}»`,
			await hien(t.p, `${KHOI} [data-trang-thai="ST-tomtat-da-phan-hoi"]`),
		);
		await chup(t, "ST-tomtat-da-phan-hoi", [`${KHOI} [data-phan-hoi]`]);
	});
	const [ph] = await truyVan(
		url,
		`SELECT count(*)::int AS n, bool_and("huuIch") AS huu_ich FROM "okrTomTatPhanHoi" WHERE "tomTatId" = $1 AND "userId" = $2`,
		[api.id, idMau("nguoi", truongCua(E9.phong.a))],
	);
	kiem(
		`OkrTomTatPhanHoi cua truong phong A: ${ph.n} hang, huuIch ${ph.huu_ich}`,
		ph.n === 1 && ph.huu_ich === true,
	);
}

async function sangSauBan(url) {
	const ban = await banCua(url, PB.a);
	if (!ban) throw new Error("khong co ban tom tat phong A de tinh gio nhac");
	return gioNhacSau(new Date(ban.tao_ms), E9.gioNhac);
}

async function dungTinNhac(url) {
	const nhac = await import("../../../apps/agent/agent/lib/nhac-ke-hoach.ts");
	const gieo = await import("../../../apps/agent/test/support/okr-gieo.ts");
	const { zaloGia } = await import(
		"../../../apps/agent/test/support/zalo-gia.ts"
	);
	const nguoi = idMau("nguoi", truongCua(E9.phong.a));
	const luc = await sangSauBan(url);
	await gieo.batBot();
	await gieo.noiZalo(nguoi, E9.zaloGia);
	const z = zaloGia();
	setSystemTime(luc);
	try {
		await nhac.lenLichNhac(luc);
		const [hang] = await truyVan(
			process.env.DATABASE_URL,
			`SELECT id FROM "agentTask" WHERE kind = $1 AND subject = $2`,
			[nhac.LOAI_VIEC_NHAC, nhac.chuDeNhac(nguoi, luc)],
		);
		if (!hang) throw new Error("khong co tin nhac cho truong phong A");
		await gieo.voiToken(() =>
			nhac.chayNhac(hang, { zaloFetcher: z.fetcher, appUrl: APP }),
		);
	} finally {
		setSystemTime();
	}
	const text = z.guiToi(E9.zaloGia)[0]?.body.text ?? "";
	const dongTin = text.split("\n").find((d) => E9.dongTomTat.test(d)) ?? "";
	dong.push(`TIN «${dongTin}»`);
	return /(https?:\/\/\S+)/.exec(dongTin)?.[1] ?? null;
}

async function buocMoTuTin(tlA, url) {
	buoc = "nhac-mo-bang";
	const lienKet = await dungTinNhac(url);
	if (
		!kiem(
			`tin nhac cua truong phong A co dong tom tat co duong mo`,
			Boolean(lienKet),
		)
	)
		return;
	const q = new URL(lienKet).searchParams;
	kiem(
		`duong mo: xemOkr=${q.get("xemOkr")} donOkr=${q.get("donOkr")} kyOkr=${q.get("kyOkr")}`,
		q.get("xemOkr") === "hop-tuan" &&
			q.get("donOkr") === `pb:${PB.a}` &&
			q.get("kyOkr") === KY,
	);
	const nguoiA = idMau("nguoi", truongCua(E9.phong.a));
	const moc = new Date().toISOString().replace("Z", "");
	const demVet = async () =>
		(
			await truyVan(
				url,
				`SELECT count(*)::int AS n FROM "okrTrail"
				 WHERE action = 'mo-hop-tuan' AND "actorUserId" = $1 AND after ->> 'donVi' = $2
				   AND "at" >= $3::timestamp`,
				[nguoiA, `pb:${PB.a}`, moc],
			)
		)[0].n;
	const truoc = await demVet();
	kiem(
		`truoc khi mo duong trong tin: ${truoc} vet mo-hop-tuan cua truong phong A tu ${moc}Z`,
		truoc === 0,
	);
	const t = await trang(tlA, E9.kho[0]);
	let daGoi = false;
	try {
		const phanHoi = t.p
			.waitForResponse((r) => r.url().includes("okr.moHopTuan"), {
				timeout: E9.cho.manMs,
			})
			.then(() => true)
			.catch(() => false);
		await t.p.goto(lienKet, { waitUntil: "load" });
		kiem(
			"mo duong trong tin: khoi tom tat phong A hien",
			await hien(t.p, KHOI),
		);
		daGoi = await phanHoi;
	} finally {
		await t.ctx.close();
	}
	kiem(
		"mo duong trong tin: trang da goi okr.moHopTuan va nhan phan hoi",
		daGoi,
	);
	const han = Date.now() + E9.cho.vetMs;
	let sau = await demVet();
	while (sau === 0 && Date.now() < han) {
		await tre(E9.cho.lamMoiMs);
		sau = await demVet();
	}
	kiem(
		`sau khi mo duong trong tin: ${sau} vet mo-hop-tuan cua truong phong A, phong A`,
		sau === 1,
	);
}

async function buocCongTac(tlA, url) {
	buoc = "ST-nhac-dong-tomtat";
	const CONG_TAC = '[data-cong-tac="dong-tom-tat"]';
	await moiKho(tlA, async (t) => {
		await t.p.goto(`${APP}/${slug}/reminders`, { waitUntil: "load" });
		kiem(
			`ST-nhac-dong-tomtat ${t.rong}: cong tac hien`,
			await hien(t.p, '[data-khoi="dong-tro-ly-okr"]'),
		);
		await chup(t, "ST-nhac-dong-tomtat");
		if (t.rong !== E9.kho[0].rong) return;
		await bam(t.p, CONG_TAC);
		await t.p
			.waitForSelector(`${CONG_TAC}[aria-checked="false"]:not([disabled])`, {
				timeout: E9.cho.manMs,
			})
			.catch(() => null);
		await t.p.reload({ waitUntil: "load" });
		await hien(t.p, CONG_TAC);
		const tat = await t.p.$eval(CONG_TAC, (o) =>
			o.getAttribute("aria-checked"),
		);
		kiem(`tat, tai lai: cong tac aria-checked=${tat}`, tat === "false");
	});
	const [pref] = await truyVan(
		url,
		`SELECT "dongTroLyOkr" FROM "notificationPreference" WHERE "userId" = $1`,
		[idMau("nguoi", truongCua(E9.phong.a))],
	);
	kiem(
		`NotificationPreference.dongTroLyOkr = ${pref?.dongTroLyOkr}`,
		pref?.dongTroLyOkr === false,
	);
}

async function buocPhongAn(tlB) {
	buoc = "phong-b-an";
	await moiKho(tlB, async (t) => {
		await t.p.goto(duongHopTuan(PB.b), { waitUntil: "load" });
		const bang = await hien(
			t.p,
			'[data-trang-thai="ST-hoptuan-codulieu"], [data-trang-thai="ST-hoptuan-yenang"], [data-trang-thai="ST-hoptuan-tuandau"]',
		);
		const coKhoi = (await t.p.$(KHOI)) !== null;
		kiem(
			`phong B (che do an) ${t.rong}: bang hien ${bang}, khong co khoi tom tat (${coKhoi})`,
			bang && !coKhoi,
		);
		await chup(t, "phong-b-khong-khoi");
	});
}

async function buocQuanTri(qt) {
	buoc = "ST-suckhoe-tomtat";
	await moiKho(qt, async (t) => {
		await t.p.goto(`${APP}/${slug}/okr/toan-canh/suc-khoe?kyOkr=${KY}`, {
			waitUntil: "load",
		});
		const co = await hien(
			t.p,
			'[data-khoi="tom-tat-quan-tri"] [data-trang-thai="ST-suckhoe-tomtat-co"]',
		);
		const a = (await t.p.$(`[data-phong="${PB.a}"] [data-nac="bat"]`)) !== null;
		const b = (await t.p.$(`[data-phong="${PB.b}"] [data-nac="an"]`)) !== null;
		kiem(
			`ST-suckhoe-tomtat-co ${t.rong}: khoi ${co}, phong A Bat ${a}, phong B An ${b}`,
			co && a && b,
		);
		await chup(t, "ST-suckhoe-tomtat-co", [
			`[data-phong="${PB.a}"]`,
			`[data-phong="${PB.b}"]`,
		]);
		await bam(t.p, `[data-mo-ban="${PB.b}"]`);
		kiem(
			`ST-suckhoe-tomtat-ngan ${t.rong}: ngan ban phong B mo`,
			await hien(t.p, `[data-ngan-ban="${PB.b}"]`),
		);
		await chup(t, "ST-suckhoe-tomtat-ngan");
	});
}

if (!coKhoaMoHinh())
	await khongDo(`${cauThieuKhoa()} — tom tat can model that co ZDR`);

if (!trongPhienCoTacTu()) {
	console.log(
		"-- API cua phien nay khong noi tac tu (thieu AGENT_BRIDGE_SECRET/AGENT_URL) — mo phien do rieng co tac tu",
	);
	process.exit(await chayTrongPhienCoTacTu(E9.lenh));
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
	await khongDo(
		"DATABASE_URL khong phai kho do rieng — chay qua scripts/lan-do/tien-de.mjs",
	);

const URL_KHO = process.env.DATABASE_URL;
let qt;
let tlA;
let tlB;
let slug;
try {
	buoc = "chuan-bi";
	const nap = napBoMau();
	if (nap.ma !== 0)
		throw new Error(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	dong.push(`NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
	qt = phienCookie(thuMau(E9.quanTri));
	tlA = phienCookie(thuMau(truongCua(E9.phong.a)));
	tlB = phienCookie(thuMau(truongCua(E9.phong.b)));
	slug = await suySlug(qt);
	if (!slug)
		throw new Error(`${APP}/ khong chuyen toi trang chinh cua workspace`);
	await trpc(API, qt).lam("okr.setProgram", {
		aiOn: true,
		aiTomTatPhamVi: "danh-sach",
		aiTomTatDonVi: [PB.a],
		aiTomTatAnPhamVi: "danh-sach",
		aiTomTatAnDonVi: [PB.b],
	});
	const ct = await trpc(API, qt).hoi("okr.program");
	kiem(
		`setProgram: tom tat ${ct.aiTomTatPhamVi} [${ct.aiTomTatDonVi}], an ${ct.aiTomTatAnPhamVi} [${ct.aiTomTatAnDonVi}]`,
		ct.aiOn === true &&
			ct.aiTomTatDonVi.includes(PB.a) &&
			ct.aiTomTatAnDonVi.includes(PB.b),
	);
	tacTu = await batTacTu({
		cong: Number(process.env[PHIEN_TRO_LY.bienCongTacTu]),
		thuMuc: THU_MUC,
	});
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

let api;
try {
	buoc = "xep-va-xa";
	const { xep, viec } = await xepVaXa(URL_KHO);
	kiem(
		`viec xep dong ${xep?.outcome ?? "(chua dong)"}`,
		`${xep?.outcome ?? ""}`.startsWith("da-xep:"),
	);
	for (const [ten, pb, nac] of [
		["A", PB.a, "bat"],
		["B", PB.b, "an"],
	]) {
		const v = viec.find((x) => x.phong === pb);
		kiem(
			`viec tom tat phong ${ten} nac ${v?.nac ?? "-"} dong ${v?.outcome ?? "(chua dong)"}`,
			v?.nac === nac && `${v?.outcome ?? ""}`.startsWith("da-nop"),
		);
	}
	const banA = await banCua(URL_KHO, PB.a);
	const banB = await banCua(URL_KHO, PB.b);
	kiem(
		`ban phong A ${banA?.trangThai ?? "khong co"}, ban phong B ${banB?.trangThai ?? "khong co"}`,
		banA?.trangThai === "hien" && Boolean(banB),
	);
	if (banA?.trangThai !== "hien") await ket(1);
	const cauSo = (banA.cau?.cau ?? []).filter((c) => docSo(c.vanBan).length > 0);
	if (cauSo.length === 0) {
		dong.push(`${E9.thongDiep.khongCauCoSo}: ban phong A ${banA.id}`);
		await ket(3);
	}
	api = (
		await trpc(API, tlA).hoi("okr.troLyTomTat", {
			cycleId: KY,
			departmentId: PB.a,
		})
	).ban;
	if (!api) throw new Error("okr.troLyTomTat khong tra ban cho truong phong A");
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

mkdirSync(THU_MUC, { recursive: true });
trinhDuyet = await puppeteer.launch({
	executablePath: E9.chrome,
	headless: true,
});

try {
	await buocMoTuTin(tlA, URL_KHO);
	await buocKhoi(tlA, URL_KHO, api);
	await buocCongTac(tlA, URL_KHO);
	await buocPhongAn(tlB);
	await buocQuanTri(qt);
} catch (loi) {
	await khongDo(`buoc ${buoc}: ${loi?.message ?? loi}`);
}

await ket(sai === 0 ? 0 : 1);
