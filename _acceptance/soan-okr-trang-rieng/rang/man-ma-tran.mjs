import { mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { GOC, tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { LENH, TEN } from "./kich-ban.mjs";
import {
	BANG,
	bamTrongDong,
	CHON,
	choBienNhan,
	choThay,
	choYen,
	datLuot,
	ghi,
	giuMoHinh,
	guiTin,
	khoaBangCuoc,
	ket,
	khongDo,
	kiem,
	m,
	MAN,
	mo,
	moCuoc,
	moTrang,
	mui,
	sql,
	the,
	duongSoan,
	trang,
	tranVaCuon,
	vao,
} from "./man-chung.mjs";

const THIET_KE = join(GOC, "docs/superpowers/specs/2026-10-07-soan-okr-trang-rieng-design.md");
const EVALS = join(GOC, "_acceptance/soan-okr-trang-rieng/evals.yaml");
const KHO = [1440, 768, 375];

function idTrangThai() {
	const chu = readFileSync(THIET_KE, "utf8");
	const dau = chu.indexOf("<<<UX-STATE-TABLE");
	const cuoi = chu.indexOf("UX-STATE-TABLE>>>");
	if (dau < 0 || cuoi < dau) return null;
	return [...chu.slice(dau, cuoi).matchAll(/^\|\s*(ST-[a-z0-9-]+)\s*\|/gm)].map((k) => k[1]);
}

function anhE15() {
	return [...readFileSync(EVALS, "utf8").matchAll(/"(_acceptance\/soan-okr-trang-rieng\/evidence\/E14-[^"]+\.png)"/g)].map((k) => k[1]);
}

const coChu = (chon, chu) => ({ chon, chu });

const TAB = ["tro-chuyen", "ban-nhap"];

function trangThai(bad) {
	return {
		"ST-soan-dang-mo": { tab: null, khoa: true, dau: coChu('[data-trang-soan="dang-mo"] [data-kara-state="working"]', m.man.dangMo) },
		"ST-soan-mo-dau": { tab: "tro-chuyen", dau: coChu('[data-kara-turn="kara"] [data-kara-state="working"]', m.hoiThoai.moDau) },
		"ST-soan-co-nhap": { tab: "ban-nhap", dau: coChu('[data-slot="kara-artifact-header"]', "dòng") },
		"ST-soan-dang-soan": { tab: "ban-nhap", choMs: 5000, dau: coChu('[data-slot="kara-artifact-header"] [role="status"]', mui.karaKhung.dangSoanKhoa) },
		"ST-soan-moc": { tabMo: "tro-chuyen", tab: "ban-nhap", moc: true, dau: coChu("fieldset[data-noi]", TEN.m1Sua) },
		"ST-soan-hoi-dong": { tabMo: "ban-nhap", tab: "tro-chuyen", hoi: true, dau: coChu(CHON.chip, TEN.k22) },
		"ST-soan-loi": { tab: "tro-chuyen", hong: true, dau: coChu('[data-luot="loi"]', m.hoiThoai.loi) },
		"ST-soan-da-quyet": { tab: "ban-nhap", dau: coChu('[data-slot="proposed-change-receipt"]', m.dong.daThem) },
		"ST-soan-con-thieu": { tab: "ban-nhap", dau: coChu("[data-con-thieu]", m.dong.conThieu) },
		"ST-soan-het-luot": { tab: "tro-chuyen", dau: coChu('[data-slot="kara-composer"]', m.hoiThoai.hetLuot("12")) },
		"ST-soan-hep": { tab: "ban-nhap", dau: coChu(CHON.oBanNhap, TEN.m2) },
		"ST-soan-da-dua-vao": { tab: "ban-nhap", dau: coChu("[data-da-dua-vao]", m.banNhap.daTao("1")) },
		"ST-soan-khong-mo": { tab: null, id: bad, dau: coChu('[data-kara-state="error"] [data-slot="empty-title"]', mui.karaKhung.chuaDuoc(m.trang.khongMo)) },
	};
}

async function coDau(p, dau) {
	return p.evaluate(
		({ chon, chu }) => [...document.querySelectorAll(chon)].some((o) => o.checkVisibility() && (o.textContent ?? "").includes(chu)),
		dau,
	);
}

async function mot(st, id, cuoc, rong, nen, doDo, dem) {
	const t = await trang(MAN.kho[rong], nen);
	try {
		const nha = st.khoa ? await khoaBangCuoc() : null;
		const tabMo = st.tabMo ?? st.tab;
		const thamSo = tabMo && rong < 1024 ? `?tab=${tabMo}` : "";
		const som = doDo === "chup-som" && id === "ST-soan-co-nhap" && dem.som === 0;
		if (som) {
			dem.som += 1;
			void t.p.goto(`${duongSoan(st.id ?? cuoc.id)}${thamSo}`).catch(() => {});
			await t.p.waitForSelector("body", { timeout: 30000 });
		} else if (st.khoa) {
			void t.p.goto(duongSoan(cuoc.id)).catch(() => {});
			await choThay(t.p, (d) => [...document.querySelectorAll(d.chon)].some((o) => o.checkVisibility() && (o.textContent ?? "").includes(d.chu)), `${id} hien`, st.choMs ?? 30000, st.dau);
		} else {
			await moTrang(t, st.id ?? cuoc.id, thamSo);
			if (st.hong) {
				await t.p.setRequestInterception(true);
				t.p.on("request", (r) =>
					r.method() === "POST" && r.postData()?.includes(LENH.hong)
						? r.respond({ status: 500, contentType: "application/json", body: '{"error":"loi-may-chu"}' })
						: r.continue(),
				);
				await guiTin(t, LENH.hong, { choXong: false, choToi: false });
			}
			if (st.moc) {
				await choThay(t.p, (chon) => [...document.querySelectorAll(chon)].filter((b) => b.checkVisibility()).length === 2, "hai moc", 30000, CHON.moc);
				await t.p.evaluate((chon) => [...document.querySelectorAll(chon)].filter((b) => b.checkVisibility())[1]?.click(), CHON.moc);
			}
			if (st.hoi) {
				await choThay(t.p, (ten) => [...document.querySelectorAll("[data-dong]")].some((d) => d.checkVisibility() && d.textContent?.includes(ten)), "dong hoi", 30000, TEN.k22);
				await tre(MAN.cho.yenMs);
				await bamTrongDong(t.p, TEN.k22, m.dong.hoiKara);
			}
			await choThay(t.p, (d) => [...document.querySelectorAll(d.chon)].some((o) => o.checkVisibility() && (o.textContent ?? "").includes(d.chu)), `${id} hien`, st.choMs ?? 30000, st.dau);
		}
		if (st.tab && rong < 1024) {
			await choThay(t.p, () => [...document.querySelectorAll('[data-khung="hep"] [role="tab"]')].some((x) => x.checkVisibility() && x.getAttribute("aria-selected") === "true"), `${id} thanh tab`, 5000);
			const dangChon = await t.p.evaluate(() =>
				[...document.querySelectorAll('[data-khung="hep"] [role="tab"]')].findIndex((x) => x.getAttribute("aria-selected") === "true"),
			);
			if (TAB[dangChon] !== st.tab) kiem(`sai tab: ${id} ${rong} ${nen} (dang chon ${TAB[dangChon] ?? "khong co"}, can ${st.tab})`, false);
		}
		if (doDo === "tran" && dem.tran === 0) {
			dem.tran += 1;
			await t.p.evaluate(() => {
				const o = document.createElement("div");
				o.style.cssText = "width:2000px;height:1px";
				document.body.appendChild(o);
			});
		}
		await tre(MAN.cho.yenMs);
		const thay = await coDau(t.p, st.dau);
		if (!thay) {
			kiem(`${id} ${rong} ${nen}: thieu chu ban «${st.dau.chu}» o ${st.dau.chon}`, false);
			const dang = await t.p.evaluate(() => `${location.pathname}${location.search} · ${(document.body.innerText ?? "").replace(/\s+/g, " ").slice(0, 200)}`);
			ghi(`      dang hien: ${dang}`);
		}
		const c = await tranVaCuon(t.p);
		if (c.sw > c.cw) kiem(`${id} ${rong} ${nen}: tran ngang (${c.sw}/${c.cw})`, false);
		if (c.sh > c.ch + 1) kiem(`${id} ${rong} ${nen}: trang cuon (${c.sh}/${c.ch})`, false);
		const tep = join(doDo ? the.ra : BANG.evidence, `E14-${id}-${rong}-${nen}.png`);
		await t.p.screenshot({ path: tep });
		if (nha) await nha();
		const loi = t.loi.filter(
			(l) => !((st.id && /status of 404/.test(l)) || (st.hong && /status of 500/.test(l))),
		);
		if (loi.length > 0) kiem(`${id} ${rong} ${nen}: console co loi — ${loi[0].slice(0, 160)}`, false);
		dem.anh += 1;
		if (doDo && (dem.tran > 0 || dem.som > 0)) {
			ghi(`   chieu do ${doDo}: dung sau anh bi dot bien`);
			await t.dong();
			await ket();
		}
		return thay && c.sw <= c.cw && c.sh <= c.ch + 1;
	} finally {
		await t.dong();
	}
}

async function chupTrangThai(id, st, cuoc, doDo, dem) {
	let dat = 0;
	for (const rong of KHO) for (const nen of MAN.nen) if (await mot(st, id, cuoc, rong, nen, doDo, dem)) dat += 1;
	ghi(`   ${id}: ${dat}/${KHO.length * MAN.nen.length} anh dat`);
}

async function keoVaPhim(cuoc) {
	const t = await trang(MAN.kho[1440]);
	try {
		await moTrang(t, cuoc.id);
		const rongO = () =>
			t.p.evaluate((chon) => document.querySelector(chon)?.closest('[data-slot="resizable-panel"]')?.getBoundingClientRect().width ?? 0, CHON.oHoiThoai);
		const h = await t.p.$(CHON.thanh);
		const r = h && (await h.boundingBox());
		const dau = await rongO();
		if (r) {
			await t.p.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
			await t.p.mouse.down();
			await t.p.mouse.move(r.x + r.width / 2 + 100, r.y + r.height / 2, { steps: 10 });
			await t.p.mouse.up();
		}
		await tre(MAN.cho.yenMs);
		const keo = await rongO();
		await t.p.focus(CHON.thanh);
		for (let i = 0; i < 4; i += 1) await t.p.keyboard.press("ArrowLeft");
		await tre(MAN.cho.yenMs);
		const phim = await rongO();
		ghi(`   o hoi thoai: ${dau.toFixed(1)} → keo ${keo.toFixed(1)} → phim ${phim.toFixed(1)} px`);
		kiem("keo bang chuot doi co o hoi thoai", keo - dau > 50);
		kiem("phim mui ten doi co o hoi thoai", Math.abs(phim - keo) > 1);
	} finally {
		await t.dong();
	}
}

async function lam(t, buocLam, moTa) {
	if (!(await buocLam())) await khongDo(`khong dung duoc trang thai: ${moTa}`);
	await choYen(t.p);
}

export async function phanMaTran({ doDo, nop1 }) {
	const ids = idTrangThai();
	if (!ids?.length) await khongDo("khong doc duoc bang UX-STATE-TABLE cua thiet ke");
	mkdirSync(BANG.evidence, { recursive: true });
	const cuoc = await moCuoc();
	const st = trangThai("khong-co-cuoc-nay");
	const thieuCa = ids.filter((id) => !st[id]);
	if (thieuCa.length > 0) {
		for (const id of thieuCa) kiem(`thieu trang thai: ${id}`, false);
		await ket(1);
	}
	const dem = { anh: 0, som: 0, tran: 0 };
	const t = await trang(MAN.kho[1440]);
	const chup = (id) => chupTrangThai(id, st[id], cuoc, doDo, dem);
	try {
		giuMoHinh(true);
		await moTrang(t, cuoc.id);
		for (let i = 0; i < 40 && vao().length === 0; i += 1) await tre(MAN.cho.yenMs);
		if (vao().length === 0) await khongDo("luot mo dau khong toi mo hinh");
		await chup("ST-soan-mo-dau");
		await chup("ST-soan-dang-mo");
		giuMoHinh(false);
		await choYen(t.p);
		await lam(t, () => nop1(t), "co nhap");
		await chup("ST-soan-co-nhap");
		giuMoHinh(true);
		await guiTin(t, LENH.tiep, { choXong: false });
		await chup("ST-soan-dang-soan");
		giuMoHinh(false);
		await choYen(t.p);
		await lam(t, () => guiTin(t, LENH.nop2), "moc");
		await choThay(t.p, (chon) => document.querySelectorAll(chon).length === 2, "hai moc", MAN.cho.luotMs, CHON.moc);
		await chup("ST-soan-moc");
		await chup("ST-soan-hoi-dong");
		await chup("ST-soan-loi");
		await moTrang(t, cuoc.id);
		await choYen(t.p);
		const go = async (ten, o, chu) => {
			const h = await t.p.evaluateHandle(
				(ten, o) =>
					[...document.querySelectorAll("[data-dong]")]
						.find((d) => d.checkVisibility() && d.textContent?.includes(ten))
						?.closest("[data-the-kr]")
						?.querySelector(`input[id^="${o}-"]`) ?? null,
				ten,
				o,
			);
			const o2 = h.asElement();
			if (!o2) await khongDo(`khong thay o ${o} cua ${ten}`);
			await o2.click({ clickCount: 3 });
			await t.p.keyboard.type(chu);
			await t.p.keyboard.press("Tab");
		};
		await go(TEN.k11, "khoi", "10");
		await go(TEN.k11, "dich", "20");
		await go(TEN.k12, "khoi", "50");
		await go(TEN.k12, "dich", "30");
		await tre(MAN.cho.yenMs);
		for (const [ten, nhan] of [
			[TEN.m1Sua, m.dong.themMucTieu],
			[TEN.k11, m.dong.themKr],
			[TEN.k12, m.dong.themKr],
		]) {
			if (!(await bamTrongDong(t.p, ten, nhan))) await khongDo(`khong bam duoc «${nhan}» tren «${ten}»`);
			await choBienNhan(t.p, ten);
		}
		await chup("ST-soan-da-quyet");
		if (!(await bamTrongDong(t.p, TEN.k22, m.dong.themKr))) await khongDo(`khong nhan duoc ${TEN.k22}`);
		await choBienNhan(t.p, TEN.k22);
		await chup("ST-soan-con-thieu");
		const [{ soLuot }] = await sql(`SELECT "soLuot" FROM "okrCuocSoan" WHERE id = $1`, [cuoc.id]);
		await datLuot(cuoc.id, 12);
		await chup("ST-soan-het-luot");
		await datLuot(cuoc.id, soLuot);
		await chup("ST-soan-hep");
		await moTrang(t, cuoc.id);
		await choYen(t.p);
		await go(TEN.k22, "khoi", "60");
		await go(TEN.k22, "dich", "80");
		await tre(MAN.cho.yenMs);
		await t.p.click('[data-nut="dua-vao"]');
		await choThay(t.p, () => !!document.querySelector('[role="alertdialog"]'), "hop xac nhan", 10000);
		await t.p.evaluate((nhan) => [...document.querySelectorAll('[role="alertdialog"] button')].find((b) => b.textContent?.trim() === nhan)?.click(), m.banNhap.xacNhan.nut);
		if (!(await choThay(t.p, () => !!document.querySelector("[data-da-dua-vao]"), "da dua vao", 30000))) await khongDo("khong dua vao duoc");
		await chup("ST-soan-da-dua-vao");
		await chup("ST-soan-khong-mo");
	} finally {
		await t.dong();
	}
	await keoVaPhim(cuoc);
	const can = ids.length * KHO.length * MAN.nen.length;
	ghi(`   so anh: ${dem.anh} = ${ids.length} trang thai x ${KHO.length} kho x ${MAN.nen.length} nen (${can})`);
	kiem(`so anh dung ${can}`, dem.anh === can);
	const thieu = anhE15().filter((tep) => {
		try {
			return statSync(join(GOC, tep)).size === 0;
		} catch {
			return true;
		}
	});
	kiem(`anh dau vao cua E15 du va khac rong${thieu.length ? ` — thieu ${thieu.join(", ")}` : ""}`, thieu.length === 0);
}
