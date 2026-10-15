import { beforeEach, describe, expect, mock, test } from "bun:test";
import { tinhTrang } from "@crm/validation/okr-muc-tieu";
import { skipToken } from "@tanstack/react-query";
import { type ComponentProps, createElement as h, type ReactNode } from "react";
import type { DonChonOkr } from "@/app/(app)/[slug]/okr/okr-search-params";
import type { RouterOutputs } from "@/lib/trpc/types";
import type {
	ChuKyOutput,
	KrOutput,
	MucTieuOutput,
} from "../../api/src/okr/okr.contracts";
import type { TreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

/* Trang đơn vị một bảng (DH2). Mỗi `describe` là một nhóm `dvb-…` để
   `-t dvb-…` chọn đúng một eval. Khi một điều khẳng định hỏng, bài ném Error
   mang đúng chuỗi ghim của evals.yaml, để đột biến của rang/hai-chieu.mjs đỏ
   đúng thông điệp. */

function phai(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

/* ——— Fixture: cây tổ chức có dấu, sinh bằng hàm ——— */

const nguoi = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@onehub.vn`,
});
const LAN = nguoi("U1", "Nguyễn Thị Lan");
const HUNG = nguoi("U2", "Trần Văn Hùng");

type PhongBanMau = { id: string; name: string; head: typeof LAN | null };

function phongBan(p: PhongBanMau, divisionId: string | null) {
	return {
		...p,
		moTa: "",
		position: 0,
		divisionId,
		stepCount: 0,
		okrMo: 0,
		people: p.head ? [{ ...p.head, primary: true }] : [],
	};
}

const CAY = {
	B1: { id: "B1", name: "Khối Vận hành", head: LAN },
	B2: { id: "B2", name: "Khối Tăng trưởng", head: null },
	P1: { id: "P1", name: "Phòng Kế toán", head: HUNG },
	P2: { id: "P2", name: "Dịch vụ khách hàng", head: null },
	P3: { id: "P3", name: "Kinh doanh", head: HUNG },
	P4: { id: "P4", name: "Tiếp thị", head: null },
	X1: { id: "X1", name: "Pháp chế", head: LAN },
} satisfies Record<string, PhongBanMau>;

const CON_CUA_BP = new Map([
	["B1", [CAY.P1, CAY.P2]],
	["B2", [CAY.P3, CAY.P4]],
]);

function cayMau(): TreeOutput {
	return {
		divisions: [CAY.B1, CAY.B2].map((bp, i) => ({
			...bp,
			moTa: "",
			position: i,
			okrMo: 0,
			departments: (CON_CUA_BP.get(bp.id) ?? []).map((pb) =>
				phongBan(pb, bp.id),
			),
		})),
		chuaXep: [phongBan(CAY.X1, null)],
		chuaCoPhongBan: [],
		people: [
			{
				...LAN,
				primaryDepartmentId: "P1",
				secondaryDepartmentIds: [],
				managerOverrideId: null,
				manager: HUNG,
				managerSource: "chon-tay",
				chucDanh: "",
			},
		],
		archived: { divisions: [], departments: [] },
		coverage: { members: 2, withPrimary: 1, departmentsWithoutHead: 3 },
	};
}

const QUY: ChuKyOutput = {
	id: "q4",
	kind: "quy",
	name: "Quý 4/2026",
	parentId: "n26",
	startsOn: "2026-10-01",
	endsOn: "2026-12-31",
	phase: "dang-chay",
	breakStartsOn: null,
	breakEndsOn: null,
	updateWeekday: 1,
	cuaSoRa: null,
	anLuc: null,
	anLyDo: null,
	quyConHien: 0,
	viec: {
		suaMoiO: false,
		suaTen: false,
		go: false,
		an: false,
		hienLai: false,
	},
};

function ketQua(
	id: string,
	objectiveId: string,
	progress = 40,
	moc = false,
): KrOutput {
	return {
		id,
		objectiveId,
		title: `KR ${id}`,
		kind: moc ? "moc" : "tang-toi",
		owner: HUNG,
		startValue: 0,
		targetValue: 50,
		currentValue: 20,
		unit: "khách",
		dueOn: null,
		weight: 1,
		source: "tay",
		doCanh: false,
		soMay: null,
		nguonMay: null,
		startLocked: true,
		progress,
		laCuaToi: false,
		hienTaiQuaCapNhat: false,
	};
}

function mucTieu(
	id: string,
	soKr: number,
	them: Partial<MucTieuOutput> = {},
): MucTieuOutput {
	return {
		id,
		cycleId: QUY.id,
		level: "phong-ban",
		unitId: "P1",
		unitName: CAY.P1.name,
		title: `Mục tiêu ${id}`,
		kind: "cam-ket",
		status: "cong-bo",
		owner: HUNG,
		participants: [],
		whyNow: "",
		publishedAt: "2026-10-02T00:00:00.000Z",
		droppedAt: null,
		progress: 40,
		expected: 50,
		keyResults: Array.from({ length: soKr }, (_, i) =>
			ketQua(`${id}-k${i + 1}`, id),
		),
		alignments: [],
		canEdit: false,
		following: false,
		followerCount: 0,
		theoDoi: false,
		hienThi: "cong-khai",
		soNguoiXem: 0,
		soGopYCho: 0,
		...them,
	};
}

const NOI_GOP = {
	alignmentId: "al",
	targetObjectiveId: "cty-1",
	targetKeyResultId: null,
	unitName: "OneHub",
	objectiveTitle: "Mục tiêu công ty",
	keyResultTitle: null,
	lyDo: null,
	canCu: null,
	lyDoTuKara: false,
	mucTin: "chua-co-ly-do" as const,
};

/** Một mục tiêu một KR: nhịp KR do (progress, expected) quyết; `gop` thêm một nơi góp. */
function mucTieuNhip(
	id: string,
	progress: number,
	expected: number | null,
	gop: boolean,
	moc: boolean,
): MucTieuOutput {
	return mucTieu(id, 0, {
		expected,
		progress,
		keyResults: [ketQua(`${id}-k1`, id, progress, moc)],
		alignments: gop ? [{ ...NOI_GOP, alignmentId: `al-${id}` }] : [],
	});
}

/* ——— Giả lập tRPC, nuqs, next ——— */

let cycles: RouterOutputs["okr"]["cycles"];
let quanTri: boolean;
let theoDon: Map<string, { rows: MucTieuOutput[]; daBo: MucTieuOutput[] }>;
let dem: RouterOutputs["okr"]["countByUnit"];
let loiDanhSach: Set<string>;
let treo: Set<string>;
let goiDanhSach: DauVao[];

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;

const khoaDonVao = (vao: DauVao) =>
	JSON.stringify(vao?.unit ?? { loai: "goc" });

function thuTuc<TRa>(ten: string, doc: (vao: DauVao) => TRa) {
	return {
		queryKey: (vao?: DauVao) => [ten, vao ?? null],
		queryOptions: (vao?: DauVao | typeof skipToken) =>
			vao === skipToken
				? { queryKey: [ten, "skip"], queryFn: skipToken }
				: {
						queryKey: [ten, vao ?? null],
						queryFn: async () => doc(vao),
					},
	};
}

const MAT_RONG = { phuTrach: [], loai: [], trangThai: [], tuTin: [], gopY: [] };

const danhSachCua = (vao: DauVao) => {
	const d = theoDon.get(khoaDonVao(vao)) ?? { rows: [], daBo: [] };
	return {
		rows: d.rows.map((o) => ({ ...o, krKhop: [] })),
		daBo: d.daBo.map((o) => ({ ...o, krKhop: [] })),
		total: d.rows.length,
		facetCounts: MAT_RONG,
		canEdit: false,
		canCreate: false,
	};
};
const docDanhSach = (vao: DauVao) => {
	goiDanhSach.push(vao);
	const khoa = khoaDonVao(vao);
	if (treo.has(khoa)) return new Promise<never>(() => {});
	if (loiDanhSach.has(khoa)) throw new Error("may chu khong tra loi");
	return danhSachCua(vao);
};
const docCay = () => cayMau();
const docCycles = () => cycles;
const docAccess = () => ({
	canManageProgram: quanTri,
	headOf: { divisions: [], departments: [] },
});
const docWorkspace = () => ({ name: "OneHub" });
const docDem = () => dem;

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		org: { tree: thuTuc("tree", docCay) },
		workspace: { get: thuTuc("workspace", docWorkspace) },
		okr: {
			cycles: thuTuc("cycles", docCycles),
			access: thuTuc("access", docAccess),
			countByUnit: thuTuc("countByUnit", docDem),
			danhSach: thuTuc("danhSach", docDanhSach),
			cayCanChinh: thuTuc("cayCanChinh", () => ({
				roots: [],
				chuaCanChinh: [],
				canh: [],
			})),
			hopTuan: thuTuc("hopTuan", () => ({ dong: [], rows: [] })),
			soanSanSang: thuTuc("soanSanSang", () => ({
				bat: false,
				lyDo: "don-vi-chua-bat",
			})),
			soanMo: {
				mutationOptions: () => ({ mutationFn: async () => null }),
			},
		},
	}),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/okr/theo-don-vi",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));

const {
	canBan,
	chuaGop,
	conTrucTiep,
	demLocNhanh,
	gapDau,
	khopTim,
	locNhanh,
	luaChonDonVi,
	sapXep,
	tinhTrangMucTieu,
} = await import("@/app/(app)/[slug]/okr/theo-don-vi/bang-don-vi");
const { khoaDon } = await import("@/app/(app)/[slug]/okr/okr-search-params");
beforeEach(() => {
	cycles = { cycles: [QUY], currentId: QUY.id };
	quanTri = false;
	theoDon = new Map();
	dem = {};
	loiDanhSach = new Set();
	treo = new Set();
	goiDanhSach = [];
});

/* ——— Nhóm thuần: lọc nhanh ——— */

/** Nhãn kỳ vọng tính độc lập bằng `tinhTrang` của @crm/validation. */
function kyVongCanBan(mt: MucTieuOutput): boolean {
	return mt.keyResults.some((k) => {
		if (k.kind === "moc") return false;
		const t = tinhTrang(k.progress, mt.expected, mt.kind);
		return t === "cham-nhip" || t === "truot";
	});
}

function maTranLocNhanh(): MucTieuOutput[] {
	const NHIP = [
		["dung", 60, 50],
		["cham", 30, 50],
		["truot", 10, 50],
		["ky-vong-null", 40, null],
		["moc", 0, 50],
	] as const;
	const ds = NHIP.flatMap(([ten, p, e]) =>
		[true, false].map((gop) =>
			mucTieuNhip(`${ten}-${gop ? "gop" : "le"}`, p, e, gop, ten === "moc"),
		),
	);
	ds.push(
		mucTieuNhip("cty", 10, 50, false, false),
		mucTieu("cty-le", 1, { level: "onehub" }),
	);
	const cty = ds.find((x) => x.id === "cty");
	if (cty) cty.level = "onehub";
	return ds;
}

describe("dvb-loc-nhanh", () => {
	test("ma tran 5 nhip KR x co/khong noi gop + muc tieu cong ty: Cần bàn, Chưa góp vào đâu, so dem", () => {
		const ds = maTranLocNhanh();
		phai(
			!locNhanh(ds, "chua-gop").some((x) => x.level === "onehub"),
			"dvb-loc-nhanh: muc tieu cong ty nam trong Chưa góp vào đâu",
		);
		for (const mt of ds) {
			phai(
				canBan(mt) === kyVongCanBan(mt),
				`dvb-loc-nhanh: ${mt.id} Cần bàn ${canBan(mt)}, mong ${kyVongCanBan(mt)}`,
			);
			const gop = mt.level !== "onehub" && mt.alignments.length === 0;
			phai(
				chuaGop(mt) === gop,
				`dvb-loc-nhanh: ${mt.id} Chưa góp vào đâu ${chuaGop(mt)}, mong ${gop}`,
			);
		}
		const dem = demLocNhanh(ds);
		expect({
			canBan: locNhanh(ds, "can-ban").map((x) => x.id),
			chuaGop: locNhanh(ds, "chua-gop").map((x) => x.id),
			tatCa: locNhanh(ds, null).length,
		}).toEqual({
			canBan: ds.filter(kyVongCanBan).map((x) => x.id),
			chuaGop: ds
				.filter((x) => x.level !== "onehub" && x.alignments.length === 0)
				.map((x) => x.id),
			tatCa: ds.length,
		});
		expect(dem["can-ban"]).toBe(locNhanh(ds, "can-ban").length);
		expect(dem["chua-gop"]).toBe(locNhanh(ds, "chua-gop").length);
		// đối chứng dương: ma trận có đủ ca cho cả hai ô
		expect(dem["can-ban"]).toBeGreaterThan(0);
		expect(dem["chua-gop"]).toBeGreaterThan(0);
	});
});

/* ——— Nhóm thuần: sắp xếp ——— */

const BAC = ["truot", "cham-nhip", "dung-nhip", "chua-co-ky-vong"] as const;

function bacThamChieu(mt: MucTieuOutput): number {
	const t =
		mt.keyResults.length === 0
			? "chua-co-ky-vong"
			: tinhTrang(mt.progress, mt.expected, mt.kind);
	return BAC.indexOf(t);
}

function sapThamChieu(
	ds: MucTieuOutput[],
	cot: "tien-do" | "tinh-trang",
	chieu: "asc" | "desc",
): string[] {
	const khoa = (mt: MucTieuOutput) =>
		cot === "tien-do" ? mt.progress : bacThamChieu(mt);
	const dau = chieu === "asc" ? 1 : -1;
	const co = ds.map((mt, i) => ({ id: mt.id, i, k: khoa(mt) }));
	const kq: typeof co = [];
	for (const x of co) {
		const viTri = kq.findIndex((y) => (x.k - y.k) * dau < 0);
		if (viTri === -1) kq.push(x);
		else kq.splice(viTri, 0, x);
	}
	return kq.map((x) => x.id);
}

function maTranSapXep(): MucTieuOutput[] {
	return [
		mucTieu("S1", 1, { progress: 50, expected: 50 }),
		mucTieu("S2", 1, { progress: 10, expected: 50 }),
		mucTieu("S3", 1, { progress: 30, expected: null }),
		mucTieu("S4", 1, { progress: 35, expected: 50 }),
		mucTieu("S5", 1, { progress: 45, expected: 50 }),
		mucTieu("S6", 0, { progress: 0, expected: 50 }),
	];
}

describe("dvb-sap-xep", () => {
	const O = [
		["tien-do", "asc", "tien-do tang"],
		["tien-do", "desc", "tien-do giam"],
		["tinh-trang", "asc", "tinh-trang tang"],
		["tinh-trang", "desc", "tinh-trang giam"],
	] as const;
	for (const [cot, chieu, ten] of O) {
		test(`${ten}: day id bang sap tham chieu on dinh`, () => {
			const ds = maTranSapXep();
			const nhan = sapXep(ds, cot, chieu).map((x) => x.id);
			const mong = sapThamChieu(ds, cot, chieu);
			if (cot === "tinh-trang") {
				const tt = (id: string | undefined) => {
					const mt = ds.find((x) => x.id === id);
					return mt ? tinhTrangMucTieu(mt) : "khong-co";
				};
				phai(
					tt(nhan[0]) === tt(mong[0]),
					`dvb-sap-xep: ${ten}: mong ${tt(mong[0])} dau, nhan ${tt(nhan[0])}`,
				);
			}
			phai(
				nhan.join(",") === mong.join(","),
				`dvb-sap-xep: ${ten}: nhan ${nhan.join(",")}, mong ${mong.join(",")}`,
			);
		});
	}
	test("khong sap: giu thu tu may chu", () => {
		const ds = maTranSapXep();
		expect(sapXep(ds, null, "asc").map((x) => x.id)).toEqual(
			ds.map((x) => x.id),
		);
	});
	test("doi chung: ma tran co hai muc tieu cung bac va du bon bac", () => {
		const ds = maTranSapXep();
		const bac = ds.map(bacThamChieu);
		expect(new Set(bac).size).toBe(BAC.length);
		expect(bac.length - new Set(bac).size).toBeGreaterThan(0);
	});
});

/* ——— Nhóm thuần của ô chọn và chân bảng ——— */

const CHU_LUA_CHON = {
	caCongTy: "cả công ty",
	thuoc: (duong: string) => `Thuộc ${duong}`,
	demMucTieu: (n: number) => (n === 0 ? "chưa đặt" : `${n} mục tiêu`),
};

describe("dvb-chon-don-vi", () => {
	test("gap dau: hoa thuong, dau, đ", () => {
		expect(
			["Phòng Kế toán", "ĐỊCH VỤ", "Dịch vụ khách hàng"].map(gapDau),
		).toEqual(["phong ke toan", "dich vu", "dich vu khach hang"]);
	});
	test("ma tran tim tren ten co dau (phan thuan)", () => {
		const ds = luaChonDonVi(cayMau(), "OneHub", undefined, null, CHU_LUA_CHON);
		const tim = (q: string) =>
			ds.filter((lc) => khopTim(lc, q)).map((lc) => lc.ten);
		const MA_TRAN = [
			["phong ke toan", [CAY.P1.name]],
			["dich", [CAY.P2.name]],
			["KINH", [CAY.P3.name]],
			[gapDau(CAY.B1.name), [CAY.B1.name, CAY.P1.name, CAY.P2.name]],
			["zzz", []],
		] as const;
		for (const [q, mong] of MA_TRAN) {
			const nhan = tim(q);
			phai(
				nhan.join("|") === mong.join("|"),
				`dvb-chon-don-vi: "${q}" ra ${nhan.length === 0 ? "rong" : `{${nhan.join(", ")}}`}, mong {${mong.join(", ")}}`,
			);
		}
		expect(tim("").length).toBe(8);
	});
});

const MO_TA_CON = new Map([
	["goc", "chi bo phan va chua xep"],
	["bp", "chi phong ban cua no"],
]);

describe("dvb-chan-bang", () => {
	test("con truc tiep theo cay (phan thuan)", () => {
		const cay = cayMau();
		const MA_TRAN = [
			["goc", ["bp:B1", "bp:B2", "pb:X1"]],
			["bp:B1", ["pb:P1", "pb:P2"]],
			["bp:B2", ["pb:P3", "pb:P4"]],
			["pb:P1", []],
			["pb:X1", []],
			["nguoi:U1", []],
		] as const;
		for (const [don, mong] of MA_TRAN) {
			const unit = donVaoChon(don);
			const nhan = conTrucTiep(cay, unit).map((c) => c.khoa);
			const sai = nhan.find((k) => !mong.some((x) => x === k));
			const thieu = mong.find((k) => !nhan.includes(k));
			phai(
				sai === undefined && thieu === undefined,
				`dvb-chan-bang: ${don}: ${sai ? `con co ${sai.split(":")[1]}` : `thieu ${thieu}`}, mong ${MO_TA_CON.get(unit.loai) ?? "khong co khoi"}`,
			);
			expect(nhan.every((k) => k === khoaDon(donVaoChon(k)))).toBe(true);
		}
	});
});

function donVaoChon(k: string): DonChonOkr {
	const [loai, id = ""] = k.split(":");
	if (loai === "bp" || loai === "pb" || loai === "nguoi") return { loai, id };
	return { loai: "goc" };
}
