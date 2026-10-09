import { readFileSync } from "node:fs";
import { join } from "node:path";
import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { DEM, LENH, TEN } from "./kich-ban.mjs";
import { datCss, so } from "./do-khung.mjs";
import { duaVaoTatCa, xacNhanDuaVao } from "./dua-vao-chung.mjs";
import {
	BANG,
	CHON,
	choMoHinh,
	choThay,
	choYen,
	docCuoc,
	duongDonVi,
	duongKhung,
	dungYen,
	GOC,
	ghi,
	giuMoHinh,
	guiTin,
	hopKhung,
	KHUNG,
	KY,
	ket,
	khoaBangCuoc,
	khongDo,
	kiem,
	m,
	MAN,
	moCuocMoi,
	moTrang,
	mui,
	nop1,
	PHONG,
	saiThem,
	sql,
	the,
	tranVaCuon,
	trang,
	vao,
} from "./man-chung.mjs";

const THIET_KE = join(GOC, "docs/superpowers/specs/2026-10-09-soan-okr-trong-khung-design.md");
const KHO = [1440, 1024, 768, 375];
const BO_TRANG_THAI = ["ST-khung-chua-cau-hinh"];
const VO_NGHIA = {
	"ST-khung-dien-thoai": [1440, 1024, 768],
	"ST-khung-rong": [768, 375],
	"ST-khung-rong-dang-soan": [768, 375],
	"ST-khung-da-dua-vao": [768, 375],
};
const SO_O_VIET_TRUOC = 54;
const LE_PX = 1;
const LE_TOAN_MAN_PX = 2;
const LE_TOKEN_PX = 8;
const KHE_REM = 2;
const ANH_DOI_CHIEU = "doi-chieu-khung-muc-tieu-1440-dark";

function idTrangThai() {
	const chu = readFileSync(THIET_KE, "utf8");
	const dau = chu.indexOf("<<<UX-STATE-TABLE");
	const cuoi = chu.indexOf("UX-STATE-TABLE>>>");
	if (dau < 0 || cuoi < dau) return null;
	return [...chu.slice(dau, cuoi).matchAll(/^\|\s*(ST-[a-z0-9-]+)\s*\|/gm)].map((k) => k[1]);
}

const co = (chon, chu = "") => ({ chon, chu });

function trangThai(soLuot) {
	return {
		"ST-khung-dang-mo": { khoa: true, dau: co('[data-trang-soan="dang-mo"] [data-kara-state="working"]') },
		"ST-khung-hep-rong": { khongNhap: true, dau: co('[data-o="hoi-thoai"] [data-slot="kara-dock-header"]', m.man.luot(String(soLuot), "12")) },
		"ST-khung-dang-soan-dau": { khongNhap: true, dau: co('[data-o="hoi-thoai"] [data-kara-state="working"]') },
		"ST-khung-rong": { dau: co('[data-o="ban-nhap"] [data-dong]', TEN.m1) },
		"ST-khung-rong-dang-soan": { dau: co('[data-o="ban-nhap"] [data-slot="kara-artifact-header"] [data-kara-state="working"]') },
		"ST-khung-hoi-dong": { esc: true, dau: co(CHON.hopHoi, m.trang.hoiDong.tieuDe) },
		"ST-khung-khong-mo": { id: "khong-co", dau: co('[data-kara-state="error"]', mui.karaKhung.chuaDuoc(m.trang.khongMo)) },
		"ST-khung-da-dua-vao": { dau: co("[data-da-dua-vao]", m.banNhap.daTao(String(DEM.nop1.mucTieu))) },
		"ST-khung-dien-thoai": { tab: "ban-nhap", dau: co('[data-slot="drawer-content"][data-phu-toan-man] [data-o="ban-nhap"] [data-dong]', TEN.m1) },
	};
}

const coDau = (p, dau) =>
	p.evaluate(({ chon, chu }) => [...document.querySelectorAll(chon)].some((o) => o.checkVisibility() && (o.innerText ?? "").includes(chu)), dau);

async function doTran(p) {
	return p.evaluate(
		(khung, hoi, nhap) => {
			const k = [...document.querySelectorAll(khung)].find((x) => x.checkVisibility());
			const ds = [k, k?.querySelector(hoi), k?.querySelector(nhap)].filter((x) => x?.checkVisibility());
			const vuot = ds.filter((x) => {
				const r = x.getBoundingClientRect();
				return r.right > innerWidth + 1 || r.left < -1;
			});
			return vuot.map((x) => `${x.getAttribute("data-o") ?? x.getAttribute("data-slot")} ${x.getBoundingClientRect().left.toFixed(0)}..${x.getBoundingClientRect().right.toFixed(0)}`);
		},
		KHUNG,
		CHON.hoiThoai,
		CHON.banNhap,
	);
}

function loiBeNgang(h, rong) {
	const loi = [];
	if (!h.khung) return ["khong thay khung"];
	if (rong >= MAN.nguongHep) {
		if (h.hoi && Math.abs(h.hoi.rong - h.R) > LE_PX) loi.push(`cot Kara ${so(h.hoi.rong)} != R ${so(h.R)}`);
		if (h.nhap && h.nhap.rong > h.A + LE_PX) loi.push(`ban nhap ${so(h.nhap.rong)} > A ${so(h.A)}`);
		if (h.khung.rong > h.iw - KHE_REM * h.rem + LE_PX) loi.push(`khung ${so(h.khung.rong)} > ${h.iw} - 2rem`);
	} else if (rong >= MAN.nguongDienThoai) {
		if (h.khung.rong > h.A + LE_TOKEN_PX) loi.push(`khung ${so(h.khung.rong)} > A + ${LE_TOKEN_PX}`);
	} else if (Math.abs(h.khung.rong - h.iw) > LE_TOAN_MAN_PX || Math.abs(h.khung.cao - h.ih) > LE_TOAN_MAN_PX)
		loi.push(`khung ${so(h.khung.rong)}x${so(h.khung.cao)} khong phu toan man ${h.iw}x${h.ih}`);
	return loi;
}

async function mot(id, st, cuoc, rong, nen, doDo, dem) {
	const t = await trang(MAN.kho[rong], nen);
	let mo = null;
	try {
		if (doDo === "tran-ngang") await datCss(t.p, '[data-o="ban-nhap"]{min-width:1200px!important}', "ban nhap min-w 1200px");
		const them = st.tab && rong < MAN.nguongHep ? `&tabSoan=${st.tab}` : "";
		if (st.khoa) {
			mo = await khoaBangCuoc();
			void t.p.goto(duongKhung(cuoc.id), { waitUntil: "load" }).catch(() => {});
		} else await moTrang(t, st.id ?? cuoc.id, them);
		if (st.esc) {
			await dungYen(t.p);
			await t.p.keyboard.press("Escape");
		}
		await choThay(t.p, (d) => [...document.querySelectorAll(d.chon)].some((o) => o.checkVisibility() && (o.innerText ?? "").includes(d.chu)), `${id} hien`, 30000, st.dau);
		await dungYen(t.p);
		await tre(MAN.cho.yenMs);
		const thay = await coDau(t.p, st.dau);
		const h = await hopKhung(t.p);
		const c = await tranVaCuon(t.p);
		const vuot = await doTran(t.p);
		const tep = join(doDo ? the.ra : BANG.evidence, `E11-${id}-${rong}-${nen}.png`);
		await t.p.screenshot({ path: tep });
		dem.o += 1;
		const loiConsole = t.loi.filter((l) => !(st.id && /status of 404/.test(l)));
		const loi = [
			!thay ? `thieu «${st.dau.chu}» o ${st.dau.chon}` : null,
			st.khongNhap && rong >= MAN.nguongHep && h.nhap ? "co o ban nhap khi chua co nhap" : null,
			c.sw > c.iw || vuot.length > 0 ? `TRAN ngang (scrollWidth ${c.sw}/${c.iw}${vuot.length ? `; vuot mep: ${vuot.join(", ")}` : ""})` : null,
			c.sy !== 0 ? `trang cuon (scrollY ${c.sy})` : null,
			...(st.khoa || st.id ? (h.khung ? [] : ["khong thay khung"]) : loiBeNgang(h, rong)),
			loiConsole.length > 0 ? `console loi — ${loiConsole[0].slice(0, 160)}` : null,
		].filter((x) => x !== null);
		const so1 = `khung ${h.slot ?? "-"} ${so(h.khung?.rong)}x${so(h.khung?.cao)} · hoi ${so(h.hoi?.rong)} · nhap ${so(h.nhap?.rong)}`;
		if (loi.length === 0) ghi(`   ${id} ${rong} ${nen}: dat (${so1})`);
		else saiThem(`   ${id} ${rong} ${nen}: ${loi.join(" · ")} (${so1})`);
		if (!thay) ghi(`      dang hien: ${await t.p.evaluate(() => `${location.pathname}${location.search} · ${(document.body.innerText ?? "").replace(/\s+/g, " ").slice(0, 200)}`)}`);
		if (doDo === "tran-ngang" && loi.some((l) => l.startsWith("TRAN"))) {
			ghi(`   o tran dau tien: ${id} ${rong} ${nen}`);
			if (mo) await mo();
			mo = null;
			await t.dong();
			await ket(1);
		}
	} finally {
		if (mo) await mo();
		await t.dong().catch(() => {});
	}
}

async function chup(id, st, cuoc, doDo, dem) {
	for (const rong of KHO) {
		if ((VO_NGHIA[id] ?? []).includes(rong)) continue;
		for (const nen of MAN.nen) await mot(id, st, cuoc, rong, nen, doDo, dem);
	}
}

async function lamMoi(t, cuocId) {
	if (!(await moTrang(t, cuocId))) await khongDo("khong mo lai duoc khung chinh");
	await choYen(t.p);
}

async function doiChieu(doDo) {
	const [r] = await sql(`SELECT id FROM "okrObjective" WHERE "cycleId" = $1 AND "departmentId" = $2 AND status <> 'da-bo' ORDER BY "createdAt" LIMIT 1`, [KY, PHONG]);
	if (!r) return false;
	const t = await trang(MAN.kho[1440], "dark");
	try {
		await t.p.goto(`${duongDonVi()}&record=${encodeURIComponent(`objective:${r.id}`)}`, { waitUntil: "load" });
		const thay = await choThay(t.p, (khung) => [...document.querySelectorAll(khung)].some((k) => k.checkVisibility() && k.querySelector('[data-slot="sheet-title"]')?.innerText.trim()), "khung Muc tieu", MAN.cho.manMs, KHUNG);
		await dungYen(t.p);
		await tre(MAN.cho.yenMs);
		if (!thay) return false;
		const tep = join(doDo ? the.ra : BANG.evidence, `${ANH_DOI_CHIEU}.png`);
		await t.p.screenshot({ path: tep });
		ghi(`   ANH doi chieu ${tep.slice(GOC.length + 1)} (Muc tieu ${r.id})`);
		return true;
	} finally {
		await t.dong();
	}
}

export async function phanMaTran({ doDo }) {
	const ids = idTrangThai();
	if (!ids?.length) await khongDo("khong doc duoc bang UX-STATE-TABLE cua thiet ke");
	const can = ids.filter((id) => !BO_TRANG_THAI.includes(id));
	const tinhTruoc = can.reduce((t, id) => t + (KHO.length - (VO_NGHIA[id] ?? []).length) * MAN.nen.length, 0);
	ghi(`   trang thai: ${can.join(", ")} (bo ${BO_TRANG_THAI.join(", ")}) · o vo nghia ${JSON.stringify(VO_NGHIA)} · so o viet truoc ${SO_O_VIET_TRUOC}, tinh tu bang ${tinhTruoc}`);
	if (tinhTruoc !== SO_O_VIET_TRUOC) {
		kiem(`so o tinh tu bang ${tinhTruoc} == so viet truoc ${SO_O_VIET_TRUOC}`, false);
		await ket(1);
	}
	const dem = { o: 0 };
	giuMoHinh(true);
	const cuoc = await moCuocMoi();
	const t0 = await trang(MAN.kho[1440]);
	try {
		const soVao = vao().length;
		await moTrang(t0, cuoc.id);
		if (!(await choMoHinh(soVao))) await khongDo("luot mo dau khong toi mo hinh");
		let st = trangThai(0);
		await chup("ST-khung-dang-soan-dau", st["ST-khung-dang-soan-dau"], cuoc, doDo, dem);
		await chup("ST-khung-dang-mo", st["ST-khung-dang-mo"], cuoc, doDo, dem);
		giuMoHinh(false);
		await lamMoi(t0, cuoc.id);
		st = trangThai((await docCuoc(cuoc.id)).soLuot);
		await chup("ST-khung-hep-rong", st["ST-khung-hep-rong"], cuoc, doDo, dem);
		if (!(await nop1(t0))) await khongDo("Kara khong nop ban nhap dau");
		await chup("ST-khung-rong", st["ST-khung-rong"], cuoc, doDo, dem);
		await chup("ST-khung-dien-thoai", st["ST-khung-dien-thoai"], cuoc, doDo, dem);
		giuMoHinh(true);
		const soTruoc = vao().length;
		await guiTin(t0, LENH.tiep, { choXong: false, choToi: false });
		if (!(await choMoHinh(soTruoc))) await khongDo("luot Tiep tuc khong toi mo hinh");
		await chup("ST-khung-rong-dang-soan", st["ST-khung-rong-dang-soan"], cuoc, doDo, dem);
		await chup("ST-khung-hoi-dong", st["ST-khung-hoi-dong"], cuoc, doDo, dem);
		giuMoHinh(false);
		await lamMoi(t0, cuoc.id);
		await chup("ST-khung-khong-mo", st["ST-khung-khong-mo"], cuoc, doDo, dem);
		await duaVaoTatCa(t0.p);
		if (!(await xacNhanDuaVao(t0.p))) await khongDo("khong dua vao duoc");
		await chup("ST-khung-da-dua-vao", st["ST-khung-da-dua-vao"], cuoc, doDo, dem);
	} finally {
		giuMoHinh(false);
		await t0.dong();
	}
	if (!(await doiChieu(doDo))) {
		saiThem("thieu anh doi chieu");
		await ket(1);
	}
	ghi(`   tong: ${dem.o} o`);
	kiem(`so o ${dem.o} == ${SO_O_VIET_TRUOC}`, dem.o === SO_O_VIET_TRUOC);
}
