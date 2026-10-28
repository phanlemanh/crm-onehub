import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { OKR_CAM_XUC } from "../../../packages/validation/src/okr-cam-xuc.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	ket,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	bao,
	choThay,
	DO,
	GOC,
	mo,
	nghi,
	tongKet,
} from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";
import { taoNguCanh } from "../../vo-khu-muc-tieu/rang/do-man-ngu-canh.mjs";

const HO_SO = "cam-xuc-tren-cap-nhat";
const PHA = process.env.CX_PHA ?? "";
const MOI_PHA = ["", "khong-lam-moi-hop", "tai-lai"];
const MOI_EVAL = ["E4", "E10"];
const CHEP_ANH = process.env.CX_CHEP_ANH === "1";
const BANG_CHUNG = join(GOC, ".acceptance-runs", HO_SO, "evidence");
const BANG_CHUNG_HO_SO = join(GOC, "_acceptance", HO_SO, "evidence");
const DONG = "[data-dong-tin]";
const CHO_MS = 10_000;
const LOAI = ["dong-y", "chuc-mung", "co-len", "da-xem"];
const VA_NGUOI_KHAC = /và (\d+) người khác/;
const TRANG_TOI_DA = 30;
const CHON = new Set(
	(process.env.EVAL ?? "")
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);
const chay = (e) => CHON.size === 0 || CHON.has(e);

if (!MOI_PHA.includes(PHA)) {
	console.log(`KHONG DO DUOC: CX_PHA=${PHA} la`);
	process.exit(2);
}
const laMa = [...CHON].filter((e) => !MOI_EVAL.includes(e));
if (laMa.length > 0) {
	console.log(`KHONG DO DUOC: EVAL ${laMa.join(", ")} khong thuoc ban do nay`);
	process.exit(2);
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

function chepAnh(ten) {
	if (!CHEP_ANH) return;
	mkdirSync(BANG_CHUNG_HO_SO, { recursive: true });
	copyFileSync(join(BANG_CHUNG, ten), join(BANG_CHUNG_HO_SO, ten));
}

const duongCng = (n, trang = 1) =>
	n.w(
		`/okr/cap-nhat-gan-day?kyOkr=${n.ky.hienHanh}${trang > 1 ? `&trangCapNhat=${trang}` : ""}`,
	);
const duongHop = (n, bo) =>
	n.w(`/okr/bo-okr?xemOkr=hop-tuan&donOkr=${bo}&kyOkr=${n.ky.hienHanh}`);

async function docChip(trang, vung, loai) {
	return trang.evaluate(
		(v, l) => {
			const c = document.querySelector(`${v} [data-cam-xuc="${l}"]`);
			if (!c) return null;
			return {
				bam: c.getAttribute("aria-pressed") === "true",
				so: Number((c.textContent ?? "").replace(/\D+/g, "")),
			};
		},
		vung,
		loai,
	);
}

async function choChip(trang, vung, loai, mong) {
	const dau = Date.now();
	let thuc = await docChip(trang, vung, loai);
	while (Date.now() - dau < CHO_MS) {
		const so = thuc?.so ?? 0;
		const bam = thuc?.bam ?? false;
		if (so === mong.so && bam === mong.bam) return { dat: true, thuc };
		await nghi(DO.cho.nhipMs);
		thuc = await docChip(trang, vung, loai);
	}
	return { dat: false, thuc };
}

function donCua(khoa) {
	if (khoa === "goc") return { loai: "goc" };
	const [loai, id] = khoa.split(":");
	return { loai, id };
}

async function chonLan(n) {
	const api = await n.api.truong.hoi("okr.capNhatGanDay", {
		cycleId: n.ky.hienHanh,
		phamVi: "tat-ca",
		trang: 1,
	});
	const hop = new Map();
	for (const d of api.rows) {
		if (!d.moiNhat) continue;
		const loai = LOAI.find(
			(l) => !d.camXuc.some((m) => m.loai === l && m.cuaToi),
		);
		if (!loai) continue;
		if (!hop.has(d.bo.khoa))
			hop.set(
				d.bo.khoa,
				await n.api.truong.hoi("okr.hopTuan", {
					cycleId: n.ky.hienHanh,
					unit: donCua(d.bo.khoa),
				}),
			);
		const dangBan = hop.get(d.bo.khoa).dangBan;
		if (
			!dangBan.some(
				(h) => h.keyResultId === d.kr.id && h.checkInId === d.checkInId,
			)
		)
			continue;
		return {
			x: d.checkInId,
			k: d.kr.id,
			bo: d.bo.khoa,
			loai,
			so0: d.camXuc.find((m) => m.loai === loai)?.so ?? 0,
		};
	}
	return null;
}

async function moBang(t, vung, loai) {
	for (let lan = 0; lan < 3; lan += 1) {
		await nghi(DO.cho.langMs);
		await t.trang.click(`${vung} [data-mo-cam-xuc]`);
		if (await choThay(t.trang, `[data-chon-cam-xuc="${loai}"]`)) return true;
	}
	return false;
}

async function moNgan(t, k) {
	const nut = await t.trang.$(`[data-mo-kr="${k}"]`);
	if (!nut) return false;
	const bam = await nut
		.click()
		.then(() => true)
		.catch(() => false);
	return bam && choThay(t.trang, "[data-lich-su-kr]");
}

async function dongNgan(t) {
	await t.trang.keyboard.press("Escape");
	await nghi(DO.cho.langMs);
}

async function e4(n) {
	const t = n.may.truong;
	const c = await chonLan(n);
	if (!c)
		await khongDo(
			"KHONG DO DUOC: khong dung duoc Given AC-4 — khong co lan moi nhat nao tren trang dau",
		);
	const vungHop = `[data-kr-hop="${c.k}"]`;
	const vungLan = `[data-lich-su-kr] [data-hang-cam-xuc="${c.x}"]`;
	const r = await mo(t, duongHop(n, c.bo), vungHop);
	if (!r.thay) {
		bao(false, "", "SAI AC-4 hop-tuan khong thay dong KR");
		return;
	}
	const hop0 = (await docChip(t.trang, vungHop, c.loai)) ?? { so: 0 };
	if (!(await moNgan(t, c.k))) {
		bao(false, "", "SAI AC-4 ngan-kr khong mo");
		return;
	}
	const ngan0 = (await docChip(t.trang, vungLan, c.loai)) ?? { so: 0 };
	await dongNgan(t);
	let taiTrang = 0;
	const dem = () => {
		taiTrang += 1;
	};
	t.trang.on("load", dem);
	await t.trang.click(`a[href*="/okr/cap-nhat-gan-day"]`);
	await choThay(t.trang, `[data-dong-tin="${c.x}"]`);
	const vungDong = `[data-dong-tin="${c.x}"]`;
	if (!(await moBang(t, vungDong, c.loai))) {
		bao(false, "", "SAI AC-4 bang cam xuc khong mo");
		return;
	}
	if (PHA === "khong-lam-moi-hop") {
		await t.trang.setRequestInterception(true);
		t.trang.on("request", (req) =>
			req.url().includes("okr.hopTuan") ? req.abort() : req.continue(),
		);
	}
	await t.trang.click(`[data-chon-cam-xuc="${c.loai}"]`);
	const b1 = await choChip(t.trang, vungDong, c.loai, {
		so: c.so0 + 1,
		bam: true,
	});
	bao(
		b1.dat,
		`DUNG AC-4 cap-nhat-gan-day: ${c.loai} ${c.so0}->${c.so0 + 1}`,
		`SAI AC-4 cap-nhat-gan-day cu=${c.so0} moi=${b1.thuc?.so ?? 0}`,
	);
	if (PHA === "tai-lai") await t.trang.reload();
	await t.trang.goBack();
	await choThay(t.trang, vungHop);
	const b2 = await choChip(t.trang, vungHop, c.loai, {
		so: hop0.so + 1,
		bam: true,
	});
	bao(
		b2.dat,
		`DUNG AC-4 hop-tuan: ${hop0.so}->${hop0.so + 1}`,
		`SAI AC-4 hop-tuan cu=${hop0.so} moi=${b2.thuc?.so ?? 0}`,
	);
	if (PHA === "khong-lam-moi-hop") {
		t.trang.removeAllListeners("request");
		await t.trang.setRequestInterception(false);
	}
	if (!(await moNgan(t, c.k))) {
		bao(false, "", "SAI AC-4 ngan-kr khong mo sau khi tha");
		return;
	}
	const b3 = await choChip(t.trang, vungLan, c.loai, {
		so: ngan0.so + 1,
		bam: true,
	});
	bao(
		b3.dat,
		`DUNG AC-4 ngan-kr: ${ngan0.so}->${ngan0.so + 1}`,
		`SAI AC-4 ngan-kr cu=${ngan0.so} moi=${b3.thuc?.so ?? 0}`,
	);
	await t.trang.click(`${vungLan} [data-cam-xuc="${c.loai}"]`);
	const b4 = await choChip(t.trang, vungLan, c.loai, {
		so: ngan0.so,
		bam: false,
	});
	await dongNgan(t);
	await t.trang.click(`a[href*="/okr/cap-nhat-gan-day"]`);
	await choThay(t.trang, vungDong);
	const b5 = await choChip(t.trang, vungDong, c.loai, {
		so: c.so0,
		bam: false,
	});
	bao(
		b4.dat && b5.dat,
		"DUNG AC-4 go o ngan-kr thi cap-nhat-gan-day cung go",
		`SAI AC-4 go: ngan=${b4.thuc?.so ?? 0} cng=${b5.thuc?.so ?? 0}`,
	);
	t.trang.off("load", dem);
	bao(
		taiTrang === 0,
		"DUNG AC-4 khong tai lai trang",
		`SAI AC-4 co tai lai trang (${taiTrang})`,
	);
	if (!b5.dat && (await docChip(t.trang, vungDong, c.loai))?.bam)
		await n.api.truong.lam("okr.thaCamXuc", { checkInId: c.x, loai: c.loai });
}

async function tranNgang(trang) {
	return trang.evaluate(
		() => document.documentElement.scrollWidth - window.innerWidth,
	);
}

async function chup(t, ten) {
	await t.trang.screenshot({ path: join(BANG_CHUNG, ten), fullPage: true });
	chepAnh(ten);
}

async function cuon(t, sel) {
	await t.trang.$eval(sel, (x) => x.scrollIntoView({ block: "center" }));
	await nghi(DO.cho.langMs);
}

async function chonNhieu(n) {
	for (let trang = 1; trang <= TRANG_TOI_DA; trang += 1) {
		const api = await n.api.truong.hoi("okr.capNhatGanDay", {
			cycleId: n.ky.hienHanh,
			phamVi: "tat-ca",
			trang,
		});
		for (const d of api.rows) {
			const m = d.camXuc.find((x) => x.so > OKR_CAM_XUC.tenToiDa);
			if (m) return { x: d.checkInId, loai: m.loai, so: m.so, trang };
		}
		if (api.rows.length === 0) break;
	}
	return null;
}

async function dungChuaCapNhat(n, c) {
	const goc = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: c.k },
		select: { objectiveId: true, ownerUserId: true },
	});
	const moi = await n.api.quanTri.lam("okr.createKeyResult", {
		objectiveId: goc.objectiveId,
		title: "HT5 KR chua cap nhat",
		kind: "tang-toi",
		ownerUserId: goc.ownerUserId,
		startValue: 0,
		targetValue: 100,
		currentValue: 0,
		unit: "",
		dueOn: null,
		weight: 1,
	});
	const hop = await n.api.truong.hoi("okr.hopTuan", {
		cycleId: n.ky.hienHanh,
		unit: donCua(c.bo),
	});
	for (const [khoi, ds] of [
		["dang-ban", hop.dangBan],
		["con-lai", hop.conLai],
	]) {
		const dong = ds.find((h) => h.keyResultId === moi.id);
		if (dong?.checkInId === null) return { bo: c.bo, k: moi.id, khoi };
	}
	return null;
}

async function moDongChua(t, cc) {
	const sel = `[data-kr-hop="${cc.k}"]`;
	if (cc.khoi === "dang-ban") return (await choThay(t.trang, sel)) ? sel : null;
	const trong = `[data-con-lai] ${sel}`;
	for (let lan = 0; lan < 3; lan += 1) {
		if (await t.trang.$(trong)) return trong;
		await t.trang.click("[data-con-lai] button");
		await choThay(t.trang, trong);
	}
	return (await t.trang.$(trong)) ? trong : null;
}

async function e10(n) {
	const t = n.may.truong;
	const c = await chonLan(n);
	if (!c)
		await khongDo("KHONG DO DUOC: khong dung duoc Given AC-9 — khong co lan");
	const nh = await chonNhieu(n);
	if (!nh)
		await khongDo(
			`KHONG DO DUOC: khong co lan nao trong ${TRANG_TOI_DA} trang Cap nhat gan day co hon ${OKR_CAM_XUC.tenToiDa} nguoi tha mot loai (ST-camxuc-nhieu)`,
		);
	const cc = await dungChuaCapNhat(n, c);
	if (!cc)
		await khongDo(
			"KHONG DO DUOC: KR moi tao qua okr.createKeyResult khong hien tren Hop tuan voi checkInId rong (ST-hop-chua-cap-nhat)",
		);
	mkdirSync(BANG_CHUNG, { recursive: true });
	const dongNhieu = `${DONG.slice(0, -1)}="${nh.x}"]`;
	const lech = [];
	for (const kho of [DO.kho.mayTinh, DO.kho.dienThoai]) {
		await t.trang.setViewport({ width: kho.rong, height: kho.cao });
		await mo(t, duongCng(n, nh.trang), dongNhieu);
		await cuon(t, dongNhieu);
		const soChip = await t.trang.$eval(
			`${dongNhieu} [data-cam-xuc="${nh.loai}"]`,
			(x) => Number((x.textContent ?? "").replace(/\D+/g, "")),
		);
		bao(
			soChip === nh.so,
			`DUNG AC-9 ${kho.ten} ST-camxuc-nhieu: chip ${nh.loai} hien so ${nh.so}`,
			`SAI AC-9 ${kho.ten} ST-camxuc-nhieu: chip ${nh.loai} hien ${soChip}, API ${nh.so}`,
		);
		await chup(t, `cng-${kho.ten}.png`);
		const tCng = await tranNgang(t.trang);
		await mo(t, duongHop(n, c.bo), `[data-kr-hop="${c.k}"]`);
		await cuon(t, `[data-kr-hop="${c.k}"]`);
		await chup(t, `hop-${kho.ten}.png`);
		const tHop = await tranNgang(t.trang);
		await mo(t, duongHop(n, cc.bo), "[data-kr-hop]");
		const selChua = await moDongChua(t, cc);
		if (selChua) {
			await cuon(t, selChua);
			const coNut = await t.trang.$(`${selChua} [data-mo-cam-xuc]`);
			bao(
				!coNut,
				`DUNG AC-9 ${kho.ten} ST-hop-chua-cap-nhat: KR chua cap nhat khong co hang cam xuc`,
				`SAI AC-9 ${kho.ten} ST-hop-chua-cap-nhat: KR chua cap nhat van co nut tha`,
			);
			await chup(t, `hop-chua-cap-nhat-${kho.ten}.png`);
		} else lech.push(`khong thay dong KR chua cap nhat ${cc.k}`);
		await mo(t, duongHop(n, c.bo), `[data-kr-hop="${c.k}"]`);
		await moNgan(t, c.k);
		await nghi(DO.cho.langMs);
		await chup(t, `ngan-${kho.ten}.png`);
		const tNgan = await tranNgang(t.trang);
		await dongNgan(t);
		if (kho === DO.kho.dienThoai) {
			for (const [ten, so] of [
				["cap-nhat-gan-day", tCng],
				["hop-tuan", tHop],
				["ngan-kr", tNgan],
			])
				if (so > 0) lech.push(`tran ngang ${so} (${ten})`);
			await mo(t, duongCng(n, nh.trang), dongNhieu);
			await cuon(t, dongNhieu);
			const chip = await t.trang.$(`${dongNhieu} [data-cam-xuc]`);
			const bamTruoc = chip
				? await chip.evaluate((x) => x.getAttribute("aria-pressed"))
				: null;
			await t.trang.click(`${dongNhieu} [data-mo-cam-xuc]`);
			const coTen = await choThay(t.trang, "[data-ten-loai]");
			const bamSau = chip
				? await chip.evaluate((x) => x.getAttribute("aria-pressed"))
				: null;
			await chup(t, "bang-375.png");
			bao(
				coTen && bamTruoc === bamSau,
				"DUNG AC-5 375 thay ten, aria-pressed khong doi",
				"SAI AC-5 375 khong thay ten",
			);
			await t.trang.keyboard.press("Escape");
		} else {
			await mo(t, duongCng(n, nh.trang), dongNhieu);
			await cuon(t, dongNhieu);
			await t.trang.hover(`${dongNhieu} [data-cam-xuc="${nh.loai}"]`);
			await choThay(t.trang, "[data-ten-nguoi]");
			await nghi(DO.cho.langMs);
			const ten = await t.trang.$eval(
				"[data-ten-nguoi]",
				(x) => x.textContent ?? "",
			);
			const con = ten.match(VA_NGUOI_KHAC);
			bao(
				Number(con?.[1]) === nh.so - OKR_CAM_XUC.tenToiDa,
				`DUNG AC-5 1280 tooltip: ${OKR_CAM_XUC.tenToiDa} ten roi «và ${nh.so - OKR_CAM_XUC.tenToiDa} người khác»`,
				`SAI AC-5 1280 tooltip: «${ten}»`,
			);
			await chup(t, "tooltip-1280.png");
		}
	}
	await t.trang.setViewport({
		width: DO.kho.mayTinh.rong,
		height: DO.kho.mayTinh.cao,
	});
	bao(
		lech.length === 0,
		"DUNG AC-9 375: tran ngang 0 (ca ba man)",
		`SAI AC-9 ${lech.join("; ")}`,
	);
}

console.log(
	`do-man HT5: ${CHON.size === 0 ? "chay tron" : `chi ${[...CHON].join(", ")}`}${PHA ? ` · pha-thu ${PHA}` : ""}`,
);

try {
	const n = await taoNguCanh({ canSoan: false });
	if (chay("E10")) await e10(n);
	if (chay("E4")) await e4(n);
	await n.trinhDuyet.close();
} catch (loi) {
	console.log(`KHONG DO DUOC: ban do vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}

console.log(
	CHEP_ANH
		? `anh: ${BANG_CHUNG_HO_SO}`
		: `anh: ${BANG_CHUNG} (khong chep sang ho so — dat CX_CHEP_ANH=1 o buoc cua E10)`,
);
const { dung, sai } = tongKet();
console.log(`KET LUAN HT5: ${dung} DUNG, ${sai} SAI`);
await db.$disconnect();
await ket(sai === 0 ? 0 : 1);
