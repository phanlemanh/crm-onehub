import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { dauTuanVN } from "../../../packages/db/src/onboarding-nhac.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	APP,
	ket,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import { chayChieuDo } from "./man-chieu-do.mjs";
import {
	BANG_CHUNG,
	bam,
	CAU_TUAN_DAU,
	CHU,
	cho,
	choBo,
	choUrl,
	DO,
	DOC_BO,
	docGoc,
	dong,
	dongDo,
	dongTrang,
	dungDuLieu,
	gacGoc,
	giaTriCo,
	HOP,
	KHONG_KHONG,
	ketQua,
	moTrang,
	moTrinhDuyet,
	THAM,
} from "./man-lib.mjs";

async function chuoiChuyen(cookie, duong) {
	const chuoi = [];
	let url = new URL(`${APP}${duong}`);
	for (let i = 0; i < DO.toiDaChuyen; i += 1) {
		const res = await fetch(url, {
			redirect: "manual",
			headers: { Cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
		});
		const loc = res.headers.get("location");
		chuoi.push({
			url,
			status: res.status,
			loc: loc ? new URL(loc, url) : null,
		});
		await res.body?.cancel();
		if (!loc || res.status < 300 || res.status >= 400) break;
		url = new URL(loc, url);
	}
	return chuoi;
}

function kiemChuyen(n, chuoi, mong) {
	const boOkr = `/${n.slug}/okr/bo-okr`;
	const dau = chuoi.find((c) => c.url.pathname === boOkr);
	if (!dau) return { loi: "khong toi /okr/bo-okr", dich: null };
	if (dau.status !== 307 || !dau.loc)
		return { loi: `khong chuyen (${dau.status})`, dich: null };
	const q = dau.loc.searchParams;
	if (dau.loc.pathname !== boOkr)
		return { loi: `chuyen sai duong ${dau.loc.pathname}`, dich: dau.loc };
	if (q.get(THAM.xem) !== HOP)
		return { loi: `mat xemOkr (${q.get(THAM.xem) ?? "-"})`, dich: dau.loc };
	if (mong.ky !== null && q.get(THAM.ky) !== mong.ky)
		return { loi: "mat kyOkr", dich: dau.loc };
	if (mong.ky === null && q.has(THAM.ky))
		return { loi: `them kyOkr ${q.get(THAM.ky)}`, dich: dau.loc };
	if (q.get(THAM.don) !== mong.don)
		return {
			loi: `donOkr ${q.get(THAM.don) ?? "khong co"}, can ${mong.don}`,
			dich: dau.loc,
		};
	return { loi: null, dich: dau.loc };
}

const tapThamSo = (u) =>
	[...u.searchParams.entries()]
		.map(([k, v]) => `${k}=${v}`)
		.sort()
		.join("&");

async function demSql(n) {
	const tuan = dauTuanVN(new Date());
	const [r] = await db.$queryRaw`
		SELECT COUNT(*)::int AS m,
			COUNT(*) FILTER (WHERE EXISTS (
				SELECT 1 FROM "okrCheckIn" c
				WHERE c."keyResultId" = k.id AND c."weekStart" = ${tuan}::date
			))::int AS n
		FROM "okrKeyResult" k
		JOIN "okrObjective" o ON o.id = k."objectiveId"
		WHERE o."cycleId" = ${n.cur}
			AND o."departmentId" = ${n.pb.id}
			AND o.level = 'phong-ban'
			AND o.status = 'cong-bo'`;
	return { n: r.n, m: r.m, tuan };
}

function dichMong(n, ky) {
	const q = new URLSearchParams({ [THAM.don]: n.ca.boP, [THAM.xem]: HOP });
	if (ky !== null) q.set(THAM.ky, ky);
	return new URL(`${APP}/${n.slug}/okr/bo-okr?${q}`);
}

async function dongA(n, ten, duong, ky) {
	const chuoi = await chuoiChuyen(n.ck.p, duong);
	const a = kiemChuyen(n, chuoi, { don: n.ca.boP, ky });
	const mong = dichMong(n, ky);
	const dauChuoi = chuoi
		.map(
			(c) => `${c.status}${c.loc ? `→${c.loc.pathname}${c.loc.search}` : ""}`,
		)
		.join(" ");
	const t = await moTrang(n.ck.p, "/", DO.kho[0], false);
	await gacGoc(t, n.tenGoc);
	await t.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: DO.cho.taiMs,
	});
	await choUrl(t, { [THAM.don]: n.ca.boP });
	await choBo(t, n.pb.name);
	await cho(t, "[data-hang-so-hop]:not([aria-busy]) [data-o-so]");
	const d = await t.evaluate(DOC_BO);
	const cuoi = new URL(t.url());
	const goc = await docGoc(t);
	await dongTrang(t);
	const sql = await demSql(n);
	const urlDung =
		cuoi.pathname === mong.pathname && tapThamSo(cuoi) === tapThamSo(mong);
	const viTriDung = d.viTri === `${CHU.viTri} › ${n.pb.name}`;
	const tieuDeDung = d.tieuDe === CHU.tieuDeKhu;
	const soDung = d.daCapNhat === `${sql.n}/${sql.m}`;
	const coKhongKhong = KHONG_KHONG.test(d.chu);
	const coTuanDau = d.chu.includes(CAU_TUAN_DAU);
	const lyDo = [
		a.loi,
		urlDung ? null : `url cuoi ${cuoi.pathname}${cuoi.search}`,
		viTriDung ? null : `vi tri «${d.viTri ?? "-"}»`,
		tieuDeDung ? null : `tieu de «${d.tieuDe ?? "-"}»`,
		goc.length === 0 ? null : `vi tri mang ten goc: ${goc[0]}`,
		soDung ? null : `da cap nhat «${d.daCapNhat ?? "-"}» can ${sql.n}/${sql.m}`,
		coKhongKhong ? "trang co 0/0" : null,
		coTuanDau ? "trang co cau tuanDau" : null,
	].filter(Boolean);
	dong(
		"AC-1",
		lyDo.length === 0,
		ten,
		`${lyDo.length ? `${lyDo.join(" · ")} · ` : ""}chuoi ${dauChuoi} · url cuoi ${cuoi.pathname}${cuoi.search} · vi tri «${d.viTri ?? "-"}» · tieu de «${d.tieuDe ?? "-"}» · da cap nhat ${d.daCapNhat ?? "-"} = SQL ${sql.n}/${sql.m} (tuan ${sql.tuan}) · goc ${goc.length} lan`,
	);
}

async function dongB(n, ten, cookie, don) {
	const duong = `/${n.slug}/okr/bo-okr?${new URLSearchParams({ [THAM.xem]: HOP })}`;
	const chuoi = await chuoiChuyen(cookie, duong);
	const a = kiemChuyen(n, chuoi, { don, ky: null });
	dong(
		"AC-1",
		a.loi === null,
		ten,
		`${a.loi ? `${a.loi} · ` : ""}Location ${a.dich ? `${a.dich.pathname}${a.dich.search}` : "-"} (can donOkr=${don})`,
	);
}

async function denHopTuanTuBo(t, n, kho) {
	const hep = kho.rong < 768;
	const chonBo = hep
		? `[data-the-bo] a[data-bo='${n.ca.boP}']`
		: `[data-bang-bo] tr[data-bo='${n.ca.boP}'] a`;
	await cho(t, "[data-danh-sach-bo]");
	const loc = await bam(t, `[data-loc-bo] [data-pham-vi='toi-dan']`);
	await choUrl(t, { [THAM.loc]: "toi-dan" });
	await cho(t, chonBo);
	const bo = await bam(t, chonBo);
	await choBo(t, n.pb.name);
	await cho(t, `[data-the-con-bo] a[data-the='${HOP}']`);
	const the = await bam(t, `[data-the-con-bo] a[data-the='${HOP}']`);
	await choUrl(t, { [THAM.xem]: HOP });
	await choBo(t, n.pb.name);
	return { loc, bo, the };
}

async function denBoOkrThanhBen(t, kho) {
	const chon =
		kho.rong < 768
			? "[data-slot='nav-strip'] a[href*='/okr/bo-okr']"
			: "aside[data-slot='area-sidebar'] a[href*='/okr/bo-okr']";
	await cho(t, chon);
	return bam(t, chon);
}

async function kiemDuongBam(n, ten, t, buoc) {
	const d = await t.evaluate(DOC_BO);
	const q = new URL(t.url()).searchParams;
	const goc = await docGoc(t);
	const lyDo = [
		buoc.every(Boolean)
			? null
			: `bam hut (${buoc.map((b) => (b ? 1 : 0)).join("")})`,
		q.get(THAM.don) === n.ca.boP ? null : `donOkr ${q.get(THAM.don) ?? "-"}`,
		q.get(THAM.xem) === HOP ? null : `xemOkr ${q.get(THAM.xem) ?? "-"}`,
		q.get(THAM.ky) === n.cur ? null : `kyOkr ${q.get(THAM.ky) ?? "khong co"}`,
		d.viTri === `${CHU.viTri} › ${n.pb.name}`
			? null
			: `vi tri «${d.viTri ?? "-"}»`,
		goc.length === 0 ? null : `vi tri mang ten goc: ${goc[0]}`,
	].filter(Boolean);
	dong(
		"AC-1",
		lyDo.length === 0,
		ten,
		`${lyDo.length ? `${lyDo.join(" · ")} · ` : ""}url ${new URL(t.url()).search} · vi tri «${d.viTri ?? "-"}» · goc ${goc.length} lan`,
	);
}

async function dongC(n) {
	const kho = DO.kho[0];
	const batDau = `/${n.slug}/okr?${new URLSearchParams({ [THAM.ky]: n.cur })}`;
	const t1 = await moTrang(n.ck.p, "/", kho, false);
	await gacGoc(t1, n.tenGoc);
	await t1.goto(`${APP}${batDau}`, {
		waitUntil: "domcontentloaded",
		timeout: DO.cho.taiMs,
	});
	const tb = await denBoOkrThanhBen(t1, kho);
	const r1 = await denHopTuanTuBo(t1, n, kho);
	await kiemDuongBam(n, "bam-thanh-ben", t1, [tb, r1.loc, r1.bo, r1.the]);
	await dongTrang(t1);

	const t2 = await moTrang(n.ck.p, "/", kho, false);
	await gacGoc(t2, n.tenGoc);
	await t2.goto(`${APP}${batDau}`, {
		waitUntil: "domcontentloaded",
		timeout: DO.cho.taiMs,
	});
	const nut = `[data-don-vi-dan='${n.ca.boP}'] [data-nut='mo-don-vi']`;
	await cho(t2, nut);
	const moDv = await bam(t2, nut);
	await choBo(t2, n.pb.name);
	await cho(t2, `[data-the-con-bo] a[data-the='${HOP}']`);
	const the = await bam(t2, `[data-the-con-bo] a[data-the='${HOP}']`);
	await choUrl(t2, { [THAM.xem]: HOP });
	await choBo(t2, n.pb.name);
	await kiemDuongBam(n, "bam-cua-toi", t2, [moDv, the]);
	await dongTrang(t2);
}

async function phanDuong(n) {
	const bo = `/${n.slug}/okr/bo-okr`;
	await dongA(
		n,
		"bo-okr",
		`${bo}?${new URLSearchParams({ [THAM.xem]: HOP })}`,
		null,
	);
	await dongA(
		n,
		"ky-okr",
		`${bo}?${new URLSearchParams({ [THAM.xem]: HOP, [THAM.ky]: n.cur })}`,
		n.cur,
	);
	await dongA(
		n,
		"theo-don-vi",
		`/${n.slug}/okr/theo-don-vi?${new URLSearchParams({ [THAM.xem]: HOP })}`,
		null,
	);
	await dongB(n, "vai-thanh-vien", n.ck.m, `pb:${n.q}`);
	await dongB(n, "vai-quan-tri", n.ck.a, "goc");
	await dongC(n);
	const { soDong } = ketQua();
	console.log(`dem dong: ${soDong}/${DO.soDong}`);
	return soDong === DO.soDong;
}

const DO_TRAN = (khoi) => {
	const goc = document.documentElement;
	const truoc = goc.scrollWidth;
	const rong = window.innerWidth;
	const div = document.createElement("div");
	div.style.width = `${khoi}px`;
	div.style.height = "1px";
	document.body.appendChild(div);
	const voiKhoi = goc.scrollWidth;
	div.remove();
	return { truoc, rong, voiKhoi };
};

const DO_O = (lech) => {
	const o = [
		...document.querySelectorAll(
			"[data-hang-so-hop]:not([aria-busy]) [data-o-so]",
		),
	];
	const hang = new Map();
	for (const el of o) {
		const k = Math.round(el.getBoundingClientRect().top);
		hang.set(k, (hang.get(k) ?? 0) + 1);
	}
	const cat = o.flatMap((el) => {
		const nhan = el.children[0];
		const so = el.children[1]?.children[0];
		return [nhan, so]
			.filter((x) => x && x.scrollWidth > x.clientWidth + lech)
			.map(
				(x) =>
					`${el.getAttribute("data-o-so")}«${x.textContent.trim()}» ${x.scrollWidth}>${x.clientWidth}`,
			);
	});
	return { so: o.length, hang: [...hang.values()], cat };
};

const DO_DS = (lech) => {
	const muc = [
		...document.querySelectorAll("[data-don-vi-co-kr] [data-don-vi]"),
	];
	const cat = muc.flatMap((m) =>
		[
			m.querySelector("[data-slot='item-title']"),
			m.querySelector("[data-slot='item-description']"),
		]
			.filter((x) => x && x.scrollWidth > x.clientWidth + lech)
			.map(
				(x) => `«${x.textContent.trim()}» ${x.scrollWidth}>${x.clientWidth}`,
			),
	);
	const lienKet = muc.filter(
		(m) => m.getAttribute("href") && m.getClientRects().length > 0,
	).length;
	return { so: muc.length, lienKet, cat };
};

const DO_RONG_BO = () => {
	const cau = document.querySelector(
		"[data-trang-thai='ST-hoptuan-chua-kr'] [data-cau-ly-do]",
	);
	const nut = document.querySelector("[data-nut='xem-moi-bo']");
	return {
		cau: cau?.textContent.trim() ?? null,
		nut: !!nut && nut.getClientRects().length > 0,
		hangSo: !!document.querySelector("[data-hang-so-hop]"),
	};
};

async function chup(t, ten) {
	const duong = join(BANG_CHUNG, `${ten}.png`);
	await t.screenshot({ path: duong });
	return duong;
}

async function tran(t, nhan, doiChung) {
	const r = await t.evaluate(DO_TRAN, DO.khoiTran);
	dongDo(
		r.truoc <= r.rong,
		`KHONG TRAN ${nhan}`,
		`scrollWidth ${r.truoc} <= ${r.rong}`,
	);
	if (doiChung)
		dongDo(
			r.voiKhoi > r.rong,
			`DOI CHUNG TRAN ${nhan}`,
			`khoi ${DO.khoiTran}px lam scrollWidth ${r.voiKhoi} > ${r.rong}`,
		);
}

async function anhCoDuLieu(n, kho, theme, anh) {
	const nhan = `${kho.ten}-${theme.ten}`;
	const t = await moTrang(
		n.ck.p,
		`/${n.slug}/okr?${new URLSearchParams({ [THAM.ky]: n.cur })}`,
		kho,
		theme.toi,
	);
	const tb = await denBoOkrThanhBen(t, kho);
	const r = await denHopTuanTuBo(t, n, kho);
	const thay = await cho(t, "[data-hang-so-hop]:not([aria-busy]) [data-o-so]");
	if (!tb || !r.loc || !r.bo || !r.the || !thay)
		dongDo(
			false,
			`DUONG co-du-lieu ${nhan}`,
			`bam hut hay khong thay hang so (${[tb, r.loc, r.bo, r.the, thay].map(Number).join("")})`,
		);
	anh.push(await chup(t, `htmb-co-du-lieu-${nhan}`));
	await tran(t, `co-du-lieu ${nhan}`, true);
	const o = await t.evaluate(DO_O, DO.lechPx);
	const mongHang = kho.hang === 1 ? [DO.soO] : [DO.soO / 2, DO.soO / 2];
	dongDo(
		o.so === DO.soO && o.hang.join(",") === mongHang.join(","),
		`LUOI O ${nhan}`,
		`${o.so} o · hang ${o.hang.join(",") || "-"} (mong ${mongHang.join(",")})`,
	);
	dongDo(
		o.so === DO.soO && o.cat.length === 0,
		`NHAN O ${nhan}`,
		o.cat.length ? `cat ${o.cat.join(" · ")}` : `${o.so} nhan va so doc tron`,
	);
	await dongTrang(t);
}

async function anhChuaKr(n, kho, theme, anh) {
	const nhan = `${kho.ten}-${theme.ten}`;
	const q = new URLSearchParams({
		[THAM.don]: n.ca.boRong,
		[THAM.xem]: HOP,
		[THAM.ky]: n.cur,
	});
	const t = await moTrang(n.ck.p, `/${n.slug}/okr/bo-okr?${q}`, kho, theme.toi);
	await cho(
		t,
		"[data-trang-thai='ST-hoptuan-chua-kr'] [data-nut='xem-moi-bo']",
	);
	anh.push(await chup(t, `htmb-chua-kr-${nhan}`));
	const d = await t.evaluate(DO_RONG_BO);
	const tenKy = n.tenKy(n.cur);
	dongDo(
		d.cau?.includes(n.rong.name) === true &&
			d.cau?.includes(tenKy) === true &&
			d.nut &&
			!d.hangSo,
		`CHUA KR ${nhan}`,
		`cau «${d.cau ?? "-"}» · lien ket Xem moi bo OKR ${d.nut ? "thay" : "KHONG thay"} · hang so ${d.hangSo ? "CO" : "khong"}`,
	);
	await tran(t, `chua-kr ${nhan}`, false);
	await dongTrang(t);
}

async function anhDsDonVi(n, kho, theme, anh) {
	const nhan = `${kho.ten}-${theme.ten}`;
	const q = new URLSearchParams({
		[THAM.don]: "goc",
		[THAM.xem]: HOP,
		[THAM.ky]: n.ca.chuKyCon,
	});
	const t = await moTrang(n.ck.p, `/${n.slug}/okr/bo-okr?${q}`, kho, theme.toi);
	await cho(t, "[data-don-vi-co-kr] [data-don-vi]");
	anh.push(await chup(t, `htmb-ds-don-vi-${nhan}`));
	const d = await t.evaluate(DO_DS, DO.lechPx);
	dongDo(
		d.so >= DO.soMucToiThieu && d.lienKet === d.so && d.cat.length === 0,
		`DANH SACH ${nhan}`,
		`${d.so} muc · ${d.lienKet} lien ket${d.cat.length ? ` · cat ${d.cat.join(" · ")}` : " · ten va dong so doc tron"}`,
	);
	await tran(t, `ds-don-vi ${nhan}`, false);
	await dongTrang(t);
}

async function phanAnh(n) {
	mkdirSync(BANG_CHUNG, { recursive: true });
	const anh = [];
	for (const kho of DO.kho)
		for (const theme of DO.theme) {
			await anhCoDuLieu(n, kho, theme, anh);
			await anhChuaKr(n, kho, theme, anh);
			await anhDsDonVi(n, kho, theme, anh);
		}
	const co = anh.filter((a) => existsSync(a));
	dongDo(
		co.length === DO.soAnh,
		"DU ANH",
		`${co.length}/${DO.soAnh} anh o ${BANG_CHUNG}`,
	);
	for (const a of co) console.log(`anh: ${a}`);
	return true;
}

const phan = giaTriCo("--phan");
if (phan !== "duong" && phan !== "anh") {
	console.log("KHONG DO DUOC: can --phan duong hoac --phan anh");
	process.exit(2);
}
if (process.argv.includes("--chieu-do")) {
	if (phan !== "duong") {
		console.log("KHONG DO DUOC: --chieu-do chi co o --phan duong");
		process.exit(2);
	}
	const loai = giaTriCo("--chieu-do");
	process.exit(await chayChieuDo(loai?.startsWith("--") ? undefined : loai));
}

const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();
if (!isMeasureDatabase(tenKho))
	await khongDo(
		`KHONG DO DUOC: can mot phien do (kho _do) — kho "${tenKho}". Chay qua scripts/lan-do/tien-de.mjs`,
	);
const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);

await moTrinhDuyet();

let duDong = true;
try {
	const n = await dungDuLieu();
	duDong = phan === "duong" ? await phanDuong(n) : await phanAnh(n);
} catch (loi) {
	console.log(`KHONG DO DUOC: thuoc vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}
await db.$disconnect();
const { dung, sai, soDong } = ketQua();
if (!duDong) {
	console.log(
		`KET LUAN htmb ${phan}: KHONG DO DUOC — ${soDong}/${DO.soDong} dong`,
	);
	await ket(2);
}
console.log(`KET LUAN htmb ${phan}: ${dung} DUNG, ${sai} SAI`);
await ket(sai === 0 ? 0 : 1);
