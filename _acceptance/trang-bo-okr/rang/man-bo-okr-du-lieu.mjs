import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { OKR_MAU } from "../../../apps/api/scripts/okr-mau/cau-hinh.ts";
import { kyTrongOChon } from "../../../apps/app/app/(app)/[slug]/okr/okr-search-params.ts";
import { SEARCH_PARAM } from "../../../apps/app/lib/search-param-keys.ts";
import { db } from "../../../packages/db/src/index.ts";
import {
	khongDo,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	GOC,
	phienCua,
	trpcCua,
} from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";

const HO_SO = "trang-bo-okr";
const DA_THONG_CONG = new Set(["signed-off", "machine-cleared"]);
const trangThaiHopDong = (
	readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8").match(
		/^status:\s*(\S+)/m,
	)?.[1] ?? ""
).trim();
export const BANG_CHUNG =
	process.env.BANG_CHUNG ??
	(DA_THONG_CONG.has(trangThaiHopDong)
		? join(GOC, ".acceptance-runs", HO_SO, "evidence")
		: join(GOC, "_acceptance", HO_SO, "evidence"));

const GIAY_MS = 1000;
const NGAY_MS = 24 * 60 * 60 * GIAY_MS;
export const DO = {
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
export const AN_CONG_CU_DEV =
	".tsqd-parent-container, .tsqd-open-btn-container, nextjs-portal { display: none !important; }";
export const MOI_EVAL = ["E2", "E4", "E5", "E7", "E9", "E10", "E12", "E14"];
export const THAM = {
	ky: SEARCH_PARAM.okr.ky,
	don: SEARCH_PARAM.okr.don,
	xem: SEARCH_PARAM.okr.xem,
	loc: SEARCH_PARAM.okr.phamViBo,
};
export const PHAM_VI = ["tat-ca", "toi-dan", "theo-doi"];
export const TIEN_THE = ["hop-tuan", "viec", "danh-sach"];
export const SO_LUI = 2;
export const THE_SO_DO = "so-do";
export const MOC_THE = {
	"danh-sach": ["ST-donvi-danhsach", "ST-donvi-rong", "ST-donvi-loc-khongkhop"],
	"hop-tuan": [
		"ST-hoptuan-tuandau",
		"ST-hoptuan-yenang",
		"ST-hoptuan-codulieu",
	],
	viec: ["ST-bo-viec", "ST-bo-viec-rong"],
};
export const CHU = {
	viTri: "Bộ OKR",
	tieuDeKhu: "Mục tiêu",
	tenLocToiDan: "Tôi dẫn",
	nutVe: "Về Tất cả",
	trong: "—",
};
export const COT = { bo: 0, truong: 1, mucTieu: 2, tienDo: 3, tuTin: 4, so: 5 };
const KHOA_CAP = { onehub: "goc", "bo-phan": "bp", "phong-ban": "pb" };
export const LOC_TRONG = {
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

export const nghi = (ms) => new Promise((xong) => setTimeout(xong, ms));
const thuMau = (ma) => `${ma}@${OKR_MAU.mienThu}`;
export const tapBang = (a, b) =>
	a.size === b.size && [...a].every((x) => b.has(x));
export const tapChu = (s) => [...s].sort().join(",") || "-";
export const donTuKhoa = (k) => {
	if (k === "goc") return { loai: "goc" };
	const [loai, id] = k.split(":");
	return { loai, id };
};
export const khoaCuaMucTieu = (o) => {
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

export function donViCuaCay(cay) {
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

export async function dungDuLieu() {
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
