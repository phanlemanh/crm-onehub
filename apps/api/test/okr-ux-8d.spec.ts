import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { idMau } from "../scripts/okr-mau/nap";
import type {
	AlignmentTreeOutput,
	MucMoCoi,
	NutCanChinh,
} from "../src/okr/okr.contracts";
import type { DanhSachOutput } from "../src/okr/okr-xem.contracts";
import { type DauVaoHopLe, goiTrpc } from "./ma-tran-thu";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	ketThucMau,
	mt,
	nguoi,
	ok,
	phienMau,
	type TraLoi,
	tienDongHo,
} from "./tro-ly-okr-san";

const KY = idMau("chu-ky", "quy4");
const PHAP_CHE = idMau("pb", "phap-che");
const G = mt("q4-phap-che-3");
const G0 = `${idMau("mt", "u8d-g0")}`;
const LOC_RONG = { phuTrach: [], loai: [], trangThai: [], tuTin: [] };

const NGUOI = {
	v: "tran-quoc-bao",
	chu: "an-khanh-linh",
	n: "nguyen-thi-lan",
	qt: "le-hai-dang",
	them: "pham-thu-trang",
	roiKr: "lu-quoc-viet",
	thu: "doan-thi-thu",
	anh: "vo-duc-anh",
} as const;

type Muc = { id: string; hienThi?: string; soNguoiXem?: number };

let app: NestExpressApplication;
let thanhVienRoi: Awaited<ReturnType<typeof db.member.findMany>> = [];
const phien: Record<string, string> = {};

async function hoi(
	ten: string,
	vao: DauVaoHopLe,
	cookie: string,
): Promise<TraLoi> {
	const res = await goiTrpc(app, ten, "query", vao, { cookie });
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

function phangCay(nut: NutCanChinh[]): Muc[] {
	return nut.flatMap((n) =>
		n.loai === "muc-tieu"
			? [
					{ id: n.objectiveId, hienThi: n.hienThi, soNguoiXem: n.soNguoiXem },
					...phangCay(n.children),
				]
			: phangCay(n.children),
	);
}

async function docDanhSach(thuTuc: string, ai: string): Promise<Muc[]> {
	const c = phien[ai] ?? "";
	if (thuTuc === "okr.mine")
		return ok<{ objectives: Muc[] }>(
			await hoi(thuTuc, { cycleId: KY }, c),
			thuTuc,
		).objectives;
	if (thuTuc === "okr.byUnit")
		return ok<{ objectives: Muc[] }>(
			await hoi(thuTuc, { cycleId: KY, unit: { loai: "pb", id: PHAP_CHE } }, c),
			thuTuc,
		).objectives;
	if (thuTuc === "okr.danhSach")
		return ok<DanhSachOutput>(
			await hoi(
				thuTuc,
				{ cycleId: KY, unit: { loai: "pb", id: PHAP_CHE }, loc: LOC_RONG },
				c,
			),
			thuTuc,
		).rows;
	if (thuTuc === "okr.alignmentTree") {
		const cay = ok<AlignmentTreeOutput>(
			await hoi(thuTuc, { cycleId: KY }, c),
			thuTuc,
		);
		return phangCay([...cay.roots, ...cay.chuaCanChinh]);
	}
	return ok<MucMoCoi[]>(await hoi(thuTuc, { cycleId: KY }, c), thuTuc).map(
		(m) => ({
			id: m.objectiveId,
			hienThi: m.hienThi,
			soNguoiXem: m.soNguoiXem,
		}),
	);
}

const MA_TRAN: readonly { thuTuc: string; ai: string; kyVong: number }[] = [
	{ thuTuc: "okr.mine", ai: "v", kyVong: 0 },
	{ thuTuc: "okr.mine", ai: "chu", kyVong: 2 },
	{ thuTuc: "okr.mine", ai: "n", kyVong: 0 },
	{ thuTuc: "okr.byUnit", ai: "v", kyVong: 1 },
	{ thuTuc: "okr.byUnit", ai: "chu", kyVong: 1 },
	{ thuTuc: "okr.byUnit", ai: "n", kyVong: 0 },
	{ thuTuc: "okr.danhSach", ai: "v", kyVong: 1 },
	{ thuTuc: "okr.danhSach", ai: "chu", kyVong: 1 },
	{ thuTuc: "okr.danhSach", ai: "n", kyVong: 0 },
	{ thuTuc: "okr.alignmentTree", ai: "v", kyVong: 1 },
	{ thuTuc: "okr.alignmentTree", ai: "chu", kyVong: 1 },
	{ thuTuc: "okr.alignmentTree", ai: "n", kyVong: 0 },
	{ thuTuc: "okr.moCoi", ai: "qt", kyVong: 1 },
];

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	for (const [khoa, ma] of Object.entries(NGUOI))
		phien[khoa] = await phienMau(ma);
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

describe("danh-sach", () => {
	beforeAll(async () => {
		const g = await db.okrObjective.findUniqueOrThrow({
			where: { id: G },
			select: { publishedAt: true },
		});
		await db.okrNguoiXem.create({
			data: {
				objectiveId: G,
				userId: nguoi(NGUOI.them),
				createdById: nguoi(NGUOI.chu),
			},
		});
		await db.okrObjective.create({
			data: {
				id: G0,
				cycleId: KY,
				level: "onehub",
				ownerUserId: nguoi(NGUOI.chu),
				kind: "cam-ket",
				status: "cong-bo",
				hienThi: "gioi-han",
				title: "Mục tiêu công ty giới hạn của bài u8d",
				publishedAt: g.publishedAt,
				nguoiXem: {
					create: {
						userId: nguoi(NGUOI.v),
						createdById: nguoi(NGUOI.chu),
					},
				},
			},
		});
		thanhVienRoi = await db.member.findMany({
			where: { userId: nguoi(NGUOI.roiKr) },
		});
		await db.member.deleteMany({ where: { userId: nguoi(NGUOI.roiKr) } });
	}, CHO_DB);

	afterAll(async () => {
		await db.member.createMany({ data: thanhVienRoi });
	}, CHO_DB);

	test(
		"ma trận 13 ô: số mục giới hạn đúng bảng viết trước, cờ khớp bảng, soNguoiXem khớp số hàng",
		async () => {
			const gioiHan = new Set(
				(
					await db.okrObjective.findMany({
						where: { hienThi: "gioi-han" },
						select: { id: true },
					})
				).map((r) => r.id),
			);
			const soHang = await db.okrNguoiXem.count({ where: { objectiveId: G } });
			expect(soHang).toBe(2);
			const ra: string[] = [];
			for (const o of MA_TRAN) {
				const muc = await docDanhSach(o.thuTuc, o.ai);
				const thieuCo = muc.filter((m) => m.hienThi === undefined);
				const coGioiHan = muc.filter((m) => m.hienThi === "gioi-han");
				const nen = muc.filter((m) => gioiHan.has(m.id));
				const soG = muc.find((m) => m.id === G)?.soNguoiXem;
				ra.push(
					`${o.thuTuc} ${o.ai}: gioi-han ${coGioiHan.length} ky vong ${o.kyVong}; thieu co ${thieuCo.length}; lech ${
						coGioiHan
							.map((m) => m.id)
							.sort()
							.join(",") ===
						nen
							.map((m) => m.id)
							.sort()
							.join(",")
							? 0
							: 1
					}${soG === undefined ? "" : `; soNguoiXem G ${soG}`}`,
				);
			}
			expect(ra).toEqual(
				MA_TRAN.map((o) => {
					const coG =
						o.kyVong > 0 &&
						!["okr.alignmentTree"].includes(o.thuTuc) &&
						!(o.thuTuc === "okr.mine" && o.ai !== "chu");
					return `${o.thuTuc} ${o.ai}: gioi-han ${o.kyVong} ky vong ${o.kyVong}; thieu co 0; lech 0${coG ? "; soNguoiXem G 2" : ""}`;
				}),
			);
		},
		CHO_DB,
	);
});

const KHOI_HO_TRO = idMau("bp", "ho-tro");
const NHAP_PC = idMau("mt", "u8d-nhap-pc");
const SO_TRUOC = {
	tienDoGop: [
		["bp:mau-okr-bp-ho-tro", 56, 6],
		["pb:mau-okr-pb-phap-che", 50, 2],
	],
	toanCanh: {
		tienDo: 47,
		kyVong: 42,
		donViCongBo: 12,
		tongDonVi: 13,
		donViChuaDat: ["Khối Hỗ trợ"],
		tongKr: 49,
		daCapNhat: 43,
		daCapNhatTruoc: 46,
		tuTinThap: 8,
		tuTinThapTruoc: 3,
	},
	sucKhoe: {
		key: "pb:mau-okr-pb-phap-che",
		ten: "Pháp chế",
		cap: "phong-ban",
		truong: { id: "mau-okr-nguoi-an-khanh-linh", name: "An Khánh Linh" },
		tongKr: 4,
		chuaKhoiDiem: 0,
		chuaNoiKenh: 2,
		dungTuan: 4,
		krIm: 0,
	},
};

function donViCuaKhoa(khoa: string): DauVaoHopLe {
	if (khoa === "goc") return { loai: "goc" };
	const [loai, id] = khoa.split(":");
	return { loai: loai ?? "", id: id ?? "" };
}

async function soThongKe(ai: string) {
	const c = phien[ai] ?? "";
	const tc = ok<{
		tongQuan: unknown;
		hang: { key: string; tienDo: number | null; soMucTieu: number }[];
	}>(await hoi("okr.toanCanh", { cycleId: KY }, c), "toanCanh");
	return {
		tienDoGop: tc.hang
			.filter(
				(h) => h.key === `pb:${PHAP_CHE}` || h.key === `bp:${KHOI_HO_TRO}`,
			)
			.map((h) => [h.key, h.tienDo, h.soMucTieu]),
		toanCanh: tc.tongQuan,
	};
}

describe("dem-don-vi", () => {
	beforeAll(async () => {
		await db.okrObjective.create({
			data: {
				id: NHAP_PC,
				cycleId: KY,
				level: "phong-ban",
				departmentId: PHAP_CHE,
				ownerUserId: nguoi(NGUOI.chu),
				kind: "cam-ket",
				status: "nhap",
				title: "Nháp của Pháp chế cho bài u8d",
			},
		});
	}, CHO_DB);

	test(
		"PHẦN 1: số trên cây bằng số mục cong-bo trong danhSach không lọc, 4 người × mọi đơn vị",
		async () => {
			const cay = ok<{
				divisions: { id: string; departments: { id: string }[] }[];
			}>(await hoi("org.tree", {}, phien.qt ?? ""), "org.tree");
			const khoa = [
				"goc",
				...cay.divisions.flatMap((b) => [
					`bp:${b.id}`,
					...b.departments.map((p) => `pb:${p.id}`),
				]),
			];
			const lech: string[] = [];
			let soO = 0;
			for (const ai of ["v", "chu", "n", "qt"]) {
				const dem = ok<Record<string, number>>(
					await hoi("okr.countByUnit", { cycleId: KY }, phien[ai] ?? ""),
					"countByUnit",
				);
				for (const k of khoa) {
					const rows = ok<DanhSachOutput>(
						await hoi(
							"okr.danhSach",
							{ cycleId: KY, unit: donViCuaKhoa(k), loc: LOC_RONG },
							phien[ai] ?? "",
						),
						`danhSach ${k}`,
					).rows;
					const congBo = rows.filter(
						(r) =>
							r.status === "cong-bo" &&
							(k === "goc"
								? r.level === "onehub"
								: r.unitId === k.split(":")[1] &&
									r.level === (k.startsWith("bp:") ? "bo-phan" : "phong-ban")),
					).length;
					soO += 1;
					if ((dem[k] ?? 0) !== congBo)
						lech.push(`${ai} ${k} ${dem[k] ?? 0} != ${congBo}`);
				}
			}
			expect(soO).toBe(4 * khoa.length);
			expect(lech).toEqual([]);
			const phapChe = await Promise.all(
				["v", "chu", "n", "qt"].map(async (ai) => {
					const dem = ok<Record<string, number>>(
						await hoi("okr.countByUnit", { cycleId: KY }, phien[ai] ?? ""),
						"countByUnit",
					);
					return `${ai} ${dem[`pb:${PHAP_CHE}`] ?? 0}`;
				}),
			);
			expect(phapChe).toEqual(["v 3", "chu 3", "n 2", "qt 3"]);
		},
		CHO_DB,
	);

	test(
		"PHẦN 2: 3 loại số thống kê × 4 người bằng nhau và bằng ảnh chụp trước lượt",
		async () => {
			const so = await Promise.all(
				["v", "chu", "n", "qt"].map((ai) => soThongKe(ai)),
			);
			const sk = ok<{ hang: { key: string }[] }>(
				await hoi("okr.sucKhoe", { cycleId: KY }, phien.qt ?? ""),
				"sucKhoe",
			).hang.find((h) => h.key === `pb:${PHAP_CHE}`);
			const [dau, ...conLai] = so;
			console.log(`SO_THONG_KE ${JSON.stringify({ ...dau, sucKhoe: sk })}`);
			expect(conLai.map((x) => JSON.stringify(x))).toEqual(
				conLai.map(() => JSON.stringify(dau)),
			);
			expect({ ...dau, sucKhoe: sk }).toEqual(SO_TRUOC);
		},
		CHO_DB,
	);
});

const KHOI_HO_TRO_ID = idMau("bp", "ho-tro");

async function lam(ten: string, vao: DauVaoHopLe, ai: string): Promise<TraLoi> {
	const res = await goiTrpc(app, ten, "mutation", vao, {
		cookie: phien[ai] ?? "",
	});
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

async function taoNhap(v: {
	id: string;
	level: "phong-ban" | "bo-phan" | "ca-nhan";
	chu: string;
	departmentId?: string;
	divisionId?: string;
	personUserId?: string;
}) {
	await db.okrObjective.create({
		data: {
			id: v.id,
			cycleId: KY,
			level: v.level,
			departmentId: v.departmentId ?? null,
			divisionId: v.divisionId ?? null,
			personUserId: v.personUserId ?? null,
			ownerUserId: nguoi(v.chu),
			kind: "cam-ket",
			status: "nhap",
			title: `Nháp u8d ${v.id.slice(-6)}`,
			keyResults: {
				create: {
					title: "Số đo của nháp u8d",
					kind: "tang-toi",
					ownerUserId: nguoi(v.chu),
					startValue: 0,
					targetValue: 10,
					currentValue: 0,
				},
			},
		},
	});
}

type DuyetDoc = {
	status: string;
	nguoiDuyetDuKien: { ten: string } | "quan-tri" | null;
	choDuyet: {
		nguoiDuyet: { ten: string } | "quan-tri";
		lanTraLaiTruoc: { lyDo: string; nguoi: { id: string } | null } | null;
	} | null;
	trail: { action: string; note: string | null }[];
};

const docMt = async (id: string, ai: string) =>
	ok<DuyetDoc>(
		await hoi("okr.objective", { id }, phien[ai] ?? ""),
		`doc ${id}`,
	);

const ten = async (ma: string) =>
	(
		await db.user.findUniqueOrThrow({
			where: { id: nguoi(ma) },
			select: { name: true },
		})
	).name;

describe("nguoi-duyet", () => {
	const PB = idMau("mt", "u8d-duyet-pb");
	const BP = idMau("mt", "u8d-duyet-bp");
	const CN = idMau("mt", "u8d-duyet-cn");
	const CN_TRUONG = idMau("mt", "u8d-duyet-cn-truong");

	beforeAll(async () => {
		ok(
			await lam(
				"okr.setProgram",
				{ duyetCongBo: true, personalOn: true },
				"qt",
			),
			"bat duyet",
		);
		await taoNhap({
			id: PB,
			level: "phong-ban",
			chu: NGUOI.chu,
			departmentId: PHAP_CHE,
		});
		await taoNhap({
			id: BP,
			level: "bo-phan",
			chu: NGUOI.thu,
			divisionId: KHOI_HO_TRO_ID,
		});
		await taoNhap({
			id: CN,
			level: "ca-nhan",
			chu: NGUOI.anh,
			personUserId: nguoi(NGUOI.anh),
		});
		await taoNhap({
			id: CN_TRUONG,
			level: "ca-nhan",
			chu: NGUOI.chu,
			personUserId: nguoi(NGUOI.chu),
		});
	}, CHO_DB);

	afterAll(async () => {
		await lam("okr.setProgram", { duyetCongBo: false }, "qt");
	}, CHO_DB);

	test(
		"bảng bốn cấp: nguoiDuyetDuKien đúng người duyệt, bằng choDuyet.nguoiDuyet sau khi gửi; ba ca null",
		async () => {
			const bang = [
				{ id: PB, ai: "chu", kyVong: { ten: await ten(NGUOI.thu) } },
				{ id: BP, ai: "thu", kyVong: "quan-tri" as const },
				{ id: CN, ai: "anh", kyVong: { ten: await ten("pham-thu-trang") } },
				{ id: CN_TRUONG, ai: "chu", kyVong: { ten: await ten(NGUOI.thu) } },
			];
			const ra = [];
			for (const b of bang) ra.push((await docMt(b.id, b.ai)).nguoiDuyetDuKien);
			expect(ra).toEqual(bang.map((b) => b.kyVong));

			expect((await docMt(PB, "n")).nguoiDuyetDuKien).toBeNull();
			expect((await docMt(G, "chu")).nguoiDuyetDuKien).toBeNull();
			ok(await lam("okr.setProgram", { duyetCongBo: false }, "qt"), "tat");
			expect((await docMt(PB, "chu")).nguoiDuyetDuKien).toBeNull();
			ok(await lam("okr.setProgram", { duyetCongBo: true }, "qt"), "bat lai");

			const truoc = (await docMt(PB, "chu")).nguoiDuyetDuKien;
			tienDongHo();
			ok(await lam("okr.guiDuyet", { id: PB }, "chu"), "gui");
			const sau = await docMt(PB, "chu");
			expect(sau.status).toBe("cho-duyet");
			expect(sau.choDuyet?.nguoiDuyet).toEqual(truoc ?? "rong");
			expect(sau.nguoiDuyetDuKien).toBeNull();
		},
		CHO_DB,
	);
});

describe("tra-lai-truoc", () => {
	const MT_TL = idMau("mt", "u8d-tra-lai");

	beforeAll(async () => {
		ok(await lam("okr.setProgram", { duyetCongBo: true }, "qt"), "bat duyet");
		await taoNhap({
			id: MT_TL,
			level: "phong-ban",
			chu: NGUOI.chu,
			departmentId: PHAP_CHE,
		});
	}, CHO_DB);

	afterAll(async () => {
		await lam("okr.setProgram", { duyetCongBo: false }, "qt");
	}, CHO_DB);

	test(
		"gửi → trả L1 → gửi → trả L2 → gửi: lanTraLaiTruoc null, rồi L1, rồi L2; Vết giữ L1, L2",
		async () => {
			const L1 = "Thêm KR đo doanh thu từ khách quay lại.";
			const L2 = "Đích 40% còn thấp so với quý 3, nâng lên.";
			const buoc = async (ten: string, vao: DauVaoHopLe, ai: string) => {
				tienDongHo();
				ok(await lam(ten, vao, ai), ten);
			};
			await buoc("okr.guiDuyet", { id: MT_TL }, "chu");
			const lan1 = (await docMt(MT_TL, "thu")).choDuyet?.lanTraLaiTruoc;
			await buoc("okr.traLaiMucTieu", { objectiveId: MT_TL, lyDo: L1 }, "thu");
			await buoc("okr.guiDuyet", { id: MT_TL }, "chu");
			const lan2 = (await docMt(MT_TL, "thu")).choDuyet?.lanTraLaiTruoc;
			await buoc("okr.traLaiMucTieu", { objectiveId: MT_TL, lyDo: L2 }, "thu");
			await buoc("okr.guiDuyet", { id: MT_TL }, "chu");
			const doc3 = await docMt(MT_TL, "thu");
			expect({
				lan1: lan1 ?? null,
				lan2: lan2 ? [lan2.lyDo, lan2.nguoi?.id] : null,
				lan3: doc3.choDuyet?.lanTraLaiTruoc
					? [
							doc3.choDuyet.lanTraLaiTruoc.lyDo,
							doc3.choDuyet.lanTraLaiTruoc.nguoi?.id,
						]
					: null,
				vet: doc3.trail
					.filter((v) => v.action === "tra-lai")
					.map((v) => v.note)
					.sort(),
			}).toEqual({
				lan1: null,
				lan2: [L1, nguoi(NGUOI.thu)],
				lan3: [L2, nguoi(NGUOI.thu)],
				vet: [L1, L2].sort(),
			});
		},
		CHO_DB,
	);
});
