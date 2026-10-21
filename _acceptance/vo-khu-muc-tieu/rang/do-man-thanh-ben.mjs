import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { nhanTuHoiYNhan } from "../../../apps/app/app/(app)/[slug]/okr/hoi-y/man-hoi-y.ts";
import { kyMacDinhHoiY } from "../../../apps/app/app/(app)/[slug]/okr/okr-search-params.ts";
import { okrMessages } from "../../../apps/app/lib/messages/okr.ts";
import { okrVoKhuMessages } from "../../../apps/app/lib/messages/okr-vo-khu.ts";
import {
	bao,
	choThay,
	DO,
	demLop,
	docThanhBen,
	GOC,
	kyThan,
	kyTheoTen,
	mo,
	nghi,
	PHA,
	phienCua,
	trangMoi,
} from "./do-man-lib.mjs";
import { DUONG_MUC, datVaiOkr, khoMay } from "./do-man-ngu-canh.mjs";

const HO_SO = "vo-khu-muc-tieu";
const BANG_CHUNG = join(GOC, ".acceptance-runs", HO_SO, "evidence");
export const BANG_CHUNG_HO_SO = join(GOC, "_acceptance", HO_SO, "evidence");
export const CHEP_ANH = process.env.VKM_CHEP_ANH === "1";
export { BANG_CHUNG };

const CHU_OKR = okrMessages("vi");
const CHU_VK = okrVoKhuMessages("vi");
const CHO_THANH_BEN = "aside[data-slot='area-sidebar'] nav a[href]";
const CHO_O_KY = "aside[data-slot='area-sidebar'] [data-chon-chu-ky]";
const MA = `vkm${Date.now().toString(36)}`;

const THU_TUC_TRANG = {
	"/okr/bo-okr": { ten: "danhSach", cho: "[data-hang-cong-cu-don-vi]" },
	"/okr/lay-y-kien": {
		ten: "hoiY",
		cho: "[data-slot='page-shell-description']",
	},
	"/okr/suc-khoe": { ten: "toanCanh", cho: "[data-hang-toan-canh]" },
};

async function bamMuc(n, t, duong, truocBam = null) {
	const a = await t.trang.$(
		`aside[data-slot='area-sidebar'] nav a[href^="${n.w(duong)}"]`,
	);
	if (!a) return null;
	if (truocBam) await truocBam(a);
	const tuLuc = Date.now();
	await a.click();
	await t.trang
		.waitForFunction(
			(d) => location.pathname === d,
			{ timeout: DO.cho.dauHieuMs },
			n.w(duong),
		)
		.catch(() => {});
	return tuLuc;
}

async function docBuoc(n, t, nhan, duong, tuLuc, tenCu) {
	const tt = THU_TUC_TRANG[duong];
	await choThay(t.trang, tt.cho);
	await choThay(t.trang, CHO_O_KY);
	await nghi(DO.cho.langMs);
	const tenThat = (await docThanhBen(t.trang)).tenKy;
	if (PHA === "giu-o" && tenCu)
		await t.trang.evaluate((cu) => {
			for (const o of document.querySelectorAll(
				"[data-chon-chu-ky] span[translate='no']",
			))
				o.textContent = cu;
		}, tenCu);
	const tb = await docThanhBen(t.trang);
	return {
		nhan,
		tb,
		tenThat,
		than: kyThan(t, { tuLuc, url: t.trang.url(), ten: tt.ten }),
		oKy: kyTheoTen(n.chuKyDb, tb.tenKy),
	};
}

async function chuoiBam(n, t, dau, cacBuoc) {
	await mo(t, n.w(dau.duong), dau.cho);
	let ten = (await docThanhBen(t.trang)).tenKy;
	const ra = [];
	for (const b of cacBuoc) {
		const tuLuc = await bamMuc(n, t, b.duong);
		const doc = await docBuoc(n, t, b.nhan, b.duong, tuLuc, ten);
		ra.push({ ...doc, mong: b.mong });
		ten = doc.tenThat;
	}
	return ra;
}

export async function e13(n) {
	const t = n.may.quanTri;
	const buoc = [
		...(await chuoiBam(n, t, { duong: "/okr/lay-y-kien", cho: CHO_O_KY }, [
			{ nhan: "a", duong: "/okr/suc-khoe", mong: null },
			{ nhan: "b", duong: "/okr/lay-y-kien", mong: null },
		])),
		...(await chuoiBam(
			n,
			t,
			{
				duong: `/okr/suc-khoe?kyOkr=${n.ky.khac}`,
				cho: "[data-hang-toan-canh]",
			},
			[
				{ nhan: "c bo-okr", duong: "/okr/bo-okr", mong: n.ky.khac },
				{ nhan: "c lay-y-kien", duong: "/okr/lay-y-kien", mong: n.ky.khac },
			],
		)),
	];
	for (const b of buoc) {
		const tenO = b.tb.tenKy ?? "(vang)";
		const tenThan = b.than
			? n.tenKy(b.than.cycleId)
			: "(khong thay ky cua du lieu)";
		const lech = [];
		if (!b.oKy || !b.than || b.oKy.id !== b.than.cycleId)
			lech.push("o khac than");
		if (b.mong && b.than?.cycleId !== b.mong)
			lech.push(`than khong phai ${n.tenKy(b.mong)}`);
		const nguon = b.than ? ` [${b.than.ten} qua ${b.than.nguon}]` : "";
		bao(
			lech.length === 0,
			`DUNG AC-2 ${b.nhan}: o ${tenO} than ${tenThan}${nguon}`,
			`SAI AC-2 ${b.nhan}: o ${tenO} than ${tenThan}${nguon} — ${lech.join("; ")}`,
		);
	}
}

function loiVaoCu(ketQua) {
	const r3 = ketQua.get(3);
	if (r3) {
		const conTu = new URL(r3.url).searchParams.has("tu");
		bao(
			r3.dau.dat && !conTu,
			`DUNG AC-10 tu-nhac: ${r3.dau.chi}, url khong con tu=`,
			`SAI AC-10 tu-nhac: ${r3.dau.chi}, url ${conTu ? "con" : "khong con"} tu=`,
		);
	}
	const r7 = ketQua.get(7);
	if (r7)
		bao(
			r7.dau.dat,
			`DUNG AC-10 record: ${r7.dau.chi}`,
			`SAI AC-10 record: ${r7.dau.chi}`,
		);
}

function epKyHienHanh(n) {
	if (PHA !== "ky") return null;
	return (a) =>
		a.evaluate((el, k) => {
			const u = new URL(el.href);
			u.searchParams.set("kyOkr", k);
			el.addEventListener(
				"click",
				(e) => {
					e.preventDefault();
					e.stopImmediatePropagation();
					location.assign(u.toString());
				},
				{ capture: true, once: true },
			);
		}, n.ky.hienHanh);
}

export async function e10(n, ketQua) {
	loiVaoCu(ketQua);
	const t = n.may.quanTri;
	await mo(t, n.w("/okr"), CHO_O_KY);
	await bamMuc(n, t, "/okr/lay-y-kien", epKyHienHanh(n));
	await choThay(t.trang, "[data-slot='page-shell-description']");
	await nghi(DO.cho.langMs);
	const tbY = await docThanhBen(t.trang);
	const oY = kyTheoTen(n.chuKyDb, tbY.tenKy);
	bao(
		oY?.id === n.ky.keHoach,
		`DUNG AC-10 lay-y-kien: chu ky ${n.tenKy(n.ky.keHoach)} (lap ke hoach)`,
		`SAI AC-10 lay-y-kien: chu ky ${oY ? oY.name : (tbY.tenKy ?? "(vang)")} thay vi ${n.tenKy(n.ky.keHoach)}`,
	);
	await mo(t, n.w("/okr/suc-khoe"), CHO_O_KY);
	await nghi(DO.cho.langMs);
	const tbS = await docThanhBen(t.trang);
	const oS = kyTheoTen(n.chuKyDb, tbS.tenKy);
	bao(
		oS?.id === n.ky.hienHanh,
		`DUNG AC-10 suc-khoe: chu ky ${n.tenKy(n.ky.hienHanh)} (hien hanh)`,
		`SAI AC-10 suc-khoe: chu ky ${oS ? oS.name : (tbS.tenKy ?? "(vang)")} thay vi ${n.tenKy(n.ky.hienHanh)}`,
	);
	await vaiChiOkr(n);
}

async function vaiChiOkr(n) {
	const email = `${MA}-okr@thu.test`;
	const ck = phienCua(email);
	await datVaiOkr(email);
	const t = await trangMoi(n.trinhDuyet, ck);
	await khoMay(t);
	const hong = [];
	const muc = Object.entries(DUONG_MUC);
	for (const [ten, duong] of muc) {
		const r = await mo(t, n.w(duong), CHO_THANH_BEN);
		const p = new URL(t.trang.url()).pathname;
		const tb = await docThanhBen(t.trang);
		if (
			r.status === 404 ||
			p.includes("het-quyen") ||
			p !== n.w(duong) ||
			tb.muc.length !== DO.soMuc
		)
			hong.push(`${ten} → ${n.boSlug(p)} (${r.status}, ${tb.muc.length} muc)`);
	}
	bao(
		hong.length === 0,
		`DUNG AC-10 vai chi OKR: ${muc.length}/${muc.length} muc mo, 0 het-quyen`,
		`SAI AC-10 vai chi OKR: ${hong.join("; ")}`,
	);
}

function soApi(nhan) {
	if (nhan === "moi") return CHU_OKR.nhanHoiYMoi;
	if (nhan === null) return "0";
	return String(PHA === "so" ? nhan + 1 : nhan);
}

export async function e14(n) {
	const kyHoiY = kyMacDinhHoiY(await n.api.quanTri.hoi("okr.cycles"));
	for (const [vai, laDoiChung] of [
		["quanTri", false],
		["truong", true],
	]) {
		const apiSo = soApi(
			nhanTuHoiYNhan(await n.api[vai].hoi("okr.hoiYNhan", { cycleId: kyHoiY })),
		);
		const t = n.may[vai];
		await mo(t, n.w("/okr"), CHO_THANH_BEN);
		await nghi(DO.cho.langMs);
		const tb = await docThanhBen(t.trang);
		const muc = tb.muc.find((m) => n.boSlug(m.duong) === "/okr/lay-y-kien");
		const soThanh = muc?.so ?? "0";
		const nhan = laDoiChung
			? `so y kien doi chung (${n.maNguoi[vai]})`
			: "so y kien";
		const dat = laDoiChung
			? apiSo === "0" && muc !== undefined && muc.so === null
			: apiSo !== "0" && soThanh === apiSo;
		const ghiChu =
			!laDoiChung && apiSo === "0" ? " (bo mau khong co y kien can gop)" : "";
		bao(
			dat,
			`DUNG AC-1 ${nhan}: thanh ben ${soThanh} = API ${apiSo}`,
			`SAI AC-1 ${nhan}: thanh ben ${soThanh} != API ${apiSo}${ghiChu}`,
		);
	}
}

function chepAnh(ten) {
	if (!CHEP_ANH) return;
	mkdirSync(BANG_CHUNG_HO_SO, { recursive: true });
	copyFileSync(join(BANG_CHUNG, ten), join(BANG_CHUNG_HO_SO, ten));
}

function lechChung(tb, sang, mucMong) {
	const lech = [];
	if (sang.length !== 1 || sang[0] !== mucMong)
		lech.push(`muc sang [${sang.join(", ")}]`);
	if (tb.oKyNgoai > 0) lech.push(`${tb.oKyNgoai} o chu ky ngoai thanh ben`);
	if (tb.muc.length !== DO.soMuc) lech.push(`${tb.muc.length} muc`);
	return lech;
}

function baoMayTinh(m, tb, sang) {
	const nhomMong = [CHU_VK.nhom.okr, CHU_VK.nhom.baoCao];
	const lech = lechChung(tb, sang, m.muc);
	if (!tb.asideHien) lech.push("aside an");
	if (tb.stripHien) lech.push("hang ngang hien");
	if (!tb.oKyODau) lech.push("o chu ky khong o dau thanh");
	if (JSON.stringify(tb.nhanNhom) !== JSON.stringify(nhomMong))
		lech.push(`nhan nhom ${JSON.stringify(tb.nhanNhom)}`);
	bao(
		lech.length === 0,
		`DUNG AC-9 ${m.ten} 1280: aside hien, o chu ky o dau, nhom ${nhomMong.join(" / ")}, ${tb.muc.length} muc, sang ${sang[0]}`,
		`SAI AC-9 ${m.ten} 1280: ${lech.join("; ")}`,
	);
}

function baoDienThoai(m, tb, sang) {
	const lech = lechChung(tb, sang, m.muc);
	if (tb.asideHien) lech.push("aside hien");
	if (!tb.stripHien) lech.push("khong thay hang ngang");
	if (!tb.oKyODau) lech.push("o chu ky khong o dau hang ngang");
	if (tb.nhanNhom.length > 0) lech.push(`${tb.nhanNhom.length} nhan nhom`);
	if (
		tb.chan.length > 0 ||
		tb.muc.some((x) => x.duong.endsWith("/settings/okr"))
	)
		lech.push("co Chuong trinh OKR");
	if (tb.tran > 0) lech.push(`tran ngang ${tb.tran}px`);
	bao(
		lech.length === 0,
		`DUNG AC-9 ${m.ten} 375: aside an, hang ngang ${tb.muc.length} muc, ${tb.nhanNhom.length} nhan nhom, tran ngang ${tb.tran}`,
		`SAI AC-9 ${m.ten} 375: ${lech.join("; ")}`,
	);
}

export async function e9e12(n, { e9, e12 }) {
	const t = n.may.quanTri;
	mkdirSync(BANG_CHUNG, { recursive: true });
	const MAN = [
		{
			ten: "cua-toi",
			duong: "/okr",
			muc: "/okr",
			cho: "[data-phan='can-cap-nhat']",
		},
		{
			ten: "bo-okr",
			duong: `/okr/bo-okr?donOkr=pb:${n.donVi.id}`,
			muc: "/okr/bo-okr",
			cho: "[data-hang-cong-cu-don-vi]",
		},
		{
			ten: "suc-khoe",
			duong: "/okr/suc-khoe",
			muc: "/okr/suc-khoe",
			cho: "[data-hang-toan-canh]",
		},
	];
	for (const kho of [DO.kho.mayTinh, DO.kho.dienThoai]) {
		await t.trang.setViewport({ width: kho.rong, height: kho.cao });
		for (const m of MAN) {
			await mo(t, n.w(m.duong), m.cho);
			await nghi(DO.cho.langMs);
			const tb = await docThanhBen(t.trang);
			const anh = `${m.ten}-${kho.ten}.png`;
			await t.trang.screenshot({ path: join(BANG_CHUNG, anh) });
			chepAnh(anh);
			const sang = n.mucSang(tb);
			if (e9 && kho === DO.kho.mayTinh) baoMayTinh(m, tb, sang);
			if (e9 && kho === DO.kho.dienThoai) baoDienThoai(m, tb, sang);
			if (e12 && m.ten === "bo-okr") {
				const lop = await demLop(t.trang);
				bao(
					lop.length === 1,
					`DUNG AC-3 bo-okr ${kho.ten}: 1 lop (${lop.join(",")})`,
					`SAI AC-3 bo-okr ${kho.ten}: ${lop.length} lop (${lop.join(",")})`,
				);
			}
		}
	}
	await khoMay(t);
}
