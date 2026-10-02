import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "../src/client";
import { CHI_SO_OKR } from "../src/okr-chi-so-danh-muc";
import { type CuocSoan, moCuoc } from "../src/okr-cuoc-soan";
import {
	DANH_SACH_DOC_GOI,
	docCapTrenVaNgangCap,
	docChamVaTran,
	docDonViCuoc,
	docHangDaBac,
	docKyTruoc,
	docSoCrmDonVi,
	docTenThanhVien,
	docTrangChienLuocDangDung,
} from "../src/okr-goi-soan";
import { WORKSPACE_ID } from "../src/workspace";

const T = `goi${(process.env.TEST_RUN_ID ?? "x").slice(0, 8)}`;
const id = (phan: string) => `${T}-${phan}`;
const DAY = (s: string) => new Date(`${s}T00:00:00Z`);
const HIEN_TAI = new Date("2031-05-15T05:00:00Z");

const TEN_TRUONG = `Lê Văn Trưởng${T}`;
const CHU_BAN_DE_XUAT = `chu-ban-de-xuat-${T}`;
const CHU_BAN_DANG_DUNG = `chu-ban-dang-dung-${T}`;
const CHUC_DANH = "Trưởng phòng Kinh doanh";

let tenBoPhan = "";
let tenPhong = "";
let cuoc: CuocSoan;
let cuocBoPhan: CuocSoan;
let cuocOnehub: CuocSoan;
const idMucTieu: Record<string, string> = {};
const idKr: Record<string, string> = {};

async function nguoi(ma: string, ten: string, role = "member") {
	await db.user.create({
		data: {
			id: id(ma),
			name: ten,
			email: `${id(ma)}@thu.test`,
			emailVerified: true,
		},
	});
	await db.member.create({
		data: {
			id: id(`m-${ma}`),
			organizationId: WORKSPACE_ID,
			userId: id(ma),
			role,
			createdAt: new Date(),
		},
	});
}

async function mucTieu(v: {
	ma: string;
	cycleId: string;
	level: string;
	divisionId?: string;
	departmentId?: string;
	status?: string;
	title?: string;
	whyNow?: string;
	position?: number;
	kr?: {
		ma: string;
		title: string;
		kind?: string;
		start: number;
		target: number;
		current: number;
		unit?: string;
	}[];
}) {
	const m = await db.okrObjective.create({
		data: {
			id: id(v.ma),
			cycleId: v.cycleId,
			level: v.level,
			divisionId: v.divisionId ?? null,
			departmentId: v.departmentId ?? null,
			ownerUserId: id("truong"),
			kind: "cam-ket",
			status: v.status ?? "cong-bo",
			title: v.title ?? `Mục tiêu ${v.ma} ${T}`,
			whyNow: v.whyNow ?? "",
			position: v.position ?? 0,
			keyResults: {
				create: (v.kr ?? []).map((k, i) => ({
					id: id(k.ma),
					title: k.title,
					kind: k.kind ?? "tang-toi",
					ownerUserId: id("truong"),
					startValue: k.start,
					targetValue: k.target,
					currentValue: k.current,
					unit: k.unit ?? "",
					position: i,
				})),
			},
		},
	});
	idMucTieu[v.ma] = m.id;
	for (const k of v.kr ?? []) idKr[k.ma] = id(k.ma);
	return m;
}

async function don() {
	await db.okrCuocSoan.deleteMany({ where: { sessionId: { startsWith: T } } });
	await db.okrDeXuat.deleteMany({ where: { taskId: { startsWith: T } } });
	await db.okrMangSang.deleteMany({
		where: { tuObjective: { id: { startsWith: T } } },
	});
	await db.okrCheckIn.deleteMany({ where: { id: { startsWith: T } } });
	await db.okrCheckInSession.deleteMany({ where: { id: { startsWith: T } } });
	await db.okrDiemKr.deleteMany({
		where: { keyResult: { id: { startsWith: T } } },
	});
	await db.okrNhinLai.deleteMany({
		where: { objective: { id: { startsWith: T } } },
	});
	await db.okrObjective.deleteMany({ where: { id: { startsWith: T } } });
	await db.okrCycle.deleteMany({
		where: { id: { startsWith: T }, parentId: { not: null } },
	});
	await db.okrCycle.deleteMany({ where: { id: { startsWith: T } } });
	await db.okrProgramConfig.deleteMany({
		where: { version: { gte: 9_000_000 } },
	});
	await db.deal.deleteMany({ where: { id: { startsWith: T } } });
	await db.dealStage.deleteMany({ where: { id: { startsWith: T } } });
	await db.company.deleteMany({ where: { id: { startsWith: T } } });
	await db.taiLieuTrang.updateMany({
		where: { id: { startsWith: T } },
		data: { banDangDungId: null },
	});
	await db.taiLieuPhienBan.deleteMany({ where: { id: { startsWith: T } } });
	await db.taiLieuDeXuat.deleteMany({ where: { id: { startsWith: T } } });
	await db.taiLieuTrang.deleteMany({ where: { id: { startsWith: T } } });
	await db.department.updateMany({
		where: { id: { startsWith: T } },
		data: { headUserId: null },
	});
	await db.orgPlacement.deleteMany({ where: { userId: { startsWith: T } } });
	await db.member.deleteMany({ where: { userId: { startsWith: T } } });
	await db.user.deleteMany({ where: { id: { startsWith: T } } });
	await db.department.deleteMany({ where: { id: { startsWith: T } } });
	await db.division.deleteMany({ where: { id: { startsWith: T } } });
}

beforeAll(async () => {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: {
			id: WORKSPACE_ID,
			name: "CRM",
			slug: "crm",
			createdAt: new Date(),
		},
		update: {},
	});
	await don();

	await nguoi("truong", TEN_TRUONG);
	await nguoi("nv", `Phạm Thị Nhân${T}`);
	await nguoi("nv2", `Đỗ Văn Khác${T}`);
	for (let i = 0; i < 40; i += 1)
		await nguoi(`tv${i}`, `Trần Thị Thành${T}${i}`);

	const bp = await db.division.create({
		data: {
			id: id("bp"),
			name: `Kinh doanh ${T}`,
			position: 1,
			moTa: "Bộ phận Kinh doanh",
		},
	});
	const bp2 = await db.division.create({
		data: {
			id: id("bp2"),
			name: `Vận hành ${T}`,
			position: 2,
			moTa: "Bộ phận Vận hành",
		},
	});
	const pb = await db.department.create({
		data: {
			id: id("pb"),
			name: `Bán hàng Bắc ${T}`,
			position: 1,
			moTa: "Phòng bán hàng miền Bắc",
			divisionId: bp.id,
			headUserId: id("truong"),
		},
	});
	await db.department.create({
		data: {
			id: id("pb2"),
			name: `Bán hàng Nam ${T}`,
			position: 2,
			moTa: "Phòng miền Nam",
			divisionId: bp.id,
		},
	});
	await db.department.create({
		data: {
			id: id("pb3"),
			name: `Kho ${T}`,
			position: 3,
			moTa: "Phòng kho",
			divisionId: bp2.id,
		},
	});
	tenBoPhan = bp.name;
	tenPhong = pb.name;
	await db.orgPlacement.create({
		data: {
			userId: id("truong"),
			primaryDepartmentId: pb.id,
			chucDanh: CHUC_DANH,
		},
	});
	await db.orgPlacement.create({
		data: {
			userId: id("nv"),
			primaryDepartmentId: pb.id,
			managerUserId: id("truong"),
		},
	});
	await db.orgPlacement.create({
		data: { userId: id("nv2"), primaryDepartmentId: id("pb2") },
	});

	const nam = await db.okrCycle.create({
		data: {
			id: id("nam"),
			kind: "nam",
			name: `Năm 2031 ${T}`,
			startsOn: DAY("2031-01-01"),
			endsOn: DAY("2031-12-31"),
			phase: "dang-chay",
		},
	});
	const q1 = await db.okrCycle.create({
		data: {
			id: id("q1"),
			kind: "quy",
			name: `Quý 1 2031 ${T}`,
			parentId: nam.id,
			startsOn: DAY("2031-01-01"),
			endsOn: DAY("2031-03-31"),
			phase: "da-dong",
		},
	});
	const q1sau = await db.okrCycle.create({
		data: {
			id: id("q1sau"),
			kind: "quy",
			name: `Quý 1b ${T}`,
			parentId: nam.id,
			startsOn: DAY("2031-02-01"),
			endsOn: DAY("2031-03-31"),
			phase: "da-dong",
		},
	});
	const q2 = await db.okrCycle.create({
		data: {
			id: id("q2"),
			kind: "quy",
			name: `Quý 2 2031 ${T}`,
			parentId: nam.id,
			startsOn: DAY("2031-04-01"),
			endsOn: DAY("2031-06-30"),
			phase: "lap-ke-hoach",
		},
	});

	await mucTieu({
		ma: "onehubNam",
		cycleId: nam.id,
		level: "onehub",
		whyNow: "Vì sao OneHub năm nay",
		kr: [
			{
				ma: "krOnehub1",
				title: `KR onehub một ${T}`,
				start: 0,
				target: 100,
				current: 25,
				unit: "%",
			},
			{
				ma: "krOnehub2",
				title: `KR onehub hai ${T}`,
				kind: "moc",
				start: 5,
				target: 5,
				current: 5,
			},
		],
	});
	await mucTieu({
		ma: "onehubNhap",
		cycleId: nam.id,
		level: "onehub",
		status: "nhap",
	});
	await mucTieu({
		ma: "bpQ2",
		cycleId: q2.id,
		level: "bo-phan",
		divisionId: bp.id,
		whyNow: "Vì sao bộ phận quý này",
		kr: [
			{
				ma: "krBp1",
				title: `KR bộ phận ${T}`,
				start: 10,
				target: 30,
				current: 20,
			},
		],
	});
	await mucTieu({
		ma: "bp2Q2",
		cycleId: q2.id,
		level: "bo-phan",
		divisionId: bp2.id,
	});
	await mucTieu({
		ma: "ngangQ2",
		cycleId: q2.id,
		level: "phong-ban",
		divisionId: bp.id,
		departmentId: id("pb2"),
	});
	await mucTieu({
		ma: "ngangNhap",
		cycleId: q2.id,
		level: "phong-ban",
		divisionId: bp.id,
		departmentId: id("pb2"),
		status: "nhap",
	});
	await mucTieu({
		ma: "khacBpQ2",
		cycleId: q2.id,
		level: "phong-ban",
		divisionId: bp2.id,
		departmentId: id("pb3"),
	});
	await mucTieu({
		ma: "chinhQ2",
		cycleId: q2.id,
		level: "phong-ban",
		divisionId: bp.id,
		departmentId: pb.id,
	});
	await mucTieu({
		ma: "curPhong",
		cycleId: q2.id,
		level: "phong-ban",
		divisionId: bp.id,
		departmentId: pb.id,
		status: "nhap",
	});

	await mucTieu({
		ma: "kyTruoc1",
		cycleId: q1.id,
		level: "phong-ban",
		divisionId: bp.id,
		departmentId: pb.id,
		position: 0,
		kr: [
			{
				ma: "krA",
				title: `KR A ${T}`,
				start: 10,
				target: 50,
				current: 42,
				unit: "%",
			},
			{
				ma: "krB",
				title: `KR B ${T}`,
				kind: "moc",
				start: 0,
				target: 1,
				current: 1,
			},
		],
	});
	await mucTieu({
		ma: "kyTruoc2",
		cycleId: q1.id,
		level: "phong-ban",
		divisionId: bp.id,
		departmentId: pb.id,
		position: 1,
		kr: [{ ma: "krC", title: `KR C ${T}`, start: 0, target: 10, current: 3 }],
	});
	await mucTieu({
		ma: "kyTruocKhac",
		cycleId: q1.id,
		level: "phong-ban",
		divisionId: bp.id,
		departmentId: id("pb2"),
	});
	await mucTieu({
		ma: "kyMoiKhac",
		cycleId: q1sau.id,
		level: "phong-ban",
		divisionId: bp.id,
		departmentId: id("pb2"),
	});

	await db.okrNhinLai.create({
		data: {
			objectiveId: id("kyTruoc1"),
			dieuHocDuoc: "Học được: gọi sớm trong tuần",
			suaBoiUserId: id("truong"),
		},
	});
	await db.okrDiemKr.create({
		data: {
			keyResultId: id("krA"),
			cycleId: q1.id,
			soChot: 42,
			diemGoiY: 0.7,
			diem: 0.7,
			lyDo: "Đạt nhờ đội gọi sớm",
			thang: "0-1",
			trongSoBat: false,
			phienBanChuongTrinh: 1,
		},
	});
	await db.okrDiemKr.create({
		data: {
			keyResultId: id("krB"),
			cycleId: q1.id,
			soChot: 1,
			diemGoiY: 0.9,
			diem: 0.9,
			lyDo: "",
			thang: "0-1",
			trongSoBat: false,
			phienBanChuongTrinh: 1,
		},
	});
	await db.okrCheckInSession.create({
		data: {
			id: id("cis"),
			userId: id("truong"),
			entry: "web",
			submittedAt: new Date(),
		},
	});
	const checkIn = (
		ma: string,
		kr: string,
		tuan: string,
		value: number,
		confidence: string,
		note: string,
	) =>
		db.okrCheckIn.create({
			data: {
				id: id(ma),
				keyResultId: id(kr),
				sessionId: id("cis"),
				weekStart: DAY(tuan),
				value,
				confidence,
				note,
				authorUserId: id("truong"),
				ownerUserId: id("truong"),
			},
		});
	await checkIn("ci2", "krA", "2031-01-13", 30, "vua", "Chậm tuần này");
	await checkIn("ci1", "krA", "2031-01-06", 20, "cao", "Khởi động");
	await checkIn("ci3", "krB", "2031-02-03", 1, "thap", "");
	await db.okrMangSang.create({
		data: {
			tuObjectiveId: id("kyTruoc1"),
			sangObjectiveId: id("curPhong"),
			sangCycleId: q2.id,
			boiUserId: id("truong"),
		},
	});

	const stage = await db.dealStage.create({
		data: { id: id("stage"), label: `Mở ${T}`, kind: "OPEN", position: 70 },
	});
	const cty = await db.company.create({
		data: { id: id("cty"), name: `Công ty ${T}`, domain: `${T}.thu.test` },
	});
	const thoaThuan = (ma: string, chu: string, tao: string) =>
		db.deal.create({
			data: {
				id: id(ma),
				name: `Thoả thuận ${ma} ${T}`,
				companyId: cty.id,
				ownerId: id(chu),
				stage: stage.id,
				createdAt: new Date(`${tao}T03:00:00Z`),
			},
		});
	await thoaThuan("d1", "nv", "2031-02-10");
	await thoaThuan("d2", "truong", "2031-03-01");
	await thoaThuan("d3", "nv", "2031-05-01");
	await thoaThuan("d4", "nv2", "2031-02-11");

	cuoc = await moCuoc(db, {
		cycleId: q2.id,
		level: "phong-ban",
		divisionId: bp.id,
		departmentId: pb.id,
		nguoiMoUserId: id("truong"),
		sessionId: id("phien1"),
		nac: "bat",
	});
	cuocBoPhan = await moCuoc(db, {
		cycleId: q2.id,
		level: "bo-phan",
		divisionId: bp.id,
		departmentId: null,
		nguoiMoUserId: id("truong"),
		sessionId: id("phien2"),
		nac: "bat",
	});
	cuocOnehub = await moCuoc(db, {
		cycleId: nam.id,
		level: "onehub",
		divisionId: null,
		departmentId: null,
		nguoiMoUserId: id("truong"),
		sessionId: id("phien3"),
		nac: "an",
	});
});

afterAll(don);

describe("okr-goi-soan", () => {
	test("docDonViCuoc: tên, cấp, mô tả phòng và bộ phận; chức danh trưởng; không tên người", async () => {
		const dv = await docDonViCuoc(db, cuoc);
		expect(dv).toEqual({
			donVi: {
				ten: tenPhong,
				cap: "phong-ban",
				moTa: "Phòng bán hàng miền Bắc",
			},
			cha: { ten: tenBoPhan, moTa: "Bộ phận Kinh doanh" },
			truong: { chucDanh: CHUC_DANH },
			nguoiHoi: { vai: "member", chucDanh: CHUC_DANH },
		});
		expect(JSON.stringify(dv), "goi chua ten nguoi").not.toContain(TEN_TRUONG);
	});

	test("docDonViCuoc: cấp bộ phận không có cha; cấp OneHub lấy tên công ty, không trưởng", async () => {
		const bp = await docDonViCuoc(db, cuocBoPhan);
		expect(bp.donVi).toEqual({
			ten: tenBoPhan,
			cap: "bo-phan",
			moTa: "Bộ phận Kinh doanh",
		});
		expect(bp.cha).toBeNull();
		expect(bp.truong).toBeNull();
		const oh = await docDonViCuoc(db, cuocOnehub);
		expect(oh.donVi.cap).toBe("onehub");
		expect(oh.cha).toBeNull();
		expect(oh.truong).toBeNull();
	});

	test("docCapTrenVaNgangCap: cấp trên đủ KR + tiến độ + id; ngang cấp chỉ tên; ứng viên Căn chỉnh = Mục tiêu và KR cấp trên", async () => {
		const r = await docCapTrenVaNgangCap(db, cuoc);
		expect(r.capTren.map((m) => m.id)).toEqual([
			idMucTieu.onehubNam,
			idMucTieu.bpQ2,
		]);
		expect(r.capTren[0]).toEqual({
			id: idMucTieu.onehubNam,
			cap: "onehub",
			ten: `Mục tiêu onehubNam ${T}`,
			viSaoLucNay: "Vì sao OneHub năm nay",
			kr: [
				{
					id: idKr.krOnehub1,
					ten: `KR onehub một ${T}`,
					kieu: "tang-toi",
					khoiDiem: 0,
					dich: 100,
					hienTai: 25,
					donVi: "%",
					tienDo: 25,
				},
				{
					id: idKr.krOnehub2,
					ten: `KR onehub hai ${T}`,
					kieu: "moc",
					khoiDiem: 5,
					dich: 5,
					hienTai: 5,
					donVi: "",
					tienDo: null,
				},
			],
		});
		expect(r.capTren[1]?.kr).toEqual([
			{
				id: idKr.krBp1,
				ten: `KR bộ phận ${T}`,
				kieu: "tang-toi",
				khoiDiem: 10,
				dich: 30,
				hienTai: 20,
				donVi: "",
				tienDo: 50,
			},
		]);
		expect(r.ngangCap, "ngang cap sai").toEqual([`Mục tiêu ngangQ2 ${T}`]);
		expect(JSON.stringify(r), "ngang cap lan phong minh").not.toContain(
			"chinhQ2",
		);
		expect(r.ungVienCanChinh.map((u) => `${u.loai}:${u.id}`)).toEqual([
			`muc-tieu:${idMucTieu.onehubNam}`,
			`kr:${idKr.krOnehub1}`,
			`kr:${idKr.krOnehub2}`,
			`muc-tieu:${idMucTieu.bpQ2}`,
			`kr:${idKr.krBp1}`,
		]);
		expect(JSON.stringify(r), "cap tren lan ban nhap").not.toContain(
			"onehubNhap",
		);
		expect(JSON.stringify(r), "cap tren lan bo phan khac").not.toContain(
			"bp2Q2",
		);
	});

	test("docCapTrenVaNgangCap: cấp OneHub không có cấp trên và không có ngang cấp", async () => {
		const r = await docCapTrenVaNgangCap(db, cuocOnehub);
		expect(r).toEqual({ capTren: [], ngangCap: [], ungVienCanChinh: [] });
	});

	test("docCapTrenVaNgangCap: cấp bộ phận chỉ thấy OneHub; ngang cấp là bộ phận khác", async () => {
		const r = await docCapTrenVaNgangCap(db, cuocBoPhan);
		expect(r.capTren.map((m) => m.cap)).toEqual(["onehub"]);
		expect(r.ngangCap).toEqual([`Mục tiêu bp2Q2 ${T}`]);
	});

	test("docKyTruoc: chu kỳ đã đóng gần nhất của phòng, mỗi Mục tiêu có điểm/điều học được, mỗi KR có soChot/dich/diem/lyDo và capNhat[] theo tuần", async () => {
		const ky = await docKyTruoc(db, cuoc);
		expect(ky.chuKy, "ky truoc lay ky cua don vi khac").toEqual({
			ten: `Quý 1 2031 ${T}`,
		});
		expect(ky.mucTieu).toEqual([
			{
				ten: `Mục tiêu kyTruoc1 ${T}`,
				diem: 0.8,
				dieuHocDuoc: "Học được: gọi sớm trong tuần",
				kr: [
					{
						ten: `KR A ${T}`,
						kieu: "tang-toi",
						donVi: "%",
						khoiDiem: 10,
						dich: 50,
						soChot: 42,
						diem: 0.7,
						lyDo: "Đạt nhờ đội gọi sớm",
						capNhat: [
							{
								tuan: "2031-01-06",
								giaTri: 20,
								tuTin: "cao",
								ghiChu: "Khởi động",
							},
							{
								tuan: "2031-01-13",
								giaTri: 30,
								tuTin: "vua",
								ghiChu: "Chậm tuần này",
							},
						],
					},
					{
						ten: `KR B ${T}`,
						kieu: "moc",
						donVi: "",
						khoiDiem: 0,
						dich: 1,
						soChot: 1,
						diem: 0.9,
						lyDo: "",
						capNhat: [
							{ tuan: "2031-02-03", giaTri: 1, tuTin: "thap", ghiChu: "" },
						],
					},
				],
			},
			{
				ten: `Mục tiêu kyTruoc2 ${T}`,
				diem: null,
				dieuHocDuoc: "",
				kr: [
					{
						ten: `KR C ${T}`,
						kieu: "tang-toi",
						donVi: "",
						khoiDiem: 0,
						dich: 10,
						soChot: 3,
						diem: null,
						lyDo: "",
						capNhat: [],
					},
				],
			},
		]);
		expect(ky.mangSang).toEqual([`Mục tiêu kyTruoc1 ${T}`]);
		const json = JSON.stringify(ky);
		expect(json, "ky truoc lan don vi khac").not.toContain("kyTruocKhac");
		expect(json, "ky truoc lan don vi khac").not.toContain("kyMoiKhac");
	});

	test("docKyTruoc: bỏ chu kỳ đã đóng kết thúc sau khi kỳ đang soạn bắt đầu", async () => {
		const cheo = await db.okrCycle.create({
			data: {
				id: id("qcheo"),
				kind: "quy",
				name: `Quý chéo ${T}`,
				parentId: id("nam"),
				startsOn: DAY("2031-03-01"),
				endsOn: DAY("2031-05-31"),
				phase: "da-dong",
			},
		});
		try {
			await mucTieu({
				ma: "kyCheo",
				cycleId: cheo.id,
				level: "phong-ban",
				divisionId: cuoc.divisionId ?? undefined,
				departmentId: cuoc.departmentId ?? undefined,
			});
			const ky = await docKyTruoc(db, cuoc);
			expect(
				ky.chuKy,
				"ky truoc ket thuc sau khi ky dang soan bat dau",
			).toEqual({ ten: `Quý 1 2031 ${T}` });
		} finally {
			await db.okrObjective.deleteMany({ where: { id: id("kyCheo") } });
			await db.okrCycle.deleteMany({ where: { id: cheo.id } });
		}
	});

	test("docKyTruoc: chu kỳ đã đóng bị ẩn không phải kỳ trước; hiện lại thì là kỳ trước", async () => {
		const hien = await docKyTruoc(db, cuoc);
		await db.okrCycle.update({
			where: { id: id("q1") },
			data: { anLuc: new Date("2031-04-02T03:00:00.000Z") },
		});
		try {
			const an = await docKyTruoc(db, cuoc);
			expect({
				hien: hien.chuKy,
				an: an.chuKy,
				anMucTieu: an.mucTieu.map((m) => m.ten),
			}).toEqual({
				hien: { ten: `Quý 1 2031 ${T}` },
				an: null,
				anMucTieu: [],
			});
		} finally {
			await db.okrCycle.update({
				where: { id: id("q1") },
				data: { anLuc: null },
			});
		}
		expect((await docKyTruoc(db, cuoc)).chuKy).toEqual({
			ten: `Quý 1 2031 ${T}`,
		});
	});

	test("docKyTruoc: đơn vị chưa có chu kỳ đóng → không có kỳ, không Mục tiêu", async () => {
		const ky = await docKyTruoc(db, cuocBoPhan);
		expect(ky).toEqual({ chuKy: null, mucTieu: [], mangSang: [] });
	});

	test("dieu-kien-xem: gói chỉ mang Mục tiêu công khai — Mục tiêu giới hạn ở cấp trên, ngang cấp, kỳ trước và mang sang vắng cả khi người mở cuộc là trưởng phòng, là quản trị, hay có hàng người xem đích danh", async () => {
		await nguoi("qt", `Quản Trị Viên${T}`, "admin");
		const han = (v: {
			ma: string;
			cycleId: string;
			level: string;
			divisionId?: string;
			departmentId?: string;
		}) =>
			db.okrObjective.create({
				data: {
					id: id(v.ma),
					cycleId: v.cycleId,
					level: v.level,
					divisionId: v.divisionId ?? null,
					departmentId: v.departmentId ?? null,
					ownerUserId: id("nv2"),
					kind: "cam-ket",
					status: "cong-bo",
					hienThi: "gioi-han",
					title: `Mục tiêu kín ${v.ma} ${T}`,
					keyResults: {
						create: [
							{
								id: id(`${v.ma}-kr`),
								title: `KR kín ${v.ma} ${T}`,
								kind: "tang-toi",
								ownerUserId: id("nv2"),
								startValue: 0,
								targetValue: 10,
								currentValue: 4,
								unit: "",
								position: 0,
							},
						],
					},
				},
			});
		const kin = ["hcTren", "hcNgang", "hcKy"];
		const cuocQuanTri = await moCuoc(db, {
			cycleId: id("q2"),
			level: "phong-ban",
			divisionId: id("bp"),
			departmentId: id("pb"),
			nguoiMoUserId: id("qt"),
			sessionId: id("phien-qt"),
			nac: "bat",
		});
		try {
			await han({ ma: "hcTren", cycleId: id("nam"), level: "onehub" });
			await han({
				ma: "hcNgang",
				cycleId: id("q2"),
				level: "phong-ban",
				divisionId: id("bp"),
				departmentId: id("pb2"),
			});
			await han({
				ma: "hcKy",
				cycleId: id("q1"),
				level: "phong-ban",
				divisionId: id("bp"),
				departmentId: id("pb"),
			});
			await mucTieu({
				ma: "hcSang",
				cycleId: id("q2"),
				level: "phong-ban",
				divisionId: id("bp"),
				departmentId: id("pb"),
				status: "nhap",
			});
			await db.okrMangSang.create({
				data: {
					tuObjectiveId: id("hcKy"),
					sangObjectiveId: id("hcSang"),
					sangCycleId: id("q2"),
					boiUserId: id("truong"),
				},
			});
			await db.okrNguoiXem.createMany({
				data: kin.flatMap((m) =>
					["qt", "truong"].map((u) => ({
						objectiveId: id(m),
						userId: id(u),
						createdById: id("qt"),
					})),
				),
			});
			const ten = kin.flatMap((m) => [
				`Mục tiêu kín ${m} ${T}`,
				`KR kín ${m} ${T}`,
			]);
			for (const c of [cuoc, cuocQuanTri]) {
				const [tren, ky] = await Promise.all([
					docCapTrenVaNgangCap(db, c),
					docKyTruoc(db, c),
				]);
				const chu = JSON.stringify({ tren, ky });
				expect(
					ten.filter((t) => chu.includes(t)),
					`ten muc tieu kin lot vao goi cuoc ${c.nguoiMoUserId}`,
				).toEqual([]);
				expect(
					kin.filter((m) => chu.includes(id(m))),
					"id muc tieu kin lot vao goi",
				).toEqual([]);
				expect(tren.capTren.map((m) => m.id)).toContain(idMucTieu.onehubNam);
				expect(tren.ungVienCanChinh.map((u) => u.id)).toContain(
					idMucTieu.onehubNam,
				);
				expect(ky.mucTieu.map((m) => m.ten)).toContain(
					`Mục tiêu kyTruoc1 ${T}`,
				);
			}
		} finally {
			await db.okrCuocSoan.deleteMany({ where: { id: cuocQuanTri.id } });
			await db.okrMangSang.deleteMany({ where: { tuObjectiveId: id("hcKy") } });
			await db.okrObjective.deleteMany({
				where: { id: { in: [...kin, "hcSang"].map(id) } },
			});
			await db.member.deleteMany({ where: { userId: id("qt") } });
			await db.user.deleteMany({ where: { id: id("qt") } });
		}
	});

	test("docSoCrmDonVi: bảy chỉ số quý trước và quý này cho vai member; rỗng cho vai okr", async () => {
		const bang = await docSoCrmDonVi(db, cuoc, "member", HIEN_TAI);
		expect(bang.map((d) => d.ma)).toEqual(Object.keys(CHI_SO_OKR) as never);
		expect(bang).toHaveLength(7);
		const dem = Object.fromEntries(
			bang.map((d) => [d.ma, [d.quyTruoc, d.quyNay]]),
		);
		expect(dem["thoa-thuan-moi"], "dem thoa thuan sai pham vi hoac ky").toEqual(
			[2, 1],
		);
		expect(dem["thoa-thuan-chot-duoc"]).toEqual([0, 0]);
		expect((await docSoCrmDonVi(db, cuoc, "admin", HIEN_TAI)).length).toBe(7);
		expect(
			await docSoCrmDonVi(db, cuoc, "okr", HIEN_TAI),
			"vai okr doc duoc so doi tac",
		).toEqual([]);
	});

	test("docSoCrmDonVi: quý này chưa bắt đầu thì quý này là null, quý trước vẫn đếm", async () => {
		const bang = await docSoCrmDonVi(
			db,
			cuoc,
			"member",
			new Date("2031-03-01T05:00:00Z"),
		);
		const moi = bang.find((d) => d.ma === "thoa-thuan-moi");
		expect(moi).toMatchObject({ quyTruoc: 2, quyNay: null });
		expect(bang.every((d) => d.quyNay === null)).toBe(true);
	});

	test("docSoCrmDonVi: đơn vị chưa có kỳ trước thì quý trước là null", async () => {
		const bang = await docSoCrmDonVi(db, cuocBoPhan, "member", HIEN_TAI);
		expect(bang.every((d) => d.quyTruoc === null)).toBe(true);
	});

	test("docTrangChienLuocDangDung: chỉ trang chien-luoc có bản đang dùng; không bản đề xuất; không quy-dinh", async () => {
		const chuTrang = id("truong");
		const trang = async (ma: string, loai: string) =>
			db.taiLieuTrang.create({
				data: {
					id: id(ma),
					slug: id(ma),
					ten: `Trang ${ma} ${T}`,
					loai,
					chuTrangId: chuTrang,
					taoBoiId: chuTrang,
				},
			});
		const banDangDung = async (ma: string, noiDung: string) => {
			const dx = await db.taiLieuDeXuat.create({
				data: {
					id: id(`dx-${ma}`),
					trangId: id(ma),
					ten: `Trang ${ma}`,
					noiDung,
					taoBoiId: chuTrang,
					trangThai: "DA_DUYET",
				},
			});
			const pb = await db.taiLieuPhienBan.create({
				data: {
					id: id(`pb-${ma}`),
					trangId: id(ma),
					so: 1,
					ten: `Trang ${ma}`,
					noiDung,
					noiDungHash: id(`h-${ma}`),
					deXuatId: dx.id,
					duyetBoiId: chuTrang,
					duyetLuc: new Date(),
				},
			});
			await db.taiLieuTrang.update({
				where: { id: id(ma) },
				data: { banDangDungId: pb.id },
			});
		};
		await trang("clA", "chien-luoc");
		await banDangDung("clA", CHU_BAN_DANG_DUNG);
		await trang("clB", "chien-luoc");
		await db.taiLieuDeXuat.create({
			data: {
				id: id("dx-clB"),
				trangId: id("clB"),
				ten: "Trang clB",
				noiDung: CHU_BAN_DE_XUAT,
				taoBoiId: chuTrang,
				trangThai: "CHO_DUYET",
			},
		});
		await trang("qd", "quy-dinh");
		await banDangDung("qd", `quy dinh ${T}`);

		const ds = (await docTrangChienLuocDangDung(db)).filter((t) =>
			t.ten.endsWith(T),
		);
		expect(ds.map((t) => t.ten)).toEqual([`Trang clA ${T}`]);
		expect(
			ds.map((t) => t.noiDung).join(),
			"goi chua ban de xuat",
		).not.toContain(CHU_BAN_DE_XUAT);
		expect(ds[0]?.noiDung).toBe(CHU_BAN_DANG_DUNG);
	});

	test("docTenThanhVien ≥ 40 tên", async () => {
		const ten = await docTenThanhVien(db);
		expect(ten.filter((t) => t.includes(T)).length).toBeGreaterThanOrEqual(40);
		expect(ten.every((t) => t.trim() !== "")).toBe(true);
	});

	test("docChamVaTran: bản Chương trình mới nhất; không có bản thì null", async () => {
		const ban = (version: number, cap: number) =>
			db.okrProgramConfig.create({
				data: {
					version,
					objectiveCap: cap,
					krCap: cap + 1,
					capMode: "chan",
					scoreScale: "0-10",
					weightsOn: false,
					personalOn: false,
					createdById: id("truong"),
				},
			});
		await ban(9_000_001, 4);
		await ban(9_000_002, 6);
		expect(await docChamVaTran(db)).toEqual({
			thangCham: "0-10",
			objectiveCap: 6,
			krCap: 7,
		});
	});

	test("docHangDaBac: chỉ hàng bác hoặc bỏ qua của đúng cuộc", async () => {
		const hang = (ma: string, cuocSoanId: string, trangThai: string) =>
			db.okrDeXuat.create({
				data: {
					id: id(ma),
					taskId: id("phien1"),
					objectiveId: "",
					loai: "muc-tieu-moi",
					sau: ma,
					lyDo: "x",
					trangThai,
					inputHash: ma,
					nguoiYeuCau: id("truong"),
					cuocSoanId,
					noiDung: { loai: "muc-tieu-moi", khoa: ma },
				},
			});
		await hang("hb", cuoc.id, "bac");
		await hang("hq", cuoc.id, "bo-qua");
		await hang("hc", cuoc.id, "cho");
		await hang("hk", cuocBoPhan.id, "bac");
		const ds = await docHangDaBac(db, cuoc.id);
		expect(ds.map((h) => h.sau).sort()).toEqual(["hb", "hq"]);
	});

	test("mã đọc gói chỉ chạm bảng trong DANH_SACH_DOC_GOI và chỉ find/count", () => {
		const ma = readFileSync(
			join(import.meta.dir, "..", "src", "okr-goi-soan.ts"),
			"utf8",
		);
		const cham = [...ma.matchAll(/\bdb\.(\w+)\.(\w+)\(/g)].map(
			(m) => `${m[1]}.${m[2]}`,
		);
		expect(cham.length).toBeGreaterThan(0);
		expect(
			cham.filter(
				(c) =>
					!(DANH_SACH_DOC_GOI as readonly string[]).includes(
						c.split(".")[0] ?? "",
					) || !/^find|^count/.test(c.split(".")[1] ?? ""),
			),
			"goi doc ngoai bang cho phep hoac ghi",
		).toEqual([]);
	});
});
