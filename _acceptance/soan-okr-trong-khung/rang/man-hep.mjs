import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { DEM } from "./kich-ban.mjs";
import { datCss, so } from "./do-khung.mjs";
import {
	anh,
	bamTab,
	chungTrang,
	choThay,
	dungYen,
	ghi,
	hopKhung,
	KHUNG,
	khongDo,
	kiem,
	m,
	MAN,
	mo,
	moCuocMoi,
	moTrang,
	nop1,
	saiThem,
	tranVaCuon,
	trang,
} from "./man-chung.mjs";

const KHO = [
	[375, 812],
	[768, 1024],
	[1023, 768],
];
const LE_TOAN_MAN_PX = 2;
const LE_TOKEN_PX = 8;

const NGAN_KEO_88 = {
	css: '[data-slot="drawer-content"]{height:88dvh!important;max-height:88dvh!important}',
	moTa: "ngan keo cao 88dvh",
};

const tabDangChon = (p) =>
	p.evaluate((khung) => {
		const k = [...document.querySelectorAll(khung)].find((x) => x.checkVisibility());
		return k ? [...k.querySelectorAll('[role="tablist"] [role="tab"]')].findIndex((x) => x.getAttribute("aria-selected") === "true") : -1;
	}, KHUNG);

async function motO(cuocId, rong, cao, doDo) {
	const t = await trang({ rong, cao });
	try {
		if (doDo === "ngan-keo-88") await datCss(t.p, NGAN_KEO_88.css, NGAN_KEO_88.moTa);
		if (!(await moTrang(t, cuocId))) await khongDo(`${rong}: khung soan khong mo`);
		await choThay(t.p, (khung) => [...document.querySelectorAll(`:is(${khung}) [role="tab"]`)].some((x) => x.checkVisibility()), `${rong} thanh tab`, 15000, KHUNG);
		await dungYen(t.p);
		await chungTrang(t.p, String(rong));
		const h = await hopKhung(t.p);
		const canTab = [m.man.tabTroChuyen, m.man.tabBanNhap(String(DEM.nop1.mucTieu + DEM.nop1.kr))];
		await bamTab(t.p, 1);
		const len = await choThay(t.p, () => new URLSearchParams(location.search).get("tabSoan") === "ban-nhap", `${rong} tabSoan tren url`, 5000);
		await t.p.reload({ waitUntil: "load" });
		await choThay(t.p, (khung) => [...document.querySelectorAll(`:is(${khung}) [role="tab"]`)].some((x) => x.checkVisibility()), `${rong} tab sau tai lai`, MAN.cho.manMs, KHUNG);
		await dungYen(t.p);
		await tre(MAN.cho.yenMs);
		const giu = await tabDangChon(t.p);
		const tran = await tranVaCuon(t.p);
		await anh(t, `E6-${rong}`, doDo);
		const w = h.khung?.rong;
		const c = h.khung?.cao;
		ghi(
			`   o ${rong}x${cao}: ${h.slot}${h.phuToanMan ? "[phu-toan-man]" : ""} ${so(w)}x${so(c)} (khung nhin ${h.iw}x${h.ih}, A ${so(h.A)}) · tab ${JSON.stringify(h.tab)} · bam Ban nhap → tabSoan ${len} · tai lai: tab ${giu} dang chon · scrollWidth ${tran.sw}/${tran.iw}`,
		);
		const loi = [];
		if (rong < MAN.nguongDienThoai) {
			if (!h.khung || Math.abs(w - h.iw) > LE_TOAN_MAN_PX || Math.abs(c - h.ih) > LE_TOAN_MAN_PX) loi.push(`${rong}: khung khong phu toan man`);
		} else if (h.slot !== "sheet-content" || !h.khung || w > h.A + LE_TOKEN_PX) loi.push(`${rong}: khung ${so(w)} px rong qua ${so(h.A + LE_TOKEN_PX)}`);
		if (JSON.stringify(h.tab) !== JSON.stringify(canTab)) loi.push(`${rong}: tab ${JSON.stringify(h.tab)} khac ${JSON.stringify(canTab)}`);
		if (!len) loi.push(`${rong}: bam tab Ban nhap khong ghi tabSoan len url`);
		if (giu !== 1) loi.push(`${rong}: tai lai khong giu tab Ban nhap`);
		if (tran.sw !== tran.iw) loi.push(`${rong}: tran ngang ${tran.sw}/${tran.iw}`);
		if (loi.length === 0) ghi(`   o ${rong}x${cao}: dat`);
		else saiThem(`   ${loi.join(" · ")}`);
		return 1;
	} finally {
		await t.dong();
	}
}

export async function phanHep({ doDo }) {
	const cuoc = await moCuocMoi();
	const t = await trang(MAN.kho[1440]);
	try {
		if (!(await mo(t, cuoc.id)) || !(await nop1(t))) await khongDo("khong dung duoc ban nhap dau");
	} finally {
		await t.dong();
	}
	let soO = 0;
	for (const [rong, cao] of KHO) soO += await motO(cuoc.id, rong, cao, doDo);
	ghi(`   so o: ${soO}`);
	kiem(`so o ${soO} == ${KHO.length}`, soO === KHO.length);
}
