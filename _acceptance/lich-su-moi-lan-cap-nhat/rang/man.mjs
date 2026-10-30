import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	APP,
	ket,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	bam,
	bamChu,
	CHU_TU_TIN,
	cho,
	choHet,
	DO,
	dongTrang,
	giaTriMoiCua,
	go,
	moTrang,
	moTrinhDuyet,
	nghi,
} from "../../hop-tuan-tren-bang/rang/man-lib.mjs";
import {
	BANG_CHUNG,
	CHON,
	choSqlDat,
	coSo,
	DOC_MUC,
	dong,
	dungDuLieu,
	ketQua,
	LSML,
	moiNhatSql,
	soLanSql,
} from "./man-lib.mjs";

const AC = "AC-6";

async function choNganDungYen(t) {
	let truoc = null;
	for (let i = 0; i < LSML.cho.dungYenToiDa; i += 1) {
		const r = await t.evaluate((c) => {
			const el = [...document.querySelectorAll(c)].find((e) =>
				e.checkVisibility(),
			);
			if (!el) return null;
			const b = el.getBoundingClientRect();
			return `${Math.round(b.left)},${Math.round(b.top)},${Math.round(b.width)},${Math.round(b.height)}`;
		}, CHON.ngan);
		if (r !== null && r === truoc) return true;
		truoc = r;
		await nghi(LSML.cho.dungYenMs);
	}
	return false;
}

async function choMuc(t, can) {
	return t
		.waitForFunction(
			(chon, c) => {
				const hien = (el) => el.checkVisibility();
				const goc = [...document.querySelectorAll(chon.muc)].find(hien);
				if (!goc) return false;
				const dongs = [...goc.querySelectorAll("[data-lan-cap-nhat]")].filter(
					hien,
				);
				const cham = goc.querySelectorAll(".recharts-line-dots circle").length;
				if (c === null) return dongs.length > 0 && cham > 0;
				return (
					dongs[0]?.getAttribute("data-lan-cap-nhat") === c.id &&
					dongs.length === c.dong &&
					cham === c.cham
				);
			},
			{ timeout: LSML.cho.lanMs, polling: LSML.cho.nhipMs },
			{ muc: CHON.muc },
			can,
		)
		.then(() => true)
		.catch(() => false);
}

async function chup(t, ten) {
	await t.evaluate((c) => {
		const el = [...document.querySelectorAll(c)].find((e) =>
			e.checkVisibility(),
		);
		el?.scrollIntoView({ block: "start", inline: "nearest" });
		for (let e = el?.parentElement; e; e = e.parentElement) e.scrollLeft = 0;
	}, CHON.muc);
	await nghi(DO.cho.onDinhMs);
	await choNganDungYen(t);
	const duong = join(BANG_CHUNG, `${ten}.png`);
	await t.screenshot({ path: duong });
	return duong;
}

const DOC_CHE = (c) => {
	const el = [...document.querySelectorAll(c)].find((e) => e.checkVisibility());
	if (!el) return { co: false, boi: "khong thay nut" };
	el.scrollIntoView({ block: "center", inline: "nearest" });
	const b = el.getBoundingClientRect();
	const tren = document.elementFromPoint(
		b.left + b.width / 2,
		b.top + b.height / 2,
	);
	if (tren && (tren === el || el.contains(tren)))
		return { co: true, boi: null };
	const goc = tren?.closest("[data-sonner-toast]") ?? tren;
	return {
		co: false,
		boi: goc
			? `${goc.tagName.toLowerCase()}${goc.hasAttribute("data-sonner-toast") ? "[data-sonner-toast]" : ""} ${goc.textContent.trim().slice(0, 30)}`
			: "khong co phan tu",
	};
};

async function choKhongBiChe(t, chon) {
	const dau = await t.evaluate(DOC_CHE, chon);
	if (dau.co) return { cho: false, het: true, boi: null };
	const han = Date.now() + DO.cho.guiMs;
	let het = false;
	while (!het && Date.now() < han) {
		await nghi(DO.cho.nhipMs);
		het = (await t.evaluate(DOC_CHE, chon)).co;
	}
	return { cho: true, het, boi: dau.boi };
}

async function guiMotLan(t, n, giaTri, tuTin, ghiChu) {
	const hop = CHON.hop(n.kr.id);
	const bamNut = await bam(t, CHON.nutCapNhat(n.kr.id));
	const moHop = await t
		.waitForSelector(hop, { visible: true, timeout: DO.cho.dieuHuongMs })
		.then(() => true)
		.catch(() => false);
	if (!bamNut || !moHop)
		return {
			ok: false,
			ly: `nut Cap nhat ${bamNut ? "bam" : "KHONG bam duoc"} · hop ${moHop ? "mo" : "KHONG mo"}`,
		};
	await go(t, `${hop} [data-o='gia-tri'] input`, String(giaTri));
	await bamChu(
		t,
		`${hop} [data-o='tu-tin'] [data-slot='toggle-group-item']`,
		CHU_TU_TIN[tuTin],
	);
	await go(t, `${hop} [data-o='ghi-chu'] input`, ghiChu);
	const sanSang = await t
		.waitForFunction(
			(h) =>
				document.querySelector(`${h} [data-nut='gui-cap-nhat-kr']`)
					?.disabled === false,
			{ timeout: DO.cho.dieuHuongMs, polling: DO.cho.nhipMs },
			hop,
		)
		.then(() => true)
		.catch(() => false);
	if (!sanSang)
		return {
			ok: false,
			ly: "nut Gui khong bat sau khi go gia tri, tu tin, ghi chu",
		};
	const nutGui = `${hop} [data-nut='gui-cap-nhat-kr']`;
	const che = await choKhongBiChe(t, nutGui);
	await bam(t, nutGui);
	const dongHop = await choHet(t, hop, DO.cho.guiMs);
	const ly = `${dongHop ? "hop dong" : "hop CON MO sau khi gui"}${che.cho ? ` · nut Gui bi «${che.boi}» che, cho het che ${che.het ? "xong" : "KHONG het"}` : ""}`;
	return { ok: dongHop, ly };
}

async function mot(n, kho, theme, anh) {
	const nhan = `${kho.ten}-${theme.ten}`;
	let taiLai = 0;
	const t = await moTrang(n.ck, n.duong, kho, theme.toi, (p) => {
		p.on("domcontentloaded", () => {
			taiLai += 1;
		});
	});
	const coMuc = await cho(t, CHON.dong);
	const coCham = await choMuc(t, null);
	await choNganDungYen(t);
	const taiGoc = taiLai;
	const duongGoc = t.url();
	const truoc = await t.evaluate(DOC_MUC, { muc: CHON.muc });
	const n0 = await soLanSql(n.kr.id);
	console.log(
		`-- ${nhan}: muc Lich su ${coMuc ? "co" : "KHONG"} (${truoc.muc} muc hien) · ${truoc.dong} dong · ${truoc.cham} cham · OkrCheckIn ${n0}${coCham ? "" : " · cho cham het gio"}`,
	);
	anh.push(await chup(t, `lsml-truoc-${nhan}`));
	dong(
		AC,
		truoc.muc === 1 && truoc.dong > 0 && truoc.dong === n0,
		`DOI CHUNG DUONG ${nhan}`,
		`truoc khi gui: ${truoc.dong} dong Lich su = ${n0} OkrCheckIn cua KR (SQL) · ${truoc.muc} muc Lich su hien`,
	);

	const [cuoi] = await moiNhatSql(n.kr.id);
	const tuTin = cuoi?.tuTin ?? LSML.tuTinMacDinh;
	const v1 = giaTriMoiCua(n.kr, cuoi?.giaTri ?? Number(n.kr.startValue));
	const v2 = giaTriMoiCua(n.kr, v1);
	const gia = [v1, v2];
	const moi = [];
	const lyDo = [];
	for (let i = 0; i < LSML.soLanGui; i += 1) {
		const g = await guiMotLan(
			t,
			n,
			gia[i],
			tuTin,
			`lsml ${n.run} ${nhan} lan ${i + 1}`,
		);
		if (!g.ok) lyDo.push(`lan ${i + 1}: ${g.ly}`);
		const nSql = await choSqlDat(n.kr.id, n0 + i + 1);
		const [dau] = await moiNhatSql(n.kr.id);
		moi.push(dau?.id ?? null);
		const thay = await choMuc(t, {
			id: dau?.id ?? "-",
			dong: truoc.dong + i + 1,
			cham: truoc.cham + i + 1,
		});
		const d = await t.evaluate(DOC_MUC, { muc: CHON.muc });
		if (i === 0)
			dong(
				AC,
				g.ok && thay && nSql === n0 + 1,
				`SAU LAN 1 ${nhan}`,
				`gui ${v1}: ${g.ly} · OkrCheckIn ${n0} → ${nSql} · dong ${truoc.dong} → ${d.dong} · cham ${truoc.cham} → ${d.cham} · dong dau ${d.dau[0]?.id ?? "-"} (can ${dau?.id ?? "-"})`,
			);
	}
	await nghi(DO.cho.onDinhMs);
	const sau = await t.evaluate(DOC_MUC, { muc: CHON.muc });
	const n2 = await soLanSql(n.kr.id);
	const hai = await moiNhatSql(n.kr.id);
	anh.push(await chup(t, `lsml-sau-${nhan}`));

	dong(
		AC,
		sau.dong - truoc.dong === LSML.soLanGui,
		`DONG +2 ${nhan}`,
		`dong Lich su ${truoc.dong} → ${sau.dong} (+${sau.dong - truoc.dong}, can +${LSML.soLanGui})${lyDo.length ? ` · ${lyDo.join(" ; ")}` : ""}`,
	);
	dong(
		AC,
		sau.cham - truoc.cham === LSML.soLanGui,
		`CHAM +2 ${nhan}`,
		`cham duong gia tri ${truoc.cham} → ${sau.cham} (+${sau.cham - truoc.cham}, can +${LSML.soLanGui})`,
	);
	dong(
		AC,
		n2 - n0 === LSML.soLanGui,
		`OKRCHECKIN +2 ${nhan}`,
		`OkrCheckIn cua KR (SQL) ${n0} → ${n2} (+${n2 - n0}, can +${LSML.soLanGui})`,
	);
	const idSql = hai.map((h) => h.id);
	const idDom = sau.dau.map((d) => d.id);
	dong(
		AC,
		idDom.length === 2 &&
			idDom[0] !== idDom[1] &&
			idDom[0] === idSql[0] &&
			idDom[1] === idSql[1] &&
			!truoc.ids.includes(idDom[0]) &&
			!truoc.ids.includes(idDom[1]),
		`HAI DONG DAU LA HAI LAN MOI ${nhan}`,
		`data-lan-cap-nhat ${idDom.join(", ") || "-"} · hai id OkrCheckIn moi nhat (SQL) ${idSql.join(", ") || "-"}`,
	);
	dong(
		AC,
		hai[0]?.giaTri === v2 &&
			hai[1]?.giaTri === v1 &&
			coSo(sau.dau[0]?.giaTri ?? null, v2) &&
			coSo(sau.dau[1]?.giaTri ?? null, v1),
		`GIA TRI THEO THU TU ${nhan}`,
		`dong dau «${sau.dau[0]?.giaTri ?? "-"}» (can lan hai ${v2}, SQL ${hai[0]?.giaTri ?? "-"}) · dong hai «${sau.dau[1]?.giaTri ?? "-"}» (can lan mot ${v1}, SQL ${hai[1]?.giaTri ?? "-"})`,
	);
	const tai = taiLai - taiGoc;
	dong(
		AC,
		tai === 0 && t.url() === duongGoc,
		`KHONG TAI LAI ${nhan}`,
		`tai lai trang ${tai} lan · url ${t.url() === duongGoc ? "giu nguyen" : `doi thanh ${t.url()}`}`,
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
const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);
console.log(`ban do: ${APP}`);

await moTrinhDuyet();
try {
	const n = { ...(await dungDuLieu()), run: Date.now().toString(36) };
	mkdirSync(BANG_CHUNG, { recursive: true });
	const anh = [];
	for (const kho of LSML.kho)
		for (const theme of LSML.theme) await mot(n, kho, theme, anh);
	const co = anh.filter((a) => existsSync(a));
	dong(
		AC,
		co.length === LSML.soAnh,
		"DU ANH",
		`${co.length}/${LSML.soAnh} anh o ${BANG_CHUNG}`,
	);
	for (const a of co) console.log(`anh: ${a}`);
} catch (loi) {
	console.log(`KHONG DO DUOC: thuoc vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}
await db.$disconnect();
const { dung, sai } = ketQua();
console.log(`KET LUAN lsml man: ${dung} DUNG, ${sai} SAI`);
await ket(sai === 0 ? 0 : 1);
