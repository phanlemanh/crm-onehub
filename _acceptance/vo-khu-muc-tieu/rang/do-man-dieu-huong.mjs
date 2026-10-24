import { duongTrongApp } from "../../../apps/agent/agent/lib/nhac-ke-hoach.ts";
import { okrMessages } from "../../../apps/app/lib/messages/okr.ts";
import { okrToanCanhMessages } from "../../../apps/app/lib/messages/okr-toan-canh.ts";
import nextConfig from "../../../apps/app/next.config.ts";
import { match } from "../../../apps/app/node_modules/next/dist/compiled/path-to-regexp/index.js";
import { APP } from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	bao,
	choThay,
	DO,
	demLop,
	docThanhBen,
	kyTheoTen,
	mo,
	moTa,
	nghi,
	PHA,
	soLanChuyen,
} from "./do-man-lib.mjs";
import { DUONG_MUC } from "./do-man-ngu-canh.mjs";

const CHU_OKR = okrMessages("vi");
const NHAN_HOP_TUAN = okrToanCanhMessages("vi").hopTuan.cachXem;
const DUOI_PHA_REWRITE = "-x";
const CHO_THANH_BEN = "aside[data-slot='area-sidebar'] nav a[href]";
const CHO_CAP_NHAT = [
	"[data-o='gia-tri']",
	"[data-trang-thai='ST-capnhat-dagui']",
	"[data-trang-thai='ST-capnhat-daxong']",
]
	.map((c) => `[data-phan='can-cap-nhat'] ${c}`)
	.join(", ");

const demHang = (trang) =>
	trang.$$eval("[data-hang-toan-canh]", (e) => e.length);

function maTranAc4(n) {
	const tq = n.may.quanTri;
	return [
		{
			nhan: "/okr/bo-okr",
			duong: "/okr/bo-okr?donOkr=goc",
			t: tq,
			cho: "[data-the-con-bo]",
			kiem: async (t) => {
				const lop = await demLop(t.trang);
				const mt = await moTa(t.trang);
				return {
					dat: mt === CHU_OKR.moTa["theo-don-vi"] && lop.length === 1,
					dau: `tieu de trang don vi «${mt}» va ${lop.length} lop chuyen kieu xem (${lop.join(",")})`,
				};
			},
		},
		{
			nhan: "/okr/lay-y-kien",
			duong: "/okr/lay-y-kien",
			t: tq,
			cho: "[data-slot='page-shell-description']",
			kiem: async (t) => {
				const mt = await moTa(t.trang);
				return {
					dat: mt === CHU_OKR.moTa["hoi-y"],
					dau: `tieu de Hoi y «${mt}»`,
				};
			},
		},
		{
			nhan: "/okr/suc-khoe",
			duong: "/okr/suc-khoe",
			t: tq,
			cho: "[data-hang-toan-canh]",
			kiem: async (t) => {
				const so = await demHang(t.trang);
				return { dat: so > 0, dau: `bang don vi ${so} hang` };
			},
		},
		{
			nhan: "/okr/suc-khoe quan tri",
			duong: "/okr/suc-khoe",
			t: tq,
			cho: "#chuong-trinh",
			kiem: async (t) => {
				const co = (await t.trang.$("#chuong-trinh")) !== null;
				return { dat: co, dau: `#chuong-trinh ${co ? "co mat" : "vang"}` };
			},
		},
		{
			nhan: "/okr/suc-khoe truong don vi",
			duong: "/okr/suc-khoe",
			t: n.may.truong,
			cho: "[data-hang-toan-canh]",
			kiem: async (t) => {
				const so = await demHang(t.trang);
				const co = (await t.trang.$("#chuong-trinh")) !== null;
				return {
					dat: so > 0 && !co,
					dau: `bang ${so} hang, #chuong-trinh ${co ? "co mat" : "vang"}`,
				};
			},
		},
		{
			nhan: "/okr/so-do",
			duong: "/okr/so-do",
			t: tq,
			cho: "[data-man-so-do] [data-so-do-the]",
			kiem: async (t) => {
				const so = await t.trang.$$eval(
					"[data-man-so-do] [data-so-do-the]",
					(e) => e.length,
				);
				return { dat: so > 0, dau: `so do gop vao ${so} nut` };
			},
		},
		{
			nhan: "/okr/so-do/muc-tieu/<id>",
			duong: `/okr/so-do/muc-tieu/${n.mucTieu.id}`,
			t: tq,
			cho: "[data-quanh]",
			kiem: async (t) => {
				const r = await t.trang.evaluate(() => ({
					quanh: !!document.querySelector("[data-quanh]"),
					ve:
						document
							.querySelector("[data-nut='ve-ca-cong-ty']")
							?.getAttribute("href") ?? null,
				}));
				const ve = r.ve === null ? null : n.boSlug(new URL(r.ve, APP).pathname);
				return {
					dat: r.quanh && ve === "/okr/so-do",
					dau: `so do quanh muc tieu ${r.quanh ? "co" : "vang"}, nut quay lai ${ve ?? "vang"}`,
				};
			},
		},
	];
}

export async function e4(n) {
	for (const h of maTranAc4(n)) {
		const duong =
			PHA === "rewrite" && h.nhan === "/okr/bo-okr"
				? `${h.nhan}${DUOI_PHA_REWRITE}`
				: h.duong;
		const r = await mo(h.t, n.w(duong), h.cho);
		if (r.status === 404) {
			bao(false, "", `SAI AC-4 ${h.nhan}: 404 (${duong})`);
			continue;
		}
		const k = await h.kiem(h.t);
		bao(
			k.dat,
			`DUNG AC-4 ${h.nhan}: ${k.dau}`,
			`SAI AC-4 ${h.nhan}: ${k.dau}${r.thay ? "" : " (het gio cho dau hieu)"}`,
		);
	}
}

function soTruyVan(url, mong) {
	const u = new URL(url);
	const lech = [];
	const khoa = new Set([
		...u.searchParams.keys(),
		...Object.keys(mong.truyVan),
	]);
	for (const k of khoa) {
		const that = u.searchParams.get(k);
		const can = mong.truyVan[k] ?? null;
		if (that !== can)
			lech.push(`${k}=${that ?? "(vang)"} thay vi ${can ?? "(vang)"}`);
	}
	if (u.hash !== (mong.neo ?? ""))
		lech.push(`neo ${u.hash || "(vang)"} thay vi ${mong.neo || "(vang)"}`);
	return lech;
}

async function dauHopTuan(n, t) {
	const r = await t.trang.evaluate(() => {
		const hang = document.querySelector("[data-hang-cong-cu-don-vi]");
		return {
			bat: [
				...document.querySelectorAll("[data-the-con-bo] [aria-current='page']"),
			].map((e) => e.textContent.trim()),
			chu: hang?.innerText ?? "",
		};
	});
	const coDon = r.chu.includes(n.donVi.name);
	return {
		dat: r.bat.length === 1 && r.bat[0] === NHAN_HOP_TUAN && coDon,
		chi: `xem «${r.bat.join("|")}», don vi ${coDon ? "" : "thieu "}«${n.donVi.name}»`,
	};
}

async function dauLayYKien(n, t) {
	const mt = await moTa(t.trang);
	const tb = await docThanhBen(t.trang);
	const okTen = kyTheoTen(n.chuKyDb, tb.tenKy)?.id === n.ky.keHoach;
	return {
		dat: mt === CHU_OKR.moTa["hoi-y"] && okTen,
		chi: `tieu de Hoi y ${mt === CHU_OKR.moTa["hoi-y"] ? "co" : `«${mt}»`}, o chu ky «${tb.tenKy}»`,
	};
}

async function dauCapNhat(t) {
	const r = await t.trang.evaluate((chon) => {
		const s = document.querySelector("[data-phan='can-cap-nhat']");
		return {
			nut: !!s?.querySelector("[data-nut='cap-nhat-tai-cho']"),
			bang: !!document.querySelector(chon),
		};
	}, CHO_CAP_NHAT);
	const mo_ = r.bang && !r.nut;
	return { dat: mo_, chi: `hop thoai cap nhat tuan ${mo_ ? "mo" : "dong"}` };
}

async function dauChuongTrinh(t) {
	await nghi(DO.cho.cuonMs);
	const r = await t.trang.evaluate(() => {
		const el = document.getElementById("chuong-trinh");
		if (!el) return null;
		return {
			tren: Math.round(el.getBoundingClientRect().top),
			cao: window.innerHeight,
		};
	});
	return {
		dat: r !== null && r.tren >= 0 && r.tren < r.cao,
		chi:
			r === null
				? "#chuong-trinh vang"
				: `#chuong-trinh o ${r.tren}px (khung nhin ${r.cao}px)`,
	};
}

function maTranAc6(n) {
	const tq = n.may.quanTri;
	const pb = `pb:${n.donVi.id}`;
	const { ky, mucTieu, cuocSoan, capNhat } = n;
	return [
		{
			so: 1,
			t: tq,
			cu: duongTrongApp({
				loai: "okr-tom-tat",
				departmentId: n.donVi.id,
				cycleId: ky.hienHanh,
			}),
			dich: {
				duong: "/okr/bo-okr",
				truyVan: { xemOkr: "hop-tuan", donOkr: pb, kyOkr: ky.hienHanh },
			},
			muc: "/okr/bo-okr",
			cho: "[data-the-con-bo] [aria-current='page']",
			dau: (t) => dauHopTuan(n, t),
		},
		{
			so: 2,
			t: tq,
			cu: duongTrongApp({
				loai: "okr-hoi-y-gop",
				hoiYId: "hoi-y",
				cycleId: ky.keHoach,
				nhan: "",
				hanLuc: new Date().toISOString(),
			}),
			dich: { duong: "/okr/lay-y-kien", truyVan: { kyOkr: ky.keHoach } },
			muc: "/okr/lay-y-kien",
			cho: "aside[data-slot='area-sidebar'] [data-chon-chu-ky]",
			dau: (t) => dauLayYKien(n, t),
		},
		{
			so: 3,
			t: n.may.capNhat,
			cu: duongTrongApp({
				loai: "okr-cap-nhat",
				krIds: capNhat.capNhat.items.map((i) => i.keyResultId),
				nhan: "",
				soKr: capNhat.capNhat.items.length,
			}),
			dich: { duong: "/okr", truyVan: {} },
			muc: "/okr",
			cho: CHO_CAP_NHAT,
			choUrl: () => !new URLSearchParams(location.search).has("tu"),
			dau: dauCapNhat,
		},
		{
			so: 4,
			t: tq,
			cu: `/okr/toan-canh?kyOkr=${ky.hienHanh}`,
			dich: { duong: "/okr/suc-khoe", truyVan: { kyOkr: ky.hienHanh } },
			muc: "/okr/suc-khoe",
			cho: "[data-hang-toan-canh]",
			dau: async (t) => {
				const so = await demHang(t.trang);
				return { dat: so > 0, chi: `bang don vi ${so} hang` };
			},
		},
		{
			so: 5,
			t: tq,
			cu: `/okr/toan-canh/suc-khoe?kyOkr=${ky.hienHanh}`,
			dich: {
				duong: "/okr/suc-khoe",
				truyVan: { kyOkr: ky.hienHanh },
				neo: "#chuong-trinh",
			},
			muc: "/okr/suc-khoe",
			cho: "#chuong-trinh",
			dau: dauChuongTrinh,
		},
		{
			so: 6,
			t: tq,
			cu: `/okr/quanh-muc-tieu/${mucTieu.id}`,
			dich: { duong: `/okr/so-do/muc-tieu/${mucTieu.id}`, truyVan: {} },
			muc: "/okr/so-do",
			cho: "[data-quanh]",
			dau: async (t) => {
				const chu = await t.trang.evaluate(
					() => document.querySelector("[data-quanh]")?.innerText ?? "",
				);
				const co = chu.includes(mucTieu.title);
				return {
					dat: co,
					chi: `so do quanh muc tieu ${co ? "" : "thieu "}«${mucTieu.title}»`,
				};
			},
		},
		{
			so: 7,
			t: tq,
			cu: `/okr?record=objective:${mucTieu.id}`,
			dich: { duong: "/okr", truyVan: { record: `objective:${mucTieu.id}` } },
			muc: "/okr",
			cho: `[data-okr-sheet="${mucTieu.id}"] [role='tab']`,
			dau: async (t) => {
				const co = await choThay(
					t.trang,
					`[data-okr-sheet="${mucTieu.id}"] [role='tab']`,
					DO.cho.langMs,
				);
				return {
					dat: co,
					chi: `ngan muc tieu ${mucTieu.id} ${co ? "mo" : "dong"}`,
				};
			},
		},
		{
			so: 8,
			t: n.may.truong,
			cu: `/okr/soan/${cuocSoan.id}`,
			dich: {
				duong: "/okr/bo-okr",
				truyVan: {
					kyOkr: ky.keHoach,
					donOkr: pb,
					record: `soan:${cuocSoan.id}`,
				},
			},
			muc: "/okr/bo-okr",
			cho: "[data-trang-soan]",
			choDuong: "/okr/bo-okr",
			dau: async (t) => {
				const co = await choThay(t.trang, "[data-trang-soan]", DO.cho.langMs);
				return { dat: co, chi: `ngan soan ${co ? "mo" : "dong"}` };
			},
		},
	];
}

async function choDich(n, h) {
	if (h.choDuong)
		await h.t.trang
			.waitForFunction(
				(d) => location.pathname === d,
				{ timeout: DO.cho.dauHieuMs },
				n.w(h.choDuong),
			)
			.then(() => choThay(h.t.trang, h.cho))
			.catch(() => {});
	if (h.choUrl)
		await h.t.trang
			.waitForFunction(h.choUrl, { timeout: DO.cho.xoaThamSoMs })
			.catch(() => {});
	await nghi(DO.cho.hydrateMs);
}

async function motDong(n, h) {
	const r = await mo(h.t, n.w(h.cu), h.choDuong ? null : h.cho);
	await choDich(n, h);
	const url = h.t.trang.url();
	const u = new URL(url);
	const dichThat = `${n.boSlug(u.pathname)}${u.search}${u.hash}`;
	const lan = soLanChuyen(h.t, r) + (PHA === "chuoi" ? 1 : 0);
	const lech = [];
	if (r.status === 404) lech.push("404");
	if (n.boSlug(u.pathname) !== h.dich.duong)
		lech.push(`duong ${n.boSlug(u.pathname)} thay vi ${h.dich.duong}`);
	lech.push(...soTruyVan(url, h.dich));
	if (lan > DO.toiDaChuyen) lech.push(`${lan} lan chuyen > ${DO.toiDaChuyen}`);
	const sang = n.mucSang(await docThanhBen(h.t.trang));
	if (sang.length !== 1 || sang[0] !== h.muc)
		lech.push(`muc sang [${sang.join(", ")}] thay vi ${h.muc}`);
	const d = r.status === 404 ? { dat: false, chi: "404" } : await h.dau(h.t);
	if (!d.dat) lech.push(d.chi);
	bao(
		lech.length === 0,
		`DUNG AC-6 ${h.so}: ${dichThat} (${lan} lan chuyen) — ${d.chi}`,
		`SAI AC-6 ${h.so}: dich ${dichThat} (${lan} lan chuyen) — ${lech.join("; ")}`,
	);
	return { url, dau: d };
}

export async function e6(n) {
	const ketQua = new Map();
	for (const h of maTranAc6(n)) ketQua.set(h.so, await motDong(n, h));
	await lienKetQuaChuyenHuong(n);
	return ketQua;
}

async function lienKetQuaChuyenHuong(n) {
	const chuyen = await nextConfig.redirects();
	const khop = chuyen.map((c) =>
		match(c.source, { strict: true, sensitive: false, delimiter: "/" }),
	);
	const tq = n.may.quanTri;
	const goc = new URL(APP).origin;
	const gom = new Set();
	for (const [ten, duong] of Object.entries(DUONG_MUC)) {
		await mo(tq, n.w(duong), CHO_THANH_BEN);
		if (PHA === "lien-ket" && ten === "cua-toi")
			await tq.trang.evaluate((h) => {
				const a = document.createElement("a");
				a.setAttribute("href", h);
				a.textContent = "pha-thu";
				document
					.querySelector("aside[data-slot='area-sidebar'] nav")
					?.append(a);
			}, n.w("/okr/hoi-y"));
		const ds = await tq.trang.evaluate(
			(g) =>
				[...document.querySelectorAll("a[href]")]
					.map((a) => new URL(a.getAttribute("href"), location.href))
					.filter((u) => u.origin === g)
					.map((u) => u.pathname),
			goc,
		);
		for (const d of ds) gom.add(d);
	}
	const qua = [...gom].filter((d) => khop.some((k) => k(d) !== false));
	bao(
		gom.size > 0 && qua.length === 0,
		`DUNG AC-7 man: ${gom.size} lien ket, 0 qua chuyen huong`,
		`SAI AC-7 man: ${qua.length} lien ket qua chuyen huong (${qua.join(", ")}) tren ${gom.size} lien ket`,
	);
}
