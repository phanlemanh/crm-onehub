import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import {
	bam,
	bamChu,
	CHU_TU_TIN,
	cho,
	DO,
	dongTrang,
	dungDuLieu,
	duongHop,
	giaTriMoiCua,
	go,
	krCuaP,
	lanCua,
	moTrang,
	moTrinhDuyet,
	nghi,
} from "../../hop-tuan-tren-bang/rang/man-lib.mjs";
import {
	coSo,
	soLanSql,
} from "../../lich-su-moi-lan-cap-nhat/rang/man-lib.mjs";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	APP,
	ket,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import { GOC } from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";

const HO_SO = "cap-nhat-trong-ngan-kr";
const BANG_CHUNG =
	process.env.BANG_CHUNG ?? join(GOC, "_acceptance", HO_SO, "evidence");
const KHO = [
	{ ten: "1280", rong: 1280, cao: 800 },
	{ ten: "375", rong: 375, cao: 812 },
];
const SO_BUOC = 3;
const CHO_SQL_MS = 30_000;
const TU_TIN = "vua";

const KHOI = (kr) => `[data-kr-sheet='${kr}'] [data-khoi-cap-nhat-kr='mo']`;

const dem = { dung: 0, sai: 0 };
function dong(dat, ten, chu) {
	if (dat) dem.dung += 1;
	else dem.sai += 1;
	console.log(dat ? `DUNG ${ten}: ${chu}` : `SAI ${ten}: ${chu}`);
}

const DOC_LOP = (krSheet) => {
	const hien = (el) => el.checkVisibility();
	const hopLa = [...document.querySelectorAll("[role=dialog]")].filter(
		(h) => hien(h) && h.querySelector(krSheet) === null,
	).length;
	const keo = [...document.querySelectorAll("[data-slot='drawer-content']")]
		.length;
	return { hopLa, keo };
};

const DOC_KHOI = (chon) => {
	const el = [...document.querySelectorAll(chon)].find((e) =>
		e.checkVisibility(),
	);
	if (!el) return { co: false, trongKhung: false, tieuDiem: false };
	const b = el.getBoundingClientRect();
	const trongKhung = b.top < window.innerHeight && b.bottom > 0;
	const o = el.querySelector("[data-o='gia-tri'] input");
	return {
		co: true,
		trongKhung,
		tieuDiem: o !== null && document.activeElement === o,
	};
};

async function lop(t, kr) {
	return t.evaluate(DOC_LOP, `[data-kr-sheet='${kr}']`);
}

const sachLop = (l) => l.hopLa === 0 && l.keo <= 1;

async function chup(t, ten) {
	await nghi(DO.cho.onDinhMs);
	const duong = join(BANG_CHUNG, `${ten}.png`);
	await t.screenshot({ path: duong });
	console.log(`anh: ${duong}`);
}

async function choSql(kr, can) {
	const het = Date.now() + CHO_SQL_MS;
	let n = await soLanSql(kr);
	while (n < can && Date.now() < het) {
		await nghi(DO.cho.nhipMs);
		n = await soLanSql(kr);
	}
	return n;
}

async function krDenHan(n) {
	const ds = await krCuaP(n.pb.id, n.cur);
	const ket = [];
	for (const k of ds) {
		if (k.source !== "tay" || k.kind === "moc") continue;
		const lan = await lanCua(k.id);
		if (lan.length > 0 && !lan.some((l) => l.tuan === n.hop.tuan)) ket.push(k);
	}
	return ket;
}

async function buocMot(n, kho, kr) {
	const t = await moTrang(n.ck, `/${n.slug}/okr/kr/${kr.id}`, kho, false);
	const coKhoi = await cho(t, KHOI(kr.id));
	const k = await t.evaluate(DOC_KHOI, KHOI(kr.id));
	const l = await lop(t, kr.id);
	await chup(t, `cnk-${kho.ten}-1-den-han`);
	dong(
		coKhoi && k.trongKhung && sachLop(l),
		`${kho.ten} buoc 1`,
		`mo KR den han ${kr.id}: khoi mo ${coKhoi} · trong khung nhin ${k.trongKhung} · dialog=${l.hopLa} · ngan keo ${l.keo}`,
	);
	return t;
}

async function buocHai(t, kho, kr) {
	const n0 = await soLanSql(kr.id);
	const moi = giaTriMoiCua(kr, Number(kr.currentValue));
	const khoi = KHOI(kr.id);
	await go(t, `${khoi} [data-o='gia-tri'] input`, String(moi));
	await bamChu(
		t,
		`${khoi} [data-o='tu-tin'] [data-slot='toggle-group-item']`,
		CHU_TU_TIN[TU_TIN],
	);
	await go(t, `${khoi} [data-o='ghi-chu'] input`, `cnk ${kho.ten}`);
	const l = await lop(t, kr.id);
	await bam(t, `${khoi} [data-nut='gui-cap-nhat-kr']`);
	const n1 = await choSql(kr.id, n0 + 1);
	await cho(t, `[data-kr-sheet='${kr.id}'] [data-khoi-cap-nhat-kr='thu']`);
	const sau = await t.evaluate((id) => {
		const ngan = document.querySelector(`[data-kr-sheet='${id}']`);
		const dau = document.querySelector(
			"[data-lich-su-kr] [data-lan-cap-nhat] [data-gia-tri-lan]",
		);
		return { ngan: ngan !== null, dau: dau?.textContent ?? null };
	}, kr.id);
	await chup(t, `cnk-${kho.ten}-2-vua-gui`);
	dong(
		n1 === n0 + 1 && sau.ngan && coSo(sau.dau, moi) && sachLop(l),
		`${kho.ten} buoc 2`,
		`gui ${moi}: OkrCheckIn ${n0} → ${n1} · ngan con ${sau.ngan} · dong dau Lich su «${sau.dau}» · dialog=${l.hopLa} · ngan keo ${l.keo}`,
	);
	await dongTrang(t);
}

async function buocBa(n, kho) {
	const t = await moTrang(n.ck, duongHop(n), kho, false);
	const nut = "[data-kr-hop] [data-nut='cap-nhat-dong-kr']";
	await cho(t, nut);
	const kr = await t.evaluate(
		(c) =>
			document
				.querySelector(c)
				?.closest("[data-kr-hop]")
				?.getAttribute("data-kr-hop") ?? null,
		nut,
	);
	await bam(t, nut);
	const coKhoi = kr !== null && (await cho(t, KHOI(kr)));
	await nghi(DO.cho.onDinhMs);
	const k = kr ? await t.evaluate(DOC_KHOI, KHOI(kr)) : { trongKhung: false };
	const l = kr ? await lop(t, kr) : { hopLa: -1, keo: -1 };
	await chup(t, `cnk-${kho.ten}-3-tu-hop-tuan`);
	dong(
		coKhoi && k.trongKhung && k.tieuDiem && sachLop(l),
		`${kho.ten} buoc 3`,
		`Hop tuan › Cap nhat ${kr}: khoi mo ${coKhoi} · trong khung nhin ${k.trongKhung} · tieu diem o gia tri ${k.tieuDiem} · dialog=${l.hopLa} · ngan keo ${l.keo}`,
	);
	await dongTrang(t);
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
const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);
console.log(`ban do: ${APP}`);

await moTrinhDuyet();
try {
	mkdirSync(BANG_CHUNG, { recursive: true });
	const n = await dungDuLieu();
	const denHan = await krDenHan(n);
	if (denHan.length < KHO.length)
		await khongDo(
			`KHONG DO DUOC: ${n.pb.name} chi co ${denHan.length} KR nhap tay chua cap nhat tuan ${n.hop.tuan}, can ${KHO.length}`,
		);
	for (const [i, kho] of KHO.entries()) {
		const t = await buocMot(n, kho, denHan[i]);
		await buocHai(t, kho, denHan[i]);
		await buocBa(n, kho);
	}
} catch (loi) {
	console.log(`KHONG DO DUOC: thuoc vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}
await db.$disconnect();
const tong = KHO.length * SO_BUOC;
console.log(`cnk-man: ${dem.dung}/${tong}`);
await ket(dem.sai === 0 && dem.dung === tong ? 0 : 1);
