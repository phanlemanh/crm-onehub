import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { LENH } from "./kich-ban.mjs";
import {
	anh,
	bamNutChu,
	buoc,
	CHON,
	choThay,
	choYen,
	chungTrang,
	dungYen,
	ghi,
	guiTin,
	KHUNG,
	khongDo,
	m,
	MAN,
	mo,
	moCuocMoi,
	moTrang,
	trang,
} from "./man-chung.mjs";

const NGOAI = { x: 40, y: 400 };
const VUOT_PX = 300;
const QUAN_SAT_MS = 2000;

export async function boBoGiu(p) {
	const va = { so: 0, tep: [] };
	await p.setRequestInterception(true);
	p.on("request", async (r) => {
		if (r.resourceType() !== "script" || !r.url().includes("/_next/")) return r.continue();
		try {
			const res = await fetch(r.url());
			const goc = await res.text();
			const moi = goc.replace(/\bkhai\(\s*dangSoan\s*\)/g, "khai(false)");
			if (moi !== goc) {
				va.so += 1;
				va.tep.push(new URL(r.url()).pathname.split("/").pop());
			}
			await r.respond({
				status: res.status,
				headers: { "content-type": res.headers.get("content-type") ?? "application/javascript; charset=utf-8" },
				body: moi,
			});
		} catch {
			await r.continue().catch(() => {});
		}
	});
	return va;
}

const trangThai = (p) =>
	p.evaluate(
		(khung, hoi, chu) => ({
			record: new URLSearchParams(location.search).get("record"),
			khung: [...document.querySelectorAll(khung)].some((k) => k.checkVisibility()),
			hoi: [...document.querySelectorAll(hoi)].some((h) => h.checkVisibility() && h.innerText.includes(chu)),
			soHoi: [...document.querySelectorAll(hoi)].filter((h) => h.checkVisibility()).length,
		}),
		KHUNG,
		CHON.hopHoi,
		m.trang.hoiDong.tieuDe,
	);

async function choDangSoan(p) {
	const thay = await choThay(
		p,
		(khung, chon) => [...document.querySelectorAll(`:is(${khung}) ${chon}`)].length > 0,
		"Kara dang soan",
		MAN.cho.manMs,
		KHUNG,
		CHON.dangLam,
	);
	return thay;
}

async function quanSatDong(p) {
	const han = Date.now() + QUAN_SAT_MS;
	let coHoi = false;
	let s = await trangThai(p);
	while (Date.now() < han) {
		s = await trangThai(p);
		if (s.soHoi > 0) coHoi = true;
		await tre(MAN.cho.nhipMs);
	}
	return { ...s, coHoi };
}

async function choHop(p) {
	return choThay(
		p,
		(hoi, tieuDe, than) => [...document.querySelectorAll(hoi)].some((h) => h.checkVisibility() && h.innerText.includes(tieuDe) && h.innerText.includes(than)),
		"hop hoi khi dong",
		10000,
		CHON.hopHoi,
		m.trang.hoiDong.tieuDe,
		m.trang.hoiDong.than,
	);
}

async function oLai(p) {
	const bam = await bamNutChu(p, `${CHON.hopHoi} button`, m.trang.hoiDong.thoi);
	await choThay(p, (hoi) => ![...document.querySelectorAll(hoi)].some((h) => h.checkVisibility()), "hop dong", 5000, CHON.hopHoi);
	await tre(MAN.cho.yenMs);
	return { bam, ...(await trangThai(p)) };
}

async function phan1440(cuocId, doDo) {
	const t = await trang(MAN.kho[1440]);
	try {
		const va = doDo === "khong-giu" ? await boBoGiu(t.p) : null;
		if (!(await mo(t, cuocId))) await khongDo("khong mo duoc cuoc o 1440");
		if (va) {
			ghi(`   (chieu do khong-giu: bo khai(dangSoan) cua bo giu trong ${va.so} tep: ${va.tep.join(", ")})`);
			if (va.so === 0) await khongDo("chieu do khong-giu: khong tim thay khai(dangSoan) trong ma da dung");
		}
		if (!(await guiTin(t, LENH.chamNop1, { choXong: false }))) await khongDo("luot 2 khong toi mo hinh");
		if (!(await choDangSoan(t.p))) await khongDo("khong thay Kara dang soan sau khi gui luot 2");
		await t.p.mouse.click(NGOAI.x, NGOAI.y);
		const s1 = await quanSatDong(t.p);
		ghi(`   bam (${NGOAI.x}, ${NGOAI.y}) ngoai khung khi dang soan: record ${s1.record} · khung ${s1.khung} · hop hoi ${s1.coHoi}`);
		await chungTrang(t.p, "sau bam ngoai");
		const ok1 = buoc(1, !s1.khung || !s1.record ? "ra ngoai dong khung" : s1.coHoi ? "ra ngoai hien hop hoi" : null);
		if (!ok1) return false;
		await t.p.keyboard.press("Escape");
		const hop = await choHop(t.p);
		await tre(MAN.cho.yenMs);
		await anh(t, "E7b-hoi-dong", doDo);
		const sauO = await oLai(t.p);
		const vanSoan = await t.p.evaluate((khung, chon) => document.querySelectorAll(`:is(${khung}) ${chon}`).length > 0, KHUNG, CHON.dangLam);
		ghi(`   Escape khi dang soan: hop hoi ${hop} · «${m.trang.hoiDong.thoi}» (bam ${sauO.bam}) → hop ${sauO.soHoi}, khung ${sauO.khung}, record ${sauO.record}, Kara van soan ${vanSoan}`);
		buoc(2, !hop ? "Escape khi dang soan khong hien hop hoi" : sauO.soHoi > 0 || !sauO.khung || !sauO.record ? "O lai khong giu khung" : null);
		await choYen(t.p);
		return true;
	} finally {
		await t.dong();
	}
}

async function phan375(cuocId, doDo) {
	const t = await trang(MAN.kho[375]);
	try {
		if (!(await moTrang(t, cuocId))) await khongDo("khong mo duoc cuoc o 375");
		await choYen(t.p);
		if (!(await guiTin(t, LENH.chamNop2, { choXong: false }))) await khongDo("luot 3 khong toi mo hinh");
		if (!(await choDangSoan(t.p))) await khongDo("khong thay Kara dang soan o 375");
		await dungYen(t.p);
		const r = await t.p.evaluate((khung) => {
			const k = [...document.querySelectorAll(khung)].find((x) => x.checkVisibility());
			const b = k?.getBoundingClientRect();
			return b ? { x: b.left + b.width / 2, y: b.top + 16 } : null;
		}, KHUNG);
		if (!r) await khongDo("khong thay khung o 375");
		await t.p.mouse.move(r.x, r.y);
		await t.p.mouse.down();
		await t.p.mouse.move(r.x, r.y + VUOT_PX, { steps: 20 });
		await t.p.mouse.up();
		const hop = await choHop(t.p);
		await anh(t, "E7b-vuot-375", doDo);
		const sauO = await oLai(t.p);
		ghi(`   375 vuot ${VUOT_PX} px tu dau khung khi dang soan: hop hoi ${hop} · O lai → khung ${sauO.khung}, record ${sauO.record}`);
		buoc(3, !hop ? (sauO.khung ? "vuot xuong khong hien hop hoi" : "vuot xuong dong khung khi dang soan") : !sauO.khung ? "O lai khong giu khung" : null);
		if (!(await choYen(t.p))) await khongDo("luot 3 khong xong");
		await dungYen(t.p);
		await t.p.keyboard.press("Escape");
		const s4 = await quanSatDong(t.p);
		ghi(`   Kara ranh, Escape: record ${s4.record} · khung ${s4.khung} · hop hoi ${s4.coHoi}`);
		await chungTrang(t.p, "sau Escape khi ranh");
		buoc(4, s4.coHoi ? "Kara ranh ma Escape hien hop hoi" : s4.khung || s4.record ? "Kara ranh ma Escape khong dong khung" : null);
	} finally {
		await t.dong();
	}
}

export async function phanDong({ doDo }) {
	const cuoc = await moCuocMoi();
	if (!(await phan1440(cuoc.id, doDo))) return;
	await phan375(cuoc.id, doDo);
}
