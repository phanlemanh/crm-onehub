import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
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

const duongCng = (n) => n.w(`/okr/cap-nhat-gan-day?kyOkr=${n.ky.hienHanh}`);
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

async function chonLan(n) {
	const api = await n.api.truong.hoi("okr.capNhatGanDay", {
		cycleId: n.ky.hienHanh,
		phamVi: "tat-ca",
		trang: 1,
	});
	for (const d of api.rows) {
		if (!d.moiNhat) continue;
		const loai = LOAI.find(
			(l) => !d.camXuc.some((m) => m.loai === l && m.cuaToi),
		);
		if (loai)
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

async function moNgan(t, k) {
	await t.trang.click(`[data-mo-kr="${k}"]`);
	return choThay(t.trang, "[data-lich-su-kr]");
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
	const vungLan = `[data-hang-cam-xuc="${c.x}"]`;
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
	await t.trang.click(`${vungDong} [data-mo-cam-xuc]`);
	await choThay(t.trang, `[data-chon-cam-xuc="${c.loai}"]`);
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
	await moNgan(t, c.k);
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
	if (PHA === "khong-lam-moi-hop") await t.trang.setRequestInterception(false);
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

async function e10(n) {
	const t = n.may.truong;
	const c = await chonLan(n);
	if (!c)
		await khongDo("KHONG DO DUOC: khong dung duoc Given AC-9 — khong co lan");
	mkdirSync(BANG_CHUNG, { recursive: true });
	const lech = [];
	for (const kho of [DO.kho.mayTinh, DO.kho.dienThoai]) {
		await t.trang.setViewport({ width: kho.rong, height: kho.cao });
		await mo(t, duongCng(n), DONG);
		await chup(t, `cng-${kho.ten}.png`);
		const tCng = await tranNgang(t.trang);
		await mo(t, duongHop(n, c.bo), `[data-kr-hop="${c.k}"]`);
		await chup(t, `hop-${kho.ten}.png`);
		const tHop = await tranNgang(t.trang);
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
			await mo(t, duongCng(n), DONG);
			const chip = await t.trang.$(`${DONG} [data-cam-xuc]`);
			const bamTruoc = chip
				? await chip.evaluate((x) => x.getAttribute("aria-pressed"))
				: null;
			await t.trang.click(`${DONG} [data-mo-cam-xuc]`);
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
			await mo(t, duongCng(n), DONG);
			const chip = await t.trang.$(`${DONG} [data-cam-xuc]`);
			if (chip) {
				await chip.hover();
				await choThay(t.trang, "[data-ten-nguoi]");
				await nghi(DO.cho.langMs);
				await chup(t, "tooltip-1280.png");
			} else lech.push("khong chip nao de chup tooltip");
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
