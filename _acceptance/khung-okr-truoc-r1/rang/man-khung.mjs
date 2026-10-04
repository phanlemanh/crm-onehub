import { join } from "node:path";
import {
	API,
	APP,
	BD,
	CO_DO,
	chenStyle,
	chuanBi,
	chup,
	db,
	GOC,
	idMau,
	KY4,
	KYKE,
	ket,
	ketThuc,
	kiem,
	moKhung,
	moTrang,
	thamSo,
	thuMau,
	tre,
	trpc,
	yen,
} from "./ban-do.mjs";

const { okrMessages } = await import(join(GOC, "apps/app/lib/messages/okr.ts"));
const { okrSoanMessages } = await import(join(GOC, "apps/app/lib/messages/okr-soan.ts"));
const { moCuoc } = await import(join(GOC, "packages/db/src/okr-cuoc-soan.ts"));
const { PHIEN_CHO_EVE } = await import(join(GOC, "packages/validation/src/okr-cuoc-soan.ts"));
const { gieoGopY, SAN } = await import(join(GOC, "_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs"));
const { ngayThangVn } = await import(join(GOC, "apps/app/lib/okr-chu-ky-nhan.ts"));

const mo = okrMessages("vi");
const ms = okrSoanMessages("vi");
const PHAN = thamSo("--phan");
const TAT_CHAN = process.argv.includes("--tat-chan");
const DO_DOC = process.argv.includes("--kiem-do-doc");
const TAB = { kr: 0, "can-chinh": 1, vet: 2 };
const MT_A = SAN.ma.a;
const PB = idMau("pb", SAN.ma.phongBan);

if (!["le", "thanh", "thanh-chua", "dien-thoai", "chip"].includes(PHAN ?? "")) {
	console.log(`KHONG DO: --phan phai la le|thanh|thanh-chua|dien-thoai|chip, nhan ${PHAN}`);
	await ket(2);
}

const { cookie, slug } = await chuanBi();

async function bamTab(p, ten) {
	const tabs = await p.$$("[data-okr-sheet] [role=tab]");
	await tabs[TAB[ten]].click();
	await tre(600);
}

function doLe(laKr) {
	const panel = document.querySelector("[data-okr-sheet] [role=tabpanel][data-state=active]");
	const vung =
		document.querySelector("[data-cuon-ca-khung]") ??
		[...(panel?.querySelectorAll("div") ?? [])].find((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY));
	const bang = panel?.querySelector("[data-slot=table-container]");
	if (!vung || !bang) return { thieu: !vung ? "vung" : "bang" };
	const v = vung.getBoundingClientRect();
	const b = bang.getBoundingClientRect();
	const vPhai = v.left + vung.clientLeft + vung.clientWidth;
	const chu = laKr ? panel.querySelector("[data-khu=vi-sao] p") : null;
	return {
		trai: Math.round(b.left - v.left),
		phai: Math.round(vPhai - b.right),
		lechViSao: chu ? Math.round(Math.abs(b.left - chu.getBoundingClientRect().left)) : null,
		catPhai: bang.scrollWidth - bang.clientWidth,
	};
}

async function phanLe() {
	const krDau = await db.okrKeyResult.findFirst({ where: { objectiveId: idMau("mt", MT_A) }, select: { id: true, title: true } });
	const t = trpc(API, cookie["truong-phong"]);
	await t.lam("okr.updateKeyResult", { id: krDau.id, title: `${krDau.title} ·` }).catch((e) => console.log(`chuan bi vet: ${e?.message}`));
	await t.lam("okr.updateKeyResult", { id: krDau.id, title: krDau.title }).catch(() => {});
	let soO = 0;
	const khoDo = CO_DO ? [BD.kho[1440]] : [BD.kho[1440], BD.kho[390], BD.kho[375]];
	for (const kho of khoDo) {
		const { ctx, p } = await moTrang(cookie["truong-phong"], kho);
		await moKhung(p, slug, MT_A);
		if (CO_DO) await chenStyle(p, "[data-slot=detail-sheet-table]{padding-inline:0 !important}");
		for (const tab of CO_DO ? ["kr"] : ["kr", "can-chinh", "vet"]) {
			await bamTab(p, tab);
			const d = await p.evaluate(doLe, tab === "kr");
			if (d.thieu) {
				kiem(false, `thieu ${d.thieu}: ${tab} ${kho.ten}`);
				continue;
			}
			const dung =
				d.trai >= 16 && d.phai >= 16 && Math.abs(d.trai - d.phai) <= 1 && (d.lechViSao === null || d.lechViSao <= 1);
			if (kiem(dung, `bang cham mep: ${tab} ${kho.ten} (trai=${d.trai} phai=${d.phai} viSao=${d.lechViSao})`))
				console.log(`le ok ${kho.ten} ${tab} trai=${d.trai} phai=${d.phai} cuonNgangTrong=${d.catPhai}`);
			if (!CO_DO) await chup(p, `E1-${tab}-${kho.ten}`);
			soO += 1;
		}
		await ctx.close();
	}
	if (!CO_DO) kiem(soO === 9, `so o sai: ${soO} != 9`);
	console.log(`so o: ${soO}`);
}

function doThanh() {
	const hien = (e) => e.getClientRects().length > 0 && e.getBoundingClientRect().height > 0;
	const h = [...document.querySelectorAll("[data-hang-nut]")].find(hien);
	if (!h) return null;
	const tam = [...h.querySelectorAll("button")]
		.filter((b) => !b.closest("[data-radix-popper-content-wrapper]") && hien(b))
		.map((b) => {
			const r = b.getBoundingClientRect();
			return r.top + r.height / 2;
		})
		.sort((x, y) => x - y);
	const nut = tam.filter((t, i) => i === 0 || t - tam[i - 1] > 4).map((t) => Math.round(t));
	const the = h.closest("[data-don-vi]");
	const ds = [...document.querySelectorAll("[data-muc-tieu],[data-hang-muc-tieu],[data-trang-thai^='ST-donvi']")].find(hien);
	const nhom = h.querySelector("[data-nhom-soan]");
	const ban = the?.cloneNode(true);
	for (const p of ban?.querySelectorAll("[data-thong-tin-soan]") ?? []) p.remove();
	return {
		tops: [...new Set(nut)],
		cao: Math.round(the?.getBoundingClientRect().height ?? -1),
		dsTop: ds ? Math.round(ds.getBoundingClientRect().top) : null,
		cuoiLaNhom: Boolean(nhom) && h.lastElementChild === nhom,
		nutSoan: nhom?.querySelector("button")?.textContent?.trim() ?? null,
		hinh: nhom ? (nhom.getAttribute("data-nut-soan") ?? nhom.querySelector("[data-nut-soan]")?.getAttribute("data-nut-soan") ?? null) : null,
		nutKhoa: nhom?.querySelector("button")?.disabled ?? null,
		chuThe: ban?.textContent ?? "",
	};
}

const HINH_CUOI = { "mo-duoc": "nut", tiep: "nut-tiep", "che-do-an": "nut-an", "het-cuoc": "nut-het-cuoc", "chua-cau-hinh": "nut-chua-cau-hinh" };

async function doMotDang(ten, { chuPhu = [], chan = !TAT_CHAN, dangTaiCo = true }) {
	const { ctx, p } = await moTrang(cookie["quan-tri"], BD.kho[1440]);
	let giu = 0;
	if (chan) {
		await p.setRequestInterception(true);
		p.on("request", (r) => {
			if (r.url().includes("soanSanSang")) {
				giu += 1;
				setTimeout(() => r.continue().catch(() => {}), BD.cho.chan);
			} else r.continue().catch(() => {});
		});
	}
	await p.goto(`${APP}/${slug}/okr/theo-don-vi?kyOkr=${KYKE}&donOkr=pb:${PB}`, { waitUntil: "domcontentloaded" });
	await p.waitForSelector("[data-hang-nut]", { visible: true, timeout: BD.cho.phanTu });
	await p.waitForSelector("[data-trang-thai^='ST-donvi']:not([data-trang-thai='ST-donvi-dangtai'])", { visible: true, timeout: BD.cho.phanTu }).catch(() => {});
	if (chan) for (let i = 0; i < 120 && giu === 0; i += 1) await tre(250);
	await tre(300);
	const truoc = await p.evaluate(doThanh);
	if (dangTaiCo) {
		const batDuoc = giu >= 1 && truoc?.nutKhoa === true && truoc?.nutSoan === ms.nut.soan && truoc?.dsTop !== null;
		if (kiem(batDuoc, `khong bat duoc dang tai: ${ten} (giu=${giu} nut=${truoc?.nutSoan} khoa=${truoc?.nutKhoa})`))
			console.log(`dang tai da bat: ${ten}`);
		await chup(p, `E3-${ten}-truoc-tra`);
	}
	await tre(BD.cho.chan + 500);
	await yen(p);
	if (CO_DO && ten === "tiep")
		await p.evaluate((cau) => {
			const h = [...document.querySelectorAll("[data-hang-nut]")].find((e) => e.getBoundingClientRect().height > 0);
			const k = document.createElement("p");
			k.style.height = "20px";
			k.textContent = cau;
			h.after(k);
		}, chuPhu[0] ?? "");
	const sau = await p.evaluate(doThanh);
	await chup(p, `E3-${ten}-sau-tra`);
	kiem(sau?.hinh === HINH_CUOI[ten], `chua ve dang: ${ten} (hinh=${sau?.hinh}, mong ${HINH_CUOI[ten]})`);
	const motHang = sau.tops.length === 1 && (!dangTaiCo || truoc.tops.length === 1);
	const khongNhay = !dangTaiCo || (Math.abs(sau.cao - truoc.cao) <= 1 && Math.abs((sau.dsTop ?? 0) - (truoc.dsTop ?? 0)) <= 1);
	const khongChu = chuPhu.every((c) => !sau.chuThe.includes(c));
	if (kiem(motHang && khongNhay && sau.cuoiLaNhom && khongChu, `thanh nhay: ${ten} (hang=${sau.tops.length} cao ${truoc?.cao}->${sau.cao} ds ${truoc?.dsTop}->${sau.dsTop} cuoi=${sau.cuoiLaNhom} chu=${khongChu})`))
		console.log(`thanh ok ${ten} hang=1 lech=${Math.abs((sau.dsTop ?? 0) - (truoc?.dsTop ?? sau.dsTop ?? 0))}`);
	if (chuPhu.length > 0) {
		await p.click("[data-nut=thong-tin-soan]");
		await p.waitForSelector("[data-thong-tin-soan]", { timeout: 10_000 }).catch(() => {});
		const pop = await p.$eval("[data-thong-tin-soan]", (o) => o.textContent).catch(() => "");
		kiem(chuPhu.every((c) => pop.includes(c)), `thieu chu phu trong popover: ${ten}`);
		await chup(p, `E3-${ten}-popover`);
	}
	await ctx.close();
}

async function datSoan(nac) {
	const q = trpc(API, cookie["quan-tri"]);
	await q.lam("okr.setProgram", {
		...SAN.batKara,
		aiSoanPhamVi: nac === "bat" ? "danh-sach" : "tat",
		aiSoanDonVi: nac === "bat" ? [PB] : [],
		aiSoanAnPhamVi: nac === "an" ? "danh-sach" : "tat",
		aiSoanAnDonVi: nac === "an" ? [PB] : [],
	});
}

async function moMotCuoc() {
	const truong = await db.user.findUnique({ where: { email: thuMau(SAN.nguoi.truong) }, select: { id: true } });
	return moCuoc(db, {
		cycleId: KYKE,
		level: "phong-ban",
		divisionId: null,
		departmentId: PB,
		nguoiMoUserId: truong.id,
		sessionId: `${PHIEN_CHO_EVE}r1a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
		nac: "bat",
	});
}

async function phanThanhChua() {
	await doMotDang("chua-cau-hinh", { chuPhu: [ms.nut.chuaCauHinh], chan: false, dangTaiCo: false });
	console.log("so dang: 1");
}

async function phanThanh() {
	await datSoan("bat");
	await doMotDang("mo-duoc", {});
	const c1 = await moMotCuoc();
	const ss = await trpc(API, cookie["quan-tri"]).hoi("okr.soanSanSang", {
		cycleId: KYKE,
		level: "phong-ban",
		divisionId: null,
		departmentId: PB,
	});
	const cd = ss.cuocDang;
	const chuTiep = cd ? ms.nut.tiepMoTa(ngayThangVn(new Date(cd.moLuc)), String(cd.soLuot), String(cd.soDongTong - cd.soDongNhan)) : "khong co cuoc dang";
	await doMotDang("tiep", { chuPhu: [chuTiep] });
	await db.okrCuocSoan.update({ where: { id: c1.id }, data: { trangThai: "bo", soLuot: 1 } });
	await datSoan("an");
	await doMotDang("che-do-an", { chuPhu: [ms.nut.cheDoAn, ms.nut.cheDoAnMoTa] });
	await datSoan("bat");
	for (let i = 0; i < 2; i += 1) {
		const c = await moMotCuoc();
		await db.okrCuocSoan.update({ where: { id: c.id }, data: { trangThai: "bo", soLuot: 1 } });
	}
	await doMotDang("het-cuoc", { chuPhu: [ms.nut.hetCuoc("3")] });
	console.log("so dang: 4");
}

function doODienThoai() {
	return [...document.querySelectorAll("[data-slot=detail-sheet-stats] dd")].map((d) => {
		const tat = [d, ...d.querySelectorAll("*")];
		return {
			catNgang: Math.max(...tat.map((e) => e.scrollWidth - e.clientWidth)),
			catDoc: Math.max(...tat.map((e) => e.scrollHeight - e.clientHeight)),
			chu: d.innerText,
		};
	});
}

function doDau() {
	const ten = document.querySelector("[data-slot=drawer-title],[data-slot=sheet-title]");
	const hang = ten?.closest("[data-slot=drawer-header],[data-slot=sheet-header]")?.firstElementChild;
	const anh = hang?.firstElementChild;
	const tl = document.querySelector("[data-okr-sheet] [role=tablist], [role=dialog] [role=tablist]");
	const vung = document.querySelector("[data-cuon-ca-khung]");
	const r = ten?.getBoundingClientRect();
	return {
		canLe: ten ? getComputedStyle(ten).textAlign : null,
		khoangAnh: ten && anh && anh !== ten ? Math.round(r.left - anh.getBoundingClientRect().right) : null,
		tenDay: r ? Math.round(r.bottom) : null,
		tlTop: tl ? Math.round(tl.getBoundingClientRect().top) : null,
		vungTop: vung ? Math.round(vung.getBoundingClientRect().top) : null,
		tenTop: r ? Math.round(r.top) : null,
	};
}

async function phanDienThoai() {
	const mt = await db.okrObjective.findUnique({ where: { id: idMau("mt", MT_A) }, select: { ownerUserId: true } });
	await db.user.update({ where: { id: mt.ownerUserId }, data: { name: BD.tenDai } });
	const deal = await db.deal.findFirst({ where: { archivedAt: null }, select: { id: true } });
	if (!deal) {
		console.log("KHONG DO: kho do khong co thoa thuan nao");
		await ket(2);
	}
	const ct = await trpc(API, cookie["truong-phong"]).hoi("okr.objective", { id: idMau("mt", MT_A) });
	if (ct.expected === null || ct.expected === undefined) {
		console.log("KHONG DO: muc tieu khong co ky vong");
		await ket(2);
	}
	const leRa = mo.sheet.leRa.replace("{n}", String(ct.expected));
	for (const kho of [BD.kho[375], BD.kho[390]]) {
		const { ctx, p } = await moTrang(cookie["truong-phong"], kho);
		await moKhung(p, slug, MT_A);
		if (CO_DO)
			await chenStyle(p, "[data-tab-dinh]{position:static !important}[data-slot=detail-sheet-stats] dd *{white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important}[data-slot=drawer-header]{text-align:center !important}[data-slot=drawer-title]{text-align:center !important}");
		if (DO_DOC)
			await chenStyle(p, "[data-slot=detail-sheet-stats] > div:nth-child(3) dd *{display:-webkit-box !important;-webkit-line-clamp:1 !important;-webkit-box-orient:vertical !important;overflow:hidden !important}");
		const dau = await p.evaluate(doDau);
		await chup(p, `E8-muc-tieu-dau-${kho.ten}`);
		const o = await p.evaluate(doODienThoai);
		await chup(p, `E9-o-so-${kho.ten}`);
		const tienDo = o[0]?.chu ?? "";
		const phuTrach = o[2]?.chu ?? "";
		const khongCatNgang = o.every((x) => x.catNgang <= 1);
		const khongCatDoc = o.every((x) => x.catDoc <= 1);
		if (!kiem(khongCatNgang, `o so bi cat: phu-trach ${kho.ten}`)) {
		} else if (!kiem(khongCatDoc, `o so bi cat doc: phu-trach ${kho.ten}`)) {
		} else if (kiem(tienDo.includes(leRa) && phuTrach.includes(BD.tenDai), `o so thieu chu: ${kho.ten} (${tienDo} | ${phuTrach})`))
			console.log(`o so ok ${kho.ten}`);
		if (kiem((dau.canLe === "left" || dau.canLe === "start") && dau.khoangAnh !== null && dau.khoangAnh <= 16, `ten can giua: muc-tieu ${kho.ten} (${dau.canLe}, ${dau.khoangAnh})`))
			console.log(`can trai ok muc-tieu ${kho.ten}`);
		const vung = await p.$("[data-cuon-ca-khung]");
		if (!kiem(Boolean(vung), `khong co vung cuon ca khung: ${kho.ten}`)) {
			await ctx.close();
			continue;
		}
		const hop = await vung.boundingBox();
		await p.mouse.move(hop.x + hop.width / 2, hop.y + hop.height * 0.7);
		await p.mouse.wheel({ deltaY: 400 });
		await tre(800);
		const sau = await p.evaluate(doDau);
		await chup(p, `E8-muc-tieu-cuon-${kho.ten}`);
		const tenDi = sau.tenDay !== null && sau.vungTop !== null && sau.tenDay < sau.vungTop;
		const dinh = sau.tlTop !== null && sau.vungTop !== null && Math.abs(sau.tlTop - sau.vungTop) <= 1;
		if (!kiem(dinh, `tab khong dinh: ${kho.ten} (tl=${sau.tlTop} vung=${sau.vungTop})`)) {
		} else kiem(tenDi, `ten khong cuon di: ${kho.ten}`);
		await bamTab(p, "can-chinh");
		const chon = await p.$$eval("[data-okr-sheet] [role=tab]", (t) => t[1].getAttribute("aria-selected"));
		kiem(chon === "true", `tab dinh khong bam duoc: ${kho.ten}`);
		await p.mouse.wheel({ deltaY: -3000 });
		await tre(800);
		const ve = await p.evaluate(doDau);
		const hien = ve.tenTop !== null && ve.vungTop !== null && ve.tenTop >= ve.vungTop - 1;
		if (kiem(dinh && tenDi && hien && chon === "true", `dien thoai sai: ${kho.ten}`)) console.log(`dien thoai ok ${kho.ten}`);
		await ctx.close();

		const d = await moTrang(cookie["quan-tri"], kho);
		await d.p.goto(`${APP}/${slug}/deals?record=deal:${deal.id}`, { waitUntil: "domcontentloaded" });
		await d.p.waitForSelector("[role=dialog] [role=tab]", { timeout: BD.cho.phanTu });
		await yen(d.p);
		if (CO_DO) await chenStyle(d.p, "[data-slot=drawer-header]{text-align:center !important}[data-slot=drawer-title]{text-align:center !important}");
		const dd = await d.p.evaluate(doDau);
		if (kiem((dd.canLe === "left" || dd.canLe === "start") && dd.khoangAnh !== null && dd.khoangAnh <= 16, `ten can giua: thoa-thuan ${kho.ten} (${dd.canLe}, ${dd.khoangAnh})`))
			console.log(`can trai ok thoa-thuan ${kho.ten}`);
		const tab = await d.p.$("[role=dialog] [role=tabpanel][data-state=active]");
		const hopTab = await tab.boundingBox();
		await d.p.mouse.move(hopTab.x + hopTab.width / 2, hopTab.y + Math.min(hopTab.height / 2, 200));
		const cuonTab = () =>
			d.p.evaluate(() => {
				const panel = document.querySelector("[role=dialog] [role=tabpanel][data-state=active]");
				const vung = [panel, ...(panel?.querySelectorAll("*") ?? [])].find((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight);
				return vung ? vung.scrollTop : null;
			});
		const truocCuon = await cuonTab();
		await d.p.mouse.wheel({ deltaY: 200 });
		await tre(800);
		const sauCuon = await cuonTab();
		kiem(truocCuon !== null && sauCuon !== null && sauCuon > truocCuon, `than tab thoa thuan khong cuon: ${kho.ten} (${truocCuon} -> ${sauCuon})`);
		const dd2 = await d.p.evaluate(doDau);
		await chup(d.p, `E8-thoa-thuan-cuon-${kho.ten}`);
		kiem(Math.abs((dd2.tenTop ?? 0) - (dd.tenTop ?? 0)) <= 1, `thoa thuan doi cau truc: ${kho.ten}`);
		await d.ctx.close();
	}
	const { ctx, p } = await moTrang(cookie["truong-phong"], BD.kho[1440]);
	await moKhung(p, slug, MT_A);
	const dau = await p.evaluate(doDau);
	if (kiem((dau.canLe === "left" || dau.canLe === "start") && dau.khoangAnh !== null && dau.khoangAnh <= 16, `ten can giua: muc-tieu 1440 (${dau.canLe}, ${dau.khoangAnh})`))
		console.log("can trai ok muc-tieu 1440");
	await ctx.close();
}

function doChip(id) {
	const hang = [...document.querySelectorAll(`[data-hang-muc-tieu="${id}"]`)].find(
		(e) => e.getClientRects().length > 0 && e.getBoundingClientRect().height > 0,
	);
	const chip = hang?.querySelector("[data-chip-gop-y]");
	const nhom = hang?.querySelector("[data-nhom-nhan]");
	const nhan = nhom?.querySelector("[data-slot=badge]");
	if (!chip || !nhan) return null;
	const c = getComputedStyle(chip);
	const n = getComputedStyle(nhan);
	return {
		caoChip: chip.getBoundingClientRect().height,
		caoNhan: nhan.getBoundingClientRect().height,
		gocChip: c.borderRadius,
		gocNhan: n.borderRadius,
		chuChip: c.fontSize,
		chuNhan: n.fontSize,
		topChip: chip.getBoundingClientRect().top,
		topNhan: nhan.getBoundingClientRect().top,
		cuoi: nhom.lastElementChild === chip,
		nen: c.backgroundColor,
	};
}

async function phanChip() {
	await gieoGopY({ api: API, quanTri: cookie["quan-tri"], truong: cookie["truong-phong"] });
	const ten = "Giữ đà tăng trưởng bán lẻ miền Bắc qua mùa mua sắm cuối năm và Tết Nguyên đán";
	await db.okrObjective.update({ where: { id: idMau("mt", MT_A) }, data: { title: ten } });
	const id = idMau("mt", MT_A);
	const man = [
		{ ma: "cua-toi", duong: `/${slug}/okr?kyOkr=${KY4}` },
		{ ma: "theo-don-vi", duong: `/${slug}/okr/theo-don-vi?kyOkr=${KY4}&donOkr=pb:${PB}` },
	];
	let soO = 0;
	const viTri = new Map();
	const nong = await moTrang(cookie["truong-phong"], BD.kho[1440]);
	for (const m of man) {
		await nong.p.goto(`${APP}${m.duong}`, { waitUntil: "domcontentloaded" });
		await nong.p.waitForSelector(`[data-hang-muc-tieu="${id}"] [data-chip-gop-y]`, { visible: true, timeout: BD.cho.phanTu });
		await yen(nong.p);
	}
	await nong.ctx.close();
	for (const m of man)
		for (const kho of CO_DO ? [BD.kho[1440]] : [BD.kho[1440], BD.kho[375]]) {
			const { ctx, p } = await moTrang(cookie["truong-phong"], kho);
			await p.goto(`${APP}${m.duong}`, { waitUntil: "domcontentloaded" });
			await p.waitForSelector(`[data-hang-muc-tieu="${id}"] [data-chip-gop-y]`, { visible: true, timeout: BD.cho.phanTu });
			await yen(p);
			if (CO_DO) await chenStyle(p, "[data-chip-gop-y]{height:24px !important;border-radius:4px !important;flex-basis:100% !important}[data-nhom-nhan]{flex-wrap:wrap !important}");
			const d = await p.evaluate(doChip, id);
			const cungHinh = d && Math.abs(d.caoChip - d.caoNhan) <= 1 && d.gocChip === d.gocNhan && d.chuChip === d.chuNhan;
			if (kho.ten === "1440") {
				if (kiem(cungHinh, `chip lech nhan: ${m.ma}`)) {
					const chip = await p.evaluateHandle(
						(ma) =>
							[...document.querySelectorAll(`[data-hang-muc-tieu="${ma}"] [data-chip-gop-y]`)].find((e) => e.getBoundingClientRect().height > 0),
						id,
					);
					const hang = await chip.evaluateHandle((o) => o.closest("[data-hang-muc-tieu]"));
					const hopHang = await hang.boundingBox();
					await p.mouse.move(hopHang.x + 60, hopHang.y + hopHang.height / 2);
					await tre(600);
					const hopChip = await chip.boundingBox();
					await p.mouse.move(hopChip.x + hopChip.width / 2, hopChip.y + hopChip.height / 2);
					await tre(600);
					const timChip = (ma) =>
						[...document.querySelectorAll(`[data-hang-muc-tieu="${ma}"] [data-chip-gop-y]`)].find((e) => e.getBoundingClientRect().height > 0);
					const nenRe = await p.evaluate((ma, f) => getComputedStyle(new Function(`return (${f})`)()(ma)).backgroundColor, id, timChip.toString());
					const chanDoan = await chip.evaluate((o, x, y) => ({
						hop: `${Math.round(x)},${Math.round(y)}`,
						tren: (() => {
							const e = document.elementFromPoint(x, y);
							return `${e?.tagName}.${e?.getAttribute("data-slot") ?? ""}.${(e?.className ?? "").toString().slice(0, 40)}`;
						})(),
						scroll: `${scrollX},${scrollY}`,
						conTrongCay: o.isConnected,
						coLopHover: o.className.split(/\s+/).includes("hover:bg-muted"),
						hoverMedia: matchMedia("(hover: hover)").matches,
						dangHover: o.matches(":hover"),
					}), hopChip.x + hopChip.width / 2, hopChip.y + hopChip.height / 2);
					await p.mouse.move(0, 0);
					let toi = false;
					for (let i = 0; i < 80 && !toi; i += 1) {
						await p.keyboard.press("Tab");
						toi = await p.evaluate(() => document.activeElement?.hasAttribute("data-chip-gop-y") ?? false);
					}
					await tre(600);
					const vong = toi ? await p.evaluate(() => getComputedStyle(document.activeElement).boxShadow) : "none";
					const fv = toi ? await p.evaluate(() => `${document.activeElement.matches(":focus-visible")} lop=${document.activeElement.className.split(/\s+/).filter((l) => l.includes("ring")).join(",")}`) : false;
					const coVong = vong !== "none" && /\b[1-9]\d*(\.\d+)?px\b/.test(vong.replace(/0px 0px 0px 0px/g, ""));
					if (kiem(nenRe !== d.nen && toi && coVong, `chip thieu trang thai: ${m.ma} (re=${nenRe} nghi=${d.nen} focus=${toi} fv=${fv} vong=${vong.slice(0, 80)} ${JSON.stringify(chanDoan)})`))
						console.log(`chip ok ${m.ma}`);
					await chup(p, `E12-${m.ma}`);
				}
			}
			await chup(p, `E13-${m.ma}-${kho.ten}`, true);
			const cungHang = d && d.cuoi && (kho.ten !== "1440" || Math.abs(d.topChip - d.topNhan) <= 2);
			if (kiem(cungHang, `chip rot dong: ${m.ma} ${kho.ten}`)) console.log(`cung hang ok ${m.ma} ${kho.ten}`);
			viTri.set(`${m.ma}-${kho.ten}`, d ? Math.round(d.topChip - d.topNhan) : null);
			soO += 1;
			await ctx.close();
		}
	if (!CO_DO) {
		kiem(soO === 4, `so o sai: ${soO} != 4`);
		const a = viTri.get("cua-toi-375");
		const b = viTri.get("theo-don-vi-375");
		if (kiem(a !== null && b !== null && Math.abs(a - b) <= 2, `chip lech cho giua hai man: 375 (${a} vs ${b})`))
			console.log("cung cho ok 375");
	}
	console.log(`so o: ${soO}`);
}

const PHAN_CHAY = { le: phanLe, thanh: phanThanh, "thanh-chua": phanThanhChua, "dien-thoai": phanDienThoai, chip: phanChip };
try {
	await PHAN_CHAY[PHAN]();
} catch (loi) {
	console.log(`KHONG DO: ${PHAN} nem loi ${loi?.stack ?? loi}`);
	await ket(2);
}
await ketThuc();
