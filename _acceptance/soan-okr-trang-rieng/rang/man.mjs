import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { DEM, LENH, TEN } from "./kich-ban.mjs";
import {
	bamTrongDong,
	buoc,
	CHON,
	chuanBi,
	choBienNhan,
	choSoDong,
	choThay,
	choYen,
	duongDonVi,
	duongSoan,
	ghi,
	guiTin,
	ket,
	khongDo,
	kiem,
	m,
	MAN,
	mo,
	moCuoc,
	moPhien,
	moTrang,
	mui,
	the,
	tranVaCuon,
	trang,
	vao,
} from "./man-chung.mjs";
import { phanMaTran } from "./man-ma-tran.mjs";
import { phanDuaVao, phanSo } from "./man-so.mjs";

const PHAN = ["duong", "khung", "moc", "hoi-dong", "he-thong", "so", "dua-vao", "ma-tran"];
const arg = (ten) => {
	const i = process.argv.indexOf(ten);
	return i < 0 ? null : (process.argv[i + 1] ?? null);
};
const phan = arg("--phan");
const doDo = arg("--kiem-do-do");
if (!PHAN.includes(phan ?? "")) {
	console.log(`KHONG DO DUOC: --phan phai la mot trong ${PHAN.join(", ")}`);
	process.exit(2);
}
const lenh = `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/soan-okr-trang-rieng/rang/man.mjs --phan ${phan}${doDo ? ` --kiem-do-do ${doDo}` : ""}"`;

async function nop1(t) {
	if (!(await guiTin(t, LENH.nop1))) return false;
	return choSoDong(t.p, DEM.nop1.mucTieu + DEM.nop1.kr);
}

async function phanDuong() {
	const cuoc = await moCuoc();
	const t = await trang();
	try {
		await t.p.goto(duongDonVi(), { waitUntil: "load" });
		await choThay(t.p, () => !!document.querySelector('[data-nut-soan="nut-tiep"] button'), "nut tiep");
		await t.p.evaluate(() => document.querySelector('[data-nut-soan="nut-tiep"] button')?.click());
		const toi = await choThay(t.p, (id) => location.pathname.endsWith(`/okr/soan/${id}`), "toi trang soan", MAN.cho.manMs, cuoc.id);
		await choThay(t.p, () => !!document.querySelector("[data-dau-soan]"), "dau trang");
		const dau = await t.p.evaluate(() => ({
			ve: document.querySelector('[data-nut="ve-theo-don-vi"]')?.textContent ?? "",
			dau: document.querySelector("[data-dau-soan]")?.textContent ?? "",
			sheet: document.querySelectorAll('[data-slot="sheet-content"]').length,
			tab: document.querySelectorAll('[role="tablist"]').length,
		}));
		ghi(`   dau trang: «${dau.dau}» · sheet ${dau.sheet} · tablist ${dau.tab}`);
		buoc(
			1,
			!toi
				? "khong toi trang soan"
				: dau.sheet > 0
					? "con sheet"
					: dau.tab > 0
						? "con thanh tab OKR"
						: !dau.ve.includes(m.trang.veTheoDonVi) ||
								!dau.dau.includes(cuoc.tenDonVi) ||
								!dau.dau.includes(cuoc.tenChuKy) ||
								!dau.dau.includes(m.man.luot(String(cuoc.soLuot), String(cuoc.tranLuot)))
							? "dau trang thieu lien ket, don vi, chu ky hay so luot"
							: null,
		);

		if (doDo === "push-link-cu")
			await t.p.evaluateOnNewDocument(() => {
				const day = history.pushState.bind(history);
				history.replaceState = (...a) => day(...a);
			});
		const a = duongDonVi();
		await t.p.goto(a, { waitUntil: "load" });
		await t.p.goto(`${a}&cuocSoan=${cuoc.id}`, { waitUntil: "load" });
		const thay = await choThay(t.p, (id) => location.pathname.endsWith(`/okr/soan/${id}`), "link cu thay", MAN.cho.manMs, cuoc.id);
		await t.p.goBack({ waitUntil: "load" });
		await tre(MAN.cho.yenMs * 2);
		const sau = await t.p.evaluate(() => location.pathname + location.search);
		ghi(`   sau quay lai: ${sau}`);
		buoc(2, !thay ? "link cu khong toi trang soan" : sau !== new URL(a).pathname + new URL(a).search ? "link cu them lich su" : null);

		const loiTruoc3 = t.loi.length;
		await t.p.goto(duongSoan("khong-co-cuoc-nay"), { waitUntil: "load" });
		const khongMo = await choThay(
			t.p,
			(chu) => document.querySelector('[data-kara-state="error"]')?.textContent?.includes(chu) === true,
			"khong mo",
			MAN.cho.manMs,
			m.trang.khongMo,
		);
		const veKhongMo = await t.p.evaluate(() => document.querySelector('[data-nut="ve-theo-don-vi"]')?.getAttribute("href") ?? "");
		const bo404 = t.loi.splice(loiTruoc3).filter((l) => !/status of 404/.test(l));
		t.loi.push(...bo404);
		buoc(3, !khongMo ? "id khong co ma khong bao khong mo duoc" : !veKhongMo.endsWith("/okr/theo-don-vi") ? `lien ket ve sai: ${veKhongMo}` : null);

		await moTrang(t, cuoc.id);
		const lienKet = await t.p.evaluate(() => {
			const ds = [...document.querySelectorAll('[data-nut="ve-theo-don-vi"]')];
			const o = ds.find((x) => x.checkVisibility()) ?? ds[0];
			o?.click();
			return { so: ds.length, hien: ds.filter((x) => x.checkVisibility()).length, href: o?.getAttribute("href") ?? "" };
		});
		ghi(`   lien ket ve: ${lienKet.so} phan tu, ${lienKet.hien} dang hien, href ${lienKet.href}`);
		const ve = await choThay(t.p, () => location.pathname.endsWith("/okr/theo-don-vi"), "ve theo don vi");
		const q = await t.p.evaluate(() => Object.fromEntries(new URLSearchParams(location.search)));
		ghi(`   ve: kyOkr=${q.kyOkr} donOkr=${q.donOkr}`);
		buoc(4, !ve ? "khong ve theo don vi" : q.kyOkr !== cuoc.cycleId || q.donOkr !== `pb:${cuoc.departmentId}` ? "ve sai don vi hay chu ky" : null);
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
	if (!h) return false;
	const r = await h.boundingBox();
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

async function phanKhung() {
	const cuoc = await moCuoc();
	const t = await trang({ rong: 1440, cao: 640 });
	try {
		if (!(await mo(t, cuoc.id)) || !(await nop1(t))) await khongDo("khong dung duoc ban nhap dau");
		if (doDo === "khoa-thanh")
			await t.p.evaluate((chon) => document.querySelector(chon)?.remove(), CHON.thanh);
		const dau = await rongO(t.p);
		ghi(`   o hoi thoai ${dau?.o.toFixed(1)} px / than ${dau?.nhom.toFixed(1)} px`);
		kiem(`o hoi thoai mac dinh ${MAN.tran.oHoiThoaiPx} ±${MAN.tran.tren}`, !!dau && Math.abs(dau.o - MAN.tran.oHoiThoaiPx) <= MAN.tran.tren);
		const thanh = await t.p.evaluate((chon) => {
			const h = document.querySelector(chon);
			return h ? { vai: h.getAttribute("role"), ten: h.getAttribute("aria-label") ?? h.getAttribute("aria-labelledby") ?? "" } : null;
		}, CHON.thanh);
		const coKeo = await keo(t.p, 120);
		const sauKeo = await rongO(t.p);
		ghi(`   keo +120: ${sauKeo?.o.toFixed(1)} px`);
		if (!coKeo || !sauKeo || !dau || sauKeo.o - dau.o < 60) {
			ghi("   thanh khong doi co");
			kiem("thanh doi co khi keo", false);
		} else kiem(`thanh co ten (${thanh?.vai} «${thanh?.ten}») va doi co khi keo`, thanh?.vai === "separator" && thanh.ten.length > 0);
		if (coKeo) {
			await keo(t.p, -2000);
			const nho = await rongO(t.p);
			await keo(t.p, 4000);
			const lon = await rongO(t.p);
			ghi(`   nho nhat ${nho?.o.toFixed(1)} px · lon nhat ${lon?.o.toFixed(1)} px / nua than ${(lon?.nhom ?? 0) / 2}`);
			kiem("khong nho hon 300 px", !!nho && nho.o >= SOAN_TOI_THIEU - 1);
			kiem("khong lon hon nua than", !!lon && lon.o <= lon.nhom / 2 + 1);
			await t.p.focus(CHON.thanh);
			await t.p.keyboard.press("ArrowLeft");
			const vien = await t.p.evaluate((chon) => {
				const h = document.querySelector(chon);
				const k = h && getComputedStyle(h);
				return k ? { bong: k.boxShadow, vien: k.outlineStyle, thay: h.matches(":focus-visible") } : null;
			}, CHON.thanh);
			kiem(`focus thay duoc (${vien?.bong} / ${vien?.vien})`, !!vien && vien.thay && (vien.bong !== "none" || vien.vien !== "none"));
			const truocPhim = await rongO(t.p);
			for (let i = 0; i < 5; i += 1) await t.p.keyboard.press("ArrowLeft");
			const sauPhim = await rongO(t.p);
			ghi(`   phim trai x5: ${truocPhim?.o.toFixed(1)} → ${sauPhim?.o.toFixed(1)} px`);
			kiem("phim doi co", !!truocPhim && !!sauPhim && Math.abs(sauPhim.o - truocPhim.o) > 1);
		}
		if (doDo === "cuon-trang")
			await t.p.addStyleTag({
				content: '[data-trang-soan],[data-slot="resizable-panel-group"],[data-slot="resizable-panel"],[data-cot],main,[data-slot="kara-artifact"],[data-slot="kara-artifact-content"]{overflow:visible!important;height:auto!important;max-height:none!important;min-height:0!important;flex:none!important}',
			});
		await tre(MAN.cho.yenMs);
		const c = await tranVaCuon(t.p);
		const oCuon = await t.p.evaluate(() => {
			const cuon = (o) => !!o && ["auto", "scroll"].includes(getComputedStyle(o).overflowY) && o.scrollHeight > o.clientHeight;
			const trong = (goc) => [goc, ...goc.querySelectorAll("*")].some(cuon);
			const hoi = document.querySelector('[data-cot="hoi-thoai"]');
			const ban = document.querySelector('[data-cot="ban-nhap"]');
			return { hoi: !!hoi && trong(hoi), ban: !!ban && trong(ban) };
		});
		ghi(`   trang ${c.sh}/${c.ch} · o ban nhap tu cuon ${oCuon.ban}`);
		if (c.sh > c.ch + 1) {
			ghi("   trang cuon thay o");
			kiem("trang khong cuon", false);
		} else kiem("trang khong cuon, o ban nhap tu cuon", oCuon.ban);
		for (const rong of [1440, 1024, 768, 375]) {
			await t.p.setViewport({ width: rong, height: MAN.kho[rong].cao });
			await tre(MAN.cho.yenMs);
			const x = await tranVaCuon(t.p);
			kiem(`${rong} px khong tran ngang (${x.sw}/${x.cw})`, x.sw <= x.cw);
		}
		for (const rong of [768, 375]) {
			await t.p.setViewport({ width: rong, height: MAN.kho[rong].cao });
			await moTrang(t, cuoc.id);
			await choThay(t.p, () => [...document.querySelectorAll('[data-khung="hep"] [role="tab"]')].some((o) => o.checkVisibility()), `${rong} px thanh tab`, 15000);
			const tab = await t.p.evaluate(() => [...document.querySelectorAll('[data-khung="hep"] [role="tab"]')].map((x) => x.textContent?.trim()));
			kiem(`${rong} px hai tab ${JSON.stringify(tab)}`, tab.length === 2 && tab[0] === m.man.tabTroChuyen && tab[1] === m.man.tabBanNhap(String(DEM.nop1.mucTieu + DEM.nop1.kr)));
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
				kiem(`${rong} px tab giu sau tai lai`, false);
			} else kiem(`${rong} px tab tren url va giu sau tai lai`, true);
		}
		kiem(`console khong loi (${t.loi.length})`, t.loi.length === 0);
		for (const l of t.loi.slice(0, 5)) ghi(`   console: ${l.slice(0, 200)}`);
	} finally {
		await t.dong();
	}
}

const SOAN_TOI_THIEU = 300;

async function trongKhung(p, chon) {
	return p.evaluate((chon) => {
		const o = document.querySelector(chon);
		if (!o) return false;
		let hop = o.parentElement;
		while (hop && !(["auto", "scroll"].includes(getComputedStyle(hop).overflowY) && hop.scrollHeight > hop.clientHeight)) hop = hop.parentElement;
		const k = hop ? hop.getBoundingClientRect() : { top: 0, bottom: innerHeight };
		const r = o.getBoundingClientRect();
		return r.bottom > k.top && r.top < k.bottom;
	}, chon);
}

async function chuMoc(p) {
	return p.evaluate((chon) => [...document.querySelectorAll(chon)].map((b) => b.textContent?.trim()), CHON.moc);
}

async function phanMoc() {
	const cuoc = await moCuoc();
	const t = await trang({ rong: 1440, cao: 760 });
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
		const thuTu = await t.p.evaluate(() => {
			const ds = [...document.querySelectorAll('[data-kara-turn="user"],[data-kara-turn="checkpoint"]')];
			return ds.map((d) => d.getAttribute("data-kara-turn")).join(",");
		});
		ghi(`   moc: ${JSON.stringify(co)} · thu tu ${thuTu}`);
		buoc(1, JSON.stringify(co) !== JSON.stringify(can) ? `moc sai chu, can ${JSON.stringify(can)}` : !thuTu.endsWith("user,checkpoint,user,checkpoint") ? "moc khong dung cho hai lan nop" : null);

		await t.p.evaluate((chon) => document.querySelectorAll(chon)[1]?.click(), CHON.moc);
		const noi = await choThay(t.p, () => !!document.querySelector("fieldset[data-noi]"), "dong noi", 5000);
		const thay = noi && (await trongKhung(t.p, "fieldset[data-noi]"));
		buoc(2, !noi ? "bam moc khong lam noi dong doi" : !thay ? "dong doi khong vao khung nhin" : null);

		await t.p.evaluate(() => {
			const o = document.querySelector('[data-kara-turn="checkpoint"]')?.closest('[role="log"]');
			const cuon = o && [o, ...o.querySelectorAll("*")].find((x) => ["auto", "scroll"].includes(getComputedStyle(x).overflowY) && x.scrollHeight > x.clientHeight);
			if (cuon) cuon.scrollTop = 0;
		});
		const nhan = await t.p.$('[data-nhan-dong="vua-sua"]');
		const laNut = nhan && (await nhan.evaluate((o) => o.tagName === "BUTTON"));
		if (nhan) await nhan.click();
		await tre(MAN.cho.yenMs * 2);
		const mocVao = await t.p.evaluate((chon) => {
			const ds = document.querySelectorAll(chon);
			const o = ds[ds.length - 1];
			if (!o) return false;
			let hop = o.parentElement;
			while (hop && !(["auto", "scroll"].includes(getComputedStyle(hop).overflowY) && hop.scrollHeight > hop.clientHeight)) hop = hop.parentElement;
			const k = hop ? hop.getBoundingClientRect() : { top: 0, bottom: innerHeight };
			const r = o.getBoundingClientRect();
			return r.bottom > k.top && r.top < k.bottom;
		}, '[data-kara-turn="checkpoint"]');
		const gach = await t.p.evaluate((cu, moi) => {
			const d = [...document.querySelectorAll("[data-dong]")].find((x) => x.textContent?.includes(moi));
			return d?.querySelector("del")?.textContent?.trim() === cu;
		}, TEN.m1, TEN.m1Sua);
		buoc(3, !laNut ? "nhan vua sua khong phai nut" : !mocVao ? "bam nhan khong dua moc moi nhat vao khung" : !gach ? "dong vua sua khong co chu cu gach" : null);

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

function catKhoi(than, cat) {
	return than.replace(/⟦ngữ cảnh từ trang soạn⟧[\s\S]*?⟦hết ngữ cảnh⟧(\\n|\n)?/g, cat ? "" : "$&");
}

async function chanKhoi(t, kieu) {
	await t.p.setRequestInterception(true);
	t.p.on("request", (r) => {
		const than = r.postData();
		if (r.method() !== "POST" || !than || !than.includes("⟦")) return r.continue();
		ghi(`   (chieu do ${kieu}: bo khoi ngu canh khoi tin gui)`);
		return r.continue({ postData: catKhoi(than, true) });
	});
}

async function phanHoiDong() {
	const cuoc = await moCuoc();
	const t = await trang({ rong: 1440, cao: 900 });
	try {
		if (!(await mo(t, cuoc.id)) || !(await nop1(t))) await khongDo("khong dung duoc ban nhap dau");
		if (doDo === "bo-khoi") await chanKhoi(t, "bo-khoi");
		const hoi = await bamTrongDong(t.p, TEN.k22, m.dong.hoiKara);
		const chip = await t.p.evaluate((chon, o) => ({
			chu: document.querySelector(chon)?.textContent?.trim() ?? "",
			go: !!document.querySelector(chon)?.querySelector("button"),
			focus: document.activeElement === document.querySelector(o),
		}), CHON.chip, CHON.oSoan);
		ghi(`   chip «${chip.chu}» · nut go ${chip.go} · focus o soan ${chip.focus}`);
		buoc(1, !hoi ? "khong co nut Hoi Kara tren dong" : chip.chu !== m.dong.nguCanh(m.heThong.loai.kr, TEN.k22) || !chip.go ? "chip sai chu hay thieu nut go" : !chip.focus ? "focus khong o o soan" : null);
		await guiTin(t, "ngắn hơn");
		const tin = vao().at(-1) ?? "";
		ghi(`   mo hinh nhan: ${tin.replace(/\n/g, " ⏎ ").slice(0, 400)}`);
		buoc(2, !tin.includes(TEN.k22) ? "mo hinh khong thay dong" : !tin.includes("ngắn hơn") ? "mo hinh khong thay cau hoi" : null);
		const bong = await t.p.evaluate((chon) => {
			const ds = document.querySelectorAll(chon);
			const o = ds[ds.length - 1];
			return { chu: o?.textContent ?? "", chip: o?.querySelector("[data-chip-dong]")?.textContent?.trim() ?? "" };
		}, CHON.nguoi);
		ghi(`   bong bong: «${bong.chu}»`);
		buoc(3, bong.chip !== m.dong.nguCanh(m.heThong.loai.kr, TEN.k22) || !bong.chu.includes("ngắn hơn") ? "bong bong thieu chip hay cau hoi" : bong.chu.includes("⟦") ? "bong bong lo dau khoi may" : null);
		await bamTrongDong(t.p, TEN.k22, m.dong.hoiKara);
		await t.p.evaluate((chon) => document.querySelector(chon)?.querySelector("button")?.click(), CHON.chip);
		await tre(MAN.cho.yenMs);
		await guiTin(t, "câu hỏi khác");
		const tin2 = vao().at(-1) ?? "";
		ghi(`   mo hinh nhan (go chip): ${tin2.replace(/\n/g, " ⏎ ").slice(0, 200)}`);
		buoc(4, tin2.includes(TEN.k22) ? "go chip ma tin van mang chu dong" : null);
		await t.p.setViewport({ width: 375, height: MAN.kho[375].cao });
		await moTrang(t, cuoc.id, "?tab=ban-nhap");
		await choThay(t.p, () => [...document.querySelectorAll("[data-dong]")].some((o) => o.checkVisibility()), "tab ban nhap", 15000);
		await bamTrongDong(t.p, TEN.k22, m.dong.hoiKara);
		const hep = await choThay(
			t.p,
			(o) => document.querySelectorAll('[data-khung="hep"] [role="tab"]')[0]?.getAttribute("aria-selected") === "true" && document.activeElement === document.querySelector(o),
			"hep mo tab tro chuyen",
			10000,
			CHON.oSoan,
		);
		buoc(5, hep ? null : "kho hep: bam Hoi Kara khong mo tab Tro chuyen hay khong dat focus");
		if (doDo !== "bo-khoi") kiem(`console khong loi (${t.loi.length})`, t.loi.length === 0);
	} finally {
		await t.dong();
	}
}

async function phanHeThong() {
	const cuoc = await moCuoc();
	const t = await trang({ rong: 1440, cao: 900 });
	try {
		if (!(await mo(t, cuoc.id)) || !(await nop1(t))) await khongDo("khong dung duoc ban nhap dau");
		if (doDo === "bo-quyet") await chanKhoi(t, "bo-quyet");
		const nhanKr = await bamTrongDong(t.p, TEN.k12, m.dong.themKr);
		await choBienNhan(t.p, TEN.k12);
		const boMt = await bamTrongDong(t.p, TEN.m2, m.dong.boQua);
		await choBienNhan(t.p, TEN.m2);
		const nhan13 = await bamTrongDong(t.p, TEN.k13, m.dong.themKr);
		await choBienNhan(t.p, TEN.k13);
		const hoan13 = await bamTrongDong(t.p, TEN.k13, mui.proposedChange.undo);
		await choThay(t.p, (ten) => [...document.querySelectorAll("[data-the-cho]")].some((d) => d.textContent?.includes(ten)), "k13 ve cho", 15000, TEN.k13);
		buoc(1, nhanKr && boMt && nhan13 && hoan13 ? null : "khong quyet duoc tren bang");
		const dongHt = await t.p.evaluate((chon) => {
			const ds = document.querySelectorAll(chon);
			return ds[ds.length - 1]?.textContent?.trim() ?? "";
		}, CHON.heThong);
		ghi(`   dong he thong: «${dongHt}»`);
		const quyet = [
			m.heThong.cach.nhan(m.heThong.loai.kr, TEN.k12),
			m.heThong.cach.bac(m.heThong.loai["muc-tieu"], TEN.m2),
		].join(" · ");
		buoc(2, dongHt !== m.heThong.seGui(quyet) ? `dong he thong sai, can «${m.heThong.seGui(quyet)}»` : dongHt.includes(TEN.k13) ? "dong he thong nhac KR da hoan tac" : null);
		await guiTin(t, LENH.tiep);
		const tin = vao().at(-1) ?? "";
		ghi(`   mo hinh nhan: ${tin.replace(/\n/g, " ⏎ ").slice(0, 400)}`);
		buoc(3, !tin.includes(TEN.k12) || !tin.includes(TEN.m2) ? "mo hinh khong thay quyet" : tin.includes(TEN.k13) ? "mo hinh thay quyet da hoan tac" : null);
		await t.p.reload({ waitUntil: "load" });
		await choYen(t.p);
		const sau = await t.p.evaluate((chon) => {
			const ds = document.querySelectorAll(chon);
			const o = ds[ds.length - 1];
			const truoc = o?.previousElementSibling;
			return { truoc: truoc?.matches('[data-kara-turn="system"]') ? truoc.textContent?.trim() : null, chu: o?.textContent ?? "" };
		}, CHON.nguoi);
		ghi(`   sau tai lai: he thong «${sau.truoc}» · bong bong «${sau.chu}»`);
		buoc(4, sau.truoc !== quyet ? "dong he thong khong dung ngay truoc bong bong" : sau.chu.includes("⟦") ? "bong bong lo dau khoi may" : null);
		if (doDo !== "bo-quyet") kiem(`console khong loi (${t.loi.length})`, t.loi.length === 0);
	} finally {
		await t.dong();
	}
}

await moPhien(lenh);
try {
	await chuanBi(phan);
	ghi(`PHAN ${phan}${doDo ? ` · chieu do ${doDo}` : ""}`);
	const lam = {
		duong: phanDuong,
		khung: phanKhung,
		moc: phanMoc,
		"hoi-dong": phanHoiDong,
		"he-thong": phanHeThong,
		so: () => phanSo({ doDo, nop1 }),
		"dua-vao": () => phanDuaVao({ doDo, nop1 }),
		"ma-tran": () => phanMaTran({ doDo, nop1 }),
	}[phan];
	await lam();
} catch (loi) {
	await khongDo(`phan ${phan}: ${loi?.stack ?? loi}`);
}
await ket();
