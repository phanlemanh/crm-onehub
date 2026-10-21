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

const HO_SO = "moi-kr-ca-cong-ty";
const N_TRUOT = 3;
const PHA = process.env.MKC_PHA ?? "";
const MOI_PHA = ["", "dem-ca-nhan", "mot-trang", "bo-mat-nguoi"];
const MOI_EVAL = ["E2", "E11", "E12"];
const CHEP_ANH = process.env.MKC_CHEP_ANH === "1";
const BANG_CHUNG = join(GOC, ".acceptance-runs", HO_SO, "evidence");
const BANG_CHUNG_HO_SO = join(GOC, "_acceptance", HO_SO, "evidence");
const LOC_RONG = { tinhTrang: [], donVi: [], nguoi: [] };
const O_TRUOT = "[data-o='kr-truot']";
const DONG = "[data-slot='table-body'] [data-slot='table-row']";
const CHON = new Set(
	(process.env.EVAL ?? "")
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);
const chay = (e) => CHON.size === 0 || CHON.has(e);

if (!MOI_PHA.includes(PHA)) {
	console.log(`KHONG DO DUOC: MKC_PHA=${PHA} la`);
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

const soTruot = (o) =>
	o.facetCounts.tinhTrang.find((d) => d.value === "truot")?.count ?? 0;

async function batDuocGiven(n) {
	const hoi = (loc = LOC_RONG) =>
		n.api.quanTri.hoi("okr.moiKr", { cycleId: n.ky.hienHanh, loc });
	if (soTruot(await hoi()) >= N_TRUOT) return;
	const mt = await n.api.truong.hoi("okr.objective", { id: n.mucTieu.id });
	if (mt.kind !== "cam-ket")
		await khongDo(`KHONG DO DUOC: muc tieu mau ${mt.id} khong phai cam-ket`);
	for (const k of mt.keyResults.filter((x) => x.kind !== "moc"))
		await n.api.truong.lam("okr.updateKeyResult", {
			id: k.id,
			currentValue: k.startValue,
		});
	const sau = soTruot(await hoi());
	if (sau < 2)
		await khongDo(
			`KHONG DO DUOC: khong dung duoc Given AC-1 — chi ${sau} KR truot sau khi ha so`,
		);
}

async function docBang(trang) {
	return trang.evaluate((chon) => {
		const dong = [...document.querySelectorAll(chon)];
		const tong = document.querySelector("[data-tong-kr]")?.textContent ?? "";
		return {
			tieuDe: dong.map(
				(r) => r.querySelector("span.font-medium")?.textContent ?? "",
			),
			tinhTrang: dong.map(
				(r) =>
					r
						.querySelector("[data-tinh-trang]")
						?.getAttribute("data-tinh-trang") ?? "",
			),
			tong: Number(tong.replace(/\D+/g, "")),
		};
	}, DONG);
}

async function e2(n) {
	const t = n.may.quanTri;
	const ky = n.ky.hienHanh;
	const r = await mo(t, n.w(`/okr/suc-khoe?kyOkr=${ky}`), O_TRUOT);
	if (!r.thay) {
		bao(false, "", "SAI AC-1 khong thay o kr-truot");
		return;
	}
	await t.trang.waitForFunction(
		(c) => !document.querySelector(c)?.textContent?.includes("—"),
		{ timeout: DO.cho.dauHieuMs },
		O_TRUOT,
	);
	const soO = await t.trang.$eval(O_TRUOT, (o) =>
		Number(o.querySelector(".text-3xl")?.textContent ?? "NaN"),
	);
	const api = await n.api.quanTri.hoi("okr.moiKr", {
		cycleId: ky,
		loc: { ...LOC_RONG, tinhTrang: ["truot"] },
	});
	let soApi = api.total;
	if (PHA === "dem-ca-nhan")
		soApi += await db.okrKeyResult.count({
			where: { objective: { cycleId: ky, level: "ca-nhan" } },
		});
	const moc = t.dieuHuong.length;
	await Promise.all([
		t.trang.waitForNavigation({ timeout: DO.cho.taiMs }).catch(() => null),
		t.trang.click(O_TRUOT),
	]);
	await choThay(t.trang, DONG);
	await nghi(DO.cho.hydrateMs);
	const url = new URL(t.trang.url());
	const bang = await docBang(t.trang);
	const tongBang = PHA === "mot-trang" ? Math.min(bang.tong, 1) : bang.tong;
	const soBam = 1;
	const lech = [];
	if (url.pathname !== n.w("/okr/moi-kr")) lech.push(`duong ${url.pathname}`);
	if (url.searchParams.get("tinhTrangKr") !== "truot")
		lech.push(`tinhTrangKr=${url.searchParams.get("tinhTrangKr")}`);
	if (soO !== soApi) lech.push("so-o != api");
	if (tongBang !== soO) lech.push("tong-bang != so-o");
	if (bang.tinhTrang.some((v) => v !== "truot"))
		lech.push("co dong khong Truot");
	if (t.dieuHuong.length - moc > 2) lech.push("hon mot buoc chuyen");
	bao(
		lech.length === 0,
		`DUNG AC-1 mot-bam: duong=${url.pathname}${url.search}, so-o=${soO}, tong-bang=${tongBang}, api=${soApi}, so-bam=${soBam}`,
		`SAI AC-1 ${lech.join("; ")} (so-o=${soO}, tong-bang=${tongBang}, api=${soApi})`,
	);
}

async function e12(n) {
	const t = n.may.quanTri;
	const ky = n.ky.hienHanh;
	const tatCa = await n.api.quanTri.hoi("okr.moiKr", {
		cycleId: ky,
		loc: LOC_RONG,
	});
	const tinhTrang = ["truot", "cham-nhip"];
	const ung = tatCa.rows.filter((d) => tinhTrang.includes(d.tinhTrang));
	const mau = ung.find((d) => d.donVi.khoa.startsWith("pb:")) ?? ung[0];
	if (!mau) {
		bao(
			false,
			"",
			"SAI nguong duong-dan khong co KR truot hay cham nhip de loc",
		);
		return;
	}
	const loc = {
		tinhTrang,
		donVi: [mau.donVi.khoa],
		nguoi: [mau.nguoi.id],
	};
	const q = new URLSearchParams({
		kyOkr: ky,
		tinhTrangKr: loc.tinhTrang.join(","),
		donViKr: loc.donVi.join(","),
		nguoiKr: loc.nguoi.join(","),
	});
	await mo(t, n.w(`/okr/moi-kr?${q}`), DONG);
	const bang = await docBang(t.trang);
	const api = await n.api.quanTri.hoi("okr.moiKr", {
		cycleId: ky,
		loc: PHA === "bo-mat-nguoi" ? { ...loc, nguoi: [] } : loc,
	});
	const tap = (ds) => [...ds].sort().join("|");
	const dat =
		bang.tieuDe.length > 0 &&
		tap(bang.tieuDe) === tap(api.rows.map((d) => d.tieuDe));
	bao(
		dat,
		`DUNG nguong duong-dan: ${bang.tieuDe.length} dong khop api`,
		`SAI nguong duong-dan tap lech (bang ${bang.tieuDe.length}, api ${api.rows.length})`,
	);
}

async function e11(n) {
	const t = n.may.quanTri;
	const ky = n.ky.hienHanh;
	mkdirSync(BANG_CHUNG, { recursive: true });
	for (const kho of [DO.kho.mayTinh, DO.kho.dienThoai]) {
		await t.trang.setViewport({ width: kho.rong, height: kho.cao });
		for (const man of [
			{ ten: "suc-khoe", duong: `/okr/suc-khoe?kyOkr=${ky}`, cho: O_TRUOT },
			{
				ten: "moi-kr",
				duong: `/okr/moi-kr?kyOkr=${ky}&tinhTrangKr=truot`,
				cho: DONG,
			},
		]) {
			await mo(t, n.w(man.duong), man.cho);
			const anh = `${man.ten}-${kho.ten}.png`;
			await t.trang.screenshot({ path: join(BANG_CHUNG, anh), fullPage: true });
			chepAnh(anh);
			if (man.ten !== "moi-kr" || kho !== DO.kho.dienThoai) continue;
			const do_ = await t.trang.evaluate(() => {
				const hien = (el) =>
					el.getClientRects().length > 0 &&
					getComputedStyle(el).display !== "none";
				const dau = [...document.querySelectorAll("[data-slot='table-head']")];
				const an = dau.filter((h) => !hien(h)).length;
				const cham = [...document.querySelectorAll("[data-tinh-trang]")].every(
					(c) => (c.textContent ?? "").trim().length > 0,
				);
				return {
					tran: document.documentElement.scrollWidth - window.innerWidth,
					an,
					cham,
				};
			});
			bao(
				do_.tran <= 0 && do_.an >= 2 && do_.cham,
				`DUNG AC-10 moi-kr 375: tran ngang ${Math.max(0, do_.tran)}, cot an ${do_.an}`,
				`SAI AC-10 moi-kr 375: tran ngang ${do_.tran}, cot an ${do_.an}, cham kem chu ${do_.cham}`,
			);
		}
	}
	await t.trang.setViewport({
		width: DO.kho.mayTinh.rong,
		height: DO.kho.mayTinh.cao,
	});
}

console.log(
	`do-man VK11: ${CHON.size === 0 ? "chay tron" : `chi ${[...CHON].join(", ")}`}${PHA ? ` · pha-thu ${PHA}` : ""}`,
);

try {
	const n = await taoNguCanh({ canSoan: false });
	await batDuocGiven(n);
	if (chay("E2")) await e2(n);
	if (chay("E12")) await e12(n);
	if (chay("E11")) await e11(n);
	await n.trinhDuyet.close();
} catch (loi) {
	console.log(`KHONG DO DUOC: ban do vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}

console.log(
	CHEP_ANH
		? `anh: ${BANG_CHUNG_HO_SO}`
		: `anh: ${BANG_CHUNG} (khong chep sang ho so — dat MKC_CHEP_ANH=1 o buoc cua E11)`,
);
const { dung, sai } = tongKet();
console.log(`KET LUAN VK11: ${dung} DUNG, ${sai} SAI`);
await db.$disconnect();
await ket(sai === 0 ? 0 : 1);
