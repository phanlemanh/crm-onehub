import { tre, trpc } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { DEM, LENH, TEN } from "./kich-ban.mjs";
import {
	API,
	anh,
	buoc,
	CHON,
	choThay,
	duongDonVi,
	duongSoan,
	ghi,
	guiTin,
	khongDo,
	kiem,
	m,
	MAN,
	mo,
	moCuoc,
	moTrang,
	mui,
	oCuonTrong,
	the,
	tranVaCuon,
	trang,
} from "./man-chung.mjs";

const KHO_RONG = [
	[1024, 768],
	[1280, 900],
	[1440, 1000],
];
const KHO_HEP = [
	[375, 812],
	[768, 1024],
	[1023, 768],
];
const KHO_TRAN = [375, 768, 1024, 1440];
const MAC_DINH = { tu: 372, den: 388 };
const TOI_THIEU_PX = 300;
const LE_NUA_THAN_PX = 2;
const KEO_1440_PX = 300;
const KEO_1440_TOI_THIEU_PX = 200;
const LAN_TAB_TOI_DA = 120;
const LAN_CUON_PX = 400;
const CAO_CUON = 600;
const CAO_MOC = 480;

const hien = () => (chon) => [...document.querySelectorAll(chon)].some((x) => x.checkVisibility());

async function dauTrang(p) {
	await choThay(p, hien(), "dau trang", MAN.cho.manMs, "[data-dau-soan]");
	return p.evaluate(() => ({
		ve: document.querySelector('[data-nut="ve-theo-don-vi"]')?.textContent ?? "",
		dau: [...document.querySelectorAll("[data-dau-soan]")].find((x) => x.checkVisibility())?.textContent ?? "",
		sheet: document.querySelectorAll('[data-slot="sheet-content"]').length,
		tab: document.querySelectorAll('[role="tablist"]').length,
	}));
}

const loiDau = (dau, cuoc) =>
	dau.sheet > 0
		? "con sheet"
		: dau.tab > 0
			? "con thanh tab OKR"
			: !dau.ve.includes(m.trang.veTheoDonVi) ||
					!dau.dau.includes(cuoc.tenDonVi) ||
					!dau.dau.includes(cuoc.tenChuKy) ||
					!dau.dau.includes(m.man.luot(String(cuoc.soLuot), String(cuoc.tranLuot)))
				? "dau trang thieu lien ket, don vi, chu ky hay so luot"
				: null;

async function bamDauTien(p, chon) {
	return p.evaluate((chon) => {
		const o = [...document.querySelectorAll(chon)].find((x) => x.checkVisibility());
		o?.click();
		return !!o;
	}, chon);
}

export async function phanDuong({ doDo }) {
	const t = await trang(MAN.kho[1440]);
	try {
		await t.p.goto(duongDonVi(), { waitUntil: "load" });
		await choThay(t.p, hien(), "nut soan", MAN.cho.manMs, '[data-nut-soan="nut"]');
		await bamDauTien(t.p, '[data-nut-soan="nut"]');
		const toi = await choThay(t.p, () => /\/okr\/soan\/[^/]+$/.test(location.pathname), "toi trang soan");
		if (!toi) await khongDo("bam Soan khong toi trang soan");
		const id = await t.p.evaluate(() => location.pathname.split("/").pop());
		const { cuoc } = await trpc(API, the.tl).hoi("okr.soanDanhSach", { cuocSoanId: id });
		const dau = await dauTrang(t.p);
		ghi(`   bam Soan → ${await t.p.evaluate(() => location.pathname)} · dau «${dau.dau}» · sheet ${dau.sheet} · tablist ${dau.tab}`);
		await anh(t, "E1b-soan-moi", doDo);
		await t.p.goto(duongDonVi(), { waitUntil: "load" });
		await choThay(t.p, hien(), "nut tiep", MAN.cho.manMs, '[data-nut-soan="nut-tiep"] button');
		await bamDauTien(t.p, '[data-nut-soan="nut-tiep"] button');
		const tiep = await choThay(t.p, (id) => location.pathname.endsWith(`/okr/soan/${id}`), "tiep dung cuoc", MAN.cho.manMs, id);
		buoc(1, loiDau(dau, cuoc) ?? (tiep ? null : "Tiep tuc khong toi dung cuoc"));

		if (doDo === "push-link-cu")
			await t.p.evaluateOnNewDocument(() => {
				const day = history.pushState.bind(history);
				history.replaceState = (...a) => day(...a);
			});
		const a = duongDonVi();
		await t.p.goto(a, { waitUntil: "load" });
		const truoc = await t.p.evaluate(() => history.length);
		await t.p.goto(`${a}&cuocSoan=${id}`, { waitUntil: "load" });
		const thay = await choThay(t.p, (id) => location.pathname.endsWith(`/okr/soan/${id}`), "link cu thay", MAN.cho.manMs, id);
		await tre(MAN.cho.yenMs);
		const sauMo = await t.p.evaluate(() => history.length);
		await t.p.goBack({ waitUntil: "load" });
		await tre(MAN.cho.yenMs * 2);
		const quayVe = await t.p.evaluate(() => location.pathname + location.search);
		const can = new URL(a).pathname + new URL(a).search;
		ghi(`   history.length truoc ${truoc} · sau link cu ${sauMo} · quay lai ${quayVe}`);
		buoc(2, !thay ? "link cu khong toi trang soan" : sauMo > truoc + 1 || quayVe !== can ? "link cu them lich su" : null);

		await moTrang(t, id);
		await bamDauTien(t.p, '[data-nut="ve-theo-don-vi"]');
		const ve = await choThay(t.p, () => location.pathname.endsWith("/okr/theo-don-vi"), "ve theo don vi");
		const q = await t.p.evaluate(() => Object.fromEntries(new URLSearchParams(location.search)));
		ghi(`   ve: ${await t.p.evaluate(() => location.pathname)} kyOkr=${q.kyOkr} donOkr=${q.donOkr}`);
		buoc(3, !ve ? "khong ve theo don vi" : q.kyOkr !== cuoc.cycleId || q.donOkr !== `pb:${cuoc.departmentId}` ? "ve sai don vi hay chu ky" : null);

		const loiTruoc = t.loi.length;
		await t.p.goto(duongSoan("khong-co"), { waitUntil: "load" });
		const tieuDe = mui.karaKhung.chuaDuoc(m.trang.khongMo);
		const khongMo = await choThay(
			t.p,
			(chu) => [...document.querySelectorAll('[data-kara-state="error"] [data-slot="empty-title"]')].some((o) => o.checkVisibility() && o.textContent === chu),
			"khong mo",
			MAN.cho.manMs,
			tieuDe,
		);
		const veKhongMo = await t.p.evaluate(() => document.querySelector('[data-nut="ve-theo-don-vi"]')?.getAttribute("href") ?? "");
		ghi(`   khong mo: «${tieuDe}» ${khongMo ? "hien" : "khong hien"} · lien ket ${veKhongMo}`);
		await anh(t, "E1b-khong-mo", doDo);
		t.loi.push(...t.loi.splice(loiTruoc).filter((l) => !/status of 404/.test(l)));
		buoc(4, !khongMo ? "id khong co ma khong bao khong mo duoc" : !veKhongMo.endsWith("/okr/theo-don-vi") ? `lien ket ve sai: ${veKhongMo}` : null);
		kiem(`console khong loi (${t.loi.length})`, t.loi.length === 0);
		for (const l of t.loi.slice(0, 5)) ghi(`   console: ${l.slice(0, 200)}`);
	} finally {
		await t.dong();
	}
}

async function rongO(p) {
	return p.evaluate((chon) => {
		const o = document.querySelector(chon)?.closest('[data-slot="resizable-panel"]');
		const nhom = document.querySelector('[data-slot="resizable-panel-group"]');
		return o && nhom ? { o: o.getBoundingClientRect().width, nhom: nhom.getBoundingClientRect().width } : null;
	}, CHON.oHoiThoai);
}

async function keo(p, dx) {
	const h = await p.$(CHON.thanh);
	const r = h && (await h.boundingBox());
	if (!r) return false;
	const x = r.x + r.width / 2;
	const y = r.y + r.height / 2;
	await p.mouse.move(x, y);
	await p.mouse.down();
	await p.mouse.move(x + dx, y, { steps: 12 });
	await p.mouse.up();
	await tre(MAN.cho.yenMs);
	return true;
}

async function chuanTrang(t, cuocId, rong, cao, doDo) {
	await t.p.setViewport({ width: rong, height: cao });
	await moTrang(t, cuocId);
	if (rong >= 1024) await choThay(t.p, hien(), "thanh keo", 15000, CHON.thanh);
	if (doDo === "khoa-thanh") await t.p.evaluate((chon) => document.querySelector(chon)?.remove(), CHON.thanh);
}

async function lanO(p, chon) {
	const o = await oCuonTrong(p, chon);
	if (!o) return null;
	await p.mouse.move(o.x, o.y);
	await p.mouse.wheel({ deltaY: LAN_CUON_PX });
	await tre(MAN.cho.yenMs);
	const sau = await oCuonTrong(p, chon);
	const cuaSo = await p.evaluate(() => window.scrollY);
	return { truoc: o.top, sau: sau?.top ?? o.top, cuaSo };
}

export async function phanKhung({ doDo, nop1 }) {
	const cuoc = await moCuoc();
	const t = await trang(MAN.kho[1440]);
	try {
		if (!(await mo(t, cuoc.id)) || !(await nop1(t))) await khongDo("khong dung duoc ban nhap dau");
		for (let i = 0; i < 2; i += 1) if (!(await guiTin(t, LENH.tiep))) await khongDo("khong gui duoc luot them cho hoi thoai");
		let soO = 0;
		let doiCo = true;
		for (const [rong, cao] of KHO_RONG) {
			await chuanTrang(t, cuoc.id, rong, cao, doDo);
			const dau = await rongO(t.p);
			const thanh = await t.p.evaluate((chon) => {
				const h = document.querySelector(chon);
				return h ? { vai: h.getAttribute("role"), ten: h.getAttribute("aria-label") } : null;
			}, CHON.thanh);
			const coKeo = await keo(t.p, -2000);
			const nho = await rongO(t.p);
			await keo(t.p, 4000);
			const lon = await rongO(t.p);
			ghi(`   o ${rong}x${cao}: than ${dau?.nhom.toFixed(1)} · mac dinh ${dau?.o.toFixed(1)} · nho nhat ${nho?.o.toFixed(1)} · lon nhat ${lon?.o.toFixed(1)} · thanh ${thanh?.vai} «${thanh?.ten}»`);
			soO += 1;
			if (!coKeo || !nho || !lon || Math.abs(lon.o - nho.o) < 1) doiCo = false;
			kiem(`${rong} mac dinh trong [${MAC_DINH.tu}, ${MAC_DINH.den}]`, !!dau && dau.o >= MAC_DINH.tu && dau.o <= MAC_DINH.den);
			kiem(`${rong} khong nho hon ${TOI_THIEU_PX} px va khong lon hon nua than + ${LE_NUA_THAN_PX}`, !!nho && !!lon && nho.o >= TOI_THIEU_PX - 1 && lon.o <= lon.nhom / 2 + LE_NUA_THAN_PX);
			kiem(`${rong} thanh role=separator, aria-label «${m.trang.thanhKeo}»`, thanh?.vai === "separator" && thanh.ten === m.trang.thanhKeo);
		}
		ghi(`   so o kho rong: ${soO}`);
		kiem(`so o kho rong ${soO} == ${KHO_RONG.length}`, soO === KHO_RONG.length);

		await chuanTrang(t, cuoc.id, 1440, 1000, doDo);
		const truoc = await rongO(t.p);
		await keo(t.p, KEO_1440_PX);
		const sau = await rongO(t.p);
		ghi(`   1440 keo +${KEO_1440_PX}: ${truoc?.o.toFixed(1)} → ${sau?.o.toFixed(1)} px`);
		if (!truoc || !sau || sau.o - truoc.o <= KEO_1440_TOI_THIEU_PX) doiCo = false;
		if (!doiCo) {
			ghi("   thanh khong doi co");
			kiem("thanh doi co khi keo", false);
		} else kiem(`1440 keo rong them > ${KEO_1440_TOI_THIEU_PX} px`, true);

		if (doDo !== "khoa-thanh") {
			await chuanTrang(t, cuoc.id, 1440, 1000, doDo);
			let toi = false;
			for (let i = 0; i < LAN_TAB_TOI_DA && !toi; i += 1) {
				await t.p.keyboard.press("Tab");
				toi = await t.p.evaluate((chon) => document.activeElement?.matches(chon) === true, CHON.thanh);
			}
			const dauPhim = await rongO(t.p);
			await t.p.keyboard.press("ArrowRight");
			await t.p.keyboard.press("ArrowRight");
			await tre(MAN.cho.yenMs);
			const sauPhim = await rongO(t.p);
			const vien = await t.p.evaluate((chon) => {
				const h = document.querySelector(chon);
				const k = h && getComputedStyle(h);
				return k ? { thay: h.matches(":focus-visible"), bong: k.boxShadow, vien: k.outlineStyle } : null;
			}, CHON.thanh);
			await anh(t, "E2-focus-thanh", doDo);
			ghi(`   Tab toi thanh ${toi} · ArrowRight x2: ${dauPhim?.o.toFixed(1)} → ${sauPhim?.o.toFixed(1)} px · vong focus ${vien?.bong}`);
			kiem("Tab dat focus len thanh", toi);
			kiem("ArrowRight hai lan lam o hoi thoai rong ra", !!dauPhim && !!sauPhim && sauPhim.o > dauPhim.o);
			kiem("vong focus thay duoc", !!vien && vien.thay && (vien.bong !== "none" || vien.vien !== "none"));
		}

		await chuanTrang(t, cuoc.id, 1440, CAO_CUON, null);
		if (doDo === "cuon-trang")
			await t.p.addStyleTag({
				content: '[data-trang-soan],[data-slot="resizable-panel-group"],[data-slot="resizable-panel"],[data-cot],main,[data-slot="kara-artifact"],[data-slot="kara-artifact-content"],[data-slot="kara-transcript"],[role="log"],[role="log"] *{overflow:visible!important;height:auto!important;max-height:none!important;min-height:0!important;flex:none!important}',
			});
		await tre(MAN.cho.yenMs);
		await lanToi(t.p, CHON.oBanNhap, -5000);
		await lanToi(t.p, CHON.oHoiThoai, -5000);
		const banNhap = await lanO(t.p, CHON.oBanNhap);
		const hoiThoai = await lanO(t.p, CHON.oHoiThoai);
		const c = await tranVaCuon(t.p);
		ghi(`   lan ban nhap: ${banNhap ? `${banNhap.truoc} → ${banNhap.sau}` : "khong co vung cuon"} · lan hoi thoai: ${hoiThoai ? `${hoiThoai.truoc} → ${hoiThoai.sau}` : "khong co vung cuon"} · window.scrollY ${banNhap?.cuaSo ?? 0} · trang ${c.sh}/${c.ch}`);
		const trangCuon = c.sh > c.ch + 1 || (banNhap?.cuaSo ?? 0) > 0 || (hoiThoai?.cuaSo ?? 0) > 0;
		if (trangCuon || !banNhap || !hoiThoai) {
			ghi("   trang cuon thay o");
			kiem("moi o tu cuon, trang khong cuon", false);
		} else kiem("lan chuot cuon ban nhap va hoi thoai, trang khong cuon", banNhap.sau > banNhap.truoc && hoiThoai.sau > hoiThoai.truoc);

		let soHep = 0;
		for (const [rong, cao] of KHO_HEP) {
			await chuanTrang(t, cuoc.id, rong, cao, null);
			await choThay(t.p, hien(), `${rong} thanh tab`, 15000, '[data-khung="hep"] [role="tab"]');
			const tab = await t.p.evaluate(() => [...document.querySelectorAll('[data-khung="hep"] [role="tab"]')].map((x) => x.textContent?.trim()));
			const tay = await t.p.evaluate((chon) => document.querySelectorAll(chon).length, CHON.thanh);
			kiem(`${rong}x${cao}: khong thanh keo (${tay}), hai tab ${JSON.stringify(tab)}`, tay === 0 && tab.length === 2 && tab[0] === m.man.tabTroChuyen && tab[1] === m.man.tabBanNhap(String(DEM.nop1.mucTieu + DEM.nop1.kr)));
			await t.p.evaluate(() => {
				const tab = document.querySelectorAll('[data-khung="hep"] [role="tab"]')[1];
				tab?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0 }));
				tab?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
				tab?.click();
			});
			await choThay(t.p, () => new URLSearchParams(location.search).get("tab") === "ban-nhap", "tab tren url", 5000);
			if (doDo === "tab-khong-url") await t.p.evaluate(() => history.replaceState(history.state, "", location.pathname));
			await t.p.reload({ waitUntil: "load" });
			const giu = await choThay(
				t.p,
				() => document.querySelectorAll('[data-khung="hep"] [role="tab"]')[1]?.getAttribute("aria-selected") === "true",
				"tab giu sau tai lai",
				15000,
			);
			if (!giu) {
				ghi("   tab khong tren url");
				kiem(`${rong} tab giu sau tai lai`, false);
			} else kiem(`${rong} tab tren url va giu sau tai lai`, true);
			soHep += 1;
		}
		ghi(`   so o kho hep: ${soHep}`);
		kiem(`so o kho hep ${soHep} == ${KHO_HEP.length}`, soHep === KHO_HEP.length);
		for (const rong of KHO_TRAN) {
			await t.p.setViewport({ width: rong, height: MAN.kho[rong].cao });
			await tre(MAN.cho.yenMs);
			const x = await t.p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
			kiem(`${rong} px scrollWidth ${x.sw} == innerWidth ${x.iw}`, x.sw <= x.iw);
		}
		if (!doDo) kiem(`console khong loi (${t.loi.length})`, t.loi.length === 0);
		for (const l of t.loi.slice(0, 5)) ghi(`   console: ${l.slice(0, 200)}`);
	} finally {
		await t.dong();
	}
}

async function trongKhungO(p, chon, chonO) {
	return p.evaluate(
		(chon, chonO) => {
			const goc = document.querySelector(chonO);
			const o = [...document.querySelectorAll(chon)].filter((x) => x.checkVisibility());
			const dich = o[o.length - 1];
			if (!goc || !dich) return null;
			const cuon = [goc, ...goc.querySelectorAll("*")].find(
				(x) => ["auto", "scroll"].includes(getComputedStyle(x).overflowY) && x.scrollHeight > x.clientHeight && x.contains(dich),
			);
			const k = (cuon ?? goc).getBoundingClientRect();
			const r = dich.getBoundingClientRect();
			return r.bottom > k.top && r.top < k.bottom;
		},
		chon,
		chonO,
	);
}

async function dongNgoaiKhung(p) {
	return p.evaluate((chonO) => {
		const goc = document.querySelector(chonO);
		const cuon = goc && [goc, ...goc.querySelectorAll("*")].find((x) => ["auto", "scroll"].includes(getComputedStyle(x).overflowY) && x.scrollHeight > x.clientHeight);
		if (!cuon) return [];
		const k = cuon.getBoundingClientRect();
		return [...cuon.querySelectorAll("[data-khoa-dong]")]
			.filter((d) => {
				const r = d.getBoundingClientRect();
				return !(r.bottom > k.top && r.top < k.bottom);
			})
			.map((d) => d.getAttribute("data-khoa-dong"));
	}, CHON.oBanNhap);
}

async function chuMoc(p) {
	return p.evaluate((chon) => [...document.querySelectorAll(chon)].map((b) => b.textContent?.trim()), CHON.moc);
}

async function lanToi(p, chonO, dy) {
	const o = await oCuonTrong(p, chonO);
	if (!o) return false;
	await p.mouse.move(o.x, o.y);
	await p.mouse.wheel({ deltaY: dy });
	await tre(MAN.cho.yenMs);
	return true;
}

export async function phanMoc({ doDo, nop1 }) {
	const cuoc = await moCuoc();
	const t = await trang({ rong: 1440, cao: CAO_MOC });
	try {
		if (!(await mo(t, cuoc.id)) || !(await nop1(t))) await khongDo("khong dung duoc ban nhap dau");
		if (!(await guiTin(t, LENH.nop2))) await khongDo("lan nop thu hai khong xong");
		await choThay(t.p, (chon) => document.querySelectorAll(chon).length === 2, "hai moc", MAN.cho.luotMs, CHON.moc);
		const can = [
			mui.karaKhung.mocDau(m.moc.dau(String(DEM.nop1.mucTieu), String(DEM.nop1.kr))),
			mui.karaKhung.moc(
				[m.moc.themKr(String(DEM.nop2.themKr)), m.moc.sua(String(DEM.nop2.sua)), m.moc.chuyen(String(DEM.nop2.chuyen)), m.moc.bo(String(DEM.nop2.bo))].join(" · "),
			),
		];
		const co = await chuMoc(t.p);
		const thuTu = await t.p.evaluate(() =>
			[...document.querySelectorAll('[data-kara-turn="user"],[data-kara-turn="checkpoint"]')].map((d) => d.getAttribute("data-kara-turn")).join(","),
		);
		ghi(`   moc: ${JSON.stringify(co)} · thu tu ${thuTu}`);
		await anh(t, "E8c-moc-1440", doDo);
		buoc(1, JSON.stringify(co) !== JSON.stringify(can) ? `moc sai chu, can ${JSON.stringify(can)}` : !thuTu.endsWith("user,checkpoint,user,checkpoint") ? "moc khong dung cho hai lan nop" : null);

		await lanToi(t.p, CHON.oBanNhap, 5000);
		const ngoai = await dongNgoaiKhung(t.p);
		await t.p.evaluate((chon) => document.querySelectorAll(chon)[1]?.click(), CHON.moc);
		const noi = await choThay(t.p, () => !!document.querySelector("fieldset[data-noi]"), "dong noi", 5000);
		const khoaNoi = await t.p.evaluate(() => {
			const o = document.querySelector("fieldset[data-noi]");
			const k = o && (o.matches("[data-khoa-dong]") ? o : (o.querySelector("[data-khoa-dong]") ?? o.closest("[data-khoa-dong]")));
			return k?.getAttribute("data-khoa-dong") ?? null;
		});
		let vao = false;
		for (let i = 0; noi && !vao && i < 20; i += 1) {
			await tre(MAN.cho.nhipMs);
			vao = await trongKhungO(t.p, "fieldset[data-noi]", CHON.oBanNhap);
		}
		ghi(`   truoc khi bam: ${ngoai.length} dong ngoai khung · dong noi ${khoaNoi} · truoc do ngoai khung ${ngoai.includes(khoaNoi)} · sau khi bam trong khung ${vao}`);
		await anh(t, "E8c-noi-dong", doDo);
		buoc(2, !noi ? "bam moc khong lam noi dong doi" : !ngoai.includes(khoaNoi) ? "khong dung duoc doi chung: dong doi da trong khung truoc khi bam" : !vao ? "dong doi khong vao khung nhin" : null);

		await lanToi(t.p, CHON.oHoiThoai, -5000);
		const mocTruoc = await trongKhungO(t.p, '[data-kara-turn="checkpoint"]', CHON.oHoiThoai);
		const nhan = await t.p.$('[data-nhan-dong="vua-sua"]');
		const laNut = nhan && (await nhan.evaluate((o) => o.tagName === "BUTTON"));
		if (nhan) await nhan.evaluate((o) => o.click());
		await tre(MAN.cho.yenMs * 2);
		const mocSau = await trongKhungO(t.p, '[data-kara-turn="checkpoint"]', CHON.oHoiThoai);
		const gach = await t.p.evaluate((cu, moi) => {
			const d = [...document.querySelectorAll("[data-dong]")].find((x) => x.textContent?.includes(moi));
			return d?.querySelector("del")?.textContent?.trim() === cu;
		}, TEN.m1, TEN.m1Sua);
		ghi(`   moc moi nhat trong khung hoi thoai: truoc ${mocTruoc} · sau khi bam nhan ${mocSau} · chu cu gach ${gach}`);
		buoc(
			3,
			!laNut ? "nhan vua sua khong phai nut" : mocTruoc !== false ? "khong dung duoc doi chung: moc moi nhat da trong khung truoc khi bam" : !mocSau ? "bam nhan khong dua moc moi nhat vao khung" : !gach ? "dong vua sua khong co chu cu gach" : null,
		);

		if (doDo === "moc-tu-bo-nho") {
			await t.p.setRequestInterception(true);
			t.p.on("request", (r) => (r.method() === "GET" && new URL(r.url()).pathname.includes(MAN.cua) ? r.abort() : r.continue()));
		}
		await t.p.reload({ waitUntil: "load" });
		await choThay(t.p, (chon) => document.querySelectorAll(chon).length === 2, "moc sau tai lai", 30000, CHON.moc);
		const sau = await chuMoc(t.p);
		ghi(`   sau tai lai: ${JSON.stringify(sau)}`);
		buoc(4, JSON.stringify(sau) !== JSON.stringify(can) ? "moc mat sau tai lai" : null);
		if (doDo !== "moc-tu-bo-nho") kiem(`console khong loi (${t.loi.length})`, t.loi.length === 0);
	} finally {
		await t.dong();
	}
}
