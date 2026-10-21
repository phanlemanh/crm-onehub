import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { OKR_MAU } from "../../../apps/api/scripts/okr-mau/cau-hinh.ts";
import { kyTrongOChon } from "../../../apps/app/app/(app)/[slug]/okr/okr-search-params.ts";
import { SEARCH_PARAM } from "../../../apps/app/lib/search-param-keys.ts";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	APP,
	CHROME,
	datTrinhDuyet,
	ket,
	khongDo,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	GOC,
	phienCua,
	trpcCua,
} from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";
import { chayChieuDo } from "./man-bo-okr-chieu-do.mjs";

const HO_SO = "trang-bo-okr";
const DA_THONG_CONG = new Set(["signed-off", "machine-cleared"]);
const trangThaiHopDong = (
	readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8").match(
		/^status:\s*(\S+)/m,
	)?.[1] ?? ""
).trim();
const BANG_CHUNG =
	process.env.BANG_CHUNG ??
	(DA_THONG_CONG.has(trangThaiHopDong)
		? join(GOC, ".acceptance-runs", HO_SO, "evidence")
		: join(GOC, "_acceptance", HO_SO, "evidence"));

const GIAY_MS = 1000;
const NGAY_MS = 24 * 60 * 60 * GIAY_MS;
const DO = {
	kho: {
		rong: { ten: "1440", rong: 1440, cao: 900 },
		hep: { ten: "375", rong: 375, cao: 812 },
	},
	cho: {
		taiMs: 60 * GIAY_MS,
		dieuHuongMs: 30 * GIAY_MS,
		urlMs: 5 * GIAY_MS,
		onDinhMs: 1500,
		nhipMs: 250,
		cuonMs: 300,
	},
	cuon: { soLan: 12, lePx: 40 },
	lechPx: 1,
	hanSauNgay: 14,
	toiDaLech: 6,
};
const AN_CONG_CU_DEV =
	".tsqd-parent-container, .tsqd-open-btn-container, nextjs-portal { display: none !important; }";
const MOI_EVAL = ["E2", "E4", "E5", "E7", "E9", "E10", "E12", "E14"];
const THAM = {
	ky: SEARCH_PARAM.okr.ky,
	don: SEARCH_PARAM.okr.don,
	xem: SEARCH_PARAM.okr.xem,
	loc: SEARCH_PARAM.okr.phamViBo,
};
const PHAM_VI = ["tat-ca", "toi-dan", "theo-doi"];
const TIEN_THE = ["hop-tuan", "viec", "cay", "danh-sach"];
const SO_LUI = 3;
const MOC_THE = {
	"danh-sach": ["ST-donvi-danhsach", "ST-donvi-rong", "ST-donvi-loc-khongkhop"],
	"hop-tuan": [
		"ST-hoptuan-tuandau",
		"ST-hoptuan-yenang",
		"ST-hoptuan-codulieu",
	],
	viec: ["ST-bo-viec", "ST-bo-viec-rong"],
	cay: ["ST-donvi-caycanchinh", "ST-donvi-rong"],
};
const CHU = {
	viTri: "Bộ OKR",
	tieuDeKhu: "Mục tiêu",
	tenLocToiDan: "Tôi dẫn",
	nutVe: "Về Tất cả",
	trong: "—",
};
const COT = { bo: 0, truong: 1, mucTieu: 2, tienDo: 3, tuTin: 4, so: 5 };
const KHOA_CAP = { onehub: "goc", "bo-phan": "bp", "phong-ban": "pb" };
const LOC_TRONG = {
	phuTrach: [],
	loai: [],
	trangThai: [],
	tuTin: [],
	gopY: [],
};
const TIEN_TO_VIEC = "Đo tbo ·";
const VIEC_GIEO = [
	{
		ten: "goi-lai",
		tieuDe: `${TIEN_TO_VIEC} gọi lại đối tác kho lạnh`,
		kr: 0,
		coHan: true,
		xong: false,
	},
	{
		ten: "chot-gia",
		tieuDe: `${TIEN_TO_VIEC} chốt bảng giá tuyến Bắc`,
		kr: 0,
		coHan: false,
		xong: true,
	},
	{
		ten: "hen-gap",
		tieuDe: `${TIEN_TO_VIEC} hẹn gặp chuỗi bán lẻ`,
		kr: 1,
		coHan: false,
		xong: false,
	},
];

const iChieu = process.argv.indexOf("--chieu-do");
if (iChieu >= 0) {
	const ma = await chayChieuDo(process.argv[iChieu + 1]);
	process.exit(ma);
}

const CHON_EVAL = new Set(
	(process.env.EVAL ?? "")
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);
const laMa = [...CHON_EVAL].filter((e) => !MOI_EVAL.includes(e));
if (laMa.length > 0) {
	console.log(
		`KHONG DO DUOC: EVAL ${laMa.join(", ")} khong thuoc thuoc nay (nhan ${MOI_EVAL.join(", ")})`,
	);
	process.exit(2);
}
const chay = (...e) => CHON_EVAL.size === 0 || e.some((x) => CHON_EVAL.has(x));

let dung = 0;
let sai = 0;
function dong(dat, chu) {
	if (dat) dung += 1;
	else sai += 1;
	console.log(dat ? chu : `SAI ${chu}`);
}
const kd = (ac, dat, chu) => dong(dat, `${dat ? "" : `${ac}: `}${chu}`);

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

const nghi = (ms) => new Promise((xong) => setTimeout(xong, ms));
const thuMau = (ma) => `${ma}@${OKR_MAU.mienThu}`;
const tapBang = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
const tapChu = (s) => [...s].sort().join(",") || "-";
const donTuKhoa = (k) => {
	if (k === "goc") return { loai: "goc" };
	const [loai, id] = k.split(":");
	return { loai, id };
};
const khoaCuaMucTieu = (o) => {
	const cap = KHOA_CAP[o.level];
	if (cap === "goc") return "goc";
	if (cap === "bp") return `bp:${o.divisionId}`;
	if (cap === "pb") return `pb:${o.departmentId}`;
	return `nguoi:${o.personUserId}`;
};
const ngaySau = (soNgay) =>
	new Date(Date.now() + soNgay * NGAY_MS).toISOString().slice(0, 10);

function napBoMau() {
	const nap = spawnSync("bun", ["scripts/okr-mau.ts"], {
		cwd: join(GOC, "apps", "api"),
		env: process.env,
		encoding: "utf8",
	});
	const cuoi = `${nap.stdout ?? ""}${nap.stderr ?? ""}`
		.trim()
		.split("\n")
		.at(-1);
	console.log(`nap bo OKR mau: ma ${nap.status} — ${cuoi}`);
	return nap.status === 0;
}

function donViCuaCay(cay) {
	const pb = (p) => ({
		don: `pb:${p.id}`,
		ten: p.name,
		truong: p.head?.name ?? null,
		truongId: p.head?.id ?? null,
	});
	return [
		{ don: "goc", ten: null, truong: null, truongId: null },
		...cay.divisions.flatMap((b) => [
			{
				don: `bp:${b.id}`,
				ten: b.name,
				truong: b.head?.name ?? null,
				truongId: b.head?.id ?? null,
			},
			...b.departments.map(pb),
		]),
		...cay.chuaXep.map(pb),
	];
}

function chonMau() {
	const congTy = JSON.parse(
		readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
	);
	const pbMau = congTy.phongBan[0];
	const dan = new Set([
		...congTy.boPhan.map((b) => b.truong),
		...congTy.phongBan.map((p) => p.truong),
	]);
	const thanhVien = congTy.nguoi.find(
		(n) => n.vai === "member" && n.phongBan === pbMau.ma && !dan.has(n.ma),
	);
	const bpTheoDoi = congTy.boPhan.find((b) => b.ma !== pbMau.boPhan);
	return { pbMau, truong: pbMau.truong, thanhVien: thanhVien?.ma, bpTheoDoi };
}

async function chonKy(api, pbId) {
	const chuKy = await api.hoi("okr.cycles");
	const cur = chuKy.currentId;
	const khac = kyTrongOChon(chuKy.cycles).filter((c) => c.id !== cur);
	const soMt = await Promise.all(
		khac.map((c) =>
			db.okrObjective.count({
				where: { cycleId: c.id, departmentId: pbId, status: "cong-bo" },
			}),
		),
	);
	const kyKhac = khac.find((_, i) => soMt[i] > 0)?.id ?? khac[0]?.id ?? null;
	if (!cur || !kyKhac)
		await khongDo(
			`KHONG DO DUOC: bo mau thieu chu ky (hien tai ${cur}, khac ${kyKhac})`,
		);
	return { cur, khac: kyKhac };
}

async function gieoTheoDoi(api, ky, bp) {
	const mt = await db.okrObjective.findFirst({
		where: {
			cycleId: ky,
			divisionId: bp.id,
			level: "bo-phan",
			status: "cong-bo",
		},
		orderBy: { position: "asc" },
		select: { id: true },
	});
	if (!mt)
		await khongDo(
			`KHONG DO DUOC: bo phan ${bp.name} khong co muc tieu cong bo trong ${ky}`,
		);
	await api.lam("okr.follow", { objectiveId: mt.id, on: true });
	return mt.id;
}

async function gieoViec(api, ky, pb, nguoiLam) {
	const krs = await db.okrKeyResult.findMany({
		where: {
			objective: { cycleId: ky, departmentId: pb.id, status: "cong-bo" },
		},
		orderBy: [{ objective: { position: "asc" } }, { position: "asc" }],
		take: 2,
		select: { id: true, title: true },
	});
	if (krs.length < 2)
		await khongDo(
			`KHONG DO DUOC: ${pb.name} chi co ${krs.length} KR trong ${ky}`,
		);
	const ra = [];
	for (const v of VIEC_GIEO) {
		const tao = await api.lam("okr.themViec", {
			keyResultId: krs[v.kr].id,
			tieuDe: v.tieuDe,
			nguoiLamUserId: nguoiLam,
			hanNgay: v.coHan ? ngaySau(DO.hanSauNgay) : null,
		});
		if (v.xong) await api.lam("okr.danhDauViec", { id: tao.id, xong: true });
		ra.push({ ...v, id: tao.id, krId: krs[v.kr].id });
	}
	return ra;
}

async function timBoRong(api, ky, hang) {
	const coMucTieuTruoc = [...hang].sort(
		(a, b) => Number(b.soMucTieu > 0) - Number(a.soMucTieu > 0),
	);
	for (const h of coMucTieuTruoc) {
		const r = await api.hoi("okr.viecCuaBo", {
			cycleId: ky,
			unit: donTuKhoa(h.don),
		});
		if (r.nhom.length === 0) return h;
	}
	return khongDo(
		"KHONG DO DUOC: moi bo trong bo mau deu co viec — khong co ca rong",
	);
}

async function theoDoiTrongDb(userId, ky) {
	const f = await db.okrFollow.findMany({
		where: { userId, objective: { cycleId: ky } },
		select: {
			objective: {
				select: {
					level: true,
					divisionId: true,
					departmentId: true,
					personUserId: true,
				},
			},
		},
	});
	return new Set(
		f
			.map((x) => khoaCuaMucTieu(x.objective))
			.filter((k) => !k.startsWith("nguoi:")),
	);
}

async function dungDuLieu() {
	await db.okrViecKr.deleteMany({
		where: { tieuDe: { startsWith: TIEN_TO_VIEC } },
	});
	if (!napBoMau()) await khongDo("KHONG DO DUOC: nap bo OKR mau that bai");
	const mau = chonMau();
	if (!mau.thanhVien || !mau.bpTheoDoi)
		await khongDo(
			"KHONG DO DUOC: bo mau thieu thanh vien khong dan hay bo phan khac",
		);
	const ck = {
		truong: phienCua(thuMau(mau.truong)),
		thanhVien: phienCua(thuMau(mau.thanhVien)),
	};
	const api = { truong: trpcCua(ck.truong), thanhVien: trpcCua(ck.thanhVien) };
	const [nguoiXem, nguoiLam] = await Promise.all(
		[mau.truong, mau.thanhVien].map((m) =>
			db.user.findUniqueOrThrow({
				where: { email: thuMau(m) },
				select: { id: true },
			}),
		),
	);
	const cay = await api.truong.hoi("org.tree");
	const pb = cay.divisions
		.flatMap((b) => b.departments)
		.find((p) => p.name === mau.pbMau.ten);
	const bp = cay.divisions.find((b) => b.name === mau.bpTheoDoi.ten);
	if (!pb || !bp || pb.head?.id !== nguoiXem.id)
		await khongDo(
			`KHONG DO DUOC: cay khong co ${mau.pbMau.ten} do ${mau.truong} dan, hay ${mau.bpTheoDoi.ten}`,
		);
	const ky = await chonKy(api.truong, pb.id);
	await gieoTheoDoi(api.truong, ky.cur, bp);
	const viec = await gieoViec(api.truong, ky.cur, pb, nguoiLam.id);
	const [ds, dsTv, dem, tc, theoDoi] = await Promise.all([
		api.truong.hoi("okr.danhSachBo", { cycleId: ky.cur }),
		api.thanhVien.hoi("okr.danhSachBo", { cycleId: ky.cur }),
		api.truong.hoi("okr.countByUnit", { cycleId: ky.cur }),
		api.truong.hoi("okr.toanCanh", { cycleId: ky.cur }),
		theoDoiTrongDb(nguoiXem.id, ky.cur),
	]);
	if (dsTv.hang.some((h) => h.toiDan))
		await khongDo(
			`KHONG DO DUOC: ${mau.thanhVien} van dan mot bo — khong co ca Toi dan rong`,
		);
	if (!theoDoi.has(`bp:${bp.id}`))
		await khongDo(`KHONG DO DUOC: theo doi ${bp.name} khong ghi vao DB`);
	const rong = await timBoRong(api.truong, ky.cur, ds.hang);
	const slug = await suySlug(ck.truong);
	console.log(
		`du lieu: nguoi xem ${mau.truong} (truong ${pb.name}) · thanh vien ${mau.thanhVien} · ky ${ky.cur} · ky khac ${ky.khac} · theo doi ${bp.name} · ${viec.length} viec gieo · bo rong ${rong.ten}`,
	);
	return {
		ck,
		api,
		slug,
		ky,
		cay,
		pb,
		bp,
		viec,
		ds,
		dsTv,
		dem,
		tc,
		theoDoi,
		rong,
		nguoiXem: nguoiXem.id,
		tenGoc: ds.hang.find((h) => h.don === "goc")?.ten ?? null,
	};
}

const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
datTrinhDuyet(trinhDuyet);

async function moTrang(cookie, duong, kho, toi = false) {
	const ctx = await trinhDuyet.createBrowserContext();
	const t = await ctx.newPage();
	const host = new URL(APP).hostname;
	await t.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	await t.setViewport({ width: kho.rong, height: kho.cao });
	await t.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: toi ? "dark" : "light" },
	]);
	await t.evaluateOnNewDocument((css) => {
		document.addEventListener("DOMContentLoaded", () => {
			const s = document.createElement("style");
			s.textContent = css;
			document.head.appendChild(s);
		});
	}, AN_CONG_CU_DEV);
	await t.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: DO.cho.taiMs,
	});
	const dich = new URL(t.url()).pathname;
	if (dich.startsWith("/sign-in") || dich.includes("/onboarding"))
		await khongDo(`KHONG DO DUOC: ${duong} bi day ve ${dich}`);
	await t.bringToFront();
	if (toi)
		await t.evaluate(() => {
			document.documentElement.classList.add("dark");
			document.documentElement.style.colorScheme = "dark";
		});
	return t;
}

const dongTrang = (t) => t.browserContext().close();

async function cho(t, chon, ms = DO.cho.taiMs) {
	const thay = await t
		.waitForFunction(
			(c) =>
				[...document.querySelectorAll(c)].some(
					(el) =>
						el.getClientRects().length > 0 &&
						getComputedStyle(el).visibility !== "hidden" &&
						Object.keys(el).some((k) => k.startsWith("__reactFiber")),
				),
			{ timeout: ms, polling: DO.cho.nhipMs },
			chon,
		)
		.then(() => true)
		.catch(() => false);
	await nghi(DO.cho.onDinhMs);
	return thay;
}

async function bam(t, chon) {
	for (let i = 0; i < DO.cuon.soLan; i += 1) {
		const r = await t.evaluate((c) => {
			const el = [...document.querySelectorAll(c)].find(
				(e) =>
					e.getClientRects().length > 0 &&
					getComputedStyle(e).visibility !== "hidden",
			);
			if (!el) return null;
			const b = el.getBoundingClientRect();
			return {
				x: b.left + b.width / 2,
				y: b.top + b.height / 2,
				tren: b.top,
				duoi: b.bottom,
				cao: window.innerHeight,
			};
		}, chon);
		if (r === null) return false;
		if (r.tren >= 0 && r.duoi <= r.cao) {
			await t.mouse.click(r.x, r.y);
			return true;
		}
		await t.mouse.move(r.x, r.cao / 2);
		await t.mouse.wheel({
			deltaY:
				r.tren < 0 ? r.tren - DO.cuon.lePx : r.duoi - r.cao + DO.cuon.lePx,
		});
		await nghi(DO.cho.cuonMs);
	}
	return false;
}

const thamSo = (t) => new URL(t.url()).searchParams;

const DOC_DANH_SACH = () => {
	const hien = (el) =>
		!!el &&
		el.getClientRects().length > 0 &&
		getComputedStyle(el).visibility !== "hidden";
	const vt = document.querySelector("[data-vi-tri-bo]");
	const bang = document.querySelector("[data-bang-bo]");
	const rong = document.querySelector("[data-bo-rong-loc]");
	const nut = document.querySelector("[data-ve-tat-ca]");
	return {
		coDanhSach: hien(document.querySelector("[data-danh-sach-bo]")),
		viTri: vt?.getAttribute("data-vi-tri-bo") ?? null,
		viTriChu: vt
			? [
					...vt.querySelectorAll(
						"[data-slot='breadcrumb-link'],[data-slot='breadcrumb-page']",
					),
				]
					.map((e) => e.textContent.trim())
					.join(" › ")
			: null,
		tieuDe:
			document
				.querySelector("[data-slot='page-shell-title']")
				?.textContent.trim() ?? null,
		cot: hien(bang)
			? [...bang.querySelectorAll("thead th")].map((e) => e.textContent.trim())
			: [],
		hang: hien(bang)
			? [...bang.querySelectorAll("tr[data-bo]")].filter(hien).map((tr) => ({
					don: tr.getAttribute("data-bo"),
					o: [...tr.querySelectorAll("td")].map((td) => td.innerText.trim()),
				}))
			: [],
		loc: [...document.querySelectorAll("[data-loc-bo] [data-pham-vi]")].map(
			(b) => ({
				muc: b.getAttribute("data-pham-vi"),
				bat: b.getAttribute("data-state") === "on",
				dem:
					b
						.querySelector("[data-slot='toggle-group-item-count']")
						?.textContent.trim() ?? null,
			}),
		),
		rong: hien(rong) ? rong.innerText.replace(/\s+/g, " ").trim() : null,
		nutVe: hien(nut) ? nut.textContent.trim() : null,
	};
};

const DOC_MOT_BO = () => {
	const hien = (el) =>
		!!el &&
		el.getClientRects().length > 0 &&
		getComputedStyle(el).visibility !== "hidden";
	const vt = document.querySelector("[data-vi-tri-bo='mot-bo']");
	return {
		viTriTen:
			vt?.querySelector("[data-slot='breadcrumb-page']")?.textContent.trim() ??
			null,
		veHref: vt?.querySelector("[data-ve-bo-okr]")?.getAttribute("href") ?? null,
		the:
			document
				.querySelector("[data-the-con-bo] a[aria-current='page']")
				?.getAttribute("data-the") ?? null,
		soThe: [
			...document.querySelectorAll("[data-the-con-bo] a[data-the]"),
		].filter(hien).length,
		moc: [...document.querySelectorAll("[data-trang-thai]")]
			.filter(hien)
			.map((e) => e.getAttribute("data-trang-thai")),
		mucTieu: [
			...new Set(
				[
					...document.querySelectorAll(
						"[data-trang-thai='ST-donvi-danhsach'] [data-hang-muc-tieu]",
					),
				]
					.filter((e) => hien(e) && !e.hasAttribute("data-da-bo"))
					.map((e) => e.getAttribute("data-hang-muc-tieu")),
			),
		],
	};
};

async function e2(n) {
	const t = await moTrang(n.ck.truong, `/${n.slug}/okr/bo-okr`, DO.kho.rong);
	await cho(t, "[data-danh-sach-bo] tr[data-bo], [data-the-con-bo]");
	const d = await t.evaluate(DOC_DANH_SACH);
	await dongTrang(t);
	const cay = donViCuaCay(n.cay);
	const mong = new Set(cay.map((c) => c.don));
	const thay = new Set(d.hang.map((h) => h.don));
	const tenLech = d.hang.filter((h) => {
		const c = cay.find((x) => x.don === h.don);
		return c?.ten && h.o[COT.bo] !== c.ten;
	});
	const dat =
		d.coDanhSach &&
		d.viTri === "danh-sach" &&
		d.viTriChu === CHU.viTri &&
		d.tieuDe === CHU.tieuDeKhu &&
		d.cot.length === COT.so &&
		d.hang.length === mong.size &&
		tapBang(thay, mong) &&
		tenLech.length === 0;
	kd(
		"AC-1",
		dat,
		`DANH SACH: tieu de ${d.viTriChu === CHU.viTri && d.coDanhSach ? "Bo OKR" : `«${d.viTriChu ?? "-"}» (${d.viTri ?? "khong co"})`} · trang «${d.tieuDe ?? "-"}» · ${d.cot.length} cot · ${d.hang.length} hang = ${mong.size} don vi cua cay${tapBang(thay, mong) ? "" : ` · thieu ${tapChu(new Set([...mong].filter((k) => !thay.has(k))))} · thua ${tapChu(new Set([...thay].filter((k) => !mong.has(k))))}`}${tenLech.length ? ` · ten lech ${tenLech.map((h) => h.don).join(",")}` : ""}`,
	);
	const tcTheo = new Map(n.tc.hang.map((h) => [h.key, h]));
	const lech = [];
	for (const h of d.hang) {
		const tc = tcTheo.get(h.don);
		const c = cay.find((x) => x.don === h.don);
		const mongO = {
			mucTieu: String(n.dem[h.don] ?? 0),
			tienDo: tc?.tienDo == null ? CHU.trong : `${tc.tienDo}%`,
			tuTin: String(tc?.tuTin.thap ?? 0),
			truong: c?.truong ?? CHU.trong,
		};
		for (const [k, v] of Object.entries(mongO))
			if (h.o[COT[k]] !== v) lech.push(`${h.don} ${k} ${h.o[COT[k]]}≠${v}`);
	}
	kd(
		"AC-1",
		d.hang.length > 0 && lech.length === 0,
		`DANH SACH SO: ${d.hang.length} hang · muc tieu = countByUnit · tien do = toanCanh · tu tin thap = toanCanh · truong = org.tree${lech.length ? ` · lech ${lech.slice(0, DO.toiDaLech).join("; ")}` : ""}`,
	);
}

function kyVongLoc(n, muc) {
	const cay = donViCuaCay(n.cay);
	if (muc === "toi-dan")
		return new Set(
			cay
				.filter((c) => c.don !== "goc" && c.truongId === n.nguoiXem)
				.map((c) => c.don),
		);
	if (muc === "theo-doi") return new Set(n.theoDoi);
	return new Set(cay.map((c) => c.don));
}

async function choUrlLoc(t, muc) {
	await t
		.waitForFunction(
			(k, m) => {
				const u = new URL(location.href).searchParams.get(k);
				return m === "tat-ca" ? u === null : u === m;
			},
			{ timeout: DO.cho.urlMs, polling: DO.cho.nhipMs },
			THAM.loc,
			muc,
		)
		.catch(() => {});
	await nghi(DO.cho.onDinhMs);
}

const giuLoc = (d, muc, mong) =>
	d.loc.find((l) => l.muc === muc)?.bat === true &&
	tapBang(new Set(d.hang.map((h) => h.don)), mong);

async function moLaiGiu(n, t, muc, mong) {
	await t.reload({ waitUntil: "domcontentloaded", timeout: DO.cho.taiMs });
	await cho(t, "[data-danh-sach-bo]");
	const lai = await t.evaluate(DOC_DANH_SACH);
	const u = new URL(t.url());
	const t2 = await moTrang(
		n.ck.truong,
		`${u.pathname}${u.search}`,
		DO.kho.rong,
	);
	await cho(t2, "[data-danh-sach-bo]");
	const moi = await t2.evaluate(DOC_DANH_SACH);
	await dongTrang(t2);
	return { taiLai: giuLoc(lai, muc, mong), trangMoi: giuLoc(moi, muc, mong) };
}

async function e4(n) {
	const t = await moTrang(n.ck.truong, `/${n.slug}/okr/bo-okr`, DO.kho.rong);
	await cho(t, "[data-danh-sach-bo]");
	for (const muc of PHAM_VI) {
		const mong = kyVongLoc(n, muc);
		const bamDuoc = await bam(t, `[data-loc-bo] [data-pham-vi='${muc}']`);
		await choUrlLoc(t, muc);
		const d = await t.evaluate(DOC_DANH_SACH);
		const q = thamSo(t).get(THAM.loc);
		const tap = new Set(d.hang.map((h) => h.don));
		const dem = d.loc.find((l) => l.muc === muc)?.dem ?? null;
		const urlDung = muc === "tat-ca" ? q === null : q === muc;
		const bamDung =
			bamDuoc && urlDung && giuLoc(d, muc, mong) && dem === String(tap.size);
		const g = await moLaiGiu(n, t, muc, mong);
		const giu = g.taiLai && g.trangMoi;
		kd(
			"AC-2",
			bamDung && giu,
			`LOC ${muc}: ${giu ? "" : `tai lai mat (tai lai ${g.taiLai ? "giu" : "mat"}, trang moi ${g.trangMoi ? "giu" : "mat"}) · `}url ${q ?? "-"} · ${tap.size} hang (mong ${mong.size}: ${tapBang(tap, mong) ? "khop" : `lech ${tapChu(tap)} / ${tapChu(mong)}`}) · dem ${dem ?? "-"}${giu ? " · tai lai giu" : ""}`,
		);
	}
	await dongTrang(t);
	await e4Rong(n);
}

async function e4Rong(n) {
	const t = await moTrang(n.ck.thanhVien, `/${n.slug}/okr/bo-okr`, DO.kho.rong);
	await cho(t, "[data-danh-sach-bo]");
	await bam(t, "[data-loc-bo] [data-pham-vi='toi-dan']");
	await choUrlLoc(t, "toi-dan");
	const d = await t.evaluate(DOC_DANH_SACH);
	const cau = d.rong?.includes(CHU.tenLocToiDan) === true;
	const nut = d.nutVe === CHU.nutVe;
	let sau = { q: "-", soHang: -1 };
	if (nut) {
		await bam(t, "[data-ve-tat-ca]");
		await choUrlLoc(t, "tat-ca");
		const s = await t.evaluate(DOC_DANH_SACH);
		sau = { q: thamSo(t).get(THAM.loc), soHang: s.hang.length };
	}
	await dongTrang(t);
	const tatCa = n.dsTv.hang.length;
	const dat =
		cau && nut && d.hang.length === 0 && sau.q === null && sau.soHang === tatCa;
	kd(
		"AC-2",
		dat,
		`LOC rong: ${cau ? "cau" : "KHONG cau"} «${d.rong ?? "-"}» · ${d.hang.length} hang bang · ${nut ? "ve tat ca" : `KHONG nut «${CHU.nutVe}»`} · sau bam url ${sau.q ?? "khong phamViBo"} · ${sau.soHang} hang = tat ca ${tatCa}`,
	);
}

async function moBoTuDanhSach(n, t, don, nhan, mong) {
	const bamDuoc = await bam(t, `[data-bang-bo] tr[data-bo='${don}'] a`);
	await cho(
		t,
		"[data-vi-tri-bo='mot-bo'] [data-slot='breadcrumb-page']",
		DO.cho.dieuHuongMs,
	);
	await cho(
		t,
		"[data-trang-thai='ST-donvi-danhsach'], [data-trang-thai='ST-donvi-rong']",
		DO.cho.dieuHuongMs,
	);
	const d = await t.evaluate(DOC_MOT_BO);
	const q = thamSo(t);
	const ve = d.veHref ? new URL(d.veHref, APP) : null;
	const urlDung =
		bamDuoc && q.get(THAM.don) === don && q.get(THAM.ky) === n.ky.cur;
	const veDung =
		ve !== null &&
		ve.pathname === `/${n.slug}/okr/bo-okr` &&
		ve.searchParams.get(THAM.ky) === n.ky.cur &&
		!ve.searchParams.has(THAM.don);
	const api = await n.api.truong.hoi("okr.danhSach", {
		cycleId: n.ky.cur,
		unit: donTuKhoa(don),
		loc: LOC_TRONG,
	});
	const mongId = new Set(api.rows.map((r) => r.id));
	const thayId = new Set(d.mucTieu);
	const trongDb = await db.okrObjective.findMany({
		where: { id: { in: d.mucTieu } },
		select: {
			level: true,
			divisionId: true,
			departmentId: true,
			personUserId: true,
		},
	});
	const thuocDon =
		trongDb.length === d.mucTieu.length &&
		trongDb.every((o) => khoaCuaMucTieu(o) === don);
	const dat =
		urlDung &&
		d.viTriTen === mong &&
		veDung &&
		tapBang(thayId, mongId) &&
		thuocDon;
	kd(
		"AC-3",
		dat,
		`MO BO ${nhan}: url ${q.get(THAM.don) ?? "khong donOkr"} kyOkr ${q.get(THAM.ky) === n.ky.cur ? "giu" : "mat"} · tieu de «${CHU.viTri} › ${d.viTriTen ?? "-"}» (mong ${mong}) · ve Bo OKR ${veDung ? "giu kyOkr" : `lech ${d.veHref ?? "khong co"}`} · ${thayId.size} muc tieu cua don vi (okr.danhSach ${mongId.size}${tapBang(thayId, mongId) ? "" : " lech"}${thuocDon ? "" : ", DB khac don vi"})`,
	);
}

async function e5(n) {
	const ds = `/${n.slug}/okr/bo-okr?${new URLSearchParams({ [THAM.ky]: n.ky.cur })}`;
	const ca = [
		{ don: `pb:${n.pb.id}`, nhan: `pb:${n.pb.id}`, ten: n.pb.name },
		{ don: "goc", nhan: "goc", ten: n.tenGoc },
	];
	for (const c of ca) {
		const t = await moTrang(n.ck.truong, ds, DO.kho.rong);
		await cho(t, "[data-danh-sach-bo] tr[data-bo]");
		await moBoTuDanhSach(n, t, c.don, c.nhan, c.ten);
		await dongTrang(t);
	}
}

async function choThe(t, the) {
	await t
		.waitForFunction(
			(th, kXem, mocs) => {
				const hien = (el) =>
					el.getClientRects().length > 0 &&
					getComputedStyle(el).visibility !== "hidden";
				const xem = new URL(location.href).searchParams.get(kXem);
				const cur = document
					.querySelector("[data-the-con-bo] a[aria-current='page']")
					?.getAttribute("data-the");
				const moc = [...document.querySelectorAll("[data-trang-thai]")]
					.filter(hien)
					.map((e) => e.getAttribute("data-trang-thai"));
				return (
					(th === "danh-sach" ? xem === null : xem === th) &&
					cur === th &&
					moc.some((m) => mocs.includes(m))
				);
			},
			{ timeout: DO.cho.dieuHuongMs, polling: DO.cho.nhipMs },
			the,
			THAM.xem,
			MOC_THE[the],
		)
		.catch(() => {});
	await nghi(DO.cho.onDinhMs);
}

async function dongThe(t, nhan, the, don, ky) {
	const d = await t.evaluate(DOC_MOT_BO);
	const q = thamSo(t);
	const kyGiu = q.get(THAM.ky) === ky;
	const donGiu = q.get(THAM.don) === don;
	const xemDung =
		the === "danh-sach" ? !q.has(THAM.xem) : q.get(THAM.xem) === the;
	const mo =
		xemDung && d.the === the && d.moc.some((m) => MOC_THE[the].includes(m));
	kd(
		"AC-5",
		kyGiu && donGiu && mo,
		`THE ${nhan}: ky ${kyGiu ? "giu" : "mat"} · don ${donGiu ? "giu" : "mat"} · ${mo ? `${the} mo` : `${the} KHONG mo (xemOkr ${q.get(THAM.xem) ?? "-"}, aria-current ${d.the ?? "-"}, noi dung ${d.moc.join(",") || "-"})`}`,
	);
}

async function e7Mot(n, don, tienTo) {
	const ky = n.ky.khac;
	const t = await moTrang(
		n.ck.truong,
		`/${n.slug}/okr/bo-okr?${new URLSearchParams({ [THAM.don]: don, [THAM.ky]: ky })}`,
		DO.kho.rong,
	);
	await cho(t, "[data-the-con-bo] a[data-the]");
	await choThe(t, "danh-sach");
	for (const the of TIEN_THE) {
		await bam(t, `[data-the-con-bo] a[data-the='${the}']`);
		await choThe(t, the);
		await dongThe(t, `${tienTo}${the}`, the, don, ky);
	}
	const lui = TIEN_THE.slice(0, SO_LUI).reverse();
	for (const [i, the] of lui.entries()) {
		await t
			.goBack({ waitUntil: "domcontentloaded", timeout: DO.cho.dieuHuongMs })
			.catch(() => null);
		await choThe(t, the);
		await dongThe(t, `${tienTo}lui${i + 1}-${the}`, the, don, ky);
	}
	await dongTrang(t);
}

async function e7(n) {
	await e7Mot(n, `pb:${n.pb.id}`, "");
	await e7Mot(n, "goc", "goc/");
}

const DOC_VIEC = (id) => {
	const hien = (el) =>
		!!el &&
		el.getClientRects().length > 0 &&
		getComputedStyle(el).visibility !== "hidden";
	const dongViec = [...document.querySelectorAll(`[data-viec='${id}']`)].find(
		hien,
	);
	if (!dongViec) return null;
	const nhom = dongViec.closest("[data-nhom-kr]");
	return {
		nhomId: nhom?.getAttribute("data-nhom-kr") ?? null,
		nhomTen:
			nhom
				?.querySelector("[data-slot='section-heading']")
				?.textContent.trim() ?? null,
		nguoiLam:
			dongViec.querySelector("[data-nguoi-lam]")?.innerText.trim() ?? null,
		han:
			dongViec.querySelector("[data-han] time")?.getAttribute("datetime") ??
			null,
		xong:
			dongViec.querySelector("[data-xong]")?.getAttribute("data-xong") ?? null,
	};
};

async function e9(n) {
	const unit = { loai: "pb", id: n.pb.id };
	const api = await n.api.truong.hoi("okr.viecCuaBo", {
		cycleId: n.ky.cur,
		unit,
	});
	const t = await moTrang(
		n.ck.truong,
		`/${n.slug}/okr/bo-okr?${new URLSearchParams({ [THAM.don]: `pb:${n.pb.id}`, [THAM.ky]: n.ky.cur, [THAM.xem]: "viec" })}`,
		DO.kho.rong,
	);
	await cho(t, "[data-trang-thai='ST-bo-viec'] [data-viec]");
	for (const v of n.viec) {
		const nhom = api.nhom.find((g) => g.viec.some((x) => x.id === v.id));
		const tra = nhom?.viec.find((x) => x.id === v.id);
		const dbv = await db.okrViecKr.findUnique({
			where: { id: v.id },
			select: { keyResultId: true, hanNgay: true, xongLuc: true },
		});
		const dbDung =
			!!dbv &&
			!!tra &&
			dbv.keyResultId === nhom.kr.id &&
			(dbv.xongLuc !== null) === tra.xong &&
			(dbv.hanNgay?.toISOString().slice(0, 10) ?? null) ===
				(tra.hanNgay?.slice(0, 10) ?? null) &&
			tra.xong === v.xong &&
			(tra.hanNgay !== null) === v.coHan;
		const d = await t.evaluate(DOC_VIEC, v.id);
		const nhomDung =
			!!d && !!nhom && d.nhomId === nhom.kr.id && d.nhomTen === nhom.kr.ten;
		const nguoiDung = !!d && d.nguoiLam === (tra?.nguoiLam?.name ?? CHU.trong);
		const hanDung = !!d && d.han === (tra?.hanNgay?.slice(0, 10) ?? null);
		const xongDung = !!d && d.xong === (tra?.xong ? "co" : "khong");
		kd(
			"AC-6",
			dbDung && nhomDung && nguoiDung && hanDung && xongDung,
			`VIEC ${v.tieuDe}: nhom ${nhomDung ? `«${nhom.kr.ten}»` : `lech (thay «${d?.nhomTen ?? "-"}» ${d?.nhomId ?? "khong nhom"}, mong ${nhom?.kr.id ?? "-"})`} · nguoi lam ${d?.nguoiLam ?? "-"}${nguoiDung ? "" : " LECH"} · han ${d?.han ?? "-"}${hanDung ? "" : " LECH"} · xong ${d?.xong ?? "-"}${xongDung ? "" : " LECH"}${dbDung ? "" : " · okr.viecCuaBo lech OkrViecKr/gieo"}`,
		);
	}
	await dongTrang(t);
	const tr = await moTrang(
		n.ck.truong,
		`/${n.slug}/okr/bo-okr?${new URLSearchParams({ [THAM.don]: n.rong.don, [THAM.ky]: n.ky.cur, [THAM.xem]: "viec" })}`,
		DO.kho.rong,
	);
	await cho(
		tr,
		"[data-trang-thai='ST-bo-viec-rong'], [data-trang-thai='ST-bo-viec']",
	);
	const r = await tr.evaluate(() => {
		const hien = (el) =>
			!!el &&
			el.getClientRects().length > 0 &&
			getComputedStyle(el).visibility !== "hidden";
		return {
			rong: hien(document.querySelector("[data-trang-thai='ST-bo-viec-rong']")),
			soViec: [...document.querySelectorAll("[data-viec]")].filter(hien).length,
			soBang: [
				...document.querySelectorAll("[data-trang-thai^='ST-bo-viec'] table"),
			].filter(hien).length,
		};
	});
	await dongTrang(tr);
	kd(
		"AC-6",
		r.rong && r.soViec === 0 && r.soBang === 0,
		`VIEC rong: ${r.rong ? "cau rong" : "KHONG cau rong"} (${n.rong.ten}) · ${r.soViec} viec · ${r.soBang} bang`,
	);
}

async function e10Ca(n, ca, duong, mong) {
	const t = await moTrang(n.ck.truong, duong, DO.kho.rong);
	await cho(
		t,
		"[data-the-con-bo] a[aria-current='page'], [data-danh-sach-bo]",
		DO.cho.dieuHuongMs,
	);
	await choThe(t, "hop-tuan");
	const d = await t.evaluate(DOC_MOT_BO);
	const u = new URL(t.url());
	await dongTrang(t);
	const thamDung = Object.entries(mong.tham).every(
		([k, v]) => u.searchParams.get(k) === v,
	);
	const moHop =
		d.the === "hop-tuan" && d.moc.some((m) => MOC_THE["hop-tuan"].includes(m));
	const dat =
		u.pathname === `/${n.slug}/okr/bo-okr` &&
		thamDung &&
		moHop &&
		d.viTriTen === mong.ten;
	kd(
		"AC-7",
		dat,
		`CU ${ca}: ${u.pathname}${u.search} · ${d.the ?? "khong the con"}${moHop ? "" : " (noi dung hop tuan khong hien)"} · ${d.viTriTen ?? "-"}${
			dat
				? ""
				: ` (mong ${mong.ten}, ${Object.entries(mong.tham)
						.map(([k, v]) => `${k}=${v}`)
						.join("&")})`
		}`,
	);
}

async function e10(n) {
	const tham = {
		[THAM.don]: `pb:${n.pb.id}`,
		[THAM.xem]: "hop-tuan",
		[THAM.ky]: n.ky.cur,
	};
	await e10Ca(
		n,
		"theo-don-vi",
		`/${n.slug}/okr/theo-don-vi?${new URLSearchParams(tham)}`,
		{ tham, ten: n.pb.name },
	);
	await e10Ca(
		n,
		"xem-khong-don",
		`/${n.slug}/okr/bo-okr?${new URLSearchParams({ [THAM.xem]: "hop-tuan" })}`,
		{ tham: { [THAM.xem]: "hop-tuan" }, ten: n.tenGoc },
	);
}

const DOC_HEP = () => {
	const hien = (el) =>
		!!el &&
		el.getClientRects().length > 0 &&
		getComputedStyle(el).visibility !== "hidden";
	const tl = document.documentElement;
	const cuon = document.querySelector("[data-slot='page-shell-scroll']");
	const the = document.querySelector("[data-the-con-bo]");
	const r = the?.getBoundingClientRect();
	return {
		soBang: [...document.querySelectorAll("table")].filter(hien).length,
		soItem: [
			...document.querySelectorAll("[data-the-bo] [data-slot='item']"),
		].filter(hien).length,
		soThe: [...document.querySelectorAll("[data-the-con-bo] a[data-the]")]
			.length,
		the: the
			? {
					trai: Math.round(r.left),
					phai: Math.round(r.right),
					sw: the.scrollWidth,
					cw: the.clientWidth,
					tran: getComputedStyle(the).overflowX,
				}
			: null,
		sw: tl.scrollWidth,
		iw: window.innerWidth,
		cuonTran: cuon ? cuon.scrollWidth - cuon.clientWidth : 0,
	};
};

async function e12(n) {
	const t = await moTrang(n.ck.truong, `/${n.slug}/okr/bo-okr`, DO.kho.hep);
	await cho(t, "[data-the-bo] [data-slot='item']");
	const d = await t.evaluate(DOC_HEP);
	await dongTrang(t);
	const soBo = n.ds.hang.length;
	const khongCuon = d.sw <= d.iw && d.cuonTran <= DO.lechPx;
	kd(
		"AC-8",
		d.soBang === 0 && d.soItem === soBo && khongCuon,
		`HEP danh-sach: ${d.soItem} item / ${soBo} bo · ${d.soBang} bang hien · ${khongCuon ? "khong cuon ngang" : `CUON NGANG ${d.sw} > ${d.iw} (vung cuon tran ${d.cuonTran})`}`,
	);
	const t2 = await moTrang(
		n.ck.truong,
		`/${n.slug}/okr/bo-okr?${new URLSearchParams({ [THAM.don]: `pb:${n.pb.id}`, [THAM.ky]: n.ky.cur })}`,
		DO.kho.hep,
	);
	await cho(t2, "[data-the-con-bo] a[data-the]");
	const m = await t2.evaluate(DOC_HEP);
	await dongTrang(t2);
	const khongCuon2 = m.sw <= m.iw && m.cuonTran <= DO.lechPx;
	const trongKhung =
		m.the !== null &&
		m.the.trai >= 0 &&
		m.the.phai <= m.iw + DO.lechPx &&
		(m.the.sw <= m.the.cw || ["auto", "scroll"].includes(m.the.tran));
	kd(
		"AC-8",
		trongKhung && khongCuon2,
		`HEP mot-bo: ${m.soThe} the · hang the ${m.the ? `${m.the.sw}/${m.the.cw} (${m.the.trai}..${m.the.phai}, overflow-x ${m.the.tran})` : "khong co"} ${trongKhung ? "cuon trong chinh no" : "TRAN KHUNG"} · ${khongCuon2 ? "khong cuon ngang" : `CUON NGANG ${m.sw} > ${m.iw} (vung cuon tran ${m.cuonTran})`}`,
	);
}

async function chup(n, ten, duong, kho, toi, chon) {
	const t = await moTrang(n.ck.truong, duong, kho, toi);
	if (!(await cho(t, chon)))
		await khongDo(`KHONG DO DUOC: anh ${ten} khong thay ${chon}`);
	mkdirSync(BANG_CHUNG, { recursive: true });
	await t.screenshot({ path: join(BANG_CHUNG, `${ten}.png`) });
	await dongTrang(t);
	console.log(`ANH ${ten}.png`);
}

async function e14(n) {
	const ds = `/${n.slug}/okr/bo-okr`;
	const mot = `${ds}?${new URLSearchParams({ [THAM.don]: `pb:${n.pb.id}`, [THAM.ky]: n.ky.cur })}`;
	const chonDs = "[data-danh-sach-bo] [data-bo]";
	const chonMot =
		"[data-trang-thai='ST-donvi-danhsach'], [data-trang-thai='ST-donvi-rong']";
	await chup(n, "tbo-danh-sach-1440-sang", ds, DO.kho.rong, false, chonDs);
	await chup(n, "tbo-danh-sach-1440-toi", ds, DO.kho.rong, true, chonDs);
	await chup(n, "tbo-danh-sach-375-sang", ds, DO.kho.hep, false, chonDs);
	await chup(n, "tbo-mot-bo-1440-sang", mot, DO.kho.rong, false, chonMot);
	await chup(n, "tbo-mot-bo-1440-toi", mot, DO.kho.rong, true, chonMot);
	await chup(n, "tbo-mot-bo-375-sang", mot, DO.kho.hep, false, chonMot);
}

console.log(
	`man-bo-okr: ${CHON_EVAL.size === 0 ? "chay tron" : `chi ${[...CHON_EVAL].join(", ")}`} · an cong cu chi co o may chu dev truoc khi do: nut TanStack Query Devtools, chi bao Next.js`,
);
try {
	const n = await dungDuLieu();
	if (chay("E2")) await e2(n);
	if (chay("E4")) await e4(n);
	if (chay("E5")) await e5(n);
	if (chay("E7")) await e7(n);
	if (chay("E9")) await e9(n);
	if (chay("E10")) await e10(n);
	if (chay("E12")) await e12(n);
	if (chay("E14")) await e14(n);
} catch (loi) {
	console.log(`KHONG DO DUOC: thuoc vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}
console.log(`anh: ${BANG_CHUNG}`);
console.log(`KET LUAN tbo: ${dung} DUNG, ${sai} SAI`);
await db.$disconnect();
await ket(sai === 0 ? 0 : 1);
