import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import {
	APP,
	anh,
	buoc,
	choThay,
	chungTrang,
	choYen,
	dongBangNut,
	duongDonVi,
	dungYen,
	ghi,
	KHUNG,
	KY,
	khongDo,
	kiem,
	m,
	MAN,
	moCuoc,
	mui,
	saiThem,
	sql,
	the,
	trang,
} from "./man-chung.mjs";

const docUrl = (p) =>
	p.evaluate(() => ({
		duong: location.pathname,
		q: Object.fromEntries(new URLSearchParams(location.search)),
		lich: history.length,
	}));

async function choKhungSoan(p, ms = MAN.cho.manMs) {
	const thay = await choThay(
		p,
		(khung) =>
			[...document.querySelectorAll(`:is(${khung}) [data-trang-soan]`)].some(
				(o) => o.checkVisibility() && o.getAttribute("data-trang-soan") !== "dang-mo",
			),
		"khung soan",
		ms,
		KHUNG,
	);
	await dungYen(p);
	return thay;
}

async function cuocCua(id) {
	const [c] = await sql(`SELECT "cycleId", "departmentId" FROM "okrCuocSoan" WHERE id = $1`, [id]);
	return c ?? null;
}

async function buoc1(t) {
	await t.p.goto(duongDonVi(), { waitUntil: "load" });
	const coNut = await choThay(t.p, () => [...document.querySelectorAll('[data-nut-soan="nut"]')].some((x) => x.checkVisibility() && !x.disabled), "nut Soan");
	if (!coNut) await khongDo("Theo don vi khong co nut Soan cua phong");
	await t.p.evaluate(() => [...document.querySelectorAll('[data-nut-soan="nut"]')].find((x) => x.checkVisibility())?.click());
	const toi = await choThay(t.p, () => (new URLSearchParams(location.search).get("record") ?? "").startsWith("soan:"), "record=soan tren url");
	if (!toi) await khongDo("bam Soan khong ghi record=soan len url");
	await choKhungSoan(t.p);
	const u = await docUrl(t.p);
	const id = u.q.record.slice("soan:".length);
	const d = await t.p.evaluate((khung) => {
		const k = [...document.querySelectorAll('[data-slot="sheet-content"]')].find((x) => x.checkVisibility());
		return {
			size: k?.getAttribute("data-size") ?? null,
			ngoai: [...document.querySelectorAll("[data-trang-soan]")].filter((o) => !o.closest(khung)).length,
			trong: [...document.querySelectorAll("[data-trang-soan]")].filter((o) => o.closest(khung)).length,
		};
	}, KHUNG);
	ghi(`   bam Soan → ${u.duong}?record=${u.q.record} · sheet-content data-size=${d.size} · [data-trang-soan] trong khung ${d.trong}, ngoai khung ${d.ngoai}`);
	await chungTrang(t.p, "buoc 1");
	await anh(t, "E1b-soan-moi", t.doDo);
	buoc(
		1,
		!u.duong.endsWith("/okr/theo-don-vi")
			? `duong doi thanh ${u.duong}`
			: d.size !== "kara"
				? `khung khong phai sheet-content data-size=kara (${d.size})`
				: d.trong === 0
					? "khung khong co noi dung cuoc soan"
					: d.ngoai > 0
						? "con trang soan dung ngoai khung"
						: null,
	);
	return id;
}

async function buoc2(t, id) {
	const cuoc = await cuocCua(id);
	if (!cuoc) await khongDo(`khong doc duoc cuoc ${id} tu CSDL`);
	const truoc = (await docUrl(t.p)).lich;
	await t.p.goto(`${APP}/${the.slug}/okr/soan/${encodeURIComponent(id)}`, { waitUntil: "load" });
	const toi = await choThay(
		t.p,
		(id) => location.pathname.endsWith("/okr/theo-don-vi") && new URLSearchParams(location.search).get("record") === `soan:${id}`,
		"duong cu thanh theo don vi",
		MAN.cho.manMs,
		id,
	);
	await tre(MAN.cho.yenMs * 2);
	const u = await docUrl(t.p);
	ghi(`   duong cu → ${u.duong}?${new URLSearchParams(u.q)} · history.length ${truoc} → ${u.lich}`);
	const can = { kyOkr: cuoc.cycleId, donOkr: `pb:${cuoc.departmentId}`, record: `soan:${id}` };
	buoc(
		2,
		!toi
			? "duong cu khong chuyen sang Theo don vi voi record=soan"
			: u.q.kyOkr !== can.kyOkr || u.q.donOkr !== can.donOkr
				? `sai don vi hay chu ky: kyOkr=${u.q.kyOkr} donOkr=${u.q.donOkr}, can ${can.kyOkr} ${can.donOkr}`
				: u.lich !== truoc + 1
					? `duong cu them lich su: ${truoc} → ${u.lich}, can ${truoc + 1}`
					: null,
	);
	await choKhungSoan(t.p);
}

async function buoc3(t, id, doDo) {
	if (doDo === "push-link-cu") {
		await t.p.evaluateOnNewDocument(() => {
			const day = history.pushState.bind(history);
			history.replaceState = (...a) => day(...a);
		});
		ghi("   (chieu do push-link-cu: history.replaceState doi thanh pushState)");
	}
	const truoc = (await docUrl(t.p)).lich;
	await t.p.goto(`${duongDonVi()}&cuocSoan=${encodeURIComponent(id)}`, { waitUntil: "load" });
	const thay = await choThay(
		t.p,
		(id) => {
			const q = new URLSearchParams(location.search);
			return q.get("record") === `soan:${id}` && !q.has("cuocSoan");
		},
		"link cu thanh record",
		MAN.cho.manMs,
		id,
	);
	await choKhungSoan(t.p);
	await tre(MAN.cho.yenMs * 2);
	const u = await docUrl(t.p);
	ghi(`   link cu → ${u.duong}?${new URLSearchParams(u.q)} · history.length ${truoc} → ${u.lich}`);
	buoc(
		3,
		!thay
			? "link cu khong thanh record=soan hay con cuocSoan"
			: !u.duong.endsWith("/okr/theo-don-vi")
				? `duong doi thanh ${u.duong}`
				: u.lich > truoc + 1
					? "link cu them lich su"
					: null,
	);
}

async function buoc4(t) {
	const loiTruoc = t.loi.length;
	await t.p.goto(`${duongDonVi()}&record=${encodeURIComponent("soan:khong-co")}`, { waitUntil: "load" });
	const chu = mui.karaKhung.chuaDuoc(m.trang.khongMo);
	const thay = await choThay(
		t.p,
		(khung, chu) =>
			[...document.querySelectorAll(`:is(${khung}) [data-kara-state="error"]`)].some((o) => o.checkVisibility() && o.innerText.includes(chu)),
		"khung loi khong mo",
		MAN.cho.manMs,
		KHUNG,
		chu,
	);
	await dungYen(t.p);
	await chungTrang(t.p, "buoc 4");
	await anh(t, "E1b-khong-mo", t.doDo);
	const nut = await dongBangNut(t.p);
	const dong = await choThay(t.p, () => !new URLSearchParams(location.search).has("record"), "dong khung bo record", 10000);
	await tre(MAN.cho.yenMs);
	const u = await docUrl(t.p);
	ghi(`   khong mo: «${chu}» ${thay ? "hien" : "khong hien"} · nut dong ${nut} · sau dong ${u.duong}?${new URLSearchParams(u.q)}`);
	t.loi.push(...t.loi.splice(loiTruoc).filter((l) => !/status of 404|status of 400/.test(l)));
	buoc(4, !thay ? "id khong co ma khung khong bao loi" : !nut ? "khung loi khong co nut dong" : !dong ? "dong khung ma url con record" : null);
}

export async function phanDuong({ doDo }) {
	const t = { ...(await trang(MAN.kho[1440])), doDo };
	try {
		const id = await buoc1(t);
		await buoc2(t, id);
		await buoc3(t, id, doDo);
		await buoc4(t);
		kiem(`console khong loi (${t.loi.length})`, t.loi.length === 0);
		for (const l of t.loi.slice(0, 5)) ghi(`   console: ${l.slice(0, 200)}`);
	} finally {
		await t.dong();
	}
}

const AN_KHUNG_NGOAI_OKR = `(() => {
	if (location.pathname.includes("/okr/")) return;
	const dat = () => {
		const s = document.createElement("style");
		s.textContent = '[data-slot="sheet-content"][data-size="kara"],[data-slot="sheet-overlay"]{display:none!important}';
		document.documentElement.appendChild(s);
	};
	if (document.documentElement) dat();
	else document.addEventListener("DOMContentLoaded", dat);
})()`;

const TRANG_KHAC = [
	{ ten: "deals", duong: () => `${APP}/${the.slug}/deals` },
	{ ten: "cua-toi", duong: () => `${APP}/${the.slug}/okr?kyOkr=${encodeURIComponent(KY)}` },
];

async function tieuDeTrang(p) {
	await choThay(p, () => [...document.querySelectorAll('[data-slot="page-shell-title"]')].some((o) => o.checkVisibility()), "tieu de trang", MAN.cho.manMs);
	return p.evaluate(() => [...document.querySelectorAll('[data-slot="page-shell-title"]')].find((o) => o.checkVisibility())?.innerText.trim() ?? "");
}

async function motTrangKhac(cuoc, muc, doDo) {
	const t = await trang(MAN.kho[1440]);
	try {
		if (doDo === "host-chi-okr") {
			await t.p.evaluateOnNewDocument(AN_KHUNG_NGOAI_OKR);
			ghi("   (chieu do host-chi-okr: khung soan chi dung khi pathname chua /okr/)");
		}
		const nen = muc.duong();
		await t.p.goto(nen, { waitUntil: "load" });
		const tieuDe = await tieuDeTrang(t.p);
		const duongNen = new URL(nen).pathname;
		const coDau = nen.includes("?") ? "&" : "?";
		await t.p.goto(`${nen}${coDau}record=${encodeURIComponent(`soan:${cuoc.id}`)}`, { waitUntil: "load" });
		const mo = await choThay(
			t.p,
			(khung, chu) =>
				[...document.querySelectorAll(khung)].some(
					(k) =>
						k.checkVisibility() &&
						k.getAttribute("data-size") === "kara" &&
						[...k.querySelectorAll('[data-slot="sheet-title"],[data-slot="drawer-title"]')].some((x) => x.innerText.trim() === chu),
				),
			`${muc.ten} khung soan`,
			30000,
			KHUNG,
			m.trang.tieuDe,
		);
		await dungYen(t.p);
		const sau = await docUrl(t.p);
		await chungTrang(t.p, muc.ten);
		await anh(t, `E2b-tren-${muc.ten}`, doDo);
		if (!mo) {
			saiThem(`${muc.ten}: khong mo khung`);
			return;
		}
		if (sau.duong !== duongNen) {
			saiThem(`${muc.ten}: duong doi thanh ${sau.duong}`);
			return;
		}
		await choYen(t.p);
		const nut = await dongBangNut(t.p);
		const dong = await choThay(
			t.p,
			(khung) => !new URLSearchParams(location.search).has("record") && !document.querySelector(khung)?.checkVisibility(),
			"dong khung",
			10000,
			KHUNG,
		);
		await tre(MAN.cho.yenMs);
		const cuoi = await docUrl(t.p);
		const tieuDeSau = await tieuDeTrang(t.p);
		ghi(`   ${muc.ten}: khung «${m.trang.tieuDe}» tren ${sau.duong} · dong (nut ${nut}) → ${cuoi.duong}?${new URLSearchParams(cuoi.q)} · tieu de trang «${tieuDe}» → «${tieuDeSau}» · console ${t.loi.length}`);
		const loi = !nut || !dong ? "dong khung ma con record hay khung" : cuoi.duong !== duongNen ? `dong khung ve ${cuoi.duong}` : !tieuDeSau || tieuDeSau !== tieuDe ? "trang nen khong con sau khi dong" : null;
		if (loi) saiThem(`${muc.ten}: ${loi}`);
		else ghi(`${muc.ten}: dat`);
	} finally {
		await t.dong();
	}
}

export async function phanTrangKhac({ doDo }) {
	const cuoc = await moCuoc();
	ghi(`   cuoc ${cuoc.id}`);
	for (const muc of TRANG_KHAC) await motTrangKhac(cuoc, muc, doDo);
}

